function showStatisticsPage() {
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const statsHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Статистика</h2>
                <p class="subtitle">Анализ продуктивности семьи</p>
                <div class="header-actions">
                    <select class="period-selector" id="periodSelector" onchange="updateStatisticsPeriod()">
                        <option value="today">Сегодня</option>
                        <option value="yesterday">Вчера</option>
                        <option value="week" selected>Эта неделя</option>
                        <option value="lastWeek">Прошлая неделя</option>
                        <option value="month">Этот месяц</option>
                        <option value="lastMonth">Прошлый месяц</option>
                        <option value="custom">Выбрать период</option>
                    </select>
                </div>
            </header>
            
            <div id="statsContent">
                ${generateStatsContent('week')}
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', statsHTML);
}

function generateStatsContent(period) {
    const stats = getStatisticsForPeriod(period);
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon purple">■</div>
                <h3>Всего задач</h3>
                <p class="stat-number">${stats.totalTasks}</p>
                <span class="stat-trend ${stats.tasksChange >= 0 ? 'up' : 'down'}">${stats.tasksChange > 0 ? '+' : ''}${stats.tasksChange}% к предыдущему</span>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon green">✅</div>
                <h3>Выполнено</h3>
                <p class="stat-number">${stats.completedTasks}</p>
                <span class="stat-trend ${stats.completionChange >= 0 ? 'up' : 'down'}">${stats.completionChange > 0 ? '+' : ''}${stats.completionChange}% к предыдущему</span>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon orange">●</div>
                <h3>В процессе</h3>
                <p class="stat-number">${stats.activeTasks}</p>
                <span class="stat-trend ${stats.activeChange >= 0 ? 'down' : 'up'}">${stats.activeChange > 0 ? '+' : ''}${stats.activeChange}% к предыдущему</span>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon blue">🏆</div>
                <h3>Очков заработано</h3>
                <p class="stat-number">${stats.points}</p>
                <span class="stat-trend ${stats.pointsChange >= 0 ? 'up' : 'down'}">${stats.pointsChange > 0 ? '+' : ''}${stats.pointsChange}% к предыдущему</span>
            </div>
        </div>
        
        <section class="charts-section">
            <div class="section-header">
                <h3>${getChartTitle(period)}</h3>
            </div>
            <div class="chart-placeholder">
                ${generateChartForPeriod(period, stats)}
            </div>
        </section>
        
        <section class="charts-section">
            <div class="section-header">
                <h3>Статистика по членам семьи</h3>
            </div>
            <div class="family-stats-list">
                ${generateFamilyStatsList(period)}
            </div>
        </section>
    `;
}

function updateStatisticsPeriod() {
    const period = document.getElementById('periodSelector').value;
    
    if (period === 'custom') {
        showCustomPeriodModal();
        return;
    }
    
    const statsContent = document.getElementById('statsContent');
    if (statsContent) {
        statsContent.innerHTML = generateStatsContent(period);
    }
}

function getStatisticsForPeriod(period) {
    const tasks = getSavedTasks();
    const members = getFamilyMembers();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isChecked).length;
    const activeTasks = totalTasks - completedTasks;
    const points = members.reduce((sum, member) => sum + (member.points || 0), 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const tasksChange = totalTasks > 0 ? Math.round((Math.random() - 0.3) * 30) : 0;
    const completionChange = completedTasks > 0 ? Math.round((Math.random() - 0.2) * 25) : 0;
    const activeChange = activeTasks > 0 ? Math.round((Math.random() - 0.4) * 40) : 0;
    const pointsChange = points > 0 ? Math.round((Math.random() - 0.1) * 20) : 0;
    
    return {
        totalTasks,
        completedTasks,
        activeTasks,
        points,
        completionRate,
        tasksChange,
        completionChange,
        activeChange,
        pointsChange
    };
}

function getChartTitle(period) {
    const titles = {
        today: 'Активность за сегодня (по часам)',
        yesterday: 'Активность за вчера (по часам)',
        week: 'Активность по дням недели',
        lastWeek: 'Активность прошлой недели',
        month: 'Активность по неделям месяца',
        lastMonth: 'Активность прошлого месяца'
    };
    
    return titles[period] || 'Активность';
}

function generateChartForPeriod(period, stats) {
    if (period === 'today' || period === 'yesterday') {
        return generateHourlyChart(period);
    } else if (period === 'week' || period === 'lastWeek') {
        return generateWeeklyChart(period);
    } else if (period === 'month' || period === 'lastMonth') {
        return generateMonthlyChart(period);
    }
    return generateWeeklyChart('week');
}

function generateHourlyChart(period) {
    const hours = ['9:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
    const values = period === 'today' 
        ? [2, 3, 1, 2, 4, 3, 2]
        : [3, 4, 2, 3, 5, 4, 3];
    const maxValue = Math.max(...values);
    
    return `
        <div class="bar-chart">
            ${hours.map((hour, index) => `
                <div class="bar-item">
                    <div class="bar" style="height: ${(values[index] / maxValue) * 100}%">
                        <span class="bar-value">${values[index]}</span>
                    </div>
                    <span class="bar-label">${hour}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateWeeklyChart(period) {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const values = period === 'lastWeek'
        ? [10, 13, 8, 16, 12, 7, 9]
        : [12, 15, 10, 18, 14, 8, 11];
    const maxValue = Math.max(...values);
    
    return `
        <div class="bar-chart">
            ${days.map((day, index) => `
                <div class="bar-item">
                    <div class="bar" style="height: ${(values[index] / maxValue) * 100}%">
                        <span class="bar-value">${values[index]}</span>
                    </div>
                    <span class="bar-label">${day}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateMonthlyChart(period) {
    const weeks = ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'];
    const values = period === 'lastMonth'
        ? [28, 32, 25, 30]
        : [35, 38, 42, 40];
    const maxValue = Math.max(...values);
    
    return `
        <div class="bar-chart">
            ${weeks.map((week, index) => `
                <div class="bar-item">
                    <div class="bar" style="height: ${(values[index] / maxValue) * 100}%">
                        <span class="bar-value">${values[index]}</span>
                    </div>
                    <span class="bar-label">${week}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateFamilyStatsList(period) {
    const members = getFamilyMembers();
    const periodStats = {
        today: { 'Алексей': { tasks: 3, completed: 2, points: 20 }, 'Мария': { tasks: 3, completed: 2, points: 20 }, 'Саша': { tasks: 2, completed: 1, points: 10 } },
        yesterday: { 'Алексей': { tasks: 4, completed: 3, points: 30 }, 'Мария': { tasks: 4, completed: 3, points: 30 }, 'Саша': { tasks: 2, completed: 2, points: 20 } },
        week: { 'Алексей': { tasks: 15, completed: 12, points: 120 }, 'Мария': { tasks: 16, completed: 14, points: 140 }, 'Саша': { tasks: 14, completed: 6, points: 60 } },
        lastWeek: { 'Алексей': { tasks: 14, completed: 11, points: 110 }, 'Мария': { tasks: 15, completed: 13, points: 130 }, 'Саша': { tasks: 11, completed: 6, points: 60 } },
        month: { 'Алексей': { tasks: 60, completed: 45, points: 450 }, 'Мария': { tasks: 65, completed: 50, points: 500 }, 'Саша': { tasks: 55, completed: 40, points: 400 } },
        lastMonth: { 'Алексей': { tasks: 50, completed: 38, points: 380 }, 'Мария': { tasks: 55, completed: 42, points: 420 }, 'Саша': { tasks: 45, completed: 35, points: 350 } }
    };
    
    const stats = periodStats[period] || periodStats.week;
    
    return members.map(member => {
        const memberStats = stats[member.name] || { tasks: 0, completed: 0, points: 0 };
        const completionRate = memberStats.tasks > 0 
            ? Math.round((memberStats.completed / memberStats.tasks) * 100)
            : 0;
        
        const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
        
        return `
            <div class="family-stat-item">
                <img src="${avatarSrc}" alt="${member.name}" class="family-stat-avatar">
                <div class="family-stat-info">
                    <h4>${member.name}</h4>
                    <p class="family-stat-role">${member.role}</p>
                </div>
                <div class="family-stat-metrics">
                    <div class="family-stat-metric">
                        <span class="metric-label">Задач</span>
                        <span class="metric-value">${memberStats.completed}/${memberStats.tasks}</span>
                    </div>
                    <div class="family-stat-metric">
                        <span class="metric-label">Выполнение</span>
                        <span class="metric-value ${member.color}">${completionRate}%</span>
                    </div>
                    <div class="family-stat-metric">
                        <span class="metric-label">Очки</span>
                        <span class="metric-value ${member.color}">${memberStats.points}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showCustomPeriodModal() {
    const modalHTML = `
        <div class="modal-overlay" id="customPeriodModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Выбрать период</h3>
                    <button class="close-modal" onclick="closeCustomPeriodModal()">✕</button>
                </div>
                <div class="modal-body">
                    <label for="startDate" style="font-size: 14px; font-weight: 600; margin-bottom: 5px; display: block;">Начальная дата:</label>
                    <input type="date" class="modal-input" id="startDate" max="${new Date().toISOString().split('T')[0]}">
                    
                    <label for="endDate" style="font-size: 14px; font-weight: 600; margin-bottom: 5px; display: block;">Конечная дата:</label>
                    <input type="date" class="modal-input" id="endDate" max="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeCustomPeriodModal()">Отмена</button>
                    <button class="btn-primary" onclick="applyCustomPeriod()">Применить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCustomPeriodModal() {
    const modal = document.getElementById('customPeriodModal');
    if (modal) {
        modal.remove();
    }
    document.getElementById('periodSelector').value = 'week';
}

function applyCustomPeriod() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Пожалуйста, выберите обе даты', 'info');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showNotification('Начальная дата не может быть позже конечной', 'info');
        return;
    }
    
    closeCustomPeriodModal();
    
    const statsContent = document.getElementById('statsContent');
    if (statsContent) {
        statsContent.innerHTML = generateStatsContent('week');
        showNotification(`Статистика с ${startDate} по ${endDate}`, 'info');
    }
}

function updateDashboardMetrics(totalTasks, completedTasks, inProgressTasks, totalPoints) {
    const totalTasksElement = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (totalTasksElement) {
        const oldValue = parseInt(totalTasksElement.textContent);
        totalTasksElement.textContent = totalTasks;
        
        if (!isNaN(oldValue) && oldValue !== totalTasks) {
            totalTasksElement.style.animation = 'none';
            setTimeout(() => {
                totalTasksElement.style.animation = 'pulse 0.5s ease';
            }, 10);
        }
    }
    
    const completedElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (completedElement) {
        completedElement.textContent = completedTasks;
        completedElement.style.animation = 'none';
        setTimeout(() => {
            completedElement.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
    
    const inProgressElement = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (inProgressElement) {
        inProgressElement.textContent = inProgressTasks;
        inProgressElement.style.animation = 'none';
        setTimeout(() => {
            inProgressElement.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
    
    const pointsElement = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (pointsElement) {
        pointsElement.textContent = totalPoints;
        pointsElement.style.animation = 'none';
        setTimeout(() => {
            pointsElement.style.animation = 'pulse 0.5s ease';
        }, 10);
    }
}

function updateActivityChart() {
    const tasks = getSavedTasks();
    const today = new Date();
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dailyStats = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayKey = date.toLocaleDateString('ru-RU');
        const dayName = daysOfWeek[date.getDay()];
        dailyStats[dayKey] = { count: 0, dayName };
    }
    
    tasks.forEach(task => {
        if (task.isChecked) {
            const taskDate = new Date().toLocaleDateString('ru-RU');
            if (dailyStats[taskDate]) {
                dailyStats[taskDate].count++;
            }
        }
    });
    
    const chartBars = document.querySelectorAll('.chart-bar');
    const statsArray = Object.values(dailyStats);
    const maxCount = Math.max(...statsArray.map(s => s.count), 1);
    
    chartBars.forEach((bar, index) => {
        if (statsArray[index]) {
            const percentage = (statsArray[index].count / maxCount) * 100;
            bar.style.height = `${percentage}%`;
            bar.setAttribute('title', `${statsArray[index].dayName}: ${statsArray[index].count} задач`);
        }
    });
}

function updateWeeklyGoals(completedTasks) {
    const taskGoal = document.querySelector('.goal-item:nth-child(1)');
    if (taskGoal) {
        const goalValue = 50;
        const percentage = Math.min((completedTasks / goalValue) * 100, 100);
        const progressBar = taskGoal.querySelector('.progress-fill');
        const progressText = taskGoal.querySelector('.goal-progress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${completedTasks}/${goalValue}`;
        }
    }
    
    const pointsGoal = document.querySelector('.goal-item:nth-child(2)');
    if (pointsGoal) {
        const totalPoints = completedTasks * 10;
        const goalValue = 1000;
        const percentage = Math.min((totalPoints / goalValue) * 100, 100);
        const progressBar = pointsGoal.querySelector('.progress-fill');
        const progressText = pointsGoal.querySelector('.goal-progress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${totalPoints}/${goalValue}`;
        }
    }
    
    const daysGoal = document.querySelector('.goal-item:nth-child(3)');
    if (daysGoal) {
        const currentDay = new Date().getDay();
        const daysActive = currentDay === 0 ? 7 : currentDay;
        const percentage = Math.min((daysActive / 7) * 100, 100);
        const progressBar = daysGoal.querySelector('.progress-fill');
        const progressText = daysGoal.querySelector('.goal-progress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${daysActive}/7`;
        }
    }
}

function updateTaskProgress() {
    const tasks = getSavedTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isChecked).length;
    const confirmedTasks = tasks.filter(t => t.isConfirmed).length;
    const activeTasks = totalTasks - completedTasks;
    const inProgressTasks = tasks.filter(t => t.isChecked && !t.isConfirmed).length;
    
    const totalPoints = confirmedTasks * 10;
    
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = `Сегодня у вас ${activeTasks} активных задач`;
    }

    updateDashboardMetrics(totalTasks, completedTasks, inProgressTasks, totalPoints);
    updateFamilyStats();
    updateWeeklyGoals(confirmedTasks);
    updateActivityChart();
}

function updateFamilyStats() {
    const tasks = getSavedTasks();
    const familyMembers = getFamilyMembers();
    
    familyMembers.forEach(member => {
        const memberTasks = tasks.filter(t => t.assignee === member.name);
        const completedTasks = memberTasks.filter(t => t.isConfirmed).length;
        const totalTasks = memberTasks.length;
        const points = completedTasks * 10;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const memberCards = document.querySelectorAll('.member-stats-card');
        memberCards.forEach(card => {
            const nameElement = card.querySelector('.member-name, h4');
            if (nameElement && nameElement.textContent === member.name) {
                const tasksElement = card.querySelector('.stat-item:nth-child(1) .stat-value, .stat-value:nth-of-type(1)');
                if (tasksElement) {
                    tasksElement.textContent = `${completedTasks}/${totalTasks}`;
                }
                
                const completionElement = card.querySelector('.stat-item:nth-child(2) .stat-value, .stat-value:nth-of-type(2)');
                if (completionElement) {
                    completionElement.textContent = `${completionRate}%`;
                }
                
                const pointsElement = card.querySelector('.stat-item:nth-child(3) .stat-value, .stat-value:nth-of-type(3)');
                if (pointsElement) {
                    pointsElement.textContent = points;
                }
            }
        });
    });
}


window.showStatisticsPage = showStatisticsPage;
window.generateStatsContent = generateStatsContent;
window.updateStatisticsPeriod = updateStatisticsPeriod;
window.getStatisticsForPeriod = getStatisticsForPeriod;
window.getChartTitle = getChartTitle;
window.generateChartForPeriod = generateChartForPeriod;
window.generateHourlyChart = generateHourlyChart;
window.generateWeeklyChart = generateWeeklyChart;
window.generateMonthlyChart = generateMonthlyChart;
window.generateFamilyStatsList = generateFamilyStatsList;
window.showCustomPeriodModal = showCustomPeriodModal;
window.closeCustomPeriodModal = closeCustomPeriodModal;
window.applyCustomPeriod = applyCustomPeriod;
window.updateDashboardMetrics = updateDashboardMetrics;
window.updateActivityChart = updateActivityChart;
window.updateWeeklyGoals = updateWeeklyGoals;
window.updateTaskProgress = updateTaskProgress;
window.updateFamilyStats = updateFamilyStats;
