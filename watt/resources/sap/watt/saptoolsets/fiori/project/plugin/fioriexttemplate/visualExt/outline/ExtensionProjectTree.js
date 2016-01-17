/****************************************************************************************************************
 * ExtensionProjectTree - a class represents the component in the extensibility pane responsible for the outline tree
 * (and its filtering options) UI and logic.
 *
 * Instance of this class is created and used by UIContent.
 *
 * In future, this object should be replaced with UI5 view and controller responsible for the extensibility pane outline.
 *
 * Usage guidelines:
 * - create a new instance: obj = new ExtensionProjectTree(...)
 * - call obj.createContent() to get the UI (in order to display it) - This method must be called only once in the object lifecycle.
 * - use the instance methods for performing operations (add / remove extensions, get selected node data, etc).
 * - never perform operations directly on the UI controls received by the createContent method. Instead use the appropriate instance methods.
 ****************************************************************************************************************/
"use strict";
define(["../contentProvider/TreeContentProvider",
		"sap/watt/platform/plugin/utils/xml/XmlUtil",
		"../util/ExtendUtil",
		"../../util/ExtensionHook",
		"sap/watt/lib/lodash/lodash"],
	function(TreeContentProvider, xmlUtil, ExtendUtil, ExtensionHook, _) {

	/**
	 * Constructor for the ExtensionProjectTree class
	 *
	 * @param oContext
	 * @param oExtensionProjectDocument
	 * @param oExtensibilityModel
	 * @param oExtPointsHooksDocumentation
	 * @constructor
	 */
	var ExtensionProjectTree = function(oContext, oExtensionProjectDocument, oExtensibilityModel, oExtPointsHooksDocumentation) {

		jQuery.sap.require("sap.ui.core.IconPool");
		var that = this;
		var treeContentProvider = new TreeContentProvider(oContext);
		var sExtensionProjectPath = oExtensionProjectDocument.getEntity().getFullPath();
		var customizingJson;

		this._mFragmentToView = null;

		/**
		 * The merged array containing the resource files (views/fragments/controllers) of both the parent and extension projects
		 * @type {Object[]}
		 * @private
		 */
		this._aResourcesInfo = null;

		/**
		 * There is one instance of the tree only. The same instance is filtered differently using UI5 filtering to view
		 * the different trees available in the extensibility pane.
		 *
		 * @type {sap.ui.commons.Tree}
		 * @private
		 */
		this._tree = null;

		/**
		 * Selection handlers that will be called on selection of a node tree. Each selection handler will be called with
		 * two arguments: the original UI5 oEvent and the oSelectedNode
		 * @type {Function[]}
		 * @private
		 */
		this._treeSelectionHandlers = [];

		/**
		 * Right click handlers that will be called when a user right clicks on a tree node. Each handler will be called
		 * with two arguments: the original UI5 oEvent and the oSelectedNode
		 * @type {Function[]}
		 * @private
		 */
		this._treeRightClickHandlers = [];

		/**
		 * The node hovered on currently.
		 *
		 * @type {_hoverNode}
		 * @private
		 */
		this._hoverNode = null;

		/**
		 * Returns the customizing json of all the extensions from the extension project.
		 *
		 * Exposed on this for testing purposes only so it can be mocked and createContent can be easily tested.
		 * @private
		 */
		this._getExtensionsFromExtensionProject = function(){
			return oContext.service.ui5projecthandler.getAllExtensions(oExtensionProjectDocument);
		};

		/**
		 * Returns the resources info from the parent project.
		 *
		 * Exposed on this for testing purposes only so it can be mocked and createContent can be easilty tested.
		 * @private
		 */
		this._getParentResourcesInfo = function() {
			return treeContentProvider.getTreeNodes(sExtensionProjectPath, oExtensibilityModel, oExtensionProjectDocument, oContext);
		};

		/**
		 * Method for creating the UI.
		 *
		 * @returns {Object} uiContent 					   - The UI content containing the grid layout of the title and
		 * 													 the dropdown along with the tree.
		 * @returns {sap.ui.layout.Grid} uiContent.top     - Grid layout containing the title label and the filter
		 * 													 dropdown.
		 * @returns {sap.ui.commons.Tree} uiContent.middle - The tree.
		 */
		this.createContent = function() {
			var uiContent = this._createUIContent();
			return that._getExtensionsFromExtensionProject().then(function (mAllExtensions) {
				customizingJson = mAllExtensions;
				return that._getParentResourcesInfo().then(function(resourcesInfo) {
					that._aResourcesInfo = resourcesInfo;
					that._tree.removeAllNodes();

					var oModel = that._createTreeModel();
					that._tree.setModel(oModel);

					var aResourceNodes = _getResourceNodes();
					for (var i = 0; i < aResourceNodes.length; i++) {
						aResourceNodes[i].setExpanded(false);
					}
					_mapViewsToFragments();

					return uiContent;
				});
			});
		};

		/**
		 * Creation of the Grid layout of the filter that contains the title label and the dropdown box.
		 * Not exposed on this since it can be tested by testing _createUIContent
		 */
		var _createFilterGridLayout = function() {

			// Application Outline Label
			var applicationOutlineLabel = new sap.ui.commons.Label({
				text: oContext.i18n.getText("i18n", "VisualExt_ApplicationOutline"),
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L11 M11 S11",
					linebreak: true
				})
			}).addStyleClass("previewTitleLabel");

			// filter drop-down
			var filterOptionsDropdownBox = new sap.ui.commons.DropdownBox("filterOptionsDropdownBox", {
				value: {
					path: "value",
					type: new sap.ui.model.type.String()
				},
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L11 M11 S11",
					linebreak: true
				}),
				items: [new sap.ui.core.ListItem("showAllElements", {
					text: oContext.i18n.getText("i18n", "VisualExt_AllItems")
				}), new sap.ui.core.ListItem("showExtendedElements", {
					text: oContext.i18n.getText("i18n", "VisualExt_ExtendedItems")
				}), new sap.ui.core.ListItem("showExtensibleElements", {
					text: oContext.i18n.getText("i18n", "VisualExt_ExtendableItems")
				}), new sap.ui.core.ListItem("showExtensionPoints", {
					text: oContext.i18n.getText("i18n", "VisualExt_ExtensionPoints")
				})]
			}).addStyleClass("flatControlSmall");

			filterOptionsDropdownBox.attachChange(function(oEvent) {
				var sSelectedItemText = oEvent.getParameter("selectedItem").getText();
				var oTreeBinding = that._tree.getBinding("nodes");
				var aFilters = [];
				switch (sSelectedItemText) {
					case oContext.i18n.getText("i18n", "VisualExt_ExtendedItems"):
						aFilters.push(new sap.ui.model.Filter("isExtended", sap.ui.model.FilterOperator.EQ, true));
						break;
					case oContext.i18n.getText("i18n", "VisualExt_ExtendableItems"):
						aFilters.push(new sap.ui.model.Filter("isExtendable", sap.ui.model.FilterOperator.EQ, true));
						break;
					case oContext.i18n.getText("i18n", "VisualExt_ExtensionPoints"):
						aFilters.push(new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.EQ, ExtendUtil.EXT_TYPE_EXT_POINT));
						break;
					case oContext.i18n.getText("i18n", "VisualExt_AllItems"):
					default :
						// Leave the array empty, resulting in a complete tree
				}

				oTreeBinding.filter(aFilters);
				that._handleSelectionAfterFilter();
			});

			var filterGridLayout = sap.ui.getCore().byId("filterGridLayout");
			if (filterGridLayout === undefined) {
				filterGridLayout = new sap.ui.layout.Grid({
					layoutData: new sap.ui.layout.GridData({
						span: "L11 M11 S11",
						linebreak: true
					}),
					content: [applicationOutlineLabel, filterOptionsDropdownBox]
				});
			}

			filterGridLayout.setVSpacing(0);

			return filterGridLayout;
		};

		/**
		 * Creation of the tree UI element
		 */
		var _createTree = function() {

			var tree = new sap.ui.commons.Tree({
				layoutData: new sap.ui.layout.GridData({
					span: "L11 M11 S11",
					linebreak: true
				}),
				width: "100%",
				height: "100%",
				showHeader: false,
				showHeaderIcons: false,
				showHorizontalScrollbar: true,
				selectionMode: sap.ui.commons.TreeSelectionMode.Single
			}).bindNodes({
				path : "/",
				template : that._getTreeNodeTemplate(),
				parameters : { arrayNames : [ "childTreeNodeModels" ] }
			});

			//Attach a callback for the selection on the tree. This callback calls all the callbacks attached to
			//the this._treeSelectionHandlers
			tree.attachSelect(_onNodeSelected, that);

			//Attach the tight click event handler on the tree. This handler is called when a right click happens on any
			//tree node.
			tree.attachBrowserEvent("contextmenu", _onRightClick, that);

			//Save instance of the tree on this
			that._tree = tree;

			return tree;
		};

		/**
		 * This is the handler called when a user right clicks any tree node.
		 * The function receives the browser right click event and form it the DOM element as a target,
		 * then it translates it to the UI5 tree node containing the DOM element
		 *
		 * @param oEvent - the right click event (browser event and not UI5 event)
		 */
		var _onRightClick = function(oEvent) {
			oEvent.preventDefault();
			var element = oEvent.target;
			while (element && !element.attributes["id"]) {
				element = element.parentElement;
			}
			if (element && element.attributes["id"]) {
				var sId = element.attributes["id"].value;
				var oNode = sap.ui.getCore().byId(sId);
				if (oNode) {
					that._tree.setSelection(oNode);

					var nodeModelData = oNode.getBindingContext().getObject();
					if (!nodeModelData.isRoot) {
						_.forEach(this._treeRightClickHandlers, function(fHandler) {
							fHandler(oEvent, oNode);
						});
					}
				}
			}
		};

		/**
		 * This is the handler called when a user selects any tree node. This is the only handler attached to the UI5
		 * tree control.
		 * This handler calls all the callbacks attached to the ExtensionProjectTree.
		 *
		 * @private
		 */
		var _onNodeSelected = function(oEvent) {
			var oSelectedNode = oEvent.getParameters().node;

			_.forEach(this._treeSelectionHandlers, function(fHandler) {
				fHandler(oEvent, oSelectedNode);
			});
		};

		/**
		 * Creation of UI content only without any logic.
		 * The UI created here is the tree and the dropdown filter
		 *
		 * //TODO This should be moved to the future outline view implementation.
		 *
		 * Exposed on this for testability reasons only
		 *
		 * @private
		 */
		this._createUIContent = function() {
			return {
				top: _createFilterGridLayout(),
				middle: _createTree()
			};
		};

		/**
		 * Returns the documentation of the node in case it exists
		 * @param oResourceInfo
		 * @param sNodeName
		 * @param sTooltipTile
		 * @returns {*}
		 * @private
		 */
		this._getDocumentationTooltip = function(oResourceInfo, sNodeName, sTooltipTile) {
			var nodeKey;
			if (oResourceInfo && oResourceInfo.type) {
				//The file name is on prupose built manually and not taken from the path field since in the extended controller the path field does not exist
				//in the oResourceInfo object. The file in which the extended controller  hook exists is not the same file in which the original hook was defined.
				var fileName = "";
				if (oResourceInfo.originalName) {
					fileName = oResourceInfo.originalName;
				} else if (oResourceInfo.name) {
					fileName = oResourceInfo.name;
				}
				switch (oResourceInfo.type) {
					case "controller":
						fileName += ".controller.js";
						break;
					case "view":
						fileName += ".view.xml"; //Only XML views are supported in the extensibility pane.
						break;
					case "fragment":
						fileName += ".fragment.xml"; //Only XML fragments are supported in the extensibility pane.
						break;
					default:
				}
				nodeKey = fileName + "." + (sNodeName ? sNodeName : "");
			}
			if (oExtPointsHooksDocumentation && nodeKey && oExtPointsHooksDocumentation[nodeKey]) {
				var description = oExtPointsHooksDocumentation[nodeKey].Description === "" ? oContext.i18n.getText("i18n", "ExtDocumentation_NotAvailable") : oExtPointsHooksDocumentation[nodeKey].Description;
				return sTooltipTile + ": " + description;
			} else {
				return null;
			}
		};

		// get the new text after each node is extended
		var _getNewResourceText = function(nodeModelData, resourceId) {
			var customizationId = nodeModelData.customizationId;
			var resourceType = nodeModelData.type;
			var newResourceText;
			var newId;
			if (resourceType === ExtendUtil.EXT_TYPE_VIEW) {
				if (resourceId && customizingJson[customizationId]) {
					newId = customizingJson[customizationId][resourceId]["viewName"];
					if (newId) {
						newResourceText = newId.substr(newId.lastIndexOf('.') + 1);
						return newResourceText;
					}
				}
			} else if (resourceType === ExtendUtil.EXT_TYPE_CONTROLLER) {
				if (resourceId && customizingJson[customizationId]) {
					newId = customizingJson[customizationId][resourceId]["controllerName"];
					if (newId) {
						newResourceText = newId.substr(newId.lastIndexOf('.') + 1);
						return newResourceText;
					}
				}
			} else if (resourceType === ExtendUtil.EXT_TYPE_EXT_POINT) {
				newId = customizingJson[customizationId][resourceId][nodeModelData.extensionId]["fragmentName"];
				if (newId) {
					newResourceText = newId.substr(newId.lastIndexOf('.') + 1);
					return newResourceText;
				}
			}
		};

		// get the created file path after adding extension
		var _getFilePath = function(nodeModelData, resourceId) {
			var filePath;
			var resourceType = nodeModelData.type;
			var resourceLocationPath = nodeModelData.resourceInfo.resourceLocationPath;
			resourceLocationPath = resourceLocationPath.replace(/%2f/g, "/");
			var newResourceText = _getNewResourceText(nodeModelData, resourceId);
			if (resourceType === ExtendUtil.EXT_TYPE_VIEW) {
				filePath = resourceLocationPath + newResourceText + ".view.xml";
			} else if (resourceType === ExtendUtil.EXT_TYPE_CONTROLLER) {
				filePath = resourceLocationPath + newResourceText + ".controller.js";
			} else if (resourceType === ExtendUtil.EXT_TYPE_EXT_POINT) {
				filePath = resourceLocationPath + newResourceText + ".fragment.xml";
			}

			return filePath;
		};

		/**
		 * Changes a tree node text after add/remove extension
		 *
		 * @param oNodeModelData {Object} - Model of the current node
		 * @param resourceId {String}	  - In case ov View/Controller, the
		 * @private
		 */
		this._getNodeText = function(oNodeModelData, resourceId) {
			var resourceType = oNodeModelData.type;
			var originalName;

			if (oNodeModelData.isExtended === true) {
				var extensionText;
				var newResourceText;

				originalName = oNodeModelData.resourceInfo.originalName || oNodeModelData.resourceInfo.name;

				if (resourceType === ExtendUtil.EXT_TYPE_VIEW) {
					newResourceText = _getNewResourceText(oNodeModelData, resourceId);
					extensionText = newResourceText + " " + oContext.i18n.getText("i18n", "VisualExt_ViewReplacementDescription", [originalName]);

				} else if (resourceType === ExtendUtil.EXT_TYPE_CONTROLLER) {
					newResourceText = _getNewResourceText(oNodeModelData, resourceId);
					extensionText = newResourceText + " " + oContext.i18n.getText("i18n", "VisualExt_ControllerExtensionDescription", [originalName]);

				} else if (resourceType === ExtendUtil.EXT_TYPE_EXT_POINT) {
					extensionText = oNodeModelData.attributes.name + " " + oContext.i18n.getText("i18n", "VisualExt_ExtendedDescription");

				} else if (resourceType === ExtendUtil.EXT_TYPE_HOOK) {
					extensionText = oNodeModelData.attributes.id + " " + oContext.i18n.getText("i18n", "VisualExt_ExtendedDescription");

				} else if (oNodeModelData.isVisible) {
					extensionText = oNodeModelData.attributes.id + " " + oContext.i18n.getText("i18n", "VisualExt_HiddenDescription");
				}

				if (extensionText) {
					return extensionText;
				}
			} else {
				if (resourceType === ExtendUtil.EXT_TYPE_EXT_POINT) {
					return oNodeModelData.attributes.name;
				} else if (resourceType === ExtendUtil.EXT_TYPE_HOOK) {
					return oNodeModelData.attributes.id;
				} else if (resourceType === ExtendUtil.EXT_TYPE_CONTROLLER
						|| resourceType === ExtendUtil.EXT_TYPE_VIEW
						|| (resourceType === ExtendUtil.EXT_TYPE_FRAGMENT && oNodeModelData.resourceInfo.type === ExtendUtil.EXT_TYPE_FRAGMENT)) {

					originalName = oNodeModelData.resourceInfo.originalName;
					originalName = originalName || oNodeModelData.resourceInfo.name;
					return originalName;
				} else if (oNodeModelData.attributes.id) {
					return oNodeModelData.attributes.id;
				} else {
					return oNodeModelData.namespaceURI + ":" + resourceType;
				}
			}
		};

		/**
		 * Helper method for actually perform the selection or hovering. 
		 * Called from _selectInTree and extracts common functionality in it.
		 */
		var _performSelectionOrHover = function(oNode, bHover) {
			if (!that._tree.getSelection()) {
				oNode.scrollIntoView();
			}
			if (!bHover) {
				that._tree.setSelection(oNode); // Also fires the "select" event of the UI5 tree
				return oNode;
			} else {
				that._hoverNode = oNode;
				that._hoverNode.addStyleClass("hoveredNode");
				return that._hoverNode;
			}
		};

		/**
		 * Helper method for selecting/hovering on a tree item. The tree node is identified by the resourceID, the
		 * controlID and optionally the type of the containing element.
		 *
		 * @param {string} sResourceID     - The ID given by the developer to the containing view/fragment/controller
		 * 									 of the control.
		 * @param {string} sControlID      - The ID given by the developer for the control. Supported only if the type is view
		 * @param {string} [sType="view"]  - Optional parameter. Can be one of: "view", "controller", the default is "view"
		 * @param {boolean} bHover 	       - If true the node will be selected in "hover mode"
		 */
		var _selectInTree = function(sResourceID, sControlID, bHover, sType) {
			if (!sResourceID) {
				return null;
			}
			if (!sType) {
				sType = ExtendUtil.EXT_TYPE_VIEW;
			}
			if (sControlID && sType !== ExtendUtil.EXT_TYPE_VIEW) {
				return null;
			}
			if (sType !== ExtendUtil.EXT_TYPE_VIEW && sType !== ExtendUtil.EXT_TYPE_CONTROLLER) {
				return null;
			}
				
			var treeNodes = _getResourceNodes();

			if (that._hoverNode) {
				that._hoverNode.removeStyleClass("hoveredNode");
			}

			for (var n = 0; n < treeNodes.length; n++) {
				var node = treeNodes[n];

				var nodeModel = node.getBindingContext().getObject();

				// select tree root node
				if (nodeModel.resourceInfo.id === sResourceID || nodeModel.resourceInfo.newId === sResourceID || nodeModel.resourceInfo.originalId === sResourceID) {
					if ((nodeModel.type === ExtendUtil.EXT_TYPE_VIEW || nodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER) && !sControlID) {
						if (nodeModel.type === sType) {
							return _performSelectionOrHover(node, bHover);
						}
					}

					var theNode = _recSelectNode(node, sControlID);
					if (theNode) {
						return _performSelectionOrHover(theNode, bHover);
					}
				}
			}
		};

		/**
		 * Recursively searches a node and selects it
		 *
		 * @param node - the node to select
		 * @param idValue - UI5 id of the node
		 * @returns selectedNode - The selected node
		 * @private
		 */
		var _recSelectNode = function(node, idValue) {
			var nodeModelOData = node.getBindingContext().getObject();
			var nodeAttr = nodeModelOData.attributes;
			if (nodeAttr) {
				var attribute;
				if (nodeModelOData.type === ExtendUtil.EXT_TYPE_EXT_POINT) {
					attribute = nodeAttr.name;
				} else if (nodeModelOData.isVisible === true || nodeAttr.id) {
					attribute = nodeAttr.id;
				}

				if (attribute) {
					if (attribute === idValue) {
						node.oParent.setExpanded(true);
						return node;
					}
				}
			}

			// if we encounter a fragment node, diverge the search into the fragments' tree
			if (nodeModelOData.type === ExtendUtil.EXT_TYPE_FRAGMENT && nodeModelOData.resourceInfo.type !== ExtendUtil.EXT_TYPE_FRAGMENT) {
				var fragmentName = nodeModelOData.attributes.fragmentName;
				var rootNodes = _getResourceNodes();
				for (var root in rootNodes) {
					if (fragmentName === rootNodes[root].getBindingContext().getObject().resourceInfo.id) {
						var theNode = _recSelectNode(rootNodes[root], idValue);
						if (theNode) {
							rootNodes[root].oParent.setExpanded(true);
							return theNode;
						}
					}
				}
			}

			if (node.hasChildren()) {
				var nodeArr = node.getNodes();
				for (var i = 0; i < nodeArr.length; ++i) {
					var theNode = _recSelectNode(nodeArr[i], idValue);
					if (theNode) {
						nodeArr[i].oParent.setExpanded(true);
						return theNode;
					}
				}
			}

			return undefined;
		};

		/**
		 * Maps out the parent view of each fragment in the tree.
		 * NOTE: Does not include fragments dynamically loaded at runtime
		 * @private
		 */
		var _mapViewsToFragments = function() {
			that._mFragmentToView = [];
			var rootNodes = _getResourceNodes();
			for (var i = 0; i < rootNodes.length; ++i) {
				if (rootNodes[i].getBindingContext().getObject().type === ExtendUtil.EXT_TYPE_VIEW) {
					_recMapping(rootNodes[i]);
				}
			}
		};

		/**
		 * Recursive function scanning the view sub-tree for fragments and adding them to the map
		 * @private
		 * @param oNode {sap.ui.commons.TreeNode} Current UI control node
		 * @param map {string[]} Mapping of fragments to their parent view
		 */
		var _recMapping = function(oNode) {
			var nodeModel = oNode.getBindingContext().getObject();
			if (nodeModel.type === ExtendUtil.EXT_TYPE_FRAGMENT) {
				that._mFragmentToView[nodeModel.attributes.fragmentName] = nodeModel.resourceInfo.id;
			}

			var childNodes = oNode.getNodes();
			if (childNodes) {
				for (var i = 0; i < childNodes.length; ++i) {
					_recMapping(childNodes[i]);
				}
			}
		};

		/**
		 * Returns the ID of the view containing the fragment, or empty string if not found
		 * @param sFragmentName {string} The name of the fragment
		 * @return {string} The ID of the view containing the fragment
		 */
		this.getParentViewOfFragment = function (sFragmentName) {
			return that._mFragmentToView[sFragmentName] ? that._mFragmentToView[sFragmentName] : "";
		};

		/**
		 * Returns the root nodes of the tree which are the views, fragments, and controllers nodes
		 *
		 * @returns {sap.ui.commons.TreeNode[]}
		 * @private
		 */
		var _getResourceNodes = function() {
			var rootNodes = that._tree.getNodes();
			var treeNodes = [];

			for (var i = 0; i < rootNodes.length; i++) {
				treeNodes = treeNodes.concat(rootNodes[i].getNodes());
			}

			return treeNodes;
		};
		
		/**
		 * Returns the resources (views, fragments, and controllers) objects from the tree model
		 * Collect the nodes from the model - not from the visible (and potentialy filtered) nodes
		 * @returns array of node model objects
		 * @private 
		 */
		var _getResourceObjectsFromModel = function() {
			var aRootModelObjects = that._tree.getModel().getData().childTreeNodeModels;
			var aResources = [];

			for (var i = 0; i < aRootModelObjects.length; i++) {
				aResources = aResources.concat(aRootModelObjects[i].childTreeNodeModels);
			}

			return aResources;
		};		

		/**
		 * Update private member of customizingJson with the latest extensions data from the extension project
		 *
		 * @returns Q-promise
		 * @private
		 */
		this._updateCustomization = function() {
			return oContext.service.ui5projecthandler.getAllExtensions(oExtensionProjectDocument).then(function(custJson) {
				customizingJson = custJson;
			});
		};

		this._buildViewModelObject = function (oViewResource) {
			var oXml = xmlUtil.stringToXml(oViewResource.resourceContent);
			oXml = xmlUtil.firstElementChild(oXml);
			var oAttributes = xmlUtil.getTagAttributes(oXml);
			var oModel = {
				attributes : oAttributes,
				isExtended : oViewResource.isExtended === true,
				isExtendable : true,
				type : ExtendUtil.EXT_TYPE_VIEW,
				namespaceURI : oXml.namespaceURI,
				resourceInfo : oViewResource,
				customizationId : "sap.ui.viewReplacements",
				componentId : "fioriexttemplate.replaceviewcomponent"
			};

			var children = xmlUtil.children(oXml);
			if (children.length > 0) {
				oModel.childTreeNodeModels = [];
				for (var i = 0; i < children.length; ++i) {
					// for IE support:
					// If you want to iterate through all child elements of the XML node,
					// use childNodes and exclude the non-element nodes via their nodeType
					oModel.childTreeNodeModels[i] = that._buildXmlNodeModelObject(oModel, children[i]);
				}
			}

			return oModel;
		};

		this._buildFragmentModelObject = function (oFragmentResource) {
			var oXml = xmlUtil.stringToXml(oFragmentResource.fragmentXml);
			oXml = xmlUtil.firstElementChild(oXml);
			var oAttributes = xmlUtil.getTagAttributes(oXml);
			var oModel = {
				attributes : oAttributes,
				isExtended : oFragmentResource.isExtended === true,
				isExtendable : false,
				type : oFragmentResource.type,
				namespaceURI : oXml.namespaceURI,
				resourceInfo : oFragmentResource,
				customizationId : "sap.ui.viewReplacements",
				componentId : "fioriexttemplate.replaceviewcomponent"
			};

			var children = xmlUtil.children(oXml);
			if (children.length > 0) {
				oModel.childTreeNodeModels = [];
				for (var i = 0; i < children.length; ++i) {
					// for IE support:
					// If you want to iterate through all child elements of the XML node,
					// use childNodes and exclude the non-element nodes via their nodeType
					oModel.childTreeNodeModels[i] = that._buildXmlNodeModelObject(oModel, children[i]);
				}
			}

			return oModel;
		};

		/**
		 * Generic recursive function that goes over the XML and constucts a model based on it
		 * @param oResourceModel
		 * @param oXmlNode
		 * @private
		 */
		this._buildXmlNodeModelObject = function(oResourceModel, oXmlNode) {
			var sNodeType = oXmlNode.tagName.substr(oXmlNode.tagName.lastIndexOf(':') + 1).toLowerCase();
			var oModel;
			if (sNodeType === ExtendUtil.EXT_TYPE_EXT_POINT) {
				oModel = that._buildExtensionPointModelObject(oResourceModel, oXmlNode);
			} else {
				oModel = that._buildUIControlModelObject(oResourceModel, oXmlNode);
				if (oXmlNode.hasChildNodes()) {
					oModel.childTreeNodeModels = [];
					var children = xmlUtil.children(oXmlNode);
					for (var i = 0; i < children.length; ++i) {
						oModel.childTreeNodeModels[i] = that._buildXmlNodeModelObject(oResourceModel, children[i]);
					}
				}
			}

			return oModel;
		};

		this._buildExtensionPointModelObject = function (oResourceModel, oXmlNode) {
			var oAttributes = xmlUtil.getTagAttributes(oXmlNode);
			var extensionId = oAttributes.name;
			var tagName = oXmlNode.tagName.substr(oXmlNode.tagName.lastIndexOf(':') + 1);
			var bIsVisible = xmlUtil.isVisible(oXmlNode.namespaceURI, tagName);
			var oModel = {
				attributes : oAttributes,
				isVisible : bIsVisible,
				isAggregation : false,
				customizationId : "sap.ui.viewExtensions",
				componentId : "fioriexttemplate.extendviewcomponent",
				extensionId : extensionId,
				isExtendable : true,
				isExtended : false,
				type : ExtendUtil.EXT_TYPE_EXT_POINT,
				resourceInfo : oResourceModel.resourceInfo,
				namespaceURI : oXmlNode.namespaceURI
			};

			var bIsExtended = ExtendUtil.isExtended(customizingJson, oModel.customizationId, oModel.resourceInfo.id, oModel.extensionId);
			oModel.isExtended = (bIsExtended === true);

			var children = xmlUtil.children(oXmlNode);
			if (children.length > 0) {
				oModel.childTreeNodeModels = [];
				for (var i = 0; i < children.length; ++i) {
					// for IE support:
					// If you want to iterate through all child elements of the XML node,
					// use childNodes and exclude the non-element nodes via their nodeType
					oModel.childTreeNodeModels[i] = that._buildXmlNodeModelObject(oModel, children[i]);
				}
			}

			return oModel;
		};

		this._buildUIControlModelObject = function (oResourceModel, oXmlNode) {
			var tagName = oXmlNode.tagName.substr(oXmlNode.tagName.lastIndexOf(':') + 1);
			var nodeType = tagName.toLowerCase();

			//save "isAggregation" for node model
			var bIsAggregation = xmlUtil.isAggregation(oXmlNode.namespaceURI, oXmlNode.parentNode.tagName , tagName);
			var bIsVisible = xmlUtil.isVisible(oXmlNode.namespaceURI, tagName);
			var oAttributes = xmlUtil.getTagAttributes(oXmlNode);
			var oModel = {
				attributes: oAttributes,
				isVisible: bIsVisible,
				isAggregation: bIsAggregation,
				isExtended: false,
				isExtendable: false,
				type: nodeType,
				namespaceURI : oXmlNode.namespaceURI,
				resourceInfo: oResourceModel.resourceInfo
			};

			if (oXmlNode.attributes.id && bIsVisible === true) {
				oModel.customizationId = "sap.ui.viewModifications";
				oModel.componentId = "fioriexttemplate.hidecontrolcomponent";
				oModel.isExtendable = true;
			}

			// TODO: Validate if UI5 already supports hiding controls under fragments
			if (oModel.resourceInfo.type === ExtendUtil.EXT_TYPE_FRAGMENT) {
				oModel.isExtendable = false;
			}

			if (oResourceModel.isExtended === false && oModel.isExtendable === true) {
				oModel.extensionId = oModel.attributes.id;

				var bIsExtended = ExtendUtil.isExtended(customizingJson, oModel.customizationId, oResourceModel.resourceInfo.id, oModel.extensionId);
				oModel.isExtended = (bIsExtended === true);
			}
			return oModel;

		};

		this._buildControllerModelObject = function (oControllerResource) {
			var oModel = {
				isExtended : oControllerResource.isExtended === true,
				isExtendable : true,
				type : ExtendUtil.EXT_TYPE_CONTROLLER,
				resourceInfo : oControllerResource,
				customizationId : "sap.ui.controllerExtensions",
				componentId : "fioriexttemplate.extendcontrollercomponent"
			};

			var aHooks = oControllerResource.hooks;
			if (aHooks.length > 0) {
				oModel.childTreeNodeModels = [];
				for (var i = 0; i < aHooks.length; i++) {
					oModel.childTreeNodeModels[i] = that._buildControllerHookModelObject(oControllerResource, aHooks[i]);
				}
			}

			return oModel;
		};

		this._buildControllerHookModelObject = function (oControllerResource, oHook) {
			var isHookExtended = false;
			var hookName = oHook.name;
			try {
				isHookExtended = ExtensionHook.isHookExtended(oHook.name, oControllerResource.resourceContent);
			} catch (err) {
				var errMsg = oContext.i18n.getText("i18n", "ExtensionProject_IsHookExtendedPaneErr", [hookName, oControllerResource.name, err]);
				oContext.service.log.error(oContext.i18n.getText("i18n", "Extension_LogTitle"), errMsg, ["system"]).done();
				throw new Error(errMsg);
			}

			return {
				isVisible : true,
				isExtended : isHookExtended,
				isExtendable : true,
				type : ExtendUtil.EXT_TYPE_HOOK,
				resourceInfo : oControllerResource,
				attributes : {
					id : hookName
				},
				extensionHookArgs : oHook.args,
				componentId : "fioriexttemplate.extendcontrollerhook",
				extensionId : hookName
			};
		};

		this._getTreeNodeTemplate = function () {
			return new sap.ui.commons.TreeNode({
				selectable : {
					parts : [{
						path : "isRoot",
						type : new sap.ui.model.type.Boolean()
					}],
					formatter : function (bIsRoot) {
						return !bIsRoot;
					},
					useRawValues : true
				},
				text : {
					parts : [{
						path : "isRoot",
						type : new sap.ui.model.type.Boolean()
					}, {
						path : "type",
						type : new sap.ui.model.type.String()
					}, {
						path : "isAggregation",
						type : new sap.ui.model.type.Boolean()
					}, {
						path : "resourceInfo"
					}, {
						path : "attributes"
					}, {
						path : "namespaceURI"
					},{
						path : "isExtended"
					},{
						path : "isExtendable"
					}],
					formatter : function() {
						var oModelData = this.getBindingContext().getObject();
						// Update style classes for node text
						this.removeStyleClass("extPaneExtendedNode");
						this.removeStyleClass("extPaneNonExtensibleNode");
						this.removeStyleClass("extPaneRootNode");
						if (oModelData.isRoot === true) {
							this.addStyleClass("extPaneRootNode");
						} else {
							// Consider only non-root elements that are non-extensible or extended
							if (!oModelData.isExtendable) {
								this.addStyleClass("extPaneNonExtensibleNode");
							}
							if (oModelData.isExtended === true) {
								this.addStyleClass("extPaneExtendedNode");
							}
						}
						
						//Root nodes
						if (oModelData.isRoot === true) {
							switch (oModelData.type) {
								case ExtendUtil.EXT_TYPE_VIEW:
									return  oContext.i18n.getText("i18n", "VisualExt_ViewsRootNode");
								case ExtendUtil.EXT_TYPE_FRAGMENT:
									return  oContext.i18n.getText("i18n", "VisualExt_FragmentsRootNode");
								case ExtendUtil.EXT_TYPE_CONTROLLER:
									return  oContext.i18n.getText("i18n", "VisualExt_ControllersRootNode");
							}
						}

						// Aggregation of a UI control
						if (oModelData.isAggregation === true) {
							return oModelData.type;
						}

						// Resource (View/Fragment/Controller), UI control, Extension Point, Extension Hook
						if (oModelData.type === ExtendUtil.EXT_TYPE_VIEW ||
						   (oModelData.type === ExtendUtil.EXT_TYPE_FRAGMENT && oModelData.resourceInfo.type === ExtendUtil.EXT_TYPE_FRAGMENT) ||
							oModelData.type === ExtendUtil.EXT_TYPE_CONTROLLER) {

							var sOriginalId = oModelData.resourceInfo.originalId || oModelData.resourceInfo.id;
							return that._getNodeText(oModelData, sOriginalId);
						}

						return that._getNodeText(oModelData);
					},
					useRawValues : true
				},
				icon : {
					parts : [{
						path : "type",
						type : new sap.ui.model.type.String()
					}, {
						path : "resourceInfo"
					}],
					formatter : function (sType) {
						if (sType === ExtendUtil.EXT_TYPE_HOOK || sType === ExtendUtil.EXT_TYPE_EXT_POINT) {
							return sap.ui.core.IconPool.getIconURI("add-equipment");
						}
					},
					useRawValues : true
				},
				tooltip : {
					parts : [{
						path : "resourceInfo"
					}, {
						path : "isAggregation"
					}, {
						path : "isRoot"
					}, {
						path : "type"
					}, {
						path : "attributes"
					}, {
						path : "namespaceURI"
					}],
					formatter : function (oResourceInfo, bIsAggregation, bIsRoot, sType, oAttributes, sNamespace) {
						if (bIsRoot) {
							return sType;
						}

						if (bIsAggregation) {
							return sType + " aggregation";
						}

						var oDocTooltip;
						switch (sType) {
							case ExtendUtil.EXT_TYPE_HOOK:
								oDocTooltip = that._getDocumentationTooltip(oResourceInfo, oAttributes.id, "Controller Hook");
								break;
							case ExtendUtil.EXT_TYPE_EXT_POINT:
								oDocTooltip = that._getDocumentationTooltip(oResourceInfo, (oAttributes.name ? oAttributes.name : ""), "<"+ sNamespace + ":" + sType + ">");
								break;

						}

						if (oDocTooltip) {
							return oDocTooltip;
						} else {
							return sNamespace ? "<"+ sNamespace + ":" + sType + ">" : "<" + sType + ">";
						}
					},
					useRawValues : true
				},
				expanded : {
					parts : [{
						path : "isRoot"
					}],
					formatter : function (bIsRoot) {
						return bIsRoot === true;
					},
					useRawValues : true
				}
			});
		};

		/**
		 * Creation of the tree model by parent and extension project data and binding it to the tree UI control.
		 *
		 * Exposed on this for testability reasons only
		 *
		 * @private
		 */
		this._createTreeModel = function() {
			var oModel = new sap.ui.model.json.JSONModel();
			var aViews = [], aControllers = [], aFragments = [];
			var oData = {
				childTreeNodeModels : [{
						isExtended: false,
						isExtendable: false,
						isRoot: true,
						type: ExtendUtil.EXT_TYPE_VIEW
					}, // Views
					{
						isExtended: false,
						isExtendable: false,
						isRoot: true,
						type: ExtendUtil.EXT_TYPE_FRAGMENT
					}, // Fragments
					{
						isExtended: false,
						isExtendable: false,
						isRoot: true,
						type: ExtendUtil.EXT_TYPE_CONTROLLER
					}  // Controllers
				]
			};

			var i;
			for (i = 0; i < that._aResourcesInfo.length; i++) {
				var oResource = that._aResourcesInfo[i];
				switch (oResource.type) {
					case ExtendUtil.EXT_TYPE_VIEW:
						aViews.push(that._buildViewModelObject(oResource));
						break;
					case ExtendUtil.EXT_TYPE_FRAGMENT:
						aFragments.push(that._buildFragmentModelObject(oResource));
						break;
					case ExtendUtil.EXT_TYPE_CONTROLLER:
						aControllers.push(that._buildControllerModelObject(oResource));
						break;
					default :
						throw new Error("Unknown resource type");
				}
			}

			oData.childTreeNodeModels[0].childTreeNodeModels = aViews;
			oData.childTreeNodeModels[1].childTreeNodeModels = aFragments;
			oData.childTreeNodeModels[2].childTreeNodeModels = aControllers;

			oModel.setData(oData);
			return oModel;
		};

		/**
		 * Allows UI content to add selection handler to the tree (in order to enable/disable buttons, display info text
		 * on selected node, etc...)
		 * Multiple selection handlers can be supplied and they will all be called when a selection happens. The order
		 * is the same order the methods were attached in.
		 *
		 * @param {Function} fSelectionHandler - A function that will be called with two arguments: oEvent - the UI5
		 * 										 event, and oSelectedNode - the selected node in the tree.
		 * 										 There is no "this" in the context of the callbacks
		 */
		this.attachTreeSelectionHandler = function(fSelectionHandler) {
			this._treeSelectionHandlers.push(fSelectionHandler);
		};

		// /**
		//  * Allows UI content to remove selection handler from the tree
		//  * @param {Function} fSelectionHandler - the selection handler function to remove
		//  */
		// this.detachTreeSelectionHandler = function(fSelectionHandler) {
		// 	_.remove(this._treeSelectionHandlers, function(fHandler) { // _.remove mutates the array
		// 		return fHandler === fSelectionHandler;
		// 	});
		// };

		/**
		 * Allows UI content to add right click handler to the tree (in order to open the context menu in the relevant
		 * coordinates).
		 * Multiple selection handlers can be supplied and they will all be called when a selection happens. The order
		 * is the same order the methods were attached in.
		 *
		 * @param {Function} fRightClickHandler - A function that will be called with two arguments: oEvent - the UI5
		 * 										  event, and oSelectedNode - the selected node in the tree.
		 * 										  There is no "this" in the context of the callbacks
		 */
		this.attachRightClickHandler = function(fRightClickHandler) {
			this._treeRightClickHandlers.push(fRightClickHandler);
		};

		// /**
		//  * Allows UI content to remove right click handler from the tree
		//  * @param {Function} fRightClickHandler - the right click handler function to remove
		//  */
		// this.detachRightClickHandler = function(fRightClickHandler) {
		// 	_.remove(this._treeRightClickHandlers, function(fHandler) { // _.remove mutates the array
		// 		return fHandler === fRightClickHandler;
		// 	});
		// };

		/**
		 * Returns the model data of the selected tree node.
		 *
		 * @returns model data object.
		 * If no selected node - return the result of getSelection operation on the tree (null or undefined)
		 */
		this.getSelectedElementData = function() {
			var node = that._tree.getSelection();
			if (!node) {
				return node; //return null or undefined exactly as returned from getSelection
			}
			return node.getBindingContext().getObject();
		};

		var _isElementExtensibleForReplaceView = function(oNodeModel) {
			return oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW && oNodeModel.isExtended === false && oNodeModel.isRoot !== true;
		};

		var _isElementExtensibleForHideControl = function(oNodeModel) {
			var nodeModelResourceInfo = oNodeModel.resourceInfo;

			if (oNodeModel.type === ExtendUtil.EXT_TYPE_VIEW || oNodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER ||
				oNodeModel.type === ExtendUtil.EXT_TYPE_FRAGMENT || oNodeModel.type === ExtendUtil.EXT_TYPE_HOOK ||
				oNodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT || oNodeModel.isRoot === true) {
				return false;
			}

			// check if the selected element is a control in a fragment. If it is, it cannot be extended as this is not yet supported by UI5
			// TODO: Validate if UI5 already supports hiding controls under fragments
			var isElementInFragment = (oNodeModel.type !== ExtendUtil.EXT_TYPE_FRAGMENT) && (nodeModelResourceInfo.type === ExtendUtil.EXT_TYPE_FRAGMENT);

			return oNodeModel.isVisible === true
				&& (!nodeModelResourceInfo.isExtended || nodeModelResourceInfo.isExtended === false)
				&& (oNodeModel.isExtendable === true && oNodeModel.isExtended === false) && !nodeModelResourceInfo.newId && !isElementInFragment;
		};

		var _isElementExtensibleForExtendController = function(oNodeModel) {
			return oNodeModel.type === ExtendUtil.EXT_TYPE_CONTROLLER && oNodeModel.isExtended === false && oNodeModel.isRoot !== true;
		};

		var _isElementExtensibleForExtendView = function(oNodeModel) {
			var nodeModelResourceInfo = oNodeModel.resourceInfo;
			return oNodeModel.type === ExtendUtil.EXT_TYPE_EXT_POINT
				&& (!nodeModelResourceInfo.isExtended || nodeModelResourceInfo.isExtended === false)
				&& oNodeModel.isExtended === false && !nodeModelResourceInfo.newId;
		};

		var _isElementExtensibleForExtendControllerHook = function(oNodeModel) {
			return oNodeModel.type === ExtendUtil.EXT_TYPE_HOOK && oNodeModel.isExtended === false && oNodeModel.isRoot !== true;
		};

		var _isElementExtensibleForType = function(oTreeNode, sExtensionType) {
			var oNodeModel = oTreeNode.getBindingContext().getObject();
			switch(sExtensionType) {
				case ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_EMPTY:
				case ExtendUtil.EXTENSION_TYPES.REPLACE_VIEW_WITH_COPY:
					return _isElementExtensibleForReplaceView(oNodeModel);

				case ExtendUtil.EXTENSION_TYPES.EXTEND_VIEW:
					return _isElementExtensibleForExtendView(oNodeModel);

				case ExtendUtil.EXTENSION_TYPES.HIDE_CONTROL:
					return _isElementExtensibleForHideControl(oNodeModel);

				case ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_WITH_EMPTY:
				case ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_WITH_COPY:
					return _isElementExtensibleForExtendController(oNodeModel);

				case ExtendUtil.EXTENSION_TYPES.EXTEND_CONTROLLER_HOOK:
					return _isElementExtensibleForExtendControllerHook(oNodeModel);

				default:
					return false; //unknown extension type
			}
		};

		/**
		 * Returns true if there is a selected element, and it is extensible with the given extension type.
		 * Extension type must be one of the options from UIContent.getExtensionTypes()
		 */
		this.isSelectedElementExtensibleForType = function(sExtensionType) {
			var node = that._tree.getSelection();
			if (!node) {
				return false;
			}
			return _isElementExtensibleForType(node, sExtensionType);
		};

		var _triggerFilterAfterExtension = function (bAlwaysFireSelect, oExtendedNode) {
			var oFilterDropDown = sap.ui.getCore().byId("filterOptionsDropdownBox");
			if (oFilterDropDown) {
				var sFilterType = oFilterDropDown.getValue();
				if (sFilterType === oContext.i18n.getText("i18n", "VisualExt_ExtendedItems")) {
					var oTreeBinding = that._tree.getBinding("nodes");
					var oFilter = new sap.ui.model.Filter("isExtended", sap.ui.model.FilterOperator.EQ, true);
					oTreeBinding.filter([oFilter]);
					that._handleSelectionAfterFilter();
				} else {
					if (bAlwaysFireSelect === true) {
						that._tree.fireSelect({
							node: oExtendedNode,
							nodeContext : oExtendedNode.getBindingContext()
						});	
					}
				}
			}
		};

		/**
		 * Handle selection and node expansion in the tree after applying a filter.
		 *
		 * Exposed on this for testing purposes only.
		 * @private
		 */
		this._handleSelectionAfterFilter = function () {
			var oNode = that._tree.getSelection();
			// We check the selected node and also make sure its attached to the tree after filtering
			if (oNode && oNode.oParent) {
				var oParentNode = oNode.oParent;
				while (oParentNode && oParentNode.setExpanded) {
					oParentNode.setExpanded(true);
					oParentNode = oParentNode.oParent;
				}
				// Trigger selection handlers in case the selection was modified by filtering 
				that._tree.fireSelect({
					node: oNode,
					nodeContext : oNode.getBindingContext()
				});
			} else {
				// In case there is no selection or the node is not part of the filtered tree
				if (oNode && oNode.setIsSelected) {
					oNode.setIsSelected(false);
				}
				that._tree.fireSelect();
			}
		};

		/**
		 * Extends the selected element according to the @sExtensionType
		 *
		 * The operation will fail in case of inappropriate type of extension for the selected node.
		 * To avoid such failures, call isSelectedElementExtensibleForType first.
		 *
		 * @param sExtensionType The type of extension to perform. The value must be a constant defined in UIContent.js
		 * @returns Q-promise with the updated model of the extended element, or Error in case of failure.
		 */
		this.extendSelectedElement = function(sExtensionType) {
			//var that = this;
			var node = that._tree.getSelection();
			if(node && _isElementExtensibleForType(node, sExtensionType)) {
				var oTreeModel = node.getModel();
				var sNodePath = node.getBindingContext().getPath();
				var nodeModelData = node.getBindingContext().getObject();
				return oContext.service.template.getTemplates().then(function(templates) {
					var generationComponent = templates[nodeModelData.componentId];
					return ExtendUtil.extendProject(nodeModelData, oExtensionProjectDocument, oExtensibilityModel, generationComponent, sExtensionType, oContext).then(function() {
						return that._updateCustomization().then(function() {
							oTreeModel.setProperty(sNodePath + "/isExtended", true);

							var originalId = nodeModelData.resourceInfo.originalId || nodeModelData.resourceInfo.id;
							var type = nodeModelData.type;
							if (type === ExtendUtil.EXT_TYPE_VIEW || type === ExtendUtil.EXT_TYPE_CONTROLLER) {
								// save a new resource id
								// TODO: BUGFIX: get rid of duplicate fields in the model
								var sNewId = _getNewResourceText(nodeModelData, originalId);
								oTreeModel.setProperty(sNodePath + "/resourceInfo/newId", sNewId);
								oTreeModel.setProperty(sNodePath + "/resourceInfo/newResourceName", sNewId);
							} else if (type === ExtendUtil.EXT_TYPE_HOOK) {
								var parentController = node.getParent(); // Also, mark the parent controller as extended
								var sParentPath = parentController.getBindingContext().getPath();

								if (oTreeModel.getProperty(sParentPath + "/isExtended") !== true) {
									oTreeModel.setProperty(sParentPath + "/isExtended", true);
									oTreeModel.setProperty(sParentPath + "/resourceInfo/newId", oExtensibilityModel.fiori.extensionCommon.extensionResourceId);
								}
							}
							oTreeModel.setProperty(sNodePath + "/resourceInfo/filePath", _getFilePath(nodeModelData, originalId));
							//TODO: BUGFIX: re-build all the sub-tree of the extended node in case of replace view.

							_triggerFilterAfterExtension(false, node);
							return nodeModelData;
						});
					});
				});

			}
			else {
				//This error is not supposed to be displayed in the UI. Therefore not translated.
				return Q.reject(new Error("The provided extension type is not applicable for the selected node, or no node was selected"));
			}

		};

		/**
		 * Removes the extension from the selected node.
		 * @returns Q-promise with the updated model of the element after removing the extension from it,
		 * or Error in case of failure.
		 */
		this.removeExtensionFromSelectedElement = function() {
			var node = this._tree.getSelection();
			if (node && ExtendUtil.isExtendedByNode(node.getBindingContext().getObject())) {
				var oTreeModel = node.getModel();
				var sNodePath = node.getBindingContext().getPath();
				var nodeModelData = node.getBindingContext().getObject();
				if (nodeModelData.type === ExtendUtil.EXT_TYPE_HOOK) {
					return ExtendUtil.removeHookExtension(nodeModelData, oExtensibilityModel, oExtensionProjectDocument, oContext).then(function() {
						oTreeModel.setProperty(sNodePath + "/isExtended", false);
						_triggerFilterAfterExtension(true, node);
						return nodeModelData;
					});
				} else {
					return ExtendUtil.removeExtension(nodeModelData, oExtensionProjectDocument, oContext).then(function(mAllExtensions) {
						customizingJson = mAllExtensions;
						oTreeModel.setProperty(sNodePath + "/isExtended", false);
						_triggerFilterAfterExtension(true, node);
						//TODO: BUGFIX: remove all the controller hooks extensions in case of removing their controller extension
						//TODO: BUGFIX: re-build all the sub-tree of the updated node in case of removing replace view  / extend controller extension.

						return nodeModelData;
					});
				}
			}
			else {
				//This error is not supposed to be displayed in the UI. Therefore not translated.
				return Q.reject(new Error("Remove extension is not applicable for the selected node, or no node was selected"));
			}

		};

		/**
		 * Selects a tree node. The tree node is identified by the sResourceID, the controlID and optionally the sType
		 * of the containing element.
		 *
		 * @param {string} sResourceID     - The ID given by the developer to the containing view/fragment/controller
		 * 									 of the control.
		 * @param {string} sControlID      - The ID given by the developer for the control
		 * @param {string} [sType="view"]  - Optional parameter. Can be one of: "view", "controller", "fragment", the
		 * 								     default is "view"
		 * @param {boolean} bHover 	       - If true the node will be selected in "hover mode"
		 */
		this.selectTreeElement = function(sResourceID, sControlID, sType) {
			_selectInTree(sResourceID, sControlID, false, sType);
		};

		/**
		 * Hover on a tree node. The tree node is identified by the sResourceID, the controlID and optionally the sType
		 * of the containing element.
		 *
		 * @param {string} sResourceID     - The ID given by the developer to the containing view/fragment/controller
		 * 									 of the control.
		 * @param {string} sControlID      - The ID given by the developer for the control
		 * @param {string} [sType="view"]  - Optional parameter. Can be one of: "view", "controller", "fragment", the
		 * 								     default is "view"
		 * @param {boolean} bHover 	       - If true the node will be selected in "hover mode"
		 */
		this.hoverOnTreeElement = function(sResourceID, sControlID, sType) {
			_selectInTree(sResourceID, sControlID, true, sType);
		};

		/**
		 * Opens the original code of the selected element in the text editor using ExtendUtil.
		 *
		 * @returns Q-promise
		 */
		this.openOriginalCodeOfSelectedElement = function() {
			var oSelectedNode = this._tree.getSelection();
			if(!oSelectedNode) {
				//This error is not supposed to be displayed in the UI. Therefore not translated.
				return Q.reject(new Error("Cannot call openOriginalCodeOfSelectedElement when no element is selected"));
			}

			return ExtendUtil.openParentDocument(this._tree.getSelection(), oExtensibilityModel, oContext);
		};

		/**
		 * Opens the extension code of the selected element either in the text editor or the layout editor.
		 *
		 * @param {boolean}	bWithLayoutEditor if true, the code will be opened in the layout editor, else it will be opened
		 *                            in the text editor.
		 * @param {string}	sActionOrigin The key related to the origin of the action, used for usage reporting
		 */
		this.openExtensionCodeOfSelectedElement = function(bWithLayoutEditor, sActionOrigin) {
			var oSelectedNode = this._tree.getSelection();
			if(!oSelectedNode) {
				//This error is not supposed to be displayed in the UI. Therefore not translated.
				return Q.reject(new Error("Cannot call openOriginalCodeOfSelectedElement when no element is selected"));
			}

			if(bWithLayoutEditor) {
				return ExtendUtil.openLayoutEditor(sExtensionProjectPath, oSelectedNode, oExtensibilityModel.extensionResourceLocationPath, oContext, sActionOrigin);
			} else {
				return ExtendUtil.openExtendedDocument(sExtensionProjectPath, oSelectedNode, oExtensibilityModel.extensionResourceLocationPath, oContext);
			}
		};

		/**
		 * Deselects the currently selected node in the tree
		 */
		this.clearSelection = function () {
			var oNode = this._tree.getSelection();
			if (oNode) {
				oNode.setIsSelected(false);
			}
			if (that._hoverNode) {
				that._hoverNode.removeStyleClass("hoveredNode");
			}
		};

		var _getExtensionPointLocation = function(sibling, extensionPoint) {
			var i;
			for (i = 0; i < sibling.length; i++) {
				if (sibling[i].type === ExtendUtil.EXT_TYPE_EXT_POINT && sibling[i].extensionId === extensionPoint) {
					//if the Same extension point
					return i;
				}
			}
			return i;
		};

		// get ExtensionPoint parent
		var _findParentInDom = function(parentElement) {

			if (!parentElement) { //root
				return undefined;
			}

			if (parentElement.isVisible) {
				return that._getNodeText(parentElement);
			} else {
				return undefined;
			}
		};

		var _getSiblings = function(siblings, extPointName) {
			var oSiblings = {};
			var sibModel;
			var locationWithinSibling = _getExtensionPointLocation(siblings, extPointName);
			if (siblings.length !== 1) { //the extension point itself is the only sibling.
				var i;
				if (locationWithinSibling === 0) {
					// Collect all next siblings - so if the closest is hidden, we can search forward in the list for a sibling which isn't hidden
					var aNextIds = [];
					for (i = locationWithinSibling + 1; i < siblings.length; i++) {
						sibModel = siblings[i];
						if (sibModel.attributes.id && sibModel.isVisible) {
							aNextIds.push(sibModel.attributes.id);
						}
					}
					oSiblings.nextIds = aNextIds;
				} else {
					// Collect all prev siblings - so if the closest is hidden, we can search back in the list for a sibling which isn't hidden
					var aPrevIds = [];
					for (i = locationWithinSibling - 1; i >= 0; i--) {
						sibModel = siblings[i];
						if (sibModel.attributes.id  && sibModel.isVisible) {							
							aPrevIds.push(sibModel.attributes.id);
						}
					}
					oSiblings.prevIds = aPrevIds;
				}
			}

			return oSiblings;
		};

		var getExtensionPoints = function(startNode, extensionPointsArr) {

			var children = startNode.childTreeNodeModels;
			if (children) {

				for (var i = 0; i < children.length; i++) {
					var node = children[i];
					if (node.type === ExtendUtil.EXT_TYPE_EXT_POINT) {

						// get all siblings of this extension point (unless extended. In this case, no need for siblings)
						var Siblings = {};
						var sExtensionPointText = that._getNodeText(node);
						if (!node.isExtended) {
							Siblings = _getSiblings(children, sExtensionPointText);
						}

						extensionPointsArr.push({
							name: sExtensionPointText,
							parent: _findParentInDom(startNode),
							nextSiblings: Siblings.nextIds,
							previousSiblings: Siblings.prevIds,
							isExtended: node.isExtended
						});
					}
					if (node.type === ExtendUtil.EXT_TYPE_FRAGMENT && node.resourceInfo.type !== ExtendUtil.EXT_TYPE_FRAGMENT) {
						var fragmentName = node.attributes.fragmentName;
						var aResources = _getResourceObjectsFromModel();
						for (var oResource in aResources) {
							if (fragmentName === aResources[oResource].resourceInfo.id) {
								getExtensionPoints(aResources[oResource], extensionPointsArr);
							}
						}
					}

					getExtensionPoints(node, extensionPointsArr);
				}
			}

			return extensionPointsArr;
		};

		// go over the array of views in tree,
		// for each view - add the extension points within it to allExtensionPoints
		this.getAllExtensionPoints = function() {
			var aResources = _getResourceObjectsFromModel();
			var allExtensionPoints = {};
			allExtensionPoints.views = [];

			for (var i = 0; i < aResources.length; i++) {
				var currentResource = aResources[i];
				if ((currentResource.resourceInfo.type === ExtendUtil.EXT_TYPE_VIEW) && !currentResource.isExtended) { //go over only the not extended views
					var extPoints = currentResource.resourceInfo.extensionPoints;
					if (extPoints && extPoints.length !== 0) { //if view has extension points
						var extensionPoints = getExtensionPoints(currentResource, []); //get the view's extension points
						// insert the current view to the json object
						allExtensionPoints.views.push({
							name: currentResource.resourceInfo.id,
							extensionPoints: extensionPoints
						});
					}
				}
			}

			return allExtensionPoints;
		};
	};

	jQuery.sap.require("sap.ui.commons.TreeNode");
	// Temporary fix for horizontal scrolling until we get support from UI5
	sap.ui.commons.TreeNode.prototype.scrollIntoView = function() {
		var oNode = this;
		var $NodeRootElement = oNode.$();
		if (!$NodeRootElement.length) {
			return;
		}
		var $NodeSpan = $NodeRootElement.find(".sapUiTreeNodeContent");

		var $Tree = oNode.getTree().$();
		var $TreeCont = $Tree.find(".sapUiTreeCont");

		var iOffsetTop = $NodeRootElement[0].offsetTop;
		var iScrollTop = $TreeCont.scrollTop();
		var iNewScrollTop;
		var iHeight = $TreeCont.height();

		var iOffsetLeft = $NodeSpan.context.offsetLeft;
		var iScrollLeft = $TreeCont.scrollLeft();
		var iWidth = $TreeCont.width();
		var iNewScrollLeft;

		var iOffsetBottom = iOffsetTop + $NodeRootElement[0].offsetHeight;
		if (iOffsetBottom > iScrollTop + iHeight) {
			iNewScrollTop = iOffsetBottom - Math.floor(iHeight * 0.8);
		} else if (iOffsetTop < iScrollTop) {
			iNewScrollTop = iOffsetTop - Math.floor(iHeight * 0.2);
		}

		if (iOffsetLeft > iScrollLeft + iWidth * 0.1) {
			iNewScrollLeft = iOffsetLeft; // - Math.floor(iWidth * 0.1);
		} else if (iOffsetLeft < iScrollLeft + iWidth * 0.1) {
			iNewScrollLeft = iOffsetLeft - Math.floor(iWidth * 0.1);
			if (iNewScrollLeft < 0) {
				iNewScrollLeft = 0;
			}
		}
		if (iNewScrollTop !== undefined || iNewScrollLeft !== undefined) {
			var mSpec = {};
			if (iNewScrollTop !== undefined) {
				mSpec.scrollTop = iNewScrollTop;
			}
			if (iNewScrollLeft !== undefined) {
				mSpec.scrollLeft = iNewScrollLeft;
			}
			$TreeCont.animate(mSpec);
		}
	};


	return ExtensionProjectTree;
});
