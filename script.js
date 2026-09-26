// Interactive functionality for the Carbon Tracker App
document.addEventListener('DOMContentLoaded', () => {
  const t = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
  // 1. Bottom Navigation Tabs Handling
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabViews = document.querySelectorAll('.tab-view');
  const notifDot = document.querySelector('.notif-badge-dot');

  function switchTab(targetId) {
    // Update active tab button
    navTabs.forEach(tab => {
      const tabTarget = tab.getAttribute('data-tab') || tab.getAttribute('href').replace('#', '');
      if (tabTarget === targetId) {
        tab.classList.add('active');
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.classList.remove('active');
        tab.removeAttribute('aria-current');
      }
    });

    // If notifications tab clicked, remove the unread dot
    if (targetId === 'notifications' && notifDot) {
      notifDot.style.display = 'none';
    }

    // Switch view content
    tabViews.forEach(view => {
      if (view.id === `view-${targetId}`) {
        view.classList.add('active');
        view.style.display = 'block';
      } else {
        view.classList.remove('active');
        view.style.display = 'none';
      }
    });

    // Scroll smoothly to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      try { window.SFX && window.SFX.tab(); } catch (err) {}
      const targetId = tab.getAttribute('data-tab') || tab.getAttribute('href').replace('#', '');
      switchTab(targetId);
    });
  });

  // Vehicle tab: type cards -> detail modal + My fleet (localStorage, add/remove)
  var VTAB_KEY = 'flukeblind-vtab-fleet';
  var VTYPE_INFO = {
    diesel: { icon: '🚚', co2km: 0.27, co2L: 2.68, nameK: 'vtype.diesel' },
    gasoline: { icon: '🚗', co2km: 0.23, co2L: 2.31, nameK: 'vtype.gasoline' },
    ngv: { icon: '🚐', co2km: 0.19, co2L: 1.9, nameK: 'vtype.ngv' },
    electric: { icon: '⚡', co2km: 0.05, co2L: null, nameK: 'vtype.electric' },
    bike: { icon: '🚲', co2km: 0, co2L: null, nameK: 'vtype.bike' }
  };
  var VTYPE_DEFAULT_CO2 = { diesel: 0.27, gasoline: 0.23, ngv: 0.19, electric: 0.05, bike: 0 };
  function loadVtabFleet() {
    try {
      var raw = localStorage.getItem(VTAB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var demo = [
      { name: 'รถกระบะดีเซล #05', fuel: 'diesel', co2: 0.27, addedAt: new Date().toISOString() },
      { name: 'มอเตอร์ไซค์ Swift #01', fuel: 'gasoline', co2: 0.12, addedAt: new Date().toISOString() }
    ];
    try { localStorage.setItem(VTAB_KEY, JSON.stringify(demo)); } catch (e) {}
    return demo;
  }
  var vtabFleet = loadVtabFleet();
  function saveVtabFleet() { try { localStorage.setItem(VTAB_KEY, JSON.stringify(vtabFleet)); } catch (e) {} }

  function openVtypeDetail(key) {
    var info = VTYPE_INFO[key]; if (!info) return;
    document.getElementById('vtype-detail-icon').textContent = info.icon;
    document.getElementById('vtype-detail-title').textContent = t(info.nameK);
    document.getElementById('vtype-detail-sub').textContent = info.co2km + ' kg/km' + (info.co2L ? ' • ' + info.co2L + ' kg/L' : '');
    var per100 = (info.co2km * 100).toFixed(1);
    document.getElementById('vtype-detail-body').innerHTML =
      '<p style="font-size:.85rem;color:var(--text-muted)">🚗 1 km → <b>' + info.co2km + ' kg CO₂</b></p>'
      + '<p style="font-size:.85rem;color:var(--text-muted)">🛣️ ' + t('vtab.per100') + ' → <b>' + per100 + ' kg CO₂</b></p>'
      + '<p style="font-size:.85rem;color:var(--text-muted)">🌱 ' + t('vtab.vs.bike') + ': <b>+' + per100 + ' kg</b></p>';
    var m = document.getElementById('vtype-detail-modal');
    m.classList.add('active'); m.setAttribute('aria-hidden', 'false');
  }
  function closeVtypeDetail() { var m = document.getElementById('vtype-detail-modal'); if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } }
  document.querySelectorAll('[data-close-vtype]').forEach(function (b) { b.addEventListener('click', closeVtypeDetail); });
  document.querySelectorAll('#vtype-list [data-vtype]').forEach(function (row) {
    row.addEventListener('click', function () { openVtypeDetail(row.getAttribute('data-vtype')); });
    row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVtypeDetail(row.getAttribute('data-vtype')); } });
  });

  // Translate user-entered Thai vehicle names for display (stored value stays as typed)
  function localizeVehicleName(name, lang) {
    if (lang !== 'en') return name;
    var n = String(name || '');
    var m = n.match(/#?\s*(\d+)\s*$/);
    var num = m ? ' #' + m[1] : '';
    if (/รถกระบะ/.test(n)) return 'Diesel pickup' + num;
    if (/มอเตอร์ไซค์|มอเตอ/.test(n)) return 'Motorbike Swift' + num;
    if (/รถบรรทุก/.test(n)) return 'Electric truck' + num;
    if (/รถตู้/.test(n)) return 'Van' + num;
    if (/รถเก๋ง/.test(n)) return 'Sedan' + num;
    return n;
  }
  function renderVtabFleet() {
    var list = document.getElementById('vtab-fleet-list'), empty = document.getElementById('vtab-fleet-empty');
    if (!list) return;
    if (!vtabFleet.length) { list.innerHTML = ''; if (empty) empty.style.display = ''; return; }
    if (empty) empty.style.display = 'none';
    var unit = t('vtab.perKm');
    var lang = window.i18n ? window.i18n.lang : 'th';
    list.innerHTML = vtabFleet.map(function (v, i) {
      var icon = (VTYPE_INFO[v.fuel] || {}).icon || '🚗';
      return '<div class="activity-card-row"><div class="act-icon">' + icon + '</div>'
        + '<div class="act-info"><h4>' + String(localizeVehicleName(v.name, lang)).replace(/[&<>"]/g, '') + '</h4>'
        + '<p>' + (VTYPE_INFO[v.fuel] ? t(VTYPE_INFO[v.fuel].nameK) : v.fuel) + ' • ' + v.co2 + ' ' + unit + '</p></div>'
        + '<button class="act-btn" data-vtab-del="' + i + '" style="background:#e5ede8;color:#b91c1c;">✕</button></div>';
    }).join('');
    list.querySelectorAll('[data-vtab-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        vtabFleet.splice(parseInt(btn.getAttribute('data-vtab-del'), 10), 1);
        saveVtabFleet(); renderVtabFleet();
      });
    });
  }
  document.getElementById('vtab-add-btn')?.addEventListener('click', function () {
    var f = document.getElementById('vtab-add-form');
    f.style.display = f.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('vtab-fuel')?.addEventListener('change', function (e) {
    var co2 = document.getElementById('vtab-co2');
    if (co2 && !co2.value) co2.value = VTYPE_DEFAULT_CO2[e.target.value] ?? '';
  });
  document.getElementById('vtab-cancel')?.addEventListener('click', function () {
    document.getElementById('vtab-add-form').style.display = 'none';
  });
  document.getElementById('vtab-save')?.addEventListener('click', function () {
    var name = document.getElementById('vtab-name').value.trim();
    if (!name) { showToast(t('vtab.need.name')); return; }
    var fuel = document.getElementById('vtab-fuel').value;
    var co2 = parseFloat(document.getElementById('vtab-co2').value);
    if (isNaN(co2)) co2 = VTYPE_DEFAULT_CO2[fuel] ?? 0;
    vtabFleet.push({ name: name, fuel: fuel, co2: co2, addedAt: new Date().toISOString() });
    saveVtabFleet(); renderVtabFleet();
    document.getElementById('vtab-name').value = '';
    document.getElementById('vtab-co2').value = '';
    document.getElementById('vtab-add-form').style.display = 'none';
    try { window.SFX && window.SFX.success(); } catch (e) {}
    showToast(t('vtab.added', { name: name }));
  });
  renderVtabFleet();
  window.onLangChange = (function (prev) {
    return function () { try { if (prev) prev(); } catch (e) {} renderVtabFleet(); };
  })(window.onLangChange);
  var ACT_KEY = 'flukeblind-missions';
  function loadMissions() {
    try {
      var raw = localStorage.getItem(ACT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Demo history (1–2 entries) so the section isn't empty on first run
    var demo = {
      m1: { count: 3, log: [daysAgo(1), daysAgo(3), daysAgo(5)] },
      m2: { count: 1, log: [daysAgo(2)] }
    };
    try { localStorage.setItem(ACT_KEY, JSON.stringify(demo)); } catch (e) {}
    return demo;
  }
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); d.setHours(8, 15, 0, 0); return d.toISOString(); }
  function saveMissions(m) { try { localStorage.setItem(ACT_KEY, JSON.stringify(m)); } catch (e) {} }
  var missions = loadMissions();
  var MISSION_META = { m1: { icon: '🚲', how: 'act.h1' }, m2: { icon: '🥤', how: 'act.h2' }, m3: { icon: '🌱', how: 'act.h3' } };

  function missionRow(id) { return document.querySelector('.activity-card-row[data-mission="' + id + '"]'); }
  function missionTitle(id) { var r = missionRow(id); return r ? (r.querySelector('h4')?.textContent || id) : id; }
  function missionDesc(id) { var r = missionRow(id); return r ? (r.querySelector('p')?.textContent || '') : ''; }

  function refreshMissionButtons() {
    document.querySelectorAll('[data-act][data-mission]').forEach(function (btn) {
      var id = btn.getAttribute('data-mission');
      var n = (missions[id] && missions[id].count) || 0;
      var base = t(btn.getAttribute('data-act') === 'register' ? 'act.reg' : 'act.join');
      btn.textContent = n > 0 ? base + ' ✓' : base;
      btn.classList.toggle('joined', n > 0);
    });
  }

  function renderActHistory() {
    var list = document.getElementById('act-history-list');
    var empty = document.getElementById('act-history-empty');
    if (!list) return;
    var ids = Object.keys(missions).filter(function (id) { return missions[id] && missions[id].count > 0; });
    if (!ids.length) { list.innerHTML = ''; if (empty) empty.style.display = ''; return; }
    if (empty) empty.style.display = 'none';
    list.innerHTML = ids.map(function (id) {
      var m = missions[id], meta = MISSION_META[id] || { icon: '🌱' };
      var total = m.count * (parseInt(missionRow(id)?.getAttribute('data-pts') || '0', 10));
      return '<div class="activity-card-row" data-mission="' + id + '" tabindex="0" role="button">'
        + '<div class="act-icon">' + meta.icon + '</div>'
        + '<div class="act-info"><h4>' + missionTitle(id) + '</h4>'
        + '<p>' + t('act.times', { n: m.count }) + ' • ' + t('act.total.pts', { n: total }) + '</p></div>'
        + '<span class="stat-badge green">' + t('act.joined') + '</span></div>';
    }).join('');
    list.querySelectorAll('[data-mission]').forEach(function (row) {
      row.addEventListener('click', function () { openActDetail(row.getAttribute('data-mission')); });
    });
  }

  function joinMission(id) {
    var now = new Date().toISOString();
    if (!missions[id]) missions[id] = { count: 0, log: [] };
    missions[id].count += 1; missions[id].log.push(now);
    saveMissions(missions); refreshMissionButtons(); renderActHistory();
    var btn = document.querySelector('[data-act][data-mission="' + id + '"]');
    var isReg = btn && btn.getAttribute('data-act') === 'register';
    try { window.SFX && (isReg ? window.SFX.badge() : window.SFX.coin()); } catch (e) {}
    showToast(t(isReg ? 'act.reg.done' : 'act.done'));
  }

  function openActDetail(id) {
    var modal = document.getElementById('act-detail-modal');
    if (!modal) return;
    var r = missionRow(id), meta = MISSION_META[id] || { icon: '🌱' };
    document.getElementById('act-detail-icon').textContent = meta.icon;
    document.getElementById('act-detail-title').textContent = missionTitle(id);
    document.getElementById('act-detail-sub').textContent = missionDesc(id);
    var n = (missions[id] && missions[id].count) || 0;
    var pts = r?.getAttribute('data-pts') || '0', co2 = r?.getAttribute('data-co2') || '0';
    var log = (missions[id] && missions[id].log || []).slice(-3).reverse()
      .map(function (d) { try { return new Date(d).toLocaleString(); } catch (e) { return d; } }).join('<br>');
    document.getElementById('act-detail-body').innerHTML =
      '<p style="font-size:.82rem;color:var(--text-muted)"><b>' + t('act.detail.how') + ':</b> ' + t(meta.how) + '</p>'
      + '<p style="font-size:.82rem;color:var(--text-muted)"><b>' + t('act.detail.reward') + ':</b> ' + pts + ' pts • −' + co2 + ' kg CO₂</p>'
      + '<p style="font-size:.82rem;color:var(--text-muted)"><b>' + t('act.detail.status') + ':</b> ' + (n > 0 ? t('act.done.n', { n: n }) : t('act.notyet')) + '</p>'
      + (log ? '<p style="font-size:.74rem;color:var(--text-muted)">' + log + '</p>' : '');
    var joinBtn = document.getElementById('act-detail-join');
    joinBtn.textContent = t(r?.querySelector('[data-act]')?.getAttribute('data-act') === 'register' ? 'act.reg' : 'act.join');
    joinBtn.onclick = function () { joinMission(id); closeActDetail(); };
    modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
  }
  function closeActDetail() {
    var modal = document.getElementById('act-detail-modal');
    if (modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
  }
  document.querySelectorAll('[data-close-act-detail]').forEach(function (b) { b.addEventListener('click', closeActDetail); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeActDetail(); });

  // Row tap (not on button) opens detail
  document.querySelectorAll('.activity-card-row[data-mission]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      openActDetail(row.getAttribute('data-mission'));
    });
    row.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); openActDetail(row.getAttribute('data-mission')); }
    });
  });
  // Join buttons
  document.querySelectorAll('[data-act][data-mission]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); joinMission(btn.getAttribute('data-mission')); });
  });
  refreshMissionButtons(); renderActHistory();
  window.onLangChange = (function (prev) {
    return function () { try { if (prev) prev(); } catch (e) {} refreshMissionButtons(); renderActHistory(); };
  })(window.onLangChange);

  // 2. Interactive Category Boxes (Click feedback & Toast)
  const categoryBoxes = document.querySelectorAll('.category-box');
  categoryBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const catName = box.querySelector('.cat-name')?.textContent || 'หมวดหมู่';
      const catNum = box.querySelector('.cat-num')?.textContent || '0';
      const catRate = box.querySelector('.cat-rate')?.textContent || '';
      showToast(t('toast.cat', { name: catName, num: catNum, unit: catRate }));
    });
  });

  // Category detail data (per-category breakdown + tip)
  var CAT_DETAIL = [
    { key: 'cat.travel', icon: '🚗', pct: 52, val: '0.55', examples: 'cat.ex.travel' },
    { key: 'cat.food', icon: '🍽️', pct: 23, val: '0.24', examples: 'cat.ex.food' },
    { key: 'cat.energy', icon: '⚡', pct: 9, val: '0.09', examples: 'cat.ex.energy' },
    { key: 'cat.goods', icon: '📦', pct: 14, val: '0.15', examples: 'cat.ex.goods' },
    { key: 'cat.home', icon: '🏠', pct: 0, val: '0', examples: 'cat.ex.home' },
    { key: 'cat.other', icon: '🌱', pct: 2, val: '0.05', examples: 'cat.ex.other' }
  ];
  function openCatDetail(idx) {
    var c = CAT_DETAIL[idx]; if (!c) return;
    var m = document.getElementById('cat-detail-modal');
    if (!m) return;
    document.getElementById('cat-detail-icon').textContent = c.icon;
    document.getElementById('cat-detail-title').textContent = t(c.key);
    document.getElementById('cat-detail-sub').textContent = c.val + ' ' + t('vtab.perKm') + ' CO₂ • ' + c.pct + '%';
    document.getElementById('cat-detail-body').innerHTML =
      '<div class="prog-bar"><div class="prog-fill" style="width:' + c.pct + '%;background:#2d6a4f;"></div></div>'
      + '<p style="font-size:.82rem;color:var(--text-muted)"><b>' + t('cat.detail.src') + ':</b> ' + t(c.examples) + '</p>'
      + '<p style="font-size:.82rem;color:var(--text-muted)"><b>' + t('cat.detail.tip') + ':</b> ' + t('cat.tip.' + c.key.split('.')[1]) + '</p>';
    m.classList.add('active'); m.setAttribute('aria-hidden', 'false');
    try { window.SFX && window.SFX.pop(); } catch (e) {}
  }
  function closeCatDetail() { var m = document.getElementById('cat-detail-modal'); if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } }
  document.querySelectorAll('[data-close-cat-detail]').forEach(function (b) { b.addEventListener('click', closeCatDetail); });

  // "View all" for emission categories — modal listing every category (tap row = detail)
  document.getElementById('btn-view-all-cats')?.addEventListener('click', () => {
    var body = document.getElementById('cat-all-body');
    if (body) {
      var unit = t('vtab.perKm');
      body.innerHTML = CAT_DETAIL.map(function (c, i) {
        return '<div class="activity-card-row" data-cat-idx="' + i + '" tabindex="0" role="button"><div class="act-icon">' + c.icon + '</div>'
          + '<div class="act-info"><h4>' + t(c.key) + '</h4><p>' + c.val + ' ' + unit + ' CO₂</p></div>'
          + '<span class="stat-badge green">▶</span></div>';
      }).join('');
      body.querySelectorAll('[data-cat-idx]').forEach(function (row) {
        var open = function () { openCatDetail(parseInt(row.getAttribute('data-cat-idx'), 10)); };
        row.addEventListener('click', open);
        row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      });
    }
    var m = document.getElementById('cat-all-modal');
    if (m) { m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); }
    try { window.SFX && window.SFX.pop(); } catch (e) {}
  });
  document.querySelectorAll('[data-close-cat-all]').forEach(function (b) {
    b.addEventListener('click', () => {
      var m = document.getElementById('cat-all-modal');
      if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); }
    });
  });
  window.onLangChange = (function (prev) {
    return function () {
      try { if (prev) prev(); } catch (e) {}
      // re-render open category list in new language
      if (document.getElementById('cat-all-modal')?.classList.contains('active')) {
        document.getElementById('btn-view-all-cats')?.click();
      }
    };
  })(window.onLangChange);

  // 3. Saved Location Items - Dedicated Interactive Triggers
  const routeTrigger = document.getElementById('item-route-trigger');
  if (routeTrigger) {
    routeTrigger.addEventListener('click', () => {
      openRouteModal();
    });
  }

  const btnViewAllRoutes = document.getElementById('btn-view-all-routes');
  if (btnViewAllRoutes) {
    btnViewAllRoutes.addEventListener('click', () => {
      openRouteModal();
    });
  }

  const savedPlacesTrigger = document.getElementById('item-saved-places');
  if (savedPlacesTrigger) {
    savedPlacesTrigger.addEventListener('click', () => {
      openSavedPlacesModal();
    });
  }

  // 4. Quick Action Buttons — Edit profile modal (persisted to localStorage)
  var PF_KEY = 'flukeblind-profile';
  var PF_DEFAULTS = { name: 'ตึก 3', school: 'โรงเรียนสุรศักดิ์มนตรี', grade: 'มัธยมศึกษาปีที่ 3', type: 'นักเรียน', province: 'กรุงเทพมหานคร', goal: 'ลดการปล่อยคาร์บอน' };
  var GRADES_TH = ['มัธยมศึกษาปีที่ 1','มัธยมศึกษาปีที่ 2','มัธยมศึกษาปีที่ 3','มัธยมศึกษาปีที่ 4','มัธยมศึกษาปีที่ 5','มัธยมศึกษาปีที่ 6'];
  var TYPES_TH = ['นักเรียน','ครู','บุคลากร','ผู้เยี่ยมชม'];
  var GOALS_TH = ['ลดการปล่อยคาร์บอน','เดินทางยั่งยืน','ลดขยะพลาสติก','ประหยัดพลังงาน'];
  function loadProfile() { try { return Object.assign({}, PF_DEFAULTS, JSON.parse(localStorage.getItem(PF_KEY)) || {}); } catch (e) { return Object.assign({}, PF_DEFAULTS); } }
  // Store canonical (Thai) values; translate for display only
  function localizeProfile(p, lang) {
    var out = Object.assign({}, p);
    if (lang === 'en') {
      var gi = GRADES_TH.indexOf(p.grade);
      if (gi !== -1) out.grade = 'Grade ' + (gi + 7) + ' (M.' + (gi + 1) + ')';
      var ti = TYPES_TH.indexOf(p.type);
      if (ti !== -1) out.type = ['Student','Teacher','Staff','Guest'][ti];
      var oi = GOALS_TH.indexOf(p.goal);
      if (oi !== -1) out.goal = ['Reduce carbon emissions','Sustainable travel','Reduce plastic waste','Save energy'][oi];
      if (p.name === 'ตึก 2' || p.name === 'ตึก 3' || /^ตึก \d+$/.test(p.name || '')) {
        var n = (p.name.match(/\d+/) || [''])[0];
        if (n) out.name = 'Building ' + n;
      }
      if (p.school === 'โรงเรียนสุรศักดิ์มนตรี') out.school = 'Surasakmontri School';
      if (p.province === 'กรุงเทพมหานคร') out.province = 'Bangkok';
    }
    return out;
  }
  function renderProfile() {
    var lang = window.i18n ? window.i18n.lang : 'th';
    var p = localizeProfile(loadProfile(), lang);
    document.querySelectorAll('[data-profile]').forEach(function (el) {
      var k = el.getAttribute('data-profile');
      if (p[k] != null) el.textContent = p[k];
    });
  }
  function openProfileModal() {
    var p = loadProfile(), lang = window.i18n ? window.i18n.lang : 'th';
    document.getElementById('pf2-name').value = p.name;
    document.getElementById('pf2-school').value = p.school;
    document.getElementById('pf2-province').value = p.province;
    var gradeOpts = lang === 'en' ? GRADES_TH.map(function (g, i) { return 'Grade ' + (i + 7) + ' (M.' + (i + 1) + ')'; }) : GRADES_TH;
    var typeOpts = lang === 'en' ? ['Student','Teacher','Staff','Guest'] : TYPES_TH;
    var goalOpts = lang === 'en' ? ['Reduce carbon emissions','Sustainable travel','Reduce plastic waste','Save energy'] : GOALS_TH;
    fillSelect('pf2-grade', gradeOpts, p.grade);
    fillSelect('pf2-type', typeOpts, p.type);
    fillSelect('pf2-goal', goalOpts, p.goal);
    var m = document.getElementById('edit-profile-modal');
    m.classList.add('active'); m.setAttribute('aria-hidden', 'false');
  }
  function fillSelect(id, opts, current) {
    var sel = document.getElementById(id); if (!sel) return;
    sel.innerHTML = '';
    var list = opts.slice();
    if (current && list.indexOf(current) === -1) list.unshift(current);
    list.forEach(function (o) {
      var op = document.createElement('option'); op.value = o; op.textContent = o;
      if (o === current) op.selected = true;
      sel.appendChild(op);
    });
  }
  function closeProfileModal() { var m = document.getElementById('edit-profile-modal'); if (m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); } }
  document.getElementById('btn-edit-profile')?.addEventListener('click', openProfileModal);
  document.querySelectorAll('[data-close-profile]').forEach(function (b) { b.addEventListener('click', closeProfileModal); });
  document.getElementById('pf2-cancel')?.addEventListener('click', closeProfileModal);
  document.getElementById('pf2-save')?.addEventListener('click', function () {
    var p = {
      name: document.getElementById('pf2-name').value.trim() || loadProfile().name,
      school: document.getElementById('pf2-school').value.trim(),
      province: document.getElementById('pf2-province').value.trim(),
      grade: document.getElementById('pf2-grade').value,
      type: document.getElementById('pf2-type').value,
      goal: document.getElementById('pf2-goal').value
    };
    try { localStorage.setItem(PF_KEY, JSON.stringify(p)); } catch (e) {}
    renderProfile(); closeProfileModal();
    try { window.SFX && window.SFX.success(); } catch (e) {}
    showToast(t('profile.saved'));
  });
  // Home info card mirrors the profile tab (single source: localStorage).
  // Profile-tab sub-page fields: pf-name/pf-school/pf-grade/pf-prov/pf-type
  function syncProfileFormToCard() {
    var card = {
      name: document.getElementById('pf-name')?.value.trim(),
      school: document.getElementById('pf-school')?.value.trim(),
      grade: document.getElementById('pf-grade')?.value,
      province: document.getElementById('pf-prov')?.value.trim(),
      type: document.getElementById('pf-type')?.value
    };
    var cur = loadProfile(), changed = false;
    Object.keys(card).forEach(function (k) {
      if (card[k] && card[k] !== cur[k]) { cur[k] = card[k]; changed = true; }
    });
    if (changed) { try { localStorage.setItem(PF_KEY, JSON.stringify(cur)); } catch (e) {} }
    renderProfile();
  }
  ['pf-name','pf-school','pf-grade','pf-prov','pf-type'].forEach(function (id) {
    document.getElementById(id)?.addEventListener('change', syncProfileFormToCard);
  });
  renderProfile();

  const detailBtn = document.querySelector('.btn-detail');
  if (detailBtn) {
    detailBtn.addEventListener('click', () => {
      switchTab('stats');
    });
  }

  const viewMapBtn = document.querySelector('.view-map-pill');
  if (viewMapBtn) {
    viewMapBtn.addEventListener('click', () => {
      openMapModal();
    });
  }

  const expandMapBtn = document.querySelector('.expand-map-btn');
  if (expandMapBtn) {
    expandMapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMapModal();
    });
  }

  const miniMapPreview = document.querySelector('.mini-map-preview');
  if (miniMapPreview) {
    miniMapPreview.addEventListener('click', () => openMapModal());
  }

  // 5. Search Bar Functionality — local places + Nominatim (OpenStreetMap, no key)
  const searchInput = document.querySelector('.search-section .search-input');
  const searchResultsEl = document.getElementById('search-results');
  let searchDebounce = null;
  let searchAbort = null;
  let searchItems = [];

  function localSearchResults(q) {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const pool = [
      { name: MAP_ORIGIN.name, addr: 'จุดเริ่มต้น / ตำแหน่งปัจจุบัน', lat: MAP_ORIGIN.lat, lng: MAP_ORIGIN.lng, local: true },
      ...(typeof savedPlacesData !== 'undefined' ? savedPlacesData : []).map(p => ({
        name: p.name, addr: p.addr, lat: p.lat, lng: p.lng, local: true
      }))
    ];
    return pool.filter(p =>
      p.name.toLowerCase().includes(query) || (p.addr || '').toLowerCase().includes(query)
    ).slice(0, 5);
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderSearchResults(items, state) {
    if (!searchResultsEl) return;
    searchItems = items;
    if (state === 'loading') {
      searchResultsEl.hidden = false;
      searchResultsEl.innerHTML = `<div class="search-result-loading">${t('search.loading')}</div>`;
      searchInput?.setAttribute('aria-expanded', 'true');
      return;
    }
    if (!items.length) {
      if (state === 'empty') {
        searchResultsEl.hidden = false;
        searchResultsEl.innerHTML = `<div class="search-result-empty">${t('search.empty')}</div>`;
        searchInput?.setAttribute('aria-expanded', 'true');
      } else {
        searchResultsEl.hidden = true;
        searchResultsEl.innerHTML = '';
        searchInput?.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    searchResultsEl.hidden = false;
    searchInput?.setAttribute('aria-expanded', 'true');
    searchResultsEl.innerHTML = items.map((r, i) => `
      <button type="button" class="search-result-item" role="option" data-idx="${i}">
        <span class="search-result-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21C16 16.5 19 13 19 9A7 7 0 1 0 5 9C5 13 8 16.5 12 21Z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </span>
        <span class="search-result-texts">
          <span class="search-result-name">${escapeHtml(r.name)}</span>
          <span class="search-result-addr">${escapeHtml(r.addr || '')}</span>
        </span>
      </button>`).join('');
  }

  async function fetchNominatim(q, signal) {
    const lang = window.i18n ? window.i18n.lang : 'th';
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=th&accept-language=${lang},en,th&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('search failed');
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(d => {
      const parts = String(d.display_name || '').split(',').map(s => s.trim()).filter(Boolean);
      return {
        name: parts[0] || d.display_name || q,
        addr: parts.slice(1, 3).join(', ') || d.display_name || '',
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
      };
    }).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
  }

  async function runSearch(q, { showDropdown = true } = {}) {
    const query = (q || '').trim();
    if (!query) {
      renderSearchResults([], 'idle');
      return [];
    }
    const local = localSearchResults(query);
    if (showDropdown) renderSearchResults(local, local.length ? 'ok' : 'loading');
    try {
      if (searchAbort) searchAbort.abort();
      searchAbort = new AbortController();
      const remote = await fetchNominatim(query, searchAbort.signal);
      const seen = new Set(local.map(r => `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`));
      const merged = [...local];
      for (const r of remote) {
        const key = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
        if (!seen.has(key)) { seen.add(key); merged.push(r); }
        if (merged.length >= 6) break;
      }
      if (showDropdown) renderSearchResults(merged, merged.length ? 'ok' : 'empty');
      return merged;
    } catch (err) {
      if (err && err.name === 'AbortError') return local;
      if (showDropdown) renderSearchResults(local, local.length ? 'ok' : 'empty');
      return local;
    }
  }

  function focusSearchResult(r) {
    if (!r) return;
    // Update home mini-map + full map, show info + open full map modal
    setMapIframe(homeMapEl, r.lat, r.lng, 15);
    if (typeof showFmMap === 'function') showFmMap({ lat: r.lat, lng: r.lng });
    const nameEl = document.getElementById('fmi-name');
    const addrEl = document.getElementById('fmi-addr');
    const etaEl = document.getElementById('fmi-eta');
    if (nameEl) nameEl.textContent = r.name;
    if (addrEl) addrEl.textContent = r.addr || `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`;
    if (etaEl) {
      const km = haversineKm(MAP_ORIGIN, { lat: r.lat, lng: r.lng }) * 1.25;
      etaEl.textContent = `${km < 1 ? `${Math.round(km * 1000)} ${t('unit.m')}` : `${km.toFixed(1)} ${t('unit.km')}`} ${t('map.from.origin')}`;
    }
    if (typeof openMapModal === 'function') openMapModal();
    // Re-apply after modal render overwrites the strip
    if (nameEl) nameEl.textContent = r.name;
    if (addrEl) addrEl.textContent = r.addr || `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`;
    if (etaEl) {
      const km = haversineKm(MAP_ORIGIN, { lat: r.lat, lng: r.lng }) * 1.25;
      etaEl.textContent = `${km < 1 ? `${Math.round(km * 1000)} ${t('unit.m')}` : `${km.toFixed(1)} ${t('unit.km')}`} ${t('map.from.origin')}`;
    }
    if (typeof showFmMap === 'function') showFmMap({ lat: r.lat, lng: r.lng });
    showToast(t('search.found', { name: r.name }));
  }

  async function handleSearch() {
    const val = searchInput?.value.trim();
    if (!val) {
      showToast(t('search.need'));
      return;
    }
    const results = await runSearch(val, { showDropdown: true });
    if (results.length) focusSearchResult(results[0]);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
      if (e.key === 'Escape' && searchResultsEl) {
        searchResultsEl.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
      }
    });
    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      const q = searchInput.value.trim();
      if (q.length < 2) { renderSearchResults([], 'idle'); return; }
      searchDebounce = setTimeout(() => runSearch(q), 350);
    });
  }
  if (searchResultsEl) {
    searchResultsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.search-result-item');
      if (!btn) return;
      const item = searchItems[Number(btn.dataset.idx)];
      searchResultsEl.hidden = true;
      searchInput?.setAttribute('aria-expanded', 'false');
      if (item && searchInput) searchInput.value = item.name;
      focusSearchResult(item);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-section')) {
        searchResultsEl.hidden = true;
        searchInput?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 6. Toast Notification Helper
  let toastTimeout;
  function showToast(message) {
    try { window.SFX && window.SFX.toast(); } catch (e) {}
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
  window.showToast = showToast;

  // 7. Vehicle & Delivery Modal (Delivery Truck Button)
  const vehicleModal = document.getElementById('vehicle-modal');
  const closeVehicleModalBtn = document.getElementById('close-vehicle-modal');
  const closeVehicleBottomBtn = document.getElementById('close-vehicle-bottom-btn');
  const vehicleModalBackdrop = document.getElementById('vehicle-modal-backdrop');
  const vehicleTriggers = document.querySelectorAll('.vehicle-trigger');

  function openVehicleModal() {
    if (vehicleModal) {
      vehicleModal.classList.add('active');
      vehicleModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeVehicleModal() {
    if (vehicleModal) {
      vehicleModal.classList.remove('active');
      vehicleModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  vehicleTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openVehicleModal();
    });
  });

  if (closeVehicleModalBtn) closeVehicleModalBtn.addEventListener('click', closeVehicleModal);
  if (closeVehicleBottomBtn) closeVehicleBottomBtn.addEventListener('click', closeVehicleModal);
  if (vehicleModalBackdrop) vehicleModalBackdrop.addEventListener('click', closeVehicleModal);

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && vehicleModal && vehicleModal.classList.contains('active')) {
      closeVehicleModal();
    }
  });

  // 8. Vehicle Filter Tabs
  const vFilterBtns = document.querySelectorAll('.v-filter-btn');
  const vehicleListEl = document.querySelector('.vehicle-list');
  let activeVehicleFilter = 'all';

  function getVehicleCards() {
    return vehicleListEl ? Array.from(vehicleListEl.querySelectorAll('.vehicle-item-card')) : [];
  }

  function applyVehicleFilter() {
    getVehicleCards().forEach(card => {
      const cardStatus = card.getAttribute('data-status');
      card.style.display =
        activeVehicleFilter === 'all' || cardStatus === activeVehicleFilter ? 'block' : 'none';
    });
  }

  function refreshVehicleStats() {
    const cards = getVehicleCards();
    const counts = { all: cards.length, ready: 0, delivering: 0, charging: 0 };
    cards.forEach(card => {
      const status = card.getAttribute('data-status');
      if (counts[status] !== undefined) counts[status]++;
    });

    vFilterBtns.forEach(btn => {
      const filter = btn.getAttribute('data-filter');
      const labels = {
        all: t('veh.filter.all'),
        ready: t('veh.filter.ready'),
        delivering: t('veh.filter.delivering'),
        charging: t('veh.filter.charging')
      };
      btn.textContent = `${labels[filter] || filter} (${counts[filter] || 0})`;
    });

    const kpiNum = document.querySelector('.vehicle-kpi-card .kpi-num');
    if (kpiNum) kpiNum.textContent = counts.all;

    const kpiSub = document.querySelector('.vehicle-kpi-card .kpi-sub.green');
    if (kpiSub) {
      kpiSub.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" class="status-dot-icon"><circle cx="12" cy="12" r="10"/></svg> ${t('veh.ready.n', { n: counts.ready })}`;
    }

    // Keep the home-screen badges in sync
    const badgeText = document.querySelector('.vehicle-badge-overlay span');
    if (badgeText) badgeText.textContent = t('veh.badge', { n: counts.all });
    const savedItemCount = document.querySelector('.vehicle-trigger .item-sub');
    if (savedItemCount) savedItemCount.textContent = t('saved.veh.sub', { n: counts.all });
  }

  vFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeVehicleFilter = btn.getAttribute('data-filter');
      applyVehicleFilter();
    });
  });

  // All buttons inside vehicle cards — delegated handler (works for static + added cards)
  const V_ACTION_MSGS = {
    'live-gps': (n, en) => en ? `Connecting Live GPS for ${n}…` : `กำลังเชื่อมต่อระบบ Live GPS คัน ${n}...`,
    'call': (n, en) => en ? `Calling ${n}…` : `กำลังโทรหา${n}...`,
    'assign': (n, en) => en ? `Creating delivery order for ${n}` : `เปิดหน้าต่างสร้างใบงานจัดส่งสำหรับ ${n}`,
    'dispatch': (n, en) => en ? `Dispatching ${n} now` : `เรียกใช้งาน${n}ทันที`,
    'charge': (n, en) => en ? `Charging status: 7.2 kW • ready in 25 min` : `สถานะการชาร์จ: 7.2 kW • จ่ายไฟปกติ พร้อมใช้งานใน 25 นาที`
  };
  if (vehicleListEl) {
    vehicleListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-v-action]');
      if (!btn) return;
      const card = btn.closest('.vehicle-item-card');
      const name = btn.getAttribute('data-v-name') || card?.querySelector('.v-name')?.textContent || '';
      const action = btn.getAttribute('data-v-action');
      if (action === 'delete') {
        card?.remove();
        refreshVehicleStats();
        applyVehicleFilter();
        showToast(t('veh.removed', { name }));
        return;
      }
      const en = (window.i18n ? window.i18n.lang : 'th') === 'en';
      const fn = V_ACTION_MSGS[action];
      if (fn) showToast(fn(name, en));
      try {
        if (action === 'dispatch' || action === 'assign') window.SFX?.success();
        else window.SFX?.pop();
      } catch (err) {}
    });
  }

  // 8b. Add New Vehicle Form
  const vehicleFormCard = document.getElementById('vehicle-form-card');
  const btnAddVehicle = document.getElementById('btn-add-vehicle');
  const btnCloseVehicleForm = document.getElementById('close-vehicle-form');
  const btnSaveVehicle = document.getElementById('btn-save-vehicle');

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function toggleVehicleForm(show) {
    if (!vehicleFormCard) return;
    vehicleFormCard.style.display = show ? 'block' : 'none';
    if (show) {
      vehicleFormCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.getElementById('vf-name')?.focus();
    }
  }

  if (btnAddVehicle) {
    btnAddVehicle.addEventListener('click', () => {
      const isHidden = !vehicleFormCard || vehicleFormCard.style.display === 'none';
      toggleVehicleForm(isHidden);
    });
  }

  if (btnCloseVehicleForm) {
    btnCloseVehicleForm.addEventListener('click', () => toggleVehicleForm(false));
  }

  const FUEL_LABELS = {
    diesel: t('fuel.diesel'),
    gasoline: t('fuel.gasoline'),
    electric: t('fuel.electric'),
    ngv: t('fuel.ngv')
  };

  if (btnSaveVehicle) {
    btnSaveVehicle.addEventListener('click', () => {
      const name = document.getElementById('vf-name')?.value.trim();
      const fuel = document.getElementById('vf-fuel')?.value || 'diesel';
      const rate = parseFloat(document.getElementById('vf-rate')?.value) || 0;
      const price = parseFloat(document.getElementById('vf-price')?.value) || 0;
      const other = parseFloat(document.getElementById('vf-other')?.value) || 0;
      const fixed = parseFloat(document.getElementById('vf-fixed')?.value) || 0;
      const co2 = parseFloat(document.getElementById('vf-co2')?.value) || 0;
      const capacity = parseFloat(document.getElementById('vf-capacity')?.value) || 0;

      if (!name) {
        showToast(t('veh.need.name'));
        document.getElementById('vf-name')?.focus();
        return;
      }

      const isElectric = fuel === 'electric';
      const costPerKm = isElectric
        ? other
        : (rate > 0 ? price / rate : 0) + other;

      const card = document.createElement('div');
      card.className = 'vehicle-item-card';
      card.setAttribute('data-status', 'ready');
      card.innerHTML = `
        <div class="v-card-top">
          <div class="v-type-icon ${isElectric ? 'ev-truck' : 'fuel-truck'}">
            ${isElectric
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="13" height="10" rx="1.5" /><path d="M14 9H18L21 12V16H14V9Z" /><circle cx="5.5" cy="17.5" r="2.2" /><circle cx="17.5" cy="17.5" r="2.2" /></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="13" height="10" rx="1.5" /><path d="M14 9H18L21 12V16H14V9Z" /><circle cx="5.5" cy="17.5" r="2.2" /><circle cx="17.5" cy="17.5" r="2.2" /></svg>'}
          </div>
          <div class="v-main-info">
            <div class="v-title-row">
              <h4 class="v-name">${escapeHtml(name)}</h4>
              <span class="v-status-badge status-ready"><svg viewBox="0 0 24 24" fill="currentColor" class="status-dot-icon"><circle cx="12" cy="12" r="10"/></svg> พร้อมใช้งาน</span>
            </div>
            <p class="v-plate">เชื้อเพลิง: <strong>${FUEL_LABELS[fuel] || fuel}</strong>${capacity > 0 ? ` • บรรทุกได้ ${capacity.toLocaleString('th-TH')} กก.` : ''}</p>
          </div>
        </div>

        <div class="v-route-preview">
          <span class="route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg></span>
          <span class="route-text">จอดประจำการ: <strong>ศูนย์กระจายสินค้า ตลาดไท</strong></span>
        </div>

        <div class="v-metrics-row">
          <div class="v-metric">
            <span class="v-m-label">ต้นทุนเชื้อเพลิง</span>
            <span class="v-m-val">${costPerKm.toFixed(2)} บาท/กม.</span>
          </div>
          <div class="v-metric">
            <span class="v-m-label">การปล่อยคาร์บอน</span>
            <span class="v-m-val ${isElectric ? 'green-text' : ''}">${co2.toFixed(2)} กก. CO₂/กม.</span>
          </div>
        </div>
        ${fixed > 0 ? `<div class="v-route-preview"><span class="route-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span><span class="route-text">ค่าคงที่ต่อรอบ: <strong>${fixed.toFixed(2)} บาท</strong></span></div>` : ''}

        <div class="v-actions-row">
          <button class="v-action-btn primary" data-v-action="assign" data-v-name="${escapeHtml(name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            มอบหมายเส้นทางจัดส่ง
          </button>
          <button class="v-action-btn secondary" data-v-action="delete" title="ลบยานพาหนะคันนี้">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            ลบ
          </button>
        </div>
      `;

      if (vehicleListEl) vehicleListEl.appendChild(card);

  // Location header (city / landmark / pin) follows the language
  function renderLocationHeader() {
    var city = document.getElementById('loc-city');
    var mark = document.getElementById('loc-landmark');
    var pin = document.getElementById('loc-pin-label');
    if (city) city.textContent = t('loc.city');
    if (mark) mark.textContent = t('loc.near');
    if (pin) pin.textContent = t('loc.city');
  }
  renderLocationHeader();
  renderProfile();
  window.onLangChange = (function (prev) {
    return function () { try { if (prev) prev(); } catch (e) {} renderLocationHeader(); renderProfile(); };
  })(window.onLangChange);

      refreshVehicleStats();
      applyVehicleFilter();

      // Reset the form for the next entry
      document.getElementById('vf-name').value = '';
      document.getElementById('vf-capacity').value = '';
      toggleVehicleForm(false);
      showToast(t('veh.added', { name }));
    });
  }

  refreshVehicleStats();

  // 9b. Theme toggle (light / dark) — persisted in localStorage
  const THEME_KEY = 'flukeblind-theme';
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  // Global header buttons (home + every subpage header) — delegated
  // Note: doToggleTheme is defined after applyTheme/currentTheme below (hoisted functions)
  function doToggleLang() {
    window.i18n.apply(window.i18n.lang === 'th' ? 'en' : 'th');
    refreshVehicleStats();
    renderMapPoints();
    updateSavedPlacesCounterUI();
    showToast(window.i18n.lang === 'en' ? 'Switched to English' : 'เปลี่ยนเป็นภาษาไทยแล้ว');
  }
  window.onLangChange = () => {
    if (typeof refreshVehicleStats === 'function') refreshVehicleStats();
    if (typeof renderMapPoints === 'function') renderMapPoints();
    if (typeof updateSavedPlacesCounterUI === 'function') updateSavedPlacesCounterUI();
    if (typeof renderCatBreakdown === 'function') renderCatBreakdown();
    if (typeof renderLocationHeader === 'function') renderLocationHeader();
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderSavedPlacesList === 'function' && document.getElementById('saved-places-modal')?.classList.contains('active')) renderSavedPlacesList();
    if (typeof renderRouteModal === 'function') renderRouteModal();
    if (typeof renderVtabFleet === 'function') renderVtabFleet();
  };

  function renderCatBreakdown() {
    document.querySelectorAll('#cat-breakdown [data-cat]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-cat')) + ' (' + el.getAttribute('data-val') + ' ' + t('unit.kg') + ')';
    });
  }
  renderCatBreakdown();

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', String(isDark));
      themeToggleBtn.title = isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด';
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Restore the saved preference (falls back to the OS setting)
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (err) { savedTheme = null; }
  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }
  applyTheme(savedTheme);

  // Global header buttons (home + every subpage header) — delegated
  function doToggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* ignore */ }
    showToast(next === 'dark' ? t('toast.dark') : t('toast.light'));
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-global-lang]')) { doToggleLang(); return; }
    if (e.target.closest('[data-global-theme]')) { doToggleTheme(); return; }
  });
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', doToggleLang);
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', doToggleTheme);
  }

  // 10. Interactive Home Map (Leaflet + OpenStreetMap — real scale & roads)
  const mapPopup = document.getElementById('map-popup');
  const closeMapPopupBtn = document.getElementById('close-map-popup');
  const popupOpenRouteBtn = document.getElementById('popup-open-route');

  const routeMapContainer = document.getElementById('interactive-route-map');
  const homeMapEl = document.getElementById('home-map-leaflet');

  /* ===== Shared map helpers ===== */

  // Fixed anchor used as the start of every route (current delivery location)
  const MAP_ORIGIN = { lat: 13.8095, lng: 100.5640, name: 'โรงเรียนสุรศักดิ์มนตรี (ตึก 3)' };

  function haversineKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const s = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(s));
  }

  /* ===== Leaflet + OpenStreetMap (no API key, scroll-to-zoom, no Ctrl needed) ===== */

  // Directions deep-link (opens Google Maps site / app, no API key needed)
  function gmapsDirUrl(origin, destination, waypoints) {
    const p = new URLSearchParams({ api: '1' });
    if (origin) p.set('origin', `${origin.lat},${origin.lng}`);
    if (destination) p.set('destination', `${destination.lat},${destination.lng}`);
    if (waypoints && waypoints.length) {
      p.set('waypoints', waypoints.map(w => `${w.lat},${w.lng}`).join('|'));
    }
    return `https://www.google.com/maps/dir/?${p.toString()}`;
  }

  // Create (once) or update a Leaflet map inside a container.
  // scrollWheelZoom: true => plain mouse-wheel / trackpad scroll zooms, no Ctrl.
  function setMapIframe(el, lat, lng, z = 15) {
    if (!el) return;
    // Fallback to Google embed if Leaflet failed to load (offline CDN)
    if (typeof L === 'undefined') {
      let iframe = el.querySelector('iframe.gmaps-embed');
      if (!iframe) {
        el.innerHTML = '';
        iframe = document.createElement('iframe');
        iframe.className = 'gmaps-embed';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        iframe.title = 'แผนที่ Google Maps';
        el.appendChild(iframe);
      }
      const src = `https://www.google.com/maps?q=${lat},${lng}&z=${z}&output=embed`;
      if (iframe.getAttribute('src') !== src) iframe.src = src;
      return;
    }
    let map = el._leafletMap;
    if (!map) {
      el.innerHTML = '';
      map = L.map(el, {
        scrollWheelZoom: true, // <-- plain scroll zooms, no Ctrl required
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        attributionControl: true
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      el._leafletMap = map;
    }
    map.setView([lat, lng], z, { animate: true });
    if (el._leafletMarker) {
      el._leafletMarker.setLatLng([lat, lng]);
    } else {
      el._leafletMarker = L.marker([lat, lng]).addTo(map);
    }
    // Fix grey tiles when the container just became visible (modal / tab)
    setTimeout(() => map.invalidateSize(), 60);
  }

  // ---- Home map (small, embedded in the saved-points card) ----
  function ensureHomeMap() {
    if (!homeMapEl) return;
    setMapIframe(homeMapEl, MAP_ORIGIN.lat, MAP_ORIGIN.lng, 15);
    // Open the delivery popup only when the pin is tapped — not on drag/zoom,
    // so scroll-zoom and panning never trigger the popup.
    const marker = homeMapEl._leafletMarker;
    if (marker && !marker._popupWired) {
      marker._popupWired = true;
      marker.on('click', (e) => {
        if (window.L && L.DomEvent) L.DomEvent.stopPropagation(e);
        if (mapPopup) mapPopup.style.display = 'block';
      });
    }
  }

  // Create the map once the card becomes visible
  const homeMapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) ensureHomeMap();
    });
  }, { threshold: 0.05 });
  if (homeMapEl) homeMapObserver.observe(homeMapEl);

  if (closeMapPopupBtn) {
    closeMapPopupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mapPopup) mapPopup.style.display = 'none';
    });
  }

  if (popupOpenRouteBtn) {
    popupOpenRouteBtn.addEventListener('click', () => {
      if (mapPopup) mapPopup.style.display = 'none';
      openRouteModal();
    });
  }

  const popupOpenMapBtn = document.getElementById('popup-open-map');
  if (popupOpenMapBtn) {
    popupOpenMapBtn.addEventListener('click', () => {
      if (mapPopup) mapPopup.style.display = 'none';
      openMapModal();
    });
  }

  const mapOpenFullBtn = document.getElementById('map-open-full');
  if (mapOpenFullBtn) {
    mapOpenFullBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMapModal();
    });
  }

  const btnOpenMapStop2 = document.getElementById('btn-open-map-stop-2');
  if (btnOpenMapStop2) {
    btnOpenMapStop2.addEventListener('click', () => {
      closeRouteModal();
      openMapModal();
    });
  }

  // 10c. Full Map Viewer Modal (Leaflet + OpenStreetMap, real roads & scale)
  const mapModal = document.getElementById('map-modal');
  const closeMapModalBtn = document.getElementById('close-map-modal');
  const closeMapBottomBtn = document.getElementById('close-map-bottom-btn');
  const mapModalBackdrop = document.getElementById('map-modal-backdrop');

  const fullMapEl = document.getElementById('full-map-leaflet');
  const fmRouteBox = document.getElementById('fm-route-box');
  const fmPointsList = document.getElementById('fm-points-list');
  const fmLegend = document.getElementById('fm-legend');
  const miniMapDots = document.getElementById('mini-map-dots');

  let fmSelectedId = null;

  // Show the selected place (or the origin when nothing is selected) on the
  // Leaflet map. Primary location only — no route drawing.
  function showFmMap(place) {
    const target = place || MAP_ORIGIN;
    setMapIframe(fullMapEl, target.lat, target.lng, 15);
    if (fullMapEl && fullMapEl._leafletMap) {
      setTimeout(() => fullMapEl._leafletMap.invalidateSize(), 80);
    }
    if (fmRouteBox) fmRouteBox.hidden = true;
  }

  function renderMapPoints() {
    // --- Toggle list ---
    if (fmPointsList) {
      if (savedPlacesData.length === 0) {
        fmPointsList.innerHTML = '<div class="fm-points-empty">ยังไม่มีจุดที่บันทึกไว้ — เพิ่มได้จากเมนู “จุดที่บันทึกไว้”</div>';
      } else {
        fmPointsList.innerHTML = '';
        savedPlacesData.forEach((place, i) => {
          const row = document.createElement('div');
          row.className = 'fm-point-row' + (place.id === fmSelectedId && place.enabled ? ' active' : '');
          row.innerHTML = `
            <span class="fm-point-color" style="background:${place.color}"></span>
            <div class="fm-point-texts">
              <span class="fm-point-name">${i + 1}. ${place.name}</span>
              <span class="fm-point-addr">${place.addr}</span>
            </div>
            <button class="fm-switch${place.enabled ? ' on' : ''}" role="switch"
                    aria-checked="${place.enabled}" aria-label="เปิด/ปิดจุด ${place.name}"></button>
          `;
          row.addEventListener('click', (e) => {
            if (e.target.closest('.fm-switch')) return;
            togglePlace(place.id);
          });
          row.querySelector('.fm-switch').addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlace(place.id);
          });
          fmPointsList.appendChild(row);
        });
      }
    }

    // --- Legend ---
    if (fmLegend) {
      fmLegend.innerHTML = savedPlacesData.map((p, i) =>
        `<span class="fm-legend-item"><span class="fm-legend-dot" style="background:${p.color}"></span>${i + 1}. ${p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name}</span>`
      ).join('');
    }

    // --- Mini-map dots (positioned by real lat/lng within the BKK bbox) ---
    if (miniMapDots) {
      // Bounding box covering the school + all saved places (with padding)
      const lats = [MAP_ORIGIN.lat, ...savedPlacesData.map(p => p.lat)];
      const lngs = [MAP_ORIGIN.lng, ...savedPlacesData.map(p => p.lng)];
      const pad = 0.02;
      const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
      const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;
      const toPct = (lat, lng) => ({
        x: ((lng - minLng) / (maxLng - minLng)) * 100,
        y: ((maxLat - lat) / (maxLat - minLat)) * 100
      });

      miniMapDots.innerHTML = savedPlacesData.map(p => {
        const pos = toPct(p.lat, p.lng);
        return `<span class="mini-map-dot" style="left:${pos.x.toFixed(1)}%; top:${pos.y.toFixed(1)}%; background:${p.color}"></span>`;
      }).join('');

      // Origin dot too
      const o = toPct(MAP_ORIGIN.lat, MAP_ORIGIN.lng);
      miniMapDots.insertAdjacentHTML('beforeend',
        `<span class="mini-map-dot" style="left:${o.x.toFixed(1)}%; top:${o.y.toFixed(1)}%; background:#1b4d32"></span>`);
    }

    updateMapInfoStrip();
  }

  function updateMapInfoStrip() {
    const nameEl = document.getElementById('fmi-name');
    const addrEl = document.getElementById('fmi-addr');
    const etaEl = document.getElementById('fmi-eta');
    const iconEl = document.getElementById('fmi-icon-1');
    const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);

    if (selected) {
      if (nameEl) nameEl.textContent = selected.name;
      if (addrEl) addrEl.textContent = selected.addr;
      if (etaEl) {
        const km = haversineKm(MAP_ORIGIN, selected) * 1.25;
        etaEl.textContent = `${km < 1 ? `${Math.round(km * 1000)} ${t('unit.m')}` : `${km.toFixed(1)} ${t('unit.km')}`} • ${t('map.from.origin')}`;
      }
      if (iconEl) {
        iconEl.style.background = selected.color + '22';
        iconEl.style.color = selected.color;
      }
    } else {
      if (nameEl) nameEl.textContent = t('map.none');
      if (addrEl) addrEl.textContent = t('map.none.hint');
      if (etaEl) etaEl.textContent = '—';
      if (iconEl) {
        iconEl.style.background = '';
        iconEl.style.color = '';
      }
    }
  }

  // Toggle a point on/off; turning one on selects it and draws its route
  function togglePlace(id) {
    const place = savedPlacesData.find(p => p.id === id);
    if (!place) return;

    if (place.enabled && fmSelectedId === id) {
      place.enabled = false;
      fmSelectedId = null;
    } else {
      place.enabled = true;
      fmSelectedId = id;
    }
    persistSavedPlaces();
    renderMapPoints();
    if (place.enabled && fmSelectedId === id) showFmMap(place);
    else showFmMap(null);
  }

  function openMapModal() {
    if (!mapModal) return;
    renderMapPoints();
    const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
    showFmMap(selected || null);
    mapModal.classList.add('active');
    mapModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMapModal() {
    if (!mapModal) return;
    mapModal.classList.remove('active');
    mapModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeMapModalBtn) closeMapModalBtn.addEventListener('click', closeMapModal);
  if (closeMapBottomBtn) closeMapBottomBtn.addEventListener('click', closeMapModal);
  if (mapModalBackdrop) mapModalBackdrop.addEventListener('click', closeMapModal);

  // "Zoom to selected point" — show the enabled/selected place (or origin)
  const fmFocusSelected = document.getElementById('fm-focus-selected');
  if (fmFocusSelected) {
    fmFocusSelected.addEventListener('click', () => {
      const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
      showFmMap(selected || null);
      showToast(selected ? t('toast.zoom.to', { name: selected.name }) : t('toast.zoom.none'));
    });
  }

  // "Directions / คลิกดูทาง" — open Google Maps directions in a new tab/app.
  // Uses the universal https://www.google.com/maps/dir/?api=1 URL (no API key).
  const fmDirectionsBtn = document.getElementById('fm-open-directions');
  if (fmDirectionsBtn) {
    fmDirectionsBtn.addEventListener('click', () => {
      const enabled = savedPlacesData.filter(p => p.enabled);
      const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
      const destination = selected || enabled[enabled.length - 1] || null;
      if (!destination) {
        showToast(t('toast.dir.need'));
        return;
      }
      const waypoints = enabled.filter(p => p.id !== destination.id);
      const url = gmapsDirUrl(MAP_ORIGIN, destination, waypoints);
      window.open(url, '_blank', 'noopener');
    });
  }

  // 11. Route & Stops Modal Handling
  const routeModal = document.getElementById('route-modal');
  const closeRouteModalBtn = document.getElementById('close-route-modal');
  const closeRouteBottomBtn = document.getElementById('close-route-bottom-btn');
  const routeModalBackdrop = document.getElementById('route-modal-backdrop');

  function openRouteModal() {
    if (routeModal) {
      routeModal.classList.add('active');
      routeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeRouteModal() {
    if (routeModal) {
      routeModal.classList.remove('active');
      routeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (closeRouteModalBtn) closeRouteModalBtn.addEventListener('click', closeRouteModal);
  if (closeRouteBottomBtn) closeRouteBottomBtn.addEventListener('click', closeRouteModal);
  if (routeModalBackdrop) routeModalBackdrop.addEventListener('click', closeRouteModal);

  // Check-in Stop Function
  let routeDeliveredCount = 1;
  window.checkinStop = function(stopIndex) {
    if (stopIndex === 2) {
      const stop2Card = document.getElementById('stop-card-2');
      const badge2 = document.getElementById('badge-stop-2');
      const stop3Card = document.getElementById('stop-card-3');
      const actions3 = document.getElementById('actions-stop-3');
      const badge3 = document.getElementById('badge-stop-3');
      const progressText = document.getElementById('route-progress-text');
      const progressFill = document.getElementById('route-progress-fill');

      if (stop2Card) {
        stop2Card.classList.remove('active');
        stop2Card.classList.add('completed');
        const dot = stop2Card.querySelector('.stop-dot');
        if (dot) {
          dot.classList.remove('pulse');
          dot.classList.add('done');
          dot.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        }
      }

      if (badge2) {
        badge2.className = 'stop-badge done';
        badge2.textContent = t('route.s2.done');
      }

      // Activate Stop 3
      if (stop3Card) {
        stop3Card.classList.remove('pending');
        stop3Card.classList.add('active');
        const dot3 = stop3Card.querySelector('.stop-dot');
        if (dot3) dot3.classList.add('pulse');
      }

      if (badge3) {
        badge3.className = 'stop-badge current';
        badge3.textContent = t('route.s3.go');
      }

      if (actions3) actions3.style.display = 'flex';

      routeDeliveredCount = 2;
      if (progressText) progressText.textContent = t('route.p2');
      if (progressFill) progressFill.style.width = '66%';

      showToast(t('route.done2'));
    } else if (stopIndex === 3) {
      const stop3Card = document.getElementById('stop-card-3');
      const badge3 = document.getElementById('badge-stop-3');
      const progressText = document.getElementById('route-progress-text');
      const progressFill = document.getElementById('route-progress-fill');
      const statusPill = document.getElementById('route-status-pill');

      if (stop3Card) {
        stop3Card.classList.remove('active');
        stop3Card.classList.add('completed');
        const dot3 = stop3Card.querySelector('.stop-dot');
        if (dot3) {
          dot3.classList.remove('pulse');
          dot3.classList.add('done');
          dot3.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        }
      }

      if (badge3) {
        badge3.className = 'stop-badge done';
        badge3.textContent = t('route.s3.done');
      }

      if (statusPill) {
        statusPill.textContent = t('route.all.done');
      }

      routeDeliveredCount = 3;
      if (progressText) progressText.textContent = t('route.p3');
      if (progressFill) progressFill.style.width = '100%';

      showToast(t('route.done3'));
      try { window.SFX && window.SFX.levelup(); } catch (e) {}
    }
  };

  // Route modal dynamic bits follow the language
  function renderRouteModal() {
    var lang = window.i18n ? window.i18n.lang : 'th';
    var count = (typeof routeDeliveredCount === 'number') ? routeDeliveredCount : 1;
    var pt = document.getElementById('route-progress-text');
    if (pt) pt.textContent = t(count >= 3 ? 'route.p3' : count === 2 ? 'route.p2' : 'route.p1');
    var sp = document.getElementById('route-status-pill');
    if (sp && count >= 3) sp.textContent = t('route.all.done');
  }
  window.onLangChange = (function (prev) {
    return function () { try { if (prev) prev(); } catch (e) {} renderRouteModal(); };
  })(window.onLangChange);
  const btnToggleAddStop = document.getElementById('btn-toggle-add-stop');
  const addStopForm = document.getElementById('add-stop-form');
  const btnSubmitStop = document.getElementById('btn-submit-stop');

  if (btnToggleAddStop && addStopForm) {
    btnToggleAddStop.addEventListener('click', () => {
      const isHidden = addStopForm.style.display === 'none';
      addStopForm.style.display = isHidden ? 'flex' : 'none';
    });
  }

  if (btnSubmitStop) {
    btnSubmitStop.addEventListener('click', () => {
      const titleInput = document.getElementById('new-stop-title');
      const detailInput = document.getElementById('new-stop-detail');
      const title = titleInput?.value.trim();
      const detail = detailInput?.value.trim() || 'พัสดุทั่วไป';

      if (!title) {
        showToast(t('stop.need.title'));
        return;
      }

      const container = document.getElementById('route-stops-container');
      if (container) {
        const stopNum = container.children.length + 1;
        const newStopCard = document.createElement('div');
        newStopCard.className = 'stop-item-card pending';
        newStopCard.innerHTML = `
          <div class="stop-indicator">
            <span class="stop-dot">${stopNum}</span>
          </div>
          <div class="stop-content">
            <div class="stop-top">
              <h4 class="stop-title">${stopNum}. ${title}</h4>
              <span class="stop-badge pending">จุดแวะเพิ่ม</span>
            </div>
            <p class="stop-detail">${detail}</p>
            <div class="stop-meta">
              <span>สถานะ: บันทึกเข้าเส้นทางแล้ว</span>
            </div>
          </div>
        `;
        container.appendChild(newStopCard);

        titleInput.value = '';
        detailInput.value = '';
        addStopForm.style.display = 'none';
        showToast(t('stop.added', { title }));
      }
    });
  }

  // 12. Saved Places Manager Modal Handling
  const savedPlacesModal = document.getElementById('saved-places-modal');
  const closeSavedPlacesModalBtn = document.getElementById('close-saved-places-modal');
  const closeSavedPlacesBottomBtn = document.getElementById('close-saved-places-bottom-btn');
  const savedPlacesBackdrop = document.getElementById('saved-places-backdrop');
  const savedPlacesContainer = document.getElementById('saved-places-container');
  const savedPlacesCounter = document.getElementById('saved-places-counter');
  const btnSaveNewPlace = document.getElementById('btn-save-new-place');

  // Colour palette used for map markers (one distinct colour per point)
  const PLACE_COLORS = [
    '#e11d48', // rose
    '#2563eb', // blue
    '#f59e0b', // amber
    '#7c3aed', // violet
    '#0891b2', // cyan
    '#db2777', // pink
    '#65a30d', // lime
    '#ea580c'  // orange
  ];

  // Fixed anchor already defined above as MAP_ORIGIN (real GPS coords).

  // Real GPS coordinates for each saved place (lat/lng on the actual map)
  let savedPlacesData = [
    {
      id: 1,
      name: 'คลังสินค้าหลัก ตลาดไท',
      addr: 'ถ.พหลโยธิน ต.คลองสอง อ.คลองหลวง ปทุมธานี',
      category: 'market',
      lat: 14.0595,
      lng: 100.5940,
      color: PLACE_COLORS[0],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    },
    {
      id: 2,
      name: 'ตึก 12 ศูนย์กระจายสินค้า คลองหลวง',
      addr: 'อ.คลองหลวง ปทุมธานี',
      category: 'warehouse',
      lat: 14.0270,
      lng: 100.6210,
      color: PLACE_COLORS[1],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>'
    },
    {
      id: 3,
      name: 'ตลาดนัดคลอง 4',
      addr: 'ต.คลองสี่ อ.คลองหลวง ปทุมธานี',
      category: 'market',
      lat: 14.0170,
      lng: 100.6020,
      color: PLACE_COLORS[2],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    }
  ];

  // Persist / restore saved places (with real lat/lng) in localStorage
  const SAVED_PLACES_KEY = 'flukeblind-places';
  function persistSavedPlaces() {
    try {
      localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(savedPlacesData));
    } catch (e) { /* storage unavailable — keep in-memory only */ }
  }
  function restoreSavedPlaces() {
    try {
      const raw = localStorage.getItem(SAVED_PLACES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) savedPlacesData = parsed;
    } catch (e) { /* corrupted data — fall back to defaults */ }
  }
  restoreSavedPlaces();

  function updateSavedPlacesCounterUI() {
    const count = savedPlacesData.length;
    if (savedPlacesCounter) {
      savedPlacesCounter.textContent = t('saved.count', { n: count });
    }
  }

  function renderSavedPlacesList() {
    if (!savedPlacesContainer) return;
    savedPlacesContainer.innerHTML = '';

    if (savedPlacesData.length === 0) {
      savedPlacesContainer.innerHTML = `
        <div class="saved-places-empty">
          <p>${t('place.empty')}</p>
        </div>
      `;
      updateSavedPlacesCounterUI();
      return;
    }

    savedPlacesData.forEach(place => {
      const row = document.createElement('div');
      row.className = 'saved-place-row';
      row.innerHTML = `
        <div class="saved-place-info">
          <div class="saved-place-icon" style="color:${place.color}; background:${place.color}1f;">${place.icon}</div>
          <div class="saved-place-texts">
            <span class="saved-place-name">${place.name}</span>
            <span class="saved-place-addr">${place.addr}</span>
          </div>
        </div>
        <button class="saved-place-del-btn" title="ลบสถานที่นี้" onclick="deleteSavedPlace(${place.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;
      savedPlacesContainer.appendChild(row);
    });

    updateSavedPlacesCounterUI();
    renderMapPoints();
  }

  window.deleteSavedPlace = function(id) {
    savedPlacesData = savedPlacesData.filter(p => p.id !== id);
    persistSavedPlaces();
    renderSavedPlacesList();
    showToast(t('place.deleted'));
  };

  if (btnSaveNewPlace) {
    btnSaveNewPlace.addEventListener('click', () => {
      const nameInput = document.getElementById('new-place-name');
      const addrInput = document.getElementById('new-place-addr');
      const catSelect = document.getElementById('new-place-cat');

      const name = nameInput?.value.trim();
      const addr = addrInput?.value.trim() || 'พิกัดกรุงเทพมหานครและปริมณฑล';
      const cat = catSelect?.value || 'school';

      if (!name) {
        showToast(t('place.need.name'));
        return;
      }

      const iconMap = {
        school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>',
        market: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        warehouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
      };

      const newPlace = {
        id: Date.now(),
        name: name,
        addr: addr,
        category: cat,
        // Random offset of ±0.02° (~2 km) around the origin so the point lands
        // on a plausible nearby street; users can drag to fine-tune later.
        lat: +(MAP_ORIGIN.lat + (Math.random() - 0.5) * 0.04).toFixed(5),
        lng: +(MAP_ORIGIN.lng + (Math.random() - 0.5) * 0.04).toFixed(5),
        color: PLACE_COLORS[savedPlacesData.length % PLACE_COLORS.length],
        enabled: false,
        icon: iconMap[cat] || '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
      };

      savedPlacesData.push(newPlace);
      persistSavedPlaces();
      renderSavedPlacesList();

      nameInput.value = '';
      addrInput.value = '';
      showToast(t('place.added', { name }));
    });
  }

  function openSavedPlacesModal() {
    renderSavedPlacesList();
    if (savedPlacesModal) {
      savedPlacesModal.classList.add('active');
      savedPlacesModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSavedPlacesModal() {
    if (savedPlacesModal) {
      savedPlacesModal.classList.remove('active');
      savedPlacesModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (closeSavedPlacesModalBtn) closeSavedPlacesModalBtn.addEventListener('click', closeSavedPlacesModal);
  if (closeSavedPlacesBottomBtn) closeSavedPlacesBottomBtn.addEventListener('click', closeSavedPlacesModal);
  if (savedPlacesBackdrop) savedPlacesBackdrop.addEventListener('click', closeSavedPlacesModal);

  // Initialize initial counter
  updateSavedPlacesCounterUI();
  renderMapPoints();

  // Close any active modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (routeModal && routeModal.classList.contains('active')) closeRouteModal();
      if (savedPlacesModal && savedPlacesModal.classList.contains('active')) closeSavedPlacesModal();
      if (vehicleModal && vehicleModal.classList.contains('active')) closeVehicleModal();
      if (mapModal && mapModal.classList.contains('active')) closeMapModal();
      if (mapPopup) mapPopup.style.display = 'none';
    }
  });

  // 13. Profile sub-pages (edit / notifications / goal)
  const profileSubs = {
    edit: document.getElementById('profile-sub-edit'),
    notif: document.getElementById('profile-sub-notif'),
    goal: document.getElementById('profile-sub-goal')
  };
  const profileMain = document.getElementById('profile-main');
  function showProfileSub(key) {
    Object.entries(profileSubs).forEach(([k, el]) => { if (el) el.hidden = k !== key; });
    if (profileMain) profileMain.style.display = key ? 'none' : '';
    if (key && profileSubs[key]) profileSubs[key].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-profile-go]').forEach(btn => {
    btn.addEventListener('click', () => showProfileSub(btn.getAttribute('data-profile-go')));
  });
  document.querySelectorAll('[data-profile-back]').forEach(btn => {
    btn.addEventListener('click', () => showProfileSub(null));
  });
  // Keep sub-page hidden when switching tabs
  const _origSwitch = switchTab;
  switchTab = function (id) {
    if (id !== 'profile') showProfileSub(null);
    _origSwitch(id);
  };
  window.switchAppTab = switchTab;

  document.querySelectorAll('[data-notif-toggle]').forEach(sw => {
    sw.addEventListener('click', () => {
      const on = !sw.classList.contains('on');
      sw.classList.toggle('on', on);
      sw.setAttribute('aria-checked', String(on));
      showToast(t(on ? 'toast.notif.on' : 'toast.notif.off'));
    });
  });
  const pfSave2 = document.getElementById('pf-save');
  if (pfSave2) pfSave2.addEventListener('click', () => {
    syncProfileFormToCard();
    const name = document.getElementById('pf-name')?.value.trim();
    if (name) {
      document.querySelectorAll('.profile-name').forEach(el => el.textContent = name);
      const school = document.getElementById('pf-school')?.value.trim();
      if (school) document.querySelectorAll('.profile-role').forEach(el => el.textContent = `นักเรียน • ${school}`);
    }
    showToast(t('toast.profile.save'));
    showProfileSub(null);
  });
  document.querySelectorAll('[data-goal-preset]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-goal-preset]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const inp = document.getElementById('goal-day');
      if (inp) inp.value = b.getAttribute('data-goal-preset');
    });
  });
  const goalSave = document.getElementById('goal-save');
  if (goalSave) goalSave.addEventListener('click', () => {
    const v = parseFloat(document.getElementById('goal-day')?.value) || 0;
    const hero = document.getElementById('goal-hero-num');
    if (hero) hero.textContent = `${v.toFixed(1)} กก./วัน`;
    showToast(t('toast.goal.save'));
    showProfileSub(null);
  });

  // Expose switchTab globally for back buttons
  // Scroll-reveal: re-trigger entrance when tab views switch / on scroll
  try {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.tab-view .card').forEach(function (c) { c.classList.add('reveal'); io.observe(c); });
  } catch (e) {}
  window.switchAppTab = switchTab;
  window.openVehicleModal = openVehicleModal;
  window.closeVehicleModal = closeVehicleModal;
  window.openRouteModal = openRouteModal;
  window.closeRouteModal = closeRouteModal;
  window.openSavedPlacesModal = openSavedPlacesModal;
  window.closeSavedPlacesModal = closeSavedPlacesModal;
  window.openMapModal = openMapModal;
  window.closeMapModal = closeMapModal;
});
