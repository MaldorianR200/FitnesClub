import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Trainer } from '../../src/app/entities/trainer/model/types/trainer';
import bcrypt from 'bcrypt';
import { Visit } from '../../src/app/entities/visit/model/types/visit';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
    const db = await initializeDatabase();
    const services = await db.all('SELECT * FROM visits');
    res.json(services);
  } catch (err: any) {
    console.error('Error fetching visits:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch visits', details: err.message || err });
  }
});

router.post('/', async (req, res) => {
  const { client_id, trainer_id, manager_id, visit_date } = req.body;
  const registration_date = new Date().toISOString().slice(0, 10);

  try {
    const db = await initializeDatabase();

    await db.run(
      'INSERT INTO visits (client_id, trainer_id, manager_id, visit_date) VALUES (?, ?, ?, ?)',
      [client_id, trainer_id, manager_id, visit_date]
    );
    return res.status(201).json({ message: `Visit ${visit_date} added successfully` });
  } catch (err: any) {
    console.error('Error adding visit:', err.message || err);
    return res.status(500).json({ error: 'Failed to add visit', details: err.message || err });
  }
});

// PATCH /api/:id — обновление посещения
router.patch('/:id', async (req, res) => {
  const { client_id, trainer_id, manager_id, visit_date } = req.body;
  const id = req.params.id;
  // const update_date = new Date().toISOString().slice(0, 10);
  try {
      const db = await initializeDatabase();
      const clientExists = await db.get<Visit>('SELECT * FROM visits WHERE id = ?', [id]);

      if (!clientExists) {
        return res.status(404).json({ message: `Service with id ${id} not found` });
      }
      await db.run(
        'UPDATE visits SET client_id = ?, trainer_id = ?, manager_id = ?, visit_date = ?  WHERE id = ?',
        [client_id, trainer_id, manager_id, visit_date, id]
      );
      return res.json({ message: `Visit ${id} updated successfully` });
    } catch (err: any) {
      console.error('Error updating visit:', err.message || err);
      return res.status(500).json({ error: 'Failed to update visit', details: err.message || err });
    }
});

// DELETE — удаление посещния
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

    try {
      const db = await initializeDatabase();

      const service = await db.get<Visit>('SELECT * FROM visits WHERE id = ?', [id]);

      if (!service) {
        return res.status(404).json({ message: `Visit with id ${id} does not exist` });
      }
      const result = await db.run('DELETE FROM visits WHERE id = ?', [id]);

      if (result.changes && result.changes > 0) {
        return res.json({ message: `Visit ${id} deleted successfully` });
      } else {
        return res.status(400).json({ message: `Visit with id ${id} was not deleted` });
      }
    } catch (err: any) {
      console.error('Error deleting visit:', err.message || err);
      return res.status(500).json({ error: 'Failed to delete visit', details: err.message || err });
    }
});

export default router;
