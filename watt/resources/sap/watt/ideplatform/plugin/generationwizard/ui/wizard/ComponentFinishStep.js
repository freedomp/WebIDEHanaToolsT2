jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentFinishStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentFinishStep",
		{

			metadata : {

			},


			init : function() {
			    
			    this.alreadyLoaded = false;

				this.overwriteComponentCheckBox = new sap.ui.commons.CheckBox({
					text : "{i18n>compPathStep_overwrite}",
					tooltip : "{i18n>compPathStep_overwriteTooltip}",
					checked : "{/overwrite}",
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M8 S12",
						linebreak : true
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Checkbox
				}).addStyleClass("wizardCheckBox");

				this.addContent(this.overwriteComponentCheckBox);
			},

			setFocusOnFirstItem : function() {
				this.overwriteComponentCheckBox.focus();
			},

			validateStepContent : function() {
			    return Q(true);
			},
			
			renderer : {},
			
            onAfterRendering : function() {
                if (!this.alreadyLoaded) {
                   // Set wizard's custom summary message
                    var sWizardControlId = this.getParent().getWizardControl();
	                var oWizardControl = sap.ui.getCore().byId(sWizardControlId);
	                if (oWizardControl) {
                        var sComponentTargetPath;
                        var sCustomSummaryMessage;
                        var oSelectedTemplate = this.getModel().getProperty("/selectedTemplate");
                        if(oSelectedTemplate && oSelectedTemplate.getType() === "smart_extension"){
                        	var oSelectedDocument = this.getModel().getProperty("/selectedDocument");
                        	if(oSelectedDocument && oSelectedDocument.getEntity()){
	                        	sComponentTargetPath = oSelectedDocument.getEntity().getName() + "/webapp/ext";
		                        sCustomSummaryMessage = this.getContext().i18n.getText("commonGenWizard_extensionSummaryMsg", [ sComponentTargetPath ]);
                        	}
                        } else {
                        	sComponentTargetPath = this.getModel().getProperty("/componentPath");
	                        sCustomSummaryMessage = this.getContext().i18n.getText("commonGenWizard_componentSummaryMsg", [ sComponentTargetPath ]);
                        }
                        oWizardControl.setSummary(sCustomSummaryMessage); 
	                }
                    this.alreadyLoaded = true;
                }
            }
		});