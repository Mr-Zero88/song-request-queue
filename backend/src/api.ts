import { Router } from 'express';
import session from './routes/session';
import { errorHandler } from './middlewares/errorHandler';

const api = Router();

// Routes
api.use('/session', session);

api.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Global error handler (should be after routes)
api.use(errorHandler);

export default api;
