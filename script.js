/* ============================================================
   PORTFOLIO — script.js
   Contact form → Gmail via EmailJS (free, no backend needed)
   ============================================================

   ╔══════════════════════════════════════════════════════════╗
   ║        ONE-TIME EMAILJS SETUP  (takes ~5 minutes)       ║
   ╠══════════════════════════════════════════════════════════╣
   ║                                                          ║
   ║  STEP 1 — Create a free EmailJS account                 ║
   ║    → https://www.emailjs.com  (free tier = 200/month)   ║
   ║                                                          ║
   ║  STEP 2 — Connect your Gmail account                    ║
   ║    Dashboard → Email Services → Add New Service          ║
   ║    Choose "Gmail" → sign in → "Connect Account"         ║
   ║    Copy the SERVICE ID shown → paste as SERVICE_ID below ║
   ║                                                          ║
   ║  STEP 3 — Create an Email Template                      ║
   ║    Dashboard → Email Templates → Create New Template     ║
   ║    Set "To Email" to your Gmail address                  ║
   ║    Use this template body:                               ║
   ║                                                          ║
   ║      Subject: New message from {{from_name}}             ║
   ║      Name:    {{from_name}}                              ║
   ║      Email:   {{from_email}}                             ║
   ║      Message: {{message}}                                ║
   ║                                                          ║
   ║    Save → copy TEMPLATE ID → paste as TEMPLATE_ID below  ║
   ║                                                          ║
   ║  STEP 4 — Copy your Public Key                          ║
   ║    Dashboard → Account → General → Public Key            ║
   ║    Paste it as PUBLIC_KEY below                          ║
   ║                                                          ║
   ╚══════════════════════════════════════════════════════════╝
*/

'use strict';

/* ============================================================
   ★  REPLACE THESE THREE VALUES WITH YOUR OWN  ★
   ============================================================ */
const EMAILJS_PUBLIC_KEY  = 'WYmLdtc8t33mBJeNA';    // Account → General → Public Key
const EMAILJS_SERVICE_ID  = 'service_6knvqfn';    // Email Services → your Gmail service ID
const EMAILJS_TEMPLATE_ID = 'template_3t7d1pe';   // Email Templates → your template ID
/* ============================================================ */


/* ============================================================
   1. INITIALISE EmailJS with your public key
   ============================================================ */
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });


/* ============================================================
   2. NAVBAR — add .scrolled class when page is scrolled
   ============================================================ */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();


/* ============================================================
   3. MOBILE MENU TOGGLE
   ============================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


/* ============================================================
   4. SMOOTH SCROLL with navbar offset
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth'
    });
  });
});


/* ============================================================
   5. CUSTOM CURSOR (desktop only)
   ============================================================ */
const cursorDot = document.getElementById('cursorDot');

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    requestAnimationFrame(() => {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top  = e.clientY + 'px';
    });
  });

  document.querySelectorAll('a, button, input, textarea, .skill-tag, .project-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });

  document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; });
}


/* ============================================================
   6. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const targets = [
    '.hero-label', '.hero-name', '.hero-tagline', '.hero-actions',
    '.about-bio', '.skills-section', '.project-card', '.article-item',
    '.contact-left', '.contact-right', '.section-header',
    '.section-label-col', '.about-body',
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up');
      if (['.project-card', '.article-item', '.about-bio'].includes(sel)) {
        el.style.transitionDelay = `${i * 0.08}s`;
      }
    });
  });

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

initScrollAnimations();


/* ============================================================
   7. CONTACT FORM — sends email to your Gmail via EmailJS
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const submitBtn   = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* ── Read field values ── */
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    /* ── Validate ── */
    if (!name || !email || !message) {
      setStatus('Please fill in all fields.', 'error');
      shakeForm();
      return;
    }

    if (!isValidEmail(email)) {
      setStatus('Please enter a valid email address.', 'error');
      shakeForm();
      return;
    }

    /* ── Sending state ── */
    setSubmitState(true);
    setStatus('Sending your message…', 'info');

    /* ── Send via EmailJS ──────────────────────────────────────
       The keys here (from_name, from_email, message, reply_to)
       must match the {{variable}} names in your EmailJS template.
    ─────────────────────────────────────────────────────────── */
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  name,
          from_email: email,
          message:    message,
          reply_to:   email,   // Gmail "Reply" button will go back to the sender
        }
      );

      /* ── Success ── */
      contactForm.reset();
      setStatus('✓ Message sent! I\'ll get back to you soon.', 'success');

    } catch (err) {
      console.error('EmailJS error:', err);

      // Helpful errors for common mistakes during setup
      if (err && err.status === 400) {
        setStatus('Setup error — double-check your IDs in script.js.', 'error');
      } else if (err && err.status === 412) {
        setStatus('Template variables mismatch — check your EmailJS template.', 'error');
      } else if (err && err.status === 429) {
        setStatus('Too many requests — please try again in a few minutes.', 'error');
      } else {
        setStatus('Something went wrong. Please email me directly.', 'error');
      }

    } finally {
      setSubmitState(false);
    }
  });
}

/* ── Helpers ── */

function setSubmitState(isSending) {
  if (!submitBtn) return;
  submitBtn.disabled = isSending;
  submitBtn.style.opacity = isSending ? '0.7' : '';
  submitBtn.innerHTML = isSending
    ? 'Sending…'
    : 'Send Message <span class="arrow">→</span>';
}

function setStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.style.color =
    type === 'success' ? 'var(--accent)' :
    type === 'error'   ? '#e05e5e'       :
                         'var(--text-muted)';
}

function shakeForm() {
  if (!contactForm) return;
  contactForm.style.animation = 'none';
  // trigger reflow
  void contactForm.offsetWidth;
  contactForm.style.animation = 'shake 0.4s ease';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ============================================================
   8. ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

document.querySelectorAll('section[id]').forEach(section => {
  new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
        });
      }
    }),
    { threshold: 0.4 }
  ).observe(section);
});
