const StudentModel = require('../../models/app_observation/student');
const { validationResult } = require('express-validator');
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    const studentModel = new StudentModel();
    await studentModel.createStudent(studentData);
    res.status(201).json({ message: 'Estudiante creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el estudiante' });
  }
};

exports.createStudentMassive = async (req, res) => {
  try {
    const studentsData = req.body.studentsData;
    const studentModel = new StudentModel();
    const createdStudents = await studentModel.createStudentMassive(studentsData);
    res.status(201).json({ success: true, students: createdStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear los estudiantes' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const studentModel = new StudentModel();
    const students = await studentModel.getStudents();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los estudiantes' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const studentModel = new StudentModel();
    const student = await studentModel.getStudentById(studentId);
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estudiante' });
  }
};

exports.editStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const editedStudentData = req.body;
    const studentModel = new StudentModel();
    await studentModel.editStudentById(studentId, editedStudentData);
    res.status(200).json({ message: 'Estudiante editado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al editar el estudiante' });
  }
};
exports.uploadFirma = async (req, res) => {
  const studentId = req.params.id;
  console.log(studentId);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Obtener los datos del cuerpo de la solicitud
    const { observacionId, tipoFirma } = req.body;

    // Verificar si se subió un archivo de audio
    if (!req.file) {
      return res.status(400).json({ msg: 'Por favor, sube un archivo de audio' });
    }

    const studentModel = new StudentModel();
    const downloadURL = await studentModel.uploadFirma(observacionId, tipoFirma, req.file, studentId);

    // Enviar respuesta exitosa con la URL de descarga
    res.json({ downloadURL });
  } catch (error) {
    console.error('Error al subir la firma de audio:', error);
    res.status(500).send('Error del servidor');
  }
};
exports.updateObservacion = async (req, res) => {
  try {
    const observacionId = req.params.id;
    const updatedObservacion = req.body;
    const studentModel = new StudentModel();
    await studentModel.updateObservacion(observacionId, updatedObservacion);
    res.status(200).json({ message: 'Observación actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la observación' });
  }
};

exports.deleteObservacion = async (req, res) => {
  try {
    const observacionId = req.params.id;
    const studentModel = new StudentModel();
    await studentModel.deleteObservacion(observacionId);
    res.status(200).json({ message: 'Observación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la observación' });
  }
};
exports.addObservacion = async (req, res) => {
  try {
    const { observacionData, studentId } = req.body;
    const studentModel = new StudentModel();
    await studentModel.addObservacion(observacionData, studentId);
    res.status(201).json({ message: "Observación añadida exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir la observación" });
  }
};