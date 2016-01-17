define(["sap/watt/lib/lodash/lodash", "STF"], function (_, STF) {
	"use strict";
	var suiteName = "XML Adapter";
	describe(suiteName, function () {
		var oWindow, jQuery, sap, w5gSerUtils, w5gTestUtils, XMLAdaptListener, XMLManipulator, W5gUtils, ControlMetadata,
			oDesignTime, oXMLManipulator, oDragDropPlugin, oView;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/unit/isolated/config.json",
				html: "w5g/unit/isolated/isolatedUnit.html"
			}).then(function (_oWindow) {
				return STF.require(suiteName, ["sane-tests/w5g/unit/isolated/utils/w5gSerUtils",
						"sane-tests/w5g/w5gTestUtils",
						"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/serialization/XMLManipulator",
						"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/dtplugins/listener/XMLAdaptListener",
						"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
						"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata"])
					.spread(function (_w5gSerUtils, _w5gTestUtils, _XMLManipulator, _XMLAdaptListener, _W5gUtils, _ControlMetadata) {
						w5gSerUtils = _w5gSerUtils;
						w5gTestUtils = _w5gTestUtils;
						XMLManipulator = _XMLManipulator;
						XMLAdaptListener = _XMLAdaptListener;
						W5gUtils = _W5gUtils;
						ControlMetadata = _ControlMetadata;
						oWindow = _oWindow;
						jQuery = oWindow.jQuery;
						sap = oWindow.sap;
						jQuery.sap.registerModulePath("w5g.view", window.W5G_LIBS_PREFIX + "/src/main/webapp/test-resources/sap/watt/sane-tests/w5g/unit/isolated/testdata/designtime/");
						jQuery.sap.require("sap.ui.dt.DesignTime");
						jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.PatchCore");
						jQuery.sap.require("sap.ui.commons.Button");
						jQuery.sap.require("sap.ui.commons.Link");
						// add the property __XMLNode to every control
						sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.PatchCore.patch(oWindow);
					});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function () {
			oDesignTime.destroy();
			oView.destroy();
		});

		function init(sViewName) {
			oView = sap.ui.xmlview(sViewName);
			w5gTestUtils.placeAt("test-view", oView);
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop");
			oDragDropPlugin = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop({
				w5gUtils: W5gUtils,
				controlMetadata: ControlMetadata,
				editor: w5gTestUtils.DummySelectorEditor
			});
			oXMLManipulator = new XMLManipulator(oWindow);
			oDragDropPlugin.setListeners(
				[new XMLAdaptListener(oXMLManipulator, oWindow, W5gUtils)]
			);

			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
			oDesignTime = w5gTestUtils.createDesignTime({
				designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
				rootElements: oView,
				plugins: [oDragDropPlugin]
			});
		}

		describe("XMLManipulator", function () {

			function getContentNode(xml) {
				var node = xml.childNodes[1];
				while (node && node.nodeName !== 'content') {
					node = node.childNodes[1];
				}
				return node;
			}

			//clear content of xml Page to get clean Page
			function clearContentNodeOfXML(xml) {
				var node = getContentNode(xml);
				if (node && node.nodeName === 'content') {
					while (node.childNodes.length > 0) {
						node.removeChild(node.childNodes[0]);
					}
				}
			}

			function validateXMLPropertiesOfControl(fConstructor, oProperties) {
				var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
				clearContentNodeOfXML(oViewXML);
				var oControl = new fConstructor(oProperties);
				var oPage = oView.byId("Page");
				oPage.addContent(oControl);
				oXMLManipulator.emitAddEvent(oControl, "content", oPage.sId, 0);
				var oXmlControl = oViewXML.children[0].children[0].children[0];
				assert.ok(oXmlControl, oXmlControl.tagName);
				for (var sControlProperty in Object.keys(oProperties)) {
					assert.equal(oXmlControl.getAttribute(sControlProperty), oProperties[sControlProperty]);
				}
			}

			//START this test must be first!
			//we need to use clear PatchCore to find regression
			describe("Test PatchCore", function () {
				beforeEach(function () {
					init("w5g.view.SimpleButton");
				});
				afterEach(function () {
					sap.ui.getCore().reset();
				});
				it("Test XML Manipulator for SimpleButton", function () {
					var oButton = new sap.ui.commons.Button();
					assert.ok(oButton.getId() === "__button1", "Button without id");
				});
			});
			//END this test must be first!---


			// Both test checks aggregation content consistency. To understand the test look at tested XML file
			describe("Test XML Manipulation regarding aggregation content", function () {
				beforeEach(function () {
					init("w5g.view.AggregationContentTest1");
				});
				it("Test serialization while adding controls to aggregation with empty content section", function () {
					var oButton = new sap.m.Button({text: "2", width: "100px"});
					var oPage = oView.byId("_page");
					oPage.addContent(oButton);
					oXMLManipulator.emitAddEvent(oButton, "content", oPage.sId, 1);

					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var buttonsArray = oViewXML.getElementsByTagName("Button");
					assert.equal(buttonsArray.length, 2, "Expecting adding second button dispite empty content section");
				});
			});

			describe("Test XML Manipulation regarding aggregation content", function () {
				beforeEach(function () {
					init("w5g.view.AggregationContentTest2");
				});
				it("Test serialization while adding controls to aggregation with not consistent content section", function () {

					var oButton = new sap.m.Button({text: "3", width: "100px"});
					var oPage = oView.byId("_page");
					oPage.addContent(oButton);
					oXMLManipulator.emitAddEvent(oButton, "content", oPage.sId, 2);

					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var buttonsArray = oViewXML.getElementsByTagName("Button");
					assert.equal(buttonsArray.length, 3, "Expecting adding third button dispite nodes outside content section");
				});

			});

			describe("Test XMLManipulator with a view as rootControl", function () {
				beforeEach(function () {
					init("w5g.view.TestWithIconTabBar");
				});

				function changeDataAndValidate(oControl, sKey, sValue, numberOfExpectedCustomDataEntries) {
					numberOfExpectedCustomDataEntries = numberOfExpectedCustomDataEntries || 1;
					oControl.data(sKey, sValue);
					var customDataTag = emitDataChangeAndValidateSizes(oControl, numberOfExpectedCustomDataEntries);
					for (var i = 0; i < customDataTag[0].childNodes.length; i++) {
						if (customDataTag[0].childNodes[i].getAttribute("key") === sKey) {
							assert.equal(customDataTag[0].childNodes[i].getAttribute("value"), sValue, "value must be right");
						}
					}
				}

				function emitDataChangeAndValidateSizes(oControl, numberOfExpectedCustomDataEntries) {
					oXMLManipulator.emitDataEvent(oControl);
					var customDataTag = oControl.__XMLNode.getElementsByTagName("customData");
					assert.equal(customDataTag.length, 1, "custom data should have been added to the XML node");
					assert.equal(customDataTag[0].childNodes.length, numberOfExpectedCustomDataEntries, "number of custom data entries should be " + 1);
					return customDataTag;
				}

				function createArrayOfNodeNames(contentNode) {
					var contentArray = contentNode.childNodes;
					return _.map(contentArray, "nodeName");
				}

				function _traverseNodeTree(oNode, aNodes) {
					if (oNode.nodeType === oNode.ELEMENT_NODE || oNode.nodeType === oNode.COMMENT_NODE) {
						var sNode = oNode.getAttribute("id");
						if (sNode) {
							aNodes.push(oNode.getAttribute("id"));
						}
					}
					oNode = oNode.firstChild;
					while (oNode) {
						_traverseNodeTree(oNode, aNodes);
						oNode = oNode.nextSibling;
					}
					return aNodes;
				}

				it("Test XML Manipulator for IconTabFilter", function () {
					// act
					var oPage = oView.byId("Page");
					var oLink = new sap.ui.commons.Link();
					var oIconTabFilter = oView.byId("filter1");

					oIconTabFilter.addContent(oLink);

					oXMLManipulator.emitAddEvent(oLink, "content", oIconTabFilter.sId, 0);

					// assert
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);

					var aExpectedViewElements = ["sap.ui.core.mvc:View", "Page", "content", "IconTabBar", "items", "filter1", "content", "__link0", "Text", "content"];
					var aViewElements = [];
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);

					assert.deepEqual(aViewElements, aExpectedViewElements, "Link should be added under content");

					oXMLManipulator.emitMoveEvent(oLink, "content", oIconTabFilter.sId, oPage.sId, 0);

					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);

					aExpectedViewElements = ["sap.ui.core.mvc:View", "Page", "content", "__link0", "IconTabBar", "items", "filter1", "content", "Text", "content"];
					aViewElements = [];
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);

					assert.deepEqual(aViewElements, aExpectedViewElements, "Link should be moved from filter to page");

					oXMLManipulator.emitHideEvent(oLink);

					aExpectedViewElements = ["sap.ui.core.mvc:View", "Page", "content", "IconTabBar", "items", "filter1", "content", "Text", "content"];
					aViewElements = [];
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);

					assert.deepEqual(aViewElements, aExpectedViewElements, "Link should be hidden");

				});

				it("Test XML serialization for SimpleForm", function () {

					var oPage = oView.byId("Page");

					var simpleForm = new sap.ui.layout.form.SimpleForm();
					simpleForm.addContent(new sap.ui.core.Title({
						text: "Title"
					}));
					simpleForm.addContent(new sap.m.Label({
						text: "Label 1"
					}));
					simpleForm.addContent(new sap.m.Input({
						text: "Input 1"
					}));

					oXMLManipulator._control2XML(simpleForm, oPage.sId);

					assert.ok(simpleForm.__XMLRootNode, "simpleForm should have a __XMLRootNode property");
					assert.ok(simpleForm.__XMLNode, "simpleForm should have a __XMLNode property");
					assert.equal(simpleForm.__XMLNode.localName, "SimpleForm", "simpleForm __XMLNode root element should be of type SimpleForm");

					var content = simpleForm.getContent();

					assert.ok(content[0].__XMLRootNode, "1st child of simpleForm should have a __XMLRootNode property");
					assert.ok(content[0].__XMLNode, "1st child of simpleForm should have a __XMLNode property");
					assert.equal(content[0].__XMLNode.localName, "Title", "1st child of simpleForm should be of type Title");
					assert.equal(content[0].__XMLNode.getAttribute("text"), "Title", "text attribute of 1st child of simpleForm should contain 'Title'");

					assert.ok(content[1].__XMLRootNode, "2nd child of simpleForm should have a __XMLRootNode property");
					assert.ok(content[1].__XMLNode, "2nd child of simpleForm should have a __XMLNode property");
					assert.equal(content[1].__XMLNode.localName, "Label", "2nd child of simpleForm should be of type Label");
					assert.equal(content[1].__XMLNode.getAttribute("text"), "Label 1", "text attribute of 2nd child of simpleForm should contain 'Label 1'");

					assert.ok(content[2].__XMLRootNode, "3rd child of simpleForm should have a __XMLRootNode property");
					assert.ok(content[2].__XMLNode, "3rd child of simpleForm should have a __XMLNode property");
					assert.equal(content[2].__XMLNode.localName, "Input", "3rd child of simpleForm should be of type Input");

				});

				it("Test XML serialization for IconTanBar", function () {

					var oPage = oView.byId("Page");

					var iconTabBar = new sap.m.IconTabBar();

					iconTabBar.addItem(new sap.m.IconTabFilter({
						showAll: true,
						count: "22",
						text: "Orders"
					}));
					var oShippedIconTabFilter = new sap.m.IconTabFilter({
						count: "5",
						text: "Shipped"
					});
					oShippedIconTabFilter.addContent(new sap.m.Text({
						text: 'MyContent'
					}));
					iconTabBar.addItem(oShippedIconTabFilter);
					iconTabBar.addContent(new sap.m.List({
						items: [new sap.m.StandardListItem({
							title: "ListItem"
						})]
					}));


					oXMLManipulator._control2XML(iconTabBar, oPage.sId);

					assert.ok(iconTabBar.__XMLRootNode, "iconTabBar should have a __XMLRootNode property");
					assert.ok(iconTabBar.__XMLNode, "iconTabBar should have a __XMLNode property");
					assert.equal(iconTabBar.__XMLNode.localName, "IconTabBar", "iconTabBar __XMLNode root element should be of type IconTabBar");

					var items = iconTabBar.getItems();

					assert.ok(items[0].__XMLRootNode, "1st item of iconTabBar should have a __XMLRootNode property");
					assert.ok(items[0].__XMLNode, "1st item of iconTabBar should have a __XMLNode property");
					assert.equal(items[0].__XMLNode.localName, "IconTabFilter", "1st item of iconTabBar should be of type IconTabFilter");
					assert.equal(items[0].__XMLNode.getAttribute("text"), "Orders", "text attribute of 1st item of iconTabBar should contain 'Orders'");

					assert.ok(items[1].__XMLRootNode, "2nd item of iconTabBar should have a __XMLRootNode property");
					assert.ok(items[1].__XMLNode, "2nd item of iconTabBar should have a __XMLNode property");
					assert.equal(items[1].__XMLNode.localName, "IconTabFilter", "2nd item of iconTabBar should be of type IconTabFilter");
					assert.equal(items[1].__XMLNode.getAttribute("text"), "Shipped", "text attribute of 2nd item of iconTabBar should contain 'Shipped'");

					var filterContent = items[1].getContent();

					assert.ok(filterContent[0].__XMLRootNode, "content of 2nd IconTabFilter should have a __XMLRootNode property");
					assert.ok(filterContent[0].__XMLNode, "content of 2nd IconTabFilter should have a __XMLNode property");
					assert.equal(filterContent[0].__XMLNode.localName, "Text", "content of 2nd IconTabFilter should be of type Text");
					assert.equal(filterContent[0].__XMLNode.getAttribute("text"), "MyContent", "text attribute of content of 2nd IconTabFilter should contain 'MyContent'");

					var content = iconTabBar.getContent();

					assert.ok(content[0].__XMLRootNode, "content of iconTabBar should have a __XMLRootNode property");
					assert.ok(content[0].__XMLNode, "content of iconTabBar should have a __XMLNode property");
					assert.equal(content[0].__XMLNode.localName, "List", "content of iconTabBar should be of type List");

					var listItems = content[0].getItems();

					assert.ok(listItems[0].__XMLRootNode, "1st item of list should have a __XMLRootNode property");
					assert.ok(listItems[0].__XMLNode, "1st item of list should have a __XMLNode property");
					assert.equal(listItems[0].__XMLNode.localName, "StandardListItem", "1st item of list should be of type StandardListItem");
					assert.equal(listItems[0].__XMLNode.getAttribute("title"), "ListItem", "title attribute of 1st item of list should contain 'ListItem'");
				});

				it("Test XML Manipulator for manipulating custom data", function () {
					expect(12);
					var oControl = oView.byId("filter1");
					var TEST_KEY = "testKey";
					var SECOND_KEY = "otherKey";
					//add another one
					changeDataAndValidate(oControl, TEST_KEY, "InitialTestValue");
					//update
					changeDataAndValidate(oControl, TEST_KEY, "OtherTestValue");
					changeDataAndValidate(oControl, SECOND_KEY, "ThirdTestValue", 2);
					//remove first
					oControl.data(TEST_KEY, null);
					emitDataChangeAndValidateSizes(oControl, 1);
					//remove second
					oControl.data(SECOND_KEY, null);
					oXMLManipulator.emitDataEvent(oControl);
					var customDataTag = oControl.__XMLNode.getElementsByTagName("customData");
					assert.equal(customDataTag.length, 0, "custom data should have been removed from the XML node");
				});

				it("Test XML serialization checking adding new lines", function () {

					var oPage = oView.byId("Page");

					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					clearContentNodeOfXML(oViewXML);

					var oButton = new sap.m.Button({text: "Button", width: "100px"});

					oPage.addContent(oButton);
					oXMLManipulator.emitAddEvent(oButton, "content", oPage.sId, 0);

					var contentArrayNames = [];
					var contentArrayNamesExpected = ["#text", "Button", "#text"];
					var contentNode = getContentNode(oViewXML);

					contentArrayNames = createArrayOfNodeNames(contentNode);
					assert.deepEqual(contentArrayNames, contentArrayNamesExpected, "Newlines check after adding new button");

					oXMLManipulator.emitHideEvent(oButton);
					oXMLManipulator.emitAddEvent(oButton, "content", oPage.sId, 0);
					contentArrayNames = createArrayOfNodeNames(contentNode);
					assert.deepEqual(contentArrayNames, contentArrayNamesExpected, "Newlines check after remove and add button");
				});

				it("Test IDs creation during XML serialization", function () {

					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					clearContentNodeOfXML(oViewXML);

					var simpleForm = new sap.ui.layout.form.SimpleForm();
					simpleForm.addContent(new sap.ui.core.Title({
						text: "Title"
					}));
					simpleForm.addContent(new sap.m.Label({
						text: "Label 1"
					}));
					simpleForm.addContent(new sap.m.Input({
						text: "Input 1"
					}));
					simpleForm.addContent(new sap.m.Label({
						text: "Label 2"
					}));
					simpleForm.addContent(new sap.m.Input({
						text: "Input 2"
					}));

					var oPage = oView.byId("Page");
					oPage.addContent(simpleForm);
					oXMLManipulator.emitAddEvent(simpleForm, "content", oPage.sId, 0);

					var aExpectedViewElementsNum = 11;
					var aViewElements = [];

					_traverseNodeTree(oViewXML, aViewElements);
					assert.equal(aViewElements.length, aExpectedViewElementsNum, "Expecting IDs for all controls of Simple Form");
				});

				it("Validate controls are written correctly to the XML", function () {

					var oStandardTitleProperties = {
						title: "batata",
						info: "welcome to batata land",
						icon: "sap-icon://customer",
						activeIcon: "sap-icon://customer",
						number: "88",
						numberUnit: "batata unit",
						infoState: "Success",
						type: "Create",
						iconDensityAware: "true"
					};

					var oCalendarProperties = {
						intervalSelection: false,
						months: 2,
						singleSelection: true
					};

					var oCalendarLegendProperties = {
						columnWidth: "12px"
					};

					validateXMLPropertiesOfControl(sap.m.StandardTile, oStandardTitleProperties);
					validateXMLPropertiesOfControl(sap.ui.unified.Calendar, oCalendarProperties);
					validateXMLPropertiesOfControl(sap.ui.unified.CalendarLegend, oCalendarLegendProperties);
				});
			});

			describe("Test XMLManipulator with a view that has sap.ui.commons as its default namespace instead of sap.m", function () {
				beforeEach(function () {
					init("w5g.view.EmptyWithCommonsNS");
				});

				it("Test adding sap.m.TextArea under page with insertion between existing text areas", function () {
					var page = new sap.m.Page();
					page.placeAt(oView, 0);
					var oTextArea1 = new sap.m.TextArea();
					oTextArea1.placeAt(page, 0);
					var oTextArea2 = new sap.m.TextArea();
					oTextArea2.placeAt(page, 0);
					var oTextArea3 = new sap.m.TextArea();
					oTextArea3.placeAt(page, 0);
					oXMLManipulator.emitAddEvent(oTextArea1, "content", oView.sId, 0);
					oXMLManipulator.emitAddEvent(oTextArea2, "content", oView.sId, 0); // insert before
					oXMLManipulator.emitAddEvent(oTextArea3, "content", oView.sId, 1); // insert between text areas
					// assert
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var aExpectedViewElements = ["core:View", "core:content", "__area1", "__area2", "__area0"];
					var aViewElements = [];
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);

					assert.deepEqual(aViewElements, aExpectedViewElements, "TextArea should be added to view with sap.m explicit namespace");
				});
			});
		});

		describe("XML drag drop integration", function () {
			function getNextSibling(oOverlay) {
				var oAggregationOverlay = oOverlay.getParentAggregationOverlay();
				var iControlIndex = oAggregationOverlay.getChildren().indexOf(oOverlay) + 1;
				var oNextOverlay = oAggregationOverlay.getChildren()[iControlIndex];
				return oNextOverlay;
			}

			function dragStart(oOverlay) {
				oDragDropPlugin._onDragStart({currentTarget: {id: oOverlay.getId()}, stopPropagation: _.noop});
			}

			function dragEnd(oOverlay, bWithDrop) {
				if (bWithDrop) {
					oDragDropPlugin.onAggregationDrop();
				}
				oDragDropPlugin.onDragEnd(oOverlay);
			}

			function moveNext(oControl) {
				var oOverlay = W5gUtils.getControlOverlay(oControl, oWindow);
				dragStart(oOverlay);
				var oNextOverlay = getNextSibling(oOverlay);
				oDragDropPlugin.onDragOver(oNextOverlay, {originalEvent: {clientX: Infinity, clientY: Infinity}});
				dragEnd(oOverlay, true);
			}

			function moveOutsideCanvas(oControl) {
				var oOverlay = W5gUtils.getControlOverlay(oControl, oWindow);
				dragStart(oOverlay);
				dragEnd(oOverlay, false);
			}

			function addToAggregation(oParentControl, oControl, sAggregationName) {
				var oOverlay = W5gUtils.getControlOverlay(oControl, oWindow);
				dragStart(oOverlay);
				sap.ui.dt.ElementUtil.insertAggregation(oParentControl, sAggregationName, oControl, 6);
				dragEnd(oOverlay, true);
			}

			function addNewToAggregation(oParentControl, oControl, sAggregationName) {
				var oOverlay = oDesignTime.createOverlayFor(oControl);
				oOverlay.placeAt("overlay-container");
				addToAggregation(oParentControl, oControl, sAggregationName);
			}

			function getChildAggregationOverlay(oElementOverlay, sAggregationName) {
				return _.find(oElementOverlay.getChildren(), function (oAggOverlay) {
					return oAggOverlay.getAggregationName() === sAggregationName;
				});
			}

			describe("View with simple form", function () {
				beforeEach(function () {
					init("w5g.view.SimpleForm");
				});

				it("Test init Design time and initial XML DOM", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					assert.ok(oDesignTime, "DesignTime Created");
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The view has the desired initial structure");
				});

				it("Move Input field", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input2", "Input1", "Label2", "Input3"];
					// act
					var oInput = oView.byId("Input1");
					moveNext(oInput);
					// assert
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The input field has moved");
				});

				it("Remove Input field", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					// act
					var oInput = oView.byId("Input1");

					//move control outside the canvas should NOT remove the control
					moveOutsideCanvas(oInput);
					// assert
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The input field has removed");
				});

				it("Move Label field", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Input1", "Label1", "Input2", "Label2", "Input3"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					// act
					var oLabel = oView.byId("Label1");
					moveNext(oLabel);
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The label has moved");

				});

				// TODO need to check after team 42 bug with simple form is solved
				it("Add a button", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3", "NewButton"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					// act
					var oButton = new sap.m.Button("NewButton", {
						text: "Button new"
					});
					var oSimpleForm = oView.byId("SimpleForm");
					addNewToAggregation(oSimpleForm, oButton, "content");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "A new button has been added");
				});

				it("drag control from canvas to out-of-canvas", function () {

					// drag directly out
					var oInput = oView.byId("Input1");
					var oOverlay = W5gUtils.getControlOverlay(oInput, oWindow);
					oDragDropPlugin._onDragStart({currentTarget: {id: oOverlay.getId()}, stopPropagation: _.noop});
					oDragDropPlugin.onDragEnd(oOverlay);

					// assert
					var aResultViewXMLElements = [];
					var aExpectedViewElements = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					var oResultViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oResultViewXML, w5gSerUtils.processNode, aResultViewXMLElements);
					assert.deepEqual(aResultViewXMLElements, aExpectedViewElements, "The control was inserted back to its original place");
				});

				it("drag control from canvas over aggregation and then to out-of-canvas", function () {

					// start drag
					var oControl = oView.byId("Input1");
					var oOverlay = W5gUtils.getControlOverlay(oControl, oWindow);
					oDragDropPlugin._onDragStart({currentTarget: {id: oOverlay.getId()}, stopPropagation: _.noop});
					sap.ui.getCore().applyChanges();

					// identify target aggregation for drag over
					var oPageOverlay = W5gUtils.getControlOverlay(oView.byId("Page"));

					// dragOver
					oDragDropPlugin.onDragOver(oPageOverlay, {originalEvent: {clientX: 0, clientY: 0}});
					// dragEnd
					oDragDropPlugin.onDragEnd(oOverlay);

					// assert
					var aExpectedViewElements = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					var oResultViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var aResultViewXMLElements = [];
					w5gSerUtils.traverseNodeTree(oResultViewXML, w5gSerUtils.processNode, aResultViewXMLElements);
					assert.deepEqual(aResultViewXMLElements, aExpectedViewElements, "The control was inserted back to its original place");
				});

				it("drag control from palette to out-of-canvas", function () {

					// simulates control from palette creation
					var oInstance = new sap.m.Input({});
					var oOverlayLikePaletteItem = oDesignTime.createOverlayFor(oInstance);
					oOverlayLikePaletteItem.setDraggable(true);
					oOverlayLikePaletteItem.placeAt("overlay-container");
					sap.ui.getCore().applyChanges();

					// drag directly out
					oDragDropPlugin._onDragStart({currentTarget: {id: oOverlayLikePaletteItem.getId()}, stopPropagation: _.noop});
					oDragDropPlugin.onDragEnd(oOverlayLikePaletteItem);

					// assert
					var aExpectedViewElements = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					var oResultViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var aResultViewXMLElements = [];
					w5gSerUtils.traverseNodeTree(oResultViewXML, w5gSerUtils.processNode, aResultViewXMLElements);
					assert.deepEqual(aResultViewXMLElements, aExpectedViewElements, "The control was not dropped on canvas");
				});

				it("drag control from palette over aggregation and then to out-of-canvas", function () {

					// simulates creation of palette control
					var oInstance = new sap.m.Input({});
					var oOverlayLikePaletteItem = oDesignTime.createOverlayFor(oInstance);
					oOverlayLikePaletteItem.setDraggable(true);
					oOverlayLikePaletteItem.placeAt("overlay-container");
					sap.ui.getCore().applyChanges();

					// startDrag
					oDragDropPlugin._onDragStart({currentTarget: {id: oOverlayLikePaletteItem.getId()}, stopPropagation: _.noop});

					// identify target aggregation for drag over
					var oPageOverlay = W5gUtils.getControlOverlay(oView.byId("Page"));

					// dragOver
					oDragDropPlugin.onDragOver(oPageOverlay, {originalEvent: {clientX: Infinity, clientY: Infinity}});
					// skip onAggregationDrop
					oDragDropPlugin.onDragEnd(oOverlayLikePaletteItem);

					// assert
					var aExpectedViewElements = ["core:View", "Page", "content", "SimpleForm", "FormContent", "core:Title", "Label1", "Input1", "Input2", "Label2", "Input3"];
					var oResultViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var aResultViewXMLElements = [];
					w5gSerUtils.traverseNodeTree(oResultViewXML, w5gSerUtils.processNode, aResultViewXMLElements);
					assert.deepEqual(aResultViewXMLElements, aExpectedViewElements, "The control was not dropped on canvas");
				});


			});

			describe("View with fragments", function () {
				beforeEach(function () {
					init("w5g.view.ViewWithFragment");
				});

				it("Test initial XML DOM with incorporated fragment", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "core:Fragment", "footer", "Bar"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					// act
					var oButton = oView.byId("btn0");
					// assert
					assert.ok(oDesignTime, "DesignTime Created");
					assert.ok(oButton, "Button 0 found");
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The view has the desired initial structure");
				});
			});

			describe("View with extension point", function () {
				beforeEach(function () {
					init("w5g.view.ViewWithExtensionPoint");
				});

				it("Test initial XML DOM with incorporated extensio point", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "__button1", "#comment", "core:ExtensionPoint", "__button2", "__button3"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					// assert
					assert.ok(oDesignTime, "DesignTime Created");
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The view has the desired initial structure");
				});
				it("Inserts moved/new control ignoring the extension point", function () {
					var oPage = oView.byId("Page");
					var fnPartial = XMLManipulator.prototype._findInsertPoint.bind(undefined, oPage.__XMLNode.children[0].children, /* dummy */{});
					expect(fnPartial(0)).to.equal(0);
					expect(fnPartial(1)).to.equal(1);
					expect(fnPartial(2)).to.equal(3); // skip the extension point node
					expect(fnPartial(3)).to.equal(4); // skip the extension point node
				});
			});

			describe("Simple view as rootControl", function () {
				beforeEach(function () {
					init("w5g.view.SimpleButton");
				});

				it("Test init Design time and initial XML DOM", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "btn0", "btn1", "btn2", "__button0", "footer", "Bar"];
					var oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					// act
					var oButton = oView.byId("btn0");
					// assert
					assert.ok(oDesignTime, "DesignTime Created");
					assert.ok(oButton, "Button 0 found");
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The view has the desired initial structure");

				});


				it("Test move gesture", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "btn1", "btn0", "btn2", "__button0", "footer", "Bar"];
					var oViewXML;
					var oButton = oView.byId("btn0");

					moveNext(oButton);
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The button changed it's position");
				});

				it("Test add gesture", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "btn0", "btn1", "btn2", "__button0", "btnNew", "footer", "Bar"];
					var oViewXML;
					// act
					var oButton = new sap.m.Button("btnNew", {
						text: "Button new"
					});
					var oPage = oView.byId("Page");
					addNewToAggregation(oPage, oButton, "content");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.ok(oButton, "New Button was created");
					assert.deepEqual(aViewElements, aDesiredOutput, "The new button is added to the page");

				});

				it("Create a new aggregation in XML DOM", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "btn0", "btn1", "btn2", "__button0", "footer", "Bar", "contentMiddle", "btnNew"];
					var oViewXML;
					// act
					var oButton = new sap.m.Button("btnNew", {
						text: "Button new"
					});
					var oBar = oView.byId("Bar");
					addNewToAggregation(oBar, oButton, "contentMiddle");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The new button is now in the contentMiddle aggregation of the bar in the footer");
				});


				it("Test move gesture between aggregations", function () {
					var aViewElements = [];
					var aDesiredOutput = ["core:View", "Page", "content", "#comment", "btn1", "btn2", "__button0", "footer", "Bar", "contentMiddle", "btn0"];
					var oViewXML;
					var oButton = oView.byId("btn0");
					var oBar = oView.byId("Bar");
					// act
					addToAggregation(oBar, oButton, "contentMiddle");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					w5gSerUtils.traverseNodeTree(oViewXML, w5gSerUtils.processNode, aViewElements);
					assert.deepEqual(aViewElements, aDesiredOutput, "The button changed it's aggregation");
				});

				it("Namespace test", function () {
					var mDesiredOutput = {"sap.ui.core": "core", "sap.ui.core.mvc": "mvc", "sap.m": ""};
					var oViewXML;
					// act
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var mNameSpaces = XMLManipulator.getNamespaceMap(oViewXML);
					assert.deepEqual(mNameSpaces, mDesiredOutput, "Intial namespaces are ok");
				});

				it("Namespace layout and form test", function () {
					var mDesiredOutput, oViewXML;
					// act
					var oLayout = new sap.ui.layout.HorizontalLayout("HorizontalLayout");
					var oPage = oView.byId("Page");
					addNewToAggregation(oPage, oLayout, "content");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					mNameSpaces = XMLManipulator.getNamespaceMap(oViewXML);
					mDesiredOutput = {
						"sap.ui.core": "core",
						"sap.ui.core.mvc": "mvc",
						"sap.m": "",
						"sap.ui.layout": "sap.ui.layout"
					};
					assert.deepEqual(mNameSpaces, mDesiredOutput, "New sap.ui.layout namespace was added");
					// act
					var oSimpleForm = new sap.ui.layout.form.SimpleForm("SimpleForm");
					addNewToAggregation(oLayout, oSimpleForm, "content");
					// assert
					oViewXML = w5gSerUtils.getXMLofRootControl(oDesignTime);
					var mNameSpaces = XMLManipulator.getNamespaceMap(oViewXML);
					mDesiredOutput = {
						"sap.ui.core": "core", "sap.ui.core.mvc": "mvc", "sap.m": "", "sap.ui.layout": "sap.ui.layout",
						"sap.ui.layout.form": "sap.ui.layout.form"
					};
					assert.deepEqual(mNameSpaces, mDesiredOutput, "New sap.ui.layout namespace was added");
				});
			});
		});
	});
});
