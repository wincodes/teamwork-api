process.env.NODE_ENV = 'test';

const fs = require('fs');
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

const token = TokenFactory('employee');


describe('Test to create a  gif post', () => {
	/*
	 * Test employee creation
	 */
	describe('/POST /api/v1/gif', () => {

		it('it should return 401 and unauthiorized for users not logged in', async () => {
			const res = await chai.request(server).post('/api/v1/gifs');

			assert.equal(res.status, 401);
			assert.deepInclude(res.body, {
				status: 'error',
				error: 'unauthenticated'
			});
		});


		it('it should return return errors and a 400 status if title and gif is empty', async () => {
			const res = await chai.request(server).post('/api/v1/gifs')
				.set('Authorization', `Bearer ${token}`);

			assert.equal(res.status, 400);
			assert.deepInclude(res.body, {
				status: 'error',
				error: {
					'title': 'Title field is required',
					'image': 'Image field is required'
				}
			});
		});

		it('it should return error and 400 status for image not gif', async () => {
			const res = await chai
				.request(server)
				.post('/api/v1/gifs')
				.set('Authorization', `Bearer ${token}`)
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.field('title', 'hello world')
				.attach('image',
					fs.readFileSync('./images/flowers.jpeg'),
					'flowers.jpeg');

			assert.equal(res.status, 400);
			assert.deepInclude(res.body, {
				status: 'error',
				error: {
					'image': 'Only Gif image is allowed'
				}
			});
		});

		it('it should return error and 400 status for gif more than 500kb', async () => {
			const res = await chai.request(server).post('/api/v1/gifs')
				.set('Authorization', `Bearer ${token}`)
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.field('title', 'hello world')
				.attach('image',
					fs.readFileSync('./images/bday.gif'),
					'bday.gif');

			assert.equal(res.status, 400);
			assert.deepInclude(res.body, {
				status: 'error',
				error: {
					'image': 'Size of image should be not be more than 500kb'
				}
			});
		});

		it('it should return return success message when post is created', async () => {
			const email = chance.email();

			const token = await UserFactory.createUser({ ...userDetails, email }, 'employee');

			const res = await chai.request(server).post('/api/v1/gifs')
				.set('Authorization', `Bearer ${token}`)
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.field('title', 'hello world')
				.attach('image',
					fs.readFileSync('./images/color.gif'),
					'color.gif');

			assert.equal(res.status, 201);
			assert.equal(res.body.status, 'success'),
			assert.equal(res.body.data.message, 'GIF image successfully posted');
			assert.isString(res.body.data.title);
			assert.isString(res.body.data.imageUrl);
			assert.isNumber(res.body.data.gifId);
			assert.isOk(res.body.data.createdOn);
		});
	});
});
