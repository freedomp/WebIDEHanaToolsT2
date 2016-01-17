define(['STF', "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/extendcontrollerhook/ExtendControllerHook"],
	function (STF, ExtendControllerHook) {
		"use strict";

		describe('Controller Hook Extension', function () {

			describe('Acts after extension generation', function () {
				var bExtensionAdded;

				function buildMockContext() {
					var oContext = {};
					oContext.service = {};
					oContext.service.extensionproject = {};
					oContext.service.extensionproject.getExtensionRevision = function() {
						return Q(false);
					};
					oContext.service.filesystem = {};
					oContext.service.filesystem.documentProvider = {};
					oContext.service.filesystem.documentProvider.getDocument = function() {
						return Q(false);
					};
					oContext.service.ui5projecthandler = {};
					oContext.service.ui5projecthandler.getHandlerDocument = function() {
						var document = {getEntity: function() {
							return {getFullPath: function() {
								return "";
							}};
						}};
						return Q(document);
					};
					oContext.service.ui5projecthandler.getAllExtensions = function() {
						return Q({"sap.ui.controllerExtensions": {}});
					};
					oContext.service.ui5projecthandler.addExtension = function() {
						bExtensionAdded = true;
						return Q(false);
					};

					oContext.service.beautifierProcessor = {};
					oContext.service.beautifierProcessor.beautify = function() {
						return Q(false);
					};

					return oContext;
				}

				beforeEach(function() {
					bExtensionAdded = false;
					// Build mock context and services
					ExtendControllerHook.context = buildMockContext();
				});

				// Check for onAfterGeneration - adding first hook
				it("Adding first hook", function (done) {
					var projectZip = {};

					projectZip.files = {"EmptyController.js": {asText: function() {return "";}, asBinary: function() {return "";}},
						"ComponentCustomizing.json": {asText: function() {return "{\"key1\": {}}";}, asBinary: function() {return "";}}};
					projectZip.file = function() {};
					projectZip.remove = function() {};
					var model = {};

					// On before is called as preparation
					ExtendControllerHook.onBeforeTemplateGenerate(projectZip, model).then(function() {
						ExtendControllerHook.onAfterGenerate(projectZip, model).then(function() {
							// We expect that ui5projecthandler.addExtension() was called
							expect(bExtensionAdded).to.be.true;
							done();
						});
					});
				});

				// Check for onAfterGeneration - adding non-first hook
				it("Adding non-first hook", function (done) {
					var projectZip = {};

					projectZip.files = {};
					projectZip.file = function() {};
					projectZip.remove = function() {};
					var model = {};

					// On before is called as preparation
					ExtendControllerHook.onBeforeTemplateGenerate(projectZip, model).then(function() {
						ExtendControllerHook.onAfterGenerate(projectZip, model).then(function() {
							// We expect that ui5projecthandler.addExtension() was NOT called
							expect(bExtensionAdded).to.be.false;
							done();
						});
					});
				});
			});

			describe("Unit tests", function() {

				it("Tests _getExtendingController method", function () {

					var oCustomizingJson = {}; // flow 1 - empty object
					var sControllerName = "cross.fnd.fiori.inbox.view.S2";
					var oController = ExtendControllerHook._getExtendingController(oCustomizingJson, sControllerName);
					assert.equal(oController, null);

					oCustomizingJson = null; // flow 2 - null input
					oController = ExtendControllerHook._getExtendingController(oCustomizingJson, sControllerName);
					assert.equal(oController, null);

					oCustomizingJson = { // flow 3 - controller extended
						"sap.ui.controllerExtensions" : {
							"cross.fnd.fiori.inbox.view.S2" : {
								"controllerName" : "cross.fnd.fiori.inbox.cross.fnd.fiori.inboxExtension.view.S2Custom"
							}
						}
					};
					oController = ExtendControllerHook._getExtendingController(oCustomizingJson, sControllerName);
					assert.equal(oController.controllerName, "cross.fnd.fiori.inbox.cross.fnd.fiori.inboxExtension.view.S2Custom");

					oCustomizingJson = { // flow 4 - controller isn't extended
						"sap.ui.viewExtensions" : {
							"cross.fnd.fiori.inbox.view.S2" : {
								"CustomerExtensionForObjectListItem" : {
									"className" : "sap.ui.core.Fragment",
									"fragmentName" : "cross.fnd.fiori.inbox.cross.fnd.fiori.inboxExtension.view.S2_CustomerExtensionForObjectListItemCustom",
									"type" : "XML"
								}
							}
						}
					};

					oController = ExtendControllerHook._getExtendingController(oCustomizingJson, sControllerName);
					assert.equal(oController, null);
				});
			});
		});
	});
