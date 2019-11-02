process.env.NODE_ENV = 'test';

const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

describe('Api documentation route', () => {
	/*
	 * Ensure Api documentation route works
	 */
	describe('/GET /api/v1/api-docs', () => {
		it('it should return stautus 200', done => {
			chai
				.request(server)
				.get('/api/v1/api-docs')
				.end((err, res) => {
					assert.equal(res.status, 200);
					done();
				});
		});
	});
});
