// app.js — v12.2 (Навчання з вкладками: Результати / Домашки / Розклад / Портфоліо)
(function () {
  // Заборона зуму (pinch / double-tap) у встановленій апці
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  // Працюємо лише коли додано на ДГ
  const INSTALLED_ONLY = true;
  const IS_STANDALONE =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (INSTALLED_ONLY && !IS_STANDALONE) {
    document.getElementById('app').innerHTML = `
      <div class="gate">
        <div class="box">
          <h2>Додай «Мрію» на початковий екран</h2>
          <div class="steps">
            <ol>
              <li>Відкрий у Safari воробець хуй</li>
              <li>Поділитись → <b>Додати на початковий екран</b></li>
            </ol>
          </div>
        </div>
      </div>`;
    return;
  }

  // SW для офлайна
  if ('serviceWorker' in navigator && IS_STANDALONE) {
    window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js'));
  }

  // --------------------------------------
  // Іконки таббару
  // --------------------------------------
  const icons = {
    home: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    id: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/><circle cx="9" cy="12" r="2.5" stroke="white" stroke-width="2"/><path d="M14 10h5M14 13h5M14 16h3" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
  };

  // --------------------------------------
  // СТАН
  // --------------------------------------
  let state = 'learning';            // 'home' | 'learning' | 'media' | 'menu'
  let learningTab = 'results';       // 'results' | 'homework' | 'schedule' | 'portfolio'

  window.setState = (s) => { state = s; render(); };
  window.setLearningTab = (t) => { learningTab = t; render(); };

  // --------------------------------------
  // UI Блоки
  // --------------------------------------
  function headerBlock(title) {
    const today = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
    const weekday = new Date().toLocaleDateString('uk-UA', { weekday: 'long' });
    return `<div class="header">
      <div class="greeting">${title}</div>
      <div class="dateRow">
        <div class="dateBtn">‹</div>
        <div class="dateText">${today}<br><span style="opacity:.85;text-transform:capitalize">${weekday}</span></div>
        <div class="dateBtn">›</div>
      </div>
    </div>`;
  }

  function bottomNav(active) {
    return `<div class="navWrap">
      <div class="navShadow"></div>
      <nav class="nav">
        <a class="tab ${active === 'home' ? 'active' : ''}" onclick="event.preventDefault();setState('home')">${icons.home}<span>Головна</span></a>
        <a class="tab ${active === 'learning' ? 'active' : ''}" onclick="event.preventDefault();setState('learning')">${icons.id}<span>Навчання</span></a>
        <a class="tab ${active === 'media' ? 'active' : ''}" onclick="event.preventDefault();setState('media')">${icons.eye}<span>Цікаве</span></a>
        <a class="tab ${active === 'menu' ? 'active' : ''}" onclick="event.preventDefault();setState('menu')">${icons.menu}<span>Меню</span></a>
      </nav>
    </div>`;
  }

  // Верхній саб-бар лише для «Навчання»
  function subnavLearning(activeTab) {
    const tabs = [
      { id: 'results', label: 'Результати' },
      { id: 'homework', label: 'Домашки' },
      { id: 'schedule', label: 'Розклад' },
      { id: 'portfolio', label: 'Портфоліо' }
    ];
    return `<div class="subnavWrap">
      <div class="subnavBg"></div>
      <div class="subnav">
        ${tabs.map(t => `
          <button class="pill ${activeTab === t.id ? 'active' : ''}"
            onclick="event.preventDefault(); setLearningTab('${t.id}')">${t.label}</button>`).join('')}
      </div>
    </div>`;
  }

  // Кільцева діаграма (для «Відвідування»)
  function donutSVG(pct) {
    const r = 30, c = 2 * Math.PI * r, off = c * (1 - pct);
    return `<svg class="donut" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#e8eefc" stroke-width="10"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#2a64ff" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      <text x="40" y="46" text-anchor="middle" font-size="18" font-weight="800" fill="#0b1221">${Math.round(pct * 100)}%</text>
    </svg>`;
  }

  // Картки «Динаміка»
  function dynCards() {
    const list = (title) => `
      <div class="dynCard dynWhite">
        <h3>${title}</h3>
        <div class="muted">Наразі недостатньо оцінок, щоб вирахувати динаміку</div>
        <div class="list">
          ${[['Громадянська освіта', '11,0'], ['Географія', '11,0'], ['Інформатика', '10,0']].map(([n, val]) => `
          <div class="row">
            <div>
              <div style="font-weight:800;font-size:20px">${n}</div>
              <div class="muted">Сер. бал за семестр</div>
            </div>
            <div class="grade">${val}</div>
          </div>`).join('')}
        </div>
      </div>`;

    const card1 = `
      <div class="dynCard dynBlue">
        <h3>Час домашки настав</h3>
        <div class="bigRow">
          <div style="font-size:46px">🔥</div>
          <div class="bigNum">0</div>
        </div>
        <div class="muted" style="color:#e9f0ff;font-size:18px">Відмічай виконані завдання і <br>рухайся до власного рекорду</div>
        <div class="blob"></div>
      </div>`;

    const card2 = list('Чудова робота');
    const card3 = list('Зверни увагу');

    const card4 = `
      <div class="dynCard dynWhite">
        <h3>Відвідування</h3>
        <div class="muted" style="margin-top:-2px">За останні 14 днів</div>
        <div style="display:flex;gap:12px;align-items:center;margin-top:12px">
          ${donutSVG(0.88)}
          <div>
            <div style="font-weight:800;font-size:20px">Відвідано<br>61 з 69 уроків</div>
          </div>
        </div>
        <div style="margin-top:14px;font-weight:800">Пропуски</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="muted">16.09 Вт</div>
          <a href="#" style="color:#1a55ff;font-weight:800;text-decoration:none">8 з 8 уроків</a>
        </div>
      </div>`;

    return card1 + card2 + card3 + card4;
  }

  // -------- Контент вкладок «Навчання» --------
  function viewResults() {
    return `
      <div class="section"><h3>Динаміка</h3></div>
      <div class="section"><div class="hScroll">${dynCards()}</div></div>
    `;
  }

  function homeworkDay(title, items) {
    return `
      <div class="bigCard" style="margin:14px 16px">
        <div style="font-weight:800; font-size:18px; margin-bottom:10px">${title}</div>
        ${items.length ? items.map(it => `
          <div style="background:#fff; color:#0b1221; border-radius:18px; padding:16px; box-shadow:0 10px 24px rgba(13,34,79,.14); margin:12px 0">
            <div style="display:flex; align-items:center; gap:12px">
              <div style="width:34px; height:34px; border-radius:12px; background:#eaf1ff"></div>
              <div>
                <div style="font-weight:800; font-size:18px">${it.subject}</div>
                <div style="color:#1a55ff; font-weight:800">${it.links.map(l => `<a href="#" style="color:#1a55ff; text-decoration:none">${l}</a>`).join(', ')}</div>
              </div>
            </div>
          </div>`).join('') :
          `<div style="border:2px solid rgba(255,255,255,.45); border-radius:20px; padding:18px; text-align:center; opacity:.95">
            Поки немає домашки
          </div>`
        }
      </div>`;
  }
  function viewHomework() {
    const fri = [
      { subject: 'Алгебра', links: ['Впр. 1.11', '1.12', '1.14'] },
      { subject: 'Геометрія', links: ['Впр. 29.11'] }
    ];
    const sat = [];
    const sun = [];
    return `
      <div class="section"><div class="grid" style="grid-template-columns:1fr; gap:0">
        ${homeworkDay('🔥 19 вересня, п’ятниця', fri)}
        ${homeworkDay('20 вересня, субота', sat)}
        ${homeworkDay('21 вересня, неділя', sun)}
      </div></div>
    `;
  }

  function lessonRow(color, name, time) {
    const dot = `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${color};margin-right:10px"></span>`;
    return `<div style="display:flex; align-items:baseline; gap:10px; margin:10px 0">
      <div style="min-width:42px; text-align:right; color:#5d6b81; font-weight:800">${time.split('-')[0]}</div>
      <div>${dot}<span style="font-weight:900">${name}</span><div style="color:#1a55ff; font-weight:800">${time}</div></div>
    </div>`;
  }
  function daySchedule(dayLabel, lessons) {
    return `
      <div class="card" style="border-radius:18px; padding:18px; margin:12px 16px; box-shadow:0 10px 24px rgba(13,34,79,.14)">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px">
          <div style="width:46px; height:34px; border-radius:12px; background:#eaf1ff; display:grid; place-items:center; font-weight:800">${dayLabel.split(' ')[0]}</div>
          <div style="font-weight:900; font-size:18px">${dayLabel}</div>
        </div>
        ${lessons.map(l => lessonRow(l.color, l.name, l.time)).join('')}
      </div>`;
  }
  function viewSchedule() {
    const mon = [
      { color: '#7ad0ff', name: 'Алгебра', time: '8:20 - 9:05' },
      { color: '#ffd56a', name: 'Українська мова', time: '9:15 - 10:00' },
      { color: '#ffd56a', name: 'Українська мова', time: '10:20 - 11:05' },
      { color: '#ff9b85', name: 'Історія України', time: '11:25 - 12:10' },
      { color: '#ffd56a', name: 'Хімія', time: '12:20 - 13:05' },
      { color: '#ff9b85', name: 'Громадянська освіта', time: '13:15 - 14:00' },
      { color: '#ffd56a', name: 'Географія', time: '14:10 - 14:55' },
      { color: '#ffd56a', name: 'Фізика', time: '15:00 - 15:45' }
    ];
    return `
      <div class="section">
        <div class="bigCard" style="text-align:center">
          <div style="font-weight:800">14.09 Нд</div>
          <div style="opacity:.9">Сьогодні немає уроків</div>
        </div>
      </div>
      ${daySchedule('15.09 Пн', mon)}
    `;
  }

  function viewPortfolio() {
    return `
      <div class="bigCard" style="margin:16px">
        <div style="height:120px;border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.22),rgba(255,255,255,.10));border:1px solid rgba(255,255,255,.22);margin-bottom:16px;position:relative;overflow:hidden">
          <div style="position:absolute;left:12px;top:20px;width:64px;height:42px;border-radius:12px;background:#eaf1ff"></div>
          <div style="position:absolute;left:82px;top:36px;width:64px;height:42px;border-radius:12px;background:#eaf1ff"></div>
        </div>
        <div style="text-align:center; font-weight:900; font-size:22px">Табелів чи свідоцтв поки немає</div>
        <div style="text-align:center; opacity:.95; margin-top:8px">
          Вони з’являться, щойно класний керівник або керівниця надішле результати
        </div>
      </div>
    `;
  }

  // -------- Інші екрани (як у v12.1) --------
  function viewHome() {
    return headerBlock('Головна') + `<div class="bigCard"><h2>Сьогодні вихідний</h2></div>`;
  }
  function viewMedia() {
    const cards = [
      { title: 'Рефлексія як інструмент самопізнання і кра...', tag: 'рефлексія', meta: '2:53' },
      { title: 'Інклюзивність', tag: 'Інклюзивність', meta: '4 епізоди' },
      { title: 'Дія для...', tag: 'Дія', meta: '1:20' }
    ];
    return headerBlock('Цікаве') + `
      <div class="section"><h3>Контент</h3></div>
      <div class="section"><div class="grid">
        ${cards.map(c => `
          <div class="card">
            <div class="badge">${c.tag}</div>
            <div style="height:84px;border-radius:12px;background:#e8eefc;margin:8px 0"></div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-weight:800">${c.title}</div>
              <div style="font-size:12px;color:#5d6b81">${c.meta}</div>
            </div>
          </div>`).join('')}
      </div></div>`;
  }
  function viewMenu() {
    const items = ['Твої вчителі', 'QR-сканер', 'Налаштування', 'Пристрої', 'Питання та відповіді', 'Команда підтримки Мрії', 'Оцінити застосунок'];
    return headerBlock('Меню') + `
      <div class="section" style="padding-bottom:110px">
        ${items.map(label => `<div class="listItem"><span>${label}</span><span>›</span></div>`).join('')}
        <button class="buttonPrimary" onclick="alert('Вихід (демо)')">Вийти</button>
        <div class="small">Версія 1.6.0 (демо)</div>
      </div>`;
  }

  // -------- РЕНДЕР --------
  function render() {
    const app = document.getElementById('app');

    if (state === 'learning') {
      app.innerHTML = `<div class="screen">`
        + headerBlock('Навчання')
        + subnavLearning(learningTab)
        + (
          learningTab === 'results' ? viewResults() :
          learningTab === 'homework' ? viewHomework() :
          learningTab === 'schedule' ? viewSchedule() :
          viewPortfolio()
        )
        + bottomNav('learning')
        + `</div>`;
      return;
    }

    if (state === 'home') {
      app.innerHTML = `<div class="screen">` + viewHome() + bottomNav('home') + `</div>`;
      return;
    }
    if (state === 'media') {
      app.innerHTML = `<div class="screen">` + viewMedia() + bottomNav('media') + `</div>`;
      return;
    }
    if (state === 'menu') {
      app.innerHTML = `<div class="screen">` + viewMenu() + bottomNav('menu') + `</div>`;
      return;
    }
  }

  render();
})();