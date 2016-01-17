(function () {
	"use strict";
	/*global jQuery, sap */

	jQuery.sap.declare("sap.ovp.cards.charts.generic.Component");
	jQuery.sap.require("sap.ovp.cards.generic.Component");
	jQuery.sap.require("sap.ovp.cards.charts.Utils");
	jQuery.sap.require("sap.ovp.cards.charts.AggregateNumber");
	sap.ovp.cards.generic.Component.extend("sap.ovp.cards.charts.generic.Component", {
		// use inline declaration instead of component.json to save 1 round trip
		metadata: {
			properties: {
				"headerExtensionFragment":{
					"type": "string",
					"defaultValue": "sap.ovp.cards.charts.AnalyticalHeader"
				}
			},

			version: "1.32.5",

			library: "sap.ovp",

			includes: [],

			dependencies: {
				libs: [ "sap.m" ],
				components: []
			},
			config: {}
		}
	});
})();
