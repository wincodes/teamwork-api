process.env.NODE_ENV = 'test';

const { describe, it, before } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');
const TokenFactory = require('../factories/TokenFactory');
const Chance = require('chance');
const chance = Chance();
const UserFactory = require('../factories/UserFactory');
const PostFactory = require('../factories/PostFactory');
const dbTransaction = require('./db-trasaction');
const CommentFactory = require('../factories/CommentFactory');


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


describe('Test to return single gif and the comments', () => {
	before(async () => {
		await dbTransaction.truncateComments();
	});

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).get('/api/v1/gifs/100');

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});
  
	it('it should return return errors and a 404 status if gif is not found', async () => {
		const res = await chai.request(server).get('/api/v1/gifs/10001')
			.set('Authorization', `Bearer ${token}`);

		assert.equal(res.status, 404);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Gif not found'
		});
	});


	it('it should return return success message when request is successful', async () => {
		const creatorToken = await UserFactory.createUser(userDetails, 'employee');
		const userGif = await PostFactory.createGif(creatorToken);
		const createdComments = await CommentFactory.createMany(creatorToken, userGif.id, 'gif', 5);

		const res = await chai.request(server).get(`/api/v1/gifs/${userGif.id}`)
			.set('Authorization', `Bearer ${token}`);
    
		const data = res.body.data;
      

		assert.equal(res.status, 200);
		assert.equal(res.body.status, 'success');
		assert.equal(userGif.id, data.id);
		assert.equal(userGif.title, data.title);
		assert.equal(userGif.url, data.url);
		assert.equal(createdComments.length, data.comments.length);
		assert.isOk(data.comments[0].commentId);
		assert.isOk(data.comments[0].authorId);
		assert.isOk(data.comments[0].comment);
	});
});
