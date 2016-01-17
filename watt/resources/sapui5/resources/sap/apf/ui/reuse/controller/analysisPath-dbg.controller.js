/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/**
 *@class analysisPath
 *@memberOf sap.apf.ui.reuse.controller
 *@name analysisPath
 *@description controller for view.analysisPath
 */
sap.ui.controller("sap.apf.ui.reuse.controller.analysisPath", {
	/**
	 *@this {sap.apf.ui.reuse.controller.analysisPath}
	 */
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 */
	refreshAnalysisPath : function() {
		this.getView().getCarousel().getController().refreshCarousel();
	},
	isOpenPath : false,
	isNewPath : false,
	bIsBackNavigation : false,
	onInit : function() {
		this.oCoreApi = this.getView().getViewData().oCoreApi;
		this.oUiApi = this.getView().getViewData().uiApi;
		this.bIsDirtyState = false;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method refresh
	 *@description Adds loading sign to steps which have changed 
	 *@param {number} nStartIndex index of step in analysis path after which filter has changed
	 */
	refresh : function(nStartIndex) {
		var oView = this.getView().oCarousel;
		var aStepViews = oView.stepViews;
		var i;
		if (nStartIndex !== -1) {
			for(i = nStartIndex; i < aStepViews.length; i++) {
				var oStepView = {};
				oStepView = aStepViews[i];
				if (oStepView !== undefined) {
					oStepView.oThumbnailChartLayout.setBusy(true);
					//oStepView.rerender();
				}
			}
		}
		var nActiveStepIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
		if (nActiveStepIndex > nStartIndex) {
			var oChartView = this.oUiApi.getStepContainer();
			oChartView.vLayout.setBusy(true);
		}
		var pathName = this.oUiApi.getAnalysisPath().oSavedPathName.getTitle();
		if ((this.bIsDirtyState === undefined || this.bIsDirtyState === false) && this.oCoreApi.getSteps().length !== 0) {
			var pathHasChanged = "*" + pathName;
			this.bIsDirtyState = true;
			this.oUiApi.getAnalysisPath().oSavedPathName.setTitle(pathHasChanged);
		}
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method callBackforUpdatePath 
	 *@param {object} oCurrentStep: Current Step instance 
	 *@param {boolean} bStepChanged  returns true if filter of step has changed
	 *@description Calls method updateCurrentStep if current step has changed 
	 */
	callBackForUpdatePath : function(oCurrentStep, bStepChanged) {
		var nIndex = this.oCoreApi.getSteps().indexOf(oCurrentStep);
		if (nIndex === 0) {
			this.refreshAnalysisPath();
		}
		this.updateCurrentStep(oCurrentStep, nIndex, bStepChanged);
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method callBackForUpdatePathAndSetLastStepAsActive
	 *@param {object} oCurrentStep: Current Step instance
	 *@param {boolean} bStepChanged returns true if step has changed
	 *@description Sets last step as active and calls method update Path 
	 */
	callBackForUpdatePathAndSetLastStepAsActive : function(oCurrentStep, bStepChanged) {
		var nIndex = this.oCoreApi.getSteps().indexOf(oCurrentStep);
		if (nIndex === 0) {
			var oStep = this.oCoreApi.getSteps()[this.oCoreApi.getSteps().length - 1];
			this.oCoreApi.setActiveStep(oStep);
			this.refreshAnalysisPath();
		}
		this.updateCurrentStep(oCurrentStep, nIndex, bStepChanged);
		this.oUiApi.getLayoutView().setBusy(false);
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method updateCurrentStep
	 *@param {object} oCurrentStep: CurrentStep instance
	 *@param {number} nIndex: index of CurrentStep
	 *@param {boolean} bStepChanged returns true if step has changed
	 *@description updates Analysis Path if steps following current step has changed. If CurrentStep is active draws chart in main area.
	 */
	updateCurrentStep : function(oCurrentStep, nIndex, bStepChanged) {
		var isOpenPath = this.oUiApi.getAnalysisPath().getController().isOpenPath;
		var nActiveIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
		var isActiveStep = (nIndex === nActiveIndex);
		this.drawThumbnail(nIndex, bStepChanged || isOpenPath);
		if (isActiveStep) {
			this.drawMainChart(bStepChanged);
		}
		if (this.oUiApi.getAnalysisPath().getController().isOpenPath && (this.oCoreApi.getSteps().indexOf(oCurrentStep) === (this.oCoreApi.getSteps().length - 1))) {
			this.oUiApi.getLayoutView().setBusy(false);
			this.oUiApi.getAnalysisPath().getController().isOpenPath = false;
		}
		if (this.oUiApi.getAnalysisPath().getController().bIsBackNavigation && (this.oCoreApi.getSteps().indexOf(oCurrentStep) === (this.oCoreApi.getSteps().length - 1))) {
			this.oUiApi.getLayoutView().setBusy(false);
			this.oUiApi.getAnalysisPath().getController().bIsBackNavigation = false;
		}
		this.oUiApi.getAnalysisPath().getController().isNewPath = false;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method drawMainChart
	 *@param {boolean} bStepChanged returns true if step has changed
	 *@description gets chartArea of application from API sap.apf.ui.getStepConatiner() and draws Chart 
	 */
	drawMainChart : function(bStepChanged) {
		var oChartView = this.oUiApi.getStepContainer();
		oChartView.getController().drawStepContent(bStepChanged);
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.analysisPath
	 *@method drawMainChart
	 *@param {number} nIndex index of step for which thumbnail has to be drawn
	 *@param {boolean} bStepChanged returns true if step has changed
	 *@description gets chartArea of application from API sap.apf.ui.getStepConatiner() and draws Chart 
	 */
	drawThumbnail : function(nIndex, bStepChanged) {
		var oStepView = this.getView().getCarousel().getStepView(nIndex);
		oStepView.getController().drawThumbnailContent(bStepChanged);
	}
});