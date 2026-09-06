/* ===== TRIPULACIÓN CHEKCHE ===== */
(function () {
  'use strict';

  var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Botón comenzar aventura --- */
  var btnComenzar = document.getElementById('btn-comenzar');
  if (btnComenzar) {
    btnComenzar.addEventListener('click', function () {
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

  if (btnTesoro && cofre) {
    btnTesoro.addEventListener('click', function () {
      cofre.hidden = false;
      // forzar reflow para que la animación se ejecute
      void cofre.offsetWidth;
      cofre.classList.add('abierto');
      if (pregunta) pregunta.style.display = 'none';
      cofre.scrollIntoView({ behavior: menosMovimiento ? 'auto' : 'smooth', block: 'center' });
      lluviaDorada();
    });
  }

  /* --- 4. Partículas sutiles (canvas) --- */
  var ancho = 0, alto = 0, particulas = [], extras = [], ctx = null;
  var canvas = document.getElementById('particulas');
  if (!canvas || menosMovimiento) return;

  ctx = canvas.getContext('2d');

  function medir() {
    ancho = canvas.width = window.innerWidth;
    alto = canvas.height = window.innerHeight;
  }

  function crear() {
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
  }

  // pequeña lluvia dorada al abrir el tesoro
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

  function dibujar() {
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
  }

  medir(); crear(); dibujar();

  var temporizador;
  window.addEventListener('resize', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { medir(); crear(); }, 200);
  });

  // exponer para el botón del tesoro
  window.lluviaDorada = lluviaDorada;
})();
