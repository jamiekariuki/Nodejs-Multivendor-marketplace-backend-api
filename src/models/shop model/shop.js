import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
	{
		shopUserName: {
			type: String,
			required: true,
			unique: true,
		},
		shopName: {
			type: String,
		},
		shopOwner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		bio: {
			type: String,
		},
		category: {
			type: [String],
			validate: [arrayLimit, "{PATH} exceeds the limit of 50"],
		},
		location: {
			type: String,
		},
		shopIcon: {
			type: String,
		},
		rating: {
			type: Number,
			enum: [0, 1, 2, 3, 4, 5],
			required: true,
			default: 0,
		},
		ratings: {
			type: Number,
			default: 0,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Validation function for category array limit
function arrayLimit(val) {
	return val.length <= 50;
}

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
