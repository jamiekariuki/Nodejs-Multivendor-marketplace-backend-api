import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
	{
		serviceName: {
			type: String,
			required: true,
			unique: true,
		},
		serviceOwner: {
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
		serviceIcon: {
			type: String,
		},
		recommendations: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			required: true,
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

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
