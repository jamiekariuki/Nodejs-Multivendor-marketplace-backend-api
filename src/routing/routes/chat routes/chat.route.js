import express from "express";
import { authoriseUser } from "../../middlwares/authorization.js";
import User from "../../../models/user model/user.js";
import Conversation from "../../../models/chat model/conversation.js";
import Message from "../../../models/chat model/messege.js";
import Page from "../../../models/page model/page.js";

const router = express.Router();

//this route is for initialising a conversation and also update conversation nd messages
router.post("/create/:id", authoriseUser, async (req, res) => {
	try {
		//if its user requesting
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const ownerConvExist = await Conversation.findOne({
				ownerId: req.params.id,
				receiverId: req.body.receiverId,
			});
			const receiverConvExist = await Conversation.findOne({
				ownerId: req.body.receiverId,
				receiverId: req.params.id,
			});

			//
			//checking if both owner and reciever have never chated or they both deleted their chats
			if (!ownerConvExist && !receiverConvExist) {
				//1)creating conversation for both owner and receiver
				//-------------------------------------------------------------------
				const newOwnerConv = new Conversation({
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					lastMessage: req.body.message,
				});
				const ownerConversation = await newOwnerConv.save();

				const newReceiverConv = new Conversation({
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					lastMessage: req.body.message,
				});
				const receiverConversation = await newReceiverConv.save();

				//2)creating messages for both and linking both of them with thieir convid
				//-------------------------------------------------------------------
				const newOwnerMessage = new Message({
					ownerConvId: ownerConversation._id,
					receiverConvId: receiverConversation._id,
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				const messages = await newOwnerMessage.save();
				//creating receiver message
				const newReceiverMessage = new Message({
					ownerConvId: receiverConversation._id,
					receiverConvId: ownerConversation._id,
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				await newReceiverMessage.save();
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (!ownerConvExist && receiverConvExist) {
				//when the owner deleted their convo---
				//1)create new conversation for owner but update for receiver since it exist
				//-------------------------------------------------------------------
				const newOwnerConv = new Conversation({
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					lastMessage: req.body.message,
				});
				const ownerConversation = await newOwnerConv.save();
				//update receiver conv
				await receiverConvExist.updateOne({
					lastMessage: req.body.message,
				});

				//2)create new message for owner but update for receiver since it exist
				//-------------------------------------------------------------------
				const newOwnerMessage = new Message({
					ownerConvId: ownerConversation._id,
					receiverConvId: receiverConvExist._id,
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				const messages = await newOwnerMessage.save();
				//update receiver message
				await Message.findOneAndUpdate(
					{
						ownerConvId: receiverConvExist._id,
						receiverConvId: ownerConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);

				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (ownerConvExist && !receiverConvExist) {
				//when the receiver deleted their convo---
				//1)create new conversation for receiver but update for owner since it exist
				//-------------------------------------------------------------------
				const newReceiverConv = new Conversation({
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					lastMessage: req.body.message,
				});
				const receiverConversation = await newReceiverConv.save();
				//update owner conv
				const ownerConversation = await Conversation.findOneAndUpdate(
					{ _id: ownerConvExist._id },
					{ lastMessage: req.body.message },
					{ new: true }
				);

				//2)create new message for receiver but update for owner since it exist
				//-------------------------------------------------------------------
				const newReceiverMessage = new Message({
					ownerConvId: receiverConversation._id,
					receiverConvId: ownerConvExist._id,
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				await newReceiverMessage.save();
				//update owner message
				const messages = await Message.findOneAndUpdate(
					{
						ownerConvId: ownerConvExist._id,
						receiverConvId: receiverConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (ownerConvExist && receiverConvExist) {
				//if both have never chated before or both deleted their new conversatin
				//1)update both owner and receiver conversation
				//-------------------------------------------------------------------
				const ownerConversation = await Conversation.findOneAndUpdate(
					{ _id: ownerConvExist._id },
					{ lastMessage: req.body.message },
					{ new: true }
				);
				//update receiver
				await receiverConvExist.updateOne({
					lastMessage: req.body.message,
				});

				//2)find and update update both owner and receiver messages
				//-------------------------------------------------------------------
				const messages = await Message.findOneAndUpdate(
					{
						ownerConvId: ownerConvExist._id,
						receiverConvId: receiverConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//update receiver message
				await Message.findOneAndUpdate(
					{
						ownerConvId: receiverConvExist._id,
						receiverConvId: ownerConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			}
		}
		//---------------------------------------------------------------------------------------------------
		//if its page requesting
		const page = await Page.findById(req.params.id);

		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const ownerConvExist = await Conversation.findOne({
				ownerId: req.params.id,
				receiverId: req.body.receiverId,
			});
			const receiverConvExist = await Conversation.findOne({
				ownerId: req.body.receiverId,
				receiverId: req.params.id,
			});

			//
			//checking if both owner and reciever have never chated or they both deleted their chats
			if (!ownerConvExist && !receiverConvExist) {
				//1)creating conversation for both owner and receiver
				//-------------------------------------------------------------------
				const newOwnerConv = new Conversation({
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					lastMessage: req.body.message,
				});
				const ownerConversation = await newOwnerConv.save();

				const newReceiverConv = new Conversation({
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					lastMessage: req.body.message,
				});
				const receiverConversation = await newReceiverConv.save();

				//2)creating messages for both and linking both of them with thieir convid
				//-------------------------------------------------------------------
				const newOwnerMessage = new Message({
					ownerConvId: ownerConversation._id,
					receiverConvId: receiverConversation._id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				const messages = await newOwnerMessage.save();
				//creating receiver message
				const newReceiverMessage = new Message({
					ownerConvId: receiverConversation._id,
					receiverConvId: ownerConversation._id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				await newReceiverMessage.save();
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (!ownerConvExist && receiverConvExist) {
				//when the owner deleted their convo---
				//1)create new conversation for owner but update for receiver since it exist
				//-------------------------------------------------------------------
				const newOwnerConv = new Conversation({
					ownerId: req.params.id,
					receiverId: req.body.receiverId,
					lastMessage: req.body.message,
				});
				const ownerConversation = await newOwnerConv.save();
				//update receiver conv
				await receiverConvExist.updateOne({
					lastMessage: req.body.message,
				});

				//2)create new message for owner but update for receiver since it exist
				//-------------------------------------------------------------------
				const newOwnerMessage = new Message({
					ownerConvId: ownerConversation._id,
					receiverConvId: receiverConvExist._id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				const messages = await newOwnerMessage.save();
				//update receiver message
				await Message.findOneAndUpdate(
					{
						ownerConvId: receiverConvExist._id,
						receiverConvId: ownerConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);

				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (ownerConvExist && !receiverConvExist) {
				//when the receiver deleted their convo---
				//1)create new conversation for receiver but update for owner since it exist
				//-------------------------------------------------------------------
				const newReceiverConv = new Conversation({
					ownerId: req.body.receiverId,
					receiverId: req.params.id,
					lastMessage: req.body.message,
				});
				const receiverConversation = await newReceiverConv.save();
				//update owner conv
				const ownerConversation = await Conversation.findOneAndUpdate(
					{ _id: ownerConvExist._id },
					{ lastMessage: req.body.message },
					{ new: true }
				);

				//2)create new message for receiver but update for owner since it exist
				//-------------------------------------------------------------------
				const newReceiverMessage = new Message({
					ownerConvId: receiverConversation._id,
					receiverConvId: ownerConvExist._id,
					messages: [
						{
							user: req.params.id,
							message: req.body.message,
						},
					],
				});
				await newReceiverMessage.save();
				//update owner message
				const messages = await Message.findOneAndUpdate(
					{
						ownerConvId: ownerConvExist._id,
						receiverConvId: receiverConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			} else if (ownerConvExist && receiverConvExist) {
				//if both have never chated before or both deleted their new conversatin
				//1)update both owner and receiver conversation
				//-------------------------------------------------------------------
				const ownerConversation = await Conversation.findOneAndUpdate(
					{ _id: ownerConvExist._id },
					{ lastMessage: req.body.message },
					{ new: true }
				);
				//update receiver
				await receiverConvExist.updateOne({
					lastMessage: req.body.message,
				});

				//2)find and update update both owner and receiver messages
				//-------------------------------------------------------------------
				const messages = await Message.findOneAndUpdate(
					{
						ownerConvId: ownerConvExist._id,
						receiverConvId: receiverConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//update receiver message
				await Message.findOneAndUpdate(
					{
						ownerConvId: receiverConvExist._id,
						receiverConvId: ownerConvExist._id,
					},
					{
						$push: {
							messages: {
								user: req.params.id,
								message: req.body.message,
							},
						},
					},
					{ new: true }
				);
				//3)sending the owners data back only
				//-------------------------------------------------------------------
				return res.status(201).json({ ownerConversation, messages });
			}
		}

		if (!page && !user) {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

//get conversations only, id user/page id
router.get("/get/conversation/:id", authoriseUser, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const conversations = await Conversation.find({
				ownerId: req.params.id,
			});
			if (!conversations) {
				return res.status(403).json("conv does not exist exist");
			}
			res.status(201).json(conversations);
		}

		//if its page requesting
		const page = await Page.findById(req.params.id);

		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const conversations = await Conversation.find({
				ownerId: req.params.id,
			});
			if (!conversations) {
				return res.status(403).json("conv does not exist exist");
			}
			res.status(201).json(conversations);
		}

		if (!page && !user) {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

//get messages by receiver and sender id
//this is because a user can click directly on a profile to chat without navigating to chats
//receiver id iss passed through  query string
router.get("/get/message1/:id", authoriseUser, async (req, res) => {
	//const { receiverId } = req.query;
	try {
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const messages = await Message.findOne({
				ownerId: req.params.id,
				receiverId: req.body.receiverId,
			});
			if (!messages) {
				return res.status(403).json("message does not  exist");
			}

			return res.status(201).json(messages.messages);
		}

		//if its page requesting
		const page = await Page.findById(req.params.id);
		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const messages = await Message.findOne({
				ownerId: req.params.id,
				receiverId: receiverId,
			});
			if (!messages) {
				return res.status(403).json("message does not  exist");
			}

			return res.status(201).json(messages.messages);
		} else {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		return res.status(500).json(error);
	}
});

//get message by conversationid
//id is conversation id
router.get("/get/message2/:id", authoriseUser, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const messages = await Message.findOne({
				ownerConvId: req.body.convId,
			});

			if (!messages) {
				return res.status(403).json("message does not  exist");
			}

			return res.status(201).json(messages.messages);
		}

		//if its page requesting
		const page = await Page.findById(req.params.id);
		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			const messages = await Message.findOne({
				ownerConvId: req.body.convId,
			});
			if (!messages) {
				return res.status(403).json("message does not  exist");
			}

			res.status(201).json(messages.messages);
		} else {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		return res.status(500).json(error);
	}
});

//delete conversation and all messages
//get conversations only, id user/page id
router.delete("/delete/conversation/:id", authoriseUser, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (user) {
			if (req.userid !== user._id.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			await Conversation.findByIdAndDelete(req.body.convId);
			await Message.findOneAndDelete({
				ownerConvId: req.body.convId,
			});

			res.status(201).json("you deleted your conversation");
		}

		//if its page requesting
		const page = await Page.findById(req.params.id);

		if (page) {
			if (req.userid !== page.pageOwner.toString()) {
				return res
					.status(403)
					.json("you are not the owner of this account");
			}

			await Conversation.findByIdAndDelete(req.body.convId);
			await Message.findOneAndDelete({
				ownerConvId: req.body.convId,
			});

			res.status(201).json("you deleted your conversation");
		}

		if (!page && !user) {
			return res.status(403).json("account does not exist");
		}
	} catch (error) {
		res.status(500).json(error);
	}
});

export default router;
