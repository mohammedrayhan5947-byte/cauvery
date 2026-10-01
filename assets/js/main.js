/* ============================================
   CAUVERY RESORTS — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (window.scrollY > 60) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu toggle ---------- */
  const toggle = document.querySelector('.navbar__toggle');
  const links  = document.querySelector('.navbar__links');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links?.classList.toggle('open');
    document.body.style.overflow = links?.classList.contains('open') ? 'hidden' : '';
  });

  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle?.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- AOS (Animate on Scroll) ---------- */
  const aosEls = document.querySelectorAll('[data-aos]');
  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.aosDelay || 0);
        setTimeout(() => e.target.classList.add('aos-animate'), delay);
        aosObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  aosEls.forEach(el => aosObserver.observe(el));

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el       = e.target;
      const end      = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0');
      const suffix   = el.dataset.suffix || '';
      const dur      = 1800;
      const step     = end / (dur / 16);
      let current    = 0;
      const tick = () => {
        current = Math.min(current + step, end);
        el.textContent = current.toFixed(decimals) + suffix;
        if (current < end) requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Lightbox ---------- */
  const overlay = document.querySelector('.lightbox-overlay');
  const lbImg   = overlay?.querySelector('img');
  const lbClose = overlay?.querySelector('.lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox || item.querySelector('img')?.src;
      if (src && lbImg) {
        lbImg.src = src;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeLb = () => {
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  };
  lbClose?.addEventListener('click', closeLb);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- Smooth active nav link ---------- */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Form validation (real-time + inline errors) ---------- */
  function showFieldError(field, msg) {
    field.classList.add('field-error');
    let err = field.parentElement.querySelector('.field-error-msg');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error-msg';
      field.parentElement.appendChild(err);
    }
    err.textContent = msg;
    err.style.display = 'block';
  }
  function clearFieldError(field) {
    field.classList.remove('field-error');
    field.classList.add('field-ok');
    const err = field.parentElement.querySelector('.field-error-msg');
    if (err) err.style.display = 'none';
  }
  function validateField(field) {
    const val = field.value.trim();
    if (field.hasAttribute('required') && !val) {
      const label = field.closest('.form-group')?.querySelector('label')?.textContent?.replace(' *','') || 'This field';
      showFieldError(field, label + ' is required.');
      return false;
    }
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showFieldError(field, 'Please enter a valid email address.');
      return false;
    }
    if (field.type === 'tel' && val && !/^[+\d\s\-]{7,15}$/.test(val)) {
      showFieldError(field, 'Please enter a valid phone number.');
      return false;
    }
    if (field.id === 'checkout' && val) {
      const cin = field.closest('form')?.querySelector('#checkin');
      if (cin && cin.value && val <= cin.value) {
        showFieldError(field, 'Check-out must be after check-in.');
        return false;
      }
    }
    if (val) clearFieldError(field);
    return true;
  }

  document.querySelectorAll('form[data-validate]').forEach(form => {
    // Real-time validation on blur
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('field-error')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      let valid = true;
      let firstInvalid = null;
      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (!valid) {
        e.preventDefault();
        firstInvalid?.focus();
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Gallery Filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-full [data-category]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ---------- Year in footer ---------- */
  document.querySelectorAll('.footer-year,.footer-year-js,#footerYear').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

/* ---------- WhatsApp chat popup ---------- */
  const waPopup = document.querySelector('.wa-popup');
  const waPopupClose = document.querySelector('.wa-popup__close');
  if (waPopup && !sessionStorage.getItem('waPopupSeen')) {
    setTimeout(() => {
      waPopup.classList.add('open');
      sessionStorage.setItem('waPopupSeen', '1');
    }, 10000);
  }
  waPopupClose?.addEventListener('click', () => waPopup?.classList.remove('open'));

  /* ---------- Image blur placeholder ---------- */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('img-blur');
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  /* ---------- Animated hero words ---------- */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    // Walk only text nodes so <br> and <em> tags are never touched
    const walk = (node) => {
      if (node.nodeType === 3) { // text node
        const span = document.createElement('span');
        span.innerHTML = node.textContent.replace(/(\S+)/g, (word) =>
          `<span class="hero__word" style="animation-delay:${(Math.random()*0.6+0.2).toFixed(2)}s">${word}</span>`
        );
        node.parentNode.replaceChild(span, node);
      } else if (node.nodeType === 1 && node.tagName !== 'SPAN') {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(heroTitle.childNodes).forEach(walk);
  }

  /* ---------- Share button ---------- */
  document.querySelectorAll('.share-btn[data-share]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const text = btn.dataset.share || document.title;
      const url  = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, text, url }).catch(() => {});
      } else {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(waUrl, '_blank');
      }
    });
  });

  /* ---------- Cookie Banner ---------- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  if (cookieBanner && !localStorage.getItem('cookieAccepted')) {
    setTimeout(() => cookieBanner.classList.add('show'), 3000);
  }
  cookieAccept?.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted', '1');
    cookieBanner?.classList.remove('show');
  });

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  /* ---------- Page-hero rotating backgrounds ---------- */
  document.querySelectorAll('.page-hero').forEach(hero => {
    const slides = hero.querySelectorAll('.page-hero__bg');
    if (slides.length < 2) {
      if (slides.length === 1) slides[0].classList.add('active');
      return;
    }
    let current = 0;
    slides[0].classList.add('active');
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  });

  /* ---------- Masonry gallery lightbox ---------- */
  const masonryItems = document.querySelectorAll('.gallery-masonry-item[data-src]');
  if (masonryItems.length) {
    const masonrySrcs = Array.from(masonryItems).map(el => el.dataset.src);
    let mIdx = 0;
    const mOverlay = document.getElementById('lightbox') || document.querySelector('.lightbox-overlay');
    const mImg     = document.getElementById('lbImg') || mOverlay?.querySelector('img');
    const mClose   = document.getElementById('lbClose') || mOverlay?.querySelector('.lightbox-close');
    const mPrev    = document.getElementById('lbPrev') || mOverlay?.querySelector('.lightbox-prev');
    const mNext    = document.getElementById('lbNext') || mOverlay?.querySelector('.lightbox-next');
    const openM = i => { mIdx=i; if(mImg) mImg.src=masonrySrcs[mIdx]; mOverlay?.classList.add('open'); document.body.style.overflow='hidden'; };
    const closeM = () => { mOverlay?.classList.remove('open'); document.body.style.overflow=''; if(mImg) mImg.src=''; };
    masonryItems.forEach((el, i) => el.addEventListener('click', () => openM(i)));
    mClose?.addEventListener('click', closeM);
    mOverlay?.addEventListener('click', e => { if (e.target === mOverlay) closeM(); });
    mPrev?.addEventListener('click', e => { e.stopPropagation(); mIdx=(mIdx-1+masonrySrcs.length)%masonrySrcs.length; if(mImg) mImg.src=masonrySrcs[mIdx]; });
    mNext?.addEventListener('click', e => { e.stopPropagation(); mIdx=(mIdx+1)%masonrySrcs.length; if(mImg) mImg.src=masonrySrcs[mIdx]; });
    document.addEventListener('keydown', e => {
      if (!mOverlay?.classList.contains('open')) return;
      if (e.key==='Escape') closeM();
      if (e.key==='ArrowLeft') { mIdx=(mIdx-1+masonrySrcs.length)%masonrySrcs.length; if(mImg) mImg.src=masonrySrcs[mIdx]; }
      if (e.key==='ArrowRight') { mIdx=(mIdx+1)%masonrySrcs.length; if(mImg) mImg.src=masonrySrcs[mIdx]; }
    });
  }

});


/* ---------- Footer year ---------- */
document.querySelectorAll('#footerYear').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

/* ---------- Page transitions ---------- */
document.querySelectorAll('a[href]').forEach(function (a) {
  var href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http') || a.target === '_blank') return;
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var pt = document.getElementById('pageTrans');
    if (pt) { pt.classList.add('enter'); setTimeout(function () { window.location.href = href; }, 380); }
    else { window.location.href = href; }
  });
});
