const express = require('express');
const router = express.Router();
const userController = require('../../controllers/app_3dprintsage/user');
const verifyToken = require('../../config/middleware/veryfyTk3dPrintSage');

router.get('/data-user/:uid', verifyToken, userController.getDataUser);
router.post('/modify-data-user/:uid', verifyToken, userController.modifyDataUser);

module.exports = router;