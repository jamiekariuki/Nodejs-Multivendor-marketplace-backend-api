import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
	{
		pageUserName: {
			type: String,
			required: true,
			unique: true,
		},
		pageName: {
			type: String,
		},
		pageOwner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["shop", "service", "freelancer"],
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
		pageIcon: {
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

const Page = mongoose.model("Page", pageSchema);

export default Page;
