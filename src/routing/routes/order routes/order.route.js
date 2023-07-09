import express from "express";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Page from "../../../models/page model/page.js";
import PageOrder from "../../../models/page model/pageorders.js";
import UserOrder from "../../../models/user model/userorders.js";

const router = express.Router();

//create oder, id is user id, only users can create oders
router.post("/create/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.json("you are not the owner of this account");
		}

		//save data to database for user and page
		const pageOrder = new PageOrder({
			user: req.userid,
			...req.body,
		});
		const userOrder = new UserOrder({
			user: req.userid,
			...req.body,
		});

		const order = await userOrder.save();
		await pageOrder.save();
		res.status(201).json(order);
	} catch (error) {
		res.status(500).json(error);
	}
});

//id can be page or user
router.get("/get/:id", authoriseUser, async (req, res) => {
	try {
		//checking if either user or page exists and its authorize
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const userOders = await UserOrder.find({ user: req.userid });
			return res.status(200).json(userOders);
		}

		//if its page requesting
		const page = await Page.findById(req.params.id);
		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const pageOders = await PageOrder.find({ page: req.params.id });
			return res.status(200).json(pageOders);
		} else {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

//this route should be the most secured to avoid fraud
//update cart, id is order id
//an update must happen when payment is confirmed
//should be updated in payment
//note if a user and page have two oders they will be both update
//to avoid this we shall pass both user and page id, and also order id
//jwt should be used here
router.put("/update", authoriseUser, async (req, res) => {
	try {
		const existPageOrder = await PageOrder.findOne({
			user: req.body.userId,
			page: req.body.pageId,
		});
		const existUserOrder = await UserOrder.findOne({
			user: req.body.userId,
			page: req.body.pageId,
		});
		//check if both oders exist
		if (!existPageOrder || !existUserOrder) {
			return res.status(403).json("something went wrong");
		}

		const updatedPageOrder = await PageOrder.findOneAndUpdate(
			{
				user: req.body.userId,
				page: req.body.pageId,
			},
			{ status: "completed" },
			{ new: true }
		);

		const updatedUserOrder = await UserOrder.findOneAndUpdate(
			{
				user: req.body.userId,
				page: req.body.pageId,
			},
			{ status: "completed" },
			{ new: true }
		);

		if (!updatedPageOrder && !updatedUserOrder) {
			return res.status(403).json("something went wrong");
		}

		res.status(200).json(
			"orders updated succefull! they are now completed"
		);
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete  order, id is page or user
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//checking if either page exist or is authorize
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const isPending = await UserOrder.findById(req.body.orderId);
			if (!isPending) {
				return res.status(403).json("order does not exist");
			}
			//checking if oder is completed
			if (isPending.status === "pending") {
				return res
					.status(403)
					.json("you can only delete completed orders");
			}

			await UserOrder.findByIdAndDelete(req.body.orderId);
			return res.status(200).json("order deleted");
		}
		//if its page requesting
		const page = await Page.findById(req.params.id);

		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const isPending = await PageOrder.findById(req.body.orderId);
			if (!isPending) {
				return res.status(403).json("order does not exist");
			}
			if (isPending.status === "pending") {
				return res
					.status(403)
					.json("you can only delete completed orders");
			}

			await PageOrder.findByIdAndDelete(req.body.orderId);
			return res.status(200).json("order deleted");
		} else {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
