import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Identificadores públicos del proyecto Firebase de Flystock (mismos del POS).
// Solo se importa desde rutas de panel/login: el catálogo público no carga Firebase.
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: "AIzaSyACm7TGJd947IjytjCBVmvfkvEf0wY7mns",
      authDomain: "flystockapp.firebaseapp.com",
      projectId: "flystockapp",
      appId: "1:657599709899:web:bbbd49a49a58522b95d14e",
    });

export const auth = getAuth(app);
