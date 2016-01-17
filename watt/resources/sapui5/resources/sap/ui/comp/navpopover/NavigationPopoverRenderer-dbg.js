/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/m/PopoverRenderer'],
	function(jQuery, PopoverRenderer) {
	"use strict";


	/**
	 * @class NavigationPopover renderer. 
	 * @static
	 */
	var NavigationPopoverRenderer =  sap.ui.core.Renderer.extend(PopoverRenderer);

	return NavigationPopoverRenderer;

}, /* bExport= */ true);
