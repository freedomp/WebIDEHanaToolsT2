jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ServiceCatalogWizardStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ServiceCatalogWizardStep", {

			metadata : {
				properties : {
					"extensionFilters" : "object"
				}
			},

			_mDataConnectionEnum : {
				ServiceCatalog : 0,
				RepositoryBrowser : 1,
				FileSystem : 2,
				PasteURL : 3
			},
			_CATALOG_RDL : "river",
			_CATALOG_ODATA_ABAP : "odata_abap",
			_CATALOG_GENERIC : "odata_gen",
			_CATALOG_APIMGMT : "api_mgmt",
			_CATALOG_APIMGMT_PROXY: "api_mgmt_proxy",

			_previousDestination : undefined,
			_oRespoitoryBrowserViewContent : null,
			_oGrid : null,
			_bDataConnectionStepDirty : false,
			_apiKey : null,

			init : function() {
				if (!this._oGrid) {
					this._createGrid();
				}
				this.addContent(this._oGrid);
			},

			onBeforeRendering : function() {
				if (!this.bDoBeforeRendering) {
					this.bDoBeforeRendering = true;
					var oDataConnectionListBox = sap.ui.getCore().byId("DataConnectionListBox");
					oDataConnectionListBox.fireEvent("select", {
						selectedIndex : 0
					});
					oDataConnectionListBox.setSelectedIndex(0);
					//Add i18n into the model of this wizard step
					this.configureI18nResources();
				}
			},

			_createGrid : function() {
				var oData = {
					iDataConnectionSelected : this._mDataConnectionEnum.ServiceCatalog,
					mSelectionEnum : this._mDataConnectionEnum,
					sServiceName : "",
					bSelect : false,
					bVisibleDetails : false,
                    bVisibleServiceInfoAndDetailGrid : false,					
					bPasteUrlTextFieldEditable : false,
                    bHasRelatedProduct : false,
                    sPasteUrlTextFieldValue : "",
					sPasteURLComboBoxValue : "",
					sFileUploaderText : "",
					bAppKeyTextFieldVisible : false,
					sAppKeyTextFieldValue : "",
					bFullURL : true,
					bApimgmt : false
				};

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					modelData : oData
				});
				this._oGrid = sap.ui.jsfragment("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.view.DataConnectionWizardStep", this);
				this._oGrid.setModel(oModel);
				this._oGrid.bindElement("/modelData");
			},

			_onDataConnectionSelect : function(oEvent) {

				var iSelected = oEvent.getParameters().selectedIndex;
				this._oGrid.getModel().setProperty("/modelData/iDataConnectionSelected", iSelected);
				this.showDetailsOrData(false);
				this.cleanDetailsDataGrid();
				if (this._bDataConnectionStepDirty) {
					this.fireValidation({
						isValid : false
					});
				} else {
					this._bDataConnectionStepDirty = true;
				}
				this._oGrid.getModel().setProperty("/modelData/sServiceName", "");
				this._oGrid.getModel().setProperty("/modelData/sFileUploaderText", "");
				this._oGrid.getModel().setProperty("/modelData/sPasteUrlTextFieldValue", "");
				this._oGrid.getModel().setProperty("/modelData/sAppKeyTextFieldValue", "");
				this._oGrid.getModel().setProperty("/modelData/bAppKeyTextFieldVisible", false);

				switch (iSelected) {
				case this._mDataConnectionEnum.ServiceCatalog:
					this.getContext().service.servicecatalog.cleanSelection().done();
					this.getContext().service.servicecatalog.setServiceContext({appName:this.getModel().oData.projectName}).done();
					this.onServiceCatalogDataConnectionSelect(oEvent).then(function(oContent) {
						if (oContent) {
							var DataConnectionServiceCatalogContent = sap.ui.getCore().byId("DataConnectionServiceCatalogContent");
							DataConnectionServiceCatalogContent.addContent(oContent);
						}
					}).done();
					this._oGrid.getModel().setProperty("/modelData/bVisibleServiceInfoAndDetailGrid", false);

					break;
				case this._mDataConnectionEnum.RepositoryBrowser:
					this.onRepositoryBrowserSelect().then(function(oGrid) {
						if (oGrid) {
							var oRepositoryBrowserContainer = sap.ui.getCore().byId("DataConnectionRepositoryBrowserContent");
							oRepositoryBrowserContainer.addContent(oGrid);
						}
					}).done();
					this._oGrid.getModel().setProperty("/modelData/bVisibleServiceInfoAndDetailGrid", true);
					break;
				case this._mDataConnectionEnum.FileSystem:
					var oFileUploader = sap.ui.getCore().byId("DataConnectionFileUploader");
					this._resetInputState(oFileUploader);
					this._oGrid.getModel().setProperty("/modelData/bVisibleServiceInfoAndDetailGrid", true);

					break;
				case this._mDataConnectionEnum.PasteURL:
					var oDataConnectionPasteUrlInput = sap.ui.getCore().byId("DataConnectionPasteURLTextField");
					this._resetInputState(oDataConnectionPasteUrlInput);

					this._oGrid.getModel().setProperty("/modelData/sPasteURLComboBoxValue", "");
					this._oGrid.getModel().setProperty("/modelData/bSelect", false);
					this._oGrid.getModel().setProperty("/modelData/bFullURL", true);

					var oDataConnectionPasteURLDestinationsComboBox = sap.ui.getCore().byId("DataConnectionPasteURLDestinationsComboBox");
					if (oDataConnectionPasteURLDestinationsComboBox.getItems()
							&& oDataConnectionPasteURLDestinationsComboBox.getItems().length === 0) {
						this.getContext().service.servicecatalog.populateConnections(oDataConnectionPasteURLDestinationsComboBox,
								this._mDataConnectionEnum.PasteURL).done();
					}
					this._oGrid.getModel().setProperty("/modelData/bVisibleServiceInfoAndDetailGrid", true);
					break;
				}
			},

			_checkInput : function(sInput, regx) {
				var regex = new RegExp(regx);
				return regex.test(sInput);
			},

			_markAsValid : function(oControl) {
				sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.markAsValid.apply(this, [ oControl ]);

			},

			_markAsInvalid : function(oControl) {
				sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.markAsInvalid.apply(this, [ oControl ]);
			},

			_resetInputState : function(oControl) {
				oControl.removeStyleClass("inputConfirmed");
				oControl.removeStyleClass("inputError");
			},

			_cleanInputFields : function() {
				if (this.getModel()) {
					this.getModel().oData.connectionData = undefined;
					this._setDestinationToModel(null);
					this._setDestinationWhiteListToModel(null);
					this._previousDestination = undefined;
				}
			},

			onServiceCatalogStepNext : function(bNextEnabled, sMessage,severity) {
			    if (sMessage) {
					this.fireValidation({
						isValid : bNextEnabled,
						message : sMessage,
						severity:severity
					});
				} else {
					this.fireValidation({
						isValid : bNextEnabled
					});
				}
			},

			_getServiceNameFromMetadata : function(sMetadataContent) {

				var find = ' ';
				var sNameSpace = "<SchemaNamespace=\"";
				var re = new RegExp(find, 'g');

				sMetadataContent = sMetadataContent.replace(re, '');
				var iPos = sMetadataContent.indexOf(sNameSpace) + sNameSpace.length;
				var iPosTo = sMetadataContent.indexOf("\"", iPos);
				var sServiceName = sMetadataContent.substring(iPos, iPosTo);

				return sServiceName;
			},

			onCatalogServiceSelectionSuccess : function(oConnectionData) {

				this.cleanDetailsDataGrid();
				this.getModel().setProperty("/connectionData", oConnectionData);

				if (oConnectionData) {

					if (this.getModel().oData.selectedTemplate) {
						oConnectionData.metadataPath = this.getModel().oData.selectedTemplate.getMetadataPath();
					}

					if (oConnectionData.serviceName === "") {
						oConnectionData.serviceName = this._getServiceNameFromMetadata(oConnectionData.metadataContent);
					}

					this._apiKey = oConnectionData.apiKey;
					if (oConnectionData.destination) {
						this._setDestinationToModel(oConnectionData.destination);
						this._setDestinationWhiteListToModel(oConnectionData.destination);
					}
					
					var sServiceNameMessage;
                    if (oConnectionData.productName) {
                        sServiceNameMessage = this.getContext().i18n.getText("i18n",
							"serviceCatalogWizardStep_servicenamelabel_for_API_Mgmnt_product_details", [ oConnectionData.productName, oConnectionData.serviceName]);
					    
					}else{
					    sServiceNameMessage = this.getContext().i18n.getText("i18n",
							"serviceCatalogWizardStep_servicenamelabel_service_details", [ oConnectionData.serviceName ]);
					}
					
					this._oGrid.getModel().setProperty("/modelData/sServiceName", sServiceNameMessage);

					this.fireValidation({
						isValid : true,
						message : sServiceNameMessage,
						severity : "info"
					});
				}

				this.showDetailsOrData(true);
			},

			onServiceCatalogDataConnectionSelect : function(oEvent) {
				var oServiceCatalog = this.getContext().service.servicecatalog;
				return oServiceCatalog.getContent().then(function(oContent) {
					return oContent;
				});
			},

			createDetailsContent : function() {
				var that = this;
				//If no metadata is set, do nothing
				var oConnection = this.getModel().oData.connectionData;

				this.cleanDetailsDataGrid();

				if (!oConnection || !oConnection.metadata) {
					return Q();
				}
				var sUrl = oConnection.url;
				var oDetailsDataTree = sap.ui.getCore().byId("DataConnectionServiceDetailsTree");

				if (oConnection.type === this._CATALOG_ODATA_ABAP) {
					return Q.sap.require("sap/watt/saptoolsets/fiori/project/plugin/servicecatalog/providers/ODataTreeNodesProvider").then(
							function(ODataTreeNodesProvider) {
								oDetailsDataTree.removeAllNodes();
								ODataTreeNodesProvider.getServiceDetailsTreeNodes(oConnection.metadata,
										that.getContext().service.odataProvider, that.getContext().i18n).forEach(function(oNode) {
									oDetailsDataTree.addNode(oNode);
								});
								this.showDetailsOrData(true);
								//that._mDataConnectionDetails[iDataConnection] = oDetailsDataTree.getNodes();
							}).fail(function(oError) {
						that._throwErrorHandler(oError);
					});
				} else if (oConnection.type === this._CATALOG_RDL) {
					this.showDetailsOrData(oConnection.destination && oConnection.destination.wattUsage === this._CATALOG_RDL);
					return Q.sap.require("sap/watt/saptoolsets/fiori/project/plugin/servicecatalog/providers/RDLTreeNodesProvider").then(
							function(RDLTreeNodesProvider) {
								oDetailsDataTree.removeAllNodes();
								RDLTreeNodesProvider.getApplicationDetailsTreeNodes(oConnection.metadata, that.getContext().i18n).forEach(
										function(oNode) {
											oDetailsDataTree.addNode(oNode);
										});
								that.showDetailsOrData(true);
							});
				}
			},

			/**
			 * This method handles with selecting files event. It validates the file type,
			 * sets the text field with the file name and calls to <code>_getMetadataFileInput</code> in order to read the file's content
			 * @param oEvent
			 */
			_onFileUploaderChange : function(oEvent) {
				var that = this;
				//In case of cancel
				if (oEvent && oEvent.getParameter('newValue') === "") {
					this.cleanDetailsDataGrid();
					return;
				}

				var oFile = null;
				//Check browser support
				if (!(!!oEvent.getSource() && !!oEvent.getSource().oFileUpload && !!oEvent.getSource().oFileUpload.files
						&& !!(oFile = oEvent.getSource().oFileUpload.files[0]) && oFile.size !== 0)) {
					this._throwErrorHandler(this.getContext().i18n.getText("i18n", "serviceCatalogWizardStep_missing_parameters"));
					return;
				}

				if (!this._isFileNameValid(oFile.name)) {
					this.cleanDetailsDataGrid();
					this.fireValidation({
						isValid : false
					});
					this._throwErrorHandler(this.getContext().i18n.getText("i18n", "serviceCatalogWizardStep_invalid_document"));
					return;
				}

				this._getMetadataFileInput(oEvent, oFile).then(function() {
					//extract the file name for display
					//var regex = new RegExp("[^\\/]+\.[^\\/]+$");
					that.createDetailsContent().done();
				}).fail(function(oError) {
					that._throwErrorHandler(oError.message);
				}).done();

			},

			_onDestinationComboBoxChange : function(oEvent) {

				var oDataConnectionPasteUrlInput = sap.ui.getCore().byId("DataConnectionPasteURLTextField");
				this._resetInputState(oDataConnectionPasteUrlInput);
				this._resetInputState(sap.ui.getCore().byId("ApiKeyTextField"));
				this._cleanWizard();

				//if before was selected full url (text field of url wasn't visible before selection) we need to clean the text field 
				if (this._oGrid.getModel().getProperty("/modelData/bFullURL")) {
					this._oGrid.getModel().setProperty("/modelData/sPasteUrlTextFieldValue", "");
				}

				//if before was selected system without api key (text field of api key wasn't visible before selection) we need to clean the text field
				if (!this._oGrid.getModel().getProperty("/modelData/bAppKeyTextFieldVisible")) {
					this._oGrid.getModel().setProperty("/modelData/sAppKeyTextFieldValue", "");
				}

				var oSelectedItem = oEvent.getParameter("selectedItem").data("connection");
				if (!oSelectedItem) {
					return;
				}
				this.oPasteURLSelectedDestination = oSelectedItem;
				var bAppKeyTextFieldVisible = !!oSelectedItem.isApimgmt;
				//update for additinal data
				this._oGrid.getModel().setProperty("/modelData/bAppKeyTextFieldVisible", bAppKeyTextFieldVisible);
				//this._oGrid.getModel().setProperty("/modelData/sServiceURLIndent", bAppKeyTextFieldVisible ? "" : "L9 M9 S9");
				this._oGrid.getModel().setProperty("/modelData/bFullURL", oSelectedItem.isFullUrl);

				//Only if selected value is empty- clean the pasteURL field
				if (oEvent.getParameter("newValue") === "") {
					this._oGrid.getModel().setProperty("/modelData/sPasteUrlTextFieldValue", "");
					this._oGrid.getModel().setProperty("/modelData/sAppKeyTextFieldValue", "");
					this._oGrid.getModel().setProperty("/modelData/bSelect", false);
					return;
				}

				//Update model bApimgmt property according to destination
				this._oGrid.getModel().setProperty("/modelData/bApimgmt", oSelectedItem.isApimgmt);

				//if the new destination has full url
				if (oSelectedItem.isFullUrl) {
					this._oGrid.getModel().setProperty("/modelData/sPasteUrlTextFieldValue", oSelectedItem.destination.path);
					//if there is no apikey - send the request
					// if (!oSelectedItem.isApimgmt) {
					// 	this.onPasteURLSelectButton(oEvent);
					// 	return;
					// }

					// Trigger the request (also if there is apikey). 
					// Don't send event to mark this is code triggered (so if api key value is empty request will not be sent).
					this.onPasteURLSelectButton();
					return;
				}

				//update the button according to destination & text field
				var bSelect = !!this._oGrid.getModel().getProperty("/modelData/sPasteUrlTextFieldValue");
				this._oGrid.getModel().setProperty("/modelData/bSelect", bSelect);

				// Not full URL - trigger the request if all data is filled (and button is enabled...)
				if (bSelect) {
					// Don't send event to mark this is code triggered (so if api key value is empty request will not be sent).
					this.onPasteURLSelectButton();
				}
			},

			_onChangeApiKeyTextField : function(oEvent) {
				this.fireValidation({
					isValid : false
				});
				var bSelect = this._oGrid.getModel().getProperty("/modelData/bSelect"); //is 'test' button enabled (service url is provided)
				var sNewApikeyValue = oEvent.getParameter("liveValue");
				if (sNewApikeyValue) {
					var bFullURL = this._oGrid.getModel().getProperty("/modelData/bFullURL");
					var bApimgmt = this._oGrid.getModel().getProperty("/modelData/bApimgmt");
					// The other condition handles also the destination with 'full_url' and 'api_mgmt' scenario
					if (bSelect || (bFullURL && bApimgmt)) {
						this._oGrid.getModel().setProperty("/modelData/sAppKeyTextFieldValue", sNewApikeyValue); //update model before calling 'test' (as live change updating model only after exiting this handler)
						this.onPasteURLSelectButton(); //Simulate click on the 'test' button, with no passing event (to mark that this is code triggered)
					}
				} else {
					//Empty or undefined - in case of input string was deleted
					if (bSelect || (bFullURL && bApimgmt)) {
						// Mark with error the api key field only if there is a url
						var oApiKeyTextField = sap.ui.getCore().byId("ApiKeyTextField");
						this._markAsInvalid(oApiKeyTextField);
						this._resetInputState(sap.ui.getCore().byId("DataConnectionPasteURLTextField")); //clean errors from url field
						this.cleanDetailsDataGrid(); //remove service details (as displayed service not longer valid)
						this._throwErrorHandler(this.getContext().i18n.getText("i18n",
								"serviceCatalogWizardStep_error_paste_url_missing_apikey"));
					}
				}
			},

			_onPasteURLLiveChange : function(oEvent) {
				if (oEvent.getParameter("liveValue") && this._oGrid.getModel().getProperty("/modelData/sPasteURLComboBoxValue") !== "") {
					this._oGrid.getModel().setProperty("/modelData/bSelect", true);
				} else {
					//Empty or undefined - in case of input string was deleted
					this._oGrid.getModel().setProperty("/modelData/bSelect", false);
					this._resetInputState(sap.ui.getCore().byId("DataConnectionPasteURLTextField"));
					this._oGrid.getModel().setProperty("/modelData/sServiceName", "");
					this.cleanDetailsDataGrid();
					this.fireValidation({
						isValid : false
					});
					this._cleanInputFields();
				}
			},

			_onPasteURLChange : function(oEvent) {
				var bSelect = this._oGrid.getModel().getProperty("/modelData/bSelect");
				if (bSelect) {
					this.onPasteURLSelectButton(); //Simulate click on the 'test' button, with no passing event (to mark that this is code triggered)
				}
			},

			_cleanWizard : function() {
				this._oGrid.getModel().setProperty("/modelData/sServiceName", "");

				this.cleanDetailsDataGrid();
				this.fireValidation({
					isValid : false
				});
				this._cleanInputFields();
			},
			/**
			 *This method checks whether the file name is correct
			 * valid file name *.xml or *.edmx
			 * @param sFileName
			 */
			_isFileNameValid : function(sFileName) {
				return this._checkInput(sFileName, "([a-zA-Z]:(\\w+)*\\[a-zA-Z0_9]+)?\.(xml|edmx)$");
			},

			/**
			 * This method creates metadata object based on XML file
			 * @param oFile The XML metadata file
			 */
			_getMetadataFileInput : function(oEvent, oFile) {
				//Check for browser support
				var oFileUploader = sap.ui.getCore().byId("DataConnectionPasteURLTextField");
				var deferred = Q.defer();
				if (!!(window.File) && !!(window.FileReader)) {
					var reader = new FileReader();
					var that = this;
					var sTempFile = URL.createObjectURL(oEvent.getSource().oFileUpload.files[0]);
					reader.onload = function() {
						//Upload the file metedata (to AST) and validate the metadata content with mock server
						Q.all(
								[ that._onMetadataFileUpload(reader.result,sTempFile),
										that.getContext().service.odataProvider.validateMetadata(reader.result) ]).spread(function() {
							that._markAsValid(oFileUploader);
							deferred.resolve();
						}).fail(function(oError) {
							that.cleanDetailsDataGrid();
							that._markAsInvalid(oFileUploader);
							deferred.reject(oError);
						}).done();
					};
					reader.readAsText(oFile);
				}
				return deferred.promise;
			},

			_throwErrorHandler : function(sError) {
				this.fireValidation({
					isValid : false,
					message : sError
				});
			},

			_onMetadataFileUpload : function(sContent,sMetadataLoc) {
				var that = this;
				var oContext = this.getContext();
				var sServiceName = this._getServiceNameFromMetadata(sContent);
				var sMetadataPath = "";
				

				if (this.getModel().oData.selectedTemplate) {
					sMetadataPath = this.getModel().oData.selectedTemplate.getMetadataPath();
				}

				return oContext.service.csdlParser.parse(sContent, null, null).then(function(oAst) {
					//TODO do we need to check status? 
					if (!oAst) {
						throw new Error(oContext.i18n.getText("i18n", "serviceCatalogWizardStep_could_not_parse_file"));
					}
					return that.getContext().service.astLibrary.getRiverAstLibrary(oAst.response[0]).then(function(oAstASLib) {
						that.getModel().oData.connectionData = {
							metadata : oAstASLib,
							url : "",
							serviceName : sServiceName,
							type : "river", // it is a
							metadataContent : sContent,
							metadataPath : sMetadataPath,
							metadataLocation:sMetadataLoc
						};
						that._setDestinationToModel(null);
						that._setDestinationWhiteListToModel(null);
						that.fireValidation({
							isValid : true
						});
					});
				}).fail(function(){
					throw new Error(oContext.i18n.getText("i18n", "serviceCatalogWizardStep_could_not_parse_file"));
				});
			},

			_setDestinationWhiteListToModel : function(oDestination) {
				var sApiKey = "apiKey";
				var oModel = this.getModel();

				if (oModel) {
					if (!oModel.oData.neoapp) {
						oModel.oData.neoapp = {
							headerWhiteList : []
						};
					} else if (!oModel.oData.neoapp.headerWhiteList) {
						oModel.oData.neoapp.headerWhiteList = [];
					}
					var aHeaderWhiteList = oModel.oData.neoapp.headerWhiteList;

					if (oDestination) {
						if (this._apiKey) {
							//check if the apikey already exists 
							for ( var i = 0; i < aHeaderWhiteList.length; i++) {
								if (aHeaderWhiteList[i] === sApiKey) {
									return;
								}
							}
							aHeaderWhiteList.push(sApiKey);
						} else {
							for (i = 0; i < aHeaderWhiteList.length; i++) {
								if (aHeaderWhiteList[i] === sApiKey) {
									aHeaderWhiteList.splice(i, 1);
									break;
								}
							}
						}
					}
				}
			},

			_setDestinationToModel : function(oDestination) {
				var oModel = this.getModel();
				if (oModel) {
					if (!oModel.oData.neoapp) {
						oModel.oData.neoapp = {
							destinations : []
						};
					} else if (!oModel.oData.neoapp.destinations) {
						oModel.oData.neoapp.destinations = [];
					}
					var aDestinations = oModel.oData.neoapp.destinations;

					if (this._previousDestination) {
						//remove previous selection
						for ( var i = 0; i < aDestinations.length; i++) {
							var sPath = this._previousDestination.path;
							var sPrevWatUsage = this._previousDestination.wattUsage;
							// in case that the path was set from the url (and not from the path parameter) then duplicated paths will 
							//be exists in the neoapp file. cause the path of _previousDestination is diffrent then the oNewDestination
							if (sPrevWatUsage === this._CATALOG_RDL || sPrevWatUsage === this._CATALOG_GENERIC || sPrevWatUsage === this._CATALOG_APIMGMT_PROXY) {
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
						// TODO: remove special handling for RDL once destinations are finalized
						if (oDestination.wattUsage === this._CATALOG_RDL || oDestination.wattUsage === this._CATALOG_GENERIC|| oDestination.wattUsage === this._CATALOG_APIMGMT_PROXY) {
							path = oDestination.url;
						}
						var oNewDestination = {
							"path" : path,
							"target" : {
								"type" : "destination",
								"name" : oDestination.name
							},
							"description" : oDestination.description
						};
						oNewDestination = (oDestination.entryPath) ? jQuery.extend(true, oNewDestination, {
							"target" : {
								"entryPath" : oDestination.entryPath
							}
						}) : oNewDestination;
						aDestinations.push(oNewDestination);
						this._previousDestination = oDestination;

					}
					oModel.oData.neoapp.destinations = aDestinations;
				}
			},

			onRepositoryBrowserSelect : function(oEvent) {
				var that = this;
				var oContext = this.getContext();
				var aExtensionFilters = this.getExtensionFilters();
				if (oContext && !this._oRespoitoryBrowserViewContent) {
					return oContext.service.repositoryBrowserFactory.create(null, {
						filters : aExtensionFilters
					}).then(function(repositoryBrowserInstance) {
						return repositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
							//FIXME this is the better way to register changed event - not working why we need this?
							oContext.service.selection.attachEvent("changed", that.onRepositorySelectFile, that);
							that._oRespoitoryBrowserViewContent = oRepositoryBrowserControl;
							if (oRepositoryBrowserControl) {
								oRepositoryBrowserControl.setHeight("400px");
								oRepositoryBrowserControl.setWidth("100%");
								oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
									span : "L12 M12 S12"
								}));
							}
							//Handle select
							//FIXME find a better way to do that in the controller
							if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
								oRepositoryBrowserControl.getContent()[0].attachSelectionChange(that.onRepositorySelectFile, that);
							}
							return oRepositoryBrowserControl;
						});
					}).fail(
							function(oError) {
								that._throwErrorHandler(that.getContext().i18n.getText("i18n",
										"serviceCatalogWizardStep_error_repository_browser"));
							});
				} else {
					this._oRespoitoryBrowserViewContent.getContent()[0].attachSelectionChange(that.onRepositorySelectFile, this);
					return Q();
				}
			},

			onRepositoryBrowserSelectButton : function() {
				var that = this;
				// clean previous selected file details and make 'next' disabled, until a new valid selection is made
				this.cleanDetailsDataGrid();
				this.fireValidation({
					isValid : false
				});
				var aSelectedDocument = this._oRespoitoryBrowserViewContent.getController().getSelection();
				if (aSelectedDocument.length !== 1) {
					this.cleanDetailsDataGrid();
					this.fireValidation({
						isValid : false
					});
					return;
				}
				var oSelectedDocument = aSelectedDocument[0];
				var sFileName = "";
				if (oSelectedDocument.document && oSelectedDocument.document.getType && oSelectedDocument.document.getType() === "file") {
					sFileName = oSelectedDocument.document.getTitle();
					if (sFileName && this._isFileNameValid(sFileName)) {
						//Upload the file metedata and validate the metadata content with mock server
						Q.all(
								[ oSelectedDocument.document.getContent(),
										that.getContext().service.odataProvider.getMetadataFromWorkspace(oSelectedDocument.document) ])
								.spread(function(sContent) {
									var sEntity = oSelectedDocument.document.getEntity();
									var sBackendSrv = sap.watt.getEnv("orion_server");
									sBackendSrv = sBackendSrv.lastIndexOf("/") === 0 ? sBackendSrv : sBackendSrv.substr(0, sBackendSrv.length-1);
									var sMetadataPath = (sEntity)? sBackendSrv+ sEntity.getBackendData().location:"";
									return that._onMetadataFileUpload(sContent,sMetadataPath).then(function() {
										that.createDetailsContent().done();
									});
								}).fail(function(oError) {
									that.cleanDetailsDataGrid();
									that._throwErrorHandler(oError.message);
								}).done();
					}
				}
			},

			onPasteURLSelectButton : function(oEvent) {

				var that = this;

				// First change step state to invalid and remove validation marks (if any)
				this.fireValidation({
					isValid : false
				});

				var oDataConnectionPasteUrlInput = sap.ui.getCore().byId("DataConnectionPasteURLTextField");
				var oApiKeyTextField = sap.ui.getCore().byId("ApiKeyTextField");

				this._resetInputState(oDataConnectionPasteUrlInput);
				this._resetInputState(oApiKeyTextField);

				var sUrl = this._oGrid.getModel().getProperty("/modelData/sPasteUrlTextFieldValue");
				var bAppKeyTextFieldVisible = this._oGrid.getModel().getProperty("/modelData/bAppKeyTextFieldVisible");

				if (bAppKeyTextFieldVisible) {
					this.oPasteURLSelectedDestination.apiKey = this._oGrid.getModel().getProperty("/modelData/sAppKeyTextFieldValue")
							.trim();

					// When this function is triggered from code (and not from a real press on the button) - don't continue if the apiKey value is empty (give a chance to the user to put a value).
					// Once the api key value is filled this function will be re-triggered.	
					if (!oEvent && (!this.oPasteURLSelectedDestination.apiKey || this.oPasteURLSelectedDestination.apiKey === "")) {
						return;
					}
				}

				// Send request to get the service and change validation state and model accordingly

				//TODO check if there is a new value and only then...
				this.getContext().service.servicecatalog.getServiceConnectionData(this.oPasteURLSelectedDestination, sUrl).then(function() {
					that._markAsValid(oDataConnectionPasteUrlInput);
					that._markAsValid(oApiKeyTextField);
					that.createDetailsContent().done();
				})
						.fail(
								function(oError) {
									that.showDetailsOrData(false);
									var i18n = that.getContext().i18n;
									var oControl = oDataConnectionPasteUrlInput;
									switch (oError.status) {
									case 401:

										if (bAppKeyTextFieldVisible) {
											that._throwErrorHandler(i18n.getText("i18n",
													"serviceCatalogWizardStep_error_paste_url_unauthorizedAndApikey"));
											oControl = oApiKeyTextField;
											that._markAsValid(oDataConnectionPasteUrlInput);
										} else {
											that._throwErrorHandler(i18n.getText("i18n",
													"serviceCatalogWizardStep_error_paste_url_unauthorized"));
										}
										break;
									case 500:
										that._throwErrorHandler(i18n.getText("i18n",
												"serviceCatalogWizardStep_error_paste_url_dataSorce_problem"));
										break;
									case 403:
									default:
										that._throwErrorHandler(i18n
												.getText("i18n", "serviceCatalogWizardStep_error_paste_url_invalid_url"));
									}
									that._markAsInvalid(oControl);
									that.cleanDetailsDataGrid();
									that._oGrid.getModel().setProperty("/modelData/sServiceName", "");
								}).done();
			},

			onRepositorySelectFile : function(oEvent) {
				var sFileName = "";

				if (!oEvent || !oEvent.getParameter) {
					return;
				}
				var oRepositoryModel = this._oGrid.getModel();
				var bSelect = false;

				//check how many were selected
				var aSelectedNode = oEvent.getParameter("nodes");
				if (!aSelectedNode || aSelectedNode.length !== 1) {
					bSelect = false;
					oRepositoryModel.setProperty("/modelData/bSelect", bSelect);
				} else {
					sFileName = aSelectedNode[0].getText();
					bSelect = (sFileName && this._isFileNameValid(sFileName));
					oRepositoryModel.setProperty("/modelData/bSelect", bSelect);
				}

				if (!bSelect) {
					this.cleanDetailsDataGrid();
					this.fireValidation({
						isValid : false
					});
				} else {
					this.onRepositoryBrowserSelectButton();
				}
			},

			cleanDetailsDataGrid : function() {
				var oDetailsDataTree = sap.ui.getCore().byId("DataConnectionServiceDetailsTree");
				if (oDetailsDataTree) {
					oDetailsDataTree.removeAllNodes();
				}
				
			},

			cleanStep : function() {
				this.cleanDetailsDataGrid();
				this._cleanInputFields();
				this.getContext().service.servicecatalog.cleanGrid().done();
				this.bDoBeforeRendering = false;
				this._bDataConnectionStepDirty = false;
			},

			showDetailsOrData : function(bShow) {
				this._oGrid.getModel().setProperty("/modelData/bVisibleDetails", bShow);
			},

			renderer : {}
		});