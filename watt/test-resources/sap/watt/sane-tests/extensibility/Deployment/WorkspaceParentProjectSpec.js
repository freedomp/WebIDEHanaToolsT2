define(['STF',
	"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/services/WorkspaceParentProject"
], function(STF, WorkspaceParentProject) {
	"use strict";

	describe("Unit tests for WorkspaceParentProject internal functions", function() {
		var workspaceParentProject;

		function buildMockContext() {
			workspaceParentProject.context = {};

			workspaceParentProject.context.service = {};
			workspaceParentProject.context.service.filesystem = {};
			workspaceParentProject.context.service.filesystem.documentProvider = {};
			workspaceParentProject.context.service.filesystem.documentProvider.getDocument = function() {
				var oDocument = {};
				oDocument.getCurrentMetadata = function() {
					var aRawData = [{
						folder: true
					}, {
						folder: false,
						name: "App.controller.js",
						path: "/FreeStype1/webapp/i18n/App.controller.js"
					}];
					return Q(aRawData);
				};
				return Q(oDocument);
			};
		}

		beforeEach(function() {
			workspaceParentProject = new WorkspaceParentProject();
			buildMockContext();
		});

		it('Gets resources info', function() {
			return workspaceParentProject.getFileResourcesInfo("dummy").then(function(aFileResourcesInfo) {
				expect(aFileResourcesInfo.length).to.equal(1);
				expect(aFileResourcesInfo[0].name).to.equal("App.controller.js");
				expect(aFileResourcesInfo[0].path).to.equal("/FreeStype1/webapp/i18n/App.controller.js");
				expect(aFileResourcesInfo[0].parentFolderPath).to.equal("/FreeStype1/webapp/i18n");
			});
		});

		it('Tests getModelFolderFiles method', function() {

			workspaceParentProject.context.service.filesystem.documentProvider.getDocument = function() {
				var oDocument = {};
				oDocument.getCurrentMetadata = function() {

					var aRawData = [{
						"name" : "metadata.xml",
						"path" : "/project/model/metadata.xml",
						"parentPath" : "/project/model",
						"folder" : false,
						"changedOn" : 1234567890
					},{
						"name" : "Product.json",
						"path" : "/project/model/Product.json",
						"parentPath" : "/project/model",
						"folder" : false,
						"changedOn" : 1234567890
					},{
						"name" : "Supplier.json",
						"path" : "/project/model/Supplier.json",
						"parentPath" : "/project/model",
						"folder" : false,
						"changedOn" : 1234567890
					},{
						"name" : "SomeFolder",
						"path" : "/project/model/SomeFolder",
						"parentPath" : "/project/model",
						"folder" : true,
						"changedOn" : 1234567890
					}];
					return Q(aRawData);
				};
				return Q(oDocument);
			};

			return workspaceParentProject.getModelFolderFiles("Project/model/metadata.xml").then(function(aModelFolderFiles1) {
				expect(aModelFolderFiles1.length).to.equal(4);
			});
		});
	});
});
