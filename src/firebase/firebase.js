// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3gGgQjB1JMsWxHzTK831ZVGFsLhwV884",
  authDomain: "mdemo-42e46.firebaseapp.com",
  projectId: "mdemo-42e46",
  storageBucket: "mdemo-42e46.firebasestorage.app",
  messagingSenderId: "431712975273",
  appId: "1:431712975273:web:c683a90e5cb93437a5acb8",
  measurementId: "G-5HTVZYSED4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

export const db = getFirestore(app);