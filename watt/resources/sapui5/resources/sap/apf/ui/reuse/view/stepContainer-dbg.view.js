/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/**
 * @class stepContainer
 * @name stepContainer
 * @memberOf sap.apf.ui.reuse.view
 * @description Holds the step in main area. Includes the step toolbar view and step representation view
 * @returns {stepContainerLayout}
 */
sap.ui.jsview("sap.apf.ui.reuse.view.stepContainer", {
	/**
	 * @this {sap.apf.ui.reuse.view.stepContainer}
	 *
	 */
	/**
	 * @memberOf sap.apf.ui.reuse.view.stepContainer
	 * @method getStepToolbar
	 * @see sap.apf.ui.reuse.view.stepToolbar
	 * @description Getter for step toolbar container 
	 * @returns stepToolbar view 
	 */
	getStepToolbar : function() {
		return this.oStepToolbar;
	},
	getControllerName : function() {
		return "sap.apf.ui.reuse.controller.stepContainer";
	},

	createContent : function(oController) {
		var oViewData = this.getViewData();
		this.oStepToolbar = sap.ui.view({viewName:"sap.apf.ui.reuse.view.stepToolbar", type:sap.ui.core.mvc.ViewType.JS,viewData :oViewData});
		this.stepLayout = new sap.ui.layout.VerticalLayout({
			content : [ this.oStepToolbar],
			width : "100%"
		});
		this.vLayout = new sap.ui.layout.VerticalLayout({
			content : this.stepLayout,
			width : "100%"
		});
		this.vLayout.setBusy(true);
		return this.vLayout; //holds chart and toolbar
	}

});