sap.ui.define([
	"sap/ui/core/Control", "sap/ui/commons/TextView", "sap/ui/commons/Label", "sap/ui/commons/DropdownBox",
	"sap/ui/commons/RadioButtonGroup", "sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"
], function(Control, Title, Label, DropdownBox, RadioButtonGroup, ExtendedTitle) { 
	"use strict";
	return Control.extend("ui5versionSection", {
		_isVisited: false,
		
		metadata: {
			properties: {
				dropDownBoxItems: {
					type: 'object',
					description: "Array of objects which have following parameters: display, source, value. The array constructs the drop down box element"
				},
				oController: {
					type: 'object',
					description: "Composite controller handler"
				},
				UI5CurrentVersion: {
					type: 'string',
					description: "Current UI5 version that used in the application"
				},
				ControlTitle: {
					type: 'string',
					description: "UI5 Versions composite control title"
				},
				ControlSubTitle: {
					type: 'string',
					description: "UI5 Versions composite control sub-title"
				},
				RadioDefaultLabel: {
					type: 'string',
					description: "The default radio button label"
				},
				RadioCustomLabel: {
					type: 'string',
					description: "The custom radio button label"
				},
				DropdownLabel: {
					type: 'string',
					description: "The drop down label"
				}
			},				
			
			aggregations: {
				_dropdownBox: {
					type: "sap.ui.commons.DropdownBox",
					multiple: true,
					visibility: "hidden"
				},
				_radioButtonGroup: {
					type: "sap.ui.commons.RadioButtonGroup",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		
		init: function() {
			var self = this;
			//Define title
			this._title = new ExtendedTitle({});			
			this._subtitle = new sap.ui.commons.TextView({});
			this._subtitle.addStyleClass("compositeControlTextColour");
			
			var oDropDown = new DropdownBox({
				enabled: false,
				busy: false,
				change: this._onDropdownBoxChange.bind(this),
				selectedKey: '{/ui5ActiveVersion}'
			});
			this.addAggregation("_dropdownBox", oDropDown.addStyleClass('ui5VersionVerticalDropDownBox'));

			var oRadioButtonGroup = new RadioButtonGroup({
				items: [
					new sap.ui.core.Item({}),
					new sap.ui.core.Item({})
				], 
				select: this._onRbSelect.bind(self)
			});
			
			this.setAggregation("_radioButtonGroup", oRadioButtonGroup);
		
		},

		onBeforeRendering: function() {
			var self = this;
			// Insure that onBeforeRendering functionality runs once
			if (!this._isVisited) {
				this._isVisited = true;
				
				//Get Resource Bundle for I18n
				var oRessourceBundle = self.getModel("i18n").getResourceBundle();
				if (!this.getControlTitle()) {
					this.setControlTitle(oRessourceBundle.getText("lbl_ui5_title"));	
				}
				self._title.getAggregation("title").setText(this.getControlTitle());
				
				if (!this.getControlSubTitle()) {
					this.setControlSubTitle(oRessourceBundle.getText("lbl_ui5_subtitle"));	
				}
				self._subtitle.setText(this.getControlSubTitle());
				
				//Get aggregation dropwown box object
				var oDropDown = self.getAggregation("_dropdownBox")[0];
				
				//Get aggregation radio button object
				var oRadioButtonGroup = self.getAggregation("_radioButtonGroup");
				if (!this.getRadioDefaultLabel()) {
					this.setRadioDefaultLabel(oRessourceBundle.getText("lbl_radio_default"));	
				}
				
				if (!this.getRadioCustomLabel()) {
					this.setRadioCustomLabel(oRessourceBundle.getText("lbl_radio_custom"));	
				}
				
				oRadioButtonGroup.getItems()[0].setText(this.getRadioDefaultLabel());
				oRadioButtonGroup.getItems()[1].setText(this.getRadioCustomLabel());
				var oEventExtend = jQuery.extend(true, {}, self);
				// Get radio button selected item
				self.getOController().rbGetSelectedIndex(oEventExtend).then(function(selectedIndex) {
					// Set radio button selected item
					if (selectedIndex === 1) {
						// Was selected custom version - set radio button to custom 
						oRadioButtonGroup.setSelectedIndex(selectedIndex);	
						// Enable dropdown
						oDropDown.setEnabled(true);
						// Update model - when custom was selected and there is a UI5 version in the neo-app.json,
						// this version should be selected automatically as a default version
						return self.getOController().rbSelectedUpdateModel(oEventExtend, selectedIndex).then(function() { 
							self._fillDropdownList(self.getOController(), oDropDown);	
						});
					} else {
						oRadioButtonGroup.setSelectedIndex(0);
						//Combo box values
						oDropDown.destroyItems();
						oDropDown.setEnabled(false);
					}
				}).done();	
			}
		},
		
		exit: function() {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}
			if (this._subtitle) {
				this._subtitle.destroy();
				delete this._subtitle;
			}
			
			var _dropdownBox = this.getAggregation("_dropdownBox");
			if (_dropdownBox)
			{
				_dropdownBox[0].destroy();
			}
			
			var _radioButtonGroup = this.getAggregation("_radioButtonGroup");
			if (_radioButtonGroup)
			{
				_radioButtonGroup.destroy();	
			}
		},

		// Radio button select event
		_onRbSelect: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, self);
			var oDropDown = self.getAggregation("_dropdownBox")[0];
			//oDropDown.setBusy(true);
			var selectRbIndex = oEvent.getSource().getSelectedIndex();	
			// Update model with source of the selected UI5 version (internal/external) and what is the selected radio button
			self.getOController().rbSelectedUpdateModel(oEventExtend, selectRbIndex).then(function() {
				if (selectRbIndex === 0) {
					// Set disable and clear drop-down list		
					oDropDown.destroyItems();
					oDropDown.setEnabled(false);
				} else {
					// Set enable 
					oDropDown.setEnabled(true);
					if (oDropDown.getItems().length === 0) {
						self._fillDropdownList(self.getOController(), oDropDown);	
					}
					self.getOController().updateModelDropdownField(oEventExtend);
				}
			}).done(function() {
				//oDropDown.setBusy(false);	
			});
		},
		
		_fillDropdownList: function(oController, oDropDown) {
			// Get UI5 Versions 
			oController.getUIVersions().then(function(aUi5Versions) {
				// Fill/draw drop-down list	
				for (var i = 0; i < aUi5Versions.length; i++) {
					var item = aUi5Versions[i];
					oDropDown.addItem(new sap.ui.core.ListItem({
						key: item.value,
						text: item.display
					}));
				}
			}).done();
		},

		// Change Bindidng event
		_onDropdownBoxChange: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, self);
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			// Update model with source of the selected UI5 version (internal/external)
			self.getOController().dropdownBoxChangeUpdateModel(oEventExtend, sSelectedKey).done();
		},

		renderer: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			oRm.addClass('ui5VersionVertical');
			oRm.writeClasses();
			oRm.write('>');

			oRm.write('<div');
			oRm.renderControl(oControl._title);
			oRm.write("</div>");
			
			//SubTitle Renderer
			oRm.write('<div');
			oRm.renderControl(oControl._subtitle);
			oRm.write("</div>");

			oRm.write('<div');
			oRm.addClass('ui5VersionVertical-content');
			oRm.writeClasses();
			oRm.write('>');
			//Renderer RBG & DDB
			oRm.renderControl(oControl.getAggregation("_radioButtonGroup"));
			oRm.renderControl(oControl.getAggregation("_dropdownBox")[0]);
			
			oRm.write('</div>');
		}
	});
});