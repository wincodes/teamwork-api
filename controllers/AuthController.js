const registerValidation = require('../validation/RegisterValidation');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');
const jwt = require('jsonwebtoken');

module.exports = {
	async registerUser(req, res) {
		//validate the data sent
		const { errors, isValid } = registerValidation(req.body);

		//if validation failes send errors
		if (!isValid) {
			return res.status(400).json({
				status: 'error',
				error: errors
			});
		}


		const pool = new Pool(dbConfig);

		//check if user with the email exist first
		pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, (err, resp) => {
			if (err) {
				res.status(500).json({
					status: 'error',
					error: 'An error occurred please try again'
				});
				throw err;
			}
			const { rows } = resp;
			if (rows.length > 0) {

				return res.status(400).json({
					status: 'error',
					error: `User with email ${req.body.email} already exists`
				});
			} else {




				//encrypt the password with bcryptjs
				bcrypt.genSalt(10, (err, salt) => {
					if (err) {
						res.status(500).json({
							status: 'error',
							error: 'An error occurred please try again'
						});

						throw err;
					}

					bcrypt.hash(req.body.password, salt, (err, hash) => {
						if (err) {
							res.status(500).json({
								status: 'error',
								error: 'An error occurred please try again'
							});

							throw err;
						}

						//get all the user data from the request body
						const {
							firstName, lastName, email, gender, jobRole, department, address
						} = req.body;

						//create the query
						const query = `
              INSERT INTO users(
                  firstName, lastName, password, email, gender, jobRole, department, address, created_on
                )
              VALUES
              (
                '${firstName}', '${lastName}', '${hash}', '${email}', '${gender}', '${jobRole}',
                '${department}', '${address}', NOW()
              )
              RETURNING id, firstName, lastname, email
            `;

						const pool2 = new Pool(dbConfig);
						pool2
							.query(query)
							.then(resp => {
								const { rows } = resp;

								//create the token
								jwt.sign(rows[0], process.env.APP_SECRET, { expiresIn: '5h' }, (err, token) => {

									return res.status(201).json({
										status: 'success',
										data: {
											message: 'User account successfully created',
											token,
											userId: rows[0].id,
										}
									});

								});
							})
							.catch(e => {
								res.status(500).json({
									status: 'error',
									error: 'An error occurred please try again'
								});
								throw e;
							});
						pool2.end();
					});
				});
			}
		});
		pool.end();
	}
};