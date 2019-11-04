const migrate = require('migrate');
process.env.NODE_ENV = 'test';

migrate.load({
	stateStore: './test/.migrate',
	migrationsDirectory: './migrations'
}, function (err, set) {
	if (err) {
		throw err;
	}
	set.down(function (err) {
		if (err) {
			throw err;
		}
		console.log('rollback migrations successfully ran');
	});
});