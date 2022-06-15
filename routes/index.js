/**
 * @module index
 */
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

// Setup a router instance
const router = express.Router();

// Status route to show database connectivity
router.get('/status', AppController.getStatus);

// Database stats of users and files collections
router.get('/stats', AppController.getStats);

// User registration route
router.post('/users', UsersController.postNew);

// User sign-in route
router.get('/connect', AuthController.getConnect);

// User sign-out route
router.get('/disconnect', AuthController.getDisconnect);

// User home route
router.get('/users/me', UsersController.getMe);

// File upload route
router.post('/files', FilesController.postUpload);

export default router;
