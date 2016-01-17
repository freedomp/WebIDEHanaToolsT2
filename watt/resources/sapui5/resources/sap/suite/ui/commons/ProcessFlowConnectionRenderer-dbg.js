/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowConnectionRenderer");

/**
 * @class ProcessFlowConnection renderer.
 * @static
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer = {};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @public
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer.render = function (oRm, oControl) {
  var connection = oControl._traverseConnectionData();
  var zoomLevel = oControl.getZoomLevel();
  var oProcessFlowConnectionRenderer = sap.suite.ui.commons.ProcessFlowConnectionRenderer;

  oRm.write("<div");
  oRm.writeAttribute("id", oControl.getId());

  //Writes ARIA details.
  oRm.writeAttribute("role", "textbox");
  oRm.writeAttribute("aria-readonly", true);
  oRm.writeAttributeEscaped("aria-label", oControl._getAriaText(connection));
  oRm.write(">");

  //Writes the lines.
  if (oControl._isHorizontalLine(connection)) {
    oProcessFlowConnectionRenderer._writeHorizontalLine(oRm, connection, zoomLevel, oControl);
  } else if (oControl._isVerticalLine(connection)) {
    oProcessFlowConnectionRenderer._writeVerticalLine(oRm, connection, zoomLevel, oControl._getShowLabels());
  } else {
    oProcessFlowConnectionRenderer._writeSpecialLine(oRm, connection, zoomLevel, oControl);
  }
  oRm.write("</div>");
};

/**
 * Writes the vertical line.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeVerticalLine = function (oRm, connection, zoomLevel, showLabels) {
  // Left column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (showLabels) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxZoom1Width");
      oRm.addClass("boxWideZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxZoom3Width");
      oRm.addClass("boxWideZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxZoom4Width");
      oRm.addClass("boxWideZoom4Height");
      break;
    default:
      oRm.addClass("boxZoom2Width");
      oRm.addClass("boxWideZoom2Height");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Middle column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  oRm.addClass("boxMiddleBorderWidth");
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxWideZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxWideZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxWideZoom4Height");
      break;
    default:
      oRm.addClass("boxWideZoom2Height");
  }
  oRm.addClass("borderLeft");
  if (connection.top.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
    oRm.addClass("borderLeftTypePlanned");
  } else {
    oRm.addClass("borderLeftTypeNormal");
  }
  if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
    oRm.addClass("borderLeftStateHighlighted");
    oRm.addClass("stateHighlighted");
  } else if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
    oRm.addClass("borderLeftStateDimmed");
  } else if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
    oRm.addClass("borderLeftStateSelected");
    oRm.addClass("stateSelected");
  } else {
    oRm.addClass("borderLeftStateRegular");
    oRm.addClass("stateRegular");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Right column
  // Omitted

  sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(oRm);
};

/**
 * Writes the horizontal line.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeHorizontalLine = function (oRm, connection, zoomLevel, oControl) {
  //1st row
  oRm.write("<div");
  oRm.addClass("boxWideWidth");
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxTopZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxTopZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxTopZoom4Height");
      break;
    default:
      oRm.addClass("boxTopZoom2Height");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // 2nd row
  oRm.write("<div");
  if (connection.arrow) {
    // connection column
    oRm.addClass("parentPosition");
    if (oControl._getShowLabels()) {
      oRm.addClass("sapSuiteUiPFWithLabel");
    }
    switch (zoomLevel) {
      case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
        oRm.addClass("boxWideArrowZoom1Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
        oRm.addClass("boxWideArrowZoom3Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
        oRm.addClass("boxWideArrowZoom4Width");
        break;
      default:
        oRm.addClass("boxWideArrowZoom2Width");
    }
  } else {
    oRm.addClass("boxWideWidth");
  }
  oRm.addClass("boxMiddleBorderHeight");
  oRm.addClass("borderBottom");
  if (connection.right.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
    oRm.addClass("borderBottomTypePlanned");
  } else {
    oRm.addClass("borderBottomTypeNormal");
  }
  if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
    oRm.addClass("borderBottomStateHighlighted");
    oRm.addClass("stateHighlighted");
  } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
    oRm.addClass("borderBottomStateDimmed");
  } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
    oRm.addClass("borderBottomStateSelected");
    oRm.addClass("stateSelected");
  } else {
    oRm.addClass("borderBottomStateRegular");
    oRm.addClass("stateRegular");
  }
  oRm.writeClasses();
  oRm.write(">");

  if (connection.labels && oControl._showLabels) {
    sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel(oRm, oControl, connection);
  }

  if (connection.arrow) {
    oRm.write("<div");
    oRm.addClass("arrowRight");
    if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderLeftStateHighlighted");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderLeftStateDimmed");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderLeftStateSelected");
    } else {
      oRm.addClass("borderLeftStateRegular");
    }
    oRm.writeClasses();
    oRm.write(">");
    oRm.write("</div>");
  }
  oRm.write("</div>");

  // 3rd row
  // Omitted
};

/**
 * Writes the special line (e.g. branch or corner).
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSpecialLine = function (oRm, connection, zoomLevel, oControl) {
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine(oRm, connection, zoomLevel, oControl);
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(oRm);
};

/**
 * Writes the first row of a special line (e.g. branch).
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeFirstRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
  // Left column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxZoom1Width");
      oRm.addClass("boxTopZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxZoom3Width");
      oRm.addClass("boxTopZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxZoom4Width");
      oRm.addClass("boxTopZoom4Height");
      break;
    default:
      oRm.addClass("boxZoom2Width");
      oRm.addClass("boxTopZoom2Height");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Middle column
  oRm.write("<div");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  oRm.addClass("floatLeft");
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxTopZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxTopZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxTopZoom4Height");
      break;
    default:
      oRm.addClass("boxTopZoom2Height");
  }
  if (connection.hasOwnProperty("top") && connection.top.draw) {
    oRm.addClass("boxMiddleBorderWidth");
    oRm.addClass("borderLeft");
    if (connection.top.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
      oRm.addClass("borderLeftTypePlanned");
    } else {
      oRm.addClass("borderLeftTypeNormal");
    }
    if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderLeftStateHighlighted");
      oRm.addClass("stateHighlighted");
    } else if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderLeftStateDimmed");
    } else if (connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderLeftStateSelected");
      oRm.addClass("stateSelected");
    } else {
      oRm.addClass("borderLeftStateRegular");
      oRm.addClass("stateRegular");
    }
  } else {
    oRm.addClass("boxMiddleWidth");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Right column
  // Omitted
};

/**
 * Writes the second row of a special line (e.g. branch).
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeSecondRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(oRm);

  // Left column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxZoom1Width");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxZoom3Width");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxZoom4Width");
      break;
    default:
      oRm.addClass("boxZoom2Width");
  }
  if (connection.hasOwnProperty("left") && connection.left.draw) {
    oRm.addClass("boxMiddleBorderHeight");
    oRm.addClass("borderBottom");
    if (connection.left.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
      oRm.addClass("borderBottomTypePlanned");
    } else {
      oRm.addClass("borderBottomTypeNormal");
    }
    if (connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderBottomStateHighlighted");
      oRm.addClass("stateHighlighted");
    } else if (connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderBottomStateDimmed");
    } else if (connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderBottomStateSelected");
      oRm.addClass("stateSelected");
    } else {
      oRm.addClass("borderBottomStateRegular");
      oRm.addClass("stateRegular");
    }
  } else {
    oRm.addClass("boxMiddleHeight");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Middle column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  oRm.addClass("boxMiddleWidth");
  oRm.addClass("boxMiddleBorderHeight");
  if ((connection.hasOwnProperty("left") && connection.left.draw) ||
    (connection.hasOwnProperty("right") && connection.right.draw) ||
    (connection.hasOwnProperty("top") && connection.top.draw) ||
    (connection.hasOwnProperty("bottom") && connection.bottom.draw)) {
    oRm.addClass("borderBottom");
    oRm.addClass("borderBottomTypeNormal");
    if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted ||
      connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted ||
      connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted ||
      connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderBottomStateHighlighted");
      oRm.addClass("stateHighlighted");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected ||
      connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected ||
      connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected ||
      connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderBottomStateSelected");
      oRm.addClass("stateSelected");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed ||
      connection.top.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed ||
      connection.left.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed ||
      connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderBottomStateDimmed");
    } else {
      oRm.addClass("borderBottomStateRegular");
      oRm.addClass("stateRegular");
    }
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Right column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  if (connection.arrow) {
    oRm.addClass("parentPosition");
    switch (zoomLevel) {
      case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
        oRm.addClass("boxArrowZoom1Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
        oRm.addClass("boxArrowZoom3Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
        oRm.addClass("boxArrowZoom4Width");
        break;
      default:
        oRm.addClass("boxArrowZoom2Width");
    }
  } else if (oControl._getShowLabels()) {
    switch (zoomLevel) {
      case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
        oRm.addClass("boxZoom1WidthWithLabel");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
        oRm.addClass("boxZoom3WidthWithLabel");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
        oRm.addClass("boxZoom4WidthWithLabel");
        break;
      default:
        oRm.addClass("boxZoom2WidthWithLabel");
    }
  } else {
    switch (zoomLevel) {
      case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
        oRm.addClass("boxZoom1Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
        oRm.addClass("boxZoom3Width");
        break;
      case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
        oRm.addClass("boxZoom4Width");
        break;
      default:
        oRm.addClass("boxZoom2Width");
    }
  }
  if (connection.hasOwnProperty("right") && connection.right.draw) {
    oRm.addClass("boxMiddleBorderHeight");
    oRm.addClass("borderBottom");
    if (connection.right.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
      oRm.addClass("borderBottomTypePlanned");
    } else {
      oRm.addClass("borderBottomTypeNormal");
    }
    if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderBottomStateHighlighted");
      oRm.addClass("stateHighlighted");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderBottomStateDimmed");
    } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderBottomStateSelected");
      oRm.addClass("stateSelected");
    } else {
      oRm.addClass("borderBottomStateRegular");
      oRm.addClass("stateRegular");
    }
  } else {
    oRm.addClass("boxMiddleHeight");
  }
  oRm.writeClasses();
  oRm.write(">");

  if (connection.labels && oControl._showLabels) {
    sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel(oRm, oControl, connection);
  }

  if (connection.arrow) {
    oRm.write("<div");
    oRm.addClass("arrowRight");
    if (connection.hasOwnProperty("right")) {
      if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
        oRm.addClass("borderLeftStateHighlighted");
      } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
        oRm.addClass("borderLeftStateDimmed");
      } else if (connection.right.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
        oRm.addClass("borderLeftStateSelected");
      } else {
        oRm.addClass("borderLeftStateRegular");
      }
    }
    oRm.writeClasses();
    oRm.write(">");
    oRm.write("</div>");
  }
  oRm.write("</div>");
};

/**
 * Writes the third row of a special line (e.g. branch).
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {Object} Connection which needs to be checked
 * @param {Object} Zoom level of control
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._writeThirdRowOfSpecialLine = function (oRm, connection, zoomLevel, oControl) {
  sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat(oRm);

  // Left column
  oRm.write("<div");
  oRm.addClass("floatLeft");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxZoom1Width");
      oRm.addClass("boxBottomZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxZoom3Width");
      oRm.addClass("boxBottomZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxZoom4Width");
      oRm.addClass("boxBottomZoom4Height");
      break;
    default:
      oRm.addClass("boxZoom2Width");
      oRm.addClass("boxBottomZoom2Height");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Middle column
  oRm.write("<div");
  if (oControl._getShowLabels()) {
    oRm.addClass("sapSuiteUiPFWithLabel");
  }
  oRm.addClass("floatLeft");
  switch (zoomLevel) {
    case sap.suite.ui.commons.ProcessFlowZoomLevel.One:
      oRm.addClass("boxBottomZoom1Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Three:
      oRm.addClass("boxBottomZoom3Height");
      break;
    case sap.suite.ui.commons.ProcessFlowZoomLevel.Four:
      oRm.addClass("boxBottomZoom4Height");
      break;
    default:
      oRm.addClass("boxBottomZoom2Height");
  }
  if (connection.hasOwnProperty("bottom") && connection.bottom.draw) {
    oRm.addClass("boxMiddleBorderWidth");
    oRm.addClass("borderLeft");
    if (connection.bottom.type === sap.suite.ui.commons.ProcessFlowConnectionType.Planned) {
      oRm.addClass("borderLeftTypePlanned");
    } else {
      oRm.addClass("borderLeftTypeNormal");
    }
    if (connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Highlighted) {
      oRm.addClass("borderLeftStateHighlighted");
      oRm.addClass("stateHighlighted");
    } else if (connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Dimmed) {
      oRm.addClass("borderLeftStateDimmed");
    } else if (connection.bottom.state === sap.suite.ui.commons.ProcessFlowConnectionState.Selected) {
      oRm.addClass("borderLeftStateSelected");
      oRm.addClass("stateSelected");
    } else {
      oRm.addClass("borderLeftStateRegular");
      oRm.addClass("stateRegular");
    }
  } else {
    oRm.addClass("boxMiddleWidth");
  }
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");

  // Right column
  // Omitted
};

/**
 * Resets the float.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._resetFloat = function (oRm) {
  oRm.write("<div");
  oRm.addClass("floatClear");
  oRm.writeClasses();
  oRm.write(">");
  oRm.write("</div>");
};

/**
 * Renders the label based on criteria like state and priority.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.suite.ui.commons.ProcessFlowConnection} The connection Object
 * @param {sap.suite.ui.commons.ProcessFlowConnection} The traversed connection Object
 */
sap.suite.ui.commons.ProcessFlowConnectionRenderer._renderLabel = function (oRm, oControl) {
  var oLabel = oControl._getVisibleLabel();
  if (oControl.getAggregation("_labels")) {
    var aLabels = oControl.getAggregation("_labels");
    for (var i = 0; i < aLabels.length; i++) {
      if (aLabels[i]._getSelected()) {
        oLabel._setDimmed(false);
        if (aLabels[i].getId() !== oLabel.getId()) {
          oLabel._setSelected(true);
          aLabels[i]._setSelected(false);
        }
      }
    }
  }
  if (oLabel) {
    oRm.renderControl(oLabel);
  }
};