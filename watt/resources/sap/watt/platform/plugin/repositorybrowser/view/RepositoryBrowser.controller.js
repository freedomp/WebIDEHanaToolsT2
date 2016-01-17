(function() {
	"use strict";

	var _;

	sap.ui.controller("sap.watt.platform.plugin.repositorybrowser.view.RepositoryBrowser", {

		// ================================
		// member variables
		// ================================
		_oUI5Tree: undefined,
		_bContextMenuHandlerBound: undefined,
		_context: undefined,
		_selectedDocument: undefined,
		_oContextMenuGroup: undefined,
		_oDecoration: null,
		_documentStackForDecoration: null,
		_doubleClickEnabled: false,
		_bPreferenceStoreEnabled: false,
		_aFilters: [],
		_selectedNodes: undefined,

		setDecoration: function(oDecoration, bDecorationEnabled) {
			var that = this;
			if (oDecoration && bDecorationEnabled) {
				return oDecoration.areDecoratorsAvailable().then(function(bResult) {
					if (bResult) {
						return that._oDecoration = oDecoration;
					} else {
						return Q();
					}
				});
			} else {
				return Q();
			}
		},

		// ================================
		// controller method redefinitions
		// ================================
		/** controller initialization
		 * @memberOf sap.watt.platform.plugin.repositorybrowser.view.RepositoryBrowser
		 */

		onInit: function() {
			//no animation on expanding a folder
			sap.ui.commons.TreeNode.ANIMATION_DURATION = 0;

			this._oUI5Tree = this.byId("repositoryTree");
			this._oUI5Tree.attachSelectionChange(null, this.onNodeSelected, this);
			this._mEditors = {};
		},

		/** onAfterRendering
		 * bind context menu handling to view
		 */

		expandNodes: function() {
			var that = this;
			if (!that._bPreferenceStoreEnabled) {
				return Q();
			}
			
			return that._context.service.repositorybrowserPersistence.getNodes().then(function(mNodes) {
				var aKeys = Object.keys(mNodes);
				for (var k = 0; k < aKeys.length; k++) {
					var sKey = aKeys[k];
					var oDocument = mNodes[sKey];

					that.setSelection(oDocument, true, true, true);
				}
			});

		},

		restoreSelected: function() {
			var that = this;
			if (!that._bPreferenceStoreEnabled) {
				return Q();
			}

			return that._context.service.repositorybrowserPersistence.getStoredSelected().then(function(oDocument) {
				if (oDocument) {
					that.setSelection(oDocument, true);
				} else {
					// TODO: that._oRootNode should be always defined, but this is not the case in some unit tests
					// Initial investigation shows that this is related to promise that is not returned in RepositoryBrowser
					// init method (see RepositoryBrowser.js:21-22)
					// JIRA: WDECORE-609
					if (that._oRootNode) {
						that._oRootNode.select();
					}
				}
			});
		},

		onAfterRendering: function() {
			var that = this;

			if (!this._bContextMenuHandlerBound) {
				this.getView().$().on("contextmenu", function(e) {
					e.preventDefault();
					var element = e.target;
					while (element && !element.attributes["id"]) {
						element = element.parentElement;
					}
					if (element && element.attributes["id"]) {
						var sId = element.attributes["id"].value;
						var oNode = sap.ui.getCore().byId(sId);

						if (oNode) {
							// get all the selected docs as nodes
							var oSelectedNodes = _.map(that.getSelection(), function(selection) {
								return that._oUI5Tree.getNodeByTag(selection.document.getKeyString());
							});

							// if the right clicked node is in the selection -> select the selection
							// if not -> select the node that was right clicked (single selection)
							if (!_.contains(oSelectedNodes, oNode)) {
								oNode.select();
							}
							/*
							* Adding call to set focus to make sure repository browser focused when right click on repository browser is performed.
							* related to incident id #1570801585.
							* */
							that._context.service.focus.setFocus(that._context.self).then(function(){
								return that._context.service.contextMenu.open(that._oContextMenuGroup, e.pageX, e.pageY);
							}).done();
						}
					}
				});
				this._bContextMenuHandlerBound = true;
			}
		},

		// ============================================================
		// public - used by repository browser's service implementation
		// ============================================================
		/**
		 * @param {object} oContext the service's context
		 */
		init: function(oContext) {
			this._oCustomStyle = null;
			this._bContextMenuHandlerBound = false;
			this._context = oContext;
			this._selectedDocument = null;
			this._oRootNode = null;

			var that = this;

			var _oRootNode;

			require(["sap/watt/lib/lodash/lodash"], function(lodash) {
				_ = lodash;
			});

			return this._createRootNode(this._oUI5Tree).then(function(oRootNode) {
				that._oRootNode = oRootNode;
				return that._oRootNode.oDocument.getFolderContent();
			}).then(function(oResult) {
				that._onExpandedContentFetched(oResult, that._oRootNode);
			}).thenResolve(that._oRootNode);
		},

		/** setDoubleClickEnabled
		 *	//double click, which trigger "open", might not be wanted to be enabled,
		 *	//e.g. when tree instance is created through factory and used in project wizard
		 */
		setDoubleClickEnabled: function(bEnabled) {
			this._doubleClickEnabled = bEnabled;
		},

		/** enablePreferenceStore
		 */
		enablePreferenceStore: function(bEnabled) {
			this._bPreferenceStoreEnabled = bEnabled;
		},

		enableMultipleSelection: function(bEnabled) {
			if (bEnabled) {
				this._oUI5Tree.setSelectionMode(sap.ui.commons.TreeSelectionMode.Multi);
			} else {
				this._oUI5Tree.setSelectionMode(sap.ui.commons.TreeSelectionMode.Legacy);
			}
		},

		/** enablePreferenceStore
		 */
		setFilters: function(aFilters) {
			this._aFilters = aFilters;
		},

		/** gets the selected document
		 */
		getSelection: function() {
			return this._selectedDocument;
		},

		/** a.) sets the selected document, b.) selects the corresponding node, c.) if desired, expands the respective node
		 */
		setSelection: function(oDocument, bExpand, bDoNotSelect, bIncludingMyself) {
			var that = this;
			
			/*since the web ide supports multiple DAOs we want to select the selection only
			 *in case the selected document was opened from the workspace
			 *and not from the compare editor were the dao is gitfiledao, in such a case
			 *the repository browser should not set the selection with the given document
			 */
			if (oDocument.getEntity().getDAO() !== "workspace"){
				return;
			}
			if (!bDoNotSelect && !bIncludingMyself) {
				((oDocument.getEntity().getType() === "file") ? oDocument.getParent() : Q(oDocument)).then(function(oDoc) {
					return that._context.service.repositorybrowserPersistence.add(oDoc);
				}).done();
			}
			var oNode = this._oUI5Tree.getNodeByTag(oDocument.getKeyString());
			if (oNode) {
				//select existing node

				if (!oNode.getDomRef()) {
					oNode.rerender();
				}

				this._selectAndExpandExistingNode(oNode, bExpand, bDoNotSelect, bIncludingMyself);
			} else {
				//select to be created node
				this._selectAndExpandToBeCreatedNode(oDocument, bExpand, bDoNotSelect, bIncludingMyself).done();
			}
		},

		/**  set context menu group
		 */
		setContextMenuGroup: function(oContextMenuGroup) {
			this._oContextMenuGroup = oContextMenuGroup;
		},

		/** add a tree node for a certain document
		 */
		addNodeForDocument: function(oDocument, oParent) {
			var oParentNode = this._oUI5Tree.getNodeByTag(oParent.getKeyString());
			if (oParentNode) {

				if (oParentNode.isLoaded) {
					// "loaded" means that child documents of the document related to the parent node were load and respective tree nodes were created
					var oNewNode = this._createNodeForDocument(oDocument);
					if (oNewNode) {
						var aNodes = oParentNode.getNodes();

						if (aNodes.length === 0) {
							oParentNode.insertNode(oNewNode, 0);
							return;
						}

						var i = 0;
						for (i in aNodes) {
							var oCompareNode = aNodes[i];
							if (this._nodeComparator(oDocument, oCompareNode.oDocument) < 0) {
								oParentNode.insertNode(oNewNode, i);
								oParentNode.rerender();
								return;
							}
						}
						oParentNode.insertNode(oNewNode, i + 1);
						oParentNode.rerender();
					}
				} else {
					// parent node "not loaded". But at this point we know, that there are children
					// TODO: Better solution needed, children information in document metadata should be delivered correctly
					// Current solution would not be suitable in case creation and deletion of folder children are both done without
					// expanding the node manually
					// See FolderDocument.refresh() and Document._notifyAboutNewDocument()
					oParentNode.setHasExpander(true);
				}
			}
		},

		/** remove node for a certain document
		 *
		 */
		removeNodeForDocument: function(oDocument) {
			var that = this;
			var oNode = this._oUI5Tree.getNodeByTag(oDocument.getKeyString());
			if (oNode) {

				if (that._bPreferenceStoreEnabled) {
					this._context.service.repositorybrowserPersistence.remove(oDocument).done();
				}

				var oSelection = _.map(that.getSelection(), function(oCurrentSelection) {
					if (oCurrentSelection && oCurrentSelection.document) {
						return oCurrentSelection.document;
					}
				});
				if (_.contains(oSelection, oDocument)) {
					this._setSelectedDocument(); //sets document and fires selectChanged event -> needed e.g. for reprocessing of command status
				}
				var oParent = oNode.getParent();
				if (oParent.getNodes().length == 1) {
					//Remove last node from parent
					//Remove expander, but not for "level 1"/project documents
					//collapse first, then destroy last node - otherwise issues in Tree.adjustFocus()

					if (oParent.oDocument.getEntity().getParentPath() == "") {
						oParent.collapse();
						oNode.destroy();
					} else {
						oParent.collapse();
						oNode.destroy();
						oParent.setHasExpander(false);
						oParent.rerender();
					}
				} else {
					//Remove node that is not the last one from parent
					oNode.destroy();
				}
			}
		},

		/** update node for a certain document
		 * e.g. a child was created, and expander (or rather respective style) needs to be displayed
		 */
		updateNodeForDocument: function(oDocument) {
			var oNode = this._oUI5Tree.getNodeByTag(oDocument.getKeyString());
			if (oNode) {
				console.log("Document: " + oDocument.getKeyString() + " hasChildren: " + oDocument.getDocumentMetadata().hasChildren);
				// Check if document has children - Ensure expander is set correctly
				if (oDocument.getDocumentMetadata().hasChildren) {
					oNode.setHasExpander(true);
				} else {
					oNode.setHasExpander(false);
				}
			}
		},
		// =======================
		// public - handler for tree events
		// =======================
		/** handler for tree node's "ToggleOpenState" event
		 * "ToggleOpenState" is caused:
		 * a.) triggered by user interaction in tree, when expanding a node
		 * b.) programmatically, following _selectAndExpand...-methods -> Inconsistent Behavior, we don't handle this one
		 * 		TODO: clarify concept with UI5
		 */
		onToggleOpenState: function(event) {
			var that = this;
			// don't handle in case event was triggered programmatically
			if (window.event && window.event.type == "message") {
				return;
			}
			var oSourceNode = event.getSource();
			if (event.getParameters().opened === true) {
				this._expandedNodeHandling(oSourceNode);
				if (that._bPreferenceStoreEnabled) {
					this._context.service.repositorybrowserPersistence.add(oSourceNode.oDocument).done();
				}
			} else {
				if (that._bPreferenceStoreEnabled) {
					this._context.service.repositorybrowserPersistence.remove(oSourceNode.oDocument).done();
				}
			}
		},

		_filterFolderContentResult: function(oResult) {
			// filtered result
			if (this._aFilters.length > 0) {
				var oFilteredResult = [];
				for (var i = 0; i < oResult.length; i++) {
					if (oResult[i].getEntity().getType() === "folder") {
						oFilteredResult.push(oResult[i]);
					} else {
						var sExtension = oResult[i].getEntity().getFileExtension();
						if (this._aFilters.indexOf(sExtension) != -1) {
							oFilteredResult.push(oResult[i]);
						}
					}
				}
				return Q(oFilteredResult);
			} else {
				return Q(oResult);
			}
		},

		/** expand node
		 */
		_expandedNodeHandling: function(oNode) {
			// check if childEntries are already loaded

			if (!oNode.isLoaded && !oNode.expandPromise) {
				var that = this;
				oNode.expandPromise = oNode.oDocument.getFolderContent().then(function(oResult) {
					return that._filterFolderContentResult(oResult);
				}).then(function(oResult) {
					that._onExpandedContentFetched(oResult, oNode);
					delete oNode.expandPromise;
				});
				oNode.expandPromise.done();
			}
		},

		/** handler for tree node's "selected" event
		 * handle only when triggered by mouse or keyboard (see also onToggleOpenState)
		 */
		onNodeSelected: function(oEvent) {
			// don't handle in case event was triggered programmatically
			if (window.event && window.event.type == "message") {
				return;
			}
			var aNodes = oEvent.getParameter("nodes");
			var aDocuments = [];
			for (var i = 0; i < aNodes.length; i++) {
				aDocuments.push({
					document: aNodes[i].oDocument
				});
			}
			this._setSelectedDocument(aDocuments);

		},

		/** set custom node style to files and folders shown in the tree
		 */
		setNodeCustomStyle: function(oCustomStyle) {
			this._oCustomStyle = oCustomStyle;

			var nodes = this._oUI5Tree.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				this._updateNodeStyle(nodes[i], true, true);
			}
		},

		/** remove custom node style from files and folders
		 */
		removeNodeCustomStyle: function() {
			var nodes = this._oUI5Tree.getNodes();
			for (var i = 0; i < nodes.length; i++) {
				this._updateNodeStyle(nodes[i], true, false);
			}

			this._oCustomStyle = null;
		},

		// ======================
		// private
		// ======================
		/** expand node after content for respective document is fetched
		 * functions as callback for .oDocument.getFolderContent()
		 */
		_onExpandedContentFetched: function(mDocuments, oNode) {
			if (oNode.bIsDestroyed || !oNode.getTree()) {
				//A call returned which was sent for a node, which is no longer there
				return;
			}
			var that = this;

			mDocuments.sort(this._nodeComparator);
			for (var i = 0; i < mDocuments.length; i++) {
				var oDocument = mDocuments[i];
				var oNewNode = that._createNodeForDocument(oDocument);
				if (oNewNode) {

					oNode.addNode(oNewNode);

					if (that.getSelection() && that.getSelection().document === oDocument) {
						oNewNode.select();
						that._oUI5Tree.setSelectedNode(oNewNode);
					}
				}
			}
			oNode.isLoaded = true;
			this._documentStackForDecoration = null;
		},

		_setDecoration: function(oNode, oEvent) {
			var that = this;
			var oDocument = oNode.oDocument;

			if (this._documentStackForDecoration) {
				for (var i = 0; i < this._documentStackForDecoration.length; i++) {
					var oDoc = this._documentStackForDecoration[i].document;
					if (oDoc == oDocument) {
						var oEvent = this._documentStackForDecoration[i].event;
						this._documentStackForDecoration.splice(i, 1);
						break;
					}
				}
			}

			var aSuffixes = [];
			var aStyleClasses = [];
			return this._oDecoration.decorate(oDocument, oEvent).then(function(mResult) {
				if (mResult.length > 0) {
					for (var i = 0; i < mResult.length; i++) {
						//TODO clarify what to do when the multiple decorators decorate the same property
						var oResult = mResult[i];
						if (oResult.styleClass) {
							// can be an array of string or a simple string
							if (typeof(oResult.styleClass) == "string") {
								aStyleClasses.push(oResult.styleClass);
							} else {
								if (oResult.styleClass.length) {
									aStyleClasses.push.apply(aStyleClasses, oResult.styleClass);
								}
							}
						}
						if (oResult.prefix) {
							oNode.setPrefix(oResult.prefix);
						}
						if (oResult.suffix) {
							// can be an array or an object
							if (oResult.suffix.length) {
								aSuffixes.push.apply(aSuffixes, oResult.suffix);
							} else {
								aSuffixes.push(oResult.suffix);
							}
						}
						if (oResult.decoratorIconBottomLeft || oResult.decoratorIconBottomLeft == "") {
							oNode.setDecoratorIconBottomLeft(oResult.decoratorIconBottomLeft);
						}
						if (oResult.decoratorIconBottomRight || oResult.decoratorIconBottomRight == "") {
							oNode.setDecoratorIconBottomRight(oResult.decoratorIconBottomRight);
						}
						if (oResult.decoratorIconTopLeft || oResult.decoratorIconTopLeft == "") {
							oNode.setDecoratorIconTopLeft(oResult.decoratorIconTopLeft);
						}
						if (oResult.decoratorIconTopRight || oResult.decoratorIconTopRight == "") {
							oNode.setDecoratorIconTopRight(oResult.decoratorIconTopRight);
						}
						if (oResult.decoratorIconStyleClass || oResult.decoratorIconStyleClass == "") {
							oNode.setDecoratorIconStyleClass(oResult.decoratorIconStyleClass);
						}
					}
					aSuffixes.sort(that.sortByPrio);
					oNode.setSuffixes(aSuffixes);
					oNode.setStyleClasses(aStyleClasses);
					return oNode;
				}
			});
		},

		sortByPrio: function(a, b) {
			return a.prio - b.prio;
		},

		/** update the custom styles for a node and its children.
		 */
		_updateNodeStyle: function(oNode, isRoot, isAdding) {
			if (!isRoot) {
				var oDocument = oNode.oDocument;
				var style = this._getCustomStyle(oDocument);
				if (style) {
					if (isAdding) {
						oNode.addStyleClass(style);
					} else {
						oNode.removeStyleClass(style);
					}
				}
			}
			var children = oNode.getNodes();
			for (var i = 0; i < children.length; i++) {
				this._updateNodeStyle(children[i], false, isAdding);
			}
		},

		/** select and expand existing node
		 */
		_selectAndExpandExistingNode: function(oNode, bExpand, bDoNotSelect, bIncludingMyself) {
			//Node is already loaded,
			//this indicates that all parent nodes have their children loaded already
			//but we have to ensure that they are expanded properly
			var that = this;

			if (!oNode) {
				return;
			}

			function ensureExpanded(oTheNode) {
				if (oTheNode && oTheNode.getParent && oTheNode.getParent() !== that._oUI5Tree) {
					ensureExpanded(oTheNode.getParent());
				}
				if (oTheNode && oTheNode.getExpanded && !oTheNode.getExpanded()) {
					oTheNode.expand();
					that._expandedNodeHandling(oTheNode);
				}
			}

			if (bExpand) {
				ensureExpanded(oNode.getParent());
			}

			// also expand level 1 nodes
			if (bIncludingMyself) {
				ensureExpanded(oNode);
			}

			if (!bDoNotSelect) {
				this._selectNode(oNode, bExpand, false);
			}
			return;
		},

		/** select and expand in case a node does not exist already
		 * a.) node creation is in progress, but not yet finished
		 * b.) parent node (and potentially further ancestors) are not yet load
		 */
		_selectAndExpandToBeCreatedNode: function(oDocument, bExpand, bDoNotSelect, bIncludingMyself) {
			var that = this;

			if (!bExpand) {
				return;
			}

			// find closest load ancestor node
			var aDocumentsWoNodes = [];

			function findClosestLoadedAncestorNode(oDocument) {
				return oDocument.getParent().then(function(oParentDocument) {
					if (oParentDocument == null) {
						//check stop condition / Root Node
						//L1-nodes should be there
						return null;
					}
					var oParentNode = that._oUI5Tree.getNodeByTag(oParentDocument.getKeyString());
					if (oParentNode) {
						return oParentNode;
					} else {
						aDocumentsWoNodes.push(oParentDocument);
						return findClosestLoadedAncestorNode(oParentDocument);
					}
				});
			}

			// expandNodes recursively
			// starts from "closest loaded ancestor"
			function expandNode(oAncestorNode) {
				if (!oAncestorNode) {
					return Q();
				}

				oAncestorNode.expand(); //Expand the tree node
				that._expandedNodeHandling(oAncestorNode); //
				if (!oAncestorNode.expandPromise) {
					return Q();
				}
				return oAncestorNode.expandPromise.then(function() {
					var oNode = that._oUI5Tree.getNodeByTag(oDocument.getKeyString());
					if (oNode) {
						if (!bDoNotSelect) {
							that._selectNode(oNode, bExpand, true);
						}
						return Q();
					} else {
						var aNextDocumentWithNodeToExpand = aDocumentsWoNodes.pop();
						if (!aNextDocumentWithNodeToExpand) {
							return Q();
						}
						var oNextNodeToExpand = that._oUI5Tree.getNodeByTag(aNextDocumentWithNodeToExpand.getKeyString());
						if (oNextNodeToExpand) {
						    oNextNodeToExpand.rerender(); //TODO: once bug in UI5 solved, remove
						}
						return expandNode(oNextNodeToExpand);
					}
				});
			}

			return findClosestLoadedAncestorNode(oDocument).then(function(oAncestorNode) {
				return expandNode(oAncestorNode).then(function() {
					if (bIncludingMyself) {
						return expandNode(that._oUI5Tree.getNodeByTag(oDocument.getKeyString()));
					} else {
						return Q();
					}
				});
			});
		},

		/** select node (and scroll it into view)
		 */
		_selectNode: function(oNode, bExpand, bAfterRendering) {
			var that = this;

			this._setSelectedDocument([{
				document: oNode.oDocument
			}]);

			if (!bAfterRendering) {
				oNode.select();
				return;
			}

			var oDelegate;

			var fEventDelegate = function(evt) {
				oNode.select();
				that._oUI5Tree.removeEventDelegate(oDelegate);
			};

			oDelegate = {
				onAfterRendering: fEventDelegate
			};

			this._oUI5Tree.addEventDelegate(oDelegate);
		},

		/** set the selected document
		 */
		_setSelectedDocument: function(oDocument) {
			var that = this;

			if (!oDocument) {
				this._selectedDocument = null;
			} else {
				this._selectedDocument = oDocument;
			}
			if (that._bPreferenceStoreEnabled) {
				this._context.service.repositorybrowserPersistence.onSelectionChanged(oDocument).done();
			}
			this._context.event.fireSelectionChanged().done();
		},

		_getCustomStyle: function(oDocument) {
			if (this._oCustomStyle) {
				var mEntity = oDocument.getEntity();
				var myPath = mEntity.getParentPath() + "/" + mEntity.getName();
				if (myPath in this._oCustomStyle) {
					return this._oCustomStyle[myPath];
				}
			}

			return null;
		},

		/** create node for a certain document
		 */
		_createNodeForDocument: function(oDocument) {
			var mEntity = oDocument.getEntity();
			if (!oDocument.getDocumentMetadata().hidden) {

				//Calc icon
				var sTypeClass = "";

				if (mEntity.isFolder()) {
					sTypeClass = "wattTreeFolder";
				} else {
					sTypeClass = "wattTreeFile";
				}

				var customStyle = this._getCustomStyle(oDocument);

				var sNodeId = oDocument.getKeyString();
				var bHasExpander;
				switch (oDocument.getType()) {
					case "file":
						bHasExpander = false;
						break;
					case "folder":
						// for root folder children cannot be determined without additional request, "hasChildren" is undefined in this case
						bHasExpander = (oDocument.getEntity().getParentPath() === "" //folder on root level have always expanders
							|| oDocument.getDocumentMetadata().hasChildren) || false;
						break;
					default:
						throw new Error("Unexpected Error");
				}

				var oNode = new sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode({
					tag: sNodeId,
					text: mEntity.getName(),
					hasExpander: bHasExpander,
					expanded: false
				}).addStyleClass(sTypeClass);
				if (customStyle) {
					oNode.addStyleClass(customStyle);
				}

				oNode.isLoaded = false;
				oNode.oDocument = oDocument;
				oNode.keyString = oDocument.getKeyString();

				switch (mEntity.getType()) {
					case "file":
						if (this._doubleClickEnabled) {
							oNode.attachDblClick(null, function(event) {
								var oSourceNode = event.getSource();
								this._context.service.document.open(oSourceNode.oDocument).done();
							}, this);
						}
						break;
					case "folder":
						oNode.attachToggleOpenState(null, this.onToggleOpenState.bind(this));
						break;
				}

				// oNode.attachSelected(null, this.onNodeSelected, this);

				if (this._oDecoration) {
					this._setDecoration(oNode).done();
				}

				return oNode;
			}
		},

		/** creates the tree's root node
		 * used by init() only
		 */
		_createRootNode: function(_oUI5Tree) {
			var that = this;
			return this._context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
				var sRootInfo = that._context.i18n.getText("i18n", "repositoryBrowser_rootNode");
				var sNodeId = oRootDocument.getKeyString();

				// create Content Root Node
				var oNode = new sap.watt.platform.plugin.repositorybrowser.view.BrowserTreeNode({
					tag: sNodeId,
					text: sRootInfo,
					hasExpander: true,
					expanded: true
				});
				oNode.oDocument = oRootDocument;

				oNode.type = "rootRepository";
				// oNode.attachSelected(null, that.onNodeSelected, that);

				if (that.getSelection() && that.getSelection().document == oRootDocument) {
					oNode.select();
				}

				_oUI5Tree.addNode(oNode);

				return oNode;
			});
		},

		/** comparator for sorting nodes
		 */
		_nodeComparator: function(oDocumentA, oDocumentB) {
			var sNameA = oDocumentA.getEntity().getName().toLowerCase();
			var sNameB = oDocumentB.getEntity().getName().toLowerCase();
			var sTypeA = oDocumentA.getType();
			var sTypeB = oDocumentB.getType();
			if (sTypeA === "file" && sTypeB === "folder") { // sort first folder then file
				return 1;
			} else if (sTypeA === "folder" && sTypeB === "file") {
				return -1;
			} else if (sNameA < sNameB) { // sort document name ascending
				return -1;
			} else if (sNameA > sNameB) {
				return 1;
			} else {
				return 0; // default (no sorting)
			}
		},

		/** get URL of images/icons
		 */
		_getImageUrl: function(sImageName) {
			// TODO: Move the images to the plugin!
			return require.toUrl("sap/watt/uitools/images") + "/" + sImageName;
		},
		
		toggleNodeFocus: function(bIsFocused) {
            var fToggleFunction = (bIsFocused ? "removeClass" : "addClass"),
                sFocusClassName = "sapUiTreeNodeUnfocused";
	
            if (this._selectedNodes) {
                this._selectedNodes.removeClass(sFocusClassName);
                this._selectedNodes = null;
            }
            this._selectedNodes = this._oUI5Tree.$().find(".sapUiTreeNodeSelected");

            this._selectedNodes[fToggleFunction](sFocusClassName);
		}
	});

}());