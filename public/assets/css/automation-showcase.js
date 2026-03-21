/**
 * ============================================
 * AUTOMATION SHOWCASE - EMBEDDED VERSION
 * Scroll-driven animation scoped to section
 * Place at: assets/js/automation-showcase.js
 * ============================================
 */

(function() {
'use strict';

// ============================================
// DESKTOP CONFIGURATION
// ============================================
const DESKTOP_CONFIG = {
    breakpoint: 900,
    scrollHeight: '600vh',
    
    phases: {
        0: { start: 0.00, end: 0.08 },  // Hook
        1: { start: 0.08, end: 0.25 },   // Workflow appears
        2: { start: 0.25, end: 0.40 },   // Triggers focus
        3: { start: 0.40, end: 0.57 },   // Processing focus
        4: { start: 0.57, end: 0.73 },   // Outputs focus
        5: { start: 0.73, end: 1.00 }    // Full picture
    },
    
    durations: {
        nodeAppear: 500,
        connectionDraw: 700,
        dataFlow: 1200
    }
};

// ============================================
// MOBILE CONFIGURATION
// ============================================
const MOBILE_CONFIG = {
    breakpoint: 900,
    scrollHeight: '280vh',
    
    canvasOpacity: 0.85,
    canvasBlurAmount: 2.5,
    
    zoom: {
        phase0: 1,
        phase1: 1.8,
        phase2: 1.8,
        phase3: 1,
        phase4: 1,
    },
    
    phases: {
        0: { start: 0.00, end: 0.15 },
        1: { start: 0.15, end: 0.30 },
        2: { start: 0.30, end: 0.45 },
        3: { start: 0.45, end: 0.65 },
        4: { start: 0.65, end: 0.80 },
        5: { start: 0.80, end: 1.00 }
    },
    
    durations: {
        nodeAppear: 400,
        connectionDraw: 600,
        dataFlow: 1000
    }
};

// ============================================
// SHARED STATE
// ============================================
const state = {
    currentPhase: -1,
    scrollProgress: 0,
    initialized: false,
    isMobile: false,
    nodesVisible: false,
    connectionsDrawn: false,
    dataFlowPlayed: false
};

// ============================================
// DOM CACHE
// ============================================
let dom = {};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getScrollProgress() {
    const container = dom.scrollContainer;
    if (!container) return 0;
    
    const rect = container.getBoundingClientRect();
    const containerHeight = container.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Progress: 0 when top of container hits top of viewport,
    // 1 when bottom of container hits bottom of viewport
    const scrolled = -rect.top;
    const scrollable = containerHeight - viewportHeight;
    
    return Math.min(Math.max(scrolled / scrollable, 0), 1);
}

function getCurrentPhase(progress, config) {
    for (const [phase, bounds] of Object.entries(config.phases)) {
        if (progress >= bounds.start && progress < bounds.end) {
            return parseInt(phase);
        }
    }
    return Object.keys(config.phases).length - 1;
}

function isMobileView() {
    return window.innerWidth <= DESKTOP_CONFIG.breakpoint;
}

// Scoped query helpers
function qs(selector) {
    return dom.root ? dom.root.querySelector(selector) : null;
}
function qsa(selector) {
    return dom.root ? dom.root.querySelectorAll(selector) : [];
}

// ============================================
// CANVAS CONTROLS
// ============================================
function showCanvas() {
    dom.canvas?.classList.add('as-visible');
}

function hideCanvas() {
    dom.canvas?.classList.remove('as-visible');
}

function setCanvasZoom(zoomClass) {
    const zoomClasses = ['as-zoom-triggers', 'as-zoom-processing', 'as-zoom-outputs', 'as-zoom-full'];
    zoomClasses.forEach(cls => dom.canvas?.classList.remove(cls));
    if (zoomClass) {
        dom.canvas?.classList.add(zoomClass);
    }
}

function setCanvasOpacity(opacity) {
    if (dom.canvas) {
        dom.canvas.style.opacity = opacity;
    }
}

function setCanvasBlur(blur) {
    const svg = dom.canvas?.querySelector('.as-n8n-canvas');
    if (svg) {
        svg.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
    }
}

// ============================================
// TASK LABEL CONTROLS
// ============================================
function showTaskLabels() {
    qsa('.as-task-label-wrapper').forEach(label => {
        label.classList.add('as-visible');
        label.style.opacity = '1';
        label.style.visibility = 'visible';
    });
}

function hideTaskLabels() {
    qsa('.as-task-label-wrapper').forEach(label => {
        label.classList.remove('as-visible');
        label.style.opacity = '0';
        label.style.visibility = 'hidden';
    });
}

function fadeTaskLabels(opacity) {
    qsa('.as-task-label-wrapper').forEach(label => {
        label.style.opacity = opacity;
        if (opacity <= 0) {
            label.style.visibility = 'hidden';
        }
    });
}

// ============================================
// NODE ICON CONTROLS
// ============================================
function hideNodeIcons() {
    qsa('.as-node-icon').forEach(icon => {
        icon.style.opacity = '0';
    });
}

function showNodeIcons() {
    const icons = qsa('.as-node-icon');
    anime({
        targets: Array.from(icons),
        opacity: [0, 1],
        duration: 400,
        delay: anime.stagger(50),
        easing: 'easeOutQuad'
    });
}

// ============================================
// NODE CONTROLS
// ============================================
function showAllNodes() {
    qsa('.as-node').forEach(node => {
        node.classList.add('as-visible');
        node.classList.remove('as-dimmed', 'as-highlighted', 'as-hidden');
        node.style.opacity = '1';
    });
}

function showProblemAndGoalNodes() {
    const triggerNodes = ['as-node-schedule', 'as-node-email'];
    const outputNodes = ['as-node-report', 'as-node-post'];
    
    qsa('.as-node').forEach(node => {
        if (triggerNodes.includes(node.id) || outputNodes.includes(node.id)) {
            node.classList.add('as-visible');
            node.classList.remove('as-hidden', 'as-dimmed');
            node.style.opacity = '1';
        } else {
            node.classList.add('as-hidden');
            node.classList.remove('as-visible');
            node.style.opacity = '0';
        }
    });
    
    qsa('.as-connection').forEach(conn => {
        conn.classList.add('as-hidden');
        conn.classList.remove('as-drawn');
    });
}

function revealMiddleNodes(config) {
    const middleNodes = ['as-node-fetch', 'as-node-ai'];
    
    middleNodes.forEach((nodeId, index) => {
        const node = document.getElementById(nodeId);
        if (node) {
            node.classList.remove('as-hidden');
            anime({
                targets: node,
                opacity: [0, 1],
                duration: config.durations.nodeAppear,
                delay: index * 150,
                easing: 'easeOutQuad',
                begin: () => {
                    node.classList.add('as-visible');
                }
            });
        }
    });
}

function highlightNodes(nodeIds) {
    qsa('.as-node').forEach(node => {
        if (nodeIds.includes(node.id)) {
            node.classList.add('as-highlighted');
            node.classList.remove('as-dimmed');
        } else {
            node.classList.add('as-dimmed');
            node.classList.remove('as-highlighted');
        }
    });
}

function resetNodeStates() {
    qsa('.as-node').forEach(node => {
        node.classList.remove('as-dimmed', 'as-highlighted', 'as-hidden');
        node.classList.add('as-visible');
        node.style.opacity = '1';
    });
}

// ============================================
// CONNECTION CONTROLS
// ============================================
function activateConnections(connectionIds) {
    connectionIds.forEach(connId => {
        const conn = document.getElementById(connId);
        if (conn) {
            conn.classList.add('as-active');
            conn.classList.remove('as-dimmed');
        }
    });
}

function dimConnections(connectionIds) {
    connectionIds.forEach(connId => {
        const conn = document.getElementById(connId);
        if (conn) {
            conn.classList.add('as-dimmed');
            conn.classList.remove('as-active');
        }
    });
}

function resetConnectionStates() {
    qsa('.as-connection').forEach(conn => {
        conn.classList.remove('as-dimmed', 'as-active', 'as-hidden');
    });
}

function resetConnectionsToHidden() {
    qsa('.as-connection').forEach(conn => {
        conn.classList.add('as-hidden');
        conn.classList.remove('as-drawn', 'as-active', 'as-dimmed');
        conn.style.strokeDashoffset = '500';
    });
}

// ============================================
// PHASE SECTION CONTROL
// ============================================
function activatePhase(phaseNum) {
    qsa('.as-phase').forEach((section, index) => {
        if (index === phaseNum) {
            section.classList.add('as-active');
        } else {
            section.classList.remove('as-active');
        }
    });
}

// ============================================
// ANIMATIONS
// ============================================
function animateNodesAppearing(config) {
    const nodes = qsa('.as-node');
    
    anime({
        targets: Array.from(nodes),
        opacity: [0, 1],
        duration: config.durations.nodeAppear,
        delay: anime.stagger(80, { start: 100 }),
        easing: 'easeOutQuad',
        begin: () => {
            nodes.forEach(n => n.classList.add('as-visible'));
        }
    });
}

function animateConnectionsDrawing(config) {
    const connections = qsa('.as-connection');
    
    connections.forEach(c => c.classList.remove('as-hidden'));
    
    anime({
        targets: Array.from(connections),
        strokeDashoffset: [500, 0],
        duration: config.durations.connectionDraw,
        delay: anime.stagger(120, { start: 100 }),
        easing: 'easeInOutQuad',
        begin: () => {
            connections.forEach(c => c.classList.add('as-drawn'));
        }
    });
}

function animateDataFlow(pathId, particleId, delay, config) {
    const path = document.getElementById(pathId);
    const particle = document.getElementById(particleId);
    
    if (!path || !particle) return;
    
    const pathLength = path.getTotalLength();
    
    anime({
        targets: particle,
        opacity: [0, 1, 1, 0],
        duration: config.durations.dataFlow,
        delay: delay,
        easing: 'linear',
        update: function(anim) {
            const progress = anim.progress / 100;
            const point = path.getPointAtLength(pathLength * progress);
            particle.setAttribute('cx', point.x);
            particle.setAttribute('cy', point.y);
        }
    });
}

function animateFullDataFlow(config) {
    animateDataFlow('as-conn-schedule-fetch', 'as-particle-1', 0, config);
    animateDataFlow('as-conn-fetch-ai', 'as-particle-2', 400, config);
    animateDataFlow('as-conn-ai-report', 'as-particle-3', 800, config);
    animateDataFlow('as-conn-ai-post', 'as-particle-4', 900, config);
}

function showExtensionHints(type) {
    if (type === 'triggers') {
        anime({
            targets: ['#as-hint-triggers', '#as-hint-triggers-text'],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
    } else if (type === 'outputs') {
        anime({
            targets: ['#as-hint-outputs', '#as-hint-outputs-text'],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
    }
}

function hideExtensionHints() {
    anime({
        targets: qsa('.as-hint-line, .as-hint-text'),
        opacity: 0,
        duration: 300,
        easing: 'easeOutQuad'
    });
}

// ============================================
// DESKTOP PHASE HANDLERS
// ============================================
const desktopPhaseHandlers = {
    0: {
        enter() {
            state.nodesVisible = false;
            state.connectionsDrawn = false;
            state.dataFlowPlayed = false;
            
            showCanvas();
            setCanvasZoom('as-zoom-full');
            setCanvasOpacity(1);
            setCanvasBlur(0);
            showProblemAndGoalNodes();
            showTaskLabels();
            hideNodeIcons();
            resetConnectionsToHidden();
            activatePhase(0);
        },
        update(progress) {
            const localProgress = (progress - DESKTOP_CONFIG.phases[0].start) / 
                                  (DESKTOP_CONFIG.phases[0].end - DESKTOP_CONFIG.phases[0].start);
            if (localProgress > 0.5) {
                const labelOpacity = 1 - ((localProgress - 0.5) * 2);
                fadeTaskLabels(Math.max(0, labelOpacity));
            }
        },
        exit() {
            hideTaskLabels();
        }
    },
    
    1: {
        enter() {
            showCanvas();
            setCanvasZoom('as-zoom-full');
            activatePhase(1);
            hideTaskLabels();
            showNodeIcons();
            
            qsa('.as-connection').forEach(conn => {
                conn.classList.remove('as-active', 'as-dimmed');
            });
        },
        update(progress) {
            const localProgress = (progress - DESKTOP_CONFIG.phases[1].start) / 
                                  (DESKTOP_CONFIG.phases[1].end - DESKTOP_CONFIG.phases[1].start);
            
            if (localProgress > 0.4 && !state.nodesVisible) {
                revealMiddleNodes(DESKTOP_CONFIG);
                state.nodesVisible = true;
            }
            
            if (localProgress > 0.6 && !state.connectionsDrawn) {
                animateConnectionsDrawing(DESKTOP_CONFIG);
                state.connectionsDrawn = true;
            }
        },
        exit() {}
    },
    
    2: {
        enter() {
            showCanvas();
            setCanvasZoom('as-zoom-triggers');
            activatePhase(2);
            highlightNodes(['as-node-schedule', 'as-node-email']);
            activateConnections(['as-conn-schedule-fetch', 'as-conn-email-fetch']);
            dimConnections(['as-conn-fetch-ai', 'as-conn-ai-report', 'as-conn-ai-post']);
            showExtensionHints('triggers');
        },
        update(progress) {},
        exit() {
            hideExtensionHints();
        }
    },
    
    3: {
        enter() {
            showCanvas();
            setCanvasZoom('as-zoom-processing');
            activatePhase(3);
            highlightNodes(['as-node-fetch', 'as-node-ai']);
            activateConnections(['as-conn-schedule-fetch', 'as-conn-email-fetch', 'as-conn-fetch-ai']);
            dimConnections(['as-conn-ai-report', 'as-conn-ai-post']);
            
            setTimeout(() => {
                animateDataFlow('as-conn-fetch-ai', 'as-particle-2', 0, DESKTOP_CONFIG);
            }, 400);
        },
        update(progress) {},
        exit() {}
    },
    
    4: {
        enter() {
            showCanvas();
            setCanvasZoom('as-zoom-outputs');
            activatePhase(4);
            highlightNodes(['as-node-report', 'as-node-post']);
            activateConnections(['as-conn-schedule-fetch', 'as-conn-email-fetch', 'as-conn-fetch-ai', 'as-conn-ai-report', 'as-conn-ai-post']);
            showExtensionHints('outputs');
            
            setTimeout(() => {
                animateDataFlow('as-conn-ai-report', 'as-particle-3', 0, DESKTOP_CONFIG);
                animateDataFlow('as-conn-ai-post', 'as-particle-4', 200, DESKTOP_CONFIG);
            }, 400);
        },
        update(progress) {},
        exit() {
            hideExtensionHints();
        }
    },
    
    5: {
        enter() {
            showCanvas();
            setCanvasZoom('as-zoom-full');
            activatePhase(5);
            resetNodeStates();
            resetConnectionStates();
            showAllNodes();
            
            if (!state.dataFlowPlayed) {
                setTimeout(() => {
                    animateFullDataFlow(DESKTOP_CONFIG);
                }, 500);
                state.dataFlowPlayed = true;
            }
        },
        update(progress) {
            // Fade canvas out towards end
            const localProgress = (progress - DESKTOP_CONFIG.phases[5].start) / 
                                  (DESKTOP_CONFIG.phases[5].end - DESKTOP_CONFIG.phases[5].start);
            if (localProgress > 0.7) {
                const canvasOpacity = Math.max(0, 1 - ((localProgress - 0.7) / 0.3));
                setCanvasOpacity(canvasOpacity);
            }
        },
        exit() {
            setCanvasOpacity(1);
        }
    }
};

// ============================================
// MOBILE-SPECIFIC HELPERS
// ============================================
function setMobileZoom(zoomLevel) {
    const zoomClasses = ['as-zoom-start', 'as-zoom-mid', 'as-zoom-end', 'as-zoom-triggers', 'as-zoom-processing', 'as-zoom-outputs', 'as-zoom-full'];
    zoomClasses.forEach(cls => dom.canvas?.classList.remove(cls));
    
    const svg = dom.canvas?.querySelector('.as-n8n-canvas');
    if (svg) {
        svg.style.transform = `scale(${zoomLevel})`;
    }
}

function ensureMiddleNodesVisible() {
    const middleNodes = ['as-node-fetch', 'as-node-ai'];
    middleNodes.forEach(nodeId => {
        const node = document.getElementById(nodeId);
        if (node && !node.classList.contains('as-visible')) {
            node.classList.remove('as-hidden');
            node.classList.add('as-visible');
            node.style.opacity = '1';
        }
    });
}

function ensureConnectionsDrawn() {
    qsa('.as-connection').forEach(conn => {
        if (!conn.classList.contains('as-drawn')) {
            conn.classList.remove('as-hidden');
            conn.classList.add('as-drawn');
            conn.style.strokeDashoffset = '0';
        }
    });
}

// ============================================
// MOBILE PHASE HANDLERS
// ============================================
const mobilePhaseHandlers = {
    0: {
        enter() {
            state.nodesVisible = false;
            state.connectionsDrawn = false;
            state.dataFlowPlayed = false;
            
            showCanvas();
            setMobileZoom(MOBILE_CONFIG.zoom.phase0);
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
            setCanvasBlur(0);
            showProblemAndGoalNodes();
            showNodeIcons();
            resetConnectionsToHidden();
            hideTaskLabels();
            activatePhase(0);
        },
        update(progress) {},
        exit() {}
    },
    
    1: {
        enter() {
            showCanvas();
            setMobileZoom(MOBILE_CONFIG.zoom.phase1);
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
            setCanvasBlur(0);
            activatePhase(1);
            
            if (!state.nodesVisible) {
                revealMiddleNodes(MOBILE_CONFIG);
                state.nodesVisible = true;
            }
        },
        update(progress) {},
        exit() {}
    },
    
    2: {
        enter() {
            showCanvas();
            setMobileZoom(MOBILE_CONFIG.zoom.phase2);
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
            setCanvasBlur(0);
            activatePhase(2);
            
            ensureMiddleNodesVisible();
            
            if (!state.connectionsDrawn) {
                animateConnectionsDrawing(MOBILE_CONFIG);
                state.connectionsDrawn = true;
            }
        },
        update(progress) {},
        exit() {}
    },
    
    3: {
        enter() {
            showCanvas();
            setMobileZoom(MOBILE_CONFIG.zoom.phase3);
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
            setCanvasBlur(0);
            activatePhase(3);
            
            ensureMiddleNodesVisible();
            ensureConnectionsDrawn();
            
            activateConnections(['as-conn-schedule-fetch', 'as-conn-email-fetch', 'as-conn-fetch-ai', 'as-conn-ai-report', 'as-conn-ai-post']);
            
            if (!state.dataFlowPlayed) {
                setTimeout(() => {
                    animateFullDataFlow(MOBILE_CONFIG);
                }, 300);
                state.dataFlowPlayed = true;
            }
        },
        update(progress) {},
        exit() {}
    },
    
    4: {
        enter() {
            showCanvas();
            setMobileZoom(MOBILE_CONFIG.zoom.phase4);
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
            setCanvasBlur(MOBILE_CONFIG.canvasBlurAmount);
            activatePhase(4);
            
            ensureMiddleNodesVisible();
            ensureConnectionsDrawn();
        },
        update(progress) {},
        exit() {}
    },
    
    5: {
        enter() {
            activatePhase(5);
            setCanvasBlur(MOBILE_CONFIG.canvasBlurAmount);
        },
        update(progress) {
            const localProgress = (progress - MOBILE_CONFIG.phases[5].start) / 
                                  (MOBILE_CONFIG.phases[5].end - MOBILE_CONFIG.phases[5].start);
            const canvasOpacity = Math.max(0, MOBILE_CONFIG.canvasOpacity - (localProgress * MOBILE_CONFIG.canvasOpacity));
            setCanvasOpacity(canvasOpacity);
        },
        exit() {
            setCanvasOpacity(MOBILE_CONFIG.canvasOpacity);
        }
    }
};

// ============================================
// SCROLL HANDLER
// ============================================
function handleScroll() {
    // Only process if showcase is in or near viewport
    const rect = dom.scrollContainer.getBoundingClientRect();
    const viewH = window.innerHeight;
    
    // Skip if showcase is completely above or below viewport
    if (rect.bottom < -viewH || rect.top > viewH * 2) return;
    
    state.scrollProgress = getScrollProgress();
    
    const config = state.isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
    const handlers = state.isMobile ? mobilePhaseHandlers : desktopPhaseHandlers;
    
    const newPhase = getCurrentPhase(state.scrollProgress, config);
    
    if (newPhase !== state.currentPhase) {
        const goingBack = newPhase < state.currentPhase;
        
        if (goingBack && state.isMobile) {
            if (newPhase < 2) state.connectionsDrawn = false;
            if (newPhase < 1) state.nodesVisible = false;
            if (newPhase < 3) state.dataFlowPlayed = false;
        }
        
        if (goingBack && !state.isMobile) {
            if (newPhase < 1) {
                state.nodesVisible = false;
                state.connectionsDrawn = false;
                state.dataFlowPlayed = false;
            }
        }
        
        // Exit old phase
        if (state.currentPhase >= 0 && handlers[state.currentPhase]?.exit) {
            handlers[state.currentPhase].exit();
        }
        
        // Enter new phase
        if (handlers[newPhase]?.enter) {
            handlers[newPhase].enter();
        }
        
        state.currentPhase = newPhase;
    }
    
    // Continuous update
    if (handlers[state.currentPhase]?.update) {
        handlers[state.currentPhase].update(state.scrollProgress);
    }
}

// ============================================
// RESET STATE
// ============================================
function resetAllState() {
    state.currentPhase = -1;
    state.scrollProgress = 0;
    state.nodesVisible = false;
    state.connectionsDrawn = false;
    state.dataFlowPlayed = false;
    
    setCanvasOpacity(1);
    setCanvasBlur(0);
    setCanvasZoom(null);
    hideCanvas();
    hideTaskLabels();
    hideExtensionHints();
    
    const svg = dom.canvas?.querySelector('.as-n8n-canvas');
    if (svg) {
        svg.style.transform = '';
    }
    
    qsa('.as-node').forEach(node => {
        node.classList.remove('as-visible', 'as-hidden', 'as-dimmed', 'as-highlighted');
        node.style.opacity = '';
    });
    
    qsa('.as-connection').forEach(conn => {
        conn.classList.remove('as-drawn', 'as-active', 'as-dimmed', 'as-hidden');
        conn.style.strokeDashoffset = '';
    });
    
    qsa('.as-node-icon').forEach(icon => {
        icon.style.opacity = '';
    });
    
    qsa('.as-data-particle').forEach(particle => {
        particle.setAttribute('opacity', '0');
    });
}

// ============================================
// VIEW MODE HANDLING
// ============================================
function applyViewMode() {
    const wasMobile = state.isMobile;
    state.isMobile = isMobileView();
    
    const config = state.isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
    dom.scrollContainer.style.height = config.scrollHeight;
    
    dom.root.classList.toggle('as-mobile-view', state.isMobile);
    dom.root.classList.toggle('as-desktop-view', !state.isMobile);
    
    if (wasMobile !== state.isMobile && state.initialized) {
        resetAllState();
        handleScroll();
    }
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Cache DOM - scoped to the showcase container
    dom.root = document.getElementById('automation-showcase');
    dom.scrollContainer = document.getElementById('as-showcase-container');
    dom.canvas = document.getElementById('as-n8n-canvas');
    
    if (!dom.scrollContainer || !dom.root) {
        // Showcase not on this page, skip
        return;
    }
    
    // Detect initial view mode
    applyViewMode();
    
    // Scroll listener
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
    
    // Resize listener
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            applyViewMode();
        }, 150);
    }, { passive: true });
    
    // Initial state
    handleScroll();
    
    state.initialized = true;
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
