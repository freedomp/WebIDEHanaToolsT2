/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/fl/changeHandler/HideControl", "sap/ui/fl/changeHandler/UnhideControl"
], function(jQuery, HideControl, UnhideControl) {
	"use strict";

	/**
	 * Object containing standard changes like labelChange. Structure is like this: <code> { "labelChange":{"changeType":"labelChange", "changeHandler":sap.ui.fl.changeHandler.LabelChange}} </code>
	 * @constructor	 	  
	 * @alias sap.ui.fl.registry.SimpleChanges
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 *
	 */
	var SimpleChanges = {
		hideControl: {
			changeType: "hideControl",
			changeHandler: HideControl
		},
		unhideControl: {
			changeType: "unhideControl",
			changeHandler: UnhideControl
		}
	};

	return SimpleChanges;

}, true);
