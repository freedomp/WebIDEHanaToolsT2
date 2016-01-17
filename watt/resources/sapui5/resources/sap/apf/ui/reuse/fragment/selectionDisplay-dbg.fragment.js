/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/* global window*/
/**
 *@class selectionDisplay
 *@name  selectionDisplay Fragment
 *@description Holds the selections on the active step and displays them in a dialog using js fragment
 *@memberOf sap.apf.ui.reuse.view
 * 
 */
sap.ui.jsfragment("sap.apf.ui.reuse.fragment.selectionDisplay", {
	createContent : function(oController){
		this.oController = oController;
		this.contentWidth = jQuery(window).height() * 0.6 + "px"; // height and width for the dialog relative to the window
		this.contentHeight = jQuery(window).height() * 0.6 + "px";
		var self = this;
		this.oCoreApi = oController.oCoreApi;
		this.oUiApi = oController.oUiApi;
		var closeButton = new sap.m.Button({
			text : self.oCoreApi.getTextNotHtmlEncoded("close"),
			press : function() {
				self.selectionDisplayDialog.close();
				self.selectionDisplayDialog.destroy();
			}
		});
		var oActiveStep = this.oCoreApi.getActiveStep();
		var selectedRepresentation = oActiveStep.getSelectedRepresentation();
		var selectionData =  typeof selectedRepresentation.getSelections === "function" ? selectedRepresentation.getSelections() : undefined; //Returns the filter selections
		var selectedDimension = selectedRepresentation.getMetaData().getPropertyMetadata(selectedRepresentation.getParameter().requiredFilters[0]).label;
		var oModel = new sap.ui.model.json.JSONModel();
		//Preparing the data list in the dialog
		if(selectionData !== undefined){
			var oData = {
					selectionData : selectionData
			};
			var selectionList = new sap.m.List({
				items : {
					path : "/selectionData",
					template: new sap.m.StandardListItem({
					   title : "{text}"
					})
				}
			});
			oModel.setData(oData);
			selectionList.setModel(oModel);
			this.selectionDisplayDialog = new sap.m.Dialog({
				title : this.oCoreApi.getTextNotHtmlEncoded("selected-required-filter", [selectedDimension]) + " (" + selectionData.length + ")",
				contentWidth : self.contentWidth,
				contentHeight : self.contentHeight,	
				buttons : [closeButton],
				content : [selectionList]
			});
			return this.selectionDisplayDialog;
		}
	}
});