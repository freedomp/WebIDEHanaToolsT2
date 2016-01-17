/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([	"jquery.sap.global", "./BaseController", "./DraftController", "sap/ui/generic/app/util/ModelUtil" ], function(jQuery, BaseController, DraftController, ModelUtil) { // EXC_JSHINT_037 // EXC_JSHINT_034
	"use strict";

	/* global Promise */

	/**
	 * Constructor for a new transaction controller instance.
	 * 
	 * @public
	 * @class Assuming state-less communication, each single data modification request (or change set in an OData $batch request) is a
	 *        "mini-transaction", which saves data to the database. The class allows you to submit changes, invoke actions, OData CRUD operations in general,
	 *        and trigger client-side validations. It ensures concurrency control and correct ETag handling.
	 *        
	 *        The class gives access to runtime draft handling for applications. Additionally error handling capabilities are provided to notify client 
	 *        implementations of error situations. The event <code>fatalError</code> is thrown, if fatal errors occur during execution of OData requests.
	 * @author SAP SE
	 * @version 1.32.7
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.transaction.TransactionController
	 * @param {sap.ui.model.odata.ODataModel} oModel The OData model currently used
	 * @param {sap.ui.generic.app.util.Queue} oQueue Optional HTTP request queue
	 * @param {map} mParams Optional configuration parameters
	 * @param {boolean} mParams.noBatchGroups Suppresses creation of batch groups
	 * @throws {Error} Throws an error if no model is handed over as input parameter
	 */
	var TransactionController = BaseController.extend("sap.ui.generic.app.transaction.TransactionController", {
		metadata: {
			publicMethods: [
				"destroy", "setBatchStrategy", "getDraftController", "invokeAction", "editEntity", "deleteEntity", "propertyChanged", "hasClientValidationErrors", "resetChanges" // EXC_JSHINT_037
			]
		},

		constructor: function(oModel, oQueue, mParams) {
			BaseController.apply(this, [ oModel, oQueue ]);
			this.sName = "sap.ui.generic.app.transaction.TransactionController";
			this._oDraft = null;

			// make sure changes are sent by submitChanges only.
			mParams = mParams || {};
			
			if (!mParams.noBatchGroups) {
				oModel.setDeferredBatchGroups([
					"Changes"
				]);
	
				// make sure one change set is used by default for every change.
				oModel.setChangeBatchGroups({
					"*": {
						batchGroupId: "Changes",
						changeSetId: "Changes",
						single: false
					}
				});
			}
	
			return this.getInterface();
		}
	});

	/**
	 * Sets the strategy for batch handling. Currently all batch operations are sent in one batch group, but alternatively one can
	 * trigger sending all operations in their own batch group.
	 * 
	 * @param {boolean} bSingle If set to <code>true</code>, all batch operations are sent in their own batch group, otherwise all operations are
	 *        sent in one batch group
	 * @private
	 * @deprecated Since 1.32.0
	 */
	TransactionController.prototype.setBatchStrategy = function(bSingle) {
		var n, mChangeBatchGroups = this._oModel.getChangeBatchGroups();

		for (n in mChangeBatchGroups) { // EXC_JSHINT_041
			mChangeBatchGroups[n].single = bSingle;
		}

		this._oModel.setChangeBatchGroups(mChangeBatchGroups);
	};

	/**
	 * Returns the current draft controller instance.
	 * 
	 * @returns {sap.ui.generic.app.transaction.DraftController} The draft controller instance
	 * @public
	 */
	TransactionController.prototype.getDraftController = function() {
		// create the draft controller lazily.
		if (!this._oDraft) {
			this._oDraft = new DraftController(this._oModel, this._oQueue);
		}

		return this._oDraft;
	};

	/**
	 * Prepares an entity for editing. If the entity is active and draft enabled, a new draft document is created. If not, the control is
	 * automatically returned to the caller of the method by returning a resolved promise.
	 * 
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	TransactionController.prototype.editEntity = function(oContext) {
		var that = this;

		return new Promise(function(resolve) {
			var oDraftContext, sEntitySet;
			
			oDraftContext = that.getDraftController().getDraftContext();
			sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
			
			if (oDraftContext.isDraftEnabled(sEntitySet) && that._oDraftUtil.isActiveEntity(oContext.getObject())) {
				return resolve(that.getDraftController().createEditDraftEntity(oContext));
			}

			return resolve({
				context: oContext
			});
		});
	};

	/**
	 * Submits changes to the back-end and deletes an entity in the back-end. This entity can be either a draft entity or an active entity.
	 * 
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @public
	 */
	TransactionController.prototype.deleteEntity = function(oContext, mParameters) {
		var oPromise, oPromise2, that = this;

		mParameters = mParameters || {};
		jQuery.extend(mParameters, {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Changes were discarded",
			failedMsg: "Discarding of changes failed",
			forceSubmit: true,
			context: oContext
		});

		oPromise = this._remove(oContext.getPath(), mParameters).then(function(oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function(oResponse) {
			var oResponseOut = that._normalizeError(oResponse);
			throw oResponseOut;
		});
		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};

	/**
	 * Invokes an action with the given name and submits changes to the back-end.
	 * 
	 * @param {string} sFunctionName The name of the function or action
	 * @param {sap.ui.model.Context} oContext The given binding context
	 * @param {map} mParameters Parameters to control the behavior of the request
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @throws {Error} Throws an error if the OData function import does not exist or the action input parameters are invalid
	 * @public
	 */
	TransactionController.prototype.invokeAction = function(sFunctionName, oContext, mParameters) {
		var that = this, oPromise, oPromise2;

		// check for client message.
		oPromise = this.hasClientMessages();

		if (oPromise) {
			return oPromise;
		}

		mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			successMsg: "Call of action succeeded",
			failedMsg: "Call of action failed",
			urlParameters: mParameters.urlParameters,
			forceSubmit: true,
			context: oContext
		};

		oPromise = this._callAction(sFunctionName, oContext, mParameters).then(function(oResponse) {
			return that._normalizeResponse(oResponse, true);
		}, function(oResponse) {
			var oOut = that._normalizeError(oResponse);
			throw oOut;
		});
		
        // TODO: check for side effects
        // if no side effects are annotated refresh the complete model
        this._oModel.refresh(true, false, "Changes");
		
		oPromise2 = this.triggerSubmitChanges(mParameters);

		// continue, if all "sub-ordinate" promises have been resolved.
		return this._returnPromiseAll([
			oPromise, oPromise2
		]);
	};

	/**
	 * Resets changes that have been tracked by the current instance of <code>sap.ui.model.odata.v2.ODatatModel</code>. These changes have been
	 * created by invoking the <code>setProperty</code> method of <code>sap.ui.model.odata.v2.ODatatModel</code>.
	 * 
	 * @param{array} aKeys Optional array of keys that have to be reset. If no array is passed all changes will be reset.
	 * @public
	 */
	TransactionController.prototype.resetChanges = function(aKeys) {
		this._oModel.resetChanges(aKeys);
	};
	
	/**
	 * Notifies the transaction controller of a change of a property. Please note that the method is not meant for public use currently.
	 * It is experimental.
	 * 
	 * @param {string} sEntitySet The name of the entity set
	 * @param {string} sProperty Path identifying the changed property
	 * @param {object} oBinding The binding associated with the changed property
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action
	 * @deprecated
	 * @private
	 */
	TransactionController.prototype.propertyChanged = function(sEntitySet, sProperty, oBinding) {
		var oDraftContext, oContext, mParameters = {
			batchGroupId: "Changes",
			changeSetId: "Changes",
			binding: oBinding
		};

		oDraftContext = this.getDraftController().getDraftContext();

		// if (this.hasClientValidationErrors()) {
		// ask core guys how to check for client validation errors.
		// if (bUpdateOnChange) {
		// // what to do? inform user?
		// }
		// } else {
		if (oDraftContext.checkUpdateOnChange(sEntitySet, sProperty)) {
			oContext = oBinding.getBoundContext();

			if (oDraftContext.hasDraftPreparationAction(oContext)) {
				return this.getDraftController().saveAndPrepareDraftEntity(oContext, mParameters);
			}

			mParameters.onlyIfPending = true;
			return this.triggerSubmitChanges(mParameters);
		}

		mParameters.onlyIfPending = true;
		mParameters.noShowResponse = true;
		mParameters.noBlockUI = true;
		return this.triggerSubmitChanges(mParameters);
		// }
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	TransactionController.prototype.destroy = function() {
		BaseController.prototype.destroy.apply(this, []);

		if (this._oDraft) {
			this._oDraft.destroy();
		}

		this._oDraft = null;
	};

	return TransactionController;

}, true);
