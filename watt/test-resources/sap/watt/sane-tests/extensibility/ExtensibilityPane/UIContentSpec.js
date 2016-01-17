define(['STF',
	"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/visualExt/ui/UIContent"], function(STF, UIContent) {

	"use strict";

	describe("Unit tests for UIContent external/internal functions", function() {
		
		describe("Appending run configuration info to the frame URL", function() {
			var oContext;
			var oExtProjectDocument;
			var sUrlWithoutQueryAndHash = "http://www.dummy.com/";
			var sParamAndValue = "abc=def";
			var sHash = "#originalHash";
			var sUrlWithQueryAndHash = sUrlWithoutQueryAndHash + "?" + sParamAndValue + sHash;
			var sUrlWithHash = sUrlWithoutQueryAndHash + sHash;
			var sUrlWithQuery = sUrlWithoutQueryAndHash + "?" + sParamAndValue;
			var aConfigurationsWithQueryStringAndHash = [
				{
					"urlParameters": [
						{
							"paramName": "allItems",
							"paramValue": "true",
							"paramActive": true
						}
					],
					"hashParameter": "hashFromConfig",
					"_metadata": {
						"runnerId": "webapprunner"
					}
				}
				];
			var aConfigurationsWithQueryString = [
				{
					"urlParameters": [
						{
							"paramName": "allItems",
							"paramValue": "true",
							"paramActive": true
						}
					],
					"_metadata": {
						"runnerId": "webapprunner"
					}
				}
				];
			var aConfigurationsWithHash = [
				{
					"hashParameter": "hashFromConfig",
					"_metadata": {
						"runnerId": "webapprunner"
					}
				}
				];
			var aConfigurationsWithNothing = [
				{
					"_metadata": {
						"runnerId": "webapprunner"
					}
				}
				];			
					

			function buildMockContext() {
				oContext = {};
				oContext.service = {};
				
				oContext.service.filesystem = {};
				oContext.service.filesystem.documentProvider = {};
				
				oContext.service.setting = {};
				oContext.service.setting.user = {};
	
				oContext.service.usagemonitoring = {};
				oContext.service.usagemonitoring.startPerf = function () {
					return Q();
				};
				oContext.service.usagemonitoring.report = function () {
					return Q();
				};
			}
		
			function buildExtProjectDocument() {
				oExtProjectDocument = {};
				oExtProjectDocument.getEntity = function() {
					return {getFullPath: function() {
						return "";
					}};
				};
			}
	
			beforeEach(function () {
				buildMockContext();
				buildExtProjectDocument();
			});
			
			function setGetUserSettingsForRunConfiguration(aConfigurations) {
				oContext.service.setting.user.get = function() {
					return Q(aConfigurations);
				};				
			}

			function testAppending(aConfigurations, sRawUrl, sExpectedUrl) {
				//try {
				// We call openVisualExt since it initializes the variables inside the service. We don't care that it fails
				return UIContent.openVisualExt(oContext, oExtProjectDocument).then(function () {
					expect(true).to.be.false; // This code souldn't be executed - the real test is inside the fail block
				}).fail(function (oError) {
					setGetUserSettingsForRunConfiguration(aConfigurations);
					return UIContent._appendRunConfigurationInfoToIframeUrl(sRawUrl).then(function (sNewURL) {
						expect(sNewURL).to.equal(sExpectedUrl);
					});
				});
			}

			it("Input URL is missing", function() {
				return testAppending([], "", "");
			});
			
			it("Append a parameter which already exist", function() {
				return testAppending(aConfigurationsWithQueryString, sUrlWithoutQueryAndHash + "?allItems=false", sUrlWithoutQueryAndHash + "?allItems=false&allItems=true");
			});
			
			describe("Appending query string and hash", function() {
				it("... to URL without query string or hash", function() {
					return testAppending(aConfigurationsWithQueryStringAndHash, sUrlWithoutQueryAndHash, sUrlWithoutQueryAndHash + "?allItems=true#hashFromConfig");
				});
				
				it("... to URL with query string and hash", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + "&allItems=true" + sHash;
					return testAppending(aConfigurationsWithQueryStringAndHash, sUrlWithQueryAndHash, sExpected);
				});
				
				it("... to URL with query string only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + "&allItems=true#hashFromConfig";
					return testAppending(aConfigurationsWithQueryStringAndHash, sUrlWithQuery, sExpected);
				});
			
				it("... to URL with hash only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?allItems=true" + sHash;
					return testAppending(aConfigurationsWithQueryStringAndHash, sUrlWithHash, sExpected);
				});
			});
			
			describe("Appending query string", function() {
				it("... to URL without query string or hash", function() {
					return testAppending(aConfigurationsWithQueryString, sUrlWithoutQueryAndHash, sUrlWithoutQueryAndHash + "?allItems=true");
				});
				
				it("... to URL with query string and hash", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + "&allItems=true" + sHash;
					return testAppending(aConfigurationsWithQueryString, sUrlWithQueryAndHash, sExpected);
				});
				
				it("... to URL with query string only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + "&allItems=true";
					return testAppending(aConfigurationsWithQueryString, sUrlWithQuery, sExpected);
				});
			
				it("... to URL with hash only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?allItems=true" + sHash;
					return testAppending(aConfigurationsWithQueryString, sUrlWithHash, sExpected);
				});
			});
			
			describe("Appending hash", function() {
				it("... to URL without query string or hash", function() {
					return testAppending(aConfigurationsWithHash, sUrlWithoutQueryAndHash, sUrlWithoutQueryAndHash + "#hashFromConfig");
				});
				
				it("... to URL with query string and hash", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + sHash;
					return testAppending(aConfigurationsWithHash, sUrlWithQueryAndHash, sExpected);
				});
				
				it("... to URL with query string only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + "#hashFromConfig";
					return testAppending(aConfigurationsWithHash, sUrlWithQuery, sExpected);
				});
			
				it("... to URL with hash only", function() {
					var sExpected = sUrlWithoutQueryAndHash + sHash;
					return testAppending(aConfigurationsWithHash, sUrlWithHash, sExpected);
				});
			});
			
			describe("Appending nothing", function() {
				it("... to URL without query string or hash", function() {
					return testAppending(aConfigurationsWithNothing, sUrlWithoutQueryAndHash, sUrlWithoutQueryAndHash);
				});
				
				it("... to URL with query string and hash", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue + sHash;
					return testAppending(aConfigurationsWithNothing, sUrlWithQueryAndHash, sExpected);
				});
				
				it("... to URL with query string only", function() {
					var sExpected = sUrlWithoutQueryAndHash + "?" + sParamAndValue;
					return testAppending(aConfigurationsWithNothing, sUrlWithQuery, sExpected);
				});
			
				it("... to URL with hash only", function() {
					var sExpected = sUrlWithoutQueryAndHash + sHash;
					return testAppending(aConfigurationsWithNothing, sUrlWithHash, sExpected);
				});
			});
		});
		
		describe("Adapt the frame URL to enable Component-preload.js loading", function() {

			it("Test preview real url - sap-ui-xx-componentPreload exist once (with 'off' value)", function() {
				// As actually returned from preview...
				var sOriginalURl = "https://webidetesting3267242-x2a4336b4.dispatcher.neo.ondemand.com/webapp/index.html?hc_orionpath=%2Fx2a4336b4%24I064702-OrionContent%2FCA_FIORI_INBOXExtension&sap-ui-xx-componentPreload=off&origional-url=index.html&allItems=true&sap-ui-appCacheBuster=..%2F..%2F";
				var sExpectedUrl = "https://webidetesting3267242-x2a4336b4.dispatcher.neo.ondemand.com/webapp/index.html?hc_orionpath=%2Fx2a4336b4%24I064702-OrionContent%2FCA_FIORI_INBOXExtension&origional-url=index.html&allItems=true&sap-ui-appCacheBuster=..%2F..%2F&sap-ui-xx-componentPreload=async";
				expect(UIContent._enableComponentPreloadInIframeUrl(sOriginalURl)).to.equal(sExpectedUrl);
			});
			
			it("Test dummy URL with 2 sap-ui-xx-componentPreload exists", function() {
				var sOriginalURl = "http://www.dummy.com/index.html?sap-ui-xx-componentPreload=off&sap-ui-xx-componentPreload=sync";
				var sExpectedUrl = "http://www.dummy.com/index.html?sap-ui-xx-componentPreload=async";
				expect(UIContent._enableComponentPreloadInIframeUrl(sOriginalURl)).to.equal(sExpectedUrl);
			});
			
			it("Test dummy URL with no sap-ui-xx-componentPreload exists", function() {
				var sOriginalURl = "http://www.dummy.com/index.html?bla-bla=bla";
				var sExpectedUrl = "http://www.dummy.com/index.html?bla-bla=bla&sap-ui-xx-componentPreload=async";
				expect(UIContent._enableComponentPreloadInIframeUrl(sOriginalURl)).to.equal(sExpectedUrl);
			});
			
			it("Test dummy URL with no query parameters at all", function() {
				var sOriginalURl = "http://www.dummy.com/index.html";
				var sExpectedUrl = "http://www.dummy.com/index.html?sap-ui-xx-componentPreload=async";
				expect(UIContent._enableComponentPreloadInIframeUrl(sOriginalURl)).to.equal(sExpectedUrl);
			});
			
		});	



	});
});