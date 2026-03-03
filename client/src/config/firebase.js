// Firebase client configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD5qde0wgzKsZDwgBR_hJr_fY0f4S79WKk",
    authDomain: "campuscrib-b0214.firebaseapp.com",
    projectId: "campuscrib-b0214",
    storageBucket: "campuscrib-b0214.firebasestorage.app",
    messagingSenderId: "73742731413",
    appId: "1:73742731413:web:3422c3a5911609b315b39c",
    measurementId: "G-C74ZDHX684",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;
