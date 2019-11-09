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
        RETURNING id, title, image AS url, created_on
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
	},

	async createMany(userToken, data) {
		try {
			const allPosts = [];

			for (let i = 0; i <= data; i++) {
				/* eslint-enable no-await-in-loop */
				const user = await jwt.verify(userToken, process.env.APP_SECRET);

				const newTitle = chance.sentence({ words: 5 });
				const newArticle = chance.paragraph({ sentences: 1 });
				const postType = chance.pickone(['article', 'gif']);

				const query = `
					INSERT INTO posts(
							user_id, title, article, image, post_type, created_on
						)
					VALUES
					(
						'${user.id}', '${newTitle}', '${newArticle}', 'http://www.gif/gif.gif', '${postType}', NOW()
					)
					RETURNING id, user_id AS "authorId", title, article, image AS url, post_type, 
					created_on AS "createdOn"
				`;

				const pool = new Pool(dbConfig);
				const resp = await pool.query(query);

				await pool.end();

				const { id, title, post_type, createdOn, article, url, authorId } = resp.rows[0];

				let data = {
					id,
					title,
					createdOn,
					authorId
				};

				if (post_type === 'article') {
					data = {
						...data,
						article
					};
				} else {
					data = {
						...data,
						url
					};
				}

				allPosts.push(data);
				
			}

			return allPosts;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

};