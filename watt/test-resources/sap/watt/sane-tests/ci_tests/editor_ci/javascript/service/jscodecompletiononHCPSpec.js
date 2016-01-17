define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "js_codecompletion_HCP_service_tests";
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
				"jsapireference",
				"intellisence.calculatelibraryversion",
				"intellisence.libmetadataprovider"
			]
		},

		"configures": {
			"services": {
				"intellisence.calculatelibraryversion:sdkVersionProvider": {
					"service": "@libraryMetaAccess"
				},
				"intellisence.libmetadataprovider:sdkProvider": {
					"service": "@libraryMetaAccess"
				}
			}
		}
	};

	describe.skip("JS Code Completion Load UI5 Libraries from HCP Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "ci_tests/editor_ci/javascript/service/config.json"
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
			return oCalculateLibVersionService.useUI5Snapshot(true);
		});

		afterEach(function() {
			sandbox.restore();
		});

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

		/*it("Check [getWordSuggestions] for UI5: jQuery.sap.log extends from jQuery.sap.log.Logger(JIRA: WATTSIN-186)", (function() {
			var oContentStatus = {
				buffer: "jQuery.sap.log.",
				offset: 15,
				prefix: "",
				coords: {
    			    pageX: 14,
    			    pageY: 2
    			}
			};
			return getProposals(oContentStatus).then(function(result) {
				var proposals = result.proposals;
				ok(checkProposal(proposals, "description", "addLogListener(oListener) : jQuery.sap.log") && 
					checkProposal(proposals, "description", "getLogEntries() : Array") && 
					checkProposal(proposals, "description", "getLogger(sComponent, [iDefaultLogLevel]) : jQuery.sap.log.Logger") && 
					checkProposal(proposals, "description", "removeLogListener(oListener) : jQuery.sap.log") && 
					checkProposal(proposals, "description", "Level : jQuery.sap.log.Level") && 
					checkProposal(proposals, "description", "debug(sMessage, [sDetails], [sComponent]) : jQuery.sap.log.Logger") && 
					checkProposal(proposals, "description", "error(sMessage, [sDetails], [sComponent]) : jQuery.sap.log.Logger") && 
					checkProposal(proposals, "description", "getLevel([sComponent]) : Number") && 
					checkProposal(proposals, "description", "Logger(sDefaultComponent) : jQuery.sap.log.Logger"), "return expected proposal");
			});
		}));*/

		/*it("Check [getWordSuggestions] for UI5: static method 'getRouterFor' in 'sap.ui.core.UIComponent'", (function() {
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
				ok(checkProposal(proposals, "description", "getRouterFor(either) : sap.ui.core.routing.Router"), "return expected proposal");
			});
		}));*/

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

		it("Check [getWordSuggestions] for tooltip: 'sap' root namespace", (function() {
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
				expect(proposals[0].proposal, "return expected proposal").to.equal("sap"); 
				expect(proposals[0].category, "return expected proposal").to.equal("namespace"); 
				expect(proposals[0].helpDescription, "return expected proposal").to.have.length.above(0); 
				expect(proposals[0].helpTarget, "return expected proposal").to.equal("sap"); 
			});
		}));

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

		function getProposals(oContentStatus) {
			return oJSCodeCompletionService.getWordSuggestions(oContentStatus);
		}

		function checkProposal(proposals, key, value) {
			for (var i in proposals) {
				var proposal = proposals[i];
				if (proposal[key] == value) {
					return true;
				}
			}
			return false;
		}

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

	});
});