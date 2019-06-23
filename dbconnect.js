import Sequelize from "sequelize";

// get connection params
require("dotenv").config();
const host = process.env.DB_HOST || "localhost";
const db = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// connect to the db (database, username, password)
export const dbconnection = new Sequelize(db, username, password, {
	host,
	dialect: "mysql",
	logging: false
});
