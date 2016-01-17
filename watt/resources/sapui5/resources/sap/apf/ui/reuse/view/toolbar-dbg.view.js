/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/**
 * @class toolbar
 * @memberOf sap.apf.ui.reuse.view
 * @name toolbar
 * @description layout holds the Toolbar buttons: new , save, open, print
 */
sap.ui.jsview("sap.apf.ui.reuse.view.toolbar", {
	getControllerName : function() {
		return "sap.apf.ui.reuse.controller.toolbar";
	},
	createContent : function(oController) {
		// when metadata is not available, default values are set
		this.maxNumberOfSteps = 32;
		this.maxNumberOfPaths = 255;
		var self = this;
		var oViewData = this.getViewData();
		self.oCoreApi = oViewData.oCoreApi;
		self.oUiApi = oViewData.uiApi;
		var oTemplateNew = new sap.m.StandardListItem({
			icon : 'sap-icon://add-product',
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("new"),
			press : function() {
				self.getParent().close();
				self.oUiApi.getLayoutView().setBusy(true);
				oController.getNewAnalysisPathDialog();
				self.oUiApi.getLayoutView().setBusy(false);
			}
		});
		var oTemplateOpen = new sap.m.StandardListItem({
			icon : "sap-icon://open-folder",
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("open"),
			press : function() {
				self.oUiApi.getLayoutView().setBusy(true);
				self.getParent().close();
				oController.onOpenPathGallery();
			}
		});
		var oTemplateSave = new sap.m.StandardListItem({
			icon : "sap-icon://save",
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("save"),
			press : function() {
				self.getParent().close();
				if (self.oCoreApi.getSteps().length !== 0) {
					self.oUiApi.getLayoutView().setBusy(true);
					self.oCoreApi.readPaths(function(respObj, metaData, msgObj) {
						var bSaveAs = false;
						var paths = respObj.paths;
						if (metaData !== undefined) {
							self.maxNumberOfSteps = metaData.getEntityTypeMetadata().maximumNumberOfSteps;
							self.maxNumberOfPaths = metaData.getEntityTypeMetadata().maxOccurs;
						}
						if (msgObj === undefined && (typeof respObj === "object")) {
							oController.getSaveDialog(bSaveAs, function() {
							}, paths);
						} else {
							var oMessageObject = self.oCoreApi.createMessageObject({
								code : "6005",
								aParameters : []
							});
							oMessageObject.setPrevious(msgObj);
							self.oCoreApi.putMessage(oMessageObject);
						}
						self.oUiApi.getLayoutView().setBusy(false);
					});
				} else {
					oController.getDialogForNoPathAdded();
				}
			}
		});
		var oTemplateSaveAs = new sap.m.StandardListItem({
			icon : "sap-icon://save",
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("saveAs"),
			press : function() {
				self.getParent().close();
				if (self.oCoreApi.getSteps().length !== 0) {
					self.oUiApi.getLayoutView().setBusy(true);
					self.oCoreApi.readPaths(function(respObj, metaData, msgObj) {
						var bSaveAs = true;
						var paths = respObj.paths;
						if (metaData !== undefined) {
							self.maxNumberOfSteps = metaData.getEntityTypeMetadata().maximumNumberOfSteps;
							self.maxNumberOfPaths = metaData.getEntityTypeMetadata().maxOccurs;
						}
						if (msgObj === undefined && (typeof respObj === "object")) {
							oController.getSaveDialog(bSaveAs, function() {
							}, paths);
						} else {
							var oMessageObject = self.oCoreApi.createMessageObject({
								code : "6005",
								aParameters : []
							});
							oMessageObject.setPrevious(msgObj);
							self.oCoreApi.putMessage(oMessageObject);
						}
						self.oUiApi.getLayoutView().setBusy(false);
					});
				} else {
					oController.getDialogForNoPathAdded();
				}
			}
		});
		var oTemplateDelete = new sap.m.StandardListItem({
			icon : "sap-icon://delete",
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("delete"),
			press : function() {
				self.getParent().close();
				self.oUiApi.getLayoutView().setBusy(true);
				oController.onOpenPathGalleryWithDelete();
			}
		});
		var oTemplatePrint = new sap.m.StandardListItem({
			icon : "sap-icon://print",
			type : sap.m.ListType.Active,
			title : self.oCoreApi.getTextNotHtmlEncoded("print"),
			press : function() {
				self.getParent().close();
				oController.doPrint();
			}
		});
		this.oActionListItem = new sap.m.List({
			items : [ oTemplateNew, oTemplateOpen, oTemplateSave, oTemplateSaveAs, oTemplateDelete, oTemplatePrint ]
		});
		return this.oActionListItem;
	}
});