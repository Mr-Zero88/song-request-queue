import express from 'express';
import api from './api';
import config from './config/config';
import cors from 'cors';

const app = express();

app.use(cors({ origin: '*', credentials: true}));
app.use(config.basePath, api);

export default app;
