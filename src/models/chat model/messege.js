import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		ownerConvId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
		},
		receiverConvId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
		},
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

		messages: {
			type: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "User",
						required: true,
					},
					message: {
						type: String,
						required: true,
					},
					createdAt: {
						type: Date,
						default: Date.now,
					},
				},
			],
			default: [],
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
