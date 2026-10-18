/* Banco de Apuntes - lógica de páginas: login, registro, panel (CRUD), subir y reportes */
(() => {
  if (!window.BA) return;
  const page = document.body.dataset.page;
  const $ = id => document.getElementById(id);
  const SUBJECTS = { prog: 'Programación', mate: 'Matemáticas', bd: 'Bases de datos', lengua: 'Lenguaje' };
  const TYPES = { apuntes: 'Apuntes', guia: 'Guía', ejercicio: 'Ejercicios', resumen: 'Resumen', examen: 'Examen pasado' };
  const fmt = iso => new Date(iso).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
  const showErrors = (errors = {}, prefix = '') => {
    document.querySelectorAll('[data-error-for]').forEach(el => { el.textContent = ''; });
    Object.entries(errors).forEach(([k, msg]) => {
      const el = document.querySelector(`[data-error-for="${prefix}${k}"]`); if (el) el.textContent = msg;
    });
    const first = Object.keys(errors)[0];
    if (first) $(prefix + first)?.focus();
  };
  const nextUrl = () => {
    const n = new URLSearchParams(location.search).get('next');
    return n && /^[a-z0-9\-]+\.html(\?[\w=&\-]*)?$/i.test(n) ? n : 'panel.html';   // evita redirecciones abiertas
  };

  // ---------- Registro ----------
  if (page === 'registro') {
    const pass = $('password'), bar = $('strength-bar'), txt = $('strength-text');
    pass.addEventListener('input', () => {
      const miss = BA.passIssues(pass.value).length;
      bar.style.width = (100 - miss * 25) + '%';
      bar.dataset.level = miss === 0 ? 'ok' : miss <= 1 ? 'mid' : 'low';
      txt.textContent = miss ? 'Falta: ' + BA.passIssues(pass.value).join(', ') + '.' : 'Contraseña segura ✓';
    });
    $('register-form').addEventListener('submit', async e => {
      e.preventDefault();
      const r = await BA.register({ name: $('name').value, email: $('email').value, password: pass.value, confirm: $('confirm').value });
      if (!r.ok) return showErrors(r.errors);
      const l = await BA.login($('email').value, pass.value);
      location.href = l.ok ? 'panel.html' : 'login.html';
    });
  }

  // ---------- Login ----------
  if (page === 'login') {
    BA.ensureSeed();
    if (BA.currentUser()) location.replace('panel.html');
    $('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      $('login-error').textContent = '';
      if (!$('email').value.trim() || !$('password').value) { $('login-error').textContent = 'Completa correo y contraseña.'; return; }
      const r = await BA.login($('email').value, $('password').value);
      if (!r.ok) { $('login-error').textContent = r.error; $('password').value = ''; return; }
      location.href = nextUrl();
    });
  }

  // ---------- Subir / editar material ----------
  if (page === 'subir') {
    const user = BA.guard(); if (!user) return;
    const id = new URLSearchParams(location.search).get('id');
    const form = $('upload-form'), desc = $('upload-description'), counter = $('description-count');
    $('upload-author').value = user.name;
    const existing = id ? BA.get(id) : null;
    if (id && (!existing || (existing.ownerId !== user.id && user.role !== 'admin'))) { location.replace('panel.html'); return; }
    if (existing) {
      $('form-title').textContent = 'Editar material';
      $('upload-title').value = existing.title; $('upload-subject').value = existing.subject; $('upload-type').value = existing.type;
      desc.value = existing.description; $('upload-tags').value = existing.tags || ''; $('upload-content').value = existing.content || '';
      $('upload-consent').checked = true; $('upload-author').value = existing.author;
    }
    const upd = () => { counter.textContent = `${desc.value.length}/500`; }; desc.addEventListener('input', upd); upd();
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!$('upload-consent').checked) { document.querySelector('[data-error-for="consent"]').textContent = 'Debes confirmar que tienes permiso para compartirlo.'; return; }
      const data = { title: $('upload-title').value, subject: $('upload-subject').value, type: $('upload-type').value,
        description: desc.value, tags: $('upload-tags').value, content: $('upload-content').value };
      const r = existing ? BA.update(id, data) : BA.create(data);
      if (!r.ok) {
        const map = { title: 'upload-title', subject: 'upload-subject', type: 'upload-type', description: 'upload-description' };
        document.querySelectorAll('[data-error-for]').forEach(el => { el.textContent = ''; });
        Object.entries(r.errors || {}).forEach(([k, m]) => { const el = document.querySelector(`[data-error-for="${k}"]`); if (el) el.textContent = m; });
        if (r.error) alert(r.error);
        $(map[Object.keys(r.errors || {})[0]])?.focus(); return;
      }
      if (existing) { location.href = 'panel.html'; return; }
      $('upload-success').hidden = false; form.reset(); $('upload-author').value = user.name; upd();
      $('upload-success').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // ---------- Panel: listar, buscar, editar y eliminar ----------
  if (page === 'panel') {
    const user = BA.guard(); if (!user) return;
    const body = $('panel-body');
    const render = () => {
      const term = $('panel-search').value.trim().toLocaleLowerCase('es'), sub = $('panel-subject').value;
      const rows = BA.all().filter(m => (user.role === 'admin' || m.ownerId === user.id) &&
        (sub === 'all' || m.subject === sub) && (!term || (m.title + ' ' + m.description + ' ' + m.tags + ' ' + m.author).toLocaleLowerCase('es').includes(term)));
      body.innerHTML = rows.map(m => `<tr>
        <td data-label="Título"><strong>${BA.esc(m.title)}</strong></td>
        <td data-label="Materia">${SUBJECTS[m.subject] || '-'}</td><td data-label="Tipo">${TYPES[m.type] || '-'}</td>
        <td data-label="Autor">${BA.esc(m.author)}</td><td data-label="Fecha">${fmt(m.created)}</td><td data-label="Vistas">${m.views || 0}</td>
        <td data-label="Acciones" class="row-actions">
          <a class="btn btn-secondary btn-small" href="subir.html?id=${encodeURIComponent(m.id)}">Editar</a>
          <button class="btn btn-small btn-danger" type="button" data-del="${BA.esc(m.id)}">Eliminar</button></td></tr>`).join('');
      $('panel-count').textContent = `${rows.length} ${rows.length === 1 ? 'material' : 'materiales'}${user.role === 'admin' ? ' (vista de administrador)' : ''}`;
      const none = BA.all().filter(m => user.role === 'admin' || m.ownerId === user.id).length === 0;
      $('panel-empty').hidden = !none; document.querySelector('.table-wrap').hidden = none;
    };
    body.addEventListener('click', e => {
      const id = e.target.dataset.del; if (!id) return;
      const m = BA.get(id);
      if (confirm(`¿Eliminar "${m?.title}"? Esta acción no se puede deshacer.`)) { const r = BA.remove(id); if (!r.ok) alert(r.error); render(); }
    });
    $('panel-search').addEventListener('input', render); $('panel-subject').addEventListener('change', render); render();
  }

  // ---------- Reportes ----------
  if (page === 'reportes') {
    const user = BA.guard(); if (!user) return;
    const mine = BA.all().filter(m => user.role === 'admin' || m.ownerId === user.id);
    const base = (window.BA_SEED || []).map(([id, subject, type, title]) => ({ id, subject, type, title, views: 0, base: true }));
    const scope = user.role === 'admin' ? [...base, ...mine] : mine;
    const count = (list, key) => list.reduce((a, m) => (a[m[key]] = (a[m[key]] || 0) + 1, a), {});
    const favs = (() => { try { return JSON.parse(localStorage.getItem('banco-favorites') || '[]').length; } catch (e) { return 0; } })();
    const totalViews = mine.reduce((s, m) => s + (m.views || 0), 0);
    const cards = [['Materiales', scope.length], ['Aportes de la comunidad', mine.length], ['Vistas de aportes', totalViews], ['Favoritos guardados', favs]];
    if (user.role === 'admin') cards.splice(1, 0, ['Usuarios registrados', BA.users().length]);
    $('stat-cards').innerHTML = cards.map(([l, v]) => `<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join('');
    const bars = (el, data, labels) => {
      const max = Math.max(1, ...Object.values(data));
      $(el).innerHTML = Object.entries(labels).map(([k, label]) => `<div class="bar-row"><span>${label}</span>
        <div class="bar"><i style="width:${((data[k] || 0) / max) * 100}%"></i></div><b>${data[k] || 0}</b></div>`).join('');
    };
    bars('chart-subject', count(scope, 'subject'), SUBJECTS); bars('chart-type', count(scope, 'type'), TYPES);
    const top = [...mine].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    $('top-views').innerHTML = top.length ? top.map(m => `<li>${BA.esc(m.title)} <b>${m.views || 0} ${m.views === 1 ? 'vista' : 'vistas'}</b></li>`).join('') : '<li class="muted">Aún no hay aportes.</li>';
    if (user.role === 'admin') {
      $('users-card').hidden = false;
      $('users-list').innerHTML = BA.users().map(u => `<li>${BA.esc(u.name)} <b>${BA.esc(u.role)}</b></li>`).join('');
    }
    $('print-report').addEventListener('click', () => window.print());
    $('export-csv').addEventListener('click', () => {
      const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [['id', 'titulo', 'materia', 'tipo', 'autor', 'vistas'], ...scope.map(m => [m.id, m.title, SUBJECTS[m.subject], TYPES[m.type], m.author || 'Equipo', m.views || 0])];
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
      a.download = 'reporte-banco-de-apuntes.csv'; a.click(); URL.revokeObjectURL(a.href);
    });
  }
})();
