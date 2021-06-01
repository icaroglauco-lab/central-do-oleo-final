import firebase from 'firebase/app';
import 'firebase/firestore';

var firebaseConfig = {
    apiKey: "AIzaSyALBxdg2Yhwe-LtQYaEi9AsjQet0AAxVgk",
    authDomain: "central-do-oleo-vca.firebaseapp.com",
    projectId: "central-do-oleo-vca",
    storageBucket: "central-do-oleo-vca.appspot.com",
    messagingSenderId: "1048822804632",
    appId: "1:1048822804632:web:6999954a71230785e6e0ed",
    measurementId: "G-VS53EL5TRL"
  };

const app = firebase.initializeApp(firebaseConfig);

export const firestore = app.firestore();    