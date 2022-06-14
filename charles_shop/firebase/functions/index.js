const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(async (req, res) => {
  let data = await db.collection("PRODUCT").doc("3CeuByGGxqvycrE5hjgF").get();
  console.log(data.data(), "data.data()");
  //functions.logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});
