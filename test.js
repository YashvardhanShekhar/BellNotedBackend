import axios from "axios";
import { sendPushNotification } from "./services/sendNotification.js";

async function test() {
	await sendPushNotification(
		[
			// { period: 1, faculty: "Deepak Gupta" },
			// { period: 2, faculty: "Deepak Gupta" },
			// { period: 5, faculty: "Vipin Kumar Jaiswal" },
			// { period: 6, faculty: "Vipin Kumar Jaiswal" },
			// { period: 7, faculty: "Subhash Singh Parihar" },
			{ period: 8, faculty: "Subhash Singh Parihar" },
		],
		"efKSnQxXSbi9Dne4r8MFvM:APA91bHeob2qsB-atf7B85qJAykEUd0lY42pb7U1uNAct0aUNmmeN5xTJSrSr0Y5WdanJn80QAS0TVRowq2MHLl3xrH4ZOaxfkSsMcSiBRCpznhaNgQCMxc"
	);
}

test();
