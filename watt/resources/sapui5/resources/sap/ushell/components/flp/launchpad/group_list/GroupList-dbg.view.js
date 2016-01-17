// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document */
    /*jslint plusplus: true, nomen: true */

    jQuery.sap.require("sap.ushell.ui.launchpad.GroupListItem");
    jQuery.sap.require("sap.ui.core.IconPool");

    sap.ui.jsview("sap.ushell.components.flp.launchpad.group_list.GroupList", {
        createContent: function (oController) {
            this.parentComponent = sap.ui.core.Component.getOwnerComponentFor(this);
            this.oModel = this.parentComponent.getModel();
            var that = this,
                oOpenCatalogItem =  this._getOpenCatalogItem(oController),
                oGroupListItemTemplate = this._getGroupListItemTemplate(oController);
            this.bAnimate = sap.ui.Device.system.desktop;
            this.isTouch = !sap.ui.Device.system.desktop;
            this.oGroupList = new sap.m.List("groupListItems", {
                items : {
                    path     : "/groups",
                    template : oGroupListItemTemplate
                }
            }).addStyleClass("sapUshellGroupItemList");
            //This two functions overwrite methods from ListBase class
            // to avoid unpredicted behavior with F6
            jQuery.extend(this.oGroupList, {
                onsapskipforward: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    sap.ushell.components.flp.ComponentKeysHandler.goToTileContainer(oEvent);
                },
                onsapskipback: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                },
                onsaptabprevious: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                }
            });

            this.oGroupList.onAfterRendering = function () {
                //set not as large element for F6 keyboard navigation
                this.data("sap-ui-fastnavgroup", "false", false);
                jQuery("#groupListFooter").attr("data-sap-ui-fastnavgroup", "false");

                that.oController.handleScroll();
            };
            jQuery.sap.require("sap.ushell.override");
            this.oGroupList.updateItems = sap.ushell.override.updateAggregatesFactory("items");

            if (this.getViewData().enablePersonalization === undefined || this.getViewData().enablePersonalization !== false) {
                this.oActionList = new sap.m.List({
                    items : [ oOpenCatalogItem ]
                });

                /*
                 override original onAfterRendering as currently sap.m.List
                 does not support afterRendering handler in the constructor
                 this is done to support tab order accessibility
                 */
                var origOpenCatalogListOnAfterRendering = this.oActionList.onAfterRendering;
                this.oActionList.onAfterRendering = function (oEvent) {
                    origOpenCatalogListOnAfterRendering.call(this, oEvent);
                };

                var groupListFooter = new sap.m.Bar({
                    id: "groupListFooter",
                    contentMiddle: [this.oActionList/*, lastHiddenSidebarTabFocusHelper*/]
                });
                groupListFooter.addStyleClass("sapUshellPersonalizationOn");

                this.groupListPage = new sap.m.Page({
                    id: "groupListPage", // sap.ui.core.ID
                    showHeader: false,
                    showFooter: true,
                    content: [this.oGroupList], // sap.ui.core.Control
                    footer: groupListFooter
                });
                this.groupListPage.addStyleClass("sapUshellPersonalizationOn");
            } else {
                this.groupListPage = new sap.m.Page({
                    id: "groupListPage", // sap.ui.core.ID
                    showHeader: false,
                    showFooter: false,
                    content: [this.oGroupList] // sap.ui.core.Control
                });
            }
            this.addStyleClass("sapUshellGroupList");

            return [this.groupListPage];
        },

        _getOpenCatalogItem : function () {
            var that = this,
                fOpenCatalog = function () {
                    that.parentComponent.getRouter().navTo('catalog');
                },
                oOpenCatalogItem = new sap.m.ActionListItem("openCatalogActionItem", {
                    text: "{i18n>open_catalog}",
                    tooltip: "{i18n>openCatalog_tooltip}",
                    press: fOpenCatalog
                });

            oOpenCatalogItem.addEventDelegate({
                onsaptabnext: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    sap.ushell.components.flp.ComponentKeysHandler.goToTileContainer();
                },
                onsaptabprevious: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    //sidePanelFirstGroup
                    var jqElement = jQuery(".sapUshellGroupLI:first:visible");
                    if (!jqElement.length) {
                        sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                    }
                    jqElement.focus();
                }
            });


            // if xRay is enabled
            if (this.oModel.getProperty("/enableHelp")) {
                oOpenCatalogItem.addStyleClass('help-id-openCatalogActionItem');// xRay help ID
            }
            return oOpenCatalogItem;
        },

        _getGroupListItemTemplate : function (oController) {
            var fOnAfterRenderingHandler = function (oEvent) {
                var xRayEnabled = this.getModel() && this.getModel().getProperty('/enableHelp');
                if (this.getDefaultGroup()) {
                    this.addStyleClass("sapUshellDefaultGroupItem");
                    // if xRay is enabled
                    if (xRayEnabled) {
                        this.addStyleClass("help-id-homeGroupListItem"); //xRay help ID
                    }
                } else {
                    this.addStyleClass("sapUshellGroupListItem");
                    // if xRay is enabled
                    if (xRayEnabled) {
                        this.addStyleClass("help-id-groupListItem"); //xRay help ID
                    }
                }

                jQuery(this.getDomRef()).attr("tabindex", "0");
            };

            return new sap.ushell.ui.launchpad.GroupListItem({
                index : "{index}",
                title : "{title}",
                tooltip : "{title}",
                defaultGroup : "{isDefaultGroup}",
                groupId : "{groupId}",
                numberOfTiles : "{tiles/length}",
                afterRendering : fOnAfterRenderingHandler,
                isGroupVisible: "{isGroupVisible}",
                press : [ function (oEvent) {
                    this._handleGroupListItemPress(oEvent);
                }, oController ],
                visible: {
                    parts: ["/tileActionModeActive", "isGroupVisible", "/personalization", "isGroupLocked", "tiles/length", "isDefaultGroup"],
                    formatter: function (tileActionModeActive, isGroupVisible, personalization, isGroupLocked, nTilesCount, isDefaultGroup) {
                        //Empty groups should not be displayed when personalization is off or if they are locked or default group not in action mode
                        if (!this.groupHasVisibleTiles() && (!personalization || (isGroupLocked && !tileActionModeActive) || (isDefaultGroup && !tileActionModeActive))) {
                            return false;
                        }
                        return isGroupVisible || tileActionModeActive;
                    }
                }
            });
        },

        getControllerName: function () {
            return "sap.ushell.components.flp.launchpad.group_list.GroupList";
        }
    });
}());
