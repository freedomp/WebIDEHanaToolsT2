/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/**
  * Navigation Handler Class
**/
jQuery.sap.declare('sap.apf.modeler.ui.utils.navigationHandler');
sap.apf.modeler.ui.utils.navigationHandler = (function() {
	//Global Variables
	var instance, dialogInstance = {};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#onConfigurationSwitch
	 * @param {Boolean} isSaved - Whether configuration is saved or not before navigation 
	 * @param {Boolean} isDifferentConfig - Whether configuration is different or same 
	 * @param {Object} configListInstance - Pass the configuration list instance 
	 * @description On switch of one configuration to another handle scenarios below
	 * Yes : The unsaved changes are saved and the user navigates to the new configuration 
	 * No : The user navigates without saving the changes (this reverts back to the last saved state or the last in memory state depending on whether this object was saved before or not).
	 * Cancel : The pop up closes and user remains in the current configuration.
	 * */
	var throwLossOfDataPopup = function(configListInstance, callback) {
		_openMessageDialogForSwitchState(configListInstance, {
			isSwitchConfiguration : true
		}, callback);
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#onCheckValidationState
	 * @param {Boolean} isSaved - Whether configuration is saved or not before navigation 
	 * @param {Object} configListInstance - Pass the configuration list instance 
	 * @description On switch of one configuration to another handle scenarios below
	 * Yes : -> if this is saved object, restore the value to the previously saved value,
			-> if not saved, then change the value to the previously saved in memory value                 
			-> if the user has just created this object and is trying to navigate to the another node or action, the object is lost.
	 * No : -> He remains on the current form with the mandatory fields.
	 * */
	var throwMandatoryPopup = function(configListInstance, callback) {
		_openMessageDialogForValidationState(configListInstance, {
			isValidationCheck : true
		}, callback);
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_openMessageDialogForSwitchState
	 * @param {Object} configListInstance  - configurationList Instance 
	 * @param {Object} switchState - Current Switch state property isTraverseBack, isSwitchConfiguration etc
	 * @description On switch of sub view to another open pop up dialog
	 * */
	var _openMessageDialogForValidationState = function(configListInstance, switchState, callback) {
		var oCoreApi = configListInstance.oCoreApi;
		var dialogMessage = oCoreApi.getText("mandatoryField");
		var currSwitchStateKey = Object.keys(switchState)[0];
		var handlerContext = {
			_handleValidationNavigation : _handleValidationNavigation,
			_handlePreventNavigation : _handlePreventNavigation,
			configListInstance : configListInstance,
			callback : callback
		};
		handlerContext[currSwitchStateKey] = switchState[currSwitchStateKey];
		//Create New Instance of dialog
		dialogInstance.oConfirmValidationDialog = sap.ui.xmlfragment("idMandatoryValidationDialogFragement", "sap.apf.modeler.ui.fragment.mandatoryDialog", handlerContext);
		configListInstance.getView().addDependent(dialogInstance.oConfirmValidationDialog);
		_setMessageDialogText(oCoreApi, "validationDialog");
		var oValidationMessageLabel = new sap.m.Label();
		oValidationMessageLabel.addStyleClass("dialogText");
		oValidationMessageLabel.setText(dialogMessage);
		dialogInstance.oConfirmValidationDialog.removeAllContent();
		dialogInstance.oConfirmValidationDialog.addContent(oValidationMessageLabel); // add the confirmation message to the dialog
		dialogInstance.oConfirmValidationDialog.open();
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_openMessageDialogForSwitchState
	 * @param {Object} configListInstance  - configurationList Instance 
	 * @param {Object} switchState - Current Switch state property isTraverseBack, isSwitchConfiguration etc
	 * @description On switch of one configuration to another open pop up dialog
	 * */
	var _openMessageDialogForSwitchState = function(configListInstance, switchState, callback) {
		var oCoreApi = configListInstance.oCoreApi;
		var dialogMessage = oCoreApi.getText("unsavedConfiguration");
		var currSwitchStateKey = Object.keys(switchState)[0];
		var handlerContext = {
			_handleNavigationWithSave : _handleNavigationWithSave,
			_handleNavigateWithoutSave : _handleNavigateWithoutSave,
			_handlePreventNavigation : _handlePreventNavigation,
			configListInstance : configListInstance,
			callback : callback
		};
		handlerContext[currSwitchStateKey] = switchState[currSwitchStateKey];
		//Create New Instance of dialog
		dialogInstance.oConfirmNavigationDialog = sap.ui.xmlfragment("idMessageDialogFragment", "sap.apf.modeler.ui.fragment.messageDialog", handlerContext);
		configListInstance.getView().addDependent(dialogInstance.oConfirmNavigationDialog);
		_setMessageDialogText(oCoreApi, "naviagtionDialog");
		var oConfirmationMessageLabel = new sap.m.Label();
		oConfirmationMessageLabel.addStyleClass("dialogText");
		oConfirmationMessageLabel.setText(dialogMessage);
		dialogInstance.oConfirmNavigationDialog.removeAllContent();
		dialogInstance.oConfirmNavigationDialog.addContent(oConfirmationMessageLabel); // add the confirmation message to the dialog
		dialogInstance.oConfirmNavigationDialog.open();
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_closeDialog
	 * @param {dialogInstance}  - DialogInstance to be destroyed
	 * @description Destroys the passed dialog instance
	 * */
	var _closeDialog = function(dialogInstance) {
		dialogInstance.close();
		dialogInstance.destroy();
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_setMessageDialogText
	 * @param {Object} oCoreApi - Core API instance
	 * @description Sets the text for dialog pop up
	 * */
	var _setMessageDialogText = function(oCoreApi, dialogType) {
		if (dialogType === "naviagtionDialog") {
			sap.ui.core.Fragment.byId("idMessageDialogFragment", "idMessageDialog").setTitle(oCoreApi.getText("warning"));
			sap.ui.core.Fragment.byId("idMessageDialogFragment", "idYesButton").setText(oCoreApi.getText("yes"));
			sap.ui.core.Fragment.byId("idMessageDialogFragment", "idNoButton").setText(oCoreApi.getText("no"));
			sap.ui.core.Fragment.byId("idMessageDialogFragment", "idCancelButton").setText(oCoreApi.getText("cancel"));
		} else if (dialogType === "validationDialog") {
			sap.ui.core.Fragment.byId("idMandatoryValidationDialogFragement", "idMandatoryValidationDialog").setTitle(oCoreApi.getText("warning"));
			sap.ui.core.Fragment.byId("idMandatoryValidationDialogFragement", "idYesButton").setText(oCoreApi.getText("yes"));
			sap.ui.core.Fragment.byId("idMandatoryValidationDialogFragement", "idNoButton").setText(oCoreApi.getText("no"));
		}
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_handleValidationNavigation
	 * @description Handles Navigation Back to sub views
	 * */
	var _handleValidationNavigation = function() {
		var configListInstance = this.configListInstance;
		var callback = this.callback;
		_closeDialog(dialogInstance.oConfirmValidationDialog);
		if (typeof callback.yes === "function") {
			callback.yes();
		}
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_handleNavigationWithSave
	 * @description Handles Navigation Scenario With Save 
	 * */
	var _handleNavigationWithSave = function() {
		var configListInstance = this.configListInstance;
		var callback = this.callback;
		var saveEditor = function(callback) {
			//Save Editor Instance
			configListInstance.configEditor.save(function(id, metadata, messageObject) {
				configListInstance.configId = id;
				if (messageObject === undefined) {
					if (typeof callback === "function") {
						callback();
					}
					var successMessageOnSave = configListInstance.oCoreApi.getText("successOnSave");
					sap.m.MessageToast.show(successMessageOnSave, {
						width : "20em"
					});
				} else {
					var oMessageObject = configListInstance.oCoreApi.createMessageObject({
						code : "12000"
					});
					oMessageObject.setPrevious(messageObject);
					configListInstance.oCoreApi.putMessage(oMessageObject);
					var errorMessageOnSave = configListInstance.oCoreApi.getText("errorOnSave");
					sap.m.MessageToast.show(errorMessageOnSave, {
						width : "20em"
					});
				}
			});
		};
		_closeDialog(dialogInstance.oConfirmNavigationDialog);
		if (typeof callback.yes === "function") {
			callback.yes(saveEditor);
		}
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_handleNavigateWithoutSave
	 * @description Handles Navigation Scenario Without Save 
	 * */
	var _handleNavigateWithoutSave = function() {
		var configListInstance = this.configListInstance;
		var callback = this.callback;
		_closeDialog(dialogInstance.oConfirmNavigationDialog);
		configListInstance.configurationHandler.resetConfiguration(configListInstance.configId);
		if (typeof callback.no === "function") {
			callback.no();
		}
	};
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.utils.navigationHandler#_handlePreventNavigation
	 * @description Prevents the navigation retains in the same state 
	 * */
	var _handlePreventNavigation = function() {
		var isTraverseBack = this.isTraverseBack;
		var isSwitchConfiguration = this.isSwitchConfiguration;
		var isValidationCheck = this.isValidationCheck;
		var configListInstance = this.configListInstance;
		var callback = this.callback;
		if (!isValidationCheck) {
			_closeDialog(dialogInstance.oConfirmNavigationDialog);
		} else {
			_closeDialog(dialogInstance.oConfirmValidationDialog);
		}
		if (typeof callback.cancel === "function") {
			callback.cancel();
		} else if (typeof callback.no === "function" && isValidationCheck) {
			callback.no();
		}
	};
	//Create Navigation Handler Instance
	var createInstance = function() {
		return {
			throwLossOfDataPopup : throwLossOfDataPopup,
			throwMandatoryPopup : throwMandatoryPopup
		};
	};
	return {
		getInstance : function() {
			return instance || (instance = createInstance());
		}
	};
}());