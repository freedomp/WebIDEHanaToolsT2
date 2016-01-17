/*!
 * ${copyright}
 */
/*global jQuery, sap */
/**
 * @name sap.ushell.ui.shell.Shell
 *
 * @private
 */


// Provides control sap.ushell.ui.shell.Shell.
sap.ui.define(['jquery.sap.global', './ShellUtilities', './ShellHeader',
            './ShellHeadItem', './ShellHeadUserItem',
            './ShellLayout', './ShellFloatingActions', 'sap/ushell/library'],
    function (jQuery, ShellUtils, ShellHeader, ShellHeadItem, ShellHeadUserItem, ShellLayout, ShellFloatingActions, library) {
        "use strict";

    /**
     * Constructor for a new Shell.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * The shell control is meant as root control (full-screen) of an application.
     * It was build as root control of the Fiori Launchpad application and provides the basic capabilities
     * for this purpose. Do not use this control within applications which run inside the Fiori Lauchpad and
     * do not use it for other scenarios than the root control usecase.
     * @extends sap.ushell.ui.shell.ShellLayout
     *
     * @author SAP SE
     * @version ${version}
     *
     * @constructor
     * @private
     * @since 1.28.0
     * @alias sap.ushell.ui.shell.Shell
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
        var Shell = ShellLayout.extend("sap.ushell.ui.shell.Shell", /** @lends sap.ushell.ui.shell.Shell.prototype */ { metadata : {

            properties : {

                /**
                 * The application icon. If a custom header is set this property has no effect.
                 */
                icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

                /**
                 * Shows / Hides the curtain.
                 * @deprecated Since version 1.16.3.
                 * Curtain is deprecated and replaced by ShellOverlay mechanism.
                 */
                showCurtain : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true},

                /**
                 * Shows / Hides the side pane on the curtain.
                 * @deprecated Since version 1.16.3.
                 * Curtain is deprecated and replaced by ShellOverlay mechanism.
                 */
                showCurtainPane : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true},

                /**
                 * If set to false, the search area (aggregation 'search') is hidden. If a custom header is set this property has no effect.
                 * @since 1.18
                 */
                searchVisible : {type : "boolean", group : "Appearance", defaultValue : true}
            },
            aggregations : {

                /**
                 * The content to appear in the curtain area.
                 */
                curtainContent : {type : "sap.ui.core.Control", multiple : true, singularName : "curtainContent"},

                /**
                 * The content to appear in the pane area of the curtain.
                 */
                curtainPaneContent : {type : "sap.ui.core.Control", multiple : true, singularName : "curtainPaneContent"},

                /**
                 * The buttons shown in the begin (left in left-to-right case) of the Shell header. Currently max. 3 visible buttons are supported. If a custom header is set this aggregation has no effect.
                 */
                headItems : {type : "sap.ushell.ui.shell.ShellHeadItem", multiple : true, singularName : "headItem"},


                /**
                 * The buttons shown in the end (right in left-to-right case) of the Shell header. Currently max. 3 visible buttons are supported (when user is set only 1). If a custom header is set this aggregation has no effect.
                 */
                headEndItems : {type : "sap.ushell.ui.shell.ShellHeadItem", multiple : true, singularName : "headEndItem"},

                /**
                 * Experimental (This aggregation might change in future!): The search control which should be displayed in the shell header. If a custom header is set this aggregation has no effect.
                 */
                search : {type : "sap.ui.core.Control", multiple : false},

                /**
                 * The user item which is rendered in the shell header beside the items. If a custom header is set this aggregation has no effect.
                 * @since 1.22.0
                 */
                user : {type : "sap.ushell.ui.shell.ShellHeadUserItem", multiple : false},

                /**
                 * The action button which is rendered floating in the shell content area. If a custom header is set this aggregation has no effect.
                 */
                floatingActions : {type : "sap.ushell.ui.shell.ShellFloatingAction", multiple : true, singularName : "floatingAction"}
            }
        }});

        Shell.prototype.init = function () {
            jQuery.sap.require("sap.ushell.resources");
            this.resourceBundle = sap.ushell.resources.i18n;
            ShellLayout.prototype.init.apply(this, arguments);
            this._header = new ShellHeader(this.getId() + "-header");
            this._floatingActions = new ShellFloatingActions(this.getId() + "floatingActions");
            this._floatingActions.setParent(this);
            this.setHeader(this._header);
            this._header.setAriaLabel(this.resourceBundle.getText("Shell_Header_AriaLabel"));
        };

        Shell.prototype.exit = function () {
            ShellLayout.prototype.exit.apply(this, arguments);
            if (this._header) {
                this._header.destroy();
                delete this._header;
            }
            if (this._floatingActions) {
                this._floatingActions.destroy();
                delete this._floatingActions;
            }
        };

        //Needed by sap.ushell.ui.shell.ShellOverlay
        Shell.prototype._getSearchWidth = function () {
            if (this._header === this.getHeader() && this._header.getDomRef()) {
                var $ShellSearchArea = this._header.$("hdr-center").children();
                if ($ShellSearchArea.length) {
                    return $ShellSearchArea.width();
                }
            }
            return -1;
        };


        // ***************** API / Overridden generated API *****************

        Shell.prototype.setIcon = function (sIcon) {
            if (this._header) {
                this.setProperty("icon", sIcon, true);
                this._header.setLogo(sIcon);
            } else {
                jQuery.sap.log.warning('Shell setIcon is called but no header exists');
            }
            return this;
        };

        Shell.prototype.getIcon = function () {
            return this._header.getLogo();
        };

        Shell.prototype.setSearchVisible = function (bSearchVisible) {
            this.setProperty("searchVisible", bSearchVisible, true);
            this._header.setSearchVisible(bSearchVisible);
            // hide title when opening search and wise-versa
            this.toggleStyleClass("sapUshellShellHeadTitleInvisible", bSearchVisible);
            return this;
        };

        Shell.prototype.getSearchVisible = function () {
            return this._header.getSearchVisible();
        };

        Shell.prototype.setSearch = function (oSearch) {
            this._header.setSearch(oSearch);
            return this;
        };

        Shell.prototype.getSearch = function () {
            return this._header.getSearch();
        };

        Shell.prototype.setUser = function (oUser) {
            this._header.setUser(oUser);
            return this;
        };

        Shell.prototype.getUser = function () {
            return this._header.getUser();
        };

        Shell.prototype.getHeadItems = function () {
            return this._header.getHeadItems();
        };
        Shell.prototype.insertHeadItem = function (oHeadItem, iIndex) {
            this._header.insertHeadItem(oHeadItem, iIndex);
            return this;
        };
        Shell.prototype.addHeadItem = function (oHeadItem) {
            this._header.addHeadItem(oHeadItem);
            return this;
        };
        Shell.prototype.removeHeadItem = function (vIndex) {
            return this._header.removeHeadItem(vIndex);
        };
        Shell.prototype.removeAllHeadItems = function () {
            return this._header.removeAllHeadItems();
        };
        Shell.prototype.destroyHeadItems = function () {
            this._header.destroyHeadItems();
            return this;
        };
        Shell.prototype.indexOfHeadItem = function (oHeadItem) {
            return this._header.indexOfHeadItem(oHeadItem);
        };


        Shell.prototype.getHeadEndItems = function () {
            return this._header.getHeadEndItems();
        };
        Shell.prototype.insertHeadEndItem = function (oHeadItem, iIndex) {
            this._header.insertHeadEndItem(oHeadItem, iIndex);
            return this;
        };
        Shell.prototype.addHeadEndItem = function (oHeadItem) {
            this._header.addHeadEndItem(oHeadItem);
            return this;
        };
        Shell.prototype.removeHeadEndItem = function (vIndex) {
            return this._header.removeHeadEndItem(vIndex);
        };
        Shell.prototype.removeAllHeadEndItems = function () {
            return this._header.removeAllHeadEndItems();
        };
        Shell.prototype.destroyHeadEndItems = function () {
            this._header.destroyHeadEndItems();
            return this;
        };
        Shell.prototype.indexOfHeadEndItem = function (oHeadItem) {
            return this._header.indexOfHeadEndItem(oHeadItem);
        };

    Shell.prototype.getFloatingActions = function () {
        return this._floatingActions.getFloatingActions();
    };
    Shell.prototype.insertFloatingAction = function(oActionButton, iIndex) {
        this._floatingActions.insertFloatingAction(oActionButton, iIndex);
        return this;
    };
    Shell.prototype.addFloatingAction = function(oActionButton) {
        this._floatingActions.addFloatingAction(oActionButton);
        return this;
    };
    Shell.prototype.removeFloatingAction = function(vIndex) {
        this._floatingActions.removeFloatingAction(vIndex);
        return this;
    };
    Shell.prototype.removeAllFloatingActions = function() {
        this._floatingActions.removeAllFloatingActions();
        return this;
    };
    Shell.prototype.destroyFloatingActions = function() {
        this._floatingActions.destroyFloatingActions();
        return this;
    };
    Shell.prototype.indexOfFloatingAction = function(oActionButton) {
        return this._floatingActions.indexOfFloatingAction(oActionButton);
    };

    /**
     * Setter for the aggregated <code>header</code>.
     *
     * @param {sap.ui.core.Control} oHeader The Control which should be rendered within the Shell header or <code>null</code> to render the default Shell header.
     * @return {sap.ushell.ui.shell.Shell} <code>this</code> to allow method chaining
     * @public
     */
    Shell.prototype.setHeader = function(oHeader) {
        return ShellLayout.prototype.setHeader.apply(this, [oHeader ? oHeader : this._header]);
    };

    /**
     * Destroys the header in the aggregation named <code>header</code>, but only if a custom header is set.
     * The default header can not be destroyed.
     *
     * @return {sap.ushell.ui.shell.Shell} <code>this</code> to allow method chaining
     * @public
     */
    Shell.prototype.destroyHeader = function() {
        if (this.getHeader() === this._header) {
            return this;
        }
        return ShellLayout.prototype.destroyHeader.apply(this, []);
    };

    return Shell;

    }, /* bExport= */ true);
