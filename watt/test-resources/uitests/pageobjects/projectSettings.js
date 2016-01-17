sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {
	"use strict";

	//var fnWaitForOkBtn = function(fnSuccessHandler, sErrorMessage) {
	//	var that = this;
	//	return this.waitFor({
	//		controlType: "sap.ui.commons.Button",
	//		matchers: [
	//			new sap.ui.test.matchers.PropertyStrictEquals({
	//				name: "text",
	//				value: "OK"
	//			}),
	//			function(oControl) {
	//				return that.isOnScreen(oControl);
	//			}
	//		],
	//		success: fnSuccessHandler,
	//		errorMessage: sErrorMessage
	//	});
	//};

	return Opa5.createPageObjects({
		inTheProjectSettings: {
			baseClass: WebIDEBase,

			actions: {

				iClickOnCategoryWithText: function(categoryName) {
					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: categoryName
						}),
						success: function(aButtons) {
							this.simulate.click(aButtons[1]);
						},
						errorMessage: "There was no category "+ categoryName
					});
				},

				iClickSaveButton: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: "Save"
						}),
						success: function(aButtons) {
							this.simulate.click(aButtons[0]);
						},
						errorMessage: "There was no Save button"
					});
				},

				iClickCloseButton: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: "Close"
						}),
						success: function(aButtons) {
							this.simulate.click(aButtons[0]);
						},
						errorMessage: "There was no Close button"
					});
				}

			},

			assertions: {


			}
		}

	}); //end of Opa5.createPageObjects
});