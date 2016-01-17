define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "ConnectivityService_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oConnectivityService, oDocProvider;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
					oFakeFileDAO = getService('fakeFileDAO');
					oConnectivityService = getService('connectivity');
					oDocProvider = getService('filesystem.documentProvider');
			});
		});

		var oEvent = {
			params : {
				selectedTemplate : {
					getId : function(){
						return "servicecatalog.connectivityComponent";
					}
				},
				model : {
					componentPath : "/SomeProject",
					needBindingFile : true
				}
			}
		};

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		// test#1 - both index.html and serviceBinding.js at root
		it("both index.html and serviceBinding.js at root", function() {

			var oFileStructure = {
				"SomeProject" : {
					"index.html" : "",
					"serviceBinding.js" : ""
				}
			};


			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oDocProvider.getDocument("/SomeProject").then(function(oTargetDocument){
					oEvent.params.targetDocument = oTargetDocument;
					return oConnectivityService.onAfterGeneration(oEvent).then(function(){
						return oTargetDocument.getFolderContent().then(function(aFiles){
							assert.ok(aFiles[0].getEntity().getName() === "index.html" && aFiles[1].getEntity().getName() === "serviceBinding.js");
						});
					});
				});
			});
		});

		// test#2 - both index.html and serviceBinding.js are inner
		it("both index.html and serviceBinding.js are inner", function() {

			var oFileStructure = {
				"SomeProject" : {
					"subFolder" : {
						"index.html" : "",
						"serviceBinding.js" : ""
					}
				}
			};


			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oDocProvider.getDocument("/SomeProject/subFolder").then(function(oTargetDocument){
					oEvent.params.targetDocument = oTargetDocument;
					return oConnectivityService.onAfterGeneration(oEvent).then(function(){
						return oTargetDocument.getFolderContent().then(function(aFiles){
							assert.ok(aFiles[0].getEntity().getName() === "index.html" && aFiles[1].getEntity().getName() === "serviceBinding.js");
						});
					});
				});
			});
		});

		// test#3 - index.html at root and serviceBinding.js is inner
		it("index.html at root and serviceBinding.js is inner", function() {

			var oFileStructure = {
				"SomeProject" : {
					"index.html" : "",
					"subFolder" : {
						"serviceBinding.js" : ""
					}
				}
			};


			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oDocProvider.getDocument("/SomeProject/subFolder").then(function(oTargetDocument){
					oEvent.params.targetDocument = oTargetDocument;
					return oConnectivityService.onAfterGeneration(oEvent).then(function(){
						return oDocProvider.getDocument("/SomeProject").then(function(oProjectDocument){
							return Q.all([oProjectDocument.getFolderContent(), oTargetDocument.getFolderContent()]).spread(function(aProjectContent,aTargetContent){
								assert.ok(aProjectContent[0].getEntity().getName() === "index.html");
								assert.ok(aProjectContent[2].getEntity().getName() === "serviceBinding.js");
								assert.ok(aTargetContent.length === 0);
							});
						});
					});
				});
			});
		});

		// test#4 - index.html is inner and serviceBinding.js at root
		it("index.html is inner and serviceBinding.js at root", function() {

			var oFileStructure = {
				"SomeProject" : {
					"serviceBinding.js" : "",
					"subFolder" : {
						"index.html" : ""
					}
				}
			};


			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oDocProvider.getDocument("/SomeProject").then(function(oTargetDocument){
					oEvent.params.targetDocument = oTargetDocument;
					oTargetDocument._folderContentPromise = undefined;
					return oConnectivityService.onAfterGeneration(oEvent).then(function(){
						return oDocProvider.getDocument("/SomeProject/subFolder").then(function(oProjectDocument){
							oProjectDocument._folderContentPromise = undefined;
							return Q.all([oProjectDocument.getFolderContent(), oTargetDocument.getFolderContent()]).spread(function(aProjectContent,aTargetContent){
								assert.ok(aProjectContent[0].getEntity().getName() === "index.html" && aProjectContent[1].getEntity().getName() === "serviceBinding.js"
									&& aTargetContent.length === 1);
							});
						});
					});
				});
			});
		});

		// test#5 - serviceBinding.js is needless
		it("serviceBinding.js is needless", function() {

			oEvent.params.model.needBindingFile = false;

			var oFileStructure = {
				"SomeProject" : {
					"serviceBinding.js" : ""
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oDocProvider.getDocument("/SomeProject").then(function(oTargetDocument){
					oEvent.params.targetDocument = oTargetDocument;
					oTargetDocument._folderContentPromise = undefined;
					return oConnectivityService.onAfterGeneration(oEvent).then(function(){
						return oTargetDocument.getFolderContent().then(function(aTargetContent){
							assert.ok(aTargetContent.length === 0);
						});
					});
				});
			});
		});

		// test#6 - with id !== servicecatalog.connectivityComponent
		it("unexpected id", function() {
			oEvent.params.selectedTemplate.getId = function(){
				return "servicecatalog.connectivityComponent1";
			};
			return oConnectivityService.onAfterGeneration(oEvent).then(function(oResult){
				assert.ok(!oResult);
			});
		});
		
	});
});