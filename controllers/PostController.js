const gifValidation = require('../validation/GifsValidation');
const cloudinary = require('cloudinary').v2;
const cloudinaryConfig = require('../config/cloudinary');
const fs = require('fs');
const dbConfig = require('../config/database');
const { Pool } = require('pg');

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
				if (req.file) {
					await fs.unlinkSync(req.file.path, (err) => {
						if (err) throw err;
						console.log('path/file.txt was deleted');
					});
				}

				return res.status(400).json({
					status: 'error',
					error: errors
				});
			}

			let uploadImage = '';

			cloudinary.uploader.upload(req.file.path, (error, result) => {
				if (error) {
					console.log(error);
				} else {
					uploadImage = result.secure_url;

					console.log(result);
				}
			});

			if (uploadImage) {

				await fs.unlinkSync(req.file.path, (err) => {
					if (err) throw err;
					console.log('path/file.txt was deleted');
				});


				const query = `
          INSERT INTO posts(
              user_id, title, image, post_type, created_on
            )
          VALUES
          (
            '${req.user.id}', '${req.body.title}', ${uploadImage}, 'gif', NOW()
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
			}else{
				res.status(500).json({
					status: 'error',
					error: 'An error occurred on image upload please try again'
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
}

module.exports = PostController;