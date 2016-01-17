/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.bubbleChart");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
/**
 * @class columnChart constructor.
 * @param oParametersdefines parameters required for chart such as Dimension/Measures,tooltip, axis information.
 * @returns chart object
 */
sap.apf.ui.representations.bubbleChart = function(oApi, oParameters) {
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this, [ oApi, oParameters ]);
	this.type = sap.apf.ui.utils.CONSTANTS.representationTypes.BUBBLE_CHART;
	this.bIsGroupTypeChart = true;
	this._createDefaultFeedItemId();
};
sap.apf.ui.representations.bubbleChart.prototype = Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);
//Set the "constructor" property to refer to bubbleChart
sap.apf.ui.representations.bubbleChart.prototype.constructor = sap.apf.ui.representations.bubbleChart;
/** 
 * @private
 * @method createDefaultFeedItemId
 * @description reads the oParameters for chart and modifies it by including a default feedItem id 
 * in case the "kind" property is not defined in dimension/measures
 */
sap.apf.ui.representations.bubbleChart.prototype._createDefaultFeedItemId = function() {
	this.parameter.measures.forEach(function(measure, index) {
		if (measure.kind === undefined) {//handle the scenario where the kind is not available
			if(index < 2 ) {
				if(index === 0) {
					measure.axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;
				} else {
					measure.axisfeedItemId  = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2;
				}
			} else if (index === 2){
				measure.axisfeedItemId  = sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEWIDTH;
			} else {
				measure.axisfeedItemId  = sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEHEIGTH;
			}
		}
	});
	this.parameter.dimensions.forEach(function(dimension, index) {
		if (dimension.kind === undefined) {//handle the scenario where the kind is not available
			dimension.axisfeedItemId = index === 0 ? sap.apf.core.constants.vizFrame.feedItemTypes.COLOR : sap.apf.core.constants.vizFrame.feedItemTypes.SHAPE;
		}
	});
};