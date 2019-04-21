// const firebaseAction = jest.fn(() => Promise.resolve({}));

// module.exports = {
//   firebaseAction
// };

// __mocks__/firebaseAppMock.js
//import firebaseMocks from "./firebaseMocks";

// export default {
//   bindFirebaseRef: (key, source) => {},
//   firebaseAction: (action, payload) => {
//     return {};
//   }
// };

// editField: firebaseAction(({}, { ref, cell }) => {
//   ref.update(cell);
// }),

//import firebasemock from 'firebase-mock'
//const firebasemock = require("../node_modules/firebase-mock/src/index.js");

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
