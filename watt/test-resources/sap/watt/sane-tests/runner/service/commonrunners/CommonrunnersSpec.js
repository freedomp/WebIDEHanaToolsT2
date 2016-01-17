define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "commonrunners";

	describe("Common Runners", function() {
		var oCommonRunner;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/commonrunners/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oCommonRunner = STF.getService(suiteName, "runnerrunutil");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test common runner Read Configuration File method, use case: with mock, with preview, with workspace, with ui5 version",
			function() {
				var oUrlParameters = [{
					paramName: "key1",
					paramValue: "val1",
					paramActive: true
				}, {
					paramName: "key2",
					paramValue: "val2",
					paramActive: true
				}];

				var oHashParameter;

				var oConfiguration = {
					dataMode: 0,
					previewMode: 0,
					workspace: "withWorkspace",
					filePath: "/ProjectNmae/Component.js",
					ui5ActiveVersion: "1.26.11",
					ui5VerSource: "external",
					urlParameters: oUrlParameters,
					hashParameter: oHashParameter
				};

				var oAppForwarding = {
					bPreferWorkspace: true
				};

				var oExcpectedRunConfiguration = {
					oUrlParameters: oUrlParameters,
					oAppForwarding: oAppForwarding,
					bIsMock: true,
					sUi5Version: "1.26.11",
					sUi5VerSource: "external",
					oAppsVersion: undefined,
					oHashParameter: undefined,
					oSwitchBackendParameter: undefined
				};

				var oExcpectedRunParameters = {
					bNoFrame: false,
					sFilePath: "/ProjectNmae/Component.js",
					oRunConfiguration: oExcpectedRunConfiguration
				};

				return oCommonRunner.readConfigurationFile(oConfiguration).then(function(oRunParameters) {
					expect(oRunParameters).to.deep.equal(oExcpectedRunParameters);
				});
			});

		it("Test common runner Read Configuration File method, use case: without mock, without preview, without workspace",
			function() {
				var oUrlParameters = [{
					paramName: "key1",
					paramValue: "val1",
					paramActive: true
				}, {
					paramName: "key2",
					paramValue: "val2",
					paramActive: true
				}];

				var oHashParameter;

				var oConfiguration = {
					dataMode: 1,
					previewMode: 1,
					workspace: "withoutWorkspace",
					filePath: "/ProjectNmae/Component.js",
					ui5ActiveVersion: "",
					ui5VerSource: "",
					urlParameters: oUrlParameters,
					hashParameter: oHashParameter
				};

				var oAppForwarding = {
					bPreferWorkspace: false
				};

				var oExcpectedRunConfiguration = {
					oUrlParameters: oUrlParameters,
					oAppForwarding: oAppForwarding,
					bIsMock: false,
					sUi5Version: "",
					sUi5VerSource: "",
					oAppsVersion: undefined,
					oHashParameter: undefined,
					oSwitchBackendParameter: undefined
				};

				var oExcpectedRunParameters = {
					bNoFrame: true,
					sFilePath: "/ProjectNmae/Component.js",
					oRunConfiguration: oExcpectedRunConfiguration
				};

				return oCommonRunner.readConfigurationFile(oConfiguration).then(function(oRunParameters) {
					expect(oRunParameters).to.deep.equal(oExcpectedRunParameters);
				});
			});
	});
});