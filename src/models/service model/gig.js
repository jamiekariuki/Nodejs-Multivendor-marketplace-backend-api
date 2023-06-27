import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
	{
		service: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Service",
			required: true,
		},
		gigPicture: {
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

const Gig = mongoose.model("Gig", productSchema);

module.exports = Gig;
