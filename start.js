import fs from "fs";
import ProductionModel from "./productionModel.js";
import { dbconnection } from "./dbconnect.js";
import SunnyBoy from "./sunnyboy.js";

// initialize model
const Production = ProductionModel.init(dbconnection);
Production.sync();

// get start and end times
const dateString = process.argv[2];
const start_day = new Date(dateString); // this is timezone aware
if (start_day instanceof Date && !isNaN(start_day.valueOf()) == false) {
	console.error("Error: Date input is not valid.");
	process.exit(1);
}
const start_at = start_day.getTime() / 1000;
const end_at = start_at + 86400;

// initialize logging
const logdir = process.env.LOGDIR || null;
let logstream = null;
if (logdir != null) {
	if (!fs.existsSync(logdir)) { fs.mkdirSync(logdir); }
	const logDateYmd = formatDateYmd(start_day);
	const logfile = logdir +"/"+ logDateYmd +".log";
	logstream = fs.createWriteStream(logfile, {flags: "a"});
}

logger(`Time Now: ${new Date().toUTCString()}`)
logger("Getting production logs.");
logger(`Start At: ${start_day.toUTCString()} (${start_at})`);
logger(`End At: ${new Date(end_at*1000).toUTCString()} (${end_at})`);

// login
const host = process.env.SB_HOST;
const username = process.env.SB_USERNAME || "usr";
const password = process.env.SB_PASSWORD;
SunnyBoy.login(host, username, password)
.then((response) => {
	let sid = null;
	if (response.data.result && response.data.result.sid) {
		sid = response.data.result.sid;
	}
	else {
		logger(`Error: Unable to get SID: ${JSON.stringify(response.data)}`, "error");
		process.exit(1);
	}
	// get serial
	SunnyBoy.getValues(host, sid, ["6800_00A21E00"])
	.then((response) => {
		const inverter_key = Object.keys(response.data.result)[0];
		const inverterid = response.data.result[inverter_key]["6800_00A21E00"]["1"][0]["val"].toString();
		// get production data
		const sb_start_at = start_at - 300; // start 5 minutes earlier because delta is required
		SunnyBoy.getLogs(host, sid, sb_start_at, end_at)
		.then((response) => {
			const data = response.data.result[inverter_key];
			let recordsAdded = 0;
			const promise = data.map((log, index, logArray) => {
				const datetime = new Date(log.t * 1000);
				const previousValue = logArray[index-1] ? logArray[index-1].v : null;
				if (previousValue) {
					const v = log.v;
					if (v != null) {
						// converts watts reported 12 times per hour (every 5 minutes) to kW
						const kw = parseFloat(((log.v - previousValue) * 0.012).toFixed(3));
						const record = { inverterid, datetime, v, kw };
						return Production.create(record)
						.then(() => recordsAdded++)
						.catch((response) => {
							if (response.toString().includes("SequelizeUniqueConstraintError")) {
								logger(`Record at ${datetime} already exists. Skipping.`);
							}
							else {
								logger(`Insert failed: ${JSON.stringify(record)}, ${response}`, "error");
							}
						});
					}
					else { logger(`Record at ${datetime} has a null voltage value. Skipping.`); }
				}
			});
			Promise.all(promise).then(() => {
				logger("Records added: "+ recordsAdded);
				SunnyBoy.logout(host, sid);
			});
		});
	});
})
.catch((error) => {
	logger("Login failure: "+ error.toString(), "error");
	process.exit(1);
});

function formatDateYmd(date) {
	let month = ""+ (date.getMonth() + 1);
	let day = ""+ date.getDate();
	const year = date.getFullYear();
	if (month.length < 2) month = "0"+ month;
	if (day.length < 2) day = "0"+ day;
	return [year, month, day].join("-");
}

function logger(message, level="info") {
	let logmsg = level.toUpperCase() +": "+ message;
	console.log(logmsg);
	if (logstream != null) { logstream.write(logmsg +"\n"); }
}