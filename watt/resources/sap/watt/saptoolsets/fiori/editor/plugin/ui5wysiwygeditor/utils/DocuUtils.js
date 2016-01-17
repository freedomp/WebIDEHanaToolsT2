define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		jQuery.sap.require("sap.ui.commons.RichTooltip");

// Private variables and methods
// Begin
		var
			/**
			 * List of UI5 core types
			 *
			 * @const
			 * @type string
			 * @private
			 */
				//just a hack, needs proper type resolution
			CORE_TYPES = "boolean int float number function object string void any Element Control Component";

		/**
		 * Resolves type name
		 *
		 * @param {string} sType base type name
		 * @param {string} sContextName context name
		 * @return {string} resolved type name
		 *
		 * @name _resolve
		 * @function
		 * @private
		 */
		function _resolve(sType, sContextName) {
			if (!sType) {
				return null;
			}
			if (sType.indexOf("/") !== -1) {
				return sType.replace(/\//g, ".");
			}
			if (sType.indexOf(".") === -1 && CORE_TYPES.indexOf(sType) !== -1) {
				return "sap.ui.core." + sType;
			}
			return sContextName.split(".").slice(0, -1).concat([sType.replace(/\//g, ".")]).join(".");
		}

		/**
		 * Creates documentation for entity named <code>sEntityName</code>
		 *
		 * <ul>
		 * <li>'baseType' of type <code>string</code>
		 *            base type name
		 * </li>
		 * <li>'doc' of type <code>string</code>
		 *            documentation text
		 * </li>
		 * <li>'properties' of type <code>Map(string, object)</code>
		 *            properties
		 * </li>
		 * </ul>
		 *
		 * @param {Document} oData xml document
		 * @param {string} sEntityName entity name
		 * @return {object} created documentation
		 *
		 * @name _parseControlMetaModel
		 * @function
		 * @private
		 */
		function _parseControlMetaModel(oData, sEntityName) {
			var $control = jQuery(oData.documentElement),
				sBaseType = $control.children("baseType").text(),
				oEntityDoc = {
					baseType: _resolve(sBaseType, sEntityName),
					doc: _doc($control),
					properties: {},
					events: {}
				};

			_each($control, "properties/property", function ($prop) {
				oEntityDoc.properties[$prop.attr("name")] = {
					type: _resolve($prop.attr("type") || "string", sEntityName),
					defaultValue: $prop.attr("defaultValue") || "empty/undefined",
					doc: _doc($prop),
					since: $prop.attr("since")
				};
			});

			_each($control, "events/event", function ($evt) {
				oEntityDoc.events[$evt.attr("name")] = {
					doc: _doc($evt)
				};
			});

			return oEntityDoc;
		}

		/**
		 * Passes every child from given node <code>$obj</code> to <code>fnCallback</code> function
		 * @param {jQuery} $obj context node
		 * @param {string} sNames path
		 * @param {function} fnCallback callback function
		 *
		 * @name _each
		 * @function
		 * @private
		 */
		function _each($obj, sNames, fnCallback) {
			jQuery.each(sNames.split("/"), function () {
				$obj = $obj.children(this);
			});
			$obj.each(function () {
				fnCallback(jQuery(this));
			});
		}

		/**
		 * Retrieves documentation from given node <code>$obj</code>
		 *
		 * @param {jQuery} $obj jQuery node
		 * @return {string} documentation
		 *
		 * @name _doc
		 * @function
		 * @private
		 */
		function _doc($obj) {
			return $obj.children("documentation").text();
		}

		/**
		 * Timestamp for loading this module in order to load all the documentation only after some time has
		 * past since loading the script.
		 * This is a performance optimization since we get file per control and the browser has limited number of
		 * parallel ajax calls.
		 * This delay make sure that crucial requests are not blocked by docu requests.
		 *
		 */
		var _firstTimeTimestamp = _.once(function () {
			return Date.now();
		});

		/**
		 * Loads and parse documentation for entity named <code>sEntityName</code>
		 * This function results are static and time consuming so they are cached.
		 *
		 * @param {string} sEntityName entity name

		 * @return {Q} Documentation object
		 *
		 * @name _get
		 * @function
		 * @private
		 */
		var _get = _.memoize(function (sEntityName) {
			var q = Q.defer();

			var iDelayMs = Math.max(60000 - (Date.now() - _firstTimeTimestamp()), 0);

			setTimeout(function () {
				jQuery.ajax({
					cache: true,
					url: jQuery.sap.getModulePath(sEntityName, ".control"),
					dataType: "xml",
					success: function (vResponse) {
						q.resolve(_parseControlMetaModel(vResponse, sEntityName));
					},
					error: function () {
						jQuery.sap.log.debug("tried to load entity documentation for: " + sEntityName + ".control");
						q.resolve("");
					}
				});
			}, iDelayMs);

			return q.promise;
		});

		/**
		 * Creates documentation for entity named <code>sEntityName</code>
		 *
		 * @param sEntityName entity name
		 * @return {Q} Created documentation
		 *
		 * @name _getEntityDocumentation
		 * @function
		 * @private
		 */
		function _getEntityDocumentation(sEntityName) {
			// read info from first document
			return _get(sEntityName).then(function (oEntityDoc) {
				var sBaseDoc = oEntityDoc.baseType;
				if (sBaseDoc) {
					return _getEntityDocumentation(sBaseDoc).then(function (oBaseDocProps) {
						// derived properties documentation has precedence over base properties
						return _.assign({}, oBaseDocProps, oEntityDoc.properties, oEntityDoc.events);
					});
				}
				return _.assign({}, oEntityDoc.properties, oEntityDoc.events);
			});
		}

		/**
		 * Formats some of documentation properties info
		 *
		 * @param {object} mProperties documentation
		 * @return {object} Formatted documentation
		 *
		 * @name _formatEntityPropertiesInfo
		 * @function
		 * @private
		 */
		function _formatEntityPropertiesInfo(mProperties) {
			jQuery.each(mProperties, function (sKey, oProp) {
				if (mProperties.hasOwnProperty(sKey) && sKey.indexOf("_") !== 0) {
					oProp.name = sKey;
					oProp.type = _formatType(oProp.type);
					oProp.typeText = _formatTypeText(oProp.type);
					oProp.defaultValue = (oProp.defaultValue) ?
						String(oProp.defaultValue).replace("empty/undefined", "-") : "";
				}
			});
			return mProperties;
		}

		/**
		 * Formats some of documentation events info
		 *
		 * @param {object} mEvents documentation
		 * @return {object} Formatted documentation
		 *
		 * @name _formatEntityEventsInfo
		 * @function
		 * @private
		 */
		function _formatEntityEventsInfo(mEvents) {
			jQuery.each(mEvents, function (sKey, oEvt) {
				if (mEvents.hasOwnProperty(sKey) && sKey.indexOf("_") !== 0) {
					oEvt.name = sKey;
				}
			});
			return mEvents;
		}

		/**
		 * Formats type name
		 *
		 * @param {string} sType type name
		 * @return {string} Formatted type name
		 *
		 * @name _formatType
		 * @function
		 * @private
		 */
		function _formatType(sType) {
			// remove arrays if any
			return sType && sType.replace("[]", "");
		}

		/**
		 * Converts the type to a friendly readable text
		 *
		 * @param {string} sType type name
		 * @return {string} Formatted type name
		 *
		 * @name _formatTypeText
		 * @function
		 * @private
		 */
		function _formatTypeText(sType) {
			if (sType) {
				// remove core prefix
				sType = sType.replace("sap.ui.core.", "");
				// only take text after last dot
				return sType.substr(sType.lastIndexOf(".") + 1);
			}
			return null;
		}

		/**
		 * Creates formatted tooltip html for property
		 *
		 * @param {object} oDocu a docu object
		 * @param {boolean} bDeprecated indicates if property is deprecated
		 * @return {string|undefined} Formatted html as string
		 *
		 * @name _propTooltipFormatter
		 * @function
		 * @private
		 */
		function _propTooltipFormatter(oDocu, bDeprecated) {
			if (!oDocu) {
				return ""; // until documentation is fetched display only the title
			}

			var aHtml = [];

			//Do not translate the following strings
			_createTooltipRow(aHtml, "Property name", oDocu.name, bDeprecated);
			_createTooltipRow(aHtml, "Property type", oDocu.typeText);
			_createTooltipRow(aHtml, "Description", (bDeprecated ? "DEPRECATED. " : "") + oDocu.doc);
			_createTooltipRow(aHtml, "Default Value", oDocu.defaultValue);

			return aHtml.join("");
		}

		/**
		 * Creates formatted tooltip html for event
		 *
		 * @param {object} oDocu a docu object
		 * @param {boolean} bDeprecated indicates if property is deprecated
		 * @return {string|undefined} Formatted html as string
		 *
		 * @name _eventTooltipFormatter
		 * @function
		 * @private
		 */
		function _eventTooltipFormatter(oDocu, bDeprecated) {
			if (!oDocu) {
				return ""; // until documentation is fetched display only the title
			}

			var aHtml = [];

			//Do not translate the following strings
			_createTooltipRow(aHtml, "Description", (bDeprecated ? "DEPRECATED. " : "") + oDocu.doc);

			return aHtml.join("");
		}

		/**
		 * returns tooltip formatter for element type
		 *
		 * @param sElementType elements type (property, event, etc.)
		 * @returns {function} formatter function
		 *
		 * @name _getTooltipFormatter
		 * @function
		 * @private
		 */
		function _getTooltipFormatter(sElementType) {
			return sElementType === 'events' ?  _eventTooltipFormatter : _propTooltipFormatter;
		}

		/**
		 * Creates tooltip row with given information
		 *
		 * @param {Array<string>} aHtml an array of tooltip rows
		 * @param {string} sTitle tooltip row title
		 * @param {string} sValue tooltip row value
		 * @param {boolean=} bDeprecated indicates if property is deprecated
		 *
		 * @name _createTooltipRow
		 * @function
		 * @private
		 */
		function _createTooltipRow(aHtml, sTitle, sValue, bDeprecated) {
			aHtml.push("<div class='row'><div class='title'>" + sTitle + ":</div> <div class='value");
			if (bDeprecated) {
				aHtml.push(" deprecated");
			}
			aHtml.push("'>" + sValue + "</div></div>");
		}

// End
// Private variables and methods

		/**
		 * WYSIWYG utilities
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.DocuUtils}
		 */
		var DocuUtils = {
			/**
			 * Enriches the given properties <code>aProperties</code> with documentation
			 *
			 * @param {string} sId entity id
			 * @param {Array<object>} aProperties array of control properties
			 * @return {Q}
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.DocuUtils.enrichPropertiesInfo
			 * @function
			 * @public
			 */
			enrichPropertiesAndEventsInfo: function (sId, aProperties, aEvents) {
				return _getEntityDocumentation(sId).then(function (oDoc) {
					var mProperties = _formatEntityPropertiesInfo(oDoc);
					var mEvents = _formatEntityEventsInfo(oDoc);

					aProperties.forEach(function (oValue) {
						oValue.docu = mProperties[oValue.name] || oValue.docu || {
								defaultValue: "-",
								doc: "",
								name: oValue.name,
								type: _formatType(oValue.typeName),
								typeText: _formatTypeText(oValue.typeName)
							};
					});

					aEvents.forEach(function (oValue) {
						oValue.docu = mEvents[oValue.name] || oValue.docu || {
									doc: "",
									name: oValue.name
								};
					});
				});
			},

			/**
			 * Enriches the given control info <code>oControlInfo</code> with documentation
			 *
			 * @param {string} sId entity id
			 * @param {object} oControlInfo control info object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.DocuUtils.enrichControlInfo
			 * @function
			 * @private
			 */
			enrichControlInfo: function (sId, oControlInfo) {
				return _get(sId).then(function (oDoc) {
					oControlInfo.description = oDoc.doc;
				});
			},

			/**
			 * Enrich all given control infos asynchronously with documentation
			 * @param {Array<object>} aControls control objects
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.DocuUtils.enrichControlInfo
			 * @public
			 */
			enrichControlInfos: function (aControls) {
				var aPromises = aControls.map(function (oControl) {
					return DocuUtils.enrichControlInfo(oControl.name, oControl);
				});
				return Q.all(aPromises);
			},

			/**
			 * Creates rich tooltip using given settings <code>mSettings</code>
			 *
			 * @param {object} mSettings settings
			 * @return {sap.ui.core.Control} Created tooltip control
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.DocuUtils.createDocuTooltip
			 * @function
			 * @public
			 */
			createDocuTooltip: function (mSettings , sType) {
				return new sap.ui.commons.RichTooltip(jQuery.extend({
					title: "{title}",
					openDelay: 300,
					offset: "-10 3",
					myPosition: "end top",
					atPosition: "begin top",
					text: {
						parts: [
							{path: "docu"},
							{path: "isDeprecated"}
						],
						formatter: _getTooltipFormatter(sType)
					}
				}, mSettings || {})).addStyleClass("sapWysiwygTooltip");
			}
		};

		return DocuUtils;
	}
);
