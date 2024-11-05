import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importa correctamente getDoc y doc
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAnp4mi4Ve3F_jZBEkeK20ppwYgzRdwtyU",
    authDomain: "greensteps-51ccc.firebaseapp.com",
    projectId: "greensteps-51ccc",
    storageBucket: "greensteps-51ccc.appspot.com",
    messagingSenderId: "383097778559",
    appId: "1:383097778559:web:bdba5cbc62f17f9e8e6a4a",
    measurementId: "G-9CLKJRN4V0"
};

// Inicializar Firebase solo si no ha sido inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

// Inicializar Auth solo si no ha sido inicializado antes
let auth;
try {
    auth = getAuth(app);
} catch (error) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

// Función para verificar el rol del usuario
async function verificarRolUsuario(userId) {
    try {
        // Verifica que db esté inicializado y que userId sea un string
        if (!db || typeof userId !== "string") {
            throw new Error("Error: Parámetros inválidos para verificar el rol del usuario.");
        }

        const docRef = doc(db, "usuarios", userId); // Referencia al documento en la colección 'usuarios'
        const docSnap = await getDoc(docRef); // Obtener el documento

        if (docSnap.exists()) {
            const userData = docSnap.data();
            return userData.rol; // Retorna el rol del usuario si existe
        } else {
            console.log("No existe el documento");
            return null;
        }
    } catch (error) {
        console.error("Error al verificar el rol del usuario: ", error);
        throw error;
    }
}

export { db, storage, auth, verificarRolUsuario };
