// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
(function () {
    "use strict";
    /*global document, jQuery, sap, hasher */
    sap.ui.getCore().loadLibrary("sap.m");
    jQuery.sap.require("sap.ui.core.IconPool");
    jQuery.sap.require("sap.ushell.components.tiles.utils");

    sap.ui.controller("sap.ushell.components.tiles.applauncher.StaticTile", {

        onInit : function () {
            var oStaticTileView = this.getView(),
                oViewData = oStaticTileView.getViewData(),
                oTileApi = oViewData.chip, // instance specific CHIP API
                oConfig = sap.ushell.components.tiles.utils.getConfiguration(oTileApi, oTileApi.configurationUi.isEnabled(), false),
                oModel,
                sKeywords,
                aKeywords,
                that = this,
                sNavigationTargetUrl = oConfig.navigation_target_url,
                sSystem;

            sSystem = oTileApi.url.getApplicationSystem();
            if (sSystem) { // propagate system to target application
                sNavigationTargetUrl += ((sNavigationTargetUrl.indexOf("?") < 0) ? "?" : "&")
                    + "sap-system=" + sSystem;
            }
            this.navigationTargetUrl = sNavigationTargetUrl;
            /*
             * Model of the applauncher tile consisting of config (tile configuration), nav (target URL set to '' in case of Admin UI), and search (highlight terms)
             */
            oModel = new sap.ui.model.json.JSONModel({
                config : oConfig,
                nav: {navigation_target_url: (oTileApi.configurationUi && oTileApi.configurationUi.isEnabled() ? "" : sNavigationTargetUrl)},
                search: {
                    display_highlight_terms: []
                }
            });
            oStaticTileView.setModel(oModel);

            // implement types contact
            // default is Tile
            var oTileControl = this.getView().getTileControl();
            this.getView().addContent(oTileControl);
            if (oTileApi.types) {
                oTileApi.types.attachSetType(function (sType) {
                    if (sType === 'link') {
                        that.getView().removeAllContent();
                        var oLinkControl = that.getView().getLinkControl();
                        that.getView().addContent(oLinkControl);
                    } else {
                        that.getView().removeAllContent();
                        var oTileControl = that.getView().getTileControl();
                        that.getView().addContent(oTileControl);
                    }
                });
            }

            // implement search contract
            if (oTileApi.search) {
                // split and clean keyword string (may be comma + space delimited)
                sKeywords = oStaticTileView.getModel().getProperty("/config/display_search_keywords");
                aKeywords = jQuery.grep(sKeywords.split(/[, ]+/), function (n, i) { return n && n !== ""; });
                // defined in search contract:
                oTileApi.search.setKeywords(aKeywords);
                oTileApi.search.attachHighlight(
                    function (aHighlightWords) {
                        oStaticTileView.getModel().setProperty("/search/display_highlight_terms", aHighlightWords);
                    }
                );
            }

            // implement preview contract
            if (oTileApi.preview) {
                oTileApi.preview.setTargetUrl(sNavigationTargetUrl);
                oTileApi.preview.setPreviewIcon(oConfig.display_icon_url);
                oTileApi.preview.setPreviewTitle(oConfig.display_title_text);
            }

            // implement configurationUi contract: setup configuration UI
            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.setUiProvider(function () {
                    // attach configuration UI provider, which is essentially a components.tiles.applauncher.Configuration
                    var oConfigurationUi = sap.ushell.components.tiles.utils.getConfigurationUi(oStaticTileView, "sap.ushell.components.tiles.applauncher.Configuration");
                    oTileApi.configurationUi.attachCancel(that.onCancelConfiguration.bind(null, oConfigurationUi));
                    oTileApi.configurationUi.attachSave(that.onSaveConfiguration.bind(null, oConfigurationUi));
                    return oConfigurationUi;
                });

                this.getView().getContent()[0].setTooltip(
                        sap.ushell.components.tiles.utils.getResourceBundleModel().getResourceBundle()
                        .getText("edit_configuration.tooltip")
                );
            }

            // attach the tile actions provider for the actions contract
            if (oTileApi.actions) {
                //TODO check new property name with designer dudes
                var aActions = oConfig.actions, aExtendedActions;
                if (aActions) {
                    aExtendedActions = aActions.slice();
                } else {
                    aExtendedActions = [];
                }

                var tileSettingsAction = sap.ushell.components.tiles.utils.getTileSettingsAction(oModel, this.onSaveRuntimeSettings.bind(this));
                aExtendedActions.push(tileSettingsAction);

                oTileApi.actions.setActionsProvider(function (){
                    return aExtendedActions;
                });
            }


        },
        // trigger to show the configuration UI if the tile is pressed in Admin mode
        onPress: function (oEvent) {
            var oStaticTileView = this.getView(),
                oViewData = oStaticTileView.getViewData(),
                oTileApi = oViewData.chip;

            if (oTileApi.configurationUi.isEnabled()) {
                oTileApi.configurationUi.display();
            } else if (this.navigationTargetUrl){
                if (this.navigationTargetUrl[0] === '#') {
                    hasher.setHash(this.navigationTargetUrl);
                } else {
                    window.open(this.navigationTargetUrl, '_blank');
                }
            }
        },
     // tile settings action UI save handler
        onSaveRuntimeSettings: function(oSettingsView) {
            var oViewModel = oSettingsView.getModel(),
                oTileApi = this.getView().getViewData().chip,
                oConfigToSave = this.getView().getModel().getProperty("/config");

            oConfigToSave.display_title_text = oViewModel.getProperty('/title');
            oConfigToSave.display_subtitle_text = oViewModel.getProperty('/subtitle');
            oConfigToSave.display_info_text = oViewModel.getProperty('/info');
            oConfigToSave.display_search_keywords = oViewModel.getProperty('/keywords');

            // use bag contract in order to store translatable properties
            var tilePropertiesBag = oTileApi.bag.getBag('tileProperties');
            tilePropertiesBag.setText('display_title_text',       oConfigToSave.display_title_text);
            tilePropertiesBag.setText('display_subtitle_text',    oConfigToSave.display_subtitle_text);
            tilePropertiesBag.setText('display_info_text',        oConfigToSave.display_info_text);
            tilePropertiesBag.setText('display_search_keywords',  oConfigToSave.display_search_keywords);

            function logErrorAndReject(oError) {
                jQuery.sap.log.error(oError, null, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
            }

            // saving the relevant properteis
            tilePropertiesBag.save(
                    // success handler
                function () {
                    jQuery.sap.log.debug("property bag 'tileProperties' saved successfully");

                    // update tile's model
                    this.getView().getModel().setProperty('/config/display_title_text',      oConfigToSave.display_title_text);
                    this.getView().getModel().setProperty('/config/display_subtitle_text',   oConfigToSave.display_subtitle_text);
                    this.getView().getModel().setProperty('/config/display_info_text',       oConfigToSave.display_info_text);
                    this.getView().getModel().setProperty('/config/display_search_keywords', oConfigToSave.display_search_keywords);

                    // call to refresh model which (due to the binding) will refresh the tile
                    this.getView().getModel().refresh();
                }.bind(this),
                logErrorAndReject // error handler
            );
        },
        // configuration save handler
        onSaveConfiguration: function (oConfigurationView) {
            var
                // the deferred object required from the configurationUi contract
                oDeferred = jQuery.Deferred(),
                oModel = oConfigurationView.getModel(),
                // tile model placed into configuration model by getConfigurationUi
                oTileModel = oModel.getProperty("/tileModel"),
                oTileApi = oConfigurationView.getViewData().chip,
                aTileNavigationActions = sap.ushell.components.tiles.utils.tileActionsRows2TileActionsArray(oModel.getProperty("/config/tile_actions_rows")),
                // get the configuration to save from the model
                configToSave = {
                    display_icon_url : oModel.getProperty("/config/display_icon_url"),
                    navigation_use_semantic_object : oModel.getProperty("/config/navigation_use_semantic_object"),
                    navigation_target_url : oModel.getProperty("/config/navigation_target_url"),
                    navigation_semantic_object : jQuery.trim(oModel.getProperty("/config/navigation_semantic_object")) || "",
                    navigation_semantic_action : jQuery.trim(oModel.getProperty("/config/navigation_semantic_action")) || "",
                    navigation_semantic_parameters : jQuery.trim(oModel.getProperty("/config/navigation_semantic_parameters")),
                    display_search_keywords: oModel.getProperty("/config/display_search_keywords")
                };
            //If the input fields icon, semantic object and action are failing the input validations, then through an error message requesting the user to enter/correct those fields
            var bReject = sap.ushell.components.tiles.utils.checkInputOnSaveConfig(oConfigurationView);
            if (bReject) {
                oDeferred.reject("mandatory_fields_missing");
                return oDeferred.promise();
            }
            // overwrite target URL in case of semantic object navigation
            if (configToSave.navigation_use_semantic_object) {
                configToSave.navigation_target_url = sap.ushell.components.tiles.utils.getSemanticNavigationUrl(configToSave);
                oModel.setProperty("/config/navigation_target_url", configToSave.navigation_target_url);
            }

            // use bag in order to store translatable properties
            var tilePropertiesBag = oTileApi.bag.getBag('tileProperties');
            tilePropertiesBag.setText('display_title_text', oModel.getProperty("/config/display_title_text"));
            tilePropertiesBag.setText('display_subtitle_text', oModel.getProperty("/config/display_subtitle_text"));
            tilePropertiesBag.setText('display_info_text', oModel.getProperty("/config/display_info_text"));
            tilePropertiesBag.setText('display_search_keywords', configToSave.display_search_keywords);

            var tileNavigationActionsBag = oTileApi.bag.getBag('tileNavigationActions');
            //forward populating of tile navigation actions array into the bag, to Utils
            sap.ushell.components.tiles.utils.populateTileNavigationActionsBag(tileNavigationActionsBag, aTileNavigationActions);

            function logErrorAndReject(oError, oErrorInfo) {
                jQuery.sap.log.error(oError, null, "sap.ushell.components.tiles.applauncher.StaticTile.controller");
                oDeferred.reject(oError, oErrorInfo);
            }

            // use configuration contract to write parameter values
            oTileApi.writeConfiguration.setParameterValues(
                {tileConfiguration : JSON.stringify(configToSave)},
                // success handler
                function () {
                    var oConfigurationConfig = sap.ushell.components.tiles.utils.getConfiguration(oTileApi, false, false),
                        oTileConfig = sap.ushell.components.tiles.utils.getConfiguration(oTileApi, true, false),
                        // switching the model under the tile -> keep the tile model
                        oModel = new sap.ui.model.json.JSONModel({
                            config : oConfigurationConfig,
                            // set empty target url in configuration mode
                            nav: {navigation_target_url: ""},
                            // keep tile model
                            tileModel: oTileModel
                        });
                    oConfigurationView.setModel(oModel);
                    // update tile model
                    oTileModel.setData({config: oTileConfig, nav: {navigation_target_url: ""}}, false);

                    // update tile model
                    if (oTileApi.preview) {
                        oTileApi.preview.setTargetUrl(oConfigurationConfig.navigation_target_url);
                        oTileApi.preview.setPreviewIcon(oConfigurationConfig.display_icon_url);
                        oTileApi.preview.setPreviewTitle(oConfigurationConfig.display_title_text);
                    }

                    tilePropertiesBag.save(
                        // success handler
                        function () {
                            jQuery.sap.log.debug("property bag 'tileProperties' saved successfully");
                            // update possibly changed values via contracts
                            if (oTileApi.title) {
                                oTileApi.title.setTitle(
                                    configToSave.display_title_text,
                                    // success handler
                                    function () {
                                        oDeferred.resolve();
                                    },
                                    logErrorAndReject // error handler
                                );
                            } else {
                                oDeferred.resolve();
                            }
                        },
                        logErrorAndReject // error handler
                    );

                    tileNavigationActionsBag.save(
                            // success handler
                            function () {
                                jQuery.sap.log.debug("property bag 'navigationProperties' saved successfully");
                            },
                            logErrorAndReject // error handler
                    );
                },
                logErrorAndReject // error handler
            );

            return oDeferred.promise();
        },

        // configuration cancel handler
        onCancelConfiguration: function (oConfigurationView) {
            // re-load old configuration and display
            var oViewData = oConfigurationView.getViewData(),
                oModel = oConfigurationView.getModel(),
                // tile model placed into configuration model by getConfigurationUi
                oTileModel = oModel.getProperty("/tileModel"),
                oTileApi = oViewData.chip,

                oCurrentConfig = sap.ushell.components.tiles.utils.getConfiguration(oTileApi, oTileApi.configurationUi.isEnabled(), false);

            oConfigurationView.getModel().setData({
                config: oCurrentConfig,
                // set empty target url in configuration mode
                nav: {navigation_target_url: ""},
                tileModel: oTileModel
            }, false);
        }
    });
}());
