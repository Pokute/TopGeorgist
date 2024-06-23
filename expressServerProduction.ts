import express from 'express';

import config from './config.js';

const app = express();

app.use(express.static('dist'));
app.use(express.static('static'));

console.log(`Started HTTPS server. Binding to ${config.httpServer.bind}:${config.httpServer.port}`)

app.listen(config.httpServer);
