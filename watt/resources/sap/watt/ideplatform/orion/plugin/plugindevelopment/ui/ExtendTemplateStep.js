jQuery.sap.declare("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.ExtendTemplateStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.ExtendTemplateStep", {

		metadata: {
			properties: {
				"data": "object"
			}
		},

		_aAggregateTemplates: null,

		init: function() {
			var that = this;
			this.bAlreadyLoaded = false;
			this._bGridAlreadyLoaded = false;

			//Initialize the example data and the model
			var data = {
				templates: []
			};

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);

			//Initialize the Dataset and the layouts
			function createTemplate() {
				var c = sap.ui.commons;
				return new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateItemLayout({
					button: new c.Button({
						icon: "{image}",
						enabled: false,
						lite: true
					}).addStyleClass('wizardButtonuttonWithIconFont'),

					tileText: new c.TextView({
						text: "{title}",
						wrapping: true,
						enabled: false
					}).addStyleClass('tileTextDiv')
				});
			}

			that = this;
			this.oDataSet = new sap.ui.ux3.DataSet({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M11 S12",
					linebreak: true
				}),
				showSearchField: false,
				showToolbar: false,
				items: {
					path: "/templates",
					template: new sap.ui.ux3.DataSetItem({
						iconSrc: "{image}",
						title: "{title}"
					}).data("template", "{template}")
				},
				views: [new sap.ui.ux3.DataSetSimpleView({
					name: "Floating, responsive View",
					floating: true,
					template: createTemplate()
				})],
				selectionChanged: [that._dataSetSelectionChanged, that]
			});
			this.oDataSet.setModel(oModel);
			jQuery.sap.require("sap.ui.ux3.DataSetItem");
			sap.ui.ux3.DataSetItem.prototype.ondblclick = function(oEvent) {
				sap.ui.ux3.DataSetItem.prototype.onclick.apply(this, arguments);
			};

			that = this;

			this.oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.oSearch = new sap.ui.commons.SearchField({
				enableListSuggest: false,
				enableClear: true,
				startSuggestion: 0,
				width: "250px",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M5 S5",
					linebreak: true
				}),
				suggest: function(oEvent) {
					that._updateDataSet(oEvent.getParameter("value", true));
				}
			}).addStyleClass("previousButton");

			this.oCategoriesDropdownBox = new sap.ui.commons.DropdownBox({
				width: "250px",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M5 S5"
				}),
				change: function(e) {
					var sCategoryId = e.getParameter("selectedItem").data()["sId"];

					var aTemplatesInCategory = that._getTemplatesByCategory(sCategoryId);

					aTemplatesInCategory.sort(function(template1, template2) {
						//sort by order priority, the smaller priority comes first. undefined priority will 
						//be listed last. equal priority will be sorted alphabetically
						var iTempOrder1 = template1.getOrderPriority();
						var iTempOrder2 = template2.getOrderPriority();
						if (iTempOrder1 === iTempOrder2) { //either undefine or equals
							return template1.getName().localeCompare(template2.getName());
						} else {
							if (!iTempOrder1 || !iTempOrder2) { //only one of them is undefined
								return (!iTempOrder1) ? 1 : -1; //undefine has low priority
							}
							return iTempOrder1 - iTempOrder2;
						}
					});

					data.templates = [];
					for (var i = 0; i < aTemplatesInCategory.length; i++) {
						var oTemplate = {
							id: i.toString(),
							title: aTemplatesInCategory[i].getName(),
							image: aTemplatesInCategory[i].getIcon(),
							template: aTemplatesInCategory[i]
						};
						data.templates.push(oTemplate);
					}

					oModel.setData(data);
					that.oDataSet.clearSelection();
					that.initializeDataSetSelection(data);
				}
			});

			this.oTemplateDescription = new sap.ui.commons.Label({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this.oTemplateImage = new sap.ui.commons.Image({
				decorative: false,
				width: "50%",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				press: function(oEvent) {
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

			var oEmptyLabel = new sap.ui.commons.Label({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				})
			});

			this.oTemplateDescriptionGrid = new sap.ui.layout.Grid({
				content: [this.oTemplateDescription, oEmptyLabel, this.oTemplateImage],
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M12 S12"
				})
			});

		},

		_getTemplatesByCategory: function(sCategoryId) {
			var aData = this.getData();
			var i;
			if (sCategoryId === "sap.watt.ideplatform.generationwizard.allCategories") {
				this._aAggregateTemplates = new Array();
				for (i = 0; i < aData.length; i++) {
					this._unionArrays(this._aAggregateTemplates, aData[i].templates);
				}
				return this._aAggregateTemplates;
			} else {
				for (i = 0; i < aData.length; i++) {
					if (aData[i].category.getId() === sCategoryId) {
						return aData[i].templates;
					}
				}
			}
		},

		_unionArrays: function(aArrayA, aArrayB) {

			for (var i = 0; i < aArrayB.length; i++) {
				if (jQuery.inArray(aArrayB[i], aArrayA) === -1) {
					aArrayA.push(aArrayB[i]);
				}
			}
		},

		_updateDataSet: function(sPrefix) {
			var oBinding = this.oDataSet.getBinding("items");
			oBinding.filter(!sPrefix ? [] : [new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sPrefix)]);
			if (oBinding.aIndices.length > 0) {
				this.oDataSet.setLeadSelection(0);
				this.oDataSet.fireEvent("selectionChanged", {
					newLeadSelectedIndex: 0
				});
			} else {
				this.oDataSet.setLeadSelection(-1);
			}

		},

		initializeDataSetSelection: function(data) {
			if (data.templates.length > 0) {
				this.oDataSet.setLeadSelection(0);
				this.oDataSet.fireEvent("selectionChanged", {
					newLeadSelectedIndex: 0
				});
			}
		},

		setFocusOnFirstItem: function() {
			this.oSearch.focus();
		},

		setTabIndexes: function(i, nextButtonId, backButtonId) {
			this.nextButtonId = nextButtonId;

			var $listBox = jQuery("#" + this.oCategoriesDropdownBox.getId());
			if ($listBox) {
				$listBox.tabIndex = 0;
			}
			var $searchBox = jQuery("#" + this.oSearch.getId());
			if ($searchBox) {
				$searchBox.tabIndex = 0;
			}
			var $dataSet = jQuery("#" + this.oDataSet.getId());
			if ($dataSet) {
				$dataSet.tabIndex = 0;
			}
		},

		_getCategoryNameFromCategoriesById: function(aData, iCategoryId) {
			var sCategoryName = "";

			for (var i = 0; i < aData.length; i++) {
				if (aData[i].category.getId() === iCategoryId) {
					sCategoryName = aData[i].category.getName();
					break;
				}
			}

			return sCategoryName;
		},

		setData: function(aData) {
			this.setProperty("data", aData, true);
			this._makeCategoryListItems(aData);
			var iSelectedIndex = 0;

			var sCategoryName = this._getCategoryNameFromCategoriesById(aData, "Empty.SAPUI5.Project");
			if (sCategoryName !== "") {
				var aItems = this.oCategoriesDropdownBox.getItems();

				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getText() === sCategoryName) {
						iSelectedIndex = i;
						break;
					}
				}
			}

			var oFirstItem = this.oCategoriesDropdownBox.getItems()[iSelectedIndex];
			this.oCategoriesDropdownBox.setSelectedItemId(oFirstItem.sId);
			this.oCategoriesDropdownBox.fireEvent("change", {
				selectedItem: oFirstItem
			});

			var content = new sap.ui.layout.Grid();
			this.oHorizontalLayout.addContent(this.oSearch);
			this.oHorizontalLayout.addContent(this.oCategoriesDropdownBox);
			content.addContent(this.oHorizontalLayout);
			content.addContent(this.oDataSet);

			if (!this._bGridAlreadyLoaded) {
				content.addContent(this.oTemplateDescriptionGrid);
				this._bGridAlreadyLoaded = true;
			}

			this.addContent(content);

		},

		validateStepContent: function() {
			var that = this;
			var oDeferred = Q.defer();
			var leadSelectedIndex = this.oDataSet.getLeadSelection();
			if (leadSelectedIndex > -1) {
				oDeferred.resolve(true);
				that.fireValidation({
					isValid: true
				});
			} else {
				this._notifyStepInvalid(this.getContext().i18n.getText("i18n", "ExtendTemplateStep_selectTemplateErrorMsg"), oDeferred);
			}
			return oDeferred.promise;
		},

		_notifyStepInvalid: function(sMessage, oDeferred) {
			oDeferred.reject(sMessage);
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
		},

		//	onBasicInformationChange : function(oEvent) {
		//		if (this.bAlreadyLoaded) {
		//			this.validateStepContent().fail(/*No failure handling is needed here*/);
		//		}
		//	},

		_iCheckIfCategoryAlreadyExists: function(aTemplates, sCategoryId) {

			for (var i = 0; i < aTemplates.length; i++) {
				if (aTemplates[i].category.getId() === sCategoryId) {
					return i;
				}
			}

			return -1;
		},

		onAfterRendering: function() {

			if (!this.bAlreadyLoaded) {
				this.bAlreadyLoaded = true;
				this.initializeDataSetSelection(this.oDataSet.getModel().oData);
			}
		},

		_dataSetSelectionChanged: function(oEvent) {
			var that = this;

			if (!this.bAlreadyLoaded) {
				return;
			}
			var idx = oEvent.getParameter("newLeadSelectedIndex");
			if (idx > -1) {
				var selectedExtendTemplate = this.oDataSet.getItems()[idx].data("template");

				// Display template description and preview image
				var sTemplateDescription = selectedExtendTemplate.getDescription();
				if (sTemplateDescription) {
					this.oTemplateDescription.setText(sTemplateDescription);
					this.oTemplateDescription.setTooltip(sTemplateDescription);
					jQuery("#" + this.oTemplateDescription.getId()).text(sTemplateDescription); //for the first tile selected automatically
				}

				this.oTemplateImage.setVisible(false);
				var sPreviewImg = selectedExtendTemplate.getPreviewImage();
				var sPath = selectedExtendTemplate.getPath();
				var sTemplate = selectedExtendTemplate.getTemplateClass().getProxyMetadata().getName();
				if (sTemplate && sPath && sPreviewImg) {
					var sPreviewImgPath = sPath + "/" + sPreviewImg;
					var sImageURL = this._getPreviewImgForTemplate(sTemplate, sPreviewImgPath);
					this.oTemplateImage.setSrc(sImageURL);
					this.oTemplateImage.setVisible(true);
				}

				// Update template model
				var oModel = this.getModel().getData();
				if (!oModel.template) {
					oModel.template = {};
				}

				oModel.template.selectedTemplateToExtend = selectedExtendTemplate;

				// Notify validation succeeded
				this.fireValidation({
					isValid: true
				});
				this.fireValueChange({
					id: "extendTemplateName",
					value: selectedExtendTemplate
				});
				//			if (this.nextButtonId) {
				//				document.getElementById(this.nextButtonId).focus();
				//			}
			} else {
				this._notifyTemplateSelectionInvalid();
			}
		},

		/**
		 * Return the template image full path Url (considering its plugin location)
		 */
		_getPreviewImgForTemplate: function(templateName, sPreviewImagePath) {
			// in case that failed to retrieve the image, missing image icon will be display 
			var sUrl = null;

			var sPluginName = null;
			var iSplit = templateName.indexOf("/");
			if (iSplit > -1) {
				sPluginName = templateName.substring(0, iSplit);
			}

			var sRelativeImagePath = sPreviewImagePath.substring(sPreviewImagePath.indexOf("/")); //remove the plugin folder name from path
			sUrl = require.toUrl(sPluginName + sRelativeImagePath);

			return sUrl;
		},

		_notifyTemplateSelectionInvalid: function(sMessage) {
			this.fireValidation({
				isValid: false,
				message: sMessage
			});
			this.fireValueChange({
				id: "extendTemplateName",
				value: ""
			});

			this.oTemplateDescription.setText("");
			this.oTemplateDescription.setTooltip("");
			this.oTemplateImage.setSrc("");
		},

		_makeCategoryListItems: function(aTemplatesPerCategory) {
			var allCatagories = new sap.ui.core.ListItem({
				text: this.getContext().i18n.getText("i18n", "ExtendTemplateStep_allCategories")
			}).data("sId", "sap.watt.ideplatform.generationwizard.allCategories");
			this.oCategoriesDropdownBox.removeAllItems();
			this.oCategoriesDropdownBox.addItem(allCatagories);
			aTemplatesPerCategory.sort(this._sortCategories);
			for (var index = 0, len = aTemplatesPerCategory.length; index < len; index++) {
				var listItem = new sap.ui.core.ListItem({
					text: aTemplatesPerCategory[index].category.getName()
				}).data("sId", aTemplatesPerCategory[index].category.getId());
				this.oCategoriesDropdownBox.addItem(listItem);
			}
		},

		_sortCategories: function(categoryA, categoryB) {
			if (categoryA.category.getName() < categoryB.category.getName()) {
				return -1;
			}
			if (categoryA.category.getName() > categoryB.category.getName()) {
				return 1;
			}
			return 0;
		},

		renderer: {},

		onChangeTemplateType: function(oEvent) {
			var sTemplateType = oEvent.getParameter("value");
			var that = this;

			this.getContext().service.template.getTemplatesPerCategories(sTemplateType, false).then(function(aTemplatesPerCategory) {
				that.setData(aTemplatesPerCategory);
			}).done();

			this._bGridAlreadyLoaded = false;
		},

		// 	onChangeTemplate : function(oEvent) {

		// 		this.fireValidation({
		// 			isValid : true,
		// 			message : ""
		// 		});

		// 		if (this.bAlreadyLoaded) {
		// 			this.cleanStep();
		// 		}
		// 	},

		cleanStep: function() {
			this.setProperty("data", undefined, true);
			this._aAggregateTemplates = null;

			if (this.getModel()) {
				var oModel = this.getModel().getData();
				if (oModel.template) {
					// clean model if created
					oModel.template = undefined;
				}
			}

			if (this.oDataSet.getModel()) {
				oModel = this.oDataSet.getModel().getData();

				if (oModel.templates) {
					// clean model if created
					oModel.templates = undefined;
				}
			}

		}
	});