define(
	[
		"sap/watt/lib/lodash/lodash",
		"../../utils/W5gUtils",
		"../../utils/EventsHelper"
	],
	function (_, W5gUtils, EventsHelper) {
		"use strict";

		var _oParser = new DOMParser();

		function localName(xmlNode) {
			// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
			return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
		}

		function isExtension(xmlNode) {
			return localName(xmlNode) === "ExtensionPoint" && xmlNode.namespaceURI === "sap.ui.core";
		}

		/**
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.serialization.XMLManipulator
		 * @param {Window} scope
		 * @param {function} flushFn
		 * @constructor
		 */
		var XMLManipulator = function (scope , flushFn) {
			this._scope = scope;
			this._flushFunc = flushFn;
		};

		XMLManipulator.prototype._require = function(sClass){
			return this._scope.jQuery.sap.require(sClass);
		};

		XMLManipulator.prototype._getCore = function() {
			return this._scope && this._scope.sap.ui.getCore();
		};

		/**
		 * Emits Add Event - adds control to canvas by dragging.
		 *
		 * @param {sap.ui.core.Control} oControl New Control object
		 * @param {string} sAggregation Aggregation name
		 * @param {string} sTargetId Id of target Node
		 * @param {number} iTargetIndex number of controls in target node from UI5
		 * @param {sap.ui.core.Control=} oParent
		 *
		 * @name emitAddEvent
		 * @function
		 * @public
		 */
		XMLManipulator.prototype.emitAddEvent = function (oControl, sAggregation, sTargetId, iTargetIndex, oParent) {
			var parentAggName = sAggregation;
			var targetXML = this._getXMLNodeById(sTargetId);

			var oNewControl = this._control2XML(oControl, sTargetId);
			if (oNewControl.node) {
				var oControlXML = oNewControl.node;
				oControl.__XMLNode = oControlXML;
				oControl.__XMLRootNode = this._getXMLRootNodeById(sTargetId);
				var parentXML = this._getAggregation(oControl, parentAggName, targetXML, iTargetIndex, oParent);
				if (parentXML) {
					var aChildren = parentXML.childNodes;
					var iInsertIndex = this._findInsertPoint(aChildren, oControlXML, iTargetIndex);
					if (iInsertIndex > -1) {
						var oInsertPoint;
						if (iInsertIndex < aChildren.length) {
							oInsertPoint = aChildren[iInsertIndex];
						}
						if (oInsertPoint) {
							parentXML.insertBefore(oControlXML, oInsertPoint);
						} else {
							parentXML.appendChild(oControlXML);
						}
						//this._formatAfterInsert(oControlXML);
						this._formatDOM(oControlXML);
					}
				}
			}

		};

		XMLManipulator.prototype.emitHideEvent = function (oControl) {
			var oControlXML = W5gUtils.getXMLNode(oControl);
			if (oControlXML) {
				this._formatBeforeRemove(oControlXML);
				if (oControlXML.parentElement) {
					oControlXML.parentElement.removeChild(oControlXML);
				}
			}
		};

		/**
		 * Update the xml node of the control with the up to date custom data tag.
		 * Should be removed when custom data is not maintained anymore.
		 * @param oControl
		 */
		XMLManipulator.prototype.emitDataEvent = function (oControl) {
			var oControlXML = W5gUtils.getXMLNode(oControl);
			if (oControlXML) {
				var oXmlRootNode = W5gUtils.getXMLRootNode(oControl);
				if (oXmlRootNode) {
					var mNamespaces = XMLManipulator.getNamespaceMap(oXmlRootNode);
					if (!mNamespaces["sap.ui.core"]) {
						oXmlRootNode.setAttribute("xmlns:core", "sap.ui.core");
						mNamespaces = XMLManipulator.getNamespaceMap(oXmlRootNode);
					}
				}
				var oWindow = this._scope;
				this._require("sap.ui.core.util.serializer.Serializer");
				this._require("sap.ui.core.util.serializer.delegate.XML");
				var oSerializer = new oWindow.sap.ui.core.util.serializer.Serializer(oControl,
					new oWindow.sap.ui.core.util.serializer.delegate.XML("sap.m"), false);
				var sActualControlXML = oSerializer.serialize();
				if (mNamespaces) {
					sActualControlXML = sActualControlXML.replace(/sap\.ui\.core\:CustomData/g, mNamespaces["sap.ui.core"] + ":CustomData");
				}
				var oActualControlNode = _oParser.parseFromString(sActualControlXML, "text/xml");
				var oCustomDataNode = getDirectChildByTagName(oActualControlNode.childNodes[0], "customData");
				var aCurrentXMLCustomData = getDirectChildByTagName(oControlXML, "customData");
				if (aCurrentXMLCustomData) {
					oControlXML.removeChild(aCurrentXMLCustomData);
				}
				if (oCustomDataNode) {
					oControlXML.appendChild(oCustomDataNode);
				}
			}
		};

		function getDirectChildByTagName(oNode, sTagName) {
			var children = oNode.childNodes;
			for (var i = 0; i < children.length; i++) {
				if (children[i].tagName === sTagName) {
					return children[i];
				}
			}
		}

		XMLManipulator.prototype.emitPropertyChangeEvent = function (oControl, sPropertyName, sPropertyValue) {
			var oControlXML = W5gUtils.getXMLNode(oControl);
			if (oControlXML) {
				if (sPropertyValue === undefined) {
					oControlXML.removeAttribute(sPropertyName);
				} else {
					oControlXML.setAttribute(sPropertyName, sPropertyValue);
				}
			}
		};

		XMLManipulator.prototype.emitMoveEvent = function (oControl, sAggregation, sourceId, sTargetId, iTargetIndex) {
			var parentAggName = sAggregation;
			var targetXML = this._getXMLNodeById(sTargetId);

			var parentXML = this._getAggregation(oControl, parentAggName, targetXML);
			if (parentXML) {
				var oControlXML = W5gUtils.getXMLNode(oControl);
				this._formatBeforeRemove(oControlXML);
				var aChildren = parentXML.childNodes;
				if (aChildren.length > 0) {
					var iInsertIndex = this._findInsertPoint(aChildren, oControlXML, iTargetIndex);
					if (iInsertIndex > -1) {
						parentXML.insertBefore(oControlXML, aChildren[iInsertIndex]);
					}
				} else {
					parentXML.appendChild(oControlXML);
				}
				this._formatAfterInsert(oControlXML);
			}
		};

		// Helper methods
		XMLManipulator.prototype._findInsertPoint = function (aChildren, oControlXML, iTargetIndex) {
			var iNumberOfFoundControlNodes = 0;
			var i = 0;

			// Skip trailing non - controls
			while (i < aChildren.length && aChildren[i].nodeType !== 1) {
				i++;
			}
			// enumerate controls and find insert index
			while ((iNumberOfFoundControlNodes < iTargetIndex) && (i < aChildren.length)) {
				var oNode = aChildren[i];
				if (oNode.nodeType === 1 && !isExtension(oNode) && oNode !== oControlXML) { // a control node
					iNumberOfFoundControlNodes++;
				}
				i++;
			}

			if (iNumberOfFoundControlNodes === iTargetIndex) {
				return i;
			} else {
				return -1;
			}

		};

		// Split a name in its domain and base name
		XMLManipulator.prototype._splitName = function (sName) {
			var mResult = {
				name: "",
				nmspc: ""
			};
			var iIndex = sName.lastIndexOf('.');
			if (iIndex > 0) {
				mResult.nmspc = sName.substr(0, iIndex);
				mResult.name = sName.substr(iIndex + 1, sName.length);
			}
			return mResult;
		};

		XMLManipulator.getNamespaceMap = function (oRoot) {
			var mResult = {};
			if (oRoot && oRoot.attributes && oRoot.attributes.length) {
				for (var i = 0; i < oRoot.attributes.length; i++) {
					var oActNode = oRoot.attributes[i];
					if (oActNode.name.lastIndexOf('xmlns') > -1) {
						var aTupel = oActNode.name.split(':');
						mResult[oActNode.value] = (aTupel.length === 2) ? aTupel[1] : "";
					}
				}
			}
			return mResult;
		};

		/** Create xml node for a control
		 *
		 * @param oControl
		 * @param {string} sTargetId
		 * @returns {{nmspc: object, node: Document}}
		 * @private
		 */
		XMLManipulator.prototype._control2XML = function (oControl, sTargetId) {
			var mResult = {
				nmspc: undefined,
				node: undefined
			};

			var oXmlRootNode = this._getXMLRootNodeById(sTargetId);
			if(!oXmlRootNode) {
				jQuery.sap.log.error("Unable to add control under parent node (id=" + sTargetId + ")");
				return mResult;
			}

			var mNameFragment = this._splitName(oControl.getMetadata().getName());
			var mNamespaces = XMLManipulator.getNamespaceMap(oXmlRootNode);
			if (!mNamespaces["sap.ui.core"]) {
				oXmlRootNode.setAttribute("xmlns:sap.ui.core", "sap.ui.core");
				mNamespaces = XMLManipulator.getNamespaceMap(oXmlRootNode);
			}
			var sPrefix = mNamespaces[mNameFragment.nmspc];
			if (!sPrefix && sPrefix !== "") { // namespace is not yet declared and is not the default namespace
				oXmlRootNode.setAttribute("xmlns:" + mNameFragment.nmspc, mNameFragment.nmspc);
				mNamespaces = XMLManipulator.getNamespaceMap(oXmlRootNode);
				sPrefix = mNamespaces[mNameFragment.nmspc];
			}

			var oWindow = this._scope;
			this._require("sap.ui.core.util.serializer.Serializer");
			this._require("sap.ui.core.util.serializer.delegate.XML");
			var sDefaultNS = _.invert(mNamespaces)[""];
			var oSerializer = new oWindow.sap.ui.core.util.serializer.Serializer(oControl,
				new oWindow.sap.ui.core.util.serializer.delegate.XML(sDefaultNS), false);
			var sCtext = oSerializer.serialize();

			for (var n in mNamespaces) {
				var sNmspcKey = mNamespaces[n];
				if (sNmspcKey === "") {
					continue;
				}
				var finder = new RegExp(n + ":", 'g');
				sCtext = sCtext.replace(finder, sNmspcKey + ":");
			}
			sCtext = this._addXMLEnvelope(mNamespaces, sCtext);

			var oControlXML = _oParser.parseFromString(sCtext, "text/xml");
			if (oControlXML.getElementsByTagName("parsererror").length > 0) {
				var sErrorMsg = oControlXML.getElementsByTagName("parsererror")[0].childNodes[1].innerHTML;
				throw new Error("Unable to add control to layout editor" + sErrorMsg);
			} else {
				oControlXML = oControlXML.children[0]; // expose content node
				oControlXML = oControlXML.children[0]; // expose control node
				mResult.node = oControlXML;
			}
			_innerControls2xml(oControl, mResult.node, oXmlRootNode);

			return mResult;
		};

		// Adds an xml envelope around a string.
		// Enriches the result with namespace declarations encapsulated in 'content' tag
		XMLManipulator.prototype._addXMLEnvelope = function (mNamespaces, sBody) {
			var sEnvelopeXML = '<content';
			for (var n in mNamespaces) {
				if (mNamespaces[n] === "") {
					sEnvelopeXML += ' xmlns:' + n + '=' + '"' + n + '"';
				} else {
					sEnvelopeXML += ' xmlns:' + mNamespaces[n] + '=' + '"' + n + '"';
				}
			}
			return sEnvelopeXML + '>' + sBody + '</content>';
		};

		// return the required aggregation. If it does not yet exist, create it on demand.
		XMLManipulator.prototype._getAggregation = function (oControl, sName, oTargetXML, iTargetIndex, oParent) {
			var parentXML;
			var oPXML = oParent ? oParent.__XMLNode : oControl.getParent().__XMLNode;
			if (oPXML && (oPXML.tagName.indexOf(":View") > -1 || oPXML.tagName.indexOf(":FragmentDefinition") > -1)) {
				parentXML = oPXML;
			}
			if (!parentXML) {
				parentXML = this._hasTagName(oTargetXML.children, sName);
				if (!parentXML) {
					var oNodeFragments = oTargetXML.nodeName.split(':');
					sName = oNodeFragments.length > 1 ? oNodeFragments[0] + ':' + sName : sName;
					var oNewAggregation = oTargetXML.ownerDocument.createElement(sName);
					oTargetXML.appendChild(oNewAggregation);
					this._formatAfterInsert(oNewAggregation);
					parentXML = oNewAggregation;
				}
			}

			//exclude extension points from consistency check
			var aChildren = [];
			jQuery.each(parentXML.children,function (idx, child){
				if(!isExtension(child)){
					aChildren.push(child);
				}
			});

			//checks if aggregation content node is consistent
			if (iTargetIndex && iTargetIndex > aChildren.length){
				parentXML = oControl.getParent().__XMLNode;
			}
			return parentXML;
		};

		XMLManipulator.prototype._hasTagName = function (aXmlControls, sTagName) {
			var oResult;
			for (var i = 0; i < aXmlControls.length; i++) {
				var sActName = aXmlControls[i].tagName;
				// if name is identical or used with a namespace
				if (sActName === sTagName || sActName.indexOf(":" + sTagName) > -1) {
					oResult = aXmlControls[i];
					break;
				}
			}
			return oResult;
		};

		// Correct xml formatting by removing text node. To be applied before removing a node from its location
		XMLManipulator.prototype._formatBeforeRemove = function (oXMLNode) {
			if (!oXMLNode) {
				return;
			}

			var oParent = oXMLNode.parentNode;
			if (!oParent) {
				return;
			}

			// Discover the environment
			var oPrev = oXMLNode.previousSibling;
			if (oPrev && oPrev.nodeType === oPrev.TEXT_NODE) {
				oParent.removeChild(oPrev);
			}
		};

		// Correct xml formatting by inserting text nodes
		XMLManipulator.prototype._formatAfterInsert = function (oXMLNode) {
			if (!oXMLNode) {
				return;
			}

			var oParent = oXMLNode.parentNode;
			if (!oParent) {
				return;
			}

			// Discover the environment
			var oParentPrev = oParent ? oParent.previousSibling : undefined;
			var oPrev = oXMLNode.previousSibling;
			var oPrev2 = oPrev ? oPrev.previousSibling : undefined;
			var oNext = oXMLNode.nextSibling;

			if (oPrev2 && oPrev2.nodeType === oPrev2.TEXT_NODE) {
				oParent.insertBefore(oPrev2.cloneNode(false), oXMLNode);
			} else if (oPrev && oPrev.nodeType === oPrev.TEXT_NODE) {
				if (oNext) {
					oParent.insertBefore(oPrev.cloneNode(false), oNext);
				} else {
					oParent.appendChild(oPrev.cloneNode(false));
				}
			} else if (oParentPrev && oParentPrev.nodeType === oParentPrev.TEXT_NODE) {
				oParent.insertBefore(oXMLNode.ownerDocument.createTextNode(oParentPrev.textContent + "    "), oXMLNode);
			}

			if (oParentPrev && oParent.children.length === 1) {
				oParent.appendChild(oXMLNode.ownerDocument.createTextNode(oParentPrev.textContent));
			}

			// to prevent adding extra newlines which caused by race condition
			jQuery.each(oParent.childNodes, function (idx, child) {
				if (child && child.nodeType === child.TEXT_NODE &&
					child.nextSibling && child.nextSibling.nodeType === child.nextSibling.TEXT_NODE) {
					oParent.removeChild(child.nextSibling);
				}
			});
		};

		XMLManipulator.prototype._formatDOM = function (oXMLNode) {
			var oQueue = [];
			oQueue.push(oXMLNode);

			var oPrev = oXMLNode.previousSibling;
			var sPrefix = "";
			if (oPrev && oPrev.nodeType === oPrev.TEXT_NODE) {
				sPrefix = oPrev.textContent;
			}
			this._formatLinearDOM(oQueue, sPrefix, 0);

		};

		// Correct xml formatting by inserting text nodes
		XMLManipulator.prototype._formatLinearDOM = function (oQueue, sPrefix) {
			while (oQueue.length > 0) {
				var node = oQueue[0];
				oQueue.shift();
				this._formatAfterInsert(node);

				var aChildren = node.childNodes;
				for (var i = 0; i < aChildren.length; i++) {
					oQueue.push(aChildren[i]);
				}

				this._formatLinearDOM(oQueue, sPrefix);
			}

		};

		/**
		 * recursive loop on the control and its aggregations that adds the xmlNode & xmlRootNode for each control
		 * @param {object} oControl current control
		 * @param {object} oXmlNode xml node of this control
		 * @param {object} oXmlRootNode xml node of the root view
		 * @private
		 */
		function _innerControls2xml(oControl, oXmlNode, oXmlRootNode) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
			var oAggregations = oControl.getMetadata().getAllAggregations();
			if (oAggregations) {
				var aggName;
				for (aggName in oAggregations) {
					//uses lodash filter to overcome namespaces issues
					var xmlAggChildren = jQuery(oXmlNode).children().filter(function (idx, node) {
						return localName(node) === aggName;
					});
					if (xmlAggChildren.length) {
						var aggControls = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.aggregationGetter(oControl, oAggregations[aggName]);
						jQuery.each(aggControls, function (idx, aggControl) {
							//we assume that there will be no more then a single aggregation with a certain name
							if (xmlAggChildren[0].children && xmlAggChildren[0].children.length > idx) {
								_innerControls2xml(aggControl, xmlAggChildren[0].children[idx], oXmlRootNode);
							}
						});
					}
				}
			}

			if (!oControl.__XMLNode) {
				jQuery.sap.log.debug('innerControls2xml: adding ' + localName(oXmlNode) + ' to control ' + oControl.sId);
				oXmlNode.setAttribute("id", oControl.sId);
				oControl.__XMLNode = oXmlNode;
			}

			if (!oControl.__XMLRootNode) {
				oControl.__XMLRootNode = oXmlRootNode;
			}
		}

		// Return the xml node for a the id of a control node
		XMLManipulator.prototype._getXMLNodeById = function (sId) {
			var oControl = this._getCore().byId(sId);
			return W5gUtils.getXMLNode(oControl);
		};

		// Return the xml ROOT node for the id of an arbitrary control node
		XMLManipulator.prototype._getXMLRootNodeById = function (sId) {
			var oControl = this._getCore().byId(sId);
			return W5gUtils.getXMLRootNode(oControl);
		};

		XMLManipulator.prototype = _.mapValues(XMLManipulator.prototype, function (value, key) {
			if (_.startsWith(key, "emit") && typeof value === "function") {
				return function () {
					var returnedValue = value.apply(this, arguments);
					if(this._flushFunc) {
						this._flushFunc();
					}
					return returnedValue;
				};
			} else {
				return value;
			}
		});

		return XMLManipulator;
	}
);
