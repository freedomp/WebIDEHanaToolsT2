/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global  window*/
jQuery.sap.require('sap.apf.ui.utils.helper');
/**
 *@class stepToolbar
 *@name stepToolbar
 *@memberOf sap.apf.ui.reuse.controller
 *@description controller for view.stepToolbar
 */
sap.ui.controller("sap.apf.ui.reuse.controller.stepToolbar", {
    /**
     *@this {sap.apf.ui.reuse.controller.stepToolbar}
     */
    chartIconInserted: false,
    alternateRepresentationIcon: false,
    alternateRepresentationBool: false,
    selectedRepresentation: null,
    alternateRepresentationBtn: {},
    selectedNumber: null,
    selectedNumberLink: null,
    isSwitchRepresentation: false,
    viewSettingsIcon: null,
    onInit: function() {
        this.oCoreApi = this.getView().getViewData().oCoreApi;
        this.oUiApi = this.getView().getViewData().uiApi;
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawAlternateRepresentation
     *@description Inserts the alternate representation icon to the chart toolbar
     */
    drawAlternateRepresentation: function() {
        var that = this;
        this.alternateRepresentationBtn = new sap.m.Button({
            icon: this.oCoreApi.getActiveStep().getSelectedRepresentation().getAlternateRepresentation().picture,
            tooltip: this.oCoreApi.getTextNotHtmlEncoded("TableRepresentation"),
            press: function() {
                var oStep = that.oCoreApi.getActiveStep();
                var currentRepresentation = oStep.getSelectedRepresentation();
                var activeStepIndex = that.oCoreApi.getSteps().indexOf(oStep);
                that.selectedRepresentation = "table";
                currentRepresentation.bIsAlternateView = true;
                if (currentRepresentation.toggleInstance === undefined) {
                    currentRepresentation.toggleInstance = that.oUiApi.getStepContainer().getController().createAlternateRepresentation(activeStepIndex);
                } else {
                    var data = currentRepresentation.getData(),
                        metadata = currentRepresentation.getMetaData();
                    if (data !== undefined && metadata !== undefined) {
                        currentRepresentation.toggleInstance.setData(data, metadata);
                    }
                    currentRepresentation.toggleInstance.adoptSelection(currentRepresentation);
                }
                that.oUiApi.getAnalysisPath().getController().refresh(-1);
                that.oUiApi.getStepContainer().getController().drawStepContent();
                that.oUiApi.getAnalysisPath().getCarousel().getStepView(activeStepIndex).getController().drawThumbnailContent(true);
            }
        }).addStyleClass("alternateButton");
        this.insertViewSettingsIcon();
        this.getView().chartToolbar.getToolBar().insertContentRight(this.alternateRepresentationBtn);
    },
    /** 
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawMultipleRepresentation
     *@description Method to insert icons for multiple representations
     */
    insertViewSettingsIcon: function() {
        var that = this;
        this.sortButton = new sap.m.Button({
            icon: "sap-icon://drop-down-list",
            tooltip: this.oCoreApi.getTextNotHtmlEncoded("view-Settings"),
            press: function() {
                if (that.oCoreApi.getActiveStep().getSelectedRepresentation().type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
                    that.oCoreApi.getActiveStep().getSelectedRepresentation().toggleInstance.viewSettingsDialog.open();
                } else {
                    that.oCoreApi.getActiveStep().getSelectedRepresentation().viewSettingsDialog.open();
                }
            }
        }).addStyleClass("sortButton");
        this.getView().chartToolbar.getToolBar().insertContentRight(this.sortButton);
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method showSelectionCount
     *@description Shows the selected count(label) and delete icon of the representation
     */
    showSelectionCount: function() {
        var oActiveStep = this.oCoreApi.getActiveStep();
        var selectedRepresentation = oActiveStep.getSelectedRepresentation();
        var selectionCount;
        if (typeof selectedRepresentation.getSelections === "function") {
        	selectionCount = selectedRepresentation.getSelections().length;
        } else if (typeof selectedRepresentation.getSelectionCount === "function") {
        	selectionCount = selectedRepresentation.getSelectionCount();
        } else {
        	selectionCount = 0;
        }
        var bRequirefFilterPresent = selectedRepresentation.getParameter().requiredFilters !== undefined && selectedRepresentation.getParameter().requiredFilters.length !== 0;
        var bMetadataPresent = selectedRepresentation.getMetaData !== undefined && selectedRepresentation.getMetaData() !== undefined && selectedRepresentation.getMetaData().hasOwnProperty("getPropertyMetadata");
        var selectedDimension = bRequirefFilterPresent && bMetadataPresent ? selectedRepresentation.getMetaData().getPropertyMetadata(selectedRepresentation.getParameter().requiredFilters[0]).label : null;
        if (selectedDimension === null || selectionCount === 0) {
            jQuery(".showSelection").hide();
            jQuery(".resetSelection").hide();
        } else if (selectionCount > 0) {
            this.selectedNumber.setText("(" + this.oCoreApi.getTextNotHtmlEncoded("selected-objects", [selectedDimension]));
            this.selectedNumberLink.setText(selectionCount);
            this.selectedNumberEndText.setText(')');
            jQuery(".showSelection").show();
            jQuery(".resetSelection").show();
        }
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method insertContentLeft
     *@description Inserts the Selection label,count and delete icon to the step toolbar
     */
    insertContentLeft: function() {
        var that = this;
        // insert left content to the toolbar
        this.currentStepText = new sap.m.Label({
            wrapping: true,
            text: this.oCoreApi.getTextNotHtmlEncoded("currentStep")
        }).addStyleClass("currentStep");
        this.selectedNumber = new sap.m.Label({
            wrapping: true
        }).addStyleClass("showSelection");
        this.selectedNumberEndText = new sap.m.Label({
        	wrapping: true
        }).addStyleClass("showSelection");
        this.selectedNumberEndText.addStyleClass("selectedNumberEndText");
        this.selectedNumberLink = new sap.m.Link({
            press: function() {
                if (that.selectionDisplayDialog) {
                    that.selectionDisplayDialog.destroy();
                }
                that.selectionDisplayDialog = new sap.ui.jsfragment("sap.apf.ui.reuse.fragment.selectionDisplay", that);
                that.selectionDisplayDialog.open();
            }
        }).addStyleClass("showSelection");
        this.selectedNumberLink.addStyleClass("selectedNumberLink");
        // delete icon for selected items
        this.resetSelection = new sap.m.Link({
            text: this.oCoreApi.getTextNotHtmlEncoded("resetSelection")
        }).attachPress(function() {
            jQuery(".showSelection").hide();
            jQuery(".resetSelection").hide();
            if (that.oCoreApi.getActiveStep().getSelectedRepresentation().bIsAlternateView) {
                that.oCoreApi.getActiveStep().getSelectedRepresentation().toggleInstance.removeAllSelection();
            }
            that.oCoreApi.getActiveStep().getSelectedRepresentation().removeAllSelection();
        }).addStyleClass("resetSelection");
        this.getView().chartToolbar.getToolBar().insertContentRight(this.resetSelection);
        this.getView().chartToolbar.getToolBar().insertContentLeft(this.selectedNumberEndText);
        this.getView().chartToolbar.getToolBar().insertContentLeft(this.selectedNumberLink);
        this.getView().chartToolbar.getToolBar().insertContentLeft(this.selectedNumber);
        this.getView().chartToolbar.getToolBar().insertContentLeft(this.currentStepText);
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawSingleRepresentation
     *@description Method to insert icon for single representation
     */
    drawSingleRepresentation: function() {
        var that = this;
        var activeStep = this.oCoreApi.getActiveStep();
        activeStep.selectedRepresentaionType = activeStep.getSelectedRepresentationInfo();
        if (activeStep.selectedRepresentaionType.parameter && activeStep.selectedRepresentaionType.parameter.orderby) {
            var representationSortDetail = new sap.apf.ui.utils.Helper(that.oCoreApi).getRepresentationSortInfo(activeStep.selectedRepresentaionType);
            activeStep.selectedRepresentaionType.sortDescription = representationSortDetail;
        }
        var selectedMultipleRepresentationBtn = new sap.m.Button({
            icon: activeStep.selectedRepresentaionType.picture,
            tooltip: this.oCoreApi.getTextNotHtmlEncoded(activeStep.selectedRepresentaionType.label) + "\n" + ((activeStep.selectedRepresentaionType.sortDescription !== undefined) ? this.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + activeStep.selectedRepresentaionType.sortDescription : ""),
            press: function() {
                var oStep = that.oCoreApi.getActiveStep();
                var currentRepresentation = oStep.getSelectedRepresentation();
                currentRepresentation.bIsAlternateView = false;
                that.oUiApi.getStepContainer().getController().drawStepContent();
                var activeStepIndex = that.oCoreApi.getSteps().indexOf(oStep);
                that.oUiApi.getAnalysisPath().getCarousel().getStepView(activeStepIndex).getController().drawThumbnailContent(true);
            }
        });
        this.getView().chartToolbar.getToolBar().insertContentRight(selectedMultipleRepresentationBtn, 0);
        this.insertContentLeft();
    },
    /** 
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawMultipleRepresentation
     *@description Method to insert icons for multiple representations
     */
    drawMultipleRepresentation: function() {
        var that = this;
        var activeStep = this.oCoreApi.getActiveStep();
        activeStep.representationtypes = activeStep.getRepresentationInfo();
        activeStep.representationtypes.forEach(function(oRepresentation) {
            if (oRepresentation.parameter && oRepresentation.parameter.orderby) { //if orderby has a value then only get the sort description
                var representationSortDetail = new sap.apf.ui.utils.Helper(that.oCoreApi).getRepresentationSortInfo(oRepresentation);
                oRepresentation.sortDescription = representationSortDetail;
            }
        });
        activeStep.selectedRepresentaionType = activeStep.getSelectedRepresentationInfo();
        if (activeStep.selectedRepresentaionType.parameter && activeStep.selectedRepresentaionType.parameter.orderby) {
            var representationSortDetail = new sap.apf.ui.utils.Helper(this.oCoreApi).getRepresentationSortInfo(activeStep.selectedRepresentaionType);
            activeStep.selectedRepresentaionType.sortDescription = representationSortDetail;
        }

        var reperesentationTypesLength = activeStep.representationtypes.length;
        var selectedMultipleRepresentationBtn;
        var drawSelectedRepresentation = function(data) {
        	var activeStep = that.oCoreApi.getSteps()[data.nActiveStepIndex];
        	activeStep.getSelectedRepresentation().bIsAlternateView = false;
        	activeStep.setSelectedRepresentation(data.oRepresentationType.representationId);
            that.oUiApi.getAnalysisPath().getController().refresh(data.nActiveStepIndex);
            that.oCoreApi.updatePath(that.oUiApi.getAnalysisPath().getController().callBackForUpdatePath.bind(that.oUiApi.getAnalysisPath().getController()));
        };
        this.openList = function(oEvent) {
            var data = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            drawSelectedRepresentation(data);
            selectedMultipleRepresentationBtn.setIcon(data.icon);
            selectedMultipleRepresentationBtn.setTooltip(that.oCoreApi.getTextNotHtmlEncoded(data.oRepresentationType.label) + "\n" + (data.oRepresentationType.sortDescription !== undefined ? that.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + data.oRepresentationType.sortDescription : ""));
        };
        var oAllChartList = new sap.m.List({
            mode: sap.m.ListMode.SingleSelectMaster,
            showSeparators: sap.m.ListSeparators.None,
            includeItemInSelection: true,
            select: jQuery.proxy(function(oEvent) {
                this.openList(oEvent);
            }, this)
        });
        for (var j = 0; j < reperesentationTypesLength; j++) {
            oAllChartList.addItem(new sap.m.StandardListItem({
                description: activeStep.representationtypes[j].sortDescription && this.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + activeStep.representationtypes[j].sortDescription,
                icon: activeStep.representationtypes[j].picture,
                title: that.oCoreApi.getTextNotHtmlEncoded(activeStep.representationtypes[j].label),
                customData: [new sap.ui.core.CustomData({
                    key: 'data',
                    value: {
                        oRepresentationType: activeStep.representationtypes[j],
                        nActiveStepIndex: that.oCoreApi.getSteps().indexOf(that.oCoreApi.getActiveStep()),
                        icon: activeStep.representationtypes[j].picture
                    }
                })]
            }));
        }
        var oShowAllChartPopover = new sap.m.Popover({
            placement: sap.m.PlacementType.Bottom,
            showHeader: false,
            content: [oAllChartList]
        }).addStyleClass("sapCaUiChartToolBarShowAllChartListPopover");
        //full-screen buttons
        function fnPress(oEvent) {
            var data = oEvent.getSource().getCustomData()[0].getValue();
            drawSelectedRepresentation(data);
        }
        for (var k = 0; k < reperesentationTypesLength; k++) {
            var button = new sap.m.Button({
                tooltip: that.oCoreApi.getTextNotHtmlEncoded(activeStep.representationtypes[k].label) + "\n" + ((activeStep.representationtypes[k].sortDescription !== undefined) ? this.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + activeStep.representationtypes[k].sortDescription : ""),
                icon: activeStep.representationtypes[k].picture,
                customData: [new sap.ui.core.CustomData({
                    key: 'data',
                    value: {
                        oRepresentationType: activeStep.representationtypes[k],
                        nActiveStepIndex: that.oCoreApi.getSteps().indexOf(that.oCoreApi.getActiveStep()),
                        icon: activeStep.representationtypes[k].picture
                    }
                })],
                press: fnPress
            });
            button.addStyleClass("iconLeft");
            this.getView().chartToolbar.getToolBar().insertContentRight(button);
        }
        selectedMultipleRepresentationBtn = new sap.m.Button({
            icon: activeStep.selectedRepresentaionType.picture,
            tooltip: this.oCoreApi.getTextNotHtmlEncoded(activeStep.selectedRepresentaionType.label) + "\n" + ((activeStep.selectedRepresentaionType.sortDescription !== undefined) ? this.oCoreApi.getTextNotHtmlEncoded("sortBy") + ": " + activeStep.selectedRepresentaionType.sortDescription : ""),
            press: function() {
                oShowAllChartPopover.openBy(this);
            }
        }).addStyleClass("iconList");
        this.getView().chartToolbar.getToolBar().insertContentRight(selectedMultipleRepresentationBtn, 0);
        this.insertContentLeft();
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawToolBar
     *@description renders the toolbar specific for single or multiple representations and shows/hide legend icon/alternate representation icon
     */
    drawToolBar: function() {
        var that = this;
        this.showAndHideIcons = function() {
            var that = this;
            that.isSwitchRepresentation = false;
            if (that.getView().chartToolbar.getFullScreen() === true) {
                //full-screen
                jQuery(".iconList").hide();
                jQuery(".iconLeft").show();
            } else {
                //initial
                jQuery(".iconList").show();
                jQuery(".iconLeft").hide();
            }
            //show table sort icon, show only if the representation is table and if the alternate representation is table
            if ((that.oCoreApi.getActiveStep().getSelectedRepresentation().bIsAlternateView && that.oCoreApi.getActiveStep().getSelectedRepresentation().getAlternateRepresentation().id === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) || that.oCoreApi.getActiveStep().getSelectedRepresentation().type === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
                jQuery(".sortButton").show();
            } else {
                jQuery(".sortButton").hide();
            }
            // selection count and label
            if (that.oCoreApi.getSteps().length >= 1) {
                that.showSelectionCount();
            }
            // for iPhone and when screen resizes, the chartToolbar width will be equal to window width
            var toolbarId = that.getView().chartToolbar.getId();
            if (that.oCoreApi.getActiveStep().getSelectedRepresentation().getAlternateRepresentation() !== undefined) {
                if ((!that.oCoreApi.getActiveStep().getSelectedRepresentation().bIsAlternateView && that.oCoreApi.getActiveStep().getSelectedRepresentation().getAlternateRepresentation().id !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) || that.oCoreApi.getActiveStep().getSelectedRepresentation().type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
                    if ((window.innerWidth === jQuery("#" + toolbarId + " > div:first-child > div:nth-child(2)").width())) {
                        jQuery(that.getView().chartToolbar._oShowLegendButton.getDomRef()).show();
                    }
                }
            }
        };
        this.renderIcons = function() {
            var that = this;
            var oActiveStep = that.oCoreApi.getActiveStep();
            if (oActiveStep !== undefined) {
                //tooltip added for fullscreen
                that.getView().chartToolbar._oFullScreenButton.setTooltip(that.oCoreApi.getTextNotHtmlEncoded("toggle-fullscreen"));
                that.getView().chartToolbar._oFullScreenExitButton.setTooltip(that.oCoreApi.getTextNotHtmlEncoded("toggle-fullscreen"));
                //draw table
                if (that.alternateRepresentationIcon === false && that.oCoreApi.getActiveStep().getSelectedRepresentation().type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
                    that.drawAlternateRepresentation();
                    that.alternateRepresentationIcon = true;
                }
                //table sort icon
                if (that.oCoreApi.getActiveStep().getSelectedRepresentation().type === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
                    if (that.viewSettingsIcon === false) {
                        that.insertViewSettingsIcon();
                        //that.insertContentLeft();
                    }
                    that.viewSettingsIcon = true;
                }
                //draw representation
                if (that.oCoreApi.getActiveStep().getRepresentationInfo().length > 1) {
                    if (that.chartIconInserted === false) {
                        that.drawMultipleRepresentation();
                    }
                    that.chartIconInserted = true;
                } else if (that.oCoreApi.getActiveStep().getSelectedRepresentation().type !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION && that.oCoreApi.getActiveStep().getRepresentationInfo().length === 1) {
                    if (that.chartIconInserted === false) {
                        that.drawSingleRepresentation();
                    }
                    that.chartIconInserted = true;
                }
                //Disable if the representation is table or geomap
                if ((that.oCoreApi.getActiveStep().getSelectedRepresentation().bIsAlternateView && that.oCoreApi.getActiveStep().getSelectedRepresentation().getAlternateRepresentation().id === sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) || that.oCoreApi.getActiveStep().getSelectedRepresentation().type === (sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION || sap.apf.ui.utils.CONSTANTS.representationTypes.GEO_MAP)) {
                    that.getView().chartToolbar._oShowLegendButton.setVisible(false);
                } else {
                    that.getView().chartToolbar._oShowLegendButton.setVisible(true);
                    that.getView().chartToolbar._oShowLegendButton.setTooltip(that.oCoreApi.getTextNotHtmlEncoded("legend"));
                }
                //If representation is switched then show the legend
                if (that.isSwitchRepresentation === true) {
                    that.getView().chartToolbar.setShowLegend(true);
                }
            }
        };
        this.getView().chartToolbar.addEventDelegate({
            onAfterRendering: function() {
                if (that.oCoreApi.getSteps().length > 0) {
                    that.showAndHideIcons();
                }
                
                var oStep = that.oCoreApi.getActiveStep();
				if (oStep) { //If step exists then toggle the legend 
					var currentRepresentation = oStep.getSelectedRepresentation();
					var formatString;
					var stepRepresentation = oStep.getSelectedRepresentation().chart || {};
					//Show/Hide Legend
					if (currentRepresentation.bIsLegendVisible === true || currentRepresentation.bIsLegendVisible === undefined) {
						if (stepRepresentation.setVizProperties) { //Check if Viz Frame Charts
							stepRepresentation.setVizProperties({
								legend : {
									visible : true
								},
								sizeLegend : {
									visible : true
								}
							});
						} else { //Fallback for Viz Charts
							if (stepRepresentation.setLegend !== undefined) {
								stepRepresentation.setLegend(new sap.viz.ui5.types.legend.Common({
									visible : true,
									title : new sap.viz.ui5.types.legend.Common_title({
										visible : true
									})
								}));
							}
							if (stepRepresentation.setSizeLegend !== undefined) {
								formatString = stepRepresentation.getSizeLegend().getFormatString();
								stepRepresentation.setSizeLegend(new sap.viz.ui5.types.legend.Common({
									visible : true,
									title : new sap.viz.ui5.types.legend.Common_title({
										visible : true
									})
								}));
								if (formatString !== null) {
									stepRepresentation.getSizeLegend().setFormatString(formatString);
								}
							}
						}
					} else {
						if (stepRepresentation.setVizProperties) { //Check if Viz Frame Charts
							stepRepresentation.setVizProperties({
								legend : {
									visible : false
								},
								sizeLegend : {
									visible : false
								}
							});
						} else { //Fallback for Viz Charts
							if (stepRepresentation.setLegend !== undefined) {
								stepRepresentation.setLegend(new sap.viz.ui5.types.legend.Common({
									visible : false,
									title : new sap.viz.ui5.types.legend.Common_title({
										visible : false
									})
								}));
							}
							if (stepRepresentation.setSizeLegend !== undefined) {
								formatString = stepRepresentation.getSizeLegend().getFormatString();
								stepRepresentation.setSizeLegend(new sap.viz.ui5.types.legend.Common({
									visible : false,
									title : new sap.viz.ui5.types.legend.Common_title({
										visible : false
									})
								}));
								if (formatString !== null) {
									stepRepresentation.getSizeLegend().setFormatString(formatString);
								}
							}
						}
					}
				}
            },
            onBeforeRendering: function() {
                if (that.oCoreApi.getSteps().length > 0) {
                    that.renderIcons();
                }
            }
        });
    },
    /**
     *@memberOf sap.apf.ui.reuse.controller.stepToolbar
     *@method drawRepresentation
     *@description This method clears the toolbar content, insert chart and renders toolbar
     */
    drawRepresentation: function(oChart) {
        var that = this;
        this.isSwitchRepresentation = true;
        this.getView().chartToolbar.getToolBar().removeAllContentLeft();
        this.getView().chartToolbar.getToolBar().removeAllContentRight();
        this.chartIconInserted = false;
        this.alternateRepresentationIcon = false;
        this.viewSettingsIcon = false;
        this.getView().chartToolbar.removeAllCharts();
        this.getView().chartToolbar.insertChart(oChart);
        if (this.getView().chartToolbar.getFullScreen() === true) {
            this.getView().chartToolbar.rerender(); //re-render's main chart on fullscreen    
        }
        this.drawToolBar();
        //Handle Legend Show/Hide Mapped to Representations
        this.getView().chartToolbar.onAfterRendering = function() {
            var legendIcon = this._oShowLegendButton.getDomRef();
            //Bind Click Event on legend icon to switch the state of hide/show boolean
            var evtType = sap.ui.Device.browser.mobile ? "tap" : "click";
            $(legendIcon).on(evtType, function() {
                var oStep = that.oCoreApi.getActiveStep();
                var currentRepresentation = oStep.getSelectedRepresentation();
                if (currentRepresentation.bIsLegendVisible === true || currentRepresentation.bIsLegendVisible === undefined) {
                    currentRepresentation.bIsLegendVisible = false;
                } else {
                    currentRepresentation.bIsLegendVisible = true;
                }
            });
        };
    }
});