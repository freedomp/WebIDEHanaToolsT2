sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/commons/Label",
	"sap/ui/commons/Button",
	"sap/ui/commons/TextField",
	"sap/ui/commons/TextView",
	"sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"

], function(Control, Label, Button, TextField, Title, ExtendedTitle) {
	"use strict";

	return sap.ui.core.Control.extend("URLParametersControl", {
		_isVisited: false,
		metadata: {

			properties: {
				oController: {
					type: "object"
				},
				sHashTitle: {
					type: "string"
				},
				sHashLabel: {
					type: "string"
				},
				sHashInfo: {
					type: "string"
				},
				sURLLabel: {
					type: "string"
				},
				sURLInfo: {
					type: "string"
				},
				sNamelabel: {
					type: "string"
				},
				sValuelabel: {
					type: "string"
				}
			},
			aggregations: {

				_addParameterbutton: {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				_removeParameterbutton: {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				_hashtextfield: {
					type: "sap.ui.commons.TextField",
					multiple: false,
					visibility: "hidden"
				},
				_nametextfield: {
					type: "sap.ui.commons.TextField",
					multiple: false,
					visibility: "hidden"
				},
				_valuetextfield: {
					type: "sap.ui.commons.TextField",
					multiple: false,
					visibility: "hidden"
				},
				_oParameterGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				},
				_MGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		onBeforeRendering: function(oEvent) {
			
			// i18n for all Labels and texts
			var oLocRessourceBundle = this.getModel("i18n").getResourceBundle();
		
			//the if here is to check if the text of the title/label was already enterd in the runner, if not it will bw takrn from i18n
			if (!this.getSHashTitle()) {
					this.setSHashTitle(oLocRessourceBundle.getText("lbl_params_hash_url_param_title"));	
			}
			this._sHashTitle.getAggregation("title").setText(this.getSHashTitle());
			
			if (!this.getSHashLabel()) {
					this.setSHashLabel(oLocRessourceBundle.getText("lbl_params_proj_settings_hash_url_param"));	
			}
			this._sHashLabel.setText(this.getSHashLabel());
			
			if (!this.getSHashInfo()) {
					this.setSHashInfo(oLocRessourceBundle.getText("tlt_params_proj_settings_hash_param"));	
			}
			this._sHashInfo.setText(this.getSHashInfo());
			
			if (!this.getSURLLabel()) {
					this.setSURLLabel(oLocRessourceBundle.getText("app_params_settings_title"));	
			}
			this._sURLLabel.getAggregation("title").setText(this.getSURLLabel());
			
			if (!this.getSURLInfo()) {
					this.setSURLInfo(oLocRessourceBundle.getText("app_params_proj_settings_desc"));	
			}
			this._sURLInfo.setText(this.getSURLInfo());
			
			if (!this.getSNamelabel()) {
					this.setSNamelabel(oLocRessourceBundle.getText("lbl_params_param_name"));	
			}
			this._sNamelabel.setText(this.getSNamelabel());
			
			if (!this.getSValuelabel()) {
					this.setSValuelabel(oLocRessourceBundle.getText("lbl_params_param_value"));	
			}
			this._sValuelabel.setText(this.getSValuelabel());
		},

		onAfterRendering: function(oEvent) {
			var self = this;
			if (!this._isVisited) {
				this._isVisited = true;	
				var oEventExtend = jQuery.extend(true, {}, self);
				// check that the lines in the url table are valid
				self.getOController().checkUrlModelisValid(oEventExtend).done();
			}
			
		},

		init: function() {
			//this is the title of section
			this._sHashTitle = new ExtendedTitle({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			this._sHashInfo = new sap.ui.commons.TextView({
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("compositeControlTextColour spaceAfterInfo labelPaddingLeft");
			this._sHashLabel = new sap.ui.commons.Label({
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M4 S4"
				})
			});
			this._sHashTextField = new sap.ui.commons.TextField({
				placeholder: "{i18n>lbl_params_proj_settings_hash_param_place_holder}",
				width: "100%",
				value: "{/hashParameter}",
				tooltip: "{i18n>lbl_params_proj_settings_hash_param_place_holder}",
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M8 S8"
				})
			});
			this.setAggregation("_hashtextfield", this._sHashTextField);
		
			//also title of section
			this._sURLLabel = new ExtendedTitle({});
			
			this._sURLInfo = new sap.ui.commons.TextView({
				//wrapping : true,
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("compositeControlTextColour spaceAfterInfo labelPaddingLeft");
		
			this._sNamelabel = new sap.ui.commons.Label({
				design: sap.ui.commons.LabelDesign.Bold,
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				})
			}).addStyleClass("nameValueIndent");
			this._sValuelabel = new sap.ui.commons.Label({
				design: sap.ui.commons.LabelDesign.Bold,
				layoutData: new sap.ui.layout.GridData({
					span: "L7 M7 S7"
				})
			});

			

			this.addEventDelegate({
				onBeforeRendering: $.proxy(function(oEvent) {
					this.getOController().onBeforeURLParametersRendering(oEvent);
				})
			}, this);

			//Grid of the parameters section
			var oGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 1,
				hSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("runConfigurationsUrlParameterMarginTop");
			//row repeater to create the template control that will be repeated and will display the data
			var oRowTemplate = this._addParamLineTemplate(this);
			oGrid.bindAggregation("content", {
				path: "/urlParameters",
				template: oRowTemplate
			});

			//this button adds new line for new URL parameter
			var oAddButton = new sap.ui.commons.Button({
				icon: "sap-icon://add",
				text: "{i18n>lbl_run_config_urlparam_button}",
				width: "110px",
				press: this._createNewLine.bind(this),
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("riverControlSmall");

			this.setAggregation("_addParameterbutton", oAddButton);
			this.setAggregation("_oParameterGrid", oGrid);
			
			this._oHashGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				content: [this._sHashTitle, this._sHashInfo, this._sHashLabel, this._sHashTextField],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			this._oURLParamGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				content: [this._sURLLabel, this._sURLInfo, oAddButton, this._sNamelabel, this._sValuelabel],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			//Grid that contains all  parts of the parameters tab except the parameters which are in row repeater
			this._oMainGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				content: [this._oURLParamGrid, oGrid, this._oHashGrid],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			this.setAggregation("_MGrid", this._oMainGrid);
		},

		_addParamLineTemplate: function(that) {
			
			//here is the template for the row repeater
			var addParamGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 1,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			var oNameTextField = new sap.ui.commons.TextField({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				}),
				value: "{paramName}",
				placeholder: "{i18n>lbl_params_param_name_placeholder}",
				change: that._onAddNewParam.bind(this)
			});

			that.setAggregation("_nametextfield", oNameTextField);

			oNameTextField.addEventDelegate({
				onAfterRendering: $.proxy(function(oEvent) {
					that.getOController().onAfterParamNameRendering(oEvent);
				})
			}, oNameTextField);

			var oValueTextField = new sap.ui.commons.TextField({
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				}),
				value: "{paramValue}",
				placeholder: "{i18n>lbl_params_param_value_placeholder}",
				change: that._onAddValueParam.bind(this)
			});

			that.setAggregation("_valuetextfield", oValueTextField);

			addParamGrid.addContent(oNameTextField);
			addParamGrid.addContent(oValueTextField);

			var oRemoveButton = new sap.ui.commons.Button({
				icon: "sap-icon://delete",
				lite: true,
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				}),
				press: this._deleteLine.bind(this)
			});

			that.setAggregation("_removeParameterbutton", oRemoveButton);

			addParamGrid.addContent(oRemoveButton);
			addParamGrid.addStyleClass("runConfigurationsAddUrlParameter");
			return addParamGrid;
		},
		
		
		exit: function() {
			if (this._sHashTitle) {
				this._sHashTitle.destroy();
				delete this._sHashTitle;
			}
			if (this._sHashLabel) {
				this._sHashLabel.destroy();
				delete this._sHashLabel;
			}
			if (this._sHashInfo) {
				this._sHashInfo.destroy();
				delete this._sHashInfo;
			}
			if (this._sURLLabel) {
				this._sURLLabel.destroy();
				delete this._sURLLabel;
			}
			if (this._sURLInfo) {
				this._sURLInfo.destroy();
				delete this._sURLInfo;
			}
			if (this._sNamelabel) {
				this._sNamelabel.destroy();
				delete this._sNamelabel;
			}
			if (this._sValuelabel) {
				this._sValuelabel.destroy();
				delete this._sValuelabel;
			}
			
			var _sHashTextField = this.getAggregation("_sHashTextField");
			if (_sHashTextField)
			{
				_sHashTextField[0].destroy();
			}
			
			var oGrid = this.getAggregation("_oParameterGrid");
			if (oGrid)
			{
				oGrid.destroy();
			}
			
			var _oMainGrid = this.getAggregation("_MGrid");
			if (_oMainGrid)
			{
				_oMainGrid.destroy();
			}
			
			var oAddButton = this.getAggregation("_addParameterbutton");
			if (oAddButton)
			{
				oAddButton.destroy();	
			}
			var oNameTextField = this.getAggregation("_nametextfield");
			if (oNameTextField)
			{
				oNameTextField.destroy();	
			}
			var oValueTextField = this.getAggregation("_valuetextfield");
			if (oValueTextField)
			{
				oValueTextField.destroy();	
			}
			var oRemoveButton = this.getAggregation("_removeParameterbutton");
			if (oRemoveButton)
			{
				oRemoveButton.destroy();	
			}
		},

	//here are methods for the adding of new parameter line, for deleting one and for changing the parameter name
		_onAddNewParam: function(oEvent) {
			//oEventExtend - its purpose is to pass it by Value and not reference
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			this.getOController().onParamNameChange(oEventExtend);
		},
		
		_onAddValueParam: function(oEvent) {
			//oEventExtend - its purpose is to pass it by Value and not reference
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			this.getOController().onParamValueChange(oEventExtend);
		},

		_createNewLine: function(oEvent) {
			var that = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			that.getOController().createNewParameterLine(oEventExtend);
		},

		_deleteLine: function(oEvent) {
			var that = this;
			that.getOController().deleteParameterLine(oEvent.getSource());
		},

		renderer: function(oRM, oControl) {
		
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("sapIDEurlParametersMargin");
			oRM.writeClasses();
			oRM.write(">");
            oRM.renderControl(oControl.getAggregation("_MGrid"));
			oRM.write("</div>");
		}
	});
});