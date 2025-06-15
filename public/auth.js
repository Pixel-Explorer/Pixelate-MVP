import firebaseConfig from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Attach Google authentication handlers

const googleSignInButton = document.querySelector('#google-signin-btn');
const googleSignUpButton = document.querySelector('#google-signup-btn');

if (googleSignInButton) {
  googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const { user } = result;
        return user.getIdToken().then((idToken) => {
          return fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'CSRF-Token': document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute('content'),
            },
            body: JSON.stringify({ idToken, email: user.email }),
          });
        });
      })
      .then(() => {
        return firebase.auth().signOut();
      })
      .then(() => {
        window.location.assign('/dashboard');
      })
      .catch((err) => {
        console.error('Google Sign-in Error:', err);
      });
  });
}

if (googleSignUpButton) {
  googleSignUpButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .catch((error) => {
        console.error('Error signing up:', error);
      });
  });
}


