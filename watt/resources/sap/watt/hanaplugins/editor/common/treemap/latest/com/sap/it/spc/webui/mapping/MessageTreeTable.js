/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control com.sap.it.spc.webui.mapping.MessageTreeTable.
jQuery.sap.declare("com.sap.it.spc.webui.mapping.MessageTreeTable");
jQuery.sap.require("com.sap.it.spc.webui.mapping.library");
jQuery.sap.require("sap.ui.table.TreeTable");

/**
 * Constructor for a new Message. Accepts an object literal <code>mSettings</code> that defines initial property values, aggregated and
 * associated objects as well as event handlers. If the name of a setting is ambiguous (e.g. a property has the same name as an event), then
 * the framework assumes property, aggregation, association, event in that order. To override this automatic resolution, one of the prefixes
 * "aggregation:", "association:" or "event:" can be added to the name of the setting (such a prefixed name must be enclosed in single or
 * double quotes). The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * </ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * </ul>
 * </li>
 * <li>Associations
 * <ul>
 * </ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link com.sap.it.spc.webui.mapping.MessageTreeTable#event:contentUpdate contentUpdate} : fnListenerFunction or [fnListenerFunction,
 * oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * </ul>
 * </li>
 * </ul>
 * In addition, all settings applicable to the base type {@link sap.ui.table.TreeTable#constructor sap.ui.table.TreeTable} can be used as
 * well.
 * @param {string} [sId] id for the new control, generated automatically if no id is given
 * @param {object} [mSettings] initial settings for the new control
 * @class The structure of message (Source/Target) is represented using this control. This extends TreeTable control of ui5 providing an
 * additional event 'contentUpdate' when the content in the table is updated
 * @extends sap.ui.table.TreeTable
 * @author Mouli Kalakota
 * @constructor
 * @public
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable
 */
sap.ui.table.TreeTable.extend("com.sap.it.spc.webui.mapping.MessageTreeTable", {
	metadata : {

		// ---- object ----

		// ---- control specific ----
		library : "com.sap.it.spc.webui.mapping",
		events : {
			"contentUpdate" : {}
		}
	}
});

/**
 * Creates a new subclass of class com.sap.it.spc.webui.mapping.MessageTreeTable with name <code>sClassName</code> and enriches it with
 * the information contained in <code>oClassInfo</code>. <code>oClassInfo</code> might contain the same kind of informations as
 * described in {@link sap.ui.core.Element.extend Element.extend}.
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable.extend
 * @function
 */

com.sap.it.spc.webui.mapping.MessageTreeTable.M_EVENTS = {
	'contentUpdate' : 'contentUpdate'
};

/**
 * This event is fired when the content in the table is changed
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable#contentUpdate
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */

/**
 * Attach event handler <code>fnFunction</code> to the 'contentUpdate' event of this
 * <code>com.sap.it.spc.webui.mapping.MessageTreeTable</code>.<br/>. When called, the context of the event handler (its
 * <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>com.sap.it.spc.webui.mapping.MessageTreeTable</code>.<br/> itself. 
 *  
 * This event is fired when the content in the table is changed 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>com.sap.it.spc.webui.mapping.MessageTreeTable</code>.<br/> itself.
 *
 * @return {com.sap.it.spc.webui.mapping.MessageTreeTable} <code>this</code> to allow method chaining
 * @public
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable#attachContentUpdate
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'contentUpdate' event of this
 * <code>com.sap.it.spc.webui.mapping.MessageTreeTable</code>.<br/> The passed function and listener object must match the ones used for
 * event registration.
 * @param {function} fnFunction The function to call, when the event occurs.
 * @param {object} oListener Context object on which the given function had to be called.
 * @return {com.sap.it.spc.webui.mapping.MessageTreeTable} <code>this</code> to allow method chaining
 * @public
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable#detachContentUpdate
 * @function
 */

/**
 * Fire event contentUpdate to attached listeners.
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {com.sap.it.spc.webui.mapping.MessageTreeTable} <code>this</code> to allow method chaining
 * @protected
 * @name com.sap.it.spc.webui.mapping.MessageTreeTable#fireContentUpdate
 * @function
 */

// -----------------------------------------------------------------------------
// Begin of Control Behavior, copied from Message.js
// -----------------------------------------------------------------------------
com.sap.it.spc.webui.mapping.MessageTreeTable.prototype._updateTableContent = function() {
	sap.ui.table.TreeTable.prototype._updateTableContent.apply(this, arguments);
	this.fireContentUpdate();
};