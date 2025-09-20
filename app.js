(function(){
  // блок зуму (pinch/double-tap) у встановленій апці
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => { const now=Date.now(); if (now-lastTouchEnd<=300) e.preventDefault(); lastTouchEnd=now; }, { passive:false });

  const INSTALLED_ONLY = true;
  const IS_STANDALONE = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (INSTALLED_ONLY && !IS_STANDALONE){
    document.getElementById('app').innerHTML = `
      <div class="gate">
        <div class="box">
          <h2>Додай «Мрію» на початковий екран</h2>
          <div class="steps">
            <ol>
              <li>Відкрий у Safari</li>
              <li>Поділитись → <b>Додати на початковий екран</b></li>
            </ol>
          </div>
        </div>
      </div>`; 
    return;
  }

  if ('serviceWorker' in navigator && IS_STANDALONE){
    window.addEventListener('load', ()=>navigator.serviceWorker.register('service-worker.js'));
  }

  const icons = {
    home:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    id:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/><circle cx="9" cy="12" r="2.5" stroke="white" stroke-width="2"/><path d="M14 10h5M14 13h5M14 16h3" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
    eye:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/></svg>`,
    menu:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
  };

  let state='learning'; // можна змінити на 'home' після перевірки
  window.setState = (s)=>{ state=s; render(); };

  function headerBlock(title='Навчання'){
    const today = new Date().toLocaleDateString('uk-UA', {day:'2-digit', month:'long', year:'numeric'});
    const weekday = new Date().toLocaleDateString('uk-UA', {weekday:'long'});
    return `<div class="header">
      <div class="greeting">${title}</div>
      <div class="dateRow">
        <div class="dateBtn">‹</div>
        <div class="dateText">${today}<br><span style="opacity:.85;text-transform:capitalize">${weekday}</span></div>
        <div class="dateBtn">›</div>
      </div>
    </div>`;
  }

  function bottomNav(active){
    return `<div class="navWrap">
      <div class="navShadow"></div>
      <nav class="nav">
        <a class="tab ${active==='home'?'active':''}" onclick="event.preventDefault();setState('home')">${icons.home}<span>Головна</span></a>
        <a class="tab ${active==='learning'?'active':''}" onclick="event.preventDefault();setState('learning')">${icons.id}<span>Навчання</span></a>
        <a class="tab ${active==='media'?'active':''}" onclick="event.preventDefault();setState('media')">${icons.eye}<span>Цікаве</span></a>
        <a class="tab ${active==='menu'?'active':''}" onclick="event.preventDefault();setState('menu')">${icons.menu}<span>Меню</span></a>
      </nav>
    </div>`;
  }

  function subnavLearning(){
    const tabs = ['Результати','Домашки','Розклад','Показники','Аналітика'];
    return `<div class="subnavWrap">
      <div class="subnavBg"></div>
      <div class="subnav">
        ${tabs.map((t,i)=>`<button class="pill ${i===0?'active':''}" onclick="event.preventDefault()">${t}</button>`).join('')}
      </div>
    </div>`;
  }

  function donutSVG(pct){
    const r=30, c=2*Math.PI*r, off=c*(1-pct);
    return `<svg class="donut" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#e8eefc" stroke-width="10"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#2a64ff" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      <text x="40" y="46" text-anchor="middle" font-size="18" font-weight="800" fill="#0b1221">${Math.round(pct*100)}%</text>
    </svg>`;
  }

  function dynCards(){
    const list = (title)=>`
      <div class="dynCard dynWhite">
        <h3>${title}</h3>
        <div class="muted">Наразі недостатньо оцінок, щоб вирахувати динаміку</div>
        <div class="list">
          ${[['Громадянська освіта','11,0'],['Географія','11,0'],['Інформатика','10,0']].map(([n,val])=>`
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

  function render(){
    const app = document.getElementById('app');
    if (state==='learning'){
      app.innerHTML = `<div class="screen">` + headerBlock('Навчання') + subnavLearning() + `
        <div class="section"><h3>Динаміка</h3></div>
        <div class="section"><div class="hScroll">` + dynCards() + `</div></div>
      ` + bottomNav('learning') + `</div>`;
      return;
    }
    app.innerHTML = `<div class="screen">` + headerBlock('Головна') + `<div class="bigCard"><h2>Сьогодні вихідний</h2></div>` + bottomNav('home') + `</div>`;
  }
  render();
})();