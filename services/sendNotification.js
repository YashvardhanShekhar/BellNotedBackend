import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const PROJECT_ID = "bellnoted"; // Make sure this matches Firebase Project ID
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

export async function sendPushNotification(absentPeriods, token) {
	if (!token || typeof token !== "string") {
		throw new Error("Invalid FCM token provided");
	}

	try {
		const accessToken = await getAccessToken();

		// Build notification text
		let title, body;
		if (absentPeriods.length > 0) {
			const periods = absentPeriods.map((item) => item.period);
			let periodsString = "";
			if (periods.length === 1) periodsString = `lecture ${periods[0]}`;
			else if (periods.length === 2)
				periodsString = `lectures ${periods[0]} and ${periods[1]}`;
			else {
				const last = periods.pop();
				periodsString = `lectures ${periods.join(", ")} and ${last}`;
			}
			title = `You have ${absentPeriods.length} absent${
				absentPeriods.length !== 1 ? "s" : ""
			} today`;
			body = `in ${periodsString}`;
		} else {
			title = "Perfect Attendance Today! ✨";
			body = "0 absents today. Let's keep this streak going!";
		}

		// Build FCM message
		let message = {
			message: {
				token: token,
				notification: { title, body },
				data: { absentPeriods: JSON.stringify(absentPeriods || []) },
			},
		};

		let response = await fetch(FCM_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		});

		// message = {
		// 	message: {
		// 		token: token,
		// 		notification: { title, body },
		// 		apns: { payload: { aps: { badge: absentPeriods.length } } },
		// 		android: {
		// 			notification: { notificationCount: absentPeriods.length },
		// 		},
		// 		data: { absentPeriods: JSON.stringify(absentPeriods || []) },
		// 	},
		// };

		// response = await fetch(FCM_ENDPOINT, {
		// 	method: "POST",
		// 	headers: {
		// 		Authorization: `Bearer ${accessToken}`,
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify(message),
		// });

		const data = await response.json();

		// Check for common errors
		if (data.error) {
			if (data.error.status === "NOT_FOUND") {
				console.error(
					"FCM token not found. Make sure it's valid and registered."
				);
			} else {
				console.error("FCM error:", data.error);
			}
			return null;
		}

		return true;
	} catch (err) {
		console.error("Error sending push notification:", err);
		return false;
	}
}
