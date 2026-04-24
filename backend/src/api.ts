import { json, Router } from 'express';
import cookiesParser from 'cookie-parser';
import session from './routes/session';
import queue from './routes/queue';
import queues from './routes/queues';
import { errorHandler } from './middlewares/errorHandler';
import { handleSession } from './middlewares/sessionHandler';

const api = Router();

api.use(json());
api.use(cookiesParser());

// Routes
api.use('/session', session);
api.use('/queue', handleSession, queue);
api.use('/queues', handleSession, queues);

api.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Global error handler (should be after routes)
api.use(errorHandler);

export default api;
