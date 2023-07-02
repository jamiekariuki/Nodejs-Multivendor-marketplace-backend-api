import express from "express";
import Post from "../../models/page model/post.js";
import Page from "../../models/page model/page.js";
import { authoriseUser } from "../middlwares/authorization.js";
import { postValidation } from "../validations/procuct.val.js";

const router = express.Router();

//create post
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

//get post
router.get("/get/:id", async (req, res) => {
	try {
		//get page from id parameter, and validate if it exist
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(400).json("post does not exist");

		//send user details
		res.status(200).json(post);
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
