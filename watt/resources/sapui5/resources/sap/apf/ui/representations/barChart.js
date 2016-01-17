/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.barChart");jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
sap.apf.ui.representations.barChart=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.BAR_CHART;this._createDefaultFeedItemId();};
sap.apf.ui.representations.barChart.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);sap.apf.ui.representations.barChart.prototype.constructor=sap.apf.ui.representations.barChart;
sap.apf.ui.representations.barChart.prototype._createDefaultFeedItemId=function(){this.parameter.measures.forEach(function(m){if(m.kind===undefined){m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;}});this.parameter.dimensions.forEach(function(d,i){if(d.kind===undefined){d.axisfeedItemId=i===0?sap.apf.core.constants.vizFrame.feedItemTypes.CATEGORYAXIS:sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;}});};
