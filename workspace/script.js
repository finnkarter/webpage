// 전역 변수
let vacations = [];
let todos = [];
let currentFilter = 'all';

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // 1분마다 시간 업데이트
    
    // 네비게이션 이벤트 리스너
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Enter 키 이벤트 리스너
    document.getElementById('todoTitle').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    document.getElementById('vacationTitle').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addVacation();
        }
    });
});

// 페이지 전환
function switchPage(pageName) {
    // 모든 페이지 숨기기
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 모든 네비게이션 버튼 비활성화
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // 선택된 페이지 표시
    document.getElementById(pageName).classList.add('active');
    
    // 선택된 네비게이션 버튼 활성화
    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 페이지별 특별한 동작
    if (pageName === 'home') {
        updateStats();
    } else if (pageName === 'vacation') {
        displayVacations();
    } else if (pageName === 'todo') {
        displayTodos();
    } else if (pageName === 'weather') {
        updateWeather();
    }
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    }) + ' ' + now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 통계 업데이트
function updateStats() {
    const vacationCount = vacations.length;
    const todoCount = todos.filter(todo => !todo.completed).length;
    const currentTemp = document.getElementById('currentTemperature').value;
    
    document.getElementById('vacationCount').textContent = vacationCount;
    document.getElementById('todoCount').textContent = todoCount;
    document.getElementById('currentTemp').textContent = currentTemp + '°C';
}

// 휴가 계획 추가
function addVacation() {
    const title = document.getElementById('vacationTitle').value.trim();
    const startDate = document.getElementById('vacationStart').value;
    const endDate = document.getElementById('vacationEnd').value;
    const location = document.getElementById('vacationLocation').value.trim();
    const budget = document.getElementById('vacationBudget').value;
    const notes = document.getElementById('vacationNotes').value.trim();
    
    if (!title || !startDate || !endDate) {
        alert('제목, 시작일, 종료일은 필수 입력 항목입니다.');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('시작일은 종료일보다 이전이어야 합니다.');
        return;
    }
    
    const vacation = {
        id: Date.now(),
        title,
        startDate,
        endDate,
        location,
        budget: budget ? parseInt(budget) : 0,
        notes,
        createdAt: new Date().toISOString()
    };
    
    vacations.push(vacation);
    saveData();
    displayVacations();
    clearVacationForm();
    updateStats();
    
    alert('휴가 계획이 추가되었습니다!');
}

// 휴가 계획 표시
function displayVacations() {
    const vacationList = document.getElementById('vacationList');
    
    if (vacations.length === 0) {
        vacationList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">아직 등록된 휴가 계획이 없습니다.</div>';
        return;
    }
    
    vacationList.innerHTML = vacations.map(vacation => {
        const startDate = new Date(vacation.startDate).toLocaleDateString('ko-KR');
        const endDate = new Date(vacation.endDate).toLocaleDateString('ko-KR');
        const budget = vacation.budget ? vacation.budget.toLocaleString() + '원' : '미정';
        
        return `
            <div class="vacation-item">
                <div class="vacation-title">${vacation.title}</div>
                <div class="vacation-details">
                    <div class="vacation-detail">
                        <strong>📅 기간:</strong> ${startDate} ~ ${endDate}
                    </div>
                    <div class="vacation-detail">
                        <strong>📍 장소:</strong> ${vacation.location || '미정'}
                    </div>
                    <div class="vacation-detail">
                        <strong>💰 예산:</strong> ${budget}
                    </div>
                </div>
                ${vacation.notes ? `<div class="vacation-notes"><strong>📝 메모:</strong> ${vacation.notes}</div>` : ''}
                <div class="vacation-actions">
                    <button class="delete-btn" onclick="deleteVacation(${vacation.id})">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

// 휴가 계획 삭제
function deleteVacation(id) {
    if (confirm('정말로 이 휴가 계획을 삭제하시겠습니까?')) {
        vacations = vacations.filter(vacation => vacation.id !== id);
        saveData();
        displayVacations();
        updateStats();
    }
}

// 휴가 폼 초기화
function clearVacationForm() {
    document.getElementById('vacationTitle').value = '';
    document.getElementById('vacationStart').value = '';
    document.getElementById('vacationEnd').value = '';
    document.getElementById('vacationLocation').value = '';
    document.getElementById('vacationBudget').value = '';
    document.getElementById('vacationNotes').value = '';
}

// 날씨 업데이트
function updateWeather() {
    const location = document.getElementById('weatherLocation').value.trim();
    const temperature = document.getElementById('currentTemperature').value;
    const condition = document.getElementById('weatherCondition').value;
    const humidity = document.getElementById('humidity').value;
    const windSpeed = document.getElementById('windSpeed').value;
    
    if (!location || !temperature) {
        alert('지역과 온도는 필수 입력 항목입니다.');
        return;
    }
    
    const weatherIcons = {
        sunny: '☀️',
        cloudy: '☁️',
        rainy: '🌧️',
        snowy: '❄️',
        windy: '💨'
    };
    
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = `
        <div class="weather-card">
            <div class="weather-icon">${weatherIcons[condition]}</div>
            <div class="weather-temp">${temperature}°C</div>
            <div class="weather-location">${location}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span>습도</span>
                    <span>${humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span>풍속</span>
                    <span>${windSpeed} km/h</span>
                </div>
            </div>
        </div>
    `;
    
    updateStats();
}

// 할 일 추가
function addTodo() {
    const title = document.getElementById('todoTitle').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const dueDate = document.getElementById('todoDueDate').value;
    const category = document.getElementById('todoCategory').value.trim();
    
    if (!title) {
        alert('할 일을 입력해주세요.');
        return;
    }
    
    const todo = {
        id: Date.now(),
        title,
        priority,
        dueDate,
        category,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveData();
    displayTodos();
    clearTodoForm();
    updateStats();
}

// 할 일 표시
function displayTodos() {
    const todoList = document.getElementById('todoList');
    let filteredTodos = todos;
    
    if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }
    
    if (filteredTodos.length === 0) {
        const message = currentFilter === 'completed' ? '완료된 할 일이 없습니다.' :
                       currentFilter === 'pending' ? '진행 중인 할 일이 없습니다.' :
                       '등록된 할 일이 없습니다.';
        todoList.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">${message}</div>`;
        return;
    }
    
    todoList.innerHTML = filteredTodos.map(todo => {
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('ko-KR') : '미정';
        const priorityText = {
            high: '🔴 높음',
            medium: '🟡 보통',
            low: '🟢 낮음'
        };
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-priority ${todo.priority}">${priorityText[todo.priority]}</div>
                </div>
                <div class="todo-details">
                    <span>📅 마감일: ${dueDate}</span>
                    <span>🏷️ ${todo.category || '일반'}</span>
                </div>
                <div class="todo-actions">
                    <button class="complete-btn ${todo.completed ? 'completed' : ''}" 
                            onclick="toggleTodo(${todo.id})">
                        ${todo.completed ? '완료 취소' : '완료'}
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

// 할 일 완료/취소 토글
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveData();
        displayTodos();
        updateStats();
    }
}

// 할 일 삭제
function deleteTodo(id) {
    if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveData();
        displayTodos();
        updateStats();
    }
}

// 할 일 필터링
function filterTodos(filter) {
    currentFilter = filter;
    
    // 필터 버튼 상태 업데이트
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayTodos();
}

// 할 일 폼 초기화
function clearTodoForm() {
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoDueDate').value = '';
    document.getElementById('todoCategory').value = '';
    document.getElementById('todoPriority').value = 'medium';
}

// 데이터 저장 (브라우저 저장소 대신 메모리에만 저장)
function saveData() {
    // 실제 환경에서는 localStorage를 사용할 수 있지만,
    // 현재는 메모리에만 저장됩니다.
    // localStorage.setItem('vacations', JSON.stringify(vacations));
    // localStorage.setItem('todos', JSON.stringify(todos));
}

// 데이터 로드
function loadData() {
    // 실제 환경에서는 localStorage에서 데이터를 불러올 수 있습니다.
    // const savedVacations = localStorage.getItem('vacations');
    // const savedTodos = localStorage.getItem('todos');
    // 
    // if (savedVacations) {
    //     vacations = JSON.parse(savedVacations);
    // }
    // if (savedTodos) {
    //     todos = JSON.parse(savedTodos);
    // }
    
    // 현재는 빈 배열로 초기화
    vacations = [];
    todos = [];
}

// 유틸리티 함수들
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateDaysUntil(dateString) {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                switchPage('home');
                break;
            case '2':
                e.preventDefault();
                switchPage('vacation');
                break;
            case '3':
                e.preventDefault();
                switchPage('weather');
                break;
            case '4':
                e.preventDefault();
                switchPage('todo');
                break;
        }
    }
});