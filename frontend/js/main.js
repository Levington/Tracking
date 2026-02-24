window.customAvatars = {};
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(-100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes modalSlideIn {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
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
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    }
    
    .modal {
        background: white;
        padding: 30px;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .modal-header h3 {
        font-size: 20px;
        font-weight: 700;
        color: #2d3748;
        margin: 0;
    }
    
    .modal-body {
        margin-bottom: 20px;
    }
    
    .modal-footer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .modal-input,
    .modal-select,
    .modal-textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 15px;
        font-family: inherit;
        transition: all 0.3s ease;
    }
    
    .modal-input:focus,
    .modal-select:focus,
    .modal-textarea:focus {
        border-color: #667eea;
        outline: none;
    }
    
    .modal-textarea {
        resize: vertical;
        min-height: 80px;
    }
    
    .modal-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #4a5568;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #718096;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .close-modal:hover {
        background: #f7fafc;
        color: #2d3748;
    }
    
    .btn-secondary {
        padding: 10px 20px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #4a5568;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
    }
    
    .btn-danger {
        padding: 10px 20px;
        border: none;
        background: #f56565;
        color: white;
        border-radius: 8px;
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
    
    .task-dot {
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background: #667eea;
        border-radius: 50%;
    }
    
    .calendar-day.has-tasks {
        font-weight: 600;
        color: #667eea;
    }
`;
document.head.appendChild(style);


document.addEventListener('DOMContentLoaded', function() {
    console.log('рџљЂ DOMContentLoaded fired');
    

    if (!checkAuth()) {
        console.log('вќЊ User not authenticated');
        return;
    }
    
    console.log('вњ… User authenticated');


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
        newTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNewTaskModal();
        });
    }


    const navItems = document.querySelectorAll('.nav-item');
    console.log('рџ“Ќ Found nav items:', navItems.length);
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            

            const sectionName = this.querySelector('span:not(.nav-icon)')?.textContent?.trim();
            console.log('рџ”„ Navigating to:', sectionName);
            if (sectionName) {
                navigateToSection(sectionName);
            }
        });
    });


    console.log('рџ”§ Initializing components...');
    initializeCustomAvatars();
    loadSavedTasks();
    updateTaskProgress();
    animateProgressBars();
    setupCurrentSection();
    updateDashboardAvatars();
    updateWeekRange();
    showReportsMenuForParent();
    console.log('вњ… Application initialized successfully!');
});


function toggleTheme(checkbox) {
    if (checkbox.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('lightTheme', 'true');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('lightTheme', 'false');
    }
}

function initTheme() {
    const isLight = localStorage.getItem('lightTheme') === 'true';
    if (isLight) {
        document.body.classList.add('light-theme');
    }
}


window.toggleTheme = toggleTheme;
window.initTheme = initTheme;


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

