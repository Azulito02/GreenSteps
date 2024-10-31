// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import basededatos from BD;
import 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);