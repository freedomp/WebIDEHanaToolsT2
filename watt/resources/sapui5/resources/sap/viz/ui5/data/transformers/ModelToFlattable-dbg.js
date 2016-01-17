/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(function() {
	"use strict";

	var ModelToFlattable = function() {
		this.reset();
	};

	ModelToFlattable.prototype.reset = function(oOther) {
		this._oVIZFlatTable = null;
		this._aFlatContextLookup = null;
	};


	ModelToFlattable.prototype.getVizDataset = function(oBinding, dimensions, measures, defaultSelectionInfo, info, dataBindingInfo) {
	    if (!this._oVIZFlatTable && sap.viz.__svg_support) {
	        this._createVIZFlatTable(oBinding, dimensions, measures, dataBindingInfo);
	    }
	    return this._oVIZFlatTable || null;
	};

	ModelToFlattable.prototype.findContext = function(oCriteria) {
		if (this._aFlatContextLookup && typeof oCriteria === 'object' && oCriteria._context_row_number !== undefined) {
			return this._aFlatContextLookup[oCriteria._context_row_number];
		}
	};

	ModelToFlattable.prototype._createVIZFlatTable = function(oBinding, dimensions, measures, dataBindingInfo) {
	    var index = (!dataBindingInfo || dataBindingInfo.startIndex === undefined) ? 0 : dataBindingInfo.startIndex;
	    var len;
	    if(!dataBindingInfo || dataBindingInfo.length === undefined){
	    	if(oBinding){
	    		len = oBinding.getLength();
	    	}
	    } else {
    		len = dataBindingInfo.length;
	    }
		var aContexts = oBinding && oBinding.getContexts(index, len);

	    var aAxis = [], aMeasures = [], flatTableDS = {
	        'metadata' : {
	            'fields' : [],
	            'context' : '_context_row_number'
	        },
	        'data' : []
	    }, aContextLookup = [];

	    jQuery.each(dimensions, function(i, oColumn) {
	        aAxis.push({
	            def : oColumn,
	            vAdapter : oColumn._getAdapter(),
	            dAdapter : oColumn._getDisplayValueAdapter()
	        });
	        var dataType = oColumn.getDataType();
	        flatTableDS.metadata.fields.push({
	            'id' : oColumn.getIdentity() || oColumn.getName(),
	            'name' : oColumn.getName() || oColumn.getIdentity(),
	            'semanticType' : 'Dimension',
	            'dataType': dataType
	        });
	    });

		jQuery.each(measures, function(i, oColumn) {
			aMeasures.push({
				def : oColumn,
				adapter : oColumn._getAdapter()
			});
			var cfg = {
				'id' : oColumn.getIdentity() || oColumn.getName(),
				'name' : oColumn.getName() || oColumn.getIdentity(),
				'semanticType' : 'Measure'
			};
			
			if (oColumn.getFormat()) {
				cfg.formatString = oColumn.getFormat();
			}
			flatTableDS.metadata.fields.push(cfg);
		});

		var nTop, aContexts;
            
		if (oBinding) {
			nTop = len;
			aContexts = oBinding.getContexts(index, nTop);
            var AnalyticalBinding = sap.ui.require("sap/ui/model/analytics/AnalyticalBinding");
			if (AnalyticalBinding && oBinding instanceof AnalyticalBinding && aContexts.length > 0 && nTop === 0) {
				// This is a issue of AnalyticalBinding, when data has just been received, the getLength() will not return
				// the updated length until the binding._oRootNode has been created by the getContexts() call.
				nTop = oBinding.getLength();
				aContexts = oBinding.getContexts(0, nTop);
			}
		}
		// handle no data
        if (!aContexts || aContexts.length === 0) {
            this.reset();
            this._oVIZFlatTable = new sap.viz.api.data.FlatTableDataset(flatTableDS);
            return;
        }

	    // analyze data
	    jQuery.each(aContexts, function(iIndex, oContext) {
	        if (!flatTableDS.data[iIndex]) {
	            flatTableDS.data[iIndex] = [];
	        }
	        for (var i = 0; i < aAxis.length; i++) {
	            var value = aAxis[i].vAdapter(oContext);
	            if (value instanceof Date) {
					value = value.getTime();
				}
	            var dValueObj = aAxis[i].dAdapter(oContext);
	            flatTableDS.data[iIndex].push(
	                dValueObj.enableDisplayValue ? 
	                {v: value, d: dValueObj.value} : value
	            );
	        }
	        for (var j = 0; j < aMeasures.length; j++) {
	            var value = aMeasures[j].adapter(oContext);
	            flatTableDS.data[iIndex].push(value);
	        }
	        aContextLookup[iIndex] = oContext;
	    });
	    this._aFlatContextLookup = aContextLookup;

	    // finally create the VIZ flat table from the transformed data
	    this._oVIZFlatTable = new sap.viz.api.data.FlatTableDataset(flatTableDS);
	};


	return ModelToFlattable;

}, /* bExport= */ true);
