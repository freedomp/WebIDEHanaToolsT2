/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.ProcessFlowConnectionLabel.
jQuery.sap.declare("sap.suite.ui.commons.ProcessFlowConnectionLabel");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ProcessFlowConnectionLabel.
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
 * <li>{@link #getPriority priority} : int (default: 0)</li>
 * <li>{@link #getState state} : sap.suite.ui.commons.ProcessFlowConnectionLabelState (default: sap.suite.ui.commons.ProcessFlowConnectionLabelState.Neutral)</li></ul>
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
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * This control is used inside the ProcessFlow control providing information on connections.
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.suite.ui.commons.ProcessFlowConnectionLabel", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {
		"priority" : {type : "int", group : "Misc", defaultValue : 0},
		"state" : {type : "sap.suite.ui.commons.ProcessFlowConnectionLabelState", group : "Appearance", defaultValue : sap.suite.ui.commons.ProcessFlowConnectionLabelState.Neutral}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.ProcessFlowConnectionLabel with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel.extend
 * @function
 */


/**
 * Getter for property <code>priority</code>.
 * Priority is used to define which label is visible if the state of multiple labels is equal. Assuming there are multiple labels with equal state (e.g. Negative state appears twice), the priority decides which one needs to be selected.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>priority</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel#getPriority
 * @function
 */

/**
 * Setter for property <code>priority</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iPriority  new value for property <code>priority</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnectionLabel} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel#setPriority
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * Specifies the state of the connection label. If multiple labels are available for one connection, the label will be selected by state based on the following order: Neutral -> Positive -> Critical -> Negative.
 *
 * Default value is <code>Neutral</code>
 *
 * @return {sap.suite.ui.commons.ProcessFlowConnectionLabelState} the value of property <code>state</code>
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>Neutral</code> 
 *
 * @param {sap.suite.ui.commons.ProcessFlowConnectionLabelState} oState  new value for property <code>state</code>
 * @return {sap.suite.ui.commons.ProcessFlowConnectionLabel} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.ProcessFlowConnectionLabel#setState
 * @function
 */

// Start of sap/suite/ui/commons/ProcessFlowConnectionLabel.js
/**
 * This file defines the behavior for the control.
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bNavigationFocus = false;
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bSelected = false;
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bHighlighted = false;
/* resource bundle for the localized strings */
sap.suite.ui.commons.ProcessFlowNode.prototype._oResBundle = null;
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._bDimmed = false;

/* --- Event Handling --- */

/**
 * Init function for current control
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.init = function () {
  //Handle base class call
  if (sap.m.Button.prototype.init) {
    sap.m.Button.prototype.init.apply(this, arguments);
  }

  this.addStyleClass("sapSuiteUiCommonsProcessFlowConnectionLabel");
  if (!this._oResBundle) {
    this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
  }
};

/**
 * Method is executed before rendering of ProcessFlowConnectionLabel is triggered.
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.onBeforeRendering = function () {
  this._configureStateClasses();
  this._setLabelWidth();
  this._setAriaDetails();
};

/* --- Getters and Setters --- */

/**
 * Gets the current navigation focus.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getNavigationFocus = function () {
  return this._bNavigationFocus;
};

/**
 * Sets the current navigation focus.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setNavigationFocus = function (navigationFocus) {
  this._bNavigationFocus = navigationFocus;
};

/**
 * Get the selected value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setSelected = function (selected) {
  this._bSelected = selected;
};

/**
 * Sets the selected value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getSelected = function () {
  return this._bSelected;
};

/**
 * Sets the highlighted value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setHighlighted = function (highlighted) {
  this._bHighlighted = highlighted;
};

/**
 * Get the highlighted value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getHighlighted = function () {
  return this._bHighlighted;
};

/**
 * Sets the dimmed value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setDimmed = function (dimmed) {
  this._bDimmed = dimmed;
};

/**
 * Get the dimmed value.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._getDimmed = function () {
  return this._bDimmed;
};

/**
 * Overwrites setWidth of base control.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.setWidth = function () {
  //Avoids manual set of width. Only possible in init by control itself.
};

/**
 * Overwrites setIconFirst of base control.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype.setIconFirst = function () {
  //Avoids manual set of iconFirst. Not supported by control
};

/**
 * Sets the width of the label, based on icon and text.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setLabelWidth = function () {
  if (this.getIcon()) {
    if (this.getText()) {
      this.setProperty("width", "4.5rem", false);
    } else {
      this.setProperty("width", "2rem", false);
    }
  } else {
    if (this.getText() && this.getText().length > 2) {
      this.setProperty("width", "4.5rem", false);
    } else {
      this.setProperty("width", "2rem", false);
    }
  }
};

/* --- Helpers --- */

/**
 * Configures the CSS classes based on state.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._configureStateClasses = function () {
  switch (this.getState()) {
    case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Positive:
      this.addStyleClass("labelStatePositive");
      break;
    case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Critical:
      this.addStyleClass("labelStateCritical");
      break;
    case sap.suite.ui.commons.ProcessFlowConnectionLabelState.Negative:
      this.addStyleClass("labelStateNegative");
      break;
    default:
      this.addStyleClass("labelStateNeutral");
  }

  if (this._getDimmed()) {
    this.addStyleClass("labelDimmed");
  } else {
    this.removeStyleClass("labelDimmed");
  }
  if (this._getSelected()) {
    this.addStyleClass("labelSelected");
  } else {
    this.removeStyleClass("labelSelected");
  }
  if (this._getHighlighted()) {
    this.addStyleClass("labelHighlighted");
  } else {
    this.removeStyleClass("labelHighlighted");
  }
};

/**
 * Sets the ARIA details.
 *
 * @private
 */
sap.suite.ui.commons.ProcessFlowConnectionLabel.prototype._setAriaDetails = function() {
  //General information that the control is a connection label
  var oInvisibleLabelText = new sap.ui.core.InvisibleText();
  oInvisibleLabelText.setText(this._oResBundle.getText('PF_CONNECTIONLABEL'));
  oInvisibleLabelText.toStatic(); //Be aware that without a call the screen reader does not read the content.

  //Add specific button information
  var oInvisibleLabelContent = new sap.ui.core.InvisibleText();
  oInvisibleLabelContent.setText(this.getText());
  oInvisibleLabelContent.toStatic(); //Be aware that without a call the screen reader does not read the content.

  if (this.getAriaLabelledBy().length === 0) {
    this.addAriaLabelledBy(oInvisibleLabelText);
    this.addAriaLabelledBy(oInvisibleLabelContent);
  }
};