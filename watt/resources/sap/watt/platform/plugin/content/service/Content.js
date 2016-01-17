define(["sap/watt/common/plugin/platform/service/ui/AbstractPart", "../navigation/Navigation" , "../view/Content.controller", "../control/NavigationBar"], function(AbstractPart) {
	"use strict";

	var Tab = function Tab(oDocument, oEditor, oControl, oDecorator) {
		this._oDocument = oDocument;
		this._oEditor = oEditor;
		this._oControl = oControl;
		this._oDecorator = oDecorator;
	};

	Tab.prototype = {
		/*
	    return the tab decorator
	    */
		getDecorator: function() {
			return this._oDecorator;
		},
		/**
		 * Checks whether the tab is owner of a document / editor pair
		 * @param {Document} oDocument
		 * @param {Editor} oEditor
		 * @return {boolean} whether the tab displays the document in the editor
		 */
		isOwner: function(oDocument, oEditor) {
			return this.hasDocument(oDocument) && oEditor === this.getEditor();
		},

		/**
		 * Checks whether the tab is working with a document
		 *
		 * @param {Document} oDocument
		 * @return {boolean} whether the tab displays the document
		 */
		hasDocument: function(oDocument, bIncludeContained) {
			return oDocument === this.getDocument() || (bIncludeContained && oDocument.contains(this.getDocument())) || oDocument.getKeyString() ===
				this.getDocument().getKeyString();
		},

		/**
		 * Checks whether the tab is working with an editor
		 *
		 * @param {Editor} oEditor
		 * @return {boolean} whether the tab works with the editor
		 */
		hasEditor: function(oEditor) {
			return oEditor === this.getEditor();
		},

		/**
		 * Gets and sets the content in the editor.
		 */
		show: function(bDontFireOpened) {
			var that = this;
			var oDoc = this.getDocument();
			if (oDoc) {
				return that.getEditor().open(oDoc, null, null, null, bDontFireOpened);
			}
		},

		/**
		 * Returns the document shown in the tab.
		 * @return {Document}
		 */
		getDocument: function() {
			return this._oDocument;
		},

		/**
		 * Returns the document shown in the tab.
		 * @return {Document}
		 */
		setDocument: function(oDocument) {
			this._oDocument = oDocument;
		},

		/**
		 * Returns the editor shown in the tab.
		 * @return {Editor}
		 */
		getEditor: function() {
			return this._oEditor;
		},

		/**
		 * Returns the editor control.
		 * @return {object}
		 */
		getControl: function() {
			return this._oControl;
		},

		/**
		 * Saves the document with the editor content.
		 */
		save: function() {
			var that = this;
			return this.flush().then(function() {
				return that.getDocument().save();
			});
		},

		/**
		 * Undo the current edit session
		 */
		undo: function() {
			return !!this.getEditor().undo ? this.getEditor().undo() : Q(false);
		},

		/**
		 * Get whether any undo operation is available for the current edit session
		 * @return {boolean} whether undo is available
		 */
		hasUndo: function() {
			return !!this.getEditor().hasUndo ? this.getEditor().hasUndo() : Q(false);
		},

		/**
		 * Redo the current edit session
		 */
		redo: function() {
			return !!this.getEditor().redo ? this.getEditor().redo() : Q(false);
		},

		/**
		 * Get whether any redo operation is available for the current edit session
		 * @return {boolean} whether redo is available
		 */
		hasRedo: function() {
			return !!this.getEditor().hasRedo ? this.getEditor().hasRedo() : Q(false);
		},

		/**
		 * Writes the editor content into the document.
		 */
		flush: function() {
			return this.getEditor().flush();
		}
	};

	var ContentRegistry = AbstractPart.extend("sap.watt.common.plugin.content.service.ContentRegistry", {

		_fnConfirmUnsaveChanges: null,

		constructor: function() {
			this._oView = null;
			this._aTabs = null;
			this._oOpenQueue = new Q.sap.Queue();
			this._oCloseDefer = null;
			this._aStyles = null;
			this._oContextMenuGroup = null;
			this._oDecorator = null;
			this._oCurrentDocumentQueue = new Q.sap.Queue();
			this._autoSaveInterval = null;
		},

		init: function() {
			this._aTabs = [];
			this._oView = sap.ui.view("contentAreaView", {
				viewName: "sap.watt.platform.plugin.content.view.Content",
				type: sap.ui.core.mvc.ViewType.XML
			});
			this._oView.getController().setContext(this, this.context);
			this._getTabController().attachEvent("tabClose", this._onTabClose, this);
			this._getTabController().attachEvent("tabContextMenu", this._onTabContextMenu, this);
			this._getTabController().attachEvent("tabSetPerspective", this._onTabSetPerspective, this);
			this._getTabController().attachEvent("contentTabSelected", this._onTabSelect, this);
			this._getTabController().attachEvent("finishedContentRendering", this._onFinishedContentRendering, this);
			this._getTabController().attachEvent("tabSaveClose", this._onTabSaveClose, this);
			if (this.context.i18n) {
				this.context.i18n.applyTo(this._oView);
			}

			var that = this;
			history.pushState(null, null, location.href);
			window.onpopstate = function(event) {
				history.go(1);
			};
			this._fnConfirmUnsaveChanges = function(e) {
				if (that.isDirty()) {
					return that.context.i18n.getText("i18n", "content_unsavedChanges");
				}
			};

			if (this.context.service) {
				this.context.service.unloadHandler.addHandler(this._fnConfirmUnsaveChanges).done();
			}
		},

		configure: function(mConfig) {
			var that = this;
			this._oEditorProvider = mConfig.editorProvider;
			this._aStyles = mConfig.styles;
			return AbstractPart.prototype.configure.apply(this, arguments).then(function() {
				that._oDecorator = mConfig.decorator;

				if (mConfig.contextMenu) {
					return that.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
						that._oContextMenuGroup = oGroup;
					});
				}
			});
		},
		
		getEditorProvider: function() {
			return this._oEditorProvider;	
		},

		// used by "Link Repository Browser with Editor" functionality 
		showIfOpen: function(oDocument) {
			var aOpenDocument = this.getDocuments();
			if (aOpenDocument.indexOf(oDocument) > -1) {
				var aTabIndicesOfDocument = this._getTabsOfDocument(oDocument);
				var iTabIndexToShow = aTabIndicesOfDocument[0];
				return this._showTabWithoutSelection(iTabIndexToShow, true);
			}
		},

		_bRestored: false,
		getContent: function() {
			var that = this;

			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				var aProms = [];
				if (!that._bRestored) {
					that._bRestored = true;
					aProms.push(that.context.service.contentPersistence.getTabs().then(function(aTabs) {
						return that.context.service.contentPersistence.getActiveTab().then(function(oActiveTab) {
							return that._oView.getController()._openTabs(aTabs, oActiveTab);
						}).then(function() {
							that.context.service.dirtyDocumentsStorage.clearStorage().done();        
						});
					}));
				}
				if (that._aStyles) {
					aProms.push(that.context.service.resource.includeStyles(that._aStyles).then(function() {
						return that._oView;
					}));
				}
				return Q.all(aProms).thenResolve(that._oView);
			});
		},

		getFocusElement: function() {
			var oFocusElement = this.getCurrentEditor();
			if (!oFocusElement) {
				oFocusElement = this._oView;
			}
			return oFocusElement;
		},

		getSelection: function() {
			var oDocument = this.getCurrentDocument();
			if (!oDocument) {
				return [];
			}
			return {
				document: oDocument
			};
		},

		_getCurrentTab: function() {
			return this._oCurrentTab;
		},

		/**
		 * Returns the current displayed editor
		 *
		 * @return {Editor}
		 */
		getCurrentEditor: function() {
			var oTab = this._getCurrentTab();
			return oTab ? oTab.getEditor() : null;
		},

		_isCurrentEditor: function(oEditor) {
			if (!oEditor) {
				return Q(false);
			}
			var oCurrentEditor = this.getCurrentEditor();
			if (oCurrentEditor.instanceOf("sap.watt.common.plugin.multieditor.service.MultiEditor")) {
				return oCurrentEditor.containsEditor(oEditor);
			}
			return Q(this.getCurrentEditor()._sName === oEditor._sName);
		},

		/**	
		 * Returns the number of loaded documents
		 *
		 * @return {number}
		 */
		getDocumentCount: function() {
			return Object.keys(this._getDocumentsMap()).length;
		},

		_getDocumentsMap: function() {
			var mDocuments = {};

			for (var i = 0; i < this._aTabs.length; i++) {
				var oDoc = this._getTab(i).getDocument();
				var sKey = oDoc.getEntity().getKeyString();
				if (mDocuments[sKey] === undefined) {
					mDocuments[sKey] = oDoc;
				}
			}
			return mDocuments;
		},

		/**
		 * Returns an array of open documents
		 *
		 * @param bOnlyTheDirty: if undefined or false return all documents, else return only the dirty documents
		 * @return {array}
		 */
		getDocuments: function(bOnlyTheDirty) {
			var aResult = [];
			var bDirty = bOnlyTheDirty ? !!bOnlyTheDirty : false;

			var mDocuments = this._getDocumentsMap();

			for (var sKey in mDocuments) {
				if (bDirty) {
					if (mDocuments[sKey].isDirty()) {
						aResult.push(mDocuments[sKey]);
					}
				} else {
					aResult.push(mDocuments[sKey]);
				}
			}
			return aResult;
		},

		/**
		 * Returns the current displayed document
		 *
		 * @return {Document}
		 */
		getCurrentDocument: function() {
			var oTab = this._getCurrentTab();
			return oTab ? oTab.getDocument() : null;
		},

		isCurrentDocumentDirty: function() {
			var oDocument = this.getCurrentDocument();
			return oDocument ? oDocument.isDirty() : false;
		},

		_isCurrentDocument: function(oDocument) {
			return this.getCurrentDocument() &&
                (this.getCurrentDocument() === oDocument ||
                this.getCurrentDocument().getKeyString() === oDocument.getKeyString());
		},

		hasDocuments: function() {
			return this.getDocumentCount() > 0;
		},

		/**
		 * Opens a document in a given editor
		 *
		 * @param {Document} oDocument
		 * @param {Editor} oEditor
		 */
		open: function(oDocument, oEditor) {
			var that = this;

			//Guard reentrance (we can open only one document at a time)
			return this._oOpenQueue.next(function() {
				//perform the actual opening
				return that._open(oDocument, oEditor);
			});
		},

		_open: function(oDocument, oEditor) {
			var that = this;
			var iNewTabIndex = -1;
			var extDoc = oDocument.getExtInfo();
			if ((extDoc && extDoc.external) || oDocument._bExtDoc) {
				return this._openExt(oDocument, oEditor);
			}

			var iTabIndex = that._getTabIndex(oDocument, oEditor);

			if (iTabIndex === -1) {
				return oEditor.getContent().then(function(oEditorControl) {
					iNewTabIndex = that._getTabController().createTab({
						title: that.context.i18n.getText("i18n", "loading"),
						tooltip: "",
						fullQualifiedName: oDocument.getEntity().getFullPath(),
						dirty: oDocument.isDirty(),
						editorControl: oEditorControl
					}, false);

					var oTab = new Tab(oDocument, oEditor, oEditorControl, that._oDecorator);
					that._aTabs.splice(iNewTabIndex, 0, oTab);
					that._storePersistence(oDocument, oEditor, iNewTabIndex);
                    return that._showTab(iNewTabIndex, true);
				});
			} else {
				if (this._getTabController().getSelectedIndex() !== iTabIndex) {
					return this._showTab(iTabIndex, true);
				}
				return Q();
			}
		},

		_storePersistence: function(oDocument, oEditor, iNewTabIndex) {
			var that = this;
			oEditor.isRestorable().then(function(bRestorable) {
				if (bRestorable) {
					return that.context.service.contentPersistence.add({
						keyString: oDocument.getKeyString(),
						editor: oEditor._sName
					}, iNewTabIndex);
				}
			}).done();
		},

		_openExt: function(oDocument, oEditor) {
			var that = this;

			var iTabIndex = that._getExtTabIndex(oDocument, oEditor);
			if (iTabIndex === -1) {
				return oEditor.getContent().then(function(oEditorControl) {
					var oExtraInfo = oDocument.getExtInfo();
					var sTitle = (oExtraInfo && oExtraInfo.title) ? oExtraInfo.title : oDocument.getTitle();
					var sTooltip = (oExtraInfo && oExtraInfo.tooltip) ? oExtraInfo.tooltip : oDocument.getEntity().getFullPath();
					var iNewTabIndex = that._getTabController().createTab({
						title: sTitle,
						tooltip: sTooltip,
						fullQualifiedName: oDocument.getEntity().getFullPath(),
						dirty: oDocument.isDirty(),
						editorControl: oEditorControl
					}, false);

					var oTab = new Tab(oDocument, oEditor, oEditorControl, oExtraInfo.decoratorObj);
					that._aTabs.splice(iNewTabIndex, 0, oTab);
					return that._showTab(iNewTabIndex, true);
				});
			} else {
				if (this._getTabController().getSelectedIndex() !== iTabIndex) {
					return this._showTab(iTabIndex, true);
				}
			}
		},

		/**
		 * Closes a document in a given editor
		 *
		 * @param {Document} oDocument, if not given, close the current
		 * @param {Editor} oEditor, if not given, close all editors with the given document
		 * @param {boolean} bDataLoss optional, if true display a dialog asking to save, cancel or close without saving the tab, if false the tab will be closed without any data loss logic
		 */
		close: function(oDocument, oEditor, bDataLoss) {
			this._oCloseDefer = Q.defer();
			if (oDocument && oEditor) {
				var iIndex = this._getTabIndex(oDocument, oEditor);
				if (iIndex > -1) {
					var sTabId = this._getTabController().getTabIdByIndex(iIndex);
					this._getTabController().closeTab(sTabId, bDataLoss);
				} else {
					this._closeDocument(oDocument, true);
					this._oCloseDefer.resolve();
				}
			} else if (oDocument) {
				this._closeDocument(oDocument, true);
				this._oCloseDefer.resolve();
			} else {
				this._getTabController().closeTab();
				this._oCloseDefer.resolve();
			}
			this._oContextTab = null;
			return this._oCloseDefer.promise;
		},

		_closeDocument: function(oDocument, bWithDatalossPopup, aTabIndices) {
			var aTabs;
			if (aTabIndices && aTabIndices.length > 0) {
				aTabs = aTabIndices;
			} else {
				aTabs = this._getTabsOfDocument(oDocument, true);
			}
			this._getTabController().closeTabs(aTabs, bWithDatalossPopup);
		},

		/**
		 * Closes all opened documents
		 */
		closeAll: function() {
			this._isClosingAllTabs = true;
			this._getTabController().closeAll(true);
			this._oContextTab = null;
		},

		/**
		 * Closes all documents except the opened document
		 */
		closeOthers: function() {
			var oTabController = this._getTabController();
			if (oTabController.hasTabs()) {
				if (this._oContextTab) {
					oTabController.closeOthers(this._oContextTab, true);
				} else {
					var oSelectedTab = oTabController.getSelectedTab();
					oTabController.closeOthers(oSelectedTab, true);
				}
			}
			//			// important: in case command "Close Other" was not clicked on the active tab, the tab must be explicitely shown
			//			var iIndex = oTabController.getSelectedIndex();
			//			var oTab = this._getTab(iIndex);
			//			oTab.show(true).done();
			//
			this._oContextTab = null;

		},

		isClickedTabSelected: function() {
			if (!this._oContextTab) {
				return false;
			} else {
				var oTabController = this._getTabController();
				var oSelTab = oTabController.getSelectedTab();
				return oSelTab == this._oContextTab;
			}
		},

		/**
		 * Saves the current editor
		 */
		save: function() {
			var that = this;
			var oTab = this._getCurrentTab();
			return oTab.save().fail(function(oError) {
				return that.context.service.usernotification.alert(oError.message);
			});
		},

		/**
		 * Saves all opened and dirty documents
		 */
		saveAll: function() {
			var that = this;
			var aSavePromises = [];
			// save all documents
			var aDirtyDocuments = this.getDocuments(true);
			if (aDirtyDocuments && aDirtyDocuments.length > 0) {
				return this.context.service.usernotification.liteInfo(that.context.i18n.getText("content_saving"), false).fin(function() {
					for (var i = 0; i < aDirtyDocuments.length; i++) {
						var oSavePromise;
						if (that.getCurrentDocument() === aDirtyDocuments[i]) {
							oSavePromise = that._flushCurrentEditor().then(aDirtyDocuments[i].save());
						} else {
							oSavePromise = aDirtyDocuments[i].save();
						}
						aSavePromises.push(oSavePromise);
					}
					return Q.all(aSavePromises).then(function() {
						that.context.service.log.info("Content", "All changes have been saved in all open files", ["user"]).done();
						return that.context.service.usernotification.liteInfo(that.context.i18n.getText("content_allChangesSaved"), true);
					}).fail(function(oError) {
						return that.context.service.usernotification.liteInfo(that.context.i18n.getText("content_saveAllError"), true).fin(function() {
							throw oError;
						});
					});
				});
			} 
			return Q();
			
		},

		/**
		 * Undo the current edit session
		 */
		undo: function() {
			var oTab = this._getCurrentTab();
			oTab.undo();
		},

		/**
		 * Get whether there are undo operations left to perform for the current edit session
		 * @return {boolean} whether undo is available
		 */
		hasUndo: function() {
			var oTab = this._getCurrentTab();
			if (oTab) {
				return oTab.hasUndo();
			} else {
				return false;
			}
		},

		/**
		 * Redo the current edit session
		 */
		redo: function() {
			var oTab = this._getCurrentTab();
			oTab.redo();
		},

		/**
		 * Get whether there are redo operations left to perform for the current edit session
		 * @return {boolean} whether redo is available
		 */
		hasRedo: function() {
			var oTab = this._getCurrentTab();
			if (oTab) {
				return oTab.hasRedo();
			} else {
				return false;
			}
		},

		/**
		 * Get whether there are redo operations left to perform for the current edit session
		 * @return {boolean} whether redo is available
		 */
		go: function() {
			var oTab = this._getCurrentTab();
			if (oTab) {
				return oTab.hasRedo();
			} else {
				return false;
			}
		},

		isDirty: function() {
			for (var i = 0; i < this._aTabs.length; i++) {
				var oTab = this._getTab(i);
				var oDoc = oTab.getDocument();
				if (oDoc && oDoc.isDirty()) {
					return true;
				}
			}
			return false;
		},

		_getTabIndex: function(oDocument, oEditor) {
			for (var i = 0; i < this._aTabs.length; i++) {
				var oTab = this._getTab(i);
				if (oTab && oTab.isOwner(oDocument, oEditor)) {
					return i;
				}
			}
			return -1;
		},

		_compareExtDocs: function(oDoc1, oDoc2) {
			var ret = 0;
			if (oDoc1 && oDoc2 && oDoc1.getExtInfo() && oDoc2.getExtInfo()) {
				// compare the origin and index
				if (oDoc1.getExtInfo().origin == oDoc2.getExtInfo().origin && oDoc1.getExtInfo().index == oDoc2.getExtInfo().index) {
					ret = 1;
				}
			}
			return ret;
		},

		_getExtTabIndex: function(oDocument, oEditor) {
			for (var i = 0; i < this._aTabs.length; i++) {
				var oTab = this._getTab(i);
				var oDoc = this._getTab(i).getDocument();
				if (this._compareExtDocs(oDocument, oDoc) === 1 && oTab && oTab.isOwner(oDoc, oEditor)) {
					return i;
				}
			}
			return -1;
		},

		_getTabController: function() {
			return this._oView.getController();
		},

		_getTab: function(iTabIndex) {
			return this._aTabs[iTabIndex];
		},

		_getTabById: function(sTabId) {
			var oTab = null;
			for (var i = 0; i < this._aTabs.length; i++) {
				oTab = this._aTabs[i];
				if (oTab.sTabId == sTabId) {
					return oTab;
				}
			}
			return null;
		},

		_tabExists: function(oTab) {
			return this._aTabs.indexOf(oTab) !== -1;
		},

		_removeTab: function(iTabIndex) {
			var that = this;
			var oTab = this._getTab(iTabIndex);

			this._aTabs.splice(iTabIndex, 1);
			if (that._aTabs.length == 0) {
				that._oCurrentTab = null;
			}

			var oDocument = oTab.getDocument();
			//ensure there is not other opened tab which referenced to this document
			if (!this._getDocumentsMap()[oDocument.getEntity().getKeyString()]) {
				// In case document is dirty and is not open in other tabs - revert changes
				if (oDocument.isDirty()) {
					oDocument.revert(this.context.self).done();
				}
			}

			var oEditor = oTab.getEditor();
			return this.context.service.focus.detachFocus(oEditor).then(function() {
				// TODO: add documentService.close method which removes the file handler and unloads content, once no handler is available
				return oEditor.close(oTab.getDocument());
			}).then(function() {
				if (that._aTabs.length == 0) {
					return that.context.service.focus.setFocus(that.context.self);
				}
			}).then(function() { // close file session
				//TODO: change to reacting on editSession:close for document, as soon as we have this
				return Q.all([that.context.event.fireSelectionChanged(),
				              that.context.event.fireSelectionProviderChanged({
						selectionProvider: that.getSelectionProvider()
					})]);
			});
		},

		_onFinishedContentRendering: function(oEvt) {
			this.context.event.fireFinishedRendering().done();
		},

		_onTabSelect: function(oEvt) {
			var that = this;
			var bClicked = oEvt.getParameter("clicked");
			if (bClicked == true) {
				var iCurrentTabIndex = oEvt.getParameter("index");
				if (iCurrentTabIndex > -1) {
					this._oOpenQueue.next(function() {
						if (that._getTab(iCurrentTabIndex)) {
							var oTab = that._getTab(iCurrentTabIndex);
							// persist the current active tab
							var sEditor = oTab.getEditor()._sName;
							var sKeyString = oTab.getDocument().getKeyString();

							that.context.service.contentPersistence.setActiveTab({
								editor: sEditor,
								keyString: sKeyString
							}).done();

							return that._showTab(iCurrentTabIndex).then(function() {
								return that.context.event.fireTabSelected({
									indexSelected: iCurrentTabIndex
								});
							});
						} else {
							return Q();
						}
					}).done();
				}
			}
		},

		_onTabContextMenu: function(oEvt) {
			this._oContextTab = oEvt.getParameter("tab");
			this.context.event.fireSelectionChanged().done();
			var oEvent = oEvt.getParameter("mouseEvent");
			this.context.service.contextMenu.open(this._oContextMenuGroup, oEvent.pageX, oEvent.pageY).done();
		},

		_onTabSetPerspective: function(oEvt) {
			var that = this;

			this.context.service.perspective.getAreaForService(this.context.self).then(function(sPerspectiveArea) {
				return that.context.service.perspective.isAreaMaximized(sPerspectiveArea).then(function(bMaximized) {
					return that.context.service.perspective.setAreaMaximized(sPerspectiveArea, !bMaximized).then(function() {
						return that.context.event.fireTabDoubleClicked({
							maximized: !bMaximized
						});
					});
				});
			}).then(function() {
				return that.context.service.focus.setFocus(that.getCurrentEditor());
			}).done();

		},

		_onTabClose: function(oEvt) {
			var that = this;
			var iClosedTabIndex = oEvt.getParameter("closedIndex");
			var iCurrentTabIndex = oEvt.getParameter("currentIndex");
			var sClosedTabId = oEvt.getParameter("closedTabId");

			var oTab = this._getTab(iClosedTabIndex);
			var oDocument = oTab.getDocument();

			this.context.service.contentPersistence.remove({
				keyString: oDocument.getKeyString(),
				editor: oTab._oEditor._sName
			}).done();

			if (iCurrentTabIndex == -1) {
				this.context.service.perspective.getAreaForService(this.context.self).then(function(sPerspectiveArea) {
					return that.context.service.perspective.isAreaMaximized(sPerspectiveArea).then(function(bMaximized) {
						if (bMaximized) {
							return that.context.service.perspective.setAreaMaximized(sPerspectiveArea, !bMaximized).then(function() {});
						}
					});
				}).done();
			}

			if (iCurrentTabIndex > -1) {
				var oTab = this._getTab(iCurrentTabIndex);
				// var oDocument = oTab.getDocument();
			} else if (iCurrentTabIndex === -1) {
				this.context.service.contentPersistence.clear().done();
			}

			this._removeTab(iClosedTabIndex).then(function() {
				if (that._oCloseDefer) {
					that._oCloseDefer.resolve();
				}
				that.context.event.fireTabClosed({
					indexClosed: iClosedTabIndex,
					document: oDocument
				}).done();
			}).done();
		},

		_onTabSaveClose: function(oEvt) {
			var iClosedTabIndex = oEvt.getParameter("closedIndex");
			var sClosedTabId = oEvt.getParameter("closedTabId");
			var oTabController = this._getTabController();
			var oDocument = this._getTab(iClosedTabIndex).getDocument();

			oDocument.save().then(function() {
				oTabController.setDirty(iClosedTabIndex, oDocument.isDirty());
				oTabController.closeTab(sClosedTabId);
			}).done();
		},

		_flushCurrentEditor: function() {
			var oTab = this._getCurrentTab();
			if (oTab) {
				return oTab.flush();
			} else {
				return Q();
			}
		},

         // used by "Link Repository Browser with Editor" functionality
		_showTabWithoutSelection: function(iTabIndex, bShowTab) {
			var that = this;
			return this._oOpenQueue.next(function() {
				var oTab = that._getTab(iTabIndex);
				return oTab.show(true).then(function() {
					that._oCurrentTab = oTab;
					if (bShowTab) {
						return that._getTabController().showTab(iTabIndex);
					}
				}).fail(function(oError) {
					return that._handleTabOpeningError(oTab, oError);
				});
			});
		},

		_handleTabOpeningError: function(oTab, oError) {
			var oDocument = oTab.getDocument();
			var oEditor = oTab.getEditor();
			var sError = oError && oError.message || this.context.i18n.getText("i18n", "content_unexpectedEditorError");
			this.context.service.log.error("Content", sError, ["user"]).done();
			var sError = this.context.i18n.getText("i18n", "content_openFileError", [ oDocument.getEntity().getName(), sError ]);
			var that = this;
			return this.context.service.usernotification.alert(sError).then(function() {
				return that.close(oDocument, oEditor, false);
			});
		},

		/**
		 *
		 * @param iTabIndex
		 * @param bShowTab if true will display the corresponding tab into content, if false the tab was already selected and no need to select it again
		 * @returns
		 */
		_showTab: function(iTabIndex, bShowTab) {

			if (this._getTabController().getAllTabIndexes().length <= 0) {
				return Q();
			}

			var oldTab = this._tabExists(this._oCurrentTab) ? this._oCurrentTab : {
				flush: function() {
					return Q();
				}
			};

			var oTab = this._getTab(iTabIndex);
			if (!oTab) {
				return Q();
			}

			var oDocument = oTab.getDocument();

		
			var that = this;

			return oldTab.flush().then(function() {
				//TODO: cleanup: was needed to quickly fix csn:  0001310667 2014
				if (bShowTab && (oTab.getEditor()._sName == "ui5wysiwygeditor" || oTab.getEditor()._sName == "compare")) {
					that._getTabController().showTab(iTabIndex);
				}
				that.context.event.fireBeforeShow({
					document: oDocument,
					editor: oTab.getEditor()
				}).done();
				return oTab.show();
			}).then(function() {
				that._oCurrentTab = oTab;
				/* We need to make sure that editor is rendered before we call attachFocus().
                 In general applyChanges() should be avoided so we need to think about a better solution
                 to determine when the editor is rendered.
                 There are two cases where editor is rendered:
                 1. When added to container in content.controller:247 - happens only once.
                 2. Editor can re-render itself in editor.open() method, but we have no way to know about it.
                */
				sap.ui.getCore().applyChanges();
				//now the DOM element of the editor is rendered and the editor is ready
				//otherwise the editor.open promise resolved to early
				return Q.all([oTab.getEditor().getTitle(),
                             oTab.getEditor().getTooltip(),
                             that.context.service.focus.attachFocus(oTab.getEditor()),
						that.context.event.fireSelectionProviderChanged({
						selectionProvider: oTab.getEditor()
					})]).spread(function(sTitle, sTooltip) {
					that._getTabController().setTitle(iTabIndex, sTitle, sTooltip);
					if (bShowTab && (oTab.getEditor()._sName !== "ui5wysiwygeditor" || oTab.getEditor()._sName !== "compare")) {
						that._getTabController().showTab(iTabIndex);
					}
				});
			}).then(function() {
				//don't wait for the commands
				that.context.service.command.invalidateAll().done();
			}).fail(function(oError) {
				return that._handleTabOpeningError(oTab, oError);
			});
		},

		refresh: function(oEvent) {
			if (oEvent && oEvent.name === "deleted") {
				return;
			}
			
			var aDocs = this.getDocuments();
			var aPromises = [];

			jQuery.each(aDocs, function(iIndex, oDoc) {
				aPromises.push(oDoc.needToReloadCheck());
			});

			Q.all(aPromises).done();
		},

		getSelectionProvider: function() {
			if (this._tabExists(this._oCurrentTab)) {
				return this._oCurrentTab.getEditor();
			} else {
				return null;
			}
		},

		/**
		 *
		 * @param iTabIndex
		 * @returns
		 */
		refreshTab: function(iTabIndex) {
			return this._showTab(iTabIndex, true);
		},

		_getTabsOfDocument: function(oDocument, bIncludeContained, fnVisitor) {
			var aTabOfDocument = [];
			for (var i = 0; i < this._aTabs.length; i++) {
				var oTab = this._getTab(i);
				if (oTab && oTab.hasDocument(oDocument, bIncludeContained)) {
					aTabOfDocument.push(i);
					if (fnVisitor) {
						fnVisitor.call(this, oTab, i);
					}
				}
			}
			return aTabOfDocument;
		},

		onDocumentChanged: function(oEvent) {
			var oDocument = oEvent.params.document;
			var sChangeType = oEvent.params.changeType;
			var mOptions = oEvent.params.options;
			var aTabs, i, iTabIndex;
			if (sChangeType === "content" && mOptions) {
				var oSource = mOptions.source;
				if (oSource && oSource._sName === this.context.self._sName) {
					return;
				}

                var that = this;
                this._oOpenQueue.next(function() {
                    if (that._isCurrentDocument(oDocument)) {
                        return that._isCurrentEditor(oSource).then(function(bIsCurrentEditor) {
                            if (!bIsCurrentEditor) {
                                return that.getCurrentEditor().open(oDocument, true);
                            }
                            that._getTabController().setLastEditTabIndex();
                            return Q();
                        });
                   }
                   return Q();
                }).done();

			} else if (sChangeType === "renamed") {
				var oNewDoc = oEvent.params.newDocument;
				// In case file extension was changed, all tabs with this document will be closed
				if (oNewDoc.getEntity().getFileExtension() !== oDocument.getEntity().getFileExtension()) {
					this.close(oDocument).done();
					return;
				}
				aTabs = this._getTabsOfDocument(oDocument);
				for (i = 0; i < aTabs.length; i++) {
					iTabIndex = aTabs[i];
					var sTitle = oNewDoc.getTitle();
					var sTooltip = oNewDoc.getEntity().getFullPath();
					this._getTab(iTabIndex).setDocument(oNewDoc);
					this._getTabController().setTitle(iTabIndex, sTitle, sTooltip);
					// for active editor we need to close the old document and open the new one
					if (this._getTabController().getSelectedIndex() === iTabIndex) {
						this._getTab(iTabIndex).getEditor().close(oDocument).then(function() {
							 this._oOpenQueue.next(function() {
								return this._getTab(iTabIndex).getEditor().open(oNewDoc);	
							 });
						}.bind(this)).done();
					} else { 	// for non-active editors we just need to close the old document. the new one will be opened on tab select
						this._getTab(iTabIndex).getEditor().close(oDocument).done();
					}
				}
			}
		},
		
		onDocumentStateChanged: function(oEvent) {
			var oDocument = oEvent.params.document;
			var aTabs = this._getTabsOfDocument(oDocument);
			for (var i = 0; i < aTabs.length; i++) {
				var iTabIndex = aTabs[i];
				this._getTabController().setDirty(iTabIndex, oDocument.isDirty());
			}
			// Invalidate only if changed document is open in content
			if (aTabs.length > 0) {
				this.context.service.command.invalidateAll().done();
			}
		},

		setTabIcon: function(sType) {
			var oDocument = this.getCurrentDocument();
			var aTabs = this._getTabsOfDocument(oDocument);
			for (var i = 0; i < aTabs.length; i++) {
				var iTabIndex = aTabs[i];
				this._getTabController().setTabIcon(iTabIndex, sType);
			}
		},

		onDocumentDeleted: function(oEvent) {
			var oDocument = oEvent.params.document;
			this._closeDocument(oDocument, false);
		},

		onEditorUMStateChanged: function(oEvent) {
			this.context.service.command.invalidateAll().done();
		},

		onRDELoad: function() {
			var that = this;

			this.context.service.aceeditor.config.getUserSetting().then(function(oSettings) {
				if (oSettings.autoSave) {
					that.startAutoSave();
				}
			}).done();
		},

		stopAutoSave: function() {
			if (this._autoSaveInterval) {
				clearInterval(this._autoSaveInterval);
			}
		},

		startAutoSave: function() {
			var that = this;
			this._autoSaveInterval = setInterval(function() {
				if (that.isDirty()) {
					that.saveAll().fail(function(oError) {
						that.context.service.usernotification.alert(oError.message).done();
						that.stopAutoSave();
					}).done();	
				}
			}, 30000);
		},

		/*
		 * A navigate to last edit is enabled if there is a last edit tab
		 */
		hasNavigateToLastEdit: function() {
			return this._getTabController().hasNavigateToLastEdit();
		},

		/*
		 * A navigate back is enabled if there are at leaset 2 opened tabs and the current tab is not the first one
		 */
		hasNavigateBack: function() {
			return this._getTabController().hasNavigateBack();
		},

		/*
		 * A navigate forward is enabled if there are at least 2 opened tabs and the current tab is not the last one
		 */
		hasNavigateForward: function() {
			return this._getTabController().hasNavigateForward();
		},

		navigateToLastEdit: function() {
			var that = this;
			that._getTabController().navigateToLastEdit();
			return true;
		},

		navigateBack: function() {
			var that = this;
			that._getTabController().navigateBack();
			return true;
		},

		navigateForward: function() {
			this._getTabController().navigateForward();
			return true;
		}
	});

	return ContentRegistry;
});