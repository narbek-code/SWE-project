// Shared interactions for SWE-201 pages
(() => {
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('closeModal');
  const openModalTriggers = document.querySelectorAll('[data-open-modal]');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('no-scroll');
  };

  window.openModal = openModal;

  openModalTriggers.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ===== QUOTES =====
  const quotes = [
    'Лучший способ предсказать будущее — создать его.',
    'Навыки важнее дипломов.',
    'Технологии меняют людей — а ты решаешь, в какую сторону.',
    'Учись сегодня — выбирай завтра.',
    'Команда сильнее любого алгоритма.',
    'Скорость важна, но качество важнее.',
  ];

  const quoteBox = document.getElementById('quote');
  const quoteBtn = document.getElementById('newQuote');

  const pickRandomQuote = (current) => {
    if (!quotes.length) return current || '';
    let next = quotes[Math.floor(Math.random() * quotes.length)];
    if (quotes.length > 1) {
      let guard = 0;
      while (next === current && guard < 6) {
        next = quotes[Math.floor(Math.random() * quotes.length)];
        guard++;
      }
    }
    return next;
  };

  const showQuote = () => {
    if (!quoteBox) return;
    const current = quoteBox.dataset.quoteValue || quoteBox.textContent.trim();
    const next = pickRandomQuote(current);
    quoteBox.style.opacity = '0';
    setTimeout(() => {
      quoteBox.textContent = next;
      quoteBox.dataset.quoteValue = next;
      quoteBox.style.opacity = '1';
    }, 180);
  };

  if (quoteBox) {
    quoteBox.style.transition = 'opacity 0.35s ease';
    showQuote();
    setInterval(showQuote, 9000);
  }

  if (quoteBtn) quoteBtn.addEventListener('click', showQuote);

  // ===== REVEAL =====
  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  // ===== SCHEDULE TODAY HIGHLIGHT =====
  const dayElements = document.querySelectorAll('[data-day]');
  if (dayElements.length) {
    const todayIndex = new Date().getDay() || 7; // 1-7, 7 = Sunday
    dayElements.forEach((dayEl) => dayEl.classList.remove('today'));
    const todayEl = Array.from(dayElements).find(
      (el) => Number(el.dataset.day) === todayIndex
    );
    if (todayEl) todayEl.classList.add('today');
  }

  // ===== ACTIVE NAV LINK =====
  const navLinks = document.querySelectorAll('nav a[href]');
  if (navLinks.length) {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === path) link.classList.add('active');
    });
  }

  // ===== SCHEDULE: TODAY BUTTON + TOAST =====
  const todayBtn = document.getElementById('todayBtn');
  const todayTarget = document.querySelector('.day.today');
  const toast = document.getElementById('toast');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  };

  todayBtn?.addEventListener('click', () => {
    if (todayTarget) {
      todayTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      showToast('Сегодняшний день не найден');
    }
  });
})();
