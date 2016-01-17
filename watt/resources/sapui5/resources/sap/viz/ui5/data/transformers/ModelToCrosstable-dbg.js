/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(function() {
	"use strict";

	var ModelToCrosstable = function() {
	    this.reset();
	};

	ModelToCrosstable.prototype.reset = function(oOther) {
	    this._oVIZCrosstab = null;
	    this._aCrossContextLookup = null;
	};

	ModelToCrosstable.prototype.getVizDataset = function(oBinding, dimensions, measures, defaultSelectionInfo, info) {
	    if (!this._oVIZCrosstab && sap.viz.__svg_support) {
	        this._createVIZCrosstab(oBinding, dimensions, measures, defaultSelectionInfo, info);
	    }
	    return this._oVIZCrosstab || null;
	};

	ModelToCrosstable.prototype.findContext = function(oCriteria) {
	    if (this._aCrossContextLookup && typeof oCriteria === 'object') {
	        return this._aCrossContextLookup[oCriteria.dii_a2] && this._aCrossContextLookup[oCriteria.dii_a2][oCriteria.dii_a1];
	    }
	};

	ModelToCrosstable.prototype._createVIZCrosstab = function(oBinding, dimensions, measures, defaultSelectionInfo, info) {
	    var aContexts = oBinding && oBinding.getContexts(0, oBinding.getLength());

	    // if there is no data, then there must be no crosstab. Charts will render "no data" then.
	    if (!aContexts || aContexts.length === 0) {
	        this.reset();
	        return;
	    }

	    var aAxis1 = [], aAxis2 = [], aMeasures = [], data = [], aContextLookup = [];

	    // transform dimension definitions into a structure more suitable for our
	    // transformation
	    jQuery.each(dimensions, function(i, oColumn) {
	        if (oColumn.getAxis() === 1) {
	            aAxis1.push({
	                def : oColumn,
	                adapter : oColumn._getAdapter()
	            });
	        } else if (oColumn.getAxis() === 2) {
	            aAxis2.push({
	                def : oColumn,
	                adapter : oColumn._getAdapter()
	            });
	        } else {
	            throw new Error("currently, only axis 1 and 2 are supported");
	        }
	    });

	    // create empty data array for each measure
	    jQuery.each(measures, function(i, oColumn) {
	        aMeasures.push({
	            def : oColumn,
	            adapter : oColumn._getAdapter()
	        });
	        data.push([]);
	    });

	    // reads all values for a dimension definition from the model,
	    // combines them into a tuple and searches that tuple in the list of known
	    // values for that dimension. If it is found, the corresponding index
	    // is returned. If not, the tuple is added at the end and the new index is
	    // returned.
	    function getAxisIndex(aAxisDef, aAxisValues, oContext) {
	        var l = aAxisDef.length, aValues, i;

	        if (l === 0) {
	            return 0;
	        }

	        // extracts the key value for one dimension based on the given set of
	        // dimension components
	        aValues = [];
	        for ( i = 0; i < l; i++) {
	            aValues.push(aAxisDef[i].adapter(oContext));
	        }

	        // search the key value in the list of already known values
	        // TODO PERFOPT: search is only needed when more than one axis is
	        // defined and only because it is
	        // not clear in what order the combinations of axis values are
	        // enumerated in the model.
	        // It could be x1y1,x2y1,..xNy1,x1y2,... or x1y1,x1y2,...x1yM,x2y1,...
	        // or totally unsorted.
	        for ( i = 0, l = aAxisValues.length; i < l; i++) {
	            if (jQuery.sap.equal(aAxisValues[i], aValues)) {
	                return i;
	            }
	        }
	        // if not found, add it
	        aAxisValues.push(aValues);
	        return aAxisValues.length - 1;
	    }

	    var aAxis1DataSet = [];
	    var aAxis2DataSet = [];

	    // analyze data
	    jQuery.each(aContexts, function(iIndex, oContext) {
	        // TODO Distinguish 3 cases for better performance:
	        // 1. both axes are defined, use code below
	        // 2. only one axis is defined, use the getAxisIndex
	        // without search + a fixed 0 for the second axis
	        // 3. if no axes are defined, use an incrementing index
	        // for the first axis and 0 for the second
	        // The decision between the three cases can be taken
	        // outside the loop.
	        var iAxis1Index = getAxisIndex(aAxis1, aAxis1DataSet, oContext);
	        var iAxis2Index = getAxisIndex(aAxis2, aAxis2DataSet, oContext);
	        for (var i = 0; i < aMeasures.length; i++) {
	            var value = aMeasures[i].adapter(oContext);
	            // If both aa1 and aa2 is empty, viz dataset should
	            // be created correctly and only with measure
	            // values.
	            if (aAxis1.length === 0 && aAxis2.length === 0) {
	                if (data[i][0] === undefined) {
	                    data[i][0] = [];
	                }
	                data[i][0].push(value);
	            } else {
	                (data[i][iAxis2Index] = (data[i][iAxis2Index] || []))[iAxis1Index] = value;
	            }
	        }
	        if (aAxis1.length === 0 && aAxis2.length === 0) {
	            iAxis1Index = iIndex;
	        }
	        // remember the oContext for the current coordinates
	        (aContextLookup[iAxis2Index] || (aContextLookup[iAxis2Index] = []))[iAxis1Index] = oContext;
	    });

	    // fill any gaps
	    var iLengthAxis1 = aAxis1DataSet.length;
	    var iLengthAxis2 = Math.max(aAxis2DataSet.length, 1);
	    for (var j = 0; j < iLengthAxis2; j++) {
	        for (var i = 0; i < aMeasures.length; i++) {
	            // first ensure that a data array exists for each value of axis2
	            var d = data[i][j];
	            if (!d) {
	                d = data[i][j] = [];
	            }
	            // then ensure that each array has the length of axis1
	            if (d.length < iLengthAxis1) {
	                d[iLengthAxis1 - 1] = undefined;
	            }
	        }
	        // also ensure that a lookup array exists for each value of axis2
	        if (!aContextLookup[j]) {
	            aContextLookup[j] = [];
	        }
	        // ensure that the lookup array has the length of axis1
	        if (!aContextLookup[j].length < iLengthAxis1) {
	            aContextLookup[j][iLengthAxis1] = undefined;
	        }
	    }

	    // start creating the dataset
	    // If no dimension or no measure definition, viz dataset should also no
	    // 'analysisAxis' or 'measureValuesGroup'.
	    var dataset = {};

	    // convert data for axis1
	    if (aAxis1.length > 0) {
	        if (dataset.analysisAxis === undefined) {
	            dataset.analysisAxis = [];
	        }
	        var axis = {
	            index : 1,
	            data : []
	        };
	        // process component by component for the axis1 dimension
	        for (var i = 0; i < aAxis1.length; i++) {
	            // collect values for the dimension component 'i'
	            var values = [];
	            for (var j = 0; j < aAxis1DataSet.length; j++) {
	                values[j] = aAxis1DataSet[j][i];
	            }
	            // create an axis component from the collected data and the
	            // specified label
	            axis.data.push({
	                name : aAxis1[i].def.getName(),
	                values : values
	            });
	        }
	        // add axis to dataset
	        dataset.analysisAxis.push(axis);
	    }

	    // do the same for axis2
	    // TODO generalize to N axes, will reduce code as well. But maybe throw
	    // error above for more than two axes (limit of crosstab?)
	    if (aAxis2.length > 0) {
	        if (dataset.analysisAxis === undefined) {
	            dataset.analysisAxis = [];
	        }
	        var axis = {
	            index : 2,
	            data : []
	        };
	        for (var i = 0; i < aAxis2.length; i++) {
	            var values = [];
	            for (var j = 0; j < aAxis2DataSet.length; j++) {
	                values[j] = aAxis2DataSet[j][i];
	            }
	            axis.data.push({
	                name : aAxis2[i].def.getName(),
	                values : values
	            });
	        }
	        dataset.analysisAxis.push(axis);
	    }

	    // now that the dimension lengths are known, transform measures to
	    // crosstable
	    if (aMeasures.length > 0) {
	        dataset.measureValuesGroup = [];

	        for (var i = 0; i < aMeasures.length; i++) {
	            if (!dataset.measureValuesGroup[aMeasures[i].def.getGroup() - 1]) {
	                dataset.measureValuesGroup[aMeasures[i].def.getGroup() - 1] = {
	                    index : aMeasures[i].def.getGroup(),
	                    data : []
	                };
	            }
	            dataset.measureValuesGroup[aMeasures[i].def.getGroup() - 1].data.push({
	                name : aMeasures[i].def.getName(),
	                values : data[i]
	            });
	        }

	        // Viz don't handle mg array with undefined.
	        for (var i = 0, len = dataset.measureValuesGroup.length; i < len; i++) {
	            if (dataset.measureValuesGroup[i] === undefined) {
	                throw new Error("Measure Group " + (i + 1) + " is missing.");
	                break;
	            }
	        }
	    }

	    // finally create the VIZ crosstab from the transformed data
		this._oVIZCrosstab = new sap.viz.api.data.CrosstableDataset();
	    this._oVIZCrosstab.data(dataset);
	    if (defaultSelectionInfo) {
	        this._oVIZCrosstab.info(defaultSelectionInfo);
	    }
	    if (info) {
	        this._oVIZCrosstab.info(info);
	    }
	    this._aCrossContextLookup = aContextLookup;
	};


	return ModelToCrosstable;

}, /* bExport= */ true);
