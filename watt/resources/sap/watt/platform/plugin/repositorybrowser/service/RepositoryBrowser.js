define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart", "../view/RepositoryBrowser.controller", "../view/BrowserTreeNode", "../view/BrowserTree", "../view/BrowserTreeRenderer"], function(AbstractPart) {
	"use strict";
	var RepositoryBrowser = AbstractPart.extend("sap.watt.platform.plugin.repositorybrowser.service.RepositoryBrowser", {

		_oView : null,
		_oController : null,

		_bLinkWithEditor : false,
		_bSelectionSuppressed : false,
		_lastDoc : null,

		// ====================================================================================
		// Service life cycle methods
		// ====================================================================================
		init : function() {
			this._oView = sap.ui.view({
				viewName : "sap.watt.platform.plugin.repositorybrowser.view.RepositoryBrowser",
				type : sap.ui.core.mvc.ViewType.XML
			});
			this._oController = this._oView.getController();
			// important: the configure must run before the controller is initialized
			//return this._oController.init(this.context);
		},

		configure : function(mConfig) {
			var that = this;

			return AbstractPart.prototype.configure.apply(this, arguments).then(function() {
				// if repository browser is created by a factory the decorations might not be wanted (parammeter mConfig.decorationEnabled)
				// important: the decoration must be set before the controller is initialized 
				return that._oController.setDecoration(that.context.service.decoration, mConfig.decorationEnabled).then(function(){
					return that._oController.init(that.context).then(function(){
						//double click, which trigger "open", might not be wanted to be enabled, 
						//e.g. when tree instance is created through factory and used in project wizard
						var bDoubleClickEnabled = !!mConfig.doubleClickEnabled;
						that._oView.getController().setDoubleClickEnabled(bDoubleClickEnabled);

						that._oView.getController().enablePreferenceStore(!!mConfig.preferenceEnabled);

						that._oView.getController().setFilters(mConfig.filters);
						that._oView.getController().enableMultipleSelection(mConfig.multipleSelectionEnabled);

						var aProms = [];
						if (mConfig.contextMenu) {
							aProms.push(that.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
								that._oView.getController().setContextMenuGroup(oGroup);
							}));
						}

						if (mConfig.preferenceEnabled) {
							aProms.push(that._oView.getController().expandNodes().then(function() {
								return that._oView.getController().restoreSelected();
							}));
						}
						return Q.all(aProms);

					});

				});
			}).then( function () {
				that.context.service.document.attachEvent("changed", that.onDocumentChanged, that);
				that.context.service.document.attachEvent("created", that.onDocumentCreated, that);
			});
		},

		restoreInitialLinkedState: function() {
			var that = this;
			this.context.service.repositorybrowserPersistence.getLinked().then(function(bLinked) {
				that._bLinkWithEditor = bLinked;
			}).done();
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Part
		// ====================================================================================
		getContent : function() {
			var that = this;
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				return that._oView;
			});
		},

		getFocusElement : function() {
			return this._oView;
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.selection.Provider
		// ====================================================================================
		getSelection : function() {
			var oSelection = this._oView.getController().getSelection();
			return oSelection;
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Browser
		// ====================================================================================
		setNodeCustomStyle : function(oCustomStyle) {
			this._oView.getController().setNodeCustomStyle(oCustomStyle);
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Browser
		// ====================================================================================
		removeNodeCustomStyle : function() {
			this._oView.getController().removeNodeCustomStyle();
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Browser
		// ====================================================================================
		setSelection : function(oDocument, bExpand, bIncludingMyself) {
			this._oView.getController().setSelection(oDocument, bExpand, undefined, bIncludingMyself);
		},

		// Interface methods: sap.watt.common.service.ui.Browser / Link Repository Browser with Editor 
		// ==================================================================================== 
		toggleLinkWithEditor : function() {
			this._bLinkWithEditor = !this._bLinkWithEditor;
			this._lastDoc = null;
			this.context.service.repositorybrowserPersistence.onLinkChanged({
				linked: this._bLinkWithEditor
			});
		},

		getStateLinkWithEditor : function() {
			return this._bLinkWithEditor;
		},

		// ====================================================================================  

		// ====================================================================================
		// event handler
		// ====================================================================================
		onDocumentChanged : function(oEvent) {
			var sType = oEvent.params.changeType;
			var oDocument = oEvent.params.document;
			var oController = this._oView.getController();
			if (!oDocument || !oController) {
				return;
			}
			if (sType === "hidden") {
				this._handleHiddenChange(oDocument, oController, oEvent);
			} else if (sType === "deleted") {
				oController.removeNodeForDocument(oDocument);
			} else if (sType === "children" && this._oView.oController && this._oView.oController._oUI5Tree) {
				var oNode = this._oView.oController._oUI5Tree.getNodeByTag(oEvent.params.document.getKeyString());
				if (oNode) {
					var oMeta = oEvent.params.document.getDocumentMetadata();
					var bExpander = oMeta.hasChildren;
					if (bExpander === undefined) {
						bExpander = true;
					}
					oNode.setHasExpander(bExpander);

					oNode.rerender();
				}
			}
		},
		
		_handleHiddenChange : function(oDocument, oController, oEvent) {
			var bHidden = oDocument.getDocumentMetadata().hidden;
			if (bHidden) {
				oController.removeNodeForDocument(oDocument);
			} else {
				oController.addNodeForDocument(oDocument, oEvent.params.parent);	
			}
		},

        _sendFocusChangeToViewController: function(bIsFocused) {
            this._oView.getController().toggleNodeFocus(bIsFocused);
        },
        
        onFocusChanged: function() {
            var that = this;
            this.context.service.focus.getFocus().then(function(oService) {
                that._sendFocusChangeToViewController(oService._sName === "repositorybrowser");
            }).done();
        },
        
        onAllPluginsStarted : function(){
			this.context.service.focus.setFocus(this.context.service.self).done();
        },

		onDocumentCreated : function(oEvent) {
			//created
			if (this._oView.getController()) {
				this._oView.getController().addNodeForDocument(oEvent.params.document, oEvent.params.parent);
			}
		},

		setSelectionToCurrentDocument : function() {
			var that = this;
			return this.context.service.content.getCurrentDocument().then(function(oDocument) {
				if (oDocument) {
					return that.setSelection(oDocument, true);
				}
			});
		},

		// used by "Link Repository Browser with Editor" functionality
		onDocumentSelected : function(oEvent) {
			if (!this._bLinkWithEditor) {
				return;
			}
			var that = this;
			if (oEvent.params.selection.length == 0) {
				return;
			}
			var oSelectedDocument = oEvent.params.selection[0].document;
			if (oSelectedDocument._bExtDoc) {
			    return;
			}
			if (this._lastDoc == oSelectedDocument) {
				// if a node is collapsed or the rep browser view is scrolled a selection changed event is triggered which causes this method to be executed
				// ensure that a folder with a selected document can be collapsed again and scrolling works
				// TODO rework this if the selection eventing changes...
				return;
			}
			this._lastDoc = oSelectedDocument;
			return this.context.service.selection.getOwner().then(function(oOwner) {
				if (oOwner.instanceOf("sap.watt.common.service.editor.Editor")) {
                    var vResult = that.setSelection(oSelectedDocument, true);
                    that._sendFocusChangeToViewController(false);
                    return vResult;
				} else if (oOwner === that.context.service.repositorybrowser) {
					return that.context.service.content.showIfOpen(oSelectedDocument);
				}
			});
		},

		refresh : function() {
			var that = this;
			return this.context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
				return oRoot.refresh().then(function() {
					return that.context.service.content.refresh();
				});
			});
		},

		onDecorationsChanged : function (oEvent) {
			var oOriginalEvent = oEvent.params.event;
			var aDocuments = oEvent.params.documents;
			if (oEvent.params.updateChildren) {
				var that = this;
				aDocuments.forEach(function (oDocument) {
					that.refreshDecorationsForAllChildren(oDocument, oEvent);
				});
			} else {
				this.updateDecoration(aDocuments, oOriginalEvent);
			}
		},

		_updateDecorationInternal : function(oDocument, oEvent) {
			var oNode = this._oController._oUI5Tree.getNodeByTag(oDocument.getKeyString());
			if (!oNode) {
				// it can happen that the new node is not yet created in the repository browser 
				// (this happens when a new document is created for a parent folder with children which has not bee expanded)
				if (!this._oController._documentStackForDecoration) {
					this._oController._documentStackForDecoration = [];
				}
				this._oController._documentStackForDecoration.push({
					document : oDocument,
					event : oEvent
				});
				return Q();
			}
			return this._oController._setDecoration(oNode, oEvent).then(function(oNode){
				return oNode;
			});
		},

		updateDecoration : function(aDocuments, oEvent){
			// aDocuments can be a single document or an array of documents
			if (aDocuments.length){
				// array of documents
				var aPromises = [];
				for ( var i = 0; i < aDocuments.length; i++) {
					var oDoc = aDocuments[i];
					aPromises.push(this._updateDecorationInternal(oDoc, oEvent));
				}
				Q.all(aPromises).done();
			}else{
				// single document
				this._updateDecorationInternal(aDocuments, oEvent).done();
			}
		},

		refreshDecorationsForAllChildren : function(oDocument, oEvent) {
			// calls the updateDecoration of the tree node for oDocument (Folder) and all its children
			if (!oDocument.getFolderContent){
				return;
			}
			this._refreshDecorationsForAllChildrenInternal(oDocument, oEvent).done();
		},

		_refreshDecorationsForAllChildrenInternal : function(oDocument, oEvent) {
			// calls the updateDecoration of the tree node for oDocument (Folder) and all its children
			var that = this;
			var oNode = this._oController._oUI5Tree.getNodeByTag(oDocument.getKeyString());
			if (!oNode) {
				return;
			}
			return this._oController._setDecoration(oNode, oEvent).then(function() {
				if (oNode.isLoaded) {
					//oNode.isLoaded means the node and its children are loaded, only then it is necessary to call the getFolderContent, otherwise the node is not available
					return oDocument.getFolderContent().then(function(aContent) {
						if (aContent.length > 0) {
							var aPromises = [];
							for ( var i = 0; i < aContent.length; i++) {
								var oDoc = aContent[i];
								aPromises.push(that._refreshDecorationsForAllChildrenInternal(oDoc, oEvent));
							}
							return Q.all(aPromises);
						}
					});
				}
			});
		},

		exportSelection: function(aSelection, fileName) {
			var oDocument = aSelection[0].document;
			
			return this.context.service.export.exportDocument(oDocument, fileName);
		}
	});

	return RepositoryBrowser;
});