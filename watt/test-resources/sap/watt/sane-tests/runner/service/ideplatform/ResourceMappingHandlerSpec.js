define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "Resource Mapping Handler";

	describe("Resource Mapping Handler methods", function() {

		var _oImpl;
		var oResourceMappingHandler;
		var mockCheckBox;
		var mockDropBox;
		var mockButton;
		var myModel;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oResourceMappingHandler = STF.getService(suiteName, "resourcemappinghandler");
				return STF.getServicePrivateImpl(oResourceMappingHandler).then(function(oImpl) {
					_oImpl = oImpl;
					mockCheckBox = webIdeWindowObj.sap.ui.commons.CheckBox({
						checked: {
							path: "/workspace",
							formatter: function(workspace) {
								return workspace === "withoutWorkspace" ? false : true;
							}
						}
					});

					mockDropBox = webIdeWindowObj.sap.ui.commons.DropdownBox();

					mockButton = webIdeWindowObj.sap.ui.commons.Button();

					myModel = webIdeWindowObj.sap.ui.model.json.JSONModel({
						workspace: "withoutWorkspace",
						appsVersion: [{
							"libraryName": "a01lib",
							"versions": [{
								"version": "Active",
								"details": "Active"
							}, {
								"version": "1.0.0",
								"details": "1.0.0"
							}],
							"activeVersion": "1.0.0",
							"libraryVersion": "1.0.0",
							"detailVersion": "1.0.0"
						}]
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test onResourceMappingChange method",
			function() {
				mockCheckBox.setModel(myModel);
				mockCheckBox.setChecked(false);
				var oEventData = {
					getSource: function() {
						return mockCheckBox;
					}
				};
				return oResourceMappingHandler.onResourceMappingChange(oEventData).then(function() {
					var test = mockCheckBox.getModel().getProperty("/workspace");
					expect(test).to.deep.equal("withoutWorkspace");
				});
			});

		it("Test onLibVersionChange method",
			function() {
				mockDropBox.setModel(myModel);
				mockDropBox.bindElement("/appsVersion/0");
				var oEventData = {
					getSource: function() {
						return mockDropBox;
					}
				};

				mockDropBox.getSelectedKey = function() {
					return "2.0.0";
				};
				return oResourceMappingHandler.onLibVersionChange(oEventData).then(function() {
					var test = mockDropBox.getModel().getProperty("/appsVersion/0/libraryVersion");
					expect(test).to.deep.equal("2.0.0");
				});
			});

		it("Test onGetLibsVersionsClick method",
			function() {
				mockButton.setModel(myModel);
				//check model before changing appsVersion data
				var libName = mockButton.getModel().getProperty("/appsVersion/0/libraryName");
				expect(libName).to.deep.equal("a01lib");

				//create new data to set after button press 
				var mockResult = [{
					activeVersion: "1.6.0-snapshot-20150128",
					detailVersion: "Active",
					libraryName: "i2dpmmmreuse",
					libraryVersion: "Active",
					neoappVersion: undefined,
					versions: [{
						details: "Active",
						version: "Active"
					}, {
						details: "1.6.0-snapshot-20150128",
						version: "1.6.0-snapshot-20150128"
					}, {
						details: "1.5.0-snapshot-20150128",
						version: "1.5.0-snapshot-20150128"
					}]
				}, {
					activeVersion: "1.6.0-snapshot-20150128",
					detailVersion: "Active",
					libraryName: "i3dpmmmreuse",
					libraryVersion: "Active",
					neoappVersion: undefined,
					versions: [{
						details: "Active",
						version: "Active"
					}, {
						details: "1.6.0-snapshot-20150128",
						version: "1.6.0-snapshot-20150128"
					}, {
						details: "1.7.0-snapshot-20150128",
						version: "1.7.0-snapshot-20150128"
					}]
				}];

				var oEventData = {
					getSource: function() {
						return mockButton;
					}
				};

				_oImpl.getLibVersions = function() {
					return Q(mockResult);
				};

				return oResourceMappingHandler.onGetLibsVersionsClick(oEventData).then(function() {
					var test = mockButton.getModel().getProperty("/appsVersion");
					expect(test).to.deep.equal(mockResult);
					//check model data after changing appsVersion data
					libName = mockButton.getModel().getProperty("/appsVersion/0/libraryName");
					expect(libName).to.deep.equal("i2dpmmmreuse");
				});
			});

	});
});