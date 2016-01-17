define(["sap/watt/common/plugin/platform/service/ui/AbstractPart", "sap/watt/lib/lodash/lodash", "../utils/DataConnectionUtils"], function(AbstractPart, _, DataConnectionUtils) {

	var Catalog = AbstractPart.extend("sap.watt.saptoolsets.fiori.project.servicecatalog.service.Catalog", {

		_CATALOG_RDL: "river",
		_CATALOG_ODATA_ABAP: "odata_abap",
		_CATALOG_GENERIC: "odata_gen",
		_CATALOG_APIMGMT_CATALOG: "api_mgmt_catalog",
		_CATALOG_APIMGMT_PROXY: "api_mgmt_proxy",

		_oContextMenuGroup: null,
		_oCurrentSelectedDocument: null,
		_oApiManagmentEndPointDest: null,
		_dConnectionData: null,

		_oServiceCallsQueue: new Q.sap.Queue(),
		_context: null,

		configure: function(mConfig) {
			var that = this;

			if (mConfig.styles) {
				this.context.service.resource.includeStyles(mConfig.styles).done();
			}

			if (mConfig.contextMenu) {
				return this.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
					that._oContextMenuGroup = oGroup;
				});
			}
		},

		_i18n: undefined,

		_createGrid: function() {
			var that = this;

			var oData = {
				bSelectAPIStep: true,
				bSelectedApiService: false,
				bHasRelatedProduct: false,
				bSelectedProduct: false
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				modelData: oData
			});

			this.oServiceInfoAndDetailsGrid = new sap.ui.layout.Grid({
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.oServiceInfoAndDetailsGrid.setModel(oModel);
			this.oServiceInfoAndDetailsGrid.bindElement("/modelData");

			this.oGrid = new sap.ui.layout.Grid({
				hSpacing: 0,
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			}).addStyleClass("serviceCatalogMainGridBorder");

			var oServiceInformationLabel = new sap.ui.commons.Label({
				text: {
					path: "bSelectAPIStep",
					formatter: function(sValue) {
						if (sValue) {
							return that._i18n.getText("i18n", "dataConnectionWizardStep_oServiceInformationLabel");
						} else {
							return that._i18n.getText("i18n", "dataConnectionWizardStep_oAvailableProductsLabel");
						}
					}
				},
				textAligh: "Left",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			}).addStyleClass("serviceCatalogHeaderLabel");

			var oDetailsLabel = new sap.ui.commons.Label({
				text: "{i18n>dataConnectionWizardStep_apiDetailsLabel}",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				}),
				visible: {
					path: "bSelectedApiService",
					formatter: function(bVisible) {
						return bVisible;
					}
				}
			}).addStyleClass("serviceCatalogHeaderLabel");

			this.oCatalogComboBox = new sap.ui.commons.DropdownBox({
				width: "100%",
				change: [that._handleCatalogComboBox, that],
				placeholder: "{i18n>catalog_select_system_placeholder}",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				accessibleRole: sap.ui.core.AccessibleRole.Combobox,
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return bVisible;
					}
				}
			}).addStyleClass("serviceCatalogStepBottomMargin");

			//populate the connections ComboBox.
			this.populateConnections(this.oCatalogComboBox, 0);

			this.oSearchField = new sap.ui.commons.SearchField({
				enableListSuggest: false,
				enableFilterMode: true,
				enableClear: true,
				enabled: false,
				width: "100%",
				tooltip: "{i18n>service_name_or_description_search}",
				suggest: [that._doSuggest, that],
				startSuggestion: 0,
				layoutData: new sap.ui.layout.GridData({
					linebreak: true,
					span: "L12 M12 S12"
				}),
				accessibleRole: sap.ui.core.AccessibleRole.Search,
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return bVisible;
					}
				}
			}).addStyleClass("serviceCatalogStepBottomMargin");

			this.oGrid.addContent(this.oCatalogComboBox);
			this.oGrid.addContent(this.oSearchField);

			var oBackToApiListButton = new sap.ui.commons.Button({
				text: "{i18n>dataConnectionWizardStep_apiBackToApiListButton}",
				lite: true,
				icon: "sap-icon://navigation-left-arrow",
				press: function() {
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectAPIStep", true);
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedApiService", true);
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return !bVisible;
					}
				}
			}).addStyleClass("oBackToApiListButton");

			this.oGrid.addContent(oBackToApiListButton);

			this.oProductsTree = new sap.ui.commons.Tree({
				showHeader: false,
				height: "300px",
				width: "100%",
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return bVisible === false;
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				select: function() {
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedProduct", true);
				}
			}).addStyleClass("productsTree");

			this.oAPIProductsNodeTemplate = new sap.ui.commons.TreeNode({
				text: '{dataModel>name}',
				expanded: false,
				nodes: [
                    new sap.ui.commons.TreeNode({
						selectable: false,
						text: '{dataModel>description}'
					}).addStyleClass("productDescriptionNode")
                ]
			});
			this.oGrid.addContent(this.oProductsTree);

			var oApiDescriptionGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				}),
				visible: {
					path: "bSelectedApiService",
					formatter: function(bVisible) {
						return bVisible;
					}
				}
			});

			var oApiDescriptionLabel = new sap.ui.commons.Label({
				text: "{i18n>dataConnectionWizardStep_apiDescriptionLabel}",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.oApiDescriptionText = new sap.ui.commons.TextArea({
				editable: false,
				wrapping: sap.ui.core.Wrapping.Soft,
				rows: 3,
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("apiDescriptionText");

			oApiDescriptionGrid.addContent(oApiDescriptionLabel);
			oApiDescriptionGrid.addContent(this.oApiDescriptionText);

			var oSubscribeButton = new sap.ui.commons.Button({
				text: "{i18n>dataConnectionWizardStep_apiSubscribeButton}",
				press: function() {
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectAPIStep", false);
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedApiService", false);
				},
				visible: {
					path: "bSelectedApiService",
					formatter: function(bVisible) {
						return bVisible;
					}
				},
				enabled: {
					path: "bHasRelatedProduct",
					formatter: function(bEnabled) {
						return bEnabled;
					}
				}
			});

			var oSelectProductButton = new sap.ui.commons.Button({
				text: "{i18n>dataConnectionWizardStep_apiSelectProductButton}",
				press: function() {
					that._onSubscribeToProduct();
				},
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return !bVisible;
					}
				},
				enabled: {
					path: "bSelectedProduct",
					formatter: function(bEnabled) {
						return bEnabled;
					}
				}
			});

			var oSubscribeLayout = new sap.ui.layout.HorizontalLayout({
				content: [oSubscribeButton, oSelectProductButton],
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			}).addStyleClass("subscribeLayout");

			this.oServiceInfoAndDetailsGrid.addContent(oServiceInformationLabel);
			this.oServiceInfoAndDetailsGrid.addContent(oDetailsLabel);
			this.oServiceInfoAndDetailsGrid.addContent(this.oGrid);
			this.oServiceInfoAndDetailsGrid.addContent(oApiDescriptionGrid);
			this.oServiceInfoAndDetailsGrid.addContent(oSubscribeLayout);

		},

		_resetTreeFields: function() {
			if (this.oTree) {
				this.oGrid.removeContent(this.oTree);
				this.nodes = undefined;
				this.oSearchField.setValue("");
				this._markAsDisabled(this.oSearchField, true);
				this.context.event.fireValidateNextSent({
					bNextEnabled: false,
					message: "",
					severity: ""
				}).done();
			}
		},

		/**
		 * This method populates the destinations.
		 * @param {object}		oListControl			ui list control object
		 * @param {Number}		iDataConnectionType		number of data connection types
		 */
		populateConnections: function(oListControl, iDataConnectionType) {
			var that = this;

			this.context.event.fireRequestSent().done();
			this.context.service.destination.getDestinations().then(function(aDestinations) {
				//Save the End Point Destination for feature use
				_.forEach(aDestinations, function(oDestination) {
					if (oDestination.wattUsage === that._CATALOG_APIMGMT_PROXY) {
						that._oApiManagmentEndPointDest = oDestination;
						return false;
					}
				});

				oListControl.addItem(new sap.ui.core.ListItem({
					text: ""
				}).data("connection", undefined));

				that._getFormatterConnections(aDestinations, iDataConnectionType).forEach(function(oConnection) {
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
				that._throwValidate(oError);
			}).fin(function() {
				that.context.event.fireRequestCompleted().done();
			});
		},

		_markAsDisabled: function(oTextField, bEnabled) {
			oTextField.setEnabled(!bEnabled);
		},

		_onBeforeClose: function(oNode) {
			if (!oNode || !oNode.data) {
				return;
			}
			//Clean previous error message for another service
			this.context.event.fireValidateNextSent({
				bNextEnabled: false,
				sMessage: "",
				severity: ""
			}).done();

			if (this._oConnectionDetails.wattUsage === this._CATALOG_ODATA_ABAP) {
				this._handleOnBeforeCloseOData(oNode);
			} else if (this._oConnectionDetails.wattUsage === this._CATALOG_APIMGMT_CATALOG) {
				this._handleOnSelectedForApiMgm(oNode);
			}
		},
		
		/**
		 * This method gets service destination data according to connection and URL.
		 * It's called for paste URL and handles genric/rdl/odata
		 * @param {object}		oConnection		connection data object
		 * @param {string}		sUrl			connection URL
		 */
		getServiceConnectionData: function(oConnection, sUrl) {
			var that = this;
			var oHeaders = [];
			var oConnectionDestination = oConnection.destination;

		    var sBaseUrl = DataConnectionUtils.getUrlPath(sUrl);
		    var sNewUrl = DataConnectionUtils.getDesigntimeUrl(oConnectionDestination, sBaseUrl);

			// use proxy prefix for rdl if exist
			if (oConnectionDestination.wattUsage === this._CATALOG_ODATA_ABAP) {
				sUrl = sNewUrl;
			}

			// update proxy prefix for generic services
			var sRuntimeUrl = DataConnectionUtils.getRuntimeUrl(sBaseUrl, oConnectionDestination);
			if (oConnectionDestination.wattUsage === this._CATALOG_GENERIC) {
				sRuntimeUrl = sNewUrl;
			}

			if (oConnection.isApimgmt) {
				oHeaders.apiKey = oConnection.apiKey;
			}
			this.context.event.fireRequestSent().done();
			sNewUrl = sNewUrl.charAt(sNewUrl.length - 1) !== "/" ? sNewUrl + "/" : sNewUrl;
			
			return this._callAjax(sNewUrl + "$metadata", "GET", null, "text", oHeaders).then(function(data) {
				return that.context.service.csdlParser.parse(data[0], null, null).then(function(oAst) {
					return that.context.service.astLibrary.getRiverAstLibrary(oAst.response[0]).then(function(oAstASLib) {
						return that.context.event.fireServiceSelectionCompleted({
							connectionData: {
								serviceName: "",
								metadata: oAstASLib,
								runtimeUrl: sRuntimeUrl,
								url: sUrl,
								type: that._CATALOG_RDL,
								destination: oConnectionDestination,
								metadataContent: DataConnectionUtils.removeAbsoluteURL(data[0],oConnectionDestination.url),
								apiKey: oConnection.apiKey
							}
						});
					});
				}).fail(function(){
					that._throwValidate(new Error (that._i18n.getText("i18n", "serviceCatalogWizardStep_could_not_parse_file")));
				});
			}).fail(function(oXHR) {
				that._throwValidate(new Error(oXHR.statusText));
			}).fin(function() {
				that.context.event.fireRequestCompleted().done();
			});
		},

		_handleOnSelectedForApiMgm: function(oNode) {
			//In case one of the parameters is missing, the selected node isn't a service so the catalog isn't closed
			if (!oNode.data('APIProxy')) {
				return;
			}

			var that = this;
			this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedProduct", false);
			this.oApiDescriptionText.setValue(oNode.data("Description"));
			var sUrl = this._oConnectionDetails.url;
			var sProductsUrl = oNode.data("APIProxy") + "?$expand=ToProxyEndPoints,ToAPIProducts";
			this.context.event.fireRequestSent().done();
			var sNewUrl = sUrl[sUrl.length - 1] === '/' ? sUrl + sProductsUrl : sUrl + "/" + sProductsUrl;

			var oModel = new sap.ui.model.json.JSONModel();
			//var deferred = Q.defer();

			this._oServiceCallsQueue.next(function() {
				that._callAjax(sNewUrl, "GET", null, "json").then(function(data, textStatus, jqXHR) {
					oModel.setData(data[0]);
					that.oProductsTree.setModel(oModel, "dataModel");
					that.oProductsTree.bindNodes("dataModel>/d/ToAPIProducts/results", that.oAPIProductsNodeTemplate, null, [new sap.ui.model.Filter({
						test: function() {
							return true;
						},
						path: "name"
					})]);
					var bHasRelatedProduct = data[0].d.ToAPIProducts.results.length > 0;
					if (!bHasRelatedProduct) {
						var sNoProductMessage = that._i18n.getText("i18n", "catalogService_No_Products_for_API_Proxy");
						that._throwValidate(new Error(sNoProductMessage), "info");
						//             that.context.event.fireValidateNextSent({
						// bNextEnabled: false,
						// message: sNoProductMessage,
						// severity : "info"
						// }).done;

					}
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bHasRelatedProduct", bHasRelatedProduct);
					that.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedApiService", true);
					oNode.data("ServiceUrl", data[0].d.ToProxyEndPoints.results[0].base_path); //ugly but saves round trip 
					sap.ui.getCore().getEventBus().publish("servicecatalog", "requestCompleted");
				}).fail(function(jqXHR) {
					that._errorHandler(new Error(jqXHR.statusText), oNode);
				}).fin(function() {
					that.context.event.fireRequestCompleted().done();
				});
			});

		},

		_handleOnBeforeCloseOData: function(oNode) {
			//In case one of the parameters is missing, the selected node isn't a service so the catalog isn't closed
			if (!oNode.data('ServiceUrl')) {
				return;
			}

			var that = this;
			var sUrl = oNode.data("ServiceUrl");
			var sServiceName = oNode.data("serviceName");
			this.context.event.fireRequestSent().done();

			var sNewUrl = sUrl[sUrl.length - 1] === '/' ? URI(sUrl + "$metadata").path() : URI(sUrl + "/$metadata").path();
			if (sNewUrl.indexOf(this._oConnectionDetails.url) === -1) {
				sNewUrl = sNewUrl.replace(this._oConnectionDetails.path, this._oConnectionDetails.url);
			}
			
			/*
			// SWITCH
			this._oServiceCallsQueue.next(function() {
				return that._getODataServiceMetadata(sUrl).then(function() {
					return that.context.event.fireServiceSelectionCompleted({
						connectionData: {
							serviceName: sServiceName,
							metadata: that._oMetadata,
							runtimeUrl: DataConnectionUtils.getRuntimeUrl(sUrl, that._oConnectionDetails),
							url: sUrl,
							type: that._CATALOG_RDL,
							destination: that._oConnectionDetails,
							metadataContent: DataConnectionUtils.removeAbsoluteURL(that._sMetadataXml,that._oConnectionDetails.url),
							sPath : oNode.getBindingContext().getPath()
							//add support to sap client
						}
					});
				}).fail(function(jqXHR) {
					that._errorHandler(new Error(jqXHR.statusText), oNode);
				}).fin(function() {
					that.context.event.fireRequestCompleted().done();
				});
			});	
			*/
			
			this._oServiceCallsQueue.next(function() {
				that._callAjax(sNewUrl, "GET", null, "text").then(function(data, textStatus, jqXHR) {
					return that.context.service.csdlParser.parse(data[0]).then(function(oAst) {
						return that.context.service.astLibrary.getRiverAstLibrary(oAst.response[0]).then(function(oAstASLib) {
								return that.context.event.fireServiceSelectionCompleted({
									connectionData: {
										serviceName: sServiceName,
										metadata: oAstASLib,
										runtimeUrl: DataConnectionUtils.getRuntimeUrl(sUrl, that._oConnectionDetails),
										url: sUrl,
										type: that._CATALOG_RDL,
										destination: that._oConnectionDetails,
										metadataContent: DataConnectionUtils.removeAbsoluteURL(data[0],that._oConnectionDetails.url),
										sPath : oNode.getBindingContext().getPath()
										//add support to sap client
									}
							});
						});
					}).fail(function(){
						that._throwValidate(new Error(that._i18n.getText("i18n", "serviceCatalogWizardStep_could_not_parse_file")));
					});
				}).fail(function(jqXHR) {
					that._errorHandler(new Error(jqXHR.statusText), oNode);
				}).fin(function() {
					that.context.event.fireRequestCompleted().done();
				});
			});
		},

		_handleCatalogComboBox: function(oEvent) {
			this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedApiService", false);
			if (!oEvent.getParameter("selectedItem") || oEvent.getParameter("selectedItem").getText() === "") {
				this._resetTreeFields();
				return;
			}
			var oConnection = oEvent.getParameter("selectedItem").data("connection");
			if (oConnection) {
				this._populateServicesTree(oConnection);
				this._oConnectionDetails = oConnection.destination;
				this._sConnectionUrl = oConnection.url;
			}
		},

		_populateServicesTree: function(oConnection) {
			var that = this;

			this._resetTreeFields();
			this.context.event.fireRequestSent().done();
			if (!oConnection) {
				return;
			}
			this.getCatalog(oConnection).then(function(tree) {
				that.oTree = tree;
				that.oTree.attachBrowserEvent("contextmenu", that._onRightClick, that);
				that.oTree.attachBrowserEvent("dblclick", that._onSelectedTreeNode, that);
				tree.setLayoutData(new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}));
				tree.setShowHeader(false);
				tree.addStyleClass("serviceCatalogStepBottomMargin");
				that.oGrid.addContent(tree);
				that.context.event.fireRequestCompleted().done();
				that._markAsDisabled(that.oSearchField, false);
			}).fail(function(oError) {
				that._throwValidate(oError);
				that.context.event.fireRequestCompleted().done();
			}).done();
		},

		_onRightClick: function(event) {
			event.preventDefault();
			var element = event.target;
			while (element && !element.attributes["id"]) {
				element = element.parentElement;
			}
			if (element && element.attributes["id"]) {
				var sId = element.attributes["id"].value;
				var oNode = sap.ui.getCore().byId(sId);
				this.setCurrentSelectedDocument(oNode);
				this.context.service.contextMenu.open(this._oContextMenuGroup, event.pageX, event.pageY).done();
			}
		},

		_onAPIServiceToggle: function(oEvent) {
			var toggledNode = oEvent.getSource();
			//TBD - REquires new api for getting the API metadata
		},

		_onServiceToggle: function(oEvent) {
			var that = this;
			var toggledNode = oEvent.getSource();
			if (toggledNode.getNodes() && toggledNode.getNodes().length === 0) {
				this.context.event.fireRequestSent().done();
				if (this._oConnectionDetails.wattUsage === this._CATALOG_ODATA_ABAP) {
					var selectedServiceUrl = toggledNode.data("ServiceUrl");
					var selectedServiceClient = toggledNode.data("sap_client");

					if (selectedServiceUrl.indexOf(this._oConnectionDetails.url) === -1) {
						selectedServiceUrl = selectedServiceUrl.replace(this._oConnectionDetails.path, this._oConnectionDetails.url);
					}

					var sRelativePath = URI(selectedServiceUrl).path();
					var oMetadata = toggledNode.data('metadata');

					if (!oMetadata) {
						this._oServiceCallsQueue.next(function() {
							that.context.service.odataProvider.getMetadata(sRelativePath, selectedServiceClient).then(
								function(oMetadata) {
									toggledNode.data("metadata", oMetadata);
									require(["sap.watt.saptoolsets.fiori.project.servicecatalog/providers/ODataTreeNodesProvider"], function(
										ODataTreeNodesProvider) {
										try {
											ODataTreeNodesProvider.getCatalogServiceTreeNodes(oMetadata,
												that.context.service.odataProvider, that.context.i18n).forEach(function(oNode) {
												toggledNode.addNode(oNode);
											});
										} catch (oError) {
											that._errorHandler(oError, toggledNode);
										}
									}, that._throwValidate);
								}).fail(function(oError) {
								that._errorHandler(oError, toggledNode);
							}).fin(function() {
								that.context.event.fireRequestCompleted().done();
							});
						});
					}
				}
			}
		},

		_doSuggest: function(oEvent) {
			if (!this.nodes) {
				this.nodes = this.oTree.getNodes();
			}
			var that = this;
			this.oTree.removeAllNodes();
			this.nodes.forEach(function(node) {
				if (node.getText().toLowerCase().indexOf(oEvent.getParameter('value').toLowerCase()) !== -1) {
					that.oTree.addNode(node);
				}
			});
		},

		_errorHandler: function(oError, oControl) {
			var sErrorMsg = "";
			if (oControl.getHasExpander()) {
				//FIXME correct for UI5 1.20.3
				if (oError && oError.response && oError.response.statusText) {
					sErrorMsg = oError.response.statusText;
				} else {
					//FIXME correct for UI5 1.22.14
					if (oError.statusText) {
						sErrorMsg = oError.statusText;
					} else {
						sErrorMsg = oError.message;
					}
				}
				//this.oCatalogSelectButton.setEnabled(false);
				oControl.setIsSelected(false);
				oControl.setSelectable(false);
				oControl.addStyleClass("serviceCatalogTreeNode");
				oControl.setText(oControl.getText());
				oControl.setHasExpander(false);
				oControl.data('ServiceUrl', undefined);
				oControl.data('APIProxy', undefined);
				this.context.event.fireValidateNextSent({
					bNextEnabled: false,
					sMessage: sErrorMsg,
					severity: ""
				}).done();
			}
		},

		_throwValidate: function(oError, severity) {

			var sErrorMsg = "";
			if (!oError.status || oError.status !== 401) {
				sErrorMsg = this._i18n.getText("i18n", "odata_request_failed");
			}

			if (oError.detailedMessage) {
				sErrorMsg = oError.detailedMessage;
			}

			if (oError.message) {
				sErrorMsg = oError.message;
			}
			if (!severity) {
				severity = "";
			}
			// Fire event to ServiceCatalogWizardStep to ebable/disable next button + error msg
			this.context.event.fireValidateNextSent({
				bNextEnabled: false,
				sMessage: sErrorMsg,
				severity: severity
			}).done();
		},

		//Update the internal object used to save required data on each connection
		_getFormatterConnections: function(aDestinations, iDataConnectionType) {
			var that = this;
			var aFormattedDestinations = [];
			if (aDestinations) {
				if (iDataConnectionType === 3) {
					aFormattedDestinations = DataConnectionUtils.getFormatterConnections(aDestinations, [this._CATALOG_ODATA_ABAP, this._CATALOG_GENERIC]);
				}
				else {
					aFormattedDestinations = DataConnectionUtils.getFormatterConnections(aDestinations, [this._CATALOG_ODATA_ABAP, this._CATALOG_APIMGMT_CATALOG]);
				}

				aFormattedDestinations.forEach(function(oDestination) {
					if (oDestination.type === that._CATALOG_ODATA_ABAP && !oDestination.isFullUrl) {
						oDestination.url = oDestination.url + "/IWFND/CATALOGSERVICE;v=2";
					}
				});
			}
			return aFormattedDestinations;
		},

		//Enable Next button after selection of service
		_onSelectedTreeNode: function(oEvent) {
			if (oEvent && oEvent.getSource && !!(oEvent.getSource().data("ServiceUrl") || (oEvent.getSource().data("RDLApplicationName")) && (
				oEvent
				.getSource().data("RDLPackage")) || (oEvent.getSource().data("serviceName")) || (oEvent.getSource().data("APIProxy")))) {
				this._onBeforeClose(oEvent.getSource());
			}
		},

		_onSubscribeToProduct: function() {
			var that = this;
			var node = this.oProductsTree.getSelection();
			var sProductName = node.getText();
			var apiNode = this.oTree.getSelection();
			var sApiServiceUrl = apiNode.data("ServiceUrl");
			var sServiceName = apiNode.data("ServiceName");
			var deferred = Q.defer();
			//extract api name from proxy endpoint url        
			var aApiServiceUrl = sApiServiceUrl.split("/");
			var iDomainAndPortLength = aApiServiceUrl.splice(0, 3).join("").length + 3;
			if (!that._oApiManagmentEndPointDest) {
				that._throwValidate(new Error(that._i18n.getText("i18n", "catalogService_No_Destination_for_API_Endpoint")));
				return;
			}
			var sServiceUrl = that._oApiManagmentEndPointDest.url + '/' + sApiServiceUrl.substring(iDomainAndPortLength);

			this.context.event.fireRequestSent().done();

			var appName = (this._context) ? this._context.appName : "";
			var mData = {
				"id": "0",
				"version": "1",
				"title": appName,
				"ToAPIProductsDetails": [{
						"__metadata": {
							"uri": "APIMgmt.APIProducts('" + sProductName + "')"
						}
                        }
                    ]
			};

			var apiMgmtAppsUrl = this._oConnectionDetails.url + "/APIMgmt.Applications";
			//TODO change to odatamodel call
			this._callAjax(apiMgmtAppsUrl, "POST", mData, "json").then(function(data) {
				var sAppId = data[0].d.id;
				var appUrl = apiMgmtAppsUrl + "('" + sAppId + "')";
				//Fetches the apiKey and ApiSecret after subscribing
				that._callAjax(appUrl, "GET", null, "json").then(function(appData) {
					that.appKey = appData[0].d.app_key;
					that.appSecret = appData[0].d.app_secret;
					var headers = {
						APIKey: that.appKey,
						appSecret: that.appSecret
					};
					//get metadata from API proxy endpoint
					that._callAjax(sServiceUrl + "/$metadata", "GET", null, "text", headers).then(function(res) {
						return that.context.service.csdlParser.parse(res[0]).then(function(oAst) {
							return that.context.service.astLibrary.getRiverAstLibrary(oAst.response[0]).then(function(oAstASLib) {
								return that.context.event.fireServiceSelectionCompleted({
									connectionData: {
										serviceName: sServiceName,
										productName: sProductName,
										metadata: oAstASLib,
										runtimeUrl: sServiceUrl,
										url: sServiceUrl,
										apiKey: that.appKey,
										appSecret: that.appSecre,
										type: that._CATALOG_RDL,
										destination: that._oApiManagmentEndPointDest,
										metadataContent:  DataConnectionUtils.removeAbsoluteURL(res[0],that._oApiManagmentEndPointDest.url)
									}
								});
							});
						}).fail(function(){
							that._throwValidate(new Error(that._i18n.getText("i18n", "serviceCatalogWizardStep_could_not_parse_file")));
						});
					}).fail(function(jqXHR) {
						that._throwValidateror(new Error(jqXHR.statusText));
						var oError = new Error(that._i18n.getText("i18n", "ajax_request_failed", [jqXHR.statusText]));
						deferred.reject(oError);
					}).fin(function() {
						that.context.event.fireRequestCompleted().done();
					});
				});
			}).fail(function(oXHR) {
				that._throwValidate(new Error(oXHR.statusText));
				var oError = new Error(that._i18n.getText("i18n", "ajax_request_failed", [oXHR.statusText]));
				that._setXHRDataToError(oError, oXHR);
				deferred.reject(oError);
			}).done();
			return deferred.promise;
		},

		_getAPIMgmtCatalog: function(oConnection) {
			var that = this;
			var oODataNodeTemplate = new sap.ui.commons.TreeNode({
				text: {
					parts: ["proxiesModel>title", "proxiesModel>description", "proxiesModel>version"],
					formatter: function(sTitle, sDescription, sVersion) {
						return sTitle + " [" + sDescription + "]" + "         version " + sVersion;
					}
				},
				expanded: false,
				hasExpander: false,
				selected: [that._onSelectedTreeNode, that],
				toggleOpenState: [that._onAPIServiceToggle, that]
			}).data("APIProxy", "APIMgmt.APIProxies('" + "{proxiesModel>name}" + "')").data("Description", "{proxiesModel>description}").data(
				"ServiceName", "{proxiesModel>name}");

			var oModel = new sap.ui.model.json.JSONModel();
			var deferred = Q.defer();
			var sAPIProxiesUrl = oConnection.url + "/APIMgmt.APIProxies";
			this._callAjax(sAPIProxiesUrl, "GET", null, "json").then(function(data) {
				oModel.setData(data[0]);
				that.oTree.setModel(oModel, "proxiesModel");
				that.oTree.bindNodes("proxiesModel>/d/results", oODataNodeTemplate, null, [new sap.ui.model.Filter({
					test: function() {
						return true;
					},
					path: "name"
				})]);
				if (that.oSearchField) {
					that._markAsDisabled(that.oSearchField, false);
				}
				sap.ui.getCore().getEventBus().publish("servicecatalog", "requestCompleted");
				deferred.resolve(that.oTree);
			}).fail(function(oXHR) {
				that._throwValidate(new Error(oXHR.statusText));
				var oError = new Error(that._i18n.getText("i18n", "ajax_request_failed", [oXHR.statusText]));
				that._setXHRDataToError(oError, oXHR);
				deferred.reject(oError);
			}).done();
			return deferred.promise;
		},

		// SWITCH
		_getODataServiceMetadata: function(sUrl, serviceDeffered) {

			var that = this;

			var deferred = serviceDeffered;
			if (!deferred) {
				deferred = Q.defer();
			}

			var oServiceODtataModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
			this._sMetadataXml = oServiceODtataModel.oServiceData.oMetadata.sMetadataBody;
			this._oMetadata = null;

			oServiceODtataModel.attachMetadataFailed(function() {					
				var iStatusCode = arguments[0].getParameters().statusCode;
				if (iStatusCode === 403) {
					that._getODataCatalog(sUrl, deferred);
				} else {
					var msg = that._i18n.getText("i18n", "odata_request_failed");
					var status = 401;
					var oError = new Error(msg);
					oError.status = status;
					deferred.reject(oError);
				}
			});
			oServiceODtataModel.attachMetadataLoaded(function() {
				that._oMetadata = oServiceODtataModel.getServiceMetadata();
				deferred.resolve();
			});
			
			return deferred.promise;
		},

		_getODataCatalog: function(oConnection, catalogDeferred) {

			var that = this;
			var oODataNodeTemplate = new sap.ui.commons.TreeNode({
				text: {
					parts: ["Title", "Description"],
					formatter: function(sTitle, sDescription) {
						return sTitle + " [" + sDescription + "]";
					}
				},
				expanded: false,
				hasExpander: true,
				selected: [that._onSelectedTreeNode, that],
				toggleOpenState: [that._onServiceToggle, that]
			}).data("ServiceUrl", {
				parts: ["ServiceUrl"],
				formatter: function(serviceUrl) {
					return URI(serviceUrl).path();
				}
			}).data("serviceName", "{Title}");

			var oModel = new sap.ui.model.odata.ODataModel(oConnection.url, true, null, null, {}, false, false, true);
			oModel.setSizeLimit(2000);
			this.oTree.setModel(oModel);

			var deferred = catalogDeferred;
			if (!deferred) {
				deferred = Q.defer();
			}

			oModel.attachRequestCompleted(function(oEvent) {
				if (!oEvent.getParameter("success")) {
					var oError = new Error(that._i18n.getText("i18n", "serviceCatalog_request_failed"));
					oError.status = 404;
					deferred.reject(oError);
				}
				if (that.oSearchField) {
					that._markAsDisabled(that.oSearchField, false);
				}
				sap.ui.getCore().getEventBus().publish("servicecatalog", "requestCompleted");
				deferred.resolve(that.oTree);
			});
			oModel.attachMetadataFailed(function() {
				var iPos = oConnection.url.indexOf(";v=");
				var iStatusCode = arguments[0].getParameters().statusCode;
				if (iPos > -1 && iStatusCode === 403) {
					oConnection.url = oConnection.url.substring(0, iPos);
					that._getODataCatalog(oConnection, deferred);
				} else {
					var bIsFullUrl = oConnection.isFullUrl;
					var msg,status;
					if(iStatusCode === 404 && bIsFullUrl){
						msg = that._i18n.getText("i18n", "odata_full_url_request_failed");
						status = iStatusCode;
					}else{
						msg = that._i18n.getText("i18n", "odata_request_failed");
						status = 401;
					}
					var oError = new Error(msg);
					oError.status = status;
					deferred.reject(oError);
				}
			});
			oModel.attachMetadataLoaded(function() {
				that.oTree.bindNodes({
					path: '/ServiceCollection',
					template: oODataNodeTemplate,
					parameters: {
						navigation: {}
					}
				});
			});
			return deferred.promise;
		},

		_getRDLCatalog: function(oConnection) {
			var that = this;
			var oRDLNodeTemplate = new sap.ui.commons.TreeNode({
				text: {
					parts: ["name", "pkg"],
					formatter: function(sName, sPackage) {
						return sName + " [" + sPackage + "]";
					}
				},
				selected: [that._onSelectedTreeNode, that],
				expanded: false,
				hasExpander: true,
				toggleOpenState: [that._onServiceToggle, that]
			}).data("RDLApplicationName", "{name}").data("RDLPackage", "{pkg}");

			var oModel = new sap.ui.model.json.JSONModel();
			var deferred = Q.defer();

			this._callAjax(oConnection.url + "/sap/hana/rdl/catalog/service/search?exp=*", "GET", null).then(function(oResponse) {
				oModel.setData(oResponse[0]);
				that.oTree.setModel(oModel);
				that.oTree.bindNodes("/d/results", oRDLNodeTemplate);
				if (that.oSearchField) {
					that._markAsDisabled(that.oSearchField, false);
				}
				sap.ui.getCore().getEventBus().publish("servicecatalog", "requestCompleted");
				deferred.resolve(that.oTree);
			}).fail(function(oXHR) {
				that._throwValidate(new Error(oXHR.statusText));
				var oError = new Error(that._i18n.getText("i18n", "ajax_request_failed", [oXHR.statusText]));
				that._setXHRDataToError(oError, oXHR);
				deferred.reject(oError);
			}).done();
			return deferred.promise;
		},

		_callAjax: function(sUrl, sType, oData, sDataType, oHeaders) {
			if (!oHeaders) {
				oHeaders = {};
			}

			//for all destinations add content-type
			oHeaders["Content-Type"] = "application/json";
			if (oHeaders["apiKey"] !== undefined) {
				oHeaders["Cache-Control"] = "no-cache";
				oHeaders["no-store"] = "must-revalidate";
			}
			//in case post msg - get xcsrf first
			if (sType == "POST") {
				oHeaders["X-CSRF-Token"] = "Fetch";
				return Q.sap.ajax({
					type: "GET",
					url: sUrl,
					headers: oHeaders,
					dataType: sDataType,
					beforeSend: function(xhr) {
						xhr.setRequestHeader('X-Requested-With', {
							toString: function() {
								return '';
							}
						});
					}
				}).then(function(res) {
					oHeaders["X-CSRF-Token"] = res[1].getResponseHeader("X-CSRF-Token");

					return Q.sap.ajax({
						type: sType,
						url: sUrl,
						data: JSON.stringify(oData),
						headers: oHeaders,
						dataType: sDataType,
						beforeSend: function(xhr) {
							xhr.setRequestHeader('X-Requested-With', {
								toString: function() {
									return '';
								}
							});
						}
					});
				});
			} else {
				//not a post msg
				return Q.sap.ajax({
					type: sType,
					url: sUrl,
					data: oData ? JSON.stringify(oData) : null,
					headers: oHeaders,
					dataType: sDataType,
					beforeSend: function(xhr) {
						xhr.setRequestHeader('X-Requested-With', {
							toString: function() {
								return '';
							}
						});
					}
				});
			}
		},
		
		_setXHRDataToError : function(oError, oXHR) {
			oError.status = oXHR.status;
			oError.statusText = oXHR.statusText;
			oError.responseText = oXHR.responseText;
			oError.responseJSON = oXHR.responseJSON;
		},

		getContent: function() {
			this._i18n = this.context.i18n;
			if (!this.oServiceInfoAndDetailsGrid) {
				this._createGrid();
				this.context.service.focus.attachFocus(this.context.self).done();
			}

			this._i18n.applyTo(this.oServiceInfoAndDetailsGrid);
			return this.oServiceInfoAndDetailsGrid;
		},

		/**
		 * This method sets the selected node of the tree to be the given node.
		 * @param {object}		oSelection		selected node of the tree
		 */
		setSelectedNode: function(oSelection) {
			return this._onBeforeClose(oSelection);
		},

		/**
		 * This method sets the context in which this service runs on.
		 * @param {object}		oContext		current context
		 */
		setServiceContext: function(oContext) {
			this._context = oContext;
		},

		/**
		 * This method returns a catalog tree based on the given destination.
		 * @param 	{object}	oConnection			connection data object
		 * @returns {object}	a catalog tree
		 */
		getCatalog: function(oConnection) {
			//create a tree
			this.oTree = new sap.ui.commons.Tree({
				showHeaderIcons: false,
				height: "300px",
				width: "100%",
				visible: {
					path: "bSelectAPIStep",
					formatter: function(bVisible) {
						return bVisible;
					}
				}
			});
			//Change search field to disabled
			if (this.oSearchField) {
				this._markAsDisabled(this.oSearchField, true);
			}
			sap.ui.getCore().getEventBus().publish("servicecatalog", "requestSent");

			if (oConnection.type === this._CATALOG_RDL) {
				return this._getRDLCatalog(oConnection);
			} else if (oConnection.type === this._CATALOG_ODATA_ABAP) {
				return this._getODataCatalog(oConnection);
			} else if (oConnection.type === this._CATALOG_APIMGMT_CATALOG) {
				return this._getAPIMgmtCatalog(oConnection);
			}
		},

		/**
		 * This method removes the selection from the catalog tree ant collapses it.
		 */
		cleanSelection: function() {
			if (this.oTree) {
				this.oTree.collapseAll();
				if (this.oTree.getSelection()) {
					this.oTree.getSelection().setIsSelected(false);
				}
			}
			if (this.oProductsTree) {
				this.oProductsTree.collapseAll();
				if (this.oProductsTree.getSelection()) {
					this.oProductsTree.getSelection().setIsSelected(false);
				}
			}
			if (this.oServiceInfoAndDetailsGrid) {
				this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedApiService", false);
				this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectAPIStep", true);
				this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bHasRelatedProduct", false);
				this.oServiceInfoAndDetailsGrid.getModel().setProperty("/modelData/bSelectedProduct", false);
			}
		},

		//FIXME this is a workaround because of the wizard destroy method
		cleanGrid: function() {
			this.cleanSelection();
			this.oServiceInfoAndDetailsGrid = undefined;

		},

		getFocusElement: function() {
			return this.oServiceInfoAndDetailsGrid;
		},

		getSelection: function(oDocument) {
			return this._oCurrentSelectedDocument;
		},

		setCurrentSelectedDocument: function(oDocument) {
			if (!oDocument) {
				this._oCurrentSelectedDocument = null;
			} else {
				this._oCurrentSelectedDocument = {
					document: oDocument
				};
			}
			this.context.event.fireSelectionChanged().done();
		}
	});

	return Catalog;

});