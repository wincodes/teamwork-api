process.env.NODE_ENV = 'test';

const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');
const UserFactory = require('../factories/UserFactory');
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

describe('Test to sign in', () => {

	it('it should return validate input and return errors and a 400 status', done => {
		chai
			.request(server)
			.post('/api/v1/auth/signin')
			.end((err, res) => {
				assert.equal(res.status, 400);
				assert.deepInclude(res.body, {
					status: 'error',
					error: {
						'email': 'Email or Username field is required',
						'password': 'Password field is required',
					}
				});
				done();
			});
	});

	it('it should return error for email not in in the database', done => {
		const email = chance.email();
		chai
			.request(server)
			.post('/api/v1/auth/signin')
			.send({ password: userDetails.password, email })
			.end((err, res) => {
				assert.equal(res.status, 404);
				assert.deepInclude(res.body, {
					status: 'error',
					error: `User with email ${email} not found`
				});
				done();
			});
	});

	it('it should return error for password that does not match', async () => {
		const email = chance.email();
		await UserFactory.createUser({ ...userDetails, email }, 'employee');

		const res = await chai.request(server)
			.post('/api/v1/auth/signin')
			.send({ password: '12334', email });

		assert.equal(res.status, 400);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Password does not match'
		});
	});

	it('it should return return success message and a token', async () => {
		const email = chance.email();
		await UserFactory.createUser({ ...userDetails, email }, 'employee');


		const res = await chai.request(server)
			.post('/api/v1/auth/signin')
			.send({ password: userDetails.password, email });

		assert.equal(res.status, 200);
		assert.equal(res.body.status, 'success'),
		assert.isString(res.body.data.token);
		assert.isNumber(res.body.data.userId);
	});

	it('it should return return success message and a token for username signin', async () => {
		const email = chance.email();
		await UserFactory.createUser({ ...userDetails, email }, 'employee');


		const res = await chai.request(server)
			.post('/api/v1/auth/signin')
			.send({ password: userDetails.password, username: email });

		assert.equal(res.status, 200);
		assert.equal(res.body.status, 'success'),
		assert.isString(res.body.data.token);
		assert.isNumber(res.body.data.userId);
	});
});
