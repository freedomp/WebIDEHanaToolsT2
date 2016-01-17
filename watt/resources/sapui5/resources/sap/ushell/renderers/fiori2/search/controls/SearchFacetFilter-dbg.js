/* global sap */
/* global alert */
/* global jQuery */
/* global $ */

(function() {
    "use strict";
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacet");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog");
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchFacetDialogModel");

    sap.ui.core.Control.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetFilter', {

        metadata: {
            properties: {
                title: "string"
            },
            aggregations: {
                "facets": {
                    type: "sap.ushell.renderers.fiori2.search.controls.SearchFacet",
                    multiple: true
                }
            }
        },

        constructor: function(oOptions) {
            oOptions = jQuery.extend({}, {
                facets: {
                    path: "/facets",
                    template: new sap.ushell.renderers.fiori2.search.controls.SearchFacet()
                }
            }, oOptions);

            sap.ui.core.Control.prototype.constructor.apply(this, [oOptions]);
        },

        fireReset: function() {
            this.getModel().resetFilterConditions(false);
            this.getModel().setDataSource(this.getModel().allDataSource, true);
        },

        renderer: function(oRm, oControl) {
            function createOpenFacetDialogFn(dimension) {
                return function(event) {
                    var oFacetDialogModel = new sap.ushell.renderers.fiori2.search.SearchFacetDialogModel();
                    oFacetDialogModel.setData(oControl.getModel().getData());
                    oFacetDialogModel.facetDialogCall().done(function() {
                        var oDialog = new sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog({
                            selectedAttribute: dimension
                        });
                        oDialog.setModel(oFacetDialogModel);
                        oDialog.setModel(oControl.getModel(), 'searchModel');
                        oDialog.open();
                        //referece to page, so that dialog can be destroy in onExit()
                        var oPage = oControl.getParent().getParent().getParent().getParent();
                        oPage.oFacetDialog = oDialog;
                    });
                };
            }

            // outer div
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("sapUshellSearchFacetFilter");
            oRm.writeClasses();
            oRm.write('>');

            for (var i = 0, len = oControl.getFacets().length; i < len; i++) {
                var facet = oControl.getFacets()[i];
                if (i === 0) {
                    //refactoring to constructor, TODO
                    facet.setEshRole("datasource");
                } else {
                    facet.setEshRole("attribute");
                    if (i === 1) {
                        facet.setHeaderText(sap.ushell.resources.i18n.getText("filterBy"));
                    }
                }
                oRm.renderControl(facet);
                if (facet.getEshRole() === "attribute") {
                    var showMore = new sap.m.Link({
                        text: "{showMore}",
                        press: createOpenFacetDialogFn(facet.getBindingContext().getObject().dimension)
                    });
                    showMore.setModel(oControl.getModel("i18n"));
                    showMore.addStyleClass('sapUshellSearchFacetShowMoreLink');
                    oRm.renderControl(showMore);
                }
            }

            //show all filters button
            if (oControl.getFacets().length > 1) {
                oRm.write("<div>");
                var showAllBtn = new sap.m.Button({
                    text: "{showAllFilters}",
                    press: createOpenFacetDialogFn()
                });
                showAllBtn.setModel(oControl.getModel("i18n"));
                showAllBtn.addStyleClass("sapUshellSearchFacetFilterShowAllFilterBtn");
                oRm.renderControl(showAllBtn);
                oRm.write("</div>");
            }

            // close searchfacetfilter div
            oRm.write("</div>");
        },

        onAfterRendering: function() {
            // add aria button role to atasource items
            //$('.searchFacetFilter .searchFacet').first().find('.searchFacetItem').attr('role', 'button');
            var $dataSource = $('.sapUshellSearchFacetFilter .sapUshellSearchFacet').first().find('ul');
            var $dataSourceItems = $dataSource.find('li');
            $dataSource.attr('role', 'tree');
            $dataSourceItems.attr('role', 'treeitem');
        }

    });

})();
