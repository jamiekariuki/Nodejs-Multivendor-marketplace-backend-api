import express from "express";
import Post from "../../../models/page model/post.js";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import PostReview from "../../../models/review model/post.review.js";

const router = express.Router();

//create review id is user id
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

		//checking if user had created a review to avoid spaming
		const review = await PostReview.findOne({
			post: req.body.postId,
			user: req.userid,
		});

		if (review) {
			return res
				.status(403)
				.json(
					"Due to our policies, you can only give one review per post to avoid spams"
				);
		}
		//adding rating to the post
		const post = await Post.findByIdAndUpdate(req.body.postId, {
			$inc: {
				totalRatings: req.body.rating,
				ratingCount: 1,
			},
		});
		if (!post) return res.status(403).json("page does not exist");

		const newReview = new PostReview({
			post: req.body.postId,
			user: req.userid,
			...req.body,
		});
		//save and send the review back
		const savedReview = await newReview.save();
		res.status(201).json(savedReview);
	} catch (error) {
		res.status(500).json(error);
	}
});

//get reviews, id is post id
router.get("/get/:id", async (req, res) => {
	try {
		//get page from id parameter, and validate if it exist
		const review = await PostReview.find({ post: req.params.id });
		if (!review || review.length === 0) {
			return res.status(400).json("there is no reviews currently");
		}
		//send post details
		res.status(200).json(review);
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete post, id is user id
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).json("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.json("you are not the owner of this account");
		}
		//delete account
		const review = await PostReview.findOne({ user: req.params.id });
		if (!review) {
			return res.status(403).json("you can only delete your review");
		}
		await PostReview.findOneAndDelete({ user: req.params.id });
		res.status(200).json("you have deleted your review");
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
