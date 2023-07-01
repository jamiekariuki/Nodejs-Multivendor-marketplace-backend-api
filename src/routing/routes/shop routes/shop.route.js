import express from "express";
import { authoriseUser } from "../../middlwares/authorization.js";
import Shop from "../../../models/shop model/shop.js";
import { shopValidation } from "../../validations/shop.val.js";

const router = express.Router();

//get shop(s)
router.get("/getshop/:id", async (req, res) => {
	try {
		//get shop from id parameter, and validate if it exist
		const shop = await Shop.findById(req.params.id);
		if (!shop) return res.status(400).json("shop does not exist");

		//distructure sensitive information out from user before sending them
		const { shopOwner, updatedAt, ...shopDetails } = shop._doc;

		//send user details
		res.status(200).json(shopDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update shop
router.put("/updateshop/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in shop owner
		const shop = await Shop.findById(req.params.id);
		if (!shop) return res.status(403).json("shop does not exist");
		if (req.userid !== shop.shopOwner.toString()) {
			return res.status(403).json("you can only update your shop");
		}
		//checking if there is any other service with the new name and not this
		const otherShop = await Shop.findOne({
			shopUserName: req.body.shopUserName,
		});
		if (otherShop) {
			if (req.params.id !== otherShop._id.toString()) {
				return res.status(403).json("this username is currently taken");
			}
		}
		//validate inputs
		const { error } = shopValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);
		//update shop
		await Shop.findByIdAndUpdate(req.params.id, { $set: req.body });
		res.status(200).json("you have updated your account");
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete shop
router.delete("/deleteshop/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in shop owner
		const shop = await Shop.findById(req.params.id);
		if (!shop) return res.status(403).json("shop does not exist");
		if (req.userid !== shop.shopOwner.toString()) {
			return res.status(403).send("you can only delete your shop");
		}
		//delete account
		await Shop.findByIdAndDelete(req.params.id);
		res.status(200).json("you have deleted your shop");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
