/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.ui.representations.BaseVizFrameChartRepresentation");
jQuery.sap.require("sap.apf.ui.representations.BaseUI5ChartRepresentation");
jQuery.sap.require('sap.apf.ui.representations.utils.vizFrameDatasetHelper');
jQuery.sap.require("sap.apf.ui.utils.constants");
(function() {
	'use strict';
	sap.apf.ui.representations.BaseVizFrameChartRepresentation = function(oApi, oParameters) {
		sap.apf.ui.representations.BaseUI5ChartRepresentation.apply(this, [ oApi, oParameters ]);
	};
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype = Object.create(sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype);
	//Set the "constructor" property to refer to BaseUI5ChartRepresentation
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.constructor = sap.apf.ui.representations.BaseVizFrameChartRepresentation;
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.destroy = function() {
		if (this.chart) {
			this.chart.destroyDataset();
			this.chart.destroyFeeds();
			this.chart.detachRenderComplete(this.fnDrawSelectionOnMainChart);
			this.fnDrawSelectionOnMainChart = null;
		}
		if (this.thumbnailChart) {
			this.thumbnailChart.destroyDataset();
			this.thumbnailChart.destroyFeeds();
			this.thumbnailChart.detachRenderComplete(this.fnDrawSelectionOnThumbnailChart);
			this.fnDrawSelectionOnThumbnailChart = null;
		}
		sap.apf.ui.representations.BaseUI5ChartRepresentation.prototype.destroy.call(this);
	};
	/**
	 * @method getMeasures
	 * @return the measures for a chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getMeasures = function() {
		return this.measure;
	};
	/**
	 * @method getMainContent
	 * @param oStepTitle title of the main chart
	 * @param width width of the main chart
	 * @param height height of the main chart
	 * @description draws Main chart into the Chart area
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getMainContent = function(oStepTitle, width, height) {
		var self = this;
		var superClass = this;
		var chartHeight = height || 600;
		chartHeight = chartHeight + "px";
		var chartWidth = width || 1000;
		chartWidth = chartWidth + "px";
		this.title = oStepTitle;
		//vizFrame chart type
		if (!this.chartType) { // for charts which are coming from application
			this.chartType = this.getChartTypeFromRepresentationType(this.type); // set the value for chart type for thumbnail and main chart
		}
		// vizFrame chart constructor
		this.createDataset();
		if (!this.chart) {//If chart instance does not exist create a new instance
			this.chart = new sap.viz.ui5.controls.VizFrame({
				vizType : this.chartType,
				dataset : this.dataset,
				width : chartWidth,
				height : chartHeight,
				uiConfig : {
					applicationSet : "fiori"
				}
			});
			this.chart.setVizProperties({
				title : {
					visible : true,
					text : this.title
				},
				categoryAxis : {
					title : {
						visible : true
					},
					label : {
						visible : true
					}
				},
				valueAxis : {
					title : {
						visible : true
					},
					label : {
						visible : true
					}
				},
				legend : {
					visible : this.legendBoolean,
					title : {
						visible : this.legendBoolean
					},
					isScrollable : true
				},
				sizeLegend : {
					visible : true
				},
				valueAxis2 : {
					visible : true,
					title : {
						visible : true
					},
					label : {
						visible : true
					}
				},
				plotArea : {
					animation : {
						dataLoading : false,
						dataUpdating : false
					},
					isFixedDataPointSize : false
				},
				tooltip : {
					visible : true,
					label : {
						visible : true
					}
				},
				interaction : {
					behaviorType : null
				}
			});
			this.validateSelectionModes();
			/**
			* @method attachRenderComplete
			* @param event which is triggered on when the chart is initialized
			* @description Draws the selection
			*/
			this.fnDrawSelectionOnMainChart = this.drawSelectionOnMainChart.bind(self);
			this.chart.attachRenderComplete(this.fnDrawSelectionOnMainChart);
			if (this.metadata) { //if metadata is available, do the formatting for measures
				var oMeasureWithFormatString = {};
				var sFormatStringForTooltip;
				this.measure.forEach(function(measure) {
					var sFormatString = superClass.getFormatStringForMeasure(measure); // get the format string for each measure
					sFormatStringForTooltip = sFormatString; //assign one format string for tooltip
					oMeasureWithFormatString.measure = measure;
					oMeasureWithFormatString.formatString = sFormatString; // associate the format string with each measure
					self.setFormatStringOnChart(oMeasureWithFormatString);
				});
				this.setFormatString("tooltip", sFormatStringForTooltip); //tooltip is not a feedItem Id, formatting has to be applied explicitly
				if (this.handleCustomFormattingOnChart) { //call the sub class formatting 
					this.handleCustomFormattingOnChart();
				}
			}
			superClass.attachSelectionAndFormatValue.call(this, oStepTitle); // call the base class attachSelectionAndFormatValue
		} else {//If chart instance exists only update dataset, feeds and model
			if (width) {
				this.chart.setWidth(chartWidth);
			}
			if (height) {
				this.chart.setHeight(chartHeight);
			}
			this.chart.destroyDataset();
			this.chart.removeAllFeeds();
			this.chart.destroyFeeds();
			this.chart.vizUpdate({
				'data' : this.dataset
			});
		}
		this._createAndAddFeedItemBasedOnId(this.chart);
		this.chart.setModel(this.oModel);
		return this.chart;
	};
	/**
	* @method setFormatStringOnChart
	* @param {oMeasureFormatString}- 
	*              oMeasureFormatString : {
	*              measure : measure1,
	*              formatString : formatString
	              }
	* @description reads the boolean to indicate if all the measures have same unit semantic
	* and based on the axisFeedItemId from measures applies the formatting to the xAxis,yAxis,tooltip or sizeLegend
	*/
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.setFormatStringOnChart = function(oMeasureFormatString) {
		var sFormatString = oMeasureFormatString.formatString;
		var sChartPropertyName = oMeasureFormatString.measure.axisfeedItemId;
		this.setFormatString(sChartPropertyName, sFormatString); //based on the feedItem Id , set the format string on the chart
	};
	/**
	 * @method setFormatString
	 * @param sChartPropertyName ,chart property on which property has to be applied (e.g. xAxis, yAxis, tooltip) 
	 * @param sFormatString , the format string which has to be set for yAxis, xAxis or tooltip 
	 * @description sets the format string for axis label and tooltip
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.setFormatString = function(sChartPropertyName, formatString) {
		var superClass = this;
		var bIsAllMeasureSameUnit = superClass.getIsAllMeasureSameUnit();
		switch (sChartPropertyName) {
			case sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS:
				if (bIsAllMeasureSameUnit) { //apply the formatting only when all the measures have same unit semantic
					this.chart.setVizProperties({
						valueAxis : {
							label : {
								formatString : formatString
							}
						}
					});
				}
				break;
			case sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2:
				if (bIsAllMeasureSameUnit) { //apply the formatting only when all the measures have same unit semantic
					this.chart.setVizProperties({
						valueAxis2 : {
							label : {
								formatString : formatString
							}
						}
					});
				}
				break;
			case sap.apf.core.constants.vizFrame.feedItemTypes.CATEGORYAXIS:
				this.chart.setVizProperties({
					categoryAxis : {
						label : {
							formatString : formatString
						}
					}
				});
				break;
			case sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEWIDTH:
				this.chart.setVizProperties({
					sizeLegend : {
						formatString : formatString
					}
				});
				break;
			case "tooltip":
				this.chart.setVizProperties({
					tooltip : {//takes one value unlike viz, in case of multiple measures which value should it be?
						formatString : formatString
					}
				});
				break;
			default:
				break;
		}
	};
	/**
	* @private
	* @function
	* @method _createAndAddFeedItemBasedOnId
	* @param {oChart}- instance of the chart
	* @description creates and adds the feedItem for dimensions/measures of a chart	
	*/
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype._createAndAddFeedItemBasedOnId = function(oChart) {
		var superClass = this;
		var oFlattendeDataSet = superClass.UI5ChartHelper.datasetObj;
		var sameFeedItemMeasureGroup = this._createFeedItemGroup(oFlattendeDataSet.measures); // create feedItem for all the measures
		this._addFeedItemsToChart(oChart, sameFeedItemMeasureGroup, "Measure"); // add measure feedItem to the chart	
		var sameFeedItemDimensionGroup = this._createFeedItemGroup(oFlattendeDataSet.dimensions); // create feedItem for all the dimensions
		this._addFeedItemsToChart(oChart, sameFeedItemDimensionGroup, "Dimension"); // add dimension feedItem to the chart
	};
	/**
	* @private
	* @function
	* @method _createFeedItemGroup
	* @param {aDataToBeGrouped}- dimensions/measures for a chart, which have to be grouped based on the feedItem id assigned
	* @description reads the feedItem id from each dimension/measure
	*         
	*          e.g. dimensions = [{
	*				name : dimension.name,
	*				value : '{' + dimension.value + '}',
	*				axisfeedItemId : "categoryAxis"
	*			}];
	*
	*and groups the dimensions/measures based on the axisfeedItemId , 
	*@return sameFeedItemGroup - associative array for all the feedItems available in the dimensions/measures
	*
	*          e.g. sameFeedItemGroup = {
	*                                valueAxis : [{measure1},{measure2}],
	*                                categoryAxis : {{dimension1},{dimension2}]
	*                               }	
	*/
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype._createFeedItemGroup = function(aDataToBeGrouped) {
		var sameFeedItemGroup = {};
		aDataToBeGrouped.forEach(function(data) { // group all the dimensions/measures based on the feedItem id
			var feedItemList = sameFeedItemGroup[data.axisfeedItemId];
			if (feedItemList) { //if the group name exist for one feedItem id, push the data in that group
				var bFieldAlreadyExists = feedItemList.some(function(oData) {
					return oData.name === data.name;
				});
				if (!bFieldAlreadyExists) {
					feedItemList.push(data);
				}
			} else { //else create a new group name for the feedItem id and push the data into it
				sameFeedItemGroup[data.axisfeedItemId] = [ data ];
			}
		});
		return sameFeedItemGroup;
	};
	/**
	* @private
	* @function
	* @name _addFeedItemsToChart
	* @param {oChart}- instance of the chart
	* @param {oGroupedData}- associative array which has all the dimensions and measures grouped based on the feedItem Id
	* 
	*     oGroupedData = {
	*                     valueAxis : [{measure1},{measure2}],
	*                     categoryAxis : {{dimension1},{dimension2}]
	*                    }
	*
	*@param sFeedItemType- type of the feedItem (dimension/measure)
	*
	*@description creates an object which has the id and the values required for a feedItem
	*           oFeedItem = {
	*                         feedItemId : "categoryAxis" or "valueAxis" etc
	*                         value : [value1,value2]
	*                       }
	* 
	*creates chart feedItem and adds it to the vizFrame charts
	*/
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype._addFeedItemsToChart = function(oChart, oGroupedData, sFeedItemType) {
		for( var key in oGroupedData) { //loop through all the groups
			var oFeedItem = {};
			var aFeedItemValue = [];
			var i = 0;
			for(i in oGroupedData[key]) { //loop through all the measures/dimensions of one group
				aFeedItemValue.push(oGroupedData[key][i].name); //push all the measure/dimension name which has same feedIem id to an array
				oFeedItem.feedItemId = oGroupedData[key][0].axisfeedItemId; //assign one id to each feedItem object (all the id will be same in one group) 
			}
			oFeedItem.value = aFeedItemValue; //assign the values to each feedItem object
			var chartFeedItem = new sap.viz.ui5.controls.common.feeds.FeedItem({
				uid : oFeedItem.feedItemId,
				type : sFeedItemType,
				values : oFeedItem.value
			});
			oChart.addFeed(chartFeedItem);
		}
	};
	/**
	 * @method validateSelectionModes
	 * @description sets the different selection modes on the charts based on the required filter
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.validateSelectionModes = function() {
		if (this.parameter.requiredFilters === undefined || this.parameter.requiredFilters.length === 0) {
			this.chart.setVizProperties({
				interaction : {
					selectability : {
						mode : 'none'
					},
					behaviorType : null
				}
			});
		} else {
			this.chart.setVizProperties({
				interaction : {
					selectability : {
						mode : 'multiple'
					},
					behaviorType : null
				}
			});
			if (this.parameter.dimensions.length > 1) {
				if (this.parameter.requiredFilters[0] === this.parameter.dimensions[1].fieldName) {
					this.chart.setVizProperties({
						interaction : {
							selectability : {
								axisLabelSelection : false
							}
						}
					});
				} else if (this.parameter.requiredFilters[0] === this.parameter.dimensions[0].fieldName) {
					this.chart.setVizProperties({
						interaction : {
							selectability : {
								legendSelection : false
							}
						}
					});
				}
			}
		}
	};
	/**
	 *@method getThumbnailContent
	 *@description draws Thumbnail for the current chart type and returns to the calling object
	 *@returns thumbnail object for the chart type
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getThumbnailContent = function() {
		var self = this;
		var superClass = this;
		var height = sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.HEIGHT;
		var width = sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.WIDTH;
		//vizFrame chart type
		if (!this.chartType) { // for charts which are coming from application
			this.chartType = this.getChartTypeFromRepresentationType(this.type); // set the value for chart type for thumbnail and main chart
		}
		this.createDataset();
		if (!this.thumbnailChart) {//If thumbnail chart instance does not exist create a new instance
			this.thumbnailChart = new sap.viz.ui5.controls.VizFrame({
				vizType : this.chartType,
				width : width,
				height : height,
				dataset : this.dataset
			});
			this.thumbnailChart.setVizProperties({
				title : {
					visible : false
				},
				categoryAxis : {
					visible : false,
					title : {
						visible : false
					}
				},
				valueAxis : {
					visible : false,
					title : {
						visible : false
					}
				},
				valueAxis2 : {
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
					visible : false
				},
				tooltip : {
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
					markerSize : 4,
					marker : {
						visible : true,
						size : 4
					},
					animation : {
						dataLoading : false,
						dataUpdating : false
					},
					gridline : {
						visible : false
					},
					dataLabel : {
						visible : false
					},
					lineStyle : {
						rules : [ {
							properties : {
								width : 1
							}
						} ]
					}
				}
			});
			this.fnDrawSelectionOnThumbnailChart = this.drawSelectionOnThumbnailChart.bind(self);
			this.thumbnailChart.attachRenderComplete(this.fnDrawSelectionOnThumbnailChart);
		} else {//If thumbnail chart instance exists only update dataset, feeds and model
			this.thumbnailChart.destroyDataset();
			this.thumbnailChart.removeAllFeeds();
			this.thumbnailChart.destroyFeeds();
			this.thumbnailChart.vizUpdate({
				'data' : this.dataset
			});
		}
		this._createAndAddFeedItemBasedOnId(this.thumbnailChart);
		superClass.createThumbnailLayout.call(this);// call the base class createThumbnailLayout
		return this.thumbnailLayout;
	};
	/**
	 * @method setSelectionOnMainChart
	 * @param array of selected objects
	 * @description sets the Selection on main Chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.setSelectionOnMainChart = function(aSelection) {
		this.chart.vizSelection(aSelection);
	};
	/**
	 * @method setSelectionOnThumbnailChart
	 * @param array of selected objects
	 * @description sets the Selection on thumbnail Chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.setSelectionOnThumbnailChart = function(aSelection) {
		this.aStoredSelection = aSelection;
		this.clearSelectionFromThumbnailChart();
		this.thumbnailChart.vizSelection(aSelection);
	};
	/**
	 * @method clearSelectionFromMainChart
	 * @description clears all Selection from main Chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.clearSelectionFromMainChart = function() {
		this.chart.vizSelection([], {
			clearSelection : true
		});
	};
	/**
	 * @method clearSelectionFromThumbnailChart
	 * @description clears all Selection from thumbnail Chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.clearSelectionFromThumbnailChart = function() {
		this.thumbnailChart.vizSelection([], {
			clearSelection : true
		});
	};
	/**
	 * @method getSelectionFromChart
	 * @description gets the selected datapoints on the chart
	 * @return the array of selections from the chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getSelectionFromChart = function() {
		var aSelection = this.chart.vizSelection();
		return aSelection;
	};
	/**
	 * @method getChartTypeFromRepresentationType
	 * @param sRepresentationType- APF representation type which is set in the charts
	 * @description maps the APF representationtypes to the vizFrame chart types
	 * @return sVizFrameChartType- vizFrame chart type needed by the constructor of vizFrame charts for a given APF representation type
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getChartTypeFromRepresentationType = function(sRepresentationType) {
		var aRepresentationTypes = sap.apf.ui.utils.CONSTANTS.representationTypes;
		var vizFrameChartTypes = sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes;
		var sVizFrameChartType;
		switch (sRepresentationType) {
			case aRepresentationTypes.COLUMN_CHART:
				sVizFrameChartType = vizFrameChartTypes.COLUMN;
				break;
			case aRepresentationTypes.LINE_CHART:
				sVizFrameChartType = vizFrameChartTypes.LINE;
				break;
			case aRepresentationTypes.PIE_CHART:
				sVizFrameChartType = vizFrameChartTypes.PIE;
				break;
			case aRepresentationTypes.STACKED_COLUMN_CHART:
				sVizFrameChartType = vizFrameChartTypes.STACKED_COLUMN;
				break;
			case aRepresentationTypes.PERCENTAGE_STACKED_COLUMN_CHART:
				sVizFrameChartType = vizFrameChartTypes.PERCENTAGE_STACKED_COLUMN;
				break;
			case aRepresentationTypes.SCATTERPLOT_CHART:
				sVizFrameChartType = vizFrameChartTypes.SCATTERPLOT;
				break;
			case aRepresentationTypes.BUBBLE_CHART:
				sVizFrameChartType = vizFrameChartTypes.BUBBLE;
				break;
			case aRepresentationTypes.BAR_CHART:
				sVizFrameChartType = vizFrameChartTypes.BAR;
				break;
			case aRepresentationTypes.STACKED_BAR_CHART:
				sVizFrameChartType = vizFrameChartTypes.STACKED_BAR;
				break;
			case aRepresentationTypes.PERCENTAGE_STACKED_BAR_CHART:
				sVizFrameChartType = vizFrameChartTypes.PERCENTAGE_STACKED_BAR;
				break;
			default:
				this.oMessageObject = this.oApi.createMessageObject({
					code : "6000",
					aParameters : [ sRepresentationType ]
				});
				this.oApi.putMessage(this.oMessageObject);
				break;
		}
		return sVizFrameChartType;
	};
	/**
	 * @method getIsGroupTypeChart
	 * @return a boolean to indicate if the chart is of type "group", e.g. scatter,bubble
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getIsGroupTypeChart = function() {
		return this.bIsGroupTypeChart ? this.bIsGroupTypeChart : false;
	};
	/**
	 * @method getDataSetHelper
	 * @description a boolean to indicate if the chart is of type "group", e.g. scatter,bubble
	 * @return the data set helper for vic chart
	 */
	sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype.getDataSetHelper = function() {
		var bIsGroupTypeChart = this.getIsGroupTypeChart();
		var oDataSetHelper = new sap.apf.ui.representations.utils.vizFrameDatasetHelper(bIsGroupTypeChart);
		return oDataSetHelper;
	};
}());