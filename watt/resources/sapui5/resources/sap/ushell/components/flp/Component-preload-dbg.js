jQuery.sap.registerPreloadedModules({
"name":"sap/ushell/components/flp/Component-preload",
"version":"2.0",
"modules":{
	"sap/ushell/components/flp/ActionMode.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
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
},
	"sap/ushell/components/flp/Component.js":'// Copyright (c) 2009-2014 SAP SE, All Rights Reserved\njQuery.sap.declare("sap.ushell.components.flp.Component");\nif (!window[\'sap-ui-debug\']) {\n    try {\n        jQuery.sap.require(\'sap.fiori.flp-controls\');\n    } catch (e) {\n        jQuery.sap.log.warning(\'flp-controls failed to load: \' + e.message);\n    }\n}\njQuery.sap.require("sap.ui.core.UIComponent");\njQuery.sap.require("sap.ushell.components.flp.CustomRouter");\n/* global hasher */\njQuery.sap.require("sap.ushell.components.flp.ComponentKeysHandler");\n\nsap.ui.core.UIComponent.extend("sap.ushell.components.flp.Component", {\n\n    metadata: {\n        routing : {\n            config: {\n                viewType: "JS",\n                controlAggregation : "pages",\n                controlId : "navContainerFlp",\n                clearAggregation: false,\n                routerClass : sap.ushell.components.flp.CustomRouter\n            },\n            targets: {\n                catalog: {\n                    viewName : "sap.ushell.components.flp.launchpad.catalog.Catalog"\n                },\n                home: {\n                    viewName : "sap.ushell.components.flp.launchpad.dashboard.DashboardContent"\n                }\n            },\n            routes : [\n                {\n                    name : "home",\n                    target: \'home\',\n                    pattern : "home"\n                }\n            ]\n        },\n\n        version: "1.32.6",\n\n        library: "sap.ushell.components.flp",\n\n        dependencies: {\n            libs: ["sap.m"]\n        },\n        config: {\n            semanticObject: \'Shell\',\n            action: \'home\',\n            title: sap.ushell.resources.i18n.getText("homeBtn_tooltip"),\n            fullWidth: true,\n            hideLightBackground: true,\n            compactContentDensity: true,\n            cozyContentDensity: true\n        }\n    },\n\n    parseOldCatalogParams: function (sUrl) {\n        var mParameters = jQuery.sap.getUriParameters(sUrl).mParams,\n            sValue;\n        for (var sKey in mParameters) {\n            if (mParameters.hasOwnProperty(sKey)) {\n                sValue = mParameters[sKey][0];\n                mParameters[sKey] = sValue.indexOf(\'/\') !== -1 ? encodeURIComponent(sValue) : sValue;\n            }\n        }\n        return mParameters;\n    },\n\n    handleNavigationFilter: function (sNewHash) {\n        "use strict";\n        var oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sNewHash);\n        if (oShellHash && oShellHash.semanticObject === \'shell\' && oShellHash.action === \'catalog\') {\n            var mParameters = this.parseOldCatalogParams(sNewHash);\n            setTimeout(function () {\n                this.getRouter().navTo(\'catalog\', {filters : JSON.stringify(mParameters)});\n            }.bind(this), 0);\n            return this.oShellNavigation.NavigationFilterStatus.Abandon;\n        }\n        return this.oShellNavigation.NavigationFilterStatus.Continue;\n    },\n\n    createContent: function () {\n        "use strict";\n        this.oRouter = this.getRouter();\n        this.oModel = new sap.ui.model.json.JSONModel({\n            groups : [],\n            animationRendered : false,\n            tagFiltering: true,\n            catalogSelection: true,\n            tileActionModeEnabled: false,\n            tileActionModeActive: false,\n            isInDrag: false,\n            rtl: sap.ui.getCore().getConfiguration().getRTL(),\n            personalization: true,\n            editTitle: false,\n            tagList : [],\n            selectedTags : [],\n            userPreferences : {\n                entries : []\n            }\n        });\n\n        this.oModel.setSizeLimit(10000); // override default of 100 UI elements on list bindings\n        this.setModel(this.oModel);\n        this.oConfig = this.getComponentData().config;\n        //check the personalization flag in the Component configuration and in the Renderer configuration\n        this.oShellConfig = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration();\n        var bPersonalizationActive = (this.oConfig && (this.oConfig.enablePersonalization || this.oConfig.enablePersonalization === undefined))\n            && (this.oShellConfig && this.oShellConfig.enablePersonalization || this.oShellConfig.enablePersonalization === undefined);\n        //the catalog route should be added only if personalization is active\n        if (bPersonalizationActive) {\n            this.oRouter.addRoute({\n                name : "catalog",\n                target: \'catalog\',\n                pattern : "catalog/:filters:"\n            });\n        }\n        //add the "all" route after the catalog route was added\n        this.oRouter.addRoute({\n            name : "all",\n            target: \'home\',\n            pattern : ":all*:"\n        });\n        this._setConfigurationToModel(this.oConfig);\n        jQuery.sap.require("sap.ushell.components.flp.launchpad.DashboardManager");\n        this.oDashboardManager = new sap.ushell.components.flp.launchpad.DashboardManager("dashboardMgr", {\n            model : this.oModel,\n            config : this.oConfig,\n            router : this.oRouter\n        });\n\n        jQuery.sap.require("sap.ushell.resources");\n        this.setModel(sap.ushell.resources.i18nModel, "i18n");\n\n        var oNavContainer,\n            mediaQ = window.matchMedia("(min-width: 800px)"),\n            handleMedia = function (mq) {\n                this.oModel.setProperty("/isPhoneWidth", !mq.matches);\n            }.bind(this);\n        if (mediaQ.addListener) {// condition check if mediaMatch supported(Not supported on IE9)\n            mediaQ.addListener(handleMedia);\n            handleMedia(mediaQ);\n        }\n\n        sap.ui.getCore().getEventBus().subscribe("showCatalog", this.showCatalog, this);\n        sap.ui.getCore().getEventBus().subscribe("launchpad", "togglePane", this._createAndAddGroupList, this);\n\n        this.bContactSupportEnabled = sap.ushell.Container.getService("SupportTicket").isEnabled();\n        if (this.bContactSupportEnabled) {\n            jQuery.sap.require("sap.ushell.UserActivityLog");\n            sap.ushell.UserActivityLog.activate();\n        }\n        oNavContainer = this.initNavContainer();\n\n        this.setInitialConfiguration();\n\n        this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");\n        this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this.handleNavigationFilter, this));\n        //handle direct navigation with the old catalog intent format\n        var sHash = hasher.getHash();\n        var oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sHash);\n        if (oShellHash && oShellHash.semanticObject === \'shell\' && oShellHash.action === \'catalog\') {\n            var mParameters = this.parseOldCatalogParams(sHash);\n            var oComponentConfig = this.getMetadata().getConfig();\n            this.oShellNavigation.toExternal({\n                target: {\n                    semanticObject: oComponentConfig.semanticObject,\n                    action: oComponentConfig.action\n                }\n            });\n            this.getRouter().navTo(\'catalog\', {filters : JSON.stringify(mParameters)});\n        }\n\n\n\n        return oNavContainer;\n    },\n\n    _createAndAddGroupList: function (sChannel, sEventName, oData) {\n        if (oData.currentContent && (oData.currentContent.indexOf(\'groupList\') !== -1 || !oData.currentContent.length)) {\n            var oConfig = this.oConfig,\n                oGroupListData = this.runAsOwner(function () {\n                    return this.oDashboardManager.getGroupListView(oConfig);\n                }.bind(this));\n\n            if (!oGroupListData.alreadyCreated) {\n                oGroupListData.groupList.setModel(this.oModel);\n                oGroupListData.groupList.setModel(sap.ushell.resources.i18nModel, "i18n");\n                sap.ushell.renderers.fiori2.RendererExtensions.setLeftPaneContent(oGroupListData.groupList, "home");\n            }\n        }\n    },\n\n    _setConfigurationToModel : function (oConfig) {\n        var oModel = this.oModel,\n            tileActionModeEnabled;\n        if (oConfig) {\n            if (oConfig.enablePersonalization !== undefined && this.oShellConfig.enablePersonalization !== undefined) {\n                oModel.setProperty("/personalization", oConfig.enablePersonalization && this.oShellConfig.enablePersonalization);\n            } else if (oConfig.enablePersonalization !== undefined) {\n                oModel.setProperty("/personalization", oConfig.enablePersonalization);\n            } else if (this.oShellConfig.enablePersonalization !== undefined) {\n                oModel.setProperty("/personalization", this.oShellConfig.enablePersonalization);\n            }\n            if (oConfig.enableTagFiltering !== undefined) {\n                oModel.setProperty("/tagFiltering", oConfig.enableTagFiltering);\n            }\n            if (oConfig.enableLockedGroupsCompactLayout !== undefined) {\n                oModel.setProperty("/enableLockedGroupsCompactLayout", oConfig.enableLockedGroupsCompactLayout);\n            }\n            if (oConfig.enableCatalogSelection !== undefined) {\n                oModel.setProperty("/catalogSelection", oConfig.enableCatalogSelection);\n            }\n            if (oConfig.enableSearchFiltering !== undefined) {\n                oModel.setProperty("/searchFiltering", oConfig.enableSearchFiltering);\n            }\n            if (oConfig.enableTilesOpacity !== undefined) {\n                oModel.setProperty("/tilesOpacity", oConfig.enableTilesOpacity);\n            }\n            if (oConfig.enableDragIndicator !== undefined) {\n                oModel.setProperty("/enableDragIndicator", oConfig.enableDragIndicator);\n            }\n            tileActionModeEnabled = false;\n            if (oConfig.enableActionModeMenuButton !== undefined) {\n                oModel.setProperty("/actionModeMenuButtonEnabled", oConfig.enableActionModeMenuButton);\n                tileActionModeEnabled = oConfig.enableActionModeMenuButton;\n            }\n            if (oConfig.enableRenameLockedGroup !== undefined) {\n                oModel.setProperty("/enableRenameLockedGroup", oConfig.enableRenameLockedGroup);\n            } else {\n                oModel.setProperty("/enableRenameLockedGroup", false);\n            }\n\n            if (oConfig.enableActionModeFloatingButton !== undefined) {\n                oModel.setProperty("/actionModeFloatingButtonEnabled", oConfig.enableActionModeFloatingButton);\n                tileActionModeEnabled = tileActionModeEnabled || oConfig.enableActionModeFloatingButton;\n            }\n            oModel.setProperty("/tileActionModeEnabled", tileActionModeEnabled);\n            if (oConfig.enableTileActionsIcon !== undefined) {\n                //Available only for desktop\n                oModel.setProperty("/tileActionsIconEnabled", sap.ui.Device.system.desktop ? oConfig.enableTileActionsIcon : false);\n            }\n            if (oConfig.enableHideGroups !== undefined) {\n                oModel.setProperty("/enableHideGroups", oConfig.enableHideGroups);\n            }\n            // check for title\n            if (oConfig.title) {\n                oModel.setProperty("/title", oConfig.title);\n            }\n\n            // xRay enablement configuration\n            oModel.setProperty("/enableHelp", !!this.oShellConfig.enableHelp);\n            oModel.setProperty("/disableSortedLockedGroups", !!oConfig.disableSortedLockedGroups);\n\n        }\n    },\n\n    initNavContainer: function (oController) {\n        var oNavContainer = new sap.m.NavContainer({\n            id: "navContainerFlp"\n        });\n        oNavContainer.addCustomTransition(\n            "slideBack",\n            sap.m.NavContainer.transitions.slide.back,\n            sap.m.NavContainer.transitions.slide.back\n        );\n        return oNavContainer;\n    },\n\n    setInitialConfiguration: function() {\n        this.oRouter.initialize();\n\n        // set keyboard navigation handler\n        sap.ushell.components.flp.ComponentKeysHandler.init(this.oModel, this.oRouter);\n        sap.ushell.renderers.fiori2.AccessKeysHandler.registerAppKeysHandler(sap.ushell.components.flp.ComponentKeysHandler.handleFocusOnMe);\n        var translationBundle = sap.ushell.resources.i18n,\n            aShortcutsDescriptions = [];\n\n        aShortcutsDescriptions.push({text: "Alt+H", description: translationBundle.getText("actionHomePage")});\n\n        if (this.oModel.getProperty("/personalization")) {\n            aShortcutsDescriptions.push({text: "Alt+C", description: translationBundle.getText("actionCatalog")});\n        }\n\n        sap.ushell.renderers.fiori2.AccessKeysHandler.registerAppShortcuts(sap.ushell.components.flp.ComponentKeysHandler.handleShortcuts, aShortcutsDescriptions);\n    },\n\n    exit : function () {\n        this.oDashboardManager.destroy();\n    }\n});\n',
	"sap/ushell/components/flp/ComponentKeysHandler.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

/* eslint-disable no-cond-assign */

(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.components.flp.ComponentKeysHandler");

    var componentKeysHandler = function () {
        this.aTileWrapperClasses = ['.sapUshellTile', '.sapUshellLinkTile'];
    };

    componentKeysHandler.prototype = {
        keyCodes: jQuery.sap.KeyCodes,

        handleCatalogKey: function () {
            this.oRouter.navTo("catalog");
        },

        handleHomepageKey: function () {
            this.oRouter.navTo("home");
        },

        getNumberOfTileInRow: function (pageName, bIsLink) {
            var jqTile = jQuery(bIsLink ? ".sapUshellLinkTile:first" : ".sapUshellTile:first");
            if (!jqTile.length) { return false; }
            var core = sap.ui.getCore();
            var tile = core.byId(jqTile.attr('id'));
            var firstTileProportion = !bIsLink && (tile.getLong() === true) ? 2 : 1;
            var contentWidth;
            if (pageName === "catalog") {
                contentWidth = jQuery("#catalogTiles .sapUshellTileContainerContent").width();
            } else {
                contentWidth = jQuery("#dashboardGroups").width();
            }
            var tileWidth = jqTile.outerWidth(true) / firstTileProportion;
            var numberTilesInRow =  Math.floor(contentWidth / tileWidth);
            return numberTilesInRow;
        },

        goToTileContainer: function (keyup) {
            var bIsActionsModeActive = this.oModel.getProperty('/tileActionModeActive');

            if (bIsActionsModeActive) {
                sap.ushell.components.flp.ComponentKeysHandler.goToEdgeTileContainer('first');
            } else {
                sap.ushell.components.flp.ComponentKeysHandler.goToEdgeTile('first');
            }
            return true;
        },

        goToEdgeTile: function (selector) {
            var tileToSelect = jQuery(".sapUshellTile:visible:not('.sapUshellPlusTile')")[selector]();
            if (!tileToSelect.length) {
                return false;
            }
            this.setTileFocus(tileToSelect);
            return true;
        },

        goToEdgeTileContainer: function (selector) {
            var jqTileContainerToSelect = jQuery('.sapUshellTileContainer:visible')[selector]();
            if (!jqTileContainerToSelect.length) {
                return false;
            }
            this.setTileContainerSelectiveFocus(jqTileContainerToSelect);
            return true;
        },

        goToFirstTileOfSiblingGroup: function (selector, e) {
            e.preventDefault();
            var currentGroup = jQuery(":focus").closest(".sapUshellDashboardGroupsContainerItem");
            if (!currentGroup.length) { return; }
            var nextGroup = currentGroup[selector + "All"](".sapUshellDashboardGroupsContainerItem:has(.sapUshellTile:visible):not(.sapUshellCloneArea)");
            var tileSelector = 'first';
            if (!nextGroup.length) {
                nextGroup = currentGroup;
                tileSelector = ( selector === "next" ) ? 'last' : 'first';
            } else {
                nextGroup = nextGroup.first();
            }
            var jqTileToSelect = nextGroup.find(".sapUshellTile:visible:not('.sapUshellPlusTile')")[tileSelector]();
            this.moveScrollDashboard(jqTileToSelect);

            return false;
        },

        goToFirstTileOfSiblingGroupInCatalog: function (selector, e) {
            e.preventDefault();
            // var currentGroup = new Array();
            var jqTileContainer = this.getFocusOnTile(jQuery(":focus"));
            if (!jqTileContainer) { return; }

            var jqTileToFocus;

            if (selector == "next") {
                var isLastGroup = jqTileContainer.nextAll("h3").length ? false : true;
                if (!isLastGroup) {
                    jqTileToFocus = jqTileContainer.nextAll("h3").first().nextAll().filter(":visible").first();
                } else {
                    jqTileToFocus = jqTileContainer.nextAll(".sapUshellTile").last();
                }
            } else {
                var isFirstGroup = jqTileContainer.prevAll("h3").length === 1 ? true : false;
                if (!isFirstGroup) {
                    jqTileToFocus = jQuery(jqTileContainer.prevAll("h3")[1]).next();
                } else {
                    jqTileToFocus = jqTileContainer.prevAll("h3").last().next();
                }
            }

            this.setTileFocus(jqTileToFocus);
            this.moveScrollCatalog(jqTileToFocus);

            return false;
        },

        swapTwoTilesInGroup: function (group, firstTile, secondTile) {
            var groupModelObj = group.getBindingContext().getObject();
            var firstTileIndex = groupModelObj.tiles.indexOf(firstTile.getBindingContext().getObject());
            var secondTileIndex = groupModelObj.tiles.indexOf(secondTile.getBindingContext().getObject());
            var firstTileModelObj = groupModelObj.tiles.splice(firstTileIndex, 1, null);
            var secondTileModelObj = groupModelObj.tiles.splice(secondTileIndex, 1, firstTileModelObj[0]);
            groupModelObj.tiles.splice(firstTileIndex, 1, secondTileModelObj[0]);
            var groupPath = group.getBindingContext().getPath();
            group.getModel().setProperty(groupPath, groupModelObj);
        },

        moveTileInGroup: function (group, firstTile, secondTile) {
            if (this.oModel.getProperty("/personalization")) {
                var groupModelObj = group.getBindingContext().getObject();
                var firstTileIndex = groupModelObj.tiles.indexOf(firstTile.getBindingContext().getObject());
                var secondTileIndex = groupModelObj.tiles.indexOf(secondTile.getBindingContext().getObject());
                var firstTileModelObj = groupModelObj.tiles.splice(firstTileIndex, 1);
                groupModelObj.tiles.splice(secondTileIndex, 0, firstTileModelObj[0]);
                var groupPath = group.getBindingContext().getPath();
                group.getModel().setProperty(groupPath, groupModelObj);
            }
        },

        moveTileToDifferentGroup: function (sourceGroup, destGroup, curTile, direction) {
            if (this.oModel.getProperty("/personalization")) {
                if (sourceGroup.getIsGroupLocked() || destGroup.getIsGroupLocked()) {
                    return;
                }
                var sourceGroupModelObj = sourceGroup.getBindingContext().getObject();
                var destGroupModelObj = destGroup.getBindingContext().getObject();
                var tileIndex = sourceGroupModelObj.tiles.indexOf(curTile.getBindingContext().getObject());
                //removing tile from source group & add tile to destination group
                if (direction === "left" || direction === "up" || direction === "down"){
                    destGroupModelObj.tiles.push(sourceGroupModelObj.tiles[tileIndex]);
                }
                if (direction === "right"){
                    destGroupModelObj.tiles.splice(0, 0, sourceGroupModelObj.tiles[tileIndex]);
                }
                sourceGroupModelObj.tiles.splice(tileIndex, 1);

                //update model
                var groupPath1 = destGroup.getBindingContext().getPath();
                destGroup.getModel().setProperty(groupPath1, destGroupModelObj);

                var groupPath2 = sourceGroup.getBindingContext().getPath();
                sourceGroup.getModel().setProperty(groupPath2, sourceGroupModelObj);

                var groupTiles = destGroup.getTiles();

                if (direction === "left" || direction === "up" || direction === "down") {
                    return groupTiles[groupTiles.length - 1];
                } else {
                    return groupTiles[0];
                }
            }
        },

        moveTile: function (direction, swapTiles) {
            var jqDashboard = jQuery(".sapUshellDashboardView"),
                dashboardView = sap.ui.getCore().byId(jqDashboard.attr("id"));
            dashboardView.markDisableGroups();
            setTimeout(function () {
                dashboardView.unmarkDisableGroups();
            }, 300);

            if (this.oModel.getProperty("/personalization")) {
                if (typeof swapTiles === "undefined") {
                    swapTiles = false;
                }
                var info = this.getGroupAndTilesInfo();
                //Tiles of locked groups cannot be reordered
                if (!info || info.group.getProperty('isGroupLocked')) {
                    return;
                }

                var bMoveTile = true,
                    bIsActionsModeActive,
                    nextTile = this.getNextTile(direction, info, bIsActionsModeActive, bMoveTile);

                if (!nextTile) {
                    return;
                } else {
                    var nextTileGroup = nextTile.getParent();
                }

                if (swapTiles) {
                    this.swapTwoTilesInGroup(info.group, info.curTile, nextTile);
                } else {
                    if (nextTileGroup === info.group) {
                        this.moveTileInGroup(info.group, info.curTile, nextTile);
                    } else {
                        nextTile = this.moveTileToDifferentGroup(info.group, nextTileGroup, info.curTile, direction);
                    }
                }
                if (sap.ushell.Layout && sap.ushell.Layout.isInited) {
                    sap.ushell.Layout.reRenderGroupLayout(info.group);
                }
                setTimeout(function () {//setTimeout because we have to wait until the asynchronous "moveTile" flow ends
                    if (nextTile) {
                        this.setTileFocus(jQuery(nextTile.getDomRef()));
                    }
                }.bind(this), 100);
            }
        },

        getNextUpDownTileInCatalog: function (direction, info) {
            var nearTilesArr, nextTile;
            var origTileLeftOffset = parseFloat(info.curTile.getDomRef().offsetLeft);
            if (direction == "down") {
                nearTilesArr = info.tiles.slice(info.curTileIndex + 1, info.curTileIndex + (info.sizeOfLine * 2));
            } else {
                var startIndex = info.curTileIndex - (info.sizeOfLine * 2);
                startIndex = (startIndex > 0) ? startIndex : 0;
                nearTilesArr = info.tiles.slice(startIndex, info.curTileIndex - 1).reverse();
            }
            for (var i = 0, length = nearTilesArr.length; i < length; i++) {
                var tileElement = nearTilesArr[i].getDomRef();
                var leftOffset = parseFloat(tileElement.offsetLeft);
                var width = parseFloat(tileElement.offsetWidth);
                var leftAndWidth = leftOffset + width;
                if (leftOffset <= origTileLeftOffset && leftAndWidth >= origTileLeftOffset) {
                    nextTile = nearTilesArr[i];
                    break;
                }
            }
            return nextTile;
        },

        getNextUpDownTileWithLayout: function (direction, info) {
            var nextTile, nextGroup;
            var tileSize = !info.curTile.isLink && info.curTile.getTall() ? 2 : 1;
            var nDirection = direction === "down" ? (tileSize) : -1;
            var isEmptyGroup = !info.tiles.length && !info.links.length;
            var bIsGroupLocked = info.group.getIsGroupLocked();
            var bIsPlusTile = jQuery(info.curTile.getDomRef()).hasClass('sapUshellPlusTile');
            var aLinks = info.group.getLinks();
            var layoutMatrix = sap.ushell.Layout.organizeGroup(info.curTile.isLink ? info.links : info.tiles, info.curTile.isLink);
            var tPos = sap.ushell.Layout.getTilePositionInMatrix(info.curTile, layoutMatrix);
            var bIsLastLineFull = this.isLastLineFull(layoutMatrix);
            var bIsActionsModeActive = this.oModel.getProperty('/tileActionModeActive');
            if (!tPos && !isEmptyGroup && !bIsPlusTile) { return; }
            //Handle the case in which the user has reached the last line of the currently navigated tile aggregation (whether it's a regular tile aggregation or link).
            if (!layoutMatrix[tPos.row + nDirection]) {
                //Handle the case in which the last line within the tileContainer has only Plus Tile
                if (bIsActionsModeActive  && !bIsGroupLocked && !bIsPlusTile && bIsLastLineFull && direction === "down") {
                    return info.group.oPlusTile;
                }
                //Handle the case in which the focus is on one of the tiles in the last row and the tile container contains links.
                if (!info.curTile.isLink && aLinks.length && direction === 'down') {
                    return aLinks[0];
                }
                //Handle the case in which the focus is on one of the links in the fist row and the direction is 'up'.
                if (info.curTile.isLink && info.tiles.length && direction === 'up') {
                    return info.tiles[0];
                }
                tPos = isEmptyGroup || bIsPlusTile ? {row : 0, col : 0} : tPos;
                nextGroup = this.getNextGroup(direction, info);
                if (!nextGroup)  {
                    return;
                }
                isEmptyGroup = !nextGroup.getTiles().length && !nextGroup.getLinks().length;
                if (!isEmptyGroup) {
                    var aFocussedTileAgg = this._getAggregationToFocusInNextGroup(nextGroup, direction);
                    var bNextTileLink = this._isNextTileLink(aFocussedTileAgg);


                    layoutMatrix = sap.ushell.Layout.organizeGroup(aFocussedTileAgg, bNextTileLink);
                    nDirection = 0;
                    tPos.row = direction === "down" ? 0 : layoutMatrix.length - 1;
                }
            }
            if (isEmptyGroup && bIsGroupLocked) {
                return undefined;
            }
            if (isEmptyGroup) {
                return nextGroup.oPlusTile;
            }

            if (typeof layoutMatrix[tPos.row + nDirection][tPos.col] === "object" && !isEmptyGroup) {
                nextTile = layoutMatrix[tPos.row + nDirection][tPos.col];
            } else {
                nextTile = this.getNextUpDownTile(layoutMatrix, tPos.row + nDirection, tPos.col ,direction);
            }

            return nextTile;
        },

        _isNextTileLink: function (aTileAggregation) {
            if (aTileAggregation && aTileAggregation.length) {
                var jqFirstTileInAgg = jQuery(aTileAggregation[0].getDomRef());
                return jqFirstTileInAgg.hasClass("sapUshellLinkTile");
            }
            return false;
        },

        _getAggregationToFocusInNextGroup: function (nextGroup, direction) {
            if (direction === "down" || direction === "right") {
                if (nextGroup.getTiles().length) {
                    return nextGroup.getShowPlaceholder() ? [].concat(nextGroup.getTiles(), nextGroup.oPlusTile) : nextGroup.getTiles();
                }
                if (nextGroup.getLinks().length) {
                    return nextGroup.getLinks();
                }
            } else if (direction === "up" || direction === "left") {
                if (nextGroup.getLinks().length) {
                    return nextGroup.getLinks();
                }
                if (nextGroup.getTiles().length) {
                    return nextGroup.getShowPlaceholder() ? [].concat(nextGroup.getTiles(), nextGroup.oPlusTile) : nextGroup.getTiles();
                }
            }
        },

        isLastLineFull: function (aLayoutMatrix) {
            var iMaxTilesInRow = this.getNumberOfTileInRow(),
                aActualLastRow = aLayoutMatrix[aLayoutMatrix.length - 1].filter(Boolean);

            return aActualLastRow.length === iMaxTilesInRow;
        },

        getNextUpDownTile: function(layoutMatrix, row, column, direction){
            var newRow = row,
                len = layoutMatrix.length,
                nextTile,
                nDirection = direction === "up" ? -1 : 1;

            while ((newRow >= 0 && newRow < len) && !nextTile){
                if (typeof layoutMatrix[newRow][column] !== "object") {
                    nextTile = layoutMatrix[newRow][column];
                }
                newRow = newRow + nDirection;
            }
            if (nextTile) { return; }

            newRow = row;
            while (( typeof layoutMatrix[newRow][column] !== "object") && column >= 0){
                column--;
            }

            return layoutMatrix[newRow][column];
        },

        getNextTile: function (direction, info, bIsActionsModeActive, bMoveTile) {
            var nextTile,
                currentTileRow,
                nearTilesArr,
                startIndex,
                tileElement,
                leftOffset,
                width,
                leftAndWidth,
                origTileLeftOffset,
                nRTL = sap.ui.getCore().getConfiguration().getRTL() ? -1 : 1,
                isEmptyGroup = !info.tiles.length,
                nDirection = direction === "right" ? 1 : -1;

            if (info.pageName === 'catalog') { // In catalog mode
                if (direction == 'right' || direction == 'left'){
                    nextTile = !isEmptyGroup ? info.tiles[info.curTileIndex + ( nRTL * nDirection ) ] : undefined;
                    return nextTile;
                }

                if (info.curTileIndex === '0' && direction === 'up') { return undefined; }

                currentTileRow = this.whichTileRow(info.curTileIndex, info);
                origTileLeftOffset = parseFloat(info.curTile.getDomRef().offsetLeft);
                if (direction == "down") {
                    nearTilesArr = info.tiles.slice(info.curTileIndex + 1, info.curTileIndex + (info.sizeOfLine * 2));
                } else {
                    startIndex = (startIndex > 0) ? startIndex : 0;
                    nearTilesArr = info.tiles.slice(startIndex, info.curTileIndex).reverse();
                }
                for (var i = 0, length = nearTilesArr.length; i < length; i++) {
                    tileElement = nearTilesArr[i].getDomRef();
                    leftOffset = parseFloat(tileElement.offsetLeft);
                    width = parseFloat(tileElement.offsetWidth);
                    leftAndWidth = leftOffset + width;

                    if (leftOffset <= origTileLeftOffset && leftAndWidth >= origTileLeftOffset) {
                        nextTile = nearTilesArr[i];

                        return nextTile;
                    }
                }

                if (this.nextRowIsShorter(direction, currentTileRow, info)) {
                    nextTile = this.getNextTileInShorterRow(direction, currentTileRow, info);
                    return nextTile;
                }
                // In dashboard mode
            } else {
                if (direction === "left" || direction === "right"){
                    //nDirection is a parameter that influence in which direction we move in array iRTL will change it
                    // to opposite direction if it's RTL
                    var nextTileIndex = info.curTileIndex + ( nRTL * nDirection );
                    var aFocussedTileAgg = info.curTile.isLink ? info.links : info.tiles;
                    // next tile is not the plus tile
                    if (aFocussedTileAgg[nextTileIndex] && !(bMoveTile && aFocussedTileAgg[nextTileIndex].getDomRef().className.indexOf("sapUshellPlusTile") > 0)) {
                        nextTile = aFocussedTileAgg.length ? aFocussedTileAgg[nextTileIndex] : undefined;
                    }

                    if (nextTile){
                        return nextTile;
                    }
                    if (direction === "right" && !info.curTile.isLink && info.links.length) {
                        return info.links[0];
                    }
                    if (direction === "left" && info.curTile.isLink && info.tiles.length) {
                        return info.group.getShowPlaceholder() ? info.group.oPlusTile :  info.tiles[info.tiles.length - 1];
                    }

                    // if next tile wasn't exist in the current group need to look on next one
                    var nextGroup = this.getNextGroup(direction, info);
                    if  (!nextGroup) {
                        return;
                    } else {
                        var nextGroupTiles = this._getAggregationToFocusInNextGroup(nextGroup, direction);
                        if (nextGroupTiles && nextGroupTiles.length){
                            var last = nextGroupTiles.length - 1;
                            if (direction === "right"){
                                nextTile = nextGroupTiles[nRTL === 1 ? 0 : last];
                            } else {
                                nextTile = nextGroupTiles[nRTL === 1 ? last : 0];
                            }
                        } else {
                            nextTile = nextGroup.oPlusTile;
                        }
                    }
                }

                if (direction === "down" || direction === "up") {
                    if (info.pageName === "catalog") {
                        nextTile = this.getNextUpDownTileInCatalog(direction, info);
                    } else if (sap.ushell.Layout && sap.ushell.Layout.isInited) {
                        nextTile = this.getNextUpDownTileWithLayout(direction, info, bIsActionsModeActive);
                    }
                }
            }
            return nextTile;
        },

        getNextTileInShorterRow:  function(direction, currentRow, info) {
            var lastTileInRowId = direction === 'down' ? this.getLastTileIdInRow(info, currentRow + 1) : this.getLastTileIdInRow(info, currentRow - 1);
            return info.tiles[lastTileInRowId];
        },

        getLastTileIdInRow: function(info, lineNumber) {
            var count = 0;
            for (var i = 0; i < info.rowsData.length; i++) {
                count += info.rowsData[i];
                if (i === lineNumber){ break; }
            }

            return count - 1;
        },

        nextRowIsShorter: function(direction, currentRow, info) {
            if (direction === 'down' && currentRow != info.rowsData.length - 1) {
                return info.rowsData[currentRow] > info.rowsData[currentRow + 1];
            }
            if (direction === 'up' && currentRow != 0) {
                return info.rowsData[currentRow] > info.rowsData[currentRow - 1];
            } else {
                return false;
            }
        },

        getNextGroup: function (direction, info) {
            var nextGroup,
                groups = info.group.getParent().getGroups(),
                isRTL = sap.ui.getCore().getConfiguration().getRTL(),
                curGroupIndex = groups.indexOf(info.group);

            if (direction === "right" || direction === "left"){
                if ( isRTL ){
                    direction = (direction === "right") ? "up" : "down";
                } else {
                    direction = (direction === "right") ? "down" : "up";
                }
            }

            if (direction === "down" || direction === "up" ) {
                var nDirection = direction === "up" ? -1 : 1;
                nextGroup = groups[curGroupIndex + nDirection];
                if (!nextGroup) { return; }

                while (!nextGroup.getVisible() && (curGroupIndex >= 0 && curGroupIndex < groups.length)){
                    curGroupIndex = curGroupIndex + nDirection;
                    nextGroup = groups[curGroupIndex];
                }
            }
            if (!nextGroup.getVisible()) { return; }
            return nextGroup;
        },

        getGroupAndTilesInfo: function (jqTileContainer, pageName) {
            if (!jqTileContainer) {
                jqTileContainer = this.getFocusOnTile(jQuery(":focus"));
            }
            if (!jqTileContainer.length) { return; }
            var curTile = sap.ui.getCore().byId(jqTileContainer.attr('id'));
            var group = curTile.getParent();
            var rowsData;
            var tiles;
            var links;
            curTile.isLink = jqTileContainer.hasClass('sapUshellLinkTile');
            if (pageName == "catalog") {
                rowsData = this.getCatalogLayoutData();
                tiles = [];
                var jqTiles = jQuery('#catalogTiles').find('.sapUshellTile:visible');
                for (var i = 0; i < jqTiles.length; i++) {
                    tiles.push(sap.ui.getCore().byId(jqTiles[i].id));
                }
            } else {
                tiles = group.getTiles();
                links = group.getLinks();
                if (group.getShowPlaceholder() && !curTile.isLink) {
                    tiles.push(group.oPlusTile);
                }
            }

            var sizeOfLine = this.getNumberOfTileInRow(pageName, curTile.isLink);
            return {
                pageName: pageName,
                curTile: curTile,
                curTileIndex: curTile.isLink ? links.indexOf(curTile) : tiles.indexOf(curTile),
                tiles: tiles,
                links: links,
                sizeOfLine: sizeOfLine,
                group: group,
                rowsData:rowsData
            };
        },

        getCatalogLayoutData: function() {
            var jqCatalogContiner = jQuery('#catalogTiles .sapUshellInner').children(':visible'),
                maxTilesInLine = this.getNumberOfTileInRow('catalog'),
                rowsIndex = [],
                countTiles = 0;

            for (var i = 1; i < jqCatalogContiner.length; i++) {

                if (jQuery(jqCatalogContiner[i]).hasClass("sapUshellTile")) {
                    countTiles++;
                }
                if (jQuery(jqCatalogContiner[i]).hasClass("sapUshellHeaderTile")) {
                    rowsIndex.push(countTiles);
                    countTiles = 0;
                }
                if (countTiles >= maxTilesInLine) {
                    rowsIndex.push(countTiles);
                    countTiles = 0;
                }
            }
            if (countTiles > 0) {
                rowsIndex.push(countTiles);
            }

            return rowsIndex;
        },

        whichTileRow: function(id, info) {
            var tilesSum = 0,
                i;

            for (i = 0; i < info.rowsData.length; i++) {
                tilesSum += info.rowsData[i];
                if (id < tilesSum) { return i; }
            }
        },

        goToSiblingElementInTileContainer: function (direction, jqFocused, pageName) {
            var jqTileContainer = jqFocused.closest('.sapUshellTileContainer'),
                jqTileContainerElement,
                jqFirstTileInTileContainer,
                jqTileContainerHeader;

            //If current focused item is the Before Content of a Tile Container.
            if (jqTileContainerElement = this.getFocusTileContainerBeforeContent(jqFocused)) {
                if (direction === 'up' || direction === "left") {
                    this._goToNextTileContainer(jqTileContainerElement, direction);
                } else {
                    jqTileContainerHeader = jqTileContainer.find('.sapUshellTileContainerHeader:first');
                    this.setTabIndexOnTileContainerHeader(jqTileContainerHeader);
                    jqTileContainerHeader.focus();
                }
                return;
            }
            // If current focused item is the Header of a Tile Container.
            if (jqTileContainerElement = this.getFocusTileContainerHeader(jqFocused)) {
                if (direction === 'up') {
                    this.setTabIndexOnTileContainerHeader(jqTileContainerHeader);
                    if (!this._goToTileContainerBeforeContent(jqTileContainer)) {
                        //If the Tile Container doesn't have a Before Content, go to the Tile Container above.
                        this._goToNextTileContainer(jqTileContainerElement, direction);
                    }
                } else if (direction === "down"){
                    jqFirstTileInTileContainer = jqTileContainer.find('.sapUshellTile:first');
                    //If this Tile Container doesn't have tiles at all (not even a Plus Tile), it means that the group is empty and locked.
                    //Thus the next arrow down navigation should be to the descending Tile Container.
                    if (jqFirstTileInTileContainer.length) {
                        this.setTileFocus(jqFirstTileInTileContainer);
                    } else {
                        this._goToNextTileContainer(jqTileContainerElement, direction);
                    }
                } else if (direction === "left") {
                    if (jqFocused.hasClass("sapUshellTileContainerHeader")) {
                        if (!this._goToTileContainerBeforeContent(jqTileContainer)) {
                            //If the Tile Container doesn't have a Before Content, go to the Tile Container above.
                            this._goToNextTileContainer(jqTileContainerElement, "left");
                        }
                    } else {
                        jqTileContainerHeader = jqFocused.closest(".sapUshellTileContainerHeader");
                        jqTileContainerHeader.focus();
                    }
                } else if (direction === "right") {
                    var editInputField = jqFocused.hasClass("sapMInputBaseInner");
                    if (!editInputField) {
                        jqFirstTileInTileContainer = jqTileContainer.find('.sapUshellTile:first');
                        //If this Tile Container doesn't have tiles at all (not even a Plus Tile), it means that the group is empty and locked.
                        //Thus the next arrow down navigation should be to the descending Tile Container.
                        if (jqFirstTileInTileContainer.length) {
                            this.setTileFocus(jqFirstTileInTileContainer);
                        } else {
                            this._goToNextTileContainer(jqTileContainerElement, "down");
                        }
                    }
                }
                return;
            }
            // If current focused item is a Tile.
            if (jqTileContainerElement = this.getFocusOnTile(jqFocused)) {
                this.goFromFocusedTile(direction, jqTileContainerElement, pageName, true);
                return;
            }
            // If current focused item is an After Content of a Tile Container.
            if (jqTileContainerElement = this.getFocusOnTileContainerAfterContent(jqFocused)) {
                if (direction === 'up' || direction === "left") {
                    this._goToFirstTileInTileContainer(jqTileContainerElement);
                } else {
                    this._goToNextTileContainer(jqTileContainerElement, direction);
                }
            }
        },

        _goToNextTileContainer: function (jqTileContainerElement, direction) {
            var jqCurrentTileContainer = jqTileContainerElement.closest('.sapUshellTileContainer'),
                aAllTileContainers = jQuery('.sapUshellTileContainer:visible'),
                nDirection = (direction === 'down') ? 1 : -1,
                jqNextTileContainer,
                jqNextTileContainerHeader;

            jqNextTileContainer = jQuery(aAllTileContainers[aAllTileContainers.index(jqCurrentTileContainer) + nDirection]);
            if (jqNextTileContainer) {
                jqNextTileContainerHeader = jqNextTileContainer.find('.sapUshellTileContainerHeader');
                if (direction === 'down') {
                    if (!this._goToTileContainerBeforeContent(jqNextTileContainer)) {
                        this.setTabIndexOnTileContainerHeader(jqNextTileContainerHeader);
                        this.setTileContainerSelectiveFocus(jqNextTileContainer);
                    }
                } else {
                    if (this._goToTileContainerAfterContent(jqNextTileContainer)) {
                        return;
                    }
                    if (direction === 'up') {
                        if (!this._goToFirstTileInTileContainer(jqNextTileContainer)) {
                            this.setTabIndexOnTileContainerHeader(jqNextTileContainerHeader);
                            jqNextTileContainerHeader.focus();
                        }
                    } else if (direction === 'left') {
                        if (!this._goToLastTileInTileContainer(jqNextTileContainer)) {
                            this.setTabIndexOnTileContainerHeader(jqNextTileContainerHeader);
                            jqNextTileContainerHeader.focus();
                        }
                    }
                }
            }
        },

        _goToLastTileInTileContainer: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqLastTileInTileContainer = jqTileContainer.find('.sapUshellTile:last'),
                jqLastLinkInTileContainer = jqTileContainer.find('.sapUshellLinkTile:last');

            if (!jqLastLinkInTileContainer.length && !jqLastTileInTileContainer.length) {
                return false;
            }
            this.setTileFocus(jqLastLinkInTileContainer.length ? jqLastLinkInTileContainer : jqLastTileInTileContainer);
            return true;
        },

        _goToFirstTileInTileContainer: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqFirstTileInTileContainer = jQuery(jqTileContainer.find('.sapUshellTile').get(0));

            if (jqFirstTileInTileContainer.length) {
                this.setTileFocus(jqFirstTileInTileContainer);
                return true;
            } else {
                return false;
            }
        },

        _goToTileContainerBeforeContent: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqTileContainerBeforeContent = jqTileContainer.find('.sapUshellTileContainerBeforeContent button:visible');

            if (jqTileContainerBeforeContent.length) {
                jqTileContainerBeforeContent.focus();
                return true;
            } else {
                return false;
            }
        },

        _goToTileContainerAfterContent: function (jqTileContainerElement) {
            var jqTileContainer = jqTileContainerElement.hasClass('sapUshellTileContainer') ? jqTileContainerElement : jqTileContainerElement.closest('.sapUshellTileContainer'),
                jqTileContainerAfterContent = jqTileContainer.find('.sapUshellTileContainerAfterContent button:visible');

            if (jqTileContainerAfterContent.length) {
                jqTileContainerAfterContent.focus();
                return true;
            } else {
                return false;
            }
        },

        goFromFocusedTile: function (direction, jqTile, pageName, bIsActionsModeActive) {
            var info = this.getGroupAndTilesInfo(jqTile, pageName),
                nextTile,
                jqCurrentTileContainer,
                jqNextTileContainer,
                jqCurrentTileContainerHeader,
                jqTileContainerAfterContent,
                bIsSameTileContainer;

            if (!info) { return; }
            nextTile = this.getNextTile(direction, info, bIsActionsModeActive);
            if (bIsActionsModeActive) {
                jqCurrentTileContainer =  jQuery(jqTile).closest('.sapUshellTileContainer');
                if (!nextTile) {
                    if (direction === 'down' || direction === 'right') {
                        jqTileContainerAfterContent = jQuery(jqCurrentTileContainer).find('.sapUshellTileContainerAfterContent button:visible');
                        jqTileContainerAfterContent.focus();
                        return;
                    }
                    if (direction === 'up') {
                        this.setTabIndexOnTileContainerHeader(jqCurrentTileContainer.find('.sapUshellTileContainerHeader'));
                        this.setTileContainerSelectiveFocus(jqCurrentTileContainer);
                        return;
                    }
                    if (direction === 'left') {
                        jqCurrentTileContainerHeader = jqCurrentTileContainer.find('.sapUshellTileContainerHeader');
                        jqCurrentTileContainerHeader.focus();
                    }
                } else {
                    jqNextTileContainer = jQuery(nextTile.getDomRef()).closest('.sapUshellTileContainer');
                    bIsSameTileContainer = jqCurrentTileContainer.length && jqNextTileContainer.length && (jqCurrentTileContainer.attr('id') === jqNextTileContainer.attr('id'));
                    if (bIsSameTileContainer){
                        this.setTileFocus(jQuery(nextTile.getDomRef()));
                    } else {
                        if (direction === 'down' || direction === 'right') {
                            if (!this._goToTileContainerAfterContent(jqCurrentTileContainer)) {
                                //If the Tile Container doesn't have a visible AfterContent, go to the next Tile Container.
                                this.setTabIndexOnTileContainerHeader(jqNextTileContainer.find('.sapUshellTileContainerHeader'));
                                this.setTileContainerSelectiveFocus(jqNextTileContainer);
                            }
                        } else if (direction === 'up' || 'left') {
                            jqCurrentTileContainerHeader = jqCurrentTileContainer.find('.sapUshellTileContainerHeader');
                            this.setTabIndexOnTileContainerHeader(jqCurrentTileContainerHeader);
                            jqCurrentTileContainerHeader.focus();
                        }
                    }
                }

            } else if (nextTile) {
                this.setTileFocus(jQuery(nextTile.getDomRef()));
            }
        },

        deleteTile: function (jqTile) {
            var tileId = jqTile.attr("id");
            if (!tileId) { return; }
            var oTile = sap.ui.getCore().byId(tileId);
            var info = this.getGroupAndTilesInfo(jqTile);
            var nextTile = this.getNextTile("right", info);
            if (!nextTile || (nextTile && nextTile.getParent() != info.group)) {
                nextTile = this.getNextTile("left", info);
            }
            if (!nextTile || (nextTile && nextTile.getParent() != info.group)) {
                nextTile = info.group.oPlusTile;
            }
            if (nextTile) {
                setTimeout(function (group, nextTileUuid) {
                    var tiles = group.getTiles();
                    if (!tiles.length) {
                        if (info.group.getProperty('defaultGroup')) {
                            var nextGroup = this.getNextGroup("right", info);
                            nextTile = nextGroup.getTiles()[0] || nextGroup.oPlusTile;
                            this.setTileFocus(jQuery(nextTile.getDomRef()));
                        }
                        this.setTileFocus(jQuery(group.oPlusTile.getDomRef()));
                        return;
                    }
                    var nextTile;
                    for (var i = 0; i < tiles.length; i++) {
                        if (tiles[i].getProperty('uuid') == nextTileUuid) {
                            nextTile = tiles[i];
                            break;
                        }
                    }
                    if (nextTile) {
                        this.setTileFocus(jQuery(nextTile.getDomRef()));
                    }
                }.bind(this, info.group, nextTile.getProperty('uuid')), 100);
            }
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("launchpad", "deleteTile", {
                tileId: oTile.getUuid()
            });
        },

        setTabIndexOnTileContainerHeader: function (jqTileContainerHeader) {
            jQuery(".sapUshellTileContainerHeader").attr("tabindex", -1);
            jQuery(".sapUshellTileContainerHeader .sapUshellContainerTitle").attr("tabindex", -1);
            jQuery(".sapUshellTileContainerHeader .sapUshellContainerHeaderActions button").attr("tabindex", -1);

            if (jqTileContainerHeader) {
                var jqTileConainerHeaderTitle = jqTileContainerHeader.find('.sapUshellContainerTitle:first'),
                    jqTileContainerHeaderActions = jqTileContainerHeader.find('.sapUshellContainerHeaderActions:first');

                jqTileContainerHeader.attr('tabindex', 0);
                jqTileConainerHeaderTitle.attr('tabindex', 0);
                jqTileContainerHeaderActions.find('button').attr('tabindex', 0);
            }
        },

        setTileContainerSelectiveFocus: function(jqTileContainer) {
            var jqTileContainerBeforeContent = jqTileContainer.find('.sapUshellTileContainerBeforeContent button'),
                jqTileContainerHeader = jqTileContainer.find('.sapUshellTileContainerHeader:first'),
                bBeforeContentDisplayed = jqTileContainerBeforeContent.length && jqTileContainerBeforeContent.is(":visible");

            if (bBeforeContentDisplayed) {
                jqTileContainerBeforeContent.focus();
            } else if (jqTileContainerHeader.length) {
                //Set tab-index on tileContainerHeader and its' children.
                this.setTabIndexOnTileContainerHeader(jqTileContainerHeader);
                jqTileContainerHeader.focus();
            }
        },

        setTileFocus: function(jqTile) {
            if (!jqTile.hasClass('sapUshellPlusTile')) {
                var currentPage = this.oModel.getProperty("/currentViewName"),
                    jqFocusables;

                jqFocusables = jqTile.find('[tabindex]');
                if (currentPage === "catalog") {
                    var handler = sap.ushell.components.flp.ComponentKeysHandler;
                    handler.setFocusOnCatalogTile(jqFocusables.eq(0));
                }
                if (!jqFocusables.length){
                    jqTile.attr("tabindex", "0");
                    jqFocusables = jqTile.find('[tabindex], a').andSelf().filter('[tabindex], a');
                }
                jqFocusables.filter('[tabindex!="-1"]');
                jQuery.each(this.aTileWrapperClasses, function (index, sTileWrapperClass) {
                    var jqTileWrapper = jqFocusables.eq(0).closest(sTileWrapperClass);
                    jqTile = jqTileWrapper.length ? jqTileWrapper : jqFocusables.eq(0);
                    return !(jqTileWrapper.length);
                });
            }

            jqTile.focus();
        },

        setFocusOnCatalogTile: function(jqTile){
            var oPrevFirsTile = jQuery(".sapUshellTile[tabindex=0]"),
                aAllTileFocusableElements,
                aVisibleTiles,
                jqParentTile;

            if (oPrevFirsTile.length) {
                //remove tabindex attribute to all tile's elements in TAB cycle if exists
                jQuery(".sapUshellTileContainerContent").find('[tabindex*=0]').attr("tabindex", -1);
                aAllTileFocusableElements = oPrevFirsTile.find('[tabindex], a').andSelf().filter('[tabindex], a');
                aAllTileFocusableElements.attr("tabindex", -1);
            }

            if (!jqTile){
                aVisibleTiles = jQuery(".sapUshellTile:visible");
                if (aVisibleTiles.length) {
                    jqParentTile = jQuery(aVisibleTiles[0]);
                    jqTile = jqParentTile.find('[tabindex], a').eq(0);
                } else {
                    return;
                }
            }

            //add tabindex attribute to all tile's elements in TAB cycle
            jqTile.closest(".sapUshellTile").attr("tabindex", 0);
            jqTile.attr("tabindex", 0);
            jqTile.closest(".sapUshellTile").find("button").attr("tabindex", 0);
        },

        moveScrollDashboard: function (jqTileSelected) {
            var containerId = jqTileSelected.closest(".sapUshellTileContainer")[0].id,
                iY = -1 * ( document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(containerId).getBoundingClientRect().top;
            jQuery('.sapUshellDashboardView').animate({scrollTop: iY}, 200, function () {
                this.setTileFocus(jqTileSelected);
            }.bind(this));
        },

        moveScrollCatalog: function (jqTileSelected) {
            var jqDashboardPageCont = jQuery("#catalogTilesPage-cont");
            var iTopSpacing = jQuery('#shell-hdr').height() + jQuery('.sapMPageHeader').height() + (parseInt(jQuery('.sapMPanelHdr').css('margin-top'), 10) * 2);
            var iY = jqTileSelected.offset().top + jqDashboardPageCont.scrollTop() - iTopSpacing;
            sap.ui.getCore().byId("catalogTilesPage").scrollTo(iY, 200);
        },

        goToNearbySidePanelGroup: function (direction, jqElement) {
            var selector = (direction == "up") ? "prev" : "next";
            var nextGroup = jqElement[selector]();
            // find the first group list item (in the respected order) which is visible (i.e. non empty)
            while (nextGroup.css('display') == "none") {
                nextGroup = nextGroup[selector]();
            }
            if (!nextGroup) { return; }
            nextGroup.focus();
        },

        deleteSidePanelGroup: function (jqGroup) {
            var core = sap.ui.getCore();
            var oGroup = core.byId(jqGroup.attr('id'));
            var bRemovable = oGroup.getRemovable();
            var oEventBus = core.getEventBus();
            oEventBus.publish("launchpad", bRemovable ? "deleteGroup" : "resetGroup", {
                groupId: oGroup.getGroupId()
            });
        },

        moveGroupFromDashboard: function(direction, jqGroup) {
            var jqCurrentTileContainer,
                aTileContainers = jQuery(".sapUshellDashboardGroupsContainerItem"),
                indexOfTileContainer,
                toIndex;

            jqCurrentTileContainer = jqGroup.closest(".sapUshellDashboardGroupsContainerItem");
            indexOfTileContainer = aTileContainers.index(jqCurrentTileContainer);
            toIndex = direction == "up" || direction == "left" ? indexOfTileContainer - 1 : indexOfTileContainer + 1;
            this.moveGroup(indexOfTileContainer, toIndex);
        },

        moveGroup: function(fromIndex, toIndex) {
            var aGroups = jQuery(".sapUshellDashboardGroupsContainerItem"),
                numOfDisabledDragAndDropGroups = jQuery(".sapUshellDisableDragAndDrop").length;
            if (toIndex < 0 || toIndex >= aGroups.length || toIndex < numOfDisabledDragAndDropGroups) { return; }
            var core = sap.ui.getCore();
            var oData = {fromIndex: fromIndex, toIndex: toIndex};
            var oBus = core.getEventBus();
            oBus.publish("launchpad", "moveGroup", oData);

            setTimeout(function () {
                var tileContainerHeader = jQuery(".sapUshellTileContainerHeader")[toIndex];
                this.setTabIndexOnTileContainerHeader(jQuery(tileContainerHeader));
                jQuery(tileContainerHeader).focus();
            }.bind(this), 100);
        },

        goToEdgeSidePanelGroup: function (selector) {
            var jqGroups = jQuery(".sapUshellGroupLI");
            jqGroups[selector]().focus();
        },

        getFocusGroupFromSidePanel: function (jqFocused) {
            var jqFocusedGroup = jqFocused.closest(".sapUshellGroupLI");
            return jqFocusedGroup.length ? jqFocusedGroup : false;
        },

        getFocusGroupFromDashboard: function (jqFocused) {
            var bIsFocusedOnHeaderTitle = jqFocused.closest('.sapUshellTileContainerHeader').length && jqFocused[0].tagName === 'H2';
            return bIsFocusedOnHeaderTitle ? jqFocused : false;
        },

        getFocusTileContainerBeforeContent: function (jqFocusedElement) {
            var jqTileContainerBeforeContent = jqFocusedElement.closest('.sapUshellTileContainerBeforeContent');
            return jqTileContainerBeforeContent.length ? jqTileContainerBeforeContent : false;
        },

        getFocusTileContainerHeader: function (jqFocusedElement) {
            var jqTileContainerHeader = jqFocusedElement.closest('.sapUshellTileContainerHeader');
            return jqTileContainerHeader.length ? jqTileContainerHeader : false;
        },

        getFocusOnTileContainerAfterContent: function (jqFocusedElement) {
            var jqTileContainerAfterContent = jqFocusedElement.closest('.sapUshellTileContainerAfterContent');
            return jqTileContainerAfterContent.length ? jqTileContainerAfterContent : false;
        },

        getFocusOnTile: function (jqFocused) {
            var jqFocusedTile;

            jQuery.each(this.aTileWrapperClasses, function (index, sTileWrapperClass) {
                var jqTileWrapper = jqFocused.closest(sTileWrapperClass);
                jqFocusedTile = jqTileWrapper.length ? jqTileWrapper : false;
                return !(jqFocusedTile);
            });

            return jqFocusedTile;
        },

        getFocusOnCatalogPopover: function (jqFocused) {
            var jqFocusedPopover = jqFocused.closest(".sapMPopover");
            return jqFocusedPopover.length ? jqFocusedPopover : false;
        },

        addGroup: function (jqButton) {
            var core = sap.ui.getCore();
            var oButton = core.byId(jqButton.attr('id'));
            oButton.firePress();
        },

        renameGroup: function () {
            var jqFocused = jQuery(":focus");
            var jqTileContainerTitle = this.getFocusGroupFromDashboard(jqFocused);

            if (jqTileContainerTitle) {
                jqTileContainerTitle.click();
            }
        },

        upDownButtonsHandler: function (direction, pageName) {
            var jqFocused = jQuery(":focus"),
                jqElement = this.getFocusGroupFromSidePanel(jqFocused);

            this.goFromFocusedTile(direction, jqElement, pageName);
        },
        arrowsButtonsHandler: function (direction, pageName) {
            var jqElement,
                jqFocused = jQuery(":focus"),
                bIsActionsModeActive = this.oModel.getProperty('/tileActionModeActive');

            if ((jqElement = this.getFocusGroupFromSidePanel(jqFocused)) && (direction === "up" || direction === "down")) {
                    this.goToNearbySidePanelGroup(direction, jqElement);
            } else {
                if (bIsActionsModeActive) {
                    if (!jqFocused.hasClass('sapMInputBaseInner')) {
                        this.goToSiblingElementInTileContainer(direction, jqFocused, pageName);
                    }
                } else {
                    this.goFromFocusedTile(direction, jqElement, pageName);
                }
            }
        },

        homeEndButtonsHandler: function (selector, e) {
            var jqFocused = jQuery(":focus"),
                jqElement = this.getFocusGroupFromSidePanel(jqFocused);
            if (jqFocused.closest("#dashboardGroups").length || jqFocused.closest("#catalogTiles").length) {
                e.preventDefault();
                this.goToEdgeTile(selector);
                return;
            }
            if (jqElement && jqElement[0].id == jqFocused[0].id) {
                e.preventDefault();
                this.goToEdgeSidePanelGroup(selector);
                return;
            }
        },

        deleteButtonHandler: function () {
            if (this.oModel.getProperty("/personalization") && this.oModel.getProperty("/tileActionModeActive")) {
                var jqElement,
                    jqFocused = jQuery(":focus");
                if (jqElement = this.getFocusOnTile(jqFocused)) {
                    if (!jqElement.hasClass('sapUshellLockedTile') && !jqElement.hasClass('sapUshellPlusTile')) {
                        this.deleteTile(jqElement);
                    }
                    return;
                }
                if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {
                    //Don't delete the group in case delete was pressed during renaming & in case this is a default group.
                    if (!jqElement.hasClass('sapUshellEditing') && !jqElement.hasClass("sapUshellDefaultGroupItem") && !jqElement.hasClass("sapUshellTileContainerLocked")) {
                        this.deleteSidePanelGroup(jqElement);
                        return;
                    }
                }
            }
        },

        ctrlPlusArrowKeyButtonsHandler: function (selector) {
            var jqElement,
                jqFocused = jQuery(":focus");
            if (jqElement = this.getFocusOnTile(jqFocused)) {
                this.moveTile(selector, false, jqElement);
                return;
            }
            if (jqElement = this.getFocusTileContainerHeader(jqFocused)) {
                // first we check if we should prevent the move of the group - obtain the wrapping container (content div)
                var jqFocusGroupContentElement = jqElement.closest('.sapUshellTileContainerContent');
                // if the group is the Home group OR Locked group - do not initiate move
                if (jqFocusGroupContentElement.hasClass('sapUshellTileContainerDefault') || jqFocusGroupContentElement.hasClass('sapUshellTileContainerLocked')) {
                    return;
                } else {
                    this.moveGroupFromDashboard(selector, jqElement);
                }
            }
        },

        spaceButtonHandler: function (e) {
            var jqElement,
                jqFocused = jQuery(":focus");
            if (jqElement = this.getFocusGroupFromSidePanel(jqFocused)) {
                jqElement.click();
                return false;
            }
        },

        goToFirstCatalogTile: function () {
            var handler = sap.ushell.components.flp.ComponentKeysHandler;
            var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
            handler.setTileFocus(firstTile);
        },

        goToFirstCatalogHeaderItem: function () {
            var nextElement = jQuery("#catalogTilesPage header button")[0];
            nextElement.focus();
        },

        handleFocusOnMe: function(keyup, bFocusPassedFirstTime) {
            var handler = sap.ushell.components.flp.ComponentKeysHandler;

            if (handler.oModel.getProperty("/currentViewName") === "home") {
                // we got the focus from the shell
                if (bFocusPassedFirstTime) {
                    if (keyup.shiftKey) {
                        handler.goToTileContainer(keyup);
                    } else {
                        //sidePanelFirstGroup
                        var jqElement = jQuery(".sapUshellGroupLI:first:visible");
                        if (!jqElement.length) {
                            handler.goToTileContainer(keyup);
                        } else {
                            jqElement.focus();
                        }
                    }
                } else {
                    handler.mainKeydownHandler(keyup);
                    handler.dashboardKeydownHandler(keyup);
                }
            } else {
                // we got the focus from the shell
                if (bFocusPassedFirstTime) {
                    if (keyup.shiftKey) {
                        handler.goToFirstCatalogTile();
                    } else {
                        handler.goToFirstCatalogHeaderItem();
                    }
                } else {
                    handler.mainKeydownHandler(keyup);
                    handler.catalogKeydownHandler(keyup);
                }
            }
        },

        groupHeaderNavigation: function() {
            var jqFocusItem = jQuery(":focus"),
                jqElement;

            if (jqFocusItem.hasClass("sapUshellTileContainerHeader")) {
                jqElement = jqFocusItem.find(".sapUshellContainerTitle");
                jqElement.focus();
            } else if (jqElement = jqFocusItem.closest(".sapUshellTileContainerHeader")){
                jqElement.focus();
            }
        },

        handleShortcuts: function (oEvent) {
            var handler = sap.ushell.components.flp.ComponentKeysHandler;

            if (oEvent.altKey) {
                switch (String.fromCharCode(oEvent.keyCode)) {
                    case 'C':
                        if (handler.oModel.getProperty("/personalization")) {
                            handler.handleCatalogKey();
                        }
                        break;
                    case 'H':
                        handler.handleHomepageKey();
                        break;
                }
            }
        },

        mainKeydownHandler: function (e) {
            e = e || window.event;

            switch (e.keyCode) {
                case this.keyCodes.SPACE:
                    this.spaceButtonHandler(e);
                    break;
                case this.keyCodes.HOME: //Home button
                    this.homeEndButtonsHandler("first", e);
                    break;
                case this.keyCodes.END: //End button
                    this.homeEndButtonsHandler("last", e);
                    break;
            }
        },

        catalogKeydownHandler: function (keyup) {
            var handler = sap.ushell.components.flp.ComponentKeysHandler;
            var pageName = "catalog";
            switch (keyup.keyCode) {
                case handler.keyCodes.ARROW_UP: //Up
                    handler.upDownButtonsHandler("up", pageName);
                    break;
                case handler.keyCodes.ARROW_DOWN: //Down
                    handler.upDownButtonsHandler("down", pageName);
                    break;
                case handler.keyCodes.ARROW_RIGHT: // Right ->
                    handler.goFromFocusedTile("right","",pageName);
                    break;
                case handler.keyCodes.ARROW_LEFT: // Left <-
                    handler.goFromFocusedTile("left","",pageName);
                    break;
                case handler.keyCodes.PAGE_UP: //Page Up button
                    handler.goToFirstTileOfSiblingGroupInCatalog('prev', keyup);
                    break;
                case handler.keyCodes.PAGE_DOWN: //Page Down
                    handler.goToFirstTileOfSiblingGroupInCatalog('next', keyup);
                    break;
            }
        },

        dashboardKeydownHandler: function (keyup) {
            var handler = sap.ushell.components.flp.ComponentKeysHandler;
            switch (keyup.keyCode) {
                case handler.keyCodes.F2:
                    handler.renameGroup();
                    break;
                case handler.keyCodes.F7:
                    handler.groupHeaderNavigation();
                    break;
                case handler.keyCodes.DELETE: // Delete
                    handler.deleteButtonHandler();
                    break;
                case handler.keyCodes.ARROW_UP: //Up
                    if (keyup.ctrlKey === true) {
                        handler.ctrlPlusArrowKeyButtonsHandler("up");
                    } else {
                        handler.arrowsButtonsHandler("up");
                    }
                    break;
                case handler.keyCodes.ARROW_DOWN: //Down
                    if (keyup.ctrlKey === true) {
                        handler.ctrlPlusArrowKeyButtonsHandler("down");
                    } else {
                        handler.arrowsButtonsHandler("down");
                    }
                    break;
                case handler.keyCodes.ARROW_RIGHT: // Right ->
                    if (keyup.ctrlKey === true) {
                        handler.ctrlPlusArrowKeyButtonsHandler("right");
                    } else {
                        handler.arrowsButtonsHandler('right');
                    }
                    break;
                case handler.keyCodes.ARROW_LEFT: // Left <-
                    if (keyup.ctrlKey === true) {
                        handler.ctrlPlusArrowKeyButtonsHandler("left");
                    } else {
                        handler.arrowsButtonsHandler('left');
                    }
                    break;
                case handler.keyCodes.PAGE_UP: //Page Up button //TODO : check what happen when the tile is  empty
                    handler.goToFirstTileOfSiblingGroup('prev', keyup);
                    break;
                case handler.keyCodes.PAGE_DOWN: //Page Down
                    handler.goToFirstTileOfSiblingGroup('next', keyup);
                    break;
            }

            return true;
        },

        init: function (oModel, oRouter) {
            this.oModel = oModel;
            this.oRouter = oRouter;
        }
    };

    sap.ushell.components.flp.ComponentKeysHandler = new componentKeysHandler();
}());
},
	"sap/ushell/components/flp/CustomRouter.js":function(){(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.components.flp.CustomRouter");

    sap.ui.core.routing.Router.extend("sap.ushell.components.flp.CustomRouter", {

        constructor : function() {
            sap.ui.core.routing.Router.apply(this, arguments);
            //this._oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);
            this.attachRouteMatched(this._onHandleRouteMatched, this);
            //this.attachRoutePatternMatched(this._handleRoutePatternMatched, this);
        },

        navTo : function() {
            if (!this._bIsInitialized) {
                this.initialize();
            }
            sap.ui.core.routing.Router.prototype.navTo.apply(this, arguments);
        },

        destroy : function() {
            sap.ui.core.routing.Router.prototype.destroy.apply(this, arguments);
        },
        _onHandleRouteMatched : function (oEvent) {
            var mParameters = oEvent.getParameters(),
                oTargetControl = sap.ui.getCore().byId(mParameters.config.controlId);
            var result = this.getTarget(mParameters.config.target).display();
            oTargetControl.to(result.oTargetParent);
        }
    });
})();
},
	"sap/ushell/components/flp/FLPAnalytics.js":function(){
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.components.flp.FLPAnalytics");

    /**
     * Manage UsageAnalytics event logging as a result of FLP user flows
     */

    // Launchpad action events that trigger logging
    var aObservedLaunchpadActions = ["appOpened", "deleteTile", "createGroup", "enterEditMode", "catalogTileClick", "dashboardTileClick", "dashboardTileLinkClick"],
        oEventBus = sap.ui.getCore().getEventBus(),
        that = this,
        oLaunchedApplications = {};

    /**
     * Updates oLaunchedApplications with the title and opening time of the given application  
     */
    function saveOpenAppicationData(applicationId) {
        var oMetadataOfTarget = sap.ushell.services.AppConfiguration.getMetadata();
        oLaunchedApplications[applicationId] = {};
        oLaunchedApplications[applicationId].startTime = new Date();
        oLaunchedApplications[applicationId].title = oMetadataOfTarget.title;
    }

    /**
     * Logs a "Time in App" event according to the given application ID
     * 
     * Calculates the time according to the current (closing) time 
     *  and the opening time that is kept on oLaunchedApplications[applicationId]  
     */
    function logTimeInAppEvent(applicationId) {
        var appDuration = 0;

        try {
            appDuration = (new Date() - oLaunchedApplications[applicationId].startTime) / 1000;
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Time in Application (sec)", appDuration, [oLaunchedApplications[applicationId].title]);
        } catch (e) {
            jQuery.sap.log.warning("Duration in application " + applicationId + " could not be calculated", null, "sap.ushell.components.flp.FLPAnalytics");
        }
    }

    /**
     * Handler for published usageAnalytics events.  
     */
    function handleAction(sChannelId, sEventId, oData) {
        var sApplicationId = window.location.hash.substr(1),
            sApplicationTitle;

        window.swa.custom1 = {ref: sApplicationId};
        switch (sEventId) {
        case 'appOpened':
            // In order to be notified when applications are launched - we rely on navContainer's attachAfterNavigate event.
            // but for the first navigation (e.g. login or direct URL in a new tab) we still need the "appOpened" event.
            saveOpenAppicationData(sApplicationId);
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Opened", "First Load", [oLaunchedApplications[sApplicationId].title]);
            oEventBus.unsubscribe("launchpad", "appOpened", handleAction);
            break;
        case 'bookmarkTileAdded':
            sApplicationTitle = window.document.title;
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Personalization", "Save as Tile", [sApplicationTitle, oData.group.title, oData.group.id, oData.tile.title]);
            break;
        case 'enterEditMode':
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Personalization", "Enter Action Mode", [oData.source]);
            break;
        case 'catalogTileClick':
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point", "Catalog", []);
            break;
        case 'dashboardTileClick':
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point", "Homepage", []);
            break;
        case 'dashboardTileLinkClick':
            window.swa.custom1 = {ref: oData.targetHash.substr(1)};
            sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Launch point", "Tile Group Link", []);
            break;
        default:
            break;
        }
    }

    /**
     * Handler of navContainer's AfterNavigate event (i.e. navigation between the container's pages)
     *
     * - Logs "TimeInAppEvent" for the source application (i.e. from which the navigation occurred)
     * - Updated data about the opened application
     * - Logs "Application Opened" event 
     */
    function handleAfterNavigate(oEvent) {
        var sFromApplicationId,
            sToApplicationId,
            oTargetApplication;

        // For the source application (the one from which the user navigates) -
        // Calculate the time duration and log a "Time in Application" event
        sFromApplicationId =  oEvent.getParameter("from").getId().replace("application-", "").replace("applicationShellPage-", "");
        window.swa.custom1 = {ref: sFromApplicationId};
        logTimeInAppEvent(sFromApplicationId);

        // For the target application (the one to which the user navigates) -
        // Keep the opening time and title, and log an "Application Opened" event
        oTargetApplication = oEvent.getParameter("to");
        sToApplicationId =  oTargetApplication.getId().replace("application-", "").replace("applicationShellPage-", "");
        saveOpenAppicationData(sToApplicationId);
        window.swa.custom1 = {ref: sToApplicationId};
        sap.ushell.Container.getService("UsageAnalytics").logCustomEvent("FLP: Application Opened", "Through navContainer", [oLaunchedApplications[sToApplicationId].title]);
    }

    /**
     * Handler of browser tab close event
     * 
     * Logs a "Time in App" event  
     */
    jQuery(window).unload(function (event) {
        var currentApp = window.location.hash.substr(1);
        logTimeInAppEvent(currentApp);
    });

    try {
        sap.ui.getCore().byId('navContainer').attachAfterNavigate(handleAfterNavigate, that);
    } catch (e) {
        jQuery.sap.log.warning("Failure when subscribing to navContainer 'AfterNavigate' event", null, "sap.ushell.components.flp.FLPAnalytics");
    }
    oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", handleAction, that);
    aObservedLaunchpadActions.forEach(function (item, i, arr) {
        oEventBus.subscribe("launchpad", item, handleAction, that);
    });
})();
},
	"sap/ushell/components/flp/launchpad/DashboardManager.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, $, setTimeout, window */
    /*jslint plusplus: true, nomen: true, bitwise: true */

    jQuery.sap.declare("sap.ushell.components.flp.launchpad.DashboardManager");
    jQuery.sap.require("sap.ushell.services.Message");

    /**
     * Return translated text. Private function in this module.
     * @param sMsgId
     *      Id of the text that is to be translated.
     * @param aParams
     *      Array of parameters to be included in the resulted string instead of place holders.
     */
    var getLocalizedText = function (sMsgId, aParams) {
            return aParams ? sap.ushell.resources.i18n.getText(sMsgId, aParams) : sap.ushell.resources.i18n.getText(sMsgId);
        },

        /**
         * This function returns the number of tiles which are supported on the current device in the current catalog.
         * The catalog is identified by its title, so if several catalogs exists with the same title -
         * the returned value is the number of the intent-supported-tiles in all of them.
         * @param oCatalogModel
         * @returns {Number}
         * @private
         */
        getNumIntentSupportedTiles = function (oCatalogModel) {
            var aCatalogTiles = this.oModel.getProperty('/catalogTiles'),
                aCurrentCatalogSupportedTiles = aCatalogTiles.filter(function (oTile) {
                    return oTile.catalog === oCatalogModel.title && oTile.isTileIntentSupported === true;
                });

            return aCurrentCatalogSupportedTiles.length;
        };

    sap.ui.base.EventProvider.extend("sap.ushell.components.flp.launchpad.DashboardManager", {
        metadata: {
            publicMethods: ["getModel", "getDashboardView", "getGroupListView", "isGroupListViewCreated", "loadPersonalizedGroups", "attachEvent", "detachEvent", "attachEventOnce", "createTile", "deleteCatalogTileFromGroup", "resetGroupsOnFailure", "createGroupAndSaveTile"]
        },
        analyticsConstants: {
            PERSONALIZATION: "FLP: Personalization",
            RENAME_GROUP: "FLP: Rename Group",
            MOVE_GROUP: "FLP: Move Group",
            DELETE_GROUP: "FLP: Delete Group",
            RESET_GROUP: "FLP: Reset Group",
            DELETE_TILE: "FLP: Delete Tile",
            ADD_TILE: "FLP: Add Tile",
            MOVE_TILE: "FLP: Move Tile"
        },
        constructor: function (sId, mSettings) {
            //make this class only available once
            if (sap.ushell.components.flp.launchpad.getDashboardManager && sap.ushell.components.flp.launchpad.getDashboardManager()) {
                return sap.ushell.components.flp.launchpad.getDashboardManager();
            }
            sap.ushell.components.flp.launchpad.getDashboardManager = jQuery.sap.getter(this.getInterface());
            this.oPageBuilderService = sap.ushell.Container.getService("LaunchPage");
            this.oModel = mSettings.model;
            this.oConfig = mSettings.config;
            this.oRouter = mSettings.router;
            this.oSortableDeferred = $.Deferred();
            this.oSortableDeferred.resolve();
            this.aRequestQueue = [];
            this.bRequestRunning = false;
            this.tagsPool = [];
            this.registerEvents();
            this.oTileCatalogToGroupsMap = {};
            this.tileViewUpdateQueue = [];
            this.tileViewUpdateTimeoutID = 0;
            this.oPopover = null;
            this.tileUuid = null;
            this.oGroupNotLockedFilter = new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.EQ, false);
            //get 'home' view from the router
            if (this.oRouter) {
                var oTarget = this.oRouter.getTarget('home');
                oTarget.attachDisplay(function (oEvent) {
                    this.oDashboardView = oEvent.getParameter('view');
                }.bind(this));
            }
        },

        createMoveActionDialog: function () {
            var oGroupFilter = this.oGroupNotLockedFilter;

            this.moveDialog = new sap.m.SelectDialog("moveDialog", {
                title: sap.ushell.resources.i18n.getText('moveTileDialog_title'),
                rememberSelections: false,
                search: function (oEvent) {
                    var sValue = oEvent.getParameter("value"),
                        oFilter = new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sValue),
                        oBinding = oEvent.getSource().getBinding("items");
                    oBinding.filter([oFilter, oGroupFilter]);
                },
                contentWidth: '400px',
                confirm: function (oEvent) {
                    var aContexts = oEvent.getParameter("selectedContexts"),
                        oEventBus = sap.ui.getCore().getEventBus();
                    if (aContexts.length) {
                        oEventBus.publish("launchpad", "moveTile", {
                            sTileId: this.tileUuid,
                            toGroupId: aContexts[0].getObject().groupId,
                            toIndex: aContexts[0].getObject().tiles.length,
                            source: this.moveDialog.getId()
                        });

                        oEventBus.publish("launchpad", "scrollToGroup", {
                            groupId: aContexts[0].getObject().groupId,
                            groupChanged: false,
                            focus: false
                        });

                    }
                }.bind(this),
                items: {
                    path: "/groups",
                    filters: [oGroupFilter],
                    template: new sap.m.StandardListItem({
                        title: "{title}"
                    })
                }
            });

            this.moveDialog.setModel(this.oModel);
        },

        registerEvents: function () {
            var oEventBus = sap.ui.getCore().getEventBus(),
                that = this;
            oEventBus.subscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", this._addBookmarkToModel, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "catalogTileAdded", this._refreshGroupInModel, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileDeleted", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.subscribe("launchpad", "createGroup", this._createGroup, this);
            oEventBus.subscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.subscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.subscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.subscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.subscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.subscribe("launchpad", "moveTile", this._moveTile, this);
            oEventBus.subscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.subscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.subscribe("showCatalog", this.loadAllCatalogs, this);

            //add Remove action for all tiles
            this.oPageBuilderService.registerTileActionsProvider(function (oTile) {

//  This check had been removed, as in the ActionMode._openActionsMenu we have a check if the related group is a locked group
//  then we do not show any action. This is the current bahviour as the Action of Tile-Settings is added by the tiles themselves
//  (Dynamin/StaticTile.controller.doInit) and they are not aware of the group being locked, so we do the check in one central place.
//
//                var oModelTile = that.getModelTileById(that.oPageBuilderService.getTileId(oTile));
//                if (oModelTile.isLocked) {
//                    return;
//                }

                jQuery.sap.require("sap.m.MessageBox");
                return [{
                    text: sap.ushell.resources.i18n.getText('moveTileDialog_action'),
                    press: function (oEvent) {
                        that.tileUuid = that.getModelTileById(that.oPageBuilderService.getTileId(oTile)).uuid;
                        if (!that.moveDialog) {
                            that.createMoveActionDialog();
                        }
                        that.moveDialog.getBinding("items").filter([that.oGroupNotLockedFilter]);
                        that.moveDialog.open();
                    }
                }];
            });
        },

        destroy: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.unsubscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.unsubscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.unsubscribe("launchpad", "createGroup", this._createGroup, this);
            oEventBus.unsubscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.unsubscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.unsubscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.unsubscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.unsubscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.unsubscribe("launchpad", "moveTile", this._moveTile, this);
            oEventBus.unsubscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.unsubscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.unsubscribe("showCatalog", this.loadAllCatalogs, this);

            sap.ushell.components.flp.launchpad.getDashboardManager = undefined;
        },


        _refreshTiles: function () {
            var that = this,
                aGroups = this.oModel.getProperty("/groups");

            jQuery.each(aGroups, function (nIndex, oGroup) {
                jQuery.each(oGroup.tiles, function (nIndex, oTile) {
                    that.oPageBuilderService.refreshTile(oTile.object);
                });
            });
        },

        _sortableStart: function () {
            this.oSortableDeferred = $.Deferred();
        },

        _createBookmark: function (sChannelId, sEventId, oData) {
            var tileGroup = oData.group ? oData.group.object : "";

            delete oData.group;

            this._addRequest($.proxy(function () {
                var oResultPromise = sap.ushell.Container.getService("Bookmark").addBookmark(oData, tileGroup),
                    oResourceBundle = sap.ushell.resources.i18n;
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
                oResultPromise.done(function () {
                    //the tile is added to our model in "_addBookmarkToModel" here we just show the
                    //success toast.
                    if (sap.ushell.Container) {
                        sap.ushell.Container.getService('Message').info(oResourceBundle.getText('tile_created_msg'));
                    }
                });
                oResultPromise.fail(function (sMsg) {
                    jQuery.sap.log.error(
                        "Failed to add bookmark",
                        sMsg,
                        "sap.ushell.ui.footerbar.AddBookmarkButton"
                    );
                    if (sap.ushell.Container) {
                        sap.ushell.Container.getService('Message').error(oResourceBundle.getText('fail_to_add_tile_msg'));
                    }
                });
            }, this));
        },

        //this function will be called also if an application used the bookmark service directly
        //to add a bookmark. the bookmark service publishes an event so that we will be able to
        //update the model. this method doesn't display a success toast since the application
        //should show success or failure messages
        _addBookmarkToModel: function (sChannelId, sEventId, oData) {
            var oTile = oData.tile,
                oGroup = oData.group,
                isGroupLocked,
                srvc,
                sTileType,
                newTile,
                indexOfGroup,
                targetGroup;


            if (!oData || !oTile) {
                this.loadPersonalizedGroups();
                return;
            }

            //if the service was called directly, the
            isGroupLocked = oGroup ? oGroup.isGroupLocked : false; //oData.group is our model group
            //The create bookmark popup should not contain the locked groups anyway,
            //so this call not suppose to happen for a target locked group (we may as well always send false)
            srvc = this.oPageBuilderService;
            sTileType = srvc.getTileType(oTile);
            newTile = this._getTileModel(oTile, isGroupLocked, sTileType);
            indexOfGroup = oGroup ? this._getIndexOfGroupByObject(oGroup) : 0;
            targetGroup = this.oModel.getProperty("/groups/" + indexOfGroup);

            targetGroup.tiles.push(newTile);

            this.oModel.setProperty("/groups/" + indexOfGroup, targetGroup);
        },

        _refreshGroupInModel: function (sChannelId, sEventId, sGroupId) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                sErrorMsg = 'Failed to refresh group with id:' + sGroupId + ' in the model',
                that = this;

            oLaunchPageService.getGroups()
                .fail(jQuery.sap.log.error(sErrorMsg, null, "sap.ushell.components.flp.launchpad.DashboardManager"))
                .done(function (aGroups) {
                    aGroups.some(function (oGroup) {
                        if (oLaunchPageService.getGroupId(oGroup) === sGroupId) {
                            oLaunchPageService.getDefaultGroup().done(function (oDefaultGroup) {
                                var bIsDefaultGroup = sGroupId === oDefaultGroup.getId() ? true : false,
                                    oGroupModel = that._getGroupModel(oGroup, bIsDefaultGroup),
                                    indexOfGroup = that._getIndexOfGroupByObject(oGroupModel.object);

                                that.oModel.setProperty("/groups/" + indexOfGroup, oGroupModel);
                            });
                            return true;
                        }
                    });
                });
        },

        _sortableStop: function () {
            this.oSortableDeferred.resolve();
        },

        _handleAfterSortable: function (fFunc) {
            return $.proxy(function () {
                var outerArgs = Array.prototype.slice.call(arguments);
                this.oSortableDeferred.done(function () {
                    fFunc.apply(null, outerArgs);
                });
            }, this);
        },

        _addRequest: function (fRequest) {
            this.aRequestQueue.push(fRequest);
            if (!this.bRequestRunning) {
                this.bRequestRunning = true;
                this.aRequestQueue.shift()();
            }
        },

        _checkRequestQueue: function () {
            if (this.aRequestQueue.length === 0) {
                this.bRequestRunning = false;
            } else {
                this.aRequestQueue.shift()();
            }
        },

        _requestFailed: function () {
            this.aRequestQueue = [];
            this.bRequestRunning = false;
        },

        /*
         * oData should have the following parameters:
         * title
         */
        _createGroup: function (sChannelId, sEventId, oData) {
            var oGroup = this._getGroupModel(null),
                aGroups = this.oModel.getProperty("/groups"),
                oModel = this.oModel;

            oModel.setProperty("/groupList-skipScrollToGroup", true);
            window.setTimeout(function () {
                oModel.setProperty("/groups/" + aGroups.length, oGroup);
            }, 500);
            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            // We don't call the backend here as the user hasn't had the opportunity to give the group a name yet.
            // The group will be persisted after it got a name, in the changeGroupTitle handler.
            // TODO: This depends on the behaviour of the GroupList, which enters edit-mode immediately after creating a group.
            //       It would be better if this event would be fired after the group has a name.
        },

        /*
         * oData should have the following parameters:
         * title
         * location
         */
        _createGroupAt: function (sChannelId, sEventId, oData) {
            var newGroupIndex = parseInt(oData.location, 10),
                aGroups = this.oModel.getProperty("/groups"),
                oGroup = this._getGroupModel(null, false, newGroupIndex === aGroups.length),
                oModel = this.oModel,
                i;

            oGroup.index = newGroupIndex;
            aGroups.splice(newGroupIndex, 0, oGroup);
            for (i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }

            //set new groups index
            for (i = newGroupIndex + 1; i < aGroups.length; i++) {
                aGroups[i].index++;
            }
            oModel.setProperty("/groups", aGroups);
        },

        _getIndexOfGroup: function (sGroupId) {
            var nGroupIndex = null,
                aGroups = this.oModel.getProperty("/groups");
            jQuery.each(aGroups, function (nIndex, oGroup) {
                if (oGroup.groupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
            });
            return nGroupIndex;
        },

        _getIndexOfGroupByObject: function (oGroup) {
            var nGroupIndex = null,
                aGroups = this.oModel.getProperty("/groups"),
                sGroupId = this.oPageBuilderService.getGroupId(oGroup);
            aGroups.forEach(function (oModelGroup, nIndex) {
                var sCurrentGroupId = this.oPageBuilderService.getGroupId(oModelGroup.object);
                if (sCurrentGroupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
            }.bind(this));
            return nGroupIndex;
        },

        _getPathOfGroup: function (sGroupId) {
            return "/groups/" + this._getIndexOfGroup(sGroupId);
        },

        _getPathOfTile: function (sTileId) {
            var aGroups = this.oModel.getProperty("/groups"),
                nResGroupIndex = null,
                nResTileIndex = null;

            jQuery.each(aGroups, function (nGroupIndex, oGroup) {
                jQuery.each(oGroup.tiles, function (nTileIndex, oTile) {
                    if (oTile.uuid === sTileId) {
                        nResGroupIndex = nGroupIndex;
                        nResTileIndex = nTileIndex;
                        return false;
                    }
                });

                if (nResGroupIndex !== null) {
                    return false;
                }
            });

            return nResGroupIndex !== null ? "/groups/" + nResGroupIndex + "/tiles/" + nResTileIndex : null;
        },

        // see http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
        _moveInArray: function (aArray, nFromIndex, nToIndex) {
            if (nToIndex >= aArray.length) {
                var k = nToIndex - aArray.length;
                while ((k--) + 1) {
                    aArray.push(undefined);
                }
            }
            aArray.splice(nToIndex, 0, aArray.splice(nFromIndex, 1)[0]);
        },

        _updateGroupIndices: function (aArray) {
            var k;
            for (k = 0; k < aArray.length; k++) {
                aArray[k].index = k;
            }
        },
        /*
         * oData should have the following parameters
         * groupId
         */
        _deleteGroup: function (sChannelId, sEventId, oData) {
            var that = this,
                sGroupId = oData.groupId,
                sGroupObjectId,
                aGroups = this.oModel.getProperty("/groups"),
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                bIsLast = aGroups.length - 1 === nGroupIndex,
                oGroup = null,
                oResultPromise,
                oModel,
                nextSelectedItemIndex,
                oBus;

            nextSelectedItemIndex = bIsLast ? nGroupIndex - 1 : nGroupIndex;
            this._destroyGroupModel("/groups/" + nGroupIndex);
            oGroup = aGroups.splice(nGroupIndex, 1)[0].object;
            if (bIsLast) {
                this.oModel.setProperty("/groups/" + nextSelectedItemIndex + "/isLastGroup", bIsLast);
            }
            sGroupObjectId = sap.ushell.Container.getService("LaunchPage").getGroupId(oGroup);
            oModel = this.oModel;
            oModel.setProperty("/groupList-skipScrollToGroup", true);
            oModel.setProperty("/groups", aGroups);
            this._updateGroupIndices(aGroups);

            if (nextSelectedItemIndex >= 0) {
                oBus = sap.ui.getCore().getEventBus();
                window.setTimeout($.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", {groupId: this.oModel.getProperty("/groups")[nextSelectedItemIndex].groupId}), 200);
            }

            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            this._addRequest($.proxy(function () {
                var groupName = sap.ushell.Container.getService("LaunchPage").getGroupTitle(oGroup);
                try {
                    oResultPromise = this.oPageBuilderService.removeGroup(oGroup);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_delete_group_msg");
                    return;
                }

                oResultPromise.done(function () {
                    sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                        this.analyticsConstants.PERSONALIZATION,
                        this.analyticsConstants.DELETE_GROUP,
                        [groupName, sGroupObjectId]
                    );
                    this._showLocalizedMessage("group_deleted_msg", [groupName]);
                }.bind(this));
                oResultPromise.fail(this._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_delete_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * oData should have the following parameters
         * groupId
         */
        _resetGroup: function (sChannelId, sEventId, oData) {
            var that = this,
                sGroupId = oData.groupId,
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                oGroup = this.oModel.getProperty("/groups/" + nGroupIndex),
                sGroupTitle,
                sGroupObjectId,
                oResultPromise,
                oGroupControl;

            this.oModel.setProperty("/groups/" + nGroupIndex + "/sortable", false);
            sGroupObjectId = sap.ushell.Container.getService("LaunchPage").getGroupId(oGroup.object);
            sGroupTitle = sap.ushell.Container.getService("LaunchPage").getGroupTitle(oGroup.object);
            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.resetGroup(oGroup.object);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_reset_group_msg");
                    return;
                }

                oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oGroup, oResetedGroup) {
                    sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                        this.analyticsConstants.PERSONALIZATION,
                        this.analyticsConstants.RESET_GROUP,
                        [sGroupTitle, sGroupObjectId]
                    );
                    var nGroupIndex = that._getIndexOfGroup(sGroupId);

                    this._loadGroup(nGroupIndex, oResetedGroup || oGroup.object);
                    this._showLocalizedMessage("group_reset_msg", [oGroup.title]);
                    this.oModel.setProperty("/groups/" + nGroupIndex + "/sortable", true);

                    oGroupControl = sap.ui.getCore().byId('dashboardGroups').getGroupControlByGroupId(sGroupId);
                    if (oGroupControl) {
                        oGroupControl.rerender();
                    }

                }, this, sGroupId, oGroup)));

                oResultPromise.fail(this._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_reset_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * oData should have the following parameters
         * fromIndex
         * toIndex
         */
        _moveGroup: function (sChannelId, sEventId, oData) {
            var iFromIndex = oData.fromIndex,
                iToIndex = oData.toIndex,
                aGroups = this.oModel.getProperty("/groups"),
                oModel = this.oModel,
                bActionMode = this.oModel.getProperty("/tileActionModeActive"),
                oResultPromise,
                oGroup,
                sGroupId,
                that = this,
                i;

            //Fix the indices to support hidden groups
            if (!bActionMode) {
                iFromIndex = this._adjustFromGroupIndex(iFromIndex, aGroups);
            }

            //Move var definition after fixing the from index.
            oGroup = aGroups[iFromIndex];
            sGroupId = oGroup.groupId;
            //Fix the to index accordingly
            if (!bActionMode) {
                iToIndex = this._adjustToGroupIndex(iToIndex, aGroups, sGroupId);
            }

            this._moveInArray(aGroups, iFromIndex, iToIndex);
            this._updateGroupIndices(aGroups);
            oModel.setProperty("/groupList-skipScrollToGroup", true);
            for (i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }
            aGroups[aGroups.length - 1].isLastGroup = true;
            oModel.setProperty("/groups", aGroups);

            window.setTimeout(function () {
                oModel.setProperty("/groupList-skipScrollToGroup", false);
            }, 1000);

            this._addRequest($.proxy(function () {
                var oGroup = this.oModel.getProperty(this._getPathOfGroup(sGroupId));
                try {
                    oResultPromise = this.oPageBuilderService.moveGroup(oGroup.object, iToIndex);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_move_group_msg");
                    return;
                }

                oResultPromise.done(function () {
                    sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                        that.analyticsConstants.PERSONALIZATION,
                        that.analyticsConstants.MOVE_GROUP,
                        [oGroup.title, iFromIndex, iToIndex, sGroupId]
                    );
                });
                oResultPromise.fail(this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_move_group_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        /*
         * toIndex - The index in the UI of the required group new index. (it is not including the group itself)
         * groups - The list of groups in the model (including hidden and visible groups)
         * The function returns the new index to be used in the model - since there might be hidden groups that should be taken in account
         */
        _adjustToGroupIndex: function (toIndex, groups, groupId) {
            var visibleCounter = 0,
                bIsGroupIncluded = false,
                i = 0;
            // In order to get the new index, count all groups (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < groups.length && visibleCounter < toIndex; i++) {
                if (groups[i].isGroupVisible) {
                    if (groups[i].groupId === groupId) {
                        bIsGroupIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsGroupIncluded) {
                return i - 1;
            }
            return i;
        },

        _adjustFromGroupIndex: function (index, groups) {
            var visibleGroupsCounter = 0,
                i;
            for (i = 0; i < groups.length; i++) {
                if (groups[i].isGroupVisible) {
                    visibleGroupsCounter++;
                }
                if (visibleGroupsCounter === index + 1) {
                    return i;
                }
            }
            //Not suppose to happen, but if not found return the input index
            return index;
        },
        /*
         * oData should have the following parameters
         * groupId
         * newTitle
         */
        _changeGroupTitle: function (sChannelId, sEventId, oData) {
            var sNewTitle = oData.newTitle,
                aGroups = this.oModel.getProperty("/groups"),
                sGroupId = oData.groupId,
                sGroupOriginalId = oData.groupId,
                nGroupIndex = this._getIndexOfGroup(sGroupId),
                oGroup = this.oModel.getProperty("/groups/" + nGroupIndex),
                sOldTitle = oGroup.title,
                oResultPromise,
                that = this;

            this.oModel.setProperty("/groups/" + nGroupIndex + "/title", sNewTitle);

            // Check, if the group has already been persisted.
            if (!oGroup.object) {
                // Add the group in the backend.
                this._addRequest($.proxy(function () {
                    try {
                        if (nGroupIndex === aGroups.length - 1) {
                            oResultPromise = this.oPageBuilderService.addGroup(sNewTitle, nGroupIndex);
                        } else {
                            oResultPromise = this.oPageBuilderService.addGroupAt(sNewTitle, nGroupIndex);
                        }
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_create_group_msg");
                        return;
                    }

                    oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oNewGroup) {
                        var nGroupIndex = this._getIndexOfGroup(sGroupId);
                        this._loadGroup(nGroupIndex, oNewGroup);
                        sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                            that.analyticsConstants.PERSONALIZATION,
                            that.analyticsConstants.RENAME_GROUP,
                            [sOldTitle, sNewTitle, sGroupId]
                        );
                    }, this, sGroupId)));

                    oResultPromise.fail(this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_create_group_msg")));
                }, this));
            } else {
                // Rename the group in the backend.
                // model is already changed - it only has to be made persistent in the backend
                this._addRequest($.proxy(function () {
                    try {
                        oResultPromise = this.oPageBuilderService.setGroupTitle(oGroup.object, sNewTitle);
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_rename_group_msg");
                        return;
                    }
                    oResultPromise.done(function () {
                        sGroupOriginalId = sap.ushell.Container.getService("LaunchPage").getGroupId(oGroup.object);
                        sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                            that.analyticsConstants.PERSONALIZATION,
                            that.analyticsConstants.RENAME_GROUP,
                            [sOldTitle, sNewTitle, sGroupOriginalId]
                        );
                    });
                    // Revert to the old title.
                    oResultPromise.fail(this._handleAfterSortable($.proxy(function (sGroupId, sOldTitle) {
                        var sGroupPath = this._getPathOfGroup(sGroupId);
                        this._showLocalizedError("fail_to__msg");
                        this.oModel.setProperty(sGroupPath + "/title", sOldTitle);
                        this._requestFailed();
                    }, this, sGroupId)));
                }, this));
            }

            oResultPromise.always($.proxy(this._checkRequestQueue, this));
        },

        createTile: function (oData) {
            var oCatalogTileContext = oData.catalogTileContext,
                oContext = oData.groupContext,
                oGroup = this.oModel.getProperty(oContext.getPath()),
                sGroupId = oGroup.groupId,
                oResultPromise,
                deferred = jQuery.Deferred(),
                oResponseData = {},
                oBus;

            //publish event for UserActivityLog
            oBus = sap.ui.getCore().getEventBus();
            oBus = sap.ui.getCore().getEventBus();
            $.proxy(oBus.publish, oBus, "launchpad", "addTile", {
                catalogTileContext: oCatalogTileContext,
                groupContext: oContext
            });

            if (!oCatalogTileContext) {
                jQuery.sap.log.warning("DashboardManager: Did not receive catalog tile object. Abort.", this);
                return;
            }

            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.addTile(oCatalogTileContext.getProperty("src"), oContext.getProperty("object"));
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_add_tile_msg");
                    return;
                }

                var that = this;
                oResultPromise
                    .done(function (oTile) {
                        var sGroupPath = that._getPathOfGroup(sGroupId),
                            sTileTitle = sap.ushell.Container.getService("LaunchPage").getTileTitle(oTile);

                        that._addTileToGroup(sGroupPath, oTile);
                        oResponseData = {group: oGroup, status: 1, action: 'add'}; // 1 - success
                        sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                            that.analyticsConstants.PERSONALIZATION,
                            that.analyticsConstants.ADD_TILE,
                            [oGroup.title, sTileTitle]
                        );
                        deferred.resolve(oResponseData);
                    })
                    .fail(function () {
                        oResponseData = {group: oGroup, status: 0, action: 'add'};  // 0 - failure
                        deferred.resolve(oResponseData);
                    })
                    .always(
                        function () {
                            that._checkRequestQueue();
                        }
                    );
            }, this));

            return deferred.promise();
        },

        createGroupAndSaveTile: function (oData) {
            var oCatalogTileContext = oData.catalogTileContext,
                sNewTitle = oData.newGroupName,
                oResultPromise,
                deferred = jQuery.Deferred(),
                oResponseData = {},
                oGroup,
                aGroups,
                sGroupId,
                index;

            if (sap.ushell.utils.validHash(sNewTitle) && oCatalogTileContext) {

                oGroup = this._getGroupModel(null, false, true);
                aGroups = this.oModel.getProperty("/groups");
                sGroupId = oGroup.groupId;
                index = aGroups.length;

                if (index > 0) {
                    aGroups[index - 1].isLastGroup = false;
                }
                oGroup.title = sNewTitle;
                oGroup.index = index;
                oGroup.editMode = false;
                aGroups.push(oGroup);
                this.oModel.setProperty("/groups/", aGroups);

                if (!oCatalogTileContext) {
                    jQuery.sap.log.warning("DashboardManager: Did not receive catalog tile object. Abort.", this);
                    return;
                }

                // Create new group
                this._addRequest($.proxy(function () {
                    try {
                        oResultPromise = this.oPageBuilderService.addGroup(sNewTitle);
                    } catch (err) {
                        this._resetGroupsOnFailure("fail_to_create_group_msg");
                        return;
                    }

                    oResultPromise.done(this._handleAfterSortable($.proxy(function (sGroupId, oNewGroup) {
                        var nGroupIndex = this._getIndexOfGroup(sGroupId),
                            oContext,
                            promise;

                        this._loadGroup(nGroupIndex, oNewGroup);

                        oContext = new sap.ui.model.Context(this.oModel, "/groups/" + nGroupIndex);
                        promise = this.createTile({
                            catalogTileContext: oCatalogTileContext,
                            groupContext: oContext
                        });

                        promise.done(function (data) {
                            oResponseData = {group: data.group, status: 1, action: 'addTileToNewGroup'}; // 1 - success
                            deferred.resolve(oResponseData);
                        }).fail(function (data) {
                            oResponseData = {group: data.group, status: 0, action: 'addTileToNewGroup'}; // 0 - failure
                            deferred.resolve(oResponseData);
                        });
                    }, this, sGroupId)));

                    oResultPromise.fail(function (data) {
                        this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_create_group_msg"));
                        oResponseData = {group: data.group, status: 0, action: 'createNewGroup'}; // 0 - failure
                        deferred.resolve(oResponseData); // 0 - failure
                    }.bind(this));

                    oResultPromise.always($.proxy(this._checkRequestQueue, this));
                }, this));
            }
            return deferred.promise();
        },

        /*
         * Dashboard
         * oData should have the following parameters
         * tileId
         * groupId
         */
        _deleteTile: function (sChannelId, sEventId, oData) {
            var that = this,
                sTileId = oData.tileId || oData.originalTileId,
                aGroups = this.oModel.getProperty("/groups");

            jQuery.each(aGroups, function (nGroupIndex, oGroup) {
                var bFoundFlag = false;
                jQuery.each(oGroup.tiles, function (nTileIndex, oTmpTile) {
                    if (oTmpTile.uuid === sTileId || oTmpTile.originalTileId === sTileId) {
                        // Remove tile from group.
                        that._destroyTileModel("/groups/" + nGroupIndex + "/tiles/" + nTileIndex);
                        var oTile = oGroup.tiles.splice(nTileIndex, 1)[0],
                            oResultPromise,
                            sTileName = sap.ushell.Container.getService("LaunchPage").getTileTitle(oTile.object),
                            sCatalogTileId = sap.ushell.Container.getService("LaunchPage").getCatalogTileId(oTile.object),
                            sCatalogTileTitle = sap.ushell.Container.getService("LaunchPage").getCatalogTileTitle(oTile.object),
                            sTileRealId = sap.ushell.Container.getService("LaunchPage").getTileId(oTile.object);

                        that.oModel.setProperty("/groups/" + nGroupIndex + "/tiles", oGroup.tiles);
                        that._addRequest(function () {
                            try {
                                oResultPromise = that.oPageBuilderService.removeTile(oGroup.object, oTile.object);
                            } catch (err) {
                                this._resetGroupsOnFailure("fail_to_remove_tile_msg");
                                return;
                            }

                            oResultPromise.done(that._handleAfterSortable(function () {

                                if (sTileName) {
                                    that._showLocalizedMessage("tile_deleted_msg", [sTileName, oGroup.title]);
                                } else {
                                    that._showLocalizedMessage("tile_deleted_msg", [sTileName, oGroup.title]);
                                }
                                sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                                    that.analyticsConstants.PERSONALIZATION,
                                    that.analyticsConstants.DELETE_TILE,
                                    [sTileName || sTileRealId, sCatalogTileId, sCatalogTileTitle, oGroup.title]
                                );
                            }));
                            oResultPromise.fail(that._handleAfterSortable(that._resetGroupsOnFailureHelper("fail_to_remove_tile_msg")));
                            oResultPromise.always($.proxy(that._checkRequestQueue, that));
                        });
                        sap.ushell.utils.handleTilesVisibility();
                        bFoundFlag = true;
                        return false;
                    }
                });
                if (bFoundFlag) {
                    return false;
                }
            });
        },

        _sendDeleteTileRequest: function (oGroup, oTile) {
            var oResultPromise,
                tmpPageBuilderService = sap.ushell.Container.getService('LaunchPage');
            try {
                oResultPromise = tmpPageBuilderService.removeTile(oGroup, oTile.object);
            } catch (err) {
                jQuery.sap.log.error("deleteCatalogTileFromGroup ; removeTile ; Exception occurred: " + err);
            }

            return oResultPromise;
        },

        /*
         * Delete all instances of a catalog Tile from a Group
         */
        deleteCatalogTileFromGroup: function (oData) {
            var that = this,
                sDeletedTileCatalogId = decodeURIComponent(oData.tileId),
                iGroupIndex = oData.groupIndex,
                oGroup = this.oModel.getProperty("/groups/" + iGroupIndex),
                serv = sap.ushell.Container.getService("LaunchPage"),
                deferred = jQuery.Deferred(),
                aDeleteTilePromises = [],
                aFilteredTiles,
                oPositiveDeferred,
                oDeletePromise;

            aFilteredTiles = oGroup.tiles.filter(
                function (oTile) {
                    var sTmpTileCatalogId = serv.getCatalogTileId(oTile.object);
                    if (sTmpTileCatalogId !== sDeletedTileCatalogId) {
                        return true;
                    } else {
                        // Initialize oPositiveDeferred object that will later be resolved with the status of the delete request
                        oPositiveDeferred = jQuery.Deferred();
                        // Send the delete request to the server
                        oDeletePromise = that._sendDeleteTileRequest(oGroup.object, oTile);

                        oDeletePromise.done(
                            (function (deferred) {
                                return function () {
                                    deferred.resolve({status: true});
                                };
                            })(oPositiveDeferred));

                        oDeletePromise.fail(
                            (function (deferred) {
                                return function () {
                                    deferred.resolve({status: false});
                                };
                            })(oPositiveDeferred));

                        aDeleteTilePromises.push(oPositiveDeferred);

                        return false;
                    }
                }
            );

            oGroup.tiles = aFilteredTiles;

            // Wait for all of the delete requests before resolving the deferred
            jQuery.when.apply(jQuery, aDeleteTilePromises).
                done(
                    function (result) {
                        var bSuccess = true,
                            index = 0,
                            promisesLength = aDeleteTilePromises.length;

                        // Check if at least one deleteTilePromises has failure status
                        for (index; index < promisesLength; index++) {
                            if (!result.status) {
                                bSuccess = false;
                                break;
                            }
                        }
                        if (bSuccess) {
                            // that.oModel.setProperty("/groups/" + iGroupIndex + "/tiles/", oGroup.tiles);
                            that.oModel.setProperty("/groups/" + iGroupIndex, oGroup);
                        }
                        deferred.resolve({group: oGroup, status: bSuccess, action: 'remove'});
                    }
                );
            return deferred.promise();
        },

        /*
         * oData should have the following parameters:
         * fromGroupId
         * toGroupId
         * fromIndex
         * toIndex can be null => append as last tile in group
         */
        _moveTile : function (sChannelId, sEventId, oData) {
            var nNewIndex = oData.toIndex,
                sNewGroupId = oData.toGroupId,
                sTileId = oData.sTileId,
                sSource = oData.source,
                oTile,
                nTileIndex,
                oOldGroup,
                nOldGroupIndex,
                oNewGroup,
                nNewGroupIndex,
                srvc = sap.ushell.Container.getService("LaunchPage"),
                aGroups = this.oModel.getProperty("/groups"),
                oSourceGroup,
                oTargetGroup,
                oResultPromise;

            jQuery.each(aGroups, function (nTmpGroupIndex, oTmpGroup) {
                var bFoundFlag = false;
                jQuery.each(oTmpGroup.tiles, function (nTmpTileIndex, oTmpTile) {
                    if (oTmpTile.uuid === sTileId) {
                        oTile = oTmpTile;
                        nTileIndex = nTmpTileIndex;
                        oOldGroup = oTmpGroup;
                        nOldGroupIndex = nTmpGroupIndex;
                        bFoundFlag = true;
                        return false;
                    }
                });
                if (bFoundFlag) {
                    return false;
                }
            });
            jQuery.each(aGroups, function (nTmpGroupIndex, oTmpGroup) {
                if (oTmpGroup.groupId === sNewGroupId) {
                    oNewGroup = oTmpGroup;
                    nNewGroupIndex = nTmpGroupIndex;
                }
            });

            //When moving a tile to the group it is already in using the move dialog, there is no change
            if (oOldGroup.groupId == oNewGroup.groupId && (sSource === "moveDialog" || nNewIndex === null)) {
                return;
            }

            // When a tile is dragged into an empty group, the Plus-Tiles in the empty list cause
            // the new index to be off by one, i.e. 1 instead of 0, which causes an error.
            // This is a generic check which sanitizes the values if necessary.
            if (nNewIndex && nNewIndex > oNewGroup.tiles.length) {
                nNewIndex = oNewGroup.tiles.length;
            }

            if (oOldGroup.groupId === sNewGroupId) {
                if (nNewIndex === null || nNewIndex === undefined) {
                    // moved over group list to same group
                    oOldGroup.tiles.splice(nTileIndex, 1);
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oOldGroup.tiles.length;
                    // append as last item
                    oOldGroup.tiles.push(oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTile, oOldGroup);
                    this._moveInArray(oOldGroup.tiles, nTileIndex, nNewIndex);
                }

                this.oModel.setProperty("/groups/" + nOldGroupIndex + "/tiles", oOldGroup.tiles);
            } else {
                // remove from old group
                oOldGroup.tiles.splice(nTileIndex, 1);
                this.oModel.setProperty("/groups/" + nOldGroupIndex + "/tiles", oOldGroup.tiles);

                // add to new group
                if (nNewIndex === null || nNewIndex === undefined) {
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oNewGroup.tiles.length;
                    // append as last item
                    oNewGroup.tiles.push(oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTile, oNewGroup);
                    oNewGroup.tiles.splice(nNewIndex, 0, oTile);
                }
                this.oModel.setProperty("/groups/" + nNewGroupIndex + "/tiles", oNewGroup.tiles);
            }
            //recalculate the associated groups for catalog tiles
            this.mapCatalogTilesToGroups();
            this.updateCatalogTilesToGroupsMap();
            // Re-calculate the visibility of the Tiles
            sap.ushell.utils.handleTilesVisibility();

            // change in backend
            oSourceGroup = this.oModel.getProperty("/groups/" + nOldGroupIndex).object;
            oTargetGroup = this.oModel.getProperty("/groups/" + nNewGroupIndex).object;

            this._addRequest($.proxy(function () {
                try {
                    oResultPromise = this.oPageBuilderService.moveTile(oTile.object, nTileIndex, nNewIndex, oSourceGroup, oTargetGroup);
                } catch (err) {
                    this._resetGroupsOnFailure("fail_to_move_tile_msg");
                    return;
                }

                // Putting a special flag on the Tile's object
                // this enables us to disable opening the tile's action until it has been updated from the backend
                // (see in DashboardContent.view
                oTile.tileIsBeingMoved = true;

                oResultPromise.done(this._handleAfterSortable($.proxy(function (sTileId, oTargetTile) {
                    var sTilePath,
                        aUsageAnalyticsCustomProps = [
                            srvc.getTileTitle(oTile.object),
                            srvc.getGroupTitle(oSourceGroup),
                            srvc.getGroupTitle(oTargetGroup),
                            sTileId];

                    sap.ushell.Container.getService("UsageAnalytics").logCustomEvent(
                        this.analyticsConstants.PERSONALIZATION,
                        this.analyticsConstants.MOVE_TILE,
                        aUsageAnalyticsCustomProps
                    );
                    sTilePath = this._getPathOfTile(sTileId);

                    // If we cannot find the tile, it might have been deleted -> Check!
                    if (sTilePath) {
                        // Update the model with the new tile object and new Id.
                        this.oModel.setProperty(sTilePath + "/object", oTargetTile);
                        this.oModel.setProperty(sTilePath + "/originalTileId", this.oPageBuilderService.getTileId(oTargetTile));

                        // get the target-tile view and align the Model for consistency
                        this.oPageBuilderService.getTileView(oTargetTile).done(function (oView) {
                            // get the old view from tile's model
                            var oldViewContent = this.oModel.getProperty(sTilePath + "/content");
                            // first we set new view
                            this.oModel.setProperty(sTilePath + "/content", [oView]);
                            //now we destroy the old view
                            if (oldViewContent && oldViewContent[0]) {
                                oldViewContent[0].destroy();
                            }
                            // reset the move-scenario flag
                            this.oModel.setProperty(sTilePath + "/tileIsBeingMoved", false);
                        }.bind(this));
                    }
                }, this, sTileId)));

                oResultPromise.fail(this._handleAfterSortable(this._resetGroupsOnFailureHelper("fail_to_move_tile_msg")));
                oResultPromise.always($.proxy(this._checkRequestQueue, this));
            }, this));
        },

        // Adjust the moved-tile new index according to the visible+hidden tiles
        _adjustTileIndex: function (newLocationIndex, oTile, newGroup) {
            var visibleCounter = 0,
                bIsTileIncluded = false,
                i = 0;
            // In order to get the new index, count all tiles (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < newGroup.tiles.length && visibleCounter < newLocationIndex; i++) {
                if (newGroup.tiles[i].isTileIntentSupported) {
                    if (newGroup.tiles[i] === oTile) {
                        bIsTileIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsTileIncluded) {
                return i - 1;
            }
            return i;
        },

        // temporary - should not be exposed
        getModel: function () {
            return this.oModel;
        },

        getDashboardView: function () {
            return this.oDashboardView;
        },

        getGroupListView: function (config) {
            var bAlreadyCreated = true;
            if (!sap.ui.getCore().byId('groupList')) {
                bAlreadyCreated = false;
                this.oGroupListView = sap.ui.view("groupList", {
                    viewName: "sap.ushell.components.flp.launchpad.group_list.GroupList",
                    type: 'JS',
                    viewData: config || {}
                });
            }
            return {groupList: this.oGroupListView, alreadyCreated: bAlreadyCreated};
        },

        isGroupListViewCreated: function () {
            return this.oGroupListView !== undefined;
        },

        // CATALOG LOADING
        loadAllCatalogs: function (sChannelId, sEventId, oData) {
            var oGroupsPromise = new jQuery.Deferred(),
                that = this,
                setDoneCBForGroups;

            // automatically resolving the group's promise for the scenario where the groups are
            // already loaded (so the group's promise Done callback will execute automatically is such a case)
            oGroupsPromise.resolve();

            // this is a local function (which could be invoked at 2 pointsin thie method).
            // this sets a Done callback on the promise object of the groups.
            setDoneCBForGroups = function () {
                oGroupsPromise.done(function () {
                    var aGroups = that.getModel().getProperty("/groups");
                    if (aGroups && aGroups.length !== 0) {
                        that.mapCatalogTilesToGroups();
                        // update the catalogTile model after mapCatalogTilesToGroups() was called
                        that.updateCatalogTilesToGroupsMap();
                    }
                });
            };

            if (!this.oModel.getProperty("/catalogs") || !sap.ushell.Container.getService("LaunchPage").isCatalogsValid()) {

                // catalog also needs groups
                if (!this.oModel.getProperty("/groups") || this.oModel.getProperty("/groups").length === 0) {
                    oGroupsPromise = this.loadPersonalizedGroups();
                }
                this._destroyAllGroupModels("/catalogs");
                this._destroyAllTileModels("/catalogTiles");
                // Clear existing Catalog items
                this.oModel.setProperty("/catalogs", []);
                this.oModel.setProperty("/catalogTiles", []);

                // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
                this.aPromises = [];

                // Trigger loading of catalogs
                sap.ushell.Container.getService("LaunchPage").getCatalogs()
                    // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                    // (i.e. all calls to addCatalogToModel are finished).
                    // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                    // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                    .done(function (catalogs) {
                        jQuery.when.apply(jQuery, this.aPromises).then(this.onDoneLoadingCatalogs(catalogs));
                        setDoneCBForGroups();
                    }.bind(this))
                    //in case of a severe error, show an error message
                    .fail(that._showLocalizedErrorHelper("fail_to_load_catalog_msg"))
                    //for each loaded catalog, add it to the model
                    .progress(this.addCatalogToModel.bind(this));
            } else {

                // when groups are loaded we can map the catalog tiles <-> groups map
                setDoneCBForGroups();
            }
        },

        updateCatalogTilesToGroupsMap: function () {
            var catalogTiles = this.getModel().getProperty("/catalogTiles"),
                tile,
                index,
                tileId,
                associatedGrps,
                aGroups,
                srvc = sap.ushell.Container.getService("LaunchPage");
            // if the catalogTile model doesn't exist, it will be updated in some time later
            if (catalogTiles) {
                for (index = 0; index < catalogTiles.length; index++) {
                    tile = catalogTiles[index];
                    tileId = encodeURIComponent(srvc.getCatalogTileId(tile.src));
                    associatedGrps = this.getModel().getProperty("/catalogTiles/" + index + "/associatedGroups");
                    aGroups = this.oTileCatalogToGroupsMap[tileId];
                    associatedGrps = aGroups ? aGroups : [];
                    catalogTiles[index].associatedGroups = associatedGrps;
                }
            }
            this.getModel().setProperty("/catalogTiles", catalogTiles);
        },

        /**
         * Adds a catalog object to the model including the catalog tiles.
         * The catalog is added to the "/catalogs" array in the model, and the tiles are added to "/catalogTiles".
         * If a catalog with the same title already exists - no new entry is added to the model for the new catalog,
         *  and the tiles are added to "/catalogTiles" with indexes that place them under the catalog (with the same title) that already exists
         *
         *  @param {object} catalog
         */
        addCatalogToModel: function (oCatalog) {
            var aCurrentCatalogs = this.oModel.getProperty('/catalogs'),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                sCatalogId = srvc.getCatalogId(oCatalog),
                bCatalogExist = false,
                oCatalogModel,
                oPromise;

            // Check if the catalog already exist in the model, or catalog with similar title
            aCurrentCatalogs.forEach(function (oCat) {
                if (oCat.id === sCatalogId) {
                    bCatalogExist = true;
                }
            });

            if (!bCatalogExist) {
                oCatalogModel = {
                    title: srvc.getCatalogTitle(oCatalog),
                    id: srvc.getCatalogId(oCatalog),
                    "static": false,
                    tiles: [],
                    numberOfTiles: 0
                };
                oPromise = srvc.getCatalogTiles(oCatalog);
                this.aPromises.push(oPromise);

                oPromise.done(function (aTiles) {
                    //if this catalog has no tiles we do not need to add it to the model
                    if (!aTiles.length) {
                        return;
                    }
                    var oCatalogData = {
                        catalog: oCatalogModel.title,
                        id: oCatalogModel.id,
                        index: aCurrentCatalogs.length,
                        numberOfExistingTiles: 0
                    };

                        // In order to make sure that only one catalog is updated in the model at a given time -
                        //  the part of adding a catalog (+ catalog tiles) to the model is synchronized
                        var updateModelSynchronized = function () {

                            // Check if another catalog is currently being put in the model
                            if (!this.oModel.getProperty('/isCatalogInUpdate')) {

                                this.oModel.setProperty('/isCatalogInUpdate', true);

                                // Check if a catalog with the given title already exists in the model.
                                var oExistingCatalogInModel = this.searchModelCatalogByTitle(oCatalogModel.title),
                                    aCatalogs;

                                // If a catalog with similar title already exists in the model:
                                //  - Update the object catalogData before it is passed to setCatalogTiles
                                //  - Update the relevant catalog in the model with the updated amount of tiles it now has
                                if (oExistingCatalogInModel.result) {

                                    // Update /catalogTiles
                                    oCatalogData.index = oExistingCatalogInModel.indexOfPreviousInstanceInModel;
                                    oCatalogData.numberOfExistingTiles = oExistingCatalogInModel.numOfTilesInCatalog;
                                    this.setCatalogTiles("/catalogTiles", true, oCatalogData, aTiles);

                                    // Update /catalogs
                                    aCatalogs = this.oModel.getProperty('/catalogs');
                                    oCatalog = aCatalogs[oExistingCatalogInModel.indexOfPreviousInstanceInModel];
                                    oCatalog.numIntentSupportedTiles = getNumIntentSupportedTiles.call(this, oCatalogModel);
                                    oCatalog.numberOfTiles = oExistingCatalogInModel.numOfTilesInCatalog + aTiles.length;
                                    aCurrentCatalogs[oExistingCatalogInModel.indexOfPreviousInstanceInModel] = oCatalog;

                                } else {
                                    this.setCatalogTiles("/catalogTiles", true, oCatalogData, aTiles);
                                    oCatalogModel.numIntentSupportedTiles = getNumIntentSupportedTiles.call(this, oCatalogModel);

                                    oCatalogModel.numberOfTiles = aTiles.length;
                                    aCurrentCatalogs.push(oCatalogModel);
                                }

                                this.oModel.setProperty('/catalogs', aCurrentCatalogs);

                                // Update the model with the catalog - finished
                                this.oModel.setProperty('/isCatalogInUpdate', false);
                                return;
                            }
                            setTimeout(updateModelSynchronized, 50);
                        }.bind(this);

                    // Call the synchronized catalog update function
                    updateModelSynchronized();

                }.bind(this)
                    ).fail(this._showLocalizedErrorHelper("fail_to_load_catalog_tiles_msg")
                    );
            }
        },

        /**
         * check if a catalog with the given title already exists in the model.
         *
         *  @param {string} catalogTitle
         *
         *  @returns {object} - an object that includes:
         *  - result - a boolean value indicating whether the model already includes a catalog with the same title
         *  - indexOfPreviousInstanceInModel - the index in the model (in /catalogs) of the existing catalog with the given title
         *  - indexOfPreviousInstanceInPage - the index in the page of the existing  catalog with the given title,
         *     this value usually equals (indexOfPreviousInstanceInModel-1) since the model includes the dummy-catalog "All Cataslogs"
         *     that doesn't appear in the page
         *  - numOfTilesInCatalog - the number of tiles in the catalog with the given title
         */
        searchModelCatalogByTitle: function (catalogTitle) {
            var catalogs = this.oModel.getProperty('/catalogs'),
                catalogTitleExists = false,
                indexOfPreviousInstance,
                numOfTilesInCatalog = 0,
                bGeneralCatalogAppeared = false;

            $.each(catalogs, function (index, tempCatalog) {
                // If this is the catalogsLoading catalog - remember that it was read since the found index should be reduced by 1
                if (tempCatalog.title === sap.ushell.resources.i18n.getText('catalogsLoading')) {
                    bGeneralCatalogAppeared = true;
                } else if (catalogTitle == tempCatalog.title) {
                    indexOfPreviousInstance = index;
                    numOfTilesInCatalog = tempCatalog.numberOfTiles;
                    catalogTitleExists = true;
                    return false;
                }
            });
            return {
                result: catalogTitleExists,
                indexOfPreviousInstanceInModel: indexOfPreviousInstance,
                indexOfPreviousInstanceInPage: bGeneralCatalogAppeared ? indexOfPreviousInstance - 1 : indexOfPreviousInstance,
                numOfTilesInCatalog: numOfTilesInCatalog
            };
        },

        getTagList: function (maxTags) {
            var indexedTags = {},
                ind = 0,
                tempTagsLst = [],
                tag,
                oTag,
                sorted;

            for (ind = 0; ind < this.tagsPool.length; ind++) {
                oTag = this.tagsPool[ind];
                if (indexedTags[oTag]) {
                    indexedTags[oTag]++;
                } else {
                    indexedTags[oTag] = 1;
                }
            }

            //find the place in the sortedTopTiles.
            for (tag in indexedTags) {
                tempTagsLst.push({tag: tag, occ: indexedTags[tag]});
            }

            sorted = tempTagsLst.sort(function (a, b) {
                return b.occ - a.occ;
            });

            if (sorted.length === 0) {
                this.oModel.setProperty("/tagFiltering", false);
            }

            if (maxTags) {
                this.oModel.setProperty("/tagList", sorted.slice(0, maxTags));
            } else {
                this.oModel.setProperty("/tagList", sorted);
            }
        },

        onDoneLoadingCatalogs: function (aCatalogs) {
            if (!aCatalogs.length) {
                this.oModel.setProperty("/catalogsNoDataText", sap.ushell.resources.i18n.getText('noCatalogs'));
            }
            var srvc = sap.ushell.Container.getService("LaunchPage"),
                aLoadedCatalogs = aCatalogs.filter(function (oCatalog) {
                    return !srvc.getCatalogError(oCatalog);
                }),
                aCurrentCatalogs;
            //check if some of the catalogs failed to load
            if (aLoadedCatalogs.length !== aCatalogs.length) {
                this._showLocalizedError("partialCatalogFail");
            }

            // Check if filtering catalog tiles by tags is enabled
            if (this.oModel.getProperty("/tagFiltering") === true) {
                //create the tags menu
                this.getTagList();
            }

            aCurrentCatalogs = this.oModel.getProperty('/catalogs');
            //filter out the "Loading Catalogs..." menu item if exists
            if (aCurrentCatalogs[0] && aCurrentCatalogs[0].title === sap.ushell.resources.i18n.getText('catalogsLoading')) {
                aCurrentCatalogs.splice(0, 1);
            }
            //create the "All" static entry for the catalogSelect menu
            aCurrentCatalogs.splice(0, 0, {
                title: getLocalizedText("catalogSelect_initial_selection"),
                "static": true,
                tiles: [],
                numIntentSupportedTiles: -1//only in order to present this option in the Catalog.view (dropdown menu)since there is a filter there on this property
            });
            this.oModel.setProperty('/catalogs', aCurrentCatalogs);
            sap.ushell.utils.handleTilesVisibility();
        },

        setCatalogTiles: function (sPath, bAppend, oData, aCatalogTiles) {
            var srvc = sap.ushell.Container.getService("LaunchPage"),
                aUpdatedCatalogTiles = $.map(
                    aCatalogTiles,
                    function (oCatalogTile, iTile) {
                        var catalogTileId = encodeURIComponent(srvc.getCatalogTileId(oCatalogTile)),
                            associatedGrps = this.oTileCatalogToGroupsMap[catalogTileId] || [],
                            tileTags = srvc.getCatalogTileTags(oCatalogTile) || [];

                        if (tileTags.length > 0) {
                            this.tagsPool = this.tagsPool.concat(tileTags);
                        }

                        return {
                            associatedGroups: associatedGrps,
                            src: oCatalogTile,
                            catalog: oData.catalog,
                            catalogIndex: this.calculateCatalogTileIndex(oData.index, oData.numberOfExistingTiles, iTile),
                            catalogId: oData.id,
                            title: srvc.getCatalogTileTitle(oCatalogTile),
                            tags: tileTags,
                            keywords: (srvc.getCatalogTileKeywords(oCatalogTile) || []).join(','),
                            id: catalogTileId,
                            size: srvc.getCatalogTileSize(oCatalogTile),
                            content: [srvc.getCatalogTileView(oCatalogTile)],
                            isTileIntentSupported: srvc.isTileIntentSupported(oCatalogTile)
                        };
                    }.bind(this)
                );

            // Fill tile info for current catalog
            this.oModel.setProperty(sPath, $.merge((bAppend && this.oModel.getProperty(sPath)) || [], aUpdatedCatalogTiles));
        },

        /**
         * Calculate the index of a catalog tile in the catalog page.
         *  @param the index of the catalog
         *  @param the number of catalog tiles that were already loaded for previous catalog/s with the same title
         *  @param the index of the current catalog tile in the containing catalog
         */
        calculateCatalogTileIndex : function (catalogIndex, numberOfExistingTiles, iTile) {
            var result = parseInt(catalogIndex * 100000, 10);
            result += (numberOfExistingTiles !== undefined ? numberOfExistingTiles : 0) +  iTile;
            return result;
        },

        mapCatalogTilesToGroups: function () {

            this.oTileCatalogToGroupsMap = {};

            //Calculate the relation between the CatalogTile and the instances.
            var oGroups = this.oModel.getProperty("/groups"),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                indexGrps = 0,
                oGroup,
                tileInd,
                oTiles,
                tileId,
                tileGroups,
                groupId;

            for (indexGrps = 0; indexGrps < oGroups.length; indexGrps++) {
                oGroup = oGroups[indexGrps];
                oTiles = oGroup.tiles;
                if (oTiles) {
                    for (tileInd = 0; tileInd < oTiles.length; ++tileInd) {
                        tileId = encodeURIComponent(srvc.getCatalogTileId(oTiles[tileInd].object));
                        tileGroups = this.oTileCatalogToGroupsMap[tileId] || [];
                        groupId = srvc.getGroupId(oGroup.object);
                        // We make sure the group is visible and not locked, otherwise we should not put it in the map it fills.
                        if (tileGroups.indexOf(groupId) === -1 && (typeof (oGroup.isGroupVisible) === 'undefined' || oGroup.isGroupVisible) && !oGroup.isGroupLocked) {
                            tileGroups.push(groupId);
                        }
                        this.oTileCatalogToGroupsMap[tileId] = tileGroups;
                    }
                }
            }
        },

        /**
         * Shows a localized message in the Message-Toast.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         * @param {sap.ushell.services.Message.Type} [iType=sap.ushell.services.Message.Type.INFO]
         *      The message type (optional)
         */
        _showLocalizedMessage: function (sMsgId, oParams, iType) {
            sap.ushell.Container.getService("Message").show(iType || sap.ushell.services.Message.Type.INFO, getLocalizedText(sMsgId, oParams), oParams);
        },
        /**
         * Shows a localized error message in the Message-Toast.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         *
         */
        _showLocalizedError: function (sMsgId, oParams) {
            this._showLocalizedMessage(sMsgId, oParams, sap.ushell.services.Message.Type.ERROR);
        },

        /**
         * A wrapper for _showLocalizedError to reduce boilerplate code in error handling.
         * @param {string} sMsgId
         *      The localization id of the message
         * @param {object} oParams
         *      Additional parameters for the Message Toast showing the message. Can be undefined.
         * @returns {Function}
         *      A function that will call _showLocalizedError with the given parameters.
         */
        _showLocalizedErrorHelper: function (sMsgId, oParams) {
            var that = this;
            return function () {
                that._showLocalizedError(sMsgId, oParams);
            };
        },

        /**
         * Helper function to bind an error message to a reset-function, which reloads all groups
         * from a group array when called.
         * @param {string} sMsgId
         *      The id of the localized string.
         * @returns {Function}
         *      The reset function, which returns the dashboard into an consistent state.
         */
        _resetGroupsOnFailureHelper: function (sMsgId) {
            var that = this;
            return function (aGroups) {
                that._showLocalizedError(sMsgId);
//                that._requestFailed();

                // Give the Toast a chance to be shown before the reload freezes the screen.
                setTimeout(function () {
                    that.loadGroupsFromArray(aGroups);
                });
            };
        },

        /**
         * Helper function to reset groups after a backend failure.
         * @param {string} sMsgId
         *      The id of the localized string.
         */
        _resetGroupsOnFailure: function (sMsgId, aParameters) {
            this._requestFailed();
            this._showLocalizedError(sMsgId, aParameters);
            this.loadPersonalizedGroups();
            this.oModel.updateBindings(true);
        },

        resetGroupsOnFailure: function () {
            this._resetGroupsOnFailure.apply(this, arguments);
        },

        /**
         * Load all groups in the given array. The default group will be loaded first.
         * @param aGroups
         *      The array containing all groups (including the default group).
         */
        loadGroupsFromArray: function (aGroups) {
            var that = this;

            this.oPageBuilderService.getDefaultGroup().done(function (oDefaultGroup) {
                // In case the user has no groups
                if (aGroups.length == 0 && oDefaultGroup == undefined) {
                    return;
                }
                var i = 0,
                    lockedGroups = [],
                    buildSortedGroups,
                    indexOfDefaultGroup = aGroups.indexOf(oDefaultGroup),
                    numOfLockedGroup,
                    oNewGroupModel,
                    aNewGroups = [],
                    oGroup,
                    isLocked,
                    groupLength,
                    modelGroupsLength;

                // remove default group from array
                aGroups.splice(indexOfDefaultGroup, 1);

                while (i < aGroups.length) {
                    oGroup = aGroups[i];
                    isLocked = that.oPageBuilderService.isGroupLocked(oGroup);

                    if (isLocked) {
                        lockedGroups.push(oGroup);
                        aGroups.splice(i, 1);
                    } else {
                        i++;
                    }
                }

                numOfLockedGroup = lockedGroups.length;
                // sort only locked groups
                if (!that.oModel.getProperty('/disableSortedLockedGroups')) {
                    lockedGroups.sort(function (x, y) {
                        var xTitle = that.oPageBuilderService.getGroupTitle(x).toLowerCase(),
                            yTitle = that.oPageBuilderService.getGroupTitle(y).toLowerCase();
                        return xTitle < yTitle ? -1 : 1;
                    });
                }
                // bring back default group to array
                buildSortedGroups = lockedGroups;
                buildSortedGroups.push(oDefaultGroup);
                buildSortedGroups.push.apply(buildSortedGroups, aGroups);
                aGroups = buildSortedGroups;
                groupLength = aGroups.length;
                modelGroupsLength = that.oModel.getProperty("/groups/length");
                // save default group index
                that.oModel.setProperty("/groups/indexOfDefaultGroup", numOfLockedGroup);

                for (i = groupLength; i < modelGroupsLength; ++i) {
                    that._destroyGroupModel("/groups/" + i);
                }

                for (i = 0; i < groupLength; ++i) {
                    oNewGroupModel = that._getGroupModel(aGroups[i], i === numOfLockedGroup, i === groupLength - 1);
                    oNewGroupModel.index = i;
                    aNewGroups.push(oNewGroupModel);
                }

                that.oModel.setProperty('/groups', aNewGroups);
                //set new length in case there are less new groups
                that.oModel.setProperty("/groups/length", groupLength);

                if (that.oModel.getProperty('/currentState/stateName') === "catalog") {
                    // update the catalogTile's groups mapping, and update the catalogTile
                    // model if nedded only when in the catalog flow
                    that.mapCatalogTilesToGroups();
                    that.updateCatalogTilesToGroupsMap();
                }
            }).fail(that._resetGroupsOnFailureHelper("fail_to_get_default_group_msg"));
        },

        /**
         * Load all tiles in a group and add the group to the internal model.
         * @param nIndex
         *      The index at which the group should be added. 0 is reserved for the default group.
         * @param oGroup
         *      The group as it is returned by the UI2 services.
         */
        _loadGroup: function (nIndex, oGroup) {
            var that = this,
                sGroupPath = "/groups/" + nIndex,
                defaultGroupIndex = that.oModel.getProperty("/groups/indexOfDefaultGroup"),
                bIsLast = that.oModel.getProperty(sGroupPath).isLastGroup,
                sOldGroupId,
                oNewGroupModel;

            this._destroyGroupModel(sGroupPath);
            // Set group on model
            sOldGroupId = this.oModel.getProperty(sGroupPath + "/groupId");
            oNewGroupModel = this._getGroupModel(oGroup, nIndex === defaultGroupIndex, bIsLast);

            // If the group already exists, keep the id. The backend-handlers relay on the id staying the same.
            if (sOldGroupId) {
                oNewGroupModel.groupId = sOldGroupId;
            }

            oNewGroupModel.index = nIndex;
            this.oModel.setProperty(sGroupPath, oNewGroupModel);
        },

        _getGroupModel: function (oGroup, bDefault, bLast) {
            var srvc = this.oPageBuilderService,
                aGroupTiles = (oGroup && srvc.getGroupTiles(oGroup)) || [],
                aModelTiles = [],
                aModelLinks = [],
                i,
                isSortable,
                oModel = this.getModel();

            isSortable = oModel.getProperty("/personalization");

            // in a new group scenario we create the group as null at first.
            var isGroupLocked = oGroup && srvc.isGroupLocked(oGroup) ? true : false;

            for (i = 0; i < aGroupTiles.length; ++i) {
                var oTile = aGroupTiles[i],
                    sTileType = srvc.getTileType(oTile).toLowerCase(); //lowercase to make comparison easier
                if (sTileType === "tile") {
                    aModelTiles.push(this._getTileModel(aGroupTiles[i], isGroupLocked, sTileType));
                } else if (sTileType === "link") {
                    aModelLinks.push(this._getTileModel(aGroupTiles[i], isGroupLocked, sTileType));
                } else {
                    jQuery.sap.log.error("Unknown tile type: '" + sTileType + "'",
                        undefined,
                        "sap.ushell.components.flp.launchpad.DashboardManager"
                    );
                }
            }

            return {
                title: (bDefault && getLocalizedText("my_group")) ||
                    (oGroup && srvc.getGroupTitle(oGroup)) ||
                    "",
                object: oGroup,
                groupId: jQuery.sap.uid(),
                links: aModelLinks,
                tiles: aModelTiles,
                isDefaultGroup: bDefault || false,
                editMode: !oGroup /*&& isStateHome*/,
                isGroupLocked: isGroupLocked,
                removable: !oGroup || srvc.isGroupRemovable(oGroup),
                sortable: isSortable,
                isGroupVisible: !oGroup || srvc.isGroupVisible(oGroup),
                isEnabled: !bDefault, //Currently only default groups is considered as locked
                isLastGroup: bLast || false
            };
        },

        _addTileToGroup: function (sGroupPath, oTile) {
            var sTilePath = sGroupPath + "/tiles",
                iNumTiles = this.oModel.getProperty(sTilePath).length,
                srvc = this.oPageBuilderService,
                sTileType = srvc.getTileType(oTile);

            //Locked groups cannot be added with tiles, so the target group will not be locked, however just for safety we will check the target group locking state
            var isGroupLocked = this.oModel.getProperty(sGroupPath + "/isGroupLocked");
            this.oModel.setProperty(sTilePath + "/" + iNumTiles, this._getTileModel(oTile, isGroupLocked, sTileType));
        },

        _updateModelWithTileView: function (sTileUUID, oTileView) {
            var that = this;

            //add the tile view to the update queue
            this.tileViewUpdateQueue.push({uuid: sTileUUID, view: oTileView});

            /*
             in order to avoid many updates to the model we wait to allow
             other tile update to accumulate in the queue.
             therefore we clear the previous call to update the model
             and create a new one
             */
            if (this.tileViewUpdateTimeoutID) {
                clearTimeout(this.tileViewUpdateTimeoutID);
            }
            this.tileViewUpdateTimeoutID = setTimeout(function () {
                that.tileViewUpdateTimeoutID = undefined;
                /*
                 we wait with the update till the personalization operation is done
                 to avoid the rendering of the tiles during D&D operation
                 */
                that.oSortableDeferred.done(function () {
                    that._updateModelWithTilesViews();
                });
            }, 50);
        },

        _updateModelWithTilesViews: function () {
            var aGroups = this.oModel.getProperty("/groups"),
                aTiles,
                aLinks,
                oTileModel,
                oUpdatedTile,
                sSize,
                bTall,
                bLong,
                oReLayoutGroups = {};

            if (!aGroups) {
                return;
            }

            /*
             go over the tiles in the model and search for tiles to update.
             tiles are identified using uuid
             */
            for (var i = 0; i < aGroups.length; i = i + 1) {
                //group loop - get the groups tiles
                aTiles = aGroups[i].tiles;
                aLinks = aGroups[i].links;
                aTiles = aTiles.concat(aLinks);

                for (var j = 0; j < aTiles.length; j = j + 1) {
                    //group tiles loop - get the tile model
                    oTileModel = aTiles[j];
                    for (var q = 0; q < this.tileViewUpdateQueue.length; q++) {
                        //updated tiles view queue loop - check if the current tile was updated
                        oUpdatedTile = this.tileViewUpdateQueue[q];
                        if (oTileModel.uuid == oUpdatedTile.uuid) {
                            if (oUpdatedTile.view) {
                                /*
                                 if view is provided then we destroy the current content
                                 (TileState control) and set the tile view
                                 */
                                oTileModel.content[0].destroy();
                                oTileModel.content = [oUpdatedTile.view];
                                /*
                                 in some cases tile size can be different then the initial value
                                 therefore we read and set the size again
                                 */
                                sSize = this.oPageBuilderService.getTileSize(oTileModel.object);
                                bLong = ((sSize !== null) && (sSize === "1x2" || sSize === "2x2")) || false;
                                bTall = ((sSize !== null) && (sSize === "2x1" || sSize === "2x2")) || false;
                                //bLong = true;
                                //bTall = true;
                                if (oTileModel['long'] !== bLong || oTileModel.tall !== bTall) {
                                    oTileModel['long'] = bLong;
                                    oTileModel.tall = bTall;
                                    oReLayoutGroups[aGroups[i].groupId] = true;
                                }
                            } else {
                                //some error on getTileView, therefore we set the state to 'Failed'
                                oTileModel.content[0].setState("Failed");
                            }
                            break;
                        }
                    }
                }
            }

            //clear the update queue and set the model
            this.tileViewUpdateQueue = [];
            this.oModel.setProperty("/groups", aGroups);
            var oDashboardView = this.getDashboardView();
            if (!jQuery.isEmptyObject(oReLayoutGroups) && oDashboardView) {
                if (oDashboardView && oDashboardView.oDashboardGroupsBox) {
                    var aGroupsControl = oDashboardView.oDashboardGroupsBox.getGroups();
                    for (var sGroupId in oReLayoutGroups) {
                        for (var i = 0; i < aGroupsControl.length; i++) {
                            if (aGroupsControl[i].getGroupId() === sGroupId) {
                                sap.ushell.Layout.reRenderGroupLayout(aGroupsControl[i]);
                                break;
                            }
                        }
                    }
                }
            }
        },

        getModelTileById: function (sId) {
            var aGroups = this.oModel.getProperty('/groups'),
                oModelTile;
            aGroups.forEach(function (oGroup) {
                oGroup.tiles.forEach(function (oTile) {
                    if (oTile.uuid === sId || oTile.originalTileId === sId) {
                        oModelTile = oTile;
                        return;
                    }
                });
            });
            return oModelTile;
        },

        _getTileModel: function (oTile, isGroupLocked, sTileType) {
            var srvc = this.oPageBuilderService,
                sTileUUID = jQuery.sap.uid(),
                oTileView,
                fUpdateModelWithView,
                that = this,
                oDfd,
                oTileModelData;

            this.sTileType = sTileType;

            // first we set visibility of tile to false
            // before we get the tile's model etc.
            srvc.setTileVisible(oTile, false);

            oDfd = srvc.getTileView(oTile);

            /*
             register done and fail handlers for the getTileView API.
             */
            oDfd.done(function (oView) {
                oTileView = oView;
                if (fUpdateModelWithView) {
                    //call to the '_updateModelWithTileView' with uuid and view
                    fUpdateModelWithView.apply(that, [sTileUUID, oTileView]);
                }
            });
            oDfd.fail(function () {
                if (fUpdateModelWithView) {
                    //call to the '_updateModelWithTileView' with uuid and no view to indicate failure
                    fUpdateModelWithView.apply(that, [sTileUUID]);
                } else {
                    jQuery.sap.require('sap.ushell.ui.launchpad.TileState');
                    // in case call is synchronise we set the view with 'TileState' control with 'Failed' status
                    if (that.sTileType === "link") {
                        oTileView = new sap.m.Link({text: sap.ushell.resources.i18n.getText('cannotLoadTile')});
                    } else {
                        oTileView = new sap.ushell.ui.launchpad.TileState({state: "Failed"});
                    }
                }
            });

            /*
             in case getTileView is asynchronous we set the 'fUpdateModelWithView' to handle the view
             update, and create a 'Loading' TileState control as the tile view
             */
            if (!oTileView) {
                fUpdateModelWithView = this._updateModelWithTileView;
                jQuery.sap.require('sap.ushell.ui.launchpad.TileState');
                oTileView = new sap.ushell.ui.launchpad.TileState({state: "Loading"});
            }

            if (sTileType === "link") {
                oTileModelData = {
                    "object": oTile,
                    "originalTileId": srvc.getTileId(oTile),
                    "uuid": sTileUUID,
                    "tileCatalogId": encodeURIComponent(srvc.getCatalogTileId(oTile)),
                    "content": [oTileView],
                    "target": srvc.getTileTarget(oTile) || "",
                    "debugInfo": srvc.getTileDebugInfo(oTile),
                    "isTileIntentSupported": srvc.isTileIntentSupported(oTile),
                    "isLocked": isGroupLocked
                };
            } else if (sTileType === "tile"){
                var sSize = srvc.getTileSize(oTile);

                oTileModelData = {
                    "object": oTile,
                    "originalTileId": srvc.getTileId(oTile),
                    "uuid": sTileUUID,
                    "tileCatalogId": encodeURIComponent(srvc.getCatalogTileId(oTile)),
                    "content": [oTileView],
                    "long": ((sSize !== null) && (sSize === "1x2" || sSize === "2x2")) || false,
                    "tall": ((sSize !== null) && (sSize === "2x1" || sSize === "2x2")) || false,
                    "target": srvc.getTileTarget(oTile) || "",
                    "debugInfo": srvc.getTileDebugInfo(oTile),
                    "isTileIntentSupported": srvc.isTileIntentSupported(oTile),
                    "rgba": "",
                    "isLocked": isGroupLocked,
                    "showActionsIcon": this.oModel.getProperty("/tileActionsIconEnabled") || false
                };
            }
            return oTileModelData;
        },

        _destroyAllGroupModels: function (oTarget) {
            var aGroups = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (aGroups) {
                for (i = 0; i < aGroups.length; i = i + 1) {
                    this._destroyGroupModel(aGroups[i]);
                }
            }
        },

        _destroyGroupModel: function (oTarget) {
            var oGroupModel = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget;
            if (oGroupModel) {
                this._destroyAllTileModels(oGroupModel.tiles);
            }
        },

        _destroyAllTileModels: function (oTarget) {
            var aTiles = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (aTiles) {
                for (i = 0; i < aTiles.length; i = i + 1) {
                    this._destroyTileModel(aTiles[i]);
                }
            }
        },

        _destroyTileModel: function (oTarget) {
            var oTileModel = (typeof oTarget === "string") ? this.oModel.getProperty(oTarget) : oTarget,
                i;
            if (oTileModel && oTileModel.content) {
                for (i = 0; i < oTileModel.content.length; i = i + 1) {
                    oTileModel.content[i].destroy();
                }
            }
        },

        /**
         * Load all user groups from the backend. (Triggered on initial page load.)
         */
        loadPersonalizedGroups: function () {
            var that = this,
                oGroupsPromise = this.oPageBuilderService.getGroups(),
                oDeferred = new jQuery.Deferred();

            oGroupsPromise.done(function (aGroups) {
                that.loadGroupsFromArray(aGroups);
                oDeferred.resolve();
            });

            oGroupsPromise.fail(function() {
                that._showLocalizedErrorHelper("fail_to_load_groups_msg");
                oDeferred.reject();
            });

            return oDeferred;
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/PagingManager.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, setTimeout, window */
    /*jslint plusplus: true, nomen: true, bitwise: true */

    jQuery.sap.declare("sap.ushell.components.flp.launchpad.PagingManager");
    sap.ui.base.EventProvider.extend("sap.ushell.components.flp.launchpad.PagingManager", {
        metadata : {
            publicMethods : ["setElementClass", "setContainerSize", "getNumberOfAllocatedElements", "moveToNextPage", "getTileHeight"]
        },
        constructor : function (sId, mSettings) {
            //make this class only available once
//            if (sap.ushell.components.flp.launchpad.getPagingManager && sap.ushell.components.flp.launchpad.getPagingManager()) {
//                return sap.ushell.components.flp.launchpad.getPagingManager();
//            }
            sap.ushell.components.flp.launchpad.getPagingManager = jQuery.sap.getter(this.getInterface());
            this.currentPageIndex = 0;
            this.containerHeight = mSettings.containerHeight || 0;
            this.containerWidth = mSettings.containerWidth || 0;
            this.ElementClass = mSettings.elementClassName || "";
            this.tileHeight = 0;
        },
        getTileHeight : function () {
            return this.tileHeight;
        },
        setElementClass : function (sClassName) {
            this.ElementClass = sClassName;
        },

        setContainerSize : function (nHeight, nWidth) {
            var totalNumberAllocatedTiles = this.getNumberOfAllocatedElements();
            this.containerHeight = nHeight;
            this.containerWidth = nWidth;
            this._changePageSize(totalNumberAllocatedTiles);
        },

        getNumberOfAllocatedElements : function () {
            return this._calcElementsPerPage() * this.currentPageIndex;
        },

        _changePageSize: function (totlaNumberAllocateedTiles) {
            this.currentPageIndex = Math.ceil(totlaNumberAllocateedTiles / this._calcElementsPerPage());
        },

        moveToNextPage : function () {
            this.currentPageIndex++;
        },

        _calcElementsPerPage : function () {
            var oElement = jQuery("<div>").addClass(this.ElementClass);
            jQuery('body').append(oElement);
            var elementHeight = oElement.height();
            var elementWidth = oElement.width();

            if (elementHeight < 100 || elementWidth < 100) {
                elementWidth = 100;
                elementHeight = 100;
            }

            var elementsPerRow = Math.round(this.containerWidth / elementWidth),
                elementsPerColumn = Math.round(this.containerHeight / elementHeight);
            this.tileHeight = elementHeight;

            oElement.remove();
            if (!elementsPerRow || !elementsPerColumn || elementsPerColumn === Infinity || elementsPerRow === Infinity || elementsPerColumn === 0 || elementsPerRow === 0) {
                return 10;
            }
            return elementsPerRow * elementsPerColumn;
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/catalog/Catalog.controller.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, $, sap, window */
    /*jslint nomen: true */

    sap.ui.controller("sap.ushell.components.flp.launchpad.catalog.Catalog", {
        oPopover: null,
        onInit: function () {
            sap.ui.getCore().getEventBus().subscribe("showCatalogEvent", this.onShow, this);
            sap.ui.getCore().byId("catalogSelect").addEventDelegate({
                onBeforeRendering : this.onBeforeSelectRendering
            }, this);
            var oRouter = this.getView().parentComponent.getRouter();
            oRouter.attachRoutePatternMatched(this.onShow.bind(this));
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("showCatalogEvent", this.onShow);
            /*this.getView().aDanglingControls.forEach(function (oControl) {
                oControl.destroy();
            });*/
        },

        onBeforeRendering: function () {
            //Invoking loading of all catalogs here instead of 'onBeforeShow' as it improves the perceived performance.
            //Fix of incident#:1570469901
            sap.ui.getCore().getEventBus().publish("showCatalog");
            //set initial focus
            setTimeout(function () {
                jQuery('#catalogSelect').focus();
            }, 0);
        },

        onAfterRendering: function () {
            // disable swipe gestures -> never show master in Portait mode
            var oModel = this.getView().getModel(),
                aCurrentCatalogs = oModel.getProperty('/catalogs'),
                that = this;
            //check if the catalogs were already loaded, if so, we don't need the loading message
            if (!aCurrentCatalogs.length) {

                //add the loading message right after the catalog is rendered
                oModel.setProperty('/catalogs', [{
                    title: sap.ushell.resources.i18n.getText('catalogsLoading'),
                    "static": true,
                    tiles: [],
                    numIntentSupportedTiles : -1//only in order to present this option in the Catalog.view (dropdown menu)since there is a filter there on this property
                }]);
                oModel.setProperty('/catalogsNoDataText', sap.ushell.resources.i18n.getText('loadingTiles'));

            } else if (aCurrentCatalogs[0].title != sap.ushell.resources.i18n.getText('catalogsLoading')) {
                oModel.setProperty('/catalogsNoDataText', sap.ushell.resources.i18n.getText('noFilteredItems'));
            }

            if (!this.PagingManager) {
                this.lastCatalogId = 0;
                jQuery.sap.require("sap.ushell.components.flp.launchpad.PagingManager");
                this.PagingManager = new sap.ushell.components.flp.launchpad.PagingManager('catalogPaging', {
                    elementClassName: 'sapUshellTile',
                    containerHeight: window.innerHeight,
                    containerWidth: window.innerWidth
                });
            }

            //just the first time
            if (this.PagingManager.currentPageIndex === 0) {
                that.allocateNextPage();
            }

            jQuery("#catalogTilesPage-cont").scroll(function () {
                var oPage = sap.ui.getCore().byId('catalogTilesPage'),
                    scroll = oPage.getScrollDelegate(),
                    currentPos = scroll.getScrollTop(),
                    max = scroll.getMaxScrollTop();

                if (max - currentPos <= 30 + that.PagingManager.getTileHeight()) {
                    that.allocateNextPage();
                }
            });
            jQuery(window).resize(function () {
                var windowWidth = $(window).width(),
                    windowHeight = $(window).height();

                that.PagingManager.setContainerSize(windowWidth, windowHeight);
                that.resetPageFilter();
                that.applyTileFilters();
            });
        },

        onShow: function (oEvent) {
            //if the user goes to the catalog directly (not via the dashboard)
            //we must close the loading dialog
            var hashTag,
                oModel = this.getView().getModel(),
                aCatalogTiles = oModel.getProperty("/catalogTiles") || [],
                sDataParam = oEvent.getParameter('arguments').filters,
                oDataParam = sDataParam ? JSON.parse(sDataParam) : sDataParam,
                sPath = (oDataParam && decodeURIComponent(oDataParam.targetGroup)) || "",
                i;
            $.extend(this.getView().getViewData(), oEvent);
            if (this.PagingManager) {
                this.resetPageFilter();
            }

            this.categoryFilter = (oDataParam && oDataParam.catalogSelector && oDataParam.catalogSelector) || null;
            this.searchFilter = (oDataParam && oDataParam.tileFilter && oDataParam.tileFilter) || null;
            hashTag = (oDataParam && oDataParam.tagFilter && oDataParam.tagFilter) || "";

            sPath = sPath === 'undefined' ? undefined : sPath;
            this._updateModelWithGroupContext(sPath);

            if (hashTag) {
                try {
                    this.tagFilter = JSON.parse(hashTag);
                } catch (e) {
                    this.tagFilter = [];
                }
            } else {
                this.tagFilter = [];
            }
            if (this.tagFilter) {
                oModel.setProperty("/selectedTags", this.tagFilter);
            }
            oModel.setProperty("/showCatalogHeaders", true);
            oModel.setProperty("/catalogSearchFilter", this.searchFilter);

            for (i = 0; i < aCatalogTiles.length; i = i + 1) {
                aCatalogTiles[i].active = false;
            }

            if (this.categoryFilter || this.searchFilter) {
                // selected category does not work with data binding
                // we need to rerender it manually and then set the selection
                // see function onBeforeSelectRendering
                sap.ui.getCore().byId("catalogSelect").rerender();
            } else {
                //display all
                sap.ui.getCore().byId("catalogSelect").setSelectedItemId("");
            }

            this.oRenderingFilter = new sap.ui.model.Filter('', 'EQ', 'a');
            this.oRenderingFilter.fnTest = function (val) {
                if (val.catalogIndex <= this.lastCatalogId) {
                    return true;
                }

                if (this.allocateTiles > 0) {
                    this.lastCatalogId = val.catalogIndex;
                    this.allocateTiles--;
                    return true;
                }

                return false;
            }.bind(this);

            if (this.PagingManager) {
                this.applyTileFilters();
            }
        },
        resetPageFilter : function () {
            this.lastCatalogId = 0;
            this.allocateTiles = this.PagingManager.getNumberOfAllocatedElements();
        },
        allocateNextPage : function () {
            if (!this.allocateTiles || this.allocateTiles === 0) {
                //calculate the number of tiles in the page.
                this.PagingManager.moveToNextPage();
                this.allocateTiles = this.PagingManager._calcElementsPerPage();
                this.applyTileFilters();
            }
        },

        onBeforeSelectRendering : function () {
            var oSelect = sap.ui.getCore().byId("catalogSelect"),
                aItems = jQuery.grep(oSelect.getItems(), jQuery.proxy(function (oItem) {
                    return oItem.getBindingContext().getObject().title === this.categoryFilter;
                }, this));

            if (!aItems.length) {
                aItems.push(oSelect.getItemAt(0));
            }

            if (aItems[0] && oSelect.getSelectedItemId() !== aItems[0].getId()) {
                window.setTimeout($.proxy(oSelect.setSelectedItem, oSelect, aItems[0].getId()), 500);
            }
        },

        setTagsFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : this.categoryFilter,
                tileFilter : this.searchFilter,
                tagFilter : aFilter,
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {filters: JSON.stringify(oParameterObject)}, true);
        },

        setCategoryFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : aFilter,
                tileFilter : this.searchFilter,
                tagFilter: JSON.stringify(this.tagFilter),
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {filters : JSON.stringify(oParameterObject)}, true);
        },

        setSearchFilter : function (aFilter) {
            var oParameterObject = {
                catalogSelector : this.categoryFilter,
                tileFilter : aFilter,
                tagFilter: JSON.stringify(this.tagFilter),
                targetGroup : encodeURIComponent(this.getGroupContext())
            };
            this.getView().parentComponent.getRouter().navTo('catalog', {'filters' : JSON.stringify(oParameterObject)});
        },

       /**
        * Returns the group context path string as kept in the model
        *
        * @returns {string} Group context
        */
        getGroupContext :  function () {
            var oModel = this.getView().getModel(),
                sGroupContext = oModel.getProperty("/groupContext/path");

            return sGroupContext ? sGroupContext : "";
        },

        applyTileFilters : function () {
            var aFilters = [],
                otagFilter,
                oSearchFilter,
                oCategoryFilter,
                sCatalogTitle;
            if (this.tagFilter) {
                otagFilter = new sap.ui.model.Filter('tags', 'EQ', 'v');
                otagFilter.fnTest = function (oTags) {
                    var ind, filterByTag;
                    if (this.tagFilter.length === 0) {
                        return true;
                    }

                    for (ind = 0; ind < this.tagFilter.length; ind++) {
                        filterByTag = this.tagFilter[ind];
                        if (oTags.indexOf(filterByTag) === -1) {
                            return false;
                        }
                    }
                    return true;
                }.bind(this);

                aFilters.push(otagFilter);
            }

            if (this.searchFilter) {
                oSearchFilter = new sap.ui.model.Filter($.map(this.searchFilter.split(/[\s,]+/), function (v) {
                    return (v && new sap.ui.model.Filter("keywords", sap.ui.model.FilterOperator.Contains, v)) ||
                        (v && new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, v)) || undefined;
                }), true);
                aFilters.push(oSearchFilter);
            }
            if (this.categoryFilter) {
                sCatalogTitle = this.categoryFilter;

                // Filtering the catalog tiles  according to catalog title (and not catalog ID)  
                oCategoryFilter = new sap.ui.model.Filter("catalog", sap.ui.model.FilterOperator.EQ, sCatalogTitle);
                aFilters.push(oCategoryFilter);
            }
            //Anyway we would like to filter out tiles which are not supported on current device
            aFilters.push(new sap.ui.model.Filter("isTileIntentSupported", sap.ui.model.FilterOperator.EQ, true));

            //Adding the page filter.
            if (this.oRenderingFilter) {
                aFilters.push(this.oRenderingFilter);
            }

            sap.ui.getCore().byId("catalogTiles").getBinding("tiles").filter(aFilters);
        },

        onLiveFilter : function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            if (sQuery) {
                this.setSearchFilter(sQuery);
            } else {
                this.setSearchFilter();
            }
        },

        onTagsFilter : function (oEvent) {
            var selectedItem = oEvent.getParameters("selectedItem").changedItem,
                selected = oEvent.getParameter("selected"),
                selectedTagsList = [],
                selectedTag = selectedItem.getText();

            if (this.tagFilter) {
                selectedTagsList = this.tagFilter;
            }

            if (selected) {
                selectedTagsList.push(selectedTag);
            } else {
                selectedTagsList = selectedTagsList.filter(function (entry) {
                    return entry !== selectedTag;
                });
            }
            this.setTagsFilter(selectedTagsList.length > 0 ? JSON.stringify(selectedTagsList) : "");
        },

        onCategoryFilter : function (oEvent) {
            var oSource = oEvent.getParameter("selectedItem"),
                oSourceContext = oSource.getBindingContext(),
                oModel = oSourceContext.getModel();
            if (oModel.getProperty("static", oSourceContext)) { // show all categories
                oModel.setProperty("/showCatalogHeaders", true);
                this.setCategoryFilter();
                this.selectedCategory = undefined;
            } else { // filter to category
                oModel.setProperty("/showCatalogHeaders", false);
                this.setCategoryFilter(oSource.getBindingContext().getObject().title);
                this.selectedCategory = oSource.getId();
            }
        },

        onTileAfterRendering : function (oEvent) {
            var footItem = oEvent.getSource().getFootItems()[0];
            if (footItem !== undefined) {
                footItem.addStyleClass("sapUshellCatalogPlusIcon");
            }
        },

        catalogTilePress : function (oController) {
            sap.ui.getCore().getEventBus().publish("launchpad", "catalogTileClick");
        },

        /**
         * Event handler triggered if tile should be added to the default group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the tile to add.
         */
        onTileFooterClick : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                that = this,
                oModel = this.getView().getModel(),
                oOkBtn,
                oCancelBtn,
                placement,
                clickedObject = oEvent.oSource,
                clickedObjectDomRef = clickedObject.getDomRef(),
                oPopoverData = this.createPopoverData(oEvent),
                oPopoverModel = new sap.ui.model.json.JSONModel(oPopoverData.userGroupList),
                iPopoverDataSectionHeight = 192,
                sGroupModelPath = oModel.getProperty("/groupContext/path"),
                oList,
                oPopoverContainer,
                oNewGroupParts;

            // Check if the catalog was opened in the context of a group, according to the groupContext ("/groupContext/path") in the model
            if (sGroupModelPath) {
                this._handleTileFooterClickInGroupContext(oSourceContext, sGroupModelPath);

            // If the catalog wasn't opened in the context of a group - the action of clicking a catalog tile should open the groups popover
            } else {
                oList = this._createPopoverGroupList(oPopoverData);

                oPopoverContainer = this._setPopoverContainer(iPopoverDataSectionHeight);
                oNewGroupParts = this._createNewGroupUiElements(oPopoverContainer, iPopoverDataSectionHeight);

                oPopoverContainer.addContent(oNewGroupParts.newGroupItemList);
                oPopoverContainer.addContent(oList);

                if (document.body.clientHeight - clickedObjectDomRef.getBoundingClientRect().bottom >= 310) {
                    placement = "Bottom";
                } else {
                    placement = "Auto";
                }

                this.oPopover = new sap.m.ResponsivePopover({
                    id : "groupsPopover",
                    placement : placement,
                    content : [oPopoverContainer],
                    enableScrolling : true,
                    title: sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"),
                    contentWidth: '20rem',
                    afterClose: function () {
                        oNewGroupParts.newGroupItemList.destroy();
                        oNewGroupParts.newGroupNameInput.destroy();
                        oOkBtn.destroy();
                        oCancelBtn.destroy();
                        oPopoverContainer.destroy();
                        that.oPopover.destroy();
                        that.oPopover = null;
                    }
                });

                if (!sap.ui.Device.system.phone) {
                    this.oPopover.setContentHeight(iPopoverDataSectionHeight + "px");
                } else {
                    this.oPopover.setContentHeight("100%");
                }

                oOkBtn = this._createOkButton(oSourceContext, oPopoverModel, oPopoverData, that, that.oPopover, oNewGroupParts.newGroupNameInput);
                oCancelBtn = this._createCancelButton(that.oPopover);

                this.oPopover.setBeginButton(oOkBtn);
                this.oPopover.setEndButton(oCancelBtn);
                this.oPopover.setInitialFocus('newGroupItem');
                this.oPopover.openBy(clickedObject);
            }
        },

        _getCatalogTileIndexInModel : function (oSourceContext) {
            var tilePath = oSourceContext.sPath,
                tilePathPartsArray = tilePath.split("/"),
                tileIndex = tilePathPartsArray[tilePathPartsArray.length - 1];

            return tileIndex;
        },

        _handleTileFooterClickInGroupContext : function (oSourceContext, sGroupModelPath) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                oModel = this.getView().getModel(),
                catalogTile = this.getCatalogTileDataFromModel(oSourceContext),
                aAssociatedGroups = catalogTile.tileData.associatedGroups,
                oGroupModel = oModel.getProperty(sGroupModelPath), // Get the model of the group according to the group's model path (e.g. "groups/4") 
                sGroupId = oLaunchPageService.getGroupId(oGroupModel.object),
                iCatalogTileInGroup = $.inArray(sGroupId, aAssociatedGroups),
                tileIndex = this._getCatalogTileIndexInModel(oSourceContext),
                oGroupContext,
                oAddTilePromise,
                oRemoveTilePromise,
                sTileCataogId,
                groupIndex,
                that = this;

            if (catalogTile.isBeingProcessed) {
                return;
            }
            oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', true);
            // Check if this catalog tile already exist in the relevant group 
            if (iCatalogTileInGroup == -1) {
                oGroupContext = new sap.ui.model.Context(oSourceContext.getModel(), sGroupModelPath);
                oAddTilePromise = this._addTile(oSourceContext, oGroupContext);

                // Function createTile of Dashboard manager always calls defferred.resolve, 
                // and the success/failure indicator is the returned data.status
                oAddTilePromise.done(function (data) {
                    if (data.status == 1) {
                        that._groupContextOperationSucceeded(oSourceContext, catalogTile, oGroupModel, true);
                    } else {
                        that._groupContextOperationFailed(catalogTile, oGroupModel, true);
                    }
                });
                oAddTilePromise.always(function () {
                    oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', false);
                });

            } else {
                sTileCataogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id;
                groupIndex = sGroupModelPath.split('/')[2];
                oRemoveTilePromise = this._removeTile(sTileCataogId, groupIndex);

                // Function deleteCatalogTileFromGroup of Dashboard manager always calls defferred.resolve, 
                // and the success/failure indicator is the returned data.status
                oRemoveTilePromise.done(function (data) {
                    if (data.status == 1) {
                        that._groupContextOperationSucceeded(oSourceContext, catalogTile, oGroupModel, false);
                    } else {
                        that._groupContextOperationFailed(catalogTile, oGroupModel, false);
                    }
                });
                oRemoveTilePromise.always(function () {
                    oModel.setProperty('/catalogTiles/' + tileIndex + '/isBeingProcessed', false);
                });
            }
        },

        _createPopoverGroupList : function (oPopoverData) {
            var aUserGroupsFilters = [],
                oPopoverModel,
                oList = new sap.m.List({
                    mode : sap.m.ListMode.MultiSelect,
                    includeItemInSelection: true
                }),
                oListItemTemplate = new sap.m.DisplayListItem({
                    label : "{title}",
                    selected : "{selected}",
                    tooltip: "{title}",
                    type: sap.m.ListType.Active
                }),
                that = this;

            oList.addEventDelegate({
                onsapup: function (oEvent) {
                    try {
                        oEvent.preventDefault();

                        if (that.getView().getModel().getProperty("/groups/length")) {
                            var jqNewGroupItem,
                                currentFocusGroup = jQuery(":focus");
                            if (currentFocusGroup.index() == 0) {   //first group in the list
                                jqNewGroupItem = jQuery("#newGroupItem");
                                jqNewGroupItem.focus();
                                oEvent._bIsStopHandlers = true;
                            }
                        }
                    } catch (e) {
                    }
                }
            });

            // In case the list item (representing a group) is clicked by the user - change the checkbox's state
            oList.attachItemPress(function (oEvent) {
                var clickedListItem = oEvent.getParameter('listItem'),
                    srcControl = oEvent.getParameter('srcControl'),
                    bSelected;

                if (srcControl.getMetadata().getName() === 'sap.m.CheckBox') {
                    bSelected = clickedListItem.isSelected();
                    srcControl.setSelected(!bSelected);
                    clickedListItem.setSelected(!bSelected);
                }
            });

            aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupLocked", sap.ui.model.FilterOperator.EQ, false));
            if (this.getView().getModel().getProperty('/enableHideGroups')) {
                aUserGroupsFilters.push(new sap.ui.model.Filter("isGroupVisible", sap.ui.model.FilterOperator.EQ, true));
            }
            oList.bindItems("/", oListItemTemplate, null, aUserGroupsFilters);
            oPopoverModel = new sap.ui.model.json.JSONModel(oPopoverData.userGroupList);
            oList.setModel(oPopoverModel);

            return oList;
        },

        _setPopoverContainer : function (popoverDataSectionHeight) {
            var popoverContainerId = "popoverContainer",
                popoverContainer = new sap.m.ScrollContainer({
                    id: popoverContainerId,
                    horizontal : false,
                    vertical : true
                });

            if (!sap.ui.Device.system.phone) {
                popoverContainer.setHeight((popoverDataSectionHeight - 2) + "px");
            } else {
                popoverContainer.setHeight("100%");
            }

            return popoverContainer;
        },

        _createNewGroupUiElements : function (oPopoverContainer, iPopoverDataSectionHeight) {
            var oModel = this.getView().getModel(),
                oNewGroupNameInput,
                oBackButton,
                oNewGroupLabel,
                oHeadBar,
                oNewGroupItem,
                oNewGroupItemList,
                that = this;

            oNewGroupNameInput = new sap.m.Input({
                id : "newGroupNameInput",
                type : "Text",
                placeholder : sap.ushell.resources.i18n.getText("new_group_name")
            });

            // new group panel - back button
            oBackButton = new sap.m.Button({
                icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                press : function (oEvent) {
                    that.oPopover.removeAllContent();

                    if (!sap.ui.Device.system.phone) {
                        that.oPopover.setContentHeight(iPopoverDataSectionHeight + "px");
                    } else {
                        that.oPopover.setContentHeight("100%");
                    }

                    that.oPopover.setVerticalScrolling(true);
                    that.oPopover.addContent(oPopoverContainer);
                    that.oPopover.setTitle(sap.ushell.resources.i18n.getText("addTileToGroups_popoverTitle"));
                    that.oPopover.setCustomHeader();

                    oNewGroupNameInput.enabled = false;
                    oNewGroupNameInput.setValue('');
                },
                tooltip : sap.ushell.resources.i18n.getText("newGroupGoBackBtn_tooltip")
            });
            oBackButton.addStyleClass("sapUshellCatalogNewGroupBackButton");

            // new group panel's label
            oNewGroupLabel = new sap.m.Label({
                text : sap.ushell.resources.i18n.getText("newGroup_popoverTitle")
            });

            // new group panel's header
            oHeadBar = new sap.m.Bar({
                contentLeft : [oBackButton],
                contentMiddle : [oNewGroupLabel]
            });

            // popover container Item - "New Group"
            oNewGroupItem = new sap.m.StandardListItem({
                id : "newGroupItem",
                title : sap.ushell.resources.i18n.getText("newGroup_listItemText"),
                type : "Navigation",
                press : function () {
                    that._navigateToCreateNewGroupPanel(that.oPopover, oNewGroupNameInput, oHeadBar);
                }
            });

            oNewGroupItemList = new sap.m.List({});

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oNewGroupItem.addStyleClass('help-id-newGroupItem');// xRay help ID
            }
            oNewGroupItemList.addItem(oNewGroupItem);
            oNewGroupItemList.addEventDelegate({
                onsapdown: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        if (that.getView().getModel().getProperty("/groups/length")) {
                            var jqFirstGroupListItem = jQuery("#popoverContainer .sapMListModeMultiSelect li").first();
                            jqFirstGroupListItem.focus();
                        }
                    } catch (e) {
                    }
                },
                onsaptabnext: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        var jqOkButton = jQuery("#okButton");
                        jqOkButton.focus();
                    } catch (e) {
                    }
                }
            });

            return {
                newGroupItemList : oNewGroupItemList,
                newGroupNameInput : oNewGroupNameInput
            };
        },

        _createOkButton : function (oSourceContext, oPopoverModel, popoverData, oGeneralScope, oPopover, oNewGroupNameInput, oHeadBar) {
            var oOkBtn = new sap.m.Button({
                id : "okButton",
                press : function (oEvent) {

                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;
                    /*eslint-disable consistent-this*/
                    var oUserSelection,
                        tileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id,
                        sGroupNameFromInput = oNewGroupNameInput.getValue().trim(),
                        aPromises = [],
                        oPressHandlerScope = this;
                    /*eslint-enable consistent-this*/
                    // Analyze user selection
                    oUserSelection = oGeneralScope._handlePopoverGroupsSelection(oPopoverModel, tileCatalogId, oSourceContext, popoverData, aPromises, oGeneralScope);

                    // In case the user chose to create a new group and opened the new group creation panel
                    if (oNewGroupNameInput.enabled) {
                        oUserSelection = oGeneralScope._handleNewGroupCreationPanel(oGeneralScope, oSourceContext, sGroupNameFromInput, aPromises, oUserSelection);
                    }

                    // After the promise objects of all the actions (i.e. add/remove tile from group) were gathered into an array - 
                    // they should be processed
                    jQuery.when.apply(jQuery, aPromises).then(
                        function () {
                            oGeneralScope._handlePopoverGroupsActionPromises(oGeneralScope, oPressHandlerScope, oSourceContext, popoverData, oUserSelection, arguments);
                        }
                    );

                    oPopover.close();

                }.bind(oPopoverModel),
                text : sap.ushell.resources.i18n.getText("okBtn")
            });

            oOkBtn.addEventDelegate({
                onsaptabprevious: function(oEvent) {
                    try {
                        oEvent.preventDefault();
                        oEvent._bIsStopHandlers = true;
                        var jqNewGroupItem = jQuery("#newGroupItem");
                        if (!jqNewGroupItem.length) {
                            jqNewGroupItem = jQuery("#newGroupNameInput input");
                        }
                        jqNewGroupItem.focus();
                    } catch (e) {
                    }
                }
            });

            return oOkBtn;
        },

        _createCancelButton : function (oPopover) {
            return new sap.m.Button({
                id : "cancelButton",
                press : function (oEvent) {
                    oEvent.preventDefault();
                    oEvent._bIsStopHandlers = true;
                    oPopover.close();
                },
                text : sap.ushell.resources.i18n.getText("cancelBtn")
            });
        },

        _handlePopoverGroupsSelection : function (oPopoverModel, tileCataogId, oSourceContext, popoverData, promises, oGeneralScope) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                groupsIdTitleMap = {},
                oGroupContext,
                tempGroup,
                realGroupID,
                index,
                oUserSelection = {
                    selectedGroupsIDsArray : [],
                    numberOfAddedGroups : 0,
                    numberOfRemovedGroups : 0,
                    firstAddedGroupTitle : "",
                    firstRemovedGroupTitle : ""
                };

            for (index = 0; index < popoverData.userGroupList.length; index = index + 1) {
                tempGroup = oPopoverModel.oData[index];
                realGroupID = oLaunchPageService.getGroupId(tempGroup.object);
                // Add the real group Id and title to the map
                //  in order to support the detailed message that follows the user group selection
                groupsIdTitleMap[realGroupID] = tempGroup.title;

                if (tempGroup.selected) {
                    oUserSelection.selectedGroupsIDsArray.push(realGroupID);
                    oGroupContext = new sap.ui.model.Context(oSourceContext.getModel(), "/groups/" + index);
                    if (!oPopoverModel.oData[index].initiallySelected) {
                        promises.push(oGeneralScope._addTile(oSourceContext, oGroupContext));
                        oPopoverModel.oData[index].initiallySelected = true;
                        oUserSelection.numberOfAddedGroups = oUserSelection.numberOfAddedGroups + 1;
                        if (oUserSelection.numberOfAddedGroups == 1) {
                            oUserSelection.firstAddedGroupTitle = tempGroup.title;
                        }
                    }
                } else if ((!tempGroup.selected) && (oPopoverModel.oData[index].initiallySelected)) {
                    promises.push(oGeneralScope._removeTile(tileCataogId, index));
                    oPopoverModel.oData[index].initiallySelected = false;
                    oUserSelection.numberOfRemovedGroups = oUserSelection.numberOfRemovedGroups + 1;
                    if (oUserSelection.numberOfRemovedGroups == 1) {
                        oUserSelection.firstRemovedGroupTitle = tempGroup.title;
                    }
                }
            }
            return oUserSelection;
        },

        _handlePopoverGroupsActionPromises : function (oGeneralScope, oPressHandlerScope, oSourceContext, popoverData, oUserSelection, aPromiseArguments) {

            if (!(oUserSelection.numberOfAddedGroups == 0 && oUserSelection.numberOfRemovedGroups == 0)) {
                var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                    isOperationFailed = false,
                    isNewGroupAdded = false,
                    aErrorIndexes = [],
                    index,
                    sDetailedMessage;

                for (index = 0; index < aPromiseArguments.length && (!isOperationFailed || !isNewGroupAdded); index++) {
                    // check if tile was added to the new group successfully
                    if (aPromiseArguments[index].action == "addTileToNewGroup" && aPromiseArguments[index].status == 1) {
                        var tempGroup = oPressHandlerScope.oData[oPressHandlerScope.oData.length - 1],
                            realGroupID = oLaunchPageService.getGroupId(tempGroup.object);
                        oUserSelection.selectedGroupsIDsArray.push(realGroupID);
                        isNewGroupAdded = true;
                    }
                    // Check if the operation failed
                    //  The Data (i.e. aPromiseArguments[index]) for each operation includes:
                    //   - group: The relevant group object
                    //   - status: A boolean value stating if the operation succeeded of failed
                    //   - action: A String with the value 'add' or 'remove' or 'createNewGroup'
                    if (!aPromiseArguments[index].status) {
                        isOperationFailed = true;
                        aErrorIndexes.push(aPromiseArguments[index]);
                    }
                }
                if (isOperationFailed) {
                    var oErrorMessageObj = oGeneralScope.prepareErrorMessage(aErrorIndexes, popoverData.tileTitle),
                        dashboardMgr = sap.ushell.components.flp.launchpad.DashboardManager();

                    dashboardMgr.resetGroupsOnFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);

                } else {
                    // Update the model with the changes
                    oSourceContext.getModel().setProperty("/catalogTiles/" + popoverData.tileIndex + "/associatedGroups", oUserSelection.selectedGroupsIDsArray);

                    // Get the detailed message
                    sDetailedMessage = oGeneralScope.prepareDetailedMessage(popoverData.tileTitle, oUserSelection.numberOfAddedGroups, oUserSelection.numberOfRemovedGroups, oUserSelection.firstAddedGroupTitle, oUserSelection.firstRemovedGroupTitle);

                    sap.m.MessageToast.show( sDetailedMessage, {
                        duration: 3000,// default
                        width: "15em",
                        my: "center bottom",
                        at: "center bottom",
                        of: window,
                        offset: "0 -50",
                        collision: "fit fit"
                    });
                }
            }
        },

        /**
         * Handles success of add/remove tile action in group context.
         * Updates the model and shows an appropriate message to the user.
         *  
         * @param {object} oSourceContext
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array 
         * @param {object} oGroupModel - The model of the relevant group  
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationSucceeded : function (oSourceContext, oCatalogTileModel, oGroupModel, bTileAdded) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                sGroupId = oLaunchPageService.getGroupId(oGroupModel.object),
                aAssociatedGroups = oCatalogTileModel.tileData.associatedGroups,
                detailedMessage,
                i;

            // Check if this is an "add tile to group" action
            if (bTileAdded) {
                // Update the associatedGroups array of the catalog tile
                aAssociatedGroups.push(sGroupId);

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty("/catalogTiles/" + oCatalogTileModel.tileIndex + "/associatedGroups", aAssociatedGroups);

                detailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 1, 0, oGroupModel.title, "");

            } else {
                // If this is a "remove tile from group" action

                // Update the associatedGroups array of the catalog tile
                for (i in aAssociatedGroups) {
                    if (aAssociatedGroups[i] == sGroupId) {
                        aAssociatedGroups.splice(i, 1);
                        break;
                    }
                }

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty("/catalogTiles/" + oCatalogTileModel.tileIndex + "/associatedGroups", aAssociatedGroups);
                detailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 0, 1, "", oGroupModel.title);
            }

            sap.m.MessageToast.show(detailedMessage, {
                duration: 3000,// default
                width: "15em",
                my: "center bottom",
                at: "center bottom",
                of: window,
                offset: "0 -50",
                collision: "fit fit"
            });
        },

        /**
         * Handles failure of add/remove tile action in group context.
         * Shows an appropriate message to the user and reloads the groups.
         *
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         */
        _groupContextOperationFailed : function (oCatalogTileModel, oGroupModel, bTileAdded) {
            var dashboardMgr = sap.ushell.components.flp.launchpad.getDashboardManager(),
                oErrorMessage;

            if (bTileAdded) {
                oErrorMessage = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title]});
            } else {
                oErrorMessage = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title]});
            }

            dashboardMgr.resetGroupsOnFailure(oErrorMessage.messageId, oErrorMessage.parameters);
        },

        _handleNewGroupCreationPanel : function (oGeneralScope, oSourceContext, sGroupNameFromInput, aPromises, oUserSelection) {
            var sNewGroupName,
                sEmptyGroupName = sap.ushell.resources.i18n.getText("new_group_name");

            if (sGroupNameFromInput.length > 0) {
                sNewGroupName = sGroupNameFromInput;
            } else {
                sNewGroupName = sEmptyGroupName;
            }

            aPromises.push(oGeneralScope._createGroupAndSaveTile(oSourceContext, sNewGroupName));
            oUserSelection.numberOfAddedGroups++;
            oUserSelection.firstAddedGroupTitle = sNewGroupName;

            return oUserSelection;
        },

        _navigateToCreateNewGroupPanel : function (oPopover, oNewGroupNameInput, oHeadBar) {

            oPopover.removeAllContent();
            oPopover.addContent(oNewGroupNameInput.addStyleClass("sapUshellCatalogNewGroupInput"));
            oPopover.setCustomHeader(oHeadBar);
            oPopover.setContentHeight("");
            oNewGroupNameInput.setValueState(sap.ui.core.ValueState.None);
            oNewGroupNameInput.setPlaceholder(sap.ushell.resources.i18n.getText("new_group_name"));
            oNewGroupNameInput.enabled = true;
            setTimeout(function () {
                oNewGroupNameInput.focus();
            }, 0);
        },

        prepareErrorMessage : function (aErroneousActions, sTileTitle) {
            var oGroup,
                sAction,
                sFirstErroneousAddGroup,
                sFirstErroneousRemoveGroup,
                iNumberOfFailAddActions = 0,
                iNumberOfFailDeleteActions = 0,
                bCreateNewGroupFailed = false,
                message;

            for (var index in aErroneousActions) {

                // Get the data of the error (i.e. action name and group object)

                oGroup = aErroneousActions[index].group;
                sAction = aErroneousActions[index].action;

                if (sAction == 'add') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else if (sAction == 'remove') {
                    iNumberOfFailDeleteActions++;
                    if (iNumberOfFailDeleteActions == 1) {
                        sFirstErroneousRemoveGroup = oGroup.title;
                    }
                } else if (sAction == 'addTileToNewGroup') {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions == 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else {
                    bCreateNewGroupFailed = true;
                }
            }
            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length == 1) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_create_new_group"});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length == 1) {
                if (iNumberOfFailAddActions) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_group", parameters: [sTileTitle, sFirstErroneousAddGroup]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_group", parameters: [sTileTitle, sFirstErroneousRemoveGroup]});
                }
                // 	Many errors (iErrorCount > 1) - it can be several remove actions, or several add actions, or a mix of both
            } else {
                if (iNumberOfFailDeleteActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_add_to_several_groups", parameters: [sTileTitle]});
                } else if (iNumberOfFailAddActions == 0) {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_remove_from_several_groups", parameters: [sTileTitle]});
                } else {
                    message = sap.ushell.resources.i18n.getText({messageId: "fail_tile_operation_some_actions"});
                }
            }
            return message;
        },

        prepareDetailedMessage : function (tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle) {
            var message;

            if (numberOfAddedGroups == 0) {
                if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups == 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups > 1) {
                if (numberOfRemovedGroups == 0) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups]);
                } else if (numberOfRemovedGroups == 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    message = sap.ushell.resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups, numberOfRemovedGroups]);
                }
            }
            return message;
        },

        /**
         * Returns an object that contains:
         *  - An array of user groups, each one contains a "selected" property
         *  - An array ID's of the groups that contain the relevant Tile
         *
         * @param {sap.ui.base.Event} oEvent
         */
        createPopoverData : function (oEvent) {
            var oSource = oEvent.getSource(),
                oSourceContext = oSource.getBindingContext(),
                srvc = sap.ushell.Container.getService("LaunchPage"),
                index,
                model,
                path,
                tileTitle,
                realGroupID,

            // The popover basically contains an entry for each user group
                userGroupList = oSourceContext.getModel().getProperty("/groups"),

            // the relevant Catalog Tile form the model: e.g. /catalogTiles/5
                catalogTile = this.getCatalogTileDataFromModel(oSourceContext),

            // e.g. /catalogTiles/5/associatedGroups
                tileGroups = catalogTile.tileData.associatedGroups,

            // g.e. 5
                tileIndex = catalogTile.tileIndex;

            // In order to decide which groups (in the popover) will be initially selected:
            for (index = 0; index < userGroupList.length; index = index + 1) {

                // Get the group's real ID
                realGroupID = srvc.getGroupId(userGroupList[index].object);

                // Check if the group (i.e. real group ID) exists in the array of groups that contain the relevant Tile
                // if so - the check box that re[resents this group should be initially selected
                userGroupList[index].selected = !($.inArray(realGroupID, tileGroups) == -1);

                // In order to know if the group was selected before user action
                userGroupList[index].initiallySelected = userGroupList[index].selected;
            }
            path = oSourceContext.getPath(0);
            model = oSourceContext.getModel();
            tileTitle = model.getProperty(path).title;

            return {userGroupList : userGroupList, catalogTile : catalogTile, tileTitle : tileTitle, tileIndex : tileIndex};
        },

        /**
         * Returns the part of the model that contains the IDs of the groups that contain the relevant Tile
         *
         * @param {} oSourceContext
         *     model context
         */
        getCatalogTileDataFromModel : function (oSourceContext) {
            var tileIndex = this._getCatalogTileIndexInModel(oSourceContext),
                oModel = oSourceContext.getModel(),
                oTileData = oModel.getProperty("/catalogTiles/" + tileIndex);

            // Return an object containing the Tile in the CatalogTiles Array (in the model) ,its index and whether it's in the middle of add/removal proccess.
            return {
                tileData: oTileData,
                tileIndex: tileIndex,
                isBeingProcessed: oTileData.isBeingProcessed ? true : false
            };
        },

        /**
         * Event handler triggered if tile should be added to a specified group.
         *
         * @param {sap.ui.base.Event} oEvent
         *     the event object. It is expected that the binding context of the event source points to the group. Also,
         *     the event must contain a "control" parameter whose binding context points to the tile.
         */
        onAddTile : function (oEvent) {
            var oSourceContext = oEvent.getParameter("control").getBindingContext();
            if (!oSourceContext.getProperty("active")) {
                this._addTile(oSourceContext, oEvent.getSource().getBindingContext());
            }
        },

        onNavButtonPress : function (oEvent) {
            this.getView().parentComponent.getRouter().navTo('home');
        },

        /**
         * Update the groupContext part of the model with the path and ID of the context group, if exists
         *
         * @param {string} sPath - the path in the model of the context group, or empty string if no context exists
         */
        _updateModelWithGroupContext : function (sPath) {
            var oLaunchPageService = sap.ushell.Container.getService("LaunchPage"),
                oModel  = this.getView().getModel(),
                oGroupModel,
                oGroupContext = {
                    path : sPath,
                    id : "",
                    title : ""
                };

            // If sPath is defined and is different than empty string - set the group context id.
            // The recursive call is needed in order to wait until groups data is inserted to the model
            if (sPath && sPath !== "") {
                var timeoutGetGroupDataFromModel = function () {
                    var aModelGroups = oModel.getProperty("/groups");
                    if (aModelGroups.length) {
                        oGroupModel = oModel.getProperty(sPath);
                        oGroupContext.id = oLaunchPageService.getGroupId(oGroupModel.object);
                        oGroupContext.title = oGroupModel.title || oLaunchPageService.getGroupTitle(oGroupModel.object);
                        return;
                    }
                    setTimeout(timeoutGetGroupDataFromModel, 100);
                };
                timeoutGetGroupDataFromModel();
            }
            oModel.setProperty("/groupContext", oGroupContext);
        },
        
        /**
         * Send request to add a tile to a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param {sap.ui.model.Context} oGroupContext
         *     the group where the tile should be added
         * @private
         */
        _addTile : function (oTileContext, oGroupContext) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.createTile({
                    catalogTileContext : oTileContext,
                    groupContext: oGroupContext
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to delete a tile from a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param tileCatalogId
         *     the id of the tile
         * @param index
         *     the index of the group in the model
         * @private
         */
        _removeTile : function (tileCatalogId, index) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.deleteCatalogTileFromGroup({
                    tileId : tileCatalogId,
                    groupIndex : index
                });

            // The function deleteCatalogTileFromGroup always results in deferred.resolve
            // and the actual result of the action (success/failure) is contained in the data object
            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        },

        /**
         * Send request to create a new group and add a tile to this group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext
         *     the catalog tile to add
         * @param newGroupName
         *     the name of the new group where the tile should be added
         * @private
         */
        _createGroupAndSaveTile : function (oTileContext, newGroupName) {
            var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager(),
                deferred = jQuery.Deferred(),
                promise = oDashboardManager.createGroupAndSaveTile({
                    catalogTileContext : oTileContext,
                    newGroupName: newGroupName
                });

            promise.done(function(data){
                deferred.resolve(data);
            });

            return deferred;
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/catalog/Catalog.view.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, $ */
    /*jslint nomen: true */

    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ushell.ui.launchpad.Tile");
    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");
    jQuery.sap.require("sap.ushell.ui.launchpad.Panel");

    sap.ui.jsview("sap.ushell.components.flp.launchpad.catalog.Catalog", {

        oController: null,

        createContent: function (oController) {
            this.parentComponent = sap.ui.core.Component.getOwnerComponentFor(this);
            var oModel = this.parentComponent.getModel();
            this.setModel(oModel);
            this.oController = oController;
            this.addEventDelegate({
                onAfterShow: function () {
                    var homeBtn = sap.ui.getCore().byId("homeBtn");
                    if (homeBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.addHeaderItem(homeBtn, "home");
                    }
                },
                onBeforeShow: function () {
                    oModel.setProperty("/currentViewName", "catalog");
                    //hide header in mobile
                    var isMobile = sap.ui.Device.system.phone;
                    sap.ushell.renderers.fiori2.RendererExtensions.setHeaderHiding(isMobile);
                    //Close left panel if it is opened
                    sap.ushell.renderers.fiori2.RendererExtensions.setLeftPaneVisibility("home", false);

                },

                onAfterHide: function () {
                    var homeBtn = sap.ui.getCore().byId("homeBtn");
                    if (homeBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.removeHeaderItem(homeBtn, "home");
                    }
                }
            });

            function iflong(sLong) {
                return ((sLong !== null) && (sLong === "1x2" || sLong === "2x2")) || false;
            }
            function iftall(size) {
                return ((size !== null) && (size === "2x2" || size === "2x1")) || false;
            }
            function to_int(v) {
                return parseInt(v, 10) || 0;
            }
            function get_icon(aGroupsIDs, sGroupContextModelPath, sGroupContextId) {
                var sIconName;

                if (sGroupContextModelPath) {

                   // If in group context - the icon is determined according to whether this catalog tile exists in the group or not   
                    var iCatalogTileInGroup = $.inArray(sGroupContextId, aGroupsIDs);
                    sIconName = iCatalogTileInGroup !== -1 ? "accept" : "add";
                } else {
                    sIconName = (aGroupsIDs && aGroupsIDs.length > 0) ? "accept" : "add";
                }
                return sap.ui.core.IconPool.getIconURI(sIconName);
            }

            function get_tooltip(sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
                var sTooltip;

                if (sGroupContextModelPath) {
                    var oResourceBundle = sap.ushell.resources.i18n,
                        iCatalogTileInGroup = $.inArray(sGroupContextId, aGroupsIDs);

                    sTooltip = oResourceBundle.getText(iCatalogTileInGroup !== -1 ? "removeAssociatedTileFromContextGroup" : "addAssociatedTileToContextGroup", sGroupContextTitle);
                } else {
                    sTooltip = aGroupsIDs && aGroupsIDs.length ? sAddTileToMoreGroups : sAddTileGroups;
                }
                return sTooltip;
            }

            var oButton = new sap.m.Button({
                icon : {
                    // The "parts" array includes /groupContext/path and associatedGroups/length in order to support tile footer icon change in two cases:
                    //  1. When the catalog is in the context of a group, and the user navigates back to the dashboard  
                    //      and then opens the catalog again, but this time not in a context of a group.
                    //      In this case the footer icons should be changed  and the trigger is the change in /groupContext property in the model.    
                    //  2. When the catalog is in the context of a group, and the user clicks a tile's footer.
                    //     In this case the icon should be changed, and the trigger is the item that is added/removed to/from associatedGroups 
                    //     (i.e. the change in the length of associatedGroups of the relevant catalog tile model)
                    parts: ["associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id"],
                    formatter : function (aAssociatedGroups, associatedGroupsLength, sGroupContextModelPath, sGroupContextId) {
                        return get_icon(aAssociatedGroups, sGroupContextModelPath, sGroupContextId);
                    }
                },
                tooltip: {
                    parts: ["i18n>addTileToGroup", "i18n>addAssociatedTileToGroup", "associatedGroups", "associatedGroups/length", "/groupContext/path", "/groupContext/id", "/groupContext/title"],
                    formatter : function (sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, associatedGroupsLength, sGroupContextModelPath, sGroupContextId, sGroupContextTitle) {
                        return get_tooltip(sAddTileGroups, sAddTileToMoreGroups, aGroupsIDs, sGroupContextModelPath, sGroupContextId, sGroupContextTitle);
                    }
                },
                press : [ oController.onTileFooterClick, oController ]
            }), oTileTemplate = new sap.ushell.ui.launchpad.Tile({
                afterRendering : [ oController.onTileAfterRendering, oController ],
                tileViews : {
                    path : "content",
                    factory : function (sId, oContext) { return oContext.getObject(); }
                },
                footItems : [oButton],
                "long" : {
                    path : "size",
                    formatter : iflong
                },
                "tall" : {
                    path : "size",
                    formatter : iftall
                },
                index: {
                    path : "id",
                    formatter : to_int
                },
                tileCatalogId : "{id}",
                press : [ oController.catalogTilePress, oController ]
            }), tilesContainer = new sap.ushell.ui.launchpad.TileContainer("catalogTiles", {
                showHeader : false,
                showPlaceholder : false,
                showGroupHeader : "{/showCatalogHeaders}",
                noDataText: "{/catalogsNoDataText}",
                groupHeaderLevel : sap.m.HeaderLevel.H3,
                showNoData : true,
                tiles : {
                    path : "/catalogTiles",
                    template : oTileTemplate,
                    sorter : new sap.ui.model.Sorter("catalogIndex", false, function (oContext) {
                        return (oContext && oContext.getProperty("catalog")) || "";
                    })
                },
                afterRendering : function (oEvent) {
                    var oModel = this.getModel(),
                        buttons,
                        i;
                    //because the catalog can be loaded with a filter in the URL we also have to
                    //check if tiles exist in the model, and not just in the UI control
                    if (this.getTiles().length || oModel.getProperty('/catalogTiles/length')) {
                        //Enable tiles search/filter only after tiles are rendered.
                        //Timeout needed because of some bug in UI5 that doesn't enable control on this point.
                        setTimeout(function () {
                            sap.ui.getCore().byId("catalogSearch").setEnabled(true);
                        });
                        oModel.setProperty("/catalogsNoDataText", sap.ushell.resources.i18n.getText('noFilteredItems'));
                        sap.ui.getCore().getEventBus().publish("launchpad", "contentRendered");
                        if (!sap.ui.Device.os.ios) {
                            sap.ui.getCore().getEventBus().publish("launchpad", "contentRefresh");
                        }
                    }
                    jQuery.sap.byId("catalogTiles").removeAttr("tabindex", 0);
                    jQuery.sap.byId("catalogTilesPage-intHeader-BarPH").removeAttr("tabindex", 0);

                    // disable '+/v' buttons tabindex so the won't be part of the TAB cycle
                    buttons = jQuery(".sapUshellTile button");
                    for (i = 0; i < buttons.length; i++) {
                        buttons[i].setAttribute("tabindex", -1);
                    }
                }
            });

            tilesContainer.addEventDelegate({
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var nextElement = jQuery("#catalogSelect");
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            });

            oButton.constructor.prototype.setIcon = function (v) {
                this.setProperty("icon", v, true);          // set property, but suppress rerendering
                if (v && this._image && this._image.setSrc) {
                    this._image.setSrc(v);                  // set property of internal control
                }
                return this;
            };

            var oFilterVisibleTiles = new sap.ui.model.Filter("numIntentSupportedTiles", sap.ui.model.FilterOperator.NE, 0),
                oCatalogSelect = new sap.m.Select("catalogSelect", {
                    visible: "{/catalogSelection}",
                    name : "Browse",
                    tooltip: "{i18n>catalogSelect_tooltip}",
                    width: "17rem",
                    items : {
                        path : "/catalogs",
                        template : new sap.ui.core.ListItem({
                            text : "{title}"
                        }),
                        filters: [oFilterVisibleTiles]
                    },
                    change : [ oController.onCategoryFilter, oController ]
                }),

            /*
             override original onAfterRendering as currently sap.m.Select
             does not support afterRendering handler in the constructor
             this is done to support tab order accessibility
             */
                origCatalogSelectOnAfterRendering = oCatalogSelect.onAfterRendering;
            oCatalogSelect.addEventDelegate({
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        firstTile.focus();
                    } catch (e) {
                    }
                },
                onsaptabprevious: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                },
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                }
            });
            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogSelect.addStyleClass('help-id-catalogCategorySelect');// xRay help ID
            }
            oCatalogSelect.onAfterRendering = function () {
                if (origCatalogSelectOnAfterRendering) {
                    origCatalogSelectOnAfterRendering.apply(this, arguments);
                }
                jQuery.sap.byId("catalogSelect").attr("tabindex", 0);
            };

            /*
             * setting followOf to false, so the popover won't close on IE.
             */
            var origOnAfterRenderingPopover = oCatalogSelect._onAfterRenderingPopover;
            oCatalogSelect._onAfterRenderingPopover = function () {
                if (this._oPopover) {
                    this._oPopover.setFollowOf(false);
                }
                if (origOnAfterRenderingPopover) {
                    origOnAfterRenderingPopover.apply(this, arguments);
                }
            };

            var oCatalogSearch = new sap.m.SearchField("catalogSearch", {
                    visible: "{/searchFiltering}",
                    tooltip: "{i18n>catalogSearch_tooltip}",
                    width: "17rem",
                    enabled: false, //we Disable search/filtering of tiles till they will be rendered, to avoid bugs.
                    value: {path: "/catalogSearchFilter"},
                    placeholder: "{i18n>search_catalog}",
                    liveChange : [ oController.onLiveFilter, oController ]
                }).addStyleClass("sapUshellCatalogSearch"),

                /*
                 override original onAfterRendering as currently sap.m.Select
                 does not support afterRendering handler in the constructor,
                 this is done to support tab order accessibility
                */
                origCatalogSearchOnAfterRendering = oCatalogSearch.onAfterRendering;

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogSearch.addStyleClass('help-id-catalogSearch');// xRay help ID
            }
            oCatalogSearch.onAfterRendering = function () {
                origCatalogSearchOnAfterRendering.apply(this, arguments);
                jQuery.sap.byId("catalogSearch").find("input").attr("tabindex", 0);
                //set as large element for F6 keyboard navigation
                this.data("sap-ui-fastnavgroup", "true", true /*Write into DOM*/);
            };

            oCatalogSearch.addEventDelegate({
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var nextElement = jQuery("#catalogTilesPage header button")[0];
                        nextElement.focus();
                    } catch (e) {
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(firstTile);
                    } catch (e) {
                    }
                },
                onsaptabnext: function (oEvent) {
                    try {
                        if (!oCatalogTagFilter.getVisible()) {
                            oEvent.preventDefault();
                            var aVisibleTiles = jQuery(".sapUshellTile:visible"),
                                jqTile = jQuery(aVisibleTiles[0]);
                            sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                            jqTile.focus();
                        }
                    } catch (e) {
                    }
                }
            });

            var oCatalogTagFilter = new sap.m.MultiComboBox("catalogTagFilter", {
                visible: "{/tagFiltering}",
                selectedKeys: {
                    path: "/selectedTags",
                    mode: sap.ui.model.BindingMode.TwoWay
                },
                tooltip: "{i18n>catalogTilesTagfilter_tooltip}",
                width: "17rem",
                placeholder: "{i18n>catalogTilesTagfilter_HintText}",
                //Use catalogs model as a demo content until the real model is implemented
                items : {
                    path : "/tagList",
                    sorter : new sap.ui.model.Sorter("tag", false, false),
                    template : new sap.ui.core.ListItem({
                        text : "{tag}",
                        key : "{tag}"
                    })
                },
                selectionChange : [ oController.onTagsFilter, oController ]
            });

            // if xRay is enabled
            if (oModel.getProperty("/enableHelp")) {
                oCatalogTagFilter.addStyleClass('help-id-catalogTagFilter');// xRay help ID
            }
            oCatalogTagFilter.addEventDelegate({
                onsaptabnext: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var aVisibleTiles = jQuery(".sapUshellTile:visible"),
                            jqTile = jQuery(aVisibleTiles[0]);
                        sap.ushell.components.flp.ComponentKeysHandler.setFocusOnCatalogTile();
                        jqTile.focus();
                    } catch (e) {
                    }
                },
                onsapskipback: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        jQuery("#catalogSelect").focus();
                    } catch (e) {
                    }
                },
                onsapskipforward: function (oEvent) {
                    try {
                        oEvent.preventDefault();
                        var firstTile = jQuery('#catalogTiles .sapUshellTile:visible:first');
                        sap.ushell.components.flp.ComponentKeysHandler.setTileFocus(firstTile);
                    } catch (e) {
                    }
                }
            });

            var oDetailPage = new sap.m.Page("catalogTilesPage", {
                showHeader : true,
                showFooter : false,
                showNavButton : true,
                title : {
                    parts : ["/groupContext/title"],
                    formatter : function (title) {
                        var oResourceBundle = sap.ushell.resources.i18n;
                        return !title ? oResourceBundle.getText("tile_catalog") : oResourceBundle.getText("catalog_group_context_title", title);
                    }
                },
                content : [ new sap.ushell.ui.launchpad.Panel({
                    translucent : true,
                    headerText : "",
                    headerLevel : sap.m.HeaderLevel.H2,
                    headerBar : new sap.m.Bar("catalogHeader", {
                        translucent : true,
                        tooltip: "{i18n>tile_catalog_header_tooltip}",
                        contentLeft : [ oCatalogSelect, oCatalogSearch, oCatalogTagFilter]
                    }).addStyleClass("sapUshellCatalogHeaderBar"),
                    content : [ tilesContainer]
                }).addStyleClass("sapUshellCatalogPage")],
                navButtonPress : [oController.onNavButtonPress, oController]
            });

            oDetailPage.addDelegate({
                onAfterRendering: function () {
                    //set initial focus
                    jQuery("#catalogTilesPage header button").attr("tabindex", -1);
                }
            });

            return oDetailPage;
        },

        getControllerName: function () {
            return "sap.ushell.components.flp.launchpad.catalog.Catalog";
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/dashboard/DashboardContent.controller.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, setTimeout, clearTimeout, $ */
    /*jslint plusplus: true, nomen: true */
    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");

    sap.ui.controller("sap.ushell.components.flp.launchpad.dashboard.DashboardContent", {

        onInit : function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            this.handleDashboardScroll = this._handleDashboardScroll.bind(this);

            oEventBus.subscribe('launchpad', 'actionModeInactive', this._handleExitActionMode, this);
            oEventBus.subscribe('launchpad', 'actionModeActive', this._enableGroupsUIActions, this.oView);
            oEventBus.subscribe("launchpad", "appClosed", this._resizeHandler, this);
            oEventBus.subscribe("launchpad", "appOpened", this._appOpenedHandler, this);

            this.sViewId = "#" + this.oView.getId();
            //On Android 4.x, and Safari mobile in Chrome and Safari browsers sometimes we can see bug with screen rendering
            //so _webkitMobileRenderFix function meant to fix it after  `contentRefresh` event.
            if (sap.ui.Device.browser.mobile) {
                oEventBus.subscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
            }
            this.isDesktop = (sap.ui.Device.system.desktop && (navigator.userAgent.toLowerCase().indexOf('tablet') < 0));
        },

        onExit: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("launchpad", "contentRefresh", this._webkitMobileRenderFix, this);
            oEventBus.unsubscribe("launchpad", "appClosed", this._resizeHandler, this);
            oEventBus.unsubscribe("launchpad", "appOpened", this._appOpenedHandler, this);
        },

        onAfterRendering : function () {
            var oEventBus = sap.ui.getCore().getEventBus(),
                oView = this.getView(),
                oDomRef = oView.getDomRef(),
                oScrollableElement = oDomRef.getElementsByTagName('section'),
                timer;

            oScrollableElement[0].removeEventListener('scroll', this.handleDashboardScroll);
            oScrollableElement[0].addEventListener('scroll', this.handleDashboardScroll);

            //Bind launchpad event handlers
            oEventBus.unsubscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.subscribe("launchpad", "scrollToGroup", this._scrollToGroup, this);
            oEventBus.unsubscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);
            oEventBus.subscribe("launchpad", "scrollToFirstVisibleGroup", this._scrollToFirstVisibleGroup, this);

            sap.ui.Device.orientation.attachHandler(function () {
                var jqTileContainers = jQuery('#dashboardGroups').find('.sapUshellTileContainer:visible');
                if (jqTileContainers.length) {
                    var oModel = this.getView().getModel(),
                        topViewPortGroupIndex = oModel.getProperty('/topGroupInViewPortIndex'),
                        oGroup,
                        bIsInEditTitle;
                    if (jqTileContainers.get(topViewPortGroupIndex)) {
                        oGroup = sap.ui.getCore().byId(jqTileContainers.get(topViewPortGroupIndex).id);
                        bIsInEditTitle = oModel.getProperty('/editTitle');
                        this._publishAsync("launchpad", "scrollToGroup", {group: oGroup, isInEditTitle: bIsInEditTitle});
                    }
                }
            }, this);

            jQuery(window).bind("resize", function () {
                clearTimeout(timer);
                timer = setTimeout(this._resizeHandler.bind(this), 300);
            }.bind(this));

            if (this.getView().getModel().getProperty("/personalization") && !sap.ushell.components.flp.ActionMode) {
                jQuery.sap.require("sap.ushell.components.flp.ActionMode");
                sap.ushell.components.flp.ActionMode.init(this.getView().getModel());
            }
            this._updateTopGroupInModel();
        },

        dashboardTilePress : function () {
            sap.ui.getCore().getEventBus().publish("launchpad", "dashboardTileClick");
        },

        _updateTopGroupInModel : function () {
            var oModel = this.getView().getModel(),
                topViewPortGroupIndex = this._getIndexOfTopGroupInViewPort();

            oModel.setProperty('/topGroupInViewPortIndex', topViewPortGroupIndex);
        },

        _getIndexOfTopGroupInViewPort : function () {
            var oView = this.getView(),
                oDomRef = oView.getDomRef(),
                oScrollableElement = oDomRef.getElementsByTagName('section'),
                jqTileContainers = $(oScrollableElement).find('.sapUshellTileContainer'),
                oOffset = jqTileContainers.not('.sapUshellHidden').first().offset(),
                firstContainerOffset = (oOffset && oOffset.top) || 0,
                aTileContainersTopAndBottoms = [],
                nScrollTop = oScrollableElement[0].scrollTop,
                viewPortTop,
                topGroupIndex = 0;

            // In some weird corner cases, those may not be defined -> bail out.
            if (!jqTileContainers || !oOffset) {
                return topGroupIndex;
            }

            jqTileContainers.each(function () {
                if (!jQuery(this).hasClass("sapUshellHidden")) {
                    var nContainerTopPos = jQuery(this).parent().offset().top;
                    aTileContainersTopAndBottoms.push([nContainerTopPos, nContainerTopPos + jQuery(this).parent().height() + jQuery(this).parent()[0].offsetTop]);
                }
            });

            viewPortTop = nScrollTop + firstContainerOffset;
            jQuery.each(aTileContainersTopAndBottoms, function (index, currentTileContainerTopAndBottom) {
                var currentTileContainerTop = currentTileContainerTopAndBottom[0],
                    currentTileContainerBottom = currentTileContainerTopAndBottom[1];

                if (currentTileContainerTop <= viewPortTop && viewPortTop <= currentTileContainerBottom) {
                    topGroupIndex = index;
                    return;
                }
            });
            return topGroupIndex;
        },

        _handleDashboardScroll : function () {
            this._updateTopGroupInModel();
            sap.ushell.utils.handleTilesVisibility();
            sap.ui.getCore().getEventBus().publish("launchpad", "dashboardScroll");
        },

        _handleClick : function () {
            //Enable text selection in other scenarios than drag-and-drop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

        },

        _handleActionModeStartDrag : function (evt, ui) {
            this.uiActions.disable();
            var groupContainerClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone"),
                groupContainerCloneTitle = groupContainerClone.find(".sapUshellContainerTitle"),
                titleHeight = groupContainerCloneTitle.height(),
                titleWidth = groupContainerCloneTitle.width();

            if (!sap.ui.Device.system.phone) {
                groupContainerClone.find(".sapUshellTileContainerEditMode").offset({
                    top: this.uiEditModeActions.getMove().y - titleHeight,
                    left: this.uiEditModeActions.getMove().x - (titleWidth / 2)
                });
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerHidden");
            } else {
                jQuery(".sapUshellTilesContainer-sortable").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");
            }
            jQuery(".sapUshellTileContainerAfterContent").addClass("sapUshellTileContainerHidden");

            jQuery(ui).find(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");

            this.getModel().setProperty('/isInDrag', true);
            jQuery(ui).attr('startPos', jQuery(ui).index());

            jQuery.sap.log.info('startPos - ' + jQuery(ui).index());
            setTimeout(function () {
                sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            }, 0);

            //scroll to group
            var groupsTop = jQuery("#dashboardGroups").offset().top,
                groupPlaceholder = jQuery(".sapUshellDashboardGroupsContainerItem-placeholder").offset().top,
                groupClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone").offset().top,
                scrollY = groupPlaceholder - groupsTop - groupClone;
            jQuery('.sapUshellDashboardView section').animate({scrollTop : scrollY}, 0);

        },

        _handleActionModeUIStart : function (evt, ui) {
            jQuery(ui).find(".sapUshellTileContainerContent").css("outline-color", "transparent");
            jQuery('body').addClass("sapUshellDisableUserSelect");
        },

        _handleActionModeDrop : function (evt, ui) {
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }

            var oBus = sap.ui.getCore().getEventBus(),
                jQueryObj = jQuery(ui),
                firstChildId = jQuery(jQueryObj.children()[0]).attr("id"),
                oGroup = sap.ui.getCore().byId(firstChildId),
                oDashboardGroups = sap.ui.getCore().byId("dashboardGroups"),
                oData = {group : oGroup, groupChanged : false, focus : false},
                nNewIndex = jQueryObj.index();

            jQueryObj.startPos = window.parseInt(jQueryObj.attr('startPos'), 10);
            oDashboardGroups.removeAggregation('groups', oGroup, true);
            oDashboardGroups.insertAggregation('groups', oGroup, nNewIndex, true);

            this.oController._handleActionModeGroupMove(evt, {item : jQueryObj});
            jQueryObj.removeAttr('startPos');
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStop");

            // avoid tile to be clicked after group was dropped
            setTimeout(function () {
                jQuery(".sapUshellContainerHeaderActions").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerAfterContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTilesContainer-sortable").removeClass("sapUshellTileContainerRemoveContent");
            }, 0);

            window.setTimeout(jQuery.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", oData), 1);
            this.uiActions.enable();
        },

        _handleActionModeGroupMove : function (evt, ui) {
            var fromIndex = ui.item.startPos,
                toIndex = ui.item.index(),
                oModel = this.getView().getModel();

            if (toIndex !== -1) {
                this._publishAsync("launchpad", "moveGroup", {
                    fromIndex  : fromIndex,
                    toIndex    : toIndex
                });
                setTimeout(function () {
                    oModel.setProperty('/isInDrag', false);
                }, 100);
            }
        },

        //Delete or Reset a given group according to the removable state.
        _handleGroupDeletion: function (oGroupBindingCtx) {
            jQuery.sap.require('sap.m.MessageBox');
            var oEventBus = sap.ui.getCore().getEventBus(),
                oGroup = oGroupBindingCtx.getObject(),
                bIsGroupRemovable = oGroup.removable,
                sGroupTitle = oGroup.title,
                sGroupId = oGroup.groupId,
                oResourceBundle = sap.ushell.resources.i18n,
                oMessageSrvc = sap.ushell.Container.getService("Message"),
                mActions = sap.m.MessageBox.Action,
                mCurrentAction = (bIsGroupRemovable ? mActions.DELETE : oResourceBundle.getText('ResetGroupBtn'));

            oMessageSrvc.confirm(oResourceBundle.getText(bIsGroupRemovable ? 'delete_group_msg' : 'reset_group_msg', sGroupTitle), function (oAction) {
                if (oAction === mCurrentAction) {
                    oEventBus.publish("launchpad", bIsGroupRemovable ? 'deleteGroup' : 'resetGroup', {
                        groupId: sGroupId
                    });
                }
            }, oResourceBundle.getText(bIsGroupRemovable ? 'delete_group' : 'reset_group'), [mCurrentAction, mActions.CANCEL]);
        },

        _enableGroupsUIActions: function () {
            if (this.uiEditModeActions) {
                this.uiEditModeActions.enable();
            }


        },

        _handleExitActionMode: function (ctx) {
            this.oView.uiEditModeActions.disable();
        },

        //force browser to repaint Body, by setting it `display` property to 'none' and to 'block' again
        _forceBrowserRerenderElement: function (element) {
            var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            if (animationFrame) {
                animationFrame(function () {
                    var display = element.style.display;
                    element.style.display = 'none';
                    element.offsetHeight;
                    element.style.display = display;
                });
            } else {
                jQuery.sap.log.info('unsupported browser for animation frame');
            }
        },

        //function fixes Android 4.x Chrome, and Safari bug with poor rendering
        _webkitMobileRenderFix: function () {
            //force Chrome to repaint Body, by setting it `display` property to 'none' and to 'block' again
            if (sap.ui.Device.browser.chrome || sap.ui.Device.os.android) {
                // this includes almost all browsers and devices
                // if this is the IOS6 (as the previous fix causes double flickering
                // and this one only one flickering)
                this._forceBrowserRerenderElement(document.body);
            }
        },

        _resizeHandler : function () {
            this._addBottomSpace();
            sap.ushell.utils.handleTilesVisibility();

            //Layout calculation is relevant only when the dashboard is presented
            var oNavContainerFlp = this.getView().getParent(),
                oCurrentViewName = oNavContainerFlp && oNavContainerFlp.getCurrentPage().getViewName(),
                bInDahsboard = oCurrentViewName == this.getView().getViewName();

            if (sap.ushell.Layout && bInDahsboard) {
                sap.ushell.Layout.reRenderGroupsLayout(null, true);
            }
        },

        _appOpenedHandler : function (sChannelId, sEventId, oData) {
            // checking if application component opened is not the FLP App Component (e.g. navigation to an app, not 'Home')
            // call to set all tiles visibility off (so no tile calls will run in the background)
            var oParentComponent = this.getOwnerComponent(), sParentName = oParentComponent.getMetadata().getComponentName();
            if (oData.additionalInformation.indexOf(sParentName) === -1) {
                sap.ushell.utils.setTilesNoVisibility();// setting no visibility on all visible tiles
            }
        },

        _addBottomSpace : function () {
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToFirstVisibleGroup : function (sChannelId, sEventId, oData) {
            var sGroupId,
                fromTop = 0,
                that = this;

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            if (oData.fromTop) {
                fromTop = oData.fromTop - 50;
            }

            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;

                    iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                    jQuery('.sapUshellDashboardView section').animate({scrollTop : iY - fromTop}, 0, that.fHandleScrollEnd);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    }

                    return false;
                }
            });
            sap.ushell.utils.addBottomSpace();
        },

        _scrollToGroup : function (sChannelId, sEventId, oData) {
            var sGroupId,
                that = this,
                oModel = this.getView().getModel();

            if (oData.group) {
                sGroupId = oData.group.getGroupId();
            } else {
                // in case of scroll after deletion, the oData contains only the groupId.
                sGroupId = oData.groupId;
            }

            // The model flag /scrollingToGroup indicates a scroll-to-group action currently occurs,
            oModel.setProperty("/scrollingToGroup", true);
            jQuery.each(this.oView.oDashboardGroupsBox.getGroups(), function (nIndex, oGroup) {
                if (oGroup.getGroupId() === sGroupId) {
                    var iY;
                    setTimeout(function () {
                        iY =  -1 * (document.getElementById('dashboardGroups').getBoundingClientRect().top) + document.getElementById(oGroup.sId).getBoundingClientRect().top;
                        jQuery('.sapUshellDashboardView section').animate({scrollTop : iY}, 500, that.fHandleScrollEnd);
                        if (oData.isInEditTitle) {
                            oGroup.setEditMode(true);
                        }
                    }, 300);

                    //on press event we need to set the group in focus
                    if (oData.group && oData.focus) {
                        jQuery.sap.byId(oGroup.sId).focus();
                    //    jQuery.sap.byId(oGroup.sId).addClass('sapUshellSelected');
                    }
                    //fix bottom space, if this a deletion scenario the 'oData.groupId' will return true
                    if (oData.groupId || oData.groupChanged) {
                        that._addBottomSpace();
                    }

                    jQuery('#groupList li')
                        .removeClass('sapUshellSelected')
                        .eq(nIndex).addClass('sapUshellSelected');

                    // Recalculate tiles visibility
                    sap.ushell.utils.handleTilesVisibility();

                    return false;
                }
            });
        },

        fHandleScrollEnd : function () {

            //Notify groupList
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("grouplist", "ScrollAnimationEnd");
        },

        /**
         *
         * @param event
         * @param ui : tile DOM Reference
         * @private
         */
        _handleDrop : function (event, ui) {
            //remove the disable-user-select class from body in case of desktop
            if (sap.ui.Device.system.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }
            var tileMoveInfo = sap.ushell.Layout.getLayoutEngine().layoutEndCallback(),
                oEventBus = sap.ui.getCore().getEventBus(),
                noRefreshSrc,
                noRefreshDst;

            if (!tileMoveInfo.tileMovedFlag) {
                return; //tile was not moved
            }
            noRefreshSrc = true;
            noRefreshDst = true; //Default - suppress re-rendering after drop
            //if src and destination groups differ - refresh src and dest groups
            //else if a tile has moved & dropped in a different position in the same group - only dest should refresh (dest == src)
            //if a tile was picked and dropped - but never moved - the previous if would have returned
            if ((tileMoveInfo.srcGroup !== tileMoveInfo.dstGroup)) {
                noRefreshSrc = noRefreshDst = false;
            } else if (tileMoveInfo.tile !== tileMoveInfo.dstGroup.getTiles()[tileMoveInfo.dstTileIndex]) {
                noRefreshDst = false;
            }
            tileMoveInfo.srcGroup.removeAggregation('tiles', tileMoveInfo.tile, noRefreshSrc);
            tileMoveInfo.dstGroup.insertAggregation('tiles', tileMoveInfo.tile, tileMoveInfo.dstTileIndex, noRefreshDst);

            oEventBus.publish("launchpad", "moveTile", {
                sTileId: tileMoveInfo.tile.getUuid(),
                toGroupId:  tileMoveInfo.dstGroup.getGroupId(),
                toIndex: tileMoveInfo.dstTileIndex
            });

            oEventBus.publish("launchpad", "sortableStop");
        },

        _publishAsync : function (sChannelId, sEventId, oData) {
            var oBus = sap.ui.getCore().getEventBus();
            window.setTimeout(jQuery.proxy(oBus.publish, oBus, sChannelId, sEventId, oData), 1);
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/dashboard/DashboardContent.view.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, document, self */
    /*jslint plusplus: true, nomen: true, vars: true */

    jQuery.sap.require("sap.ushell.ui.launchpad.TileContainer");
    jQuery.sap.require("sap.ushell.ui.launchpad.Tile");
    jQuery.sap.require("sap.ushell.override");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.Layout");

    sap.ui.jsview("sap.ushell.components.flp.launchpad.dashboard.DashboardContent", {

        createContent: function (oController) {
            this.bFirstRendering = true;
            this.bAnimate = false; //@todo alex, sap.ui.Device.system.desktop;
            this.isTouch = !sap.ui.Device.system.desktop;
            this.parentComponent = sap.ui.core.Component.getOwnerComponentFor(this);
            this.addStyleClass("sapUshellDashboardView");
            this.bTileContainersContentAdded = false;
            var oModel = this.parentComponent.getModel(),
                that = this;
            this.oModel = oModel;

            this.ieHtml5DnD = !!(oModel.getProperty("/personalization") && sap.ui.Device.browser.msie && sap.ui.Device.browser.version >= 11 &&
                (sap.ui.Device.system.combi || sap.ui.Device.system.tablet));
            this.oDashboardGroupsBox = this._getDashboardGroupsBox(oController, oModel);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "enterEditMode", this._addTileContainersContent, this);
            sap.ui.getCore().byId('navContainerFlp').attachAfterNavigate(this.onAfterNavigate, this);

            this.addEventDelegate({
                onAfterShow: function () {
                    //Add config button only if shell is running flp application
                    var sRoot = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration().rootIntent,
                        oConfigBtn;
                    if (sRoot === "Shell-home") {
                        oConfigBtn = sap.ui.getCore().byId("configBtn");
                        sap.ushell.renderers.fiori2.RendererExtensions.addHeaderItem(oConfigBtn, "home");
                    }
                },
                onBeforeFirstShow: function () {
                    var oDashboardManager = sap.ushell.components.flp.launchpad.getDashboardManager();
                    oDashboardManager.loadPersonalizedGroups();
                    that.onAfterNavigate();
                },
                onBeforeShow: function () {

                },
                onAfterHide: function (evt) {
                    //Remove config button
                    var configBtn = sap.ui.getCore().byId("configBtn");
                    if (configBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.removeHeaderItem(configBtn, "home");
                    }

                    //Remove action menu items
                    this.oHideGroupsButton = sap.ui.getCore().byId("hideGroupsBtn");
                    if (this.oHideGroupsButton) {
                        sap.ushell.Container.getRenderer("fiori2").hideActionButton([this.oHideGroupsButton.getId()], true);
                        sap.ushell.renderers.fiori2.RendererExtensions.removeOptionsActionSheetButton(this.oHideGroupsButton, "home");
                    }
                    this.oActionModeBtn = sap.ui.getCore().byId("ActionModeBtn");
                    if (this.oActionModeBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.removeOptionsActionSheetButton(this.oActionModeBtn, "home");
                    }

                    //Remove action mode floating button
                    var actionModeFloatingBtn = sap.ui.getCore().byId("floatingActionBtn");
                    if (actionModeFloatingBtn) {
                        sap.ushell.renderers.fiori2.RendererExtensions.removeFloatingActionButton(actionModeFloatingBtn, "home");
                        actionModeFloatingBtn.setVisible(false);
                    }
                }
            });
            var oPage = new sap.m.Page({
                showHeader: false,
                content: [this.oDashboardGroupsBox]
            });

            return [oPage];
        },

        onAfterNavigate: function(oEvent) {
            var oNavContainerFlp = sap.ui.getCore().byId('navContainerFlp'),
                oCurrentViewName = oNavContainerFlp.getCurrentPage().getViewName(),
                bInDashboard = oCurrentViewName == "sap.ushell.components.flp.launchpad.dashboard.DashboardContent";
            if (bInDashboard) {
                this.oModel.setProperty("/currentViewName", "home");
                sap.ushell.renderers.fiori2.RendererExtensions.setHeaderHiding(false);

                //Add action menu items
                this.oHideGroupsButton = sap.ui.getCore().byId("hideGroupsBtn");
                if (!this.oHideGroupsButton) {
                    this.oHideGroupsButton = sap.ushell.Container.getRenderer("fiori2").addActionButton("sap.ushell.ui.footerbar.HideGroupsButton", {
                        id: "hideGroupsBtn"
                    }, true, true);

                    this.oHideGroupsButton.setModel(this.oModel);
                    if (this.oModel.getProperty("/enableHelp")) {
                        this.oHideGroupsButton.addStyleClass('help-id-hideGroupsBtn');// xRay help ID
                    }
                    if (!this.oModel.getProperty('/enableHideGroups')) { //Decided to always add the button but in case the hideGroups feature is off- hide it.
                        this.oHideGroupsButton.setVisible(false);
                    }
                } else {
                    sap.ushell.Container.getRenderer("fiori2").showActionButton([this.oHideGroupsButton.getId()], true);
                }

                this.oActionModeBtn = sap.ui.getCore().byId("ActionModeBtn");
                if (this.oActionModeBtn) {
                    sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton(this.oActionModeBtn, "home");
                    if (this.oModel.getProperty('/actionModeMenuButtonEnabled')) {
                        this.oActionModeBtn.setVisible(true);
                    }
                }

                //Add action mode floating button
                this.oActionModeFloatingBtn = sap.ui.getCore().byId("floatingActionBtn");
                if (this.oActionModeFloatingBtn) {
                    sap.ushell.renderers.fiori2.RendererExtensions.addFloatingActionButton(this.oActionModeFloatingBtn, "home");
                    if (this.oModel.getProperty('/actionModeFloatingButtonEnabled')) {
                        this.oActionModeFloatingBtn.setVisible(true);
                    }
                }
            }
        },

        _addTileContainersContent : function () {
            if (!this.bTileContainersContentAdded) {
                var aGroups = this.oDashboardGroupsBox.getGroups();

                aGroups.forEach(function (group, groupIndex) {
                    this._addTileContainerContent(groupIndex);
                }.bind(this));
                this.bTileContainersContentAdded = true;
            }
        },

        _addTileContainerContent: function (groupIndex) {
            var oGroup = this.oDashboardGroupsBox.getGroups()[groupIndex];

            if (oGroup) {
                var sBindingCtxPath = oGroup.getBindingContext().getPath() + '/';

                oGroup.addBeforeContent(this._getBeforeContent(this.oController, sBindingCtxPath));
                oGroup.addAfterContent(this._getAfterContent(this.oController, sBindingCtxPath));
                oGroup.addHeaderAction(this._getHeaderAction(this.oController, sBindingCtxPath));
            }
        },
        _getDashboardGroupsBox : function (oController, oModel) {
            var that = this;
            var oTilesContainerTemplate = this._getTileContainerTemplate(oController);

            var fnEnableLockedGroupCompactLayout = function () {
                return oModel.getProperty('/enableLockedGroupsCompactLayout') && !oModel.getProperty('/tileActionModeActive');
            };

            var getPlusTileFromGroup = function (oGroup) {
                var groupDomRef;
                var plusTileDomRef;

                if (oGroup && (groupDomRef = oGroup.getDomRef())) {
                    plusTileDomRef = groupDomRef.querySelector('.sapUshellPlusTile');
                    if (plusTileDomRef) {
                        return plusTileDomRef;
                    }
                }

                return null;
            };

            var reorderTilesCallback = function (layoutInfo) {
                var plusTileStartGroup = getPlusTileFromGroup(layoutInfo.currentGroup);
                var plusTileEndGroup = getPlusTileFromGroup(layoutInfo.endGroup);
                var isPlusTileVanishRequired = (layoutInfo.tiles[layoutInfo.tiles.length - 2] === layoutInfo.item) || (layoutInfo.endGroup.getTiles().length == 0);
                if (isPlusTileVanishRequired) {
                    that._hidePlusTile(plusTileEndGroup);
                } else {
                    that._showPlusTile(plusTileEndGroup);
                }

                if (layoutInfo.currentGroup != layoutInfo.endGroup) {
                    that._showPlusTile(plusTileStartGroup);
                }
            };

            //Since the layout initialization is async, we need to execute the below function after initialization is done
            var fAfterLayoutInit = function () {
                //Prevent Plus Tile influence on the tiles reordering by exclude it from the layout matrix calculations
                sap.ushell.Layout.getLayoutEngine().setExcludedControl(sap.ushell.ui.launchpad.PlusTile);
                //Hide plus tile when collision with it
                sap.ushell.Layout.getLayoutEngine().setReorderTilesCallback.call(sap.ushell.Layout.layoutEngine, reorderTilesCallback);
            };

            var fAfterRenderingHandler = function () {
                if (!sap.ushell.Layout.isInited) {
                    sap.ushell.Layout.init({
                        getGroups: this.getGroups.bind(this),
                        isLockedGroupsCompactLayoutEnabled: fnEnableLockedGroupCompactLayout
                    }).done(fAfterLayoutInit);

                    //when media is changed we need to rerender Layout
                    //media could be changed by SAPUI5 without resize, or any other events. look for internal Incident ID: 1580000668
                    sap.ui.Device.media.attachHandler(function () {
                        if (!this.bIsDestroyed) {
                            sap.ushell.Layout.reRenderGroupsLayout(null, true);
                        }
                    }, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
                }
                sap.ushell.Layout.reRenderGroupsLayout(null, true);

                if (this.getGroups().length) {
                    if (this.getModel().getProperty("/personalization")) {
                        if (!oController.getView().ieHtml5DnD) {
                            jQuery.sap.require('sap.ushell.UIActions');
                            that._disableUIActions(); //disable the previous instance of UIActions
                            that._disableEditModeUIActions();
                            that.uiActions = new sap.ushell.UIActions({
                                containerSelector: '#dashboardGroups',
                                wrapperSelector: "#" + this.getDomRef().parentNode.id, // The id of the <section> that wraps dashboardGroups div: #__page0-cont
                                draggableSelector: ".sapUshellTile",
                                draggableSelectorExclude: ".sapUshellPlusTile",
                                rootSelector: "#shell-container",
                                placeHolderClass: "sapUshellTile-placeholder",
                                cloneClass: "sapUshellTile-clone",
                                scrollContainerSelector: that.bAnimate ? "#cloneArea" : undefined,
                                clickCallback: oController._handleClick.bind(that),
                                startCallback: that._handleTileUIStart.bind(that),
                                endCallback: that._handleDrop.bind(that),
                                dragCallback: that._handleStartDrag.bind(that),
                                dragAndScrollCallback: that._handleDragMove.bind(that),
                                moveTolerance: that.isTouch ? 10 : 3,
                                switchModeDelay: 1000,
                                isLayoutEngine: true,
                                isTouch: that.isTouch,
                                debug: false,
                                disabledDraggableSelector: 'sapUshellLockedTile',
                                onDragStartUIHandler: that.markDisableGroups.bind(that),
                                onDragEndUIHandler: that.unmarkDisableGroups.bind(that)
                            }).enable();

                            that.uiEditModeActions = new sap.ushell.UIActions({
                                containerSelector: '#dashboardGroups',
                                wrapperSelector: "#" + this.getDomRef().parentNode.id, // The id of the <section> that wraps dashboardGroups div: #__page0-cont
                                draggableSelector: ".sapUshellDashboardGroupsContainerItem:not(.sapUshellDisableDragAndDrop)",
                                draggableSelectorBlocker: ".sapUshellTilesContainer-sortable, .sapUshellTileContainerBeforeContent, .sapUshellTileContainerAfterContent",
                                rootSelector: "#shell-container",
                                placeHolderClass: "sapUshellDashboardGroupsContainerItem-placeholder",
                                cloneClass: "sapUshellDashboardGroupsContainerItem-clone",
                                clickCallback: oController._handleClick.bind(that),
                                startCallback: oController._handleActionModeUIStart.bind(that),
                                endCallback: oController._handleActionModeDrop.bind(that),
                                dragCallback: oController._handleActionModeStartDrag.bind(that),
                                moveTolerance: that.isTouch ? 10 : 0.1,
                                switchModeDelay: 1000,
                                isLayoutEngine: false,
                                isTouch: that.isTouch,
                                isVerticalDragOnly: true,
                                debug: false
                            });
                        } else {
                            jQuery.sap.require('sap.ushell.UIActionsWin8');
                            that._disableUIActions();
                            that._disableEditModeUIActions();
                            that.uiActions = sap.ushell.UIActionsWin8.getInstance({
                                containerSelector: '#dashboardGroups',
                                wrapperSelector: "#" + this.getDomRef().parentNode.id, // The id of the <section> that wraps dashboardGroups div: #__page0-cont
                                draggableSelector: ".sapUshellTile",
                                rootSelector : "#shell-container",
                                placeHolderClass : "sapUshellTile-placeholder",
                                startCallback : that._handleTileUIStart.bind(that),
                                endCallback : that._handleDrop.bind(that),
                                dragCallback : that._handleStartDrag.bind(that),
                                dragAndScrollCallback : that._handleDragMove.bind(that),
                                onDragStartUIHandler : that.markDisableGroups.bind(that),
                                onDragEndUIHandler : that.unmarkDisableGroups.bind(that)
                            }).enable();

                            that.uiEditModeActions = sap.ushell.UIActionsWin8.getInstance({
                                forGroups: true,
                                containerSelector: '#dashboardGroups',
                                wrapperSelector:  "#" + this.getDomRef().parentNode.id, // The id of the <section> that wraps dashboardGroups div: #__page0-cont
                                draggableSelector: ".sapUshellTileContainerHeader",
                                rootSelector : "#shell-container",
                                placeHolderClass : "sapUshellDashboardGroupsContainerItem-placeholder",
                                _publishAsync: oController._publishAsync
                            }).enable();
                        }
                    }


                    if (this.getModel().getProperty("/tileActionModeActive")) {
                        that.uiEditModeActions.enable();
                    }

                    sap.ui.getCore().getEventBus().publish("launchpad", "contentRendered");
                    sap.ui.getCore().getEventBus().publish("launchpad", "contentRefresh");

                    var oLoadingDialog = sap.ui.getCore().byId("loadingDialog");
                    oLoadingDialog.closeLoadingScreen();
                    oController._addBottomSpace();

                    //Tile opacity is enabled by default, therefore we handle tile opacity in all cases except
                    //case where flag is explicitly set to false
                    if (this.getModel().getProperty("/tilesOpacity")) {
                        sap.ushell.utils.handleTilesOpacity(this.getModel());
                    }
                }

                //Recheck tiles visibility on first load, and make visible tiles active
                try {
                    sap.ushell.utils.handleTilesVisibility();
                } catch (e) {
                    //nothing has to be done
                }

            };

            jQuery.sap.require("sap.ushell.ui.launchpad.DashboardGroupsContainer");
            var oGroupsContainer = new sap.ushell.ui.launchpad.DashboardGroupsContainer("dashboardGroups", {
                accessibilityLabel : sap.ushell.resources.i18n.getText("DashboardGroups_label"),
                groups : {
                    path: "/groups",
                    template : oTilesContainerTemplate
                },
                afterRendering : fAfterRenderingHandler
            });

            oGroupsContainer.addEventDelegate({
                onsapskipback: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    //sidePanelFirstGroup
                    var jqElement = jQuery(".sapUshellGroupLI:first:visible");
                    if (!jqElement.length) {
                        sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                    }
                    jqElement.focus();
                },
                onsapskipforward: function (oEvent) {
                    oEvent.preventDefault();
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                },
                onsaptabnext: function (oEvent) {
                    if (!that.getModel().getProperty("/tileActionModeActive")) {
                        oEvent.preventDefault();
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                        sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                    }
                },
                onsaptabprevious: function (oEvent) {
                    sap.ushell.renderers.fiori2.AccessKeysHandler.setIsFocusHandledByAnotherHandler(true);
                    var jqFocused = jQuery(":focus");
                    if (jqFocused.hasClass("sapUshellTileContainerHeader")) {
                        oEvent.preventDefault();
                        //sidePanelFirstGroup
                        var jqElement = jQuery("#openCatalogActionItem:visible");
                        if (jqElement.length) {
                            jqElement.focus();
                        } else {
                            sap.ushell.renderers.fiori2.AccessKeysHandler.sendFocusBackToShell(oEvent);
                        }
                    }
                }
            });

            return oGroupsContainer;
        },

        //During drag action, locked groups should be mark with a locked icon and group opacity should be changed to grayish
        markDisableGroups : function () {
            this.getModel().setProperty('/isInDrag', true);
        },

        //once d&d ends, restore locked groups appearance and remove locked icons and grayscale
        unmarkDisableGroups : function () {
            if (this.getModel()) {
                this.getModel().setProperty('/isInDrag', false);
            }
        },

        _getBeforeContent: function (oController) {
            var addGrpBtn = new sap.m.Button({
                icon: "sap-icon://add",
                text : sap.ushell.resources.i18n.getText("add_group_at"),
                visible : {
                    parts: ["/tileActionModeActive"],
                    formatter : function (tileActionModeActive) {
                        return (!this.getParent().getIsGroupLocked() && !this.getParent().getDefaultGroup() && tileActionModeActive);
                    }
                },
                enabled: {
                    parts: ["/editTitle"],
                    formatter : function (isEditTitle) {
                        return !isEditTitle;
                    }
                },
                type: sap.m.ButtonType.Transparent,
                press : [ function (oData) {
                    var path = oData.getSource().getBindingContext().getPath(),
                        parsePath = path.split("/");
                    var index = window.parseInt(parsePath[parsePath.length - 1], 10);
                    sap.ui.getCore().getEventBus().publish("launchpad", "createGroupAt", {
                        title : sap.ushell.resources.i18n.getText("new_group_name"),
                        location : index
                    });
                }, oController]
            }).addStyleClass("sapUshellAddGroupButton");

            addGrpBtn.addDelegate({
                    onAfterRendering: function() {
                    jQuery(".sapUshellAddGroupButton").attr("tabindex", -1);
                }
            });

            return addGrpBtn;
        },

        _getAfterContent: function (oController) {
            var addGrpBtn = new sap.m.Button({
                icon: "sap-icon://add",
                text : sap.ushell.resources.i18n.getText("add_group_at"),
                visible : {
                    parts: ["isLastGroup", "/tileActionModeActive", "/isInDrag"],
                    formatter : function (isLast, tileActionModeActive, isInDrag) {
                        // Calculate the result only if isInDrag is false,
                        // meaning - if there was a drag-and-drop action - is it already ended
                        return (isLast && tileActionModeActive);
                    }
               },
               enabled: {
                   parts: ["/editTitle"],
                   formatter : function (isEditTitle) {
                       return !isEditTitle;
                   }
                },
                type: sap.m.ButtonType.Transparent,
                press : [ function (oData) {
                    var path = oData.getSource().getBindingContext().getPath(),
                        parsePath = path.split("/");
                    var index = window.parseInt(parsePath[parsePath.length - 1], 10);
                    sap.ui.getCore().getEventBus().publish("launchpad", "createGroupAt", {
                        title : sap.ushell.resources.i18n.getText("new_group_name"),
                        location : index + 1
                    });
                }, oController]
            }).addStyleClass("sapUshellAddGroupButton");

            addGrpBtn.addDelegate({
                onAfterRendering: function() {
                    jQuery(".sapUshellAddGroupButton").attr("tabindex", -1);
                }
            });

            return addGrpBtn;
        },

        _getHeaderAction: function (oController, sBindingCtxPath) {
            jQuery.sap.require("sap.ushell.ui.launchpad.GroupHeaderActions");

            return new sap.ushell.ui.launchpad.GroupHeaderActions({
                content : this._getHeaderActions(),
                tileActionModeActive: {
                    parts: ['/tileActionModeActive', sBindingCtxPath + 'isDefaultGroup'],
                    formatter: function (bIsActionModeActive, bIsDefaultGroup) {
                        return bIsActionModeActive && !bIsDefaultGroup;
                    }
                },
                isOverflow: '{/isPhoneWidth}'
            }).addStyleClass("sapUshellOverlayGroupActionPanel");
        },

        _getTileContainerTemplate : function () {
            var oFilter = new sap.ui.model.Filter("isTileIntentSupported", sap.ui.model.FilterOperator.EQ, true),
                that = this;

            var oTilesContainerTemplate = new sap.ushell.ui.launchpad.TileContainer({
                headerText: "{title}",
                tooltip: "{title}",
                tileActionModeActive: '{/tileActionModeActive}',
                ieHtml5DnD: this.ieHtml5DnD,
                enableHelp: '{/enableHelp}',
                groupId: "{groupId}",
                defaultGroup: "{isDefaultGroup}",
                isLastGroup: "{isLastGroup}",
                isGroupLocked: "{isGroupLocked}",
                showHeader: true,
                editMode: "{editMode}",
                titleChange: function (oEvent) {
                    sap.ui.getCore().getEventBus().publish("launchpad", "changeGroupTitle", {
                        groupId: oEvent.getSource().getGroupId(),
                        newTitle: oEvent.getParameter("newTitle")
                    });
                },
                showPlaceholder: {
                    parts: ["/tileActionModeActive", "tiles/length"],
                    formatter: function (tileActionModeActive) {
                        return (tileActionModeActive || !this.groupHasVisibleTiles()) && !this.getIsGroupLocked();
                    }
                },
                visible: {
                    parts: ["/tileActionModeActive", "isGroupVisible", "links/length", "tiles/length"],
                    formatter: function (tileActionModeActive, isGroupVisible, linksCount) {
                        //Empty groups should not be displayed when personalization is off or if they are locked or default group not in action mode
                        if (!this.groupHasVisibleTiles() && !linksCount && (!this.getModel().getProperty("/personalization") || (this.getIsGroupLocked() && !tileActionModeActive) || (this.getDefaultGroup() && !tileActionModeActive))) {
                            return false;
                        }
                        return isGroupVisible || tileActionModeActive;
                    }
                },
                links: {
                    path: "links",
                    templateShareable: true,
                    template: new sap.ushell.ui.launchpad.LinkTileWrapper({
                        uuid: "{uuid}",
                        tileCatalogId: "{tileCatalogId}",
                        target: "{target}",
                        isLocked: "{isLocked}",
                        animationRendered: false,
                        debugInfo: "{debugInfo}",
                        ieHtml5DnD: this.ieHtml5DnD,
                        afterRendering: function (oEvent) {
                            var oContext = oEvent.getSource().getBindingContext(),
                                oTileModel;
                            if (oContext) {
                                oTileModel = oContext.getObject();
                                sap.ui.getCore().getEventBus().publish("launchpad", "tileRendered", {
                                    tileId: oTileModel.originalTileId,
                                    tileDomElementId: oEvent.getSource().getId()
                                });
                            }
                        },
                        tileViews: {
                            path: "content",
                            factory: function (sId, oContext) {
                                return oContext.getObject();
                            }
                        }
                    }),
                    filters: [oFilter]
                },
                
                tiles: {
                    path: "tiles",
                    templateShareable: true,
                    template: new sap.ushell.ui.launchpad.Tile({
                        "long": "{long}",
                        "tall": "{tall}",
                        uuid: "{uuid}",
                        tileCatalogId: "{tileCatalogId}",
                        target: "{target}",
                        isLocked: "{isLocked}",
                        tileActionModeActive: "{/tileActionModeActive}",
                        showActionsIcon: "{showActionsIcon}",
                        rgba: "{rgba}",
                        animationRendered: false,
                        debugInfo: "{debugInfo}",
                        ieHtml5DnD: this.ieHtml5DnD,
                        afterRendering: function (oEvent) {
                            var oContext = oEvent.getSource().getBindingContext(),
                                oTileModel;
                            if (oContext) {
                                oTileModel = oContext.getObject();
                                sap.ui.getCore().getEventBus().publish("launchpad", "tileRendered", {
                                    tileId: oTileModel.originalTileId,
                                    tileDomElementId: oEvent.getSource().getId()
                                });
                            }
                        },
                        tileViews: {
                            path: "content",
                            factory: function (sId, oContext) {
                                return oContext.getObject();
                            }
                        },
                        coverDivPress: function (oEvent) {
                            // if this tile had just been moved and the move itself did not finish refreshing the tile's view
                            // we do not open the actions menu to avoid inconsistencies
                            if (!oEvent.oSource.getBindingContext().getObject().tileIsBeingMoved) {
                                sap.ushell.components.flp.ActionMode._openActionsMenu(oEvent);
                            }
                        },
                        showActions: function (oEvent) {
                            sap.ushell.components.flp.ActionMode._openActionsMenu(oEvent);
                        },
                        deletePress: function (oEvent) {
                            var oTileControl =  oEvent.getSource(), oTile = oTileControl.getBindingContext().getObject().object;
                            var oData = {originalTileId : sap.ushell.Container.getService("LaunchPage").getTileId(oTile)};
                            sap.ui.getCore().getEventBus().publish("launchpad", "deleteTile", oData, this);
                        },
                        press : [ this.oController.dashboardTilePress, this.oController ]
                    }),
                    filters: [oFilter]
                },
                add: function (oEvent) {
                    that.parentComponent.getRouter().navTo('catalog', {
                        filters: JSON.stringify({
                            targetGroup: encodeURIComponent(oEvent.getSource().getBindingContext().sPath)
                        })
                    });
                },
                afterRendering: function (oEvent) {
                    if (sap.ushell.Layout.isInited) {
                        sap.ushell.Layout.reRenderGroupLayout(oEvent.getSource());
                    }
                    this.bindProperty("showBackground", "/tileActionModeActive");
                    this.bindProperty("showDragIndicator", {
                        parts: ['/tileActionModeActive', '/enableDragIndicator'],
                        formatter: function (bIsActionModeActive, bDragIndicator) {
                            return bIsActionModeActive && bDragIndicator && !this.getIsGroupLocked() && !this.getDefaultGroup();
                        }
                    });
                    this.bindProperty("showMobileActions", {
                        parts: ['/tileActionModeActive'],
                        formatter: function (bIsActionModeActive) {
                            return bIsActionModeActive && !this.getDefaultGroup();
                        }
                    });
                    this.bindProperty("showIcon", {
                        parts: ['/isInDrag', '/tileActionModeActive'],
                        formatter: function (bIsInDrag, bIsActionModeActive) {
                            return (this.getIsGroupLocked() && (bIsInDrag || bIsActionModeActive)) || (this.getDefaultGroup() && bIsActionModeActive);
                        }
                    });
                    this.bindProperty("deluminate", {
                        parts: ['/isInDrag'],
                        formatter: function (bIsInDrag) {
                            return this.getIsGroupLocked() && bIsInDrag;
                        }
                    });

                    if (that.bTileContainersContentAdded && !this.getBeforeContent().length) {
                        var aGroups = this.getModel().getProperty("/groups");
                        var i;
                        for (i = 0; i < aGroups.length; i++) {
                            if (aGroups[i].groupId === this.getGroupId()) {
                                break;
                            }
                        }
                        that._addTileContainerContent(i);
                    }

                    if (that.bFirstRendering) {
                        that.bFirstRendering = false;
                        //set initial focus
                        if (!that.getModel().getProperty("/tileActionModeActive")) {
                            var firstTileInTileContainer = jQuery('.sapUshellDashboardGroupsContainer .sapUshellTile:first');
                            if (firstTileInTileContainer.length) {
                                firstTileInTileContainer.focus();
                            } else {
                                jQuery("#ConfigBtn").focus();
                            }
                        }
                    }

                    // Remove tabindex from links and group-header actions
                    //  so that the focus will not be automatically set on the first link or group action when returning to the launchpad
                    jQuery(".sapUshellLinksContainer a").attr("tabindex", -1);
                    jQuery(".sapUshellContainerHeaderActions button").attr("tabindex", -1);
                }
            });

            return oTilesContainerTemplate;
        },

        _getHeaderActions: function () {
            return new sap.m.Button({
                text: {
                    path: 'removable',
                    formatter: function (bIsRemovable) {
                        if (sap.ui.Device.system.phone) {
                            if (bIsRemovable) {
                                this.setIcon("sap-icon://delete");
                            } else {
                                this.setIcon("sap-icon://refresh");
                            }
                        }
                        return sap.ushell.resources.i18n.getText(bIsRemovable ? 'DeleteGroupBtn' : 'ResetGroupBtn');
                    }
                },
                type: sap.m.ButtonType.Transparent,
                visible: {
                    parts: ['/tileActionModeActive', 'isDefaultGroup'],
                    formatter: function (bIsActionModeActive, bIsDefaultGroup) {
                        return bIsActionModeActive && !bIsDefaultGroup;
                    }
                },
                enabled: {
                    parts: ["/editTitle"],
                    formatter : function (isEditTitle) {
                        return !isEditTitle;
                    }
                },
                press: function (oEvent) {
                    var oSource = oEvent.getSource(),
                        oGroupBindingCtx = oSource.getBindingContext();
                    this.oController._handleGroupDeletion(oGroupBindingCtx);
                }.bind(this)
            }).addStyleClass("sapUshellHeaderActionButton");
        },

        _handleTileUIStart : function (evt, ui) {
            if ((sap.ui.Device.browser.msie) &&
                ((navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0))) {
                //Remove title so tooltip will not be displayed while dragging tile (IE10 and above)
                this.titleElement = ui.querySelector("[title]");
                this.titleElement.setAttribute("data-title", this.titleElement.getAttribute("title"));
                this.titleElement.removeAttribute("title");
            }
            //Prevent the browser to mark any elements while dragging
            if (sap.ui.Device.system.desktop) {
                jQuery('body').addClass("sapUshellDisableUserSelect");
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleStartDrag : function (evt, tileElement) {
            //Prevent selection of text on tiles and groups
            if (window.getSelection) {
                var selection = window.getSelection();
                // fix IE9 issue (CSS 1580181391)
                try {
                    selection.removeAllRanges();
                } catch (e) {

                }
            }
            sap.ushell.Layout.getLayoutEngine().layoutStartCallback(tileElement);
            //Prevent the tile to be launched after drop
            jQuery(tileElement).find("a").removeAttr('href');
            this.placeHolderElement = jQuery(".sapUshellTile-placeholder");
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            if (this.bAnimate) {
                this._startDragNDropAnimate(evt, tileElement);
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleDrop : function (evt, tileElement) {
            jQuery('#dashboardGroups .sapUshellHidePlusTile').removeClass('sapUshellHidePlusTile');
            if ((sap.ui.Device.browser.msie) &&
                ((navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0))) {
                this.titleElement.setAttribute("title", this.titleElement.getAttribute("data-title"));
            }
            this.oController._handleDrop.call(this.oController, evt, tileElement);
            if (sap.ui.Device.desktop) {
                jQuery('body').removeClass("sapUshellDisableUserSelect");
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleDragMove : function (cfg) {
            if (!cfg.isScrolling) {
                sap.ushell.Layout.getLayoutEngine().moveDraggable(cfg.moveX, cfg.moveY);
            }

            if (!cfg.isScrolling && this.bAnimate) {
                this._changeDragNDropAnimate(cfg.evt, cfg.clone);
            }
        },

        _hidePlusTile : function (plusTileDomRef) {
            if (plusTileDomRef) {
                plusTileDomRef.className += " sapUshellHidePlusTile";
            }
        },

        _showPlusTile: function (plusTileDomRef) {
            if (plusTileDomRef) {
                plusTileDomRef.className = plusTileDomRef.className.split(' ' + 'sapUshellHidePlusTile').join('');
            }
        },

        _getTileTopOffset : function (oTile, tilePosition, dashboardScrollTop) {
            var iTileTopOffset = 0 + dashboardScrollTop;
            iTileTopOffset += oTile.closest(".sapUshellDashboardGroupsContainerItem").position().top;
            iTileTopOffset += tilePosition.top;
            return iTileTopOffset;
        },

        _startDragNDropAnimate : function (evt, ui) {
            this.dragNDropData = {};
            //Create a clone area and append it to oDashboardGroupsBox element
            this.dragNDropData.jqCloneArea = jQuery("<div id='cloneArea' class='sapUshellCloneArea sapUshellDashboardGroupsContainerItem'></div>");//TODO[Nir]: Check if we need those css classes
            var jqDashboardGroupsBox = jQuery.sap.byId(this.oDashboardGroupsBox.getId());
            var tilesFirstContainer = jqDashboardGroupsBox.find('.sapUshellTileContainer:visible:first');
            this.dragNDropData.jqDashboard = jQuery(".sapUshellDashboardView");
            var dashboardPageScrollTop = this.dragNDropData.jqDashboard.scrollTop();
            this.dragNDropData.containerLeftMargin = parseInt(tilesFirstContainer.css("margin-left"), 10);

            //Refresh the current margin (window scaling and opening the sidebar change the margin)
            var containerOffsetLeft = parseFloat(jQuery("#dashboardPage-scroll").offset().left);
            var dashboardOffsetLeft = jqDashboardGroupsBox.offset().left;

            this.dragNDropData.jqCloneArea.css("left", dashboardOffsetLeft - containerOffsetLeft);

            this.dragNDropData.jqDraggableElements = jQuery(".sapUshellTile[role='link'],.sapUshellPlusTile", jqDashboardGroupsBox);

            this.dragNDropData.jqGroupTitles = jQuery(".sapUshellContainerTitle:visible", jqDashboardGroupsBox);

            var jqTile,
                tile,
                sTileLeftOffset,
                oClonedTile,
                iTileTopOffset,
                i;

            for (i = 0; i < this.dragNDropData.jqDraggableElements.length; i++) {
                jqTile = this.dragNDropData.jqDraggableElements.eq(i);
                tile = jqTile[0];
                //Clone the current tile (including style)
                oClonedTile = jqTile.clone(true);
                tile.tilePosition = jqTile.position();
                tile.tileOffset = jqTile.offset();
                oClonedTile.attr("id", oClonedTile.attr("id") + '-clone');
                oClonedTile.css("font-size", jqTile.css("font-size"));
                oClonedTile.addClass("sapUshellClonedTile");

                //Save the clone and the current group (sapUshellDashboardGroupsContainerItem)
                jqTile.data("clone", oClonedTile);

                //Position the clone inside the cloneArea
                sTileLeftOffset = parseInt(tile.tilePosition.left, 10) + this.dragNDropData.containerLeftMargin + "px";
                iTileTopOffset = this._getTileTopOffset(jqTile, tile.tilePosition, dashboardPageScrollTop);

                //Set the new position
                oClonedTile.css("left", sTileLeftOffset);
                oClonedTile.css("top", iTileTopOffset + "px");

                //Append the clone
                this.dragNDropData.jqCloneArea.append(oClonedTile);

                jqTile.css("visibility", "hidden");
            }

            var jqGroupTitle,
                groupTitle,
                sGroupTitleLeftOffset,
                oClonedGroupTitle,
                iGroupTitleTopOffset;

            for (i = 0; i < this.dragNDropData.jqGroupTitles.length; i++) {
                jqGroupTitle = this.dragNDropData.jqGroupTitles.eq(i);
                groupTitle = jqGroupTitle[0];

                oClonedGroupTitle = jqGroupTitle.clone(true);
                groupTitle.titlePosition = jqGroupTitle.position();
                groupTitle.titleOffset = jqGroupTitle.offset();
                oClonedGroupTitle.attr("id", oClonedGroupTitle.attr("id") + '-clone');
                oClonedGroupTitle.css("font-size", jqGroupTitle.css("font-size"));
                oClonedGroupTitle.addClass("sapUshellClonedTile");

                //Save the clone and the current group (sapUshellDashboardGroupsContainerItem) //TODO[Nir]: do we need it?
                jqGroupTitle.data("clone", oClonedGroupTitle);

                //Position the clone inside the cloneArea
                sGroupTitleLeftOffset = parseInt(groupTitle.titlePosition.left, 10) + this.dragNDropData.containerLeftMargin + "px";
                iGroupTitleTopOffset = this._getTileTopOffset(jqGroupTitle, groupTitle.titlePosition, dashboardPageScrollTop);

                //Set the new position
                oClonedGroupTitle.css("left", sGroupTitleLeftOffset);
                oClonedGroupTitle.css("top", iGroupTitleTopOffset + "px");

                //Append the clone
                this.dragNDropData.jqCloneArea.append(oClonedGroupTitle);

                jqGroupTitle.css("visibility", "hidden");
            }

            this.dragNDropData.jqDashboard.append(this.dragNDropData.jqCloneArea);
        },

        _changeDragNDropAnimate : function (evt, ui) {
            var dashboardPageScrollTop = this.dragNDropData.jqDashboard.scrollTop();
            var jqTile,
                tile,
                currentTilePosition,
                currentTileOffset,
                tileLeftOffset,
                iTileTopOffset,
                i,
                oClonedTile;

            for (i = 0; i < this.dragNDropData.jqDraggableElements.length; i++) {
                jqTile = this.dragNDropData.jqDraggableElements.eq(i);
                tile = jqTile[0];
                //Get the original tile and its clone
                currentTilePosition = jqTile.position();
                currentTileOffset = jqTile.offset();
                if ((currentTileOffset.left === tile.tileOffset.left) && (currentTileOffset.top === tile.tileOffset.top)) {
                    continue;
                }
                tile.tilePosition = currentTilePosition;
                tile.tileOffset = currentTileOffset;
                oClonedTile = jqTile.data("clone");
                if (!oClonedTile) {
                    continue;
                }

                //Get the invisible tile that has snapped to the new
                //location, get its position, and animate the visible
                //clone to it
                tileLeftOffset = tile.tilePosition.left + this.dragNDropData.containerLeftMargin;
                iTileTopOffset = this._getTileTopOffset(jqTile, tile.tilePosition, dashboardPageScrollTop);

                //Stop currently running animations
                //Without this, animations would queue up
                oClonedTile.stop(true, false).animate({left: tileLeftOffset, top: iTileTopOffset}, {duration: 250}, {easing: "swing"});
            }
        },

        _stopDragNDropAnimation : function (evt, ui) {
            if (this.bAnimate) {
                //Show all original tiles and reset everything
                this.dragNDropData.jqDraggableElements.removeData("clone");
                this.dragNDropData.jqDraggableElements.css("visibility", "visible");
                this.dragNDropData.jqGroupTitles.css("visibility", "visible");

                //Delete all clones
                this.dragNDropData.jqCloneArea.empty();
                this.dragNDropData.jqCloneArea.remove();
            }
        },

        _disableUIActions : function () {
            if (this.uiActions) {
                this.uiActions.disable();
                this.uiActions = null;
            }
        },
        _disableEditModeUIActions : function () {
            if (this.uiEditModeActions) {
                this.uiEditModeActions.disable();
                this.uiEditModeActions = null;
            }
        },

        getControllerName: function () {
            return "sap.ushell.components.flp.launchpad.dashboard.DashboardContent";
        },

        exit: function () {
            sap.ui.core.mvc.View.prototype.exit.apply(this, arguments);
            if (sap.ui.getCore().byId("hideGroupsBtn")) {
                sap.ui.getCore().byId("hideGroupsBtn").destroy();
            }
            if (sap.ui.getCore().byId("ActionModeBtn")) {
                sap.ui.getCore().byId("ActionModeBtn").destroy();
            }

            if (sap.ui.getCore().byId("floatingActionBtn")) {
                sap.ui.getCore().byId("floatingActionBtn").destroy();
            }
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/group_list/GroupList.controller.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, console, window, $ */
    /*jslint plusplus: true, nomen: true*/

    sap.ui.controller("sap.ushell.components.flp.launchpad.group_list.GroupList", {
        onInit : function () {
            this.sViewId = "#" + this.getView().getId();
            this.sGroupListId = "#" + this.getView().oGroupList.getId();
            this.handleScroll = this._fHandleScroll.bind(this);
        },
        onAfterRendering : function () {
            this.jqView = jQuery(this.sViewId);
            this.jgGroupList = jQuery(this.sGroupListId);

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.unsubscribe("grouplist", "ScrollAnimationEnd", this._handleScrollAnimationEnd, this);
            oEventBus.subscribe("grouplist", "ScrollAnimationEnd", this._handleScrollAnimationEnd, this);
            oEventBus.unsubscribe("grouplist", "DashboardRerender", this._addScroll, this);
            oEventBus.subscribe("grouplist", "DashboardRerender", this._addScroll, this);
            oEventBus.unsubscribe("launchpad", "dashboardScroll", this.handleScroll, this);
            oEventBus.subscribe("launchpad", "dashboardScroll", this.handleScroll, this);

            this._addScroll();
        },

        _addScroll : function () {
            var that = this;

            //setTimeout is required because for some reason the event handler is not called when 'scroll' event is fired
            setTimeout(function () {
                this.dashboardElement = document.querySelector(".sapUshellDashboardView section");
                if (this.dashboardElement) {
                    this.dashboardElement.removeEventListener('scroll', that.handleScroll);
                    this.dashboardElement.addEventListener('scroll', that.handleScroll);
                }
            }.bind(this), 0);
        },

        _fHandleScroll : function () {
            var oModel = this.getView().getModel(),
                iTopViewPortGroupIndex = oModel.getProperty("/topGroupInViewPortIndex");

            // If scroll handler was called while performing a scroll-to-group action -
            // then nothing should be done except for tiles visibility calculation
            if (!oModel.getProperty("/scrollingToGroup")) {
                if (!oModel.getProperty("/groupList-skipScrollToGroup")) {
                    var groupItems = jQuery('#groupList li.sapUshellGroupLI');
                    var selectedGroupListItem = groupItems.removeClass('sapUshellSelected').eq(iTopViewPortGroupIndex);
                    selectedGroupListItem.addClass('sapUshellSelected');
                    var groupListScrollElement = document.getElementById('groupListPage-cont');
                    var groupListScrollTop = groupListScrollElement.scrollTop;
                    var groupListScrollBottom = groupListScrollTop + groupListScrollElement.offsetHeight;
                    var groupOffsetTop = selectedGroupListItem[0] ? selectedGroupListItem[0].offsetTop : undefined;
                    if (groupOffsetTop < groupListScrollTop) {
                        jQuery('#groupListPage section').animate({scrollTop: groupItems[iTopViewPortGroupIndex].offsetTop}, 0);
                    } else if (groupOffsetTop + selectedGroupListItem[0].offsetHeight > groupListScrollBottom) {
                        jQuery('#groupListPage section').animate({scrollTop: groupListScrollTop + groupItems[iTopViewPortGroupIndex].offsetHeight}, 0);
                    }
                }
                sap.ushell.utils.handleTilesVisibility();
            }
        },

        _handleGroupListItemPress : function (oEvent) {
            var oSource = oEvent.getSource(),
                focus;

            //to support accessibility tab order we set focus in press in case edit mode is off
            focus = oEvent.getParameter("action") === "sapenter";
            this._handleScrollToGroup(oSource, false, focus);
        },

        _handleScrollToGroup : function (oGroupItem, groupChanged, focus) {
            if (!oGroupItem) {
                return;
            }
            var that = this;
            document.querySelector(".sapUshellDashboardView").removeEventListener('scroll', that.handleScroll);

            this._publishAsync("launchpad", "scrollToGroup", {
                group : oGroupItem,
                groupChanged : groupChanged,
                focus : focus
            });
        },

        _handleScrollAnimationEnd : function () {
            var that = this;
            document.querySelector(".sapUshellDashboardView").addEventListener('scroll', that.handleScroll);
            this.getView().getModel().setProperty("/scrollingToGroup", false);
        },

        _publishAsync : function (sChannelId, sEventId, oData) {
            var oBus = sap.ui.getCore().getEventBus();
            window.setTimeout($.proxy(oBus.publish, oBus, sChannelId, sEventId, oData), 1);
        }
    });
}());
},
	"sap/ushell/components/flp/launchpad/group_list/GroupList.view.js":function(){// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

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
}
}});
