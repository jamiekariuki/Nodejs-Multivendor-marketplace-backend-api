import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Page from "../../../models/page model/page.js";
import { pageValidation } from "../../validations/page.val.js";

const router = express.Router();

//create page
router.post("/create/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you must create an account first");
		}
		//search page with the username,
		const page = await Page.findOne({
			pageUserName: req.body.pageUserName,
		});
		if (page) return res.status(400).json("page username already exist");
		//sanitizing inputs
		const { error } = pageValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		const newPage = new Page({
			...req.body,
			pageOwner: req.userid,
		});

		const savedpage = await newPage.save();
		const { updatedAt, ...pageDetails } = savedpage._doc;
		res.status(201).json(pageDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//login to existing page
router.post("/login/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you must create an account first");
		}
		//compare if password exist
		const passwordCompare = bcrypt.compareSync(
			req.body.password,
			user.password
		);
		if (!passwordCompare) return res.status(400).json("Incorrect password");
		//fetching page, and validate if it exist or its owner is the one trying to login
		const page = await Page.findOne({
			pageUserName: req.body.pageUserName,
		});
		if (!page) return res.status(400).json("page does not exist");
		if (page.pageOwner.toString() !== req.userid) {
			return res.status(400).json("you are not the owner of this page");
		}

		const { updatedAt, ...pageDetails } = page._doc;
		res.status(201).json(pageDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
