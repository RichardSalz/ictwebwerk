/**
 * ============================================
 * AUTOMATION SHOWCASE - SCROLL-DRIVEN ANIMATION
 * Uses anime.js for smooth animations
 * Scroll-linked phases with n8n-style workflow
 * ============================================
 */

(function() {
'use strict';

// Prevent double initialization
if (window.automationShowcaseInitialized) {
  console.log('⚠️ Automation showcase already initialized, skipping...');
  return;
}
window.automationShowcaseInitialized = true;

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Timeline breakpoints (as decimal 0-1)
  phases: {
    0: { start: 0.00, end: 0.12 },  // Hook
    1: { start: 0.12, end: 0.28 },  // Workflow appears
    2: { start: 0.28, end: 0.44 },  // Triggers focus
    3: { start: 0.44, end: 0.60 },  // Processing focus
    4: { start: 0.60, end: 0.76 },  // Outputs focus
    5: { start: 0.76, end: 0.88 },  // Full picture
    6: { start: 0.88, end: 1.00 }   // CTA
  },
  
  // Animation durations (ms)
  durations: {
    nodeAppear: 600,
    connectionDraw: 800,
    dataFlow: 1500,
    textFade: 500,
    canvasTransition: 600
  },
  
  // Default language
  defaultLanguage: 'hu'
};

// ============================================
// TRANSLATIONS
// ============================================
const TRANSLATIONS = {
  hu: {
    // Phase 0: Hook
    hook_headline: 'Melyik ismétlődő feladat emészti fel az idődet?',
    hook_subtext: 'Görgess, és fedezd fel, hogyan kezeli az automatizálás helyetted',
    scroll_hint: 'Görgess',
    
    // Phase 1: Appear
    appear_headline: 'Az automatizálás összeköti az eszközeidet',
    appear_description: 'Minden csomópont egy lépés. Minden vonal automatikusan áramló információ.',
    
    // Phase 2: Triggers
    triggers_headline: 'Minden egy triggerrel kezdődik',
    triggers_description: 'Új email érkezik. Fájl feltöltés történik. Elérkezik egy ütemezett időpont. Te döntöd el, mi indítja az automatizálást.',
    triggers_detail: 'Ezt egyszer állítod be → örökké fut',
    
    // Phase 3: Processing
    processing_headline: 'A varázslat automatikusan történik',
    processing_description: 'Az adatok lekérésre, átalakításra, elemzésre kerülnek. Az AI összefoglalhat, kategorizálhat vagy döntéseket hozhat.',
    processing_detail: 'Nincs manuális munka. Nincs másolás-beillesztés. Nincs hiba.',
    
    // Phase 4: Outputs
    outputs_headline: 'Eredmények mindenhova eljuttatva',
    outputs_description: 'Jelentések az emailedbe. Posztok automatikusan publikálva. Adatbázisok frissítve. Értesítések elküldve.',
    outputs_detail: 'Miközben arra koncentrálsz, ami igazán számít',
    
    // Phase 5: Full picture
    fullpicture_headline: 'Te arra fókuszálsz, amit csak te tudsz megcsinálni',
    fullpicture_description: 'A munkafolyamatot a TE meglévő eszközeid és folyamataid köré tervezzük. Nem kell megváltoztatnod a munkamódszered - mi automatizálunk körülötte.',
    
    // Phase 6: CTA
    cta_headline: 'Építsük fel a tiédet',
    cta_description: 'Foglalj ingyenes konzultációt. Megkeressük az automatizálásra érdemes ismétlődő feladatokat.',
    cta_button: 'Ingyenes Konzultáció',
    
    // Node labels
    node_schedule_sub: 'Minden nap 9:00-kor',
    node_email_sub: 'Új email érkezett',
    node_fetch_sub: 'API / Adatbázis',
    node_ai_sub: 'ChatGPT, Claude, stb.',
    node_report_sub: 'Email',
    node_post_sub: 'Közösségi média'
  },
  
  en: {
    hook_headline: 'What repetitive task is eating your time?',
    hook_subtext: 'Scroll to discover how automation handles it for you',
    scroll_hint: 'Scroll',
    
    appear_headline: 'Automation connects your tools',
    appear_description: 'Each node is a step. Each line is information flowing automatically.',
    
    triggers_headline: 'It starts with a trigger',
    triggers_description: 'A new email arrives. A file is uploaded. A scheduled time is reached. You choose what kicks off the automation.',
    triggers_detail: 'You set this up once → it runs forever',
    
    processing_headline: 'The magic happens automatically',
    processing_description: 'Data is fetched, transformed, analyzed. AI can summarize, categorize, or make decisions.',
    processing_detail: 'No manual work. No copy-paste. No mistakes.',
    
    outputs_headline: 'Results delivered, everywhere',
    outputs_description: 'Reports sent to your inbox. Posts published automatically. Databases updated. Notifications triggered.',
    outputs_detail: 'While you focus on what matters',
    
    fullpicture_headline: 'You focus on what only you can do',
    fullpicture_description: "We design the workflow around YOUR existing tools and processes. You don't change how you work - we automate around it.",
    
    cta_headline: "Let's build yours",
    cta_description: "Book a free consultation. We'll find the repetitive tasks worth automating.",
    cta_button: 'Book Free Consultation',
    
    node_schedule_sub: 'Every day at 9:00',
    node_email_sub: 'New email received',
    node_fetch_sub: 'API / Database',
    node_ai_sub: 'ChatGPT, Claude, etc.',
    node_report_sub: 'Email',
    node_post_sub: 'Social Media'
  },
  
  nl: {
    hook_headline: 'Welke repetitieve taak vreet aan je tijd?',
    hook_subtext: 'Scroll om te ontdekken hoe automatisering het voor je afhandelt',
    scroll_hint: 'Scroll',
    
    appear_headline: 'Automatisering verbindt je tools',
    appear_description: 'Elke node is een stap. Elke lijn is informatie die automatisch stroomt.',
    
    triggers_headline: 'Het begint met een trigger',
    triggers_description: 'Een nieuwe e-mail komt binnen. Een bestand wordt geüpload. Een geplande tijd wordt bereikt. Jij kiest wat de automatisering start.',
    triggers_detail: 'Je stelt dit één keer in → het draait voor altijd',
    
    processing_headline: 'De magie gebeurt automatisch',
    processing_description: 'Data wordt opgehaald, getransformeerd, geanalyseerd. AI kan samenvatten, categoriseren of beslissingen nemen.',
    processing_detail: 'Geen handmatig werk. Geen kopiëren-plakken. Geen fouten.',
    
    outputs_headline: 'Resultaten overal afgeleverd',
    outputs_description: 'Rapporten naar je inbox gestuurd. Posts automatisch gepubliceerd. Databases bijgewerkt. Meldingen verzonden.',
    outputs_detail: 'Terwijl jij je focust op wat ertoe doet',
    
    fullpicture_headline: 'Jij focust op wat alleen jij kunt doen',
    fullpicture_description: 'We ontwerpen de workflow rond JOUW bestaande tools en processen. Je hoeft niet te veranderen hoe je werkt - wij automatiseren eromheen.',
    
    cta_headline: 'Laten we de jouwe bouwen',
    cta_description: 'Boek een gratis consultatie. We vinden de repetitieve taken die automatisering waard zijn.',
    cta_button: 'Gratis Consultatie Boeken',
    
    node_schedule_sub: 'Elke dag om 9:00',
    node_email_sub: 'Nieuwe e-mail ontvangen',
    node_fetch_sub: 'API / Database',
    node_ai_sub: 'ChatGPT, Claude, etc.',
    node_report_sub: 'E-mail',
    node_post_sub: 'Social Media'
  }
};

// ============================================
// STATE
// ============================================
let state = {
  currentPhase: -1,
  scrollProgress: 0,
  language: CONFIG.defaultLanguage,
  nodesVisible: false,
  connectionsDrawn: false,
  dataFlowPlayed: false,
  animationTimeline: null
};

// ============================================
// DOM REFERENCES
// ============================================
let dom = {};

// ============================================
// LANGUAGE DETECTION
// ============================================
function detectLanguage() {
  // Try HTML lang attribute
  const htmlLang = document.documentElement.lang;
  if (htmlLang && TRANSLATIONS[htmlLang]) {
    return htmlLang;
  }
  
  // Try URL path
  const path = window.location.pathname;
  if (path.includes('/en/')) return 'en';
  if (path.includes('/nl/')) return 'nl';
  if (path.includes('/hu/')) return 'hu';
  
  return CONFIG.defaultLanguage;
}

// ============================================
// APPLY TRANSLATIONS
// ============================================
function applyTranslations() {
  const lang = state.language;
  const translations = TRANSLATIONS[lang] || TRANSLATIONS[CONFIG.defaultLanguage];
  
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  console.log('✅ Translations applied for:', lang);
}

// ============================================
// SCROLL PROGRESS CALCULATION
// ============================================
function getScrollProgress() {
  const container = dom.scrollContainer;
  if (!container) return 0;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = container.offsetHeight - window.innerHeight;
  
  return Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
}

// ============================================
// DETERMINE CURRENT PHASE
// ============================================
function getCurrentPhase(progress) {
  for (const [phase, bounds] of Object.entries(CONFIG.phases)) {
    if (progress >= bounds.start && progress < bounds.end) {
      return parseInt(phase);
    }
  }
  return 6; // Last phase
}

// ============================================
// PHASE HANDLERS
// ============================================
const phaseHandlers = {
  // Phase 0: Hook - Canvas hidden
  0: {
    enter() {
      console.log('📍 Phase 0: Hook');
      hideCanvas();
      activatePhaseSection(0);
    },
    update(progress) {
      // Subtle parallax on text
      const localProgress = (progress - CONFIG.phases[0].start) / (CONFIG.phases[0].end - CONFIG.phases[0].start);
      const hookText = document.querySelector('.hook-text');
      if (hookText) {
        hookText.style.transform = `translateY(${localProgress * -30}px)`;
        hookText.style.opacity = 1 - (localProgress * 0.5);
      }
    },
    exit() {
      // Nothing special
    }
  },
  
  // Phase 1: Workflow Appears
  1: {
    enter() {
      console.log('📍 Phase 1: Workflow appears');
      showCanvas();
      activatePhaseSection(1);
      
      // Animate nodes appearing
      if (!state.nodesVisible) {
        animateNodesAppearing();
        state.nodesVisible = true;
      }
    },
    update(progress) {
      const localProgress = (progress - CONFIG.phases[1].start) / (CONFIG.phases[1].end - CONFIG.phases[1].start);
      
      // Draw connections as we progress through this phase
      if (localProgress > 0.3 && !state.connectionsDrawn) {
        animateConnectionsDrawing();
        state.connectionsDrawn = true;
      }
    },
    exit() {
      // Keep canvas visible
    }
  },
  
  // Phase 2: Focus on Triggers
  2: {
    enter() {
      console.log('📍 Phase 2: Triggers focus');
      activatePhaseSection(2);
      zoomToTriggers();
      highlightNodes(['node-schedule', 'node-email']);
      dimNodes(['node-fetch', 'node-ai', 'node-report', 'node-post']);
      showExtensionHint('hint-triggers');
    },
    update(progress) {
      // Could add subtle animations here
    },
    exit() {
      hideExtensionHint('hint-triggers');
    }
  },
  
  // Phase 3: Focus on Processing
  3: {
    enter() {
      console.log('📍 Phase 3: Processing focus');
      activatePhaseSection(3);
      zoomToProcessing();
      highlightNodes(['node-fetch', 'node-ai']);
      dimNodes(['node-schedule', 'node-email', 'node-report', 'node-post']);
      
      // Animate data flow through processing
      animateDataFlowSegment(['conn-schedule-fetch', 'conn-fetch-ai']);
    },
    update(progress) {
      // Could pulse AI node
    },
    exit() {
      // Nothing special
    }
  },
  
  // Phase 4: Focus on Outputs
  4: {
    enter() {
      console.log('📍 Phase 4: Outputs focus');
      activatePhaseSection(4);
      zoomToOutputs();
      highlightNodes(['node-report', 'node-post']);
      dimNodes(['node-schedule', 'node-email', 'node-fetch', 'node-ai']);
      showExtensionHint('hint-outputs');
      
      // Show completion checks
      setTimeout(() => {
        showCompletionChecks();
      }, 800);
    },
    update(progress) {
      // Nothing special
    },
    exit() {
      hideExtensionHint('hint-outputs');
      hideCompletionChecks();
    }
  },
  
  // Phase 5: Full Picture
  5: {
    enter() {
      console.log('📍 Phase 5: Full picture');
      activatePhaseSection(5);
      zoomToFull();
      highlightNodes(['node-schedule', 'node-email', 'node-fetch', 'node-ai', 'node-report', 'node-post']);
      
      // Run full data flow animation
      if (!state.dataFlowPlayed) {
        setTimeout(() => {
          animateFullDataFlow();
        }, 500);
        state.dataFlowPlayed = true;
      }
    },
    update(progress) {
      // Nothing special
    },
    exit() {
      // Nothing special
    }
  },
  
  // Phase 6: CTA
  6: {
    enter() {
      console.log('📍 Phase 6: CTA');
      activatePhaseSection(6);
      fadeOutCanvas();
    },
    update(progress) {
      // Nothing special
    },
    exit() {
      // Nothing special
    }
  }
};

// ============================================
// CANVAS VISIBILITY
// ============================================
function showCanvas() {
  dom.canvas?.classList.add('visible');
}

function hideCanvas() {
  dom.canvas?.classList.remove('visible');
}

function fadeOutCanvas() {
  if (dom.canvas) {
    dom.canvas.style.opacity = '0.3';
  }
}

// ============================================
// ZOOM CONTROLS
// ============================================
function zoomToTriggers() {
  dom.canvas?.classList.remove('zoom-processing', 'zoom-outputs', 'zoom-full');
  dom.canvas?.classList.add('zoom-triggers');
}

function zoomToProcessing() {
  dom.canvas?.classList.remove('zoom-triggers', 'zoom-outputs', 'zoom-full');
  dom.canvas?.classList.add('zoom-processing');
}

function zoomToOutputs() {
  dom.canvas?.classList.remove('zoom-triggers', 'zoom-processing', 'zoom-full');
  dom.canvas?.classList.add('zoom-outputs');
}

function zoomToFull() {
  dom.canvas?.classList.remove('zoom-triggers', 'zoom-processing', 'zoom-outputs');
  dom.canvas?.classList.add('zoom-full');
}

// ============================================
// NODE HIGHLIGHTING
// ============================================
function highlightNodes(nodeIds) {
  nodeIds.forEach(id => {
    const node = document.getElementById(id);
    if (node) {
      node.classList.remove('dimmed');
      node.classList.add('highlighted');
    }
  });
}

function dimNodes(nodeIds) {
  nodeIds.forEach(id => {
    const node = document.getElementById(id);
    if (node) {
      node.classList.remove('highlighted');
      node.classList.add('dimmed');
    }
  });
}

// ============================================
// PHASE SECTION ACTIVATION
// ============================================
function activatePhaseSection(phaseNum) {
  document.querySelectorAll('.showcase-phase').forEach((section, index) => {
    if (index === phaseNum) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}

// ============================================
// EXTENSION HINTS
// ============================================
function showExtensionHint(hintId) {
  const hint = document.getElementById(hintId);
  if (hint) {
    anime({
      targets: hint,
      opacity: [0, 0.6],
      duration: 500,
      easing: 'easeOutQuad'
    });
  }
}

function hideExtensionHint(hintId) {
  const hint = document.getElementById(hintId);
  if (hint) {
    anime({
      targets: hint,
      opacity: 0,
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
}

// ============================================
// COMPLETION CHECKS
// ============================================
function showCompletionChecks() {
  const checks = document.querySelectorAll('.completion-check');
  anime({
    targets: checks,
    opacity: [0, 1],
    scale: [0, 1],
    delay: anime.stagger(200),
    duration: 500,
    easing: 'easeOutBack'
  });
}

function hideCompletionChecks() {
  const checks = document.querySelectorAll('.completion-check');
  anime({
    targets: checks,
    opacity: 0,
    scale: 0,
    duration: 300,
    easing: 'easeInQuad'
  });
}

// ============================================
// ANIMATIONS
// ============================================
function animateNodesAppearing() {
  const nodes = document.querySelectorAll('.node');
  
  anime({
    targets: nodes,
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(100, { start: 200 }),
    duration: CONFIG.durations.nodeAppear,
    easing: 'easeOutQuad',
    begin: () => {
      nodes.forEach(n => n.classList.add('visible'));
    }
  });
}

function animateConnectionsDrawing() {
  const connections = document.querySelectorAll('.connection');
  
  anime({
    targets: connections,
    strokeDashoffset: [1000, 0],
    delay: anime.stagger(150),
    duration: CONFIG.durations.connectionDraw,
    easing: 'easeInOutQuad',
    begin: () => {
      connections.forEach(c => c.classList.add('drawn'));
    }
  });
}

function animateDataFlowSegment(connectionIds) {
  connectionIds.forEach((connId, index) => {
    const connection = document.getElementById(connId);
    if (connection) {
      // Activate the connection visually
      connection.classList.add('active');
      
      // Animate glow pulse along the line
      anime({
        targets: connection,
        filter: ['url(#glow)', 'url(#data-glow)', 'url(#glow)'],
        duration: 1000,
        delay: index * 300,
        easing: 'easeInOutQuad'
      });
    }
  });
}

function animateFullDataFlow() {
  // Get all connections in order
  const connectionOrder = [
    'conn-schedule-fetch',
    'conn-email-fetch', 
    'conn-fetch-ai',
    'conn-ai-report',
    'conn-ai-post'
  ];
  
  // Get particles
  const particles = document.querySelectorAll('.data-particle');
  
  // Animate particles along paths
  const paths = [
    document.getElementById('conn-schedule-fetch'),
    document.getElementById('conn-fetch-ai'),
    document.getElementById('conn-ai-report')
  ];
  
  // Activate all connections
  connectionOrder.forEach(connId => {
    const conn = document.getElementById(connId);
    if (conn) conn.classList.add('active');
  });
  
  // Simple particle animation along first path
  if (paths[0] && particles[0]) {
    const pathLength = paths[0].getTotalLength();
    
    anime({
      targets: particles[0],
      opacity: [0, 1, 1, 0],
      duration: CONFIG.durations.dataFlow,
      easing: 'linear',
      update: function(anim) {
        const progress = anim.progress / 100;
        const point = paths[0].getPointAtLength(pathLength * progress);
        particles[0].setAttribute('cx', point.x);
        particles[0].setAttribute('cy', point.y);
      }
    });
  }
  
  // Second particle on second path
  if (paths[1] && particles[1]) {
    const pathLength = paths[1].getTotalLength();
    
    anime({
      targets: particles[1],
      opacity: [0, 1, 1, 0],
      duration: CONFIG.durations.dataFlow,
      delay: 400,
      easing: 'linear',
      update: function(anim) {
        const progress = anim.progress / 100;
        const point = paths[1].getPointAtLength(pathLength * progress);
        particles[1].setAttribute('cx', point.x);
        particles[1].setAttribute('cy', point.y);
      }
    });
  }
  
  // Third particle on third path
  if (paths[2] && particles[2]) {
    const pathLength = paths[2].getTotalLength();
    
    anime({
      targets: particles[2],
      opacity: [0, 1, 1, 0],
      duration: CONFIG.durations.dataFlow,
      delay: 800,
      easing: 'linear',
      update: function(anim) {
        const progress = anim.progress / 100;
        const point = paths[2].getPointAtLength(pathLength * progress);
        particles[2].setAttribute('cx', point.x);
        particles[2].setAttribute('cy', point.y);
      }
    });
  }
}

// ============================================
// SCROLL HANDLER
// ============================================
function handleScroll() {
  state.scrollProgress = getScrollProgress();
  const newPhase = getCurrentPhase(state.scrollProgress);
  
  // Phase changed
  if (newPhase !== state.currentPhase) {
    // Exit old phase
    if (state.currentPhase >= 0 && phaseHandlers[state.currentPhase]?.exit) {
      phaseHandlers[state.currentPhase].exit();
    }
    
    // Enter new phase
    if (phaseHandlers[newPhase]?.enter) {
      phaseHandlers[newPhase].enter();
    }
    
    state.currentPhase = newPhase;
  }
  
  // Update current phase
  if (phaseHandlers[state.currentPhase]?.update) {
    phaseHandlers[state.currentPhase].update(state.scrollProgress);
  }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
  console.log('🎬 Initializing Automation Showcase...');
  
  // Detect language
  state.language = detectLanguage();
  console.log('🌐 Language:', state.language);
  
  // Cache DOM references
  dom.scrollContainer = document.getElementById('showcase-container');
  dom.canvas = document.getElementById('n8n-canvas');
  dom.phases = document.querySelectorAll('.showcase-phase');
  
  if (!dom.scrollContainer) {
    console.error('❌ Showcase container not found');
    return;
  }
  
  // Apply translations
  applyTranslations();
  
  // Set initial state
  state.currentPhase = 0;
  activatePhaseSection(0);
  
  // Add scroll listener with throttling
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  // Initial scroll check
  handleScroll();
  
  // Handle resize
  window.addEventListener('resize', () => {
    // Recalculate on resize
    handleScroll();
  }, { passive: true });
  
  console.log('✅ Automation Showcase initialized!');
}

// ============================================
// START
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
