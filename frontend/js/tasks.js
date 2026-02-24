function filterTasks(filter) {
    const taskItems = document.querySelectorAll('.task-item');
    let visibleCount = 0;
    
    taskItems.forEach(task => {
        const period = task.getAttribute('data-period');
        
        if (filter === 'Все') {
            task.style.display = 'flex';
            visibleCount++;
        } else if (filter === 'Сегодня' && period === 'today') {
            task.style.display = 'flex';
            visibleCount++;
        } else if (filter === 'На неделе' && (period === 'today' || period === 'week')) {
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
        showNotification('Пожалуйста, заполните все поля', 'info');
        return;
    }
    
    addTaskToCategory(taskName, taskCategory, taskAssignee, taskTime);
    saveTaskToStorage(taskName, taskCategory, taskAssignee, taskTime, false);
    closeTaskModal();
    showNotification('Задача успешно создана!', 'success');
    updateTaskProgress();
}

function addTaskToCategory(taskName, category, assignee, period = 'день', isChecked = false, isConfirmed = false, taskId = null) {

    if (!taskName || !category || !assignee) {
        console.error('Invalid task data:', { taskName, category, assignee });
        return;
    }
    
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
                    
                    if (isChild) {
                        const taskItem = this.closest('.task-item');
                        if (this.checked) {
                            taskItem.classList.add('checked');
                            taskItem.classList.add('pending-confirmation');
                        } else {
                            taskItem.classList.remove('checked');
                            taskItem.classList.remove('pending-confirmation');
                        }
                        updateTaskInStorage(taskName, category, this.checked);
                        updateTaskProgress();
                        return;
                    }
                    
                    const taskItem = this.closest('.task-item');
                    if (this.checked) {
                        taskItem.classList.add('checked');
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

function updateCategoryVisibility() {

    console.log('Update category visibility');
}

function saveTask(taskData) {
    saveTaskToStorage(taskData.name, taskData.category, taskData.assignee, taskData.period, false);
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

function updateTaskStatus(taskId, isChecked) {
    const tasks = getSavedTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.isChecked = isChecked;
        saveTasks(tasks);
        updateTaskProgress();
    }
}

function saveTasks(tasks) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    console.log(' Сохраняем задачи в localStorage:', tasks);
    localStorage.setItem(`familyHubTasks_${familyKey}`, JSON.stringify(tasks));
}

function loadSavedTasks() {
    document.querySelectorAll('.tasks-list').forEach(list => {
        list.innerHTML = '';
    });
    
    const tasks = getSavedTasks();
    console.log(' Загружаем задачи из localStorage:', tasks);
    tasks.forEach(task => {
        console.log(`Задача "${task.name}": isChecked=${task.isChecked}, isConfirmed=${task.isConfirmed}`);
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
        const task = tasks[taskIndex];
        

        if (task.isConfirmed) {
            console.log('⚠️ Задача уже подтверждена, изменение статуса запрещено');
            return;
        }
        
        tasks[taskIndex].isChecked = isChecked;
        
        if (!isChecked) {
            tasks[taskIndex].isConfirmed = false;
            tasks[taskIndex].confirmedBy = null;
        }
        
        saveTasks(tasks);
        updateDashboardMembers();
        
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

function removeTaskFromStorage(taskName, category) {
    deleteTaskFromStorage(taskName, category);
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
        taskItem.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            taskItem.remove();
            updateTaskProgress();
            updateAllTaskCounts();
            updateCategoryCardsVisibility();
        }, 300);
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
        tasks[taskIndex].isConfirmed = true;
        tasks[taskIndex].confirmedBy = currentUser.name || 'Родитель';
        saveTasks(tasks);
        
        const taskItem = document.querySelector(`.task-item[data-task-name="${taskName}"][data-category="${category}"]`);
        if (taskItem) {
            taskItem.classList.remove('pending-confirmation');
            taskItem.classList.add('confirmed');
            taskItem.setAttribute('data-is-confirmed', 'true');
            
            const confirmBtn = taskItem.querySelector('.btn-confirm-task');
            if (confirmBtn) {
                confirmBtn.remove();
            }
            
            const pendingLabel = taskItem.querySelector('.pending-label');
            if (pendingLabel) {
                pendingLabel.remove();
            }
            
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.disabled = true;
            }
        }
        
        const assignee = tasks[taskIndex].assignee;
        const members = getFamilyMembers();
        const memberIndex = members.findIndex(m => m.name === assignee);
        if (memberIndex !== -1) {
            members[memberIndex].points = (members[memberIndex].points || 0) + 10;
            saveFamilyMembers(members);
            

            if (currentUser && currentUser.id) {
                const encodedName = encodeURIComponent(assignee);
                fetch(`http://localhost:3000/api/family-members/${currentUser.id}/${encodedName}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ points: members[memberIndex].points })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('✅ Баллы обновлены в БД');
                    } else {
                        console.error('❌ Ошибка обновления баллов:', data);
                    }
                })
                .catch(error => {
                    console.error('❌ Ошибка обновления баллов в БД:', error);
                });
            }
        }
        
        showNotification(`Задача "${taskName}" подтверждена! +10 очков для ${assignee}`, 'success');
        updateTaskProgress();
        updateDashboardMembers();
        
        if (typeof updateNotifications === 'function') {
            updateNotifications();
        }
        
        if (currentUser && currentUser.id && taskId) {
            fetch(`http://localhost:3000/api/tasks/${taskId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmedBy: currentUser.name || 'Родитель' })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Задача подтверждена в БД');
                }
            })
            .catch(error => {
                console.error('❌ Ошибка подтверждения задачи в БД:', error);
            });
        }
    }
}

function reinitializeTaskListeners() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isChild = currentUser.role === 'child';
    
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const taskItem = checkbox.closest('.task-item');
        const isConfirmed = taskItem.getAttribute('data-is-confirmed') === 'true';
        
        if (isConfirmed) {
            return;
        }
        
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        newCheckbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            const taskName = taskItem.getAttribute('data-task-name');
            const category = taskItem.getAttribute('data-category');
            
            const tasks = getSavedTasks();
            const task = tasks.find(t => t.name === taskName && t.category === category);
            const assignee = task ? task.assignee : '';
            

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
    });
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
        subtitle.textContent = `${completedTasks} из ${totalTasks} задач выполнено`;
    }

    updateDashboardMetrics(totalTasks, completedTasks, inProgressTasks, totalPoints);
    updateFamilyStats();
    updateWeeklyGoals(confirmedTasks);
    updateActivityChart();
    
    if (typeof updateNotifications === 'function') {
        updateNotifications();
    }
}

function generateAllTasksGrid() {
    const tasks = getSavedTasks();
    const categories = {
        cleaning: { name: 'Уборка', icon: '⚲', color: 'purple', tasks: [] },
        cooking: { name: 'Готовка', icon: '⚍', color: 'orange', tasks: [] },
        shopping: { name: 'Покупки', icon: '⚐', color: 'green', tasks: [] },
        kids: { name: 'Дети', icon: '◉', color: 'pink', tasks: [] },
        pets: { name: 'Питомцы', icon: '◈', color: 'yellow', tasks: [] },
        finance: { name: 'Финансы', icon: '$', color: 'blue', tasks: [] }
    };
    
    tasks.forEach(task => {
        if (categories[task.category]) {
            categories[task.category].tasks.push(task);
        }
    });
    
    let html = '';
    for (const [key, cat] of Object.entries(categories)) {
        html += `
            <div class="category-card ${cat.color}">
                <div class="category-header">
                    <span class="category-icon">${cat.icon}</span>
                    <h4>${cat.name}</h4>
                </div>
                <span class="task-count">${cat.tasks.length} задач</span>
                <div class="tasks-list">
                    ${cat.tasks.map(task => {
                        const avatarSrc = getAvatarForMember(task.assignee);
                        const checkedClass = task.isChecked ? 'checked' : '';
                        const checkedAttr = task.isChecked ? 'checked' : '';
                        const confirmedClass = task.isConfirmed ? 'confirmed' : '';
                        return `
                            <label class="task-item ${checkedClass} ${confirmedClass}" data-task-name="${task.name}" data-category="${task.category}">
                                <input type="checkbox" ${checkedAttr} ${task.isConfirmed ? 'disabled' : ''}>
                                <span>${task.name}</span>
                                <img src="${avatarSrc}" alt="${task.assignee}" class="task-avatar">
                            </label>
                        `;
                    }).join('')}
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
        const checkbox = item.querySelector('input[type="checkbox"]');
        const isChecked = checkbox && checkbox.checked;
        
        if (status === 'all') {
            item.style.display = 'flex';
        } else if (status === 'active' && !isChecked) {
            item.style.display = 'flex';
        } else if (status === 'completed' && isChecked) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}


function saveDefaultTasksState() {
    const defaultTasks = {};
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const taskName = taskItem.querySelector('span')?.textContent;
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        const isChecked = checkbox?.checked || false;
        const category = taskItem.closest('.category-card')?.querySelector('h4')?.textContent || '';
        
        if (!taskItem.hasAttribute('data-task-name') && taskName) {
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
        const taskName = taskItem.querySelector('span')?.textContent;
        const category = taskItem.closest('.category-card')?.querySelector('h4')?.textContent || '';
        const key = `${category}_${taskName}`;
        
        if (defaultTasks[key] === true && taskName) {
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
                taskItem.classList.add('checked');
            }
        }
    });
}


window.filterTasks = filterTasks;
window.showNewTaskModal = showNewTaskModal;
window.closeTaskModal = closeTaskModal;
window.createTask = createTask;
window.addTaskToCategory = addTaskToCategory;
window.saveTask = saveTask;
window.getSavedTasks = getSavedTasks;
window.saveTasks = saveTasks;
window.loadSavedTasks = loadSavedTasks;
window.updateTaskStatus = updateTaskStatus;
window.removeTaskFromStorage = removeTaskFromStorage;
window.deleteTask = deleteTask;
window.confirmTask = confirmTask;
window.updateCategoryVisibility = updateCategoryVisibility;
window.updateAllTaskCounts = updateAllTaskCounts;
window.reinitializeTaskListeners = reinitializeTaskListeners;
window.generateAllTasksGrid = generateAllTasksGrid;
window.filterTasksByStatus = filterTasksByStatus;
window.saveDefaultTasksState = saveDefaultTasksState;
window.loadDefaultTasksState = loadDefaultTasksState;
