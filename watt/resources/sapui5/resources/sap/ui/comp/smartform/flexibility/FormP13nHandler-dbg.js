/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
/*global Promise */

sap.ui.define([
	"jquery.sap.global", "sap/m/Dialog", "sap/m/FlexBox", "sap/m/FlexItemData", "sap/m/Text", "sap/m/Button", "sap/m/DialogType", "sap/ui/core/mvc/XMLView", "sap/ui/comp/smartform/SmartForm", "sap/ui/comp/smartform/Group", "sap/ui/comp/smartform/GroupElement", "sap/ui/comp/odata/FieldSelector", "sap/ui/fl/Utils", "sap/ui/model/json/JSONModel", "sap/ui/fl/FlexControllerFactory", "sap/m/MessageBox", "sap/ui/comp/transport/TransportSelection", "sap/ui/fl/Transports", "sap/ui/fl/registry/Settings"
], function(jQuery, Dialog, FlexBox, FlexItemData, Text, Button, DialogType, XMLView, SmartForm, SmartGroup, SmartField, FieldSelector, FlexUtils, JSONModel, FlexControllerFactory, MessageBox, TransportSelection, Transports, FlexSettings) {
	"use strict";

	/**
	 * @constructor
	 * @alias sap.ui.comp.smartform.flexibility.FormP13nHandler
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 * @private
	 */
	var FormP13nHandler = function() {

		this._oOriginalDataModelForDialog = null;
	};

	/**
	 * Initialize the form personalization handler
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm - smart form instance.
	 * @private
	 */
	FormP13nHandler.prototype.init = function(oSmartForm) {
		var mPropertyBag;
		
		this._oSmartForm = oSmartForm;
		this._oDialogContent = null;
		this._textResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
		this._oDialog = this._createDialog();
		var that = this;
		this._mergeErrorOccured = false;

		var oFlexController = this._getFlexController();
		if (this._oSmartForm) {
			mPropertyBag = {
			                appDescriptor: FlexUtils.getAppDescriptor(this._oSmartForm),
			                siteId: FlexUtils.getSiteId(this._oSmartForm)
			};
		}
		
		return FlexSettings.getInstance(oFlexController.getComponentName(), mPropertyBag).then(function(oSettings) {
			if (!oSettings.hasMergeErrorOccured()) {
				that._oDialog.setContentHeight("60%");
				that._oDialog.setTitle(that._textResources.getText("FORM_PERS_DIALOG_TITLE"));
				that._oDialogContent = that._createDialogContent();
				that._oDialog.addContent(that._oDialogContent);

			} else {
				that._mergeErrorOccured = true;
				that._oDialog.setType(DialogType.Message);
				that._oDialog.setTitle(that._textResources.getText("FORM_PERS_DIALOG_ERR_TITLE"));
				that._showMergeErrorMessageInDialog();
			}
			that._createButtons(oSettings);
		});
	};

	/**
	 * Creates an empty dialog
	 *
	 * @returns {sap.m.Dialog} Dialog
	 * @private
	 */
	FormP13nHandler.prototype._createDialog = function() {
		var oDialog;
		oDialog = new Dialog("smartFormPersDialog", {
			contentWidth: "60%",
			verticalScrolling: false,
			horizontalScrolling: false,
			afterClose: [this._destroyDialog, this]
		});
		return oDialog;
	};

	/**
	 * Create the buttons for saving, canceling and reset
	 * @parm {sap.ui.fl.registry.Settings} oSettings Settings for the current component
	 * @private
	 */
	FormP13nHandler.prototype._createButtons = function(oSettings) {
		// OK
		var oOkButton = new Button(this._oDialog.getId() + '-OkButton');
		oOkButton.setText(this._textResources.getText("FORM_PERS_DIALOG_OK"));
		oOkButton.attachPress(this._dialogOkClicked.bind(this));
		this._oDialog.addButton(oOkButton);

		// Cancel
		var oCancelButton = new Button(this._oDialog.getId() + '-CancelButton');
		oCancelButton.setText(this._textResources.getText("FORM_PERS_DIALOG_CANCEL"));
		oCancelButton.attachPress({
			sAction: "cancel"
		}, this._closeDialog, this);
		this._oDialog.addButton(oCancelButton);

		// Discard
		var oDiscardButton = new Button(this._oDialog.getId() + '-RestoreButton');
		oDiscardButton.setText(this._textResources.getText("FORM_PERS_DIALOG_RESET"));
		oDiscardButton.attachPress({
			sAction: "discard"
		}, this._confirmDiscardAllChanges, this);
		this._oDialog.addButton(oDiscardButton);

		if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
			// Transport
			var oTransportButton = new Button(this._oDialog.getId() + '-TransportButton');
			oTransportButton.setText(this._textResources.getText("FORM_PERS_DIALOG_TRANSPORT"));
			oTransportButton.attachPress({
				sAction: "transport"
			}, this._confirmTransportAllChanges, this);
			if (this._oDialog) {
				this._oDialog.addButton(oTransportButton);
			}
		}
	};

	/**
	 * Shows a transport selection error message.
	 *
	 * @param {object} oError - error object.
	 * @returns {Promise} promise that resolves with no parameters when the error message box is closed.
	 * @private
	 */
	FormP13nHandler.prototype._showTransportErrorMessage = function(oError) {
		return this._showMessage(MessageBox.Icon.ERROR, "FORM_PERS_TRANSPORT_ERROR_TITLE", "FORM_PERS_TRANSPORT_ERROR_MESSAGE", oError);
	};

	/**
	 * Opens the transport selection dialog
	 *
	 * @param {sap.ui.fl.Change} [oChange] - the change for which the transport information should be retrieved
	 * @returns {Promise} promise that resolves
	 * @private
	 */
	FormP13nHandler.prototype._openTransportSelection = function(oChange, bSuccessOnCancel) {
		var that = this;

		return new Promise(function(resolve, reject) {
			var fOkay = function(oResult) {
				if (oResult && oResult.getParameters) {
					var sTransport = oResult.getParameters().selectedTransport;
					var sPackage = oResult.getParameters().selectedPackage;
					var bFromDialog = oResult.getParameters().dialog;
					var oTransportInfo = {
						transport: sTransport,
						packageName: sPackage,
						fromDialog: bFromDialog
					};
					resolve(oTransportInfo);
				} else {
					resolve({});
				}
			};
			var fError = function(oError) {
				if (bSuccessOnCancel && (oError.sId === '' || oError.sId === 'cancel')) {
					resolve();
				}

				that._showTransportErrorMessage(oError).then(function() {
					reject(oError);
				});
			};
			var oObject = {}; // no restriction on package, name or name space
			if (oChange) {
				oObject["package"] = oChange.getPackage();
				oObject.namespace = oChange.getNamespace();
				oObject.name = oChange.getId();
				oObject.type = oChange.getDefinition().fileType;
			}
			var oTransports = new sap.ui.comp.transport.TransportSelection();
			oTransports.selectTransport(oObject, fOkay, fError, false, that._oSmartForm);
		});
	};

	/**
	 * Event handler - called when user has clicked the OK button in the personalization dialog. Creates change files and saves them to the backend.
	 *
	 * @private
	 * @returns {Promise} promise that resolves with no parameters
	 */
	FormP13nHandler.prototype._dialogOkClicked = function() {
		var aChangeSpecificData = [];
		if (!this._mergeErrorOccured) {
			aChangeSpecificData = this._getChangeDataFromDialog();
		}

		if (aChangeSpecificData.length === 0) {
			this._closeDialog();
			return new Promise(function(resolve, reject) {
				resolve({});
			});
		}

		var that = this;
		// Pass empty transport info object to save as LOCAL
		return that._createAndApplyChanges(aChangeSpecificData).then(function() {
			that._closeDialog();
		});
	};

	/**
	 * Create and apply changes.
	 *
	 * @param {array} aChangeSpecificData array of objects with change specific data
	 * @returns {Promise} promise that resolves with no parameters
	 * @private
	 */
	FormP13nHandler.prototype._createAndApplyChanges = function(aChangeSpecificData) {
		var that = this;

		return Promise.resolve().then(function() {

			var oFlexController;

			oFlexController = that._getFlexController();
			function fnValidChanges(oChangeSpecificData) {
				return oChangeSpecificData && oChangeSpecificData.selector && oChangeSpecificData.selector.id;
			}

			aChangeSpecificData.filter(fnValidChanges).forEach(function(oChangeSpecificData) {
				var oControl = that._getControlById(oChangeSpecificData.selector.id);
				oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
			});

		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply error: " + oError);
			return oError;
		}).then(function(oError) {
			return that._getFlexController().saveAll().then(function() {
				if (oError) {
					throw oError;
				}
			});
		})['catch'](function(oError) {
			FlexUtils.log.error("Create and apply and/or save error: " + oError);
			return that._showApplySaveChangesErrorMessage(oError);
		});
	};

	/**
	 * Gets the control for the control ID.
	 *
	 * @param {string} sControlId control ID
	 * @returns {sap.ui.core.Control} control
	 * @private
	 */
	FormP13nHandler.prototype._getControlById = function(sControlId) {
		return sap.ui.getCore().byId(sControlId);
	};

	/**
	 * Returns an instance of the flex controller
	 *
	 * @private
	 * @returns {sap.ui.fl.FlexController} flex controller instance
	 */
	FormP13nHandler.prototype._getFlexController = function() {
		return FlexControllerFactory.createForControl(this._oSmartForm);
	};

	/**
	 * Load the view which is required for form personalization and add it to the content
	 *
	 * @private
	 * @returns {sap.ui.xmlview} view instance
	 */
	FormP13nHandler.prototype._createDialogContent = function() {
		var formView, oJSONData, sComponentName;

		if (!this._oSmartForm) {
			return undefined;
		}
		oJSONData = this._createModelFromSmartForm(this._oSmartForm);
		oJSONData.isMoveDownButtonEnabled = false;
		oJSONData.isMoveUpButtonEnabled = false;
		oJSONData.isMoveBottomButtonEnabled = false;
		oJSONData.isMoveTopButtonEnabled = false;

		this._oOriginalDataModelForDialog = JSON.parse(JSON.stringify(oJSONData)); // Clone data model and compare with modified data model later on,
		// to figure
		// out which changes have been performed

		this._oModel = new JSONModel();
		this._oModel.setData(oJSONData);

		formView = new sap.ui.comp.smartform.flexibility.DialogContent(this._oDialog.getId() + '-Content');
		// formView = new sap.ui.xmlview("sap.ui.comp.smartform.flexibility.DialogContent");
		formView.setModel(this._oModel);
		var oView = FlexUtils.getViewForControl(this._oSmartForm);
		formView.setViewId(oView.createId(""));
		
		// Initialise Field Selector for OData $metadata
		var aIgnoredFields = this._getIgnoredFields(this._oSmartForm);
		sComponentName = FlexUtils.getComponentClassName(this._oSmartForm);
		var mPropertyBag = {
		                    appDescriptor: FlexUtils.getAppDescriptor(this._oSmartForm),
		                    siteId: FlexUtils.getSiteId(this._oSmartForm)
		};
		
		formView.initialiseODataFieldSelector(this._oSmartForm.getModel(), this._oSmartForm.getEntityType(), sComponentName, aIgnoredFields, this._mBindingPathToFieldListElement, this._mIdToFieldListElement, mPropertyBag);

		return formView;
	};

	/**
	 * Read ignored fields from smart form and parse CSV into array
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm smart form instance
	 * @private
	 * @returns {Array} Returns a list of ignored fields or empty.
	 */
	FormP13nHandler.prototype._getIgnoredFields = function(oSmartForm) {
		if (oSmartForm) {
			var sCsvIgnoredFields = oSmartForm.getIgnoredFields();
			if (sCsvIgnoredFields) {
				var aIgnoredFields = sCsvIgnoredFields.split(",");
				return aIgnoredFields;
			}
		}
		return [];
	};

	/**
	 * Takes the smart forms before- and after the changes as arrays of JSON nodes and deduces the changes from their delta.
	 *
	 * @param {array} aJsonBefore - array of JSON nodes representing the smart forms before the changes.
	 * @param {array} aJsonAfter - array of JSON nodes representing the smart forms after the changes.
	 * @returns {array} list of change property bags (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @public
	 */
	FormP13nHandler.prototype._createChangeSpecificDataFromDialogModel = function(aJsonBefore, aJsonAfter) {

		/*
		 * node= { id:"abc", label:"zuzu", isVisible: true, type: "form", //form|group|field children: [node] }
		 */

		var aChanges = [], oChange;

		// map of Json nodes before the changes
		var oMapBefore = {};
		this._createNodeMap(aJsonBefore, oMapBefore);

		// map of Json nodes after the changes
		var oMapAfter = {};
		this._createNodeMap(aJsonAfter, oMapAfter);

		// determine label- and visibility changes
		var i, sId, oNodeBefore, oNodeAfter, bIsVisible;
		var aBefore = Object.keys(oMapBefore);
		for (i = 0; i < aBefore.length; i++) {
			sId = aBefore[i];
			if (oMapAfter[sId] && oMapAfter[sId].node) {
				oNodeBefore = oMapBefore[sId].node;
				oNodeAfter = oMapAfter[sId].node;
				// label change
				if (oNodeBefore.label && oNodeAfter.label && oNodeBefore.label !== oNodeAfter.label) {
					oChange = this._createLabelChange(sId, oNodeAfter.label, oNodeAfter.type);
					if (oChange && oChange.selector && oChange.selector.id) {
						aChanges.push(oChange);
					}
				}
				// visibility change
				if ((oNodeBefore.isVisible && !oNodeAfter.isVisible) || (!oNodeBefore.isVisible && oNodeAfter.isVisible)) {
					if (oNodeAfter.isVisible) {
						bIsVisible = true;
					} else {
						bIsVisible = false;
					}
					aChanges.push(this._createVisibilityChange(sId, bIsVisible));
				}
			}
		}

		// this map will hold the location of the children for node which has children
		// its purpose is to memorize all effects adding of fields/groups or moving of
		// fields between groups has on the locations of the children nodes
		// within method _check4AddChanges it is initialized on basis of oMapBefore
		// afterwards in method _check4AddChanges and _check4Inter/IntraMoveChanges
		// this map is updated for each add/move change
		var oParentChildIndex = {};

		// check for added fields/groups and add corresponding changes to the list
		// memorize effect of these changes on positions of children in oParentChildIndex
		for (i = 0; i < aJsonAfter.length; i++) {
			this._check4AddChanges(aJsonAfter[i], oMapBefore, aChanges, oParentChildIndex);
		}

		// check for moved groups/fields and add corresponding changes to the list
		// memorize effect of these changes on positions of children in oParentChildIndex
		for (i = 0; i < aJsonAfter.length; i++) {
			this._check4InterMoveChanges(aJsonAfter[i], oMapAfter, oMapBefore, aChanges, oParentChildIndex);
			this._check4IntraMoveChanges(aJsonAfter[i], oMapAfter, oMapBefore, aChanges, oParentChildIndex);
		}

		return aChanges;

	};

	/**
	 * Checks for added fields- and groups and adds corresponding changes to list
	 *
	 * @param {object} oParent - parent JSON node after the changes.
	 * @param {object} oMapBefore - map of JSON nodes before the changes.
	 * @param {array} aChanges - list of change property bags (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @param {object} oParentChildIndex - map which holds an index of the parents children - key is the parent id
	 * @private
	 */
	FormP13nHandler.prototype._check4AddChanges = function(oParent, oMapBefore, aChanges, oParentChildIndex) {

		if (oParent && oParent.id && oParent.children) {

			var i, iShift = 0, sId, sParentId, oChild;
			sParentId = oParent.id;

			// initialize map which holds an index of the parents children - key is the parent id
			// this map will be used to memorize the effect of add/move between parents changes on the positions of the children
			if (oMapBefore[sParentId] && oMapBefore[sParentId].node) {
				var oParentOld = oMapBefore[sParentId].node;
				if (!oParentChildIndex) {
					oParentChildIndex = {};
				}
				oParentChildIndex[sParentId] = {};
				oParentChildIndex[sParentId].index = {};
				for (i = 0; i < oParentOld.children.length; i++) {
					oChild = oParentOld.children[i];
					sId = oChild.id;
					// memorize child position as it was before all changes
					oParentChildIndex[sParentId].index[sId] = i;
				}
			}

			for (i = 0; i < oParent.children.length; i++) {
				oChild = oParent.children[i];
				if (oChild.id) {
					sId = oChild.id;
					// does the child node exist in the JSON before the changes ?
					// if not it is an added field/group
					if (!oMapBefore[sId]) {
						var oChange = this._createAddChange(sParentId, oChild, i);
						if (oChange && oChange.selector && oChange.selector.id) {
							aChanges.push(oChange);
							// each add change shifts the position of children located at higher index by one
							iShift++;
							// if the added field/group is invisible we have to create a hide change in addition
							if (!oChild.isVisible) {
								aChanges.push(this._createVisibilityChange(sId, false));
							}
						}
					} else if (iShift > 0 && oParentChildIndex[sParentId] && oParentChildIndex[sParentId].index[sId] !== undefined) {
						oParentChildIndex[sParentId].index[sId] = oParentChildIndex[sParentId].index[sId] + iShift;
					}
					// recursive call - child is new parent node
					this._check4AddChanges(oChild, oMapBefore, aChanges, oParentChildIndex);
				}
			}
		}

	};

	/**
	 * Checks for fields- and groups moved between parents and adds corresponding changes to list
	 *
	 * @param {object} oParent - parent JSON node after the changes.
	 * @param {object} oMapAfter - map of JSON nodes after the changes.
	 * @param {object} oMapBefore - map of JSON nodes before the changes.
	 * @param {array} aChanges - list of change property bags (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @param {object} oParentChildIndex - map which holds an index of the parents children - key is the parent id
	 * @private
	 */
	FormP13nHandler.prototype._check4InterMoveChanges = function(oParent, oMapAfter, oMapBefore, aChanges, oParentChildIndex) {

		if (oParent && oParent.id && oParent.children) {

			var i, sId, sParentId, sSourceParentId, aIndex = [], oIndex = {}, oChild, oChange = {};

			// id of parent node after the changes
			// in case of a move to a new parent this is the target parent Id
			sParentId = oParent.id;

			var iLength = oParent.children.length;

			// step 1 - search for moves between parents
			for (i = 0; i < iLength; i++) {
				oChild = oParent.children[i];
				if (oChild.id) {
					sId = oChild.id;
					// child existed before the changes - it is no added field
					if (oMapBefore[sId] && oMapBefore[sId].index !== undefined) {
						// check if the parent node of a field/group has changed
						// if yes this child has been moved between two parents
						if (!oMapBefore[sId].index[sParentId] && oMapBefore[sId].index[sParentId] !== 0) {
							// determine parent(s) before the move
							var j, aSourceParentId = [];
							aSourceParentId = Object.keys(oMapBefore[sId].index);
							for (j = 0; j < aSourceParentId.length; j++) {
								sSourceParentId = aSourceParentId[j];
								// memorize id of moved child and its new index - key is the id of the old parent
								// as the change will be created for the source parent of the move
								if (!oIndex[sSourceParentId]) {
									oIndex[sSourceParentId] = [];
								}
								oIndex[sSourceParentId].push({
									"id": sId,
									"index": oMapAfter[sId].index[sParentId]
								});
								// a move between two parents is handled by the change handler as removal of the child
								// from the source parent and insertion at the target parent
								// this means that for the effects of this operation on the positions of the children
								// at the source- and target parent no additional move changes are needed
								// to prevent that they are created we have to memorize the effect of this move on the
								// location of the children at the source- and target parent
								// like for the case of field adding we use map oParentChildIndex for this purpose
								// source parent of move - effect of child removal
								var sChildId, aChildIndex = [], iChildPosition, k;
								if (oParentChildIndex[sSourceParentId] && oParentChildIndex[sSourceParentId].index[sId] !== undefined) {
									// position of moved child at source parent before the move
									iChildPosition = oParentChildIndex[sSourceParentId].index[sId];
									delete oParentChildIndex[sSourceParentId].index[sId];
									aChildIndex = Object.keys(oParentChildIndex[sSourceParentId].index);
									for (k = 0; k < aChildIndex.length; k++) {
										sChildId = aChildIndex[k];
										// this child is located after the moved child
										// hence we have to lower its index by one to account for the removal
										if (oParentChildIndex[sSourceParentId].index[sChildId] > iChildPosition) {
											oParentChildIndex[sSourceParentId].index[sChildId]--;
										}
									}
								}
								// target parent - effect of child insertion
								if (oParentChildIndex[sParentId]) {
									// position of moved child at target parent after the move
									iChildPosition = oMapAfter[sId].index[sParentId];
									aChildIndex = Object.keys(oParentChildIndex[sParentId].index);
									for (k = 0; k < aChildIndex.length; k++) {
										sChildId = aChildIndex[k];
										// all children of target parent located at the same or higher index than the inserted child
										// have to have their index increased by one
										if (oParentChildIndex[sParentId].index[sChildId] >= iChildPosition) {
											oParentChildIndex[sParentId].index[sChildId]++;
										}
									}
									oParentChildIndex[sParentId].index[sId] = iChildPosition;
								}
							}
						}
					}
					// recursive call - child is new parent node
					this._check4InterMoveChanges(oChild, oMapAfter, oMapBefore, aChanges, oParentChildIndex);
				}
			}

			// step 2 - create moves with new parent control as target
			if (oIndex) {
				aIndex = Object.keys(oIndex);
				for (i = 0; i < aIndex.length; i++) {
					sSourceParentId = aIndex[i];
					oChange = this._createMoveChange(sSourceParentId, oParent.type, oIndex[sSourceParentId], oParent.id);
					if (oChange && oChange.selector && oChange.selector.id) {
						aChanges.push(oChange);
					}
				}
			}

		}

	};

	/**
	 * Checks for moved fields- and groups within the same parent and adds corresponding changes to list
	 *
	 * @param {object} oParent - parent JSON node after the changes.
	 * @param {object} oMapAfter - map of JSON nodes after the changes.
	 * @param {object} oMapBefore - map of JSON nodes before the changes.
	 * @param {array} aChanges - list of change property bags (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @param {object} oParentChildIndex - map which holds an index of the parents children - key is the parent id
	 * @private
	 */
	FormP13nHandler.prototype._check4IntraMoveChanges = function(oParent, oMapAfter, oMapBefore, aChanges, oParentChildIndex) {

		if (oParent && oParent.id && oParent.children) {

			var i, sId, sParentId, aIndex = [], oChild, oChange = {};

			// id of parent node after the changes
			// in case of a move to a new parent this is the target parent Id
			sParentId = oParent.id;

			var iLength = oParent.children.length;

			// step 1 - search for moves within the same parent
			for (i = 0; i < iLength; i++) {
				oChild = oParent.children[i];
				if (oChild.id) {
					sId = oChild.id;
					// child existed before the changes - not an added field
					if (oMapBefore[sId] && oMapBefore[sId].index !== undefined) {
						// check that the parent node of the child has not changed
						// if yes - check if child was moved within the same parent
						// get the index of the child node in the parent node children array after the changes and
						// compare it with its index before the changes
						// if there is a difference this child node was moved within the same parent
						if (oMapBefore[sId].index[sParentId] !== undefined && oMapBefore[sId].index[sParentId] !== i) {
							// child position has changed - but was this due to a move within this parent
							// or just the effect of an add/move to a new parent ?
							// in the latter case the change handlers will take care of the position handling
							// and no move change is needed
							// to find out check the position of the child after application of all add/move to new parent changes
							// which have been memorized in oParentChildIndex
							// only when the child position memorized in oParentChildIndex also differs from
							// its current position a move change has to be created
							if (oParentChildIndex[sParentId] && oParentChildIndex[sParentId].index[sId] !== undefined && oParentChildIndex[sParentId].index[sId] !== i) {
								// memorize id of moved field/group and new index
								aIndex.push({
									"id": sId,
									"index": oMapAfter[sId].index[sParentId]
								});
							}
						}
					}
					// recursive call - child is new parent node
					this._check4IntraMoveChanges(oChild, oMapAfter, oMapBefore, aChanges, oParentChildIndex);
				}
			}

			// step 2 - create changes for moves within the same parent control
			if (aIndex.length > 0) {
				// create move change for the parent node as child node(s) was/were moved
				// aIndex contains objects holding the id's of the moved child nodes and their new index
				oChange = this._createMoveChange(sParentId, oParent.type, aIndex, "");
				if (oChange && oChange.selector && oChange.selector.id) {
					aChanges.push(oChange);
				}
			}

		}

	};

	/**
	 * Creates a property bag for an add change
	 *
	 * @param {string} sId - id of parent.
	 * @param {object} oNode - JSON node of field/group to add.
	 * @param {number} iIndex - position at which field/group has to be added
	 * @returns{object} change property bag (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @private
	 */
	FormP13nHandler.prototype._createAddChange = function(sId, oNode, iIndex) {

		var oAddChange = {};

		oAddChange.selector = {};
		oAddChange.selector.id = sId;

		// index at which new control has to be inserted
		oAddChange.index = iIndex;

		// new Id of group/field
		oAddChange.newControlId = oNode.id; // oView.createId(jQuery.sap.uid());

		switch (oNode.type) {
			case "form":
				oAddChange = {};
				break;
			case "group":
				oAddChange.changeType = "addGroup";
				if (!oNode.label) {
					oAddChange.groupLabel = "";
				} else {
					oAddChange.groupLabel = oNode.label;
				}
				break;
			case "field":
				oAddChange.changeType = "addField";
				if (!oNode.label) {
					oAddChange.fieldLabel = "";
				} else {
					oAddChange.fieldLabel = oNode.label;
				}
				if (!oNode.fieldValue) {
					oAddChange.fieldValue = "";
				} else {
					oAddChange.fieldValue = oNode.fieldValue;
				}
				if (!oNode.valueProperty) {
					oAddChange.valueProperty = "";
				} else {
					oAddChange.valueProperty = oNode.valueProperty;
				}
				if (!oNode.jsType) {
					oAddChange.jsType = "";
				} else {
					oAddChange.jsType = oNode.jsType;
				}

				break;
			default:
				oAddChange = {};
				break;
		}

		return oAddChange;

	};

	/**
	 * Creates a property bag for a label change
	 *
	 * @param {string} sId - control id.
	 * @param {string} sLabel - new label.
	 * @param {string} sType - node type (form|group|field).
	 * @returns{object} change property bag (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @private
	 */
	FormP13nHandler.prototype._createLabelChange = function(sId, sLabel, sType) {

		var oLabelChange = {};

		oLabelChange.selector = {};
		oLabelChange.selector.id = sId;

		switch (sType) {
			case "form":
				oLabelChange = {};
				break;
			case "group":
				oLabelChange.changeType = "renameGroup";
				oLabelChange.groupLabel = sLabel;
				break;
			case "field":
				oLabelChange.changeType = "renameField";
				oLabelChange.fieldLabel = sLabel;
				break;
			default:
				oLabelChange = {};
				break;
		}

		return oLabelChange;

	};

	/**
	 * Creates a property bag for a move change
	 *
	 * @param {string} sId - id of parent of fields/groups.
	 * @param {string} sType - type of parent of fields/groups.
	 * @param {array} aIndex - array with index of fields/groups after move.
	 * @param {string} sTargetId - target id of new parent (optional)
	 * @returns{object} change property bag (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @private
	 */
	FormP13nHandler.prototype._createMoveChange = function(sId, sType, aIndex, sTargetId) {

		var oMoveChange = {};

		oMoveChange.selector = {};
		oMoveChange.selector.id = sId;

		switch (sType) {
			case "form":
				oMoveChange.changeType = "moveGroups";
				oMoveChange.moveGroups = aIndex;
				break;
			case "group":
				oMoveChange.changeType = "moveFields";
				oMoveChange.moveFields = aIndex;
				break;
			default:
				oMoveChange = {};
				break;
		}

		if (sTargetId) {
			oMoveChange.targetId = sTargetId;
		}

		return oMoveChange;

	};

	/**
	 * Creates a property bag for a visibility change
	 *
	 * @param {string} sId - control id.
	 * @param {boolean} bIsVisible - control visibility.
	 * @returns{object} change property bag (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @private
	 */
	FormP13nHandler.prototype._createVisibilityChange = function(sId, bIsVisible) {

		var oVisibilityChange = {};

		oVisibilityChange.selector = {};
		oVisibilityChange.selector.id = sId;

		if (bIsVisible === true) {
			oVisibilityChange.changeType = "unhideControl";
		} else {
			oVisibilityChange.changeType = "hideControl";
		}

		return oVisibilityChange;

	};

	/**
	 * Creates a map of JSON nodes - key is the node's id Each entry has attributes 'node' and 'index' 'node' stores the node instance 'index' stores
	 * a map which has the id of the parent node as key and the index of the node within the parent node's children array as value
	 *
	 * @param {array} aJsonNodes - array of JSON nodes representing the smart forms.
	 * @param {object} oNodeMap - map of nodes.
	 * @param {object} oParent - parent JSON node.
	 * @private
	 */
	FormP13nHandler.prototype._createNodeMap = function(aJsonNodes, oNodeMap, oParent) {

		/*
		 * node= { id:"abc", label:"zuzu", isVisible: true, type: "form", //form|group|field children: [node] }
		 */

		if (!oNodeMap) {
			throw new Error("Node map instance must be provided");
		}

		if (!aJsonNodes || !aJsonNodes.length) {
			return;
		}

		var oNode, sId;

		var i, iLength = aJsonNodes.length;
		for (i = 0; i < iLength; i++) {

			oNode = aJsonNodes[i];

			if (oNode && oNode.id) {

				sId = oNode.id;

				if (!oNodeMap[sId]) {
					oNodeMap[sId] = {};
					oNodeMap[sId].node = oNode;
				}

				if (oParent && oParent.id) {
					if (!oNodeMap[sId].index) {
						oNodeMap[sId].index = {};
					}
					oNodeMap[sId].index[oParent.id] = i;
				}

				if (oNode.children) {
					this._createNodeMap(oNode.children, oNodeMap, oNode);
				}

			}

		}

	};

	/**
	 * Open the dialog and it's content
	 *
	 * @public
	 */
	FormP13nHandler.prototype.show = function() {
		this._oDialog.open();
	};

	/**
	 * Create and show error message in dialog when merge failed
	 *
	 * @private
	 */
	FormP13nHandler.prototype._showMergeErrorMessageInDialog = function() {
		var oFlexBoxLayout = new FlexBox();
		oFlexBoxLayout.setDirection("Column");
		oFlexBoxLayout.setAlignItems("Start");

		var messageDescriptionText = new Text();
		messageDescriptionText.setText(this._textResources.getText("FORM_PERS_DIALOG_ERR_DESC"));
		messageDescriptionText.setLayoutData(new FlexItemData({
			order: 1,
			growFactor: 1
		}));

		var messageResolveText = new Text();
		messageResolveText.setText(this._textResources.getText("FORM_PERS_DIALOG_ERR_HINT"));
		messageResolveText.setLayoutData(new FlexItemData({
			order: 1,
			growFactor: 1
		}));

		oFlexBoxLayout.addItem(messageDescriptionText);
		oFlexBoxLayout.addItem(messageResolveText);

		this._oDialog.addContent(oFlexBoxLayout);
	};

	FormP13nHandler.prototype._closeDialog = function() {
		if (this._oDialog) {
			this._oDialog.close();
		}
		this._destroyDialog();
	};

	FormP13nHandler.prototype._destroyDialog = function() {
		if (this._oDialogContent) {
			this._oDialogContent.destroy();
			this._oDialogContent = null;
		}
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}
	};

	/**
	 * Extracts the form-, group- and group element controls of a smart form creates a map of control IDs and controls out of it.
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm The smart form which should be analyzed
	 * @returns {object} Returns an object of the control IDs and their form-, group- and group element controls of the current smart form
	 * @private
	 */
	FormP13nHandler.prototype._createSmartFormControlMap = function(oSmartForm) {
		var mControlMap = [];
		var sControlId;
		if (oSmartForm) {
			sControlId = oSmartForm.getId();
			mControlMap[sControlId] = oSmartForm;
			var aGroups = oSmartForm.getGroups();
			if (aGroups) {
				for (var i = 0; i < aGroups.length; i++) {
					var oGroup = aGroups[i];
					if (oGroup) {
						sControlId = oGroup.getId();
						mControlMap[sControlId] = oGroup;
						var aGroupElements = oGroup.getGroupElements();
						if (aGroupElements) {
							for (var j = 0; j < aGroupElements.length; j++) {
								var oGroupElement = aGroupElements[j];
								if (oGroupElement) {
									sControlId = oGroupElement.getId();
									mControlMap[sControlId] = oGroupElement;
								}
							}
						}
					}
				}
			}
		}
		return mControlMap;
	};

	/**
	 * Shows a discard all form changes success message.
	 *
	 * @private
	 */
	FormP13nHandler.prototype._showDiscardSuccessMessage = function() {
		return this._showMessage(MessageBox.Icon.SUCCESS, "FORM_PERS_DISCARD_SUCCESS_TITLE", "FORM_PERS_DISCARD_SUCCESS_MESSAGE");
	};

	/**
	 * Shows a transport success message saying that all form changes could be made transportable
	 *
	 * @private
	 */
	FormP13nHandler.prototype._showTransportSuccessMessage = function() {
		return this._showMessage(MessageBox.Icon.SUCCESS, "FORM_PERS_TRANSPORT_SUCCESS_TITLE", "FORM_PERS_TRANSPORT_SUCCESS_MESSAGE");
	};

	/**
	 * Shows a transport inapplicable message, in case all form changes were already made transportable
	 *
	 * @private
	 */
	FormP13nHandler.prototype._showTransportInapplicableMessage = function() {
		return this._showMessage(MessageBox.Icon.INFORMATION, "FORM_PERS_TRANSPORT_INAPPLICABLE_TITLE", "FORM_PERS_TRANSPORT_INAPPLICABLE_MESSAGE");
	};

	/**
	 * Shows a discard all form changes error message.
	 *
	 * @param {object} oError - error object.
	 * @private
	 */
	FormP13nHandler.prototype._showDiscardErrorMessage = function(oError) {
		return this._showMessage(MessageBox.Icon.ERROR, "FORM_PERS_DISCARD_ERROR_TITLE", "FORM_PERS_DISCARD_ERROR_MESSAGE", oError);
	};

	/**
	 * Shows a transport selection error message.
	 *
	 * @param {object} oError - error object.
	 * @returns {Promise} promise that resolves with no parameters when the error message box is closed.
	 * @private
	 */
	FormP13nHandler.prototype._showApplySaveChangesErrorMessage = function(oError) {
		return this._showMessage(MessageBox.Icon.ERROR, "FORM_PERS_APPLYSAVE_ERROR_TITLE", "FORM_PERS_APPLYSAVE_ERROR_MESSAGE", oError);
	};

	/**
	 * Shows a form changes message.
	 *
	 * @param {sap.m.MessageBox.Icon} oMessageType - message type.
	 * @param {string} sTitleKey - title key
	 * @param {string} sMessageKey - message key
	 * @param {object} [oError] - error object
	 * @returns {Promise} - promise
	 * @private
	 */
	FormP13nHandler.prototype._showMessage = function(oMessageType, sTitleKey, sMessageKey, oError) {
		return new Promise(function(resolve) {
			if (oError && (oError.sId === '' || oError.sId === 'cancel')) {
				// ignore: cancel button was pressed
				resolve();
			} else {
				var sMessage, aMessageArgs;
				if (oError) {
					aMessageArgs = [
						oError.message || oError
					];
					sMessage = this._textResources.getText(sMessageKey, aMessageArgs);
				}
				sMessage = this._textResources.getText(sMessageKey);
				var sTitle = this._textResources.getText(sTitleKey);
				MessageBox.show(sMessage, {
					icon: oMessageType,
					title: sTitle,
					onClose: resolve
				});
			}
		}.bind(this));
	};

	/**
	 * Returns only the changes that are relevant within the smart form.
	 *
	 * @param {array} aChanges - array of {sap.ui.fl.Change} instances
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm - smart form instance.
	 * @returns {array} - filtered array of {sap.ui.fl.Change} instances
	 * @private
	 */
	FormP13nHandler.prototype._filterChangesForSmartForm = function(aChanges, oSmartForm) {
		var aResultChanges = [];
		var mFormControls = this._createSmartFormControlMap(oSmartForm);
		for (var i = 0; i < aChanges.length; i++) {
			var oChange = aChanges[i];
			var sSelectorId = oChange.getSelector().id;
			if (mFormControls[sSelectorId]) {
				aResultChanges.push(oChange);
			}
		}
		return aResultChanges;
	};

	/**
	 * Sets the transports for all changes.
	 *
	 * @param {array} aChanges array of {sap.ui.fl.Change}
	 * @param {integer} iChangeIdx array index of the change
	 * @param {string} sTransport optional: transport to set at the change if bFromDialog is true
	 * @param {boolean} bFromDialog optional: true if the transport has been set from the transport dialog
	 * @returns {Promise} promise that resolves without parameters
	 * @private
	 */
	FormP13nHandler.prototype._setTransports = function(aChanges, iChangeIdx, sTransport, bFromDialog) {
		// do a synchronous loop over all changes to fetch transport information per change each after the other
		// this is needed because only one transport popup should be shown to the user and not one per change
		var that = this;
		if (iChangeIdx >= 0) {
			var oCurrentChange = aChanges[iChangeIdx];

			if (bFromDialog === true) {
				// if the request has been set by the transport dialog already,
				// do not bring up the transport dialog a second time, but use this transport instead
				// if the change is locked on another transport, this will be resolved in the backend when the delete request is send

				if (oCurrentChange.getDefinition().packageName !== "$TMP") {
					oCurrentChange.setRequest(sTransport);
				}
				iChangeIdx--;
				// set the transport for the next request
				return that._setTransports(aChanges, iChangeIdx, sTransport, bFromDialog);
			} else {
				// bring up the transport dialog to get the transport information for a change

				if (oCurrentChange.getDefinition().packageName !== "$TMP") {
					return that._openTransportSelection(oCurrentChange).then(function(oTransportInfo) {

						oCurrentChange.setRequest(oTransportInfo.transport);

						if (oTransportInfo.fromDialog === true) {
							sTransport = oTransportInfo.transport;
							bFromDialog = true;
						}

						iChangeIdx--;
						// set the transport for the next request
						return that._setTransports(aChanges, iChangeIdx, sTransport, bFromDialog);
					});
				} else {
					iChangeIdx--;
					// set the transport for the next request
					return that._setTransports(aChanges, iChangeIdx, sTransport, bFromDialog);
				}
			}
		} else {
			return Promise.resolve(); // last change has been processed, continue with discarding the changes
		}
	};

	/**
	 * Returns only the changes that are relevant within the smart form.
	 *
	 * @param {array} aChanges array {sap.ui.fl.Change} instances
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm smart form instance
	 * @returns {Promise} promise that resolves with no parameters
	 * @private
	 */
	FormP13nHandler.prototype._deleteChanges = function(aChanges, oSmartForm) {
		var that = this;
		var aSmartFormChanges = this._filterChangesForSmartForm(aChanges, oSmartForm);
		var oFlexController = that._getFlexController();

		var iChangeIdx = aSmartFormChanges.length - 1;
		return this._setTransports(aSmartFormChanges, iChangeIdx).then(function() {
			return oFlexController.discardChanges(aSmartFormChanges);
		}).then(function() {
			return that._showDiscardSuccessMessage();
		})["catch"](function(oError) {
			return that._showDiscardErrorMessage(oError);
		});
	};

	/**
	 * Show confirmation dialog about discarding all form changes.
	 *
	 * @private
	 */
	FormP13nHandler.prototype._confirmDiscardAllChanges = function() {
		var that = this;
		var mPropertyBag = {
		                    appDescriptor: FlexUtils.getAppDescriptor(that._oSmartForm),
		                    siteId: FlexUtils.getSiteId(that._oSmartForm)
		};
		
		var fConfirmDiscardAllChangesOk = function(sAction) {
		if (sAction === "OK") {
				var oFlexController = that._getFlexController();
				oFlexController.getComponentChanges(mPropertyBag).then(function(oChanges) {
					var aChanges = that._convertToChangeArray(oChanges);
					return that._deleteChanges(aChanges, that._oSmartForm);
				})["catch"](function(oError) {
					return that._showDiscardErrorMessage();
				}).then(function() {
					that._closeDialog();
				});
			}
		};
		var sMessage = this._textResources.getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = this._textResources.getText("FORM_PERS_RESET_TITLE");
		MessageBox.confirm(sMessage, {
			title: sTitle,
			onClose: fConfirmDiscardAllChangesOk
		});
	};

	/**
	 * Show transport dialog to transport all changes.
	 *
	 * @private
	 */
	FormP13nHandler.prototype._confirmTransportAllChanges = function() {

		var that = this;

		return Promise.resolve()
			.then(getCreateAndApplyChanges)['catch'](handleCreateAndApplyChangesErrors)
			.then(getAllLocalChanges)
			.then(checkIfChangesHaveToBeMadeTransportable)
			.then(openTransportSelection)
			.then(transportAllLocalChanges)['catch'](handleAllErrors)
			.then(closeDialog);

		/*------------------------------------------------------------------------------*/

		function getCreateAndApplyChanges() {
			var aChangeSpecificData = that._getChangeDataFromDialog();
			if (aChangeSpecificData.length > 0) {
				return that._createAndApplyChanges(aChangeSpecificData);
			}
		}

		function handleCreateAndApplyChangesErrors(oError) {
			FlexUtils.log.error("SmartForm changes could not be applied or saved: " + oError);
			return that._showApplySaveChangesErrorMessage(oError).then(function() {
				throw new Error('createAndApply failed');
			});
		}

		function getAllLocalChanges() {
			return that._getAllLocalChanges();
		}

		function checkIfChangesHaveToBeMadeTransportable(aAllLocalChanges) {
			return !!aAllLocalChanges.length;
		}

		function openTransportSelection(bShouldTransport) {
			if (bShouldTransport) {
				return that._openTransportSelection(null, true);
			} else {
				return that._showTransportInapplicableMessage();
			}
		}

		function transportAllLocalChanges(oTransportInfo) {
			if (oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {
				return that._transportAllLocalChanges(oTransportInfo);
			}
		}

		function handleAllErrors(oError) {
			if (oError.message === 'createAndApply failed') {
				return;
			}
			FlexUtils.log.error("transport error" + oError);
			return that._showTransportErrorMessage(oError);
		}

		function closeDialog() {
			that._closeDialog();
		}
	};

	/**
	 * Get data for changes done via the dialog
	 *
	 * @returns {array} Returns a list of changes done via the dialog.
	 */
	FormP13nHandler.prototype._getChangeDataFromDialog = function() {
		var oDataModelForDialog, aChangeSpecificData;
		oDataModelForDialog = this._oModel.getData();

		aChangeSpecificData = this._createChangeSpecificDataFromDialogModel([
			this._oOriginalDataModelForDialog
		], [
			oDataModelForDialog
		]);
		return aChangeSpecificData;
	};

	/**
	 * Get all local changes of the smart form
	 *
	 * @returns {Promise} Promise which returns an array of all local changes of the smart form
	 */
	FormP13nHandler.prototype._getAllLocalChanges = function() {
		var that = this;
		var mPropertyBag = {
		                    appDescriptor: FlexUtils.getAppDescriptor(that._oSmartForm),
		                    siteId: FlexUtils.getSiteId(that._oSmartForm)
		};		
		
		return that._getFlexController().getComponentChanges(mPropertyBag).then(function(oChanges) {
			var aAllChanges = that._convertToChangeArray(oChanges);
			return that._filterChangesForSmartForm(aAllChanges, that._oSmartForm);
		});
	};

	/**
	 * Prepare all changes and assign them to an existing transport
	 *
	 * @param {object} oTransportInfo Information about the selected transport
	 * @returns {Promise} Promise which resolves without parameters
	 */
	FormP13nHandler.prototype._transportAllLocalChanges = function(oTransportInfo) {
		var that = this;
		return that._getAllLocalChanges().then(function(aAllLocalChanges) {
			var aTransportData = that._convertToChangeTransportData(aAllLocalChanges);

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var oTransportParams = {};
			oTransportParams.transportId = oTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;
			return oTransports.makeChangesTransportable(oTransportParams).then(function() {
				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {
					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = '';
						oChange.setResponse(oDefinition);
					}
				});
			}).then(function() {
				return that._showTransportSuccessMessage();
			});
		});
	};

	/**
	 * Get list of changes which should be added to a transport
	 *
	 * @param {Array} aLocalChanges List of changes which data have to be extracted
	 * @returns {Array} Returns an array of object containing all required data to transport the existing local changes
	 */
	FormP13nHandler.prototype._convertToChangeTransportData = function(aLocalChanges) {
		var aTransportData = [];
		var len = aLocalChanges.length;
		for (var i = 0; i < len; i++) {
			var oCurrentChange = aLocalChanges[i];
			var oData = {};
			oData.namespace = oCurrentChange.getNamespace();
			oData.fileName = oCurrentChange.getId();
			oData.fileType = oCurrentChange.getDefinition().fileType;
			aTransportData.push(oData);
		}
		return aTransportData;
	};

	/**
	 * Convert map with changes to array with changes
	 *
	 * @param {Object} oChanges Map of changes
	 * @returns {Array} Returns an array of changes generated from an object of changes
	 */
	FormP13nHandler.prototype._convertToChangeArray = function(oChanges) {
		// convert change map to change array
		// workaround until getComponentChanges returns always an array
		var aChanges = oChanges;
		if (!jQuery.isArray(oChanges)) {
			aChanges = [];
			var aKeys = Object.keys(oChanges);
			for (var i = 0; i < aKeys.length; i++) {
				aChanges.push(oChanges[aKeys[i]]);
			}
		}
		return aChanges;
	};

	/**
	 * Extract the groups and fields of a smartform and convert it to the schema required by the personalization dialog
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm The smartform which should be analyzed
	 * @returns {Array} Returns an array containing the form(s), groups and fields metadata, which will be used as JSON model for the dialog
	 * @private
	 */
	FormP13nHandler.prototype._createModelFromSmartForm = function(oSmartForm) {
		var formDocument, groups, i, currentGroup, groupData, currentGroupItems, k, fieldListElement;

		var that = this;

		// Introduce member _mBindingPathToFieldListElement for mapping the absolute binding paths to the field list elements,
		// which is used for updating labels contained in the field selector during initialization of the field selector
		// (field list = left part of the smartForm personalization dialog; field selector = right part of the smartForm personalization dialog)
		this._mBindingPathToFieldListElement = {};

		// Introduce member _mIdToFieldListElement for mapping the field list element ids (= group element ids) to the field list elements,
		// which is used for identifying fields not bound to the odata service during initialization of the field selector
		this._mIdToFieldListElement = {};

		if (oSmartForm) {
			formDocument = this._getModelNodeForSmartForm(oSmartForm);
			groups = oSmartForm.getGroups();
			if (groups) {
				for (i = 0; i < groups.length; i++) {
					currentGroup = groups[i];
					if (!FlexUtils.checkControlId(currentGroup)) {
						continue;
					}
					groupData = this._getModelNodeForSmartGroup(currentGroup);
					formDocument.children.push(groupData);

					if (currentGroup) {
						currentGroupItems = currentGroup.getGroupElements();
						if (currentGroupItems) {
							for (k = 0; k < currentGroupItems.length; k++) {
								if (!FlexUtils.checkControlId(currentGroupItems[k])) {
									continue;
								}
								var oGroupElement = currentGroupItems[k];
								fieldListElement = this._getModelNodeForSmartGroupElement(oGroupElement);
								// label is available, if label is not null, not undefined, and not ""
								var isLabelAvailable = !!(fieldListElement.label);
								if (isLabelAvailable) {
									groupData.children.push(fieldListElement);
									/* eslint-disable no-loop-func */
									jQuery.each(fieldListElement.bindingPaths, function(nIndex, oBindingPath) {
										that._mBindingPathToFieldListElement[oBindingPath.path] = fieldListElement;
									});
									/* eslint-enable no-loop-func */
									this._mIdToFieldListElement[fieldListElement.id] = fieldListElement;
								}
							}
						}
					}
				}
			}

		}

		return formDocument;
	};

	/**
	 * Get the metadata from the SmartForm itself
	 *
	 * @param {sap.ui.comp.smartform.SmartForm} oSmartForm The smartform which should be analyzed
	 * @returns {Object} Object containing the metadata of the smartform
	 * @private
	 */
	FormP13nHandler.prototype._getModelNodeForSmartForm = function(oSmartForm) {
		var result = {};
		result.id = oSmartForm.getId();
		result.label = oSmartForm.getTitle();
		result.isVisible = oSmartForm.getVisible();
		result.type = "form";
		result.children = [];

		return result;
	};

	/**
	 * Get the metadata from the Group itself
	 *
	 * @param {sap.ui.comp.smartform.Group} oSmartGroup The group which should be analyzed
	 * @returns {Object} Object containing the metadata of the group
	 * @private
	 */
	FormP13nHandler.prototype._getModelNodeForSmartGroup = function(oSmartGroup) {
		var result = {};
		result.id = oSmartGroup.getId();
		result.label = oSmartGroup.getLabel();
		result.isVisible = oSmartGroup.getVisible();
		result.type = "group";
		result.children = [];

		return result;
	};

	/**
	 * Gets the binding information including child controls
	 *
	 * @param {sap.ui.core.Control} oControl
	 * @param {array} aBinding
	 * @private
	 */
	FormP13nHandler.prototype._determineRelevantBindingPathsOf = function(oControl, aBinding) {
		var that = this;

		if (!aBinding) {
			aBinding = [];
		}
		if ((!oControl) || (!oControl.getMetadata)) {
			return;
		}

		var oMetaData = oControl.getMetadata();
		if (oMetaData) {
			// get binding info
			var mProps = oMetaData.getAllProperties();
			jQuery.each(mProps, function(propName, propObj) {
				// relevant properties are properties which can be used to map entries from the field list to entries of the field selector
				// (field list = left part of the smartForm personalization dialog; field selector = right part of the smartForm personalization dialog)
				var bRelevantProperty = propName === 'text' || propName === 'value' ||  propName === 'selected' || propName === 'selectedKey';
				if (bRelevantProperty) {				
					var oBinding = oControl.getBinding(propName);
					if (oBinding) {
						var sBindingPath = oBinding.getPath();
						if (sBindingPath) {
							var sAbsoluteBindingPath = that._getAbsoluteBindingPath(oControl, sBindingPath);
							var fIsAbsoluteBindingPathAlreadyContained = function(element) {
								return (element.path === sAbsoluteBindingPath);
							};
							if (!aBinding.some(fIsAbsoluteBindingPathAlreadyContained)) {
								aBinding.push({
									path: sAbsoluteBindingPath
								});
							}
						}
					}
				}
			});

			// traverse down
			var mAggrs = oMetaData.getAllAggregations();
			jQuery.each(mAggrs, function(aggrName, aggrObj) {
				var vControls = oControl.getAggregation(aggrName);
				if (!jQuery.isArray(vControls)) {
					var aControls = [];
					aControls.push(vControls);
					vControls = aControls;
				}
				if (vControls) {
					for (var c = 0; c < vControls.length; c++) {
						that._determineRelevantBindingPathsOf(vControls[c], aBinding);
					}
				}
			});
		}

		return aBinding;
	};

	FormP13nHandler.prototype._getAbsoluteBindingPath = function(oControl, sBindingPath) {
		var sPrefix = '';
		var oModel = oControl.getModel();
		if (oModel) {
			var oMetaModel = oModel.getMetaModel();
			if (oMetaModel) {
				var oBindingContext = oControl.getBindingContext();
				if (oBindingContext) {
					var sBindingContextPath = oBindingContext.getPath(); // e.g. /Headers(AccountingDocument='100015012',CompanyCode='0001',FiscalYear='2015')
					if (sBindingContextPath) {
						var oMetaContext = oMetaModel.getMetaContext(sBindingContextPath);
						if (oMetaContext) {
							var sMetaContextPath = oMetaContext.sPath; // e.g. /dataServices/schema/0/entityType/0
							if (sMetaContextPath) {
								var sEntityName = oMetaModel.getObject(sMetaContextPath).name;
								if (sEntityName) {
									sPrefix = sPrefix + sEntityName + '/'; // e.g. Header/
								}
							}
						}
					}
				}
			}
		}
		return sPrefix + sBindingPath;
	};

	/**
	 * Builds a JSON object for a smart group element, which will be used for the JSON model for the dialog.
	 *
	 * @param {sap.ui.comp.smartform.GroupElement} oGroupElement The field which should be analyzed
	 * @returns {Object} Object containing the metadata of the field
	 * @private
	 */
	FormP13nHandler.prototype._getModelNodeForSmartGroupElement = function(oGroupElement) {
		var result = {};
		result.id = oGroupElement.getId();
		result.label = oGroupElement.getLabelText();
		result.isVisible = oGroupElement.getVisible();
		if (result.isVisible) {
			// if the group is visible check if a child is visible as well
			result.isVisible = oGroupElement.getVisibleBasedOnElements();
		}
		result.type = "field";

		result.bindingPaths = this._determineRelevantBindingPathsOf(oGroupElement);

		return result;
	};

	return FormP13nHandler;
}, true);
