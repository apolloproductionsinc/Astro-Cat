// Astro Cat — shared behaviour for all five pages.
(function () {
  'use strict';

  // ---------- Mascot: one of three crew members per visit ----------
  var MASCOTS = [
    { name: 'KOWA', src: 'assets/img/mascot-kowa.jpg' },
    { name: 'NEKO', src: 'assets/img/mascot-neko.jpg' },
    { name: 'MISO', src: 'assets/img/mascot-miso.jpg' }
  ];
  var mascot = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
  document.querySelectorAll('[data-mascot]').forEach(function (img) { img.src = mascot.src; });
  document.querySelectorAll('[data-mascot-name]').forEach(function (el) { el.textContent = mascot.name; });

  // ---------- Local time of day as timecode, HH:MM:SS:FF at 24fps ----------
  var tcEls = document.querySelectorAll('[data-timecode]');
  if (tcEls.length) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var last = '';
    var tick = function () {
      var d = new Date();
      var tc = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ':' + pad(Math.floor(d.getMilliseconds() / (1000 / 24)));
      if (tc !== last) {
        last = tc;
        for (var i = 0; i < tcEls.length; i++) tcEls[i].textContent = tc;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Header: solid once you scroll off the home showreel ----------
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Mobile nav ----------
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ---------- Horizontal rails: drag to scroll with a mouse ----------
  document.querySelectorAll('.rail').forEach(function (rail) {
    var startX = 0, startScroll = 0, down = false, moved = false;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startScroll = rail.scrollLeft;
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        rail.classList.add('is-dragging');
        rail.setPointerCapture(e.pointerId);
      }
      if (moved) rail.scrollLeft = startScroll - dx;
    });
    var end = function () {
      down = false;
      rail.classList.remove('is-dragging');
    };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    // A drag should not also count as a click on a tile.
    rail.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  // ---------- Filters: chips show/hide the matching work ----------
  // <div class="chips" data-filter-for="#target">, each chip has data-filter="All|Commercial|…";
  // each item in the target has data-tags="Commercial Studio" (space-separated).
  document.querySelectorAll('[data-filter-for]').forEach(function (group) {
    var target = document.querySelector(group.getAttribute('data-filter-for'));
    if (!target) return;
    var chips = group.querySelectorAll('[data-filter]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        target.querySelectorAll('[data-tags]').forEach(function (item) {
          var tags = item.getAttribute('data-tags').split(' ');
          var match = f === 'All' || tags.indexOf(f.replace(/\s+/g, '-')) !== -1;
          item.hidden = !match || item.hasAttribute('data-more-hidden');
          item.toggleAttribute('data-filtered-out', !match);
        });
        target.scrollLeft = 0;
        updateLoadMore(target);
      });
    });
  });

  // ---------- Load more: reveal the next batch in a work grid ----------
  function updateLoadMore(grid) {
    var btn = document.querySelector('[data-load-more="#' + grid.id + '"]');
    if (!btn) return;
    var remaining = grid.querySelectorAll('[data-more-hidden]:not([data-filtered-out])').length;
    btn.hidden = remaining === 0;
  }
  document.querySelectorAll('[data-load-more]').forEach(function (btn) {
    var grid = document.querySelector(btn.getAttribute('data-load-more'));
    if (!grid) return;
    var step = parseInt(btn.getAttribute('data-step') || '6', 10);
    btn.addEventListener('click', function () {
      var next = grid.querySelectorAll('[data-more-hidden]:not([data-filtered-out])');
      for (var i = 0; i < next.length && i < step; i++) {
        next[i].removeAttribute('data-more-hidden');
        next[i].hidden = false;
      }
      updateLoadMore(grid);
    });
    updateLoadMore(grid);
  });

  // ---------- Studio capability accordion ----------
  document.querySelectorAll('.cap-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  // ---------- Contact form: no server, so it opens a pre-filled email ----------
  var form = document.querySelector('[data-mailto-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };
      var type = get('type') || 'Not sure';
      var subject = 'New job — ' + type + (get('name') ? ' — ' + get('name') : '');
      var body = [
        'Name: ' + get('name'),
        'Email: ' + get('email'),
        'Type of job: ' + type,
        'Dates: ' + (get('dates') || '—'),
        'Budget: ' + (get('budget') || '—'),
        '',
        get('brief')
      ].join('\n');
      var to = form.getAttribute('data-mailto-form');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var status = form.querySelector('.form-status');
      if (status) status.textContent = 'Your email app should open with this filled in. If it doesn’t, write to ' + to + '.';
    });
  }
})();
