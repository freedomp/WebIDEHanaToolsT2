/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/chart/utils/ChartUtils"
], function(
	Element,
	ChartUtils
) {
	"use strict";
	/**
	 * Constructor for a new ui5/data/Measure.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Definition of a single measure in a chart
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @name sap.chart.data.Measure
	 */
	var Measure = Element.extend("sap.chart.data.Measure", {
		metadata: {
			library : "sap.chart",
			properties: {
				/**
				 * Property in the "data" model holding the raw measure value.
				 */
				name: {type: "string"},
				/**
				 * Label for the Measure, either as a string literal or by a pointer using the binding syntax to some property containing the label.
				 */
				label: {type: "string"},
				// Need to discuss behavior for these 2 properties
				/**
				 * Unit for the measure, either as a string literal or by a pointer using the binding syntax to some property containing the unit.
				 * Cannot be used without valueFormat
				 */
				unitBinding: {type: "string"},
				/**
				 * A (core UI5) format pattern to be used by the formatter to format the measure value.
				 */
				valueFormat: {type: "string"},
				/**
				 * How values of measure will be rendered in the chart. Possible role values are "axis1", "axis2" and "axis3".
				 * The default is "axis1".
				 * They correspond to the well-known concepts of axis identifiers in the Cartesian coordinate system, e.g. a Y-axis in a bar/column/line chart, an X- and a Y-axis in a scatter chart, or two Y-axes in bar charts, and an optional third axis for the weight/size/intensity/temperature of a data point.
				 */
				role: {type: "string", defaultValue: "axis1"}
			}
		}
	});
	
	Measure.prototype.setLabel = ChartUtils.makeNotifyParentProperty("label");
	Measure.prototype.setRole = ChartUtils.makeNotifyParentProperty("role");
	Measure.prototype.setUnitBinding = ChartUtils.makeNotifyParentProperty("unitBinding");
	Measure.prototype.setValueFormat = ChartUtils.makeNotifyParentProperty("valueFormat");
	
	return Measure;
});
