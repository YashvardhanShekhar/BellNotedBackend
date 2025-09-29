import puppeteer from "puppeteer";
import path from "path";
import os from "os";

export async function scrapeTodayAbsentsWithFaculty(username, password) {
	let browser;
	try {
		const platform = os.platform();

		let executablePath;
		if (platform === "win32") {
			executablePath = path.resolve(
				".cache/puppeteer/chrome/win64-140.0.7339.207/chrome-win64/chrome.exe"
			);
		} else {
			executablePath = path.resolve(
				".cache/puppeteer/chrome/linux-140.0.7339.207/chrome-linux64/chrome"
			);
		}

		browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			executablePath,
		});

		const page = await browser.newPage();

		// 1️⃣ Login
		await page.goto("https://erp.psit.ac.in/", {
			waitUntil: "networkidle2",
			timeout: 60000,
		});
		await page.type("#emailAddress", username);
		await page.type("#password", password);
		await Promise.all([
			page.click(".btn-theme"),
			page.waitForNavigation({ waitUntil: "networkidle2" }),
		]);

		// 2️⃣ Scrape Attendance
		await page.goto("https://erp.psit.ac.in/Student/MyAttendanceDetail", {
			waitUntil: "networkidle2",
			timeout: 60000,
		});
		const today = new Date();
		const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
		const dayNames = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		const todayDayName = dayNames[today.getDay()];
		const absentEntries = await page.evaluate((todayStr) => {
			const rows = Array.from(
				document.querySelectorAll("#data-table-buttons tbody tr")
			);
			const result = [];
			rows.forEach((row) => {
				const cols = row.querySelectorAll("td");
				const date = cols[1]?.innerText.trim();
				if (date === todayStr) {
					for (let i = 2; i < cols.length; i++) {
						const status = cols[i]?.innerText.trim().toUpperCase();
						if (status === "ABS") {
							result.push({ periodIndex: i - 1 });
						}
					}
				}
			});
			return result;
		}, todayStr);

		// 3️⃣ Scrape Timetable
		await page.goto("https://erp.psit.ac.in/Student/MyTimeTable", {
			waitUntil: "networkidle2",
			timeout: 60000,
		});
		const timetable = await page.evaluate((todayDayName) => {
			const rows = Array.from(
				document.querySelectorAll("table.table tbody tr")
			);
			const dayRow = rows.find(
				(row) =>
					row.querySelector("td")?.innerText.trim() === todayDayName
			);
			if (!dayRow) return {};
			const cols = dayRow.querySelectorAll("td");
			const map = {};
			for (let i = 1; i < cols.length; i++) {
				// skip first column (Day)
				const h5 = cols[i].querySelector("h5");
				if (h5) {
					const text = h5.innerText.trim(); // [ Faculty Name ] ...
					const nameMatch = text.match(/\[\s*(.*?)\s*\]/);
					map[i] = nameMatch ? nameMatch[1] : "";
				}
			}
			return map; // key = periodIndex (1-based), value = faculty
		}, todayDayName);
		
		// 4️⃣ Combine absent entries with faculty
		const finalAbsentData = absentEntries.map((a) => ({
			period: a.periodIndex,
			faculty: timetable[a.periodIndex] || "Unknown",
		}));
		console.log(finalAbsentData)

		return finalAbsentData;
	} catch (err) {
		console.error("Error checking credentials:", err);
		return false;
	} finally {
		if (browser) await browser.close();
	}
}

export async function checkCredentials(username, password) {
	let browser;
	try {
		const platform = os.platform();

		let executablePath;
		if (platform === "win32") {
			executablePath = path.resolve(
				".cache/puppeteer/chrome/win64-140.0.7339.207/chrome-win64/chrome.exe"
			);
		} else {
			executablePath = path.resolve(
				".cache/puppeteer/chrome/linux-140.0.7339.207/chrome-linux64/chrome"
			);
		}

		browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			executablePath,
		});
		console.log("Chromium path:", puppeteer.executablePath());

		const page = await browser.newPage();

		await page.goto("https://erp.psit.ac.in/", {
			waitUntil: "networkidle2",
			timeout: 60000,
		});

		// Fill login form
		await page.type("#emailAddress", username);
		await page.type("#password", password);

		// Click sign in and wait for navigation
		await Promise.all([
			page.click(".btn-theme"),
			page.waitForNavigation({ waitUntil: "networkidle2" }),
		]);

		// Check if still on login page (login failed)
		const url = page.url();
		if (url.includes("/Student")) {
			return true; // Login successful
		}
		return false; // Login failed
	} catch (err) {
		console.error("Error checking credentials:", err);
		return false;
	} finally {
		if (browser) await browser.close();
	}
}
