import firebase from "firebase";

// Initialize Firebase
var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};
const firebaseApp = firebase.initializeApp(config);
export const db = firebaseApp.database();
