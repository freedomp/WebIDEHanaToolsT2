define(['STF'], function (STF) {

	"use strict";

	var suiteName = "abaprepository_SelectDeployABAPSystemStep";
	var iFrameWindow;
	var oContext;
	var reachedToFailure = false;

	describe("Tests for SelectDeployABAPSystemStep", function () {
		var selectDeployABAPSystemStep;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;

				oContext = buildMockContext();

				iFrameWindow.jQuery.sap.require("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep");
				selectDeployABAPSystemStep = new iFrameWindow.sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep({
					context: oContext
				});

				selectDeployABAPSystemStep.setContextForTesting(oContext);
			});
		});

		function buildMockContext() {
			var oMockContext = {};
			oMockContext.service = {};

			oMockContext.service.discovery = {};
			oMockContext.service.discovery.getStatus = function () {
				var oMockDiscoveryStatus = {};
				oMockDiscoveryStatus.csrfToken = "dummyCsrfToken";
				oMockDiscoveryStatus.filestore_ui5_bsp = "dummyFilestoreUrl";
				return Q(oMockDiscoveryStatus);
			};

			oMockContext.service.abaprepository = {};
			oMockContext.service.abaprepository.getApplications = function () {
				var aApplications = [{"name": "dummyApp"}];
				return Q(aApplications);
			};

			oMockContext.i18n = {};
			oMockContext.i18n.getText = function() {
				return "Dummy Text";
			};

			mockGetAtoSettingsMethod(oMockContext, "C", true);

			return oMockContext;
		}

		function expectCorrectWizardAndModel() {
			var oWizard = selectDeployABAPSystemStep.getWizardControl();
			expect(oWizard).to.exist;

			var oWizardModel = oWizard.getModel();
			expect(oWizardModel).to.exist;

			return oWizardModel;
		}

		function mockGetAtoSettingsMethod(oInputContext, sOperationsType, bIsExtensibilityDevSystem) {
			oInputContext.service.abaprepository.getAtoSettings = function() {
				var oSettings = {};
				oSettings.operationsType = sOperationsType;
				oSettings.isExtensibilityDevSystem = bIsExtensibilityDevSystem;
				oSettings.prefixName = "dummyPrefix";
				oSettings.packageName = "dummyPackage";
				return Q(oSettings);
			};
		}

		it("Tests handleSelectedSystem method", function () {
			var oMockWizard = {};

			var oMockModel = new sap.ui.model.json.JSONModel();
			oMockModel.setData({});
			oMockModel.destination = {};
			oMockWizard.model = oMockModel;

			oMockWizard.getModel = function() {
				return oMockWizard.model;
			};

			oMockWizard.setModel = function(oModel) {
				oMockWizard.model = oModel;
			};

			selectDeployABAPSystemStep.setWizardControl(oMockWizard);

			return selectDeployABAPSystemStep.handleSelectedSystem().then(function() {
				var oWizardModel = expectCorrectWizardAndModel();

				expect(oWizardModel.discoveryStatus.filestore_ui5_bsp).to.equal("dummyFilestoreUrl");
				expect(oWizardModel.csrf).to.equal("dummyCsrfToken");
				expect(oWizardModel.applications.length).to.equal(1);
				expect(oWizardModel.applications[0].name).to.equal("dummyApp");
			});
		});


		function createMockContextToFailS4Hana() {
			var newContext = oContext;
			newContext.service.abaprepository.getAtoSettings = function() {
				var oError = {};
				oError.errorMsg = "dummyMessage";
				return Q.reject(oError);
			};
			newContext.service.discovery.getStatus = function () {
				var oMockDiscoveryStatus = {};
				oMockDiscoveryStatus.csrfToken = "dummyCsrfToken";
				oMockDiscoveryStatus.filestore_ui5_bsp = "dummyFilestoreUrl";
				oMockDiscoveryStatus.ato_settings = "dummyAtoSettings";
				return Q(oMockDiscoveryStatus);
			};
			newContext.service.log = {};
			newContext.service.log.error = function(sTag, sMessage, aTargets){
				reachedToFailure = true;
				return Q();
			};
			return newContext;
		}

		it("Tests handleSelectedSystem method - when choose a system without ato settings", function () {
			var oMockWizard = {};

			var oMockModel = new sap.ui.model.json.JSONModel();
			oMockModel.setData({});
			oMockModel.destination = {};
			oMockWizard.model = oMockModel;

			oMockWizard.getModel = function() {
				return oMockWizard.model;
			};

			selectDeployABAPSystemStep.setWizardControl(oMockWizard);

			selectDeployABAPSystemStep.setContextForTesting(createMockContextToFailS4Hana());

			return selectDeployABAPSystemStep.handleSelectedSystem().then(function() {
				expect(reachedToFailure).to.equal(true);
			});
		});

		it("Tests handleS4Hana method", function () {

			selectDeployABAPSystemStep.setContextForTesting(buildMockContext());

			var oMockModel = new sap.ui.model.json.JSONModel();
			oMockModel.setData({});

			// positive flow 1 - ato settings exist, cloud extensibility system, package and prefix exist
			return selectDeployABAPSystemStep.handleS4Hana(oMockModel).then(function() {

				expectCorrectWizardAndModel();

				// mock the getAtoSettings method - not a cloud system
				mockGetAtoSettingsMethod(oContext, "Not C", true);

				// positive flow 2 - not a cloud system
				return selectDeployABAPSystemStep.handleS4Hana(oMockModel).then(function() {

					expectCorrectWizardAndModel();

					// mock the getAtoSettings method - a cloud system but not extensibility system
					mockGetAtoSettingsMethod(oContext, "C", false);

					// negative flow 2 - cloud system but not extensibility system
					return selectDeployABAPSystemStep.handleS4Hana(oMockModel).then(function() {
						expectCorrectWizardAndModel();
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
