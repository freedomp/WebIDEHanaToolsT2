/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
		"require",
		"../impactanalysis/CatalogMetaData",
		"../impactanalysis/CatalogEntity",
		"sap/watt/ideplatform/che/plugin/chebackend/dao/File"
		],

		function(require,CatalogMetaData,CatalogEntity,FileService) {
		"use strict";

		return {

			execute: function() {
                var that =this;
              jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.impactGalilei");
               var selectionService = this.context.service.selection;
				return selectionService.assertNotEmpty().then(function(aSelection) {
							var document = aSelection[0].document;
							that._openDataLineage(document);
						});
					},

					_openDataLineage: function(oSrcDocument) {




						var that = this;
						var oEntity = oSrcDocument.getEntity();
						//var sObjectName = oEntity.getOriginalName();
						//var sCurrentSchema = oEntity.getCurrentSchema();
						var fullPath = oEntity.getFullPath().replace(/[.]hdbcalculationview$/, "");
						if(oEntity.getFileExtension() === "hdbcalculationview"){
							var fullPath = oEntity.getFullPath().replace(/[.]hdbcalculationview$/, "");
						}else if(oEntity.getFileExtension() === "hdbdd"){
							var fullPath = oEntity.getFullPath().replace(/[.]hdbdd$/, "");
						}
						var fileExtension = oEntity.getFileExtension();
						var impactPath = fullPath.substring(1, fullPath.length);
						impactPath = impactPath.replace(/\//g, ".");
						//var srcDocument = oSrcDocument.getEntity().getSupplement().srcDocument;
						//fillNameSpace(srcDocument,context) {
						this.fileService = FileService;
							var that = this;
							if (oSrcDocument) {
								var fullName = oSrcDocument.getEntity().getBackendData().getContentUrl();
//								var fullName = oDocument.getEntity().getBackendData().location;
								var names = fullName.split("/");
								var srcFolderPath;
								if (names.length > 2) {
									for (var i = 1; i < (names.length - 1); i++) {
										if (names[i] !== "src") {
											if (srcFolderPath)
												srcFolderPath = srcFolderPath + "/" + names[i];
											else
												srcFolderPath = names[i];
										} else {
											srcFolderPath = srcFolderPath + "/" + names[i];
										}
									}
								}
								var result = this.fileService.readFileContent(srcFolderPath + "/.hdinamespace", false).then(function(result) {
									var namespace = JSON.parse(result).name;
									
									var oDocumentInfo = {
											name: fullPath + ".datalineageview",
											type: "file",
											DAO : oSrcDocument.getEntity().getDAO(),
										//	category: sap.hana.ide.CATALOG_CATEGORY.DATA_PREVIEW,
										//	displayMode: sap.hana.ide.CATALOG_DISPLAY_MODE.CONTENTEDIT,
											impactPath: impactPath,
											//currentSchema: sCurrentSchema,
											content: null,
											supplement: {
												srcDocument: oSrcDocument,
												namespace : namespace,
												fileExtension : fileExtension,
											}
										};
										var oEntity = new CatalogEntity(oDocumentInfo);
										var oMetadata = jQuery.extend(new CatalogMetaData(oEntity), undefined);
										oEntity.setMetadata(oMetadata);
										var oBackendData = {
								location: "/sap/hana/xs/dt/base/file" + oEntity.getFullPath()
							};
							oEntity.setBackendData(oBackendData);
							
								that.context.service.document.getDocument(oEntity).then(function(oDocument){
									oDocument.setDocumentMetadata(oMetadata);
									return that._openDocumentLineage(oDocument).then(function() {
										var result = {};
										result.document = oDocument;
										return result;
									});
								});
									
									
								}).done();
							}
						
						//this.fillNameSpace(srcDocument,editor.context);
						

						
						/*return that.context.service.document.getDocumentProvider().then(function(documentprovider){
							documentprovider.getDocument(oDocumentInfo).then(function(oDocument){
								// clean up content to get new data always
								oDocument.getEntity().cleanUpContent();

								// open document
								return that._openDocumentImpact(oDocument).then(function() {
									var result = {};
									result.document = oDocument;
									return result;
								});
							})

						})/
						/*return that.context.service.catalogsystem.documentProvider.getDocument(oDocumentInfo).then(function(oDocument) {
							// clean up content to get new data always
							oDocument.getEntity().cleanUpContent();

							// open document
							return that._openDocumentImpact(oDocument).then(function() {
								var result = {};
								result.document = oDocument;
								return result;
							});
						}); */
					
					},

				
				 
				 _openDocumentLineage: function(oDocument, editorService) {
						var that = this;
						// use content to open document instead of document service
						// return that.context.service.document.open(oDocument);
						var oContentService = that.context.service.content;

						if (editorService === null || editorService === undefined) {
							return that.context.service.editor.getDefaultEditor(oDocument).then(function(oEditor) {
								return oContentService.open(oDocument,oEditor.service);
							});
						} else {
							return oContentService.open(oDocument,editorService);
						}
					},
					isAvailable: function() {
						return true;
					},

					isEnabled: function() {
						//return true;
						var selectionService = this.context.service.selection;
						return selectionService.assertNotEmpty().then(function(aSelection) {
							var document = aSelection[0].document;
							if (document === null || document.getType() !== "file") {
								return false;
							}

							var extension = document.getEntity().getFileExtension();
							return extension === "hdbcalculationview";
						});
					}

			};
		});

