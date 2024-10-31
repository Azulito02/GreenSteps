import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyAnp4mi4Ve3F_jZBEkeK20ppwYgzRdwtyU",
    authDomain: "greensteps-51ccc.firebaseapp.com",
    projectId: "greensteps-51ccc",
    storageBucket: "greensteps-51ccc.appspot.com",
    messagingSenderId: "383097778559",
    appId: "1:383097778559:web:bdba5cbc62f17f9e8e6a4a",
    measurementId: "G-9CLKJRN4V0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializa el almacenamiento

export { db, storage }; 
