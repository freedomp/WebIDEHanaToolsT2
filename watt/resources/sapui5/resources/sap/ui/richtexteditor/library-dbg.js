/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.richtexteditor.
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Core', 'sap/ui/core/library'],
	function(jQuery, Core, library1) {
	"use strict";

/**
	 * A rich text editor (RTE) control. Requires installation of an additional rich text editor library.
	 *
	 * @namespace
	 * @name sap.ui.richtexteditor
	 * @public
	 */
	
	
	// library dependencies
	
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.richtexteditor",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.richtexteditor.EditorType"
		],
		interfaces: [],
		controls: [
			"sap.ui.richtexteditor.RichTextEditor"
		],
		elements: [],
		version: "1.32.7"
	});
	
	/**
	 * Determines which editor component should be used for editing the text.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.richtexteditor.EditorType = {
	
		/**
		 * Uses TinyMCE version 3 as editor (default)
		 * @public
		 */
		TinyMCE : "TinyMCE",
	
		/**
		 * Uses TinyMCE version 4 as editor
		 * @public
		 */
		TinyMCE4 : "TinyMCE4"
	
	};
	
	return sap.ui.richtexteditor;

}, /* bExport= */ false);
