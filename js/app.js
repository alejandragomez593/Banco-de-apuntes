/* Banco de Apuntes: navegación y funciones de demostración */
(() => {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  const currentPage = document.body.dataset.page || '';

  const navItems = [
    ['index.html', 'Inicio', 'inicio'],
    ['que-es.html', '¿Qué es?', 'que-es'],
    ['como-funciona.html', 'Cómo funciona', 'como-funciona'],
    ['biblioteca.html', 'Biblioteca', 'biblioteca'],
    ['funciones.html', 'Funciones', 'funciones'],
    ['modelo.html', 'Modelo', 'modelo'],
    ['equipo.html', 'Equipo', 'equipo']
  ].filter((item, i, arr) => arr.findIndex(x => x[0] === item[0]) === i);
  const user = window.BA ? BA.currentUser() : null;

  if (header) {
    header.innerHTML = `
      <nav class="site-nav" aria-label="Navegación principal">
        <div class="nav-inner">
          <a class="brand" href="index.html" aria-label="Banco de Apuntes, inicio">
            <img src="img/logo.svg" alt="">
            <span>Banco de <em>Apuntes</em></span>
          </a>

          <button class="menu-toggle" id="menu-toggle" type="button"
            aria-label="Abrir menú" aria-expanded="false">☰</button>

          <div class="nav-links" id="nav-links">
            ${navItems.map(([url, label, key]) =>
              `<a href="${url}" class="${currentPage === key ? 'active' : ''}"
              ${currentPage === key ? 'aria-current="page"' : ''}>${label}</a>`
            ).join('')}
            ${user
              ? `<a href="panel.html" class="${currentPage === 'panel' ? 'active' : ''}">Mi panel</a>
                 <a href="reportes.html" class="${currentPage === 'reportes' ? 'active' : ''}">Reportes</a>
                 <a class="nav-cta" href="subir.html">＋ Compartir</a>`
              : `<a href="login.html" class="${currentPage === 'login' ? 'active' : ''}">Ingresar</a>
                 <a class="nav-cta" href="registro.html">Registrarse</a>`}
          </div>

          <div class="nav-actions">
            ${user ? `<button class="theme-toggle user-chip" id="logout-btn" type="button" title="Cerrar sesión (${BA.esc(user.name)})" aria-label="Cerrar sesión">⎋</button>` : ''}
            <button class="theme-toggle" id="theme-toggle" type="button"
              aria-label="Activar modo oscuro" title="Cambiar tema">☾</button>
          </div>
        </div>
      </nav>
      <div class="nav-spacer"></div>`;
  }

  if (footer) {
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">

        <div class="footer-top">

          <!-- Información del proyecto -->
          <div class="footer-brand">
            <img src="img/logo.svg" alt="Logo de Banco de Apuntes">

            <div>
              <strong>Banco de Apuntes</strong>
              <p>Aprender juntos. Llegar más lejos.</p>
            </div>
          </div>

          <!-- Enlaces rápidos -->
          <div class="footer-links">
            <h3>Enlaces rápidos</h3>
            <a href="index.html">Inicio</a>
            <a href="que-es.html">Sobre el proyecto</a>
            <a href="como-funciona.html">Cómo funciona</a>
            <a href="biblioteca.html">Biblioteca</a>
            <a href="subir.html">Compartir material</a>
            <a href="documentacion.html">Documentación</a>
            <a href="equipo.html">Nuestro equipo</a>
          </div>

          <!-- Información de contacto -->
          <div class="footer-contact">
            <h3>Contacto</h3>

            <p>
              <span aria-hidden="true">✉</span>
              <a href="mailto:contacto@bancodeapuntes.example">
                contacto@bancodeapuntes.example
              </a>
            </p>

            <p>
              <span aria-hidden="true">☎</span>
              <a href="tel:+50322001234">+503 2200-1234</a>
            </p>

            <p>
              <span aria-hidden="true">📍</span>
              San Salvador, El Salvador
            </p>

            <p class="footer-hours">
              <strong>Horario de atención</strong><br>
              Lunes a viernes<br>
              8:00 a. m. – 5:00 p. m.
            </p>
          </div>

          <!-- Redes sociales -->
          <div class="footer-social">
            <h3>Síguenos</h3>
            <p>Conéctate con nuestra comunidad educativa.</p>

            <div class="social-links">
              <a href="https://www.facebook.com/"
                 target="_blank" rel="noopener noreferrer"
                 aria-label="Facebook">Facebook</a>

              <a href="https://www.instagram.com/"
                 target="_blank" rel="noopener noreferrer"
                 aria-label="Instagram">Instagram</a>

            </div>
          </div>

        </div>

        <!-- Franja inferior -->
        <div class="footer-bottom">
          <span>
            Proyecto Final · Módulo 3.8 · INFRAMEN ·
            3-1 Desarrollo de Software
          </span>

          <span>
            © 2026 Banco de Apuntes · Proyecto académico
          </span>
        </div>

        <p class="footer-disclaimer">
          Proyecto académico. Los datos de contacto son ficticios.
        </p>

      </div>
    </footer>`;
  }

  document.getElementById('logout-btn')?.addEventListener('click', () => { BA.logout(); location.href = 'index.html'; });

  // Menú móvil
  const menuButton = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
      menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
      });
    });
  }

  // Modo oscuro persistente
  const themeButton = document.getElementById('theme-toggle');

  const applyTheme = dark => {
    document.body.classList.toggle('dark', dark);

    if (themeButton) {
      themeButton.textContent = dark ? '☀' : '☾';
      themeButton.setAttribute(
        'aria-label',
        dark ? 'Activar modo claro' : 'Activar modo oscuro'
      );
      themeButton.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }
  };

  let savedTheme = 'light';

  try {
    savedTheme = localStorage.getItem('banco-theme') || 'light';
  } catch (error) {}

  applyTheme(savedTheme === 'dark');

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const dark = !document.body.classList.contains('dark');
      applyTheme(dark);

      try {
        localStorage.setItem('banco-theme', dark ? 'dark' : 'light');
      } catch (error) {}
    });
  }

  // Biblioteca: búsqueda, filtros, favoritos y vista previa
  const grid = document.getElementById('resource-grid');

  if (grid) {
    const covers = ['purple', 'blue', 'pink', 'green', 'orange', 'lilac'];
    const typeInfo = { apuntes: '📝 Apuntes', guia: '📘 Guía', ejercicio: '🧩 Ejercicios', resumen: '📄 Resumen', examen: '📑 Examen pasado' };
    const subjectLabel = { prog: 'PROGRAMACIÓN', mate: 'MATEMÁTICAS', bd: 'BASES DE DATOS', lengua: 'LENGUAJE' };
    if (window.BA) BA.all().forEach((m, i) => {
      const card = document.createElement('article');
      card.className = 'resource-card';
      Object.assign(card.dataset, {
        id: m.id, subject: m.subject, type: m.type, title: m.title, description: m.description,
        author: m.author, tags: m.tags || '', user: '1',
        date: new Date(m.created).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })
      });
      card.innerHTML = `
        <div class="resource-cover cover-${covers[i % covers.length]}">
          <span class="cover-symbol">★</span><span class="cover-label">${subjectLabel[m.subject] || 'OTRA'}</span>
          <span class="cover-bottom">APORTE DE LA COMUNIDAD</span></div>
        <div class="resource-content">
          <div class="resource-meta"><span class="type-pill">${typeInfo[m.type] || m.type}</span>
            <button class="favorite-button" type="button" aria-pressed="false">☆</button></div>
          <h3>${BA.esc(m.title)}</h3><p>${BA.esc(m.description.slice(0, 90))}${m.description.length > 90 ? '…' : ''}</p>
          <div class="resource-footer"><span>✍ ${BA.esc(m.author)}</span>
            <button class="text-link preview-button" type="button">Ver recurso ↗</button></div></div>`;
      grid.appendChild(card);
    });
    const cards = [...grid.querySelectorAll('.resource-card')];
    const search = document.getElementById('resource-search');
    const subject = document.getElementById('subject-filter');
    const type = document.getElementById('type-filter');
    const favOnly = document.getElementById('favorites-only');
    const count = document.getElementById('results-count');
    const empty = document.getElementById('empty-state');

    let favorites = [];

    try {
      favorites = JSON.parse(localStorage.getItem('banco-favorites') || '[]');
      if (!Array.isArray(favorites)) favorites = [];
    } catch (error) {
      favorites = [];
    }

    const saveFavorites = () => {
      try {
        localStorage.setItem('banco-favorites', JSON.stringify(favorites));
      } catch (error) {}
    };

    const updateFavoriteButtons = () => {
      cards.forEach(card => {
        const button = card.querySelector('.favorite-button');
        const isFavorite = favorites.includes(card.dataset.id);

        button.setAttribute('aria-pressed', String(isFavorite));
        button.textContent = isFavorite ? '★' : '☆';
        button.setAttribute(
          'aria-label',
          `${isFavorite ? 'Quitar de' : 'Guardar en'} favoritos: ${card.dataset.title}`
        );
      });
    };

    const filterCards = () => {
      const term = (search?.value || '').trim().toLocaleLowerCase('es');
      const selectedSubject = subject?.value || 'all';
      const selectedType = type?.value || 'all';
      const onlyFavorites = Boolean(favOnly?.checked);

      let visible = 0;

      cards.forEach(card => {
        const searchableText = [
          card.dataset.title,
          card.dataset.description,
          card.dataset.author,
          card.dataset.tags,
          card.innerText
        ].join(' ').toLocaleLowerCase('es');

        const matches =
          (!term || searchableText.includes(term)) &&
          (selectedSubject === 'all' || card.dataset.subject === selectedSubject) &&
          (selectedType === 'all' || card.dataset.type === selectedType) &&
          (!onlyFavorites || favorites.includes(card.dataset.id));

        card.hidden = !matches;
        if (matches) visible++;
      });

      if (count) {
        count.textContent = `${visible} ${visible === 1 ? 'recurso' : 'recursos'}`;
      }

      if (empty) empty.hidden = visible !== 0;
    };

    cards.forEach(card => {
      card.querySelector('.favorite-button').addEventListener('click', () => {
        const id = card.dataset.id;

        favorites = favorites.includes(id)
          ? favorites.filter(item => item !== id)
          : [...favorites, id];

        saveFavorites();
        updateFavoriteButtons();
        filterCards();
      });
    });

    [search, subject, type, favOnly].forEach(element => {
      if (element) {
        element.addEventListener(
          element === search ? 'input' : 'change',
          filterCards
        );
      }
    });

    const clearFilters = () => {
      if (search) search.value = '';
      if (subject) subject.value = 'all';
      if (type) type.value = 'all';
      if (favOnly) favOnly.checked = false;
      filterCards();
    };

    document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
    document.getElementById('empty-clear')?.addEventListener('click', clearFilters);

    // Atajo Ctrl+K o Cmd+K para enfocar el buscador
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'k' && search) {
        event.preventDefault();
        search.focus();
      }
    });

    updateFavoriteButtons();
    filterCards();

    // Textos de muestra de los recursos
    const sampleContent = {
      'html-basico':
        'HTML permite definir la estructura de una página web.\n\n' +
        '1. Usa <!DOCTYPE html> para declarar el documento.\n' +
        '2. Organiza el contenido con <header>, <main> y <footer>.\n' +
        '3. Usa títulos en orden y textos alternativos en las imágenes.\n' +
        '4. Mantén los enlaces descriptivos y revisa la accesibilidad.',

      'laravel-guia':
        'Laravel es un framework de PHP.\n\n' +
        'Ruta de aprendizaje:\n' +
        '1. Comprende la estructura del proyecto.\n' +
        '2. Define rutas en routes/web.php.\n' +
        '3. Usa controladores para organizar la lógica.\n' +
        '4. Crea modelos y migraciones para trabajar con datos.',

      'sql-ejercicios':
        'Ejemplos de práctica SQL:\n\n' +
        'SELECT nombre FROM estudiantes;\n' +
        'SELECT * FROM libros WHERE cantidad_disponible > 0;\n' +
        'SELECT categoria, COUNT(*) FROM libros GROUP BY categoria;\n\n' +
        'Practica JOIN relacionando las tablas mediante sus claves.',

      'formulas-mate':
        'Álgebra: (a+b)² = a² + 2ab + b²\n\n' +
        'Geometría: Área de rectángulo = base × altura.\n\n' +
        'Círculo: Área = πr².\n\n' +
        'Trigonometría: sen²(x) + cos²(x) = 1.\n\n' +
        'Revisa las unidades y anota los datos antes de sustituir valores.',

      'lenguaje-resumen':
        'Comprensión lectora:\n\n' +
        '• Idea principal: resume de qué trata el texto.\n' +
        '• Inferencia: conclusión apoyada por pistas del texto.\n' +
        '• Propósito: identifica qué busca lograr el autor.\n' +
        '• Evidencia: sustenta tus respuestas con fragmentos relevantes.',

      'repaso-mate':
        'Repaso de práctica:\n\n' +
        '1. Resuelve 2x + 6 = 18.\n' +
        '2. Calcula el área de un rectángulo de 8 cm por 5 cm.\n' +
        '3. Desarrolla (x + 3)².\n' +
        '4. Explica cuándo usarías el teorema de Pitágoras.',
      
      'css-basico':
        'FUNDAMENTOS DE CSS\n\n' +
        'CSS permite definir la apariencia de una página web.\n\n' +
        '1. Selectores: p selecciona párrafos y .clase selecciona elementos por clase.\n' +
        '2. Colores: usa color para el texto y background-color para el fondo.\n' +
        '3. Espaciado: margin separa elementos y padding crea espacio interior.\n' +
        '4. Bordes: utiliza border para definir contornos.\n' +
        '5. Diseño adaptable: usa media queries para pantallas diferentes.\n\n' +
        'Ejemplo: p { color: blue; margin: 10px; }',

      'javascript-fundamentos':
        'GUÍA DE JAVASCRIPT\n\n' +
        'JavaScript permite añadir comportamiento e interactividad a las páginas.\n\n' +
        'Variables: const nombre = "Ana";\n' +
        'Condición: if (edad >= 18) { console.log("Mayor de edad"); }\n' +
        'Función: function sumar(a, b) { return a + b; }\n' +
        'Evento: permite responder a clics y otras acciones.\n' +
        'DOM: document.querySelector() permite seleccionar elementos HTML.\n\n' +
        'Práctica: crea un botón que cambie el texto de un párrafo.',

      'python-intro':
        'INTRODUCCIÓN A PYTHON\n\n' +
        'Python es un lenguaje de programación de sintaxis sencilla.\n\n' +
        'Variable: nombre = "Carlos"\n' +
        'Lista: numeros = [2, 4, 6, 8]\n' +
        'Condición: if edad >= 18: print("Mayor de edad")\n' +
        'Ciclo: for numero in numeros: print(numero)\n' +
        'Función: def sumar(a, b): return a + b\n\n' +
        'Práctica: calcula el promedio de tres números.',

      'php-basico':
        'PHP DESDE CERO\n\n' +
        'PHP es un lenguaje utilizado para desarrollar aplicaciones del lado del servidor.\n\n' +
        'Variable: $nombre = "Ana";\n' +
        'Arreglo: $colores = ["rojo", "azul", "verde"];\n' +
        'Condición: if ($edad >= 18) { echo "Mayor de edad"; }\n' +
        'Función: function sumar($a, $b) { return $a + $b; }\n' +
        'Los formularios pueden enviar información mediante GET o POST.\n\n' +
        'Práctica: crea un formulario que solicite un nombre.',

      'algoritmos':
        'EJERCICIOS DE ALGORITMOS\n\n' +
        'Un algoritmo es una secuencia ordenada de pasos para resolver un problema.\n\n' +
        'Ejercicio 1: determinar si un número es par o impar.\n' +
        'Pista: utiliza el operador módulo (%).\n\n' +
        'Ejercicio 2: encontrar el mayor de dos números.\n' +
        'Pista: compara ambos valores con una condición.\n\n' +
        'Ejercicio 3: sumar los números del 1 al 10.\n' +
        'Pista: utiliza un ciclo y un acumulador.',

      'poo':
        'PROGRAMACIÓN ORIENTADA A OBJETOS\n\n' +
        'La POO organiza el código mediante clases y objetos.\n\n' +
        'Clase: define atributos y métodos.\n' +
        'Objeto: instancia concreta de una clase.\n' +
        'Encapsulamiento: controla el acceso a los datos.\n' +
        'Herencia: permite reutilizar características de otra clase.\n' +
        'Polimorfismo: permite distintas implementaciones de una operación.\n\n' +
        'Práctica: diseña una clase Estudiante con nombre y nota.',

      'git-github':
        'GUÍA DE GIT Y GITHUB\n\n' +
        'Git permite controlar las versiones de un proyecto. GitHub permite alojar repositorios y colaborar.\n\n' +
        'git init: inicializa un repositorio.\n' +
        'git status: muestra los cambios.\n' +
        'git add .: prepara los cambios.\n' +
        'git commit -m "Primer cambio": guarda una versión.\n' +
        'git push: envía los cambios al repositorio remoto.\n' +
        'git pull: obtiene los cambios remotos.\n\n' +
        'Práctica: crea un repositorio y registra un primer commit.',

      'redes-computadoras':
        'FUNDAMENTOS DE REDES\n\n' +
        'Una red permite que dispositivos intercambien información.\n\n' +
        'IP: identifica una interfaz dentro de una red.\n' +
        'DNS: traduce nombres de dominio a direcciones IP.\n' +
        'Router: conecta redes y dirige paquetes.\n' +
        'TCP: ofrece transporte fiable.\n' +
        'HTTP/HTTPS: protocolos usados para transferir contenido web.\n\n' +
        'Práctica: explica qué sucede cuando visitas un sitio web.',

      'seguridad-web':
        'INTRODUCCIÓN A LA SEGURIDAD WEB\n\n' +
        'La seguridad web busca proteger aplicaciones y usuarios.\n\n' +
        '1. Usa contraseñas únicas y autenticación multifactor.\n' +
        '2. Valida los datos recibidos en el servidor.\n' +
        '3. Utiliza HTTPS para proteger la comunicación.\n' +
        '4. Evita insertar entradas de usuario como HTML sin sanitizarlas.\n' +
        '5. Mantén dependencias y software actualizados.\n\n' +
        'Práctica: identifica riesgos en un formulario de inicio de sesión.',

      'modelado-bd':
        'INTRODUCCIÓN AL MODELADO DE DATOS\n\n' +
        'El modelo entidad-relación ayuda a planificar una base de datos.\n\n' +
        'Entidad: objeto del que se almacenan datos, como Estudiante.\n' +
        'Atributo: propiedad, como nombre o fecha de nacimiento.\n' +
        'Relación: asociación entre entidades.\n' +
        'Clave primaria: identifica cada registro.\n' +
        'Clave foránea: relaciona registros entre tablas.\n\n' +
        'Práctica: modela Estudiante, Curso e Inscripción.',

      'normalizacion-bd':
        'NORMALIZACIÓN DE BASES DE DATOS\n\n' +
        'La normalización ayuda a reducir duplicaciones y anomalías.\n\n' +
        'Primera forma normal (1FN): cada campo contiene un valor atómico.\n' +
        'Segunda forma normal (2FN): se eliminan dependencias parciales respecto de claves compuestas.\n' +
        'Tercera forma normal (3FN): se eliminan dependencias transitivas no deseadas.\n\n' +
        'Práctica: separa una tabla que repite los datos de un cliente en muchos pedidos.',

      'mysql-practica':
        'PRÁCTICAS DE MYSQL\n\n' +
        'Crear una tabla:\n' +
        'CREATE TABLE estudiantes (id INT PRIMARY KEY, nombre VARCHAR(100));\n\n' +
        'Insertar un registro:\n' +
        'INSERT INTO estudiantes (id, nombre) VALUES (1, "Ana");\n\n' +
        'Consultar datos:\n' +
        'SELECT * FROM estudiantes;\n\n' +
        'Actualizar un registro:\n' +
        'UPDATE estudiantes SET nombre = "Ana López" WHERE id = 1;\n\n' +
        'Práctica: crea una tabla de cursos e inserta tres registros.',

      'consultas-avanzadas':
        'CONSULTAS SQL AVANZADAS\n\n' +
        'JOIN: combina registros relacionados entre tablas.\n' +
        'GROUP BY: agrupa registros para realizar cálculos.\n' +
        'HAVING: filtra grupos después de agrupar.\n' +
        'COUNT(*): cuenta registros.\n\n' +
        'Ejemplo:\n' +
        'SELECT curso_id, COUNT(*) AS total\n' +
        'FROM estudiantes\n' +
        'GROUP BY curso_id\n' +
        'HAVING COUNT(*) > 5;\n\n' +
        'Práctica: muestra los cursos que tienen más de cinco estudiantes.',

      'diseno-er':
        'DIAGRAMAS ENTIDAD-RELACIÓN\n\n' +
        'Los diagramas ER representan entidades, atributos y relaciones.\n\n' +
        'Entidad: se representa habitualmente con un rectángulo.\n' +
        'Atributo: describe una propiedad de la entidad.\n' +
        'Relación: conecta entidades.\n' +
        'Cardinalidad: expresa relaciones 1:1, 1:N o N:M.\n\n' +
        'Ejercicio: dibuja la relación entre un cliente y sus pedidos. Un cliente puede realizar varios pedidos.',

      'estadistica':
        'GUÍA BÁSICA DE ESTADÍSTICA\n\n' +
        'Media: suma de los datos dividida entre la cantidad de datos.\n' +
        'Mediana: valor central después de ordenar los datos.\n' +
        'Moda: valor que aparece con mayor frecuencia.\n' +
        'Rango: diferencia entre el valor máximo y el mínimo.\n\n' +
        'Ejemplo: datos 2, 3, 3, 4, 8.\n' +
        'Media = 20 / 5 = 4.\n' +
        'Mediana = 3.\n' +
        'Moda = 3.\n' +
        'Rango = 8 - 2 = 6.',

      'ecuaciones':
        'EJERCICIOS DE ECUACIONES\n\n' +
        'Ejercicio 1: resuelve 2x + 6 = 18.\n' +
        'Paso 1: resta 6 en ambos lados.\n' +
        'Paso 2: 2x = 12.\n' +
        'Paso 3: divide entre 2. Resultado: x = 6.\n\n' +
        'Ejercicio 2: resuelve 3x - 5 = 16.\n' +
        'Ejercicio 3: comprueba tu respuesta sustituyendo el valor obtenido.',

      'geometria':
        'RESUMEN DE GEOMETRÍA\n\n' +
        'Rectángulo: área = base × altura.\n' +
        'Triángulo: área = (base × altura) / 2.\n' +
        'Cuadrado: área = lado².\n' +
        'Circunferencia: longitud = 2πr.\n' +
        'Círculo: área = πr².\n' +
        'Triángulo rectángulo: a² + b² = c².\n\n' +
        'Práctica: calcula el área de un triángulo de base 10 cm y altura 6 cm.',

      'trigonometria':
        'APUNTES DE TRIGONOMETRÍA\n\n' +
        'En un triángulo rectángulo:\n\n' +
        'seno = cateto opuesto / hipotenusa.\n' +
        'coseno = cateto adyacente / hipotenusa.\n' +
        'tangente = cateto opuesto / cateto adyacente.\n\n' +
        'Identidad fundamental: sen²(x) + cos²(x) = 1.\n\n' +
        'Práctica: identifica los catetos y la hipotenusa antes de calcular una razón.',

      'funciones-mate':
        'PRÁCTICA DE FUNCIONES MATEMÁTICAS\n\n' +
        'Una función asigna a cada entrada válida una salida.\n\n' +
        'Dominio: conjunto de entradas permitidas.\n' +
        'Rango: conjunto de valores de salida.\n' +
        'Evaluar f(x): sustituir x por un valor dado.\n\n' +
        'Ejemplo: f(x) = 2x + 3.\n' +
        'f(4) = 2(4) + 3 = 11.\n\n' +
        'Práctica: calcula f(2) y f(5) si f(x) = x² - 1.',

      'probabilidad':
        'INTRODUCCIÓN A LA PROBABILIDAD\n\n' +
        'La probabilidad mide qué tan posible es un evento.\n\n' +
        'En casos equiprobables:\n' +
        'P(A) = casos favorables / casos posibles.\n\n' +
        'Ejemplo: al lanzar un dado justo, la probabilidad de obtener un 6 es 1/6.\n' +
        'La probabilidad de obtener un número par es 3/6 = 1/2.\n\n' +
        'Práctica: calcula la probabilidad de obtener cara al lanzar una moneda justa.',

      'ortografia':
        'REGLAS BÁSICAS DE ORTOGRAFÍA\n\n' +
        'Acentuación:\n' +
        'Agudas: llevan tilde si terminan en vocal, n o s.\n' +
        'Llanas: llevan tilde si no terminan en vocal, n o s.\n' +
        'Esdrújulas: siempre llevan tilde.\n\n' +
        'También revisa el uso de mayúsculas, comas y puntos.\n\n' +
        'Práctica: corrige esta oración: "el sabado iremos a san salvador".',

      'redaccion':
        'GUÍA PARA REDACTAR TEXTOS\n\n' +
        '1. Planifica: define el propósito y el público.\n' +
        '2. Organiza: prepara un esquema de ideas.\n' +
        '3. Introduce: presenta el tema.\n' +
        '4. Desarrolla: explica las ideas en párrafos ordenados.\n' +
        '5. Concluye: resume el mensaje principal.\n' +
        '6. Revisa: corrige claridad, ortografía y puntuación.\n\n' +
        'Práctica: escribe un párrafo con una idea principal y dos argumentos.',

      'generos-literarios':
        'GÉNEROS LITERARIOS\n\n' +
        'Narrativo: cuenta acontecimientos mediante un narrador.\n' +
        'Lírico: expresa emociones, ideas o sentimientos.\n' +
        'Dramático: presenta acciones mediante diálogos y escenas.\n\n' +
        'Actividad: identifica el género de un cuento, un poema y una obra teatral. Explica qué características reconociste.',

      'argumentacion':
        'EJERCICIOS DE ARGUMENTACIÓN\n\n' +
        'Tesis: postura principal que se defiende.\n' +
        'Argumento: razón que apoya la tesis.\n' +
        'Evidencia: dato o ejemplo que respalda un argumento.\n' +
        'Contraargumento: objeción a una postura.\n' +
        'Conclusión: síntesis final del razonamiento.\n\n' +
        'Práctica: escribe una tesis sobre el uso responsable de la tecnología y respáldala con dos argumentos.'

    };



    const modal = document.getElementById('resource-modal');

    const closeModal = () => {
      modal?.classList.remove('open');
      modal?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const openModal = card => {
      if (!modal) return;

      document.getElementById('modal-title').textContent = card.dataset.title;
      document.getElementById('modal-description').textContent = card.dataset.description;
      document.getElementById('modal-author').textContent = `✍ ${card.dataset.author}`;
      document.getElementById('modal-date').textContent = `◷ ${card.dataset.date}`;

      const tagsContainer = document.getElementById('modal-tags');
      tagsContainer.replaceChildren();

      card.dataset.tags.split(',').map(tag => tag.trim()).forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;
        tagsContainer.appendChild(span);
      });

      const userMat = card.dataset.user && window.BA ? BA.get(card.dataset.id) : null;
      if (userMat) BA.addView(userMat.id);
      document.getElementById('modal-preview-text').textContent =
        sampleContent[card.dataset.id] || userMat?.content || 'Este material aún no tiene contenido de muestra.';

      const download = document.getElementById('modal-download');

      const content =
        `${card.dataset.title}\n\n${card.dataset.description}\n\n` +
        `${sampleContent[card.dataset.id] || userMat?.content || ''}\n\n` +
        `Autor: ${card.dataset.author}\nFecha: ${card.dataset.date}\n` +
        `Etiquetas: ${card.dataset.tags}`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      const oldUrl = download.dataset.blobUrl;
      if (oldUrl) URL.revokeObjectURL(oldUrl);

      const url = URL.createObjectURL(blob);
      download.href = url;
      download.download = `${card.dataset.id}.txt`;
      download.dataset.blobUrl = url;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close').focus();
    };

    cards.forEach(card => {
      card.querySelector('.preview-button').addEventListener('click', () => {
        openModal(card);
      });
    });

    modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-close-bottom')?.addEventListener('click', closeModal);

    modal?.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModal();
    });
  }
})();
