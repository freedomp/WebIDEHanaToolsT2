// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
jQuery.sap.declare("sap.ushell.components.flp.Component");
if (!window['sap-ui-debug']) {
    try {
        jQuery.sap.require('sap.fiori.flp-controls');
    } catch (e) {
        jQuery.sap.log.warning('flp-controls failed to load: ' + e.message);
    }
}
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ushell.components.flp.CustomRouter");
/* global hasher */
jQuery.sap.require("sap.ushell.components.flp.ComponentKeysHandler");

sap.ui.core.UIComponent.extend("sap.ushell.components.flp.Component", {

    metadata: {
        routing : {
            config: {
                viewType: "JS",
                controlAggregation : "pages",
                controlId : "navContainerFlp",
                clearAggregation: false,
                routerClass : sap.ushell.components.flp.CustomRouter
            },
            targets: {
                catalog: {
                    viewName : "sap.ushell.components.flp.launchpad.catalog.Catalog"
                },
                home: {
                    viewName : "sap.ushell.components.flp.launchpad.dashboard.DashboardContent"
                }
            },
            routes : [
                {
                    name : "home",
                    target: 'home',
                    pattern : "home"
                }
            ]
        },

        version: "1.32.6",

        library: "sap.ushell.components.flp",

        dependencies: {
            libs: ["sap.m"]
        },
        config: {
            semanticObject: 'Shell',
            action: 'home',
            title: sap.ushell.resources.i18n.getText("homeBtn_tooltip"),
            fullWidth: true,
            hideLightBackground: true,
            compactContentDensity: true,
            cozyContentDensity: true
        }
    },

    parseOldCatalogParams: function (sUrl) {
        var mParameters = jQuery.sap.getUriParameters(sUrl).mParams,
            sValue;
        for (var sKey in mParameters) {
            if (mParameters.hasOwnProperty(sKey)) {
                sValue = mParameters[sKey][0];
                mParameters[sKey] = sValue.indexOf('/') !== -1 ? encodeURIComponent(sValue) : sValue;
            }
        }
        return mParameters;
    },

    handleNavigationFilter: function (sNewHash) {
        "use strict";
        var oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sNewHash);
        if (oShellHash && oShellHash.semanticObject === 'shell' && oShellHash.action === 'catalog') {
            var mParameters = this.parseOldCatalogParams(sNewHash);
            setTimeout(function () {
                this.getRouter().navTo('catalog', {filters : JSON.stringify(mParameters)});
            }.bind(this), 0);
            return this.oShellNavigation.NavigationFilterStatus.Abandon;
        }
        return this.oShellNavigation.NavigationFilterStatus.Continue;
    },

    createContent: function () {
        "use strict";
        this.oRouter = this.getRouter();
        this.oModel = new sap.ui.model.json.JSONModel({
            groups : [],
            animationRendered : false,
            tagFiltering: true,
            catalogSelection: true,
            tileActionModeEnabled: false,
            tileActionModeActive: false,
            isInDrag: false,
            rtl: sap.ui.getCore().getConfiguration().getRTL(),
            personalization: true,
            editTitle: false,
            tagList : [],
            selectedTags : [],
            userPreferences : {
                entries : []
            }
        });

        this.oModel.setSizeLimit(10000); // override default of 100 UI elements on list bindings
        this.setModel(this.oModel);
        this.oConfig = this.getComponentData().config;
        //check the personalization flag in the Component configuration and in the Renderer configuration
        this.oShellConfig = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration();
        var bPersonalizationActive = (this.oConfig && (this.oConfig.enablePersonalization || this.oConfig.enablePersonalization === undefined))
            && (this.oShellConfig && this.oShellConfig.enablePersonalization || this.oShellConfig.enablePersonalization === undefined);
        //the catalog route should be added only if personalization is active
        if (bPersonalizationActive) {
            this.oRouter.addRoute({
                name : "catalog",
                target: 'catalog',
                pattern : "catalog/:filters:"
            });
        }
        //add the "all" route after the catalog route was added
        this.oRouter.addRoute({
            name : "all",
            target: 'home',
            pattern : ":all*:"
        });
        this._setConfigurationToModel(this.oConfig);
        jQuery.sap.require("sap.ushell.components.flp.launchpad.DashboardManager");
        this.oDashboardManager = new sap.ushell.components.flp.launchpad.DashboardManager("dashboardMgr", {
            model : this.oModel,
            config : this.oConfig,
            router : this.oRouter
        });

        jQuery.sap.require("sap.ushell.resources");
        this.setModel(sap.ushell.resources.i18nModel, "i18n");

        var oNavContainer,
            mediaQ = window.matchMedia("(min-width: 800px)"),
            handleMedia = function (mq) {
                this.oModel.setProperty("/isPhoneWidth", !mq.matches);
            }.bind(this);
        if (mediaQ.addListener) {// condition check if mediaMatch supported(Not supported on IE9)
            mediaQ.addListener(handleMedia);
            handleMedia(mediaQ);
        }

        sap.ui.getCore().getEventBus().subscribe("showCatalog", this.showCatalog, this);
        sap.ui.getCore().getEventBus().subscribe("launchpad", "togglePane", this._createAndAddGroupList, this);

        this.bContactSupportEnabled = sap.ushell.Container.getService("SupportTicket").isEnabled();
        if (this.bContactSupportEnabled) {
            jQuery.sap.require("sap.ushell.UserActivityLog");
            sap.ushell.UserActivityLog.activate();
        }
        oNavContainer = this.initNavContainer();

        this.setInitialConfiguration();

        this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this.handleNavigationFilter, this));
        //handle direct navigation with the old catalog intent format
        var sHash = hasher.getHash();
        var oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sHash);
        if (oShellHash && oShellHash.semanticObject === 'shell' && oShellHash.action === 'catalog') {
            var mParameters = this.parseOldCatalogParams(sHash);
            var oComponentConfig = this.getMetadata().getConfig();
            this.oShellNavigation.toExternal({
                target: {
                    semanticObject: oComponentConfig.semanticObject,
                    action: oComponentConfig.action
                }
            });
            this.getRouter().navTo('catalog', {filters : JSON.stringify(mParameters)});
        }



        return oNavContainer;
    },

    _createAndAddGroupList: function (sChannel, sEventName, oData) {
        if (oData.currentContent && (oData.currentContent.indexOf('groupList') !== -1 || !oData.currentContent.length)) {
            var oConfig = this.oConfig,
                oGroupListData = this.runAsOwner(function () {
                    return this.oDashboardManager.getGroupListView(oConfig);
                }.bind(this));

            if (!oGroupListData.alreadyCreated) {
                oGroupListData.groupList.setModel(this.oModel);
                oGroupListData.groupList.setModel(sap.ushell.resources.i18nModel, "i18n");
                sap.ushell.renderers.fiori2.RendererExtensions.setLeftPaneContent(oGroupListData.groupList, "home");
            }
        }
    },

    _setConfigurationToModel : function (oConfig) {
        var oModel = this.oModel,
            tileActionModeEnabled;
        if (oConfig) {
            if (oConfig.enablePersonalization !== undefined && this.oShellConfig.enablePersonalization !== undefined) {
                oModel.setProperty("/personalization", oConfig.enablePersonalization && this.oShellConfig.enablePersonalization);
            } else if (oConfig.enablePersonalization !== undefined) {
                oModel.setProperty("/personalization", oConfig.enablePersonalization);
            } else if (this.oShellConfig.enablePersonalization !== undefined) {
                oModel.setProperty("/personalization", this.oShellConfig.enablePersonalization);
            }
            if (oConfig.enableTagFiltering !== undefined) {
                oModel.setProperty("/tagFiltering", oConfig.enableTagFiltering);
            }
            if (oConfig.enableLockedGroupsCompactLayout !== undefined) {
                oModel.setProperty("/enableLockedGroupsCompactLayout", oConfig.enableLockedGroupsCompactLayout);
            }
            if (oConfig.enableCatalogSelection !== undefined) {
                oModel.setProperty("/catalogSelection", oConfig.enableCatalogSelection);
            }
            if (oConfig.enableSearchFiltering !== undefined) {
                oModel.setProperty("/searchFiltering", oConfig.enableSearchFiltering);
            }
            if (oConfig.enableTilesOpacity !== undefined) {
                oModel.setProperty("/tilesOpacity", oConfig.enableTilesOpacity);
            }
            if (oConfig.enableDragIndicator !== undefined) {
                oModel.setProperty("/enableDragIndicator", oConfig.enableDragIndicator);
            }
            tileActionModeEnabled = false;
            if (oConfig.enableActionModeMenuButton !== undefined) {
                oModel.setProperty("/actionModeMenuButtonEnabled", oConfig.enableActionModeMenuButton);
                tileActionModeEnabled = oConfig.enableActionModeMenuButton;
            }
            if (oConfig.enableRenameLockedGroup !== undefined) {
                oModel.setProperty("/enableRenameLockedGroup", oConfig.enableRenameLockedGroup);
            } else {
                oModel.setProperty("/enableRenameLockedGroup", false);
            }

            if (oConfig.enableActionModeFloatingButton !== undefined) {
                oModel.setProperty("/actionModeFloatingButtonEnabled", oConfig.enableActionModeFloatingButton);
                tileActionModeEnabled = tileActionModeEnabled || oConfig.enableActionModeFloatingButton;
            }
            oModel.setProperty("/tileActionModeEnabled", tileActionModeEnabled);
            if (oConfig.enableTileActionsIcon !== undefined) {
                //Available only for desktop
                oModel.setProperty("/tileActionsIconEnabled", sap.ui.Device.system.desktop ? oConfig.enableTileActionsIcon : false);
            }
            if (oConfig.enableHideGroups !== undefined) {
                oModel.setProperty("/enableHideGroups", oConfig.enableHideGroups);
            }
            // check for title
            if (oConfig.title) {
                oModel.setProperty("/title", oConfig.title);
            }

            // xRay enablement configuration
            oModel.setProperty("/enableHelp", !!this.oShellConfig.enableHelp);
            oModel.setProperty("/disableSortedLockedGroups", !!oConfig.disableSortedLockedGroups);

        }
    },

    initNavContainer: function (oController) {
        var oNavContainer = new sap.m.NavContainer({
            id: "navContainerFlp"
        });
        oNavContainer.addCustomTransition(
            "slideBack",
            sap.m.NavContainer.transitions.slide.back,
            sap.m.NavContainer.transitions.slide.back
        );
        return oNavContainer;
    },

    setInitialConfiguration: function() {
        this.oRouter.initialize();

        // set keyboard navigation handler
        sap.ushell.components.flp.ComponentKeysHandler.init(this.oModel, this.oRouter);
        sap.ushell.renderers.fiori2.AccessKeysHandler.registerAppKeysHandler(sap.ushell.components.flp.ComponentKeysHandler.handleFocusOnMe);
        var translationBundle = sap.ushell.resources.i18n,
            aShortcutsDescriptions = [];

        aShortcutsDescriptions.push({text: "Alt+H", description: translationBundle.getText("actionHomePage")});

        if (this.oModel.getProperty("/personalization")) {
            aShortcutsDescriptions.push({text: "Alt+C", description: translationBundle.getText("actionCatalog")});
        }

        sap.ushell.renderers.fiori2.AccessKeysHandler.registerAppShortcuts(sap.ushell.components.flp.ComponentKeysHandler.handleShortcuts, aShortcutsDescriptions);
    },

    exit : function () {
        this.oDashboardManager.destroy();
    }
});
