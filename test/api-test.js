process.env.NODE_ENV = 'test';

const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);
// chai.use(assert)

describe('Test Api response', () => {
	/*
	 * A basic test to test the api default response { hello world}
	 */
	describe('/GET api/v1/', () => {
		it('it should return stautus 200 and body hello world', done => {
			chai
				.request(server)
				.get('/api/v1')
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.body, 'Hello World');
					done();
				});
		});
	});
});
