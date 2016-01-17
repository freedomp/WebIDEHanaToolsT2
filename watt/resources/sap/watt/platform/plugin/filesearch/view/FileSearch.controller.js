jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
jQuery.sap.require("sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode");
var Range = ace.require("./range").Range;
var _;
sap.ui.controller("sap.watt.platform.plugin.filesearch.view.FileSearch", {
	/**
	 * @memberOf sap.watt.platform.plugin.filesearch.view.FileSearch
	 */

	_oHighlightRange: null,
	_oSearchService: null,
	_oContext: null,
	_oAceeditorService: null,
	_oDocumentService: null,
	_oBrowserService: null,
	_oInputFolder: null,
	_oSearchTerm: null,
	_oRGSearchScope: null,
	_oResultTree: null,
	//TODO
	_oReplaceTerm: null,
	_DEFAULT_LOG_LOCATION: "from_pane",

	onInit: function() {
		var that = this;
		require(["sap/watt/lib/lodash/lodash"], function(lodash) {
			_ = lodash;
		});

		this.bReplaceSearchTermInProcess = false;

		var oView = that.getView();
		this._oContext = oView.getViewData().context;

		this._oInputFolder = this.byId("SearchForm_TextFieldFolder");
		//TODO
		this._oSearchTerm = this.byId("SearchForm_Term");

		this._oRGSearchScope = this.byId("SearchForm_SearchScope");

		this._oResultTree = this.byId("SearchResultTree");

		//TODO
		this._oReplaceTerm = this.byId("ReplaceForm_Term");

		this._scrollPos = {
			left: 0,
			top: 0
		};

		var oData = {
			sReplaceWithValue: "",
			bInSearchMode: true,
			sSearchValue: "",
			sSearchBulletText: "",
			sComboFileTypesValue: this._oContext.i18n.getText("i18n", "fileSearch_default_file_types"),
			sTextFieldFolder: this._oContext.i18n.getText("i18n", "fileSearch_default_search_in"),
			bTabBtnReplacePressed: false,
			bTabBtnSearchPressed: true,
			iSearchInSelectedIndex: 0,
			bIsReplaceble: false,
			bHasSearchResults: false,
			bHasMoreResults: false,
			bHasPrevResults: false,
			bShowNoData: false
		};

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: oData
		});
		oModel.setSizeLimit(2000);

		oView.setModel(oModel);

		var oSearchResultModel = new sap.ui.model.json.JSONModel();

		oSearchResultModel.setData({
			oSearchResult: {}
		});

		this._oResultTree.setModel(oSearchResultModel);

		this._oResultTree.addEventDelegate({
			onAfterRendering: function(evt) {
				if (that._oResultTree.getNodes().length > 0) {
					that._oResultTree.getNodes()[0].setIsSelected(true);
				}
				that._setScrollPosition();
			}
		});

		this._oReplaceTerm.attachBrowserEvent("keypress", function(evt) {
			var keyCode = window.event ? evt.keyCode : evt.which;
			if (keyCode === 13 && oModel.getProperty("/modelData/sSearchValue") !== "") {
				that.onUpdateList();
			}
		});

		this._oContext.i18n.applyTo(oView);

		this._sFolderWithSpaces = this._formatTextWithSpaces(14, this._oContext.i18n.getText("i18n", "fileSearch_SearchIn"));
		this._sFileTypesWithSpaces = this._formatTextWithSpaces(14, this._oContext.i18n.getText("i18n", "fileSearch_filetypes"));
		this._sResults = this._formatTextWithSpaces(14, this._oContext.i18n.getText("i18n", "fileSearch_results"));

		//Must be after fill values from i18n
		oView.bindElement("/modelData");

		this._oResultTree.bindElement("/oSearchResult");

		this._oResultTree.bindAggregation("nodes", {
			path: "/oSearchResult/aList",
			template: new sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode({
				text: "{sText}",
				tooltip: {
					parts: ["sFullPath", "cols", "rows", "sPreview"],
					formatter: function(sTooltip, iCols, iRows, sPreview) {
						var oParent = this.getParent();
						// Create a tooltip for file content line
						if (oParent instanceof sap.watt.platform.plugin.filesearch.view.SearchResultTreeNode) {
							var oTextArea = new sap.ui.commons.TextArea({
								cols: iCols,
								rows: iRows,
								enabled: false,
								valueState: sap.ui.core.ValueState.None
							});
							// walkaround for complex binding syntax
							oTextArea.setValue(sPreview);
							var oCallout = new sap.ui.commons.Callout({
								content: oTextArea,
								openDelay: 1000,
								openDuration: 0
							});
							oCallout.addStyleClass("searchResultTooltip");
							return oCallout;
						}
						// Create a tooltip for file
						else if (sTooltip) {
							return sTooltip;
						}

						return "";
					}
				},
				expanded: {
					path: "/modelData/oSearchResult/bContentSearch",
					formatter: function(bInContent) {
						return bInContent;
					}
				},
				buttonTooltip: "{sReplace}",
				lineNo: {
					path: "nLine",
					formatter: function(iLine) {
						return iLine ? (iLine + 1) + " " : "";
					}
				},
				occurrenceRange: {
					parts: ["nLine", "iIndex"],
					formatter: function(nLine, nStart) {
						if (nLine && nStart) {
							var sTerm = oModel.getProperty("/modelData/sSearchValue");
							return new Range(nLine, nStart, nLine, nStart + sTerm.length);
						}
					}
				},
				matches: "{iMathes}",
				toggleOpenState: [that.onToggleOpenState, that]
			}),
			parameters: {
				arrayNames: ["aList", "items"]
			}
		});
	},

	onAfterRendering: function() {
		this._oSearchTerm.focus();
	},

	setServices: function(services) {
		this._oSearchService = services.filesearch;
		this._oDocumentService = services.document;
		this._oBrowserService = services.repositorybrowser;
	},

	_setScrollPosition: function() {
		var TreeContEl = this._oResultTree.getDomRef().querySelector(".sapUiTreeCont");
		if (TreeContEl) {
			TreeContEl.scrollLeft = this._scrollPos.left;
			TreeContEl.scrollTop = this._scrollPos.top;
		}
	},
	_saveScrollPosition: function() {
		var TreeContEl = this._oResultTree.getDomRef().querySelector(".sapUiTreeCont");
		if (TreeContEl) {
			this._scrollPos.left = TreeContEl.scrollLeft;
			this._scrollPos.top = TreeContEl.scrollTop;
		}
	},
	/** open the selected file document to display the file in the editor
	 * @param oFileDocument
	 */
	_openDocument: function(oFileDocument) {
		var that = this;
		var sFileNotExist = this._oContext.i18n.getText("i18n", "fileSearch_filenotexist");
		if (this._oAceeditorService) {
			this._oAceeditorService.getCurrentFilePath().then(function(sPath) {
				if (sPath !== oFileDocument.getEntity().getFullPath()) {
					oFileDocument.exists().then(function(bExist) {
						if (bExist) {
							that._oDocumentService.open(oFileDocument).done();
							that._oBrowserService.setSelection(oFileDocument, true).done();
						} else {
							sap.ui.commons.MessageBox.alert(sFileNotExist);
						}
					}).done();
				} else {
					that._oAceeditorService.getUI5Editor().then(function(oEditor) {
						that.highlightTerm(oEditor);
					}).done();
				}
			}).done();
		} else {
			oFileDocument.exists().then(function(bExist) {
				if (bExist) {
					that._oDocumentService.open(oFileDocument).done();
					that._oBrowserService.setSelection(oFileDocument, true).done();
				} else {
					sap.ui.commons.MessageBox.alert(sFileNotExist);
				}
			}).done();
		}
	},

	clearResults: function() {
		var oModel = this.getView().getModel();
		oModel.setProperty("/modelData/bIsReplaceble", false);
		this._oResultTree.getModel().setProperty("/oSearchResult", {});
		oModel.setProperty("/modelData/bHasSearchResults", false);
		oModel.setProperty("/modelData/bHasMoreResults", false);
		oModel.setProperty("/modelData/bHasPrevResults", false);
		oModel.setProperty("/modelData/sSearchBulletText", "");
		oModel.setProperty("/modelData/bShowNoData", false);

	},

	/** initialize the Result, set title
	 * if no parameter, then clear the tree
	 */
	initializeResult: function(numFound, startIdx, endIdx, sTerm) {
		var oModel = this.getView().getModel();

		var sReplaceWith = oModel.getProperty("/modelData/sReplaceWithValue");

		// 300+ handling
		// Orion 8 returns 300 exactly , so if 300 then add +
		// Known issue: if Orion 5 will return 300 exactly, we will display 300+...
		var dispNumresults = numFound;
		if (dispNumresults === 300) {
			dispNumresults = "300+";
		}

		var n = numFound;
		oModel.setProperty("/modelData/sSearchBulletText", startIdx + " - " + endIdx + " (" + dispNumresults + " " + this._sResults.trim() + ")");

		oModel.setProperty("/modelData/bHasSearchResults", numFound > 0);

		oModel.setProperty("/modelData/bHasMoreResults", endIdx < numFound);
		oModel.setProperty("/modelData/bHasPrevResults", startIdx !== 1);

		if (n === 0) {
			oModel.setProperty("/modelData/bShowNoData", true);
		}

		this._oResultTree.setTerm(sTerm);
		if (n > 0 && sReplaceWith.length > 0) {
			oModel.setProperty("/modelData/bIsReplaceble", true);
		}
	},
	/** Highlight the searching term in the editor
	 * @param oEditor the editor control
	 */
	highlightTerm: function(oEditor) {
		var oSelection = oEditor.getSelection();
		if (this._oHighlightRange && oSelection) {
			oSelection.setSelectionRange(this._oHighlightRange);
			if (oEditor.oEditor && this._oHighlightRange.start) {
				// attempt to scroll to middle
				var nLine = parseInt(this._oHighlightRange.start.row);
				oEditor.oEditor.scrollToLine(nLine, true, true, null);
			}
			this._oHighlightRange = null;
		}
	},
	/** Adjusts the Find File UI depending whether it is file name or content search
	 * @param sCurrentFolder the folder name in which the search should be performed (if null, the search is done in the complete workspace)
	 */
	setCurrentFolder: function(oDocument) {
		var oModel = this.getView().getModel();
		var sCurrentFolder = null;
		var sCurrentProject = "/";
		if (!oDocument.getType) {
			return;
		}
		if (oDocument.getType() === "folder") {
			sCurrentFolder = oDocument.getEntity().getFullPath();
		} else {
			sCurrentFolder = oDocument.getEntity().getParentPath();
		}
		if (sCurrentFolder) {
			var sTmp = sCurrentFolder.split("/")[1];
			if (sTmp !== "") {
				sCurrentProject += sTmp + "/";
			}
			if (sCurrentFolder.indexOf("/", sCurrentFolder.length - 1) === -1) {
				// add at the end if necessary
				sCurrentFolder = sCurrentFolder + "/";
			}
			this._oRGSearchScope.getItems()[1].setKey(sCurrentProject);
			this._oRGSearchScope.getItems()[1].setTooltip(sCurrentProject);
			this._oRGSearchScope.getItems()[2].setKey(sCurrentFolder);
			this._oRGSearchScope.getItems()[2].setTooltip(sCurrentFolder);

			if (this._oRGSearchScope.getSelectedIndex() === 2) {
				oModel.setProperty("/modelData/sTextFieldFolder", sCurrentFolder);
			} else if (this._oRGSearchScope.getSelectedIndex() === 1) {
				oModel.setProperty("/modelData/sTextFieldFolder", sCurrentProject);
			}
		}
	},

	/** Updates the search result list
	 */
	onUpdateList: function() {
		var oModel = this.getView().getModel();
		var iSearchInSelectedIndex = oModel.getProperty("/modelData/iSearchInSelectedIndex");
		var bContentSearch = 0 == parseInt(iSearchInSelectedIndex);
		var bInSearchMode = oModel.getProperty("/modelData/bInSearchMode");
		if (!bInSearchMode) {
			bContentSearch = true;
		}
		var oUsagemonitoringService = this._oContext.service.usagemonitoring;
		oUsagemonitoringService.startPerf("search_advance", bContentSearch ? "content_search" : "file_search").done();
		var that = this;
		var sSearchTerm = oModel.getProperty("/modelData/sSearchValue");
		var sFolderName = oModel.getProperty("/modelData/sTextFieldFolder");
		if (sFolderName === this._oContext.i18n.getText("i18n", "fileSearch_default_search_in")) {
			sFolderName = "/";
		}

		var sFileType = oModel.getProperty("/modelData/sComboFileTypesValue");
		if (sFileType === this._oContext.i18n.getText("i18n", "fileSearch_default_file_types")) {
			sFileType = "*";
		}


		sSearchTerm = oModel.getProperty("/modelData/sSearchValue");
		if (!sSearchTerm.length > 0) {
			return;
		}

		oModel.setProperty("/modelData/bContentSearch", bContentSearch);

		this.clearResults();
		this._oSearchService.search({
			"sSearchTerm": sSearchTerm,
			"sFolderName": sFolderName,
			"sFileType": sFileType,
			"nStart": 0,
			"bContentSearch": bContentSearch
		}).then(function(oResult) {
			that._oResultTree.getModel().setProperty("/oSearchResult", oResult);
			that.initializeResult(oResult.numFound, oResult.startindex, oResult.endindex, oResult.sSearchTerm);
			oUsagemonitoringService.report("search_advance", bContentSearch ? "content_search" : "file_search", oResult.numFound).done();
			oUsagemonitoringService.report("search_advance", sFolderName === "/" ? "all_folders" : "specific_folders", that._DEFAULT_LOG_LOCATION).done();
			oUsagemonitoringService.report("search_advance", sFileType === "*" ? "all_filetypes" : "specific_filetypes", that._DEFAULT_LOG_LOCATION).done();
		}).done();
	},

	onUpdateScope: function(oEvent) {
		var oModel = this.getView().getModel();
		var oSource = oEvent.getSource();
		var sText = "";
		if (oSource === this._oRGSearchScope && oSource.getSelectedItem()) {
			sText = oSource.getSelectedItem().getKey();
		} else if (oSource === this._oInputFolder) {
			sText = oSource.getValue();
		}
		oModel.setProperty("/modelData/sTextFieldFolder", sText);
	},

	onLoadMore: function() {
		var oUsagemonitoringService = this._oContext.service.usagemonitoring;
		oUsagemonitoringService.startPerf("search_advance", "search_next").done();
		var that = this;
		this._oSearchService.search().then(function(oResult) {
			that._oResultTree.getModel().setProperty("/oSearchResult", oResult);
			that.initializeResult(oResult.numFound, oResult.startindex, oResult.endindex, oResult.sSearchTerm);
			oUsagemonitoringService.report("search_advance", "search_next", oResult.numFound).done();
		}).done();
	},

	onLoadPrev: function() {
		var that = this;
		this._oSearchService.previous().then(function(oResult) {
			that._oResultTree.getModel().setProperty("/oSearchResult", oResult);
			that.initializeResult(oResult.numFound, oResult.startindex, oResult.endindex, oResult.sSearchTerm);
		}).done();
	},

	onToggleOpenState: function(event) {
		if (!event.getParameter("postAdd")) {
			this._saveScrollPosition();
		}
	},

	onNodeSelected: function(oEvent) {
		var selectedNode = oEvent.getParameter("node");
		if (selectedNode !== null && selectedNode.getParent() !== null) {
			this._oHighlightRange = selectedNode.getOccurrenceRange();
			this._openDocument(this._getFileDocument(selectedNode));
		}
	},

	_getFileDocument: function(selectedNode) {
		var oFile = this._oResultTree.getModel().getProperty(selectedNode.getBindingContext().getPath());
		var oFileDocument = oFile.oFileDocument;
		if (!oFile.oFileDocument) {
			oFile = this._oResultTree.getModel().getProperty(selectedNode.getParent().getBindingContext().getPath());
			oFileDocument = oFile.oFileDocument;
		}
		return oFileDocument;
	},

	onNodeButtonClicked: function(oEvent) {
		var that = this;
		var oModel = this.getView().getModel();
		var oNode = oEvent.getParameter("oNode");
		var sReplaceWith = oModel.getProperty("/modelData/sReplaceWithValue");
		//var sReplaceTerm = oModel.getProperty("/modelData/sSearchValue");
		if (oNode === undefined) {
			oNode = this._oResultTree.getSelection();
		}

		if (sReplaceWith && sReplaceWith.length > 0 && oNode && oNode.getParent() && !oNode.hasChildren()) {
			var oDocument = this._getFileDocument(oNode);
			var oNodeContext = that._oResultTree.getModel().getProperty(oNode.getBindingContext().getPath());
			var oParent = oNode.getParent();
			var nIndex = oNodeContext.nStart;
			//var nLineNo = parseInt(oNode.getLineNo());
			that.bReplaceSearchTermInProcess = true;
			this._oSearchService.replace(oDocument, sReplaceWith, nIndex).then(function() {

				var sParentPath = oParent.getBindingContext().getPath();

				var oParentRes = that._oResultTree.getModel().getProperty(sParentPath);

				if (oParentRes.items === undefined || (oParentRes.items !== undefined && oParentRes.items.length === 0)) {
					var aResFoundList = that._oResultTree.getModel().getProperty("/oSearchResult/aList");
					_.remove(aResFoundList, function(item) {
						return item === oParentRes;
					});
					that._oResultTree.getModel().setProperty("/oSearchResult/aList", aResFoundList);
				} else {
					_.remove(oParentRes.items, function(item) {
						return item === oNodeContext;
					});
					that._oResultTree.getModel().setProperty(sParentPath + "/iMathes", oParentRes.items.length);
					that._oResultTree.getModel().setProperty(sParentPath + "/items", oParentRes.items);
				}
			}).fin(function() {
				that.bReplaceSearchTermInProcess = false;
			}).done();
		}
	},

	onSelectSearch: function() {
		this._initSelectionOption(true);
		this._oSearchTerm.focus();
	},

	onSelectReplace: function() {
		this._initSelectionOption(false);
		this._oReplaceTerm.focus();
	},

	_initSelectionOption: function(bIsSearch) {
		var oModel = this.getView().getModel();

		oModel.setProperty("/modelData/bTabBtnReplacePressed", !bIsSearch);
		oModel.setProperty("/modelData/bTabBtnSearchPressed", bIsSearch);
		oModel.setProperty("/modelData/bInSearchMode", bIsSearch);

		if (bIsSearch) {
			this._oResultTree.removeStyleClass("replaceTree");
		} else {
			this._oResultTree.addStyleClass("replaceTree");
		}
	},

	onReplaceWithChanged: function(oEvent) {
		var oModel = this.getView().getModel();
		var sValue = oEvent.getParameter("liveValue");
		var aSearchList = this._oResultTree.getModel().getProperty("/oSearchResult/aList");
		if (!aSearchList) {
			oModel.setProperty("/modelData/bIsReplaceble", false);
		} else {
			oModel.setProperty("/modelData/bIsReplaceble", sValue !== undefined && sValue.length > 0 && aSearchList.length > 0);
		}
	},

	onReplaceAll: function() {
		var that = this;
		var oModel = this.getView().getModel();
		var sConfirmText = this._oContext.i18n.getText("i18n", "fileSearch_replaceAll_confirm");
		var sReplaceAll = this._oContext.i18n.getText("i18n", "fileSearch_replaceAll");
		var sReplaceWith = oModel.getProperty("/modelData/sReplaceWithValue");
		if (sReplaceWith && sReplaceWith.length > 0) {
			sap.ui.commons.MessageBox.confirm(sConfirmText, function(bConfirmed) {
				if (bConfirmed) {
					that._oSearchService.replaceAll(sReplaceWith).done();
				}
			}, sReplaceAll);
		}
	},

	inReplaceMode: function(bValue) {
		return !bValue;
	},

	getFileTypesSearchTitle: function(sType) {
		return this._sFileTypesWithSpaces + sType;
	},

	getFolderSectionSearchTitle: function(sType) {
		return this._sFolderWithSpaces + sType;
	},

	_formatTextWithSpaces: function(iLength, sText) {
		var iSpaces = iLength - sText.length;
		for (var i = 0; i < iSpaces; i++) {
			sText = sText + " ";
		}
		return sText;
	}
});