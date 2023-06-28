import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		otherPerson: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		conversationName: {
			type: String,
			required: true,
		},
		readByOwner: {
			type: Boolean,
			default: false,
		},
		readByOtherPerson: {
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
