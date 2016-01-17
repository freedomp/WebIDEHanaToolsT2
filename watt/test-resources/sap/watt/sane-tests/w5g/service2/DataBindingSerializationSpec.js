define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Editor data binding serialization", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, oProjectSettings, oSettings, W5gPropertiesModel, w5gTestUtils, oContent, oUserNotification,
			oWysiwygEditorService, mDocuments,
			sEntitySetBefore = "", w5gUtils;

		before(function () {
			return STF.startWebIde(suiteName, {config: "w5g/config.json", html: "w5g/service2/w5geditor.html"}).
			then(function (oWindow) {
				jQuery = oWindow.jQuery;
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils",
					"sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/models/W5gPropertiesModel",
					"sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor/utils/W5gUtils"]).spread(function (util, _W5gPropertiesModel, _W5gUtils) {
					w5gTestUtils = util;
					W5gPropertiesModel = _W5gPropertiesModel;
					oProjectSettings = getService('setting.project');
					oSettings = w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					oUserNotification = getService('usernotification');
					oContent = getService('content');
					w5gUtils = _W5gUtils;
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
						mDocuments = mDocs;
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		describe("data binding panel changes with serialization", function () {
			beforeEach(function () {
				sEntitySetBefore = oSettings[mDocuments.oDataBindingTestViewDoc.getEntity().getProjectRelativePath()].entitySet;
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oDataBindingTestViewDoc);
			});

			afterEach(function () {
				//restore the previous binding set value
				oSettings[mDocuments.oDataBindingTestViewDoc.getEntity().getProjectRelativePath()].entitySet = sEntitySetBefore;
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oDataBindingTestViewDoc);
			});

			it("Bind boolean property via property pane data binding and check the xml code after flush", function () {
				var sId = "button";
				var sBinding = "persistNotifications";
				var sAttribute = "busy";
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oBindingChangedPromise = w5gTestUtils.event2Promise(oWysiwygEditorService, "bindingChanged");
					return w5gTestUtils.selectAndRefreshUI(oView.byId(sId), oWysiwygEditorService).then(function () {
						w5gTestUtils.bindPropertyUsingDialog(sAttribute, sBinding, assert);
						return oBindingChangedPromise;
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oDataBindingTestViewDoc.getContent();
					});
				}).then(function (sContent) {
					assert.equal(w5gTestUtils.getAttributeFromXML(sContent, sId, sAttribute), '{' + sBinding + '}', sId + " " + sAttribute + " attribute should change to " + sBinding);
				});
			});

			it("Bind boolean property twice via property pane data binding and check the xml code after flush", function () {
				var sId = "button";
				var sBinding = "persistNotifications", sBindingTest = "testNotifications";
				var retrieveControlFromViewFunction = function (oView) {
					return oView.byId(sId);
				};
				var sAttribute = "busy";
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oButton = retrieveControlFromViewFunction(oView);
					var oBindingChangedPromise = w5gTestUtils.event2Promise(oWysiwygEditorService, "bindingChanged");
					return w5gTestUtils.selectAndRefreshUI(oButton, oWysiwygEditorService).then(function () {
						w5gTestUtils.bindPropertyUsingDialog(sAttribute, sBinding, assert);
						return oBindingChangedPromise;
					}).then(function () {
						oBindingChangedPromise = w5gTestUtils.event2Promise(oWysiwygEditorService, "bindingChanged");
						return w5gTestUtils.selectAndRefreshUI(oButton, oWysiwygEditorService).then(function () {
							w5gTestUtils.bindPropertyUsingDialog(sAttribute, sBindingTest, assert, true);
							return oBindingChangedPromise;
						}).then(function () {
							return oWysiwygEditorService.flush();
						}).then(function () {
							return mDocuments.oDataBindingTestViewDoc.getContent();
						});
					}).then(function (sContent) {
						assert.equal(w5gTestUtils.getAttributeFromXML(sContent, sId, sAttribute), '{' + sBindingTest + '}{' + sBinding + '}', sId + " " + sAttribute + " attribute should change to " + sBinding);
					});
				});
			});

			it("Change view dataBinding set via data panel and verify xml code is not changed", function () {
				var sBinding = "NotificationCollection";
				oUserNotification.setConfirmValue(true);
				oContent.getCurrentDocument = function () {
					var p = Q.defer();
					p.resolve(mDocuments.oDataBindingTestViewDoc);
					return p.promise;
				};
				return oWysiwygEditorService.getRoot().then(function (oView) {
					return w5gTestUtils.selectAndRefreshUI(oView, oWysiwygEditorService).then(function () {
						var aDataSetExpandButton = jQuery("[id$='--" + "dataSet-icon" + "']").next();
						assert.equal(aDataSetExpandButton.length, 1);
						aDataSetExpandButton.trigger("click");
						var aPropertyToBind = jQuery('li:contains("' + sBinding + '")');
						assert.equal(aPropertyToBind.length, 1);
						var oDeferred = Q.defer();
						var fnOrig = oProjectSettings.setProjectSettings;
						oProjectSettings.setProjectSettings = function () {
							fnOrig.apply(this, arguments);
							oProjectSettings.setProjectSettings = fnOrig;
							oDeferred.resolve();
						};
						aPropertyToBind.trigger("click");
						return oDeferred.promise;
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oDataBindingTestViewDoc.getContent();
					});
				}).then(function () {
					assert.equal(oSettings[mDocuments.oDataBindingTestViewDoc.getEntity().getProjectRelativePath()].entitySet, sBinding, "view data binding should change to " + sBinding);
				});
			});

			it("SimpleForm content element cannot be a template (bug#1570116755)", function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var aPromises = oView.byId("form").getContent().map(function (_oContent) {
						//TODO these 6 promise chains might interfere with one another, need to think of making them dependent on each other
						return w5gTestUtils.selectAndRefreshUI(_oContent, oWysiwygEditorService).then(function () {
							expect(jQuery(".sapWysiwygDataBindingEditor .sapUiCb").length).to.be.zero;
						});
					});
					expect(aPromises.length).to.equal(6);
					return Q.all(aPromises);
				});
			});

		});

		describe("data unbinding", function () {
			it("unbind control after removing its template (verify view and xml)", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oDatabindingViewDoc, function () {
					return oWysiwygEditorService.getRoot().then(function (oView) {
						var oList = oView.byId("list");
						assert.equal(oList.isBound("items"), true, "list is bound before removing template");
						var oListItem = oList.getItems()[0];
						return w5gTestUtils.selectAndRefreshUI(oListItem, oWysiwygEditorService).then(function () {
								return oWysiwygEditorService.deleteUI5Control();
							})
							.then(_.bindKey(oWysiwygEditorService, 'flush'))
							.then(_.bindKey(mDocuments.oDatabindingViewDoc, 'getContent'))
							.then(function (sContent) {
								assert.equal(oList.isBound("items"), false, "list is not bound after removing template");
								var $list = jQuery.parseXML(sContent).getElementById("list");
								expect($list.getAttribute("items")).to.be.null;
							});
					});
				});
			});
		});

		describe("ui5controls attributes module", function () {
			it("controls design time properties priority order", function () {
				function _indexOf(_properties, _name) {
					return _.findIndex(_properties, function (e) {
						return e.name === _name;
					});
				}

				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
					return oWysiwygEditorService.getRoot().then(function (oView) {
						var oControl = oView.byId("button");
						var properties = W5gPropertiesModel.__QUnit_getUi5CtrlProperties(oControl);
						assert.equal(_indexOf(properties, 'text'), 1, "button control :: 'text' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'id'), 0, "button control :: 'id' attribute is not on expected order");
						assert.ok(_indexOf(properties, 'icon') !== -1, "button control :: 'icon' attribute is exists");
						var iIndex = _indexOf(properties, 'textDirection');
						assert.ok(iIndex !== -1, "button control :: 'textDirection' attribute is exists");
						//check enums (ui5 version regression test)
						assert.ok(properties[iIndex].typeObject["RTL"] === "RTL", "button control :: 'textDirection' attribute values are correct");

						var oList = oView.byId("list");
						properties = W5gPropertiesModel.__QUnit_getUi5CtrlProperties(oList);
						assert.equal(_indexOf(properties, 'headerText'), 1, "List control :: 'headerText' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'footerText'), 2, "List control :: 'footerText' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'noDataText'), 3, "List control :: 'noDataText' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'id'), 0, "List control :: 'id' attribute is not on expected order");
						assert.ok(_indexOf(properties, 'growing') !== -1, "List control :: 'growing' attribute is exists");

						var oListItem = oView.byId("obli1");
						properties = W5gPropertiesModel.__QUnit_getUi5CtrlProperties(oListItem);
						assert.equal(_indexOf(properties, 'title'), 1, "ObjectListItem control :: 'title' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'intro'), 2, "ObjectListItem control :: 'intro' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'number'), 3, "ObjectListItem control :: 'number' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'numberUnit'), 4, "ObjectListItem control :: 'numberUnit' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'id'), 0, "ObjectListItem control :: 'id' attribute is not on expected order");

						var oAttribute = oView.byId("bwPVT");
						properties = W5gPropertiesModel.__QUnit_getUi5CtrlProperties(oAttribute);
						assert.equal(_indexOf(properties, 'title'), 2, "ObjectAttribute control :: 'title' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'text'), 1, "ObjectAttribute control :: 'text' attribute is not on expected order");
						assert.equal(_indexOf(properties, 'id'), 0, "ObjectAttribute control :: 'id' attribute is not on expected order");
					});
				});
			});

		});

		describe("Set as template deletes siblings from serialized XML", function () {
			beforeEach(function () {
				sEntitySetBefore = oSettings[mDocuments.oSetTemplateTestDoc.getEntity().getProjectRelativePath()].entitySet;
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oSetTemplateTestDoc);
			});

			afterEach(function () {
				//restore the previous binding set value
				oSettings[mDocuments.oSetTemplateTestDoc.getEntity().getProjectRelativePath()].entitySet = sEntitySetBefore;
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oSetTemplateTestDoc);
			});

			it("Sets as template in list, tile container, and table", function () {
				oUserNotification.setConfirmValue(true);
				var aTestedControls = [
					//List
					{
						sIdOfToBeTemplateItem: "listItem2",
						sXmlAggregationAttribute: "items",
						sContainerXmlNodeId: "list",
						sExpectedBindingValue: "{/SubscriptionCollection}"
					},
					//TileContainer
					{
						sIdOfToBeTemplateItem: "__tile0",
						sXmlAggregationAttribute: "tiles",
						sContainerXmlNodeId: "tileContainer",
						sExpectedBindingValue: "{/SubscriptionCollection}"
					},
					//Table
					{
						sIdOfToBeTemplateItem: "__columnListItem0",
						sXmlAggregationAttribute: "items",
						sContainerXmlNodeId: "testTable",
						sExpectedBindingValue: "{/SubscriptionCollection}"
					}
				];

				/**
				 *
				 * @param mTestedControl {object} A map describing properties of the tested control
				 * @param mTestedControl.sIdOfToBeTemplateItem {string} The ID of the control that needs to be set as a template. A list item for example.
				 * @param mTestedControl.sXmlAggregationAttribute {string} The name of the aggregation in the XML that contains the item that should be a template.
				 * @param mTestedControl.sContainerXmlNodeId {string} The ID of the control in the XML that contains the aggregation that should be populated by the template.
				 * @param mTestedControl.sExpectedBindingValue {string} The expected binding value of the aggregation of the control
				 *
				 * @param sXmlContent {string} The content of the XML view after making an item a template
				 */
				function validateXml(mTestedControl, sXmlContent) {
					var oContainerXmlNode = w5gTestUtils.getNodeFromXMLById(sXmlContent, mTestedControl.sContainerXmlNodeId);
					var sAggregationAttrValue = oContainerXmlNode.attr(mTestedControl.sXmlAggregationAttribute);
					assert.equal(sAggregationAttrValue, mTestedControl.sExpectedBindingValue, mTestedControl.sIdOfToBeTemplateItem + " " + mTestedControl.sXmlAggregationAttribute + " attribute binding should be " + mTestedControl.sExpectedBindingValue);
					var aNodeLeftChildren = oContainerXmlNode.find(mTestedControl.sXmlAggregationAttribute).children();
					assert.equal(aNodeLeftChildren.length, 1, "only one child should be left");
					assert.equal(aNodeLeftChildren[0].id, mTestedControl.sIdOfToBeTemplateItem, "Item with the ID: " + mTestedControl.sIdOfToBeTemplateItem + " should be the one to survive");
				}

				return oWysiwygEditorService.getRoot().then(function (oView) {
					//We want the promises in the loop to be done sequentially
					var oPromise = Q();
					_.forEach(aTestedControls, function (testedControl) {
						var oToBeTemplateItem = oView.byId(testedControl.sIdOfToBeTemplateItem);
						var oParent = oToBeTemplateItem.getParent();
						//Each iteration we add a "then" to the end of our promise chain
						oPromise = oPromise.then(function () {
							return w5gTestUtils.selectAndRefreshUI(oToBeTemplateItem, oWysiwygEditorService).delay(500) //TileContainer.prototype._calculatePositions raise error otherwise (width of null)
								.then(function () {
									var oSetAsTemplateLabel = jQuery("label:contains('Set as template')");
									assert.equal(1, oSetAsTemplateLabel.length);
									var oBindingChangedPromise = w5gTestUtils.event2Promise(oWysiwygEditorService, "bindingChanged");
									oSetAsTemplateLabel.prev().focus().trigger("click");
									return oBindingChangedPromise;
								}).then(function () {
									return oWysiwygEditorService.flush();
								}).then(function () {
									return mDocuments.oSetTemplateTestDoc.getContent();
								}).then(function (sContent) {
									validateXml(testedControl, sContent);
									var oTemplate = oParent.getBindingInfo(testedControl.sXmlAggregationAttribute).template;
									assert.ok(oTemplate.__XMLNode && oTemplate.__XMLNode === oToBeTemplateItem.__XMLNode, "XML node is correct");
									assert.ok(oTemplate.__XMLRootNode && oTemplate.__XMLRootNode === oToBeTemplateItem.__XMLRootNode, "Root XML node is correct");
								});
						});
					});
					return oPromise;
				});
			});

			it("Sets as template in list - check and uncheck", function () {
				oUserNotification.setConfirmValue(true);
				var testedControl =
					//List
				{
					sIdOfToBeTemplateItem: "listItem2",
					sXmlAggregationAttribute: "items",
					sContainerXmlNodeId: "list",
					sExpectedBindingValue: "{/SubscriptionCollection}"
				};

				function fakeClickWithDelay(nDelay) {
					var oSetAsTemplateLabel = jQuery("label:contains('Set as template')");
					assert.equal(1, oSetAsTemplateLabel.length);
					oSetAsTemplateLabel.prev().focus().trigger("click");
					return Q.delay(nDelay);
				}

				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oToBeTemplateItem = oView.byId(testedControl.sIdOfToBeTemplateItem);
					return w5gTestUtils.selectAndRefreshUI(oToBeTemplateItem, oWysiwygEditorService).then(function () {
						return fakeClickWithDelay(1000);
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						var oOverlay = w5gUtils.getControlOverlay(oToBeTemplateItem);
						assert.ok(oOverlay, "Control overlay is not created.");
						assert.equal(oOverlay.$().attr('badge-data'), "Template", "Overlay badge attribute wrong.");
					}).then(function () {
						return w5gTestUtils.selectAndRefreshUI(oView.byId("__tile0"), oWysiwygEditorService);
					}).then(function () {
						return w5gTestUtils.selectAndRefreshUI(oToBeTemplateItem, oWysiwygEditorService);
					}).then(function () {
						return fakeClickWithDelay(20);
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						var oOverlay = w5gUtils.getControlOverlay(oToBeTemplateItem);
						assert.ok(oOverlay, "Control overlay is not created.");
						assert.notOk(oOverlay.$().attr('badge-data'), "Overlay badge attribute wrong.");
					});
				});
			});

			it("Test 'selected' properties of parent of removed control", function () {
				oUserNotification.setConfirmValue(true);

				return oWysiwygEditorService.getScope().then(function (oScope) {
					var oView = w5gTestUtils.getViewFromScope(oScope);

					var oXmlNode, sSelectedItemId, sSelectedItem;
					var oParent = oView.byId("__bar2");
					var sSelectedKey = oParent.getSelectedKey();
					var oControl = oView.byId(sSelectedKey);

					return oWysiwygEditorService.deleteUI5Control(oControl).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oSetTemplateTestDoc.getContent();
					}).then(function (sContent) {
						oXmlNode = w5gTestUtils.getNodeFromXMLById(sContent, "__bar2");
						assert.notEqual(oParent.getSelectedKey(), sSelectedKey, "selectedKey has been changed");
						assert.equal(oParent.getSelectedKey(), "__xmlview0--__filter1", "selectedKey has expected value");
						assert.equal(oXmlNode.attr("selectedKey"), oParent.getSelectedKey(), "xml has updated selectedKey");
					}).then(function () {
						oParent = oView.byId("__select1");
						oControl = oView.byId("__item6");
						sSelectedKey = oParent.getSelectedKey();
						sSelectedItemId = oParent.getSelectedItemId();
						sSelectedItem = oParent.getSelectedItem();
						return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService);
					}).then(function () {
						var oSetAsTemplateLabel = jQuery("label:contains('Set as template')");
						assert.equal(1, oSetAsTemplateLabel.length);
						var q1 = Q.defer();
						var _resolve = function () {
							oWysiwygEditorService.detachEvent("bindingChanged", _resolve);
							q1.resolve();
						};
						oWysiwygEditorService.attachEvent("bindingChanged", _resolve);
						oSetAsTemplateLabel.prev().trigger("click");
						return q1.promise;
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oSetTemplateTestDoc.getContent();
					}).then(function (sContent) {
						oXmlNode = w5gTestUtils.getNodeFromXMLById(sContent, "__select1");
						assert.notEqual(oParent.getSelectedKey(), sSelectedKey, "selectedKey has been changed");
						assert.notEqual(oParent.getSelectedItemId(), sSelectedItemId, "selectedItemId has been changed");
						assert.notEqual(oParent.getSelectedItem(), sSelectedItem, "selectedItem has been changed");

						assert.equal(oXmlNode.attr("selectedKey"), null, "xml has updated selectedKey");
						assert.equal(oXmlNode.attr("selectedItemId"), null, "xml has updated selectedItemId");
						assert.equal(oXmlNode.attr("selectedItem"), null, "xml has updated selectedItem");
					}).then(function () {
						oParent = oView.byId("__select0");
						oControl = oView.byId("__item3");
						sSelectedKey = oParent.getSelectedKey();
						sSelectedItemId = oParent.getSelectedItemId();
						sSelectedItem = oParent.getSelectedItem();
						return w5gTestUtils.selectAndRefreshUI(oControl, oWysiwygEditorService);
					}).then(function () {
						var oSetAsTemplateLabel = jQuery("label:contains('Set as template')");
						assert.equal(1, oSetAsTemplateLabel.length);
						var q1 = Q.defer();
						var _resolve = function () {
							oWysiwygEditorService.detachEvent("bindingChanged", _resolve);
							q1.resolve();
						};
						oWysiwygEditorService.attachEvent("bindingChanged", _resolve);
						oSetAsTemplateLabel.prev().trigger("click");
						return q1.promise;
					}).then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oSetTemplateTestDoc.getContent();
					}).then(function (sContent) {
						oXmlNode = w5gTestUtils.getNodeFromXMLById(sContent, "__select0");
						assert.equal(oParent.getSelectedKey(), sSelectedKey, "selectedKey has old value");
						assert.notEqual(oParent.getSelectedItemId(), sSelectedItemId, "selectedItemId has been changed");
						assert.notEqual(oParent.getSelectedItem(), sSelectedItem, "selectedItem has been changed");

						assert.equal(oXmlNode.attr("selectedKey"), sSelectedKey, "xml has old value");
						assert.equal(oXmlNode.attr("selectedItemId"), null, "xml has updated selectedItemId");
						assert.equal(oXmlNode.attr("selectedItem"), null, "xml has updated selectedItem");
					});
				});
			});
		});
	});
});