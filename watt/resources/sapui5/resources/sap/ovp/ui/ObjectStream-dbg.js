/**
 * Created by i060586 on 11/25/14.
 */
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2014 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");

sap.ui.define(['jquery.sap.global'],
    function(jQuery) {
        "use strict";

        var ObjectStream = sap.ui.core.Control.extend("sap.ovp.ui.ObjectStream", { metadata : {
            library : "sap.ovp",
            properties : {
                title: {type : "string", defaultValue: ""}
            },
            aggregations : {
                content: {type: "sap.ui.core.Control", multiple: true},
                placeHolder: {type: "sap.ui.core.Control", multiple: false}
            }
        }});


        ObjectStream.prototype.init = function() {
            var that = this;
            this._closeIcon = new sap.ui.core.Icon({
                src: "sap-icon://decline",
                tooltip: "close"
            });
            this._closeIcon.addEventDelegate({
                onclick: function () {
                    that.getParent().close();
                }
            });
        };

        ObjectStream.prototype._startScroll = function(direction) {
            this._direction = direction;
            var leftToScroll;
            if (direction == "left") {
                leftToScroll = this.wrapper.scrollLeft;
                if (leftToScroll <= 0) {
                    return;
                }
                this.jqRightEdge.css("opacity", 1);
            } else {
                leftToScroll = this.wrapper.scrollWidth - this.wrapper.offsetWidth - this.wrapper.scrollLeft;
                if (leftToScroll <= 0) {
                    return;
                }
                this.jqLeftEdge.css("opacity", 1);
            }
            var scrollTime = leftToScroll * 3;
            var translateX = (direction == "left") ? leftToScroll : ~leftToScroll + 1;
            jQuery(this.container).one("transitionend", function () {
                this._mouseLeave({data: this});
            }.bind(this));
            this.container.style.transition = 'transform ' + scrollTime + 'ms linear';
            this.container.style.transform = 'translate(' + translateX + 'px, 0px) scale(1) translateZ(0px) ';
        };

        ObjectStream.prototype._mouseLeave = function (e) {
            var containerTransform = window.getComputedStyle(e.data.container).transform;
            e.data.container.style.transform = containerTransform;
            e.data.container.style.transition = '';

            var transformX;
            var transformParamsArr = containerTransform.split(",");
            if (containerTransform.substr(0, 8) == "matrix3d") {
                transformX = parseInt(transformParamsArr[12], 10);
            } else if (containerTransform.substr(0, 6) == "matrix") {
                transformX = parseInt(transformParamsArr[4], 10);
            }
            if (isNaN(transformX)) {
                return;
            }
            e.data.container.style.transform = "none";
            e.data.wrapper.scrollLeft += ~transformX + (e.data._direction == "left" ? -5 : 5);
            e.data._checkEdgesVisibility();
        };

        ObjectStream.prototype._initScrollVariables = function () {
            var jqObjectStream = this.$();
            this.container =  jqObjectStream.find(".sapOvpObjectStreamScroll").get(0);
            this.wrapper = jqObjectStream.find(".sapOvpObjectStreamCont").get(0);
            this.shouldShowScrollButton = !sap.ui.Device.system.phone && !sap.ui.Device.system.tablet; //should be shown only in desktop (and combi)
            this.jqRightEdge = jqObjectStream.find(".sapOvpOSEdgeRight");
            this.jqLeftEdge = jqObjectStream.find(".sapOvpOSEdgeLeft");
            if (this.shouldShowScrollButton) {
                this.jqRightEdge.add(this.jqLeftEdge).on("mouseenter.objectStream", this, this._mouseEnter).
                    on("mouseleave.objectStream", this, this._mouseLeave);
            }
            this._checkEdgesVisibility();
        };

        ObjectStream.prototype._afterOpen = function () {
            this._initScrollVariables();
            this.jqBackground = jQuery("<div id='objectStreamBackgroundId' class='objectStreamNoBackground'></div>");
            jQuery.sap.byId("sap-ui-static").prepend(this.jqBackground);
            this.jqBackground.on('click.closePopup', function () {
                this._oPopup.close();
            }.bind(this));
            jQuery(".sapUshellEasyScanLayout").addClass("bluredLayout");
        };

        ObjectStream.prototype._beforeClose = function () {
            this.jqBackground.remove();
            this.jqLeftEdge.add(this.jqRightEdge).off(".objectStream");
            jQuery(".sapUshellEasyScanLayout").removeClass("bluredLayout");
        };

        ObjectStream.prototype._mouseEnter = function (evt) {
            if (evt.target == evt.data.jqRightEdge.get(0)) {
                evt.data._startScroll("right");
            }
            if (evt.target == evt.data.jqLeftEdge.get(0)) {
                evt.data._startScroll("left");
            }
        };

        ObjectStream.prototype._checkEdgesVisibility = function () {
            var scrollPosition = this.wrapper.scrollLeft;
            var leftToScroll = this.wrapper.scrollWidth - this.wrapper.offsetWidth - this.wrapper.scrollLeft;
            (scrollPosition == 0) ? this.jqLeftEdge.css("opacity", 0) : this.jqLeftEdge.css("opacity", 1);
            (leftToScroll == 0) ? this.jqRightEdge.css("opacity", 0) : this.jqRightEdge.css("opacity", 1);
        };

        ObjectStream.prototype._createPopup = function () {
            this._oPopup = new sap.m.Dialog({
                showHeader: false,
                afterOpen: this._afterOpen.bind(this),
                beforeClose: this._beforeClose.bind(this),
                content: [this],
                verticalScrolling: false,
                horizontalScrolling: false,
                stretchOnPhone: true
            }).removeStyleClass("sapUiPopupWithPadding").addStyleClass("sapOvpStackedCardPopup");
            this._oPopup.oPopup.setModal(false);
        };

        ObjectStream.prototype.open = function (cardWidth) {
            if (!this._oPopup) {
                this._createPopup();
            }
            //save card width for after rendering
            this._cardWidth = cardWidth;

            //set height and width of each card on object stream
            this.setCardsSize(this._cardWidth);

            this._oPopup.open();
        };

        ObjectStream.prototype.onBeforeRendering = function() {
            //We add this scroller for ios devices scrolling,
            if ((!this._oScroller) && (sap.ui.Device.os.ios)) {
                this._oScroller = new sap.ui.core.delegate.ScrollEnablement(this, this.getId() + "-scroll", {
                    horizontal: true,
                    vertical: false,
                    zynga: false,
                    iscroll: false,
                    preventDefault: false,
                    nonTouchScrolling: "scrollbar",
                    scrollbarClass: "sapMScrollbar"
                });
            }
        };

        ObjectStream.prototype.onAfterRendering = function() {

            if (!this._oPopup || !this._oPopup.isOpen() || !this.getContent().length ) {
                return;
            }

            //set height and width of each card on object stream
            this.setCardsSize(this._cardWidth);
            setTimeout(function () {
                this._initScrollVariables();
            }.bind(this));
        };


        ObjectStream.prototype.exit = function() {
            if (this._oPopup){
                this._oPopup.destroy();
            }
            this._closeIcon.destroy();
            if (this._oScroller) {
                this._oScroller.destroy();
                this._oScroller = null;
            }
        };

        ObjectStream.prototype.setCardsSize = function(cardWidth) {
            var remSize = parseInt(window.getComputedStyle(document.documentElement).fontSize, 10);
            var cardHeight = sap.ui.Device.system.phone ? document.body.clientHeight / remSize - 4.5 : 28.75;
            var cardList = this.getContent();
            cardList.map(function (oCard) {
                oCard.setWidth(cardWidth + "px");
                oCard.setHeight(cardHeight + "rem");
            });

            var oPlaceHolder = this.getPlaceHolder();
            if (oPlaceHolder) {
                oPlaceHolder.setWidth(cardWidth + "px");
                oPlaceHolder.setHeight(cardHeight + "rem");
            }
        };

        ObjectStream.prototype.updateContent = function(reason){
            /* We are updaing the content only data was change and not by refresh
             * This is done due to the fact that UI5 is calling the updateContent
             * twice, one with reason = 'refresh' with no data in the model and second
             * with reason = 'change' with the data.
             * In order to be able to have rendering optimization we are updating only when
             * we have the data in the model and therefore we can reuse most of the items
             * Ticket was open on this # 1570807520
             */
            // in any case we need to call the oBinding.getContexts().
            // it seams that this will trigger the second call with the change reason
            var oBindingInfo = this.mBindingInfos["content"],
                oBinding = oBindingInfo.binding,
                aBindingContexts = oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
            if (reason === "change"){
                var fnFactory = oBindingInfo.factory,
                    i = 0,
                    aItems = this.getContent(),
                    addNewItem = jQuery.proxy(function (oContext) {
                        var sId = this.getId() + "-" + jQuery.sap.uid(),
                            oClone = fnFactory(sId, oContext);
                        oClone.setBindingContext(oContext, oBindingInfo.model);
                        this.addContent(oClone);
                    }, this);


                // Bind as many context as possible to existing elements. Create new ones if necessary.
                for (i = 0; i < aBindingContexts.length; ++i) {
                    if (i < aItems.length) {
                        aItems[i].setBindingContext(aBindingContexts[i], oBindingInfo.model);
                    } else {
                        addNewItem(aBindingContexts[i]);
                    }
                }

                if (aItems.length > aBindingContexts.length){
                    // Delete unused elements.
                    for (; i < aItems.length; ++i) {
                        aItems[i].destroy();
                    }
                    // Update the array length.
                    aItems.length = aBindingContexts.length;
                }
            }
        };

        return ObjectStream;

    }, /* bExport= */ true);
