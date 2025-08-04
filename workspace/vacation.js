let vacations = JSON.parse(localStorage.getItem('vacations')) || [];
let currentViewMonth = new Date();

const vacationTypes = {
    regular: { name: '정기휴가', icon: '🏖️', color: '#4a9eff', totalDays: 21 },
    reward: { name: '포상휴가', icon: '🎖️', color: '#4aff4a', totalDays: 10 },
    consolation: { name: '위로휴가', icon: '💝', color: '#ff9a4a', totalDays: 5 },
    special: { name: '특별휴가', icon: '⭐', color: '#ff4aff', totalDays: 0 }
};

function addVacation(e) {
    e.preventDefault();
    
    const type = document.getElementById('vacationType').value;
    const name = document.getElementById('vacationName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const memo = document.getElementById('vacationMemo').value.trim();
    
    // 날짜 유효성 검사
    if (new Date(startDate) > new Date(endDate)) {
        showNotification('시작일은 종료일보다 이전이어야 합니다.', 'error');
        return;
    }
    
    // 휴가 일수 계산
    const days = calculateDays(startDate, endDate);
    
    // 휴가 일수 체크
    const usedDays = getUsedDaysByType(type);
    const totalDays = vacationTypes[type].totalDays;
    if (totalDays > 0 && usedDays + days > totalDays) {
        showNotification(`${vacationTypes[type].name}의 남은 일수를 초과합니다.`, 'error');
        return;
    }
    
    const vacation = {
        id: Date.now(),
        type: type,
        name: name,
        startDate: startDate,
        endDate: endDate,
        days: days,
        memo: memo,
        status: getVacationStatus(startDate, endDate),
        createdAt: new Date().toISOString()
    };
    
    vacations.push(vacation);
    saveVacations();
    displayVacations();
    updateSummary();
    updateCalendar();
    document.getElementById('vacationForm').reset();
    
    showNotification(`${days}일의 휴가가 추가되었습니다!`, 'success');
}

function getVacationStatus(startDate, endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < now) return 'completed';
    if (start <= now && end >= now) return 'ongoing';
    return 'planned';
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getUsedDaysByType(type) {
    return vacations
        .filter(v => v.type === type && (v.status === 'completed' || v.status === 'ongoing'))
        .reduce((sum, v) => sum + v.days, 0);
}

function deleteVacation(id) {
    const vacation = vacations.find(v => v.id === id);
    if (!vacation) return;
    
    if (confirm(`"${vacation.name}" 휴가를 삭제하시겠습니까?`)) {
        vacations = vacations.filter(v => v.id !== id);
        saveVacations();
        displayVacations();
        updateSummary();
        updateCalendar();
        showNotification('휴가가 삭제되었습니다.', 'info');
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
    
    // 날짜순 정렬
    vacations.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    list.innerHTML = vacations.map(v => {
        const typeInfo = vacationTypes[v.type];
        const dDay = calculateDDay(v.startDate);
        
        let statusBadge = '';
        let statusClass = '';
        if (v.status === 'completed') {
            statusBadge = '<span class="vacation-status status-completed">완료</span>';
            statusClass = 'completed';
        } else if (v.status === 'ongoing') {
            statusBadge = '<span class="vacation-status status-ongoing">진행중</span>';
            statusClass = 'ongoing';
        } else if (dDay >= 0) {
            statusBadge = `<span class="vacation-status status-planned">D-${dDay}</span>`;
        }
        
        return `
            <div class="vacation-item type-${v.type} ${statusClass}">
                <div class="vacation-header">
                    <div class="vacation-info">
                        <div class="vacation-title">${v.name}</div>
                        <div class="vacation-badges">
                            <span class="vacation-type type-${v.type}" style="background: ${typeInfo.color}; color: white;">
                                ${typeInfo.icon} ${typeInfo.name}
                            </span>
                            <span class="vacation-days">${v.days}일</span>
                            ${statusBadge}
                        </div>
                        <div class="vacation-dates">
                            📅 ${formatDate(v.startDate)} ~ ${formatDate(v.endDate)}
                        </div>
                        ${v.status === 'planned' && dDay <= 7 ? 
                            `<div class="vacation-countdown">⏰ ${dDay}일 후 시작</div>` : ''}
                    </div>
                    <button class="delete" onclick="deleteVacation(${v.id})">삭제</button>
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

function calculateDDay(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
    
    // 종류별 사용일수 계산
    const typeUsage = {
        regular: { used: 0, planned: 0 },
        reward: { used: 0, planned: 0 },
        consolation: { used: 0, planned: 0 },
        special: { used: 0, planned: 0 }
    };
    
    vacations.forEach(v => {
        if (v.status === 'completed') {
            usedDays += v.days;
            typeUsage[v.type].used += v.days;
        } else if (v.status === 'planned') {
            plannedDays += v.days;
            typeUsage[v.type].planned += v.days;
        } else if (v.status === 'ongoing') {
            const start = new Date(v.startDate);
            const elapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
            usedDays += elapsed;
            plannedDays += v.days - elapsed;
            typeUsage[v.type].used += elapsed;
            typeUsage[v.type].planned += v.days - elapsed;
        }
    });
    
    const totalDays = Object.values(vacationTypes).reduce((sum, type) => sum + type.totalDays, 0);
    const remainingDays = totalDays - usedDays - plannedDays;
    
    // 요약 카드 업데이트
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('usedDays').textContent = usedDays;
    document.getElementById('remainingDays').textContent = remainingDays;
    document.getElementById('plannedDays').textContent = plannedDays;
    
    // 종류별 프로그레스 업데이트
    ['regular', 'reward', 'consolation'].forEach(type => {
        const total = vacationTypes[type].totalDays;
        const used = typeUsage[type].used;
        const percent = total > 0 ? (used / total) * 100 : 0;
        
        document.getElementById(`${type}Text`).textContent = `${used} / ${total}일`;
        const bar = document.getElementById(`${type}Bar`);
        bar.style.width = `${percent}%`;
        bar.textContent = percent > 20 ? `${Math.round(percent)}%` : '';
    });
}

function updateCalendar() {
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('calendarTitle').textContent = `${year}년 ${monthNames[month]} 휴가 캘린더`;
    
    const calendarView = document.getElementById('calendarView');
    let html = '<div class="month-grid">';
    
    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const color = (index === 0 || index === 6) ? 'var(--danger)' : 'var(--text-secondary)';
        html += `<div style="font-weight: bold; color: ${color}; text-align: center;">${day}</div>`;
    });
    
    // 빈 칸
    for (let i = 0; i < startDay; i++) {
        html += '<div></div>';
    }
    
    // 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        let classes = ['day-cell'];
        let title = '';
        
        // 휴가 체크
        const vacation = vacations.find(v => {
            const start = new Date(v.startDate);
            const end = new Date(v.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        if (vacation) {
            classes.push('vacation');
            title = vacation.name;
            
            // 시작일/종료일 체크
            if (dateStr === vacation.startDate && dateStr === vacation.endDate) {
                classes.push('vacation-single');
            } else if (dateStr === vacation.startDate) {
                classes.push('vacation-start');
            } else if (dateStr === vacation.endDate) {
                classes.push('vacation-end');
            }
        }
        
        // 오늘 표시
        if (currentDate.getTime() === today.getTime()) {
            classes.push('today');
        }
        
        // 주말 표시
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            classes.push('weekend');
        }
        
        html += `<div class="${classes.join(' ')}" ${title ? `title="${title}"` : ''}>${day}</div>`;
    }
    
    html += '</div>';
    calendarView.innerHTML = html;
}

function changeMonth(direction) {
    if (direction === 0) {
        currentViewMonth = new Date();
    } else {
        currentViewMonth.setMonth(currentViewMonth.getMonth() + direction);
    }
    updateCalendar();
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    // 타입별 색상
    const colors = {
        success: 'var(--secondary)',
        error: 'var(--danger)',
        info: 'var(--primary)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 이벤트 리스너
document.getElementById('vacationForm').addEventListener('submit', addVacation);

// 시작일 변경시 종료일 최소값 설정
document.getElementById('startDate').addEventListener('change', function() {
    document.getElementById('endDate').min = this.value;
    if (!document.getElementById('endDate').value) {
        document.getElementById('endDate').value = this.value;
    }
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    displayVacations();
    updateSummary();
    updateCalendar();
    
    // 오늘 날짜로 시작일 기본값 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
});