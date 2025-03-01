const express = require('express');
const fs = require('fs');
const Joi = require('joi');

const app = express();
app.use(express.json());

const PORT = 3000;
const USERS_FILE = 'users.json';

// Схема валидации для создания пользователя
const userSchema = Joi.object({
    firstName: Joi.string().min(1).required(),
    secondName: Joi.string().min(1).required(),
    age: Joi.number().min(0).max(150).required(),
    city: Joi.string().min(1).optional()
});

// Чтение пользователей из файла
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

// Запись пользователей в файл
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Получение всех пользователей
app.get('/users', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// Получение пользователя по ID
app.get('/users/:id', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Пользователь не найден');
    res.json(user);
});

// Создание пользователя
app.post('/users', (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const users = readUsers();
    const user = {
        id: users.length + 1,
        ...req.body
    };
    users.push(user);
    writeUsers(users);
    res.status(201).json(user);
});

// Обновление пользователя
app.put('/users/:id', (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const users = readUsers();
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('Пользователь не найден');

    user.firstName = req.body.firstName;
    user.secondName = req.body.secondName;
    user.age = req.body.age;
    user.city = req.body.city;

    writeUsers(users);
    res.json(user);
});

// Удаление пользователя
app.delete('/users/:id', (req, res) => {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).send('Пользователь не найден');

    users.splice(userIndex, 1);
    writeUsers(users);
    res.status(204).send();
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});