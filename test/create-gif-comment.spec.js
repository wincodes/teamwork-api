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
const PostFactory = require('../factories/PostFactory');


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
const comment = chance.paragraph({ sentences: 3 });


describe('Test to create a gif comment', () => {

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).post('/api/v1/gifs/1/comment');

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});

	it('it should return return errors and a 400 status if comment is not sent', async () => {
		const res = await chai.request(server).post('/api/v1/gifs/1001/comment')
			.set('Authorization', `Bearer ${token}`);

		assert.equal(res.status, 400);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Comment is required'
		});
	});

	it('it should return return errors and a 404 status if gif post is not found', async () => {
		const res = await chai.request(server).post('/api/v1/gifs/1001/comment')
			.set('Authorization', `Bearer ${token}`)
			.send({ comment });

		assert.equal(res.status, 404);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Gif not found'
		});
	});

	it('it should return return success message when comment is added successfully', async () => {
		const creatorToken = await UserFactory.createUser(userDetails, 'employee');
		const userGif = await PostFactory.createGif(creatorToken);

		const res = await chai.request(server).post(`/api/v1/gifs/${userGif.id}/comment`)
			.set('Authorization', `Bearer ${creatorToken}`)
			.send({ comment });


		assert.equal(res.status, 201);
		assert.equal(res.body.status, 'success');
		assert.equal(res.body.data.message, 'Comment successfully created');
		assert.equal(res.body.data.gifTitle, userGif.title);
		assert.equal(res.body.data.comment, comment);
		assert.isOk(res.body.data.createdOn);
	});
});
