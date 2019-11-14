const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
	//extract the authorization header
	const authHeader = req.headers['authorization'];

	if (typeof authHeader !== 'undefined') {
		//split token and bearer into bearer array 
		const bearer = authHeader.split(' ');

		//set token
		const token = bearer[1];

		//verify the auth user
		jwt.verify(token, process.env.APP_SECRET, (err, user) => {
			if (err) {
				return res.status(401).json({
					status: 'error',
					error: 'Invalid or Expired Token'
				});
			}
			if (user.usertype === 'admin') {
				req.user = user;
				next();
			} else {
				return res.status(403).json({
					status: 'error',
					error: 'Only an Admin is Allowed'
				});
			}
		});
	} else {
		return res.status(401).json({
			status: 'error',
			error: 'unauthenticated'
		});
	}
};

module.exports = auth;