/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.ProcessFlowConnection.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowConnection");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ProcessFlowConnection.
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
 * <li>{@link #getDrawData drawData} : object[]</li>
 * <li>{@link #getZoomLevel zoomLevel} : sap.suite.ui.commons.ProcessFlowZoomLevel (default: sap.suite.ui.commons.ProcessFlowZoomLevel.Two)</li>
 * <li>{@link #getType type} : sap.suite.ui.commons.ProcessFlowConnectionType (default: sap.suite.ui.commons.ProcessFlowConnectionType.Normal)</li>
 * <li>{@link #getState state} : sap.suite.ui.commons.ProcessFlowConnectionState (default: sap.suite.ui.commons.ProcessFlowConnectionState.Regular)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * This control is used inside the ProcessFlow control to connect process flow node A with process flow node B in respect to the style(x) chosen by the application.
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnection
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.suite.ui.commons.ProcessFlowConnection", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {
		"drawData" : {type : "object[]", group : "Misc", defaultValue : null},
		"zoomLevel" : {type : "sap.suite.ui.commons.ProcessFlowZoomLevel", group : "Misc", defaultValue : sap.suite.ui.commons.ProcessFlowZoomLevel.Two},
		"type" : {type : "sap.suite.ui.commons.ProcessFlowConnectionType", group : "Appearance", defaultValue : sap.suite.ui.commons.ProcessFlowConnectionType.Normal, deprecated: true},
		"state" : {type : "sap.suite.ui.commons.ProcessFlowConnectionState", group : "Appearance", defaultValue : sap.suite.ui.commons.ProcessFlowConnectionState.Regular, deprecated: true}
	},
	defaultAggregation : "_labels",
	aggregations : {
		"_labels" : {type : "sap.suite.ui.commons.ProcessFlowConnectionLabel", multiple : true, singularName : "_label", visibility : "hidden"}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlowConnection with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ProcessFlowConnection.extend
 * @function
 */


/**
 * Getter for property <code>drawData</code>.
 * This is an array of the following attributes for one element:
 * 1. flowLine (string) - A connection definition where the line should be drawn. A string which defines a course of a flow line. A flow line is a connection between nodes in a process flow control. The string can contain the following characters:
 * - "r" for right,
 * - "t" for top,
 * - "l" for left,
 * - "b" for bottom.
 * 2. targetNodeState (ProcessFlowNodeState) - A copy of the target node status. If the target node is created, the line is solid.
 * If the target node is planned, the line is dashed.
 * 3. displayState (ProcessFlowDisplayState) - Display state of the node. This property defines if the node is displayed regularly, highlighted, or dimmed in combination with a selected visual style of the control.
 * 4. hasArrow (boolean) - Indicates if the line has an arrow on the right end.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object[]} the value of property <code>drawData</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnection#getDrawData
 * @function
 */

/**
 * Setter for property <code>drawData</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object[]} aDrawData  new value for property <code>drawData</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnection} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnection#setDrawData
 * @function
 */


/**
 * Getter for property <code>zoomLevel</code>.
 * This is a current zoom level for the connection. The point of connection to the node is derived from zoom level.
 *
 * Default value is <code>Two</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowZoomLevel} the value of property <code>zoomLevel</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnection#getZoomLevel
 * @function
 */

/**
 * Setter for property <code>zoomLevel</code>.
 *
 * Default value is <code>Two</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowZoomLevel} oZoomLevel  new value for property <code>zoomLevel</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnection} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnection#setZoomLevel
 * @function
 */


/**
 * Getter for property <code>type</code>.
 * Type of the connection.
 *
 * Default value is <code>Normal</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowConnectionType} the value of property <code>type</code>
 * @public
 * @deprecated Since version 1.32. 
 * Type is deprecated because of no usages. There will be no replacement.
 * @name sap.suite.ui.commons.ProcessFlowConnection#getType
 * @function
 */

/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Normal</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowConnectionType} oType  new value for property <code>type</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnection} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.32. 
 * Type is deprecated because of no usages. There will be no replacement.
 * @name sap.suite.ui.commons.ProcessFlowConnection#setType
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * State of the connection.
 *
 * Default value is <code>Regular</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowConnectionState} the value of property <code>state</code>
 * @public
 * @deprecated Since version 1.32. 
 * State is deprecated because of no usages. There will be no replacement.
 * @name sap.suite.ui.commons.ProcessFlowConnection#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>Regular</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowConnectionState} oState  new value for property <code>state</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnection} <code>this</code> to allow method chaining
 * @public
 * @deprecated Since version 1.32. 
 * State is deprecated because of no usages. There will be no replacement.
 * @name sap.suite.ui.commons.ProcessFlowConnection#setState
 * @function
 */

// Start of sap/suite/ui/commons/ProcessFlowConnection.js
/* Resource bundle for the localized strings. */
sap.suite.ui.commons.ProcessFlowConnection.prototype._oResBundle = null;

/* Internal property to hand over showLabels from parent control. */
sap.suite.ui.commons.ProcessFlowConnection.prototype._showLabels = null;

/* Defines the order of states from low to high priority. */
sap.suite.ui.commons.ProcessFlowConnection.prototype._oStateOrderMapping = null;

/**
 * This file defines behavior for the control.
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype.init = function () {
  if (!this._oResBundle) {
    this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }

  this._oStateOrderMapping = {};
  this._oStateOrderMapping[sap.suite.ui.commons.ProcessFlowConnectionLabelState.Neutral] = 1;
  this._oStateOrderMapping[sap.suite.ui.commons.ProcessFlowConnectionLabelState.Positive] = 2;
  this._oStateOrderMapping[sap.suite.ui.commons.ProcessFlowConnectionLabelState.Critical] = 3;
  this._oStateOrderMapping[sap.suite.ui.commons.ProcessFlowConnectionLabelState.Negative] = 4;
};

/**
 * Create connection object depends on draw data.
 *
 * @private
 * @returns {object} connection
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._traverseConnectionData = function () { // EXC_SAP_006_1
  var aConnectionData = this.getDrawData();
  if (!aConnectionData) {
    return {};
  }
  var traversedConnection = this._createConnection(aConnectionData);
  if (this.getAggregation("_labels")) {
    traversedConnection.labels = this.getAggregation("_labels");
  }
  return traversedConnection;
};

/**
 * Adds connection data.
 *
 * @public
 * @param {object} singleConnectionData
 * @returns {Array} connectionData
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype.addConnectionData = function (singleConnectionData) {
  var tempConnectionData = this.getDrawData();
  if (!tempConnectionData) {
    tempConnectionData = [];
  }
  tempConnectionData.push(singleConnectionData);
  this.setDrawData(tempConnectionData);
  return tempConnectionData;
};

/**
 * Returns ARIA text for current connection object.
 *
 * @private
 * @param {Object} The traversed connection object
 * @returns {String} The Aria result text for the connection
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._getAriaText = function (traversedConnection) {
  var sAriaText = "";
  var withArrowValue = " " + this._oResBundle.getText('PF_CONNECTION_ENDS');
  if (this._isHorizontalLine(traversedConnection)) {
    sAriaText = this._oResBundle.getText('PF_CONNECTION_HORIZONTAL_LINE');
    if (traversedConnection.arrow) {
      sAriaText += withArrowValue;
    }
  } else if (this._isVerticalLine(traversedConnection)) {
    sAriaText = this._oResBundle.getText('PF_CONNECTION_VERTICAL_LINE');
    if (traversedConnection.arrow) {
      sAriaText += withArrowValue;
    }
  } else {
    sAriaText = this._oResBundle.getText('PF_CONNECTION_BRANCH');
    if (traversedConnection.arrow) {
      sAriaText += withArrowValue;
    }
  }
  return sAriaText;
};

/**
 * Checks if the given connection is a vertical line.
 *
 * @private
 * @param {Object} Connection to retrieve information for vertical line from
 * @returns {Boolean}
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._isVerticalLine = function (connection) {
  if (connection.hasOwnProperty("left") && !connection.left.draw &&
    connection.hasOwnProperty("right") && !connection.right.draw &&
    connection.hasOwnProperty("top") && connection.top.draw &&
    connection.hasOwnProperty("bottom") && connection.bottom.draw) {
    return true;
  } else {
    return false;
  }
};

/**
 * Checks if the given connection is a horizontal line.
 *
 * @private
 * @param {Object} Connection to retrieve information for horizontal line from
 * @returns {Boolean}
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._isHorizontalLine = function (connection) {
  if (connection.hasOwnProperty("left") && connection.left.draw &&
      connection.hasOwnProperty("right") && connection.right.draw &&
      connection.hasOwnProperty("top") && !connection.top.draw &&
      connection.hasOwnProperty("bottom") && !connection.bottom.draw) {
    return true;
  } else {
    return false;
  }
};

/**
 * Creates the connection object using the connection data array.
 * Connection in this context means all lines (top,right,bottom,left)
 *
 * @private
 * @param {Object[]} Array with connection data input to generate connection
 * @returns {Object} The generated connection
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._createConnection = function (aConnectionData) {
  var line = { draw: false, type: "", state: "" };
  var connection = { right: line, top: line, left: line, bottom: line, arrow: false };

  for (var i = 0; i < aConnectionData.length; i++) {
    connection.right = this._createLine(aConnectionData[i], "r", connection.right);
    connection.top = this._createLine(aConnectionData[i], "t", connection.top);
    connection.left = this._createLine(aConnectionData[i], "l", connection.left);
    connection.bottom = this._createLine(aConnectionData[i], "b", connection.bottom);

    if (aConnectionData[i].flowLine.indexOf("r") >= 0) {
      if (aConnectionData[i].hasArrow) {
        connection.arrow = true;
      }
    }
  }
  return connection;
};

/**
 * Creates the line (element of connection) for the given direction based on the connection data.
 * Line in this context means a specific line (e.g. left) of a connection.
 *
 * @private
 * @param {Object} Connection data input
 * @param {String} Flag which direction is looked for
 * @param {Object} Current line information
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._createLine = function (connectionData, direction, line) {
  var oLine = { draw: line.draw, type: line.type, state: line.state };
  if (connectionData.flowLine.indexOf(direction) >= 0) {
    oLine.draw = true;

    //Type
    if (connectionData.targetNodeState === sap.suite.ui.commons.ProcessFlowNodeState.Neutral ||
      connectionData.targetNodeState === sap.suite.ui.commons.ProcessFlowNodeState.Positive ||
      connectionData.targetNodeState === sap.suite.ui.commons.ProcessFlowNodeState.Negative) {
      oLine.type = sap.suite.ui.commons.ProcessFlowConnectionType.Normal;
    } else if (connectionData.targetNodeState === sap.suite.ui.commons.ProcessFlowNodeState.Planned ||
      connectionData.targetNodeState === sap.suite.ui.commons.ProcessFlowNodeState.PlannedNegative) {
      // Planned state cannot override created state.
      if (oLine.type !== sap.suite.ui.commons.ProcessFlowConnectionType.Normal) {
        oLine.type = sap.suite.ui.commons.ProcessFlowConnectionType.Planned;
      }
    }

    //DisplayState
    if (connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Selected ||
        connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlighted ||
        connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.SelectedHighlightedFocused ||
        connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.SelectedFocused) {

      oLine.state = sap.suite.ui.commons.ProcessFlowConnectionState.Selected;

    } else if (connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Highlighted ||
      connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.HighlightedFocused) {

      // Highlighted display state cannot override selected display state.
      if (oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
        oLine.state = sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted;
      }

    } else if (connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Regular ||
      connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.RegularFocused) {

      // Regular display state cannot override selected or highlighted display states.
      if (oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted &&
      oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
        oLine.state = sap.suite.ui.commons.ProcessFlowConnectionState.Regular;
      }

    } else if (connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.Dimmed ||
      connectionData.displayState === sap.suite.ui.commons.ProcessFlowDisplayState.DimmedFocused) {

      // Dimmed display state cannot override highlighted, selected or regular display states.
      if (oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted &&
      oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Regular &&
      oLine.state !== sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
        oLine.state = sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed;
      }
    }
  }
  return oLine;
};

/**
 * Returns the visible label. If multiple labels are available for one connection,
 * the label will be selected by State and Priority.
 * The first criteria is state, based on the order 'Neutral --> Positive --> Critical --> Negative'
 * Assuming there are multiple entries with the same state (e.g. 2x Negative), 
 * the priority decides which one needs to be selected.
 *
 * @private
 * @returns {sap.suite.ui.commons.ProcessFlowConnectionLabel} The visible label
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._getVisibleLabel = function () {
  var oVisibleLabel = null;

  if (this.getAggregation("_labels")) {
    var aLabels = this.getAggregation("_labels");
    for (var i = 0; i < aLabels.length; i++) {
      var oCurrentLabel = aLabels[i];
      if (oCurrentLabel instanceof sap.suite.ui.commons.ProcessFlowConnectionLabel) {
        if (oVisibleLabel) {
          //Selects label to render, based on state.
          if (this._oStateOrderMapping[oVisibleLabel.getState()] < this._oStateOrderMapping[oCurrentLabel.getState()]) {
            oVisibleLabel = oCurrentLabel;
          } else if (this._oStateOrderMapping[oVisibleLabel.getState()] === this._oStateOrderMapping[oCurrentLabel.getState()]) {
            //Selects label to render, based on priority. This is only relevant, if state is the same.
            if (oVisibleLabel.getPriority() < oCurrentLabel.getPriority()) {
              oVisibleLabel = oCurrentLabel;
            }
          }
        } else {
          oVisibleLabel = oCurrentLabel;
        }
      }
    }
  }

  return oVisibleLabel;
};

/**
 * Returns the internal value for showLabels.
 *
 * @private
 * @returns {Boolean} The showLabels value
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._getShowLabels = function () {
 return sap.suite.ui.commons.ProcessFlowConnection.prototype._showLabels;
};

/**
 * Sets the internal value for showLabels.
 *
 * @private
 * @param {Boolean} The showLabels value to set
 */
sap.suite.ui.commons.ProcessFlowConnection.prototype._setShowLabels = function (showLabels) {
 sap.suite.ui.commons.ProcessFlowConnection.prototype._showLabels = showLabels;
};