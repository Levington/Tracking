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

function generateFamilyDetailedCards() {
    return generateDetailedFamilyCards();
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
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23ddd' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='48'%3E%3F%3C/text%3E%3C/svg%3E" alt="Avatar" class="avatar-preview" id="newAvatarPreview">
                        <div class="avatar-buttons">
                            <label class="btn-upload-avatar" style="width: 100%;">
                                Загрузить фото
                                <input type="file" id="newAvatarUpload" accept="image/*" onchange="handleAvatarUpload(event, 'new')" style="display: none;">
                            </label>
                        </div>
                        <input type="hidden" id="newAvatarId" value="">
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

function addNewMember() {
    const name = document.getElementById('newMemberName').value;
    const role = document.getElementById('newMemberRole').value;
    const color = document.getElementById('newMemberColor').value;
    const avatarId = document.getElementById('newAvatarId').value;
    
    if (!name || !role || !color) {
        showNotification('Пожалуйста, заполните все поля', 'info');
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
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id) {
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Член семьи сохранен в БД');
            }
        })
        .catch(error => {
            console.error('❌ Ошибка сохранения в БД:', error);
        });
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
                            <label class="btn-upload-avatar" style="width: 100%;">
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
        showNotification('Пожалуйста, введите имя', 'info');
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

function handleAvatarUpload(event, mode) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'info');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Размер изображения не должен превышать 5 МБ', 'info');
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

function getMemberAvatar(memberName) {
    const members = getFamilyMembers();
    const member = members.find(m => m.name === memberName);
    if (member) {
        return (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
    }
    return 'https://i.pravatar.cc/150?img=1';
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
        container.innerHTML = '<p>Добавьте членов семьи</p>';
        return;
    }
    
    const updatedMembers = members.map(member => {
        const memberTasks = tasks.filter(t => t.assignee === member.name);
        const completedTasks = memberTasks.filter(t => t.isConfirmed).length;
        
        return {
            ...member,
            completedTasks,
            totalTasks: memberTasks.length
        };
    });
    

    container.innerHTML = updatedMembers.map(member => {
        const avatarSrc = (typeof member.avatar === 'string' && member.avatar.startsWith('data:')) 
            ? member.avatar 
            : `https://i.pravatar.cc/150?img=${member.avatar}`;
        
        return `
            <div class="member-card">
                <img src="${avatarSrc}" alt="${member.name}" class="avatar">
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p class="member-role">${member.role}</p>
                    <div class="member-stats">
                        <span class="stat">
                            <span class="stat-label">Задачи:</span>
                            <span class="stat-value ${member.color}">${member.completedTasks}/${member.totalTasks}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-label">Очки:</span>
                            <span class="stat-value ${member.color}">${member.points || 0}</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const familyKey = currentUser.familyName || currentUser.email || 'default';
    localStorage.setItem(`familyMembers_${familyKey}`, JSON.stringify(updatedMembers.map(m => ({
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        points: m.points,
        tasks: `${m.completedTasks}/${m.totalTasks}`,
        color: m.color
    }))));
}

function generateFamilyStats() {
    const members = getFamilyMembers();
    if (!members || members.length === 0) {
        return '<p>Добавьте членов семьи</p>';
    }
    return members.map(m => `
        <div class="family-stat-item">
            <h4>${m.name}</h4>
            <p>Очки: ${m.points || 0}</p>
        </div>
    `).join('');
}

function updateFamilyStats() {
    const tasks = getSavedTasks();
    const familyMembers = getFamilyMembers();
    
    familyMembers.forEach(member => {
        const memberTasks = tasks.filter(t => t.assignee === member.name);
        const totalTasks = memberTasks.length;
        const completedTasks = memberTasks.filter(t => t.isChecked).length;
        const confirmedTasks = memberTasks.filter(t => t.isConfirmed).length;
        
        member.totalTasks = totalTasks;
        member.completedTasks = completedTasks;
        member.tasks = `${completedTasks}/${totalTasks}`;
        member.points = confirmedTasks * 10;
    });
    
    saveFamilyMembers(familyMembers);
    
    const statItems = document.querySelectorAll('.family-stat-item');
    statItems.forEach(item => {
        const nameElement = item.querySelector('h4');
        if (!nameElement) return;
        
        const memberName = nameElement.textContent;
        const member = familyMembers.find(m => m.name === memberName);
        
        if (member) {
            const tasksMetric = item.querySelector('.family-stat-metric:nth-child(1) .metric-value');
            const completionMetric = item.querySelector('.family-stat-metric:nth-child(2) .metric-value');
            const pointsMetric = item.querySelector('.family-stat-metric:nth-child(3) .metric-value');
            
            if (tasksMetric) {
                tasksMetric.textContent = `${member.completedTasks}/${member.totalTasks}`;
            }
            
            if (completionMetric) {
                const completionRate = member.totalTasks > 0 
                    ? Math.round((member.completedTasks / member.totalTasks) * 100)
                    : 0;
                completionMetric.textContent = `${completionRate}%`;
            }
            
            if (pointsMetric) {
                pointsMetric.textContent = member.points;
            }
        }
    });
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


window.getFamilyMembers = getFamilyMembers;
window.saveFamilyMembers = saveFamilyMembers;
window.showFamilyPage = showFamilyPage;
window.showAddMemberModal = showAddMemberModal;
window.closeAddMemberModal = closeAddMemberModal;
window.addNewMember = addNewMember;
window.editMember = editMember;
window.closeEditMemberModal = closeEditMemberModal;
window.saveMemberEdit = saveMemberEdit;
window.deleteMember = deleteMember;
window.getMemberAvatar = getMemberAvatar;
window.changeAvatar = changeAvatar;
window.changeNewAvatar = changeNewAvatar;
window.handleAvatarUpload = handleAvatarUpload;
window.generateFamilyDetailedCards = generateFamilyDetailedCards;
window.generateDetailedFamilyCards = generateDetailedFamilyCards;
window.generateFamilyStats = generateFamilyStats;
window.updateDashboardAvatars = updateDashboardAvatars;
window.updateAllAvatars = updateAllAvatars;
window.updateAvatarMap = updateAvatarMap;
window.updateDashboardMembers = updateDashboardMembers;
window.initializeCustomAvatars = initializeCustomAvatars;
