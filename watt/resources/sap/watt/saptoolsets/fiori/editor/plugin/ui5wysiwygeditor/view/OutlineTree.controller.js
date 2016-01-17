define(
	[
		"sap/watt/lib/lodash/lodash",
		"../utils/W5gUtils",
		"../utils/ControlMetadata",
		"../utils/UsageMonitoringUtils"
	],
	function (_, W5gUtils, ControlMetadata, UsageMonitoringUtils) {
		"use strict";

		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode");

		/**
		 * Toolbar model
		 *
		 * @type {sap.ui.model.json.JSONModel}
		 * @private
		 */
		var _oToolbarModel = new sap.ui.model.json.JSONModel({
			isAddable: false,
			isDeletable: false
		});

		function _isControlNode(oNode) {
			return oNode.__data && oNode.__data.sType && oNode.__data.sType === "control";
		}

		function _findClosestControlNode(oNode) {
			if (!oNode || _isControlNode(oNode)) {
				return oNode;
			}
			return _findClosestControlNode(oNode.getParent());
		}


		sap.ui.controller("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTree", {
			/**
			 * @type{sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTree}
			 */
			_oUI5Tree: null,
			/**
			 * WebIDE service context
			 */
			_oContext: null,
			/**
			 * Iframe window
			 * @type{Window}
			 */
			_oScope: null,
			/**
			 * Current document key string
			 * @type {?string}
			 */
			_sDocKey: null,
			/**
			 * @type{sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode}
			 */
			_oTreeRootNode: null,
			/**
			 * selected node tag
			 * @type {?string}
			 */
			_sSelectedNodeTag: null,
			/**
			 * Number of levels in the tree to be expanded by default
			 * @type {number}
			 */
			_iTreeDefaultExpandedDepth: 3,
			/**
			 * Menu group for the outline context menu
			 */
			_oContextMenuGroup: null,
			/**
			 * A map between document and tag of a node to its open state (true for open, false for closed)
			 * @type{Object.<string, Object.<string, boolean>>}
			 * @private
			 */
			_mNodeExpandStates: {},
			/**
			 * reference to the add control command
			 */
			_oAddCommand: null,
			/**
			 * reference to the remove control command
			 */
			_oRemoveCommand: null,

			onInit: function () {
				//no animation on expanding a folder
				sap.ui.commons.TreeNode.ANIMATION_DURATION = 0;
				this._oUI5Tree = this.byId("outlineTree");
				this.getView()
					.setModel(_oToolbarModel, "toolbarModel");

			},

			init: function (oContext, oContextMenuGroup) {
				var that = this;
				this._oContext = oContext;
				this._oContextMenuGroup = oContextMenuGroup;
				W5gUtils.init(oContext);
				W5gUtils.applyBundleTo([this.getView()]);
				return Q.all([this._oContext.service.command.getCommand("ui5wysiwygeditor.control.add"),
						this._oContext.service.command.getCommand("ui5wysiwygeditor.control.remove")])
					.spread(function (oAddCmd, oRemoveCmd) {
						that._oAddCommand = oAddCmd;
						that._oRemoveCommand = oRemoveCmd;
					});
			},

			/**
			 * binding hovering effects and context menu
			 */
			onAfterRendering: function () {
				var that = this;
				this._oContext.service.focus.attachFocus(this._oContext.self).done();
				if (this._sSelectedNodeTag){
					this.selectNodeByTag(this._sSelectedNodeTag);
				}
				// hover event delegation to tree nodes
				$(document)
					.on("mouseenter mouseleave", ".sapWattOutlineTree .sapUiTreeNode", function (oEvent) {
						// highlights/downplays hovered UI-control in canvas
						var sNodeTag = oEvent.currentTarget.getAttribute("tag");
						var oNode = that._getNodeByTag(sNodeTag);
						if (oNode && _isControlNode(oNode)) {
							var sEventNamePrefix = oEvent.type === "mouseenter" ? "highlight" : "downplay";
							that.fireEvent(sEventNamePrefix + "NodeInCanvas", {sId: oNode.getTag()});
						}
					});
				this.getView().addEventDelegate({
					oncontextmenu: function (oEvent) {
						oEvent.preventDefault();
						var oElement = oEvent.target;
						while (oElement && !oElement.attributes["id"]) {
							oElement = oElement.parentElement;
						}
						if (oElement && oElement.attributes["id"]) {
							var sId = oElement.attributes["id"].value;
							var oSourceNode = sap.ui.getCore().byId(sId);
							var sTag = oSourceNode && oSourceNode.getTag();
							if (sTag) {
								var oNode = that._getNodeByTag(sTag);
								var q;
								if (oNode.getIsSelected()) {
									q = Q();
								} else if (oNode.getSelectable()) {
									q = that.triggerEditorSelectionForNode(oNode);
								}
								if (q) {
									return q.then(function () {
										that._oContext.service.contextMenu.open(that._oContextMenuGroup, oEvent.pageX, oEvent.pageY).done();
									}).done();
								}
							}
						}
					}
				});
			},

			/**
			 * whenever a node in the outline tree is opened/closed its state is kept for whenever the tree is rerendered
			 * @param {sap.ui.base.Event} oEvent
			 * @private
			 */
			_expandHandler: function (oEvent) {
				var sTag = oEvent.getSource().getTag();
				_.set(this._mNodeExpandStates, [this._sDocKey, sTag], oEvent.getParameters().opened);
			},

			/**
			 * returns the state saved for the argument tag's node
			 * @param {string} sTag
			 * @return {boolean}
			 * @private
			 */
			_isTagExpanded: function (sTag) {
				return _.get(this._mNodeExpandStates, [this._sDocKey, sTag], false);
			},

			/**
			 * init (re-init) tree, and make new root with editor name
			 * @param {string} sDocKey
			 * @param {string} sEditorName
			 * @param {sap.ui.core.mvc.View} oRootView
			 * @param {Window} oScope
			 * @return {Q}
			 */
			initOutline: function (sDocKey, sEditorName, oRootView, oScope, oEditor) {
				this._sDocKey = sDocKey;
				this._oScope = oScope;
				this._oEditor = oEditor;
				this._oUI5Tree.destroyNodes();
				this._oTreeRootNode = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode({
					tag: oRootView.getId(),
					controlId: oRootView.getId(),
					text: sEditorName,
					selectable: true,
					expanded: this._isExpanded(0),
					toggleOpenState: this._expandHandler.bind(this)
				});
				this._oTreeRootNode.data("isRoot", true); //this info is used in test env
				this._oTreeRootNode.__data = {
					sType: "control",
					oControl: oRootView
				};

				this._oTreeRootNode.attachSelected(null, this._onNodeSelected, this);
				this._oUI5Tree.addNode(this._oTreeRootNode);
				return this._createTree({
					oValue: oRootView.getContent(),
					iDepth: 1
				});
			},

			_createTree: function (oParams) {
				var that = this;
				return this._createNodeFromAggregation(oParams).then(function () {
					that._oUI5Tree.rerender();
					return that.selectNodeByTag(that._sSelectedNodeTag);
				});
			},

			/**
			 * Recursively adds nodes from given aggregation to parentNode (or to root initially)
			 */
			_createNodeFromAggregation: function (oParams) {
				var that = this,
					oValue = oParams.oValue,
					iDepth = oParams.iDepth,
					oParent = oParams.oParent || this._oTreeRootNode,
					bHasUnsupportedParent = oParams.bHasUnsupportedParent,
					aPromises = [];

				if (oValue && oValue.length) {
					jQuery.map(oValue, function (oControl) {
						// add controls to outline tree
						aPromises.push(
							that._addNodeForControl(oControl, oParent, iDepth, bHasUnsupportedParent).then(function (oNode) {
								// and iterate through aggregations of these controls..
								return that._iterateOverAllPublicAggregations({
									oControl: oControl,
									bHasUnsupportedParent: bHasUnsupportedParent,
									fnCallback: function (oCbParams) {
										var oIntermediateNode = oNode;
										if (oCbParams.sCustomName) {
											var isDeprecated = oControl.getMetadata().getAllAggregations()[oCbParams.sCustomName].deprecated;
											oIntermediateNode = that._addNodeForAggregation({
												sName: oCbParams.sCustomName,
												oParent: oNode,
												iDepth: iDepth,
												isDeprecated: isDeprecated,
												isSelectable: oCbParams.isSelectable
											});
											iDepth++;
										}
										// make recursive for new found controls
										return that._createNodeFromAggregation({
											oParent: oIntermediateNode,
											oValue: oCbParams.oValue,
											iDepth: iDepth + 1,
											bHasUnsupportedParent: oCbParams.bHasUnsupportedParent
										});
									},
									aFilter: ControlMetadata.getUnsupportedAggregations()
								});
							})
						);
					});
				}
				return Q.all(aPromises);
			},

			/**
			 * Iterates over all control's aggregations and callbacks aggregation's maps
			 *    --adopted copy from w5g
			 */
			_iterateOverAllPublicAggregations: function (oParams) {
				if (oParams.oControl.bIsDestroyed) {
					return Q();
				}
				var oControl = oParams.oControl,
					bHasUnsupportedParent = oParams.bHasUnsupportedParent,
					fnCallback = oParams.fnCallback,
					aFilter = oParams.aFilter,
					bIsUnsupported = bHasUnsupportedParent ||
						ControlMetadata.isControlUnsupported(oControl) ||
						ControlMetadata.isControlToBeSupported(oControl),
				//TODO: probably is selected for aggregations should be always false
					isSelectable = W5gUtils.isControlSelectable(oControl, this._oScope),
					mAggregations = oControl.getMetadata().getAllAggregations(),
					aPromises = [];
				for (var sName in mAggregations) {
					if (aFilter && aFilter.indexOf(sName) !== -1) {
						continue;
					}
					// TODO: build filter based on adapter.js
					var oAggregation = mAggregations[sName];
					if (!oAggregation._sGetter) {
						continue;
					}
					if (oControl[oAggregation._sGetter]) {
						var oValue = oControl[oAggregation._sGetter]();
						//the aggregation has primitive alternative type
						if (typeof oValue !== "object") {
							continue;
						}
						oValue = oValue ? oValue : [];
						oValue = oValue.splice ? oValue : [oValue];
						aPromises.push(
							fnCallback({
								sCustomName: sName,
								oValue: oValue,
								isSelectable: isSelectable,
								bHasUnsupportedParent: bIsUnsupported
							})
						);
					}
				}
				return Q.all(aPromises);
			},

			/**
			 * Adding binding string as a parameter to a node (for rendering)
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode} oNode
			 * @param {sap.ui.core.Control} oControl
			 * @param {string} sName
			 * @private
			 */
			_addBindingString: function (oNode, oControl, sName) {
				if (oControl.mBindingInfos[sName]) {
					if (oControl.mBindingInfos[sName].parts && oControl.mBindingInfos[sName].parts.length) {
						var sSet = oControl.data().sapDtResourcePath;
						var sModel = oControl.mBindingInfos[sName].parts[0].model;
						var sBindingString = oControl.mBindingInfos[sName].parts[0].path;
						if (sModel) {
							sBindingString = sModel ? sModel + ">" + sBindingString : sBindingString;
						} else {
							sBindingString = sSet ? sSet + "." + sBindingString : sBindingString;
						}
						oNode.__data.sBindingString = "{" + sBindingString + "}";
					} else {
						if (oControl.mBindingInfos[sName].path) {
							var sPath = oControl.mBindingInfos[sName].path;
							if (sPath.indexOf("/") === 0) {
								sPath = sPath.slice(1);
							}
							oNode.__data.sBindingString = "{" + sPath + "}";
						}

					}
				}
			},

			/**
			 * Adds a tree node for a control to a parent node
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode} oParent
			 * @param {number} iDepth
			 * @param {boolean} bHasUnsupportedParent
			 * @return {Q}
			 * @private
			 */
			_addNodeForControl: function (oControl, oParent, iDepth, bHasUnsupportedParent) {
				var oNewNode = this._createNodeForControl(oControl, iDepth, bHasUnsupportedParent);
				if (oNewNode) {
					(oParent || this._oUI5Tree).addNode(oNewNode);
				}
				return Q(oNewNode);
			},

			/** adds a tree node with a custom name to a parent node
			 */
			_addNodeForAggregation: function (oParams) {
				var oNewNode = this._createNodeForAggregation({
					sName: oParams.sName,
					oParent: oParams.oParent,
					iDepth: oParams.iDepth,
					isDeprecated: oParams.isDeprecated,
					isSelectable: oParams.isSelectable
				});
				if (oNewNode) {
					oParams.oParent.addNode(oNewNode);
					return oNewNode;
				}
			},

			/**
			 * Creates node for a control
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @param {number} iDepth
			 * @return {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode}
			 * @private
			 */
			_createNodeForControl: function (oControl, iDepth) {
				var sId = oControl.sId;
				var oNode = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode({
					tag: sId,
					controlId: sId,
					selectable: W5gUtils.isControlSelectable(oControl, this._oScope),
					text: oControl.getMetadata()._sClassName,
					expanded: this._isExpanded(iDepth, sId),
					toggleOpenState: this._expandHandler.bind(this)
				});

				oNode.__data = {
					sType: "control",
					sAdditionalText: W5gUtils.getBadgeInfo(oControl, this._oScope, true).text,
					oControl: oControl
				};

				oNode.attachSelected(null, this._onNodeSelected, this);
				return oNode;
			},

			/**
			 * @param {string} sAggregationName
			 * @param {sap.ui.core.Control} oControl
			 * @return {string}
			 * @private
			 */
			_createTagForAggregation: function (sAggregationName, oControl) {
				var sParentTag = oControl.getTag ? oControl.getTag() : oControl.sId;
				return sParentTag.replace(/(-__clone\d+)+/g, '-__template') + "-" + sAggregationName;
			},

			/**
			 * Creates node with a custom name
			 *
			 * @param oParams
			 * @return {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode}
			 * @private
			 */
			_createNodeForAggregation: function (oParams) {
				if (oParams.isSelectable !== false) {
					oParams.isSelectable = true;
				}

				var sTag = this._createTagForAggregation(oParams.sName, oParams.oParent);
				var oNode = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode({
					tag: sTag,
					controlId: oParams.oParent.__data.oControl.getId(),
					aggregationName: oParams.sName,
					selectable: oParams.isSelectable,
					text: oParams.sName,
					expanded: oParams.iDepth ? this._isExpanded(oParams.iDepth, sTag) : false,
					toggleOpenState: this._expandHandler.bind(this)
				});
				oNode.__data = {
					sType: "aggregation",
					sAdditionalText: oParams.isDeprecated ? W5gUtils.getText("w5g_badge_deprecated") : ""
				};
				this._addBindingString(oNode, oParams.oParent.__data.oControl, oParams.sName);
				oNode.attachSelected(null, this._onNodeSelected, this);
				return oNode;
			},

			triggerEditorSelectionForNode: function (oSourceNode) {
				return this._oEditor.selectUI5Control(oSourceNode.getControlId(), oSourceNode.getAggregationName());
			},

			/** on "user select's a node" handler
			 *    selects a chosen node in w5g canvas
			 */
			_onNodeSelected: function (oEvent) {
				UsageMonitoringUtils.report("outline_press");
				this.triggerEditorSelectionForNode(oEvent.getSource()).done();
			},

			/**
			 * Sets selected control tag
			 * @param {?string} sSelectedNodeTag
			 */
			setSelectedNodeTag: function (sSelectedNodeTag) {
				this._sSelectedNodeTag = sSelectedNodeTag;
			},

			/**
			 * Searches a node in _oUI5Tree by tag. Returns oNode or null (if nothing found)
			 *
			 * @param {string} sTag
			 * @return {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode}
			 * @private
			 */
			_getNodeByTag: function (sTag) {
				var oRes = null;

				var cycleNodeSearch = function (aNodes) {
					if (oRes || !aNodes.length) {
						return;
					}
					aNodes.map(function (oNode) {
						if (oNode.getTag() === sTag) {
							oRes = oNode;
						}
						cycleNodeSearch(oNode.getNodes());
					});
				};

				cycleNodeSearch(this._oUI5Tree.getNodes());
				return oRes;
			},

			/**
			 * Gets tag for a given control
			 *
			 * @param {sap.ui.core.Control} oControl
			 * @return {string} tag
			 * @private
			 */
			_getControlTag: function (oControl) {
				return oControl && oControl.sId;
			},

			updateToolbarModel: function () {
				function updatePath(oCommand, sPath) {
					// only isEnabled is relevant because focus might be not on W5G but button should still be enabled
					return oCommand._oService.isEnabled().then(function (bEnabled) {
						_oToolbarModel.setProperty(sPath, bEnabled);
					});
				}
				return Q.all([
					updatePath(this._oAddCommand, "/isAddable"),
					updatePath(this._oRemoveCommand, "/isDeletable")
				]);
			},

			/**
			 * Selects a node in a tree based on control argument and possibly clears aggregation
			 *
			 * @param {sap.ui.core.Control} oControl control selected
			 * @param {string=} sAggregation aggregation selected
			 */
			selectNodeFromSelection: function (oControl, sAggregation) {
				var sTag = this._getControlTag(oControl),
					oNode = this._getNodeByTag(sTag);
				if (oNode && sAggregation) {
					oNode = _.find(oNode.getNodes(), function (oNode) {
						return oNode.getAggregationName() === sAggregation;
					});
					sTag = oNode.getTag();
				}
				if (sTag === this._sSelectedNodeTag) {
					return;
				} else if (sTag) {
					this.selectNodeByTag(sTag);
				} else {
					this.deselectAllNodes();
				}
				this.setSelectedNodeTag(sTag);
			},

			/**
			 * Searches and selects existing node by tag
			 *
			 * @param {string} sTag
			 */
			selectNodeByTag: function (sTag) {
				var oNode = this._getNodeByTag(sTag);
				if (oNode) {
					//select existing node
					if (!oNode.getDomRef()) {
						oNode.rerender();
					}
					// hack to prevent multiple selection. After UI5 update not needed (hopefully)
					this.deselectAllNodes();
					//
					this._selectNode(oNode);
				}
			},

			getSelectedNode: function () {
				return this._sSelectedNodeTag && this._getNodeByTag(this._sSelectedNodeTag);
			},

			/**
			 * Selects node and scroll it into view
			 *
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTreeNode} oNode
			 * @private
			 */
			_selectNode: function (oNode) {
				var that = this;
				oNode.detachSelected(this._onNodeSelected, this);
				this.setSelectedNodeTag(oNode.getTag());

				var ensureExpanded = function (oN) {
					if (oN.getParent() !== that._oUI5Tree) {
						ensureExpanded(oN.getParent());
					}
					if (!oN.getExpanded()) {
						oN.expand();
					}
				};

				ensureExpanded(oNode);
				// first expand and then select so there will be a scroll to selection if needed
				oNode.select();
				oNode.attachSelected(null, this._onNodeSelected, this);
			},

			/**
			 * Deselects node by tag
			 *
			 * @param {string} sTag
			 * @private
			 */
			_deselectNodeByTag: function (sTag) {
				var oNode = this._getNodeByTag(sTag);
				if (oNode) {
					//  hack, because there's no deselect API in ui5
					var bPrevSelectable = oNode.getSelectable();
					oNode.setSelectable(false);
					oNode.setSelectable(bPrevSelectable);
					oNode.rerender();
				}
				if (this._sSelectedNodeTag === sTag) {
					this.setSelectedNodeTag(null);
				}
			},

			/**
			 * Deselects selected node
			 */
			deselectAllNodes: function () {
				if (this._sSelectedNodeTag) {
					this._deselectNodeByTag(this._sSelectedNodeTag);
				}
			},

			/** counts if node is expanded based on node's depth in tree
			 *
			 * @param {number} iDepth
			 * @param {string=} sTag
			 */
			_isExpanded: function (iDepth, sTag) {
				return iDepth < this._iTreeDefaultExpandedDepth || this._isTagExpanded(sTag);
			},

			_getFragmentName: function (oControl) {
				var aFragM = oControl.__FragmentName.split('.');
				return (aFragM && aFragM.length > 0) ? ": " + aFragM[aFragM.length - 1] : " ";
			},

			_getSubviewName: function (oControl) {
				var aSubviewM = oControl.getControllerName().split('.');
				return (aSubviewM.length > 0) ? ": " + aSubviewM[aSubviewM.length - 1] : " ";
			},

			onAdd: function () {
				return this._oAddCommand.execute().done();
			},

			onDelete: function () {
				return this._oRemoveCommand.execute().done();
			}
		});
	}
);
