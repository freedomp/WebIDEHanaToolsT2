sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase", "uitests/pageobjects/menu"], function(Opa5, WebIDEBase, menu) {
	"use strict";

	var inTheMenuBar = menu.inTheMenuBar.actions;

	return Opa5.createPageObjects({
		inTheWelcomeScreen: {
			baseClass: WebIDEBase,

			actions: {
				
				iOpenWelcomeScreen: function() {
					return inTheMenuBar.iOpenWelcomeScreen();
				},
				
				iPressExtensionTile : function() {
					return this.waitFor({
						controlType : "sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeTile",
						matchers : new sap.ui.test.matchers.Properties({
							title : /^New Extension Project/
						}),
						success : function(aButtons) {
							this.simulate.click(aButtons[0]);
						},
						errorMessage : "New Extension Project Tile not found"
					});
				}

			},
			assertions: {
				iSeeWelcomeView : function() {
					return this.waitFor({
						check: function() {
						    var view = this.byId("welcomeView");
							if (view !== undefined) {
								return true;
							}
							return false;
						},
						success: function() {
							ok("Welcome Screen is open");
						},
						errorMessage: "Welcome Screen not open"

					});
				}
			}
		}
	});
});