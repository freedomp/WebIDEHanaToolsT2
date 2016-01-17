/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
/* global Promise */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/Persistence", "sap/ui/fl/registry/ChangeRegistry", "sap/ui/fl/Utils", "sap/ui/fl/Change", "sap/ui/fl/registry/Settings", "sap/ui/fl/ChangePersistenceFactory", "sap/ui/core/mvc/View"
], function(jQuery, Persistence, ChangeRegistry, Utils, Change, FlexSettings, ChangePersistenceFactory, View) {
	"use strict";

	/**
	 * Retrieves changes (LabelChange, etc.) for a sap.ui.core.mvc.View and applies these changes
	 * 
	 * @params {string} sComponentName -the component name the flex controler is responsible for
	 * @constructor
	 * @class
	 * @alias sap.ui.fl.FlexController
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version 1.32.7
	 */
	var FlexController = function(sComponentName) {
		this._oChangePersistence = undefined;
		this._sComponentName = sComponentName || "";
		if (this._sComponentName) {
			this._createChangePersistence();
		}
	};

	/**
	 * Sets the component name of the FlexController
	 * 
	 * @param {String} sComponentName The name of the component
	 * @public
	 */
	FlexController.prototype.setComponentName = function(sComponentName) {
		this._sComponentName = sComponentName;
		this._createChangePersistence();
	};

	/**
	 * Returns the component name of the FlexController
	 * 
	 * @returns {String} the name of the component
	 * @public
	 */
	FlexController.prototype.getComponentName = function() {
		return this._sComponentName;
	};

	/**
	 * Adds a change to the flex persistence (not yet saved). Will be saved with #saveAll.
	 * 
	 * @param {object} oChangeSpecificData property bag (nvp) holding the change information (see sap.ui.fl.Change#createInitialFileContent
	 *        oPropertyBag). The property "packageName" is set to $TMP and internally since flex changes are always local when they are created.
	 * @param {sap.ui.core.Control} oControl control for which the change will be added
	 * @returns {sap.ui.fl.Change} the created change
	 * @public
	 */
	FlexController.prototype.addChange = function(oChangeSpecificData, oControl) {

		var oChangeFileContent, oChange, ChangeHandler, oChangeHandler;

		var sComponentName = this.getComponentName();
		oChangeSpecificData.componentName = sComponentName;
		oChangeSpecificData.namespace = sComponentName;
		oChangeSpecificData.packageName = '$TMP'; // first a flex change is always local, until all changes of a component are made transportable

		oChangeFileContent = Change.createInitialFileContent(oChangeSpecificData);
		oChange = this._oChangePersistence.addChange(oChangeFileContent);

		// for getting the change handler the control type and the change type are needed
		ChangeHandler = this._getChangeHandler(oChange, oControl);
		if (ChangeHandler) {
			oChangeHandler = new ChangeHandler();
			oChangeHandler.completeChangeContent(oChange, oChangeSpecificData);
		} else {
			throw new Error('Change handler could not be retrieved for change ' + JSON.stringify(oChangeSpecificData));
		}
// first a flex change is always local, until all changes of a component are made transportable
// if ( oChangeSpecificData.transport ){
// oChange.setRequest(oChangeSpecificData.transport);
// }
		return oChange;
	};

	/**
	 * Creates a new change and applies it immediately
	 * 
	 * @param {object} oChangeSpecificData The data specific to the change, e.g. the new label for a RenameField change
	 * @param {sap.ui.core.Control} oControl The control where the change will be applied to
	 * @public
	 */
	FlexController.prototype.createAndApplyChange = function(oChangeSpecificData, oControl) {
		var oChange = this.addChange(oChangeSpecificData, oControl);
		try {
			this.applyChange(oChange, oControl);
		} catch (ex) {
			this._oChangePersistence.deleteChange(oChange);
			throw ex;
		}
	};

	/**
	 * Saves all changes of a persistence instance.
	 * 
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	FlexController.prototype.saveAll = function() {
		return this._oChangePersistence.saveDirtyChanges();
	};

	/**
	 * Loads and applies all changes for the specified view
	 * 
	 * @params {object} oView - the view to process
	 * @returns {Promise} without parameters. Promise resolves once all changes of the view have been applied
	 * @public
	 */
	FlexController.prototype.processView = function(oView) {
		var that = this;
		var mPropertyBag = {
			appDescriptor: Utils.getAppDescriptor(oView),
			siteId: Utils.getSiteId(oView)
		};

		var bIsFlexEnabled = this._isFlexEnabled(oView);
		if (!bIsFlexEnabled) {
			return Promise.resolve("No control found, which enable flexibility features. Processing skipped.");
		}

		// do an async fetch of the flex settings
		// to work with that settings during the session
		return FlexSettings.getInstance(this.getComponentName(), mPropertyBag).then(function(oSettings) {
			return that._getChangesForView(oView, mPropertyBag);
		}).then(function(aChanges) {
			aChanges.forEach(function(oChange) {
				var oControl = that._getControlByChange(oChange);
				that.applyChangeAndCatchExceptions(oChange, oControl);
			});
		})['catch'](function(error) {
			Utils.log.error('Error processing view ' + error);
		});
	};

	/**
	 * Triggers applyChange and catches exceptions, if some were thrown (logs changes that could not be applied)
	 * 
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @public
	 */
	FlexController.prototype.applyChangeAndCatchExceptions = function(oChange, oControl) {
		try {
			this.applyChange(oChange, oControl);
		} catch (ex) {
			var oChangeDefinition = oChange.getDefinition();
			Utils.log.error("Change could not be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType + ": " + ex);
		}
	};

	/**
	 * Retrieves the corresponding change handler for the change and applies the change to the control
	 * 
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @public
	 */
	FlexController.prototype.applyChange = function(oChange, oControl) {
		var ChangeHandler, oChangeHandler;
		ChangeHandler = this._getChangeHandler(oChange, oControl);
		if (!ChangeHandler) {
			if (oChange && oControl) {
				Utils.log.warning("Change handler implementation for change not found - Change ignored");
			}
			return;
		}

		try {
			oChangeHandler = new ChangeHandler();
			if (oChangeHandler && typeof oChangeHandler.applyChange === 'function') {
				oChangeHandler.applyChange(oChange, oControl);
			}
		} catch (ex) {
			this._setMergeError(true);
			Utils.log.error("Change could not be applied. Merge error detected.");
			throw ex;
		}
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 * 
	 * @param {sap.ui.fl.Change} oChange - Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @returns {sap.ui.fl.changeHandler.Base} the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeHandler = function(oChange, oControl) {
		var oChangeTypeMetadata, fChangeHandler;

		oChangeTypeMetadata = this._getChangeTypeMetadata(oChange, oControl);
		if (!oChangeTypeMetadata) {
			return undefined;
		}

		fChangeHandler = oChangeTypeMetadata.getChangeHandler();
		return fChangeHandler;
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 * 
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @returns {sap.ui.fl.registry.ChangeTypeMetadata} the registry item containing the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeTypeMetadata = function(oChange, oControl) {
		var oChangeRegistryItem, oChangeTypeMetadata;

		oChangeRegistryItem = this._getChangeRegistryItem(oChange, oControl);
		if (!oChangeRegistryItem || !oChangeRegistryItem.getChangeTypeMetadata) {
			return undefined;
		}

		oChangeTypeMetadata = oChangeRegistryItem.getChangeTypeMetadata();
		return oChangeTypeMetadata;
	};

	/**
	 * Retrieves the <code>sap.ui.fl.registry.ChangeRegistryItem</code> for the given change and control
	 * 
	 * @param {sap.ui.fl.Change} oChange Change instance
	 * @param {sap.ui.core.Control} oControl Control instance
	 * @returns {sap.ui.fl.registry.ChangeRegistryItem} the registry item containing the change handler. Undefined if not found.
	 * @private
	 */
	FlexController.prototype._getChangeRegistryItem = function(oChange, oControl) {
		var sChangeType, sControlType, oChangeRegistryItem, sLayer;
		if (!oChange || !oControl) {
			return undefined;
		}

		sChangeType = oChange.getChangeType();
		sControlType = Utils.getControlType(oControl);

		if (!sChangeType || !sControlType) {
			return undefined;
		}

		sLayer = oChange.getLayer();

		oChangeRegistryItem = this._getChangeRegistry().getRegistryItems({
			"changeTypeName": sChangeType,
			"controlType": sControlType,
			"layer": sLayer
		});
		if (oChangeRegistryItem && oChangeRegistryItem[sControlType] && oChangeRegistryItem[sControlType][sChangeType]) {
			return oChangeRegistryItem[sControlType][sChangeType];
		} else if (oChangeRegistryItem && oChangeRegistryItem[sControlType]) {
			return oChangeRegistryItem[sControlType];
		} else {
			return oChangeRegistryItem;
		}
	};

	/**
	 * Returns the change registry
	 * 
	 * @returns {sap.ui.fl.registry.ChangeRegistry} Instance of the change registry
	 * @private
	 */
	FlexController.prototype._getChangeRegistry = function() {
		var oInstance = ChangeRegistry.getInstance();
		// make sure to use the most current flex settings that have been retrieved during processView
		oInstance.initSettings(this.getComponentName());
		return oInstance;
	};

	/**
	 * Returns the control where the change will be applied to. Undefined if control cannot be found.
	 * 
	 * @param {sap.ui.fl.Change} oChange Change
	 * @returns {sap.ui.core.Control} Control where the change will be applied to
	 * @private
	 */
	FlexController.prototype._getControlByChange = function(oChange) {
		var oSelector;

		if (!oChange) {
			return undefined;
		}
		oSelector = oChange.getSelector();
		if (oSelector && typeof oSelector.id === "string") {
			return sap.ui.getCore().byId(oSelector.id);
		}

		return undefined;
	};

	/**
	 * Retrieves the changes for the complete UI5 component
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component 
	 * @returns {Promise} Promise resolves with a map of all {sap.ui.fl.Change} having the changeId as key
	 * @public
	 */
	FlexController.prototype.getComponentChanges = function(mPropertyBag) {
		return this._oChangePersistence.getChangesForComponent(mPropertyBag);
	};

	/**
	 * Retrieves the changes for the view and its siblings (except nested views)
	 * 
	 * @params {object} oView - the view
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component  
	 * @returns {Promise} Promise resolves with a map of all {sap.ui.fl.Change} of a component
	 * @private
	 */
	FlexController.prototype._getChangesForView = function(oView, mPropertyBag) {
		return this._oChangePersistence.getChangesForView(oView.getId(), mPropertyBag);
	};

	/**
	 * Creates a new instance of sap.ui.fl.Persistence based on the current component and caches the instance in a private member
	 * 
	 * @returns {sap.ui.fl.Persistence} persistence instance
	 * @private
	 */
	FlexController.prototype._createChangePersistence = function() {
		this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.getComponentName());
		return this._oChangePersistence;
	};

	/**
	 * Discard changes on the server.
	 * 
	 * @param {array} aChanges array of {sap.ui.fl.Change} to be discarded
	 * @returns {Promise} promise that resolves without parameters.
	 */
	FlexController.prototype.discardChanges = function(aChanges) {
		var sActiveLayer = Utils.getCurrentLayer(false);
		aChanges.forEach(function(oChange) {
			// only discard changes of the currently active layer (CUSTOMER vs PARTNER vs VENDOR)
			if (oChange && oChange.getLayer && oChange.getLayer() === sActiveLayer) {
				this._oChangePersistence.deleteChange(oChange);
			}
		}.bind(this));

		return this._oChangePersistence.saveDirtyChanges();
	};

	/**
	 * Searches for controls in the view control tree, which enable flexibility features.
	 * 
	 * @param {sap.ui.core.Control} oParentControl Parent control instance
	 * @returns {boolean} true if the view contains controls, which enable flexibility features, false if not.
	 * @private
	 */
	FlexController.prototype._isFlexEnabled = function(oParentControl) {
		var that = this;
		var bIsFlexEnabled = false;

		if (oParentControl.getMetadata) {
			var oParentControlMetadata = oParentControl.getMetadata();
			var oAggregations = oParentControlMetadata.getAllAggregations();
			var aAggregationKeys = Object.keys(oAggregations);
			jQuery.each(aAggregationKeys, function(iAggragationKeyIndex, sAggregationKey) {
				if (oParentControlMetadata.getAggregation) {
					var oAggregation = oParentControlMetadata.getAggregation(sAggregationKey);
					if ( oAggregation && oAggregation.get) {
						var aAggregations = oAggregation.get(oParentControl);
						if (aAggregations) {
							if (!Array.isArray(aAggregations)) {
								// in case of an aggregation with a cardinality of 0..1 the object is returned not in an array.
								aAggregations = [
									aAggregations
								];
							}
							jQuery.each(aAggregations, function(index, oChildControl) {
								if (typeof oChildControl.getFlexEnabled === 'function' && oChildControl.getFlexEnabled()) {
									bIsFlexEnabled = true;
									return false; // break inner jQuery.each
								} else {
									bIsFlexEnabled = that._isFlexEnabled(oChildControl);
									if (bIsFlexEnabled === true) {
										return false; // break inner jQuery.each
									}
								}
							});
							if (bIsFlexEnabled === true) {
								return false; // break outer jQuery.each
							}
						}
					}
				}
			});
		}
		return bIsFlexEnabled;
	};

	FlexController.prototype.deleteChangesForControlDeeply = function(oControl) {
		return Promise.resolve();
	};

	/**
	 * Set flag if an error has occured when merging changes
	 * 
	 * @param {Boolean} bHasErrorOccured Indicator if an error has occured
	 * @private
	 */
	FlexController.prototype._setMergeError = function(bHasErrorOccured) {

		// in this case FlexSettings.getInstance does not get passed (AppDescriptorId and SiteId) as setMergeErrorOccured ONLY enrich setting instance
		// with runtime data. No direct backend call
		return FlexSettings.getInstance(this.getComponentName()).then(function(oSettings) {
			oSettings.setMergeErrorOccured(true);
		});
	};

	return FlexController;
}, true);
