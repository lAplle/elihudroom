// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBl6wpYlIpeufU2dtQUqRq66tuqJQXrwQk",
	authDomain: "elihudroom.firebaseapp.com",
	projectId: "elihudroom",
	storageBucket: "elihudroom.appspot.com",
	messagingSenderId: "713710242816",
	appId: "1:713710242816:web:824e1cb712e9d9c87e9ce5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
