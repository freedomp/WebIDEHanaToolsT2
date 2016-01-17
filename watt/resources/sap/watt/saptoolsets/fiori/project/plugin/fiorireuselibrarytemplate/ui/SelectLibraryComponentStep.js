
jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fiorireuselibrarytemplate.ui.SelectLibraryComponentStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.fiorireuselibrarytemplate.ui.SelectLibraryComponentStep", {
		metadata: {
			properties: {
			    "data": "object",
				"wizardControl": "object",
				"numberOfWizardSteps": "int"
			}
		},
		
	
		init: function() {
    	    this._oLibraryDiscoveryUI = null;
            this.fireProcessingEnded();
            this.bLoadData = true;
		},

		/* *********************************
		 * 		Template Steps UI          *
		 ***********************************/
	

		/* *********************************
		 * 			Validations            *
		 ***********************************/

		validateStepContent: function() {
			// Return a Q-promise which is resolved if the step content
			// is currently in valid state, and is rejected if not.

    		return this._validateSelectLibraryComponentStep();/*.then(function(){
    		    return true;
    		})*/
		},

        _getSelectionChangeHandler : function(self){
            return function(){
                self._checkSelectedObject(self);
            };
        },
	
        _checkSelectedObject : function(oSelectLibraryComponentStep){
            oSelectLibraryComponentStep._validateSelectLibraryComponentStep();
        },
        
        updateModel : function(modelData, selectedObject, repoType){
            
            if ( !(modelData.hasOwnProperty("reuselibrarycomponent"))){
                modelData.reuselibrarycomponent = {};
            }
            
            if ( !(modelData.reuselibrarycomponent.hasOwnProperty("selectedLibraryObject"))){
                modelData.reuselibrarycomponent.selectedLibraryObject = {};
            }
            
            return this.getContext().service.librarydevelopment.getSelectedLibraryModelObject(selectedObject,repoType).then(function(result){
                modelData.reuselibrarycomponent.selectedLibraryObject = result;
            });
        },
        
	    _validateSelectLibraryComponentStep : function(oEvent) {
            var that = this;
            var selectedObject =  that._oLibraryDiscoveryUI.getSelectedContent();
            if ( selectedObject.length > 0) {

                var modelData = that.getModel().getData();
                var repoType = that._oLibraryDiscoveryUI.getRepositoryType();
                that.updateModel(modelData, selectedObject[0], repoType);
  
                that.fireValidation({
                    isValid : true
                });
                return true;
            }
            //Fire Next Step Valid false
            that.fireValidation({
                isValid : false
            });
            return false;
        },
        
        _getValidationHandler: function(self){
        	    return function(){
        	        self._ValidationHandler(self);
        	    };
        	},
	
        _ValidationHandler : function(oSelectLibraryComponentStep){
            oSelectLibraryComponentStep._validateComponentStep();
        },
        
	    _validateComponentStep : function(oEvent) {
            this.fireValidation({
                isValid : oEvent.isValid
            });
            return false;
        },

		/* ****************************************
		 * 		Step Content Control Life-Cycle   *
		 *****************************************/

		renderer: {},

		onBeforeRendering: function() {
            // Make sure to first call this method implementation in the
    		// WizardStepContent base class
    		if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
    		    sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering.apply(this, arguments);
    		}
    		
    		if (this._oLibraryDiscoveryUI === null) {
    		    
    		    this._oLibraryDiscoveryUI = "loading";
    		    this.fireProcessingStarted();
    			var that = this;
    			this.getContext().service.libraryDiscovery.getLibraryDiscoveryUI({
    				library: false,
    				control: true,
    				reuseComponent: false
    			}).then(function(oLibraryDiscoveryUI) {
    				that.insertContent(oLibraryDiscoveryUI.content);
    				that._oLibraryDiscoveryUI = oLibraryDiscoveryUI;
    				oLibraryDiscoveryUI.setChangeHandler(that._getSelectionChangeHandler(that));
    				oLibraryDiscoveryUI.setValidationHandler(function(oEvent) {
                        that.fireValidation({
                            isValid : oEvent.isValid,
                            message : oEvent.message
                        });
                    });
                    oLibraryDiscoveryUI.setProgressHandler(function (oEvent){
                        if (oEvent === 0){
                            that.fireValidation({ isValid : false});
                            that.fireProcessingStarted();       
                        }
                        else{
                            that.fireProcessingEnded();    
                        }
                    });
                    
    			}).fin(function(){
    			    that.fireProcessingEnded();
		        });
    		}
		},

		setFocusOnFirstItem: function() {
			// Call the focus() method for your first UI element.    
		},

		cleanStep: function() {
			// 1. Clean properties that were added to
			//    this.getModel().getData().
			// 2. Clean the control's private members.
			// 3. Destroy the UI controls created by this control
			//    that are not currently displayed.
			//    Currently displayed content is destroyed by the wizard
			//    before this step is displayed again.

		}
	});
