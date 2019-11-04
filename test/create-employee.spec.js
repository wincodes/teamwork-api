process.env.NODE_ENV = 'test';

const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');
const TokenFactory = require('../factories/TokenFactory');
const Chance = require('chance');
const chance = Chance();

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
	/*
	 * Test employee creation
	 */
	describe('/POST /api/v1/auth/create-user', () => {

		it('it should return 401 and unauthiorized for users not logged in', done => {
			chai
				.request(server)
				.post('/api/v1/auth/create-user')
				.end((err, res) => {
					assert.equal(res.status, 401);
					assert.deepInclude(res.body, {
						status: 'error',
						error: 'unauthenticated'
					});
					done();
				});
		});

		it('it should return 403 and error for employees and other users not admin', done => {
			const token = TokenFactory('employee');
			chai
				.request(server)
				.post('/api/v1/auth/create-user')
				.set('Authorization', `Bearer ${token}`)
				.end((err, res) => {
					assert.equal(res.status, 403);
					assert.deepInclude(res.body, {
						status: 'error',
						error: 'Only an Admin is Allowed'
					});
					done();
				});
		});

		it('it should return validate input and return errors and a 400 status', done => {
			const token = TokenFactory('admin');
			chai
				.request(server)
				.post('/api/v1/auth/create-user')
				.set('Authorization', `Bearer ${token}`)
				.end((err, res) => {
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
					done();
				});
		});

		it('it should return error for email already in the database', done => {
			const token = TokenFactory('admin');
			const email = chance.email();
			chai
				.request(server)
				.post('/api/v1/auth/create-user')
				.set('Authorization', `Bearer ${token}`)
				.send({ ...userDetails, email })
				.end((err, res) => {
					assert.equal(res.status, 201);


					chai
						.request(server)
						.post('/api/v1/auth/create-user')
						.set('Authorization', `Bearer ${token}`)
						.send({ ...userDetails, email })
						.end((err, res) => {
							assert.equal(res.status, 400);
							assert.deepInclude(res.body, {
								status: 'error',
								error: `User with email ${email} already exists`
							});
							done();
						});
				});
		});

		it('it should return return success message and a token', done => {
			const token = TokenFactory('admin');
			const email = chance.email();
			chai
				.request(server)
				.post('/api/v1/auth/create-user')
				.set('Authorization', `Bearer ${token}`)
				.send({ ...userDetails, email })
				.end((err, res) => {
					assert.equal(res.status, 201);
					assert.equal(res.body.status, 'success'),
					assert.equal(res.body.data.message, 'User account successfully created');
					assert.isString(res.body.data.token);
					assert.isNumber(res.body.data.userId);
					done();
				});
		});
	});
});
