import Joi from "@hapi/joi";

export const pageValidation = (req) => {
	const userSchema = Joi.object({
		pageUserName: Joi.string().empty().min(3).max(30).required().messages({
			"string.base": `"username" should be a type of 'text'`,
			"string.empty": `"username" cannot be an empty field`,
			"string.min": `"username" should have a minimum length of {#limit}`,
			"string.max": `"username" should have a maximum length of {#limit}`,
			"any.required": `"username" is a required field`,
		}),
		pageName: Joi.string(),
		type: Joi.string().valid("shop", "service", "freelancer").required(),
		bio: Joi.string().max(50),
		category: Joi.array().max(50),
		location: Joi.string(),
		pageIcon: Joi.string(),
	});

	return userSchema.validate(req);
};
