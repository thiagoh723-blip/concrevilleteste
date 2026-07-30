const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
const hero = document.querySelector('.hero');
const revealItems = document.querySelectorAll('.section, .service-card, .feature-card, .gallery-card, .contact-card, .contact-form');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
});

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 30;
  header.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('show', window.scrollY > 400);

  if (hero) {
    const blur = Math.min(16, 1 + window.scrollY / 30);
    hero.style.setProperty('--hero-blur', `${blur}px`);
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const smoothLinks = document.querySelectorAll('a[href^="#"]');

smoothLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.hash !== '') {
      event.preventDefault();
      const target = document.querySelector(link.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
});

revealItems.forEach((item) => observer.observe(item));

const lazyImages = document.querySelectorAll('img[loading="lazy"]');
const imageObserver = new IntersectionObserver((entries, imageObserver) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
    }
    imageObserver.unobserve(img);
  });
}, {
  rootMargin: '100px 0px',
  threshold: 0.01,
});

lazyImages.forEach((img) => imageObserver.observe(img));

// Concrete-fill animation on mobile for 'Solicitar Orçamento' buttons only
const mobileFillButtons = document.querySelectorAll('a.btn-primary[href="#contato"]');

mobileFillButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const href = btn.getAttribute('href');
    if (!href) return;

    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    if (!isMobile) {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    if (btn.classList.contains('filling')) return;

    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
    }

    btn.classList.add('filling');
    const fillDuration = 1400; // match CSS animation

    setTimeout(() => {
      btn.classList.remove('filling');
      btn.classList.add('filled');
      setTimeout(() => {
        btn.classList.remove('filled');
        setTimeout(() => {
          window.location.href = href;
        }, 60);
      }, 180);
    }, fillDuration);
  });
});
