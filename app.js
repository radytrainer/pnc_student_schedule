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
        { id: 'y2a', name: 'Y2-A', room: 'B12', calendarId: 'c_4641706806a2bc464ecfce3054fce93b2ebd72161c407d074ba961f730e4d793@group.calendar.google.com', color: '4F46E5' },
        { id: 'y2b', name: 'Y2-B', room: 'B13', calendarId: 'c_60f24913a85bf20e950e70146ff604d69d14749a316da204fa485e7d6731a12b@group.calendar.google.com', color: '059669' },
        { id: 'y2c', name: 'Y2-C', room: 'B22', calendarId: 'c_2da1c687af3c99d3ecaf14bbc5d82b9cc9b0fc75dcca546fd690ea5070091940@group.calendar.google.com', color: 'D97706' },
        { id: 'y1a', name: 'Y1-A', room: 'A22', calendarId: 'c_dab09f6598d565f82430eaa5c51ab4b01045bb20a340a7273f4a67a911c6f61c@group.calendar.google.com', color: 'DC2626' },
        { id: 'y1b', name: 'Y1-B', room: 'A21', calendarId: 'c_2e32feb66be240456f961cc2f43c0bbef9c5ff6cbb68abdea333adf1739f9833@group.calendar.google.com', color: '7C3AED' },
        { id: 'y1c', name: 'Y1-C', room: 'B23', calendarId: 'c_4f19b4ea9a24523bb7910e4d19bb0f426abdfc3e2b67850a4d5770e4755674db@group.calendar.google.com', color: 'DB2777' },
        { id: 'y1d', name: 'Y1-D', room: 'B31', calendarId: 'c_60360764ac056113deb843d3bc1a8dd6e66a0bbddcf4dbd1ff4ea3453417dc3e@group.calendar.google.com', color: '0891B2' }
    ];

    // Date Management
    let currentViewDate = new Date();
    const savedDateStr = localStorage.getItem('currentViewDate');
    if (savedDateStr) {
        currentViewDate = new Date(savedDateStr);
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
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startSnow, IDLE_TIME);
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
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
