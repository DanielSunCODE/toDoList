// Variables globales
let tasks = [];
let currentUser = null;
let editingTaskId = null;

// Usuario hardcodeado para pruebas
const hardcodedUser = {
    id: 1,
    username: 'admin',
    password: '123',
    tasks: [
        { id: 1, text: 'Tarea de ejemplo 1', description: 'Esta es una descripción de ejemplo', status: 'sin iniciar' },
        { id: 2, text: 'Tarea completada', description: 'Tarea que ya fue terminada', status: 'terminada' },
        { id: 3, text: 'Otra tarea pendiente', description: '', status: 'en progreso' }
    ]
};

// Limpiar localStorage para usar datos corregidos
localStorage.removeItem('todoUsers');
let users = JSON.parse(localStorage.getItem('todoUsers')) || [hardcodedUser];

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const todoScreen = document.getElementById('todoScreen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskDescription = document.getElementById('taskDescription');
const taskStatus = document.getElementById('taskStatus');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const currentUserSpan = document.getElementById('currentUser');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editStatus = document.getElementById('editStatus');
const viewModal = document.getElementById('viewModal');
const viewTitle = document.getElementById('viewTitle');
const viewDescription = document.getElementById('viewDescription');
const viewStatus = document.getElementById('viewStatus');

// Event listeners
loginForm.addEventListener('submit', login);
registerForm.addEventListener('submit', register);
taskForm.addEventListener('submit', addTask);
editForm.addEventListener('submit', saveTaskEdit);
searchInput.addEventListener('input', filterTasks);
statusFilter.addEventListener('change', filterTasks);

// Funciones de autenticación
function login(e) {
    e.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        currentUserSpan.textContent = `Bienvenido, ${username}`;
        loadUserTasks();
        showTodoScreen();
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function register(e) {
    e.preventDefault();
    const username = document.getElementById('regUsernameInput').value.trim();
    const password = document.getElementById('regPasswordInput').value;
    
    if (users.find(u => u.username === username)) {
        alert('El usuario ya existe');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        tasks: []
    };
    
    users.push(newUser);
    localStorage.setItem('todoUsers', JSON.stringify(users));
    alert('Usuario registrado exitosamente');
    showLogin();
}

function logout() {
    currentUser = null;
    tasks = [];
    showLogin();
    document.getElementById('usernameInput').value = '';
    document.getElementById('passwordInput').value = '';
}

function showLogin() {
    loginScreen.style.display = 'block';
    registerScreen.style.display = 'none';
    todoScreen.style.display = 'none';
}

function showRegister() {
    loginScreen.style.display = 'none';
    registerScreen.style.display = 'block';
    todoScreen.style.display = 'none';
}

function showTodoScreen() {
    loginScreen.style.display = 'none';
    registerScreen.style.display = 'none';
    todoScreen.style.display = 'block';
}

function loadUserTasks() {
    tasks = currentUser.tasks || [];
    renderTasks();
}

function saveUserTasks() {
    if (currentUser) {
        currentUser.tasks = tasks;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('todoUsers', JSON.stringify(users));
        }
    }
}

// Función para agregar tarea
function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const status = taskStatus.value;
    if (!text) return;

    const task = {
        id: Date.now(),
        text: text,
        description: description,
        status: status
    };

    tasks.push(task);
    taskInput.value = '';
    taskDescription.value = '';
    taskStatus.value = 'sin iniciar';
    saveUserTasks();
    renderTasks();
}

// Función para renderizar tareas
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        const taskStatus = task.status || 'sin iniciar';
        li.className = `task-item ${taskStatus === 'terminada' ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-content" onclick="openViewModal(${task.id})">
                <div class="task-title">${task.text} <span class="task-status ${taskStatus.replace(' ', '-')}">${taskStatus.toUpperCase()}</span></div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="openEditModal(${task.id})">Editar</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Eliminar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Función para abrir modal de edición
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    editTitle.value = task.text;
    editDescription.value = task.description || '';
    editStatus.value = task.status;
    editModal.style.display = 'block';
}

// Función para cerrar modal
function closeEditModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
}

// Función para guardar edición desde modal
function saveTaskEdit(e) {
    e.preventDefault();
    if (!editingTaskId) return;

    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.text = editTitle.value.trim();
        task.description = editDescription.value.trim();
        task.status = editStatus.value;
        saveUserTasks();
        renderTasks();
        closeEditModal();
    }
}

// Función para abrir modal de vista
function openViewModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    viewTitle.textContent = task.text;
    viewStatus.textContent = task.status.toUpperCase();
    viewStatus.className = `view-status ${task.status.replace(' ', '-')}`;
    viewDescription.textContent = task.description || 'Sin descripción';
    viewModal.style.display = 'block';
}

// Función para cerrar modal de vista
function closeViewModal() {
    viewModal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
}

// Función para eliminar tarea
function deleteTask(id) {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveUserTasks();
        renderTasks();
    }
}

// Función para filtrar tareas
function filterTasks() {
    renderTasks();
}

// Función para obtener tareas filtradas
function getFilteredTasks() {
    let filtered = tasks;

    // Filtrar por búsqueda
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtrar por estado
    const status = statusFilter.value;
    if (status !== 'all') {
        filtered = filtered.filter(task => task.status === status);
    }

    return filtered;
}

// Inicializar la aplicación
showLogin();