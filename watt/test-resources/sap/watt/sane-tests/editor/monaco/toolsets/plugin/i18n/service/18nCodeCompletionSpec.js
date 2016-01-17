//  The SaneTestFramework should be imported via 'STF' path.
define(["STF"], function(STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "18ncodecompletion_service_tests";

	var oi18nService;

	describe("i18n Code Completion Service", function() {
		before(function() {
			return STF.startWebIde(suiteName, {config : "editor/monaco/toolsets/plugin/i18n/service/config.json"}).
			then(function() {
				oi18nService = STF.getService(suiteName, "i18ncodecompletion");
			});
		});

		it("Return all proposals for an empty buffer", function() {
			var oContentStatus = {
				buffer: "",
				offset: 0,
				prefix: "",
				targetFile: "proj/i18n/i18n.properties"
			}; 
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				expect(oResult.proposals).to.have.length(21);
			});
		});
		
		it("Return all proposals for an emprty prefix on a new line", function() {
			var oContentStatus = {
				buffer: "hello world\n",
				offset:12,
				prefix: "",
				targetFile: "proj/i18n/i18n.properties"
			}; 
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				expect(oResult.proposals).to.have.length(21);
			});
		});
		
		it("Check proposal for 'but' prefix", function() {
			var oContentStatus = {
				buffer: "but",
				offset: 3,
				prefix: "but",
				targetFile: "proj/i18n/i18n.properties"
			};
			
			var oExpectedResult = {
            	"proposal": "#XBUT: Enter comment here\nEnter text key here = Enter text value here with optional arguments in curly brackets\n\n",
            	"category": "template",
            	"description": "Button text",
            	"groups": [{
            	    "data": undefined,
            		"positions": [{
            			"offset": 7,
            			"length": 18
            		}]
            	},
            	{
            	    "data": undefined,
            		"positions": [{
            			"offset": 26,
            			"length": 19
            		}]
            	},
            	{
            	    "data": undefined,
            		"positions": [{
            			"offset": 48,
            			"length": 63
            		}]
            	}],
            	"helpDescription": undefined,
            	"escapePosition": 113,
            	"overwrite": true
            };
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				var proposals = oResult.proposals;
				expect(oResult.proposals).to.have.length(1);
				expect(proposals[0]).to.deep.equal(oExpectedResult);
			});
		});
		
		it("Return no proposals after a token", function() {
			var oContentStatus = {
				buffer: "token ",
				offset:6,
				prefix: "",
				targetFile: "proj/i18n/i18n.properties"
			};
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				expect(oResult.proposals).to.be.empty;
			});
		});
		
		it("Return no proposals after '='", function() {
			var oContentStatus = {
				buffer: "key=",
				offset:4,
				prefix: "",
				targetFile: "proj/i18n/i18n.properties"
			};
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				expect(oResult.proposals).to.be.empty;
			});
		});
		
		it("Properties file which is not i18n should not be supported", function() {
			var oContentStatus = {
				buffer: "",
				offset: 0,
				prefix: "",
				targetFile: "proj/i18n/test.properties"
			};
			return oi18nService.getWordSuggestions(oContentStatus).then(function(oResult) {
				expect(oResult.proposals).to.be.empty;
			});
		});
		
		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});