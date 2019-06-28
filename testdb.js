import { dbconnection } from "./dbconnect";

// test the connection
dbconnection
.authenticate()
.then(() => {
	console.log("Connection has been established successfully.");
})
.catch(err => {
	console.error("Unable to connect to the database:", err);
})
.finally(() => {
	dbconnection.close();
	process.exit();
});