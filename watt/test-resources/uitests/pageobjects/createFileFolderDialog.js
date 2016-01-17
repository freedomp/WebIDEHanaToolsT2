sap.ui.define(["sap/ui/test/Opa5","uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase){
	"use strict";

	var fnWaitForCreateBtn = function(fnSuccessHandler, sErrorMessage) {
		return this.waitFor({
			controlType: "sap.ui.commons.Button",
			matchers: new sap.ui.test.matchers.PropertyStrictEquals({
				name: "text",
				value: "Create"
			}),
			success: fnSuccessHandler,

			errorMessage: sErrorMessage
		});
	};

	return Opa5.createPageObjects({
		inTheDialog: {
            baseClass : WebIDEBase,
            
			actions: {
				iClickButton: function(sButton) {
					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: sButton
						}),
						success: function(aButtons) {
							this.simulate.click(aButtons[0]);
						},
						errorMessage: "There was no create button"
					});
				},

				iClickCreate: function() {
					this.iClickButton("OK");
				},

				iClickCancel: function() {
					this.iClickButton("Cancel");
				},

				iEnterName: function(sName) {
					return this.waitFor({
						controlType: "sap.ui.commons.TextField",
						success: function(aInputField) {
							this.simulate.typeInto(aInputField[0], sName);
						},
						errorMessage: "No input field available"
					});
				}
			},
			assertions: {
				iCanClickCreate: function(bEnabled) {

					if (bEnabled === undefined) {
						bEnabled = true;
					}

					return fnWaitForCreateBtn.call(this, function(aButtons) {
						//Next can be clicked at multiple places
						for (var i = 0; i < aButtons.length; i++) {
							equals(bEnabled, aButtons[i].getEnabled(), "Cancel Button should be ...");
						}
					}, "Wizard: Next button not enabled");
				},

				iCannotClickCreate: function() {
					return this.iCanClickCreate(false);
				}
			}
		}

	});
});