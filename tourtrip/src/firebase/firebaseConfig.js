// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAykbyhjKNhNFPcagzgWm1bK4SD_bRq5Mg",
  authDomain: "tourtripmangement.firebaseapp.com",
  projectId: "tourtripmangement",
  storageBucket: "tourtripmangement.firebasestorage.app",
  messagingSenderId: "364646026696",
  appId: "1:364646026696:web:b47dea5058fd85c65e84fd",
  measurementId: "G-0L1ZP57LVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
