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
import { addUser, fetchAllUsers } from "./services/firestore.js";

const app = express();
app.use(bodyParser.json());


app.post("/register", async (req, res) => {
	try {
		const { id, password, fcmToken } = req.body;

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

			if (absentPeriods.length > 0) {
				// Format periods string naturally
				const periods = absentPeriods.map((item) => item.period);

				let periodsString = "";
				if (periods.length === 1) {
					periodsString = `lecture ${periods[0]}`;
				} else if (periods.length === 2) {
					periodsString = `lectures ${periods[0]} and ${periods[1]}`;
				} else {
					const last = periods.pop();
					periodsString = `lectures ${periods.join(
						", "
					)} and ${last}`;
				}

				// Send notification if user has absents
				await sendPushNotification(
					`You have ${absentPeriods.length} absent${absentPeriods.length!=1 && "s"} today`,
					`in ${periodsString}`,
					token
				);
			} else {
				await sendPushNotification(
					"Perfect Attendance Today! ✨",
					"0 absents today. Let's keep this streak going!",
					token
				);
			}
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
