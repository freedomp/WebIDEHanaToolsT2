// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/**
 * @fileOverview
 * Tile action mode implementation.
 *
 * In tile action mode the user can launch an action associated with a tile.
 * The mode is launched when clicking on one of the two activation buttons:
 * 1. In the user menu
 * 2. A floating button on the bottom-right corner on the launchpad.
 * Creation of the buttons depends on the following configuration properties:
 *  - enableActionModeMenuButton
 *  - enableActionModeFloatingButton
 *
 * Tile action mode can be activated only from the launchpad. it is not accessible from the catalog or from an application.
 * When the mode is active and the user clicks on a tile - the tile's corresponding actions are presented in an action sheet
 *  and the user can click/launch any of them.
 *
 * Every user action (e.g. menu buttons, drag-and-drop) except for clicking a tile - stops/deactivates the action mode.
 *
 * This module Contains the following:
 *  - Constructor function that creates action mode activation buttons
 *  - Activation handler
 *  - Deactivation handler
 *  - Rendering tile action menu
 *
 * @version 1.32.6
 */
/**
 * @namespace
 *
 * @name sap.ushell.components.flp.ActionMode
 *
 * @since 1.26.0
 * @private
 */
(function () {
    "use strict";

    /*global jQuery, sap, window, hasher, $ */
    /*jslint nomen: true */
    jQuery.sap.declare("sap.ushell.components.flp.ActionMode");

    /**
     * Constructor function
     * Creates action mode activation buttons:
     *  1. A new button in the user menu
     *  2. A floating button
     */
    var ActionMode = function () {
            this.oEventBus = sap.ui.getCore().getEventBus();
            this.oEventBus.subscribe('launchpad', 'actionModeInactive', this.scrollToViewPoint, this);
            this.oEventBus.subscribe('launchpad', 'actionModeActive', this.scrollToViewPoint, this);
            this.viewPoint = undefined;

            this.init = function (oModel) {
                this.oModel = oModel;
                var oNavContainerFlp = sap.ui.getCore().byId('navContainerFlp'),
                    oCurrentViewName = oNavContainerFlp.getCurrentPage().getViewName(),
                    bInDahsboard = oCurrentViewName == "sap.ushell.components.flp.launchpad.dashboard.DashboardContent";

                if (bInDahsboard) {
                    _createActionButtons(oModel);
                }
            };
        },

        _createActionModeMenuButton = function (oModel) {
            var oTileActionsButton = new sap.m.Button("ActionModeBtn", {
                    text : sap.ushell.resources.i18n.getText("activateActionMode"),
                    icon : 'sap-icon://edit',
                    tooltip : sap.ushell.resources.i18n.getText("activateActionMode"),
                    press : function () {
                        sap.ushell.components.flp.ActionMode.toggleActionMode(oModel, "Menu Item");
                    }
                });

            sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton(oTileActionsButton, "home");

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oTileActionsButton.addStyleClass('help-id-ActionModeBtn');// xRay help ID
            }
        },

        _createFloatingActionButton = function (oModel) {
            var oFloatingActionButton = new sap.ushell.ui.shell.ShellFloatingAction({
                    id: "floatingActionBtn",
                    icon: 'sap-icon://edit',
                    press: function (oEvent) {
                        sap.ushell.components.flp.ActionMode.toggleActionMode(oModel, "Floating Button");
                    },
                    tooltip: sap.ushell.resources.i18n.getText("activateActionMode")
                });

            oFloatingActionButton.data("sap-ui-fastnavgroup", "true", true/*Write into DOM*/);
            oFloatingActionButton.addEventDelegate({

            onsapskipback: function (oEvent) {
                oEvent.preventDefault();
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;
            },

            onsaptabprevious: function (oEvent) {
                oEvent.preventDefault();
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;
            }
        });

        // if xRay is enabled
        if (oModel.getProperty("/enableHelp")) {
            oFloatingActionButton.addStyleClass('help-id-floatingActionBtn');// xRay help ID
        }
        sap.ushell.renderers.fiori2.RendererExtensions.addFloatingActionButton(oFloatingActionButton, "home");
     },

     _createActionButtons = function (oModel) {

         // Create action mode button in the user actions menu
         if (oModel.getProperty("/actionModeMenuButtonEnabled")) {
             _createActionModeMenuButton(oModel);
         }

         // Create floating action mode button
         if (oModel.getProperty("/actionModeFloatingButtonEnabled")) {
             _createFloatingActionButton(oModel);
         }
     },
     
    /**
    * Handler of click action on the shell page when tile action mode is active.
    * Tile action mode is deactivated.
    *
    * @param oEvent Event object of the clicked item/action
    */
    fnShellClickHandler = function (oEvent) {
        var clickedObj = oEvent.target;
        // If the clicked object is not a tile then the user exists action mode
        if (!$(clickedObj).hasClass("sapUshellTileActionLayerDiv")) {
            setTimeout($.proxy(sap.ushell.components.flp.ActionMode.deactivate(), sap.ushell.components.flp.ActionMode), 0);
        }
    };

   /**
    * Activation handler of tile actions mode 
    * 
    * Performs the following actions:
    * - Shows a toast message indicating the activated mode
    * - Sets the feature's model property to indicate that the feature is activated
    * - Registers deactivation click handler, called when the user clicks outside of a tile
    * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
    * - Disables drag capability on tiles
    * - Changes the appearance of the floating activation button
    */
    ActionMode.prototype.activate = function () {
        var oFloatingActionButton,
            oTileActionsButton;

        this.eventDelegateObj = {
            ontap : fnShellClickHandler,
            ontouchstart : fnShellClickHandler,
            onmousedown : fnShellClickHandler
        };

        jQuery.sap.require("sap.m.MessageToast");
        sap.m.MessageToast.show(sap.ushell.resources.i18n.getText("actionModeActivated"), {duration: 4000});
        this.calcViewPosition();
        this.oModel.setProperty('/tileActionModeActive', true);
        this.aOrigHiddenGroupsIds = sap.ushell.utils.getCurrentHiddenGroupIds(this.oModel);

        // Change floating button display
        oFloatingActionButton = sap.ui.getCore().byId("floatingActionBtn");
        if (oFloatingActionButton) {
            oFloatingActionButton.addStyleClass("sapUshellActive");
            oFloatingActionButton.setTooltip(sap.ushell.resources.i18n.getText("deactivateActionMode"));
        }

        // Change action mode button display in the user actions menu
        oTileActionsButton = sap.ui.getCore().byId("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setTooltip(sap.ushell.resources.i18n.getText("exitPersonalizationMode"));
            oTileActionsButton.setText(sap.ushell.resources.i18n.getText("exitPersonalizationMode"));
        }
        this.oEventBus.publish('launchpad', 'actionModeActive');
    };

    ActionMode.prototype.calcViewPosition = function () {
        //get current visible group and offset from top.
        var jqContainer = jQuery('#dashboardGroups').find('.sapUshellTileContainer').not('.sapUshellHidden'),
            ind;

        if (jqContainer) {
            for (ind = 0; ind < jqContainer.length; ind++) {
                var uiGroup = jqContainer[ind],
                    fromTopPos = jQuery(uiGroup).parent().offset().top;
                if (fromTopPos > 0) {
                    var firstChildId = jQuery(uiGroup).attr("id"),
                        oGroup = sap.ui.getCore().byId(firstChildId),
                        oData = {group : oGroup, fromTop: fromTopPos};
                    this.viewPoint = oData;
                    return;
                }
            }
        }
    };

    ActionMode.prototype.scrollToViewPoint = function () {
        window.setTimeout(jQuery.proxy(this.oEventBus.publish, this.oEventBus, "launchpad", "scrollToFirstVisibleGroup", this.viewPoint), 0);
    };

    /**
     * Deactivation handler of tile actions mode
     *
     * Performs the following actions:
     * - Unregisters deactivation click handler
     * - Sets the feature's model property to indicate that the feature is deactivated
     * - Enables drag capability on tiles
     * - Destroys the tile actions menu control
     * - Removed the cover DIV from to all the tiles
     * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
     * - Changes the appearance of the floating activation button
     */
    ActionMode.prototype.deactivate = function () {
        var tileActionsMenu = sap.ui.getCore().byId("TileActions"),
            oTileActionsButton,
            oFloatingActionButton;

        this.calcViewPosition();
        this.oModel.setProperty('/tileActionModeActive', false);
        this.oEventBus.publish("launchpad", 'actionModeInactive', this.aOrigHiddenGroupsIds);
        if (tileActionsMenu !== undefined) {
            tileActionsMenu.destroy();
        }

        // Change floating button display
        oFloatingActionButton = sap.ui.getCore().byId("floatingActionBtn");
        if (oFloatingActionButton) {
            oFloatingActionButton.removeStyleClass("sapUshellActive");
            oFloatingActionButton.setTooltip(sap.ushell.resources.i18n.getText("activateActionMode"));
        }

        // Change action mode button display in the user actions menu
        oTileActionsButton = sap.ui.getCore().byId("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setTooltip(sap.ushell.resources.i18n.getText("activateActionMode"));
            oTileActionsButton.setText(sap.ushell.resources.i18n.getText("activateActionMode"));
        }
    };

    ActionMode.prototype.toggleActionMode = function (oModel, sSource) {
        var bTileActionModeActive = oModel.getProperty('/tileActionModeActive');
        if (bTileActionModeActive) {
            this.deactivate();
        } else {
            this.activate();
            sap.ui.getCore().getEventBus().publish("launchpad", "enterEditMode", {source: sSource});
        }
    };

    /**
     * Apply action/edit mode CSS classes on a group.
     * This function is called when in edit/action mode and tiles were dragged,
     *  since the group is being re-rendered and the dashboard is still in action/edit mode
     */
    ActionMode.prototype.activateGroupEditMode = function (oGroup) {
        var jqGroupElement = jQuery(oGroup.getDomRef()).find('.sapUshellTileContainerContent');

        jqGroupElement.addClass("sapUshellTileContainerEditMode");
    };

   /**
    * Opens the tile menu, presenting the tile's actions 
    * 
    * Performs the following actions:
    * - Returning the clicked tile to its original appearance
    * - Tries to get an existing action sheet in case actions menu was already opened during this session of action mode 
    * - If this is the first time the user opens actions menu during this session of action mode - create a new action sheet
    * - Gets the relevant tile's actions from launch page service and create buttons accordingly
    * - Open the action sheet by the clicked tile         
    * 
    * @param oEvent Event object of the tile click action 
    */
    ActionMode.prototype._openActionsMenu = function (oEvent, oTilePressed) {
        var that = this,
            oTileControl = oTilePressed || oEvent.getSource(),
            launchPageServ =  sap.ushell.Container.getService("LaunchPage"),
            aActions = [],
            oActionSheet = sap.ui.getCore().byId("TileActions"),
            index,
            noActionsButton,
            oButton,
            oAction,
            oTile,
            fnHandleActionPress;

        if (oTileControl) {
            oTile = oTileControl.getBindingContext().getObject().object;
            aActions = launchPageServ.getTileActions(oTile);
        }
        that.oTileControl = oTileControl;
        jQuery(".sapUshellTileActionLayerDivSelected").removeClass("sapUshellTileActionLayerDivSelected");

        var coverDiv = jQuery(oEvent.getSource().getDomRef()).find(".sapUshellTileActionLayerDiv");
        coverDiv.addClass("sapUshellTileActionLayerDivSelected");
        if (oActionSheet === undefined) {
            oActionSheet = new sap.m.ActionSheet("TileActions", {
                placement: sap.m.PlacementType.Auto,
                afterClose: function () {
                    $(".sapUshellTileActionLayerDivSelected").removeClass("sapUshellTileActionLayerDivSelected");
                    var oEventBus = sap.ui.getCore().getEventBus();
                    oEventBus.publish("dashboard", "actionSheetClose",that.oTileControl);
                }
            });
        } else {
            oActionSheet.destroyButtons();
        }


        // in a locked group we do not show any action (this is here to prevent the tile-settings action added by Dynamic & Static tiles from being opened)
        // NOTE - when removeing this check (according to requirements by PO) - we must disable the tileSettings action in a different way
        if (aActions.length === 0 || oTileControl.oParent.getProperty("isGroupLocked")) {
            // Create a single button for presenting "Tile has no actions" message to the user
            noActionsButton = new sap.m.Button({
                text:  sap.ushell.resources.i18n.getText("tileHasNoActions"),
                enabled: false
            });
            oActionSheet.addButton(noActionsButton);
        } else {
            /*eslint-disable no-loop-func*/
            /*eslint-disable wrap-iife*/
            for (index = 0; index < aActions.length; index++) {
                oAction = aActions[index];
                // The press handler of a button (representing a single action) in a tile's action sheet 
                fnHandleActionPress = function (oAction) {
                    return function () {
                        that._handleActionPress(oAction);
                    };
                }(oAction);
                oButton = new sap.m.Button({
                    text:  oAction.text,
                    icon:  oAction.icon,
                    press: fnHandleActionPress
                });
                oActionSheet.addButton(oButton);
            }
            /*eslint-enable no-loop-func*/
            /*eslint-enable wrap-iife*/
        }
        oActionSheet.openBy(oEvent.getSource());
    };

    /**
     * Press handler of a button (representing a single action) in a tile's action sheet
     *
     * @param oAction The event object initiated by the click action on an element in the tile's action sheet.
     *               In addition to the text and icon properties, oAction contains one of the following:
     *               1. A "press" property that includes a callback function.
     *                  In this case the action (chosen by the user) is launched by calling the callback is called
     *               2. A "targetUrl" property that includes either a hash part of a full URL.
     *                  In this case the action (chosen by the user) is launched by navigating to the URL
     */
    ActionMode.prototype._handleActionPress = function (oAction) {
        if (oAction.press) {
            oAction.press.call();
        } else if (oAction.targetURL) {
            if (oAction.targetURL.indexOf("#") == 0) {
                hasher.setHash(oAction.targetURL);
            } else {
                window.open(oAction.targetURL, '_blank');
            }
        } else {
            sap.m.MessageToast.show("No Action");
        }
    };

    sap.ushell.components.flp.ActionMode = new ActionMode();
}());
