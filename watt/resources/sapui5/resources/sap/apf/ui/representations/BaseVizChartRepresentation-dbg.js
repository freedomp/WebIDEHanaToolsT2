/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.BaseVizChartRepresentation");
jQuery.sap.require("sap.apf.ui.representations.BaseUI5ChartRepresentation");
jQuery.sap.require('sap.apf.ui.representations.utils.vizDatasetHelper');
(function() {
	'use strict';
	sap.apf.ui.representations.BaseVizChartRepresentation = function(oApi, oParameters) {
		sap.apf.ui.representations.BaseUI5ChartRepresentation.apply(this, [ oApi, oParameters ]);
	};
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype = Object.create(sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype);
	//Set the "constructor" property to refer to BaseUI5ChartRepresentation
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.constructor = sap.apf.ui.representations.BaseVizChartRepresentation;
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.destroy = function() {
		if (this.chart) {
			if (this.chart.getTitle && this.chart.getTitle()) {
				this.chart.destroyTitle();
			}
			if (this.chart.getXAxis && this.chart.getXAxis()) {
				this.chart.destroyXAxis();
			}
			if (this.chart.getYAxis && this.chart.getYAxis()) {
				this.chart.destroyYAxis();
			}
			if (this.chart.getLegend && this.chart.getLegend()) {
				this.chart.destroyLegend();
			}
			if (this.chart.getPlotArea && this.chart.getPlotArea()) {
				this.chart.destroyPlotArea();
			}
			this.chart.detachInitialized(this.fnDrawSelectionOnMainChart);
			this.fnDrawSelectionOnMainChart = null;
		}
		if (this.thumbnailChart) {
			if (this.thumbnailChart.getTitle && this.thumbnailChart.getTitle()) {
				this.thumbnailChart.destroyTitle();
			}
			if (this.thumbnailChart.getXAxis && this.thumbnailChart.getXAxis()) {
				this.thumbnailChart.destroyXAxis();
			}
			if (this.thumbnailChart.getYAxis && this.thumbnailChart.getYAxis()) {
				this.thumbnailChart.destroyYAxis();
			}
			if (this.thumbnailChart.getLegend && this.thumbnailChart.getLegend()) {
				this.thumbnailChart.destroyLegend();
			}
			if (this.thumbnailChart.getToolTip && this.thumbnailChart.getToolTip()) {
				this.thumbnailChart.destroyToolTip();
			}
			if (this.thumbnailChart.getInteraction && this.thumbnailChart.getInteraction()) {
				this.thumbnailChart.destroyInteraction();
			}
			if (this.thumbnailChart.getBackground && this.thumbnailChart.getBackground()) {
				this.thumbnailChart.destroyBackground();
			}
			if (this.thumbnailChart.getGeneral && this.thumbnailChart.getGeneral()) {
				this.thumbnailChart.destroyGeneral();
			}
			if (this.thumbnailChart.getPlotArea && this.thumbnailChart.getPlotArea()) {
				this.thumbnailChart.destroyPlotArea();
			}
			this.thumbnailChart.detachInitialized(this.fnDrawSelectionOnThumbnailChart);
			this.fnDrawSelectionOnThumbnailChart = null;
		}
		sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype.destroy.call(this);
	};
	/**
	 * @method getMeasures
	 * @return the measures for a chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getMeasures = function() {
		return this.measure;
	};
	/**
	 * @method getMainContent
	 * @param oStepTitle title of the main chart
	 * @param width width of the main chart
	 * @param height height of the main chart
	 * @description draws Main chart into the Chart area
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getMainContent = function(oStepTitle, width, height) {
		var self = this;
		var superClass = this;
		var chartHeight = height || 600;
		chartHeight = chartHeight + "px";
		var chartWidth = width || 1000;
		chartWidth = chartWidth + "px";
		this.title = oStepTitle;
		if (!this.chartType) { // for charts which are coming from application
			this.chartType = this.getChartTypeFromRepresentationType(this.type); // set the value for chart type for thumbnail and main chart
		}
		this.createDataset();
		if (!this.chart) {//If chart instance does not exist create a new instance
			this.chartParam = {
				width : chartWidth,
				height : chartHeight,
				title : {
					visible : true,
					text : this.title
				},
				xAxis : {
					title : {
						visible : true
					},
					label : {
						visible : this.showXaxisLabel
					}
				},
				yAxis : {
					title : {
						visible : true
					}
				},
				legend : {
					visible : this.legendBoolean,
					title : {
						visible : this.legendBoolean
					}
				},
				plotArea : {
					animation : {
						dataLoading : false,
						dataUpdating : false
					}
				},
				dataset : this.dataset
			};
			this.chart = new sap.viz.ui5[this.chartType](this.chartParam);
			this.validateSelectionModes();
			if (this.metadata) { //if metadata is available, do the formatting for measures
				var tooltipFormatString = [];
				this.measure.forEach(function(measure) {
					var sFormatString = superClass.getFormatStringForMeasure(measure); // get the format string for each measure
					tooltipFormatString.push([ sFormatString ]); // tooltip expects a two dimensional array for format string
					self.setFormatStringOnChart(sFormatString);
				});
				this.setFormatString("tooltip", tooltipFormatString); // apply the formatting for tooltip , with the array of format strings for multiple measures
				if (this.handleCustomFormattingOnChart) { //call the sub class formatting 
					this.handleCustomFormattingOnChart();
				}
			}
			/**
			 * @method attachInitialized
			 * @param event which is triggered on when the chart is initialized
			 * @description Draws the selection
			 */
			this.fnDrawSelectionOnMainChart = this.drawSelectionOnMainChart.bind(self);
			this.chart.attachInitialized(this.fnDrawSelectionOnMainChart);
			superClass.attachSelectionAndFormatValue.call(this, oStepTitle); // call the base class attachSelectionAndFormatValue
		} else {//If chart instance exists only update dataset and then set model
			if (width) {
				this.chart.setWidth(chartWidth);
			}
			if (height) {
				this.chart.setHeight(chartHeight);
			}
			this.chart.destroyDataset();
			this.chart.setDataset(this.dataset);
		}
		this.chart.setModel(this.oModel);
		return this.chart;
	};
	/**
	 * @method validateSelectionModes
	 * @description sets the different selection modes on the charts based on the required filter
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.validateSelectionModes = function() {
		var sel = new sap.viz.ui5.types.controller.Interaction_selectability();
		var inter = new sap.viz.ui5.types.controller.Interaction();
		inter.setSelectability(sel);
		this.chart.setInteraction(inter);
		if (this.parameter.requiredFilters === undefined || this.parameter.requiredFilters.length === 0) {
			sel.setMode("none");
		} else {
			sel.setMode("multiple");
			if (this.parameter.dimensions.length > 1) {
				if (this.parameter.requiredFilters[0] === this.parameter.dimensions[1].fieldName) {
					sel.setAxisLabelSelection(false);
				} else if (this.parameter.requiredFilters[0] === this.parameter.dimensions[0].fieldName) {
					sel.setLegendSelection(false);
				}
			}
		}
	};
	/**
	 *@method getThumbnailContent
	 *@description draws Thumbnail for the current chart type and returns to the calling object
	 *@returns thumbnail object for the chart type
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getThumbnailContent = function() {
		var self = this;
		var superClass = this;
		var height = sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.HEIGHT;
		var width = sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.WIDTH;
		if (!this.chartType) { // for charts which are coming from application
			this.chartType = this.getChartTypeFromRepresentationType(this.type); // set the value for chart type for thumbnail and main chart
		}
		this.createDataset();
		if (!this.thumbnailChart) {//If chart instance does not exist create a new instance
			this.thumbnailChartParam = {
				width : width,
				height : height,
				title : {
					visible : false
				},
				xAxis : {
					visible : false,
					title : {
						visible : false
					}
				},
				yAxis : {
					visible : false,
					title : {
						visible : false
					}
				},
				legend : {
					visible : false,
					title : {
						visible : false
					}
				},
				sizeLegend : {
					visible : false,
					title : {
						visible : false
					}
				},
				toolTip : {
					visible : false
				},
				interaction : {
					selectability : {
						axisLabelSelection : false,
						legendSelection : false,
						plotLassoSelection : false,
						plotStdSelection : false
					},
					enableHover : false
				},
				background : {
					visible : false
				},
				general : {
					layout : {
						padding : 0
					}
				},
				plotArea : {
					animation : {
						dataLoading : false,
						dataUpdating : false
					},
					markerSize : 4,
					marker : {
						visible : true,
						size : 4
					}
				},
				dataset : this.dataset
			};
			this.thumbnailChart = new sap.viz.ui5[this.chartType](this.thumbnailChartParam);
			this.fnDrawSelectionOnThumbnailChart = this.drawSelectionOnThumbnailChart.bind(self);
			this.thumbnailChart.attachInitialized(this.fnDrawSelectionOnThumbnailChart);
		} else {//If chart instance exists only update dataset and then set model
			this.thumbnailChart.destroyDataset();
			this.thumbnailChart.setDataset(this.dataset);
		}
		superClass.createThumbnailLayout.call(this);// call the base class createThumbnailLayout
		return this.thumbnailLayout;
	};
	/**
	 * @method setSelectionOnMainChart
	 * @param array of selected objects
	 * @description sets the Selection on main Chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setSelectionOnMainChart = function(aSelection) {
		this.chart.selection(aSelection);
	};
	/**
	 * @method setSelectionOnThumbnailChart
	 * @param array of selected objects
	 * @description sets the Selection on thumbnail Chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setSelectionOnThumbnailChart = function(aSelection) {
		this.aStoredSelection = aSelection;
		this.clearSelectionFromThumbnailChart();
		this.thumbnailChart.selection(aSelection);
	};
	/**
	 * @method clearSelectionFromMainChart
	 * @description clears all Selection from main Chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.clearSelectionFromMainChart = function() {
		this.chart.selection([], {
			clearSelection : true
		});
	};
	/**
	 * @method clearSelectionFromThumbnailChart
	 * @description clears all Selection from thumbnail Chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.clearSelectionFromThumbnailChart = function() {
		this.thumbnailChart.selection([], {
			clearSelection : true
		});
	};
	/**
	 * @method getSelectionFromChart
	 * @description gets the selected datapoints on the chart
	 * @return the array of selections from the chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getSelectionFromChart = function() {
		var aSelection = this.chart.selection();
		return aSelection;
	};
	/**
	 * @method setFormatStringOnChart
	 * @param sFormatString - format string
	 * @description sets the format string for axis label and tooltip
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setFormatStringOnChart = function(sFormatString) {
		var superClass = this;
		var bAllMeasuresSameUnit = superClass.getIsAllMeasureSameUnit();
		if (this.chart.getYAxis !== undefined && sFormatString !== "" && bAllMeasuresSameUnit) { // all measures has the unit with same semantics 
			this.setFormatString("yAxis", sFormatString);
		}
	};
	/**
	 * @method setFormatString
	 * @param formatString , the format string which has to be set for yAxis, xAxis or tooltip 
	 * @param sChartPropertyName , chart property on which property has to be applied (e.g. xAxis, yAxis, tooltip)
	 * @description sets the format string for axis label and tooltip
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.setFormatString = function(sChartPropertyName, sFormatString) {
		var oChartProperty;
		switch (sChartPropertyName) {
			case "xAxis":
				oChartProperty = this.chart.getYAxis().getLabel();
				break;
			case "yAxis":
				oChartProperty = this.chart.getXAxis().getLabel();
				break;
			case "tooltip":
				oChartProperty = this.chart.getToolTip();
				break;
			case "sizeLegend":
				oChartProperty = this.chart.getSizeLegend().getLabel();
				break;
			default:
				break;
		}
		oChartProperty.setFormatString(sFormatString);
	};
	/**
	 * @method getFormatString
	 * @param [measures] , the array of measures
	 * @description gets the format string information for all the measures
	 * @return oFormatStringInfo.labelFormatString- formatString for labels
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getFormatString = function(aMeasure) {
		var oFormatStringInfo = this.getFormatStringForMeasures(aMeasure);
		return oFormatStringInfo.labelFormatString;
	};
	/**
	 * @method getChartTypeFromRepresentationType
	 * @param sRepresentationType- APF representation type which is set in the charts
	 * @description maps the APF representationtypes to the viz chart types
	 * @return sVizChartType- viz chart type needed by the constructor of viz charts for a given APF representation type
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getChartTypeFromRepresentationType = function(sRepresentationType) {
		var aRepresentationTypes = sap.apf.ui.utils.CONSTANTS.representationTypes;
		var aVizChartTypes = sap.apf.ui.utils.CONSTANTS.vizChartTypes;
		var sVizChartType;
		switch (sRepresentationType) {
			case aRepresentationTypes.COLUMN_CHART:
				sVizChartType = aVizChartTypes.COLUMN;
				break;
			case aRepresentationTypes.LINE_CHART:
				sVizChartType = aVizChartTypes.LINE;
				break;
			case aRepresentationTypes.PIE_CHART:
				sVizChartType = aVizChartTypes.PIE;
				break;
			case aRepresentationTypes.STACKED_COLUMN_CHART:
				sVizChartType = aVizChartTypes.STACKED_COLUMN;
				break;
			case aRepresentationTypes.PERCENTAGE_STACKED_COLUMN_CHART:
				sVizChartType = aVizChartTypes.PERCENTAGE_STACKED_COLUMN;
				break;
			case aRepresentationTypes.SCATTERPLOT_CHART:
				sVizChartType = aVizChartTypes.SCATTERPLOT;
				break;
			case aRepresentationTypes.BUBBLE_CHART:
				sVizChartType = aVizChartTypes.BUBBLE;
				break;
			default:
				this.oMessageObject = this.oApi.createMessageObject({
					code : "6000",
					aParameters : [ sRepresentationType ]
				});
				this.oApi.putMessage(this.oMessageObject);
				break;
		}
		return sVizChartType;
	};
	/**
	 * @method getIsGroupTypeChart
	 * @return a boolean to indicate if the chart is of type "group", e.g. scatter,bubble
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getIsGroupTypeChart = function() {
		var bIsGroupTypeChart;
		if (this.axisType === sap.apf.ui.utils.CONSTANTS.axisTypes.AXIS) {
			bIsGroupTypeChart = false;
		} else {
			bIsGroupTypeChart = true;
		}
		return bIsGroupTypeChart;
	};
	/**
	 * @method getDataSetHelper
	 * @description a boolean to indicate if the chart is of type "group", e.g. scatter,bubble
	 * @return the data set helper for vic chart
	 */
	sap.apf.ui.representations.BaseVizChartRepresentation.prototype.getDataSetHelper = function() {
		var bIsGroupTypeChart = this.getIsGroupTypeChart();
		var oDataSetHelper = new sap.apf.ui.representations.utils.VizDatasetHelper(bIsGroupTypeChart);
		return oDataSetHelper;
	};
}());