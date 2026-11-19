/**
 * JAABBAR 3D LIVE OPS - Main Application & UI Controller
 * JAABBAR CONCERT • SEOUL CAFÉ & SPACE
 */

function startApp() {
  // 1. Initialize Scene & Engines
  const venueScene = new VenueScene('scene-container');
  const characterManager = new CharacterManager(venueScene);

  // Load and spawn all 18 characters
  characterManager.createAllCharacters(staffManager.getAllStaff());

  // Initialize AI Controller
  const aiController = new AIController(venueScene, characterManager, staffManager, soundEngine);

  // Link AI loop to requestAnimationFrame
  let lastTime = performance.now();
  function simLoop(currentTime) {
    requestAnimationFrame(simLoop);
    const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    aiController.update(delta);
  }
  requestAnimationFrame(simLoop);

  // 2. UI Elements References
  const clockEl = document.getElementById('live-clock');
  const kpiOccupied = document.getElementById('kpi-occupied');
  const kpiServed = document.getElementById('kpi-served');
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiActive = document.getElementById('kpi-active');

  const tabTeamBtn = document.getElementById('tab-btn-team');
  const tabLogBtn = document.getElementById('tab-btn-log');
  const tabZoneBtn = document.getElementById('tab-btn-zone');

  const tabTeamContent = document.getElementById('tab-content-team');
  const tabLogContent = document.getElementById('tab-content-log');
  const tabZoneContent = document.getElementById('tab-content-zone');

  const staffListContainer = document.getElementById('staff-list-container');
  const activityLogContainer = document.getElementById('activity-log-container');
  const staffSearchInput = document.getElementById('staff-search-input');

  const followBanner = document.getElementById('follow-banner');
  const followAvatar = document.getElementById('follow-avatar');
  const followName = document.getElementById('follow-name');
  const followRole = document.getElementById('follow-role');
  const followStatus = document.getElementById('follow-status');
  const followTasks = document.getElementById('follow-tasks');
  const followEditBtn = document.getElementById('follow-edit-btn');
  const followCloseBtn = document.getElementById('follow-close-btn');

  // Edit Modal Elements
  const editModal = document.getElementById('edit-staff-modal');
  const editStaffRoleIcon = document.getElementById('edit-staff-role-icon');
  const editStaffRoleBadge = document.getElementById('edit-staff-role-badge');
  const editStaffDeptName = document.getElementById('edit-staff-dept-name');
  const editStaffTitleDisplay = document.getElementById('edit-staff-title-display');
  const editStaffIdBadge = document.getElementById('edit-staff-id-badge');
  const editStaffIdInput = document.getElementById('edit-staff-id');
  const editStaffNameInput = document.getElementById('edit-staff-name');
  const editStaffNicknameInput = document.getElementById('edit-staff-nickname');
  const editStaffTitleInput = document.getElementById('edit-staff-title');
  const editModalSaveBtn = document.getElementById('edit-modal-save');
  const editModalCancelBtn = document.getElementById('edit-modal-cancel');
  const editModalCloseIcon = document.getElementById('edit-modal-close-icon');

  const resetAllNamesBtn = document.getElementById('reset-all-names-btn');
  const toastEl = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');

  let currentEditingStaffId = null;
  let currentFollowedStaff = null;
  let currentActiveTab = 'team';

  // 3. Digital Thai Clock
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('th-TH', { hour12: false }) + ' น.';
  }
  updateClock();
  setInterval(updateClock, 1000);

  // 4. Tab Navigation
  function switchTab(tabKey) {
    currentActiveTab = tabKey;
    soundEngine.playClick();

    [tabTeamBtn, tabLogBtn, tabZoneBtn].forEach(b => {
      b.classList.remove('text-cyan-400', 'border-b-2', 'border-cyan-400', 'bg-slate-800/50');
      b.classList.add('text-slate-400');
    });

    [tabTeamContent, tabLogContent, tabZoneContent].forEach(c => c.classList.add('hidden'));

    if (tabKey === 'team') {
      tabTeamBtn.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400', 'bg-slate-800/50');
      tabTeamBtn.classList.remove('text-slate-400');
      tabTeamContent.classList.remove('hidden');
    } else if (tabKey === 'log') {
      tabLogBtn.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400', 'bg-slate-800/50');
      tabLogBtn.classList.remove('text-slate-400');
      tabLogContent.classList.remove('hidden');
    } else if (tabKey === 'zone') {
      tabZoneBtn.classList.add('text-cyan-400', 'border-b-2', 'border-cyan-400', 'bg-slate-800/50');
      tabZoneBtn.classList.remove('text-slate-400');
      tabZoneContent.classList.remove('hidden');
    }
  }

  tabTeamBtn.addEventListener('click', () => switchTab('team'));
  tabLogBtn.addEventListener('click', () => switchTab('log'));
  tabZoneBtn.addEventListener('click', () => switchTab('zone'));

  // 5. Render Staff List in Sidebar
  function renderStaffList(filterText = '') {
    staffListContainer.innerHTML = '';
    const allStaff = staffManager.getAllStaff();

    const filtered = allStaff.filter(s => {
      if (!filterText) return true;
      const q = filterText.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.deptName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      staffListContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500 text-xs">
          ไม่พบรายชื่อพนักงานที่ตรงกับคำค้นหา
        </div>`;
      return;
    }

    filtered.forEach(staff => {
      const card = document.createElement('div');
      card.className = `p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 transition flex flex-col gap-2 cursor-pointer group`;
      card.dataset.staffId = staff.id;

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base" style="background-color: ${staff.color}25; border: 1px solid ${staff.color}">
              ${staff.icon}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-semibold text-xs text-white group-hover:text-cyan-300 transition staff-name-label">${staff.name}</span>
                <span class="text-[10px] text-slate-400">(${staff.id})</span>
              </div>
              <div class="text-[11px] text-slate-400">${staff.title}</div>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5">
            <button class="edit-btn px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition shadow-sm" title="แก้ไขป้ายชื่อพนักงาน">
              <span>✏️</span> <span>แก้ไขชื่อ</span>
            </button>
            <button class="focus-btn p-1.5 rounded-lg hover:bg-slate-700/80 text-cyan-400 hover:text-cyan-300 text-xs border border-transparent hover:border-slate-600 transition" title="ติดตามตัวละคร 3D">
              🔍
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
          <div class="flex items-center gap-1.5 text-slate-300">
            <span class="w-2 h-2 rounded-full animate-pulse" style="background-color: ${staff.color}"></span>
            <span class="truncate max-w-[190px] staff-status-label">${staff.currentStatus}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            ${staff.tasksCompleted || 0} รายการ
          </span>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) return;
        selectAndFollowStaff(staff);
      });

      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(staff);
      });

      staffListContainer.appendChild(card);
    });
  }

  staffSearchInput.addEventListener('input', (e) => {
    renderStaffList(e.target.value);
  });

  // 6. Select and Follow Staff
  function selectAndFollowStaff(staff) {
    const char = characterManager.getCharacterById(staff.id);
    if (!char) return;

    currentFollowedStaff = staff;
    venueScene.followStaff(char.group);

    followAvatar.textContent = staff.icon;
    followAvatar.style.backgroundColor = `${staff.color}25`;
    followAvatar.style.border = `1px solid ${staff.color}`;

    followName.textContent = staff.name;
    followRole.textContent = `${staff.role} • ${staff.title}`;
    followRole.style.color = staff.color;
    followStatus.textContent = staff.currentStatus;
    followTasks.textContent = `${staff.tasksCompleted || 0} งานเสร็จ`;

    followBanner.classList.remove('hidden');
    soundEngine.playClick();
  }

  function unfollowStaff() {
    currentFollowedStaff = null;
    venueScene.unfollowStaff();
    followBanner.classList.add('hidden');
  }

  followCloseBtn.addEventListener('click', unfollowStaff);
  window.addEventListener('cancelFollow', unfollowStaff);

  followEditBtn.addEventListener('click', () => {
    if (currentFollowedStaff) {
      openEditModal(currentFollowedStaff);
    }
  });

  // 7. Edit Staff Name Tag Modal System
  function openEditModal(staff) {
    currentEditingStaffId = staff.id;

    if (editStaffRoleIcon) editStaffRoleIcon.textContent = staff.icon;
    if (editStaffRoleBadge) {
      editStaffRoleBadge.textContent = staff.role;
      editStaffRoleBadge.style.backgroundColor = staff.color;
    }
    if (editStaffDeptName) editStaffDeptName.textContent = staff.deptName;
    if (editStaffTitleDisplay) editStaffTitleDisplay.textContent = staff.title;
    if (editStaffIdBadge) editStaffIdBadge.textContent = staff.id;

    editStaffIdInput.value = staff.id;
    editStaffNameInput.value = staff.name;
    editStaffNicknameInput.value = staff.nickname || '';
    editStaffTitleInput.value = staff.title || '';

    editModal.classList.remove('hidden');
    setTimeout(() => {
      editStaffNameInput.focus();
      editStaffNameInput.select();
    }, 50);

    soundEngine.playClick();
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    currentEditingStaffId = null;
  }

  function saveEditedStaff() {
    if (!currentEditingStaffId) return;

    const newName = editStaffNameInput.value.trim();
    const newNickname = editStaffNicknameInput.value.trim();
    const newTitle = editStaffTitleInput.value.trim();
    const newId = editStaffIdInput.value.trim();

    if (!newName) {
      alert('กรุณากรอกชื่อพนักงาน');
      editStaffNameInput.focus();
      return;
    }

    const updatedStaff = staffManager.saveStaffName(currentEditingStaffId, newName, newNickname, newTitle, newId);

    if (updatedStaff) {
      characterManager.updateStaffProfile(updatedStaff);
      renderStaffList(staffSearchInput.value);

      if (currentFollowedStaff && currentFollowedStaff.id === updatedStaff.id) {
        followName.textContent = updatedStaff.name;
        followRole.textContent = `${updatedStaff.role} • ${updatedStaff.title}`;
      }

      aiController.addLog(
        'แก้ไขชื่อ',
        `✏️ แก้ไขชื่อพนักงานเป็น "${updatedStaff.name}" (${updatedStaff.role}) เรียบร้อยแล้ว`,
        '#f59e0b'
      );

      showToast(`บันทึกชื่อ "${updatedStaff.name}" สำเร็จ (บันทึกลง localStorage เรียบร้อย)`);
      soundEngine.playServeChime();
    }

    closeEditModal();
  }

  editModalSaveBtn.addEventListener('click', saveEditedStaff);
  editModalCancelBtn.addEventListener('click', closeEditModal);
  editModalCloseIcon.addEventListener('click', closeEditModal);

  editStaffNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedStaff();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  });

  resetAllNamesBtn.addEventListener('click', () => {
    const confirmed = confirm(
      'ต้องการรีเซ็ตชื่อพนักงานทั้งหมด 18 คน คืนค่าเริ่มต้นหรือไม่?\n\n' +
      '(ข้อมูลชื่อที่เคยบันทึกไว้ใน localStorage: jaabbar_custom_staff_names จะถูกล้างทั้งหมด)'
    );

    if (confirmed) {
      staffManager.resetToDefault();
      const allStaff = staffManager.getAllStaff();

      allStaff.forEach(s => characterManager.updateStaffProfile(s));
      renderStaffList();

      if (currentFollowedStaff) {
        const resetStaff = staffManager.getStaffById(currentFollowedStaff.id);
        if (resetStaff) {
          followName.textContent = resetStaff.name;
          followRole.textContent = `${resetStaff.role} • ${resetStaff.title}`;
        }
      }

      aiController.addLog('รีเซ็ตระบบ', '🔄 คืนค่าชื่อพนักงานทั้งหมด 18 อัตราเป็นค่าเริ่มต้นเรียบร้อยแล้ว', '#38bdf8');
      showToast('คืนค่าชื่อเริ่มต้นพนักงานทั้งหมด 18 คนเรียบร้อยแล้ว');
      soundEngine.playClick();
    }
  });

  // 8. Toast Helper
  function showToast(message) {
    toastMsg.textContent = message;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('show'), 10);

    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.classList.add('hidden'), 350);
    }, 3200);
  }

  // 9. Camera Controls Buttons
  const camOverviewBtn = document.getElementById('cam-overview-btn');
  const camStageBtn = document.getElementById('cam-stage-btn');
  const camBarBtn = document.getElementById('cam-bar-btn');
  const camKitchenBtn = document.getElementById('cam-kitchen-btn');

  const camButtons = [camOverviewBtn, camStageBtn, camBarBtn, camKitchenBtn];
  function setCamActive(activeBtn) {
    camButtons.forEach(b => {
      b.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50');
      b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
    });
    activeBtn.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50');
    activeBtn.classList.remove('bg-slate-800/80', 'text-slate-300');
    soundEngine.playClick();
  }

  camOverviewBtn.addEventListener('click', () => {
    setCamActive(camOverviewBtn);
    venueScene.setCameraPreset('overview');
  });
  camStageBtn.addEventListener('click', () => {
    setCamActive(camStageBtn);
    venueScene.setCameraPreset('stage');
  });
  camBarBtn.addEventListener('click', () => {
    setCamActive(camBarBtn);
    venueScene.setCameraPreset('bar');
  });
  camKitchenBtn.addEventListener('click', () => {
    setCamActive(camKitchenBtn);
    venueScene.setCameraPreset('kitchen');
  });

  // 10. Simulation Speed & Controls
  const speed1xBtn = document.getElementById('speed-1x-btn');
  const speed2xBtn = document.getElementById('speed-2x-btn');
  const speedPauseBtn = document.getElementById('speed-pause-btn');

  function setSpeedActive(activeBtn, speed) {
    [speed1xBtn, speed2xBtn, speedPauseBtn].forEach(b => {
      b.classList.remove('bg-cyan-500', 'text-slate-950', 'font-bold');
      b.classList.add('bg-slate-800', 'text-slate-300');
    });
    activeBtn.classList.add('bg-cyan-500', 'text-slate-950', 'font-bold');
    activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    aiController.setSpeed(speed);
    soundEngine.playClick();
  }

  speed1xBtn.addEventListener('click', () => setSpeedActive(speed1xBtn, 1.0));
  speed2xBtn.addEventListener('click', () => setSpeedActive(speed2xBtn, 2.0));
  speedPauseBtn.addEventListener('click', () => setSpeedActive(speedPauseBtn, 0.0));

  const toggleTagsBtn = document.getElementById('toggle-tags-btn');
  toggleTagsBtn.addEventListener('click', () => {
    const isVisible = venueScene.toggleNameTags();
    toggleTagsBtn.innerHTML = isVisible ? '🏷️ ซ่อนป้ายชื่อ' : '🏷️ แสดงป้ายชื่อ';
    soundEngine.playClick();
  });

  const rushHourBtn = document.getElementById('rush-hour-btn');
  rushHourBtn.addEventListener('click', () => {
    const isRush = aiController.toggleRushHour();
    rushHourBtn.classList.toggle('bg-red-500/30', isRush);
    rushHourBtn.classList.toggle('border-red-500', isRush);
    soundEngine.playClick();
  });

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  soundToggleBtn.addEventListener('click', () => {
    const isUnmuted = soundEngine.toggleMute();
    soundToggleBtn.innerHTML = isUnmuted ? '🔊 ปิดเสียง' : '🔇 เปิดเสียง';
  });

  // 11. Department Filter Pills
  const deptPills = document.querySelectorAll('.dept-filter-pill');
  deptPills.forEach(pill => {
    pill.addEventListener('click', () => {
      deptPills.forEach(p => {
        p.classList.remove('bg-cyan-500', 'text-slate-950', 'font-semibold');
        p.classList.add('bg-slate-800/80', 'text-slate-400');
      });
      pill.classList.add('bg-cyan-500', 'text-slate-950', 'font-semibold');
      pill.classList.remove('bg-slate-800/80', 'text-slate-400');

      const dept = pill.dataset.dept;
      characterManager.filterByDepartment(dept);
      soundEngine.playClick();
    });
  });

  // 12. Listen to AI Events
  window.addEventListener('newActivityLog', (e) => {
    const log = e.detail.log;
    const logItem = document.createElement('div');
    logItem.className = 'p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs animate-fadeIn';
    logItem.innerHTML = `
      <span class="text-[10px] text-slate-500 font-mono mt-0.5 whitespace-nowrap">${log.time}</span>
      <div class="flex-1">
        <span class="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mr-1" style="background-color: ${log.color}20; color: ${log.color}; border: 1px solid ${log.color}50">
          ${log.category}
        </span>
        <span class="text-slate-200">${log.message}</span>
      </div>
    `;

    activityLogContainer.insertBefore(logItem, activityLogContainer.firstChild);

    if (activityLogContainer.children.length > 60) {
      activityLogContainer.removeChild(activityLogContainer.lastChild);
    }
  });

  window.addEventListener('updateKpiMetrics', (e) => {
    const m = e.detail.metrics;
    kpiOccupied.textContent = `${m.occupiedTables} / ${m.totalTables}`;
    kpiServed.textContent = m.completedOrders.toLocaleString();
    kpiRevenue.textContent = `฿${m.liveRevenue.toLocaleString()}`;
    kpiActive.textContent = m.activeOrders.toLocaleString();

    if (currentFollowedStaff) {
      const char = characterManager.getCharacterById(currentFollowedStaff.id);
      if (char) {
        followTasks.textContent = `${char.staffData.tasksCompleted || 0} งานเสร็จ`;
        followStatus.textContent = char.statusText;
      }
    }
  });

  window.addEventListener('selectStaff', (e) => {
    selectAndFollowStaff(e.detail.staff);
    switchTab('team');
  });

  window.addEventListener('openEditStaffModal', (e) => {
    openEditModal(e.detail.staff);
  });

  window.addEventListener('selectTable', (e) => {
    const { tableId, data } = e.detail;
    venueScene.focusOnTable(tableId);
    switchTab('zone');
    showToast(`ซูมไปยัง [โต๊ะ ${data.label}] เรียบร้อยแล้ว`);
  });

  // 13. Render Zone Breakdown & Table Quick Fly Grid
  function renderZoneBreakdown() {
    const vipGrid = document.getElementById('zone-vip-tables');
    const aGrid = document.getElementById('zone-a-tables');
    const sofaGrid = document.getElementById('zone-sofa-tables');
    const bGrid = document.getElementById('zone-b-tables');
    const barGrid = document.getElementById('zone-bar-tables');

    TABLES_CONFIG.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center';
      btn.textContent = t.number;
      btn.title = `คลิกเพื่อบินกล้องไปดูโต๊ะ ${t.label}`;

      btn.addEventListener('click', () => {
        venueScene.focusOnTable(t.id);
        soundEngine.playClick();
        showToast(`กำลังบินกล้องไปยังโต๊ะ ${t.label}`);
      });

      if (t.zone === 'VIP' && vipGrid) vipGrid.appendChild(btn);
      else if (t.zone === 'ZONE_A' && aGrid) aGrid.appendChild(btn);
      else if (t.zone === 'ZONE_SOFA' && sofaGrid) sofaGrid.appendChild(btn);
      else if (t.zone === 'ZONE_B' && bGrid) bGrid.appendChild(btn);
      else if (t.zone === 'BAR' && barGrid) barGrid.appendChild(btn);
    });
  }

  // Initial UI Render
  renderStaffList();
  renderZoneBreakdown();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
