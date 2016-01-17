jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.qunit.control.FinishStepControl");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.qunit.control.FinishStepControl", {

		_oGrid: null,
		_oFilesGrid: null,
		_onBeforeRenderingFlag: true,
		// Define the SAPUI5 control's metadata
		metadata: {},

		init: function() {
		    this.alreadyLoaded = false;
			if (!this._oGrid) {
				this._oGrid = new sap.ui.layout.Grid({
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});
			}
			this.addContent(this._oGrid);
		},

		setFocusOnFirstItem: function() {
			// Call the focus() method for your first UI element.                               
		},
		validateStepContent: function() {
			// Return a Q-promise which is resolved if the step content
			// is currently in valid state, and is rejected if not.
		},
		cleanStep: function() {
			// 1. Clean properties that were added to
			//    this.getModel().getData().
			// 2. Clean the control's private members.
			// 3. Destroy the UI controls created by this control
			//    that are not currently displayed.
			//    Currently displayed content is destroyed by the wizard
			//    before this step is displayed again.
			this._onBeforeRenderingFlag = true;
			this._oGrid = null;
			this._oFilesGrid = null;
		},
		renderer: {},

		// Overwrite this SAPUI5 control method if you have some logic
		// to implement here
		onAfterRendering: function() {
            if (!this.alreadyLoaded) {
                // Set wizard's custom summary message
                var sWizardControlId = this.getParent().getWizardControl();
	            var oWizardControl = sap.ui.getCore().byId(sWizardControlId);
	            if (oWizardControl) {
                    var sCustomSummaryMessage = this.getContext().i18n.getText("i18n", "txt_Created_Artifacts");
                    oWizardControl.setSummary(sCustomSummaryMessage); 
	            }
                this.alreadyLoaded = true;
            }
		},

		// Overwrite this SAPUI5 control method if you have some logic
		// to implement here
		onBeforeRendering: function() {
			// Make sure to first call this method implementation in the
			// WizardStepContent base class
			if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent
				.prototype.onBeforeRendering) {
				sap.watt.ideplatform.plugin.template.ui.wizard.
				WizardStepContent.prototype.
				onBeforeRendering.apply(this, arguments);
			}
			// Implement your logic here
			if (this._onBeforeRenderingFlag) {
				this._onBeforeRenderingFlag = false;
				this._createContent();
			}
		},

		_createContent: function() {
			
			this._oFilesGrid = new sap.ui.layout.Grid({
				vSpacing: 0,
				hSpacing: 2,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});
			
			var oRowTemplateLabel = new sap.ui.commons.Label({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				design: "Bold",
				text: "{name}"
			});
			
            this._oFilesGrid.bindAggregation("content", {
    			path : "/aArtifcats",
    			template : oRowTemplateLabel
    		});
			
			this._oGrid.addContent(this._oFilesGrid);
		}

	});