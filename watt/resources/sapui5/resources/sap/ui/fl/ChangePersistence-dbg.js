/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
/*global Promise */

sap.ui.define([
	"sap/ui/fl/Change", "sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache"
], function(Change, Utils, $, LRepConnector, Cache) {
	"use strict";

	/**
	 * Helper object to access a change from the backend. Access helper object for each change (and variant) which was fetched from the backend
	 *
	 * @constructor
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.25.0
	 * @param {string} sComponentName - the name of the component this instance is responsible for
	 * @param {sap.ui.fl.LrepConnector} [oLrepConnector] the LREP connector
	 */
	var ChangePersistence = function(sComponentName, oLrepConnector) {
		this._sComponentName = sComponentName;

		if (!this._sComponentName) {
			Utils.log.error("The Control does not belong to a SAPUI5 component. Personalization and changes for this control might not work as expected.");
			throw new Error("Missing component name.");
		}

		this._oConnector = oLrepConnector || this._createLrepConnector();
		this._aDirtyChanges = [];
	};

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @returns {String} component name
	 * @public
	 */
	ChangePersistence.prototype.getComponentName = function() {
		return this._sComponentName;
	};

	/**
	 * Creates a new instance of the LRepConnector
	 *
	 * @returns {sap.ui.fl.LrepConnector} LRep connector instance
	 * @private
	 */
	ChangePersistence.prototype._createLrepConnector = function() {
		return LRepConnector.createConnector();
	};

	/**
	 * Calls the backend asynchronously and fetches all changes for the component. If there are any new changes (dirty state) whoch are not yet saved to the backend, these changes will not be returned
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component 
	 * @see sap.ui.fl.Change
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForComponent = function(mPropertyBag) {
		return Cache.getChangesFillingCache(this._oConnector, this._sComponentName, mPropertyBag).then(function(oWrappedChangeFileContent) {
			this._bHasLoadedChangesFromBackend = true;

			if (!oWrappedChangeFileContent.changes || !oWrappedChangeFileContent.changes.changes) {
				return [];
			}

			var aChanges = oWrappedChangeFileContent.changes.changes;

			return aChanges.filter(preconditionsFulfilled).map(createChange);
		}.bind(this));

		function createChange(oChangeContent) {
			return new Change(oChangeContent);
		}

		function preconditionsFulfilled(oChangeContent) {
			if (oChangeContent.fileType !== 'change') {
				return false;
			}

			if (oChangeContent.changeType === 'defaultVariant') {
				return false;
			}

			//noinspection RedundantIfStatementJS
			if (!oChangeContent.selector || !oChangeContent.selector.id) {
				return false;
			}

			return true;
		}
	};

	/**
	 * Gets the changes for the given view id. The complete view prefix has to match.
	 *
	 * Example:
	 * Change has selector id:
	 * view1--view2--controlId
	 *
	 * Will match for view:
	 * view1--view2
	 *
	 * Will not match for view:
	 * view1
	 * view1--view2--view3
	 *
	 * @param {string} sViewId - the id of the view, changes should be retrieved for
	 * @param {map} mPropertyBag - (optional) contains additional data that are needed for reading of changes
	 * - appDescriptor that belongs to actual component
	 * - siteId that belongs to actual component  
	 * @returns {Promise} resolving with an array of changes
	 * @public
	 */
	ChangePersistence.prototype.getChangesForView = function(sViewId, mPropertyBag) {
		return this.getChangesForComponent(mPropertyBag).then(function(aChanges) {
			return aChanges.filter(changesHavingCorrectViewPrefix);
		});

		function changesHavingCorrectViewPrefix(oChange) {
			var sSelectorId = oChange.getSelector().id;
			var sSelectorIdViewPrefix = sSelectorId.slice(0, sSelectorId.lastIndexOf('--'));

			return sSelectorIdViewPrefix === sViewId;
		}
	};

	/**
	 * Adds a new change (could be variant as well) and returns the id of the new change.
	 *
	 * @param {object} oChangeFile - The complete and finalized JSON object representation the file content of the change
	 * @returns {sap.ui.fl.Change} the newly created change object
	 * @public
	 */
	ChangePersistence.prototype.addChange = function(oChangeFile) {
		var oNewChange = new Change(oChangeFile);
		this._aDirtyChanges.push(oNewChange);

		return oNewChange;
	};

	/**
	 * Saves all dirty changes by calling the appropriate backend method
	 * (create for new changes, deleteChange for deleted changes). The methods
	 * are called sequentially to ensure order. After a change has been saved
	 * successfully, the cache is updated and the changes is removed from the dirty
	 * changes.
	 *
	 * @returns {Promise} resolving after all changes have been saved
	 */
	ChangePersistence.prototype.saveDirtyChanges = function() {
		var sComponentName = this._sComponentName;
		var oConnector = this._oConnector;
		var aDirtyChangesClone = this._aDirtyChanges.slice(0);
		var aDirtyChanges = this._aDirtyChanges;

		return aDirtyChangesClone.reduce(function(sequence, oDirtyChange) {
			var saveAction = sequence.then(performSaveAction(oDirtyChange));
			saveAction.then(updateCacheAndDirtyState(oDirtyChange));

			return saveAction;
		}, Promise.resolve());

		function performSaveAction(oDirtyChange) {
			return function() {
				if (oDirtyChange.getPendingAction() === 'NEW') {
					return oConnector.create(oDirtyChange.getDefinition(), oDirtyChange.getRequest());
				}

				if (oDirtyChange.getPendingAction() === 'DELETE') {
					return oConnector.deleteChange({
						sChangeName: oDirtyChange.getId(),
						sLayer: oDirtyChange.getLayer(),
						sNamespace: oDirtyChange.getNamespace(),
						sChangelist: oDirtyChange.getRequest()
					});
				}
			};
		}

		function updateCacheAndDirtyState(oDirtyChange) {
			return function() {
				if (oDirtyChange.getPendingAction() === 'NEW') {
					Cache.addChange(sComponentName, oDirtyChange.getDefinition());
				}

				if (oDirtyChange.getPendingAction() === 'DELETE') {
					Cache.deleteChange(sComponentName, oDirtyChange.getDefinition());
				}
				
				var iIndex = aDirtyChanges.indexOf(oDirtyChange);
				if (iIndex > -1) {
					aDirtyChanges.splice(iIndex, 1);
				}
			};
		}

	};

	ChangePersistence.prototype.getDirtyChanges = function() {
		return this._aDirtyChanges;
	};

	/**
	 * Prepares a change to be deleted with the next call to
	 * @see {ChangePersistence#saveDirtyChanges}.
	 *
	 * If the given change is already in the dirty changes and
	 * has pending action 'NEW' it will be removed, assuming,
	 * it has just been created in the current session.
	 *
	 * Otherwise it will be marked for deletion.
	 *
	 * @param {sap.ui.fl.Change} oChange - the change to be deleted
	 */
	ChangePersistence.prototype.deleteChange = function(oChange) {
		var index = this._aDirtyChanges.indexOf(oChange);

		if (index > -1) {
			if (oChange.getPendingAction() === 'DELETE'){
				return;
			}
			this._aDirtyChanges.splice(index, 1);
			return;
		}

		oChange.markForDeletion();
		this._aDirtyChanges.push(oChange);
	};

	return ChangePersistence;
}, true);
