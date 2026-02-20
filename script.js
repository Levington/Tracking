
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        showMainApp(userData);
        return true;
    } else {
        showAuthModal();
        return false;
    }
}

function showAuthModal() {
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';

    if (typeof initParticles === 'function') {
        initParticles();
    }
}

function hideAuthModal() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';

    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        }
    }
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function handleRoleChange() {
    const roleSelect = document.getElementById('registerRole');
    if (!roleSelect) return;
    
    const role = roleSelect.value;
    const parentFields = document.getElementById('parentFields');
    const childFields = document.getElementById('childFields');
    
    if (!parentFields || !childFields) return;
    
    if (role === 'parent') {
        parentFields.style.display = 'block';
        childFields.style.display = 'none';
    } else {
        parentFields.style.display = 'none';
        childFields.style.display = 'block';
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showMainApp(data.user);
            showNotification(`Добро пожаловать, ${data.user.familyName}!`, 'success');
        } else {
            showNotification(data.message || 'Неверный email или пароль', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка подключения к серверу', 'info');
    });
}

function handleRegister() {
    const roleSelect = document.getElementById('registerRole');
    const role = roleSelect ? roleSelect.value : 'parent';
    
    if (role === 'parent') {
        registerParent();
    } else {
        registerChild();
    }
}

function registerParent() {
    const familyName = document.getElementById('registerFamilyName').value;
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!familyName || !name || !email || !password || !passwordConfirm) {
        showNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'info');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'info');
        return;
    }
    

    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ familyName, name, email, password, role: 'parent' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showMainApp(data.user);
            showNotification(`Добро пожаловать, ${data.user.name}!`, 'success');
        } else {
            showNotification(data.message || 'Ошибка регистрации', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка подключения к серверу', 'info');
    });
}

function registerChild() {
    const name = document.getElementById('registerChildName').value;
    const parentEmail = document.getElementById('registerParentEmail').value;
    const email = document.getElementById('registerChildEmail').value;
    const password = document.getElementById('registerChildPassword').value;
    const passwordConfirm = document.getElementById('registerChildPasswordConfirm').value;
    
    if (!name || !parentEmail || !email || !password || !passwordConfirm) {
        showNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'info');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'info');
        return;
    }
    

    fetch('http://localhost:3000/api/register-child', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, parentEmail, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showMainApp(data.user);
            showNotification(`Добро пожаловать, ${data.user.name}!`, 'success');
        } else {
            showNotification(data.message || 'Ошибка регистрации', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка подключения к серверу', 'info');
    });
}

function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        showAuthModal();
        showNotification('Вы вышли из системы', 'info');
    }
}

function showMainApp(userData) {
    hideAuthModal();
    document.getElementById('familyNameDisplay').textContent = userData.familyName || userData.name || 'Семья';
    

    if (userData.role) {
        applyRoleRestrictions(userData.role);
    }
    

    if (userData.id) {
        loadFamilyMembersFromDB(userData.id);
        loadTasksFromDB(userData.id);
    }
    
 
    setTimeout(() => {
        updateDashboardMembers();
        checkNotificationSettings();
    }, 500);
    

    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    

    const familyNameInput = document.getElementById('registerFamilyName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
    const nameInput = document.getElementById('registerName');
    const childNameInput = document.getElementById('registerChildName');
    const parentEmailInput = document.getElementById('registerParentEmail');
    const childEmailInput = document.getElementById('registerChildEmail');
    const childPasswordInput = document.getElementById('registerChildPassword');
    const childPasswordConfirmInput = document.getElementById('registerChildPasswordConfirm');
    
    if (familyNameInput) familyNameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (passwordConfirmInput) passwordConfirmInput.value = '';
    if (nameInput) nameInput.value = '';
    if (childNameInput) childNameInput.value = '';
    if (parentEmailInput) parentEmailInput.value = '';
    if (childEmailInput) childEmailInput.value = '';
    if (childPasswordInput) childPasswordInput.value = '';
    if (childPasswordConfirmInput) childPasswordConfirmInput.value = '';
}


function applyRoleRestrictions(role) {
    if (!role) return;
    
    const isChild = role === 'child';
    
    if (isChild) {

        setTimeout(() => {

            document.querySelectorAll('.btn-primary, .btn-icon, [onclick*="add"], [onclick*="Add"], [onclick*="show"][onclick*="Modal"]').forEach(btn => {
                if (!btn.classList.contains('btn-logout')) {
                    btn.style.display = 'none';
                }
            });
            

            document.querySelectorAll('[onclick*="edit"], [onclick*="Edit"], [onclick*="delete"], [onclick*="Delete"], .delete-task-btn, .edit-btn, .delete-btn').forEach(btn => {
                btn.style.display = 'none';
            });
            

            document.querySelectorAll('.setting-input').forEach(input => {
                input.setAttribute('readonly', true);
                input.style.cursor = 'not-allowed';
            });
            

            document.querySelectorAll('.toggle').forEach(toggle => {
                toggle.setAttribute('disabled', true);
                toggle.style.cursor = 'not-allowed';
            });
            

            document.querySelectorAll('[onclick*="save"], [onclick*="Save"]').forEach(btn => {
                btn.style.display = 'none';
            });
        }, 100);
        

        setTimeout(() => showNotification('Вы вошли как ребёнок. Режим просмотра', 'info'), 500);
    } else {

        setTimeout(() => {
            document.querySelectorAll('.btn-primary, .btn-icon').forEach(btn => {
                if (btn.style.display === 'none') {
                    btn.style.display = '';
                }
            });
        }, 100);
    }
}


function loadFamilyMembersFromDB(userId) {
    console.log('🔍 Loading family members for userId:', userId);
    fetch(`http://localhost:3000/api/family-members/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('📥 Received members from DB:', data);
            if (data.success && data.members.length > 0) {

                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const familyKey = currentUser.familyName || currentUser.email || 'default';
                console.log('🔑 Family key:', familyKey);
                localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify(data.members));
                console.log('✅ Загружено членов семьи из БД:', data.members.length);
            } else {
                console.log('⚠️ No members found in database');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки членов семьи:', error);
        });
}


function loadTasksFromDB(userId) {
    console.log('🔍 Loading tasks for userId:', userId);
    fetch(`http://localhost:3000/api/tasks/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('📥 Received tasks from DB:', data);
            if (data.success && data.tasks.length > 0) {

                const tasks = data.tasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    category: task.category,
                    assignee: task.assignee,
                    period: task.period,
                    isChecked: task.is_checked,
                    isConfirmed: task.is_confirmed || false,
                    confirmedBy: task.confirmed_by || null
                }));
                

                saveTasks(tasks);
                console.log('✅ Загружено задач из БД:', tasks.length);
                

                loadSavedTasks();
            } else {
                console.log('⚠️ No tasks found in database');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки задач:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {

    if (!checkAuth()) {
        return; 
    }

    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.classList.add('checked');
                updateTaskProgress();
            } else {
                taskItem.classList.remove('checked');
                updateTaskProgress();
            }
            
            saveDefaultTasksState();
        });
    });


    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterTasks(this.textContent.trim());
        });
    });

 
    const newTaskBtn = document.querySelector('.btn-primary');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', function() {
            showNewTaskModal();
        });
    }

 
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            

            const sectionName = this.querySelector('span:not(.nav-icon)').textContent.trim();
            navigateToSection(sectionName);
        });
    });

 
    initializeCustomAvatars();
    loadSavedTasks();
    updateTaskProgress();
    animateProgressBars();
    setupCurrentSection();
    updateDashboardAvatars();
    updateWeekRange();
    showReportsMenuForParent();
});

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

function updateDashboardMetrics(totalTasks, completedTasks, inProgressTasks, totalPoints) {

    const totalTasksElement = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (totalTasksElement) {
        const prevValue = parseInt(totalTasksElement.textContent) || 0;
        totalTasksElement.textContent = totalTasks;
        

        const percentageElement = totalTasksElement.parentElement.querySelector('.metric-change');
        if (percentageElement) {
            const percentChange = prevValue > 0 ? Math.round(((totalTasks - prevValue) / prevValue) * 100) : 0;
            percentageElement.textContent = `${percentChange >= 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% к предыдущему`;
            percentageElement.className = `metric-change ${percentChange >= 0 ? 'green' : 'red'}`;
        }
    }
    

    const completedElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (completedElement) {
        const prevValue = parseInt(completedElement.textContent) || 0;
        completedElement.textContent = completedTasks;
        
        const percentageElement = completedElement.parentElement.querySelector('.metric-change');
        if (percentageElement) {
            const percentChange = prevValue > 0 ? Math.round(((completedTasks - prevValue) / prevValue) * 100) : 0;
            percentageElement.textContent = `${percentChange >= 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% к предыдущему`;
            percentageElement.className = `metric-change ${percentChange >= 0 ? 'green' : 'red'}`;
        }
    }
    

    const inProgressElement = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (inProgressElement) {
        const prevValue = parseInt(inProgressElement.textContent) || 0;
        inProgressElement.textContent = inProgressTasks;
        
        const percentageElement = inProgressElement.parentElement.querySelector('.metric-change');
        if (percentageElement) {
            const percentChange = prevValue > 0 ? Math.round(((inProgressTasks - prevValue) / prevValue) * 100) : 0;
            percentageElement.textContent = `${percentChange >= 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% к предыдущему`;
            percentageElement.className = `metric-change ${percentChange >= 0 ? 'green' : 'red'}`;
        }
    }
    

    const pointsElement = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (pointsElement) {
        const prevValue = parseInt(pointsElement.textContent) || 0;
        pointsElement.textContent = totalPoints;
        
        const percentageElement = pointsElement.parentElement.querySelector('.metric-change');
        if (percentageElement) {
            const percentChange = prevValue > 0 ? Math.round(((totalPoints - prevValue) / prevValue) * 100) : 0;
            percentageElement.textContent = `${percentChange >= 0 ? '↑' : '↓'} ${Math.abs(percentChange)}% к предыдущему`;
            percentageElement.className = `metric-change ${percentChange >= 0 ? 'green' : 'red'}`;
        }
    }
}

function updateActivityChart() {
    const tasks = getSavedTasks();
    const today = new Date();
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dailyStats = {};
    

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = date.toDateString();
        dailyStats[dayKey] = {
            day: daysOfWeek[date.getDay()],
            count: 0
        };
    }
    

    tasks.forEach(task => {
        if (task.isConfirmed) {

            const randomDay = Math.floor(Math.random() * 7);
            const date = new Date(today);
            date.setDate(date.getDate() - randomDay);
            const dayKey = date.toDateString();
            if (dailyStats[dayKey]) {
                dailyStats[dayKey].count++;
            }
        }
    });
    

    const chartBars = document.querySelectorAll('.chart-bar');
    const statsArray = Object.values(dailyStats);
    const maxCount = Math.max(...statsArray.map(s => s.count), 1);
    
    chartBars.forEach((bar, index) => {
        if (statsArray[index]) {
            const height = (statsArray[index].count / maxCount) * 100;
            const fill = bar.querySelector('.bar-fill');
            const value = bar.querySelector('.bar-value');
            const label = bar.querySelector('.bar-label');
            
            if (fill) fill.style.height = `${height}%`;
            if (value) value.textContent = statsArray[index].count;
            if (label) label.textContent = statsArray[index].day;
        }
    });
}

function updateFamilyStats() {
    const tasks = getSavedTasks();
    const familyMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');
    
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

function updateWeeklyGoals(completedTasks) {

    const taskGoal = document.querySelector('.goal-item:nth-child(1)');
    if (taskGoal) {
        const taskProgress = taskGoal.querySelector('.goal-progress');
        const taskFill = taskGoal.querySelector('.progress-fill');
        const maxTasks = 50;
        const validCompletedTasks = Math.min(Math.max(0, completedTasks), maxTasks);
        const percentage = (validCompletedTasks / maxTasks) * 100;
        
        taskProgress.textContent = `${validCompletedTasks}/${maxTasks}`;
        taskFill.style.width = `${percentage}%`;
    }
    

    const pointsGoal = document.querySelector('.goal-item:nth-child(2)');
    if (pointsGoal) {
        const pointsProgress = pointsGoal.querySelector('.goal-progress');
        const pointsFill = pointsGoal.querySelector('.progress-fill');
        const maxPoints = 1000;
        const earnedPoints = Math.min(Math.max(0, completedTasks * 10), maxPoints);
        const percentage = (earnedPoints / maxPoints) * 100;
        
        pointsProgress.textContent = `${earnedPoints}/${maxPoints}`;
        pointsFill.style.width = `${percentage}%`;
    }
    

    const daysGoal = document.querySelector('.goal-item:nth-child(3)');
    if (daysGoal) {
        const daysProgress = daysGoal.querySelector('.goal-progress');
        const daysFill = daysGoal.querySelector('.progress-fill');
        const maxDays = 7;

        const activeDays = Math.min(Math.max(0, completedTasks > 0 ? 1 : 0), maxDays);
        const percentage = (activeDays / maxDays) * 100;
        
        daysProgress.textContent = `${activeDays}/${maxDays}`;
        daysFill.style.width = `${percentage}%`;
    }
}

function filterTasks(filter) {

    const taskItems = document.querySelectorAll('.task-item');
    let visibleCount = 0;
    
    taskItems.forEach(task => {
        const period = task.getAttribute('data-period');
        let shouldShow = false;
        
        switch(filter) {
            case 'Все':
                shouldShow = true;
                break;
            case 'Сегодня':
                shouldShow = period === 'today';
                break;
            case 'На неделе':
                shouldShow = period === 'week' || period === 'today';
                break;
        }
        
        if (shouldShow) {
            task.style.display = 'flex';
            visibleCount++;
        } else {
            task.style.display = 'none';
        }
    });
    

    updateCategoryCardsVisibility();
    

    const filterMessages = {
        'Все': `Показано ${visibleCount} задач`,
        'Сегодня': `Задач на сегодня: ${visibleCount}`,
        'На неделе': `Задач на неделю: ${visibleCount}`
    };
    
    showNotification(filterMessages[filter], 'info');
}

function updateCategoryCardsVisibility() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const visibleTasks = card.querySelectorAll('.task-item[style*="display: flex"], .task-item:not([style*="display: none"])');
        const tasksList = card.querySelector('.tasks-list');
        const allTasksHidden = tasksList && Array.from(tasksList.children).every(task => 
            task.style.display === 'none'
        );
        
        if (allTasksHidden) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
        }
        

        const taskCountElement = card.querySelector('.task-count');
        if (taskCountElement) {
            const visibleTasksCount = Array.from(tasksList.children).filter(task => 
                task.style.display !== 'none'
            ).length;
            const taskWord = visibleTasksCount === 1 ? 'задача' : visibleTasksCount < 5 ? 'задачи' : 'задач';
            taskCountElement.textContent = `${visibleTasksCount} ${taskWord}`;
        }
    });
}

function showNewTaskModal() {

    const members = getFamilyMembers();
    const memberOptions = members.map(member => 
        `<option value="${member.name}">${member.name}</option>`
    ).join('');
    

    const modalHTML = `
        <div class="modal-overlay" id="taskModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Новая задача</h3>
                    <button class="close-modal" onclick="closeTaskModal()">✕</button>
                </div>
                <div class="modal-body">
                    <input type="text" class="modal-input" placeholder="Название задачи" id="taskName">
                    <select class="modal-select" id="taskCategory">
                        <option value="">Выберите категорию</option>
                        <option value="cleaning">Уборка</option>
                        <option value="cooking">Готовка</option>
                        <option value="shopping">Покупки</option>
                        <option value="kids">Дети</option>
                        <option value="pets">Питомцы</option>
                        <option value="finance">Финансы</option>
                    </select>
                    <select class="modal-select" id="taskAssignee">
                        <option value="">Назначить на</option>
                        ${memberOptions}
                    </select>
                    <select class="modal-select" id="taskTime">
                        <option value="">Время на выполнение</option>
                        <option value="день">День</option>
                        <option value="неделя">Неделя</option>
                        <option value="месяц">Месяц</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeTaskModal()">Отмена</button>
                    <button class="btn-primary" onclick="createTask()">Создать</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.remove();
    }
}

function createTask() {
    const taskName = document.getElementById('taskName').value;
    const taskCategory = document.getElementById('taskCategory').value;
    const taskAssignee = document.getElementById('taskAssignee').value;
    const taskTime = document.getElementById('taskTime').value;
    
    if (!taskName || !taskCategory || !taskAssignee) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    

    addTaskToCategory(taskName, taskCategory, taskAssignee, taskTime);
    

    saveTaskToStorage(taskName, taskCategory, taskAssignee, taskTime, false);

    closeTaskModal();
    

    showNotification('Задача успешно создана!', 'success');

    updateTaskProgress();
}

function addTaskToCategory(taskName, category, assignee, period = 'день', isChecked = false, isConfirmed = false, taskId = null) {
    const categoryMap = {
        'cleaning': 'Уборка',
        'cooking': 'Готовка',
        'shopping': 'Покупки',
        'kids': 'Дети',
        'pets': 'Питомцы',
        'finance': 'Финансы'
    };
    
    const periodMap = {
        'день': 'today',
        'неделя': 'week',
        'месяц': 'week'
    };
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isParent = currentUser.role === 'parent' || !currentUser.role;
    
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
        const categoryName = card.querySelector('h4').textContent;
        if (categoryName === categoryMap[category]) {
            const tasksList = card.querySelector('.tasks-list');
            const avatarSrc = getAvatarForMember(assignee);
            const dataPeriod = periodMap[period] || 'today';
            

            const checkedClass = isChecked ? 'checked' : '';
            const checkedAttr = isChecked ? 'checked' : '';
            
            const pendingClass = (isChecked && !isConfirmed) ? 'pending-confirmation' : '';
            const confirmedClass = isConfirmed ? 'confirmed' : '';
            

            const confirmButton = (isParent && isChecked && !isConfirmed) 
                ? `<button class="btn-confirm-task" data-task-name="${taskName}" data-category="${category}" data-task-id="${taskId || ''}" title="Подтвердить выполнение">✓</button>` 
                : '';
            

            const pendingLabel = (isParent && isChecked && !isConfirmed)
                ? `<span class="pending-label">Ожидает подтверждения</span>`
                : '';
            
            const taskHTML = `
                <label class="task-item ${checkedClass} ${pendingClass} ${confirmedClass}" data-period="${dataPeriod}" data-task-name="${taskName}" data-category="${category}" data-task-id="${taskId || ''}" data-is-confirmed="${isConfirmed}">
                    <input type="checkbox" ${checkedAttr} ${isConfirmed ? 'disabled' : ''}>
                    <span>${taskName}</span>
                    ${pendingLabel}
                    <img src="${avatarSrc}" alt="${assignee}" class="task-avatar">
                    ${confirmButton}
                </label>
            `;
            
            tasksList.insertAdjacentHTML('beforeend', taskHTML);

            const newConfirmBtn = tasksList.lastElementChild.querySelector('.btn-confirm-task');
            if (newConfirmBtn) {
                newConfirmBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const taskName = this.getAttribute('data-task-name');
                    const category = this.getAttribute('data-category');
                    const taskId = this.getAttribute('data-task-id');
                    confirmTask(taskName, category, taskId || null);
                });
            }
            

            const taskCount = card.querySelector('.task-count');
            const currentCount = tasksList.querySelectorAll('.task-item').length;
            taskCount.textContent = `${currentCount} задач${currentCount === 1 ? 'а' : currentCount < 5 ? 'и' : ''}`;
            

            const newCheckbox = tasksList.lastElementChild.querySelector('input[type="checkbox"]');
            if (!isConfirmed && newCheckbox) {
                newCheckbox.addEventListener('change', function() {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    const isChild = currentUser.role === 'child';
                    
                    console.log('Checkbox change:', { 
                        isChild, 
                        assignee, 
                        currentUserName: currentUser.name,
                        match: assignee === currentUser.name 
                    });

                    if (isChild && assignee !== currentUser.name) {
                        this.checked = !this.checked; 
                        showNotification('Вы можете отмечать только свои задачи', 'info');
                        return;
                    }
                    
                    const taskItem = this.closest('.task-item');
                    if (this.checked) {
                        taskItem.classList.add('checked');
                        if (isChild) {
                            taskItem.classList.add('pending-confirmation');
                        }
                    } else {
                        taskItem.classList.remove('checked');
                        taskItem.classList.remove('pending-confirmation');
                        taskItem.classList.remove('confirmed');
                    }
                    updateTaskProgress();
                    updateTaskInStorage(taskName, category, this.checked);
                });
            }
        }
    });
}

function getAvatarForMember(name) {

    if (window.customAvatars && window.customAvatars[name]) {
        return window.customAvatars[name];
    }
    

    const members = getFamilyMembers();
    const member = members.find(m => m.name === name);
    if (member) {
        return (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
    }
    

    const avatarMap = {
        'Алексей': 'https://i.pravatar.cc/150?img=33',
        'Мария': 'https://i.pravatar.cc/150?img=45',
        'София': 'https://i.pravatar.cc/150?img=15',
        'Даниил': 'https://i.pravatar.cc/150?img=12'
    };
    return avatarMap[name] || 'https://i.pravatar.cc/150?img=1';
}


function saveTaskToStorage(taskName, category, assignee, period, isChecked) {
    const tasks = getSavedTasks();
    const newTask = {
        name: taskName,
        category: category,
        assignee: assignee,
        period: period,
        isChecked: isChecked,
        isConfirmed: false,
        confirmedBy: null,
        id: Date.now()
    };
    tasks.push(newTask);
    saveTasks(tasks);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id) {
        fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                name: taskName,
                category: category,
                assignee: assignee,
                period: period,
                isChecked: isChecked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Задача сохранена в БД');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка сохранения задачи в БД:', error);
        });
    }
}

function getSavedTasks() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const tasks = localStorage.getItem(`familyHubTasks_${familyKey}`);
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    localStorage.setItem(`familyHubTasks_${familyKey}`, JSON.stringify(tasks));
}

function loadSavedTasks() {

    document.querySelectorAll('.tasks-list').forEach(list => {
        list.innerHTML = '';
    });
    
    const tasks = getSavedTasks();
    tasks.forEach(task => {
        addTaskToCategory(
            task.name, 
            task.category, 
            task.assignee, 
            task.period, 
            task.isChecked, 
            task.isConfirmed || false,
            task.id || null
        );
    });
    

    updateAllTaskCounts();
    

    reinitializeTaskListeners();
}

function updateAllTaskCounts() {
    document.querySelectorAll('.category-card').forEach(card => {
        const tasksList = card.querySelector('.tasks-list');
        const taskCount = tasksList ? tasksList.querySelectorAll('.task-item').length : 0;
        const taskCountElement = card.querySelector('.task-count');
        
        if (taskCountElement) {
            const taskWord = taskCount === 1 ? 'задача' : taskCount < 5 ? 'задачи' : 'задач';
            taskCountElement.textContent = `${taskCount} ${taskWord}`;
        }
    });
}

function updateTaskInStorage(taskName, category, isChecked) {
    const tasks = getSavedTasks();
    const taskIndex = tasks.findIndex(t => t.name === taskName && t.category === category);
    if (taskIndex !== -1) {
        tasks[taskIndex].isChecked = isChecked;
        

        if (!isChecked) {
            tasks[taskIndex].isConfirmed = false;
            tasks[taskIndex].confirmedBy = null;
        }
        
        saveTasks(tasks);
        

        updateDashboardMembers();
        

        const task = tasks[taskIndex];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.id && task.id) {
            fetch(`http://localhost:3000/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isChecked: isChecked })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Статус задачи обновлен в БД');
                }
            })
            .catch(error => {
                console.error('❌ Ошибка обновления задачи в БД:', error);
            });
        }
    }
}

function deleteTaskFromStorage(taskName, category) {
    const tasks = getSavedTasks();
    const filteredTasks = tasks.filter(t => !(t.name === taskName && t.category === category));
    saveTasks(filteredTasks);
}

function deleteTask(taskName, category) {
    if (!confirm(`Удалить задачу "${taskName}"?`)) {
        return;
    }
    

    deleteTaskFromStorage(taskName, category);
    

    const tasks = getSavedTasks();
    const task = tasks.find(t => t.name === taskName && t.category === category);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser && currentUser.id && task && task.id) {
        fetch(`http://localhost:3000/api/tasks/${task.id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Задача удалена из БД');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка удаления задачи из БД:', error);
        });
    }
    

    const taskItem = document.querySelector(`.task-item[data-task-name="${taskName}"][data-category="${category}"]`);
    if (taskItem) {
        const card = taskItem.closest('.category-card');
        taskItem.remove();
        

        if (card) {
            const tasksList = card.querySelector('.tasks-list');
            const taskCount = card.querySelector('.task-count');
            const currentCount = tasksList.querySelectorAll('.task-item').length;
            const taskWord = currentCount === 1 ? 'задача' : currentCount < 5 ? 'задачи' : 'задач';
            taskCount.textContent = `${currentCount} ${taskWord}`;
        }
    }
    
    showNotification('Задача удалена', 'success');
    

    updateTaskProgress();
}


function confirmTask(taskName, category, taskId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.role !== 'parent' && currentUser.role) {
        showNotification('Только родители могут подтверждать задачи', 'info');
        return;
    }
    

    const tasks = getSavedTasks();
    const taskIndex = tasks.findIndex(t => t.name === taskName && t.category === category);
    if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        task.isConfirmed = true;
        task.confirmedBy = currentUser.id;
        saveTasks(tasks);
        

        const members = getFamilyMembers();
        const memberIndex = members.findIndex(m => m.name === task.assignee);
        if (memberIndex !== -1) {
            members[memberIndex].points = (members[memberIndex].points || 0) + 10; 
            const familyKey = currentUser.familyName || currentUser.email || 'default';
            localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify(members));
        }
        

        if (currentUser.id && taskId) {
            fetch(`http://localhost:3000/api/tasks/${taskId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    confirmedBy: currentUser.id 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Задача подтверждена в БД');
                    showNotification(`Задача подтверждена! +10 очков для ${task.assignee}`, 'success');
                    

                    const taskItem = document.querySelector(`[data-task-name="${taskName}"][data-category="${category}"]`);
                    if (taskItem) {
                        taskItem.classList.remove('pending-confirmation');
                        taskItem.classList.add('confirmed');
                        taskItem.setAttribute('data-is-confirmed', 'true');
                        

                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        if (checkbox) checkbox.disabled = true;
                        

                        const confirmBtn = taskItem.querySelector('.btn-confirm-task');
                        if (confirmBtn) confirmBtn.remove();
                        
                        const pendingLabel = taskItem.querySelector('.pending-label');
                        if (pendingLabel) pendingLabel.remove();
                    }
                    

                    updateDashboardMembers();
                    updateTaskProgress();
                    updateDashboardAvatars();
                }
            })
            .catch(error => {
                console.error('❌ Ошибка подтверждения задачи:', error);
                showNotification('Ошибка подтверждения задачи', 'info');
            });
        } else {

            showNotification(`Задача подтверждена! +10 очков для ${task.assignee}`, 'success');
            
            const taskItem = document.querySelector(`[data-task-name="${taskName}"][data-category="${category}"]`);
            if (taskItem) {
                taskItem.classList.remove('pending-confirmation');
                taskItem.classList.add('confirmed');
                taskItem.setAttribute('data-is-confirmed', 'true');
                
                const checkbox = taskItem.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.disabled = true;
                
                const confirmBtn = taskItem.querySelector('.btn-confirm-task');
                if (confirmBtn) confirmBtn.remove();
                
                const pendingLabel = taskItem.querySelector('.pending-label');
                if (pendingLabel) pendingLabel.remove();
            }
            

            updateDashboardMembers();
            updateTaskProgress();
            updateDashboardAvatars();
        }
    }
}

function saveDefaultTasksState() {
    const defaultTasks = {};
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const taskName = taskItem.querySelector('span').textContent;
        const isChecked = taskItem.querySelector('input[type="checkbox"]').checked;
        const category = taskItem.closest('.category-card')?.querySelector('h4')?.textContent || '';
        
        if (!taskItem.hasAttribute('data-task-name')) {

            const key = `${category}_${taskName}`;
            defaultTasks[key] = isChecked;
        }
    });
    localStorage.setItem('defaultTasksState', JSON.stringify(defaultTasks));
}

function loadDefaultTasksState() {
    const savedState = localStorage.getItem('defaultTasksState');
    if (!savedState) return;
    
    const defaultTasks = JSON.parse(savedState);
    
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const taskName = taskItem.querySelector('span').textContent;
        const category = taskItem.closest('.category-card')?.querySelector('h4')?.textContent || '';
        const key = `${category}_${taskName}`;
        
        if (defaultTasks[key] === true) {
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            checkbox.checked = true;
            taskItem.classList.add('checked');
        }
    });
}

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

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, index * 100);
    });
}


function navigateToSection(sectionName) {
    console.log('navigateToSection called with:', sectionName);
    const mainContent = document.querySelector('.main-content');
    
    switch(sectionName) {
        case 'Дашборд':
            showDashboard();
            break;
        case 'Задачи':
            showTasksPage();
            break;
        case 'Календарь':
            showCalendarPage();
            break;
        case 'Статистика':
            showStatisticsPage();
            applyChildRestrictions();
            break;
        case 'Семья':
            showFamilyPage();
            applyChildRestrictions();
            break;
        case 'Настройки':
            showSettingsPage();
            applyChildRestrictions();
            break;
        case 'Отчёты':
            showReportsPage();
            break;
    }
}

function applyChildRestrictions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'child') {
        setTimeout(() => {

            document.querySelectorAll('.btn-primary, .btn-secondary, [onclick*="add"], [onclick*="Add"], [onclick*="edit"], [onclick*="Edit"], [onclick*="delete"], [onclick*="Delete"], [onclick*="show"][onclick*="Modal"]').forEach(btn => {
                if (!btn.classList.contains('btn-logout')) {
                    btn.style.display = 'none';
                }
            });
            

            document.querySelectorAll('input:not([type="checkbox"]), textarea, select').forEach(input => {
                input.setAttribute('readonly', true);
                input.style.cursor = 'not-allowed';
                input.style.background = '#f7fafc';
            });
            

            document.querySelectorAll('.toggle').forEach(toggle => {
                toggle.setAttribute('disabled', true);
            });
            

            document.querySelectorAll('.delete-task-btn, .edit-btn, .delete-btn, .btn-delete').forEach(btn => {
                btn.style.display = 'none';
            });
        }, 100);
    }
}

function setupCurrentSection() {

}

function initializeCustomAvatars() {

    if (!window.customAvatars) {
        window.customAvatars = {};
    }
    
    const members = getFamilyMembers();
    members.forEach(member => {
        const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
        window.customAvatars[member.name] = avatarSrc;
    });
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
        weekRangeElement.textContent = `Неделя ${mondayDay} – ${sundayDay} ${mondayMonth}`;
    } else {
        weekRangeElement.textContent = `Неделя ${mondayDay} ${mondayMonth} – ${sundayDay} ${sundayMonth}`;
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

function showFamilyPage() {
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const familyHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Семья</h2>
                <p class="subtitle">Управление членами семьи</p>
                <div class="header-actions">
                    <button class="btn-primary" onclick="showAddMemberModal()">+ Добавить члена семьи</button>
                </div>
            </header>
            
            <div class="family-members-detailed" id="familyMembersContainer">
                ${generateDetailedFamilyCards()}
            </div>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', familyHTML);
}

function showSettingsPage() {
    console.log('showSettingsPage called');
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
    console.log('Settings HTML inserted');
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

function reinitializeTaskListeners() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isChild = currentUser.role === 'child';
    
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {

        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        newCheckbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            const taskName = taskItem.getAttribute('data-task-name');
            const category = taskItem.getAttribute('data-category');
            const isConfirmed = taskItem.getAttribute('data-is-confirmed') === 'true';
            

            if (isConfirmed) {
                this.checked = !this.checked;
                showNotification('Эта задача уже подтверждена', 'info');
                return;
            }
            

            if (isChild) {
                const tasks = getSavedTasks();
                const task = tasks.find(t => t.name === taskName && t.category === category);
                if (task && task.assignee !== currentUser.name) {
                    this.checked = !this.checked; 
                    showNotification('Вы можете отмечать только свои задачи', 'info');
                    return;
                }
            }
            
            if (this.checked) {
                taskItem.classList.add('checked');
                if (isChild) {
                    taskItem.classList.add('pending-confirmation');
                }
            } else {
                taskItem.classList.remove('checked');
                taskItem.classList.remove('pending-confirmation');
            }
            
            updateTaskProgress();
            updateTaskInStorage(taskName, category, this.checked);
            

            if (isChild && this.checked) {
                setTimeout(() => loadSavedTasks(), 500);
            }
        });
    });
}

function generateAllTasksGrid() {
    const tasks = getSavedTasks();
    const categories = {
        cleaning: { name: 'Уборка', icon: '🧹', color: 'purple', tasks: [] },
        cooking: { name: 'Готовка', icon: '🍳', color: 'orange', tasks: [] },
        shopping: { name: 'Покупки', icon: '🛒', color: 'green', tasks: [] },
        kids: { name: 'Дети', icon: '👶', color: 'pink', tasks: [] },
        pets: { name: 'Питомцы', icon: '🐾', color: 'yellow', tasks: [] },
        finance: { name: 'Финансы', icon: '$', color: 'blue', tasks: [] }
    };
    

    tasks.forEach(task => {
        if (categories[task.category]) {
            categories[task.category].tasks.push(task);
        }
    });
    

    let html = '';
    for (const [key, cat] of Object.entries(categories)) {
        const taskCount = cat.tasks.length;
        const taskWord = taskCount === 1 ? 'задача' : taskCount < 5 ? 'задачи' : 'задач';
        
        html += `
            <div class="category-card" data-category="${key}">
                <div class="category-header">
                    <span class="category-icon ${cat.color}">${cat.icon}</span>
                    <div>
                        <h4>${cat.name}</h4>
                        <p class="task-count">${taskCount} ${taskWord}</p>
                    </div>
                </div>
                <div class="tasks-list">
                    ${cat.tasks.map(task => {
                        const avatarSrc = getAvatarForMember(task.assignee);
                        const checkedClass = task.isChecked ? 'checked' : '';
                        const checkedAttr = task.isChecked ? 'checked' : '';
                        
                        return `
                            <label class="task-item ${checkedClass}" data-period="${task.period}" data-task-name="${task.name}" data-category="${key}">
                                <input type="checkbox" ${checkedAttr}>
                                <span>${task.name}</span>
                                <img src="${avatarSrc}" alt="${task.assignee}" class="task-avatar">
                                <button class="delete-task-btn" onclick="deleteTask('${task.name}', '${key}')" title="Удалить задачу">×</button>
                            </label>
                        `;
                    }).join('') || '<p style="color: #999; padding: 10px; text-align: center;">Нет задач</p>'}
                </div>
            </div>
        `;
    }
    
    return html;
}

function filterTasksByStatus(status) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        const isChecked = item.querySelector('input[type="checkbox"]').checked;
        
        switch(status) {
            case 'all':
                item.style.display = 'flex';
                break;
            case 'active':
                item.style.display = isChecked ? 'none' : 'flex';
                break;
            case 'completed':
                item.style.display = isChecked ? 'flex' : 'none';
                break;
        }
    });
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
        const dateStr = `${year}-${month}-${day}`;
        days.push(`<div class="calendar-day other-month" data-date="${dateStr}" onclick="selectDate(this, ${year}, ${month - 1}, ${day})">${day}</div>`);
    }
    

    for (let day = 1; day <= lastDate; day++) {
        const currentDate = new Date(year, month, day);
        const isToday = currentDate.toDateString() === today.toDateString() ? 'today' : '';
        const dateStr = `${year}-${month + 1}-${day}`;
        
        const hasTasks = getTasksForDate(year, month, day).length > 0;
        const taskDot = hasTasks ? '<div class="task-dot"></div>' : '';
        
        days.push(`<div class="calendar-day ${isToday}" data-date="${dateStr}" onclick="selectDate(this, ${year}, ${month}, ${day})">${day}${taskDot}</div>`);
    }
    

    const totalCells = days.length + 7; 
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let i = 1; i <= remainingCells; i++) {
        const dateStr = `${year}-${month + 2}-${i}`;
        days.push(`<div class="calendar-day other-month" data-date="${dateStr}" onclick="selectDate(this, ${year}, ${month + 1}, ${i})">${i}</div>`);
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

function saveCalendarTask(year, month, day, task) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const calendarTasks = JSON.parse(localStorage.getItem(`calendarTasks_${familyKey}`) || '{}');
    
    const dateKey = `${year}-${month + 1}-${day}`;
    if (!calendarTasks[dateKey]) {
        calendarTasks[dateKey] = [];
    }
    calendarTasks[dateKey].push(task);
    
    localStorage.setItem(`calendarTasks_${familyKey}`, JSON.stringify(calendarTasks));
}

function selectDate(element, year, month, day) {

    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    

    element.classList.add('selected');
    

    showDateTasksModal(year, month, day);
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
        const completionRate = memberStats.tasks > 0 ? Math.round((memberStats.completed / memberStats.tasks) * 100) : 0;
        
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
        alert('Пожалуйста, выберите обе даты');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Начальная дата не может быть позже конечной');
        return;
    }
    
    closeCustomPeriodModal();
    

    const statsContent = document.getElementById('statsContent');
    if (statsContent) {

        statsContent.innerHTML = generateStatsContent('week');
        showNotification(`Статистика с ${startDate} по ${endDate}`, 'info');
    }
}

function generateDetailedFamilyCards() {
    const members = getFamilyMembers();
    
    return members.map(member => {

        const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
        
        return `
        <div class="family-member-detailed">
            <img src="${avatarSrc}" alt="${member.name}" class="member-avatar-large">
            <div class="member-details">
                <h3>${member.name}</h3>
                <p class="member-role">${member.role}</p>
                <div class="member-stats-detailed">
                    <div class="stat">
                        <span class="stat-label">Очки</span>
                        <span class="stat-value ${member.color}">${member.points}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Задачи</span>
                        <span class="stat-value">${member.tasks}</span>
                    </div>
                </div>
            </div>
            <button class="btn-icon btn-edit" onclick="editMember('${member.name}')">✎</button>
        </div>
    `;
    }).join('');
}

function getTotalTasks() {
    return document.querySelectorAll('.task-item').length;
}

function getCompletedTasks() {
    return document.querySelectorAll('.task-item input[type="checkbox"]:checked').length;
}

function getActiveTasks() {
    return getTotalTasks() - getCompletedTasks();
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

function editMember(name) {

    const memberData = getFamilyMembers().find(m => m.name === name);
    if (!memberData) return;
    

    const avatarSrc = (typeof memberData.avatar === 'string' && memberData.avatar.startsWith('data:')) 
        ? memberData.avatar 
        : `https://i.pravatar.cc/150?img=${memberData.avatar}`;
    
    const modalHTML = `
        <div class="modal-overlay" id="editMemberModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Редактировать профиль</h3>
                    <button class="close-modal" onclick="closeEditMemberModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="avatar-selector">
                        <img src="${avatarSrc}" alt="${name}" class="avatar-preview" id="avatarPreview">
                        <div class="avatar-buttons">
                            <button class="btn-change-avatar" onclick="changeAvatar()">Случайное фото</button>
                            <label class="btn-upload-avatar">
                                Загрузить фото
                                <input type="file" id="editAvatarUpload" accept="image/*" onchange="handleAvatarUpload(event, 'edit')" style="display: none;">
                            </label>
                        </div>
                        <input type="hidden" id="editAvatarId" value="${memberData.avatar}">
                    </div>
                    <input type="text" class="modal-input" placeholder="Имя" id="editMemberName" value="${memberData.name}">
                    <select class="modal-select" id="editMemberRole">
                        <option value="Родитель" ${memberData.role === 'Родитель' ? 'selected' : ''}>Родитель</option>
                        <option value="Ребенок" ${memberData.role === 'Ребенок' ? 'selected' : ''}>Ребенок</option>
                        <option value="Бабушка/Дедушка" ${memberData.role === 'Бабушка/Дедушка' ? 'selected' : ''}>Бабушка/Дедушка</option>
                    </select>
                    <input type="number" class="modal-input" placeholder="Очки" id="editMemberPoints" value="${memberData.points}">
                    <select class="modal-select" id="editMemberColor">
                        <option value="purple" ${memberData.color === 'purple' ? 'selected' : ''}>Фиолетовый</option>
                        <option value="orange" ${memberData.color === 'orange' ? 'selected' : ''}>Оранжевый</option>
                        <option value="cyan" ${memberData.color === 'cyan' ? 'selected' : ''}>Голубой</option>
                        <option value="pink" ${memberData.color === 'pink' ? 'selected' : ''}>Розовый</option>
                        <option value="green" ${memberData.color === 'green' ? 'selected' : ''}>Зеленый</option>
                        <option value="blue" ${memberData.color === 'blue' ? 'selected' : ''}>Синий</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button class="btn-danger" onclick="deleteMember('${name}')">Удалить</button>
                    <button class="btn-secondary" onclick="closeEditMemberModal()">Отмена</button>
                    <button class="btn-primary" onclick="saveMemberEdit('${name}')">Сохранить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeEditMemberModal() {
    const modal = document.getElementById('editMemberModal');
    if (modal) {
        modal.remove();
    }
}

function saveMemberEdit(oldName) {
    const newName = document.getElementById('editMemberName').value;
    const role = document.getElementById('editMemberRole').value;
    const points = parseInt(document.getElementById('editMemberPoints').value);
    const color = document.getElementById('editMemberColor').value;
    const avatarId = document.getElementById('editAvatarId').value;
    
    if (!newName) {
        alert('Пожалуйста, введите имя');
        return;
    }
    

    const members = getFamilyMembers();
    const memberIndex = members.findIndex(m => m.name === oldName);
    if (memberIndex !== -1) {
        const oldAvatar = members[memberIndex].avatar;
        
        members[memberIndex] = {
            name: newName,
            role: role,
            avatar: avatarId,
            points: points,
            tasks: members[memberIndex].tasks,
            color: color
        };
        saveFamilyMembers(members);
        

        if (oldName !== newName || oldAvatar !== avatarId) {
            updateAllAvatars(oldName, newName, avatarId);
        }
        

        showFamilyPage();
        closeEditMemberModal();
        showNotification('Профиль успешно обновлен!', 'success');
    }
}

function deleteMember(name) {
    if (!confirm(`Вы уверены, что хотите удалить ${name} из семьи?`)) {
        return;
    }
    
    const members = getFamilyMembers();
    const updatedMembers = members.filter(m => m.name !== name);
    saveFamilyMembers(updatedMembers);
    
    showFamilyPage();
    closeEditMemberModal();
    showNotification('Член семьи удален', 'success');
}

function changeAvatar() {
    const currentId = parseInt(document.getElementById('editAvatarId').value);
    const newId = (currentId % 70) + 1; 
    document.getElementById('editAvatarId').value = newId;
    document.getElementById('avatarPreview').src = `https://i.pravatar.cc/150?img=${newId}`;
}

function showAddMemberModal() {
    const modalHTML = `
        <div class="modal-overlay" id="addMemberModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Добавить члена семьи</h3>
                    <button class="close-modal" onclick="closeAddMemberModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="avatar-selector">
                        <img src="https://i.pravatar.cc/150?img=1" alt="Avatar" class="avatar-preview" id="newAvatarPreview">
                        <div class="avatar-buttons">
                            <button class="btn-change-avatar" onclick="changeNewAvatar()">Случайное фото</button>
                            <label class="btn-upload-avatar">
                                Загрузить фото
                                <input type="file" id="newAvatarUpload" accept="image/*" onchange="handleAvatarUpload(event, 'new')" style="display: none;">
                            </label>
                        </div>
                        <input type="hidden" id="newAvatarId" value="1">
                    </div>
                    <input type="text" class="modal-input" placeholder="Имя" id="newMemberName">
                    <select class="modal-select" id="newMemberRole">
                        <option value="">Выберите роль</option>
                        <option value="Родитель">Родитель</option>
                        <option value="Ребенок">Ребенок</option>
                        <option value="Бабушка/Дедушка">Бабушка/Дедушка</option>
                    </select>
                    <select class="modal-select" id="newMemberColor">
                        <option value="">Выберите цвет</option>
                        <option value="purple">Фиолетовый</option>
                        <option value="orange">Оранжевый</option>
                        <option value="cyan">Голубой</option>
                        <option value="pink">Розовый</option>
                        <option value="green">Зеленый</option>
                        <option value="blue">Синий</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeAddMemberModal()">Отмена</button>
                    <button class="btn-primary" onclick="addNewMember()">Добавить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    if (modal) {
        modal.remove();
    }
}

function changeNewAvatar() {
    const currentId = parseInt(document.getElementById('newAvatarId').value);
    const newId = (currentId % 70) + 1;
    document.getElementById('newAvatarId').value = newId;
    document.getElementById('newAvatarPreview').src = `https://i.pravatar.cc/150?img=${newId}`;
}

function handleAvatarUpload(event, mode) {
    const file = event.target.files[0];
    if (!file) return;
    

    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Размер изображения не должен превышать 5 МБ');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {

            const canvas = document.createElement('canvas');
            const MAX_SIZE = 300;
            let width = img.width;
            let height = img.height;
            

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            

            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            

            if (mode === 'edit') {
                document.getElementById('avatarPreview').src = base64Image;
                document.getElementById('editAvatarId').value = base64Image;
            } else if (mode === 'new') {
                document.getElementById('newAvatarPreview').src = base64Image;
                document.getElementById('newAvatarId').value = base64Image;
            }
            
            showNotification('Фото успешно загружено!', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function addNewMember() {
    const name = document.getElementById('newMemberName').value;
    const role = document.getElementById('newMemberRole').value;
    const color = document.getElementById('newMemberColor').value;
    const avatarId = document.getElementById('newAvatarId').value;
    
    if (!name || !role || !color) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    const members = getFamilyMembers();
    const newMember = {
        name: name,
        role: role,
        avatar: avatarId,
        points: 0,
        tasks: '0/0',
        color: color
    };
    
    members.push(newMember);
    saveFamilyMembers(members);
    
    console.log('Добавление члена семьи:', newMember);
    

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Текущий пользователь:', currentUser);
    
    if (currentUser && currentUser.id) {
        console.log('Отправка на сервер...');
        fetch('http://localhost:3000/api/family-members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                name: name,
                role: role,
                avatar: avatarId,
                points: 0,
                tasks: '0/0',
                color: color
            })
        })
        .then(response => {
            console.log('Ответ сервера:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Данные ответа:', data);
            if (data.success) {
                console.log('✅ Член семьи сохранен в БД');
            } else {
                console.error('❌ Ошибка:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Ошибка сохранения в БД:', error);
        });
    } else {
        console.warn('⚠️ Пользователь не авторизован или ID отсутствует');
    }
    

    const avatarSrc = (typeof avatarId === 'string' && avatarId.startsWith('data:')) 
        ? avatarId 
        : `https://i.pravatar.cc/150?img=${avatarId}`;
    if (!window.customAvatars) {
        window.customAvatars = {};
    }
    window.customAvatars[name] = avatarSrc;
    

    showFamilyPage();
    closeAddMemberModal();
    updateDashboardAvatars();
    showNotification(`${name} добавлен в семью!`, 'success');
}

function getFamilyMembers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const stored = localStorage.getItem(`familyMembers_${familyKey}`);
    if (stored) {
        return JSON.parse(stored);
    }

    return [];
}

function saveFamilyMembers(members) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify(members));
}

function updateDashboardAvatars() {
    const members = getFamilyMembers();
    const memberCards = document.querySelectorAll('#dashboardContent .member-card');
    
    memberCards.forEach(card => {
        const nameElement = card.querySelector('h4');
        if (!nameElement) return;
        
        const memberName = nameElement.textContent;
        const member = members.find(m => m.name === memberName);
        
        if (member) {
            const avatarImg = card.querySelector('.avatar');
            if (avatarImg) {
                const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
                    ? member.avatar 
                    : `https://i.pravatar.cc/150?img=${member.avatar}`;
                avatarImg.src = avatarSrc;
            }
        }
    });
}

function updateAllAvatars(oldName, newName, newAvatar) {
    const avatarSrc = (typeof newAvatar === 'string' && newAvatar.startsWith('data:')) 
        ? newAvatar 
        : `https://i.pravatar.cc/150?img=${newAvatar}`;
    

    document.querySelectorAll('.task-avatar').forEach(avatar => {
        if (avatar.alt === oldName) {
            avatar.src = avatarSrc;
            avatar.alt = newName;
        }
    });
    

    document.querySelectorAll('#dashboardContent .member-card').forEach(card => {
        const nameElement = card.querySelector('h4');
        if (nameElement && nameElement.textContent === oldName) {
            nameElement.textContent = newName;
            const avatarImg = card.querySelector('.avatar');
            if (avatarImg) {
                avatarImg.src = avatarSrc;
                avatarImg.alt = newName;
            }
        }
    });
    

    document.querySelectorAll('.family-member-detailed').forEach(card => {
        const nameElement = card.querySelector('h3');
        if (nameElement && nameElement.textContent === oldName) {
            nameElement.textContent = newName;
            const avatarImg = card.querySelector('.member-avatar-large');
            if (avatarImg) {
                avatarImg.src = avatarSrc;
                avatarImg.alt = newName;
            }
        }
    });
    

    document.querySelectorAll('.family-stat-avatar').forEach(avatar => {
        if (avatar.alt === oldName) {
            avatar.src = avatarSrc;
            avatar.alt = newName;
        }
    });
    

    document.querySelectorAll('.family-stat-info h4').forEach(h4 => {
        if (h4.textContent === oldName) {
            h4.textContent = newName;
        }
    });
    

    document.querySelectorAll('#taskAssignee option, #newTaskMember option').forEach(option => {
        if (option.value === oldName) {
            option.value = newName;
            option.textContent = newName;
        }
    });
    

    if (oldName !== newName) {
        updateAvatarMap(oldName, newName, avatarSrc);
    }
}

function updateAvatarMap(oldName, newName, avatarSrc) {

    if (!window.customAvatars) {
        window.customAvatars = {};
    }
    window.customAvatars[newName] = avatarSrc;
    if (oldName !== newName) {
        delete window.customAvatars[oldName];
    }
    

    updateDashboardMembers();
}

function updateDashboardMembers() {
    const container = document.getElementById('dashboardFamilyMembers');
    if (!container) return;
    
    const members = getFamilyMembers();
    const tasks = getSavedTasks();
    

    updateDashboardSubtitle(tasks);
    
    if (members.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Добавьте членов семьи на странице "Семья"</p>';
        return;
    }
    

    const updatedMembers = members.map(member => {
        const memberTasks = tasks.filter(t => t.assignee === member.name);
        const completedTasks = memberTasks.filter(t => t.isChecked).length;
        const totalTasks = memberTasks.length;
        
        return {
            ...member,
            tasks: `${completedTasks}/${totalTasks}`,
            points: member.points || 0
        };
    });
    

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify(updatedMembers));
    
    container.innerHTML = updatedMembers.map(member => {
        const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
        
        return `
            <div class="member-card">
                <img src="${avatarSrc}" alt="${member.name}" class="avatar">
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p class="role">${member.role}</p>
                </div>
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-value ${member.color}">${member.points}</span>
                        <span class="stat-label">очков</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${member.tasks}</span>
                        <span class="stat-label">задач</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    

    updateNotifications();
}

function updateNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const tasks = getSavedTasks();
    const members = getFamilyMembers();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const notifications = [];
    

    if (currentUser.role === 'parent' || !currentUser.role) {
        const pendingTasks = tasks.filter(t => t.isChecked && !t.isConfirmed);
        if (pendingTasks.length > 0) {
            pendingTasks.forEach(task => {
                notifications.push({
                    type: 'urgent',
                    icon: '!',
                    iconClass: 'orange',
                    title: 'Требует подтверждения',
                    message: `${task.assignee} выполнил задачу: ${task.name}`
                });
            });
        }
    }
    

    const today = new Date();
    const todayTasks = tasks.filter(t => {
        if (t.isChecked || t.isConfirmed) return false;
        if (t.period === 'день') return true;
        return false;
    });
    
    if (todayTasks.length > 3) {
        notifications.push({
            type: 'urgent',
            icon: '⚡',
            iconClass: 'red',
            title: 'Много задач!',
            message: `Сегодня ${todayTasks.length} активных задач`
        });
    }
    

    const completedTasks = tasks.filter(t => t.isConfirmed);
    if (completedTasks.length > 0) {
        const recentCompleted = completedTasks.slice(-2); 
        recentCompleted.forEach(task => {
            notifications.push({
                type: 'success',
                icon: '✓',
                iconClass: 'green',
                title: 'Выполнено',
                message: `${task.assignee} завершил: ${task.name}`
            });
        });
    }
    

    if (currentUser.name) {
        const myUncompletedTasks = tasks.filter(t => 
            t.assignee === currentUser.name && !t.isChecked
        );
        if (myUncompletedTasks.length > 0) {
            notifications.push({
                type: 'info',
                icon: 'i',
                iconClass: 'blue',
                title: 'Ваши задачи',
                message: `У вас ${myUncompletedTasks.length} невыполненных задач`
            });
        }
    }
    

    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет уведомлений</p>';
        return;
    }
    

    const displayNotifications = notifications.slice(0, 5);
    
    notificationsList.innerHTML = displayNotifications.map(notif => `
        <div class="notification-item ${notif.type || ''}">
            <div class="notification-icon ${notif.iconClass}">${notif.icon}</div>
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
            </div>
        </div>
    `).join('');
}

function updateDashboardSubtitle(tasks) {
    const subtitle = document.getElementById('dashboardSubtitle');
    if (!subtitle) return;
    
    const activeTasks = tasks.filter(t => !t.isChecked).length;
    const taskWord = activeTasks === 1 ? 'задача' : activeTasks < 5 ? 'задачи' : 'задач';
    subtitle.textContent = `Сегодня у вас ${activeTasks} ${activeTasks === 1 ? 'активная' : 'активных'} ${taskWord}`;
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
    const monthHeader = document.getElementById('currentMonth');
    if (monthHeader) {
        monthHeader.textContent = getMonthYearString(currentCalendarDate);
    }
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {

        const dayNamesHTML = `
            <div class="calendar-day-name">Пн</div>
            <div class="calendar-day-name">Вт</div>
            <div class="calendar-day-name">Ср</div>
            <div class="calendar-day-name">Чт</div>
            <div class="calendar-day-name">Пт</div>
            <div class="calendar-day-name">Сб</div>
            <div class="calendar-day-name">Вс</div>
        `;
        

        calendarGrid.innerHTML = dayNamesHTML + generateCalendarDays();
    }
}

function showDateTasksModal(year, month, day) {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const tasks = getTasksForDate(year, month, day);
    
    const tasksHTML = tasks.length > 0 
        ? tasks.map((task, index) => `
            <div class="date-task-item">
                <div>
                    <span class="task-title">${task.title}</span>
                    <span class="task-member">${task.member}</span>
                </div>
                <button class="btn-icon btn-delete" onclick="deleteCalendarTask(${year}, ${month}, ${day}, ${index})" title="Удалить">🗑️</button>
            </div>
        `).join('')
        : '<p class="no-tasks-message">На эту дату нет задач</p>';
    
    const modalHTML = `
        <div class="modal-overlay" id="dateTasksModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Задачи на ${dateStr}</h3>
                    <button class="close-modal" onclick="closeDateTasksModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="date-tasks-list">
                        ${tasksHTML}
                    </div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 15px;">Добавить новую задачу</h4>
                    <input type="text" class="modal-input" id="newTaskTitle" placeholder="Название задачи">
                    <select class="modal-select" id="newTaskMember">
                        <option value="">Выберите члена семьи</option>
                        ${getFamilyMembers().map(member => `<option value="${member.name}">${member.name}</option>`).join('')}
                    </select>
                    <select class="modal-select" id="newTaskPriority">
                        <option value="normal">Обычный приоритет</option>
                        <option value="high">Высокий приоритет</option>
                        <option value="low">Низкий приоритет</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeDateTasksModal()">Закрыть</button>
                    <button class="btn-primary" onclick="addTaskToDate(${year}, ${month}, ${day})">Добавить задачу</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeDateTasksModal() {
    const modal = document.getElementById('dateTasksModal');
    if (modal) {
        modal.remove();
    }
}

function addTaskToDate(year, month, day) {
    const title = document.getElementById('newTaskTitle').value;
    const member = document.getElementById('newTaskMember').value;
    const priority = document.getElementById('newTaskPriority').value;
    
    if (!title || !member) {
        alert('Пожалуйста, заполните название задачи и выберите члена семьи');
        return;
    }
    

    const task = { title, member, priority };
    saveCalendarTask(year, month, day, task);
    

    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    showNotification(`Задача "${title}" добавлена на ${dateStr} для ${member}`, 'success');
    

    closeDateTasksModal();
    updateCalendarDisplay();
}

function deleteCalendarTask(year, month, day, taskIndex) {
    if (!confirm('Удалить эту задачу?')) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const calendarTasks = JSON.parse(localStorage.getItem(`calendarTasks_${familyKey}`) || '{}');
    
    const dateKey = `${year}-${month + 1}-${day}`;
    if (calendarTasks[dateKey]) {
        calendarTasks[dateKey].splice(taskIndex, 1);
        

        if (calendarTasks[dateKey].length === 0) {
            delete calendarTasks[dateKey];
        }
        
        localStorage.setItem(`calendarTasks_${familyKey}`, JSON.stringify(calendarTasks));
        showNotification('Задача удалена', 'success');
        

        closeDateTasksModal();
        showDateTasksModal(year, month, day);
        updateCalendarDisplay();
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .modal {
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease;
    }
    
    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }
    
    .modal-header h3 {
        font-size: 22px;
        font-weight: 700;
        color: #1a202c;
    }
    
    .close-modal {
        width: 32px;
        height: 32px;
        border: none;
        background: #f7fafc;
        border-radius: 8px;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .close-modal:hover {
        background: #edf2f7;
    }
    
    .modal-body {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 25px;
    }
    
    .modal-input,
    .modal-select {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.3s ease;
    }
    
    .modal-input:focus,
    .modal-select:focus {
        outline: none;
        border-color: #667eea;
    }
    
    .modal-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }
    
    .btn-secondary {
        padding: 10px 20px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #2d3748;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #f7fafc;
    }
    
    .btn-danger {
        padding: 10px 20px;
        border: none;
        background: #f56565;
        color: white;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-danger:hover {
        background: #e53e3e;
    }
    
    .avatar-selector {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding: 20px;
        background: #f7fafc;
        border-radius: 12px;
    }
    
    .avatar-preview {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .avatar-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .btn-change-avatar,
    .btn-upload-avatar {
        padding: 8px 16px;
        border: 2px solid #667eea;
        background: white;
        color: #667eea;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-block;
    }
    
    .btn-change-avatar:hover,
    .btn-upload-avatar:hover {
        background: #667eea;
        color: white;
    }
    
    .btn-edit {
        transition: all 0.3s ease;
    }
    
    .btn-edit:hover {
        background: #667eea;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);


function toggleTheme(checkbox) {
    console.log('toggleTheme called, checked:', checkbox.checked);
    if (checkbox.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('lightTheme', 'true');
        console.log('Light theme ENABLED - body classes:', document.body.className);
        console.log('Body has light-theme class:', document.body.classList.contains('light-theme'));
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('lightTheme', 'false');
        console.log('Dark theme ENABLED - body classes:', document.body.className);
    }
    

    const testElement = document.querySelector('.category-header h4');
    if (testElement) {
        const styles = window.getComputedStyle(testElement);
        console.log('Category header color:', styles.color);
    }
}

function initTheme() {
    const isLight = localStorage.getItem('lightTheme') === 'true';
    console.log('initTheme - isLight:', isLight);
    if (isLight) {
        document.body.classList.add('light-theme');
        console.log('Light theme applied on init');
    }
}


window.toggleTheme = toggleTheme;


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}


function showReportsMenuForParent() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const reportsMenuItem = document.querySelector('.nav-reports');
    
    if (currentUser.role === 'parent' && reportsMenuItem) {
        reportsMenuItem.style.display = 'flex';
    }
}

function showReportsPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    

    if (currentUser.role !== 'parent' && currentUser.role) {
        showNotification('Только родители могут просматривать отчёты', 'info');
        return;
    }
    
    const mainContent = document.querySelector('.main-content');
    hideDashboard();
    clearMainContent();
    
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    

    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    
    const reportsHTML = `
        <div class="page-content">
            <header class="header">
                <h2>Отчёты семьи</h2>
                <p class="subtitle">История активности и достижений</p>
                <button class="btn-primary" onclick="generateNewReport()">Создать отчёт</button>
            </header>
            
            <section class="reports-section">
                <div id="reportsList">
                    ${savedReports.length === 0 ? '<p style="text-align: center; color: #718096;">Нет сохранённых отчётов</p>' : ''}
                    ${savedReports.map((report, index) => `
                        <div class="report-card">
                            <div class="report-header">
                                <h3>${report.title}</h3>
                                <span class="report-date">${report.date}</span>
                            </div>
                            <div class="report-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Всего задач</span>
                                    <span class="stat-value">${report.totalTasks}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Выполнено</span>
                                    <span class="stat-value">${report.completedTasks}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Очки</span>
                                    <span class="stat-value">${report.totalPoints}</span>
                                </div>
                            </div>
                            <div class="report-members">
                                ${report.members.map(member => `
                                    <div class="member-report">
                                        <strong>${member.name}</strong>: ${member.completedTasks} задач (${member.points} очков)
                                    </div>
                                `).join('')}
                            </div>
                            <div class="report-actions">
                                <button class="btn-secondary" onclick="viewReport(${index})">Просмотреть</button>
                                <button class="btn-secondary" onclick="downloadReportTxt(${index})">TXT</button>
                                <button class="btn-secondary" onclick="downloadReportPDF(${index})">PDF</button>
                                <button class="btn-secondary" onclick="deleteReport(${index})">Удалить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
    
    mainContent.insertAdjacentHTML('beforeend', reportsHTML);
}

function generateNewReport() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Only parents can generate reports
    if (currentUser.role !== 'parent' && currentUser.role) {
        showNotification('Только родители могут создавать отчёты', 'info');
        return;
    }
    
    const familyMembers = getFamilyMembers(); 
    const tasks = getSavedTasks(); 
    

    let totalTasks = 0;
    let completedTasks = 0;
    let totalPoints = 0;
    const memberStats = {};
    

    familyMembers.forEach(member => {
        memberStats[member.name] = {
            name: member.name,
            completedTasks: 0,
            points: 0
        };
    });
    

    tasks.forEach(task => {
        totalTasks++;
        if (task.isChecked) {
            completedTasks++;
            if (task.assignee && memberStats[task.assignee]) {
                memberStats[task.assignee].completedTasks++;
                if (task.isConfirmed) {
                    memberStats[task.assignee].points += 10; 
                }
            }
        }
    });
    
    totalPoints = tasks.filter(t => t.isConfirmed).length * 10;
    
    const report = {
        title: `Отчёт ${new Date().toLocaleDateString('ru-RU')}`,
        date: new Date().toLocaleString('ru-RU'),
        totalTasks,
        completedTasks,
        totalPoints,
        members: Object.values(memberStats),
        createdBy: currentUser.username
    };
    

    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    savedReports.unshift(report); 
    localStorage.setItem(`familyReports_${familyKey}`, JSON.stringify(savedReports));
    

    showReportsPage();
    showNotification('Отчёт успешно создан!', 'success');
}

function viewReport(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    const report = savedReports[index];
    
    if (!report) return;
    
    const modalHTML = `
        <div class="modal-overlay" onclick="this.remove()">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${report.title}</h3>
                </div>
                <div class="modal-body">
                    <p><strong>Дата создания:</strong> ${report.date}</p>
                    <p><strong>Создал:</strong> ${report.createdBy}</p>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <h4>Общая статистика:</h4>
                    <p>Всего задач: ${report.totalTasks}</p>
                    <p>Выполнено: ${report.completedTasks}</p>
                    <p>Процент выполнения: ${report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0}%</p>
                    <p>Всего очков: ${report.totalPoints}</p>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <h4>По членам семьи:</h4>
                    ${report.members.map(member => `
                        <p><strong>${member.name}:</strong> ${member.completedTasks} задач, ${member.points} очков</p>
                    `).join('')}
                </div>
                <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function downloadReportTxt(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    const report = savedReports[index];
    
    if (!report) return;
    

    let content = `${report.title}\n`;
    content += `Дата создания: ${report.date}\n`;
    content += `Создал: ${report.createdBy}\n\n`;
    content += `=== ОБЩАЯ СТАТИСТИКА ===\n`;
    content += `Всего задач: ${report.totalTasks}\n`;
    content += `Выполнено: ${report.completedTasks}\n`;
    content += `Процент выполнения: ${report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0}%\n`;
    content += `Всего очков: ${report.totalPoints}\n\n`;
    content += `=== ПО ЧЛЕНАМ СЕМЬИ ===\n`;
    report.members.forEach(member => {
        content += `${member.name}: ${member.completedTasks} задач, ${member.points} очков\n`;
    });
    

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Отчет_${report.date.replace(/[/:]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Отчёт скачан в формате TXT!', 'success');
}

function downloadReportPDF(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    const report = savedReports[index];
    
    if (!report) return;
    

    if (typeof window.jspdf === 'undefined') {
        showNotification('Библиотека PDF не загружена', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    

    doc.setFont("helvetica");
    
    let yPosition = 20;
    const lineHeight = 10;
    const pageHeight = doc.internal.pageSize.height;
    

    const addText = (text, fontSize = 12, isBold = false) => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(fontSize);
        if (isBold) {
            doc.setFont("helvetica", "bold");
        } else {
            doc.setFont("helvetica", "normal");
        }
        doc.text(text, 20, yPosition);
        yPosition += lineHeight;
    };
    

    addText(report.title, 18, true);
    yPosition += 5;
    

    addText(`Data sozdaniya: ${report.date}`, 10);
    addText(`Sozdal: ${report.createdBy}`, 10);
    yPosition += 5;
    

    addText('=== OBSHCHAYA STATISTIKA ===', 14, true);
    yPosition += 2;
    addText(`Vsego zadach: ${report.totalTasks}`);
    addText(`Vypolneno: ${report.completedTasks}`);
    const percentage = report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0;
    addText(`Protsent vypolneniya: ${percentage}%`);
    addText(`Vsego ochkov: ${report.totalPoints}`);
    yPosition += 5;
    

    addText('=== PO CHLENAM SEMI ===', 14, true);
    yPosition += 2;
    report.members.forEach(member => {
        addText(`${member.name}: ${member.completedTasks} zadach, ${member.points} ochkov`);
    });
    

    doc.save(`Otchet_${report.date.replace(/[/:]/g, '-')}.pdf`);
    
    showNotification('Отчёт скачан в формате PDF!', 'success');
}

function deleteReport(index) {
    if (!confirm('Удалить этот отчёт?')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    const savedReports = JSON.parse(localStorage.getItem(`familyReports_${familyKey}`) || '[]');
    savedReports.splice(index, 1);
    localStorage.setItem(`familyReports_${familyKey}`, JSON.stringify(savedReports));
    
    showReportsPage();
    showNotification('Отчёт удалён', 'success');
}
