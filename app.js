// ═══════════════════════════════════════════════════════════
// FIREBASE — project: timetable-ab826
// Firestore Rules needed (Firebase Console → Firestore → Rules):
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       match /{document=**} {
//         allow read, write: if true;
//       }
//     }
//   }
// ═══════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyDSI32p0geilwDLSzR6J6J30x5iujBHi-Q",
    authDomain:        "timetable-ab826.firebaseapp.com",
    projectId:         "timetable-ab826",
    storageBucket:     "timetable-ab826.firebasestorage.app",
    messagingSenderId: "805287368412",
    appId:             "1:805287368412:web:ac7a8e3396bff3ba894619",
    measurementId:     "G-67BEH4P6QP"
};

let firestoreDb  = null;
let analyticsApp = null;

(function initFirebase() {
    try {
        if (typeof firebase === 'undefined') return;
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        firestoreDb = firebase.firestore();
        if (FIREBASE_CONFIG.measurementId && firebase.analytics) {
            analyticsApp = firebase.analytics();
        }
    } catch (e) { console.warn('Firebase init error:', e); }
})();

document.addEventListener('DOMContentLoaded', function () {
    const iframeEl = document.getElementById('google-calendar-iframe');
    const teacherFiltersEl = document.getElementById('teacher-filters');
    const classFiltersEl = document.getElementById('class-filters');

    // Data from User
    const teachers = [
        { id: 'him', name: 'Him', calendarId: 'passerellesnumeriques.org_343437393530363136@resource.calendar.google.com', color: '5C5CEE', role: 'IT Trainer' },
        { id: 'lavy', name: 'Lavy', calendarId: 'passerellesnumeriques.org_2d3331373838323735363330@resource.calendar.google.com', color: '10B981', role: 'ENG/PL Trainer' },
        { id: 'mengheang', name: 'Mengheang', calendarId: 'c_1886h9lqonri4ig0noe2vrfvp8fb8@resource.calendar.google.com', color: 'F59E0B', role: 'IT Trainer' },
        { id: 'rady', name: 'Rady', calendarId: 'passerellesnumeriques.org_2d3132393337373934393735@resource.calendar.google.com', color: 'EF4444', role: 'IT Coor' },
        { id: 'yon', name: 'Yon', calendarId: 'c_1882ckecmfgb0h7fmha0u9t3rbd5g@resource.calendar.google.com', color: '8B5CF6', role: 'IT Trainer' },
        { id: 'savoeurn', name: 'Savoeurn', calendarId: 'passerellesnumeriques.org_3539373731343733353932@resource.calendar.google.com', color: 'EC4899', role: 'IT Trainer' },
        { id: 'ouchi', name: 'Ouchi', calendarId: 'c_188b20cg9s5uoh12jobk987cfbh2g@resource.calendar.google.com', color: '06B6D4', role: 'ENG/PL Trainer' },
        { id: 'sokhom', name: 'Sokhom', calendarId: 'passerellesnumeriques.org_2d3633393338303431343434@resource.calendar.google.com', color: 'F97316', role: 'ENG/PL Coor' },
        { id: 'sreyleap', name: 'Sreyleap', calendarId: 'c_1884lpdesdih0irbl36ss1j7vt7aq@resource.calendar.google.com', color: '14B8A6', role: 'English Trainer' },
        { id: 'puthy', name: 'Puthy', calendarId: 'passerellesnumeriques.org_3733323437383733383932@resource.calendar.google.com', color: '6366F1', role: 'PL Trainer' },
        { id: 'mesa', name: 'Mesa', calendarId: 'c_1885a09ufiueqj6hn3tv09m5ngs5c@resource.calendar.google.com', color: '3B82F6', role: 'IT Trainer' }
    ];

    const classes = [
        { id: 'y2a', name: 'WEP/Y2-A', room: 'B12', calendarId: 'c_4641706806a2bc464ecfce3054fce93b2ebd72161c407d074ba961f730e4d793@group.calendar.google.com', color: '4F46E5' },
        { id: 'y2b', name: 'WEP/Y2-B', room: 'B13', calendarId: 'c_60f24913a85bf20e950e70146ff604d69d14749a316da204fa485e7d6731a12b@group.calendar.google.com', color: '059669' },
        { id: 'y2c', name: 'WEP/Y2-C', room: 'B22', calendarId: 'c_2da1c687af3c99d3ecaf14bbc5d82b9cc9b0fc75dcca546fd690ea5070091940@group.calendar.google.com', color: 'D97706' },
        { id: 'y1a', name: 'WEP/Y1-A', room: 'A22', calendarId: 'c_dab09f6598d565f82430eaa5c51ab4b01045bb20a340a7273f4a67a911c6f61c@group.calendar.google.com', color: 'DC2626' },
        { id: 'y1b', name: 'WEP/Y1-B', room: 'B23', calendarId: 'c_2e32feb66be240456f961cc2f43c0bbef9c5ff6cbb68abdea333adf1739f9833@group.calendar.google.com', color: '7C3AED' },
        { id: 'y1c', name: 'WEP/Y1-C', room: 'B31', calendarId: 'c_4f19b4ea9a24523bb7910e4d19bb0f426abdfc3e2b67850a4d5770e4755674db@group.calendar.google.com', color: 'DB2777' },
        { id: 'y1d', name: 'SNA/Y1', room: 'A21', calendarId: 'c_60360764ac056113deb843d3bc1a8dd6e66a0bbddcf4dbd1ff4ea3453417dc3e@group.calendar.google.com', color: '0891B2' }
    ];

    // Date Management
    let currentViewDate = new Date();
    const savedDateStr = localStorage.getItem('currentViewDate');
    const lastActiveTime = localStorage.getItem('lastActiveTime');
    const now = Date.now();

    if (savedDateStr) {
        if (!lastActiveTime || (now - parseInt(lastActiveTime) <= 5 * 60 * 1000)) {
            currentViewDate = new Date(savedDateStr);
        } else {
            // Over 5 mins since last active, reset to current date
            currentViewDate = new Date();
            localStorage.setItem('currentViewDate', currentViewDate.toISOString());
        }
    }

    function getWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }

    function updateDateUI() {
        const weekNumEl = document.getElementById('current-week-num');
        if (weekNumEl) {
            weekNumEl.textContent = getWeekNumber(currentViewDate);
        }

        const monthYearEl = document.getElementById('current-month-year');
        if (monthYearEl) {
            const d = new Date(currentViewDate);
            d.setDate(d.getDate() - d.getDay()); // Sunday
            const startMonth = d.toLocaleDateString('en-US', { month: 'short' });
            d.setDate(d.getDate() + 6); // Saturday
            const endMonth = d.toLocaleDateString('en-US', { month: 'short' });
            const year = d.getFullYear();

            if (startMonth === endMonth) {
                monthYearEl.textContent = `${startMonth} ${year}`;
            } else {
                monthYearEl.textContent = `${startMonth} - ${endMonth} ${year}`;
            }
        }
    }

    function getGoogleDatesParam(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay()); // Sunday
        const end = new Date(d);
        end.setDate(end.getDate() + 7); // Next Sunday

        const formatDate = (dateObj) => {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${y}${m}${day}`;
        };

        return `dates=${formatDate(d)}/${formatDate(end)}`;
    }

    function saveDateAndUpdate() {
        localStorage.setItem('currentViewDate', currentViewDate.toISOString());
        updateDateUI();
        updateIframeSource();
        renderDailyCards();
        updateSessionBadge();
    }

    // Initialize UI Filters
    function initFilters() {
        let savedId = localStorage.getItem('selectedCalendarId');

        // Ensure savedId is valid
        const isValidSavedId = [...teachers, ...classes].some(item => item.id === savedId);
        if (!isValidSavedId) savedId = null;

        let isFirst = true;

        teachers.forEach(teacher => {
            const isChecked = savedId ? (teacher.id === savedId) : isFirst;
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="radio" name="calendar-selection" id="t-${teacher.id}" value="${teacher.id}" ${isChecked ? 'checked' : ''}>
                <label for="t-${teacher.id}" style="--item-color: #${teacher.color};">
                    <div style="display: flex; align-items: center;">
                        <span class="color-dot" style="background-color: #${teacher.color}"></span>
                        ${teacher.name}
                    </div>
                    <span class="item-badge" style="--badge-bg: #${teacher.color}20; --badge-color: #${teacher.color};">${teacher.role || 'Trainer'}</span>
                </label>
            `;
            teacherFiltersEl.appendChild(div);
            if (isChecked) isFirst = false;
        });

        classes.forEach(cls => {
            const isChecked = savedId === cls.id;
            const badgeText = cls.room || cls.name;

            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="radio" name="calendar-selection" id="c-${cls.id}" value="${cls.id}" ${isChecked ? 'checked' : ''}>
                <label for="c-${cls.id}" style="--item-color: #${cls.color};">
                    <div style="display: flex; align-items: center;">
                        <span class="color-dot" style="background-color: #${cls.color}"></span>
                        ${cls.name}
                    </div>
                    <span class="item-badge" style="--badge-bg: #${cls.color}20; --badge-color: #${cls.color};">${badgeText}</span>
                </label>
            `;
            classFiltersEl.appendChild(div);
        });

        // Add event listeners to radio buttons
        document.querySelectorAll('input[name="calendar-selection"]').forEach(rb => {
            rb.addEventListener('change', function () {
                localStorage.setItem('selectedCalendarId', this.value);
                updateIframeSource();
                renderDailyCards();
                updateSessionBadge();
            });
        });
    }

    document.getElementById('prev-week-btn').addEventListener('click', () => {
        currentViewDate.setDate(currentViewDate.getDate() - 7);
        saveDateAndUpdate();
    });

    document.getElementById('next-week-btn').addEventListener('click', () => {
        currentViewDate.setDate(currentViewDate.getDate() + 7);
        saveDateAndUpdate();
    });

    document.getElementById('today-btn').addEventListener('click', () => {
        currentViewDate = new Date();
        saveDateAndUpdate();
    });

    function updateIframeSource() {
        let baseUrl = "https://calendar.google.com/calendar/embed?showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=WEEK&ctz=Asia/Phnom_Penh";
        baseUrl += "&" + getGoogleDatesParam(currentViewDate);
        let sources = [];

        // Add selected source
        const checkedRadio = document.querySelector('input[name="calendar-selection"]:checked');
        if (checkedRadio) {
            const selectedId = checkedRadio.value;
            const isTeacher = checkedRadio.id.startsWith('t-');

            if (isTeacher) {
                const teacher = teachers.find(t => t.id === selectedId);
                if (teacher) {
                    sources.push(`src=${encodeURIComponent(teacher.calendarId)}&color=%23${teacher.color}`);
                }
            } else {
                const cls = classes.find(c => c.id === selectedId);
                if (cls) {
                    sources.push(`src=${encodeURIComponent(cls.calendarId)}&color=%23${cls.color}`);
                }
            }
        }

        if (sources.length > 0) {
            iframeEl.src = baseUrl + "&" + sources.join("&");
        } else {
            iframeEl.src = baseUrl;
        }
    }

    // --- DAILY VIEW LOGIC ---
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const weeklyViewEl = document.getElementById('weekly-view');
    const dailyViewEl = document.getElementById('daily-view');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const view = e.target.getAttribute('data-view');
            if (view === 'week') {
                if(weeklyViewEl) weeklyViewEl.style.display = 'block';
                if(dailyViewEl) dailyViewEl.style.display = 'none';
            } else {
                if(weeklyViewEl) weeklyViewEl.style.display = 'none';
                if(dailyViewEl) dailyViewEl.style.display = 'block';
                renderDailyCards();
            }
            updateSessionBadge();
        });
    });

    // Auto-select Daily View on mobile, always show today
    if (window.innerWidth <= 768) {
        currentViewDate = new Date();
        localStorage.setItem('currentViewDate', currentViewDate.toISOString());
        toggleBtns.forEach(b => b.classList.remove('active'));
        const dailyBtn = document.querySelector('.toggle-btn[data-view="day"]');
        if (dailyBtn) dailyBtn.classList.add('active');
        if (weeklyViewEl) weeklyViewEl.style.display = 'none';
        if (dailyViewEl) dailyViewEl.style.display = 'block';
    }

    const prevDayBtn = document.getElementById('prev-day-btn');
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => {
            currentViewDate.setDate(currentViewDate.getDate() - 1);
            saveDateAndUpdate();
        });
    }

    const nextDayBtn = document.getElementById('next-day-btn');
    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => {
            currentViewDate.setDate(currentViewDate.getDate() + 1);
            saveDateAndUpdate();
        });
    }

    const GOOGLE_API_KEY = 'AIzaSyDXYSqwOaYfYbWHpZR-aeDHCVjq7oXsVbw';

    async function fetchCalendarEvents(calendarId, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
            `key=${GOOGLE_API_KEY}` +
            `&timeMin=${dayStart.toISOString()}` +
            `&timeMax=${dayEnd.toISOString()}` +
            `&singleEvents=true` +
            `&orderBy=startTime` +
            `&timeZone=Asia/Phnom_Penh`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn('Calendar API error:', res.status);
                return [];
            }
            const data = await res.json();
            return data.items || [];
        } catch (err) {
            console.warn('Failed to fetch calendar events:', err);
            return [];
        }
    }

    function formatTime(dateStr) {
        const d = new Date(dateStr);
        let h = d.getHours();
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${ampm}`;
    }

    async function renderDailyCards() {
        const dailySessionsEl = document.getElementById('daily-sessions');
        if (!dailySessionsEl) return;

        // Update Day Label first
        const dayLabelEl = document.getElementById('current-day-display');
        if (dayLabelEl) {
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            dayLabelEl.textContent = currentViewDate.toLocaleDateString('en-US', options);
        }

        const checkedRadio = document.querySelector('input[name="calendar-selection"]:checked');
        let color = '5C5CEE';
        let entityName = 'Select a calendar';
        let calendarId = null;

        if (checkedRadio) {
            const selectedId = checkedRadio.value;
            const isTeacher = checkedRadio.id.startsWith('t-');
            if (isTeacher) {
                const teacher = teachers.find(t => t.id === selectedId);
                if (teacher) { color = teacher.color; entityName = teacher.name; calendarId = teacher.calendarId; }
            } else {
                const cls = classes.find(c => c.id === selectedId);
                if (cls) { color = cls.color; entityName = cls.name; calendarId = cls.calendarId; }
            }
        }

        // Show loading state
        dailySessionsEl.innerHTML = `
            <div class="session-card" style="--card-accent: #${color}">
                <div class="session-card__accent"></div>
                <div class="session-card__body" style="text-align: center; padding: 32px 20px;">
                    <div class="session-card__title session-card__title--empty">
                        <i class="fas fa-spinner fa-spin" style="color: #${color}"></i> Loading schedule...
                    </div>
                </div>
            </div>
        `;

        // Fetch real events
        let events = [];
        if (calendarId) {
            events = await fetchCalendarEvents(calendarId, currentViewDate);
        }

        // Filter to only timed events (not all-day)
        const timedEvents = events.filter(ev => ev.start && ev.start.dateTime);

        // Render cards
        dailySessionsEl.innerHTML = '';

        if (timedEvents.length === 0) {
            // No events — show empty state
            dailySessionsEl.innerHTML = `
                <div class="session-card session-card--empty" style="--card-accent: #${color}">
                    <div class="session-card__accent"></div>
                    <div class="session-card__body" style="text-align: center; padding: 32px 20px;">
                        <div class="session-card__empty-icon">
                            <i class="far fa-calendar-times"></i>
                        </div>
                        <div class="session-card__title session-card__title--empty">No classes scheduled</div>
                        <div class="session-card__subtitle">${entityName} · ${currentViewDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    </div>
                </div>
            `;
            return;
        }

        timedEvents.forEach((ev, index) => {
            const title = ev.summary || 'Untitled Event';
            const startTime = formatTime(ev.start.dateTime);
            const endTime = ev.end && ev.end.dateTime ? formatTime(ev.end.dateTime) : '';
            const location = ev.location || '';

            // Calculate duration
            let durationText = '';
            if (ev.start.dateTime && ev.end && ev.end.dateTime) {
                const diffMs = new Date(ev.end.dateTime) - new Date(ev.start.dateTime);
                const diffMins = Math.round(diffMs / 60000);
                if (diffMins >= 60) {
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
                } else {
                    durationText = `${diffMins}m`;
                }
            }

            const card = document.createElement('div');
            card.className = 'session-card';
            card.style.setProperty('--card-accent', '#' + color);

            card.innerHTML = `
                <div class="session-card__accent"></div>
                <div class="session-card__body">
                    <div class="session-card__top">
                        <div class="session-card__number" style="background-color: #${color}; color: white;">${index + 1}</div>
                        <div class="session-card__meta">
                            <div class="session-card__title">${title}</div>
                            <div class="session-card__time">
                                <i class="far fa-clock"></i>
                                <span>${startTime}</span>
                                ${endTime ? `<span class="session-card__time-separator">→</span><span>${endTime}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="session-card__chips">
                        ${durationText ? `<span class="session-chip"><i class="fas fa-hourglass-half"></i> ${durationText}</span>` : ''}
                        <span class="session-chip"><i class="far fa-user"></i> ${entityName}</span>
                        ${location ? `<span class="session-chip"><i class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
                    </div>
                </div>
            `;
            dailySessionsEl.appendChild(card);
        });
    }

    function handleCollapsibles() {
        const isMobile = window.innerWidth <= 768;
        const trainersDetails = document.getElementById('trainers-details');
        const classesDetails = document.getElementById('classes-details');

        if (trainersDetails && classesDetails) {
            if (isMobile) {
                trainersDetails.removeAttribute('open');
                classesDetails.removeAttribute('open');
            } else {
                trainersDetails.setAttribute('open', '');
                classesDetails.setAttribute('open', '');
            }
        }
    }

    // --- SESSION COUNT BADGE ---
    async function updateSessionBadge() {
        const badgeEl = document.getElementById('session-count-badge');
        const hourBadgeEl = document.getElementById('hour-count-badge');
        if (!badgeEl || !hourBadgeEl) return;

        const checkedRadio = document.querySelector('input[name="calendar-selection"]:checked');
        if (!checkedRadio) {
            badgeEl.style.display = 'none';
            hourBadgeEl.style.display = 'none';
            return;
        }

        const selectedId = checkedRadio.value;
        const isTeacher = checkedRadio.id.startsWith('t-');
        let calendarId = null;
        let entityName = '';

        if (isTeacher) {
            const teacher = teachers.find(t => t.id === selectedId);
            if (teacher) {
                calendarId = teacher.calendarId;
                entityName = teacher.name;
            }
        } else {
            const cls = classes.find(c => c.id === selectedId);
            if (cls) {
                calendarId = cls.calendarId;
                entityName = cls.name;
            }
        }

        if (!calendarId) {
            badgeEl.style.display = 'none';
            hourBadgeEl.style.display = 'none';
            return;
        }

        // Determine if we're in daily or weekly view
        const isDailyView = window.innerWidth <= 768 &&
            document.querySelector('.toggle-btn[data-view="day"]')?.classList.contains('active');

        let timeMin, timeMax;

        if (isDailyView) {
            // Count for the current day
            timeMin = new Date(currentViewDate);
            timeMin.setHours(0, 0, 0, 0);
            timeMax = new Date(currentViewDate);
            timeMax.setHours(23, 59, 59, 999);
        } else {
            // Count for the current week (Sun–Sat)
            const weekStart = new Date(currentViewDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // Saturday
            weekEnd.setHours(23, 59, 59, 999);
            timeMin = weekStart;
            timeMax = weekEnd;
        }

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
            `key=${GOOGLE_API_KEY}` +
            `&timeMin=${timeMin.toISOString()}` +
            `&timeMax=${timeMax.toISOString()}` +
            `&singleEvents=true` +
            `&orderBy=startTime` +
            `&timeZone=Asia/Phnom_Penh`;

        try {
            const res = await fetch(url);
            if (!res.ok) { 
                badgeEl.style.display = 'none'; 
                hourBadgeEl.style.display = 'none'; 
                return; 
            }
            const data = await res.json();
            const timedEvents = (data.items || []).filter(ev => ev.start && ev.start.dateTime);
            const count = timedEvents.length;
            const hours = count * 1.5;

            const countEl = badgeEl.querySelector('.badge-count');
            const labelEl = badgeEl.querySelector('.badge-label');
            const hourCountEl = hourBadgeEl.querySelector('.badge-count');
            const hourLabelEl = hourBadgeEl.querySelector('.badge-label');

            if (countEl) countEl.textContent = isDailyView ? `${entityName} ${count}` : count;
            if (labelEl) labelEl.textContent = 'SESSIONS';

            if (hourCountEl) hourCountEl.textContent = hours;
            if (hourLabelEl) hourLabelEl.textContent = 'HOURS';

            if (isTeacher && count > 15) {
                const excessHours = hours - 22.5;
                if (hourCountEl) hourCountEl.textContent = `${hours} (+${excessHours})`;
                badgeEl.classList.add('session-badge--warning');
                hourBadgeEl.classList.add('session-badge--warning');
            } else {
                badgeEl.classList.remove('session-badge--warning');
                hourBadgeEl.classList.remove('session-badge--warning');
            }

            badgeEl.style.display = 'inline-flex';
            hourBadgeEl.style.display = 'inline-flex';

            // Pulse animation on update
            badgeEl.classList.remove('session-badge--updated');
            hourBadgeEl.classList.remove('session-badge--updated');
            void badgeEl.offsetWidth; // force reflow
            void hourBadgeEl.offsetWidth;
            badgeEl.classList.add('session-badge--updated');
            hourBadgeEl.classList.add('session-badge--updated');
        } catch (err) {
            console.warn('Badge fetch error:', err);
            badgeEl.style.display = 'none';
            hourBadgeEl.style.display = 'none';
        }
    }

    handleCollapsibles();
    window.addEventListener('resize', handleCollapsibles);

    initFilters();
    updateDateUI();
    updateIframeSource();
    renderDailyCards();
    updateSessionBadge();

    // --- IDLE SNOWFALL EFFECT ---
    let idleTimer = null;
    const IDLE_TIME = 5 * 60 * 1000; // 5 minutes
    // To test easily, you can temporarily change this to 5000 (5 seconds)
    let isSnowing = false;
    let lastStorageWrite = 0;

    function startSnow() {
        if (isSnowing) return;
        isSnowing = true;
        document.body.classList.add('winter-mode');
        createSnowflakes();
    }

    function stopSnow() {
        if (!isSnowing) return;
        isSnowing = false;
        document.body.classList.remove('winter-mode');
        const snowContainer = document.getElementById('snow-container');
        if (snowContainer) {
            snowContainer.innerHTML = '';
        }
    }

    function resetIdleTimer() {
        if (isSnowing) {
            // Fade out snow container slowly or just stop
            const snowContainer = document.getElementById('snow-container');
            if (snowContainer) {
                snowContainer.style.opacity = '0';
                setTimeout(stopSnow, 1000); // Wait for fade out
            } else {
                stopSnow();
            }
            // Reset schedule to current week/date when waking up after 5 minutes
            currentViewDate = new Date();
            saveDateAndUpdate();
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startSnow, IDLE_TIME);

        const currentTime = Date.now();
        if (currentTime - lastStorageWrite > 5000) {
            localStorage.setItem('lastActiveTime', currentTime.toString());
            lastStorageWrite = currentTime;
        }
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const lastActive = localStorage.getItem('lastActiveTime');
            const currentTime = Date.now();
            if (lastActive && (currentTime - parseInt(lastActive) > 5 * 60 * 1000)) {
                currentViewDate = new Date();
                saveDateAndUpdate();
            }
            resetIdleTimer();
        } else {
            localStorage.setItem('lastActiveTime', Date.now().toString());
        }
    });

    // Start timer initially
    resetIdleTimer();

    function createSnowflakes() {
        let container = document.getElementById('snow-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'snow-container';
            document.body.appendChild(container);
        }
        container.style.opacity = '1';
        
        const snowflakeCount = 60;
        const snowChars = ['❄', '❅', '❆'];
        
        for (let i = 0; i < snowflakeCount; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.textContent = snowChars[Math.floor(Math.random() * snowChars.length)];
            
            // Randomize styling
            flake.style.color = '#A5B4FC'; // Soft indigo/blue color to be visible on white
            flake.style.fontSize = `${Math.random() * 14 + 10}px`; // 10px to 24px
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.animationDuration = `${Math.random() * 6 + 5}s`; // 5s to 11s
            flake.style.animationDelay = `${Math.random() * 5}s`; // Stagger start times
            flake.style.opacity = Math.random() * 0.6 + 0.4; // 0.4 to 1.0 opacity
            
            container.appendChild(flake);
        }
    }
    // ═══════════════════════════════════════════════════════════
    // DASHBOARD — Full Firebase real-time integration
    // ═══════════════════════════════════════════════════════════
    const LEAVE_CALENDAR_ID = 'c_h8kqjtec9eis7v5kqp6e44uo4s@group.calendar.google.com';
    const DB_COLLECTION     = 'dashboard_cache';
    const CACHE_TTL_MS      = 60 * 60 * 1000; // 1 hour

    let workloadChart        = null;
    let currentDashboardData = null;
    let currentCacheKey      = null;
    let firestoreUnsubscribe = null;

    // ── Toast helper ──
    function showToast(message, type = 'info', duration = 4000) {
        const icons = { success: 'fa-check-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle' };
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    }

    // ── Firebase status badge ──
    function setFbStatus(state, text) {
        const badge = document.getElementById('fb-status-badge');
        if (!badge) return;
        badge.className = `fb-status-badge fb-${state}`;
        document.getElementById('fb-status-text').textContent = text;
    }

    // Initialise status
    if (firestoreDb) {
        setFbStatus('connected', 'Firebase connected');
    } else {
        setFbStatus('offline', 'Firebase offline');
    }

    // ── Default month picker values ──
    (function setDashDefaultDates() {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const f  = document.getElementById('dash-from-month');
        const t  = document.getElementById('dash-to-month');
        if (f) f.value = ym;
        if (t) t.value = ym;
    })();

    // ── Open / Close dashboard ──
    const openDashBtn = document.getElementById('open-dashboard-btn');
    if (openDashBtn) {
        openDashBtn.addEventListener('click', () => {
            const ov = document.getElementById('dashboard-overlay');
            if (ov) { ov.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
            if (analyticsApp) analyticsApp.logEvent('dashboard_opened');
            // Auto-load data immediately using the current month values
            loadDashboardData(false);
        });
    }

    function closeDashboard() {
        const ov = document.getElementById('dashboard-overlay');
        if (ov) { ov.style.display = 'none'; document.body.style.overflow = ''; }
        // Stop real-time listener when panel is closed
        if (firestoreUnsubscribe) { firestoreUnsubscribe(); firestoreUnsubscribe = null; }
    }

    const closeDashBtn = document.getElementById('close-dashboard-btn');
    if (closeDashBtn) closeDashBtn.addEventListener('click', closeDashboard);

    const dashOverlay = document.getElementById('dashboard-overlay');
    if (dashOverlay) dashOverlay.addEventListener('click', (e) => { if (e.target === dashOverlay) closeDashboard(); });

    // ── Print ──
    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', () => {
            if (!currentDashboardData) { showToast('Please load data first.', 'warning'); return; }
            window.print();
        });
    }

    // ── Load / Force-refresh buttons ──
    const loadDashBtn     = document.getElementById('load-dashboard-btn');
    const forceRefreshBtn = document.getElementById('force-refresh-btn');
    if (loadDashBtn)     loadDashBtn.addEventListener('click', () => loadDashboardData(false));
    if (forceRefreshBtn) forceRefreshBtn.addEventListener('click', () => loadDashboardData(true));

    // ── Role filter (re-render without re-fetch) ──
    const dashRoleFilter = document.getElementById('dash-role-filter');
    if (dashRoleFilter) {
        dashRoleFilter.addEventListener('change', () => {
            if (currentDashboardData) renderDashboardView();
        });
    }

    // ── Main data loader ──
    async function loadDashboardData(forceRefresh = false) {
        const fromVal = document.getElementById('dash-from-month').value;
        let   toVal   = document.getElementById('dash-to-month').value;
        if (!fromVal || !toVal) { showToast('Please select From and To months.', 'warning'); return; }
        if (fromVal > toVal) { toVal = fromVal; document.getElementById('dash-to-month').value = fromVal; }

        const fromDate = new Date(`${fromVal}-01T00:00:00`);
        const toBase   = new Date(`${toVal}-01T00:00:00`);
        const toDate   = new Date(toBase.getFullYear(), toBase.getMonth() + 1, 0, 23, 59, 59, 999);
        const cacheKey = `${fromVal}_${toVal}`;
        currentCacheKey = cacheKey;

        // Show spinner
        const body = document.getElementById('dashboard-body');
        if (body) {
            body.innerHTML = `
                <div class="dashboard-placeholder">
                    <i class="fas fa-spinner fa-spin" style="color:var(--primary-color);opacity:1;font-size:36px"></i>
                    <p>${forceRefresh ? 'Force-refreshing from Google Calendar…' : 'Loading data…'}</p>
                </div>`;
        }

        setFbStatus('connected', 'Loading…');

        // Stop any previous real-time listener
        if (firestoreUnsubscribe) { firestoreUnsubscribe(); firestoreUnsubscribe = null; }

        let data      = null;
        let fromCache = false;

        if (!forceRefresh) {
            data = await loadFromFirestore(cacheKey);
            fromCache = !!data;
        }

        if (!data) {
            // Fetch fresh from Google Calendar
            setFbStatus('connected', 'Fetching from Calendar…');
            data = await fetchAllTrainerData(fromDate, toDate);
            await saveToFirestore(cacheKey, data);
            showToast('Data fetched and saved to Firebase.', 'success');
            if (analyticsApp) analyticsApp.logEvent('dashboard_data_fetched', { from: fromVal, to: toVal });
        } else {
            showToast('Loaded from shared Firebase cache.', 'info');
        }

        currentDashboardData = data;
        renderDashboardView(fromCache);

        // Show Force Refresh button after first load
        if (forceRefreshBtn) forceRefreshBtn.style.display = 'inline-flex';

        // Start real-time listener so other users' refreshes update this view
        subscribeToLiveUpdates(cacheKey);
    }

    // ── Firestore real-time listener ──
    function subscribeToLiveUpdates(cacheKey) {
        if (!firestoreDb) return;
        setFbStatus('live', 'Live sync active');

        firestoreUnsubscribe = firestoreDb.collection(DB_COLLECTION).doc(cacheKey)
            .onSnapshot((doc) => {
                if (!doc.exists) return;
                const d = doc.data();
                if (!d || !d.data) return;

                const newDataStr = JSON.stringify(d.data);
                const curDataStr = JSON.stringify(currentDashboardData);

                if (newDataStr !== curDataStr) {
                    currentDashboardData = d.data;
                    renderDashboardView(true);
                    showToast('Dashboard updated with fresh data from another user.', 'info');
                }
            }, (err) => {
                console.warn('Firestore snapshot error:', err);
                setFbStatus('error', 'Sync error');
            });
    }

    function renderDashboardView(fromCache) {
        const roleFilter = document.getElementById('dash-role-filter').value;
        const fromVal    = document.getElementById('dash-from-month').value;
        const toVal      = document.getElementById('dash-to-month').value;
        renderDashboard(currentDashboardData, roleFilter, fromVal, toVal, fromCache);
    }

    // Tracks leave calendar state for display in the dashboard
    let _leaveCalTotal = 0;
    let _leaveCalOk    = true;

    // ── Fetch all trainer workload from Google Calendar ──
    async function fetchAllTrainerData(fromDate, toDate) {
        // Fetch leave calendar (all events — we'll match per trainer below)
        const leaveResult  = await fetchEventsInRangeDebug(LEAVE_CALENDAR_ID, fromDate, toDate);
        const leaveEvents  = leaveResult.items;
        _leaveCalOk        = leaveResult.ok;
        _leaveCalTotal     = leaveEvents.length;

        console.log(`[Leave Calendar] ${_leaveCalTotal} events · accessible: ${_leaveCalOk}`);
        if (leaveEvents.length) {
            console.table(leaveEvents.map(e => ({
                summary:   e.summary,
                date:      e.start.date || e.start.dateTime,
                organizer: e.organizer?.displayName || e.organizer?.email
            })));
        }

        const results = await Promise.all(teachers.map(async (trainer) => {
            const events   = await fetchEventsInRange(trainer.calendarId, fromDate, toDate);
            const timed    = events.filter(ev => ev.start && ev.start.dateTime);
            const sessions = timed.length;
            const hours    = timed.reduce((sum, ev) => {
                if (ev.end && ev.end.dateTime) {
                    return sum + (new Date(ev.end.dateTime) - new Date(ev.start.dateTime)) / 3600000;
                }
                return sum + 1.5;
            }, 0);
            const leaveDays = countLeaveDays(trainer.name, leaveEvents);
            return { id: trainer.id, name: trainer.name, role: trainer.role, color: trainer.color,
                     sessions, hours: Math.round(hours * 10) / 10, leaveDays };
        }));

        return results;
    }

    // Fetch with error tracking (used for leave calendar)
    async function fetchEventsInRangeDebug(calendarId, fromDate, toDate) {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
            `key=${GOOGLE_API_KEY}&timeMin=${fromDate.toISOString()}&timeMax=${toDate.toISOString()}` +
            `&singleEvents=true&maxResults=500&orderBy=startTime&timeZone=Asia/Phnom_Penh`;
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[Leave Calendar] HTTP ${res.status} — make sure the calendar is set to PUBLIC in Google Calendar settings.`);
                return { items: [], ok: false };
            }
            return { items: (await res.json()).items || [], ok: true };
        } catch (e) {
            console.warn('[Leave Calendar] Fetch error:', e);
            return { items: [], ok: false };
        }
    }

    async function fetchEventsInRange(calendarId, fromDate, toDate) {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
            `key=${GOOGLE_API_KEY}&timeMin=${fromDate.toISOString()}&timeMax=${toDate.toISOString()}` +
            `&singleEvents=true&maxResults=500&orderBy=startTime&timeZone=Asia/Phnom_Penh`;
        try {
            const res = await fetch(url);
            if (!res.ok) return [];
            return (await res.json()).items || [];
        } catch { return []; }
    }

    // Match a leave event to a trainer by searching across ALL event fields.
    // Checks: summary, description, organizer name/email, creator name/email, attendees.
    // Uses the trainer's first name for broader matching.
    function countLeaveDays(trainerName, leaveEvents) {
        const firstName = trainerName.toLowerCase().trim().split(/\s+/)[0];

        return leaveEvents.reduce((total, ev) => {
            // Build one string from every meaningful field
            const fields = [
                ev.summary        || '',
                ev.description    || '',
                (ev.organizer || {}).displayName || '',
                (ev.organizer || {}).email        || '',
                (ev.creator   || {}).displayName || '',
                (ev.creator   || {}).email        || '',
            ];
            if (Array.isArray(ev.attendees)) {
                ev.attendees.forEach(a => {
                    fields.push(a.displayName || '');
                    fields.push(a.email       || '');
                });
            }
            const combined = fields.join(' ').toLowerCase();

            if (!combined.includes(firstName)) return total;

            // All-day event: Google sets end.date to the day AFTER the last day
            if (ev.start && ev.start.date && ev.end && ev.end.date) {
                const days = Math.round((new Date(ev.end.date) - new Date(ev.start.date)) / 86400000);
                return total + Math.max(1, days);
            }
            // Timed event counts as 1 leave day
            return total + 1;
        }, 0);
    }

    // ── Firebase Firestore read/write ──
    async function saveToFirestore(key, data) {
        if (!firestoreDb) return;
        try {
            await firestoreDb.collection(DB_COLLECTION).doc(key).set({
                data,
                leaveTotal: _leaveCalTotal,   // persist so cache restores correctly
                leaveCalOk: _leaveCalOk,
                updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy:  navigator.userAgent.slice(0, 100),
                fromMonth:  key.split('_')[0],
                toMonth:    key.split('_')[1]
            });
            setFbStatus('live', 'Saved & syncing');
        } catch (e) {
            console.warn('Firestore write error:', e);
            setFbStatus('error', 'Write failed');
            showToast('Could not save to Firebase. Check Firestore rules.', 'error');
        }
    }

    async function loadFromFirestore(key) {
        if (!firestoreDb) return null;
        try {
            const doc = await firestoreDb.collection(DB_COLLECTION).doc(key).get();
            if (!doc.exists) return null;
            const d = doc.data();
            if (d.updatedAt && (Date.now() - d.updatedAt.toMillis() > CACHE_TTL_MS)) return null;
            // Old cache entries don't have leaveTotal — treat as expired to force a fresh fetch
            if (typeof d.leaveTotal !== 'number') return null;
            // Restore leave calendar state so the card shows the right number
            _leaveCalTotal = d.leaveTotal;
            _leaveCalOk    = d.leaveCalOk !== false;
            return d.data || null;
        } catch (e) {
            console.warn('Firestore read error:', e);
            return null;
        }
    }

    // ── Render Dashboard ──
    function renderDashboard(data, roleFilter, fromMonth, toMonth, fromCache) {
        const body = document.getElementById('dashboard-body');
        if (!body) return;

        const filtered      = roleFilter === 'all' ? data : data.filter(t => t.role === roleFilter);
        const totalSessions = filtered.reduce((s, t) => s + t.sessions, 0);
        const totalHours    = Math.round(filtered.reduce((s, t) => s + t.hours, 0) * 10) / 10;
        const totalLeave    = filtered.reduce((s, t) => s + t.leaveDays, 0);
        const activeCount   = filtered.filter(t => t.sessions > 0).length;
        const maxSessions   = Math.max(...filtered.map(t => t.sessions), 1);

        const from  = new Date(`${fromMonth}-01`);
        const toRaw = new Date(`${toMonth}-01`);
        const to    = new Date(toRaw.getFullYear(), toRaw.getMonth() + 1, 0);
        const weeks = Math.max(1, Math.ceil((to - from) / (7 * 24 * 3600 * 1000)));

        const cacheLabel = firestoreDb
            ? (fromCache ? 'From shared cache' : 'Saved to Firebase')
            : 'No Firebase';

        body.innerHTML = `
            <div class="dash-cache-info">
                <span><i class="fas fa-database" style="margin-right:6px;color:var(--primary-color)"></i>
                    <strong>${cacheLabel}</strong> &bull; Period: ${fromMonth} → ${toMonth} &bull; ~${weeks} week${weeks !== 1 ? 's' : ''}
                </span>
                <span style="color:#C8CDD8;font-size:11px">Generated ${new Date().toLocaleString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            </div>

            <div class="dash-stats-row">
                <div class="stat-card stat-card--primary">
                    <div class="stat-card__label">Total Sessions</div>
                    <div class="stat-card__value">${totalSessions}</div>
                    <div class="stat-card__sub">${roleFilter === 'all' ? 'All trainers' : roleFilter}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Teaching Hours</div>
                    <div class="stat-card__value">${totalHours}</div>
                    <div class="stat-card__sub">hours in period</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Leave Days</div>
                    <div class="stat-card__value">${_leaveCalTotal}</div>
                    <div class="stat-card__sub">${_leaveCalOk ? 'from leave calendar' : 'calendar not accessible'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__label">Active Trainers</div>
                    <div class="stat-card__value">${activeCount}</div>
                    <div class="stat-card__sub">with sessions</div>
                </div>
            </div>

            <div class="dash-chart-card">
                <div class="dash-card-title">
                    <i class="fas fa-chart-bar"></i> Sessions &amp; Hours by Trainer
                </div>
                <canvas id="workload-chart"></canvas>
            </div>

            <div class="dash-table-card">
                <div class="dash-card-title"><i class="fas fa-table"></i> Detailed Workload Breakdown</div>
                <div class="table-scroll-wrap">
                    <table class="workload-table">
                        <thead>
                            <tr>
                                <th>Trainer</th>
                                <th>Role</th>
                                <th>Sessions</th>
                                <th>Hours</th>
                                <th>Avg Hrs/Week</th>
                            </tr>
                        </thead>
                        <tbody id="workload-tbody"></tbody>
                    </table>
                </div>
            </div>

            <div class="dash-report-footer">
                Period: <strong>${fromMonth}</strong> → <strong>${toMonth}</strong> &bull;
                Report generated: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </div>
        `;

        renderWorkloadChart(filtered);

        const ROLE_COLORS = {
            'IT Trainer':      { bg: '#EEF2FF', fg: '#5C5CEE' },
            'IT Coor':         { bg: '#FEF3C7', fg: '#D97706' },
            'ENG/PL Trainer':  { bg: '#ECFDF5', fg: '#059669' },
            'ENG/PL Coor':     { bg: '#FFF7ED', fg: '#F97316' },
            'English Trainer': { bg: '#F0FDF4', fg: '#16A34A' },
            'PL Trainer':      { bg: '#F5F3FF', fg: '#8B5CF6' }
        };

        const tbody = document.getElementById('workload-tbody');
        filtered.forEach(t => {
            const rc      = ROLE_COLORS[t.role] || { bg: '#F3F4F6', fg: '#6B7280' };
            const avg     = Math.round((t.hours / weeks) * 10) / 10;
            const bar     = maxSessions > 0 ? Math.round((t.sessions / maxSessions) * 100) : 0;
            const over    = avg > 22.5;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="trainer-name-cell">
                    <span class="trainer-dot" style="background:#${t.color}"></span>${t.name}
                </div></td>
                <td><span class="role-tag" style="background:${rc.bg};color:${rc.fg}">${t.role}</span></td>
                <td>
                    <div class="sessions-bar-cell">
                        <span class="sessions-num">${t.sessions}</span>
                        <div class="bar-track"><div class="bar-fill" style="width:${bar}%;background:#${t.color}"></div></div>
                    </div>
                </td>
                <td class="hours-cell">${t.hours}h</td>
                <td class="${over ? 'overload-cell' : 'avg-cell'}">
                    ${avg}h/wk ${over ? '<i class="fas fa-exclamation-triangle" title="Exceeds 22.5h/wk limit"></i>' : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update Firebase badge after render
        if (firestoreDb) {
            setFbStatus('live', fromCache ? 'Cache loaded · Live sync' : 'Saved · Live sync');
        }
    }

    function renderWorkloadChart(data) {
        const canvas = document.getElementById('workload-chart');
        if (!canvas || typeof Chart === 'undefined') return;
        if (workloadChart) { workloadChart.destroy(); workloadChart = null; }

        // Inline plugin — draws value labels above each bar after the chart is fully drawn.
        // Uses afterDatasetsDraw so all bar positions are guaranteed to be calculated.
        const barLabelPlugin = {
            id: 'pncBarLabels',
            afterDatasetsDraw(chart) {
                const ctx2d = chart.ctx;
                chart.data.datasets.forEach((dataset, di) => {
                    const meta = chart.getDatasetMeta(di);
                    if (!meta || meta.hidden) return;
                    meta.data.forEach((bar, i) => {
                        const value = dataset.data[i];
                        if (value == null || value <= 0) return;
                        const text      = dataset.label === 'Hours' ? `${value}h` : `${value}`;
                        const color     = `#${data[i]?.color || '5C5CEE'}`;
                        const bgColor   = `${color}20`;

                        ctx2d.save();
                        ctx2d.font = '700 10px Inter, sans-serif';
                        const tw   = ctx2d.measureText(text).width;
                        const ph   = 4;   // horizontal padding
                        const pv   = 2;   // vertical padding
                        const bw   = tw + ph * 2;
                        const bh   = 13 + pv * 2;
                        const bx   = bar.x - bw / 2;
                        const by   = bar.y - bh - 3;

                        // Badge background (plain rect for max compatibility)
                        ctx2d.fillStyle = bgColor;
                        ctx2d.beginPath();
                        ctx2d.rect(bx, by, bw, bh);
                        ctx2d.fill();

                        // Value text
                        ctx2d.fillStyle    = color;
                        ctx2d.textAlign    = 'center';
                        ctx2d.textBaseline = 'middle';
                        ctx2d.fillText(text, bar.x, by + bh / 2);
                        ctx2d.restore();
                    });
                });
            }
        };

        workloadChart = new Chart(canvas, {
            type: 'bar',
            plugins: [barLabelPlugin],
            data: {
                labels: data.map(t => t.name),
                datasets: [
                    {
                        label: 'Sessions',
                        data: data.map(t => t.sessions),
                        backgroundColor: data.map(t => `#${t.color}`),
                        borderRadius: 6,
                        barPercentage: 0.5,
                        categoryPercentage: 0.75
                    },
                    {
                        label: 'Hours',
                        data: data.map(t => t.hours),
                        backgroundColor: data.map(t => `#${t.color}66`),
                        borderRadius: 6,
                        barPercentage: 0.5,
                        categoryPercentage: 0.75
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: { padding: { top: 28 } },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle' }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}${ctx.dataset.label === 'Hours' ? 'h' : ''}`
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 } } },
                    y: {
                        grid: { color: '#F3F4F6' },
                        ticks: { font: { family: 'Inter', size: 12 } },
                        beginAtZero: true,
                        grace: '25%'
                    }
                }
            }
        });
    }

});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
