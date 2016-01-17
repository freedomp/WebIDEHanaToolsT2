sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase", "uitests/pageobjects/menu"], function(Opa5, WebIDEBase, menu) {
	"use strict";

	var inTheMenuBar = menu.inTheMenuBar.actions;

	return Opa5.createPageObjects({
		inTheExtensibilityPane: {
			baseClass: WebIDEBase,

			actions: {

				iEnterExtensibilityPane: function() {
					return this.waitFor({
						check: function() {
						    var layout = $("ExtensionPreviewContainer-content");
							if (layout !== []) {
								return true;
							}
							return false;
						},
						success: function() {
							ok("Extensability Pane is running");
						},
						errorMessage: "Extensability Pane not running"

					});
				},
				iOpenExtensibilityPane: function() {
					inTheMenuBar.iOpenExtensibilityPane();
					return this.iEnterExtensibilityPane();
				}

			},
			assertions: {

			}
		}
	});
});