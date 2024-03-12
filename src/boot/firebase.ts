import { boot } from 'quasar/wrappers';
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBPO-ZU9UVWjk_X4cVeZKkycm6_4KYHHXI',
  authDomain: 'markdown-editor-da01c.firebaseapp.com',
  projectId: 'markdown-editor-da01c',
  storageBucket: 'markdown-editor-da01c.appspot.com',
  messagingSenderId: '871529311124',
  appId: '1:871529311124:web:417815002697db75c4bd81',
  measurementId: 'G-B13PYS9T88',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const analytics = getAnalytics(firebaseApp);

const db = getFirestore(firebaseApp);

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
});

export { firebaseApp, auth, db };
