/* ============================================================
   ATSify — script.js
   All interactive features: upload, dashboard, animations,
   dark/light toggle, mobile menu, FAQ, pricing toggle, scroll
   ============================================================ */

'use strict';

/* ── Utility ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. NAVBAR — scroll effect + mobile menu
============================================================ */
const navbar   = $('#navbar');
const hamburger = $('#hamburger');
const navLinks  = $('#navLinks');

// Add scrolled class when page scrolls
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile hamburger toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
navLinks.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ============================================================
   2. DARK / LIGHT THEME TOGGLE
============================================================ */
const themeToggle = $('#themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-icon');
const html        = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('atsify-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀' : '☾';
  localStorage.setItem('atsify-theme', next);
});

/* ============================================================
   3. SMOOTH SCROLL for anchor links
============================================================ */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = $(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const navH = parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
  window.scrollTo({
    top: target.offsetTop - navH - 12,
    behavior: 'smooth'
  });
});

/* ============================================================
   4. SCROLL REVEAL ANIMATION
============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Add reveal class to elements
function setupReveal() {
  const selectors = [
    '.feature-card',
    '.workflow-step',
    '.pricing-card',
    '.testi-card',
    '.faq-item',
    '.dash-card',
    '.metric-card',
    '.upload-box',
    '.jd-box'
  ];
  selectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      // stagger delay for grids
      if (i % 4 === 1) el.classList.add('reveal-delay-1');
      if (i % 4 === 2) el.classList.add('reveal-delay-2');
      if (i % 4 === 3) el.classList.add('reveal-delay-3');
      revealObserver.observe(el);
    });
  });
}
setupReveal();

/* ============================================================
   5. DRAG & DROP RESUME UPLOAD
============================================================ */
const uploadBox      = $('#uploadBox');
const uploadInner    = $('#uploadInner');
const uploadDone     = $('#uploadDone');
const uploadProgress = $('#uploadProgress');
const fileInput      = $('#fileInput');
const progressFill   = $('#progressFill');
const progressLabel  = $('#progressLabel');
const uploadedName   = $('#uploadedFileName');
const removeFileBtn  = $('#removeFile');

let uploadedFile = null;

// Show upload done state
function showDone(file) {
  uploadedFile = file;
  uploadedName.textContent = file.name;
  uploadInner.style.display    = 'none';
  uploadProgress.style.display = 'none';
  uploadDone.style.display     = 'flex';
}

// Simulate upload progress animation
function simulateUpload(file) {
  uploadInner.style.display    = 'none';
  uploadDone.style.display     = 'none';
  uploadProgress.style.display = 'flex';
  progressFill.style.width     = '0%';

  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 5;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      progressFill.style.width = '100%';
      progressLabel.textContent = 'Upload complete!';
      setTimeout(() => showDone(file), 500);
    }
    progressFill.style.width = pct + '%';
    progressLabel.textContent = `Uploading… ${Math.floor(pct)}%`;
  }, 120);
}

// Validate file
function validateFile(file) {
  const allowed = ['application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type) &&
      !file.name.match(/\.(pdf|doc|docx)$/i)) {
    showToast('Only PDF, DOC, or DOCX files are allowed.', 'error');
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File must be under 5MB.', 'error');
    return false;
  }
  return true;
}

// File input change
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file && validateFile(file)) simulateUpload(file);
});

// Drag events
uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.classList.add('drag-over');
});
uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('drag-over');
});
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && validateFile(file)) simulateUpload(file);
});

// Remove uploaded file
removeFileBtn.addEventListener('click', () => {
  uploadedFile = null;
  fileInput.value = '';
  uploadDone.style.display  = 'none';
  uploadInner.style.display = 'flex';
});

/* ============================================================
   6. ANALYZE BUTTON — show dashboard with animated results
============================================================ */
const analyzeBtn      = $('#analyzeBtn');
const analyzeBtnText  = $('#analyzeBtnText');
const analyzeBtnLoader= $('#analyzeBtnLoader');
const dashboardSection= $('#dashboard');

// Mock analysis data (simulates AI output)
const mockResults = {
  score: 82,
  match: 78,
  keywords: { found: 22, total: 29 },
  readability: 91,
  format: 85,
  skills: [
    { name: 'React / Next.js',  pct: 95, level: 'high' },
    { name: 'TypeScript',        pct: 88, level: 'high' },
    { name: 'Node.js',           pct: 72, level: 'medium' },
    { name: 'AWS / Cloud',       pct: 45, level: 'low' },
    { name: 'GraphQL',           pct: 60, level: 'medium' },
    { name: 'Docker / DevOps',   pct: 38, level: 'low' },
  ],
  missing: [
    'CI/CD Pipeline', 'Kubernetes', 'Agile/Scrum',
    'REST API design', 'PostgreSQL', 'Redis', 'Jest Testing'
  ],
  suggestions: [
    { level: 'high',   text: 'Add "CI/CD" and "Kubernetes" to your skills — they appear 5× in the JD.' },
    { level: 'high',   text: 'Quantify your achievements: "Reduced load time by 40%" beats "Improved performance".' },
    { level: 'medium', text: 'Mention Agile or Scrum methodology — 3 of the 5 JD bullets reference it.' },
    { level: 'medium', text: 'Add a brief "Technical Summary" section at the top for faster ATS parsing.' },
    { level: 'low',    text: 'Replace generic verbs like "worked on" with action verbs: "architected", "led", "shipped".' },
  ]
};

analyzeBtn.addEventListener('click', () => {
  // Validate inputs
  if (!uploadedFile) {
    showToast('Please upload your resume first.', 'error');
    uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const jd = $('#jobDesc').value.trim();
  if (jd.length < 30) {
    showToast('Please paste a job description (min 30 characters).', 'error');
    return;
  }

  // Show loader
  analyzeBtnText.style.display  = 'none';
  analyzeBtnLoader.style.display = 'inline-flex';
  analyzeBtn.disabled = true;

  // Simulate processing delay
  setTimeout(() => {
    analyzeBtnText.style.display  = 'inline';
    analyzeBtnLoader.style.display = 'none';
    analyzeBtn.disabled = false;

    // Show dashboard
    dashboardSection.style.display = 'block';
    renderDashboard(mockResults);

    // Scroll to dashboard
    setTimeout(() => {
      const navH = parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
      window.scrollTo({
        top: dashboardSection.offsetTop - navH - 12,
        behavior: 'smooth'
      });
    }, 100);

    showToast('Analysis complete! 🎉', 'success');
  }, 2800);
});

/* ============================================================
   7. RENDER DASHBOARD with animations
============================================================ */
function renderDashboard(data) {
  // ── Score circle ──
  animateScore(data.score);

  // ── Metrics ──
  setTimeout(() => {
    animateMetric('matchVal',   'matchBar',   data.match,                       '%');
    animateMetric('keywordVal', 'keywordBar', Math.round(data.keywords.found / data.keywords.total * 100), '%', `${data.keywords.found} / ${data.keywords.total}`);
    animateMetric('readVal',    'readBar',    data.readability,                  '%');
    animateMetric('formatVal',  'formatBar',  data.format,                       '%');
  }, 400);

  // ── Skills ──
  setTimeout(() => renderSkills(data.skills), 600);

  // ── Missing keywords ──
  setTimeout(() => renderMissingTags(data.missing), 700);

  // ── Suggestions ──
  setTimeout(() => renderSuggestions(data.suggestions), 800);

  // Observe new dashboard cards
  $$('.dash-card, .metric-card').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

/* Animated score ring */
function animateScore(target) {
  const ring        = $('#scoreRing');
  const display     = $('#scoreDisplay');
  const badge       = $('#scoreBadge');
  const circumference = 327; // 2π × 52

  // inject SVG gradient
  const svg = ring.closest('svg');
  if (!svg.querySelector('defs')) {
    svg.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#6c63ff"/>
          <stop offset="50%"  stop-color="#a78bfa"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
    `);
    ring.setAttribute('stroke', 'url(#scoreGrad)');
  }

  // Animate ring
  const offset = circumference - (target / 100) * circumference;
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);

  // Animate number counter
  let current = 0;
  const duration = 1500;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    current = Math.round(eased * target);
    display.textContent = current;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Badge
  setTimeout(() => {
    badge.classList.remove('excellent', 'good', 'poor');
    if (target >= 80) {
      badge.textContent = '✦ Excellent';
      badge.classList.add('excellent');
    } else if (target >= 60) {
      badge.textContent = '⚡ Good';
      badge.classList.add('good');
    } else {
      badge.textContent = '⚠ Needs Work';
      badge.classList.add('poor');
    }
  }, 1600);
}

/* Animated metric bar + value */
function animateMetric(valId, barId, pct, suffix = '%', displayOverride = null) {
  const valEl = $('#' + valId);
  const barEl = $('#' + barId);

  barEl.style.width = pct + '%';

  // Counter
  let current = 0;
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * pct);
    valEl.textContent = displayOverride
      ? displayOverride
      : current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* Render skills list */
function renderSkills(skills) {
  const list = $('#skillsList');
  list.innerHTML = skills.map(s => `
    <div class="skill-row">
      <div class="skill-info">
        <span class="skill-name">${s.name}</span>
        <span class="skill-pct">${s.pct}%</span>
      </div>
      <div class="skill-track">
        <div class="skill-fill ${s.level}" style="width:0%" data-pct="${s.pct}"></div>
      </div>
    </div>
  `).join('');

  // Animate fills
  setTimeout(() => {
    $$('.skill-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 100);
}

/* Render missing keyword tags */
function renderMissingTags(keywords) {
  const container = $('#missingTags');
  container.innerHTML = keywords.map(k =>
    `<span class="tag tag-red">${k}</span>`
  ).join('');
}

/* Render suggestion cards */
function renderSuggestions(suggestions) {
  const list = $('#suggestionsList');
  list.innerHTML = suggestions.map(s => `
    <div class="suggestion-item sug-${s.level}">
      <div class="sug-dot"></div>
      <span>${s.text}</span>
    </div>
  `).join('');
}

/* ============================================================
   8. REANALYZE BUTTON
============================================================ */
$('#reanalyze').addEventListener('click', () => {
  dashboardSection.style.display = 'none';
  uploadedFile = null;
  fileInput.value = '';
  uploadDone.style.display  = 'none';
  uploadInner.style.display = 'flex';
  $('#jobDesc').value = '';
  const navH = parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
  window.scrollTo({
    top: $('#upload').offsetTop - navH - 12,
    behavior: 'smooth'
  });
});

/* ============================================================
   9. DOWNLOAD REPORT (simulated)
============================================================ */
$('#downloadReport').addEventListener('click', () => {
  showToast('Generating PDF report…', 'info');
  setTimeout(() => {
    // Create a simple text report and trigger download
    const report = `ATSify Resume Analysis Report
================================
Date: ${new Date().toLocaleDateString()}

ATS SCORE: 82 / 100  ★ Excellent

JOB MATCH:         78%
KEYWORDS MATCHED:  22 / 29
READABILITY:       91%
FORMAT SCORE:      85%

MISSING KEYWORDS
----------------
CI/CD Pipeline, Kubernetes, Agile/Scrum,
REST API design, PostgreSQL, Redis, Jest Testing

TOP SUGGESTIONS
---------------
[HIGH]   Add "CI/CD" and "Kubernetes" to your skills — they appear 5× in the JD.
[HIGH]   Quantify achievements: "Reduced load time by 40%" beats "Improved performance".
[MEDIUM] Mention Agile or Scrum — referenced in 3 of 5 JD bullets.
[MEDIUM] Add a "Technical Summary" section at the top for faster ATS parsing.
[LOW]    Replace generic verbs with action verbs: "architected", "led", "shipped".

Generated by ATSify — atsify.ai
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'ATSify_Report.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded! ✓', 'success');
  }, 1500);
});

/* ============================================================
   10. FAQ ACCORDION
============================================================ */
$$('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all
    $$('.faq-item').forEach(i => i.classList.remove('open'));
    // Open clicked (unless it was already open)
    if (!isOpen) item.classList.add('open');
  });
});

/* ============================================================
   11. PRICING TOGGLE — monthly / annual
============================================================ */
const billingToggle = $('#billingToggle');
billingToggle.addEventListener('change', () => {
  const annual = billingToggle.checked;
  $$('.price-amount[data-monthly]').forEach(el => {
    const from = parseInt(el.dataset.monthly);
    const to   = parseInt(el.dataset.annual);
    if (isNaN(from) || isNaN(to)) return;
    animatePrice(el, annual ? to : from);
  });
});

function animatePrice(el, target) {
  const start    = parseInt(el.textContent) || 0;
  const duration = 400;
  const begin    = performance.now();
  function tick(now) {
    const t = Math.min((now - begin) / duration, 1);
    el.textContent = '$' + Math.round(start + (target - start) * t);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = '$' + target;
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   12. TOAST NOTIFICATION
============================================================ */
function showToast(message, type = 'info') {
  // Remove existing
  const old = $('.atsify-toast');
  if (old) old.remove();

  const colors = {
    success: '#22d3a0',
    error:   '#f87171',
    info:    '#6c63ff'
  };
  const icons = { success: '✓', error: '✗', info: '⚡' };

  const toast = document.createElement('div');
  toast.className = 'atsify-toast';
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  Object.assign(toast.style, {
    position:       'fixed',
    bottom:         '28px',
    right:          '24px',
    zIndex:         '9999',
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    background:     'rgba(13,18,32,.95)',
    backdropFilter: 'blur(16px)',
    border:         `1px solid ${colors[type]}40`,
    borderLeft:     `3px solid ${colors[type]}`,
    color:          '#f0f4ff',
    padding:        '14px 22px',
    borderRadius:   '12px',
    fontFamily:     "'DM Sans', sans-serif",
    fontSize:       '.88rem',
    boxShadow:      '0 8px 32px rgba(0,0,0,.5)',
    opacity:        '0',
    transform:      'translateY(16px)',
    transition:     'all .3s cubic-bezier(.4,0,.2,1)',
    maxWidth:       '340px',
    lineHeight:     '1.5'
  });
  toast.querySelector('span').style.color = colors[type];
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 320);
  }, 3800);
}

/* ============================================================
   13. ACTIVE NAV LINK on scroll (highlight current section)
============================================================ */
const sections  = $$('section[id]');
const navAnchors = $$('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = navAnchors.find(a => a.getAttribute('href') === '#' + entry.target.id);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// Style active nav link
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--text); background: var(--surface); }`;
document.head.appendChild(style);

/* ============================================================
   14. HERO BADGE — live counter animation on load
============================================================ */
window.addEventListener('load', () => {
  // Animate hero stat numbers on page load
  $$('.stat-value').forEach(el => {
    const text = el.textContent;
    const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num === 0) return;
    const suffix = text.replace(/[0-9.]/g, '');
    let start = performance.now();
    const duration = 1800;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (num < 10 ? (eased * num).toFixed(1) : Math.round(eased * num)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = text; // restore original
    }
    requestAnimationFrame(tick);
  });
});

/* ============================================================
   15. PARALLAX — subtle hero glow movement on mouse
============================================================ */
const glows = $$('.glow');
document.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  glows.forEach((g, i) => {
    const factor = (i + 1) * 0.4;
    g.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
}, { passive: true });

/* ============================================================
   16. FLOATING CARDS — stagger on load
============================================================ */
$$('.float-card').forEach((card, i) => {
  card.style.opacity   = '0';
  card.style.transform = 'translateX(40px)';
  setTimeout(() => {
    card.style.transition = 'opacity .6s ease, transform .6s ease';
    card.style.opacity    = '1';
    card.style.transform  = 'translateX(0)';
  }, 800 + i * 200);
});

/* ============================================================
   INIT
============================================================ */
console.log('%cATSify Loaded ✓', 'color:#a78bfa;font-family:monospace;font-size:14px;font-weight:bold;');
