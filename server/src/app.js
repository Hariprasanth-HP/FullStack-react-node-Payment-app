import express from 'express';
import bodyParser from 'body-parser';
import loadRoutes from './loaders/routes.js';
import cors from 'cors';
var app = express()

app.use(cors())

app.use(bodyParser.json());
loadRoutes(app);

export default app;
]
