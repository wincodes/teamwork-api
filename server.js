require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pgConfig = require('./pgconfig');
const { Pool } = require('pg');

//initialize express
const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//test connection to postgres database
const pool = new Pool(pgConfig);
pool.query('SELECT NOW()')
	.then(res => console.log(res.rows))
	.catch(e => console.log(e));
pool.end();

//setup the port
const port = process.env.NODE_ENV === 'dev' ? process.env.PORT : process.env.TEST_PORT;

app.get('/api/v1', (req, res) => {
	res.json('Hello World');
});

//start the server
app.listen(port, () => console.log(`server started at Port ${port}`));

//exports the app for testing
module.exports = app;