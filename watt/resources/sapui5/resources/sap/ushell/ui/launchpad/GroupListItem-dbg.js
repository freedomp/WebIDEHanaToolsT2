/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.GroupListItem.
jQuery.sap.declare("sap.ushell.ui.launchpad.GroupListItem");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.ListItemBase");


/**
 * Constructor for a new ui/launchpad/GroupListItem.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getDefaultGroup defaultGroup} : boolean (default: false)</li>
 * <li>{@link #getShow show} : boolean (default: true)</li>
 * <li>{@link #getGroupId groupId} : string</li>
 * <li>{@link #getIndex index} : int</li>
 * <li>{@link #getNumberOfTiles numberOfTiles} : int (default: 0)</li>
 * <li>{@link #getIsGroupVisible isGroupVisible} : boolean (default: true)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.ui.launchpad.GroupListItem#event:press press} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.GroupListItem#event:afterRendering afterRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.ListItemBase#constructor sap.m.ListItemBase}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/launchpad/GroupListItem
 * @extends sap.m.ListItemBase
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.ListItemBase.extend("sap.ushell.ui.launchpad.GroupListItem", { metadata : {

	library : "sap.ushell",
	properties : {
		"title" : {type : "string", group : "Misc", defaultValue : null},
		"defaultGroup" : {type : "boolean", group : "Misc", defaultValue : false},
		"show" : {type : "boolean", group : "Misc", defaultValue : true},
		"groupId" : {type : "string", group : "Misc", defaultValue : null},
		"index" : {type : "int", group : "Misc", defaultValue : null},
		"numberOfTiles" : {type : "int", group : "Misc", defaultValue : 0},
		"isGroupVisible" : {type : "boolean", group : "Misc", defaultValue : true}
	},
	events : {
		"press" : {}, 
		"afterRendering" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.GroupListItem with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.ui.launchpad.GroupListItem.extend
 * @function
 */

sap.ushell.ui.launchpad.GroupListItem.M_EVENTS = {'press':'press','afterRendering':'afterRendering'};


/**
 * Getter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setTitle
 * @function
 */


/**
 * Getter for property <code>defaultGroup</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>defaultGroup</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getDefaultGroup
 * @function
 */

/**
 * Setter for property <code>defaultGroup</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDefaultGroup  new value for property <code>defaultGroup</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setDefaultGroup
 * @function
 */


/**
 * Getter for property <code>show</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>show</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getShow
 * @function
 */

/**
 * Setter for property <code>show</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShow  new value for property <code>show</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setShow
 * @function
 */


/**
 * Getter for property <code>groupId</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>groupId</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getGroupId
 * @function
 */

/**
 * Setter for property <code>groupId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sGroupId  new value for property <code>groupId</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setGroupId
 * @function
 */


/**
 * Getter for property <code>index</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {int} the value of property <code>index</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getIndex
 * @function
 */

/**
 * Setter for property <code>index</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {int} iIndex  new value for property <code>index</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setIndex
 * @function
 */


/**
 * Getter for property <code>numberOfTiles</code>.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>numberOfTiles</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getNumberOfTiles
 * @function
 */

/**
 * Setter for property <code>numberOfTiles</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iNumberOfTiles  new value for property <code>numberOfTiles</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setNumberOfTiles
 * @function
 */


/**
 * Getter for property <code>isGroupVisible</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>isGroupVisible</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#getIsGroupVisible
 * @function
 */

/**
 * Setter for property <code>isGroupVisible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bIsGroupVisible  new value for property <code>isGroupVisible</code>
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#setIsGroupVisible
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.GroupListItem#press
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'press' event of this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#attachPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'press' event of this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#detachPress
 * @function
 */

/**
 * Fire event press to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.GroupListItem#firePress
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.GroupListItem#afterRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#attachAfterRendering
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.GroupListItem</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupListItem#detachAfterRendering
 * @function
 */

/**
 * Fire event afterRendering to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.GroupListItem} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.GroupListItem#fireAfterRendering
 * @function
 */

// Start of sap/ushell/ui/launchpad/GroupListItem.js
/*global jQuery, sap*/
/**
 * @name sap.ushell.ui.launchpad.GroupListItem
 *
 * @private
 */
(function () {
    "use strict";

    jQuery.sap.require("sap.m.Input");

    sap.ushell.ui.launchpad.GroupListItem.prototype.exit = function () {
        sap.m.ListItemBase.prototype.exit.apply(this, arguments);
    };

    sap.ushell.ui.launchpad.GroupListItem.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    sap.ushell.ui.launchpad.GroupListItem.prototype.groupHasVisibleTiles = function () {
        var groupTiles = this.getModel().getProperty("/groups/" + this.getIndex() + "/tiles");
        var groupLinks = this.getModel().getProperty("/groups/" + this.getIndex() + "/links");
        return sap.ushell.utils.groupHasVisibleTiles(groupTiles, groupLinks);
    };

    // browser events
    // use onmousedown instead of onclick because a click will not end the edit mode if the user starts immediately dragging another tile
    sap.ushell.ui.launchpad.GroupListItem.prototype.onclick = function () {
        this.firePress({
            id : this.getId()
        });
    };

    sap.ushell.ui.launchpad.GroupListItem.prototype.onsapenter = function () {
        this.firePress({
            id : this.getId(),
            action: "sapenter"
        });
    };

    sap.ushell.ui.launchpad.GroupListItem.prototype.setGroupId = function (sGroupId) {
        this.setProperty("groupId", sGroupId, true); // suppress rerendering
        return this;
    };

    sap.ushell.ui.launchpad.GroupListItem.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle); // DO NOT suppress rerendering - otherwise groups list (UI) is not re-rendered and old tooltip still showing
        this.$().find(".sapMSLITitleOnly").text(sTitle);
        return this;
    };
}());
