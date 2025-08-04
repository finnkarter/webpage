let routine = JSON.parse(localStorage.getItem('routine')) || {};
let draggedActivity = null;

// 시간대 생성
function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';
    
    for (let hour = 5; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const timeBlock = document.createElement('div');
            timeBlock.className = 'time-block';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = timeKey;
            
            const activitySlot = document.createElement('div');
            activitySlot.className = 'activity-slot';
            activitySlot.dataset.time = timeKey;
            
            // 현재 시간 강조
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${(Math.floor(now.getMinutes() / 30) * 30).toString().padStart(2, '0')}`;
            if (timeKey === currentTime) {
                activitySlot.classList.add('current');
            }
            
            // 저장된 활동 표시
            if (routine[timeKey]) {
                const activity = routine[timeKey];
                activitySlot.classList.add('active');
                activitySlot.innerHTML = `
                    <span>${activity.icon} ${activity.name}</span>
                    <button class="delete" style="position: absolute; right: 10px; padding: 5px 10px;" 
                            onclick="removeActivity('${timeKey}')">×</button>
                `;
            }
            
            // 드래그 앤 드롭 이벤트
            activitySlot.addEventListener('dragover', handleDragOver);
            activitySlot.addEventListener('drop', handleDrop);
            activitySlot.addEventListener('click', () => handleSlotClick(timeKey));
            
            timeBlock.appendChild(timeLabel);
            timeBlock.appendChild(activitySlot);
            container.appendChild(timeBlock);
        }
    }
    
    updateStats();
}

// 드래그 시작
document.addEventListener('DOMContentLoaded', () => {
    const templates = document.querySelectorAll('.template-item');
    templates.forEach(template => {
        template.addEventListener('dragstart', handleDragStart);
        template.addEventListener('dragend', handleDragEnd);
    });
    
    generateTimeSlots();
    updateCurrentTime();
    setInterval(updateCurrentTime, 30000); // 30초마다 현재 시간 업데이트
});

function handleDragStart(e) {
    draggedActivity = JSON.parse(e.target.dataset.activity);
    e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
    e.target.style.opacity = '';
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'var(--primary)';
    e.currentTarget.style.opacity = '0.5';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.opacity = '';
    
    const timeKey = e.currentTarget.dataset.time;
    if (draggedActivity && timeKey) {
        addActivity(timeKey, draggedActivity);
    }
}

// 활동 추가
function addActivity(timeKey, activity) {
    routine[timeKey] = activity;
    saveRoutine();
    generateTimeSlots();
}

// 활동 제거
function removeActivity(timeKey) {
    delete routine[timeKey];
    saveRoutine();
    generateTimeSlots();
}

// 슬롯 클릭 처리
function handleSlotClick(timeKey) {
    if (!routine[timeKey]) {
        const activity = prompt('활동을 입력하세요:');
        if (activity) {
            routine[timeKey] = {
                name: activity,
                icon: '📌',
                type: 'personal'
            };
            saveRoutine();
            generateTimeSlots();
        }
    }
}

// 루틴 저장
function saveRoutine() {
    localStorage.setItem('routine', JSON.stringify(routine));
}

// 프리셋 로드
function loadPreset(type) {
    const presets = {
        weekday: {
            '06:00': { name: '기상/세면', icon: '🌅', type: 'personal' },
            '06:30': { name: '아침식사', icon: '🍳', type: 'meal' },
            '07:00': { name: '일과준비', icon: '👔', type: 'work' },
            '08:00': { name: '오전근무', icon: '💼', type: 'work' },
            '10:00': { name: '휴식', icon: '☕', type: 'rest' },
            '10:30': { name: '오전근무', icon: '💼', type: 'work' },
            '12:00': { name: '점심식사', icon: '🍱', type: 'meal' },
            '13:00': { name: '휴식', icon: '😴', type: 'rest' },
            '14:00': { name: '오후근무', icon: '💼', type: 'work' },
            '16:00': { name: '체력단련', icon: '💪', type: 'personal' },
            '17:00': { name: '개인정비', icon: '🧹', type: 'personal' },
            '18:00': { name: '저녁식사', icon: '🍽️', type: 'meal' },
            '19:00': { name: '자유시간', icon: '🎮', type: 'rest' },
            '21:00': { name: '개인정비', icon: '🚿', type: 'personal' },
            '22:00': { name: '취침준비', icon: '🌙', type: 'personal' }
        },
        weekend: {
            '07:00': { name: '기상/세면', icon: '🌅', type: 'personal' },
            '08:00': { name: '아침식사', icon: '🍳', type: 'meal' },
            '09:00': { name: '자유시간', icon: '📱', type: 'rest' },
            '11:00': { name: '외출준비', icon: '👔', type: 'personal' },
            '12:00': { name: '점심식사', icon: '🍱', type: 'meal' },
            '13:00': { name: '외출/자유', icon: '🚶', type: 'rest' },
            '18:00': { name: '저녁식사', icon: '🍽️', type: 'meal' },
            '19:00': { name: '자유시간', icon: '🎮', type: 'rest' },
            '22:00': { name: '취침준비', icon: '🌙', type: 'personal' }
        },
        training: {
            '05:30': { name: '기상/세면', icon: '🌅', type: 'personal' },
            '06:00': { name: '아침점호', icon: '📢', type: 'work' },
            '06:30': { name: '아침식사', icon: '🍳', type: 'meal' },
            '07:00': { name: '훈련준비', icon: '🎖️', type: 'work' },
            '08:00': { name: '훈련', icon: '🏃', type: 'work' },
            '12:00': { name: '점심식사', icon: '🍱', type: 'meal' },
            '13:00': { name: '훈련', icon: '🏃', type: 'work' },
            '17:00': { name: '훈련정리', icon: '🧹', type: 'work' },
            '18:00': { name: '저녁식사', icon: '🍽️', type: 'meal' },
            '19:00': { name: '개인정비', icon: '🚿', type: 'personal' },
            '20:00': { name: '자유시간', icon: '📖', type: 'rest' },
            '21:30': { name: '취침준비', icon: '🌙', type: 'personal' }
        }
    };
    
    if (presets[type]) {
        routine = presets[type];
        saveRoutine();
        generateTimeSlots();
    }
}

// 루틴 초기화
function clearRoutine() {
    if (confirm('모든 일과를 삭제하시겠습니까?')) {
        routine = {};
        saveRoutine();
        generateTimeSlots();
    }
}

// 통계 업데이트
function updateStats() {
    const stats = {
        work: 0,
        rest: 0,
        meal: 0,
        personal: 0
    };
    
    Object.values(routine).forEach(activity => {
        if (activity.type) {
            stats[activity.type] = (stats[activity.type] || 0) + 30; // 30분 단위
        }
    });
    
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    
    // 퍼센트 계산 및 표시
    Object.keys(stats).forEach(type => {
        const percent = total > 0 ? Math.round((stats[type] / total) * 100) : 0;
        document.getElementById(`${type}Percent`).textContent = `${percent}%`;
        document.getElementById(`${type}Bar`).style.width = `${percent}%`;
    });
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const slots = document.querySelectorAll('.activity-slot');
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${(Math.floor(now.getMinutes() / 30) * 30).toString().padStart(2, '0')}`;
    
    slots.forEach(slot => {
        slot.classList.remove('current');
        if (slot.dataset.time === currentTime) {
            slot.classList.add('current');
        }
    });
}