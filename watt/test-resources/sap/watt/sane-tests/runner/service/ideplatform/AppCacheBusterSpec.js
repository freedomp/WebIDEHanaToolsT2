define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "appcachebuster";

	describe("App Cache Buster", function() {
		var oAppCacheBusterSettings;
		var oAppCacheBusterSettingsImpl;
		//var Q;
		var oAppCacheBusterContent = {};
		var oDefinePromise;
		var oDocument = {};
		var _;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function() {
				return STF.require(suiteName, ["sap/watt/core/Service", "sap/watt/lib/lodash/lodash"]).spread(function(Service, lo) {
					sandbox = sinon.sandbox.create();
					_ = lo;
					oAppCacheBusterSettings = STF.getService(suiteName, "run.appcachebuster");
					//oAppCacheBusterSettingsImpl = STF.getServicePrivateImpl(oAppCacheBusterSettings);

					oDocument.sFullPath = "/project/folder/file.txt";
					oDocument.sType = "file";
					oDocument.changedOn = "12345";
					oDocument.sName = "file.txt";
					oDocument.bProject = false;
					oDocument.isProject = function() {
						return this.bProject;
					};
					oDocument.getProject = function() {
						var oProjectDocument = _.clone(oDocument, true);
						oProjectDocument.sFullPath = "/project";
						oProjectDocument.sType = "folder";
						var oDeferred = Q.defer();
						oDeferred.resolve(oProjectDocument);
						return oDeferred.promise;
					};
					oDocument.getCurrentMetadata = function() {
						var oDocument1 = _.clone(oDocument, true);
						oDocument1.sFullPath = "/project/folder3/file1.json";
						oDocument1.sType = "file";
						oDocument1.sName = "file1.json";
						var oDocument2 = _.clone(oDocument, true);
						oDocument2.sFullPath = "/project/folder3/file2.json";
						oDocument2.sType = "file";
						oDocument2.sName = "file2.json";
						var oDocument3 = _.clone(oDocument, true);
						oDocument3.sFullPath = "/project/folder3/file3.json";
						oDocument3.sType = "file";
						oDocument3.sName = "file3.json";
						var aDocuments = [{
							"name": oDocument1.sName,
							"changedOn": "111",
							"path": oDocument1.sFullPath,
							"folder": false
						}, {
							"name": oDocument2.sName,
							"changedOn": "222",
							"path": oDocument2.sFullPath,
							"folder": false
						}, {
							"name": oDocument3.sName,
							"changedOn": "333",
							"path": oDocument3.sFullPath,
							"folder": false
						}];
						var oDeferred = Q.defer();
						oDeferred.resolve(aDocuments);
						return oDeferred.promise;
					};
					oDocument.getDocumentMetadata = function() {
						return {
							changedOn: this.changedOn
						};
					};
					oDocument.getEntity = function() {
						var that = this;
						return {
							getFullPath: function() {
								return that.sFullPath;
							},
							getType: function() {
								return that.sType;
							},
							getName: function() {
								return that.sName;
							},
							isFile: function() {
								return that.sType === "file";
							},
							isFolder: function() {
								return that.sType === "folder";
							}
						};
					};
					oAppCacheBusterContent = {};
					return Q.all([oAppCacheBusterSettings.$()]).spread(function(oImpl) {
						oAppCacheBusterSettingsImpl = oImpl._getImplSync();
						oAppCacheBusterSettingsImpl._appCBHelper._saveSettings = function(oService, oSettingContent) {
							var oDeferred = Q.defer();
							oAppCacheBusterContent = oSettingContent;
							oDeferred.resolve();
							return oDeferred.promise;
						};

						oAppCacheBusterSettingsImpl._appCBHelper._getSettings = function() {
							var oDeferred = Q.defer();
							oDeferred.resolve([{},
								oAppCacheBusterContent
							]);
							return oDeferred.promise;
						};

						oAppCacheBusterSettingsImpl._appCBHelper._getSettingsDocument = function() {
							var oDeferred = Q.defer();
							oDeferred.resolve({});
							return oDeferred.promise;
						};

						oAppCacheBusterSettingsImpl.configure({
							filesToIgnore: ["neo-app.json", ".user.project.json", ".gitignore", ".project.json", "pom.xml"],
							foldersToIgnore: [".git"]

						});
					});

				});

			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("configure", function() {
			expect(oAppCacheBusterSettingsImpl._aFoldersToIgnore.length).to.equal(1);
			expect(oAppCacheBusterSettingsImpl._aFilesToInore.length).to.equal(6);
			expect(oAppCacheBusterSettingsImpl._aFolderPathsToInore.length).to.equal(1);
			expect(oAppCacheBusterSettingsImpl._aFoldersToIgnore[0]).to.equal(".git");
			expect(oAppCacheBusterSettingsImpl._aFolderPathsToInore[0]).to.equal("/.git/");
		});
		
		it("_getDocumentPathWithoutProject", function() {
			var sResult = oAppCacheBusterSettingsImpl._getDocumentPathWithoutProject(oDocument.getEntity().getFullPath());
			expect(sResult).to.equal("folder/file.txt");
			oDocument.sFullPath = "/project/file.txt";
			sResult = oAppCacheBusterSettingsImpl._getDocumentPathWithoutProject(oDocument.getEntity().getFullPath());
			expect(sResult).to.equal("file.txt");
		});
		
		it("_shoudUpdateIndexFile - files", function() {
		    var oEvent = {};
		    oEvent.params = {};
		    oEvent.params.document = oDocument;
		    
			var sResult = oAppCacheBusterSettingsImpl._shoudUpdateIndexFile(oEvent);
			expect(sResult).to.equal(true);

			oDocument.sFullPath = "/project/sap-ui-cachebuster-info.json";
			oDocument.sName = "sap-ui-cachebuster-info.json";
			oEvent.params.document = oDocument;
			sResult = oAppCacheBusterSettingsImpl._shoudUpdateIndexFile(oEvent);
			expect(sResult).to.equal(false);
		});
		
		it("_shoudUpdateIndexFile - folders", function() {
		    var oEvent = {};
		    oEvent.params = {};
		    oEvent.params.document = oDocument;
		    
			oDocument.sType = "folder";
			var sResult = oAppCacheBusterSettingsImpl._shoudUpdateIndexFile(oEvent);
			expect(sResult).to.equal(true);

			sResult = oAppCacheBusterSettingsImpl._shoudUpdateIndexFile(oEvent);
			expect(sResult).to.equal(true);

			oDocument.sType = "folder";
			sResult = oAppCacheBusterSettingsImpl._shoudUpdateIndexFile(oEvent);
			expect(sResult).to.equal(true);
		});
		
		it("_isValidFile", function() {
			var oRawData = {};
			oRawData.folder = true;
		   // oDocument.sType = "folder";
		    var bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(false);

		    oRawData.folder = false;
		    oRawData.name = ".gitignore";
		    // oDocument.sType = "file";
		    // oDocument.sName = ".gitignore";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(false);

		    oRawData.folder = false;
		    oRawData.name = "sap-ui-cachebuster-info.json";
		    //oDocument.sType = "file";
		    //oDocument.sName = "sap-ui-cachebuster-info.json";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(false);

		    oRawData.folder = false;
		    oRawData.name = "file.txt";
		    oRawData.path = "/project/file.txt";
		    // oDocument.sType = "file";
		    // oDocument.sName = "file.txt";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(true);

		    oRawData.folder = false;
		    oRawData.name = "user.project.json";
		    // oDocument.sType = "file";
		    // oDocument.sName = "user.project.json";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(true);

		    oRawData.folder = false;
		    oRawData.name = "file.txt";
		    oRawData.path = "/project/git/file.txt";
		    // oDocument.sType = "file";
		    // oDocument.sFullPath = "/project/git/file.txt";
		    // oDocument.sName = "file.txt";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(true);

		    oRawData.folder = false;
		    oRawData.name = "file.txt";
		    oRawData.path = "/project/.git/file.txt";
		    // oDocument.sType = "file";
		    // oDocument.sFullPath = "/project/.git/file.txt";
		    // oDocument.sName = "file.txt";
		    bResult = oAppCacheBusterSettingsImpl._isValidFile(oRawData);
		    expect(bResult).to.equal(false);
		});
		
		it("_isValidFolder", function() {
		    oDocument.sType = "folder";
		    oDocument.sFullPath = "/project/folder1";
		    oDocument.sName = "folder1";
		    var bResult = oAppCacheBusterSettingsImpl._isValidFolder(oDocument);
		    expect(bResult).to.equal(true);

		    oDocument.sFullPath = "/project/folder1/.git";
		    oDocument.sName = ".git";
		    bResult = oAppCacheBusterSettingsImpl._isValidFolder(oDocument);
		    expect(bResult).to.equal(false);
		});
		
		it("createAppCacheBusterFile", function() {
		    var oConfiguration = {};
		    oConfiguration.filePath = "/project/index.html";
		    
			return oAppCacheBusterSettingsImpl.createAppCacheBusterFile(oDocument, oConfiguration).then(function() {
				expect(_.keys(oAppCacheBusterContent).length).to.equal(3);
			});
		});
		
		// it("_addAppCacheBusterUrlParameter - webapp runner (index.html) - expected: ../../", function() {
		// 	var oConfiguration = {};
		// 	oConfiguration.urlParameters = [];
			
		// 	// webapp runner (index.html) - expected: "../"
		// 	oConfiguration.filePath = "/project/folder/index.html";
		//     var oConfigWithParameters = oAppCacheBusterSettingsImpl._addAppCacheBusterUrlParameter(oConfiguration);
		//     expect(oConfigWithParameters.urlParameters[0].paramValue).to.equal("../../");
		// });
		
		// it("_addAppCacheBusterUrlParameter - webapp runner (index.html) - expected: ../", function() {
		// 	var oConfiguration = {};
		// 	oConfiguration.urlParameters = [];
			
		// 	//  webapp runner (index.html)
		// 	oConfiguration.filePath = "/project/index.html";
		// 	var oConfigWithParameters = oAppCacheBusterSettingsImpl._addAppCacheBusterUrlParameter(oConfiguration);
		// 	expect(oConfigWithParameters.urlParameters[0].paramValue).to.equal("../");
		// });
		
		// it("_addAppCacheBusterUrlParameter - webapp runner (index.html) - expected: ../../../", function() {
		// 	var oConfiguration = {};
		// 	oConfiguration.urlParameters = [];
			
		// 	// webapp runner (index.html)
		// 	oConfiguration.filePath = "/project/folder1/folder2/folder3/index.html";
		// 	var oConfigWithParameters = oAppCacheBusterSettingsImpl._addAppCacheBusterUrlParameter(oConfiguration);
		// 	expect(oConfigWithParameters.urlParameters[0].paramValue).to.equal("../../../../");
		// });
		
		// it("_addAppCacheBusterUrlParameter - fiori runner (Component.js) - expected: ../../../../../", function() {
		// 	var oConfiguration = {};
		// 	oConfiguration.urlParameters = [];
			
		// 	// fiori runner (Component.js) - expected: "../../../../../"
		// 	oConfiguration.filePath = "/project/Component.js";
		// 	var oConfigWithParameters = oAppCacheBusterSettingsImpl._addAppCacheBusterUrlParameter(oConfiguration, "../../../../");
		// 	expect(oConfigWithParameters.urlParameters[0].paramValue).to.equal("../../../../../");
		// });
		
		// it("_addAppCacheBusterUrlParameter - fiori runner (Component.js) - expected: ../../../../../../", function() {
		// 	var oConfiguration = {};
		// 	oConfiguration.urlParameters = [];
			
		// 	// fiori runner (Component.js) - expected: "../../../../../../"
		// 	oConfiguration.filePath = "/project/folder/Component.js";
		// 	var oConfigWithParameters = oAppCacheBusterSettingsImpl._addAppCacheBusterUrlParameter(oConfiguration, "../../../../");
		// 	expect(oConfigWithParameters.urlParameters[0].paramValue).to.equal("../../../../../../");
		// });
	});
});