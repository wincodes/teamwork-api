require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dbConfig = require('./config/database');
const { Pool } = require('pg');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//initialize express
const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//test connection to postgres database
const pool = new Pool(dbConfig);
pool
	.query('SELECT NOW()')
	.then(res => console.log(res.rows))
	.catch(e => console.log(e));
pool.end();

//setup the port
const port =
	process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT;


//set the swagger api documentation options
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'TeamWork API',
			description:
				'TeamWork (Andela and Facebook Capstone Project) API Documentation',
			version: '1.0.0'
		},
		servers: ['http://localhost:7000']
	},

	apis: ['server.js', '.routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

//the swagger documentation route
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/v1:
 *  get:
 *    description: the api landing page
 *    responses:
 *      '200':
 *        description: A successful response
 * 				content:
 * 					status: status of response
 * 					data: {message: "hello world"}
 */
app.get('/api/v1', (req, res) => {
	res.json({
		status: 'success',
		data: {
			message: 'hello world'
		}
	});
});

//start the server
app.listen(port, () => console.log(`server started at Port ${port}`));

//exports the app for testing
module.exports = app;
