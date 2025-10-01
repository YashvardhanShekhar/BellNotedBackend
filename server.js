import express from "express";
import bodyParser from "body-parser";
import {
	encryptPassword,
	decryptPassword,
} from "./services/passwordMethods.js";
import {
	checkCredentials,
	scrapeTodayAbsentsWithFaculty,
} from "./services/pupppeteer.js";
import { sendPushNotification } from "./services/sendNotification.js";
import { addUser, fetchAllUsers, fetchUser } from "./services/firestore.js";

const app = express();
app.use(bodyParser.json());

app.get("/check/:userId", async (req, res) => {
	try {
		const uid = req.params.userId;
		const user = await fetchUser(uid);
		if (user == null)
			return res
				.status(500)
				.json({ success: false, error: "no such user exists" });

		let { id, password, token } = user;

		const pass = decryptPassword(password);
		const isValid = await checkCredentials(id, pass);
		console.log(isValid);
		if (!isValid) {
			await sendPushNotification(
				"Your have changed your password",
				"please re-register your credentials",
				token
			);
		}
		// Check attendance for today
		const absentPeriods = await scrapeTodayAbsentsWithFaculty(id, pass);
		console.log(absentPeriods);
		await sendPushNotification(absentPeriods, token);
		return res.json({ success: true });
	} catch (error) {
		console.error("Error in checking:", error);
		return res.status(500).json({ success: false, error: error.message });
	}
});

app.post("/register", async (req, res) => {
	try {
		const { id, password, fcmToken } = req.body;
		console.log("-"+id+"-")

		if (!id || !password || !fcmToken) {
			return res
				.status(400)
				.json({ success: false, error: "Missing fields" });
		}

		const isValid = await checkCredentials(id, password);

		if (!isValid) {
			return res
				.status(401)
				.json({ success: false, error: "Invalid ID or password" });
		}

		const encryptedPass = encryptPassword(password);

		await addUser(id, encryptedPass, fcmToken);

		return res.json({ success: true });
	} catch (error) {
		console.error("Error in checkCredentials:", error);
		return res.status(500).json({ success: false, error: error.message });
	}
});

app.get("/checkAllUsers", async (req, res) => {
	try {
		const users = await fetchAllUsers(); // [{id, pass, token}, ...]
		for (const user of users) {
			let { id, pass, token } = user;
			pass = decryptPassword(pass);
			const isValid = await checkCredentials(id, pass);
			if (!isValid) {
				await sendPushNotification(
					"Your have changed your password",
					"please re-register your credentials",
					token
				);
				continue;
			}
			// Check attendance for today
			const absentPeriods = await scrapeTodayAbsentsWithFaculty(id, pass);
			console.log(absentPeriods);
			await sendPushNotification(absentPeriods, token);
		}

		return res.json({
			success: true,
			message: "Attendance check completed",
		});
	} catch (error) {
		console.error("Error checking all users:", error);
		return res.status(500).json({ success: false, error: error.message });
	}
});

app.listen(3000, () => {
	console.log("✅ API running on http://localhost:3000");
});
