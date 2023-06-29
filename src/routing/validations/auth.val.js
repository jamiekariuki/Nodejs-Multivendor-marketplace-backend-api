import Joi from "@hapi/joi";

export const registerValidation = (req) => {
	const userSchema = Joi.object({
		userName: Joi.string().empty().min(3).max(30).required().messages({
			"string.base": `"username" should be a type of 'text'`,
			"string.empty": `"username" cannot be an empty field`,
			"string.min": `"username" should have a minimum length of {#limit}`,
			"string.max": `"username" should have a maximum length of {#limit}`,
			"any.required": `"username" is a required field`,
		}),

		name: Joi.string().min(3).max(30).required(),

		email: Joi.string().email({
			minDomainSegments: 2,
			tlds: { allow: ["com", "net"] },
		}),

		password: Joi.string()
			.empty()
			.pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
			.required()
			.messages({
				"string.base": `"password" should be a type of 'text'`,
				"string.empty": `"password" cannot be an empty field`,
				"string.pattern.base": `"password" should atleast have 8 or more characters`,
				"any.required": `"password" is a required field`,
			}),

		profilePicture: Joi.string(),
	});

	return userSchema.validate(req);
};

export const userValidation = (req) => {
	const userSchema = Joi.object({
		userName: Joi.string().empty().min(3).max(30).required().messages({
			"string.base": `"username" should be a type of 'text'`,
			"string.empty": `"username" cannot be an empty field`,
			"string.min": `"username" should have a minimum length of {#limit}`,
			"string.max": `"username" should have a maximum length of {#limit}`,
			"any.required": `"username" is a required field`,
		}),

		name: Joi.string().min(3).max(30).required(),

		email: Joi.string().email({
			minDomainSegments: 2,
			tlds: { allow: ["com", "net"] },
		}),

		profilePicture: Joi.string(),
	});

	return userSchema.validate(req);
};

export const passwordValidation = (req) => {
	const userSchema = Joi.string()
		.empty()
		.pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
		.required()
		.messages({
			"string.base": `"password" should be a type of 'text'`,
			"string.empty": `"password" cannot be an empty field`,
			"string.pattern.base": `"password" should atleast have 8 or more characters`,
			"any.required": `"password" is a required field`,
		});

	return userSchema.validate(req);
};
