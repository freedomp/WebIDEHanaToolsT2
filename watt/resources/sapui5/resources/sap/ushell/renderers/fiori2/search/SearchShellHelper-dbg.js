// iteration 0 ok
/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup');
    var SearchFieldGroup = sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup;
    jQuery.sap.require("sap.ushell.renderers.fiori2.search.SearchModel");
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchShellHelper');
    var module = sap.ushell.renderers.fiori2.search.SearchShellHelper = {};
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SemanticObjectsHandler');
    var SemanticObjectsHandler = sap.ushell.renderers.fiori2.search.SemanticObjectsHandler;

    jQuery.extend(module, {

        init: function(isOpen) {
            var that = this;

            // member fields
            this.oShell = sap.ui.getCore().byId('shell');

            // create search model
            this.oModel = sap.ushell.renderers.fiori2.search.getModelSingleton();

            // create controls
            this.oSearchFieldGroup = new SearchFieldGroup("searchFieldInShell");
            this.oSearchFieldGroup.setModel(this.oModel);
            this.oShell.setSearch(this.oSearchFieldGroup);


            this.oSearchInput = this.oSearchFieldGroup.getAggregation("input");
            this.oSearchSelect = this.oSearchFieldGroup.getAggregation("select");
            this.oSearchButton = this.oSearchFieldGroup.getAggregation("button");
            this.oSearchButton.setType(sap.m.ButtonType.Transparent);

            // search select
            var tabletMaxWidth = 1150;
            if (jQuery(window).width() <= tabletMaxWidth) {
                // if screen is tablet-sized, then display select as a filter icon
                this.oSearchSelect.setDisplayMode('icon');
            }

            // search input
            //            this.oSearchInput.addEventDelegate({
            //                onAfterRendering: function(oEvent) {
            //                    // don't set focus in pohne.
            //                    // workaround for soft-keyboard-pop-up
            //                    if (!sap.ui.Device.system.phone) {
            //                        setTimeout(function() {
            //                            //  that.oSearchInput.focus();
            //                        }, 350);
            //                    }
            //                }
            //            }, this.oSearchInput);

            // search button
            this.oSearchButton.attachPress(function() {
                that.handleClickSearchButton();
            });

            sap.ui.getCore().getEventBus().subscribe("allSearchFinished", this.onAllSearchFinished, this);
            sap.ui.getCore().byId('navContainer').attachAfterNavigate(this.onAfterNavigate, this);

            // check if search field group is open
            // closeSearchFieldGroup -> false
            // openSearchFieldGroup -> true
            //            this.isSearchFieldGroupOpen = window.location.hash.substr(0, 14).toLowerCase() === '#action-search' ? true : false;

            if (isOpen || isOpen === undefined) {
                // open and center aligned
                this.openSearchFieldGroup(false);
                this.setSearchFieldGroupInCenter();
            } else {
                // closed and right aligned
                this.closeSearchFieldGroup(false);
                this.setSearchFieldGroupOnSide();
            }

        },

        onAfterNavigate: function(oEvent) {
            // navigation tries to restore the focus -> but application knows better how to set the focus
            // -> after navigation call focus setter of search application
            if (oEvent.getParameter('toId') !== 'shellPage-Action-search' &&
                oEvent.getParameter('toId') !== 'applicationShellPage-Action-search') {
                return;
            }
            //sap.ui.getCore().byId('searchContainerResultsView').setFocus();
            var oSearchView = sap.ui.getCore().byId('searchContainerResultsView');
            if (oSearchView && oSearchView.oFocusHandler) {
                oSearchView.oFocusHandler.setFocus();
            }
        },

        onAllSearchFinished: function() {
            this.setSearchFieldGroupInCenter();
            this.oSearchInput.setValue(this.oModel.getSearchBoxTerm());
        },


        setOpenStyle: function() {
            // switch off end-area-search-icon
            // not to use sap.ui.getCore().byId('sf').setVisible(false), avoid re-rendering
            jQuery('#sf').removeClass("sapUshellSearchFieldElementDisplayInlineBlock");
            jQuery('#sf').addClass("sapUshellSearchFieldElementDisplayNone");
            // switch on center-area-search-icon
            this.oSearchButton.removeStyleClass("sapUshellSearchFieldElementDisplayNone");
            this.oSearchButton.addStyleClass("sapUshellSearchFieldElementDisplayBlock");

            this.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupMaximized");
            this.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupMinimized");
            this.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupNotVisible");
        },


        setCloseStyle: function() {
            this.setSearchFieldGroupOnSide();
            this.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupMaximized");
            this.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupMinimized");
            this.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupNotVisible");

            // switch on end-area-search-icon
            // not to use sap.ui.getCore().byId('sf').setVisible(false), avoid re-rendering
            jQuery('#sf').removeClass("sapUshellSearchFieldElementDisplayNone");
            jQuery('#sf').addClass("sapUshellSearchFieldElementDisplayInlineBlock");
            // switch off center-area-search-icon
            this.oSearchButton.removeStyleClass("sapUshellSearchFieldElementDisplayBlock");
            this.oSearchButton.addStyleClass("sapUshellSearchFieldElementDisplayNone");
        },


        setSearchFieldGroupInCenter: function() {
            this.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupInCenter");
            this.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupOnSide");
        },

        setSearchFieldGroupOnSide: function() {
            this.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupInCenter");
            this.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupOnSide");
        },

        resetModel: function() {
            this.oSearchInput.setValue('');
            this.oModel.setSearchBoxTerm('');
            this.oModel.resetDataSource(false);
            this.oModel.resetFilterConditions(false);
        },

        openSearchFieldGroup: function(hasAnimation) {
            var that = this;

            //Pre-Fetch all App Tiles
            sap.ushell.Container.getService("Search")._getCatalogTiles();

            //Early Initialization of Semantics Objects Handler
            SemanticObjectsHandler.getSemanticObjectsMetadata();

            //            jQuery('.sapUshellSearchFieldGroupSubContainer').css('display', 'inline');
            if (hasAnimation) {
                // before animation
                that.setOpenStyle();
                // animation select
                if (jQuery('#searchFieldInShell-select').length > 0) {
                    // have select
                    // for first animation, a re-rendering will happen due to the data arriving, essentially killing the animation half-way through
                    jQuery('#searchFieldInShell-select').css('max-width', '0%').animate({
                        'max-width': '30%'
                    }, {
                        duration: 200,
                        complete: function() {
                            jQuery(this).css('max-width', '');
                        }
                    });
                }
                // animation input
                var inputMaxWidth = jQuery('.sapUshellSearchFieldGroupSubContainer').width() * 0.85 - 4 + "px";
                jQuery('#searchFieldInShell-input').css('max-width', '0%').animate({
                    'max-width': inputMaxWidth
                }, {
                    duration: 300,
                    complete: function() {
                        that.setOpenStyle();
                        if (!sap.ui.Device.system.phone) {
                            that.oSearchInput.focus();
                        }
                        jQuery(this).css('max-width', '');
                    }
                });
            } else {
                that.setOpenStyle();
                if (!sap.ui.Device.system.phone) {
                    that.oSearchInput.focus();
                }
            }

            that.isSearchFieldGroupOpen = true;
        },


        closeSearchFieldGroup: function(hasAnimation) {
            var that = this;

            if (hasAnimation) {
                // before animation
                that.oSearchFieldGroup.addStyleClass("sapUshellSearchFieldGroupOnSide");
                that.oSearchFieldGroup.removeStyleClass("sapUshellSearchFieldGroupInCenter");
                // animation select
                //jQuery('#searchFieldInShell-select').animate({
                //    'width': '0'
                //}, {
                //    duration: 20000,
                //    complete: function() {
                //        jQuery(this).css('width', '');
                //    }
                //});
                // animation input
                var inputWidth = jQuery('#searchFieldInShell-input').width() + "px";
                jQuery('#searchFieldInShell-input').css('max-width', inputWidth).animate({
                    'max-width': '0%'
                }, {
                    duration: 400,
                    complete: function() {
                        //jQuery('.sapUshellSearchFieldGroupSubContainer').css('display', 'none');
                        that.setCloseStyle();
                    }
                });
            } else {
                //jQuery('.sapUshellSearchFieldGroupSubContainer').css('display', 'none');
                that.setCloseStyle();
            }

            that.isSearchFieldGroupOpen = false;
        },


        handleClickSearchButton: function() {
            /* eslint no-lonely-if:0 */
            if (window.location.hash.substr(1, 13) !== "Action-search") {
                // not in search app
                //                if (!this.isSearchFieldGroupOpen) {
                //                    // 1 open search box
                //                    var that = this;
                //                    window.setTimeout(function() {
                //                        that.openSearchFieldGroup(true);
                //                    }, 20);
                //                } else {
                if (this.isSearchFieldGroupOpen) {
                    // 2 close search
                    // special logic, defined here
                    if (this.oSearchInput.getValue() === "") {
                        this.closeSearchFieldGroup(true);
                    }
                    // 3 trigger serach
                    // general logic, defined in searchFieldGroup
                }
            }
            // else in search app
            // 3 trigger serach
            // general logic, defined in searchFieldGroup
        }

    });

})();
