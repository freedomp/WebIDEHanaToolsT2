(function() {
	"use strict";
	jQuery.sap.require("sap.watt.platform.plugin.content.navigation.Navigation");

	sap.ui.controller("sap.watt.platform.plugin.content.view.Content", {

		_EDITOR_AREA: ".wattEditorArea",
		_bIsMaximized: false,
		_mEditors: null,
		_oInitialRelocate: undefined,
		_oContext: null,
		_oContentServiceImpl: null,
		_aPromiseCloseQueue: [],
		_bFirstClosePromise: null,
		_oCloseTabQueue: new Q.sap.Queue(),
		_oNavigation: new Navigation(),

		onInit: function() {
			this._mEditors = {};
		},

		_openTabs: function(aTabs, oActiveTab) {
			var aPromises = [];
			var that = this;

			// important to pick up all documents in the in the correct order

			// lets put active tab at the end of the list, because to set the active tab
			// we just need to open the document once again
			//			if (oActiveTab) {
			//aTabs.push(oActiveTab);
			//			}

			if (!jQuery.isArray(aTabs)) {
				return Q();
			}

			jQuery.each(aTabs, function(index, value) {
				// get document
				var oPromise = that._oContext.service.document.getDocumentByKeyString(aTabs[index].keystring).then(function(oDocument) {
					if (!oDocument) {
						return Q();
					}
					return that._UpdateDocumentFromLocalStorage(oDocument).then(function() {
						return that._oContext.service.content.getEditorProvider();
					}).then(function(oEditorProvider) {
						// get editor for document
						return oEditorProvider.getSpecificEditor(oDocument, aTabs[index].editor);
					}).then(function(oEditor) {
						return [oDocument, oEditor];
					});
				}).fail(function(oError) {
					that._oContext.service.log.error("Content Persistence", "Could not restore tab since editor was not restorable.", ["system"]).done();
					return null;
				});
				aPromises.push(oPromise);
			});

			return Q.all(aPromises).then(function(aContentArray) {
				var aPromises = [];

				aContentArray = aContentArray.filter(function(aValue) {
					return aValue;
				});
				aContentArray.forEach(function(value, index, array) {
					if (value) {
						var oDocument = value[0];
						var oEditor = value[1];

						if (oEditor) {
							aPromises.push(oEditor.service.isRestorable().then(function(bRestorable) {
								// open using a specific editor
								return (bRestorable) ? that._oContext.service.content.open(oDocument, oEditor.service).thenResolve(value) : null;
							}).fail(function(oError) {
								that._oContext.service.log.error("Content Persistence", "Could not restore active tab since editor was not restorable.", [
									"system"]).done();
							}));
						}
					}
				});

				if (aPromises.length === 0) {
					return;
				}

				return Q.all(aPromises).then(function(aResult) {
					aResult = aResult.filter(function(aValue) {
						return aValue;
					});

					// If we should activate the last opened tab we're done as it is already selected
					if (!oActiveTab || (aResult[aResult.length - 1][0].getKeyString() === oActiveTab.keystring && aResult[aResult.length - 1][1].service
						._sName === oActiveTab.editor)) {
						return Q();
					}

					// Find the tab to activate within the restored entries, if not there it is not restorable
					var aToOpen;
					aResult.forEach(function(oValue) {
						if (oValue[0].getKeyString() === oActiveTab.keystring && oValue[1].service._sName === oActiveTab.editor) {
							aToOpen = oValue;
						}
					});
					if (!aToOpen) {
						return Q();
					}

					// the active Tab needs to be handled seperated, because of a focus
					// event which is necessary for the outline pane for the W5G

					// TODO - this is a workaround because of W5G outline pane
					// when setting the focus to the content area, getFocusElement returns
					// the editor, but W5G was already in focus, so no selectionChanged
					// event was thrown
					return that._oContext.self.getFocusElement().then(function(oView) {
						return that._oContext.service.focus.setFocus(oView).then(function() {
							return that._oContext.service.content.open(aToOpen[0], aToOpen[1].service);
						});
					});

				}).fail(function(oError) {
					that._oContext.service.log.error("Content Persistence", oError.message, ["system"]).done();
				});

			});
		},

		_UpdateDocumentFromLocalStorage: function(oDocument) {
            var that = this;
			return this._oContext.service.dirtyDocumentsStorage.getContent(oDocument).then(function(dirtyContent) {
				if (dirtyContent) {
					return oDocument.setContent(dirtyContent, that._oContext.self);
				}
			});
		},

		onAfterRendering: function() {

			var oEditorArea = jQuery(this._EDITOR_AREA);

			if (this._oInitialRelocate) {

				// relocate the different editor divs from the SAPUI5 static area to the content->editor area
				jQuery.each(this._oInitialRelocate, function(sKey, oEntry) {
					var oFrom = $("#" + oEntry);
					var oSelector = $(oEditorArea.selector);
					var oTo = $("#" + oSelector[0].id);

					oFrom.detach();
					oFrom.appendTo(oTo);
				});

				this.showTab(this.getSelectedIndex());
			}

			this._oInitialRelocate = undefined;

			this.fireEvent("finishedContentRendering");
		},

		loadSettings: function() {
			return this._oContext.service.contentPersistence.load();
		},

		setContext: function(oContentServiceImpl, oContext) {
			this._oContentServiceImpl = oContentServiceImpl;
			this._oContext = oContext;
		},

		_getInitialArea: function() {
			return jQuery("#" + this.createId("wattContentInitialArea"));
		},

		_getNavBar: function() {
			return this.byId("tabStripNavBar");
		},

		getSelectedIndex: function() {
			return this._getNavBar().getSelectedIndex();
		},

		getSelectedTab: function() {
			var sId = this._getNavBar().getSelectedItem();
			return sap.ui.getCore().byId(sId);
		},

		getAllTabIndexes: function() {
			return this._getNavBar().getAllTabIndexes();
		},

		setTitle: function(iIndex, sTitle, sTooltip) {
			this._getNavBar().setTitle(iIndex, sTitle, sTooltip);
		},

		setDirty: function(iIndex, bDirty) {
			this._getNavBar().setDirtyStateTab(iIndex, bDirty);
		},

		setTabIcon: function(iTabIndex, sType) {
			this._getNavBar().setTabIcon(iTabIndex, sType);
		},

		createTab: function(oTabSettings, bShowTab) {
			oTabSettings.editorClass = this._createNewEditorDivWhenNotThere(oTabSettings);

			var iNewIndex = this._getNavBar().createTab(oTabSettings, false);

			if (bShowTab) {
				this.showTab(iNewIndex);
			}
			return iNewIndex;
		},

		_createNewEditorDivWhenNotThere: function(oTabSettings) {

			var sClass = "wattEditor_" + oTabSettings.editorControl.getId();
			if (!this._mEditors[sClass] || jQuery("." + sClass).length === 0) {
				var sId = this.createId(sClass);

				var oEditorContainerDiv = jQuery("<div id='" + sId + "container' class='wattEditorContainer " + sClass + "container'></div>")
					.hide();
				var sHeaderId = sId + "_header";
				var sHeaderClass = sClass + "_header";
				//TODO: check if needed
				var oEditorHeaderDiv = this._createHeaderDiv(sHeaderId, sHeaderClass).hide();
				var oEditorDiv = jQuery("<div id='" + sId + "' class='wattEditor " + sClass + "'></div>");

				// this._EDITOR_AREA will not exist before the content control has been rendered.
				// Therefore it is necessary to place the new editor div into the SAPUI5 static area at first.
				// Later, when _EDITOR_AREA does exist (has been rendered) the editor divs will be relocated from the
				// static area to _EDITOR_AREA.
				sap.ui.getCore().getStaticAreaRef().appendChild(oEditorContainerDiv[0]);

				oEditorContainerDiv.append(oEditorHeaderDiv);
				oEditorContainerDiv.append(oEditorDiv);

				// There are two cases (this complex procedure shoul be changed):
				// 1. The EDITOR_AREA has already been rendered.
				// This happens when immediately after IDE startup no editor is open and afterwards the user opens a document by interaction.
				// Here the new container DIV is added to the static area and immediately is relocated to the EDITOR_AREA.
				//
				// 2. The EDITOR_AREA has not yet been rendered.
				// This happens while the IDE starts up and the ContentPreferenceService will open up a document
				// In that case the new container DIV is 'parked' into the static area and onAfterRendering (see above) it will be
				// relocated into the EDITOR_AREA.
				var oEditorArea = jQuery(this._EDITOR_AREA);
				oEditorArea.append(oEditorContainerDiv).hide().show();

				oTabSettings.editorControl.placeAt(oEditorDiv[0]);

				this._oInitialRelocate = this._oInitialRelocate || {};
				this._oInitialRelocate[sClass] = sId + "container";

				this._mEditors[sClass] = {
					div: oEditorContainerDiv,
					header: oEditorHeaderDiv,
					headerId: sHeaderId,
					headerClass: sHeaderClass,
					editorControl: oTabSettings.editorControl
				};
			}
			return sClass;
		},

		_createHeaderDiv: function(sId, sClass) {
			return jQuery("<div id='" + sId + "' class='wattEditorHeader " + sClass + "'></div>");
		},

		hasTabs: function() {
			return this._getNavBar().hasTabs();
		},

		showTab: function(iIndex, bTabClicked) {
			this._getNavBar().selectTab(iIndex, bTabClicked); //will trigger onTabSelected
		},

		//hide other editors, show selected editor div
		_toggleVisibility: function(sEditorClass, iIndex) {
			this._toggleInitialArea(iIndex);

			var oEditorToBeShown = this._mEditors[sEditorClass];

			this._toggleHeader(oEditorToBeShown, iIndex);

			this._toggleEditors(oEditorToBeShown);

		},
		_toggleInitialArea: function(iIndex) {
			if (iIndex === -1) {
				this._getInitialArea().show();
			} else {
				this._getInitialArea().hide();
			}
		},

		_toggleHeader: function(oEditorToBeShown, iIndex) {
			if (iIndex > -1) { // handle next tab
				var oTab = this._oContentServiceImpl._getTab(iIndex);
				var oDocument = oTab.getDocument();
				var oDecorator = oTab.getDecorator();
				var that = this;
				var oDeferred = Q.defer();
				if (oDecorator) {
					oDecorator.getHeader(oDocument).then(function(oAdditionalHeader) {
						if (oAdditionalHeader) {
							//have a fresh header div, as otherwise, UI5 remembers that is was placed here
							var oEmptyHeader = that._createHeaderDiv(oEditorToBeShown.headerId, oEditorToBeShown.headerClass);
							oEditorToBeShown.header.replaceWith(oEmptyHeader);
							oEditorToBeShown.header = oEmptyHeader;

							oAdditionalHeader.placeAt(oEditorToBeShown.header);
						} else {
							oEditorToBeShown.header.hide();
						}
						oDeferred.resolve();
					}).done();
				} else {
					oEditorToBeShown.header.hide();
					oDeferred.resolve();
				}
				oDeferred.promise.then(function() {
					that.fireEvent("tabHeaderHandled");
				}).done();
			}
		},

		_toggleEditors: function(oEditorToBeShown) {
			this.forEachEditor(function(oEditorData) {
				if (oEditorData === oEditorToBeShown) {
					oEditorData.div.show();
				} else {
					oEditorData.div.hide();
				}
			});
		},

		onTabSelected: function(oEvt) {
			var iIndex = oEvt.getParameter("index");
			var iTabId = oEvt.getParameter("TabId");
			var bClicked = oEvt.getParameter("clicked");
			var sEditorClass = oEvt.getParameter("editorClass");

			this._oNavigation.selectTab(iTabId);

			this._toggleVisibility(sEditorClass, iIndex);

			this.fireEvent("contentTabSelected", {
				index: iIndex,
				clicked: bClicked
			});
		},

		/**
		 * close a given tab
		 * @param {string} sTabId id of the tab to be closed, if not provided then the current selected tab will be closed
		 * @param {Boolean} bDataLoss optional, default to true, if true display a dialog asking to save, cancel or close without
		 * saving the tab, if false the tab will be closed without any data loss logic
		 */
		closeTab: function(sTabId, bDataLoss) {
			var that = this;

			return this._oCloseTabQueue.next(function() {

				var oNavBar = that._getNavBar();

				if (sTabId === undefined) {
					sTabId = oNavBar.getSelectedTabId();
				}

				var oTab = oNavBar.getTabById(sTabId);
				if ((bDataLoss === undefined || bDataLoss) && oTab.dirty) {
					if (!that._bFirstClosePromise) {
						that._bFirstClosePromise = true;
						return that._dataLossDialog(sTabId).then(function() {
							return that._handleClosePromisesQueue(that._aPromiseCloseQueue[0]);
						}, function() {
							return that._resetPromiseQueue();
						});
					} else {
						that._aPromiseCloseQueue.push(sTabId);
					}
				} else {
					return oNavBar.closeTab(sTabId); //will trigger onTabClose and if necessary onTabSelected
				}

			});
		},

		_handleClosePromisesQueue: function(sTabId) {
			var that = this;
			if (this._aPromiseCloseQueue.length == 0) {
				return this._resetPromiseQueue();
			}

			return this._dataLossDialog(sTabId).then(function() {
				that._aPromiseCloseQueue.splice(0, 1);
				return that._handleClosePromisesQueue(that._aPromiseCloseQueue[0]);
			}, function() {
				return that._resetPromiseQueue();
			});
		},

		_resetPromiseQueue: function() {
			this._bFirstClosePromise = false;
			this._aPromiseCloseQueue = [];
			return Q();
		},

		closeTabs: function(aIndexes, bDataLoss) {
			this._getNavBar().closeTabs(aIndexes, bDataLoss); //will trigger onTabClose and if necessary onTabSelected
		},

		closeOthers: function(oSelectedTab, bDataLoss) {
			this._getNavBar().closeOthers(oSelectedTab, bDataLoss); //will trigger onTabClose and if necessary onTabSelected
		},

		closeAll: function(bDataLoss) {
			this._getNavBar().closeAll(bDataLoss); //will trigger onTabClose and if necessary onTabSelected
		},

		getTabIdByIndex: function(iIndex) {
			return this._getNavBar().getTabIdByIndex(iIndex);
		},

		onTabClose: function(oEvt) {
			//	var iCurrentIndex = oEvt.getParameter("currentIndex");
			var iClosedIndex = oEvt.getParameter("closedIndex");
			var iClosedTabId = oEvt.getParameter("closedTabId");
			var iNextIndex = this._oNavigation.removeTabs(iClosedTabId, iClosedIndex);
			var iNextIndexReal = -1;

			if (iNextIndex > -1) {
				iNextIndexReal = this._getNavBar().getTabIndexById(this._oNavigation.getSelectedTabId());
			}

			this.fireEvent("tabClose", {
				closedIndex: iClosedIndex,
				currentIndex: iNextIndexReal, // next tab after close
				closedTabId: iClosedTabId
			});
			
			if (this._getNavBar().getSelectedTabId() === iClosedTabId) {
				this._getNavBar().selectTab(iNextIndexReal, true);	
			} else { // in case closed tab is not the active one - we don't want that tabSelect event will be raised
				this._getNavBar().selectTab(iNextIndexReal, false);	
			}
		},

		onBeforeTabClose: function(oEvt) {
			var sClosedTabId = oEvt.getParameter("closedTabId");
			return this.closeTab(sClosedTabId);
		},

		onTabContextMenu: function(oEvt) {
			this.fireEvent("tabContextMenu", {
				tab: oEvt.getParameter("tab"),
				mouseEvent: oEvt.getParameter("mouseEvent"),
				index: oEvt.getParameter("index"),
				clickedElement: oEvt.getParameter("clickedElement")
			});
		},

		onTabDoubleClicked: function(oEvt) {
			this.fireEvent("tabSetPerspective", {
				tab: oEvt.getParameter("tab"),
				index: oEvt.getParameter("index"),
				maximized: oEvt.getParameter("maximized")
			});
		},

		_dataLossDialog: function(sTabId) {
			var that = this;

			var oNavBar = this._getNavBar();
			var iTabIndex = oNavBar.getTabIndexById(sTabId);

			var sText = this._oContext.i18n.getText("i18n", "content_confirmSaveBeforeClose", [this._getNavBar().getTabTitle(iTabIndex)]);
			return this._oContext.service.usernotification.confirm(sText, true).then(function(oReturn) {
				//iTabIndex = oNavBar.getTabIndexById(sTabId);
				//var iNextSelectedTabIndex = oNavBar.getSelectedIndexAfterClose(iTabIndex);
				/*
                var iNextIndex = that._oNavigation.removeTabs(sTabId, iTabIndex);
                var iNextIndexReal = -1;
            
                if (iNextIndex > -1) {
                    iNextIndexReal = that._getNavBar().getTabIndexById(that._oNavigation.getSelectedTabId());
                }*/

				if (oReturn.sResult === "YES") {
					that.fireEvent("tabSaveClose", {
						closedIndex: iTabIndex,
						//	currentIndex : iNextIndexReal,
						closedTabId: sTabId
					});
				}
				if (oReturn.sResult === "NO") {
					//return that._getNavBar().closeTab(iClosedTabIndex);
					return that._getNavBar().closeTab(sTabId);
				}
				if (oReturn.sResult === "CANCEL") {
					var oDeferred = Q.defer();
					oDeferred.reject();
					return oDeferred.promise;
				}
			});
		},

		forEachEditor: function(fnHandler) {
			for (var sClass in this._mEditors) {
				fnHandler.call(this, this._mEditors[sClass]);
			}
		},

		onExit: function() {
			this.forEachEditor(function(oEditorData) {
				if (oEditorData.editorControl) {
					oEditorData.editorControl.destroy();
				}
			});
			this._mEditors = [];
		},

		navigateToLastEdit: function() {
			var iLastEditIndex = this._oNavigation.navigateToLastEdit();
			if (iLastEditIndex >= 0) {
				this.showTab(iLastEditIndex, true);
			}
		},

		navigateBack: function() {
			var iPrevIndex = this._oNavigation.navigateBack();
			if (iPrevIndex >= 0) {
				var iPrevIndexReal = this._getNavBar().getTabIndexById(this._oNavigation.getSelectedTabId());
				this.showTab(iPrevIndexReal, true);
			}
		},

		navigateForward: function() {
			var iNextIndex = this._oNavigation.navigateForward();
			if (iNextIndex >= 0) {
				var iNextIndexReal = this._getNavBar().getTabIndexById(this._oNavigation.getSelectedTabId());
				this.showTab(iNextIndexReal, true);
			}
		},

		hasNavigateToLastEdit: function() {
			return this._oNavigation.hasNavigateToLastEdit(this.getSelectedIndex());
		},

		hasNavigateBack: function() {
			return this._oNavigation.hasNavigateBack();
		},

		hasNavigateForward: function() {
			return this._oNavigation.hasNavigateForward();
		},

		setLastEditTabIndex: function() {
			this._oNavigation.setLastEditTabIndex(this.getSelectedIndex());
		}
	});
})();