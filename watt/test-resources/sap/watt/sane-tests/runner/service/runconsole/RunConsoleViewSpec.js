define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "runConsole";

	describe("Run Console", function() {
		var view;
		var controller;

		var model;
		var Q;

		function _setLogsToModel(projName, sLogs) {

			var modelData = view.getModel().getData();

			modelData[projName] = {
				sLogs: sLogs,
				eStatus: projName,
				sUrl: projName,
				sRunningProcessId: 1,
				iLineCount: 0
			};
			view.getModel().updateBindings();
		}

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/runconsole/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				view = webIdeWindowObj.sap.ui.view("RunConsole", {
					viewName: "sap.watt.ideplatform.plugin.runconsole.view.RunConsole",
					type: webIdeWindowObj.sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: {
							i18n: {
								applyTo: function() {}
							},
							service: {
								runconsole: {}
							}
						}
					}
				});
				controller = view.getController();
				model = controller.getView().getModel();
				Q = webIdeWindowObj.Q;
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
			model.setData({});
		});

		it("deleteModelEntity _ positive",
			function() {
				_setLogsToModel("projA", "log for project A");
				_setLogsToModel("projB", "log for project B");

				controller.deleteModelEntity("projA");

				var data = model.getData();

				expect(data.projA).to.equal(null);
				expect(data.projB).to.not.equal(null);
			});

		it("deleteModelEntity _ negative, delete unexisting entity from model",
			function() {
				_setLogsToModel("projA", "log for project A");
				_setLogsToModel("projB", "log for project B");

				controller.deleteModelEntity("projC");

				var data = model.getData();

				expect(data.projA).to.not.equal(null);
				expect(data.projB).to.not.equal(null);
			});

		it("deleteModelEntity _ negative, delete entity from empty model",
			function() {
				view.getModel().setData();

				controller.deleteModelEntity("projA");

				var data = model.getData();

				expect(data).to.equal(undefined);
			});

		it("contextSwitch _ positive",
			function() {
				/*			view.getModel().setData({
					context: {
						i18n: {
							applyTo: function() {}
						},
						service: {
							runconsole: {}
						}
					}
				});*/
				_setLogsToModel("projA", "log for project A");
				_setLogsToModel("projB", "log for project B");

				view.bindElement("/projA");

				return controller.contextSwitch("projB").then(function() {
					var bindedElement = view.getBindingContext();

					expect(bindedElement.getPath()).to.deep.equal("/projB");
					expect(bindedElement.getObject().sLogs).to.deep.equal("log for project B");
				});
			});

		it("contextSwitch _ switch to unexisting project in Model, no initial status", function() {

			_setLogsToModel("projA", "log for project A");
			_setLogsToModel("projB", "log for project B");

			//no initial status exist
			controller._oRunConsoleService = {};
			controller._oRunConsoleService.getInitialStatus = function() {
				return Q({});
			};

			return controller.contextSwitch("projC").then(function() {
				var bindedElement = view.getBindingContext();
				expect(bindedElement.getPath()).to.equal("/projC");
				expect(bindedElement.getObject().sLogs).to.deep.equal("");
			});
		});

		it("contextSwitch _ switch to unexisting project in Model, with initial status", function() {

			_setLogsToModel("projA", "log for project A");
			_setLogsToModel("projB", "log for project B");

			//initial status exist
			controller._oRunConsoleService.getInitialStatus = function() {
				return Q({
					status: "RUNNING",
					sProcessId: "55"
				});
			};
			return controller.contextSwitch("projD").then(function() {
				var bindedElement = view.getBindingContext();
				expect(bindedElement.getPath()).to.deep.equal("/projD");
				expect(bindedElement.getObject().eStatus).to.deep.equal("Running");
				expect(bindedElement.getObject().sUrl).to.deep.equal("");
				expect(bindedElement.getObject().sRunningProcessId).to.deep.equal("55");
			});
		});

		it("addMessage _ positive , test addMessage(oMessage) ", function() {
			/*			view.getModel().setData({
				context: {
					i18n: {
						applyTo: function() {}
					},
					service: {
						runconsole: {}
					}
				}
			});*/
			// projA is selected
			view.bindElement("/projA");
			controller._sFormat = "$TIME ($TAG) $MESSAGE";
			controller._iMaxLineCount = 10;

			// project A gets new log
			var oMessage = {
				tag: "projA",
				message: "log1 for project A",
				timestamp: {
					toLocaleTimeString: function() {
						return "";
					}
				},
				level: "info"
			};

			controller.addMessage(oMessage);
			var bindedElement = view.getBindingContext();
			expect(bindedElement.getObject().sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log1&#x20;for&#x20;project&#x20;A</div>");
			expect(bindedElement.getObject().iLineCount).to.deep.equal(1);

			//add another log message for project A
			oMessage.message = "log2 for project A";
			controller.addMessage(oMessage);
			expect(bindedElement.getObject().sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log1&#x20;for&#x20;project&#x20;A</div><div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log2&#x20;for&#x20;project&#x20;A</div>"
			);
			expect(bindedElement.getObject().iLineCount).to.deep.equal(2);

			// add log for project B, when A is selected
			oMessage.tag = "projB";
			oMessage.message = "log1 for project B";
			controller.addMessage(oMessage);
			var projB = model.getProperty("/projB");
			expect(projB.sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projB&#x29;&#x20;log1&#x20;for&#x20;project&#x20;B</div>");
			expect(projB.iLineCount).to.deep.equal(1);

			// add log for project B, when B is selected
			view.bindElement("/projB");
			oMessage.message = "log2 for project B";
			controller.addMessage(oMessage);
			bindedElement = view.getBindingContext();
			expect(bindedElement.getObject().sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projB&#x29;&#x20;log1&#x20;for&#x20;project&#x20;B</div><div class=\"info selectable\">&#x20;&#x28;projB&#x29;&#x20;log2&#x20;for&#x20;project&#x20;B</div>"
			);
			expect(bindedElement.getObject().iLineCount).to.deep.equal(2);

			// add log for project A, when B is selected
			oMessage.tag = "projA";
			oMessage.message = "log3 for project A";
			controller.addMessage(oMessage);
			var projA = model.getProperty("/projA");

			//check B project is still binded to model, and its log hasnt changed
			expect(bindedElement.getPath()).to.deep.equal("/projB");
			expect(bindedElement.getObject().sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projB&#x29;&#x20;log1&#x20;for&#x20;project&#x20;B</div><div class=\"info selectable\">&#x20;&#x28;projB&#x29;&#x20;log2&#x20;for&#x20;project&#x20;B</div>"
			);
			expect(bindedElement.getObject().iLineCount).to.deep.equal(2);

			// check that log of project A has been updated
			expect(projA.sLogs).to.deep.equal(
				"<div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log1&#x20;for&#x20;project&#x20;A</div><div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log2&#x20;for&#x20;project&#x20;A</div><div class=\"info selectable\">&#x20;&#x28;projA&#x29;&#x20;log3&#x20;for&#x20;project&#x20;A</div>"
			);
			expect(projA.iLineCount).to.deep.equal(3);
		});

		it("updateApplicationMode _ positive and negative flow", function() {
			/*			view.getModel().setData({
				context: {
					i18n: {
						applyTo: function() {}
					},
					service: {
						runconsole: {}
					}
				}
			});*/
			_setLogsToModel("projA", "log for project A");
			_setLogsToModel("projB", "log for project B");

			controller.contextSwitch("projA");

			// update projA data in Model, when projA is selected
			controller.updateApplicationMode("/projA", "newUrl", "url");
			controller.updateApplicationMode("/projA", "NEW", "status");
			controller.updateApplicationMode("/projA", "10", "processId");

			var bindedElement = view.getBindingContext();
			expect(bindedElement.getPath()).to.deep.equal("/projA");

			expect(bindedElement.getObject().sUrl).to.deep.equal("newUrl");
			expect(bindedElement.getObject().sRunningProcessId).to.deep.equal("10");
			expect(bindedElement.getObject().eStatus).to.deep.equal("New");

			//update projB data in Model, when projA is selected
			controller.updateApplicationMode("/projB", "newUrlB", "url");
			controller.updateApplicationMode("/projB", "RUNNING", "status");
			controller.updateApplicationMode("/projB", "10B", "processId");
			//check that projA is still binded and its data hasnt changed
			expect(bindedElement.getPath()).to.deep.equal("/projA");
			expect(bindedElement.getObject().sUrl).to.deep.equal("newUrl");
			//check that projB data has changed
			var projB = model.getProperty("/projB");
			expect(projB.sUrl).to.deep.equal("newUrlB");
			expect(projB.sRunningProcessId).to.deep.equal("10B");
			expect(projB.eStatus).to.deep.equal("Running");

			//update unexisting project
			controller.updateApplicationMode("/projC", "newUrlC", "url");
			expect(bindedElement.getPath()).to.deep.equal("/projA");
			expect(model.getProperty("/projC")).to.deep.equal(undefined);

			//update unexisting property
			controller.updateApplicationMode("/projA", "newUrlA", "urlA");
			expect(model.getProperty("/projA").sUrl).to.deep.equal("newUrl");
		});
	});
});