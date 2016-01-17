/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.TileContainer.
jQuery.sap.declare("sap.ushell.ui.launchpad.TileContainer");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui/launchpad/TileContainer.
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
 * <li>{@link #getScrollType scrollType} : string (default: 'item')</li>
 * <li>{@link #getAnimationSpeed animationSpeed} : int (default: 500)</li>
 * <li>{@link #getGroupId groupId} : string</li>
 * <li>{@link #getShowHeader showHeader} : boolean (default: true)</li>
 * <li>{@link #getShowPlaceholder showPlaceholder} : boolean (default: true)</li>
 * <li>{@link #getDefaultGroup defaultGroup} : boolean (default: false)</li>
 * <li>{@link #getIsLastGroup isLastGroup} : boolean (default: false)</li>
 * <li>{@link #getHeaderText headerText} : string</li>
 * <li>{@link #getHeaderLevel headerLevel} : sap.m.HeaderLevel (default: sap.m.HeaderLevel.H2)</li>
 * <li>{@link #getGroupHeaderLevel groupHeaderLevel} : sap.m.HeaderLevel (default: sap.m.HeaderLevel.H4)</li>
 * <li>{@link #getShowGroupHeader showGroupHeader} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getSortable sortable} : boolean (default: true)</li>
 * <li>{@link #getShowNoData showNoData} : boolean (default: false)</li>
 * <li>{@link #getNoDataText noDataText} : string</li>
 * <li>{@link #getIsGroupLocked isGroupLocked} : boolean</li>
 * <li>{@link #getEditMode editMode} : boolean (default: false)</li>
 * <li>{@link #getShowBackground showBackground} : boolean (default: false)</li>
 * <li>{@link #getIcon icon} : string (default: 'sap-icon://locked')</li>
 * <li>{@link #getShowIcon showIcon} : boolean (default: false)</li>
 * <li>{@link #getDeluminate deluminate} : boolean (default: false)</li>
 * <li>{@link #getShowMobileActions showMobileActions} : boolean (default: false)</li>
 * <li>{@link #getEnableHelp enableHelp} : boolean (default: false)</li>
 * <li>{@link #getTileActionModeActive tileActionModeActive} : boolean (default: false)</li>
 * <li>{@link #getIeHtml5DnD ieHtml5DnD} : boolean (default: false)</li>
 * <li>{@link #getShowDragIndicator showDragIndicator} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getTiles tiles} : sap.ushell.ui.launchpad.Tile[]</li>
 * <li>{@link #getLinks links} : sap.ushell.ui.launchpad.LinkTileWrapper[]</li>
 * <li>{@link #getBeforeContent beforeContent} : sap.ui.core.Control[]</li>
 * <li>{@link #getAfterContent afterContent} : sap.ui.core.Control[]</li>
 * <li>{@link #getFooterContent footerContent} : sap.ui.core.Control[]</li>
 * <li>{@link #getHeaderActions headerActions} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.ushell.ui.launchpad.TileContainer#event:afterRendering afterRendering} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.TileContainer#event:add add} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.ushell.ui.launchpad.TileContainer#event:titleChange titleChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A container that arranges Tile controls.
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.ui.launchpad.TileContainer", { metadata : {

	library : "sap.ushell",
	properties : {
		"scrollType" : {type : "string", group : "Misc", defaultValue : 'item'},
		"animationSpeed" : {type : "int", group : "Misc", defaultValue : 500},
		"groupId" : {type : "string", group : "Misc", defaultValue : null},
		"showHeader" : {type : "boolean", group : "Misc", defaultValue : true},
		"showPlaceholder" : {type : "boolean", group : "Misc", defaultValue : true},
		"defaultGroup" : {type : "boolean", group : "Misc", defaultValue : false},
		"isLastGroup" : {type : "boolean", group : "Misc", defaultValue : false},
		"headerText" : {type : "string", group : "Misc", defaultValue : null},
		"headerLevel" : {type : "sap.m.HeaderLevel", group : "Misc", defaultValue : sap.m.HeaderLevel.H2},
		"groupHeaderLevel" : {type : "sap.m.HeaderLevel", group : "Misc", defaultValue : sap.m.HeaderLevel.H4},
		"showGroupHeader" : {type : "boolean", group : "Misc", defaultValue : true},
		"visible" : {type : "boolean", group : "Misc", defaultValue : true},
		"sortable" : {type : "boolean", group : "Misc", defaultValue : true},
		"showNoData" : {type : "boolean", group : "Misc", defaultValue : false},
		"noDataText" : {type : "string", group : "Misc", defaultValue : null},
		"isGroupLocked" : {type : "boolean", group : "Misc", defaultValue : null},
		"editMode" : {type : "boolean", group : "Misc", defaultValue : false},
		"showBackground" : {type : "boolean", group : "Misc", defaultValue : false},
		"icon" : {type : "string", group : "Misc", defaultValue : 'sap-icon://locked'},
		"showIcon" : {type : "boolean", group : "Misc", defaultValue : false},
		"deluminate" : {type : "boolean", group : "Misc", defaultValue : false},
		"showMobileActions" : {type : "boolean", group : "Misc", defaultValue : false},
		"enableHelp" : {type : "boolean", group : "Misc", defaultValue : false},
		"tileActionModeActive" : {type : "boolean", group : "Misc", defaultValue : false},
		"ieHtml5DnD" : {type : "boolean", group : "Misc", defaultValue : false},
		"showDragIndicator" : {type : "boolean", group : "Misc", defaultValue : false}
	},
	aggregations : {
		"tiles" : {type : "sap.ushell.ui.launchpad.Tile", multiple : true, singularName : "tile"}, 
		"links" : {type : "sap.ushell.ui.launchpad.LinkTileWrapper", multiple : true, singularName : "link"}, 
		"beforeContent" : {type : "sap.ui.core.Control", multiple : true, singularName : "beforeContent"}, 
		"afterContent" : {type : "sap.ui.core.Control", multiple : true, singularName : "afterContent"}, 
		"footerContent" : {type : "sap.ui.core.Control", multiple : true, singularName : "footerContent"}, 
		"headerActions" : {type : "sap.ui.core.Control", multiple : true, singularName : "headerAction"}
	},
	events : {
		"afterRendering" : {}, 
		"add" : {}, 
		"titleChange" : {}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.TileContainer with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.TileContainer.extend
 * @function
 */

sap.ushell.ui.launchpad.TileContainer.M_EVENTS = {'afterRendering':'afterRendering','add':'add','titleChange':'titleChange'};


/**
 * Getter for property <code>scrollType</code>.
 *
 * Default value is <code>item</code>
 *
 * @return {string} the value of property <code>scrollType</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getScrollType
 * @function
 */

/**
 * Setter for property <code>scrollType</code>.
 *
 * Default value is <code>item</code> 
 *
 * @param {string} sScrollType  new value for property <code>scrollType</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setScrollType
 * @function
 */


/**
 * Getter for property <code>animationSpeed</code>.
 * Animation Speed in milliseconds (ms)
 *
 * Default value is <code>500</code>
 *
 * @return {int} the value of property <code>animationSpeed</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getAnimationSpeed
 * @function
 */

/**
 * Setter for property <code>animationSpeed</code>.
 *
 * Default value is <code>500</code> 
 *
 * @param {int} iAnimationSpeed  new value for property <code>animationSpeed</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setAnimationSpeed
 * @function
 */


/**
 * Getter for property <code>groupId</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>groupId</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getGroupId
 * @function
 */

/**
 * Setter for property <code>groupId</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sGroupId  new value for property <code>groupId</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setGroupId
 * @function
 */


/**
 * Getter for property <code>showHeader</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showHeader</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowHeader
 * @function
 */

/**
 * Setter for property <code>showHeader</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowHeader  new value for property <code>showHeader</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowHeader
 * @function
 */


/**
 * Getter for property <code>showPlaceholder</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showPlaceholder</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowPlaceholder
 * @function
 */

/**
 * Setter for property <code>showPlaceholder</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowPlaceholder  new value for property <code>showPlaceholder</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowPlaceholder
 * @function
 */


/**
 * Getter for property <code>defaultGroup</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>defaultGroup</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getDefaultGroup
 * @function
 */

/**
 * Setter for property <code>defaultGroup</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDefaultGroup  new value for property <code>defaultGroup</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setDefaultGroup
 * @function
 */


/**
 * Getter for property <code>isLastGroup</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>isLastGroup</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getIsLastGroup
 * @function
 */

/**
 * Setter for property <code>isLastGroup</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIsLastGroup  new value for property <code>isLastGroup</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setIsLastGroup
 * @function
 */


/**
 * Getter for property <code>headerText</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>headerText</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getHeaderText
 * @function
 */

/**
 * Setter for property <code>headerText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sHeaderText  new value for property <code>headerText</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setHeaderText
 * @function
 */


/**
 * Getter for property <code>headerLevel</code>.
 *
 * Default value is <code>H2</code>
 *
 * @return {sap.m.HeaderLevel} the value of property <code>headerLevel</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getHeaderLevel
 * @function
 */

/**
 * Setter for property <code>headerLevel</code>.
 *
 * Default value is <code>H2</code> 
 *
 * @param {sap.m.HeaderLevel} oHeaderLevel  new value for property <code>headerLevel</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setHeaderLevel
 * @function
 */


/**
 * Getter for property <code>groupHeaderLevel</code>.
 * Header level (H1-H6) used for headers of tile groups.
 *
 * Default value is <code>H4</code>
 *
 * @return {sap.m.HeaderLevel} the value of property <code>groupHeaderLevel</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getGroupHeaderLevel
 * @function
 */

/**
 * Setter for property <code>groupHeaderLevel</code>.
 *
 * Default value is <code>H4</code> 
 *
 * @param {sap.m.HeaderLevel} oGroupHeaderLevel  new value for property <code>groupHeaderLevel</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setGroupHeaderLevel
 * @function
 */


/**
 * Getter for property <code>showGroupHeader</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showGroupHeader</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowGroupHeader
 * @function
 */

/**
 * Setter for property <code>showGroupHeader</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowGroupHeader  new value for property <code>showGroupHeader</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowGroupHeader
 * @function
 */


/**
 * Getter for property <code>visible</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getVisible
 * @function
 */

/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setVisible
 * @function
 */


/**
 * Getter for property <code>sortable</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>sortable</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getSortable
 * @function
 */

/**
 * Setter for property <code>sortable</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bSortable  new value for property <code>sortable</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setSortable
 * @function
 */


/**
 * Getter for property <code>showNoData</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showNoData</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowNoData
 * @function
 */

/**
 * Setter for property <code>showNoData</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowNoData  new value for property <code>showNoData</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowNoData
 * @function
 */


/**
 * Getter for property <code>noDataText</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>noDataText</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getNoDataText
 * @function
 */

/**
 * Setter for property <code>noDataText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sNoDataText  new value for property <code>noDataText</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setNoDataText
 * @function
 */


/**
 * Getter for property <code>isGroupLocked</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {boolean} the value of property <code>isGroupLocked</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getIsGroupLocked
 * @function
 */

/**
 * Setter for property <code>isGroupLocked</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {boolean} bIsGroupLocked  new value for property <code>isGroupLocked</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setIsGroupLocked
 * @function
 */


/**
 * Getter for property <code>editMode</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>editMode</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getEditMode
 * @function
 */

/**
 * Setter for property <code>editMode</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bEditMode  new value for property <code>editMode</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setEditMode
 * @function
 */


/**
 * Getter for property <code>showBackground</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showBackground</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowBackground
 * @function
 */

/**
 * Setter for property <code>showBackground</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowBackground  new value for property <code>showBackground</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowBackground
 * @function
 */


/**
 * Getter for property <code>icon</code>.
 *
 * Default value is <code>sap-icon://locked</code>
 *
 * @return {string} the value of property <code>icon</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getIcon
 * @function
 */

/**
 * Setter for property <code>icon</code>.
 *
 * Default value is <code>sap-icon://locked</code> 
 *
 * @param {string} sIcon  new value for property <code>icon</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setIcon
 * @function
 */


/**
 * Getter for property <code>showIcon</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showIcon</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowIcon
 * @function
 */

/**
 * Setter for property <code>showIcon</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowIcon  new value for property <code>showIcon</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowIcon
 * @function
 */


/**
 * Getter for property <code>deluminate</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>deluminate</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getDeluminate
 * @function
 */

/**
 * Setter for property <code>deluminate</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDeluminate  new value for property <code>deluminate</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setDeluminate
 * @function
 */


/**
 * Getter for property <code>showMobileActions</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showMobileActions</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowMobileActions
 * @function
 */

/**
 * Setter for property <code>showMobileActions</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowMobileActions  new value for property <code>showMobileActions</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowMobileActions
 * @function
 */


/**
 * Getter for property <code>enableHelp</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>enableHelp</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getEnableHelp
 * @function
 */

/**
 * Setter for property <code>enableHelp</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bEnableHelp  new value for property <code>enableHelp</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setEnableHelp
 * @function
 */


/**
 * Getter for property <code>tileActionModeActive</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>tileActionModeActive</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getTileActionModeActive
 * @function
 */

/**
 * Setter for property <code>tileActionModeActive</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bTileActionModeActive  new value for property <code>tileActionModeActive</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setTileActionModeActive
 * @function
 */


/**
 * Getter for property <code>ieHtml5DnD</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>ieHtml5DnD</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getIeHtml5DnD
 * @function
 */

/**
 * Setter for property <code>ieHtml5DnD</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bIeHtml5DnD  new value for property <code>ieHtml5DnD</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setIeHtml5DnD
 * @function
 */


/**
 * Getter for property <code>showDragIndicator</code>.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showDragIndicator</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getShowDragIndicator
 * @function
 */

/**
 * Setter for property <code>showDragIndicator</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowDragIndicator  new value for property <code>showDragIndicator</code>
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#setShowDragIndicator
 * @function
 */


/**
 * Getter for aggregation <code>tiles</code>.<br/>
 * 
 * @return {sap.ushell.ui.launchpad.Tile[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getTiles
 * @function
 */


/**
 * Inserts a tile into the aggregation named <code>tiles</code>.
 *
 * @param {sap.ushell.ui.launchpad.Tile}
 *          oTile the tile to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the tile should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the tile is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the tile is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertTile
 * @function
 */

/**
 * Adds some tile <code>oTile</code> 
 * to the aggregation named <code>tiles</code>.
 *
 * @param {sap.ushell.ui.launchpad.Tile}
 *            oTile the tile to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addTile
 * @function
 */

/**
 * Removes an tile from the aggregation named <code>tiles</code>.
 *
 * @param {int | string | sap.ushell.ui.launchpad.Tile} vTile the tile to remove or its index or id
 * @return {sap.ushell.ui.launchpad.Tile} the removed tile or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeTile
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>tiles</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ushell.ui.launchpad.Tile[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllTiles
 * @function
 */

/**
 * Checks for the provided <code>sap.ushell.ui.launchpad.Tile</code> in the aggregation named <code>tiles</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ushell.ui.launchpad.Tile}
 *            oTile the tile whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfTile
 * @function
 */
	

/**
 * Destroys all the tiles in the aggregation 
 * named <code>tiles</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyTiles
 * @function
 */


/**
 * Getter for aggregation <code>links</code>.<br/>
 * 
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getLinks
 * @function
 */


/**
 * Inserts a link into the aggregation named <code>links</code>.
 *
 * @param {sap.ushell.ui.launchpad.LinkTileWrapper}
 *          oLink the link to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the link should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the link is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the link is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertLink
 * @function
 */

/**
 * Adds some link <code>oLink</code> 
 * to the aggregation named <code>links</code>.
 *
 * @param {sap.ushell.ui.launchpad.LinkTileWrapper}
 *            oLink the link to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addLink
 * @function
 */

/**
 * Removes an link from the aggregation named <code>links</code>.
 *
 * @param {int | string | sap.ushell.ui.launchpad.LinkTileWrapper} vLink the link to remove or its index or id
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper} the removed link or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeLink
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>links</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ushell.ui.launchpad.LinkTileWrapper[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllLinks
 * @function
 */

/**
 * Checks for the provided <code>sap.ushell.ui.launchpad.LinkTileWrapper</code> in the aggregation named <code>links</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ushell.ui.launchpad.LinkTileWrapper}
 *            oLink the link whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfLink
 * @function
 */
	

/**
 * Destroys all the links in the aggregation 
 * named <code>links</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyLinks
 * @function
 */


/**
 * Getter for aggregation <code>beforeContent</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getBeforeContent
 * @function
 */


/**
 * Inserts a beforeContent into the aggregation named <code>beforeContent</code>.
 *
 * @param {sap.ui.core.Control}
 *          oBeforeContent the beforeContent to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the beforeContent should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the beforeContent is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the beforeContent is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertBeforeContent
 * @function
 */

/**
 * Adds some beforeContent <code>oBeforeContent</code> 
 * to the aggregation named <code>beforeContent</code>.
 *
 * @param {sap.ui.core.Control}
 *            oBeforeContent the beforeContent to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addBeforeContent
 * @function
 */

/**
 * Removes an beforeContent from the aggregation named <code>beforeContent</code>.
 *
 * @param {int | string | sap.ui.core.Control} vBeforeContent the beforeContent to remove or its index or id
 * @return {sap.ui.core.Control} the removed beforeContent or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeBeforeContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>beforeContent</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllBeforeContent
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>beforeContent</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oBeforeContent the beforeContent whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfBeforeContent
 * @function
 */
	

/**
 * Destroys all the beforeContent in the aggregation 
 * named <code>beforeContent</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyBeforeContent
 * @function
 */


/**
 * Getter for aggregation <code>afterContent</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getAfterContent
 * @function
 */


/**
 * Inserts a afterContent into the aggregation named <code>afterContent</code>.
 *
 * @param {sap.ui.core.Control}
 *          oAfterContent the afterContent to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the afterContent should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the afterContent is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the afterContent is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertAfterContent
 * @function
 */

/**
 * Adds some afterContent <code>oAfterContent</code> 
 * to the aggregation named <code>afterContent</code>.
 *
 * @param {sap.ui.core.Control}
 *            oAfterContent the afterContent to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addAfterContent
 * @function
 */

/**
 * Removes an afterContent from the aggregation named <code>afterContent</code>.
 *
 * @param {int | string | sap.ui.core.Control} vAfterContent the afterContent to remove or its index or id
 * @return {sap.ui.core.Control} the removed afterContent or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAfterContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>afterContent</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllAfterContent
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>afterContent</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oAfterContent the afterContent whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfAfterContent
 * @function
 */
	

/**
 * Destroys all the afterContent in the aggregation 
 * named <code>afterContent</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyAfterContent
 * @function
 */


/**
 * Getter for aggregation <code>footerContent</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getFooterContent
 * @function
 */


/**
 * Inserts a footerContent into the aggregation named <code>footerContent</code>.
 *
 * @param {sap.ui.core.Control}
 *          oFooterContent the footerContent to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the footerContent should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the footerContent is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the footerContent is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertFooterContent
 * @function
 */

/**
 * Adds some footerContent <code>oFooterContent</code> 
 * to the aggregation named <code>footerContent</code>.
 *
 * @param {sap.ui.core.Control}
 *            oFooterContent the footerContent to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addFooterContent
 * @function
 */

/**
 * Removes an footerContent from the aggregation named <code>footerContent</code>.
 *
 * @param {int | string | sap.ui.core.Control} vFooterContent the footerContent to remove or its index or id
 * @return {sap.ui.core.Control} the removed footerContent or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeFooterContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>footerContent</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllFooterContent
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>footerContent</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oFooterContent the footerContent whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfFooterContent
 * @function
 */
	

/**
 * Destroys all the footerContent in the aggregation 
 * named <code>footerContent</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyFooterContent
 * @function
 */


/**
 * Getter for aggregation <code>headerActions</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#getHeaderActions
 * @function
 */


/**
 * Inserts a headerAction into the aggregation named <code>headerActions</code>.
 *
 * @param {sap.ui.core.Control}
 *          oHeaderAction the headerAction to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the headerAction should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the headerAction is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the headerAction is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#insertHeaderAction
 * @function
 */

/**
 * Adds some headerAction <code>oHeaderAction</code> 
 * to the aggregation named <code>headerActions</code>.
 *
 * @param {sap.ui.core.Control}
 *            oHeaderAction the headerAction to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#addHeaderAction
 * @function
 */

/**
 * Removes an headerAction from the aggregation named <code>headerActions</code>.
 *
 * @param {int | string | sap.ui.core.Control} vHeaderAction the headerAction to remove or its index or id
 * @return {sap.ui.core.Control} the removed headerAction or null
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeHeaderAction
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>headerActions</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#removeAllHeaderActions
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>headerActions</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oHeaderAction the headerAction whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#indexOfHeaderAction
 * @function
 */
	

/**
 * Destroys all the headerActions in the aggregation 
 * named <code>headerActions</code>.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#destroyHeaderActions
 * @function
 */


/**
 *
 * @name sap.ushell.ui.launchpad.TileContainer#afterRendering
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself. 
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#attachAfterRendering
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'afterRendering' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#detachAfterRendering
 * @function
 */

/**
 * Fire event afterRendering to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.TileContainer#fireAfterRendering
 * @function
 */


/**
 * Event fired when placeholder is clicked
 *
 * @name sap.ushell.ui.launchpad.TileContainer#add
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'add' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself. 
 *  
 * Event fired when placeholder is clicked
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#attachAdd
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'add' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#detachAdd
 * @function
 */

/**
 * Fire event add to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.TileContainer#fireAdd
 * @function
 */


/**
 * Event fired when title is renamed
 *
 * @name sap.ushell.ui.launchpad.TileContainer#titleChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'titleChange' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself. 
 *  
 * Event fired when title is renamed
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener] Context object to call the event handler with. Defaults to this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/> itself.
 *
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#attachTitleChange
 * @function
 */

/**
 * Detach event handler <code>fnFunction</code> from the 'titleChange' event of this <code>sap.ushell.ui.launchpad.TileContainer</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileContainer#detachTitleChange
 * @function
 */

/**
 * Fire event titleChange to attached listeners.
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ushell.ui.launchpad.TileContainer} <code>this</code> to allow method chaining
 * @protected
 * @name sap.ushell.ui.launchpad.TileContainer#fireTitleChange
 * @function
 */

// Start of sap/ushell/ui/launchpad/TileContainer.js
/*global jQuery, sap*/
/**
 * @name sap.ushell.ui.launchpad.TileContainer
 *
 * @private
 */

(function () {
    "use strict";
    jQuery.sap.require("sap.ushell.override");

    sap.ushell.ui.launchpad.TileContainer.prototype.init = function () {
        jQuery.sap.require("sap.ushell.ui.launchpad.PlusTile");

        this._sDefaultValue = sap.ushell.resources.i18n.getText("new_group_name");
        this._sOldTitle = "";

        this.oIcon = new sap.ui.core.Icon({src: this.getIcon()});
        this.oIcon.addStyleClass('sapUshellContainerIcon');

        this.oPlusTile = new sap.ushell.ui.launchpad.PlusTile({
            groupId : this.getGroupId(),
            press : [ this.fireAdd, this ]
        });
        this.oPlusTile.setParent(this);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.exit = function () {
        if (this.oPlusTile) {
            this.oPlusTile.destroy();
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.onAfterRendering = function () {
        var that = this,
            jqTileContainer;

        if (this.getEnableHelp()) {
            this.oPlusTile.addStyleClass("help-id-plusTile");//xRay help ID
        }

        this.handleNoItemsToDisplayMessage();
        var bEnableRenameLockedGroup = this.getModel() && this.getModel().getProperty("/enableRenameLockedGroup") || false;
        jQuery("#" + this.getId() + "-title").find(this.getHeaderLevel()).click(function () {
            var bEditMode = bEnableRenameLockedGroup || !that.getIsGroupLocked() && !that.getDefaultGroup() && that.getTileActionModeActive();
            that.setEditMode(bEditMode);
        });
        // detecting it is an IE browser with touch screen
        if ((document.documentMode) && (navigator.maxTouchPoints  || navigator.msMaxTouchPoints)) {
            jqTileContainer = jQuery(this.getDomRef());
            // cancel context menu and touch square in IE10 and above
            jqTileContainer.on("MSHoldVisual contextmenu", ".sapUshellTile", function (e) {
                e.preventDefault();
            });
        }
        this.fireAfterRendering();
    };

    // Improve handling of aggregation updates
    sap.ushell.ui.launchpad.TileContainer.prototype.updateAggregation = sap.ushell.override.updateAggregation;
    sap.ushell.ui.launchpad.TileContainer.prototype.updateTiles = function (sReason) {
        var sName = "tiles";
        if (this.isTreeBinding(sName)) {
            // no idea how to handle -> delegate to parent
            sap.ui.base.ManagedObject.prototype.updateAggregation.apply(this, arguments);
        } else {
            jQuery.sap.log.debug("Updating TileContainer. Reason: ", sReason);
            switch (sReason) {
            case "filter":
                try {
                    this.filterTiles(); // may fail if filter broadens after non-filter update
                } catch (ex) {
                    this.updateAggregation(sName);
                }
                break;
            default:
                this.updateAggregation(sName);
            }
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.handleNoItemsToDisplayMessage = function () {
        var tilesBinding = this.getBinding('tiles'),
            isVisibleTiles = tilesBinding && tilesBinding.getContexts().length;
        if (isVisibleTiles) {
            this.$().find(".sapUshellNoFilteredItems").hide();
        } else {
            if (this.getShowNoData()) {
                if (this.getNoDataText()) {
                    this.setNoDataText(this.getNoDataText());
                } else {
                    this.setNoDataText(sap.ushell.resources.i18n.getText("noFilteredItems"));
                }
                this.$().find(".sapUshellNoFilteredItems").show();
            }
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.createMissingElementsInOnScreenElements = function (indexingMaps, elementsToDisplay, indexSearchMissingFilteredElem, bGrouped, aSorters, oBindingInfo, fnaddNewItem, fnAddTileGroup) {
        var path,
            oNewGroup = null,
            sGroup = null,
            j = indexSearchMissingFilteredElem,
            bShowGroupHeader = this.getShowGroupHeader(),
            elementsToDisplayLength = elementsToDisplay.length,
            oGroupHeader;

        for (j = indexSearchMissingFilteredElem; j < elementsToDisplayLength; j++) {
            path = elementsToDisplay[j].getPath();
            //is aBindingContexts[j] not displayed
            if (!indexingMaps.onScreenPathIndexMap[path]) {
                //entry does not exist and should be displayed.
                if (bGrouped && aSorters.length > 0) {
                    oNewGroup = aSorters[0].fnGroup(elementsToDisplay[j]);
                    if (typeof oNewGroup === "string") {
                        oNewGroup = {
                            key: oNewGroup
                        };
                    }
                    if (sGroup === null && j > 0) {
                        sGroup = aSorters[0].fnGroup(elementsToDisplay[j - 1]);
                    }

                    //delete the sGroup logic, check only if not in indexingMaps.onScreenHeaders[oNewGroup.key].
                    if (oNewGroup.key !== sGroup) {
                        if (oBindingInfo.groupHeaderFactory) {
                            oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
                        }

                        if (!indexingMaps.onScreenHeaders[oNewGroup.key]) {
                            fnAddTileGroup(oNewGroup, oGroupHeader);
                            indexingMaps.onScreenHeaders[oNewGroup.key] = {aItemsRefrenceIndex: this.getTiles().length - 1, isVisible: bShowGroupHeader};
                        }
                        sGroup = oNewGroup.key;
                    }
                }
                fnaddNewItem(elementsToDisplay[j]);
                indexingMaps.onScreenPathIndexMap[path] = {aItemsRefrenceIndex: this.getTiles().length - 1, isVisible: true};
            } else {
                //order problem needs to refresh.
                throw true;
            }
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.addNewItem = function (elementToDisplay) {
        var sName = "tiles",
            oAggregationInfo = this.getMetadata().getJSONKeys()[sName],
            oBindingInfo = this.mBindingInfos[sName],
            fnFactory = oBindingInfo.factory,
            addNewItem = jQuery.proxy(function (oContext) {
                var sId = this.getId() + "-" + jQuery.sap.uid(),
                    oClone = fnFactory(sId, oContext);
                oClone.setBindingContext(oContext, oBindingInfo.model);
                this[oAggregationInfo._sMutator](oClone);
            }, this);

        addNewItem(elementToDisplay);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.markVisibleOnScreenElements = function (elementsToDisplay, indexingMaps) {
        var indexSearchMissingFilteredElem = 0,
            path,
            elementsToDisplayLength = elementsToDisplay.length;

        for (indexSearchMissingFilteredElem = 0; indexSearchMissingFilteredElem < elementsToDisplayLength; indexSearchMissingFilteredElem++) {
            path = elementsToDisplay[indexSearchMissingFilteredElem].getPath();
            //is aBindingContexts[j] not displayed
            if (indexingMaps.onScreenPathIndexMap[path]) {
                //entry exists and should be display.
                indexingMaps.onScreenPathIndexMap[path].isVisible = true;
            } else {
                return indexSearchMissingFilteredElem;
            }
        }

        return indexSearchMissingFilteredElem;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.indexOnScreenElements = function (onScreenItems) {
        var path,
            indexOnScreen,
            indexingMaps = {onScreenHeaders: {}, onScreenPathIndexMap: {}},
            onScreenItemsLength = onScreenItems.length,
            curOnScreenItem;

        for (indexOnScreen = 0; indexOnScreen < onScreenItemsLength; indexOnScreen++) {
            curOnScreenItem = onScreenItems[indexOnScreen];
            if (curOnScreenItem.getHeaderText) {
                //it is a header
                indexingMaps.onScreenHeaders[curOnScreenItem.getHeaderText()] = {aItemsRefrenceIndex: indexOnScreen, isVisible: false};
            } else if (curOnScreenItem.getBindingContext()) {
                //it is a tile
                path = curOnScreenItem.getBindingContext().getPath();
                indexingMaps.onScreenPathIndexMap[path] = {aItemsRefrenceIndex: indexOnScreen, isVisible: false};
            }
        }

        return indexingMaps;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.showHideTilesAndHeaders = function (indexingMaps, onScreenItems) {
        var scrPathKey,
            sName = "tiles",
            bShowGroupHeader = this.getShowGroupHeader(),
            oBinding = this.mBindingInfos[sName].binding,
            groupHeader,
            realItem,
            entry;

        for (scrPathKey in indexingMaps.onScreenPathIndexMap) {
            if (indexingMaps.onScreenPathIndexMap.hasOwnProperty(scrPathKey)) {
                entry = indexingMaps.onScreenPathIndexMap[scrPathKey];
                realItem = onScreenItems[entry.aItemsRefrenceIndex];
                realItem.setVisible(entry.isVisible);

                //set the corresponding header to be displayed.
                if (entry.isVisible) {
                    groupHeader = oBinding.aSorters[0].fnGroup(realItem.getBindingContext());
                    indexingMaps.onScreenHeaders[groupHeader].isVisible = bShowGroupHeader;
                }
            }
        }

        //show headers...
        for (scrPathKey in indexingMaps.onScreenHeaders) {
            if (indexingMaps.onScreenHeaders.hasOwnProperty(scrPathKey)) {
                entry = indexingMaps.onScreenHeaders[scrPathKey];
                onScreenItems[entry.aItemsRefrenceIndex].setVisible(entry.isVisible);
            }
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.filterTiles = function () {
        var sName = "tiles",
            oBindingInfo = this.mBindingInfos[sName],
            oBinding = this.mBindingInfos[sName].binding,
            aBindingContexts = oBinding.getContexts(),
            aItems = this.getTiles(),
            indexSearchMissingFilteredElem,
            indexingMaps,
            lastDomPath,
            firstFltrPath,
            spLastOnScreen,
            spFirstOnFilter,
            indexFirstOnFilter,
            indexLastOnScreen;

        //index the on screen elements according to the path
        indexingMaps = this.indexOnScreenElements(aItems);

        //search for the missing filtered elements
        indexSearchMissingFilteredElem = this.markVisibleOnScreenElements(aBindingContexts, indexingMaps);

        //validate data is still can be added to the screen object and still the ordering will be ok else call refresh.
        if (aBindingContexts[indexSearchMissingFilteredElem] && this.getTiles().length > 0) {
            lastDomPath = this.getTiles()[this.getTiles().length - 1].getBindingContext().getPath();
            firstFltrPath = aBindingContexts[indexSearchMissingFilteredElem].getPath();
            spLastOnScreen = lastDomPath.split('/');
            spFirstOnFilter = firstFltrPath.split('/');
            indexLastOnScreen = spLastOnScreen[spLastOnScreen.length - 1];
            indexFirstOnFilter = spFirstOnFilter[spFirstOnFilter.length - 1];
            if (parseInt(indexLastOnScreen, 10) > parseInt(indexFirstOnFilter, 10)) {
                throw true;
            }
        }

        //add the missing elements and check if there is a need for header.
        this.createMissingElementsInOnScreenElements(indexingMaps, aBindingContexts, indexSearchMissingFilteredElem, oBinding.isGrouped(), oBinding.aSorters, oBindingInfo, this.addNewItem.bind(this), this.addTileGroup.bind(this));

        aItems = this.getTiles();

        //show/ hide all the tiles ...
        this.showHideTilesAndHeaders(indexingMaps, aItems);
        this.handleNoItemsToDisplayMessage();
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.addTileGroup = function (oGroup, oHeader) {
        this.addAggregation("tiles", oHeader || new sap.ushell.ui.launchpad.HeaderTile({
            headerText: oGroup.text || oGroup.key,
            headerLevel : oGroup.headerLevel || this.getGroupHeaderLevel(),
            visible : this.getShowGroupHeader()
        }).addStyleClass("sapUshellTileContainerHdr"));
    };

    // Override setters
    sap.ushell.ui.launchpad.TileContainer.prototype.setNoDataText = function (oNoDataText) {
        this.setProperty("noDataText", oNoDataText, true); // suppress rerendering
        if (this.getShowNoData()) {
            this.$().find(".sapUshellNoFilteredItems").text(oNoDataText);
        }
        return this;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setGroupId = function (v) {
        this.setProperty("groupId", v, true);        // set property, but suppress rerendering
        if (this.oPlusTile) {
            this.oPlusTile.setGroupId(v);
        }
        return this;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setHeaderText = function (sHeaderText) {
        this.setProperty("headerText", sHeaderText, true);        // set property, but suppress rerendering
        this.$().find(".sapUshellContainerTitle").text(sHeaderText);
        return this;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setVisible = function (bVisible) {
        this.setProperty("visible", bVisible, true);  // suppress rerendering
        this.toggleStyleClass("sapUshellHidden", !bVisible);
        return this;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setShowMobileActions = function (bShowMobileActions) {
        var bSupressRerendering = true;

        if (this.oHeaderButton) {
            this.oHeaderButton.setVisible(bShowMobileActions);
        } else if (bShowMobileActions) {
            bSupressRerendering = false;
        }
        this.setProperty('showMobileActions', bShowMobileActions, bSupressRerendering);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setShowIcon = function (bShowIcon) {
        this.setProperty('showIcon', bShowIcon, true);  // suppress rerendering
        jQuery('#' + this.getId()).find('.' + 'sapUshellContainerIcon').toggleClass('sapUshellContainerIconHidden', !bShowIcon);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setDeluminate = function (bDeluminate) {
        this.setProperty('deluminate', bDeluminate, true);  // suppress rerendering
        this.toggleStyleClass('sapUshellDisableLockedGroupDuringDrag', bDeluminate);
        return this;
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.groupHasVisibleTiles = function () {
        var sPath = '',
            tiles = this.getTiles(),
            links = this.getLinks();
        if (this.getBindingContext()) {
            sPath = this.getBindingContext().sPath;
            tiles = this.getModel().getProperty(sPath).tiles;
            links = this.getModel().getProperty(sPath).links;
        }
        return sap.ushell.utils.groupHasVisibleTiles(tiles, links);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.getInnerContainerDomRef = function () {
        var containerDOM = this.getDomRef(),
            innnerContainer;
        if (!containerDOM) {
            return null;
        }
        innnerContainer = jQuery(containerDOM).find('.sapUshellTilesContainer-sortable');
        return innnerContainer[0];
    };

    sap.ushell.ui.launchpad.TileContainer.prototype.setEditMode = function (bValue) {
        this.setProperty('editMode', bValue, false);
        if (bValue) {
            this.addStyleClass('sapUshellEditing');
            this._startEdit();
        } else {
            this.removeStyleClass('sapUshellEditing');
        }
    };

    sap.ushell.ui.launchpad.TileContainer.prototype._startEdit = function () {
        // create Input for header text editing if not exists
        if (this.getModel() && !this.getModel().getProperty("/editTitle")) {
            this.getModel().setProperty("/editTitle", true, false);
        }
        if (!this.oEditInputField) {
            jQuery.sap.require("sap.m.Input");
            var that = this;
            this.oEditInputField = new sap.m.Input({
                placeholder: this._sDefaultValue,
                value: this.getHeaderText()
            }).addStyleClass('sapUshellTileContainerTitleInput');

            this.oEditInputField.addEventDelegate({
                onfocusout: function (oEvent) {
                    // var oTileContainerTitle = oEvent.srcControl,
                    //     jqGroupTitle = jQuery(oTileContainerTitle.getDomRef()).prev();
                    that._stopEdit();
                    jQuery.proxy(that.setEditMode, that, false)();
                },
                onsapenter: function (oEvent) {
                    that._stopEdit();
                    jQuery.proxy(that.setEditMode, that, false)();
                    setTimeout(function () {
                        sap.ushell.renderers.fiori2.AccessKeysHandler.setTabIndexOnTileContainerHeader(jQuery(that.getDomRef()));
                        var oTileContainerTitle = oEvent.srcControl,
                            jqGroupTitle = jQuery(oTileContainerTitle.getDomRef()).prev();

                        jqGroupTitle.focus();
                    }, 0);
                }
            });
        }

        this._sOldTitle = this._sDefaultValue;
        this.oEditInputField.setValue(this.getHeaderText());
        var that = this;
        //Text Selection & focus on input field
        setTimeout(function () {
            if (sap.ui.Device.system.phone) {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("launchpad", "scrollToGroup", {
                    group : that,
                    groupChanged : false,
                    focus : false
                });
            }

            jQuery(that.oEditInputField.getDomRef()).find('input').focus();
            that.oEditInputField.selectText(0, that.oEditInputField.getValue().length);
        }, 100);
    };

    sap.ushell.ui.launchpad.TileContainer.prototype._stopEdit = function () {

        var sCurrentTitle = this.getHeaderText();
        var sNewTitle = this.oEditInputField.getValue(),
            bHasChanged;
        sNewTitle = sNewTitle.trim() || this._sDefaultValue;
        bHasChanged = sNewTitle !== sCurrentTitle;

        if (this.getModel() && this.getModel().getProperty("/editTitle")) {
            this.getModel().setProperty("/editTitle", false, false);
        }

        if (!this._sOldTitle) {

            this._sOldTitle = sCurrentTitle;
            this.setHeaderText(sCurrentTitle);

        } else if (bHasChanged) {
            this.fireTitleChange({
                newTitle: sNewTitle
            });
            this.setHeaderText(sNewTitle);
        }
    };


    sap.ushell.ui.launchpad.TileContainer.prototype.exit = function () {
        if (this.oHeaderButton) {
            this.oHeaderButton.destroy();
        }
        if (this.oActionSheet) {
            this.oActionSheet.destroy();
        }
        //Call the parent sap.m.Button exit method
        if (sap.ui.core.Control.prototype.exit) {
            sap.ui.core.Control.prototype.exit.apply(this, arguments);
        }
    };

}());
