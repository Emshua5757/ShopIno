// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdH5tB-1Sin3zaEIBOUX7Odc0BU_NHdww",
  authDomain: "shopino-e7be0.firebaseapp.com",
  projectId: "shopino-e7be0",
  storageBucket: "shopino-e7be0.appspot.com",
  messagingSenderId: "205905447592",
  appId: "1:205905447592:web:0a7b0933336a4d4495509d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { 
    db, 
    auth, 
    storage, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    arrayUnion, 
    onAuthStateChanged, 
    ref, 
    getDownloadURL 
};
