const { Pool } = require('pg');
const dbConfig = require('../config/database');
const isEmpty = require('../validation/IsEmpty');

class CommentController {

	/**
 * @swagger
 * paths:
 *  /api/v1/articles/:articleId/comment:
 *    post:
 *      description: create article commment
 *      parameters:
 *        - in: query
 *          name: comment
 *          required: true
 *          schema:
 *            type: string
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
 *                      message: Comment successfully created,
 *                      createdOn : DateTime,
 *                      articleTitle : String,
 *                      article: String
 *                      comment : String,
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '500':
 *          description: Server error.
 *              
 */
	async createArticleComment(req, res) {
		const { comment } = req.body;

		if (isEmpty(comment) || comment === '') {
			return res.status(400).json({
				status: 'error',
				error: 'Comment is required'
			});
		}
		const articleQuery = ` SELECT * FROM posts WHERE id = ${req.params.articleId} LIMIT 1`;
		const pool = new Pool(dbConfig);

		const articleData = await pool.query(articleQuery);
		if ((articleData.rows).length === 0) {
			await pool.end();
			return res.status(404).json({
				status: 'error',
				error: 'Article not found'
			});
		}
		const articleResult = articleData.rows[0];

		const query = `
    INSERT INTO comments (
      user_id, post_id, comment, post_type, created_on
        )
      VALUES
      (
        '${req.user.id}', '${req.params.articleId}', '${comment}', 'article', NOW()
      )
      RETURNING id, comment, created_on
    `;
		const resp = await pool.query(query);
		const { rows } = resp;

		return res.status(201).json({
			status: 'success',
			data: {
				message: 'Comment successfully created',
				createdOn: rows[0].created_on,
				articleTitle: articleResult.title,
				article: articleResult.article,
				comment: rows[0].comment,
			}
		});
	}
  

	/**
 * @swagger
 * paths:
 *  /api/v1/gifs/:gifIId/comment:
 *    post:
 *      description: create gif commment
 *      parameters:
 *        - in: query
 *          name: comment
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '201':
 *          description: OK, Comment created successfully
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
 *                      message: Comment successfully created,
 *                      createdOn : DateTime,
 *                      gifTitle : String,
 *                      comment : String,
 *        '400':
 *          description: Bad request. Missing parameters.
 *        '500':
 *          description: Server error.
 *              
 */
	async createGifComment(req, res) {
		const { comment } = req.body;

		if (isEmpty(comment) || comment === '') {
			return res.status(400).json({
				status: 'error',
				error: 'Comment is required'
			});
		}
		const gifQuery = ` SELECT * FROM posts WHERE id = ${req.params.gifId} LIMIT 1`;
		const pool = new Pool(dbConfig);

		const gifData = await pool.query(gifQuery);
		if ((gifData.rows).length === 0) {
			await pool.end();
			return res.status(404).json({
				status: 'error',
				error: 'Gif not found'
			});
		}
		const gifResult = gifData.rows[0];

		const query = `
    INSERT INTO comments (
      user_id, post_id, comment, post_type, created_on
        )
      VALUES
      (
        '${req.user.id}', '${req.params.gifId}', '${comment}', 'gif', NOW()
      )
      RETURNING id, comment, created_on
    `;
		const resp = await pool.query(query);
		const { rows } = resp;

		return res.status(201).json({
			status: 'success',
			data: {
				message: 'Comment successfully created',
				createdOn: rows[0].created_on,
				gifTitle: gifResult.title,
				comment: rows[0].comment,
			}
		});
	}

}
module.exports = CommentController;