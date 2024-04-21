const printSageApp = require('../../config/firebaseApp3dPrintSage');

class CursesModel {
  constructor() {
    this.db = printSageApp.firestore();
  }

  async addDataCurse(id, name, data) {
    try {
      const coleccion = 'curses';
      const coleccionRef = this.db.collection(coleccion);

      const nuevoDocumentoRef = coleccionRef.doc();
      const nuevoDocumentoId = nuevoDocumentoRef.id;

      await nuevoDocumentoRef.set({
        id: nuevoDocumentoId,
        idUsuario: id,
        name: name,
        data: data,
      });

      return { status: 200, data: nuevoDocumentoId };
    } catch (error) {
      console.error('Error al almacenar datos del curso en Firebase:', error);
      return { status: 500, data: error };
    }
  }

  async getDataCurse(id) {
    try {
      const coleccion = 'curses';
      const curseRef = this.db.collection(coleccion).doc(id);
      const curseDoc = await curseRef.get();

      if (curseDoc.exists) {
        const datos = curseDoc.data();
        return { status: 200, data: datos };
      } else {
        return { status: 404, data: null };
      }
    } catch (error) {
      console.error('Error al obtener datos del curso en Firebase:', error);
      return { status: 500, data: null };
    }
  }

  async getAllCurses() {
    try {
      const coleccion = 'curses';
      const cursesSnapshot = await this.db.collection(coleccion).get();

      const curses = [];
      cursesSnapshot.forEach((doc) => {
        curses.push(doc.data());
      });

      return { status: 200, data: curses };
    } catch (error) {
      console.error('Error al obtener los cursos en Firebase:', error);
      return { status: 500, data: null };
    }
  }

  async getDataCurseUser(id, userId) {
    try {
      const coleccion = 'my_curses';
      const query = this.db.collection(coleccion)
        .where('idCurse', '==', id)
        .where('idUser', '==', userId);
  
      const snapshot = await query.get();
  
      const documentosEncontrados = [];
      snapshot.forEach((doc) => {
        const datos = doc.data();
        const nombreDocumento = doc.id;
        documentosEncontrados.push({ nombre_documento: nombreDocumento, datos: datos });
      });
  
      return { status: 200, data: documentosEncontrados };
    } catch (error) {
      console.error('Error al consultar documentos:', error);
      return { status: 500, data: error };
    }
  }
  
  async addDataCurseUser(id, uid, nameCurse) {
    try {
      const coleccion = 'my_curses';
      const coleccionRef = this.db.collection(coleccion);
  
      const nuevoDocumentoRef = coleccionRef.doc();
      const nuevoDocumentoId = nuevoDocumentoRef.id;
  
      await nuevoDocumentoRef.set({
        id: nuevoDocumentoId,
        idCurse: id,
        idUser: uid,
        nameCurse: nameCurse,
        estateCurse: false,
      });
  
      return { status: 200, data: nuevoDocumentoId };
    } catch (error) {
      console.error('Error al almacenar datos del curso en Firebase:', error);
      return { status: 500, data: error };
    }
  }
  
  async modifyDataCurseUser(id, uid, position, estado) {
    try {
      const coleccion = 'my_curses';
      const coleccionRef = this.db.collection(coleccion);
  
      const query = coleccionRef
        .where('idCurse', '==', id)
        .where('idUser', '==', uid);
  
      const snapshot = await query.get();
      const documentosEncontrados = snapshot.docs;
  
      if (documentosEncontrados.length === 1) {
        const documentoExistente = documentosEncontrados[0];
        const datosDocumento = documentoExistente.data();
  
        if ('positions' in datosDocumento) {
          const posicionExistente = datosDocumento.positions.find(
            (posicion) => posicion.position === position
          );
  
          if (posicionExistente) {
            posicionExistente.estado = estado;
          } else {
            datosDocumento.positions.push({ position: position, estado: estado });
          }
        } else {
          datosDocumento.positions = [{ position: position, estado: estado }];
        }
  
        await documentoExistente.ref.set(datosDocumento);
  
        return { status: 200, data: documentoExistente.id };
      } else {
        return { status: 404, data: null };
      }
    } catch (error) {
      console.error('Error al modificar datos del curso en Firebase:', error);
      return { status: 500, data: error };
    }
  }
  
  async getCurseInfoUser(uid) {
    try {
      const coleccion = 'my_curses';
      const query = this.db.collection(coleccion).where('idUser', '==', uid);
  
      const snapshot = await query.get();
  
      const documentosEncontrados = [];
      snapshot.forEach((doc) => {
        const datos = doc.data();
        const nombreDocumento = doc.id;
        documentosEncontrados.push({ nombre_documento: nombreDocumento, datos: datos });
      });
  
      return { status: 200, data: documentosEncontrados };
    } catch (error) {
      console.error('Error al consultar documentos:', error);
      return { status: 500, data: error };
    }
  }
  
  async addFinalizateCurseUser(id, uid, stateCurse) {
    try {
      const coleccion = 'my_curses';
      const coleccionRef = this.db.collection(coleccion);
  
      const query = coleccionRef
        .where('idCurse', '==', id)
        .where('idUser', '==', uid);
  
      const snapshot = await query.get();
      const documentosEncontrados = snapshot.docs;
  
      if (documentosEncontrados.length === 1) {
        const documentoExistente = documentosEncontrados[0];
  
        await documentoExistente.ref.update({
          estateCurse: stateCurse,
        });
  
        return { status: 200, data: documentoExistente.id };
      } else {
        return { status: 404, data: null };
      }
    } catch (error) {
      console.error('Error al modificar datos del curso en Firebase:', error);
      return { status: 500, data: error };
    }
  }
}

module.exports = CursesModel;