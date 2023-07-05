import Joi from "@hapi/joi";

export const postValidation = (req) => {
	const userSchema = Joi.object({
		postPicture: Joi.string(),
		description: Joi.string(),
		category: Joi.string(),
		price: Joi.number(),
		title: Joi.string(),
		type: Joi.string().valid("shop", "service", "freelance").required(),
	});

	return userSchema.validate(req);
};
