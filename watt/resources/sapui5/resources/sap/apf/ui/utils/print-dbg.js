/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global  window*/
jQuery.sap.declare("sap.apf.ui.utils.print");
jQuery.sap.require("sap.apf.ui.utils.formatter");
/** 
 *@class PrintHelper
 *@memberOf sap.apf.ui.utils
 *@description has functions to perform printing of Analysis Path
 *  
 */
sap.apf.ui.utils.PrintHelper = function(oInject) {
	"use strict";
	var oCoreApi = oInject.oCoreApi;
	var oUiApi = oInject.uiApi;
	var oFilterIdHandler = oInject.oFilterIdHandler;
	var nStepRenderCount, oChartSelectionPromise, nNoOfNonTableSteps;
	this.oPrintLayout = {};
	/**
	 *@method _increaseStepRenderCount increases the step render count as and when each step is rendered
	 **/
	function _increaseStepRenderCount() {
		nStepRenderCount++;
		if (nNoOfNonTableSteps === nStepRenderCount) {
			oChartSelectionPromise.resolve();
		}
	}
	/**
	 *@method _createDivForPrint removes the existing div apfPrintArea. Later creates the div apfPrintArea
	 **/
	function _createDivForPrint(oContext) {
		if (!jQuery.isEmptyObject(oContext.oPrintLayout)) {
			oContext.oPrintLayout.removeContent();
		}
		jQuery('#apfPrintArea').remove(); // removing the div which holds the printable content
		jQuery("body").append('<div id="apfPrintArea"></div>'); //div which holds the printable content
		oUiApi.createApplicationLayout(false).setBusy(true);//sets the Local Busy Indicator for the print
	}
	/**
	 *@method _findNoOfNonTableSteps used to find the non table steps in the path
	 *@param aAllSteps - array of steps in the path
	 */
	function _findNoOfNonTableSteps(aAllSteps) {
		var oSelectedRepresentation;
		nNoOfNonTableSteps = 0;
		nStepRenderCount = 0;
		aAllSteps.forEach(function(oStep) {
			oSelectedRepresentation = oStep.getSelectedRepresentation();
			oSelectedRepresentation = oSelectedRepresentation.bIsAlternateView ? oSelectedRepresentation.toggleInstance : oSelectedRepresentation;
			if (oSelectedRepresentation.type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
				nNoOfNonTableSteps++;
			}
		});
	}
	/**
	 *@method _getHeaderForFirstPage creates a header for the first page of print
	 *@returns header for first page of print
	 */
	function _getHeaderForFirstPage() {
		var date = new Date();
		var sAppName = oCoreApi.getApplicationConfigProperties().appName;
		var sAnalysisPathTitle = oUiApi.getAnalysisPath().oSavedPathName.getTitle();
		var headerForFirstPage = new sap.ui.core.HTML({
			id : 'idAPFHeaderForFirstPage',
			content : [ '<div class="subHeaderPrintWrapper"><p class="printHeaderTitle"> ' + oCoreApi.getTextHtmlEncoded(sAppName) + ' : ' + jQuery.sap.encodeHTML(sAnalysisPathTitle) + '</p>',
					'<p class="printHeaderDate"> ' + date.toTimeString() + ' </p></div><div class="clear"></div>' ].join(""),
			sanitizeContent : true
		});
		return headerForFirstPage;
	}
	/**
	 *@method _getPrintLayoutForFacetFiltersAndFooters creates a layout for facet filter and footers page
	 *@description Gets application specific filters and formats them for printing. Gets facet filter values for printing.
	 *@returns print layout for facet filters and footers
	 */
	function _getPrintLayoutForFacetFiltersAndFooters() {
		var i, j, nIndex, oFacetFilterLists, oAppSpecificFilter, mFilterName, mFilterValue, aFiltersForPrining, filterObj, oFormatter, oFacetFilter, aSelectedItems, oFacetAndFooterLayout;
		var aAppSpecificFilterExp = [], aAppSpecificFilters = [], sFilterValue = "", sFilterName = "", aSelectedFilters = [], filterValues = [], aAppSpecificFormattedFilters = [], aFacetFilters = [], oFilterValue = {};
		//First : Get application specific filter values
		var callback = oUiApi.getEventCallback(sap.apf.core.constants.eventTypes.printTriggered);
		var callbackContext = {
			getTextNotHtmlEncoded : oCoreApi.getTextNotHtmlEncoded
		};
		var aAllAppSpecificFilterIds = oFilterIdHandler.getAllInternalIds(); //get application specific filters
		//Get the filter expression for the application specific filters(footers)
		if (aAllAppSpecificFilterIds.length > 0) {
			for(i = 0; i < aAllAppSpecificFilterIds.length; i++) {
				oAppSpecificFilter = oFilterIdHandler.get(aAllAppSpecificFilterIds[i]).getExpressions();
				aAppSpecificFilterExp.push(oAppSpecificFilter[0]);
			}
		}
		//Returns formatted filter values from APF for application specific filters
		function getAppSpecificFormattedFilters() {
			function prepareFormattedFilterValues(oPropertyMetadata) {
				sFilterName = "";
				filterValues = [];
				oFormatter = new sap.apf.ui.utils.formatter({
					getEventCallback : oUiApi.getEventCallback.bind(oUiApi),
					getTextNotHtmlEncoded : oCoreApi.getTextNotHtmlEncoded
				}, oPropertyMetadata);
				sFilterName = oPropertyMetadata.label;
				filterValues.push(oFormatter.getFormattedValue(oPropertyMetadata.name, aAppSpecificFilterExp[i][j].value));
			}
			for(i = 0; i < aAppSpecificFilterExp.length; i++) {
				for(j = 0; j < aAppSpecificFilterExp[i].length; j++) {
					filterObj = aAppSpecificFilterExp[i][j];
					oCoreApi.getMetadataFacade().getProperty(aAppSpecificFilterExp[i][j].name, prepareFormattedFilterValues);
					filterObj["sName"] = sFilterName;
					filterObj["value"] = filterValues;
					aAppSpecificFilters.push(filterObj);
				}
			}
			return aAppSpecificFilters;
		}
		if (callback !== undefined) { //If application has a print functionality on its own use it otherwise get formatted filter values for application specific filters from APF
			aAppSpecificFormattedFilters = callback.apply(callbackContext, aAppSpecificFilterExp) || [];
			aAppSpecificFormattedFilters = (aAppSpecificFormattedFilters.length > 0) ? aAppSpecificFormattedFilters : getAppSpecificFormattedFilters();
		} else { //APF default formatting
			aAppSpecificFormattedFilters = getAppSpecificFormattedFilters();
		}
		//Second : Get all the configured facet filters from APF
		oFacetFilter = oUiApi.getFacetFilterForPrint();
		function getTextsFromSelectedItems(aSelectedItems) {
			aSelectedFilters = [];
			aSelectedItems.forEach(function(oItem) {
				aSelectedFilters.push(oItem.getText());
			});
		}
		if (oFacetFilter) {//If there is a facet filter
			oFacetFilterLists = oFacetFilter.getLists();
			for(nIndex = 0; nIndex < oFacetFilterLists.length; nIndex++) {
				aSelectedItems = [];
				oFilterValue = {};
				oFilterValue.sName = oFacetFilterLists[nIndex].getTitle();
				if (!oFacetFilterLists[nIndex].getSelectedItems().length) {
					aSelectedItems = oFacetFilterLists[nIndex].getItems();
				} else {
					aSelectedItems = oFacetFilterLists[nIndex].getSelectedItems();
				}
				getTextsFromSelectedItems(aSelectedItems);
				oFilterValue.value = aSelectedFilters;
				aFacetFilters.push(oFilterValue);
			}
		}
		//Later : Merge the APF filters and application specific filters for printing; Application specific filters if available are printed first
		aFiltersForPrining = aAppSpecificFormattedFilters.length > 0 ? aAppSpecificFormattedFilters.concat(aFacetFilters) : aFacetFilters;
		oFacetAndFooterLayout = new sap.ui.layout.VerticalLayout({
			id : 'idAPFFacetAndFooterLayout'
		});
		//Formatting the filter array
		for(i = 0; i < aFiltersForPrining.length; i++) {
			sFilterName = aFiltersForPrining[i].sName;
			for(j = 0; j < aFiltersForPrining[i].value.length; j++) {
				if (j !== aFiltersForPrining[i].value.length - 1) {
					sFilterValue += aFiltersForPrining[i].value[j] + ", ";
				} else {
					sFilterValue += aFiltersForPrining[i].value[j];
				}
			}
			mFilterName = new sap.m.Text({
				text : sFilterName
			}).addStyleClass("printFilterName");
			mFilterValue = new sap.m.Text({
				text : sFilterValue
			}).addStyleClass("printFilterValue");
			//Facet UI Layout
			oFacetAndFooterLayout.addContent(mFilterName);
			oFacetAndFooterLayout.addContent(mFilterValue);
			//Reset the filter value
			sFilterValue = "";
		}
		return oFacetAndFooterLayout;
	}
	/**
	 *@method _getHeaderForEachStep creates a header for each step page
	 *@returns header for step page
	 */
	function _getHeaderForEachStep(nIndex, nStepsLength) {
		var oMessageObject;
		var date = new Date();
		var sAppName = oCoreApi.getApplicationConfigProperties().appName;
		var sAnalysisPathTitle = oUiApi.getAnalysisPath().oSavedPathName.getTitle();
		if (!sAppName) {
			oMessageObject = oCoreApi.createMessageObject({
				code : "6003",
				aParameters : [ "sAppName" ]
			});
			oCoreApi.putMessage(oMessageObject);
		}
		var headerForEachStep = new sap.ui.core.HTML({
			id : 'idAPFHeaderForEachStep' + nIndex,
			content : [ '<div class="subHeaderPrintWrapper"><p class="printHeaderTitle"> ' + oCoreApi.getTextHtmlEncoded(sAppName) + ' : ' + jQuery.sap.encodeHTML(sAnalysisPathTitle) + '</p>',
					'<p class="printHeaderDate"> ' + date.toTimeString() + ' </p></div><div class="clear"></div>', '<div class="printChipName"><p>' + oCoreApi.getTextHtmlEncoded("print-step-number", [ nIndex, nStepsLength ]) + '</p></div>' ]
					.join(""),
			sanitizeContent : true
		});
		return headerForEachStep;
	}
	/**
	 *@method _getRepresentationForPrint
	 *@param oStep is used to get the step information
	 *@returns the representation for printing
	 */
	function _getRepresentationForPrint(oStep) {
		var data, metadata, oPrintContent, bIsLegendVisible = false, oRepresentation = {};
		var oStepTitle = oCoreApi.getTextNotHtmlEncoded(oStep.title);
		var oSelectedRepresentation = oStep.getSelectedRepresentation();
		var oStepRepresentation = oSelectedRepresentation.bIsAlternateView ? oSelectedRepresentation.toggleInstance : oSelectedRepresentation;
		//If alternate view(table representation)
		if (oSelectedRepresentation.bIsAlternateView) {
			data = oStep.getSelectedRepresentation().getData();
			metadata = oStep.getSelectedRepresentation().getMetaData();
			oStepRepresentation.setData(data, metadata);
		}
		if (oStepRepresentation.type === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
			oRepresentation = oStepRepresentation.getPrintContent(oStepTitle);
			oRepresentation.setWidth("1000px");
		} else {//If not a table representation
			oPrintContent = oStepRepresentation.getPrintContent(oStepTitle);
			oRepresentation = oPrintContent.oChartForPrinting;
			//If the chart is vizFrame make selections after rendering of chart and update the step render count
			if (oRepresentation.vizSelection) {
				oRepresentation.attachEventOnce("renderComplete", function() {
					oRepresentation.vizSelection(oPrintContent.aSelectionOnChart);
					_increaseStepRenderCount();
				});
			} else {//If the chart is Viz make selections after initialization of chart and update the step render count
				oRepresentation.attachInitialized(function() {
					oRepresentation.selection(oPrintContent.aSelectionOnChart);
					_increaseStepRenderCount();
				});
			}
		}
		//Show/Hide Legend for print content
		if (oStepRepresentation.bIsLegendVisible === undefined || oStepRepresentation.bIsLegendVisible === true) {
			bIsLegendVisible = true;
		}
		if (oRepresentation.setVizProperties) { //Check if it is Viz Frame Charts
			oRepresentation.setVizProperties({
				legend : {
					visible : bIsLegendVisible
				},
				sizeLegend : {
					visible : bIsLegendVisible
				}
			});
		} else {//fall back for viz charts
			if (oRepresentation.setLegend !== undefined) {
				oRepresentation.setLegend(new sap.viz.ui5.types.legend.Common({
					visible : bIsLegendVisible
				}));
			}
			if (oRepresentation.setSizeLegend !== undefined) {
				oRepresentation.setSizeLegend(new sap.viz.ui5.types.legend.Common({
					visible : bIsLegendVisible
				}));
			}
		}
		return oRepresentation;
	}
	/**
	 *@method _getPrintLayoutForEachStep defines layout used by each step when being printed
	 *@usage _getPrintLayoutForEachStep has to be used to get the layout for individual steps in analysis path.
	 *@param oStep is used to get the step information
	 *@param nIndex is index of the step being printed
	 *@param nStepsLength is the total number of steps in an Analysis Path
	 *@returns the printLayout for a step in an Analysis Path.
	 */
	function _getPrintLayoutForEachStep(oStep, nIndex, nStepsLength) {
		var oStepLayout;
		var oChartLayout = new sap.ui.layout.VerticalLayout({
			id : 'idAPFChartLayout' + nIndex
		});
		oChartLayout.addContent(_getRepresentationForPrint(oStep));
		oStepLayout = new sap.ui.layout.VerticalLayout({
			id : 'idAPFStepLayout' + nIndex,
			content : [ _getHeaderForEachStep(nIndex, nStepsLength), oChartLayout ]
		}).addStyleClass("representationContent"); // @comment : apfoPrintLayout class not provided in css
		return oStepLayout;
	}
	/**
	 *@method Print used to print all the steps in Analysis Path.
	 *@usage PrintHelper().doPrint has to be used for printing Analysis Path
	 */
	this.doPrint = function() {
		var i, j, nIndex, oChart, colCount, table, stepNo, oSelectedRepresentation, oPrintFirstPageLayout;
		var domContent = "", pTimer = 2000, self = this;
		var aAllSteps = oCoreApi.getSteps();
		this.oPrintLayout = new sap.ui.layout.VerticalLayout({
			id : "idAPFPrintLayout"
		});
		_createDivForPrint(this);
		oChartSelectionPromise = new jQuery.Deferred();
		_findNoOfNonTableSteps(aAllSteps);
		if (nNoOfNonTableSteps === 0) {
			oChartSelectionPromise.resolve();
		}
		//Facet Filter and footers are printed in the initial page along with the header
		oPrintFirstPageLayout = new sap.ui.layout.VerticalLayout({
			id : 'idAPFPrintFirstPageLayout',
			content : [ _getHeaderForFirstPage(), _getPrintLayoutForFacetFiltersAndFooters() ]
		}).addStyleClass("representationContent");
		this.oPrintLayout.addContent(oPrintFirstPageLayout);
		//Consecutive pages with one step each is printed
		for(j = 0; j < aAllSteps.length; j++) {
			nIndex = parseInt(j, 10) + 1;
			this.oPrintLayout.addContent(_getPrintLayoutForEachStep(aAllSteps[j], nIndex, aAllSteps.length));
		}
		this.oPrintLayout.placeAt("apfPrintArea");
		if (jQuery(".v-geo-container").length) {//set the timer if geomap exists
			pTimer = 4000;
		}
		window.setTimeout(function() {
			oUiApi.createApplicationLayout(false).setBusy(false); //Removes the Local Busy Indicator after the print
		}, pTimer - 150);
		window.setTimeout(function() { //Set Timeout to load the content on to dom
			jQuery("#" + self.oPrintLayout.sId + " > div").after("<div class='page-break'> </div>");
			domContent = self.oPrintLayout.getDomRef(); // Get the DOM Reference
			table = jQuery('#apfPrintArea .sapUiTable');
			if (table.length) {
				colCount = jQuery('#apfPrintArea .printTable .sapMListTblHeader .sapMListTblCell').length;
				if (colCount > 11) {
					jQuery("#setPrintMode").remove();
					jQuery("<style id='setPrintMode' > @media print and (min-resolution: 300dpi) { @page {size : landscape;}}</style>").appendTo("head");
				} else {
					jQuery("#setPrintMode").remove();
					jQuery("<style id='setPrintMode'>@media print and (min-resolution: 300dpi) { @page {size : portrait;}}</style>").appendTo("head");
				}
			}
			jQuery("#apfPrintArea").empty(); //Clear the apfPrintArea
			jQuery("#sap-ui-static > div").hide(); // Hide popup
			jQuery("#apfPrintArea").append(jQuery(domContent).html()); //Push it to apfPrintArea
			for(i = 0; i < jQuery("#apfPrintArea").siblings().length; i++) {
				//TODO alternate way of hiding the content and printing only the representations?????     
				jQuery("#apfPrintArea").siblings()[i].hidden = true; // hiding the content apart from apfPrintArea div
			}
			//Wait until all the have been rendered with selections and then print
			oChartSelectionPromise.then(function() {
				window.print(); //print the content
			});
			//Workaround to get the width of the column cell
			window.setTimeout(function() {
				for(i = 0; i < jQuery("#apfPrintArea").siblings().length; i++) {
					jQuery("#apfPrintArea").siblings()[i].hidden = false;
				}
				for(stepNo = 0; stepNo < aAllSteps.length; stepNo++) {
					oSelectedRepresentation = aAllSteps[stepNo].getSelectedRepresentation();
					oSelectedRepresentation = oSelectedRepresentation.bIsAlternateView ? oSelectedRepresentation.toggleInstance : oSelectedRepresentation;
					//Check if the representation is not a table representation; if not destroy the chart instance
					if (oSelectedRepresentation.type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
						//Access layout content to retrieve the chart; Destroy the chart to prevent memory leaks
						oChart = self.oPrintLayout.getContent()[stepNo + 1].getContent()[1].getContent()[0];
						oChart.destroy();
						oChart = null;
					}
				}
				self.oPrintLayout.destroy(); //Destroy the reference & remove from dom
				self.oPrintLayout = null;
			}, 10);
		}, pTimer);
	};
};