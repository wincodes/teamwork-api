const defaultDbConn = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,  
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 20000
};

const testDbConn ={
	host: process.env.TEST_DB_HOST,
	user: process.env.TEST_DB_USER,
	database: process.env.TEST_DB_DATABASE,
	password: process.env.TEST_DB_PASSWORD,
	port: process.env.TEST_DB_PORT,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 20000
};

const pgConfig = process.env.NODE_ENV === 'test' ? testDbConn : defaultDbConn;

module.exports = pgConfig;
