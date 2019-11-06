const Validator = require('validator');
const isEmpty = require('./IsEmpty');

const ArticleValidation = data => {
	let errors = {};

	data.title = isEmpty(data.title) ? '' : data.title;
	data.article = isEmpty(data.article) ? '' : data.article;
  
	if (Validator.isEmpty(data.title)) {
		errors.title = 'Title field is required';
	}
  
	if (Validator.isEmpty(data.article)) {
		errors.article = 'Article field is required';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};

module.exports = ArticleValidation;