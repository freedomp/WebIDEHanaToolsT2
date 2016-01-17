/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global window, clearTimeout, setTimeout */
/**
 *@class stepContainer
 *@name  stepContainer
 *@memberOf sap.apf.ui.reuse.controller
 *@description controller of view.stepContainer
 */
sap.ui.controller("sap.apf.ui.reuse.controller.stepContainer", {
	/**
	 *@this {sap.apf.ui.reuse.controller.stepContainer}
	 */
	onInit : function() {
		this.oCoreApi = this.getView().getViewData().oCoreApi;
		this.oUiApi = this.getView().getViewData().uiApi;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method drawSelectionContainer
	 *@description returns the selection label and count
	 */
	drawSelectionContainer : function() {
		this.getView().getStepToolbar().getController().showSelectionCount();
	},
	resizeContent : function() {
		if (this.oCoreApi.getActiveStep()) { //If Active Step Exists
			//Set Scroll Position to first Visible Row for table representation
			if (this.oCoreApi.getActiveStep().getSelectedRepresentation().type === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
				//var representation = this.oCoreApi.getActiveStep().getSelectedRepresentation();
				this.drawStepContent();
				var scrollContainerHeight = ((window.innerHeight - jQuery('.tableWithoutHeaders').offset().top) - 20) + "px";
				jQuery('.tableWithoutHeaders').css({
					"height" : scrollContainerHeight
				});
			} else {
				this.drawStepContent();
			}
		}
	},
	onAfterRendering : function() {
		var self = this;
		var timeoutResize;
		jQuery(window).resize(function() {
			clearTimeout(timeoutResize);
			timeoutResize = setTimeout(function() {
				self.resizeContent();
			}, 500);
		});
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method getCurrentRepresentation
	 *@description returns the representation instance
	 */
	getCurrentRepresentation : function() {
		return this.representationInstance;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method drawRepresentation
	 *@description returns the representation, sets the title and calculates the height of representation before rendering
	 */
	drawRepresentation : function() {
		var self = this;
		var oActiveStep = this.oCoreApi.getActiveStep();
		if (oActiveStep.getSelectedRepresentation().bIsAlternateView === undefined || oActiveStep.getSelectedRepresentation().bIsAlternateView === false) {
			this.representationInstance = oActiveStep.getSelectedRepresentation();
		} else {
			this.representationInstance = oActiveStep.getSelectedRepresentation().toggleInstance;
			var data = oActiveStep.getSelectedRepresentation().getData(), metadata = oActiveStep.getSelectedRepresentation().getMetaData();
			this.representationInstance.setData(data, metadata);
		}
		var oLongTitle = oActiveStep.longTitle && !this.oCoreApi.isInitialTextKey(oActiveStep.longTitle.key) ? oActiveStep.longTitle : undefined;
		var oTitle = oLongTitle || oActiveStep.title;
		var oStepTitle = this.oCoreApi.getTextNotHtmlEncoded(oTitle);
		//		var stepTitle = new sap.m.Label({
		//			text : oStepTitle,
		//			design : "Bold"
		//		}).addStyleClass("sapApfDetailTitle");
		var content = this.representationInstance.getMainContent(oStepTitle);
		var chartToolbarID = this.getView().getStepToolbar().chartToolbar.getId();
		this.setHeightAndWidth = function() {
			var toolbarHeight;
			var toolbarWidth;
			if (jQuery("#" + chartToolbarID).length !== 0) {
				toolbarHeight = jQuery("#" + chartToolbarID + " > div:first-child > div:nth-child(2)").offset().top;
				toolbarWidth = jQuery("#" + chartToolbarID + " > div:first-child > div:nth-child(2)").width();
			} else {
				toolbarHeight = "0";
				toolbarWidth = jQuery(window).width();
			}
			var cHeight = self.getView().getStepToolbar().chartToolbar.getFullScreen() ? (jQuery(window).height() - toolbarHeight) : (jQuery(window).height() - toolbarHeight) - jQuery(".applicationFooter").height();
			var cWidth = toolbarWidth;
			if (self.oCoreApi.getActiveStep().getSelectedRepresentation().bIsAlternateView || self.oCoreApi.getActiveStep().getSelectedRepresentation().type === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
				content.getContent()[0].setHeight((cHeight - 5) + "px");
				content.getContent()[0].setWidth(cWidth + "px");
			} else if (self.oCoreApi.getActiveStep().getSelectedRepresentation().type === sap.apf.ui.utils.CONSTANTS.representationTypes.GEO_MAP) {
				var div = (jQuery(content.getContent())[0]);
				div.style.height = cHeight + "px";
				div.style.width = cWidth + "px";
				content.setContent(div.outerHTML);
			} else {
				content.setHeight(cHeight + "px");
				content.setWidth(cWidth + "px");
			}
		};
		//Undefined methods Viz Charts 		
		content.getIcon = function() {
			return;
		};
		content.getLabel = function() {
			return;
		};
		this.fnSetHeightAndWidth = {
			onBeforeRendering : function() {
				self.setHeightAndWidth();
			}
		};
		content.addEventDelegate(this.fnSetHeightAndWidth);
		//this.getView().getRepresentationContainer().getController().drawRepresentation(content);
		this.getView().getStepToolbar().getController().drawRepresentation(content);
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method createAlternateRepresentation
	 *@description creates the alternate representation from chart and returns the main content
	 */
	createAlternateRepresentation : function(sIndex) {
		var self = this;
		var addAdditionalFields = function(param) {
			var dimensions = param.dimensions;
			var metadata = self.oCoreApi.getSteps()[sIndex].getSelectedRepresentation().getMetaData();
			if (metadata === undefined) {
				return param;
			}
			var i;
			for(i = 0; i < dimensions.length; i++) {
				var bSapTextExists = metadata.getPropertyMetadata(dimensions[i].fieldName).hasOwnProperty('text');
				if (bSapTextExists) {
					var newField = {};
					newField.fieldName = metadata.getPropertyMetadata(dimensions[i].fieldName).text;
					param.dimensions.push(newField);
				}
			}
			param.isAlternateRepresentation = true;
			return param;
		};
		var oActiveStep = self.oCoreApi.getSteps()[sIndex];
		var currentRepresentation = oActiveStep.getSelectedRepresentation();
		var parameter = jQuery.extend(true, {}, currentRepresentation.getParameter());
		delete parameter.alternateRepresentationTypeId;
		delete parameter.alternateRepresentationType;
		parameter = addAdditionalFields(parameter);
		// Using the APF Core method to create alternate representation instance
		this.newToggleInstance = this.oCoreApi.createRepresentation(currentRepresentation.getParameter().alternateRepresentationType.constructor, parameter);
		var data = currentRepresentation.getData();
		var metadata = currentRepresentation.getMetaData();
		if (data !== undefined && metadata !== undefined) { //Done in order to match the setData invocation through APFCore in case of switch representation
			this.newToggleInstance.setData(data, metadata);
		}
		this.newToggleInstance.adoptSelection(currentRepresentation);
		return this.newToggleInstance;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method isActiveStepChanged
	 *@description Decides whether the active Step is drawn on the main content or not.
	 */
	isActiveStepChanged : function() {
		var bActiveStepChange;
		if (this.currentActiveStepIndex === undefined) {
			this.currentActiveStepIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
			bActiveStepChange = true;
		} else if (this.currentActiveStepIndex !== this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep())) {
			this.currentActiveStepIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
			bActiveStepChange = true;
		} else {
			bActiveStepChange = false;
		}
		return bActiveStepChange;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method isSelectedRepresentationChanged
	 *@description Decides whether the active Step's selected representation has changed or not.
	 */
	isSelectedRepresentationChanged : function() {
		var bSelectedRepresentationChange;
		if (this.currentSelectedRepresentationId === undefined || this.currentSelectedRepresentationId === null) {
			this.currentSelectedRepresentationId = this.oCoreApi.getActiveStep().getSelectedRepresentationInfo().representationId;
			bSelectedRepresentationChange = true;
		} else if (this.currentSelectedRepresentationId !== this.oCoreApi.getActiveStep().getSelectedRepresentationInfo().representationId) {
			this.currentSelectedRepresentationId = this.oCoreApi.getActiveStep().getSelectedRepresentationInfo().representationId;
			bSelectedRepresentationChange = true;
		} else if (this.getCurrentRepresentation().type !== this.oCoreApi.getActiveStep().getSelectedRepresentation().type) {
			this.currentSelectedRepresentationId = this.oCoreApi.getActiveStep().getSelectedRepresentationInfo().representationId;
			bSelectedRepresentationChange = true;
		} else {
			bSelectedRepresentationChange = false;
		}
		return bSelectedRepresentationChange;
	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.stepContainer
	 *@method drawStepContent
	 *@description Draws the main content of the chart
	 */
	drawStepContent : function(bDrawRepresentation) {
		var nActiveStepIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
		var bThumbnailRefreshing = this.oUiApi.getAnalysisPath().getCarousel().getStepView(nActiveStepIndex).oThumbnailChartLayout.isBusy();
		var isOpenPath = this.oUiApi.getAnalysisPath().getController().isOpenPath;
		var isNewPath = this.oUiApi.getAnalysisPath().getController().isNewPath;
		if (bThumbnailRefreshing) {
			this.getView().vLayout.setBusy(true);
			return;
		}
		var bActiveStepChange = this.isActiveStepChanged();
		var bSelectedRepresentationChange = this.isSelectedRepresentationChanged();
		var bRedrawRepresentation = (bDrawRepresentation === undefined || bDrawRepresentation === true);
		if (bRedrawRepresentation || bActiveStepChange || bSelectedRepresentationChange || isOpenPath || isNewPath) {
			this.drawRepresentation();
		} else {
			if (this.oCoreApi.getSteps().length >= 1) {
				this.drawSelectionContainer();
			}
		}
		if (this.getView().vLayout.isBusy()) {
			this.getView().vLayout.removeAllContent();
			this.getView().vLayout.addContent(this.getView().stepLayout);
			this.getView().vLayout.setBusy(false);
		}
		this.getView().vLayout.setBusy(false);
	}
});
