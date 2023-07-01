import express from "express";
import { userValidation } from "../../validations/auth.val.js";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";

const router = express.Router();

//get user
router.get("/getuser/:id", async (req, res) => {
	try {
		//get user from id parameter, and validate if it exist
		const user = await User.findById(req.params.id);
		if (!user) return res.status(400).send("user does not exist");

		//distructure sensitive information out from user before sending them
		const { password, updatedAt, ...userDetails } = user._doc;

		//send user details
		res.status(200).send(userDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update user
router.put("/update/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).send("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).send("you can only update your account");
		}

		//checking if there is any other user with the new name and not this
		const otherUser = await Service.findOne({
			userName: req.body.userName,
		});
		if (otherUser) {
			if (req.params.id !== otherUser._id.toString()) {
				return res.status(403).json("this username is currently taken");
			}
		}

		//validate inputs
		const { error } = userValidation(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		//update user

		await User.findByIdAndUpdate(req.params.id, { $set: req.body });
		res.status(200).json("you have updated your account");
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete user
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).send("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.send("you are not authorized to perform this task");
		}

		//delete account

		await User.findByIdAndDelete(req.params.id);
		res.status(200)
			.send("you have deleted your account")
			.clearCookie("accessToken", {
				sameSite: "none",
				secure: true,
			});
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
