/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([
	'sap/viz/ui5/controls/VizFrame',
	'sap/viz/ui5/controls/common/BaseControl',
	'sap/viz/ui5/data/Dataset',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/data/DimensionDefinition',
	'sap/viz/ui5/data/MeasureDefinition',
	'sap/chart/data/Dimension',
	'sap/chart/data/Measure',
	'sap/ui/model/analytics/ODataModelAdapter',
	'sap/chart/utils/RoleFitter',
	'sap/chart/utils/ChartUtils',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(
	VizFrame,
	BaseControl,
	Dataset,
	FlattenedDataset,
	DimensionDefinition,
	MeasureDefinition,
	Dimension,
	Measure,
	ODataModelAdapter,
	RoleFitter,
	ChartUtils,
	FeedItem,
	Filter,
	FilterOperator
) {
	"use strict";

	/**
	 * Constructor for a new Chart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * UI5 Chart control
	 * 
	 * @extends sap.viz.ui5.controls.common.BaseControl
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.chart.Chart
	 */
	var Chart = BaseControl.extend("sap.chart.Chart", {
		metadata: {
			library: "sap.chart",
			properties: {
				/** 
				 * Type of the Chart.
				 * 
				 * Supported chart types are : column, dual_column, bar, dual_bar, stacked_bar, stacked_column, line, dual_line, combination, bullet, bubble, time_bubble, pie, donut,
				 * timeseries_line, timeseries_scatter, timeseries_bubble,
				 * scatter, vertical_bullet, dual_stacked_bar, 100_stacked_bar, 100_dual_stacked_bar, dual_stacked_column, 100_stacked_column,
				 * 100_dual_stacked_column, stacked_combination, horizontal_stacked_combination, dual_stacked_combination, dual_horizontal_stacked_combination, heatmap
				 */
				chartType                    : {type: "string", defaultValue: "bar"},
				/** 
				 * Names of the Dimensions to be displayed in the Chart.
				 * 
				 * Depending on chart type, insufficient number of visible <code>Dimension</code>s will cause error.
				 */
				visibleDimensions            : {type: "string[]", defaultValue: []},
				/** 
				 * Names of the Measures to be displayed in the Chart.
				 * 
				 * Depending on chart type, insufficient number of visible <code>Measure</code>s will cause errors.
				 */
				visibleMeasures              : {type: "string[]", defaultValue: []},
				/** Chart properties, refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details. */
				vizProperties                : {type: "object", group: "Misc"},/**
				/** Chart scales, refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details. */
				vizScales                    : {type : "object[]", group : "Misc"},
				/** Whether or not an aggregated entity set is bound to the chart. */
				isAnalytical                 : {type: "boolean", defaultValue: false},
				/** 
				 * Chart selection behavior.
				 *  
				 * Supported values are "DATAPOINT", "CATEGORY", or "SERIES", case insensitive, always return in upper case.
				 * 
				 * Unsupported values will be ignored.
				 */
				selectionBehavior            : {type: "string", defaultValue: "DATAPOINT"},
				/** 
				 * Chart selection mode.
				 * 
				 * Supported values are "INCLUSIVE" or "EXCLUSIVE", case insensitive, always return in upper case.
				 * 
				 * Unsupported values will be ignored.
				 */
				selectionMode                : {type: "string", defaultValue: "INCLUSIVE"}
			},
			aggregations: {
				/** Actual data. It can be bound to an (analytical) OData model. */
				data	   : {type: "sap.ui.core.Element", multiple: true, bindable: "bindable"},
				/** Internal VizFrame instance which does the actual rendering work. */
				_vizFrame  : {type: "sap.viz.ui5.controls.VizFrame", multiple: false, visibility: "hidden"},
				/** Dimensions of the data. */
				dimensions : {type: "sap.chart.data.Dimension", multiple: true},
				/** Measures of the data. */
				measures   : {type: "sap.chart.data.Measure", multiple: true}
			},
			events: {
				/** fired after a drill-down operation */
				drilledDown : {
					parameters : {
						/** array of strings holding the names of the added dimensions */
						dimensions : {type : "string[]"}
					}
				},
				/** fired after a drill-up operation */
				drilledUp : {
					parameters : {
						/** array of strings holding the names of the removed dimensions */
						dimensions : {type : "string[]"}
					}
				},
				/** Event fires when the rendering ends. */
				renderComplete : {},
				/** Event fires when certain data point(s) is(are) selected, data context of selected item(s) would be passed in. */
				selectData	   : {},
				/** Event fires when certain data point(s) is(are) deselected, data context of deselected item(s) would be passed in */
				deselectData   : {}
			}			 
		},
		renderer: function(oRm, oControl) {
			// write the HTML into the render manager
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
			oRm.write(">");
			
			oRm.renderControl(oControl.getAggregation("_vizFrame"));
			
			oRm.write("</div>");
		}
	});

	Chart.getMetadata().getAggregation("data")._doesNotRequireFactory = true;

	// ******** Overridden property getters/setters ********
	
	function vizFrameSize (sValue) {
		return sValue.indexOf("%") !== -1 ? "100%" : sValue; 
	}
	Chart.prototype.setHeight = function(sValue) {
		this.setProperty("height", sValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setHeight(vizFrameSize(this.getProperty("height")));
		}
		return this;
	};
	
	Chart.prototype.setWidth = function(sValue) {
		this.setProperty("width", sValue);
		var oVizFrame = this._getVizFrame();
		if (oVizFrame) {
			oVizFrame.setWidth(vizFrameSize(this.getProperty("width")));
		}
		return this;
	};
	
	Chart.prototype.setChartType = function(sChartType, bSuppressInvalidate) {
		this.setProperty("chartType", sChartType, bSuppressInvalidate);
		this._invalidateBy({
			source: this,
			keys: {
				vizFrame: true
			}
		});
		return this;
	};

	Chart.prototype.removeDimension = function(oDimension) {
		var oResult = this.removeAggregation("dimensions", oDimension);

		if (oResult) {
			var aVisibleDimensions = this._getVisibleDimensions() || [],
			iIndex = aVisibleDimensions.indexOf(oResult.getName());
			if (iIndex !== -1) {
				aVisibleDimensions.splice(iIndex, 1);
				this.setVisibleDimensions(aVisibleDimensions);
			}
		}
		return oResult;
	};

	Chart.prototype.removeAllDimensions = function() {
		var oResult = this.removeAllAggregation("dimensions");
		this.setVisibleDimensions([]);
		return oResult;
	};

	Chart.prototype.destroyDimensions = function() {
		var oResult = this.destroyAggregation("dimensions");
		this.setVisibleDimensions([]);
		return oResult;
	};
	
	Chart.prototype.removeMeasure = function(oMeasure) {
		var oResult = this.removeAggregation("measures", oMeasure);

		if (oResult) {
			var aVisibleMeasures = this._getVisibleMeasures() || [],
			iIndex = aVisibleMeasures.indexOf(oResult.getName());
			if (iIndex !== -1) {
				aVisibleMeasures.splice(iIndex, 1);
				this.setVisibleMeasures(aVisibleMeasures);
			}
		}
		return oResult;
	};

	Chart.prototype.removeAllMeasures = function() {
		var oResult = this.removeAllAggregation("measures");
		this.setVisibleMeasures([]);
		return oResult;
	};

	Chart.prototype.destroyMeasures = function() {
		var oResult = this.destroyAggregation("measures");
		this.setVisibleMeasures([]);
		return oResult;
	};
	Chart.prototype._getVisibleDimensions = function() {
		var oStackTop = this._getDrillStateTop();
		return oStackTop ? oStackTop.dimensions : this.getProperty("visibleDimensions");		
	};

	Chart.prototype.getVisibleDimensions = function() {
		var aVisibleDimensions = this._getVisibleDimensions();
		return this._aUnusedVisibles ? aVisibleDimensions.filter(function(d) {
			return this._aUnusedVisibles.indexOf(d) === -1;
		}, this) : aVisibleDimensions;
	};

	Chart.prototype._getVisibleMeasures = function() {
		var oStackTop = this._getDrillStateTop();
		return oStackTop ? oStackTop.measures : this.getProperty("visibleMeasures"); 
	};

	Chart.prototype.getVisibleMeasures = function() {
		var aVisibleMeasures = this._getVisibleMeasures();
		return this._aUnusedVisibles ? aVisibleMeasures.filter(function(d) {
			return this._aUnusedVisibles.indexOf(d) === -1;
		}, this) : aVisibleMeasures;
	};

	Chart.prototype.setVisibleDimensions = function(aDimensionNames, bSuppressInvalidate) {
		this.setProperty("visibleDimensions", aDimensionNames, bSuppressInvalidate);
		this._createDrillStack();
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				dataSet: true,
				vizFrame: true
			}
		});
		
		return this;
	};

	Chart.prototype.setVisibleMeasures = function(aMeasureNames, bSuppressInvalidate) {
		this.setProperty("visibleMeasures", aMeasureNames, bSuppressInvalidate);
		this._createDrillStack();
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				dataSet: true,
				vizFrame: true
			}
		});
		return this;
	};

	// ******** Private helper functions ********
	/**
	 * Convert an array containing any number of Dimension/Measure instances (object) and Dimension/Measure names (string)
	 * an array of Dimension/Measure instances. And filter out any Dimensions/Measures that are not in the Dimension/Measure
	 * aggregation.
	 *
	 * @param {array} aMixed the mixed array of Dimension/Measure instances and names
	 * @param {boolean} bIsDimension whether the input array are Dimensions
	 * @return {array} an array of Dimension/Measure instances that present in the visible Dimension/Measure aggregation
	 *				   result.error will contain all the non-normalizable input from the mixed array passed in
	 * @private
	 */
	Chart.prototype._normalizeDorM = function(aMixed, bIsDimension) {
		var aAll = bIsDimension ? this.getDimensions() : this.getMeasures(),
			mLookUp = aAll.reduce(function(mMap, oDimOrMsr) {
				mMap[oDimOrMsr.getName()] = oDimOrMsr;
				return mMap;
			}, {}),
			clazz = bIsDimension ? Dimension : Measure;

		var oResult = aMixed.reduce(function(oResult, oNameOrDM) {
			var sName;
			if (typeof oNameOrDM === "string") {
				sName = oNameOrDM;
			} else if (oNameOrDM instanceof clazz) {
				sName = oNameOrDM.getName();
			} else {
				oResult.errors.push(oNameOrDM);
			}
			if (mLookUp[sName]) {
				oResult.normalized.push(mLookUp[sName]);
			} else {
				oResult.errors.push(oNameOrDM);
			}
			return oResult;
		}, {
			normalized: [],
			errors: []
		});

		var aNormalized = oResult.normalized;
		if (oResult.errors.length > 0) {
			aNormalized.errors = oResult.errors;
		}

		return aNormalized;
	};

	/**
	 * Calculate redundant Dimensions and Measures from selected data points (selection)
	 * against visible Dimensions and Measures.
	 * 
	 * A Dimension is considered to be redundant if all selected data points share the same value for it.
	 * A Measure is considered to be redundant if none of the selected data point are of this measure.
	 *
	 * @return {object} key, value pairs for redundant Dimensions and Measures.
	 *					For Dimensions, key is the Dimension name and value is the redundant value;
	 *					For Measures, key is "measureNames" and value is an map having the redundant Measure names as keys
	 * @private
	 */
	Chart.prototype._redundantsFromSelection = function() {
		var aSelections = this._getVizFrame().vizSelection();
		if (!aSelections || aSelections.length === 0) {
			return {measureNames: {}};
		}

		var mSelectionSummary = aSelections.reduce(function(mSummary, oSelection) {
			jQuery.each(oSelection.data, function(k, v) {
				if (!mSummary[k]) {
					mSummary[k] = [];
				}
				if (mSummary[k].indexOf(v) === -1) {
					mSummary[k].push(v);
				}
			});
			return mSummary;
		}, {});

		var mRedundants = this._getVisibleDimensions().reduce(function(mRedundantDimensions, sDimensionName) {
			var aValues = mSelectionSummary[sDimensionName];
			if (aValues.length === 1) {
				mRedundantDimensions[sDimensionName] = aValues[0];
			}
			return mRedundantDimensions;
		}, {});

		mRedundants.measureNames = this._getVisibleMeasures().reduce(function(mRedundantMeasures, sMsrName) {
			if (!mSelectionSummary[sMsrName]) {
				mRedundantMeasures[sMsrName] = true;
			}
			return mRedundantMeasures;
		}, {});

		return mRedundants;
	};

	/**
	 * Derive a filter from the selected data points (selection).
	 * The returned Filter will make sure only the Dimension values that presents in the selection are retained.
	 *
	 * NOTE: Redundant Measures is to be handled in the request rather than here in Filter
	 * 
	 * @return {sap.ui.model.Filter} the Filter instance
	 * @private 
	 */
	Chart.prototype._deriveFilterFromSelection = function() {
		var aVisibleDimensions = this._getVisibleDimensions();

		var aFilterCfgs = this._getVizFrame().vizSelection().map(function(oSelection) {
			var oConfig = aVisibleDimensions.reduce(function(oFilterCfg, sDimensionName) {
				oFilterCfg.filters.push(new Filter({path: sDimensionName, operator: FilterOperator.EQ, value1: oSelection.data[sDimensionName]}));
				oFilterCfg.signature.push(sDimensionName + "=" + oSelection.data[sDimensionName]);
				return oFilterCfg;
			}, {
				filters: [],
				signature: []
			});
			oConfig.signature = oConfig.signature.join(";");
			return oConfig;
		});

		var mUniqFilters = aFilterCfgs.reduce(function(mFilters, oCfg) {
			if (!mFilters[oCfg.signature] && oCfg.filters.length > 0) {
				mFilters[oCfg.signature] = new Filter(oCfg.filters, true);
			}
			return mFilters;
		}, {});

		var aFilters = Object.keys(mUniqFilters).map(function(k) {
			return mUniqFilters[k];
		});
		if (aFilters.length > 1) {
			return new sap.ui.model.Filter(aFilters, false);
		} else if (aFilters.length === 1) {
			return aFilters[0];
		} else {
			return null;
		}
	};

	/**
	 * Check that the dimension to be drilled down actually can be drilled down
	 *
	 * @private
	 * @param {array} aIncomingDimensions an array of Dimensions to be drilled down
	 * @return {boolean} true if the chart can drill down on all provided Dimensions, otherwise return false
	 */
	Chart.prototype._checkDrilldownValid = function(aIncomingDimensions) {
		var mVisibleDimensions = this._getVisibleDimensions().reduce(function(mMap, sDimensionName) {
			mMap[sDimensionName] = true;
			return mMap;
		}, {});

		// Prevent drill down again on dimensions that are visible already
		if (aIncomingDimensions.some(function(oDim) {
			return mVisibleDimensions[oDim.getName()];
		})) {
			jQuery.sap.log.error("Drill down not possible, because one of the given dimensions is already drilled down!");
			return false;
		}

		var mArgumentDimensionNames = aIncomingDimensions.reduce(function(oResult, oDimension) {
			oResult[oDimension.getName()] = oDimension;
			return oResult;
		}, {});

		// recursively check the filter tree for a dimension which we want to drill down into
		function findFilter(oFilter) {
			if (jQuery.isArray(oFilter.aFilters)) { // Subtree
				return oFilter.aFilters.some(findFilter);
			} else { // Leaf
				return !!mArgumentDimensionNames[oFilter.sPath];
			}
		}
		
		var oStackTop = this._getDrillStateTop();
		if (oStackTop.filter && findFilter(oStackTop.filter)) {
			jQuery.sap.log.error("Drill down not possible, because one of the given dimensions is already filtered!");
			return false;
		}

		return true;
	};
	
	/**
	 * Create the drill stack from visible Dimensions and Measures.
	 * 
	 * The created drill stack should allow user to drill up by removing one visible Dimension
	 * each time until no Dimension is left
	 * @private
	 */
	Chart.prototype._createDrillStack = function() {
		var aVisibleDimensions = this.getProperty("visibleDimensions") || [],
			aVisibleMeasures = this.getProperty("visibleMeasures") || [],
			aStack = [{
				dimensions: [],
				measures: aVisibleMeasures,
				filter: undefined
			}],
			aStackDimensions = [];

		for (var i = 0; i < aVisibleDimensions.length; i++) {
			aStackDimensions.push(aVisibleDimensions[i]);
			aStack.push({
				dimensions: aStackDimensions.slice(),
				measures: aVisibleMeasures,
				filter: undefined
			});
		}

		this._drillStateStack = aStack;
	};

	/**
	 * Invalidate certain aspect of the Chart control so it gets updated accordingly on the re-render phase.
	 *
	 * It is not required to update all aspects on each invalidation because some causes only changes certain, but not all, aspect.
	 * For example
	 *	 a. If the cause is Dimension/Measure property (label, role, or format etc) change, it is not necessary to update the binding and drill state;
	 *	 b. If the cause is visibleDimensions/visibleMeasures change, it is required to update almost everything.
	 * and the cases goes on.
	 *
	 * @param {object} oCause the cause of the invalidation
	 * @private
	 */
	Chart.prototype._invalidateBy = function(oCause) {
		var oSource = oCause.source;
		var updates = this._mNeedToUpdate || {};
		if (oSource === this) {
			jQuery.each(oCause.keys || {}, function(k, v) {
				updates[k] = v;
			});
		} else if (oSource instanceof Measure && this._getVisibleMeasures().indexOf(oSource.getName()) !== -1) {
			updates.dataSet = true;
			updates.vizFrame = true;
		} else if (oSource instanceof Dimension && this._getVisibleDimensions().indexOf(oSource.getName()) !== -1) {
			updates.dataSet = true;
			updates.vizFrame = true;
			if (oSource.getDisplayText() && (oCause.property === "textProperty" || oCause.property === "displayText" )) {
				updates.binding = true;
			}
		}

		this._mNeedToUpdate = updates;
		this.invalidate(oCause);
	};

	// ******** Private updaters. These updaters are meant to be triggered by the _render function. ********
	Chart.prototype._updaters = (function() {
		function createDimAnalyticalInfos(oDim) {
			var sTextProperty = oDim.getTextProperty(),
				aInfos = [{ name: oDim.getName(), grouped: false, inResult: false, visible: true }];


			if (oDim.getDisplayText() && sTextProperty) {
				aInfos.push({ name: sTextProperty, grouped: false, inResult: false, visible: true });
			}
			
			return aInfos;
		}

		function createMsrAnalyticalInfos(oMsr) {
			var sUnitBinding = oMsr.getUnitBinding(),
				aInfos = [{ name: oMsr.getName(), total: false, inResult: false, visible: true }];


			if (sUnitBinding) {
				aInfos.push({ name: sUnitBinding, total: false, inResult: false, visible: true });
			}
			
			return aInfos;
		}
		
		return {
			drillStack: function() {
				this._createDrillStack();
			},
			dataSet: function() {
				var oDataset = this._getDataset();
				oDataset.updateData.apply(oDataset, arguments);
			},
			/* This BINDING is NOT the chart bindin */
			binding: function() {
				var oBinding = this._getDataset().getBinding("data");
				if (!oBinding) {
					return;
				}
				var aDimensions = this._normalizeDorM(this._getVisibleDimensions(), true),
					aMeasures = this._normalizeDorM(this._getVisibleMeasures(), false);
				if (oBinding.updateAnalyticalInfo) {
					var aAnalyticalInfos = aDimensions.reduce(function(aInfos, oDim) {
						return aInfos.concat(createDimAnalyticalInfos(oDim));
					}, []).concat(aMeasures.reduce(function(aInfos, oMsr) {
						return aInfos.concat(createMsrAnalyticalInfos(oMsr));
					}, []));
					oBinding.updateAnalyticalInfo(aAnalyticalInfos);
				}

				var oStackTop = this._getDrillStateTop();
				if (aDimensions.length > 0 || aMeasures.length > 0) {					
					this._getVizFrame()._pendingDataRequest(true); // prevent vizFrame from updating by an empty dataset before data is received
					this.setBusy(true);
				}
				oBinding.filter(oStackTop.filter ? oStackTop.filter : undefined);
			},
			vizFrame: function() {
				this._aUnusedVisibles = null;
				var aDimensions = this._normalizeDorM(this._getVisibleDimensions(), true),
					aMeasures = this._normalizeDorM(this._getVisibleMeasures(), false),
					oDataset = this._getDataset(),
					oVizFrame = this._getVizFrame();

				oDataset.removeAllAggregation("dimensions", true);
				oDataset.removeAllAggregation("measures", true);

				oVizFrame.removeAllAggregation("feeds", true);
				var aFeeds = RoleFitter.fit(this.getChartType(), aDimensions, aMeasures, "color", this._mDataTypes);
				this._aUnusedVisibles = aFeeds._unused;
				aFeeds._def.dim.forEach(function(oDim) {
					oDataset.addAggregation("dimensions", oDim, true);
				}, this);
				aFeeds._def.msr.forEach(function(oMsr) {
					oDataset.addAggregation("measures", oMsr, true);
				}, this);
				aFeeds.forEach(function(oFeedItem) {
					oVizFrame.addFeed(oFeedItem);
				});

				oVizFrame.invalidate();
				oDataset.invalidate();
				oVizFrame.setVizType(this.getChartType());
				oVizFrame.setVizProperties(this._getHostedVizProperties());
			}
		};
	})();

	// ******** Private Accessors ********
	Chart.prototype._getDrillStateTop = function() {
		return this._drillStateStack ? this._drillStateStack[this._drillStateStack.length - 1] : null;
	};

	Chart.prototype._getVizFrame = function() {
		return this.getAggregation("_vizFrame");
	};

	Chart.prototype._getDataset = function() {
		var oVizFrame = this._getVizFrame();
		return oVizFrame ? oVizFrame.getDataset() : null;
	};
	
	Chart.prototype._bindingDataReceivedListener = function() {
		var oVizFrame = this._getVizFrame();
		this.setBusy(false);
		oVizFrame._pendingDataRequest(false);
		oVizFrame.invalidate();
	};

	// ******** overridden functions ********

	// override standard aggregation methods for 'data' and report an error when they are used
	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "addData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.addData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "addData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "destroyData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.destroyData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "destroyData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "getData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.getData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "getData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "indexOfData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.indexOfData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "indexOfData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "insertData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.insertData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "insertData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported.
	 * Chart manages the "data" aggregation only via data binding. The method "removeData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.removeData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "removeData" therefore cannot be used programmatically!');
	};

	/** 
	 * Unsupported. 
	 * Chart manages the "data" aggregation only via data binding. The method "removeAllData" therefore cannot be used programmatically!
	 *
	 * @public 
	 */
	Chart.prototype.removeAllData = function() {
		jQuery.sap.log.error('Chart manages the "data" aggregation only via data binding. The method "removeAllData" therefore cannot be used programmatically!');
	};

	Chart.prototype.bindAggregation = function(sName, oBindingInfo) {
		if (sName === "data" && this.getIsAnalytical()) {
			if (oBindingInfo && oBindingInfo.parameters) {
				oBindingInfo.parameters.analyticalInfo = [{name: ""}];
			}
			// This may fail, in case the model is not yet set.
			// If this case happens, the ODataModelAdapter is added by the overriden _bindAggregation, 
			// which is called during setModel(...)
			var oModel = this.getModel(oBindingInfo.model);
			if (oModel) {
				ODataModelAdapter.apply(oModel);
			}
		}

		return BaseControl.prototype.bindAggregation.apply(this, arguments);
	};
	
	Chart.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "data" && this.getIsAnalytical()) {
			// This may fail, in case the model is not yet set.
			// If this case happens, the ODataModelAdapter is added by the overriden _bindAggregation, which is called during setModel(...)
			var oModel = this.getModel(oBindingInfo.model);
			if (oModel) {
				ODataModelAdapter.apply(oModel);
				
				var oResult = oModel.getAnalyticalExtensions().getAllQueryResults()[oBindingInfo.parameters.entitySet];
				var mDataTypes = {};
				
				jQuery.each(oResult.getAllDimensions(), function(id, v) {
					mDataTypes[id] = v._oProperty.type;
				});
				jQuery.each(oResult.getAllMeasures(), function(id, v) {
					mDataTypes[id] = v._oProperty.type;
				});
				
				this._mDataTypes = mDataTypes;
				
				// derive dimensions and measures from metadata, if not yet set
				var aDimensions = this.getAggregation("dimensions");
				var aMeasures = this.getAggregation("measures");
				if ((aDimensions === null || aDimensions.length === 0) && (aMeasures === null || aMeasures.length === 0)) {
					var sResultType = oResult.getEntityType().getQName();
					sResultType = sResultType.slice(sResultType.lastIndexOf(".") + 1);
					aDimensions = oResult.getAllDimensions();
					for (var i in aDimensions) {
						var sDimensionName = aDimensions[i].getName();
						this.addDimension(new Dimension({
							name: sDimensionName,
							label: "{/#" + sResultType + "/" + sDimensionName + "/@sap:label}",
							textProperty: "{/#" + sResultType + "/" + sDimensionName + "/@sap:text}"
						}));
					}
					aMeasures = oResult.getAllMeasures();
					for (var j in aMeasures) {
						var sMeasureName = aMeasures[j].getName();
						this.addMeasure(new Measure({
							name: sMeasureName,
							label: "{/#" + sResultType + "/" + sMeasureName + "/@sap:label}"
						}));
					}
				}
			}

			var oDataset = this._getDataset(),
				oOldDataBinding = oDataset.getBinding("data");
			
			if (oOldDataBinding) {
				oOldDataBinding.detachChange(this._bindingDataReceivedListener, this);
			}
			oDataset.bindAggregation("data", oBindingInfo);
			oDataset.getBinding("data").attachChange(this._bindingDataReceivedListener, this);
			this._invalidateBy({
				source: this,
				keys: {
					binding: true,
					vizFrame: true
				}
			});
		} else {
			BaseControl.prototype._bindAggregation.apply(this, arguments);
		}
	};
	
	Chart.prototype.unbindAggregation = function(sName, bSuppressReset) {
		if (sName === "data") {
			var oDataset = this._getDataset();
			if (oDataset) {				
				oDataset.unbindAggregation.apply(oDataset, arguments);
			}
		}
		return BaseControl.prototype.unbindAggregation.apply(this, arguments);
	};
	
	/*
	 * @override
	 * @private
	 */
	Chart.prototype.onBeforeRendering = function() {
		BaseControl.prototype.onBeforeRendering.apply(this, arguments);
		var that = this,
			updateFns = this._updaters,
			mNeedToUpdate = this._mNeedToUpdate || {};
		jQuery.each(updateFns, function(key, fn) {
			if (mNeedToUpdate[key]) {
				fn.call(that);
				mNeedToUpdate[key] = false;
			}
		});
	};
	
	// Override to prevent Basecontrol._render from createing DOM node, since Chart performs rendering via _vizFrame
	Chart.prototype.onAfterRendering = function () {};

	/*
	 * @override
	 */
	Chart.prototype.exit = function() {
		this._getDataset().unbindAggregation('data', true);
		BaseControl.prototype.exit.apply(this, arguments);
		if (this._delegateEventHandlers) {
			this._delegateEventHandlers.forEach(function(oHandler) {
				this["detach" + oHandler.name](oHandler.handler, this);
				delete oHandler.handler;
			}, this);
			delete this._delegateEventHandlers;
		}
	};

	/*
	 * @override
	 */
	Chart.prototype.applySettings = function() {
		sap.ui.core.Control.prototype.applySettings.apply(this, arguments);

		var oDataset = new sap.viz.ui5.data.FlattenedDataset();
		var oVizFrame = new VizFrame({
			width: vizFrameSize(this.getWidth()),
			height: vizFrameSize(this.getHeight()),
			vizType: this.getChartType(),
			uiConfig: this.getUiConfig(),
			vizProperties: jQuery.extend(true, {}, this.getVizProperties(), this._getHostedVizProperties())
		});

		oVizFrame.setDataset(oDataset);

		this.setAggregation("_vizFrame", oVizFrame);
		this._delegateEvents();
	};
	
	// ******** Public API ********

	/**
	 * Reset to visible layout.
	 * @public
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chainign
	 */
	Chart.prototype.resetLayout = function() {
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				vizFrame: true,
				drillStack: true,
				dataSet: true
			}
		});
		return this;
	};

	// ******** Selection API ********
	var _SelectionHelper = (function() {
		function makeLookUp(aKeys) {
			return aKeys.reduce(function(mLookUp, sKey) {
				mLookUp[sKey] = true;
				return mLookUp;
			}, {});
		}
		function toVizCtx(aVisibleMeasures, aVisibleDimensions) {
			var mVisibleMsrs = makeLookUp(aVisibleMeasures);

			function dimWrapper(oContextObj) {
				return aVisibleDimensions.reduce(function(oPartialDataCtx, sDim) {
					if (oContextObj.hasOwnProperty(sDim)) {
						oPartialDataCtx[sDim] = oContextObj[sDim];
					}
					return oPartialDataCtx;
				}, {});
			}
			
			return function(aRequestedMeasures, oContextObj) {
				return aRequestedMeasures.filter(function(sMsr) {
					return mVisibleMsrs[sMsr];
				}).map(function(sMsr) {
					var oDataCtx = dimWrapper(oContextObj);
					oDataCtx[sMsr] = "*";
					return {data: oDataCtx};
				});
			};
		}

		function fromVizCtx(aVisibleMeasures, aVisibleDimensions) {
			var mVisibleMsrs = makeLookUp(aVisibleMeasures);
			return function(oVizCtx) {
				return {
					index: oVizCtx._context_row_number,
					measures: Object.keys(oVizCtx).filter(function(sMsr) {
						return mVisibleMsrs[sMsr];
					})
				};
			};
		}
		
		function toVizCSCtx(oCtx) {
			var oVizCtx = {data:{}},
				oMsrVal = oCtx.measures,
				oDimVal = oCtx.dimensions;

			if (oMsrVal) {
				oVizCtx.data.measureNames = (oMsrVal instanceof Array) ? {"in": oMsrVal} : oMsrVal;
			}

			jQuery.each(oDimVal || {}, function(k, v) {
				oVizCtx.data[k] = (v instanceof Array) ? {"in": v} : v;
			});
			
			return oVizCtx;
		}

		function fromVizCSCtx(oVizCtx) {
			var oData = oVizCtx.data;
			return Object.keys(oData).reduce(function(obj, k) {
				var v = oData[k];
				if (v.in && v.in instanceof Array) {
					v = v.in;
				}
				if (k === "measureNames") {
					obj.measures = v;
				} else if (!obj.dimensions) {
					obj.dimensions = {};
					obj.dimensions[k] = v;
				} else {
					obj.dimensions[k] = v;
				}
				return obj;
			}, {});
		}
		
		function buildSelectionVizCtx(aVisibleMeasures, aVisibleDimensions, oBinding, aContexts) {
			var converter = toVizCtx(aVisibleMeasures, aVisibleDimensions);
			return aContexts.reduce(function(aData, oCtx) {
				var aCtxs = oBinding.getContexts(oCtx.index, 1);
				if (aCtxs.length > 0) {
					aData = aData.concat(converter(oCtx.measures, aCtxs[0].getObject()));
				}
				return aData;
			}, []);
		}
		
		return {
			makeLookUp: makeLookUp,
			toVizCtx: toVizCtx,
			fromVizCtx: fromVizCtx,
			toVizCSCtx: toVizCSCtx,
			fromVizCSCtx: fromVizCSCtx,
			buildSelectionVizCtx: buildSelectionVizCtx,
			match: function(oRef, oVal, aMeasures) {
				return Object.keys(oRef).every(function(k) {
					if (aMeasures.indexOf(k) !== -1) {
						return oVal.hasOwnProperty(k);
					} else {
						return oRef[k] === oVal[k];
					}
				});
			}
		};
	})();
	
	// ******************** Datapoint Selection ********************
	/**
	 * Select one or more data points, specified by datapoint objects.
	 * 
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",      // group ID (optional)
	 * 		index:    index,          // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @public
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedDataPoints = function(aDataPoints) {
		var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
		if (!oBinding || !oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
			return this;
		}
		oVizFrame.vizSelection(_SelectionHelper.buildSelectionVizCtx(this._getVisibleMeasures(), this._getVisibleDimensions(), oBinding, aDataPoints), {
			selectionMode: "exclusive"
		});
		return this;
	};

	/**
	 * Add one or more data points to current data point selection, specified by datapoint objects.
	 * 
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",      // group ID (optional)
	 * 		index:    index,          // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @public
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedDataPoints = function(aDataPoints) {
		var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
		if (!oBinding || !oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
			return this;
		}
		oVizFrame.vizSelection(_SelectionHelper.buildSelectionVizCtx(this._getVisibleMeasures(), this._getVisibleDimensions(), oBinding, aDataPoints), {
			selectionMode: "inclusive"
		});
		return this;
	};

	/**
	 * Return a total number and an array of datapoint objects (including a Context object) of currently selected data points.
	 * 
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",      // group ID (optional)
	 * 		index:    index,          // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs (data points created from the same Context object
	 * 		                          // differing only in measure names are merged together)
	 * 		context:  [Context]       // Context object
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @public
	 * 
	 * @return {object} a total number of selected data points, and an array of datapoint objects.
	 */
	Chart.prototype.getSelectedDataPoints = function() {
		var oVizFrame = this._getVizFrame();
		if (!oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
			return {
				count: 0,
				dataPoints: []
			};
		}
		var converter = _SelectionHelper.fromVizCtx(this._getVisibleMeasures(), this._getVisibleDimensions());
		var aSelectedDataPoints = oVizFrame.vizSelection(),
			mSelectedDataPoints = aSelectedDataPoints.map(function(n) {
				return n.data;
			}).map(converter).reduce(function(map, ctx) {
				var id = ctx.index;
				map[id] = jQuery.extend(true, map[id] || {}, _SelectionHelper.makeLookUp(ctx.measures));
				return map;
			}, {});
		var oDataSet = this._getDataset();
		return {
			count: aSelectedDataPoints.length,
			dataPoints: Object.keys(mSelectedDataPoints).map(function(id) {
				var idx = parseInt(id, 10);
				return {
					index: idx,
					measures: Object.keys(mSelectedDataPoints[id]),
					context: oDataSet.findContext({_context_row_number: idx})
				};
			})			
		};
	
	};

	/**
	 * Deselect one or more data points from current data point selections, specified by datapoint objects.
	 * 
	 * Datapoint object has the following structure:
	 * <pre>
	 * {
	 * 		groupId:  "groupId",      // group ID (optional)
	 * 		index:    index,          // index of the data in the group
	 * 		measures: ["measureId"]   // measure IDs
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "DATAPOINT"
	 *
	 * @public
	 * 
	 * @param {array} aDataPoints an array of datapoint objects.
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedDataPoints = function(aDataPoints) {
		var oBinding = this.getBinding("data"),
			oVizFrame = this._getVizFrame();
		if (!oVizFrame || this.getSelectionBehavior().toUpperCase() !== "DATAPOINT") {
			return this;
		}
		var aVisibleMsrs = this._getVisibleMeasures();
		var aVisibleDims = this._getVisibleDimensions();
		var aToRemove = _SelectionHelper.buildSelectionVizCtx(aVisibleMsrs, aVisibleDims, oBinding, aDataPoints);
		oVizFrame.vizSelection(aToRemove, {
			deselection: true
		});
		return this;
	};
	
	// ******************** Category Selection ********************
	/**
	 * Select one or more categories, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "CATEGORY"
	 * 
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedCategories = function(aCategories) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "CATEGORY") {
			return this;
		}
		oVizFrame.vizSelection(aCategories.map(_SelectionHelper.toVizCSCtx), {
			selectionMode: "exclusive"
		});
		return this;
	};
	
	/**
	 * Add one or more categories to current category selections, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "CATEGORY"
	 * 
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedCategories = function(aCategories) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "CATEGORY") {
			return this;
		}
		oVizFrame.vizSelection(aCategories.map(_SelectionHelper.toVizCSCtx), {
			selectionMode: "inclusive"
		});
		return this;
	};

	/**
	 * Deselect one or more categories from current category selections, specified by category objects.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "CATEGORY"
	 * 
	 * @public
	 *
	 * @param {array} aCategories an array of category objects
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedCategories = function(aCategories) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "CATEGORY") {
			return this;
		}
		oVizFrame.vizSelection(aCategories.map(_SelectionHelper.toVizCSCtx), {
			deselection: true
		});
		return this;
	};

	/**
	 * Return category objects of currently selected categories and a total number of selected data points.
	 *
	 * Category object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Return 0 and empty list if selectionBehavior is not "CATEGORY"
	 * 
	 * @public
	 * 
	 * @return {object} a total number of selected data points, and an array of category objects for selected categories.
	 */
	Chart.prototype.getSelectedCategories = function() {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "CATEGORY") {
			return {
				count: 0,
				categories: []
			};
		} else {
			var aSelections = oVizFrame.vizSelection();
			return {
				count: aSelections.length,
				categories: (aSelections.category || []).map(_SelectionHelper.fromVizCSCtx)
			};
		}
	};
	
	// ******************** Series Selection ********************
	/**
	 * Select one or more series, specified by series objects.
	 * 
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "SERIES"
	 * 
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.setSelectedSeries = function(aSeries) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "SERIES") {
			return this;
		}
		oVizFrame.vizSelection(aSeries.map(_SelectionHelper.toVizCSCtx), {
			selectionMode: "exclusive"
		});
		return this;
	};
	
	/**
	 * Add one or more series to current series selections, specified by series objects.
	 * 
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "SERIES"
	 * 
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 * 
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.addSelectedSeries = function(aSeries) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "SERIES") {
			return this;
		}
		oVizFrame.vizSelection(aSeries.map(_SelectionHelper.toVizCSCtx), {
			selectionMode: "inclusive"
		});
		return this;
	};

	/**
	 * Deselect one or more series from current series selections, specified by series objects.
	 * 
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Only works when selectionBehavior is "SERIES"
	 * 
	 * @public
	 *
	 * @param {array} aSeries an array of series objects
	 *
	 * @returns {sap.chart.Chart} Reference to <code>this</code> in order to allow method chaining
	 */
	Chart.prototype.removeSelectedSeries = function(aSeries) {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "SERIES") {
			return this;
		}
		oVizFrame.vizSelection(aSeries.map(_SelectionHelper.toVizCSCtx), {
			deselection: true
		});
		return this;
	};

	/**
	 * Return series objects of currently selected series and a total number of selected data points.
	 * 
	 * Series object has the following structure:
	 * <pre>
	 * {
	 *	   measure: measureName,
	 *	   dimensions: {
	 *		   dimensionName1: dimensionValue1,
	 *		   dimensionName2: dimensionValue2,
	 *		   ...
	 *	   }
	 * }
	 * </pre>
	 * 
	 * Return 0 and empty list if selectionBehavior is not "SERIES"
	 * 
	 * @public
	 * 
	 * @return {object} object containing a total number of selected data points, 
	 * and an array of series objects for selected series.
	 * 
	 */
	Chart.prototype.getSelectedSeries = function() {
		var oVizFrame = this._getVizFrame(),
			sBehavior = this.getSelectionBehavior().toUpperCase();
		if (!oVizFrame || sBehavior !== "SERIES") {
			return {
				count: 0,
				series: []
			};
		} else {
			var aSelections = oVizFrame.vizSelection();
			return {
				count: aSelections.length,
				series: (aSelections.series || []).map(_SelectionHelper.fromVizCSCtx)
			};
		}
	};

	// ******** Drill down/up API ********
	
	/**
	 * Drill down on specific Dimension(s).
	 *
	 * The drill down Dimension(s) must present in the Dimension aggregation
	 * and must NOT present in previous drill down or be visible already.
	 *
	 * @public
	 * 
	 * @param {array} vDimensions an array, or just a single instance, of either Dimension instance or Dimension name to drill down
	 */
	Chart.prototype.drillDown = function(vDimensions) {
		// make sure that only dimensions are drilled down
		if (vDimensions && !(vDimensions instanceof Array)) {
			vDimensions = [vDimensions];
		}
		var aDimensions = this._normalizeDorM(vDimensions, true);

		if (aDimensions.length === 0) {
			return;
		}
		if (!this._checkDrilldownValid(aDimensions)) {
			jQuery.sap.log.warning("Drill down not possible for " + aDimensions + ". Already drilled down.");
			return;
		}

		var oStackTop = this._getDrillStateTop(),
			mRedundants = this._redundantsFromSelection(),
			oSelectionFilter = this._deriveFilterFromSelection();

		var oNewFilter;
		if (oSelectionFilter) {
			oNewFilter = !oStackTop.filter ? oSelectionFilter : new Filter([oSelectionFilter, oStackTop.filter], true);
		}

		// dimension(s) can be used for drill down
		this._drillStateStack.push({
			dimensions: oStackTop.dimensions.slice().concat(aDimensions.map(function(oDim) {
				return oDim.getName();
			})).filter(function(sDim) {
				return !mRedundants[sDim];
			}),
			measures:  oStackTop.measures.filter(function(sMsr) {
				return !mRedundants.measureNames[sMsr];
			}),
			filter: oNewFilter,
			redundant: mRedundants
		});

		var aDimensionNames = aDimensions.map(function(oDim) {
			return oDim.getName();
		}); 
		this.fireDrilledDown({
			dimensions: aDimensionNames
		});		
		this._invalidateBy({
			source: this,
			keys: {
				binding: true,
				vizFrame: true
			}
		});
	};

	/**
	 * Drill up to previous drill down state, or remove the last visible Dimension
	 *
	 * @public
	 */
	Chart.prototype.drillUp = function() {
		if (this._drillStateStack.length > 1) {
			var oPreviousState = this._drillStateStack.pop(),
				oStackTop = this._getDrillStateTop();
			this.fireDrilledUp({
				dimensions: oPreviousState.dimensions.filter(function(d) {
					return oStackTop.dimensions.indexOf(d) === -1;
				})
			});
			this._invalidateBy({
				source: this,
				keys: {
					binding: true,
					vizFrame: true
				}
			});
		}
	};
	
	// ******** Delegations of VizFrame properties ********
	Chart.prototype.setUiConfig = function(oUiConfig) {
		this.setProperty("uiConfig", oUiConfig);
		if (this._getVizFrame()) {
			this._getVizFrame().setUiConfig(oUiConfig);
		}
	};

	var VizPropertiesHelper = (function() {
		var BLACKLIST = [
			"interaction.selectability.mode",		// via setSelectionMode API
			"interaction.selectability.behavior"	// via setSelectionBehavior API
		];

		function deleteProp(obj, propPath) {
			var target = obj,
				vals;
			vals = propPath.reduce(function(entries, prop) {
				if (target.hasOwnProperty(prop)) {
					entries.push({parent: target, val: target[prop], key:prop});
					target = target[prop];
				}
				return entries;
			}, []);
			if (vals.length !== propPath.length) {
				return;
			}
			var entry = vals.pop();
			delete entry.parent[entry.key];
			while (vals.length > 0) {
				entry = vals.pop();
				if (Object.keys(entry.val).length > 0) {
					return;
				} else {
					delete entry.parent[entry.key];
				}
			}
		}

		function sanitize(oVizProperties) {
			var oResult = jQuery.extend(true, {}, oVizProperties);
			BLACKLIST.forEach(function(prop) {
				delete oResult[prop];
				deleteProp(oResult, prop.split("."));
			});
			return oResult;
		}
		return {
			sanitize: sanitize
		};
	})();

	/**
	 * Change Chart's properties.
	 * 
	 * Chart's properties will be updated with the parameter.
	 * 
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *	
	 * @param {object}
	 *			  oVizProperties object containing vizProperty values to update
	 * @public
	 */
	Chart.prototype.setVizProperties = function(oVizProperties) {
		oVizProperties = VizPropertiesHelper.sanitize(oVizProperties);
		this.setProperty("vizProperties", oVizProperties);
		if (this._getVizFrame()) {
			this._getVizFrame().setVizProperties(oVizProperties);
		}
	};

	/**
	 * Return Chart's properties.
	 * 
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 * 
	 * @returns {object} the Chart properties object
	 * @public
	 */
	Chart.prototype.getVizProperties = function() {
		var oVizFrame = this._getVizFrame();
		return VizPropertiesHelper.sanitize(oVizFrame ? oVizFrame.getVizProperties() : this.getProperty("vizProperties"));

	};
	
	/**
	 * Change Chart's scales.
	 * 
	 * Chart's scales will be updated with the parameters.
	 * 
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 *	
	 * @param {object[]}
	 *			  oVizScales array of vizScale objects
	 * @public
	 */
	Chart.prototype.setVizScales = function(oVizScales) {
		this.setProperty("vizScales", oVizScales);
		if (this._getVizFrame()) {
			this._getVizFrame().setVizScales(oVizScales);
		}
	};

	/**
	 * Return Chart's scales.
	 * 
	 * Refer to chart property <a href="../../vizdocs/index.html" target="_blank">documentation</a> for more details.
	 * 
	 * @returns {object[]} an array of scale objects
	 * @public
	 */
	Chart.prototype.getVizScales = function() {
		var oVizFrame = this._getVizFrame();
		return oVizFrame ? oVizFrame.getVizScales() : this.getProperty("vizScales");

	};
	
	// ******** Delegations of VizFrame API ********	
	/**
	 * Get the UID for Chart. It supports other controls to connect to a viz instance.
	 *
	 * @return {string} Chart UID
	 * @public
	 */
	Chart.prototype.getVizUid = function() {
		return this._getVizFrame().getVizUid();
	};
	
	/**
	 * Zoom the chart plot.
	 *
	 * Example:
	 * <pre>
	 *	var oChart = new sap.chart.Chart(...);
	 *	oChart.zoom({direction: "in"});
	 * </pre>
	 *
	 * @param {object} oConfig
	 *			  contains a "direction" attribute with value "in" or "out" indicating zoom to enlarge or shrink respectively
	 * @public
	 */
	Chart.prototype.zoom = function(oConfig) {
		this._getVizFrame().zoom(oConfig);
	};

	// ******** Delegations of VizFrame events ********
	var DELEGATED_EVENTS = ["selectData", "deselectData", "renderComplete"];
	Chart.prototype._delegateEvents = function() {
		if (this._delegateEventHandlers) {
			return;
		}
		var oVizFrame = this._getVizFrame();
		this._delegateEventHandlers = DELEGATED_EVENTS.map(function(sEvent) {
			var sName = sEvent.charAt(0).toUpperCase() + sEvent.slice(1);
			var handler = function(oEvent) {
				var oParameters = oEvent.getParameters();
				delete oParameters.id;
				this.fireEvent(sEvent, oParameters);
			};
			handler = handler.bind(this);
			
			oVizFrame["attach" + sName](null, handler);
			return {
				name: sName,
				handler: handler
			};
		}, this);
	};
	
	/**
	 * Returns the list of all chart types currently supported by chart control (subset of viz types)
	 *
	 * @public
	 * @returns {string[]} an array of all supported Chart types
	 */
	Chart.prototype.getChartTypes = function() {
		return ChartUtils.CONFIG.chartTypes.slice();		
	};
	
	/**
	 * Returns the list of available chart types with current Dimensions and Measures
	 *
	 * @public
	 * @returns {string[]} list of available chart types
	 */
	Chart.prototype.getAvailableChartTypes = function() {
		// this function needs to be re-implemented to leverage BVR service in wave 11
		// returns the list of available chart types, considering the current state
		var aAvailableChartTypes = [];
		var aChartTypes = this.getChartTypes();
		var vNumberOfDimensions = this.getVisibleDimensions().length;
		var vNumberOfMeasures = this.getVisibleMeasures().length;
		var sChartType = "";
		var bInvalid = false;
		for (var i = 0; i < aChartTypes.length; i++) {
			sChartType = aChartTypes[i];
			// apply some basic checks
			if ( sChartType == "pie" || sChartType == "donut" || sChartType == "heatmap" ) {
				bInvalid = vNumberOfMeasures != 1;
			} else if ( sChartType == "scatter" || sChartType == "treemap" ) {
				bInvalid = vNumberOfMeasures != 2;
			} else if ( sChartType == "bubble" ) {
				bInvalid = vNumberOfMeasures != 3;
			} else if ( sChartType.indexOf("stacked") != -1 ) {
				bInvalid = ( vNumberOfMeasures + vNumberOfDimensions ) < 3;
			} 
			if ( sChartType.indexOf("dual") != -1 || sChartType.indexOf("combination") != -1 || sChartType.indexOf("bullet") != -1 ) {
				bInvalid = vNumberOfMeasures < 2;
			}
			if (!bInvalid) {
				aAvailableChartTypes.push(aChartTypes[i]);
			}
		}
		return aAvailableChartTypes;
	};
	
	/*
	Chart.prototype._openContextMenu = function(oEvent) {
		var oMenu = this.getContextMenu();
		var bKeyboard = oEvent.type == "keyup";
		var eDock = sap.ui.core.Popup.Dock;
		var oSource = oEvent.getSource();
		oMenu.open(bKeyboard, oSource, eDock.BeginTop, eDock.BeginBottom, oSource);
	};
	
	Chart.prototype._initContextMenu = function()  {
		if (! this._mContextMenuItem){
			this._mContextMenuItem = {};
		}
		if (! this._mDimensionMenuItem){
			this._mDimensionMenuItem = {};
		}
		if (! this._mChartTypeMenuItem){
			this._mChartTypeMenuItem = {};
		}
		var oContextMenu = new Menu(this.getId() + "-ContextMenu");
		var aItems = this._getContextMenuItems(oContextMenu.sId);
		for (var i = 0; i < aItems.length; i++) {
			var aSubItems = this._getContextMenuItems(aItems[i].sId);
			if (aSubItems && aSubItems.length > 0 ) {
				var oSubmenu = new Menu();
				for (var j = 0; j < aSubItems.length; j++) {
					oSubmenu.addItem(aSubItems[j]);
				}
				aItems[i].setSubmenu(oSubmenu);
			};
			oContextMenu.addItem(aItems[i]);
		}
		this.setContextMenu(oContextMenu);
	};
	
	Chart.prototype.getContextMenu = function() {
		// initialize context menu on first get request (may come from hosting app )
		if (!this.getAggregation("contextMenu")) {
			this._initContextMenu();
		}
		return this.getAggregation("contextMenu");
	};

	Chart.prototype.ngetContextMenuItems = function() {
		this.getContextMenu(); // make sure it is initialized
		
		return this._mContextMenuItem;
	};
	
	Chart.prototype._getContextMenuItems = function(sId) {
		var aItems = [];
		var that = this;
		var sSubId = sId.slice(sId.indexOf("-")+1);
		var sSubIdLast = sId.slice(sId.lastIndexOf("-")+1);
		
		if (sSubIdLast == "ContextMenu") {
			
			// add drill down sub menu
			this._mDimensionMenuItem["@@drillDownMenuItem@@"] = this._createContextMenuItem(
				sSubId + "-DrillDownBy", "Drill Down By", null, null,	null, null
			);
			aItems.push(this._mDimensionMenuItem["@@drillDownMenuItem@@"]);
			this._mContextMenuItem["DRILL_DOWN"] = this._mDimensionMenuItem["@@drillDownMenuItem@@"];
			
			// add drill up item
			this._mDimensionMenuItem["@@drillUpMenuItem@@"] = this._createContextMenuItem(
				sSubId + "-DrillUp", "Drill Up",	null, null, null, function() {
					that.drillUp();
				}
			);
			aItems.push(this._mDimensionMenuItem["@@drillUpMenuItem@@"]);
			this._mContextMenuItem["DRILL_UP"] = this._mDimensionMenuItem["@@drillUpMenuItem@@"];
			
			// add chart types sub menu
			var oSubMenu = this._createContextMenuItem(
				sSubId + "-ChartType", "Set Chart Type", null, null, null, null
			);

			oSubMenu.getSubmenu = function() {
				// update menu items for available chart types 
				var aAvailableChartTypeName = that.getAvailableChartTypes();
				for (var sChartTypeMenuItemName in that._mChartTypeMenuItem) {
					var bIsAvailable = aAvailableChartTypeName.indexOf(sChartTypeMenuItemName) != -1;
					that._mChartTypeMenuItem[sChartTypeMenuItemName].setVisible(bIsAvailable);
				}
				that._mChartTypeMenuItem[that.getProperty("chartType")].setVisible(false);
				
				// this._mChartTypeMenuItem
				return sap.ui.unified.MenuItemBase.prototype.getSubmenu.apply(this);
			}
			aItems.push(oSubMenu);
			this._mContextMenuItem["SET_CHART_TYPE"] = oSubMenu;
		} else if (sSubIdLast == "ChartType") {
			
			var aChartTypes = this.getChartTypes();
			for (var i = 0; i < aChartTypes.length; i++) {
				this._mChartTypeMenuItem[aChartTypes[i]] = this._createContextMenuItem(
					sSubId + "-" + aChartTypes[i], 
					that.getChartTypeLabel(aChartTypes[i]),
					null,
					"chartType",
					aChartTypes[i],
					function(oEvent) {
						that.setChartType(oEvent.getParameter("item").data("chartType"));
						//							that._updateFeeds();
					}
				);
				aItems.push(this._mChartTypeMenuItem[aChartTypes[i]]);
			}
			
		} else if (sSubIdLast == "DrillDownBy" ) {
			var aAggregationDimensions = this.getDimensions();
			var aVisibleDimensions = this.getVisibleDimensions();
			var mVisibleDimensionNames = aVisibleDimensions.reduce(function(oResult, oDimension) {
				oResult[oDimension.getName()] = oDimension;
				return oResult;
			}, {});
			
			// create drill down menu items
			for (var i = 0; i < aAggregationDimensions.length; i++) {
				var oDimension = aAggregationDimensions[i];
				this._mDimensionMenuItem[oDimension.getName()] = this._createContextMenuItem(
					sSubId + "-" + oDimension.getName(), 
					oDimension.getLabel(), 
					null,
					"dimensionName",
					oDimension.getName(),
					function(oEvent) {
						oEvent.oSource.setVisible(false);
						that.drillDown(oEvent.getParameter("item").data("dimensionName"));
					}
				); // TODO change to ID
				if (mVisibleDimensionNames[oDimension.getName()]) {
					this._mDimensionMenuItem[oDimension.getName()].setVisible(false);
				}
				aItems.push(this._mDimensionMenuItem[oDimension.getName()]);
			}		
		}
		
		return aItems;
	};
	
	Chart.prototype._createContextMenuItem = function(sId, sTextI18nKey, sIcon, sDataKey, sDataValue, fHandler) {
		return new MenuItem(this.getId() + "-" + sId, {
			text: sTextI18nKey, //this.oResBundle.getText(sTextI18nKey),
			icon: sIcon ? "sap-icon://" + sIcon : null,
			customData: [{key: sDataKey, value: sDataValue}],
			select: fHandler || function() {}
		});
	};
	*/
	
	// ---------------- Hosted VizProperties ----------------
	Chart.prototype._hostedVizProperties = {
		selectionMode: {prop: "interaction.selectability.mode"},
		selectionBehavior: {prop: "interaction.selectability.behavior"}
	};
	
	Chart.prototype._getHostedVizProperties = function() {
		var that = this;
		return Object.keys(that._hostedVizProperties).reduce(function(obj, prop) {
			var oSubProp = that._hostedVizProperties[prop].prop.split(".").reverse().reduce(function(obj, path) {
				var result = {};
				result[path] = obj;
				return result;
			}, that.getProperty(prop));
			return jQuery.extend(true, obj, oSubProp);
		}, {});
	};
	
	Chart.prototype.setSelectionMode = ChartUtils.hostVizPropertySetter("selectionMode", "interaction.selectability.mode", {
		convert: function(s) {
			return s ? s.toUpperCase() : s;
		},
		validate: function(s) {
			return ["INCLUSIVE", "EXCLUSIVE"].indexOf(s) !== -1;
		}
	});
	Chart.prototype.getSelectionMode = ChartUtils.hostVizPropertyGetter("selectionMode", "interaction.selectability.mode");
	Chart.prototype.setSelectionBehavior = ChartUtils.hostVizPropertySetter("selectionBehavior", "interaction.selectability.behavior", {
		convert: function(s) {
			return s ? s.toUpperCase() : s;
		},
		validate: function(s) {
			return ["DATAPOINT", "CATEGORY", "SERIES"].indexOf(s) !== -1;
		}
	});
	Chart.prototype.getSelectionBehavior = ChartUtils.hostVizPropertyGetter("selectionBehavior", "interaction.selectability.behavior");	

	// ---------------- Public Helpers ----------------
	/**
	 * Return Dimension with the given name.
	 *
	 * @param {string} sName name of the Dimension to get
	 * @public
	 * @return {sap.chart.data.Dimension} Dimension of the specified name.
	 */
	Chart.prototype.getDimensionByName = function(sName) {
		return this.getDimensions().filter(function(d) {return d.getName() === sName;})[0];
	};
	/**
	 * Return Measure with the given name.
	 *
	 * @param {string} sName name of the Measure to get
	 * @public
	 * @return {sap.chart.data.Measure} Measure of the specified name.
	 */
	Chart.prototype.getMeasureByName = function(sName) {
		return this.getMeasures().filter(function(m) {return m.getName() === sName;})[0];
	};
	
	return Chart;
});
