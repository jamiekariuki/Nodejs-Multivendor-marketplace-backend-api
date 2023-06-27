import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const Reset = "\x1b[0m";

const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB);
		console.log(FgBlue, "connected to database", Reset);
	} catch (error) {
		console.log(error);
	}
};

app.listen(8000, () => {
	connect();
	console.log(FgYellow, "backend server is running...", Reset);
});
