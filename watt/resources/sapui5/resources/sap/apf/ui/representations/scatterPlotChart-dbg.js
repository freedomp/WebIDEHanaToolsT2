/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.declare("sap.apf.ui.representations.scatterPlotChart");
/** 
 * @class scatterPlotChart constructor.
* @param oParameters defines parameters required for chart such as Dimension/Measures, tooltip, axis information.
* @returns chart object 
 */
sap.apf.ui.representations.scatterPlotChart = function(oApi, oParameters) {
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.SCATTERPLOT_CHART;
	this.bIsGroupTypeChart = true;
	this._createDefaultFeedItemId();
};
sap.apf.ui.representations.scatterPlotChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
//Set the "constructor" property to refer to scatterPlotChart
sap.apf.ui.representations.scatterPlotChart.prototype.constructor = sap.apf.ui.representations.scatterPlotChart;
/** 
 * @method _createDefaultFeedItemId
* @description reads the oParameters for chart and modifies it by including a default feedItem id 
 * in case the "kind" property is not defined in dimension/measures
*/
sap.apf.ui.representations.scatterPlotChart.prototype._createDefaultFeedItemId = function() {
	this.parameter.measures.forEach(function(measure, index) {
		if (measure.kind === undefined) {//handle the scenario where the kind is not available
			measure.axisfeedItemId = index === 0 ? sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS : sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2;
		}
	});
	this.parameter.dimensions.forEach(function(dimension, index) {
		if (dimension.kind === undefined) {//handle the scenario where the kind is not available
			dimension.axisfeedItemId = index === 0 ? sap.apf.core.constants.vizFrame.feedItemTypes.COLOR : sap.apf.core.constants.vizFrame.feedItemTypes.SHAPE;
		}
	});
};
