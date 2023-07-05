import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		page: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Page",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["shop", "service", "freelancer"],
		},
		postPicture: {
			type: String,
		},
		description: {
			type: String,
		},
		totalRatings: {
			type: Number,
			default: 0,
		},
		ratingCount: {
			type: Number,
			default: 0,
		},
		category: {
			type: String,
		},
		price: {
			type: Number,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
