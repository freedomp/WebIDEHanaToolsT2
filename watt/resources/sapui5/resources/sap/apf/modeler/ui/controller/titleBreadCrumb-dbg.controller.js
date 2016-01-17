/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
/**
* @class titleBreadCrumb
* @memberOf sap.apf.modeler.ui.controller
* @name titleBreadCrumb
* @description controller for view.titleBreadCrumb
*/
sap.ui.controller("sap.apf.modeler.ui.controller.titleBreadCrumb", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.titleBreadCrumb#onInit
	* @description Reads data from view#getViewData.
	* Adds style class to the title and breadcrumb
	* Updates the title and breadcrumb of the subview
	* */
	onInit : function() {
		this.oViewData = this.getView().getViewData();
		this.getText = this.oViewData.getText;
		this._addConfigStyleClass();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.titleBreadCrumb#_addConfigStyleClass
	* @description Adds style classes to the title and breadcrumb of the subview
	* */
	_addConfigStyleClass : function() {
		this.byId("IdBreadCrumb").addStyleClass("breadCrumb");
		this.byId("IdFormTitle").addStyleClass("formTitle");
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.titleBreadCrumb#setTitleAndBreadCrumb
	* @param {String} Form Title of the detail page 
	* @description Updates the title and breadcrumb
	* */
	setTitleAndBreadCrumb : function(sFormTitle) {
		this.byId("IdFormTitle").setText(sFormTitle);
	}
});