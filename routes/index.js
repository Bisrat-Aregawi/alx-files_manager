/**
 * @module index
 */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

// Setup a router instance
const router = express.Router();

// Status route to show database connectivity
router.get('/status', AppController.getStatus);

// Database stats of users and files collections
router.get('/stats', AppController.getStats);

// User add route
router.post('/users', UsersController.postNew);

export default router;
