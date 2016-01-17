define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "js_codecompletion_multiversion_service_tests";
	var suiteWindowObj;
	var sandbox;
	var oJSCodeCompletionService;
	var oJsApiReferenceService;
	var oContentService;
	var oCalculateLibVersionService;
	var MockFileDocument;

	var mConsumer = {
		"name": "JSCocoServiceConsumer",

		"requires": {
			"services": [
				"jscodecompletion",
				"jsapireference"
			]
		},

		"configures": {
			"services": {
				"jscodecompletion:libraries": [{
					"id": "js",
					"name": "sapui5",
					"version": "1.24.5",
					"libIndexFile": "sap.watt.toolsets.javascript/service/indexFiles/ui5/1.24.5.zip",
					"libTemplate": "sap.watt.toolsets.javascript/service/template/ui5/1.24.5.zip",
					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
					"helpService": oJsApiReferenceService
				}]
			}
		}
	};

	describe("JS Code Completion Multi version Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "editor/monaco/toolsets/plugin/javascript/service/config.json"
			}).
			then(function(webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				STF.register(suiteName, mConsumer);
				oJSCodeCompletionService = STF.getService(suiteName, "jscodecompletion");
				oJsApiReferenceService = STF.getService(suiteName, "jsapireference");
				oContentService = STF.getService(suiteName, "content");
				oCalculateLibVersionService = STF.getService(suiteName, "intellisence.calculatelibraryversion");
				return STF.require(suiteName, [
					"sane-tests/util/mockDocument"
				]);
			}).spread(function(oMockDocument) {
				MockFileDocument = oMockDocument.MockFileDocument;
			});
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			var oDocument = new MockFileDocument("new/doc.js", "js", "");
			sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDocument));
			//return oCalculateLibVersionService.useUI5Snapshot(true);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Check [getWordSuggestions] for user defined object", (function() {
			var oContentStatus = {
				buffer: "var obj={a:0};\nobj.",
				offset: 19,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("a");
			});
		}));

		it("Check [getWordSuggestions] for user defined object which property type is identifier or literal", (function() {
			var oContentStatus = {
				buffer: 'var obj = {\n    prop1:1,\n    "prop2":2\n};\nobj.',
				offset: 46,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist; //ok(proposals && proposals.length > 2);
				expect(result.proposals, "there are " + result.proposals.length + " proposals").to.have.length.above(2);
				expect(proposals[0].description, "return expected proposal").to.equal("prop1 : Number");
				expect(proposals[1].description, "return expected proposal").to.equal("prop2 : Number");
			});
		}));

		it("Check [getWordSuggestions] for user defined var", (function() {
			var oContentStatus = {
				buffer: "var var1;\nvar",
				offset: 13,
				prefix: "var",
				coords: {
					pageX: 13,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist; 
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);				
				expect(proposals[0].proposal, "return expected proposal").to.equal("var1");
			});
		}));

		it("Check [getWordSuggestions] for ecma5 type", (function() {
			var oContentStatus = {
				buffer: "var d = new Date",
				offset: 16,
				prefix: "Date",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist; 
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("Date([val])");
			});
		}));

		it("Check [getWordSuggestions] in comment", (function() {
			var oContentStatus = {
				buffer: "/*\n * here will use JSO\n */",
				offset: 23,
				prefix: "JSO",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist; 
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("JSON");
			});
		}));
//////////////////////////////////////////
///////////////////////////////////////////
		it("Check [getWordSuggestions] for invalid context", (function() {
			var oContentStatus = {
				buffer: "function func1 {\n    s\n}",
				offset: 22,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "String([val])"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sap"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "switch - switch case statement"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "ScrollBar in sap.ui.core"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] in object propotype", (function() {
			var oContentStatus = {
				buffer: "foo = function() {\n    return 0;\n};\n\nfoo.protot",
				offset: 47,
				prefix: "protot",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("prototype");
			});
		}));

		it("Check [getWordSuggestions] auto hint function in function propotype(Int. Msg. 373412/2014)", (function() {
			var oContentStatus = {
				buffer: "TestObj = function() {\n    this.kk = 1;\n};\nTestObj.prototype.testFun = fun(a, b){\n    return a + b;\n};",
				offset: 74,
				prefix: "fun",
				isAutoHint: true,
				caseSensitive: true,
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "function"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "category", "keyword"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] in complex object propotype", (function() {
			var oContentStatus = {
				buffer: "function Person(name,sex) {\n    this.name = name;\n    this.sex = sex;\n}\n\nPerson.prototype = {\n    getName: function() {\n        return this.name;\n    },\n    getSex: function() {\n        return this.sex;\n    }\n};\n\nvar per = new Person(\"Jane\",\"Female\");\nper.",
				offset: 256,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "name"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sex"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "getName()") , "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "getSex()"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for undefined object", (function() {
			var oContentStatus = {
				buffer: "var gs_temp;\ngs",
				offset: 15,
				prefix: "gs",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("gs_temp");
				expect(proposals[0].category, "return expected proposal").to.equal("object");
			});
		}));

		it("Check [getWordSuggestions] for 'Object' variable", (function() {
			var oContentStatus = {
				buffer: "var myCar = new Object();\nmyCar.make = \"Ford\";\n\nmyCar.proto",
				offset: 59,
				prefix: "proto",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("prototype");
			});
		}));

		it("Check [getWordSuggestions] for system 'Object' variable", (function() {
			var oContentStatus = {
				buffer: "var myCar = new Object();\nmyCar.make = \"Ford\";\n\nmyCar.proto",
				offset: 54,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "hasOwnProperty(property)"), "return expected proposal").to.be.true;
				expect(!checkProposal(proposals, "proposal", "make"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for duplicated proposals case1(JIRA: WATTSIN-153)", (function() {
			var oContentStatus = {
				buffer: 'var namespaceabc = {\nhij: 10,\nklm: String("test"),\ninitabc: function() {\n},\ncba: {\nDef: function() { this.yy = "dd"; }\n},\nnop: cba(),\nabc: function() { this.xx = 10; }\n};\n\nnames',
				offset: 177,
				prefix: "names",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "namespaceabc"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "namespaceabc.cba.Def()"), "return expected proposal").to.be.false;
			});
		}));

		it("Check [getWordSuggestions] for duplicated proposals case2(JIRA: WATTSIN-153)", (function() {
			var oContentStatus = {
				buffer: 'var namespaceabc = {\nhij: 10,\nklm: String("test"),\ninitabc: function() {\n},\ncba: {\nDef: function() { this.yy = "dd"; }\n},\nnop: cba(),\nabc: function() { this.xx = 10; }\n};\n\nnamespaceabc.cba.',
				offset: 189,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "Def() : namespaceabc.cba.Def"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for case sensitive prefix", (function() {
			var oContentStatus = {
				buffer: "Func",
				offset: 4,
				prefix: "Func",
				coords: {
					pageX: 14,
					pageY: 2
				},
				caseSensitive: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("Function()");
			});
		}));

		it("Check [getWordSuggestions] for unicode prefix(Int. Msg. 668352/2014)", (function() {
			var oContentStatus = {
				buffer: "var äääääääääö;\näää",
				offset: 19,
				prefix: "äää",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("äääääääääö");
			});
		}));

		it("Check [getWordSuggestions] for UI5: namespace", (function() {
			var oContentStatus = {
				buffer: "sap.",
				offset: 4,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "namespace"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "ca"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "m"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "me"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "ui"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "ushell"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "viz"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: control", (function() {
			var oContentStatus = {
				buffer: "sap.m.Butt",
				offset: 10,
				prefix: "Butt",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("Button(sId, mSettings)");
			});
		}));

		it("Check [getWordSuggestions] for UI5: function 'sap.m.MessageBox.show'", (function() {
			var oContentStatus = {
				buffer: "sap.m.MessageBox.sh",
				offset: 19,
				prefix: "sh",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("show(vMessage, [mOptions])");
			});
		}));

		it("Check [getWordSuggestions] for UI5: function 'sap.m.MessageToast.show'", (function() {
			var oContentStatus = {
				buffer: "sap.m.MessageToast.sh",
				offset: 21,
				prefix: "sh",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("show(sMessage, [mOptions])");
			});
		}));

		it("Check [getWordSuggestions] for UI5: class in class", (function() {
			var oContentStatus = {
				buffer: "sap.m.MessageBox.A",
				offset: 18,
				prefix: "A",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "Action"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: enum of class in class", (function() {
			var oContentStatus = {
				buffer: "sap.m.MessageBox.Action.",
				offset: 24,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "OK"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "CANCEL"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: enum of 'sap.ui.core.mvc.ViewType'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.core.mvc.ViewType.",
				offset: 25,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "HTML : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "JS : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "JSON : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "XML : String"), "return expected proposal").to.be.true;
			});
		}));

		/*it("Check [getWordSuggestions] for UI5: enum of 'jQuery.sap.KeyCodes'", (function() {
			var oContentStatus = {
				buffer: "jQuery.sap.KeyCodes.",
				offset: 20,
				prefix: "",
				coords: {
    			    pageX: 14,
    			    pageY: 2
    			}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				ok(checkProposal(proposals, "description", "A : Number") && 
					checkProposal(proposals, "description", "BACKSLASH : Number") && 
					checkProposal(proposals, "description", "A : Number"), "return expected proposal");
			});
		}));*/

		it("Check [getWordSuggestions] for UI5: enum of 'sap.ui.Device.os'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.Device.os.",
				offset: 17,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "OS : sap.ui.Device.os.OS"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "android : Boolean"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "ios : Boolean"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "windows : Boolean"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: enum of 'sap.ui.Device.os.OS'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.Device.os.OS.",
				offset: 20,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "ANDROID : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description",  "IOS : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "WINDOWS : String"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: enum of 'sap.ui.Device.browser'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.Device.browser.",
				offset: 22,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "BROWSER : sap.ui.Device.browser.BROWSER"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "chrome : Boolean"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "firefox : Boolean"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "safari : Boolean"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: enum of 'sap.ui.Device.browser.BROWSER'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.Device.browser.BROWSER.",
				offset: 30,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "ANDROID : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "CHROME : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "FIREFOX : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "SAFARI : String"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: template based proposals of wave 1", (function() {
			var oContentStatus = {
				buffer: "var b = but",
				offset: 11,
				prefix: "but",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "Button in sap.m"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: template based proposals of wave 2", (function() {
			var oContentStatus = {
				buffer: "var ca = ca",
				offset: 11,
				prefix: "ca",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "ca"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "case - case statement"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "Carousel in sap.ui.commons"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "Calendar in sap.me"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "category", "keyword"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "catch"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: 'getCore' function", (function() {
			var oContentStatus = {
				buffer: "sap.ui.getCore",
				offset: 14,
				prefix: "getCore",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("getCore()");
			});
		}));

		it("Check [getWordSuggestions] for UI5: 'getEventBus' function", (function() {
			var oContentStatus = {
				buffer: "sap.ui.getCore().getEvent",
				offset: 25,
				prefix: "getEvent",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("getEventBus()");
			});
		}));

		/*it("Check [getWordSuggestions] for UI5: 'jsview' function", (function() {
			var oContentStatus = {
				buffer: "sap.ui.jsview",
				offset: 13,
				prefix: "jsview",
				coords: {
    			    pageX: 14,
    			    pageY: 2
    			}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				ok(checkProposal(proposals, "category", "function") && 
					checkProposal(proposals, "helpTarget", "sap.ui.jsview") && 
					checkProposal(proposals, "description", "jsview([sId], [vView]) : undefined"), "return expected proposal");
			});
		}));*/

		it("Check [getWordSuggestions] for UI5: 'sap.ui.base.Event' class", (function() {
			var oContentStatus = {
				buffer: "var obj = {\n    /**\n    * @param {sap.ui.base.Event} evt\n    */\n    func1: function(evt) {\n        evt.\n    }\n}",
				offset: 103,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "getId()") , "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "getParameter(sName)"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "getParameters()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "getSource()"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: namespace with empty description", (function() {
			var oContentStatus = {
				buffer: "sap.ui.core.mvc",
				offset: 15,
				prefix: "mvc",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("mvc");
				expect(proposals[0].helpTarget, "return expected proposal").to.equal("sap.ui.core.mvc");
			});
		}));

		it("Check [getWordSuggestions] for UI5: ignored namespace 'sap.fiori'", (function() {
			var oContentStatus = {
				buffer: "sap.fiori",
				offset: 9,
				prefix: "fiori",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "return no proposal for ignored namespace").to.have.length(0);
			});
		}));

		it("Check [getWordSuggestions] for UI5: ignored namespace 'sap.ui.thirdparty'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.thirdparty",
				offset: 17,
				prefix: "thirdparty",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "return no proposal for ignored namespace").to.have.length(0);
			});
		}));

		it("Check [getWordSuggestions] for UI5: ignored namespace 'sap.ui.debug'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.debug",
				offset: 12,
				prefix: "debug",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				 				
				expect(proposals, "return no proposal for ignored namespace").to.have.length(0);
			});
		}));

		// it("Check [getWordSuggestions] for UI5: jQuery.sap.log extends from jQuery.sap.log.Logger(JIRA: WATTSIN-186)", (function() {
		// 	var oContentStatus = {
		// 		buffer: "jQuery.sap.log.",
		// 		offset: 15,
		// 		prefix: "",
		// 		coords: {
  //  			    pageX: 14,
  //  			    pageY: 2
  //  			}
		// 	};
		// 	return getProposals(oContentStatus).then(function(result) {
		// 		var proposals = result.proposals;
		// 		expect(checkProposal(proposals, "description", "addLogListener(oListener) : jQuery.sap.log"), "return expected proposal").to.be.true;
		// 		expect(checkProposal(proposals, "description", "getLogEntries() : Array"), "return expected proposal").to.be.true; 
		// 		expect(checkProposal(proposals, "description", "getLogger(sComponent, [iDefaultLogLevel]) : jQuery.sap.log.Logger"), "return expected proposal").to.be.true;
		// 		expect(checkProposal(proposals, "description", "removeLogListener(oListener) : jQuery.sap.log"), "return expected proposal").to.be.true; 
		// 		expect(checkProposal(proposals, "description", "Level : jQuery.sap.log.Level"), "return expected proposal").to.be.true;
		// 		expect(checkProposal(proposals, "description", "debug(sMessage, [sDetails], [sComponent]) : jQuery.sap.log.Logger"), "return expected proposal").to.be.true;
		// 		expect(checkProposal(proposals, "description", "error(sMessage, [sDetails], [sComponent]) : jQuery.sap.log.Logger"), "return expected proposal").to.be.true; 
		// 		expect(checkProposal(proposals, "description", "getLevel([sComponent]) : Number"), "return expected proposal").to.be.true;
		// 		expect(checkProposal(proposals, "description", "Logger(sDefaultComponent) : jQuery.sap.log.Logger"), "return expected proposal").to.be.true;
		// 	});
		// }));

		// it("Check [getWordSuggestions] for UI5: static method 'getRouterFor' in 'sap.ui.core.UIComponent'", (function() {
		// 	var oContentStatus = {
		// 		buffer: "sap.ui.core.UIComponent.",
		// 		offset: 24,
		// 		prefix: "",
		// 		coords: {
  //  			    pageX: 14,
  //  			    pageY: 2
  //  			}
		// 	};
		// 	return getProposals(oContentStatus).then(function(result) {
		// 		var proposals = result.proposals;
		// 		expect(proposals).to.exist;  				
		// 		expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
		// 		expect(checkProposal(proposals, "description", "getRouterFor(either) : sap.ui.core.routing.Router"), "return expected proposal").to.be.true;
		// 	});
		// }));

		it("Check [getWordSuggestions] for UI5: extend in 'sap.ui.core.UIComponent'", (function() {
			var oContentStatus = {
				buffer: "sap.ui.core.UIComponent.",
				offset: 24,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "extend(sClassName, [oClassInfo], [FNMetaImpl]) : undefined"),
					"return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for UI5: 'sap.ui.commons' namespace", (function() {
			var oContentStatus = {
				buffer: "sap.ui.commons.",
				offset: 15,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "Accordion(sId, mSettings) : sap.ui.commons.Accordion"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "Button(sId, mSettings) : sap.ui.commons.Button"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "Carousel(sId, mSettings) : sap.ui.commons.Carousel"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for tooltip: non-ui5 function", (function() {
			var oContentStatus = {
				buffer: "var func1 = function() {\n    return 0;\n};\n\nfu",
				offset: 45,
				prefix: "fu",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("func1()");
				expect(proposals[0].helpDescription, "return expected proposal").to.not.exist;
				expect(proposals[0].helpTarget, "return expected proposal").to.not.exist;
			});
		}));

		it("Check [getWordSuggestions] for tooltip: non-ui5 object", (function() {
			var oContentStatus = {
				buffer: "string",
				offset: 6,
				prefix: "string",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.have.length.above(0);
				expect(proposals[0].category, "return expected proposal").to.equal("object");
				expect(proposals[0].helpDescription, "return expected proposal").to.not.exist;
				expect(proposals[0].helpTarget, "return expected proposal").to.not.exist;				
			});
		}));

		/*	it("Check [getWordSuggestions] for tooltip: 'sap' root namespace", (function() {
			var oContentStatus = {
				buffer: "sap",
				offset: 3,
				prefix: "sap",
				coords: {
    			    pageX: 14,
    			    pageY: 2
    			}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				ok(proposals[0].proposal == "sap" && 
					proposals[0].category == "namespace" && 
					proposals[0].helpDescription.length > 0 && 
					proposals[0].helpTarget == "sap", 
					"return expected proposal");
			});
		}));*/

		it("Check [getWordSuggestions] for tooltip: 'sap.m.ActionListItem' class", (function() {
			var oContentStatus = {
				buffer: "sap.m.ActionListItem",
				offset: 20,
				prefix: "ActionListItem",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("ActionListItem(sId, mSettings)");
				expect(proposals[0].category, "return expected proposal").to.equal("class");
				expect(proposals[0].helpDescription, "return expected proposal").to.have.length.above(0);
				expect(proposals[0].helpTarget, "return expected proposal").to.equal("sap.m.ActionListItem");
			});
		}));

		it("Check [getWordSuggestions] for tooltip: library level function", (function() {
			var oContentStatus = {
				buffer: "sap.m.getInval",
				offset: 14,
				prefix: "getInval",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("getInvalidDate()");
				expect(proposals[0].category, "return expected proposal").to.equal("function");
				expect(proposals[0].helpDescription, "return expected proposal").to.have.length.above(0);
				expect(proposals[0].helpTarget, "return expected proposal").to.equal("sap.m.getInvalidDate");
			});
		}));

		it("Check [getWordSuggestions] for tooltip: namespace without description", (function() {
			var oContentStatus = {
				buffer: "sap.ca",
				offset: 6,
				prefix: "ca",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal("ca");
				expect(proposals[0].category, "return expected proposal").to.equal("namespace");
				expect(proposals[0].helpDescription, "return expected proposal").to.equal("Namespace sap.ca");
				expect(proposals[0].helpTarget, "return expected proposal").to.equal("sap.ca");
			});
		}));

		it("Check [getWordSuggestions] for snippet: 'if' templte snippet", (function() {
			var oContentStatus = {
				buffer: "if",
				offset: 2,
				prefix: "if",
				ignoreContextProposals: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[0].proposal, "return expected proposal").to.equal(" (condition) {\n\t\n}");
			});
		}));

		it("Check [getWordSuggestions] for snippet: 'new' keyword snippet", (function() {
			var oContentStatus = {
				buffer: "var obj = ne",
				offset: 12,
				prefix: "ne",
				ignoreContextProposals: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(proposals[2].proposal, "return expected proposal").to.equal("w");
			});
		}));

		it("Check [getWordSuggestions] for snippet: keyword snippet without case sensitive", (function() {
			var oContentStatus = {
				buffer: "undefined",
				offset: 9,
				prefix: "undefined",
				ignoreContextProposals: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
			});
		}));

		it("Check [getWordSuggestions] for snippet: keyword snippet with case sensitive", (function() {
			var oContentStatus = {
				buffer: "UNDEFINED",
				offset: 9,
				prefix: "UNDEFINED",
				ignoreContextProposals: true,
				caseSensitive: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length(0);
			});
		}));

		it("Check [getWordSuggestions] for snippet: after ':'", (function() {
			var oContentStatus = {
				buffer: "var obj = {\n    func1 : function\n};",
				offset: 32,
				prefix: "function",
				ignoreContextProposals: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "function"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] with context option: default all", (function() {
			var oContentStatus = {
				buffer: "s",
				offset: 1,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
				ignoreContextProposals: false,
				ignoreSnippetProposals: false,
				ignoreKeywordProposals: false,
				caseSensitive: false
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "String([val])"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "category", "keyword"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "description", "static"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "switch - switch case statement"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "category", "namespace"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sap"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"),"return expected ui5 snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "ScrollContainer in sap.m"), "return expected ui5 snippet proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] with context option: ignoreContextProposals", (function() {
			var oContentStatus = {
				buffer: "s",
				offset: 1,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
				ignoreContextProposals: true,
				ignoreSnippetProposals: false,
				ignoreKeywordProposals: false,
				caseSensitive: false
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "keyword"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "description", "static"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "switch - switch case statement"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"),"return expected ui5 snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "ScrollContainer in sap.m"), "return expected ui5 snippet proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] with context option: ignoreSnippetProposals", (function() {
			var oContentStatus = {
				buffer: "s",
				offset: 1,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
				ignoreContextProposals: false,
				ignoreSnippetProposals: true,
				ignoreKeywordProposals: false,
				caseSensitive: false
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "String([val])"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "category", "keyword"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "description", "static"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "category", "namespace"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sap"), "return expected ui5 context proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] with context option: ignoreKeywordProposals", (function() {
			var oContentStatus = {
				buffer: "s",
				offset: 1,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
				ignoreContextProposals: false,
				ignoreSnippetProposals: false,
				ignoreKeywordProposals: true,
				caseSensitive: false
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "object"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "String([val])"), "return expected ecma5 context proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "switch - switch case statement"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "category", "namespace"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sap"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"),"return expected ui5 snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "ScrollContainer in sap.m"), "return expected ui5 snippet proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] with context option: caseSensitive", (function() {
			var oContentStatus = {
				buffer: "s",
				offset: 1,
				prefix: "s",
				coords: {
					pageX: 14,
					pageY: 2
				},
				ignoreContextProposals: false,
				ignoreSnippetProposals: false,
				ignoreKeywordProposals: false,
				caseSensitive: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "category", "keyword"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "description", "static"), "return expected keyword proposal").to.be.true;
				expect(checkProposal(proposals, "category", "template"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "description", "switch - switch case statement"), "return expected snippet proposal").to.be.true;
				expect(checkProposal(proposals, "category", "namespace"), "return expected ui5 context proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "sap"), "return expected ui5 context proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for case sensitive prefix", (function() {
			var oContentStatus = {
				buffer: "var person1 = {};\nvar Person2 = {};\nPer",
				offset: 39,
				prefix: "Per",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "person1"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "Person2"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for term service", (function() {
			var oContentStatus = {
				buffer: "var title = \"{i18n>shellTitle}\";",
				offset: 29,
				prefix: "{i18n>shellTitle",
				stringValue: "{i18n>shellTitle}"
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length(0);
			});
		}));

		it("Check [getWordSuggestions] for auto hint without proposals", (function() {
			var oContentStatus = {
				buffer: " ",
				offset: 1,
				prefix: "",
				isAutoHint: true,
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length(0);
			});
		}));

		it("Check [getWordSuggestions] for auto hint with proposals", (function() {
			var oContentStatus = {
				buffer: ".",
				offset: 1,
				prefix: "",
				isAutoHint: true,
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
			});
		}));

		it("Check [getWordSuggestions] for auto hint with proposals for 'fin'", (function() {
			var oContentStatus = {
				buffer: "fin",
				offset: 3,
				prefix: "fin",
				coords: {
					pageX: 14,
					pageY: 2
				},
				isAutoHint: true,
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  
				expect(proposals, "returned 2 proposals").to.have.length(2);
				expect(proposals[0].proposal, "first proposal is " + proposals[0].proposal).to.equal("find(str)");
				expect(proposals[1].proposal, "second proposal is " + proposals[1].proposal).to.equal("ally");
			});
		}));

		it("Check [getWordSuggestions] for auto hint with proposals for 'retu'", (function() {
			var oContentStatus = {
				buffer: "re",
				offset: 2,
				prefix: "re",
				coords: {
					pageX: 14,
					pageY: 2
				},
				isAutoHint: true,
				caseSensitive: true
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  
				expect(proposals, "returned 4 proposals").to.have.length(4);
				expect(proposals[0].proposal,  "second proposal is " + proposals[2].proposal).to.equal("removeEventListener(type, listener, [useCapture])");
				expect(proposals[1].proposal, "third proposal is " + proposals[1].proposal).to.equal("resizeBy(deltaX, deltaY)");
				expect(proposals[2].proposal, "fourth proposal is " + proposals[2].proposal).to.equal("resizeTo(x, y)");
				expect(proposals[3].proposal, "fourth proposal is " + proposals[3].proposal).to.equal("turn");
			});
		}));

		it("Check [getWordSuggestions] for 'this' in 'sap.ui.controller'", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.controller("case.controller", {\n	onInit: function() {\n	    this.\n	},\n	onBeforeShow: function() {\n	}\n});',
				offset: 71,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "onBeforeShow()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "byId(sId) : sap.ui.core.Element"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getView() : sap.ui.core.mvc.View"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for 'this' in 'sap.ui.core.mvc.Controller.extend'", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.core.mvc.Controller.extend("case.Controller.extend", {\n    onInit: function() {\n        this.\n    },\n    onExit: function() {\n	}\n});',
				offset: 100,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "onExit()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "byId(sId) : sap.ui.core.Element"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getView() : sap.ui.core.mvc.View"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for 'this' in 'sap.ui.jsview'", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.jsview("case.jsview", {\n	getControllerName: function() {\n	    this.\n	},\n	onBeforeShow: function() {\n	}\n});',
				offset: 74,
				prefix: "",
				coords: {
					pageX: 3,
					pageY: 6
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "onBeforeShow()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "byId(sId)"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getController() : Object"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for 'this' in 'sap.ui.app.Application'", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.app.Application.extend("case.Application", {\n	init : function() {\n        this.\n	},\n	main : function() {\n	}\n});',
				offset: 86,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "main()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getId() : String"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getView() : sap.ui.core.Control"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for 'this' in 'sap.ui.core.UIComponent'", (function() {
			var oContentStatus = {
				buffer: 'sap.ui.core.UIComponent.extend("case.Component", {\n	init : function() {\n        this.\n	},\n	createContent : function() {\n	}\n});',
				offset: 85,
				prefix: "",
				coords: {
					pageX: 3,
					pageY: 6
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "proposal", "createContent()"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "proposal", "byId(sId)"), "return expected proposal").to.be.true;
				expect(checkProposal(proposals, "description", "getId() : String"), "return expected proposal").to.be.true;
			});
		}));

		it("Check [getWordSuggestions] for 'window' global object", (function() {
			var oContentStatus = {
				buffer: 'window.',
				offset: 7,
				prefix: "",
				coords: {
					pageX: 14,
					pageY: 2
				}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length.above(0);
				expect(checkProposal(proposals, "description", "window : Global"), "return expected proposal").to.be.true;
			});
		}));
		
// 		module("JavaScript snippets code completion", {
// 			setup : function() {
// 			    var oConfig = {
// 				    "id": "js",
// 					"name": "sapui5",
// 					"version": "1.24.5",
// 					"libIndexFile": "sap/watt/common/plugin/javascript/service/indexFiles/ui5Index",
// 					"libTemplate": "sap/watt/common/plugin/javascript/service/template/ui5/1_24_5/ui5Template",
// 					"help": "https://sapui5.hana.ondemand.com/sdk/#docs/api/symbols/",
// 					"helpService": oJsApiReferenceService
// 				};
// 		        getIntellienseStub = sinon.stub(oIntellisenceService, "getCalculatedLibraries").returns(Q([oConfig]));
// 			},
			
// 			teardown : function() {
// 			    getIntellienseStub.restore();
// 			}
// 		});
		
		it("Iterate over array with local var", (function() {
		    var sExpectedDescription = "for - iterate over array with local var";
		    var sExpectedProposal = " (var i=0; i<array.length; i++) {\n\tvar value = array[i];\n\t\n}";
		    var oExpectedGroups = [
		        {
		            "data": undefined,
        		    "positions": [
        		        {
                			"offset": 9,
                			"length": 1
            		    },
                		{
                			"offset": 14,
                			"length": 1
                		},
                		{
                			"offset": 30,
                			"length": 1
                		},
                		{
                			"offset": 56,
                			"length": 1
                		}
            		]
            	},
            	{
    	            "data": undefined,
        		    "positions": [
            		    {
            			    "offset": 16,
            			    "length": 5
            		    },
            	    	{
            			    "offset": 50,
            			    "length": 5
            	    	}
        	    	]
            	},
            	{
            	    "data": undefined,
            		"positions": [
            		    {
            			    "offset": 42,
            			    "length": 5
            		    }
        		    ]
	            }
            ];

			var oContentStatus = {
				buffer: "for",
				offset: 3,
				prefix: "for",
				ignoreContextProposals: true,
				ignoreKeywordProposals: true
			};
			return getProposals(oContentStatus).then(function(result) {
			    var proposals = result.proposals;
			    expect(proposals).to.exist;  				
				expect(proposals, "there are " + proposals.length + " proposals").to.have.length(14);
				expect(proposals[1].category).to.equal("template");
				expect(proposals[1].description).to.equal(sExpectedDescription);
				expect(proposals[1].proposal).to.equal(sExpectedProposal);
				expect(proposals[1].groups).to.deep.equal(oExpectedGroups);
				
				// ok(proposals);
				// strictEqual(proposals.length, 13); // New SAPUI5 ver
		  //      strictEqual(proposals[2].category,"template");
		  //      strictEqual(proposals[2].description, sExpectedDescription);
    //             strictEqual(proposals[2].proposal, sExpectedProposal);  
    //             deepEqual(proposals[2].groups, oExpectedGroups);
			});
		}));
			
		function getProposals(oContentStatus) {
			return oJSCodeCompletionService.getWordSuggestions(oContentStatus);
		};
		
		function checkProposal(proposals, key, value) {
			for (var i in proposals) {
				var proposal = proposals[i];
				if (proposal[key] == value) {
					return true;
				}
			}
			return false;
		};

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});