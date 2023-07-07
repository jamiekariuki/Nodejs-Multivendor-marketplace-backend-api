import express from "express";
import Post from "../../../models/page model/post.js";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import PostReview from "../../../models/review model/post.review.js";

const router = express.Router();

//add review
router.put("/add/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.json("you are not the owner of this account");
		}
		//check if post exist
		const post = Post.findById(req.body.postId);
		if (!post) {
			return res.status(403).json("post does not exist");
		}
		//add post id inside wishlist array
		const newUser = await user.updateOne({
			$push: {
				wishlist: req.body.postId,
			},
		});
		if (!newUser) {
			return res.status(403).json("something wrong happen");
		}

		res.status(200).json("post added in your wishlist");
	} catch (error) {
		res.status(500).json(error);
	}
});

//remove a post from wishlist
router.put("/remove/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.json("you are not the owner of this account");
		}
		//check if post exist
		const post = Post.findById(req.body.postId);
		if (!post) {
			return res.status(403).json("post does not exist");
		}
		//remove post id inside wishlist array
		const newUser = await user.updateOne({
			$pull: {
				wishlist: req.body.postId,
			},
		});
		if (!newUser) {
			return res.status(403).json("something wrong happen");
		}

		res.status(200).json("post removed from wishlist");
	} catch (error) {
		res.status(500).json(error);
	}
});

//get all wishlist
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

		//looping through all ids and retriving the data
		const wishlist = await Promise.all(
			user.wishlist.map((postid) => {
				return Post.findById(postid).populate(
					"page",
					"pageUserName pageIcon"
				);
			})
		);

		res.status(200).json(wishlist.flat().reverse());
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
