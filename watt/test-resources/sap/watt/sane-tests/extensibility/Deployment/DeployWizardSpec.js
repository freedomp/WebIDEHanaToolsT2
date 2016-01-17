define(['STF',
	"sap/watt/core/q", "sane-tests/util/RepositoryBrowserUtil"], function (STF, coreQ, repositoryBrowserUtil) {

	"use strict";

	var suiteName = "abaprepository_DeployWizard";
	var iFrameWindow = null;
	var deployWizardUtil = null;
	var projectNameTM = "TM3";
	var deployedProjectNameTM = "DeployedTM3";

	var sZipTMPath = "../test-resources/sap/watt/sane-tests/extensibility/Deployment/TM3.zip";
	var sZipDeployedTMPath = "../test-resources/sap/watt/sane-tests/extensibility/Deployment/DeployedTM3.zip";

	describe('Deploy To ABAP Wizard module', function () {
		this.timeout(180000);
		before(function (done) {
			STF.startWebIde(suiteName, {config: "extensibility/config.json"}).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;

				// require the utility class from the context running in Web IDE
				STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/extensibility/Deployment/ABAPDeploymentUtil"]).spread(function (utilsInstance) {
					deployWizardUtil = utilsInstance;
					done();
				});
			});
		});

		/**
		 * sets fake services in abaprepository context
		 *
		 * @param {object} oABAPRepositoryContext - The abaprepository context
		 */
		var _preparationsForABAPrepositoryContext = function (oABAPRepositoryContext) {

			oABAPRepositoryContext.service.destination.getDestinations = function () {
				var destination = {
					description: "testDest!",
					entryPath: "/sap/bc/adt",
					name: "testDes",
					path: "/sap/bc/adt",
					proxyUrlPrefix: "/destinations/abap_backend",
					sapClient: "",
					systemId: "testDes",
					url: "/destinations/abap_backend/sap/bc/adt",
					wattUsage: "dev_abap"
				};

				var destination2 = {
					description: "testDest2!",
					entryPath: "/sap/bc/adt",
					name: "testDes2",
					path: "/sap/bc/adt",
					proxyUrlPrefix: "/destinations/abap_backend",
					sapClient: "",
					systemId: "testDes",
					url: "/destinations/abap_backend/sap/bc/adt",
					wattUsage: "dev_abap"
				};

				return Q([destination, destination2]);
			};

			oABAPRepositoryContext.service.discovery.getStatus = function () {
				var status = {
					ato_settings: "/destinations/UIA/sap/bc/adt/ato/settings",
					csrfToken: "W47GEkfEuqyep1TjxKwLvw==",
					description: "testDest!",
					filestore_ui5_bsp: "/destinations/UIA/sap/bc/adt/filestore/ui5-bsp/objects",
					proxyUrlPrefix: "/destinations/UIA",
					search: "/destinations/UIA/sap/bc/adt/repository/informationsystem/search",
					transportchecks: false,
					transports: "/destinations/UIA/sap/bc/adt/cts/transports"
				};

				return Q(status);
			};

			oABAPRepositoryContext.service.abaprepository.getApplications = function () {
				var app = {
					id: "%2fTEST40P%2fFGG",
					title: "/TEST40P/FGG",
					summary: "SAPUI5 Application"
				};

				return Q(app);
			};

			oABAPRepositoryContext.service.abaprepository.getAtoSettings = function () {
				var settings = {
					isExtensibilityDevSystem: "false",
					operationsType: "P",
					packageName: "",
					prefixName: ""
				};

				return Q(settings);
			};
		};

		/**
		 * imports an application and set the selection on it.
		 *
		 * @param {string} projectName - The application name
		 * @param {string} sZipPath - The application path
		 * @return {promise} aSelection - The selected application
		 */
		var _importProjectAndSetSelection = function (sProjectName, sZipPath) {
			return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, sProjectName, iFrameWindow, sZipPath).then(function (oCreatedFolder) {
				var aSelection = [];
				aSelection[0] = {};
				aSelection[0].document = oCreatedFolder;
				return Q(aSelection);
			});
		};

		/**
		 * Opens the Development perspective
		 */
		var _openDevelopmentPerspective = function () {
			var oPerspectiveService = STF.getService(suiteName, "perspective");
			return oPerspectiveService.renderPerspective("development");
		};

		// ################## Start - Wizard Persistence Tests ##################
		it("First deploy - test initialization of deploy to abap wizard", function () {
			var oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
			var oABAPRepositoryContext = oABAPRepositoryService.context;
			_preparationsForABAPrepositoryContext(oABAPRepositoryContext);
			return _openDevelopmentPerspective().then(function () {
				return _importProjectAndSetSelection(projectNameTM, sZipTMPath).then(function (selection) {
					return deployWizardUtil.checkFirstPersistencyInABAPDeploymentWizard(oABAPRepositoryContext, selection).then(function (res) {
						assert.equal(res.action, "CreateKey");
						assert.equal(res.name, "testDes");
						assert.equal(res.appName, "myAppTest");
					});
				});
			});
		});

		it("Second deploy - test initialization of deploy to abap wizard + check with two system and same systemId", function () {
			var oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
			var oABAPRepositoryContext = oABAPRepositoryService.context;
			_preparationsForABAPrepositoryContext(oABAPRepositoryContext);
			//need other getApplications method, include the application that already deployed
			oABAPRepositoryContext.service.abaprepository.getApplications = function () {
				var app = {
					id: "%2fTEST40P%2fFGG",
					title: "/TEST40P/FGG",
					summary: "SAPUI5 Application"
				};
				var app2 = {
					id: "%2fTEST40P%2fFGF",
					title: "myAppTest",
					summary: "testDes"
				};

				return Q([app, app2]);
			};
			
			return _openDevelopmentPerspective().then(function () {
				return _importProjectAndSetSelection(deployedProjectNameTM, sZipDeployedTMPath).then(function (selection) {
					return deployWizardUtil.checkSecondPersistencyInABAPDeploymentWizard(oABAPRepositoryContext, selection).then(function (res) {
						assert.equal(res.action, "UpdateKey");
						assert.equal(res.name, "testDes");
						assert.equal(res.appName, "myAppTest");
					});
				});
			});
		});

		it("Second deploy - test invalid scenario - last system cannot be found", function () {
			var oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
			var oABAPRepositoryContext = oABAPRepositoryService.context;
			_preparationsForABAPrepositoryContext(oABAPRepositoryContext);
			//need other destinations - in order to not find the last system
			oABAPRepositoryContext.service.destination.getDestinations = function () {
				var destination = {
					description: "testDest!",
					entryPath: "/sap/bc/adt",
					name: "testDesNotExist",
					path: "/sap/bc/adt",
					proxyUrlPrefix: "/destinations/abap_backend",
					sapClient: "",
					systemId: "testDesNotExist",
					url: "/destinations/abap_backend/sap/bc/adt",
					wattUsage: "dev_abap"
				};

				var destination2 = {
					description: "testDest2!",
					entryPath: "/sap/bc/adt",
					name: "testDes2NotExist",
					path: "/sap/bc/adt",
					proxyUrlPrefix: "/destinations/abap_backend",
					sapClient: "",
					systemId: "testDes2NotExist",
					url: "/destinations/abap_backend/sap/bc/adt",
					wattUsage: "dev_abap"
				};

				return Q([destination, destination2]);
			};

			return _openDevelopmentPerspective().then(function () {
				return _importProjectAndSetSelection(deployedProjectNameTM, sZipDeployedTMPath).then(function (selection) {
					return deployWizardUtil.checkSecondPersistencySystemNotFound(oABAPRepositoryContext, selection).then(function (res) {
						assert.equal(res.action, "CreateKey");
						assert.equal(res.destinationInModel, undefined);
						assert.equal(res.comboBoxValue, "");
						assert.equal(res.isValidBeforeSelection, undefined);    //before choose a system we don't mark the validation
						assert.equal(res.isValidAfterSelection, true);    //after choose a system - the step is valid
					});
				});
			});
		});

		it("Second deploy - test invalid scenario - application not found", function () {
			var oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
			var oABAPRepositoryContext = oABAPRepositoryService.context;
			_preparationsForABAPrepositoryContext(oABAPRepositoryContext);
			//need other destinations - in order to not find the last system
			oABAPRepositoryContext.service.abaprepository.getApplications = function () {
				var app = {
					id: "%2fTEST40P%2fFGG",
					title: "/TEST40P/FGG",
					summary: "SAPUI5 Application"
				};
				var app2 = {
					id: "%2fTEST40P%2fFGF",
					title: "myAppTestNotFound",
					summary: "testDes"
				};

				return Q([app, app2]);
			};
			
			return _openDevelopmentPerspective().then(function () {
				return _importProjectAndSetSelection(deployedProjectNameTM, sZipDeployedTMPath).then(function (selection) {
					return deployWizardUtil.checkSecondPersistencySystemNoDApplicationFound(oABAPRepositoryContext, selection).then(function (res) {
						assert.equal(res.nextEnabledWithNoApplication, false);
						assert.equal(res.searchFieldValueBeforeChoose, "");
						assert.equal(res.searchFieldValueAfterChoose, "myAppTestNotFound");
						assert.equal(res.nextEnabledWithApplication, true);    //before choose a system we don't mark the validation
						assert.equal(res.isValidAfterSelection, true);    //after choose a system - the step is valid
					});
				});
			});
		});
		// ################## End - Wizard Persistence Tests ##################
		
		/*
		 * Verifies customer incident: https://support.wdf.sap.corp/sap/support/message/012005041000000327212015
		 * getting an error of "Unable to load destinations" when opening the wizard
		 */
		it("Opens wizard with only one destination configured", function () {
			var oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
			var oABAPRepositoryContext = oABAPRepositoryService.context;
			_preparationsForABAPrepositoryContext(oABAPRepositoryContext);

			// override the getDestinations method to return only one destination
			oABAPRepositoryContext.service.destination.getDestinations = function () {
				var destination = {
					description: "OnlyOneDestination",
					entryPath: "/sap/bc/adt",
					name: "OnlyOne",
					path: "/sap/bc/adt",
					proxyUrlPrefix: "/destinations/abap_backend",
					sapClient: "",
					systemId: "OnlyOne",
					url: "/destinations/abap_backend/sap/bc/adt",
					wattUsage: "dev_abap"
				};

				return Q([destination]);
			};

			return _openDevelopmentPerspective().then(function () {
				return _importProjectAndSetSelection(projectNameTM, sZipTMPath).then(function (selection) {
					return deployWizardUtil.openDeploymentWizardWithOneDestination(oABAPRepositoryContext, selection).then(function (res) {
						assert.equal(res.action, "CreateKey");
						assert.equal(res.selectedDestinationText, "OnlyOneDestination");
						assert.equal(res.destinationName, "OnlyOne");
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
	
	describe("Unit tests for Deploy To ABAP wizard internal functions", function () {
		var SELECTED_PACKAGE = "myPackage";
		var deployWizard;
		var actualSelectedPackage;
		
		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/ui/wizard/DeployWizard").then(function(_deployWizard) {
				deployWizard = _deployWizard;
			});
		});
		
		function prepareSelectedPackageTest() {
			var oModel = {};
			oModel.transportAction = "new";
			oModel.getData = function() {
				return {selectedPackage: SELECTED_PACKAGE};
			};
			var oApplication = {};
			oApplication.name = "myName";
			
			var oContext = {};
			oContext.service = {};
			oContext.service.transport = {};
			oContext.service.transport.createTransport = function(packageName) {
				actualSelectedPackage = packageName;
			};
			return [oModel, oApplication, oContext];
		}
		
		it("Create application with the selected package for the transport", function () {
			// Validate that we get the selected package in new transport - bug #1580035567
			
			var preparations = prepareSelectedPackageTest();
			var oModel = preparations[0];
			var oApplication = preparations[1];
			var oContext = preparations[2];

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				try {
					// We call createApplication just to see that it calls createTransport with the proper package name. We don't care that it later fails
					deployWizard._createApplication(oApplication, oModel);
				}
				catch(err) {
					expect(actualSelectedPackage).to.equal(SELECTED_PACKAGE);
				}
			}
		});
		
		it("Update application with the selected package for the transport", function () {
			// Validate that we get the selected package in new transport - bug #1580035567
			
			var preparations = prepareSelectedPackageTest();
			var oModel = preparations[0];
			var oApplication = preparations[1];
			var oContext = preparations[2];

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				try {
					// We call createApplication just to see that it sets the package in the application,
					// and calls createTransport with the proper package name. We don't care that it later fails
					deployWizard._updateApplication(oApplication, oModel);
				}
				catch(err) {
					expect(oApplication.package).to.equal(SELECTED_PACKAGE);
					expect(actualSelectedPackage).to.equal(SELECTED_PACKAGE);
				}
			}
		});
		
		function getContextForDoDeploy(bWithBuild) {
			var oContext = {};
			oContext.service = {};
			oContext.service.ui5projecthandler = {};
			oContext.service.ui5projecthandler.isManifestProjectGuidelinesType = function() {
				return Q(false);
			};
			oContext.service.builder = {};
			oContext.service.builder.isBuildSupported = function() {
				return Q(bWithBuild);
			};
			oContext.service.builder.build = function() {
				return Q();
			};
			oContext.service.builder.getTargetFolder = function() {
				var oTargetFolder = {isBuildFolder: true};
				return Q(oTargetFolder);
			};
			return oContext;
		}
		
		it("Do the deploy - using the build folder document", function () {
			var oProjectDocument = {isBuildFolder: false};
			var oContext = getContextForDoDeploy(true);
			
			deployWizard._getApplication = function(oRootDocument) {
				expect(oRootDocument.isBuildFolder).to.be.true;
				return Q();
			};
			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				// Call doDeploy in order to have _getApplication being called with the correct document
				return deployWizard._doDeploy(oProjectDocument, {});
			}			
		});
		
		it("Do the deploy - using the project document", function () {
			var oProjectDocument = {isBuildFolder: false};
			var oContext = getContextForDoDeploy(false);
			
			deployWizard._getApplication = function(oRootDocument) {
				expect(oRootDocument.isBuildFolder).to.be.false;
				return Q();
			};
			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				// Call doDeploy in order to have _getApplication being called with the correct document
				return deployWizard._doDeploy(oProjectDocument, {});
			}			
		});		
		
		afterEach(function () {
			deployWizard = undefined;
		});		
	});

	describe("Unit tests for deployment and writing the uri to manifest",function() {
		var deployWizard;
		
		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/ui/wizard/DeployWizard").then(function(_deployWizard) {
				deployWizard = _deployWizard;
			});
		});

		function getContextForNamespaceTests(sNamespace, sDest1Id) {
			var oContext = {};
			oContext.service = {};
			oContext.service.destination = {};
			oContext.service.destination.getDestinations = function(){
				var dest1 = {"systemId":sDest1Id, "path":"/sap/bc/ui5_ui5"};
				var dest2 =	{"systemId":"UIA", "path":"/sap/bc/ui5_ui5"};
				return Q([dest1,dest2]);
			};
			oContext.service.abaprepository = {};
			oContext.service.abaprepository.getAppNamespace = function() {
				return Q(sNamespace);
			};
			
			return oContext;
		}
		
		function getModelForNamespaceTests(sModelName) {
			var oModel = {};
			oModel.name = sModelName;
			oModel.getProperty = function() {
				return oModel.name;
			};
			oModel.destination = {
				"systemId":"GM6",
				"path":"/sap/bc/ui5_ui5"
			};
			return oModel;
		}

		it("With webapp without namespace", function() {
			var oModel = getModelForNamespaceTests("TM3");

			var pathToManifestJson = "TM3/webapp";

			var oContext = getContextForNamespaceTests("sap", "GM6");

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				return deployWizard._buildURI(oModel, pathToManifestJson).then(function(URI){
					expect(URI).to.equal("/sap/bc/ui5_ui5/sap/tm3/webapp");
				});
			}
		});

		it("With webapp with namespace", function() {
			var oModel = getModelForNamespaceTests("/namespace/TM3");

			var pathToManifestJson = "TM3/webapp";

			var oContext = getContextForNamespaceTests("", "GM6");

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				return deployWizard._buildURI(oModel, pathToManifestJson).then(function(URI){
					expect(URI).to.equal("/sap/bc/ui5_ui5/namespace/tm3/webapp");
				});
			}
		});

		it("Flat project with namespace",function(){
			var oModel = getModelForNamespaceTests("/namespace/TM3");

			var pathToManifestJson = "TM3";

			var oContext = getContextForNamespaceTests("", "GM6");

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				return deployWizard._buildURI(oModel, pathToManifestJson).then(function (URI) {
					expect(URI).to.equal("/sap/bc/ui5_ui5/namespace/tm3");
				});
			}
		});

		it("Executing with destination not defined - use default sap/bc/ui5_ui5", function() {
			var oModel = getModelForNamespaceTests("/namespace/TM3");

			var pathToManifestJson = "TM3";

			var oContext = getContextForNamespaceTests("", "UXD");

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				return deployWizard._buildURI(oModel, pathToManifestJson).then(function(URI){
					expect(URI).to.equal("/sap/bc/ui5_ui5/namespace/tm3");
				});
			}
		});

		it("Manifest under webapp/a/b",function(){
			var oModel = getModelForNamespaceTests("/namespace/TM3");

			var pathToManifestJson = "TM3/webapp/a/b";

			var oContext = getContextForNamespaceTests("", "UXD");

			try {
				// We call openWizard since it initialize some stuff. We don't care that it fails
				deployWizard.openWizard(oContext, null);
			}
			catch(err) {
				return deployWizard._buildURI(oModel, pathToManifestJson).then(function(URI){
					expect(URI).to.equal("/sap/bc/ui5_ui5/namespace/tm3/webapp/a/b");
				});
			}
		});

		afterEach(function(){
			deployWizard = undefined;
		});
	});
});
