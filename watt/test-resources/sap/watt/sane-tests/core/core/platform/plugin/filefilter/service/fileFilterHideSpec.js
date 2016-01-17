define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	
	"use strict";
	
	var suiteName = "filefilterhide";
	var oFileFilterHideServiceImpl;
	var oFileSystemDocumentProviderService;
	var oFileFilterHideService;
	var oFileFilterService;
	var oProjectTypeService;
	
	describe("File Filter Hide test", function() {
		
		before(function() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/platform/plugin/filefilter/config.json"
			}).then(function() {
				var mConsumer = {
					"name": "filefilterHideTestConsumer",

					"requires": {
						"services": [
							"filesystem.documentProvider",
							"filefilter",
							"document",
							"projectType",
							"_filefilter.hide",
							"preferences"
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
					oFileFilterHideService = aPlugins[0]._oContext.service._filefilter.hide;
					oProjectTypeService = aPlugins[0]._oContext.service.projectType;
					oFileFilterService = aPlugins[0]._oContext.service.filefilter;
					return oFileFilterHideService._getImpl().then(function(filefilterhide) {
						return filefilterhide._getImpl().then(function(filefilterhideImpl) {
							oFileFilterHideServiceImpl = filefilterhideImpl;
							return aPlugins;
						});
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		it("init", function() {
		    assert.equal(null, oFileFilterHideServiceImpl._sUnhideParameter);
		    assert.equal(false, oFileFilterHideServiceImpl.supportParameterExists());
		});
		
		it("configure", function() {
		    assert.ok(Object.keys(oFileFilterHideServiceImpl._oProjectTypeToRegExpMap).length > 1);
		});
		
		it("deleteFilters", function() {
			var sProjectFolderName = "Project1Folder_" + Date.now();
			var oProjectFolder;
			
			var initialFiltersLength = Object.keys(oFileFilterHideServiceImpl._oFilters).length;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sProjectFolderName).then(function(oProject) {
					oProjectFolder = oProject;
					
					return Q.spread([oProjectFolder.createFile("file1"), oProjectFolder.createFile("file2")], function(oFile1, oFile2) {
						assert.equal(initialFiltersLength + 3, Object.keys(oFileFilterHideServiceImpl._oFilters).length);
						return oFile1.delete().then(function() {
							assert.equal(initialFiltersLength + 2, Object.keys(oFileFilterHideServiceImpl._oFilters).length);
							
							return oProjectFolder.delete().then(function() {
								assert.equal(initialFiltersLength, Object.keys(oFileFilterHideServiceImpl._oFilters).length);
							});
						});
					}); 
				});
			});
		});
		
		it("hideDocuments/getHiddenState/unhideDocuments", function() {
			var bHiddenChanged = false;
			function eventHandler(oEvent) {
				bHiddenChanged = oEvent.params.hidden;
			}
			
			oFileFilterService.attachEvent("hiddenChanged", eventHandler, this);
			return oFileFilterHideService.hideDocuments().then(function() {
				return oFileFilterHideService.getHiddenState().then(function(bHidden1) {
					assert.equal(bHidden1, true);
					assert.equal(bHiddenChanged, true);
					return oFileFilterHideService.unhideDocuments().then(function() {
						return oFileFilterHideService.getHiddenState().then(function(bHidden2) {
							assert.equal(bHidden2, false);
							assert.equal(bHiddenChanged, false);
						});
					});
				});
			}).fin(function() {
				oFileFilterService.detachEvent("hiddenChanged", eventHandler, this);
			});
		});
		
		it("onUpdateProjectTypes", function() {
			var sProjectFolderName = "ProjectFolder_" + Date.now();
			var oProjectFolder;
			
		    return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sProjectFolderName).then(function(oProject) {
					oProjectFolder = oProject;
					return oProjectTypeService.getProjectTypes(oProjectFolder).then(function(aProjectTypes) {
						assert.equal(0, aProjectTypes.length);
						return oProjectTypeService.setProjectTypes(oProjectFolder, ["filefilterTestType1"]).delay(100).then(function() {
							return oProjectTypeService.getProjectTypes(oProjectFolder).delay(100).then(function(aUpdatedProjectTypes) {
								assert.equal(1, aUpdatedProjectTypes.length);
								assert.equal("filefilterTestType1", aUpdatedProjectTypes[0].id);
								assert.ok(1, oFileFilterHideServiceImpl._oProjectToProjectTypesMap[oProjectFolder.getEntity().getFullPath()].length);
							});
						});
					});
				});
		    }).fin(function() {
		    	return oProjectFolder.delete();
		    });
		});
	});
});