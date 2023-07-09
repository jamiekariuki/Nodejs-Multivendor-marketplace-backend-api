import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		ownerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		readByReciver: {
			type: Boolean,
			default: false,
		},
		lastMessage: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
