
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database');

module.exports = {

	async createUser(details, userType) {
		try {
			const salt = await bcrypt.genSalt(10);

			const hash = await bcrypt.hash(details.password, salt);

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
			const resp = await pool2.query(query);

			pool2.end();

			const { rows } = resp;

			//create the token and return the response
			return jwt.sign(rows[0], process.env.APP_SECRET, { expiresIn: '5h' });
		} catch (err) {
			return err;
		}
	}
};