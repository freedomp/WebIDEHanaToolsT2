/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global window*/
/**
 *@class deleteAnalysisPath
 *@name deleteAnalysisPath
 *@memberOf sap.apf.ui.reuse.controller
 *@description controller of view.deleteAnalysisPath
 */
sap.ui.controller("sap.apf.ui.reuse.controller.deleteAnalysisPath", {
	/**
	 *@this {sap.apf.ui.reuse.controller.pathGallery}
	 */
	onInit : function() {
		var self = this;
		this.oCoreApi = this.getView().getViewData().oInject.oCoreApi;
		this.oUiApi = this.getView().getViewData().oInject.uiApi;
		this.oSerializationMediator = this.getView().getViewData().oInject.oSerializationMediator;
		this.contentWidth = jQuery(window).height() * 0.6 + "px"; // height and width for the dialog relative to the window
		this.contentHeight = jQuery(window).height() * 0.6 + "px";
		this.stdDialog = new sap.m.Dialog({
			title : self.oCoreApi.getTextNotHtmlEncoded("select-analysis-path"),
			contentWidth : self.contentWidth,
			contentHeight : self.contentHeight,
			content : this.getView().getContent()[0],
			leftButton : new sap.m.Button({
				text : self.oCoreApi.getTextNotHtmlEncoded("close"),
				press : function() {
					self.stdDialog.close();
					self.oUiApi.getLayoutView().setBusy(false);
				}
			})
		});
	},
	/**
	*@memberOf sap.apf.ui.reuse.controller.pathGallery
	*@method openPathGalleryWithDelete
	*@description opens the path gallery with delete mode
	*/
	openPathGalleryWithDelete : function() {
		this.stdDialog.open();
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.pathGallery
	 *@method getGuidForPath
	 *@description Fetches guid for a path
	 */
	getGuidForPath : function(sPathName, viewData) {
		var i;
		for(  i = 0; i < viewData.length; i++) {
			var oData = viewData[i];
			if (oData.AnalysisPathName === sPathName) {
				return oData.guid;
			}
		}
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.pathGallery
	 *@method deleteSavedPath
	 *@description deletes the section and path from path gallery.
	 *@param {object} sectionDom
	 */
	deleteSavedPath : function(sPathName, oInfo) {
		var self = this;
		var guid = oInfo.guid;
		var pathName = sPathName;
		var oMessageObject;
		var currentPath = self.oUiApi.getAnalysisPath().oSavedPathName.getTitle();
		self.oSerializationMediator.deletePath(guid, function(oResponse, metaData, msgObj) {
			if (msgObj === undefined && (typeof oResponse === "object")) {
				oInfo.list.removeItem(oInfo.item);
				self.oCoreApi.readPaths(function(oResponse, metaData, msgObj) {
					if (msgObj === undefined && (typeof oResponse === "object")) {
						var noOfPaths = oResponse.paths.length;
						//Text to be shown in galery when all paths are deleted
						if (noOfPaths === 0) {
							jQuery(".pathText").removeClass("pathTextDontShow");
							jQuery(".pathText").addClass("pathTextShow");
						}
					} else {
						oMessageObject = self.oCoreApi.createMessageObject({
							code : "6005",
							aParameters : [ pathName ]
						});
						oMessageObject.setPrevious(msgObj);
						self.oCoreApi.putMessage(oMessageObject);
					}
				});
			} else {
				oMessageObject = self.oCoreApi.createMessageObject({
					code : "6009",
					aParameters : [ "delete", pathName ]
				});
				oMessageObject.setPrevious(msgObj);
				self.oCoreApi.putMessage(oMessageObject);
			}
		});
		//If current path is deleted reset the analysis path
		if (currentPath === pathName) {
			self.oUiApi.getAnalysisPath().getToolbar().getController().resetAnalysisPath();
		}
	}
});
