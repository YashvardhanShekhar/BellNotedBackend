// .puppeteerrc.cjs
const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
	// change Puppeteer cache directory to a folder INSIDE your repo so it gets deployed
	cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
