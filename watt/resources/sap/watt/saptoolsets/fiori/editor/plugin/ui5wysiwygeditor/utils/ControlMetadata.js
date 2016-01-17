define(
	[
		"sap/watt/lib/lodash/lodash",
		"./W5gUi5LibraryMediator"
	],
	function (_, W5gUi5LibraryMediator) {
		"use strict";

// Private variables and methods
// Begin
		/**
		 *
		 * @type {sap.ui.dt.DesignTime}
		 * @private
		 */
		var _oDesignTime = null;
// End
// Private variables and methods

		/**
		 *
		 * @param {sap.ui.core.Control|string} vControl
		 * @return {string}
		 * @private
		 */
		function _getControlName(vControl) {
			if (vControl.getMetadata) {
				vControl = vControl.getMetadata().getName();
			}
			return vControl;
		}

		var ControlMetadata = {
			setDesignTime: function (oDesignTime) {
				_oDesignTime = oDesignTime;
			},

			/**
			 * Gets the design time information for the given control
			 *
			 * @param {sap.ui.core.Control|string} vControl control instance of control fully qualified name
			 * @return {object} design time metadata associated with the given control or an empty object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getDesignTimeData
			 * @function
			 * @public
			 */
			getDesignTimeData: function (vControl) {
				return _oDesignTime && _oDesignTime.getDesignTimeMetadata()[_getControlName(vControl)] || {};
			},

			/**
			 * Gets default property value
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @param {string} sPropertyName property name
			 * @return {*} Returns default value if any
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getDefaultPropertyValue
			 * @function
			 * @private
			 */
			getDefaultPropertyValue: function (oControl, sPropertyName) {
				var oMetadata = oControl.getMetadata(),
					oDefaultSettings = ControlMetadata.getDesignTimeData(oControl).defaultSettings,
					oDefaultValue = oDefaultSettings && oDefaultSettings[sPropertyName],
					oProperty, oType;

				if (oDefaultValue === undefined) {
					oProperty = oMetadata.getAllProperties()[sPropertyName];
					oType = sap.ui.base.DataType.getType(oProperty.type);

					if (oProperty && oProperty.defaultValue !== null) {
						oDefaultValue = oProperty.defaultValue;
					} else if (oType && oType.getDefaultValue) {
						oDefaultValue = oType.getDefaultValue();
					}
				}
				return oDefaultValue;
			},

			/**
			 * Returns true if the given <code>oControl</code> is unsupported and false otherwise
			 *
			 * @param {sap.ui.core.Control|string} vControl control instance of control fully qualified name
			 * @returns {boolean} returns true if the given control is unsupported
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isControlUnsupported
			 * @function
			 * @public
			 */
			isControlUnsupported: function (vControl) {
				return !ControlMetadata.getDesignTimeData(vControl).supported;
			},

			/**
			 * Returns true if the given <code>vControl</code> is unsupported and false otherwise
			 *
			 * @param {sap.ui.core.Control|string} vControl control
			 * @returns {boolean} returns true if the control is unsupported
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isControlToBeSupported
			 * @function
			 * @public
			 */
			isControlToBeSupported: function (vControl) {
				return !W5gUi5LibraryMediator.isControlSupported(_getControlName(vControl));
			},

			/**
			 * Returns true if the given <code>oControl</code> is deprecated and false otherwise
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {boolean} Returns true if the control is deprecated
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isControlDeprecated
			 * @function
			 * @public
			 */
			isControlDeprecated: function (oControl) {
				return oControl.getMetadata().isDeprecated ? oControl.getMetadata().isDeprecated() : true;
			},

			/**
			 * Gets the aggregations definition from the design time metadata of the given <code>vControl</code>
			 *
			 * @param {sap.ui.core.Control|string} vControl
			 * @return {object}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getDesignTimeAggregations
			 * @function
			 * @public
			 */
			getDesignTimeAggregations: function (vControl) {
				return ControlMetadata.getDesignTimeData(vControl).aggregations || {};
			},

			/**
			 * Determines whether the given control <code>vControl</code> is not droppable (controls cannot be dropped to it)
			 *
			 * @param {sap.ui.core.Control|string} vControl
			 * @returns {boolean} Returns true if the given control is not droppable (controls cannot be dropped to it) and false otherwise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isControlNotDroppable
			 * @function
			 * @public
			 */
			isControlNotDroppable: function (vControl) {
				return !ControlMetadata.getDesignTimeData(vControl).droppable;
			},

			/**
			 * Returns the given function definition in the behavior definition from the design time metadata
			 *
			 * @param {sap.ui.core.Control|string} vControl
			 * @param {string} sFunctionName
			 * @returns {object}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getDesignTimeBehaviorPart
			 * @function
			 * @public
			 */
			getDesignTimeBehaviorPart: function (vControl, sFunctionName) {
				return _.get(ControlMetadata.getDesignTimeData(vControl), ["behavior", sFunctionName]);
			},

			/**
			 * Returns the adapter function from the aggregation definition in design time metadata of vControl
			 *
			 * @param {sap.ui.core.Control|string} vControl
			 * @param {string} sAggregationName
			 * @param {string} sFunctionName
			 * @returns {Object}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getAggregationsAdapterFunction
			 * @function
			 * @public
			 */
			getAggregationsAdapterFunction: function (vControl, sAggregationName, sFunctionName) {
				var oDTAggregationsProperty = ControlMetadata.getDesignTimeAggregations(vControl);
				return oDTAggregationsProperty && oDTAggregationsProperty[sAggregationName] && oDTAggregationsProperty[sAggregationName][sFunctionName];
			},

			/**
			 * Returns whether the given control can be edit
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {boolean} true if the given control is a container and false otherwise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isControlEditable
			 * @function
			 * @public
			 */
			isControlEditable: function (oControl) {
				return !(ControlMetadata.isControlUnsupported(oControl) ||
				ControlMetadata.isControlToBeSupported(oControl)
				);
			},

			/**
			 * return list of aggregations that are not visible aggregations
			 * @return {string[]}
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getHiddenAggregations
			 * @function
			 * @public
			 */
			getHiddenAggregations: function () {
				return ["customData", "layoutData"].concat(ControlMetadata.getUnsupportedAggregations());
			},

			/**
			 * return list of aggregations that are not supported in layout editor
			 * @return {string[]}
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getUnsupportedAggregations
			 * @function
			 * @public
			 */
			getUnsupportedAggregations: function () {
				return ["tooltip", "dependents"];
			},

			/**
			 * Gets all public aggregations of a control, excluding the ones in the filter
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @param {Array<string>} aFilter
			 * @returns {Array<object>}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#getAllPublicAggregations
			 * @function
			 * @public
			 */
			getAllPublicAggregations: function (oControl, aFilter) {
				return _.filter(oControl.getMetadata().getAllAggregations(), function (oAggregation, sName) {
					return oAggregation.visibility === "public" && !_.include(aFilter, sName);
				});
			},

			/**
			 * Calculates whether the given control is a simple control or a container (has aggregation)
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @returns {boolean} true if the given control is a container and false otherwise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ControlMetadata#isContainer
			 * @function
			 * @public
			 */
			isContainer: function (oControl) {
				if (!oControl) {
					return false;
				}
				return !_.isEmpty(ControlMetadata.getAllPublicAggregations(oControl, ControlMetadata.getHiddenAggregations()));
			}
		};

		return ControlMetadata;
	}
);
