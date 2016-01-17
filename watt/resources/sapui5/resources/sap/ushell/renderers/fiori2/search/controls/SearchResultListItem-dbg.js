// iteration 0 : Holger
/* global sap,window,$, jQuery */

(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchText');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchLink');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchLogger');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchRelatedObjectsToolbar');

    var SearchText = sap.ushell.renderers.fiori2.search.controls.SearchText;
    var SearchLink = sap.ushell.renderers.fiori2.search.controls.SearchLink;
    var SearchHelper = sap.ushell.renderers.fiori2.search.SearchHelper;
    var SearchLogger = sap.ushell.renderers.fiori2.search.SearchLogger;
    var SearchRelatedObjectsToolbar = sap.ushell.renderers.fiori2.search.controls.SearchRelatedObjectsToolbar;

    var noValue = '\u2013'; // dash

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchResultListItem", {
        // the control API:
        metadata: {
            properties: {
                title: "string",
                titleUrl: "string",
                type: "string",
                imageUrl: "string",
                previewButton: "string", // true (default) or false, implemented for tablet only acc. to. visual design
                data: "object"
            }
        },



        // the part creating the HTML:
        renderer: function(oRm, oControl) { // static function, so use the given "oControl" instance instead of "this" in the renderer function

            oControl._resetPrecalculatedValues();

            oControl._renderOuterContainer(oRm);
        },



        // render Outer Container
        // ===================================================================
        _renderOuterContainer: function(oRm) {
            var that = this;

            /// outer div
            oRm.write("<div");
            //             oRm.writeAttribute("tabindex", "-1");
            oRm.writeControlData(that); // writes the Control ID
            if (that.status === "open" || that.getData().selected === true) {
                oRm.addClass("sapUshellSearchResultListItem-open");
            }
            oRm.addClass("sapUshellSearchResultListItem-content");
            oRm.writeClasses(); // this call writes the above class plus enables support for Square.addStyleClass(...)
            oRm.write(">");

            that._renderIntermediateContainer(oRm);

            that._renderExpandButton(oRm);

            /// close outer div
            oRm.write("</div>"); // end of the complete control
        },



        // render Intermediate Container
        // ===================================================================
        _renderIntermediateContainer: function(oRm) {
            var that = this;

            oRm.write('<div class="sapUshellSearchResultListItem-main">'); //<div>');

            that._renderInnerContainer(oRm);

            oRm.write("</div>"); //</div>"); // close main
        },



        // render InnerContainer
        // ===================================================================
        _renderInnerContainer: function(oRm) {
            var that = this;

            //             oRm.write('<div class="sapUshellSearchResultListItem-left">');

            oRm.write('<div class="sapUshellSearchResultListItem-titleContainer">');

            /// Image for Phone
            that._renderImageForPhone(oRm);

            /// Main Title and Object Type
            that._renderTitle(oRm);

            oRm.write('</div>');

            /// Attributes (Summary, Detail and WhyFound)
            var itemAttributes = that.getData().itemattributes;
            that._renderAllAttributes(oRm, itemAttributes);

            //             oRm.write("</div>");
        },


        // render Title and Object Type
        // ===================================================================
        _renderTitle: function(oRm) {
            var that = this;

            /// /// Title
            var titleURL = that._titleUrl;
            that.title = new SearchLink({
                href: titleURL,
                press: function() {
                    // logging for enterprise search concept of me
                    var oNavEventLog = new SearchLogger.NavigationEvent();
                    oNavEventLog.addUserHistoryEntry(titleURL);
                    // logging for usage analytics
                    var model = sap.ushell.renderers.fiori2.search.getModelSingleton();
                    model.analytics.logCustomEvent('FLP: Search', 'Launch Object', [titleURL]);
                }
            });
            that.title.setText(that.getTitle());
            that.title.setTooltip((sap.ushell.resources.i18n.getText('linkTo_tooltip') + ' ' + that.getTitle()).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
            that.title.addStyleClass("sapUshellSearchResultListItem-title");
            oRm.renderControl(that.title);
            //that._setSaveText(title.getDomRef(), that.getTitle());


            /// /// Object Type
            var type = new SearchText();
            type.setText(that.getType());
            type.setTooltip(('' + that.getType()).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
            type.addStyleClass("sapUshellSearchResultListItem-type");
            oRm.renderControl(type);
        },



        // render Image for Desktop and Tablet
        // ===================================================================
        _renderImage: function(oRm) {
            var that = this;
            if (that.getImageUrl()) {
                oRm.write('<div class="sapUshellSearchResultListItem-attribute sapUshellSearchResultListItem-imageDesktop-outerContainer">');
                oRm.write('<div class="sapUshellSearchResultListItem-imageDesktop-innerContainer">');
                oRm.write('<div class="sapUshellSearchResultListItem-imageDesktop-alignmentHelper">');
                oRm.write('</div>');
                oRm.write('<img class="sapUshellSearchResultListItem-imageDesktop" src="');
                oRm.write(that.getImageUrl());
                oRm.write('">');
                oRm.write('</div>');
                oRm.write('</div>');
            }
        },



        // render Image for Phone
        // ===================================================================
        _renderImageForPhone: function(oRm) {
            var that = this;
            if (that.getImageUrl()) {
                oRm.write('<div class="sapUshellSearchResultListItem-imagePhone-container">');
                oRm.write('<img class="sapUshellSearchResultListItem-imagePhone" src="');
                oRm.write(that.getImageUrl());
                oRm.write('">');
                oRm.write('</div>');
            }
        },



        // render Attributes
        // ===================================================================
        _renderAllAttributes: function(oRm, itemAttributes) {
            var that = this;

            var pos = 0;

            /// Summary Attributes
            oRm.write('<div class="sapUshellSearchResultListItem-attributes">');

            oRm.write('<div class="sapUshellSearchResultListItem-visibleAttributes">');

            pos = that._renderSummaryAttributes(oRm, itemAttributes, pos);

            /// Image for Phone and Desktop
            that._renderImage(oRm);

            oRm.write("</div>");

            /// Detail Attributes
            pos = that._renderDetailAttributes(oRm, itemAttributes, pos);

            // attributes close
            oRm.write("</div>");

            return pos;
        },



        // render Summary Attributes
        // ===================================================================
        _renderSummaryAttributes: function(oRm, itemAttributes, pos) {
            var that = this;

            var summaryAttributes = [];

            var visibleAttributes = that._getNumberOfVisibleAttributes();
            for (; pos < itemAttributes.length && pos < visibleAttributes; pos++) {
                summaryAttributes.push(itemAttributes[pos]);
            }

            that._renderAttributes(oRm, summaryAttributes);

            return pos;
        },



        // render Detail Attributes
        // ===================================================================
        _renderDetailAttributes: function(oRm, itemAttributes, pos) {
            var that = this;
            var detailAttribute;

            if (that._isPhoneSize()) {
                return pos;
            }

            var labelText, valueText;

            var numberOfDetailAttributes = 8;

            var detailAttributes = [];

            var end = pos + numberOfDetailAttributes;
            for (; pos < end && pos < itemAttributes.length; pos++) {
                var itemAttribute = itemAttributes[pos];
                labelText = itemAttribute.name;
                valueText = itemAttribute.value;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = noValue;
                }

                detailAttribute = {
                    name: labelText,
                    value: valueText
                };

                detailAttributes.push(detailAttribute);
            }

            if (detailAttributes.length > 0) {
                that._showExpandButton = true;
            }

            oRm.write('<div class="sapUshellSearchResultListItemDetails2"');
            if (that.status !== "open") {
                //oRm.write(' style="display:none"');
                // set the height as 0 at first, it will be rollbacked and display:none 
                // in OnAfterRendering after measuring of offsetWidth and scrollWidth
                oRm.write(' style="height:0; overflow:hidden" ');

            }
            oRm.write('>');

            oRm.write('<div class="sapUshellSearchResultListItem-detailsAttributes">');

            //             for (var i = 0; i < detailAttributes.length; i++) {
            //                 detailAttribute = detailAttributes[i];
            //                 that._renderAttribute(oRm, detailAttribute);
            //             }
            that._renderAttributes(oRm, detailAttributes);

            oRm.write('</div>');

            pos = that._renderWhyFoundAttributes(oRm, itemAttributes, pos);

            that._renderRelatedObjectsToolbar(oRm);

            oRm.write('</div>');

            return pos;
        },




        // render why found attributes
        // ===================================================================
        _renderWhyFoundAttributes: function(oRm, itemAttributes, pos) {
            var that = this;

            var labelText, valueText;

            //////////////////////////////////////////////////////////////////////////
            /// Prepare WhyFound Attributes
            var whyFoundAttributes = [];
            var whyFoundAttribute;
            for (; pos < itemAttributes.length; pos++) {
                var itemAttribute = itemAttributes[pos];

                if (!itemAttribute.whyfound) {
                    continue;
                }

                labelText = itemAttribute.name;
                valueText = itemAttribute.value;
                if (labelText === undefined || valueText === undefined) {
                    continue;
                }
                if (!valueText || valueText === "") {
                    valueText = noValue;
                }

                whyFoundAttribute = {
                    name: labelText,
                    value: valueText
                };

                whyFoundAttributes.push(whyFoundAttribute);
            }

            if (whyFoundAttributes.length > 0) {

                that._showExpandButton = true;

                oRm.write('<div class="sapUshellSearchResultListItem-whyFoundContainer">');
                //                 for (var i = 0; i < whyFoundAttributes.length; i++) {
                //                     whyFoundAttribute = whyFoundAttributes[i];
                //                     that._renderAttribute(oRm, whyFoundAttribute);
                //                 }
                that._renderAttributes(oRm, whyFoundAttributes);
                oRm.write("</div>");
            }

            return pos;
        },



        // render generic Attribute List
        // ===================================================================
        _renderAttributes: function(oRm, itemAttributes, length) {

            length = length || itemAttributes.length;

            for (var i = 0; i < length; i++) {
                var itemAttribute = itemAttributes[i];

                var labelText = itemAttribute.name;
                var valueText = itemAttribute.value;

                if (labelText === undefined || valueText === undefined) {
                    return;
                }
                if (!valueText || valueText === "") {
                    valueText = noValue;
                }

                oRm.write('<div class="sapUshellSearchResultListItem-attribute">');
                var label = new sap.m.Label();
                label.setText(labelText);
                label.setTooltip(('' + labelText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                label.addStyleClass("sapUshellSearchResultListItem-attribute-label");

                var value = new SearchText();
                value.setText(valueText);
                value.setTooltip(('' + valueText).replace(/<b>/gi, '').replace(/<\/b>/gi, ''));
                value.addStyleClass("sapUshellSearchResultListItem-attribute-value");

                label.setLabelFor(value);

                oRm.renderControl(label);
                oRm.renderControl(value);

                oRm.write("</div>");
            }
        },



        // render Related Objects Toolbar
        // ===================================================================
        _renderRelatedObjectsToolbar: function(oRm) {
            var that = this;

            if (!that._intents || that._intents.length == 0) {
                return;
            }

            that._showExpandButton = true;

            var relatedActions = [];
            for (var i = 0; i < that._intents.length; i++) {
                var intent = that._intents[i];
                relatedActions.push({
                    label: intent.text,
                    href: intent.externalHash,
                    target: intent.target
                });
            }

            that.relatedObjectActionsToolbar = new SearchRelatedObjectsToolbar({
                relatedObjects: relatedActions
            });

            that.relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar");

            oRm.renderControl(that.relatedObjectActionsToolbar);
        },



        // render expand button
        // ===================================================================
        _renderExpandButton: function(oRm) {
            var that = this;

            var showExpandButton = (that._showExpandButton && that.getPreviewButton() !== "false");

            oRm.write('<div class="sapUshellSearchResultListItemButton">'); //background-color:red">');
            oRm.write('<div class="sapUshellSearchResultListItemButtonContainer');
            if (!showExpandButton) {
                oRm.write(' sapUshellSearchResultListItemButtonContainer-hidden');
            }
            oRm.write('">');

            var iconArrowDown = sap.ui.core.IconPool.getIconURI("slim-arrow-down");
            that.button = new sap.m.Button({
                icon: iconArrowDown,
                type: sap.m.ButtonType.Transparent,
                tooltip: sap.ushell.resources.i18n.getText("showDetailBtn_tooltip"),
                press: function() {
                    that.toggleDetails();
                }
            });
            oRm.renderControl(that.button);

            oRm.write('</div>');
            oRm.write('</div>');
        },


        _getDetailsArea: function() {
            if (!this._detailsArea) {
                var detailsArea = $(this.getDomRef()).find('.sapUshellSearchResultListItemDetails2');
                if (detailsArea && detailsArea.length === 1) {
                    this._detailsArea = detailsArea;
                }
            }
            return this._detailsArea;
        },

        isShowingDetails: function() {
            var isShowingDetails = false;
            var detailsArea = this._getDetailsArea();
            if (detailsArea) {
                isShowingDetails = detailsArea.css('display') !== "none";
            }
            return isShowingDetails;
        },



        showDetails: function(animated) {
            var that = this;

            if (that.isShowingDetails()) {
                return;
            }

            var detailsArea = that._getDetailsArea();
            if (detailsArea) {
                var doShowDetails = function() {
                    var iconArrowUp = sap.ui.core.IconPool.getIconURI("slim-arrow-up");
                    that.button.setTooltip(sap.ushell.resources.i18n.getText("hideDetailBtn_tooltip"));
                    that.button.setIcon(iconArrowUp);
                    that.button.rerender();
                    // before opening, the value text control has width of 0
                    //that.forwardEllipsis(detailsArea.find(".sapUshellSearchResultListItem-attribute-value"));
                };

                animated = typeof animated === 'undefined' ? true : animated;

                if (animated) {
                    detailsArea.slideDown({
                        start: function() {
                            if (that.relatedObjectActionsToolbar) {
                                that.relatedObjectActionsToolbar._layoutToolbarElements();
                            }
                        },
                        duration: "fast",
                        complete: doShowDetails
                    });
                } else {
                    detailsArea.css("display", "");
                    doShowDetails();
                    if (that.relatedObjectActionsToolbar) {
                        that.relatedObjectActionsToolbar._layoutToolbarElements();
                    }
                }
            }
        },



        hideDetails: function(animated) {
            var that = this;

            if (!that.isShowingDetails()) {
                return;
            }

            var detailsArea = that._getDetailsArea();
            if (detailsArea) {
                var doHideDetails = function() {
                    var iconArrowDown = sap.ui.core.IconPool.getIconURI("slim-arrow-down");
                    that.button.setTooltip(sap.ushell.resources.i18n.getText("showDetailBtn_tooltip"));
                    that.button.setIcon(iconArrowDown);
                    that.button.rerender();
                };

                animated = typeof animated === 'undefined' ? true : animated;

                if (animated) {
                    detailsArea.slideUp("fast", doHideDetails);
                } else {
                    detailsArea.css("display", "none");
                    doHideDetails();
                }
            }
        },


        toggleDetails: function(animated) {
            if (this.isShowingDetails()) {
                this.hideDetails(animated);
            } else {
                this.showDetails(animated);
            }
        },



        // after rendering
        // ===================================================================
        onAfterRendering: function() {
            var that = this;

            // re-render is triggered by event listener in SearchResultList
            var phoneSize = 767;
            // var tabletSize = 1150;
            var windowWidth = $(window).width();
            if (windowWidth <= phoneSize) {
                var titleUrl = that._titleUrl;
                if (titleUrl && titleUrl.length > 0) {
                    titleUrl = encodeURI(titleUrl);
                    $(that.getDomRef()).find(".sapUshellSearchResultListItem-left").bind('click', that.fireNavigate(titleUrl));
                }
            }

            //$('.sapUshellSearchResultListItemButton .sapUshellSearchResultListItemButtonContainer').attr('role', 'button');
            //             var $attributeValue = $('.sapUshellSearchResultListItem-attribute-value');
            //             $attributeValue.each(function() {
            //                 if ($(this).prev().hasClass('sapUshellSearchResultListItem-attribute-label')) {
            //                     $(this).attr('aria-label', $(this).prev().text());
            //                 }
            //             });

            // use boldtagunescape like in highlighting for suggestions //TODO
            // allow <b> in title and attributes
            that.forwardEllipsis($(that.getDomRef())
                .find(".sapUshellSearchResultListItem-title, .sapUshellSearchResultListItem-attribute-value, .sapUshellSearchResultListItem-type"));
            var $detailsContainer = $(that.getDomRef()).find('.sapUshellSearchResultListItemDetails2');
            $detailsContainer.css("display", "none");
            $detailsContainer.css("height", "auto");
            $detailsContainer.css("overflow", "visible");

        },



        // ===================================================================
        // Some Helper Functions
        // ===================================================================

        _isDesktopSize: function() {
            //            var windowWidth = jQuery(window).width();
            if (!(this._isTabletSize() || this._isPhoneSize())) {
                return true;
            }
            return false;
        },

        _isTabletSize: function() {
            var windowWidth = $(window).width();
            if (windowWidth <= 1150 && !this._isPhoneSize()) { // @searchTabletSize
                return true;
            }
            return false;
        },

        _isPhoneSize: function() {
            var windowWidth = $(window).width();
            if (windowWidth <= 767) { // @searchPhoneSize
                return true;
            }
            return false;
        },

        _getNumberOfVisibleAttributes: function() {
            var that = this;
            if (!that._visibleAttributes) {
                var visibleAttributes = 4;

                if (!that._isDesktopSize()) {
                    visibleAttributes = 3;
                }

                if (!that._isPhoneSize() && that.getImageUrl()) {
                    visibleAttributes--;
                }
                that._visibleAttributes = visibleAttributes;
            }
            return that._visibleAttributes;
        },

        _resetPrecalculatedValues: function() {
            this._visibleAttributes = undefined;
            this._detailsArea = undefined;
            this._showExpandButton = false;
            this._titleUrl = this.getTitleUrl();
            this._intents = this.getData().intents;
        },






        // handler of  result list item left and image column
        // ===================================================================        
        fireNavigate: function(uri) {
            return function() {
                if (uri) {
                    //                	sap.ui.getCore().byId("shellOverlay").close();
                    window.location.href = uri;
                }
                //                else {
                //                	window.location.href = "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=111#SalesOrder-DisplayFactSheet?SalesOrder=27"
                //                }      		
            };

        },

        // allow <b> in title and attributes
        //        onAfterRendering: function() {
        //            var that = this;
        //            $(this.getDomRef()).find(".sapUshellSearchResultListItem-main").bind('click', that.fireNavigate(that.getTitleUrl()));
        //            this._setSafeText(
        //                $(this.getDomRef()).find(".sapUshellSearchResultListItem-title, .sapUshellSearchResultListItem-attribute-value, .sapUshellSearchResultListItem-type"));
        //        },


        forwardEllipsis: function(objs) {
            objs.each(function(i, d) {
                // recover bold tag with the help of text() in a safe way
                SearchHelper.forwardEllipsis4Whyfound(d);
            });
        }

    });


})();
