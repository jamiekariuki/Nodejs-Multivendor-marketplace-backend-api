import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
			required: true,
		},
		productPicture: {
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

const Product = mongoose.model("Product", productSchema);

export default Product;
