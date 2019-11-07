const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/database');
const Chance = require('chance');
const chance = Chance();

module.exports = {

	async createArticle(userToken) {
		try {
			const user = await jwt.verify(userToken, process.env.APP_SECRET);

			const title = chance.sentence({ words: 5 });
			const article = chance.paragraph({ sentences: 1 });

			const query = `
        INSERT INTO posts(
            user_id, title, article, post_type, created_on
          )
        VALUES
        (
          '${user.id}', '${title}', '${article}', 'article', NOW()
        )
        RETURNING id, title, article
      `;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);

			await pool.end();

			const { rows } = resp;
			return rows[0];
		} catch (err) {
			return err;
		}
	}
};