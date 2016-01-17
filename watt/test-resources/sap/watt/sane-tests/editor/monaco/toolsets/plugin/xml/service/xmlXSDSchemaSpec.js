define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "xml_xsd_schema_tests";
	var suiteWindowObj;

	var oXMLCodeCompletionService;
	var i;

	var mConsumer = {
		"name": "xmlCocoConsumer",

		"requires": {
			"services": [
				"xmlcodecompletion"
			]
		},

		"configures": {
			"services": {
				"xmlcodecompletion:libraries": [{
					"id": "xml",
					"name": "sapui5",
					"version": "1.29.1",
					"libTemplate": "sap.watt.toolsets.xml/service/template/ui5/1.29.1.zip",
					"libMetadata": "sap.watt.toolsets.xml/service/metadata/ui5/1.29.1.zip"
				}]
			}
		}
	};

	var testdataurl = window.location.origin + require.toUrl("editor/monaco/toolsets/plugin/xml/service/data/");

	var sContent1 = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
	sContent1 += '<employees xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n';
	sContent1 += 'xsi:SchemaLocation="http://www.sap.com ' + testdataurl + 'demo2a.xsd http://www.sap.com ' + testdataurl + 'demo2b.xsd">\n';
	sContent1 += '<employee gender="male">\n';
	sContent1 += '<firstname>John</firstname>\n';
	sContent1 += '<lastname>Brown</lastname>\n';
	sContent1 += '<customer gender="male" inheritable="false" mode="interleave" >\n';
	sContent1 += '  <customername >Roy</customername>\n';
	sContent1 += '</customer>\n';
	sContent1 += '</employee>\n';
	sContent1 += '</employees>\n';

	var sContent2 = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
	sContent2 += '<employees xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n';
	sContent2 += 'xsi:noNamespaceSchemaLocation="' + testdataurl + 'demo2a.xsd ' + testdataurl + 'demo2b.xsd">\n';
	sContent2 += '<employee gender="male">\n';
	sContent2 += '<firstname>John</firstname>\n';
	sContent2 += '<lastname>Brown</lastname>\n';
	sContent2 += '<customer gender="male" inheritable="false" mode="interleave" >\n';
	sContent2 += '  <customername >Roy</customername>\n';
	sContent2 += '</customer>\n';
	sContent2 += '</employee>\n';
	sContent2 += '</employees>\n';

	describe("Xml XSD Schema Code Completion Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/xml/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				STF.register(suiteName, mConsumer);
				oXMLCodeCompletionService = STF.getService(suiteName, "xmlcodecompletion");
			});
		});

		beforeEach(function() {});

		afterEach(function() {});

		it("offset after employee tag get element(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<employee ") - 1;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.of.at.least(1);
				var iProp = 0;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal === "<employee") {
						iProp++;
					}
				}
				expect(iProp, "Found a proposal").to.be.above(0);
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset after employee tag get element(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf('<employee gender="male">') + 24;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				var iProp = 0;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal === "<customer") {
						iProp++;
					}
					if (result.proposals[i].proposal === "<employee") {
						iProp++;
					}
					if (result.proposals[i].proposal === "<employees") {
						iProp++;
					}
					if (result.proposals[i].proposal === "<firstname") {
						iProp++;
					}
					if (result.proposals[i].proposal === "<lastname") {
						iProp++;
					}
				}
				expect(iProp, "there are " + result.proposals.length + " proposals").to.equal(5);
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for element (any element)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ")+1;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "customer") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in elementgroup").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for element (referred elementgroup)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customername ")+1;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "address") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in elementgroup").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ")+10;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includeattribute = false;
				var includerefattribute = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "mode") includeattribute = true;
					if (result.proposals[i].proposal == "gender") includerefattribute = true;
				}
				expect(includeattribute, "there are attribute proposals defined for the element").to.be.true;
				expect(includerefattribute, "there are referred attribute proposals defined for the element").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (any attribute)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<employee ")+10;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includeattribute = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "gender") includeattribute = true;
				}
				expect(includeattribute, "there are attribute proposals defined for the element").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (referred attributegroup)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ")+10;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "inheritable") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in attributegroup").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute type(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ")+10;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var hasboolattr = false;
				var hasenumattr = false;
				for ( var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "inheritable" && result.proposals[i].category == 12) hasboolattr = true;
					if (result.proposals[i].proposal == "mode" && result.proposals[i].category == 13) hasenumattr = true;
				}
				expect(hasboolattr, "there are proposals with bool type").to.be.true;
				expect(hasenumattr, "there are proposals with enum type").to.be.true;
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value options of bool attribute(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("inheritable=\"")+13;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length(2);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value options of bool attribute(with nonamesapceschema) without quoates ", (function() {
			var iOffset = sContent2.indexOf("inheritable=")+12;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length(2);
				expect(result.proposals[1].proposal, "which is a value").to.equal("\"true\"");
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));			

		it("offset for value options of enum attribute(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("mode=\"")+6;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value options of enum attribute(with nonamesapceschema) without quoates", (function() {
			var iOffset = sContent2.indexOf("mode=\"")+5;
			var oContentStatus = {buffer: sContent2, offset: iOffset};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				expect(result.proposals[1].proposal, "which is a value").to.equal("\"none\"");
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));	

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});