const Validator = require('validator');
const isEmpty = require('./IsEmpty');

const RegisterValidation = data => {
	let errors = {};

	data.firstName = isEmpty(data.firstName) ? '' : data.firstName;
	data.lastName = isEmpty(data.lastName) ? '' : data.lastName;
	data.email = isEmpty(data.email) ? '' : data.email;
	data.password = isEmpty(data.password) ? '' : data.password;
	data.gender = isEmpty(data.gender) ? '' : data.gender;
	data.jobRole = isEmpty(data.jobRole) ? '' : data.jobRole;
	data.department = isEmpty(data.department) ? '' : data.department;
	data.address = isEmpty(data.address) ? '' : data.address;
  

	if(Validator.isEmpty(data.firstName)){
		errors.firstName = 'Firstname is Required';
	}

	if(Validator.isEmpty(data.lastName)){
		errors.lastName = 'Lastname is Required';
	}

	if (!Validator.isEmail(data.email)) {
		errors.email = 'Email must be a valid email';
	}

	if (Validator.isEmpty(data.email)) {
		errors.email = 'Email field is required';
	}

	if (!Validator.isLength(data.password, { min: 6, max: 20 })) {
		errors.password = 'Password must be between 6 and 20 characters';
	}

	if (Validator.isEmpty(data.password)) {
		errors.password = 'Password field is required';
	}

	if (Validator.isEmpty(data.gender)) {
		errors.gender = 'Gender field is required';
	}

	if (Validator.isEmpty(data.jobRole)) {
		errors.jobRole = 'JobRole field is required';
	}

	if (Validator.isEmpty(data.department)) {
		errors.department = 'Department field is required';
	}

	if (Validator.isEmpty(data.address)) {
		errors.address = 'Address field is required';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};

module.exports = RegisterValidation;