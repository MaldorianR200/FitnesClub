import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Admin } from '../../src/app/entities/admins/model/types/admin';

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await initializeDatabase();
  const admins = await db.all('SELECT * FROM admins');
  res.json(admins);
});

router.post('/', async (req: express.Request, res: express.Response) => {
  const { username, email, phone } = req.body;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD


  try {
    const db = await initializeDatabase();
      // Проверка существующего администратора
    const existingAdmin = await db.get<Admin>(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingAdmin) {
      if (existingAdmin.username === username) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      return res.status(409).json({ error: 'Email already exists' });
    }
    await db.run(
      'INSERT INTO admins (username, email, phone, registration_date, update_date) VALUES (?, ?, ?, ?, ?)',
      [username, email, phone, date, date]
    );
    return res.status(201).json({ message: `Admin ${username} added successfully` });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      if (err instanceof Error) {
      console.error('Error adding admin:', err.message);
      return res.status(500).json({ error: 'Failed to add admin', details: err.message });
    }
  }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
});

// PUT /api/:id — обновление админа
router.put('/:id', async (req, res) => {
  const { username, email, phone } = req.body;
  const id = req.params.id;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const db = await initializeDatabase();

  try {
    await db.run(
      'UPDATE admins SET username = ?, email = ?, phone = ?, update_date = ? WHERE id = ?',
      [username, email, phone, date, id]
    );
    return res.json({ message: 'admin updated' });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to update client', details: err });
  }
});

// DELETE /api/:id — удаление админа
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  const id = req.params['id'];


  try {
    const db = await initializeDatabase();
    // Проверка существования администратора перед удалением
    const adminExists = await db.get<Admin>('SELECT * FROM admins WHERE id = ?', [id]);
    if (!adminExists) {
      return res.status(404).json({ message: `Admin with id ${id} does not exist` });
    }

    const result = await db.run('DELETE FROM admins WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      return res.json({ message: 'Admin deleted successfully' });
    }
    return res.status(404).json({ message: `Admin with id ${id} was not deleted` });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error deleting admin:', err.message);
      return res.status(500).json({ error: 'Failed to delete admin', details: err.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
});

export default router;
