jQuery.sap.declare("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateFinishStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateFinishStep",
		{

			metadata : {

			},


			init : function() {
			    
			    this.alreadyLoaded = false;
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
                        var sComponentTargetPath = this.getModel().getProperty("/componentPath");
                        var sCustomSummaryMessage = this.getContext().i18n.getText("templateFinishStep_templateSummaryMsg", [ sComponentTargetPath ]);
                        oWizardControl.setSummary(sCustomSummaryMessage); 
	                }
                    this.alreadyLoaded = true;
                }
            }
		});
