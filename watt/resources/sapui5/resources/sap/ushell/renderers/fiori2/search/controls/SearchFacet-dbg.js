/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.List');
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetItem");

    sap.m.List.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacet', {

        metadata: {
            properties: {
                eshRole: {
                    type: "string",
                    defaultValue: "datasource" //"datasource" or "attribute"
                }
            }
        },

        constructor: function(sId, options) {
            var that = this;
            options = jQuery.extend({}, {
                mode: sap.m.ListMode.SingleSelectMaster,
                showSeparators: sap.m.ListSeparators.None,
                includeItemInSelection: true,
                selectionChange: function(event) {
                    if (this.getEshRole() === "attribute") {
                        this.handleItemPress(event);
                    }
                },
                itemPress: function(event) {
                    if (this.getEshRole() === "datasource") {
                        this.handleItemPress(event);
                    }
                }
            }, options);
            sap.m.List.prototype.constructor.apply(this, [sId, options]);
            this.addStyleClass('sapUshellSearchFacet');
            this.addEventDelegate({
                onAfterRendering: function() {
                    if (that.getEshRole() === "datasource") {
                        jQuery(that.getDomRef()).append("<hr>");
                    }
                }
            });
        },

        handleItemPress: function(event) {
            var listItem = event.mParameters.listItem;
            var oSelectedItem = listItem.getBindingContext().getObject();
            if (listItem.getSelected()) {
                this.getModel().addFilterCondition(oSelectedItem);
            } else {
                this.getModel().removeFilterCondition(oSelectedItem);
            }
        },

        renderer: 'sap.m.ListRenderer',

        setEshRole: function(role) {
            var items = {
                path: "items",
                template: new sap.ushell.renderers.fiori2.search.controls.SearchFacetItem(),
                groupHeaderFactory: function(oGroup) {
                    return new sap.m.GroupHeaderListItem({
                        title: oGroup.key,
                        upperCase: false
                    });
                }
            };
            switch (role.toLowerCase()) {
                default:
                    case "datasource":
                    this.setMode(sap.m.ListMode.SingleSelectMaster);
                this.setHeaderText(sap.ushell.resources.i18n.getText("searchIn"));
                break;
                case "attribute":
                        this.setMode(sap.m.ListMode.MultiSelect);
                    this.setHeaderText("");
                    items.sorter = new sap.ui.model.Sorter("facetTitle", false, true);
                    break;
            }
            this.bindAggregation("items", items);
            this.setProperty("eshRole", role); // this validates and stores the new value
            return this; // return "this" to allow method chaining
        }

    });

})();
