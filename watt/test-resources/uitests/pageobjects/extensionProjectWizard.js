sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase", "uitests/pageobjects/menu"], function(Opa5, WebIDEBase, menu) {
	"use strict";

	var inTheMenuBar = menu.inTheMenuBar.actions;

	var fnWaitForNextBtn = function(fnSuccessHandler, sErrorMessage) {
		var that = this;
		return this.waitFor({
			controlType: "sap.ui.commons.Button",
			matchers: [
				new sap.ui.test.matchers.PropertyStrictEquals({
					name: "text",
					value: "Next"
				}),
				function(oControl) {
					return that.isOnScreen(oControl);
				}
			],
			success: fnSuccessHandler,
			errorMessage: sErrorMessage
		});
	};

	var fnWaitForFinishBtn = function(fnSuccessHandler, sErrorMessage) {
		var that = this;
		return this.waitFor({
			controlType: "sap.ui.commons.Button",
			matchers: [
				new sap.ui.test.matchers.PropertyStrictEquals({
					name: "text",
					value: "Finish"
				}),
				function(oControl) {
					return that.isOnScreen(oControl);
				}
			],
			success: fnSuccessHandler,
			errorMessage: sErrorMessage
		});
	};

	return Opa5.createPageObjects({
		inTheExtensionProjectWizard: {
			baseClass: WebIDEBase,

			actions: {
				iOpenExtensionProjectWizard: function() {
					return inTheMenuBar.iOpenExtensionProjectWizard();
				},

				iClickNext: function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						this.simulate.click(aButtons[0]);
					}, "Wizard: Next button is not available");
				},

				iClickFinish: function() {
					return fnWaitForFinishBtn.call(this, function(aButtons) {
						this.simulate.click(aButtons[0]);
					}, "Wizard: Finish button is not available");
				}
			},
			assertions: {
			    iSeeTheWizardIsOpen: function() {
					return this.waitFor({
						id: "CreateExtensionProjectWizardUI"
					});
				},
				iCanClickNext: function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						//Next can be clicked at multiple places
				// 		for (var i = 0; i < aButtons.length; i++) {
				// 			ok(aButtons[i].getEnabled(), "Next Button should be enabled");
				// 		}
				        ok(aButtons[0].getEnabled());
					}, "Wizard: Next button not enabled");
				},
				iCanClickFinish: function() {
					return fnWaitForFinishBtn.call(this, function(aButtons) {
						ok(aButtons[0].getEnabled(), "Finish Button should be enabled");
					}, "Wizard: Finish button not enabled");
				}
			}
		}
	});
});