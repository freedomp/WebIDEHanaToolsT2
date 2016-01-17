/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");jQuery.sap.require("sap.apf.core.constants");jQuery.sap.declare("sap.apf.ui.representations.pieChart");
sap.apf.ui.representations.pieChart=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.PIE_CHART;this._createDefaultFeedItemId();};
sap.apf.ui.representations.pieChart.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);sap.apf.ui.representations.pieChart.prototype.constructor=sap.apf.ui.representations.pieChart;
sap.apf.ui.representations.pieChart.prototype._createDefaultFeedItemId=function(){this.parameter.measures.forEach(function(m){if(m.kind===undefined){m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.SIZE;}});this.parameter.dimensions.forEach(function(d){if(d.kind===undefined){d.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;}});};
