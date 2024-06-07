// Import the functions you need from the SDKs you need
// functions for firebase login/signup
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";

//functions for forgot password
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

//functions for storing user profile
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
// for login/signup
const app = initializeApp(firebaseConfig);
//const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


// for forgot password
if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

// for storing user profiles
const firestore = getFirestore(app);
const storage = getStorage(app);


// exporting
export { auth };
export { firebase }; 
export { firestore };
export { storage };