import express from 'express';
import api from './api';
import config from './config/config';

const app = express();

app.use(api);

export default app;
