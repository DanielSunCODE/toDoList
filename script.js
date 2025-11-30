// Variables globales
let tasks = [];
let editingTaskId = null;
let currentUser = null;
let users = JSON.parse(localStorage.getItem('todoUsers')) || [];

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const todoScreen = document.getElementById('todoScreen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const currentUserSpan = document.getElementById('currentUser');

// Event listeners
loginForm.addEventListener('submit', login);
registerForm.addEventListener('submit', register);
taskForm.addEventListener('submit', addTask);
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
    if (!text) return;

    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(task);
    taskInput.value = '';
    saveUserTasks();
    renderTasks();
}

// Función para renderizar tareas
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-text" ondblclick="editTask(${task.id})">${task.text}</span>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">Editar</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Eliminar</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Función para alternar estado de tarea
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveUserTasks();
        renderTasks();
    }
}

// Función para editar tarea
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const taskItem = event.target.closest('.task-item');
    const taskText = taskItem.querySelector('.task-text');
    
    if (editingTaskId === id) {
        // Guardar cambios
        const input = taskItem.querySelector('.edit-input');
        const newText = input.value.trim();
        if (newText) {
            task.text = newText;
            editingTaskId = null;
            renderTasks();
        }
    } else {
        // Entrar en modo edición
        editingTaskId = id;
        taskText.innerHTML = `<input type="text" class="edit-input" value="${task.text}" onblur="saveEdit(${id})" onkeypress="handleEditKeypress(event, ${id})">`;
        taskItem.querySelector('.edit-input').focus();
    }
}

// Función para guardar edición
function saveEdit(id) {
    const task = tasks.find(t => t.id === id);
    const input = document.querySelector('.edit-input');
    if (task && input) {
        const newText = input.value.trim();
        if (newText) {
            task.text = newText;
        }
        editingTaskId = null;
        saveUserTasks();
        renderTasks();
    }
}

// Función para manejar teclas en edición
function handleEditKeypress(event, id) {
    if (event.key === 'Enter') {
        saveEdit(id);
    } else if (event.key === 'Escape') {
        editingTaskId = null;
        renderTasks();
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
            task.text.toLowerCase().includes(searchTerm)
        );
    }

    // Filtrar por estado
    const status = statusFilter.value;
    if (status === 'completed') {
        filtered = filtered.filter(task => task.completed);
    } else if (status === 'pending') {
        filtered = filtered.filter(task => !task.completed);
    }

    return filtered;
}

// Inicializar la aplicación
showLogin();