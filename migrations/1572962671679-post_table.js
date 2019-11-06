'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const dbConfig = require('../config/database');

module.exports.up = (next) => {
	const query = `
    CREATE TABLE IF NOT EXISTS posts(
      id serial PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR (100) NOT NULL,
      image VARCHAR (255),
      article TEXT,
      post_type VARCHAR(10),
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
	const query = 'DROP TABLE IF EXISTS posts CASCADE';
	const pool = new Pool(dbConfig);
	pool
		.query(query)
		.then(res => {
			if(res) next();
		})
		.catch(e => console.log(e));
	pool.end();
};
