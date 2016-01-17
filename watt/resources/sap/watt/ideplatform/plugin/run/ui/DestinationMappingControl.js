sap.ui.define([
	"sap/ui/core/Control", "sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl"
], function(Control,ExtendedTitle) {
	"use strict";

	return Control.extend('DestinationMappingControl', {
		_bIsRendered: false,
		
		metadata: {
			properties: {
				oController: {
					type: "object"
				},
				Title: {
					type: 'string',
					description: "Title text"
				},
				SubTitle: {
					type: 'string',
					description: "Sub title text"
				},
				SourceHeader: {
					type: 'string',
					description: "Source header text"
				},			
				TargetHeader: {
					type: 'string',
					description: "Target header text"
				}				
			},

			aggregations: {
				_oSubTitleLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_oHeaderSourceLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_oHeaderTargetLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_oEmptyTableMessageLabel: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_oMainGrid: {
					type: "sap.ui.layout.Grid",
					multiple: false,
					visibility: "hidden"
				},
				// Template for each row of the table
				rows: "DestinationMappingRowControl"
			}
		},

		init: function () {
			// Create mian UI objects
			// Title
			this._title = new ExtendedTitle({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			// Sub Title
			var oInfoLabel = new sap.ui.commons.Label({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("compositeControlTextColour labelPaddingLeft");
			this.setAggregation("_oSubTitleLabel", oInfoLabel);
			// Table Header
			this.setAggregation("_oHeaderSourceLabel", new sap.ui.commons.Label({
				design: "Bold",
				//width: "25%"
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			}));
			this.setAggregation("_oHeaderTargetLabel", new sap.ui.commons.Label({
				design: "Bold",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				})
			}));
			// Message in case of empty table
			this.setAggregation("_oEmptyTableMessageLabel", new sap.ui.commons.Label({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}));
			// Main grid with all the UI elements except the table lines
			this.setAggregation("_oMainGrid", new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0.5,
				hSpacing: 0.5,
				content: [this._title, this.getAggregation("_oSubTitleLabel")],
				//this.getAggregation("_oHeaderGrid")],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}));
		},

		onBeforeRendering: function () {
			if (!this._bIsRendered) {
				this._bIsRendered = true;

				//Get Resource Bundle for I18n
				var oRessourceBundle = this.getModel("i18n").getResourceBundle();

				// If the text for titles and headers was not send from the properties of the control, set default texts
				if (!this.getTitle()) {
					this.setTitle(oRessourceBundle.getText("destination_mapping_title"));
				}
				if (!this.getSubTitle()) {
					this.setSubTitle(oRessourceBundle.getText("destination_mapping_subtitle"));
				}

				// Set texts to the UI objects
				this._title.getAggregation("title").setText(this.getTitle());
				var aMainGrid = this.getAggregation("_oMainGrid");

				var that = this;
				this.getOController().getSourceDestinations().then(function (aSourceDestinations) {
					//TODO - in case the dropdown is empty (no systems in Target systems list) - don't show the table
					//that.getOController().getTargetDestinations().then(function (aTargetDestinations) {

						var aGridContents = aMainGrid.getContent();
						aGridContents[1].setText(that.getSubTitle());

						if (aSourceDestinations.length == 0 ){//|| aTargetDestinations.length == 0) {
							var oEmptyTableMessageLabel = that.getAggregation("_oEmptyTableMessageLabel");
							oEmptyTableMessageLabel.setText(oRessourceBundle.getText("destination_mapping_empty_table_message"));
							aMainGrid.addContent(oEmptyTableMessageLabel);
						} else {
							if (!that.getSourceHeader()) {
								that.setSourceHeader(oRessourceBundle.getText("destination_mapping_header_source"));
							}
							if (!that.getTargetHeader()) {
								that.setTargetHeader(oRessourceBundle.getText("destination_mapping_header_target"));
							}
							var oHeaderSourceLabel = that.getAggregation("_oHeaderSourceLabel");
							oHeaderSourceLabel.setText(that.getSourceHeader());

							var oHeaderTargetLabel = that.getAggregation("_oHeaderTargetLabel");
							oHeaderTargetLabel.setText(that.getTargetHeader());
							aMainGrid.addContent(oHeaderSourceLabel);
							aMainGrid.addContent(oHeaderTargetLabel);
						}
						// Update model in case of change in systems
						var oEventExtend = jQuery.extend(true, {}, that);
						that.getOController().updateModel(oEventExtend).then(function () {
						}).done();
				}).done();
			}
		},

		renderer: function (oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			oRm.write('>');
			// Title, subtitle, table header or message in case table is empty 
			oRm.renderControl(oControl.getAggregation("_oMainGrid"));
			// Mapping table - Body
			oControl.getRows().forEach(function (r) {
				oRm.renderControl(r);
			});
			oRm.write("</div>");
		},

		exit: function () {
			if (this._title) {
				this._title.destroy();
				delete this._title;
			}
			var _oSubTitleLabel = this.getAggregation("_oSubTitleLabel");
			if (_oSubTitleLabel) {
				_oSubTitleLabel.destroy();
			}
			var _oHeaderSourceLabel = this.getAggregation("_oHeaderSourceLabel");
			if (_oHeaderSourceLabel) {
				_oHeaderSourceLabel.destroy();
			}
			var _oHeaderTargetLabel = this.getAggregation("_oHeaderTargetLabel");
			if (_oHeaderTargetLabel) {
				_oHeaderTargetLabel.destroy();
			}
			var _oEmptyTableMessageLabel = this.getAggregation("_oEmptyTableMessageLabel");
			if (_oEmptyTableMessageLabel) {
				_oEmptyTableMessageLabel.destroy();
			}
			var _oMainGrid = this.getAggregation("_oMainGrid");
			if (_oMainGrid) {
				_oMainGrid.destroy();
			}
			var _oRows = this.getAggregation("rows");
			if (_oRows) {
				for (var i = 0; i < _oRows.length; i++) {
					_oRows[i].destroy();
				}
			}
		}
	});
});