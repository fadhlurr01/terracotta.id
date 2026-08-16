/* ==========================================================================
   terracotta.id - Artisanal Coffee Roastery Bandung
   Interactive Controller with Smooth Scroll Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initScrollAnimations();
  initReservation();
  initMenuFilters();
  initNavbarActions();
});

/* Scroll Reveal Animation Engine */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .card, .menu-item-row, .welcome-grid, .pillar-card, .roastery-spotlight-box, .hours-reservation-split');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
      el.classList.add('reveal');
    }
    observer.observe(el);
  });
}

/* Navbar Scroll Effect */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* Mobile Drawer Menu */
function initMobileDrawer() {
  const hamburger = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('mobileDrawerCloseBtn');

  if (drawer) {
    if (hamburger) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.toggle('open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        drawer.classList.remove('open');
      });
    }

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && (!hamburger || !hamburger.contains(e.target))) {
        drawer.classList.remove('open');
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
    });
  }
}

/* Custom Styled Reservation Notification Modal & Admin Storage Sync */
let selectedTableInfo = null;

function initReservation() {
  const form = document.getElementById('reservationForm');
  const modal = document.getElementById('customResModal');
  const closeBtn = document.getElementById('closeResModalBtn');

  initSeatingSimulator();

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('#resGuestName') || form.querySelector('input[placeholder*="Nama"], input[placeholder*="Name"]');
    const emailInput = form.querySelector('#resGuestEmail') || form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('#resGuestPhone') || form.querySelector('input[type="tel"]');
    const dateInput = form.querySelector('#resDate') || form.querySelector('input[type="date"]');
    const timeInput = form.querySelector('#resTime') || form.querySelectorAll('select')[0];
    const guestsInput = form.querySelector('#resGuests') || form.querySelectorAll('select')[1];
    const areaInput = form.querySelector('#resArea') || form.querySelectorAll('select')[2];

    const name = nameInput?.value?.trim() || 'Tamu Terhormat';
    const email = emailInput?.value?.trim() || 'tamu@terracotta.id';
    const phone = phoneInput?.value?.trim() || '0812-3456-7890';
    const date = dateInput?.value || new Date().toISOString().split('T')[0];
    const time = timeInput?.value || '19:00 WIB';
    const guests = guestsInput?.value || '2 Orang';
    const area = areaInput?.value || 'Main Industrial Lounge';
    
    const tableTag = selectedTableInfo ? ` (Meja: ${selectedTableInfo.id} - ${selectedTableInfo.name})` : '';
    const ref = 'TRC-BDG-' + Math.floor(100000 + Math.random() * 900000);

    // Save to localStorage for Admin Portal with 100% synchronized schema
    try {
      const STORAGE_KEY = 'terracotta_reservations';
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const newReservation = {
        id: ref,
        name: name,
        phone: phone,
        email: email,
        date: date,
        time: time,
        guests: guests,
        area: area + tableTag,
        notes: selectedTableInfo ? `Pemesanan meja spesifik: ${selectedTableInfo.id} (${selectedTableInfo.name}). ${selectedTableInfo.desc}` : 'Pemesanan online melalui formulir website.',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      existing.unshift(newReservation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.warn('Storage sync error:', err);
    }

    const ticketBody = document.getElementById('resTicketDetails');
    if (ticketBody) {
      ticketBody.innerHTML = `
        <div class="ticket-row"><span>Nama Tamu:</span> <strong>${name}</strong></div>
        <div class="ticket-row"><span>Waktu Reservasi:</span> <strong>${date} pukul ${time}</strong></div>
        <div class="ticket-row"><span>Posisi & Area:</span> <strong>${area}${tableTag ? '<br><span style="color: var(--accent-terracotta); font-size: 0.8rem;">' + tableTag + '</span>' : ''}</strong></div>
        <div class="ticket-row"><span>Jumlah Tamu:</span> <strong>${guests}</strong></div>
        <div class="ticket-row"><span>Nomor WhatsApp:</span> <strong>${phone}</strong></div>
        <div class="ticket-row"><span>Kode Booking:</span> <strong style="color: var(--accent-gold);">${ref}</strong></div>
        <div class="ticket-row"><span>Status:</span> <strong style="color: #f59e0b;">Menunggu Konfirmasi Staf Roastery</strong></div>
      `;
    }

    modal.classList.add('show');
    form.reset();

    // Reset table callout
    const callout = document.getElementById('selectedTableCallout');
    if (callout) callout.style.display = 'none';
    selectedTableInfo = null;
    document.querySelectorAll('.sim-table-btn').forEach(btn => btn.classList.remove('selected'));
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

/* Interactive Seating Floor Plan Controller */
function initSeatingSimulator() {
  const tableBtns = document.querySelectorAll('.sim-table-btn');
  const inspector = document.getElementById('tableInspectorBox');
  const inspectTitle = document.getElementById('inspectTableName');
  const inspectDesc = document.getElementById('inspectTableDesc');
  const callout = document.getElementById('selectedTableCallout');
  const calloutTitle = document.getElementById('calloutTableName');
  const calloutDesc = document.getElementById('calloutTableDesc');
  const resArea = document.getElementById('resArea');
  const resGuests = document.getElementById('resGuests');

  if (tableBtns.length === 0) return;

  tableBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('occupied')) {
        alert('Meja ini sedang digunakan atau sudah memiliki reservasi pada sesi aktif.');
        return;
      }

      // Toggle active class
      tableBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const area = btn.getAttribute('data-area');
      const capacity = btn.getAttribute('data-capacity');
      const desc = btn.getAttribute('data-desc');

      selectedTableInfo = { id, name, area, capacity, desc };

      // Update Inspector
      if (inspectTitle) inspectTitle.textContent = `${id} — ${name}`;
      if (inspectDesc) inspectDesc.textContent = `Area: ${area} • Kapasitas: ${capacity} • ${desc}`;
      if (inspector) inspector.style.display = 'flex';

      // Update Form Inputs Automatically
      if (resArea && area) {
        for (let i = 0; i < resArea.options.length; i++) {
          if (resArea.options[i].value === area) {
            resArea.selectedIndex = i;
            break;
          }
        }
      }

      if (resGuests && capacity) {
        for (let i = 0; i < resGuests.options.length; i++) {
          if (resGuests.options[i].value === capacity) {
            resGuests.selectedIndex = i;
            break;
          }
        }
      }

      // Update Callout on Form
      if (callout && calloutTitle && calloutDesc) {
        calloutTitle.textContent = `Meja Terpilih: ${id} (${name})`;
        calloutDesc.textContent = `Area ${area} • ${capacity} • ${desc}`;
        callout.style.display = 'flex';
      }
    });
  });
}

/* Menu Category Filtering */
function initMenuFilters() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const items = document.querySelectorAll('.menu-item-row');

  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.getAttribute('data-category');
        items.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (cat === 'all' || itemCat === cat) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

/* Navbar Search & Admin Action Handlers */
function initNavbarActions() {
  const searchBtn = document.getElementById('navSearchBtn');
  const adminBtn = document.getElementById('navAdminBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }
}
