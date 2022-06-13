/**
 * @module server
 */
import express from 'express';
import router from './routes/index';

// Setup a listen port from environment variable
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

// Create an express app
const app = express();

// Register a json reader middleware
app.use(express.json());

// Use routes defined in index
app.use(router);

// Listen on given socket
app.listen(port, host);
