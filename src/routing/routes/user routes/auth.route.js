import express from "express";
import {
	registerValidation,
	passwordValidation,
} from "../../validations/auth.val.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";

const router = express.Router();

//sign up
router.post("/register", async (req, res) => {
	try {
		//validation
		const { error } = registerValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		//verifying if username is unique
		const userNameExist = await User.findOne({
			userName: req.body.userName,
		});
		if (userNameExist)
			return res.status(400).json("username already exist");

		//verifying if email is unique
		const userEmailExist = await User.findOne({ email: req.body.email });
		if (userEmailExist) return res.status(400).json("email already exist");

		//password hashing
		const hashedPass = bcrypt.hashSync(req.body.password, 10);

		const newUser = new User({
			...req.body,
			password: hashedPass,
		});

		const savedUser = await newUser.save();
		res.status(201).json("user has been created");
	} catch (error) {
		res.status(500).json(error);
	}
});

//login
router.post("/login", async (req, res) => {
	//check if user had signed in
	const user = await User.findOne({ userName: req.body.userName });
	if (!user) return res.status(400).json("account does not exist");

	//compare if password exist
	const passwordCompare = bcrypt.compareSync(
		req.body.password,
		user.password
	);
	if (!passwordCompare) return res.status(400).json("Incorrect password");

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
		.json(userDetails);
});

//logout
router.get("/logout/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you can only logout of your account");
		}

		//clear user cookie
		res.clearCookie("accessToken", {
			sameSite: "none",
			secure: true,
		})
			.status(200)
			.json("you logged out of your account");
	} catch (error) {
		res.status(500).json(error);
	}
});

//update password
router.put("/update/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you can only update your account");
		}

		//confirm if user  pass match with the previus pass
		const passwordCompare = bcrypt.compareSync(
			req.body.prevPassword,
			user.password
		);
		if (!passwordCompare)
			return res.status(400).json("password do not match");

		//validate inputs
		const { error } = passwordValidation(req.body.currentPassword);
		if (error) return res.status(400).json(error.details[0].message);

		//hashing the new password
		const hashedPass = bcrypt.hashSync(req.body.currentPassword, 10);

		//update pass
		await User.findByIdAndUpdate(req.params.id, {
			$set: { password: hashedPass },
		});
		res.status(200).json("you have updated your password");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
