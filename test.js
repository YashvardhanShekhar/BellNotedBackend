import axios from "axios";
import { sendPushNotification } from "./services/sendNotification.js";

async function test() {
	console.log(await sendPushNotification(
		[
			{ period: 1, faculty: "Deepak Gupta" },
			{ period: 2, faculty: "Deepak Gupta" },
			// { period: 5, faculty: "Vipin Kumar Jaiswal" },
			{ period: 6, faculty: "Vipin Kumar Jaiswal" },
			{ period: 7, faculty: "Subhash Singh Parihar" },
			// { period: 8, faculty: "Subhash Singh Parihar" },
		],
		"dHMNQ_spQRKyc9fzHvngV4:APA91bGCA1mR1-sREJdB1bmnTw-OFzcG0J02gdqqD0pKgeokBVAQMjczMbWN2fMU4h6ES0oZhQXPVumU-fMgjHgJcvgpsREamPIyjR-syaAJWpJbD8oebzM"
	));
}

test();
