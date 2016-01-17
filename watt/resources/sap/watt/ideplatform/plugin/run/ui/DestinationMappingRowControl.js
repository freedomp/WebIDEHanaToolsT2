sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";

	return Control.extend('DestinationMappingRowControl', {
		metadata: {
			properties: {
				oController: "object"
			},

			aggregations: {
				sourceLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				targetDropdownBox: {
					type: 'sap.ui.commons.DropdownBox',
					multiple: false,
					visibility: "hidden"
				},
				_oRowGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		init: function () {
			this.setAggregation("sourceLabel", new sap.ui.commons.Label({
				text: "{source}",
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			})); 

			var oTargetDropdownBox = new sap.ui.commons.DropdownBox({
				displaySecondaryValues: true,
				width: "100%",
				change: this._onBackendChange.bind(this),
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			});
			           
			this.setAggregation("targetDropdownBox", oTargetDropdownBox);

			oTargetDropdownBox.addEventDelegate({
				onAfterRendering: $.proxy(function (oEvent) {
					this._generateDropBox(oEvent);
				})
			}, this);
			
			var oRowGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0.5,
				hSpacing: 0.5,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			oRowGrid.addContent(this.getAggregation("sourceLabel"));
			oRowGrid.addContent(oTargetDropdownBox);
			this.setAggregation("_oRowGrid", oRowGrid);
		},
		
		// Generate dropdown items and set selected value
		_generateDropBox: function (oEvent) {
			var oDropDown = oEvent.srcControl;
			var that = this;
			// Generate the dropdown items only once for each dropdown - in case it was not generated yet
			this.getOController().getTargetDestinations().then(function (aTargetDestinations) {
				if (oDropDown.getItems().length == 0) {
					// Create an item for each target destination
					var oItem = new sap.ui.core.ListItem();
					oDropDown.addItem(oItem);
					for (var i = 0; i < aTargetDestinations.length; i++) {
						oItem = new sap.ui.core.ListItem({
							key: aTargetDestinations[i],
							text: aTargetDestinations[i]
						});
						oDropDown.addItem(oItem);
					}
					// Set the selected value of the dropbox based on the model destination
					that.getOController().getBackendSystemModel(oDropDown.getModel()).then(function (oSelectedDestination) {
						var sDropDownIndex = oEvent.srcControl.getBindingContext().getPath().slice(15);
						oDropDown.setValue(oSelectedDestination[sDropDownIndex].destinations);
					});
				}
			});		
		},
		
		// Destination backend system selected - update the model
		_onBackendChange: function (oEvent) {
			var oDropDown = oEvent.getSource();
			var sDropDownIndex = oDropDown.getBindingContext().sPath;
			sDropDownIndex = sDropDownIndex.slice(15);
			this.getOController().onTargetChanged(oDropDown.getModel(), sDropDownIndex, oEvent.mParameters.newValue).done();
		},
		renderer: function (oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			oRm.write('>');
			oRm.renderControl(oControl.getAggregation("_oRowGrid"));
			oRm.write('</div>');
		},


		exit: function () {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}

			var oSourceLabel = this.getAggregation("sourceLabel");
			if (oSourceLabel) {
				oSourceLabel.destroy();
			}
			var oTargetDropdownBox = this.getAggregation("targetDropdownBox");
			if (oTargetDropdownBox) {
				oTargetDropdownBox.destroy();
			}
			var oRowGrid = this.getAggregation("_oRowGrid");
			if (oRowGrid) {
				oRowGrid.destroy();
			}
		}
	});
});