/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * @public
 * @name sap.ui.comp.transport.TransportSelection
 * @author SAP SE
 * @version 1.32.7
 * @since 1.26.0 
 * Helper object to select an ABAP transport for an LREP object. This is not a generic utility to select a transport request, but part
 *        of the SmartVariant control.
 * @param {jquery.sap.global} jQuery a reference to the jQuery implementation.
 * @param {sap.ui.fl.Utils} Utils a reference to the flexibility utilities implementation.
 * @param {sap.ui.fl.Transports} Transports a reference to the transport service implementation.
 * @param {sap.ui.comp.transport.TransportDialog} TransportDialog a reference to the transport dialog implementation.
 * @param {sap.ui.fl.registry.Settings} FlexSettings a reference to the settings implementation
 * @returns {sap.ui.comp.transport.TransportSelection} a new instance of <code>sap.ui.comp.transport.TransportSelection</code>.
 */
sap.ui.define([	"jquery.sap.global", "sap/ui/fl/Utils", "sap/ui/fl/Transports", "sap/ui/comp/transport/TransportDialog", "sap/ui/fl/registry/Settings" ], function(jQuery, Utils, Transports, TransportDialog, FlexSettings) {
	"use strict";
	/**
	 * @public
	 * @constructor
	 */
	var TransportSelection = function() {
		this.oTransports = new sap.ui.fl.Transports();
		this.oUtils = sap.ui.fl.Utils;
	};

	/**
	 * Selects a transport request for a given LREP object.
	 * First checks if the Adaptation Transport Organizer (ATO) is enabled
	 * If ATO is enabled and LREP object is in CUSTOMER layer the request 'ATO_NOTIFICATION' has to be used which in the backend triggers that the change is added to an ATO collection
	 * If ATO is not enabled or LREP object not in CUSTOMER layer:
	 * If the LREP object is already assigned to an open transport request or the LREP object is
	 * assigned to a local ABAP package, no dialog to select a transport is started. Instead the success callback is invoked directly. The transport
	 * dialog is shown if a package or a transport request has still to be selected, so if more than one transport request is available for the
	 * current user and the LREP object is not locked in an open transport request.
	 * 
	 * @param {object} oObjectInfo the LREP object, which has the attributes name, name space, type, layer and package.
	 * @param {function} fOkay call-back to be invoked when a transport request has successfully been selected.
	 * @param {function} fError call-back to be invoked when an error occurred during selection of a transport request.
	 * @param {boolean} bCompactMode flag indicating whether the transport dialog should be opened in compact mode.
	 * @param {object} oControl Control instance
	 * @public
	 */
	TransportSelection.prototype.selectTransport = function(oObjectInfo, fOkay, fError, bCompactMode, oControl) {
		var sComponentName, mPropertyBag;
		var that = this;

		if (oObjectInfo) {
			var sLayerType = Utils.getCurrentLayer(false);
			
			if (oControl) {
				sComponentName = Utils.getComponentClassName(oControl);
				var mPropertyBag = {
				                    appDescriptor: Utils.getAppDescriptor(oControl),
				                    siteId: Utils.getSiteId(oControl)
				};
			}
			// if component name and object layer are known and layer is CUSTOMER
			// check in settings if the adaptation transport organizer (ATO) is enabled
			if (sComponentName && sLayerType && sLayerType === 'CUSTOMER') {
				// retrieve the settings and check if ATO is enabled
				FlexSettings.getInstance(sComponentName, mPropertyBag).then(function(oSettings) {
					// ATO is enabled - signal that change is to be added to an ATO collection
					// instead of a transport
					if (oSettings.isAtoEnabled()) {
						var oTransport = { transportId: "ATO_NOTIFICATION" };
						fOkay(that._createEventObject(oObjectInfo, oTransport));
					// ATO is not enabled - use CTS 
					} else {
						that._selectTransport(oObjectInfo, fOkay, fError, bCompactMode);
					}
				});
			// do not have the required info to check for ATO or not CUSTOMER layer - use CTS
			} else {
				that._selectTransport(oObjectInfo, fOkay, fError, bCompactMode);
			}
		}
	};
	
	/**
	 * Selects a transport request for a given LREP object. If the LREP object is already assigned to an open transport request or the LREP object is
	 * assigned to a local ABAP package, no dialog to select a transport is started. Instead the success callback is invoked directly. The transport
	 * dialog is shown if a package or a transport request has still to be selected, so if more than one transport request is available for the
	 * current user and the LREP object is not locked in an open transport request.
	 * 
	 * @param {object} oObjectInfo the LREP object, which has the attributes name, name space, type, layer and package.
	 * @param {function} fOkay call-back to be invoked when a transport request has successfully been selected.
	 * @param {function} fError call-back to be invoked when an error occurred during selection of a transport request.
	 * @param {boolean} bCompactMode flag indicating whether the transport dialog should be opened in compact mode.
	 * @private
	 */
	TransportSelection.prototype._selectTransport = function(oObjectInfo, fOkay, fError, bCompactMode) {
		var oPromise, that = this;

		if (oObjectInfo) {
			oPromise = this.oTransports.getTransports(oObjectInfo);
			oPromise.then(function(oResult) {
				var oTransport;

				if (that._checkDialog(oResult)) {
					that._openDialog({
						hidePackage: !that.oUtils.doesSharedVariantRequirePackage(),
						pkg: oObjectInfo["package"],
						transports: oResult.transports,
						lrepObject: that._toLREPObject(oObjectInfo)
					}, fOkay, fError, bCompactMode);
				} else {
					oTransport = that._getTransport(oResult);
					fOkay(that._createEventObject(oObjectInfo, oTransport));
				}
			}, function(oResult) {
				fError(oResult);
			});
		}
	};

	/**
	 * Creates an event object similar to the UI5 event object.
	 * 
	 * @param {object} oObjectInfo identifies the LREP object.
	 * @param {object} oTransport the transport request that has been selected.
	 * @return {object} event object.
	 * @private
	 */
	TransportSelection.prototype._createEventObject = function(oObjectInfo, oTransport) {
		return {
			mParameters: {
				selectedTransport: oTransport.transportId,
				selectedPackage: oObjectInfo["package"],
				dialog: false
			},
			getParameters: function() {
				return this.mParameters;
			},
			getParameter: function(sName) {
				return this.mParameters[sName];
			}
		};
	};

	/**
	 * Creates an LREP object description for the transport dialog.
	 * 
	 * @param {object} oObjectInfo identifies the LREP object.
	 * @return {object} LREP object description for the transport dialog.
	 * @private
	 */
	TransportSelection.prototype._toLREPObject = function(oObjectInfo) {
		var oObject = {};

		if (oObjectInfo.namespace) {
			oObject.namespace = oObjectInfo.namespace;
		}

		if (oObjectInfo.name) {
			oObject.name = oObjectInfo.name;
		}

		if (oObjectInfo.type) {
			oObject.type = oObjectInfo.type;
		}

		return oObject;
	};

	/**
	 * Opens the dialog to select a transport request.
	 * 
	 * @param {object} oConfig configuration for the dialog, e.g. package and transports.
	 * @param {function} fOkay call-back to be invoked when a transport request has successfully been selected.
	 * @param {function} fError call-back to be invoked when an error occurred during selection of a transport request.
	 * @param {boolean} bCompactMode flag indicating whether the transport dialog should be opened in compact mode.
	 * @returns {sap.ui.comp.transport.TransportDialog} the dialog.
	 * @private
	 */
	TransportSelection.prototype._openDialog = function(oConfig, fOkay, fError, bCompactMode) {
		var oDialog = new TransportDialog(oConfig);
		oDialog.attachOk(fOkay);
		oDialog.attachCancel(fError);

		// toggle compact style.
		if (bCompactMode) {
			oDialog.addStyleClass("sapUiSizeCompact");
		} else {
			oDialog.removeStyleClass("sapUiSizeCompact");
		}

		oDialog.open();

		return oDialog;
	};

	/**
	 * Returns a transport to assign an LREP object to.
	 * 
	 * @param {object} oTransports the available transports.
	 * @returns {object} a transport to assign an LREP object to, can be <code>null</code>.
	 * @private
	 */
	TransportSelection.prototype._getTransport = function(oTransports) {
		var oTransport;

		if (!oTransports.localonly) {
			oTransport = this._hasLock(oTransports.transports);
		} else {
			oTransport = {
				transportId: ""
			};
		}

		return oTransport;
	};

	/**
	 * Returns whether the dialog to select a transport should be started.
	 * 
	 * @param {object} oTransports the available transports.
	 * @returns {boolean} <code>true</code>, if the LREP object is already locked in one of the transports, <code>false</code> otherwise.
	 * @private
	 */
	TransportSelection.prototype._checkDialog = function(oTransports) {
		if (oTransports) {
			if (oTransports.localonly || this._hasLock(oTransports.transports)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Returns whether the LREP object is already locked in one of the transports.
	 * 
	 * @param {array} aTransports the available transports.
	 * @returns {object} the transport, if the LREP object is already locked in one of the transports, <code>null</code> otherwise.
	 * @private
	 */
	TransportSelection.prototype._hasLock = function(aTransports) {
		var oTransport, len = aTransports.length;

		while (len--) {
			oTransport = aTransports[len];

			if (oTransport.locked) {
				return oTransport;
			}
		}

		return false;
	};

	return TransportSelection;
}, true);
