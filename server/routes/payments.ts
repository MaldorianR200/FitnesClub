import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Trainer } from '../../src/app/entities/trainer/model/types/trainer';
import bcrypt from 'bcrypt';
import { Visit } from '../../src/app/entities/visit/model/types/visit';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
    const db = await initializeDatabase();
    const service_payments = await db.all('SELECT * FROM service_payments');
    return res.json(service_payments);
  } catch (err: any) {
    console.error('Error fetching payments:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch payments', details: err.message || err });
  }
});

router.post('/', async (req, res) => {
  const { visit_id, service_id, quantity, final_price, discount } = req.body;
  const registration_date = new Date().toISOString().slice(0, 10);

  try {
    const db = await initializeDatabase();

    await db.run(
      'INSERT INTO service_payments (visit_id, service_id, quantity, final_price, discount) VALUES (?, ?, ?, ?, ?)',
      [visit_id, service_id, quantity, final_price, discount]
    );
    return res.status(201).json({ message: `Payments ${visit_id} added successfully` });
  } catch (err: any) {
    console.error('Error adding visit:', err.message || err);
    return res.status(500).json({ error: 'Failed to add payment', details: err.message || err });
  }
});

// PATCH /api/:id — обновление оплаты
router.patch('/:id', async (req, res) => {
  const { service_id, quantity, final_price, discount } = req.body;
  const visit_id = req.params.id;
  // const update_date = new Date().toISOString().slice(0, 10);
  try {
      const db = await initializeDatabase();
      const clientExists = await db.get<Visit>('SELECT * FROM service_payments WHERE visit_id = ?', [visit_id]);

      if (!clientExists) {
        return res.status(404).json({ message: `Payment with id ${visit_id} not found` });
      }
      await db.run(
        'UPDATE service_payments SET service_id = ?, quantity = ?, final_price = ?, discount = ? WHERE visit_id = ?',
        [ service_id, quantity, final_price, discount, visit_id]
      );
      return res.json({ message: `Payment ${visit_id} updated successfully` });
    } catch (err: any) {
      console.error('Error updating payment:', err.message || err);
      return res.status(500).json({ error: 'Failed to update payment', details: err.message || err });
    }
});

// DELETE — удаление оплаты
router.delete('/:id', async (req, res) => {
  const visit_id = req.params.id;

    try {
      const db = await initializeDatabase();

      const service = await db.get<Visit>('SELECT * FROM service_payments WHERE visit_id = ?', [visit_id]);

      if (!service) {
        return res.status(404).json({ message: `Visit with visit_id ${visit_id} does not exist` });
      }
      const result = await db.run('DELETE FROM service_payments WHERE visit_id = ?', [visit_id]);

      if (result.changes && result.changes > 0) {
        return res.json({ message: `Payment ${visit_id} deleted successfully` });
      } else {
        return res.status(400).json({ message: `Payment with id ${visit_id} was not deleted` });
      }
    } catch (err: any) {
      console.error('Error deleting payment:', err.message || err);
      return res.status(500).json({ error: 'Failed to delete payment', details: err.message || err });
    }
});

export default router;
