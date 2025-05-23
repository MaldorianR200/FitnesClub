import express from 'express';
import { initializeDatabase } from '../db/sqlite.service';
import { Client } from '../../src/app/entities/client/model/types/client';

const router = express.Router();

router.get('/', async (req, res) => {
  const db = await initializeDatabase();
  const clients = await db.all('SELECT * FROM clients');
  res.json(clients);
});

// POST
router.post('/', async (req, res) => {
  const { username, email, phone, address, birth_date } = req.body;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const db = await initializeDatabase();
  try {
    await db.run(
      'INSERT INTO clients (username, email, phone, address, birth_date, registration_date) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, phone, address, birth_date, date ]
    );
  return res.status(201).json({ message: `Client ${username} added successfully` });
  } catch (err: any) {
    console.error('Error adding client:', err.message || err);
    return res.status(500).json({ error: 'Failed to add client', details: err.message || err });
  }
});

// PUT /api/:id — обновление клиента
router.patch('/:id', async (req, res) => {
  const { name, email, phone, address, birth_date} = req.body;
  const id = req.params.id;
  const update_date = new Date().toISOString().slice(0, 10);

  try {
    const db = await initializeDatabase();
    const clientExists = await db.get<Client>('SELECT * FROM clients WHERE id = ?', [id]);

    if (!clientExists) {
      return res.status(404).json({ message: `Client with id ${id} not found` });
    }
    await db.run(
      'UPDATE clients SET name = ?, email = ?, phone = ? address = ?, birth_date = ?, update_date = ? WHERE id = ?',
      [name, email, phone, address, birth_date,  update_date, id]
    );
    return res.json({ message: `Client ${id} updated successfully` });
  } catch (err: any) {
    console.error('Error updating client:', err.message || err);
    return res.status(500).json({ error: 'Failed to update client', details: err.message || err });
  }
});

// DELETE /api/:id — удаление клиента
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const db = await initializeDatabase();

    const client = await db.get<Client>('SELECT * FROM clients WHERE id = ?', [id]);

    if (!client) {
      return res.status(404).json({ message: `Client with id ${id} does not exist` });
    }
    const result = await db.run('DELETE FROM clients WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      return res.json({ message: `Client ${id} deleted successfully` });
    } else {
      return res.status(400).json({ message: `Client with id ${id} was not deleted` });
    }
  } catch (err: any) {
    console.error('Error deleting client:', err.message || err);
    return res.status(500).json({ error: 'Failed to delete client', details: err.message || err });
  }
});

export default router;
