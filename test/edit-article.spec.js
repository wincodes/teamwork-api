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
const ArticleFactory = require('../factories/ArticleFActory');


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
const title = 'Just a title';
const article = 'Just an article body here';
let creatorToken = '';
let userArticle = '';


describe('Test to edit an article', () => {

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).patch('/api/v1/articles/1');

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});

	it('it should return return errors and a 400 status if title and article is empty', async () => {
		const res = await chai.request(server).patch('/api/v1/articles/1')
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

	it('it should return return errors and a 404 status if article is not found', async () => {
		const res = await chai.request(server).patch('/api/v1/articles/1001')
			.set('Authorization', `Bearer ${token}`)
			.send({ title, article });

		assert.equal(res.status, 404);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Article Not found'
		});
	});

	it('it should return return success message when post is edited successfully', async () => {

		creatorToken = await UserFactory.createUser(userDetails, 'employee');
		userArticle = await ArticleFactory.createArticle(creatorToken);

		const res = await chai.request(server).patch(`/api/v1/articles/${userArticle.id}`)
			.set('Authorization', `Bearer ${creatorToken}`)
			.send({ title, article });

		assert.equal(res.status, 200);
		assert.deepInclude(res.body, {
			status: 'success',
			data: {
				message: 'Article successfully updated',
				article,
				title
			}
		});
	});

	it('it should return return errors and a 403 status if user is not same as the creator', async () => {
		const res = await chai.request(server).patch(`/api/v1/articles/${userArticle.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send({ title, article });

		assert.equal(res.status, 403);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'cannot edit another user\'s article'
		});
	});
});
