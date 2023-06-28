import jwt from "jsonwebtoken";

export const authoriseUser = (req, res, next) => {
	//fetching token from cookie and validating if there is one
	const token = req.cookies.accesToken;
	if (!token) return res.status(401).send("you have no access to this task");

	//verify jwt token if it matches the existing token
	jwt.verify(token, process.env.JWT_KEY, async (error, payload) => {
		if (error) return res.status(403).send("your token is not valid");
		req.userid = payload.id;
		next();
	});
};
