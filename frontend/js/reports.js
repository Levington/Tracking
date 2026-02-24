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
        createdBy: currentUser.name || currentUser.username || 'Администратор'
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
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.color = 'black';
    
    const percentage = report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0;
    
    tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="font-size: 24px; margin-bottom: 20px; color: #333;">${report.title}</h1>
            
            <p style="font-size: 12px; color: #666; margin-bottom: 5px;"><strong>Дата создания:</strong> ${report.date}</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;"><strong>Создал:</strong> ${report.createdBy}</p>
            
            <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">ОБЩАЯ СТАТИСТИКА</h2>
            <p style="font-size: 14px; margin: 8px 0;"><strong>Всего задач:</strong> ${report.totalTasks}</p>
            <p style="font-size: 14px; margin: 8px 0;"><strong>Выполнено:</strong> ${report.completedTasks}</p>
            <p style="font-size: 14px; margin: 8px 0;"><strong>Процент выполнения:</strong> ${percentage}%</p>
            <p style="font-size: 14px; margin: 8px 0;"><strong>Всего очков:</strong> ${report.totalPoints}</p>
            
            <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px;">ПО ЧЛЕНАМ СЕМЬИ</h2>
            ${report.members.map(member => `
                <p style="font-size: 14px; margin: 8px 0;">
                    <strong>${member.name}:</strong> ${member.completedTasks} задач, ${member.points} очков
                </p>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        document.body.removeChild(tempDiv);
        
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        doc.save(`Отчёт_${report.date.replace(/[/:]/g, '-')}.pdf`);
        showNotification('Отчёт скачан в формате PDF!', 'success');
    }).catch(error => {
        document.body.removeChild(tempDiv);
        console.error('Ошибка при создании PDF:', error);
        showNotification('Ошибка при создании PDF', 'error');
    });
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

window.showReportsMenuForParent = showReportsMenuForParent;
window.showReportsPage = showReportsPage;
window.generateNewReport = generateNewReport;
window.viewReport = viewReport;
window.downloadReportTxt = downloadReportTxt;
window.downloadReportPDF = downloadReportPDF;
window.deleteReport = deleteReport;
