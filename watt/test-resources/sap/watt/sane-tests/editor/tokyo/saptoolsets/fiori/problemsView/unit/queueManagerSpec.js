define(["sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/queueManager",
	"sap/watt/lib/lodash/lodash"


], function (queueManager, _) {
	var _queue;
	describe("queueManagerSpec test", function () {

		beforeEach(function () {
			_queue = new queueManager();
		});

		it("test for adding apply to queue ", function () {
			var oToAdd = {'1': 1};
			_queue.addRequest(oToAdd);
			expect(_queue.getSizeOfQueue()).to.eql(1);
			expect(_queue.dequeueRequest()).to.eql(oToAdd);
		});

		it("test for adding applies to queue ", function () {
			var oToAdd1 = {'1': 1};
			var oToAdd2 = {'2': 2};
			var oToAdd3 = {'3': 3};
			expect(_queue.getSizeOfQueue()).to.eql(0);
			_queue.addRequest(oToAdd1);
			expect(_queue.getSizeOfQueue()).to.eql(1);
			_queue.addRequest(oToAdd2);
			expect(_queue.getSizeOfQueue()).to.eql(2);
			_queue.addRequest(oToAdd3);
			expect(_queue.getSizeOfQueue()).to.eql(3);
			expect(_queue.dequeueRequest()).to.eql(oToAdd1);
			expect(_queue.getSizeOfQueue()).to.eql(2);
			expect(_queue.dequeueRequest()).to.eql(oToAdd2);
			expect(_queue.getSizeOfQueue()).to.eql(1);
			expect(_queue.dequeueRequest()).to.eql(oToAdd3);
			expect(_queue.getSizeOfQueue()).to.eql(0);
		});

		it("test for remove applies withe one that not existe in queue ", function () {
			var oToAdd1 = {'1': 1};
			var oToAdd2 = {'2': 2};
			expect(_queue.getSizeOfQueue()).to.eql(0);
			_queue.addRequest(oToAdd1);
			expect(_queue.getSizeOfQueue()).to.eql(1);
			expect(_queue.dequeueRequest()).to.eql(oToAdd1);
			expect(_queue.getSizeOfQueue()).to.eql(0);
			expect(_queue.dequeueRequest()).to.eql();
		});

		it("test for adding real content apply to queue ", function () {
			var oToAdd = {
				projects: ['a', 'b'],
				workspaceConfig: {"a": 1},
				forceAnalyze: false
			};
			_queue.addRequest(_.cloneDeep(oToAdd));
			expect(_queue.getSizeOfQueue()).to.eql(1);
			expect(_queue.dequeueRequest()).to.deep.equal(oToAdd);
		});

	});
});