/**
 * ============================================
 * RESTAURANT AUTOMATION DEMO - ANIMATION SCRIPT
 * Rewritten for better click handling and looping
 * Now loads data from external JSON file
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================
const MENU_DATA_URL = 'menu-data.json'; // Path to your menu data file
const DEFAULT_LANGUAGE = 'hu'; // Default language: 'hu', 'en', or 'nl'

// ============================================
// GLOBAL STATE
// ============================================
let menuData = null;
let currentLanguage = DEFAULT_LANGUAGE;
let translations = null;
let restaurantInfo = null;

// Animation state
let currentDayIndex = 0;
let isAutoPlaying = true;
let dayTimer = null;
let currentDayAnimation = null;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const TIME_PER_DAY = 4000; // 4 seconds per day

// ============================================
// DETECT LANGUAGE FROM PAGE
// ============================================
function detectLanguage() {
    // Try to detect from Hugo's language meta tag
    const htmlLang = document.documentElement.lang;
    if (htmlLang && ['hu', 'en', 'nl'].includes(htmlLang)) {
        return htmlLang;
    }
    
    // Try to detect from URL path (Hugo structure: /en/, /nl/, /hu/)
    const path = window.location.pathname;
    if (path.includes('/en/')) return 'en';
    if (path.includes('/nl/')) return 'nl';
    if (path.includes('/hu/')) return 'hu';
    
    // Fallback to default
    return DEFAULT_LANGUAGE;
}

// ============================================
// LOAD MENU DATA FROM JSON
// ============================================
async function loadMenuData() {
    try {
        console.log('📥 Loading menu data from:', MENU_DATA_URL);
        const response = await fetch(MENU_DATA_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        menuData = data.week;
        translations = data.translations[currentLanguage];
        restaurantInfo = data.restaurant;
        
        console.log('✅ Menu data loaded successfully');
        console.log('📅 Last updated:', data.meta.lastUpdated);
        return true;
    } catch (error) {
        console.error('❌ Error loading menu data:', error);
        console.log('⚠️ Using fallback menu data');
        useFallbackData();
        return false;
    }
}

// Fallback data if JSON fails to load
function useFallbackData() {
    menuData = {
        monday: {
            soup: 'Bableves',
            dishes: ['Bolognai spagetti sajttal', 'Roston csirkemell füstölt sajtmártással']
        },
        tuesday: {
            soup: 'Paradicsomleves betűtészta',
            dishes: ['Dubarry sertésborda rizs', 'Rakott burgonya tejföllel']
        },
        wednesday: {
            soup: 'Erdészleves',
            dishes: ['Csípős-mézes csirkemell csíkok burgonyapüré', 'Zöldséggel gratinírozott csirkemell rizs']
        },
        thursday: {
            soup: 'Sajtleves fűszeres krutonnal',
            dishes: ['Bakonyi sertésborda galuska', 'Paprikás csirke nokedli']
        },
        friday: {
            soup: 'Gulyásleves',
            dishes: ['Halfilé rizs citrom', 'Rántott sajt hasábburgonya']
        }
    };
    
    translations = {
        days: {
            monday: 'Hétfő', tuesday: 'Kedd', wednesday: 'Szerda',
            thursday: 'Csütörtök', friday: 'Péntek', saturday: 'Szombat', sunday: 'Vasárnap'
        },
        labels: {
            todaysMenu: 'Mai menüajánlatunk',
            soup: 'Leves'
        }
    };
    
    restaurantInfo = {
        name: 'Az Ön Étterme',
        price: '2590',
        currency: 'Ft',
        hours: '11:30-14:00'
    };
}

// ============================================
// DATE CALCULATION
// ============================================
function calculateNextWeekDates() {
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntilNextMonday;
    if (currentDay === 0) {
        daysUntilNextMonday = 1;
    } else if (currentDay === 6) {
        daysUntilNextMonday = 2;
    } else {
        daysUntilNextMonday = 8 - currentDay;
    }
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    
    const monthNames = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'];
    
    const dates = {};
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    dayKeys.forEach((key, index) => {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + index);
        
        dates[key] = {
            dayNum: date.getDate(),
            month: monthNames[date.getMonth()],
            fullDate: date
        };
    });
    
    const mondayMonth = dates.monday.month;
    const fridayMonth = dates.friday.month;
    const weekRange = mondayMonth === fridayMonth 
        ? `${mondayMonth} ${dates.monday.dayNum}-${dates.friday.dayNum}`
        : `${mondayMonth} ${dates.monday.dayNum} - ${fridayMonth} ${dates.friday.dayNum}`;
    
    return { dates, weekRange };
}

function updateCalendarDates() {
    const { dates, weekRange } = calculateNextWeekDates();
    
    document.getElementById('calendar-dates').textContent = weekRange;
    
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayIds = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    
    dayKeys.forEach((key, index) => {
        const dayNumElement = document.getElementById(`day-${dayIds[index]}`);
        const dayElement = dayNumElement.parentElement;
        const monthElement = dayElement.querySelector('.day-month');
        
        dayNumElement.textContent = dates[key].dayNum;
        monthElement.textContent = dates[key].month;
    });
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
function updateFacebookContent(dayKey) {
    if (!menuData || !translations) return;
    
    const dayData = menuData[dayKey];
    const dayName = translations.days[dayKey];
    const fbContent = document.getElementById('fb-content');
    
    const content = `
        <div class="line" data-line="0">📅 ${translations.labels.todaysMenu} - ${dayName}</div>
        <div class="line" data-line="1"><br></div>
        <div class="line" data-line="2">🍲 ${translations.labels.soup}: ${dayData.soup}</div>
        <div class="line" data-line="3"><br></div>
        <div class="line" data-line="4">🍽️ ${dayData.dishes[0]}</div>
        <div class="line" data-line="5">🍽️ ${dayData.dishes[1]}</div>
        <div class="line" data-line="6"><br>💰 ${restaurantInfo.price} ${restaurantInfo.currency} · ⏰ ${restaurantInfo.hours}</div>
    `;
    
    fbContent.innerHTML = content;
}

function clearExcelHighlights() {
    const allCells = document.querySelectorAll('.excel-cell[data-day]');
    allCells.forEach(cell => cell.classList.remove('highlight'));
}

function highlightExcelDay(dayKey) {
    clearExcelHighlights();
    const dayCells = document.querySelectorAll(`.excel-cell[data-day="${dayKey}"]`);
    dayCells.forEach(cell => cell.classList.add('highlight'));
}

function getExcelScrollPositionForDay(dayKey) {
    const dayRowMap = {
        monday: 0,
        tuesday: 3,
        wednesday: 6,
        thursday: 9,
        friday: 12
    };
    
    const startRow = dayRowMap[dayKey];
    const rowHeight = 28;
    
    return Math.max(0, (startRow - 1) * rowHeight);
}

function scrollExcelToDay(dayKey) {
    const excelGrid = document.getElementById('excel-grid');
    const scrollPosition = getExcelScrollPositionForDay(dayKey);
    
    if (excelGrid) {
        excelGrid.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }
}

function updateCalendarStatus(currentDayKey) {
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const currentIndex = dayOrder.indexOf(currentDayKey);
    
    dayOrder.forEach((key, index) => {
        const dayElement = document.querySelector(`.calendar-day[data-day="${key}"]`);
        
        dayElement.classList.remove('active', 'completed');
        
        if (index < currentIndex) {
            dayElement.classList.add('completed');
        } else if (index === currentIndex) {
            dayElement.classList.add('active');
        }
    });
}

// ============================================
// ANIMATION STATE MANAGEMENT
// ============================================
let currentDayIndex = 0;
let isAutoPlaying = true;
let dayTimer = null;
let currentDayAnimation = null;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const TIME_PER_DAY = 4000; // 4 seconds per day

// Set the complete state for a day (all UI elements)
function setDayState(dayKey, animate = true) {
    console.log(`Setting day state: ${dayKey}, animate: ${animate}`);
    
    // Stop any ongoing animations
    if (currentDayAnimation) {
        currentDayAnimation.pause();
    }
    
    // Update all UI elements
    updateCalendarStatus(dayKey);
    highlightExcelDay(dayKey);
    scrollExcelToDay(dayKey);
    updateFacebookContent(dayKey);
    
    // Animate Facebook content if requested
    if (animate) {
        animateFacebookLines();
        animateProgressRing();
        pulseArrow();
    } else {
        // Just make lines visible immediately
        const lines = document.querySelectorAll('#fb-content .line');
        anime.set(lines, {
            opacity: 1,
            translateY: 0
        });
        
        // Reset progress ring
        anime.set('.progress-ring .progress', {
            strokeDashoffset: 97.4
        });
    }
}

// Animate Facebook post lines appearing
function animateFacebookLines() {
    const lines = document.querySelectorAll('#fb-content .line');
    
    currentDayAnimation = anime({
        targets: lines,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(150),
        easing: 'easeOutQuad'
    });
}

// Animate progress ring filling
function animateProgressRing() {
    anime({
        targets: '.progress-ring .progress',
        strokeDashoffset: [97.4, 0],
        duration: TIME_PER_DAY - 500,
        easing: 'linear'
    });
}

// Pulse the arrow
function pulseArrow() {
    anime({
        targets: '.arrow-icon',
        scale: [1, 1.15, 1],
        duration: 600,
        easing: 'easeInOutBack'
    });
}

// Move to next day in sequence
function advanceToNextDay() {
    if (!isAutoPlaying) return;
    
    currentDayIndex = (currentDayIndex + 1) % days.length;
    const dayKey = days[currentDayIndex];
    
    // Transition animation: fade out, update, fade in
    const lines = document.querySelectorAll('#fb-content .line');
    
    anime({
        targets: lines,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
            setDayState(dayKey, true);
        }
    });
    
    // Schedule next day
    scheduleDayTransition();
}

// Schedule the next day transition
function scheduleDayTransition() {
    if (dayTimer) {
        clearTimeout(dayTimer);
    }
    
    if (isAutoPlaying) {
        dayTimer = setTimeout(advanceToNextDay, TIME_PER_DAY);
    }
}

// Start the automatic day progression
function startAutoPlay() {
    console.log('Starting auto-play');
    isAutoPlaying = true;
    scheduleDayTransition();
}

// Stop automatic progression
function stopAutoPlay() {
    console.log('Stopping auto-play');
    isAutoPlaying = false;
    if (dayTimer) {
        clearTimeout(dayTimer);
        dayTimer = null;
    }
}

// Jump to a specific day (from calendar click)
function jumpToDay(dayKey) {
    console.log(`Jumping to: ${dayKey}`);
    
    // Stop auto-play temporarily
    stopAutoPlay();
    
    // Update current index
    currentDayIndex = days.indexOf(dayKey);
    
    // Fade out current content
    const lines = document.querySelectorAll('#fb-content .line');
    
    anime({
        targets: lines,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => {
            // Set new day state with animation
            setDayState(dayKey, true);
            
            // Resume auto-play after a delay
            setTimeout(() => {
                startAutoPlay();
            }, 1000); // Let user see the clicked day for 1 second
        }
    });
}

// ============================================
// CALENDAR CLICK HANDLERS
// ============================================
function setupCalendarClickHandlers() {
    const calendarDays = document.querySelectorAll('.calendar-day:not(.weekend)');
    
    calendarDays.forEach(dayElement => {
        dayElement.addEventListener('click', function() {
            const dayKey = this.getAttribute('data-day');
            if (dayKey) {
                jumpToDay(dayKey);
            }
        });
    });
    
    console.log('Calendar click handlers setup');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 Initializing restaurant automation demo...');
    
    // Detect language
    currentLanguage = detectLanguage();
    console.log('🌐 Language detected:', currentLanguage);
    
    // Load menu data from JSON
    await loadMenuData();
    
    // Update calendar with real dates
    updateCalendarDates();
    console.log('✅ Calendar dates updated');
    
    // Setup click handlers
    setupCalendarClickHandlers();
    console.log('✅ Click handlers ready');
    
    // Set initial state (Monday, no animation)
    currentDayIndex = 0;
    setDayState('monday', false);
    console.log('✅ Initial state set to Monday');
    
    // Start animation after delay
    setTimeout(() => {
        // Animate Monday's content appearing
        animateFacebookLines();
        animateProgressRing();
        
        // Start auto-progression
        startAutoPlay();
        console.log('▶️ Animation started!');
    }, 1500);
    
    console.log('🎉 Demo fully initialized!');
});

// ============================================
// INTERSECTION OBSERVER (pause when not visible)
// ============================================
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isAutoPlaying) {
                    startAutoPlay();
                    console.log('👀 Section visible - resumed');
                }
            } else {
                stopAutoPlay();
                console.log('🙈 Section hidden - paused');
            }
        });
    }, { threshold: 0.3 });
    
    const demoSection = document.querySelector('.automation-demo-section');
    if (demoSection) {
        observer.observe(demoSection);
    }
}
