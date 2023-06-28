import mongoose from "mongoose";

const itemReviewSchema = new mongoose.Schema(
	{
		item: {
			//can be product or gig
			type: mongoose.Schema.Types.Mixed,
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

const ItemReview = mongoose.model("ItemReview", itemReviewSchema);

export default ItemReview;
