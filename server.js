require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const AuthRoutes = require('./routes/auth');
const GifRoutes = require('./routes/gif');
const ArticleRoutes = require('./routes/article');
const FeedsRoute = require('./routes/feeds');

//initialize express
const app = express();

//allow requests from cross origin
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, PATCH, OPTIONS'
	);
	next();
});

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

	apis: ['./controllers/*.js', 'server.js']
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

//routes
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/gifs', GifRoutes);
app.use('/api/v1/articles', ArticleRoutes);
app.use('/api/v1/feed', FeedsRoute);

//start the server
app.listen(port, () => console.log(`server started at Port ${port}`));

//exports the app for testing
module.exports = app;
