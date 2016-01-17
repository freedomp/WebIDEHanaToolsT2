define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var suiteName = "appDescriptorEditor_service_tests";
	var suiteWindowObj;
	var fixturesDiv;
	var oAppDescriptorEditorService;
	var sandbox;
	var MockFileDocument;
	var oEditorContent;
	var jQuery;
	var Q;
	var sap;
	var oManifestDocument;
	var oDocumentSetContentDeferred;
	var oTestData;

	/**
	 * Generic method for UI5 control property assertion
	 * @param {sap.ui.core.Control|string|jQuery} vControl - UI5 control instance or jQuery selector
	 * @param {string} sProperty - property name
	 * @param {string|number|boolean} vExpectedValue - expected property value
	 * @param {boolean} bGetParent - indicates that ui5 control is parent element
	 */
	function assertUI5ControlProperty(vControl, sProperty, vExpectedValue, bGetParent) {
		if (!(vControl instanceof sap.ui.core.Control)) {
			if (typeof vControl === "string") {
				vControl = jQuery(vControl);
			}
			if (bGetParent) {
				vControl = vControl.parent();
			}
			var sControlId = vControl.attr("id");
			vControl = sap.ui.getCore().byId(sControlId);
		}
		var sGetterFunctionName = "get" + sProperty[0].toUpperCase() + sProperty.slice(1);
		expect(vControl[sGetterFunctionName]()).to.equal(vExpectedValue);
	}

	function assertAddRemoveListBoxValues(oSelector, aExpectedValue) {
		var aItems = oSelector._oList.getItems();
		for (var i = 0; i < aItems.length; i++) {
			expect(aItems[i].getText()).to.equal(aExpectedValue[i]);
		}
	}

	function updateComboBoxValue(sSelector, sValue) {
		var sComboBoxId = sSelector.id;
		var oCombo = sap.ui.getCore().byId(sComboBoxId);
		oCombo.setSelectedKey(sValue);
		oCombo.fireChange({
			newValue: sValue,
			selectedItem: sValue
		});
	}
	
	function updateListBoxWithAddRemoveDropDown(vControl, sValue) {
		var aItems = vControl.getItems();
		var oItem;
		for (var i=0; i<aItems.length; i++) {
			if (aItems[i].getKey() === sValue){
				oItem = aItems[i];
				break;
			}
		}
		vControl.fireChange({
			selectedItem: oItem
		});
		vControl.setSelectedKey(sValue);
	}

	function updateListBoxWithAddRemove(oListBoxWithAddRemove, aValues, sType, sComboValue){
		if (sType === "add") {
			oListBoxWithAddRemove._pressAdd();
			if (sComboValue){
				var oCombo = sap.ui.getCore().byId("appDescriptorListWithAddRemoveCombo");
				updateListBoxWithAddRemoveDropDown(oCombo, sComboValue);
			}
			var oRowRepeater = sap.ui.getCore().byId("appDescriptorRowRepeater");
			var aRows = oRowRepeater.getRows();
			for (var i = 0; aRows && i < aRows.length; i++) {
				var aLine = aRows[i].getContent();
				aLine[1].setValue(aValues[i]);
			}
			oListBoxWithAddRemove.onDefaultDialogOK(); 
		} else {
			oListBoxWithAddRemove._oList.setSelectedKeys(aValues);
		 	oListBoxWithAddRemove._pressRemove();
		 } 	
	}	

	function getUpdatedManifest() {
		return oDocumentSetContentDeferred.promise.then(function(sContent) {
			oDocumentSetContentDeferred = Q.defer();
			return JSON.parse(sContent);
		});
	}

	/**
	* @param {sap.ui.commons.TextField|string|jQuery} vTextField - TextField instance or jQuery selector
	* @param {string} sValue - new value
	*/
	function updateTextFieldValue(vTextField, sValue) {
		if (!(vTextField instanceof sap.ui.commons.TextField)) {
			if (typeof vTextField === "string") {
				vTextField = jQuery(vTextField);
			}
			var sTextFieldId = vTextField.attr("id");
			vTextField = sap.ui.getCore().byId(sTextFieldId);
		}
		vTextField.setValue(sValue);
		vTextField.fireChange({newValue: sValue});
	}

	function updateToggleButton(sSelector, bValue) {
		var oButton = sap.ui.getCore().byId(jQuery(sSelector).attr("id"));
		oButton.setPressed(bValue);
		oButton.firePress({ pressed: bValue });
	}

	function getTextFieldValidation(sSelector) {
		var sTextFieldId = jQuery(sSelector).attr("id");
		var oTextField = sap.ui.getCore().byId(sTextFieldId);
		return oTextField.getValueState();
	}

	describe("AppDescriptorEditor service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/saptoolsets/fiori/editor/plugin/appdescriptoreditor/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				jQuery = webIdeWindowObj.jQuery;
				Q = webIdeWindowObj.Q;
				sap = suiteWindowObj.sap;

				//Create fixtures div
				fixturesDiv = suiteWindowObj.document.createElement("div");
				fixturesDiv.id = "fixtures";
				fixturesDiv.style.display = "none";
				fixturesDiv.style.visibility = "hidden";
				suiteWindowObj.document.body.appendChild(fixturesDiv);

				// place appDescriptorEditor in fixtures div
				oAppDescriptorEditorService = STF.getService(suiteName, "appdescriptoreditor");
				return oAppDescriptorEditorService.getContent().then(function(_oEditorContent) {
					oEditorContent = _oEditorContent;
					oEditorContent.placeAt("fixtures");
					sap.ui.getCore().applyChanges();
					
					return STF.require(suiteName, [
						"sane-tests/util/mockDocument",
						"editor/monaco/saptoolsets/fiori/editor/plugin/appdescriptoreditor/service/testData"
					]);
				}).spread(function(MockDocument, testData) {
					MockFileDocument = MockDocument.MockFileDocument;
					oTestData = testData;
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Settings tab", function() {
			var oEditorSettingsTabController;
			
			before(function() {
				oEditorSettingsTabController = oEditorContent.getController()._oAppDescriptorEditorSettingsTabView.getController();
			});

			describe("Updating UI from manifest.json", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});

				//******************Assert field values ****************************//
	
				//General section 
				it("id text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='id']", "value", "sap.fiori.appName");
				});
				
				//type
				it("type drop down in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='appDescriptor-general-type']", "value", "application", true);
				});
				
				//title
				it("title text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='title']", "value", "{{title}}");
				});
				
				//description
				it("description text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='description']", "value", "{{description}}");
				});
				
				//source template
				it("source template text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='sourceTemplate']", "value",
						"sap.ui.ui5-template-plugin.1worklist (1.0.0)");
				});
	
				//i18n file path
				it("i18n file path text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='i18nFilePath']", "value",
						"i18n/i18n.properties");
				});
				
				//app version
				it("Application version text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='appVersion']", "value", "1.2.2");
				});
	
				//Tags
				it("Tags(Keywords) special field in general container should be updated according to manifest.json", function() {
					var oSelector = oEditorSettingsTabController.byId("appDescriptor-settings-Keywords");
					assertAddRemoveListBoxValues(oSelector, ["{{keyWord1}}", "{{keyWord2}}"]);
				});
				
				//application component hierchy
				it("ACH text field in general container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-general---Panel'] input[name='ach']", "value", "PA-FIO");
				});
	
				//******UI section****************************
				
				//technology
				it("Technology drop down in ui container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='technology']", "value", "UI5", true);
				});
				
				//TODO Devices could not find how to locate the devices in the dom
				// it("Devices toggle button ui container should be updated according to manifest.json", function() {
				// 	assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='technology']", "value", "UI5", true);
				// });			
				
				it("Themes in ui container should be updated according to manifest.json", function() {
					var oSelector = oEditorSettingsTabController.byId("appDescriptor-settings-Themes");
					assertAddRemoveListBoxValues(oSelector, ["sap_hcb", "sap_bluecrystal"]);
				});
	
				it("Application icons Main f4 help field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='appIconMain']", "value", "sap-icon://add-contact", true);
				});
	
				it("Application icons phone 57px f4 help field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='phone']",
						"value", "icon/launchicon/57_iPhone_Desktop_Launch.png", true);
				});
	
				it("Application icons phone 114px f4 help field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='phone@2']",
						"value", "icon/launchicon/114_iPhone-Retina_Web_Clip.png", true);
				});
	
				it("Application icons tablet 72px f4 help field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='tablet']",
						"value", "icon/launchicon/72_iPad_Desktop_Launch.png", true);
				});
	
				it("Application icons tablet 144px f4 help field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='tablet@2']",
						"value", "icon/launchicon/144_iPad_Retina_Web_Clip.png", true);
				});
	
				it("Application icons favorits text field in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-userInterface---Panel'] input[name='favorites']", "value",
						"icon/F1373_Approve_Purchase_Orders.ico");
				});
	
				//***SAPUI5 section**********
				//Min ui5 version
				it("Minimum ui5 version text field in SAPUI5 container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-sapui5---Panel'] input[name='ui5MinVer']", "value", "1.30.0");
				});
				
				//Resources
				it("Resources in sapui5 container should be updated according to manifest.json", function() {
					var oSelector = oEditorSettingsTabController.byId("appDescriptor-settings-Resources");
					assertAddRemoveListBoxValues(oSelector, ["component.js", "component.css (componentcss)"]);
				});		
				
				//Dependencies
				it("Dependencies in sapui5 container should be updated according to manifest.json", function() {
					var oSelector = oEditorSettingsTabController.byId("appDescriptor-settings-Dependencies");
					assertAddRemoveListBoxValues(oSelector, ["libs: sap.m(1.30.0)", "libs: sap.ui.commons(1.30.0)", "components: sap.ui.app.other(1.1.0)"]);
				});
				
				//Content desnsities
				it("Content densities checkbox fields in UI container should be updated according to manifest.json", function() {
					assertUI5ControlProperty("div[id$='appDescriptor-settings-sapui5---Panel'] input[name='compact']", "checked", true, true);
					assertUI5ControlProperty("div[id$='appDescriptor-settings-sapui5---Panel'] input[name='cozy']", "checked", false, true);
				});	
			});

			describe("Updating manifest.json from UI", function() {
				beforeEach(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				afterEach(function() {
					sandbox.restore();
				});
				//** General section**	
				//id
				it("sap.app.id in manifest.json should be updated on change event of id text field in general section", function() {
					var sId = "test_id";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='id']", sId);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].id).to.equal(sId);
					});
				});
				
				//type
				it("sap.app.type in manifest.json should be updated on change event of type text field in general section", function() {
					var sType = "library";
					var oUi5ControlDom = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-general").getRenderedDomRef()).find("input[name='appDescriptor-general-type']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sType);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].type).to.equal(sType);
					});
				});			
	
				//Title - test validation on field and new value
				it("sap.app.title in manifest.json should be updated on change event of title text field in general section", function() {
					var sTitle = "{{test_title}}";
					var sErrorTitle = "{{test_title}";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='title']", sErrorTitle);
					expect(getTextFieldValidation("div[id$='appDescriptor-settings-general---Panel'] input[name='title']")).to.equal("Error");
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].title).to.equal(sErrorTitle);
						updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='title']", sTitle);
						return getUpdatedManifest().then(function(oManifest1) {
							expect(oManifest1["sap.app"].title).to.equal(sTitle);
						});
					});
				});
				//Description
				it("sap.app.description in manifest.json should be updated on change event of description text field in general section", function() {
					var sDecription = "{{description1}}";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='description']", sDecription);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].description).to.equal(sDecription);
					});
				});
	
				//i18n
				it("sap.app.i18n in manifest.json should be updated on change event of i18nFilePath text field in general section", function() {
					var sI18nFilePath = "i18n/i18n.properties1";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='i18nFilePath']", sI18nFilePath);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].i18n).to.equal(sI18nFilePath);
					});
				});
				
				//app version
				it("sap.app.applicationVersion.version in manifest.json should be updated on change event of application version text field in general section", function() {
					var sVersion = "1.2.3";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='appVersion']", sVersion);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].applicationVersion.version).to.equal(sVersion);
					});
				});
	
				//****Tags*****
				//Add Keyword
				it("sap.app.tags.keywords in manifest.json should be updated on change event of  '+' - add keyword general section", function() {
					var sNewKeyword = "{{keyword3}}";
					var oListBoxWithAddRemove = oEditorSettingsTabController.byId("appDescriptor-settings-Keywords");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, [sNewKeyword], "add");
					return getUpdatedManifest().then(function(oManifest) {
						var aKeywords = oManifest["sap.app"].tags.keywords;
						expect(aKeywords[2]).to.equal(sNewKeyword);
					});
				});
				
				//remove keyword
				it("sap.app.tags.keywords in manifest.json should be updated on change event of  '-' remove keyword general section", function() {
					var sRemovedKeyword = "{{keyWord1}}";
					var oListBoxWithAddRemove = oEditorSettingsTabController.byId("appDescriptor-settings-Keywords");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, [sRemovedKeyword], "remove");
					return getUpdatedManifest().then(function(oManifest) {
						var aKeywords = oManifest["sap.app"].tags.keywords;
						expect(aKeywords[1]).to.not.equal(sRemovedKeyword);
					});
				});
	
	
				//update application component hierarchy with validation
				it("sap.app.ach in manifest.json should be updated on change event of ach text field in general section", function() {
					var sSCH = "PA-FI1";
					var sSCHWithError = "PA-";
					updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='ach']", sSCHWithError);
					expect(getTextFieldValidation("div[id$='appDescriptor-settings-general---Panel'] input[name='ach']")).to.equal("Error");
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].ach).to.equal(sSCHWithError);
						updateTextFieldValue("div[id$='appDescriptor-settings-general---Panel'] input[name='ach']", sSCH);
						return getUpdatedManifest().then(function(oManifest1) {
							expect(oManifest1["sap.app"].ach).to.equal(sSCH);
						});
					});
				});	
				//******ui section****
				
				//technology
				it("sap.ui.tecnology in manifest.json should be updated on change event of combobox field in ui section", function() {
					var sTech = "URL";
					var oUi5ControlDom = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-userInterface").getRenderedDomRef()).find("input[name='technology']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sTech);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui"].technology).to.equal(sTech);
					});
				});
				
				//devices
				it("sap.ui.deviceTypes.phone in manifest.json should be updated on change event of combobox field in ui section", function() {
					var bPressed = true;
					var bUnPressed = false;
					var oUi5DevicePhone = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-userInterface").getRenderedDomRef()).find(" :button")[0];
					var oUi5DeviceTablet = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-userInterface").getRenderedDomRef()).find(" :button")[1];
					var oUi5DeviceDesktop = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-userInterface").getRenderedDomRef()).find(" :button")[2];
				
					updateToggleButton(oUi5DevicePhone, bPressed);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui"].deviceTypes.phone).to.equal(bPressed);
						updateToggleButton(oUi5DeviceTablet, bUnPressed);
						return getUpdatedManifest().then(function(oManifest1) {
							expect(oManifest1["sap.ui"].deviceTypes.tablet).to.equal(bUnPressed);
							updateToggleButton(oUi5DeviceDesktop, bUnPressed);
							return getUpdatedManifest().then(function(oManifest2) {
								expect(oManifest2["sap.ui"].deviceTypes.desktop).to.equal(bUnPressed);
							});
						});
					});
				});
				
				it("sap.ui.deviceTypes.tablet in manifest.json should be updated on change event of combobox field in ui section", function() {
					var bPressed = false;
					var oUi5ControlDom = jQuery(oEditorSettingsTabController.byId("appDescriptor-settings-userInterface").getRenderedDomRef()).find(" :button")[1];
					//jQuery(oUi5ControlDom).trigger("click");
					updateToggleButton(oUi5ControlDom, bPressed);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui"].deviceTypes.tablet).to.equal(bPressed);
					});
				});				
				
				//Themes
				
				
				
				//*****sapui5 section********
				//min ui5 version
				it("sap.ui5.dependencies.minUI5Version in manifest.json should be updated on change event of test field minui5 version sapui5 section", function() {
					var sVersion = "1.2.3";
					updateTextFieldValue("div[id$='appDescriptor-settings-sapui5---Panel'] input[name='ui5MinVer']", sVersion);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].dependencies.minUI5Version).to.equal(sVersion);
					});
				});
				
				
				//**Resources
				//js
				//Add js resource
				it("sap.ui5.resources.js in manifest.json should be updated on change event of  '+' - add js resource sapui5 section", function() {
					var sNewJSResource = ["component1.js"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Resources");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, sNewJSResource, "add", "JS");
					return getUpdatedManifest().then(function(oManifest) {
						var aJSResource = oManifest["sap.ui5"].resources.js;
						var aItems = oListBoxWithAddRemove._oList.getItems();
						for (var i = 0; i < aItems.length; i++) {
							if (aItems[i].getText() === sNewJSResource[0]) {
								//Item will be added after the existing item
								expect(aItems[i].getText()).to.equal(aJSResource[1].uri);
								break;
							}
						}
					});
				});
				
				//remove js resource
				it("sap.ui5.resources.js in manifest.json should be updated on change event of  '-' remove js resource sapui5 section", function() {
					var aRemovedResource = ["component.js"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Resources");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, aRemovedResource, "remove");
					return getUpdatedManifest().then(function(oManifest) {
						var aJSResource = oManifest["sap.ui5"].resources.js;
						expect(aJSResource.length).to.equal(0);
					});
				});
				
				//Add css resource
				it("sap.ui5.resources.css in manifest.json should be updated on change event of  '+' add js resource sapui5 section", function() {
					var sNewJSResource = ["component1.css", "component1css"];
					var aExpecedResults = [ "component1.css (component1css)", "component.js", "component.css (componentcss)"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Resources");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, sNewJSResource, "add", "CSS");
					return getUpdatedManifest().then(function(oManifest) {
						var aCSSResource = oManifest["sap.ui5"].resources.css;
						var aItems = oListBoxWithAddRemove._oList.getItems();
						for (var i = 0; i < aItems.length; i++) {
							//Item will be added after the existing item
							expect(aItems[i].getText()).to.equal(aExpecedResults[i]);
							if (i === 0) {
								expect(aItems[i].getText()).to.equal(aCSSResource[1].uri + " ("+aCSSResource[1].id + ")");
							}
						}
					});
				});	
				
				//remove css resource
				it("sap.ui5.resources.css in manifest.json should be updated on change event of  '-' remove css resource sapui5 section", function() {
					var aRemovedResource = ["component.css (componentcss)"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Resources");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, aRemovedResource, "remove");
					return getUpdatedManifest().then(function(oManifest) {
						var aJSResource = oManifest["sap.ui5"].resources.css;
						expect(aJSResource.length).to.equal(0);
					});
				});
				
				//**Dependnecied
				//libs
				//Add libs
				it("sap.ui5.dependnecied.libs in manifest.json should be updated on change event of  '+' - add libs dependencies sapui5 section", function() {
					var sNewLibs = ["sap.ui.test", "1.99.99"];
					var aExpectedResults = ["libs: sap.ui.test(1.99.99)",  "libs: sap.m(1.30.0)", "libs: sap.ui.commons(1.30.0)", "components: sap.ui.app.other(1.1.0)"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Dependencies");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, sNewLibs, "add", "Libraries");
					return getUpdatedManifest().then(function(oManifest) {
						var aLibDependencies = oManifest["sap.ui5"].dependencies.libs;
						var aItems = oListBoxWithAddRemove._oList.getItems();
						for (var i = 0; i < aItems.length; i++) {
							//Item will be added after the existing item
							expect(aItems[i].getText()).to.equal(aExpectedResults[i]);
							if (i === 0) {
								expect(aItems[i].getText()).to.equal( "libs: " + Object.keys(aLibDependencies)[2] + "("+aLibDependencies[sNewLibs[0]].minVersion + ")");
							}
						}
					});
				});
				
				it("sap.ui5.dependnecied.libs in manifest.json should be updated on change event of  '-' remove libs dependencies sapui5 section", function() {
					var aRemovedDependency = ["libs: sap.m(1.30.0)"];
					var oListBoxWithAddRemove =  oEditorSettingsTabController.byId("appDescriptor-settings-Dependencies");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, aRemovedDependency, "remove");
					return getUpdatedManifest().then(function(oManifest) {
						var oLibsDependency = oManifest["sap.ui5"].dependencies.libs;
						expect(oLibsDependency["sap.m"]).to.equal(undefined);
					});
				});			
				
			});
			
		});

		describe("Navigation tab", function() {
			var oNavigationController;
			
			before(function(done) {
				oNavigationController = oEditorContent.getController()._oAppDescriptorEditorNavigationTabView.getController();
				oNavigationController.getView().attachEventOnce("afterRendering", function() {done();}, this);
				oEditorContent.getController().byId("appDescriptorTabStrip").setSelectedIndex(3);
			});
			
			describe("Updating UI from manifest.json", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});

				it("Intent table should have 4 rows with correct content according to manifest", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					expect(oIntentTable.getBinding("rows").getLength()).to.equal(4);
					var oFirstRow = oIntentTable.getRows()[0];
					var oSemanticObjectTextField = oFirstRow.getCells()[0];
					assertUI5ControlProperty(oSemanticObjectTextField, "value", "Contact");
					var oActionTextField = oFirstRow.getCells()[1];
					assertUI5ControlProperty(oActionTextField, "value", "create");
				});

				it("Title text field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $titleTextField = oTileDetailsContainer.$().find("input[name='title']");
					assertUI5ControlProperty($titleTextField, "value", "{{title}}");
				});

				it("Subtitle text field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $subtitleTextField = oTileDetailsContainer.$().find("input[name='subtitle']");
					assertUI5ControlProperty($subtitleTextField, "value", "Tile");
				});

				it("Icon valueHelp field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $iconValueHelpField = oTileDetailsContainer.$().find("input[name='icon']");
					assertUI5ControlProperty($iconValueHelpField, "value", "sap-icon://add-contact", true);
				});

				it("Data source text field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $dataSourceTextField = oTileDetailsContainer.$().find("input[name='data_source']");
					assertUI5ControlProperty($dataSourceTextField, "value", "ppm");
				});

				it("Path text field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $pathTextField = oTileDetailsContainer.$().find("input[name='path']");
					assertUI5ControlProperty($pathTextField, "value", "TaskListSet/$count");
				});

				it("Refresh interval field should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $refreshIntervalTextField = oTileDetailsContainer.$().find("input[name='refresh_interval']");
					assertUI5ControlProperty($refreshIntervalTextField, "value", "58");
				});

				it("Tile preview should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var sTileId = oTileDetailsContainer.$().find(".CustomItemLayout").attr("id");
					var oTile =  sap.ui.getCore().byId(sTileId);
					assertUI5ControlProperty(oTile.getTitle(), "text", "{{title}}");
					assertUI5ControlProperty(oTile.getSubtitle(), "text", "Tile");
					assertUI5ControlProperty(oTile.getIcon(), "icon", "sap-icon://add-contact");
				});

				it("Intent parameters table should be updated from manifest according to selected intent", function(done) {
					var oIntentParamsTable = oNavigationController.byId("appDescriptorIntentTableParams");
					oIntentParamsTable.attachEventOnce("_rowsUpdated", function() {
						var oFirstRow = oIntentParamsTable.getRows()[0];
						var oValueTextField = oFirstRow.getCells()[1];
						assertUI5ControlProperty(oValueTextField, "value", "UserDefault.GLAccount");
						var oValueFormatDropdown = oFirstRow.getCells()[2];
						assertUI5ControlProperty(oValueFormatDropdown, "selectedKey", "reference");
						var oRequiredCheckbox = oFirstRow.getCells()[3];
						assertUI5ControlProperty(oRequiredCheckbox, "checked", true);
						var oFilterValueTextField = oFirstRow.getCells()[4];
						assertUI5ControlProperty(oFilterValueTextField, "value", "\\d+");
						var oFilterFormatDropdown = oFirstRow.getCells()[5];
						assertUI5ControlProperty(oFilterFormatDropdown, "selectedKey", "regexp");
						done();
					}, this);
					
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(2);
				});

				it("Additional parameters combo should be updated from manifest according to selected intent", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $additionalParametersDropdown = oTileDetailsContainer.$().find("input[name='additional_parameters']");
					assertUI5ControlProperty($additionalParametersDropdown, "selectedKey", "allowed", true);
				});
			});

			describe("Updating manifest.json from UI", function() {
				beforeEach(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				afterEach(function() {
					sandbox.restore();
				});

				it("When adding a row to intent table manifest should be updated" , function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					var oAddButton = oIntentTable.getToolbar().getRightItems()[0];
					oAddButton.$().trigger("click");
					return getUpdatedManifest().then(function(oManifest) {
						expect(Object.keys(oManifest["sap.app"].crossNavigation.inbounds)).to.have.length(5);
						expect(oManifest["sap.app"].crossNavigation.inbounds).to.have.property("intent2");
						expect(oManifest["sap.app"].crossNavigation.inbounds.intent2).to.have.property("action");
						expect(oManifest["sap.app"].crossNavigation.inbounds.intent2.action).to.equal("action1");
						expect(oManifest["sap.app"].crossNavigation.inbounds.intent2).to.have.property("semanticObject");
						expect(oManifest["sap.app"].crossNavigation.inbounds.intent2.semanticObject).to.equal("object1");
					});
				});

				it("When removing a row from intent table manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(3);
					var oRemoveButton = oIntentTable.getToolbar().getRightItems()[1];
					oRemoveButton.$().trigger("click");
					return getUpdatedManifest().then(function(oManifest) {
						expect(Object.keys(oManifest["sap.app"].crossNavigation.inbounds)).to.have.length(3);
					});
				});

				it("When editing a row in intent table manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					var sSemenaticObject = "newObject";
					var sAction = "newAction";
					updateTextFieldValue(oIntentTable.getRows()[0].getCells()[0], sSemenaticObject);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.semanticObject).to.equal(sSemenaticObject);
						updateTextFieldValue(oIntentTable.getRows()[0].getCells()[1], sAction);
						return getUpdatedManifest();
					}).then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.action).to.equal(sAction);
					});
				});

				it("When editing title text field, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $titleTextField = oTileDetailsContainer.$().find("input[name='title']");
					var sNewValue = "new_val";
					updateTextFieldValue($titleTextField, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.title).to.equal(sNewValue);
					});
				});

				it("When editing subtitle text field, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $subtitleTextField = oTileDetailsContainer.$().find("input[name='subtitle']");
					var sNewValue = "new_val";
					updateTextFieldValue($subtitleTextField, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.subTitle).to.equal(sNewValue);
					});
				});

				it("When editing icon valueHelp field manually, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $iconValueHelpField = oTileDetailsContainer.$().find("input[name='icon']");
					var sNewValue = "sap-icon://action-settings";
					updateTextFieldValue($iconValueHelpField.parent(), sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.icon).to.equal(sNewValue);
					});
				});
				
				it("When editing icon valueHelp field from icon dialog, manifest should be updated", function() {
					var ui5IconsService = STF.getService(suiteName, "ui5icons");
					var sNewValue = "action-settings";
					sinon.stub(ui5IconsService, "openIconDialog").returns(Q({icon: sNewValue}));
					
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $IconValueHelpButton = oTileDetailsContainer.$().find("input[name='icon']").parent().find("span[role='button']");
					$IconValueHelpButton.trigger("click");
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.icon).to.equal("sap-icon://" + sNewValue);
					});
				});

				it("When editing data source text field, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $dataSourceTextField = oTileDetailsContainer.$().find("input[name='data_source']");
					var sNewValue = "new_val";
					updateTextFieldValue($dataSourceTextField, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.indicatorDataSource.dataSource).to.equal(sNewValue);
					});
				});

				it("When editing path text field, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $pathTextField = oTileDetailsContainer.$().find("input[name='path']");
					var sNewValue = "new_val";
					updateTextFieldValue($pathTextField, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.indicatorDataSource.path).to.equal(sNewValue);
					});
				});

				it("When editing refresh interval text field, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $refreshIntervalTextField = oTileDetailsContainer.$().find("input[name='refresh_interval']");
					var sNewValue = "55";
					updateTextFieldValue($refreshIntervalTextField, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.indicatorDataSource.refresh).to.equal(Number(sNewValue));
					});
				});

				it("When editing additional parameters dropdown, manifest should be updated", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $additionalParametersDropdown = oTileDetailsContainer.$().find("input[name='additional_parameters']").parent();
					var sNewValue = "ignored";
					updateTextFieldValue($additionalParametersDropdown, sNewValue);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.app"].crossNavigation.inbounds.contactCreate.signature.additionalParameters).to.equal(sNewValue);
					});
				});
				
				//TODO
				it("When adding a row to intent parameters table, manifest should be updated" , function() {
				
				});
				
				//TODO
				it("When removing a row from intent parameters table, manifest should be updated", function() {
				
				});
				
				//TODO
				it("When editing a row in intent parameters table, manifest should be updated", function() {
				
				});
			});

			describe("UI model binding", function() {
				beforeEach(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				afterEach(function() {
					sandbox.restore();
				});


				it("When no intent is selected, intent details controls should be disabled", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(-1);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $titleTextField = oTileDetailsContainer.$().find("input[name='title']");
					assertUI5ControlProperty($titleTextField, "enabled", false);
				});

				it("When an intent is selected, intent details controls should be enabled", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(0);
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					var $titleTextField = oTileDetailsContainer.$().find("input[name='title']");
					assertUI5ControlProperty($titleTextField, "enabled", true);
				});

				it("When removing all rows from intent table, intent details controls should be disabled", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					var iRowsLength = oIntentTable.getBinding("rows").getLength();
					var oTileDetailsContainer = oNavigationController.byId("tileDetails");
					for (var i=0; i<iRowsLength; i++) {
						oIntentTable.setSelectedIndex(0);
						var oRemoveButton = oIntentTable.getToolbar().getRightItems()[1];
						oRemoveButton.$().trigger("click");
					}
					var $titleTextField = oTileDetailsContainer.$().find("input[name='title']");
					assertUI5ControlProperty($titleTextField, "enabled", false);
				});

				it("When clicking on remove intent button when no intent is selected, nothing should happen", function() {
					var oIntentTable = oNavigationController.byId("appDescriptorIntentTable");
					oIntentTable.setSelectedIndex(-1);
					var oRemoveButton = oIntentTable.getToolbar().getRightItems()[1];
					oRemoveButton.$().trigger("click");
					expect(oIntentTable.getBinding("rows").getLength()).to.equal(4);
				});


			});
			


			//TODO test navigation version support
			//TODO test validations
			
			
		});
		
		describe("Data Sources tab", function() {
			var oDataSourcesController;
			
			before(function(done) {
				oDataSourcesController = oEditorContent.getController()._oAppDescriptorEditorDataSourcesTabView.getController();
				oDataSourcesController.getView().attachEventOnce("afterRendering", function() {done();}, this);
				oEditorContent.getController().byId("appDescriptorTabStrip").setSelectedIndex(1);
			});
			
			describe("Updating UI from manifest.json", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});
				
				it("Odata services in ui container should be updated according to manifest.json", function() {
					var oOdataServicesList = oDataSourcesController.byId("odataServicesList");
					assertAddRemoveListBoxValues(oOdataServicesList, ["equipment", "equipment2"]);
				});
				
				it("URI field in ui container should be updated according to manifest.json", function() {
					
					var oOdataServicesList = oDataSourcesController.byId("odataServicesList");
					oOdataServicesList._oList.fireSelect({selectedItem: oOdataServicesList.getItems()[0]});
					
					var $URITextField = jQuery("div[id*='odataServicesDetails'] input[name='odataUri']");
					assertUI5ControlProperty($URITextField, "value", "/sap/opu/odata/snce/PO_S_SRV;v=2/");
				});
				
				it("Local URI field in ui container should be updated according to manifest.json", function() {
					
					var oOdataServicesList = oDataSourcesController.byId("odataServicesList");
					oOdataServicesList._oList.fireSelect({selectedItem: oOdataServicesList.getItems()[0]});
					
					var $LocalURITextField = jQuery("div[id*='odataServicesDetails'] input[name='odataLocalUri']");
					assertUI5ControlProperty($LocalURITextField, "value", "model/metadata.xml");
				});
				
				it("OData Version field in ui container should be updated according to manifest.json", function() {
					
					var oOdataServicesList = oDataSourcesController.byId("odataServicesList");
					oOdataServicesList._oList.fireSelect({selectedItem: oOdataServicesList.getItems()[1]});
					
					var $ODataVersionTextField = jQuery("div[id*='odataServicesDetails'] input[name='odataVersion']");
					assertUI5ControlProperty($ODataVersionTextField, "selectedKey", "4.0", true);
				});
			});
			
			describe("Updating manifest.json from UI", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});
				
				it("sap.app.dataSources in manifest.json should be updated on change event of  '+' - add service", function() {
					var sNewService = ["equipmentTest", "aaa.aaa.aaa", "OData", {}, [], "4.0", "bbb.bbb.bbb"];
					var oListBoxWithAddRemove = oDataSourcesController.byId("odataServicesList");
					updateListBoxWithAddRemove(oListBoxWithAddRemove, sNewService, "add");
					return getUpdatedManifest().then(function(oManifest) {
						var aService = oManifest["sap.app"].dataSources;
						expect(Object.keys(aService)[3]).to.equal(sNewService[0]);
						expect(aService[sNewService[0]].uri).to.equal(sNewService[1]);
						expect(aService[sNewService[0]].type).to.equal(sNewService[2]);
						expect(aService[sNewService[0]].settings).to.not.be.empty;
						expect(aService[sNewService[0]].settings.odataVersion).to.equal(sNewService[5]);
						expect(aService[sNewService[0]].settings.localUri).to.equal(sNewService[6]);
					});
				});
				
				
				
			});
		});
		
		describe("Routing tab", function() {
			var oRoutingController;
			
			before(function(done) {
				oRoutingController = oEditorContent.getController()._oAppDescriptorEditorRoutingTabView.getController();
				oRoutingController.getView().attachEventOnce("afterRendering", function() {done();}, this);
				oEditorContent.getController().byId("appDescriptorTabStrip").setSelectedIndex(2);
			});
			
			describe("Updating UI from manifest.json", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});
				
				it("View Path field in ui container should be updated according to manifest.json", function() {
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $viewPathTextField = oDefaultConfigContainer.$().find("input[name='viewPath']");
					assertUI5ControlProperty($viewPathTextField, "value", "ns.view");
				});
				
				it("View Type field in ui container should be updated according to manifest.json", function() {
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $viewTypeTextField = oDefaultConfigContainer.$().find("input[name='viewType']");
					assertUI5ControlProperty($viewTypeTextField, "selectedKey", "XML", true);
				});
				
				it("Control Id field in ui container should be updated according to manifest.json", function() {
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $controlIdTextField = oDefaultConfigContainer.$().find("input[name='controlId']");
					assertUI5ControlProperty($controlIdTextField, "value", "app");
				});
				
				it("View Level field in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $controlIdTextField = oDefaultConfigContainer.$().find("input[name='viewLevel']");
					assertUI5ControlProperty($controlIdTextField, "value", "5");
				});
				
				it("Control Aggregation field in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $controlAggregationTextField = oDefaultConfigContainer.$().find("input[name='controlAggregation']");
					assertUI5ControlProperty($controlAggregationTextField, "value", "pages");
				});
				
				it("Transition field in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $transitionTextField = oDefaultConfigContainer.$().find("input[name='transition']");
					assertUI5ControlProperty($transitionTextField, "selectedKey", "flip", true);
				});
				
				it("Target Parent field in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $targetParentTextField = oDefaultConfigContainer.$().find("input[name='targetParent']");
					assertUI5ControlProperty($targetParentTextField, "value", "myTarget");
				});
				
				it("Parent field in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $parentTextField = oDefaultConfigContainer.$().find("input[name='parent']");
					assertUI5ControlProperty($parentTextField, "value", "myParent");
				});
				
				it("Clear Aggregation in ui container should be updated according to manifest.json", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					var oDefaultConfigContainer = oRoutingController.byId("defaultConfiguration");
					var $clearAggregationTextField = oDefaultConfigContainer.$().find("input[name='clearAggregation']");
					assertUI5ControlProperty($clearAggregationTextField, "selectedKey", "true", true);
				});
				
				it("Manage Targets in ui container should be updated according to manifest.json", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					assertAddRemoveListBoxValues(oManageTargetsList, ["worklist", "object", "objectNotFound", "notFound"]);
				});
				
				it("Targets View Name in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $viewNameTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsViewName']");
					assertUI5ControlProperty($viewNameTextField, "value", "Worklist");
				});
				
				it("Targets View Id in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $viewIdTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsViewId']");
					assertUI5ControlProperty($viewIdTextField, "value", "worklist");
				});
				
				it("Targets View Level in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $viewLevelTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsViewLevel']");
					assertUI5ControlProperty($viewLevelTextField, "value", "1");
				});
				
				it("Targets Control Aggregation in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsControlAggregationTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsControlAggregation']");
					assertUI5ControlProperty($targetsControlAggregationTextField, "value", "sap");
				});
				
				it("Targets Control ID in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsControlIDTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsControlID']");
					assertUI5ControlProperty($targetsControlIDTextField, "value", "newApp");
				});
				
				it("Targets View Path in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsViewPathTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsViewPath']");
					assertUI5ControlProperty($targetsViewPathTextField, "value", "ns.view");
				});
				
				it("Targets View Type in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsViewTypeTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsViewType']");
					assertUI5ControlProperty($targetsViewTypeTextField, "value", "JSON", true);
				});
				
				it("Targets Transition in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsTransitionTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsTransition']");
					assertUI5ControlProperty($targetsTransitionTextField, "value", "fade", true);
				});
				
				it("Targets Parent in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsParentTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsParent']");
					assertUI5ControlProperty($targetsParentTextField, "value", "myParent");
				});
				
				it("Targets Clear Aggregation in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsClearAggregationTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsClearAggregation']");
					assertUI5ControlProperty($targetsClearAggregationTextField, "value", "true", true);
				});
				
				it("Targets Target Parent in ui container should be updated according to manifest.json", function() {
					
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var $targetsTargetParentTextField = jQuery("div[id*='ManageTargetsDetails'] input[name='targetsTargetParent']");
					assertUI5ControlProperty($targetsTargetParentTextField, "value", "myTarget");
				});
				
				//By Passed Targets
				it("By Passed Targets in ui container should be updated according to manifest.json", function() {
					var oManageTargetsList = oRoutingController.byId("defaultConfiguration");
					
					var $byPassedTargets = oManageTargetsList.$().find("button [id*='removeByPassedTargets']");
					var $notFoundByPassedTarget = oManageTargetsList.$().find("button span:contains('notFound')");
					var $objectNotFoundByPassedTarget = oManageTargetsList.$().find("button span:contains('objectNotFound')");
					expect($byPassedTargets).to.have.length.of(2);
					expect($notFoundByPassedTarget).to.not.be.empty;
					expect($objectNotFoundByPassedTarget).to.not.be.empty;
				});
				
				//Routes
				it("Routes table in ui container should be updated according to manifest.json", function() {
					var oRoutesTableGrid = oRoutingController.byId("appDescriptor-routing-routesGrid");
					
					var $routes = oRoutesTableGrid.$().find("[class*='sapIDERoutingHLayout']");
					var $routName = $routes.eq(1).find("input[name='routName']");
					var $routPattern = $routes.eq(1).find("input[name='routPattern']");
					var $routGreedy = $routes.eq(1).find("input[name='routGreedy']");
					
					// var $routesTargets = $routes.eq(1).find("button [class*='riverControlSmall']");
					var $objectTarget = $routes.eq(1).find("button span:contains('object')");
					
					expect($routes).to.have.length.of(2);
					assertUI5ControlProperty($routName, "value", "object");
					assertUI5ControlProperty($routPattern, "value", "CarrierCollection/{objectId}");
					assertUI5ControlProperty($routGreedy, "checked", true, true);
					// expect($routesTargets).to.have.length.of(1);
					expect($objectTarget).to.not.be.empty;
				});
			});
			
			describe("Updating manifest.json from UI", function() {
				before(function() {
					oDocumentSetContentDeferred = Q.defer();
					sandbox = sinon.sandbox.create();
					oManifestDocument = new MockFileDocument("proj/manifest.json", "json", JSON.stringify(oTestData.manifest));
					sandbox.stub(oManifestDocument, "setContent", function(sContent) {
						oDocumentSetContentDeferred.resolve(sContent);
					});
					return oAppDescriptorEditorService.open(oManifestDocument);
				});

				after(function() {
					sandbox.restore();
				});
				
				it("sap.ui5.routing.config.viewPath in manifest.json should be updated on change event of viewPath text field in default configuration section", function() {
					var sViewPath = "test.path";
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='viewPath']", sViewPath);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.viewPath).to.equal(sViewPath);
					});
				});
				
				it("sap.ui5.routing.config.viewType in manifest.json should be updated on change event of viewType text field in default configuration section", function() {
					var sViewType = "JS";
					var oUi5ControlDom = oRoutingController.byId("defaultConfiguration").$().find("input[name='viewType']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sViewType);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.viewType).to.equal(sViewType);
					});
				});
				
				it("sap.ui5.routing.config.controlId in manifest.json should be updated on change event of controlId text field in default configuration section", function() {
					var sControlId = "testControl";
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='controlId']", sControlId);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.controlId).to.equal(sControlId);
					});
				});
				
				it("sap.ui5.routing.config.viewLevel in manifest.json should be updated on change event of viewLevel text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sViewLevel = 3;
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='viewLevel']", sViewLevel);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.viewLevel).to.equal(sViewLevel);
					});
				});
				
				it("sap.ui5.routing.config.controlAggregation in manifest.json should be updated on change event of controlAggregation text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sControlAggregation = "tables";
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='controlAggregation']", sControlAggregation);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.controlAggregation).to.equal(sControlAggregation);
					});
				});
				
				it("sap.ui5.routing.config.transition in manifest.json should be updated on change event of transition text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sTransition = "show";
					var oUi5ControlDom = oRoutingController.byId("defaultConfiguration").$().find("input[name='transition']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sTransition);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.transition).to.equal(sTransition);
					});
				});
				
				it("sap.ui5.routing.config.targetParent in manifest.json should be updated on change event of targetParent text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sTargetParent = "testTarget";
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='targetParent']", sTargetParent);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.targetParent).to.equal(sTargetParent);
					});
				});
				
				it("sap.ui5.routing.config.parent in manifest.json should be updated on change event of parent text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sParent = "testParent";
					updateTextFieldValue("div[id$='defaultConfiguration'] input[name='parent']", sParent);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.parent).to.equal(sParent);
					});
				});
				
				it("sap.ui5.routing.config.clearAggregation in manifest.json should be updated on change event of clearAggregation text field in default configuration section", function() {
					var oShowMoreLink = oRoutingController.byId("linkMoreProperties");
					oShowMoreLink.$().trigger("click");
					sap.ui.getCore().applyChanges();
					
					var sClearAggregation = "false";
					var oUi5ControlDom = oRoutingController.byId("defaultConfiguration").$().find("input[name='clearAggregation']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sClearAggregation);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.clearAggregation).to.equal(sClearAggregation);
					});
				});
				
				it("sap.ui5.routing.config.bypassed in manifest.json should be updated on click event of adding a target", function() {
					var addByPassedTargetsButton = oRoutingController.byId("addByPassedTargets");
					addByPassedTargetsButton.$().trigger("click");
					
					var sTarget = "worklist";
					var oUi5ControlDom = jQuery("div[id*='appDescriptorRoutingCombo']")[0];
					updateComboBoxValue(oUi5ControlDom, sTarget);
					var $okButton = sap.ui.getCore().byId(jQuery("button:contains('OK')")[0].id);
					$okButton.$().trigger("click");
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.bypassed.target).to.have.length(3);
						expect(oManifest["sap.ui5"].routing.config.bypassed.target[2]).to.equal(sTarget);
					});
				});
				
				it("sap.ui5.routing.config.bypassed in manifest.json should be updated on click event of removing a target", function() {
					var oManageTargetsList = oRoutingController.byId("defaultConfiguration");
					var $notFoundByPassedTarget = sap.ui.getCore().byId(oManageTargetsList.$().find("button span:contains('worklist')").parent()[0].id);
					$notFoundByPassedTarget.$().trigger("click");
					
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.config.bypassed.target).to.have.length(2);
						expect(oManifest["sap.ui5"].routing.config.bypassed.target[0]).to.equal("notFound");
						expect(oManifest["sap.ui5"].routing.config.bypassed.target[1]).to.equal("objectNotFound");
					});
				});
				
				//Add Manage Targets
				it("sap.ui5.routing.targets in ui container should be updated on change event of  '+' - New target should be added", function() {
					var sNewTarget = "testTarget";
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					updateListBoxWithAddRemove(oManageTargetsList, [sNewTarget], "add");
					return getUpdatedManifest().then(function(oManifest) {
						var aTarget = oManifest["sap.ui5"].routing.targets;
						expect(Object.keys(aTarget)[4]).to.equal(sNewTarget);
					});
				});
				
				//Remove Manage Targets
				it("sap.ui5.routing.targets in ui container should be updated on change event of  '-' - Target should be removed", function() {
					var sNewTarget = "testTarget";
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					updateListBoxWithAddRemove(oManageTargetsList, [sNewTarget], "remove");
					return getUpdatedManifest().then(function(oManifest) {
						var aTarget = oManifest["sap.ui5"].routing.targets;
						expect(aTarget).to.not.include.keys(sNewTarget);
					});
				});
				
				it("sap.ui5.routing.targets.viewName in manifest.json should be updated on change event of viewName text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sViewName = "testViewName";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsViewName']", sViewName);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.viewName).to.equal(sViewName);
					});
				});
				
				it("sap.ui5.routing.targets.viewId in manifest.json should be updated on change event of viewId text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sViewId = "testViewId";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsViewId']", sViewId);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.viewId).to.equal(sViewId);
					});
				});
				
				it("sap.ui5.routing.targets.viewLevel in manifest.json should be updated on change event of viewLevel text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var iViewLevel = 3;
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsViewLevel']", iViewLevel);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.viewLevel).to.equal(iViewLevel);
					});
				});
				
				it("sap.ui5.routing.targets.controlAggregation in manifest.json should be updated on change event of controlAggregation text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sControlAggregation = 3;
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsControlAggregation']", sControlAggregation);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.controlAggregation).to.equal(sControlAggregation);
					});
				});
				
				it("sap.ui5.routing.targets.controlId in manifest.json should be updated on change event of controlId text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sControlId = "testControlId";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsControlID']", sControlId);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.controlId).to.equal(sControlId);
					});
				});
				
				it("sap.ui5.routing.targets.viewPath in manifest.json should be updated on change event of viewPath text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sTargetsViewPath = "testViewPath";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsViewPath']", sTargetsViewPath);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.viewPath).to.equal(sTargetsViewPath);
					});
				});
				
				it("sap.ui5.routing.targets.viewType in manifest.json should be updated on change event of viewType text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sViewType = "HTML";
					var oUi5ControlDom = oRoutingController.byId("ManageTargets").$().find("input[name='targetsViewType']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sViewType);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.viewType).to.equal(sViewType);
					});
				});
				
				it("sap.ui5.routing.targets.transition in manifest.json should be updated on change event of transition text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sTransition = "flip";
					var oUi5ControlDom = oRoutingController.byId("ManageTargets").$().find("input[name='targetsTransition']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sTransition);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.transition).to.equal(sTransition);
					});
				});
				
				it("sap.ui5.routing.targets.parent in manifest.json should be updated on change event of parent text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sParent = "testParent";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsParent']", sParent);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.parent).to.equal(sParent);
					});
				});
				
				it("sap.ui5.routing.targets.clearAggregation in manifest.json should be updated on change event of clearAggregation text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sClearAggregation = "false";
					var oUi5ControlDom = oRoutingController.byId("ManageTargets").$().find("input[name='targetsClearAggregation']").parent()[0];
					updateComboBoxValue(oUi5ControlDom, sClearAggregation);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.clearAggregation).to.equal(sClearAggregation);
					});
				});
				
				it("sap.ui5.routing.targets.targetParent in manifest.json should be updated on change event of targetParent text field in Manage Targets section", function() {
					var oManageTargetsList = oRoutingController.byId("manageTargetsList");
					oManageTargetsList._oList.fireSelect({selectedItem: oManageTargetsList.getItems()[0]});
					
					var sTargetParent = "testTargetParent";
					updateTextFieldValue("div[id*='ManageTargetsDetails'] input[name='targetsTargetParent']", sTargetParent);
					return getUpdatedManifest().then(function(oManifest) {
						expect(oManifest["sap.ui5"].routing.targets.worklist.targetParent).to.equal(sTargetParent);
					});
				});
				
			});
		});
	});

});