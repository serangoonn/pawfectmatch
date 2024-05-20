// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARw5lTSBHAtwSoBYo9NMKPAYpkJTHD92I",
  authDomain: "pawfectmatch-ffc52.firebaseapp.com",
  projectId: "pawfectmatch-ffc52",
  storageBucket: "pawfectmatch-ffc52.appspot.com",
  messagingSenderId: "788475215440",
  appId: "1:788475215440:web:d3ae5ae094eef643fc5b55",
  measurementId: "G-N0J2W2GBJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };