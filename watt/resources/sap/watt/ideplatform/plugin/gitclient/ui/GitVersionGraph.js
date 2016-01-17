jQuery.sap.require("sap.watt.ideplatform.plugin.gitclient.lib.gitgraph");

sap.ui.core.Control.extend("sap.watt.ideplatform.plugin.gitclient.ui.GitVersionGraph", {
	metadata: {
		properties: {
			"commitsTree": {
				type: "object[]"
			},

			"path": {
				type: "string"
			},
			"width": {
				type: "sap.ui.core.CSSSize",
				defaultValue: "100%"
			},
			"height": {
				type: "sap.ui.core.CSSSize",
				defaultValue: "100%"
			}
		},

		events: {
			select: {},
			searchCount: {
				"sCount": {
					type: "string"
				}
			}
		},

		aggregations: {
			"columns": {
				type: "sap.ui.table.Column",
				multiple: true,
				visibility: "public"
			},
			"_table": {
				type: "sap.ui.table.Table",
				multiple: false,
				visibility: "hidden"
			}
		}
	},

	_DEFAULT_ROW_HEIGHT: 35,

	_mNextStepActionEnum: {
		Prev: 0,
		Next: 1
	},

	_mControlMode: {
		Default: 0,
		Search: 1
	},

	init: function() {
		var oControl = this;
		this._sSearchParam = "";
		this._currentMode = this._mControlMode.Default;
		oControl.setAggregation("_table", new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.Single,
			columnHeaderVisible: false,
			rowHeight: this._DEFAULT_ROW_HEIGHT,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
			rowSelectionChange: [oControl._rowSelectionChanged, oControl],
			width: "100%",
			showNoData: false
		}).addStyleClass("sapIDEGraphTableRow sapIDEGraphTable"));

		this._aSearchedIndexes = [];
		this._lastSelectedSearch = -1;
		jQuery(window).resize(function() {
			if (window.GitVersionGraph.getDomRef()) {
				window.GitVersionGraph._createGitGraph();
			}
		});

		window.GitVersionGraph = oControl;
	},

	renderer: function(oRm, oControl) {
		oRm.write("<div class='sapIDEGrid'");
		oRm.writeControlData(oControl);

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			oRm.writeAttribute("role", "tablist");
		}

		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		oRm.write("<canvas id='gitGraph' class='sapIDEGraphDiv'></canvas>");

		var oTable = oControl.getAggregation("_table");
		oTable.setVisible(oControl.getCommitsTree().length > 0);
		oTable.setVisibleRowCount(oControl.getCommitsTree().length);
		oTable.clearSelection();
		oRm.renderControl(oTable);

		oRm.write("</div>");
	},

	onAfterRendering: function() {
		this._createGitGraph();
		var oTable = this.getAggregation("_table");
		//mark rows according to search creteria
		if (!!this._sSearchParam && this._currentMode === this._mControlMode.Search) {
			this.searchGitLog(this._sSearchParam);
		}
		if (oTable.getRows().length > 0) {
		    if ( this.index === undefined ){
		        this.index = 0;
		    }
		    oTable.setSelectedIndex(this.index);
		}
		this._sSearchParam = "";
	},

	getSelected: function() {
		var oTable = this.getAggregation("_table");
		if (oTable.getSelectedIndex() !== -1) {
			return oTable.getRows()[oTable.getSelectedIndex()];
		}
		return null;
	},

    setSelectedIndex: function(index) {
        this.index = index;
	},
	
	searchGitLog: function(sSearchParam) {
		var oControl = this;
		var oTable = this.getAggregation("_table");
		var sCount = "";
		
		if (oTable.getDomRef()) {
			this._cleanPreviousSearch();
			if (sSearchParam) {
			    this._currentMode = this._mControlMode.Search;
				var aCommits = oControl.getCommitsTree();
				if (aCommits && aCommits.length > 0) {
					var length = aCommits.length;
					for (var i = 0; i < length; i++) {
						var oCommit = aCommits[i];
						var sSearchParamLC = sSearchParam.toLowerCase();
						//Search in each commit for commit text author mail and commit-id
						if (oCommit.Message.toLowerCase().indexOf(sSearchParamLC) !== -1 ||
							oCommit.AuthorName.toLowerCase().indexOf(sSearchParamLC) !== -1 ||
							oCommit.AuthorEmail.toLowerCase().indexOf(sSearchParamLC) !== -1 ||
							oCommit.Name.toLowerCase().indexOf(sSearchParamLC) !== -1) {
							oControl._aSearchedIndexes.push(i);
						}
					}
					if (oControl._aSearchedIndexes.length > 0) {
						sCount = "1 " + "/ " + oControl._aSearchedIndexes.length;
					}
				}
				this.fireSearchCount({
					sCount: sCount
				});
			}

			//Update the css for select if search param has input
			oControl._updateTableRowsStyle(!!sSearchParam);
			oControl._updateSearchSelection(!!sSearchParam);
		} else {
			this._sSearchParam = sSearchParam;
		}
	},

	nextSearch: function() {
		if (this._aSearchedIndexes.length > 0) {
			if (this._lastSelectedSearch + 1 < this._aSearchedIndexes.length) {
				this._changeSelectedSearchItem(this._mNextStepActionEnum.Next);
			}
		}
	},

	prevSearch: function() {
		if (this._aSearchedIndexes.length > 0 && this._lastSelectedSearch !== -1) {
			if (this._lastSelectedSearch - 1 > -1) {
				this._changeSelectedSearchItem(this._mNextStepActionEnum.Prev);
			}
		}
	},

	_changeSelectedSearchItem: function(iAction) {
		var oTable = this.getAggregation("_table");
		var oRow = null;
		if (this._lastSelectedSearch !== -1) {
			oRow = oTable.getRows()[this._aSearchedIndexes[this._lastSelectedSearch]];
			if (oRow && oRow.getDomRef()) {
				jQuery(oRow.getDomRef()).addClass("sapIDETableRowSearch");
			}
		}

		if (iAction === this._mNextStepActionEnum.Prev) {
			this._lastSelectedSearch--;
		} else {
			this._lastSelectedSearch++;
		}

		this.fireSearchCount({
			sCount: (this._lastSelectedSearch + 1) + " / " + this._aSearchedIndexes.length
		});

		oRow = oTable.getRows()[this._aSearchedIndexes[this._lastSelectedSearch]];
		if (oRow) {
			this.fireSelect({
				selected: oRow.getBindingContext()
			});
			oTable.setSelectedIndex(this._aSearchedIndexes[this._lastSelectedSearch]);
			this._scrollIntoView(oRow);
		}
	},

	_getRuntimeTableRowHeight: function() {
		var oTable = this.getAggregation("_table");
		var oTableDom = oTable.getDomRef();
		if (oTableDom) {
			var aRows = jQuery(oTableDom).find(".sapUiTableRowEven");
			if (aRows.length > 0) {
				var iHeight = oTable.getRows().length * aRows[0].offsetHeight;
				iHeight = oTableDom.offsetHeight < iHeight ? oTableDom.offsetHeight : iHeight;
				return iHeight / oTable.getRows().length;
			}
		}
		return this._DEFAULT_ROW_HEIGHT;
	},

	_cleanPreviousSearch: function() {
		var oTable = this.getAggregation("_table");
		oTable.clearSelection(); // clean table selection on search input

		//remove all added css classes if exist
		this._updateTableRowsStyle(false);
		this.fireSearchCount({
			sCount: ""
		});
		this._currentMode = this._mControlMode.Default;
	},

	_updateTableRowsStyle: function(isSelect) {
		var iSearchLength = this._aSearchedIndexes.length;
		var oTable = this.getAggregation("_table");
		var oTableRows = oTable.getRows();
		var oRow = null;
		for (var k = 0; k < iSearchLength; k++) {
			oRow = oTableRows[this._aSearchedIndexes[k]];
			if (oRow && oRow.getDomRef()) {
				if (isSelect) {
					jQuery(oRow.getDomRef()).addClass("sapIDETableRowSearch");
				} else {
					jQuery(oRow.getDomRef()).removeClass("sapIDETableRowSearch");
				}
			}
		}

		if (!isSelect) {
			this._aSearchedIndexes = [];
			this._lastSelectedSearch = -1;
		}

	},

	_updateSearchSelection: function(isSelect) {
		var iSearchLength = this._aSearchedIndexes.length;
		var oTable = this.getAggregation("_table");
		var oTableRows = oTable.getRows();
		var oRow = null;
		if (iSearchLength > 0) {
			oTable.setSelectedIndex(this._aSearchedIndexes[0]);
			//Goto the first row found in the search
			oRow = oTableRows[this._aSearchedIndexes[0]];
			//only if row is already in the DOM set focus to row
			this._scrollIntoView(oRow);
			this._lastSelectedSearch = 0;
		} else if (!isSelect) {
			//move to first row and select it
			oRow = oTableRows[0];
			//only if row is already in the DOM set focus to row
			this._scrollIntoView(oRow);
			oTable.setSelectedIndex(0);
		}
	},

	_scrollIntoView: function(oRow) {
		if (oRow && oRow.getDomRef()) {
			if (oRow.getDomRef().scrollIntoViewIfNeeded) {
				oRow.getDomRef().scrollIntoViewIfNeeded();
			} else {
				if (!sap.ui.Device.browser.firefox) {
					oRow.getDomRef().scrollIntoView();
				}
			}
		}
	},

	_rowSelectionChanged: function(oRowSelectionChanged) {
		var oTable = this.getAggregation("_table");
		var bSelected = oTable.isIndexSelected(oRowSelectionChanged.getParameter("rowIndex"));
		if (!bSelected) {
			// Cancel deselection
			oTable.setSelectedIndex(oRowSelectionChanged.getParameter("rowIndex"));
		} else {
			if ( this._currentMode === this._mControlMode.Search && oRowSelectionChanged.getParameter("rowIndex") === -1) {
			     this.index = 0;
				this.fireSelect({
					selected: null
				});
			} else {
			    this.index = oRowSelectionChanged.getParameter("rowIndex");
				this.fireSelect({
					selected: oRowSelectionChanged.getParameter("rowContext")
				});
			}
			if (this._aSearchedIndexes.length > 0) {
				for (var i = 0; i < this._aSearchedIndexes.length; i++) {
					if (this._aSearchedIndexes[i] === oRowSelectionChanged.getParameter("rowIndex")) {
						this._lastSelectedSearch = i;
						break;
					}
				}
			}
		}
	},

	_selectGitGraph: function(event) {
		var oTable = this.getAggregation("_table");
		var selected = oTable.isIndexSelected(event.data.index);
		if (!selected) {
			oTable.setSelectedIndex(event.data.index);
		}
	},

	_createGitGraph: function() {
		var oControl = this;
		var template = new Template({
			selectevent: true,
			colors: ["#004990", "#007cc0", "#f27020", "#e52929", "#f0ab00", "#007cc0", "#005b8d", "#008a11"],
			branch: {
				mergeStyle: "bezier", // "straight"
				lineWidth: 1,
				spacingX: 15
			},
			commit: {
				spacingY: oControl._getRuntimeTableRowHeight(),
				dot: {
					size: 5,
					dotStrokeWidth: 4
				},
				message: {
					display: false,
					hidehovermessage: true,
					font: "0.75rem Arial, sans-serif",
					messageFormat: "{0}{1} - {2}"
				}
			}
		});

		var oGitGraph = new GitGraph({
			template: template
		});

		if (template.selectevent) {
			oGitGraph.canvas.addEventListener("commit:mousedown", function(event) {
				oControl._selectGitGraph(event);
			});
		}

		var aCommits = oControl.getCommitsTree();

		if (aCommits && aCommits.length > 0) {
			var length = aCommits.length;
			for (var i = length - 1; i >= 0; i--) {
				var oCommit = aCommits[i];
				oCommit.iCreatedChildren = 0;

				var commitConfig = {
					index: i,
					messageDisplay: false,
					dotColor: "white",
					dotSize: 6,
					dotStrokeWidth: 2,
					dotStrokeColor: "#999999"

				};
				//First commit in tree or new branch beggining.
				if (oCommit.Parents.length === 0) {
					//Create a new standalone or new root.
					oCommit.oBranchRoot = oGitGraph.orphanBranch(oCommit.Name);
					//Draw the commit circle
					oCommit.oBranchRoot.commit(commitConfig);
					continue;
				}

				//Commit has Only 1 parent
				if (oCommit.Parents.length === 1) {
					//Increnment the number of childs created in the parent to include the current child
					oCommit.Parents[0].iCreatedChildren += 1;
					//If not he last unhandles child in the parent create new branch and save it

					if (oCommit.Parents[0].iCreatedChildren !== oCommit.Parents[0].Children.length) {
						oCommit.oBranchRoot = oCommit.Parents[0].oBranchRoot.branch(commitConfig);
					} else { //Last child in the parent update the parent root
						oCommit.oBranchRoot = oCommit.Parents[0].oBranchRoot;
					}
					//Create a simple new commit on the branch that is already in checkedout/created
					//Draw the commit circle
					oCommit.oBranchRoot.commit(commitConfig);
					continue;
				}

				//Merge
				if (oCommit.Parents.length > 1) {
					var oLeftBranch = oCommit.Parents[1];
					var oRightBranch = oCommit.Parents[0];
					oRightBranch.iCreatedChildren++;
					//Merge the right side branch to the left side branch (add the circle on the graph)
					oRightBranch.oBranchRoot.merge(oLeftBranch.oBranchRoot, commitConfig);
					//Update the pointers
					oCommit.oBranchRoot = oLeftBranch.oBranchRoot;
					if (oRightBranch.iCreatedChildren === oRightBranch.Children.length) { //delete the old branch to save space
						oLeftBranch.oBranchRoot.checkout();
						oRightBranch.oBranchRoot.delete();
					}
				}
			}
			oGitGraph.render();
		}
	}
});

sap.watt.ideplatform.plugin.gitclient.ui.GitVersionGraph.prototype.setColumns = function(aColumns) {
	if (this.getPath()) {
		var oTable = this.getAggregation("_table");
		for (var i = 0; i < aColumns.length; i++) {
			oTable.addColumn(aColumns[i]);
		}
		oTable.bindRows(this.getPath());
	}
};