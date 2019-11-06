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

const email = chance.email();

const userDetails = {
	firstName: 'godwin',
	lastName: 'wincodes',
	gender: 'male',
	password: 'password',
	email,
	jobRole: 'employee',
	department: 'software',
	address: 'mayfair gardens'
};

const token = TokenFactory('employee');
const url = '/api/v1/articles';


describe('Test to create an article', () => {

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).post(url);

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});

	it('it should return return errors and a 400 status if title and article is empty', async () => {
		const res = await chai.request(server).post(url)
			.set('Authorization', `Bearer ${token}`);

		assert.equal(res.status, 400);
		assert.deepInclude(res.body, {
			status: 'error',
			error: {
				'title': 'Title field is required',
				'article': 'Article field is required'
			}
		});
	});

	it('it should return return success message when post is created', async () => {

		const token = await UserFactory.createUser(userDetails, 'employee');

		const res = await chai.request(server).post(url)
			.set('Authorization', `Bearer ${token}`)
			.send({ title: 'Just a title', article: 'Just an article body here'});

		assert.equal(res.status, 201);
		assert.equal(res.body.status, 'success'),
		assert.equal(res.body.data.message, 'Article successfully posted');
		assert.isString(res.body.data.title);
		assert.isNumber(res.body.data.articleId);
		assert.isOk(res.body.data.createdOn);
	});
});
