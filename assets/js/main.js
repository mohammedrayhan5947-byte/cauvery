/* ============================================
   CAUVERY RESORTS — Main JavaScript
   IntersectionObserver-based motion, no libraries
   ============================================ */

(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Navbar scroll + mobile toggle ---------- */
    var navbar = document.querySelector('.navbar');
    var onNavScroll = function () { navbar && navbar.classList.toggle('scrolled', window.scrollY > 60); };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    var toggle = document.querySelector('.navbar__toggle');
    var links = document.querySelector('.navbar__links');
    if (toggle) toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      if (links) links.classList.toggle('open');
      document.body.style.overflow = links && links.classList.contains('open') ? 'hidden' : '';
    });
    if (links) links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (toggle) toggle.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    var currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__links a').forEach(function (a) {
      if (a.getAttribute('href') === currentPage) a.classList.add('active');
    });

    /* ---------- Word splitting (data-split) ---------- */
    function splitWords(el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'); w.className = 'w';
              var inner = document.createElement('span'); inner.textContent = part;
              inner.style.setProperty('--i', i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      })(el);
    }
    document.querySelectorAll('[data-split]').forEach(splitWords);

    /* ---------- Stagger index for children ---------- */
    document.querySelectorAll('[data-stagger]').forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty('--i', i); });
    });

    /* ---------- Reveal on scroll (AOS-compatible + new hooks) ---------- */
    var revealSel = '[data-aos],[data-reveal],[data-split],[data-stagger],.reveal-mask,.draw';
    var revealEls = document.querySelectorAll(revealSel);
    var splash = document.getElementById('splash-screen');
    var splashActive = splash && splash.style.display !== 'none' && !splash.classList.contains('hide');
    var reveal = function (el) {
      var delay = parseInt(el.dataset.aosDelay || 0, 10);
      var go = function () { el.classList.add('aos-animate', 'is-in'); };
      delay ? setTimeout(go, delay) : go();
    };
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('aos-animate', 'is-in'); });
    } else {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            // clip-path-hidden masks never intersect themselves, so we watch their parent
            (e.target._masks || [e.target]).forEach(reveal);
            rio.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) {
        if (el.hasAttribute('data-hero')) {
          setTimeout(function () { reveal(el); }, splashActive ? 2500 : 150);
        } else if (el.classList.contains('reveal-mask') && el.parentElement) {
          var par = el.parentElement;
          if (!par._masks) { par._masks = []; rio.observe(par); }
          par._masks.push(el);
        } else rio.observe(el);
      });
    }

    /* ---------- Counters ---------- */
    var fmt = new Intl.NumberFormat('en-IN');
    function runCounter(el) {
      var end = parseFloat(el.dataset.count);
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var suffix = el.dataset.suffix || '';
      var render = function (v) { el.textContent = (decimals ? v.toFixed(decimals) : fmt.format(Math.round(v))) + suffix; };
      if (reduceMotion) { render(end); return; }
      var dur = 1900, t0 = null;
      var tick = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        render(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    var counters = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else counters.forEach(runCounter);

    /* ---------- Parallax ([data-parallax="0.2"]) ---------- */
    var pEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (pEls.length && !reduceMotion) {
      var ticking = false;
      var vh = window.innerHeight;
      var update = function () {
        ticking = false;
        pEls.forEach(function (el) {
          var r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var speed = parseFloat(el.dataset.parallax) || 0.15;
          var offset = (r.top + r.height / 2 - vh / 2) * speed;
          el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
        });
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', function () { vh = window.innerHeight; update(); });
      update();
    }

    /* ---------- Marquee: clone track content for a seamless loop ---------- */
    document.querySelectorAll('.trust-strip__track').forEach(function (track) {
      if (track.dataset.cloned) return;
      Array.prototype.slice.call(track.children).forEach(function (c) {
        var clone = c.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
      });
      track.dataset.cloned = '1';
    });

    /* ---------- Generic lightbox (home bento, masonry gallery) ---------- */
    var lb = document.getElementById('lightbox') || document.querySelector('.lightbox-overlay');
    var lbImg = lb && lb.querySelector('img');
    var galleryEls = document.querySelectorAll('.gallery-bento [data-src]');
    if (lb && lbImg && galleryEls.length) {
      var srcs = Array.prototype.map.call(galleryEls, function (el) { return el.getAttribute('data-src'); });
      var idx = 0;
      var show = function (i) { idx = (i + srcs.length) % srcs.length; lbImg.src = srcs[idx]; };
      var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; };
      galleryEls.forEach(function (el, i) {
        el.addEventListener('click', function () { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
      });
      var q = function (s) { return lb.querySelector(s); };
      q('.lightbox-close') && q('.lightbox-close').addEventListener('click', close);
      q('.lightbox-prev') && q('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
      q('.lightbox-next') && q('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
      });
    }

    /* ---------- Legacy [data-lightbox] ---------- */
    var overlay = document.querySelector('.lightbox-overlay');
    document.querySelectorAll('[data-lightbox]').forEach(function (item) {
      item.addEventListener('click', function () {
        var img = overlay && overlay.querySelector('img');
        var src = item.dataset.lightbox || (item.querySelector('img') || {}).src;
        if (src && img) { img.src = src; overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
      });
    });

    /* ---------- Form validation (inline errors) ---------- */
    function showFieldError(field, msg) {
      field.classList.add('field-error');
      var err = field.parentElement.querySelector('.field-error-msg');
      if (!err) { err = document.createElement('span'); err.className = 'field-error-msg'; field.parentElement.appendChild(err); }
      err.textContent = msg; err.style.display = 'block';
    }
    function clearFieldError(field) {
      field.classList.remove('field-error'); field.classList.add('field-ok');
      var err = field.parentElement.querySelector('.field-error-msg');
      if (err) err.style.display = 'none';
    }
    function validateField(field) {
      var val = field.value.trim();
      if (field.hasAttribute('required') && !val) {
        var lab = field.parentElement.querySelector('label');
        showFieldError(field, ((lab && lab.textContent.replace(' *', '').trim()) || 'This field') + ' is required.');
        return false;
      }
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { showFieldError(field, 'Please enter a valid email address.'); return false; }
      if (field.type === 'tel' && val && !/^[+\d\s\-]{7,15}$/.test(val)) { showFieldError(field, 'Please enter a valid phone number.'); return false; }
      if ((field.id === 'checkout' || field.id === 'eq-checkout') && val) {
        var cin = field.closest('form').querySelector('#checkin, #eq-checkin');
        if (cin && cin.value && val <= cin.value) { showFieldError(field, 'Check-out must be after check-in.'); return false; }
      }
      if (val) clearFieldError(field);
      return true;
    }
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        field.addEventListener('blur', function () { validateField(field); });
        field.addEventListener('input', function () { if (field.classList.contains('field-error')) validateField(field); });
      });
      form.addEventListener('submit', function (e) {
        var valid = true, first = null;
        form.querySelectorAll('input, select, textarea').forEach(function (f) {
          if (!validateField(f)) { valid = false; if (!first) first = f; }
        });
        if (!valid) { e.preventDefault(); first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    });

    /* ---------- Enquiry form: POST /api/enquiry, WhatsApp fallback ---------- */
    var eqForm = document.getElementById('enquiryForm');
    if (eqForm) {
      var pick = function (names) {
        for (var i = 0; i < names.length; i++) { var el = document.getElementById(names[i]); if (el) return el.value || ''; }
        return '';
      };
      var today = new Date().toISOString().split('T')[0];
      var ci = document.getElementById('eq-checkin') || document.getElementById('checkin');
      var co = document.getElementById('eq-checkout') || document.getElementById('checkout');
      if (ci) ci.min = today; if (co) co.min = today;
      if (ci && co) ci.addEventListener('change', function () { co.min = ci.value; });

      eqForm.addEventListener('submit', function (e) {
        if (e.defaultPrevented) return; // validation failed
        e.preventDefault();
        var data = {
          name: pick(['eq-name', 'name']), phone: pick(['eq-phone', 'phone']), email: pick(['eq-email', 'email']),
          checkin: pick(['eq-checkin', 'checkin']), checkout: pick(['eq-checkout', 'checkout']),
          guests: pick(['eq-guests', 'guests']), roomtype: pick(['eq-room', 'roomtype']), message: pick(['eq-message', 'message'])
        };
        var btn = eqForm.querySelector('button[type="submit"]');
        var label = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending…'; }
        var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } };

        var waMsg = 'Hello, I would like to enquire about a stay at Cauvery Resorts, Coorg.\n\n'
          + '*Name:* ' + data.name + '\n*Phone:* ' + data.phone + '\n'
          + (data.checkin ? '*Check-In:* ' + data.checkin + '\n' : '')
          + (data.checkout ? '*Check-Out:* ' + data.checkout + '\n' : '')
          + (data.guests ? '*Guests:* ' + data.guests + '\n' : '')
          + (data.roomtype ? '*Room:* ' + data.roomtype + '\n' : '')
          + (data.message ? '*Notes:* ' + data.message + '\n' : '')
          + '\nPlease confirm availability. Thank you!';
        var waUrl = 'https://wa.me/919449485133?text=' + encodeURIComponent(waMsg);

        fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (!res.success) throw new Error(res.error || 'failed');
            var ok = document.getElementById('formSuccess');
            eqForm.style.display = 'none';
            if (ok) { ok.hidden = false; ok.style.display = 'block'; }
          })
          .catch(function () {
            restore();
            var fb = eqForm.parentElement.querySelector('.enquiry-fallback');
            if (!fb) {
              fb = document.createElement('div'); fb.className = 'enquiry-fallback'; fb.setAttribute('role', 'alert');
              eqForm.insertAdjacentElement('afterend', fb);
            }
            fb.innerHTML = '<p>We could not send this online just now. You can send the same details on WhatsApp instead.</p>'
              + '<a class="btn btn-wa btn-sm" style="margin-top:.8rem" target="_blank" rel="noopener" href="' + waUrl + '"><i class="fab fa-whatsapp"></i> Send on WhatsApp</a>';
          });
      });
    }

    /* ---------- FAQ accordion (inner pages) ---------- */
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });

    /* ---------- Gallery filter ---------- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var gItems = document.querySelectorAll('.gallery-full [data-category]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        gItems.forEach(function (item) {
          item.style.display = (btn.dataset.filter === 'all' || item.dataset.category === btn.dataset.filter) ? '' : 'none';
        });
      });
    });

    /* ---------- Footer year ---------- */
    document.querySelectorAll('.footer-year,.footer-year-js,#footerYear').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Scroll progress ---------- */
    var bar = document.querySelector('.scroll-progress');
    if (bar) {
      var pTick = false;
      var prog = function () {
        pTick = false;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (total > 0 ? Math.min(window.scrollY / total, 1) : 0).toFixed(4) + ')';
      };
      window.addEventListener('scroll', function () { if (!pTick) { pTick = true; requestAnimationFrame(prog); } }, { passive: true }); prog();
    }

    /* ---------- Pause looping animations while offscreen ---------- */
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle('fx-paused', !e.isIntersecting); });
      });
      document.querySelectorAll('.trust-strip__track,.hero__mist,.stamp,.fab-wa').forEach(function (el) { pio.observe(el); });
    }

    /* ---------- Generic staggered reveal (class added by JS only, so no-JS stays visible) ---------- */
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var fxSel = '.room-card,.day-card,.review-card,.menu-card,.activity-card,.blog-card,.attraction-card,.temple-card,.x-card,.faq-home-item,.section-title';
      var fxIo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('fx-in');
          fxIo.unobserve(e.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
      var seen = new Map();
      document.querySelectorAll(fxSel).forEach(function (el) {
        if (el.closest('[data-aos],[data-reveal],.swiper,.hero') || el.hasAttribute('data-aos') || el.classList.contains('reveal-mask')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) return; // already in first view: leave alone
        var par = el.parentElement, n = seen.get(par) || 0; seen.set(par, n + 1);
        el.style.setProperty('--fd', Math.min(n, 5) * 80 + 'ms');
        el.classList.add('fx');
        fxIo.observe(el);
      });
    }

    /* ---------- WhatsApp popup + FAB ---------- */
    var waPopup = document.getElementById('waPopup') || document.querySelector('.wa-popup');
    var fabBtn = document.getElementById('fabWaBtn');
    var waClose = waPopup && waPopup.querySelector('.wa-popup__close');
    var openWa = function () { waPopup.classList.add('open'); if (fabBtn) fabBtn.setAttribute('aria-expanded', 'true'); };
    var closeWa = function () { waPopup.classList.remove('open'); if (fabBtn) fabBtn.setAttribute('aria-expanded', 'false'); };
    if (waPopup) {
      if (fabBtn && fabBtn.tagName === 'BUTTON') fabBtn.addEventListener('click', function (e) { e.stopPropagation(); waPopup.classList.contains('open') ? closeWa() : openWa(); });
      if (waClose) waClose.addEventListener('click', closeWa);
      document.addEventListener('click', function (e) { if (waPopup.classList.contains('open') && !waPopup.contains(e.target)) closeWa(); });
      if (!sessionStorage.getItem('waPopupShown')) {
        setTimeout(function () { openWa(); sessionStorage.setItem('waPopupShown', '1'); }, 8000);
      }
    }

    /* ---------- Cookie banner ---------- */
    var cookieBanner = document.getElementById('cookieBanner');
    var cookieAccept = document.getElementById('cookieAccept');
    if (cookieBanner && !localStorage.getItem('cookieAccepted')) setTimeout(function () { cookieBanner.classList.add('show'); }, 3000);
    if (cookieAccept) cookieAccept.addEventListener('click', function () { localStorage.setItem('cookieAccepted', '1'); cookieBanner.classList.remove('show'); });

    /* ---------- Share button ---------- */
    document.querySelectorAll('.share-btn[data-share]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var text = btn.dataset.share || document.title, url = location.href;
        if (navigator.share) navigator.share({ title: document.title, text: text, url: url }).catch(function () {});
        else window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank');
      });
    });

    /* ---------- Page-hero rotating backgrounds ---------- */
    document.querySelectorAll('.page-hero').forEach(function (hero) {
      var slides = hero.querySelectorAll('.page-hero__bg');
      if (!slides.length) return;
      slides[0].classList.add('active');
      if (slides.length < 2) return;
      var cur = 0;
      setInterval(function () {
        slides[cur].classList.remove('active'); cur = (cur + 1) % slides.length; slides[cur].classList.add('active');
      }, 5000);
    });

    /* ---------- Masonry gallery lightbox (gallery.html) ---------- */
    var mItems = document.querySelectorAll('.gallery-masonry-item[data-src]');
    if (mItems.length && lb && lbImg) {
      var mSrc = Array.prototype.map.call(mItems, function (el) { return el.dataset.src; });
      var mi = 0;
      var mShow = function (i) { mi = (i + mSrc.length) % mSrc.length; lbImg.src = mSrc[mi]; };
      var mClose = function () { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; };
      mItems.forEach(function (el, i) { el.addEventListener('click', function () { mShow(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }); });
      var g = function (s) { return lb.querySelector(s); };
      g('.lightbox-close') && g('.lightbox-close').addEventListener('click', mClose);
      g('.lightbox-prev') && g('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); mShow(mi - 1); });
      g('.lightbox-next') && g('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); mShow(mi + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) mClose(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') mClose(); if (e.key === 'ArrowLeft') mShow(mi - 1); if (e.key === 'ArrowRight') mShow(mi + 1);
      });
    }

    /* ---------- Swiper (hero + reviews) if present ---------- */
    if (typeof Swiper !== 'undefined') {
      if (document.querySelector('.hero-swiper')) {
        new Swiper('.hero-swiper', { effect: 'fade', fadeEffect: { crossFade: true }, loop: true, speed: 1600, allowTouchMove: false, autoplay: reduceMotion ? false : { delay: 6000, disableOnInteraction: false } });
      }
      if (document.querySelector('.reviews-swiper')) {
        new Swiper('.reviews-swiper', {
          slidesPerView: 1, spaceBetween: 28, loop: true,
          autoplay: reduceMotion ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
          pagination: { el: '.reviews-pagination', clickable: true },
          breakpoints: { 700: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
      }
    }

    /* ---------- Service worker ---------- */
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});

    /* ---------- Page transitions ---------- */
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(tel:|mailto:|http)/.test(href) || a.target === '_blank') return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var pt = document.getElementById('pageTrans');
        if (pt) { pt.classList.add('enter'); setTimeout(function () { location.href = href; }, 380); }
        else location.href = href;
      });
    });
    window.addEventListener('pageshow', function () {
      var pt = document.getElementById('pageTrans'); if (pt) pt.classList.remove('enter');
    });
  });
})();
