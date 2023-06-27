import mongoose from "mongoose";

const pageReviewSchema = new mongoose.Schema(
	{
		page: {
			//can be service or shop
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		reviewMessage: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const PageReview = mongoose.model("PageReview", pageReviewSchema);

module.exports = PageReview;
