/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.getCore().loadLibrary("sap.viz");
jQuery.sap.require("sap.apf.ui.representations.utils.vizDatasetHelper");
jQuery.sap.require("sap.apf.ui.utils.constants");
jQuery.sap.require("sap.apf.core.representationTypes");
jQuery.sap.require("sap.apf.utils.utils");
/**
* @class previewContent
* @memberOf sap.apf.modeler.ui.controller
* @name previewContent
* @description controller for view.previewContent
*/
sap.ui.controller("sap.apf.modeler.ui.controller.previewContent", {
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#onInit
	 * @description Called on initialization of the view.
	 * 		Accepts parameters through view#getViewData in the following format :
	 * {	 
			sChartType - {sap.apf.ui.utils.CONSTANTS.representationTypes}  eg : "PieChart",
			sStepTitle - {string} Title of the step eg: "DSO by Country over Time",
			sStepLongTitle - {string} Long Title of the step eg: "DSO by Country over Time"
			aDimensions - {string[]} Field Names of All dimensions from select properties eg : [ "Country", "YearMonth" ],
			aMeasures - {string[]} Field Names of All measures from select properties eg: [ "DSO", "OverdueDSO", "Revenue" ],
			oChartParameter : { // chart parameter similar to the one passed to runtime representations.
				dimensions : [ {
					fieldDesc - {string} Name to be displayed eg: "Country of Customer",
					fieldName - {string} Property Name  eg: "Country",
					kind - {sap.apf.core.constants.representationMetadata.kind} eg: "sectorColor"
				} ],
				measures : [ {
					name - {string} Name to be displayed eg: "Day Sales Outstanding",
					value - {string} Property Name  eg: "DSO",
					kind - {sap.apf.core.constants.representationMetadata.kind} eg: "yAxis"
				} ]
			},
			aSort : [
				{	// sort object similar to the one passed to runtime representations.
					sSortField - {string} Property Name eg: "DSO",
					bDescending - {boolean} eg: true
				}
			],
			aCornerTexts : {	// corner text values.
				sLeftUpper - {string} eg: "DSO",
				sRightUpper - {string} eg: "",
				sLeftLower - {string} eg: "",
				sRightLower - {string} eg: "COUNTRY"
			}
	 *	}
	 *
	 *  Reads data from view#getViewData.
	 *  Prepares dummy data for charts.
	 *  Draw main chart and thumb nail preview.		
	 * */
	onInit : function() {
		// Views
		this.oView = this.getView();
		this.oView.addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oMainChartHolder = this.oView.byId("idMainChart");
		this.oThumbnailChartHolder = this.oView.byId("idThumbnailChartLayout");
		// Data
		this.mParam = this.oView.getViewData();
		// Actions
		this._prepareRepresentationInstance();
		this._drawContent();
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_drawContent
	 * @description Draws main chart and thumb nail content.
	 * 				Adds necessary style classes to view.
	 * */
	_drawContent : function() {
		this._drawMainChart();
		this._drawThumbnailContent();
		this._addStyleClasses();
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_drawMainChart
	 * @description Gets the mainContent of representation instance and draws it on mainChartHolder.
	 * */
	_drawMainChart : function() {
		var oMainChart = this.oRepresentationInstance.getMainContent(this.mParam.sStepLongTitle, 480, 330);
		this.oMainChartHolder.addItem(oMainChart);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_drawThumbnailContent
	 * @description Draws thumb nail chart.
	 * 				Set Title to thumb nail content.
	 * 				Draws corner texts.
	 * */
	_drawThumbnailContent : function() {
		this._drawThumbnailChart();
		this.oView.byId("idStepTitleText").setText(this.mParam.sStepTitle);
		this._drawCornerTexts();
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_drawThumbnailChart
	 * @description Gets the thumbnailContent of representation instance and draws it on oThumbnailChartHolder.
	 * */
	_drawThumbnailChart : function() {
		var oThumbnailChart = this.oRepresentationInstance.getThumbnailContent();
		this.oThumbnailChartHolder.addItem(oThumbnailChart);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_drawCornerTexts
	 * @description Draws corner texts on four place holders.
	 * */
	_drawCornerTexts : function() {
		this.oView.byId("idLeftUpperCornerText").setText(this.mParam.aCornerTexts.sLeftUpper);
		this.oView.byId("idRightUpperCornerText").setText(this.mParam.aCornerTexts.sRightUpper);
		this.oView.byId("idLeftLowerCornerText").setText(this.mParam.aCornerTexts.sLeftLower);
		this.oView.byId("idRightLowerCornerText").setText(this.mParam.aCornerTexts.sRightLower);
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_addStyleClasses
	 * @description Adds style classes to various view controls.
	 * */
	_addStyleClasses : function() {
		this.oView.byId("idChartHolder").addStyleClass("supressDialogPadding");
		this.oView.byId("idMainChart").addStyleClass("previewMainChartHolder");
		this.oView.byId("idThumbnail").addStyleClass("previewThumbnailHolder");
		this.oView.byId("idThumbnailLayout").addStyleClass("previewThumbnailLayout");
		this.oView.byId("idThumbnailChartLayout").addStyleClass("previewThumbnailChartLayout");
		this.oView.byId("idTopLayout").addStyleClass("previewThumbnailTopLayout");
		this.oView.byId("idBottomLayout").addStyleClass("previewThumbnailBottomLayout");
		this.oView.byId("idLeftUpperCornerText").addStyleClass("previewThumbnailText");
		this.oView.byId("idRightUpperCornerText").addStyleClass("previewThumbnailText");
		this.oView.byId("idLeftLowerCornerText").addStyleClass("previewThumbnailText");
		this.oView.byId("idRightLowerCornerText").addStyleClass("previewThumbnailText");
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_generateSampleData
	 * @description Generates dynamic data based on the dimensions and measures.
	 * 				Sorts the data if sort object is provided.
	 * 				Data grows exponentially based on the number of dimensions available.
	 * 				Each dimension will have (nSamplesPerDimension) data with random values for measures.
	 * @returns {object[]} aSampleData
	 * */
	_generateSampleData : function() {
		var aSampleData = [];
		var nSamplesPerDimension = 3; // Change this value to control the amount of data.
		var i = 0;
		var aDimensions = this.mParam.aDimensions;
		var aMeasures = this.mParam.aMeasures;
		var aSelectedDimensions = this.mParam.oChartParameter.dimensions;
		var aSelectedMeasures = this.mParam.oChartParameter.measures;
		/**
		 * Function to add 'FieldDesc' fields to sample data with the same value as 'FieldName'.
		 * */
		var fnInsertValueToFieldDesc = function(aSelectedFields, sFieldName, sValue, oRow) {
			var aCurrentSelectedFields = aSelectedFields.filter(function(oSelectedField) {
				return oSelectedField.fieldName === sFieldName;
			});
			aCurrentSelectedFields.forEach(function(oCurrentSelectedField) {
				if (!oCurrentSelectedField.fieldDesc || !oCurrentSelectedField.fieldDesc.length) {
					oCurrentSelectedField.fieldDesc = oCurrentSelectedField.fieldName;
				}
				oRow[oCurrentSelectedField.fieldDesc] = sValue;
			});
		};
		var len = Math.pow(nSamplesPerDimension, this.mParam.aDimensions.length);
		for(i = 0; i < len; i++) {
			var oRow = {};
			aDimensions.forEach(function(sDimension, nIndex) {
				var sDimensionValue = sDimension + " - " + (Math.floor(i / Math.pow(nSamplesPerDimension, nIndex)) % nSamplesPerDimension + 1);
				oRow[sDimension] = sDimensionValue;
				fnInsertValueToFieldDesc(aSelectedDimensions, sDimension, sDimensionValue, oRow);
			});
			aMeasures.forEach(function(sMeasure) {
				var sMeasureValue = Math.round(Math.random() * 500);
				oRow[sMeasure] = sMeasureValue;
				fnInsertValueToFieldDesc(aSelectedMeasures, sMeasure, sMeasureValue, oRow);
			});
			aSampleData.push(oRow);
		}
		if (this.mParam.aSort && this.mParam.aSort.length) {
			aSampleData = this._sortData(aSampleData, this.mParam.aSort);
		}
		return aSampleData;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_sortData
	 * @param {object[]} aData - Source data to be sorted.
	 * @param {array} aProperteis - Array of properties by which the data has to be sorted of the form: 
	 * 		[
	 * 			{
	 * 				sProperty - {string}	Name of the property.
	 * 				bDescending - {boolean} Boolean to indicate the order.
	 * 			}
	 * 		]
	 * @description Uses the Array#sort method to sort data.
	 * @returns {object[]} Sorted Data.
	 * */
	_sortData : function(aData, aProperties) {
		return aData.sort(function(oRow1, oRow2) {
			var nResult, i;
			for(i = 0; i < aProperties.length; i++) {
				nResult = 0;
				if (oRow1[aProperties[i].sSortField] < oRow2[aProperties[i].sSortField]) {
					nResult = -1;
				} else if (oRow1[aProperties[i].sSortField] > oRow2[aProperties[i].sSortField]) {
					nResult = 1;
				}
				nResult = nResult * [ 1, -1 ][+!!aProperties[i].bDescending];
				if (nResult !== 0) {
					return nResult;
				}
			}
		});
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_getRepresentationConstructor
	 * @description Returns representation constructor given representation id.
	 * @returns {string} sConstructor - Constructor name space of the representation.
	 * */
	_getRepresentationConstructor : function(sChartName) {
		var aRepresentationTypes = sap.apf.core.representationTypes();
		var oRepresentationType = aRepresentationTypes.filter(function(oRepresentationType) {
			return oRepresentationType.id === sChartName;
		})[0];
		var sConstructor = oRepresentationType.constructor;
		return sConstructor;
	},
	/**
	 * @private
	 * @function
	 * @name sap.apf.modeler.ui.controller.previewContent#_prepareRepresentationInstance
	 * @description Prepares the representationInstance from the constructor and host it on 'this.oRepresentationInstance'.
	 * 				Invokes 'setData' on the instance by passing sample data and dummy meta data.
	 * */
	_prepareRepresentationInstance : function() {
		var sRepresentationConstructor = this._getRepresentationConstructor(this.mParam.sChartType);
		jQuery.sap.require(sRepresentationConstructor);
		var FnRepresentationConstructor = sap.apf.utils.extractFunctionFromModulePathString(sRepresentationConstructor);
		var oApiStub = {
			getTextNotHtmlEncoded : function(sText) {
				return sText;
			},
			getTextHtmlEncoded : function(sText) {
				return sText;
			},
			getEventCallback : function() {
				return;
			}
		};
		this.oRepresentationInstance = new FnRepresentationConstructor(oApiStub, this.mParam.oChartParameter);
		var oMetadataStub = {
			getPropertyMetadata : function() {
				return {};
			}
		};
		var aSampleData = this._generateSampleData();
		this.oRepresentationInstance.setData(aSampleData, oMetadataStub);
	}
});