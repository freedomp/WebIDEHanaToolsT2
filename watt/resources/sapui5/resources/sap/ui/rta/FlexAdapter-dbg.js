/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides FlexAdapter
sap.ui.define([ 'jquery.sap.global', 
                'sap/ui/fl/FlexControllerFactory',
                'sap/ui/rta/Utils'], 
function(jQuery, flexControllerFactory, Utils) {
	"use strict";

	/**
	 * Constructor for a new FlexAdapter.
	 *
	 * @class
	 * The UI5 FlexAdapter provides the transformation of events of the GestureRecognizer into
	 * the format understood by the FlexController. This is a pure internal class and shall not
	 * be used outside SAP SE code.
	 * 
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.FlexAdapter
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var FlexAdapter = function(oControl) {
	};

	FlexAdapter.M_TYPES = {
		move : "move",
		addGroup : "addGroup",
		addField : "addField",
		property : "property",
		hideControl : "hideControl",
		unhideControl : "unhideControl"
	};

	FlexAdapter.prototype.init = function(oControl) {
		// for testibility the FlexController will be attached here, so you can run the
		// flexadapter without a flexibility backend
		this._attachFlexController(oControl);
	};

	FlexAdapter.prototype.destroy = function() {
		if (this.flexController) {
			delete this.flexController;
		}
	};

	FlexAdapter.prototype.createFlexMoveEvent = function(controlId, sourceId, targetId, sTargetAggregation, iTargetIndex) {
		var sType = FlexAdapter.M_TYPES.move;
		var oChange = {
			changeType : sType,
			selector : {
				id : controlId
			}
		};
		oChange.parameters = [ {
			targetAggregation : sTargetAggregation,
			sourceContainerId : sourceId,
			targetContainerId : targetId,
			index : iTargetIndex
		} ];
		return oChange;
	};

	FlexAdapter.prototype.createFlexPropertyChangeEvent = function(ctrlId, sPropertyName, sPropertyValue) {
		var sType = FlexAdapter.M_TYPES.property;
		var oChange = {
			changeType : sType,
			selector : {
				id : ctrlId
			}
		};
		oChange.parameters = [ {
			propertyName : sPropertyName,
			newValue : sPropertyValue
		} ];
		return oChange;
	};

	FlexAdapter.prototype.createHideEvent = function(sControlId) {
		var sType = FlexAdapter.M_TYPES.hideControl;
		var oChange = {
			changeType : sType,
			selector : {
				id : sControlId
			}
		};
		return oChange;
	};
	
	FlexAdapter.prototype.createUnhideEvent = function(sControlId) {
		var sType = FlexAdapter.M_TYPES.unhideControl;
		var oChange = {
			changeType : sType,
			selector : {
				id : sControlId
			}
		};
		return oChange;
	};

	FlexAdapter.prototype.createAddGroupEvent = function(oChangeData) {
		var oView = Utils.getClosestViewFor(sap.ui.getCore().byId(oChangeData.selectorId)); 
		var oAddChange = {
			selector: {
				id : oChangeData.selectorId
			},
			index : oChangeData.index,
			newControlId : oView.createId(jQuery.sap.uid()),
			changeType : FlexAdapter.M_TYPES.addGroup,
			groupLabel : "New Group"
		};
		return oAddChange;
	};
	
	FlexAdapter.prototype.createAddFieldEvent = function(oChangeData) {
		var oAddChange = {
			selector: {
				id : oChangeData.selectorId
			},
			index : oChangeData.index,
			newControlId : oChangeData.newControlId,
			changeType : FlexAdapter.M_TYPES.addField,
			fieldLabel : oChangeData.fieldLabel,
			fieldValue : oChangeData.fieldValue,
			valueProperty : oChangeData.valueProperty,
			jsType : oChangeData.jsType,
			value : oChangeData.value
		};
		return oAddChange;
	};

	FlexAdapter.prototype.emitHideEvent = function(oControl) {
		this._emitFlexEvent(oControl, this.createHideEvent(oControl.getId()));
	};
	
	FlexAdapter.prototype.emitUnhideEvent = function(oControl) {
		this._emitFlexEvent(oControl, this.createUnhideEvent(oControl.getId()));
	};

	FlexAdapter.prototype.emitAddEvent = function(oChangeData, sChangeType) {
		var oChange;
		if (FlexAdapter.M_TYPES.addField === sChangeType) {
			oChange = this.createAddFieldEvent(oChangeData);
		} else if (FlexAdapter.M_TYPES.addGroup === sChangeType) {
			oChange = this.createAddGroupEvent(oChangeData);
		}
		this._emitFlexEvent(sap.ui.getCore().byId(oChangeData.selectorId), oChange);
		return oChange;
	};

	FlexAdapter.prototype.emitMoveEvent = function(oElement, oChange) {
		this._emitFlexEvent(oElement, oChange);
	};

	FlexAdapter.prototype.emitPropertyChangeEvent = function(oControl, sPropertyName, sPropertyValue) {
		this._emitFlexEvent(oControl, this.createFlexPropertyChangeEvent(oControl.getId(), sPropertyName, sPropertyValue));
	};

	FlexAdapter.prototype.onResetToDefault = function() {
		var that = this;
		this.flexController.getComponentChanges().then(function(aChanges) {
			return that.flexController.discardChanges(aChanges).then(function() {
				window.location.reload();
			});
		})['catch'](function(oError) {
			jQuery.sap.log.error("Flexibility data could not be discarded " + oError);
		});
	};

	/*
	 * @private
	 */
	FlexAdapter.prototype._attachFlexController = function(oControl) {
		try {

			if (flexControllerFactory) {
				this.flexController = flexControllerFactory.createForControl(oControl);
			} else {
				this.flexController = null;
			}
			
            
		} catch (oError) {
			jQuery.sap.log.error("No DT control can be found for " + oControl.getMetadata().getName());
		}
	};

	/*
	 * @private
	 */
	FlexAdapter.prototype._emitFlexEvent = function(oControl, oChange) {
		if (this.flexController) {
			this.flexController.createAndApplyChange(oChange, oControl);
			this.flexController.saveAll().then(function() {
			})["catch"](function(oError) {
				jQuery.sap.log.error("Flexibility data could not be saved " + oError);
			});
		}
	};

	return FlexAdapter;

}, /* bExport= */true);
