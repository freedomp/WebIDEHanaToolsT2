define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "xml_versions_tests";
	var suiteWindowObj;

	var oXMLCodeCompletionService;
	var oXMLCodeVisitorService;
	var i;

	var mConsumer = {
		"name": "xmlCocoConsumer",

		"requires": {
			"services": [
				"xmlcodecompletion",
				"xmlcodevisitor"
			]
		},

		"configures": {
			"services": {
				"xmlcodecompletion:libraries": [{
					"id": "xml",
					"name": "sapui5",
					"version": "1.24.5",
					"libTemplate": "sap.watt.toolsets.xml/service/template/ui5/1.24.5.zip",
					"libMetadata": "sap.watt.toolsets.xml/service/metadata/ui5/1.24.5.zip"
				}]
			}
		}
	};

	var sContent = "<core:View\n";
	sContent += "\tcontrollerName=\"view.Detail\"\n";
	sContent += "\txmlns=\"sap.m\"\n";
	sContent += "\txmlns:form=\"sap.ui.layout.form\"\n";
	sContent += "\txmlns:mvc=\"sap.ui.core.mvc\"\n";
	sContent += "\txmlns:core=\"sap.ui.core\">\n";
	sContent += "\t<core:Control busy=\"\" >\n";
	sContent += "\t\t<core:Element parseError=\"\"  ></core:Element>\n";
	sContent += "\t</core:Control>\n";
	sContent += "</core:View>";

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

	describe("Xml Versions Code Completion Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/xml/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				STF.register(suiteName, mConsumer);
				oXMLCodeCompletionService = STF.getService(suiteName, "xmlcodecompletion");
				oXMLCodeVisitorService = STF.getService(suiteName, "xmlcodevisitor");
			});
		});

		beforeEach(function() {});

		afterEach(function() {});

		it("offset for xml parser", (function() {
			var iOffset = 11;
			return oXMLCodeVisitorService.getEnv(sContent, iOffset).then(function(result) {
				expect(result.currentTag, "the xml codes are parsed successfully").to.equal("View");
			});
		}));

		it("offset for xml parser(parsing all)", (function() {
			var iOffset = 11;
			//var oSettings = {bParsingAll: true};
			var oSettings = {
				rootNode: [{
					nameSpace: "sap.ui.core",
					name: "View"
				}, {
					nameSpace: "sap.ui.core",
					name: "FragmentDefinition"
				}],
				bParsingAll: true
			};
			return oXMLCodeVisitorService.getEnv(sContent, iOffset, oSettings).then(function(result) {
				expect(result.currentTag, "the xml codes are parsed successfully").to.equal("View");
			});
		}));

		it("offset for syntax proposals", (function() {
			var iOffset = 11;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.of.at.least(4);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty").to.equal("");
			});
		}));

		it("offset for syntax xmlns proposals", (function() {
			var iOffset = 43;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.of.at.least(2);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is 'x' ").to.equal("x");
			});
		}));

		it("offset for tag namespace proposals", (function() {
			var iOffset = 150;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.of.at.least(1);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is \"cor\"").to.equal("cor");
			});
		}));

		it("offset for tag proposals", (function() {
			var i = 0;
			var iOffset = 152;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.of.at.least(17);
				expect(result.isValue, "which is not a value").to.be.false;
				for (i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].description === "ComponentContainer in sap.ui.core") {
						expect(result.proposals[i].overwrite, "overwrite true").to.be.true;
						expect(result.proposals[i].proposal, "proposal true").to.equal("core:ComponentContainer");
						break;
					}
				}
				expect(result.prefix, "the prefix is empty").to.equal("");
			});
		}));

		
		it("offset for tag proposals for autohint", (function() {
			var iOffset = 152;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset,
				isAutoHint: true
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there is no proposal for autohint with empty prefix").to.have.length(0);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for tag proposals with prefix", (function() {
			var iOffset = 153;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(2);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is 'C' ").to.equal("C");
			});
		}));

		it("offset for tag proposals with prefix(autohint)", (function() {
			var iOffset = 153;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset,
				isAutoHint: true
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				var hasSnippetProposal = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].category == 6) { /*category.XML_SNIPPET*/
						hasSnippetProposal = true;
						break;
					}
				}
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(2);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is 'C' ").to.equal("C");
				expect(hasSnippetProposal, "there is no snippet proposal").to.be.false;
			});
		}));

		it("offset for attributes(properties and events)", (function() {
			var iOffset = 160;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(8);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attributes(properties and events) for autohint", (function() {
			var iOffset = 160;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset,
				isAutoHint: true
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length(0);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attributes(properties and events) with prefix", (function() {
			var iOffset = 162;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(2);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is \"bu\" ").to.equal("bu");
			});
		}));

		it("offset for value", (function() {
			var iOffset = 166;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(2);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value (autohint)", (function() {
			var iOffset = 166;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset,
				isAutoHint: true
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length(0);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for root snippet", (function() {
			var iOffset = 0;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				var num = 0;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].category == 6) num++;
				}
				expect(num, "there are " + parseInt(num) + " snippet proposals").to.be.above(0);
			});
		}));

		it("offset for control snippet", (function() {
			var iOffset = 152;
			var oContentStatus = {
				buffer: sContent,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				var num = 0;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].category == 6) num++;
				}
				expect(num, "there are " + parseInt(num) + " snippet proposals").to.be.above(0);
			});
		}));

		it("offset for element(with namesapceschema) ", (function() {
			var iOffset = sContent1.indexOf("<employee ") + 1;
			var oContentStatus = {
				buffer: sContent1,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there is " + result.proposals.length + " proposals for specified namesapce").to.have.length(0);
				expect(result.isValue, "which is not value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for element(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<employee ") + 1;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.at.least(1);
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for element (any element)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ") + 1;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "customer") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in elementgroup").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for element (referred elementgroup)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customername ") + 1;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "address") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in elementgroup").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ") + 10;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includeattribute = false;
				var includerefattribute = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "mode") includeattribute = true;
					if (result.proposals[i].proposal == "gender") includerefattribute = true;
				}
				expect(includeattribute, "there are attribute proposals defined for the element").to.be.true;
				expect(includerefattribute, "there are referred attribute proposals defined for the element").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (any attribute)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<employee ") + 10;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includeattribute = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "gender") includeattribute = true;
				}
				expect(includeattribute, "there are attribute proposals defined for the element").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute (referred attributegroup)(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ") + 10;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var includegroup = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "inheritable") includegroup = true;
				}
				expect(includegroup, "there are proposals defined in attributegroup").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for attribute type(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("<customer ") + 10;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(1);
				var hasboolattr = false;
				var hasenumattr = false;
				for (var i = 0; i < result.proposals.length; i++) {
					if (result.proposals[i].proposal == "inheritable" && result.proposals[i].category == 12) hasboolattr = true;
					if (result.proposals[i].proposal == "mode" && result.proposals[i].category == 13) hasenumattr = true;
				}
				expect(hasboolattr, "there are proposals with bool type").to.be.true;
				expect(hasenumattr, "there are proposals with bool type").to.be.true;
				expect(result.isValue, "which is not a value").to.be.false;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value options of bool attribute(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("inheritable=\"") + 13;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length(2);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty ").to.equal("");
			});
		}));

		it("offset for value options of enum attribute(with nonamesapceschema) ", (function() {
			var iOffset = sContent2.indexOf("mode=\"") + 6;
			var oContentStatus = {
				buffer: sContent2,
				offset: iOffset
			};
			return oXMLCodeCompletionService.getWordSuggestions(oContentStatus).then(function(result) {
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(0);
				expect(result.isValue, "which is a value").to.be.true;
				expect(result.prefix, "the prefix is empty").to.equal("");
			});
		}));

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});