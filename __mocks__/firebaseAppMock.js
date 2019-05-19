import firebase from "firebase";

const firebasemock = require("firebase-mock");
const mockdatabase = new firebasemock.MockFirebase();
//const mockfirestore = new firebasemock.MockFirestore();
mockdatabase.autoFlush(1);

const mocksdk = new firebasemock.MockFirebaseSdk(
  // RTDB
  path => (path ? mockdatabase.child(path) : mockdatabase),
  () => null
  // FIRESTORE
  // () => mockfirestore,
  // () => null,
  // () => null
);

const firebaseApp = mocksdk.initializeApp();
jest.mock("firebase", () => mocksdk);
const db = firebaseApp.database();

export default db;
