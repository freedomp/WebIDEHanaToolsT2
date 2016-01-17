/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.ProcessFlow.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlow");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ProcessFlow.
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
 * <li>{@link #getFoldedCorners foldedCorners} : boolean (default: false)</li>
 * <li>{@link #getScrollable scrollable} : boolean (default: true)</li>
 * <li>{@link #getWheelZoomable wheelZoomable} : boolean (default: true)</li>
 * <li>{@link #getShowLabels showLabels} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getNodes nodes} : sap.suite.ui.commons.ProcessFlowNode[]</li>
 * <li>{@link #getLanes lanes} <strong>(default aggregation)</strong> : sap.suite.ui.commons.ProcessFlowLaneHeader[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:nodeTitlePress nodeTitlePress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:nodePress nodePress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:labelPress labelPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:headerPress headerPress} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.suite.ui.commons.ProcessFlow#event:onError onError} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Complex control that enables you to display documents or other items in their flow.
 * @extends sap.ui.core.Control
 *
 * @author SAP SE
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlow
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ProcessFlow", { metadata : {

	publicMethods : [
		// methods
		"getZoomLevel", "setZoomLevel", "zoomIn", "zoomOut", "updateModel", "getFocusedNode", "updateNodesOnly", "setSelectedPath"
	],
	library : "sap.suite.ui.commons",
	properties : {
		"foldedCorners" : {type : "boolean", group : "Misc", defaultValue : false},
		"scrollable" : {type : "boolean", group : "Misc", defaultValue : true},
		"wheelZoomable" : {type : "boolean", group : "Behavior", defaultValue : true},
		"showLabels" : {type : "boolean", group : "Appearance", defaultValue : false}
	},
	defaultAggregation : "lanes",
	aggregations : {
		"_connections" : {type : "sap.suite.ui.commons.ProcessFlowConnection", multiple : true, singularName : "_connection", visibility : "hidden"}, 
		"nodes" : {type : "sap.suite.ui.commons.ProcessFlowNode", multiple : true, singularName : "node"}, 
		"lanes" : {type : "sap.suite.ui.commons.ProcessFlowLaneHeader", multiple : true, singularName : "lane"}
	},
	events : {
		"nodeTitlePress" : {deprecated: true}, 
		"nodePress" : {}, 
		"labelPress" : {}, 
		"headerPress" : {}, 
		"onError" : {}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlow with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ProcessFlow.extend
 * @function
 */

sap.suite.ui.commons.ProcessFlow.M_EVENTS = {'nodeTitlePress':'nodeTitlePress','nodePress':'nodePress','labelPress':'labelPress','headerPress':'headerPress','onError':'onError'};


/**
 * Getter for property <code>foldedCorners</code>.
 * This property defines the folded corners for the single node control. The following values exist:
 * - true: means folded corner
 * - false/null/undefined: means normal corner
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>foldedCorners</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getFoldedCorners
 * @function
 */

/**
 * Setter for property <code>foldedCorners</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bFoldedCorners  new value for property <code>foldedCorners</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setFoldedCorners
 * @function
 */


/**
 * Getter for property <code>scrollable</code>.
 * By default, the control body is embedded into a scroll container of fixed size, so the user
 * can put the control into a fixe sized layout.
 * When the control body (the graph) gets larger than the container cuts the overflowing parts of the graph and the cut parts can be viewed by scroling the control body.
 * When the control body fits into the container limits, obviously no scrolling is possible (and makes sense).
 * 
 * The scrolling feature can be turned off by setting this property value to false,
 * so the width/height of the whole control will change as the flow graph gets smaller/larger.
 * In this case the control body could not be scrolled, as the control body size matches the control container size.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>scrollable</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getScrollable
 * @function
 */

/**
 * Setter for property <code>scrollable</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bScrollable  new value for property <code>scrollable</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setScrollable
 * @function
 */


/**
 * Getter for property <code>wheelZoomable</code>.
 * The property specifies if to enable semantic zooming by mouse wheel events on desktop browsers.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>wheelZoomable</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getWheelZoomable
 * @function
 */

/**
 * Setter for property <code>wheelZoomable</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bWheelZoomable  new value for property <code>wheelZoomable</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setWheelZoomable
 * @function
 */


/**
 * Getter for property <code>showLabels</code>.
 * Defines if the connection labels are shown or not.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showLabels</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getShowLabels
 * @function
 */

/**
 * Setter for property <code>showLabels</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowLabels  new value for property <code>showLabels</code>
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#setShowLabels
 * @function
 */


/**
 * Getter for aggregation <code>nodes</code>.<br/>
 * This is the aggregation of the node controls put into the table to the calculated cells.
 * 
 * @return {sap.suite.ui.commons.ProcessFlowNode[]}
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getNodes
 * @function
 */


/**
 * Inserts a node into the aggregation named <code>nodes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *          oNode the node to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the node should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the node is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the node is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#insertNode
 * @function
 */

/**
 * Adds some node <code>oNode</code> 
 * to the aggregation named <code>nodes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *            oNode the node to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#addNode
 * @function
 */

/**
 * Removes an node from the aggregation named <code>nodes</code>.
 *
 * @param {int | string | sap.suite.ui.commons.ProcessFlowNode} vNode the node to remove or its index or id
 * @return {sap.suite.ui.commons.ProcessFlowNode} the removed node or null
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeNode
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>nodes</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.ProcessFlowNode[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeAllNodes
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.ProcessFlowNode</code> in the aggregation named <code>nodes</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.ProcessFlowNode}
 *            oNode the node whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#indexOfNode
 * @function
 */
	

/**
 * Destroys all the nodes in the aggregation 
 * named <code>nodes</code>.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#destroyNodes
 * @function
 */


/**
 * Getter for aggregation <code>lanes</code>.<br/>
 * This is a header of the table for the process flow control.
 * 
 * <strong>Note</strong>: this is the default aggregation for ProcessFlow.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader[]}
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#getLanes
 * @function
 */


/**
 * Inserts a lane into the aggregation named <code>lanes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *          oLane the lane to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the lane should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the lane is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the lane is inserted at 
 *             the last position        
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#insertLane
 * @function
 */

/**
 * Adds some lane <code>oLane</code> 
 * to the aggregation named <code>lanes</code>.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *            oLane the lane to add; if empty, nothing is inserted
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#addLane
 * @function
 */

/**
 * Removes an lane from the aggregation named <code>lanes</code>.
 *
 * @param {int | string | sap.suite.ui.commons.ProcessFlowLaneHeader} vLane the lane to remove or its index or id
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader} the removed lane or null
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeLane
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>lanes</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.suite.ui.commons.ProcessFlowLaneHeader[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#removeAllLanes
 * @function
 */

/**
 * Checks for the provided <code>sap.suite.ui.commons.ProcessFlowLaneHeader</code> in the aggregation named <code>lanes</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader}
 *            oLane the lane whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#indexOfLane
 * @function
 */
	

/**
 * Destroys all the lanes in the aggregation 
 * named <code>lanes</code>.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#destroyLanes
 * @function
 */


/**
 * This event is fired when a process flow node title was
 * clicked. The user can access the clicked process flow node control object which is the only argument of the event handler.
 *
 * @name sap.suite.ui.commons.ProcessFlow#nodeTitlePress
 * @event
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow node object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'nodeTitlePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow node title was
 * clicked. The user can access the clicked process flow node control object which is the only argument of the event handler.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#attachNodeTitlePress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'nodeTitlePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#detachNodeTitlePress
 * @function
 */

/**
 * Fire event nodeTitlePress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow node object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @deprecated Since version 1.26. 
 * Should not be used any longer, use nodePress event instead ( click on the node)
 * @name sap.suite.ui.commons.ProcessFlow#fireNodeTitlePress
 * @function
 */


/**
 * This event is fired when a process flow node was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#nodePress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow node object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'nodePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow node was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachNodePress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'nodePress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachNodePress
 * @function
 */

/**
 * Fire event nodePress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow node object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireNodePress
 * @function
 */


/**
 * This event is fired when a process flow connection label was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#labelPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the label information.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'labelPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a process flow connection label was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachLabelPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'labelPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachLabelPress
 * @function
 */

/**
 * Fire event labelPress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the label information.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireLabelPress
 * @function
 */


/**
 * This event is fired when the header column was clicked.
 *
 * @name sap.suite.ui.commons.ProcessFlow#headerPress
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This object represents the wrapped process flow lane header object.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'headerPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when the header column was clicked.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachHeaderPress
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'headerPress' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachHeaderPress
 * @function
 */

/**
 * Fire event headerPress to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This object represents the wrapped process flow lane header object.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireHeaderPress
 * @function
 */


/**
 * This event is fired when a problem occurs with the process flow calculation. Usually this means that there is a problem with the data. The console contains the detailed error description with the errors.
 *
 * @name sap.suite.ui.commons.ProcessFlow#onError
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @param {object} oControlEvent.getParameters.oEvent This parameters contains the localized string with error message.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'onError' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself. 
 *  
 * This event is fired when a problem occurs with the process flow calculation. Usually this means that there is a problem with the data. The console contains the detailed error description with the errors.
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/> itself.
 *
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#attachOnError
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'onError' event of this <code>sap.suite.ui.commons.ProcessFlow</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlow#detachOnError
 * @function
 */

/**
 * Fire event onError to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'oEvent' of type <code>object</code> This parameters contains the localized string with error message.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.suite.ui.commons.ProcessFlow} <code>this</code> to allow method chaining
 * @protected
 * @name sap.suite.ui.commons.ProcessFlow#fireOnError
 * @function
 */


/**
 * This method returns the current zoom level of the control.
 *
 * @name sap.suite.ui.commons.ProcessFlow#getZoomLevel
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method sets the new zoom level. If the input is wrong, it is ignored and the previous value stays.
 *
 * @name sap.suite.ui.commons.ProcessFlow#setZoomLevel
 * @function
 * @param {sap.suite.ui.commons.ProcessFlowZoomLevel} oNewZoomLevel
 *         This method sets new zoom level. The enumeration ensures that only available levels are used.
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method decreases the zoom level. More details are displayed in the node.
 *
 * @name sap.suite.ui.commons.ProcessFlow#zoomIn
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method increases the zoom level. Less details are displayed in the node.
 *
 * @name sap.suite.ui.commons.ProcessFlow#zoomOut
 * @function
 * @type sap.suite.ui.commons.ProcessFlowZoomLevel
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method triggers the update of the model and correspondingly the rerender method.
 *
 * @name sap.suite.ui.commons.ProcessFlow#updateModel
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method returns the nodeId of the node, which is focused.
 *
 * @name sap.suite.ui.commons.ProcessFlow#getFocusedNode
 * @function
 * @type string
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method should be called when the contents of the nodes were changed. It updates only the nodes and rerenders the ProcessFlow.
 *
 * @name sap.suite.ui.commons.ProcessFlow#updateNodesOnly
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */


/**
 * This method sets or resets the selected path between two nodes. To reset the selected path, the method has to be called with null/null.
 *
 * @name sap.suite.ui.commons.ProcessFlow#setSelectedPath
 * @function
 * @type void
 * @public
 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
 */

// Start of sap/suite/ui/commons/ProcessFlow.js
///**
// * This file defines behavior for the control.
// */

jQuery.sap.require("sap.m.Image");
/*
 * Resource bundle for the localized strings.
 */
sap.suite.ui.commons.ProcessFlow.prototype._resBundle = null;


/**
 * Zoom level for the control. It is propagated to all created sub controls.
 */
sap.suite.ui.commons.ProcessFlow.prototype._zoomLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;

/**
 * The wheel events time-out.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelTimeout = null;

/**
 * Set to true when the focus is changing to another node.
 */
sap.suite.ui.commons.ProcessFlow.prototype._isFocusChanged = false;

/**
 * The wheel events timestamp for the last wheel event occurrence.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelTimestamp = null;

/**
 * The wheel events flag, if a wheel event was recently processed.
 */
sap.suite.ui.commons.ProcessFlow.prototype._wheelCalled = false;

/**
 * The internal matrix after calculation. Use for keyboard movement.
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalCalcMatrix = false;

/**
 * The internal list of connection mappings (source/target/connectionParts)
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalConnectionMap = null;

/**
 * Internal lanes, which can differ from original ones. Especially when more nodes are in
 * the same lane.
 */
sap.suite.ui.commons.ProcessFlow.prototype._internalLanes = false;

/**
 * Definition for jump over more elements based on the visual design.
 */
sap.suite.ui.commons.ProcessFlow.prototype._jumpOverElements = 5;
/**
 * Last node with navigation focus. It is marked when the focus out event
 * is handled.
 */
sap.suite.ui.commons.ProcessFlow.prototype._lastNavigationFocusNode = false;

/**
 * Set up the cursor classes.
 */
sap.suite.ui.commons.ProcessFlow.prototype._defaultCursorClass = "sapSuiteUiDefaultCursorPF";

if (sap.ui.Device.browser.msie) {
  sap.suite.ui.commons.ProcessFlow.prototype._grabCursorClass = "sapSuiteUiGrabCursorIEPF";
  sap.suite.ui.commons.ProcessFlow.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorIEPF";
} else {
  sap.suite.ui.commons.ProcessFlow.prototype._grabCursorClass = "sapSuiteUiGrabCursorPF";
  sap.suite.ui.commons.ProcessFlow.prototype._grabbingCursorClass = "sapSuiteUiGrabbingCursorPF";
}

sap.suite.ui.commons.ProcessFlow.prototype._mousePreventEvents = 'contextmenu dblclick';
sap.suite.ui.commons.ProcessFlow.prototype._mouseEvents = 'contextmenu mousemove mouseleave mousedown mouseup mouseenter';
sap.suite.ui.commons.ProcessFlow.prototype._mouseWheelEvent = (sap.ui.Device.browser.mozilla) ? 'DOMMouseScroll MozMousePixelScroll' : 'mousewheel wheel';
sap.suite.ui.commons.ProcessFlow.prototype._headerHasFocus = false;
sap.suite.ui.commons.ProcessFlow.prototype._isInitialZoomLevelNeeded = true;

/**
 * Variables used for overflow scrolling.
 */
sap.suite.ui.commons.ProcessFlow.prototype._bDoScroll = !sap.ui.Device.system.desktop || (sap.ui.Device.os.windows && sap.ui.Device.os.version === 8);
sap.suite.ui.commons.ProcessFlow.prototype._scrollStep = 192;
sap.suite.ui.commons.ProcessFlow.prototype._bPreviousScrollForward = false; //Remember the item overflow state.
sap.suite.ui.commons.ProcessFlow.prototype._bPreviousScrollBack = false;
sap.suite.ui.commons.ProcessFlow.prototype._iInitialArrowTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._iInitialCounterTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._bRtl = false;
sap.suite.ui.commons.ProcessFlow.prototype._arrowScrollable = null;
sap.suite.ui.commons.ProcessFlow.prototype._iTouchStartScrollTop = undefined;
sap.suite.ui.commons.ProcessFlow.prototype._iTouchStartScrollLeft = undefined;

sap.suite.ui.commons.ProcessFlow.prototype.init = function () {
  this._bRtl = sap.ui.getCore().getConfiguration().getRTL();

  if (!this._resBundle) {
    this._resBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }
  this._internalLanes = this.getLanes();

  this.$("scrollContainer").bind('keydown', jQuery.proxy(this.onkeydown, this));
  this.$("scrollContainer").bind('keyup', jQuery.proxy(this.onkeyup, this));
};

/**
 * Function destroys all the object components.
 */
sap.suite.ui.commons.ProcessFlow.prototype.exit = function () {
  if (this.getNodes()) {
    for (var i = 0; i < this.getNodes().length; i++) {
      this.getNodes()[i].destroy();
    }
    this.getNodes = null;
  }

  if (this._internalLanes) {
    for (var i = 0; i < this._internalLanes.length; i++) {
      this._internalLanes[i].destroy();
    }
    this._internalLanes = null;
  }
  var aInternalConnectionAgg = this.getAggregation("_connections");
  if (aInternalConnectionAgg) {
    for (var i = 0; i < aInternalConnectionAgg.length; i++) {
      aInternalConnectionAgg[i].destroy();
    }
    aInternalConnectionAgg = null;
  }
  if (this._oArrowLeft) {
    this._oArrowLeft.destroy();
  }
  if (this._oArrowRight) {
    this._oArrowRight.destroy();
  }

  if (this._resizeRegId) {
    sap.ui.core.ResizeHandler.deregister(this._resizeRegId);
  }
  if (this._internalCalcMatrix) {
    delete this._internalCalcMatrix;
    this._internalCalcMatrix = null;
  }

  this.$("scrollContainer").unbind(this._mousePreventEvents, this._handlePrevent);
  this.$("scrollContainer").unbind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
  this.$("scrollContainer").unbind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
  this.$("scrollContainer").unbind('keydown', jQuery.proxy(this.onkeydown, this));
  this.$("scrollContainer").unbind('scroll', jQuery.proxy(this._onScroll, this));
};

sap.suite.ui.commons.ProcessFlow.prototype.onBeforeRendering = function () {
  this.$("scrollContainer").unbind(this._mousePreventEvents, this._handlePrevent);
  this.$("scrollContainer").unbind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
  this.$("scrollContainer").unbind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
  this.$("scrollContainer").unbind('keydown', jQuery.proxy(this.onkeydown, this));
  this.$("scrollContainer").unbind('scroll', jQuery.proxy(this._onScroll, this));
};

/**
 * Function handles the exception based on the business requirements.
 */
sap.suite.ui.commons.ProcessFlow.prototype._handleException = function (exc) {
  var textToDisplay = this._resBundle.getText('PF_ERROR_INPUT_DATA');
  this.fireOnError({ text: textToDisplay });
  jQuery.sap.log.error("Error loading data for the process flow with id : " + this.getId());

  if (exc instanceof Array) {
    for (var i = 0 ; i < exc.length; i++) {
      jQuery.sap.log.error("Detailed description (" + i + ") :" + exc[i]);
    }
  } else {
    jQuery.sap.log.error("Detailed description  :" + exc);
  }
};

/**
 * Function updates the lanes, if more nodes belong to the same lane
 * it must check the node consistency, so this is done the first time the consistency check runs.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateLanesFromNodes = function () {
  sap.suite.ui.commons.ProcessFlow.NodeElement.createNodeElementsFromProcessFlowNodes(this.getNodes(), this.getLanes());
  var aInternalNodes = this._arrangeNodesByParentChildRelation(this.getNodes());
  this._internalLanes = sap.suite.ui.commons.ProcessFlow.NodeElement.updateLanesFromNodes(this.getLanes(), aInternalNodes).lanes;
};

/**
 * Function creates the lane header objects.
 *
 * @private
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader[]} Array containing lane headers for current ProcessFlow
 */
sap.suite.ui.commons.ProcessFlow.prototype._getOrCreateLaneMap = function () {
  if (!this._internalLanes || this._internalLanes.length <= 0) {
    this._updateLanesFromNodes();
  }
  var mapPositionToLane = sap.suite.ui.commons.ProcessFlow.NodeElement.createMapFromLanes(this._internalLanes,
      jQuery.proxy(this.ontouchend, this), this._isHeaderMode()).positionMap;
  return mapPositionToLane;
};

/**
 * This function sorts the internal array of nodes in terms all parents are followed by their children, i.e. no child occurs before his parent in the array.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} aInternalNodes an internal array of nodes to be sorted.
 * @returns {sap.suite.ui.commons.ProcessFlowNode[]} aInternalNodes sorted internal array of nodes.
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._arrangeNodesByParentChildRelation = function (aInternalNodes) {
  var cInternalNodes = aInternalNodes ? aInternalNodes.length : 0;
  var aChildren = [];
  var i, j;
  // Move parents before their children, if they are in the same lane.
  if (cInternalNodes > 0) {
    this._setParentForNodes(aInternalNodes);
    for (i = 0; i < cInternalNodes; i++) {
      aChildren = aInternalNodes[i].getChildren();
      if (aChildren) {
        var cChildren = aChildren.length;
        for (j = 0; j < cChildren; j++) {
          aChildren[j] = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]).toString();
        }
      }
      for (j = 0; j < i; j++) {
        if (jQuery.inArray(aInternalNodes[j].getNodeId(), aChildren) > -1 && aInternalNodes[j].getLaneId() === aInternalNodes[i].getLaneId()) {
          aInternalNodes.splice(j, 0, aInternalNodes[i]);
          aInternalNodes.splice(i + 1, 1);
          aInternalNodes = this._arrangeNodesByParentChildRelation(aInternalNodes);
          break;
        }
      }
    }
  }
  return aInternalNodes;
};

/**
 * Function creates matrix with positions of nodes and connections. This is
 * relative node connection representation and does not cover real page layout.
 *
 * @private
 * @returns The created ProcessFlow control
 */
sap.suite.ui.commons.ProcessFlow.prototype._getOrCreateProcessFlow = function () {
  if (!this._internalLanes || this._internalLanes.length <= 0) {
    this._updateLanesFromNodes();
  }

  this.applyNodeDisplayState();
  var internalNodes = this.getNodes();

  /*tempNodeArray is internal node representation */
  var result = sap.suite.ui.commons.ProcessFlow.NodeElement.createNodeElementsFromProcessFlowNodes(internalNodes, this._internalLanes);
  var elementForId = result.elementForId;
  var elementsForLane = result.elementsForLane;

  sap.suite.ui.commons.ProcessFlow.NodeElement.calculateLaneStatePieChart(elementsForLane, this._internalLanes, internalNodes, this);

  var calcMatrix = this.calculateMatrix(elementForId);
  calcMatrix = this.addFirstAndLastColumn(calcMatrix);
  //Convert NodeElements back to ProcessFlowNodes.
  for (var i = 0; i < calcMatrix.length; i++) {
    for (var j = 0; j < calcMatrix[i].length; j++) {
      if (calcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlow.NodeElement) {
        calcMatrix[i][j] = elementForId[calcMatrix[i][j].nodeId].oNode;
      }
    }
  }
  this._internalCalcMatrix = calcMatrix;
  return calcMatrix;
};

/**
 * Function applies the changes to the display state based on the requirements.
 * If any node is in the highlighted state all others go to the dimmed state.
 *
 * @public
 */
sap.suite.ui.commons.ProcessFlow.prototype.applyNodeDisplayState = function () {
  var aInternalNodes = this.getNodes(),
      iNodeCount = aInternalNodes ? aInternalNodes.length : 0,
      i = 0;

  if (iNodeCount === 0) {
    return;
  } else {
    // First put all the nodes to the regular state - if possible
    while (i < iNodeCount) {
      aInternalNodes[i]._setRegularState();
      i++;
    }

    // Check for the highlighted or selected node- at least one is required
    i = 0;
    while ((i < iNodeCount) && !aInternalNodes[i].getHighlighted() && !aInternalNodes[i].getSelected()) {
      i++;
    }

    // If a highlighted or selected node was found, set the others to dimmed state
    if (i < iNodeCount) {
      i = 0;
      while (i < iNodeCount) {
        if (!aInternalNodes[i].getHighlighted() && !aInternalNodes[i].getSelected()) {
          aInternalNodes[i]._setDimmedState();
        }
        i++;
      }
    }
  }
};

/**
 * Function adds first and last column, which serves for the special header signs. It has to add
 * single cell to all internal arrays.
 *
 * @param calculatedMatrix
 * @returns {Object[]} The calculated matrix including first and last column
 */
sap.suite.ui.commons.ProcessFlow.prototype.addFirstAndLastColumn = function (calculatedMatrix) {

  if (!calculatedMatrix || calculatedMatrix.length <= 0) {
    return [];
  }

  var originalX = calculatedMatrix.length;

  for (var i = 0; i < originalX; i++) {
    calculatedMatrix[i].unshift(null);
    calculatedMatrix[i].push(null);
  }

  return calculatedMatrix;
};

/**
 * Function calculates a virtual matrix with nodes and connections.
 *
 * @private
 * @param elementForId contains a map of the node id's to node elements
 * @throws an array with messages on processing errors
 * @returns {Object[]} The composed virtual matrix
 */
sap.suite.ui.commons.ProcessFlow.prototype.calculateMatrix = function (elementForId) {
  var internalMatrixCalculation,
      oElementInfo,
      highestLaneNumber,
      rows,
      return2DimArray,
      bRefocusRequired;

  //No calculation in case of zero input.
  if (!elementForId || (elementForId.length === 0)) {
    return [];
  }

  internalMatrixCalculation = new sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation(this);
  bRefocusRequired = internalMatrixCalculation.checkInputNodeConsistency(elementForId);
  oElementInfo = internalMatrixCalculation.retrieveInfoFromInputArray(elementForId);
  internalMatrixCalculation.resetPositions();
  highestLaneNumber = oElementInfo.highestLanePosition + 1;

  // Worst case, all children are in the same lane with so many rows.
  rows = Object.keys(elementForId).length > 3 ? Object.keys(elementForId).length - 1 : 2;
  return2DimArray = internalMatrixCalculation.createMatrix(rows, highestLaneNumber);

  for (var i = 0; i < oElementInfo.rootElements.length; i++) {
    internalMatrixCalculation.posy = oElementInfo.rootElements[i].lane;
    return2DimArray = internalMatrixCalculation.processCurrentElement(oElementInfo.rootElements[i], elementForId, return2DimArray);
  }

  // If true, it is necessary to recalculate the focus state for all to false. Root is
  // afterwards set to focused.
  if (bRefocusRequired && return2DimArray[0][0] && return2DimArray[0][0].oNode.setFocused) {
    Object.keys(elementForId).forEach(function (sElementId) {
      var oElement = elementForId[sElementId];
      oElement.oNode.setFocused(false);
    });
    return2DimArray[0][0].oNode.setFocused(true);
  }

  return2DimArray = internalMatrixCalculation.doubleColumnsInMatrix(return2DimArray);
  return2DimArray = internalMatrixCalculation.calculatePathInMatrix(return2DimArray);
  return2DimArray = internalMatrixCalculation.removeEmptyLines(return2DimArray);
  return return2DimArray;
};


/**
 * This is a virtual node holding necessary data to create virtual matrix.
 *
 * @private
 * @param {string} id id of the PF node
 * @param {number} oLane lane position of the node
 * @param {sap.suite.ui.commons.ProcessFlowNode} oNode a PF node
 * @param {Number[]} aNodeParents array of parent id's of the oNode
 */
sap.suite.ui.commons.ProcessFlow.NodeElement = function (id, oLane, oNode, aNodeParents) {
  this.nodeId = id;
  this.lane = oLane;
  this.state = oNode.getState();
  this.displayState = oNode._getDisplayState();
  this.isProcessed = false;

  if (jQuery.isArray(aNodeParents)) {
    this.aParent = aNodeParents;
  } else {
    this.oParent = aNodeParents;
  }
  this.oNode = oNode;
};

/**
 * Another type of the node element constructor.
 *
 * @private
 * @param id node id
 * @param lane lane position
 * @param oNode reference to a PF node control
 * @param aNodeParents reference to the ids of parents of the oNode
 * @returns A new node element
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.initNodeElement = function (sId, oLane, oNode, aNodeParents) {
  return new sap.suite.ui.commons.ProcessFlow.NodeElement(sId, oLane, oNode, aNodeParents);
};

/**
 * Extend the NodeElement object with to String function.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.prototype = {
  toString: function () {
    return this.nodeId;
  },
  containsChildren: function (that) {
    if (!that) {
      return false;
    }
    if (!(that instanceof sap.suite.ui.commons.ProcessFlow.NodeElement)) {
      return false;
    }
    if (this.oNode.getChildren() && that.oNode.getChildren() && this.oNode.getChildren().length && that.oNode.getChildren().length) {
      for (var i = 0; i < this.oNode.getChildren().length; i++) {
        if (that.oNode.getChildren().indexOf(this.oNode.getChildren()[i]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }
};

/**
 * Function calculates the state part of the lane from nodes belong to this lane.
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.calculateLaneStatePieChart = function (elementsForLane, laneArray, internalNodes, processFlowObject) {
  // Check input parameters.
  if (!elementsForLane || !laneArray || !internalNodes) {
    return;
  }

  //First, check if all nodes are in the regular state. If not, only the highlighted ones are taken into calculation.
  for (var i = 0; i < internalNodes.length; i++) {
    processFlowObject._bHighlightedMode = internalNodes[i].getHighlighted();
    if (processFlowObject._bHighlightedMode) {
      break;
    }
  }
  var positive = 0;
  var negative = 0;
  var neutral = 0;
  var planned = 0;
  for (var i = 0; i < laneArray.length; i++) {
    var laneObject = laneArray[i];
    var elements = elementsForLane[laneObject.getLaneId()];

    //If we do not have nodes, nothing needs to be calculated.
    if (!elements) {
      continue;
    }

    positive = 0;
    negative = 0;
    neutral = 0;
    planned = 0;

    for (var j = 0; j < elements.length; j++) {
      //Maybe ...oNode.getHighlighted() can be used instead of the big selector which needs to be maintained in case of extensions.
      if (!processFlowObject._bHighlightedMode ||
          (elements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted ||
           elements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused ||
           elements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted ||
           elements[j].oNode._getDisplayState() == sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused)) {
        switch (elements[j].oNode.getState()) {
          case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
            positive++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
            negative++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
            planned++;
            break;
          case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
            neutral++;
            break;
            //plannedNegative belong to the Negative group
          case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
            negative++;
            break;
        }
      }
    } // End of nodes for single lane.
    var stateData = [{state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, value:positive},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, value:negative},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value:neutral},
                     {state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, value:planned}];
    laneObject.setState(stateData);
  }
};

/**
 * This function must check and calculate the potentially new lanes.
 * This is, because more nodes can be located in the same lane. In this case,
 * the new artificial lane is created and positioned just after original one.
 *
 * @param aProcessFlowLanes the original lane array
 * @param aInternalNodes internal nodes
 * @returns {Object} Dynamic object containing laines and nodes
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.updateLanesFromNodes = function (aProcessFlowLanes, aInternalNodes) {
  var createMapResult = sap.suite.ui.commons.ProcessFlow.NodeElement.createMapFromLanes(aProcessFlowLanes, null, false);
  var mapLanesArrayPosition = createMapResult.positionMap;
  var mapLanesArrayId = createMapResult.idMap;
  var oNode = {};
  var tempProcessFlowLanes = aProcessFlowLanes.slice();
  var bPotentialNewLaneExists;
  var tempLanesPos = {};
  var nPos = 0;

  for (var i = 0; i < aInternalNodes.length; i++) {
    oNode[aInternalNodes[i].getNodeId()] = aInternalNodes[i];
  }

  for (var i = 0; i < aInternalNodes.length; i++) {
    var node = aInternalNodes[i];
    var children = node.getChildren() || [];
    var positionUp = 1; //Check the move up for the given sublanes of the lane. Every new sublane creation.
    var potentialNewLaneId = null;
    var potentialNewLane = null;
    // Makes plus 1 effect.
    for (var j = 0; j < children.length; j++) { // Check the children.
      var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(children[j]);
      var childrenNode = oNode[sChildId];
      if (childrenNode && (node.getLaneId() == childrenNode.getLaneId())) {
        // Create new lane id and check the lane.
        potentialNewLaneId = childrenNode.getLaneId() + positionUp;
        potentialNewLane = mapLanesArrayId[potentialNewLaneId];
        if (!potentialNewLane) { // If we have the lane already.
          var origLaneObject = mapLanesArrayId[node.getLaneId()];
          potentialNewLane = sap.suite.ui.commons.ProcessFlow.NodeElement.createNewProcessFlowElement(origLaneObject, potentialNewLaneId, origLaneObject.getPosition() + positionUp);
          // Update the maps and output array.
          mapLanesArrayId[potentialNewLane.getLaneId()] = potentialNewLane;
          tempProcessFlowLanes.splice(potentialNewLane.getPosition(), 0, potentialNewLane);
        }
        // Assign new lane to children
        // The new laneId should not override the old one, therefore it is stored in a hidden property
        childrenNode._setMergedLaneId(potentialNewLane.getLaneId());
      }
      // Move also the assignment of this lane for all children. Otherwise it is bad ...
      // so, take the children of current children and move the lane position to the new lane, if necessary
      // it is in the case when the lane is the same as was PARENT node. this is important to understand,
      // that this children is already moved to new one, so parent lane is compared.
      // This is a recursion.
      sap.suite.ui.commons.ProcessFlow.NodeElement.changeLaneOfChildren(node.getLaneId(), childrenNode, oNode);
    }
    // Now we should move all positions up about the number positionUp.
    // Also the position map is in wrong state now.
    // Now work with all vector, later on we can move only to lanes with higher position than working one.
    if (potentialNewLane) {
      tempLanesPos = {};
      bPotentialNewLaneExists = false;
      for (var key in mapLanesArrayPosition) {
        if (potentialNewLane.getLaneId() == mapLanesArrayPosition[key].getLaneId()) {
          bPotentialNewLaneExists = true;
          break;
        }
        if (parseInt(key) >= potentialNewLane.getPosition()) {
          var tempLaneObject = mapLanesArrayPosition[key];
          tempLanesPos[tempLaneObject.getPosition() + positionUp] = tempLaneObject;
          // tempLaneObject.setPosition(tempLaneObject.getPosition()+positionUp);
        }
      }
      if (!bPotentialNewLaneExists) {
        for (var w in tempLanesPos) {
          nPos = parseInt(w);
       // The moved position should not override the old one, therefore it is stored in a hidden property
          tempLanesPos[nPos]._setMergedPosition(nPos);
        }
        tempLanesPos[potentialNewLane.getPosition()] = potentialNewLane;
        for (var v = 0; v < potentialNewLane.getPosition(); v++) {
          tempLanesPos[v] = mapLanesArrayPosition[v];
        }
        mapLanesArrayPosition = tempLanesPos;
      }
    }
  }
  return { lanes: tempProcessFlowLanes, nodes: aInternalNodes };
};

sap.suite.ui.commons.ProcessFlow.NodeElement.changeLaneOfChildren = function (origLaneId, currentNode, nodeArray) {
  var children = currentNode.getChildren();
  if (children) {
    for (var i = 0; i < children.length; i++) {
      var childId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(children[i]);
      var childrenNode = nodeArray[childId];
      if (childrenNode.getLaneId() == origLaneId) {
        childrenNode._setMergedLaneId(currentNode.getLaneId());
        sap.suite.ui.commons.ProcessFlow.NodeElement.changeLaneOfChildren(origLaneId, childrenNode, nodeArray);
      }
    }
  }
};

sap.suite.ui.commons.ProcessFlow.NodeElement.createNewProcessFlowElement = function (originalElement, newLaneId, newPosition) {
  var cloneElement = new sap.suite.ui.commons.ProcessFlowLaneHeader({
    laneId: newLaneId,
    iconSrc: originalElement.getIconSrc(),
    text: originalElement.getText(),
    state: originalElement.getState(),
    position: newPosition,
    zoomLevel: originalElement.getZoomLevel()
  });
  return cloneElement;
};

/**
 * This function creates the map where key = position value - lane element.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowLaneHeader[]} aProcessFlowLanes array of lanes
 * @param {function} fnTapHandler tap handler for the lane header element
 * @param {boolean} bHeaderMode should be true, if the process flow is in the header mode
 * @returns {Object} Map of lane positions to lane header element control instances
 */
sap.suite.ui.commons.ProcessFlow.NodeElement.createMapFromLanes = function (aProcessFlowLanes, fnTapHandler, bHeaderMode) {
  var oLane,
      aMapLaneArrayPosition = {},
      aMapLaneArrayId = {},
      nLanes = aProcessFlowLanes ? aProcessFlowLanes.length : 0,
      i = 0;

  if (!nLanes) {
    return {};
  } else {
    while (i < nLanes) {
      oLane = aProcessFlowLanes[i];
      if (oLane instanceof sap.suite.ui.commons.ProcessFlowLaneHeader) {
        aMapLaneArrayPosition[oLane.getPosition()] = oLane;
        aMapLaneArrayId[oLane.getLaneId()] = oLane;
        // Forward the icon click events from the lane header items to the ProcessFlow control.
        if (fnTapHandler) {
          oLane.attachPress(fnTapHandler);
        }
        oLane._setHeaderMode(bHeaderMode);
      }
      i++;
    }

    return { positionMap: aMapLaneArrayPosition, idMap: aMapLaneArrayId };
  }
};

/**
*
* This function transforms from process flow node element into the internal
* node element. The strategy is to work inside algorithm only with internal
* representation.
*
* @private
* @parameter processFlowNodes PF nodes from the controls interface, preprocessed - so they all have a valid (user entered, resp. generated) lane id
* @parameter elementsForLane
* @returns {Object} Element containing elementForId(NodeElement) and elementsForLane (NodeElement[])
*/
sap.suite.ui.commons.ProcessFlow.NodeElement.createNodeElementsFromProcessFlowNodes = function (processFlowNodes, processFlowLanes) {
  var aPositionForLaneId = {}, // Map holds the transition between lane id and position.
      aElementsForLane = {}, // Holds a map from laneId to array of the elements for given laneId.
      aParentsForChild = {},
      oNode,
      iNodeCount = processFlowNodes ? processFlowNodes.length : 0,
      sNodeId,
      oLane,
      iLaneCount = processFlowLanes ? processFlowLanes.length : 0,
      sLaneId,
      aPositions = [],
      iLanePosition,
      aChildren,
      sChild,
      nChildCount,
      i,
      j,
      aElementForId = {};

  if (iNodeCount === 0) {
    return { elementForId: {}, elementsForLane: {} };
  }

  if (iLaneCount === 0) {
    throw ["No lane definition although there is a node definition."];
  }

  i = 0;
  while (i < iLaneCount) {
    oLane = processFlowLanes[i];
    sLaneId = oLane.getLaneId();
    iLanePosition = oLane.getPosition();

    if (aPositionForLaneId[sLaneId]) {
      throw ["The lane with id: " + sLaneId + " is defined at least twice. (Lane error)"];
    }

    aPositionForLaneId[sLaneId] = iLanePosition;

    if (jQuery.inArray(iLanePosition, aPositions) > -1) {
      throw ["The position " + iLanePosition + " is defined at least twice. (Lane error)."];
    } else {
      aPositions.push(iLanePosition);
    }

    aElementsForLane[sLaneId] = [];
    i++;
  }

  // search for the parent
  i = 0;
  while (i < iNodeCount) {
    oNode = processFlowNodes[i];
    if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      sNodeId = oNode.getNodeId();
      sLaneId = oNode.getLaneId();

      aChildren = oNode.getChildren() || [];
      nChildCount = aChildren.length;
      j = 0;
      while (j < nChildCount) {
        sChild = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
        aParentsForChild[sChild] = aParentsForChild[sChild] || [];
        aParentsForChild[sChild].push(sNodeId);
        j++;
      }
    }
    i++;
  }

  i = 0;
  while (i < iNodeCount) {
    oNode = processFlowNodes[i];
    if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      sNodeId = oNode.getNodeId();

      if (!sNodeId) {
        throw ["There is a node which has no node id defined. (Title=" + oNode.getTitle() + ") and array position: " + i];
      }

      sLaneId = oNode.getLaneId();

      iLanePosition = aPositionForLaneId[sLaneId];
      if (typeof iLanePosition !== 'number') {
        throw ["For the node " + sNodeId + " position (lane) is not defined."];
      }

      if (!aElementForId[sNodeId]) {
        aElementForId[sNodeId] = sap.suite.ui.commons.ProcessFlow.NodeElement.initNodeElement(sNodeId, iLanePosition, oNode, aParentsForChild[sNodeId]);

        aElementsForLane[sLaneId].push(aElementForId[sNodeId]);
      } else {
        throw ["The node id " + sNodeId + " is used second time."];
      }
    }
    i++;
  }

  return { elementForId: aElementForId, elementsForLane: aElementsForLane };
};

/**
 * Constructor of the algorithm object.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation = function (parentControl) {
  this.parentControl = parentControl;
  this.posx = 0;
  this.posy = 0;

  this.nodePositions = {};
  this.mapChildToNode = {};
};

/**
 * Function checks consistency of the node array. It checks,
 * if all children defined for the nodes are also presented as the nodes themselves.
 *
 * @public
 * @param elementForId Map of node id's to NodeElements. Expectation is to have at least 1 element there. No check for empty array.
 * @returns {Boolean} Value, where true means no activity, false means set the focus on top left root node
 * @throws array of error messages produced during the consistency check
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.checkInputNodeConsistency = function (elementForId) {
  var returnArr = [],
      j,
      sChildId,
      nChildCount,
      aChildren,
      oElement,
      nFocusNodes = 0;

  //Preparation phase
  Object.keys(elementForId).forEach(function (sElementId) {
    oElement = elementForId[sElementId];
    aChildren = oElement.oNode.getChildren();
    nChildCount = aChildren ? aChildren.length : 0;

    if (oElement.oNode.getFocused()) {
      nFocusNodes++;
    }

    j = 0;
    while (j < nChildCount) {
      sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
      if (!elementForId[sChildId]) {
        returnArr.push("Node identificator " + sChildId + " used in children definition is not presented as the node itself. Element : " + oElement.nodeId);
      }
      j++;
    }
  });

  if (returnArr.length > 0) {
    throw returnArr;
  }
  return nFocusNodes > 1;
};

/**
 * Function resets the positions into initial one to keep new calculation
 * without side effects.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.resetPositions = function () {
  this.posx = 0;
  this.posy = 0;

  delete this.nodePositions;
  delete this.mapChildToNode;

  this.nodePositions = {};
  this.mapChildToNode = {};
};

/**
 * Function creates matrix based on the length.
 *
 * @private
 * @param {String} length number of columns
 * @returns {Object[]} Array with two dimensions
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.createMatrix = function (length) {
  length = parseInt(length, 10);
  var arr = new Array(length || 0);
  var i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) {
      arr[length - 1 - i] = this.createMatrix.apply(this, args);
    }
  }
  return arr;
};

/**
 * Function retrieves the important information from input array.
 *
 * @private
 * @param elementForId map of element id's to elements
 * @returns {Object} Element containing highestLanePosition(number) and rootElements (Element[])
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.retrieveInfoFromInputArray = function (elementForId) {

  var highestLanePosition = 0,
      rootElements = [],
      oElement;

  Object.keys(elementForId).forEach(function (sElementId) {
    oElement = elementForId[sElementId];

    if (!oElement.oParent && !oElement.aParent) {
      rootElements.push(oElement);
    }

    if (highestLanePosition < oElement.lane) {
      highestLanePosition = oElement.lane;
    }
  });

  return {
    'highestLanePosition': highestLanePosition,
    'rootElements': rootElements
  };
};

/**
 * Function doubles the matrix for drawing purposes and it only doubles the columns and add undefined values there.
 *
 * @private
 * @returns {Object[]} Array with doubled colummns
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.doubleColumnsInMatrix = function (currentMatrix) {
  var matrixY = 0;

  for (var i = 0; i < currentMatrix.length; i++) {
    matrixY = matrixY > currentMatrix[i].length ? matrixY : currentMatrix[i].length;
  }

  var doubleArray = new Array(currentMatrix.length || 0);

  for (var i = 0; i < doubleArray.length; i++) {
    doubleArray[i] = new Array(matrixY * 2 - 1);
    for (var j = 0; j < matrixY; j++) {
      if (currentMatrix[i][j]) {
        doubleArray[i][2 * j] = currentMatrix[i][j];
      }
    }
  }
  return doubleArray;
};

/**
 * Function removes empty lines from the matrix.
 *
 * @returns {Object[]} Array where empty lines have been removed
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.removeEmptyLines = function (originalMatrix) {
  //First check the number of valid lines.
  var numberOfLines = 0;
  for (var i = 0; i < originalMatrix.length; i++) {
    for (var j = 0; j < originalMatrix[i].length; j++) {
      if (originalMatrix[i][j]) {
        numberOfLines++;
        break;
      }
    }
  }

  var returnArray = this.createMatrix(numberOfLines, originalMatrix[0].length);

  for (var i = 0; i < numberOfLines; i++) {
    for (var j = 0; j < originalMatrix[i].length; j++) {
      returnArray[i][j] = null; // everything is at least null
      if (originalMatrix[i][j]) {
        returnArray[i][j] = originalMatrix[i][j];
      }
    }
  }
  return returnArray;
};

/**
 * This function creates the matrix with nodes positioned into the proper places.
 *
 * @public
 * @param currentElement actually processed element
 * @param elementForId map of all the available elements
 * @param return2DimArray the updated virtual matrix
 * @returns The updated virtual matrix
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.processCurrentElement = function (currentElement, elementForId, return2DimArray) {
  var aElementsChildIds,
      aElementsChildren,
      that = this,
      bMoveToNextLine = true; // This is the check for repeated parent child relationship. The childrenArr is not empty but
  // in fact it is required to move to the next line.

  if (currentElement.isProcessed) {
    return return2DimArray;
  }

  this.nodePositions[currentElement.nodeId] = {
    'c': currentElement,
    'x': this.posx,
    'y': this.posy * 2
  };

  return2DimArray[this.posx][this.posy++] = currentElement;
  aElementsChildIds = currentElement.oNode.getChildren();
  currentElement.isProcessed = true;
  aElementsChildren = this.sortBasedOnChildren(aElementsChildIds, elementForId);

  if (aElementsChildren) {
    aElementsChildren.forEach(function (oChild) {
      if (!oChild.isProcessed) {
        bMoveToNextLine = false;

        while (that.posy < oChild.lane) {
          return2DimArray[that.posx][that.posy++] = null;
        }

        return2DimArray = that.processCurrentElement(oChild, elementForId, return2DimArray);
      }
    });
  }

  if (!aElementsChildIds || bMoveToNextLine) {
    this.posx++;
    this.posy = 0;
  }

  return return2DimArray;
};

/**
 * Sort based on the child closenes. If 2 children has some common children they get next to each other.
 *
 * @private
 * @param aElementsChildIds child ids of the currently processed node
 * @param elementForId  contains a map of the node id's to node elements
 * @returns {sap.suite.ui.commons.ProcessFlow.NodeElement} Array containing sorted child elements (first sort by lanes, than the elements having the same children gets next to each other)
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.sortBasedOnChildren = function (aElementsChildIds, elementForId) {
  var oElementsForLane = {},
      aElements,
      laneId = null,
      aLaneIds,
      aNmbrChildren,
      bNmbrChildren,
      finalSortedArray = [],
      aSingleLaneContent,
      aSingleContent,
      oProcessedChildElement;

  if (aElementsChildIds) {
    aElementsChildIds.forEach(function (oChildId) {
      var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(oChildId);
      aElements = oElementsForLane[elementForId[sChildId].lane];
      if (!aElements) {
        oElementsForLane[elementForId[sChildId].lane] = aElements = [];
      }
      aElements.push(elementForId[sChildId]);
    });
  } else {
    return [];
  }

  aLaneIds = [];
  for (laneId in oElementsForLane) {
    aLaneIds.push(laneId);
    //Sort the Nodes (related to currend lane) descending by amount of children.
    oElementsForLane[laneId].sort(function (a, b) {
      //Lane needs not to be checked.
      //If it is the same one, check for the same children. 
      //In this case return 0
      aNmbrChildren = (a.oNode.getChildren() || []).length;
      bNmbrChildren = (b.oNode.getChildren() || []).length;
      return bNmbrChildren - aNmbrChildren;
    });
  }

  //Sort the Lanes descending by laneId.
  aLaneIds = aLaneIds.sort(function (a, b) {
    return b - a;
  });

  //Now we have in aLaneIds the lane orderd (descending by laneId)
  //Based on that we take from map the elements for the lanes.
  //Now order based on the children.
  aLaneIds.forEach(function (laneId) {
    aSingleLaneContent = oElementsForLane[laneId];

    if (aSingleLaneContent.length > 1) {
      aSingleContent = [];
      //We iterate through all the children and
      //put all the nodes having at least 1 common child next to each other.
      oProcessedChildElement = aSingleLaneContent.shift();
      while (oProcessedChildElement) {
        if (aSingleContent.indexOf(oProcessedChildElement) < 0) {
          aSingleContent.push(oProcessedChildElement);
        }

        aSingleLaneContent.forEach(function (oSiblingElement) {
          if (oProcessedChildElement.containsChildren(oSiblingElement)) {
            aSingleContent.push(oSiblingElement);
          }
        });
        oProcessedChildElement = aSingleLaneContent.shift();
      }
      finalSortedArray = finalSortedArray.concat(aSingleContent);
    } else {
      finalSortedArray = finalSortedArray.concat(aSingleLaneContent);
    }
  });
  return finalSortedArray;
};

/**
 * Function calculates the connection and writes into the virtual matrix. It gets the matrix plus
 * parent children relationship.
 * 
 * @param OriginalMatrix the matrix with the setup of nodes
 * @returns {Object[]} The matrix updated with the calculated paths
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.calculatePathInMatrix = function (originalMatrix) {
  var currentElement = null;
  for (var key in this.nodePositions) {
    if (this.nodePositions.hasOwnProperty(key)) {
      currentElement = this.nodePositions[key];
      var aChildren = currentElement.c.oNode.getChildren();
      for (var i = 0; aChildren && i < aChildren.length; i++) {
        var sChildId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[i]);
        var positionChildrenObject = this.nodePositions[sChildId];
        originalMatrix = this.calculateSingleNodeConnection(currentElement,
                         positionChildrenObject, currentElement.x, currentElement.y,
                         positionChildrenObject.x, positionChildrenObject.y, originalMatrix);
      }
    }
  }
  return originalMatrix;
};

/**
 * Function based on the parent children position calculated the path from parent to children. The idea is like following
 * go from parent half right and use next connection column to go up or down. Afterwards on the line with children go
 * horizontal.
 *
 * @param nodeParent
 * @param nodeChildren
 * @param parentX
 * @param parentY
 * @param childrenX
 * @param childrenY
 * @param originalMatrix
 * @returns {Object[]} The original Matrix
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.calculateSingleNodeConnection = function (
    nodeParent, nodeChildren, parentX, parentY, childrenX, childrenY, originalMatrix) {
  var hor = childrenY - parentY;
  var ver = childrenX - parentX;
  if (hor < 0) {
    var errMsg = ["Problem with negative horizontal movement",
                  "Parent node is " + nodeParent.c.toString(),
                  "Children node is " + nodeChildren.c.toString(),
                  "Coordinates : '" + parentX + "','" + parentY + "','" + childrenX + "','" + childrenY + "'"];
    throw errMsg;
  } else if (ver <= -1) {
    // Half left and up
    var bNormalHorizontalLinePossible = this.checkIfHorizontalLinePossible(originalMatrix, childrenX, parentY + 2, childrenY);
    var yPosition = childrenY - 1;
    if (bNormalHorizontalLinePossible) {
      yPosition = parentY + 1;
    }
    var xPosition = parentX;
    if (bNormalHorizontalLinePossible) {
      xPosition = childrenX;
    }
    originalMatrix[parentX][yPosition] = this.createConnectionElement(
        originalMatrix[parentX][yPosition], sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.LU,
        nodeParent, nodeChildren, false);

    //Going up to the children.
    originalMatrix = this.writeVerticalLine(originalMatrix, parentX, childrenX, yPosition, nodeParent, nodeChildren);

    originalMatrix[childrenX][yPosition] =
      this.createConnectionElement(originalMatrix[childrenX][yPosition],
      sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.UR, nodeParent,
      nodeChildren, (yPosition == childrenY - 1));
    //Pure right.
    var startY = parentY + 2;
    var endY = childrenY;
    if (!bNormalHorizontalLinePossible) {
      startY = parentY + 1;
      endY = yPosition + 1;
    }
    originalMatrix = this.writeHorizontalLine(originalMatrix, xPosition, startY, endY, nodeParent, nodeChildren);
  } else if (ver === 0) {
    originalMatrix = this.writeHorizontalLine(originalMatrix, parentX, parentY + 1, childrenY, nodeParent, nodeChildren);
  } else if (ver === 1) {
    //1 row down and do horizontal line.
    //Half and down.
    originalMatrix[parentX][parentY + 1] = this.createConnectionElement(originalMatrix[parentX][parentY + 1],
                                           sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.LD, nodeParent,
                                           nodeChildren, false);
    //Down and right.
    originalMatrix[childrenX][parentY + 1] = this.createConnectionElement(originalMatrix[childrenX][parentY + 1],
                                             sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.DR, nodeParent,
                                             nodeChildren, (parentY + 1) === (childrenY - 1));
    //Horizontal line to the target.
    originalMatrix = this.writeHorizontalLine(originalMatrix, childrenX, parentY + 2, childrenY, nodeParent, nodeChildren);
  } else { //ver > 1
    //Go down until children and do horizontal line.
    //Half left and down.
    originalMatrix[parentX][parentY + 1] = this.createConnectionElement(originalMatrix[parentX][parentY + 1],
                                           sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.LD, nodeParent,
                                           nodeChildren, false);
    originalMatrix = this.writeVerticalLine(originalMatrix, childrenX, parentX, parentY + 1, nodeParent, nodeChildren);
    //Half down and right.
    originalMatrix[childrenX][parentY + 1] = this.createConnectionElement(originalMatrix[childrenX][parentY + 1],
                                             sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.DR, nodeParent,
                                             nodeChildren, (parentY + 1) === (childrenY - 1));
    originalMatrix = this.writeHorizontalLine(originalMatrix, childrenX, parentY + 2, childrenY, nodeParent, nodeChildren);
  }
  return originalMatrix;
};

/**
 * Write vertical line from firstrow to lastrow on the column position.
 *
 * @private
 * @returns {Object[]} The original matrix containing vertical line connections
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.writeVerticalLine = function (originalMatrix, firstRow, lastRow, column, nodeParent, nodeChildren) {
  for (var j = firstRow - 1; j > lastRow; j--) {
    originalMatrix[j][column] = this.createConnectionElement(originalMatrix[j][column],
                                sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.DU, nodeParent,
                                nodeChildren, false);
  }
  return originalMatrix;
};

/**
 * Checks if the horizontal line is possible.
 * 
 * @private
 * @param originalMatrix
 * @param row
 * @param firstColumn
 * @param lastColumn
 * @returns {boolean} Function return true, if the path is free, otherwise false
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.checkIfHorizontalLinePossible = function (
    originalMatrix, row, firstColumn, lastColumn) {
  var bLinePossible = true;
  for (var i = firstColumn; i < lastColumn; i++) {
    if (originalMatrix[row][i] instanceof sap.suite.ui.commons.ProcessFlow.NodeElement) {
      bLinePossible = false;
      break;
    }
  }

  return bLinePossible;
};

/**
 * Function calculated and writes horizontal line.
 *
 * @param originalMatrix matrix to write to
 * @param row the horizontal position
 * @param firstColumn where to start
 * @param lastColumn where to stop
 * @param nodeParent definition of initial node
 * @param nodeChildren definition of target node
 * @returns {Object[]} The original Matrix including the horizontal lines
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.writeHorizontalLine = function (
    originalMatrix, row, firstColumn, lastColumn, nodeParent, nodeChildren) {
  var bPotentialArrow = (row == nodeChildren.x);
  //No arrow, no last line ... somewhere else will be (up and right).
  if (!bPotentialArrow) {
    lastColumn--;
  }
  for (var i = firstColumn; i < lastColumn; i++) {
    originalMatrix[row][i] =
      this.createConnectionElement(originalMatrix[row][i], sap.suite.ui.commons.ProcessFlow.cellEdgeConstants.LR, nodeParent, nodeChildren, (i == (lastColumn - 1)) && bPotentialArrow);
  }
  return originalMatrix;
};

/**
 * Function adds new connection element to the cell in the matrix. It is an additive approach where during the
 * drawing phase all the connections in one cell will be joined together.
 *
 * @private
 * @param originalConnectionValue
 * @param addStringValue
 * @param initialNode
 * @param targetNode
 * @param bArrowRequired
 * @returns {sap.suite.ui.commons.ProcessFlowConnection} The connection element
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype.createConnectionElement = function (originalConnectionValue, addStringValue, initialNode, targetNode, bArrowRequired) {

  var tempOriginalConnectionValue = originalConnectionValue;
  if (!tempOriginalConnectionValue) {
    tempOriginalConnectionValue = new sap.suite.ui.commons.ProcessFlowConnection();
  }
  if (tempOriginalConnectionValue instanceof sap.suite.ui.commons.ProcessFlowConnection) {
    var displayState = this._calculateConnectionDisplayStateBySourceAndTargetNode(initialNode.c.oNode, targetNode.c.oNode);
    var objConn = {
      flowLine: addStringValue,
      targetNodeState: targetNode.c.state,
      displayState: displayState,
      hasArrow: bArrowRequired
    };
    tempOriginalConnectionValue.addConnectionData(objConn);
  }
  return tempOriginalConnectionValue;
};

/**
 * Calculates the correct display state for a connection based on the source and the target node.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} sourceNode for calculation
 * @param {sap.suite.ui.commons.ProcessFlowNode} targetNode for calculation
 * @returns {sap.suite.ui.commons.ProcessFlowDisplayState} The resulting displayState
 */
sap.suite.ui.commons.ProcessFlow.InternalMatrixCalculation.prototype._calculateConnectionDisplayStateBySourceAndTargetNode = function (sourceNode, targetNode) {
  var bSourceIsHighlighted = sourceNode.getHighlighted();
  var bSourceIsSelected = sourceNode.getSelected();
  var bSourceIsDimmed = sourceNode._getDimmed();
  var bTargetIsHighlighted = targetNode.getHighlighted();
  var bTargetIsSelected = targetNode.getSelected();
  var bTargetIsDimmed = targetNode._getDimmed();

  var displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Regular;
  if (bSourceIsSelected && bTargetIsSelected) {
    displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Selected;
  } else if (bSourceIsHighlighted && bTargetIsHighlighted) {
    displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted;
  } else if ((bSourceIsDimmed || bTargetIsDimmed) ||
              bSourceIsHighlighted && bTargetIsSelected ||
              bSourceIsSelected && bTargetIsHighlighted) {
    //If the node is not in state dimmed and no direct connection between select/highlighted nodes is available, set dimmed state.
    displayState = sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed;
  }

  return displayState;
};

sap.suite.ui.commons.ProcessFlow.cellEdgeConstants = {
  'LU': 'tl', //It is going from Left to the middle and afterwards Up = top left.
  'LD': 'lb', //It is going from Left to the middle and afterwards Down = left bottom.
  'DU': 'tb', //It is going from Down to the middle and afterwards Up = top bottom.
  'LR': 'rl', //It is going from Left to the middle and afterwards Right = right left.
  'DR': 'rt', //It is going from Down to the middle and afterwards Right = right top.
  'UR': 'rb'  //It is going from Up to the middle and afterwards Right = right bottom.
};

sap.suite.ui.commons.ProcessFlow.prototype.addNode = function (addNode) {
  return this.addAggregation("nodes", addNode, false);
};

/**
 * Function sets the zoom level.
 *
 * @param zoomLevel. this is a new zoom level of the type sap.suite.ui.commons.ProcessFlowZoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.setZoomLevel = function (zoomLevel) {
  var $scrollContainer = this.$("scrollContainer");
  var oScrollContainerContextOld;
  var oScrollContainerContextNew;
  if ($scrollContainer.context) {
    oScrollContainerContextOld = {
      scrollWidth: $scrollContainer.context.scrollWidth,
      scrollHeight: $scrollContainer.context.scrollHeight,
      scrollLeft: $scrollContainer.context.scrollLeft,
      scrollTop: $scrollContainer.context.scrollTop
    };
    oScrollContainerContextNew = oScrollContainerContextOld;
    if (this._zoomLevel === zoomLevel) {
      this._isInitialZoomLevelNeeded = false;
      return;
    }
  }
  if (!(zoomLevel in sap.suite.ui.commons.ProcessFlowZoomLevel)) { // Enumeration
    this._handleException("\"" + zoomLevel + "\" is not a valid entry of the enumeration for property zoom level of ProcessFlow");
    return;
  }
  this._zoomLevel = zoomLevel;
  //When setting the initial zoomlevel, invalidate() has to be called,
  //because the method call comes from onAfterRendering() and to call the rerender() is not allowed.
  if (this._isInitialZoomLevelNeeded) {
    this._isInitialZoomLevelNeeded = false;
    this.invalidate();
    //In all other cases, the rerender() has to be called, so that the offset can be set afterwards.
  } else {
    this.rerender();
  }

  if (oScrollContainerContextOld) {
    //Set the grab cursor class in case for touch devices
    if (sap.ui.Device.support.touch || jQuery.sap.simulateMobileOnDesktop) {
      var iHeight = parseInt(this.$("scrollContainer").css("height").slice(0, -2), 10);
      var iWidth = parseInt(this.$("scrollContainer").css("width").slice(0, -2), 10);
      var iScrollHeight = this.$("scrollContainer")[0].scrollHeight;
      var iScrollWidth = this.$("scrollContainer")[0].scrollWidth;
      if (this.getScrollable() && (iScrollHeight > iHeight || iScrollWidth > iWidth)) {
        this._switchCursors(this.$("scrollContainer"), this._defaultCursorClass, this._grabCursorClass);
        this.$("scrollContainer").css("overflow", "auto");
      }
    }
    //Sets the scroll offset to the scrollContainer.
    $scrollContainer = this.$("scrollContainer");
    oScrollContainerContextNew = this._getScrollContainerOnZoomChanged(oScrollContainerContextOld, $scrollContainer);
    $scrollContainer.scrollLeft(oScrollContainerContextNew.scrollLeft);
    $scrollContainer.scrollTop(oScrollContainerContextNew.scrollTop);
    this._adjustAndShowArrow();
    //Avoids not setting the focus on clickable elements.
    if (this._isFocusChanged) {
      this._setFocusToNode();
      this._isFocusChanged = false;
    }
  }
};

/**
 * Function returns current zoom level.
 *
 * @returns {String} The zoomLevel
*/
sap.suite.ui.commons.ProcessFlow.prototype.getZoomLevel = function () {
  return this._zoomLevel;
};

/**
 * Function sets new zoom level with smaller level of details. Having the least detail view it stays as it is.
 *
 * @returns {String} The updated zoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.zoomOut = function () {
  var currentZoomLevel = this.getZoomLevel();
  var newLevel = currentZoomLevel;
  switch (currentZoomLevel) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.One):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Three;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Four;
      break;
  }
  this.setZoomLevel(newLevel);
  return this.getZoomLevel();
};

/**
 * Function sets new zoom level with higher level of details. Having max details it stays as it is.
 *
 * @returns {String} The updated zoomLevel
 */
sap.suite.ui.commons.ProcessFlow.prototype.zoomIn = function () {
  var currentZoomLevel = this.getZoomLevel();
  var newLevel = currentZoomLevel;
  switch (currentZoomLevel) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Four):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Three;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.Two;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      newLevel = sap.suite.ui.commons.ProcessFlowZoomLevel.One;
      break;
  }
  this.setZoomLevel(newLevel);
  return this.getZoomLevel();
};

/**
 * Updates the model and rerenders the control.
 */
sap.suite.ui.commons.ProcessFlow.prototype.updateModel = function () {
  //reset nodes' laneIds for merged lanes
  var aNodes = this.getNodes();
  var that = this;
  aNodes.forEach(function(that){
    that._mergedLaneId = false;
  })
  // reset lanes' position that was created for merged lanes
  var aLanes = this.getLanes();
  var that = this;
  aLanes.forEach(function(that){
    that._mergedLanePosition = false;
  })

  //Initialize internalLanes so that they get recalculated from the new nodes.
  this._internalLanes = [];
  if (this._isHeaderMode()) {
    var laneModel = this.getBindingInfo("lanes");
    this.getModel(laneModel.model).refresh();
  }
  else {
    var nodeModel = this.getBindingInfo("nodes");
    this.getModel(nodeModel.model).refresh();
  }
  this.rerender();
};

/**
 * Updates the nodes and rerenders the control.
 */
sap.suite.ui.commons.ProcessFlow.prototype.updateNodesOnly = function () {
  var nodeModel = this.getBindingInfo("nodes");
  this.getModel(nodeModel.model).refresh();
  this.rerender();
};

/**
 * Function returns the nodeId of the node which is focused.
 *
 * @returns {String} The id of focused node
 */
sap.suite.ui.commons.ProcessFlow.prototype.getFocusedNode = function () {
  if (this._lastNavigationFocusNode.sId) {
    return this._lastNavigationFocusNode.sId;
  }
};

/**
 * Handles the ontouched event.
 *
 * @private
 * @param {sap.ui.base.Event} oEvent
 */
sap.suite.ui.commons.ProcessFlow.prototype.ontouchend = function (oEvent) {
  if (oEvent.target && oEvent.target.id.indexOf("arrowScroll") != -1) {
    this._onArrowClick(oEvent);
  }
  else {
    if (!sap.ui.Device.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
      this.onAfterRendering();
    } else {
      this._adjustAndShowArrow();
    }
    if (oEvent === null || oEvent.oSource === undefined) {
      return false;
    }
    oEvent.preventDefault();

    if (this && this._isHeaderMode()) {
      //Reset lanes as they could be redefined completely in headerPress Event - also necessary for merged lanes.
      this._internalLanes = [];
      this.fireHeaderPress(this);
    }
  }
  return false;
};

/**
 * Checks if ProcessFlow is in header mode.
 * 
 * @returns {Boolean} Value which describes if ProcessFlow is in header mode
 */
sap.suite.ui.commons.ProcessFlow.prototype._isHeaderMode = function () {
  var aNodes = this.getNodes();
  return !aNodes || (aNodes.length === 0);
};

/**
 * Switch cursors for scrollable/non-scrollable content.
 *
 * @private
 * @param {object} $scrollContainer the affected scroll container (jQuery object)
 * @param {String} sCursorClassFrom class containing the original cursor definition
 * @param {String} sCursorClassTo class containing the new cursor definition
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlow.prototype._switchCursors = function ($scrollContainer, sCursorClassFrom, sCursorClassTo) {
  if ($scrollContainer.hasClass(sCursorClassFrom)) {
    $scrollContainer.removeClass(sCursorClassFrom);
  }
  if (!$scrollContainer.hasClass(sCursorClassTo)) {
    $scrollContainer.addClass(sCursorClassTo);
  }
};

/**
 * Clear the mouse handlers for the scrolling functionality.
 *
 * @private
 * @since 1.22
 */
sap.suite.ui.commons.ProcessFlow.prototype._clearHandlers = function ($scrollContainer) {
  $scrollContainer.bind(this._mousePreventEvents, jQuery.proxy(this._handlePrevent, this));
};

sap.suite.ui.commons.ProcessFlow.prototype._handlePrevent = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/**
 * Standard method called after the control rendering.
 */
sap.suite.ui.commons.ProcessFlow.prototype.onAfterRendering = function () {
  var bScrollable = false,
      $content = this.$("scroll-content"),
      iHeight,
      iWidth,
      iScrollWidth,
      iScrollHeight;

  //Initializes scrolling.
  this._checkOverflow(this.getDomRef("scrollContainer"), this.$());

  this.nCursorXPosition = 0;
  this.nCursorYPosition = 0;

  if ($content && $content.length) {
    //Sets PF node icon cursors, because these are unfortunately set as inline styles, so they cannot be overriden by applying a CSS class.
    this.$("scrollContainer").find('.sapSuiteUiCommonsProcessFlowNode .sapUiIcon').css("cursor", "inherit");

    if (this.getScrollable()) {
      iHeight = parseInt(this.$("scrollContainer").css("height").slice(0, -2), 10);
      iWidth = parseInt(this.$("scrollContainer").css("width").slice(0, -2), 10);
      iScrollHeight = $content[0].scrollHeight;
      iScrollWidth = $content[0].scrollWidth;

      if (iScrollHeight <= iHeight && iScrollWidth <= iWidth) {
        this._clearHandlers(this.$("scrollContainer"));
        //No scrolling makes sense, so clean up the mouse handlers and switch the cursors.
        this._switchCursors(this.$("scrollContainer"), this._grabCursorClass, this._defaultCursorClass);
      } else {
        this._switchCursors(this.$("scrollContainer"), this._defaultCursorClass, this._grabCursorClass);
        bScrollable = true;
      }
    } else {
      this._clearHandlers(this.$("scrollContainer"));
      this._switchCursors(this.$("scrollContainer"), this._grabCursorClass, this._defaultCursorClass);
      $content.css("position", "static");
    }
    if (bScrollable) {
      //Initialize top margin of arrow and counter.
      if (!this._iInitialArrowTop || !this._iInitialCounterTop) {
        this._iInitialArrowTop = parseInt(this.$("arrowScrollRight").css("top"), 10);
        this._iInitialCounterTop = parseInt(this.$("counterRight").css("top"), 10);
      }

      if (sap.ui.Device.os.windows && sap.ui.Device.system.combi && sap.ui.Device.browser.chrome) {
        //Win8 Surface: Chrome.
        this.$("scrollContainer").bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
        this.$("scrollContainer").css("overflow", "auto");
      } else if (sap.ui.Device.os.windows && sap.ui.Device.system.combi && sap.ui.Device.browser.msie && (sap.ui.Device.browser.version > 9)) {
        //Win8 Surface: IE 10 and higher.
        this.$("scrollContainer").bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
        this.$("scrollContainer").css("overflow", "auto");
        this.$("scrollContainer").css("-ms-overflow-style", "none");
      } else if (!sap.ui.Device.support.touch && !jQuery.sap.simulateMobileOnDesktop) {
        // Desktop
        this.$("scrollContainer").bind(this._mouseEvents, jQuery.proxy(this._registerMouseEvents, this));
      } else {
        // Mobile: use native scrolling.
        this._clearHandlers(this.$("scrollContainer"));
        this.$("scrollContainer").css("overflow", "auto");
      }
    } else { //Not scrollable ProcessFlow: Set overflow for chevron navigation anyway.
      if (this._bDoScroll) {
        //Is Not Desktop OR Is Win8.
        this.$("scrollContainer").css("overflow", "auto");
      } else {
        this.$("scrollContainer").css("overflow", "hidden");
      }
    }
    if (this.getWheelZoomable() && sap.ui.Device.system.desktop && !this._isHeaderMode()) {
      this.$("scrollContainer").bind(this._mouseWheelEvent, jQuery.proxy(this._registerMouseWheel, this));
    }
    if (this._bDoScroll) {
      //Bind scroll event for mobile.
      this.$("scrollContainer").bind("scroll", jQuery.proxy(this._onScroll, this));
    }
    this._resizeRegId = sap.ui.core.ResizeHandler.register(this, jQuery.proxy(sap.suite.ui.commons.ProcessFlow.prototype._onResize, this));
    if (this._isInitialZoomLevelNeeded) {
      this._initZoomLevel();
    }
    //Sets the focus to the next node if PF was in headers mode before rerendering.
    if (this._headerHasFocus) {
      this._headerHasFocus = false;
      var $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
      var oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
      this._changeNavigationFocus(null, oNodeToFocus);
    }
  }
};

sap.suite.ui.commons.ProcessFlow.prototype._initZoomLevel = function () {
  //Set initial ZoomLevel according to ProcessFlow container size.
  //Breakpoints: until 599px = Level 4 / 600px-1023px = Level 3 / from 1024px = Level 2.
  if (this.$()) {
    var iWidth = this.$().width();
    if (iWidth) {
      if (iWidth < sap.m.ScreenSizes.tablet) {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Four);
      } else if (iWidth < sap.m.ScreenSizes.desktop) {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Three);
      } else {
        this.setZoomLevel(sap.suite.ui.commons.ProcessFlowZoomLevel.Two);
      }
    }
  }
};

sap.suite.ui.commons.ProcessFlow.prototype._registerMouseWheel = function (oEvent) {
  var oDirection = oEvent.originalEvent.wheelDelta || -oEvent.originalEvent.detail;
  if (oDirection === 0) {
    //for IE only
    oDirection = -oEvent.originalEvent.deltaY;
  }
  var that = this;
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
    oEvent.originalEvent.returnValue = false;
  }

  var waitTime = 300;
  var doNotListen = function () {
    var diff = new Date() - that._wheelTimestamp;
    if (diff < waitTime) {
      that._wheelTimeout = jQuery.sap.delayedCall(waitTime - diff, that, doNotListen);
    } else {
      that._wheelTimeout = null;
      that._wheelCalled = false;
    }
  };
  if (!that._wheelCalled) {
    that._wheelCalled = true;

    if (oDirection < 0) {
      this._isFocusChanged = true;
      that.zoomOut();
    } else {
      this._isFocusChanged = true;
      that.zoomIn();
    }
  }
  if (!that._wheelTimeout) {
    that._wheelTimestamp = new Date();
    that._wheelTimeout = jQuery.sap.delayedCall(waitTime, that, doNotListen);
  }
  if (oEvent && !oEvent.isPropagationStopped()) {
    oEvent.stopPropagation();
  }
  if (oEvent && !oEvent.isImmediatePropagationStopped()) {
    oEvent.stopImmediatePropagation();
  }
};

/**
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._registerMouseEvents = function (oEvent) {
  if (oEvent && !oEvent.isDefaultPrevented()) {
    oEvent.preventDefault();
  }
  switch (oEvent.type) {
    case 'mousemove':
      if (this.$("scrollContainer").hasClass(this._grabbingCursorClass)) {
        if (sap.ui.getCore().getConfiguration().getRTL()) {
          this.$("scrollContainer").scrollLeftRTL(this.nCursorXPosition - oEvent.pageX);
        } else {
          this.$("scrollContainer").scrollLeft(this.nCursorXPosition - oEvent.pageX);
        }
        this.$("scrollContainer").scrollTop(this.nCursorYPosition - oEvent.pageY);
        this._adjustAndShowArrow();
      }
      break;
    case 'mousedown':
      this._switchCursors(this.$("scrollContainer"), this._defaultCursorClass, this._grabbingCursorClass);
      if (sap.ui.getCore().getConfiguration().getRTL()) {
        this.nCursorXPosition = this.$("scrollContainer").scrollLeftRTL() + oEvent.pageX;
      } else {
        this.nCursorXPosition = this.$("scrollContainer").scrollLeft() + oEvent.pageX;
      }
      this.nCursorYPosition = this.$("scrollContainer").scrollTop() + oEvent.pageY;
      if (sap.ui.Device.system.combi) {
        //For Win8 surface no touchstart event is fired, but the mousedown event instead do initialization here
        this._iTouchStartScrollLeft = this.$("scrollContainer").scrollLeft();
        if (this.getScrollable()) {
          this._iTouchStartScrollTop = this.$("scrollContainer").scrollTop();
        }
      }
      break;
    case 'mouseup':
      this._switchCursors(this.$("scrollContainer"), this._grabbingCursorClass, this._grabCursorClass);
      break;
    case 'mouseleave':
      this.$("scrollContainer").removeClass(this._grabbingCursorClass);
      this.$("scrollContainer").removeClass(this._grabCursorClass);
      this.$("scrollContainer").addClass(this._defaultCursorClass);
      break;
    case 'mouseenter':
      this.$("scrollContainer").removeClass(this._defaultCursorClass);
      if (oEvent.buttons === null) {
        if (oEvent.which === 1) {
          this.$("scrollContainer").addClass(this._grabbingCursorClass);
        } else {
          this.$("scrollContainer").addClass(this._grabCursorClass);
        }
      } else {
        if (oEvent.buttons === 0) {
          this.$("scrollContainer").addClass(this._grabCursorClass);
        } else if (oEvent.buttons === 1) {
          this.$("scrollContainer").addClass(this._grabbingCursorClass);
        }
      }
      break;
  }
  //Check if the event was triggered by a click on a Connection Label and allow the propagation of the event.
  //Otherwise default click event in Connection Label is interrupted.
  if (oEvent.target && oEvent.target.parentElement && oEvent.target.parentElement.parentElement &&
      oEvent.target.parentElement.parentElement instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
    if (oEvent && !oEvent.isPropagationStopped()) {
      oEvent.stopPropagation();
    }
    if (oEvent && !oEvent.isImmediatePropagationStopped()) {
      oEvent.stopImmediatePropagation();
    }
  }
};

/**
 * Control resize handler for setting the cursor type/scroll setup.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._onResize = function () {
  var iActualTime = new Date().getTime();

  if (!this._iLastResizeEventTime || ((iActualTime - this._iLastResizeEventTime) < 50)) {
    //Start to handle after the second resize event (below 50ms).
    if (!this._iLastResizeHandlingTime || (iActualTime - this._iLastResizeHandlingTime > 500)) { //Handle each .5s.
      this.onAfterRendering();
      this._iLastResizeHandlingTime = new Date().getTime();
    }
  } else {
    this._iLastResizeHandlingTime = null;
  }

  this._iLastResizeEventTime = new Date().getTime();
};

/*
 * Move Enumeration.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlow._enumMoveDirection = {
  'LEFT': 'left',
  'RIGHT': 'right',
  'UP': 'up',
  'DOWN': 'down'
};

/** Sets the tab focus on the given element or to _lastNavigationFocusNode if no parameter is given. If no parameter
 * is given and _lastNavigationFocusNode is false, nothing happens.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} the node to focus.
*/
sap.suite.ui.commons.ProcessFlow.prototype._setFocusToNode = function (oNode) {
  //If there's a node as parameter.
  if (oNode) {
    if (oNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      jQuery("#" + oNode.sId).parent().focus();
      oNode._setNavigationFocus(true);
      oNode.rerender();
    } else if (oNode instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      oNode.$().focus();
      oNode._setNavigationFocus(true);
    }
    // If there's no parameter, set the focus to _lastNavigationFocusNode if is not false
  } else if (this._lastNavigationFocusNode) {
    if (this._lastNavigationFocusNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      jQuery("#" + this._lastNavigationFocusNode.sId).parent().focus();
      this._lastNavigationFocusNode._setNavigationFocus(true);
      this._lastNavigationFocusNode.rerender();
    } else if (this._lastNavigationFocusNode instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      this._lastNavigationFocusNode.$().focus();
      this._lastNavigationFocusNode._setNavigationFocus(true);
    }
  }
};

/**
 * Changes the navigation focus from the actual node to the node specified as parameter.
 * Calls rerender on both nodes.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode} oNodeFrom the old focused node
 * @param {sap.suite.ui.commons.ProcessFlowNode} oNodeTo the new node to focus to
 * @since 1.23
 */
sap.suite.ui.commons.ProcessFlow.prototype._changeNavigationFocus = function (oNodeFrom, oNodeTo) {
  if (oNodeFrom && oNodeTo && (oNodeFrom.getId() !== oNodeTo.getId())) {
    jQuery.sap.log.debug("Rerendering PREVIOUS node with id '" + oNodeFrom.getId() +
                         "' navigation focus : " + oNodeFrom._getNavigationFocus());
    oNodeFrom._setNavigationFocus(false);
    if (oNodeFrom instanceof sap.suite.ui.commons.ProcessFlowNode) {
      oNodeFrom.rerender();
    } 
  }

  if (oNodeTo) {
    jQuery.sap.log.debug("Rerendering CURRENT node with id '" + oNodeTo.getId() +
        "' navigation focus : " + oNodeTo._getNavigationFocus());
    oNodeTo._setNavigationFocus(true);
    if (oNodeTo instanceof sap.suite.ui.commons.ProcessFlowNode) {
      oNodeTo.rerender();
    }
    this._lastNavigationFocusNode = oNodeTo;
    this._onFocusChanged();
  }
};

/**
 * Function reacts on page up and page down. It should go 5 lines up or down
 * or little bit less if there is not enough space.
 * With alt page up move focus left by 5 items maximum.
 * With alt page down move focus right by 5 items maximum.
 *
 * @private
 * @param direction please see sap.suite.ui.commons.ProcessFlow._enumMoveDirection
 * @param altKey, true if alt key is pressed, false otherwise
 * @returns {Boolean} Value describes if a new node was found 
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveOnePage = function (direction, altKey) {
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP;
  altKey = altKey || false;
  //Search for navigated element.
  var origX = 0, origY = 0;
  var newX = 0, newY = 0;
  var nodesOver = 0;
  var bNewNodeFound = false;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
        origX = i;
        origY = j;
        break;
      } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
        var label = this._internalCalcMatrix[i][j]._getVisibleLabel();
        if (label && label._getNavigationFocus()) {
          origX = i;
          origY = j;
          break;
        }
      }
    }
  }

  //Going 5 elements on the same row.
  if (altKey) {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
      for (var j = origY - 1; j >= 0 && nodesOver < this._jumpOverElements; j--) {
        if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[origX][j].getHighlighted())) {
          nodesOver++;
          newX = origX;
          newY = j;
          bNewNodeFound = true;
        } else if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[origX][j]._getVisibleLabel();
          if (label && label.getEnabled()) {
            nodesOver++;
            newX = origX;
            newY = j;
            bNewNodeFound = true;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
      for (var j = origY + 1; j < this._internalCalcMatrix[origX].length && nodesOver < this._jumpOverElements; j++) {
        if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[origX][j].getHighlighted())) {
          nodesOver++;
          newX = origX;
          newY = j;
          bNewNodeFound = true;
        } else if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[origX][j]._getVisibleLabel();
          if (label && label.getEnabled()) {
            nodesOver++;
            newX = origX;
            newY = j;
            bNewNodeFound = true;
          }
        }
      }
    }
  } else {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
      for (var i = origX - 1; i >= 0 && nodesOver < this._jumpOverElements; i--) {
        if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][origY].getHighlighted())) {
          nodesOver++;
          newX = i;
          newY = origY;
          bNewNodeFound = true;
        } else if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][origY]._getVisibleLabel();
          if (label && label.getEnabled()) {
            nodesOver++;
            newX = i
            newY = origY;
            bNewNodeFound = true;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
      for (var i = origX + 1; i < this._internalCalcMatrix.length && nodesOver < this._jumpOverElements; i++) {
        if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][origY].getHighlighted())) {
          nodesOver++;
          newX = i;
          newY = origY;
          bNewNodeFound = true;
        } else if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][origY]._getVisibleLabel();
          if (label && label.getEnabled()) {
            nodesOver++;
            newX = i
            newY = origY;
            bNewNodeFound = true;
          }
        }
      }
    }
  }

  if (bNewNodeFound) {
    if (this._internalCalcMatrix[origX][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      this._internalCalcMatrix[origX][origY]._getVisibleLabel()._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[origX][origY]._setNavigationFocus(false);
    }
    if (this._internalCalcMatrix[newX][newY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      var label = this._internalCalcMatrix[newX][newY]._getVisibleLabel();
      label._setNavigationFocus(true);
      this._lastNavigationFocusNode = label;
    } else {
      this._internalCalcMatrix[newX][newY]._setNavigationFocus(true);
      this._lastNavigationFocusNode = this._internalCalcMatrix[newX][newY];
    }
  }
  return bNewNodeFound;
};

/**
 * Function reacts on home/end. it should go to the first/last element on given row.
 * With ctrl it goes to the first/last active element on the process flow
 * or little bit less if there is not enough space.
 *
 * @private
 * @param direction please see sap.suite.ui.commons.ProcessFlow._enumMoveDirection LEFT -> HOME, RIGHT -> END
 * @param ctrlKey, true if ctrl key is pressed
 * @returns {Boolean} Value describes if a new node was found
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveHomeEnd = function (direction, ctrlKey) {
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;
  ctrlKey = ctrlKey || false;
  //Search for navigated element.
  var origX = 0, origY = 0;
  var newX = 0, newY = 0;
  var bNewNodeFound = false;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
        origX = i;
        origY = j;
        break;
      } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
        var label = this._internalCalcMatrix[i][j]._getVisibleLabel();
        if (label && label._getNavigationFocus()) {
          origX = i;
          origY = j;
          break;
        }
      }
    }
  }

  //Going to the first / last element on the given column.
  if (ctrlKey) {
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      for (var i = 0; i < origX ; i++) {
        if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][origY].getHighlighted())) {
          newX = i;
          newY = origY;
          bNewNodeFound = true;
          break;
        } else if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][origY]._getVisibleLabel();
          if (label && label.getEnabled()) {
            newX = i
            newY = origY;
            bNewNodeFound = true;
            break;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      for (var i = this._internalCalcMatrix.length - 1; i > origX; i--) {
        if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[i][origY].getHighlighted())) {
          newX = i;
          newY = origY;
          bNewNodeFound = true;
          break;
        } else if (this._internalCalcMatrix[i][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][origY]._getVisibleLabel();
          if (label && label.getEnabled()) {
            newX = i
            newY = origY;
            bNewNodeFound = true;
            break;
          }
        }
      }
    }
  } else { //Going to the first/last element of the row.
    if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      for (var j = 0; j < origY; j++) {
        if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[origX][j].getHighlighted())) {
          newX = origX;
          newY = j;
          bNewNodeFound = true;
          break;
        } else if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[origX][j]._getVisibleLabel();
          if (label && label.getEnabled()) {
            newX = origX;
            newY = j;
            bNewNodeFound = true;
            break;
          }
        }
      }
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      for (var j = this._internalCalcMatrix[origX].length - 1; j > origY; j--) {
        if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowNode && (!this._bHighlightedMode || this._internalCalcMatrix[origX][j].getHighlighted())) {
          newX = origX;
          newY = j;
          bNewNodeFound = true;
          break;
        } else if (this._internalCalcMatrix[origX][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[origX][j]._getVisibleLabel();
          if (label && label.getEnabled()) {
            newX = origX;
            newY = j;
            bNewNodeFound = true;
            break;
          }
        }
      }
    }
  }

  if (bNewNodeFound) {
    if (this._internalCalcMatrix[origX][origY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      this._internalCalcMatrix[origX][origY]._getVisibleLabel()._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[origX][origY]._setNavigationFocus(false);
    }
    if (this._internalCalcMatrix[newX][newY] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
      var label = this._internalCalcMatrix[newX][newY]._getVisibleLabel();
      label._setNavigationFocus(true);
      this._lastNavigationFocusNode = label;
    } else {
      this._internalCalcMatrix[newX][newY]._setNavigationFocus(true);
      this._lastNavigationFocusNode = this._internalCalcMatrix[newX][newY];
    }
  }
  return bNewNodeFound;
};

/**
 * Function moves the focus to the next node based on tab behaviour.
 * First going left, after to the next row.
 *
 * @private
 * @param direction please see enumeration Direction ( sap.suite.ui.commons.ProcessFlow._enumMoveDirection )
 * @returns {Boolean} true if the next element is possible to set. False if there is not more elements to set.
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveToNextNode = function (direction, step) {
  //First find the current focus element.
  direction = direction || sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;

  if (sap.ui.getCore().getConfiguration().getRTL()) {
    if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
      direction = sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT;
    } else if (direction === sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
      direction = sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT;
    }
  }

  step = step || 1;

  var bFocusNodeFound = false;
  var bNewNodeSet = false;
  var origX = 0, origY = 1;
  if (!this._internalCalcMatrix) {
    return;
  }
  //First search for node which is focused.
  var posX = 0, posY = 0;
  for (var i = 0; i < this._internalCalcMatrix.length; i++) {
    for (var j = 0; j < this._internalCalcMatrix[i].length; j++) {
      if (this._internalCalcMatrix[i][j]) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode && this._internalCalcMatrix[i][j]._getNavigationFocus()) {
          origX = posX = i;
          origY = posY = j;
          bFocusNodeFound = true;
          break;
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (label && label._getNavigationFocus() && label.getEnabled()) {
            origX = posX = i;
            origY = posY = j;
            bFocusNodeFound = true;
            break;
          }
        }
      }
    }
    if (bFocusNodeFound) {
      break;
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT) {
    for (var i = posX; i < this._internalCalcMatrix.length; i++) {
      for (var j = posY + 1; j < this._internalCalcMatrix[i].length; j++) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][j].getHighlighted())) {
            this._internalCalcMatrix[i][j]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][j];
            bNewNodeSet = true;
            break;
          }
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        }
      }
      //Shortcut, we have done already everything.
      posY = 0; //First posX line was from posY, now from zero again. The plus one does not hurt, because first column is empty.
      if (bNewNodeSet) {
        break;
      }
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT) {
    for (var i = posX; i >= 0 ; i--) {
      for (var j = posY - 1; j >= 0; j--) {
        if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][j].getHighlighted())) {
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][j]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][j];
            bNewNodeSet = true;
            break;
          }
        } else if (this._internalCalcMatrix[i][j] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][j]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        }
      }
      if (i > 0) {
        posY = this._internalCalcMatrix[i - 1].length;
      }
      //Shortcut, we have done already everything.
      if (bNewNodeSet) {
        break;
      }
    }
  }

  var deviation,
      yPositionLeft,
      yPositionRight;
  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP) {
    for (var i = posX - 1; i >= 0 ; i--) {
      //We have single line, check from posY first left, after right.
      deviation = 0;
      while (!bNewNodeSet) {
        yPositionLeft = posY - deviation;
        yPositionRight = posY + deviation;
        if (yPositionLeft >= 0 && this._internalCalcMatrix[i][yPositionLeft] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][yPositionLeft].getHighlighted())) {
            this._internalCalcMatrix[i][yPositionLeft]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionLeft];
            bNewNodeSet = true;
            break;
          }
        } else if (yPositionLeft >= 0 && this._internalCalcMatrix[i][yPositionLeft] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][yPositionLeft]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        }//End of processflownode for left.
        if (yPositionRight < this._internalCalcMatrix[i].length && this._internalCalcMatrix[i][yPositionRight] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][yPositionRight].getHighlighted())) {
            this._internalCalcMatrix[i][yPositionRight]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionRight];
            bNewNodeSet = true;
            break;
          }
        } else if (yPositionRight >= 0 && this._internalCalcMatrix[i][yPositionRight] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][yPositionRight]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        } //End of processflownode for right.
        //We are out of this line for Y position.
        if (yPositionLeft < 0 && yPositionRight > this._internalCalcMatrix[i].length) {
          break;
        }
        deviation++;
      }
    }
  }

  if (direction == sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN) {
    for (var i = posX + 1; i < this._internalCalcMatrix.length ; i++) {
      //We have single line, check from posY first left, after right.
      deviation = 0;
      while (!bNewNodeSet) {
        yPositionLeft = posY - deviation;
        yPositionRight = posY + deviation;
        if (yPositionLeft >= 0 && this._internalCalcMatrix[i][yPositionLeft] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][yPositionLeft].getHighlighted())) {
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionLeft]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionLeft];
            bNewNodeSet = true;
            break;
          }
        } else if (yPositionLeft >= 0 && this._internalCalcMatrix[i][yPositionLeft] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][yPositionLeft]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        }//End of processflownode for left.
        if (yPositionRight < this._internalCalcMatrix[i].length && this._internalCalcMatrix[i][yPositionRight] instanceof sap.suite.ui.commons.ProcessFlowNode) {
          if (bFocusNodeFound && (!this._bHighlightedMode || this._internalCalcMatrix[i][yPositionRight].getHighlighted())) {
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionRight]._setNavigationFocus(true);
            this._lastNavigationFocusNode = this._internalCalcMatrix[i][yPositionRight];
            bNewNodeSet = true;
            break;
          }
        } else if (yPositionRight >= 0 && this._internalCalcMatrix[i][yPositionRight] instanceof sap.suite.ui.commons.ProcessFlowConnection) {
          var label = this._internalCalcMatrix[i][yPositionRight]._getVisibleLabel();
          if (label && bFocusNodeFound && label.getEnabled()) {
            label._setNavigationFocus(true);
            this._lastNavigationFocusNode = label;
            bNewNodeSet = true;
            break;
          }
        }//End of processflownode for right.
        //We are out of this line for Y position.
        if (yPositionLeft < 0 && yPositionRight > this._internalCalcMatrix[i].length) {
          break;
        }
        deviation++;
      }
    }
  }

  if (bNewNodeSet) {
    if (this._internalCalcMatrix[origX][origY] instanceof sap.suite.ui.commons.ProcessFlowNode) {
      this._internalCalcMatrix[origX][origY]._setNavigationFocus(false);
    } else {
      this._internalCalcMatrix[origX][origY]._getVisibleLabel()._setNavigationFocus(false);
    }
  }
  return bNewNodeSet;
};

// ==============================================================================================
// == Keyboard events handling support
// ==============================================================================================
// Internal PF flag whether navigation focus should be released from this control.
sap.suite.ui.commons.ProcessFlow.prototype._bNFocusOutside = false;
// Internal PF flag whether we operate in highlighted mode.
sap.suite.ui.commons.ProcessFlow.prototype._bHighlightedMode = false;

//--------------------------------------------------------------------------------------------
/**
 * ProcessFlow has the focus, now it is neccessary to set the navigation
 * the method is called both when ProcessFlow gets the focus and at any click event.
 */
sap.suite.ui.commons.ProcessFlow.prototype.onfocusin = function (oEvent) {
  //Set the navigation focus to the lane header if in lanes-only mode.
  if (this._isHeaderMode()) {
    this._setFocusOnHeader(true);
  }
};

sap.suite.ui.commons.ProcessFlow.prototype.onfocusout = function (oEvent) {
  if (this._lastNavigationFocusNode && this._lastNavigationFocusNode._getNavigationFocus()) {
    this._lastNavigationFocusNode._setNavigationFocus(false);
    if (this._lastNavigationFocusNode instanceof sap.suite.ui.commons.ProcessFlowNode) {
      this._lastNavigationFocusNode.rerender();
    }
  }
  jQuery.sap.log.info("focus out");
};

/**
 * Method called on zoom change.
 * Scrolls the PF content after a zoom change so, that the focused content of the scroll container stays in focus (if possible).
 *
 * @private
 * @returns {Object} The scroll container context
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._getScrollContainerOnZoomChanged = function (oScrollContainerContext, $scrollContainer) {
  oScrollContainerContext.scrollLeft = Math.round($scrollContainer.context.scrollWidth / oScrollContainerContext.scrollWidth * oScrollContainerContext.scrollLeft);
  oScrollContainerContext.scrollTop = Math.round($scrollContainer.context.scrollHeight / oScrollContainerContext.scrollHeight * oScrollContainerContext.scrollTop);
  oScrollContainerContext.scrollWidth = $scrollContainer.context.scrollWidth;
  oScrollContainerContext.scrollHeight = $scrollContainer.context.scrollHeight;

  return oScrollContainerContext;
};

/**
 * Method called on navigation focus change.
 * Scrolls the PF content, so the node is as close to the middle of the scroll container viewport as possible.
 *
 * @private
 * @since 1.23
 */
sap.suite.ui.commons.ProcessFlow.prototype._onFocusChanged = function () {
  var oFocusedNode = this._lastNavigationFocusNode,
      $focusedNode = oFocusedNode ? oFocusedNode.$() : null,
      iScrollContainerInnerWidth,
      iScrollContainerInnerHeight,
      iScrollLeft,
      iScrollTop,
      $scrollContent,
      iContentInnerWidth,
      iContentInnerHeight,
      iNodeOuterWidth,
      iNodeOuterHeight,
      oPositionInContent,
      iNodeLeftPosition,
      iNodeTopPosition,
      iNodeRightPosition,
      iNodeBottomPosition,
      iCorrectionLeft, iCorrectionTop,
      iScrollTimeInMillis = 500;

  if (oFocusedNode && this.getScrollable()) {
    jQuery.sap.log.debug("The actually focused node is " + oFocusedNode.getId());

    // If the element (oNode) is a label, get the data from the TD parent element, otherwise it won't work precisely
    if (oFocusedNode instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      iNodeOuterWidth = $focusedNode.parent().parent().parent().outerWidth();
      iNodeOuterHeight = $focusedNode.parent().parent().parent().outerHeight();
      oPositionInContent = $focusedNode.parent().parent().parent().position();
    } else {
      iNodeOuterWidth = $focusedNode.outerWidth();
      iNodeOuterHeight = $focusedNode.outerHeight();
      oPositionInContent = $focusedNode.position();
    }
    jQuery.sap.log.debug("Node outer width x height [" + iNodeOuterWidth + " x " + iNodeOuterHeight + "]");
    jQuery.sap.log.debug("Position of node in the content is [" + oPositionInContent.left + ", " + oPositionInContent.top + "]");

    $scrollContent = this.$("scroll-content");
    iScrollContainerInnerWidth = this.$("scrollContainer").innerWidth();
    iScrollContainerInnerHeight = this.$("scrollContainer").innerHeight();
    jQuery.sap.log.debug("Scroll container inner width x height [" + iScrollContainerInnerWidth + " x " + iScrollContainerInnerHeight + "]");

    iScrollLeft = this.$("scrollContainer").scrollLeft();
    iScrollTop = this.$("scrollContainer").scrollTop();
    jQuery.sap.log.debug("Current scroll offset is [" + iScrollLeft + ", " + iScrollTop + "]");

    iContentInnerWidth = $scrollContent.innerWidth();
    iContentInnerHeight = $scrollContent.innerHeight();
    jQuery.sap.log.debug("Scroll content inner width x height [" + iContentInnerWidth + " x " + iContentInnerHeight + "]");

    //Defines 4 borders (L: Left, R: Right, T: Top, B: Bottom) for position of the clicked node in the visible content.
    iNodeLeftPosition = -iScrollLeft + oPositionInContent.left;
    iNodeRightPosition = iNodeLeftPosition + iNodeOuterWidth;
    iNodeTopPosition = -iScrollTop + oPositionInContent.top;
    iNodeBottomPosition = iNodeTopPosition + iNodeOuterHeight;

    //Checks if the node lies (even in part) outside of the scroll container visible part.
    if ((iNodeRightPosition > iScrollContainerInnerWidth) || (iNodeLeftPosition < 0) || (iNodeBottomPosition > iScrollContainerInnerHeight) || (iNodeTopPosition < 0)) {
      //iCorrectionLeft, correction on left direction to center the node.
      iCorrectionLeft = Math.round((iScrollContainerInnerWidth - iNodeOuterWidth) / 2);
      iCorrectionLeft = Math.max(iScrollContainerInnerWidth - iContentInnerWidth + oPositionInContent.left, iCorrectionLeft);
      iCorrectionLeft = Math.min(oPositionInContent.left, iCorrectionLeft);

      //iCorrectionTop, correction on upwards to center the node.
      iCorrectionTop = Math.round((iScrollContainerInnerHeight - iNodeOuterHeight) / 2);
      iCorrectionTop = Math.max(iScrollContainerInnerHeight - iContentInnerHeight + oPositionInContent.top, iCorrectionTop);
      iCorrectionTop = Math.min(oPositionInContent.top, iCorrectionTop);
      jQuery.sap.log.debug("Node lies outside the scroll container, scrolling from [" + iNodeLeftPosition + "," + iNodeTopPosition + "] to [" + iCorrectionLeft + "," + iCorrectionTop + "]");
      this._isFocusChanged = true;
      this.$("scrollContainer").animate({
        scrollTop: oPositionInContent.top - iCorrectionTop,
        scrollLeft: oPositionInContent.left - iCorrectionLeft
      }, iScrollTimeInMillis, "swing", jQuery.proxy(this._adjustAndShowArrow, this));
    } else {
      jQuery.sap.log.debug("Node lies inside the scroll container, no scrolling happens.");
      this._setFocusToNode(oFocusedNode);
    }
  } else { //Non scrollable needs also to set the focus.
    this._setFocusToNode(oFocusedNode);
    this._adjustAndShowArrow();
  }
};

/**
 * Method called if the ProcessFlow has the navigation focus and the key '+' is pressed ( for keyboard support).
 *
 * @private
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsapplus = function (oEvent) {
  this._isFocusChanged = true;
  this.zoomIn();
};

/**
 * Method called if the ProcessFlow has the navigation focus and the key '-' is pressed ( for keyboard support).
 *
 * @private
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype.onsapminus = function (oEvent) {
  this._isFocusChanged = true;
  this.zoomOut();
};

sap.suite.ui.commons.ProcessFlow.prototype.onkeydown = function (oEvent) {
  var keycode = (oEvent.keyCode ? oEvent.keyCode : oEvent.which);
  jQuery.sap.log.debug("ProcessFlow::keyboard input has been catched and action going to start: keycode=" + keycode);

  var bNFocusChanged = false;
  var bReleaseNFocus = false;
  var oReleaseNFocus = null;
  var shiftKeyPressed = oEvent.shiftKey;
  var ctrlKeyPressed = oEvent.ctrlKey;
  var altKeyPressed = oEvent.altKey;
  var oFocusedNode;
  var previousNavigationNode = this._lastNavigationFocusNode;
  var thead;

  switch (keycode) {
    case jQuery.sap.KeyCodes.TAB:
      if (shiftKeyPressed) {
        oReleaseNFocus = this.$("scrollContainer").parent().parent().prev();
        if (this._isHeaderMode()) { //Lanes-only.
          this._setFocusOnHeader(false);
        }
      } else {
        if (this._isHeaderMode()) { //Lanes-only.
          if (!this._headerHasFocus) {
            this._setFocusOnHeader(true);
          } else {
            this._setFocusOnHeader(false);
            oReleaseNFocus = this.$("scrollContainer").parent().parent().next();
            bReleaseNFocus = true;
          }
        } else {
          var $nextElement = this.$("scrollContainer").parent().parent().next();
          if ($nextElement.length !== 0) {
            oReleaseNFocus = $nextElement;
            bReleaseNFocus = true;
            this._lastNavigationFocusNode = false;
          }
        }
      }
      break;
    case jQuery.sap.KeyCodes.ARROW_RIGHT:
      bNFocusChanged = this._moveToNextNode(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT);
      break;
    case jQuery.sap.KeyCodes.ARROW_LEFT:
      bNFocusChanged = this._moveToNextNode(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT);
      break;
    case jQuery.sap.KeyCodes.ARROW_DOWN:
      bNFocusChanged = this._moveToNextNode(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN);
      break;
    case jQuery.sap.KeyCodes.ARROW_UP:
      bNFocusChanged = this._moveToNextNode(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP);
      break;
    case jQuery.sap.KeyCodes.PAGE_UP:
      bNFocusChanged = this._moveOnePage(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.UP, altKeyPressed);
      break;
    case jQuery.sap.KeyCodes.PAGE_DOWN:
      bNFocusChanged = this._moveOnePage(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.DOWN, altKeyPressed);
      break;
    case jQuery.sap.KeyCodes.HOME:
      bNFocusChanged = this._moveHomeEnd(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.LEFT, ctrlKeyPressed);
      break;
    case jQuery.sap.KeyCodes.END:
      bNFocusChanged = this._moveHomeEnd(sap.suite.ui.commons.ProcessFlow._enumMoveDirection.RIGHT, ctrlKeyPressed);
      break;
    case jQuery.sap.KeyCodes.NUMPAD_0:
    case jQuery.sap.KeyCodes.DIGIT_0:
      this._initZoomLevel();
      break;
    case jQuery.sap.KeyCodes.ENTER:
    case jQuery.sap.KeyCodes.SPACE:
      //ENTER and SPACE are fired onkeyup according to the spec, but we need to prevent the default behavior.
      oEvent.preventDefault();
      return;
    default:
      //It was not our key, let default action be executed if any.
      return;
  }

  //It was our key, default action has to suppressed.
  oEvent.preventDefault();

  if (bNFocusChanged) {
    //We have to re-render when we changed Nfocus inside our control.
    this._changeNavigationFocus(previousNavigationNode, this._lastNavigationFocusNode);
  }

  if (oReleaseNFocus) {
    //We have to make focus to element outside our control.
    oReleaseNFocus.focus();
    jQuery.sap.log.debug("keypressdown: Keyboard focus has been changed to element:  id='" + oReleaseNFocus.id + "' outerHTML='" + oReleaseNFocus.outerHTML + "'");
    oReleaseNFocus = null;
  }
};

sap.suite.ui.commons.ProcessFlow.prototype.onkeyup = function (oEvent) {
  var keycode = (oEvent.keyCode ? oEvent.keyCode : oEvent.which);
  jQuery.sap.log.debug("ProcessFlow::keyboard input has been catched and action going to start: keycode=" + keycode);
  var $nodeToFocus;
  var oNodeToFocus;
  switch (keycode) {
    case jQuery.sap.KeyCodes.ENTER:
    case jQuery.sap.KeyCodes.SPACE:
      if (this._isHeaderMode()) { //Lanes-only.
        this._internalLanes = [];
        this.fireHeaderPress(this);
        $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
        oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
        this._changeNavigationFocus(null, oNodeToFocus);
      } else {
        if (this._lastNavigationFocusNode instanceof sap.suite.ui.commons.ProcessFlowNode && this._lastNavigationFocusNode._getNavigationFocus()) {
          this.fireNodePress(this._lastNavigationFocusNode);
        }
      }
      break;
    case jQuery.sap.KeyCodes.TAB:
      if (!this._isHeaderMode() && !this._lastNavigationFocusNode) {
        $nodeToFocus = this.$("scroll-content").children().children().children(1).children("td[tabindex='0']").first().children();
        oNodeToFocus = sap.ui.getCore().byId($nodeToFocus[0].id);
        this._changeNavigationFocus(null, oNodeToFocus);
      } else if (!this._isHeaderMode()) {
        this._changeNavigationFocus(null, this._lastNavigationFocusNode);
      }
      break;
  }
};

/**
 * Merge values of node states for several nodes.
 *
 * @private
 * @param {array} aLaneIdNodeStates node states for all nodes of the same laneId
 * @param altKey, true if alt key is pressed, false otherwise
 * @returns {Object[]} aResult Array of cumulated node states for aLaneIdNodeStates
 */
sap.suite.ui.commons.ProcessFlow.prototype._mergeLaneIdNodeStates = function (aLaneIdNodeStates) {
  var iPositive = 0;
  var iNegative = 0;
  var iNeutral = 0;
  var iPlanned = 0;

  for (var iState = 0; iState < 4; iState++) {
    for (var iNode = 0; iNode < aLaneIdNodeStates.length; iNode++) {
      switch (aLaneIdNodeStates[iNode][iState].state) {
        case sap.suite.ui.commons.ProcessFlowNodeState.Positive:
          iPositive = iPositive + aLaneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Negative:
          iNegative = iNegative + aLaneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Neutral:
          iNeutral = iNeutral + aLaneIdNodeStates[iNode][iState].value;
          break;
        case sap.suite.ui.commons.ProcessFlowNodeState.Planned:
          iPlanned = iPlanned + aLaneIdNodeStates[iNode][iState].value;
          break;
          //plannedNegative belong to Negative group
        case sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative:
          iNegative = iNegative + aLaneIdNodeStates[iNode][iState].value;
          break;
      }
    }
  }

  var aResult = [{ state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, value: iPositive },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, value: iNegative },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Neutral, value: iNeutral },
                 { state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, value: iPlanned }];

  return aResult;
};

/**
 * Sets or removes navigation focus on the Lane header ( for keyboard support ).
 *
 * @private
 * @param {boolean} if true the navigation focus is set, if false the navigation focus is removed
 * @since 1.26
 */
sap.suite.ui.commons.ProcessFlow.prototype._setFocusOnHeader = function (setFlag) {
  var thead = jQuery.sap.byId(this.getId() + "-thead");
  if (setFlag) {
    thead.focus();
    thead.addClass("sapSuiteUiCommonsPFHeaderFocused");
    this._headerHasFocus = true;
  }
  else {
    thead.blur();
    thead.removeClass("sapSuiteUiCommonsPFHeaderFocused");
    this._headerHasFocus = false;
  }
};

/**
 * Handles the click on the arrows.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._onArrowClick = function (oEvent) {
  var sTargetId = oEvent.target.id;
  if (sTargetId) {
    var sId = this.getId();
    //For scroll buttons: Prevent IE from firing beforeunload event -> see CSN 4378288 2012
    oEvent.preventDefault();
    //On mobile devices, the click on arrows has no effect.
    if (sTargetId == sId + "-arrowScrollLeft" && sap.ui.Device.system.desktop) {
      //Scroll back/left button.
      this._scroll(-this._scrollStep, 500);
    } else if (sTargetId == sId + "-arrowScrollRight" && sap.ui.Device.system.desktop) {
      //Scroll forward/right button.
      this._scroll(this._scrollStep, 500);
    }
  }
};

/**
 * Scrolls the header if possible, using an animation.
 *
 * @private
 * @param iDelta how far to scroll
 * @param iDuration how long to scroll (ms)
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._scroll = function (iDelta, iDuration) {
  var oDomRef = this.getDomRef("scrollContainer");
  var iScrollLeft = oDomRef.scrollLeft;
  if (!!!sap.ui.Device.browser.internet_explorer && this._bRtl) {
    iDelta = -iDelta;
  } //RTL lives in the negative space.
  var iScrollTarget = iScrollLeft + iDelta;
  jQuery(oDomRef).stop(true, true).animate({ scrollLeft: iScrollTarget }, iDuration, jQuery.proxy(this._adjustAndShowArrow, this));
};

/**
 * Adjusts the arrow position and shows the arrow.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._adjustAndShowArrow = function () {
  this._checkOverflow(this.getDomRef("scrollContainer"), this.$());
  if (this.getScrollable()) {
    this._moveArrowAndCounterVertical();
  }
  if (this._isFocusChanged) {
    this._setFocusToNode(this._lastNavigationFocusNode);
    this._isFocusChanged = false;
  }
};

/**
 * Gets the icon of the requested arrow (left/right).
 *
 * @private
 * @param sName left or right
 * @returns icon of the requested arrow
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._getScrollingArrow = function (sName) {
  var src;

  if (sap.ui.Device.system.desktop) {
    //Use navigation arrows on desktop and win8 combi devices.
    src = "sap-icon://navigation-" + sName + "-arrow";
  } else {
    //Use slim arrows on mobile devices.
    src = "sap-icon://slim-arrow-" + sName;
  }

  var mProperties = {
    src: src
  };

  var sLeftArrowClass = "sapPFHArrowScrollLeft";
  var sRightArrowClass = "sapPFHArrowScrollRight";
  var aCssClassesToAddLeft = ["sapPFHArrowScroll", sLeftArrowClass];
  var aCssClassesToAddRight = ["sapPFHArrowScroll", sRightArrowClass];

  if (sName === "left") {
    if (!this._oArrowLeft) {
      this._oArrowLeft = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollLeft", null, this, mProperties, aCssClassesToAddLeft);
    }
    return this._oArrowLeft;
  }
  if (sName === "right") {
    if (!this._oArrowRight) {
      this._oArrowRight = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollRight", null, this, mProperties, aCssClassesToAddRight);
    }
    return this._oArrowRight;
  }
};

/**
 * Checks if scrolling is needed.
 *
 * @private
 * @param oScrollContainer the scroll container
 * @param $processFlow the ProcessFlow container
 * @returns true if scrolling is needed, otherwise false
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._checkScrolling = function (oScrollContainer, $processFlow) {
  var bScrolling = false;

  //Check if there are more lanes than displayed.
  if (oScrollContainer) {
    if (oScrollContainer.scrollWidth > oScrollContainer.clientWidth) {
      //Scrolling possible.
      bScrolling = true;
    }
  }

  if (this._arrowScrollable !== bScrolling) {
    $processFlow.toggleClass("sapPFHScrollable", bScrolling);
    $processFlow.toggleClass("sapPFHNotScrollable", !bScrolling);
    this._arrowScrollable = bScrolling;
  }

  return bScrolling;
};

/**
 * Sets the scroll width depending on the zoom level.
 *
 * @private
 * @param oScrollContainer the scroll container
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._setScrollWidth = function (oScrollContainer) {
  //The distance to scroll depends on the ZoomLevel.
  switch (this.getZoomLevel()) {
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.One):
      this._scrollStep = 240;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Two):
      this._scrollStep = 192;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Three):
      this._scrollStep = 168;
      break;
    case (sap.suite.ui.commons.ProcessFlowZoomLevel.Four):
      this._scrollStep = 128;
      break;
  }
};

/**
 * Calculates the left counter.
 *
 * @private
 * @returns {Number} The left counter
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateLeftCounter = function () {
  var iScrollDelta;
  if (!this._bRtl) { //Normal LTR mode.
    iScrollDelta = this.$("scrollContainer").scrollLeft();
  }
  else { //RTL mode.
    iScrollDelta = this.$("scrollContainer").scrollRightRTL();
  }
  var counterLeft = Math.round(iScrollDelta / this._scrollStep);
  this.$("counterLeft").text(counterLeft.toString());
  return counterLeft;
};

/**
 * Calculates the right counter.
 *
 * @private
 * @param availableWidth
 * @param realWidth
 * @returns {Number} The right counter
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._updateRightCounter = function (availableWidth, realWidth) {
  var iScrollDelta;
  var counterRight;
  if (!this._bRtl) { //Normal LTR mode.
    iScrollDelta = this.$("scrollContainer").scrollLeft();
    counterRight = Math.round((realWidth - iScrollDelta - availableWidth) / this._scrollStep);
  }
  else { //RTL mode.
    iScrollDelta = this.$("scrollContainer").scrollLeftRTL();
    counterRight = Math.round(iScrollDelta / this._scrollStep);
  }
  this.$("counterRight").text(counterRight.toString());
  return counterRight;
};

/**
 * For scrollable ProcessFlow : move arrows and counter vertically when scrolling.
 *
 * @private
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._moveArrowAndCounterVertical = function () {
  var iScrollTop = this.$("scrollContainer").scrollTop();
  if (iScrollTop > 0) {
    var iArrowTop = this._iInitialArrowTop - iScrollTop;
    var iCounterTop = this._iInitialCounterTop - iScrollTop;
    var iDiffArrowCounter = this._iInitialCounterTop - this._iInitialArrowTop;
    if (iArrowTop > 0) {
      this.$("arrowScrollRight").css("top", iArrowTop + "px");
      this.$("arrowScrollLeft").css("top", iArrowTop + "px");
    }
    else {
      this.$("arrowScrollRight").css("top", "0px");
      this.$("arrowScrollLeft").css("top", "0px");
    }
    if (iCounterTop > iDiffArrowCounter) {
      this.$("counterRight").css("top", iCounterTop + "px");
      this.$("counterLeft").css("top", iCounterTop + "px");
    }
    else {
      this.$("counterRight").css("top", iDiffArrowCounter + "px");
      this.$("counterLeft").css("top", iDiffArrowCounter + "px");
    }
  }
  else {
    this.$("arrowScrollRight").css("top", this._iInitialArrowTop + "px");
    this.$("arrowScrollLeft").css("top", this._iInitialArrowTop + "px");
    this.$("counterRight").css("top", this._iInitialCounterTop + "px");
    this.$("counterLeft").css("top", this._iInitialCounterTop + "px");
  }
};

/**
 * Changes the state of the scroll arrows depending on whether they are required due to overflow.
 *
 * @private
 * @param oScrollContainer the scroll container
 * @param $processFlow the ProcessFlow container
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype._checkOverflow = function (oScrollContainer, $processFlow) {
  if (this._checkScrolling(oScrollContainer, $processFlow) && oScrollContainer) {
    this._setScrollWidth(oScrollContainer);
    //Check whether scrolling to the left is possible.
    var bScrollBack = false;
    var bScrollForward = false;
    var iOffset = 20; //Display arrow and counter only if the distance to the end of the scroll container is at least 20px.
    var iScrollLeft = this.$("scrollContainer").scrollLeft();
    var realWidth = oScrollContainer.scrollWidth;
    var availableWidth = oScrollContainer.clientWidth;
    if (Math.abs(realWidth - availableWidth) == 1) { //Avoid rounding issues see CSN 1316630 2013
      realWidth = availableWidth;
    }

    if (!this._bRtl) { //Normal LTR mode.
      if (iScrollLeft > iOffset) {
        bScrollBack = true;
      }
      if ((realWidth > availableWidth) && (iScrollLeft + availableWidth + iOffset < realWidth)) {
        bScrollForward = true;
      }
    } else { //RTL mode.
      var $ScrollContainer = jQuery(oScrollContainer);
      if ($ScrollContainer.scrollLeftRTL() > iOffset) {
        bScrollForward = true;
      }
      if ($ScrollContainer.scrollRightRTL() > iOffset) {
        bScrollBack = true;
      }
    }
    //Update left and right counter.
    this._updateLeftCounter();
    this._updateRightCounter(availableWidth, realWidth);

    //Only do DOM changes if the state changed to avoid periodic application of identical values.
    if ((bScrollForward !== this._bPreviousScrollForward) || (bScrollBack !== this._bPreviousScrollBack)) {
      this._bPreviousScrollForward = bScrollForward;
      this._bPreviousScrollBack = bScrollBack;
      $processFlow.toggleClass("sapPFHScrollBack", bScrollBack);
      $processFlow.toggleClass("sapPFHNoScrollBack", !bScrollBack);
      $processFlow.toggleClass("sapPFHScrollForward", bScrollForward);
      $processFlow.toggleClass("sapPFHNoScrollForward", !bScrollForward);
    }
  } else {
    this._bPreviousScrollForward = false;
    this._bPreviousScrollBack = false;
  }
};

/**
 * Handles the onScroll event.
 * 
 * @private
 */
sap.suite.ui.commons.ProcessFlow.prototype._onScroll = function (oEvent) {
  var iScrollLeft = this.$("scrollContainer").scrollLeft();
  var iDelta = Math.abs(iScrollLeft - this._iTouchStartScrollLeft);
  //Only valid if the focus does not change.
  if (iDelta > (this._scrollStep / 4) && !this._isFocusChanged) {
    //Update arrows when 1/4 lane was scrolled.
    this._adjustAndShowArrow();
    this._iTouchStartScrollLeft = iScrollLeft;
  }
  else {
    //Update vertical alignment of arrows if only vertical scrolling is possible.
    if (this.getScrollable()) {
      var iScrollTop = this.$("scrollContainer").scrollTop();
      var iDeltaTop = Math.abs(iScrollTop - this._iTouchStartScrollTop);
      if (iDeltaTop > 10) {
        this._moveArrowAndCounterVertical();
        this._iTouchStartScrollTop = iScrollTop;
      }
    }
  }
};

/**
 * Initializes left and top distance when scrolling starts.
 *
 * @private
 * @param {jQuery.Event} oEvent
 * @since 1.30
 */
sap.suite.ui.commons.ProcessFlow.prototype.ontouchstart = function (oEvent) {
  this._iTouchStartScrollLeft = this.$("scrollContainer").scrollLeft();
  if (this.getScrollable()) {
    this._iTouchStartScrollTop = this.$("scrollContainer").scrollTop();
  }
};

/**
 * Sets the parent association for given nodes.
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} aInternalNodes Array of nodes to set parents on
 */
sap.suite.ui.commons.ProcessFlow.prototype._setParentForNodes = function (aInternalNodes) {
  var cInternalNodes = aInternalNodes ? aInternalNodes.length : 0;
  var aChildren;
  var i, j;
  //Cleanup association to avoid duplicates.
  for (var currentNode in aInternalNodes) {
    aInternalNodes[currentNode].removeAllAssociation("parents", true);
  }
  for (i = 0; i < cInternalNodes; i++) {
    aChildren = aInternalNodes[i].getChildren();
    if (aChildren) {
      for (j = 0; j < aChildren.length; j++) {
        var childNode = this._getNode(sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]), aInternalNodes);
        if (childNode) {
          childNode.addAssociation("parents", aInternalNodes[i], true);
        }
      }
    }
  }
};

/**
 * Returns the node from the given array which matches to the given nodeId.
 *
 * @private
 * @param {String} nodeId Id of node to retrieve
 * @param {sap.suite.ui.commons.ProcessFlowNode[]} aInternalNodes Array of nodes to search in
 * @returns {sap.suite.ui.commons.ProcessFlowNode} Found ProcessFlow node
 */
sap.suite.ui.commons.ProcessFlow.prototype._getNode = function (nodeId, aInternalNodes) {
  for (var i = 0; i < aInternalNodes.length; i++) {
    if (aInternalNodes[i].getNodeId() === nodeId.toString()) {
      return aInternalNodes[i];
    }
  }
};

/**
 * Returns the lane from the _internalLanes array which matches to the given laneId.
 *
 * @private
 * @param {String} laneId Id of lane to retrieve
 * @returns {sap.suite.ui.commons.ProcessFlowLaneHeader} The lane header element
 */
sap.suite.ui.commons.ProcessFlow.prototype._getLane = function (laneId) {
  for (var i = 0; i < this._internalLanes.length; i++) {
    if (this._internalLanes[i].getLaneId() === laneId) {
      return this._internalLanes[i];
    }
  }
};

/**
 * Returns the id of the given child node element. Since child elements can be string or object, this function checks the type and
 * returns the nodeId.
 *
 * @private
 * @param {Object/String} The child element containing the nodeId
 * @returns {Number} The id of the child element
 */
sap.suite.ui.commons.ProcessFlow._getChildIdByElement = function (oChildElement) {
  if (typeof oChildElement === 'object') {
    return oChildElement.nodeId;
  } else {
    return oChildElement;
  }
};

/**
 * Creates the connection map objects between the source and target nodes
 * incl. label information and connection parts, based on the calculated matrix.
 *
 * @private
 * @returns {Object} The Connection map
 */
sap.suite.ui.commons.ProcessFlow.prototype._getConnectionsMap = function () {

  //Example:
  //  var connectionMap = [];
  //  var connectionMapEntry = {};
  //  connectionMapEntry.sourceNode = matrix[0][1];
  //  connectionMapEntry.targetNode = matrix[4][3];
  //  connectionMapEntry.label = "label from code, needs to be mapped";
  //  connectionMapEntry.connectionParts = [
  //                                   {x:0, y:2},
  //                                   {x:1, y:2},
  //                                   {x:2, y:2},
  //                                   {x:3, y:2},
  //                                   {x:4, y:2}
  //                                   ];

  var aConnections = [];
  var aNodes = this.getNodes();
  for (var i = 0; i < aNodes.length; i++) {
    var oPositionOfSourceNode = this._getPositionOfNodeInMatrix(this._internalCalcMatrix, aNodes[i]);
    var aChildren = aNodes[i].getChildren();
    if (aChildren) {
      for (var j = 0; j < aChildren.length; j++) {
        var oConnectionMapEntry = {};
        oConnectionMapEntry.sourceNode = aNodes[i];
        var childId = sap.suite.ui.commons.ProcessFlow._getChildIdByElement(aChildren[j]);
        var childNode = this._getNode(childId, aNodes);
        if (childNode) {
          if (typeof aChildren[j] === 'object') {
            oConnectionMapEntry.label = aChildren[j].connectionLabel;
          }
          oConnectionMapEntry.targetNode = childNode;
          //Find position in matrix
          var oPositionOfTargetNode = this._getPositionOfNodeInMatrix(this._internalCalcMatrix, oConnectionMapEntry.targetNode);
          oConnectionMapEntry.connectionParts = this._calculateConnectionParts(this._internalCalcMatrix, oPositionOfSourceNode, oPositionOfTargetNode);
          aConnections.push(oConnectionMapEntry);
        }
      }
    }
  }
  this._internalConnectionMap = aConnections;
  return aConnections;
};

/**
 * Returns the position (coordinates x/y) of the given ProcessFlowNode in calculated matrix of ProcessFlow.
 *
 * @private
 * @param {Object} The calculated matrix of the current ProcessFlow
 * @param {sap.suite.ui.commons.ProcessFlowNode} The node for which the position is required
 * @returns {Object} The position of the node in the calculated matrix (x/y)
 */
sap.suite.ui.commons.ProcessFlow.prototype._getPositionOfNodeInMatrix = function (aMatrix, oNode) {
  var position = {};
  for (var i = 0; i < aMatrix.length; i++) {
    var currentLine = aMatrix[i];
    for (var j = 0; j < currentLine.length; j++) {
      var currentCell = currentLine[j];
      if (currentCell &&
          currentCell instanceof sap.suite.ui.commons.ProcessFlowNode &&
          currentCell.getNodeId() === oNode.getNodeId()) {
        position.y = i;
        position.x = j;
        return position;
      }
    }
  }
  return position;
};

/**
 * Calculates the connection parts (coordinates in matrix) between source and target node.
 *
 * @private
 * @param {Object} The calculated matrix of the current ProcessFlow
 * @param {Object} The position of the source node in the calculated matrix (x/y)
 * @param {Object} The position of the target node in the calculated matrix (x/y)
 * @returns {Object[]} Array of all connection parts, relevant for connection between source and target node
 */
sap.suite.ui.commons.ProcessFlow.prototype._calculateConnectionParts = function (aMatrix, oPositionOfSourceNode, oPositionOfTargetNode) {

  //Example:
  //var connectionParts = [
  //    {x:0, y:2},
  //    {x:1, y:2},
  //    {x:2, y:2},
  //    {x:3, y:2},
  //    {x:4, y:2}
  //  ];

  var aConnectionParts = [];
  var cY = oPositionOfSourceNode.y;
  var cX = oPositionOfSourceNode.x;

  //Increase column+1 (step 1 right), independent from target position since target will ever be right from source.
  cX++;
  aConnectionParts.push({ x: cX, y: cY });

  //Increase (row+1) till we are in the row of target node (n steps down) if target is below source in matrix.
  //Decrease (row-1) till we are in the row of target node (n steps up) if target is above source in matrix.
  if (oPositionOfTargetNode.y >= oPositionOfSourceNode.y) {
    while (cY < oPositionOfTargetNode.y) {
      cY++;
      aConnectionParts.push({ x: cX, y: cY });
    }
  } else {
    while (cY > oPositionOfTargetNode.y) {
      cY--;
      aConnectionParts.push({ x: cX, y: cY });
    }
  }

  //Increase column+1 till we are in column of target node (n steps right)
  while (cX < oPositionOfTargetNode.x - 1) {
    cX++;
    aConnectionParts.push({ x: cX, y: cY });
  }
  return aConnectionParts;
};

/**
 * Returns the connectionMapEntries which are relevant for the given sap.suite.ui.commonsProcessFlowConnectionLabel.
 * Means all entries having the same target node as current entry (based on current label).
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowConnectionLabel} The label for which the map entries are required
 * @returns {Object[]} Array with relevant connectionMapEntries for the given label
 */
sap.suite.ui.commons.ProcessFlow.prototype._getConnectionMapEntries = function (oConnectionLabel) {
  var aFilteredConnectionMaps = [];
  var connectionMapWithLabel = null;
  var oEntry = null;

  //Find relevant connectionMapEntry, containing given Label.
  if (this._internalConnectionMap) {
    for (var i = 0; i < this._internalConnectionMap.length; i++) {
      oEntry = this._internalConnectionMap[i];
      if (oEntry.label &&
          oEntry.label.getId() === oConnectionLabel.getId()) {
        connectionMapWithLabel = oEntry;
        break;
      }
    }

    //Collect all connectionMapEntries with same target node as the one, containing the Label.
    oEntry = null;
    for (var j = 0; j < this._internalConnectionMap.length; j++) {
      oEntry = this._internalConnectionMap[j];
      if (oEntry.targetNode &&
          oEntry.targetNode.getNodeId() === connectionMapWithLabel.targetNode.getNodeId()) {
        aFilteredConnectionMaps.push(oEntry);
      }
    }
  }
  return aFilteredConnectionMaps;
};

/**
 * Handles the click of labels and triggers the related ProcessFlow event.
 *
 * @private
 * @params {Object} Event Args, containing the label and related information
 */
sap.suite.ui.commons.ProcessFlow.prototype._handleLabelClick = function (oEvent) {
  if (oEvent) {
    var oConnectionLabel = oEvent.getSource();
    //Check if user clicked on icon.
    if (oConnectionLabel instanceof sap.ui.core.Icon) {
        oConnectionLabel = oConnectionLabel.getParent();
     }
    if (oConnectionLabel instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
      var aRelevantConnectionMapEntries = this._getConnectionMapEntries(oConnectionLabel);
      var eventArgsToFire = this._createLabelPressEventArgs(oConnectionLabel, aRelevantConnectionMapEntries);
      this.fireLabelPress(eventArgsToFire);
    }
  }
}

/**
 * Sets the path between source and target node to selected status and rerenders the control. If parameters are null, sets all nodes to normal status.
 *
 * @public
 * @param {String} sourceNodeId of the path or null
 * @param {String} targetNodeId of the path or null
 * @since 1.32
 */
sap.suite.ui.commons.ProcessFlow.prototype.setSelectedPath = function (sourceNodeId, targetNodeId) {
  var aNodes = this.getNodes();
  if (aNodes) {
    if (sourceNodeId && targetNodeId) {
      var cNodesFound = 0;
      for (var i = 0; i < aNodes.length; i++) {
        if (aNodes[i].getNodeId() === sourceNodeId || aNodes[i].getNodeId() === targetNodeId) {
          aNodes[i].setSelected(true);
          cNodesFound++;
        } else {
          aNodes[i].setSelected(false);
        }
      }
      if (cNodesFound == 2) {
        this.rerender();
      }
    } else if (!sourceNodeId && !targetNodeId) {
      for (var i = 0; i < aNodes.length; i++) {
        aNodes[i].setSelected(false);
      }
      this.rerender();
    }
  }
};

/**
 * Sets the focus to the given Label
 *
 * @public
 * @param {sap.suite.ui.commons.ProcessFlowConnectionlabel} Label to focus
 * @since 1.32
 */
sap.suite.ui.commons.ProcessFlow.prototype.setFocusToLabel = function (oLabel) {
  this._changeNavigationFocus(this._lastNavigationFocusNode, oLabel);
};

/**
 * Creates the eventArgs for fireLabelPress of ProcessFlow.
 * Additional object is necessary, since connectionmaps are containing too much information (e.g. parts).
 *
 * @private
 * @param {sap.suite.ui.commons.ProcessFlowConnectionlabel} Label which has been selected by user (clicked)
 * @param {Object[]} The relevant connection maps for the selected label
 * @returns {Object} Event args for fireLabelPress
 */
sap.suite.ui.commons.ProcessFlow.prototype._createLabelPressEventArgs = function (oConnectionLabel, aConnectionMapEntries) {
  var oEvent = {};
  var aEventArgsConnectionValues = [];

  if (aConnectionMapEntries) {
    for (var i = 0; i < aConnectionMapEntries.length; i++) {
      var oEventArgsConnectionValue = {
        sourceNode: aConnectionMapEntries[i].sourceNode,
        targetNode: aConnectionMapEntries[i].targetNode,
        label: aConnectionMapEntries[i].label
      };
      aEventArgsConnectionValues.push(oEventArgsConnectionValue);
    }
  }

  oEvent.selectedLabel = oConnectionLabel;
  oEvent.connections = aEventArgsConnectionValues;
  return oEvent;
};

/**
 * Overwrites setShowLabels of ProcessFlow control to apply additional functionality.
 *
 * @param {Boolean} New value for showLabels
 */
sap.suite.ui.commons.ProcessFlow.prototype.setShowLabels = function (bNewValue) {
  var bOldValue = this.getShowLabels();
  if (bOldValue && !bNewValue) { //Only if status has been changed from show to hide
    this.setProperty("showLabels", bNewValue, true);
    // Resets the selected path in case labels have been disabled for the current control.
    if (!this.getShowLabels()) {
      this.setSelectedPath(null, null);
    }
  } else {
    this.setProperty("showLabels", bNewValue);
  }
};
