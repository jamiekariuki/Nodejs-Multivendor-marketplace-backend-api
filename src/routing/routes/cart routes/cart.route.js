import express from "express";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Cart from "../../../models/user model/cart.js";

const router = express.Router();

//create  cart, you dont have to be a user to add to cart , dont save page id in local storage
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
		//data to database
		const cart = new Cart({
			user: req.userid,
			...req.body,
		});

		const savedCart = await cart.save();
		res.status(201).json(savedCart);
	} catch (error) {
		res.status(500).json(error);
	}
});

//get cart / id is user id
router.get("/get/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.json("you are not the owner of this account");
		}
		const carts = await Cart.find({ user: req.userid });
		if (!carts || carts.length === 0)
			return res.status(403).json("no available carts yet");

		//send array of cart to user
		res.status(200).json(carts);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update cart, id is cart id
router.put("/update/:id", authoriseUser, async (req, res) => {
	try {
		//from middlware but we check id cart id exist and if cart user id is an authorised user
		const cartExist = await Cart.findById(req.params.id);
		if (!cartExist) {
			return res.status(403).json(" cart does not exist");
		}
		if (cartExist.user.toString() !== req.userid) {
			return res.status(403).json("you can only edit your cart");
		}

		const updatedCart = await Cart.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true }
		);

		res.status(200).json(updatedCart);
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete  cart, id is cart id, delete carts after checking out
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//from middlware but we check id cart id exist and if cart user id is an authorised user
		const cartExist = await Cart.findById(req.params.id);
		if (!cartExist) {
			return res.status(403).json(" cart does not exist");
		}
		if (cartExist.user.toString() !== req.userid) {
			return res.status(403).json("you can only delete your cart");
		}

		//delete cart
		await Cart.findByIdAndDelete(req.params.id);
		res.status(200).json("you have deleted  your cart");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
