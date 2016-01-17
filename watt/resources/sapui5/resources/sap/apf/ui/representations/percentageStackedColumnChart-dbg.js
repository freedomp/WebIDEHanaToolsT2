/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
jQuery.sap.declare("sap.apf.ui.representations.percentageStackedColumnChart");
/**
 * @class stackColumn constructor.
 * @param oParameters defines parameters required for chart such as Dimension/Measures, tooltip, axis information.
 * @returns chart object 
 */
sap.apf.ui.representations.percentageStackedColumnChart = function(oApi, oParameters) {
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.PERCENTAGE_STACKED_COLUMN_CHART;
	this._createDefaultFeedItemId();
};
sap.apf.ui.representations.percentageStackedColumnChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
//Set the "constructor" property to refer to percentageStackedColumnChart
sap.apf.ui.representations.percentageStackedColumnChart.prototype.constructor = sap.apf.ui.representations.percentageStackedColumnChart;
/** 
 * @private
 * @method _createDefaultFeedItemId
 * @description reads the oParameters for chart and modifies it by including a default feedItem id 
 * in case the "kind" property is not defined in dimension/measures
 */
sap.apf.ui.representations.percentageStackedColumnChart.prototype._createDefaultFeedItemId = function() {
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
/**
 * @method handleCustomFormattingOnChart
 * @description sets the custom format string
 */
sap.apf.ui.representations.percentageStackedColumnChart.prototype.setFormatString = function() {
	//overriding the base class setFormatString, since percentage chart does not need the formatting for axis and tooltip
	return;
};