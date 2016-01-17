(function() {

    "use strict";

    sap.ui.layout.FixFlex.extend("sap.ushell.renderers.fiori2.search.controls.SearchLayout", {

        metadata: {
            properties: {
                isBusy: {
                    type: "boolean",
                    defaultValue: false
                },
                showFacets: {
                    type: "boolean",
                    defaultValue: false
                }
            },
            aggregations: {
                "resultListContainer": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "facets": {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                "busyIndicator": {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },

        constructor: function(options, sId) {
            var that = this;
            sap.ui.layout.FixFlex.prototype.constructor.apply(this, [options], sId);

            this.addEventDelegate({
                onBeforeRendering: function() {
                    if (that.getShowFacets() && !sap.ui.Device.system.phone) {
                        that.setFixContentSize('18rem');
                    } else {
                        that.setFixContentSize('0rem');
                    }
                }
            });
        },

        getFacets: function() {
            return this.getFixContent();
        },

        setFacets: function(oControl) {
            this.addFixContent(oControl);
        },

        getResultListContainer: function() {
            return this.getFlexContent();
        },

        setResultListContainer: function(oControl) {
            this.setFlexContent(oControl);
        },

        setIsBusy: function(isBusy) {
            if (isBusy) {
                this.getBusyIndicator().open();
            } else {
                this.getBusyIndicator().close();
            }
            this.setProperty("isBusy", isBusy, true);
        },

        setShowFacets: function(areFacetsShown) {
            var $searchFacets = jQuery(".sapUiFixFlexFixed");

            var sWidth;
            var sOpacity;
            var sPaddingLeft;

            // inverted the pressed value since this function is only called
            // after pressed value is already changed.
            if (!areFacetsShown) {
                sWidth = "0";
                sOpacity = "0";
                sPaddingLeft = "2rem";
            } else {
                sWidth = "18rem";
                sOpacity = "1";
                sPaddingLeft = "1rem";
            }

            $searchFacets.animate({
                width: sWidth,
                opacity: sOpacity
            }, {
                complete: function() {
                    sap.ui.getCore().getEventBus().publish("searchLayoutChanged");
                },
                duration: 400
            });

            var oPadding = {};
            var sPaddingPropName;
            if (jQuery("html").attr("dir") === 'rtl') {
                sPaddingPropName = "padding-right";
            } else {
                sPaddingPropName = "padding-left";
            }
            oPadding[sPaddingPropName] = sPaddingLeft;
            if (sap.ui.Device.system.desktop) {
                jQuery(".searchResultListsContainer")
                    .animate(oPadding, {
                        duration: 400
                    });
            }

            // the 3. parameter supress rerendering
            this.setProperty("showFacets", areFacetsShown, true); // this validates and stores the new value

            return this; // return "this" to allow method chaining
        },

        renderer: "sap.ui.layout.FixFlexRenderer"

    });

})();
