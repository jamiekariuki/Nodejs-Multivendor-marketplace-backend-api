import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		posts: [
			{
				type: mongoose.Schema.Types.Mixed,
				ref: "Post",
			},
		],
	},
	{ timestamps: true }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
