const gifValidation = require('../validation/GifsValidation');
const cloudinary = require('cloudinary').v2;
const cloudinaryConfig = require('../config/cloudinary');
const dbConfig = require('../config/database');
const { Pool } = require('pg');
const Datauri = require('datauri');
const ArticleValidation = require('../validation/ArticleValidation');

//configure clouduinary
cloudinary.config(cloudinaryConfig);

class PostController {
	/**
 * @swagger
 * paths:
 *  /api/v1/gifs:
 *    post:
 *      description: create a gif post
 *      parameters:
 *        - in: query
 *          name: title
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: image
 *          required: true
 *          schema:
 *            type: file 
 *      responses:
 *        '201':
 *          description: OK, Post created successfully
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
 *                      gifId: Integer
 *                      message: GIF image successfully posted,
 *                      createdOn : DateTime,
 *                      title : String
 *                      imageUrl : String,
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '500':
 *          description: Server error.
 *              
 */
	async createGIf(req, res) {
		try {
			// // validate the data sent
			const { errors, isValid } = gifValidation(req.body, req.file);

			//if validation failes send errors
			if (!isValid) {
				return res.status(400).json({
					status: 'error',
					error: errors
				});
			}

			const datauri = new Datauri();

			await datauri.format('.gif', req.file.buffer);

			let uploadImage = '';

			await cloudinary.uploader.upload(datauri.content, (error, result) => {
				if (error) {
					throw (error);
				} else {
					uploadImage = result.secure_url;
				}
			});

			const query = `
        INSERT INTO posts(
            user_id, title, image, post_type, created_on
          )
        VALUES
        (
          '${req.user.id}', '${req.body.title}', '${uploadImage}', 'gif', NOW()
        )
        RETURNING id, title, image, created_on
      `;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);
			await pool.end();

			const { rows } = resp;

			return res.status(201).json({
				status: 'success',
				data: {
					message: 'GIF image successfully posted',
					gifId: rows[0].id,
					createdOn: rows[0].created_on,
					title: rows[0].title,
					imageUrl: rows[0].image
				}
			});

		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}

	/**
 * @swagger
 * paths:
 *  /api/v1/articles:
 *    post:
 *      description: create an article
 *      parameters:
 *        - in: query
 *          name: title
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: article
 *          required: true
 *          schema:
 *            type: String 
 *      responses:
 *        '201':
 *          description: OK, Post created successfully
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
 *                      articleId: Integer
 *                      message: Article successfully posted,
 *                      createdOn : DateTime,
 *                      title : String
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '500':
 *          description: Server error.
 *              
 */
	async createArticle(req, res) {
		try {
			// // validate the data sent
			const { errors, isValid } = ArticleValidation(req.body);

			//if validation failes send errors
			if (!isValid) {
				return res.status(400).json({
					status: 'error',
					error: errors
				});
			}

			const { title, article } = req.body;

			const query = `
        INSERT INTO posts(
            user_id, title, article, post_type, created_on
          )
        VALUES
        (
          '${req.user.id}', '${title}', '${article}', 'article', NOW()
        )
        RETURNING id, title, article, created_on
      `;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);
			await pool.end();

			const { rows } = resp;

			return res.status(201).json({
				status: 'success',
				data: {
					message: 'Article successfully posted',
					articleId: rows[0].id,
					createdOn: rows[0].created_on,
					title: rows[0].title
				}
			});

		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}

	/**
* @swagger
* paths:
*  /api/v1/articles/:articleId:
*    patch:
*      description: edit article
*      parameters:
*        - in: url
*          name: articleId
*          required: true
*          schema:
*            type: Number 
*        - in: query
*          name: title
*          required: true
*          schema:
*            type: string
*        - in: query
*          name: article
*          required: true
*          schema:
*            type: String 
*      responses:
*        '200':
*          description: OK, Updated successfully
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
*                      message: Article successfully updated,
*                      article : String,
*                      title : String
*        '400':
*          description: Bad request. Missing parameters.
*        '500':
*          description: Server error.
*              
*/
	async editArticle(req, res) {
		try {
			// // validate the data sent
			const { errors, isValid } = ArticleValidation(req.body);

			//if validation failes send errors
			if (!isValid) {
				return res.status(400).json({
					status: 'error',
					error: errors
				});
			}

			const pool = new Pool(dbConfig);

			const findArticle = `SELECT * FROM posts where id = ${req.params.articleId} LIMIT 1`;

			const findResp = await pool.query(findArticle);
			const findRows = findResp.rows;

			if (findRows.length === 0) {
				await pool.end();
				return res.status(404).json({
					status: 'error',
					error: 'Article Not found'
				});
			} else if (findRows[0].user_id !== req.user.id) {
				await pool.end();
				return res.status(403).json({
					status: 'error',
					error: 'cannot edit another user\'s article'
				});
			}

			const { title, article } = req.body;

			const query = `
				UPDATE posts SET title = '${title}', article = '${article}'
				WHERE id = ${req.params.articleId}
				RETURNING id, title, article, created_on
			`;

			const resp = await pool.query(query);
			await pool.end();

			const { rows } = resp;

			return res.status(200).json({
				status: 'success',
				data: {
					message: 'Article successfully updated',
					title: rows[0].title,
					article: rows[0].article
				}
			});

		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}


	/**
* @swagger
* paths:
*  /api/v1/article/:articleId:
*    delete:
*      description: delete users article
*      parameters:
*        - in: url
*          name: articleId
*          required: true
*          schema:
*            type: number 
*      responses:
*        '200':
*          description: OK, Article Deleted successfully
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
*                      message: Article successfully deleted
*        '403':
*          description: Unauthorized.
*        '500':
*          description: Server error.
*              
*/

	async deleteArticle(req, res) {
		try {
			const pool = new Pool(dbConfig);

			const findArticle = `SELECT * FROM posts where id = ${req.params.articleId} 
				AND post_type = 'article' LIMIT 1`;

			const findResp = await pool.query(findArticle);
			const findRows = findResp.rows;

			if (findRows.length === 0) {
				await pool.end();
				return res.status(404).json({
					status: 'error',
					error: 'Article Not found'
				});
			} else if (findRows[0].user_id !== req.user.id) {
				await pool.end();
				return res.status(403).json({
					status: 'error',
					error: 'cannot delete another user\'s article'
				});
			}

			const query = `DELETE FROM posts WHERE id = ${req.params.articleId} AND post_type = 'article'`;
			await pool.query(query);

			await pool.end();

			return res.status(200).json({
				status: 'success',
				data: {
					message: 'Article successfully deleted'
				}
			});


		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}


	/**
* @swagger
* paths:
*  /api/v1/gif/:gifId:
*    delete:
*      description: delete users gif
*      parameters:
*        - in: url
*          name: gifId
*          required: true
*          schema:
*            type: number 
*      responses:
*        '200':
*          description: OK, GIf Deleted successfully
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
*                      message: GIf successfully deleted
*        '403':
*          description: Unauthorized.
*        '500':
*          description: Server error.
*              
*/

	async deleteGif(req, res) {
		try {
			const pool = new Pool(dbConfig);

			const findArticle = `SELECT * FROM posts where id = ${req.params.gifId} 
				AND post_type = 'gif' LIMIT 1`;

			const findResp = await pool.query(findArticle);
			const findRows = findResp.rows;

			if (findRows.length === 0) {
				await pool.end();
				return res.status(404).json({
					status: 'error',
					error: 'Gif Not found'
				});
			} else if (findRows[0].user_id !== req.user.id) {
				await pool.end();
				return res.status(403).json({
					status: 'error',
					error: 'cannot delete another user\'s gif'
				});
			}

			const query = `DELETE FROM posts WHERE id = ${req.params.gifId} AND post_type = 'gif'`;
			await pool.query(query);

			await pool.end();

			return res.status(200).json({
				status: 'success',
				data: {
					message: 'Gif successfully deleted'
				}
			});


		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}

	/**
* @swagger
* paths:
*  /api/v1/feed:
*    get:
*      description: get all posts (articles and gifs)
*      responses:
*        '200':
*          description: OK, GIf Deleted successfully
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  status:
*                    type: string
*                    example: "success" 
*                  data:
*                    type: array
*        '403':
*          description: Unauthorized.
*        '500':
*          description: Server error.
*              
*/

	async feeds(req, res) {
		try {
			const query = `SELECT id, created_on AS "createdOn", title, article,
			image AS url, user_id AS "authorId"
			FROM posts ORDER BY id DESC`;

			const pool = new Pool(dbConfig);
			const resp = await pool.query(query);
			await pool.end();

			const { rows } = resp;

			return res.status(200).json({
				status: 'success',
				data: rows
			});

		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}


	/**
* @swagger
* paths:
*  /api/v1/articles/:articleId:
*    get:
*      description: get a particular article
*      parameters:
*        - in: url
*          name: articleId
*          required: true
*          schema:
*            type: number 
*      responses:
*        '200':
*          description: OK, Article retrived successfully
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
*												
*        '403':
*          description: Unauthorized.
*				'404':
*					description: Gif not found
*				'500':
*          description: Server error.
*              
*/
	async getArticle(req, res) {
		try {
			const pool = new Pool(dbConfig);

			const query = `SELECT id, created_on AS "createdOn", title, article
			FROM posts WHERE id = ${req.params.articleId} LIMIT 1`;

			const resp = await pool.query(query);
			const { rows } = resp;

			if (rows.length === 0) {
				await pool.end();
				return res.status(404).json({
					status: 'error',
					error: 'Article not found'
				});
			}

			const commentQuery = ` SELECT id AS "commentId", comment, user_id AS "authorId"
			FROM comments WHERE post_id = ${rows[0].id}
			`;
			const commentResp =  await pool.query(commentQuery);
			const comments = commentResp.rows;

			return res.status(200).json({
				status: 'success',
				data: {
					...rows[0],
					comments
				}
			});


		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}

	
	/**
* @swagger
* paths:
*  /api/v1/gifs/:gifId:
*    get:
*      description: get a particular gif
*      parameters:
*        - in: url
*          name: gifId
*          required: true
*          schema:
*            type: number 
*      responses:
*        '200':
*          description: OK, Gif retrived successfully
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
*												
*        '403':
*          description: Unauthorized.
*				'404':
*					description: Gif not found
*				'500':
*          description: Server error.
*              
*/

	async getGif(req, res) {
		try {
			const pool = new Pool(dbConfig);

			const query = `SELECT id, created_on AS "createdOn", title, image as url
			FROM posts WHERE id = ${req.params.articleId} LIMIT 1`;

			const resp = await pool.query(query);
			const { rows } = resp;

			if (rows.length === 0) {
				await pool.end();
				return res.status(404).json({
					status: 'error',
					error: 'Gif not found'
				});
			}

			const commentQuery = ` SELECT id AS "commentId", comment, user_id AS "authorId"
			FROM comments WHERE post_id = ${rows[0].id}
			`;
			const commentResp =  await pool.query(commentQuery);
			const comments = commentResp.rows;

			return res.status(200).json({
				status: 'success',
				data: {
					...rows[0],
					comments
				}
			});


		} catch (err) {
			res.status(500).json({
				status: 'error',
				error: 'An error occurred please try again'
			});
			throw err;
		}
	}
}

module.exports = PostController;