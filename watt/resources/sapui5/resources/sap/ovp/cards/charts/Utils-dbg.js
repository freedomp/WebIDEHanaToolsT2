/**
 * @fileOverview This file contains miscellaneous utility functions.
 */

(function () {
	"use strict";
	jQuery.sap.declare("sap.ovp.cards.charts.Utils");


	sap.ovp.cards.charts.Utils = sap.ovp.cards.charts.Utils || {};


	/* All constants feature here */
	sap.ovp.cards.charts.Utils.constants = {
			/* qualifiers for annotation terms */
			DPQUALIFIER_KEY: "dataPointAnnotationPath",
			CHART_QUALIFIER_KEY: "chartAnnotationPath",
			SELVAR_QUALIFIER_KEY: "selectionAnnotationPath",
			PREVAR_QUALIFIER_KEY: "presentationAnnotationPath",
			/* size of the collection to be rendered on chart */
			CHART_DATA_SIZE: "4",
			/* Donut's fragment name; to test if $top to be applied */
			DONUT_FRAGMENT: "sap.ovp.cards.charts.donut.DonutChart"
	};


	/* retrieve qualifier from iContext */
	sap.ovp.cards.charts.Utils.getQualifier = function (iContext, annoTerm) {
		/* see sap.ovp.cards.charts.Utils.constants for legal values of annoTerm */
		if (typeof annoTerm === "undefined" || annoTerm === null) {
			return "";
		}
		var settingsModel = iContext.getSetting('ovpCardProperties');
		if (!settingsModel) {
			return "";
		}
		var oSettings = settingsModel.oData;
		if (!oSettings) {
			return "";
		}
		var fullQualifier = oSettings && oSettings[annoTerm] ? oSettings[annoTerm] : "";
		return fullQualifier === "" ? "" : fullQualifier.split("#")[1];
	};



	/************************ FORMATTERS ************************/

	sap.ovp.cards.charts.Utils.wrapInBraces = function(whateverNeedsToBeInBraces) {
		return "{" + whateverNeedsToBeInBraces + "}";
	};

	sap.ovp.cards.charts.Utils.formDimensionPath = function(dimension) {
		var entityTypeObject = this.getModel('ovpCardProperties').getProperty("/entityType");
		var edmTypes = sap.ovp.cards.charts.Utils.getEdmTypeOfAll(entityTypeObject);
		var type = edmTypes[dimension];
		if (type == "Edm.DateTime") {
			return "{path:'" + dimension + "', formatter: 'sap.ovp.cards.charts.Utils.returnDateFormat'}";
		} else {
			return "{" + dimension + "}";
		}
	};

	sap.ovp.cards.charts.Utils.returnDateFormat = function(date) {
		jQuery.sap.require("sap.ui.core.format.DateFormat");
		var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MMM"});
		return oDateFormat.format(new Date(date));
	};

	/*
	 * Reads filters from annotation and prepares data binding path
	 */
	sap.ovp.cards.charts.Utils.formatItems = function(iContext, oEntitySet, oSelectionVariant, oPresentationVariant, oDimensions, oMeasures) {
		var ret = "";
		var dimensionsList = [];
		var measuresList = [];
		var sorterList = [];
		var bFilter = typeof oSelectionVariant !== "undefined";
		var bSorter = typeof oPresentationVariant !== "undefined";
		if (bSorter) {
			bSorter = typeof oPresentationVariant.SortOrder !== "undefined";
		}
		ret += "{path: '/" + oEntitySet.name + "'";

		if (bFilter) {
			var filters = [];
			var entityTypeObject = null;
			var edmTypes = null;
			if (iContext && iContext.getSetting('ovpCardProperties')) {
				entityTypeObject = iContext.getSetting('ovpCardProperties').getProperty("/entityType");
				edmTypes = sap.ovp.cards.charts.Utils.getEdmTypeOfAll(entityTypeObject);
			}
			if (oSelectionVariant && oSelectionVariant.SelectOptions) {
				jQuery.each(oSelectionVariant.SelectOptions, function() {
					var prop = this.PropertyName.PropertyPath;
					jQuery.each(this.Ranges, function() {
						if (this.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
							var filtervalue = this.Low.String;
							if (edmTypes &&
									(edmTypes[prop].substring(0, 7) === "Edm.Int" ||
											edmTypes[prop].substring(0, 11) === 'Edm.Decimal')) {
								filtervalue = Number(filtervalue);
							}
							var filter = {
									path : prop,
									operator : this.Option.EnumMember.split("/")[1],
									value1 : filtervalue
							};
							if (this.High) {
								filter.value2 = this.High.String;
							}
							filters.push(filter);
						}
					});
				});
			}
			ret += ", filters: " + JSON.stringify(filters);
		}

		if (bSorter) {
			var oSortAnnotationCollection = oPresentationVariant.SortOrder;
			var sSorterValue = "";
			var oSortOrder;
			var sSortOrder;
			var sSortBy;
			for (var i = 0; i < oSortAnnotationCollection.length; i++) {
				oSortOrder = oSortAnnotationCollection[i];
				sSortBy = oSortOrder.Property.PropertyPath;
				sorterList.push(sSortBy);
				if (typeof oSortOrder.Descending == "undefined") {
					sSortOrder = 'true';
				} else {
					sSortOrder = oSortOrder.Descending.Boolean.toLowerCase() == 'true' ? 'true' : 'false';
				}
				sSorterValue = sSorterValue + "{path: '" + sSortBy + "',descending: " + sSortOrder + "},";
			}
			/* trim the last ',' */
			ret += ", sorter: [" + sSorterValue.substring(0, sSorterValue.length - 1) + "]";
		}

		jQuery.each(oMeasures, function(i, m){
			measuresList.push(m.Measure.PropertyPath);
		});
		jQuery.each(oDimensions, function(i, d){
			dimensionsList.push(d.Dimension.PropertyPath);
		});
		ret += ", parameters: {select:'" + dimensionsList.join(",") + "," + measuresList.join(",");
		if (sorterList.length > 0) {
			ret += "," + sorterList.join(",");
		}
		ret += "'}";

		/* Applying length currently fails - cf. Viz bug 1570803591 */
		ret += ", length: " + sap.ovp.cards.charts.Utils.constants.CHART_DATA_SIZE + "}";

		return ret;
	};

	sap.ovp.cards.charts.Utils.formatItems.requiresIContext = true;


	/*
	 * Reads groupBy from annotation and prepares comma separated list
	 */
	sap.ovp.cards.charts.Utils.listGroupBy = function(oPresentationVariant) {
		var bPV = typeof oPresentationVariant !== "undefined";
		if (!bPV) {
			return "";
		}
		var entityTypeObject = this.getModel('ovpCardProperties').getProperty("/entityType");
		var allLabels = sap.ovp.cards.charts.Utils.getAllColumnLabels(entityTypeObject);
		var result = "";
		var groupByList;

		if (oPresentationVariant.GroupBy.constructor === Array) {
			groupByList = oPresentationVariant.GroupBy;
		} else {
			groupByList = oPresentationVariant.GroupBy.Collection;
		}

		jQuery.each(groupByList, function() {
			if (typeof allLabels[this.PropertyPath] == "undefined") {
				return;
			}
			result += allLabels[this.PropertyPath];
			result += ", ";
		});
		if (result[result.length - 1] === " " && result[result.length - 2] === ",") {
			result = result.substring(0, result.length - 2);
		}
		return result == "" ? "" :  "By " + result;
	};


	/*
	 * Returns comma separated list of filters
	 */
	sap.ovp.cards.charts.Utils.listFilters = function(iContext, oSelectionVariant) {
		var result = "";
		var bFilter = typeof oSelectionVariant !== "undefined";
		if (!bFilter) {
			return result;
		}
		if (oSelectionVariant && oSelectionVariant.SelectOptions) {
			jQuery.each(oSelectionVariant.SelectOptions, function() {
				jQuery.each(this.Ranges, function() {
					if (this.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
						result += this.Low.String;
						if (this.High) {
							result += "-" + this.High.String;
						}
						result += ", ";
					}
				});
			});
		}
		if (result[result.length - 1] === " " && result[result.length - 2] === ",") {
			result = result.substring(0, result.length - 2);
		}
		return result;
	};
	sap.ovp.cards.charts.Utils.listFilters.requiresIContext = true;


	/* Returns binding path for singleton */
	sap.ovp.cards.charts.Utils.getAggregateNumber = function(iContext, oEntitySet, measure, oSelectionVariant) {
		var entityTypeObject = iContext.getSetting('ovpCardProperties').getProperty("/entityType");
		var unitColumn = sap.ovp.cards.charts.Utils.getUnitColumn(measure, entityTypeObject);
		var bFilter = typeof oSelectionVariant !== "undefined";
		var filtersString = "";
		if (bFilter) {
			var filters = [];
			var edmTypes = null;
			if (iContext && iContext.getSetting('ovpCardProperties')) {
				edmTypes = sap.ovp.cards.charts.Utils.getEdmTypeOfAll(entityTypeObject);
			}
			if (oSelectionVariant && oSelectionVariant.SelectOptions) {
				jQuery.each(oSelectionVariant.SelectOptions, function() {
					var prop = this.PropertyName.PropertyPath;
					jQuery.each(this.Ranges, function() {
						if (this.Sign.EnumMember === "com.sap.vocabularies.UI.v1.SelectionRangeSignType/I") {
							var filtervalue = this.Low.String;
							if (edmTypes &&
									(edmTypes[prop].substring(0, 7) === "Edm.Int" ||
											edmTypes[prop].substring(0, 11) === 'Edm.Decimal')) {
								filtervalue = Number(filtervalue);
							}
							var filter = {
									path : prop,
									operator : this.Option.EnumMember.split("/")[1],
									value1 : filtervalue
							};
							if (this.High) {
								filter.value2 = this.High.String;
							}
							filters.push(filter);
						}
					});
				});
			}
			filtersString += ", filters: " + JSON.stringify(filters);
		}

		if (!unitColumn) {
			return "{path: '/" + oEntitySet.name + "'" + ", parameters:{select:'" + measure + "'}" + filtersString + "}";
		}
		return "{path: '/" + oEntitySet.name + "'" + ", parameters:{select:'" + measure + "," + unitColumn + "'}" + filtersString + "}";
	};
	sap.ovp.cards.charts.Utils.getAggregateNumber.requiresIContext = true;

	/* Returns the formatted aggregate value for Header */
	sap.ovp.cards.charts.Utils.getFormattedNumber = function(value, UOM) {
		var ovpModel = this.getModel("ovpCardProperties");
		if (!ovpModel) {
			return;
		}
		var fullQualifier = ovpModel.getProperty("/" + sap.ovp.cards.charts.Utils.constants.DPQUALIFIER_KEY);
		var entityTypeObject = ovpModel.getProperty("/entityType");
		var measure = entityTypeObject[fullQualifier].Value.Path;
		var isACurrency = sap.ovp.cards.charts.Utils.isACurrency(measure, entityTypeObject);
		if (isACurrency) {
			var currencyFormatter = sap.ui.core.format.NumberFormat.getCurrencyInstance({
				style: 'short',
				showMeasure: false
			});
			return currencyFormatter.format(Number(value), UOM);
		}

		var decimalPrecision = Number(entityTypeObject[fullQualifier].NumberFormat.NumberOfFractionalDigits.Int);
		var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance( 
				{
					style: 'short',
					minFractionDigits: decimalPrecision,
					maxFractionDigits: decimalPrecision
				}
		);
		return numberFormat.format(Number(value));

	};


	/* Formatter for semantic color for Header */
	sap.ovp.cards.charts.Utils.returnSemanticColorForAggregateNumber = function(aggregateValue) {
		aggregateValue = Number(aggregateValue);
		var ovpModel = this.getModel("ovpCardProperties");
		if (!ovpModel) {
			return;
		}
		var fullQualifier = ovpModel.getProperty("/" + sap.ovp.cards.charts.Utils.constants.DPQUALIFIER_KEY);
		var dataPoint = ovpModel.getProperty("/entityType")[fullQualifier];
		var improvementDirection = dataPoint.CriticalityCalculation.ImprovementDirection.EnumMember.split("/")[1];
		var DeviationRangeHighValue, ToleranceRangeHighValue, ToleranceRangeLowValue, DeviationRangeLowValue;

		if (improvementDirection == "Minimizing") {
			if (dataPoint.CriticalityCalculation.DeviationRangeHighValue && dataPoint.CriticalityCalculation.ToleranceRangeHighValue &&
					dataPoint.CriticalityCalculation.DeviationRangeHighValue.String && dataPoint.CriticalityCalculation.ToleranceRangeHighValue.String) {
				DeviationRangeHighValue = Number(dataPoint.CriticalityCalculation.DeviationRangeHighValue.String);
				ToleranceRangeHighValue = Number(dataPoint.CriticalityCalculation.ToleranceRangeHighValue.String);

				if (aggregateValue <= ToleranceRangeHighValue) {
					return "Good";
				} else if (aggregateValue > ToleranceRangeHighValue && aggregateValue <= DeviationRangeHighValue) {
					return "Critical";
				} else {
					return "Error";
				}
			} else {
				return "Neutral";
			}
		} else if (improvementDirection == "Maximizing") {
			if (dataPoint.CriticalityCalculation.ToleranceRangeLowValue && dataPoint.CriticalityCalculation.DeviationRangeLowValue &&
					dataPoint.CriticalityCalculation.ToleranceRangeLowValue.String && dataPoint.CriticalityCalculation.DeviationRangeLowValue.String) {
				ToleranceRangeLowValue = Number(dataPoint.CriticalityCalculation.ToleranceRangeLowValue.String);
				DeviationRangeLowValue = Number(dataPoint.CriticalityCalculation.DeviationRangeLowValue.String);

				if (aggregateValue >= ToleranceRangeLowValue) {
					return "Good";
				} else if (aggregateValue < ToleranceRangeLowValue && aggregateValue >= DeviationRangeLowValue) {
					return "Critical";
				} else {
					return "Error";
				}
			} else {
				return "Neutral";
			}
		} else {
			if (dataPoint.CriticalityCalculation.DeviationRangeHighValue && dataPoint.CriticalityCalculation.ToleranceRangeHighValue &&
					dataPoint.CriticalityCalculation.ToleranceRangeLowValue && dataPoint.CriticalityCalculation.DeviationRangeLowValue &&
					dataPoint.CriticalityCalculation.DeviationRangeHighValue.String && dataPoint.CriticalityCalculation.ToleranceRangeHighValue.String &&
					dataPoint.CriticalityCalculation.ToleranceRangeLowValue.String && dataPoint.CriticalityCalculation.DeviationRangeLowValue.String) {
				DeviationRangeHighValue = Number(dataPoint.CriticalityCalculation.DeviationRangeHighValue.String);
				ToleranceRangeHighValue = Number(dataPoint.CriticalityCalculation.ToleranceRangeHighValue.String);
				ToleranceRangeLowValue = Number(dataPoint.CriticalityCalculation.ToleranceRangeLowValue.String);
				DeviationRangeLowValue = Number(dataPoint.CriticalityCalculation.DeviationRangeLowValue.String);

				if ((aggregateValue <= ToleranceRangeHighValue) && (aggregateValue >= ToleranceRangeLowValue)) {
					return "Good";
				} else if ((aggregateValue > ToleranceRangeHighValue && aggregateValue <= DeviationRangeHighValue) || (aggregateValue < ToleranceRangeLowValue && aggregateValue >= DeviationRangeLowValue)) {
					return "Critical";
				} else {
					return "Error";
				}
			}
		}
	};


	/* Formatter for Trend Direction for Header */
	sap.ovp.cards.charts.Utils.returnTrendDirection = function(aggregateValue) {
		aggregateValue = Number(aggregateValue);
		var ovpModel = this.getModel("ovpCardProperties");
		if (!ovpModel) {
			return;
		}
		var fullQualifier = ovpModel.getProperty("/" + sap.ovp.cards.charts.Utils.constants.DPQUALIFIER_KEY);
		var dataPoint = ovpModel.getProperty("/entityType")[fullQualifier];
		var referenceValue, upDifference, downDifference;
		if (!dataPoint.TrendCalculation) {
			return;
		}

		if (dataPoint.TrendCalculation.ReferenceValue) {
			referenceValue = Number(dataPoint.TrendCalculation.ReferenceValue.String);
		}
		if (dataPoint.TrendCalculation.UpDifference) {
			upDifference = Number(dataPoint.TrendCalculation.UpDifference.Int);
		}
		if (dataPoint.TrendCalculation.DownDifference) {
			downDifference = Number(dataPoint.TrendCalculation.DownDifference.Int);
		}

		if (referenceValue && upDifference && (aggregateValue - referenceValue >= upDifference)) {
			return "Up";
		}
		if (referenceValue && downDifference && (aggregateValue - referenceValue <= downDifference)) {
			return "Down";
		}
	};


	/* Formatter for % change for Header */
	sap.ovp.cards.charts.Utils.returnPercentageChange = function(aggregateValue) {
		aggregateValue = Number(aggregateValue);
		var ovpModel = this.getModel("ovpCardProperties");
		if (!ovpModel) {
			return;
		}
		var fullQualifier = ovpModel.getProperty("/" + sap.ovp.cards.charts.Utils.constants.DPQUALIFIER_KEY);
		var dataPoint = ovpModel.getProperty("/entityType")[fullQualifier];
		var referenceValue;
		if (!dataPoint.TrendCalculation) {
			return;
		}
		if (dataPoint.TrendCalculation.ReferenceValue) {
			referenceValue = Number(dataPoint.TrendCalculation.ReferenceValue.String);
			var percentNumber = ((Number(aggregateValue) - referenceValue) / referenceValue);
			var percentFormatter = sap.ui.core.format.NumberFormat.getPercentInstance({
				style: 'short',
				minFractionDigits: 2,
				maxFractionDigits: 2
			});
			if (percentNumber > 0){
				return "+" + percentFormatter.format(percentNumber);
			}
			return percentFormatter.format(percentNumber);
		}
	};


	/* Creates binding path for NumericContent value */
	sap.ovp.cards.charts.Utils.formThePathForAggregateNumber = function(dataPoint) {
		var measure = dataPoint.Value.Path;
		var entityTypeObject = this.getModel('ovpCardProperties').getProperty("/entityType");
		var unitColumn = sap.ovp.cards.charts.Utils.getUnitColumn(measure, entityTypeObject);
		return "{parts: [{path:'" + measure + "'}, {path: '" + unitColumn + "'}], formatter: 'sap.ovp.cards.charts.Utils.getFormattedNumber'}";
	};


	/* Creates binding path for UOM placeholder */
	sap.ovp.cards.charts.Utils.formThePathForUOM = function(dataPoint) {
		var measure = dataPoint.Value.Path;
		var entityTypeObject = this.getModel('ovpCardProperties').getProperty("/entityType");
		var unitColumn = sap.ovp.cards.charts.Utils.getUnitColumn(measure, entityTypeObject);
		if (!unitColumn) {
			return "";
		}
		return "{" + unitColumn + "}";
	};


	/* Creates binding path for semantic color */
	sap.ovp.cards.charts.Utils.formThePathForAggregateNumberColor = function(dataPoint) {
		return "{parts: [{path:'" + dataPoint.Value.Path + "'}], formatter: 'sap.ovp.cards.charts.Utils.returnSemanticColorForAggregateNumber'}";
	};


	/* Creates binding path for trend icon */
	sap.ovp.cards.charts.Utils.formThePathForTrendIcon = function(dataPoint) {
		return "{parts: [{path:'" + dataPoint.Value.Path + "'}], formatter: 'sap.ovp.cards.charts.Utils.returnTrendDirection'}";
	};


	/* Creates binding path for % change */
	sap.ovp.cards.charts.Utils.formPathForPercentageChange = function(dataPoint) {
		return "{parts: [{path:'" + dataPoint.Value.Path + "'}], formatter: 'sap.ovp.cards.charts.Utils.returnPercentageChange'}";
	};




	/************************ METADATA PARSERS ************************/

	/* Checks if given measure is of type currency */
	sap.ovp.cards.charts.Utils.isACurrency = function(measure, entityTypeObject) {
		var properties = entityTypeObject.property;
		for (var i = 0, len = properties.length; i < len; i++) {
			if (properties[i].name == measure) {
				if (properties[i].hasOwnProperty("Org.OData.Measures.V1.ISOCurrency")) {
					return true;
				}
				break;
			}
		}
		return false;
	};


	/* Returns column name that contains the unit for the measure */
	sap.ovp.cards.charts.Utils.getUnitColumn = function(measure, entityTypeObject) {
		var properties = entityTypeObject.property;
		for (var i = 0, len = properties.length; i < len; i++) {
			if (properties[i].name == measure) {
				if (properties[i].hasOwnProperty("sap:unit")) {
					return properties[i]["sap:unit"];
				}
				break;
			}
		}
		return null;
	};


	/* Returns the set of all properties in the metadata */
	sap.ovp.cards.charts.Utils.getAllColumnProperties = function(prop, entityTypeObject) {
		var finalObject = {};
		var properties = entityTypeObject.property;
		for (var i = 0, len = properties.length; i < len; i++) {
			if (properties[i].hasOwnProperty(prop) && prop == "com.sap.vocabularies.Common.v1.Label") {
				finalObject[properties[i].name] = properties[i][prop].String;
			} else if (properties[i].hasOwnProperty(prop)) {
				finalObject[properties[i].name] = properties[i][prop];
			} else {
				finalObject[properties[i].name] = properties[i].name;
			}
		}
		return finalObject;
	};

	/* Returns column name that contains the sap:label(s) for all properties in the metadata*/
	sap.ovp.cards.charts.Utils.getAllColumnLabels = function(entityTypeObject) {
		return sap.ovp.cards.charts.Utils.getAllColumnProperties("com.sap.vocabularies.Common.v1.Label", entityTypeObject);
	};


	/* Returns column name that contains the sap:text(s) for all properties in the metadata*/
	sap.ovp.cards.charts.Utils.getAllColumnTexts = function(entityTypeObject) {
		return sap.ovp.cards.charts.Utils.getAllColumnProperties("sap:text", entityTypeObject);
	};


	/* get EdmType of all properties from $metadata */
	sap.ovp.cards.charts.Utils.getEdmTypeOfAll = function(entityTypeObject) {
		return sap.ovp.cards.charts.Utils.getAllColumnProperties("type", entityTypeObject);
	};


	/************************ Format Chart Axis ************************/
	sap.ovp.cards.charts.Utils.formatChartYaxis = function() {
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var customFormatter = {
				locale: function(){},
				format: function(value, pattern) {
					if (pattern == "yValueAxisFormatter") {
						var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance( 
								{style: 'short', 
									minFractionDigits: 2,
									maxFractionDigits: 2}
						);
						return numberFormat.format(Number(value)); 
					}
				}
		};

		jQuery.sap.require("sap.viz.ui5.api.env.Format");
		sap.viz.ui5.api.env.Format.numericFormatter(customFormatter);
	};

	sap.ovp.cards.charts.Utils.hideDateTimeAxis = function(vizFrame, feedName) {
		var entityTypeObject = vizFrame.getModel('ovpCardProperties').getProperty("/entityType");
		var edmTypes = sap.ovp.cards.charts.Utils.getEdmTypeOfAll(entityTypeObject);
		var feeds = vizFrame.getFeeds();
		for (var i = 0; i < feeds.length; i++) {
			if (feeds[i].getUid() == feedName) {
				var feedValues = feeds[i].getValues();
				for (var j = 0; j < feedValues.length; j++) {
					if (edmTypes[feedValues[j]] != "Edm.DateTime") {
						return;
					}
				}
				vizFrame.setVizProperties({categoryAxis:{
					title:{
						visible: false
					}
				}});
				return;
			}
		}
	};
	/************************ Line Chart functions ************************/

	sap.ovp.cards.charts.Utils.LineChart = sap.ovp.cards.charts.Utils.LineChart || {};
	sap.ovp.cards.charts.Utils.LineChart.categoryAxisFeedList = {};

	sap.ovp.cards.charts.Utils.LineChart.getValueAxisFeed = function(measures) {
		var ret = [];
		jQuery.each(measures, function(i, m){
			ret.push(m.Measure.PropertyPath);
		});
		return ret.join(",");
	};


	sap.ovp.cards.charts.Utils.LineChart.getCategoryAxisFeed = function(iContext, dimensions) {
		var ret = [];
		var qualifier;
		jQuery.each(dimensions, function(i, d){
			if (d.Role.EnumMember.split("/")[1] === "Category") {
				ret.push(d.Dimension.PropertyPath);
			}
		});
		/*
		 * If no dimensions are given as category, pick first dimension as category
		 * (see Software Design Description UI5 Chart Control 3.1.2.2.1.1)
		 */
		if (ret.length < 1) {
			ret.push(dimensions[0].Dimension.PropertyPath);
		}
		qualifier = sap.ovp.cards.charts.Utils.getQualifier(iContext,
				sap.ovp.cards.charts.Utils.constants.CHART_QUALIFIER_KEY);
		sap.ovp.cards.charts.Utils.LineChart.categoryAxisFeedList[qualifier] = ret;
		return ret.join(",");
	};
	sap.ovp.cards.charts.Utils.LineChart.getCategoryAxisFeed.requiresIContext = true;


	sap.ovp.cards.charts.Utils.LineChart.getColorFeed = function(iContext, dimensions) {
		var ret = [];
		var qualifier;
		jQuery.each(dimensions, function(i, d){
			if (d.Role.EnumMember.split("/")[1] === "Series") {
				ret.push(d.Dimension.PropertyPath);
			}
		});
		/*
		 * If the dimensions is picked up for category feed as no category is given in the annotation,
		 * remove it from color feed.
		 * (see Software Design Description UI5 Chart Control 3.1.2.2.1.1)
		 */
		qualifier = sap.ovp.cards.charts.Utils.getQualifier(iContext,
				sap.ovp.cards.charts.Utils.constants.CHART_QUALIFIER_KEY);
		ret = jQuery.grep(ret, function(value) {
			if (!sap.ovp.cards.charts.Utils.LineChart.categoryAxisFeedList[qualifier]) {
				return true;
			}
			return value != sap.ovp.cards.charts.Utils.LineChart.categoryAxisFeedList[qualifier][0];
		});
		return ret.join(",");
	};
	sap.ovp.cards.charts.Utils.LineChart.getColorFeed.requiresIContext = true;


	sap.ovp.cards.charts.Utils.LineChart.testColorFeed = function(iContext, dimensions) {
		return sap.ovp.cards.charts.Utils.LineChart.getColorFeed(iContext, dimensions) !== "";
	};
	sap.ovp.cards.charts.Utils.LineChart.testColorFeed.requiresIContext = true;



	/************************ Bubble Chart Functions ************************/

	sap.ovp.cards.charts.Utils.BubbleChart = sap.ovp.cards.charts.Utils.BubbleChart || {};


	sap.ovp.cards.charts.Utils.BubbleChart.getMeasurePriorityList = function(measures) {
		/* (see Software Design Description UI5 Chart Control - Bubble Chart) */
		var ret = [null, null, null];
		jQuery.each(measures, function(i, m){
			if (m.Role.EnumMember.split("/")[1] === "Axis1") {
				if (ret[0] === null) {
					ret[0] = m.Measure.PropertyPath;
				} else if (ret[1] === null) {
					ret[1] = m.Measure.PropertyPath;
				} else if (ret[2] == null) {
					ret[2] = m.Measure.PropertyPath;
				}
			}
		});
		jQuery.each(measures, function(i, m){
			if (m.Role.EnumMember.split("/")[1] === "Axis2") {
				if (ret[0] === null) {
					ret[0] = m.Measure.PropertyPath;
				} else if (ret[1] === null) {
					ret[1] = m.Measure.PropertyPath;
				} else if (ret[2] == null) {
					ret[2] = m.Measure.PropertyPath;
				}
			}
		});
		jQuery.each(measures, function(i, m){
			if (m.Role.EnumMember.split("/")[1] === "Axis3") {
				if (ret[0] === null) {
					ret[0] = m.Measure.PropertyPath;
				} else if (ret[1] === null) {
					ret[1] = m.Measure.PropertyPath;
				} else if (ret[2] == null) {
					ret[2] = m.Measure.PropertyPath;
				}
			}
		});
		return ret;
	};


	sap.ovp.cards.charts.Utils.BubbleChart.getValueAxisFeed = function(measures) {
		return sap.ovp.cards.charts.Utils.BubbleChart.getMeasurePriorityList(measures)[0];
	};


	sap.ovp.cards.charts.Utils.BubbleChart.getValueAxis2Feed = function(measures) {
		return sap.ovp.cards.charts.Utils.BubbleChart.getMeasurePriorityList(measures)[1];
	};


	sap.ovp.cards.charts.Utils.BubbleChart.getBubbleWidthFeed = function(measures) {
		return sap.ovp.cards.charts.Utils.BubbleChart.getMeasurePriorityList(measures)[2];
	};


	sap.ovp.cards.charts.Utils.BubbleChart.getColorFeed = function(dimensions) {
		var ret = [];
		jQuery.each(dimensions, function(i, d){
			if (d.Role.EnumMember.split("/")[1] === "Series") {
				ret.push(d.Dimension.PropertyPath);
			}
		});
		return ret.join(",");
	};

	sap.ovp.cards.charts.Utils.BubbleChart.getShapeFeed = function(dimensions) {
		var ret = [];
		jQuery.each(dimensions, function(i, d){
			if (d.Role.EnumMember.split("/")[1] === "Category") {
				ret.push(d.Dimension.PropertyPath);
			}
		});
		return ret.join(",");
	};


	sap.ovp.cards.charts.Utils.BubbleChart.testColorFeed = function(dimensions) {
		return sap.ovp.cards.charts.Utils.BubbleChart.getColorFeed(dimensions) !== "";
	};


	sap.ovp.cards.charts.Utils.BubbleChart.testShapeFeed = function(dimensions) {
		return sap.ovp.cards.charts.Utils.BubbleChart.getShapeFeed(dimensions) !== "";
	};


	/****************************************************************************
	 * 																			*
	 *					Analytical Card common functions begin					*
	 * 																			*
	 ****************************************************************************/
	sap.ovp.cards.charts.Utils.AnalyticalCardHandler = function(vizFrame) {

		this.sendParameters = 0;
		this.parameterEntityType = undefined;
		this.entityTypeFunc = this.getEntityType;
		this._getEntityNavigationParametersFunc = this._getEntityNavigationParameters;

		this.clickHandler = function() {

			var properties = this.getView().getModel('ovpCardProperties').getData();
			var type = properties.hasOwnProperty("idenfiticationAnnotationPath") ? properties.idenfiticationAnnotationPath : "com.sap.vocabularies.UI.v1.Identification";

			var intents = [];

			var entityType = this.getEntityType();
			var record = entityType[type];

			var parameters = {};
			this.parameterEntityType = { property : []};

			for (var i = 0; Array.isArray(record) && i < record.length; i++) {
				if (record[i].RecordType === 'com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation') {
					intents.push({
						semanticObject: record[i].SemanticObject.String,
						action: record[i].Action.String,
						label: record[i].Label.String
					});
				}
				if (record[i].RecordType === 'com.sap.vocabularies.UI.v1.DataField') {
					parameters[record[i].Label.String] = record[i].Value.String;
					this.parameterEntityType.property.push({name : record[i].Label.String });
				}
			}

			var context = {};
			context.getObject = function() {
				return parameters;
			};

			this.sendParameters = 2;

			var intent = intents.length > 0 ? intents[0] : undefined;
			this.doIntentBasedNavigation(context,intent);
		};

		this._getEntityNavigationParameters = function(entity) {
			if (this.sendParameters == 2) {
				this.sendParameters = 1;
			}
			return this._getEntityNavigationParametersFunc.call(this,entity);
		};

		this.getEntityType = function () {

			if ( this.sendParameters != 1 ) {
				return this.entityTypeFunc.apply(this);
			}
			this.sendParameters = 0;

			return this.parameterEntityType;
		};

		this.getView().byId("ovpCardHeader").attachBrowserEvent("click", function (oEvent) {
			oEvent.stopImmediatePropagation();
			this.clickHandler();
		}.bind(this));


		var that = this;
		vizFrame.attachBrowserEvent("click",that.clickHandler,that);


	};

	/****************************************************************************
	 * 																			*
	 *					Analytical Card common functions end					*
	 * 																			*
	 ****************************************************************************/
}());
