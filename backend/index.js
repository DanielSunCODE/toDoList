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

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../frontend'});
});

// Ahora que tenemos conexión agregamos endpoints

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
})