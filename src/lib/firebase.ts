// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXj1YixJ-m6FFykpodM_7jehw7hbmw8oc",
  authDomain: "shreem-dry-fruits.firebaseapp.com",
  projectId: "shreem-dry-fruits",
  storageBucket: "shreem-dry-fruits.firebasestorage.app",
  messagingSenderId: "521123549248",
  appId: "1:521123549248:web:1ebc221735f3f1d55b8fa5",
  measurementId: "G-ER80TNR30Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);