define(['STF', 'sap/watt/lib/lodash/lodash'], function (STF, _) {
	"use strict";

	var suiteName = "ConfigurationHandler_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {

		var oUI5ProjectHandler, oFakeFileDAO, oFileSystem;

		before(function () {
			return STF.startWebIde(suiteName).then(function() {
				oUI5ProjectHandler = getService('ui5projecthandler');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileSystem = getService('filesystem.documentProvider');
			}).then(createWorkspaceStructure);
		});

		var sComponentJsContent = "sap.ui.define([\
			\"sap/ui/core/UIComponent\",\
			\"sap/ui/Device\",\
			\"sasasasa/model/models\",\
			\"sasasasa/controller/ListSelector\",\
			\"sasasasa/controller/ErrorHandler\"\
					], function(UIComponent, Device, models, ListSelector, ErrorHandler) {\
					\"use strict\";\
						return UIComponent.extend(\"sasasasa.Component\", {\
						metadata: {\
							manifest: \"json\"\
						},\
						/**\
						 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.\
						 * In this method, the FLP and device models are set and the router is initialized.\
						 * @public\
						 * @override\
						 */\
						init: function() {\
							this.oListSelector = new ListSelector();\
							this._oErrorHandler = new ErrorHandler(this);\
						\
							// set the device model\
							this.setModel(models.createDeviceModel(), \"device\");\
							// set the FLP model\
							this.setModel(models.createFLPModel(), \"FLP\");\
						\
							// call the base component's init function and create the App view\
							UIComponent.prototype.init.apply(this, arguments);\
						\
							// create the views based on the url/hash\
							this.getRouter().initialize();\
						},\
						\
						/**\
						 * The component is destroyed by UI5 automatically.\
						 * In this method, the ListSelector and ErrorHandler are destroyed.\
						 * @public\
						 * @override\
						 */\
						destroy: function() {\
							this.oListSelector.destroy();\
							this._oErrorHandler.destroy();\
							// call the base component's destroy function\
							UIComponent.prototype.destroy.apply(this, arguments);\
						},\
						\
						/**\
						 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy\
						 * design mode class should be set, which influences the size appearance of some controls.\
						 * @public\
						 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set\
						 */\
						getContentDensityClass: function() {\
							if (this._sContentDensityClass === undefined) {\
								// check whether FLP has already set the content density class; do nothing in this case\
								if (jQuery(document.body).hasClass(\"sapUiSizeCozy\") || jQuery(document.body).hasClass(\"sapUiSizeCompact\")) {\
								this._sContentDensityClass = \"\";\
							} else if (!Device.support.touch) { // apply \"compact\" mode if touch is not supported\
								this._sContentDensityClass = \"sapUiSizeCompact\";\
							} else {\
								// \"cozy\" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table\
								this._sContentDensityClass = \"sapUiSizeCozy\";\
							}\
						}\
						return this._sContentDensityClass;\
					}\
						\
				});\
						\
			});";

		var sConfigurationJsContent = "jQuery.sap.declare(\"sss.Configuration\");\
			jQuery.sap.require(\"sap.ca.scfld.md.ConfigurationBase\");\
			jQuery.sap.require(\"sap.ca.scfld.md.app.Application\");\
			sap.ca.scfld.md.ConfigurationBase.extend(\"sss.Configuration\", {\
			oServiceParams: {\
				serviceList: [{\
					name: \"\",\
				serviceUrl: \"\", //oData service relative path\
				isDefault: true,\
					mockedDataSource: jQuery.sap.getModulePath(\"sss\") + \"/model/metadata.xml\"\
					}]\
					},\
					getServiceParams: function() {\
					return this.oServiceParams;\
				},\
				getAppConfig: function() {\
					return this.oAppConfig;\
				},\
				/**\
				 * @inherit\
				 */\
				getServiceList: function() {\
					return this.oServiceParams.serviceList;\
				}\
			});";

		var sConfigurationContent = 'jQuery.sap.declare("saaap.Configuration");\
            jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");\
            jQuery.sap.require("sap.ca.scfld.md.app.Application");\
            sap.ca.scfld.md.ConfigurationBase.extend("s.Configuration", {\
                oServiceParams: {\
                    serviceList: [\
                        {\
                            name: "RMTSAMPLEFLIGHT",\
                            serviceUrl: "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
                            isDefault: true,\
                            mockedDataSource: jQuery.sap.getModulePath("s") + "/model/metadata.xml"\
                        }\
                    ]\
                },\
                getServiceParams: function () {\
                    return this.oServiceParams;\
                },\
                getAppConfig: function() {\
                    return this.oAppConfig;\
                },\
                getServiceList: function () {\
                    return this.oServiceParams.serviceList;\
                }\
            });';

		var sUI5128Configuration = 'sap.ui.define([\
							"sap/ca/scfld/md/ConfigurationBase"\
						], function(ConfigurationBase) {\
						"use strict";\
						return ConfigurationBase.extend("s.Configuration", {\
							oServiceParams: {\
								serviceList: [\
					                        {\
					                            name: "RMTSAMPLEFLIGHT",\
					                            serviceUrl: "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
					                            isDefault: true,\
					                            mockedDataSource: "./localService/metadata.xml"\
					                        }\
					                    ]\
							},\
							getServiceParams: function() {\
								return this.oServiceParams;\
							},\
							getAppConfig: function() {\
								return this.oAppConfig;\
							},\
							getServiceList: function() {\
								return this.oServiceParams.serviceList;\
							}\
						});\
					});';

		var sCorruptedConfiguration = 'jQuery.sap.decנכעlare("s.tttבכגדץ.Configuration");העכגעדגכ\
            jQuery.sap.require("sap.ca.scfld.md.Con\
            figurationBase");\
            jQuery.sap.require("sap.ca.scfld.md.app.Application");\
            sap.ca.scfld.md.Configuratio\
            nBase.extend("s.Configuration", {\
                oServiceParams: {\
                    service List: [\
                        {\
                            name: "RMTSAMPLEFLIGHT",\
                            serviceUrl: "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
                            isDefault: true,\
                            mockedDataSource: jQuery.sap.getModulePath("s") + "/model/metadata.xml"\
                        }\
                    ]\
                },\
                getServiceParams: function () {\
                    return this.oServiceParams;\
                },\
                getAppConfig: function() {\
                    return this.oAppConfig;\
                },\
                getServiceList: function () {\
                    return this.oServiceParams.serviceList;\
                }\
            });';

		var oNewDataSource = {
			"uri" : "/sap/opu/odata/snce/PO_S_SRV;v=2/",
			"type" : "OData",
			"settings" : {
				"odataVersion" : "2.0",
				"localUri" : "model/metadata.xml"
			}
		};

		var oExistingElementExtension = {
			"sExtensionType" : "sap.ui.viewModifications",
			"oContent" : {
				"list": {
					"visible": false
				}
			},
			"sViewName" : "hcm.approve.timesheet.view.S2"
		};

		var oNewElementExtension = {
			"sExtensionType" : "sap.ui.viewModifications",
			"oContent" : {
				"header": {
					"visible": false
				}
			},
			"sViewName" : "Main"
		};

		var createWorkspaceStructure = function() {
			return oFakeFileDAO.setContent({

				"proj9Configuration" : {
					"root" : {
						"Component.js" : sComponentJsContent,
						"Configuration.js" : sConfigurationContent
					}
				},
				"projUI5128Configuration" : {
					"root" : {
						"Component.js" : sComponentJsContent,
						"Configuration.js" : sUI5128Configuration
					}
				},
				"proj10Configuration" : {
					"root" : {
						"Component.js" : sComponentJsContent,
						"Configuration.js" : ""
					}
				},
				"proCorruptedConfiguration" : {
					"root" : {
						"Component.js" : sComponentJsContent,
						"Configuration.js" : sCorruptedConfiguration
					}
				},
				"projectWithConfiguration": {
					"src" : {
						"main" : {
							"webapp" : {
								"Component.js" : sComponentJsContent,
								"Configuration.js" : sConfigurationJsContent
							}
						}
					}
				},
				"emptyProject4": {
					"Component.js" : sComponentJsContent
				},
				"emptyProject5": {
					"Component.js" : sComponentJsContent
				},
				"emptyProject6": {
					"Component.js" : sComponentJsContent
				},
				"emptyProject8": {
					"Component.js" : sComponentJsContent
				}
			});
		};

		after(function () {
			return STF.shutdownWebIde(suiteName);
		});

		//########################### getAttribute test #####################################
		it("getAttribute", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDataSourcesByName test #####################################
		it("getDataSourcesByName", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDataSourceAnnotationsByName test #####################################
		it("getDataSourceAnnotationsByName", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getSourceTemplate test #####################################
		it("getSourceTemplate", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getSourceTemplate(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDependencies test #####################################
		it("getDependencies", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDependencies(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addDataSourceAnnotation test #####################################
		it("addDataSourceAnnotation", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(oTargetDocument, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addSourceTemplate test #####################################
		it("addSourceTemplate", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addSourceTemplate(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addDependencies test #####################################
		it("addDependencies", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### removeDataSource test #####################################
		it("removeDataSource", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### removeDataSourceAnnotation test #####################################
		it("removeDataSourceAnnotation", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addModel test #####################################
		it("addModel", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addModel(oTargetDocument, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getModels test #####################################
		it("getModels", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getModels(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addExtensionForScaffoldingDataSource test #####################################
		it("addExtensionForScaffoldingDataSource", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addExtensionForScaffoldingDataSource(oTargetDocument, null, null, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addConfig test #####################################
		it("addConfig", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addConfig(oTargetDocument, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getConfigs test #####################################
		it("getConfigs", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getConfigs(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addi18nExtensionModel test #####################################
		it("addi18nExtensionModel", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addi18nExtensionModel test #####################################
		it("addi18nExtensionModel", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addI18nPath test #####################################
		it("addI18nPath", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addI18nPath(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getI18nPath test #####################################
		it("getI18nPath", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getI18nPath(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getHandlerFilePath tests #####################################
		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/proj9Configuration/root", "Got right handler file path");
				});
			});
		});

		//########################### getHandlerDocument tests #####################################
		it("getHandlerDocument", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
					assert.equal(oHandlerDoc.getEntity().getFullPath(), "/proj9Configuration/root/Configuration.js", "Got right handler doc");
				});
			});
		});

		//########################### getDataSources tests #####################################
		it("getDataSources - multiple sources", function() {
			return oFileSystem.getDocument("/emptyProject4").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Configuration.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Configuration.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function (oDataSources) {
									assert.equal(_.keys(oDataSources)[0], "RMTSAMPLEFLIGHT", "Got right service name");
									assert.equal(_.values(oDataSources)[0].uri, "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/", "Got right service URL");
									assert.equal(_.values(oDataSources)[0].type, "OData", "Got right data source type");
									assert.equal(_.keys(oDataSources)[1], "CARTAPPROVAL_STANDARD", "Got right service name");
									assert.equal(_.values(oDataSources)[1].uri, "/sap/opu/odata/GBSRM/CARTAPPROVAL;v=2;o=", "Got right service URL");
									assert.equal(_.values(oDataSources)[1].type, "OData", "Got right data source type");
								});
							});
						});
					});
				});
			});
		});

		it("getDataSources - UI5 v1.28 Configuration", function() {
			return oFileSystem.getDocument("/projUI5128Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function (oDataSources) {
					assert.equal(_.keys(oDataSources)[0], "RMTSAMPLEFLIGHT", "Got right service name");
					assert.equal(_.values(oDataSources)[0].uri, "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/", "Got right service URL");
					assert.equal(_.values(oDataSources)[0].settings.localUri, './localService/metadata.xml', "Got right service metadata path");
					assert.equal(_.values(oDataSources)[0].type, "OData", "Got right data source type");
				});
			});
		});

		it("getDataSources - empty Configuration.js" , function() {
			return oFileSystem.getDocument("/proj10Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
					assert.equal(oDataSources, null, "Got right data source");
				});
			});
		});

		it("getDataSources - corrupted Configuration.js" , function() {
			return oFileSystem.getDocument("/proCorruptedConfiguration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
					assert.equal(oDataSources, null, "Got right data source");
				});
			});
		});

		//########################### getDataSourcesByType tests ###########################
		it("getDataSourcesByType", function() {
			return oFileSystem.getDocument("/projUI5128Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "OData").then(function(aDataSources) {
					assert.equal(Object.keys(aDataSources).length, 1, "Found 1 keys in result");
					assert.ok(_.has(aDataSources, "RMTSAMPLEFLIGHT"), "Found 1 dataSource");
				});
			});
		});

		it("getDataSourcesByType - non OData Type", function() {
			return oFileSystem.getDocument("/projUI5128Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "blabla").then(function() {
					assert.ok(false, "Only OData data sources can be parsed from Configuration.js");
				}).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getAllDataSourceNames tests ###########################
		it("getDataSourceNames - multiple sources", function() {
			return oFileSystem.getDocument("/emptyProject8").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Configuration.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Configuration.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getAllDataSourceNames(oTargetDocument).then(function (oDataSources) {
									assert.equal(oDataSources[0], "RMTSAMPLEFLIGHT", "Got right service name");
									assert.equal(oDataSources[1], "CARTAPPROVAL_STANDARD", "Got right service name");
									assert.equal(oDataSources.length, 2, "Got all sources names");
								});
							});
						});
					});
				});
			});
		});

		//########################### getAllExtensions tests ###########################
		it("getAllExtensions - Configuration.js", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function() {
					assert.ok(false, "Should not get here, extensions not part of Configuration.js");
				}).fail(function (oError) {
					assert.ok(oError, "Got thrown error");
					assert.equal(oError.name, "UnimplementedMethod", "Proper exception thrown");
				});
			});

		});

		//########################### isScaffoldingBased tests ###########################
		it("isScaffoldingBased - with scaffolding", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "scaffolding found");
				});
			});
		});

		//########################### addDataSource tests #####################################
		it("addDataSource - adding new service bOverWrite is true", function() {
			return oFileSystem.getDocument("/emptyProject5").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Configuration.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Configuration.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.addDataSource(
									oTargetDocument, //oDocument
									"k2",//sDataSourceName
									oNewDataSource,//oContent
									true //bOverWrite
								).then(function (bSuccess) {
										assert.ok(bSuccess, "Success adding new service");
										return oFileSystem.getDocument("/emptyProject5").then(function(oTargetDocument) {
											return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
												assert.equal(oDataSources["k2"].uri, oNewDataSource.uri, "Found correct data sources");
											});
										});
									});
							});
						});
					});
				});
			});
		});

		it("addDataSource - data source already exist - bOverWrite is false", function() {
			return oFileSystem.getDocument("/emptyProject6").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Configuration.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Configuration.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.addDataSource(
									oTargetDocument, //oDocument
									"k2",//sDataSourceName
									oNewDataSource,//oContent
									false //bOverWrite
								).then(function () {
									}).fail(function(oError) {
										assert.ok(oError, "Success getting error object");
										assert.equal(oError.name, "ServiceExist");
									});
							});
						});
					});
				});
			});
		});


		it("addDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oNewDataSource,//oContent
					true //bOverWrite
				).then(function () {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "DataSourceNameNotDefined");
					});
			});
		});

		it("addDataSource - oContent is null", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"k2",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function () {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "ContentNotDefined");
					});
			});
		});

		//########################### addExtension tests ###########################
		it("addExtension", function () {
			return oFileSystem.getDocument("/proj9Configuration").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oNewElementExtension.sExtensionType, oNewElementExtension.sViewName, oNewElementExtension.oContent, true).then(function () {
					assert.ok(false,"Should not be able to add extension to Configuration.js");
				}).fail(function (oError) {
					assert.ok(oError, "Error adding extension to Configuration.js");
					assert.equal(oError.name, "UnimplementedMethod", "Got right error type");
				});
			});
		});

		//########################### removeExtension tests ###########################
		it("removeExtension", function () {
			return oFileSystem.getDocument("/proj9Configuration").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingElementExtension.sExtensionType,
					oExistingElementExtension.sViewName, null).then(function () {
						assert.ok(false,"Should not be able to remove extension from Configuration.js");
					}).fail(function (oError) {
						assert.ok(oError, "Error removing extension to Configuration.js");
						assert.equal(oError.name, "UnimplementedMethod", "Got right error type");
					});
			});
		});


		//########################### getHandlerFileName tests #####################################
		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFileName(oTargetDocument).then(function(sName) {
					assert.equal(sName, "Configuration.js");
				});
			});
		});

		//########################### setHCPPlatformBlock / setABAPPlatformBlock tests ###########################
		it("setHCPPlatformBlock - doesn't do anything if this in a Configuration.js project", function () {
			return assert.isRejected(oFileSystem.getDocument("/projectWithConfiguration").then(function (oManifestProject) {
				return oUI5ProjectHandler.setHCPPlatformBlock(oManifestProject, {uri:"batata"});
			}), "setHCPPlatformBlock should throw an error in a Configuration.js project");
		});

		it("setABAPPlatformBlock - doesn't do anything if this in a Configuration.js project", function () {
			return assert.isRejected(oFileSystem.getDocument("/projectWithConfiguration").then(function (oManifestProject) {
				return oUI5ProjectHandler.setABAPPlatformBlock(oManifestProject, {uri:"batata"});
			}), "setABAPPlatformBlock should throw an error in a Configuration.js project");
		});
	});
});

