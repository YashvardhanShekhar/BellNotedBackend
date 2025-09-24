import axios from "axios";

async function test() {
	const res = await axios.post("https://bellnotedbackend.onrender.com/register", {
		id: "2301640100439",
		password: "password",
		fcmToken: "c64y8NOaQhOBRw4KPG8mFw:APA91bHMAZcFIgdUfZDg5NzyIFJztpY-7nOoxShbEEqvqDn7aTNKdq4aG1CnR7B00c30YY5pgSvDD61udow_E-1L6NEdUjiaCG0Mbj88qKcbv-ZOfnpbCBE",
	});
	const result = parse.JSON(res)
	console.log(result.data.data);
}

test();
