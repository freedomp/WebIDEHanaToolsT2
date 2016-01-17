/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
 
/**
* @namespace reserved for Smart Temaplates
* @name sap.suite.ui.generic.template
* @public
*/

/**
 * Initialization Code and shared classes of library sap.suite.ui.generic.template.
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/library'
], function(jQuery, library1) {
	"use strict";

	/**
	 * Library with generic Suite UI templates.
	 * 
	 * @namespace
	 * @name sap.suite.ui.generic.template
	 * @public
	 */

	// library dependencies
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name: "sap.suite.ui.generic.template",
		dependencies: [
			"sap.ui.core"
		],
		types: [
			"sap.suite.ui.generic.template.ListReport.nav.NavType", "sap.suite.ui.generic.template.ListReport.nav.ParamHandlingMode", "sap.suite.ui.generic.template.ListReport.nav.SuppressionBehavior", "sap.suite.ui.generic.template.ListReport.nav.Severity"
		],
		interfaces: [],
		controls: [],
		elements: [],
		version: "1.32.6"
	});

	sap.suite.ui.generic.template.ListReport.nav.NavType = {
		initial: "initial",
		URLParams: "URLParams",
		xAppState: "xAppState",
		iAppState: "iAppState",
		AppCtx: "AppCtx"
	};

	sap.suite.ui.generic.template.ListReport.nav.ParamHandlingMode = {
		SelVarWins: "SelVarWins",
		URLParamWins: "URLParamWins",
		InsertInSelOpt: "InsertInSelOpt"
	};

	sap.suite.ui.generic.template.ListReport.nav.SuppressionBehavior = {
		standard: 0,
		ignoreEmptyString: 1,
		raiseErrorOnNull: 2,
		raiseErrorOnUndefined: 4
	};

	sap.suite.ui.generic.template.ListReport.nav.Severity = {
		INFO: "INFO",
		WARNING: "WARNING",
		ERROR: "ERROR",
		SUCCESS: "SUCCESS"
	};

	return sap.suite.ui.generic.template;

}, /* bExport= */false);