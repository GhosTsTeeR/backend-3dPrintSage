const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfigApp3dPrintSage');
var serviceAccount = require("./3dPrintSage_key/dprintsage-firebase-adminsdk-ehuno-98de0b50bd.json");

const printSageApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  storageBucket: firebaseConfig.storageBucket
}, 'printSageApp'); // Agrega un nombre único para esta aplicación

module.exports = printSageApp;