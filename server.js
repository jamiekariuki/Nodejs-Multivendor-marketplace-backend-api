import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routing/routes/user routes/auth.route.js";
import userRoutes from "./src/routing/routes/user routes/user.route.js";

const app = express();
dotenv.config();
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const Reset = "\x1b[0m";

//moongose connection
const connect = async () => {
	try {
		await mongoose.connect(process.env.MONGODB);
		console.log(FgBlue, "connected to database", Reset);
	} catch (error) {
		console.log(error);
	}
};

//middlwares
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

//server connection
app.listen(8000, () => {
	connect();
	console.log(FgYellow, "backend server is running...", Reset);
});
