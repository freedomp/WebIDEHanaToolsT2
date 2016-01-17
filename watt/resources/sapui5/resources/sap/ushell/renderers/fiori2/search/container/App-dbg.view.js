// iteration 0 ok
/* global jQuery, sap, window, console */

// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * @version
 */

(function(global) {
    "use strict";

    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchShellHelper');


    jQuery.sap.require('sap.ushell.renderers.fiori2.search.controls.SearchBar');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');

    sap.ui.jsview("sap.ushell.renderers.fiori2.search.container.App", {

        createContent: function() {
            var that = this;

            // create search model
            if (!this.oModel) {
                this.oModel = sap.ushell.renderers.fiori2.search.getModelSingleton();
            }
            this.setModel(sap.ushell.resources.i18nModel, "i18n");

            // search result screen
            this.oSearchResults = sap.ui.view({
                id: "searchContainerResultsView",
                tooltip: "{i18n>searchResultsView_tooltip}",
                viewName: "sap.ushell.renderers.fiori2.search.container.Search",
                type: sap.ui.core.mvc.ViewType.JS
            });

            this.oSearchResults.setModel(that.oModel);
            this.oSearchResults.setAppView(that);

            // deserialze URL
            this.oModel.deserializeURL();

            // create page
            this.oPage = this.pageFactory("searchPage", [this.oSearchResults]);

            return this.oPage;
        },

        beforeExit: function() {

        },

        pageFactory: function(sId, oControl, bDisableBouncing) {
            var that = this;

            var oSearchBar = new sap.ushell.renderers.fiori2.search.controls.SearchBar({
                oSearchLayout: that.oSearchResults.searchLayout,
                filterButtonPressed: that.oModel.getProperty('/facetVisibility'),
                filterButtonVisible: {
                    parts: [{
                        path: '/businessObjSearchEnabled'
                    }],
                    formatter: function(businessObjSearchEnabled) {
                        return !sap.ui.Device.system.phone &&  businessObjSearchEnabled;
                    }
                },
                contentMiddle: new sap.m.Label({
                    text: {
                        parts: [{
                            path: '/count'
                        }],
                        formatter: function(count) {
                            var str = sap.ushell.resources.i18n.getText("searchResults") + ' (' + sap.ui.core.format.NumberFormat.getIntegerInstance({
                                style: "short"
                                    //style: "standard",
                                    //groupingEnabled: true
                            }).format(count) + ')';
                            return str;
                        }
                    }
                })
            });
            oSearchBar.setModel(that.oModel);

            var oPage = new sap.m.Page({
                id: sId,
                customHeader: oSearchBar,
                content: oControl,
                enableScrolling: true,
                showFooter: true
            });
            oPage.setModel(that.oModel);

            // who is using these events? Necessary? //TODO
            var aEvents = ["onAfterHide", "onAfterShow", "onBeforeFirstShow",
                "onBeforeHide", "onBeforeShow"
            ];
            var oDelegates = {};

            that.createFooter(oPage);

            // Pass navigation container events to children.
            jQuery.each(aEvents, function(iIndex, sEvent) {
                oDelegates[sEvent] = jQuery.proxy(function(evt) {
                    jQuery.each(this.getContent(), function(iIndex, oControl) {
                        /*jslint nomen: true */
                        oControl._handleEvent(evt);
                    });
                }, oPage);
            });

            oPage.addEventDelegate(oDelegates);
            if (!sap.ui.Device.system.desktop) {
                oPage._bUseIScroll = true;
            }
            if (bDisableBouncing) {
                this.disableBouncing(oPage);
            }

            // compact class for non-touch devices
            if (!sap.ui.Device.support.touch) {
                var oView = sap.ui.getCore().byId("searchContainerApp");
                oView.addStyleClass('sapUiSizeCompact');
            }

            return oPage;
        },

        getControllerName: function() {
            return "sap.ushell.renderers.fiori2.search.container.App";
        },

        createFooter: function(oPage) {

            var that = this;

            // no footer on phone
            if (jQuery.device.is.phone) {
                return;
            }

            // create bookmark button (entry in action sheet)
            var oBookmarkButton = new sap.ushell.ui.footerbar.AddBookmarkButton({
                beforePressHandler: function() {
                    var oAppData = {
                        url: document.URL,
                        title: that.getTileTitleProposal(),
                        icon: sap.ui.core.IconPool.getIconURI("search")
                    };
                    oBookmarkButton.setAppData(oAppData);
                }
            });
            oBookmarkButton.setWidth('auto');

            var oEmailButton = new sap.m.Button();
            oEmailButton.setIcon("sap-icon://email");
            oEmailButton.setText(sap.ushell.resources.i18n.getText("eMailFld"));
            oEmailButton.attachPress(function() {
                sap.m.URLHelper.triggerEmail(null, that.getTileTitleProposal(), document.URL);
            });
            oEmailButton.setWidth('auto');

            // add these two jam buttons when we know how to configure jam in fiori  //TODO
            //var oJamShareButton = new sap.ushell.ui.footerbar.JamShareButton();
            //var oJamDiscussButton = new sap.ushell.ui.footerbar.JamDiscussButton();


            // create action sheet
            var oActionSheet = new sap.m.ActionSheet({
                placement: 'Top',
                buttons: [oBookmarkButton, oEmailButton]
            });

            // button which opens action sheet
            var oShareButton = new sap.m.Button({
                icon: 'sap-icon://action',
                tooltip: sap.ushell.resources.i18n.getText('shareBtn'),
                press: function() {
                    oActionSheet.openBy(oShareButton);
                }
            });

            // create footer bar
            var oBar = new sap.m.Bar({
                contentRight: [oShareButton]
            });

            //destroy footer if available
            var oFooter = oPage.getFooter();
            if (oFooter && oFooter.destroy) {
                oFooter.destroy();
            }

            oPage.setFooter(oBar);

        },

        getTileTitleProposal: function() {
            var searchTerm = this.oModel.getSearchBoxTerm();
            var dataSourceLabel = this.oModel.getDataSource().label;
            var title;
            if (this.oModel.getDataSource().equals(this.oModel.allDataSource)) {
                title = sap.ushell.resources.i18n.getText('searchTileTitleProposalAll', [searchTerm]);
            } else {
                title = sap.ushell.resources.i18n.getText('searchTileTitleProposal', [searchTerm, dataSourceLabel]);
            }
            return title;
        }

    });


}(window));
