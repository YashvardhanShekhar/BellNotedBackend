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

export async function sendPushNotification(absentPeriods, token) {
	try {
		const accessToken = await getAccessToken();
		let title, body;

		if (absentPeriods.length > 0) {
			const periods = absentPeriods.map((item) => item.period);

			let periodsString = "";
			if (periods.length === 1) {
				periodsString = `lecture ${periods[0]}`;
			} else if (periods.length === 2) {
				periodsString = `lectures ${periods[0]} and ${periods[1]}`;
			} else {
				const last = periods.pop();
				periodsString = `lectures ${periods.join(", ")} and ${last}`;
			}

			title = `You have ${absentPeriods.length} absent${
				absentPeriods.length != 1 && "s"
			} today`;
			body = `in ${periodsString}`;
		} else {
			title = "Perfect Attendance Today! ✨";
			body = "0 absents today. Let's keep this streak going!";
		}

		const message = {
			message: {
				token,
				notification: { title, body },
				data: {
					absentPeriods: JSON.stringify(absentPeriods || []),
				},
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
