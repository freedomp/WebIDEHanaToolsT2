/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.GroupHeaderActions.
jQuery.sap.declare("sap.ushell.ui.launchpad.GroupHeaderActions");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui/launchpad/GroupHeaderActions.
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
 * <li>{@link #getIsOverflow isOverflow} : boolean (default: false)</li>
 * <li>{@link #getTileActionModeActive tileActionModeActive} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.ui.core.Control[]</li>
 * <li>{@link #getOverflowCtrl overflowCtrl} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.ui.launchpad.GroupHeaderActions#event:afterRendering afterRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/launchpad/GroupHeaderActions
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.ui.launchpad.GroupHeaderActions", { metadata : {

	library : "sap.ushell",
	properties : {
		"isOverflow" : {type : "boolean", group : "Misc", defaultValue : false},
		"tileActionModeActive" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {
		"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
		"overflowCtrl" : {type : "sap.ui.core.Control", multiple : true, singularName : "overflowCtrl"}
	},
	events : {
		"afterRendering" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.GroupHeaderActions with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.GroupHeaderActions.extend
 * @function
 */

sap.ushell.ui.launchpad.GroupHeaderActions.M_EVENTS = {'afterRendering':'afterRendering'};


/**
 * Getter for property <code>isOverflow</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>isOverflow</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#getIsOverflow
 * @function
 */

/**
 * Setter for property <code>isOverflow</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIsOverflow  new value for property <code>isOverflow</code>
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#setIsOverflow
 * @function
 */


/**
 * Getter for property <code>tileActionModeActive</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>tileActionModeActive</code>
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#getTileActionModeActive
 * @function
 */

/**
 * Setter for property <code>tileActionModeActive</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bTileActionModeActive  new value for property <code>tileActionModeActive</code>
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#setTileActionModeActive
 * @function
 */


/**
 * Getter for aggregation <code>content</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#getContent
 * @function
 */


/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the content should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the content is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#insertContent
 * @function
 */

/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#addContent
 * @function
 */

/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.ui.core.Control} vContent the content to remove or its index or id
 * @return {sap.ui.core.Control} the removed content or null
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#removeContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#removeAllContent
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>content</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#indexOfContent
 * @function
 */
	

/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#destroyContent
 * @function
 */


/**
 * Getter for aggregation <code>overflowCtrl</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#getOverflowCtrl
 * @function
 */


/**
 * Inserts a overflowCtrl into the aggregation named <code>overflowCtrl</code>.
 *
 * @param {sap.ui.core.Control}
 *          oOverflowCtrl the overflowCtrl to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the overflowCtrl should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the overflowCtrl is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the overflowCtrl is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#insertOverflowCtrl
 * @function
 */

/**
 * Adds some overflowCtrl <code>oOverflowCtrl</code> 
 * to the aggregation named <code>overflowCtrl</code>.
 *
 * @param {sap.ui.core.Control}
 *            oOverflowCtrl the overflowCtrl to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#addOverflowCtrl
 * @function
 */

/**
 * Removes an overflowCtrl from the aggregation named <code>overflowCtrl</code>.
 *
 * @param {int | string | sap.ui.core.Control} vOverflowCtrl the overflowCtrl to remove or its index or id
 * @return {sap.ui.core.Control} the removed overflowCtrl or null
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#removeOverflowCtrl
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>overflowCtrl</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#removeAllOverflowCtrl
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>overflowCtrl</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oOverflowCtrl the overflowCtrl whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#indexOfOverflowCtrl
 * @function
 */
	

/**
 * Destroys all the overflowCtrl in the aggregation 
 * named <code>overflowCtrl</code>.
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#destroyOverflowCtrl
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#afterRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.GroupHeaderActions</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.GroupHeaderActions</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.GroupHeaderActions</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#attachAfterRendering
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.GroupHeaderActions</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#detachAfterRendering
 * @function
 */

/**
 * Fire event afterRendering to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.GroupHeaderActions} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.GroupHeaderActions#fireAfterRendering
 * @function
 */

// Start of sap/ushell/ui/launchpad/GroupHeaderActions.js
/*global jQuery, sap*/

/**
 * @name sap.ushell.ui.launchpad.GroupHeaderActions
 *
 * @private
 */

(function () {
    "use strict";

    sap.ushell.ui.launchpad.GroupHeaderActions.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    sap.ushell.ui.launchpad.GroupHeaderActions.prototype._getActionOverflowControll = function () {
        var that = this;

        return [new sap.m.Button({
            icon: 'sap-icon://overflow',
            type: 'Transparent',
            press: function (oEvent) {

                var oActionSheet = new sap.m.ActionSheet({
                    placement: sap.m.PlacementType.Auto
                });

                that.getContent().forEach(function (oButton) {
                    var cButton = oButton.clone();
                    cButton.setModel(oButton.getModel());
                    cButton.setBindingContext(oButton.getBindingContext());
                    oActionSheet.addButton(cButton);
                });
                oActionSheet.openBy(oEvent.getSource());
            }
        }).addStyleClass('sapUshellHeaderActionButton')];
    };

}());
