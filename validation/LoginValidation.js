const Validator = require('validator');
const isEmpty = require('./IsEmpty');

const RegisterValidation = data => {
	let errors = {};

	data.email = isEmpty(data.email) ? '' : data.email;
	data.username = isEmpty(data.username) ? '' : data.username;
	data.password = isEmpty(data.password) ? '' : data.password;
  

	if (!isEmpty(data.email) && !Validator.isEmail(data.email)) {
		errors.email = 'Email must be a valid email';
	}

	if (Validator.isEmpty(data.email) && Validator.isEmpty(data.username) ) {
		errors.email = 'Email or Username field is required';
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