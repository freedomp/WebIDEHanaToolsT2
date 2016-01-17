// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global jQuery, sap, window, document, setTimeout, hasher, confirm*/

    jQuery.sap.require("sap.ui.core.IconPool");

    /* dont delay these cause they are needed for direct bookmarks */
    jQuery.sap.require("sap.ushell.renderers.fiori2.History");
    jQuery.sap.require("sap.ushell.services.Message");
    jQuery.sap.require("sap.ushell.services.ShellNavigation");
    jQuery.sap.require("sap.ushell.services.UsageAnalytics");
    jQuery.sap.require("sap.ushell.services.AppConfiguration");
    jQuery.sap.require("sap.ushell.ui.launchpad.LoadingDialog");
    jQuery.sap.require("sap.ushell.renderers.fiori2.AccessKeysHandler");
    jQuery.sap.require("sap.ushell.utils");
    // create global model and add some demo data
    var closeAllDialogs = true,
        enableHashChange = true,
        isMobile = sap.ui.Device.system.phone,
        oUserRecentsService,
        bUserImageAlreadyLoaded,
        oModel = new sap.ui.model.json.JSONModel({
            searchAvailable: false,
            title: "", // no default value for title
            searchFiltering: true,
            showEndUserFeedback: false,
            searchTerm: "",
            isPhoneWidth: false,
            states : {
                "home" : {
                    "stateName" : "home",
                    "showCurtain" : false,
                    "headerHiding" : false,
                    "headerVisible" : true,
                    "showCatalog" : false,
                    "showPane" : false,
                    "headItems" : [],
                    "headEndItems" : ["sf"],
                    "search" : "",
                    "paneContent" : [],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "userPreferencesButton", "logoutBtn"],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                },
                "app" : {
                    "stateName" : "app",
                    "showCurtain" : false,
                    "headerHiding" : isMobile,
                    "headerVisible" : true,
                    "headEndItems" : ["sf"],
                    "showCatalog" : false,
                    "showPane" : false,
                    "paneContent" : [],
                    "search" : "",
                    "headItems" : ["homeBtn"],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn", "userPreferencesButton", "logoutBtn"],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                },
                "minimal" : {
                    "stateName" : "minimal",
                    "showCurtain" : false,
                    "headerHiding" : false,
                    "headerVisible" : true,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "paneContent" : [],
                    "headItems" : [],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn", "userPreferencesButton", "logoutBtn"],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                },
                "standalone" : {
                    "stateName" : "standalone",
                    "showCurtain" : false,
                    "headerHiding" : isMobile,
                    "headerVisible" : true,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "paneContent" : [],
                    "headItems" : [],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn"],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                },
                "embedded" : {
                    "stateName" : "embedded",
                    "showCurtain" : false,
                    "headerHiding" : isMobile,
                    "headerVisible" : true,
                    "headEndItems" : ["standardActionsBtn"],
                    "showCatalog" : false,
                    "showPane" : false,
                    "paneContent" : [],
                    "headItems" : [],
                    "actions" : ["ContactSupportBtn", "EndUserFeedbackBtn", "aboutBtn"],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                },
                "headerless" : {
                    "stateName" : "headerless",
                    "showCurtain" : false,
                    "headerHiding" : isMobile,
                    "headerVisible" : false,
                    "headEndItems" : [],
                    "showCatalog" : false,
                    "showPane" : false,
                    "paneContent" : [],
                    "headItems" : [],
                    "actions" : [],
                    "floatingActions" : [],
                    "subHeaders" : [],
                    "toolAreaItems" : [],
                    "toolAreaVisible" : false
                }
            },
            userPreferences : {
                entries : []
            }
        }),
        oNavigationMode = {
            embedded : "embedded",
            newWindowThenEmbedded : "newWindowThenEmbedded",
            newWindow : "newWindow",
            replace : "replace"
        },
        oConfig = {},

    //allowed application state list that are allowed to be configured by oConfig.appState property
        allowedAppStates = ['minimal', 'app', 'standalone', 'embedded', 'headerless', 'home'];
    /**
     * @name sap.ushell.renderers.fiori2.Shell
     * @extends sap.ui.core.mvc.Controller
     * @public
     */
    sap.ui.controller("sap.ushell.renderers.fiori2.Shell", {

        oCoreExtLoadingDeferred : undefined,

        /**
         * SAPUI5 lifecycle hook.
         * @public
         */
        onInit: function () {
            this.oEndUserFeedbackConfiguration = {
                showAnonymous: true,
                showLegalAgreement : true,
                showCustomUIContent: true,
                feedbackDialogTitle: true,
                textAreaPlaceholder: true,
                customUIContent: undefined
            };

            // Add global model to view
            this.getView().setModel(oModel);
          // Bind the translation model to this view
            this.getView().setModel(sap.ushell.resources.i18nModel, "i18n");
            this.managedElementsQueue = [];

            sap.ui.getCore().getEventBus().subscribe("externalSearch", this.externalSearchTriggered, this);
            // handling of configuration should is done before the code block below otherwise the doHashChange is
            // triggered before the personalization flag is disabled (URL may contain hash value which invokes navigation)
            this._setConfigurationToModel();
            sap.ui.getCore().getEventBus().subscribe("openApp", this.openApp, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "contentRendered", this._loadCoreExt, this);
            sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appOpened", this.loadUserImage, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "contentRendered", this.checkEUFeedback, this);
            sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appOpened", this.checkEUFeedback, this);
            sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer", "appOpened", this.closeLoadingScreen, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "toggleContentDensity", this.toggleContentDensity, this);


            // set current state
            var oConfig = this.getView().getViewData() ? this.getView().getViewData().config : null,
                sRootIntent = oConfig ? oConfig.rootIntent : "",
                sCurrentHash = hasher.getHash(),
                oShellHash =  sap.ushell.Container.getService("URLParsing").parseShellHash(sCurrentHash);

            if (!sCurrentHash.length || sRootIntent === oShellHash.semanticObject + "-" + oShellHash.action) {
                this.switchViewState('home'); // home is the default state of the shell
            }


            if (sap.ushell.Container.getService("UsageAnalytics").isEnabled() === true) {
                sap.ushell.Container.getService("UsageAnalytics").init();
                jQuery.sap.require("sap.ushell.components.flp.FLPAnalytics");
            }

            oUserRecentsService = sap.ushell.Container.getService("UserRecents");
            this.history = new sap.ushell.renderers.fiori2.History();
            this.oNavContainer = sap.ui.getCore().byId("navContainer");
            this.oLoadingDialog = sap.ui.getCore().byId("loadingDialog");

            //   this.toggleRtlMode(sap.ui.getCore().getConfiguration().getRTL());
            this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
            this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this._handleEmptyHash, this));
            // must be after event registration (for synchronous navtarget resolver calls)
            this.oShellNavigation.init(jQuery.proxy(this.doHashChange, this));
            this.oShellNavigation.registerNavigationFilter(jQuery.proxy(this.handleDataLoss, this));
            sap.ushell.Container.getService("Message").init(jQuery.proxy(this.doShowMessage, this));
            sap.ushell.Container.setLogonFrameProvider(this._getLogonFrameProvider()); // TODO: TBD??????????
            this.bContactSupportEnabled = sap.ushell.Container.getService("SupportTicket").isEnabled();
            sap.ushell.renderers.fiori2.AccessKeysHandler.init(oModel);

            window.onbeforeunload = function () {
                if (sap.ushell.Container && sap.ushell.Container.getDirtyFlag()) {
                    if (!sap.ushell.resources.browserI18n) {
                        sap.ushell.resources.browserI18n = sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();
                    }
                    return sap.ushell.resources.browserI18n.getText("dataLossExternalMessage");
                }
            };

            if (this.bContactSupportEnabled) {
                sap.ushell.UserActivityLog.activate();
            }
            if (oModel.getProperty("/contentDensity")) {
                this._applyContentDensity();
            }
        },

        _isCompactContentDensity: function(){
            var isCompact;
            if (!sap.ui.Device.support.touch) {
                isCompact = true;
            } else if (!sap.ui.Device.system.combi){
                isCompact = false;
            } else {
                var oUser;
                try {
                    var userInfoService = sap.ushell.Container.getService("UserInfo");
                    oUser = userInfoService.getUser();
                } catch (e) {
                    jQuery.sap.log.error("Getting UserInfo service failed.");
                    oUser = sap.ushell.Container.getUser();
                }
                isCompact = (oUser.getContentDensity() === 'compact') ? true : false;
            }

            return isCompact;
        },

        _applyContentDensity: function (isCompact) {
            if (!this.getModel().getProperty("/contentDensity")) {
                return;
            }

            if (isCompact === undefined){
                isCompact = this._isCompactContentDensity();
            }

            var appMetaData = sap.ushell.services.AppConfiguration.getMetadata();
            if (isCompact && !appMetaData.compactContentDensity){
                isCompact = false;
            } else if (appMetaData.compactContentDensity && !appMetaData.cozyContentDensity){
                isCompact = true;
            }

            if (isCompact) {
                jQuery('body').removeClass('sapUiSizeCozy');
                jQuery('body').addClass('sapUiSizeCompact');
            } else {
                jQuery('body').removeClass('sapUiSizeCompact');
                jQuery('body').addClass('sapUiSizeCozy');
            }

        },

        toggleContentDensity:  function (sChannelId, sEventId, oData) {
            var isCompact = oData.contentDensity === "compact";

            this._applyContentDensity(isCompact);
        },

        checkEUFeedback: function () {
            if (!this.bFeedbackServiceChecked) {
                this.bFeedbackServiceChecked = true;
                try {
                    sap.ushell.Container.getService("EndUserFeedback").isEnabled()
                        .done(function () {
                            oModel.setProperty('/showEndUserFeedback', true);
                        })
                        .fail(function () {
                            oModel.setProperty('/showEndUserFeedback', false);
                        });
                } catch (e) {
                    jQuery.sap.log.error("EndUserFeedback adapter is not found", e.message || e);
                    oModel.setProperty('/showEndUserFeedback', false);
                }
            }
        },

        _handleEmptyHash : function (sHash) {
            if (sHash.length === 0) {
                var oViewData = this.getView() ? this.getView().getViewData() : {};
                oConfig = oViewData.config || {};
                //Migration support:  we have to set rootIntent empty
                //And continue navigation in order to check if  empty hash is resolved locally
                if (oConfig.migrationConfig) {
                    return this.oShellNavigation.NavigationFilterStatus.Continue;
                }
                if (oConfig.rootIntent) {
                    setTimeout(function () {
                        hasher.setHash(oConfig.rootIntent);
                    }, 0);
                    return this.oShellNavigation.NavigationFilterStatus.Abandon;
                }
            }
            return this.oShellNavigation.NavigationFilterStatus.Continue;
        },

        _setConfigurationToModel : function () {
            var oViewData = this.getView().getViewData(),
                stateEntryKey,
                curStates;

            if (oViewData) {
                oConfig = oViewData.config || {};
            }
            if (oConfig) {
                if (oConfig.states) {
                    curStates = oModel.getProperty('/states');
                    for (stateEntryKey in oConfig.states) {
                        if (oConfig.states.hasOwnProperty(stateEntryKey)) {
                            curStates[stateEntryKey] = oConfig.states[stateEntryKey];
                        }
                    }
                    oModel.setProperty('/states', curStates);
                }

                if (oConfig.appState === "headerless") {
                    // when appState is headerless we also remove the header in home state and disable the personalization.
                    // this is needed in case headerless mode will be used to navigate to the dashboard and not directly to an application.
                    // As 'home' is the official state for the dash board, we change the header visibility property of this state
                    oModel.setProperty("/personalization", false);
                    oModel.setProperty("/states/home/headerVisible", false);
                    //update the configuration as well for the method "getModelConfiguration"
                    oConfig.enablePersonalization = false;
                } else if (oConfig.enablePersonalization !== undefined) {
                    oModel.setProperty("/personalization", oConfig.enablePersonalization);
                }

                //EU Feedback flexable configuration
                if (oConfig.changeEndUserFeedbackTitle !== undefined) {
                    this.oEndUserFeedbackConfiguration.feedbackDialogTitle = oConfig.changeEndUserFeedbackTitle;
                }

                if (oConfig.changeEndUserFeedbackPlaceholder !== undefined) {
                    this.oEndUserFeedbackConfiguration.textAreaPlaceholder = oConfig.changeEndUserFeedbackPlaceholder;
                }

                if (oConfig.showEndUserFeedbackAnonymousCheckbox !== undefined) {
                    this.oEndUserFeedbackConfiguration.showAnonymous = oConfig.showEndUserFeedbackAnonymousCheckbox;
                }

                if (oConfig.showEndUserFeedbackLegalAgreement !== undefined) {
                    this.oEndUserFeedbackConfiguration.showLegalAgreement = oConfig.showEndUserFeedbackLegalAgreement;
                }
                //EU Feedback configuration end.
                if (oConfig.enableSetTheme !== undefined) {
                    oModel.setProperty("/setTheme", oConfig.enableSetTheme);
                }
                // Compact Cozy mode
                if (oConfig.enableContentDensity !== undefined) {
                    oModel.setProperty("/contentDensity", oConfig.enableContentDensity);
                }
                // check for title
                if (oConfig.title) {
                    oModel.setProperty("/title", oConfig.title);
                }
                //Check if the configuration is passed by html of older version(1.28 and lower)
                if (oConfig.migrationConfig !== undefined) {
                    oModel.setProperty("/migrationConfig", oConfig.migrationConfig);
                }
                //User default parameters settings
                if (oConfig.enableUserDefaultParameters !== undefined) {
                    oModel.setProperty("/userDefaultParameters", oConfig.enableUserDefaultParameters);
                }

                if (oConfig.disableHomeAppCache !== undefined) {
                    oModel.setProperty("/disableHomeAppCache", oConfig.disableHomeAppCache);
                }

                // xRay enablement configuration
                oModel.setProperty("/enableHelp", !!oConfig.enableHelp);
                oModel.setProperty("/searchAvailable", (oConfig.enableSearch !== false));
            }
        },

        getModelConfiguration: function () {
            var oViewData = this.getView().getViewData(),
                oConfiguration,
                oShellConfig;

            if (oViewData) {
                oConfiguration = oViewData.config || {};
                oShellConfig = jQuery.extend({}, oConfiguration);
            }
            delete oShellConfig.applications;
            return oShellConfig;
        },
        /**
         * This method will be used by the Container service in order to create, show and destroy a Dialog control with an
         * inner iframe. The iframe will be used for rare scenarios in which additional authentication is required. This is
         * mainly related to SAML 2.0 flows.
         * The api sequence will be managed by UI2 services.
         * @returns {{create: Function, show: Function, destroy: Function}}
         * @private
         */
        _getLogonFrameProvider: function () {
            var oView = this.getView();

            return {
                /* @returns a DOM reference to a newly created iFrame. */
                create: function () {
                    return oView.createIFrameDialog();
                },

                /* make the current iFrame visible to user */
                show: function () {
                    oView.showIFrameDialog();
                },

                /* hide, close, and destroy the current iFrame */
                destroy: function () {
                    oView.destroyIFrameDialog();
                }
            };
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("externalSearch", this.externalSearchTriggered, this);
            sap.ui.getCore().getEventBus().unsubscribe("openApp", this.openApp, this);
            sap.ui.getCore().getEventBus().unsubscribe("toggleContentDensity", this.toggleContentDensity, this);

            this.oShellNavigation.hashChanger.destroy();
            this.getView().aDanglingControls.forEach(function (oControl) {
                if (oControl.destroyContent) {
                    oControl.destroyContent();
                }
                oControl.destroy();
            });
            sap.ushell.UserActivityLog.deactivate(); // TODO:
        },


        getAnimationType : function () {
            return sap.ui.Device.os.android ? "show" : "slide";
        },

        onCurtainClose : function (oEvent) {
            jQuery.sap.log.warning("Closing Curtain", oEvent);


        },

        /**
         * Navigation Filter function registered with ShellNavigation service.
         * Triggered on each navigation.
         * Aborts navigation if there are unsaved data inside app(getDirtyFlag returns true).
         *
         * @private
         */
        handleDataLoss: function (newHash, oldHash) {
            if (sap.ushell.Container.getDirtyFlag()) {
                if (!sap.ushell.resources.browserI18n) {
                    sap.ushell.resources.browserI18n = sap.ushell.resources.getTranslationModel(window.navigator.language).getResourceBundle();
                }
                /*eslint-disable no-alert*/
                if (confirm(sap.ushell.resources.browserI18n.getText("dataLossInternalMessage"))) {
                /*eslint-enable no-alert*/
                    sap.ushell.Container.setDirtyFlag(false);
                    return this.oShellNavigation.NavigationFilterStatus.Continue;
                } else {
                    return this.oShellNavigation.NavigationFilterStatus.Abandon;
                }
            }

            return this.oShellNavigation.NavigationFilterStatus.Continue;
        },
        /**
         * Callback registered with Message service. Triggered on message show request.
         *
         * @private
         */
        doShowMessage: function (iType, sMessage, oParameters) {
            jQuery.sap.require("sap.m.MessageToast");
            jQuery.sap.require("sap.m.MessageBox");
            if (iType === sap.ushell.services.Message.Type.ERROR) {
                //check that SupportTicket is enabled and verify that we are not in a flow in which Support ticket creation is failing,
                // if this is the case we don't want to show the user the contact support button again
                if (sap.ushell.Container.getService("SupportTicket").isEnabled() && sMessage !== sap.ushell.resources.i18n.getText("supportTicketCreationFailed")) {
                    try {
                        jQuery.sap.require("sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage");
                        var errorMsg = new sap.ushell.ui.launchpad.EmbeddedSupportErrorMessage("EmbeddedSupportErrorMessage", {
                            title: oParameters.title || sap.ushell.resources.i18n.getText("error"),
                            content: new sap.m.Text({
                                text: sMessage
                            })
                        });
                        errorMsg.open();
                    } catch (e) {
                        sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.ERROR,
                            oParameters.title || sap.ushell.resources.i18n.getText("error"));
                    }
                } else {
                    sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.ERROR,
                        oParameters.title || sap.ushell.resources.i18n.getText("error"));
                }
            } else if (iType === sap.ushell.services.Message.Type.CONFIRM) {
                if (oParameters.actions) {
                    sap.m.MessageBox.show(sMessage, sap.m.MessageBox.Icon.QUESTION, oParameters.title, oParameters.actions, oParameters.callback);
                } else {
                    sap.m.MessageBox.confirm(sMessage, oParameters.callback, oParameters.title);
                }
            } else {
                sap.m.MessageToast.show(sMessage, { duration: oParameters.duration || 3000 });
            }
        },

        /**
         * Callback registered with NavService. Triggered on navigation requests
         *
         * A cold start state occurs whenever the user has previously opened the window.
         * - page is refreshed
         * - URL is pasted in an existing window
         * - user opens the page and pastes a URL
         *
         * @return {boolean} whether the application is in a cold start state
         */
        _isColdStart: function () {
            if (this.history.getHistoryLength() <= 1) {  // one navigation: coldstart!
                return true;
            }
            this._isColdStart = function () { return false; };
            return false;
        },


        _generateExpandedUrl: function (oResolvedHashFragment, oShellHash, sDefaultShellHash, sDefaultTitle) {
            /*
             * This invocation to hrefForExternal is conceptually flawed, as we
             * use oShellHash, which is the parsed *unexpanded* form of the
             * shell hash, thus it may already contain a *compacted* URL, which
             * cannot be compacted again after adding parameters here.  To fix,
             * one must use an *expanded* oShellHash!
             *
             * Note that the sDeaultShellHash/"original_intent" is correctly a
             * *compacted* received hash.  as we open a new window, there is a
             * race condition if URL compaction occurs now thus we use the
             * *asynchronous* generation.
             */
            return this.oShellNavigation.hrefForExternal({
                target: {
                    semanticObject : oShellHash.semanticObject,
                    action : oShellHash.action,
                    contextRaw : "navResCtx" // detect embedded URL in new window launchpad
                },
                params : jQuery.extend({
                    url: oResolvedHashFragment.url,
                    additionalInformation: oResolvedHashFragment.additionalInformation,
                    applicationType: oResolvedHashFragment.applicationType,
                    navigationMode: oResolvedHashFragment.navigationMode,
                    "original_intent": sDefaultShellHash,
                    title: sDefaultTitle
                }, oShellHash.params)
            }, true, undefined, true);
        },

        _logOpenAppAction: function (sFixedShellHash) {
            if (oConfig && oConfig.enableTilesOpacity) {
                // Triggering the app usage mechanism to log this openApp action.
                // Using setTimeout in order not to delay the openApp action
                setTimeout(function () {
                    if (sap.ushell.Container) {
                        oUserRecentsService.addAppUsage(sFixedShellHash);
                    }
                }, 700);
            }
        },

        _performTransition: function (oInnerControl) {
            if (this.history.backwards && this.oNavContainer.getInitialPage() !== this.oNavContainer.getCurrentPage().getId()) {
                this.oNavContainer.to(oInnerControl, "slideBack");
                return;
            }
            this.oNavContainer.to(oInnerControl, "slide");
        },

        /**
         * Sets application container based on information in URL hash.
         *
         * This is a callback registered with NavService. It's triggered
         * whenever the url (or the hash fragment in the url) changes.
         *
         * NOTE: when this method is called, the new URL is already in the
         *       address bar of the browser. Therefore back navigation is used
         *       to restore the URL in case of wrong navigation or errors.
         *
         * @public
         */
        doHashChange: function (sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError) {
            var that = this,
                iOriginalHistoryLength,
                sFixedShellHash;

            if (!enableHashChange) {
                enableHashChange = true;
                this.closeLoadingScreen();
                return;
            }

            if (oParseError) {
                this.hashChangeFailure(this.history.getHistoryLength(), oParseError.message, null, "sap.ushell.renderers.fiori2.Shell.controller");
                return;
            }
            if (sap.m.InstanceManager && closeAllDialogs) {
                sap.m.InstanceManager.closeAllDialogs();
                sap.m.InstanceManager.closeAllPopovers();
            }

            closeAllDialogs = true;
            // navigation begins
            this.oLoadingDialog.setText("");
            this.oLoadingDialog.openLoadingScreen();

            // save current history length to handle errors (in case)
            iOriginalHistoryLength = this.history.getHistoryLength();

            sFixedShellHash = this.fixShellHash(sShellHash);

            // track hash change
            this.history.hashChange(sFixedShellHash, sOldShellHash);

            this._resolveHashFragment(sFixedShellHash).done(function (oResolvedHashFragment, oParsedShellHash) {

                // In case of empty hash, if there is a resolved target, set the flag to false, from now on the rootIntent will be an empty hash.
                // Otherwise, change hash to rootIntent to triger normal resolution
                if (that.getModel().getProperty("/migrationConfig")) {
                    var oConfig = that.getView().oViewData.config;
                    oConfig.migrationConfig = false;
                    that.getModel().setProperty("/migrationConfig", false);

                    if (oResolvedHashFragment && sFixedShellHash === '#') {
                        oConfig.rootIntent = "";
                    } else if (sFixedShellHash === '#') {
                        setTimeout(function () {
                            hasher.setHash(oConfig.rootIntent);
                        }, 0);
                        return;
                    }
                }

                /*
                 * Pre-navigation logic for library loading
                 *
                 * Before navigating to an app, we need to make sure:
                 *
                 * - the app component and its dependencies are loaded.
                 * - core-ext-light.js is loaded.
                 *
                 * NOTE:
                 *
                 * 1) if the first navigation to the application occurs, the
                 * resolveHashFragment promise will be resolved when
                 * core-ext-light **and** the app component dependencies are
                 * loaded.
                 *
                 * 2) Navigating to the home page does not require any further
                 * library preload. However, in this case we can try to
                 * anticipate the next app navigation, and load core-ext-light
                 * lazily **after** the navigation has occurred (via
                 * contentRendered event, see #onInit method).
                 *
                 * 3) should the navigation happen before the lazy
                 * initialization of core-ext-light at 2) occurs, we fall back
                 * on requiring core-ext-light.js synchronously (this should
                 * happen rarely).
                 */
                that._loadAppComponentDependencies(oResolvedHashFragment).done(function () {
                    // oCoreExtLoadingDeferred is resolved when core-ext-light finished being loaded by the shell (function _loadCoreExt).
                    // If oCoreExtLoadingDeferred is undefined (e.g. when launching a direct URL for an application)
                    // or if oCoreExtLoadingDeferred is rejected, then core.ext is loaded using jQuery.sap.require using function _requireCoreExt
                    if (that.oCoreExtLoadingDeferred !== undefined) {

                        that.oCoreExtLoadingDeferred.promise().fail(function () {
                            // no core-ext-light.js: try loading it synchronously via require if WebWorkers failed
                            jQuery.sap.log.warning("failed to load core-ext by web worker, performing require");

                            that._requireCoreExt(sFixedShellHash);

                        }).always(function () {
                            // reasonably assume core-ext-light.js is there and perform app navigation
                            that._initiateApplication(oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength);
                        });

                    } else {
                        that._requireCoreExt(sFixedShellHash);
                        that._initiateApplication(oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength);
                    }
                }).fail(function (sMsg) {
                    that.hashChangeFailure(iOriginalHistoryLength, "Failed to load U5 component from " + sFixedShellHash,
                    sMsg, "sap.ushell.renderers.fiori2.Shell.controller");
                });

            }).fail(function (sMsg) {
                that.hashChangeFailure(iOriginalHistoryLength, "Failed to resolve navigation target: " + sFixedShellHash,
                    sMsg, "sap.ushell.renderers.fiori2.Shell.controller");
            });
        },
        /**
         * Try loading the app UI5 component and its dependencies.
         *
         * @param {object} oResolvedHashFragment
         *    the hash fragment resolved via the NavTargetResolution service.
         *
         * @return {jQuery.Deferred.promise}
         *    a jQuery promise, always resolved after trying to load the app
         *    UI5 component and its dependencies.<br />
         *    Note, the promise also resolves when one or more UI5 components
         *    were not loaded to let the application open anyway, falling back
         *    to "require" the needed dependencies.
         */
        _loadAppComponentDependencies: function (oResolvedHashFragment) {
            var oUI5ComponentLoadDeferred = new jQuery.Deferred(),
                sComponentUrlWithoutParams,
                bMustLoadDependencies = oResolvedHashFragment && oResolvedHashFragment.ui5ComponentName,
                oAsyncHints;

            if (!bMustLoadDependencies) {
                oUI5ComponentLoadDeferred.resolve();

            } else {
                oAsyncHints = (oResolvedHashFragment.applicationDependencies && oResolvedHashFragment.applicationDependencies.asyncHints) ||
                    { "libs": ["sap.ca.scfld.md", "sap.ca.ui", "sap.me", "sap.ui.unified"] };
                oAsyncHints.preloadOnly = true;
                sComponentUrlWithoutParams = (typeof oResolvedHashFragment.url === "string")
                     ? oResolvedHashFragment.url.replace(/[?].*$/,"")
                     : oResolvedHashFragment.url;
                sap.ui.component.load({
                    name: oResolvedHashFragment.ui5ComponentName,
                    url: sComponentUrlWithoutParams,
                    async: true,
                    asyncHints: oAsyncHints
                }).then(
                    function () {  // ES6 promise resolved
                      oUI5ComponentLoadDeferred.resolve();
                    },
                    function (sMsg) {  // ES6 promise rejected
                        jQuery.sap.log.warning("Failed to preload component dependency before navigation",
                            sMsg, "sap.ushell.renderers.fiori2.Shell");

                        // Allow opening the application, needed components will be required.
                        oUI5ComponentLoadDeferred.resolve();
                    }
                );
            }

            return oUI5ComponentLoadDeferred.promise();
        },
        _initiateApplication : function (oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength) {
            var oMetadata = sap.ushell.services.AppConfiguration.getMetadata(oResolvedHashFragment);

            this._logOpenAppAction(sFixedShellHash);

            try {
                this.navigate(oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment);
            } catch (oExc) {
                if (oExc.stack) {
                    jQuery.sap.log.error("Application initialization failed due to an Exception:\n" + oExc.stack);
                }
                this.restoreNavContainerAfterFailure();
                this.hashChangeFailure(iOriginalHistoryLength, oExc.name, oExc.message, oMetadata ? oMetadata.title : "");
            }
        },

        /**
         * Callback registered with NavService. Triggered on navigation requests
         *
         * @param {string} sShellHash
         *     the hash fragment to parse (must start with "#")
         *
         * @returns {jQuery.Deferred.promise}
         *     a promise resolved with an object containing the resolved hash
         *     fragment (i.e., the result of {@link
         *     sap.ushell.services.NavTargetResolution#resolveHashFragment})
         *     and the parsed shell hash obtained via {@link
         *     sap.ushell.services.URLParsing#parseShellHash}. This promise is
         *     rejected with an error message in case errors occur.
         */
        _resolveHashFragment: function (sShellHash) {
            var oResolvedHashFragment,
                oParsedShellHashParams,
                oParsedShellHash = sap.ushell.Container.getService("URLParsing").parseShellHash(sShellHash),
                oDeferred = new jQuery.Deferred();

            /*
             * Optimization: reconstruct the result of resolveHashFragment if
             * navResCtx is found in the hash fragment.
             */
            if (oParsedShellHash && oParsedShellHash.contextRaw && oParsedShellHash.contextRaw === "navResCtx") {
                oParsedShellHashParams = oParsedShellHash.params || {};

                oResolvedHashFragment = {
                    additionalInformation: oParsedShellHashParams.additionalInformation[0],
                    applicationType: oParsedShellHashParams.applicationType[0],
                    url: oParsedShellHashParams.url[0],
                    navigationMode: oParsedShellHashParams.navigationMode[0]
                };

                if (oParsedShellHashParams.title) {
                    oResolvedHashFragment.text = oParsedShellHashParams.title[0];
                }

                oDeferred.resolve(oResolvedHashFragment, oParsedShellHash);
            } else {
                sap.ushell.Container.getService("NavTargetResolution").resolveHashFragment(sShellHash)
                    .done(function (oResolvedHashFragment) {

                        oDeferred.resolve(oResolvedHashFragment, oParsedShellHash);
                    })
                    .fail(function (sMsg) {
                        oDeferred.reject(sMsg);
                    });
            }

            return oDeferred.promise();
        },


        /**
         * Handles navigation modes that depend on current state such as the
         * history. In these cases of conditional navigation, this method calls
         * {@link #navigate}.
         *
         * @param {object} oParsedShellHash
         *     the parsed shell hash obtained via
         *     {@link sap.ushell.services.URLParsing} service
         * @param {string} sFixedShellHash
         *     the hash fragment to navigate to. It must start with "#" (i.e., fixed).<br />
         * @param {object} oMetadata
         *     the metadata object obtained via
         *     {@link sap.ushell.services.AppConfiguration#parseShellHash}
         * @param {object} oResolvedHashFragment
         *     the hash fragment resolved via
         *     {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}
         *
         * @returns {boolean} whether conditional navigation was handled
         * @private
         */
        _handleConditionalNavigation: function (oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment) {
            var that = this,
                sNavigationMode = oResolvedHashFragment.navigationMode;

            if (sNavigationMode === oNavigationMode.newWindowThenEmbedded) {
                /*
                 * Implement newWindowThenEmbedded based on current state.
                 */
                if (this._isColdStart() || (oParsedShellHash.contextRaw && oParsedShellHash.contextRaw === "navResCtx") || this.history.backwards) {
                    /*
                     * coldstart -> always open in place because the new window
                     *              was opened by the user
                     *
                     * navResCtx -> url was generated by us and opened in a new
                     *              window or pasted in an existing window
                     *
                     * history.backwards -> url was was previously opened in
                     *              embedded mode (at any point in the
                     *              history), and we need to navigate back to
                     *              it in the same mode.
                     */
                    oResolvedHashFragment.navigationMode = oNavigationMode.embedded;
                    this.navigate(oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment);

                } else {
                    that._generateExpandedUrl(oResolvedHashFragment, oParsedShellHash, sFixedShellHash, oMetadata.title).done(function (oShellH) {
                        oResolvedHashFragment.navigationMode = oNavigationMode.newWindow;
                        if (oShellH.skippedParams || oShellH.hash.length >= 1023) {
                            // If the url already was compacted(contains sap-intent-param) it is not compacted further, but still too long)
                            // Also, we need encodeURI, as sFixedShellHash is in internal format
                            oResolvedHashFragment.url = encodeURI(sFixedShellHash);
                        } else {
                            // oShellH.hash was generated by hrefForExternal -> url in external format
                            oResolvedHashFragment.url = oShellH.hash;
                        }
                        that.navigate(oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment);

                    }).fail(function (sMsg) {
                        throw new Error(sMsg);
                    });
                }

                return true;
            }

            if (sNavigationMode === oNavigationMode.newWindow && this._isColdStart()) {
                /*
                 * Replace the content of the current window if the user has
                 * already opened one.
                 */
                oResolvedHashFragment.navigationMode = oNavigationMode.replace;
                this.navigate(oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment);

                return true;
            }

            return false;
        },

        /**
         * Performs navigation based on the given resolved hash fragment.
         *
         * @param {object} oParsedShellHash
         *     the parsed shell hash obtained via
         *     {@link sap.ushell.services.URLParsing} service
         * @param {string} sFixedShellHash
         *     the hash fragment to navigate to. It must start with "#" (i.e., fixed).<br />
         * @param {object} oMetadata
         *     the metadata object obtained via
         *     {@link sap.ushell.services.AppConfiguration#parseShellHash}
         * @param {object} oResolvedHashFragment
         *     the hash fragment resolved via
         *     {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}
         */
        navigate: function (oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment) {
            var sNavigationMode = oResolvedHashFragment.navigationMode,
                oEpcm;

            if (sap.ushell.utils.isNativeWebGuiNavigation(oResolvedHashFragment)) {
                // TODO: check coldstart/browser back: we would go to the homepage or close the window
                try {
                    oEpcm = window.external.getPrivateEpcm();
                    oEpcm.doNavigate(oResolvedHashFragment.url);
                    enableHashChange = false;
                    this.closeLoadingScreen();
                    this._windowHistoryBack(1);
                } catch (e) {
                    if (e.stack) {
                        jQuery.sap.log.error("Application initialization failed due to an Exception:\n" + e.stack);
                    }
                    this.restoreNavContainerAfterFailure();
                    this.hashChangeFailure(this.history.getHistoryLength(), e.name, e.message, oMetadata.title);
                }
                return;
            }

            if (this._handleConditionalNavigation.apply(this, arguments)) {
                return;
            }

            if (sNavigationMode === oNavigationMode.embedded) {
                this._handleEmbeddedNavMode(sFixedShellHash, oParsedShellHash, oMetadata, oResolvedHashFragment);

                // maybe restore hash...
                if (oParsedShellHash && oParsedShellHash.contextRaw === "navResCtx") {
                    // ... and we only do when URL was generated by us via
                    // navResCtx and opened in a new window or pasted in an
                    // existing window.
                    //
                    // In this case we are guaranteed that original_intent is
                    // among the parameters (as the only place we ever generate
                    // this url is in _generateExpandedUrl).
                    //
                    enableHashChange = false;
                    //replace tiny hash in window
                    hasher.replaceHash(oParsedShellHash.params.original_intent[0]);
                    //replace tiny hash in our history model
                    this.history._history[0] = oParsedShellHash.params.original_intent[0];
                }
                return;
            }

            if (sNavigationMode === oNavigationMode.replace) {
                // restore hash
                enableHashChange = false;
                this._changeWindowLocation(oResolvedHashFragment.url);
                return;
            }

            if (sNavigationMode === oNavigationMode.newWindow) {
                // restore hash
                enableHashChange = false;
                this._openAppNewWindow(oResolvedHashFragment.url);
                this.history.pop();
                this._windowHistoryBack(1);
                return;
            }

            // the navigation mode doesn't match any valid one.
            // In this case an error message is logged and previous hash is fetched
            this.hashChangeFailure(this.history.getHistoryLength(), "Navigation mode is not recognized", null, "sap.ushell.renderers.fiori2.Shell.controller");
        },

        _handleEmbeddedNavMode : function (sFixedShellHash, oParsedShellHash, oMetadata, oResolvedHashFragment) {
            var sAppId,
                oInnerControl,
                bNwbcApp,
                bIsNavToHome,
                sIntent;

            sap.ushell.services.AppConfiguration.setCurrentApplication(oResolvedHashFragment);

            this.setAppIcons(oMetadata);

            // obtain a unique id for the app (or the component)
            sAppId = '-' + oParsedShellHash.semanticObject + '-' + oParsedShellHash.action;

            bNwbcApp = oResolvedHashFragment.applicationType === "NWBC";
            bIsNavToHome = sFixedShellHash === "#" ||
                (oConfig.rootIntent && oConfig.rootIntent === oParsedShellHash.semanticObject + "-" + oParsedShellHash.action);

            if (bIsNavToHome && !this.oHomeApp && !oConfig.disableHomeAppCache) {
                //save the "home app" component so that we will be able to initialize its router
                //when navigating back to it
                this._saveHomePageComponent();
            }
            //Support migration from version 1.28 or lower in case local resolution for empty hash was used
            sIntent = oParsedShellHash ? oParsedShellHash.semanticObject + "-" + oParsedShellHash.action : "";


            this.oLoadingDialog.showAppInfo(oMetadata.title, oMetadata.icon || null);

            if (bNwbcApp) {
                this.switchViewState("minimal");

            } else if (bIsNavToHome) {
                this.switchViewState("home");
            } else {
                this.switchViewState(
                    allowedAppStates.indexOf(oConfig.appState) >= 0
                        ? oConfig.appState
                        : "app"
                );
            }
            oInnerControl = this.getWrappedApplication(
                sIntent,
                oMetadata,             // metadata
                oResolvedHashFragment, // the resolved Navigation Target
                sAppId,
                oResolvedHashFragment.fullWidth || oMetadata.fullWidth || bNwbcApp
            );
            //set the NavContainer intialPage
            if (bIsNavToHome && !oConfig.disableHomeAppCache) {
                if (!this.oNavContainer.getInitialPage()) {
                    this.oNavContainer.setInitialPage(oInnerControl);
                }
            }
            this._performTransition(oInnerControl);
        },

        getWrappedApplication: function (sIntent, oMetadata, oResolvedNavigationTarget, sAppId, bFullWidth) {
            var oInnerControl,
                oExistingPage,
                oAppContainer;

            oExistingPage = this.oNavContainer.getPage("application" + sAppId) || this.oNavContainer.getPage("applicationShellPage" + sAppId);
            //if the page/app we are about to create already exists, we need to destroy it before
            //we go on with the flow. we have to destroy the existing page since we need to avoid
            //duplicate ID's
            //in case that we are navigating to the root intent, we do not destroy the page.
            if (oExistingPage && sIntent !== oConfig.rootIntent) {
                oExistingPage.destroy();
            } else if (oExistingPage) {
                return oExistingPage;
            }

            jQuery.sap.require('sap.ushell.components.container.ApplicationContainer');
            setTimeout(function () {
                sap.ui.getCore().getEventBus().publish("launchpad", "appOpening", oResolvedNavigationTarget);
                jQuery.sap.log.info('app is being opened');
            }, 0);
            if (oConfig.applications) {
                oResolvedNavigationTarget.applicationConfiguration = oConfig.applications[sIntent];
            }

            oAppContainer = new sap.ushell.components.container.ApplicationContainer("application" + sAppId, oResolvedNavigationTarget);
            this.publishNavigationStateEvents(oAppContainer, oResolvedNavigationTarget);

            if (bFullWidth) {
                if (!oMetadata.hideLightBackground) {
                    //temporary solution for setting the light background for applications
                    oAppContainer.addStyleClass('sapMShellGlobalInnerBackground');
                }
                oInnerControl = oAppContainer;
            } else {
                jQuery.sap.require("sap.m.Shell");
                oInnerControl = new sap.m.Shell("applicationShellPage" + sAppId, {
                    logo: sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif'),
                    title : oMetadata.title,
                    showLogout : false,
                    app : oAppContainer
                }).addStyleClass("sapUshellApplicationPage");
                if (!oMetadata.title) {
                    oInnerControl.addStyleClass("sapUshellApplicationPageNoHdr");
                }
            }

            this._applyContentDensity();

            oAppContainer.onfocusin = function () {
                //focus not in the shell
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = false;
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime = false;
            };
            oAppContainer.onfocusout = function () {
                //focus in the shell
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusOnShell = true;
                sap.ushell.renderers.fiori2.AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime = true;
            };

            // Add inner control for next request
            this.oNavContainer.addPage(oInnerControl);

            return oInnerControl;
        },

        /**
         * adds a listener to the "componentCreated" Event that is published by the
         * "sap.ushell.components.container.ApplicationContainer".
         * once the "home app" Component is saved, the listener is removed, and this function
         * will not do anything.
         */
        _saveHomePageComponent: function () {
            if (this.oHomeApp) {
                return;
            }
            var that = this,
                sContainerNS = "sap.ushell.components.container.ApplicationContainer",
                fListener = function (oEvent, sChannel, oData) {
                    that.oHomeApp = oData.component;
                    sap.ui.getCore().getEventBus().unsubscribe(sContainerNS, 'componentCreated', fListener);
                };
            sap.ui.getCore().getEventBus().subscribe(sContainerNS, 'componentCreated', fListener);
        },

        /**
         * Shows an error message and navigates to the previous page.
         *
         * @param {number} iHistoryLength the length of the history
         *    <b>before</b> the navigation occurred.
         * @param {string} sMessage the error message
         * @param {string} sDetails the detailed error message
         * @param {string} sComponent the component that generated the error message
         */
        hashChangeFailure : function (iHistoryLength, sMessage, sDetails, sComponent) {
            this.reportError(sMessage, sDetails, sComponent);
            this.closeLoadingScreen();
            //use timeout to avoid "MessageService not initialized.: error
            this.delayedMessageError(sap.ushell.resources.i18n.getText("fail_to_start_app_try_later"));
            closeAllDialogs = false;

            if (iHistoryLength === 0) {
                // if started with an illegal shell hash (deep link), we just remove the hash
                hasher.setHash("");
            } else {
                // navigate to the previous URL since in this state the hash that has failed to load is in the URL.
                this._windowHistoryBack(1);
            }
        },

        reportError : function (sMessage, sDetails, sComponent) {
            jQuery.sap.log.error(sMessage, sDetails, sComponent);
        },

        delayedMessageError : function (sMsg) {
            setTimeout(function () {
                if (sap.ushell.Container !== undefined) {
                    sap.ushell.Container.getService("Message").error(sMsg);
                }
            }, 0);
        },

        fixShellHash : function (sShellHash) {
            if (!sShellHash) {
                sShellHash = '#';
            } else if (sShellHash.charAt(0) !== '#') {
                sShellHash = '#' + sShellHash;
            }
            return sShellHash;
        },

        restoreNavContainerAfterFailure: function () {
            // create a new navContainer because old one is in a irreparable state
            // save all other pages besides the page which causes the error
            var oCurrentPage = this.oNavContainer.getCurrentPage(),
                oUnifiedShell,
                aOldPages;

            if (oCurrentPage) {
                this.oNavContainer.removePage(oCurrentPage).destroy();
            }
            aOldPages = this.oNavContainer.removeAllPages();

            this.oNavContainer.destroy();
            this.oNavContainer = this.getView().initNavContainer(this);
            oUnifiedShell = this.getView().getOUnifiedShell();
            oUnifiedShell.addContent(this.oNavContainer);

            jQuery.each(aOldPages, jQuery.proxy(function (i, v) {
                if (!this.oNavContainer.getPage(v.getId())) {
                    this.oNavContainer.addPage(v);
                }
                if (v.getId() === this.oNavContainer.getInitialPage()) {
                    v.removeStyleClass("sapMNavItemHidden"); // still there because of old navContainer
                }
            }, this));
        },

        publishNavigationStateEvents : function (oAppContainer, oApplication) {
            //after the app container is rendered, publish an event to notify
            //that an app was opened
            var origAfterRendering = oAppContainer.onAfterRendering,
                origExit,
                that = this;

            oAppContainer.onAfterRendering = function () {
                if (origAfterRendering) {
                    origAfterRendering.apply(this, arguments);
                }
                //wrapped in setTimeout since "pubilsh" is not async
                setTimeout(function () {
                    sap.ui.getCore().getEventBus().publish("launchpad", "appOpened", oApplication);
                    jQuery.sap.log.info('app was opened');
                }, 0);

                //publish the event externally
                sap.ushell.renderers.fiori2.utils.publishExternalEvent("appOpened", oApplication);
            };
            //after the app container exit, publish an event to notify
            //that an app was closed
            origExit = oAppContainer.exit;
            oAppContainer.exit = function () {
                if (origExit) {
                    origExit.apply(this, arguments);
                }
                //apply the original density settings
                that._applyContentDensity();

                //wrapped in setTimeout since "pubilsh" is not async
                setTimeout(function () {
                    sap.ui.getCore().getEventBus().publish("launchpad", "appClosed", oApplication);
                    jQuery.sap.log.info('app was closed');
                }, 0);

                //publish the event externally
                sap.ushell.renderers.fiori2.utils.publishExternalEvent("appClosed", oApplication);
            };
        },

        _openAppNewWindow : function (sUrl) {
            var newWin = window.open(sUrl);

            if (!newWin) {
                var msg = sap.ushell.resources.i18n.getText("fail_to_start_app_popup_blocker");
                this.delayedMessageError(msg);
            }
        },

        _windowHistoryBack : function (iStepsBack) {
            window.history.back(iStepsBack);
        },

        _changeWindowLocation : function (sUrl) {
            window.location.href = sUrl;
        },

        setAppIcons: function (oMetadataConfig) {
            var sModulePath = jQuery.sap.getModulePath("sap.ushell"),
                oLaunchIconPhone = (oMetadataConfig && oMetadataConfig.homeScreenIconPhone) ||
                    (sModulePath + '/themes/base/img/launchicons/57_iPhone_Desktop_Launch.png'),
                oLaunchIconPhone2 = (oMetadataConfig && oMetadataConfig["homeScreenIconPhone@2"]) ||
                    (sModulePath + '/themes/base/img/launchicons/114_iPhone-Retina_Web_Clip.png'),
                oLaunchIconTablet = (oMetadataConfig && oMetadataConfig.homeScreenIconTablet) ||
                    (sModulePath + '/themes/base/img/launchicons/72_iPad_Desktop_Launch.png'),
                oLaunchIconTablet2 = (oMetadataConfig && oMetadataConfig["homeScreenIconTablet@2"]) ||
                    (sModulePath + '/themes/base/img/launchicons/144_iPad_Retina_Web_Clip.png'),
                oFavIcon = (oMetadataConfig && oMetadataConfig.favIcon) ||
                    (sModulePath + '/themes/base/img/launchpad_favicon.ico'),
                sTitle = (oMetadataConfig && oMetadataConfig.title) || "",
                sCurrentFavIconHref = this.getFavIconHref();
            if (sap.ui.Device.os.ios) {
                jQuery.sap.setIcons({
                    'phone': oLaunchIconPhone,
                    'phone@2': oLaunchIconPhone2,
                    'tablet': oLaunchIconTablet,
                    'tablet@2': oLaunchIconTablet2,
                    'favicon': oFavIcon,
                    'precomposed': true
                });
            } else if (sCurrentFavIconHref !== oFavIcon) {
                jQuery.sap.setIcons({
                    'phone': '',
                    'phone@2': '',
                    'tablet': '',
                    'tablet@2': '',
                    'favicon': oFavIcon,
                    'precomposed': true
                });
            }

            window.document.title = sTitle;
        },

        getFavIconHref: function () {
            return jQuery('link').filter('[rel="shortcut icon"]').attr('href') || '';
        },

        externalSearchTriggered: function (sChannelId, sEventId, oData) {
            oModel.setProperty("/searchTerm", oData.searchTerm);
            oData.query = oData.searchTerm;
        },
        onAfterNavigate: function (oEvent) {
            var sHome = this.oNavContainer.getInitialPage(), //DashboardPage
                sFrom = oEvent.getParameter("fromId");


            if (sFrom && sFrom !== sHome) {
                this.oNavContainer.removePage(sap.ui.getCore().byId(sFrom));
                sap.ui.getCore().byId(sFrom).destroy();
            }
            this.closeLoadingScreen();

            if (oEvent.mParameters && oEvent.mParameters.toId === sHome) {
                sap.ui.getCore().byId("configBtn").focus();
                if (this.oHomeApp && this.oHomeApp.setInitialConfiguration) {
                    this.oHomeApp.setInitialConfiguration();
                }
            }
        },

        closeLoadingScreen: function () {
            this.oLoadingDialog.closeLoadingScreen();
        },

        togglePane : function (oEvent) {
            var oSource = oEvent.getSource(),
                bState = oSource.getSelected();

            sap.ui.getCore().getEventBus().publish("launchpad", "togglePane", {currentContent: oSource.getModel().getProperty("/currentState/paneContent")});

            if (oEvent.getParameter("id") === "categoriesBtn") {
                oSource.getModel().setProperty("/currentState/showCurtainPane", !bState);
            } else {
                oSource.getModel().setProperty("/currentState/showPane", !bState);
            }
        },

        loadUserImage: function () {
            if (!bUserImageAlreadyLoaded) {
                this.getView().loadUserImage();
                bUserImageAlreadyLoaded = true;
            }
        },

        _requireCoreExt : function (sFixedShellHash) {
            // check if we need to load core-ext-light.
            // we load core-ext-light if the flag is true or undefined, or if the intent to be opened is not the root intent
            if ((oConfig.preloadLibrariesForRootIntent || oConfig.preloadLibrariesForRootIntent === undefined) ||
                    (sFixedShellHash !== '#' + oConfig.rootIntent && sFixedShellHash)) {
                try {
                    jQuery.sap.require('sap.fiori.core-ext-light');
                } catch (error) {
                    jQuery.sap.log.warning("failed to load sap.fiori.core-ext-light!");
                }
            }
        },

        _loadCoreExt: function () {
            //if sap.fiori.core or sap.fiori.core-ext-light are loaded, we do not need to load core-ext-light
            var bAlreadyLoaded = jQuery.sap.isDeclared('sap.fiori.core', true) || jQuery.sap.isDeclared('sap.fiori.core-ext-light', true),
                sModuleName = window['sap-ui-debug'] ? 'sap/fiori/core-ext-light-dbg.js' : 'sap/fiori/core-ext-light.js',
                that = this;

            if (bAlreadyLoaded) {
                return;
            }
            this.oCoreExtLoadingDeferred = new jQuery.Deferred();
            jQuery.sap._loadJSResourceAsync(sModuleName)
                .then(function () {
                    that.oCoreExtLoadingDeferred.resolve();
                    setTimeout(function () {
                        sap.ui.getCore().getEventBus().publish("launchpad", "coreExtLoaded");
                    }, 0);
            })
                .catch(function () {
                    jQuery.sap.log.warning('failed to load sap.fiori.core-ext-light');
                    that.oCoreExtLoadingDeferred.reject();
                });
        },


        /*--Strat new RE Code-------------------------------------------------------------------------*/
        /*-----------Signitures--Remove--------------------*/
        removeHeaderItem: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("headItems", aIds, bCurrentState, aStates);
        },

        removeToolAreaItem: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("toolAreaItems", aIds, bCurrentState, aStates);
        },

        removeHeaderEndItem: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("headEndItems", aIds, bCurrentState, aStates);
        },

        removeSubHeader: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("subHeaders", aIds, bCurrentState, aStates);
        },

        removeActionButton: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("actions", aIds, bCurrentState, aStates);
        },

        removeLeftPaneContent: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("paneContent", aIds, bCurrentState, aStates);
        },

        removeFloatingActionButton: function (aIds, bCurrentState, aStates) {
            this._removeShellItem("floatingActions", aIds, bCurrentState, aStates);
        },

        /*-----------Signitures--Add--------------------*/

        addHeaderItem: function (aIds, bCurrentState, aStates) {
            this._addUpToThreeItem("headItems", aIds, bCurrentState, aStates);
        },

        addToolAreaItem: function (sId, bCurrentState, aStates) {
            this._addToolAreaItem("toolAreaItems", sId, bCurrentState, aStates);
        },

        addHeaderEndItem: function (aIds, bCurrentState, aStates) {
            this._addUpToThreeItem("headEndItems", aIds, bCurrentState, aStates);
        },

        addSubHeader: function (aIds, bCurrentState, aStates) {
            this._addShellItem("subHeaders", aIds, bCurrentState, aStates);
        },

        addActionButton: function (aIds, bCurrentState, aStates, bIsFirst) {
            if (bIsFirst) {
                this._addActionButtonAtStart("actions", aIds, bCurrentState, aStates);
            } else {
                this._addActionButton("actions", aIds, bCurrentState, aStates);
            }
        },

        addLeftPaneContent: function (aIds, bCurrentState, aStates) {
            this._addShellItem("paneContent", aIds, bCurrentState, aStates);
        },

        addFloatingActionButton: function (aIds, bCurrentState, aStates) {
            this._addShellItem("floatingActions", aIds, bCurrentState, aStates);
        },


        /*-----------------------------Handlers----------------------------------------------------------------*/
        _addActionButtonAtStart: function (sPropertyString, aId, bCurrentState, aStates) {
            var fnValidation = function (aActionItems, aId, sState) {
                return true;
            }, fnUpdate = function (modelPropertyString, aIds) {
                var aActions = oModel.getProperty(modelPropertyString),
                    cAIds = aIds.slice(0);

                oModel.setProperty(modelPropertyString, cAIds.concat(aActions));
            };
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _addActionButton: function (sPropertyString, aId, bCurrentState, aStates) {
            var fnValidation = function (aActionItems, aId, sState) {
                return true;
            }, fnUpdate = function (modelPropertyString, aIds) {
                var aActions = oModel.getProperty(modelPropertyString);

                var iLogoutButtonIndex = aActions.indexOf("logoutBtn");
                if (iLogoutButtonIndex > -1) {
                    aActions.splice(iLogoutButtonIndex, 0, aIds[0]);
                } else {
                    aActions.push(aIds[0]);
                }

                oModel.setProperty(modelPropertyString, aActions);
            };
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _addUpToThreeItem: function (sPropertyString, aId, bCurrentState, aStates) {
            var fnValidation = function (aItems, aIds, sState) {
                var allocatedItemSpace = 0,
                    index,
                    sId;

                for (index = 0; index < aItems.length; index++) {
                    sId = aItems[index];
                    if (sId === 'actionsBtn') {
                        allocatedItemSpace += 2;
                    } else {
                        allocatedItemSpace++;
                    }

                    if (allocatedItemSpace + aIds.length > 3) {
                        jQuery.sap.log.warning("maximum of three items has reached, cannot add more items.");
                        return false;
                    }
                }

                return true;
            }, fnUpdate = function (modelPropertyString, aIds) {
                var aItems = oModel.getProperty(modelPropertyString),
                    aCopyItems = aItems.slice(0);
                oModel.setProperty(modelPropertyString, aCopyItems.concat(aIds));
            };
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _addShellItem: function (sPropertyString, aId, bCurrentState, aStates) {
            var fnValidation = function (aItems, aId, sState) {
                if (aItems.length > 0) {
                    jQuery.sap.log.warning("You can only add one item. Replacing existing item: " + aItems[0] + " in state: " + sState + ", with the new item: " + aId[0] + ".");
                }
                return true;
            }, fnUpdate = function (modelPropertyString, aIds) {
                oModel.setProperty(modelPropertyString, aId.slice(0));
            };
            this._setShellItem(sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _addToolAreaItem: function (sPropertyString, sId, bCurrentState, aStates) {
            var fnValidation = function () {
                return true;
            }, fnUpdate = function (modelPropertyString, sId) {
                var aItems = oModel.getProperty(modelPropertyString);
                aItems.push(sId);

                oModel.setProperty(modelPropertyString, aItems);

            };

            var index,
                aPassStates = this._getPassStates(aStates);

            for (index = 0; index < aPassStates.length; index++) {
                this.showShellItem("/toolAreaVisible", aPassStates[index], true);
            }

            this._setShellItem(sPropertyString, sId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _removeShellItem: function (sPropertyString, sId, bCurrentState, aStates) {
            var fnValidation = function (aItems, aIds) {
                var location,
                    sId,
                    index;

                for (index = 0; index < aIds.length; index++) {
                    sId = aIds[index];
                    location = aItems.indexOf(sId);
                    if (location < 0) {
                        jQuery.sap.log.warning("You cannot remove Item: " + sId + ", the headItem does not exists.");
                        return false;
                    }
                }

                return true;
            }, fnUpdate = function (modelPropertyString, aIds) {
                var aItems = oModel.getProperty(modelPropertyString),
                    location,
                    sId,
                    index;

                for (index = 0; index < aIds.length; index++) {
                    sId = aIds[index];
                    location = aItems.indexOf(sId);
                    if (location > -1) {
                        aItems.splice(location, 1);
                    }
                }

                oModel.setProperty(modelPropertyString, aItems);
            };
            this._setShellItem(sPropertyString, sId, bCurrentState, aStates, fnValidation, fnUpdate);
        },

        _setShellItem: function (sPropertyString, aId, bCurrentState, aStates, fnValidation, fnUpdate) {
            var modelPropertyString,
                aItems;
            if (bCurrentState === true) {
                modelPropertyString = "/currentState/" + sPropertyString;
                aItems = oModel.getProperty(modelPropertyString);

                //make validations
                if (fnValidation(aItems, aId, "currentState") === false) {
                    return;
                }
                fnUpdate(modelPropertyString, aId);
            } else {
                var aPassStates = this._getPassStates(aStates),
                    i,
                    oCurrentStateName = oModel.getProperty("/currentState/stateName");

                for (i = 0; i < aPassStates.length; i++) {
                    var sState = aPassStates[i],
                        j;
                    modelPropertyString = "/states/" + sState + "/" + sPropertyString;
                    aItems = oModel.getProperty(modelPropertyString);

                    //make validations
                    if (fnValidation(aItems, aId, sState) === false) {
                        return;
                    }

                    var aModelStates = this._getModelStates(sState);
                    for (j = 0; j < aModelStates.length; j++) {
                        modelPropertyString = "/states/" + aModelStates[j] + "/" + sPropertyString;
                        fnUpdate(modelPropertyString, aId);
                        if (oCurrentStateName === aModelStates[j]) {
                            modelPropertyString = "/currentState/" + sPropertyString;
                            fnUpdate(modelPropertyString, aId);
                        }
                    }
                }
            }
        },

        //gets the array of the valid states that need to be update according to the arguments that were passed
        _getPassStates: function (aStates) {
            //an array with the relevant states that were pass as argument
            var aPassStates = [],
                i;
            aStates = aStates || [];

            for (i = 0; i < aStates.length; i++) {
                if (aStates[i] !== undefined) {
                    if (aStates[i] !== "home" && aStates[i] !== "app") {
                        throw new Error("sLaunchpadState value is invalid");
                    }
                    aPassStates.push(aStates[i]);
                }
            }

            if (!aPassStates.length) {
                aPassStates = ["app", "home"];
            }

            return aPassStates;
        },

        //gets all the models states that need to be update according to the state that was pass as argument
        _getModelStates: function (sStates) {

            //an array with the relevant states that need to updated in the model
            var aModelStates = [];

            //in case we need to update to the "app" state, need to update all app states
            if (sStates === "app") {
                var appStates = ["app", "minimal", "standalone", "embedded"];
                aModelStates = aModelStates.concat(appStates);
            } else {
                aModelStates.push(sStates);
            }
            return aModelStates;
        },

        /*---------------------------general purpose-------------------------*/

        showShellItem : function (sProperty, sState, bVisible) {

            var sModelStateProperty = "/states/" + sState + sProperty,
                sModelCurrentStateProperty = "/currentState" + sProperty;
            oModel.setProperty(sModelStateProperty, bVisible);
            if (oModel.getProperty("/currentState/stateName") === sState) {
                oModel.setProperty(sModelCurrentStateProperty, bVisible);
            }
        },

        _setHeaderTitle: function (sTitle, oInnerControl) {
            if (typeof sTitle !== "string") {
                throw new Error("sTitle type is invalid");
            }

            this.getView().getOUnifiedShell().setTitle(sTitle, oInnerControl);
        },

        _setHeaderHiding: function (bHiding) {
            if (typeof bHiding !== "boolean") {
                throw new Error("bHiding type is invalid");
            }
            oModel.setProperty("/currentState/headerHiding", bHiding);
        },

        addEndUserFeedbackCustomUI: function (oCustomUIContent, bShowCustomUIContent) {
            if (oCustomUIContent) {
                this.oEndUserFeedbackConfiguration.customUIContent = oCustomUIContent;
            }
            if (bShowCustomUIContent === false) {
                this.oEndUserFeedbackConfiguration.showCustomUIContent = bShowCustomUIContent;
            }
        },


        /*--End new RE Code-------------------------------------------------------------------------*/

        setFooter: function (oFooter) {
            if (typeof oFooter !== "object" || !oFooter.getId) {
                throw new Error("oFooter value is invalid");
            }
            if (this.getView().oShellPage.getFooter() !== null) { //there can be only 1 footer
                jQuery.sap.log.warning("You can only set one footer. Replacing existing footer: " + this.getView().oShellPage.getFooter().getId() + ", with the new footer: " + oFooter.getId() + ".");
            }
            this.getView().oShellPage.setFooter(oFooter);
        },

        removeFooter: function () {
            if (this.getView().oShellPage.getFooter() === null) {
                jQuery.sap.log.warning("There is no footer to remove.");
                return;
            }
            this.getView().oShellPage.setFooter(null);
        },

        addUserPreferencesEntry: function (entryObject) {
            this._validateUserPrefEntryConfiguration(entryObject);
            this._updateUserPrefModel(entryObject);
        },


        _validateUserPrefEntryConfiguration: function (entryObject) {
            if ((!entryObject) || (typeof entryObject !== "object")) {
                throw new Error("object oConfig was not provided");
            }
            if (!entryObject.title) {
                throw new Error("title was not provided");
            }

            if (!entryObject.value) {
                throw new Error("value was not provided");
            }

            if (typeof entryObject.entryHelpID !== "undefined") {
                if (typeof entryObject.entryHelpID !== "string") {
                    throw new Error("entryHelpID type is invalid");
                } else {
                    if (entryObject.entryHelpID === "") {
                        throw new Error("entryHelpID type is invalid");
                    }
                }
            }

            if (entryObject.title && typeof entryObject.title !== "string") {
                throw new Error("title type is invalid");
            }

            if (typeof entryObject.value !== "function" && typeof entryObject.value !== "string" && typeof entryObject.value !== "number") {
                throw new Error("value type is invalid");
            }

            if (entryObject.onSave && typeof entryObject.onSave !== "function") {
                throw new Error("onSave type is invalid");
            }

            if (entryObject.content && typeof entryObject.content !== "function") {
                throw new Error("content type is invalid");
            }

            if (entryObject.onCancel && typeof entryObject.onCancel !== "function") {
                throw new Error("onCancel type is invalid");
            }
        },
        addElementToManagedQueue: function (oItem) {
            this.managedElementsQueue.push(oItem);
        },
        destroyManageQueue: function () {
            var oItem;
            if (this.managedElementsQueue) {
                oItem = this.managedElementsQueue.pop();

                while (oItem) {
                    oItem.destroy();
                    oItem = this.managedElementsQueue.pop();
                }
            }
        },
        switchViewState: function (sState, bSaveLastState) {

            var sPath = sState[0] === "/" ? sState : "/states/" + sState,
                oState = oModel.getProperty(sPath),
                oCurrentState = oModel.getProperty("/currentState") || {};

            if (!!bSaveLastState) {
                oModel.setProperty("/lastState", oCurrentState);
            }

            // Change "currentState" property in the model to the new state
            oModel.setProperty("/currentState", jQuery.extend(true, {}, {}, oState));
            this.destroyManageQueue();

            if (sState === "searchResults") {
                oModel.setProperty("/lastSearchScreen", '');
                if (!hasher.getHash().indexOf("Action-search") === 0) {
                    var searchModel = sap.ui.getCore().getModel("searchModel");
                    hasher.setHash("Action-search&/searchTerm=" + searchModel.getProperty("/searchBoxTerm") + "&dataSource=" + JSON.stringify(searchModel.getDataSourceJson()));
                }
            }

            sap.ushell.renderers.fiori2.AccessKeysHandler.resetAppKeysHandler();
        },

        _updateUserPrefModel: function (entryObject) {
            var newEntry = {
                "entryHelpID": entryObject.entryHelpID,
                "title": entryObject.title,
                "editable": entryObject.content ? true : false,
                "valueArgument" : entryObject.value,
                "valueResult" : null,
                "onSave": entryObject.onSave,
                "onCancel": entryObject.onCancel,
                "contentFunc": entryObject.content,
                "contentResult": null
            };
            var userPreferencesEntryArray = oModel.getProperty("/userPreferences/entries");
            userPreferencesEntryArray.push(newEntry);
            oModel.setProperty("/userPreferences/entries", userPreferencesEntryArray);
        },

        pressActionBtn: function (oEvent) {
            // don't hide the shell header when the action sheet is open on mobile devices only
            if (!sap.ui.Device.system.desktop) {
                //keep original header hiding value for reset after action sheet close
                var origHeaderHiding = oModel.getProperty("/currentState").headerHiding;
                oModel.setProperty("/currentState/headerHiding", false);
            }
            var oActionSheet = sap.ui.getCore().byId('headActions');
            if (!oActionSheet) {
                var oUserPrefButton = sap.ui.getCore().byId("userPreferencesButton"),
                    oLogoutButton = new sap.ushell.ui.footerbar.LogoutButton("logoutBtn"),
                    oAboutButton = new sap.ushell.ui.footerbar.AboutButton("aboutBtn");
                if (!oUserPrefButton) {
                    oUserPrefButton = new sap.ushell.ui.footerbar.UserPreferencesButton("userPreferencesButton");
                    this._setUserPrefModel(); // set the "/userPreference" property in the model
                }

                jQuery.sap.require('sap.ushell.ui.footerbar.ContactSupportButton');
                jQuery.sap.require('sap.ushell.ui.footerbar.EndUserFeedback');
                var oContactSupport = new sap.ushell.ui.footerbar.ContactSupportButton("ContactSupportBtn", {
                        visible: this.bContactSupportEnabled
                    }),
                    oEndUserFeedback,
                    oEndUserFeedbackEnabled = oModel.getProperty('/showEndUserFeedback');

                if (oEndUserFeedbackEnabled) {
                    oEndUserFeedback = new sap.ushell.ui.footerbar.EndUserFeedback("EndUserFeedbackBtn", {
                        showAnonymous: this.oEndUserFeedbackConfiguration.showAnonymous,
                        showLegalAgreement: this.oEndUserFeedbackConfiguration.showLegalAgreement,
                        showCustomUIContent: this.oEndUserFeedbackConfiguration.showCustomUIContent,
                        feedbackDialogTitle: this.oEndUserFeedbackConfiguration.feedbackDialogTitle,
                        textAreaPlaceholder: this.oEndUserFeedbackConfiguration.textAreaPlaceholder,
                        customUIContent: this.oEndUserFeedbackConfiguration.customUIContent
                    });
                }
                // if xRay is enabled
                if (oModel.getProperty("/enableHelp")) {
                    oUserPrefButton.addStyleClass('help-id-loginDetails');// xRay help ID
                    oLogoutButton.addStyleClass('help-id-logoutBtn');// xRay help ID
                    oAboutButton.addStyleClass('help-id-aboutBtn');// xRay help ID
                    if (oEndUserFeedbackEnabled) {
                        oEndUserFeedback.addStyleClass('help-id-EndUserFeedbackBtn'); // xRay help ID
                    }
                    oContactSupport.addStyleClass('help-id-contactSupportBtn');// xRay help ID
                }

                // Filtering out buttons that does not exist.
                // i.e. when the button's name is included in the array /currentState/actions but the actual control was not created.
                // For example EndUserFeedback button is not created when EndUserFeedbackAdapter is not implemented,
                //  but its name ("EndUserFeedbackBtn") appears in the actions array for several states.
                var oFilter = new sap.ui.model.Filter('', 'EQ', 'a');
                oFilter.fnTest = function (sButtonNameInUpperCase) {
                    var aButtonsNames = oModel.getProperty("/currentState/actions"),
                        sButtonName,
                        index;
                    for (index = 0; index < aButtonsNames.length; index++) {
                       sButtonName = aButtonsNames[index];
                       if (sButtonName.toUpperCase() == sButtonNameInUpperCase) {
                           return !!sap.ui.getCore().byId(sButtonName);
                       }
                    }
                };

                oActionSheet = new sap.m.ActionSheet("headActions", {
                    placement: sap.m.PlacementType.Bottom,
                    buttons: {
                        path: "/currentState/actions",
                        filters:[oFilter],
                        factory: function (sId, oContext) {
                            return sap.ui.getCore().byId(oContext.getObject());
                        }
                    }
                });
                oActionSheet.updateAggregation = this.getView().updateShellAggregation;
                oActionSheet.setModel(oModel);
                this.getView().aDanglingControls.push(oActionSheet, oUserPrefButton, oLogoutButton, oAboutButton, oContactSupport);
                if (oEndUserFeedbackEnabled) {
                    this.getView().aDanglingControls.push(oEndUserFeedback);
                }
                oActionSheet.attachAfterClose(oActionSheet, function () {
                    // reset header hiding according to the current state (on mobile devices only)
                    if (!sap.ui.Device.system.desktop) {
                        oModel.setProperty("/currentState/headerHiding", origHeaderHiding);
                    }
                });
            }
            oActionSheet.openBy(oEvent.getSource());
        },
        _setUserPrefModel: function () {
            var userPreferencesEntryArray = oModel.getProperty("/userPreferences/entries");
            var oDefaultUserPrefModel =  this._getUserPrefDefaultModel();
            oDefaultUserPrefModel.entries = oDefaultUserPrefModel.entries.concat(userPreferencesEntryArray);

            oModel.setProperty("/userPreferences", oDefaultUserPrefModel);
        },

        _getUserPrefDefaultModel: function () {
            var that = this;
            var oUser = sap.ushell.Container.getUser();
            var language = oUser.getLanguage();
            var server = window.location.host;
            var languageTitle = sap.ushell.resources.i18n.getText("languageFld");
            var serverTitle = sap.ushell.resources.i18n.getText("serverFld");

            // search preferences (user profiling, concept of me)
            // entry is added async only if search is active
            jQuery.sap.require('sap.ushell.renderers.fiori2.search.userpref.SearchPrefs');
            var SearchPreferences = sap.ushell.renderers.fiori2.search.userpref.SearchPrefs;
            var searchPreferencesEntry = SearchPreferences.getEntry();
            searchPreferencesEntry.isSearchPrefsActive().done(function(isSearchPrefsActive){
                if (!isSearchPrefsActive){
                    return;
                }
                that.addUserPreferencesEntry(searchPreferencesEntry);
            });

            function ThemeSelectorEntry() {
                this.view = null;

                this.getView = function () {
                    if (!this.view || !sap.ui.getCore().byId('userPrefThemeSelector')) {
                        this.view = sap.ui.jsview("userPrefThemeSelector", "sap.ushell.renderers.fiori2.theme_selector.ThemeSelector");
                    }
                    return this.view;
                };

                var onSaveFunc = function () {
                    var dfd = this.getView().getController().onSave();
                    dfd.done(function () {
                        // re-calculate tiles background color according to the selected theme
                        if (oModel.getProperty("/tilesOpacity") === true) {
                            sap.ushell.utils.handleTilesOpacity();
                        }
                    });
                    return dfd;
                }.bind(this);

                var onCancelFunc = function () {
                    return this.getView().getController().onCancel();
                }.bind(this);

                var getContentFunc = function () {
                    return this.getView().getController().getContent();
                }.bind(this);

                var getValueFunc = function () {
                    return this.getView().getController().getValue();
                }.bind(this);

                var isThemeEditable;
                if (oModel.getProperty("/setTheme") !== undefined) {
                    isThemeEditable =   oModel.getProperty("/setTheme") && oUser.isSetThemePermitted();
                } else {
                    isThemeEditable = oUser.isSetThemePermitted();
                }

                return {
                    entryHelpID: "themes",
                    title: sap.ushell.resources.i18n.getText("theme"),
                    editable: isThemeEditable,
                    valueArgument: getValueFunc,// the function which will be called to get the entry value
                    valueResult: null,
                    onSave: onSaveFunc,
                    onCancel: onCancelFunc, // the function which will be called when canceling entry changes
                    contentFunc: getContentFunc,// the function which will be called to get the content of the detailed entry
                    contentResult: null
                };
            }

            var themeSelectorEntry = new ThemeSelectorEntry();
            function CompactCozySelectorEntry() {
                this.view = null;

                this.getView = function() {
                    if (!this.view || !sap.ui.getCore().byId('userPrefCompactCozySelector')){
                        this.view = sap.ui.jsview("userPrefCompactCozySelector", "sap.ushell.renderers.fiori2.compactCozy_selector.CompactCozySelector");
                    }
                    return this.view;
                };

                var onSaveFunc = function() {
                    return  this.getView().getController().onSave();
                }.bind(this);

                var onCancelFunc = function () {
                    return this.getView().getController().onCancel();
                }.bind(this);

                var getContentFunc = function () {
                    return this.getView().getController().getContent();
                }.bind(this);

                var getValueFunc = function () {
                    return this.getView().getController().getValue();
                }.bind(this);

                return {
                    entryHelpID: "contentDensity",
                    title: sap.ushell.resources.i18n.getText("displayDensity"),
                    editable: true,
                    valueArgument: getValueFunc,// the function which will be called to get the entry value
                    valueResult: null,
                    onSave: onSaveFunc,
                    onCancel: onCancelFunc, // the function which will be called when canceling entry changes
                    contentFunc: getContentFunc,// the function which will be called to get the content of the detailed entry
                    contentResult: null
                };
            }

            function DefaultParametersEntry() {
                this.view = null;

                this.getView = function () {
                    if (!this.view || !sap.ui.getCore().byId('defaultParametersSelector')) {
                        this.view = sap.ui.jsview("defaultParametersSelector", "sap.ushell.renderers.fiori2.defaultParameters_selector.DefaultParameters");
                    }
                    return this.view;
                };

                var onSaveFunc = function () {
                    return this.getView().getController().onSave();
                }.bind(this);

                var onCancelFunc = function () {
                    return this.getView().getController().onCancel();
                }.bind(this);

                var getContentFunc = function () {
                    return this.getView().getController().getContent();
                }.bind(this);

                var getValueFunc = function () {
                    return this.getView().getController().getValue();
                }.bind(this);

                return {
                    //entryHelpID: "themes",
                    title: sap.ushell.resources.i18n.getText("userDefaults"),
                    editable: true,
                    visible: false,
                    valueArgument: getValueFunc,// the function which will be called to get the entry value
                    valueResult: null,
                    onSave: onSaveFunc,
                    onCancel: onCancelFunc, // the function which will be called when canceling entry changes
                    contentFunc: getContentFunc,// the function which will be called to get the content of the detailed entry
                    contentResult: null
                };
            }

            var entries =
                [
                    {entryHelpID: "serverName", title: serverTitle, editable: false, valueArgument: server, valueResult: null},
                    {entryHelpID: "language", title: languageTitle, editable: false, valueArgument: language, valueResult: null},
                    //Old theme is initialized to be the current theme
                    themeSelectorEntry
                ];

            //if FLP is running on combi device AND compactCozy flag is on then create the view for user preferences
            if (sap.ui.Device.system.combi && oModel.getProperty("/contentDensity")) {
                entries.push(new CompactCozySelectorEntry());
            }

            if (oModel.getProperty("/userDefaultParameters")) {
                entries.push(new DefaultParametersEntry());
            }

            return {
                dialogTitle: sap.ushell.resources.i18n.getText("userPreferences"),
                isDetailedEntryMode: false,
                activeEntryPath: null, //the entry that is currently modified
                entries: entries
            };
        },

        getModel: function () {
            return oModel;
        }
    });

}());
