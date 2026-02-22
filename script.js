// Shared interactions for SWE-201 pages + single Firebase init
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUD1TVtWZxas9SVn75PuMmwi2HIu-hYoE",
  authDomain: "cyber-university-f7b8c.firebaseapp.com",
  projectId: "cyber-university-f7b8c",
  storageBucket: "cyber-university-f7b8c.firebasestorage.app",
  messagingSenderId: "603220099956",
  appId: "1:603220099956:web:dd2ec21480ad95f1432221",
  measurementId: "G-VJJNFLDP85"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Экспортируем для страниц и оставляем доступ в window для простых скриптов
window.firebaseCtx = window.firebaseCtx || { app, auth, db, storage };
export { app, auth, db, storage };

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

// ===== ADMIN PAGE (pending users + avatar upload) =====
async function initAdminPage() {
  const cards = document.getElementById('cards');
  if (!cards) return; // не на admin.html

  const photoInput = document.getElementById('photoInput');
  const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarStatus = document.getElementById('avatarStatus');
  const IMGBB_KEY = '268730494ca8bb37c4e02e7c37e2df0a';
  let currentUser = null;

  const [{ onAuthStateChanged }, { collection, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc }] =
    await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js'),
    ]);

  const setAvatarStatus = (msg, ok = true) => {
    if (!avatarStatus) return;
    avatarStatus.textContent = msg;
    avatarStatus.style.color = ok ? '#6cf5ff' : '#ff4f6a';
  };

  const showLoader = () => {
    cards.innerHTML = '<div class="loader"><div class="spinner"></div>Загружаем заявки...</div>';
  };

  const showEmpty = () => {
    cards.innerHTML = '<div class="empty">Нет заявок со статусом pending.</div>';
  };

  const showError = (text) => {
    cards.innerHTML = `<div class="error">${text}</div>`;
  };

  const uploadToImgBB = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) throw new Error('Не удалось загрузить изображение');
    const data = await res.json();
    return data?.data?.url;
  };

  const handlePhotoChange = async (file) => {
    if (!file) return;
    if (!currentUser) {
      setAvatarStatus('Нужно войти', false);
      return;
    }
    try {
      setAvatarStatus('Загружаем...');
      const url = await uploadToImgBB(file);
      if (!url) throw new Error('ImgBB вернул пустой URL');

      await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url });
      if (avatarPreview) avatarPreview.src = url;
      setAvatarStatus('Аватар обновлён!');
    } catch (err) {
      console.error(err);
      setAvatarStatus(err.message || 'Ошибка загрузки', false);
    }
  };

  const createCard = (user) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.uid = user.id;

    const img = document.createElement('img');
    img.src = user.photoURL || 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg';
    img.alt = user.displayName || 'User';
    img.width = 64;
    img.height = 64;
    img.style.borderRadius = '12px';
    img.style.objectFit = 'cover';
    img.style.background = '#1b2239';

    const name = document.createElement('p');
    name.className = 'name';
    name.textContent = user.displayName || 'Без имени';

    const email = document.createElement('p');
    email.className = 'muted';
    email.textContent = user.email || '—';

    const role = document.createElement('p');
    role.className = 'muted';
    role.textContent = `Роль: ${user.role || 'pending'}`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const approveBtn = document.createElement('button');
    approveBtn.className = 'approve';
    approveBtn.textContent = '✅ Approve';

    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'approve';
    rejectBtn.style.background = 'linear-gradient(135deg, #ff4f6a, #ff9a5f)';
    rejectBtn.textContent = '❌ Reject';

    approveBtn.onclick = async () => {
      approveBtn.disabled = true;
      rejectBtn.disabled = true;
      try {
        await updateDoc(doc(db, 'users', user.id), { role: 'student' });
        article.remove();
        if (!cards.childElementCount) showEmpty();
      } catch (err) {
        console.error('Ошибка апрува:', err);
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        alert('Не удалось утвердить пользователя. Подробности в консоли.');
      }
    };

    rejectBtn.onclick = async () => {
      approveBtn.disabled = true;
      rejectBtn.disabled = true;
      try {
        await deleteDoc(doc(db, 'users', user.id));
        article.remove();
        if (!cards.childElementCount) showEmpty();
      } catch (err) {
        console.error('Ошибка отклонения:', err);
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        alert('Не удалось отклонить пользователя. Подробности в консоли.');
      }
    };

    actions.append(approveBtn, rejectBtn);
    article.append(img, name, email, role, actions);
    return article;
  };

  const loadPendingUsers = async () => {
    showLoader();
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'pending'));
      const snap = await getDocs(q);
      cards.innerHTML = '';
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        cards.appendChild(createCard({ id: docSnap.id, ...data }));
      });
      if (!cards.childElementCount) showEmpty();
    } catch (err) {
      console.error('Ошибка загрузки pending пользователей:', err);
      showError('Не удалось загрузить заявки');
    }
  };

  const requireAdmin = async (user) => {
    if (!user) {
      location.replace('login.html');
      return null;
    }

    const snap = await getDoc(doc(db, 'users', user.uid));
    const role = snap.exists() ? snap.data().role : null;

    if (role !== 'admin') {
      location.replace('403.html');
      return null;
    }

    return role;
  };

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
      if (photoInput) photoInput.disabled = true;
      if (uploadAvatarBtn) uploadAvatarBtn.disabled = true;
      location.replace('login.html');
      return;
    }

    if (photoInput) photoInput.disabled = false;
    if (uploadAvatarBtn) uploadAvatarBtn.disabled = false;

    try {
      const role = await requireAdmin(user);
      if (!role) return;
      await loadPendingUsers();
    } catch (err) {
      console.error('Ошибка защиты страницы:', err);
      location.replace('403.html');
    }
  });

  if (photoInput) {
    photoInput.addEventListener('change', (e) => handlePhotoChange(e.target.files?.[0]));
  }
  if (uploadAvatarBtn) {
    uploadAvatarBtn.addEventListener('click', () => {
      const file = photoInput?.files?.[0];
      handlePhotoChange(file);
    });
  }
}

initAdminPage();
