define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Editor data binding display", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var w5gTestUtils, oWysiwygEditorService, mDocuments;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (util) {
					w5gTestUtils = util;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
						mDocuments = mDocs;
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("open w5g editor with databinding in view", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oPage = oView.byId("page");
					var oList = oView.byId("list");
					var oListItem = oList.getItems()[0];
					var oButton = oView.byId("button");
					assert.equal(oPage.getTitle(), "{i18n>MASTER_TITLE}", "string should match binding path");
					assert.equal(oListItem.getNumberUnit(), "{NetPriceAmount}", "string should match binding path");
					assert.equal(oListItem.getNumber(), "{DistributionChannel}", "string should match binding path");
					assert.equal(oListItem.getTitle(), "{Division}", "string should match binding path");
					assert.equal(oListItem.getAttributes()[0].getText(), "{SalesOrderNumber}", "string should match binding path");
					assert.equal(oListItem.getAttributes()[1].getText(), "{Division}", "string should match binding path");
					assert.equal(oButton.getText(), "{ID}", "string should match binding path");
				});
			});
		});

		function changePropertyUsingPanelForControl(oControl, sPropName, propValue) {
			return getPropertyPanelValueForControl(oControl, sPropName).then(function (oProperty) {
				oProperty.setValue(propValue).fireChange({newValue: propValue});
			});
		}

		function getPropertyPanelValueForControl(oControl, sPropName) {
			return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService).then(function () {
				return w5gTestUtils.getFieldByInnerId(sPropName);
			});
		}

		function testPropValueViaPropertyPanel(sAttribute, sVal, fnRetrieveControlFromView) {
			return assert.eventually.equal(w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
				return oWysiwygEditorService.getScope().then(function (oScope) {
					var oView = w5gTestUtils.getViewFromScope(oScope);
					var oControl = fnRetrieveControlFromView(oView);
					var propValuePromise = getPropertyPanelValueForControl(oControl, sAttribute, oScope);
					return Q.all([propValuePromise, oWysiwygEditorService.flush()]).spread(function (propVal) {
						return propVal.getValue();
					});
				});
			}), sVal, sVal ? 'value of attribute ' + sAttribute + ' should be ' + sVal : 'attribute ' + sAttribute + ' should be empty');
		}

		var _testChangeViaPropertyPanel = function (bSuccess, sAttribute, newVal, sId, fnRetrieveControlFromView, sTooltip) {
			if (!_.isFunction(fnRetrieveControlFromView)) {
				sTooltip = fnRetrieveControlFromView;
				fnRetrieveControlFromView = function (oView) {
					return oView.byId(sId);
				};
			}
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oButton = fnRetrieveControlFromView(oView);
					return changePropertyUsingPanelForControl(oButton, sAttribute, newVal)
						.then(function () {
							return oWysiwygEditorService.flush();
						}).then(function () {
							return mDocuments.oDatabindingViewDoc.getContent();
						}).then(function (sContent) {
							var oFieldByInnerId = w5gTestUtils.getFieldByInnerId(sAttribute);
							assert.equal(oFieldByInnerId.getValue(), newVal, sId + " " + sAttribute + " attribute should change to " + newVal);
							if (bSuccess) {
								assert.equal(w5gTestUtils.getAttributeFromXML(sContent, sId, sAttribute), newVal, sId + " " + sAttribute + " attribute should change to " + newVal);
								assert.equal(oFieldByInnerId.getValueState(), "None", "Valid value should result in no state");
								expect(oFieldByInnerId.getTooltip()).to.be.falsy;
							} else {
								expect(sContent).to.be.equal(mDocuments.oDatabindingViewDoc.__sOldContent);
								expect(oFieldByInnerId.getValueState()).to.be.equal("Error");
								if (sTooltip) {
									expect(oFieldByInnerId.getTooltip()).to.be.equal(sTooltip);
								}
							}
						});
				});
			});
		};

		var testInvalidChangeViaPropertyPanel = _.partial(_testChangeViaPropertyPanel, false);
		var testChangeViaPropertyPanel = _.partial(_testChangeViaPropertyPanel, true);
		it("Change template property via property pane and check the xml code after flush", function () {
			return testChangeViaPropertyPanel("busyIndicatorDelay", 500, "mainListItem", function retrieveControlFromView(oView) {
				var oList = oView.byId("list");
				return oList.getItems()[0];
			});
		});

		it("Change button property via property pane and check the xml code after flush", function () {
			return testChangeViaPropertyPanel("text", "A text!!", "button");
		});

		it("Test that id value is in the property panel if explicitly declared in the view", function () {
			return testPropValueViaPropertyPanel("id", "button", function (oView) {
				return oView.byId("button");
			});
		});

		it("Test that id value is not in the property panel on generated id", function () {
			return testPropValueViaPropertyPanel("id", "", function (oView) {
				//returns the second child of the page element
				return oView.byId("page").getContent()[1];
			});
		});


		it("Change control integer property via property pane to an empty string and check its stays empty and marked as invalid", function () {
			return testInvalidChangeViaPropertyPanel("busyIndicatorDelay", "", "mainListItem", function retrieveControlFromView(oView) {
				var oList = oView.byId("list");
				return oList.getItems()[0];
			});
		});

		it("Check float number as an input for an integer property (bug#1570171788)", function () {
			return testInvalidChangeViaPropertyPanel("busyIndicatorDelay", "10.5", "list");
		});

		it("Check sap.m.Column property validator for minScreenWidth when validation fail", function () {
			return testInvalidChangeViaPropertyPanel("minScreenWidth", "Deskto", "column",
				'Min Screen Width: Value "Deskto" of type String could not be parsed. invalid CSS size("px", "em", "rem" required) or sap.m.ScreenSize enumeration for property "minScreenWidth" of null');
		});

		it("Check sap.m.Column property validator for minScreenWidth when validation pass with enum value", function () {
			return testChangeViaPropertyPanel("minScreenWidth", "Desktop", "column");
		});

		it("Check sap.m.Column property validator for minScreenWidth when validation pass with pixels value", function () {
			return testChangeViaPropertyPanel("minScreenWidth", "11px", "column");
		});

		it("Change property id of button via property pane and check the xml code after flush", function () {
			var attribute = "id", controlId = "button", value = "_" + controlId + "_";
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					return changePropertyUsingPanelForControl(oView.byId(controlId), attribute, value)
						.then(function () {
							return oWysiwygEditorService.flush();
						}).then(function () {
							return mDocuments.oDatabindingViewDoc.getContent();
						}).then(function (sContent) {
							var oFieldByInnerId = w5gTestUtils.getFieldByInnerId(attribute);
							assert.equal(oFieldByInnerId.getValue(), value, controlId + " " + attribute + " attribute should change to " + value);
							assert.equal(w5gTestUtils.getAttributeFromXML(sContent, value, attribute), value, controlId + " " + attribute + " attribute should change to " + value);
							assert.equal(oFieldByInnerId.getValueState(), "None", "Valid value should result in no state");
							expect(oFieldByInnerId.getTooltip()).to.be.falsy;
						});
				});
			});
		});

		it("Change invalid property id of button via property pane and check the xml code after flush", function () {
			var attribute = "id", controlId = "button", value = "_ " + controlId + "_";
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					return changePropertyUsingPanelForControl(oView.byId(controlId), attribute, value)
						.then(function () {
							return oWysiwygEditorService.flush();
						}).then(function () {
							return mDocuments.oDatabindingViewDoc.getContent();
						}).then(function (sContent) {
							var oFieldByInnerId = w5gTestUtils.getFieldByInnerId(attribute);
							assert.equal(oFieldByInnerId.getValue(), value, controlId + " " + attribute + " attribute NOT should change to " + value);
							assert.equal(w5gTestUtils.getAttributeFromXML(sContent, controlId, attribute), controlId, controlId + " " + attribute + " attribute should change to " + value);
							assert.equal(oFieldByInnerId.getValueState(), "Error", "Valid value should result in error state");
							expect(oFieldByInnerId.getTooltip()).to.be.defined;
						});
				});
			});
		});

		it("Change layout property of input field inside the 'simpleform' via property pane and check the form 'onLayoutDataChange' invoked", function () {
			var attribute = "linebreak", value = "true", controlId = "__data10";
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var d = Q.defer();
					var form = oView.byId("SimpleForm").getAggregation("form");
					form.onAfterRendering = function () {
						d.resolve();
					};
					return changePropertyUsingPanelForControl(oView.byId(controlId), attribute, value)
						.then(function () {
							return oWysiwygEditorService.flush();
						}).then(function () {
							return d.promise;
						}).then(function () {
							return mDocuments.oViewDoc.getContent();
						}).then(function (sContent) {
							var oFieldByInnerId = w5gTestUtils.getFieldByInnerId(attribute);
							assert.equal(oFieldByInnerId.getValue(), value, controlId + " " + attribute + " attribute should change to " + value);
							assert.equal(w5gTestUtils.getAttributeFromXML(sContent, controlId, attribute), value, controlId + " " + attribute + " attribute should change to " + value);
							assert.equal(oFieldByInnerId.getValueState(), "None", "Valid value should result in no state");
							expect(oFieldByInnerId.getTooltip()).to.be.falsy;
						});
				});
			});
		});
	});
});
