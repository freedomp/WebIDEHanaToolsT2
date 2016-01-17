sap.ui.define([ "sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase", "uitests/pageobjects/menu" ], function(Opa5, WebIDEBase, menu) {
	"use strict";

	var inTheMenuBar = menu.inTheMenuBar.actions;

	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl: "sap/watt/saptoolsets/fiori/project/plugin/fiorireuselibrarytemplate/i18n/i18n.properties"
	});
	
	var fnWaitForNextBtn = function(fnSuccessHandler, sErrorMessage, sText) {
		return this.waitFor({
			controlType : "sap.ui.commons.Button",
			matchers : new sap.ui.test.matchers.Properties({
				text : sText
			}),
			success : fnSuccessHandler,

			errorMessage : sErrorMessage
		});
	};

	return Opa5.createPageObjects({
		inTheWizard : {
			baseClass : WebIDEBase,

			actions : {
				iSeeTheWizardIsOpen : function() {
					return this.waitFor({
						id : "CreateGenerationWizardUI"
					});
				},
            iEnterComponentName : function(sName) {	
                    return this.waitFor({	
                        controlType : "sap.ui.commons.Label",
                        pollingInterval: 3000,
                        matchers : new sap.ui.test.matchers.Properties({	
                             text : i18nModel.getProperty("reuselibrarycomponent_model_field_component_name") + "*"
                        }),	
                        success : function(aLabel) {	
                        //TODO find a more stable way to find input field in the wizard 	
                            var oInput = aLabel[0].$().parent().siblings().children("input")[0];	
                            var oTextView = this.byId(oInput.id);	
                            this.simulate.typeInto(oTextView, sName);	
                        },	
                        errorMessage : "Wizard: Component name is not available"	
                    });	
             },
	           iEnterALibraryDescriptionName : function(sName) {	
                    return this.waitFor({	
                        controlType : "sap.ui.commons.Label",	
                        matchers : new sap.ui.test.matchers.Properties({	
                             //text : /^Library Description/	
                             text : i18nModel.getProperty("reuselibrary_model_field_library_description")
                        }),	
                        success : function(aLabel) {	
                        //TODO find a more stable way to find input field in the wizard 	
                            var oInput = aLabel[0].$().parent().siblings().children("input")[1];	
                            var oTextView = this.byId(oInput.id);	
                            this.simulate.typeInto(oTextView, sName);	
                        },	
                        errorMessage : "Wizard: Library Description is not available"	
                    });	
                },
				iEnterAProjectName : function(sName) {
					return this.waitFor({
						controlType : "sap.ui.commons.TextView",
						matchers : new sap.ui.test.matchers.Properties({
							text : /^Project Name/
						}),
						success : function(aLabel) {
							//TODO find a more stable way to find input field in the wizard
							var oInput = aLabel[0].$().parent().siblings().children("input")[0];
							var oTextView = this.byId(oInput.id);
							this.simulate.typeInto(oTextView, sName);
						},
						errorMessage : "Wizard: Project Name is not available"
					});
				},

				iSelectTemplate : function(sName) {
					this.waitFor({
						controlType : "sap.ui.commons.ComboBox",
						pollingInterval : 3000,
						matchers : new sap.ui.test.matchers.Properties({
							value : "All Categories"
						}),
						success : function(aComboBox) {
							var comboboxId = aComboBox[0].sId;
							this.byId(comboboxId).setValue("All Categories");
						},
						errorMessage : "Wizard: Categories ComboBox is not available"
					});

					return this.waitFor({
						controlType : "sap.ui.commons.TextView",
						pollingInterval : 3000,
						matchers : new sap.ui.test.matchers.Properties({
							text : sName
						}),
						success : function(aLabel) {

							//TODO find a more stable way to find input field in the wizard
							var oInput = aLabel[0].$().parent().children()[0];
							var oTextView = this.byId(oInput.id);
							this.simulate.click(oTextView);
						},
						errorMessage : "Wizard: Template is not available"
					});
				},
				
				iSelectSource : function(sName) {
					return this.waitFor({
						controlType : "sap.ui.core.Item",
						pollingInterval : 3000,
						matchers : new sap.ui.test.matchers.Properties({
						    text : sName
						}),
	
						success : function(aLabel) {
							this.simulate.click(aLabel[0]);
						},
						errorMessage : "Wizard: Source is not available"
					});
				},
				
				// iSelectFile: function(sFile) {
				// 	return this.waitFor({
				// 		controlType : "sap.ui.core.Control",
				// 		pollingInterval : 3000,
				// 	    matchers : new sap.ui.test.matchers.Properties({
				// 		 id: "DataConnectionRepositoryBrowserContent"
				// 		}),
					
				// 		success : function(aView) {
		   
				// 		},
				// 		errorMessage : "Wizard: aUploader is not available"
				// 	});
				// },
				
				iSelectSystem: function(sName) {
					return this.waitFor({
						controlType : "sap.ui.commons.DropdownBox",
						pollingInterval : 3000,
					    matchers : new sap.ui.test.matchers.Properties({
							id: "DataConnectionPasteURLDestinationsComboBox"
						}),
					
						success : function(aDropBox) {
						    
						 this.simulate.click(aDropBox[0]);
				         var aItems = aDropBox[0].getItems();
					        for(var i= 0;i<aItems.length;i++)
						    {
						        if (aItems[i].getText() === sName){
						            this.simulate.click(aItems[i]);
						        break;}
						    }
						   
						},
						errorMessage : "Wizard: System is not available"
					});
				},
				
				iPasteURL: function(sURL){
					 this.waitFor({
						controlType : "sap.ui.commons.TextField",
						pollingInterval : 3000,
					    matchers : new sap.ui.test.matchers.Properties({
							id: "DataConnectionPasteURLTextField"
						}),
					
						success : function(aTextField) {
							this.simulate.typeInto(aTextField[0], sURL);
						},
						errorMessage : "Wizard: URL is not available"
					});
					
					return this.waitFor({
						controlType : "sap.ui.commons.Button",
						pollingInterval : 3000,
						matchers : new sap.ui.test.matchers.Properties({
							id : "DataConnectionTestButton"
						}),
						success : function(aButton) {

							this.simulate.click(aButton[0]);
						},
						errorMessage : "Wizard: Button is not available"
					});
				},
				
				// 	iEnterProjectNamespace: function(sName){
				// 	 this.waitFor({
				// 		controlType : "sap.ui.commons.TextField",
				// 		pollingInterval : 3000,
				// 	    matchers : new sap.ui.test.matchers.Properties({
				// 			id: "__field3"
				// 		}),
					
				// 		success : function(aTextField) {
				// 			this.simulate.typeInto(aTextField[0], sName);
				// 		},
				// 		errorMessage : "Wizard: Text Field is not available"
				// 	});
					
				// },
				
				iSelectCheckBox : function() {
					return this.waitFor({
						controlType : "sap.ui.commons.CheckBox",
						pollingInterval : 3000,
						success : function(aCheckBox) {
						    aCheckBox[0].setChecked(true);
						    aCheckBox[0].fireChange();
						},
						errorMessage : "Wizard: Checkbox was not found"
					});
				},

				iCustomizeSAPUI5ApplicationProjectTemplate : function(sViewType, sNamespace, sViewName) {

					this.waitFor({
						controlType : "sap.ui.commons.ComboBox",
						matchers : new sap.ui.test.matchers.Properties({
							value : "XML"
						}),
						success : function(oComboBox) {
							var comboboxId = oComboBox[0].sId;
							this.byId(comboboxId).setValue(sViewType);
						},
						errorMessage : "Wizard: View Type is not available"
					});

					this.waitFor({
						controlType : "sap.ui.commons.Label",
						matchers : new sap.ui.test.matchers.Properties({
							text : "Namespace"
						}),
						success : function(aLabel) {
							//TODO find a more stable way to find input field in the wizard
							var oInput = aLabel[0].$().parent().siblings().children("input")[0];
							var oTextView = this.byId(oInput.id);
							this.simulate.typeInto(oTextView, sNamespace);
						},
						errorMessage : "Wizard: Namespace is not available"
					});

					return this.waitFor({
						controlType : "sap.ui.commons.Label",
						matchers : new sap.ui.test.matchers.Properties({
							text : "View Name"
						}),
						success : function(aLabel) {
							//TODO find a more stable way to find input field in the wizard
							var oInput = aLabel[0].$().parent().siblings().children("input")[1];
							var oTextView = this.byId(oInput.id);
							oTextView.setValue(sViewName);
//							this.simulate.typeInto(oTextView, sViewName);
						},
						errorMessage : "Wizard: View Name is not available"
					});
				},

				iClickNext : function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						this.simulate.click(aButtons[0]);
					}, "Wizard: Next button not available", "Next");
				},

				iClickFinish : function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						this.simulate.click(aButtons[0]);
					}, "Wizard: Finish button not available", "Finish");
				},

				iOpenProjectWizardWithName : function(sName) {

					inTheMenuBar.iCreateNewProject();
					return this.iEnterAProjectName(sName);
				}
			},
			assertions : {
				iCanClickNext : function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						//Next can be clicked at multiple places
						for ( var i = 0; i < aButtons.length; i++) {
							ok(aButtons[i].getEnabled(), "Next Button should be enabled");
						}
					}, "Wizard: Next button not enabled", "Next");
				},
				iCanClickFinish : function() {
					return fnWaitForNextBtn.call(this, function(aButtons) {
						//Only one Finish button
						ok(aButtons[0].getEnabled(), "Finish Button should be enabled");
					}, "Wizard: Finish button not enabled", "Finish");
				}
			}
		}
	});
});