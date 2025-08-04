let notes = JSON.parse(localStorage.getItem('notes')) || [];
let selectedColor = 'blue';
let currentFilter = 'all';
let searchTerm = '';

// 색상 선택
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(opt => 
            opt.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
    });
});

function addNote() {
    const input = document.getElementById('noteInput');
    const category = document.getElementById('categorySelect').value;
    const content = input.value.trim();
    
    if (!content) return;
    
    const note = {
        id: Date.now(),
        content: content,
        category: category,
        color: selectedColor,
        createdAt: new Date().toISOString(),
        isExpanded: false
    };
    
    notes.unshift(note); // 최신 메모가 위로
    saveNotes();
    displayNotes();
    updateStats();
    input.value = '';
    
    // 애니메이션 효과
    showNotification('메모가 저장되었습니다!');
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const newContent = prompt('메모 수정:', note.content);
    if (newContent && newContent.trim()) {
        note.content = newContent.trim();
        note.editedAt = new Date().toISOString();
        saveNotes();
        displayNotes();
        showNotification('메모가 수정되었습니다!');
    }
}

function deleteNote(id) {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        displayNotes();
        updateStats();
        showNotification('메모가 삭제되었습니다!');
    }
}

function toggleExpand(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.isExpanded = !note.isExpanded;
        displayNotes();
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function displayNotes() {
    const list = document.getElementById('notesList');
    
    // 필터링
    let filteredNotes = notes;
    
    if (currentFilter !== 'all') {
        filteredNotes = filteredNotes.filter(note => 
            note.category === currentFilter
        );
    }
    
    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note => 
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredNotes.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>메모가 없습니다</h3>
                <p>새로운 메모를 작성해보세요!</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = filteredNotes.map(note => {
        const isLongContent = note.content.length > 200;
        const displayContent = note.isExpanded || !isLongContent ? 
            note.content : note.content.substring(0, 200) + '...';
        
        return `
            <div class="note-item color-${note.color}" data-id="${note.id}">
                <div class="note-header">
                    <div class="note-meta">
                        <span class="note-category">${note.category}</span>
                        <span class="note-date">${formatDateTime(note.createdAt)}</span>
                        ${note.editedAt ? '<span class="note-date">(수정됨)</span>' : ''}
                    </div>
                    <div class="note-actions">
                        <button class="action-btn" onclick="editNote(${note.id})">수정</button>
                        <button class="action-btn delete" onclick="deleteNote(${note.id})">삭제</button>
                    </div>
                </div>
                <div class="note-content ${isLongContent && !note.isExpanded ? 'note-preview' : ''}">
                    ${escapeHtml(displayContent)}
                </div>
                ${isLongContent ? `
                    <div class="expand-btn" onclick="toggleExpand(${note.id})">
                        ${note.isExpanded ? '접기 ▲' : '더보기 ▼'}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // 애니메이션
    const noteItems = list.querySelectorAll('.note-item');
    noteItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'fadeInUp 0.3s ease';
        }, index * 50);
    });
}

function searchNotes() {
    searchTerm = document.getElementById('searchInput').value;
    displayNotes();
}

function filterByCategory(category) {
    currentFilter = category;
    
    // 필터 버튼 활성화 상태 업데이트
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    event.target.classList.add('active');
    displayNotes();
}

function updateStats() {
    // 전체 메모 수
    document.getElementById('totalNotes').textContent = notes.length;
    
    // 오늘 작성한 메모 수
    const today = new Date().toDateString();
    const todayCount = notes.filter(note => 
        new Date(note.createdAt).toDateString() === today
    ).length;
    document.getElementById('todayNotes').textContent = todayCount;
    
    // 카테고리 수
    const categories = new Set(notes.map(note => note.category));
    document.getElementById('totalCategories').textContent = categories.size;
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    // 오늘인 경우
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // 1주일 이내
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return days === 0 ? '오늘' : `${days}일 전`;
    }
    
    // 그 외
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // 간단한 알림 표시 (CSS 애니메이션 활용)
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
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

// Ctrl+Enter로 저장
document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        addNote();
    }
});

// 초기 로드
document.addEventListener('DOMContentLoaded', () => {
    displayNotes();
    updateStats();
    
    // 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
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
});