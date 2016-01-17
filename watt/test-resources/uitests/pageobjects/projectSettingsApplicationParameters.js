sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {
	"use strict";

	var fnWaitForOkBtn = function(fnSuccessHandler, sErrorMessage) {
		var that = this;
		return this.waitFor({
			controlType: "sap.ui.commons.Button",
			matchers: [
				new sap.ui.test.matchers.PropertyStrictEquals({
					name: "text",
					value: "OK"
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
		inTheProjectSettingsApplicationParameters: {
			baseClass: WebIDEBase,

			actions: {

				iAddParameter: function() {
					return this.waitFor({
						id: "AddParamBtn",
						success: function(oButton) {
							this.simulate.click(oButton);
						},
						errorMessage: "There was no Add Parameter button"
					});
				},

				iClickSaveButton: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: "Save"
						}),
						success: function(aButtons) {
							this.simulate.click(aButtons[1]);
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
				},

				iFillInput: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.TextField",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: /^Parameter/
						}),
						success: function(aInputField) {
							for (var i = 0; i < aInputField.length; i++) {
								if (aInputField[i].getProperty("placeholder") === "Enter Parameter Name") {
									this.simulate.typeInto(aInputField[i], "paramName" + i);
								} else if (aInputField[i].getProperty("placeholder") === "Enter Parameter Value") {
									this.simulate.typeInto(aInputField[i], "paramValue" + i);
								}
							}
						},
						errorMessage: "There was no input fields"
					});
				},

				iClickOk: function() {
					return fnWaitForOkBtn.call(this, function(aButtons) {
						this.simulate.click(aButtons[0]);
					}, "Save: Ok button not available", "OK");
				}

			},

			assertions: {

				iSeeApplicationParametersUI: function() {
					return this.waitFor({
						id: "dataGrid",
						success: function() {
							ok(true, "I see the main application settings grid");
						},
						errorMessage: "There was no application settings grid"
					});
				},

				iCanClickOk: function() {
					return fnWaitForOkBtn.call(this, function(aButtons) {
						ok(aButtons[0].getEnabled(), "Ok Button should be enabled");
					}, "Save Settings: Ok button not enabled");
				},

				iseeAllNewParameters: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.TextField",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: /^Parameter/
						}),
						success: function(aInputField) {
							var count = 0;
							for (var i = 0; i < aInputField.length; i++) {
								if (aInputField[i].getProperty("value").indexOf("param") > -1) {
									count++;
								}
							}
							ok(count === 6, "Six name or value parameter should be found");
						},
						errorMessage: "There was no six input fields"
					});
				}

			}
		}

	}); //end of Opa5.createPageObjects
});