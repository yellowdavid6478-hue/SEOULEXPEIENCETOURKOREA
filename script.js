(() => {
  'use strict';

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const toTopBtn = document.getElementById('toTop');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    toTopBtn.classList.toggle('visible', window.scrollY > 480);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  /* ---------- Hero image fallback ----------
     images/hero.jpg 파일이 없거나 로드에 실패하면 깨진 이미지 아이콘 대신
     미리 준비된 그라데이션 + 스카이라인 배경을 자동으로 보여줍니다. */
  const heroSection = document.querySelector('.hero');
  const heroImg = document.getElementById('heroImg');

  const showHeroFallback = () => heroSection.classList.add('no-hero-image');

  if (heroImg) {
    if (heroImg.complete) {
      if (heroImg.naturalWidth === 0) showHeroFallback();
    } else {
      heroImg.addEventListener('error', showHeroFallback);
    }
  }

  /* ---------- Smooth-scroll offset for sticky header on in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Scroll-reveal for cards / reviews ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion (single-open, animated) ---------- */
  const accordion = document.getElementById('accordion');
  if (accordion) {
    const triggers = accordion.querySelectorAll('.accordion-trigger');

    const closePanel = (trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      panel.style.maxHeight = null;
    };
    const openPanel = (trigger) => {
      trigger.setAttribute('aria-expanded', 'true');
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      panel.style.maxHeight = panel.scrollHeight + 'px';
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        triggers.forEach((t) => { if (t !== trigger) closePanel(t); });
        isOpen ? closePanel(trigger) : openPanel(trigger);
      });
    });

    // Keep open panel sized correctly if fonts/layout shift on resize
    window.addEventListener('resize', () => {
      triggers.forEach((trigger) => {
        if (trigger.getAttribute('aria-expanded') === 'true') openPanel(trigger);
      });
    });
  }

  /* ---------- Booking form validation (front-end only demo) ---------- */
  const form = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');

  const validators = {
    fullName: (v) => v.trim().length >= 2 || '이름을 입력해주세요.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || '올바른 이메일 주소를 입력해주세요.',
    phone: (v) => /^[+\d][\d\s-]{6,}$/.test(v.trim()) || '올바른 연락처를 입력해주세요.',
    tourDate: (v) => {
      if (!v) return '날짜를 선택해주세요.';
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const chosen = new Date(v + 'T00:00:00');
      return chosen >= today || '오늘 이후의 날짜를 선택해주세요.';
    },
    guests: (v) => (Number(v) >= 1 && Number(v) <= 20) || '인원은 1명에서 20명 사이로 입력해주세요.',
  };

  const showFieldError = (name, message) => {
    const input = form.elements[name];
    const errorEl = document.getElementById('err-' + name);
    input.closest('.field').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      Object.keys(validators).forEach((name) => {
        const value = form.elements[name].value;
        const result = validators[name](value);
        if (result === true) {
          showFieldError(name, '');
        } else {
          isValid = false;
          showFieldError(name, result);
          if (!firstInvalid) firstInvalid = form.elements[name];
        }
      });

      if (!isValid) {
        formStatus.textContent = '입력하신 내용을 다시 확인해주세요.';
        formStatus.className = 'form-status error';
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // GitHub Pages는 기본적으로 서버가 없어 실제 전송이 이루어지지 않습니다.
      // 실제 예약 접수를 받으려면 Formspree, EmailJS 같은 서비스와 연동해주세요.
      formStatus.textContent = `${form.elements.fullName.value.trim().split(' ')[0]}님, 예약 신청이 접수되었습니다! 24시간 이내에 이메일로 확인해 드릴게요.`;
      formStatus.className = 'form-status success';
      form.reset();
      form.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));
    });

    // Clear individual field errors as the person corrects them
    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener('input', () => {
        const result = validators[name](input.value);
        if (result === true) showFieldError(name, '');
      });
    });
  }
})();
