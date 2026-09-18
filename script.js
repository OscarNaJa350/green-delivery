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
      const targetId = tab.getAttribute('data-tab') || tab.getAttribute('href').replace('#', '');
      switchTab(targetId);
    });
  });

  // Activity buttons (i18n via delegation; replaces inline alert())
  document.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(t(btn.getAttribute('data-act') === 'register' ? 'act.reg.done' : 'act.done'));
    });
  });

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

  // 4. Quick Action Buttons
  const editBtn = document.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      showToast(t('toast.edit'));
    });
  }

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
  const searchInput = document.querySelector('.search-input');
  const searchSubmit = document.querySelector('.search-submit-btn');
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

  if (searchSubmit) {
    searchSubmit.addEventListener('click', handleSearch);
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
  const btnDeliveryTruck = document.getElementById('btn-delivery-truck');
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

  if (btnDeliveryTruck) {
    btnDeliveryTruck.addEventListener('click', (e) => {
      e.preventDefault();
      openVehicleModal();
    });
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
          <button class="v-action-btn primary" onclick="showToast('เปิดหน้าต่างสร้างใบงานจัดส่งสำหรับ ${escapeHtml(name)}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            มอบหมายเส้นทางจัดส่ง
          </button>
          <button class="v-action-btn secondary" data-remove-vehicle title="ลบยานพาหนะคันนี้">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            ลบ
          </button>
        </div>
      `;

      card.querySelector('[data-remove-vehicle]')?.addEventListener('click', () => {
        card.remove();
        refreshVehicleStats();
        applyVehicleFilter();
        showToast(t('veh.removed', { name }));
      });

      if (vehicleListEl) vehicleListEl.appendChild(card);

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

  // 9. Top Action Header Buttons
  const btnLocationPin = document.getElementById('btn-location-pin');
  if (btnLocationPin) {
    btnLocationPin.addEventListener('click', () => {
      // Ensure we are on home tab
      switchTab('home');
      const savedSection = document.getElementById('saved-points');
      if (savedSection) {
        savedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        savedSection.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        savedSection.style.borderColor = '#1b4d32';
        savedSection.style.boxShadow = '0 0 0 4px rgba(27, 77, 50, 0.15)';
        setTimeout(() => {
          savedSection.style.borderColor = '';
          savedSection.style.boxShadow = '';
        }, 1800);
        showToast(t('toast.pin'));
      }
    });
  }

  // 9b. Theme toggle (light / dark) — persisted in localStorage
  const THEME_KEY = 'flukeblind-theme';
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      window.i18n.apply(window.i18n.lang === 'th' ? 'en' : 'th');
      refreshVehicleStats();
      renderMapPoints();
      updateSavedPlacesCounterUI();
      showToast(window.i18n.lang === 'en' ? 'Switched to English' : 'เปลี่ยนเป็นภาษาไทยแล้ว');
    });
  }
  window.onLangChange = () => {
    if (typeof refreshVehicleStats === 'function') refreshVehicleStats();
    if (typeof renderMapPoints === 'function') renderMapPoints();
    if (typeof updateSavedPlacesCounterUI === 'function') updateSavedPlacesCounterUI();
    if (typeof renderCatBreakdown === 'function') renderCatBreakdown();
    if (typeof renderSavedPlacesList === 'function' && document.getElementById('saved-places-modal')?.classList.contains('active')) renderSavedPlacesList();
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

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* ignore */ }
      showToast(next === 'dark' ? t('toast.dark') : t('toast.light'));
    });
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
        badge2.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"/></svg> ส่งมอบเรียบร้อย 11:20 น.';
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
        badge3.textContent = 'กำลังเดินทางไปคลองหลวง';
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
        badge3.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"/></svg> ส่งมอบเรียบร้อย';
      }

      if (statusPill) {
        statusPill.textContent = t('route.all.done');
      }

      routeDeliveredCount = 3;
      if (progressText) progressText.textContent = t('route.p3');
      if (progressFill) progressFill.style.width = '100%';

      showToast(t('route.done3'));
    }
  };

  // Toggle Add Stop Form
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

  // Expose switchTab globally for back buttons
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
