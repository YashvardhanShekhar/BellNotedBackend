import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	doc,
	setDoc,
	getDocs,
} from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
	measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // This 'db' is now globally available in this module

export const addUser = async (id, encryptedPass, token) => {
	await setDoc(
		doc(db, "users", id),
		{
			password: encryptedPass, // Storing as 'password'
			token: token,
		},
		{ merge: true }
	);
	console.log(`User ${id} added/updated successfully.`);
};

// *** CHANGE 2: Remove 'db' from the function's arguments. It will use the 'db' from the module scope. ***
export const fetchAllUsers = async () => {
	const usersCollectionRef = collection(db, "users"); // Uses the module-scoped 'db'
	const querySnapshot = await getDocs(usersCollectionRef);

	const users = [];
	querySnapshot.forEach((userDoc) => {
		// Renamed 'doc' to 'userDoc' for clarity
		const data = userDoc.data();
		users.push({
			id: userDoc.id,
			// *** CHANGE 3: Read 'password' field, not 'pass' ***
			pass: data.password || null, // Now correctly reads the 'password' field
			token: data.token || null,
		});
	});

	return users;
};
