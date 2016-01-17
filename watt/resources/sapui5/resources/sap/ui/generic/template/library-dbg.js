/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/**
 * Initialization Code and shared classes of library sap.ui.generic.template.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', 'sap/ui/comp/library'],
	function(jQuery, library1, library2) {
	"use strict";

	/**
	 * SAPUI5 library with ...
	 *
	 * @namespace
	 * @name sap.ui.generic.template
	 * @public
	 */
	
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.generic.template",
		version: "1.32.7",
		dependencies : ["sap.ui.core", "sap.ui.comp"],
		types: [],
		interfaces: [],
		controls: [],
		elements: []
	});
	
	return sap.ui.generic.template;

}, /* bExport= */ true);
