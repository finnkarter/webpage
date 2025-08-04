let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
    const input = document.getElementById('todoInput');
    const priority = document.getElementById('prioritySelect').value;
    
    if (!input.value.trim()) return;
    
    const todo = {
        id: Date.now(),
        text: input.value,
        completed: false,
        priority: priority,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveTodos();
    displayTodos();
    input.value = '';
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        displayTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    displayTodos();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    displayTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function displayTodos() {
    const list = document.getElementById('todoList');
    
    if (todos.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center;">할 일이 없습니다.</p>';
        return;
    }
    
    // 우선순위와 완료 여부로 정렬
    const sorted = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    list.innerHTML = sorted.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="todo-checkbox" 
                   ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${todo.text}</span>
            <span class="priority priority-${todo.priority}">
                ${todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음'}
            </span>
            <button class="delete" onclick="deleteTodo(${todo.id})">삭제</button>
        </div>
    `).join('');
}

// Enter 키로 추가
document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 초기 표시
displayTodos();