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
const url = '/api/v1/feed';


describe('Test to return all feeds', () => {
	before(async () => {
		await dbTransaction.truncatePosts();
	});

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).get(url);

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});


	it('it should return return success message when request is successful', async () => {
		const creatorToken = await UserFactory.createUser(userDetails, 'employee');
		const manyPosts = await PostFactory.createMany(creatorToken, 5);
		const lastCreatedPost = manyPosts[manyPosts.length - 1];

		const res = await chai.request(server).get(url)
			.set('Authorization', `Bearer ${token}`);
    
		const firstReturnedPost = res.body.data[0];
		const secondReturnedPost = res.body.data[1];


		assert.equal(res.status, 200);
		assert.equal(res.body.status, 'success');
		assert.equal(res.body.data.length, manyPosts.length);
		assert.equal(firstReturnedPost.id, lastCreatedPost.id);
		assert.isAbove(firstReturnedPost.id, secondReturnedPost.id);
		assert.equal(userDetails.firstName, firstReturnedPost.firstname);
		assert.equal(userDetails.lastName, firstReturnedPost.lastname);
	});
});
