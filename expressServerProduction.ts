import express from 'express';

import config from './config.js';

const app = express();

app.use(express.static('dist'));
app.use(express.static('static'));

app.listen(config.httpServer);
