define(["STF"], function (STF) {
	"use strict";
	var suiteName = "Associations Tests", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, oSettings, W5gPropertiesModel, w5gTestUtils, oContent, oUserNotification, oWysiwygEditorService,
			mDocuments, sEntitySetBefore = "", w5gUtils;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service1/w5geditor.html"
			}).
			then(function (oWindow) {
				jQuery = oWindow.jQuery;
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils",
					"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/models/W5gPropertiesModel",
					"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils"]).spread(function (util, _W5gPropertiesModel, _W5gUtils) {
					w5gTestUtils = util;
					W5gPropertiesModel = _W5gPropertiesModel;
					var oProjectSettings = getService('setting.project');
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

		beforeEach(function () {
			sEntitySetBefore = oSettings[mDocuments.oAssociationsView.getEntity().getProjectRelativePath()].entitySet;
			return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oAssociationsView);
		});

		afterEach(function () {
			//restore the previous binding set value
			oSettings[mDocuments.oAssociationsView.getEntity().getProjectRelativePath()].entitySet = sEntitySetBefore;
			return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oAssociationsView);
		});

		it("Sets list item as template", function () {
			oUserNotification.setConfirmValue(true);
			var oTestedControl =
			{
				sIdOfTestedControl1: "listItem2",
				sXmlAggregationAttribute1: "items",
				sContainerXmlNodeId1: "list",
				sExpectedBindingValue1: "{/SalesOrders}"
			};

			/**
			 *
			 * @param mTestedControl {{sIdOfTestedControl1: string, sXmlAggregationAttribute1: string, sContainerXmlNodeId1: string, sExpectedBindingValue1: string}} An object describing properties of the tested control
			 * @param mTestedControl.sIdOfToBeTemplateItem {string} The ID of the control that needs to be set as a template. A list item for example.
			 * @param mTestedControl.sXmlAggregationAttribute {string} The name of the aggregation in the XML that contains the item that should be a template.
			 * @param mTestedControl.sContainerXmlNodeId {string} The ID of the control in the XML that contains the aggregation that should be populated by the template.
			 * @param mTestedControl.sExpectedBindingValue {string} The expected binding value of the aggregation of the control
			 *
			 * @param sXmlContent {string} The content of the XML view after making an item a template
			 */
			function validateXmlAfterBinding(mTestedControl, sXmlContent) {
				var oContainerXmlNode = w5gTestUtils.getNodeFromXMLById(sXmlContent, mTestedControl.sContainerXmlNodeId1);
				var sAggregationAttrValue = oContainerXmlNode.attr(mTestedControl.sXmlAggregationAttribute1);
				assert.equal(sAggregationAttrValue, mTestedControl.sExpectedBindingValue1, mTestedControl.sIdOfTestedControl1 + " " + mTestedControl.sXmlAggregationAttribute1 + " attribute binding should be " + mTestedControl.sExpectedBindingValue1);
				var aNodeLeftChildren = oContainerXmlNode.find(mTestedControl.sXmlAggregationAttribute1).children();
				assert.equal(aNodeLeftChildren.length, 1, "only one child should be left");
				assert.equal(aNodeLeftChildren[0].id, mTestedControl.sIdOfTestedControl1, "Item with the ID: " + mTestedControl.sIdOfTestedControl1 + " should be the one to survive");
			}

			return oWysiwygEditorService.getRoot().then(function (oView) {
				//We want the promises in the loop to be done sequentially
				//var oPromise = Q();
				var oToBeTemplateItem1 = oView.byId(oTestedControl.sIdOfTestedControl1);
				var oParentOfTestedItem = oToBeTemplateItem1.getParent();
				//Each iteration we add a "then" to the end of our promise chain
				// oPromise = oPromise.then(function () {
				return oWysiwygEditorService.selectUI5Control(oToBeTemplateItem1).then(function () {
					return w5gTestUtils.selectAndRefreshUI(oToBeTemplateItem1, oWysiwygEditorService);
				}).then(function () {
					var oSetAsTemplateLabel = jQuery("label:contains('Set as template')");
					assert.equal(1, oSetAsTemplateLabel.length);
					var q = Q.defer();
					var _resolve = function () {
						oWysiwygEditorService.detachEvent("bindingChanged", _resolve);
						q.resolve();
					};
					oSetAsTemplateLabel.prev().focus().trigger("click");
					oWysiwygEditorService.attachEvent("bindingChanged", _resolve);
					return q.promise;
				}).then(function () {
					return oWysiwygEditorService.flush();
				}).then(function () {
					return mDocuments.oAssociationsView.getContent();
				}).then(function (sContent) {
					validateXmlAfterBinding(oTestedControl, sContent);
					var oTemplate = oParentOfTestedItem.getBindingInfo(oTestedControl.sXmlAggregationAttribute1).template;
					assert.ok(oTemplate.__XMLNode && oTemplate.__XMLNode === oToBeTemplateItem1.__XMLNode, "XML node is correct");
					assert.ok(oTemplate.__XMLRootNode && oTemplate.__XMLRootNode === oToBeTemplateItem1.__XMLRootNode, "Root XML node is correct");
				}).then(function () {
					var oDataSetInput = jQuery("#__editor0--dataSet-input");
					assert.equal(1, oDataSetInput.length);
					oDataSetInput.prev().focus().trigger("click");
					var oUnorderedList = jQuery("#__editor0--dataSet-lb-list");
					assert.equal(1, oUnorderedList.length);
					var oListBoxText = jQuery("#__item1-__editor0--dataSet-12");
					assert.equal(1, oListBoxText.length);
					var q1 = Q.defer();
					var _resolve = function () {
						oWysiwygEditorService.detachEvent("viewElementSelected", _resolve);
						oWysiwygEditorService.getSelection().then(function (aSelection) {
							q1.resolve(aSelection);
						}).done();
					};
					oWysiwygEditorService.attachEvent("viewElementSelected", _resolve);
					oListBoxText.prev().focus().trigger("click");
					return q1.promise;
				}).then(function (aSelection) { // imitating selection on properties pane as the result of fire selection change
					return w5gTestUtils.selectAndRefreshUI(aSelection[0].control, oWysiwygEditorService);
				}).then(function () {
					return oWysiwygEditorService.flush();
				}).then(function () {
					return mDocuments.oAssociationsView.getContent();
				}).then(function (sContent) {
					var oTestedListItem =
					{
						sIdOfTestedControl1: "listItem2",
						sXmlAggregationAttribute1: "items",
						sContainerXmlNodeId1: "list",
						sExpectedBindingValue1: "{OrderItems}"
					};

					validateXmlAfterBinding(oTestedListItem, sContent);
					var oTemplate = oParentOfTestedItem.getBindingInfo(oTestedListItem.sXmlAggregationAttribute1).template;
					assert.ok(oTemplate.__XMLNode && oTemplate.__XMLNode === oToBeTemplateItem1.__XMLNode, "XML node is correct");
					assert.ok(oTemplate.__XMLRootNode && oTemplate.__XMLRootNode === oToBeTemplateItem1.__XMLRootNode, "Root XML node is correct");
				}).then(function () {
					// Bind string property via property pane data binding and check the xml code after flush
					var sId = "listItem2";
					var sBinding = "ItemClassification";
					var retrieveControlFromViewFunction = function (oView) {
						return oView.byId(sId);
					};
					var sAttribute = "description";

					var q2 = w5gTestUtils.event2Promise(oWysiwygEditorService, "bindingChanged");
					w5gTestUtils.bindPropertyUsingDialog(sAttribute, sBinding, assert);
					return q2.then(function () {
						return oWysiwygEditorService.flush();
					}).then(function () {
						return mDocuments.oAssociationsView.getContent();
					}).then(function (sContent) {
						assert.equal(w5gTestUtils.getAttributeFromXML(sContent, sId, sAttribute), '{' + sBinding + '}', sId + " " + sAttribute + " attribute should change to " + sBinding);
					});
				});
				//return oPromise;
			});
		});
	});
});