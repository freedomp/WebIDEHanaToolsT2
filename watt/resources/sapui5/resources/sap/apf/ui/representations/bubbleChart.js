/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.bubbleChart");jQuery.sap.require("sap.apf.core.constants");jQuery.sap.require("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
sap.apf.ui.representations.bubbleChart=function(a,p){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[a,p]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.BUBBLE_CHART;this.bIsGroupTypeChart=true;this._createDefaultFeedItemId();};
sap.apf.ui.representations.bubbleChart.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);sap.apf.ui.representations.bubbleChart.prototype.constructor=sap.apf.ui.representations.bubbleChart;
sap.apf.ui.representations.bubbleChart.prototype._createDefaultFeedItemId=function(){this.parameter.measures.forEach(function(m,i){if(m.kind===undefined){if(i<2){if(i===0){m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;}else{m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2;}}else if(i===2){m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEWIDTH;}else{m.axisfeedItemId=sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEHEIGTH;}}});this.parameter.dimensions.forEach(function(d,i){if(d.kind===undefined){d.axisfeedItemId=i===0?sap.apf.core.constants.vizFrame.feedItemTypes.COLOR:sap.apf.core.constants.vizFrame.feedItemTypes.SHAPE;}});};
