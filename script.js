/* =========================================================
   script.js – Vishwanatha Printers
   =========================================================
   IMPORTANT: Replace the placeholder below with your actual
   Google Apps Script Web App URL after deployment.
   ========================================================= */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJZxXHVAwpRUdaRnjdJY0pIYKtPgvQZPt1I1xvD6WNEakzwrAf27WjZGJQimCLeJjb/exec';

/* ── DOM Ready ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroAnimations();
  initScrollAnimations();
  initGallery();
  initLightbox();
  initQuoteForm();
  initScrollTop();
  setFooterYear();
  initFaq();
});

/* ── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allLinks = navLinks.querySelectorAll('.nav-link');

  // Sticky on scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    allLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  }
}

/* ── Hero fade-in ───────────────────────────────────────── */
function initHeroAnimations() {
  const elements = document.querySelectorAll('.hero .fade-up');
  elements.forEach(el => {
    setTimeout(() => el.classList.add('visible'), 200);
  });
}

/* ── Scroll-triggered animations ───────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.fade-up:not(.hero .fade-up)').forEach(el => observer.observe(el));

  // Animate cards on scroll
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .contact-card, .gallery-item, .review-card, .trust-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    cardObserver.observe(el);
  });
}

/* ── Gallery & Filter ───────────────────────────────────── */
function initGallery() {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
}

/* ── Lightbox ───────────────────────────────────────────── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentIndex = 0;
  let visibleItems = [];

  function getVisibleItems() {
    return [...document.querySelectorAll('.gallery-item:not(.hidden)')];
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    currentIndex = index;
    showImage(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showImage(index) {
    const item = visibleItems[index];
    if (!item) return;
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span');
    lbImg.src = img ? img.src : '';
    lbCaption.textContent = caption ? caption.textContent : '';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      visibleItems = getVisibleItems();
      const visIndex = visibleItems.indexOf(item);
      openLightbox(visIndex >= 0 ? visIndex : 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lbPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showImage(currentIndex);
  });
  lbNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showImage(currentIndex);
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
  });
}

/* ── Quote Form ─────────────────────────────────────────── */
function initQuoteForm() {
  const form = document.getElementById('quote-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const successEl = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    // UI loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    successEl.style.display = 'none';
    errorEl.style.display = 'none';

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || 'Not provided',
      printType: formData.get('printType'),
      quantity: formData.get('quantity'),
      paperType: formData.get('paperType') || 'Not specified',
      printSize: formData.get('printSize') || 'Not specified',
      notes: formData.get('notes') || '',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      source: 'Website – Vishwanatha Printers'
    };

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',  // Google Apps Script requires no-cors
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // no-cors gives opaque response – treat as success
      form.reset();
      successEl.style.display = 'flex';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Google Analytics event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', { event_category: 'Enquiry', event_label: payload.printType });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      errorEl.style.display = 'flex';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Enquiry';
    }
  });
}

function validateForm(form) {
  const name = form.querySelector('#f-name');
  const phone = form.querySelector('#f-phone');
  const type = form.querySelector('#f-print-type');
  const qty = form.querySelector('#f-qty');

  clearErrors(form);
  let valid = true;

  if (!name.value.trim()) { showError(name, 'Please enter your name'); valid = false; }
  if (!phone.value.trim() || !/^[6-9]\d{9}$/.test(phone.value.trim())) {
    showError(phone, 'Enter a valid 10-digit mobile number'); valid = false;
  }
  if (!type.value) { showError(type, 'Please select printing type'); valid = false; }
  if (!qty.value || qty.value < 1) { showError(qty, 'Enter a valid quantity'); valid = false; }

  return valid;
}

function showError(input, msg) {
  input.style.borderColor = '#ef4444';
  const err = document.createElement('span');
  err.className = 'field-error';
  err.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:2px;display:block;';
  err.textContent = msg;
  input.parentElement.appendChild(err);
  input.addEventListener('input', () => {
    input.style.borderColor = '';
    err.remove();
  }, { once: true });
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('input,select,textarea').forEach(el => el.style.borderColor = '');
}

/* ── Scroll-to-top button ───────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Footer Year ────────────────────────────────────────── */
function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── FAQ Accordion ──────────────────────────────────────── */
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all open items
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
