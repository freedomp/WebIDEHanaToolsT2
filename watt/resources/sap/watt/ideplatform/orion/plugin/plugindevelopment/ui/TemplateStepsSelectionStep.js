jQuery.sap.declare("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateStepsSelectionStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateStepsSelectionStep", {

			_aStepDropDownBox : undefined,
			_iStepIndex : undefined,

			init : function() {

				this._aStepDropDownBox = [];
				this.bAlreadyLoaded = false;
				this._iStepIndex = 2;

				this._createStepsGrid();
				this._iStepIndex = 2;

				this.addContent(this.oStepsGrid);
			},

/* *********************************
 * 		Template Steps UI          *
 ***********************************/

			_createStepsGrid : function() {

				var that = this;
				this._aStepsLabel = [];

				var oStep1Label = new sap.ui.commons.Label({
					text : "{i18n>templateStepsSelectionStep_step1Label}",
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M2 S12",
						linebreak : true
					})
				});

				this.oStep1LabelTextField = new sap.ui.commons.TextField({
					width : "100%",
					value: "{i18n>templateStepsSelectionStep_selectTempalteStepTitle}",
					enabled : false,
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M6 S12"
					})
				}).addStyleClass("textFieldDisableStatus");

				var oStep2Label = new sap.ui.commons.Label({
					text : "{i18n>templateStepsSelectionStep_step2Label}",
					width : "100%",
					visible: {
					    path : "/template/templateType",
					    formatter : function(sTemplateType) {
					        return (sTemplateType === "project");
					    },
					    useRawValues : true
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M2 S12",
						linebreak : true
					})
				});

				this.oStep2LabelTextField = new sap.ui.commons.TextField({
					width : "100%",
					enabled : false,
					value : "{i18n>templateStepsSelectionStep_projectNameStepTitle}",
					visible: {
					    path : "/template/templateType",
					    formatter : function(sTemplateType) {
					        return (sTemplateType === "project");
					    },
					    useRawValues : true
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M6 S12"
					})
				}).addStyleClass("textFieldDisableStatus");

				this.oAddStepButton = new sap.ui.commons.Button({
					text : "{i18n>templateStepsSelectionStep_addStepLabel}",
					tooltip : "{i18n>templateStepsSelectionStep_addStepLabelToolTip}",
					press : [ that._onAddStepPress, that ],
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M3 S12",
						indent : "L2 M2",
						linebreak : true
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Button
				});

				this.oStepsGrid = new sap.ui.layout.Grid({
					content : [ oStep1Label, this.oStep1LabelTextField, oStep2Label, this.oStep2LabelTextField, this.oAddStepButton ],
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12"
					})
				});
			},

			_onAddStepPress : function(oEvent) {
				var that = this;

				var iContentIndex = this._iStepIndex * 3;
				this._iStepIndex++;
				var sStepTitle = this.getContext().i18n.getText("templateStepsSelectionStep_stepLabel");

				var oStepLabel = new sap.ui.commons.Label({
					text : sStepTitle + " " + this._iStepIndex,
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M2 S12",
						linebreak : true
					})
				});

				this._aStepsLabel.push(oStepLabel);

				var oStepDropDownBox = new sap.ui.commons.DropdownBox({
					width : "100%",
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M5 S12"
					}),
					change : function(oEvent) {
						that._validateSelectWizardStep(oEvent).fail(/*No failure handling is needed here*/);
					},
					accessibleRole : sap.ui.core.AccessibleRole.Combobox
				});

				this._aStepDropDownBox.push(oStepDropDownBox);

				var oRemoveStepButton = new sap.ui.commons.Button({
					tooltip : "{i18n>templateStepsSelectionStep_deleteStepLabelToolTip}",
					text : "{i18n>templateStepsSelectionStep_deleteStepLabel}",
					press : function(oEvent) {
						that._onRemoveStepPress(oEvent, oStepDropDownBox, oStepLabel);
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M2 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Button
				});

				this._populateStepListItems(oStepDropDownBox);
				this.oStepsGrid.addContent(oStepLabel);//, iContentIndex + 1);
				this.oStepsGrid.addContent(oStepDropDownBox);//, iContentIndex + 2);
				this.oStepsGrid.addContent(oRemoveStepButton);//, iContentIndex + 3);
			},

			_onRemoveStepPress : function(oEvent, oStepDropDownBox, oStepLabel) {
				this._iStepIndex--;
				var oDeleteBtn = oEvent.getSource();

				this.oStepsGrid.removeContent(oDeleteBtn);
				this.oStepsGrid.removeContent(oStepDropDownBox);
				this.oStepsGrid.removeContent(oStepLabel);

				var iStepLabelIndex = this._getStepLabelIndex(oStepLabel);
				var iStepsLength = this._aStepsLabel.length;
				this._aStepsLabel.splice(iStepLabelIndex, 1);

				// if the removed step is not the last step need to update the index of the entire steps
				if (iStepLabelIndex < iStepsLength - 1) {
					var iIndex = this._iStepIndex;
					var sStep = this.getContext().i18n.getText("templateStepsSelectionStep_stepLabel");
					for ( var i = this._aStepsLabel.length - 1; i >= iStepLabelIndex; i--) {
						this._aStepsLabel[i].setText(sStep + " " + iIndex);
						iIndex--;
					}
				}

				var iDropDownIndex = this._aStepDropDownBox.indexOf(oStepDropDownBox);
				this._aStepDropDownBox.splice(iDropDownIndex, 1);

				this._validateSelectWizardStep().fail(/*No failure handling is needed here*/);

			},

			_getStepLabelIndex : function(oStepLabel) {

				for ( var i = 0; i < this._aStepsLabel.length; i++) {
					if (this._aStepsLabel[i] === oStepLabel) {
						return i;
					}
				}

			},

			_populateStepListItems : function(oStepDropDownBox) {
				require([ "sap/watt/core/PluginRegistry" ], function(PluginRegistry) {

					var aWizardSteps = [];

					var aServiceList = PluginRegistry.$getServiceRegistry()._mRegistry;
					for ( var sServiceName in aServiceList) {
						var oService = aServiceList[sServiceName];
						if (oService.instanceOf("sap.watt.common.service.ui.WizardStep")) {
							aWizardSteps.push(sServiceName);
						}
					}

					aWizardSteps.sort(function(sStep1, sStep2) {
						return sStep1.localeCompare(sStep2);
					});

					for ( var i = 0; i < aWizardSteps.length; i++) {
						oStepDropDownBox.addItem(new sap.ui.core.ListItem({
							text : aWizardSteps[i]
						}));
					}

					var oFirstItem = oStepDropDownBox.getItems()[0];
					oStepDropDownBox.fireEvent("change", {
						selectedItem : oFirstItem
					});
				});
			},

/* *********************************
* 			Validations            *
***********************************/

			validateStepContent : function() {
				return this._validateSelectWizardStep();
			},

			_handleInvalidControl : function(sMessage, oControl) {
				this.markAsInvalid(oControl);
				this.fireValidation({
					isValid : false,
					message : sMessage
				});
			},

			_handleInvalidControlConsiderFirstChange : function(sMessage, oControl) {
				if (!oControl.hasAlreadyChanged) {
					this.fireValidation({
						isValid : false
					});
				} else {
					// also mark validation error and put error message
					this._handleInvalidControl(sMessage, oControl);
				}
			},

			_markValidControlIfChanged : function(oControl, oEventSource) {
				if (oEventSource === oControl) {
					// Mark changed control as valid
					this.markAsValid(oControl);
				}
			},

			_validateSelectWizardStep : function(oEvent) {

				var oEventSource = null;

				if (oEvent) {
					oEventSource = oEvent.getSource();
					// Clear validation marks from the control that its value was changed
					this.clearValidationMarks(oEventSource);
					// Flag the changed control (so required fields will not be marked with error before ever changed)
					oEventSource.hasAlreadyChanged = true;
				}

				// Validate template steps
				if (!this._validateSteps(oEventSource)) {
					// handling the invalid control is done within _validateSteps method
					var sMessage = this.getContext().i18n.getText("templateInfoStep_stepsGrid_SelectStepErr");
					return Q.reject(new Error(sMessage));
				} else {
					var oModel = this.getModel().getData();
					if (!oModel.template) {
						oModel.template = {};
					}

					var aSteps = [];
					for ( var i = 0; i < this._aStepDropDownBox.length; i++) {
						var sStepName = this._aStepDropDownBox[i].getValue();
						aSteps.push(sStepName);
					}
					oModel.template.wizardSteps = aSteps;

					this.fireValidation({
						isValid : true
					});
					return Q(true);
				}

			},

			_validateSteps : function(oEventSource) {

				var bValid = true;

				var i;
				for (i = 0; i < this._aStepDropDownBox.length; i++) {
					this.clearValidationMarks(this._aStepDropDownBox[i]);
					this._aStepDropDownBox[i].isCurrentlyValid = true;
				}

				var dSteps = {};
				for (i = 0; i < this._aStepDropDownBox.length; i++) {
					var sStepName = this._aStepDropDownBox[i].getValue();
					if (dSteps[sStepName] === undefined) {
						dSteps[sStepName] = sStepName;
						if (this._aStepDropDownBox[i].isCurrentlyValid) {
							this._markValidControlIfChanged(this._aStepDropDownBox[i], oEventSource);
						}
					} else {
						// step already exists in the dictionary
						bValid = false;
						// Mark the second control with the identical value as invalid
						this._handleInvalidControl(this.getContext().i18n.getText("templateInfoStep_stepsGrid_SelectStepErr"),
								this._aStepDropDownBox[i]);
						this._aStepDropDownBox[i].isCurrentlyValid = false;
					}
				}

				return bValid;
			},

/* ****************************************
 * 		Step Content Control Life-Cycle   *
 *****************************************/

			renderer : {},

			onAfterRendering : function() {
				this.bAlreadyLoaded = true;
				if (this.bAlreadyLoaded) {
				    this.fireValidation({
					    isValid : true
			    	});
			    	this.bAlreadyLoaded = true;
				}

			},

			onBeforeRendering : function() {
				this.bAlreadyLoaded = true;
				var mAdditionalResources = this.getModel().oData.selectedTemplate.getI18nResources();
				this.configureI18nResources(mAdditionalResources);

			},

			setFocusOnFirstItem : function() {
				this.oAddStepButton.focus();
			},

			cleanStep : function() {
				if (this.getModel()) {
					var oModel = this.getModel().getData();
					if (oModel.template) {
						// clean model if created
						oModel.template = undefined;
					}
				}
			},

			onChangeTemplateType : function(oEvent) {
            	var sTemplateType = oEvent.getParameter("value");
            	var iAdditionalStepsCount = this._aStepsLabel.length;
        	    
        	    // Update current step index by amount of predefined steps (accroding to template type) 
        	    // and the additional steps added by the user (if any)
        	    if (sTemplateType === "project") {
        	        this._iStepIndex = 2 + iAdditionalStepsCount;
        	    }
        	    else {
        	        this._iStepIndex = 1 + iAdditionalStepsCount;
        	    }
            	
            	// Update indexes of all additional steps (considering the updated step index)
            	if (iAdditionalStepsCount > 0) {
            	    var iIndex = this._iStepIndex;
    				var sStep = this.getContext().i18n.getText("templateStepsSelectionStep_stepLabel");
    				for ( var i = this._aStepsLabel.length - 1; i >= 0; i--) {
    					this._aStepsLabel[i].setText(sStep + " " + iIndex);
    					iIndex--;
    				} 
            	}
			}
		});
