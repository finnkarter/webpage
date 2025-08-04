let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

function addTodo() {
    const input = document.getElementById('todoInput');
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;
    
    if (!input.value.trim()) {
        showNotification('할 일을 입력해주세요!', 'warning');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: input.value.trim(),
        completed: false,
        priority: priority,
        category: category,
        dueDate: dueDate,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    todos.unshift(todo); // 최신 항목이 위로
    saveTodos();
    displayTodos();
    updateStats();
    
    // 입력 필드 초기화
    input.value = '';
    document.getElementById('dueDateInput').value = '';
    
    showNotification('할 일이 추가되었습니다!', 'success');
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        saveTodos();
        displayTodos();
        updateStats();
        
        if (todo.completed) {
            showNotification('할 일을 완료했습니다! 🎉', 'success');
        }
    }
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newText = prompt('할 일 수정:', todo.text);
    if (newText && newText.trim()) {
        todo.text = newText.trim();
        todo.editedAt = new Date().toISOString();
        saveTodos();
        displayTodos();
        showNotification('할 일이 수정되었습니다!', 'info');
    }
}

function deleteTodo(id) {
    if (confirm('이 할 일을 삭제하시겠습니까?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        displayTodos();
        updateStats();
        showNotification('할 일이 삭제되었습니다!', 'info');
    }
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        showNotification('완료된 항목이 없습니다.', 'info');
        return;
    }
    
    if (confirm(`${completedCount}개의 완료된 항목을 삭제하시겠습니까?`)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        displayTodos();
        updateStats();
        showNotification(`${completedCount}개의 항목이 삭제되었습니다!`, 'success');
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function displayTodos() {
    const list = document.getElementById('todoList');
    
    // 필터링
    let filteredTodos = filterTodosByType(currentFilter);
    
    if (filteredTodos.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>${getEmptyMessage()}</h3>
                <p>새로운 할 일을 추가해보세요!</p>
            </div>
        `;
        return;
    }
    
    // 정렬: 미완료 우선, 우선순위 높은 순, 마감일 가까운 순
    filteredTodos.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        return 0;
    });
    
    list.innerHTML = filteredTodos.map(todo => {
        const dueStatus = getDueStatus(todo.dueDate);
        const priorityText = {
            high: '높음',
            medium: '보통',
            low: '낮음'
        };
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}">
                <label class="todo-checkbox">
                    <input type="checkbox" 
                           ${todo.completed ? 'checked' : ''}
                           onchange="toggleTodo(${todo.id})">
                    <span class="checkbox-custom"></span>
                </label>
                
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-meta">
                        <span class="todo-category">${todo.category}</span>
                        ${todo.dueDate ? `
                            <span class="todo-due-date ${dueStatus.class}">
                                📅 ${dueStatus.text}
                            </span>
                        ` : ''}
                        ${todo.editedAt ? '<span>✏️ 수정됨</span>' : ''}
                    </div>
                </div>
                
                <span class="priority-badge priority-${todo.priority}">
                    ${priorityText[todo.priority]}
                </span>
                
                <div class="todo-actions">
                    <button class="action-btn" onclick="editTodo(${todo.id})">수정</button>
                    <button class="action-btn delete" onclick="deleteTodo(${todo.id})">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterTodosByType(type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(type) {
        case 'all':
            return todos;
        case 'pending':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        case 'today':
            return todos.filter(t => {
                if (!t.dueDate) return false;
                const dueDate = new Date(t.dueDate);
                return dueDate.toDateString() === today.toDateString();
            });
        case 'high':
            return todos.filter(t => t.priority === 'high' && !t.completed);
        default:
            return todos;
    }
}

function filterTodos(filter) {
    currentFilter = filter;
    
    // 필터 버튼 활성화 상태 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayTodos();
}

function getDueStatus(dueDate) {
    if (!dueDate) return { text: '', class: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { text: `${Math.abs(diffDays)}일 지남`, class: 'overdue' };
    } else if (diffDays === 0) {
        return { text: '오늘 마감', class: 'due-soon' };
    } else if (diffDays === 1) {
        return { text: '내일 마감', class: 'due-soon' };
    } else if (diffDays <= 3) {
        return { text: `${diffDays}일 후`, class: 'due-soon' };
    } else {
        return { text: formatDate(dueDate), class: '' };
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
    });
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    // 오늘 마감인 할 일
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDue = todos.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate.toDateString() === today.toDateString();
    }).length;
    
    // 통계 업데이트
    document.getElementById('totalTodos').textContent = total;
    document.getElementById('pendingTodos').textContent = pending;
    document.getElementById('completedTodos').textContent = completed;
    document.getElementById('todayTodos').textContent = todayDue;
    
    // 진행률 업데이트
    const todayTodos = todos.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate.toDateString() === today.toDateString();
    });
    
    const todayCompleted = todayTodos.filter(t => t.completed).length;
    const todayTotal = todayTodos.length;
    const progress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').textContent = progress + '%';
    document.getElementById('progressText').textContent = 
        `${todayCompleted}개 중 ${todayTotal}개 완료`;
}

function getEmptyMessage() {
    switch(currentFilter) {
        case 'completed': return '완료된 할 일이 없습니다';
        case 'pending': return '대기 중인 할 일이 없습니다';
        case 'today': return '오늘 마감인 할 일이 없습니다';
        case 'high': return '높은 우선순위 할 일이 없습니다';
        default: return '할 일이 없습니다';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const colors = {
        success: 'var(--secondary)',
        warning: 'var(--warning)',
        info: 'var(--primary)',
        error: 'var(--danger)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Enter 키로 추가
document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 초기 로드
document.addEventListener('DOMContentLoaded', () => {
    displayTodos();
    updateStats();
    
    // 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
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
    `;
    document.head.appendChild(style);
    
    // 매일 자정에 통계 업데이트
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
        updateStats();
        setInterval(updateStats, 24 * 60 * 60 * 1000); // 24시간마다
    }, msUntilMidnight);
});