function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#48bb78' : '#667eea'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function navigateToSection(sectionName) {
    const mainContent = document.querySelector('.main-content');
    
 
    const sectionMap = {
        'Дашборд': 'dashboard',
        'Задачи': 'tasks',
        'Календарь': 'calendar',
        'Статистика': 'statistics',
        'Семья': 'family',
        'Настройки': 'settings',
        'Отчёты': 'reports'
    };
    
    const sectionKey = sectionMap[sectionName] || sectionName.toLowerCase();
    
    switch(sectionKey) {
        case 'dashboard':
            showDashboard();
            break;
        case 'tasks':
            showTasksPage();
            break;
        case 'calendar':
            showCalendarPage();
            break;
        case 'statistics':
            showStatisticsPage();
            break;
        case 'family':
            showFamilyPage();
            break;
        case 'settings':
            showSettingsPage();
            break;
        case 'reports':
            showReportsPage();
            break;
    }
}

function showDashboard() {
    const mainContent = document.querySelector('.main-content');
    const pageContent = mainContent.querySelector('.page-content');
    if (pageContent) {
        pageContent.remove();
    }
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        dashboardContent.style.display = 'block';
    }
    reinitializeTaskListeners();
    checkNotificationSettings();
    applyChildRestrictions();
}

function showTasksPage() {
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const tasksPageHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Все задачи</h2>
                <div class="header-actions">
                    <button class="btn-primary" onclick="showNewTaskModal()">+ Новая задача</button>
                </div>
            </header>
            
            <section class="tasks-section">
                <div class="section-header">
                    <h3>Фильтр по статусу</h3>
                    <div class="tabs">
                        <button class="tab active" onclick="filterTasksByStatus('all')">Все</button>
                        <button class="tab" onclick="filterTasksByStatus('active')">Активные</button>
                        <button class="tab" onclick="filterTasksByStatus('completed')">Выполненные</button>
                    </div>
                </div>
                
                <div class="categories-grid" id="tasksGrid">
                    ${generateAllTasksGrid()}
                </div>
            </section>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', tasksPageHTML);
    reinitializeTaskListeners();
    applyChildRestrictions();
}

let currentCalendarDate = new Date();

function showCalendarPage() {
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const calendarHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Календарь</h2>
                <p class="subtitle">Планируйте задачи на будущее</p>
            </header>
            
            <section class="calendar-section">
                <div class="calendar-header">
                    <button class="btn-icon" onclick="previousMonth()">◀</button>
                    <h3 id="currentMonth">${getMonthYearString(currentCalendarDate)}</h3>
                    <button class="btn-icon" onclick="nextMonth()">▶</button>
                </div>
                
                <div class="calendar-grid" id="calendarGrid">
                    <div class="calendar-day-name">Пн</div>
                    <div class="calendar-day-name">Вт</div>
                    <div class="calendar-day-name">Ср</div>
                    <div class="calendar-day-name">Чт</div>
                    <div class="calendar-day-name">Пт</div>
                    <div class="calendar-day-name">Сб</div>
                    <div class="calendar-day-name">Вс</div>
                    ${generateCalendarDays()}
                </div>
            </section>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', calendarHTML);
    applyChildRestrictions();
}



function showSettingsPage() {
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyName = currentUser.familyName || currentUser.name || 'Семья';
    const isParent = currentUser.role === 'parent' || !currentUser.role;
    
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    const isNotificationsChecked = notificationsEnabled === null ? true : notificationsEnabled === 'true';
    
    const settingsHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Настройки</h2>
                <p class="subtitle">Персонализация приложения</p>
            </header>
            
            <section class="settings-section">
                <div class="settings-group">
                    <h3>Общие настройки</h3>
                    <div class="setting-item">
                        <label>
                            <span>Уведомления</span>
                            <input type="checkbox" class="toggle" ${isNotificationsChecked ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <span>Светлая тема</span>
                            <input type="checkbox" class="toggle" id="themeToggle" ${localStorage.getItem('lightTheme') === 'true' ? 'checked' : ''} onchange="toggleTheme(this)">
                        </label>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Семья</h3>
                    <div class="setting-item">
                        <label>
                            <span>Название семьи</span>
                            <input type="text" id="familyNameInput" value="${familyName}" class="setting-input" ${isParent ? 'readonly' : 'disabled'} style="background: #f7fafc; cursor: not-allowed; color: #718096;">
                        </label>
                        <small style="color: #718096; font-size: 12px; margin-top: 4px; display: block;">Название семьи устанавливается при регистрации и не может быть изменено</small>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Цели и награды</h3>
                    <div class="setting-item">
                        <label>
                            <span>Недельная цель задач</span>
                            <input type="number" value="50" class="setting-input" min="1" max="100" id="weeklyGoalInput">
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <span>Цель по очкам</span>
                            <input type="number" value="1000" class="setting-input" min="1" max="10000" id="pointsGoalInput">
                        </label>
                    </div>
                </div>
                
                <button class="btn-primary" onclick="saveSettings()">Сохранить настройки</button>
            </section>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', settingsHTML);
}

function saveSettings() {
    const notificationToggle = document.querySelector('.settings-section .toggle');
    if (notificationToggle) {
        const notificationsEnabled = notificationToggle.checked;
        localStorage.setItem('notificationsEnabled', notificationsEnabled);
        updateNotificationsVisibility(notificationsEnabled);
    }
    
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');
    if (weeklyGoalInput) {
        let value = parseInt(weeklyGoalInput.value);
        if (value > 100) {
            weeklyGoalInput.value = 100;
            showNotification('Недельная цель не может быть больше 100', 'info');
            return;
        }
        if (value < 1) {
            weeklyGoalInput.value = 1;
            showNotification('Недельная цель должна быть минимум 1', 'info');
            return;
        }
    }

    const pointsGoalInput = document.getElementById('pointsGoalInput');
    if (pointsGoalInput) {
        let value = parseInt(pointsGoalInput.value);
        if (value > 10000) {
            pointsGoalInput.value = 10000;
            showNotification('Цель по очкам не может быть больше 10000', 'info');
            return;
        }
        if (value < 1) {
            pointsGoalInput.value = 1;
            showNotification('Цель по очкам должна быть минимум 1', 'info');
            return;
        }
    }
    
    showNotification('Настройки успешно сохранены!', 'success');
}

function updateNotificationsVisibility(enabled) {
    const notificationsSection = document.querySelector('.notifications-section');
    if (notificationsSection) {
        notificationsSection.style.display = enabled ? 'block' : 'none';
    }
}

function checkNotificationSettings() {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled');
    const isEnabled = notificationsEnabled === null ? true : notificationsEnabled === 'true';
    updateNotificationsVisibility(isEnabled);
}

function updateNotifications() {
    checkNotificationSettings();
}

function clearMainContent() {
    const existingContent = document.querySelector('.page-content');
    if (existingContent) {
        existingContent.remove();
    }
}

function hideDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }
}

function setupCurrentSection() {

}

function applyChildRestrictions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'child') {
        const addTaskBtn = document.querySelector('.btn-primary');
        if (addTaskBtn && addTaskBtn.textContent.includes('Новая задача')) {
            addTaskBtn.style.display = 'none';
        }
        
        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        const deleteButtons = document.querySelectorAll('.task-delete');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        const familyNavItem = document.querySelector('.nav-item[onclick*="showFamilyPage"]');
        if (familyNavItem) {
            familyNavItem.style.display = 'none';
        }
        
        const reportsNavItem = document.querySelector('.nav-item[onclick*="showReportsPage"]');
        if (reportsNavItem) {
            reportsNavItem.style.display = 'none';
        }
        
        const settingsNavItem = document.querySelector('.nav-item:has(span:contains("Настройки"))');
        if (!settingsNavItem) {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                const span = item.querySelector('span');
                if (span && span.textContent.trim() === 'Настройки') {
                    item.style.display = 'none';
                }
            });
        } else {
            settingsNavItem.style.display = 'none';
        }
    }
}

function toggleTheme(checkbox) {
    if (checkbox.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('lightTheme', 'true');
        showNotification('Светлая тема включена', 'success');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('lightTheme', 'false');
        showNotification('Тёмная тема включена', 'success');
    }
}

function initTheme() {
    if (localStorage.getItem('lightTheme') === 'true') {
        document.body.classList.add('light-theme');
    }
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'width 0.8s ease';
            bar.style.width = bar.style.width || '0%';
        }, index * 100);
    });
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    updateCalendarDisplay();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    updateCalendarDisplay();
}

function updateCalendarDisplay() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    calendarGrid.innerHTML = dayNames.map(day => 
        `<div class="calendar-day-name">${day}</div>`
    ).join('') + generateCalendarDays();
    
    const currentMonth = document.getElementById('currentMonth');
    if (currentMonth) {
        currentMonth.textContent = getMonthYearString(currentCalendarDate);
    }
}

function generateCalendarDays() {
    const days = [];
    const today = new Date();
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayMonday = firstDay === 0 ? 7 : firstDay;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    for (let i = firstDayMonday - 1; i > 0; i--) {
        const day = prevMonthLastDate - i + 1;
        days.push(`<div class="calendar-day other-month">${day}</div>`);
    }
    
    for (let day = 1; day <= lastDate; day++) {
        const isToday = (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year);
        const tasksCount = getTasksForDate(year, month, day).length;
        days.push(`
            <div class="calendar-day${isToday ? ' today' : ''}${tasksCount > 0 ? ' has-tasks' : ''}" onclick="selectDate(this, ${year}, ${month}, ${day})">
                ${day}
                ${tasksCount > 0 ? `<span class="task-dot"></span>` : ''}
            </div>
        `);
    }
    
    const totalCells = days.length + 7;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let i = 1; i <= remainingCells; i++) {
        days.push(`<div class="calendar-day other-month">${i}</div>`);
    }
    
    return days.join('');
}

function getMonthYearString(date) {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getTasksForDate(year, month, day) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const calendarTasks = JSON.parse(localStorage.getItem(`calendarTasks_${familyKey}`) || '{}');
    
    const dateKey = `${year}-${month + 1}-${day}`;
    return calendarTasks[dateKey] || [];
}

function selectDate(element, year, month, day) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    element.classList.add('selected');
    showDateTasksModal(year, month, day);
}

function showDateTasksModal(year, month, day) {
    const tasks = getTasksForDate(year, month, day);
    const familyMembers = getFamilyMembers();
    
    const modalHTML = `
        <div class="modal-overlay" onclick="closeDateTasksModal()">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Задачи на ${day}.${month + 1}.${year}</h3>
                    <button class="close-modal" onclick="closeDateTasksModal()">✕</button>
                </div>
                <div class="modal-body">
                    ${tasks.length === 0 ? '<p>Нет задач на эту дату</p>' : ''}
                    ${tasks.map((task, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e2e8f0;">
                            <div>
                                <strong>${task.name || task}</strong>
                                ${task.assignee ? `<br><small>Ответственный: ${task.assignee}</small>` : ''}
                                ${task.time ? `<br><small>Период: ${task.time}</small>` : ''}
                            </div>
                            <button class="btn-secondary" onclick="deleteCalendarTask(${year}, ${month}, ${day}, ${index})">Удалить</button>
                        </div>
                    `).join('')}
                    
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 10px;">Добавить новую задачу</h4>
                        <input type="text" id="newCalendarTask" placeholder="Название задачи..." class="modal-input">
                        
                        <select id="newCalendarTaskMember" class="modal-select">
                            <option value="">Выберите члена семьи</option>
                            ${familyMembers.map(member => `<option value="${member.name}">${member.name}</option>`).join('')}
                        </select>
                        
                        <select id="newCalendarTaskTime" class="modal-select">
                            <option value="">Выберите период</option>
                            <option value="день">День</option>
                            <option value="неделя">Неделя</option>
                            <option value="месяц">Месяц</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeDateTasksModal()">Закрыть</button>
                    <button class="btn-primary" onclick="addTaskToDate(${year}, ${month}, ${day})">Добавить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeDateTasksModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function addTaskToDate(year, month, day) {
    const input = document.getElementById('newCalendarTask');
    const memberSelect = document.getElementById('newCalendarTaskMember');
    const timeInput = document.getElementById('newCalendarTaskTime');
    
    const taskText = input.value.trim();
    const assignee = memberSelect.value;
    const time = timeInput.value;
    
    if (!taskText) {
        showNotification('Введите название задачи', 'info');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const calendarTasks = JSON.parse(localStorage.getItem(`calendarTasks_${familyKey}`) || '{}');
    
    const dateKey = `${year}-${month + 1}-${day}`;
    if (!calendarTasks[dateKey]) {
        calendarTasks[dateKey] = [];
    }
    
    const task = {
        name: taskText,
        assignee: assignee,
        time: time,
        createdAt: new Date().toISOString()
    };
    
    calendarTasks[dateKey].push(task);
    
    localStorage.setItem(`calendarTasks_${familyKey}`, JSON.stringify(calendarTasks));
    
    closeDateTasksModal();
    updateCalendarDisplay();
    showNotification('Задача добавлена!', 'success');
}

function deleteCalendarTask(year, month, day, index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const calendarTasks = JSON.parse(localStorage.getItem(`calendarTasks_${familyKey}`) || '{}');
    
    const dateKey = `${year}-${month + 1}-${day}`;
    if (calendarTasks[dateKey]) {
        calendarTasks[dateKey].splice(index, 1);
        if (calendarTasks[dateKey].length === 0) {
            delete calendarTasks[dateKey];
        }
        localStorage.setItem(`calendarTasks_${familyKey}`, JSON.stringify(calendarTasks));
    }
    
    closeDateTasksModal();
    updateCalendarDisplay();
    showNotification('Задача удалена!', 'success');
}

function updateWeekRange() {
    const weekRangeElement = document.getElementById('weekRange');
    if (!weekRangeElement) return;
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    
    const mondayDay = monday.getDate();
    const sundayDay = sunday.getDate();
    const mondayMonth = months[monday.getMonth()];
    const sundayMonth = months[sunday.getMonth()];
    
    if (monday.getMonth() === sunday.getMonth()) {
        weekRangeElement.textContent = `${mondayDay} – ${sundayDay} ${mondayMonth}`;
    } else {
        weekRangeElement.textContent = `${mondayDay} ${mondayMonth} – ${sundayDay} ${sundayMonth}`;
    }
}

function updateDashboardSubtitle(tasks) {
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        const completedTasks = tasks.filter(t => t.isChecked).length;
        subtitle.textContent = `${completedTasks} из ${tasks.length} задач выполнено`;
    }
}

function updateNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const tasks = getSavedTasks();
    const members = getFamilyMembers();
    
    const notifications = [];
    

    const pendingTasks = tasks.filter(t => t.isChecked && !t.isConfirmed);
    pendingTasks.forEach(task => {
        notifications.push({
            text: `${task.assignee} выполнил задачу "${task.name}"`,
            time: 'Только что',
            type: 'pending'
        });
    });
    

    const today = new Date().toDateString();
    const confirmedToday = tasks.filter(t => t.isConfirmed);
    confirmedToday.slice(0, 3).forEach(task => {
        notifications.push({
            text: `${task.assignee} получил +10 очков за "${task.name}"`,
            time: 'Сегодня',
            type: 'success'
        });
    });
    
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p style="color: #000; padding: 20px; text-align: center;">Нет новых уведомлений</p>';
        return;
    }
    
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.type}">
            <p style="color: #000; margin: 0;">${notif.text}</p>
            <span class="notification-time" style="color: #000; font-size: 12px; opacity: 0.7;">${notif.time}</span>
        </div>
    `).join('');
}

function saveTaskToCalendar(taskData) {

    console.log('Save task to calendar:', taskData);
}


window.showNotification = showNotification;
window.navigateToSection = navigateToSection;
window.showDashboard = showDashboard;
window.showTasksPage = showTasksPage;
window.showCalendarPage = showCalendarPage;
window.showSettingsPage = showSettingsPage;
window.saveSettings = saveSettings;
window.updateNotificationsVisibility = updateNotificationsVisibility;
window.updateNotifications = updateNotifications;
window.checkNotificationSettings = checkNotificationSettings;
window.clearMainContent = clearMainContent;
window.hideDashboard = hideDashboard;
window.setupCurrentSection = setupCurrentSection;
window.animateProgressBars = animateProgressBars;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.updateCalendarDisplay = updateCalendarDisplay;
window.generateCalendarDays = generateCalendarDays;
window.getMonthYearString = getMonthYearString;
window.getTasksForDate = getTasksForDate;
window.saveTaskToCalendar = saveTaskToCalendar;
window.selectDate = selectDate;
window.showDateTasksModal = showDateTasksModal;
window.closeDateTasksModal = closeDateTasksModal;
window.addTaskToDate = addTaskToDate;
window.deleteCalendarTask = deleteCalendarTask;
window.updateWeekRange = updateWeekRange;
window.updateDashboardSubtitle = updateDashboardSubtitle;
window.updateNotifications = updateNotifications;

window.currentCalendarDate = currentCalendarDate;
