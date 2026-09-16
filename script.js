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
      showToast('กำลังโหลดแผนที่ดาวเทียม กรุงเทพมหานคร...');
    });
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
  const vehicleCards = document.querySelectorAll('.vehicle-item-card');

  vFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      vehicleCards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        if (filter === 'all' || cardStatus === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

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

  const btnMainMenu = document.getElementById('btn-main-menu');
  if (btnMainMenu) {
    btnMainMenu.addEventListener('click', () => {
      switchTab('home');
      showToast('หน้าหลัก แดชบอร์ดติดตามคาร์บอน');
    });
  }

  // 10. Interactive Map Logic (Zoom, Pins, Popup)
  const mapSvg = document.getElementById('map-svg-element');
  const btnZoomIn = document.getElementById('map-zoom-in');
  const btnZoomOut = document.getElementById('map-zoom-out');
  const btnResetMap = document.getElementById('map-reset-view');
  const mapPopup = document.getElementById('map-popup');
  const closeMapPopupBtn = document.getElementById('close-map-popup');
  const mapPinSuan = document.getElementById('map-pin-suankularb');
  const movingTruck = document.getElementById('moving-route-truck');
  const popupOpenRouteBtn = document.getElementById('popup-open-route');

  let currentMapZoom = 1;

  function updateMapZoom(zoom) {
    currentMapZoom = Math.min(Math.max(zoom, 0.8), 1.8);
    if (mapSvg) {
      mapSvg.style.transform = `scale(${currentMapZoom})`;
      mapSvg.style.transformOrigin = 'center center';
      mapSvg.style.transition = 'transform 0.25s ease';
    }
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

  // Initial Saved Places state
  let savedPlacesData = [
    {
      id: 1,
      name: 'คลังสินค้าหลัก ตลาดไท',
      addr: 'ถ.พหลโยธิน ต.คลองสอง อ.คลองหลวง ปทุมธานี',
      category: 'market',
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
          <div class="saved-place-icon">${place.icon}</div>
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
        icon: iconMap[cat] || '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
      };

      savedPlacesData.push(newPlace);
      renderSavedPlacesList();

      nameInput.value = '';
      addrInput.value = '';
      showToast(`บันทึกสถานที่ "${name}" สำเร็จ!`);
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

  // Close any active modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (routeModal && routeModal.classList.contains('active')) closeRouteModal();
      if (savedPlacesModal && savedPlacesModal.classList.contains('active')) closeSavedPlacesModal();
      if (vehicleModal && vehicleModal.classList.contains('active')) closeVehicleModal();
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
});
