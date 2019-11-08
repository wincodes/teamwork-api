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
        RETURNING id, title, article, created_on
      `;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);

			await pool.end();

			const { rows } = resp;
			return rows[0];
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	async createGif(userToken) {
		try {
			const user = await jwt.verify(userToken, process.env.APP_SECRET);

			const title = chance.sentence({ words: 5 });
			const gif = 'http://www/gif/com/hi.jpg';

			const query = `
        INSERT INTO posts(
            user_id, title, image, post_type, created_on
          )
        VALUES
        (
          '${user.id}', '${title}', '${gif}', 'gif', NOW()
        )
        RETURNING id, title, image
      `;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);

			await pool.end();

			const { rows } = resp;
			return rows[0];
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	async allPosts() {
		try {
			const query = 'SELECT COUNT(*) FROM posts';

			const pool = new Pool(dbConfig);
			const res = await pool.query(query);

			const { rows } = res;

			return rows[0].count;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

};