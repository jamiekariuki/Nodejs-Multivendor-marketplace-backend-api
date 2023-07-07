import mongoose from "mongoose";

const pageorderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		page: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Page",
			required: true,
		},

		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
			required: true,
		},
		quantity: {
			type: Number,
			default: 1,
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "completed"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

const PageOrder = mongoose.model("PageOrder", pageorderSchema);

export default PageOrder;
