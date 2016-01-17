/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");jQuery.sap.require("sap.apf.core.constants");jQuery.sap.declare("sap.apf.ui.representations.scatterPlotChart");
sap.apf.ui.representations.scatterPlotChart=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.SCATTERPLOT_CHART;this.bIsGroupTypeChart=true;this._createDefaultFeedItemId();};
sap.apf.ui.representations.scatterPlotChart.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);sap.apf.ui.representations.scatterPlotChart.prototype.constructor=sap.apf.ui.representations.scatterPlotChart;
sap.apf.ui.representations.scatterPlotChart.prototype._createDefaultFeedItemId=function(){this.parameter.measures.forEach(function(m,i){if(m.kind===undefined){m.axisfeedItemId=i===0?sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS:sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2;}});this.parameter.dimensions.forEach(function(d,i){if(d.kind===undefined){d.axisfeedItemId=i===0?sap.apf.core.constants.vizFrame.feedItemTypes.COLOR:sap.apf.core.constants.vizFrame.feedItemTypes.SHAPE;}});};
