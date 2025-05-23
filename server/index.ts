import express from 'express';
import bodyParser from 'body-parser';
import { initializeDatabase } from './db/sqlite.service';
import adminsRoutes from './routes/admins'
import clientsRoutes from './routes/clients';
import trainersRoutes from './routes/trainers';
import servicesRoutes from './routes/services';
import managersRoutes from './routes/managers';
import visitsRoutes from './routes/visits';
import paymentsRoutes from './routes/payments';
import authRoutes from './routes/auth';
import { authenticateToken } from './middlewares/auth.middleware';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Разрешаем CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(bodyParser.json());
app.use('/api/admins', adminsRoutes)
app.use('/api/clients', clientsRoutes);
app.use('/api/trainers', trainersRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/managers', managersRoutes)
app.use('/api/visits', visitsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/auth', authRoutes);
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Доступ разрешен' });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize database', error);
});




