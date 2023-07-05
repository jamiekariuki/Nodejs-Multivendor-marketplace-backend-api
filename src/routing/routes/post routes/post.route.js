import express from "express";
import Post from "../../../models/page model/post.js";
import Page from "../../../models/page model/page.js";
import { authoriseUser } from "../../middlwares/authorization.js";
import { postValidation } from "../../validations/post.val.js";
import User from "../../../models/user model/user.js";

const router = express.Router();
//create post id is page id
router.post("/create/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const page = await Page.findById(req.params.id);
		if (!page) return res.status(403).json("page does not exist");
		if (req.userid !== page.pageOwner._id.toString()) {
			return res.status(403).json("you can only post from your page");
		}
		//sanitizing inputs
		const { error } = postValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);

		const newPost = new Post({
			page: req.params.id,
			...req.body,
		});
		//save and send the postt back
		const savedPost = await newPost.save();
		res.status(201).json(savedPost);
	} catch (error) {
		res.status(500).json(error);
	}
});

//get post id is post id
router.get("/get", async (req, res) => {
	const q = req.query;
	//checking if query parameters exist and adding them in filter object
	//id is post id, pid is pageid
	const filter = {
		...(q.id && { _id: q.id }),
		...(q.pid && { page: q.pid }),
		...(q.type && {
			type: {
				$regex: q.type,
				$options: "i",
			},
		}),
		...(q.cat && {
			category: {
				$regex: q.cat,
				$options: "i",
			},
		}),
		...(q.search && {
			title: {
				$regex: q.search,
				$options: "i",
			},
		}),
		...((q.min || q.max) && {
			price: {
				...(q.min && { $gt: q.min }),
				...(q.max && { $lt: q.max }),
			},
		}),
	};

	try {
		//get page from id parameter, and validate if it exist
		const post = await Post.find(filter);
		if (!post) return res.status(400).json("post does not exist");
		//send post details
		res.status(200).json(post);
	} catch (error) {
		res.status(500).json(error);
	}
});

//update post  id is post id
router.put("/update/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(403).json("this post does not exist");
		const page = await Page.findById(post.page.toString());
		if (!page) return res.status(403).json("page does not exist");
		if (req.userid !== page.pageOwner._id.toString()) {
			return res.status(403).json("you can only delete your post");
		}
		//validate inputs
		const { error } = postValidation(req.body);
		if (error) return res.status(400).json(error.details[0].message);
		//update page
		await Post.findByIdAndUpdate(req.params.id, { $set: req.body });
		res.status(200).json("you have updated your post");
	} catch (error) {
		res.status(500).json(error);
	}
});

//delete post
router.delete("/delete/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(403).json("this post does not exist");
		const page = await Page.findById(post.page.toString());
		if (!page) return res.status(403).json("page does not exist");
		if (req.userid !== page.pageOwner._id.toString()) {
			return res.status(403).json("you can only delete your post");
		}
		//delete account
		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json("you have deleted your Post");
	} catch (error) {
		res.status(500).json(error);
	}
});

//get feeds from pages that user recomended, //timeline
router.get("/timeline/:id", authoriseUser, async (req, res) => {
	try {
		//...continue from middlware and verify if the payload id from jwt is same as users id
		const user = await User.findById(req.params.id);
		if (!user) return res.status(403).send("account does not exist");
		if (req.userid !== user._id.toString()) {
			return res
				.status(403)
				.send("you are not authorized to perform this task");
		}
		//fetch post only from recommended pages
		const pagePosts = await Promise.all(
			user.recommended.map((pageid) => {
				return Post.find({
					page: pageid,
				});
			})
		);
		//sort for first posted to appear first
		const timeline = pagePosts
			.flat()
			.sort((a, b) => b.createdAt - a.createdAt);

		res.status(200).json(timeline);
	} catch (error) {
		res.status(500).json(error);
	}
});
export default router;
