define(["STF", "sinon"] , function(STF) {

	"use strict";

	var suiteName = "Translation_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTranslationService, oFilesystem, oSettingProjectService, oFakeFileDAO,
			oSelectionService, oMockServer, iFrameWindow;
		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {

				iFrameWindow = oWindow;
				oTranslationService = getService('translation');
				oFilesystem = getService('filesystem.documentProvider');
				oSettingProjectService = getService("setting.project");
				oFakeFileDAO = getService("fakeFileDAO");
				oSelectionService = getService("selection");
				oMockServer = undefined;

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						path: new iFrameWindow.RegExp(".*/domains.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/json;charset=utf-8",
								"Content-Encoding": "gzip"
							}, domainsJSONContent);
						}
					},{
						method: "GET",
						path: new iFrameWindow.RegExp(".*/texttypes.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/json;charset=utf-8",
								"Content-Encoding": "gzip"
							}, texttypesJSONContent);
						}
					},{
						method: "GET",
						path: new iFrameWindow.RegExp(".*domain=BC"),
						response: function (oXhr) {
							oXhr.respond(200, {
							}, sugggestionsDomainNoTxtTypeJSONContent);
						}
					}, {
						method: "GET",
						path: new iFrameWindow.RegExp(".*domain=BC\&texttype=YDES.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
							}, sugggestionsDomainTxtTypeJSONContent);
						}
					}, {
						method: "GET",
						path: new iFrameWindow.RegExp(".*texttype=YDES"),
						response: function (oXhr) {
							oXhr.respond(200, {
							}, sugggestionsNoDomainTxtTypeJSONContent);
						}
					}, {
						method: "GET",
						path: new iFrameWindow.RegExp(".*/languages.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/octet-stream"
							}, langJSONContent);
						}
					}, {
						method: "POST",
						path: new iFrameWindow.RegExp(".*/translate.*"),
						response: function (oXhr) {
							var oBody = JSON.parse(oXhr.requestBody);
							if (oBody.targetLanguages && oBody.targetLanguages.length > 0) {
								if (oBody.bundles && oBody.bundles[0] && oBody.bundles[0].units.length > 0) {
									if (oBody.targetLanguages.length === 1 && oBody.targetLanguages[0] === "en" &&
										oBody.bundles[0].units[0].key === "TEST KEY" &&
										oBody.bundles[0].units[0].textType === "XMSG" &&
										oBody.bundles[0].units[0].value ===
										"User could not be added to list because he/she is already invited") {
										oXhr.respond(200, {
											"Content-Type": "application/octet-stream"
										}, translationKeyValuesJSONContent);
									} else if (oBody.targetLanguages.length === 2 &&
										oBody.targetLanguages[0] === "en" &&
										oBody.targetLanguages[1] === "de" &&
										oBody.bundles[0].units[0].key === "TEST KEY" &&
										oBody.bundles[0].units[0].textType === "XMSG" &&
										oBody.bundles[0].units[0].value ===
										"User could not be added to list because he/she is already invited") {
										oXhr.respond(200, {
											"Content-Type": "application/octet-stream"
										}, trans2LangsJsonContent);
									}
								} else if (oBody.targetLanguages[0] === "en" &&
									(oBody.bundles && oBody.bundles[0] &&
									oBody.bundles[0].units.length === 0)) {
									oXhr.respond(200, {
										"Content-Type": "application/octet-stream"
									}, JSON.stringify({"bundles":[{"units":[]}]}));
								}
							}
						}
					}]
				});

				oMockServer.start();
				return fnCreateFileStructure();

			});
		});

		afterEach(function () {
			aStubs.forEach(function(stub){
				stub.restore();
			});
			aStubs = [];

		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});

		var domainsJSON = {"domains":[{"name":"ADL","id":"AL"},{"name":"AII","id":"AI"},{"name":"Accounting - General","id":"AC"},{"name":"Advanced Planner and Optimizer - APO","id":"AP"},{"name":"Application Platform","id":"AE"}]};
		var domainsJSONContent = JSON.stringify(domainsJSON);

		var texttypesJSON = {"texttypes":[{"id":"CRWB","name":"A Version Crystal Report"},{"id":"XCLS","name":"A Version Xcelsius Dashboard"},{"id":"SD","name":"ABAP Syntax"}]};
		var texttypesJSONContent = JSON.stringify(texttypesJSON);

		var sugggestionsDomainNoTxtTypeJSON = {"suggestions":[{"id":607371,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"test","availableLanguages":38},{"id":179072,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"TAIG","texttypeName":"Tables (Customizing - No SAP UPD, Only INS)","englishValue":"test","availableLanguages":36},{"id":794513,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"TADC","texttypeName":"Tables (Customizing - Maintenance by Customers Only)","englishValue":"test","availableLanguages":31},{"id":1110599,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"TAIE","texttypeName":"Tables (Control - SAP and Customer Key Areas)","englishValue":"test","availableLanguages":15}]};
		var sugggestionsDomainNoTxtTypeJSONContent = JSON.stringify(sugggestionsDomainNoTxtTypeJSON);

		var sugggestionsDomainTxtTypeJSON = {"suggestions":[{"id":607371,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"test","availableLanguages":38},{"id":1210049,"value":"Test","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"Test","availableLanguages":7},{"id":1362056,"value":"Test Connection","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"Test Connection","availableLanguages":38}]};
		var sugggestionsDomainTxtTypeJSONContent = JSON.stringify(sugggestionsDomainTxtTypeJSON);

		var sugggestionsNoDomainTxtTypeJSON = {"suggestions":[{"id":607371,"value":"test","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"test","availableLanguages":38},{"id":1210049,"value":"Test","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"Test","availableLanguages":7},{"id":1362056,"value":"Test Connection","domainId":"BC","domainName":"Basis","texttypeId":"YDES","texttypeName":"Description","englishValue":"Test Connection","availableLanguages":38}]};
		var sugggestionsNoDomainTxtTypeJSONContent = JSON.stringify(sugggestionsNoDomainTxtTypeJSON);

		//MockDocument for setCurrentDomain test:
		var oProjectJSONParent = new MockDocument( null, "myProject", "", null);
		var oProjectJSONContent = JSON.stringify({
			"translation": {
				"translationDomain": "BC",
				"supportedLanguages": "de,en,fr",
				"defaultLanguage": "en",
				"defaultI18NPropertyFile": "i18n.properties",
				"resourceModelName": "i18n"
			}
		});
		var oProjectJSONDoc = new MockDocument(oProjectJSONParent,	null, ".project.json", "json", oProjectJSONContent);
		oProjectJSONParent.getChild = function () {
			return Q(oProjectJSONDoc);
		};
		oProjectJSONDoc.setContent = function() {
			return Q();
		};

		oProjectJSONDoc.save = function() {
			return Q();
		};

		var langsJSON =	{"languages":{"af":"Afrikaans","ar":"Arabic","bg":"Bulgarian","ca":"Catalan","cs":"Czech","da":"Danish","de":"German","el":"Greek"}};
		var langJSONContent = JSON.stringify(langsJSON);

		//getTranslations test responds:
		var translationKeyValuesJSON = {"bundles":[{"units":[{"textType":"XMSG","key":"TEST_KEY","value":"User could not be added to list because he/she is already invited","translations":[{"language":"en","value":"User could not be added to list because he/she is already invited"}]}]}]};
		var translationKeyValuesJSONContent = JSON.stringify(translationKeyValuesJSON);

		var trans2LangsJson = {"bundles":[{"units":[{"textType":"XMSG","key":"TEST_KEY","value":"User could not be added to list because he/she is already invited","translations":[{"language":"en","value":"User could not be added to list because he/she is already invited"},{"language":"de","value":"Benutzer konnte der Liste nicht hinzugefügt werden, da er/sie bereits eingeladen ist"}]}]}]};
		var trans2LangsJsonContent = JSON.stringify(trans2LangsJson);

		var aProperties = [{extraInfo: "631661(Basis(BC))", key: "Paid_631661", textType: "YTEC", value: "Paid"}];
		var aPropertiesSameKey = [{extraInfo: "631661(Basis(BC))", key: "Paid_631661", textType: "YTEC", value: "Paid2"}];
		var aTestProperty = {extraInfo: "607371(Basis(BC))", key: "test_607371", textType: "YDES", value: "test"};



		var translationProps = {
			"translation": {
				"translationDomain": "BC",
				"supportedLanguages": "de,en,fr",
				"defaultLanguage": "en",
				"defaultI18NPropertyFile": "i18n.properties",
				"resourceModelName": "i18n"
			}
		};

		var translationPropsEmpty = {
			"translation": {
				"translationDomain": "",
				"supportedLanguages": "",
				"defaultLanguage": "",
				"defaultI18NPropertyFile": "",
				"resourceModelName": ""
			}
		};

		var i18PropsContent = "# YDES:607371(Basis(BC))\r\ntest_607371=test";
		var i18PropsContentNoComment = "test_607371=test";
		var i18PropsContent2Vals = "# YDES:607371(Basis(BC))\r\ntest_607371=test\r\n\r\n" +
			"# YTEC:631661(Basis(BC))\r\nPaid_631661=Paid";
		var i18PropsContentBad = "# YDES:607371(Basis(BC))test_607371=test";
		var viewContent = 'var x="{i18n>test_607371}"';

		function fnCreateFileStructure() {
			return oFakeFileDAO.setContent({
				"project1": {
					"i18n" : {
						"i18n.properties" : i18PropsContent
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18NotExist": {
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1SRCExist": {
					"src" : {
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18NotExistUnderRoot": {
					"view" : {
						"view.js" : viewContent
					},
					"src" : {
						"i18n" : {

						}
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18WithSrc": {
					"i18n" : {

					},
					"view" : {
						"view.js" : viewContent
					},
					"src" : {
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18ExistWebApp": {
					"i18n" : {
						"i18n.properties" : i18PropsContent
					},
					"webapp" : {

					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1NoI18WebApp": {
					"webapp" : {

					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1NoI18WebAppWithSRC": {
					"webapp" : {

					},
					"src" : {

					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1NoI18WebAppUnderSRC": {
					"src" : {
						"webapp" : {

						}
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18WebAppUnderSRC": {
					"src" : {
						"webapp" : {

						}
					},
					"i18n" : {
						"i18n.properties" : i18PropsContent
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project1I18WebAppSRC": {
					"webapp" : {

					},
					"src" : {

					},
					"i18n" : {
						"i18n.properties" : i18PropsContent
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project11": {
					"i18n" : {
						"i18n.properties" : i18PropsContent2Vals
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project12": {
					"i18n" : {
						"i18n.properties" : i18PropsContentNoComment
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project13": {
					"i18n" : {
						"i18n.properties" : i18PropsContentNoComment
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project14": {
					"i18n" : {
						"i18n.properties" : null
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project111": {
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project2": {
					"src" : {
						"main" : {
							"webapp" : {
								"i18n" : {
									"i18n.properties" : ""
								},
								"view" : {
									"view.js" : viewContent
								}
							}
						}
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project3": {
					"i18n" : {
						"i18n.properties" : i18PropsContentBad
					},
					"view" : {
						"view.js" : viewContent
					},
					".project.json": JSON.stringify(translationProps)
				},
				"project4": {
					".project.json": JSON.stringify(translationPropsEmpty)
				},
				"setting.project": {
					".project.json": JSON.stringify(translationProps)
				}
			}).done();
		}

		function MockDocument(oParent, aFolderContent, sName, sFileExtension, sFileContent) {
			this._oParent = oParent;
			this._aFolderContent = aFolderContent || [];
			this._sName = sName || "";
			this._sFileContent = sFileContent;
			this._sFileExtension = sFileExtension;

			var oEntity = {
				sFileExtension : sFileExtension,
				sFullPath : sName,
				getFullPath : function() {
					return sName;
				},
				getFileExtension : function() {
					return sFileExtension;
				},
				getName : function() {
					return sName;
				}
			};

			this.getEntity = function() {
				return oEntity;
			};

			this.getEntity = function () {
				var that = this;
				return {
					getName: function () {
						return that._sName;
					},
					getFileExtension: function(){
						return that._sFileExtension;
					},
					getFullPath : function() {
						return that._sName;
					}
				};
			};

			this.getProject = function () {
				//For testing support only one level
				return Q(oParent);
			};

			this.isProject = function () {
				return false;
			};

			this.createFile = function() {
				var oFile = {};
				oFile.getContent = function() {
					return Q("");
				};
				oFile.setContent = function() {
					return Q();
				};
				oFile.save = function() {
					return Q();
				};
				return Q(oFile);
			};

			this.getContent = function() {
				return Q(this._sFileContent);
			};

			this.getFolderContent = function(){
				return Q(this._aFolderContent);
			};
		}

		it("Test isEntityTranslatable 1 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "folder";
				},
				getName: function () {
					return "";
				}
			}).then(function (result) {
				assert.equal(result, false, "folder can't be translated");
			});
		});

		it("Test isEntityTranslatable 2 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return ".properties";
				}
			}).then(function (result) {
				assert.equal(result, false, "'.properties' can't be translated");
			});
		});

		it("Test isEntityTranslatable 3 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return "whatever_a.properties";
				}
			}).then(function (result) {
				assert.equal(result, false, "'whatever_a.properties' can't be translated");
			});
		});

		it("Test isEntityTranslatable 4 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return "_whatever.properties";
				}
			}).then(function (result) {
				assert.equal(result, true, "'_whatever.properties' can be translated");
			});
		});

		it("Test isEntityTranslatable 5 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return "whatever_.properties";
				}
			}).then(function (result) {
				assert.equal(result, true, "'whatever_.properties' can be translated");
			});
		});

		it("Test isEntityTranslatable 6 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return "whatever_a_.properties";
				}
			}).then(function (result) {
				assert.equal(result, true, "'whatever_a_.properties' can be translated");
			});
		});

		it("Test isEntityTranslatable 7 - check if a document entity can be translated",function () {
			return oTranslationService.isEntityTranslatable({
				getType: function () {
					return "file";
				},
				getName: function () {
					return "whatever.properties";
				}
			}).then(function (result) {
				assert.equal(result, true, "'whatever.properties' can be translated");
			});
		});

		it("getDomains",function () {
			return oTranslationService.getDomains().then(function(oDomains) {
				assert.ok(oDomains, "Success getting domains");
				assert.equal(oDomains.domains.length, 5, "Got right number of domains");
			});
		});

		it("getTextTypes",function () {
			return oTranslationService.getTextTypes().then(function(oTextTypes) {
				assert.ok(oTextTypes, "Success getting text types");
				assert.equal(oTextTypes.texttypes.length, 3, "Got right number of domains");
			});
		});

		//var startTestPromise = fnCreateFileStructure();

		it("getCurrentDomain",function () {
			return oTranslationService.getCurrentDomain().then(function(domainName) {
				assert.ok(domainName, "Success getting domain");
				assert.equal(domainName, "BC" , "Got right domain name");
			});
		});

		it("setCurrentDomain",function () {
			return oFilesystem.getDocument("/project1/.project.json").then(function(oDoc) {
				return oTranslationService.setCurrentDomain({id: "BA"}, oDoc)
					.then(function (oSettingsDocument) {
						assert.ok(oSettingsDocument, "Success getting modified settings document");
						return oSettingsDocument.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting settings document content");
							assert.equal(oDocContent.indexOf('"translationDomain": "BA"')>0, true ,
								"Got right domain name");
						});
					});
			});
		});

		it("setCurrentDomain with empty values",function () {
			return oFilesystem.getDocument("/project4/.project.json").then(function(oDoc) {
				return oTranslationService.setCurrentDomain({id: "BA"}, oDoc)
					.then(function (oSettingsDocument) {
						assert.ok(oSettingsDocument, "Success getting modified settings document");
						return oSettingsDocument.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting settings document content");
							assert.equal(oDocContent.indexOf('"translationDomain": "BA"')>0, true ,
								"Got right domain name");
						});
					});
			});
		});

		it("setCurrentDomain - null",function () {
			return oTranslationService.setCurrentDomain(null, oProjectJSONDoc)
				.then(function(oSettingsDocument) {
					assert.ok(oSettingsDocument, "Success getting modified settings document");
				});
		});

		it("setCurrentDomain - undefined",function () {
			return oTranslationService.setCurrentDomain(undefined, oProjectJSONDoc)
				.then(function(oSettingsDocument) {
					assert.ok(oSettingsDocument, "Success getting modified settings document");
				});
		});

		it("getCurrentTextType - setCurrentTextType",function () {
			return oTranslationService.setCurrentTextType("CRWB")
				.then(function() {
					return oTranslationService.getCurrentTextType()
						.then(function(sResult) {
							assert.ok(sResult, "Success getting current text type");
							assert.equal(sResult, "CRWB", "Got the right current text type");
						});
				});
		});

		it("getCurrentTextType - setCurrentTextType empty string",function () {
			return oTranslationService.setCurrentTextType("")
				.then(function() {
					return oTranslationService.getCurrentTextType()
						.then(function(sResult) {
							assert.equal(sResult, "", "Got the right current text type");
						});
				});
		});

		it("getCurrentTextType - setCurrentTextType null",function () {
			return oTranslationService.setCurrentTextType(null)
				.then(function() {
					return oTranslationService.getCurrentTextType()
						.then(function(sResult) {
							assert.equal(sResult, "", "Got the right current text type");
						});
				});
		});

		it("getCurrentTextType - setCurrentTextType undefined",function () {
			return oTranslationService.setCurrentTextType(undefined)
				.then(function() {
					return oTranslationService.getCurrentTextType()
						.then(function(sResult) {
							assert.equal(sResult, "", "Got the right current text type");
						});
				});
		});

		it("getTerms - all parameters are not null",function () {
			return oTranslationService.getTerms("test", "BC", "YDES")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when all parameters exist");
					assert.equal(aSuggestions, sugggestionsDomainTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sTextTypeID is undefined",function () {
			return oTranslationService.getTerms("test", "BC")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sTextTypeID is undefined");
					assert.equal(aSuggestions, sugggestionsDomainNoTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sTextTypeID is null",function () {
			return oTranslationService.getTerms("test", "BC", null)
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sTextTypeID is null");
					assert.equal(aSuggestions, sugggestionsDomainNoTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sTextTypeID is empty string",function () {
			return oTranslationService.getTerms("test", "BC", "")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sTextTypeID is empty string");
					assert.equal(aSuggestions, sugggestionsDomainNoTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sText is empty string",function () {
			return oTranslationService.getTerms("", "BC", "")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sText is empty string");
					assert.equal(aSuggestions.length, 0, "Suggestions are equals");
				});
		});

		it("getTerms - sText is null",function () {
			return oTranslationService.getTerms(null, "BC", "")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sText is null");
					assert.equal(aSuggestions.length, 0, "Suggestions are equals");
				});
		});

		it("getTerms - sText is undefined",function () {
			return oTranslationService.getTerms(undefined, "BC", "")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sText is undefined");
					assert.equal(aSuggestions.length, 0, "Suggestions are equals");
				});
		});

		it("getTerms - sDomainID is null",function () {
			return oTranslationService.getTerms("test", null, "YDES")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sDomainID is null");
					assert.equal(aSuggestions, sugggestionsNoDomainTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sDomainID is empty string",function () {
			return oTranslationService.getTerms("test", "", "YDES")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sDomainID is empty string");
					assert.equal(aSuggestions, sugggestionsNoDomainTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getTerms - sDomainID is undefined",function () {
			return oTranslationService.getTerms("test", undefined, "YDES")
				.then(function(aSuggestions) {
					assert.ok(aSuggestions, "Success in getting suggestions list when sDomainID is undefined");
					assert.equal(aSuggestions, sugggestionsNoDomainTxtTypeJSONContent, "Suggestions are equals");
				});
		});

		it("getLanguages",function () {
			return oTranslationService.getLanguages()
				.then(function(allList) {
					assert.ok(allList, "Success in getting languages list");
					assert.equal(allList, langJSONContent, "languages are equals");
				});
		});

		it("getSourceLanguage - no source is defined",function () {
			return oTranslationService.getSourceLanguage()
				.then(function(sResult) {
					assert.ok(!sResult, "Success getting undefined source language");
				});
		});

		it("getSourceLanguage - setSourceLanguage",function () {
			return oTranslationService.setSourceLanguage({id:"de", name:"German"})
				.then(function() {
					return oTranslationService.getSourceLanguage()
						.then(function(sResult) {
							assert.ok(sResult, "Success getting source language");
							assert.equal(sResult.id, "de", "Got the right id");
							assert.equal(sResult.name, "German", "Got the right name");
						});
				});
		});

		it("getSourceLanguage - setSourceLanguage undefined oLanguage",function () {
			return oTranslationService.setSourceLanguage(undefined)
				.then(function() {
					return oTranslationService.getSourceLanguage()
						.then(function(sResult) {
							assert.ok(!sResult, "Success getting undefined source language");
						});
				});
		});

		it("getTargetLanguages - no target language is defined",function () {
			return oTranslationService.getTargetLanguages()
				.then(function(sResult) {
					assert.ok(sResult, "Success getting default languages");
					assert.equal(sResult[0].id, "en", "Got the right id");
					assert.equal(sResult[0].name, "English", "Got the right name");
				});
		});

		it("getTargetLanguages - setTargetLanguages (as array)",function () {
			return oTranslationService.setTargetLanguages([{id:"de", name:"German"},{id:"en", name:"English"}])
				.then(function() {
					return oTranslationService.getTargetLanguages()
						.then(function(sResult) {
							assert.ok(sResult, "Success getting target languages");
							assert.equal(sResult.length, 2, "Got the right target languages length");
							assert.equal(sResult[0].id, "de", "Got the right id");
							assert.equal(sResult[0].name, "German", "Got the right name");
						});
				});
		});

		it("getTargetLanguages - setTargetLanguages (as object)",function () {
			return oTranslationService.setTargetLanguages({id:"de", name:"German"})
				.then(function() {
					return oTranslationService.getTargetLanguages()
						.then(function(sResult) {
							assert.ok(sResult, "Success getting target language");
							assert.equal(sResult.length, 1, "Got the language length");
							assert.equal(sResult[0].id, "de", "Got the right id");
							assert.equal(sResult[0].name, "German", "Got the right name");
						});
				});
		});

		it("getTranslations oKeyValues is not null",function () {
			return oTranslationService.setTargetLanguages(undefined)
				.then(function() {
					return oTranslationService.getTranslations(
						[{key : "TEST KEY", textType: "XMSG",
							value: "User could not be added to list because he/she is already invited"}], //oKeyValues
						undefined, //sDomain
						undefined, //oTargetLanguages
						undefined, //sBundleID
						undefined //bCanCancel
					).then(function(translateUnits) {
							assert.ok(translateUnits, "Success getting translation units response object");
							assert.equal(translateUnits.length, 1, "Got the right translation units length");
							assert.equal(translateUnits[0].translations[0].value, "User could not be added to list because he/she is already invited", "Got the right translation value");
						});
				});
		});

		it("getTranslations oKeyValues is undefined",function () {
			return oTranslationService.setTargetLanguages(undefined)
				.then(function() {
					return oTranslationService.getTranslations(
						undefined, //oKeyValues
						undefined, //sDomain
						undefined, //oTargetLanguages
						undefined, //sBundleID
						undefined //bCanCancel
					).then(function(translateUnits) {
							assert.ok(!translateUnits, "Success getting null translation units response object");
						});
				});
		});

		it("getTranslations oKeyValues is null",function () {
			return oTranslationService.setTargetLanguages(undefined)
				.then(function() {
					return oTranslationService.getTranslations(
						null, //oKeyValues
						undefined, //sDomain
						undefined, //oTargetLanguages
						undefined, //sBundleID
						undefined //bCanCancel
					).then(function(translateUnits) {
							assert.ok(!translateUnits, "Success getting null translation units response object");
						});
				});
		});

		it("getTranslations oKeyValues is not null",function () {
			return oTranslationService.setTargetLanguages(undefined)
				.then(function() {
					return oTranslationService.getTranslations(
						[{key : "TEST KEY", textType: "XMSG",
							value: "User could not be added to list because he/she is already invited"}], //oKeyValues
						undefined, //sDomain
						undefined, //oTargetLanguages
						undefined, //sBundleID
						undefined //bCanCancel
					).then(function(translateUnits) {
							assert.ok(translateUnits, "Success getting translation units response object");
							assert.equal(translateUnits.length, 1, "Got the right translation units length");
							assert.equal(translateUnits[0].translations[0].value, "User could not be added to list because he/she is already invited", "Got the right translation value");
						});
				});
		});

		it("getTranslations oKeyValues array is empty",function () {
			return oTranslationService.setTargetLanguages(undefined)
				.then(function() {
					return oTranslationService.getTranslations(
						[], //oKeyValues
						undefined, //sDomain
						undefined, //oTargetLanguages
						undefined, //sBundleID
						undefined //bCanCancel
					).then(function(translateUnits) {
							assert.ok(translateUnits, "Success getting translation units response object");
							assert.equal(translateUnits.length, 0, "Got the right translation units length");
						});
				});
		});

		it("getTranslations oKeyValues & oTargetLanguages is not null",function () {
			return oTranslationService.getTranslations(
				[{key : "TEST KEY", textType: "XMSG",
					value: "User could not be added to list because he/she is already invited"}], //oKeyValues
				undefined, //sDomain
				[{id:"en", name:"English"}, {id:"de", name:"German"}], //oTargetLanguages
				undefined, //sBundleID
				undefined //bCanCancel
			).then(function(translateUnits) {
					assert.ok(translateUnits, "Success getting translation units response object");
					assert.equal(translateUnits.length, 1, "Got the right translation units length");
					assert.equal(translateUnits[0].translations[0].value, "User could not be added to list because he/she is already invited", "Got the right English translation value");
					assert.equal(translateUnits[0].translations[1].value, "Benutzer konnte der Liste nicht hinzugefügt werden, da er/sie bereits eingeladen ist", "Got the right German translation value");
				});
		});

		it("getTranslations oKeyValues & oTargetLanguages & bCanCancel is not null",function () {
			return oTranslationService.getTranslations(
				[{key : "TEST KEY", textType: "XMSG",
					value: "User could not be added to list because he/she is already invited"}], //oKeyValues
				undefined, //sDomain
				[{id:"en", name:"English"}], //oTargetLanguages
				undefined, //sBundleID
				true //bCanCancel
			).then(function(translateUnits) {
					assert.ok(translateUnits, "Success getting translation units response object");
					assert.equal(translateUnits.length, 1, "Got the right translation units length");
					assert.equal(translateUnits[0].translations[0].value, "User could not be added to list because he/she is already invited", "Got the right translation value");
				});
		});


		it("showGetTermsUI all params undefined",function () {
			return oTranslationService.showGetTermsUI(
				undefined, //callback
				undefined, //sText
				undefined, //bShowDomain
				undefined, //bShowTextType
				undefined, //bAllowChangeTextType
				undefined, //oPlaceAt
				undefined //oCurrentStatus
			).fail(function(oError) {
				assert.ok(oError, "Success getting error object");
				assert.equal(oError.message, "body is not defined", "Got the right error message");
			});
		});

		it("showGetTermsUI sText is defined",function () {
			return oTranslationService.showGetTermsUI(
				undefined, //callback
				"test", //sText
				undefined, //bShowDomain
				undefined, //bShowTextType
				undefined, //bAllowChangeTextType
				undefined, //oPlaceAt
				undefined //oCurrentStatus
			).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "body is not defined", "Got the right error message");
			});
		});

		it("showGetTermsUI sText is defined as model key",function () {
			return oFilesystem.getDocument("/project1/view/view.js").then(function(oDoc) {
				aStubs.push(sinon.stub(oSettingProjectService, "get").returns(Q()));
				aStubs.push(sinon.stub(oSettingProjectService, "getProjectSettings").returns(Q(translationProps)));
				aStubs.push(sinon.stub(oSelectionService, "getSelection").returns(Q([{document : oDoc}])));

				return oTranslationService.showGetTermsUI(
					undefined, //callback
					"{i18n>test_607371}", //sText
					undefined, //bShowDomain
					undefined, //bShowTextType
					undefined, //bAllowChangeTextType
					undefined, //oPlaceAt
					undefined //oCurrentStatus
				).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "body is not defined", "Got the right error message");
				});
			});
		});


		it("showGetTermsUI sText is defined as model key and properties file is not in the right format",
			function () {
				return oFilesystem.getDocument("/project3/view/view.js").then(function(oDoc) {
					return oTranslationService.showGetTermsUI(
						undefined, //callback
						"{i18n>test_607371}", //sText
						undefined, //bShowDomain
						undefined, //bShowTextType
						undefined, //bAllowChangeTextType
						undefined, //oPlaceAt
						{document : oDoc} //oCurrentStatus
					).then(function(termUI) {
							assert.ok(!termUI, "Success getting null for terms UI");
						});
				});
			});

		it("showGetTermsUI sText is defined as model key and properties file is not in the right format",
			function () {
				return oFilesystem.getDocument("/project2/src/main/webapp/view/view.js").then(function(oDoc) {
					return oTranslationService.showGetTermsUI(
						undefined, //callback
						"{i18n>test_607371}", //sText
						undefined, //bShowDomain
						undefined, //bShowTextType
						undefined, //bAllowChangeTextType
						undefined, //oPlaceAt
						{document : oDoc} //oCurrentStatus
					).then(function(termUI) {
							assert.ok(!termUI, "Success getting null for terms UI");
						});
				});
		});

		it("isShowPopup oTermsUI exist",function () {
			return oTranslationService.isShowPopup().then(function(bResult) {
				assert.equal(bResult, true, "Got right value for value");
			});
		});

		it("hideTermUI",function () {
			return oTranslationService.hideTermUI().then(function() {
			}).fail(function(oError) {
				assert.ok(oError, "Success getting error object");
			});
		});

		it("getUUID",function () {
			return oTranslationService.getUUID()
				.then(function(sUUID) {
					assert.ok(sUUID, "Success getting sUUID");
				});
		});

		it("setUUID - getUUID",function () {
			return oTranslationService.setUUID("xxxxxaasajfasjkfbaskfx")
				.then(function() {
					return oTranslationService.getUUID()
						.then(function(sUUID) {
							assert.ok(sUUID, "Success getting sUUID");
							assert.equal(sUUID, "xxxxxaasajfasjkfbaskfx", "Got the right UUID");
						});
				});
		});

		it("updatePropertyKeys",function () {
			return oTranslationService.updatePropertyKeys(
				undefined, //sLanguage
				undefined, //sModel
				undefined, //aProperties
				undefined //document
			).then(function(oPropertyFileEntry) {
					assert.ok(!oPropertyFileEntry, "Success getting null for properties file");
				}).fail(function(oError) {
					assert.ok(oError, "aProperties is not defined");
				});
		});

		it("updatePropertyKeys - i18n folder exist in the root; no webapp folder exist in project",
			function () {
				return oFilesystem.getDocument("/project1/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(), "/project1/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder does not exist; no webapp folder exist in project",
			function () {
				return oFilesystem.getDocument("/project1I18NotExist/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18NotExist/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder does not exist; no webapp folder exist in project; src exist",
			function () {
				return oFilesystem.getDocument("/project1SRCExist/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1SRCExist/src/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder exist and also webapp folder",
			function () {
				return oFilesystem.getDocument("/project1I18ExistWebApp/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18ExistWebApp/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder not exist; webapp folder exists",
			function () {
				return oFilesystem.getDocument("/project1NoI18WebApp/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1NoI18WebApp/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder not exist; webapp folder exists; src folder exist",
			function () {
				return oFilesystem.getDocument("/project1NoI18WebAppWithSRC/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1NoI18WebAppWithSRC/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});



		it("updatePropertyKeys - i18n folder not exist; webapp folder exists under src folder",
			function () {
				return oFilesystem.getDocument("/project1NoI18WebAppUnderSRC/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1NoI18WebAppUnderSRC/src/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n exist; webapp folder exists under src folder",
			function () {
				return oFilesystem.getDocument("/project1I18WebAppUnderSRC/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18WebAppUnderSRC/src/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n exist; webapp folder exists not under src folder",
			function () {
				return oFilesystem.getDocument("/project1I18WebAppSRC/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18WebAppSRC/webapp/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder not exist under root; webapp folder not exists",
			function () {
				return oFilesystem.getDocument("/project1I18NotExistUnderRoot/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18NotExistUnderRoot/src/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - i18n folder exist ; src folder exists",
			function () {
				return oFilesystem.getDocument("/project1I18WithSrc/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						undefined, //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18WithSrc/src/i18n",
								"Got the right location of i18n folder");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys provide language - i18n folder not exist under root; webapp folder not exists",
			function () {
				return oFilesystem.getDocument("/project1I18NotExistUnderRoot/view/view.js").then(function(oDoc) {
					return oTranslationService.updatePropertyKeys(
						"en", //sLanguage
						"i18n", //sModel
						aProperties, //aProperties
						oDoc //document
					).then(function (oPropertyFileEntry) {
							assert.ok(oPropertyFileEntry, "Success getting properties file");
							assert.equal(oPropertyFileEntry.getEntity().getParentPath(),
								"/project1I18NotExistUnderRoot/src/i18n",
								"Got the right location of i18n folder");
							assert.equal(oPropertyFileEntry.getEntity().getName(), "i18n_en.properties",
								"Got the right property file name");
							return oPropertyFileEntry.getContent().then(function (oDocContent) {
								assert.ok(oDocContent, "Success getting properties file content");
								assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
									"Got the new key and value in the properties file");
							});
						});
				});
			});

		it("updatePropertyKeys - key exist update new value",function () {
			return oFilesystem.getDocument("/project11/view/view.js").then(function(oDoc) {
				return oTranslationService.updatePropertyKeys(
					undefined, //sLanguage
					"i18n", //sModel
					aPropertiesSameKey, //aProperties
					oDoc //document
				).then(function (oPropertyFileEntry) {
						assert.ok(oPropertyFileEntry, "Success getting properties file");
						return oPropertyFileEntry.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting properties file content");
							assert.equal(oDocContent.indexOf('Paid_631661=Paid2')>0, true ,
								"Got the new key and value in the properties file");
						});
					});
			});
		});

		it("updatePropertyKeys - no properties file exist check creation",function () {
			return oFilesystem.getDocument("/project111/view/view.js").then(function(oDoc) {
				return oTranslationService.updatePropertyKeys(
					undefined, //sLanguage
					"i18n", //sModel
					aPropertiesSameKey, //aProperties
					oDoc //document
				).then(function (oPropertyFileEntry) {
						assert.ok(oPropertyFileEntry, "Success getting properties file");
						return oPropertyFileEntry.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting properties file content");
							assert.equal(oDocContent.indexOf('Paid_631661=Paid2')>0, true ,
								"Got the new key and value in the properties file");
						});
					});
			});
		});

		it("updatePropertyKey",function () {
			return oFilesystem.getDocument("/project1/view/view.js").then(function(oDoc) {
				return oTranslationService.updatePropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					aProperties[0], //oProperty
					oDoc //document
				).then(function (oPropertyFileEntry) {
						assert.ok(oPropertyFileEntry, "Success getting properties file");
						return oPropertyFileEntry.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting properties file content");
							assert.equal(oDocContent.indexOf('Paid_631661=Paid')>0, true ,
								"Got the new key and value in the properties file");
						});
					});
			});
		});

		it("updatePropertyKey - key already exist but with no comment",function () {
			return oFilesystem.getDocument("/project13/view/view.js").then(function(oDoc) {
				return oTranslationService.updatePropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					aTestProperty, //oProperty
					oDoc //document
				).then(function (oPropertyFileEntry) {
						assert.ok(oPropertyFileEntry, "Success getting properties file");
						return oPropertyFileEntry.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting properties file content");
							assert.equal(oDocContent.indexOf('607371(Basis(BC))') === 0, true ,
								"Got the comment of the existing key in the properties file");
						});
					});
			});
		});

		it("updatePropertyKey - oProperty is malformed",function () {
			return oFilesystem.getDocument("/project1/view/view.js").then(function(oDoc) {
				return oTranslationService.updatePropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					aProperties, //oProperty
					oDoc //document
				).then(function () {
					}).fail(function(oError) {
						assert.ok(oError, "oPropertyFileEntry is not defined");
						assert.equal(oError.message, "The oProperty that provided is malformed (missing required attributes)",
							"Got the right error message of malformed oProperty");
					});
			});
		});

		it("getAllPropertyKeys",function () {
			return oFilesystem.getDocument("/project1/view/view.js").then(function(oDoc) {
				return oTranslationService.getAllPropertyKeys(
					undefined, //sLanguage
					"i18n", //sModel
					oDoc //document
				).then(function (aPropertiesRes) {
						assert.ok(aPropertiesRes, "Success getting properties from props file;");
						assert.equal(aPropertiesRes.length, 2, "Got the right properties number");
						assert.equal(aPropertiesRes[1].value, "Paid", "Got the value of Property number 2");
					});
			});
		});

		it("getPropertyKey",function () {
			return oFilesystem.getDocument("/project11/view/view.js").then(function(oDoc) {
				return oTranslationService.getPropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					"test_607371", //sKey
					oDoc //document
				).then(function (oProperty) {
						assert.ok(oProperty, "Success getting property from props file");
						assert.equal(oProperty.extraInfo, "607371(Basis(BC))",
							"Got right value for extraInfo");
						assert.equal(oProperty.key, "test_607371",
							"Got right value for key");
						assert.equal(oProperty.textType, "YDES",
							"Got right value for textType");
						assert.equal(oProperty.value, "test",
							"Got right value for value");
					});
			});
		});

		it("getPropertyKey - with no comment",function () {
			return oFilesystem.getDocument("/project12/view/view.js").then(function(oDoc) {
				return oTranslationService.getPropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					"test_607371", //sKey
					oDoc //document
				).then(function (oProperty) {
						assert.ok(oProperty, "Success getting property from props file");
						assert.ok(!oProperty.extraInfo, "Success: No comment exist so extraInfo is undefined");
						assert.equal(oProperty.key, "test_607371",
							"Got right value for key");
						assert.ok(!oProperty.textType, "Success: No comment exist so textType is undefined");
						assert.equal(oProperty.value, "test",
							"Got right value for value");
					});
			});
		});

		it("getPropertyKey - key does not exist",function () {
			return oFilesystem.getDocument("/project12/view/view.js").then(function(oDoc) {
				return oTranslationService.getPropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					"te71222", //sKey
					oDoc //document
				).then(function (oProperty) {
						assert.ok(!oProperty, "Success getting null for property file");
					});
			});
		});

		it("getPropertyKey - empty property file",function () {
			return oFilesystem.getDocument("/project14/view/view.js").then(function(oDoc) {
				return oTranslationService.getPropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					"te71222", //sKey
					oDoc //document
				).then(function (oProperty) {
						assert.ok(!oProperty, "Success getting null for property file");
					});
			});
		});

		it("deletePropertyKey",function () {
			return oFilesystem.getDocument("/project11/view/view.js").then(function(oDoc) {
				return oTranslationService.deletePropertyKey(
					undefined, //sLanguage
					"i18n", //sModel
					"test_607371", //sKey
					oDoc //document
				).then(function (oPropertyFileEntry) {
						assert.ok(oPropertyFileEntry, "Success getting property from props file");
						return oPropertyFileEntry.getContent().then(function (oDocContent) {
							assert.ok(oDocContent, "Success getting properties file content");
							assert.equal(oDocContent.indexOf('test_607371')>0, false ,
								"The given key deleted succussfully");
						});
					});
			});
		});
	});
});
