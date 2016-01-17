jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ConfirmTermsStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ConfirmTermsStepContent",
{
	metadata : {
		properties : {
	       	"wizardControl" : "object",
			"numberOfWizardSteps" : "int",
			"basicStepIndex" : "int"
		}
	},
    desclaimerErrorMsg : undefined,

	init : function() {
	    var that = this;
	    this.bAlreadyLoaded = false;
	    
        var desclaimerText = new sap.ui.commons.TextArea({
			value : "{i18n>FinishStepContent_wizardDisclaimer}",
			textAlign : "Left",
			editable : false,
			wrapping : sap.ui.core.Wrapping.Hard,
			rows:25,
			width: "100%",
			valueState : sap.ui.core.ValueState.None,
			layoutData: new sap.ui.layout.GridData({
	            span: "L10 M10 S10",
                linebreak: true
            })
        }).addStyleClass("termOfUseTextArea");
		
		this.agreeCB = new sap.ui.commons.CheckBox({
        	text : "{i18n>FinishStepContent_agreeText}",
        	checked : false,
        	accessibleRole : sap.ui.core.AccessibleRole.Textbox,
        	change : function() {
        	 var sMessage = this.getChecked()?"":that.desclaimerErrorMsg;
            	 that.fireValidation({
    				isValid : this.getChecked(),
    				message :sMessage
			    });
            }
    	}).addStyleClass("wizardCheckBox");
    	
		var finishContent = new sap.ui.layout.Grid({
		    content : [ desclaimerText, this.agreeCB]
        });
        this.addContent(finishContent);

	},
    renderer : {},
    
    onAfterRendering : function(){
        	this.desclaimerErrorMsg = this.getContext().i18n.getText("i18n", "FinishStepContent_desclaimerErrorMsg");
        	
        	if (!this.bAlreadyLoaded) {
				this.bAlreadyLoaded = true;
			    this.fireValidation({
				    isValid : false
			    });
			}
    },
    
	setFocusOnFirstItem : function() {
		this.agreeCB.focus();
	}
});
