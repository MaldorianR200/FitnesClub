// server/routes/auth.ts
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initializeDatabase } from '../db/sqlite.service';

const router = express.Router();
const JWT_SECRET = 'your_secret_key'; // Нужно будет перенести в .env

// Регистрация

router.post('/register', async (req, res) => {
  const { username, phone, email, password, role } = req.body;
  if (!username || !phone || !email || !password || !role) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const db = await initializeDatabase();

    const hashedPassword = await bcrypt.hash(password, 10);

    let query = '';
    let params: any[] = [];

    switch (role) {
      case 'ADMIN':
        const adminExists = await db.get('SELECT * FROM admins WHERE email = ?', email);
        if (adminExists) return res.status(409).json({ message: 'Администратор с таким email уже существует' });

        query = `INSERT INTO admins (username, phone, email, password ) VALUES (?, ?, ?, ?)`;
        params = [username, phone, email, hashedPassword ];
        break;


      case 'MANAGER':
        const managerExists = await db.get('SELECT * FROM managers WHERE email = ?', email);
        if (managerExists) return res.status(409).json({ message: 'Менеджер с таким email уже существует' });

        query = `INSERT INTO managers (username, phone, email, password) VALUES (?, ?, ?, &)`;
        params = [username, phone, email, hashedPassword];
        break;

      case 'TRAINER':
        const trainerExists = await db.get('SELECT * FROM trainers WHERE email = ?', email);
        if (trainerExists) return res.status(409).json({ message: 'Тренер с таким email уже существует' });

        query = `INSERT INTO trainers (username, phone, email, password) VALUES (?, ?, ?, &)`;
        params = [username, phone, email, hashedPassword];
        break;

      default:
        return res.status(400).json({ message: 'Недопустимая роль' });
    }

    await db.run(query, ...params);
    return res.status(201).json({ message: `Пользователь с ролью ${role} зарегистрирован` });
  } catch (error: any) {
      console.error('Ошибка регистрации:', error);

      if (error.code === 'SQLITE_CONSTRAINT') {
        if (error.message.includes('username')) {
          return res.status(409).json({ message: 'Пользователь с таким именем уже существует' });
        }
        if (error.message.includes('email')) {
          return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
        }
      }

      return res.status(500).json({
        message: 'Ошибка регистрации',
        error: error.message
      });
    }
});

// Логин
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

    if (!email || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const db = await initializeDatabase();

    const tables = [
      { table: 'admins', role: 'ADMIN', field: 'email' },
      { table: 'managers', role: 'MANAGER', field: 'email' },
      { table: 'trainers', role: 'TRAINER', field: 'email' }
    ];

    for (const { table, role } of tables) {
      const user = await db.get(`SELECT * FROM ${table} WHERE email = ?`, email);
      if (user && await bcrypt.compare(password, user.password)) {
        // const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '1d' });
        // return res.json({ token, role, id: user.id });
        const token = jwt.sign(
          {
            id: user.id,
            role,
            username: user.username,
            email: user.email
          },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        return res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role
          }
        });
      }
    }

    return res.status(401).json({ message: 'Неверный email или пароль' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Ошибка входа' });
  }
});
export default router;
