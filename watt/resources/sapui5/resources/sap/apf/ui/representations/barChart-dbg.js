/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.barChart");
//jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
/**
 * @class barChart constructor.
 * @param oParametersdefines parameters required for chart such as Dimension/Measures,tooltip, axis information.
 * @returns chart object
 */
sap.apf.ui.representations.barChart = function(oApi, oParameters) {
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.BAR_CHART;
	this._createDefaultFeedItemId();
};
sap.apf.ui.representations.barChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
//Set the "constructor" property to refer to barChart
sap.apf.ui.representations.barChart.prototype.constructor = sap.apf.ui.representations.barChart;
/** 
 * @private
 * @method _createDefaultFeedItemId
 * @description reads the oParameters for chart and modifies it by including a default feedItem id 
 * in case the "kind" property is not defined in dimension/measures
 */
sap.apf.ui.representations.barChart.prototype._createDefaultFeedItemId = function() {
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
