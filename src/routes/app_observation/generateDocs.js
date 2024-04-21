const express = require('express');
const generateController = require('../../controllers/app_observation/generateDocs');
const verifyToken = require('../../config/middleware/veryfyTkObservation');

const router = express.Router();


router.post('/generate-excel', verifyToken, generateController.generateExcel);
router.post('/generate-word', verifyToken, generateController.generateWord);
router.post('/generate-pdf', verifyToken, generateController.generatePDF);

module.exports = router;