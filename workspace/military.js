let militaryData = JSON.parse(localStorage.getItem('militaryData'));
let currentViewMonth = new Date();

// 동기부여 문구 배열
const motivationalQuotes = [
    "오늘도 하루 더 가까워졌습니다! 💪",
    "당신의 복무는 의미 있습니다. 🎖️",
    "매일이 전역에 한 걸음 더! 🚶",
    "지금의 노력이 미래의 자산이 됩니다. ⭐",
    "오늘도 수고하셨습니다! 👏",
    "시간은 당신 편입니다. ⏰",
    "끝이 보이기 시작했어요! 🌅",
    "당신은 더 강해지고 있습니다. 💪",
    "전우들과 함께라면 못할 게 없죠! 🤝",
    "집념은 반드시 보상받습니다. 🎯"
];

// 공휴일 데이터 (간단한 예시)
const holidays = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '크리스마스'
};

function saveMilitaryInfo(e) {
    e.preventDefault();
    
    const enlistDate = document.getElementById('enlistDate').value;
    const serviceMonths = parseInt(document.getElementById('serviceType').value);
    
    militaryData = {
        enlistDate: enlistDate,
        serviceMonths: serviceMonths,
        dischargeDate: calculateDischargeDate(enlistDate, serviceMonths)
    };
    
    localStorage.setItem('militaryData', JSON.stringify(militaryData));
    showMilitaryInfo();
}

function calculateDischargeDate(enlistDate, months) {
    const date = new Date(enlistDate);
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() - 1); // 전역일은 복무 마지막 날
    return date.toISOString().split('T')[0];
}

function showMilitaryInfo() {
    if (!militaryData) {
        document.getElementById('setupForm').style.display = 'block';
        document.getElementById('militaryInfo').style.display = 'none';
        return;
    }
    
    document.getElementById('setupForm').style.display = 'none';
    document.getElementById('militaryInfo').style.display = 'block';
    
    updateCountdown();
    updateCalendar();
    updateMilestones();
    setRandomQuote();
    
    // 1분마다 업데이트
    setInterval(() => {
        updateCountdown();
        if (new Date().getDate() === 1) {
            updateCalendar(); // 날짜가 바뀌면 캘린더 업데이트
        }
    }, 60000);
}

function updateCountdown() {
    const now = new Date();
    const enlistDate = new Date(militaryData.enlistDate);
    const dischargeDate = new Date(militaryData.dischargeDate);
    
    const totalDays = Math.ceil((dischargeDate - enlistDate) / (1000 * 60 * 60 * 24));
    const servedDays = Math.ceil((now - enlistDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((dischargeDate - now) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(100, Math.max(0, (servedDays / totalDays) * 100));
    
    // 남은 주말 계산
    let weekends = 0;
    let current = new Date(now);
    while (current <= dischargeDate) {
        if (current.getDay() === 0 || current.getDay() === 6) {
            weekends++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    // 오늘까지 복무한 일수
    const todayServed = Math.floor(servedDays);
    
    // UI 업데이트
    document.getElementById('remainingDays').textContent = 
        remainingDays > 0 ? `D-${remainingDays}` : '전역!';
    
    document.getElementById('dischargeDate').textContent = 
        `전역일: ${formatDate(militaryData.dischargeDate)}`;
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `${progress.toFixed(1)}% 완료`;
    
    document.getElementById('servedDays').textContent = servedDays;
    document.getElementById('remainingWeekends').textContent = weekends;
    document.getElementById('percentComplete').textContent = progress.toFixed(1) + '%';
    document.getElementById('todayServed').textContent = todayServed + '일';
    
    // 전역이 가까워질수록 애니메이션 속도 증가
    if (remainingDays <= 30) {
        document.querySelector('.days-display').style.animationDuration = '1s';
    } else if (remainingDays <= 100) {
        document.querySelector('.days-display').style.animationDuration = '1.5s';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function updateMilestones() {
    const milestones = [10, 25, 30, 50, 70, 75, 90, 95, 100];
    const now = new Date();
    const enlistDate = new Date(militaryData.enlistDate);
    const dischargeDate = new Date(militaryData.dischargeDate);
    
    const totalDays = Math.ceil((dischargeDate - enlistDate) / (1000 * 60 * 60 * 24));
    const servedDays = Math.ceil((now - enlistDate) / (1000 * 60 * 60 * 24));
    const currentProgress = (servedDays / totalDays) * 100;
    
    const milestoneGrid = document.getElementById('milestoneGrid');
    milestoneGrid.innerHTML = milestones.map(milestone => {
        const isCompleted = currentProgress >= milestone;
        return `
            <div class="milestone-item ${isCompleted ? 'completed' : ''}">
                <div class="milestone-percent">${milestone}%</div>
                <div class="milestone-label">${getMilestoneLabel(milestone)}</div>
            </div>
        `;
    }).join('');
}

function getMilestoneLabel(percent) {
    const labels = {
        10: '시작',
        25: '1/4',
        30: '적응완료',
        50: '절반',
        70: '후반기',
        75: '3/4',
        90: '끝이 보여',
        95: '곧 전역',
        100: '전역!'
    };
    return labels[percent] || `${percent}%`;
}

function updateCalendar() {
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('currentMonth').textContent = `${year}년 ${monthNames[month]}`;
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.color = 'var(--text-secondary)';
        if (index === 0 || index === 6) {
            dayHeader.style.color = 'var(--danger)';
        }
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // 빈 칸
    for (let i = 0; i < startDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }
    
    // 날짜
    const enlistDate = new Date(militaryData.enlistDate);
    const dischargeDate = new Date(militaryData.dischargeDate);
    const today = new Date();
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        dayCell.textContent = day;
        
        // 복무 기간 표시
        if (currentDate >= enlistDate && currentDate <= dischargeDate) {
            dayCell.classList.add('served');
        }
        
        // 오늘 표시
        if (currentDate.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }
        
        // 주말 표시
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            dayCell.classList.add('weekend');
        }
        
        // 공휴일 표시
        const monthDay = `${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        if (holidays[monthDay]) {
            dayCell.classList.add('holiday');
            dayCell.title = holidays[monthDay];
        }
        
        calendarGrid.appendChild(dayCell);
    }
}

function changeMonth(direction) {
    currentViewMonth.setMonth(currentViewMonth.getMonth() + direction);
    updateCalendar();
}

function setRandomQuote() {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    document.getElementById('motivationalQuote').textContent = quote;
}

function resetInfo() {
    if (confirm('복무 정보를 재설정하시겠습니까?')) {
        localStorage.removeItem('militaryData');
        militaryData = null;
        currentViewMonth = new Date();
        showMilitaryInfo();
    }
}

// 이벤트 리스너
document.getElementById('militaryForm').addEventListener('submit', saveMilitaryInfo);

// 초기 로드
showMilitaryInfo();