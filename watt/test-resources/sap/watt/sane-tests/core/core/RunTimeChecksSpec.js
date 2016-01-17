define(["sap/watt/core/RunTimeChecks", "STF", "sap/watt/core/Constants"], function (RunTimeChecks, STF, Constants) {
	"use strict";

	var WATT_PREFIXED_ARGS_NUM = Constants.WATT_PREFIXED_ARGS_NUM();

	describe("The Runtime Checks", function () {

		describe("Argument Type Checking capabilities (Unit tests)", function () {


			it('can check if an argument is of a >string< type', function () {
				var allesGut = RunTimeChecks._isStringType("I Am A String!");
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >string< type negative', function () {
				var allesGut = RunTimeChecks._isStringType(666);
				expect(allesGut).to.be.false;
			});


			it('can check if an argument is of a >number< type', function () {
				var allesGut = RunTimeChecks._isNumberType(123456);
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >number< type negative', function () {
				var allesGut = RunTimeChecks._isNumberType(true);
				expect(allesGut).to.be.false;
			});


			it('can check if an argument is of a >boolean< type', function () {
				var allesGut = RunTimeChecks._isBooleanType(false);
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >boolean< type negative', function () {
				var allesGut = RunTimeChecks._isBooleanType([1, 2, 3]);
				expect(allesGut).to.be.false;
			});


			it('can check if an argument is of a >[string]< type ', function () {
				var allesGut = RunTimeChecks._isStringArrayType(["i", "am", "a", "string", "array"]);
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >[string]< type negative', function () {
				var allesGut = RunTimeChecks._isStringArrayType(888);
				expect(allesGut).to.be.false;

				var allesGut2 = RunTimeChecks._isStringArrayType([1, 2, 3]);
				expect(allesGut2).to.be.false;

				var allesGut3 = RunTimeChecks._isStringArrayType({});
				expect(allesGut3).to.be.false;
			});


			it('can check if an argument is of a >[number]< type ', function () {
				var allesGut = RunTimeChecks._isNumberArrayType([1, 2, 3, 4, 5, 6]);
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >[number]< type negative', function () {
				var allesGut = RunTimeChecks._isNumberArrayType(888);
				expect(allesGut).to.be.false;

				var allesGut2 = RunTimeChecks._isNumberArrayType([3, false, true]);
				expect(allesGut2).to.be.false;


				var allesGut3 = RunTimeChecks._isNumberArrayType({});
				expect(allesGut3).to.be.false;
			});


			it('can check if an argument is of a >[boolean]< type ', function () {
				var allesGut = RunTimeChecks._isBooleanArrayType([true, true, true]);
				expect(allesGut).to.be.true;
			});


			it('can check if an argument is of a >[boolean]< type negative', function () {
				var allesGut = RunTimeChecks._isBooleanArrayType(888);
				expect(allesGut).to.be.false;

				var allesGut2 = RunTimeChecks._isBooleanArrayType([true, false, 1]);
				expect(allesGut2).to.be.false;


				var allesGut3 = RunTimeChecks._isBooleanArrayType({});
				expect(allesGut3).to.be.false;
			});


			it('can check if an argument is of a >[object]< type', function () {
				expect(RunTimeChecks._isObjectArrayType([666])).to.be.true;
				expect(RunTimeChecks._isObjectArrayType([true, false])).to.be.true;
				expect(RunTimeChecks._isObjectArrayType(["bamba", 1, 2])).to.be.true;
				expect(RunTimeChecks._isObjectArrayType([{name: "bamba", age: "1"}, {}, 666])).to.be.true;
				expect(RunTimeChecks._isObjectArrayType(["1", 2, true])).to.be.true;
				expect(RunTimeChecks._isObjectArrayType(undefined)).to.be.true;
				expect(RunTimeChecks._isObjectArrayType(null)).to.be.true;
			});


			it('can check if an argument is of a >[object]< type negative', function () {
				var allesGut = RunTimeChecks._isObjectArrayType(888);
				expect(allesGut).to.be.false;

				var allesGut2 = RunTimeChecks._isObjectArrayType({});
				expect(allesGut2).to.be.false;
			});
		});


		describe("runtime check function wrapping capabilities (unit tests)", function () {

			var dummyPrefixArgs = _.range(WATT_PREFIXED_ARGS_NUM);


			it("can wrap a function with type checking logic", function () {
				var hasFooBeenCalled = false;

				function foo() {
					hasFooBeenCalled = true;
					var aActualArgs = Array.prototype.slice.call(arguments, WATT_PREFIXED_ARGS_NUM);
					expect(aActualArgs[0]).to.equal("bamba");
					expect(aActualArgs[1]).to.equal(false);
					expect(aActualArgs[2]).to.equal(666);
					expect(aActualArgs[3]).to.deep.equal({hello: "world"});
					expect(aActualArgs[4]).to.deep.equal(["a", "b", "c"]);
					expect(aActualArgs[5]).to.deep.equal([true, false, false]);
					expect(aActualArgs[6]).to.deep.equal([1, 2, 3]);
					expect(aActualArgs[7]).to.deep.equal([{age: "77"}, "someStr", false]);
					return 'yey!';
				}

				var fooParams = [
					{type: "string"},
					{type: "boolean"},
					{type: "number"},
					{type: "object"},
					{type: "[string]"},
					{type: "[boolean]"},
					{type: "[number]"},
					{type: "[object]"}
				];
				var wrappedFoo = RunTimeChecks.decorateFnWithTypeChecking(foo, "foo", "someService", fooParams, 'string');

				var retValue = wrappedFoo.apply(null, dummyPrefixArgs.concat([
					"bamba",
					false,
					666,
					{hello: "world"},
					["a", "b", "c"],
					[true, false, false],
					[1, 2, 3],
					[{age: "77"}, "someStr", false]]));

				expect(retValue).to.equal('yey!');
				expect(hasFooBeenCalled).to.be.true;
				expect(RunTimeChecks.getCallerIssues()).to.be.empty;
			});


			it("can wrap a function with type checking logic - negative", function () {
				var hasBarBeenCalled = false;

				var wrappedBar = RunTimeChecks.decorateFnWithTypeChecking(function bar() {
					hasBarBeenCalled = true;
				}, "bar", "someOtherService", [{type: "boolean"}]);


				wrappedBar.apply(null, dummyPrefixArgs.concat([
					"666", // first should be a string not a number
					9999 // too many arguments
				]));

				expect(hasBarBeenCalled).to.be.true;
				// each item in this global Array represents set of errors in a unique location.
				expect(RunTimeChecks.getCallerIssues()).to.have.length(1);
				// one types mismatch issue and one wrong number of args issue.
				expect(RunTimeChecks.getCallerIssues()[0].issues).to.have.length(2);
			});


			it("can wrap a function with type checking logic for return type - negative", function () {
				var hasBazBeenCalled = false;
				var wrappedBaz = RunTimeChecks.decorateFnWithTypeChecking(function baz() {
					hasBazBeenCalled = true;
					return [1, 2, 3];
				}, "baz", "someOtherService", [], "boolean");

				wrappedBaz.apply(null, dummyPrefixArgs);
				expect(hasBazBeenCalled).to.be.true;
				// each item in this global Array represents set of errors in a unique location.
				expect(RunTimeChecks.getReturnTypeIssues()).to.have.length(1);
				// one return types mismatch
				expect(RunTimeChecks.getReturnTypeIssues()[0].issues).to.have.length(1);
				expect(RunTimeChecks.getReturnTypeIssues()[0].issues[0]).to.include('boolean').and.to.include('unexpected return type');
			});


			it("can wrap a function with type checking logic for return type + promise", function () {
				var hasQuxBeenCalled = false;
				var wrappedQux = RunTimeChecks.decorateFnWithTypeChecking(function qux() {
					hasQuxBeenCalled = true;
					return Q(666);
				}, "quz", "someOtherService", [], "number");

				return wrappedQux.apply(null, dummyPrefixArgs).then(function (retVal) {
					expect(retVal).to.equal(666);
					expect(hasQuxBeenCalled).to.be.true;
					expect(RunTimeChecks.getReturnTypeIssues()).to.be.empty;
				});
			});


			it("can wrap a function with type checking logic for return type + promise - negative", function () {
				var hasNorfBeenCalled = false;
				var wrappedNorf = RunTimeChecks.decorateFnWithTypeChecking(function norf() {
					hasNorfBeenCalled = true;
					return Q(true);
				}, "norf", "someOtherService", [], "number");

				return wrappedNorf.apply(null, dummyPrefixArgs).then(function (retVal) {
					expect(retVal).to.equal(true);
					expect(hasNorfBeenCalled).to.be.true;
					expect(RunTimeChecks.getReturnTypeIssues()).to.have.length(1);
					expect(RunTimeChecks.getReturnTypeIssues()[0].issues[0]).to.include('number').and.to.include('unexpected return type');
				});
			});


			afterEach(function () {
				RunTimeChecks.clearIssues();
			});
		});


		describe("the full flow (Service test)", function () {

			var suiteName = "runtimeChecks";
			var getService = STF.getServicePartial(suiteName);
			var runtimeChecks;


			before(function () {
				return STF.startWebIde(suiteName, {
					runtime_checks: true,
					runtime_checks_filter: /RunTimeChecksSpec/ // only get runtime errors originating from this file
				}).then(function () {
					return STF.require(suiteName, ["sap/watt/core/RunTimeChecks"]).spread(function (rtc) {
						runtimeChecks = rtc;
					});
				});
			});


			it('can check if an argument is of a >[object]< type negative', function () {
				var logService = getService("log");
				logService.warn("too", "many", [], "params", "oops");
				// wrong param type
				logService.error(1, true, []);
			});


			after(function () {
				var issues = runtimeChecks.getCallerIssues();
				var issuesFromThisFile = _.filter(issues, function (currIssue) {
					var firstStackPos = _.first(currIssue.stack);
					return _.contains(firstStackPos, "RunTimeChecksSpec");
				});

				expect(issuesFromThisFile).to.have.length(2);
				expect(issuesFromThisFile[0].service).to.equal("log");
				expect(issuesFromThisFile[0].method).to.equal("warn");
				expect(issuesFromThisFile[0].issues).to.have.length(1);
				expect(issuesFromThisFile[0].issues[0]).to.contain("invalid number of arguments");
				expect(issuesFromThisFile[1].service).to.equal("log");
				expect(issuesFromThisFile[1].method).to.equal("error");
				expect(issuesFromThisFile[1].issues).to.have.length(2);
				expect(issuesFromThisFile[1].issues[0]).to.contain("but actual: number");
				expect(issuesFromThisFile[1].issues[1]).to.contain("but actual: boolean");

				// clears to avoid errors when shutting down the webIde as we want to make assertions on the errors
				// and then pass the test
				runtimeChecks.clearIssues();
				STF.shutdownWebIde(suiteName);
			});
		});
	});
});
