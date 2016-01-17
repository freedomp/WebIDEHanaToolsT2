/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

/**
 * Initialization Code and shared classes of library sap.ovp (1.32.5)
 */
jQuery.sap.declare("sap.ovp.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * SAP library: sap.ovp
 *
 * @namespace
 * @name sap.ovp
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.layout.library");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.comp.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
	name : "sap.ovp",
	dependencies : ["sap.ui.core","sap.ui.layout","sap.m","sap.ui.comp"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	version: "1.32.5"
});

