/*!
 * ${copyright}
 */
/*global jQuery, sap */
sap.ui.define(['jquery.sap.global', 'sap/ushell/library'],
    function (jQuery, library) {
        "use strict";

        var ShellHeader = sap.ui.core.Control.extend("sap.ushell.ui.shell.ShellHeader", {

            metadata: {
                properties: {
                    logo: {type: "sap.ui.core.URI", defaultValue: ""},
                    searchVisible: {type: "boolean", defaultValue: true},
                    ariaLabel: {type: "string", defaultValue: undefined}
                },
                aggregations: {
                    headItems: {type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true},
                    headEndItems: {type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true},
                    search: {type: "sap.ui.core.Control", multiple: false},
                    user: {type: "sap.ushell.ui.shell.ShellHeadUserItem", multiple: false},
                    title: {type: "sap.ushell.ui.shell.ShellTitle", multiple: false}
                }
            },
            renderer: {
                render: function (rm, oHeader) {
                    var id = oHeader.getId();
                    rm.write("<div");
                    rm.writeControlData(oHeader);
                    if (oHeader.getAriaLabel()) {
                        rm.writeAccessibilityState({
                            label: oHeader.getAriaLabel(),
                            role: "banner"
                        });
                    }
                    rm.writeAttribute("class", "sapUshellShellHeader");
                    rm.write(">");
                    rm.write("<div id='", id, "-hdr-begin' class='sapUshellShellHeadBegin'>");
                    this.renderHeaderItems(rm, oHeader, true);
                    rm.write("</div>");

                    rm.write("<div id='", id, "-hdr-center' class='sapUshellShellHeadCenter'>");
                    this.rendererTitle(rm, oHeader);
                    this.renderSearch(rm, oHeader);
                    rm.write("</div>");
                    rm.write("<div id='", id, "-hdr-end' class='sapUshellShellHeadEnd'>");
                    this.renderHeaderItems(rm, oHeader, false);
                    rm.write("</div>");
                    rm.write("</div>");
                },
                renderSearch: function (rm, oHeader) {
                    var oSearch = oHeader.getSearch();
                    rm.write("<div id='", oHeader.getId(), "-hdr-search'");
                    rm.writeAttribute("class", "sapUshellShellSearch" + (oHeader.getSearchVisible() ? "" : " sapUshellShellHidden"));
                    rm.write("><div>");
                    if (oSearch) {
                        rm.renderControl(oSearch);
                    }
                    rm.write("</div></div>");
                },
                rendererTitle: function (rm, oHeader) {
                    rm.write("<div id='", oHeader.getId(), "-hdr-title' class='sapUshellShellHeadTitle'>");
                    rm.renderControl(oHeader.getTitle());
                    rm.write("</div>");
                },
                renderHeaderItems: function (rm, oHeader, begin) {
                    rm.write("<div class='sapUshellShellHeadContainer'>");
                    var aItems = begin ? oHeader.getHeadItems() : oHeader.getHeadEndItems(),
                        i;
                    for (i = 0; i < aItems.length; i++) {
                        if ((aItems[i].getTarget() || "") !== "") {
                            rm.write("<a tabindex='0' href='");
                            rm.writeEscaped(aItems[i].getTarget());
                            rm.write("'");
                        } else {
                            rm.write("<a tabindex='0'");
                        }

                        rm.writeElementData(aItems[i]);
                        rm.addClass("sapUshellShellHeadItm");
                        if (aItems[i].getStartsSection()) {
                            rm.addClass("sapUshellShellHeadItmDelim");
                        }
                        if (aItems[i].getShowSeparator()) {
                            rm.addClass("sapUshellShellHeadItmSep");
                        }
                        if (!aItems[i].getVisible()) {
                            rm.addClass("sapUshellShellHidden");
                        }
                        if (aItems[i].getAriaLabel()) {
                            //Handle Aria Label rendering
                            rm.writeAccessibilityState({
                                label: aItems[i].getAriaLabel(),
                                role: "button"
                            });
                        }
                        if (aItems[i].getSelected()) {
                            rm.addClass("sapUshellShellHeadItmSel");
                        }
                        if (aItems[i].getShowMarker()) {
                            rm.addClass("sapUshellShellHeadItmMark");
                        }
                        rm.writeClasses();
                        var tooltip = aItems[i].getTooltip_AsString();
                        if (tooltip) {
                            rm.writeAttributeEscaped("title", tooltip);
                        }
                        rm.write("><span></span><div class='sapUshellShellHeadItmMarker'><div></div></div></a>");
                    }

                    var oUser = oHeader.getUser();
                    if (!begin && oUser) {
                        rm.write("<a tabindex='0' href='javascript:void(0);'");
                        rm.writeElementData(oUser);
                        rm.addClass("sapUshellShellHeadAction sapUshellShellHeadSeparator");
                        rm.writeClasses();
                        var tooltip = oUser.getTooltip_AsString();
                        if (tooltip) {
                            rm.writeAttributeEscaped("title", tooltip);
                        }
                        if (oUser.getAriaLabel()) {
                            //Handle Aria Label rendering
                            rm.writeAccessibilityState({
                                label: oUser.getAriaLabel(),
                                role: "button"
                            });
                        }
                        rm.write("><span id='", oUser.getId(), "-img' class='sapUshellShellHeadActionImg'></span>");
                        rm.write("<span id='" + oUser.getId() + "-name' class='sapUshellShellHeadActionName'");
                        rm.write(">");
                        var sUserName = oUser.getUsername() || "";
                        rm.writeEscaped(sUserName);
                        rm.write("</span><span class='sapUshellShellHeadActionExp'></span></a>");
                    }

                    rm.write("</div>");
                    if (begin) {
                        this._renderLogo(rm, oHeader);
                    }
                },

                _renderLogo: function (rm, oHeader) {
                    //var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui"),
                    //sLogoTooltip = rb.getText("SHELL_LOGO_TOOLTIP"),
                    var sLogoTooltip = sap.ushell.resources.i18n.getText("SHELL_LOGO_TOOLTIP"),
                        sIco = oHeader._getLogo();

                    rm.write("<div class='sapUshellShellIco'>");
                    rm.write("<img id='", oHeader.getId(), "-icon'");
                    rm.writeAttributeEscaped("title", sLogoTooltip);
                    rm.writeAttributeEscaped("alt", sLogoTooltip);
                    rm.write("src='");
                    rm.writeEscaped(sIco);
                    rm.write("' style='", sIco ? "" : "display:none;","'></img>");
                    rm.write("</div>");
                }
            }

        });


        ShellHeader.prototype.init = function () {
            var that = this;

            this._rtl = sap.ui.getCore().getConfiguration().getRTL();

            this._handleMediaChange = function (mParams) {
                if (!that.getDomRef()) {
                    return;
                }
                that._refresh();
            };
            sap.ui.Device.media.attachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);

            this._handleResizeChange = function () {
                if (!that.getDomRef() || !that.getUser()) {
                    return;
                }

                var oUser = this.getUser();
                var bChanged = oUser._checkAndAdaptWidth(!that.$("hdr-search").hasClass("sapUshellShellHidden") && !!that.getSearch());
                if (bChanged) {
                    that._refresh();
                }
            };
            sap.ui.Device.resize.attachHandler(this._handleResizeChange, this);

            this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

            this.oTitle = null;
        };

        ShellHeader.prototype.exit = function () {
            sap.ui.Device.media.detachHandler(this._handleMediaChange, this, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
            delete this._handleMediaChange;
            sap.ui.Device.resize.detachHandler(this._handleResizeChange, this);
            delete this._handleResizeChange;
            if (this.oTitle) {
                this.oTitle.destroy();
            }
        };

        ShellHeader.prototype.onAfterRendering = function () {
            this._refresh();
            this.$("hdr-center").toggleClass("sapUshellShellAnim", !this._noHeadCenterAnim);
        };

        ShellHeader.prototype.onThemeChanged = function () {
            if (this.getDomRef()) {
                this.invalidate();
            }
        };

        ShellHeader.prototype._getLogo = function () {
            var ico = this.getLogo();
            if (!ico) {
                jQuery.sap.require("sap.ui.core.theming.Parameters");
                ico = sap.ui.core.theming.Parameters._getThemeImage(null, true); // theme logo
            }
            return ico;
        };

        ShellHeader.prototype._refresh = function () {
            function updateItems(aItems) {
                for (var i = 0; i < aItems.length; i++) {
                    aItems[i]._refreshIcon();
                }
            }

		updateItems(this.getHeadItems());
		updateItems(this.getHeadEndItems());

		var oUser = this.getUser(),
			isPhoneSize = jQuery("html").hasClass("sapUiMedia-Std-Phone"),
			searchVisible = !this.$("hdr-search").hasClass("sapUshellShellHidden"),
			$logo = this.$("icon");

		if (oUser) {
			oUser._refreshImage();
			oUser._checkAndAdaptWidth(searchVisible && !!this.getSearch());
		}

		$logo.parent().toggleClass("sapUshellShellHidden", isPhoneSize && searchVisible && !!this.getSearch());

        var we = this.$("hdr-end").outerWidth(),
            wb = this.$("hdr-begin").outerWidth(),
            w = this.$().width(),
            //When there is not enough space, on small screen size, we want to assure that
            //search field width is not too short
            centerMin = 568,
            wMax = Math.max(we, wb),
            begin = ((w - wb - we < centerMin) && searchVisible ? wb : wMax) + "px",
            end = ((w - wb - we < centerMin) && searchVisible ? we : wMax) + "px";

		this.$("hdr-center").css({
			"left": this._rtl ? end : begin,
			"right": this._rtl ? begin : end
		});

        this.$("hdr-title").css({
            "left": this._rtl ? end : begin,
            "right": this._rtl ? begin : end
        });
	};

    ShellHeader.prototype.setTitleControl = function (sTitle, oInnerControl) {
        if (this.oTitle) {
            this.oTitle.destroy();
        }
        this.oTitle = new sap.ushell.ui.shell.ShellTitle("shellTitle", {
            text: sTitle,
            icon: sap.ui.core.IconPool.getIconURI("overflow")
        });
        this.oTitle.setInnerControl(oInnerControl);
        this.setTitle(this.oTitle);
    };

    ShellHeader.prototype.removeHeadItem = function (vItem) {
        if (typeof vItem === 'number') {
            vItem = this.getHeadItems()[vItem];
        }
        vItem.setVisible(false);
        this.removeAggregation('headItems', vItem, true);
    };

    ShellHeader.prototype.addHeadItem = function (oItem) {
        if (!oItem.getDomRef()) {
            //item isn't rendered yet, don't supress rendering
            this.addAggregation('headItems', oItem);
            oItem.setVisible(true);
        } else {
            //item is already rendered, just change it's visibility
            this.addAggregation('headItems', oItem, true);
            oItem.setVisible(true);
        }
    };

	return ShellHeader;

}, /* bExport= */ true);
