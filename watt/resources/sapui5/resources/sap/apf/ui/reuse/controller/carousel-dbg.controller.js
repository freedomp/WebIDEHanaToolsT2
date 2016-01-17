/*!

 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* globals document */
/**
 *@class carousel
 *@name carousel
 *@memberOf sap.apf.ui.reuse.controller
 *@description controller for view.carousel
 */
sap.ui.controller("sap.apf.ui.reuse.controller.carousel", {
	/**
	*@this {sap.apf.ui.reuse.controller.carousel}
	*/
	onAfterRendering : function() {
		if (this.oCoreApi.getSteps().length < 1) {
			jQuery(".DnD-separator").hide(); //Hide the Separator initially 
		}
		// remaining code from getInitialStep:
		this.oViewData = this.getView().getViewData().oInject;
		this.oUiApi = this.oViewData.uiApi;
		jQuery(this.oUiApi.getStepContainer().getDomRef()).hide();
		if (jQuery("#" + this.initialText.getId()).length === 0) {
			jQuery('#' + this.oUiApi.getStepContainer().getId()).parent().append(sap.ui.getCore().getRenderManager().getHTML(this.initialText));
		}
		if (this.oUiApi.getAnalysisPath().getController().isOpenPath) {
			jQuery(".initialText").remove();
		}
	},
	onInit : function() {
		var oViewData = this.getView().getViewData().oInject;
		this.oCoreApi = oViewData.oCoreApi;
		this.oUiApi = oViewData.uiApi;
		this.stepGalleryView = sap.ui.view({
			type : sap.ui.core.mvc.ViewType.JS,
			viewName : "sap.apf.ui.reuse.view.stepGallery",
			viewData : oViewData
		});
		this.initialText = new sap.m.Label({
			text : oViewData.oCoreApi.getTextNotHtmlEncoded('initialText')
		}).addStyleClass('initialText');
	},
	showStepGallery : function() {
		this.stepGalleryView.oController.openHierarchicalSelectDialog();
	},
	/**
	*@memberOf sap.apf.ui.reuse.controller.carousel
	*@method onAfterRendering 
	*@description Attaches event on Add Step Button and instantiate Step Gallery
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	*/
	onBeforeRendering : function() {
		this.oUiApi.getLayoutView().getController().addMasterFooterContentLeft(this.getView().up);
		this.oUiApi.getLayoutView().getController().addMasterFooterContentLeft(this.getView().down);
	},
	getStepData : function(stepObj) {
		var oSelf = this;
		var fStep = stepObj;
		var oStep = {};
		oStep.index = this.oCoreApi.getSteps().indexOf(stepObj);
		oStep.title = this.oCoreApi.getTextNotHtmlEncoded(fStep.title);
		oStep.thumbnail = this.getThumbnailDataset(stepObj);
		return oStep;
	},
	/**
	*@memberOf sap.apf.ui.reuse.controller.carousel
	*@method refreshCarousel
	*@description Binds to model and set the Steps as droppable 
	 */
	refreshCarousel : function() {
		if (this.oCoreApi.getSteps().length > this.getView().stepViews.length) {
			this.addStep(this.oCoreApi.getSteps());//sap.apf.getSteps()[sap.apf.getSteps().length - 1]
		}
		//		var indexActive = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
		//		var activeStep = this.getView().dndBox.eleRefs.blocks[indexActive];
		//		if (activeStep !== undefined) {
		//			//activeStep.scrollIntoViewIfNeeded();
		//		}
	},
	addStep : function(stepObj) {
		this.oViewData = this.getView().getViewData().apfInstance;
		if (stepObj instanceof Array) {
			if (this.oUiApi.getAnalysisPath().getController().isOpenPath || this.oUiApi.getAnalysisPath().getController().bIsBackNavigation) {
				var i;
				for(i = 0; i < stepObj.length; i++) {
					this.addStep(stepObj[i]);
				}
				return;
			} else {
				this.addStep(stepObj[this.oCoreApi.getSteps().length - 1]);
				return;
			}
		}
		var stepView = new sap.ui.view({
			viewName : "sap.apf.ui.reuse.view.step",
			type : sap.ui.core.mvc.ViewType.JS,
			viewData : this.getView().getViewData().oInject
		});
		var jsonModel = new sap.ui.model.json.JSONModel();
		stepView.setModel(jsonModel);
		var stepData = this.getStepData(stepObj);
		jsonModel.setData(stepData);
		this.getView().stepViews.push(stepView);
		var sampleDiv = document.createElement('div');
		sampleDiv.innerHTML = sap.ui.getCore().getRenderManager().getHTML(stepView);
		var dndBox = this.getView().dndBox;
		var blockIndex = dndBox.eleRefs.blocks.length - 1;
		jQuery(".initialText").remove();
		jQuery(this.oUiApi.getStepContainer().getDomRef()).show(); // Show the step container
		jQuery(".DnD-separator").show(); //Show the Seperator once the step is added
		var isConfigInitial = this.Step ? this.Step.categories[0].id : undefined;
		if (isConfigInitial === "initial") {
			dndBox.insertBlock({
				blockElement : sampleDiv,
				dragState : false,
				dropState : false,
				removable : false
			}, blockIndex);
		} else {
			dndBox.insertBlock({
				blockElement : sampleDiv
			}, blockIndex);
		}
		if (stepData.index === this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep())) {
			stepView.toggleActiveStep();
		}
		stepView.rerender();
		this.oUiApi.getLayoutView().setBusy(true);
	},
	moveStep : function(dragIndex, dropIndex) {
		var carouselView = this.oUiApi.getAnalysisPath().getCarousel();
		if (dragIndex === dropIndex) {
			return;
		}
		carouselView.stepViews = (function(array, from, to) {
			var diff = Math.abs(to - from);
			var adder = (to - from) > 0 ? 1 : -1;
			var temp;
			while (diff--) {
				temp = array[from];
				array[from] = array[from + adder];
				array[from + adder] = temp;
				from = from + adder;
			}
			return array;
		})(carouselView.stepViews, dragIndex, dropIndex);
		this.oUiApi.getAnalysisPath().getController().refresh(Math.min(dragIndex, dropIndex));
		var draggedStep = this.oCoreApi.getSteps()[dragIndex];
		this.oCoreApi.moveStepToPosition(draggedStep, dropIndex, this.oUiApi.getAnalysisPath().getController().callBackForUpdatePath.bind(this.oUiApi.getAnalysisPath().getController()));
	},
	removeStep : function(removeIndex) {
		var carouselView = this.oUiApi.getAnalysisPath().getCarousel();
		carouselView.stepViews.splice(removeIndex, 1);
		var stepLength = carouselView.stepViews.length;
		var activeStepIndex = this.oCoreApi.getSteps().indexOf(this.oCoreApi.getActiveStep());
		if (stepLength > 0) {
			if (removeIndex === activeStepIndex) {
				var newActiveStepIndex;
				var stepView;
				if (activeStepIndex === 0) {
					newActiveStepIndex = activeStepIndex;
					stepView = carouselView.stepViews[newActiveStepIndex];
					stepView.toggleActiveStep();
					this.oCoreApi.setActiveStep(this.oCoreApi.getSteps()[newActiveStepIndex + 1]);
				} else {
					newActiveStepIndex = activeStepIndex - 1;
					stepView = carouselView.stepViews[newActiveStepIndex];
					stepView.toggleActiveStep();
					this.oCoreApi.setActiveStep(this.oCoreApi.getSteps()[newActiveStepIndex]);
				}
			}
		} else {
			jQuery(".DnD-separator").hide();// If step length is 0 then hide the seperator
			jQuery(this.oUiApi.getStepContainer().getDomRef()).hide(); //Hide the step container
			this.oUiApi.getStepContainer().getStepToolbar().chartToolbar.removeAllCharts();
			jQuery('#' + this.oUiApi.getStepContainer().getId()).parent().append(sap.ui.getCore().getRenderManager().getHTML(this.initialText));
		}
		//Remove the event on before render setHeighAndWidth function on delete of step 
		var removeStep = this.oCoreApi.getSteps()[removeIndex];
		if (removeStep.getSelectedRepresentation().chart) {
			removeStep.getSelectedRepresentation().chart.removeEventDelegate(this.oUiApi.getStepContainer().getController().fnSetHeightAndWidth);
			this.oUiApi.getStepContainer().getController().fnSetHeightAndWidth = null;
			this.oUiApi.getStepContainer().getController().setHeightAndWidth = null;
		}
		this.oUiApi.getStepContainer().getController().representationInstance = null;
		this.oUiApi.getStepContainer().getController().currentSelectedRepresentationId = null;
		this.oUiApi.getAnalysisPath().getController().refresh(removeIndex);
		this.oCoreApi.removeStep(removeStep, this.oUiApi.getAnalysisPath().getController().callBackForUpdatePath.bind(this.oUiApi.getAnalysisPath().getController()));
		this.oUiApi.getLayoutView().getController().enableDisableOpenIn(); //Enable/disable open in based on current active step
	},
	removeAllSteps : function() {
		var removeIndex = 0;
		var i;
		var dndBox = this.getView().dndBox;
		var carouselView = this.oUiApi.getAnalysisPath().getCarousel();
		var stepLength = carouselView.stepViews.length;
		function fnCallback(){}
		for(i = 1; i <= stepLength; i++) {
			dndBox.removeBlock(removeIndex, fnCallback);
			//Remove the event on before render setHeighAndWidth function on delete of step 
			var removeStep = this.oCoreApi.getSteps()[i - 1];
			if (removeStep.getSelectedRepresentation().chart) {
				removeStep.getSelectedRepresentation().chart.removeEventDelegate(this.oUiApi.getStepContainer().getController().fnSetHeightAndWidth);
				this.oUiApi.getStepContainer().getController().fnSetHeightAndWidth = null;
				this.oUiApi.getStepContainer().getController().setHeightAndWidth = null;
			}
			this.oUiApi.getStepContainer().getController().representationInstance = null;
			this.oUiApi.getStepContainer().getController().currentSelectedRepresentationId = null;
			carouselView.stepViews.splice(removeIndex, 1);
		}
		jQuery(".DnD-separator").hide(); //Hide the seperator 
		this.oUiApi.getStepContainer().getStepToolbar().chartToolbar.removeAllCharts();
		this.oUiApi.getLayoutView().getController().enableDisableOpenIn(); //Enable/disable open in based on current active step
	},
	getThumbnailDataset : function(oStep) {
		var oSelf = this;
		var aThumbnails = [ "leftUpper", "rightUpper", "leftLower", "rightLower" ];
		var oThumbnailFromStep = oStep.thumbnail;
		var oThumbnailFromRepresentation = oStep.getSelectedRepresentationInfo().thumbnail;
		var oResultThumbnail = {};
		aThumbnails.forEach(function(sThumbnail) {
			var bHasRepresentationThumbnail = oThumbnailFromRepresentation && oThumbnailFromRepresentation[sThumbnail];
			bHasRepresentationThumbnail = bHasRepresentationThumbnail && !oSelf.oCoreApi.isInitialTextKey(oThumbnailFromRepresentation[sThumbnail]);
			var bHasStepThumbnail = oThumbnailFromStep && oThumbnailFromStep[sThumbnail];
			bHasStepThumbnail = bHasStepThumbnail && !oSelf.oCoreApi.isInitialTextKey(oThumbnailFromStep[sThumbnail]);
			if (bHasRepresentationThumbnail) {
				oResultThumbnail[sThumbnail] = oSelf.oCoreApi.getTextNotHtmlEncoded(oThumbnailFromRepresentation[sThumbnail]);
				return;
			} else if (bHasStepThumbnail) {
				oResultThumbnail[sThumbnail] = oSelf.oCoreApi.getTextNotHtmlEncoded(oThumbnailFromStep[sThumbnail]);
				return;
			}
		});
		return oResultThumbnail;
	}
});
