define(['STF', "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/visualExt/outline/ExtensionProjectTree",
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/visualExt/util/ExtendUtil"],
	function(STF, ExtensionProjectTree, ExtendUtil) {

		"use strict";

		describe("Unit tests for ExtensionProjectTree class", function() {
			var oExtensionProjectTree;
			/* eslint-disable no-unused-expressions */
			
			var MockDocument = function(sFullPath, sFileExtension, sContent, oProject) {
				this.sContent = sContent;
				this.extensionSeperator = '.';
				this.oProject = oProject;
				var oEntity = {
					sFileExtension : sFileExtension,
					sFullPath : sFullPath,
					getFullPath : function() {
						return sFullPath;
					},
					getFileExtension : function() {
						return sFileExtension;
					},
					isRoot : function() {
						return false;
					},
					getName : function() {
						return "mockDocumentName";
					}
				};
	
				this.getEntity = function() {
					return oEntity;
				};
	
				this.getContent = function() {
					return Q(this.sContent);
				};
	
				this.getProject = function() {
					return Q(this.oProject);
				};
			};
			
			var dummyExtProjectDocument = {
				getEntity: function() {
					return {
						getFullPath: function() {}
					};
				}
			};

			var oContext = {};
			oContext.service = {};
			oContext.service.template = {};
			oContext.service.template.getTemplates = function() {
				return Q();
			};
			oContext.i18n = {};
			oContext.i18n.getText = function() {
				return Q("");
			};
			oContext.service.extensionproject = {};
			oContext.service.extensionproject.getResourceLocation = function() {
				return Q("dummyResourceLocation");
			};
			oContext.service.ui5projecthandler = {};
			oContext.service.ui5projecthandler.getAppNamespace = function() {
				return Q("dummyNamespace");
			};
			var oAllExtensions = {};
			oContext.service.ui5projecthandler.getAllExtensions = function() {
				return Q(oAllExtensions);
			};
			oContext.service.generation = {};
			oContext.service.generation.generate = function() {
				return Q();				
			};
			
			var sViewMain;
			var sViewMainCustom;
			var sViewGeneralDataEdit;
			var sViewS2;
			var sViewS2Custom;
			var sViewS4;
			var sFragmentViewSettingsDialog;
			var sFragmentGeneralDataEditCompany;
			var oViewMain;
			var oExtensionPointExtEditForm;
			var oViewMainCustom;
			var oViewGeneralDataEdit;
			var oViewS2;
			var oViewS2Custom;
			var oViewS4;
			var oControllerAccountAssignmentTable;
			var oControllerS2;
			var oControllerS2Custom;
			var oFragmentViewSettingsDialog;
			var oViewGeneralDataEditCompany;
			
			function resetResources() {
				/* eslint-disable no-multi-str */
				sViewMain =
					"<core:View\
						xmlns:core=\"sap.ui.core\"\
						xmlns=\"sap.m\"\
						controllerName=\"ui.s2p.mm.purchorder.approve.Main\"\
						displayBlock=\"true\"\
						height=\"100%\">\
						<NavContainer\
							id=\"fioriContent\">\
						</NavContainer>\
					</core:View>";

				sViewMainCustom =
					"<core:View controllerName=\"ui.s2p.mm.purchorder.approve.Main\" displayBlock=\"true\" height=\"100%\" xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\">\
						<Page id=\"customPage\" title=\"Title\">\
							<content></content>\
						</Page>\
					</core:View>";

				sViewGeneralDataEdit =
					"<core:View xmlns:core=\"sap.ui.core\"  xmlns=\"sap.m\" xmlns:layout=\"sap.ui.layout\" xmlns:form=\"sap.ui.layout.form\" id=\"editView\">\
					<Page showNavButton=\"true\" id=\"page\">\
						<content>\
							<layout:Grid defaultSpan=\"L12 M12 S12\" width=\"auto\">\
								<layout:content>\
									<core:ExtensionPoint name=\"extEditForm\">\
										<form:Form id=\"form\" class=\"sapUiFormEdit sapUiFormEdit-CTX\">\
											<form:formContainers>\
												<form:FormContainer />\
												<form:FormContainer id=\"editFormCompany\" title=\"{i18n>GENERAL_DATA}\" visible=\"{parts:['category', 'constants>/accountCategoryPerson'], formatter: 'cus.crm.myaccounts.util.formatter.isUnequal'}\">\
													<form:formElements >\
														<core:Fragment id=\"companyFragment\" fragmentName=\"cus.crm.myaccounts.view.maintain.GeneralDataEditCompany\" type=\"XML\" />\
													</form:formElements>\
												</form:FormContainer>\
											</form:formContainers>\
										</form:Form>\
									</core:ExtensionPoint>\
									<Label id=\"label1\"></Label>\
								</layout:content>\
							</layout:Grid>\
						</content>\
					</Page>\
				</core:View>";
				
				sViewS2 = 
				"<core:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" controllerName=\"ui.s2p.mm.purchorder.approve.view.S2\">\
					<Page>\
						<content>\
							<List>\
								<ObjectListItem>\
									<Label id=\"label1\"></Label>\
									<core:ExtensionPoint name=\"extListItemInfo\" />\
								</ObjectListItem>\
							</List>\
						</content>\
					</Page>\
				</core:View>";
				
				sViewS2Custom = 
				"<core:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" controllerName=\"ui.s2p.mm.purchorder.approve.view.S2\">\
					<Page>\
						<content>\
							<List>\
								<ObjectListItem>\
									<core:ExtensionPoint name=\"extListItemInfo\" />\
								</ObjectListItem>\
							</List>\
						</content>\
					</Page>\
				</core:View>";				

				sViewS4 = 
					"<core:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" xmlns:form=\"sap.ui.layout.form\">\
						<Page id=\"itemdetail\">\
							<form:Form id=\"ItemDetailInfoFormGeneral\">\
					 			<form:FormContainer>\
									<form:formElements>\
										<core:ExtensionPoint name=\"extBefore\"/>\
										<form:FormElement id=\"element1\">\
												<form:label><Label text=\"element1 label\"></Label></form:label>\
												<form:fields><Text text=\"element1 text\"></Text></form:fields>\
										</form:FormElement>\
										<form:FormElement id=\"element2\">\
												<form:label><Label text=\"element2 label\"></Label></form:label>\
												<form:fields><Text text=\"element2 text\"></Text></form:fields>\
										</form:FormElement>\
										<form:FormElement id=\"element3\">\
												<form:label><Label text=\"element3 label\"></Label></form:label>\
												<form:fields><Text text=\"element3 text\"></Text></form:fields>\
										</form:FormElement>\
										<core:ExtensionPoint name=\"extAfter\" />\
									</form:formElements>\
								</form:FormContainer>\
							</form:Form>\
						</Page>\
					</core:View>";
					
				sFragmentViewSettingsDialog =
					"<core:FragmentDefinition xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\">\
						<ViewSettingsDialog confirm=\"onConfirmViewSettingsDialog\" id=\"viewSettingsDialog\" resetFilters=\"onViewSettingsDialogResetFilters\">\
							<filterItems>\
								<ViewSettingsFilterItem id=\"filterItems\" key=\"Price\" multiSelect=\"false\" text=\"{i18n>masterFilterName}\">\
									<items>\
										<ViewSettingsItem id=\"viewFilter1\" key=\"Filter1\" text=\"{i18n>masterFilter1}\"/>\
										<ViewSettingsItem id=\"viewFilter2\" key=\"Filter2\" text=\"{i18n>masterFilter2}\"/>\
									</items>\
								</ViewSettingsFilterItem>\
							</filterItems>\
						</ViewSettingsDialog>\
					</core:FragmentDefinition>";

				sFragmentGeneralDataEditCompany =
					"<core:FragmentDefinition  xmlns=\"sap.m\"  xmlns:core=\"sap.ui.core\"  xmlns:form=\"sap.ui.layout.form\">\
							<form:FormElement id=\"name1\" visible=\"{parts:['category', 'constants>/accountCategoryPerson'], formatter: 'cus.crm.myaccounts.util.formatter.isUnequal'}\">\
							<form:fields>\
								<Input value=\"{name1}\" maxLength=\"40\" id=\"name1Input\" liveChange=\"onName1InputFieldChanged\"/>\
								<core:ExtensionPoint name=\"extDummy1\" />\
							</form:fields>\
						</form:FormElement>\
					</core:FragmentDefinition>";
				/* eslint-enable no-multi-str */

				oViewMain = {
					"name": "Main",
					"resourceContent": sViewMain,
					"extensionPoints": [],
					"controlIds": [{
						"name": "fioriContent",
						"nodeName": "NavContainer"
					}],
					"id": "ui.s2p.mm.purchorder.approve.Main",
					"path": "MM_PO_APV%2fMain.view.xml",
					"resourceLocationPath": "webapp/",
					"type": ExtendUtil.EXT_TYPE_VIEW
				};

				oExtensionPointExtEditForm = {
					name: "extEditForm",
					nodeName: "core:ExtensionPoint"
				};

				oViewMainCustom = {
					"name": "MainCustom",
					"id": "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.MainCustom",
					"resourceContent": sViewMainCustom,
					"originalId": "ui.s2p.mm.purchorder.approve.Main",
					"originalName": "Main",
					"isExtended": true,
					"type": ExtendUtil.EXT_TYPE_VIEW,
					"resourceLocationPath": "webapp/"
				};

				oViewGeneralDataEdit = {
					"name": "GeneralDataEdit",
					"resourceContent": sViewGeneralDataEdit,
					"controlIds": [],
					"extensionPoints": [oExtensionPointExtEditForm],
					"id": "cus.crm.myaccounts.view.maintain.GeneralDataEdit",
					"path": "CRM_MYACCOUNTS%2fview%2fmaintain%2fGeneralDataEdit.view.xml",
					"resourceLocationPath": "view%2fmaintain",
					"type": ExtendUtil.EXT_TYPE_VIEW
				};
				
				oViewS2 = {
					"name": "S2",
					"resourceContent": sViewS2,
					"controlIds": [],
					"extensionPoints": [1], // Dummy content - just to have something in the array
					"id": "ui.s2p.mm.purchorder.approve.view.S2",
					"path": "MM_PO_APV%2fview%2fS2.view.xml",
					"resourceLocationPath": "webapp/view",
					"type": ExtendUtil.EXT_TYPE_VIEW
				};
				
				oViewS2Custom = {
					"name": "S2Custom",
					"id": "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.S2Custom",
					"resourceContent": sViewS2Custom,
					"extensionPoints": [1], // Dummy content - just to have something in the array
					"originalId": "ui.s2p.mm.purchorder.approve.S2",
					"originalName": "S2",
					"isExtended": true,
					"type": ExtendUtil.EXT_TYPE_VIEW,
					"resourceLocationPath": "webapp/view"
				};
				
				oViewS4 = {
					"name": "S4",
					"resourceContent": sViewS4,
					"controlIds": [],
					"extensionPoints": [2],
					"id": "ui.s2p.mm.purchorder.approve.view.S4",
					"path": "MM_PO_APV%2fview%2fS4.view.xml",
					"resourceLocationPath": "webapp/view",
					"type": ExtendUtil.EXT_TYPE_VIEW
				};				

				oControllerAccountAssignmentTable = {
					"name": "AccountAssignmentTable",
					"controllerJs": "/*\r\n * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved\r\n */\r\nsap.ui.controller(\"ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable\",{onInit:function(){}});\r\n",
					"id": "ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable",
					"path": "MM_PO_APV%2fview%2fAccountAssignmentTable.controller.js",
					"resourceLocationPath": "view%2f",
					"type": ExtendUtil.EXT_TYPE_CONTROLLER,
					"hooks": []
				};

				oControllerS2 = {
					"name": "S2",
					"controllerJs": "jQuery.sap.require(\"ui.s2p.mm.purchorder.approve.util.Conversions\");jQuery.sap.require(\"sap.ca.scfld.md.controller.ScfldMasterController\");sap.ca.scfld.md.controller.ScfldMasterController.extend(\"ui.s2p.mm.purchorder.approve.view.S2\", {	onInit: function() {if (this.extHookOnInit) {this.extHookOnInit(i);}}});",
					"id": "ui.s2p.mm.purchorder.approve.view.S2",
					"path": "MM_PO_APV%2fview%2fS2.controller.js",
					"resourceLocationPath": "view%2f",
					"type": ExtendUtil.EXT_TYPE_CONTROLLER,
					"hooks": [{
						"name": "extHookOnInit",
						"args": ["i"]
					}]
				};
			
				oControllerS2Custom = {
					"name": "S2Custom",
					"id": "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.view.S2Custom",
					"resourceContent": "sap.ui.controller(\"ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.view.S2Custom\", {extHookDefineSearchableUITextsForMasterListSearch: function(i) {}});",
					"originalId": "ui.s2p.mm.purchorder.approve.view.S2",
					"originalName": "S2",
					"isExtended": true,
					"type": "controller",
					"hooks": [{
						"name": "extHookDefineSearchableUITextsForMasterListSearch",
						"args": ["i"]
					}, {
						"name": "extHookModifySearchableODataFieldsForMasterListSearch",
						"args": ["o"]
					}, {
						"name": "extHookOnInit",
						"args": []
					}, {
						"name": "extHookSetHeaderFooterOptions",
						"args": ["l"]
					}],
					"resourceLocationPath": "webapp/view%2f",
					"newResourceName": "S2Custom"
				};

				oFragmentViewSettingsDialog = {
					"name": "ViewSettingsDialog",
					"fragmentXml": sFragmentViewSettingsDialog,
					"extensionPoints": [],
					"controlIds": [{
						"name": "viewSettingsDialog",
						"nodeName": "ViewSettingsDialog"
					}],
					"id": "ns2.view.ViewSettingsDialog",
					"path": "MM_PO_APV%2fview%2fViewSettingsDialog.fragment.xml",
					"resourceLocationPath": "view%2f",
					"type": ExtendUtil.EXT_TYPE_FRAGMENT
				};

				oViewGeneralDataEditCompany = {
					"name": "GeneralDataEditCompany",
					"fragmentXml": sFragmentGeneralDataEditCompany,
					"extensionPoints": [],
					"controlIds": [],
					"id": "cus.crm.myaccounts.view.maintain.GeneralDataEditCompany",
					"path": "CRM_MYACCOUNTS%2fview%2fmaintain%2fGeneralDataEditCompany.fragment.xml",
					"resourceLocationPath": "view%2fmaintain",
					"type": ExtendUtil.EXT_TYPE_FRAGMENT
				};
			}
			
			function initTreeAndResources(oExtensionProjectDocument, oExtensibilityModel) {
				resetResources();
				oExtensionProjectTree = new ExtensionProjectTree(oContext, oExtensionProjectDocument, oExtensibilityModel);
			}
			
			function overwriteExtensionsAndResourcesGetters(aResourceInfo) {
				// Mock the resources info
				oExtensionProjectTree._aResourcesInfo = aResourceInfo;

				// Mock the extensions (this update calls internally getAllExtensions)
				return oExtensionProjectTree._updateCustomization();
			}

			describe("Create tree model", function() {
				beforeEach(function() {
					initTreeAndResources(dummyExtProjectDocument);
				});

				function expectRootNode(oNode, sType) {
					expect(oNode.isExtended).to.be.false;
					expect(oNode.isExtendable).to.be.false;
					expect(oNode.isRoot).to.be.true;
					expect(oNode.type).to.equal(sType);
				}

				function expectViewOrFragment(oView, oResourceInfo, sType, bExtended) {
					expect(oView.isExtended).to.equal(bExtended);
					expect(oView.isExtendable).to.equal(sType === ExtendUtil.EXT_TYPE_VIEW);
					expect(oView.type).to.equal(sType);
					// expect(oView.resourceInfo).to.deep.equal(oResourceInfo);
					expect(oView.resourceInfo.id).to.equal(oResourceInfo.id);
					expect(oView.customizationId).to.equal("sap.ui.viewReplacements");
					expect(oView.componentId).to.equal("fioriexttemplate.replaceviewcomponent");
				}

				function expectController(oController, oResourceInfo, bExtended) {
					expect(oController.isExtended).to.equal(bExtended);
					expect(oController.isExtendable).to.be.true;
					expect(oController.type).to.equal(ExtendUtil.EXT_TYPE_CONTROLLER);
					expect(oController.resourceInfo).to.deep.equal(oResourceInfo);
					expect(oController.customizationId).to.equal("sap.ui.controllerExtensions");
					expect(oController.componentId).to.equal("fioriexttemplate.extendcontrollercomponent");
				}
				
				function expectHook(oHook, sHookName, aArgs, bExtended) {
					expect(oHook.isVisible).to.be.true;
					expect(oHook.isExtended).to.equal(bExtended);
					expect(oHook.isExtendable).to.be.true;
					expect(oHook.type).to.equal(ExtendUtil.EXT_TYPE_HOOK);
					expect(oHook.attributes.id).to.equal(sHookName);
					expect(oHook.extensionHookArgs).to.deep.equal(aArgs);
					expect(oHook.componentId).to.equal("fioriexttemplate.extendcontrollerhook");
					expect(oHook.extensionId).to.equal(sHookName);
				}

				function expectControl(oNode, sType, sExtensionId, oResourceInfo, bExtendable, bExtended) {
					expect(oNode.isVisible).to.be.true;
					expect(oNode.isAggregation).to.be.false;
					expect(oNode.isExtended).to.equal(bExtended);
					expect(oNode.isExtendable).to.equal(bExtendable);
					expect(oNode.type).to.equal(sType);
					expect(oNode.resourceInfo).to.deep.equal(oResourceInfo);
					if (bExtendable) { // If not extendable, the following properties aren't relevant
						expect(oNode.customizationId).to.equal("sap.ui.viewModifications");
						expect(oNode.componentId).to.equal("fioriexttemplate.hidecontrolcomponent");
						expect(oNode.extensionId).to.equal(sExtensionId);
					}
				}

				function expectAggregation(oNode, sAggregationName, oResourceInfo) {
					expect(oNode.isVisible).to.be.false;
					expect(oNode.isAggregation).to.be.true;
					expect(oNode.isExtended).to.be.false;
					expect(oNode.isExtendable).to.be.false;
					expect(oNode.type).to.equal(sAggregationName);
					expect(oNode.resourceInfo).to.deep.equal(oResourceInfo);
				}
				
				function expectExtensionPoint(oExtensionPoint, sId, oResourceInfo, bExtended) {
					expect(oExtensionPoint.isVisible).to.be.false;
					expect(oExtensionPoint.isAggregation).to.be.false;
					expect(oExtensionPoint.isExtended).to.equal(bExtended);
					expect(oExtensionPoint.isExtendable).to.be.true;
					expect(oExtensionPoint.type).to.equal(ExtendUtil.EXT_TYPE_EXT_POINT);
					expect(oExtensionPoint.resourceInfo).to.deep.equal(oResourceInfo);
					expect(oExtensionPoint.customizationId).to.equal("sap.ui.viewExtensions");
					expect(oExtensionPoint.componentId).to.equal("fioriexttemplate.extendviewcomponent");
					expect(oExtensionPoint.extensionId).to.equal(sId);
				}

				it("Views and their content, without extensions", function() {
					return overwriteExtensionsAndResourcesGetters([oViewMain, oViewGeneralDataEdit]).then(function() {
						var oActualModel = oExtensionProjectTree._createTreeModel();
	
						// Root nodes
						var oViews = oActualModel.getData().childTreeNodeModels[0];
						expect(oViews.childTreeNodeModels.length).to.equal(2);
						expectRootNode(oViews, ExtendUtil.EXT_TYPE_VIEW);
						// No fragments and controllers
						expect(oActualModel.getData().childTreeNodeModels[1].childTreeNodeModels.length).to.equal(0);
						expect(oActualModel.getData().childTreeNodeModels[2].childTreeNodeModels.length).to.equal(0);
	
						// 'Main' view
						expectViewOrFragment(oViews.childTreeNodeModels[0], oViewMain, ExtendUtil.EXT_TYPE_VIEW, false);
	
						// 'GeneralDataEdit' view
						expectViewOrFragment(oViews.childTreeNodeModels[1], oViewGeneralDataEdit, ExtendUtil.EXT_TYPE_VIEW, false);
						// 'GeneralDataEdit' -> 'View' -> 'Page'
						var oPageControl = oViews.childTreeNodeModels[1].childTreeNodeModels[0];
						expectControl(oPageControl, "page", "page", oViewGeneralDataEdit, true, false);
						// 'GeneralDataEdit' -> 'View' -> 'Page' -> 'content'
						var oPageContentAggregation = oPageControl.childTreeNodeModels[0];
						expectAggregation(oPageContentAggregation, "content", oViewGeneralDataEdit);
						// 'GeneralDataEdit' -> 'View' -> 'Page' -> 'content' -> 'Grid'
						var oGridControl = oPageContentAggregation.childTreeNodeModels[0];
						expectControl(oGridControl, "grid", null, oViewGeneralDataEdit, false, false); // False since grid doesn't have an ID
						// 'GeneralDataEdit' -> 'View' -> 'Page' -> 'content' -> 'Grid' -> 'content'
						var oGridContentAggregation = oGridControl.childTreeNodeModels[0];
						expectAggregation(oGridContentAggregation, "content", oViewGeneralDataEdit);
						// 'GeneralDataEdit' -> 'View' -> 'Page' -> 'content' -> 'Grid' -> 'content' -> 'ExtensionPoint'
						var oExtensionPoint = oGridContentAggregation.childTreeNodeModels[0];
						expectExtensionPoint(oExtensionPoint, "extEditForm", oViewGeneralDataEdit, false);
						// The fragment node inside the view
						var oFragmentNode = oExtensionPoint.childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[1].childTreeNodeModels[0].childTreeNodeModels[0];
						expect(oFragmentNode.isExtendable).to.be.false;
						expect(oFragmentNode.isExtended).to.be.false;
						expect(oFragmentNode.isAggregation).to.be.false;
						expect(oFragmentNode.isVisible).to.be.false;
						expect(oFragmentNode.type).to.equal(ExtendUtil.EXT_TYPE_FRAGMENT);
						expect(oFragmentNode.attributes.fragmentName).to.equal("cus.crm.myaccounts.view.maintain.GeneralDataEditCompany");
						expect(oFragmentNode.attributes.id).to.equal("companyFragment");
						expect(oFragmentNode.attributes.type).to.equal("XML");
					});
				});

				it("Fragment, without extensions", function() {
					return overwriteExtensionsAndResourcesGetters([oFragmentViewSettingsDialog]).then(function() {
						var oActualModel = oExtensionProjectTree._createTreeModel();
	
						// Root nodes
						var oFragments = oActualModel.getData().childTreeNodeModels[1];
						expect(oFragments.childTreeNodeModels.length).to.equal(1);
						expectRootNode(oFragments, ExtendUtil.EXT_TYPE_FRAGMENT);
						// No views and controllers
						expect(oActualModel.getData().childTreeNodeModels[0].childTreeNodeModels.length).to.equal(0);
						expect(oActualModel.getData().childTreeNodeModels[2].childTreeNodeModels.length).to.equal(0);
	
						// 'ViewSettingsDialog' fragment
						expectViewOrFragment(oFragments.childTreeNodeModels[0], oFragmentViewSettingsDialog, ExtendUtil.EXT_TYPE_FRAGMENT, false);
					});
				});
				
				it("Controllers and hooks, without extensions", function() {
					return overwriteExtensionsAndResourcesGetters([oControllerAccountAssignmentTable, oControllerS2]).then(function() {
						var oActualModel = oExtensionProjectTree._createTreeModel();
	
						// Root nodes
						var oControllers = oActualModel.getData().childTreeNodeModels[2];
						expect(oControllers.childTreeNodeModels.length).to.equal(2);
						expectRootNode(oControllers, ExtendUtil.EXT_TYPE_CONTROLLER);
						// No views and fragments
						expect(oActualModel.getData().childTreeNodeModels[0].childTreeNodeModels.length).to.equal(0);
						expect(oActualModel.getData().childTreeNodeModels[1].childTreeNodeModels.length).to.equal(0);
	
						// 'AccountAssignmentTable' controller
						expectController(oControllers.childTreeNodeModels[0], oControllerAccountAssignmentTable, false);
	
						// 'S2' controller
						expectController(oControllers.childTreeNodeModels[1], oControllerS2, false);
						var oHookNode = oControllers.childTreeNodeModels[1].childTreeNodeModels[0];
						expectHook(oHookNode, "extHookOnInit", ["i"], false);
					});
				});
				
				describe("Including customizations", function() {
					it("With replaced view", function() {
						return overwriteExtensionsAndResourcesGetters([oViewMainCustom]).then(function() {
							var oActualModel = oExtensionProjectTree._createTreeModel();
							var oViews = oActualModel.getData().childTreeNodeModels[0];
							expectViewOrFragment(oViews.childTreeNodeModels[0], oViewMainCustom, ExtendUtil.EXT_TYPE_VIEW, true);
						});	
					});

					it("With replaced controller", function() {
						return overwriteExtensionsAndResourcesGetters([oControllerS2Custom]).then(function() {
							var oActualModel = oExtensionProjectTree._createTreeModel();
							var oControllers = oActualModel.getData().childTreeNodeModels[2];
							expectController(oControllers.childTreeNodeModels[0], oControllerS2Custom, true);
						});
					});
					
					it("With controller hook", function() {
						return overwriteExtensionsAndResourcesGetters([oControllerS2Custom]).then(function() {
							var oActualModel = oExtensionProjectTree._createTreeModel();
							var oControllers = oActualModel.getData().childTreeNodeModels[2];
							var oHookNode = oControllers.childTreeNodeModels[0].childTreeNodeModels[0];
							expectHook(oHookNode, "extHookDefineSearchableUITextsForMasterListSearch", ["i"], true);
						});
					});

					it("With hide control", function() {
						oAllExtensions = {
							"sap.ui.viewModifications": {
								"ui.s2p.mm.purchorder.approve.Main": {
									"fioriContent": {
										"visible": false
									}
								}
							}
						};
						return overwriteExtensionsAndResourcesGetters([oViewMain]).then(function() {
							var oActualModel = oExtensionProjectTree._createTreeModel();
							var oNavContainerNode = oActualModel.getData().childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[0];
							expectControl(oNavContainerNode, "navcontainer", "fioriContent", oViewMain, true, true);
						});
					});
					
					it("With extension point", function() {
						oAllExtensions = {
							"sap.ui.viewExtensions": {
								"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
									"extEditForm": {
										"className": "sap.ui.core.Fragment",
										"fragmentName": "cus.crm.myaccounts.CRM_MYACCOUNTSExtension.view.maintain.GeneralDataEdit_extEditFormCustom",
										"type": "XML"
									}
								}
							}
						};
						return overwriteExtensionsAndResourcesGetters([oViewGeneralDataEdit]).then(function() {
							var oActualModel = oExtensionProjectTree._createTreeModel();
							var oViews = oActualModel.getData().childTreeNodeModels[0];
							// 'GeneralDataEdit' -> 'View' -> 'Page' -> 'content' -> 'Grid' -> 'content' -> 'ExtensionPoint'
							var oExtensionPoint = oViews.childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[0].childTreeNodeModels[0];
							expectExtensionPoint(oExtensionPoint, "extEditForm", oViewGeneralDataEdit, true);
						});
					});
				});		
			});

			describe("Select or set hover in tree", function() {
				var oUiContent;

				beforeEach(function() {
					initTreeAndResources(dummyExtProjectDocument);
					// Mock the extensions
					oExtensionProjectTree._getExtensionsFromExtensionProject = function() {
						return Q({});
					};

					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewMain, oViewGeneralDataEdit, oControllerAccountAssignmentTable, oControllerS2,
							oFragmentViewSettingsDialog, oViewGeneralDataEditCompany
						];

						return Q(resourceInfo);
					};

					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
					});
				});

				function expectNoSelectionAndHover() {
					expect(oExtensionProjectTree._tree.getSelection()).to.be.null;
					expect(oExtensionProjectTree._hoverNode).to.be.null;
				}

				function expectSelectionWithoutHover(oSelectedNode, sResourceID) {
					expect(oSelectedNode.getBindingContext().getObject().resourceInfo.id).to.be.equal(sResourceID);
					expect(oExtensionProjectTree._hoverNode).to.be.null;
				}

				function expectHoverWithoutSelection(sResourceID) {
					expect(oExtensionProjectTree._tree.getSelection()).to.be.null;
					expect(oExtensionProjectTree._hoverNode.hasStyleClass("hoveredNode")).to.be.true;
					expect(oExtensionProjectTree._hoverNode.getBindingContext().getObject().resourceInfo.id).to.be.equal(sResourceID);
				}

				it("Selection on view, without control and type", function() {
					var sResourceID = oViewMain.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sResourceID);
					expectSelectionWithoutHover(oExtensionProjectTree._tree.getSelection(), sResourceID);
				});

				it("Selection on view, without control", function() {
					var sResourceID = oViewMain.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sResourceID, null, ExtendUtil.EXT_TYPE_VIEW);
					expectSelectionWithoutHover(oExtensionProjectTree._tree.getSelection(), sResourceID);
				});

				it("Selection on view", function() {
					var sResourceID = oViewMain.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sResourceID, "fioriContent", ExtendUtil.EXT_TYPE_VIEW);
					expectSelectionWithoutHover(oExtensionProjectTree._tree.getSelection(), sResourceID);
				});

				it("Hover on view", function() {
					var sResourceID = oViewMain.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement(sResourceID, "fioriContent", ExtendUtil.EXT_TYPE_VIEW);
					expectHoverWithoutSelection(sResourceID);
				});

				it("Selection on fragment", function() {
					var sViewID = oViewGeneralDataEdit.id;
					var sFragmentID = oViewGeneralDataEditCompany.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sViewID, "name1Input", ExtendUtil.EXT_TYPE_VIEW);
					expectSelectionWithoutHover(oExtensionProjectTree._tree.getSelection(), sFragmentID);
				});

				it("Hover on fragment", function() {
					var sViewID = oViewGeneralDataEdit.id;
					var sFragmentID = oViewGeneralDataEditCompany.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement(sViewID, "name1Input", ExtendUtil.EXT_TYPE_VIEW);
					expectHoverWithoutSelection(sFragmentID);
				});

				it("Selection on controller, without control", function() {
					var sResourceID = oControllerAccountAssignmentTable.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sResourceID, null, ExtendUtil.EXT_TYPE_CONTROLLER);
					expectSelectionWithoutHover(oExtensionProjectTree._tree.getSelection(), sResourceID);
				});

				it("Selection on controller with control - not supported, so there is no selection", function() {
					var sResourceID = oControllerS2.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.selectTreeElement(sResourceID, "extHookOnInit", ExtendUtil.EXT_TYPE_CONTROLLER);
					expect(oExtensionProjectTree._tree.getSelection()).to.be.null;
					expect(oExtensionProjectTree._hoverNode).to.be.null;
				});

				it("Hover on controller", function() {
					var sResourceID = oControllerS2.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement(sResourceID, null, ExtendUtil.EXT_TYPE_CONTROLLER);
					expectHoverWithoutSelection(sResourceID);
				});

				it("Clear previous seleced node", function() {
					var oNode = new sap.ui.commons.TreeNode({
						text: "dummy"
					}).addStyleClass("hoveredNode");
					oExtensionProjectTree._hoverNode = oNode;
					oExtensionProjectTree.selectTreeElement("dummy2");
					expect(oExtensionProjectTree._hoverNode.hasStyleClass("hoveredNode")).to.be.false;
				});

				it("Requested resource doesn't exist in tree", function() {
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement("dummy");
					expectNoSelectionAndHover();
				});

				it("No input arguments", function() {
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement();
					expectNoSelectionAndHover();
				});

				it("No input arguments", function() {
					expectNoSelectionAndHover();
					oExtensionProjectTree.hoverOnTreeElement();
					expectNoSelectionAndHover();
				});

				it("No nodes in the tree", function() {
					var sResourceID = oControllerS2.id;
					expectNoSelectionAndHover();
					oExtensionProjectTree._tree.removeAllNodes();
					oExtensionProjectTree.hoverOnTreeElement(sResourceID);
					expectNoSelectionAndHover();
				});

				afterEach(function() {
					// Clear the controls - otherwise we get a duplicate id error from UI5
					if (oUiContent) {
						oUiContent.top.destroy();
						oUiContent.middle.destroy();
					}
				});
			});
			
			describe("Extend selected element", function() {
				var oUiContent;
				
				function init(sResourceName, sResourceType) {
					// resetResources();
					oContext.service.template.getTemplates = function() {
						var oTemplate = {
							"fioriexttemplate.extendcontrollercomponent" : {},
							"fioriexttemplate.extendviewcomponent" : {},
							"fioriexttemplate.extendcontrollerhook" : {},
							"fioriexttemplate.hidecontrolcomponent" : {},
							"fioriexttemplate.replaceviewcomponent" : {}
						};
						return Q(oTemplate);
					};
					
					var oProjectDocument = new MockDocument("RootFolder", null, null, null);
					var oMockDocument = new MockDocument(sResourceName, sResourceType, "", oProjectDocument);
					var oExtensibilityModel = {};
			
					initTreeAndResources(oMockDocument, oExtensibilityModel);
					// Mock the extensions
					oExtensionProjectTree._getExtensionsFromExtensionProject = function() {
						return Q({});
					};

					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewMain, oViewGeneralDataEdit, oControllerAccountAssignmentTable, oControllerS2,
							oFragmentViewSettingsDialog, oViewGeneralDataEditCompany
						];

						return Q(resourceInfo);
					};

					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
					});
				}
				
				function verifyCommonModelProperties(oNodeModelData, sComponentId, sCustomizationId, sType, sResourceInfoId, sResourceInfoName, sResourceInfoPath) {
					expect(oNodeModelData).to.exist;
					expect(oNodeModelData.componentId).to.equal(sComponentId);
					expect(oNodeModelData.customizationId).to.equal(sCustomizationId);
					expect(oNodeModelData.isExtended).to.be.true;
					expect(oNodeModelData.type).to.equal(sType);
					expect(oNodeModelData.resourceInfo).to.exist;
					expect(oNodeModelData.resourceInfo.id).to.equal(sResourceInfoId);
					expect(oNodeModelData.resourceInfo.name).to.equal(sResourceInfoName);
					expect(oNodeModelData.resourceInfo.path).to.equal(sResourceInfoPath);
				}
				
				it("Try to extend with no selection in the tree", function() {
					return init().then(function() {
						// the promise should get rejected
						return oExtensionProjectTree.extendSelectedElement().then(function() {
							expect(true).to.equal(false); // make sure the test fails if it gets here
						}).fail(function(oError) {
							expect(oError.message).to.equal("The provided extension type is not applicable for the selected node, or no node was selected");
						});
					});
				});
				
				it("Try to extend a View with an extension type of Controller", function() {
					return init().then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						
						// the promise should get rejected
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXT_TYPE_CONTROLLER).then(function() {
							expect(true).to.equal(false); // make sure the test fails if it gets here
						}).fail(function(oError) {
							expect(oError.message).to.equal("The provided extension type is not applicable for the selected node, or no node was selected");
						});
					});
				});
				
				it("Try to extend a View with an unknown extension type", function() {
					return init().then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						
						// the promise should get rejected
						return oExtensionProjectTree.extendSelectedElement("blabla").then(function() {
							expect(true).to.equal(false); // make sure the test fails if it gets here
						}).fail(function(oError) {
							expect(oError.message).to.equal("The provided extension type is not applicable for the selected node, or no node was selected");
						});
					});
				});
				
				it("Replace a view with empty", function() {
					oAllExtensions = {
						"sap.ui.viewReplacements": {
							"ui.s2p.mm.purchorder.approve.Main": {
								"viewName": "view.MainCustom",
								"type": "XML"
							}
						}
					};
		
					return init("S2", "XML").then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_EMPTY).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.replaceviewcomponent", "sap.ui.viewReplacements", ExtendUtil.EXT_TYPE_VIEW,
																		"ui.s2p.mm.purchorder.approve.Main", "Main", "MM_PO_APV%2fMain.view.xml");
							
							expect(oNodeModelData.resourceInfo.newResourceName).to.equal("MainCustom");
						});
					});
				});
				
				it("Replace a view with copy of original view", function() {
					return init("S2", "XML").then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_COPY).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.replaceviewcomponent", "sap.ui.viewReplacements", ExtendUtil.EXT_TYPE_VIEW,
																		"ui.s2p.mm.purchorder.approve.Main", "Main", "MM_PO_APV%2fMain.view.xml");
																		
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.replaceviewcomponent", "sap.ui.viewReplacements", ExtendUtil.EXT_TYPE_VIEW,
																		"ui.s2p.mm.purchorder.approve.Main", "Main", "MM_PO_APV%2fMain.view.xml");
						});
					});
				});
				
				it("Extend a controller with empty", function() {
					return init("S3", "JS").then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oControllerAccountAssignmentTable.id, null, ExtendUtil.EXT_TYPE_CONTROLLER);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_WITH_EMPTY).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.extendcontrollercomponent", "sap.ui.controllerExtensions", "controller",
																		"ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable", 
																		"AccountAssignmentTable", "MM_PO_APV%2fview%2fAccountAssignmentTable.controller.js");
																		
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.extendcontrollercomponent", "sap.ui.controllerExtensions", "controller",
																	"ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable", 
																	"AccountAssignmentTable", "MM_PO_APV%2fview%2fAccountAssignmentTable.controller.js");
						});
					});
				});
				
				it("Extend a controller with copy of original controller", function() {
					return init("S3", "JS").then(function() {
						// first select the view we wish to extend
						oExtensionProjectTree.selectTreeElement(oControllerAccountAssignmentTable.id, null, ExtendUtil.EXT_TYPE_CONTROLLER);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_WITH_COPY).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.extendcontrollercomponent", "sap.ui.controllerExtensions", "controller",
																		"ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable", 
																		"AccountAssignmentTable", "MM_PO_APV%2fview%2fAccountAssignmentTable.controller.js");
																		
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.extendcontrollercomponent", "sap.ui.controllerExtensions", "controller",
																		"ui.s2p.mm.purchorder.approve.view.AccountAssignmentTable", 
																		"AccountAssignmentTable", "MM_PO_APV%2fview%2fAccountAssignmentTable.controller.js");
						});
					});
				});
				
				it("Extend an extension point", function() {
					oAllExtensions = {
						"sap.ui.viewExtensions": {
							"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
								"extEditForm": {
									"className": "sap.ui.core.Fragment",
									"fragmentName": "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.view.GeneralDataEdit_extEditFormCustom",
									"type": "XML"
								}
							}
						}
					};
					return init("frag", "XML").then(function() {
						// first select the extension point we wish to extend
						oExtensionProjectTree.selectTreeElement(oViewGeneralDataEdit.id, oViewGeneralDataEdit.extensionPoints[0].name);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.EXTEND_VIEW).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.extendviewcomponent", "sap.ui.viewExtensions", "extensionpoint",
																		"cus.crm.myaccounts.view.maintain.GeneralDataEdit", 
																		"GeneralDataEdit", "CRM_MYACCOUNTS%2fview%2fmaintain%2fGeneralDataEdit.view.xml");
																		
							expect(oNodeModelData.resourceInfo.filePath).to.equal("view/maintainGeneralDataEdit_extEditFormCustom.fragment.xml");
							
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.extendviewcomponent", "sap.ui.viewExtensions", "extensionpoint",
																		"cus.crm.myaccounts.view.maintain.GeneralDataEdit", 
																		"GeneralDataEdit", "CRM_MYACCOUNTS%2fview%2fmaintain%2fGeneralDataEdit.view.xml");
																		
							expect(oSelectedModelData.resourceInfo.filePath).to.equal("view/maintainGeneralDataEdit_extEditFormCustom.fragment.xml");
							
						});
					});
				});
				
				it("Hide a control", function() {
					return init("Main", "XML").then(function() {
						// first select the control we wish to hide
						oExtensionProjectTree.selectTreeElement(oViewMain.id, oViewMain.controlIds[0].name);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.HIDE_CONTROL).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.hidecontrolcomponent", "sap.ui.viewModifications", "navcontainer",
																		"ui.s2p.mm.purchorder.approve.Main", "Main", "MM_PO_APV%2fMain.view.xml");
																		
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.hidecontrolcomponent", "sap.ui.viewModifications", "navcontainer",
																		"ui.s2p.mm.purchorder.approve.Main", "Main", "MM_PO_APV%2fMain.view.xml");
						});
					});
				});
				
				it("Extend a Controller Hook", function() {
					return init("S2", "JS").then(function() {
						// first select the controller hook we wish to hide
						oExtensionProjectTree.selectTreeElement(oControllerS2.id, oControllerS2.hooks[0].name);
						
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_HOOK).then(function(oNodeModelData) {
							verifyCommonModelProperties(oNodeModelData, "fioriexttemplate.extendcontrollerhook", undefined, "hook",
																		"ui.s2p.mm.purchorder.approve.view.S2", "S2", "MM_PO_APV%2fview%2fS2.controller.js");
						
							var oSelectedModelData = oExtensionProjectTree.getSelectedElementData();
							verifyCommonModelProperties(oSelectedModelData, "fioriexttemplate.extendcontrollerhook", undefined, "hook",
																		"ui.s2p.mm.purchorder.approve.view.S2", "S2", "MM_PO_APV%2fview%2fS2.controller.js");
						});
					});
				});
				
				it("Replace a view with copy and then try to hide a control in the replaced view", function() {
					return init("Main", "XML").then(function() {
						// first select the view we wish to replace
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						// replace the view with copy
						oAllExtensions = {
							"sap.ui.viewReplacements": {
								"ui.s2p.mm.purchorder.approve.Main": {
									"viewName": "view.MainCustom",
									"type": "XML"
								}
							}
						};
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_COPY).then(function() {
							// then select the control we wish to hide
							oExtensionProjectTree.selectTreeElement(oViewMain.id, oViewMain.controlIds[0].name);
							// and try to hide it
							return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.HIDE_CONTROL).then(function() {
								expect(true).to.equal(false); // make sure the test fails if it gets here
							}).fail(function(oError) {
								expect(oError.message).to.equal("The provided extension type is not applicable for the selected node, or no node was selected");
							});
						});
					});
				});
				
				it("Replace a view with copy and then try to replace it again with empty", function() {
					return init("Main", "XML").then(function() {
						// first select the view we wish to replace
						oExtensionProjectTree.selectTreeElement(oViewMain.id);
						// replace the view with copy
						oAllExtensions = {
							"sap.ui.viewReplacements": {
								"ui.s2p.mm.purchorder.approve.Main": {
									"viewName": "view.MainCustom",
									"type": "XML"
								}
							}
						};
						return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_COPY).then(function() {
							// then select the control we wish to hide
							oExtensionProjectTree.selectTreeElement(oViewMain.id, oViewMain.controlIds[0].name);
							// and try to hide it
							return oExtensionProjectTree.extendSelectedElement(ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_EMPTY).then(function() {
								expect(true).to.equal(false); // make sure the test fails if it gets here
							}).fail(function(oError) {
								expect(oError.message).to.equal("The provided extension type is not applicable for the selected node, or no node was selected");
							});
						});
					});
				});
				
				afterEach(function() {
					// Clear the controls - otherwise we get a duplicate id error from UI5
					if (oUiContent) {
						oUiContent.top.destroy();
						oUiContent.middle.destroy();
					}
				});
			});	
			
			describe("Remove Extension from selected element", function() {
				var oUiContent;
				
				function init(sResourceName, sResourceType) {
					var oProjectDocument = new MockDocument("RootFolder", null, null, null);
					var oMockDocument = new MockDocument(sResourceName, sResourceType, "", oProjectDocument);
					var oExtensibilityModel = {};
			
					initTreeAndResources(oMockDocument, oExtensibilityModel);
					// Mock the extensions
					oExtensionProjectTree._getExtensionsFromExtensionProject = function() {
						return Q({});
					};

					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewMain, oViewGeneralDataEdit, oControllerAccountAssignmentTable, oControllerS2, 
							oFragmentViewSettingsDialog, oViewGeneralDataEditCompany
						];

						return Q(resourceInfo);
					};

					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
					});
				}
				
				function mockIsExtendedByNodeMethod(bIsExtended) {
					ExtendUtil.isExtendedByNode = function() {
						return bIsExtended;
					};
				}
				
				beforeEach(function() {
					return init().then(function() {
						ExtendUtil.removeExtension = function() {
							return Q({});
						};
					});
				});
				
				it("Try to remove an extension when no node is selected", function() {
					// the promise should get rejected because there isn't any node selected
					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function() {
						expect(true).to.equal(false); // make sure the test fails if it gets here
					}).fail(function(oError) {
						expect(oError.message).to.equal("Remove extension is not applicable for the selected node, or no node was selected");
					});
				});
				
				it("Remove an extension from a selected view", function() {
					// mark the view as extended
					mockIsExtendedByNodeMethod(true);
					// select the extended view
					oExtensionProjectTree.selectTreeElement(oViewMain.id);

					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function(oNodeModelData) {
						expect(oNodeModelData.isExtended).to.be.false;
					});
				});
				
				it("Remove an extension from a selected controller", function() {
					// mark the controller as extended
					mockIsExtendedByNodeMethod(true);
					// select the extended controller
					oExtensionProjectTree.selectTreeElement(oControllerS2.id, undefined, ExtendUtil.EXT_TYPE_CONTROLLER);

					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function(oNodeModelData) {
						expect(oNodeModelData.isExtended).to.be.false;
					});
				});

				it("Remove an extension from a selected controller hook", function() {
					ExtendUtil.removeHookExtension = function() {
						return Q();
					};				
					// mark the controller hook as extended
					mockIsExtendedByNodeMethod(true);
					// select the extended controller hook
					oExtensionProjectTree.selectTreeElement(oControllerS2.id, oControllerS2.hooks[0].name);

					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function(oNodeModelData) {
						expect(oNodeModelData.isExtended).to.be.false;
					});
				});				
				
				it("Remove an extension from a selected control", function() {
					// mark the control as extended
					mockIsExtendedByNodeMethod(true);
					// select the extended control
					oExtensionProjectTree.selectTreeElement(oViewMain.id, oViewMain.controlIds[0].name);
					
					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function(oNodeModelData) {
						expect(oNodeModelData.isExtended).to.be.false;
					});
				});
				
				it("Remove an extension from a selected node that isn't extended", function() {
					// don't mark the control as extended
					mockIsExtendedByNodeMethod(false);
					// select the control
					oExtensionProjectTree.selectTreeElement(oViewMain.id, oViewMain.controlIds[0].name);
					
					return oExtensionProjectTree.removeExtensionFromSelectedElement().then(function() {
						expect(true).to.equal(false); // make sure the test fails if it gets here
					}).fail(function(oError) {
						expect(oError.message).to.equal("Remove extension is not applicable for the selected node, or no node was selected");
					});
				});
				
				afterEach(function() {
					// Clear the controls - otherwise we get a duplicate id error from UI5
					if (oUiContent) {
						oUiContent.top.destroy();
						oUiContent.middle.destroy();
					}
				});
			});
	
			describe("Get all extension points", function() {
				var oUiContent;
				
				beforeEach(function() {
					initTreeAndResources(dummyExtProjectDocument);
				});
				
				function expectExtensionPointFromGetAll(oExtensionPoint, sName, bExtended, sNextSibling, sPreviousSibling, sParent) {
					expect(oExtensionPoint.name).to.equal(sName);
					expect(oExtensionPoint.isExtended).to.equal(bExtended);
					if (sNextSibling) {
						expect(oExtensionPoint.nextSiblings[0]).to.equal(sNextSibling);
					} else {
						expect(oExtensionPoint.nextSiblings).to.equal(undefined);
					}
					if (sPreviousSibling) {
						expect(oExtensionPoint.previousSiblings[0]).to.equal(sPreviousSibling);
					} else {
						expect(oExtensionPoint.previousSiblings).to.equal(undefined);
					}
					expect(oExtensionPoint.parent).to.equal(sParent);
				}
				
				it("Collect all", function() {
					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewMain, oViewGeneralDataEdit, oViewS2, oViewGeneralDataEditCompany];
						return Q(resourceInfo);
					};					
					
					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
						var aActualExtensionPoints = oExtensionProjectTree.getAllExtensionPoints();
						expect(aActualExtensionPoints.views.length).to.equal(2);
						var oFirstExtensionPoint = aActualExtensionPoints.views[0];
						expect(oFirstExtensionPoint.name).to.equal("cus.crm.myaccounts.view.maintain.GeneralDataEdit");
						expect(oFirstExtensionPoint.extensionPoints.length).to.equal(2);
						expectExtensionPointFromGetAll(oFirstExtensionPoint.extensionPoints[0], "extEditForm", false, "label1", undefined, undefined);
						expectExtensionPointFromGetAll(oFirstExtensionPoint.extensionPoints[1], "extDummy1", false, undefined, "name1Input", undefined);
						var oSecondExtensionPoint = aActualExtensionPoints.views[1];
						expect(oSecondExtensionPoint.name).to.equal("ui.s2p.mm.purchorder.approve.view.S2");
						expect(oSecondExtensionPoint.extensionPoints.length).to.equal(1);
						expectExtensionPointFromGetAll(oSecondExtensionPoint.extensionPoints[0], "extListItemInfo", false, undefined, "label1", "sap.m:objectlistitem");
					});
				});

				it("Extension points with multiple siblings", function() {
					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewS4];
						return Q(resourceInfo);
					};					
					
					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
						var aActualExtensionPoints = oExtensionProjectTree.getAllExtensionPoints();
						var oFirstExtensionPoint = aActualExtensionPoints.views[0];
						expect(oFirstExtensionPoint.extensionPoints.length).to.equal(2);
						expect(oFirstExtensionPoint.extensionPoints[0].nextSiblings).to.deep.equal(["element1","element2","element3"]);
						expect(oFirstExtensionPoint.extensionPoints[1].previousSiblings).to.deep.equal(["element3","element2","element1"]);
					});
				});

				it("With extended extension point", function() {
					oAllExtensions = {
						"sap.ui.viewExtensions": {
							"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
								"extEditForm": {
									"className": "sap.ui.core.Fragment",
									"fragmentName": "cus.crm.myaccounts.CRM_MYACCOUNTSExtension.view.maintain.GeneralDataEdit_extEditFormCustom",
									"type": "XML"
								}
							}
						}
					};
					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewGeneralDataEdit, oViewGeneralDataEditCompany];
						return Q(resourceInfo);
					};
					oContext.i18n.getText = function() {
						return Q("(Extended)");
					};
					
					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
						var aActualExtensionPoints = oExtensionProjectTree.getAllExtensionPoints();
						expect(aActualExtensionPoints.views.length).to.equal(1);
						var oFirstExtensionPoint = aActualExtensionPoints.views[0];
						expect(oFirstExtensionPoint.name).to.equal("cus.crm.myaccounts.view.maintain.GeneralDataEdit");
						expect(oFirstExtensionPoint.extensionPoints.length).to.equal(2);
						expectExtensionPointFromGetAll(oFirstExtensionPoint.extensionPoints[0], "extEditForm (Extended)", true, undefined, undefined, undefined); // No prev/next for extended ext' point
					});
				});
				
				it("No extensions returned when exist in extended view", function() {
					oAllExtensions = {
						"sap.ui.viewReplacements": {
							"ui.s2p.mm.purchorder.approve.S2": {
								"viewName": "view.S2Custom",
								"type": "XML"
							}
						}
					};
					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [oViewS2Custom];
						return Q(resourceInfo);
					};					
					
					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
						var aActualExtensionPoints = oExtensionProjectTree.getAllExtensionPoints();
						expect(aActualExtensionPoints.views.length).to.equal(0);
					});					
				});
				
				it("No extensions when there are no resources", function() {
					// Mock the resources info
					oExtensionProjectTree._getParentResourcesInfo = function() {
						var resourceInfo = [];
						return Q(resourceInfo);
					};					
					
					// Create the tree
					return oExtensionProjectTree.createContent().then(function(_oUiContent) {
						oUiContent = _oUiContent;
						var aActualExtensionPoints = oExtensionProjectTree.getAllExtensionPoints();
						expect(aActualExtensionPoints.views.length).to.equal(0);
					});					
				});
				
				afterEach(function() {
					// Clear the controls - otherwise we get a duplicate id error from UI5
					if (oUiContent) {
						oUiContent.top.destroy();
						oUiContent.middle.destroy();
					}
				});
			});		
			/* eslint-enable no-unused-expressions */
			
			afterEach(function() {
				// Reset 
				oAllExtensions = {};
				oContext.i18n.getText = function() {
					return Q("");
				};				
			});
			
			describe("Opens extension code with the correct editor", function() {
				beforeEach(function() {
					initTreeAndResources(dummyExtProjectDocument, {});
					// Mock the tree and it's getSelection
					oExtensionProjectTree._tree = {getSelection: function() {
						return {};
					}};
				});

				it("Layout editor editor", function() {
					ExtendUtil.openLayoutEditor = function() {
						return Q(true);
					};					
					
					return oExtensionProjectTree.openExtensionCodeOfSelectedElement(true).then(function(bOpenedInLayoutEditor) {
						expect(bOpenedInLayoutEditor).to.equal(true);
					});					
				});
				
				it("Text editor editor", function() {
					ExtendUtil.openExtendedDocument = function() {
						return Q(true);
					};
					
					return oExtensionProjectTree.openExtensionCodeOfSelectedElement(false).then(function(bOpenedInTextEditor) {
						expect(bOpenedInTextEditor).to.equal(true);
					});					
				});				
			});

			describe("Gets parent view of fragment", function() {
				var oExtTree;
				beforeEach(function() {
					oExtTree = new ExtensionProjectTree(null, dummyExtProjectDocument);
					// Mock the map
					oExtTree._mFragmentToView = [];					
				});

				it("Finds the parent view", function() {
					// Mock the map
					var sFragmentName = "fragment1";
					var sViewName = "view1";
					oExtTree._mFragmentToView[sFragmentName] = sViewName;
					
					var sActualViewName = oExtTree.getParentViewOfFragment(sFragmentName);
					expect(sActualViewName).to.equal(sViewName);
				});
				
				it("Parent view doesn't exist", function() {
					var sActualViewName = oExtTree.getParentViewOfFragment("fragment1");
					expect(sActualViewName).to.equal("");
				});				
			});
			
			describe("Handles selection after filter", function() {
				var oExtTree;
				beforeEach(function() {
					oExtTree = new ExtensionProjectTree(null, dummyExtProjectDocument);
				});

				it("Ancestors are set to be expanded", function() {
					var oFakeTree = {
						oParent: {
							setExpanded: function(bExpanded) {
								this.bExpended = bExpanded;
							},
							bExpended: false,
							oParent: {
								setExpanded: function(bExpanded) {
									this.bExpended = bExpanded;
								},
								bExpended: false,
								oParent: null
							}
						},
						getBindingContext: function () {
							return {};
						}
					};
					oExtTree._tree = {
						getSelection: function() {
							return oFakeTree;
						},
						fireSelect : function() {

						}
					};

					oExtTree._handleSelectionAfterFilter();
					expect(oFakeTree.oParent.bExpended).to.equal(true);
					expect(oFakeTree.oParent.oParent.bExpended).to.equal(true);
				});
				
				it("No selected node - selection is fired", function() {
					var bSelectionFired = false;
					oExtTree._tree = {fireSelect: function() {
							bSelectionFired = true;
						},
						getSelection: function() {}
					};
					
					oExtTree._handleSelectionAfterFilter();
					expect(bSelectionFired).to.equal(true);
				});
			});
			
			it("Clears selections", function() {
				var bSelectionState = true;
				var sRemvoedStyleClass;
				var oExtTree = new ExtensionProjectTree(null, dummyExtProjectDocument);
				// Mock clearing selection
				oExtTree._tree = {getSelection: function() {
						return {setIsSelected: function(bSelection) {
							bSelectionState = bSelection;
						}};
					}
				};
				// Mock clearing hover
				oExtTree._hoverNode = {removeStyleClass: function(sStyleClass) {
					sRemvoedStyleClass = sStyleClass;
				}};
					
				oExtTree.clearSelection();
				expect(bSelectionState).to.equal(false);
				expect(sRemvoedStyleClass).to.equal("hoveredNode");
			});
		});
	});