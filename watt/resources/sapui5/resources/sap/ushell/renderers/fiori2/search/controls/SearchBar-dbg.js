/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Bar');
    jQuery.sap.require('sap.m.Label');
    jQuery.sap.require('sap.m.Button');
    jQuery.sap.require('sap.m.ButtonType');
    jQuery.sap.require('sap.m.ToggleButton');

    sap.m.Bar.extend('sap.ushell.renderers.fiori2.search.controls.SearchBar', {

        metadata: {
            properties: {
                filterButtonVisible: {
                    type: "boolean",
                    defaultValue: true
                },
                filterButtonPressed: {
                    type: "boolean",
                    defaultValue: false
                }
            }
        },

        constructor: function(options, sId) {
            var that = this;
            that.sMarginPropValueSmall = "0.5rem";
            that.sMarginPropValueBigNormalMode = "12.5rem";
            that.sMarginPropValueBigCompactMode = "13.5rem";
            that.sMarginPropValueBig = that.sMarginPropValueBigNormalMode;

            if (jQuery("html").attr("dir") === 'rtl') {
                that.sMarginPropName = "margin-right";
            } else {
                that.sMarginPropName = "margin-left";
            }

            that.filterButtonPressed = options.filterButtonPressed;
            that.filterBtn = new sap.m.ToggleButton({
                icon: sap.ui.core.IconPool.getIconURI("filter"),
                tooltip: that.filterButtonPressed ? sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip") : sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"),
                pressed: that.filterButtonPressed,
                press: function() {

                    if (this.getPressed()) {
                        // show facet
                        that.getModel().setFacetVisibility(true);

                        // fade out
                        that._animateFilterBtn(this.getPressed(), 400, function() {
                            jQuery(this).attr("title", sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip"));
                            // - setTooltip wourld trigger a compeltely new rendering, losing the current position
                            //that.filterBtn.setTooltip(sap.ushell.resources.i18n.getText("hideFacetBtn_tooltip"));
                        });

                    } else {
                        //hide facet
                        that.getModel().setFacetVisibility(false);
                        // fade in
                        that._animateFilterBtn(this.getPressed(), 400, function() {
                            jQuery(this).attr("title", sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"));
                            // - setTooltip wourld trigger a compeltely new rendering, losing the current position
                            //that.filterBtn.setTooltip(sap.ushell.resources.i18n.getText("showFacetBtn_tooltip"));
                        });
                    }
                }
            });
            that.filterBtn.addStyleClass('searchBarFilterButton');
            that.filterBtn.addEventDelegate({
                onAfterRendering: function() {
                    if (jQuery(that.getDomRef()).parents(".sapUiSizeCompact").length > 0) {
                        that.sMarginPropValueBig = that.sMarginPropValueBigCompactMode;
                    }
                    that._animateFilterBtn(that.filterBtn.getPressed(), 0);
                }
            });
            options = jQuery.extend({}, {
                contentLeft: [new sap.m.Button({
                    type: sap.m.ButtonType.Back,
                    press: function(event) {
                        window.history.back(1);
                    },
                    tooltip: "{i18n>backBtn_tooltip}"
                })]
            }, options);
            if (!sap.ui.Device.system.phone) {
                options.contentLeft.push(this.filterBtn);
            }
            sap.m.Bar.prototype.constructor.apply(this, [options], sId);
            this.addStyleClass('searchBar');
        },

        getFilterButtonVisible: function() {
            this.filterBtn.getVisible();
        },

        setFilterButtonVisible: function(bIsVisible) {
            this.filterBtn.setVisible(bIsVisible);
            this.setProperty("filterButtonVisible", bIsVisible);
        },

        getFilterButtonPressed: function() {
            this.filterBtn.getPressed();
        },

        setFilterButtonPressed: function(bIsPressed) {
            this.filterBtn.setPressed(bIsPressed);
            this.setProperty("filterButtonPressed", bIsPressed);
            this._animateFilterBtn(bIsPressed);
        },

        _animateFilterBtn: function(bPressed, nDuration, oCompleteCallBack) {
            var that = this;
            var oMargin = {};
            if (bPressed) {
                oMargin[that.sMarginPropName] = that.sMarginPropValueBig;
            } else {
                oMargin[that.sMarginPropName] = that.sMarginPropValueSmall;
            }
            jQuery(that.filterBtn.getDomRef()).animate(oMargin, {
                duration: nDuration,
                complete: oCompleteCallBack
            });

        },
        renderer: 'sap.m.BarRenderer'

    });

})();
