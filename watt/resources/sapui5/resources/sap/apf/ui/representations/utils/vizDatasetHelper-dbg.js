/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/**
 * @class utils
 * @name utils
 * @memberOf sap.apf.ui.representations
 * @description holds utility functions used by viz representations
 */
jQuery.sap.declare("sap.apf.ui.representations.utils.vizDatasetHelper");
jQuery.sap.require("sap.apf.core.constants");
/**
 * @class vizDatasetHelper
 * @name vizdatasetHelper
 * @memberOf sap.apf.ui.representations.utils
 * @param bIsGroupTypeChart- boolean to indicate if the chart is of type group (bubble,scatter)
 * @description holds utility functions used by viz representations
 */
sap.apf.ui.representations.utils.VizDatasetHelper = function(bIsGroupTypeChart) {
	// axisType for viz charts is either axis(Eg: Column, Bar, Pie, Line, Stacked Column, Percentage Stacked Column, Clustered Column) or group(Bubble, Scatter)
	/*
	 * If kind(supportedKind) is defined for dimensions 
	 * Dimensions for axis type charts are : xAxis(axis : 1), legend(axis: 2) and sectorColor(axis: 1)
	 * Dimensions for group type charts are : regionColor(axis : 1) and regionShape(axis: 2)
	 */
	/**
	 * @memberOf sap.apf.ui.representations.utils.vizDatasetHelper
	 * @method getAxis
	 * @description Returns the axis (1 or 2) based on kind attribute
	 * */
	var getAxis = function(sKind) {
		var nAxis;
		var oSupportedKinds = sap.apf.core.constants.representationMetadata.kind;
		if (!bIsGroupTypeChart) {
			if (sKind === oSupportedKinds.LEGEND) {
				nAxis = 2;
			} else if (sKind === oSupportedKinds.XAXIS || sKind === oSupportedKinds.SECTORCOLOR) {
				nAxis = 1;
			}
		} else {
			if (sKind === oSupportedKinds.REGIONCOLOR) {
				nAxis = 1;
			} else if (sKind === oSupportedKinds.REGIONSHAPE) {
				nAxis = 2;
			}
		}
		return nAxis;
	};
	/**
	 * @memberOf sap.apf.ui.representations.utils.vizDatasetHelper
	 * @method getDataset
	 * @param oParameters defines parameters required for chart such as Dimension/Measures, tooltip, axis information.
	 * @description Prepares and returns the data set for viz charts
	 * */
	this.getDataset = function(oParameters) {
		this.parameter = oParameters;
		var aDimensions = [];
		var aMeasures = [];
		this.parameter.dimensions.forEach(function(dimension, index) {
			if (dimension.kind !== undefined) {// If kind(supportedKind) is defined for dimensions in parameter
				aDimensions[index] = {
					name : dimension.name,
					value : '{' + dimension.value + '}',
					axis : getAxis(dimension.kind)
				};
			} else {// If kind(supportedKind) is not defined for dimensions in parameter, first dimension is set to axis = 1 and rest to 2
				aDimensions[index] = {
					name : dimension.name,
					value : '{' + dimension.value + '}',
					axis : index === 0 ? 1 : 2
				};
			}
		});
		/*
		 * If kind(supportedKind) is defined for measures in parameter 
		 * Measures for axis type charts are : yAxis(axis :1) and sectorSize(axis: 1) 
		 * Measures for group type charts are : xAxis(axis : 1), yAxis(axis: 2), bubbleWidth(axis:3) and bubbleWidth(axis: 4)
		 */
		this.parameter.measures.forEach(function(measures, index) {
			var sAxisType;
			if (bIsGroupTypeChart) {
				sAxisType = sap.apf.ui.utils.CONSTANTS.axisTypes.GROUP;
			} else {
				sAxisType = sap.apf.ui.utils.CONSTANTS.axisTypes.AXIS;
			}
			if (measures.kind !== undefined) {
				aMeasures[index] = {
					name : measures.name,
					value : '{' + measures.value + '}'
				};
				var oSupportedKinds = sap.apf.core.constants.representationMetadata.kind;
				switch (measures.kind) {
					case oSupportedKinds.XAXIS:
						aMeasures[index][sAxisType] = 1;
						break;
					case oSupportedKinds.YAXIS:
						if (!bIsGroupTypeChart) {
							aMeasures[index][sAxisType] = 1;
						} else {
							aMeasures[index][sAxisType] = 2;
						}
						break;
					case oSupportedKinds.SECTORSIZE:
						aMeasures[index][sAxisType] = 1;
						break;
					case oSupportedKinds.BUBBLEWIDTH:
						aMeasures[index][sAxisType] = 3;
						break;
					case oSupportedKinds.BUBBLEHEIGHT:
						aMeasures[index][sAxisType] = 4;
						break;
					default :
						break;
				}
			} else {// If kind(supportedKind) is not defined for measures in parameter
				aMeasures[index] = {
					name : measures.name,
					value : '{' + measures.value + '}'
				};
				aMeasures[index][sAxisType] = index + 1;
			}
		});
		var flattendeDataSetObj = {
			dimensions : aDimensions,
			measures : aMeasures,
			data : {
				path : "/data"
			}
		};
		return flattendeDataSetObj;
	};
};