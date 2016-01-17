define(["sap/watt/core/q"], function (coreQ) {

	"use strict";

	describe("Unit tests for XmlUtil class", function () {

		var oXMLUtil;

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/platform/plugin/utils/xml/XmlUtil").then(function(XMLUtil) {
				oXMLUtil = XMLUtil;
			});
		});

		it("Tests getAttribute method", function() {

			var dummyElement = {
				attributes : [{
					nodeName : "term",
					value : "dummyValue"
				}]
			};

			// flow #1 - positive
			var result = oXMLUtil.getAttribute(dummyElement, "term");
			expect(result).to.equal("dummyValue");

			dummyElement = {
				attributes : []
			};

			// flow #2 - negative - no attributes
			result = oXMLUtil.getAttribute(dummyElement, "term");
			expect(result).to.equal("file"); //fallback
		});

		it("Tests getChildByTagName method", function() {

			var dummyEntry = {
				childNodes : [{
					tagName : "dummyTagName"
				}]
			};

			// flow #1 - positive
			var result = oXMLUtil.getChildByTagName(dummyEntry,
				"dummyTagName");
			var expectedResult = {
				tagName : "dummyTagName"
			};

			expect(result.tagName).to.equal(expectedResult.tagName);

			dummyEntry = {
				childNodes : []
			};

			// flow #2 - negative - no children
			result = oXMLUtil.getChildByTagName(dummyEntry, "dummyTagName");
			expect(result).to.equal(undefined); //should be undefined
		});

		it("Tests firstElementChild method", function() {

			var dummyEntry = {
				childNodes : [{
					tagName : "dummyTagName",
					nodeType : 1
				}]
			};

			var result = oXMLUtil.firstElementChild(dummyEntry);
			var expectedResult = {
				tagName : "dummyTagName"
			};

			expect(result.tagName).to.equal(expectedResult.tagName);
		});

		it("Tests children method", function() {

			var dummyEntry = {
				childNodes : [{
					tagName : "dummyTagName",
					nodeType : 1
				}]
			};

			var children = oXMLUtil.children(dummyEntry);
			expect(children.length).to.equal(1);
		});

		it("Tests getChildNodeValue method", function() {

			var dummyEntry = {
				children : [{
					tagName : "dummyTagName",
					innerHTML : "dummyHtml"
				}]
			};

			dummyEntry.childElementCount = 1;
			dummyEntry.childNodes = [{
				tagName : "dummyTagName",
				textContent : "dummyHtml"
			}];

			// flow #1 - positive
			var result = oXMLUtil.getChildNodeValue(dummyEntry, "dummyTagName");

			expect(result).to.equal("dummyHtml");

			dummyEntry = {
				children : []
			};

			// flow #2 - negative - no children
			result = oXMLUtil.getChildNodeValue(dummyEntry, "dummyTagName");
			expect(result).to.equal("");
		});

		it("Tests stringToXml method", function() {

			var dummyXmlString = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" "
				+ "controllerName=\"Starter2.view.App\" displayBlock=\"true\" height=\"100%\">"
				+ "<SplitApp id=\"fioriContent\" showHeader=\"false\" mode=\"StretchCompressMode\">"
				+ "<masterPages></masterPages><detailPages></detailPages></SplitApp></mvc:View>";

			// flow #1 - positive
			var result = oXMLUtil.stringToXml(dummyXmlString);
			expect(result).to.exist;

			// flow #2 - negative - not a string
			result = oXMLUtil.stringToXml({});
			expect(typeof result).to.equal("object");
		});

		it("Tests isVisible method", function() {

			// flow #1 - positive
			// parameters: library, controlName
			var result = oXMLUtil.isVisible("sap.m", "NavContainer");
			expect(result).to.equal(true);

			// flow #2 - positive - controlName = view
			result = oXMLUtil.isVisible("sap.m", "View");
			expect(result).to.equal(true);

			// flow #3 - negative - library = null
			result = oXMLUtil.isVisible(null, "NavContainer");
			expect(result).to.equal(false);
		});

		it("Tests isAggregation method", function() {
			// flow #1 - positive - child control is aggregation
			var result = oXMLUtil.isAggregation("sap.m", "Page" , "content");
			expect(result).to.equal(true);

			// flow #2 - positive - child control is not aggregation
			var result = oXMLUtil.isAggregation("sap.m", "Page" , "endButton");
			expect(result).to.equal(false);

			// flow #3 - negative - library = null
			var result = oXMLUtil.isAggregation(null, "NavContainer");
			expect(result).to.equal(false);

			// flow #4 - negative -  child not exist
			var result = oXMLUtil.isAggregation("sap.m", "NavContainer" , "dummy");
			expect(result).to.equal(false);

			// flow #5 - negative - parent not exist
			var result = oXMLUtil.isAggregation("sap.m", "dummy" , "endButton");
			expect(result).to.equal(false);
		});

		it("Tests getXmlParameters method", function() {

			var dummyXmlString = "<mvc:View xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" xmlns:mvc=\"sap.ui.core.mvc\" "
				+ "controllerName=\"Starter2.view.App\" displayBlock=\"true\" height=\"100%\">"
				+ "<SplitApp id=\"fioriContent\" showHeader=\"false\" mode=\"StretchCompressMode\">"
				+ "<masterPages></masterPages><detailPages></detailPages></SplitApp></mvc:View>";

			var xmlFile = jQuery.parseXML(dummyXmlString);

			// flow #1 - positive
			// parameters: xmlFile, tagName, attribute
			var result = oXMLUtil.getXmlParameters(xmlFile, "*", "id");
			expect(result.length).to.equal(1);

			dummyXmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>";

			xmlFile = jQuery.parseXML(dummyXmlString);

			// flow #2 - positive
			result = oXMLUtil.getXmlParameters(xmlFile, "*", "id");
			expect(result.length).to.equal(2);

			dummyXmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><ExtensionPoint name=\"extS1Field\"></ExtensionPoint>";

			xmlFile = jQuery.parseXML(dummyXmlString);

			// flow #3 - positive
			result = oXMLUtil.getXmlParameters(xmlFile, "ExtensionPoint", "name");
			expect(result.length).to.equal(1); // ExtensionPoint
		});

		it("Tests getChildByTagAttrNameVal method", function() {
			var dummyXmlString = "<Schema Namespace=\"zanno4sample_anno_mdl.v1\""
				+ " xmlns=\"http://docs.oasis-open.org/odata/ns/edm\">"
				+ "<Annotations Target=\"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount\"><Annotation Term=\"Org.OData.Measures.V1.ISOCurrency\" Path=\"ClaimedsumCurrencyCode\"/></Annotations>"
				+ "<Annotations Target=\"ZCLAIMSERVICE_SRV.DamageReportType\">"
				+ "<Annotation Term=\"com.sap.vocabularies.UI.v1.HeaderInfo\">"
				+ "<Record Type=\"com.sap.vocabularies.UI.v1.HeaderInfoType\">"
				+ "<PropertyValue Property=\"TypeName\" String=\"Claim\"/>"
				+ "<PropertyValue Property=\"TypeNamePlural\" String=\"Claims\"/>"
				+ "<PropertyValue Property=\"Title\"><Record Type=\"com.sap.vocabularies.UI.v1.DataField\">"
				+ "<PropertyValue Property=\"Label\" String=\"Damage Report\"/>"
				+ "<PropertyValue Property=\"Value\" Path=\"DamageReport\"/></Record></PropertyValue>"
				+ "</Record></Annotation></Annotations></Schema>";

			var xmlFile = jQuery.parseXML(dummyXmlString);

			// flow #1 - positive
			var result = oXMLUtil.getChildByAttrNameVal(xmlFile.childNodes[0], "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result.length).to.equal(1);

			// flow #2 - negative
			var result2 = oXMLUtil.getChildByAttrNameVal(xmlFile.childNodes[0], "T",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result2.length).to.equal(0);

			// flow #3 - negative entry null
			var result3 = oXMLUtil.getChildByAttrNameVal(null, "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result3.length).to.equal(0);

			// flow #4 - negative attrName null
			var result4 = oXMLUtil.getChildByAttrNameVal(xmlFile.childNodes[0], null,
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result4.length).to.equal(0);

			// flow #5 - negative attrValue null
			var result5 = oXMLUtil.getChildByAttrNameVal(xmlFile.childNodes[0], "Target", null);
			expect(result5.length).to.equal(0);
		});

		it("Tests getChildByTagAttrNameVal method", function() {
			var dummyXmlString = "<Schema Namespace=\"zanno4sample_anno_mdl.v1\""
				+ " xmlns=\"http://docs.oasis-open.org/odata/ns/edm\">"
				+ "<Annotations Target=\"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount\"><Annotation Term=\"Org.OData.Measures.V1.ISOCurrency\" Path=\"ClaimedsumCurrencyCode\"/></Annotations>"
				+ "<Annotations Target=\"ZCLAIMSERVICE_SRV.DamageReportType\">"
				+ "<Annotation Term=\"com.sap.vocabularies.UI.v1.HeaderInfo\">"
				+ "<Record Type=\"com.sap.vocabularies.UI.v1.HeaderInfoType\">"
				+ "<PropertyValue Property=\"TypeName\" String=\"Claim\"/>"
				+ "<PropertyValue Property=\"TypeNamePlural\" String=\"Claims\"/>"
				+ "<PropertyValue Property=\"Title\"><Record Type=\"com.sap.vocabularies.UI.v1.DataField\">"
				+ "<PropertyValue Property=\"Label\" String=\"Damage Report\"/>"
				+ "<PropertyValue Property=\"Value\" Path=\"DamageReport\"/></Record></PropertyValue>"
				+ "</Record></Annotation></Annotations></Schema>";

			var xmlFile = jQuery.parseXML(dummyXmlString);

			// flow #1 - positive
			var result = oXMLUtil.getChildByTagAttrNameVal(xmlFile.childNodes[0], "Annotations", "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result.length).to.equal(1);

			// flow #2 - negative
			var result2 = oXMLUtil.getChildByAttrNameVal(xmlFile.childNodes[0], "Annotations1", "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result2.length).to.equal(0);

			// flow #3 - negative entry null
			var result3 = oXMLUtil.getChildByTagAttrNameVal(null, "Annotations", "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result3.length).to.equal(0);

			// flow #4 - negative attrName null
			var result4 = oXMLUtil.getChildByTagAttrNameVal(xmlFile.childNodes[0], "Annotations", null,
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result4.length).to.equal(0);

			// flow #5 - negative attrValue null
			var result5 = oXMLUtil.getChildByTagAttrNameVal(xmlFile.childNodes[0], "Annotations", "Target",
				null);
			expect(result5.length).to.equal(0);

			// flow #6 - negative tagName null
			var result6 = oXMLUtil.getChildByTagAttrNameVal(xmlFile.childNodes[0], null, "Target",
				"ZCLAIMSERVICE_SRV.DamageReportType/ClaimedsumAmount");
			expect(result6.length).to.equal(0);
		});

		afterEach(function () {
			oXMLUtil = undefined;
		});
	});
});
