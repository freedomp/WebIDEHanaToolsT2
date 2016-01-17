sap.ui.define(function () {
	"use strict";

	var PatchCore = {};

	PatchCore.patch = function(oWindow) {

		var oCore = oWindow.sap.ui.getCore();
		var mIds = {};

		oWindow.jQuery.sap.require("sap.ui.core.XMLTemplateProcessor");
		oWindow.jQuery.sap.require("sap.ui.core.mvc.View");

		oWindow.sap.ui.core.XMLTemplateProcessor.parseTemplate = function(
			xmlNode, oView) {

			var View = oWindow.sap.ui.core.mvc.View;
			var jQuery = oWindow.jQuery;

			function parseScalarType(sType, sValue, sName, oController) {
				// check for a binding expression (string)
				var oBindingInfo = oWindow.sap.ui.base.ManagedObject.bindingParser(sValue, oController, true);
				if ( oBindingInfo && typeof oBindingInfo === "object" ) {
					return oBindingInfo;
				}

				var vValue = sValue = oBindingInfo || sValue; // oBindingInfo could be an unescaped string
				var oType = oWindow.sap.ui.base.DataType.getType(sType);
				if (oType) {
					if (oType instanceof oWindow.sap.ui.base.DataType) {
						vValue = oType.parseValue(sValue);
					}
					// else keep original sValue (e.g. for enums)
				} else {
					throw new Error("Property " + sName + " has unknown type " + sType);
				}

				// Note: to avoid double resolution of binding expressions, we have to escape string values once again
				return typeof vValue === "string" ? oWindow.sap.ui.base.ManagedObject.bindingParser.escape(vValue) : vValue;
			}

			function localName(xmlNode) {
				// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
				return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
			}

			var aResult = [];
			// ==================
			// PATCH
			// ==================
			oView.__XMLNode = xmlNode;
			oView.__XMLRootNode = xmlNode; // the node representing the xml document, not only the root control

			// ==================
			// PATCH - END
			// ==================
			var sCurrentName = oView.sViewName || oView._sFragmentName; // TODO: should Fragments and Views be separated here?
			if (!sCurrentName) {
				var oTopView = oView;
				var iLoopCounter = 0; // Make sure there are not infinite loops
				while (++iLoopCounter < 1000 && oTopView && oTopView !== oTopView._oContainingView) {
					oTopView = oTopView._oContainingView;
				}
				sCurrentName = oTopView.sViewName;
			}

			if (oView.isSubView()) {
				parseNode(xmlNode, true);
			} else {
				parseChildren(xmlNode);
			}

			return aResult;

			/**
			 * Parses an XML node that might represent a UI5 control or simple XHTML.
			 * XHTML will be added to the aResult array as a sequence of strings,
			 * UI5 controls will be instantiated and added as controls
			 *
			 * @param xmlNode the XML node to parse
			 * @param bRoot whether this node is the root node
			 * @return undefined but the aResult array is filled
			 */
			function parseNode(xmlNode, bRoot, bIgnoreToplevelTextNodes) {

				if ( xmlNode.nodeType === 1 /* ELEMENT_NODE */ ) {

					var sLocalName = localName(xmlNode);
					if (xmlNode.namespaceURI === "http://www.w3.org/1999/xhtml" || xmlNode.namespaceURI === "http://www.w3.org/2000/svg") {
						// write opening tag
						aResult.push("<" + sLocalName + " ");
						// write attributes
						for (var i = 0; i < xmlNode.attributes.length; i++) {
							var attr = xmlNode.attributes[i];
							var value = attr.value;
							if (attr.name === "id") {
								value = oView._oContainingView.createId(value);
							}
							aResult.push(attr.name + "=\"" + jQuery.sap.encodeHTML(value) + "\" ");
						}
						if ( bRoot === true ) {
							aResult.push("data-sap-ui-preserve" + "=\"" + oView.getId() + "\" ");
						}
						aResult.push(">");

						// write children
						if (oWindow.HTMLTemplateElement && xmlNode instanceof oWindow.HTMLTemplateElement && xmlNode.content instanceof oWindow.DocumentFragment) {
							// <template> support (HTMLTemplateElement has no childNodes, but a content node which contains the childNodes)
							parseChildren(xmlNode.content);
						} else {
							parseChildren(xmlNode);
						}

						// close the tag
						aResult.push("</" + sLocalName + ">");

					} else if (sLocalName === "FragmentDefinition" && xmlNode.namespaceURI === "sap.ui.core") {
						// a Fragment element - which is not turned into a control itself. Only its content is parsed.
						parseChildren(xmlNode, false, true);
						// TODO: check if this branch is required or can be handled by the below one

					} else {

						// assumption: an ELEMENT_NODE with non-XHTML namespace is a SAPUI5 control and the namespace equals the library name
						var aChildren = createControlOrExtension(xmlNode);

						for (var i = 0; i < aChildren.length; i++) {
							var oChild = aChildren[i];
							if (oView.getMetadata().hasAggregation("content")) {
								oView.addAggregation("content", oChild);
							} else if (oView.getMetadata().hasAssociation(("content"))) {
								oView.addAssociation("content", oChild);
							}

							aResult.push(oChild);
						}

					}

				} else if (xmlNode.nodeType === 3 /* TEXT_NODE */ && !bIgnoreToplevelTextNodes) {

					var text = xmlNode.textContent || xmlNode.text,
						parentName = localName(xmlNode.parentNode);
					if (text) {
						if (parentName != "style") {
							text = jQuery.sap.encodeHTML(text);
						}
						aResult.push(text);
					}

				}

			}

			/**
			 * Parses the children of an XML node
			 */
			function parseChildren(xmlNode, bRoot, bIgnoreToplevelTextNodes) {
				var children = xmlNode.childNodes;
				for (var i = 0; i < children.length; i++) {
					parseNode(children[i], bRoot, bIgnoreToplevelTextNodes);
				}
			}

			function findControlClass(sNamespaceURI, sLocalName) {
				var sClassName;
				var mLibraries = oWindow.sap.ui.getCore().getLoadedLibraries();
				jQuery.each(mLibraries, function(sLibName, oLibrary) {
					if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
						sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
					}
				});
				// TODO guess library from sNamespaceURI and load corresponding lib!?
				sClassName = sClassName || sNamespaceURI + "." + sLocalName;

				// ensure that control and library are loaded
				jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists
				var oClassObject = jQuery.sap.getObject(sClassName);
				if (oClassObject) {
					return oClassObject;
				} else {
					jQuery.sap.log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor.js");
				}
			}

			/**
			 * Takes an arbitrary node (control or plain HTML) and creates zero or one or more SAPUI5 controls from it,
			 * iterating over the attributes and child nodes.
			 *
			 * @return an array with 0..n controls
			 * @private
			 */
			function createControls(node) {
				// differentiate between SAPUI5 and plain-HTML children
				if (node.namespaceURI === "http://www.w3.org/1999/xhtml" || node.namespaceURI === "http://www.w3.org/2000/svg" ) {
					var id = node.attributes['id'] ? node.attributes['id'].textContent || node.attributes['id'].text : null;
					// plain HTML node - create a new View control
					return [ new oWindow.sap.ui.core.mvc.XMLView({
						id: id ? oView._oContainingView.createId(id) : undefined,
						xmlNode:node,
						containingView:oView._oContainingView}) ];

				} else {
					// non-HTML (SAPUI5) control
					return createControlOrExtension(node);
				}
			}

			/**
			 * Creates 0..n UI5 controls from an XML node which is not plain HTML, but a UI5 node (either control or ExtensionPoint).
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 *
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createControlOrExtension(node) { // this will also be extended for Fragments with multiple roots

				if (localName(node) === "ExtensionPoint" && node.namespaceURI === "sap.ui.core") {
					// create extensionpoint with callback function for defaultContent - will only be executed if there is no customizing configured or if customizing is disabled
					return oWindow.sap.ui.extensionpoint(oView, node.getAttribute("name"), function(){
						var children = node.childNodes;
						var oDefaultContent = [];
						for (var i = 0; i < children.length; i++) {
							var oChildNode = children[i];
							if (oChildNode.nodeType === 1 /* ELEMENT_NODE */) { // text nodes are ignored - plaintext inside extension points is not supported; no warning log because even whitespace is a text node
								oDefaultContent = jQuery.merge(oDefaultContent, createControls(oChildNode));
							}
						}
						return oDefaultContent;
					});

				} else {
					// a plain and simple regular UI5 control
					return createRegularControls(node);
				}
			}

			/**
			 * Creates 0..n UI5 controls from an XML node.
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 *
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createRegularControls(node) {
				var ns = node.namespaceURI,
					oClass = findControlClass(ns, localName(node)),
					mSettings = {},
					sStyleClasses = "",
					aCustomData = [];

				if (!oClass) {
					return [];
				}
				var oMetadata = oClass.getMetadata();
				var mKnownSettings = oMetadata.getAllSettings();

				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i],
						sName = attr.name,
						oInfo = mKnownSettings[sName],
						sValue = attr.value;

					// apply the value of the attribute to a
					//   * property,
					//   * association (id of the control),
					//   * event (name of the function in the controller) or
					//   * CustomData element (namespace-prefixed attribute)

					if (sName === "id") {
						// special handling for ID
						mSettings[sName] = oView._oContainingView.createId(sValue);

					} else if (sName === "class") {
						// special handling for CSS classes, which will be added via addStyleClass()
						sStyleClasses += sValue;

					} else if (sName === "viewName") {
						mSettings[sName] = sValue;

					} else if (sName === "fragmentName") {
						mSettings[sName] = sValue;
						mSettings['containingView'] = oView._oContainingView;

					} else if ((sName === "binding" && !oInfo) || sName === 'objectBindings' ) {
						var oBindingInfo = oWindow.sap.ui.base.ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
						// TODO reject complex bindings, types, formatters; enable 'parameters'?
						mSettings.objectBindings = mSettings.objectBindings || {};
						mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;

					} else if (sName.indexOf(":") > -1) {  // namespace-prefixed attribute found
						if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1") {  // CustomData attribute found
							var sLocalName = localName(attr);
							aCustomData.push(new oWindow.sap.ui.core.CustomData({
								key:sLocalName,
								value:parseScalarType("any", sValue, sLocalName, oView._oContainingView.oController)
							}));
						} else if ( sName.indexOf("xmlns:") !== 0 ) { // other, unknown namespace and not an xml namespace alias definition
							jQuery.sap.log.warning(oView + ": XMLView parser encountered and ignored attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace");
							// TODO: here XMLView could check for namespace handlers registered by the application for this namespace which could modify mSettings according to their interpretation of the attribute
						}

					} else if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
						// other PROPERTY
						mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController); // View._oContainingView.oController is null when [...]
						// FIXME: ._oContainingView might be the original Fragment for an extension fragment or a fragment in a fragment - so it has no controller bit ITS containingView.

					} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
						// AGGREGATION with scalar type (altType)
						mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController);

					} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
						var oBindingInfo = oWindow.sap.ui.base.ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
						if ( oBindingInfo ) {
							mSettings[sName] = oBindingInfo;
						} else {
							// TODO we now in theory allow more than just a binding path. Update message?
							jQuery.sap.log.error(oView + ": aggregations with cardinality 0..n only allow binding paths as attribute value (wrong value: " + sName + "='" + sValue + "')");
						}

					} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
						// ASSOCIATION
						mSettings[sName] = oView._oContainingView.createId(sValue); // use the value as ID

					} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
						// we support "," and " " to separate IDs
						/*eslint-disable no-loop-func */
						mSettings[sName] = jQuery.map(sValue.split(/[\s,]+/g), function(sId) {
							// Note: empty IDs need to ignored, therefore splitting by a sequence of separators is okay.
							return sId ? oView._oContainingView.createId(sId) : null;
						});
						/*eslint-enable no-loop-func */

					} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
						// EVENT
						var vEventHandler = View._resolveEventHandler(sValue, oView._oContainingView.oController);
						if ( vEventHandler ) {
							mSettings[sName] = vEventHandler;
						} else {
							jQuery.sap.log.warning(oView + ": event handler function \"" + sValue + "\" is not a function or does not exist in the controller.");
						}
					} else if (oInfo && oInfo._iKind === -1) {
						// SPECIAL SETTING - currently only allowed for Viewֲ´s async setting
						if (sap.ui.core.mvc.View.prototype.isPrototypeOf(oClass.prototype) && sName == "async") {
							mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController);
						} else {
							jQuery.sap.log.warning(oView + ": setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "') is not supported");
						}
					} else {
						jQuery.sap.assert(sName === 'xmlns', oView + ": encountered unknown setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "')");
					}
				}
				if (aCustomData.length > 0) {
					mSettings.customData = aCustomData;
				}

				function handleChildren(node, oAggregation, mAggregations) {

					var childNode,oNamedAggregation;

					// loop over all nodes
					for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {

						// inspect only element nodes
						if (childNode.nodeType === 1 /* ELEMENT_NODE */) {

							// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
							oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
							if (oNamedAggregation) {

								// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
								handleChildren(childNode, oNamedAggregation);

							} else if (oAggregation) {
								// child node name does not equal an aggregation name,
								// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
								var aControls = createControls(childNode);
								for (var j = 0; j < aControls.length; j++) {
									var oControl = aControls[j];
									// append the child to the aggregation
									var name = oAggregation.name;
									if (oAggregation.multiple) {
										// 1..n AGGREGATION
										if (!mSettings[name]) {
											mSettings[name] = [];
										}
										if (typeof mSettings[name].path === "string") {
											jQuery.sap.assert(!mSettings[name].template, "list bindings support only a single template object");
											mSettings[name].template = oControl;
										} else {
											mSettings[name].push(oControl);
										}
									} else {
										// 1..1 AGGREGATION
										jQuery.sap.assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
										mSettings[name] = oControl;
									}
								}
							} else if (localName(node) !== "FragmentDefinition" || node.namespaceURI !== "sap.ui.core") { // children of FragmentDefinitions are ok, they need no aggregation
								throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
							}

						} else if (childNode.nodeType === 3 /* TEXT_NODE */) {
							if (jQuery.trim(childNode.textContent || childNode.text)) { // whitespace would be okay
								throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed: " + jQuery.trim(childNode.textContent || childNode.text));
							}
						} // other nodes types are silently ignored

					}
				}

				// loop child nodes and handle all AGGREGATIONS
				var oAggregation = oMetadata.getDefaultAggregation();
				var mAggregations = oMetadata.getAllAggregations();
				handleChildren(node, oAggregation, mAggregations);

				// apply the settings to the control
				var vNewControlInstance;

				//PATCH START
				//...attempt to detail the flow error description when it happens
				try {
					if (oWindow.sap.ui.core.mvc.View.prototype.isPrototypeOf(oClass.prototype) && typeof oClass._sType === "string") {
						// for views having a factory function defined we use the factory function!
						vNewControlInstance = oWindow.sap.ui.view(mSettings, undefined, oClass._sType);
					} else {
						// call the control constructor
						// NOTE: the sap.ui.core.Fragment constructor can return an array containing multiple controls (for multi-root Fragments)
						//   This is the reason for all the related functions around here returning arrays.
						vNewControlInstance = new oClass(mSettings);
					}
				} catch (oError) {
					throw new Error(["The ", oMetadata.getName(), " control could not be created.", oError.message].join(""));
				}
				//PATCH END

				// ==================
				// PATCH
				// ==================


				//if (sStyleClasses && vNewControlInstance.addStyleClass) {
				//	// Elements do not have a style class!
				//	vNewControlInstance.addStyleClass(sStyleClasses);
				//}

				if (!vNewControlInstance) {
					vNewControlInstance = [];
				} else if (!jQuery.isArray(vNewControlInstance)) {
					vNewControlInstance = [vNewControlInstance];
				}

				vNewControlInstance.forEach(function (vInstance) {
					vInstance.__XMLNode = node;
					vInstance.__XMLRootNode = xmlNode;
					vInstance.__FragmentName = mSettings['fragmentName'];
					if (sStyleClasses && vInstance.addStyleClass) {
						// Elements do not have a style class!
						vInstance.addStyleClass(sStyleClasses);
					}
				});
				// ==================
				// PATCH - END
				// ==================
				return vNewControlInstance;
			}
		};



		// Remember IDs of all created Managed Objects
		var fnOrigApplySettings = oWindow.sap.ui.base.ManagedObject.prototype.applySettings;
		oWindow.sap.ui.base.ManagedObject.prototype.applySettings = function() {
			mIds[this.sId] = true;
			return fnOrigApplySettings.apply(this, arguments);
		};

		// Cleanup IDs when Managed Objects are destroyed
		var fnOrigDestroy = oWindow.sap.ui.base.ManagedObject.prototype.destroy;
		oWindow.sap.ui.base.ManagedObject.prototype.destroy = function() {
			try {
				delete mIds[this.sId];
				fnOrigDestroy.apply(this, arguments);
			} catch (e) {
				jQuery.sap.log.error(e);
			}
		};

		// Override the original UID methods
		var mUIDCounts = {};
		var uid = function(sId) {
			jQuery.sap.assert(!/[0-9]+$/.exec(sId), "AutoId Prefixes must not end with numbers");

			sId = sap.ui.getCore().getConfiguration().getUIDPrefix() + sId;

			// initialize counter
			mUIDCounts[sId] = mUIDCounts[sId] || 0;

			/* START PATCH*/
			//this patch is to deal with duplicated id issues which can happen if there were some registrations to the dom before the w5g patched ui5 core
			//it checks for up to 100 rounds if the id is already exits - o/w it will later fail for duplicate id issue.
			//once the entire patch will be moved to be part of ui5 core THIS PATCH SECTION SHOULD BE REMOVED
			var sIdNew;
			var round = 0;
			var oView = _findRootView();
			do {
				sIdNew = sId + mUIDCounts[sId]++;
			} while ((oView && _hasDuplicateId(oView.__XMLNode, sIdNew) || oCore.byId(sIdNew)) && round++ < 100);
			return sIdNew;
			/* END PATCH*/

			//ORIGINAL CODE:
			// combine prefix + counter
			// concatenating sId and a counter is only safe because we don't allow trailing numbers in sId!
			// return (sId + mUIDCounts[sId]++);
		};

		function _findRootView() {
			var sId, oControl;
			for (sId in mIds) {
				oControl = oCore.byId(sId);
				if (oControl && (oControl instanceof oWindow.sap.ui.core.mvc.View) && _isTopView(oControl)) {
					return oControl;
				}
			}
			return null;
		}
		function _isTopView(oView) {
			var oControl = oView.getParent();
			while (oControl && !(oControl instanceof oWindow.sap.ui.core.mvc.View)) {
				oControl = oControl.getParent();
			}
			return !oControl;
		}
		function _hasDuplicateId(oNode, sId) {
			var bRes = false;
			jQuery.each(oNode.children || {}, function() {
				if (this.getAttribute("id") === sId) {
					bRes = true;
					return false;
				}
				if (this.children) {
					bRes |= _hasDuplicateId(this, sId);
				}
				if (bRes) {
					return false;
				}
			});
			return !!bRes;
		}

		oWindow.sap.ui.base.ManagedObjectMetadata.uid = uid;
		oWindow.sap.ui.core.ElementMetadata.uid = uid;

		oWindow.sap.ui.base.ManagedObjectMetadata.prototype.uid = function() {
			var sId = this._sUIDToken;
			if ( typeof sId !== "string" ) {
				// start with qualified class name
				sId  = this.getName();
				// reduce to unqualified name
				sId = sId.slice(sId.lastIndexOf('.')+1);
				// reduce a camel case, multi word name to the last word
				sId = sId.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").slice(-1)[0];
				// remove unwanted chars (and no trailing digits!) and convert to lower case
				sId = this._sUIDToken = sId.replace(/([^A-Za-z0-9-_.:])|([0-9]+$)/g,"").toLowerCase();
			}

			return oWindow.sap.ui.base.ManagedObjectMetadata.uid(sId);
		};

		var iIdCounter = 0;

		oWindow.jQuery.sap.uid = function uid() {
			return "id-" + new Date().valueOf() + "-" + iIdCounter++;
		};

		// Patch for delayed calls. Some controls do not clear their delayed calls when destroyed, so that the calls
		// are performed even, when the object is already destroyed. This leads into errors.
		oWindow.jQuery.sap.delayedCall = function delayedCall(iDelay, oObject, method, aParameters) {
			return setTimeout(function(){
				//*** PATCH BEGIN ***//
				if (!oWindow.sap) {
					// This can happen on reload wysiwyg IFrame.
					// The previous instance of ui5 has already been destroyed, but js framework still works with it
					return;
				}
				if (oObject instanceof oWindow.sap.ui.base.ManagedObject && oObject.bIsDestroyed || !oWindow.parent) {
					return;
				}
				//*** PATCH END ***//
				if (oWindow.jQuery.type(method) == "string") {
					method = oObject[method];
				}
				try {
					method.apply(oObject, aParameters || []);
				} catch (e) {
					jQuery.sap.log.error(e);
				}
			}, iDelay);
		};


		oWindow.jQuery.sap.intervalCall = function intervalCall(iInterval, oObject, method, aParameters) {
			return setInterval(function(){
				//*** PATCH BEGIN ***//
				if (oObject instanceof oWindow.sap.ui.base.ManagedObject && oObject.bIsDestroyed || !oWindow.parent) {
					return;
				}
				//*** PATCH END ***//
				if (oWindow.jQuery.type(method) == "string") {
					method = oObject[method];
				}
				method.apply(oObject, aParameters || []);
			}, iInterval);
		};

		// Add a reset method to the core
		oCore.reset = function() {
			// Clean up the core, as there might be instances which are not associated to the view
			// UI5 does not provide a better way to clean this up, so we use this algorithm
			for (var sId in mIds) {
				var oControl = oCore.byId(sId);
				if (oControl) {
					oControl.destroy();
					//...start workarround --> some ui5 controls implements 'destroy' method by itself
					// but they not call the basic Element.destroy(). As a result they ids stuck
					// in Core.mElements list and entire flow fails on duplicate ids.
					oControl.deregister && oControl.deregister();
					//...end workarround
				}
			}
			mIds = {};
			mUIDCounts = {};
			iIdCounter = 0;
		};

		oWindow.jQuery.sap.require("sap.m.IconTabBar");
		oWindow.sap.m.IconTabBar.prototype._getIconTabHeader = function () {

			var oControl = this.getAggregation("_header");

			/////////////////
			// PATCH BEGIN //
			if (!oControl) {
				oControl = oWindow.sap.ui.getCore().byId(this.getId() + "--header");
			}
			// PATCH END //
			/////////////////

			if (!oControl) {
				oWindow.jQuery.sap.require("sap.m.IconTabHeader");
				oControl = new oWindow.sap.m.IconTabHeader(this.getId() + "--header", {
				});
				this.setAggregation("_header", oControl, true);
			}
			return oControl;
		};

		/**
		 * "Swallows exceptions in DT
		 */
		var _fnOriginalValidateProperty = oWindow.sap.ui.base.ManagedObject.prototype.validateProperty;
		oWindow.sap.ui.base.ManagedObject.prototype.validateProperty = function(sPropertyName, oValue) {
			try {
				return _fnOriginalValidateProperty.apply(this , arguments);
			} catch(e) {
				//fallback
				jQuery.sap.log.debug("swallowed error : " + e);
				return oValue;
			}
		};

		/**
		 * "Swallows exceptions in DT
		 */
		var _fnOriginalGetExternalValueCompositeBinding = oWindow.sap.ui.model.CompositeBinding.prototype.getExternalValue;
		oWindow.sap.ui.model.CompositeBinding.prototype.getExternalValue = function() {
			try {
				return _fnOriginalGetExternalValueCompositeBinding.apply(this , arguments);
			} catch(e) {
				//fallback
				jQuery.sap.log.debug("swallowed error for CompositeBinding.getExternalValue : " + e);
				return null;
			}
		};

		/**
		 * "Swallows exceptions in DT
		 */
		var _fnOriginalGetExternalValuePropertyBinding = oWindow.sap.ui.model.PropertyBinding.prototype.getExternalValue;
		oWindow.sap.ui.model.PropertyBinding.prototype.getExternalValue = function() {
			try {
				return _fnOriginalGetExternalValuePropertyBinding.apply(this , arguments);
			} catch(e) {
				//fallback
				jQuery.sap.log.debug("swallowed error for PropertyBinding.getExternalValue : " + e);
				return this.getValue();
			}
		};

		var _fnOriginalWriteEscaped = oWindow.sap.ui.core.RenderManager.prototype.writeEscaped;
		oWindow.sap.ui.core.RenderManager.prototype.writeEscaped = function(/** string */ sText, bLineBreaks) {
			if (typeof sText !== "string") {
				sText = (sText || "") + "";
			}
			return _fnOriginalWriteEscaped.call(this , sText, bLineBreaks);
		};

		/**
		 * Clones the given <code>oControl</code> control
		 *
		 * @param {sap.ui.core.Control} oControl
		 * @return {sap.ui.core.Control} Return the reference to the newly created clone
		 *
		 * @name _clone
		 * @function
		 * @private
		 */
		var _fnOriginalClone = oWindow.sap.ui.base.ManagedObject.prototype.clone;
		oWindow.sap.ui.base.ManagedObject.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
			var oClone = _fnOriginalClone.apply(this, arguments);
			oClone.__XMLNode = this.__XMLNode;
			oClone.__XMLRootNode = this.__XMLRootNode;

			return oClone;
		};

		oWindow.jQuery.sap.require('sap.ui.dt.DOMUtil');
		oWindow.sap.ui.dt.DOMUtil.getSize = function(oDomRef) {
			//*** PATCH BEGIN ***//
			var oClientRec = oDomRef.getBoundingClientRect();
			return {
				width : oClientRec.width,
				height : oClientRec.height
			};
			//*** PATCH END ***//
		};

		/**
		 * Patch for sap.ui.dt.ElementUtil.isValidForAggregation since it does not consider interface types
		 * See in issue 22 in WIKI: 1740748722
		 */
		oWindow.jQuery.sap.require("sap.ui.dt.ElementUtil");
		var _fnOriginalValidForAggregation = oWindow.sap.ui.dt.ElementUtil.isValidForAggregation;
		oWindow.sap.ui.dt.ElementUtil.isValidForAggregation = function(oParent, sAggregationName, oElement) {
			var bIsValid = _fnOriginalValidForAggregation.apply(this, arguments);

			if (!bIsValid) {
				var oAggregationMetadata = oParent.getMetadata().getAggregation(sAggregationName),
					sAggregationType = oAggregationMetadata && oAggregationMetadata.type; //May be interface
				bIsValid = oElement.getMetadata()._aInterfaces.indexOf(sAggregationType) !== -1;
			}
			return bIsValid;
		};

		oWindow.sap.ui.dt.ElementUtil.insertAggregation = function(oParent, sAggregationName, oElement, iIndex) {
			if (this.hasAncestor(oParent, oElement)) {
				throw new Error("Trying to add an element to itself or its successors");
			}
			if (this.getAggregation(oParent, sAggregationName).indexOf(oElement) !== -1) {
				// ManagedObject.insertAggregation won't reposition element, if it's already inside of same aggregation
				// therefore we need to remove the element and then insert it again. To prevent ManagedObjectObserver from firing
				// setParent event with parent null, private flag is set.
				oElement.__bSapUiDtSupressParentChangeEvent = true;
				try {
					// invalidate should be supressed, because if the controls have some checks and sync on invalidate,
					// internal structure can be also removed (SimpleForm invalidate destroyed all content temporary)

					//PATCH START - after discussion with Mikhail returned to old implementation
					// the problem was that removeAggregation in case of SimpleForm:content does nothing
					// while the mutator used in ElementUtil.removeAggregation does the job.
					//oParent.removeAggregation(sAggregationName, oElement, true);
					this.removeAggregation(oParent, sAggregationName, oElement, true);
					//PATCH END
				} finally {
					delete oElement.__bSapUiDtSupressParentChangeEvent;
				}
			}
			var sAggregationInsertMutator = this.getAggregationMutators(oParent, sAggregationName).insert;
			oParent[sAggregationInsertMutator](oElement, iIndex);
		};


		// Patch until we get GIT: 1268071 & GIT: 1283663
		oWindow.jQuery.sap.require("sap.ui.dt.ControlObserver");
		oWindow.sap.ui.dt.ControlObserver.prototype._startMutationObserver = function() {
			var that = this;
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

			/////////////////
			// PATCH BEGIN //
			var oTargetInstance = this.getTargetInstance();
			var oDomRef = oTargetInstance && oTargetInstance.getDomRef();
			// PATCH END //
			/////////////////

			if (MutationObserver && oDomRef) {
				this.oMutationObserver = new MutationObserver(function(aMutations) {
					that.fireDomChanged();
				});
				this.oMutationObserver.observe(oDomRef, {
					childList : true,
					subtree : true,
					attributes : true
				});
			}
		};

		oWindow.jQuery.sap.require("sap.ushell.ui.footerbar.AddBookmarkButton");
		oWindow.sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setEnabled = oWindow.sap.m.Button.prototype.setEnabled;


		var oRegExp = /:sap-domref/g;
		oWindow.jQuery.sap.require("sap.ui.dt.DOMUtil");
		var _fnOriginalGetDomRefForCSSSelector = oWindow.sap.ui.dt.DOMUtil.getDomRefForCSSSelector;
		oWindow.sap.ui.dt.DOMUtil.getDomRefForCSSSelector = function(oDomRef, sCSSSelector) {
			if (oRegExp.test(sCSSSelector) && oDomRef.id) {
				return oWindow.document.querySelector(sCSSSelector.replace(oRegExp, "#" + this.getEscapedString(oDomRef.id)));
			}
			return _fnOriginalGetDomRefForCSSSelector.apply(this, arguments);
		};

	};

	return PatchCore;
}, /* bExport= */ true);

