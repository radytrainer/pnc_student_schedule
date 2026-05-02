document.addEventListener('DOMContentLoaded', function() {
    const iframeEl = document.getElementById('google-calendar-iframe');
    const teacherFiltersEl = document.getElementById('teacher-filters');
    const classFiltersEl = document.getElementById('class-filters');

    // Data from User
    const teachers = [
        { id: 'him', name: 'Him', calendarId: 'passerellesnumeriques.org_343437393530363136@resource.calendar.google.com', color: '5C5CEE' },
        { id: 'lavy', name: 'Lavy', calendarId: 'passerellesnumeriques.org_2d3331373838323735363330@resource.calendar.google.com', color: '10B981' },
        { id: 'mengheang', name: 'Mengheang', calendarId: 'c_1886h9lqonri4ig0noe2vrfvp8fb8@resource.calendar.google.com', color: 'F59E0B' },
        { id: 'rady', name: 'Rady', calendarId: 'passerellesnumeriques.org_2d3132393337373934393735@resource.calendar.google.com', color: 'EF4444' },
        { id: 'yon', name: 'Yon', calendarId: 'c_1882ckecmfgb0h7fmha0u9t3rbd5g@resource.calendar.google.com', color: '8B5CF6' },
        { id: 'savoeurn', name: 'Savoeurn', calendarId: 'passerellesnumeriques.org_3539373731343733353932@resource.calendar.google.com', color: 'EC4899' },
        { id: 'ouchi', name: 'Ouchi', calendarId: 'c_188b20cg9s5uoh12jobk987cfbh2g@resource.calendar.google.com', color: '06B6D4' },
        { id: 'sokhom', name: 'Sokhom', calendarId: 'passerellesnumeriques.org_2d3633393338303431343434@resource.calendar.google.com', color: 'F97316' },
        { id: 'sreyleap', name: 'Sreyleap', calendarId: 'c_1884lpdesdih0irbl36ss1j7vt7aq@resource.calendar.google.com', color: '14B8A6' },
        { id: 'puthy', name: 'Puthy', calendarId: 'passerellesnumeriques.org_3733323437383733383932@resource.calendar.google.com', color: '6366F1' },
        { id: 'mesa', name: 'Mesa', calendarId: 'c_1885a09ufiueqj6hn3tv09m5ngs5c@resource.calendar.google.com', color: '3B82F6' }
    ];

    const classes = [
        { id: 'y2a', name: 'Y2-A', calendarId: 'c_4641706806a2bc464ecfce3054fce93b2ebd72161c407d074ba961f730e4d793@group.calendar.google.com', color: '4F46E5' },
        { id: 'y2b', name: 'Y2-B', calendarId: 'c_60f24913a85bf20e950e70146ff604d69d14749a316da204fa485e7d6731a12b@group.calendar.google.com', color: '059669' },
        { id: 'y2c', name: 'Y2-C', calendarId: 'c_2da1c687af3c99d3ecaf14bbc5d82b9cc9b0fc75dcca546fd690ea5070091940@group.calendar.google.com', color: 'D97706' },
        { id: 'y1a', name: 'Y1-A', calendarId: 'c_dab09f6598d565f82430eaa5c51ab4b01045bb20a340a7273f4a67a911c6f61c@group.calendar.google.com', color: 'DC2626' },
        { id: 'y1b', name: 'Y1-B', calendarId: 'c_2e32feb66be240456f961cc2f43c0bbef9c5ff6cbb68abdea333adf1739f9833@group.calendar.google.com', color: '7C3AED' },
        { id: 'y1c', name: 'Y1-C', calendarId: 'c_4f19b4ea9a24523bb7910e4d19bb0f426abdfc3e2b67850a4d5770e4755674db@group.calendar.google.com', color: 'DB2777' },
        { id: 'y1d', name: 'Y1-D', calendarId: 'c_60360764ac056113deb843d3bc1a8dd6e66a0bbddcf4dbd1ff4ea3453417dc3e@group.calendar.google.com', color: '0891B2' }
    ];

    // Date Management
    let currentViewDate = new Date();
    const savedDateStr = localStorage.getItem('currentViewDate');
    if (savedDateStr) {
        currentViewDate = new Date(savedDateStr);
    }

    function getWeekNumber(d) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
        return Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
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
                    <span class="color-dot" style="background-color: #${teacher.color}"></span>
                    ${teacher.name}
                </label>
            `;
            teacherFiltersEl.appendChild(div);
            if (isChecked) isFirst = false;
        });

        classes.forEach(cls => {
            const isChecked = savedId === cls.id;
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="radio" name="calendar-selection" id="c-${cls.id}" value="${cls.id}" ${isChecked ? 'checked' : ''}>
                <label for="c-${cls.id}" style="--item-color: #${cls.color};">
                    <span class="color-dot" style="background-color: #${cls.color}"></span>
                    ${cls.name}
                </label>
            `;
            classFiltersEl.appendChild(div);
        });

        // Add event listeners to radio buttons
        document.querySelectorAll('input[name="calendar-selection"]').forEach(rb => {
            rb.addEventListener('change', function() {
                localStorage.setItem('selectedCalendarId', this.value);
                updateIframeSource();
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

    initFilters();
    updateDateUI();
    updateIframeSource();
});
