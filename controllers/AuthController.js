const registerValidation = require('../validation/RegisterValidation');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');
const jwt = require('jsonwebtoken');
const loginValidation = require('../validation/LoginValidation');

module.exports = {
	/**
 * @swagger
 * paths:
 *  /api/v1/auth/create-user:
 *    post:
 *      description: admin creates a user
 *      parameters:
 *        - in: query
 *          name: firstName
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: lastName
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: password
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: gender
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: jobRole
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: department
 *          required: true
 *          schema:
 *            type: string 
 *        - in: query
 *          name: address
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '201':
 *          description: OK, User created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: "success" 
 *                  data:
 *                    type: object
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '401':
 *          description: Authorization information is missing or invalid.
 *              
 */
	async registerUser(req, res) {
		try {
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
			const findUser = await pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

			const { rows } = findUser;
			if (rows.length > 0) {
				//the user already exist return error
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
						pool2.query(query, (err, resp) => {
							if (err) {
								throw err;
							}

							const { rows } = resp;

							//create the token and return the response
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
						});
						pool2.end();
					});
				});
			}
			pool.end();
		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	},

	
	/**
 * @swagger
 * paths:
 *  /api/v1/auth/signin:
 *    post:
 *      description: admin and user sign in
 *      parameters:
 *        - in: query
 *          name: email
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: password
 *          required: true
 *          schema:
 *            type: string 
 *      responses:
 *        '200':
 *          description: OK, User created successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: "success" 
 *                  data:
 *                    type: object
 *                    example:
 *                      token: String
 *                      userId: Integer
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '500':
 *          description: Server error.
 *              
 */
	async login(req, res) {
		try {
			// //validate the data sent
			const { errors, isValid } = loginValidation(req.body);

			//if validation failes send errors
			if (!isValid) {
				return res.status(400).json({
					status: 'error',
					error: errors
				});
			}

			const pool = new Pool(dbConfig);

			const resp = await pool.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

			const { rows } = resp;
			if (rows.length === 0) {
				return res.status(404).json({
					status: 'error',
					error: `User with email ${req.body.email} not found`
				});
			} else {
				const user = rows[0];

				//match the password
				bcrypt.compare(req.body.password, user.password).then(isMatch => {
					if (isMatch) {
						const userData = {
							id: user.id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email
						};
						jwt.sign(userData, process.env.APP_SECRET, { expiresIn: '5h' }, (err, token) => {

							return res.status(201).json({
								status: 'success',
								data: {
									token,
									userId: userData.id,
								}
							});

						});
					} else {
						return res.status(400).json({
							status: 'error',
							error: 'Password does not match'
						});
					}
				});
			}

		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}

	//end of module
};