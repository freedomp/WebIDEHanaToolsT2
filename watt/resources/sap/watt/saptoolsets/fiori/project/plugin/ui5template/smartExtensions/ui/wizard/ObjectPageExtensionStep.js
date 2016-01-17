jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.ui5template.smartExtensions.ui.wizard.ObjectPageExtensionStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.project.ui5template.smartExtensions.ui.wizard.ObjectPageExtensionStep", {

	TEMPLATENAME: "sap.suite.ui.generic.template.ObjectPage",

	metadata : {

	},

	init : function() {
		this._createStepContent();
		this.addContent(this.oMainGrid);
		this.bAlreadyLoaded = false;
	},

	_createStepContent : function(){
		var that = this;
		// Page
		var oPageLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_page_label}",
			tooltip : "{i18n>extension_step_page_DDLB_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		this.oPagesListBox = new sap.ui.commons.ComboBox({
			width: "100%",
			placeholder : "{i18n>extension_step_page_DDLB_placeholder}",
			tooltip : "{i18n>extension_step_page_DDLB_placeholder}",
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			}),
			items : {
				path : "/facetsPerEntitySet",
				template : new sap.ui.core.ListItem({
					text : "{name}",
					key : "{name}"
				})
			},
			change: function (oEvent) {
				that.oFacetsListBox.setValue(""); // remove the previous selection
				var oSelectedItem = oEvent.getParameter("selectedItem");
				var oSelectedBindingContext = oSelectedItem.getBindingContext();
				that.oFacetsListBox.setBindingContext(oSelectedBindingContext);
				that._validateStep(that.oFacetsListBox.getSelectedItemId(),that.oViewNameTextField.getValue());
			},
			selectedKey : "{/entitySet}",
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		// Facet
		var oFacetLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_facet_label}",
			tooltip : "{i18n>extension_step_facet_DDLB_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		this.oFacetsListBox = new sap.ui.commons.ComboBox({
			width : "100%",
			placeholder : "{i18n>extension_step_facet_DDLB_placeholder}",
			tooltip : "{i18n>extension_step_facet_DDLB_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S12"
			}),
			accessibleRole : sap.ui.core.AccessibleRole.Combobox,
			items : {
				path : "facets",
				template : new sap.ui.core.ListItem({
					text: {
						parts: [{
							path: "facetId"
						}, {
							path: "label"
						}],
						formatter: function (sFacetId, sLabel) {
							return sLabel + " (" + sFacetId + ")";
						}
					},
					key : "{facetId}"
				})
			},
			selectedKey : "{/facet}",
			change : function(){
				that._validateStep(this.getSelectedItemId(),that.oViewNameTextField.getValue());
			}
		});

		// Extension Point
		var oExtensionPointLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_extension_point_label}",
			tooltip : "{i18n>extension_step_extension_point_tooltip}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		var oExtensionPointRadioButtonGroup = new sap.ui.commons.RadioButtonGroup({
			width : "100%",
			tooltip : "{i18n>extension_step_extension_point_tooltip}",
			columns : 3,
			items : {
				path : "/extensionPoints",
				template : new sap.ui.core.Item({
					text : "{text}"
				})
			},
			selectedIndex : "{/extensionPointIndex}",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S12"
			})
		}).addStyleClass("radioButtonGroupOutline radioButtonGroupMargin");

		// View Type
		var oViewTypeLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_view_type_label}",
			tooltip : "{i18n>extension_step_view_type_label_tooltip}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		var oViewTypeRadioButtonGroup = new sap.ui.commons.RadioButtonGroup({
			width : "100%",
			tooltip : "{i18n>extension_step_view_type_label_tooltip}",
			columns : 2,
			items : {
				path : "/viewTypes",
				template : new sap.ui.core.Item({
					text : "{text}"
				})
			},
			selectedIndex : "{/viewTypeIndex}",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S12"
			})
		}).addStyleClass("radioButtonGroupOutline");

		// View Name
		var oViewNameLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_view_name_label}",
			tooltip : "{i18n>extension_step_view_name_TF_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		this.oViewNameTextField = new sap.ui.commons.TextField({
			width : "100%",
			placeholder : "{i18n>extension_step_view_name_TF_placeholder}",
			tooltip : "{i18n>extension_step_view_name_TF_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S12"
			}),
			value : "{/viewName}",
			liveChange : function(oEvent){
				that._validateStep(that.oFacetsListBox.getSelectedItemId(),oEvent.getParameter("liveValue"));
			}
		});

		//Facet Title
		var oFacetTitleLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_facet_title_label}",
			tooltip : "{i18n>extension_step_facet_title_TF_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12",
				linebreak : true
			})
		}).addStyleClass("extensionStepLabel");

		var oFacetTitleTextField = new sap.ui.commons.TextField({
			width : "100%",
			placeholder : "{i18n>extension_step_facet_title_TF_placeholder}",
			tooltip : "{i18n>extension_step_facet_title_TF_placeholder}",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S12"
			}),
			enabled : {
				path : "/extensionPointIndex",
				formatter : function(iExtensionPointIndex){
					return iExtensionPointIndex !== 2;
				}
			},
			value : "{/facetTitle}"
		});

		var oTemplateImage = new sap.ui.commons.Image({
			decorative: false,
			width: "90%",
			src : require.toUrl("sap.watt.saptoolsets.fiori.project.ui5template/smartExtensions/objectPage/image/objectPage.PNG"),
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M12 S12"
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
				imagePopUp.attachBrowserEvent("keyup", function(e) {
					if (e && e.keyCode === 27) {
						// esc key is pressed
						imagePopUp.close();
					}
				});
				imagePopUp.open();
				jQuery("#" + imagePopUp.getId() + "-content").css("overflow", "hidden");
			}
		});

		var oExtensionInfoLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_extension_info_label}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M12 S12",
				linebreak : true
			})
		}).addStyleClass("wizardH3 fontSpecial");

		var oGrid1 = new sap.ui.layout.Grid({
			width : "95%",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M12 S12"

			}),
			content : [
				oPageLabel,	this.oPagesListBox,
				oFacetLabel, this.oFacetsListBox,
				oExtensionPointLabel, oExtensionPointRadioButtonGroup
			]
		});

		var oFacetInfoLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : "{i18n>extension_step_facet_info_label}",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M12 S12",
				linebreak : true
			})
		}).addStyleClass("wizardH3 fontSpecial");

		var oGrid2 = new sap.ui.layout.Grid({
			width : "95%",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M12 S12"

			}),
			content : [
				oViewTypeLabel,	oViewTypeRadioButtonGroup,
				oViewNameLabel,	this.oViewNameTextField,
				oFacetTitleLabel, oFacetTitleTextField
			]
		});

		var oInputGrid = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L8 M12 S12"

			}),
			content : [
				oExtensionInfoLabel,oGrid1,
				oFacetInfoLabel, oGrid2
			]
		});

		this.oMainGrid = new sap.ui.layout.Grid({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"

			}),
			content : [
				oInputGrid,oTemplateImage
			]
		});



	},

	_initUIModel : function(oUIModel, aFacetsPerEntitySet){
		var oData = {
			facetsPerEntitySet : aFacetsPerEntitySet,
			extensionPoints : [{
				text : this.getContext().i18n.getText("i18n", "extension_step_before_radio_button"),
				key : "BeforeFacet"
			},{
				text : this.getContext().i18n.getText("i18n", "extension_step_after_radio_button"),
				key : "AfterFacet"
			},{
				text : this.getContext().i18n.getText("i18n", "extension_step_replace_radio_button"),
				key : "ReplaceFacet"
			}],
			extensionPointIndex : 0,
			viewTypes : [{
				text : this.getContext().i18n.getText("i18n", "extension_step_fragment_radio_button")
			},{
				text : this.getContext().i18n.getText("i18n", "extension_step_view_radio_button")
			}],
			viewTypeIndex : 0,
			viewName : "",
			facetTitle : ""
		};
		oUIModel.setData(oData);
	},

	renderer : {},

	onAfterRendering : function() {
		if(!this.bAlreadyLoaded){
			this.bAlreadyLoaded = true;
			var selectedDocument = this.getModel().getProperty("/selectedDocument");
			var that = this;
			return this.getContext().service.smartTemplateHelper.getEntitySets(selectedDocument, this.TEMPLATENAME).then(function(
				aEntitySets) {
				return that.getContext().service.smartTemplateHelper.getFacetsPerEntitySet(selectedDocument, aEntitySets).then(function(aFacetsPerEntitySet) {
					if(aFacetsPerEntitySet){
						var oUIModel = new sap.ui.model.json.JSONModel();
						that.getModel().setProperty("/UIModel", oUIModel);
						that.oMainGrid.setModel(oUIModel);
						that._initUIModel(oUIModel, aFacetsPerEntitySet);
					}
				});
			});
		}
	},

	setFocusOnFirstItem : function() {
		this.oPagesListBox.focus();
	},

	cleanStep : function() {
	},

	validateStepContent : function() {
		return this._validateStep(this.oFacetsListBox.getSelectedItemId(),this.oViewNameTextField.getValue());
	},

	_validateStep : function(sFacetId, sViewName){
		var bViewNameIsValid = this._validateViewName(sViewName);
		if(bViewNameIsValid){
			this.fireValidation({
				isValid : !!(sFacetId)
			});
		}
	},

	_validateViewName: function (sValue) {
		var oRegex = new RegExp("^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$");
		if (sValue && !oRegex.test(sValue)) {
			this.fireValidation({
				isValid: false,
				message: this.getContext().i18n.getText("i18n", "viewXML_model_parameters_name_validationError")
			});
			return false;
		} else {
			return true;
		}
	}
});
