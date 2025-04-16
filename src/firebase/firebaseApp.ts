// firebaseApp.ts
// Inicializa la app de Firebase una sola vez y exporta la instancia
import { initializeApp, getApps, getApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

// Solo inicializa si no existe ninguna app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
