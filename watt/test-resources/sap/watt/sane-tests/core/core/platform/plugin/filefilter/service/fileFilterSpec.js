define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	
	"use strict";
	
	var suiteName = "filefilter";
	var oFileFilterServiceImpl;
	var oFileFilterService;
	var oFileSystemDocumentProviderService;
	var oProjectTypeService;
	var oFileFilterHideService;
	
	describe("File Filter test", function() {
		
		before(function() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/platform/plugin/filefilter/config.json"
			}).then(function() {
				var mConsumer = {
					"name": "filefilterTestConsumer",

					"requires": {
						"services": [
							"filesystem.documentProvider",
							"filefilter",
							"document",
							"projectType",
							"_filefilter.hide"
						]
					},
					
					"configures" : {
						"services" : {
							"filefilter:alwaysHidden" : [{
								"regExps" : ["sap-ui-cachebuster-info1.json"],
								"projectTypes" : ["filefilterTestType1"]
							}, {
								"regExps" : [".gitignore1.json"],
								"projectTypes" : ["filefilterTestType2"]
							}],
							"filefilter:defaultHidden" : [{
								"regExps" : [".user.project1.json"]
							}, {
								"regExps" : [".test.json"],
								"projectTypes" : ["filefilterTestType2", "filefilterTestType3"]
							}],
							"projectType:types": [{
								"id": "filefilterTestType1",
								"displayName": "filefilterTestType1",
								"description": "filefilterTestType1"
			                }, {
								"id": "filefilterTestType2",
								"displayName": "filefilterTestType2",
								"description": "filefilterTestType2"
			                }, {
								"id": "filefilterTestType3",
								"displayName": "filefilterTestType3",
								"description": "filefilterTestType3"
			                }]
						}
					}
				};
				
				return STF.register(suiteName, mConsumer).then(function(aPlugins) {
					oFileSystemDocumentProviderService = aPlugins[0]._oContext.service.filesystem.documentProvider;
					oProjectTypeService = aPlugins[0]._oContext.service.projectType;
					oFileFilterHideService = aPlugins[0]._oContext.service._filefilter.hide;
					oFileFilterService = aPlugins[0]._oContext.service.filefilter;
					return oFileFilterService._getImpl().then(function(filefilter) {
						return filefilter._getImpl().then(function(filefilterImpl) {
							oFileFilterServiceImpl = filefilterImpl;
							return aPlugins;
						});
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		it("configure", function() {
		    assert.equal(oFileFilterServiceImpl._oProjectTypeService._sName, "projectType");
		});
		
		it("getProjectTypeService", function() {
		    assert.equal(oFileFilterServiceImpl.getProjectTypeService()._sName, "projectType");
		});
		
		it("getHiddenConfiguration", function() {
			var oHiddenConfiguration = oFileFilterServiceImpl.getHiddenConfiguration();
		    assert.ok(oHiddenConfiguration.alwaysHidden.length >= 1);
		    assert.ok(oHiddenConfiguration.defaultHidden.length >= 1);
		});
		
		it("_createRegularExpression", function() {
			var oRegularExpression = oFileFilterServiceImpl._createRegularExpression([{"regExps" : ["Component.js", ".project1.json", "(*)test.txt"]}]);
		    assert.ok(oRegularExpression !== null && oRegularExpression !== undefined);
		    assert.ok(oRegularExpression.test("/project/folder/Component.js") === true);
		    assert.ok(oRegularExpression.test("/project/.project1.json") === true);
		    assert.ok(oRegularExpression.test("/project/test.txt") === false);
		});
	
		it("_prepareDocument", function() {
			var sProject1FolderName = "Project1Folder_" + Date.now();
			var sProject2FolderName = "Project2Folder_" + Date.now();
			var sProject3FolderName = "Project3Folder_" + Date.now();
			
			var oProject1Folder;
			var oProject2Folder;
			var oProject3Folder;
			
			var nHiddenEvents = 0;
			function eventHandler(oEvent) {
				if (oEvent.params.changeType === "hidden") {
					nHiddenEvents++;
				}
			}
			
			return oFileFilterHideService.hideDocuments().then(function() {
				return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
					return Q.spread([oRootDocument.createFolder(sProject1FolderName), 
					                 oRootDocument.createFolder(sProject2FolderName), 
					                 oRootDocument.createFolder(sProject3FolderName)], function(oProject1, oProject2, oProject3) {
						oProject1Folder = oProject1;
						oProject2Folder = oProject2;
						oProject3Folder = oProject3;
						
						oFileSystemDocumentProviderService.context.service.document.attachEvent("changed", eventHandler, this);	
						return Q.all([oProjectTypeService.setProjectTypes(oProject1Folder, ["filefilterTestType1"]),
									  oProjectTypeService.setProjectTypes(oProject2Folder, ["filefilterTestType2"]),
									  oProjectTypeService.setProjectTypes(oProject3Folder, ["filefilterTestType3"])]).then(function() {
							
							return Q.all([oProject1Folder.createFile("sap-ui-cachebuster-info1.json"),
										  oProject1Folder.createFile(".user.project1.json"),
										  oProject2Folder.createFile(".user.project1.json"),
										  oProject3Folder.createFile(".user.project1.json"),
										  oProject2Folder.createFile(".gitignore1.json"),
										  oProject2Folder.createFile(".test.json"),
										  oProject3Folder.createFile(".test.json"), Q().delay(200)]).then(function() {
								assert.equal(7, nHiddenEvents);
								nHiddenEvents = 0;
								return oFileFilterHideService.unhideDocuments().then(function() {
									assert.equal(5, nHiddenEvents);
								});
							});
						});
					});
				});
			}).fin(function() {
				oFileSystemDocumentProviderService.context.service.document.detachEvent("changed", eventHandler, this);
				return Q.all([oProject1Folder.delete(), oProject2Folder.delete(), oProject3Folder.delete()]);
			});
		});
		
		it("filterMetadata", function() {
			var sProject1FolderName = "Project1Folder_" + Date.now();
			
			var oProject1Folder;
			
			return oFileFilterHideService.hideDocuments().then(function() {
				return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
					return oRootDocument.createFolder(sProject1FolderName).then(function(oProject1) {
						oProject1Folder = oProject1;
						
						return oProjectTypeService.setProjectTypes(oProject1Folder, ["filefilterTestType1"]).then(function() {
							return Q.all([oProject1Folder.createFile("sap-ui-cachebuster-info1.json"),
										  oProject1Folder.createFile(".user.project1.json")]).then(function() {
								return oProject1Folder.getCurrentMetadata(true, {hidden : true}).then(function(aMetadata11) {
									assert.equal(2, aMetadata11.length);
									return oProject1Folder.getCurrentMetadata(true, {hidden : false}).then(function(aMetadata12) {
										assert.equal(1, aMetadata12.length);
										return oProject1Folder.getCurrentMetadata(true).then(function(aMetadata13) {
											assert.equal(3, aMetadata13.length);
											return oFileFilterHideService.unhideDocuments().then(function() {
												return oProject1Folder.getCurrentMetadata(true, {hidden : true}).then(function(aMetadata21) {
													assert.equal(1, aMetadata21.length);
													return oProject1Folder.getCurrentMetadata(true, {hidden : false}).then(function(aMetadata22) {
														assert.equal(2, aMetadata22.length);
														return oProject1Folder.getCurrentMetadata(true).then(function(aMetadata23) {
															assert.equal(3, aMetadata23.length);
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oProject1Folder.delete();
			});
		});
	});
});