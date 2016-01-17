// TODO: this file should be deleted
define([], function () {

	"use strict";
	describe('Example test spec', function () {

		it('blah blah: I am here as a placeholder',  function () {
			expect(42).to.equals(42);
			expect(window.CI_TESTS_ALL_SERVICE_NAMES).to.have.length.greaterThan(100);
			expect(window.CI_TESTS_ALL_SERVICE_NAMES).to.contain("core");
			expect(window.CI_TESTS_ALL_SERVICE_NAMES).to.contain("WelcomeScreen");
		});
	});
});
