define(function() {
	"use strict";
	return {

		_RESULTSFOUND: "Results found: ",

		_oTable: null,
		_oLabel: null,
		_oDialog: null,
		_oOkButton: null,
		_bArrowUpPressed: false,
		_bArrowDownPressed: false,
		_iSelectionIndex: 0,
		_oLastOpenedTemplate: null,
		_oSorter: null,

		init: function() {
			var that = this;

			this._RESULTSFOUND = this.context.i18n.getText("i18n", "results_found");

			this._oInput = new sap.ui.commons.TextField({
				liveChange: [that._checkInput, that]
			}).addStyleClass("resourceListIF");

			this._oOkButton = new sap.ui.commons.Button({
				text: this.context.i18n.getText("i18n", "ok"),
				press: [that._closeDialog, that]
			});

			this._oCancelButton = new sap.ui.commons.Button({
				text: this.context.i18n.getText("i18n", "cancel"),
				press: [that._cancelDialog, that]
			});

			this._oTable = new sap.ui.table.Table({
				selectionMode: sap.ui.table.SelectionMode.Single,
				selectionBehavior: sap.ui.table.SelectionBehavior.Row,
				selectedIndex: 0,
				columnHeaderVisible: false,
				navigationMode: sap.ui.table.NavigationMode.Scrollbar,
				columns: [
					{
						template: new sap.ui.commons.TextView().bindProperty("text", "name"),
						width: "25%"
					},
					{
						template: new sap.ui.commons.TextView().bindProperty("text", "parentPath"),
						width: "75%"
					},
					{
						template: new sap.ui.commons.TextView().bindProperty("text", "path"),
						visible: false
					},
					{
						template: new sap.ui.commons.TextView().bindProperty("text", "lastOpened"),
						visible: false
					}
				]
			}).attachEvent("rowSelectionChange", that._rowSelection, that)
				.attachBrowserEvent("dblclick", function(oEvent) {
					that._cellClick(oEvent);
				}, that);

			this._oLabel = new sap.ui.commons.Label();
			this._oLabel.setText("");

			this._oDialog = new sap.ui.commons.Dialog("ResourceList", {
				title: this.context.i18n.getText("i18n", "resource_list_title"),
				buttons: [this._oOkButton, this._oCancelButton],
				content: [this._oInput, this._oTable, this._oLabel],
				defaultButton: this._oOkButton,
				modal: true,
				initialFocus: this._oInput
			}).addStyleClass("resourceListDLG")
				.attachBrowserEvent("keydown", function(oEvent) {
					this._handleKeyboardEvents(oEvent);
				}, this);
		},

		_handleKeyboardEvents: function(oEvent) {
			switch (oEvent.keyCode) {
				case 13:
					if (this._oTable.getSelectedIndex() !== -1) {
						this._openDocument();
					}
					break;
				case 37:
					this._bArrowUpPressed = false;
					this._bArrowDownPressed = false;
					break;
				case 39:
					this._bArrowUpPressed = false;
					this._bArrowDownPressed = false;
					break;
				case 38:
					this._bArrowUpPressed = true;
					this._bArrowDownPressed = false;
					break;
				case 40:
					this._bArrowUpPressed = false;
					this._bArrowDownPressed = true;
					break;
				default:
					break;
			}
			//if the event emitter is the table the input must be checked
			if (oEvent.target.localName !== "input") {
				this._checkInput(oEvent);
			}
		},

		_openDocument: function() {
			var that = this;

			if (this._oTable._getRowCount() <= 0) {
				return;
			}

			this.context.service.filesystem.documentProvider.getDocument(this._getFullName(this._oTable)).then(function(oDocument) {
				return that.context.service.resourceindex.resort(oDocument).then(function() {
					return that.context.service.document.open(oDocument).then(function() {
						that.context.service.repositorybrowser.setSelectionToCurrentDocument().done();
						that._oDialog.close();
					});
				});
			}).fail(function(error) {
				if (error) {
					that.context.service.log.error("Open Resource", error.message, ["system"]).done();
				}
			}).done();
		},

		_rowSelection: function(oEvent) {
			if (this._oTable.isIndexSelected(oEvent.getParameters().rowIndex)) {
				this._sFullName = this._getFullName(this._oTable);
			}
		},

		_getFullName: function(oTable) {
			var iIdx = oTable.getSelectedIndex() - oTable.getFirstVisibleRow();

			if (iIdx > -1) {
				var oRow = oTable.getRows()[iIdx];
				var sFilename = oRow.getCells()[0].getText();
				var sFolderName = oRow.getCells()[1].getText();
				return sFolderName + "/" + sFilename;
			} else {
				return this._sFullName;
			}
		},

		_cellClick: function() {
			if (this._sFullName) {
				this._openDocument();
			}
		},

		_checkInput: function() {
			var iIdx = this._oTable.getSelectedIndex();
			var aFilters = [];
			var sQuery = this._oInput.getLiveValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("path", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			var binding = this._oTable.getBinding("rows");
			if (binding) {
				binding.filter(aFilters, "Application");
			}
			
			var iRowCount = this._oTable._getRowCount() - 1;
			if (this._bArrowUpPressed) {
				this._iSelectionIndex = (iIdx === 0) ? iIdx : iIdx - 1;
			} else if (this._bArrowDownPressed) {
				this._iSelectionIndex = (iIdx === iRowCount) ? iIdx : iIdx + 1;
			}
			if (iRowCount <= this._iSelectionIndex) {
				this._iSelectionIndex = iRowCount;
			} else if (iRowCount > 0 && this._iSelectionIndex === -1) {
				this._iSelectionIndex = 0;
			}
			//enable scrolling in the table and always scroll the 
			if (this._iSelectionIndex > 9) {
				this._oTable.setFirstVisibleRow(this._iSelectionIndex - 9);
			}
			this._oTable.setSelectedIndex(this._iSelectionIndex);
			this._oLabel.setText((sQuery.length !== 0 ? this._RESULTSFOUND + " " + (iRowCount + 1) : ""));
		},

		execute: function() {
			var oService = this.context.service;
			oService.usagemonitoring.startPerf("search_resource", "open").done();

			var that = this;
			that._oTable.setBusy(true);
			that._oInput.setValue("");
			that._oDialog.open();

			oService.resourceindex.getMetadata().then(function(oFiles) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(oFiles);
				that._oDialog.setModel(oModel);
				that._oTable.bindRows("/filesIndex");
				that._iSelectionIndex = oFiles.filesIndex.length > 0 ? 0 : -1;
				that._oTable.setSelectedIndex(that._iSelectionIndex);
				that._oTable.setBusy(false);
				that._oLabel.setText("");
				oService.usagemonitoring.report("search_resource", "open", "open").done();
			}).done();
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
				return sPerspectiveName === "development";
			});
		},

		_closeDialog: function() {
			this._openDocument();
		},

		_cancelDialog: function() {
			this._oDialog.close();
		}
	};
});