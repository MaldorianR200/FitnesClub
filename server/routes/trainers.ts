import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Trainer } from '../../src/app/entities/trainer/model/types/trainer';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
    const db = await initializeDatabase();
    const trainers = await db.all('SELECT * FROM trainers');
    return res.json(trainers);
  } catch (err: any) {
    console.error('Error fetching trainers:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch trainers', details: err.message || err });
  }
});

router.post('/', async (req, res) => {
  const { username, email, phone, password } = req.body;
  const registration_date = new Date().toISOString().slice(0, 10);

  try {
    const db = await initializeDatabase();

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      'INSERT INTO trainers (username, email, phone, password, registration_date) VALUES (?, ?, ?, ?, ?)',
      [username, email, phone, hashedPassword, registration_date]
    );
    return res.status(201).json({ message: `Trainer ${username} added successfully` });
  } catch (err: any) {
    console.error('Error adding trainer:', err.message || err);
    return res.status(500).json({ error: 'Failed to add trainer', details: err.message || err });
  }
});

// PUT /api/:id — обновление тренера
router.put('/:id', async (req, res) => {
  const { username, email, phone, password } = req.body;
  const id = req.params.id;
  const update_date = new Date().toISOString().slice(0, 10);
  try {
    const db = await initializeDatabase();
    const trainer = await db.get<Trainer>('SELECT * FROM trainers WHERE id = ?', [id]);

    if (!trainer) {
      return res.status(404).json({ message: `Trainer with id ${id} not found` });
    }

    let updateQuery = 'UPDATE trainers SET username = ?, email = ?, phone = ?, update_date = ?';
    const params: any[] = [username, email, phone, update_date];

    // Если пароль передан — хешируем и добавляем в запрос
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.run(updateQuery, params);

    return res.json({ message: `Trainer ${id} updated successfully` });
  } catch (err: any) {
    console.error('Error updating trainer:', err.message || err);
    return res.status(500).json({ error: 'Failed to update trainer', details: err.message || err });
  }
});

// DELETE — remove a trainer
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const db = await initializeDatabase();
    const trainer = await db.get<Trainer>('SELECT * FROM trainers WHERE id = ?', [id]);

    if (!trainer) {
      return res.status(404).json({ message: `Trainer with id ${id} does not exist` });
    }

    const result = await db.run('DELETE FROM trainers WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      return res.json({ message: `Trainer ${id} deleted successfully` });
    } else {
      return res.status(400).json({ message: `Trainer with id ${id} was not deleted` });
    }
  } catch (err: any) {
    console.error('Error deleting trainer:', err.message || err);
    res.status(500).json({ error: 'Failed to delete trainer', details: err.message || err });
  }
  return res.status(500).json({ error: 'Unknown error occurred' });
});

export default router;
