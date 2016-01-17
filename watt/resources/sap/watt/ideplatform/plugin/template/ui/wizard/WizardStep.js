jQuery.sap.declare("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl");

sap.ui.layout.Grid.extend("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep", {

	iNextId : null,
	iBackId : null,
	iDescriptionId : null,
	iTitleGridId : null,
	iErrorMsgId : null,

	metadata : {
		properties : {
			"title" : "string",
			"description" : "string",
			"displayNumber" : "string",
			"nextStepIndex" : "int",
			"previousStepIndex" : "int",
			"visible" : "boolean",
			"optional" : "boolean",
			"valid" : "boolean"
		},
		aggregations : {
			"stepTitle" : {
				"type" : "sap.ui.commons.TextView",
				"visibility" : "hidden",
				multiple : false
			},
			"stepDescription" : {
				"type" : "sap.ui.commons.TextView",
				"visibility" : "hidden ",
				multiple : false
			},
			"stepDivider" : {
				"type" : "sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator",
				"visibility" : "hidden",
				multiple : false
			},
			"stepTitleGrid" : {
				"type" : "sap.ui.layout.Grid",
				"visibility" : "hidden",
				multiple : false
			},
			"stepErrorMsg" : {
				"type" : "sap.ui.commons.TextView",
				"visibility" : "hidden",
				multiple : false
			},
			"stepContent" : {
				"type" : "sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent",
				"singularName" : "stepContent",
				multiple : false
			},
			"stepButtonsGrid" : {
				"type" : "sap.ui.layout.Grid",
				"visibility" : "hidden",
				multiple : false
			},
			"horizontalLayout" : {
				"type" : "sap.ui.layout.HorizontalLayout",
				"visibility" : "hidden",
				multiple : false
			},
			"backButton" : {
				"type" : "sap.ui.commons.Button",
				"visibility" : "hidden",
				multiple : false
			},
			"nextButton" : {
				"type" : "sap.ui.commons.Button",
//				"visibility" : "hidden",
				multiple : false
			}
		},
		associations : {
			"wizardControl" : {
				type : "sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl",
				multiple : false
			}
		},
		events : {
			"nextClicked" : {},
			"backClicked" : {}
		}
	},

	setTitle : function(sTitle) {
		this.setProperty("title", sTitle, true);
		this._stepTitle.setText(sTitle);
		return this;
	},

	setDescription : function(sDescription) {
		if (sDescription.length > 0) {
			this.setProperty("description", sDescription, true);
			this._stepDescription.setText(sDescription);
			this._stepDescription.setVisible(true);
		}
		return this;
	},

	setDisplayNumber : function(iDisplayNumber) {

		this.setProperty("displayNumber", iDisplayNumber, true);
		this.setTitle(this.getTitle());

		return this;
	},

	setOptional : function(bOptional) {
		if (this.getProperty("optional") === undefined) {
			this.setProperty("valid", bOptional, true);
		}
		this.setProperty("optional", bOptional, true);

		return this;
	},

	setValid : function(bValid) {
		this.setProperty("valid", bValid, true);
		return this;
	},

	getIsMarkedWithError : function() {
		return this.isMarkedWithError;
	},

//	setVisible : function(bVisible) {
//		this.setProperty("visible", bVisible, true);
//		var aControls = this.getContent();
//		for ( var i = 0; i < aControls.length; i++) {
//			if (aControls[i].setVisible) {
//				aControls[i].setVisible(bVisible);
//			}
//		}
//	},

	init : function() {

		if (sap.ui.layout.Grid.init) {
			sap.ui.layout.Grid.init.apply(this, arguments); // call super.init()
		}

		var oSectionTitle = new sap.ui.commons.TextView({
			layoutData : new sap.ui.layout.GridData({
				span : "L11 M11 S10"
			})
		}).addStyleClass("fontSpecial wizardH2");

		this.setAggregation("stepTitle", oSectionTitle);
		this._stepTitle = oSectionTitle;

		this.oDivider = new sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		});
		this.setAggregation("stepDivider", this.oDivider);

		var oSectionErrorMsg = new sap.ui.commons.TextView({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			vSpacing : 0
		}).addStyleClass("wizardStepFontSpecial");

		this.setAggregation("stepErrorMsg", oSectionErrorMsg);
		this._errorTextView = oSectionErrorMsg;

		var oSectionDescription = new sap.ui.commons.TextView({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			visible : false
		}).addStyleClass("wizardStepDesc");

		this.setAggregation("stepDescription", oSectionDescription);
		this._stepDescription = oSectionDescription;

		var oStepTitleGrid = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			vSpacing : 0
		});
		this.setAggregation("stepTitleGrid", oStepTitleGrid);
		
		var oDefaultStepContent = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});
		this.setAggregation("stepContent", oDefaultStepContent);

		var oSectionBackBtn = this.getAggregation("backButton");
		if (oSectionBackBtn === null) {
			oSectionBackBtn = new sap.ui.commons.Button({
				text : "{i18n>wizardStep_prevButtonText}",
				width : "110px",
				tooltip : "{i18n>wizardStep_prevButtonTooltip}",
				vSpacing : 0,
				layoutData : new sap.ui.layout.GridData({
					span : "L1 M4 S6"
				}),
				accessibleRole : sap.ui.core.AccessibleRole.Button,
				press : [ this.onBack, this ]
			}).addStyleClass("previousButton");

			this.setAggregation("backButton", oSectionBackBtn);
		}

		this._backButton = oSectionBackBtn;
		var oSectionNextBtn = this.getAggregation("nextButton");
		if (oSectionNextBtn === null) {
			oSectionNextBtn = new sap.ui.commons.Button({
				text : "{i18n>wizardStep_nextButtonText}",
				width : "110px",
				tooltip : "{i18n>wizardStep_nextButtonTooltip}",
				enabled : false,
				vSpacing : 0,
				layoutData : new sap.ui.layout.GridData({
					span : "L1 M4 S6"
				}),
				accessibleRole : sap.ui.core.AccessibleRole.Button,
				press : [ this.onNext, this ]
			});
			this.setAggregation("nextButton", oSectionNextBtn);
		}

		var oHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		});

		this.setAggregation("horizontalLayout", oHorizontalLayout);

		var oStepButtonsGrid = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			vSpacing : 0
		});

		this.setAggregation("stepButtonsGrid", oStepButtonsGrid);

		this._nextButton = oSectionNextBtn;

		this.setVisible(false);
	},

	onBack : function() {
		this.fireBackClicked({
			previousStepIndex : this.getPreviousStepIndex()
		});
	},

	onNextBC : function() {
		this._nextButton.focus();
		this._nextButton.firePress();
	},

	onNext : function() {
		this.fireNextClicked({
			nextStepIndex : this.getNextStepIndex()
		});
	},

	setStepContent : function(oStep) {
		if (oStep) {
			this._step = oStep;
		}
		var oRetVal = this.setAggregation("stepContent", oStep);
		if (oStep !== null) {
			oStep.attachValidation(this.onStepValidation, this);
			oStep.attachProcessingStarted(this.onProcessingStarted, this);
			oStep.attachProcessingEnded(this.onProcessingEnded, this);
		}
		return oRetVal;
	},

	onProcessingStarted : function(oEvent) {
		this.oDivider.startAnimation();
	},

	onProcessingEnded : function(oEvent) {
		this.oDivider.stopAnimation();
	},

	onStepValidation : function(oEvent) {
		var isValid = oEvent.getParameter("isValid");
		this._nextButton.setEnabled(isValid);
		this.setValid(isValid);

		var oMessage = oEvent.getParameter("message");
		if (oMessage) {
			var sSeverity = oEvent.getParameter("severity");
			// If event includes message severity - consider it, 
			// otherwise use isValid to decide if it is an error message:
			var bErrorStatus = sSeverity ? (sSeverity === "error") : (!isValid);
			this._markStepWithError(bErrorStatus);
			this._errorTextView.setText(oMessage);
		} else {
			this._errorTextView.setText("");
			this._markStepWithError(false);
		}
	},
	
	_markStepWithError : function (bError) {
	    this.oDivider.setErrorStatus(bError);
	    this.isMarkedWithError = bError;
	    var bHasErrorTextStyle = this._errorTextView.hasStyleClass("wizardStepErrorText");
	    if(bError) {
	        if(!bHasErrorTextStyle) {
	            this._errorTextView.addStyleClass("wizardStepErrorText");
	        }
	    } else {
	        if(bHasErrorTextStyle) {
	            this._errorTextView.removeStyleClass("wizardStepErrorText");
	        }
	    }
	},

	cleanWizardStep : function() {
		// clean validation message and status
		this._errorTextView.setText("");
        this._markStepWithError(false);
    	
    	// reset validity and next button enablement status
    	if (this.getOptional()) {
    	    this.setValid(true);
		    this._nextButton.setEnabled(true);
    	} else {
    	    this.setValid(false);
		    this._nextButton.setEnabled(false); 
    	}
    	
    	// clean step content
		this._step.cleanStep();
		this._step.destroyContent();
		this._step.destroy();
	},

	onBeforeRendering : function() {
		if (sap.ui.layout.Grid.onBeforeRendering) {
			sap.ui.layout.Grid.onBeforeRendering.apply(this, arguments); // call super.onBeforeRendering()
		}

		var oTitle = this.getAggregation("stepTitle");
		var oDescription = this.getAggregation("stepDescription");
		var oDivider = this.getAggregation("stepDivider");
		var oErrorMsg = this.getAggregation("stepErrorMsg");
		var oBack = this.getAggregation("backButton");
		var oNext = this.getAggregation("nextButton");
		var oTitleGrid = this.getAggregation("stepTitleGrid");
		var oStepButtonsGrid = this.getAggregation("stepButtonsGrid");
		var oHorizontalLayout = this.getAggregation("horizontalLayout");

		if (oTitleGrid) {
			this.iTitleGridId = oTitleGrid.getId();
			if (oTitle) {
			    oTitleGrid.addContent(oTitle);
			}
			if (oDivider) {
			    oTitleGrid.addContent(oDivider);
		    }
			if (oErrorMsg) {
			    this.iErrorMsgId = oErrorMsg.getId();
			    oTitleGrid.addContent(oErrorMsg);
		    }
		    if (oDescription) {
			    this.iDescriptionId = oDescription.getId();
			    oTitleGrid.addContent(oDescription);
		    }
			this.addContent(oTitleGrid);
		}

		var oStepContent = this.getStepContent();
		if (oStepContent) {
			this.insertContent(oStepContent, 1); //Takes care of correct insertion also if only stepContent is replaced later
		}

		if (oNext) {
			oNext.setLayoutData(new sap.ui.layout.GridData({
				span : "L1 M4 S6"
			}));
			if (this.getOptional()) {
				oNext.setEnabled(true);
			}
		}

		if (oHorizontalLayout) {
			if (oBack) {
				oHorizontalLayout.addContent(oBack);
				if (parseInt(this.getDisplayNumber(), 10) === 1) {
					oBack.setEnabled(false);
				} else {
					oBack.setEnabled(true);
				}
			}
			if (oNext) {
				oHorizontalLayout.addContent(oNext);
			}
		}

		if (oStepButtonsGrid) {
			this.iStepButtonsGrid = oStepButtonsGrid.getId();
			oStepButtonsGrid.addContent(oHorizontalLayout);
			this.addContent(oStepButtonsGrid);
		}
	},

	renderer : {},

	getContentHeight : function(wizardHeight) {

		var iStepContentHeight, iTitleHeight, iStepButtonsGridHeight;
		iStepContentHeight = iTitleHeight = iStepButtonsGridHeight = 0;

		if (this.iStepButtonsGrid) {
			iStepButtonsGridHeight = jQuery("#" + this.iStepButtonsGrid).height();
		}

		if (this.iTitleGridId) {
			iTitleHeight = jQuery("#" + this.iTitleGridId).height();
		}

		iStepContentHeight = wizardHeight - iTitleHeight - iStepButtonsGridHeight;
		return iStepContentHeight;
	},

	onAfterRendering : function() {
		if (sap.ui.layout.Grid.onAfterRendering) {
			sap.ui.layout.Grid.onAfterRendering.apply(this, arguments); // call super.onAfterRendering()
		}

		this.resizeStep(true);
	},

	resizeStep : function(bResizeControl) {
	    var sWizardControlId = this.getWizardControl();
	    var oWizardControl = sap.ui.getCore().byId(sWizardControlId);
	    if (oWizardControl) {
    		var wizardHeight = oWizardControl.getStepsContainerHeight() - 60; //leave some padding after step
    		jQuery("#" + this.getId()).height(wizardHeight);
    
    		if (this._step !== undefined) {
    			this.iStepContentHeight = this.getContentHeight(wizardHeight) - 30; // leave some padding after step content
    			jQuery("#" + this._step.getId()).height(this.iStepContentHeight);
    			// we need to set the content height in case that we stay at the same step and the content render was called (e.g select diff tiles)
    			if (bResizeControl) {
    				this._step.setContentHeight(this.iStepContentHeight + "px");
    			}
    		}
	    }
	}
});
