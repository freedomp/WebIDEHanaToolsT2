/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.chart.
 */
sap.ui.define(['jquery.sap.global',
	'sap/ui/core/library', // library dependency
	'sap/viz/library'],
	function(jQuery) {
	"use strict";

	/**
	 * Chart controls based on Vizframe
	 *
	 * @namespace
	 * @name sap.chart
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.chart",
		dependencies : ["sap.ui.core", "sap.viz"],
		types: [

		],
		interfaces: [],
		controls: [
			"sap.chart.Chart"
		],
		elements: [
			"sap.chart.data.Dimension",
			"sap.chart.data.Measure"
		],
		version: "1.32.7"
	});

	return sap.chart;

});
