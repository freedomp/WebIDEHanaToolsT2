/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	'sap/viz/ui5/data/DimensionDefinition',
	'sap/viz/ui5/data/MeasureDefinition',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/viz/ui5/controls/common/feeds/AnalysisObject'
], function(
	DimensionDefinition,
	MeasureDefinition,
	FeedItem,
	AnalysisObject
) {

	var suggestFeeds = sap.viz.vizservices.BVRService.suggestFeeds;
	var validateFeeds = function(chartType, feedItems) {
		return sap.viz.vizservices.FeedService.validate(chartType, suggestFeeds(chartType, feedItems, [{id:"MND",type:"MND"}]).feedItems);
	};
	
	var _mRoleFeedMapping = [
		{"types":"*","toViz":{"category|category2":"categoryAxis","series":"color","axis1":"valueAxis"}},
		{"types":"column|bar|stacked_bar|stacked_column|line|combination|100_stacked_bar|100_stacked_column|stacked_combination|horizontal_stacked_combination","toViz":{"axis2|axis3":"valueAxis"}},
		{"types":"scatter|bubble|time_bubble|timeseries_scatter|timeseries_bubble","toViz":{"series":"series","category|category2":"series","axis1":"valueAxis","axis2":"valueAxis2"}},
		{"types":"bubble|time_bubble","toViz":{"axis3":"bubbleWidth"}},
		{"types":"pie|donut","toViz":{"category|series|category2":"color","axis1|axis2|axis3":"size"}},
		{"types":"bullet|vertical_bullet","toViz":{"axis1":"actualValues","axis2":"targetValues","axis3":"forecastValues","axis4":"additionalValues"}},
		{"types":"dual_combination|dual_stacked_bar|100_dual_stacked_bar|dual_stacked_column|100_dual_stacked_column|dual_bar|dual_column|dual_line|dual_stacked_combination|dual_horizontal_stacked_combination","toViz":{"axis1":"valueAxis","axis2":"valueAxis2","axis3":"valueAxis2"}},
		{"types":"timeseries_line","toViz":{"category":"timeAxis", "axis1|axis2|axis3":"valueAxis"}},
		{"types":"timeseries_scatter","toViz":{"category":"timeAxis","axis2|axis3":false}},
		{"types":"timeseries_bubble","toViz":{"category":"timeAxis","axis2":false,"axis3":"bubbleWidth"}},
		{"types":"heatmap","toViz":{"category":"categoryAxis","category2":"categoryAxis2","axis1|axis2|axis3":"color"}}
	].reduce(function(m, row) {
		var cfg = Object.keys(row.toViz).reduce(function(cfg, roles) {
			roles.split("|").forEach(function(r) {
				cfg[r] = row.toViz[roles];
				return cfg;
			});
			return cfg;
		}, {});
		row.types.split("|").forEach(function(type) {
			if (!m.hasOwnProperty(type)) {
				m[type] = [];
			}
			m[type].push(cfg);
		});
		return m;
	}, {});
	
	var _mRoleLookUp = Object.keys(_mRoleFeedMapping).reduce(function(m, type) {
		if (type !== "*") {
			m[type] = jQuery.extend.apply(null, [true, {}].concat(_mRoleFeedMapping["*"].concat(_mRoleFeedMapping[type])));
		}
		return m;
	}, {});

	function _groupBy(aList, oKey) {
		var keyFn = (typeof oKey === "function") ? oKey : function(obj) {
			return obj[oKey];
		};
		return aList.reduce(function(oGrouped, oElement) {
			var key = keyFn(oElement);
			if (!oGrouped[key]) {
				oGrouped[key] = [oElement];
			} else {
				oGrouped[key].push(oElement);
			}
			return oGrouped;
		}, {});
	}

	function _sorter(aList, keyFn) {
		return aList.reduce(function(map, elem, idx) {
			map[keyFn(elem)] = idx;
			return map;
		}, {});
	}

	function _calibrate(mDef, aDimsOrMsrs) {
		var oGrouped = _groupBy(aDimsOrMsrs, function(oDorM) {return oDorM.getRole();});		
		return Object.keys(oGrouped).reduce(function(oResult, sRole) {
			if (mDef[sRole]) {
				var sFeeding = mDef[sRole];
				if (!oResult.hasOwnProperty(sFeeding)) {
					oResult[sFeeding] = [];
				}
				oResult[sFeeding] = oResult[sFeeding].concat(oGrouped[sRole]);
				delete oGrouped[sRole];
			}
			return oResult;
		}, {});
	}

	var _TIMESERIES_EDM_TYPES = {
		"Edm.DateTime": true
	};
	var _TIMESERIES_CHT_TYPES = {
		timeseries_line: true,
		timeseries_bubble: true,
		timeseries_scatter: true
	};
    var _CHT_WITH_TIMESERIES_ALTERNATIVES = {
        line: "timeseries_line"
    };
	function inferTimeSeries(aCategoryDimensions, aDimensionMetas) {
		if (aCategoryDimensions.length !== 1) {
			return false;
		}
		var oMeta = aDimensionMetas.filter(function(oDimMeta) {
			return oDimMeta.getName() === aCategoryDimensions[0];
		})[0];

		if (!oMeta) {
			return false;
		}

		return _TIMESERIES_EDM_TYPES[oMeta.getKeyProperty().type];
	}

	function feedItemFmt(sType, mDimsOrMrs) {
		return function(sId) {
			return new FeedItem({
				uid: sId,
				type: sType,
				values: mDimsOrMrs[sId].map(function(oDorM) {
					return oDorM.getName();
				})
			});
		};
	}

	function analysisObjectFmt(sType, mDataTypes) {
		return function(oDorM) {
			var analysisObj = {
				id: oDorM.getName(),
				name: oDorM.getName(),
				type: sType
			};
			if (sType === "Dimension" && _TIMESERIES_EDM_TYPES[mDataTypes[analysisObj.id]]) {
				analysisObj.dataType = "Date";
			}
			return analysisObj;
		};
	}

	function wrapDimension(oDimension) {
		var sName = oDimension.getName(),
			sLabel = oDimension.getLabel(),
			sText = oDimension.getTextProperty(),
			fFormatter = oDimension.getTextFormatter(),
			bDisplyaText = oDimension.getDisplayText();
		var oDimConfig = {
			identity: sName,
			name: sLabel || sName,
			value: "{" + sName + "}"
		};

		if (typeof fFormatter === "function") {
			oDimConfig.displayValue = {
				formatter: fFormatter,
				parts: [{
					path: sName,
					type: new sap.ui.model.type.String()
				}]
			};
			if (sText) {
				oDimConfig.displayValue.parts.push({
					path: sText,
					type: new sap.ui.model.type.String()
				});
			}
		} else if (bDisplyaText && sText) {
			oDimConfig.displayValue = "{" + sText + "}";
		}

		return new DimensionDefinition(oDimConfig);
	}

	function wrapMeasure(oMeasure) {
		var sName = oMeasure.getName(),
			sUnit = oMeasure.getUnitBinding(),
			sValueFormat = oMeasure.getValueFormat();
		
		var cfg = {
			identity: sName,
			name: oMeasure.getLabel() || sName,
			value: "{" + sName + "}"
		};
		
		var pattern = [];
		if (sUnit) {
			pattern.push(sUnit);
			pattern.push(sValueFormat ? sValueFormat : "#");
		} else if (sValueFormat) {
			pattern.push(sValueFormat);
		}
		
		if (pattern.length > 0) {
			cfg.format = pattern.join(" ");
		}
		return new MeasureDefinition(cfg);
	}

	function fit(sChartType, aDimensions, aMeasures, sSeriesFeedingId, mDataTypes) {
		var mRoleToFeed = _mRoleLookUp[sChartType];
		var mDims = _calibrate(mRoleToFeed, aDimensions),
			mMsrs = _calibrate(mRoleToFeed, aMeasures);

		if (mDims.series) {
			mDims[sSeriesFeedingId] = mDims.series;
			delete mDims.series;
		}
		var aEffectiveFeeds = Object.keys(mDims).filter(function(sId) {
			return mDims[sId] && mDims[sId].length > 0;
		}).map(feedItemFmt("Dimension", mDims)).concat(Object.keys(mMsrs).filter(function(sId) {
			return mMsrs[sId] && mMsrs[sId].length > 0;
		}).map(feedItemFmt("Measure", mMsrs)));

		var aLWFeeds = FeedItem.toLightWeightFmt(aEffectiveFeeds),
			oValidation = validateFeeds("info/" + sChartType, aLWFeeds);
		var aFeeds = oValidation.valid ? aEffectiveFeeds : fix(sChartType, oValidation, aLWFeeds, aDimensions, aMeasures, mDataTypes),
			mVisibles = aFeeds.reduce(function(map, f) {
				f.getValues().forEach(function(v) {
					map[(v instanceof AnalysisObject) ? v.getUid() : v] = true;
				});
				return map;
			}, {});
		
		aFeeds._unused = aDimensions.concat(aMeasures).filter(function(n) {
			return !mVisibles[n.getName()];
		}).map(function(n) {
			return n.getName();
		});
		
		aFeeds._def = createDefinitions(aDimensions, aMeasures, mVisibles);
		if (_TIMESERIES_CHT_TYPES[sChartType]) {
			defineTimeDataType(aFeeds);
		}
		
		return aFeeds;
	}

	function fix(sChartType, oValidation, aEffectiveFeeds, aDimensions, aMeasures, mDataTypes) {
		var oMetadata = sap.viz.api.metadata.Viz.get("info/" + sChartType),
			mBindings = _groupBy(oMetadata.bindings, "id"),
			bDimError = false,
			bMsrError = false;
		Object.keys(oValidation.results.bindings).forEach(function(k) {
			if (!mBindings[k]) {
				return;
			}
			if (mBindings[k][0].type === "Measure") {
				bMsrError = true;
			}
			if (mBindings[k][0].type === "Dimension") {
				bDimError = true;
			}
		});
		var aGoodFeeds = aEffectiveFeeds.filter(function(feed) {
			return !((feed.type === "Dimension") ? bDimError : bMsrError);
		}), mGoodDimOrMsr = aGoodFeeds.reduce(function(map, feed) {
			(feed.values || []).forEach(function(v) {
				map[v.id] = true;
			});
			return map;
		}, {});
		var aDimAnalysisObjs = aDimensions.map(analysisObjectFmt("Dimension", mDataTypes)),
			aMsrAnalysisObjs = aMeasures.map(analysisObjectFmt("Measure")),
			mDimSorting = _sorter(aDimensions, function(o) {
				return o.getName();
			}),
			mMsrSorting = _sorter(aMeasures, function(o) {
				return o.getName();
			});
		aDimAnalysisObjs.sort(function(a, b) {return mDimSorting[a.id] - mDimSorting[b.id];});
		aMsrAnalysisObjs.sort(function(a, b) {return mMsrSorting[a.id] - mMsrSorting[b.id];});
		var aSuggested = suggestFeeds("info/" + sChartType, aGoodFeeds, aDimAnalysisObjs.concat(aMsrAnalysisObjs).filter(function(ao) {
			return !mGoodDimOrMsr[ao.id];
		})).feedItems;
		aSuggested.forEach(function(oFeed) {
			oFeed.type = mBindings[oFeed.id][0].type;
		});

		return FeedItem.fromLightWeightFmt(aSuggested);
	}

	function createDefinitions(aDimensions, aMeasures, mVisibles) {
		return {
			dim: aDimensions.reduce(function(aVisibleDimDefs, oDim) {
				if (mVisibles[oDim.getName()]) {
					aVisibleDimDefs.push(wrapDimension(oDim));
				}
				return aVisibleDimDefs;
			}, []),
			msr: aMeasures.reduce(function(aVisibleMsrDefs, oMsr) {
				if (mVisibles[oMsr.getName()]) {
					aVisibleMsrDefs.push(wrapMeasure(oMsr));
				}
				return aVisibleMsrDefs;
			}, [])
		};
	}

	function defineTimeDataType(aFeeds) {
		var oTimeFeed = aFeeds.filter(function(oFeed) {
			return oFeed.getUid() === "timeAxis";
		})[0],
			aTimeDims = oTimeFeed.getValues().map(function(o) {
				return (typeof o === "string") ? o : o.getUid();
			});
		aFeeds._def.dim.forEach(function(oDim) {
			if (aTimeDims.indexOf(oDim.getIdentity()) !== -1) {
				oDim.setDataType("Date");
			}
		});
	}
	
	return {
		fit: fit
	};
});










