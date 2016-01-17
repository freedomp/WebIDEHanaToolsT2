/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global window*/
sap.ui.jsview("sap.apf.ui.reuse.view.deleteAnalysisPath", {
	getControllerName : function() {
		return "sap.apf.ui.reuse.controller.deleteAnalysisPath";
	},
	createContent : function(oController) {
		this.oController = oController;
		this.viewData = this.getViewData();
		var self = this;
		this.oCoreApi = this.getViewData().oInject.oCoreApi;
		this.oUiApi = this.getViewData().oInject.uiApi;
		this.width = jQuery(window).height() * 0.55 + "px"; // height and width for the list relative to the window
		this.height = jQuery(window).height() * 0.55 + "px";
		var list = new sap.m.List({
			width : self.width,
			height : self.height,
			mode: sap.m.ListMode.Delete,
			items: {
				path: "/GalleryElements",
				template: new sap.m.StandardListItem({
					title:"{AnalysisPathName}",
					description:"{description}",
					tooltip : "{AnalysisPathName}" 
				})
			},
			"delete": function (evt) {
				var item = evt.getParameter("listItem");
				var sPathName = item.getProperty('title');
				var guid = self.oController.getGuidForPath(sPathName,self.viewData.jsonData.GalleryElements);
				var oListInfo = {};
				oListInfo.item = item;
				oListInfo.list = list;
				oListInfo.guid = guid;
				oListInfo.sPathName = sPathName;
				self.oUiApi.getAnalysisPath().getToolbar().getController().getConfirmDelDialog(oListInfo);
			}

		});
		var pathGalleryModel = new sap.ui.model.json.JSONModel();
		pathGalleryModel.setData(this.viewData.jsonData);
		list.setModel(pathGalleryModel);
		return list;
	}
});