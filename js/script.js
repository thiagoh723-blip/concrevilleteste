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
const mobileFillButtons = document.querySelectorAll('a.btn-primary[href="#cta"]');

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

// --- Player de implantação (play / pause / mute) ---
const initDeploymentPlayer = () => {
  const playBtn = document.querySelector('.deployment-play');
  const video = document.getElementById('bombaVideo');
  const wrap = video ? video.closest('.video-wrap') : null;
  const pauseBtn = document.querySelector('.deployment-pause');
  const muteBtn = document.querySelector('.deployment-mute');

  if (!playBtn || !video) return;

  // Ajusta o container para a proporção real do vídeo (evita barras pretas)
  const setAspectFromMetadata = () => {
    if (!wrap || !video.videoWidth || !video.videoHeight) return;
    // Define aspect-ratio igual à proporção intrínseca do vídeo
    try {
      wrap.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      // remove qualquer padding-top fallback prévio
      wrap.style.paddingTop = '';
      // não forçar uma largura fixa quando o browser suporta aspect-ratio — deixe o layout escalar responsivamente
      wrap.style.width = '';
      wrap.style.maxWidth = '100%';
    } catch (e) {
      // fallback: aplicar padding-top via CSS se browser não suportar aspect-ratio
      const padding = (video.videoHeight / video.videoWidth) * 100;
      wrap.style.aspectRatio = '';
      wrap.style.paddingTop = padding + '%';
      // limite a largura ao espaço disponível para evitar overflow; usa largura intrínseca ou a largura do container
      const parent = wrap.parentElement || document.querySelector('.deployment-media') || document.body;
      const parentAvailable = parent.clientWidth || Math.min(window.innerWidth, 880);
      const desired = Math.min(video.videoWidth, parentAvailable);
      wrap.style.width = desired + 'px';
      wrap.style.maxWidth = '100%';
    }
  };

  if (video.readyState >= 1) setAspectFromMetadata(); else video.addEventListener('loadedmetadata', setAspectFromMetadata);

  playBtn.addEventListener('click', () => {
    video.muted = false;
    video.play().catch(() => {});
    const onPlaying = () => {
      if (wrap) wrap.classList.add('playing');
      if (pauseBtn) { pauseBtn.textContent = 'Pausar'; pauseBtn.setAttribute('aria-pressed','false'); }
      if (muteBtn) { muteBtn.textContent = video.muted ? 'Som' : 'Sem som'; muteBtn.setAttribute('aria-pressed', String(!video.muted)); }
      video.removeEventListener('playing', onPlaying);
    };
    video.addEventListener('playing', onPlaying);
  });

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (video.paused) { video.play(); pauseBtn.textContent = 'Pausar'; pauseBtn.setAttribute('aria-pressed','false'); }
      else { video.pause(); pauseBtn.textContent = 'Continuar'; pauseBtn.setAttribute('aria-pressed','true'); }
    });
  }

  if (muteBtn) {
    muteBtn.textContent = video.muted ? 'Som' : 'Sem som';
    muteBtn.setAttribute('aria-pressed', String(!video.muted));
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.textContent = video.muted ? 'Som' : 'Sem som';
      muteBtn.setAttribute('aria-pressed', String(!video.muted));
    });
  }

  video.addEventListener('pause', () => { if (wrap) wrap.classList.remove('playing'); if (pauseBtn) { pauseBtn.textContent = 'Continuar'; pauseBtn.setAttribute('aria-pressed','true'); } });
  video.addEventListener('play', () => { if (wrap) wrap.classList.add('playing'); if (pauseBtn) { pauseBtn.textContent = 'Pausar'; pauseBtn.setAttribute('aria-pressed','false'); } });

  // Permite alternar play/pause ao clicar na área do vídeo (ignora cliques nos botões)
  if (wrap) {
    wrap.addEventListener('click', (e) => {
      // se o clique for em um botão (play/pause/mute), ignore aqui para não duplicar ações
      if (e.target.closest('button')) return;
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDeploymentPlayer); else initDeploymentPlayer();
