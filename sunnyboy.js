import axios from "axios";
import https from "https";

export default class SunnyBoy {
	// login
	static async login(host, username, password) {
		const hostURL = "https://"+ host +"/dyn/login.json";
		const body = {"right": username, "pass": password};
		const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // skip SSL verification
		return await axios.post(hostURL, body, { httpsAgent }).then((response) => response);
	}

	// logout
	static async logout(host, sid) {
		const hostURL = "https://"+ host +"/dyn/logout.json";
		const body = {};
		const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // skip SSL verification
		const params = { sid };
		return await axios.post(hostURL, body, { httpsAgent, params }).then((response) => response);
	}

	// get values
	static async getValues(host, sid, keys) {
		const hostURL = "https://"+ host +"/dyn/getValues.json";
		const body = {"destDev":[],"keys": keys};
		const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // skip SSL verification
		const params = { sid };
		return await axios.post(hostURL, body, { httpsAgent, params }).then((response) => response);
	}

	// get logger
	static async getLogs(host, sid, start_at, end_at) {
		const hostURL = "https://"+ host +"/dyn/getLogger.json";
		const body = {"destDev": [], "key": 28672, "tStart": start_at, "tEnd": end_at};
		const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // skip SSL verification
		const params = { sid };
		return await axios.post(hostURL, body, { httpsAgent, params }).then((response) => response);
	}
}