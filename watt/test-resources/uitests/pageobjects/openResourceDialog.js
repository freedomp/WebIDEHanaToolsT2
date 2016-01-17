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

				iClickOK: function() {
					this.iClickButton("OK");
				},

				iClickCancel: function() {
					this.iClickButton("Cancel");
				},
				
				iClickInTheTable: function() {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						success: function(aTables) {
							this.simulate.click(aTables[0]);
						},
						errorMessage: "No table found"
					});
				},
				
				iPressTheFollowingKey: function(sKeyName) {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						success: function(aTables) {
							this.simulate.click(aTables[0]);
							this.simulate.press(sKeyName, {
								target: aTables[0]
							});
						},
						errorMessage: "No table found"
					});
				},
				
				iEnter: function(sName) {
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
				},
				
				iStoreResourceNameInContext: function (oTestParam) {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						success: function(aTables) {
							this.simulate.click(aTables[0]);
							oTestParam.name = aTables[0].getRows()[aTables[0].getSelectedIndex()].getCells()[0].getText();
							oTestParam.parentPath = aTables[0].getRows()[aTables[0].getSelectedIndex()].getCells()[1].getText();
						},
						errorMessage: "No table found"
					});
				}, 
				
				iExpectSelectionOnRowNumber: function(iIndex) {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						success: function(aTables) {
							this.simulate.click(aTables[0]);
							var iSelectedIndex = aTables[0].getSelectedIndex();
							ok(iSelectedIndex == iIndex, "Expected selection on row number: " + iIndex + " and was: " + iSelectedIndex);
						},
						errorMessage: "No table found"
					});
				},
				
				iExpectThatTableHasNoHeader: function(iIndex) {
					return this.waitFor({
						controlType: "sap.ui.table.Table",
						success: function(aTables) {
							this.simulate.click(aTables[0]);
							ok(!aTables[0].getColumnHeaderVisible(), "Table should not have a table header");
						},
						errorMessage: "No table found"
					});
				}
				
			}
		}

	});
});