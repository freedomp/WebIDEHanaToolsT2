define([ //
         "../../../../../../../resources/sap/watt/nodejs/plugin/debug/view/NodeJsDebugAttach.controller",
         "../../../../../../../resources/sap/watt/nodejs/plugin/debug/view/NodeJsDebugAttach.view"
       ], function(NodeJsDebugAttachController, NodeJsDebugAttachView) {
	"use strict";

	// console logger
	var log = {
		errorExpected: false,
		info: function info(topic, message) {
			window.console.log("(" + topic + ") " + message);
			return Q();
		},
		error: function error(topic, message) {
			if (this.errorExpected === true) {
				//expected error
				window.console.log("(" + topic + ") " + message);
				return Q();
			}
			window.console.error("(" + topic + ") " + message);
			return Q.reject(message);
		}
	};

	var projectData = {
			"project/1": "http://user:passwd@host:8080",
			"project/2": "https://user:passwd@host:8081",
			"project/3": null
	};

	var makeProjectEntity = function(path) {
		return {
			getFullPath: function(){ return path; }
		};
	};

	var context = {
		service: {
			log: log,
			nodejsLauncher: {
				getRunnersByProject: function() {
					var fakedRunners = {}; 
					Object.keys(projectData).forEach(function(projectPath) {
						var url = projectData[projectPath];
						fakedRunners[projectPath] = [{ debugURL: url }];
					});
					return Q.resolve(fakedRunners);
				},
				getDebugUri: function(runner) {
					return Q.resolve(runner.debugURL);
				}
			}
		}
	};

	module("NodeJsDebugAttach.controller", {
		setup: function() {},
		teardown: function() {}
	});
	test("Attach data w/o project selection", window.withPromise(function(assert) {

		var controller = sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebugAttach");
		controller.getView = function() {
			return { setModel: function() {} };
		};
		controller._configure(context, null/*no project selection*/);

		return controller._withAttachData().then(function(attachData) {
			assert.ok(attachData.connection, "connection data must be returned");
			assert.equal(attachData.connection.secureConnection, false, "secureConnection must match to URL scheme");
			assert.equal(attachData.connection.debugHost, "host", "host must be set");
			assert.equal(attachData.connection.debugWebPort, 8080, "port must be set");
			assert.equal(attachData.connection.debugUser, "user", "user must be set");
			assert.equal(attachData.connection.debugPassword, "passwd", "password must be set");
		});
	}));

	test("Attach data w/ project selection", window.withPromise(function(assert) {
		var controller = sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebugAttach");
		controller.getView = function() {
			return { setModel: function() {} };
		};
		controller._configure(context, makeProjectEntity("project/2"));

		return controller._withAttachData().then(function(attachData) {
			assert.ok(attachData.connection, "connection data must be returned");
			assert.equal(attachData.connection.secureConnection, true, "secureConnection must match to URL scheme");
			assert.equal(attachData.connection.debugHost, "host", "host must be set");
			assert.equal(attachData.connection.debugWebPort, 8081, "port must be set");
			assert.equal(attachData.connection.debugUser, "user", "user must be set");
			assert.equal(attachData.connection.debugPassword, "passwd", "password must be set");
		});
	}));

	test("Attach data for project w/o debug URL", window.withPromise(function(assert) {
		var controller = sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebugAttach");
		controller.getView = function() {
			return { setModel: function() {} };
		};
		controller._configure(context, makeProjectEntity("project/3"));

		return controller._withAttachData().then(function(attachData) {
			assert.ok(attachData.connection, "connection data must be returned");
			assert.equal(attachData.connection.secureConnection, false, "secureConnection must match to URL scheme");
			assert.equal(attachData.connection.debugHost, null, "host must not be set");
			assert.equal(attachData.connection.debugWebPort, null, "port must not be set");
			assert.equal(attachData.connection.debugUser, null, "user must be not set");
			assert.equal(attachData.connection.debugPassword, null, "password must not be set");
		});
	}));

	test("Change attach data", window.withPromise(function(assert) {
		var controller = sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebugAttach");
		controller.getView = function() {
			return { setModel: function() {} };
		};
		controller._configure(context, makeProjectEntity("project/1"));

		return controller._withAttachData().then(function(attachData) {
			assert.ok(attachData.connection, "connection data must be returned");
			attachData.connection.secureConnection = !attachData.connection.secureConnection;
			attachData.connection.debugHost = "changedHost";
			attachData.connection.debugWebPort = 9090;
			attachData.connection.debugUser = "changedUser";
			attachData.connection.debugPassword = "changedPassword";
			attachData.connection.condense();
			assert.equal(attachData.connection.condense().debugURL, "https://changedUser:changedPassword@changedHost:9090", //
					"debugURL must have been changed");
		});
	}));

	test("Open dialog and OK", window.withPromise(function(assert) {
		var attachView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.JS,
			viewName: "sap.xs.nodejs.debug.view.NodeJsDebugAttach",
			viewData: {
				context: context,
				selectedProject: makeProjectEntity("project/2")
			}
		});
		var controller = attachView.getController();
		controller._afterDialogOpen = function(okHandler, cancelHandler) {
			okHandler.call(controller);
		};
		return controller.openViewInDialog().then(function(connectionData) {
			assert.ok(connectionData, "connection data must be returned");
		});
	}));
	
	test("Open dialog and Cancel", window.withPromise(function(assert) {
		var attachView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.JS,
			viewName: "sap.xs.nodejs.debug.view.NodeJsDebugAttach",
			viewData: {
				context: context,
				selectedProject: makeProjectEntity("project/1")
			}
		});
		var controller = attachView.getController();
		controller._afterDialogOpen = function(okHandler, cancelHandler) {
			cancelHandler.call(controller);
		};
		return controller.openViewInDialog().then(function(connectionData) {
			assert.equal(connectionData, null, "connection data must not be returned");
		});
	}));
	
});