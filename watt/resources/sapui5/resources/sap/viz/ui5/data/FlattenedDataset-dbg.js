/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.viz.ui5.data.FlattenedDataset.
sap.ui.define(['sap/viz/library','./Dataset'],
	function(library, Dataset) {
	"use strict";

	/**
	 * Constructor for a new ui5/data/FlattenedDataset.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A dataset for flattened (redundant) data using a tabular format.
	 * @extends sap.viz.ui5.data.Dataset
	 *
	 * @constructor
	 * @public
	 * @since 1.7.2
	 * @experimental Since version 1.7.2. 
	 * Charting API is not finished yet and might change completely
	 * @name sap.viz.ui5.data.FlattenedDataset
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlattenedDataset = Dataset.extend("sap.viz.ui5.data.FlattenedDataset", /** @lends sap.viz.ui5.data.FlattenedDataset.prototype */ { metadata : {

		library : "sap.viz",
		aggregations : {

			/**
			 * List of definitions of all dimensions in this dataset
			 */
			dimensions : {type : "sap.viz.ui5.data.DimensionDefinition", multiple : true, singularName : "dimension"}, 

			/**
			 * list of definitions of all measures in this dataset
			 */
			measures : {type : "sap.viz.ui5.data.MeasureDefinition", multiple : true, singularName : "measure"}, 

			/**
			 * Data containing dimensions and measures.
			 * 
			 * <b>Note:</b> This aggregation can only be bound against a model, it cannot be managed
			 * programmatically using the aggregation mutator methods like addData.
			 */
			data : {type : "sap.ui.core.Element", multiple : true, singularName : "data", bindable : "bindable"}
		}
	}});

	// enable calling 'bindAggregation("data")' without a factory
	FlattenedDataset.getMetadata().getAllAggregations()["data"]._doesNotRequireFactory = true;

	FlattenedDataset.prototype.init = function() {
	    this._transformer = null;
	};

	FlattenedDataset.prototype.updateData = function() {
	    this.invalidate();
	};

	// override standard aggregation methods for 'data' and report an error when they are used
	jQuery.each("add get indexOf insert remove removeAll".split(" "), function(i, sMethod) {
	    var sMessage = "FlattenedDataset manages the 'data' aggregation only via data binding. The method '" + sMethod + "Data' therefore cannot be used programmatically!";
	    FlattenedDataset.prototype[sMethod + "Data"] = function() {
	        jQuery.sap.log.error(sMessage);
	    };
	});

	/**
	 * @returns sap.viz.api.data.FlatTableDataset
	 */
	FlattenedDataset.prototype.getVIZFlatDataset = function() {
		jQuery.sap.require('sap.viz.ui5.data.transformers.ModelToFlattable');
	    return this._transform(sap.viz.ui5.data.transformers.ModelToFlattable);
	};

	/**
	 * @returns sap.viz.api.data.CrosstableDataset
	 */
	FlattenedDataset.prototype.getVIZCrossDataset = function() {
		jQuery.sap.require('sap.viz.ui5.data.transformers.ModelToCrosstable');
	    return this._transform(sap.viz.ui5.data.transformers.ModelToCrosstable);
	};

	/**
	 * @returns sap.viz.data.CrosstableDataset
	 */
	FlattenedDataset.prototype.getVIZDataset = function() {
	    var result;
	    try {
	    	jQuery.sap.require('sap.viz.ui5.data.transformers.ModelToDataset');
	    	result = this._transform(sap.viz.ui5.data.transformers.ModelToDataset);
	    } catch (err) {
	    	result = this.getVIZCrossDataset();
	    }
	    return result;
	};


	FlattenedDataset.prototype._transform = function(Transformer) {
	    if (!this._transformer || !(this._transformer instanceof Transformer)) {
	        this._transformer = new Transformer();
	    }
	    // @formatter:off
	    return this._transformer.getVizDataset(
	        this.getBinding("data"), this.getDimensions(), this.getMeasures(), 
	        this._defaultSelectionInfo, this._info, this.getBindingInfo('data'));
	    // @formatter:on
	};

	FlattenedDataset.prototype.invalidate = function(oOther) {
	    if (this._transformer) {
	        this._transformer.reset();
	    }
	    sap.ui.core.Element.prototype.invalidate.apply(this, arguments);
	};

	/**
	 * Set chart's default selection.
	 * This api will do nothing when use VizFrame.
	 *
	 * @param {object[]} Array of default selection info
	 * @deprecated Since 1.19.
	 * Please use selection API {sap.viz.ui5.core.BaseChart.prototype.selection}.
	 * @public
	 */
	FlattenedDataset.prototype.setDefaultSelection = function(selectionInfos) {
	    // Deprecated
	    // Will not apply to crosstable already created
	    this._defaultSelectionInfo = {
	        'type' : 'defaultSelection',
	        'value' : selectionInfos
	    };
	};

	/**
	 * Get/Set additional info for the crosstable dataset By now, only "additionalData" info type is supported.
	 * This api will do nothing when use VizFrame.
	 *
	 * @param {object[]} Array of Objects is for setting info and passes different types of infos objects.
	 */
	FlattenedDataset.prototype.info = function(values) {
	    if ( values instanceof Array) {
	        // Deprecated, not public
	        // Will not apply to crosstable already created
	        this._info = values;
	    } else if (values === undefined || typeof values === 'string') {
	        if (this._transformer && this._transformer instanceof sap.viz.ui5.data.transformers.ModelToCrosstable) {
	            var crosstable = sap.viz.ui5.data.transformers.ModelToCrosstable.prototype.getVizDataset();
	            if (crosstable) {
	                return crosstable.info(values);
	            }
	        }
	    }
	};

	/**
	 * Find the model context for a given 'criteria' into chart data.
	 *
	 * The native sap.viz library provides data objects with the
	 * <code>selectData</code> event. Applications can call this method for each data
	 * in a selectData event to find the corresponding UI5 model context.
	 *
	 * When the dataset has not been converted into a VIZ dataset yet
	 * (e.g. no rendering yet)  or when the coordinates of the path are not within
	 * the range of the current dataset, then undefined will be returned.
	 *
	 * Example when use sap.viz.ui5.*:
	 * <pre>
	 * selectData: function(oEvent) {
	 *   var aSelectData = oEvent.getParameter("data");
	 *   var oContext = this.getDataset().findContext(aSelectData[0].data[0].ctx.path);
	 * }
	 * </pre>
	 * Example when use sap.viz.ui5.controls.VizFrame:
	 * <pre>
	 * selectData: function(oEvent) {
	 *   var aSelectData = oEvent.getParameter("data");
	 *   var oContext = this.getDataset().findContext(aSelectData[0].data);
	 * }
	 * </pre>
	 *
	 * @param {object} oCriteria a structure as provided by the sap.viz library
	 * @return {sap.ui.model.Context} the model context for the given criteria or undefined.
	 * @experimental Since 1.16.6. Might later be integrated into the selectData event.
	 * @public
	 */
	FlattenedDataset.prototype.findContext = function(oCriteria) {
		if (this._transformer) {
			return this._transformer.findContext(oCriteria);
		}
	};


	return FlattenedDataset;

});
