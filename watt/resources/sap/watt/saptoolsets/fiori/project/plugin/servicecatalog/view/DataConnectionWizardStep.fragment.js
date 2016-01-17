sap.ui
	.jsfragment(
	"sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.view.DataConnectionWizardStep", {

		createContent: function(oController) {
			var oDataConnectionsGrid = new sap.ui.layout.Grid({
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

            var oSourcesGrid = new sap.ui.layout.Grid({
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L2 M2 S2"
				})
            });

			var oSourcesLabel = new sap.ui.commons.Label({
				text: "{i18n>dataConnectionWizardStep_oSourcesLabel}",
				textAligh: "Left",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("serviceCatalogHeaderLabel");

			var oServiceCatalogListItem = new sap.ui.core.ListItem({
				text: "{i18n>dataConnectionWizardStep_service_catalog}",
				width: "100%"
			});

			var oRepositoryBrowserListItem = new sap.ui.core.ListItem({
				text: "{i18n>dataConnectionWizardStep_repository_browser}",
				width: "100%"
			});

			var oFileSystemListItem = new sap.ui.core.ListItem({
				text: "{i18n>dataConnectionWizardStep_file_system}",
				width: "100%"
			});

			var oPasteURLListItem = new sap.ui.core.ListItem({
				text: "{i18n>dataConnectionWizardStep_paste_URL}",
				width: "100%"
			});

			var oSelectorListBox = new sap.ui.commons.ListBox("DataConnectionListBox", {
				width: "100%",
				select: [oController._onDataConnectionSelect, oController],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				items: [oServiceCatalogListItem, oRepositoryBrowserListItem, oFileSystemListItem, oPasteURLListItem]
			});

			oSourcesGrid.addContent(oSourcesLabel);
			oSourcesGrid.addContent(oSelectorListBox);

			oDataConnectionsGrid.addContent(oSourcesGrid);

            var oServiceInfoAndDetailsGrid = new sap.ui.layout.Grid("ServiceInfoAndDetailsGrid",{
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L10 M10 S10"
				}),
				visible: {
					parts: ["bVisibleServiceInfoAndDetailGrid"],
					formatter: function(bVisible) {
						return bVisible;
					}
				}
            });

			var oServiceInformationLabel = new sap.ui.commons.Label({
				text: "{i18n>dataConnectionWizardStep_oServiceInformationLabel}",
				textAligh: "Left",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			}).addStyleClass("serviceCatalogHeaderLabel");
			

			var oDetailsLabel = new sap.ui.commons.Label({
				text: "{i18n>dataConnectionWizardStep_oDetailsLabel}",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				}),
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum", "bVisibleDetails"],
					formatter: function(index, mSelectionEnum, bVisible) {
						return !!mSelectionEnum && (index !== mSelectionEnum.ServiceCatalog) && bVisible;
					}
				}
			}).addStyleClass("serviceCatalogHeaderLabel");

			//Create data section grid
			var oConnectionMainGrid = new sap.ui.layout.Grid({
				vSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			}).addStyleClass("serviceCatalogFileUploaderTextField");
			
			//Create details grid
			var oDetailsGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				})
			});
			
			oServiceInfoAndDetailsGrid.addContent(oServiceInformationLabel);
			oServiceInfoAndDetailsGrid.addContent(oDetailsLabel);
			oServiceInfoAndDetailsGrid.addContent(oConnectionMainGrid);
			oServiceInfoAndDetailsGrid.addContent(oDetailsGrid);
			
			oDataConnectionsGrid.addContent(oServiceInfoAndDetailsGrid);
			
			this._addServiceCatalogContent(oDataConnectionsGrid, oController);
			this._addRepositoryBrowserContent(oConnectionMainGrid, oController);
			this._addFileSystemContent(oConnectionMainGrid, oController);
			this._addPasteURLContent(oConnectionMainGrid, oController);
			this._addDetailsTree(oDetailsGrid, oController);

			return oDataConnectionsGrid;
		},

		//Details or data grid
		_addDetailsTree: function(oGrid, oController) {

			var oServiceTree = new sap.ui.commons.Tree("DataConnectionServiceDetailsTree",{
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				showHeader: false,
				showHeaderIcons: false,
				selectionMode: sap.ui.commons.TreeSelectionMode.None
			});

			var oDetailsDataVisibilityContainer = new sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer({
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum", "bVisibleDetails"],
					formatter: function(index, mSelectionEnum, bVisible) {
						return !!mSelectionEnum && (index === mSelectionEnum.FileSystem || index === mSelectionEnum.RepositoryBrowser || index ===
							mSelectionEnum.ServiceCatalog || index === mSelectionEnum.PasteURL) && bVisible;
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oServiceTree]
			});
			oGrid.addContent(oDetailsDataVisibilityContainer);
		},

		_addFileSystemContent: function(oGrid, oController) {
			var oFileUploader = new sap.ui.commons.FileUploader("DataConnectionFileUploader", {
				value: "{sFileUploaderText}",
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum"],
					formatter: function(index, mSelectionEnum) {
						return !!mSelectionEnum && index === mSelectionEnum.FileSystem;
					}
				},
				change: [oController._onFileUploaderChange, oController],
				uploadOnChange: true,
				width: "100%",
				sendXHR : true,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("serviceCatalogFileUploader");
			oGrid.addContent(oFileUploader);

		},

		_addPasteURLContent: function(oGrid, oController) {

			var oPasteURLComboBox = new sap.ui.commons.DropdownBox("DataConnectionPasteURLDestinationsComboBox", {
				width: "100%",
				value: "{sPasteURLComboBoxValue}",
				change: [oController._onDestinationComboBoxChange, oController],
				placeholder: "{i18n>dataConnectionWizardStep_select_system}",
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum"],
					formatter: function(index, mSelectionEnum) {
						return !!mSelectionEnum && index === mSelectionEnum.PasteURL;
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			}).addStyleClass("serviceCatalogStepBottomMargin");
			oGrid.addContent(oPasteURLComboBox);

			var oPasteUrlTextField = new sap.ui.commons.TextField("DataConnectionPasteURLTextField", {
				width: "100%",
				placeholder: "{i18n>dataConnectionWizardStep_paste_url_here}",
				tooltip: "{i18n>serviceCatalogWizardStep_urltextfield_placeholder}",
				value: "{sPasteUrlTextFieldValue}",
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum","bFullURL"],
					formatter: function(index, mSelectionEnum, bFullURL) {
						return (!!mSelectionEnum && index === mSelectionEnum.PasteURL) && (!bFullURL);
					}
				},
				liveChange: [oController._onPasteURLLiveChange, oController],
				change : [oController._onPasteURLChange, oController],
				layoutData: new sap.ui.layout.GridData({
					span: "L11 M11 S11"
				}),
				accessibleRole : sap.ui.core.AccessibleRole.Textbox
			}).addStyleClass("serviceCatalogStepBottomMargin");
			oGrid.addContent(oPasteUrlTextField);
			
            //Note: No handler for this button. The handler is triggered when the text box is focused out so no need for 
            //handler in this case. otherwize the call for metadata will be called twice
			var oPasteURLSelectButton = new sap.ui.commons.Button("DataConnectionTestButton", {
				width: "100%",
				//text: "{i18n>dataConnectionWizardStep_test}",
				icon: "sap-icon://media-play",
				tooltip: "{i18n>dataConnectionWizardStep_test}",
				enabled: "{bSelect}",
				visible: {
					parts: ["iDataConnectionSelected", "mSelectionEnum", "bFullURL", "bAppKeyTextFieldVisible"],
					formatter: function(index, mSelectionEnum, bFullURL, bAppKeyTextFieldVisible) {
						//visible only if it is PasteURL && is not fullUrl. if it is fullUrl and has API key- need also to be visible
						// 			return (!!mSelectionEnum && index === mSelectionEnum.PasteURL) && (!bFullURL || bAppKeyTextFieldVisible);
						// visible when
						return (!!mSelectionEnum && index === mSelectionEnum.PasteURL) && (!bFullURL);
					}
				},
				// 	layoutData: new sap.ui.layout.GridData({
				// 		span: "L3 M3 S3",
				// 		indent: "{sServiceURLIndent}"
				// 	}),
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			});
			oGrid.addContent(oPasteURLSelectButton);

			var oApiKeyTextField = new sap.ui.commons.TextField("ApiKeyTextField", {
				width: "100%",
				placeholder: "{i18n>serviceCatalogWizardStep_appkeytextfield_placeholder}",
				tooltip: "{i18n>serviceCatalogWizardStep_appkeytextfield_tooltip}",
				visible: "{bAppKeyTextFieldVisible}",
				value: "{sAppKeyTextFieldValue}",
				liveChange: [oController._onChangeApiKeyTextField, oController],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				accessibleRole : sap.ui.core.AccessibleRole.Textbox
			}).addStyleClass("serviceCatalogStepBottomMargin");
			oGrid.addContent(oApiKeyTextField);
		},

		_addRepositoryBrowserContent: function(oGrid, oController) {
			var oRepositoryBrowserVisibilityContainer = new sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer(
				"DataConnectionRepositoryBrowserContent", {
					visible: {
						parts: ["iDataConnectionSelected", "mSelectionEnum"],
						formatter: function(index, mSelectionEnum) {
							return !!mSelectionEnum && index === mSelectionEnum.RepositoryBrowser;
						}
					},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}).addStyleClass("serviceCatalogRepositoryBrowser serviceCatalogStepBottomMargin");
			oGrid.addContent(oRepositoryBrowserVisibilityContainer);

		},

		_addServiceCatalogContent: function(oGrid, oController) {
			var oServiceCatalogVisibilityContainer = new sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.VisibilityContainer(
				"DataConnectionServiceCatalogContent", {
					visible: {
						parts: ["iDataConnectionSelected", "mSelectionEnum"],
						formatter: function(index, mSelectionEnum) {
							return !!mSelectionEnum && index === mSelectionEnum.ServiceCatalog;
						}
					},
					layoutData: new sap.ui.layout.GridData({
						span: "L10 M10 S10"
					})
				});
			oGrid.addContent(oServiceCatalogVisibilityContainer);
		}

	});