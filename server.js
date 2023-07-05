import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routing/routes/user routes/auth.route.js";
import userRoutes from "./src/routing/routes/user routes/user.route.js";
import pageAuthRoutes from "./src/routing/routes/page routes/page.auth.route.js";
import pageRoutes from "./src/routing/routes/page routes/page.route.js";
import postRoutes from "./src/routing/routes/post routes/post.route.js";
import postReviewRoutes from "./src/routing/routes/review routes/post.review.route.js";
import pageReviewRoutes from "./src/routing/routes/review routes/page.review.route.js";

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
app.use("/api/pageauth", pageAuthRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/post", postRoutes);
app.use("/api/postreview", postReviewRoutes);
app.use("/api/pagereview", pageReviewRoutes);
//server connection
app.listen(8000, () => {
	connect();
	console.log(FgYellow, "backend server is running...", Reset);
});
