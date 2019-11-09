const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database');
const Chance = require('chance');
const chance = Chance();

module.exports = {
	async createMany(userToken, post_id, type, data) {
		try {
			const allComments = [];

			for (let i = 0; i <= data; i++) {
				/* eslint-enable no-await-in-loop */
				const user = await jwt.verify(userToken, process.env.APP_SECRET);

				const comment = chance.paragraph({ sentences: 5 });

				const query = `
        INSERT INTO comments (
          user_id, post_id, comment, post_type, created_on
            )
          VALUES
          (
            '${user.id}', '${post_id}', '${comment}', '${type}', NOW()
          )
          RETURNING id AS "commentId", comment, user_id AS "authorId"
        `;

				const pool = new Pool(dbConfig);
				const resp = await pool.query(query);

				await pool.end();

				const { rows } = resp;

				allComments.push(rows[0]);

			}

			return allComments;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
};