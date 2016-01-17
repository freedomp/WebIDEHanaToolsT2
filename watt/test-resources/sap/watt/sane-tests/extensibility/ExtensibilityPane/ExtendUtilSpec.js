define(['STF',
	"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/visualExt/util/ExtendUtil"], function(STF, ExtendUtil) {

	"use strict";

	var suiteName = "fioriexttemplate_ExtensibilityPane_ExtendUtil";

	var iFrameWindow = null;

	describe("Unit tests for ExtendUtil external/internal functions", function() {

		var oContext;

		before(function (done) {
			STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				done();
			});
		});

		function buildMockContext() {
			oContext = {};
			oContext.service = {};
			oContext.service.filesystem = {};
			oContext.service.filesystem.documentProvider = {};

			oContext.service.parentproject = {};
			oContext.service.log = {};
			oContext.service.setting = {};
			oContext.service.setting.user = {};

			oContext.service.extensionproject = {};
			oContext.service.extensionproject.getResourceLocation = function() {
				return Q("path/");
			};
			oContext.service.extensionproject.openDocument = function() {
				return Q("");
			};

			oContext.i18n = {};

			oContext.service.generation = {};
			oContext.service.generation.generate = function() {
				return Q("");
			};

			oContext.service.beautifier = {};
			oContext.service.repositorybrowser = {};
			oContext.service.repositorybrowser.setSelection = function() {
				return Q();
			};

			oContext.service.document = {};
			oContext.service.document.open = function() {
				return Q({});
			};

			oContext.service.parentcode = {};
			oContext.service.parentcode.readOnly = function() {
				return Q({});
			};

			oContext.service.ui5projecthandler = {};
			oContext.service.ui5projecthandler.getAppNamespace = function() {
				return Q("cus.sd.salesorder.monitor.SD_SO_MONExtension");
			};

			oContext.service.usagemonitoring = {};
			oContext.service.usagemonitoring.report = function (sKey) {
				return Q(sKey);
			};

			oContext.i18n = {};
			oContext.i18n.getText = function (sSource, sKey) {
				return sKey;
			};
		}

		beforeEach(function () {
			buildMockContext();
		});

		it("Tests isExtended method", function() {

			// mock customizingJson block with 2 controllers extended
			var customizingJson = {
				"sap.ui.controllerExtensions" : {
					"Starter.view.Detail" : {
						"controllerName": "Starter.StarterExtension.view.DetailCustom"
					},
					"Starter.view.Master" : {
						"controllerName" : "Starter.StarterExtension.view.MasterCustom"
					}
				}
			};

			var customizationId = "sap.ui.viewModifications";
			var resourceId = "Starter.view.Detail";
			var extensionId = "header";

			// flow #1: negative
			var bIsExtended = ExtendUtil.isExtended(customizingJson, customizationId, resourceId, extensionId);
			expect(bIsExtended).to.equal(false);

			customizationId = "sap.ui.controllerExtensions";
			// flow #2: positive
			bIsExtended = ExtendUtil.isExtended(customizingJson, customizationId, resourceId, extensionId);
			expect(bIsExtended).to.equal(true);

			// mock customizingJson block with 1 hidden control
			customizingJson = {
				"sap.ui.viewModifications" : {
					"cus.sd.salesorder.monitor.view.S3" : {
						"OpenSchedules": {
							"visible": false
						}
					}
				}
			};

			customizationId = "sap.ui.viewModifications";
			resourceId = "cus.sd.salesorder.monitor.view.S3";
			extensionId = "OpenSchedules";
			// flow #3: positive
			bIsExtended = ExtendUtil.isExtended(customizingJson, customizationId, resourceId, extensionId);
			expect(bIsExtended).to.equal(true);
		});

		it("Tests isExtended method - BCP: 1570853024", function() {

			// mock customizingJson block with a hidden controller and a visible controller (manually modified by user from "false" to "true")
			var customizingJson = {
				"sap.ui.viewModifications": {
					"app.desc.view.Detail": {
						"iconTabBarFilter": {
							"visible": false
						},
						"header": {
							"visible": true
						}
					}
				}
			};

			var customizationId = "sap.ui.viewModifications";
			var resourceId = "app.desc.view.Detail";
			var extensionId = "header";

			// flow #1: visible = true
			var bIsExtended = ExtendUtil.isExtended(customizingJson, customizationId, resourceId, extensionId);
			expect(bIsExtended).to.equal(false);

			extensionId = "iconTabBarFilter";
			// flow #2: visible = false
			bIsExtended = ExtendUtil.isExtended(customizingJson, customizationId, resourceId, extensionId);
			expect(bIsExtended).to.equal(true);
		});

		it("Tests extendProject method", function() {

			oContext.i18n.getText = function() {
				return "Replace with a copy of the parent view";
			};

			// extend controller with copy of original controller

			// mock model
			var model = {
				"type" : "view",
				"resourceInfo" : {
					"controlIds" : [
						{
							"name" : "masterListHeaderTitle",
							"nodeName" : "Label"
						},
						{
							"name" : "list",
							"nodeName" : "List"
						}
					],
					"extensionPoints" : [],
					"id" : "cus.sd.salesorder.monitor.view.S2",
					"name" : "S2",
					"path" : "SD_SO_MON%2fview%2fS2.view.xml",
					"resourceLocationPath" : "%2fview%2f",
					"type" : "view"
				},
				"componentId" : "fioriexttemplate.replaceviewcomponent",
				"customizationId" : "sap.ui.viewReplacements",
				"isExtendable" : true,
				"isExtended" : false
			};

			// mock extension project SD_SO_MONExtension
			var extensionProjectDocument = {};
			extensionProjectDocument.getEntity = function() {
				var getType = function() {
					return "folder";
				};

				var getName = function() {
					return "SD_SO_MONExtension";
				};

				var getFullPath = function() {
					return "/SD_SO_MONExtension";
				};

				return {
					getType: getType,
					getName: getName,
					getFullPath : getFullPath
				};
			};

			// mock extensibilityModel in project.json
			var extensibilityModel = {
				"extensionProjectName" : "SD_SO_MONExtension",
				"extensionProjectPath" : "/SD_SO_MONExtension",
				extensionProjectNamespace : "cus.sd.salesorder.monitor.SD_SO_MONExtension",
				"extensibility" : {
					"component" : "SD_SO_MON%2fComponent.js",
					"configuration" : "SD_SO_MON%2fConfiguration.js",
					"controllers": {
						"Main": "SD_SO_MON%2fMain.controller.js",
						"S2": "SD_SO_MON%2fview%2fS2.controller.js",
						"S3": "SD_SO_MON%2fview%2fS3.controller.js",
						"S4": "SD_SO_MON%2fview%2fS4.controller.js",
						"SODeliverySchedules": "SD_SO_MON%2fview%2fSODeliverySchedules.controller.js"
					},
					"extensionNamespace" : "cus.sd.salesorder.monitor.SD_SO_MONExtension",
					"namespace": "cus.sd.salesorder.monitor",
					"parentName" : "SD_SO_MON",
					"parentPath" : "SD_SO_MON",
					"resourceBundle" : "i18n/i18n.properties",
					"systemId" : "GM6",
					"type" : "abaprep",
					"views" : {
						"Main": "SD_SO_MON%2fMain.view.xml",
						"S2": "SD_SO_MON%2fview%2fS2.view.xml",
						"S3": "SD_SO_MON%2fview%2fS3.view.xml",
						"S4": "SD_SO_MON%2fview%2fS4.view.xml",
						"SODeliverySchedules": "SD_SO_MON%2fview%2fSODeliverySchedules.view.xml"
					}
				},
				"generation" : {
					"dateTimeStamp": "Tue, 01 Jul 2014 10:55:30 GMT",
					"templateName": "Extend Controller",
					"templateVersion": "1.0.0"
				}
			};

			// mock selected template
			var selectedTemplate = {
				"sId": "fioriexttemplate.replaceviewcomponent"
			};

			var extensionOption = "Replace with a copy of the parent view";

			// flow #1: positive - replace view
			return ExtendUtil.extendProject(model, extensionProjectDocument, extensibilityModel, selectedTemplate, extensionOption, oContext).then(function(result) {
				expect(result).to.equal("");

				// mock model
				model = {
					"type" : "extensionpoint",
					"resourceInfo" : {
						"controlIds" : [
							{
								"name" : "masterListHeaderTitle",
								"nodeName" : "Label"
							},
							{
								"name" : "list",
								"nodeName" : "List"
							}
						],
						"extensionPoints" : [],
						"id" : "cus.sd.salesorder.monitor.view.S2",
						"name" : "S2",
						"path" : "SD_SO_MON%2fview%2fS2.view.xml",
						"resourceLocationPath" : "%2fview%2f",
						"type" : "view"
					},
					"componentId" : "fioriexttemplate.replaceviewcomponent",
					"customizationId" : "sap.ui.viewReplacements",
					"isExtendable" : true,
					"isExtended" : false,
					"attributes" : {
						"name" : {
							"value" : "extSOHeaderDetails"
						}
					}
				};

				// mock selected template
				selectedTemplate = {
					"sId": "fioriexttemplate.extendviewcomponent"
				};

				extensionOption = "Extend View";

				// flow #2: positive - extend view
				return ExtendUtil.extendProject(model, extensionProjectDocument, extensibilityModel, selectedTemplate, extensionOption, oContext).then(function(result) {
					expect(result).to.equal("");

					// mock model
					model = {
						"type" : "hidecontrol",
						"resourceInfo" : {
							"controlIds" : [
								{
									"name" : "masterListHeaderTitle",
									"nodeName" : "Label"
								},
								{
									"name" : "list",
									"nodeName" : "List"
								}
							],
							"extensionPoints" : [],
							"id" : "cus.sd.salesorder.monitor.view.S2",
							"name" : "S2",
							"path" : "SD_SO_MON%2fview%2fS2.view.xml",
							"resourceLocationPath" : "%2fview%2f",
							"type" : "view"
						},
						"componentId" : "fioriexttemplate.hidecontrolcomponent",
						"customizationId" : "sap.ui.viewModifications",
						"isExtendable" : true,
						"isExtended" : false,
						"isVisible" : true,
						"attributes" : {
							"name" : {
								"value" : "extSOHeaderDetails"
							},
							"id" : {
								"value" : "headerInfo"
							}
						}
					};

					// mock selected template
					selectedTemplate = {
						"sId": "fioriexttemplate.hidecontrolcomponent"
					};

					extensionOption = "Hide Control";

					// flow #3: positive - hide control
					return ExtendUtil.extendProject(model, extensionProjectDocument, extensibilityModel, selectedTemplate, extensionOption, oContext).then(function(result) {
						expect(result).to.equal("");
					});
				});
			});
		});

		it("Tests openLayoutEditor method", function() {
			oContext.service.extensionproject.openLayoutEditor = function(sExtensionProjectPath, oNodeModel, oExtensionCommon) {
				var bCompare = false;
				switch (oNodeModel.type) {
					case ExtendUtil.EXT_TYPE_VIEW:
						bCompare = oExtensionCommon.resourceTypeName === "viewName";
						break;
					case ExtendUtil.EXT_TYPE_EXT_POINT:
						bCompare = oExtensionCommon.resourceTypeName === "fragmentName";
						break;
					default :
						bCompare = false;
				}
				if (!bCompare) {
					throw new Error("Mismatch in types");
				}
				return Q(bCompare);
			};
			var sExtensionProjectPath = "", sResourceLocationPath = "", sActionOrigin = "";
			var aPromises = [];

			var oSelectedNode = {
				getBindingContext : function () {
					return {
						getObject : function() {
							return {
								type : "blah"// Negative flow
							};
						}
					};
				}
			};
			aPromises.push(ExtendUtil.openLayoutEditor(sExtensionProjectPath, oSelectedNode, sResourceLocationPath, oContext, sActionOrigin));

			oSelectedNode = {
				getBindingContext : function () {
					return {
						getObject : function() {
							return {
								type : ExtendUtil.EXT_TYPE_VIEW
							};
						}
					};
				}
			};

			aPromises.push(ExtendUtil.openLayoutEditor(sExtensionProjectPath, oSelectedNode, sResourceLocationPath, oContext, sActionOrigin));
			oSelectedNode = {
				getBindingContext : function () {
					return {
						getObject : function() {
							return {
								type : ExtendUtil.EXT_TYPE_EXT_POINT
							};
						}
					};
				}
			};
			aPromises.push(ExtendUtil.openLayoutEditor(sExtensionProjectPath, oSelectedNode, sResourceLocationPath, oContext, sActionOrigin));

			return Q.allSettled(aPromises).then(function (aRes) {
				expect(aRes.length).to.equal(3);
				expect(aRes[0].state).to.equal("rejected");
				expect(aRes[0].reason).to.equal("VisualExt_WrongNodeForLayoutEditor");
				expect(aRes[1].state).to.equal("fulfilled");
				expect(aRes[1].value).to.not.be.ok;
				expect(aRes[2].state).to.equal("fulfilled");
				expect(aRes[2].value).to.not.be.ok;
			}).fail(function(oError) {
				console.log(oError.message || oError);
				expect(true).to.be.false;
			});
		});

		it("Tests openExtendedDocument method", function() {

			var extensionProjectPath = "/SD_SO_MONExtension";

			var selectedNode = {};

			// mock model
			var model = {
				"type" : "objectHeader",
				"resourceInfo" : {
					"controlIds" : [
						{
							"name" : "masterListHeaderTitle",
							"nodeName" : "Label"
						},
						{
							"name" : "list",
							"nodeName" : "List"
						}
					],
					"extensionPoints" : [],
					"id" : "cus.sd.salesorder.monitor.view.S2",
					"name" : "S2",
					"path" : "SD_SO_MON%2fview%2fS2.view.xml",
					"resourceLocationPath" : "%2fview%2f",
					"type" : "view"
				},
				"componentId" : "fioriexttemplate.hidecontrolcomponent",
				"customizationId" : "sap.ui.viewModifications",
				"isExtendable" : true,
				"isExtended" : true,
				"isVisible" : true,
				"attributes" : {
					"name" : {
						"value" : "extSOHeaderDetails"
					},
					"id" : {
						"value" : "headerInfo"
					}
				}
			};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return model;
					}
				};
			};

			var resourceLocationPath = "webapp/";

			var flowPromises = [];

			// flow #1: hide control
			flowPromises.push(ExtendUtil.openExtendedDocument(extensionProjectPath, selectedNode, resourceLocationPath, oContext));

			selectedNode = {};
			// mock model
			model = {
				"type" : "extensionpoint",
				"resourceInfo" : {
					"controlIds" : [
						{
							"name" : "masterListHeaderTitle",
							"nodeName" : "Label"
						},
						{
							"name" : "list",
							"nodeName" : "List"
						}
					],
					"extensionPoints" : [],
					"id" : "cus.sd.salesorder.monitor.view.S2",
					"name" : "S2",
					"path" : "SD_SO_MON%2fview%2fS2.view.xml",
					"resourceLocationPath" : "%2fview%2f",
					"type" : "view"
				},
				"componentId" : "fioriexttemplate.hidecontrolcomponent",
				"customizationId" : "sap.ui.viewModifications",
				"isExtendable" : true,
				"isExtended" : true,
				"isVisible" : true,
				"attributes" : {
					"name" : {
						"value" : "extSOHeaderDetails"
					},
					"id" : {
						"value" : "headerInfo"
					}
				}
			};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return model;
					}
				};
			};

			resourceLocationPath = "webapp/";

			// flow #2: extend view
			flowPromises.push(ExtendUtil.openExtendedDocument(extensionProjectPath, selectedNode, resourceLocationPath, oContext));

			selectedNode = {};
			model = {
				"type" : "view",
				"resourceInfo" : {
					"controlIds" : [
						{
							"name" : "masterListHeaderTitle",
							"nodeName" : "Label"
						},
						{
							"name" : "list",
							"nodeName" : "List"
						}
					],
					"extensionPoints" : [],
					"id" : "cus.sd.salesorder.monitor.view.S2",
					"name" : "S2",
					"path" : "SD_SO_MON%2fview%2fS2.view.xml",
					"resourceLocationPath" : "%2fview%2f",
					"type" : "view"
				},
				"componentId" : "fioriexttemplate.hidecontrolcomponent",
				"customizationId" : "sap.ui.viewModifications",
				"isExtendable" : true,
				"isExtended" : true,
				"isVisible" : true,
				"attributes" : {
					"name" : {
						"value" : "extSOHeaderDetails"
					},
					"id" : {
						"value" : "headerInfo"
					}
				}
			};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return model;
					}
				};
			};

			resourceLocationPath = "";

			// flow #3: replace view
			flowPromises.push(ExtendUtil.openExtendedDocument(extensionProjectPath, selectedNode, resourceLocationPath, oContext));

			selectedNode = {};
			model = {
				"type" : "controller",
				"resourceInfo" : {
					"controlIds" : [
						{
							"name" : "masterListHeaderTitle",
							"nodeName" : "Label"
						},
						{
							"name" : "list",
							"nodeName" : "List"
						}
					],
					"extensionPoints" : [],
					"id" : "cus.sd.salesorder.monitor.view.S2",
					"name" : "S2",
					"path" : "SD_SO_MON%2fview%2fS2.view.xml",
					"resourceLocationPath" : "%2fview%2f",
					"type" : "view"
				},
				"componentId" : "fioriexttemplate.hidecontrolcomponent",
				"customizationId" : "sap.ui.viewModifications",
				"isExtendable" : true,
				"isExtended" : true,
				"isVisible" : true,
				"attributes" : {
					"name" : {
						"value" : "extSOHeaderDetails"
					},
					"id" : {
						"value" : "headerInfo"
					}
				}
			};

			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return model;
					}
				};
			};

			resourceLocationPath = "";

			// flow #4: extend controller
			flowPromises.push(ExtendUtil.openExtendedDocument(extensionProjectPath, selectedNode, resourceLocationPath, oContext));

			//Assertions
			//If ExtendUtil.openExtendedDocument() fails it creates an alert therefore we override the alert method and do
			//the assertion there
			oContext.service.usernotification = {};
			oContext.service.usernotification.alert = function(sErrorMessage) {
				//If the alert is called then the ExtendUtil.openParentDocument() failed.. then we make the test fail intentionally
				console.log(sErrorMessage);
				expect("Alert should not be called").to.equal("Alert was called");
			};

			//We do not want the test to finish untill all the promises are resolved
			return Q.all(flowPromises).then(function() {
				//Remove the mock of usernotification
				oContext.service.usernotification = undefined;
			});
		});

		it("Tests openParentDocument method", function() {
			oContext.service.parentproject.getDocument = function() {
				var fileDocument = {content : ""};
				fileDocument.getContent = function() {
					this.content = "<core:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" controllerName=\"hcm.mgr.approve.leaverequests.view.S2\"><Pageid=\"page\"" +
						"title=\"{i18n>view.Master.title}\"><content><Listid=\"list\" mode=\"{device>/listMode}\" select=\"_handleSelect\"><ObjectListItem id=\"MAIN_LIST_ITEM\"" +
						"type=\"{device>/listItemType}\" press=\"_handleItemPress\" title=\"{RequesterName}\" number=\"{parts:[{path:'AbsenceDays'},{path:'AbsenceHours'},{path:'AllDayFlag'}], formatter:'hcm.mgr.approve.leaverequests.util.Conversions.formatterAbsenceDuration'}\"" +
						"numberUnit=\"{parts:[{path:'AbsenceDays'},{path:'AbsenceHours'},{path:'AllDayFlag'}], formatter:'hcm.mgr.approve.leaverequests.util.Conversions.formatterAbsenceDurationUnit'}\">" +
						"<firstStatus><ObjectStatus text=\"{parts:[{path:'ChangeDate'}], formatter:'hcm.mgr.approve.leaverequests.util.Conversions.formatterTimestampToDate'}\"></ObjectStatus>" +
						"</firstStatus><secondStatus><ObjectStatus state=\"Warning\" text=\"{parts:[{path:'LeaveRequestType'}], formatter:'hcm.mgr.approve.leaverequests.util.Conversions.formatterListCancelStatus'}\"></ObjectStatus>" +
						"</secondStatus></ObjectListItem></List></content></Page></core:View>";
					return Q(this.content);
				};

				fileDocument.setContent = function(content) {
					this.content = content;
					return Q();
				};

				fileDocument.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "S2.view.xml";
					};

					return {
						getType: getType,
						getName: getName
					};
				};
				return Q(fileDocument);
			};

			var nodeModel = {
				isExtendable : false,
				isExtended : false,
				isVisible : false,
				resourceInfo : {
					name : "S2",
					type : "view"
				}
			};

			var selectedNode = {};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return nodeModel;
					}
				};
			};

			var extensibilityModel = {
				"extensionProjectName" : "SD_SO_MONExtension",
				"extensionProjectPath" : "/SD_SO_MONExtension",
				"extensibility" : {
					"component" : "SD_SO_MON%2fComponent.js",
					"configuration" : "SD_SO_MON%2fConfiguration.js",
					"controllers": {
						"Main": "SD_SO_MON%2fMain.controller.js",
						"S2": "SD_SO_MON%2fview%2fS2.controller.js",
						"S3": "SD_SO_MON%2fview%2fS3.controller.js",
						"S4": "SD_SO_MON%2fview%2fS4.controller.js",
						"SODeliverySchedules": "SD_SO_MON%2fview%2fSODeliverySchedules.controller.js"
					},
					"extensionNamespace" : "cus.sd.salesorder.monitor.SD_SO_MONExtension",
					"namespace": "cus.sd.salesorder.monitor",
					"parentName" : "SD_SO_MON",
					"parentPath" : "SD_SO_MON",
					"resourceBundle" : "i18n/i18n.properties",
					"systemId" : "GM6",
					"type" : "BSP",
					"views" : {
						"Main": "SD_SO_MON%2fMain.view.xml",
						"S2": "SD_SO_MON%2fview%2fS2.view.xml",
						"S3": "SD_SO_MON%2fview%2fS3.view.xml",
						"S4": "SD_SO_MON%2fview%2fS4.view.xml",
						"SODeliverySchedules": "SD_SO_MON%2fview%2fSODeliverySchedules.view.xml"
					}
				},
				"generation" : {
					"dateTimeStamp": "Tue, 01 Jul 2014 10:55:30 GMT",
					"templateName": "Extend Controller",
					"templateVersion": "1.0.0"
				}
			};

			var flowPromises = [];
			// flow 1 - view
			flowPromises.push(ExtendUtil.openParentDocument(selectedNode, extensibilityModel, oContext));

			nodeModel = {
				isExtendable : false,
				isExtended : false,
				isVisible : false,
				resourceInfo : {
					name : "S2",
					type : "controller"
				}
			};

			selectedNode = {};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return nodeModel;
					}
				};
			};

			// flow 2 - controller
			flowPromises.push(ExtendUtil.openParentDocument(selectedNode, extensibilityModel, oContext));

			nodeModel = {
				isExtendable : false,
				isExtended : false,
				isVisible : false,
				resourceInfo : {
					name : "S2",
					type : "component"
				}
			};

			selectedNode = {};
			selectedNode.getBindingContext = function() {
				return {
					getObject : function () {
						return nodeModel;
					}
				};
			};

			// flow 3 - component
			flowPromises.push(ExtendUtil.openParentDocument(selectedNode, extensibilityModel, oContext));

			//Assertions
			//If ExtendUtil.openParentDocument() fails it creates an alert therefore we override the alert method and do
			//the assertion there
			oContext.service.usernotification = {};
			oContext.service.usernotification.alert = function(sErrorMessage) {
				//If the alert is called then the ExtendUtil.openParentDocument() failed.. then we make the test fail intentionally
				console.log(sErrorMessage);
				expect("Alert should not be called").to.equal("Alert was called");
			};

			//We do not want the test to finish untill all the promises are resolved
			return Q.all(flowPromises).then(function() {
				//Remove the mock of usernotification
				oContext.service.usernotification = undefined;
			});
		});

		function getModelOfNodeInFocus(type, isExtended, newId) {
			//return {getModel: function() {
				//return {getData: function() {
					return {"type": type,
						"isExtended": isExtended,
						"resourceInfo": {"newId": newId}
					};
				//}};
			//}};
		}

		it("Tests isExtendedByNode method - for hook", function() {
			// Extended
			var oNodeModel = getModelOfNodeInFocus(ExtendUtil.EXT_TYPE_HOOK, true);
			var isExtended = ExtendUtil.isExtendedByNode(oNodeModel);
			expect(isExtended).to.equal(true);

			// Not extended
			oNodeModel = getModelOfNodeInFocus(ExtendUtil.EXT_TYPE_HOOK, false);
			isExtended = ExtendUtil.isExtendedByNode(oNodeModel);
			expect(isExtended).to.equal(false);
		});

		it("Tests isExtendedByNode method - for controller", function() {
			// Extended
			var oNodeModel = getModelOfNodeInFocus(ExtendUtil.EXT_TYPE_CONTROLLER, true, null);
			var isExtended = ExtendUtil.isExtendedByNode(oNodeModel);
			expect(isExtended).to.equal(true);

			// Not extended
			oNodeModel = getModelOfNodeInFocus(ExtendUtil.EXT_TYPE_CONTROLLER, true, "dummy");
			isExtended = ExtendUtil.isExtendedByNode(oNodeModel);
			expect(isExtended).to.equal(true);
		});

		it("Tests getCustomControllerDocument method", function() {
			var model = {};
			model.extensionProjectName = "MM_PO_APVExtension";
			model.extensibility = {};
			model.extensibility.namespace = "ui.s2p.mm.purchorder.approve";
			model.extensionProjectNamespace = "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension";
			model.extensionProjectPath = "/" + model.extensionProjectName;
			model.extensionResourceLocationPath = "";

			oContext.service.filesystem.documentProvider.getDocument = function(documentPath) {
				// If we got the expected path - we return an object, simulating a document. Otherwise, we return null
				var documentToReturn = documentPath === "/MM_PO_APVExtension/view/S2Custom.controller.js" ? {} : null;
				return Q(documentToReturn);
			};


			var customControllerFullName = model.extensionProjectNamespace + ".view.S2Custom";
			return ExtendUtil.getCustomControllerDocument(customControllerFullName, model, oContext).then(function(oDocument) {
				expect(jQuery.isEmptyObject(oDocument)).to.equal(true);
			});
		});

		it("Tests getCustomResourceFilePath method", function() {
			var projectName = "MM_PO_APVExtension";
			var ns = "ui.s2p.mm.purchorder.approve";
			var extensionNamespace = ns + "." + projectName;
			var replacedResourceId = extensionNamespace + ".view.S2Custom";
			var extensionProjectPath = "/" + projectName;
			var resourceSuffix = ".controller.js";
			var sResourceLocationPath = "webapp/";
			var expectedPath = "/" + projectName + "/" + sResourceLocationPath + "view/S2Custom" + resourceSuffix;

			var actualPath = ExtendUtil.getCustomResourceFilePath(replacedResourceId, extensionNamespace, extensionProjectPath, resourceSuffix, sResourceLocationPath);
			expect(actualPath).to.equal(expectedPath);
		});

		describe("Getting run configuration information", function() {
			var oExtProjectDocument;
			before(function () {
				oExtProjectDocument = {getEntity: function() {
					return {getFullPath: function() {
						return "/MyInboxExtension";
					}};
					
				}};
			});
			
			beforeEach(function () {
				oContext.service.setting.user.get = null;
			});
			
			function setGetUserSettingsForRunConfiguration(aConfigurations) {
				oContext.service.setting.user.get = function() {
					return Q(aConfigurations);
				};
			}

			it("From a single URL parameter, and from a hash", function() {
				var aConfigurations = [
					{
						"urlParameters": [
							{
								"paramName": "allItems",
								"paramValue": "true",
								"paramActive": true
							}
						],
						"hashParameter": "myHash",
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("?allItems=true");
					expect(oUri.hash()).to.equal("#myHash");
				});
			});
			
			it("From multiple URL parameters", function() {
				var aConfigurations = [
					{
						"urlParameters": [
							{
								"paramName": "allItems",
								"paramValue": "true",
								"paramActive": true
							},
							{
								"paramName": "param2",
								"paramValue": "value2",
								"paramActive": true
							}							
						],
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("?allItems=true&param2=value2");
					expect(oUri.hash()).to.equal("");
				});
			});
			
			it("From multiple URL parameters with the same param name", function() {
				var aConfigurations = [
					{
						"urlParameters": [
							{
								"paramName": "allItems",
								"paramValue": "true",
								"paramActive": true
							},
							{
								"paramName": "allItems",
								"paramValue": "false",
								"paramActive": true
							}							
						],
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("?allItems=true&allItems=false");
					expect(oUri.hash()).to.equal("");
				});
			});
			
			it("From zero URL parameters", function() {
				var aConfigurations = [
					{
						"urlParameters": [],
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("");
					expect(oUri.hash()).to.equal("");
				});
			});			
			
			it("Ignoring disabled parameters", function() {
				var aConfigurations = [
					{
						"urlParameters": [
							{
								"paramName": "allItems",
								"paramValue": "true",
								"paramActive": false
							},
							{
								"paramName": "param2",
								"paramValue": "value2",
								"paramActive": true
							}							
						],
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("?param2=value2");
					expect(oUri.hash()).to.equal("");
				});
			});
			
			it("From run items, when only the second item is of type webapprunner", function() {
				var aConfigurations = [
					{
						"_metadata": {
							"runnerId": "dummyrunner"
						}
					},
					{
						"urlParameters": [
							{
								"paramName": "allItems",
								"paramValue": "true",
								"paramActive": true
							}							
						],
						"hashParameter": "myHash",
						"_metadata": {
							"runnerId": "webapprunner"
						}
					}
					];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri.search()).to.equal("?allItems=true");
					expect(oUri.hash()).to.equal("#myHash");
				});
			});
			
			it("Without 'run' array", function() {
				setGetUserSettingsForRunConfiguration(null);
				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri).to.be.null;
				});
			});
			
			it("With empty 'run' array", function() {
				var aConfigurations = [];
				setGetUserSettingsForRunConfiguration(aConfigurations);

				return ExtendUtil.getRunConfigurationInfo(oContext, oExtProjectDocument).then(function(oUri) {
					expect(oUri).to.be.null;
				});
			});
			
			describe("With error in the console", function() {
				var DUMMY_ERROR = "dummy error message";
				var sReportedError;

				beforeEach(function () {
					sReportedError = null;
					oContext.i18n.getText = function() {
						return DUMMY_ERROR;
					};
					oContext.service.log.error = function(sErr) {
						sReportedError = sErr;
						return Q();
					};				
				});
				
				it("Without the input argument - the ext' project document", function() {
					return ExtendUtil.getRunConfigurationInfo(oContext).then(function(oUri) {
						expect(oUri).to.be.null;
						expect(sReportedError).to.equal(DUMMY_ERROR);
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});

	describe("Service tests for ExtendUtil", function() {

		var oFakeFileDAO;
		var oFileService;
		var oContext;

		before(function (done) {
			STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileService = STF.getService(suiteName, "filesystem.documentProvider");
				oContext = STF.getService(suiteName, "extensionproject").context;
				done();
			});
		});

		it("Tests removeExtension method", function() {
			// prepare mock input
			var nodeModel = {
				"componentId": "fioriexttemplate.hidecontrolcomponent",
				"customizationId": "sap.ui.viewModifications",
				"extensionId": "OpenSchedules",
				"isExtendable": true,
				"isExtended": true,
				"isVisible": true,
				"resourceInfo" : {
					"id": "cus.sd.salesorder.monitor.view.S3"
				}
			};

			var manifestJson = {
				"_version": "1.1.0",
				"sap.app": {
					"_version": "1.1.0",
					"id": "hcm.approve.timesheet.hcm.approve.timesheetExtension",
					"type": "application",
					"applicationVersion": {
						"version": "1.0"
					},
					"title": "{{TSA_APP_TITLE}}"
				},
				"sap.ui": {
					"_version": "1.1.0",
					"technology": "UI5",
					"icons": {
						"icon": "sap-icon://Fiori2/F0002",
						"favIcon": "/resources/sap/ca/ui/themes/base/img/favicon/F0002_My_Accounts.ico"
					},
					"deviceTypes": {
						"desktop": true,
						"tablet": true,
						"phone": true
					},
					"supportedThemes": [
						"sap_hcb",
						"sap_bluecrystal"
					]
				},
				"sap.ui5": {
					"_version": "1.1.0",
					"extends": {
						"component" : "hcm.approve.timesheet",
						"extensions" : {
							"sap.ui.viewModifications" : {
								"cus.sd.salesorder.monitor.view.S3" : {
									"OpenSchedules": {
										"visible": false
									}
								}
							}
						}
					}
				}
			};

			var sComponentDirectsToManifestContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';

			var oFileStructure = {
				"extensionapp1" : {
					"manifest.json" : JSON.stringify(manifestJson),
					"Component.js" : sComponentDirectsToManifestContent
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/extensionapp1").then(function(oProjectDoc) {
					// flow 1 - positive
					return ExtendUtil.removeExtension(nodeModel, oProjectDoc, oContext).then(function(oAllExtensions1) {
						// TODO: why is oAllExtensions1 not empty here? It should be empty
						expect(jQuery.isEmptyObject(oAllExtensions1)).to.equal(true);

						nodeModel = {
							"componentId": "fioriexttemplate.extendcontrollercomponent",
							"customizationId": "sap.ui.controllerExtensions",
							"isExtendable": true,
							"isExtended": true,
							"resourceInfo" : {
								"id": "cus.sd.salesorder.monitor.view.S3"
							}
						};

						manifestJson["sap.ui5"].extends.extensions = {
							"sap.ui.controllerExtensions" : {
								"cus.sd.salesorder.monitor.view.S3": {
									controllerName: "cus.sd.salesorder.monitor.SD_SO_MONExtension.view.S3Custom"
								},
								"Starter.view.Master" : {
									"controllerName" : "Starter.StarterExtension.view.MasterCustom"
								}
							}
						};

						oFileStructure = {
							"extensionapp2" : {
								"manifest.json" : JSON.stringify(manifestJson),
								"Component.js" : sComponentDirectsToManifestContent
							}
						};

						return oFakeFileDAO.setContent(oFileStructure).then(function() {
							return oFileService.getDocument("/extensionapp2").then(function (oProjectDoc2) {
								// flow 2 - positive
								// TODO: if there's no extensionId in the model, an exception is thrown because there's no context
								return ExtendUtil.removeExtension(nodeModel, oProjectDoc2, oContext).then(function(oAllExtensions2) {
									expect(!jQuery.isEmptyObject(oAllExtensions2)).to.equal(true);
									expect(!jQuery.isEmptyObject(oAllExtensions2["sap.ui.controllerExtensions"])).to.equal(true);
									expect(!jQuery.isEmptyObject(oAllExtensions2["sap.ui.controllerExtensions"]["Starter.view.Master"])).to.equal(true);
									expect(oAllExtensions2["sap.ui.controllerExtensions"]["cus.sd.salesorder.monitor.view.S3"] === undefined).to.equal(true);
								});
							});
						});
					});
				});
			});
		});

		 after(function () {
		 	STF.shutdownWebIde(suiteName);
		 });
	});
});