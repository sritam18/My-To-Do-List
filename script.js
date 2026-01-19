// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const taskCount = document.getElementById('taskCount');
const emptyState = document.getElementById('emptyState');

// State
let todos = [];
let currentFilter = 'all';

// Initialize app
function init() {
    loadTodos();
    renderTodos();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        todoInput.style.borderColor = '#dc3545';
        todoInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            todoInput.style.borderColor = '#e9ecef';
            todoInput.style.animation = '';
        }, 500);
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
    
    // Focus back on input
    todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.classList.add('removing');
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            renderTodos();
        }, 400);
    }
}

// Clear completed todos
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;
    
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// Filter todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        li.innerHTML = `
            <label class="checkbox-container">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="checkmark"></span>
            </label>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Delete task">
                ×
            </button>
        `;
        
        todoList.appendChild(li);
    });
    
    updateStats();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    let countText = '';
    if (currentFilter === 'all') {
        countText = `${total} task${total !== 1 ? 's' : ''}`;
    } else if (currentFilter === 'active') {
        countText = `${active} active task${active !== 1 ? 's' : ''}`;
    } else {
        countText = `${completed} completed task${completed !== 1 ? 's' : ''}`;
    }
    
    taskCount.textContent = countText;
    
    // Show/hide clear completed button
    if (completed > 0) {
        clearCompletedBtn.style.display = 'block';
    } else {
        clearCompletedBtn.style.display = 'none';
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for inline event handlers
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add shake animation for empty input
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
