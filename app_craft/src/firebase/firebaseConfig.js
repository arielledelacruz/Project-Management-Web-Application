// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {getFirestore, collection, getDocs} from '@firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBXew3VWmeuTZL2KOdLPeceZNemIvGalg",
  authDomain: "appcraft-6c855.firebaseapp.com",
  projectId: "appcraft-6c855",
  storageBucket: "appcraft-6c855.appspot.com",
  messagingSenderId: "981092381277",
  appId: "1:981092381277:web:c32b577501f2be83cfd3b4",
  measurementId: "G-TTSJWFL5FD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
//const db = getFirestore()
//const colRef = collection(db, 'tasks')

//getDocs(colRef).then((snapshot) => {console.log(snapshot.docs)})
export const db = getFirestore(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
