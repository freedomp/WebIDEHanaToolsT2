jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ConnectivityComponentFinishStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ConnectivityComponentFinishStep",
		{

			metadata : {

			},


			init : function() {
			    
			    this.alreadyLoaded = false;

				this.overwriteComponentCheckBox = new sap.ui.commons.CheckBox({
					text : "{i18n>connectivityFinishStep_overwrite}",
					tooltip : "{i18n>connectivityFinishStep_overwriteTooltip}",
					checked : "{/overwrite}",
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M10 S12",
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
                        var sComponentTargetPath = this.getModel().getProperty("/componentPath");
                        var aParts = sComponentTargetPath.split("/");
			            var sProjectName = aParts[1]; //get project name from target path
                        var sCustomSummaryMessage = this.getContext().i18n.getText("connectivityFinishStep_connectivitySummaryMsg", [ sProjectName ]);
                        oWizardControl.setSummary(sCustomSummaryMessage); 
	                }
                    this.alreadyLoaded = true;
                }
            }
		});