const printSageApp = require("../../config/firebaseApp3dPrintSage");

class UserModel {
  constructor() {
    this.db = printSageApp.firestore();
  }

  async getUserById(uid) {
    try {
      const userRef = this.db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async modifyUser(uid, userData) {
    try {
      const userRef = this.db.collection('users').doc(uid);
      await userRef.set({
        id: uid,
        name: userData.name,
        cellPhone: userData.cellPhone,
        email: userData.email,
        document: userData.document,
        lastName: userData.lastName,
        position: userData.position,
        psswd: '',
        roll: 'usuario',
        userName: userData.userName,
      });

      const updatedUserDoc = await userRef.get();
      return updatedUserDoc.data();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;