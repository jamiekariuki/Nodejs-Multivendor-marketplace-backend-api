import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
	{
		shopName: {
			type: String,
			required: true,
			unique: true,
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
			validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
		},
		location: {
			type: String,
		},
		shopIcon: {
			type: String,
		},
		rating: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			required: true,
			default: 0,
		},
		ratings: {
			type: Number,
			default: 0,
		},
		reviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Review",
			},
		],
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Validation function for category array limit
function arrayLimit(val) {
	return val.length <= 5;
}

const Shop = mongoose.model("Shop", shopSchema);

module.exports = Shop;
