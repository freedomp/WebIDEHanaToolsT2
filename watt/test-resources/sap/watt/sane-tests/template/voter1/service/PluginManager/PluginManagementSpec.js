define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "PluginManagement_Integration";
	var getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var oPluginManagementService, oDestinationService, oMockServer, iFrameWindow, oPluginManagementServiceImpl;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {

					iFrameWindow = oWindow;
					oPluginManagementService = getService('pluginmanagement');
					STF.getServicePrivateImpl(oPluginManagementService).then(function (oServiceImpl) {
						oPluginManagementServiceImpl = oServiceImpl;
					});
					oDestinationService = getService('destination');
					oDestinationService.getDestinations = function() {
						return Q([{
							"Name" : "plugin_repository_ext",
							"wattUsage" : "plugin_repository",
							"Description" : "Test Repository",
							"WebIDEEnabled" : "true",
							"Path" : ""
						}, {
							"Name" : "claims-hana-odata-service-no-auth",
							"wattUsage" : "plugin_repository",
							"WebIDEEnabled" : "true",
							"Path" : ""
						}, {
							"Name" : "g8p_abap_odata",
							"Description" : "G8P ABAP oData",
							"RDEEnabled" : "true",
							"RDEUsage" : "odata_abap",
							"RDESystem" : "G8P",
							"Path" : "/sap/opu/odata",
							"wattUsage" : "plugin_repository"
						}, {
							"Name" : "gm6_q91",
							"wattUsage" : "plugin_repository",
							"Description" : "Q91 Hana System via GM6 web dispatcher",
							"WebIDEEnabled" : "true",
							"Path" : ""
						}]);
					};

					// prepare mock server
					var catalogbetaJSON = {
						"name" : "RDE test repository",
						"plugins" : [
							{
								"name": "sap.hcp.widget.plugin",
								"description": "SAP HANA Cloud Portal",
								"path" : "/hcpWidgetPlugin",
								"version" : "1.6.0"
							},
							{
								"name": "com.sap.webide.factsheeteditor",
								"description": "Fact Sheet Editor",
								"path" : "/factsheeteditor",
								"version" : "1.3.3"
							},
							{
								"name": "com.sap.webide.factsheeteditor.dev",
								"description": "Fact Sheet Editor - Dev Beta",
								"path" : "/dev/factsheeteditor",
								"version" : "1.4.0-SNAPSHOT"
							},
							{
								"name": "com.sap.webide.vizpacker",
								"description": "VizPacker plugin",
								"path" : "/vizpacker",
								"version" : "1.0.3"
							},
							{
								"name": "com.sap.webide.odatamodeleditor",
								"description": "OData Model Editor",
								"path" : "/odatamodeleditor",
								"version" : "1.2.2"
							},
							{
								"name": "com.sap.webide.hybrid",
								"description": "The Web IDE plugin for Hybrid App Toolkit",
								"path" : "/hybrid",
								"version" : "1.2.0"
							}
						]
					};
					var catalogbetaJSONContent = JSON.stringify(catalogbetaJSON);

					var catalogJSON = {
						"name" : "RDE test repository",
						"plugins" : [
							{
								"name": "uiviewplugin",
								"description": "uiviewplugin",
								"path" : "/uiviewplugin",
								"version" : "1.0.0"

							},
							{
								"name": "com.sap.webide.factsheeteditor",
								"description": "com.sap.webide.factsheeteditor",
								"path" : "/factsheeteditor/rel",
								"version" : "1.3.0"

							},
							{
								"name": "com.sap.webide.factsheeteditor",
								"description": "com.sap.webide.factsheeteditor",
								"path" : "/factsheeteditor/beta",
								"version" : "1.3.8"

							},
							{
								"name": "sap.watt.saptoolsets.fiori.project.ui5templatesmart",
								"description": "Smart Template samples",
								"path" : "/SmartTemplates",
								"version" : "1.0.0"

							}
						]
					};
					var catalogJSONContent = JSON.stringify(catalogJSON);
					var cataloginternalJSONContent = JSON.stringify(catalogJSON);

					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
						rootUri: "",
						requests: [{
							method: "GET",
							path: new iFrameWindow.RegExp(".*/cataloginternal.json.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
								}, cataloginternalJSONContent);
							}
						}, {
							method: "GET",
							path: new iFrameWindow.RegExp(".*/catalogbeta.json.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
								}, catalogbetaJSONContent);
							}
						}, {
							method: "GET",
							path: new iFrameWindow.RegExp(".*/catalog.json.*"),
							response: function (oXhr) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, catalogJSONContent);
							}
						},
							{
								method: "GET",
								path: new iFrameWindow.RegExp(".*/BasicSAPUI5ApplicationProjectTemplate.js.*"),
								response: function (oXhr) {
									oXhr.respond(200, {
										"Content-Type": "application/javascript",
										"Content-Encoding": "gzip"
									}, "BasicSAPUI5ApplicationProjectTemplate Content");
								}
							},

							{
								method: "GET",
								path: new iFrameWindow.RegExp(".*/BasicSAPUI5ApplicationProjectTemplate.zip.*"),
								response: function (oXhr) {
									oXhr.respond(200, {
									}, "BasicSAPUI5ApplicationProjectTemplate ZIP Content");
								}
							}

						]
					});
					oMockServer.start();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});

		it("isPluginLoaded - Existing plugin name", function() {
			return oPluginManagementService.isPluginLoaded("sap.watt.platform.usernotification").then(function(bResult) {
				assert.equal(bResult, true, "Existing plugin name is loaded");
			});
		});
		
		it("isPluginLoaded - Non existing plugin name", function() {
			return oPluginManagementService.isPluginLoaded("non.existing.plugin.name").then(function(bResult) {
				assert.equal(bResult, false, "Non existing plugin name is not loaded");
			});
		});
		
		it("isPluginLoaded - Empty plugin name", function() {
			return oPluginManagementService.isPluginLoaded("").then(function(bResult) {
				assert.equal(bResult, false, "Empty plugin name is not loaded");
			});
		});
		
		it("isPluginLoaded - Undefined plugin name", function() {
			return oPluginManagementService.isPluginLoaded(undefined).then(function(bResult) {
				assert.equal(bResult, false, "Undefined plugin name is not loaded");
			});
		});
		
		it("getOptionalPluginsUI", function() {
			return oPluginManagementService.getOptionalPluginsUI().then(function(oMainPluginManagerGrid) {
				assert.ok(oMainPluginManagerGrid, "Success getting Main Optional Plugin Grid");
				var aContent = oMainPluginManagerGrid.getContent();
				assert.equal(aContent.length, 1, "Got right number of content entries");

				assert.ok(oMainPluginManagerGrid.getModel(),
					"Success getting Main Optional Plugin Grid model");
				assert.ok(oMainPluginManagerGrid.getModel().getData(),
					"Success getting Main Optional Plugin Grid model data");
				assert.ok(oMainPluginManagerGrid.getModel().getData().repositories,
					"Success getting Main Optional Plugin Grid model data repositories");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories.length, 5,
					"Success getting Main Optional Plugin Grid model data repositories length");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories[0].catalogName, "RDE test repository",
					"Got right rep 1 catalog name");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories[0].repositoryName, "SAPPlugins",
					"Got right rep 1 name");

				assert.equal(aContent[0].getId(), "PluginManagerGrid", "Got right ID for plugin manager grid");
				var pluginManagerGridContent = aContent[0].getContent();
				assert.ok(pluginManagerGridContent, "Success getting PluginManagerGrid content");
				assert.equal(pluginManagerGridContent.length, 6, "Got right number of PluginManagerGrid content");

				assert.ok(pluginManagerGridContent[2], "Success getting oPluginManagerTable");
				var _oPluginManagerTable = pluginManagerGridContent[2];
				assert.ok(_oPluginManagerTable.getModel(), "Success getting oPluginManagerTable model");
				var _oPluginManagerTableModel = _oPluginManagerTable.getModel();
				assert.ok(_oPluginManagerTableModel.getData(), "Success getting oPluginManagerTable model data");
				var _oPluginManagerTableModelData = _oPluginManagerTableModel.getData();
				assert.ok(_oPluginManagerTableModelData.plugins,
					"Success getting oPluginManagerTable model data plugins");
				assert.equal(_oPluginManagerTableModelData.plugins[0].pluginName, "uiviewplugin",
					"Got right plugin 1 name");
				assert.equal(_oPluginManagerTableModelData.plugins[1].pluginName, "com.sap.webide.factsheeteditor",
					"Got right plugin 2 name");
				assert.equal(_oPluginManagerTableModelData.plugins[2].pluginName, "com.sap.webide.factsheeteditor",
					"Got right plugin 3 name");
				assert.equal(_oPluginManagerTableModelData.plugins[3].pluginName, "sap.watt.saptoolsets.fiori.project.ui5templatesmart",
					"Got right plugin 4 name");

			});
		});

		it("getAvailablePluginsUI", function() {
			return oPluginManagementService.getAvailablePluginsUI().then(function(oAvailablePluginsGrid) {
				assert.ok(oAvailablePluginsGrid, "Success getting Main Available Plugin Grid");
				var oAvailablePluginsGridContent = oAvailablePluginsGrid.getContent();
				assert.equal(oAvailablePluginsGridContent.length, 1, "Got right number of content entries of Main Available Plugin Grid");
				assert.ok(oAvailablePluginsGridContent[0].getContent(), "Success getting sub grid content");
				var subGridContent = oAvailablePluginsGridContent[0].getContent();
				assert.equal(subGridContent.length, 2, "Got right number of content entries of sub grid");
				var searchContent = subGridContent[0];
				assert.equal(searchContent.getId(), "searchField", "Got right id of search bar");
				var pluginTableContent = subGridContent[1];
				assert.equal(pluginTableContent.getId(), "pluginTable", "Got right id of plugins table");
				assert.ok(pluginTableContent.getColumns(), "Success getting columns of plugins table");
				assert.equal(pluginTableContent.getColumns().length, 2, "Got right numbers of columns of plugins table");
				assert.ok(pluginTableContent.getColumns()[0].getLabel(), "Success getting first column label");
				assert.equal(pluginTableContent.getColumns()[0].getLabel().getText(), "Plugin Name",
					"Got right first column name");
				assert.ok(pluginTableContent.getColumns()[1].getLabel(), "Success getting second column label");
				assert.equal(pluginTableContent.getColumns()[1].getLabel().getText(), "Plugin Location",
					"Got right second column name");

				assert.ok(pluginTableContent.getModel(), "Success getting plugins table model");
				var pluginTableModel = pluginTableContent.getModel();
				assert.ok(pluginTableModel.getData(), "Success getting plugins table model data");
				var pluginTableModelModelData = pluginTableModel.getData();
				assert.ok(pluginTableModelModelData.modelData,
					"Success getting modelData property of plugins table model data");
				assert.notEqual(pluginTableModelModelData.modelData.length, 0,
					"Got right number of plugins in plugins table model data");

			});
		});

		it("updatePreferences", function() {
			return oPluginManagementService.getOptionalPluginsUI().then(function(oMainPluginManagerGrid) {
				assert.ok(oMainPluginManagerGrid, "Success getting Main Optional Plugin Grid");
				var aContent = oMainPluginManagerGrid.getContent();
				assert.equal(aContent.length, 1, "Got right number of content entries");
				assert.ok(oMainPluginManagerGrid.getModel(),
					"Success getting Main Optional Plugin Grid model");
				assert.ok(oMainPluginManagerGrid.getModel().getData(),
					"Success getting Main Optional Plugin Grid model data");
				assert.ok(oMainPluginManagerGrid.getModel().getData().repositories,
					"Success getting Main Optional Plugin Grid model data repositories");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories.length, 5,
					"Success getting Main Optional Plugin Grid model data repositories length");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories[0].catalogName, "RDE test repository",
					"Got right rep 1 catalog name");
				assert.equal(oMainPluginManagerGrid.getModel().getData().repositories[0].repositoryName, "SAPPlugins",
					"Got right rep 1 name");
				// update checked property for updatePreferences sceanrio
				oMainPluginManagerGrid.getModel().getData().repositories[0].plugins[0].checked = true;
				return oPluginManagementService.updatePreferences().then(function() {
				});
			});
		});
		
		it("_removePluginsFromConfig", function() {
			var oResult = oPluginManagementServiceImpl._removePluginsFromConfig(null, null);
			assert.isNull(oResult, "No error when passing null parameters");
			
			oResult = oPluginManagementServiceImpl._removePluginsFromConfig([], {});
			assert.isNotNull(oResult, "No error when passing empty object parameters");
			
			oResult = oPluginManagementServiceImpl._removePluginsFromConfig(["http://localhost/plugins/pluginrepository/plug1"], {plugins : []});
			assert.equal(oResult.plugins.length, 0,  "No error when remove from empty plugins");
			
			oResult = oPluginManagementServiceImpl._removePluginsFromConfig([], {plugins : ["/plugins/pluginrepository/plug1", "/plugins/pluginrepository/plug2"]});
			assert.equal(oResult.plugins.length, 2,  "No plugins removed");
			
			oResult = oPluginManagementServiceImpl._removePluginsFromConfig(["http://localhost/plugins/pluginrepository/plug1", "http://localhost/plugins/pluginrepository/plug3"], {plugins : ["/plugins/pluginrepository/plug1", "/plugins/pluginrepository/plug2"]});
			assert.equal(oResult.plugins.length, 1,  "Removed only one plugin");
			assert.equal(oResult.plugins[0], "/plugins/pluginrepository/plug2",  "Removed the correct plugin");
			
		});

		it("getPluginFile - bGetBlob false", function() {
			return oPluginManagementService.getPluginFile(
				"sap.watt.saptoolsets.fiori.project.ui5template/basicSAPUI5ApplicationProject/BasicSAPUI5ApplicationProjectTemplate",
				"ui5template/basicSAPUI5ApplicationProject/BasicSAPUI5ApplicationProjectTemplate.js",
				false).then(function(oExistingResourcesBlob) {
					assert.ok(oExistingResourcesBlob, "Success getting template blob");
				});
		});

		it("getPluginPath", function() {
			return oPluginManagementService.getPluginPath("sap.watt.ideplatform.aceeditor").then(function(path) {
				assert.ok(path, "Success getting plugin path");
				assert.ok(path.indexOf("aceeditor")>0, "Got expected plugin's path");
			});
		});

		it("getPluginPath - negative unknown plugin", function() {
			return oPluginManagementService.getPluginPath("unknownPluginName").then(function(path) {
				assert.ok(!path, "Success getting empty path");
			});
		});

		it("getPluginPath - negative null", function() {
			return oPluginManagementService.getPluginPath(null).then(function(path) {
				assert.ok(!path, "Success getting empty path");
			});
		});

		it("getPluginPath - negative undefined", function() {
			return oPluginManagementService.getPluginPath().then(function(path) {
				assert.ok(!path, "Success getting empty path");
			});
		});


	});
});