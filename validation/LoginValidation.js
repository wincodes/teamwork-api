const Validator = require('validator');
const isEmpty = require('./IsEmpty');

const RegisterValidation = data => {
	let errors = {};

	data.email = isEmpty(data.email) ? '' : data.email;
	data.password = isEmpty(data.password) ? '' : data.password;
  

	if (!Validator.isEmail(data.email)) {
		errors.email = 'Email must be a valid email';
	}

	if (Validator.isEmpty(data.email)) {
		errors.email = 'Email field is required';
	}
  
	if (Validator.isEmpty(data.password)) {
		errors.password = 'Password field is required';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};

module.exports = RegisterValidation;