import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Shop from "../../../models/shop model/shop.js";
import { shopValidation } from "../../validations/shop.val.js";

const router = express.Router();

//open shop
router.post("/open/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you must create an account first");
		}

		//search shop with the username,
		const shop = await Shop.findOne({
			shopUserName: req.body.shopUserName,
		});
		if (shop) return res.status(400).json("shop username already exist");

		const newShop = new Shop({
			...req.body,
			shopOwner: req.userid,
		});

		const { error } = shopValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		const savedShop = await newShop.save();

		const { shopOwner, updatedAt, ...shopDetails } = savedShop._doc;
		res.status(201).json(shopDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//login to existing shop
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

		//fetching shop, and validate if it exist or its owner is the one trying to login
		const shop = await Shop.findOne({
			shopUserName: req.body.shopUserName,
		});
		if (!shop) return res.status(400).json("shop does not exist");
		if (shop.shopOwner.toString() !== req.userid) {
			return res.status(400).json("you are not the owner of this shop");
		}

		const { shopOwner, updatedAt, ...shopDetails } = shop._doc;
		res.status(201).json(shopDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
