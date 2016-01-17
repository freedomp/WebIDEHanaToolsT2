// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

/**
 * @name sap.ushell.renderers.fiori2.Renderer
 * @since 1.9.0
 * @public
 */
(function () {
    "use strict";
    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.renderers.fiori2.Renderer");

    jQuery.sap.require("sap.ushell.ui.shell.Shell");
    jQuery.sap.require("sap.ui.core.UIComponent");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.renderers.fiori2.RendererExtensions");

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.createRenderer("fiori2")</code>.
     *
     * @class The SAPUI5 component of SAP Fiori Launchpad renderer for the Unified Shell.
     *
     * @extends sap.ui.core.UIComponent
     * @name sap.ushell.renderers.fiori2.Renderer
     * @since 1.15.0
     * @public
     */
    sap.ui.core.UIComponent.extend("sap.ushell.renderers.fiori2.Renderer", {
        metadata : {
            version : "1.32.6",
            dependencies : {
                version : "1.32.6",
                libs : [ "sap.ui.core", "sap.m" ],
                components: []
            }
        }
    });

    /**
     * @returns {object} an instance of Shell view
     *
     * @since 1.15.0
     *
     * @private
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.createContent = function () {
        var predefineState = jQuery.sap.getUriParameters().get("appState") || jQuery.sap.getUriParameters().get("sap-ushell-config"),
            viewData = this.getComponentData() || {},
            aProperties,
            oAppConfig = {
                applications: {"Shell-home": {}},
                rootIntent: "Shell-home"
            };

        if (predefineState) {
            if (!viewData.config) {
                viewData.config = {};
            }
            viewData.config.appState = predefineState;
        }

        //the code below migrates a configuration structure from version 1.28 or older, to the default
        //expected configuration structure in 1.30
        if (viewData.config) {
            //the list of the supported properties that were supported by the renderer in version 1.28
            aProperties = ["enablePersonalization", "enableTagFiltering",
                "enableLockedGroupsCompactLayout", "enableCatalogSelection",
                "enableSearchFiltering", "enableTilesOpacity", "enableDragIndicator",
                "enableActionModeMenuButton", "enableActionModeMenuButton",
                "enableActionModeFloatingButton", "enableTileActionsIcon",
                "enableHideGroups"];

            //We need to pass this flag in order to check lately the possibility of local resolution for empty hash
            if (viewData.config.rootIntent === undefined) {
                viewData.config["migrationConfig"] = true;
            }
            viewData.config = jQuery.extend(oAppConfig, viewData.config);

            //move relevant properties from the root object to the "Shell-home" application object
            if (viewData.config.applications["Shell-home"]) {
                aProperties.forEach(function (sPropName) {
                    var value = viewData.config[sPropName];
                    if (value !== undefined) {
                        viewData.config.applications["Shell-home"][sPropName] = value;
                    }
                    if (sPropName !== "enablePersonalization") {
                        delete viewData.config[sPropName];
                    }
                });
            }
        }

        if (viewData.config && viewData.config.customViews) {
            Object.keys(viewData.config.customViews).forEach(function (sViewName) {
                var oView = viewData.config.customViews[sViewName];
                sap.ui.view(sViewName, {
                    type: oView.viewType,
                    viewName: oView.viewName,
                    viewData: oView.componentData
                });
            });
        }

        var oView = sap.ui.view('mainShell', {
            type: sap.ui.core.mvc.ViewType.JS,
            viewName: "sap.ushell.renderers.fiori2.Shell",
            viewData: viewData
        });

        // initialize the RendererExtensions after the view is create. This also publish an external event that indicates
        // that sap.ushell.renderers.fiori2.RendererExtensions can be use.
        sap.ushell.renderers.fiori2.utils.init(oView.getController());
        this.shellCtrl = oView.oController;
        return oView;
    };

    /*-------------------------------------------show----------------------------*/
    /**
     * Sets the content of the left pane in Fiori launchpad, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is added in all states.
     *
     * <b>Example:</b>
     * <pre>
     *   var button1 = new sap.m.Button();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showActionButton ([button1.getId()], false, [“home”, “app”]);
     *</pre>
     * @param {String[]} aIds
     *   List of ID elements to add to the shell.
     *
     * @param {boolean} bCurrentState
     *   bCurrentState – if true, add the current component only to the current instance of the rendering of the shell.
     *   if false, add the component to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *    (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showLeftPaneContent = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.addLeftPaneContent([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.addLeftPaneContent(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Displays HeaderItems on the left side of the Fiori launchpad shell header, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The shell header can display only 3 HeaderItems on its left side.</br>
     * If this method is called when there are already 3 items displayed, this method will not do anything.
     *
     * <b>Example:</b>
     *   <pre>
     *   var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showHeaderItem ([button1.getId()], false, [“home”, “app”]);
     *   </pre>
     *
     * @param {String[]} aIds
     *   List of ID elements to add to the shell header.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current HeaderItems only to the current instance of the rendering of the shell.
     *   if false, add the HeaderItems to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showHeaderItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.addHeaderItem([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.addHeaderItem(aIds, bCurrentState, aStates);
        }

    };

    /**
     * Displays ToolAreaItem on the left side of the Fiori launchpad shell, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     *   <pre>
     *   var button1 = new sap.ushell.ui.shell.ToolAreaItem();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showToolAreaItem(button1.getId(), false, [“home”, “app”]);
     *   </pre>
     *
     * @param {string} sId
     *   ID of the element to add to the Tool Area.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current ToolAreaItems only to the current instance of the rendering of the shell.
     *   if false, add the ToolAreaItems to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showToolAreaItem = function (sId, bCurrentState, aStates) {
            this.shellCtrl.addToolAreaItem(sId, bCurrentState, aStates);
    };

    /**
     * Displays Buttons on the user actions menu in the Fiori launchpad shell, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The user actions menu is opened via the button on the right hand side of the shell header.</br>
     *
     * <b>Example:</b>
     *   <pre>
     *   var button1 = new sap.m.Button();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showActionButton([button1.getId()], false, [“home”, “app”]);
     *   </pre>
     *
     * @param {String[]} aIds
     *   List of ID elements to add to the user actions menu.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current Buttons only to the current instance of the rendering of the shell.
     *   if false, add the Buttons to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @param {boolean} bIsFirst
     *   if true, the Button will be added to the top of the ActionItems list.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showActionButton = function (aIds, bCurrentState, aStates, bIsFirst) {
        if (typeof aIds === "string") {
            this.shellCtrl.addActionButton([aIds], bCurrentState, aStates, bIsFirst);
        } else {
            this.shellCtrl.addActionButton(aIds, bCurrentState, aStates, bIsFirst);
        }
    };

    /**
     * Displays FloatingActions on the bottom right corner of the Fiori launchpad, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     *   <pre>
     *   var button1 = new sap.ushell.ui.shell.ShellFloatingAction();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showActionButton([button1.getId()], false, [“home”, “app”]);
     *   </pre>
     * @param {String[]} aIds
     *   List of ID elements to add to the user actions menu.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current Buttons only to the current instance of the rendering of the shell.
     *   if false, add the Buttons to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showFloatingActionButton = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.addFloatingActionButton([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.addFloatingActionButton(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Displays HeaderItems on the right side of the Fiori launchpad shell header, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The shell header can display the user HeaderItem, and just one more HeaderItem.</br>
     * If this method is called when the right side of the header is full, this method will not do anything.</br>
     *
     * <b>Example:</b>
     *   <pre>
     *   var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     *   var renderer = sap.ushell.Container.getRenderer("fiori2");
     *   renderer.showHeaderEndItem ([button1.getId()], false, [“home”, “app”]);
     *   </pre>
     *
     * @param {String[]} aIds
     *   List of ID elements to add to the shell header.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current HeaderItems only to the current instance of the rendering of the shell.
     *   if false, add the HeaderItems to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showHeaderEndItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.addHeaderEndItem([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.addHeaderEndItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Displays the given control in a container below the header of the Fiori launchpad shell header, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     *<b>Example:</b>
     *<pre>
     *  var bar = new sap.m.Bar();
     *  var renderer = sap.ushell.Container.getRenderer("fiori2");
     *  renderer.showSubHeader([bar.getId()], false, [“home”, “app”]);
     *</pre>
     *
     * @param {String[]} aIds
     *   List of ID elements to add to the shell subheader.
     *
     * @param {boolean} bCurrentState
     *   if true, add the current HeaderItems only to the current instance of the rendering of the shell.
     *   if false, add the HeaderItems to the LaunchPadState itself.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     *
     * @since 1.30
     *
     * @public
     */

    sap.ushell.renderers.fiori2.Renderer.prototype.showSubHeader = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.addSubHeader([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.addSubHeader(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Displays the given sap.m.Bar as the footer of the Fiori launchpad shell.</br>
     * The footer will be displayed in all states. </br>
     *
     * <b>Example:</b>
     * <pre>
     *  var bar = new sap.m.Bar();
     *  var renderer = sap.ushell.Container.getRenderer("fiori2");
     *  renderer.setFooter(bar);
     * </pre>
     *
     * @param {Object} oFooter - sap.m.Bar
     *   the control to be added as the footer of the Fiori Launchpad
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.setFooter = function (oFooter) {
        this.shellCtrl.setFooter(oFooter);
    };

/*--------------------------Hide ----------------------------------*/

    sap.ushell.renderers.fiori2.Renderer.prototype.hideHeaderItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeHeaderItem([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeHeaderItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Remove the given Tool Area Item  from Fiori Launchpad, in the given launchpad states.
     *
     *
     * @param {String[]} aIds
     *   the Ids of the sap.ushell.ui.shell.ToolAreaItem control to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.removeToolAreaItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeToolAreaItem([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeToolAreaItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given Action Button from Fiori Launchpad, in the given launchpad states.
     * The removed button will not be destroyed.
     *
     * @param {String[]} aIds
     *   the Ids of the Action Button to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.hideActionButton = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeActionButton([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeActionButton(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given control from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.
     *
     * @param {String[]} aIds
     *   the Ids of the controls to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.hideLeftPaneContent = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeLeftPaneContent([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeLeftPaneContent(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellFloatingAction from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.
     *
     * @param {String[]} aIds
     *   the Ids of the sap.ushell.ui.shell.ShellFloatingAction to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.hideFloatingActionButton = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeFloatingActionButton([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeFloatingActionButton(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellHeadItem from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.
     *
     * @param {String[]} aIds
     *   the Ids of the sap.ushell.ui.shell.ShellHeadItem to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.hideHeaderEndItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeHeaderEndItem([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeHeaderEndItem(aIds, bCurrentState, aStates);
        }
    };
    /**
     * Hide the given control from the Fiori Launchpad sub header, in the given launchpad states.
     * The removed control will not be destroyed.
     *
     * @param {String[]} aIds
     *   the Ids of the controls to remove.
     *
     * @param {boolean} bCurrentState
     *   if true, remove the current control only from the current rendered shell state.
     *
     * @param {String[]} aStates
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.(Only valid if bCurrentState is set to false)
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is removed in all states.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.hideSubHeader = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.shellCtrl.removeSubHeader([aIds], bCurrentState, aStates);
        } else {
            this.shellCtrl.removeSubHeader(aIds, bCurrentState, aStates);
        }
    };

    /**
     * If exists, this method will remove the footer from the Fiori Launchpad.
     *
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.removeFooter = function () {
        this.shellCtrl.removeFooter();
    };

    /*------------------------------------------------add------------------------------------------*/
    /**
     * Creates the Sub Header content in Fiori launchpad, in the given launchpad states.</br>
     *
     *   <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addSubHeader("sap.m.Bar", {id: "testBar"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addSubHeader = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            var ViewPrototype;
            if (controlType) {
                jQuery.sap.require(controlType);
                ViewPrototype = jQuery.sap.getObject(controlType);
            } else {
                jQuery.sap.log.warning("You must specify control type in order to create it");
            }

            return new ViewPrototype(oControlProperties);
        };

        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);
        if (bIsVisible) {
            this.showSubHeader(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates an Action Button in Fiori launchpad, in the given launchpad states. </br>
     * The button will be displayed in the user actions menu, that is opened from the user button in the shell header.</br>
     *  <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addActionButton("sap.m.Button", {id: "testBtn"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            var ViewPrototype;
            if (controlType) {
                jQuery.sap.require(controlType);
                ViewPrototype = jQuery.sap.getObject(controlType);
            } else {
                ViewPrototype = jQuery.sap.getObject(sap.m.Button);
            }

            return new ViewPrototype(oControlProperties);
        };

        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);
        if (bIsVisible) {
            this.showActionButton(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };


    /**
     * Creates a FloatingActionButton in Fiori launchpad, in the given launchpad states.</br>
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     *   <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {id: "testBtn"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addFloatingActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            var ViewPrototype;
            if (controlType) {
                jQuery.sap.require(controlType);
                ViewPrototype = jQuery.sap.getObject(controlType);
            } else {
                ViewPrototype = jQuery.sap.getObject(sap.m.Button);
            }

            return new ViewPrototype(oControlProperties);
        };

        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);
        if (bIsVisible) {
            this.showFloatingActionButton(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates the Left Pane content in Fiori launchpad, in the given launchpad states.</br>
     *   <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addLeftPaneContent("sap.m.Button", {id: "testBtn"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     *@returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addLeftPaneContent = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            var ViewPrototype;
            if (controlType) {
                jQuery.sap.require(controlType);
                ViewPrototype = jQuery.sap.getObject(controlType);
            } else {
                jQuery.sap.log.warning("You must specify control type in order to create it");
            }

            return new ViewPrototype(oControlProperties);
        };

        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);
        if (bIsVisible) {
            this.showLeftPaneContent(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates the HeaderItem in Fiori launchpad, in the given launchpad states.</br>
     * The HeaderItem will be displayed in the left side of the Fiori Launchpad shell header.</br>
     *   <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addHeaderItem("sap.ushell.ui.shell.ShellHeadItem", {id: "testBtn"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addHeaderItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            return new sap.ushell.ui.shell.ShellHeadItem(oControlProperties);
        };
        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);

        if (bIsVisible) {
            this.showHeaderItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };
    /**
     * Creates a ToolAreaItem  in Fiori Launchpad and adds it to the Tool Area, in the given launchpad states.</br>
     * If no items are added to the Tool Area, it will not be displayed.</br>
     * Once an item is added, the Tool Area is rendered on the left side on the Fiori Launchpad shell.</br>
     *
     *   <b>Example:</b>
     *   <pre>sap.ushell.Container.getRenderer("fiori2").addToolAreaItem({
     *              id: 'testButton',
     *              icon: "sap-icon://documents",
     *              press: function (evt) {
     *                 window.alert('Press' );
     *                },
     *             expand: function (evt) {
     *                 window.alert('Expand' );
     *                }
     *           }, true, false, ["home"]);
     * </pre>
     *
     * @param {object} oControlProperties
     *   The properties object that will be passed to the constructor of sap.ushell.ui.shell.ToolAreaItem control.
     *   @see sap.ushell.ui.shell.ToolAreaItem
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *
     * @param {String[]} aStates
     *   List of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.Only valid if bCurrentState is set to false.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     *  @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addToolAreaItem = function (oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            return new sap.ushell.ui.shell.ToolAreaItem(oControlProperties);
        };
        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);

        if (bIsVisible) {
            this.showToolAreaItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates the HeaderItem in Fiori launchpad, in the given launchpad states.</br>
     * The HeaderItem will be displayed in the right side of the Fiori Launchpad shell header.</br>
     *   <b>Example:</b>
     *   <pre> sap.ushell.Container.getRenderer("fiori2").addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {id: "testBtn"}, true, true);</pre>
     *
     * @param {string} controlType
     *   The (class) name of the control type to create.
     *
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control.
     *
     * @param {boolean} bIsVisible
     *   Specify whether to display the control.
     *
     * @param {boolean} bCurrentState
     *   If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     *
     * @param {String[]} aStates
     *   (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *
     *  @see LaunchpadState.
     *
     *  If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} oItem - the created control
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addHeaderEndItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var fnCreate = function (oControlProperties) {
            return new sap.ushell.ui.shell.ShellHeadItem(oControlProperties);
        };
        var oItem = this.createItem(oControlProperties, bCurrentState, aStates, fnCreate);

        if (bIsVisible) {
            this.showHeaderEndItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };
/*-------------------general---------------------------*/
    sap.ushell.renderers.fiori2.Renderer.prototype.getModelConfiguration = function () {
        return this.shellCtrl.getModelConfiguration();
    };

    /**
     * Adds the given sap.ui.core.Control to the EndUserFeedback dialog.</br>
     * The EndUserFeedback dialog is opened via the user actions menu in the Fiori Launchpad shell header.
     *
     * @param {object} oCustomUIContent
     *   The control to be added to the EndUserFeedback dialog.
     *
     * @param {boolean} bShowCustomUIContent
     *   Specify whether to display the control.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.addEndUserFeedbackCustomUI = function (oCustomUIContent, bShowCustomUIContent) {
        this.shellCtrl.addEndUserFeedbackCustomUI(oCustomUIContent, bShowCustomUIContent);
    };
    //TODO: document the structure of the "entryObject"
    sap.ushell.renderers.fiori2.Renderer.prototype.addUserPreferencesEntry = function (entryObject) {
        return this.shellCtrl.addUserPreferencesEntry(entryObject);
    };

    /**
     * Sets the title in the Fiori Launchpad shell header.
     *
     * @param {string} sTitle
     *   The title to be displayed in the Fiori Launchpad shell header
     * @param {string} controlType
     *   The (class) name of the control type to create inside the popover.
     * @param {object} oControlProperties
     *   The properties that will be passed to the created control which will be displayed inside the popover.
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.setHeaderTitle = function (sTitle, controlType, oControlProperties) {
        var oInnerControl = null;
        var oLaunchpadStates = sap.ushell.renderers.fiori2.Renderer.prototype.LaunchpadState;

        if (controlType) {
            var fnCreate = function (oControlProperties) {
                var oControlClass;
                jQuery.sap.require(controlType);
                oControlClass = jQuery.sap.getObject(controlType);
                return new oControlClass(oControlProperties);
            };

            oInnerControl = this.createItem(oControlProperties, false, [oLaunchpadStates.Home, oLaunchpadStates.App], fnCreate);
        }

        this.shellCtrl._setHeaderTitle(sTitle, oInnerControl);
    };

    /**
     * Sets the visibility of the left pane in the Fiori Launchpad shell, in the given launchpad state
     * @see LaunchpadState.
     *
     * @param {string} sLaunchpadState
     *   LaunchpadState in which to show/hide the left pane
     * @param {boolean} bVisible
     *   specif whether to display the left pane or not
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.setLeftPaneVisibility = function (sLaunchpadState, bVisible) {
        this.shellCtrl.showShellItem("/showPane", sLaunchpadState, bVisible);
    };

    /**
     * Sets the ToolArea visibility
     *
     * @param {String} [sLaunchpadState] - LaunchpadState in which to show/hide the ToolArea
     *
     * @see LaunchpadState
     *
     * @param {boolean} [bVisible] - specifies whether to display the ToolArea or not
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.showToolArea = function (sLaunchpadState, bVisible) {
        this.shellCtrl.showShellItem("/toolAreaVisible", sLaunchpadState, bVisible);
    };

    sap.ushell.renderers.fiori2.Renderer.prototype.setHeaderHiding = function (bHiding) {
        return this.shellCtrl._setHeaderHiding(bHiding);
    };
/*---------------States------------------------*/
    /**
     * The launchpad states that can be passed as a parameter.</br>
     * <b>Values:<b>
     * App - launchpad state when running a Fiori app</br>
     * Home - launchpad state when the home page is open</br>
     *
     * @since 1.30
     *
     * @public
     */
    sap.ushell.renderers.fiori2.Renderer.prototype.LaunchpadState = {
        App: "app",
        Home: "home"
    };

/*---------------Generic--------------------*/
    sap.ushell.renderers.fiori2.Renderer.prototype.createItem = function (oControlProperties, bCurrentState, aStates, fnCreateItem) {
        //create the object
        var oItem;
        if (oControlProperties.id) {
            oItem = sap.ui.getCore().byId(oControlProperties.id);
        }
        if (!oItem) {
            oItem = fnCreateItem(oControlProperties);
            if (bCurrentState) {
                this.shellCtrl.addElementToManagedQueue(oItem);
            }
        }

        return oItem;
    };

/*------------------------------------------*/
}());
