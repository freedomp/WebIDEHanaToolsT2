/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/ChangePersistence", "sap/ui/fl/Utils"
], function(jQuery, ChangePersistence, Utils) {
	"use strict";

	/**
	 * Factory to get or create a new instances of {sap.ui.fl.ChangePersistence}
	 * @constructor
	 * @alias sap.ui.fl.ChangePersistenceFactory
	 * @experimental Since 1.27.0
	 * @author SAP SE
	 * @version 1.32.7
	 */
	var ChangePersistenceFactory = {};

	ChangePersistenceFactory._instanceCache = {};

	/**
	 * Creates or returns an instance of the ChangePersistence
	 * @param {String} sComponentName The name of the component
	 * @returns {sap.ui.fl.ChangePersistence} instance
	 *
	 * @public
	 */
	ChangePersistenceFactory.getChangePersistenceForComponent = function(sComponentName) {
		var oChangePersistence;

		if (!ChangePersistenceFactory._instanceCache[sComponentName]) {
			oChangePersistence = new ChangePersistence(sComponentName);
			ChangePersistenceFactory._instanceCache[sComponentName] = oChangePersistence;
		}

		return ChangePersistenceFactory._instanceCache[sComponentName];
	};

	/**
	 * Creates or returns an instance of the ChangePersistence for the component of the specified control.
	 * The control needs to be embedded into a component.
	 * @param {sap.ui.core.Control} oControl The control for example a SmartField, SmartGroup or View
	 * @returns {sap.ui.fl.ChangePersistence} instance
	 *
	 * @public
	 */
	ChangePersistenceFactory.getChangePersistenceForControl = function(oControl) {
		var sComponentId;
		sComponentId = this._getComponentClassNameForControl(oControl);
		return ChangePersistenceFactory.getChangePersistenceForComponent(sComponentId);
	};

	/**
	 * Returns the name of the component of the control
	 * @param {sap.ui.core.Control} oControl Control
	 * @returns {String} The name of the component. Undefined if no component was found
	 *
	 * @private
	 */
	ChangePersistenceFactory._getComponentClassNameForControl = function(oControl) {
		return Utils.getComponentClassName(oControl);
	};

	return ChangePersistenceFactory;
}, true);
