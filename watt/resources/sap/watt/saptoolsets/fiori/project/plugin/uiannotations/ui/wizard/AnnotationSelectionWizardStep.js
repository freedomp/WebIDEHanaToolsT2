jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.wizard.AnnotationSelectionWizardStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.VisibilityContainer");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.wizard.AnnotationSelectionWizardStep", {

		_CATALOG_ODATA_ABAP: "odata_abap",
		_BSP_EXECUTE_ABAP: "bsp_execute_abap",
		_CATALOG_GENERIC: "odata_gen",
		_localFileCounter: 1,
		_oServiceCallsQueue: new Q.sap.Queue(),

		metadata: {
			properties: {
				"extensionFilters": "object",
				"collectExistingAnnotations": "boolean"
			}
		},
		_oRespoitoryBrowserViewContent: null,
		_oGrid: null,
		_oAnnotationsTbl: null,
		_bDoBeforeRendering: true,
		_previousDestination: undefined,
		_dataConnectionUtils: null,

		init: function() {
			if (!this._oGrid) {
				this._createGrid();
			}
			this.addContent(this._oGrid);
		},

		onBeforeRendering: function() {

			if (this._bDoBeforeRendering) {
				// call super() 
				if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
					sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering.apply(this);
				}
				var that = this;
				this._bDoBeforeRendering = false;
				return that.getContext().service.dataConnectionUtilsProvider.getDataConnectionUtils().then(function(dataConnectionUtils) {
					that._dataConnectionUtils = dataConnectionUtils;

					//Add i18n into the model of this wizard step
					that.fireValidation({
						isValid: false
					});
					that.fireProcessingStarted();
					//Init smartDoc and smartTemplates to model
					if (that.getModel() && !that.getModel().oData.smartTemplates) {
						that.getContext().service.smartDocProvider.getSmartDocByTemplate(that.getModel().getData().selectedTemplate).then(
							function(oSmartDoc) {
								if (oSmartDoc) {
									if (oSmartDoc.smartTemplates) {
										that.getModel().getData().smartTemplates = oSmartDoc.smartTemplates;
									}
								}
							}).done();
					}
					that._configI18Msg();

					if (!that.getCollectExistingAnnotations()) {
						return that.addInlineAnnotaions().then(function() {
							return that.fetchStepData().then(function() {
								that.fireProcessingEnded();
								return that.fireValidation({
									isValid: true
								});
							});
						});
					} else {
						var oConnection = that.getModel().getProperty("/connectionData");
						var sMetadataContent = oConnection.metadataContent;
						var annoStepDescTV = sap.ui.getCore().byId("annotationStepDescTV");
						var annotationFromServiceMenuItem = sap.ui.getCore().byId("item_from_service");
						annoStepDescTV.setText(that.getContext().i18n.getText("annotationSelectionWizardStep_Component_stepDescription"));
						annotationFromServiceMenuItem.setEnabled(false);
						var sPath = that.getModel().oData.componentPath;
						return that.collectAnnotaionsFromProject(sPath, oConnection, sMetadataContent);
					}

				});
			}
		},

		collectAnnotaionsFromProject: function(sProjectPath, oConnection, sMetadataContent) {
			var that = this;
			return this.getContext().service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oDocument) {
				return that.getContext().service.ui5projecthandler.getDataSources(oDocument).then(function(oDataSources) {
					if (oDataSources) {
						that.oDataSources = oDataSources;
						return that._getAnnotationsContent(that.getModel(), sProjectPath, oDataSources).then(function() {
							var annotations = that.getModel().getProperty("/annotations");
							if (annotations && annotations.length > 0) {
								return that._createMetaModel(oConnection.url, sMetadataContent, annotations).then(function() {
									for (var i = 0; i < annotations.length; i++) {
										if (annotations[i].name === "metadata.xml") {
											annotations[i].name = that.getContext().i18n.getText("annotationSelectionWizardStep_selected_service_metadata");
										}
										that.updateAnnotaionsUI(annotations[i].name, annotations[i].url, false, false, that.getAnnotaionSource(
											annotations[i]));
									}
									that.fireProcessingEnded();
									that.fireValidation({
										isValid: true
									});
								});
							} else {
								that.fireProcessingEnded();
								that.fireValidation({
									isValid: true
								});
							}
						});
					}
				});
			}).fail(function(oError) {
				that.context.service.log.info(oError.message);
			});
		},

		getAnnotaionSource: function(oAnnotation) {
			if (oAnnotation.filename.indexOf("localAnnotations_") === 0) {
				return this.localSrc;
			} else {
				return this.remoteSrc;
			}
		},

		addInlineAnnotaions: function() {
			var that = this;
			var oConnection = this.getModel().getProperty("/connectionData");
			var sMetadataContent = oConnection.metadataContent;
			var sMetadataLoc = oConnection.metadataLocation;
			return this.getContext().service.annotation.isMetaDataContainsAnnotions(sMetadataContent).then(function(bAnnotationsExists) {
				if (bAnnotationsExists) {
					return that._createMetaModel(oConnection.url, sMetadataContent, null).then(function() {
						var sPath = oConnection.url ? oConnection.url + "/$metadata" : sMetadataLoc;
						that.updateAnnotaionsUI(that.getContext().i18n.getText("annotationSelectionWizardStep_selected_service_metadata"), sPath, true,
							false, that.remoteSrc);
					});
				}
			});
		},

		_getAnnotationsContent: function(wizardModel, sPath, oDataSources) {
			// will be a problem when selecting a child and not the root.
			// var sAnnotationPath = sPath + "/webapp/" + oDataSources.localAnnotations.uri;
			var aAnnotationDocuments = [];
			var aAnnotationDocumentsContent = [];
			var sAnnotationPath;
			var that = this;
			var aAnnotationsSections = oDataSources.mainService.settings.annotations;

			return that.getContext().service.filesystem.documentProvider.getDocument(sPath).then(function(oDocument) {
				return that.getContext().service.ui5projecthandler.getHandlerFilePath(oDocument).then(function(oHandlerPath) {
					var aMetasDataLocalPath = oHandlerPath + "/" + oDataSources.mainService.settings.localUri;
					aAnnotationDocuments.push(that.getContext().service.filesystem.documentProvider.getDocument(aMetasDataLocalPath));
					if (aAnnotationsSections && aAnnotationsSections.length > 0) {
						for (var i = 0; i < aAnnotationsSections.length; i++) {
							if (oDataSources[aAnnotationsSections[i]].uri.indexOf("annotations") === 0) {
								sAnnotationPath = oHandlerPath + "/" + oDataSources[aAnnotationsSections[i]].uri;
							} else {
								sAnnotationPath = oHandlerPath + "/" + oDataSources[aAnnotationsSections[i]].settings.localUri;
							}
							aAnnotationDocuments.push(that.getContext().service.filesystem.documentProvider.getDocument(sAnnotationPath));
						}

						return Q.allSettled(aAnnotationDocuments).then(function(AnnDocumentsResults) {
							that.AnnDocumentsResults = AnnDocumentsResults;
							for (var k = 0; k < AnnDocumentsResults.length; k++) {
								aAnnotationDocumentsContent.push(AnnDocumentsResults[k].value.getContent());
							}
							return Q.allSettled(aAnnotationDocumentsContent).then(function(AnnDocumentsContentResults) {
								wizardModel.oData.annotations = [];
								for (var m = 0; m < AnnDocumentsContentResults.length; m++) {
									var sEntity = that.AnnDocumentsResults[m].value.getEntity();
									var annTechnicalName;
									var sFileName;
									if (sEntity._sParentPath.indexOf("/localService", sEntity._sParentPath.length - 13) !== -1) {
										annTechnicalName = sEntity._sName;
										sFileName = annTechnicalName;
									} else {
										annTechnicalName = that.getLocalFileName();
										sFileName = annTechnicalName + ".xml";
									}
									var sBackendSrv = sap.watt.getEnv("orion_server");
									sBackendSrv = sBackendSrv.lastIndexOf("/") === 0 ? sBackendSrv : sBackendSrv.substr(0, sBackendSrv.length-1);
									var sAnnotationPath = (sEntity) ? sBackendSrv + sEntity.getBackendData().location : "";

									var annotationsXML = {
										name: annTechnicalName,
										url: sAnnotationPath,
										runtimeUrl: null,
										destination: null,
										filename: sFileName,
										content: AnnDocumentsContentResults[m].value,
										generateInModelFolder: true
									};
									wizardModel.oData.annotations.push(annotationsXML);
								}
							});
						});
					}
				});
			});
		},

		fetchStepData: function() {
			var oConnection = this.getModel().getProperty("/connectionData");
			if (!oConnection) {
				this._handleError(this.noConnectionData);
				return Q();
			}

			var that = this;
			if (oConnection.destination) {
				return this.getContext().service.annotation.getAnnotationsUrls(oConnection.destination, oConnection.sPath).then(function(annotations) {
					if (annotations && annotations.length === 1) {
						annotations[0].selected = true;
						that.getModel().setProperty("/aAnntoationUrls", annotations);
					}
					return that.onAddServAnnotationOkButtonPressed();
				});
			}
			return Q();
		},

		onSelectedServiceChange: function() {
			// clean error messages and make the next button disabled
			this.fireValidation({
				isValid: false,
				message: ""
			});
			this._cleanParams();
			this._bDoBeforeRendering = true;
		},

		_createGrid: function() {
			var oData = {
				aAnnotationsUI: []
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				modelData: oData
			});
			this._oGrid = sap.ui.jsfragment("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.view.AnnotationSelectionWizardStep", this);
			this._oAnnotationsTbl = sap.ui.getCore().byId("annotationsTbl");
			this._oAnnotationsTbl.setModel(oModel, "uiModel");
			this._oAnnotationsTbl.bindRows("uiModel>/modelData/aAnnotationsUI");
		},

		removeAnnotationFromModel: function(index) {
			var that = this;
			var aSelectedAnnotations = this.getModel().getProperty("/annotations");
			var aUIAnnotations = this._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
			var bIsServiceAnno = aUIAnnotations[index].bIsServiceAnno;
			if (bIsServiceAnno) {
				var aAnnotationsUrls = this.getModel().getProperty("/aAnntoationUrls");
				var technicalName = aUIAnnotations[index].name;
				for (var i = 0; i < aAnnotationsUrls.length; i++) {
					if (technicalName === aAnnotationsUrls[i].TechnicalName) {
						aAnnotationsUrls[i].selected = false;
					}
				}
			}
			var modelIndex = index;
			if (aUIAnnotations[0].bIsMetaData) { //metadata is not handled in the model
				modelIndex = index - 1;
			}
			aSelectedAnnotations.splice(modelIndex, 1); //for model
			aUIAnnotations.splice(index, 1); //for ui
			for (var k = 0; k < aUIAnnotations.length; k++) {
				aUIAnnotations[k].rowIndex = k + 1;
			}

			var oConnection = this.getModel().getProperty("/connectionData");
			return this._oServiceCallsQueue.next(function() {
				return that._createMetaModel(oConnection.url, oConnection.metadataContent, aSelectedAnnotations).then(function() {
					that.getModel().setProperty("/annotations", aSelectedAnnotations);
					that._oAnnotationsTbl.getModel("uiModel").setProperty("/modelData/aAnnotationsUI", aUIAnnotations);
					that.fireValidation({
						isValid: true
					});
				});
			});
		},
		changeAnnotationPriority: function(oldPrior, newPrior) {

			var that = this;
			var aSelectedAnnotations = this.getModel().getProperty("/annotations");
			var aUIAnnotations = this._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
			if ((newPrior >= aUIAnnotations.length) || (newPrior < 0)) {
				return;
			}
			var modelOldPrior = oldPrior;
			var modelNewPrior = newPrior;
			if (aUIAnnotations[0].bIsMetaData) { //metadata is not part of the model annotaions objects
				modelOldPrior = modelOldPrior - 1;
				modelNewPrior = modelNewPrior - 1;
			}

			var prevItem = aSelectedAnnotations[modelNewPrior];
			var prevUIItem = aUIAnnotations[newPrior];
			if (!prevItem || prevItem.bIsMetaData) {
				return;
			}
			var theItem = aSelectedAnnotations[modelOldPrior];
			var theUIItem = aUIAnnotations[oldPrior];
			aSelectedAnnotations[modelOldPrior] = prevItem;
			aUIAnnotations[oldPrior] = prevUIItem;
			aSelectedAnnotations[modelNewPrior] = theItem;
			aUIAnnotations[newPrior] = theUIItem;

			for (var k = 0; k < aUIAnnotations.length; k++) {
				aUIAnnotations[k].rowIndex = k + 1;
			}

			var oConnection = this.getModel().getProperty("/connectionData");
			return this._oServiceCallsQueue.next(function() {
				return that._createMetaModel(oConnection.url, oConnection.metadataContent, aSelectedAnnotations).then(function() {
					that.getModel().setProperty("/annotations", aSelectedAnnotations);
					that._oAnnotationsTbl.getModel("uiModel").setProperty("/modelData/aAnnotationsUI", aUIAnnotations);
					that.fireValidation({
						isValid: true
					});
				}).done();
			});
		},

		_populateConnections: function(oListControl) {
			var that = this;
			this.fireProcessingStarted();
			var aFilter = [this._CATALOG_ODATA_ABAP, this._CATALOG_GENERIC];
			this.getContext().service.destination.getDestinations().then(function(oDestination) {
				var aConnections = that._dataConnectionUtils.getConnections(oDestination, aFilter, true);
				//oContext.service.destination.getDestinations().then(function(aDestinations) {
				oListControl.addItem(new sap.ui.core.ListItem({
					text: ""
				}).data("connection", undefined));

				aConnections.forEach(function(oConnection) {
					oListControl.addItem(new sap.ui.core.ListItem({
						text: oConnection.name
					}).data("connection", oConnection));
				});
				var aListItems = oListControl.getItems();
				if (aListItems.length === 2) {
					oListControl.fireEvent("change", {
						selectedItem: aListItems[1]
					});
					//Set the first item to be selected in the DropDown
					oListControl.setSelectedItemId(aListItems[1].getId());
				}
			}).fail(function(oError) {
				that._handleError(oError);
			}).fin(function() {
				that.fireProcessingEnded();
			});
		},

		_checkInput: function(sInput, regx) {
			var regex = new RegExp(regx);
			return regex.test(sInput);
		},

		_markAsValid: function(oControl) {
			sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.markAsValid.apply(this, [oControl]);

		},

		_markAsInvalid: function(oControl) {
			sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.markAsInvalid.apply(this, [oControl]);
		},

		_resetInputState: function(oControl) {
			if (oControl) {
				oControl.removeStyleClass("inputConfirmed");
				oControl.removeStyleClass("inputError");
			}
		},

		_cleanParams: function() {
			if (this.getModel()) {
				this._localFileCounter = 1;
				this.getModel().setProperty("/annotations", null);
				this._oAnnotationsTbl.getModel("uiModel").setProperty("/modelData/aAnnotationsUI", []);
				this.getModel().setProperty("/aAnntoationUrls", null);
				this._setDestinationToModel(null);
				this._previousDestination = undefined;
			}
		},

		_setDestinationToModel: function(oDestination) {
			var oModel = this.getModel();
			if (oModel) {
				if (!oModel.oData.neoapp) {
					oModel.oData.neoapp = {
						destinations: []
					};
				} else if (!oModel.oData.neoapp.destinations) {
					oModel.oData.neoapp.destinations = [];
				}
				var aDestinations = oModel.oData.neoapp.destinations;

				if (this._previousDestination) {
					//remove previous selection
					for (var i = 0; i < aDestinations.length; i++) {
						var sPath = this._previousDestination.path;
						var sPrevWatUsage = this._previousDestination.wattUsage;
						// in case that the path was set from the url (and not from the path parameter) then duplicated paths will 
						//be exists in the neoapp file. cause the path of _previousDestination is diffrent then the oNewDestination
						if (sPrevWatUsage === "odata_gen") {
							sPath = this._previousDestination.url;
						}
						if (aDestinations[i].path === sPath) {
							aDestinations.splice(i, 1);
							this._previousDestination = null;
							break;
						}
					}
				}

				if (oDestination) {
					//check if path already exists 
					for (i = 0; i < aDestinations.length; i++) {
						if (aDestinations[i].path === oDestination.path) {
							return;
						}
					}
					// handle RDL
					var path = oDestination.path;

					if (oDestination.wattUsage === "odata_gen") {
						path = oDestination.url;
					}
					var oNewDestination = {
						"path": path,
						"target": {
							"type": "destination",
							"name": oDestination.name
						},
						"description": oDestination.description
					};
					oNewDestination = (oDestination.entryPath) ? jQuery.extend(true, oNewDestination, {
						"target": {
							"entryPath": oDestination.entryPath
						}
					}) : oNewDestination;
					aDestinations.push(oNewDestination);
					this._previousDestination = oDestination;

				}
				oModel.oData.neoapp.destinations = aDestinations;
			}
		},

		_createMetaModel: function(sServiceURL, sMetadataContent, aAnnotations) {
			var that = this;
			var sNewUrl = sServiceURL;
			if (sNewUrl.indexOf("/destinations") !== 0) {
				var oConnection = this.getModel().getProperty("/connectionData");
				var sBaseUrl = that._dataConnectionUtils.getUrlPath(sServiceURL);
				sNewUrl = that._dataConnectionUtils.getDesigntimeUrl(oConnection.destination, sBaseUrl);
			}
			return this.getContext().service.annotation.mockFiles(sNewUrl, sMetadataContent, aAnnotations).then(function() {
				return that.getContext().service.annotation.getMetaModel(sNewUrl, aAnnotations).then(function(oMetaModel) {
					that.getModel().setProperty("/metaModel", oMetaModel);
				}).fail(
					function() {
						that._handleError(that.metaModelcreationFailed);
					}).fin(function() {
					that.getContext().service.mockFileLoader.stopMock();

				});
			});
		},

		onAddServAnnotationOkButtonPressed: function() {
			var aAnnotationsFromService = this.getModel().getProperty("/aAnntoationUrls");
			if (!aAnnotationsFromService) {
				return;
			}
			var oConnection = this.getModel().getProperty("/connectionData");
			var that = this;
			var aPromises = [];
			var selectedAnnotations = aAnnotationsFromService.filter(function(oValue) {
				return oValue.selected;
			});
			for (var i = 0; i < selectedAnnotations.length; i++) {
				var sAnnotationUrl = selectedAnnotations[i].__metadata.media_src;
				aPromises.push(that.getContext().service.annotation.getAnnotationXML(oConnection.destination, sAnnotationUrl));
			}
			this.fireProcessingStarted();
			return Q.all(aPromises).then(function(aContents) {
				var annotations = null;
				for (i = 0; i < selectedAnnotations.length; i++) {
					var annTechnicalName = selectedAnnotations[i].TechnicalName;
					sAnnotationUrl = selectedAnnotations[i].__metadata.media_src;
					var sRuntimeAnnotationURI = that._dataConnectionUtils.getRuntimeUrl(URI(sAnnotationUrl).path(), oConnection.destination);
					var sContent = aContents[i];
					sContent = that._dataConnectionUtils.removeAbsoluteURL(sContent,oConnection.destination.url);
					annotations = that.addAnnotaions(annTechnicalName, sContent, sAnnotationUrl, sRuntimeAnnotationURI, oConnection.destination);
				}
				if (!annotations) {
					return;
				}
				return that._createMetaModel(oConnection.url, oConnection.metadataContent, annotations).then(function() {
					that.getModel().setProperty("/annotations", annotations);
					for (i = 0; i < annotations.length; i++) {
						annTechnicalName = annotations[i].name;
						sAnnotationUrl = annotations[i].url;
						that.updateAnnotaionsUI(annTechnicalName, sAnnotationUrl, false, true, that.remoteSrc);
						that.fireValidation({
							isValid: true
						});
						that.fireProcessingEnded();
					}
				});
			});

		},

		addAnnotaions: function(annTechnicalName, oXMLcontent, sAnnotationUrl, sRuntimeAnnotationURI, oDestination) {

			var annotations = this.getModel().getProperty("/annotations") || [];
			var bExists = false;
			for (var i = 0; i < annotations.length; i++) {
				if (annotations[i].name === annTechnicalName) {
					bExists = true;
				}
			}

			if (!bExists) {
				var annotationsXML = {
					name: annTechnicalName,
					url: sAnnotationUrl,
					runtimeUrl: sRuntimeAnnotationURI,
					destination: oDestination,
					filename: annTechnicalName + ".xml",
					content: oXMLcontent,
					generateInModelFolder: true

				};
				annotations.push(annotationsXML);
			}
			return annotations;
		},

		updateAnnotaionsUI: function(annTechnicalName, sAnnotationUrl, bIsMetaData, bIsServiceAnno, sSource) {
			var aAnnotationsUI = this._oAnnotationsTbl.getModel("uiModel").getProperty("/modelData/aAnnotationsUI");
			var bExists = false;
			for (var i = 0; i < aAnnotationsUI.length; i++) {
				if (aAnnotationsUI[i].name === annTechnicalName) {
					bExists = true;
				}
			}

			if (!bExists) {
				//for the UI
				var annotationsUIParam = {
					name: annTechnicalName,
					url: sAnnotationUrl,
					bIsMetaData: bIsMetaData,
					bIsServiceAnno: bIsServiceAnno,
					source: sSource
				};
				annotationsUIParam.rowIndex = aAnnotationsUI.length + 1;
				aAnnotationsUI.push(annotationsUIParam);
				this._oAnnotationsTbl.getModel("uiModel").setProperty("/modelData/aAnnotationsUI", aAnnotationsUI);
			}
		},
		/**
		 * This method creates Annotation object based on XML file
		 * @param oFile The XML Annotation file
		 */
		_getAnnotationFileInput: function(oFile) {
			//Check for browser support
			var deferred = Q.defer();
			if (!!(window.File) && !!(window.FileReader)) {
				var reader = new FileReader();
				reader.onload = function() {
					deferred.resolve(reader.result);
				};
				reader.readAsText(oFile);
			}
			return deferred.promise;
		},

		/**
		 * This method handles with selecting files event. It validates the file type,
		 * sets the text field with the file name and calls to <code>_getMetadataFileInput</code> in order to read the file's content
		 * @param oEvent
		 */
		onFileUploaderChange: function(oEvent) {
			var that = this;
			//In case of cancel
			if (oEvent && oEvent.getParameter('newValue') === "") {
				return;
			}

			//Check browser support
			if (!(!!oEvent.getSource() && !!oEvent.getSource().oFileUpload && !!oEvent.getSource().oFileUpload.files && !!(this.oFile = oEvent.getSource()
				.oFileUpload.files[0]) && this.oFile.size !== 0)) {
				that._handleError(this.getContext().i18n.getText("i18n",
					"annotationSelectionWizardStep_missing_parameters"));
				return;
			}
			if (!this._isFileNameValid(this.oFile.name)) {
				return;
			}

		},
		getLocalFileName: function() {
			return "localAnnotations_" + this._localFileCounter++;

		},
		onFileUploadOkPresses: function() {
			var that = this;
			if (!this.oFile) {
				return;
			}
			this._getAnnotationFileInput(this.oFile).then(function(oAnnotationContent) {
				var sAnnotationName = that.getLocalFileName();
				var sTempAnnotationUrl = URL.createObjectURL(that.oFile);
				var sServiceURL = that.getModel().getProperty("/connectionData/url");
				var sMetadataContent = that.getModel().getProperty("/connectionData/metadataContent");
				var annotations = that.addAnnotaions(sAnnotationName, oAnnotationContent, null, null, null);
				return that._createMetaModel(sServiceURL, sMetadataContent, annotations).then(function() {
					that.getModel().setProperty("/annotations", annotations);
					that.updateAnnotaionsUI(sAnnotationName, sTempAnnotationUrl, false, false, that.localSrc);
					that.fireValidation({
						isValid: true
					});
				});

			}).done();
		},

		_onDestinationComboBoxChange: function(oEvent) {
			//	var oAnnotationSourcePasteUrlInput = sap.ui.getCore().byId("AnnotationPasteURLTextField1");

			//	this._oGrid.getModel("uiModel").setProperty("/modelData/bSelect", false);
			//	this._resetInputState(oAnnotationSourcePasteUrlInput);
			//	this._oGrid.getModel("uiModel").setProperty("/modelData/sServiceName", "");
			//	this._cleanInputFields();

			//Only if Drop down box selected value is empty clean the pasteURL field
			if (oEvent.getParameter("newValue") === "") {
				//		this._oGrid.getModel("uiModel").setProperty("/modelData/sPasteUrlTextFieldValue", "");
				return;
			}

			///	this._oGrid.getModel("uiModel").setProperty("/modelData/bSelect",
			//			this._oGrid.getModel("uiModel").getProperty("/modelData/sPasteUrlTextFieldValue") !== "");
			this.oPasteURLSelectedDestination = oEvent.getParameter("selectedItem").data("connection");

		},

		_validatePasteURlParams: function(oConnection, sAnnotationUrl) {
			var result = {};
			// Start validation:
			if (!oConnection) {
				result.isValid = false;
				result.errMsg = this.selectSystemMsg;
			} else if (sAnnotationUrl.length === 0) {
				result.isValid = false;
				result.errMsg = this.provideUrlMsg;
			} else if (sAnnotationUrl.charAt(0) !== "/") {
				result.isValid = false;
				result.errMsg = this.relativeUrlMsg;
			} else {
				result.isValid = true;
			}
			return result;
		},

		onPasteUrlPressOk: function() {
			var that = this;
			var oConnection = this.oPasteURLSelectedDestination;
			var sAnnotationUrl = this.sAnnotationUrl;
			var validationAnnotation = this._validatePasteURlParams(oConnection, sAnnotationUrl);
			if (validationAnnotation.isValid) {
				var oDestination = oConnection.destination;
				//hack for bsp :-(
				if (oConnection.destinationBSP && sAnnotationUrl.indexOf(oConnection.destinationBSP.path) === 0) {
					oDestination = oConnection.destinationBSP;
				}
				return this.getContext().service.annotation.getAnnotationXML(oDestination, sAnnotationUrl).then(
					function(oAnnotationContent) {
						var oServConnection = that.getModel().getProperty("/connectionData");
						var serviceURL = oServConnection.url;
						var sMetadataContent = oServConnection.metadataContent;
						sAnnotationUrl = that._dataConnectionUtils.getDesigntimeUrl(oConnection.destination, sAnnotationUrl);
						var sRuntimeAnnotationURI = (sAnnotationUrl) ? that._dataConnectionUtils.getRuntimeUrl(URI(sAnnotationUrl).path(), oDestination) :
							sAnnotationUrl;
						//						if (serviceURL) {
						var sServiceUrlWithDestination = serviceURL;
						if (sServiceUrlWithDestination.indexOf("/destinations") !== 0) {
							//	that.getContext().service.dataConnectionUtilsProvider.
							//	getDataConnectionUtils.getDesigntimeUrl
							sServiceUrlWithDestination = serviceURL.replace(oConnection.destination.path, oConnection.destination.url);
						}
						//incase a runtime url was pasted. change it to design time.
						var name = that._getTechNameFromAnnotaionUrl(sAnnotationUrl) || that.getLocalFileName();
						oAnnotationContent = that._dataConnectionUtils.removeAbsoluteURL(oAnnotationContent,oDestination.url);
						var annotations = that.addAnnotaions(name, oAnnotationContent, sAnnotationUrl, sRuntimeAnnotationURI,
							oDestination);
						return that._createMetaModel(sServiceUrlWithDestination, sMetadataContent, annotations).then(function() {
							that.getModel().setProperty("/annotations", annotations);
							that.fireValidation({
								isValid: true
							});
							return Q(that.updateAnnotaionsUI(name, sAnnotationUrl, false, false, that.remoteSrc));
						});
					}
				).fail(function() {
					var exitMessage = that.getContext().i18n.getText("annotationSelectionWizardStep_wrong_URL");
					var result = {
						isValid: false,
						errMsg: exitMessage
					};
					return Q(result);
				});
			} else {
				return Q(validationAnnotation);
			}
		},

		_getTechNameFromAnnotaionUrl: function(sAnnotationUrl) {
			var aSplit = sAnnotationUrl.split("TechnicalName='");
			var sTechnicalName = "";
			if (aSplit && aSplit[1]) {
				var index = aSplit[1].indexOf("'");
				sTechnicalName = (index > 0) ? aSplit[1].substr(0, index) : "";
			}
			return sTechnicalName;
		},

		_getRuntimeUrl: function(sUrl, oDestination) {
			if (!sUrl || !oDestination) {
				this._handleError(this.invalidFileMsg);
				this._handleError(this._i18n.getText("i18n", "annotationSelectionWizardStep_missing_parameters"));
			}

			var runtimeUrl = sUrl.replace(oDestination.url, oDestination.path);
			// remove occurrences of "//" in new url
			runtimeUrl = runtimeUrl.replace(/\/\//g, '/');

			// add "/" to the end of the url - otherwise will cause problems in runtime
			if (runtimeUrl.indexOf("/", runtimeUrl.length - 1) === -1) {
				runtimeUrl += "/";
			}

			return runtimeUrl;
		},

		_onPasteURL: function(oEvent) {
			if (oEvent.getParameter("liveValue")) {
				this.sAnnotationUrl = oEvent.getParameter("liveValue").trim();
			} else {
				//Empty or undefined - in case of input string was deleted
				this._resetInputState(sap.ui.getCore().byId("AnnotationPasteURLTextField1"));
			}
		},

		/**
		 *This method checks whether the file name is correct
		 * valid file name *.xml or *.edmx
		 * @param sFileName
		 */
		_isFileNameValid: function(sFileName) {
			return this._checkInput(sFileName, "([a-zA-Z]:(\\w+)*\\[a-zA-Z0_9]+)?\.(xml)$");
		},

		onRepositoryBrowserSelect: function() {
			var that = this;
			var oContext = this.getContext();
			var aExtensionFilters = this.getExtensionFilters();
			return oContext.service.repositoryBrowserFactory.create(null, {
				filters: aExtensionFilters
			}).then(function(repositoryBrowserInstance) {
				return repositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
					//!! this is the better way to register changed event - not working
					that._oRespoitoryBrowserViewContent = oRepositoryBrowserControl;
					if (oRepositoryBrowserControl) {
						oRepositoryBrowserControl.setHeight("400px");
						oRepositoryBrowserControl.setWidth("100%");
						oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						}));
					}
					//Handle select
					//!! find a better way to do that in the controller
					if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
						oRepositoryBrowserControl.getContent()[0].attachSelectionChange(that.onRepositorySelectFile, that);
					}
					return oRepositoryBrowserControl;
				});
			}).fail(
				function() {
					that._handleError(that.getContext().i18n.getText("i18n",
						"annotationSelectionWizardStep_error_repository_browser"));
				});

		},

		onRepositoryBrowserOKPressed: function() {

			var that = this;
			var aSelectedDocument = this._oRespoitoryBrowserViewContent.getController().getSelection();
			if (aSelectedDocument && aSelectedDocument.length !== 1) {
				return;
			}
			var oSelectedDocument = aSelectedDocument[0];
			var sFileName = "";
			if (oSelectedDocument.document && oSelectedDocument.document.getType && oSelectedDocument.document.getType() === "file") {
				sFileName = oSelectedDocument.document.getTitle();
				if (sFileName && this._isFileNameValid(sFileName)) {

					//Upload the file metedata and validate the metadata content with mock server
					oSelectedDocument.document.getContent().then(function(oAnnotationContent) {
						var sAnnotationName = that.getLocalFileName();
						var sServiceUrl = that.getModel().getProperty("/connectionData/url");
						var sMetadataContent = that.getModel().getProperty("/connectionData/metadataContent");
						var sEntity = oSelectedDocument.document.getEntity();
						var sBackendSrv = sap.watt.getEnv("orion_server");
						sBackendSrv = sBackendSrv.lastIndexOf("/") === 0 ? sBackendSrv : sBackendSrv.substr(0, sBackendSrv.length-1);
						var sAnnotationPath = (sEntity) ? sBackendSrv + sEntity.getBackendData().location : "";
						var annotations = that.addAnnotaions(sAnnotationName, oAnnotationContent, null, null, null);
						that._oRespoitoryBrowserViewContent = null;
						return that._createMetaModel(sServiceUrl, sMetadataContent, annotations).then(function() {
							that.getModel().setProperty("/annotations", annotations);
							that.updateAnnotaionsUI(sAnnotationName, sAnnotationPath, false, false, that.localSrc);
							that.fireValidation({
								isValid: true
							});
						});
					}).done();
				}
			}
		},

		onRepositorySelectFile: function(oEvent) {
			var sFileName = "";

			if ((!oEvent || !oEvent.getParameter)) {
				return;
			}

			var bSelect = false;

			//check how many were selected
			var aSelectedNode = oEvent.getParameter("nodes");
			if (!aSelectedNode || aSelectedNode.length !== 1) {
				bSelect = false;
			} else {
				sFileName = aSelectedNode[0].getText();
				bSelect = (sFileName && this._isFileNameValid(sFileName));
			}
		},

		_handleError: function(sMessage) {
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
		},
		_configI18Msg: function() {
			this.selectSystemMsg = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_selectSystemMsg");
			this.provideUrlMsg = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_provideUrlMsg");
			this.relativeUrlMsg = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_relativeUrlMsg");
			this.invalidFileMsg = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_invalidFileMsg");
			this.metaModelcreationFailed = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_MetaModelFailedMsg");
			this.noConnectionData = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_noConnectionDataMsg");
			this.remoteSrc = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_service_source");
			this.localSrc = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_local_source");
			//this.filesystemSrc = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_filesystem_source");
			//this.workspaceSrc = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_workspace_source");
			//this.remoteSrc = this.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_remote_source");

		},

		cleanStep: function() {
			this._cleanParams();
			this._bDoBeforeRendering = true;
			//this._bAnnotationSelectionStepDirty = false;
			this._oPrevServiceMetaModel = null;

			if (this._oRespoitoryBrowserViewContent && this._oRespoitoryBrowserViewContent.getContent()) {
				this._oRespoitoryBrowserViewContent.getContent()[0].detachSelectionChange(this.onRepositorySelectFile, this);
			}
			if (this.getModel() && this.getModel().getData().smartTemplates) {
				delete this.getModel().getData().smartTemplates;
			}
			this.getContext().service.smartDocProvider.invalidateCachedSmartDoc().done();
		},

		renderer: {}
	});