import express from "express";
import User from "../models/user model/user.js";
import { registerValidation } from "./validations/auth.val.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "./middlwares/authorization.js";

const router = express.Router();

//sign up
router.post("/register", async (req, res) => {
	//validation
	const { error } = registerValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//verifying if username is unique
	const userNameExist = await User.findOne({ userName: req.body.userName });
	if (userNameExist) return res.status(400).send("username already exist");

	//verifying if email is unique
	const userEmailExist = await User.findOne({ email: req.body.email });
	if (userEmailExist) return res.status(400).send("email already exist");

	//password hashing
	const hashedPass = bcrypt.hashSync(req.body.password, 10);

	const newUser = new User({
		...req.body,
		password: hashedPass,
	});

	try {
		const savedUser = await newUser.save();
		res.status(201).json("user has been created");
	} catch (error) {
		res.status(500).send("something went wrong");
	}
});

//login
router.post("/login", async (req, res) => {
	//check if user had signed in
	const user = await User.findOne({ userName: req.body.userName });
	if (!user) return res.status(400).send("account does not exist");

	//compare if password exist
	const passwordCompare = bcrypt.compareSync(
		req.body.password,
		user.password
	);
	if (!passwordCompare) return res.status(400).send("Incorrect password");

	//jwt access token
	const token = jwt.sign(
		{
			id: user._id,
		},
		process.env.JWT_KEY
	);

	//destructuring password from user object
	const { password, ...userDetails } = user._doc;

	//send token as cookie and userDetails as response json
	res.cookie("accesToken", token, { httpOnly: true })
		.status(500)
		.send(userDetails);
});

//logout
router.get("/logout", (req, res) => {
	res.clearCookie("accessToken", {
		sameSite: "none",
		secure: true,
	})
		.status(200)
		.send("you logged out of your account");
});

//delete
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	//...continue from middlware and verify if the payload id from jwt is same as users id
	const user = await User.findById(req.params.id);
	if (req.userid !== user._id.toString()) {
		return res
			.status(403)
			.send("you are not authorized to perform this task");
	}

	//delete account
	await User.findByIdAndDelete(req.params.id);
	res.status(200).send("you have deleted your account");
});

export default router;
