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
  initSearchAndCart();
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

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}

/* Custom Styled Reservation Notification Modal */
function initReservation() {
  const form = document.getElementById('reservationForm');
  const modal = document.getElementById('customResModal');
  const closeBtn = document.getElementById('closeResModalBtn');

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('input[placeholder*="Nama"], input[placeholder*="Name"]')?.value || 'Tamu Terhormat';
    const email = form.querySelector('input[type="email"]')?.value || 'tamu@terracotta.id';
    const date = form.querySelector('input[type="date"]')?.value || 'Hari Ini';
    const timeSelect = form.querySelector('select');
    const time = timeSelect ? timeSelect.value : '07:00 PM';
    const ref = 'TRC-BDG-' + Math.floor(100000 + Math.random() * 900000);

    const ticketBody = document.getElementById('resTicketDetails');
    if (ticketBody) {
      ticketBody.innerHTML = `
        <div class="ticket-row"><span>Nama Tamu:</span> <strong>${name}</strong></div>
        <div class="ticket-row"><span>Waktu Reservasi:</span> <strong>${date} pukul ${time}</strong></div>
        <div class="ticket-row"><span>Email Konfirmasi:</span> <strong>${email}</strong></div>
        <div class="ticket-row"><span>Kode Booking:</span> <strong style="color: var(--accent-gold);">${ref}</strong></div>
        <div class="ticket-row"><span>Lokasi:</span> <strong>Terracotta Roastery Bandung (Braga)</strong></div>
        <div class="ticket-row"><span>Status:</span> <strong style="color: #5ad491;">Terkonfirmasi & Siap ✓</strong></div>
      `;
    }

    modal.classList.add('show');
    form.reset();
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

/* Navbar Search & Cart Action Handlers */
function initSearchAndCart() {
  const searchBtn = document.getElementById('navSearchBtn');
  const cartBtn = document.getElementById('navCartBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }
}
