define(
	[
		"sap/watt/lib/lodash/lodash",
		"sap/watt/core/utils",
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"../utils/DocuUtils",
		"../utils/UsageMonitoringUtils",
		"../control/serialization/XMLManipulator",
		"../utils/W5gUi5LibraryMediator",
		"../utils/EventBusHelper"
	],

	function (_, utils, W5gUtils, ControlMetadata, DocuUtils, UsageMonitoringUtils, XMLManipulator, W5gUi5LibraryMediator, EventBusHelper) {
		"use strict";
		jQuery.sap.require("sap.ui.base.DataType");
		jQuery.sap.require("sap.ui.model.type.String");
		jQuery.sap.require("sap.ui.core.mvc.View");

// Private variables and methods
// Begin

		var
			/**
			 * @const
			 * @type {string}
			 */
			PROPERTIES = "properties",

			/**
			 * @const
			 * @type {string}
			 */
			EVENTS = "events";

		/**
		 * Constructor for a IdType type.
		 *
		 * @param {object=} oFormatOptions options as provided by concrete subclasses
		 * @param {object=} oConstraints constraints as supported by concrete subclasses
		 *
		 * @class
		 * Main responsibility is to validate control ID.
		 * @extends sap.ui.model.type.String
		 *
		 * @constructor
		 * @private
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.IdType
		 */
		sap.ui.model.type.String.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.IdType",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.IdType.prototype */ {
				validateValue: function (oValue) {
					if (oValue === "") {
						return;
					}
					if (!sap.ui.core.ID.isValid(oValue) || oValue.indexOf("-") > -1) {
						throw new sap.ui.model.ValidateException("The ID contains invalid characters", []);
					}

					if (_oControl && _hasDuplicateId(_oControl.__XMLRootNode, oValue, _oControl.__XMLNode)) {
						throw new sap.ui.model.ValidateException("The ID is not unique", []);
					}
				}
			});

		var
			/**
			 * The regular expression for detecting icon related properties
			 *
			 * @cont
			 * @type {RegExp}
			 * @private
			 */
			ICON_REGEXP = /src|.*icon$|^icon.*/i,

			/**
			 * The binding type for control ID.
			 * It is also used in qUnit tests
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.IdType}
			 * @private
			 */
			_idType = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.IdType(),

			/**
			 * The UI5 control associated with <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel</code>
			 *
			 * @type {sap.ui.core.Control}
			 * @private
			 */
			_oControl = null,

			/**
			 * The scoped window associated with <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel</code>
			 *
			 * @type {Window}
			 * @private
			 */
			_oScopedWindow = window,

			/**
			 * Reference to XMLManipulator
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XMLManipulator}
			 * @private
			 */
			_oXmlManipulator = null,

			/**
			 * The UI5 control which has <code>_oControl</code> as aggregation template
			 *
			 * @type {sap.ui.core.Control}
			 * @private
			 */
			_oTemplateOwner = null,

			/**
			 * Binding types used with the control property editor to handle parsing and formatting
			 *
			 * @type {object<string, sap.ui.model.SimpleType>}
			 * @private
			 */
			_mBindingType = {
				"boolean": new sap.ui.model.type.Boolean(),
				"int": new sap.ui.model.type.Integer(),
				"string": new sap.ui.model.type.String(),
				"float": new sap.ui.model.type.Float(),
				"date": new sap.ui.model.type.Date(),
				"time": new sap.ui.model.type.Time(),
				"datetime": new sap.ui.model.type.DateTime()
			},

			/**
			 * List of the methods available for bind in the controller
			 *
			 * @type {Array<string>}
			 * @private
			 */
			_aMethods = null;

		/**
		 * Checks if the given xml node <code>oNode</code> has element with <code>sId</code> id
		 *
		 * @param {object} oNode Xml node to check
		 * @param {string} sId Id to check
		 * @param {object} oXml Xml node that need to be ignored on check
		 * @returns {boolean} Returns true if id already exists in the given <code>oNode</code> node
		 *
		 * @name _hasDuplicateId
		 * @function
		 * @private
		 */
		function _hasDuplicateId(oNode, sId, oXml) {
			var bRes = false;
			jQuery.each(oNode.children || {}, function () {
				if (this === oXml) {
					return;
				}
				if (this.getAttribute("id") === sId) {
					bRes = true;
					return false; // eslint-disable-line
				}
				if (this.children) {
					bRes |= _hasDuplicateId(this, sId, oXml);
				}
				if (bRes) {
					return false; // eslint-disable-line
				}
			});
			return !!bRes;
		}

		/**
		 * Returns an array of enabled UI5 control properties
		 *
		 * @param {sap.ui.core.Control} oControl control object
		 * @param {object} oDesignTimeData design time data
		 * @returns {object} Returns an object which holds an arrays of properties and events
		 *
		 * @name _processControlPropertiesAndEvents
		 * @function
		 * @private
		 */
		function _processControlPropertiesAndEvents(oControl, oDesignTimeData) {
			var aProperties = [], aEvents = [],
				mControlProperties = W5gUi5LibraryMediator.getAllSupportedControlProperties(oControl),
				mControlEvents = W5gUi5LibraryMediator.getAllSupportedControlEvents(oControl),
				sPropertyName, oControlProperty, oPropertyEntry;

			for (sPropertyName in mControlProperties) {
				//Visible property is hidden from customer until a proper concept is there
				if (sPropertyName === "visible") {
					//Property is hidden
					continue;
				}

				// Disable properties that are disabled in the adapter.js
				if (!_isPropertyEnabled(oDesignTimeData, sPropertyName)) {
					continue;
				}

				oControlProperty = mControlProperties[sPropertyName];

				//Create Property Entry and determine relevant information
				oPropertyEntry = _createPropertyEntry({
					name: sPropertyName,
					isIcon: _isIcon(oControl, sPropertyName),
					isDeprecated: oControlProperty.deprecated,
					title: _.startCase(sPropertyName),
					typeName: oControlProperty.type,
					priority: _getAttribute(oDesignTimeData, PROPERTIES, sPropertyName, "priority", 0),
					validator: _getAttribute(oDesignTimeData, PROPERTIES, sPropertyName, "validator"),
					editControlFactory: _getAttribute(oDesignTimeData, PROPERTIES, sPropertyName, "editControlFactory")
				});
				_analyzeType(oControl, oPropertyEntry);

				if (oPropertyEntry.type) {
					aProperties.push(oPropertyEntry);
				} else {
					jQuery.sap.log.warning("Property " + oPropertyEntry.name + " of " + oControl.getMetadata().getName() +
						" is ignored in WYSIWYG properties panel: not supported type - " + oPropertyEntry.typeName, this);
				}
			}

			//Create special property for ID
			oPropertyEntry = _createPropertyEntry({
				docu: {
					defaultValue: "-",
					doc: "The unique identifier within a page, either configured or automatically generated.",
					name: "id",
					type: "sap.ui.core.ID",
					typeText: "ID"
				},
				priority: 10000,
				name: "id",
				title: "Element ID",
				typeName: "idType",
				type: "idType",
				bindingType: _idType,
				placeholder: ""
			});
			aProperties.push(oPropertyEntry);

			for (var sEventName in mControlEvents) {
				aEvents.push({
					name: sEventName,
					title: _.startCase(sEventName),
					isDeprecated: !!mControlEvents[sEventName].deprecated,
					priority: _getAttribute(oDesignTimeData, EVENTS, sEventName, "priority", 0)
				});
			}

			return {
				properties: aProperties,
				events: aEvents
			};
		}

		/**
		 * This method tries to check 'object' types. Some controls use this type instead of Date type
		 *
		 * @param {sap.ui.core.Control} oControl control object
		 * @param {object} oPropertyEntry control property entry
		 *
		 * @name _checkDateTimeTypes
		 * @function
		 * @private
		 */
		function _checkDateTimeTypes(oControl, oPropertyEntry) {
			if (oPropertyEntry.typeName === "object") {
				//TODO...
			}
		}

		/**
		 * Returns the control property entry created using the given <code>oEntry</code>
		 * @param {object} oEntry a control property entry
		 * @returns {object} new control property entry
		 *
		 * @name _createPropertyEntry
		 * @function
		 * @private
		 */
		function _createPropertyEntry(oEntry) {
			return jQuery.extend(true, {
				priority: 0,
				name: undefined,
				isArray: false,
				isIcon: false,
				isDeprecated: false,
				title: undefined,
				editControlFactory: undefined,
				type: undefined, // Base type of the control property to be
				// presented or "enum"
				bindingType: undefined, // Binding type
				typeName: undefined, // Type name from model data
				typeObject: undefined, // Type object
				placeholder: undefined,
				rejectedValue: undefined
				// Holds user input identified as invalid
			}, oEntry);
		}

		/**
		 * Calculates base and binding types of a control property <code>oPropertyEntry</code>
		 *
		 * @param {sap.ui.core.Control} oControl control object
		 * @param {object} oPropertyEntry a control property entry
		 *
		 * @name _analyzeType
		 * @function
		 * @private
		 */
		function _analyzeType(oControl, oPropertyEntry) {
			if (!oPropertyEntry.typeName) { // Return if no control meta data available
				return;
			}

			// Check if array and determine property type (or component type)
			if (oPropertyEntry.typeName.indexOf("[]") > 0) {
				oPropertyEntry.typeName = oPropertyEntry.typeName.substring(0, oPropertyEntry.typeName.indexOf("[]"));
				oPropertyEntry.isArray = true;
			}

			// Return if object or void type
			if (oPropertyEntry.typeName === "void" || oPropertyEntry.typeName === "object") {
				_checkDateTimeTypes(oControl, oPropertyEntry);
				return;
			}

			// integer =/= int
			if (oPropertyEntry.typeName.toLowerCase().indexOf("int") === 0) {
				oPropertyEntry.typeName = "int";
			}
			if (oPropertyEntry.typeName === "any") {
				//TODO: TEMPORARY WORKAROUND DUE TO OBJECTS SERIALIZATION BUG
				oPropertyEntry.typeName = "string";
			}
			// Type of control property is an elementary simple type
			if (oPropertyEntry.typeName === "boolean" || oPropertyEntry.typeName === "int"
				|| oPropertyEntry.typeName === "float" || oPropertyEntry.typeName === "string") {
				oPropertyEntry.type = oPropertyEntry.typeName;
				oPropertyEntry.bindingType = _mBindingType[oPropertyEntry.typeName];
			}
			// Control type is a sap.ui.base.DataType or an enumeration type
			else {
				// Determine type from iFrame
				var DataType = _oScopedWindow.sap.ui.base.DataType;
				if (!oPropertyEntry.typeObject) {
					oPropertyEntry.typeObject = DataType.getType(oPropertyEntry.typeName);
				}

				oPropertyEntry.type = oPropertyEntry.typeObject &&
					Object.getPrototypeOf(oPropertyEntry.typeObject).getName() || "enum";

				// Determine base type for SAP types
				if (oPropertyEntry.type === "enum") {
					oPropertyEntry.typeObject = _oScopedWindow.jQuery.sap.getObject(oPropertyEntry.typeName);
					oPropertyEntry.bindingType = _mBindingType["string"];
				} else {
					oPropertyEntry.bindingType = _mBindingType[oPropertyEntry.type];
				}

			}
		}

		/**
		 * Calls property getter of <code>_oControl</code>
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @param {string} sName a property name
		 * @returns {*}
		 *
		 * @name _callGetter
		 * @function
		 * @private
		 */
		function _callGetter(oControl, sName) {
			// Do not use oControl.getProperty/getAggregation, because
			// some controls implement their own version of the getter method
			var controlPropertyFromXML = _getControlPropertyFromXML(oControl, sName);
			return (_.isNull(controlPropertyFromXML) || _.isUndefined(controlPropertyFromXML)) && oControl.getMetadata().getAllProperties()[sName] ?
				oControl[oControl.getMetadata().getAllProperties()[sName]._sGetter]() :
				controlPropertyFromXML;
		}

		/**
		 * Calls property setter of <code>_oControl</code>
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @param {string} sName a property name
		 * @param {*} oValue a property value
		 *
		 * @name _callSetter
		 * @function
		 * @private
		 */
		function _callSetter(oControl, sName, oValue) {
			// Do not use oControl.setProperty/setAggregation, because
			// some controls implement their own version of the setter method
			if (oControl.getMetadata().getAllProperties()[sName]) {
				oControl[oControl.getMetadata().getAllProperties()[sName]._sMutator](oValue);
			} else {
				oControl[oControl.getMetadata().getAllEvents()[sName]._sMutator](oValue);
			}

			jQuery.sap.assert(_oXmlManipulator, "XmlManipulator doesn't exist");
			_oXmlManipulator.emitPropertyChangeEvent(oControl, sName, oValue);
		}

		/**
		 * Returns id of <code>oControl</code>
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @returns {string} Returns control id
		 *
		 * @name _getControlId
		 * @function
		 * @private
		 */
		function _getControlId(oControl) {
			//Show only ids that were explicitly added to the xml view
			return oControl.__XMLNode && oControl.__XMLNode.id;
		}

		function _getControlPropertyFromXML(oControl, sPropertyName) {
			return oControl.__XMLNode && oControl.__XMLNode.getAttribute(sPropertyName);
		}

		/**
		 * Checks if property is enabled.
		 * Some properties may be disabled in the adapter.js
		 *
		 * @param {object} oDTData design time metadata
		 * @param {string} sPropertyName property name
		 * @returns {boolean}
		 *
		 * @name _isPropertyEnabled
		 * @function
		 * @private
		 */
		function _isPropertyEnabled(oDTData, sPropertyName) {
			return !!_getAttribute(oDTData, PROPERTIES, sPropertyName, "visible", true);
		}

		/**
		 * Checks if property is icon.
		 *
		 * @param {sap.ui.core.Control} oControl control object
		 * @param {string} sPropertyName property name
		 * @returns {boolean}
		 *
		 * @name _isIcon
		 * @function
		 * @private
		 */
		function _isIcon(oControl, sPropertyName) {
			return ICON_REGEXP.test(sPropertyName) && oControl.getMetadata().getName() !== "sap.m.Image";
		}

		/**
		 * Gets attribute of specified property or event.
		 *
		 * @param {object} oDTData design time metadata
		 * @param {"events"|"properties"} sCollectionType specified the type of collection
		 * @param {string} sCollectionName property/event name
		 * @param {string} sAttributeName the attribute of the property/event in design time metadata
		 * @param {any=} vDefaultValue default value
		 * @returns {any} Returns attribute value if any
		 *
		 * @name _getAttribute
		 * @function
		 * @private
		 */
		function _getAttribute(oDTData, sCollectionType, sCollectionName, sAttributeName, vDefaultValue) {
			return _.get(oDTData, [sCollectionType, sCollectionName, sAttributeName], vDefaultValue);
		}

		/**
		 * Determines whether the control is contained in a bound aggregation i.e.
		 * whether it is a clone. If so it determines the template where it originates from
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @returns {sap.ui.core.Control} Returns reference to resolved control (can be the original control or a template)
		 *
		 * @name _resolveControl
		 * @function
		 * @private
		 */
		function _resolveControl(oControl) {
			var oParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
				oParent = oParentAggregationInfo.parent,
				oBindingInfo = oParent && oParent.getBindingInfo(oParentAggregationInfo.aggregationName);

			if (oBindingInfo && oBindingInfo.template) {
				oControl = oBindingInfo.template;
			}

			return oControl;
		}

		/**
		 * Returns the new sorted array
		 *
		 * @param {Array<object>} aProperties array, where each item expect to have 'priority' and 'title' attributes
		 * @returns {Array<object>}
		 *
		 * @name _sortProperties
		 * @function
		 * @private
		 */
		function _sortProperties(aProperties) {
			return _.sortByOrder(aProperties, ['priority', 'title'], [false, true]);
		}

		/**
		 * Returns the new sorted array - will put the control's events at the top and the inherited events after
		 *
		 * @param {sap.ui.core.Control} oControl selected control
		 * @param {Array<object>} aEvents array, where each item expect to have name attribute
		 * @returns {Array<object>}
		 *
		 * @name _sortEvents
		 * @function
		 * @private
		 */
		function _sortEvents(oControl, aEvents) {
			var oControlEvents = oControl.getMetadata().getEvents();
			//generally the events returned so the inherited comes first by the order of the inheritance chain
			//so all is needed is to reverse the order.
			//however here we verify that the control's events will come first anyhow
			return _.sortBy(aEvents.reverse(), function (oEvent) {
				return oControlEvents[oEvent.name] ? -1 : 1;
			});
		}

		/**
		 * Attaches/Detaches <code>sap.ui.dt.Overlay#elementModified</code> event
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel} oModel model
		 * @param {boolean} bAttach if true handler will be attached, otherwise detached
		 *
		 * @name _setDesignTimeEvents
		 * @function
		 * @private
		 */
		function _setDesignTimeEvents(oModel, bAttach) {
			var /** sap.ui.dt.Overlay */ oOverlay = W5gUtils.getControlOverlay(_oControl, _oScopedWindow);
			if (oOverlay) {
				var _fnHandler = bAttach ? oOverlay.attachEvent : oOverlay.detachEvent;
				_fnHandler.call(oOverlay, "elementModified", _onDesignTimeEvent, oModel);
			}
		}

		/**
		 * Notifies the <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel</code> about design time changes.
		 *
		 * The original reason can be one of the following:
		 * <ul>
		 * <li>control property has been bound </li>
		 * <li>control property has been unbound </li>
		 * <li>control aggregation has been bound </li>
		 * <li>control aggregation has been unbound </li>
		 * <li>control property has been changed </li>
		 * </ul>
		 *
		 * Usually, one change fires few events. Waits 100ms before handling the changes
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel}
		 *
		 * @name _onDesignTimeEvent
		 * @function
		 * @private
		 */
		var _onDesignTimeEvent = utils.debounce(function () {
			this.refresh();
		}, 100);

// End
// Private variables and methods

		/**
		 * Constructor for a new Wg5 properties model.
		 * Main responsibility is to merge the control metadata with the designtime metadata.
		 *
		 * @param {object} oData either the URL where to load the JSON from or a JS object
		 *
		 * @class
		 * The model describing selected control properties
		 * @extends sap.ui.model.json.JSONModel
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel
		 */
		var W5gPropertiesModel = sap.ui.model.json.JSONModel.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel");

		/**
		 * Sets list of methods available for bind in the controller
		 *
		 * @param {Array<string>}  methods list
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel#setMethods
		 * @function
		 */
		W5gPropertiesModel.prototype.setMethods = function (aMethods) {
			_aMethods = aMethods;
			this.setProperty("/methods", _aMethods);
		};

		/**
		 * Sets a new method to the controller
		 *
		 * @param {map<string,string>}  oMethod
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel#addMethod
		 * @function
		 */
		W5gPropertiesModel.prototype.addMethod = function (oMethod) {
			if (_aMethods) {
				_aMethods.push(oMethod);
			} else {
				_aMethods = [oMethod];
			}
			this.setProperty("/methods", _aMethods);
		};

		/**
		 * Returns the UI5 control
		 *
		 * @return {sap.ui.core.Control} Returns the template owner or selected control if template owner not exists
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel#getControl
		 * @function
		 */
		W5gPropertiesModel.prototype.getControl = function () {
			return _oTemplateOwner || _oControl;
		};

		/**
		 * Sets the underlying control to the model.
		 *
		 * @param {sap.ui.core.Control}  oControl the control to use
		 * @param {Window}  [oScopedWindow=null] the scoped window
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XMLManipulator} oXmlManipulator
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel#setControl
		 * @function
		 */
		W5gPropertiesModel.prototype.setControl = function (oControl, oScopedWindow, oXmlManipulator) {
			var that = this,
				sControlName = "",
				aProperties = [],
				aEvents = [],
				bIsDeprecated = false,
				oControlMetadata, oDesignTimeData;

			_oScopedWindow = oScopedWindow || window;
			_oXmlManipulator = oXmlManipulator;

			// analyze control properties and build up model data respectively
			if (oControl && typeof oControl === "object") {
				// design time metadata must be taken from the actual control as it has an overlay
				oDesignTimeData = ControlMetadata.getDesignTimeData(oControl);
				//always update template owner (fix references)
				_oTemplateOwner = oControl;
				oControl = _resolveControl(oControl);
				if (_oTemplateOwner === oControl) {
					_oTemplateOwner = null;
				}
				if (_oControl === oControl) {
					//do nothing: model is already updated
					return;
				}

				_setDesignTimeEvents(this, false);
				_oControl = oControl;
				_setDesignTimeEvents(this, true);

				oControlMetadata = _oControl.getMetadata();
				// Get full metadata (side effect: getJSONKeys calls sap.ui.base.ManagedObjectMetadata.prototype._enrichChildInfos)
				sControlName = W5gUtils.getControlTitle(_oControl);
				var oPropertiesAndEvents = _processControlPropertiesAndEvents(oControl, oDesignTimeData);
				aProperties = _sortProperties(oPropertiesAndEvents.properties);
				aEvents = _sortEvents(oControl, oPropertiesAndEvents.events);

				DocuUtils.enrichPropertiesAndEventsInfo(oControlMetadata.getName(), aProperties, aEvents).then(function () {
					that.checkUpdate(false);
				}).done();

				bIsDeprecated = !!(_oControl.getMetadata().isDeprecated && _oControl.getMetadata().isDeprecated());
			} else {
				_setDesignTimeEvents(this, false);
				_oControl = null;
			}

			// build model
			this.setData({
				properties: aProperties,
				events: aEvents,
				controlName: sControlName,
				isDeprecated: bIsDeprecated,
				methods: _aMethods
			});

			EventBusHelper.publish(EventBusHelper.IDENTIFIERS.PROP_MODEL_CONTROL_UPDATED);
		};

//Overwrites - sap.ui.model.JSONModel
//Begin
		/**
		 * Sets a new value for the given property <code>sPath</code> in the model.
		 * If the model value changed all interested parties are informed.

		 * @param {string} sPath path of the property to set
		 * @param {any}    oValue value to set the property to
		 * @param {object} [oContext=null] the context which will be used to set the property
		 *
		 * @override sap.ui.model.json.JSONModel#setProperty
		 */
		W5gPropertiesModel.prototype.setProperty = function (sPath, oValue, oContext) {
			var sObjectPath = sPath.substring(0, sPath.lastIndexOf("/")),
				sProperty = sPath.substr(sPath.lastIndexOf("/") + 1),
				bFireChanged = true,
				oldValue,
				isValid = true;

			if (!sObjectPath && !oContext) {
				oContext = this.oData;
			}
			var oModelNode = this._getObject(sObjectPath, oContext);

			switch (sProperty) {
				case "value":
					UsageMonitoringUtils.report("property_change", _oControl.getMetadata().getName() + "." + oModelNode.name);
					if (_oControl.isBound(oModelNode.name)) {
						_oControl.unbindProperty(oModelNode.name);
					}

					// Check if value is valid:
					// ... Use isValid function of type object to evaluate
					if (typeof oModelNode.typeObject === "object"
						&& jQuery.isFunction(oModelNode.typeObject.isValid)) {
						isValid = oModelNode.typeObject.isValid(oValue);
					}

					// Update control property if valid input passed
					if (isValid) {
						if (oModelNode["name"] === "id") {
							//Special handling for control ID
							oldValue = _getControlId(_oControl);
							oValue = oValue || undefined;
							_oXmlManipulator.emitPropertyChangeEvent(_oControl, oModelNode["name"], oValue);

						} else {
							//Standard handling, call setter
							_callSetter(_oControl, oModelNode["name"], oValue);
							if (_oTemplateOwner) {
								_callSetter(_oTemplateOwner, oModelNode["name"], oValue);
							}
						}
						oModelNode.rejectedValue = undefined;
					}
					// Remember bad input as it is needed to calculate value state
					else {
						oModelNode.rejectedValue = oValue;
						bFireChanged = false;
					}
					break;
				case "rejectedValue":
					oModelNode[sProperty] = oValue;
					bFireChanged = false;
					break;
				case "methods":
					oModelNode[sProperty] = oValue;
					_aMethods = oValue;
					break;
				default:
					throw new Error("Only some values can be set in the properties model");
			}

			// Inform interested parties
			this.refresh();

			// fire dummy change event if ID property or template control property has been changed
			if (bFireChanged && oModelNode["name"] === "id") {
				(_oTemplateOwner || _oControl).fireEvent("_change", {
					"id": (_oTemplateOwner || _oControl).getId(),
					"name": oModelNode["name"],
					"oldValue": oldValue,
					"newValue": oValue
				});
			}

			if (!isValid) {
				var msg = "Invalid value of type " + oModelNode.typeObject.getName(); // this message is not shown in the UI
				throw new sap.ui.model.ValidateException(msg, []);
			}
		};

		/**
		 * Returns the node of specified path/context if any
		 *
		 * @param {string} sPath
		 * @param {object} [oContext]
		 * @returns {any} the node of the specified path/context
		 *
		 * @override sap.ui.model.json.JSONModel#_getObject
		 */
		W5gPropertiesModel.prototype._getObject = function (sPath, oContext) {
			var oNode = this.isLegacySyntax() ? this.oData : null;
			if (oContext instanceof sap.ui.model.Context) {
				oNode = this._getObject(oContext.getPath());
			} else if (oContext) {
				oNode = oContext;
			}
			if (!sPath) {
				return oNode;
			}
			var aParts = sPath.split("/"),
				iIndex = 0;
			if (!aParts[0]) {
				// absolute path starting with slash
				oNode = this.oData;
				iIndex++;
			}

			while (oNode && aParts[iIndex]) {
				// Handling for special properties
				switch (aParts[iIndex]) {
					case "value":
						if (oNode.rejectedValue === undefined) {
							//Fix the "Char at" issue, TODO find a better solution
							if (typeof oNode.name === "undefined") {
								return null;
							}

							if (oNode.name === "id") {
								// Special handling for control ID
								oNode = _oControl;
								if (oNode) {
									oNode = _getControlId(oNode);
								}
							} else {
								var oBindingInfo = _oControl.getBindingInfo(oNode.name),
									oBinding = oBindingInfo && oBindingInfo.parts && oBindingInfo.parts[0];
								if (oBindingInfo) {
									oNode = oBindingInfo.bindingString || "{" + (oBinding.model ? oBinding.model + ">" : "") + oBinding.path + "}";
								}
								else {
									//Standard case, call getter
									oNode = _callGetter(_oControl, oNode.name);
								}
							}
						} else {
							oNode = oNode.rejectedValue;
						}
						break;

					case "valueState":
						oNode = typeof oNode.rejectedValue === "undefined" ?
							sap.ui.core.ValueState.None : sap.ui.core.ValueState.Error;
						break;

					default:
						// Other fields
						oNode = oNode[aParts[iIndex]];
				}
				iIndex++;
			}
			return oNode;
		};
//End
//Overwrites - sap.ui.model.Model

// QUnit API Methods
// Begin
		/**
		 * Returns the properties of a UI5 control
		 *
		 * @param {sap.ui.core.Control}    oControl the control to use
		 * @returns {Array<object>} an array of control properties
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.__QUnit_getUi5CtrlProperties
		 * @function
		 */
		W5gPropertiesModel.__QUnit_getUi5CtrlProperties = function (oControl) {
			var aProperties = [];
			if (oControl && typeof oControl === "object") {
				aProperties = _processControlPropertiesAndEvents(oControl, ControlMetadata.getDesignTimeData(oControl));
				aProperties = _sortProperties(aProperties.properties);
			}
			return aProperties;
		};

		/**
		 * Validate whether a given value in model representation is valid and meets the defined constraints (if any).
		 * This method is used only in qUnit tests.
		 *
		 * @param {string}  sId the value to be validated
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel.__QUnit_validateControlID
		 * @function
		 */
		W5gPropertiesModel.__QUnit_validateControlID = function (sId) {
			_idType.validateValue(sId);
		};
// End
// QUnit API Methods

		return W5gPropertiesModel;
	}
);
