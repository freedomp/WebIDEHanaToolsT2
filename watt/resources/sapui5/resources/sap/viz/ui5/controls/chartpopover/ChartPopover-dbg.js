/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([
    'jquery.sap.global',
    './ContentPanel',
    './HeaderBar',
    './SubActionItemsPage',
    'sap/ui/core/Control',
    'sap/viz/ui5/format/ChartFormatter'
],
function(jQuery, ContentPanel, HeaderBar, SubActionItemsPage, Control, ChartFormatter) {
	
    /**
     * ChartPopover provides a popover used with charts to display chart selections.
     * Content and Action List Items can be customized.
     *
     * @author I071838
     */
      var ChartPopover = Control.extend('sap.viz.ui5.controls.chartpopover.ChartPopover', {
        metadata : {
            properties : {
                'customDataControl' : {
                    type : 'any'
                }, //Parameter is selectData and returned Value is an UI5 Controls
                'actionItems' : {
                    type : 'object[]'
                },
                'formatString': {
                    type: 'any'
                },
                'chartType' : {
                     type : 'string'
                }
            }
        }
    });

    ChartPopover.prototype.init = function() {
        this._listItemHeight = 3;
        this._isActionItemsChanged = true;
        //3rem
        this._options = null;
        this._oContentPanel = new ContentPanel(this._createId('vizContentPanel'), {});

        this._oSelectedLabel = new sap.m.Label(this._createId('vizSelectedLabel'), { });

        this._oSelectedBar = new sap.m.Bar(this._createId('vizSelectedBar'), {
            contentMiddle : [this._oSelectedLabel]
            })
            .addStyleClass('viz-controls-chartPopover-vizSelectedBar')
            .addStyleClass('viz-controls-chartPopover-vizSelectedBarBorder');

        this._oCustomHeader = new HeaderBar(this._createId('vizHeaderBar'), {
            title : sap.viz.extapi.env.Language.getResourceString("IDS_CURRENT_SELECTION"),
            showNavButton : false,
            closeButtonPress : jQuery.proxy(this.close, this),
            navButtonPress : jQuery.proxy(this._navigateBack, this)
        });

        this._oPopover = new sap.m.ResponsivePopover(this._createId('vizChartPopover'), {
            horizontalScrolling : false,
            placement : sap.m.PlacementType.HorizontalPreferedRight,
            contentWidth : "18rem",
            customHeader : this._oCustomHeader,
            content : [this._oContentPanel]
        });
        this._oPopover.addStyleClass('viz-controls-chartPopover');
        this._oPopover.attachAfterClose(this._afterClose, this);
        this._oPopover.attachAfterOpen(this._afterOpen, this);
        this._infoDiv = null;
        this._chartType = null;
    };

    ChartPopover.prototype._afterOpen = function() {
        this._oCustomHeader._oCloseButton.focus();
    };

    ChartPopover.prototype._afterClose = function() {
        this._navigateBack();
        if (this._options && this._options.selectedValues < 1) {
            this._oPopover.removeContent(this._oSelectedBar);
        }
        if (this._infoDiv) {
            this._infoDiv.focus();
        }
    };

    /**
     * Returns true if the popover is open, otherwise false.
     *
     * @returns {boolean} true if the popover is open, otherwise false
     *
     */
    ChartPopover.prototype.isOpen = function() {
        return this._oPopover.isOpen();
    };

    function hasClass(node, clz) {
        if (!node || !node.getAttribute) {
            return false;
        }
        var nodeClz = node.getAttribute('class') || "";
        return (' ' + nodeClz + ' ').indexOf(' ' + clz + ' ') >= 0;
    }

    /**
     * Open Chart's Popover.
     */
    ChartPopover.prototype.openBy = function(oControl, bSkipInstanceManager) {
        if (oControl) {
            this._oCustomHeader.setTitle(sap.viz.extapi.env.Language.getResourceString('IDS_CURRENT_SELECTION'));
            this._updateContent();
            this._updateActionItems();
            
            //Set Popover's openBy element
            var targetElement = this._updatePopoverSettings(oControl);
            var contents = this._oPopover.getContent();
            if(contents.length > 0){
                this._oPopover.setInitialFocus(contents[0].getId());
            }
            setTimeout((function(){
                this._oPopover.openBy(targetElement, bSkipInstanceManager); //oControl.firstChild
            }).bind(this), 0);
        }
        return this;
    };

    /**
     * Close Chart's Popover.
     */
    ChartPopover.prototype.close = function() {
        this._oPopover.close();
        return this;
    };

    /**
     * Destroy Chart's Popover
     */
    ChartPopover.prototype.exit = function() {
        if (this._oContentPanel) {
            this._oContentPanel.destroy();
            this._oContentPanel = null;
        }

        if (this._oSelectedLabel) {
            this._oSelectedLabel.destroy();
            this._oSelectedLabel = null;
        }

        if (this._oCustomHeader) {
            this._oCustomHeader.destroy();
            this._oCustomHeader = null;
        }

        if (this._oCustomPanel) {
            this._oCustomPanel.destroy();
            this._oCustomPanel = null;
        }

        if (this._oPopover) {
            this._oPopover.destroy();
            this._oPopover = null;
        }

        if(this._targetElement){
                this._targetElement.remove();
            this._targetElement = null;
        }

        this._options = null;
        this._infoDiv = null;
            this._chartType = null;
    };

    /**
     * Set popover's options
     */
    ChartPopover.prototype.setOptions = function(options) {
        var data = this._formatData(options.data);
    
        if (!this._infoDiv || this.getChartType() != this._chartType) {
                var node = options.target;
                while ((node = node.parentNode) && !hasClass(node, "v-info")) {
                } 
                this._infoDiv = node;
                this._chartType = this.getChartType();
            }
            if (this._infoDiv) {
                var _screenReaderDiv = this._infoDiv.querySelector(".v-m-screenreader-container");
                if (_screenReaderDiv) {
                    var li = _screenReaderDiv.querySelector("li");
                    if (li && options.selectedValues) {
                        var text = options.selectedValues === 1 ? 
                                " " + sap.viz.extapi.env.Language.getResourceString("IDS_VALUE_SELECTED") : 
                                " " + sap.viz.extapi.env.Language.getResourceString("IDS_VALUES_SELECTED") ;
                        li.innerText = options.selectedValues + text;
                    }
                }
            }
        this._options = options;
        this._oContentPanel.setContentData(data);
        if (!data.val || options.selectedValues > 1) {
            this._oSelectedLabel.setText(options.selectedValues + " " + 
                    sap.viz.extapi.env.Language.getResourceString("IDS_VALUES_SELECTED"));
            this._oPopover.insertContent(this._oSelectedBar, 1);
            if(data.val === undefined){
                //Legend Selection or category selection or lasso selection
                this._oSelectedBar.removeStyleClass('viz-controls-chartPopover-vizSelectedBarBorder');    
            }          
        } else {
            this._oPopover.removeContent(this._oSelectedBar);
        }
        return this;
    };

    ChartPopover.prototype.setActionItems = function(items){ 
        this._actionItems = [];
        this._actionItems = jQuery.extend(true, this._actionItems, items);
        this._isActionItemsChanged = true;
    };

    ChartPopover.prototype.getActionItems = function(items){
        return this._actionItems; 
    };

    ChartPopover.prototype._updateContent = function() {
        var contents = this.getCustomDataControl();
        if (contents) {
            //Has Custom Data Content.
            //1. remove the repvious custom panel.
            //2. remove content panel
            //3. insert new custom panel
            if (this._oCustomPanel) {
                this._oPopover.removeContent(this._oCustomPanel);
            }
            this._oCustomPanel = contents(this._options);
            this._oPopover.removeContent(this._oContentPanel);
            this._oPopover.insertContent(this._oCustomPanel, 0);
            this._oSelectedBar.addStyleClass('viz-controls-chartPopover-vizSelectedBarBorder');
        } else {
            //No custom data content.
            this._oCustomPanel = null;

            if(this._oContentPanel.isMultiSelected()){
                this._oPopover.removeContent(this._oContentPanel);
            }else if (this._oPopover.indexOfContent(this._oContentPanel) === -1) {
                this._oPopover.insertContent(this._oContentPanel, 0);
                this._oSelectedBar.addStyleClass('viz-controls-chartPopover-vizSelectedBarBorder');
            }
        }
        return this;
    };

    ChartPopover.prototype._updateActionItems = function() {
        if (this._isActionItemsChanged) {
            var actionItems = this._actionItems;
            if(!this._oActionList){
                //new action list
                actionItems = this.getActionItems();
                if (actionItems && actionItems.length > 0) {
                    this._actionItems = jQuery.extend(true, this._actionItems, actionItems);
                    this._oActionList = new sap.m.List({
                    }).addStyleClass('viz-controls-chartPopover-actionList');
                    this._oPopover.addContent(this._oActionList);
                }
            }

            if (actionItems && actionItems.length > 0) {
                this._oActionList.removeAllItems();
                var item;

                for (var i = 0, len = actionItems.length; i < len; i++) {
                    item = actionItems[i];
                    if (item.type === 'action') {
                        this._oActionList.addItem(new sap.m.ActionListItem({
                            text : item.text,
                            press : item.press ? item.press : function() {
                            }
                        }));
                    } else if (item.type === 'navigation') {
                        this._oActionList.addItem(new sap.m.StandardListItem({
                            title : item.text,
                            type : 'Navigation',
                            press : jQuery.proxy(function(event) {
                                var index = this._oActionList.indexOfItem(event.getSource());
                                var subActionItems = this._actionItems[index].children;
                                if (subActionItems && subActionItems.length > 0) {
                                    this._oSubActionItemsPage = new SubActionItemsPage();
                                    this._oPopover.insertContent(this._oSubActionItemsPage);

                                    this._oSubActionItemsPage.setItems(subActionItems);
                                    this._oCustomHeader.setTitle(this._actionItems[index].text);
                                    this._navigateTo();
                                }
                            }, this)
                        }));
                    }
                }
            }else{
                if(this._oActionList){
                    this._oActionList.destroy();
                    this._oActionList = null;
                }
            }

            this._isActionItemsChanged = false;
        }
    };

    ChartPopover.prototype._navigateBack = function() {
        this._oPopover.removeContent(this._oSubActionItemsPage);
        this._oCustomHeader.setShowNavButton(false).setTitle(sap.viz.extapi.env.Language.getResourceString("IDS_CURRENT_SELECTION"));
    };

    ChartPopover.prototype._navigateTo = function(pageId) {
        this._oCustomHeader.setShowNavButton(true);
    };

    /**
     * Creates an id for an Element prefixed with the control id
     *
     * @return {string} id
     */
    ChartPopover.prototype._createId = function(sId) {
        return this.getId() + "-" + sId;
    };

    /**
     * Create a new copy of data with all values formatted using "formatString" property
     * 
     * @param data original data to format
     * @return a copy of the original data with all values formatted
     */
    ChartPopover.prototype._formatData = function (data) {
        if (!data.val) {
            return data;
        }
        var formatFn = sap.viz.api.env.Format.format,
            formatted = jQuery.extend(true, {}, data),
            timeMeasureIdx = formatted.val.hasOwnProperty("timeMeasure") ? formatted.val.timeMeasure : -1,
            timeDimensions = formatted.val.hasOwnProperty("timeDimensions") ? formatted.val.timeDimensions : [],
            formatString = this.getFormatString(),
            catchAll = null,
            byMeasure = {},
            pattern;
        
        if (typeof formatString === "string") {
            catchAll = formatString;
        } else if (formatString instanceof Object) {
            byMeasure = formatString;
        }

        // convert value of time measure from milliseconds int to javascript Date object
        if(timeMeasureIdx !== -1) {
            var timeValue = formatted.val.filter(function(i) {
                return (i.type) && (i.type.toLowerCase() === "measure");
            })[timeMeasureIdx];
            timeValue.value = new Date(timeValue.value);
            }
            if (timeDimensions.length){
                formatted.val.forEach(function(i, index){
                    if (timeDimensions.indexOf(index) > -1){
                        //popover didnot accept time as dimension, so change it to measure.
                        i.type = "measure";
                        i.value = new Date(i.value);
                    }
                });
        }

        formatted.val.forEach(function(val) {
            if (val.type && val.type.toLowerCase() === "measure") {
                pattern = byMeasure[val.id] || catchAll;
                if (pattern) {
                    val.value = formatFn(val.value, pattern);
                } else {
                    val.value = formatFn(val.value);
                }
            }
        });
        return formatted;
    };

    ChartPopover.prototype._updatePopoverSettings = function(target){
            var data = this._options.data.val;
            var targetSize = target.getBoundingClientRect(), 
                measureValue; 
            var parseIntFn = function (number){
                return parseInt(number, 10);
            };
            var targetData = target.__data__;
            if(data !== undefined){
                for(var i = 0, len = data.length; i < len; i++){
                    if(data[i].type && (data[i].type.toLowerCase() === "measure")){
                        measureValue = data[i].value;
                        break;
                    }
                }
            } else if (targetData && targetData.measureNames){
                measureValue = targetData[targetData.measureNames];
            }

            var dataType = this._options.data.type;
            var isDataTypeLine = dataType && dataType === "line";
            var targetElement, offsetX, offsetY;
            switch(this.getChartType()){
                case 'info/bar':
                case 'info/dual_bar':
                    offsetY = parseIntFn(targetSize.height / 2);
                    if (measureValue < 0) {
                        offsetX = 0;
                        this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedLeft);
                    } else {
                        offsetX = parseIntFn(targetSize.width);
                        this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight);
                    }
                    this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY);
                    targetElement = target.firstChild;
                    break;
                case 'info/column':
                case 'info/dual_column':
                case 'info/timeseries_column':
                    offsetX = parseIntFn(targetSize.width / 2);
                    if(measureValue < 0){
                        offsetY = parseIntFn(targetSize.height);
                        this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedBottom);
                    }else{
                        offsetY = 0;
                        this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop);
                    }
                    this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY);
                    targetElement = target.firstChild;
                    break;
                case 'info/pie':
                case 'info/donut':
                    offsetX = parseIntFn(targetSize.width / 2);
                    offsetY = parseIntFn(targetSize.height / 2);
                    this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY);
                    this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight);
                    targetElement = target.firstChild;
                    break;
                case 'info/bullet':
                    offsetX = parseIntFn(targetSize.width);
                    offsetY = parseIntFn(targetSize.height / 2);
                    this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY);
                    this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight);
                    targetElement = target;
                    break;
                case 'info/vertical_bullet': 
                    offsetX = parseIntFn(targetSize.width / 2);
                    offsetY = 0;
                    this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY); 
                    this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop);
                    targetElement = target;
                    break;
                //Create DIV Element to workaround popover's reference issue. 
                case 'info/line': 
                case 'info/timeseries_line':
                case 'info/timeseries_scatter':
                case 'info/timeseries_bubble':
                case 'info/dual_line':
                case 'info/bubble':
                case 'info/time_bubble':
                case 'info/scatter': 
                case 'info/stacked_bar':
                case 'info/dual_stacked_bar':
                case 'info/100_stacked_bar':
                case 'info/100_dual_stacked_bar':
                    this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop);
                    targetElement = this._createOpenByElement(targetSize);
                    break;
                case 'info/stacked_column':
                case 'info/dual_stacked_column':
                case 'info/100_stacked_column':
                case 'info/100_dual_stacked_column':
                case 'info/heatmap':
                    this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight);
                    targetElement = this._createOpenByElement(targetSize); 
                    break;
                //Handle Combination chart
                case 'info/combination':
                    if(isDataTypeLine){
                        this._oPopover.setOffsetX(undefined).setOffsetY(undefined);
                        this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop);
                        targetElement = this._createOpenByElement(targetSize); 
                    }else{
                        offsetX = parseIntFn(targetSize.width / 2);
                        if(measureValue < 0){
                            offsetY = parseIntFn(targetSize.height);
                            this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedBottom);
                        }else{
                            offsetY = 0;
                            this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop);
                        }
                        this._oPopover.setOffsetX(offsetX).setOffsetY(offsetY);
                        targetElement = target.firstChild;
                    }
                    break;
                case 'info/stacked_combination':
                case 'info/dual_stacked_combination':
                    if(isDataTypeLine){ 
                         this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop); 
                     }else{ 
                         this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight); 
                     }
                    targetElement = this._createOpenByElement(targetSize); 
                    break;
                case 'info/horizontal_stacked_combination':
                case 'info/dual_horizontal_stacked_combination':
                    if(isDataTypeLine){ 
                        this._oPopover.setPlacement(sap.m.PlacementType.HorizontalPreferedRight); 
                    }else{ 
                        this._oPopover.setPlacement(sap.m.PlacementType.VerticalPreferedTop); 
                    }
                    targetElement = this._createOpenByElement(targetSize);
                    break;
            }
            return targetElement;
    };

    ChartPopover.prototype._createOpenByElement = function(boundingInfo){
        if(!this._targetElement){
            this._targetElement = jQuery('<div></div>')
                .attr('class', 'viz-controls-chartPopover-dpMarker')
                .attr('style', 'position: fixed;')
                .css('visibility', 'hidden');
            
            jQuery('body').append(this._targetElement);
        }

        this._targetElement.css('width', boundingInfo.width+'px')
            .css('height', boundingInfo.height+'px')
            .css('left', boundingInfo.left)
            .css('top', boundingInfo.top);

        return this._targetElement[0];
    };
    
    return ChartPopover;
});
