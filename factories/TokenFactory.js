const jwt = require('jsonwebtoken');

const generateToken = (type) => {
	const details = {
		id: 1001,
		firstname: 'Godwin',
		lastname: 'Otokina',
		email: 'admin@email.com'
	};

	if (type === 'admin') {
		//create the token and return the response
		return jwt.sign({ ...details, usertype: 'admin' },
			process.env.APP_SECRET, { expiresIn: '1h' }
		);
	} else {
		return jwt.sign({ ...details, usertype: 'employee' },
			process.env.APP_SECRET, { expiresIn: '1h' }
		);
	}
};
module.exports = generateToken;