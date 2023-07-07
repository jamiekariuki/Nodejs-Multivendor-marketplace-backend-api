import express from "express";
import { userValidation } from "../../validations/auth.val.js";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Page from "../../../models/page model/page.js";

const router = express.Router();
//get user
router.get("/get/:id", async (req, res) => {
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
		const updatedUser = await User.findByIdAndUpdate(req.params.id, {
			$set: req.body,
		});
		const { password, ...userDetails } = updatedUser._doc;
		res.status(200).json(userDetails);
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

//recommendations subscriptiom
//recommend a page
router.put("/recommend/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).send("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.send("you are not authorized to perform this task");
		}
		//check if user has already recommend this page
		const page = await Page.findById(req.body.pageId);
		if (!page) {
			return res.status(403).send("page does not exist");
		}
		if (page.recommendations.includes(req.userid)) {
			return res.status(403).send("you allready recommended this page");
		}
		//add user id to page recomendation and page id to user recommended
		await page.updateOne({
			$push: {
				recommendations: req.userid,
			},
		});
		await user.updateOne({
			$push: {
				recommended: req.body.pageId,
			},
		});
		res.status(200).json("you recommended this page");
	} catch (error) {
		res.status(500).json(error);
	}
});

//unrecommend page
router.put("/unrecommend/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).send("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.send("you are not authorized to perform this task");
		}
		//check if user has already recommend this page
		const page = await Page.findById(req.body.pageId);
		if (!page) {
			return res.status(403).send("page does not exist");
		}
		if (!page.recommendations.includes(req.userid)) {
			return res.status(403).send("you havent recommended this page");
		}
		//remove user id to page recomendation and page id to user recommended
		await page.updateOne({
			$pull: {
				recommendations: req.userid,
			},
		});
		await user.updateOne({
			$pull: {
				recommended: req.body.pageId,
			},
		});
		res.status(200).json("you unrecommended this page");
	} catch (error) {
		res.status(500).json(error);
	}
});

//

export default router;
