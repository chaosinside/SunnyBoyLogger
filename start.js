import ProductionModel from "./productionModel";
import { dbconnection } from "./dbconnect";
import SunnyBoy from "./sunnyboy";

// initialize models
const Production = ProductionModel.init(dbconnection);
Production.sync();

// start and end times for data
const dateString = process.argv[2];
const start_day = new Date(dateString); // this is timezone aware
if (start_day instanceof Date && !isNaN(start_day.valueOf()) == false) {
	console.error("Error: Date input is not valid.");
	process.exit(1);
}

const start_at = start_day.getTime() / 1000;
console.log(`Start UTC: ${start_day.toUTCString()} (${start_at})`);
const end_at = start_at + 86400;
console.log(`End UTC: ${new Date(end_at*1000).toUTCString()} (${end_at})`);

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
		console.error("Error: Unable to get SID:", response.data);
		process.exit(1);
	}
	
	// get serial
	SunnyBoy.getValues(host, sid, ["6800_00A21E00"])
	.then((response) => {
		const inverterid = response.data.result["013A-769D5712"]["6800_00A21E00"]["1"][0]["val"].toString();
		// get production data
		const sb_start_at = start_at - 300; // start 5 minutes earlier because delta is required
		SunnyBoy.getLogs(host, sid, sb_start_at, end_at)
		.then((response) => {
			const data = response.data.result["013A-769D5712"];
			const mysteryConstant = 0.012; // to convert inverter power data to kW.
			let recordsAdded = 0;
			const promise = data.map((log, index, logArray) => {
				const datetime = new Date(log.t * 1000);
				const previousValue = logArray[index-1] ? logArray[index-1].v : null;
				if (previousValue) {
					const v = log.v;
					const kw = parseFloat(((log.v - previousValue) * mysteryConstant).toFixed(3));
					return Production.create({ inverterid, datetime, v, kw })
					.then(() => recordsAdded++)
					.catch((response) => {
						if (response.toString().includes("SequelizeUniqueConstraintError")) {
							console.error(`FAILED: Record at ${datetime} already exists.`);
						}
						else {
							console.error(`FAILED: datetime: ${datetime}, response: ${response}`);
						}
					});
				}
			});
			Promise.all(promise)
			.then(() => console.log("Records added:", recordsAdded));
		});
	});
})
.catch((error) => {
	console.error("Error: Login failure:", error);
	process.exit(1);
});