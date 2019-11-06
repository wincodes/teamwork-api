const Validator = require('validator');
const isEmpty = require('./IsEmpty');

const GifsValidation = (data, file) => {
	let errors = {};

	data.title = isEmpty(data.title) ? '' : data.title;
  
	if (Validator.isEmpty(data.title)) {
		errors.title = 'Title field is required';
	}
  
	if(file && file.mimetype !== 'image/gif'){
		errors.image = 'Only Gif image is allowed';
	}

	if(file && file.size > 524718){
		errors.image = 'Size of image should be not be more than 500kb';
	}
  
	if (isEmpty(file)) {
		errors.image = 'Image field is required';
	}


	/**
   * sample image file
   * 
   * { fieldname: 'image',
  originalname: 'color.gif',
  encoding: '7bit',
  mimetype: 'image/gif',
  destination: 'uploads',
  filename: 'color.gif1573032670145.gif',
  path: 'uploads/color.gif1573032670145.gif',
  size: 54310 }
   */

	return {
		errors,
		isValid: isEmpty(errors)
	};
};

module.exports =GifsValidation;