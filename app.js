/* ============================================================
   Laura Gabriele · OBM · app.js
   Extrait verbatim de index.html, rendu défensif pour le
   multi-pages (selectors absents tolérés sans erreur console).
   Bloc 1 : moteur Diagnostic. Bloc 2 : effets premium.
   ============================================================ */

/* ===== BLOC 1 · DIAGNOSTIC ENGINE ===== */
(function(){
  const piliers = [
    { key:'diagnostic', name:'Diagnostic', icon:'🔍' },
    { key:'structuration', name:'Structuration', icon:'🧱' },
    { key:'outils', name:'Outils', icon:'⚙️' },
    { key:'pilotage', name:'Pilotage', icon:'📊' },
    { key:'equipe', name:'Délégation', icon:'🤝' },
    { key:'optimisation', name:'Optimisation', icon:'🔄' }
  ];

  const tips = {
    diagnostic: "Commencez par lister TOUT ce que vous portez : tâches, outils, process. On ne peut structurer que ce qu'on a d'abord rendu visible.",
    structuration: "Documentez vos 3 process les plus récurrents sous forme de procédures simples (SOP). Centralisez tout au même endroit, par exemple dans Notion.",
    outils: "Identifiez vos tâches répétitives et reliez vos outils entre eux. Une seule automatisation bien placée (Make ou Zapier) peut vous rendre des heures chaque semaine.",
    pilotage: "Mettez en place un tableau de bord avec 3 à 5 indicateurs clés. Voir où en est votre business en un coup d'œil change votre façon de décider.",
    equipe: "Avant de déléguer, documentez le « qui fait quoi, comment ». Avec des process clairs, une personne ou un prestataire peut avancer sans vous attendre.",
    optimisation: "Bloquez un point régulier pour mesurer, ajuster et améliorer vos process. La machine se perfectionne, et vous restez sur votre zone de génie."
  };

  const WEBHOOK_URL = 'https://TON-WEBHOOK-N8N.app/webhook/diagnostic-pulse';
  const circumference = 2 * Math.PI * 26; // ring radius 26
  let currentStep = 0;
  const scores = [0,0,0,0,0,0];

  function updateRing() {
    const qStep = currentStep; // 1-6 are question steps
    if (qStep < 1 || qStep > 6) return;
    const pct = qStep / 6;
    const offset = circumference * (1 - pct);
    document.getElementById('diagRingFill').style.strokeDashoffset = offset;
    document.getElementById('diagRingText').textContent = qStep + '/6';
    document.getElementById('diagRingLabel').textContent = 'Pilier · ' + piliers[qStep - 1].name;
  }

  window.diagSelect = function(el, stepIdx) {
    el.parentElement.querySelectorAll('.diag-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    scores[stepIdx - 1] = parseInt(el.dataset.score);
    // Auto-advance after 600ms
    setTimeout(() => { diagNext(); }, 600);
  };

  function showStep(n) {
    const allSteps = document.querySelectorAll('.diag-step');
    const current = document.querySelector('.diag-step.active');
    const target = document.querySelector('.diag-step[data-step="'+n+'"]');
    if (current) {
      current.classList.remove('active');
      current.classList.add('exit-left');
      setTimeout(() => { current.classList.remove('exit-left'); current.style.display = 'none'; }, 350);
    }
    if (target) {
      target.style.display = '';
      setTimeout(() => { target.classList.add('active'); }, 50);
    }

    const ringWrap = document.getElementById('diagRingWrap');
    if (n >= 1 && n <= 6) {
      ringWrap.style.display = 'flex';
      updateRing();
    } else {
      ringWrap.style.display = 'none';
    }
  }

  function animateScore(target) {
    const el = document.getElementById('diagScoreBig');
    let current = 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(target * eased);
      el.innerHTML = current + '<span style="font-size:0.4em; color:var(--gray-500);">/18</span>';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function buildResults() {
    const total = scores.reduce((a,b) => a+b, 0);
    const avg = total / 6;
    const userName = document.getElementById('diagName').value.trim().split(' ')[0];

    // Animate score
    animateScore(total);

    // Level badge
    const badge = document.getElementById('diagLevelBadge');
    if (avg <= 1.3) { badge.textContent = '🔴 Critique'; badge.style.background = 'rgba(181,137,78,0.12)'; badge.style.color = '#9c7240'; badge.style.borderColor = 'rgba(181,137,78,0.2)'; }
    else if (avg <= 1.8) { badge.textContent = '🟠 Fragile'; badge.style.background = 'rgba(192,138,60,0.12)'; badge.style.color = '#c08a3c'; }
    else if (avg <= 2.3) { badge.textContent = '🟡 En construction'; badge.style.background = 'rgba(168,116,44,0.12)'; badge.style.color = '#a8742c'; }
    else { badge.textContent = '🟢 Solide'; badge.style.background = 'rgba(74,90,56,0.12)'; badge.style.color = '#5c7650'; }

      document.getElementById('diagLevelBadge').insertAdjacentHTML('afterend', '<div style="margin-top:10px; font-size:0.875rem; color:var(--gray-400);">'+userName+', voici votre diagnostic.</div>');

    // Radar
    const cx = 150, cy = 150, R = 115;
    const angles = piliers.map((_, i) => (Math.PI * 2 * i / 6) - Math.PI / 2);
    const svg = document.getElementById('diagRadar');
    let h = '<defs><linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(107,124,90,0.25)"/><stop offset="100%" stop-color="rgba(125,148,130,0.15)"/></linearGradient></defs>';
    [0.33, 0.66, 1].forEach(p => {
      const r = R * p;
      h += '<polygon points="'+angles.map(a => (cx+r*Math.cos(a))+','+(cy+r*Math.sin(a))).join(' ')+'" fill="none" stroke="rgba(40,38,34,0.06)" stroke-width="1"/>';
    });
    angles.forEach((a, i) => {
      h += '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+R*Math.cos(a))+'" y2="'+(cy+R*Math.sin(a))+'" stroke="rgba(40,38,34,0.04)" stroke-width="1"/>';
      const lx = cx+(R+28)*Math.cos(a), ly = cy+(R+28)*Math.sin(a);
      h += '<text x="'+lx+'" y="'+(ly-6)+'" text-anchor="middle" dominant-baseline="middle" fill="rgba(40,38,34,0.5)" font-size="14">'+piliers[i].icon+'</text>';
      h += '<text x="'+lx+'" y="'+(ly+8)+'" text-anchor="middle" dominant-baseline="middle" fill="rgba(40,38,34,0.3)" font-size="7" font-family="JetBrains Mono,monospace" font-weight="600">'+piliers[i].name.toUpperCase()+'</text>';
    });
    h += '<polygon points="'+scores.map((s,i) => {const r=(s/3)*R; return (cx+r*Math.cos(angles[i]))+','+(cy+r*Math.sin(angles[i]));}).join(' ')+'" fill="url(#radarGrad)" stroke="rgba(107,124,90,0.7)" stroke-width="2"/>';
    scores.forEach((s,i) => {
      const r=(s/3)*R;
      h += '<circle cx="'+(cx+r*Math.cos(angles[i]))+'" cy="'+(cy+r*Math.sin(angles[i]))+'" r="5" fill="#6B7C5A" style="filter:drop-shadow(0 0 4px rgba(107,124,90,0.6));"/>';
    });
    svg.innerHTML = h;

    // Score bars
    const se = document.getElementById('diagScores');
    let bh = '';
    scores.forEach((s, i) => {
      const lv = s<=1?'low':s<=2?'mid':'high';
      bh += '<div class="diag-score-row"><div class="diag-score-header"><div class="diag-score-name">'+piliers[i].icon+' '+piliers[i].name+'</div><div class="diag-score-val '+lv+'">'+s+'/3</div></div><div class="diag-score-bar-bg"><div class="diag-score-bar-fill '+lv+'" style="width:0%"></div></div></div>';
    });
    se.innerHTML = bh;
    setTimeout(() => { se.querySelectorAll('.diag-score-bar-fill').forEach((b,i) => { b.style.width = Math.round((scores[i]/3)*100)+'%'; }); }, 200);

    // Tips for weak pillars
    const weakPiliers = [];
    scores.forEach((s,i) => { if (s <= 2) weakPiliers.push(i); });
    const tipsEl = document.getElementById('diagTips');
    if (weakPiliers.length > 0) {
      const topWeak = weakPiliers.sort((a,b) => scores[a] - scores[b]).slice(0, 3);
      let th = '<div class="diag-tips-title">⚡ Actions prioritaires</div>';
      topWeak.forEach(i => {
        th += '<div class="diag-tip"><div class="diag-tip-icon">'+piliers[i].icon+'</div><div><strong style="color:var(--white);">'+piliers[i].name+'</strong> · '+tips[piliers[i].key]+'</div></div>';
      });
      tipsEl.innerHTML = th;
    } else {
      tipsEl.innerHTML = '<div class="diag-tips-title">🎯 Vous êtes au top</div><div class="diag-tip"><div class="diag-tip-icon">🚀</div><div>Votre opérationnel est solide. L\'étape suivante : le maintenir et l\'affiner dans la durée avec un pilotage continu.</div></div>';
    }

    // Offer recommendation
    let pack, price, why, link, ctaText;
    if (avg <= 1.5) {
      pack = 'AUDIT'; price = 'Sur mesure'; link = '#contact';
      ctaText = 'Démarrer par l\'audit →';
      why = userName+', votre opérationnel a besoin d\'y voir clair avant tout. L\'Audit cartographie ce que vous portez, repère les points de friction et vous donne une feuille de route priorisée.';
    } else if (avg <= 2.3) {
      pack = 'SPRINT STRUCTURATION'; price = 'Sur mesure'; link = '/methode.html#offres';
      ctaText = 'Lancer mon Sprint →';
      why = userName+', vous avez des bases mais votre organisation a des failles. Le Sprint Structuration installe tout votre système opérationnel : process documentés, outils connectés, automatisations, tableau de bord et délégation.';
    } else {
      pack = 'PILOTAGE CONTINU'; price = 'Sur mesure'; link = '#contact';
      ctaText = 'Discuter du pilotage →';
      why = userName+', votre opérationnel est solide. Vous êtes prêt pour un pilotage continu : gestion de projet, suivi des KPIs et amélioration de vos process, mois après mois.';
    }

    document.getElementById('diagReco').innerHTML =
      '<div class="diag-reco-label">L\'accompagnement adapté à votre situation</div>' +
      '<div class="diag-reco-pack">'+pack+'</div>' +
      '<div class="diag-reco-price">'+price+'</div>' +
      '<div class="diag-reco-why">'+why+'</div>' +
      '<a href="'+link+'" class="diag-reco-cta">'+ctaText+'</a>';
  }

  function sendToWebhook() {
    const name = document.getElementById('diagName').value.trim();
    const email = document.getElementById('diagEmail').value.trim();
    const total = scores.reduce((a,b) => a+b, 0);
    const avg = total / 6;
    let pack;
    if (avg <= 1.5) pack = 'Audit';
    else if (avg <= 2.3) pack = 'Sprint Structuration';
    else pack = 'Pilotage Continu';

    const minScore = Math.min(...scores);
    const minIdx = scores.indexOf(minScore);
    const blocageMap = ['Diagnostic', 'Structuration', 'Outils', 'Pilotage', 'Délégation', 'Optimisation'];
    let blocage = blocageMap[minIdx] || 'Mix';
    if (scores.filter(s => s <= 1).length >= 3) blocage = 'Mix';

    const payload = {
      nom_complet: name,
      email: email,
      score_diagnostic: scores[0],
      score_structuration: scores[1],
      score_outils: scores[2],
      score_pilotage: scores[3],
      score_delegation: scores[4],
      score_optimisation: scores[5],
      score_audit: total,
      offre_recommandee: pack,
      origine: 'Site Laura Gabriele',
      canal: 'Inbound',
      stage: 'Lead',
      statut: 'Open',
      blocage_principal: blocage,
      declencheur: 'Diagnostic opérationnel · score ' + total + '/18',
      next_action: 'Email séquence diagnostic + relance J+3',
      date_audit: new Date().toISOString(),
      date_audit_is_datetime: 1,
      timestamp: new Date().toISOString()
    };

    if (WEBHOOK_URL && !WEBHOOK_URL.includes('TON-WEBHOOK')) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      }).catch(() => {});
    }
    console.log('📊 Diagnostic opérationnel envoyé:', payload);
  }

  window.diagSubmitOptin = function() {
    const name = document.getElementById('diagName');
    const email = document.getElementById('diagEmail');
    const errN = document.getElementById('errName');
    const errE = document.getElementById('errEmail');
    let v = true;
    name.classList.remove('error'); errN.classList.remove('show');
    email.classList.remove('error'); errE.classList.remove('show');
    if (!name.value.trim() || name.value.trim().length < 2) {
      name.classList.add('error'); errN.classList.add('show'); v = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add('error'); errE.classList.add('show'); v = false;
    }
    if (!v) return;

    // Move to results
    currentStep = 8;
    showStep(8);
    buildResults();
    sendToWebhook();
  };

  window.diagNext = function() {
    if (currentStep >= 1 && currentStep <= 6 && scores[currentStep-1] === 0) return;
    currentStep++;
    // Step 7 is opt-in gate — stop here, results triggered by diagSubmitOptin
    if (currentStep > 7) return;
    showStep(currentStep);
  };

  window.diagPrev = function() {
    if (currentStep > 0) { currentStep--; showStep(currentStep); }
  };
})();

/* ===== BLOC 2 · PREMIUM EFFECTS ENGINE ===== */
(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── 1+6. UNIFIED SCROLL LOOP (rAF-throttled): progress bar, nav, parallax ───
  const progressBar = document.getElementById('scrollProgress');
  const nav = document.querySelector('nav');
  const heroBefore = document.querySelector('.hero'); // parallax target via custom prop
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  let ticking = false;

  function onScrollFrame() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';

    if (nav) {
      if (scrollTop > 100) {
        nav.style.borderBottom = '1px solid rgba(74,90,56,0.10)';
        nav.style.boxShadow = '0 6px 30px rgba(44,44,36,0.14)';
      } else {
        nav.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        nav.style.boxShadow = 'none';
      }
    }

    if (!reduceMotion) {
      for (let i = 0; i < parallaxEls.length; i++) {
        const el = parallaxEls[i];
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = 'translate3d(0,' + (-center * speed).toFixed(1) + 'px,0)';
      }
    }
    ticking = false;
  }
  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  onScrollFrame();

  // ─── 2. CURSOR GLOW ───
  const glow = document.getElementById('cursorGlow');
  if (glow && !reduceMotion) {
    document.addEventListener('mousemove', function(e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // ─── 2b. MAGNETIC CTAs (primary buttons follow the cursor subtly) ───
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn-lg, .nav-cta, .o-cta--primary, .diag-reco-cta').forEach(btn => {
      const strength = 0.28;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty('--mx', (mx * strength).toFixed(1) + 'px');
        btn.style.setProperty('--my', (my * strength).toFixed(1) + 'px');
        btn.classList.add('is-magnetic');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
        btn.classList.remove('is-magnetic');
      });
    });
  }

  // ─── 3. INTERSECTION OBSERVER — master observer ───
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Counter animation for proof-val elements
        if (entry.target.classList.contains('count-up')) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Observe all animated elements
  document.querySelectorAll('.fade-up, .divider, .label, .stagger-children, .count-up').forEach(el => obs.observe(el));

  // ─── 4. COUNTER ANIMATION ───
  // Animates the FIRST numeric run found in the element while preserving the
  // exact original markup (restored verbatim at the end). Handles French
  // thousands spaces ("2 000"), ranges ("16-20h"), suffixes ("120j", "60%").
  function animateCounter(el) {
    if (el.dataset.counted === '1') return;
    el.dataset.counted = '1';
    const originalHTML = el.innerHTML;
    const fullText = el.textContent;
    // First numeric run: digits with optional inner spaces (thousands) or comma/dot decimal
    const m = fullText.match(/(\d[\d  ]*[.,]?\d*)/);
    if (!m) { return; }
    const raw = m[0];
    const idx = fullText.indexOf(raw);
    const before = fullText.slice(0, idx);
    const after = fullText.slice(idx + raw.length);
    const isDecimal = /[.,]\d/.test(raw);
    // numeric value: strip spaces, normalise decimal sep
    const targetNum = parseFloat(raw.replace(/[  ]/g, '').replace(',', '.'));
    if (!isFinite(targetNum)) { return; }
    // detect a French thousands-space grouping (e.g. "2 000")
    const grouped = /\d[  ]\d{3}/.test(raw);

    function fmt(n) {
      let out;
      if (isDecimal) {
        out = n.toFixed(1).replace('.', ',');
      } else {
        out = String(Math.round(n));
        if (grouped) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      return out;
    }

    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      if (progress < 1) {
        el.textContent = before + fmt(targetNum * eased) + after;
        requestAnimationFrame(tick);
      } else {
        el.innerHTML = originalHTML; // restore exact original markup
      }
    }
    requestAnimationFrame(tick);
  }

  // ─── 5. PROOF BAR + KEY STAT NUMBERS + OFFER PRICES · add count-up ───
  document.querySelectorAll('.proof-val').forEach(el => {
    el.classList.add('count-up');
    obs.observe(el);
  });
  // The 4 cost stats (60% / 16-20h / 120j / 40%)
  document.querySelectorAll('.stats-band > .card > div:first-child').forEach(el => {
    el.classList.add('count-up');
    obs.observe(el);
  });
  // Offer prices count-up (legacy). Les tarifs ont ete retires du site :
  // ce selecteur ne matche plus aucun noeud, le count-up prix se desactive seul.
  // Conserve pour compat si un prix chiffre revenait un jour.
  (function tagPrices(){
    const seen = new Set();
    const candidates = document.querySelectorAll('.offers-section .o-price, .offers-section .gradient-text');
    candidates.forEach(el => {
      const txt = el.textContent;
      if (!(/\d/.test(txt) && txt.includes('€'))) return;
      // skip if a descendant is also a candidate (tag the innermost only)
      if (el.querySelector('.o-price, .gradient-text')) return;
      // dedupe by node
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add('count-up');
      obs.observe(el);
    });
  })();

  // ─── 6. SETTLE will-change after reveal (perf) ───
  const settleObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.classList.contains('visible')) {
        setTimeout(() => entry.target.classList.add('is-settled'), 1000);
        settleObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => settleObs.observe(el));

})();
