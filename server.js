import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routing/routes/user routes/auth.route.js";
import userRoutes from "./src/routing/routes/user routes/user.route.js";
import shopAuthRoutes from "./src/routing/routes/shop routes/shop.auth.route.js";
import shopRoutes from "./src/routing/routes/shop routes/shop.route.js";
import serviceAuthRoutes from "./src/routing/routes/service routes/service.auth.route.js";
import serviceRoutes from "./src/routing/routes/service routes/service.route.js";

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
app.use("/api/shopauth", shopAuthRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/serviceauth", serviceAuthRoutes);
app.use("/api/service", serviceRoutes);

//server connection
app.listen(8000, () => {
	connect();
	console.log(FgYellow, "backend server is running...", Reset);
});
