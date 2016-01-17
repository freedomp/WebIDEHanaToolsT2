sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {

	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl: "sap/watt/saptoolsets/fiori/project/plugin/fiorireuselibrarytemplate/i18n/i18n.properties"
	});

	return Opa5.createPageObjects({

		inTheAddReferenceToLibraryDialog: {

			baseClass: WebIDEBase,

			actions: {

				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("referenceLibrary_dialog_OK_Button")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},

				iClickCancel: function() {

					return this.waitFor({
						pollingInterval: 4000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),

						success: function(aDialog) {
							return this.waitFor({
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("referenceLibrary_dialog_CANCEL_Button")
								}),
								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!(aDialog[0].isOpen()), "Clicked on Cancel");
										},
										errorMessage: "No Cancel button available"
									});

								}

							});
						}
					}); //success
				},

				iSelectRepository: function(sName) {

					return this.waitFor({
						pollingInterval: 4000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),

						success: function(aDialog) {
							return this.waitFor({
								controlType: "sap.ui.commons.DropdownBox",
								matchers: new sap.ui.test.matchers.Properties({
								    id: "libraryDiscoveryRepositoryDropdownBox"
        							//placeholder: i18nModel.getProperty("LibraryDiscovery_placeholder_repository")
								}),
        						success: function(aDropdownBox) {
        
        							ok(aDropdownBox[0], "LibraryDiscovery Pane is opened");
        							
        							var oItems = aDropdownBox[0].getItems();
    								var oItem;
        							for (var i = 0; i < oItems.length; i++) {
        								if (oItems[i].getText() === sName) {
        								    oItem = oItems[i];
        								    break;
        								}
        							}
        							if (oItem) {
            							this.simulate.click(aDropdownBox[0]);
            							this.simulate.click(aDropdownBox[0]);
            							aDropdownBox[0].setValue(sName);
            							aDropdownBox[0].fireChange({
            								selectedItem: oItem
            							});
            							this.simulate.press("jQuery.sap.KeyCodes.ENTER");
        							} else {
    									ok(false, "Item with value: " + sName + " doesn't exist.");
        							}
        
        						},

        						errorMessage: "No DropdownBox was found"
							});
						}
					}); //success
					
				}
				
			},
			assertions: {

				isDialogOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),
						success: function(aDialog) {
							ok(aDialog[0], "the dialog is opened");
						},
						errorMessage: "Error opening Add Reference To Library dialog"
					});
				},

				iSeeLibrary: function(sName) {
					return this.waitFor({
						pollingInterval: 4000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),

						success: function(aDialog) {
        					return this.waitFor({
        						pollingInterval: 6000,
        						controlType: "sap.ui.table.TreeTable",
        						matchers: new sap.ui.test.matchers.Properties({
        							id: "oLibDiscoveryDataTable"
        						}),
        						success: function(aTable) {
        						    var aLibraries  = aTable[0].getBinding().getModel().getData().root.items;
        						    var bFound = false;
        							for (var i = 0; i < aLibraries.length; i++) {
        						        if (aLibraries[i].name === sName) {
                                            bFound = true;
                                            break;
        						        }
        							}
        							ok(bFound, sName + " library exist in the table");
        						},
        						errorMessage: "Error finding library discovery table"
        					});
						}
					});
				},
				
				iSeeNumberOfLibraries: function(iNumber) {
					return this.waitFor({
						pollingInterval: 4000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("referenceLibrary_dialogTitle")
						}),

						success: function(aDialog) {
        					return this.waitFor({
        						pollingInterval: 6000,
        						controlType: "sap.ui.table.TreeTable",
        						matchers: new sap.ui.test.matchers.Properties({
        							id: "oLibDiscoveryDataTable"
        						}),
        						success: function(aTable) {
        						    var aLibraries  = aTable[0].getBinding().getModel().getData().root.items;
        							ok((aLibraries.length === iNumber), "There are " + iNumber + "libraries");
        						},
        						errorMessage: "Error finding library discovery table"
        					});
						}
					});
				}
				
			} //assertion
		} 

	});

});
