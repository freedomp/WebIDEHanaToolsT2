/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.BaseVizChartRepresentation");jQuery.sap.require("sap.apf.ui.representations.BaseUI5ChartRepresentation");jQuery.sap.require('sap.apf.ui.representations.utils.vizDatasetHelper');(function(){'use strict';sap.apf.ui.representations.BaseVizChartRepresentation=function(a,p){sap.apf.ui.representations.BaseUI5ChartRepresentation.apply(this,[a,p]);};sap.apf.ui.representations.BaseVizChartRepresentation.prototype=Object.create(sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype);sap.apf.ui.representations.BaseVizChartRepresentation.prototype.constructor=sap.apf.ui.representations.BaseVizChartRepresentation;sap.apf.ui.representations.BaseVizChartRepresentation.prototype.destroy=function(){if(this.chart){if(this.chart.getTitle&&this.chart.getTitle()){this.chart.destroyTitle();}if(this.chart.getXAxis&&this.chart.getXAxis()){this.chart.destroyXAxis();}if(this.chart.getYAxis&&this.chart.getYAxis()){this.chart.destroyYAxis();}if(this.chart.getLegend&&this.chart.getLegend()){this.chart.destroyLegend();}if(this.chart.getPlotArea&&this.chart.getPlotArea()){this.chart.destroyPlotArea();}this.chart.detachInitialized(this.fnDrawSelectionOnMainChart);this.fnDrawSelectionOnMainChart=null;}if(this.thumbnailChart){if(this.thumbnailChart.getTitle&&this.thumbnailChart.getTitle()){this.thumbnailChart.destroyTitle();}if(this.thumbnailChart.getXAxis&&this.thumbnailChart.getXAxis()){this.thumbnailChart.destroyXAxis();}if(this.thumbnailChart.getYAxis&&this.thumbnailChart.getYAxis()){this.thumbnailChart.destroyYAxis();}if(this.thumbnailChart.getLegend&&this.thumbnailChart.getLegend()){this.thumbnailChart.destroyLegend();}if(this.thumbnailChart.getToolTip&&this.thumbnailChart.getToolTip()){this.thumbnailChart.destroyToolTip();}if(this.thumbnailChart.getInteraction&&this.thumbnailChart.getInteraction()){this.thumbnailChart.destroyInteraction();}if(this.thumbnailChart.getBackground&&this.thumbnailChart.getBackground()){this.thumbnailChart.destroyBackground();}if(this.thumbnailChart.getGeneral&&this.thumbnailChart.getGeneral()){this.thumbnailChart.destroyGeneral();}if(this.thumbnailChart.getPlotArea&&this.thumbnailChart.getPlotArea()){this.thumbnailChart.destroyPlotArea();}this.thumbnailChart.detachInitialized(this.fnDrawSelectionOnThumbnailChart);this.fnDrawSelectionOnThumbnailChart=null;}sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype.destroy.call(this);};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getMeasures=function(){return this.measure;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getMainContent=function(s,w,h){var a=this;var b=this;var c=h||600;c=c+"px";var d=w||1000;d=d+"px";this.title=s;if(!this.chartType){this.chartType=this.getChartTypeFromRepresentationType(this.type);}this.createDataset();if(!this.chart){this.chartParam={width:d,height:c,title:{visible:true,text:this.title},xAxis:{title:{visible:true},label:{visible:this.showXaxisLabel}},yAxis:{title:{visible:true}},legend:{visible:this.legendBoolean,title:{visible:this.legendBoolean}},plotArea:{animation:{dataLoading:false,dataUpdating:false}},dataset:this.dataset};this.chart=new sap.viz.ui5[this.chartType](this.chartParam);this.validateSelectionModes();if(this.metadata){var t=[];this.measure.forEach(function(m){var f=b.getFormatStringForMeasure(m);t.push([f]);a.setFormatStringOnChart(f);});this.setFormatString("tooltip",t);if(this.handleCustomFormattingOnChart){this.handleCustomFormattingOnChart();}}this.fnDrawSelectionOnMainChart=this.drawSelectionOnMainChart.bind(a);this.chart.attachInitialized(this.fnDrawSelectionOnMainChart);b.attachSelectionAndFormatValue.call(this,s);}else{if(w){this.chart.setWidth(d);}if(h){this.chart.setHeight(c);}this.chart.destroyDataset();this.chart.setDataset(this.dataset);}this.chart.setModel(this.oModel);return this.chart;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.validateSelectionModes=function(){var s=new sap.viz.ui5.types.controller.Interaction_selectability();var i=new sap.viz.ui5.types.controller.Interaction();i.setSelectability(s);this.chart.setInteraction(i);if(this.parameter.requiredFilters===undefined||this.parameter.requiredFilters.length===0){s.setMode("none");}else{s.setMode("multiple");if(this.parameter.dimensions.length>1){if(this.parameter.requiredFilters[0]===this.parameter.dimensions[1].fieldName){s.setAxisLabelSelection(false);}else if(this.parameter.requiredFilters[0]===this.parameter.dimensions[0].fieldName){s.setLegendSelection(false);}}}};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getThumbnailContent=function(){var s=this;var a=this;var h=sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.HEIGHT;var w=sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.WIDTH;if(!this.chartType){this.chartType=this.getChartTypeFromRepresentationType(this.type);}this.createDataset();if(!this.thumbnailChart){this.thumbnailChartParam={width:w,height:h,title:{visible:false},xAxis:{visible:false,title:{visible:false}},yAxis:{visible:false,title:{visible:false}},legend:{visible:false,title:{visible:false}},sizeLegend:{visible:false,title:{visible:false}},toolTip:{visible:false},interaction:{selectability:{axisLabelSelection:false,legendSelection:false,plotLassoSelection:false,plotStdSelection:false},enableHover:false},background:{visible:false},general:{layout:{padding:0}},plotArea:{animation:{dataLoading:false,dataUpdating:false},markerSize:4,marker:{visible:true,size:4}},dataset:this.dataset};this.thumbnailChart=new sap.viz.ui5[this.chartType](this.thumbnailChartParam);this.fnDrawSelectionOnThumbnailChart=this.drawSelectionOnThumbnailChart.bind(s);this.thumbnailChart.attachInitialized(this.fnDrawSelectionOnThumbnailChart);}else{this.thumbnailChart.destroyDataset();this.thumbnailChart.setDataset(this.dataset);}a.createThumbnailLayout.call(this);return this.thumbnailLayout;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setSelectionOnMainChart=function(s){this.chart.selection(s);};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setSelectionOnThumbnailChart=function(s){this.aStoredSelection=s;this.clearSelectionFromThumbnailChart();this.thumbnailChart.selection(s);};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.clearSelectionFromMainChart=function(){this.chart.selection([],{clearSelection:true});};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.clearSelectionFromThumbnailChart=function(){this.thumbnailChart.selection([],{clearSelection:true});};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getSelectionFromChart=function(){var s=this.chart.selection();return s;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setFormatStringOnChart=function(f){var s=this;var a=s.getIsAllMeasureSameUnit();if(this.chart.getYAxis!==undefined&&f!==""&&a){this.setFormatString("yAxis",f);}};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setFormatString=function(c,f){var C;switch(c){case"xAxis":C=this.chart.getYAxis().getLabel();break;case"yAxis":C=this.chart.getXAxis().getLabel();break;case"tooltip":C=this.chart.getToolTip();break;case"sizeLegend":C=this.chart.getSizeLegend().getLabel();break;default:break;}C.setFormatString(f);};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getFormatString=function(m){var f=this.getFormatStringForMeasures(m);return f.labelFormatString;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getChartTypeFromRepresentationType=function(r){var R=sap.apf.ui.utils.CONSTANTS.representationTypes;var v=sap.apf.ui.utils.CONSTANTS.vizChartTypes;var V;switch(r){case R.COLUMN_CHART:V=v.COLUMN;break;case R.LINE_CHART:V=v.LINE;break;case R.PIE_CHART:V=v.PIE;break;case R.STACKED_COLUMN_CHART:V=v.STACKED_COLUMN;break;case R.PERCENTAGE_STACKED_COLUMN_CHART:V=v.PERCENTAGE_STACKED_COLUMN;break;case R.SCATTERPLOT_CHART:V=v.SCATTERPLOT;break;case R.BUBBLE_CHART:V=v.BUBBLE;break;default:this.oMessageObject=this.oApi.createMessageObject({code:"6000",aParameters:[r]});this.oApi.putMessage(this.oMessageObject);break;}return V;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getIsGroupTypeChart=function(){var i;if(this.axisType===sap.apf.ui.utils.CONSTANTS.axisTypes.AXIS){i=false;}else{i=true;}return i;};sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getDataSetHelper=function(){var i=this.getIsGroupTypeChart();var d=new sap.apf.ui.representations.utils.VizDatasetHelper(i);return d;};}());
