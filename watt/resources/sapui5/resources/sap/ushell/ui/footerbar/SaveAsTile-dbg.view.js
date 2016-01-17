// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, hasher, document */
    /*jslint plusplus: true, nomen: true */

    sap.ui.jsview("sap.ushell.ui.footerbar.SaveAsTile", {
        getControllerName : function () {
            return "sap.ushell.ui.footerbar.SaveAsTile";
        },
        createContent: function (oController) {
            this.oResourceBundle = sap.ushell.resources.i18n;
            this.viewData = this.getViewData() || {};
            this.appData = this.viewData.appData || {};
            this.oTitleInput = new sap.m.Input('bookmarkTitleInput', {
                tooltip: this.oResourceBundle.getText("bookmarkDialogoTitle_tooltip"),
                value: {
                    path: "/title",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            }).addStyleClass("sapUshellInputField");
            this.oTitleInput.addAriaLabelledBy("titleLbl");
            this.oSubTitleInput = new sap.m.Input('bookmarkSubTitleInput', {
                tooltip: this.oResourceBundle.getText("bookmarkDialogoSubTitle_tooltip"),
                value: {
                    path: "/subtitle",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            }).addStyleClass("sapUshellInputField");
            this.oSubTitleInput.addAriaLabelledBy("subtitleLbl");
            this.oInfoInput = new sap.m.Input('bookmarkInfoInput', {
                tooltip: this.oResourceBundle.getText("bookmarkDialogoInfo_tooltip"),
                value: {
                    path: "/info",
                    mode: sap.ui.model.BindingMode.TwoWay
                }
            }).addStyleClass("sapUshellInputField");
            this.oInfoInput.addAriaLabelledBy("infoLbl");

            var tileInitSettings = {
                numberValue: "{/numberValue}",
                title : "{/title}",
                subtitle: "{/subtitle}",
                info: "{/info}",
                icon: "{/icon}",
                infoState: "{/infoState}",
                numberFactor: "{/numberFactor}",
                numberUnit: "{/numberUnit}",
                numberDigits: "{/numberDigits}",
                numberState: "{/numberState}",
                stateArrow: "{/stateArrow}",
                targetURL: "{/targetURL}",
                keywords: "{/keywords}"
            };

            var oTile, serviceUrl;
            if (this.viewData.serviceUrl) {
                oTile = new sap.ushell.ui.tile.DynamicTile("previewTile", tileInitSettings);
                serviceUrl = (typeof (this.viewData.serviceUrl) === "function") ? this.viewData.serviceUrl() : this.viewData.serviceUrl;
                oController.calcTileDataFromServiceUrl(serviceUrl);
            } else {
                oTile = new sap.ushell.ui.tile.StaticTile("previewTile", tileInitSettings);
            }
            this.setTileView(oTile);

            var tileWrapper = new sap.ushell.ui.launchpad.Tile({
                "long" : false,
                "tall" : false,
                tileViews : [oTile]
            }).addStyleClass("sapUshellBookmarkFormPreviewTileMargin");

            var oPreview = new sap.m.Label("previewLbl", {text: " " +  this.oResourceBundle.getText('previewFld')}),
                oTitle = new sap.m.Label("titleLbl", {required: true, text: " " +  this.oResourceBundle.getText('titleFld')}),
                oSubTitle = new sap.m.Label("subtitleLbl", {text: this.oResourceBundle.getText('subtitleFld')}),
                oInfo = new sap.m.Label("infoLbl", {text: this.oResourceBundle.getText('infoMsg')}),
                hbox = new sap.m.HBox("saveAsTileHBox", {
                items: [tileWrapper],
                alignItems : sap.m.FlexAlignItems.Center,
                justifyContent: sap.m.FlexJustifyContent.Center
            }).addStyleClass("sapUiStrongBackgroundColor").addStyleClass("sapUshellBookmarkFormPreviewBoxBottomMargin");


            var oGroupsLabel = new sap.m.Label("groupLbl", {
                text: this.oResourceBundle.getText('GroupListItem_label'),
                visible: "{/showGroupSelection}"
            });
            this.oGroupsSelect = new sap.m.Select("groupsSelect", {
                tooltip: "{i18n>bookmarkDialogoGroup_tooltip}",
                items : {
                    path : "/groups",
                    template : new sap.ui.core.ListItem({
                        text : "{title}"
                    })
                },
                width: "100%",
                visible: {
                    path: "/showGroupSelection",
                    formatter: function (bShowGroupSelection) {
                        if (bShowGroupSelection) {
                            this.oController.loadPersonalizedGroups();
                        }
                        return bShowGroupSelection;
                    }.bind(this)
                }
            });
            this.oGroupsSelect.addAriaLabelledBy("groupLbl");



            return [
                oPreview,
                hbox,
                oTitle,
                this.oTitleInput,
                oSubTitle,
                this.oSubTitleInput,
                oInfo,
                this.oInfoInput,
                oGroupsLabel,
                this.oGroupsSelect
            ];
        },
        getTitleInput: function () {
            return this.oTitleInput;
        },
        getTileView: function () {
            return this.tileView;
        },
        setTileView: function (oTileView) {
            this.tileView = oTileView;
        },
        getBookmarkTileData: function () {
            var selectedGroupData;
            if (this.oGroupsSelect && this.oGroupsSelect.getSelectedItem()) {
                selectedGroupData = this.oGroupsSelect.getSelectedItem().getBindingContext().getObject();
            }

            // customUrl - Will be used to navigate from the new tile.
            var sURL;
            // in case customUrl is supplied
            if (this.viewData.customUrl) {
                // check if a function was passed as customUrl
                if (typeof (this.viewData.customUrl) === "function") {
                        // resolve the function to get the value for the customUrl
                        sURL = this.viewData.customUrl();
                } else {
                    // Provided as a string
                    // In case customURL will be provided (as a string) containing an hash part, it must be supplied non-encoded,
                    // or it will be resolved with duplicate encoding and can cause nav errors.
                    sURL = this.viewData.customUrl;
                }
            } else {
                // In case an hash exists, hasher.setHash() is used for navigation. It also adds encoding.
                // Otherwise use window.location.href
                sURL = hasher.getHash() ? ('#' + hasher.getHash()) : window.location.href;
            }

            return {
                title : this.oTitleInput.getValue().trim(),
                subtitle : this.oSubTitleInput.getValue().trim(),
                url : sURL,
                icon : this.getModel().getProperty('/icon'),
                info : this.oInfoInput.getValue().trim(),
                numberUnit : this.viewData.numberUnit,
                serviceUrl : typeof (this.viewData.serviceUrl) === "function" ? this.viewData.serviceUrl() : this.viewData.serviceUrl,
                serviceRefreshInterval : this.viewData.serviceRefreshInterval,
                group : selectedGroupData,
                keywords :  this.viewData.keywords
            };
        }
    });
}());
