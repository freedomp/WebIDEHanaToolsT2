define(["editor/tokyo/saptoolsets/fiori/problemsView/utils/issuesTestData", 'STF', "sinon"], function (TestData, STF, sinon) {

		var suiteName = "problems_view_controller_test";
		var sandbox;
		var oProblemsViewService;
		var _oImpl;
		var sap;
		var view;
		var controller;
		var model;

		function _setProblemsToModel(domain, problems) {
			var modelData = controller._problemsModel.getData();
			var _keys = [], _aIDs = [];
			_.forEach(problems, function (problem) {
				_keys.push(domain + problem.id);
				_aIDs.push(problem.id);
			});
			_clearProblemsByDomain(domain, modelData);

			var newProblems = {
				keys: _keys,
				problems: problems
			};
			for (prop in modelData) {
				modelData[prop] = modelData[prop].concat(newProblems[prop]);
			}
			controller._problemsModel.updateBindings();
		}

		function _clearProblemsByDomain(domain, model) {
			var aKeys = model['keys'];
			var aProblems = model['problems'];
			var indexesToRemove = [];
			for (var i = 0; i < aKeys.length; i++) {
				if (_.startsWith(aKeys[i], domain)) {
					indexesToRemove.push(i);
				}
			}
			if (indexesToRemove.length > 0) {
				_.pullAt(aKeys, indexesToRemove);
				_.pullAt(aProblems, indexesToRemove);
			}
		}

		describe("Problems display of validation test", function () {
			before(function () {
				return STF.startWebIde(suiteName)
					.then(function (webIdeWindowObj) {
						var serviceGetter = STF.getServicePartial(suiteName);
						sap = webIdeWindowObj.sap;
						view = sap.ui.view("myView", "sap.watt.saptoolsets.fiori.problemsView.view.ProblemsView", "XML");
						controller = view.getController();
						model = controller._problemsModel;
						oProblemsViewService = serviceGetter("problemsView");
						return STF.getServicePrivateImpl(oProblemsViewService).then(function (oImpl) {
							_oImpl = oImpl;
							return STF.require(suiteName, []);
						});
					});
			});

			beforeEach(function () {
				sandbox = sinon.sandbox.create();
			});

			afterEach(function () {
				sandbox.restore();
				model.setData({title: "", keys: [], problems: []});
			});

			after(function () {
				STF.shutdownWebIde(suiteName);
			});

			it("test setProblems - without model or problems and wrong types", function () {
				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";

				controller.setProblems(null, aProblems);
				var data = model.getData();
				assert.ok(data.title === "" && data.keys.length === 0 && data.problems.length === 0, "no data should be set because of missing domain");

				controller.setProblems(domain);
				data = model.getData();
				assert.ok(data.title === "" && data.keys.length === 0 && data.problems.length === 0, "no data should be set because of missing domain");

				controller.setProblems(domain, aProblems[0]);
				data = model.getData();
				assert.ok(data.title === "" && data.keys.length === 0 && data.problems.length === 0, "no data should be set because of missing domain");
			});

			it("test setProblems - on empty model", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";
				controller.setProblems(domain, aProblems);
				controller.setTitle(sTitle);

				var data = model.getData();
				var aExpectedKeys = [];
				_.forEach(aProblems, function (problem) {
					aExpectedKeys.push(domain + problem.id);
				});
				var expectedData = {
					title: sTitle,
					keys: aExpectedKeys,
					problems: aProblems
				};

				assert.deepEqual(data, expectedData, "problemsView model should all problems");
			});

			it("test setProblems - adding problem similar to one already in the model", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";

				controller.setProblems(domain, aProblems);
				controller.setProblems(domain, [aProblems[0]]);
				controller.setTitle(sTitle);

				var data = model.getData();

				var aExpectedKeys = [domain + aProblems[0].id];
				var aExpectedProblems = [aProblems[0]];

				var expectedData = {
					title: sTitle,
					keys: aExpectedKeys,
					problems: aExpectedProblems
				};

				assert.deepEqual(data, expectedData, "problemsView model include should all problems");
				assert.ok(data.keys.length === 1);
			});


			it("test setProblems - adding problem which is different then existing problem in the model", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var problemExisting = {
					id: "id3",
					severity: "error",
					location: "/prod/dev",
					file: "fileBB.js(6,4)"
				};
				var domain = "validationDomain";
				var domain1 = "deployDomain";
				var sTitle = "test";

				controller.setProblems(domain, [problemExisting]);
				controller.setProblems(domain1, [problemExisting]);
				controller.setTitle(sTitle);

				var expectedData = {
					title: sTitle,
					keys: [domain + problemExisting.id, domain1 + problemExisting.id],
					problems: [problemExisting, problemExisting]
				};
				var data = model.getData();

				assert.deepEqual(data, expectedData, "problemsView model include should all problems");
			});


			it("test clearProblems - remove problems already existing in the dataModel using different domains", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";

				_setProblemsToModel(domain, [aProblems[0]]);
				_setProblemsToModel("deployDomain", [aProblems[1]]);
				_setProblemsToModel("testDomain", [aProblems[2]]);

				controller.setTitle(sTitle);
				controller.clearProblems("deployDomain", [aProblems[1].id]);
				controller.clearProblems("testDomain", [aProblems[2].id]);

				var data = model.getData();
				var expectedData = {
					title: sTitle,
					keys: [domain + aProblems[0].id],
					problems: [aProblems[0]]
				};

				assert.deepEqual(data, expectedData, "problemsView model should contain only 1 problem");
			});

			it("test clearProblems - remove problems already existing in the dataModel same domain", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";

				_setProblemsToModel(domain, aProblems);
				controller.clearProblems(domain, [[aProblems[1].id], [aProblems[2].id]]);
				controller.setTitle(sTitle);

				var data = model.getData();
				var expectedData = {
					title: sTitle,
					keys: [domain + aProblems[0].id],
					problems: [aProblems[0]]
				};

				assert.deepEqual(data, expectedData, "problemsView model should contain only 1 problem");
			});

			it("test clearProblems - try to remove a problem using a domain other then the one used to set the problem", function () {
				controller.setWebIdeContext(oProblemsViewService.context);
				var problemToRemove = {
					id: "id3",
					severity: "error",
					location: "/prod/dev",
					file: "fileBB.js(6,4)"
				};
				var domain = "validationDomain";
				var sTitle = "test";

				_setProblemsToModel(domain, [problemToRemove]);
				var data = model.getData();

				assert.ok(model.getData().keys.length === 1 && model.getData().problems.length === 1, "only one problem should be in model");

				controller.clearProblems("wrongModel", [problemToRemove]);
				controller.setTitle(sTitle);

				var expectedData = {
					title: sTitle,
					keys: [domain + problemToRemove.id],
					problems: [problemToRemove]
				};

				assert.deepEqual(data, expectedData, "problemsView model should not be effected by the deleteion");
			});

			it("test clearProblems - remove problem which doesn't exist in populated dataModel", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";

				_setProblemsToModel(domain, aProblems);

				var problemToRemove = {
					id: "id3",
					severity: "error",
					location: "/prod/dev",
					file: "fileBB.js(6,4)"
				};

				controller.clearProblems("domainNotInModel", [problemToRemove]);
				controller.setTitle(sTitle);

				var data = model.getData();
				var aExpectedKeys = [domain + aProblems[0].id, domain + aProblems[1].id, domain + aProblems[2].id];
				var expectedData = {
					title: sTitle,
					keys: aExpectedKeys,
					problems: aProblems
				};

				assert.deepEqual(data, expectedData, "problemsView model should not be effected by the deleteion");
			});

			it("test clearProblems - remove problem from un-populated dataModel", function () {
				controller.setWebIdeContext(oProblemsViewService.context);

				var sTitle = "test";
				var problemToRemove = {
					id: "id3",
					severity: "error",
					location: "/prod/dev",
					file: "fileBB.js(6,4)"
				};

				controller.clearProblems("domainNotInModel", [problemToRemove]);
				controller.setTitle(sTitle);

				var data = model.getData();
				var expectedData = {
					title: sTitle,
					keys: [],
					problems: []
				};

				assert.deepEqual(data, expectedData, "problemsView model should not be effected by the deleteion");
			});

			it("test clearProblems - call method without domain or problems", function() {
				controller.setWebIdeContext(oProblemsViewService.context);

				var aProblems = TestData.getProblemsArray1(); // the array should contain 2 problems
				var domain = "validationDomain";
				var sTitle = "test";

				_setProblemsToModel(domain,aProblems);

				var problemToRemove = {
					id : "id3",
					severity: "error",
					location: "/prod/dev",
					file: "fileBB.js(6,4)"
				};

				controller.clearProblems("", [problemToRemove]);
				controller.setTitle(sTitle);

				var data = model.getData();
				var aExpectedKeys = [domain + aProblems[0].id, domain + aProblems[1].id, domain + aProblems[2].id];
				var expectedData = {
					title: sTitle,
					keys: aExpectedKeys,
					problems: aProblems
				};
				assert.deepEqual(data,expectedData, "no deletion from dataModel should take place-no domain provided");

				controller.clearProblems("validationDomain", []);
				assert.deepEqual(data,expectedData, "no deletion from dataModel should take place-empty problems array provided");

				controller.clearProblems("validationDomain", problemToRemove);
				assert.deepEqual(data,expectedData, "no deletion from dataModel should take place- problems object provided");
			});
		});
	});