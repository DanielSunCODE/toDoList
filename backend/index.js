import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

// Esta linea inicia la API o servidor almacenandola en una variable "app"
const app = express();
// Esta linea permite que la API pueda recibir datos en formato JSON
app.use(express.json());
// Esta linea nos dice de donde puede ser consumida mi API, esto sirve para evitar bloqueos del navegador por distintos origgenes
app.use(cors()); // si no damos url puede ser consumida de cualquier lugar

// Creamos la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'todolist'
});

// comprobamos conexión

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

// Servir frontend desde el backend
app.use(express.static('../frontend'));

// Rutas GET para servir el HTML
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../frontend'});
});

app.get('/login', (req, res) => {
    res.sendFile('index.html', {root: '../frontend'});
});

app.get('/register', (req, res) => {
    res.sendFile('index.html', {root: '../frontend'});
});

app.get('/dashboard', (req, res) => {
    res.sendFile('index.html', {root: '../frontend'});
});

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
})

// Ahora que tenemos conexión agregamos endpoints
// VERIFICAR Y CREAR USUARIO DE PRUEBA
db.query("SELECT * FROM users", (err, users) => {
    if (err) {
        console.error('Error al consultar usuarios:', err);
        return;
    }
    
    console.log('Usuarios en la base de datos:', users);
    
    // Verificar si existe el usuario admin
    const adminExists = users.find(user => user.username === 'admin');
    
    if (!adminExists) {
        // Si no existe admin, crearlo
        const insertUser = "INSERT INTO users (username, email, user_password) VALUES ('admin', 'admin@admin.com', '123')";
        db.query(insertUser, (err, result) => {
            if (err) {
                console.error('Error al crear usuario admin:', err);
            } else {
                console.log('Usuario de prueba creado: admin/123');
                console.log('Resultado insert:', result);
                
                // Mostrar usuarios actualizados
                db.query("SELECT * FROM users", (err, updatedUsers) => {
                    if (!err) {
                        console.log('Usuarios actualizados:', updatedUsers);
                    }
                });
            }
        });
    } else {
        console.log('Usuario admin ya existe');
    }
});

// LOGIN ENDPOINT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Intento de login:', username, password); // Debug
    
    const q = "SELECT * FROM users WHERE username = ? AND user_password = ?";
    
    db.query(q, [username, password], (err, data) => {
        if (err) {
            console.error('Error en query:', err); // Debug
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        console.log('Resultado query:', data); // Debug
        
        if (data.length > 0) {
            // Usuario encontrado
            const user = data[0];
            return res.json({ 
                success: true, 
                message: 'Login exitoso',
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            // Usuario no encontrado
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario o contraseña incorrectos' 
            });
        }
    });
});

// REGISTER ENDPOINT
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log('Intento de registro:', username, email, password); // Debug

    const q = "INSERT INTO users (username, email, user_password) VALUES (?, ?, ?);"

    db.query(q, [username, email, password], (err, data) => {
        if(err){
            console.log("Error en query: ", err);
            return res.status(500).json({error: 'Error en el servidor'});
        }
        
        console.log('Resultado query:', data); // Debug

        if(data.affectedRows > 0){
            return res.json({
                success: true,
                message: "Usuario registrado correctamente"
            })
        }else{
            return res.status(500).json({
                success: false,
                message: "Error al registrar usuario"
            })
        }
    })
})

// GET TASKS ENDPOINT
app.get('/tasks', (req, res) => {
    const q = "SELECT * FROM tasks WHERE user_id = ?";

    db.query(q, [req.query.userId], (err, data) => {
        if(err){
            console.log("Error en query: ", err);
            return res.status(500).json({error: 'Error en el servidor'});
        }

        console.log('Resultado query:', data); // Debug

        if(data.length > 0){
            console.log("Tareas obtenidas correctamente: ", data);
            return res.json({
                success: true,
                message: "Tareas obtenidas correctamente",
                tasks: data
            })
        }else{
            return res.status(500).json({
                success: false,
                message: "Error al obtener tareas"
            })
        }
    })
})

// AGREGAR TASKS
app.post('/addTask', (req, res) => {
    const q = "INSERT INTO tasks (title, content, status_id, user_id) VALUES (?, ?, ?, ?);";
    const { title, content, status, userId } = req.body
    const idStatus = status === 'Sin Iniciar' ? 1 : status === 'En Progreso' ? 2 : 3;

    console.log("Intento de agregar tarea: \n" + "text: " + title + "\n" + "description: " + content + "\n" + "status: " + idStatus + "\n" + "user: " + userId);

    db.query(q, [title, content, idStatus, userId], (err, data) => {
        if (err){
            console.log("Error al agregar tarea: ", err);
            return res.status(500).json({error: 'Error en el servidor'});
        }
        
        console.log('Respuesta del servidor: ', data);

        if(data.affectedRows > 0){
            return res.json({
                success: true,
                message: "Tarea agregada correctamente",
                task: {
                    id: data.insertId,
                    title: req.body.title,
                    description: req.body.description,
                    status: req.body.status
                }
            })
        }else{
            return res.status(500).json({
                success: false,
                message: "Error al agregar tarea"
            })
        }
    });
});

// PUT TASKS
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const q = "UPDATE tasks SET `title` = ?, `content` = ?, `status` = ? WHERE id = ?";
    const values = [
        req.body.title,
        req.body.description,
        req.body.status
    ];

    db.query(q, [...values, taskId], (err, data) => {
        if (err) return res.json(err);
        return res.json("Tarea actualizada exitosamente");
    });
});