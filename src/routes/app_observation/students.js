const express = require('express');
const studentController = require('../../controllers/app_observation/student');
const verifyToken = require('../../config/middleware/veryfyTkObservation');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/add-student', verifyToken, studentController.createStudent);
router.post('/add-students-massive', verifyToken, studentController.createStudentMassive);
router.get('/get-students', verifyToken, studentController.getStudents);
router.get('/get-student/:id', verifyToken, studentController.getStudentById);
router.put('/edit-student/:id', verifyToken, studentController.editStudentById);
router.post('/upload-firma/:id', upload.single('audioFile'), verifyToken, studentController.uploadFirma);
router.put('/update-observacion/:id', studentController.updateObservacion);
router.delete('/delete-observacion/:id', studentController.deleteObservacion);
router.post("/add-observacion", studentController.addObservacion);


// esta es otra gorma de subir la firma, pero no la usaremos, pasaremos por en controlador y el modelo en donde subiremos la firma en audio
// Otras rutas relacionadas con los usuarios

module.exports = router;