import { json, Router } from 'express';
import cookiesParser from 'cookie-parser';
import session from './routes/session';
import queue from './routes/queue';
import { errorHandler } from './middlewares/errorHandler';

const api = Router();

api.use(json());
api.use(cookiesParser());

// Routes
api.use('/session', session);
api.use('/queue', queue);

api.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Global error handler (should be after routes)
api.use(errorHandler);

export default api;
