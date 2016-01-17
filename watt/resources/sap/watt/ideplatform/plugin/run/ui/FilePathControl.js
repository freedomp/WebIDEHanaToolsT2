sap.ui.define([
	"sap/ui/core/Control", "sap/ui/commons/Label", "sap/watt/ideplatform/plugin/run/ui/TitleExtendedControl",
	"sap/ui/commons/DropdownBox"
], function(Control, Label, ExtendedTitle, DropdownBox) {

	return Control.extend("FilePathCompositeControl", {

		metadata: {
			properties: {
				text: {
					type: "string"
				},
				oController: {
					type: "object"
				},
				ControlTitle: {
					type: "string",
					description: "Runner File Title"
				},
				additionalText: {
					type: "string"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},
				controlData: {
					type: "object",
					defaultValue: []
				}
			},
			aggregations: {
				_label: {
					type: "sap.ui.commons.Label",
					multiple: false,
					visibility: "hidden"
				},
				_dropdownList: {
					type: "sap.ui.commons.DropdownBox",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				change: {}
			}
		},

		init: function() {
			this.setAggregation("_label", new Label({
				text: "{i18n>lbl_file_path}",
				layoutData: new sap.ui.layout.GridData({
					span: "L2 M2 S2"
				})
			}).addStyleClass("labelPaddingLeft"));

			this._title = new ExtendedTitle({});
		},

		onBeforeRendering: function() {
			var self = this;
			//Get Title
			if (!this.getControlTitle()) {
				var oRessourceBundle = this.getModel("i18n").getResourceBundle();
				this.setControlTitle(oRessourceBundle.getText("ttl_file_path"));
			}
			self._title.getAggregation("title").setText(this.getControlTitle());

			//Create drop down box 
			var ddl = new DropdownBox({
				width: "500px",
				displaySecondaryValues: true,
				change: function(e) {
					self.fireChange({
						newValue: e.getParameter("newValue"),
						selectedItem: e.getParameter("selectedItem")
					});
				}
			});

			//Add super prototype
			ddl.onclick = function(oEvent) {
				sap.ui.commons.ComboBox.prototype.onclick.apply(this, arguments);
				ddl._getListBox().addStyleClass("runconfigurationFilePath");
			};

			self.setAggregation("_dropdownList", ddl);

			// get values from control service
			var aRunnableFile = self.getControlData();
			// add items to the dropdown list
			if (aRunnableFile.length > 1) {
				// add empty item to the list
				ddl.addItem(new sap.ui.core.ListItem({
					key: "",
					text: "",
					additionalText: ""
				}));
			}
			aRunnableFile.forEach(function(x) {
				// remove project name from path
				var sNoProjName = "/" + x.fullPath.split("/").slice(2).join("/");
				ddl.addItem(new sap.ui.core.ListItem({
					key: x.fullPath,
					text: x.name,
					additionalText: sNoProjName
				}));
			});

			// event delegate to validate path after rendering
			self.addEventDelegate({
				onAfterRendering: $.proxy(function(oEvent) {
					this.getOController().onAfterPathFieldRendering(oEvent);
				})
			}, this);

			//Attach change event to the composite control that was fired by dropdown change event
			self.attachChange(function(oEvent) {
				var oA = jQuery.extend(true, {}, oEvent);
				this.getOController().onPathFieldChange(oA);
			});

			//Fix UI5 issue when the file name is long the listBox exceed the parent size
			ddl._getListBox().addDelegate({
				onAfterRendering: jQuery.proxy(function(oEvent) {
					this.$().css({
						"width": "5px",
						"border-collapse": "separate"
					});
				}, ddl._getListBox(), self)
			});

			// ddl._getListBox().addDelegate({
			// 	onAfterRendering: function() {
			// 		//Mark First value in bold
			// 		$("#" + ddl._getListBox().getId() + " .sapUiLbxITxt").each(function(index, element) {
			// 			var typedVal = ddl._sTypedChars.toLowerCase();
			// 			var rep = new RegExp("(" + typedVal + ")", "ig");
			// 			element.innerHTML = element.innerHTML.replace(rep, "<b>$1</b>");
			// 		});
			// 		//Mark Secondary value in bold
			// 		$("#" + ddl._getListBox().getId() + " .sapUiLbxISec").each(function(index, element) {
			// 			var typeValsec = ddl._sTypedChars.toLowerCase();
			// 			var rep = new RegExp("(" + typeValsec + ")", "ig");
			// 			element.innerHTML = element.innerHTML.replace(rep, "<b>$1</b>");
			// 		});
			// 	}
			// });

		},
		exit: function() {
			if (this._title) {
				this._title.destroy();
			}
			var oLabel = this.getAggregation("_label");
			if (oLabel) {
				oLabel.destroy();
			}
			var oDropdown = this.getAggregation("_dropdownList");
			if (oDropdown) {
				oDropdown.destroy();
			}
		},

		renderer: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);
			oRm.write('>');
			oRm.renderControl(oControl._title);
			oRm.write("<div");
			oRm.addClass("sapUiRespGrid sapUiRespGridHSpace0 sapUiRespGridMedia-Std-LargeDesktop sapUiRespGridVSpace1");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write('<div');
			oRm.addClass("sapUiRespGridSpanL2 sapUiRespGridSpanM2 sapUiRespGridSpanS2 sapUiRespGridSpanXL2");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_label"));
			oRm.write("</div>");
			oRm.write('<div');
			oRm.addClass("sapUiRespGridSpanL10 sapUiRespGridSpanM10 sapUiRespGridSpanS10 sapUiRespGridSpanXL10");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_dropdownList"));
			oRm.write("</div>");
			oRm.write('</div>');
			oRm.write('</div>');
		}
	});
});