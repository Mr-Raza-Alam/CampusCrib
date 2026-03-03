// Firebase Admin SDK initialization
// Used to verify Firebase Auth tokens sent from the React frontend
const admin = require("firebase-admin");

// Firebase service account setup
// In production, use FIREBASE_SERVICE_ACCOUNT env variable (JSON string)
// In development, you can use a service account JSON file
const initializeFirebase = () => {
    if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            // For development — initialize without service account (limited features)
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
        }
        console.log("Firebase Admin initialized");
    }
};

initializeFirebase();

module.exports = admin;
