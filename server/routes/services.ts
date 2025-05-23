import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Trainer } from '../../src/app/entities/trainer/model/types/trainer';
import bcrypt from 'bcrypt';
import { Service } from '../../src/app/entities/service/model/types/service';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
    const db = await initializeDatabase();
    const services = await db.all('SELECT * FROM services');
    return res.json(services);
  } catch (err: any) {
    console.error('Error fetching services:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch services', details: err.message || err });
  }
});

router.post('/', async (req, res) => {
  const { title, description, price, trainer_id } = req.body;
  const registration_date = new Date().toISOString().slice(0, 10);

  try {
    const db = await initializeDatabase();

    await db.run(
      'INSERT INTO services (title, description, price, trainer_id) VALUES (?, ?, ?, ?)',
      [title, description, price, trainer_id]
    );
    return res.status(201).json({ message: `Service ${title} added successfully` });
  } catch (err: any) {
    console.error('Error adding service:', err.message || err);
    return res.status(500).json({ error: 'Failed to add service', details: err.message || err });
  }
});

// PATCH /api/:id — обновление услуги
router.patch('/:id', async (req, res) => {
  const { title, description, price, trainer_id } = req.body;
  const id = req.params.id;
  // const update_date = new Date().toISOString().slice(0, 10);
  try {
      const db = await initializeDatabase();
      const clientExists = await db.get<Service>('SELECT * FROM services WHERE id = ?', [id]);

      if (!clientExists) {
        return res.status(404).json({ message: `Service with id ${id} not found` });
      }
      await db.run(
        'UPDATE services SET title = ?, description = ?, price = ?, trainer_id = ?  WHERE id = ?',
        [title, description, price, trainer_id, id]
      );
      return res.json({ message: `Service ${id} updated successfully` });
    } catch (err: any) {
      console.error('Error updating service:', err.message || err);
      return res.status(500).json({ error: 'Failed to update service', details: err.message || err });
    }
});

// DELETE — удаление услуги
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

    try {
      const db = await initializeDatabase();

      const service = await db.get<Service>('SELECT * FROM services WHERE id = ?', [id]);

      if (!service) {
        return res.status(404).json({ message: `Service with id ${id} does not exist` });
      }
      const result = await db.run('DELETE FROM services WHERE id = ?', [id]);

      if (result.changes && result.changes > 0) {
        return res.json({ message: `Service ${id} deleted successfully` });
      } else {
        return res.status(400).json({ message: `Service with id ${id} was not deleted` });
      }
    } catch (err: any) {
      console.error('Error deleting service:', err.message || err);
      return res.status(500).json({ error: 'Failed to delete service', details: err.message || err });
    }
});

export default router;
