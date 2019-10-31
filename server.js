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
pool.query('SELECT NOW()', (err, res) => {
	if(res){
		console.log('postgres connected');
	}
	if(err){
		console.log(err);
	}
	pool.end();
});

//setup the port
const port = process.env.PORT || 7000;

app.get('/api/v1', (req, res) => {
	res.json('Hello World');
});

//start the server
app.listen(port, () => console.log(`server started at Port ${port}`));