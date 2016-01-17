sap.ui.define([
	"sap/ui/core/Control","sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"
], function(Control,ExtendedTitle) {
	"use strict";

	return Control.extend("ResourceMappingControl", {
		_isControlRendered: false,
		
		metadata: {
			properties: {
				oController: "object",
				ControlTitle: {
					type: 'string'
				},
				ControlSubTitle: {
					type: 'string'
				},
				CheckBoxText:{
					type: 'string'
				},
				ButtonText:{
					type: 'string'
				},
				LibNameLabel:{
					type: 'string'
				},
				LibVersionLabel:{
					type: 'string'
				}
				
			},

			aggregations: {
				_sResourceMappingTitle: {
					type: "sap.ui.commons.TextView",
					multiple: false,
					visibility: "hidden"
				},
				_sResourceMappingInfo: {
					type: "sap.ui.commons.TextView",
					multiple: false,
					visibility: "hidden"
				},
				_oCheckBox: {
					type: "sap.ui.commons.CheckBox",
					multiple: false,
					visibility: "hidden"
				},
				_oButton: {
					type: "sap.ui.commons.Button",
					multiple: false,
					visibility: "hidden"
				},
				_sLibNameLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_sLibVersionLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_MGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				},

				rows: "ReuseLibraryElement"
			}
		},

		init: function() {
			//Define title
			this._title = new ExtendedTitle({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			//Define subTitle
			this.setAggregation("_sResourceMappingInfo", new sap.ui.commons.TextView({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("compositeControlTextColour"));

			//define checkbox
			this.setAggregation("_oCheckBox", new sap.ui.commons.CheckBox({
				checked: {
					path: "/workspace",
					formatter: this._withWorkspace
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				change: this._onCheckboxClick.bind(this)
			}));

			//define button
			this.setAggregation("_oButton", new sap.ui.commons.Button({
				press: this._onButtonClick.bind(this),
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("riverControlSmall"));

			//define rows labels
			this.setAggregation("_sLibNameLabel", new sap.ui.commons.Label({
				design: "Bold",
				textAlign: "Begin",
				visible: {
					path: "/appsVersion",
					formatter: this._isVisible
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			}));

			this.setAggregation("_sLibVersionLabel", new sap.ui.commons.Label({
				design: "Bold",
				visible: {
					path: "/appsVersion",
					formatter: this._isVisible
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			}));
			
			this._oMainGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0.5,
				hSpacing: 0.5,
				content: [this._title, this.getAggregation("_sResourceMappingInfo"), this.getAggregation("_oCheckBox"), this.getAggregation("_oButton"), this.getAggregation("_sLibNameLabel"), this.getAggregation("_sLibVersionLabel")],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			this.setAggregation("_MGrid", this._oMainGrid);
		},

		onBeforeRendering: function() {
			var self = this;
			if (!this._isControlRendered) {
				this._isControlRendered = true;
				//Get Resource Bundle for I18n
				var oRessourceBundle = self.getModel("i18n").getResourceBundle();
				
				//title text
				if (!this.getControlTitle()) {
					this.setControlTitle(oRessourceBundle.getText("lbl_reuselib_title"));	
				}
				self._title.getAggregation("title").setText(this.getControlTitle());
				//subtiitle text
				if (!this.getControlSubTitle()) {
					this.setControlSubTitle(oRessourceBundle.getText("lbl_reuselib_subtitle"));	
				}
				self.getAggregation("_MGrid").getContent()[1].setText(this.getControlSubTitle());
				//checkbox text
				if (!this.getCheckBoxText()) {
					this.setCheckBoxText(oRessourceBundle.getText("lbl_reuselib_cb_text"));	
				}
				self.getAggregation("_MGrid").getContent()[2].setText(this.getCheckBoxText());
				self.getAggregation("_MGrid").getContent()[2].setTooltip(oRessourceBundle.getText("tlt_reuselib_cb_tooltip"));
				//library name label
				if (!this.getLibNameLabel()) {
					this.setLibNameLabel(oRessourceBundle.getText("lbl_reuselib_name"));	
				}
				self.getAggregation("_MGrid").getContent()[4].setText(this.getLibNameLabel());
				//library version label
				if (!this.getLibVersionLabel()) {
					this.setLibVersionLabel(oRessourceBundle.getText("lbl_reuselib_version"));	
				}
				self.getAggregation("_MGrid").getContent()[5].setText(this.getLibVersionLabel());
				//button text
				if (!this.getButtonText()) {
					this.setButtonText(oRessourceBundle.getText("reuselib_getLibs"));	
				}
				self.getAggregation("_MGrid").getContent()[3].setText(this.getButtonText());
				
			}
		},

		exit: function() {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}
		},

		renderer: function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			//oRm.addClass('myControlPropertyAggr');
    		//oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_MGrid"));
			oControl.getRows().forEach(function(r) {
				oRm.renderControl(r);
			});
			oRm.write("</div>");
		},
		

		_onCheckboxClick: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().onResourceMappingChange(oEventExtend).done();
		},

		_onButtonClick: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().onGetLibsVersionsClick(oEventExtend).done();
		},
		
		//formatter for visible property of rows labels
		_isVisible: function(appsVersion){
			if (appsVersion && appsVersion.length) {
					return true;
			}
			return false;
		},
		
		//formatter for checked property of checkbox
		_withWorkspace: function(workspace){
			return workspace === "withoutWorkspace" ? false : true;
		}
		
	});
});
