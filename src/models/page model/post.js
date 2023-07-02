import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		page: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Page",
			required: true,
		},
		postPicture: {
			type: String,
		},
		description: {
			type: String,
		},
		ratings: {
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
