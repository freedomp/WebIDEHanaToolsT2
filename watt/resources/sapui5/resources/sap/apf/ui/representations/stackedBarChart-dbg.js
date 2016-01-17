/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.declare("sap.apf.ui.representations.stackedBarChart");
/** 
 * @class stackedBarChart constructor.
* @param oParameters defines parameters required for chart such as Dimension/Measures, tooltip, axis information.
* @returns chart object 
 */
sap.apf.ui.representations.stackedBarChart = function(oApi, oParameters) {
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.STACKED_BAR_CHART;
	this._createDefaultFeedItemId();
};
sap.apf.ui.representations.stackedBarChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
//Set the "constructor" property to refer to stackedColumnChart
sap.apf.ui.representations.stackedBarChart.prototype.constructor = sap.apf.ui.representations.stackedBarChart;
/** 
 * @private
* @method _createDefaultFeedItemId
* @description reads the oParameters for chart and modifies it by including a default feedItem id 
 * in case the "kind" property is not defined in dimension/measures
*/
sap.apf.ui.representations.stackedBarChart.prototype._createDefaultFeedItemId = function() {
	this.parameter.measures.forEach(function(measure) {
		if (measure.kind === undefined) {//handle the scenario where the kind is not available
			measure.axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;
		}
	});
	this.parameter.dimensions.forEach(function(dimension, index) {
		if (dimension.kind === undefined) {//handle the scenario where the kind is not available
			dimension.axisfeedItemId = index === 0 ? sap.apf.core.constants.vizFrame.feedItemTypes.CATEGORYAXIS : sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;
		}
	});
};