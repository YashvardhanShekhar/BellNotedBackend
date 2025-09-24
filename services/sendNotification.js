import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const PROJECT_ID = "bellnoted";
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

async function getAccessToken() {
	const auth = new GoogleAuth({
		credentials: serviceAccount,
		scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
	});

	const client = await auth.getClient();
	const tokenResponse = await client.getAccessToken();
	return tokenResponse.token;
}

export async function sendPushNotification(title, body, token) {
	try {
		const accessToken = await getAccessToken();

		const message = {
			message: {
				token,
				notification: { title, body },
			},
		};

		const response = await fetch(FCM_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		});

		const data = await response.json();
		console.log("FCM response:", data);
		return data;
	} catch (err) {
		console.error("Error sending push notification:", err);
		throw err;
	}
}
