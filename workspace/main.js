// 인사말 설정
function setGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting');
    
    if (hour < 6) {
        greetingEl.textContent = '🌙 편안한 새벽입니다';
    } else if (hour < 12) {
        greetingEl.textContent = '☀️ 좋은 아침입니다!';
    } else if (hour < 18) {
        greetingEl.textContent = '🌤️ 활기찬 오후입니다!';
    } else {
        greetingEl.textContent = '🌆  고요한 저녁입니다';
    }
}

// 날짜 시간 업데이트
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    document.getElementById('datetime').textContent = 
        now.toLocaleString('ko-KR', options);
}

// 대시보드 통계 업데이트
function updateDashboardStats() {
    // 할 일 개수
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const incompleteTodos = todos.filter(t => !t.completed).length;
    document.getElementById('todayTasks').textContent = incompleteTodos;
    
    // 전역일
    const militaryData = JSON.parse(localStorage.getItem('militaryData'));
    if (militaryData) {
        const now = new Date();
        const discharge = new Date(militaryData.dischargeDate);
        const daysLeft = Math.ceil((discharge - now) / (1000 * 60 * 60 * 24));
        document.getElementById('daysLeft').textContent = 
            daysLeft > 0 ? `D-${daysLeft}` : '전역!';
    }
    
    // 날씨
    const weather = JSON.parse(localStorage.getItem('weather'));
    if (weather) {
        const weatherIcons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            snowy: '❄️',
            stormy: '⛈️'
        };
        document.getElementById('weatherPreview').innerHTML = 
            `${weatherIcons[weather.type]} ${weather.temp}°C`;
    }
    
    // 메모 개수
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    document.getElementById('notesCount').textContent = notes.length;
}

// 명언 배열
const quotes = [
    "오늘도 멋진 하루 되세요! 💪",
    "작은 진전이 모여 큰 변화를 만듭니다 🌱",
    "포기하지 마세요. 시작이 가장 어렵습니다 ⭐",
    "매일 조금씩 나아가고 있어요 🚀",
    "당신의 노력은 반드시 빛을 발할 거예요 ✨",
    "오늘의 최선이 내일의 기반이 됩니다 🏗️",
    "할 수 있다고 믿는 사람이 결국 해냅니다 🎯"
];

// 랜덤 명언 설정
function setRandomQuote() {
    const quoteEl = document.getElementById('quote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.textContent = quotes[randomIndex];
}

// 빠른 할 일 추가
function quickAddTodo() {
    const task = prompt('할 일을 입력하세요:');
    if (task && task.trim()) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push({
            id: Date.now(),
            text: task.trim(),
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('todos', JSON.stringify(todos));
        updateDashboardStats();
        alert('할 일이 추가되었습니다!');
    }
}

// 테마 토글
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'light') {
        document.documentElement.style.setProperty('--bg-dark', '#f0f0f0');
        document.documentElement.style.setProperty('--bg-card', '#ffffff');
        document.documentElement.style.setProperty('--bg-hover', '#e0e0e0');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        document.documentElement.style.setProperty('--border', '#ddd');
    } else {
        document.documentElement.style.setProperty('--bg-dark', '#0a0a0a');
        document.documentElement.style.setProperty('--bg-card', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-hover', '#2a2a2a');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--border', '#333');
    }
    
    localStorage.setItem('theme', newTheme);
}

// 초기 테마 로드
function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
        toggleTheme();
        toggleTheme(); // 두 번 호출하여 light 테마 적용
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    updateDateTime();
    updateDashboardStats();
    setRandomQuote();
    loadTheme();
    
    // 주기적 업데이트
    setInterval(updateDateTime, 1000);
    setInterval(setGreeting, 60000); // 1분마다 인사말 업데이트
    setInterval(updateDashboardStats, 30000); // 30초마다 통계 업데이트
});