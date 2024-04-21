
const { v4: uuidv4 } = require('uuid');
const observationApp = require('../../config/firebaseAppObservation');
const storage = observationApp.storage().bucket();
class StudentModel {
  constructor() {
    this.db = observationApp.firestore();
  }

  async createStudent(studentData) {
    await this.db.collection("students").add(studentData);
  }

  async createStudentMassive(studentsData) {
    const createdStudents = [];
    const observationsBatch = this.db.batch();
  
    for (const studentData of studentsData) {
      const { id, observaciones, ...studentFields } = studentData;
  
      const studentRef = this.db.collection('students').doc(id);
      const studentSnapshot = await studentRef.get();
  
      if (!studentSnapshot.exists) {
        const processedObservations = observaciones.map((observation) => {
          if (!observation.id) {
            observation.id = uuidv4();
          }
          return observation;
        });
  
        const observationRefs = processedObservations.map((observation) => {
          const observationRef = this.db.collection('observations').doc(observation.id);
          observationsBatch.set(observationRef, { ...observation, studentId: id });
          return observationRef;
        });
  
        await studentRef.set({ ...studentFields, observaciones: observationRefs.map((ref) => ref.id) });
        createdStudents.push({ id, ...studentFields, observaciones: processedObservations });
      }
    }
  
    await observationsBatch.commit();
    return createdStudents;
  }
  async getStudents() {
    const snapshot = await this.db.collection("students").get();
    const students = [];
  
    for (const doc of snapshot.docs) {
      const student = { id: doc.id, ...doc.data() };
  
      // Obtener las observaciones relacionadas con el estudiante
      const observationsSnapshot = await this.db
        .collection("observations")
        .where("studentId", "==", doc.id)
        .get();
  
      const observaciones = [];
      observationsSnapshot.forEach((observationDoc) => {
        observaciones.push({ id: observationDoc.id, ...observationDoc.data() });
      });
  
      student.observaciones = observaciones;
      students.push(student);
    }
  
    return students;
  }
  async getStudentById(studentId) {
    const snapshot = await this.db.collection("students").doc(studentId).get();
    return { id: snapshot.id, ...snapshot.data() };
  }

  async editStudentById(studentId, editedStudentData) {
    console.log(studentId);
    console.log(editedStudentData);
    try {
      const studentRef = this.db.collection("students").doc(studentId);
      const studentDoc = await studentRef.get();
  
      if (studentDoc.exists) {
        const existingData = studentDoc.data();
        const newData = {};
  
        // Verificar y agregar los campos existentes en los datos actualizados
        for (const key in existingData) {
          if (editedStudentData.hasOwnProperty(key)) {
            newData[key] = editedStudentData[key];
          } else {
            newData[key] = existingData[key];
          }
        }
  
        // Agregar campos nuevos que no existan en los datos existentes
        for (const key in editedStudentData) {
          if (!existingData.hasOwnProperty(key)) {
            newData[key] = editedStudentData[key];
          }
        }
  
        // Actualizar los subcampos de updatedData
        if (editedStudentData.updatedData) {
          const updatedData = editedStudentData.updatedData;
          for (const key in updatedData) {
            newData[key] = updatedData[key];
          }
        }
  
        // Actualizar el documento con los datos combinados
        await studentRef.set(newData);
  
        return { success: true, message: "Estudiante actualizado exitosamente" };
      } else {
        return { success: false, message: "El estudiante no existe" };
      }
    } catch (error) {
      console.error("Error al actualizar el estudiante:", error);
      return { success: false, message: "Ocurrió un error al actualizar el estudiante" };
    }
  }
  async uploadFirma(observacionId, tipoFirma, file, studentId) {
    try {
      // Subir el archivo a la carpeta "audio_file/"
      const fileName = `audio_file/${observacionId}_${tipoFirma}.wav`;
      const fileRef = storage.file(fileName);
  
      try {
        // Verificar si ya existe un archivo con la misma observacionId y tipoFirma
        await fileRef.getMetadata();
        // Si el archivo existe, eliminarlo antes de subir el nuevo
        await fileRef.delete();
      } catch (error) {
        if (error.code !== 404) {
          throw error;
        }
        // Si el error es 404 (archivo no encontrado), no hacer nada y continuar con la subida del nuevo archivo
      }
  
      // Subir el nuevo archivo
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      // Obtener la URL del archivo subido
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });
  
      // Crear un nuevo documento en la colección "firmas"
      const firmaData = {
        observacionId,
        tipoFirma,
        url,
        studentId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const firmaRef = this.db.collection('firmas').doc();
      await firmaRef.set(firmaData);
  
      // Actualizar el campo correspondiente en la colección "observations"
      const observationRef = this.db.collection('observations').doc(observacionId);
      const observationDoc = await observationRef.get();
      if (observationDoc.exists) {
        const campoActualizar = tipoFirma === 'estudiante' ? 'firmaEstudiante' : 'firmaPadre';
        await observationRef.update({
          [campoActualizar]: url,
        });
      } else {
        console.error(`La observación con ID ${observacionId} no existe`);
      }
  
      return url;
    } catch (error) {
      console.error('Error al subir el archivo a Firebase Storage:', error);
      throw new Error('Error al subir el archivo a Firebase Storage');
    }
  }
  async addObservacion(observacionData, studentId) {
    try {
      // Generar una ID única utilizando uuidv4()
      const observacionId = uuidv4();
  
      // Crear un nuevo documento en la colección "observations" con la ID generada
      const observacionRef = this.db.collection("observations").doc(observacionId);
      await observacionRef.set({
        id: observacionId,
        ...observacionData,
        studentId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      // Actualizar el campo "observaciones" en el documento del estudiante
      const studentRef = this.db.collection("students").doc(studentId);
      await studentRef.update({
        observaciones: admin.firestore.FieldValue.arrayUnion(observacionId),
      });
    } catch (error) {
      console.error("Error al añadir la observación:", error);
      throw new Error("Error al añadir la observación");
    }
  }
  async deleteObservacion(observacionId) {
    try {
      // Obtener la observación antes de eliminarla
      const observationRef = this.db.collection("observations").doc(observacionId);
      const observationDoc = await observationRef.get();
  
      if (observationDoc.exists) {
        const observationData = observationDoc.data();
  
        // Eliminar la observación
        await observationRef.delete();
  
        // Buscar y eliminar la firma del estudiante si existe
        const studentSignatureQuery = this.db.collection("firmas")
          .where("observacionId", "==", observacionId)
          .where("tipoFirma", "==", "estudiante")
          .limit(1);
        const studentSignatureSnapshot = await studentSignatureQuery.get();
        if (!studentSignatureSnapshot.empty) {
          const studentSignatureDoc = studentSignatureSnapshot.docs[0];
          await studentSignatureDoc.ref.delete();
          
          // Eliminar el archivo de la firma del estudiante de Firebase Storage
          const studentSignatureFileRef = storage.file(`audio_file/${observacionId}_estudiante.wav`);
          await studentSignatureFileRef.delete().catch(() => {});
        }
  
        // Buscar y eliminar la firma del padre si existe
        const parentSignatureQuery = this.db.collection("firmas")
          .where("observacionId", "==", observacionId)
          .where("tipoFirma", "==", "padre")
          .limit(1);
        const parentSignatureSnapshot = await parentSignatureQuery.get();
        if (!parentSignatureSnapshot.empty) {
          const parentSignatureDoc = parentSignatureSnapshot.docs[0];
          await parentSignatureDoc.ref.delete();
          
          // Eliminar el archivo de la firma del padre de Firebase Storage
          const parentSignatureFileRef = storage.file(`audio_file/${observacionId}_padre.wav`);
          await parentSignatureFileRef.delete().catch(() => {});
        }
  
        // Actualizar el campo "observaciones" en el documento del estudiante
        const studentRef = this.db.collection("students").doc(observationData.studentId);
        await studentRef.update({
          observaciones: admin.firestore.FieldValue.arrayRemove(observacionId),
        });
      } else {
        console.error(`La observación con ID ${observacionId} no existe`);
      }
    } catch (error) {
      console.error("Error al eliminar la observación:", error);
      throw new Error("Error al eliminar la observación");
    }
  }
}

module.exports = StudentModel;