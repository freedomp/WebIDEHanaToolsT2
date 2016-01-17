define(['STF',
		"sap/watt/core/q", 
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/replaceservicecomponent/ReplaceServiceComponent"],
	function (STF, coreQ, replaceServiceComponent) {

		"use strict";

		var oContext = null;
		var oModel;
		var aDataSources = [];
		var FAKE_I18N_TEXT = "fakeI18nText";
		var S_DATA_SOURCE_NAME = "myDataSource";
		var S_URI = "/sap/opu/odata/sap/CB_PRODUCTION_ORDER_SRV/";
		var S_METADATA_FOLDER = "localService";		
		var bIsScaffolding;
		var bCalledAddWithScaffolding;
		var bCalledAddWithoutScaffolding;
		var oAddDataSourceContent;
		var sDataSourceName;
		var sUri;
		var sLocalUri;
		var bIsDefault;
		var bOverwrite;

		var prepareContext = function() {
			oContext = {};
			oContext.service = {};
			oContext.service.ui5projecthandler = {};
			oContext.service.ui5projecthandler.getDataSourcesByType = function () {
				return coreQ(aDataSources);
			};
			oContext.service.ui5projecthandler.isScaffoldingBased = function () {
				return coreQ(bIsScaffolding);
			};
			oContext.service.ui5projecthandler.addExtensionForScaffoldingDataSource = function (oDocument, _sDataSourceName, _sUri, _sLocalUri, _bIsDefault, _bOverwrite) {
				bCalledAddWithScaffolding = true;
				sDataSourceName = _sDataSourceName;
				sUri = _sUri;
				sLocalUri = _sLocalUri;
				bIsDefault = _bIsDefault;
				bOverwrite = _bOverwrite;
				return coreQ();
			};
			oContext.service.ui5projecthandler.addDataSource = function (oDocument, _sDataSourceName, _oContent, _bOverwrite) {
				bCalledAddWithoutScaffolding = true;
				sDataSourceName = _sDataSourceName;
				bOverwrite = _bOverwrite;				
				oAddDataSourceContent = _oContent;
				return coreQ();
			};			
			oContext.service.log = {};
			oContext.service.log.error = function () {
				return coreQ();
			};
			oContext.service.filesystem = {};
			oContext.service.filesystem.documentProvider = {};
			oContext.service.filesystem.documentProvider.getDocument = function() {
				return coreQ();
			};
			oContext.service.metadataHandler = {};
			oContext.service.metadataHandler.updateMetadataXml = function() {
				return coreQ();
			};
			oContext.service.metadataHandler.getMetadataPath = function() {
				return coreQ(S_METADATA_FOLDER);
			};
			oContext.service.mockpreview = {};
			oContext.service.mockpreview.updateSettings = function() {
				return coreQ();
			};
			oContext.i18n = {};
			oContext.i18n.getText = function() {
				return FAKE_I18N_TEXT;
			};
		};

		describe("Replace Service Extension", function () {
			before(function () {
				prepareContext();
			});

			function injectContextToReplaceServiceComponent() {
				replaceServiceComponent.context = oContext;
				// Call onAfterGenerate in order to init the context. We don't care about exceptions
				try {
				    replaceServiceComponent.onAfterGenerate();
				} catch(err) {
					// Nothing to do 
				}				
			}

			beforeEach(function () {
				aDataSources = [];
				oModel = {};
				bCalledAddWithScaffolding = false;
				bCalledAddWithoutScaffolding = false;
				sDataSourceName = "";
				sUri = "";
				sLocalUri = "";
				bIsDefault = false;
				bOverwrite = false;
				oAddDataSourceContent = {};
				injectContextToReplaceServiceComponent();
			});			

			it("Gets parent service name", function () {
				aDataSources[S_DATA_SOURCE_NAME] = {};
				return replaceServiceComponent._getParentServiceName(null, oModel).then(function (sDataSourceName) {
					expect(oModel.fiori.replaceservice.serviceName).to.equal(S_DATA_SOURCE_NAME);
				});
			});
			
			it("Fails to get parent service name when there are no data sources", function (done) {
				replaceServiceComponent._getParentServiceName().fail(function (oErr) {
					expect(oErr.message).to.equal(FAKE_I18N_TEXT);
					done();
				});
			});
			
			it("Fails to get parent service name when the data source is false", function (done) {
				aDataSources = null;
				replaceServiceComponent._getParentServiceName().fail(function (oErr) {
					expect(oErr.message).to.equal(FAKE_I18N_TEXT);
					done();
				});
			});
			
			function setModelForAddDataSource() {
				oModel.fiori = {};
				oModel.fiori.replaceservice = {};
				oModel.fiori.replaceservice.serviceName = S_DATA_SOURCE_NAME;
				oModel.connectionData = {};
				oModel.connectionData.runtimeUrl = S_URI;
				oModel.fiori.replaceservice.metadataFolder = S_METADATA_FOLDER;				
			}
			
			it("Adds data source with scaffolding", function() {
				setModelForAddDataSource();
				bIsScaffolding = true;
				return replaceServiceComponent._addDataSource(oModel).then(function () {
					expect(bCalledAddWithScaffolding).to.be.true;
					expect(sDataSourceName).to.equal(S_DATA_SOURCE_NAME);
					expect(sUri).to.equal(S_URI);
					expect(sLocalUri).to.equal("./" + S_METADATA_FOLDER + "/metadata.xml");
					expect(bIsDefault).to.be.true;
					expect(bOverwrite).to.be.true;
				});				
			});

			it("Adds data source without scaffolding", function() {
				setModelForAddDataSource();
				bIsScaffolding = false;
				return replaceServiceComponent._addDataSource(oModel).then(function () {
					expect(bCalledAddWithoutScaffolding).to.be.true;
					expect(sDataSourceName).to.equal(S_DATA_SOURCE_NAME);
					expect(bOverwrite).to.be.true;
					var oExpectedContent = {
						"uri": S_URI,
						"settings": {
							"localUri": "./" + S_METADATA_FOLDER + "/metadata.xml"
						}
					};
					expect(oAddDataSourceContent).to.deep.equal(oExpectedContent);
				});
			});

			it("Updates metadata and mock settings", function() {
				oModel.connectionData = {};
				return replaceServiceComponent._updateMetadataAndMockSettings(oModel).then(function () {
					expect(oModel.fiori.extensionCommon).to.deep.equal({});
					expect(oModel.fiori.replaceservice.metadataFolder).to.equal(S_METADATA_FOLDER);
				});
			});

			it("Creates empty serviceUrl when in replace-from-filesystem scenario", function() {
				setModelForAddDataSource();
				oModel.connectionData.runtimeUrl = undefined;
				return replaceServiceComponent._addDataSource(oModel).then(function () {
					expect(sUri).to.equal("");
				});
			});
		});
	});