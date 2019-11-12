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
let creatorToken = '';
let userGif = '';


describe('Test to delete a gif', () => {

	it('it should return 401 and unauthiorized for users not logged in', async () => {
		const res = await chai.request(server).delete('/api/v1/gifs/1');

		assert.equal(res.status, 401);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'unauthenticated'
		});
	});

	it('it should return return errors and a 404 status if article is not found', async () => {
		const res = await chai.request(server).delete('/api/v1/gifs/1001')
			.set('Authorization', `Bearer ${token}`);

		assert.equal(res.status, 404);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'Gif Not found'
		});
	});

	it('it should return return errors and a 403 status if user is not same as the creator', async () => {
		creatorToken = await UserFactory.createUser(userDetails, 'employee');
		userGif = await PostFactory.createGif(creatorToken);

		const postsBeforeRequest = await PostFactory.allPosts();

		const res = await chai.request(server).delete(`/api/v1/gifs/${userGif.id}`)
			.set('Authorization', `Bearer ${token}`);

		const postsAfterRequest = await PostFactory.allPosts();

		assert.equal(res.status, 403);
		assert.deepInclude(res.body, {
			status: 'error',
			error: 'cannot delete another user\'s gif'
		});
		assert.equal(Number(postsAfterRequest), Number(postsBeforeRequest));
	});

	it('it should return return success message when post is edited successfully', async () => {
		const postsBeforeRequest = await PostFactory.allPosts();

		const res = await chai.request(server).delete(`/api/v1/gifs/${userGif.id}`)
			.set('Authorization', `Bearer ${creatorToken}`);

		const postsAfterRequest = await PostFactory.allPosts();

		assert.equal(res.status, 200);
		assert.deepInclude(res.body, {
			status: 'success',
			data: {
				message: 'Gif post successfully deleted',
			}
		});
		assert.equal(Number(postsAfterRequest), Number(postsBeforeRequest - 1));
	});
});
