/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global document, window, dndBox*/
/**
 *@class carousel
 *@name carousel
 *@memberOf sap.apf.ui.reuse.view
 *@description Layout holds Analysis Steps
 *@returns {Carousel}  
 */
sap.ui.jsview("sap.apf.ui.reuse.view.carousel", {
	/**
	 *@memberOf sap.apf.ui.reuse.view.carousel
	 *@method getStepGallery
	 *@see sap.apf.ui.reuse.view.stepGallery
	 *@return {sap.apf.ui.reuse.view.stepGallery}
	 */
	getStepGallery : function() {
		var stepGallery = this.oController.stepGalleryView;
		return stepGallery;
	},
	getChartToolbar : function() {
		return this.oController.oStepToolbar;
	},
	carouselContent : function (oController) {
		jQuery.sap.require('sap.apf.ui.controls.draggableCarousel.DraggableCarousel');
		var self = this;
		this.oController = oController;
		this.stepViews = [];
		var oViewData = this.getViewData().oInject;
		self.oCoreApi = oViewData.oCoreApi;
		self.oUiApi = oViewData.uiApi;
		var separator = new sap.ui.core.Icon({
			src : "sap-icon://arrow-bottom"
		}).addStyleClass('downArrow');
		var separatorEle = document.createElement('div');
		separatorEle.innerHTML = sap.ui.getCore().getRenderManager().getHTML(separator);
		var removeIcon = new sap.ui.core.Icon({
			src : "sap-icon://sys-cancel-2",
			size : "20px"
		}).addStyleClass('removeIcon');
		var removeIconEle = document.createElement('div');
		removeIconEle.innerHTML = sap.ui.getCore().getRenderManager().getHTML(removeIcon);
		var height = jQuery(window).height() - sap.apf.ui.utils.CONSTANTS.carousel.SCROLLCONTAINER + "px";
		var width = "320px"; // S2 View Content Width.
		window.onresize = function() {
			var height = jQuery(window).height() - sap.apf.ui.utils.CONSTANTS.carousel.SCROLLCONTAINER + "px";
			jQuery('.DnD-container').css({"height" : jQuery(window).height() - sap.apf.ui.utils.CONSTANTS.carousel.DNDBOX + "px"});
			jQuery(".scrollContainerEle").css("height", height);
		};
		this.dndBox = new sap.apf.ui.controls.draggableCarousel.DraggableCarousel({
			containerHeight : jQuery(window).height() - sap.apf.ui.utils.CONSTANTS.carousel.DNDBOX + "px",
			containerWidth : width,
			blockHeight : sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.STEP_HEIGHT,
			blockWidth : sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.STEP_WIDTH,
			blockMargin : sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.STEP_MARGIN,
			separatorHeight : sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.SEPARATOR_HEIGHT,
			removeIconHeight : sap.apf.ui.utils.CONSTANTS.thumbnailDimensions.REMOVE_ICON_HEIGHT,
			separator : separatorEle,
			removeIcon : removeIconEle,
			onBeforeDrag : function(dragIndex) {
			},
			onAfterDrop : oController.moveStep.bind(oController),
			onAfterRemove : oController.removeStep.bind(oController),
			onAfterSelect : function (index) {
				//Based on drag-state setActiveStep or Add Analysis Step
				if (jQuery(this).attr("drag-state") === "true") {
					self.getStepView(index).oController.setActiveStep(index);
				} else {
					oController.showStepGallery();
				}
			}
		});
		var uniqueId = this.createId("dnd-Holder");
		this.oHtml = new sap.ui.core.HTML({
			content : "<div id = '" + jQuery.sap.encodeHTML(uniqueId) + "'></div>", //TODO Check whether DOM is getting destroyed properly
			sanitizeContent : true,
			afterRendering : function() {
				self.dndBox.placeAt(uniqueId);
				jQuery(self.dndBox.eleRefs.blocks[0]).height("80px");
			}
		});
		var sampleDiv;
		this.addButton = new sap.m.Button({
			text : self.oCoreApi.getTextNotHtmlEncoded("add-step"),
			width : "100%",
			icon : "sap-icon://add",
			press : function(evt) {
				oController.showStepGallery();
			}
		});
		sampleDiv = document.createElement('div');
		sampleDiv.setAttribute('class', 'addStepBtnHolder');
		jQuery(sampleDiv).html(jQuery(sap.ui.getCore().getRenderManager().getHTML(this.addButton)).attr("tabindex", -1));
		
		this.dndBox.addBlock({
			blockElement : sampleDiv,
			dragState : false,
			dropState : false,
			removable : false
		});
		this.up = new sap.m.Button({
			icon : "sap-icon://arrow-top",
			press : function() {
				var activeStepIndex = self.oCoreApi.getSteps().indexOf(self.oCoreApi.getActiveStep());
				if (activeStepIndex !== 0) {
					var newPos = activeStepIndex - 1;
					var success = self.oUiApi.getAnalysisPath().getCarousel().dndBox.swapBlocks(activeStepIndex, newPos);
					if (success) {
						self.oUiApi.getAnalysisPath().getCarousel().getController().moveStep(activeStepIndex, newPos);
					}
				}
			}
		});
		this.down = new sap.m.Button({
			icon : "sap-icon://arrow-bottom",
			press : function() {
				var activeStepIndex = self.oCoreApi.getSteps().indexOf(self.oCoreApi.getActiveStep());
				if (activeStepIndex !== (self.oCoreApi.getSteps().length - 1)) {
					var newPos = activeStepIndex + 1;
					var success = self.oUiApi.getAnalysisPath().getCarousel().dndBox.swapBlocks(activeStepIndex, newPos);
					if (success) {
						self.oUiApi.getAnalysisPath().getCarousel().getController().moveStep(activeStepIndex, newPos);
					}
				}
			}
		});
		this.oCarousel = new sap.m.ScrollContainer({
			content : this.oHtml,
			height : height,
			horizontal : false,
			vertical : true
		}).addStyleClass("scrollContainerEle");
		return this.oCarousel;
	},
	getControllerName : function() {
		return "sap.apf.ui.reuse.controller.carousel";
	},
	createContent : function(oController) {
		var carouselContent = this.carouselContent(oController);
		return carouselContent;
	},
	getStepView : function(stepIndex) {
		return this.stepViews[stepIndex];
	}
});
