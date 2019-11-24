'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const dbConfig = require('../config/database');

module.exports.up = (next) => {
	const query = `
    CREATE TABLE IF NOT EXISTS users(
      id serial PRIMARY KEY,
      firstname VARCHAR (50) NOT NULL,
      lastname VARCHAR (50) NOT NULL,
      password VARCHAR (255) NOT NULL,
      email VARCHAR (50) UNIQUE NOT NULL,
      gender VARCHAR (10) NOT NULL,
      jobRole VARCHAR (50) NOT NULL,
      department VARCHAR (50) NOT NULL,
      address VARCHAR (255) NOT NULL,
      userType VARCHAR (20) DEFAULT 'employee',
      created_on TIMESTAMP NOT NULL
      )
  `;

	const pool = new Pool(dbConfig);
	pool
		.query(query)
		.then(res => {
			if(res) next();
		})
		.catch(e => { throw e; });
	pool.end();
};

module.exports.down = (next) => {
	const query = 'DROP TABLE IF EXISTS users CASCADE';
	const pool = new Pool(dbConfig);
	pool
		.query(query)
		.then(res => {
			if(res) next();
		})
		.catch(e => console.log(e));
	pool.end();
};
