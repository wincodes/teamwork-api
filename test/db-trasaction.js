require('dotenv').config();
process.env.NODE_ENV = 'test';
const { Pool } = require('pg');
const dbConfig = require('../config/database');

module.exports = {
	async truncatePosts() {
		try {
			const query = ' TRUNCATE posts CASCADE';
			const pool = new Pool(dbConfig);
			await pool.query(query);
		} catch (err) {
			console.log(err);
		}
	}
};