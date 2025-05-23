import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Manager } from '../../src/app/entities/manager/model/types/manager';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await initializeDatabase();
    const managers = await db.all('SELECT * FROM managers');
    res.json(managers);
  } catch (err: any) {
    console.error('Error fetching managers:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch managers', details: err.message || err });
  }
});

router.post('/', async (req, res) => {
  const { username, email, password, phone, position } = req.body;
  const registration_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD


  try {
    const db = await initializeDatabase();

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      'INSERT INTO managers (username, email, phone, position, password, registration_date) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, phone, position, hashedPassword, registration_date]
    );
    return res.status(201).json({ message: `Manager ${username} added successfully` });
  } catch (err: any) {
    console.error('Error adding manager:', err.message || err);
    return res.status(500).json({ error: 'Failed to add manager', details: err.message || err });
  }
});

// PATCH /api/:id — обновление клиента
router.patch('/:id', async (req, res) => {
  const { username, email, password, phone, position } = req.body;
  const id = req.params.id;
  const update_date = new Date().toISOString().slice(0, 10);

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  try {
    const db = await initializeDatabase();
    const existing = await db.get<Manager>('SELECT * FROM managers WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ message: `Manager with id ${id} not found` });
    }
    let updateQuery = 'UPDATE managers SET username = ?, email = ?, phone = ?, position = ?, password = ?, update_date = ?';
    const params: any[] = [username, email, phone, position, password, update_date];

    // Если пароль передан — хешируем и добавляем в запрос
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.run(updateQuery, params);

    return res.json({ message: `Manager ${id} updated successfully` });
  } catch (err: any) {
    console.error('Error updating manager:', err.message || err);
    return res.status(500).json({ error: 'Failed to update manager', details: err.message || err });
  }
});

// DELETE /api/:id — удаление менеджера
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const db = await initializeDatabase();
    const manager = await db.get<Manager>('SELECT * FROM managers WHERE id = ?', [id]);

    if (!manager) {
      return res.status(404).json({ message: `Manager with id ${id} does not exist` });
    }

    const result = await db.run('DELETE FROM managers WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      console.log(`Manager ${id} deleted`);
      return res.json({ message: `Manager ${id} deleted successfully` });
    } else {
      return res.status(400).json({ message: `Manager with id ${id} was not deleted` });
    }
  } catch (err: any) {
    console.error('Error deleting manager:', err.message || err);
    return res.status(500).json({ error: 'Failed to delete manager', details: err.message || err });
  }
});

export default router;
