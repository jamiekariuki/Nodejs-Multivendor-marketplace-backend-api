import mongoose from "mongoose";

const postReviewSchema = new mongoose.Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		rating: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			required: false,
			default: 0,
		},
		reviewMessage: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const PostReview = mongoose.model("PostReview", postReviewSchema);

export default PostReview;
