(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introScreen = document.getElementById('introScreen');
  const introText = document.getElementById('introText');

  function finishIntro() {
    document.body.classList.add('ready');
    if (introScreen) introScreen.classList.add('is-hidden');
  }

  function cameFromPage2() {
    const ref = document.referrer;
    if (!ref) return false;
    try {
      return new URL(ref).pathname.endsWith('/page2.html');
    } catch (_) {
      return ref.includes('page2.html');
    }
  }

  if (introScreen && introText) {
    const skipIntro = sessionStorage.getItem('snake-skip-intro');
    if (skipIntro) sessionStorage.removeItem('snake-skip-intro');
    if (skipIntro || cameFromPage2() || prefersReducedMotion) {
      finishIntro();
    } else {
      requestAnimationFrame(() => {
        introText.classList.add('visible');
      });
      setTimeout(() => {
        introText.classList.remove('visible');
        introText.style.opacity = '0';
        introScreen.style.opacity = '0';
      }, 2200);
      setTimeout(finishIntro, 2800);
    }
  } else {
    document.body.classList.add('ready');
  }

  // Mobile menu
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // Testimonials carousel
  const track = document.getElementById('track');
  const dotsContainer = document.getElementById('dots');
  if (track && dotsContainer) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoTimer = null;
    let startX = 0, currentX = 0, isDragging = false, dragStartTranslate = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', '跳转到第 ' + (i + 1) + ' 条评价');
      dot.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function goTo(i) {
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    function next() { goTo(current + 1); }
    function startTimer() { if (!prefersReducedMotion) autoTimer = setInterval(next, 4500); }
    function resetTimer() { clearInterval(autoTimer); startTimer(); }

    track.addEventListener('pointerdown', e => {
      isDragging = true;
      startX = e.clientX;
      currentX = startX;
      dragStartTranslate = -current * 100;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
      resetTimer();
    });
    track.addEventListener('pointermove', e => {
      if (!isDragging) return;
      currentX = e.clientX;
      const delta = ((currentX - startX) / track.clientWidth) * 100;
      track.style.transform = 'translateX(' + (dragStartTranslate + delta) + '%)';
    });
    track.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      const delta = currentX - startX;
      if (delta < -60) goTo(current + 1);
      else if (delta > 60) goTo(current - 1);
      else goTo(current);
    });

    startTimer();
  }

  // Subscribe
  const subForm = document.getElementById('subForm');
  const subBtn = document.getElementById('subBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  if (subForm && subBtn) {
    subForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = subForm.querySelector('input');
      if (!input.value || !input.value.includes('@')) {
        showToast('请输入有效的邮箱地址。');
        return;
      }
      subBtn.disabled = true;
      const original = subBtn.innerHTML;
      subBtn.innerHTML = '<span class="spinner"></span><span>订阅中</span>';
      setTimeout(() => {
        subBtn.innerHTML = original;
        subBtn.disabled = false;
        input.value = '';
        showToast('订阅成功，感谢关注，欢迎常来。');
      }, 1600);
    });
  }

  // 主页「看我的作品」按钮平滑滚动到「收藏与热爱」区块
  const watchBtn = document.getElementById('watchBtn');
  if (watchBtn) {
    watchBtn.addEventListener('click', () => {
      const target = document.getElementById('about');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 主页导航「回到顶部」
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 主页「联系我」弹窗
  const contactBtn = document.getElementById('contactBtn');
  const contactModal = document.getElementById('contactModal');
  if (contactBtn && contactModal) {
    function openContactModal() {
      contactModal.classList.add('open');
      contactModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeContactModal() {
      contactModal.classList.remove('open');
      contactModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    contactBtn.addEventListener('click', e => {
      e.preventDefault();
      openContactModal();
    });
    contactModal.querySelectorAll('[data-close-contact]').forEach(el => {
      el.addEventListener('click', closeContactModal);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && contactModal.classList.contains('open')) closeContactModal();
    });
  }

  // 首页「应用开发」卡片整卡可点击跳转 page2
  const devCard = document.querySelector('.feature-card.dev-card');
  if (devCard) {
    devCard.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      window.location.href = 'page2.html';
    });
  }

  // 首页「旅行」卡片整卡可点击跳转 page6
  const travelCard = document.querySelector('.feature-card.travel-card-link');
  if (travelCard) {
    travelCard.style.cursor = 'pointer';
    travelCard.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      window.location.href = 'page6.html';
    });
  }

  // Screenshot lightbox for page3 marquee
  const marqueeImages = document.querySelectorAll('.marquee-group img');
  if (marqueeImages.length) {
    let lightbox = null;
    let lightboxImg = null;

    function openLightbox(src, alt) {
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', '图片预览');
        lightbox.innerHTML = '<button class="lightbox-close" aria-label="关闭预览"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="M6 6l12 12"></path></svg></button><img class="lightbox-img" alt="">';
        document.body.appendChild(lightbox);
        lightboxImg = lightbox.querySelector('.lightbox-img');
        lightbox.addEventListener('click', e => {
          if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
        });
        document.addEventListener('keydown', e => {
          if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
        });
      }
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      // force reflow for transition
      void lightbox.offsetWidth;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    marqueeImages.forEach(img => {
      img.addEventListener('click', () => openLightbox(img.currentSrc || img.src, img.alt));
    });
  }
})();
