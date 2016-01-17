define({

	_oContext: null,

	_createDialog: function() {

		var oDialog = new sap.ui.ux3.OverlayContainer("TemplateManagementDialog", {
			openButtonVisible: false,
			closeButtonVisible: true,
			close: function() {
				sap.ui.getCore().byId("menubar").setEnabled(true); //TODO: Move to generic WATT dialog
			}
		});

		this.addi18nBundleToDialog(oDialog);

		var oDialogLayout = new sap.ui.layout.Grid("TemplateManagementGrid", {
			vSpacing: 1,
			hSpacing: 0
		});

		// Header:
		var oHeaderGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			vSpacing: 0
		}).addStyleClass("dialogHeader");

		var headerTextView = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_headerText}",
			design: sap.ui.commons.TextViewDesign.H1,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("dialogFontSpecial dialogH1");

		var subHeaderTextView = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_subHeaderText}",
			enabled: false,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M11 S12",
				linebreak: true
			})
		}).addStyleClass("dialogBody");

		oHeaderGrid.addContent(headerTextView);
		oHeaderGrid.addContent(subHeaderTextView);
		oDialogLayout.addContent(oHeaderGrid);

		// Category view:
		var oCategoryLayout = this._createCategoryLayout();
		oDialogLayout.addContent(oCategoryLayout);

		// Templates view:
		var oTemplatesLayout = this._createTemplatesLayout();
		oDialogLayout.addContent(oTemplatesLayout);

		// Dialog control:
		var oBordedContent = new sap.ui.commons.layout.BorderLayout({
			width: "100%",
			height: "100%"
		});

		oBordedContent.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.center);
		oBordedContent.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.center, {
			visible: true
		});
		oBordedContent.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center, oDialogLayout);

		oDialog.addContent(oBordedContent);
		return oDialog;
	},

	/**
	 * Create Category Selection with Category Details View
	 */
	_createCategoryLayout: function() {
		var oCategoriesLayout = new sap.ui.layout.Grid("CategoryDetailsGrid", {
			//vSpacing : 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		var oCategorySelectionLabel = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_categorySelectionText}",
			wrapping: false,
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M7 S12",
				linebreak: true
			})
		}).addStyleClass("dialogBody");

		var oCategoriesItemTemplate = new sap.ui.core.ListItem({
			text: "{name}"
		});

		var oSorter = new sap.ui.model.Sorter("name");

		var oCategoriesDropdownBox = new sap.ui.commons.DropdownBox("CategoriesDropdownBox", {
			width: "100%",
			items: {
				path: "/categories",
				template: oCategoriesItemTemplate,
				sorter: oSorter
			},
			change: function(oEvent) {
				var oListItem = oEvent.getParameter("selectedItem");
				var oSelectedBindingContext = oListItem.getBindingContext();
				// Update category details according to model
				sap.ui.getCore().byId("CategoryDetailsGrid").setBindingContext(oSelectedBindingContext);
				// Populate templates view according to model
				sap.ui.getCore().byId("TemplatesDataSet").clearSelection();
				sap.ui.getCore().byId("TemplatesGrid").setBindingContext(oSelectedBindingContext);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M7 S12",
				linebreak: true
			})
		}).addStyleClass("categoriesDropdownBox");

		var that = this;
		var oCategoryIDContentLabel = new sap.ui.commons.TextView({
			width: "100%",
			textAlign: "Left",
			text: {
				parts: [{
					path: "id",
					type: new sap.ui.model.type.String()
				}],
				formatter: function(id) {
					id = id || "";
					var categoryIdStr = that._oContext.i18n.getText("i18n", "templateManagement_categoryIdText");
					return categoryIdStr + " " + id;
				}
			},
			wrapping: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M5 S12"
			})
		}).addStyleClass("dialogBody");

		var oCategoryDescriptionLabel = new sap.ui.commons.TextView({
			width: "100%",
			text: "{description}",
			wrapping: false,
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("dialogBody");

		oCategoriesLayout.addContent(oCategorySelectionLabel);
		oCategoriesLayout.addContent(oCategoriesDropdownBox);
		oCategoriesLayout.addContent(oCategoryIDContentLabel);
		oCategoriesLayout.addContent(oCategoryDescriptionLabel);

		return oCategoriesLayout;
	},

	/** 
	 * Create Templates view
	 */
	_createTemplatesLayout: function() {
		var that = this;
		var oTemplatesLayout = new sap.ui.layout.Grid("TemplatesGrid", {
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		// The Data Set Control
		var oDataSet = new sap.ui.ux3.DataSet("TemplatesDataSet", {
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			showSearchField: false,
			items: {
				path: "templates",
				template: new sap.ui.ux3.DataSetItem({
					title: "{name}",
					iconSrc: "{icon}"
				})
			},
			views: [new sap.ui.ux3.DataSetSimpleView({
				name: "{i18n>templateManagement_smallTilesViewText}",
				icon: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles2.png"),
				iconHovered: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles2_hover.png"),
				iconSelected: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles2_hover.png"),
				floating: true,
				responsive: true,
				itemMinWidth: 300,
				template: that._createSmallTilesTemplate()
			}), new sap.ui.ux3.DataSetSimpleView({
				name: "{i18n>templateManagement_largeTilesViewText}",
				icon: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles.png"),
				iconHovered: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles_hover.png"),
				iconSelected: require.toUrl("sap.watt.ideplatform.generationwizard/image/tiles_hover.png"),
				floating: true,
				responsive: true,
				itemMinWidth: 550,
				template: that._createLargeTilesTemplate()
			})]
		});

		oTemplatesLayout.addContent(oDataSet);

		return oTemplatesLayout;
	},

	/** 
	 * Create DataSet Template for Small Tiles
	 */
	_createSmallTilesTemplate: function() {
		var oSmallTileViewTemplate = new sap.ui.layout.Grid({
			hSpacing: 0,
			vSpacing: 0
		});
		oSmallTileViewTemplate.addStyleClass("dataSetTile");

		var control;
		//icon font (within a transparent button)
		control = new sap.ui.commons.Button({
			icon: "{icon}",
			enabled: false,
			lite: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S3"
			})
		}).addStyleClass("buttonWithIconFont");
		oSmallTileViewTemplate.addContent(control);

		//name field
		control = new sap.ui.commons.TextView({
			text: "{name}",
			textAlign: "Left",
			wrapping: false,
			width: '100%',
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S9"
			})
		}).addStyleClass("dataSetTileTitleText");
		oSmallTileViewTemplate.addContent(control);

		//divider
		control = new sap.ui.commons.HorizontalDivider({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetTileDivider");
		oSmallTileViewTemplate.addContent(control);

		//text fields section
		var oTextSectionLayout = new sap.ui.layout.Grid({
			width: '100%',
			hSpacing: 1,
			vSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oSmallTileViewTemplate.addContent(oTextSectionLayout);

		//description field
		control = new sap.ui.commons.TextView({
			text: "{description}",
			wrapping: true,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("dataSetSmallTileText_wrapping");
		oTextSectionLayout.addContent(control);

		return oSmallTileViewTemplate;
	},

	/**
	 * Create DataSet Template for Large Tiles
	 */
	_createLargeTilesTemplate: function() {
		var that = this;

		var oLargeTileViewTemplate = new sap.ui.layout.Grid({
			hSpacing: 0,
			vSpacing: 0
		});
		oLargeTileViewTemplate.addStyleClass("dataSetTile");

		var control;
		//icon font (within a transparent button)
		control = new sap.ui.commons.Button({
			icon: "{icon}",
			enabled: false,
			lite: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L1 M2 S3"
			})
		}).addStyleClass("buttonWithIconFont");
		oLargeTileViewTemplate.addContent(control);

		//name field
		control = new sap.ui.commons.TextView({
			text: "{name}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L11 M10 S9"
			})
		}).addStyleClass("dataSetTileTitleText");
		oLargeTileViewTemplate.addContent(control);

		//divider
		control = new sap.ui.commons.HorizontalDivider({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetTileDivider");
		oLargeTileViewTemplate.addContent(control);

		//text fields section
		var oTextSectionLayout = new sap.ui.layout.Grid({
			hSpacing: 1,
			vSpacing: 0,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});
		oLargeTileViewTemplate.addContent(oTextSectionLayout);

		//description field
		control = new sap.ui.commons.TextView({
			text: "{description}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//static preview image
		control = new sap.ui.commons.Image({
			alt: "{i18n>templateManagement_previewImageText}",
			src: {
				parts: [{
					path: "path",
					type: new sap.ui.model.type.String()
				}, {
					path: "previewImage",
					type: new sap.ui.model.type.String()
				}, {
					path: "template/_sName",
					type: new sap.ui.model.type.String()
				}],
				formatter: function(path, previewImage, templateName) {
					path = path || "";
					previewImage = previewImage || "";
					templateName = templateName || "";

					var sImageSrc = that._getPreviewImgByPluginLocation(templateName, path, previewImage);
					var sPlaceholderImageSrc = require.toUrl("sap.watt.ideplatform.generationwizard/image/template_placeholder.png");
					if (sImageSrc !== sPlaceholderImageSrc) {
						this.attachPress(function(oEvent) {
							if (this.getSrc() !== sPlaceholderImageSrc) {
								var fullSizeImage = new sap.ui.commons.Image({
									alt: this.getAlt(),
									src: this.getSrc(),
									decorative: false,
									height: "600px"
								});
								var imagePopUp = new sap.ui.ux3.OverlayDialog({
									openButtonVisible: false,
									closeButtonVisible: true,
									height: fullSizeImage.getHeight(),
									width: fullSizeImage.getWidth()
								});
								imagePopUp.addContent(fullSizeImage);
								imagePopUp.open();
								jQuery("#" + imagePopUp.getId() + "-content").css("overflow", "hidden");
							}
						});
					}
					return sImageSrc;
				},
				useRawValues: true
			},
			decorative: false,
			height: "200px",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("dialogBorderedGrid");
		oTextSectionLayout.addContent(control);

		//id field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_idText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		oTextSectionLayout.addContent(control);
		control = new sap.ui.commons.TextView({
			text: "{id}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//type field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_typeText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		oTextSectionLayout.addContent(control);
		control = new sap.ui.commons.TextView({
			text: "{templateType}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//version field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_versionText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		oTextSectionLayout.addContent(control);
		control = new sap.ui.commons.TextView({
			text: "{version}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//path field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_locationText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			text: "{path}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//template field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_templateClassText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			text: "{template/_sName}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//filename field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_templateResourcesText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			text: {
				parts: ["fileName", "i18n>templateManagement_templateResourcesNoValue"],
				formatter: function(fileName, defaultValue) {
					if (fileName === undefined || fileName === "" || fileName === null) {
						return defaultValue;
					}
					return fileName;
				},
				useRawValues: true
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//modelRoot field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_modelRootElementText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			text: {
				parts: ["modelRoot", "i18n>templateManagement_modelRootElementNoValue"],
				formatter: function(modelRoot, defaultValue) {
					if (modelRoot === undefined || modelRoot === "" || modelRoot === null) {
						return defaultValue;
					}
					return modelRoot;
				},
				useRawValues: true
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//modelFileName field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_modelFileText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			text: {
				parts: ["modelFileName", "i18n>templateManagement_modelFileNoValue"],
				formatter: function(modelFileName, defaultValue) {
					if (modelFileName === undefined || modelFileName === "" || modelFileName === null) {
						return defaultValue;
					}
					return modelFileName;
				},
				useRawValues: true
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//wizardSteps array field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_wizardStepsText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			text: {
				parts: ["wizardSteps", "i18n>templateManagement_wizardStepsNoValue"],
				formatter: function(aWizardSteps, defaultValue) {
					if (aWizardSteps === undefined || aWizardSteps === null || aWizardSteps.length === 0) {
						return defaultValue;
					}
					var sResult = "";
					for (var i = 0; i < aWizardSteps.length; i++) {
						sResult = sResult + aWizardSteps[i];
						if (i < aWizardSteps.length - 1) {
							sResult = sResult + ", ";
						}
					}
					return sResult;
				},
				//ensures the wizard steps will be passed as array to formatter
				useRawValues: true
			},
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//requiredTemplates array field and label
		control = new sap.ui.commons.TextView({
			text: "{i18n>templateManagement_requiredTemplatesText}",
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M6 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		control = new sap.ui.commons.TextView({
			text: {
				parts: ["requiredTemplates", "i18n>templateManagement_requiredTemplatesNoValue"],
				formatter: function(aRequiredTemplates, defaultValue) {
					if (aRequiredTemplates === undefined || aRequiredTemplates === null || aRequiredTemplates.length === 0) {
						return defaultValue;
					}
					var sResult = "";
					for (var i = 0; i < aRequiredTemplates.length; i++) {
						sResult = sResult + aRequiredTemplates[i];
						if (i < aRequiredTemplates.length - 1) {
							sResult = sResult + ", ";
						}
					}
					return sResult;
				},
				//ensures the required templates will be passed as array to formatter
				useRawValues: true
			},
			wrapping: false,
			width: '100%',
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M6 S12"
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		//requiresNepApp field
		control = new sap.ui.commons.CheckBox({
			text: "{i18n>templateManagement_requiresNeoAppText}",
			wrapping: false,
			editable: false,
			checked: "{requiresNeoApp}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("dataSetSmallTileText");
		oTextSectionLayout.addContent(control);

		return oLargeTileViewTemplate;
	},

	/**
	 * Return the plugin image full path Url
	 */
	_getPreviewImgByPluginLocation: function(templateName, path, previewImage) {
		// in case that failed to retrieve the image, missing image icon will be display 
		var sUrl = require.toUrl("sap.watt.ideplatform.generationwizard/image/template_placeholder.png");
		if (templateName && (templateName !== "") && path && (path !== "") && previewImage && (previewImage !== "")) {
			var sPluginName = null;
			var iSplit = templateName.indexOf("/");
			if (iSplit > -1) {
				sPluginName = templateName.substring(0, iSplit);
			}

			var sRelativePath = path.substring(path.indexOf("/")); //remove the plugin folder name from path
			if (!jQuery.sap.endsWith(sRelativePath, "/")) {
				sRelativePath += "/";
			}
			sUrl = require.toUrl(sPluginName + sRelativePath + previewImage);
		}

		return sUrl;
	},

	/**
	 * Refresh dialog with up-to-date categories and templates data
	 */
	_refreshDialog: function() {
		var that = this;
		var oDialog = sap.ui.getCore().byId("TemplateManagementDialog");

		if (oDialog !== undefined) {
			// Fetch the current data model, and refresh dialog controls accordingly:
			this._oContext.service.template.getTemplatesPerCategories(undefined,false).then(function(aCategories) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(that._createUIModelData(aCategories));
				oDialog.setModel(oModel);

				// Select first category and trigger data binding for it
				var oCategoriesDropdownBox = sap.ui.getCore().byId("CategoriesDropdownBox");
				var firstItemId = oCategoriesDropdownBox.getItems()[0].getId();
				oCategoriesDropdownBox.setSelectedItemId(firstItemId);
				oCategoriesDropdownBox.fireChange({
					selectedItem: oCategoriesDropdownBox.getItems()[0]
				});
			}).fail(function() {
				oDialog.setModel(undefined);
			});
		}
	},

	/**
	 * Create the data for the JSONModel object uses for the UI data binding,
	 * by extracting the relevant information from the data received from the template service
	 */
	_createUIModelData: function(aCategories) {
		var oModelData = {
			categories: []
		};
		if (aCategories !== undefined && aCategories !== null) {
			for (var categoryIndex = 0; categoryIndex < aCategories.length; categoryIndex++) {
				var oCategory = {
					name: aCategories[categoryIndex].category.getName(),
					description: aCategories[categoryIndex].category.getDescription(),
					id: aCategories[categoryIndex].category.getId()
				};

				oCategory.templates = [];
				var aOriginalCategoryTemplates = aCategories[categoryIndex].templates;

				if (aOriginalCategoryTemplates !== undefined && aOriginalCategoryTemplates !== null) {
					for (var templateIndex = 0; templateIndex < aOriginalCategoryTemplates.length; templateIndex++) {
						var oTemplate = {
							templateType: aOriginalCategoryTemplates[templateIndex].getType(),
							icon: aOriginalCategoryTemplates[templateIndex].getIcon(),
							name: aOriginalCategoryTemplates[templateIndex].getName(),
							wizardSteps: aOriginalCategoryTemplates[templateIndex].getWizardSteps(),
							description: aOriginalCategoryTemplates[templateIndex].getDescription(),
							path: aOriginalCategoryTemplates[templateIndex].getPath(),
							fileName: aOriginalCategoryTemplates[templateIndex].getFileName(),
							modelFileName: aOriginalCategoryTemplates[templateIndex].getModelFileName(),
							modelRoot: aOriginalCategoryTemplates[templateIndex].getModelRoot(),
							version: aOriginalCategoryTemplates[templateIndex].getVersion(),
							previewImage: aOriginalCategoryTemplates[templateIndex].getPreviewImage(),
							template: aOriginalCategoryTemplates[templateIndex].getTemplateClass(),
							requiredTemplates: aOriginalCategoryTemplates[templateIndex].getRequiredTemplates(),
							id: aOriginalCategoryTemplates[templateIndex].getId(),
							requiresNeoApp: aOriginalCategoryTemplates[templateIndex].getRequiresNeoApp()
						};
						oCategory.templates.push(oTemplate);
					}
				}

				oModelData.categories.push(oCategory);
			}
		}

		//TODO: add 'All' category to model and aggregate all templates from all categories to it

		return oModelData;
	},

	/**
	 * Display the Template Management Dialog UI
	 * @param oContext The context of the template plugin
	 */
	openTemplateManagementUI: function(oContext) {
		this._oContext = oContext;
		var oUsageMonitoringService = this._oContext.service.usagemonitoring;

		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.generationwizard/css/templateManagement.css"));

		var oDialog = sap.ui.getCore().byId("TemplateManagementDialog");

		if (oDialog === undefined) {
			oDialog = this._createDialog();
		}
		// Fetch the current data model, and refresh dialog controls accordingly
		this._refreshDialog();

		sap.ui.getCore().byId("menubar").setEnabled(false); //TODO: Move to generic WATT dialog

		oDialog.open();

		oUsageMonitoringService.report("template", "TemplateLibraryOpened").done();
	},

	addi18nBundleToDialog: function(oDialog) {
		if (this._oContext.i18n) {
			this._oContext.i18n.applyTo(oDialog);
		}
	}

});