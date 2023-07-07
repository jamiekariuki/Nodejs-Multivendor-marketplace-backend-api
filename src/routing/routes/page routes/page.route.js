import express from "express";
import { authoriseUser } from "../../middlwares/authorization.js";
import Page from "../../../models/page model/page.js";
import { pageValidation } from "../../validations/page.val.js";

const router = express.Router();

//get page(s)
router.get("/get", async (req, res) => {
	const q = req.query;
	//checking if query parameters exist and adding them in filter object
	const filter = {
		...(q.id && { _id: q.id }),
		...(q.type && {
			type: {
				$regex: q.type,
				$options: "i",
			},
		}),
		...(q.cat && {
			category: {
				$in: q.cat.map((c) => new RegExp(c, "i")),
			},
		}),
		...(q.search && {
			pageUserName: {
				$regex: q.search,
				$options: "i",
			},
		}),
	};

	try {
		//get page from id parameter, and validate if it exist
		const page = await Page.find(filter);
		if (!page) return res.status(400).json("page does not exist");

		res.status(200).json(page);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update page
router.put("/update/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in page owner
		const page = await Page.findById(req.params.id);
		if (!page) return res.status(403).json("page does not exist");
		if (req.userid !== page.pageOwner.toString()) {
			return res.status(403).json("you can only update your page");
		}
		//checking if there is any other page with the new name and not this
		const otherPage = await Page.findOne({
			PageUserName: req.body.pageUserName,
		});
		if (otherPage) {
			if (req.params.id !== otherPage._id.toString()) {
				return res.status(403).json("this username is currently taken");
			}
		}
		//validate inputs
		const { error } = pageValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);
		//update page
		await Page.findByIdAndUpdate(req.params.id, { $set: req.body });
		res.status(200).json("you have updated your account");
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete page
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as the one in page owner
		const page = await Page.findById(req.params.id);
		if (!page) return res.status(403).json("page does not exist");
		if (req.userid !== page.pageOwner.toString()) {
			return res.status(403).json("you can only delete your page");
		}
		//delete account
		await Page.findByIdAndDelete(req.params.id);
		res.status(200).json("you have deleted your Page");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
