/* Banco de Apuntes - capa de datos y seguridad (front-end, localStorage).
   Toda la lógica de usuarios, sesión y materiales vive aquí; si luego se
   conecta un backend, solo hay que reemplazar estas funciones. */
(() => {
  const K = { users: 'ba_users', mats: 'ba_materials', lock: 'ba_lock', sess: 'ba_session' };
  const IDLE = 30 * 60 * 1000;           // sesión expira tras 30 min sin actividad
  const MAX_TRIES = 5, LOCK_MS = 60 * 1000;

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = (s, max = 500) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

  // SHA-256 de respaldo (si el navegador no ofrece crypto.subtle)
  function sha256(str) {
    const rot = (n, x) => (x >>> n) | (x << (32 - n));
    const K2 = [], H = []; let p = 0;
    for (let c = 2; p < 64; c++) {
      let prime = true; for (let i = 2; i * i <= c; i++) if (c % i === 0) { prime = false; break; }
      if (!prime) continue;
      K2[p] = (Math.cbrt(c) % 1 * 4294967296) | 0; if (p < 8) H[p] = (Math.sqrt(c) % 1 * 4294967296) | 0; p++;
    }
    const bytes = unescape(encodeURIComponent(str)), n = bytes.length, words = [];
    for (let i = 0; i < n; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    words[n >> 2] |= 0x80 << (24 - (n % 4) * 8);
    const L = (((n + 8) >> 6) + 1) << 4; for (let i = 0; i < L; i++) words[i] = words[i] | 0;
    words[L - 1] = n * 8;
    for (let j = 0; j < L; j += 16) {
      const w = words.slice(j, j + 16); let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        if (i >= 16) { const s0 = rot(7, w[i - 15]) ^ rot(18, w[i - 15]) ^ (w[i - 15] >>> 3), s1 = rot(17, w[i - 2]) ^ rot(19, w[i - 2]) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
        const t1 = (h + (rot(6, e) ^ rot(11, e) ^ rot(25, e)) + ((e & f) ^ (~e & g)) + K2[i] + w[i]) | 0;
        const t2 = ((rot(2, a) ^ rot(13, a) ^ rot(22, a)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  async function hashPassword(pass, salt) {
    if (window.crypto?.subtle) {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
      return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let v = pass + salt; for (let i = 0; i < 2000; i++) v = sha256(v + salt); return v;
  }

  const validEmail = e => /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(e);
  const passIssues = p => {
    const m = [];
    if (p.length < 8) m.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(p)) m.push('una mayúscula');
    if (!/[a-z]/.test(p)) m.push('una minúscula');
    if (!/\d/.test(p)) m.push('un número');
    return m;
  };

  async function ensureSeed() {
    const users = read(K.users, []);
    if (!users.some(u => u.role === 'admin')) {
      const salt = uid();
      users.push({ id: 'admin', name: 'Administrador', email: 'admin@bancodeapuntes.edu', salt, hash: await hashPassword('Admin2026!', salt), role: 'admin', created: new Date().toISOString() });
      write(K.users, users);
    }
  }

  async function register({ name, email, password, confirm }) {
    name = clean(name, 60); email = clean(email, 100).toLowerCase();
    const errors = {};
    if (name.length < 3) errors.name = 'Escribe tu nombre completo (mínimo 3 letras).';
    if (!validEmail(email)) errors.email = 'Ingresa un correo válido.';
    const issues = passIssues(password || '');
    if (issues.length) errors.password = 'La contraseña necesita: ' + issues.join(', ') + '.';
    if (password !== confirm) errors.confirm = 'Las contraseñas no coinciden.';
    if (Object.keys(errors).length) return { ok: false, errors };
    await ensureSeed();
    const users = read(K.users, []);
    if (users.some(u => u.email === email)) return { ok: false, errors: { email: 'Este correo ya está registrado.' } };
    const salt = uid();
    users.push({ id: uid(), name, email, salt, hash: await hashPassword(password, salt), role: 'estudiante', created: new Date().toISOString() });
    write(K.users, users);
    return { ok: true };
  }

  async function login(email, password) {
    email = clean(email, 100).toLowerCase();
    await ensureSeed();
    const lock = read(K.lock, {}), now = Date.now();
    if (lock[email]?.until > now) return { ok: false, error: `Demasiados intentos. Espera ${Math.ceil((lock[email].until - now) / 1000)} s.` };
    const u = read(K.users, []).find(x => x.email === email);
    const good = u && (await hashPassword(password || '', u.salt)) === u.hash;
    if (!good) {
      const e = lock[email] || { n: 0 }; e.n++;
      if (e.n >= MAX_TRIES) { e.until = now + LOCK_MS; e.n = 0; }
      lock[email] = e; write(K.lock, lock);
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    delete lock[email]; write(K.lock, lock);
    sessionStorage.setItem(K.sess, JSON.stringify({ id: u.id, exp: now + IDLE }));
    return { ok: true, user: u };
  }

  function currentUser() {
    try {
      const s = JSON.parse(sessionStorage.getItem(K.sess));
      if (!s || s.exp < Date.now()) { sessionStorage.removeItem(K.sess); return null; }
      const u = read(K.users, []).find(x => x.id === s.id);
      if (!u) return null;
      s.exp = Date.now() + IDLE; sessionStorage.setItem(K.sess, JSON.stringify(s));
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    } catch (e) { return null; }
  }
  const logout = () => sessionStorage.removeItem(K.sess);

  // ---- CRUD de materiales ----
  const all = () => read(K.mats, []);
  const get = id => all().find(m => m.id === id);
  function validate(d) {
    const e = {};
    if (clean(d.title, 80).length < 4) e.title = 'El título debe tener al menos 4 caracteres.';
    if (!d.subject) e.subject = 'Selecciona una materia.';
    if (!d.type) e.type = 'Selecciona el tipo de recurso.';
    if (clean(d.description, 500).length < 15) e.description = 'Escribe al menos 15 caracteres.';
    return e;
  }
  function pick(d) {
    return { title: clean(d.title, 80), subject: d.subject, type: d.type, description: clean(d.description, 500),
      content: String(d.content ?? '').slice(0, 5000), tags: clean(d.tags, 100) };
  }
  function create(d) {
    const u = currentUser(); if (!u) return { ok: false, error: 'Debes iniciar sesión.' };
    const errors = validate(d); if (Object.keys(errors).length) return { ok: false, errors };
    const m = { id: 'u-' + uid(), ...pick(d), ownerId: u.id, author: u.name, created: new Date().toISOString(), updated: null, views: 0 };
    const list = all(); list.push(m); write(K.mats, list); return { ok: true, material: m };
  }
  function update(id, d) {
    const u = currentUser(); const list = all(); const i = list.findIndex(m => m.id === id);
    if (!u || i < 0) return { ok: false, error: 'Material no encontrado.' };
    if (list[i].ownerId !== u.id && u.role !== 'admin') return { ok: false, error: 'No tienes permiso para editar este material.' };
    const errors = validate(d); if (Object.keys(errors).length) return { ok: false, errors };
    list[i] = { ...list[i], ...pick(d), updated: new Date().toISOString() }; write(K.mats, list); return { ok: true };
  }
  function remove(id) {
    const u = currentUser(); const list = all(); const m = list.find(x => x.id === id);
    if (!u || !m) return { ok: false, error: 'Material no encontrado.' };
    if (m.ownerId !== u.id && u.role !== 'admin') return { ok: false, error: 'No tienes permiso para eliminar este material.' };
    write(K.mats, list.filter(x => x.id !== id)); return { ok: true };
  }
  function addView(id) { const list = all(); const m = list.find(x => x.id === id); if (m) { m.views = (m.views || 0) + 1; write(K.mats, list); } }
  const users = () => read(K.users, []).map(({ id, name, email, role, created }) => ({ id, name, email, role, created }));

  window.BA = { esc, clean, register, login, logout, currentUser, ensureSeed, passIssues, all, get, create, update, remove, addView, users,
    guard(role) { const u = currentUser(); if (!u || (role && u.role !== role)) { location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return null; } return u; } };
})();
