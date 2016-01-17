/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.LinkTileWrapper.
jQuery.sap.declare("sap.ushell.ui.launchpad.LinkTileWrapper");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui/launchpad/LinkTileWrapper.
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
 * <li>{@link #getUuid uuid} : string</li>
 * <li>{@link #getTileCatalogId tileCatalogId} : string</li>
 * <li>{@link #getTarget target} : string</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getDebugInfo debugInfo} : string</li>
 * <li>{@link #getAnimationRendered animationRendered} : boolean (default: false)</li>
 * <li>{@link #getIsLocked isLocked} : boolean (default: false)</li>
 * <li>{@link #getIeHtml5DnD ieHtml5DnD} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getTileViews tileViews} : sap.ui.core.Control[]</li>
 * <li>{@link #getFootItems footItems} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.ui.launchpad.LinkTileWrapper#event:press press} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.LinkTileWrapper#event:coverDivPress coverDivPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.LinkTileWrapper#event:afterRendering afterRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.LinkTileWrapper#event:showActions showActions} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A link tile to be displayed in the tile container. This control acts as container for specialized tile implementations.
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.ui.launchpad.LinkTileWrapper", { metadata : {

	library : "sap.ushell",
	properties : {
		"uuid" : {type : "string", group : "Misc", defaultValue : null},
		"tileCatalogId" : {type : "string", group : "Misc", defaultValue : null},
		"target" : {type : "string", group : "Misc", defaultValue : null},
		"visible" : {type : "boolean", group : "Misc", defaultValue : true},
		"debugInfo" : {type : "string", group : "Misc", defaultValue : null},
		"animationRendered" : {type : "boolean", group : "Misc", defaultValue : false},
		"isLocked" : {type : "boolean", group : "Misc", defaultValue : false},
		"ieHtml5DnD" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {
		"tileViews" : {type : "sap.ui.core.Control", multiple : true, singularName : "tileView"}, 
		"footItems" : {type : "sap.ui.core.Control", multiple : true, singularName : "footItem"}
	},
	events : {
		"press" : {}, 
		"coverDivPress" : {}, 
		"afterRendering" : {}, 
		"showActions" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.LinkTileWrapper with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.LinkTileWrapper.extend
 * @function
 */

sap.ushell.ui.launchpad.LinkTileWrapper.M_EVENTS = {'press':'press','coverDivPress':'coverDivPress','afterRendering':'afterRendering','showActions':'showActions'};


/**
 * Getter for property <code>uuid</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>uuid</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getUuid
 * @function
 */

/**
 * Setter for property <code>uuid</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sUuid  new value for property <code>uuid</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setUuid
 * @function
 */


/**
 * Getter for property <code>tileCatalogId</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>tileCatalogId</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getTileCatalogId
 * @function
 */

/**
 * Setter for property <code>tileCatalogId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTileCatalogId  new value for property <code>tileCatalogId</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setTileCatalogId
 * @function
 */


/**
 * Getter for property <code>target</code>.
 * Hyperlink target
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>target</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getTarget
 * @function
 */

/**
 * Setter for property <code>target</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTarget  new value for property <code>target</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setTarget
 * @function
 */


/**
 * Getter for property <code>visible</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getVisible
 * @function
 */

/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setVisible
 * @function
 */


/**
 * Getter for property <code>debugInfo</code>.
 * Technical information about the tile which is logged when the tile is clicked
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>debugInfo</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getDebugInfo
 * @function
 */

/**
 * Setter for property <code>debugInfo</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sDebugInfo  new value for property <code>debugInfo</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setDebugInfo
 * @function
 */


/**
 * Getter for property <code>animationRendered</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>animationRendered</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getAnimationRendered
 * @function
 */

/**
 * Setter for property <code>animationRendered</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bAnimationRendered  new value for property <code>animationRendered</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setAnimationRendered
 * @function
 */


/**
 * Getter for property <code>isLocked</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>isLocked</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getIsLocked
 * @function
 */

/**
 * Setter for property <code>isLocked</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIsLocked  new value for property <code>isLocked</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setIsLocked
 * @function
 */


/**
 * Getter for property <code>ieHtml5DnD</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>ieHtml5DnD</code>
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getIeHtml5DnD
 * @function
 */

/**
 * Setter for property <code>ieHtml5DnD</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIeHtml5DnD  new value for property <code>ieHtml5DnD</code>
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#setIeHtml5DnD
 * @function
 */


/**
 * Getter for aggregation <code>tileViews</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getTileViews
 * @function
 */


/**
 * Inserts a tileView into the aggregation named <code>tileViews</code>.
 *
 * @param {sap.ui.core.Control}
 *          oTileView the tileView to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the tileView should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the tileView is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the tileView is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#insertTileView
 * @function
 */

/**
 * Adds some tileView <code>oTileView</code> 
 * to the aggregation named <code>tileViews</code>.
 *
 * @param {sap.ui.core.Control}
 *            oTileView the tileView to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#addTileView
 * @function
 */

/**
 * Removes an tileView from the aggregation named <code>tileViews</code>.
 *
 * @param {int | string | sap.ui.core.Control} vTileView the tileView to remove or its index or id
 * @return {sap.ui.core.Control} the removed tileView or null
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#removeTileView
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>tileViews</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#removeAllTileViews
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>tileViews</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oTileView the tileView whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#indexOfTileView
 * @function
 */
	

/**
 * Destroys all the tileViews in the aggregation 
 * named <code>tileViews</code>.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#destroyTileViews
 * @function
 */


/**
 * Getter for aggregation <code>footItems</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#getFootItems
 * @function
 */


/**
 * Inserts a footItem into the aggregation named <code>footItems</code>.
 *
 * @param {sap.ui.core.Control}
 *          oFootItem the footItem to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the footItem should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the footItem is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the footItem is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#insertFootItem
 * @function
 */

/**
 * Adds some footItem <code>oFootItem</code> 
 * to the aggregation named <code>footItems</code>.
 *
 * @param {sap.ui.core.Control}
 *            oFootItem the footItem to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#addFootItem
 * @function
 */

/**
 * Removes an footItem from the aggregation named <code>footItems</code>.
 *
 * @param {int | string | sap.ui.core.Control} vFootItem the footItem to remove or its index or id
 * @return {sap.ui.core.Control} the removed footItem or null
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#removeFootItem
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>footItems</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#removeAllFootItems
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>footItems</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oFootItem the footItem whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#indexOfFootItem
 * @function
 */
	

/**
 * Destroys all the footItems in the aggregation 
 * named <code>footItems</code>.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#destroyFootItems
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#press
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'press' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#attachPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'press' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#detachPress
 * @function
 */

/**
 * Fire event press to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#firePress
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#coverDivPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'coverDivPress' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#attachCoverDivPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'coverDivPress' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#detachCoverDivPress
 * @function
 */

/**
 * Fire event coverDivPress to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#fireCoverDivPress
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#afterRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#attachAfterRendering
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#detachAfterRendering
 * @function
 */

/**
 * Fire event afterRendering to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#fireAfterRendering
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#showActions
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'showActions' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#attachShowActions
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'showActions' event of this <code>sap.ushell.ui.launchpad.LinkTileWrapper</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#detachShowActions
 * @function
 */

/**
 * Fire event showActions to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.LinkTileWrapper#fireShowActions
 * @function
 */

// Start of sap/ushell/ui/launchpad/LinkTileWrapper.js
/*global jQuery, sap*/
/**
 * @name sap.ushell.ui.launchpad.LinkTileWrapper
 *
 * @private
 */
(function () {
    "use strict";
    /*global jQuery, sap, window */
    /*jslint nomen: true*/

    jQuery.sap.require("sap.ushell.override");

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.ontap = function (event, ui) {
        // dump debug info when tile is clicked
        jQuery.sap.log.info(
            "Tile clicked:",
            this.getDebugInfo(),
            "sap.ushell.ui.launchpad.LinkTileWrapper"
        );

        // NOTE: for now, the on press animation is not used, as it caused too much
        // confusion
        return;
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.destroy = function (bSuppressInvalidate) {
        this.destroyTileViews();
        sap.ui.core.Control.prototype.destroy.call(this, bSuppressInvalidate);
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.addTileView = function (oObject, bSuppressInvalidate) {
        // Workaround for a problem in addAggregation. If a child is added to its current parent again,
        // it is actually removed from the aggregation. Prevent this by removing it from its parent first.
        oObject.setParent(null);
        sap.ui.base.ManagedObject.prototype.addAggregation.call(this, "tileViews", oObject, bSuppressInvalidate);
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.destroyTileViews = function () {
        // Don't delete the tileViews when destroying the aggregation. They are stored in the model and must be handled manually.
        if (this.mAggregations["tileViews"]) {
            this.mAggregations["tileViews"].length = 0;
        }
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype._launchTileViaKeyboard = function (oEvent) {
        if (oEvent.target.tagName !== "BUTTON") {
            var oTileUIWrapper = this.getTileViews()[0],
                bPressHandled = false;

            if (oTileUIWrapper.firePress) {

                //Since firePress doesn't dispatch the event for sap.m.Link (due to UI5 bug), we'll use an alternate way to simulate the press.
                //oTileUIWrapper.firePress({id: this.getId()});

                //TODO: remove this once firePress in sap.m.Link bug is resolved.
                var oClickEvent = document.createEvent('MouseEvents');
                oClickEvent.initEvent('click' /* event type */, false, true); // non-bubbling, cancelable
                oTileUIWrapper.getDomRef().dispatchEvent(oClickEvent);

                //If oTileUIWrapper is a View or a Component.
            } else {
                while (oTileUIWrapper.getContent && !bPressHandled) {
                    //Limitation: since there's no way to know which of the views is the currently presented one, we assume it's the first one.
                    oTileUIWrapper = oTileUIWrapper.getContent()[0];
                    if (oTileUIWrapper.firePress) {
                        oTileUIWrapper.firePress({id: this.getId()});
                        bPressHandled = true;
                    }
                }
            }
        }
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.onsapenter = function (oEvent) {
        this._launchTileViaKeyboard(oEvent);
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.onsapspace = function (oEvent) {
        this._launchTileViaKeyboard(oEvent);
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.onclick = function () {
        var oCurrentLink = this.getTileViews()[0],
            sCurrentHref = oCurrentLink.getHref();

        // Publish the link-click event with the relevant href value.
        // The href value is added to the event since the URL hash was not changed yet 
        // and the subscriber to this event might need the new hash (e.g. UsageAnalytics) 
        sap.ui.getCore().getEventBus().publish("launchpad", "dashboardTileLinkClick", {targetHash: sCurrentHref});
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.setVisible = function (bVisible) {
        this.setProperty("visible", bVisible, true); // suppress rerendering
        return this.toggleStyleClass("sapUshellHidden", !bVisible);
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.setAnimationRendered = function (bVal) {
        this.setProperty('animationRendered', bVal, true); // suppress re-rendering
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype._handleTileShadow = function (jqTile, args) {
        if (jqTile.length) {
            jqTile.unbind('mouseenter mouseleave');
            var updatedShadowColor,
                tileBorderWidth = jqTile.css("border").split("px")[0],
                oModel = this.getModel();
            //tile has border
            if (tileBorderWidth > 0) {
                updatedShadowColor = jqTile.css("border-color");
            } else {
                updatedShadowColor = this.getRgba();
            }

            jqTile.hover(
                function () {
                    if (!oModel.getProperty('/tileActionModeActive')) {
                        var sOriginalTileShadow = jQuery(jqTile).css('box-shadow'),
                            sTitleShadowDimension = sOriginalTileShadow ? sOriginalTileShadow.split(') ')[1] : null,
                            sUpdatedTileShadow;

                        if (sTitleShadowDimension) {
                            sUpdatedTileShadow = sTitleShadowDimension + " " + updatedShadowColor;
                            jQuery(this).css('box-shadow', sUpdatedTileShadow);
                        }
                    }
                },
                function () {
                    jQuery(this).css('box-shadow', '');
                }
            );
        }
    };

    sap.ushell.ui.launchpad.LinkTileWrapper.prototype.setUuid = function (sUuid) {
        this.setProperty("uuid", sUuid, true); // suppress rerendering
        return this;
    };
}());
