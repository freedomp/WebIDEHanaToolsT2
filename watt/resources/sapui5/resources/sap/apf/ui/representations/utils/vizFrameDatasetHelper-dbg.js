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
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.declare("sap.apf.ui.representations.utils.vizFrameDatasetHelper");
/**
 * @class vizFrameDatasetHelper
 * @name vizFrameDatasetHelper
 * @memberOf sap.apf.ui.representations.utils
 * @description holds utility functions to determine the feedItem type id for dimensions and measures for each vizFrame chart
 * 
 */
sap.apf.ui.representations.utils.vizFrameDatasetHelper = function(bIsGroupTypeChart) {
	var getAxisFeedItemId = function(sKind) {
		var oSupportedTypes = sap.apf.core.constants.representationMetadata.kind;
		var aFeedItemTypes = sap.apf.core.constants.vizFrame.feedItemTypes;
		//TODO add more feedItem ids when the document is provided by vizFrame
		var axisfeedItemId;
		switch (sKind) {
			case oSupportedTypes.XAXIS:
				if (!bIsGroupTypeChart) {
					axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.CATEGORYAXIS;
				} else {
					axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;
				}
				break;
			case oSupportedTypes.YAXIS:
				if (!bIsGroupTypeChart) {
					axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS;
				} else {
					axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.VALUEAXIS2;
				}
				break;
			case oSupportedTypes.SECTORCOLOR:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;
				break;
			case oSupportedTypes.LEGEND:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;
				break;
			case oSupportedTypes.REGIONCOLOR:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;
				break;
			case oSupportedTypes.SECTORSIZE:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.SIZE;
				break;
			case oSupportedTypes.REGIONSHAPE:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.SHAPE;
				break;
			case oSupportedTypes.BUBBLEWIDTH:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEWIDTH;
				break;
			case oSupportedTypes.BUBBLEHEIGHT:
				axisfeedItemId = sap.apf.core.constants.vizFrame.feedItemTypes.BUBBLEHEIGHT;
				break;
			default :
				break;
		}
		return axisfeedItemId;
	};
	this.getDataset = function(oParameters) {
		this.parameter = oParameters;
		var aDimensions = [];
		var aMeasures = [];
		this.parameter.dimensions.forEach(function(dimension, index) {
			if (dimension.kind !== undefined) {
				aDimensions[index] = {
					name : dimension.name,
					value : '{' + dimension.value + '}',
					axisfeedItemId : getAxisFeedItemId(dimension.kind)
				};
			} else {
				aDimensions[index] = {
					name : dimension.name,
					value : '{' + dimension.value + '}',
					axisfeedItemId : dimension.axisfeedItemId
				};
			}
		});
		this.parameter.measures.forEach(function(measure, index) {
			if (measure.kind !== undefined) {
				aMeasures[index] = {
					name : measure.name,
					value : '{' + measure.value + '}',
					axisfeedItemId : getAxisFeedItemId(measure.kind)
				};
			} else {
				aMeasures[index] = {
					name : measure.name,
					value : '{' + measure.value + '}',
					axisfeedItemId : measure.axisfeedItemId
				};
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