import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
	{
		serviceUserName: {
			type: String,
			required: true,
			unique: true,
		},
		serviceName: {
			type: String,
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
			validate: [arrayLimit, "{PATH} exceeds the limit of 50"],
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
			enum: [0, 1, 2, 3, 4, 5],
			required: true,
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

const Service = mongoose.model("Service", serviceSchema);

export default Service;
