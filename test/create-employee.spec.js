process.env.NODE_ENV = 'test';

const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');
const TokenFactory = require('../factories/TokenFactory');
const Chance = require('chance');
const chance = Chance();
const UserFactory = require('../factories/UserFactory');

chai.use(chaiHttp);

const userDetails = {
	firstName: 'godwin',
	lastName: 'wincodes',
	gender: 'male',
	password: 'password',
	jobRole: 'employee',
	department: 'software',
	address: 'mayfair gardens'
};

describe('Test to create an employee', () => {

	// it('it should return 401 and unauthiorized for users not logged in', async () => {
	// 	const res = await chai.request(server)
	// 		.post('/api/v1/auth/create-user');

	// 	assert.equal(res.status, 401);
	// 	assert.deepInclude(res.body, {
	// 		status: 'error',
	// 		error: 'unauthenticated'
	// 	});
	// });

	// it('it should return 403 and error for employees and other users not admin', async () => {
	// 	const token = TokenFactory('employee');

	// 	const res = await chai.request(server)
	// 		.post('/api/v1/auth/create-user')
	// 		.set('Authorization', `Bearer ${token}`);
	// 	assert.equal(res.status, 403);
	// 	assert.deepInclude(res.body, {
	// 		status: 'error',
	// 		error: 'Only an Admin is Allowed'
	// 	});
	// });

	it('it should return validate input and return errors and a 400 status', async () => {
		const token = TokenFactory('admin');

		const res = await chai.request(server)
			.post('/api/v1/auth/create-user')
			.set('Authorization', `Bearer ${token}`);

		assert.equal(res.status, 400);
		assert.deepInclude(res.body, {
			status: 'error',
			error: {
				'firstName': 'Firstname is Required',
				'lastName': 'Lastname is Required',
				'email': 'Email field is required',
				'password': 'Password field is required',
				'gender': 'Gender field is required',
				'jobRole': 'JobRole field is required',
				'department': 'Department field is required',
				'address': 'Address field is required'
			}
		});
	});

	it('it should return error for email already in the database', async () => {
		const token = TokenFactory('admin');
		const email = chance.email();

		await UserFactory.createUser({ ...userDetails, email }, 'employee');

		const res = await chai.request(server)
			.post('/api/v1/auth/create-user')
			.set('Authorization', `Bearer ${token}`)
			.send({ ...userDetails, email });

		assert.equal(res.status, 400);
		assert.deepInclude(res.body, {
			status: 'error',
			error: {
				email: `User with email ${email} already exists`
			}
		});
	});

	it('it should return return success message and a token', async () => {
		const token = TokenFactory('admin');
		const email = chance.email();

		const res = await chai.request(server)
			.post('/api/v1/auth/create-user')
			.set('Authorization', `Bearer ${token}`)
			.send({ ...userDetails, email });

		assert.equal(res.status, 201);
		assert.equal(res.body.status, 'success'),
		assert.equal(res.body.data.message, 'User account successfully created');
		assert.isString(res.body.data.token);
		assert.isNumber(res.body.data.userId);
	});
});