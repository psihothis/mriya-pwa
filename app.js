
(function(){
  // block zoom
  document.addEventListener('gesturestart', e => e.preventDefault(), { passive:false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => { const now=Date.now(); if (now-lastTouchEnd<=300) e.preventDefault(); lastTouchEnd=now; }, { passive:false });

  const INSTALLED_ONLY = true;
  const IS_STANDALONE = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (INSTALLED_ONLY && !IS_STANDALONE){
    document.getElementById('app').innerHTML = `<div class="gate"><div class="box"><h2>Додай «Мрію» на початковий екран</h2><ol class="steps"><li>Відкрий у Safari</li><li>Поділитись → Додати на початковий екран</li></ol></div></div>`; return;
  }
  if ('serviceWorker' in navigator && IS_STANDALONE){ window.addEventListener('load', ()=>navigator.serviceWorker.register('service-worker.js')); }

  const icons={home:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,id:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/><circle cx="9" cy="12" r="2.5" stroke="white" stroke-width="2"/><path d="M14 10h5M14 13h5M14 16h3" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,eye:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="white" stroke-width="2"/></svg>`,menu:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`};

  let state='home';
  window.setState = (s)=>{ state=s; render(); };

  function headerBlock(name='Іван'){
    const today = new Date().toLocaleDateString('uk-UA', {day:'2-digit', month:'long', year:'numeric'});
    const weekday = new Date().toLocaleDateString('uk-UA', {weekday:'long'});
    return `<div class="header">
      <div class="greeting">Привіт, ${name}</div>
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

  function render(){
    const app = document.getElementById('app');
    if (state==='home'){
      app.innerHTML = `<div class="screen">` + headerBlock() + `<div class="bigCard"><h2>Сьогодні вихідний</h2></div>` + bottomNav('home') + `</div>`;
    }
    if (state==='learning'){
      const dynCards = Array.from({length:6}).map((_,i)=>`
        <div class="dynCard">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-weight:800">Динаміка — тиждень ${i+1}</div>
            <span class="badge">64%</span>
          </div>
          <div style="height:110px;border-radius:12px;background:linear-gradient(180deg,#eaf1ff,#f7faff)"></div>
          <div style="margin-top:10px;color:#5d6b81;font-size:13px">Виконано завдань, сер. бал ДЗ, тощо</div>
        </div>`).join('');

      app.innerHTML = `<div class="screen">` + headerBlock() + subnavLearning() + `
        <div class="section"><h3>Останні оцінки</h3></div>
        <div class="section"><div class="grid">
          ${['Громадянська освіта','Громадянська освіта'].map((n,i)=>`
          <div class="card"><div class="badge">${i?10:12}</div><p style="margin-top:8px;font-weight:800">${n}</p></div>`).join('')}
        </div></div>

        <div class="section"><h3>Динаміка</h3></div>
        <div class="section">
          <div class="hScroll">
            ${dynCards}
          </div>
        </div>

        <div class="section"><div class="grid">
          <div class="card"><h4 style="margin:0 0 4px 0">Відвідування</h4>
            <p style="color:#5d6b81;margin:0">За останні 14 днів</p>
          </div>
          <div class="card"><h4 style="margin:0 0 4px 0">Чудова робота 🏆</h4>
            <ul style="margin-top:4px; padding-left:18px">
              <li>Громадянська освіта — сер. бал за семестр</li>
              <li>Географія — сер. бал за семестр</li>
              <li>Інформатика — сер. бал за семестр</li>
            </ul></div>
        </div></div>
        ` + bottomNav('learning') + `</div>`;
    }
    if (state==='media'){
      const cards = [
        {title:'Рефлексія як інструмент самопізнання і кра...', tag:'рефлексія', meta:'2:53'},
        {title:'Інклюзивність', tag:'Інклюзивність', meta:'4 епізоди'},
        {title:'Дія для...', tag:'Дія', meta:'1:20'}
      ];
      app.innerHTML = `<div class="screen">` + headerBlock() + `
        <div class="section"><h3>Контент</h3></div>
        <div class="section"><div class="grid">
          ${cards.map(c=>`
          <div class="card">
            <div class="badge">${c.tag}</div>
            <div style="height:84px;border-radius:12px;background:#e8eefc;margin:8px 0"></div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-weight:800">${c.title}</div>
              <div style="font-size:12px;color:#5d6b81">${c.meta}</div>
            </div>
          </div>`).join('')}
        </div></div>` + bottomNav('media') + `</div>`;
    }
    if (state==='menu'){
      const items = ['Твої вчителі','QR-сканер','Налаштування','Пристрої','Питання та відповіді','Команда підтримки Мрії','Оцінити застосунок'];
      app.innerHTML = `<div class="screen">` + headerBlock('Іван') + `<div class="section" style="padding-bottom:110px">
        ${items.map(label=>`<div class="listItem"><span>${label}</span><span>›</span></div>`).join('')}
        <button class="buttonPrimary" onclick="alert('Вихід (демо)')">Вийти</button>
        <div class="small">Версія 1.6.0 (демо)</div>
      </div>` + bottomNav('menu') + `</div>`;
    }
  }
  render();
})(); 
