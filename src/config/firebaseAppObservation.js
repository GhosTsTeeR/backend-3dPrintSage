const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfigAppObservation');
var serviceAccount = require("./observation_key/student-observation-app-firebase-adminsdk-48h0c-f5225c4b25.json");

const observationApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  storageBucket: firebaseConfig.storageBucket
}, 'observationApp'); // Agrega un nombre único para esta aplicación

module.exports = observationApp;