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
        showNotification('Пароль должен быть не менее 6 символов', 'info');
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
            

            const familyKey = data.user.familyName || data.user.email || 'default';
            const familyMember = {
                name: data.user.name,
                role: 'Родитель',
                avatar: '1',
                points: 0,
                tasks: '0/0',
                color: 'purple'
            };
            localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify([familyMember]));
            
            showMainApp(data.user);
            showNotification('Регистрация успешна!', 'success');
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
        showNotification('Пароль должен быть не менее 6 символов', 'info');
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
            showNotification('Регистрация успешна!', 'success');
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

function logout() {
    handleLogout();
}

function showMainApp(userData) {
    hideAuthModal();
    document.getElementById('familyNameDisplay').textContent = userData.familyName || userData.name || 'Семья';
    
    if (userData.role) {
        applyRoleRestrictions(userData.role);
    }
    
    if (userData.id) {

        const userIdToLoad = (userData.role === 'child' && userData.parentId) 
            ? userData.parentId 
            : userData.id;
        
        loadFamilyMembersFromDB(userIdToLoad);
        loadTasksFromDB(userIdToLoad);
    }
    
    setTimeout(() => {
        updateTaskProgress();
        updateDashboardAvatars();
        updateDashboardMembers();
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
        
        const settingsNavItem = document.querySelector('.nav-item[onclick*="showSettingsPage"]');
        if (settingsNavItem) {
            settingsNavItem.style.opacity = '0.5';
            settingsNavItem.style.pointerEvents = 'none';
        }
        
        const reportsNavItem = document.querySelector('.nav-item[onclick*="showReportsPage"]');
        if (reportsNavItem) {
            reportsNavItem.style.display = 'none';
        }
    } else {
        const addTaskBtn = document.querySelector('.btn-primary');
        if (addTaskBtn) {
            addTaskBtn.style.display = 'flex';
        }
    }
}

function loadFamilyMembersFromDB(userId) {
    console.log('Loading family members for userId:', userId);
    fetch(`http://localhost:3000/api/family-members/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.members) {
                console.log('✅ Члены семьи загружены из БД:', data.members);
                saveFamilyMembers(data.members);
                updateDashboardMembers();
            } else {
                console.log('ℹ️ Члены семьи не найдены или произошла ошибка:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Ошибка при загрузке членов семьи:', error);
        });
}

function loadTasksFromDB(userId) {
    console.log('Loading tasks for userId:', userId);
    fetch(`http://localhost:3000/api/tasks/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.tasks) {
                console.log('✅ Задачи загружены из БД:', data.tasks);
                
                const transformedTasks = data.tasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    category: task.category,
                    assignee: task.assignee,
                    period: task.period,
                    isChecked: task.is_checked === 1,
                    isConfirmed: task.is_confirmed === 1,
                    confirmedBy: task.confirmed_by
                }));
                
                saveTasks(transformedTasks);
                loadSavedTasks();
                updateTaskProgress();
                
                if (typeof updateNotifications === 'function') {
                    updateNotifications();
                }
            } else {
                console.log('ℹ️ Задачи не найдены или ошибка:', data.message);
            }
        })
        .catch(error => {
            console.error('❌ Ошибка при загрузке задач:', error);
        });
}


window.checkAuth = checkAuth;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.handleRoleChange = handleRoleChange;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.registerParent = registerParent;
window.registerChild = registerChild;
window.logout = logout;
window.showMainApp = showMainApp;
window.applyRoleRestrictions = applyRoleRestrictions;
window.loadFamilyMembersFromDB = loadFamilyMembersFromDB;
window.loadTasksFromDB = loadTasksFromDB;
