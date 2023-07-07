import mongoose from "mongoose";

const userorderSchema = new mongoose.Schema(
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

const UserOrder = mongoose.model("UserOrder", userorderSchema);

export default UserOrder;
