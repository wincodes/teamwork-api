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
					error: 'Invalid Token'
				});
			} else {
				const pool = new Pool(database);
				pool
					.query(`SELECT id, firstName, lastName, email FROM user WHERE id = ${user.id}`)
					.then(data => {
						const { rows } = data;
						if (rows.length === 0) {
							return res.status(404).json({
								status: 'error',
								error: 'User Not Found'
							});
						}
						req.userData = rows;
					})
					.catch(e => {
						console.log(e);
						return e;
					});
				pool.end();
			}
		});
    
		next();
	} else {
		return res.status(401).json({
			status: 'error',
			error: 'unauthenticated'
		});
	}
};

module.exports = auth;