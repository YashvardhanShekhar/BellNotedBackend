import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const algorithm = "aes-256-cbc"; // AES encryption
const secretKey = process.env.SECRET; // Must be 32 chars for aes-256
const ivLength = 16; // AES block size

// Encrypt a password
export function encryptPassword(password) {
	const iv = crypto.randomBytes(ivLength);
	const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
	let encrypted = cipher.update(password, "utf8", "hex");
	encrypted += cipher.final("hex");
	// Return iv + encrypted so we can decrypt later
	return iv.toString("hex") + ":" + encrypted;
}

// Decrypt a password
export function decryptPassword(encrypted) {
	const [ivHex, encryptedText] = encrypted.split(":");
	const iv = Buffer.from(ivHex, "hex");
	const decipher = crypto.createDecipheriv(
		algorithm,
		Buffer.from(secretKey),
		iv
	);
	let decrypted = decipher.update(encryptedText, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

// Example usage
// const password = "MyPassWord123";
// const encrypted = encryptPassword(password);
// console.log("Encrypted:", encrypted);
// const decrypted = decryptPassword(encrypted);
// console.log("Decrypted:", decrypted);
