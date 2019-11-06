
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database');

module.exports = {

	async createUser(details, userType) {
		return new Promise((resolve, reject) => {
			bcrypt.genSalt(10, (err, salt) => {
				if (err) {
					throw err;
				}

				bcrypt.hash(details.password, salt, (err, hash) => {
					if (err) {
						reject(err);
					}

					//get all the user data from the request details
					const {
						firstName, lastName, email, gender, jobRole, department, address
					} = details;

					const query = `
          INSERT INTO users(
              firstName, lastName, password, email, gender, jobRole, department, address, usertype, created_on
            )
          VALUES
          (
            '${firstName}', '${lastName}', '${hash}', '${email}', '${gender}', '${jobRole}',
            '${department}', '${address}', '${userType}', NOW()
          )
          RETURNING id, firstName, lastname, email, usertype
        `;

					const pool2 = new Pool(dbConfig);
					pool2.query(query, (err, resp) => {
						if (err) {
							reject(err);
						}

						const { rows } = resp;

						//create the token and return the response
						jwt.sign(rows[0], process.env.APP_SECRET, { expiresIn: '5h' }, (err, token) => {
							if (err) reject(err);
							resolve(token);
						});
					});
					pool2.end();
				});
			});
		});

	}
};