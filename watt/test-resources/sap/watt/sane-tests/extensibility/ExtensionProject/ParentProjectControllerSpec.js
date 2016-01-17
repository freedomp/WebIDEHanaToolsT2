define(['STF', "sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/services/ParentProjectController"],
	function(STF, ParentProjectController) {

	"use strict";

	describe("Unit tests for ParentProjectController internal functions", function() {
		var parentProjectController;

		// The paths are in the format appropriate for parent from workspace
		var aWorkspaceResourcesInfo = [{
			name: "PurchaseOrderItem.json",
			path: "/CA_FIORI_INBOX/model/PurchaseOrderItem.json",
			parentFolderPath: "/CA_FIORI_INBOX/model"
		}, {
			name: "metadata.xml",
			path: "/CA_FIORI_INBOX/model/metadata.xml",
			parentFolderPath: "/CA_FIORI_INBOX/model"
		}, {
			name: "Component.js",
			path: "/CA_FIORI_INBOX/Component.js",
			parentFolderPath: "/CA_FIORI_INBOX"
		}, {
			name: "manifest.json",
			path: "/CA_FIORI_INBOX/manifest.json",
			parentFolderPath: "/CA_FIORI_INBOX"
		}, {
			name: "Configuration.js",
			path: "/CA_FIORI_INBOX/Configuration.js",
			parentFolderPath: "/CA_FIORI_INBOX"
		}, {
			name: "Component.js",
			path: "/CA_FIORI_INBOX/annotationBasedTaskUI/Component.js",
			parentFolderPath: "/CA_FIORI_INBOX/annotationBasedTaskUI"
		}, {
			name: "oDataReadExtension.js",
			path: "/CA_FIORI_INBOX/attachment/oDataReadExtension.js",
			parentFolderPath: "/CA_FIORI_INBOX/attachment"
		}, {
			name: "Component.js",
			path: "/CA_FIORI_INBOX/attachment/Component.js",
			parentFolderPath: "/CA_FIORI_INBOX/attachment"
		}, {
			name: "myView.view.xml",
			path: "/CA_FIORI_INBOX/view/myView.view.xml",
			parentFolderPath: "/CA_FIORI_INBOX/view"
		}, {
			name: "myController.controller.js",
			path: "/CA_FIORI_INBOX/view/myController.controller.js",
			parentFolderPath: "/CA_FIORI_INBOX/view"
		}, {
			name: "myFragment.fragment.xml",
			path: "/CA_FIORI_INBOX/view/myFragment.fragment.xml",
			parentFolderPath: "/CA_FIORI_INBOX/view"
		}];

		// The paths are in the format appropriate for parent from abap
		var aAbapResourcesInfo = [{
			ontentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FMain-dbg.controller.js/content",
			localFullName: "",
			name: "Main-dbg.controller.js",
			parent: "CA_FIORI_INBOX",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fMain-dbg.controller.js",
			parentFolderPath: "CA_FIORI_INBOX",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FComponent.js/content",
			localFullName: "",
			name: "Component.js",
			parent: "CA_FIORI_INBOX",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fComponent.js",
			parentFolderPath: "CA_FIORI_INBOX",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2Fmanifest.json/content",
			localFullName: "",
			name: "manifest.json",
			parent: "CA_FIORI_INBOX",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fmanifest.json",
			parentFolderPath: "CA_FIORI_INBOX",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FConfiguration.js/content",
			localFullName: "",
			name: "Configuration.js",
			parent: "CA_FIORI_INBOX",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fConfiguration.js",
			parentFolderPath: "CA_FIORI_INBOX",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2Fmodel%2fmetadata.xml/content",
			localFullName: "",
			name: "metadata.xml",
			parent: "CA_FIORI_INBOX",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fmodel%2fmetadata.xml",
			parentFolderPath: "CA_FIORI_INBOX",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FannotationBasedTaskUI%2FComponent.js/content",
			localFullName: "",
			name: "Component.js",
			parent: "CA_FIORI_INBOX%2fannotationBasedTaskUI",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fannotationBasedTaskUI%2fComponent.js",
			parentFolderPath: "CA_FIORI_INBOX/annotationBasedTaskUI",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FannotationBasedTaskUI%2Fresources.json/content",
			localFullName: "",
			name: "resources.json",
			parent: "CA_FIORI_INBOX%2fannotationBasedTaskUI",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fannotationBasedTaskUI%2fresources.json",
			parentFolderPath: "CA_FIORI_INBOX/annotationBasedTaskUI",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FviewI%2FmyView.view.xml/content",
			localFullName: "",
			name: "myView.view.xml",
			parent: "CA_FIORI_INBOX%2fview",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fview%2fmyView.view.xml",
			parentFolderPath: "CA_FIORI_INBOX/view",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FviewI%2FmyController.controller.js/content",
			localFullName: "",
			name: "myController.controller.js",
			parent: "CA_FIORI_INBOX%2fview",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fview%2fmyController.controller.js",
			parentFolderPath: "CA_FIORI_INBOX/view",
			type: "file"
		}, {
			contentUrl: "/sap/bc/adt/filestore/ui5-bsp/objects/CA_FIORI_INBOX%2FviewI%2FmyFragment.fragment.xml/content",
			localFullName: "",
			name: "myFragment.fragment.xml",
			parent: "CA_FIORI_INBOX%2fview",
			parentContentUrl: undefined,
			path: "CA_FIORI_INBOX%2fview%2fmyFragment.fragment.xml",
			parentFolderPath: "CA_FIORI_INBOX/view",
			type: "file"
		}];

		// The paths are in the format appropriate for parent from hcp
		var aHcpResourcesInfo = [{
			name: "Component.js",
			path: "/Component.js",
			parentFolderPath: ""
		}, {
			name: "manifest.json",
			path: "/manifest.json",
			parentFolderPath: ""
		}, {
			name: "Configuration.js",
			path: "/Configuration.js",
			parentFolderPath: ""
		}, {
			name: "metadata.xml",
			path: "/model/metadata.xml",
			parentFolderPath: "model"
		}, {
			name: "Configuration-dbg.js",
			path: "/Configuration-dbg.js",
			parentFolderPath: ""
		}, {
			name: "Component.js",
			path: "/annotationBasedTaskUI/Component.js",
			parentFolderPath: "annotationBasedTaskUI"
		}, {
			name: "",
			path: "/annotationBasedTaskUI/fragments/",
			parentFolderPath: "annotationBasedTaskUI/fragments"
		}, {
			name: "Component.js",
			path: "/attachment/Component.js",
			parentFolderPath: "attachment"
		}, {
			name: "myView.view.xml",
			path: "/view/myView.view.xml",
			parentFolderPath: "view"
		}, {
			name: "myController.controller.js",
			path: "/view/myController.controller.js",
			parentFolderPath: "view"
		}, {
			name: "myFragment.fragment.xml",
			path: "/view/myFragment.fragment.xml",
			parentFolderPath: "view"
		}, { ////////////////////////////// same content - under build folder
			name: "Component.js",
			path: "/dist/Component.js",
			parentFolderPath: "dist"
		}, {
			name: "manifest.json",
			path: "/dist/manifest.json",
			parentFolderPath: "dist"
		}, {
			name: "Configuration.js",
			path: "/dist/Configuration.js",
			parentFolderPath: "dist"
		}, {
			name: "metadata.xml",
			path: "/dist/model/metadata.xml",
			parentFolderPath: "dist/model"
		}, {
			name: "Configuration-dbg.js",
			path: "/dist/Configuration-dbg.js",
			parentFolderPath: "dist"
		}, {
			name: "Component.js",
			path: "/dist/annotationBasedTaskUI/Component.js",
			parentFolderPath: "dist/annotationBasedTaskUI"
		}, {
			name: "",
			path: "/dist/annotationBasedTaskUI/fragments/",
			parentFolderPath: "dist/annotationBasedTaskUI/fragments"
		}, {
			name: "Component.js",
			path: "/dist/attachment/Component.js",
			parentFolderPath: "dist/attachment"
		}, {
			name: "myView.view.xml",
			path: "/dist/view/myView.view.xml",
			parentFolderPath: "dist/view"
		}, {
			name: "myController.controller.js",
			path: "/dist/view/myController.controller.js",
			parentFolderPath: "dist/view"
		}, {
			name: "myFragment.fragment.xml",
			path: "/dist/view/myFragment.fragment.xml",
			parentFolderPath: "dist/view"
		}
		
		];

		function buildMockContext() {
			parentProjectController.context = {};

			parentProjectController.context.service = {};
			parentProjectController.context.service.filesystem = {};
			parentProjectController.context.service.filesystem.documentProvider = {};
			parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
				var oDocument = {};
				return Q(oDocument);
			};

			parentProjectController.context.service.builder = {};
			parentProjectController.context.service.builder.getTargetFolder = function() {
				var oDocument = {};
				oDocument.getEntity = function() {
					var oEntity = {};
					oEntity.getTitle = function() {
						return "dist";
					};
					return oEntity;
				};
				return Q(oDocument);
			};
			parentProjectController.context.service.builder.getTargetFolderByProjectSettings = function() {
				return Q("dist");
			};			

			parentProjectController.context.service.workspaceparentproject = {};
			parentProjectController.context.service.workspaceparentproject.getFileResourcesInfo = function() {
				return Q(aWorkspaceResourcesInfo);
			};
			parentProjectController.context.service.workspaceparentproject.getDocument = function() {
				var oDocument = {};
				oDocument.getContent = function() {
					return Q("{}");// Any dummy object is fine
				};
				return Q(oDocument);
			};

			parentProjectController.context.service.bspparentproject = {};
			parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
				return Q(aAbapResourcesInfo);
			};
			parentProjectController.context.service.bspparentproject.getDocument = function() {
				var oDocument = {};
				oDocument.getContent = function() {
					return Q("{}");// Any dummy object is fine
				};
				return Q(oDocument);
			};

			parentProjectController.context.service.heliumparentproject = {};
			parentProjectController.context.service.heliumparentproject.getFileResourcesInfo = function() {
				return Q(aHcpResourcesInfo);
			};
			parentProjectController.context.service.heliumparentproject.getDocument = function() {
				var oDocument = {};
				oDocument.getContent = function() {
					return Q("{}");// Any dummy object is fine
				};
				return Q(oDocument);
			};
		}

		beforeEach(function() {
			parentProjectController = new ParentProjectController();
			buildMockContext();
		});

		describe("Checks if a resource belongs to a sub component", function() {
			it("Parent from workspace", function() {
				// The paths are in the format appropriate for parent from workspace
				var aSubComponentPaths = ["/CA_FIORI_INBOX/annotationBasedTaskUI", "/CA_FIORI_INBOX/attachment"];
				var sResourcePath = "/CA_FIORI_INBOX";
				var bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "/CA_FIORI_INBOX/frag";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "/CA_FIORI_INBOX/annotationBasedTaskUI/fragments";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.true;
			});

			it("Parent from abap", function() {
				// The paths are in the format appropriate for parent from abap
				var aSubComponentPaths = ["CA_FIORI_INBOX/annotationBasedTaskUI", "CA_FIORI_INBOX/attachment"];
				var sResourcePath = "CA_FIORI_INBOX";
				var bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "CA_FIORI_INBOX/frag";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "CA_FIORI_INBOX/annotationBasedTaskUI/fragments";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.true;
			});

			it("Parent from hcp", function() {
				// The paths are in the format appropriate for parent from hcp
				var aSubComponentPaths = ["annotationBasedTaskUI", "attachment"];
				var sResourcePath = "";
				var bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "frag";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
				sResourcePath = "annotationBasedTaskUI/fragments";
				bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.true;
			});

			it("Empty list of sub components", function() {
				var aSubComponentPaths = [];
				var sResourcePath = "CA_FIORI_INBOX";
				var bIsSubComponent = parentProjectController.isSubComponentResource(sResourcePath, aSubComponentPaths);
				expect(bIsSubComponent).to.be.false;
			});
		});

		describe("Gets component information", function() {
			it("Parent from workspace", function() {
				var oComponentsInfo = parentProjectController.getComponentsInfo(aWorkspaceResourcesInfo);
				expect(oComponentsInfo.rootComponentPath).to.equal("/CA_FIORI_INBOX");
				expect(oComponentsInfo.rootComponentFilePath).to.equal("/CA_FIORI_INBOX/Component.js");
				expect(oComponentsInfo.subComponentPaths).to.deep.equal(["/CA_FIORI_INBOX/annotationBasedTaskUI", "/CA_FIORI_INBOX/attachment"]);
			});

			it("Parent from abap", function() {
				var oComponentsInfo = parentProjectController.getComponentsInfo(aAbapResourcesInfo);
				expect(oComponentsInfo.rootComponentPath).to.equal("CA_FIORI_INBOX");
				expect(oComponentsInfo.rootComponentFilePath).to.equal("CA_FIORI_INBOX%2fComponent.js");
				expect(oComponentsInfo.subComponentPaths).to.deep.equal(["CA_FIORI_INBOX/annotationBasedTaskUI"]);
			});

			it("Parent from hcp", function() {
				var sBuildFolderPath = "dist";
				var sType = "hcp";
				var sParentProjectPath = "cafioriinbox";
				var aCloneOfResources = aHcpResourcesInfo.slice(0);
				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);				
				var oComponentsInfo = parentProjectController.getComponentsInfo(aCloneOfResources);
				expect(oComponentsInfo.rootComponentPath).to.equal("dist");
				expect(oComponentsInfo.rootComponentFilePath).to.equal("/dist/Component.js");
				expect(oComponentsInfo.subComponentPaths).to.deep.equal(["dist/annotationBasedTaskUI", "dist/attachment"]);
			});
		});

		describe("Adjusts resources according to build folder", function() {
			it("Parent from workspace, without build folder", function() {
				var sBuildFolderPath = null;
				var sType = "Workspace";
				var sParentProjectPath = "/CA_FIORI_INBOX";
				var aCloneOfResources = aWorkspaceResourcesInfo.slice(0);

				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);
				expect(aCloneOfResources).to.deep.equal(aWorkspaceResourcesInfo);
			});

			it("Parent from workspace, with build folder", function() {
				var sBuildFolderPath = "dist";
				var sType = "Workspace";
				var sParentProjectPath = "/CA_FIORI_INBOX";
				var aCloneOfResources = aWorkspaceResourcesInfo.slice(0);
				aCloneOfResources.push({
					name: "abc.js",
					path: "/CA_FIORI_INBOX/dist/abc.js",
					parentFolderPath: "/CA_FIORI_INBOX/dist"
				});

				var nAmountOfResourcesBeforeAdjust = aCloneOfResources.length;
				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);
				var nAmountOfResourcesAfterAdjust = aCloneOfResources.length;
				expect(nAmountOfResourcesAfterAdjust).to.equal(nAmountOfResourcesBeforeAdjust - 1);
				expect(aCloneOfResources).to.deep.equal(aWorkspaceResourcesInfo);
			});

			it("Parent from abap, there is never a build folder", function() {
				var sBuildFolderPath = null;
				var sType = "abaprep";
				var sParentProjectPath = "CA_FIORI_INBOX";
				var aCloneOfResources = aAbapResourcesInfo.slice(0);

				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);
				expect(aCloneOfResources).to.deep.equal(aAbapResourcesInfo);
			});

			it("Parent from hcp, without build folder", function() {
				var sBuildFolderPath = null;
				var sType = "hcp";
				var sParentProjectPath = "/CA_FIORI_INBOX";
				var aCloneOfResources = aHcpResourcesInfo.slice(0);

				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);
				expect(aCloneOfResources).to.deep.equal(aHcpResourcesInfo);
			});

			function getNonBuildHcpResources() {
				var aNonBuildHcpResources = [];
				for (var i = 0; i < aHcpResourcesInfo.length; i++) {
					if (aHcpResourcesInfo[i].path.indexOf("/dist") !== 0) {
						aNonBuildHcpResources.push(aHcpResourcesInfo[i]);
					}
				}
				
				return aNonBuildHcpResources;
			}

			it("Parent from hcp, with build folder", function() {
				var sBuildFolderPath = "dist";
				var sType = "hcp";
				var sParentProjectPath = "cafioriinbox";
				var aCloneOfResources = aHcpResourcesInfo.slice(0);

				var nAmountOfResourcesBeforeAdjust = aCloneOfResources.length;
				parentProjectController.adjustBuildResources(aCloneOfResources, sBuildFolderPath, sType, sParentProjectPath);
				var nAmountOfResourcesAfterAdjust = aCloneOfResources.length;
				expect(nAmountOfResourcesAfterAdjust).to.equal(nAmountOfResourcesBeforeAdjust - getNonBuildHcpResources().length);
			});
		});

		describe("Gets build folder path according to parent type", function() {
			it("Workspace", function() {
				return parentProjectController.getBuildFolderPath("dummy", [], "Workspace").then(function(sBuildFolderPath) {
					expect(sBuildFolderPath).to.equal("dist");
				});
			});

			it("Abap", function() {
				return parentProjectController.getBuildFolderPath("dummy", [], "abaprep").then(function(sBuildFolderPath) {
					expect(sBuildFolderPath).to.be.null;
					return parentProjectController.getBuildFolderPath("dummy", [], "BSP").then(function(sBuildFolderPath) {
						expect(sBuildFolderPath).to.be.null;
					});
				});
			});

			it("Hcp", function() {
				// positive flow
				return parentProjectController.getBuildFolderPath("dummy", [], "hcp").then(function(sBuildFolderPath) {
					expect(sBuildFolderPath).to.equal("dist");

					// mock the getDocument method to throw an error
					parentProjectController.context.service.heliumparentproject.getDocument = function() {
						return Q.reject("Error!");
					};

					// negative flow
					return parentProjectController.getBuildFolderPath("dummy", [], "hcp").then(function(sBuildFolderPath) {
						expect(sBuildFolderPath).to.equal(null);
					});
				});
			});
		});

		describe("Checks if a metadata location is valid", function() {
			it("Workspace - valid with 'model'", function() {
				var sResourcePath = "/CA_FIORI_INBOX/model/metadata.xml";
				var sRootComponentPath = "/CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "Workspace");
				expect(bIsValid).to.be.true;
			});

			it("Workspace - valid with 'localService'", function() {
				var sResourcePath = "/CA_FIORI_INBOX/localService/metadata.xml";
				var sRootComponentPath = "/CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "Workspace");
				expect(bIsValid).to.be.true;
			});

			it("Workspace - invalid", function() {
				var sResourcePath = "/CA_FIORI_INBOX/xxx/metadata.xml";
				var sRootComponentPath = "/CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "Workspace");
				expect(bIsValid).to.be.false;
			});

			it("Abap - valid with 'model'", function() {
				var sResourcePath = "CA_FIORI_INBOX%2fmodel%2fmetadata.xml";
				var sRootComponentPath = "CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "abaprep");
				expect(bIsValid).to.be.true;
			});

			it("Abap - valid with 'localService'", function() {
				var sResourcePath = "CA_FIORI_INBOX%2flocalService%2fmetadata.xml";
				var sRootComponentPath = "CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "abaprep");
				expect(bIsValid).to.be.true;
			});

			it("Abap - invalid", function() {
				var sResourcePath = "CA_FIORI_INBOX%2fyyy%2fmetadata.xml";
				var sRootComponentPath = "CA_FIORI_INBOX";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "abaprep");
				expect(bIsValid).to.be.false;
			});

			it("Hcp - valid with 'model'", function() {
				var sResourcePath = "/model/metadata.xml";
				var sRootComponentPath = "";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "hcp");
				expect(bIsValid).to.be.true;
			});

			it("Hcp - valid with 'localService'", function() {
				var sResourcePath = "/localService/metadata.xml";
				var sRootComponentPath = "";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "hcp");
				expect(bIsValid).to.be.true;
			});

			it("Hcp - invalid", function() {
				var sResourcePath = "/zzz/metadata.xml";
				var sRootComponentPath = "";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "hcp");
				expect(bIsValid).to.be.false;
			});

			it("Hcp - valid with build folder", function() {
				var sResourcePath = "/dist/localService/metadata.xml";
				var sRootComponentPath = "dist";
				var bIsValid = parentProjectController.isValidMetadataLocation(sResourcePath, sRootComponentPath, "hcp", "dist");
				expect(bIsValid).to.be.true;
			});
		});

		describe("Builds the model by calling validateParentProject", function() {
			it("Workspace - With manifest", function() {
				parentProjectController.context.service.workspaceparentproject.getDocument = function(sPath) {
					var oDocument = {};
					oDocument.getContent = function() {
						// Make sure Component.js file includes the reference to manifest
						if (sPath.indexOf("Component.js") >= 0) {
							return Q('jQuery.sap.declare("cross.fnd.fiori.inbox.Component");jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");jQuery.sap.require("sap.ui.core.routing.Router");jQuery.sap.require("sap.ca.scfld.md.ComponentBase");sap.ca.scfld.md.ComponentBase.extend("cross.fnd.fiori.inbox.Component",{metadata:sap.ca.scfld.md.ComponentBase.createMetaData("MD",{"manifest":"json",viewPath:"cross.fnd.fiori.inbox.view",detailPageRoutes:{"detail":{"pattern":"detail/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"multi_select_summary":{"pattern":"multi_select_summary","view":"MultiSelectSummary"}},fullScreenPageRoutes:{"detail_deep":{"pattern":"detail_deep/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"substitution":{"pattern":"substitution","view":"ViewSubstitution"}}}),createContent:function(){var v={component:this};return sap.ui.view({viewName:"cross.fnd.fiori.inbox.Main",type:sap.ui.core.mvc.ViewType.XML,viewData:v});},setDataManager:function(d){this.oDataManager=d;},getDataManager:function(){return this.oDataManager;}});');
						}
						return Q("{}");// Any dummy object is fine
					};
					return Q(oDocument);
				};

				return parentProjectController.validateParentProject("/CA_FIORI_INBOX", "Workspace").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("Workspace");
					expect(oModel.extensibility.component).to.equal("/CA_FIORI_INBOX/Component.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "/CA_FIORI_INBOX/view/myView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "/CA_FIORI_INBOX/view/myFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "/CA_FIORI_INBOX/view/myController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.equal("/CA_FIORI_INBOX/manifest.json");
					expect(oModel.extensibility.configuration).to.equal("/CA_FIORI_INBOX/Configuration.js");
					expect(oModel.metadataPath).to.equal("/CA_FIORI_INBOX/model/metadata.xml");
				});
			});

			it("Workspace - Without manifest", function() {
				return parentProjectController.validateParentProject("/CA_FIORI_INBOX", "Workspace").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("Workspace");
					expect(oModel.extensibility.component).to.equal("/CA_FIORI_INBOX/Component.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "/CA_FIORI_INBOX/view/myView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "/CA_FIORI_INBOX/view/myFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "/CA_FIORI_INBOX/view/myController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.be.undefined;
					expect(oModel.extensibility.configuration).to.equal("/CA_FIORI_INBOX/Configuration.js");
					expect(oModel.metadataPath).to.equal("/CA_FIORI_INBOX/model/metadata.xml");
				});
			});

			it("Abap - With manifest", function() {
				parentProjectController.context.service.bspparentproject.getDocument = function(sPath) {
					var oDocument = {};
					oDocument.getContent = function() {
						// Make sure Component.js file includes the reference to manifest
						if (sPath.indexOf("Component.js") >= 0) {
							return Q('jQuery.sap.declare("cross.fnd.fiori.inbox.Component");jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");jQuery.sap.require("sap.ui.core.routing.Router");jQuery.sap.require("sap.ca.scfld.md.ComponentBase");sap.ca.scfld.md.ComponentBase.extend("cross.fnd.fiori.inbox.Component",{metadata:sap.ca.scfld.md.ComponentBase.createMetaData("MD",{"manifest":"json",viewPath:"cross.fnd.fiori.inbox.view",detailPageRoutes:{"detail":{"pattern":"detail/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"multi_select_summary":{"pattern":"multi_select_summary","view":"MultiSelectSummary"}},fullScreenPageRoutes:{"detail_deep":{"pattern":"detail_deep/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"substitution":{"pattern":"substitution","view":"ViewSubstitution"}}}),createContent:function(){var v={component:this};return sap.ui.view({viewName:"cross.fnd.fiori.inbox.Main",type:sap.ui.core.mvc.ViewType.XML,viewData:v});},setDataManager:function(d){this.oDataManager=d;},getDataManager:function(){return this.oDataManager;}});');
						}
						return Q("{}");// Any dummy object is fine
					};
					return Q(oDocument);
				};

				return parentProjectController.validateParentProject("CA_FIORI_INBOX", "abaprep").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("abaprep");
					expect(oModel.extensibility.component).to.equal("CA_FIORI_INBOX%2fComponent.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "CA_FIORI_INBOX%2fview%2fmyView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "CA_FIORI_INBOX%2fview%2fmyFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "CA_FIORI_INBOX%2fview%2fmyController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.equal("CA_FIORI_INBOX%2fmanifest.json");
					expect(oModel.extensibility.configuration).to.equal("CA_FIORI_INBOX%2fConfiguration.js");
					expect(oModel.metadataPath).to.equal("CA_FIORI_INBOX%2fmodel%2fmetadata.xml");
				});
			});

			it("Abap - Without manifest", function() {
				return parentProjectController.validateParentProject("CA_FIORI_INBOX", "abaprep").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("abaprep");
					expect(oModel.extensibility.component).to.equal("CA_FIORI_INBOX%2fComponent.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "CA_FIORI_INBOX%2fview%2fmyView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "CA_FIORI_INBOX%2fview%2fmyFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "CA_FIORI_INBOX%2fview%2fmyController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.be.undefined;
					expect(oModel.extensibility.configuration).to.equal("CA_FIORI_INBOX%2fConfiguration.js");
					expect(oModel.metadataPath).to.equal("CA_FIORI_INBOX%2fmodel%2fmetadata.xml");
				});
			});

			it("Hcp - With manifest", function() {
				parentProjectController.context.service.heliumparentproject.getDocument = function(sPath) {
					var oDocument = {};
					oDocument.getContent = function() {
						// Make sure Component.js file includes the reference to manifest
						if (sPath.indexOf("Component.js") >= 0) {
							return Q('jQuery.sap.declare("cross.fnd.fiori.inbox.Component");jQuery.sap.require("sap.ui.core.UIComponent");jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");jQuery.sap.require("sap.ui.core.routing.Router");jQuery.sap.require("sap.ca.scfld.md.ComponentBase");sap.ca.scfld.md.ComponentBase.extend("cross.fnd.fiori.inbox.Component",{metadata:sap.ca.scfld.md.ComponentBase.createMetaData("MD",{"manifest":"json",viewPath:"cross.fnd.fiori.inbox.view",detailPageRoutes:{"detail":{"pattern":"detail/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"multi_select_summary":{"pattern":"multi_select_summary","view":"MultiSelectSummary"}},fullScreenPageRoutes:{"detail_deep":{"pattern":"detail_deep/{SAP__Origin}/{InstanceID}/{contextPath}","view":"S3"},"substitution":{"pattern":"substitution","view":"ViewSubstitution"}}}),createContent:function(){var v={component:this};return sap.ui.view({viewName:"cross.fnd.fiori.inbox.Main",type:sap.ui.core.mvc.ViewType.XML,viewData:v});},setDataManager:function(d){this.oDataManager=d;},getDataManager:function(){return this.oDataManager;}});');
						}
						return Q("{}");// Any dummy object is fine
					};
					return Q(oDocument);
				};

				return parentProjectController.validateParentProject("CA_FIORI_INBOX", "hcp").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("hcp");
					expect(oModel.extensibility.component).to.equal("/dist/Component.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "/dist/view/myView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "/dist/view/myFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "/dist/view/myController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.equal("/dist/manifest.json");
					expect(oModel.extensibility.configuration).to.equal("/dist/Configuration.js");
					expect(oModel.metadataPath).to.equal("/dist/model/metadata.xml");
				});
			});

			it("Hcp - Without manifest", function() {
				return parentProjectController.validateParentProject("CA_FIORI_INBOX", "hcp").then(function(oResult) {
					var oModel = oResult.model;
					expect(oModel.extensibility.type).to.equal("hcp");
					expect(oModel.extensibility.component).to.equal("/dist/Component.js");
					expect(oModel.extensibility.views).to.deep.equal({
						"myView": "/dist/view/myView.view.xml"
					});
					expect(oModel.extensibility.fragments).to.deep.equal({
						"myFragment": "/dist/view/myFragment.fragment.xml"
					});
					expect(oModel.extensibility.controllers).to.deep.equal({
						"myController": "/dist/view/myController.controller.js"
					});
					expect(oModel.extensibility.manifest).to.be.undefined;
					expect(oModel.extensibility.configuration).to.equal("/dist/Configuration.js");
					expect(oModel.metadataPath).to.equal("/dist/model/metadata.xml");
				});
			});
		});
	});

	describe("Unit tests for ParentProjectController external functions", function() {

		var parentProjectController;

		function buildMockContextForExternalFunctions() {
			parentProjectController.context = {};
			parentProjectController.context.service = {};

			parentProjectController.context.service.bspparentproject = {};
			parentProjectController.context.service.bspparentproject.getRuntimeDestinations = function() {
				return Q([]);
			};
			parentProjectController.context.service.bspparentproject.getDocument = function() {
				return Q({});
			};
			parentProjectController.context.service.bspparentproject.geti18nFolderFiles = function() {
				var files = [];
				files.push({});
				files.push({});
				return Q(files);
			};
			parentProjectController.context.service.bspparentproject.getModelFolderFiles = function() {
				return Q({});
			};
			parentProjectController.context.service.bspparentproject.getMetadataXmlPath = function() {
				return Q("SD_SO_MON%2fmodel%2fmetadata.xml");
			};
			parentProjectController.context.service.bspparentproject.getProjectPathandName = function() {
				return Q("");
			};

			parentProjectController.context.service.heliumparentproject = {};
			parentProjectController.context.service.heliumparentproject.import = function() {
				return Q({});
			};
			parentProjectController.context.service.heliumparentproject.getModelFolderFiles = function() {
				return Q({});
			};

			parentProjectController.context.service.workspaceparentproject = {};
			parentProjectController.context.service.workspaceparentproject.getRuntimeDestinations = function() {
				var destinations = [];
				destinations.push({});
				destinations.push({});
				return Q(destinations);
			};
			parentProjectController.context.service.workspaceparentproject.geti18nFolderFiles = function() {
				var files = [];
				files.push({});
				files.push({});
				files.push({});
				return Q(files);
			};
			parentProjectController.context.service.workspaceparentproject.getDocument = function() {
				return Q({});
			};

			parentProjectController.context.i18n = {};
			parentProjectController.context.i18n.getText = function() {
				return "dummy text";
			};

			parentProjectController.context.service.discovery = {};
			parentProjectController.context.service.discovery.getStatusBySystem = function() {
				return Q([{
					destination : "GM6",
					path : "/sap/bc/adt"
				}]);
			};

			parentProjectController.context.service.filesystem = {};
			parentProjectController.context.service.filesystem.documentProvider = {};
			parentProjectController.context.service.filesystem.documentProvider.getRoot = function() {
				var document = {};
				document.objectExists = function() {
					return Q(false);
				};
				return Q(document);
			};
			parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
				var document = {};
				document.getContent = function() {
					return Q("{\"routes\": [{\"path\": \"odata\"}]}");
				};
				document.getEntity = function() {
					var getType = function() {
						return "folder";
					};
					var getName = function() {
						return "Main.view.xml";
					};
					return {
						getType : getType,
						getName : getName
					};
				};
				document.getFolderContent = function() {
					var files = [];
					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "name";
							};
							var getFullPath = function() {
								return "/full/path/dummy.view.xml";
							};
							return {
								getType : getType,
								getName : getName,
								getFullPath : getFullPath
							};
						}
					});

					return Q(files);
				};
				return Q(document);
			};

			parentProjectController.context.service.extensionproject = {};
			parentProjectController.context.service.extensionproject.createFolderName = function() {
				return Q();
			};

			parentProjectController.context.service.builder = {};
			parentProjectController.context.service.builder.getTargetFolder = function() {
				var oDocument = {};
				oDocument.getEntity = function() {
					var oEntity = {};
					oEntity.getTitle = function() {
						return "dist";
					};
					return oEntity;
				};
				return Q(oDocument);
			};
		}

		beforeEach(function() {
			parentProjectController = new ParentProjectController();
			buildMockContextForExternalFunctions();
		});

		it("Tests getRuntimeDestinations method", function() {

			// negative test - undefined input
			return parentProjectController.getRuntimeDestinations(undefined,"abaprep").fail(function(oError) {
				expect(oError.message).to.exist;

				// negative test - null input
				return parentProjectController.getRuntimeDestinations(null, "abaprep", "/neo-app.json").then(function(destinations1) {
					expect(destinations1.length).to.equal(0);

					// positive test - 2 destinations
					return parentProjectController.getRuntimeDestinations("/starter", "Workspace").then(function(destinations2) {
						expect(destinations2.length).to.equal(2);

						// mock "getDocument" method
						parentProjectController.getDocument = function() {
							var fileDocument = {};
							fileDocument.getContent = function() {
								var jsonContentString = "{\"welcomeFile\": \"index.html\",\"routes\": [{\"path\": \"/resources\",\"target\": {\"type\": \"destination\",\"name\": \"ui5dist\"},\"description\": \"SAPUI5 Dist layer resources\"}]}";
								return Q(jsonContentString);
							};
							fileDocument.getEntity = function() {
								var getType = function() {
									return "file";
								};
								var getName = function() {
									return "neo-app.json";
								};

								return {
									getType : getType,
									getName : getName
								};
							};
							return Q(fileDocument);
						};

						// positive test - 2 destinations
						return parentProjectController.getRuntimeDestinations("/starter", "Workspace", "/neo-app.json").then(function(destinations3) {
							expect(destinations3.length).to.equal(2);
						});
					});
				});
			});
		});

		it("Tests getGuidelinesDocument method", function() {

			var extModel = {};
			extModel.manifest = "/demo/webapp/manifest.json";
			extModel.component = "/demo/webapp/Component.js";

			// mock the "getDocument" method
			parentProjectController.context.service.bspparentproject.getDocument = function() {
				var fileDocument = {};
				fileDocument.getContent = function() {
					return Q("");
				};
				return Q(fileDocument);
			};

			// negative test - null input
			return parentProjectController.getGuidelinesDocument(extModel, null, "abaprep").then(function(document1) {
				expect(document1).to.exist;

				// validation 3
				return parentProjectController.getGuidelinesDocument(extModel, null,"abaprep").then(function(document2) {
					return document2.getContent().then(function(docContent1){
						expect(docContent1.length).to.equal(0);

						// mock the "getDocument" method
						parentProjectController.context.service.workspaceparentproject.getDocument = function() {
							var fileDocument = {};
							fileDocument.getContent = function() {
								var contentString = "sap.ui.define([\"sap/ui/core/UIComponent\",\"sap/ui/model/resource/ResourceModel\",\"rrr/model/models\",\"rrr/controller/ListSelector\",\"rrr/controller/ErrorHandler\",\"rrr/model/formatter\",\"rrr/model/grouper\"], function(UIComponent, ResourceModel, models, ListSelector, ErrorHandler) {\"use strict\";return UIComponent.extend(\"rrr.Component\", {metadata: {manifest: \"json\"},init: function() {this.oListSelector = new ListSelector();this._oErrorHandler = new ErrorHandler(this);this.setModel(models.createDeviceModel(), \"device\");this.setModel(models.createFLPModel(), \"FLP\");UIComponent.prototype.init.apply(this, arguments);this.getRouter().initialize();},destroy: function() {this.oListSelector.destroy();this._oErrorHandler.destroy();UIComponent.prototype.destroy.apply(this, arguments);},getContentDensityClass: function() {if (!this._sContentDensityClass) {if (!sap.ui.Device.support.touch) {this._sContentDensityClass = \"sapUiSizeCompact\";} else {this._sContentDensityClass = \"sapUiSizeCozy\";}}return this._sContentDensityClass;}});});"
								return Q(contentString);
							};
							return Q(fileDocument);
						};

						return parentProjectController.getGuidelinesDocument(extModel, null,"Workspace").then(function(document3) {
							return document3.getContent().then(function(docContent2){
								expect(docContent2.length > 0).to.be.true;
							});
						});
					});
				});
			});
		});

		it("Tests getExtensionPoints method", function() {
			// prepare model
			var model = {};
			model.extensibility = {};

			var selectedView = {};
			selectedView.path = "HCM_LR_CRE%2fMain.view.xml";

			// mock "getDocument" method
			parentProjectController.getDocument = function() {
				var fileDocument = {};
				fileDocument.getContent = function() {
					var xmlContentString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><ExtensionPoint name=\"extS1Field\"></ExtensionPoint>";
					var parser = new DOMParser();
					var xmlContent = parser.parseFromString(
						xmlContentString, "text/xml");
					return Q(xmlContent);
				};

				fileDocument.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "Main.view.xml";
					};

					return {
						getType : getType,
						getName : getName
					};
				};

				return Q(fileDocument);
			};

			// positive test
			return parentProjectController.getExtensionPoints(selectedView, "abaprep").then(function(controlIds) {
				expect(controlIds.length).to.equal(1);
			});
		});

		it("Tests getControlIds method", function() {
			// prepare model
			var model = {};
			model.extensibility = {};

			var selectedView = {};
			selectedView.path = "HCM_LR_CRE%2fMain.view.xml";

			// mock the "getDocument" method
			parentProjectController.getDocument = function() {
				var fileDocument = {};
				fileDocument.getContent = function() {
					var xmlContentString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>";
					var parser = new DOMParser();
					var xmlContent = parser.parseFromString(
						xmlContentString, "text/xml");
					return Q(xmlContent);
				};

				fileDocument.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "Main.view.xml";
					};

					return {
						getType : getType,
						getName : getName
					};
				};
				return Q(fileDocument);
			};

			// validation
			return parentProjectController.getControlIds(selectedView, "abaprep").then(function(controlIds1) {
				expect(controlIds1.length).to.equal(2);

				// mock the "getDocument" method
				parentProjectController.getDocument = function() {
					var fileDocument = {};
					fileDocument.getContent = function() {
						var xmlContentString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>";
						var parser = new DOMParser();
						var xmlContent = parser.parseFromString(
							xmlContentString, "text/xml");
						return Q(xmlContent);
					};

					fileDocument.getEntity = function() {
						var getType = function() {
							return "file";
						};
						var getName = function() {
							return "Main.view.js"; // suffix different than view.xml
						};

						return {
							getType : getType,
							getName : getName
						};
					};
					return Q(fileDocument);
				};

				return parentProjectController.getControlIds(selectedView, "abaprep").then(function(controlIds2) {
					expect(controlIds2).to.exist;
				});
			});
		});

		it("Tests geti18nFolderFiles method", function() {
			// prepare model
			var model = {};
			model.extensibility = {};
			model.extensibility.type = "Workspace";
			model.fiori = {};
			model.fiori.extensionCommon = {};
			model.fiori.extensionCommon.parentPath = "/ParentProjectPath";
			model.fiori.extensionCommon.resourceLocationPath = "/i18n/";

			// abap flow
			return parentProjectController.geti18nFolderFiles("HCM_LR_CRE%2fi18n", undefined, "abaprep").then(function(i18nFolderFiles1) {
				expect(i18nFolderFiles1.length).to.equal(2);

				// workspace flow
				return parentProjectController.geti18nFolderFiles("/starter/i18n", undefined, "Workspace").then(function(i18nFolderFiles2) {
					expect(i18nFolderFiles2.length).to.equal(3);
				});
			});
		});

		it("Tests getResources method", function() {
			// prepare model
			var model = {};
			model.extensibility = {};
			model.extensibility.type = "abaprep";
			model.extensibility.component = "HCM_LR_CRE%2fComponent.js";
			model.extensibility.namespace = "hcm.emp.myleaverequests";
			model.extensibility.patentPath = "HCM_LR_CRE";
			model.extensibility.views = {};
			model.extensibility.views["Main"] = "HCM_LR_CRE%2fMain.view.xml";

			var files = parentProjectController.getResources(model, "views");
			expect(files.length).to.equal(1);
		});

		it("Tests getDocument method", function() {
			// abap flow
			return parentProjectController.getDocument("SD_SO_MON%2fComponent.js", "file", {},"abaprep").then(function(document1) {
				expect(document1).to.exist;

				// workspace flow
				return parentProjectController.getDocument("/starter/Component.js", "file", {}, "Workspace").then(function(document2) {
					expect(document2).to.exist;
				});
			});
		});

		it("Tests getViewInfo method", function() {
			// mock the getDocument method
			parentProjectController.context.service.workspaceparentproject.getDocument = function() {
				var fileDocument = {};
				fileDocument.getEntity = function() {
					return {
						getType : function() {
							return "file";
						},
						getName : function() {
							return "Main.view.xml";
						}
					};
				};
				fileDocument.getContent = function() {
					return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
				};
				return Q(fileDocument);
			};

			var selectedView = {};
			selectedView.path = "/starter/Main.view.xml";

			// workspace flow with xml file
			return parentProjectController.getViewInfo(selectedView, "Workspace").then(function(viewInfo1) {
				expect(viewInfo1.controlIds.length).to.equal(2);

				// mock the getDocument method
				parentProjectController.context.service.workspaceparentproject.getDocument = function() {
					var fileDocument = {};
					fileDocument.getEntity = function() {
						return {
							getType : function() {
								return "file";
							},
							getName : function() {
								return "Main.view.js"; // no view.xml suffix
							}
						};
					};
					fileDocument.getContent = function() {
						return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
					};
					return Q(fileDocument);
				};

				// workspace flow with js file
				return parentProjectController.getViewInfo(selectedView, "Workspace").then(function(viewInfo2) {
					expect(viewInfo2).to.exist;

					// mock the getDocument method
					parentProjectController.context.service.workspaceparentproject.getDocument = function() {
						var fileDocument = {};
						fileDocument.getEntity = function() {
							return {
								getType : function() {
									return "folder";
								},
								getName : function() {
									return "Main.view.xml";
								}
							};
						};
						fileDocument.getContent = function() {
							return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
						};
						return Q(fileDocument);
					};

					// workspace flow with folder
					return parentProjectController.getViewInfo(selectedView, "Workspace").then(function(viewInfo3) {
						expect(viewInfo3).to.exist;
					});
				});
			});
		});

		it("Tests validateParentProject method", function() {

			// mock the getDocument method
			parentProjectController.context.service.bspparentproject.getDocument = function() {
				var document = {};
				document.getContent = function() {
					return Q("jQuery.sap.declare(\"Starter2.Component\");jQuery.sap.require(\"sap.m.routing.RouteMatchedHandler\");sap.ui.core.UIComponent.extend(\"Starter2.Component\", {"
						+ "metadata : {\"name\" : \"Master Detail Sample\",\"version\" : \"1.0\",\"includes\" : [],\"dependencies\" : {\"libs\" : [\"sap.m\", \"sap.me\", \"sap.ushell\"],"
						+ "\"components\" : []},\"config\" : {\"resourceBundle\" : \"i18n/messageBundle.properties\",\"titleResource\" : \"SHELL_TITLE\",\"serviceConfig\" : {name: \"SRA018_SO_TRACKING_SRV\","
						+ "serviceUrl: \"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/\"}},routing: {config: {viewType : \"XML\",viewPath: \"Starter2.view\",targetAggregation: \"detailPages\",clearTarget: false},"
						+ "routes:[{pattern: \"\",name : \"master\",view : \"Master\",targetAggregation : \"masterPages\",preservePageInSplitContainer : true,targetControl: \"fioriContent\",subroutes : [{"
						+ "pattern : \"Detail/{contextPath}\",view : \"Detail\",name : \"Detail\"}]}]}},init : function() {sap.ui.core.UIComponent.prototype.init.apply(this, arguments);"
						+ "this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());this.getRouter().initialize();var oServiceConfig = this.getMetadata().getConfig()[\"serviceConfig\"];var sServiceUrl = oServiceConfig.serviceUrl;"
						+ "var rootPath = jQuery.sap.getModulePath(\"Starter2\");var sProxyOn = jQuery.sap.getUriParameters().get(\"proxyOn\");var bUseProxy = (\"true\" === sProxyOn);if (bUseProxy) {"
						+ "sServiceUrl = rootPath + \"/proxy\" + sServiceUrl;}var responderOn = jQuery.sap.getUriParameters().get(\"responderOn\");var bUseMockData = (\"true\" === responderOn);if (bUseMockData) {"
						+ "jQuery.sap.require(\"sap.ui.app.MockServer\");var oMockServer = new sap.ui.app.MockServer({rootUri: sServiceUrl});oMockServer.simulate(rootPath + \"/model/metadata.xml\", rootPath + \"/model/\");"
						+ "oMockServer.start();var msg = \"Running in demo mode with mock data.\";jQuery.sap.require(\"sap.m.MessageToast\");sap.m.MessageToast.show(msg, {duration: 4000});}var i18nModel = new sap.ui.model.resource.ResourceModel({"
						+ "bundleUrl : rootPath + \"/i18n/messageBundle.properties\"});this.setModel(i18nModel, \"i18n\");var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);this.setModel(m);var deviceModel = new sap.ui.model.json.JSONModel({"
						+ "isTouch : sap.ui.Device.support.touch,isNoTouch : !sap.ui.Device.support.touch,isPhone : jQuery.device.is.phone,isNoPhone : !jQuery.device.is.phone,listMode : (jQuery.device.is.phone) ? \"None\" : \"SingleSelectMaster\","
						+ "listItemType : (jQuery.device.is.phone) ? \"Active\" : \"Inactive\"});deviceModel.setDefaultBindingMode(\"OneWay\");this.setModel(deviceModel, \"device\");},createContent : function() {var oViewData = {component : this};"
						+ "return sap.ui.view({viewName : \"Starter2.view.App\",type : sap.ui.core.mvc.ViewType.XML,viewData : oViewData});}});");
				};
				document.getEntity = function() {
					var getType = function() {
						return "file";
					};
					var getName = function() {
						return "Component.js";
					};
					return {
						getType : getType,
						getName : getName
					};
				};
				document.getFolderContent = function() {
					var files = [];
					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "name";
							};
							var getFullPath = function() {
								return "/full/path/dummy.view.xml";
							};
							return {
								getType : getType,
								getName : getName,
								getFullPath : getFullPath
							};
						}
					});
					return Q(files);
				};
				return Q(document);
			};

			// mock getFileResourcesInfo method - controller.js file
			parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
				return Q([{
					name : "Component.js",
					path : "SD_SO_MON/Component.js"
				},
				{
					name : "S2.controller.js",
					path : "SD_SO_MON/S2.controller.js"
				},
				{
					name : "S2.view.xml",
					path : "SD_SO_MON/S2.view.xml"
				},
				{
					name : "webappS2.controller.js",
					path : "SD_SO_MON/webapp/webappS2.controller.js"
				},
				{
					name : "testS2.controller.js",
					path : "SD_SO_MON/webapp/test/testS2.controller.js"
				},
				{
					name : "controllersS2.controller.js",
					path : "SD_SO_MON/webapp/controllers/controllersS2.controller.js"
				}]);
			};

			return parentProjectController.validateParentProject("SD_SO_MON", "abaprep", "GM6").then(function(result1) {
				expect(Object.keys(result1.model.extensibility.controllers).length).to.equal(3);

				// mock getFileResourcesInfo method - controller.js file
				parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
					return Q([{
						name : "Main.controller.js",
						path : "SD_SO_MON%2fMain.controller.js"
					}]);
				};

				return parentProjectController.validateParentProject("SD_SO_MON", "abaprep").then(function(result2) {
					expect(result2).to.exist;

					// mock getFileResourcesInfo method - view.xml file
					parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
						return Q([{
							name : "Main.view.xml",
							path : "SD_SO_MON%2fMain.view.xml"
						}]);
					};

					return parentProjectController.validateParentProject("/starter", "abaprep").then(function(result3) {
						expect(result3).to.exist;

						// mock getMetadataXmlPath method - with new metadata folder
						parentProjectController.context.service.bspparentproject.getMetadataXmlPath = function() {
							return Q("SD_SO_MON%2flocalService%2fmetadata.xml");
						};

						// mock getFileResourcesInfo method - view.xml file
						parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
							return Q([{
								name : "Main.view.xml",
								path : "SD_SO_MON%2fMain.view.xml"
							}]);
						};

						// mock getDocument method
						parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
							var document = {};
							document.getContent = function() {
								return Q("{\"routes\": [{\"path\": \"odata\"}]}");
							};
							document.getEntity = function() {
								var getType = function() {
									return "folder";
								};
								var getName = function() {
									return "Main.view.xml";
								};
								return {
									getType : getType,
									getName : getName
								};
							};
							document.getFolderContent = function() {
								var files = [];
								files.push({
									getEntity : function() {
										var getType = function() {
											return "file";
										};
										var getName = function() {
											return "name";
										};
										var getFullPath = function() {
											return "/full/path/dummy.view.xml";
										};
										return {
											getType : getType,
											getName : getName,
											getFullPath : getFullPath
										};
									}
								});

								return Q(files);
							};
							return Q(document);
						};

						return parentProjectController.validateParentProject("/starter", "abaprep").then(function(result4) {
							expect(result4).to.exist;

							// mock the getFileResourcesInfo method
							parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
								return Q([{
									name : "Component.js",
									path : "SD_SO_MON/Component.js"
								},
								{
									name : "S2.controller.js",
									path : "SD_SO_MON/S2.controller.js"
								},
								{
									name : "S2.view.xml",
									path : "SD_SO_MON/S2.view.xml"
								}]);
							};

							// mock getDocument method
							parentProjectController.context.service.bspparentproject.getDocument = function() {
								var document = {};
								document.getContent = function() {
									return Q("jQuery.sap.declare(\"Starter2.Component\");jQuery.sap.require(\"sap.m.routing.RouteMatchedHandler\");sap.ui.core.UIComponent.extend(\"Starter2.Component\", {"
										+ "metadata : {\"name\" : \"Master Detail Sample\",\"version\" : \"1.0\",\"includes\" : [],\"dependencies\" : {\"libs\" : [\"sap.m\", \"sap.me\", \"sap.ushell\"],"
										+ "\"components\" : []},\"config\" : {\"resourceBundle\" : \"i18n/messageBundle.properties\",\"titleResource\" : \"SHELL_TITLE\",\"serviceConfig\" : {name: \"SRA018_SO_TRACKING_SRV\","
										+ "serviceUrl: \"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/\"}},routing: {config: {viewType : \"XML\",viewPath: \"Starter2.view\",targetAggregation: \"detailPages\",clearTarget: false},"
										+ "routes:[{pattern: \"\",name : \"master\",view : \"Master\",targetAggregation : \"masterPages\",preservePageInSplitContainer : true,targetControl: \"fioriContent\",subroutes : [{"
										+ "pattern : \"Detail/{contextPath}\",view : \"Detail\",name : \"Detail\"}]}]}},init : function() {sap.ui.core.UIComponent.prototype.init.apply(this, arguments);"
										+ "this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());this.getRouter().initialize();var oServiceConfig = this.getMetadata().getConfig()[\"serviceConfig\"];var sServiceUrl = oServiceConfig.serviceUrl;"
										+ "var rootPath = jQuery.sap.getModulePath(\"Starter2\");var sProxyOn = jQuery.sap.getUriParameters().get(\"proxyOn\");var bUseProxy = (\"true\" === sProxyOn);if (bUseProxy) {"
										+ "sServiceUrl = rootPath + \"/proxy\" + sServiceUrl;}var responderOn = jQuery.sap.getUriParameters().get(\"responderOn\");var bUseMockData = (\"true\" === responderOn);if (bUseMockData) {"
										+ "jQuery.sap.require(\"sap.ui.app.MockServer\");var oMockServer = new sap.ui.app.MockServer({rootUri: sServiceUrl});oMockServer.simulate(rootPath + \"/model/metadata.xml\", rootPath + \"/model/\");"
										+ "oMockServer.start();var msg = \"Running in demo mode with mock data.\";jQuery.sap.require(\"sap.m.MessageToast\");sap.m.MessageToast.show(msg, {duration: 4000});}var i18nModel = new sap.ui.model.resource.ResourceModel({"
										+ "bundleUrl : rootPath + \"/i18n/messageBundle.properties\"});this.setModel(i18nModel, \"i18n\");var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);this.setModel(m);var deviceModel = new sap.ui.model.json.JSONModel({"
										+ "isTouch : sap.ui.Device.support.touch,isNoTouch : !sap.ui.Device.support.touch,isPhone : jQuery.device.is.phone,isNoPhone : !jQuery.device.is.phone,listMode : (jQuery.device.is.phone) ? \"None\" : \"SingleSelectMaster\","
										+ "listItemType : (jQuery.device.is.phone) ? \"Active\" : \"Inactive\"});deviceModel.setDefaultBindingMode(\"OneWay\");this.setModel(deviceModel, \"device\");},createContent : function() {var oViewData = {component : this};"
										+ "return sap.ui.view({viewName : \"Starter2.view.App\",type : sap.ui.core.mvc.ViewType.XML,viewData : oViewData});}});");
								};
								document.getEntity = function() {
									var getType = function() {
										return "file";
									};
									var getName = function() {
										return "Component.js";
									};
									return {
										getType : getType,
										getName : getName
									};
								};
								document.getFolderContent = function() {
									var files = [];
									files.push({
										getEntity : function() {
											var getType = function() {
												return "file";
											};
											var getName = function() {
												return "name";
											};
											var getFullPath = function() {
												return "/full/path/dummy.view.xml";
											};
											return {
												getType : getType,
												getName : getName,
												getFullPath : getFullPath
											};
										}
									});

									return Q(files);
								};
								return Q(document);
							};

							// type "abaprep", with view and a controller
							return parentProjectController.validateParentProject("/starter", "abaprep").then(function(result5) {
								expect(result5).to.exist;
								expect(result5.isValid).to.be.true;

								// mock getDocument method
								parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
									var fileDocument = {};
									fileDocument.getEntity = function() {
										return {
											getType : function() {
												return "folder";
											},
											getName : function() {
												return "Main.view.xml";
											}
										};
									};
									fileDocument.getContent = function() {
										return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
									};
									fileDocument.getFolderContent = function() {
										var files = [];
										files.push({
											getEntity : function() {
												var getType = function() {
													return "file";
												};
												var getName = function() {
													return ".project.json";
												};
												var getFullPath = function() {
													return "/starter/.project.json";
												};
												return {
													getType : getType,
													getName : getName,
													getFullPath : getFullPath
												};
											}
										});

										files.push({
											getEntity : function() {
												var getType = function() {
													return "file";
												};
												var getName = function() {
													return "Component.js";
												};
												var getFullPath = function() {
													return "/starter/Component.js";
												};
												return {
													getType : getType,
													getName : getName,
													getFullPath : getFullPath
												};
											}
										});

										return Q(files);
									};
									return Q(fileDocument);
								};

								// mock getFileResourcesInfo method
								parentProjectController.context.service.workspaceparentproject.getFileResourcesInfo = function() {
									return Q([{
										name : "Component.js",
										path : "SD_SO_MON/Component.js"
									},
										{
											name : "S2.controller.js",
											path : "SD_SO_MON/S2.controller.js"
										},
										{
											name : "S2.view.xml",
											path : "SD_SO_MON/S2.view.xml"
										},
										{
											name : "webappS2.controller.js",
											path : "SD_SO_MON/webapp/webappS2.controller.js"
										},
										{
											name : "testS2.controller.js",
											path : "SD_SO_MON/webapp/test/testS2.controller.js"
										},
										{
											name : "controllersS2.controller.js",
											path : "SD_SO_MON/webapp/controllers/controllersS2.controller.js"
										}]);
								};

								return parentProjectController.validateParentProject("/starter", "Workspace").then(function(result6) {
									expect(result6).to.exist;
									expect(result6.isValid).to.be.true;

									// mock getFileResourcesInfo method
									parentProjectController.context.service.bspparentproject.getFileResourcesInfo = function() {
										return Q([{
											name : "Configuration.js",
											path : "SD_SO_MON/Configuration.js"
										}]);
									};

									// mock getDocument method
									parentProjectController.context.service.bspparentproject.getDocument = function() {
										var document = {};
										document.getContent = function() {
											return Q("jQuery.sap.declare(\"Starter2.Component\");jQuery.sap.require(\"sap.m.routing.RouteMatchedHandler\");sap.ui.core.UIComponent.extend(\"Starter2.Component\", {"
												+ "metadata : {\"name\" : \"Master Detail Sample\",\"version\" : \"1.0\",\"includes\" : [],\"dependencies\" : {\"libs\" : [\"sap.m\", \"sap.me\", \"sap.ushell\"],"
												+ "\"components\" : []},\"config\" : {\"resourceBundle\" : \"i18n/messageBundle.properties\",\"titleResource\" : \"SHELL_TITLE\",\"serviceConfig\" : {name: \"SRA018_SO_TRACKING_SRV\","
												+ "serviceUrl: \"/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/\"}},routing: {config: {viewType : \"XML\",viewPath: \"Starter2.view\",targetAggregation: \"detailPages\",clearTarget: false},"
												+ "routes:[{pattern: \"\",name : \"master\",view : \"Master\",targetAggregation : \"masterPages\",preservePageInSplitContainer : true,targetControl: \"fioriContent\",subroutes : [{"
												+ "pattern : \"Detail/{contextPath}\",view : \"Detail\",name : \"Detail\"}]}]}},init : function() {sap.ui.core.UIComponent.prototype.init.apply(this, arguments);"
												+ "this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter());this.getRouter().initialize();var oServiceConfig = this.getMetadata().getConfig()[\"serviceConfig\"];var sServiceUrl = oServiceConfig.serviceUrl;"
												+ "var rootPath = jQuery.sap.getModulePath(\"Starter2\");var sProxyOn = jQuery.sap.getUriParameters().get(\"proxyOn\");var bUseProxy = (\"true\" === sProxyOn);if (bUseProxy) {"
												+ "sServiceUrl = rootPath + \"/proxy\" + sServiceUrl;}var responderOn = jQuery.sap.getUriParameters().get(\"responderOn\");var bUseMockData = (\"true\" === responderOn);if (bUseMockData) {"
												+ "jQuery.sap.require(\"sap.ui.app.MockServer\");var oMockServer = new sap.ui.app.MockServer({rootUri: sServiceUrl});oMockServer.simulate(rootPath + \"/model/metadata.xml\", rootPath + \"/model/\");"
												+ "oMockServer.start();var msg = \"Running in demo mode with mock data.\";jQuery.sap.require(\"sap.m.MessageToast\");sap.m.MessageToast.show(msg, {duration: 4000});}var i18nModel = new sap.ui.model.resource.ResourceModel({"
												+ "bundleUrl : rootPath + \"/i18n/messageBundle.properties\"});this.setModel(i18nModel, \"i18n\");var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);this.setModel(m);var deviceModel = new sap.ui.model.json.JSONModel({"
												+ "isTouch : sap.ui.Device.support.touch,isNoTouch : !sap.ui.Device.support.touch,isPhone : jQuery.device.is.phone,isNoPhone : !jQuery.device.is.phone,listMode : (jQuery.device.is.phone) ? \"None\" : \"SingleSelectMaster\","
												+ "listItemType : (jQuery.device.is.phone) ? \"Active\" : \"Inactive\"});deviceModel.setDefaultBindingMode(\"OneWay\");this.setModel(deviceModel, \"device\");},createContent : function() {var oViewData = {component : this};"
												+ "return sap.ui.view({viewName : \"Starter2.view.App\",type : sap.ui.core.mvc.ViewType.XML,viewData : oViewData});}});");
										};
										document.getEntity = function() {
											var getType = function() {
												return "file";
											};
											var getName = function() {
												return "Configuration.js";
											};
											return {
												getType : getType,
												getName : getName
											};
										};
										document.getFolderContent = function() {
											var files = [];
											files.push({
												getEntity : function() {
													var getType = function() {
														return "file";
													};
													var getName = function() {
														return "Configuration.js";
													};
													var getFullPath = function() {
														return "/full/path/dummy.view.xml";
													};
													return {
														getType : getType,
														getName : getName,
														getFullPath : getFullPath
													};
												}
											});

											return Q(files);
										};
										return Q(document);
									};
								});

								// mock getFileResourcesInfo method
								parentProjectController.context.service.workspaceparentproject.getFileResourcesInfo = function() {
									return Q([{
										name : "Component.js",
										path : "SD_SO_MON/Component.js"
									}]);
								};

								// mock getDocument method
								parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
									var fileDocument = {};
									fileDocument.getEntity = function() {
										return {
											getType : function() {
												return "folder";
											},
											getName : function() {
												return "Main.view.xml";
											}
										};
									};
									fileDocument.getContent = function() {
										return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
									};
									fileDocument.getFolderContent = function() {
										var files = [];
										files.push({
											getEntity : function() {
												var getType = function() {
													return "file";
												};
												var getName = function() {
													return "Configuration.js";
												};
												var getFullPath = function() {
													return "/starter/Configuration.js";
												};
												return {
													getType : getType,
													getName : getName,
													getFullPath : getFullPath
												};
											}
										});

										files.push({
											getEntity : function() {
												var getType = function() {
													return "file";
												};
												var getName = function() {
													return "Configuration.js";
												};
												var getFullPath = function() {
													return "/starter/Configuration.js";
												};
												return {
													getType : getType,
													getName : getName,
													getFullPath : getFullPath
												};
											}
										});

										return Q(files);
									};
									return Q(fileDocument);
								};

								// with no .project.json file
								return parentProjectController.validateParentProject("/starter", "Workspace").then(function(result7) {
									expect(result7).to.exist;
									expect(result7.isValid).to.be.false;
								});
							});
						});
					});
				});
			});
		});

		it("Tests validateParentProject method with subfolder", function() {
			// mock getFileResourcesInfo method
			parentProjectController.context.service.workspaceparentproject.getFileResourcesInfo = function() {
				return Q([{
					name : "Component.js",
					path : "starter/Component.js"
				}]);
			};

			// mock getDocument method
			parentProjectController.context.service.filesystem.documentProvider.getDocument = function() {
				var fileDocument = {};
				fileDocument.getEntity = function() {
					return {
						getType : function() {
							return "folder";
						},
						getName : function() {
							return "Main.view.xml";
						}
					};
				};
				fileDocument.getContent = function() {
					return Q("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><core:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\"><Page id=\"S1_page\" title=\"LR_TITLE_HOME_VIEW\"><Button id=\"actionButton\" press=\"openActionSheet\"></Button></Page></core:View>");
				};
				fileDocument.getFolderContent = function() {
					var files = [];
					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "Configuration.js";
							};
							var getFullPath = function() {
								return "/starter/Configuration.js";
							};
							return {
								getType : getType,
								getName : getName,
								getFullPath : getFullPath
							};
						}
					});

					files.push({
						getEntity : function() {
							var getType = function() {
								return "file";
							};
							var getName = function() {
								return "Configuration.js";
							};
							var getFullPath = function() {
								return "/starter/Configuration.js";
							};
							return {
								getType : getType,
								getName : getName,
								getFullPath : getFullPath
							};
						}
					});

					return Q(files);
				};
				return Q(fileDocument);
			};

			//Mock the i18n to be sure that this is the relevant error
			var i18nErrorMessageWithSubfolder = "batata from India";
			parentProjectController.context.i18n = parentProjectController.context.i18n ? parentProjectController.context.i18n : {};
			parentProjectController.context.i18n.getText = function(sPath, sMessageKey) {
				expect(sPath).to.equal("i18n");
				expect(sMessageKey).to.equal("ParentProjectSRV_SelectSubFolderWorkspaceError");
				//return some value so we make sure that this mock method gets called at all!
				return i18nErrorMessageWithSubfolder;
			};

			return parentProjectController.validateParentProject("/starter/batata", "Workspace").then(function(result) {
				expect(result).to.exist;
				expect(result.isValid).to.be.false;
				expect(result.message).to.equal(i18nErrorMessageWithSubfolder);
			});
		});

		it("Tests getControllerInfo method", function() {

			function getParentProjectFor_getControllerInfo(selectedController, entityType, entityName) {

				parentProjectController.context.service.workspaceparentproject.getDocument = function() {
					var fileDocument = {};
					fileDocument.getEntity = function() {
						return {
							getType : function() {
								return entityType;
							},
							getName : function() {
								return entityName;
							}
						};
					};
					fileDocument.getContent = function() {
						return Q("sap.ui.controller(\"Starter2.view.App\", {});");
					};

					return Q(fileDocument);
				};

				selectedController.name = "App";
				selectedController.id = "Starter2.view.App";
				selectedController.parentNamespace = "Starter2";
				selectedController.path = "/Starter2/view/App.controller.js";
				selectedController.resourceLocationPath = "/view/";

				return parentProjectController;
			};

			var selectedController = {};
			parentProjectController = getParentProjectFor_getControllerInfo(selectedController, "file", "App.controller.js");

			return parentProjectController.getControllerInfo(selectedController, "Workspace").then(function(result1) {
				expect(result1).to.exist;

				// "App.controller.xml" - suffix different than the default controller suffix
				parentProjectController = getParentProjectFor_getControllerInfo(selectedController, "file", "App.controller.xml");

				// parameters: selectedController, type, systemId
				return parentProjectController.getControllerInfo(selectedController, "Workspace").then(function(result2) {
					expect(result2).to.exist;

					// "App.controller.xml" - suffix different than the default controller suffix
					parentProjectController = getParentProjectFor_getControllerInfo(selectedController, "folder", "App.controller.xml");

					return parentProjectController.getControllerInfo(selectedController, "Workspace").then(function(result3) {
						expect(result3).to.exist;

						// "App.controller.xml" - suffix different than the default controller suffix
						parentProjectController = getParentProjectFor_getControllerInfo(selectedController, "file", "App.controller.js");

						return parentProjectController.getControllerInfo(selectedController, "Workspace").then(function(result4) {
							// Test that we got a hook property - an empty array
							expect(result4.hooks.length).to.equal(0);
						});
					});
				});
			});
		});

		it("Tests import method", function() {

			parentProjectController.context.service.bspparentproject.getDocument = function() {
				return Q({});
			};

			parentProjectController.context.service.bspparentproject.import = function() {
				return Q({});
			};

			var applicationName = "myApp";
			var system = {};
			var destinationDocument = {};
			var type = "abaprep";

			return parentProjectController.import(applicationName, system, destinationDocument, type).then(function(result1) {
				expect(result1).to.exist;

				type = "hcp";

				return parentProjectController.import(applicationName, system, destinationDocument, type).then(function(result2) {
					expect(result2).to.exist;
				});
			});
		});

		it("Tests getModelFolderFiles method", function() {

			var metadataPath = "/model";
			var system = {};
			var type = "abaprep";

			return parentProjectController.getModelFolderFiles(metadataPath, system, type).then(function(result1) {
				expect(result1).to.exist;

				type = "hcp";

				return parentProjectController.getModelFolderFiles(metadataPath, system, type).then(function(result2) {
					expect(result2).to.exist;
				});
			});
		});
	});
});
