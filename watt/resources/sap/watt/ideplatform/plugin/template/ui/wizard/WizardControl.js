jQuery.sap.declare("sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.ui.ux3.OverlayContainer.extend("sap.watt.ideplatform.plugin.template.ui.wizard.WizardControl", {

	fnFinishHandler : null,
	fnAfterCloseHandler : null,
	oFinishStepContent : null,
	bShouldReport : true,

	metadata : {
		properties : {
			"title" : "string",
			"description" : "string",
			"summary" : "string",
			"exitMessage" : "string",
			"context" : "object"
		},
		aggregations : {
			"headerTitle" : {
				"type" : "sap.ui.commons.TextView",
				"visibility" : "hidden",
				multiple : false
			},
			"headerDescription" : {
				"type" : "sap.ui.commons.TextView",
				"visibility" : "hidden",
				multiple : false
			},
			"headerGrid" : {
				"type" : "sap.ui.layout.Grid",
				"visibility" : "hidden",
				multiple : false
			},
			"steps" : {
				"type" : "sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep"
			},
			"finishStep" : {
				"type" : "sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep",
				"visibility" : "hidden",
				multiple : false
			},
			"containerGrid" : {
				"type" : "sap.ui.layout.Grid",
				"visibility" : "hidden",
				multiple : false
			},
			"bordedContent" : {
				"type" : "sap.ui.commons.layout.BorderLayout",
				"visibility" : "hidden",
				multiple : false
			}
		},
		events : {
			"finishClicked" : {}
		}
	},

	setFinishHandler : function(finishHandler) {
		this.fnFinishHandler = finishHandler;
	},

	setAfterCloseHandler : function(afterCloseHandler) {
		this.fnAfterCloseHandler = afterCloseHandler;
	},

	setTitle : function(sTitle) {
		this.setProperty("title", sTitle, true);
		this._headerTitle.setText(sTitle);
		return this;
	},

	setDescription : function(sDescription) {
		this.setProperty("description", sDescription, true);
		this._headerDescription.setText(sDescription);
		return this;
	},

	setSummary : function(sSummary) {
		this.setProperty("summary", sSummary, true);
		this._finishStep.setDescription(sSummary);
		return this;
	},

	setFinishStepContent : function(oFinishStepContent) {
		// Set and configure the new content
		if (oFinishStepContent) {
			this.oFinishStepContent = oFinishStepContent;
			this.oFinishStepContent.attachValidation(this.onFinishValidation, this);
			this.oFinishStepContent.attachValidation(this.onBreadCrumbsNextValidation, this);
			this.oFinishStepContent.attachValidation(this.onBreadCrumbsValidation, this);
			this.oFinishStepContent.setLayoutData(new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}));
		} else {
			this.oFinishStepContent = this._createDefaultFinishStepContent();
		}
		this._finishStep.cleanWizardStep(); // Destroy previous finish step content (similar concept to removeStep)
		this._finishStep.setStepContent(this.oFinishStepContent);
		this._finishStep.setValid(true); //reset validation state of finish step
		this._finishStep.invalidate(this); //trigger re-rendering
		return this;
	},

	getFinishStepContent : function() {
		return this.oFinishStepContent;
	},
	
	getStepsContainerHeight : function() {
	    var sBorderLayoutCenterId = this.oBordedContent.getId() + "--center";
	    return jQuery("#" + sBorderLayoutCenterId).height();
	},

	_createDefaultFinishStepContent : function() {
		return new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});
	},

	init : function() {

		var that = this;
		if (sap.ui.ux3.OverlayContainer.prototype.init) {
			sap.ui.ux3.OverlayContainer.prototype.init.apply(this, arguments); // call super.init()
		}

		this.currentVisibleStep = 0;
		this.bHandleFinishClicked = false;
		this.i18nAlreadySet = false;
		this.isLoaded = false;

		this.attachClose(this.close, this);

		this.attachBrowserEvent("keyup", function(e) {
			if (e.keyCode === 27) {
				// esc key is pressed
				that.fireClose({
					id : "close"
				});
			}
		});

		jQuery(window).resize(function() {
			//TODO: trigger invalidation only on current visible step! (improve performance)
			for ( var i = 0; i < that._steps.length; i++) {
				that._steps[i].invalidate(this); //triggers re-rendering
			}
			that._finishStep.invalidate(this); //triggers re-rendering
		});



		var fnConfirmUnsaveChanges = function(e) {
			if (that.isLoaded && that._shouldDisplayMessage()) {
				var sMsg = that.getContext().i18n.getText("wizardControl_unsavedChanges");
				if (jQuery.browser.mozilla) {
					e.returnValue = sMsg;
				} else {
					return sMsg;
				}
			}
		};

		if (jQuery.browser.mozilla) {
			//below doesn't work with firefox
			window.addEventListener("beforeunload", fnConfirmUnsaveChanges);
		} else {
			//needs to be unloaded in tests
			jQuery(window).bind("beforeunload", fnConfirmUnsaveChanges);
		}

		var oHeaderGrid = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			}),
			vSpacing : 0
		}).addStyleClass("wizardHeader");

		this.setAggregation("headerGrid", oHeaderGrid);
		this._headerGrid = oHeaderGrid;

		var headerTextView = new sap.ui.commons.TextView({
			text : this.getTitle(),
			design : sap.ui.commons.TextViewDesign.H1,
			enabled : false,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("wizardControlTitle");

		this.setAggregation("headerTitle", headerTextView);
		this._headerTitle = headerTextView;

		var subHeaderTextView = new sap.ui.commons.TextView({
			text : this.getDescription(),
			enabled : false,
			layoutData : new sap.ui.layout.GridData({
				span : "L10 M11 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this.setAggregation("headerDescription", subHeaderTextView);
		this._headerDescription = subHeaderTextView;
		var oFinishBtn = new sap.ui.commons.Button({
			text : "{i18n>confirmStep_finish}",
			tooltip : "{i18n>confirmStep_finish}",
			width : "110px",
			enabled : false,
			press : [ this.handleFinishClicked, this ]
		});

		this._finishButton = oFinishBtn;

		this.oFinishStepContent = this._createDefaultFinishStepContent();

		var oFinishStep = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStep({
			title : "{i18n>confirmStep_confirm}",
			description : "",
			stepContent : this.oFinishStepContent,
			nextButton : oFinishBtn,
			visible : false,
			valid : true,
//			optional : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});

		oFinishStep.attachBackClicked(this.onBackClicked, this);
		oFinishStep.addStyleClass("opacityOfLoadedStep");

		this.setAggregation("finishStep", oFinishStep);
		this._finishStep = oFinishStep;

		this.oWizardContainerGrid = new sap.ui.layout.Grid({
			hSpacing : 0,
			vSpacing : 1
		}).addStyleClass("mainSectionsGrid");

		this.setAggregation("containerGrid", this.oWizardContainerGrid);

		this.oBordedContent = new sap.ui.commons.layout.BorderLayout({
			width : "100%",
			height : "100%"
		});

		this.oBordedContent.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.center);
		this.oBordedContent.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.center, {
			visible : true
		});

		this.oBordedContent.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.top);
		this.oBordedContent.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.top, {
			visible : true,
			size : "40px"
		});

		this.setAggregation("bordedContent", this.oBordedContent);

		this._steps = [];
	},

	onBackClicked : function(oEvent) {
		for ( var i = 1; i < this.oBreadCrumbsLayout.getContent().length - 1; i = i + 2) {
			this.oBreadCrumbsLayout.getContent()[i].removeStyleClass("selectedCrumb").addStyleClass("unSelectedCrumb");
		}

		//take the oPreviousStep from the array (not from the property previousStepIndex).
		var oPreviousStep = undefined;
		var iCurrentStepIndex = 1;

		// if press Back from the Finish step navigate to the last step in the steps array.
		if (oEvent.oSource === this._finishStep) {
			iCurrentStepIndex = this._steps.length;
			this.currentVisibleStep = this._steps.length - 1;
			oPreviousStep = this._steps[this.currentVisibleStep];
			this._setBCNextButtonEnablement();

		} else {
			for ( var index = 0; index < this._steps.length; index++) {
				if (this._steps[index].sId === oEvent.mParameters.id) {
					// the current visible is the step that we navigate to.
					this.currentVisibleStep = index - 1;
					oPreviousStep = this._steps[this.currentVisibleStep];
					iCurrentStepIndex = index;
					this._setBCNextButtonEnablement();
					break;
				}
			}
		}

		this.addAggregation("steps", oPreviousStep);

		this.oBreadCrumbsLayout.getContent()[2 * iCurrentStepIndex - 1].removeStyleClass("unSelectedCrumb").addStyleClass("selectedCrumb");

	},

	_closeWizard : function(oControlEvent) {

		if (sap.ui.ux3.OverlayContainer.prototype.close) {
			sap.ui.ux3.OverlayContainer.prototype.close.apply(this, arguments); // call super.init()
		}

		this.currentVisibleStep = 0;
		this.isLoaded = false;

		this.cleanWizard();
		this.destroyContent();

		this._finishStep.cleanWizardStep();
		this._finishStep.destroy();

		this._headerGrid.destroyContent();
		this._headerGrid.destroy();

		if (this.fnAfterCloseHandler) {
			this.fnAfterCloseHandler(oControlEvent);
		}

		sap.ui.getCore().byId("menubar").setEnabled(true); //TODO: Move to generic WATT dialog
	},

	_shouldDisplayMessage : function() {

		// check the next button of the first step
		var bShouldDisplayMessage = false;

		if (this._steps[1] !== undefined) {
			// first step - next button is disable
			// second step - if visible then should display msg, else if not visible msg should not be display.
			bShouldDisplayMessage = this._steps[1].getVisible();
		} else {
			bShouldDisplayMessage = this._finishStep.getVisible();
		}

		return bShouldDisplayMessage;
	},

	close : function(oControlEvent) {
		if (oControlEvent !== undefined) {
			var that = this;
			var exitMessage = this.getExitMessage() || this.getContext().i18n.getText("wizardControl_exitMessage");

			if (this._shouldDisplayMessage() && oControlEvent.getParameter("id") !== that.sFinish) {
				// in case that user press 'X' to close the wizard (before or after that he press finish)
				that.getContext().service.usernotification.confirm(exitMessage).then(function(oResult) {
					if (oResult.bResult) {
						that._closeWizard(oControlEvent);
					}
				}).fail(function(oError) {
					/* No error handling is needed - do nothing */
				});
			} else {
				// in case close event was fired by finish process, or user didn't start working on wizard
				that._closeWizard(oControlEvent);
			}
		}
	},

	open : function(oControlEvent) {
		if (sap.ui.ux3.OverlayContainer.prototype.open) {
			sap.ui.ux3.OverlayContainer.prototype.open.apply(this, arguments); // call super.init()
		}
		sap.ui.getCore().byId("menubar").setEnabled(false); //TODO: Move to generic WATT dialog
	},

	cleanWizard : function() {

		for ( var i = 0; i < this._steps.length; i++) {
			this._steps[i].cleanWizardStep();
			this._steps[i].destroyContent();
		}
	},

	onNextClicked : function(oEvent) {
		var that = this;

		for ( var i = 1; i < that.oBreadCrumbsLayout.getContent().length - 1; i = i + 2) {
			that.oBreadCrumbsLayout.getContent()[i].removeStyleClass("selectedCrumb").addStyleClass("unSelectedCrumb");
		}
		var nextIndex = oEvent.getParameter("nextStepIndex");
		//if nextIndex is undefined then the next step is the finish step
		if (!nextIndex) {
			this.currentVisibleStep = this._steps.length;
			this.setAggregation("finishStep", this._finishStep);
			var sFinishTitle = this.getContext().i18n.getText("confirmStep_confirm");
			this._finishStep.setDisplayNumber(this.currentVisibleStep + 1);
			this._finishStep.setVisible(true);

			if (this.currentVisibleStep === this.aBCButtons.length) {
				// add finish step to breadcrums
				var lastBreadCrumbButton = this._createBreadCrumbsButton(this._finishStep.getTitle());

				var BreadCrumbsLayoutContentLength = this.oBreadCrumbsLayout.getContent().length;
				this.oBreadCrumbsNextButton.setText(this.getContext().i18n.getText("confirmStep_finish"));
				this.oBreadCrumbsNextButton.getCustomData("mode")[0].setValue(that.sFinish);

				this.oBreadCrumbsLayout.insertContent(lastBreadCrumbButton, BreadCrumbsLayoutContentLength - 1);
				this.aBCButtons.push(lastBreadCrumbButton);
				this.oBreadCrumbsLayout.insertContent(this._createBCSeperatorButton(), BreadCrumbsLayoutContentLength);
			} else {
				var contentLength = that.oBreadCrumbsLayout.getContent().length;
				that.oBreadCrumbsLayout.getContent()[contentLength - 3].removeStyleClass("unSelectedCrumb").addStyleClass("selectedCrumb");
			}
		}

		if (this._steps.length > nextIndex) {
			var oNextStep = this._steps[nextIndex];
			if (this.currentVisibleStep < nextIndex) {
				this.currentVisibleStep = nextIndex;
			}
			oNextStep.setDisplayNumber(this.currentVisibleStep + 1);
			this.addAggregation("steps", oNextStep);

			oNextStep.setVisible(true);

			if ((that.aBCButtons !== undefined) && (nextIndex >= that.aBCButtons.length)) {
				var currentBreadCrumbsButton = that._createBreadCrumbsButton();
				that.aBCButtons.push(currentBreadCrumbsButton);
				var iContentLength = that.oBreadCrumbsLayout.getContent().length;
				that.oBreadCrumbsLayout.insertContent(currentBreadCrumbsButton, iContentLength - 1);
				that.oBreadCrumbsLayout.insertContent(that._createBCSeperatorButton(), iContentLength);
			} else {
				if (nextIndex) {
					that.oBreadCrumbsLayout.getContent()[2 * nextIndex + 1].removeStyleClass("unSelectedCrumb").addStyleClass(
							"selectedCrumb");
				} else {
					//the next step is the finish step					
					var contentSize = that.oBreadCrumbsLayout.getContent().length;
					that.oBreadCrumbsLayout.getContent()[contentSize - 3].removeStyleClass("unSelectedCrumb")
							.addStyleClass("selectedCrumb");
				}
			}
			that._setBCNextButtonEnablement();
		}
	},

	handleFinishClicked : function(oEvent) {
		var that = this;

		this._startProcessingFinish();
		
		if (this.bHandleFinishClicked) {
			return;
		}

		this.bHandleFinishClicked = true;
		var aValidateStepsPromises = [];
		var allSteps = this._steps;
		for ( var i = 0; i < allSteps.length; i++) {
			var currentStep = allSteps[i];
			if (currentStep.getVisible() && currentStep._step.validateStepContent !== undefined) {
				aValidateStepsPromises.push(currentStep._step.validateStepContent());
			}
		}
		if (this._finishStep.getVisible() && this._finishStep._step.validateStepContent !== undefined) {
			aValidateStepsPromises.push(this._finishStep._step.validateStepContent());
		}

		Q.all(aValidateStepsPromises).then(function() {
			return that.fnFinishHandler().then(function() {
				// finish operation succeeded
				that._endProcessingFinish();
				that.fireClose({
					id : "Finish"
				});
			}).fail(function(oError) {
				// finish operation failed
				that.bHandleFinishClicked = false;
				that._endProcessingFinish();
				that.getContext().service.usernotification.alert(oError.message).done();
				if (oError && oError.stack) {
				    console.log(oError.stack); //display original error stack trace for supportability
				}
			});
		}).fail(function(oError) {
			// steps validation failed
			that.bHandleFinishClicked = false;
			that._endProcessingFinish();
			that.getContext().service.usernotification.alert(oError.message).done();
			if (oError && oError.stack) {
 				console.log(oError.stack); //display original error stack trace for supportability
 			}
		}).done();
	},

	_startProcessingFinish : function() {
		this._finishButton.setEnabled(false);
		this.setBusy(true);
//		this._finishStep.onProcessingStarted();
	},

	_endProcessingFinish : function() {
		this.setBusy(false);
		this._finishButton.setEnabled(true);
	},

	onBreakingStep : function(oEvent) {
		var oCurrentStep = oEvent.oSource;
		var bBreak = false;
		for ( var i = 0; i < this._steps.length; i++) {
			if (bBreak) {
				this._steps[i].setEnabled(false);
			} else if (oCurrentStep === this._steps[i]) {
				bBreak = true;
			}
		}
	},

	onBreadCrumbsNextValidation : function(oEvent) {
		if (this.oBreadCrumbsNextButton.getCustomData("mode")[0].getValue() === this.sFinish) {
			var bAllStepsAreValid = this._isWizardValid(oEvent);
			this.oBreadCrumbsNextButton.setEnabled(bAllStepsAreValid);

		} else if ((this.currentVisibleStep < this._steps.length) && (this._steps[this.currentVisibleStep].getValid)
				&& (this.oBreadCrumbsNextButton.getCustomData("mode")[0].getValue() === this.sNext)) {
			this._setBCNextButtonEnablement();
		}

	},

	onBreadCrumbsValidation : function(oEvent) {
		if (!oEvent.getSource().getParent().getDisplayNumber()) {
			return;
		}
		var stepIndex = parseInt(oEvent.getSource().getParent().getDisplayNumber());
		var stepCrumb = this.oBreadCrumbsLayout.getContent()[2 * stepIndex - 1];
		if (oEvent.getParameters().isValid || !oEvent.getParameters().message || oEvent.getParameters().message === '""'
				|| (oEvent.getParameters().severity && oEvent.getParameters().severity !== "error")) {
			stepCrumb.removeStyleClass("notValidCrumb");
		} else {
			stepCrumb.addStyleClass("notValidCrumb");
		}
	},

	onFinishBreadCrumbsValidation : function() {
		if (!this._finishStep.getDisplayNumber()) {
			return;
		}
		var stepIndex = parseInt(this._finishStep.getDisplayNumber());
		var stepCrumb = this.oBreadCrumbsLayout.getContent()[2 * stepIndex - 1];
		if (this._finishStep.getValid() || (!this._finishStep.getIsMarkedWithError())) {
			stepCrumb.removeStyleClass("notValidCrumb");
		} else {
			stepCrumb.addStyleClass("notValidCrumb");
		}
	},

	_removeBCButtonsFromRightSide : function(iStepIndex) {

		var indexOfButtonInBCLayout = -1;
		var iBreadCrumbsLayoutContentLength = this.oBreadCrumbsLayout.getContent().length;
		for ( var i = 0; i < iBreadCrumbsLayoutContentLength; i++) {
			var oBCButton = this.oBreadCrumbsLayout.getContent()[i];
			if (oBCButton.getCustomData("stepNumber")[0] && oBCButton.getCustomData("stepNumber")[0].getValue() === iStepIndex) {
				indexOfButtonInBCLayout = i;
				break;
			}
		}

		this.oBreadCrumbsNextButton.setText(this.getContext().i18n.getText("wizardStep_nextButtonTooltip"));
		this.oBreadCrumbsNextButton.getCustomData("mode")[0].setValue(this.sNext);
		this.aBCButtons.splice(iStepIndex + 1);
		if (indexOfButtonInBCLayout !== -1) {
			for ( var j = iBreadCrumbsLayoutContentLength - 2; j > indexOfButtonInBCLayout + 1; j--) {
				this.oBreadCrumbsLayout.removeContent(j);
			}
		}
	},

	_isWizardValid : function(oEvent) {
		var bValid = true;
		var iStepIndex = 0;
		var bStepValid;
		for (iStepIndex; iStepIndex < this._steps.length; iStepIndex++) {
			var oStep = this._steps[iStepIndex];
			if (oStep.getVisible()) {
				bStepValid = oStep.getValid();
				if (oEvent && (oEvent.getSource() === oStep._step)) {
					bStepValid = oEvent.getParameter("isValid");
				}
				if (!bStepValid) {
					bValid = false;
					break;
				}
			}
		}
		if (this._finishStep.getVisible()) {
			bStepValid = this._finishStep.getValid();
			if (oEvent && (oEvent.getSource() === this._finishStep._step)) {
				bStepValid = oEvent.getParameter("isValid");
			}
			if (!bStepValid) {
				bValid = false;
			}
		}
		return bValid;
	},

	onFinishValidation : function(oEvent) {
		var bValid = this._isWizardValid(oEvent);
		this._finishButton.setEnabled(bValid);
		if (this.oBreadCrumbsNextButton.getCustomData("mode")[0].getValue() === this.sFinish) {
			this.oBreadCrumbsNextButton.setEnabled(bValid);
		}
	},

	_bStepExistsInStepsArray : function(oStep) {
		for ( var i = 0; i < this._steps.length; i++) {
			if (this._steps[i] === oStep) {
				return true;
			}
		}
		return false;
	},

	getStepAtIndex : function(iStepIndex) {
		return this._steps[iStepIndex];
	},

	getStepsNumber : function() {
		return this._steps.length;
	},

	addStep : function(oStep) {
		// check if the step exists in the steps array
		if (!this._bStepExistsInStepsArray(oStep)) {
			//only the first step is visible and added to the aggregation
			if (this._steps && this._steps.length === 0) {
				oStep.setDisplayNumber(1);
				oStep.setVisible(true);
				//oStep.setTitle("1 " + oStep.getTitle());
				this.addAggregation("steps", oStep);
			} else {
				//all steps after the first are by default not visible
				oStep.setVisible(false);
			}
			//set the step's relation to this wizard control (by association)
			oStep.setWizardControl(this.getId());

			//update the last step to point to the new one (TODO: need to check this if previous step should not point to new one)
			if (this._steps.length > 0) {
				var oLastStep = this._steps[this._steps.length - 1];
				oLastStep.setNextStepIndex(this._steps.length);
			}
//			var oRetVal = this.addAggregation("steps", oStep);
			//add to _steps
			this._steps.push(oStep);
			//attach to events
			oStep.attachNextClicked(this.onNextClicked, this);
			oStep.attachBackClicked(this.onBackClicked, this);
			var oStepContent = oStep.getStepContent();
			if (oStepContent !== null) {
				oStepContent.attachValidation(this.onFinishValidation, this);
				oStepContent.attachValidation(this.onBreadCrumbsNextValidation, this);
				oStepContent.attachValidation(this.onBreadCrumbsValidation, this);
			}
		}

		return oStep;
	},

	//TODO: support insertion properly
	//TODO: consider delete this method!!
	insertStep : function(oStep, iIndex) {
		var oRetVal = this.insertAggregation("steps", oStep, iIndex);
		if (iIndex === 0) {
			oStep.setVisible(true);
		}
		this._steps[iIndex] = oStep;
		oStep.attachNextClicked(this.onNextClicked, this);
		oStep.attachBackClicked(this.onBackClicked, this);
		var oStepContent = oStep.getStepContent();
		if (oStepContent !== null) {
			oStepContent.attachValidation(this.onFinishValidation, this);
			oStepContent.attachValidation(this.onBreadCrumbsNextValidation, this);
			oStepContent.attachValidation(this.onBreadCrumbsValidation, this);
		}
		//set the step's relation to this wizard control (by association)
		oStep.setWizardControl(this.getId());
		return oRetVal;
	},

	removeStep : function(vStep) {
		//Remove from aggregation
		var oStep = this.removeAggregation("steps", vStep);

		if (this._bStepExistsInStepsArray(vStep)) {

			//if step is already rendered so it is not in the aggregation
			vStep.cleanWizardStep();
			vStep.detachNextClicked(this.onNextClicked, this);
			vStep.detachBackClicked(this.onBackClicked, this);
			this._removeFromSteps(vStep);
			if (vStep.getDisplayNumber() !== undefined) {

				this._removeBCButtonsFromRightSide(vStep.getDisplayNumber() - 2);
			}
		}

		return oStep;
	},

	removeFinishStep : function() {
		//if finish is already visible remove it
		if (this._finishStep.getVisible()) {
			this._finishStep.setVisible(false);
			this.oContainer.removeContent(this._finishStep);
			// remove finish step from breadcrums if wasn't removed already (in other step removal)
			if (this._finishStep.getDisplayNumber() !== undefined) {
				this._removeBCButtonsFromRightSide(this._finishStep.getDisplayNumber() - 2);
			}
		}
	},

	_removeFromSteps : function(vStep) {
		//remove step from _steps
		var iSpliceIndex = -1;
		for ( var i = 0; i < this._steps.length; i++) {
			if (this._steps[i] === vStep) {
				iSpliceIndex = i;
				break;
			}
		}

		if (iSpliceIndex > -1) {
			//
			this._steps.splice(iSpliceIndex, 1);
			//explicitly remove step from container
			this.oContainer.removeContent(vStep);

		}

		//if finish is already visible remove it
		this.removeFinishStep();
	},

	removeAllSteps : function() {
		var aSteps = this.removeAllAggregation("steps");
		for ( var i = 0, l = aSteps.length; i < l; i++) {
			aSteps[i].detachNextClicked(this.onNextClick, this);
			aSteps[i].detachBackClicked(this.onBackClick, this);
		}
	},

	renderer : {},

	onBeforeRendering : function() {
		var that = this;
		if (sap.ui.ux3.OverlayContainer.prototype.onBeforeRendering) {
			sap.ui.ux3.OverlayContainer.prototype.onBeforeRendering.apply(this, arguments);
		}

		if (this.getContext().i18n && !this.i18nAlreadySet) {
			this.getContext().i18n.applyTo(this);
			this.i18nAlreadySet = true;
		}

		if (!this.sNext && !this.sFinish) {
			this.sNext = "Next";
			this.sFinish = "Finish";
		}

		var oTitle = this.getAggregation("headerTitle");
		var oDescription = this.getAggregation("headerDescription");
		var oHeader = this.getAggregation("headerGrid");
		var oFinish = this.getAggregation("finishStep");
		var oContainerTemp = this.getAggregation("containerGrid");
		var oBordedContentTemp = this.getAggregation("bordedContent");

		// At the first time the oContainerTemp and oBordedContentTemp are not null.
		if (oContainerTemp !== null && oBordedContentTemp !== null) {
			this.oContainer = oContainerTemp;
			this.oBordedContent = oBordedContentTemp;
		}

		if (oHeader !== null) {
			oHeader.addContent(oTitle);
			oHeader.addContent(oDescription);
			this.oContainer.addContent(oHeader);
		}

		var oSteps = this.getSteps();
		if (oSteps.length > 0) {
			var oNewVisibleStep = oSteps[0];
			var oPrevVisibleStep = this.oContainer.getContent()[0];
			if (oNewVisibleStep !== oPrevVisibleStep) {
				this.oContainer.removeAllContent();
				this.oContainer.addContent(oNewVisibleStep);

			}
			oNewVisibleStep.addStyleClass("opacityOfLoadedStep");
		}
		
		// set the finish step context
		if (!this.oFinishStepContent.getContext()) {
			this.oFinishStepContent.setContext(this.getContext());
		}

		if (oFinish !== null && oFinish.getVisible()) {
		    if (!oFinish.getWizardControl()) {
		        oFinish.setWizardControl(this.getId());
		    }
			this.onFinishValidation();
			this.onFinishBreadCrumbsValidation();
			this.onBreadCrumbsNextValidation();
			this.oContainer.removeAllContent();
			this.oContainer.addContent(oFinish);
		}

		var oWizardTitle = new sap.ui.commons.Label({
			text : this.getTitle().toUpperCase(),
			tooltip : this.getTitle()
		}).addStyleClass("wizardTitle");

		if (!this.oFirstBreadCrumbButton) {
			this.oFirstBreadCrumbButton = this._createBreadCrumbsButton();
		}

		if (!this.oBreadCrumbsLayout) {
			this.oBreadCrumbsNextButton = this._createBCNextButton();

			var oCloseButton = new sap.ui.commons.Button({
				layoutData : new sap.ui.layout.GridData({
					span : "L1 M1 S2"
				}),
				press : function() {
					that.fireClose({
						id : "close"

					});
				},
				icon : "sap-icon://watt/abort",
				lite : true
			}).addStyleClass("wizardCloseButton");
			this.aBCButtons = [];
			this.aBCButtons.push(this.oFirstBreadCrumbButton);
			this.oBreadCrumbsLayout = new sap.ui.layout.HorizontalLayout({
				content : [ oWizardTitle, this.oFirstBreadCrumbButton, this._createBCSeperatorButton(), this.oBreadCrumbsNextButton ],
				layoutData : new sap.ui.layout.GridData({
					span : "L11 M11 S10"
				})
			}).addStyleClass("topLayout");

			var oTopGrid = new sap.ui.layout.Grid({
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12"
				}),
				vSpacing : 0,
				content : [ this.oBreadCrumbsLayout, oCloseButton ]
			});

			this.oBordedContent.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.top, oTopGrid);
		}
		this.oBordedContent.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center, oTitle, this.oContainer);
		this.addContent(this.oBordedContent);
	},

	_createBCNextButton : function() {
		var that = this;
		var nextButton = new sap.ui.commons.Button({
			lite : true,
			text : "{i18n>wizardStep_nextButtonTooltip}",
			enabled : false,
			customData : new sap.ui.core.CustomData({
				key : "mode",
				writeToDom : false,
				value : "Next"
			}),
			press : function(oEvent) {
				if (this.getCustomData("mode")[0].getValue() === that.sNext) {
					var lastBCButton = that.aBCButtons[that.aBCButtons.length - 1];
					var iBCStep = lastBCButton.getCustomData("stepNumber")[0].getValue();
					if (iBCStep < that._steps.length) {
						that._steps[iBCStep].onNextBC();
					}
				} else if (this.getCustomData("mode")[0].getValue() === that.sFinish) {
					that.handleFinishClicked();
				}

			}
		}).addStyleClass("nextButton");
		return nextButton;
	},

	_createBreadCrumbsButton : function(sBCButtonText) {
		var that = this;
		var sButtonText = sBCButtonText;
		if (sButtonText === undefined || sButtonText.trim().length === 0) {
			sButtonText = that.getStepAtIndex(that.currentVisibleStep).getTitle().trim();
		}
		var breadCrumbsButton = new sap.ui.commons.Button({
			text : sButtonText,
			lite : true,
			tooltip : sButtonText,
			customData : new sap.ui.core.CustomData({
				key : "stepNumber",
				writeToDom : false,
				value : that.currentVisibleStep
			}),
			press : function() {

				var currentStepIndex = this.getCustomData("stepNumber")[0].getValue();
				that.currentVisibleStep = currentStepIndex;
				if (currentStepIndex <= that._steps.length) {
					if (currentStepIndex === 0) {
						var oNextStep = that._steps[currentStepIndex + 1];
						if (oNextStep) {
							oNextStep.onBack();
						} else {
							// in case the next step is undefined, it means it has only 1 step, so simulate going back from finish
							that._finishStep.onBack();
						}
					} else {
						that._steps[currentStepIndex - 1].onNext();
					}
					that._setBCNextButtonEnablement();
				}
			}
		}).addStyleClass("selectedCrumb");
		return breadCrumbsButton;
	},

	_setBCNextButtonEnablement : function() {
		if (this.oBreadCrumbsNextButton.getCustomData("mode")[0].getValue() === this.sNext) {
			var lastBCButton = this.aBCButtons[this.aBCButtons.length - 1];
			var iBCStep = lastBCButton.getCustomData("stepNumber")[0].getValue();

			if (this._steps[iBCStep].getValid() === undefined) {
				this.oBreadCrumbsNextButton.setEnabled(false);
			} else {
				this.oBreadCrumbsNextButton.setEnabled(this._steps[iBCStep].getValid());
			}
		}
	},

	_createBCSeperatorButton : function() {
		var oSeperatorButton = new sap.ui.commons.Button({
			lite : true,
			enabled : false
		}).addStyleClass("seperator");
		return oSeperatorButton;
	},

//	scrollingToVisibleStep : function() {
//		var BC = jQuery("#WizardBorderLayout--top");
//		if (BC.children().children().children()[0]) {
//			var BcLayoutId = BC.children().children().children()[0].id;
//			var BcLayout = jQuery("#" + BcLayoutId);
//			if (this.oBreadCrumbsLayout.getContent()[2 * this.currentVisibleStep + 1]) {
//				var sVisibleStepCrumbId = this.oBreadCrumbsLayout.getContent()[2 * this.currentVisibleStep + 1].getId();
//				var visibleStepCrumb = jQuery("#" + sVisibleStepCrumbId);
//				if (visibleStepCrumb.position()) {
//					var position = visibleStepCrumb.position().left;
//					BcLayout.scrollLeft(position + BcLayout.scrollLeft());
//				}
//			}
//		}
//	},

	onAfterRendering : function($Event) {
		var that = this;

		if (sap.ui.ux3.OverlayContainer.prototype.onAfterRendering) {
			sap.ui.ux3.OverlayContainer.prototype.onAfterRendering.apply(this, arguments);
		}
		
		if (this.isLoaded) {
			if (this.bShouldReport) {
				this.getContext().service.usagemonitoring.report("template", "create", "create_new_project").done();
				this.bShouldReport = false;
			}
		}
		
		var currentStep;
		if (this.currentVisibleStep < this._steps.length) {
			currentStep = this._steps[this.currentVisibleStep];
		} else {
			currentStep = this._finishStep;
		}
		
		this.isLoaded = true;

		var control = jQuery("#" + $Event.srcControl.getId());

		control.animate({
			opacity : "1"
		}, "fast", function() {

			var oStep = jQuery("#" + currentStep.getId());
			oStep.animate({
				opacity : "1"
			}, "fast");

			currentStep.removeStyleClass('opacityOfLoadedStep');

			if (currentStep._step !== undefined) {
				if (currentStep._step.setFocusOnFirstItem !== undefined) {
					currentStep._step.setFocusOnFirstItem(currentStep.getDisplayNumber() * 100, currentStep._nextButton.getId(),
							currentStep._backButton.getId());
				}
				if (currentStep._step.setTabIndexes !== undefined) {
					currentStep._step.setTabIndexes(currentStep.getDisplayNumber() * 100, currentStep._nextButton.getId(),
							currentStep._backButton.getId());
				}
			} else {
				if (currentStep === that._finishStep) {
					jQuery("#" + that._finishButton.getId()).focus();
				} else {
					jQuery("#" + currentStep._nextButton.getId()).focus();
				}
			}

		});
		//scroll the Bread Crumbs to the last added crumb 
//		this.scrollingToVisibleStep();
	}
});