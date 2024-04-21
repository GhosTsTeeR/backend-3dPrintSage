const observationApp = require("../../config/firebaseAppObservation");


class UserModel {
  constructor() {
    this.db = observationApp.firestore();
  }
  

  async createUser(userData) {
    try {
      if (
        !userData.userData.uid ||
        typeof userData.userData.uid !== "string" ||
        userData.userData.uid.trim() === ""
      ) {
        throw new Error("El ID de usuario no es válido");
      }

      const newUserRef = await this.db
        .collection("users")
        .doc(userData.userData.uid)
        .set({
          uid: userData.userData.uid,
          email: userData.userData.email,
          username: userData.userData.displayName,
          photoURL: userData.userData.photoURL,
        });

      return { uid: newUserRef.id };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    const snapshot = await this.db.collection("users").doc(userId).get();
    return snapshot.data();
  }
}

module.exports = UserModel;
