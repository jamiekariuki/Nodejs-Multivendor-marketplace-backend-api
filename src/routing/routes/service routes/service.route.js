import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Service from "../../../models/service model/service.js";
import { serviceValidation } from "../../validations/service.val.js";

const router = express.Router();

//get service(s)
router.get("/getservice/:id", async (req, res) => {
	try {
		//get service from id parameter, and validate if it exist
		const service = await Service.findById(req.params.id);
		if (!service) return res.status(400).json("service does not exist");

		//distructure sensitive information out from user before sending them
		const { serviceOwner, updatedAt, ...serviceDetails } = service._doc;

		//send user details
		res.status(200).json(serviceDetails);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update service
router.put("/updateservice/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in shop owner
		const service = await Service.findById(req.params.id);
		if (!service) return res.status(403).json("service does not exist");
		if (req.userid !== service.serviceOwner.toString()) {
			return res.status(403).send("you can only update your service");
		}

		//checking if there is any other service with the new name and not this
		const otherService = await Service.findOne({
			serviceUserName: req.body.serviceUserName,
		});
		if (otherService) {
			if (req.params.id !== otherService._id.toString()) {
				return res.status(403).json("this username is currently taken");
			}
		}

		//validate inputs
		const { error } = serviceValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		//update service
		await Service.findByIdAndUpdate(req.params.id, { $set: req.body });
		res.status(200).json("you have updated your service page");
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete service
router.delete("/deleteservice/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in shop owner
		const service = await Service.findById(req.params.id);
		if (!service)
			return res.status(403).json("service page does not exist");
		if (req.userid !== service.serviceOwner.toString()) {
			return res
				.status(403)
				.send("you can only delete your service page");
		}

		//delete account
		await Service.findByIdAndDelete(req.params.id);
		res.status(200).json("you have deleted your service page");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
