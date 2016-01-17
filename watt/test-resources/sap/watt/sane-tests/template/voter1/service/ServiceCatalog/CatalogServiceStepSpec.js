define(["STF"] , function(STF) {

	"use strict";
	var suiteName = "CatalogStep_Integration", getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var oMockServer, oCatalogStep, oCatalogService, iFrameWindow, stepContent, catalogStepWizrd, oModel;

		var that = this;

		var _mDataConnectionEnum =  {
			ServiceCatalog: 0,
			RepositoryBrowser: 1,
			FileSystem: 2,
			PasteURL: 3
		};

		var oData1 =  {
			iDataConnectionSelected: _mDataConnectionEnum.ServiceCatalog,
			mSelectionEnum: _mDataConnectionEnum,
			sServiceName: "",
			bSelect: false,
			bVisibleDetails: false,
			bPasteUrlTextFieldEditable: false,
			sPasteUrlTextFieldValue: "",
			sPasteURLComboBoxValue: "",
			sFileUploaderText: "",
			bAppKeyTextFieldVisible: false,
			sAppKeyTextFieldValue: "",
			//sServiceURLIndent: "L9 M9 S9",
			bFullURL: true,
			bApimgmt: false
		};

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/config.json"})
				.then(function (oWindow) {
					iFrameWindow = oWindow;
					oCatalogStep = getService('catalogstep');
					oCatalogService = getService('servicecatalog');

					oModel = new iFrameWindow.sap.ui.model.json.JSONModel();
					oModel.setData({
						modelData: oData1
					});

					// prepare mock server
					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					oMockServer = new iFrameWindow.sap.ui.app.MockServer({
						rootUri: '/MetadataModel/'
					});
					oMockServer.simulate(fullPath(("metadata.xml")));
					oMockServer.start();
					if (!stepContent){
						return oCatalogStep.getContent().then(function(wizard) {
							catalogStepWizrd = wizard;
							stepContent = wizard.getStepContent();
							stepContent.getModel = function() {
								return oModel;
							};
						});
					}
					return Q();
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});


		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter1/service/ServiceCatalog/" +
				sFileName;
		}

		it("Catalog Step service - createDetailsContent" , function() {

			var title = 'Data Connection';
			assert.ok(catalogStepWizrd.getTitle() === title, "Failed to get catalog service title");
			var gridModel = stepContent._oGrid.getModel();
			assert.ok(oData1.iDataConnectionSelected === gridModel.getData().modelData.iDataConnectionSelected, "Catalog wizard step grid model were created");
			assert.ok(oData1.sServiceName === gridModel.getData().modelData.sServiceName, "Catalog wizard step grid model were created");
		});


		it("Catalog Step service - getContent", function() {
			oCatalogService.detachEvent("requestSent");
			oCatalogService.detachEvent("requestCompleted");
			oCatalogService.detachEvent("serviceSelectionCompleted");

			var oConnection =  {
				name : "/MetadataModel",
				url :  "/MetadataModel",
				type : "odata_abap",
				destination : {
					url: "/MetadataModel",
					wattUsage: "odata_abap"
				}
			};

			var sUrl = "/MetadataModel";

			oCatalogService.onCatalogServiceSelectionSuccess = function(oEvent){
				stepContent.getModel().setProperty("/connectionData", oEvent.params.connectionData);
			};

			oCatalogService.attachEvent("serviceSelectionCompleted", oCatalogService.onCatalogServiceSelectionSuccess, that);

			return oCatalogService.getServiceConnectionData(oConnection, sUrl).then(function() {
				return stepContent.createDetailsContent().then(function(){
					var serviceDetailsTree = iFrameWindow.sap.ui.getCore().byId("DataConnectionServiceDetailsTree");
					var detailsTree = serviceDetailsTree.getNodes().length;
					assert.ok(detailsTree === 1, "Details Content tree was created");
				});
			});
		});

		it("Catalog Step service - onMetadataFileUpload", function() {

			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter1/service/ServiceCatalog/metadata.xml"))).then(function (oMetadata) {
				var sMetadata = new XMLSerializer().serializeToString(oMetadata);
				return stepContent._onMetadataFileUpload(sMetadata).then(function(){
					var connectionData = stepContent.getModel().getProperty('/connectionData');
					assert.ok(connectionData.metadata.getSymbol(1).fullyQualifiedName === "CATALOGSERVICE", "Parse metadata from file succeeded");
					assert.ok(connectionData.metadataContent === sMetadata, "Parse metadata - connectionData metadataContent created successfully");
				});
			});
		});

	});
});
