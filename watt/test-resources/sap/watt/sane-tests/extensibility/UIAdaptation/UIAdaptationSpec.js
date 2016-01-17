define(["STF"], function (STF) {

	"use strict";

	var suiteName = "UIAdaptation_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("UIAdaptation service", function () {
		var oUIAdaptationService;
		var oFakeFileDAO;
		var oFileService;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oUIAdaptationService = getService('uiadaptation');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileService = getService('filesystem.documentProvider');
			});
		});

		describe("Tests createUIAdaptationIndexHTML public method", function() {

			before(function () {
				oUIAdaptationService.context.service.preview.getPreviewUrl = function() {
					var oURL = {};
					oURL.toString = function() {
						return "dummy URL";
					};
					return Q(oURL);
				};
			});

			it("Generates the UIAdaptation index.html file", function() {
				var oFileStructure = {
					"TestProject1" : {
					}
				};
				var sComponentName = "dummy component";
				var aScriptsPaths = ["first/path/to/batataLand", "second/path/to/bamba"];

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject1").then(function(oProjectDocument) {
						// call createUIAdaptationIndexHTML method
						return oUIAdaptationService.createUIAdaptationIndexHTML(oProjectDocument, sComponentName, aScriptsPaths).then(function() {
							return oProjectDocument.getCurrentMetadata().then(function(oProjectDocumentMetadata) {
								expect(oProjectDocumentMetadata).to.exist;
								expect(oProjectDocumentMetadata).to.contain({
									folder: false,
									name: "UIAdaptation_index.html",
									parentPath: "/TestProject1",
									path: "/TestProject1/UIAdaptation_index.html"
								});
							}).then(function() {
								return oFileService.getDocument("/TestProject1/UIAdaptation_index.html").then(function(oIndexHTMLDocument) {
									return oIndexHTMLDocument.getContent().then(function(oHTMLContent) {
										expect(oHTMLContent).to.contain('name:"dummy component"');
										expect(oHTMLContent).to.contain('<script src="first/path/to/batataLand" type="text/javascript"></script>');
										expect(oHTMLContent).to.contain('<script src="second/path/to/bamba" type="text/javascript"></script>');
									});
								});
							});
						});
					});
				});
			});

			it("Generates the required LREP index.html file correctly even if the array parameter is empty", function() {
				var oFileStructure = {
					"TestProject2" : {
					}
				};
				
				var sComponentName = "dummy component";
				var aScriptsPaths = [];

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject2").then(function(oProjectDocument) {
						// call createUIAdaptationIndexHTML method
						return oUIAdaptationService.createUIAdaptationIndexHTML(oProjectDocument, sComponentName, aScriptsPaths).then(function() {
							return oProjectDocument.getCurrentMetadata().then(function(oProjectDocumentMetadata) {
								expect(oProjectDocumentMetadata).to.exist;
								expect(oProjectDocumentMetadata).to.contain({
									folder: false,
									name: "UIAdaptation_index.html",
									parentPath: "/TestProject2",
									path: "/TestProject2/UIAdaptation_index.html"
								});
							}).then(function() {
								return oFileService.getDocument("/TestProject2/UIAdaptation_index.html").then(function(oHTMLDocument) {
									return oHTMLDocument.getContent().then(function(oHTMLContent) {
										expect(oHTMLContent).to.contain('name:"dummy component"');
										//Count the number of the occurences of the string "script" in the HTML
										var count = (oHTMLContent.match(/script/g) || []).length;
										expect(count).to.equal(4);
									});
								});
							});
						});
					});
				});
			});

			it("Overrides the html file in consecutive calls", function() {
				var oFileStructure = {
					"TestProject3" : {
					}
				};
				
				var sComponentName = "dummy component";
				var aScriptsPaths = ["first/path/to/batataLand", "second/path/to/bamba"];

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject3").then(function(oProjectDocument) {
						// call createUIAdaptationIndexHTML method
						return oUIAdaptationService.createUIAdaptationIndexHTML(oProjectDocument, sComponentName, aScriptsPaths).then(function() {
							sComponentName = "another dummy component";
							aScriptsPaths = ["first/path/to/dummyfirstpath", "second/path/to/dummysecondpath"];
							// call createUIAdaptationIndexHTML method again
							return oUIAdaptationService.createUIAdaptationIndexHTML(oProjectDocument, sComponentName, aScriptsPaths);
						}).then(function() {
							return oProjectDocument.getCurrentMetadata().then(function(oProjectDocumentMetadata) {
								expect(oProjectDocumentMetadata).to.exist;
								expect(oProjectDocumentMetadata).to.contain({
									folder: false,
									name: "UIAdaptation_index.html",
									parentPath: "/TestProject3",
									path: "/TestProject3/UIAdaptation_index.html"
								});
							}).then(function() {
								return oFileService.getDocument("/TestProject3/UIAdaptation_index.html").then(function(oHTMLDocument) {
									return oHTMLDocument.getContent().then(function(oHTMLContent) {
										expect(oHTMLContent).to.not.contain('name:"dummy component"');
										expect(oHTMLContent).to.not.contain('<script src="first/path/to/batataLand" type="text/javascript"></script>');
										expect(oHTMLContent).to.not.contain('<script src="second/path/to/bamba" type="text/javascript"></script>');

										expect(oHTMLContent).to.contain('name:"another dummy component"');
										expect(oHTMLContent).to.contain('<script src="first/path/to/dummyfirstpath" type="text/javascript"></script>');
										expect(oHTMLContent).to.contain('<script src="second/path/to/dummysecondpath" type="text/javascript"></script>');
									});
								});
							});
						});
					});
				});
			});
		});
		
		describe("Tests previewAppWithChanges public method", function() {
			
			before(function () {
				oUIAdaptationService.context.service.preview.getPreviewUrl = function() {
					var oURL = {};
					oURL.toString = function() {
						return "dummy URL";
					};
					return Q(oURL);
				};
				
				oUIAdaptationService.context.service.preview.showPreview = function() {
					return Q("Preview is shown");
				};
			});

			it("Test when there's no UIAdaptation block in project.json - component name is the app namespace", function() {
				var oManifestJson = {"_version":"1.2.0","sap.app":{"_version":"1.2.0","id":"lrep.two","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"${project.version}"},"title":"{{appTitle}}","description":"{{appDescription}}","tags":{"keywords":[]},"ach":"fa","dataSources":{"mainService":{"uri":"/sap/opu/odata/sap/SEPMRA_PROD_MAN/","type":"OData","settings":{"annotations":["SEPMRA_PROD_MAN_ANNO_MDL","localAnnotations"],"localUri":"localService/metadata.xml"}},"SEPMRA_PROD_MAN_ANNO_MDL":{"uri":"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='SEPMRA_PROD_MAN_ANNO_MDL',Version='0001')/$value/","type":"ODataAnnotation","settings":{"localUri":"localService/SEPMRA_PROD_MAN_ANNO_MDL.xml"}},"localAnnotations":{"uri":"annotations/annotations.xml","type":"ODataAnnotation","settings":{"localUri":"annotations/annotations.xml"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.smarttemplate","version":"1.0.0"}},"sap.ui":{"_version":"1.2.0","technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_bluecrystal"]},"sap.ui5":{"_version":"1.1.0","resources":{"js":[],"css":[]},"dependencies":{"minUI5Version":"${sap.ui5.dist.version}","libs":{"sap.ui.core":{},"sap.m":{},"sap.ui.comp":{},"sap.uxap":{},"sap.suite.ui.generic.template":{}},"components":{}},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"},"i18n|sap.suite.ui.generic.template.ListReport|SEPMRA_C_PD_Product":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/ListReport/SEPMRA_C_PD_Product/i18n.properties"},"i18n|sap.suite.ui.generic.template.ObjectPage|SEPMRA_C_PD_Product":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/ObjectPage/SEPMRA_C_PD_Product/i18n.properties"},"i18n|sap.suite.ui.generic.template.ObjectPage|to_ProductText":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/ObjectPage/SEPMRA_C_PD_ProductText/i18n.properties"},"":{"dataSource":"mainService","settings":{"defaultBindingMode":"TwoWay","defaultCountMode":"Inline","refreshAfterChange":false}}},"extends":{"extensions":{}},"contentDensities":{"compact":true,"cozy":true}},"sap.ui.generic.app":{"_version":"1.1.0","pages":[{"entitySet":"SEPMRA_C_PD_Product","component":{"name":"sap.suite.ui.generic.template.ListReport","list":true,"settings":{"gridTable":true}},"pages":[{"entitySet":"SEPMRA_C_PD_Product","component":{"name":"sap.suite.ui.generic.template.ObjectPage"},"pages":[{"navigationProperty":"to_ProductText","entitySet":"SEPMRA_C_PD_ProductText","component":{"name":"sap.suite.ui.generic.template.ObjectPage"}}]}]}]},"sap.fiori":{"_version":"1.1.0","registrationIds":[],"archeType":"transactional"},"sap.platform.hcp":{"_version":"1.2.0","uri":"webapp"}};
				
				var oFileStructure = {
					"TestProject4" : {
						".project.json": "{}",
						"Component.js": "jQuery.sap.declare(\"lrep.two.Component\"),sap.ui.getCore().loadLibrary(\"sap.ui.generic.app\"),jQuery.sap.require(\"sap.ui.generic.app.AppComponent\"),sap.ui.generic.app.AppComponent.extend(\"lrep.two.Component\",{metadata:{manifest:\"json\"}});",
						"manifest.json" : JSON.stringify(oManifestJson)
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject4").then(function(oProjectDocument) {
						return oUIAdaptationService.previewAppWithChanges(oProjectDocument).then(function(sResult) {
							expect(sResult).to.equal("Preview is shown");
							
							return oFileService.getDocument("/TestProject4/changes_preview_index.html").then(function(oChangesIndexHTMLDocument) {
								expect(oChangesIndexHTMLDocument).to.exist;
							});
						});
					});
				});
			});
			
			it("Test when there's an UIAdaptation block in project.json - component name is taken from there", function() {
				var oFileStructure = {
					"TestProject5" : {
						".project.json": "{\"uiadaptation\": {\"componentname\":\"dummy component\"}}"
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject5").then(function(oProjectDocument) {
						return oUIAdaptationService.previewAppWithChanges(oProjectDocument).then(function(sResult) {
							expect(sResult).to.equal("Preview is shown");
							
							return oFileService.getDocument("/TestProject5/changes_preview_index.html").then(function(oChangesIndexHTMLDocument) {
								expect(oChangesIndexHTMLDocument).to.exist;
							});
						});
					});
				});
			});
		});
		
		describe("Tests createChangesPreviewIndexHTML public method", function() {

			it("Generates the 'changes_preview_index.html' file", function() {
				var oFileStructure = {
					"TestProject6" : {
					}
				};
				var sComponentName = "dummy component";

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject6").then(function(oProjectDocument) {
						// call createChangesPreviewIndexHTML method
						return oUIAdaptationService.createChangesPreviewIndexHTML(oProjectDocument, sComponentName).then(function() {
							return oProjectDocument.getCurrentMetadata().then(function(oProjectDocumentMetadata) {
								expect(oProjectDocumentMetadata).to.exist;
								expect(oProjectDocumentMetadata).to.contain({
									folder: false,
									name: "changes_preview_index.html",
									parentPath: "/TestProject6",
									path: "/TestProject6/changes_preview_index.html"
								});
							}).then(function() {
								return oFileService.getDocument("/TestProject6/changes_preview_index.html").then(function(oChangesIndexHTMLDocument) {
									return oChangesIndexHTMLDocument.getContent().then(function(oChangesHTMLContent) {
										expect(oChangesHTMLContent).to.contain('name:"dummy component"');
									});
								});
							});
						});
					});
				});
			});

			it("Overwrite the changes html file in consecutive calls", function() {
				var oFileStructure = {
					"TestProject7" : {
					}
				};
				
				var sComponentName = "dummy component";

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject7").then(function(oProjectDocument) {
						// call createChangesPreviewIndexHTML method
						return oUIAdaptationService.createChangesPreviewIndexHTML(oProjectDocument, sComponentName).then(function() {
							sComponentName = "another dummy component";
							// call createChangesPreviewIndexHTML method again
							return oUIAdaptationService.createChangesPreviewIndexHTML(oProjectDocument, sComponentName);
						}).then(function() {
							return oProjectDocument.getCurrentMetadata().then(function(oProjectDocumentMetadata) {
								expect(oProjectDocumentMetadata).to.exist;
								expect(oProjectDocumentMetadata).to.contain({
									folder: false,
									name: "changes_preview_index.html",
									parentPath: "/TestProject7",
									path: "/TestProject7/changes_preview_index.html"
								});
							}).then(function() {
								return oFileService.getDocument("/TestProject7/changes_preview_index.html").then(function(oChangesHTMLDocument) {
									return oChangesHTMLDocument.getContent().then(function(oChangesHTMLContent) {
										expect(oChangesHTMLContent).to.not.contain('name:"dummy component"');
										expect(oChangesHTMLContent).to.contain('name:"another dummy component"');
									});
								});
							});
						});
					});
				});
			});
		});
		
		describe("Tests saveChangeToWorkspace public method", function() {

			it("No 'changes' folder in project", function() {
				var oFileStructure = {
					"TestProject1" : {
						"webapp": {}
					}
				};
				
				var aChanges = [{
					"fileName": "change1"
				},{
					"fileName": "change2"
				}];
				
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject1").then(function(oProjectDocument) {
						// call saveChangeToWorkspace method
						return oUIAdaptationService.saveChangeToWorkspace(oProjectDocument, aChanges).then(function() {
							return oFileService.getDocument("/TestProject1/webapp/changes").then(function(oChangesFolder) {
								expect(oChangesFolder).to.exist;
								
								return oChangesFolder.getCurrentMetadata().then(function(oChangesFolderMetadata) {
									expect(oChangesFolderMetadata).to.exist;
									expect(oChangesFolderMetadata).to.contain({
										folder: false,
										name: "change1.change",
										parentPath: "/TestProject1/webapp/changes",
										path: "/TestProject1/webapp/changes/change1.change"
									});
									expect(oChangesFolderMetadata).to.contain({
										folder: false,
										name: "change2.change",
										parentPath: "/TestProject1/webapp/changes",
										path: "/TestProject1/webapp/changes/change2.change"
									});
								});
							});
						});
					});
				});
			});

			it("With 'changes' folder in project", function() {
				var oFileStructure = {
					"TestProject2" : {
						"webapp" : {
							"changes" : {}
						}
					}
				};
				
				var aChanges = [{
					"fileName": "change1"
				}];

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/TestProject2").then(function(oProjectDocument) {
						// call saveChangeToWorkspace method
						return oUIAdaptationService.saveChangeToWorkspace(oProjectDocument, aChanges).then(function() {
							return oFileService.getDocument("/TestProject2/webapp/changes").then(function(oChangesFolder) {
								expect(oChangesFolder).to.exist;
								return oChangesFolder.getCurrentMetadata().then(function(oChangesFolderMetadata) {
									expect(oChangesFolderMetadata).to.exist;
									expect(oChangesFolderMetadata).to.contain({
										folder: false,
										name: "change1.change",
										parentPath: "/TestProject2/webapp/changes",
										path: "/TestProject2/webapp/changes/change1.change"
									});
								});
							});
						});
					});
				});
			});
		});
		
		describe("Tests loadChangesFromWorkspace public method", function() {

			it("No 'changes' folder in project", function() {
				var oFileStructure = {
					"AppForTestLoad1" : {
						"webapp": {}
					}
				};
				
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/AppForTestLoad1").then(function(oProjectDocument) {
						// call loadChangesFromWorkspace method
						return oUIAdaptationService.loadChangesFromWorkspace(oProjectDocument).then(function(aChanges) {
							expect(aChanges).to.exist;
							expect(aChanges.length).to.equal(0);
						});
					});
				});
			});

			it("With 'changes' folder in project", function() {
				var oChange1 = {"fileName":"id_1450953207755_163_renameField","fileType":"change","changeType":"renameField","reference":"lrep.two.Component","packageName":"$TMP","content":{},"selector":{"id":"lrep.two::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--com.sap.vocabularies.UI.v1.Identification::ProductCategory::GroupElement"},"layer":"VENDOR","texts":{"fieldLabel":{"value":"New Category","type":"XFLD"}},"namespace":"apps/lrep.two/changes/","creation":"2015-12-24T10:33:28.262Z","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};
				var oChange2 = {"fileName":"id_1450953207755_162_moveFields","fileType":"change","changeType":"moveFields","reference":"lrep.two.Component","packageName":"$TMP","content":{"moveFields":[{"id":"lrep.two::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--com.sap.vocabularies.UI.v1.Identification::Price::GroupElement","index":1}]},"selector":{"id":"lrep.two::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--com.sap.vocabularies.UI.v1.Identification::FormGroup"},"layer":"VENDOR","texts":{},"namespace":"apps/lrep.two/changes/","creation":"2015-12-24T10:33:28.261Z","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};
				
				var oFileStructure = {
					"AppForTestLoad2" : {
						"webapp" : {
							"changes" : {
								"id_1450953207755_163_renameField.change": JSON.stringify(oChange1),
								"id_1450953207755_162_moveFields.change": JSON.stringify(oChange2)
							}
						}
					}
				};
				
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/AppForTestLoad2").then(function(oProjectDocument) {
						// call loadChangesFromWorkspace method
						return oUIAdaptationService.loadChangesFromWorkspace(oProjectDocument).then(function(aChanges) {
							expect(aChanges).to.exist;
							expect(aChanges.length).to.equal(2);
							// verify the changes were sorted
							expect(aChanges[0].fileName).to.equal("id_1450953207755_162_moveFields");
							expect(aChanges[1].fileName).to.equal("id_1450953207755_163_renameField");
						});
					});
				});
			});
		});

		describe("Tests openAdaptUI public method", function() {

			before(function () {
				oUIAdaptationService.context.service.preview.getPreviewUrl = function() {
					var oURL = {};
					oURL.toString = function() {
						return "dummy URL for open";
					};
					return Q(oURL);
				};
			});

			it("OpenAdaptUI", function() {
				var oFileStructure = {
					"AppForTestOpen1" : {
						"webapp": {},
						".project.json": "{\"uiadaptation\": {\"componentname\":\"dummy component for open\"}}"
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/AppForTestOpen1").then(function(oProjectDocument) {
						// call openAdaptUI method
						return oUIAdaptationService.openAdaptUI(oProjectDocument).then(function(oContainer) {
							expect(oContainer).to.exist;
							var oView = oContainer.getContent()[0];
							expect(oView).to.exist;
							var oViewData = oView.getViewData();
							expect(oViewData.sComponentName).to.equal("dummy component for open");
							expect(oViewData.sFrameUrl).to.equal("dummy URL for open");
							expect(oViewData.sLayer).to.equal("VENDOR");
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});