/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.StandardListItem');

    sap.m.StandardListItem.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetItem', {

        constructor: function(sId, options) {
            var that = this;
            that.options = jQuery.extend({}, {
                type: sap.m.ListType.Active,
                title: "{label}",
                tooltip: "{label}" + " " + "{value}",
                key: "{id}",
                info: "{valueLabel}",
                // do we need this logic? TODO
                //                info: {
                //                    parts: [{
                //                        path: 'selected'
                //                    }, {
                //                        path: '/boCount'
                //                    }, {
                //                        path: '/appCount'
                //                    }, {
                //                        path: '/dataSource'
                //                    }, {
                //                        path: 'valueLabel'
                //                    }],
                //                    formatter: function(selected, boCount, appCount, ds, valueLabel) {
                //                        if (selected) {
                //                            if (ds && ds.objectName && ds.objectName.value === "$$APP$$") {
                //                                return appCount;
                //                            }
                //                            return boCount;
                //                        }
                //                    }
                //                },
                selected: "{selected}",
                level: "{level}"
            }, options);
            sap.m.StandardListItem.prototype.constructor.apply(this, [sId, that.options]);
            this.addStyleClass('sapUshellSearchFacetItem');
            this.addEventDelegate({
                onAfterRendering: function() {
                    if (that.getBindingContext() && that.getBindingContext().getObject()) {
                        var level = that.getBindingContext().getObject().level;
                        if (jQuery("html").attr("dir") === 'rtl') {
                            jQuery(that.getDomRef()).children(".sapMLIBContent").css("padding-right", level + "rem");
                        } else {
                            jQuery(that.getDomRef()).children(".sapMLIBContent").css("padding-left", level + "rem");
                        }
                    }
                }
            });
        },



        renderer: 'sap.m.StandardListItemRenderer'
    });
})();
