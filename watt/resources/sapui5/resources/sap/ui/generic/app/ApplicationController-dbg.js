/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([	"jquery.sap.global", "./transaction/BaseController", "./transaction/TransactionController" ], function(jQuery, BaseController, TransactionController) { // EXC_JSHINT_037 // EXC_JSHINT_034
	"use strict";

	/* global Promise */
	
	/**
	 * Constructor for application controller.
	 * 
	 * @private
	 * @class Application Controller.
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.32.0
	 * @alias sap.ui.generic.app.ApplicationController
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel The OData model currently used
	 * @param {sap.ui.core.mvc.View} oView The current view
	 * @throws {Error} If no model is handed over as input parameter
	 */
	var ApplicationController = BaseController.extend("sap.ui.generic.app.ApplicationController", {
		constructor: function(oModel, oView) {
			var that = this;
			
			// inherit from base controller.
			BaseController.apply(this, [ oModel ]);
			
			// set a reference to the view.
			this._oView = oView;
			
			// initialize the OData model.
			this._initModel(oModel);	
			
			// attach to the field group validation event.
			oView.attachValidateFieldGroup(function(oEvent) {
				var sID, oID;
				
				if (oEvent.mParameters.fieldGroupIds && oEvent.mParameters.fieldGroupIds.length) {
					sID = oEvent.mParameters.fieldGroupIds[0];
					oID = that._oView.data(sID);
				}
				
				if (oID) {
					setTimeout(function() {
						that._onFieldGroupLeft(sID, oID);
					});
				}
			});
		}
	});

	/**
	 * Parameterizes the OData model.
	 * 
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @private
	 */
	ApplicationController.prototype._initModel = function(oModel) {
		// set binding mode and refresh after change.
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setRefreshAfterChange(false);
		
		// set the batch groups:
		// one should be deferred, as it is for batching actions and so
		// the other should be to sync changes immediately and should be
		// created second to make it "default".
		oModel.setDeferredBatchGroups([
			"Changes"
		]);
		oModel.setChangeBatchGroups({
			"*": {
				batchGroupId: "Changes",
				changeSetId: "Changes",
				single: false
			}
		});		
		oModel.setChangeBatchGroups({
			"*": {
				batchGroupId: "Sync",
				changeSetId: "Sync",
				single: false
			}
		});	
	};
	
	/**
	 * Event handler for field-group-validation event of the view.
	 * 
	 * @param {string} sID Field group id
	 * @param {object} oID Field group id
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the submit
	 * @private
	 */
	ApplicationController.prototype._onFieldGroupLeft = function(sID, oID) {
		var oContext, oSideEffect, fNoBusy, aControls, that = this, mParams = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			noShowSuccessToast: true,
			forceSubmit: true,	
			noBlockUI: true,
			urlParameters: {}
		};

		// busy animation.
		aControls = this._oView.getControlsByFieldGroupId(sID);
		this._setFieldGroupBusy(aControls, true);
				
		// set the side effects qualifier as action input.
		mParams.urlParameters.SideEffectsQualifier = oID.name.replace("com.sap.vocabularies.Common.v1.SideEffects", "");		
		
		if (mParams.urlParameters.SideEffectsQualifier.indexOf("#") === 0) {
			mParams.urlParameters.SideEffectsQualifier = mParams.urlParameters.SideEffectsQualifier.replace("#", "");
		}
		
		// create a new context and get the side effect.		
		oContext = this._oModel.getContext(oID.context);
		oSideEffect = this._getSideEffect(oID);
				
		// execute the side effect.
		fNoBusy = function() {
			that._setFieldGroupBusy(aControls, false);
		};
		return this._executeSideEffects(oSideEffect, oContext, mParams).then(fNoBusy, fNoBusy);	
	};

	/**
	 * Sets busy indicator for a field group.
	 * 
	 * @param {array} aControls Controls in field group
	 * @param {boolean} bBusy Flag for busy indicator state
	 * @private
	 */
	ApplicationController.prototype._setFieldGroupBusy = function(aControls, bBusy) {
		var len, i, oControl;
		
		if (aControls) {
			len = aControls.length;
		}
		
		for (i = 0; i < len; i++) {
			oControl = aControls[i];
			oControl.setBusy(bBusy);
		}
	};

	/**
	 * Executes a side effects annotation.
	 * 
	 * @param {object} oSideEffects The side effects annotation
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the submit
	 * @private
	 */
	ApplicationController.prototype._executeSideEffects = function(oSideEffects, oContext, mParameters) {
		// trigger prepare function
		this.getTransactionController().getDraftController().prepareDraft(oContext, mParameters);
		
		// trigger read.
		this._setSelect(oSideEffects, mParameters);
		this._read(oContext.getPath(), mParameters);
		
		// trigger flush.
		return this.triggerSubmitChanges(mParameters);			
	};
	
	/**
	 * Creates a $select statement for re-reading an entity based upon the side effects annotation.
	 * 
	 * @param {object} oSideEffects The side effects annotation
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @private
	 */
	ApplicationController.prototype._setSelect = function(oSideEffects, mParameters) {
		var i, len = 0, oTarget, sSelect = "$select=";
		
		if (oSideEffects.TargetProperties) {
			len = oSideEffects.TargetProperties.length;
			
			for (i = 0; i < len; i++) {
				if (i > 0) {
					sSelect = sSelect + ",";
				}
				
				oTarget = oSideEffects.TargetProperties[i];
				sSelect = sSelect + oTarget.PropertyPath;
			}
		}
		
		if (len > 0) {
			mParameters.urlParameters = [ sSelect ];
		}
	};
	
	/**
	 * Returns the side effect annotation for a given field group ID.
	 * 
	 * @param {object} oID Field group ID.
	 * @returns {object} The side effect annotation for a given ID
	 * @private
	 */
	ApplicationController.prototype._getSideEffect = function(oID) {
		var oMeta, oSet;
		
		oMeta = this._oModel.getMetaModel();
		oSet = oMeta.getODataEntitySet(oID.originName);
		
		return oSet[oID.name];
	};
	
	/**
	 * Returns the current transaction controller instance.
	 * 
	 * @returns {sap.ui.generic.app.transaction.TransactionController} The transaction controller instance
	 * @public
	 */
	ApplicationController.prototype.getTransactionController = function() {
		// create the transaction controller lazily.
		if (!this._oTransaction) {
			this._oTransaction = new TransactionController(this._oModel, this._oQueue, {
				noBatchGroups: true
			});
		}

		return this._oTransaction;
	};
	
	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	ApplicationController.prototype.destroy = function() {
		BaseController.prototype.destroy.apply(this, []);
		
		if (this._oTransaction) {
			this._oTransaction.destroy();
		}
		
		this._oView = null;
		this._oModel = null;
		this._oTransaction = null;
	};
	
	return ApplicationController;

}, true);