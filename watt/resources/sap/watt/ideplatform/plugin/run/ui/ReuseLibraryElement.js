sap.ui.define(["sap/ui/core/Control"], function(Control) {
	"use strict";

	return Control.extend("ReuseLibraryElement", {
		metadata: {

			properties: {
				oController: "object"
			},

			aggregations: {
				textbox: {
					type: "sap.ui.commons.TextField",
					multiple: false,
					visibility: "hidden"
				},
				dropDownBox: {
					type: "sap.ui.commons.DropdownBox",
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

		init: function() {
			
			var rowGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0.5,
				hSpacing: 0.5,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			var libName = new sap.ui.commons.TextField({
				value: "{libraryName}",
				enabled: false,
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			});

			this.setAggregation("textbox", libName);

			var oListItemTemplate = new sap.ui.core.ListItem({
				key: "{version}",
				text: "{details}"
			});
			
			var libVersion = new sap.ui.commons.DropdownBox({
				displaySecondaryValues: true,
				value: "{detailVersion}",
				width: "100%",
				change: this._onDropdownSelect.bind(this),
				enabled: {
					path: "libraryVersion",
					formatter: function(libraryVersion) {
						return libraryVersion === undefined ? false : true;
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L6 M6 S6"
				})
			}).bindItems("versions", oListItemTemplate);

			this.setAggregation("dropDownBox", libVersion);
			
			rowGrid.addContent(libName);
			rowGrid.addContent(libVersion);
			this.setAggregation("_oRowGrid", rowGrid);

		},

		_onDropdownSelect: function(oEvent) {
			var self = this;
			var oEventExtend = jQuery.extend(true, {}, oEvent);
			self.getOController().onLibVersionChange(oEventExtend).done();
		},

		renderer: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			//oRm.addClass('myControlProperty');
			//oRm.writeClasses();
			oRm.write('>');
			oRm.renderControl(oControl.getAggregation("_oRowGrid"));
			oRm.write('</div>');
		}

	});

});