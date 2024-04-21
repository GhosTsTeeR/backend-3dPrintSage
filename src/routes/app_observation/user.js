const express = require('express');
const userController = require('../../controllers/app_observation/user');
const verifyToken = require('../../config/middleware/veryfyTkObservation');

const router = express.Router();

router.post('/add-user', userController.createUser);
router.get('/get-user/:id', verifyToken, userController.getUserById);

// Otras rutas relacionadas con los usuarios

module.exports = router;