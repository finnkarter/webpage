let notes = JSON.parse(localStorage.getItem('notes')) || [];

function addNote() {
    const input = document.getElementById('noteInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    const note = {
        id: Date.now(),
        content: content,
        createdAt: new Date().toISOString()
    };
    
    notes.unshift(note); // 최신 메모가 위로
    saveNotes();
    displayNotes();
    input.value = '';
}

function deleteNote(id) {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        displayNotes();
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function displayNotes(searchTerm = '') {
    const list = document.getElementById('notesList');
    
    let filteredNotes = notes;
    if (searchTerm) {
        filteredNotes = notes.filter(note => 
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredNotes.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center;">메모가 없습니다.</p>';
        return;
    }
    
    list.innerHTML = filteredNotes.map(note => `
        <div class="note-item">
            <div class="note-actions">
                <button class="delete" onclick="deleteNote(${note.id})">삭제</button>
            </div>
            <div class="note-date">${formatDateTime(note.createdAt)}</div>
            <div class="note-content">${escapeHtml(note.content)}</div>
        </div>
    `).join('');
}

function searchNotes() {
    const searchTerm = document.getElementById('searchInput').value;
    displayNotes(searchTerm);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Ctrl+Enter로 저장
document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        addNote();
    }
});

// 초기 표시
displayNotes();