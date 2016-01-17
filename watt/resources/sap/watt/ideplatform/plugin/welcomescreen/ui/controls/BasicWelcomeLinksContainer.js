define(["./BasicWelcomeContainer"], function() {
	"use strict";
	sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeContainer.extend(
		"sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeLinksContainer", {

			metadata: {
				properties: {
					"i18nSource": "object",
					"showDescription": {
						type: "boolean",
						defaultValue: "false"
					},
					"linksModel": "object"
				}
			},

			/**
			 *
			 * @param dataObject - //TODO add documentation
			 * @param fnPressHandler {function} - generic event handler for the press event. Receives the link description
			 * 									  as a parameter and handles the click on the link with that description.
			 * 									  This is a synchronous function. It's return value is irrelevant.
			 */
			setLinksModel: function(dataObject, fnPressHandler) {
				var that = this;
				this.setProperty("linksModel", dataObject);
				var i18n = this.getI18nSource();
				var showDesc = this.getShowDescription();

				var oRowRepeater = new sap.ui.commons.RowRepeater({
					design: "BareShell",
					numberOfRows: dataObject.data.length
				});

				var oFTV1 = new sap.ui.commons.FormattedTextView();

				// create JSON model
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(dataObject);
				oRowRepeater.setModel(oModel);

				var link = new sap.ui.commons.Link({
					target: "_blank",
					press: function() {
						var linkKey = this.getBindingContext().getObject().linkDesc;
						fnPressHandler(linkKey);
					}
				});
				link.bindProperty("href", "href");
				link.bindProperty("text", "linkDesc", function(value) {
					return i18n.getText("i18n", value);
				});

				//the row itself
				var sHtmlText = "<embed data-index=\"0\"><br><embed data-index=\"1\">";

				//set formatted text object
				oFTV1.setHtmlText(sHtmlText);
				oFTV1.addControl(link);

				if (showDesc === true) {
					var label = new sap.ui.commons.Link();
					label.bindProperty("text", "text", function(value) {
						return i18n.getText("i18n", value);
					});
					label.setEnabled(false);
					label.addStyleClass("welcomeLinkLabel");
					oFTV1.addControl(label);
				}

				oRowRepeater.bindRows("/data", oFTV1);
				this.removeContent();
				this.addContent(oRowRepeater);
			},

			renderer: {}
		});
});