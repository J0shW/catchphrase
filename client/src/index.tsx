import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjnS58GL5bd0TkD0ZtMN5ELfTI5WN68PE",
  authDomain: "catchphrase-649dd.firebaseapp.com",
  projectId: "catchphrase-649dd",
  storageBucket: "catchphrase-649dd.appspot.com",
  messagingSenderId: "1082332819140",
  appId: "1:1082332819140:web:0c035c1502d583b04a2391",
  measurementId: "G-MQN6Z0CN1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

document.body.classList.add('bg-catchphrase');


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <App />
);
