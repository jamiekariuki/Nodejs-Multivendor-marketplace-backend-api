import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Service from "../../../models/service model/service.js";
import { serviceValidation } from "../../validations/service.val.js";

const router = express.Router();

//open service
router.post("/open/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res.status(403).json("you must create an account first");
		}
		//search shop with the username,
		const service = await Service.findOne({
			serviceUserName: req.body.serviceUserName,
		});
		if (service) {
			return res.status(400).json("service username already exist");
		}
		//validate to sanitize user input
		const { error } = serviceValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		const newService = new Service({
			...req.body,
			serviceOwner: req.userid,
		});

		const savedService = await newService.save();
		const { serviceOwner, updatedAt, ...serviceDetails } =
			savedService._doc;
		res.status(201).json(serviceDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//login to existing service
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
		const service = await Service.findOne({
			serviceUserName: req.body.serviceUserName,
		});
		if (!service) return res.status(400).json("service does not exist");
		if (service.serviceOwner.toString() !== req.userid) {
			return res
				.status(400)
				.json("you are not the owner of this service");
		}
		//destructuring sensitive info before sending
		const { serviceOwner, updatedAt, ...serviceDetails } = service._doc;
		res.status(201).json(serviceDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
