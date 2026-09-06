/* ===== TRIPULACIÓN CHEKCHE ===== */
(function () {
  'use strict';

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 0. Fallback de rutas de imagen (por si el espacio en "Se busca.png" --- */
  /*        se sirve distinto según cómo quedó subido el archivo al repo) --- */
  window.intentarSiguienteRuta = function (img) {
    var lista = (img.getAttribute('data-fallbacks') || '').split('|').filter(Boolean);
    if (!lista.length) return;
    var siguiente = lista.shift();
    img.setAttribute('data-fallbacks', lista.join('|'));
    img.onerror = lista.length ? function () { window.intentarSiguienteRuta(img); } : null;
    img.src = siguiente;
  };

  /* --- 1. Botón comenzar aventura --- */
  var btnComenzar = document.getElementById('btn-comenzar');
  if (btnComenzar) {
    btnComenzar.addEventListener('click', function () {
      if (!menosMovimiento) {
        btnComenzar.classList.add('zarpando');
        setTimeout(function () { btnComenzar.classList.remove('zarpando'); }, 550);
      }
      var destino = document.getElementById('capitana');
      if (destino) destino.scrollIntoView({ behavior: menosMovimiento ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* --- 2. Revelado de secciones al navegar --- */
  var elementos = document.querySelectorAll('.revelar, .revelar-cartel');

  if ('IntersectionObserver' in window && !menosMovimiento) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    elementos.forEach(function (el) { observador.observe(el); });
  } else {
    elementos.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- 3. Abrir el verdadero tesoro --- */
  var btnTesoro = document.getElementById('btn-tesoro');
  var cofre = document.getElementById('cofre');
  var pregunta = document.getElementById('tesoro-pregunta');
  var veloTesoro = document.getElementById('velo-tesoro');

  if (btnTesoro && cofre) {
    btnTesoro.addEventListener('click', function () {
      if (veloTesoro) veloTesoro.classList.add('activo');

      var iniciarApertura = function () {
        cofre.hidden = false;
        void cofre.offsetWidth;
        if (pregunta) pregunta.style.display = 'none';

        if (menosMovimiento) {
          cofre.classList.add('abierto');
        } else {
          cofre.classList.add('abriendo');
          setTimeout(function () {
            cofre.classList.remove('abriendo');
            cofre.classList.add('abierto');
          }, 380);
        }

        cofre.scrollIntoView({ behavior: menosMovimiento ? 'auto' : 'smooth', block: 'center' });
        lluviaDorada();
        if (!menosMovimiento) setTimeout(lluviaDorada, 700);
      };

      if (menosMovimiento) iniciarApertura();
      else setTimeout(iniciarApertura, 350);
    });
  }

  /* --- 4. Partículas sutiles (canvas) --- */
  var ancho = 0, alto = 0, particulas = [], extras = [], ctx = null;
  var canvas = document.getElementById('particulas');

  function lluviaDorada() {
    if (!ctx) return;
    for (var i = 0; i < 40; i++) {
      extras.push({
        x: ancho / 2 + (Math.random() - 0.5) * ancho * 0.7,
        y: -20 - Math.random() * 120,
        r: Math.random() * 2.4 + 1,
        vy: Math.random() * 1.6 + 0.9,
        vx: (Math.random() - 0.5) * 0.5,
        o: 1
      });
    }
  }
  window.lluviaDorada = lluviaDorada;

  if (canvas && !menosMovimiento) {
    ctx = canvas.getContext('2d');

    var medir = function () {
      ancho = canvas.width = window.innerWidth;
      alto = canvas.height = window.innerHeight;
    };

    var crear = function () {
      particulas = [];
      var cantidad = Math.min(26, Math.round(ancho / 18));
      for (var i = 0; i < cantidad; i++) {
        particulas.push({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          r: Math.random() * 1.8 + 0.6,
          vy: -(Math.random() * 0.25 + 0.08),
          vx: (Math.random() - 0.5) * 0.14,
          o: Math.random() * 0.5 + 0.2
        });
      }
    };

    var dibujar = function () {
      ctx.clearRect(0, 0, ancho, alto);

      particulas.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = alto + 10; p.x = Math.random() * ancho; }
        if (p.x < -10) p.x = ancho + 10;
        if (p.x > ancho + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(227,176,75,' + p.o + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      for (var i = extras.length - 1; i >= 0; i--) {
        var e = extras[i];
        e.x += e.vx; e.y += e.vy; e.o -= 0.004;
        if (e.y > alto + 20 || e.o <= 0) { extras.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,226,150,' + Math.max(e.o, 0) + ')';
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(dibujar);
    };

    medir(); crear(); dibujar();

    var temporizador;
    window.addEventListener('resize', function () {
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { medir(); crear(); }, 200);
    });
  }

  /* --- 5. Música de fondo (opcional, nunca con autoplay) --- */
  var btnMusica = document.getElementById('btn-musica');
  var musica = document.getElementById('musica-fondo');

  if (btnMusica && musica) {
    var sonando = false;
    var iconoMusica = btnMusica.querySelector('.icono-musica');

    // Si el archivo music.mp3 no existe (o no carga), no rompemos nada:
    // simplemente lo indicamos discretamente y evitamos futuros intentos.
    musica.addEventListener('error', function () {
      btnMusica.classList.add('sin-musica');
      btnMusica.title = 'No hay música disponible';
      btnMusica.querySelector('.texto-musica').textContent = 'Sin música';
    });

    btnMusica.addEventListener('click', function () {
      if (btnMusica.classList.contains('sin-musica')) return;

      if (!sonando) {
        var intento = musica.play();
        if (intento && typeof intento.catch === 'function') {
          intento.then(function () {
            sonando = true;
            btnMusica.setAttribute('aria-pressed', 'true');
            if (iconoMusica) iconoMusica.textContent = '🎵';
          }).catch(function () {
            // el navegador bloqueó la reproducción o el archivo no existe
            btnMusica.classList.add('sin-musica');
            btnMusica.querySelector('.texto-musica').textContent = 'Sin música';
          });
        }
      } else {
        musica.pause();
        sonando = false;
        btnMusica.setAttribute('aria-pressed', 'false');
        if (iconoMusica) iconoMusica.textContent = '🔇';
      }
    });
  }

  /* --- 6. Easter egg personal --- */
  var easterEgg = document.getElementById('easter-egg');
  if (easterEgg) {
    var easterSecreto = easterEgg.querySelector('.easter-secreto');
    easterEgg.addEventListener('click', function () {
      var abierto = easterEgg.getAttribute('aria-expanded') === 'true';
      easterEgg.setAttribute('aria-expanded', String(!abierto));
      if (easterSecreto) easterSecreto.hidden = abierto;
    });
  }

  /* --- 8. El último tesoro (Tesoro2.png) — clímax final --- */
  var btnUltimoTesoro = document.getElementById('btn-ultimo-tesoro');
  var cofreUltimo = document.getElementById('cofre-ultimo');
  var preguntaUltimo = document.getElementById('ultimo-tesoro-pregunta');
  var veloUltimo = document.getElementById('velo-ultimo-tesoro');
  var luzFinal = document.getElementById('luz-final');

  if (btnUltimoTesoro && cofreUltimo) {
    btnUltimoTesoro.addEventListener('click', function () {
      if (veloUltimo) veloUltimo.classList.add('activo');

      var iniciarApertura = function () {
        cofreUltimo.hidden = false;
        void cofreUltimo.offsetWidth;
        if (preguntaUltimo) preguntaUltimo.style.display = 'none';

        if (menosMovimiento) {
          cofreUltimo.classList.add('abierto');
        } else {
          cofreUltimo.classList.add('abriendo');
          if (luzFinal) luzFinal.classList.add('activa');
          setTimeout(function () {
            cofreUltimo.classList.remove('abriendo');
            cofreUltimo.classList.add('abierto');
          }, 380);
        }

        cofreUltimo.scrollIntoView({ behavior: menosMovimiento ? 'auto' : 'smooth', block: 'center' });
        lluviaDorada();
        if (!menosMovimiento) setTimeout(lluviaDorada, 700);
      };

      if (menosMovimiento) iniciarApertura();
      else setTimeout(iniciarApertura, 350);
    });
  }

  /* --- 9. Barco alejándose en el gran final --- */
  var barcoFinal = document.querySelector('.barco-final');
  if (barcoFinal && !menosMovimiento) {
    if ('IntersectionObserver' in window) {
      var observadorBarco = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            barcoFinal.classList.add('navegando');
            observadorBarco.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.4 });
      observadorBarco.observe(barcoFinal);
    } else {
      barcoFinal.classList.add('navegando');
    }
  }
})();
