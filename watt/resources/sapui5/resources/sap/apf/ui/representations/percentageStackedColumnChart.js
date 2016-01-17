/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");jQuery.sap.declare("sap.apf.ui.representations.percentageStackedColumnChart");
sap.apf.ui.representations.percentageStackedColumnChart=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.PERCENTAGE_STACKED_COLUMN_CHART;this._createDefaultFeedItemId();};
sap.apf.ui.representations.percentageStackedColumnChart.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);sap.apf.ui.representations.percentageStackedColumnChart.prototype.constructor=sap.apf.ui.representations.percentageStackedColumnChart;
sap.apf.ui.representations.percentageStackedColumnChart.prototype._createDefaultFeedItemId=function(){this.parameter.measures.forEach(function(m){if(m.kind===undefined){m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;}});this.parameter.dimensions.forEach(function(d,i){if(d.kind===undefined){d.axisfeedItemId=i===0?sap.apf.core.constants.vizFrame.feedItemTypes.CATEGORYAXIS:sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;}});};
sap.apf.ui.representations.percentageStackedColumnChart.prototype.setFormatString=function(){return;};
