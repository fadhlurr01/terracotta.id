/* ==========================================================================
   terracotta.id - Admin Reservation Controller
   State Management & Interactive Reservation Processing Engine
   ========================================================================== */

const STORAGE_KEY = 'terracotta_reservations';

// Sample initial mock data if storage is fresh
const SEED_RESERVATIONS = [
  {
    id: 'TRC-BDG-882194',
    name: 'Dimas Wicaksono',
    phone: '081234567890',
    email: 'dimas.w@gmail.com',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: '2 Tamu',
    area: 'Indoor Roastery Bar',
    notes: 'Ulang tahun pernikahan, mohon table dekat window display sangrai.',
    status: 'pending', // pending, confirmed, completed, cancelled
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'TRC-BDG-741920',
    name: 'Clarissa Putri',
    phone: '082198765432',
    email: 'clarissa.p@yahoo.com',
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    guests: '4 Tamu',
    area: 'Outdoor Braga Terrace',
    notes: 'Coffee cupping session santai.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'TRC-BDG-619283',
    name: 'Reza Firmansyah',
    phone: '085712344321',
    email: 'reza.f@outlook.com',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    guests: '3 Tamu',
    area: 'Espresso Lounge',
    notes: 'Meeting klien arsitektur.',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'TRC-BDG-551029',
    name: 'Sarah Amalia',
    phone: '087899887766',
    email: 'sarah.amalia@gmail.com',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '18:30',
    guests: '6 Tamu',
    area: 'Mezzanine VIP Tasting Room',
    notes: 'Family gathering & artisan pastry testing.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString()
  }
];

// Active filter states
let currentFilter = 'all';
let searchQuery = '';
let selectedDate = '';

const AUTH_STORAGE_KEY = 'terracotta_admin_auth';

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initAuth();
  initEventListeners();
});

/* Initialize Auth Guard */
function initAuth() {
  const authGate = document.getElementById('authGate');
  const adminLayout = document.getElementById('adminLayout');
  const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true' || localStorage.getItem(AUTH_STORAGE_KEY) === 'true';

  if (isAuth) {
    if (authGate) authGate.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    renderDashboard();
  } else {
    if (authGate) authGate.style.display = 'flex';
    if (adminLayout) adminLayout.style.display = 'none';
    const passInput = document.getElementById('loginPass');
    if (passInput) passInput.focus();
  }
}

/* Perform Staff Login */
function handleStaffLogin(user, pass) {
  const normalizedPass = (pass || '').trim().toLowerCase();
  const isValidPass = normalizedPass === 'admin' || normalizedPass === 'terracotta' || normalizedPass === '1234';

  const errorEl = document.getElementById('authErrorMsg');
  const authCard = document.querySelector('.auth-card');

  if (isValidPass) {
    if (errorEl) errorEl.style.display = 'none';
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    const authGate = document.getElementById('authGate');
    const adminLayout = document.getElementById('adminLayout');

    if (authGate) authGate.style.display = 'none';
    if (adminLayout) {
      adminLayout.style.display = 'flex';
      adminLayout.style.animation = 'fadeIn 0.35s ease';
    }

    renderDashboard();
    showToast('Selamat Datang di Portal Manajemen Terracotta! ☕');
  } else {
    if (errorEl) {
      errorEl.style.display = 'flex';
      errorEl.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
        <span>Password salah. Masukkan kata sandi: <strong>admin</strong></span>
      `;
    }
    if (authCard) {
      authCard.classList.remove('shake');
      void authCard.offsetWidth; // trigger reflow
      authCard.classList.add('shake');
    }
  }
}

/* Staff Logout */
function handleStaffLogout() {
  if (confirm('Apakah Anda yakin ingin keluar (logout) dari sesi staf admin?')) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    
    const authGate = document.getElementById('authGate');
    const adminLayout = document.getElementById('adminLayout');
    const loginPass = document.getElementById('loginPass');
    const errorEl = document.getElementById('authErrorMsg');

    if (errorEl) errorEl.style.display = 'none';
    if (loginPass) loginPass.value = '';
    if (adminLayout) adminLayout.style.display = 'none';
    if (authGate) {
      authGate.style.display = 'flex';
      authGate.style.animation = 'fadeIn 0.3s ease';
    }

    showToast('Sesi staf telah ditutup.');
  }
}

/* Initialize Local Storage */
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESERVATIONS));
  }
}

/* Get all reservations */
function getReservations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/* Save reservations */
function saveReservations(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderDashboard();
}

/* Main Dashboard Render */
function renderDashboard() {
  const allReservations = getReservations();
  updateStats(allReservations);
  renderTable(allReservations);
}

/* Update KPI Stat Counters */
function updateStats(data) {
  const total = data.length;
  const pending = data.filter(r => r.status === 'pending').length;
  const confirmed = data.filter(r => r.status === 'confirmed').length;
  const completed = data.filter(r => r.status === 'completed').length;

  // Calculate guests for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservations = data.filter(r => r.date === todayStr && r.status !== 'cancelled');
  let totalGuestsToday = 0;
  todayReservations.forEach(r => {
    const num = parseInt(r.guests) || 2;
    totalGuestsToday += num;
  });

  const totalEl = document.getElementById('statTotal');
  const pendingEl = document.getElementById('statPending');
  const confirmedEl = document.getElementById('statConfirmed');
  const completedEl = document.getElementById('statCompleted');
  const guestsEl = document.getElementById('statGuestsToday');
  const sidebarPendingBadge = document.getElementById('sidebarPendingBadge');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (confirmedEl) confirmedEl.textContent = confirmed;
  if (completedEl) completedEl.textContent = completed;
  if (guestsEl) guestsEl.textContent = totalGuestsToday;
  if (sidebarPendingBadge) {
    sidebarPendingBadge.textContent = pending;
    sidebarPendingBadge.style.display = pending > 0 ? 'inline-block' : 'none';
  }
}

/* Render Filtered & Searched Table Rows */
function renderTable(allData) {
  const tbody = document.getElementById('reservationTableBody');
  const emptyState = document.getElementById('emptyState');
  if (!tbody) return;

  // Apply filters
  let filtered = allData.filter(item => {
    // Status filter
    if (currentFilter !== 'all' && item.status !== currentFilter) {
      return false;
    }

    // Date filter
    if (selectedDate && item.date !== selectedDate) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(q);
      const matchPhone = item.phone && item.phone.toLowerCase().includes(q);
      const matchEmail = item.email && item.email.toLowerCase().includes(q);
      const matchId = item.id && item.id.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchId;
    }

    return true;
  });

  // Sort descending by date & created time
  filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td>
        <span class="booking-code">${r.id}</span>
      </td>
      <td>
        <div class="guest-info">
          <span class="guest-name">${escapeHtml(r.name)}</span>
          <span class="guest-contact">${escapeHtml(r.phone || r.email)}</span>
        </div>
      </td>
      <td>
        <div class="date-badge">
          <span class="date-main">${formatDateDisplay(r.date)}</span>
          <span class="time-slot">${r.time || '19:00 WIB'}</span>
        </div>
      </td>
      <td>
        <strong>${escapeHtml(r.guests || '2 Tamu')}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.area || 'Indoor Bar')}</div>
      </td>
      <td>
        <span class="status-pill ${r.status}">${getStatusLabel(r.status)}</span>
      </td>
      <td>
        <div class="action-buttons">
          ${r.status === 'pending' ? `
            <button class="btn-action btn-action-accept" onclick="updateStatus('${r.id}', 'confirmed')" title="Terima & Konfirmasi Reservasi">
              <svg viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>
            </button>
            <button class="btn-action btn-action-reject" onclick="updateStatus('${r.id}', 'cancelled')" title="Tolak / Batalkan">
              <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
            </button>
          ` : ''}

          ${r.status === 'confirmed' ? `
            <button class="btn-action btn-action-complete" onclick="updateStatus('${r.id}', 'completed')" title="Tamu Hadir / Selesai">
              <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/></svg>
            </button>
            <button class="btn-action btn-action-reject" onclick="updateStatus('${r.id}', 'cancelled')" title="Batalkan Reservasi">
              <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>
            </button>
          ` : ''}

          <button class="btn-action" onclick="openDetailModal('${r.id}')" title="Lihat Detail Lengkap">
            <svg viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
          </button>
          <button class="btn-action" onclick="deleteReservation('${r.id}')" title="Hapus Data">
            <svg viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* Update status function */
window.updateStatus = function(id, newStatus) {
  const all = getReservations();
  const index = all.findIndex(r => r.id === id);
  if (index !== -1) {
    all[index].status = newStatus;
    saveReservations(all);
    showToast(`Status reservasi #${id} berhasil diubah menjadi "${getStatusLabel(newStatus)}"`);
  }
};

/* Delete reservation */
window.deleteReservation = function(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus data reservasi #${id}?`)) {
    const all = getReservations();
    const updated = all.filter(r => r.id !== id);
    saveReservations(updated);
    showToast(`Reservasi #${id} telah dihapus.`);
  }
};

/* Open Detail Modal */
window.openDetailModal = function(id) {
  const all = getReservations();
  const item = all.find(r => r.id === id);
  if (!item) return;

  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailModalBody');
  if (!modal || !body) return;

  const waPhone = item.phone ? item.phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
  const waMsg = encodeURIComponent(`Halo Kak ${item.name}, kami dari Terracotta Coffee Roastery Bandung ingin mengonfirmasi reservasi meja Anda (Kode: ${item.id}) pada tanggal ${item.date} pukul ${item.time}. Sampai jumpa di Braga! ☕`);

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <span class="booking-code" style="font-size: 1.1rem; padding: 0.4rem 1rem;">${item.id}</span>
      <div style="margin-top: 0.75rem;">
        <span class="status-pill ${item.status}" style="font-size: 0.9rem;">${getStatusLabel(item.status)}</span>
      </div>
    </div>

    <div class="detail-item-grid">
      <div class="detail-item">
        <div class="detail-label">Nama Tamu</div>
        <div class="detail-value">${escapeHtml(item.name)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Nomor WhatsApp / Telp</div>
        <div class="detail-value">${escapeHtml(item.phone || '-')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Email</div>
        <div class="detail-value">${escapeHtml(item.email || '-')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Jumlah Tamu</div>
        <div class="detail-value">${escapeHtml(item.guests || '2 Tamu')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Tanggal Kunjungan</div>
        <div class="detail-value">${formatDateDisplay(item.date)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Waktu / Sesi</div>
        <div class="detail-value">${escapeHtml(item.time || '-')}</div>
      </div>
      <div class="detail-item" style="grid-column: 1 / -1;">
        <div class="detail-label">Pilihan Area</div>
        <div class="detail-value">${escapeHtml(item.area || 'Indoor Roastery Bar')}</div>
      </div>
      <div class="detail-item" style="grid-column: 1 / -1;">
        <div class="detail-label">Catatan Khusus / Permintaan</div>
        <div class="detail-value" style="font-size: 0.9rem; font-weight: normal; color: #ddd;">${escapeHtml(item.notes || 'Tidak ada catatan khusus.')}</div>
      </div>
    </div>

    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem;">
      ${waPhone ? `
        <a href="https://wa.me/${waPhone}?text=${waMsg}" target="_blank" class="btn-admin btn-admin-gold" style="flex: 1; justify-content: center; text-decoration: none;">
          <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
          Chat WhatsApp Tamu
        </a>
      ` : ''}
      <button class="btn-admin btn-admin-outline" onclick="window.print()" style="flex: 1; justify-content: center;">
        <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z"/></svg>
        Cetak Tiket
      </button>
    </div>
  `;

  modal.classList.add('show');
};

/* Attach UI Event Listeners */
function initEventListeners() {
  // Mobile sidebar toggle with backdrop
  const sidebar = document.getElementById('adminSidebar');
  const toggleBtn = document.getElementById('adminMenuToggle');
  const backdrop = document.getElementById('adminSidebarBackdrop');

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  // Internal Sidebar Navigation Tabs
  const navReservations = document.getElementById('navReservations');
  const navDailyReport = document.getElementById('navDailyReport');
  const navAreaTables = document.getElementById('navAreaTables');

  if (navReservations) {
    navReservations.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      navReservations.classList.add('active');
      currentFilter = 'all';
      selectedDate = '';
      const dateEl = document.getElementById('adminDateFilter');
      if (dateEl) dateEl.value = '';
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });
      renderDashboard();
      closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navDailyReport) {
    navDailyReport.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      navDailyReport.classList.add('active');
      const todayStr = new Date().toISOString().split('T')[0];
      selectedDate = todayStr;
      const dateEl = document.getElementById('adminDateFilter');
      if (dateEl) dateEl.value = todayStr;
      currentFilter = 'all';
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
      });
      renderDashboard();
      closeMobileSidebar();
      showToast('Menampilkan seluruh data reservasi hari ini (' + formatDateDisplay(todayStr) + ')');
    });
  }

  if (navAreaTables) {
    navAreaTables.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      navAreaTables.classList.add('active');
      currentFilter = 'confirmed';
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'confirmed');
      });
      renderDashboard();
      closeMobileSidebar();
      showToast('Menampilkan reservasi berstatus Dikonfirmasi per area');
    });
  }

  // Filter Tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderDashboard();
    });
  });

  // Search Input
  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDashboard();
    });
  }

  // Date Filter
  const dateInput = document.getElementById('adminDateFilter');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      renderDashboard();
    });
  }

  // Add Walk-in Modal Form
  const addModal = document.getElementById('addWalkInModal');
  const openAddBtn = document.getElementById('openAddWalkInBtn');
  const closeAddBtn = document.getElementById('closeAddWalkInBtn');
  const addForm = document.getElementById('addWalkInForm');

  if (openAddBtn && addModal) {
    openAddBtn.addEventListener('click', () => {
      addModal.classList.add('show');
    });
  }

  if (closeAddBtn && addModal) {
    closeAddBtn.addEventListener('click', () => {
      addModal.classList.remove('show');
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newRes = {
        id: 'TRC-BDG-' + Math.floor(100000 + Math.random() * 900000),
        name: document.getElementById('addName').value,
        phone: document.getElementById('addPhone').value,
        email: document.getElementById('addEmail').value || 'walkin@terracotta.id',
        date: document.getElementById('addDate').value || new Date().toISOString().split('T')[0],
        time: document.getElementById('addTime').value,
        guests: document.getElementById('addGuests').value,
        area: document.getElementById('addArea').value,
        notes: document.getElementById('addNotes').value || 'Walk-in / Reservasi langsung oleh Staf Admin',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      const all = getReservations();
      all.unshift(newRes);
      saveReservations(all);

      addModal.classList.remove('show');
      addForm.reset();
      showToast(`Reservasi manual #${newRes.id} berhasil ditambahkan!`);
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.admin-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // Close buttons in modal headers
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('show'));
    });
  });

  // Export CSV Button
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  // Staff Login Form Submit
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUser')?.value || '';
      const pass = document.getElementById('loginPass')?.value || '';
      handleStaffLogin(user, pass);
    });
  }

  // Password Visibility Toggle
  const pwdToggleBtn = document.getElementById('pwdToggleBtn');
  const loginPass = document.getElementById('loginPass');
  if (pwdToggleBtn && loginPass) {
    pwdToggleBtn.addEventListener('click', () => {
      const isPwd = loginPass.getAttribute('type') === 'password';
      loginPass.setAttribute('type', isPwd ? 'text' : 'password');
      pwdToggleBtn.innerHTML = isPwd ? `
        <svg viewBox="0 0 24 24"><path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C20.67,15.41 21.5,13.79 22,12C20.27,7.61 16,4.5 12,4.5C10.6,4.5 9.27,4.79 8.05,5.31L10.18,7.44C10.74,7.16 11.35,7 12,7Z"/></svg>
      ` : `
        <svg viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>
      `;
    });
  }

  // Logout Buttons (Sidebar and Topbar)
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const topbarLogoutBtn = document.getElementById('topbarLogoutBtn');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', handleStaffLogout);
  }
  if (topbarLogoutBtn) {
    topbarLogoutBtn.addEventListener('click', handleStaffLogout);
  }
}

/* Export to CSV Function */
function exportToCSV() {
  const data = getReservations();
  if (data.length === 0) {
    alert('Tidak ada data reservasi untuk diexport.');
    return;
  }

  const headers = ['Kode Booking', 'Nama Tamu', 'Telepon', 'Email', 'Tanggal', 'Waktu', 'Jumlah Tamu', 'Area', 'Status', 'Catatan'];
  const rows = data.map(r => [
    `"${r.id}"`,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.phone || ''}"`,
    `"${r.email || ''}"`,
    `"${r.date || ''}"`,
    `"${r.time || ''}"`,
    `"${r.guests || ''}"`,
    `"${r.area || ''}"`,
    `"${r.status || ''}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `terracotta_reservasi_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Data reservasi berhasil diexport ke CSV.');
}

/* Toast Message Engine */
function showToast(message) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg style="width: 20px; height: 20px; fill: var(--accent-gold);" viewBox="0 0 24 24">
      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* Helper formatting */
function getStatusLabel(status) {
  switch (status) {
    case 'pending': return 'Menunggu Konfirmasi';
    case 'confirmed': return 'Dikonfirmasi (Siap)';
    case 'completed': return 'Selesai / Hadir';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = parts[2];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
