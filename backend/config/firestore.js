const admin = require("firebase-admin")
const serviceAccount = require("../kimhakli-8f416-firebase-adminsdk-fbsvc-0f4683b851.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;