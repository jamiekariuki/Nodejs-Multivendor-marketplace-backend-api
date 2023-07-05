import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			required: true,
			unique: true,
		},

		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePicture: {
			type: String,
		},
		recommended: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Page",
				},
			],
			default: [],
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
