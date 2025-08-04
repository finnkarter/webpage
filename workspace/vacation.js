let vacations = JSON.parse(localStorage.getItem('vacations')) || [];

const vacationTypes = {
    regular: '정기휴가',
    reward: '포상휴가',
    consolation: '위로휴가',
    special: '특별휴가'
};

// 기본 휴가 일수 설정
const totalVacationDays = {
    regular: 21,
    reward: 10,
    consolation: 5,
    special: 0
};

function addVacation(e) {
    e.preventDefault();
    
    const vacation = {
        id: Date.now(),
        type: document.getElementById('vacationType').value,
        name: document.getElementById('vacationName').value || vacationTypes[document.getElementById('vacationType').value],
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        memo: document.getElementById('vacationMemo').value,
        status: getVacationStatus(document.getElementById('startDate').value, document.getElementById('endDate').value)
    };
    
    vacations.push(vacation);
    saveVacations();
    displayVacations();
    updateSummary();
    updateCalendar();
    document.getElementById('vacationForm').reset();
    
    showNotification('휴가가 추가되었습니다!');
}

function getVacationStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < now) return 'completed';
    if (start <= now && end >= now) return 'ongoing';
    return 'planned';
}

function deleteVacation(id) {
    if (confirm('이 휴가를 삭제하시겠습니까?')) {
        vacations = vacations.filter(v => v.id !== id);
        saveVacations();
        displayVacations();
        updateSummary();
        updateCalendar();
        showNotification('휴가가 삭제되었습니다.');
    }
}

function saveVacations() {
    localStorage.setItem('vacations', JSON.stringify(vacations));
}

function displayVacations() {
    const list = document.getElementById('vacationList');
    
    if (vacations.length === 0) {
        list.innerHTML = '<p style="color: #999; margin-left: 60px;">예정된 휴가가 없습니다.</p>';
        return;
    }
    
    vacations.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    list.innerHTML = vacations.map(v => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        let statusStyle = '';
        let statusText = '';
        if (v.status === 'completed') {
            statusStyle = 'opacity: 0.6;';
            statusText = '<span style="color: #999;">(완료)</span>';
        } else if (v.status === 'ongoing') {
            statusStyle = 'border: 2px solid var(--secondary);';
            statusText = '<span style="color: var(--secondary);">(진행중)</span>';
        }
        
        const dDay = Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24));
        const dDayText = v.status === 'planned' && dDay >= 0 ? `<span style="color: var(--warning);">D-${dDay}</span>` : '';
        
        return `
            <div class="vacation-item" style="${statusStyle}">
                <div class="vacation-header">
                    <div>
                        <span class="vacation-type type-${v.type}">${vacationTypes[v.type]}</span>
                        <span class="vacation-days">${days}일</span>
                        ${statusText}
                        ${dDayText}
                    </div>
                    <button class="delete" onclick="deleteVacation(${v.id})">삭제</button>
                </div>
                <h3 style="margin: 10px 0;">${v.name}</h3>
                <div class="vacation-dates">
                    ${formatDate(v.startDate)} ~ ${formatDate(v.endDate)}
                </div>
                ${v.memo ? `<div class="vacation-memo">${v.memo}</div>` : ''}
                ${v.status === 'ongoing' ? `
                    <div class="vacation-progress">
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${getProgress(v.startDate, v.endDate)}%"></div>
                        </div>
                        <small>${getProgress(v.startDate, v.endDate).toFixed(0)}% 진행</small>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function getProgress(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

function updateSummary() {
    const now = new Date();
    let usedDays = 0;
    let plannedDays = 0;
    
    vacations.forEach(v => {
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        if (v.status === 'completed') {
            usedDays += days;
        } else if (v.status === 'planned') {
            plannedDays += days;
        } else if (v.status === 'ongoing') {
            const elapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
            usedDays += elapsed;
            plannedDays += days - elapsed;
        }
    });
    
    const totalDays = Object.values(totalVacationDays).reduce((sum, days) => sum + days, 0);
    const remainingDays = totalDays - usedDays - plannedDays;
    
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('usedDays').textContent = usedDays;
    document.getElementById('remainingDays').textContent = remainingDays;
    document.getElementById('plannedDays').textContent = plannedDays;
}

function updateCalendar() {
    const calendarView = document.getElementById('calendarView');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    let html = `<h3>${year}년 ${monthNames[month]}</h3>`;
    html += '<div class="month-grid">';
    
    // 요일 헤더
    dayNames.forEach(day => {
        html += `<div style="font-weight: bold; color: var(--text-secondary);">${day}</div>`;
    });
    
    // 빈 칸
    for (let i = 0; i < startDay; i++) {
        html += '<div class="day-cell"></div>';
    }
    
    // 날짜
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const isVacation = vacations.some(v => {
            const start = new Date(v.startDate);
            const end = new Date(v.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        html += `<div class="day-cell ${isVacation ? 'vacation' : ''}">${day}</div>`;
    }
    
    html += '</div>';
    calendarView.innerHTML = html;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 이벤트 리스너
document.getElementById('vacationForm').addEventListener('submit', addVacation);

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    displayVacations();
    updateSummary();
    updateCalendar();
});