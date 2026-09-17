// Interactive functionality for the Carbon Tracker App
document.addEventListener('DOMContentLoaded', () => {
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

  // 2. Interactive Category Boxes (Click feedback & Toast)
  const categoryBoxes = document.querySelectorAll('.category-box');
  categoryBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const catName = box.querySelector('.cat-name')?.textContent || 'หมวดหมู่';
      const catNum = box.querySelector('.cat-num')?.textContent || '0';
      const catRate = box.querySelector('.cat-rate')?.textContent || '';
      showToast(`หมวดหมู่: ${catName} (${catNum} ${catRate})`);
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
      showToast('เปิดหน้าต่างแก้ไขข้อมูลส่วนตัว');
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

  // 5. Search Bar Functionality
  const searchInput = document.querySelector('.search-input');
  const searchSubmit = document.querySelector('.search-submit-btn');
  function handleSearch() {
    const val = searchInput?.value.trim();
    if (val) {
      showToast(`ค้นหาสถานที่: "${val}"`);
    } else {
      showToast('กรุณากรอกชื่อสถานที่ที่ต้องการค้นหา');
    }
  }

  if (searchSubmit) {
    searchSubmit.addEventListener('click', handleSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
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
        all: 'ทั้งหมด',
        ready: 'พร้อมใช้งาน',
        delivering: 'กำลังจัดส่ง',
        charging: 'กำลังชาร์จ'
      };
      btn.textContent = `${labels[filter] || filter} (${counts[filter] || 0})`;
    });

    const kpiNum = document.querySelector('.vehicle-kpi-card .kpi-num');
    if (kpiNum) kpiNum.textContent = counts.all;

    const kpiSub = document.querySelector('.vehicle-kpi-card .kpi-sub.green');
    if (kpiSub) {
      kpiSub.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" class="status-dot-icon"><circle cx="12" cy="12" r="10"/></svg> ${counts.ready} คันพร้อมใช้งาน`;
    }

    // Keep the home-screen badges in sync
    const badgeText = document.querySelector('.vehicle-badge-overlay span');
    if (badgeText) badgeText.textContent = `ยานพาหนะ ${counts.all} คัน`;
    const savedItemCount = document.querySelector('.vehicle-trigger .item-sub');
    if (savedItemCount) savedItemCount.textContent = `${counts.all} คัน • พร้อมใช้งาน`;
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
    diesel: 'ดีเซล',
    gasoline: 'เบนซิน',
    electric: 'ไฟฟ้า (EV)',
    ngv: 'NGV'
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
        showToast('กรุณาระบุชื่อรถ');
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
        showToast(`ลบยานพาหนะ "${name}" ออกจากระบบแล้ว`);
      });

      if (vehicleListEl) vehicleListEl.appendChild(card);

      refreshVehicleStats();
      applyVehicleFilter();

      // Reset the form for the next entry
      document.getElementById('vf-name').value = '';
      document.getElementById('vf-capacity').value = '';
      toggleVehicleForm(false);
      showToast(`เพิ่มยานพาหนะ "${name}" สำเร็จ!`);
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
        showToast('เลื่อนไปยังจุดส่งของและแผนที่แล้ว');
      }
    });
  }

  // 9b. Theme toggle (light / dark) — persisted in localStorage
  const THEME_KEY = 'flukeblind-theme';
  const themeToggleBtn = document.getElementById('btn-theme-toggle');

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
      showToast(next === 'dark' ? 'เปลี่ยนเป็นธีมมืดแล้ว' : 'เปลี่ยนเป็นธีมสว่างแล้ว');
    });
  }

  // 10. Interactive Map Logic (Zoom, Pins, Popup)
  const mapSvg = document.getElementById('map-svg-element');
  const mapZoomLayer = document.getElementById('map-zoom-layer');
  const btnZoomIn = document.getElementById('map-zoom-in');
  const btnZoomOut = document.getElementById('map-zoom-out');
  const btnResetMap = document.getElementById('map-reset-view');
  const mapPopup = document.getElementById('map-popup');
  const closeMapPopupBtn = document.getElementById('close-map-popup');
  const mapPinSuan = document.getElementById('map-pin-suankularb');
  const movingTruck = document.getElementById('moving-route-truck');
  const popupOpenRouteBtn = document.getElementById('popup-open-route');

  const routeMapContainer = document.getElementById('interactive-route-map');

  const MAP_MIN_ZOOM = 0.25;
  const MAP_MAX_ZOOM = 1.8;
  let currentMapZoom = 1;

  // Zooming is done by adjusting the SVG viewBox rather than a CSS transform.
  // This keeps the SVG element exactly the size of the viewport, so the map
  // always paints edge-to-edge and can never reveal blank space when zoomed out.
  // MAP_CANVAS is the full painted extent of the artwork; MAP_BASE is the region
  // that is visible at 100% zoom (the detailed city centre).
  const MAP_CANVAS = { x: 0, y: 0, w: 1040, h: 840 };
  const MAP_BASE = { x: 390, y: 315, w: 260, h: 210 };

  // Markers are HTML overlays positioned in viewport percentages, so their
  // positions are recalculated each time the viewBox changes.
  const MAP_MARKERS = [
    { el: mapPinSuan, x: 57, y: 50 },
    { el: movingTruck, x: 60, y: 48 },
  ];

  function updateMapMarkers(vb) {
    MAP_MARKERS.forEach(({ el, x, y }) => {
      if (!el) return;
      const worldX = MAP_BASE.x + (x / 100) * MAP_BASE.w;
      const worldY = MAP_BASE.y + (y / 100) * MAP_BASE.h;
      const fracX = (worldX - vb.x) / vb.w;
      const fracY = (worldY - vb.y) / vb.h;
      el.style.left = `${fracX * 100}%`;
      el.style.top = `${fracY * 100}%`;
    });
  }

  function updateMapZoom(zoom, originX, originY, smooth = true) {
    currentMapZoom = Math.min(Math.max(zoom, MAP_MIN_ZOOM), MAP_MAX_ZOOM);

    const s = currentMapZoom;
    let w = MAP_BASE.w / s;
    let h = MAP_BASE.h / s;

    const fx = originX != null ? originX / 100 : 0.5;
    const fy = originY != null ? originY / 100 : 0.5;

    // Keep the anchor point under the cursor fixed while the viewBox changes.
    const worldX = MAP_BASE.x + fx * MAP_BASE.w;
    const worldY = MAP_BASE.y + fy * MAP_BASE.h;
    let x = worldX - fx * w;
    let y = worldY - fy * h;

    // Clamp so the visible region never leaves the painted artwork.
    if (w >= MAP_CANVAS.w) {
      w = MAP_CANVAS.w;
      x = MAP_CANVAS.x;
    } else {
      x = Math.min(Math.max(x, MAP_CANVAS.x), MAP_CANVAS.x + MAP_CANVAS.w - w);
    }
    if (h >= MAP_CANVAS.h) {
      h = MAP_CANVAS.h;
      y = MAP_CANVAS.y;
    } else {
      y = Math.min(Math.max(y, MAP_CANVAS.y), MAP_CANVAS.y + MAP_CANVAS.h - h);
    }

    const vb = { x, y, w, h };
    if (mapSvg) {
      mapSvg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    }
    updateMapMarkers(vb);
  }

  // Mouse wheel / trackpad zoom, anchored to the cursor position
  if (routeMapContainer) {
    let wheelToastTimer = null;

    routeMapContainer.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();

        const rect = routeMapContainer.getBoundingClientRect();
        const originX = ((e.clientX - rect.left) / rect.width) * 100;
        const originY = ((e.clientY - rect.top) / rect.height) * 100;

        // Normalize delta across mouse wheels and trackpads
        const step = e.deltaY < 0 ? 0.12 : -0.12;
        updateMapZoom(currentMapZoom + step, originX, originY, false);

        // Debounced feedback so rapid scrolling doesn't spam toasts
        clearTimeout(wheelToastTimer);
        wheelToastTimer = setTimeout(() => {
          showToast(`ซูมแผนที่: ${Math.round(currentMapZoom * 100)}%`);
        }, 220);
      },
      { passive: false }
    );
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateMapZoom(currentMapZoom + 0.2);
      showToast(`ซูมแผนที่: ${Math.round(currentMapZoom * 100)}%`);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', (e) => {
      e.stopPropagation();
      updateMapZoom(currentMapZoom - 0.2);
      showToast(`ซูมแผนที่: ${Math.round(currentMapZoom * 100)}%`);
    });
  }

  if (btnResetMap) {
    btnResetMap.addEventListener('click', (e) => {
      e.stopPropagation();
      updateMapZoom(1);
      showToast('รีเซ็ตมุมมองแผนที่');
    });
  }

  if (mapPinSuan) {
    mapPinSuan.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mapPopup) {
        mapPopup.style.display = 'block';
      }
    });
  }

  if (movingTruck) {
    movingTruck.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('รถกระบะไฟฟ้า EV #01: อยู่ระหว่างเดินทางไป ร.ร. สุรศักดิ์มนตรี (ตึก 3)');
      if (mapPopup) {
        mapPopup.style.display = 'block';
      }
    });
  }

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

  // 10b. Full Map Viewer Modal (interactive SVG map with saved points)
  const mapModal = document.getElementById('map-modal');
  const closeMapModalBtn = document.getElementById('close-map-modal');
  const closeMapBottomBtn = document.getElementById('close-map-bottom-btn');
  const mapModalBackdrop = document.getElementById('map-modal-backdrop');

  const fmSvg = document.getElementById('full-map-svg');
  const fmMarkersLayer = document.getElementById('fm-markers-layer');
  const fmRoutePath = document.getElementById('fm-route-path');
  const fmRouteCasing = document.getElementById('fm-route-casing');
  const fmRouteEndpoints = document.getElementById('fm-route-endpoints');
  const fmRouteBox = document.getElementById('fm-route-box');
  const fmRouteTime = document.getElementById('fm-route-time');
  const fmRouteDist = document.getElementById('fm-route-dist');
  const fmPointsList = document.getElementById('fm-points-list');
  const fmLegend = document.getElementById('fm-legend');
  const miniMapDots = document.getElementById('mini-map-dots');

  // Base viewBox of the map artwork
  const FM_BASE = { x: 0, y: 0, w: 720, h: 420 };
  let fmView = { ...FM_BASE };
  let fmSelectedId = null;

  // Random scatter inside the map artwork, avoiding the very edges
  function randomMapX() { return Math.round(90 + Math.random() * 540); }
  function randomMapY() { return Math.round(70 + Math.random() * 290); }

  /* ------------------------------------------------------------------
     Road network
     The map artwork draws these exact polylines (see #full-map-svg).
     Routing snaps every point onto the nearest road and then runs
     Dijkstra over the resulting graph, so routes follow real streets
     instead of cutting across blocks.
     ------------------------------------------------------------------ */
  const FM_ROADS = [
    // [x1, y1, x2, y2, name]
    [-20, 150, 740, 120, 'ถ.พหลโยธิน'],
    [-20, 250, 740, 235, 'ถ.รังสิต-นครนายก'],
    [-20, 360, 740, 340, 'ถ.คลองหลวง'],
    [60, -20, 120, 440, 'ถ.คลองหนึ่ง'],
    [180, -20, 260, 440, 'ถ.พหลโยธินสายใน'],
    [470, -20, 430, 440, 'ถ.คลองสี่'],
    [600, -20, 640, 440, 'ถ.คลองหก']
  ];

  // Build the graph: every road is split at each intersection with another road
  const FM_GRAPH = (() => {
    const nodes = [];
    const edges = [];
    const key = (x, y) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
    const nodeIndex = new Map();

    function addNode(x, y) {
      const k = key(x, y);
      if (nodeIndex.has(k)) return nodeIndex.get(k);
      const idx = nodes.length;
      nodes.push({ x, y });
      nodeIndex.set(k, idx);
      return idx;
    }

    // Intersection of two segments (returns null when parallel / outside)
    function intersect(a, b) {
      const [x1, y1, x2, y2] = a;
      const [x3, y3, x4, y4] = b;
      const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (Math.abs(d) < 1e-6) return null;
      const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
      const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
      if (t < 0 || t > 1 || u < 0 || u > 1) return null;
      return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
    }

    FM_ROADS.forEach((road, ri) => {
      const [x1, y1, x2, y2] = road;
      // Collect split points: both endpoints plus every crossing
      const pts = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      FM_ROADS.forEach((other, oi) => {
        if (oi === ri) return;
        const hit = intersect(road, other);
        if (hit) pts.push(hit);
      });

      // Sort along the road direction, then link consecutive points
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len2 = dx * dx + dy * dy || 1;
      pts.sort((p, q) =>
        ((p.x - x1) * dx + (p.y - y1) * dy) / len2 -
        ((q.x - x1) * dx + (q.y - y1) * dy) / len2
      );

      for (let i = 0; i < pts.length - 1; i++) {
        const a = addNode(pts[i].x, pts[i].y);
        const b = addNode(pts[i + 1].x, pts[i + 1].y);
        if (a === b) continue;
        const w = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
        edges.push({ a, b, w, road: road[4] });
      }
    });

    // Adjacency list
    const adj = nodes.map(() => []);
    edges.forEach((e, i) => {
      adj[e.a].push({ to: e.b, w: e.w, edge: i });
      adj[e.b].push({ to: e.a, w: e.w, edge: i });
    });

    return { nodes, edges, adj };
  })();

  // Project a point onto a segment; returns the closest point + distance
  function projectOnSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const x = x1 + t * dx;
    const y = y1 + t * dy;
    return { x, y, dist: Math.hypot(px - x, py - y), t };
  }

  // Snap an arbitrary point onto the nearest road, returning a virtual node
  function snapToRoad(px, py) {
    let best = null;
    FM_ROADS.forEach((road, ri) => {
      const p = projectOnSegment(px, py, road[0], road[1], road[2], road[3]);
      if (!best || p.dist < best.dist) best = { ...p, road: ri };
    });
    return best;
  }

  // Dijkstra over the road graph between two virtual (snapped) nodes
  function findRoadRoute(from, to) {
    const { nodes, adj } = FM_GRAPH;
    const n = nodes.length;
    const startIdx = n;      // virtual node for `from`
    const goalIdx = n + 1;   // virtual node for `to`

    // Virtual adjacency: connect each snapped point to the two ends of its road
    const virtualAdj = [[], []];
    [from, to].forEach((pt, vi) => {
      const road = FM_ROADS[pt.road];
      const ends = [
        { x: road[0], y: road[1] },
        { x: road[2], y: road[3] }
      ];
      ends.forEach(end => {
        const idx = nodes.findIndex(nd =>
          Math.abs(nd.x - end.x) < 0.5 && Math.abs(nd.y - end.y) < 0.5);
        if (idx >= 0) {
          const w = Math.hypot(pt.x - nodes[idx].x, pt.y - nodes[idx].y);
          virtualAdj[vi].push({ to: idx, w });
        }
      });
    });

    const total = n + 2;
    const dist = new Array(total).fill(Infinity);
    const prev = new Array(total).fill(-1);
    const visited = new Array(total).fill(false);
    dist[startIdx] = 0;

    const neighbours = (i) => {
      if (i === startIdx) return virtualAdj[0];
      if (i === goalIdx) return virtualAdj[1];
      return adj[i];
    };

    for (let iter = 0; iter < total; iter++) {
      let u = -1;
      let bestD = Infinity;
      for (let i = 0; i < total; i++) {
        if (!visited[i] && dist[i] < bestD) { bestD = dist[i]; u = i; }
      }
      if (u === -1 || u === goalIdx) break;
      visited[u] = true;
      neighbours(u).forEach(({ to, w }) => {
        if (dist[u] + w < dist[to]) {
          dist[to] = dist[u] + w;
          prev[to] = u;
        }
      });
    }

    if (dist[goalIdx] === Infinity) return null;

    // Rebuild the node chain
    const chain = [];
    let cur = goalIdx;
    while (cur !== -1) {
      chain.unshift(cur);
      cur = prev[cur];
    }

    const points = chain.map(i => {
      if (i === startIdx) return { x: from.x, y: from.y };
      if (i === goalIdx) return { x: to.x, y: to.y };
      return { x: nodes[i].x, y: nodes[i].y };
    });

    return { points, distance: dist[goalIdx] };
  }

  // Build an SVG path that follows the road network
  function computeRoutePoints(target) {
    const from = snapToRoad(MAP_ORIGIN.x, MAP_ORIGIN.y);
    const to = snapToRoad(target.x, target.y);
    const route = findRoadRoute(from, to);

    if (!route) {
      // Fallback: straight line if the graph cannot connect the two points
      return {
        points: [
          { x: MAP_ORIGIN.x, y: MAP_ORIGIN.y },
          { x: target.x, y: target.y }
        ],
        distance: Math.hypot(target.x - MAP_ORIGIN.x, target.y - MAP_ORIGIN.y)
      };
    }

    // Lead-in from the true origin to its snapped point, and lead-out to target
    return {
      points: [
        { x: MAP_ORIGIN.x, y: MAP_ORIGIN.y },
        ...route.points,
        { x: target.x, y: target.y }
      ],
      distance: route.distance
    };
  }

  // Build an SVG path that follows the road network
  function buildRoutePath(target) {
    const pts = computeRoutePoints(target).points;

    // Round the corners so the line reads like a driving route
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i];
      const prev = pts[i - 1];
      const next = pts[i + 1];
      const r = Math.min(14, Math.hypot(p.x - prev.x, p.y - prev.y) / 2,
                             Math.hypot(next.x - p.x, next.y - p.y) / 2);
      const inX = p.x - (p.x - prev.x) / (Math.hypot(p.x - prev.x, p.y - prev.y) || 1) * r;
      const inY = p.y - (p.y - prev.y) / (Math.hypot(p.x - prev.x, p.y - prev.y) || 1) * r;
      const outX = p.x + (next.x - p.x) / (Math.hypot(next.x - p.x, next.y - p.y) || 1) * r;
      const outY = p.y + (next.y - p.y) / (Math.hypot(next.x - p.x, next.y - p.y) || 1) * r;
      d += ` L ${inX} ${inY} Q ${p.x} ${p.y} ${outX} ${outY}`;
    }
    const last = pts[pts.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  }

  // Point halfway along a polyline, measured by arc length
  function polylineMidpoint(points) {
    if (!points || points.length === 0) return null;
    if (points.length === 1) return points[0];

    const segs = [];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const l = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
      segs.push(l);
      total += l;
    }

    let remaining = total / 2;
    for (let i = 0; i < segs.length; i++) {
      if (remaining <= segs[i]) {
        const t = segs[i] ? remaining / segs[i] : 0;
        return {
          x: points[i].x + (points[i + 1].x - points[i].x) * t,
          y: points[i].y + (points[i + 1].y - points[i].y) * t
        };
      }
      remaining -= segs[i];
    }
    return points[points.length - 1];
  }

  // Approximate distance/time for the info strip, based on the real road route
  function routeStats(target) {
    const px = computeRoutePoints(target).distance;
    const km = (px / 720 * 42).toFixed(1);
    const mins = Math.max(4, Math.round(km * 2.4));
    return `${km} กม. • ประมาณ ${mins} นาที`;
  }

  function renderMapPoints() {
    if (!fmMarkersLayer) return;

    // --- Markers on the big map ---
    fmMarkersLayer.innerHTML = '';
    savedPlacesData.forEach((place, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'fm-marker' + (place.enabled ? '' : ' off'));
      g.setAttribute('data-id', place.id);
      g.setAttribute('data-x', place.x);
      g.setAttribute('data-y', place.y);

      const label = place.name.length > 18 ? place.name.slice(0, 17) + '…' : place.name;
      const labelW = Math.max(46, label.length * 6.4 + 16);

      g.innerHTML = `
        <g class="fm-marker-pin" filter="url(#fmShadow)">
          <path d="M0 0 C-11 -14 -16 -21 -16 -29 A16 16 0 1 1 16 -29 C16 -21 11 -14 0 0 Z"
                fill="${place.color}" stroke="#ffffff" stroke-width="2.5" />
          <circle cx="0" cy="-29" r="9.5" fill="#ffffff" opacity="0.95" />
          <text class="fm-marker-badge" x="0" y="-25.5" text-anchor="middle">${i + 1}</text>
        </g>
        <g transform="translate(0 6)">
          <rect x="${-labelW / 2}" y="0" width="${labelW}" height="18" rx="9"
                fill="${place.color}" opacity="0.96" />
          <text class="fm-marker-label" x="0" y="13" text-anchor="middle">${label}</text>
        </g>
      `;

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlace(place.id);
      });

      fmMarkersLayer.appendChild(g);
    });

    // --- Origin marker (current location) ---
    const origin = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    origin.setAttribute('class', 'fm-marker');
    origin.setAttribute('data-x', MAP_ORIGIN.x);
    origin.setAttribute('data-y', MAP_ORIGIN.y);
    origin.innerHTML = `
      <circle cx="0" cy="0" r="16" fill="#1b4d32" opacity="0.14" />
      <circle cx="0" cy="0" r="9" fill="#1b4d32" stroke="#ffffff" stroke-width="2.5" filter="url(#fmShadow)" />
      <text class="fm-marker-label" x="0" y="26" text-anchor="middle" fill="#1b4d32" stroke="#ffffff" stroke-width="3" paint-order="stroke">จุดเริ่มต้น</text>
    `;
    fmMarkersLayer.appendChild(origin);

    // --- Route path for the selected point ---
    const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
    if (selected && fmRoutePath) {
      const d = buildRoutePath(selected);
      fmRoutePath.setAttribute('d', d);
      fmRoutePath.setAttribute('opacity', '1');
      if (fmRouteCasing) {
        fmRouteCasing.setAttribute('d', d);
        fmRouteCasing.setAttribute('opacity', '1');
      }
      renderRouteEndpoints(selected);
      updateRouteBox(selected);
    } else {
      if (fmRoutePath) {
        fmRoutePath.setAttribute('d', '');
        fmRoutePath.setAttribute('opacity', '0');
      }
      if (fmRouteCasing) {
        fmRouteCasing.setAttribute('d', '');
        fmRouteCasing.setAttribute('opacity', '0');
      }
      if (fmRouteEndpoints) fmRouteEndpoints.innerHTML = '';
      if (fmRouteBox) fmRouteBox.hidden = true;
    }

    updateMarkerScale();

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

    // --- Mini-map dots ---
    if (miniMapDots) {
      miniMapDots.innerHTML = savedPlacesData.map(p =>
        `<span class="mini-map-dot" style="left:${(p.x / FM_BASE.w * 100).toFixed(1)}%; top:${(p.y / FM_BASE.h * 100).toFixed(1)}%; background:${p.color}"></span>`
      ).join('');
    }

    updateMapInfoStrip();
  }

  // Google Maps style start/end pins for the active route
  function renderRouteEndpoints(target) {
    if (!fmRouteEndpoints) return;
    fmRouteEndpoints.innerHTML = `
      <g transform="translate(${MAP_ORIGIN.x} ${MAP_ORIGIN.y})">
        <circle cx="0" cy="0" r="9" fill="#ffffff" filter="url(#fmShadow)" />
        <circle cx="0" cy="0" r="6" fill="#1a73e8" />
      </g>
      <g transform="translate(${target.x} ${target.y})">
        <path d="M0 0 C-9 -11 -13 -17 -13 -23 A13 13 0 1 1 13 -23 C13 -17 9 -11 0 0 Z"
              fill="#ea4335" stroke="#ffffff" stroke-width="2.5" filter="url(#fmShadow)" />
        <circle cx="0" cy="-23" r="4.5" fill="#ffffff" />
      </g>
    `;
  }

  // Distance / duration box anchored to the middle of the route line
  function updateRouteBox(target) {
    if (!fmRouteBox) return;
    const { points, distance } = computeRoutePoints(target);
    const km = (distance / 720 * 42).toFixed(1);
    const mins = Math.max(4, Math.round(km * 2.4));
    if (fmRouteTime) fmRouteTime.textContent = `${mins} นาที`;
    if (fmRouteDist) fmRouteDist.textContent = `${km} กม.`;

    // Place the box at the arc-length midpoint of the route, in viewport %
    const mid = polylineMidpoint(points);
    if (mid && fmSvg) {
      const rect = fmSvg.getBoundingClientRect();
      const fracX = (mid.x - fmView.x) / fmView.w;
      const fracY = (mid.y - fmView.y) / fmView.h;
      fmRouteBox.style.left = `${fracX * 100}%`;
      fmRouteBox.style.top = `${fracY * 100}%`;
    }

    fmRouteBox.hidden = false;
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
      if (etaEl) etaEl.textContent = routeStats(selected);
      if (iconEl) {
        iconEl.style.background = selected.color + '22';
        iconEl.style.color = selected.color;
      }
    } else {
      if (nameEl) nameEl.textContent = '— ยังไม่เลือกจุด —';
      if (addrEl) addrEl.textContent = 'เปิดสวิตช์จุดด้านบนเพื่อดูเส้นทาง';
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
    renderMapPoints();
  }

  // --- Zoom / pan on the SVG viewBox ---
  // Markers are SVG groups, so they scale with the viewBox. To keep them a
  // constant on-screen size (like real map pins) we counter-scale each group
  // and re-anchor it to its world coordinate.
  function updateMarkerScale() {
    if (!fmMarkersLayer) return;
    const k = fmView.w / FM_BASE.w;
    fmMarkersLayer.querySelectorAll('.fm-marker').forEach(g => {
      const x = parseFloat(g.getAttribute('data-x'));
      const y = parseFloat(g.getAttribute('data-y'));
      if (Number.isNaN(x) || Number.isNaN(y)) return;
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k})`);
    });
  }

  function applyMapView() {
    if (fmSvg) {
      fmSvg.setAttribute('viewBox', `${fmView.x} ${fmView.y} ${fmView.w} ${fmView.h}`);
    }
    updateMarkerScale();

    // The route box is an HTML overlay, so it must be re-anchored on every view change
    const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
    if (selected && fmRouteBox && !fmRouteBox.hidden) {
      const mid = polylineMidpoint(computeRoutePoints(selected).points);
      if (mid) {
        fmRouteBox.style.left = `${((mid.x - fmView.x) / fmView.w) * 100}%`;
        fmRouteBox.style.top = `${((mid.y - fmView.y) / fmView.h) * 100}%`;
      }
    }
  }

  function zoomMap(factor, anchor) {
    const cx = anchor ? anchor.x : fmView.x + fmView.w / 2;
    const cy = anchor ? anchor.y : fmView.y + fmView.h / 2;
    const newW = Math.min(FM_BASE.w * 1.6, Math.max(FM_BASE.w * 0.2, fmView.w * factor));
    const newH = newW * (FM_BASE.h / FM_BASE.w);
    // Keep the anchor point fixed on screen while zooming
    const fx = (cx - fmView.x) / fmView.w;
    const fy = (cy - fmView.y) / fmView.h;
    fmView = { x: cx - fx * newW, y: cy - fy * newH, w: newW, h: newH };
    applyMapView();
  }

  // Convert a client (screen) position into map world coordinates
  function clientToWorld(clientX, clientY) {
    if (!fmSvg) return null;
    const rect = fmSvg.getBoundingClientRect();
    return {
      x: fmView.x + ((clientX - rect.left) / rect.width) * fmView.w,
      y: fmView.y + ((clientY - rect.top) / rect.height) * fmView.h
    };
  }

  function resetMapView() {
    fmView = { ...FM_BASE };
    applyMapView();
  }

  const fmZoomIn = document.getElementById('fm-zoom-in');
  const fmZoomOut = document.getElementById('fm-zoom-out');
  const fmReset = document.getElementById('fm-reset');
  if (fmZoomIn) fmZoomIn.addEventListener('click', () => zoomMap(0.7));
  if (fmZoomOut) fmZoomOut.addEventListener('click', () => zoomMap(1.4));
  if (fmReset) fmReset.addEventListener('click', resetMapView);

  // Zoom in on the currently selected point (or the origin if none selected)
  const fmFocusSelected = document.getElementById('fm-focus-selected');
  if (fmFocusSelected) {
    fmFocusSelected.addEventListener('click', () => {
      const selected = savedPlacesData.find(p => p.id === fmSelectedId && p.enabled);
      const target = selected || MAP_ORIGIN;
      const w = FM_BASE.w * 0.45;
      const h = w * (FM_BASE.h / FM_BASE.w);
      fmView = { x: target.x - w / 2, y: target.y - h / 2, w, h };
      applyMapView();
      showToast(selected ? `ซูมไปยัง "${selected.name}"` : 'ยังไม่ได้เลือกจุด — แสดงจุดเริ่มต้น');
    });
  }

  // Drag to pan (no pointer capture, so marker clicks keep working)
  if (fmSvg) {
    let dragging = false;
    let moved = false;
    let start = null;
    const pointers = new Map();
    let pinchStart = null;

    fmSvg.addEventListener('pointerdown', (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        // Begin pinch-zoom
        const [a, b] = [...pointers.values()];
        pinchStart = {
          dist: Math.hypot(b.x - a.x, b.y - a.y),
          w: fmView.w,
          mid: clientToWorld((a.x + b.x) / 2, (a.y + b.y) / 2)
        };
        dragging = false;
        return;
      }

      dragging = true;
      moved = false;
      start = { x: e.clientX, y: e.clientY, vx: fmView.x, vy: fmView.y };
    });

    fmSvg.addEventListener('pointermove', (e) => {
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Pinch-zoom takes priority when two fingers are down
      if (pointers.size === 2 && pinchStart) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        if (pinchStart.dist > 0) {
          const targetW = pinchStart.w * (pinchStart.dist / dist);
          zoomMap(targetW / fmView.w, pinchStart.mid);
        }
        return;
      }

      if (!dragging || !start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      fmSvg.classList.add('dragging');
      const rect = fmSvg.getBoundingClientRect();
      const scale = fmView.w / rect.width;
      fmView.x = start.vx - dx * scale;
      fmView.y = start.vy - dy * scale;
      applyMapView();
    });

    const endDrag = (e) => {
      if (e && e.pointerId !== undefined) pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = null;
      dragging = false;
      start = null;
      fmSvg.classList.remove('dragging');
    };
    fmSvg.addEventListener('pointerup', endDrag);
    fmSvg.addEventListener('pointercancel', endDrag);
    fmSvg.addEventListener('pointerleave', endDrag);

    // Scroll wheel / trackpad zoom, anchored under the cursor
    fmSvg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const anchor = clientToWorld(e.clientX, e.clientY);
      zoomMap(e.deltaY > 0 ? 1.12 : 0.89, anchor);
    }, { passive: false });

    // Double-click to zoom in
    fmSvg.addEventListener('dblclick', (e) => {
      e.preventDefault();
      zoomMap(0.6, clientToWorld(e.clientX, e.clientY));
    });
  }

  function openMapModal() {
    if (!mapModal) return;
    renderMapPoints();
    resetMapView();
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
      if (progressText) progressText.textContent = 'ส่งมอบแล้ว 2 จาก 3 จุด (66%)';
      if (progressFill) progressFill.style.width = '66%';

      showToast('บันทึกส่งมอบ: โรงเรียนสุรศักดิ์มนตรี (ตึก 3) สำเร็จแล้ว!');
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
        statusPill.textContent = 'เสร็จสิ้นทุกจุดแล้ว';
      }

      routeDeliveredCount = 3;
      if (progressText) progressText.textContent = 'ส่งมอบครบถ้วน 3 จาก 3 จุด (100%)';
      if (progressFill) progressFill.style.width = '100%';

      showToast('ยอดเยี่ยม! จัดส่งครบทั้ง 3 จุดเรียบร้อยแล้ว ลดคาร์บอนรวม 8.6 กก. CO₂');
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
        showToast('กรุณาระบุชื่อสถานที่สำหรับจุดส่งใหม่');
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
        showToast(`เพิ่มจุดส่งใหม่: "${title}" สำเร็จ!`);
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

  // Fixed anchor used as the start of every route (current delivery location)
  const MAP_ORIGIN = { x: 300, y: 250, name: 'โรงเรียนสุรศักดิ์มนตรี (ตึก 3)' };

  // Initial Saved Places state
  let savedPlacesData = [
    {
      id: 1,
      name: 'คลังสินค้าหลัก ตลาดไท',
      addr: 'ถ.พหลโยธิน ต.คลองสอง อ.คลองหลวง ปทุมธานี',
      category: 'market',
      x: 150,
      y: 110,
      color: PLACE_COLORS[0],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    },
    {
      id: 2,
      name: 'ตึก 12 ศูนย์กระจายสินค้า คลองหลวง',
      addr: 'อ.คลองหลวง ปทุมธานี',
      category: 'warehouse',
      x: 545,
      y: 165,
      color: PLACE_COLORS[1],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>'
    },
    {
      id: 3,
      name: 'ตลาดนัดคลอง 4',
      addr: 'ต.คลองสี่ อ.คลองหลวง ปทุมธานี',
      category: 'market',
      x: 470,
      y: 330,
      color: PLACE_COLORS[2],
      enabled: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    }
  ];

  function updateSavedPlacesCounterUI() {
    const count = savedPlacesData.length;
    if (savedPlacesCounter) {
      savedPlacesCounter.textContent = `${count} จุด (คลิกเพื่อจัดการ)`;
    }
  }

  function renderSavedPlacesList() {
    if (!savedPlacesContainer) return;
    savedPlacesContainer.innerHTML = '';

    if (savedPlacesData.length === 0) {
      savedPlacesContainer.innerHTML = `
        <div class="saved-places-empty">
          <p><svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;vertical-align:-2px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg> ยังไม่มีสถานที่ที่บันทึกไว้</p>
          <span style="font-size: 0.74rem; color: #94a3b8;">ใช้ฟอร์มด้านล่างเพื่อบันทึกสถานที่รับ-ส่งของคุณ</span>
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
    renderSavedPlacesList();
    showToast('ลบสถานที่ที่บันทึกไว้เรียบร้อยแล้ว');
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
        showToast('กรุณาระบุชื่อสถานที่ที่ต้องการบันทึก');
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
        x: randomMapX(),
        y: randomMapY(),
        color: PLACE_COLORS[savedPlacesData.length % PLACE_COLORS.length],
        enabled: false,
        icon: iconMap[cat] || '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
      };

      savedPlacesData.push(newPlace);
      renderSavedPlacesList();

      nameInput.value = '';
      addrInput.value = '';
      showToast(`บันทึกสถานที่ "${name}" สำเร็จ! เพิ่มลงแผนที่แล้ว`);
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
