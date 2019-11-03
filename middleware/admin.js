const { Pool } = require('pg');
const database = require('../config/database');
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
			const pool = new Pool(database);
			pool
				.query(`SELECT usertype FROM users WHERE id = ${user.id}`)
				.then(data => {
					const { rows } = data;
					if (rows[0].usertype === 'admin') {
						req.user = user;
						next();
					} else {
						return res.status(401).json({
							status: 'error',
							error: 'Only an Admin is Allowed'
						});
					}
				})
				.catch(e => {
					res.status(500).json({
						status: 'error',
						error: 'An error occurred please try again'
					});
					throw e;
				});
			pool.end();
		});
	} else {
		return res.status(401).json({
			status: 'error',
			error: 'unauthenticated'
		});
	}
};

module.exports = auth;