define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";
    sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.common.ui5icons/css/ui5icons.css"));
	var
		/**
		 * Data model for IconDialog service
		 *
		 * @type {sap.ui.model.json.JSONModel}
		 * @private
		 */
		_oModel = new sap.ui.model.json.JSONModel({
			icons: null,
			hasSelection: false,
			accepted: false,
			selectedIcon: ""
		}),

		/**
		 * Search control for IconDialog service
		 *
		 * @type {sap.ui.commons.SearchField}
		 * @private
		 */
		_oSearch = new sap.ui.commons.SearchField({
			enableListSuggest: false,
			showListExpander: false,
			enableFilterMode: true,
			enableClear: true,
			startSuggestion: 0,
			width: "100%",
			tooltip: "{i18n>IconDialog_SearchTooltip}",
			suggest: _applyFilter
		}).addStyleClass("SearchField"),

		/**
		 * Table control for IconDialog service
		 *
		 * @type {sap.ui.table.Table}
		 * @private
		 */
		_oTable = new sap.ui.table.Table({
			title: "",
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
			visibleRowCount: 9,
			rows: "{/icons}",
			width: "100%",
			columns: [
				new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>IconDialog_Icon}",
					design: sap.ui.commons.LabelDesign.Bold
				}),
				template: new sap.ui.core.Icon({
					src: "{icon}"
				}).addStyleClass("iconsize"),
				resizable: false,
				width: "30%"
				}),
				new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "{i18n>IconDialog_Name}",
					design: sap.ui.commons.LabelDesign.Bold
				}),
				template: new sap.ui.commons.TextView({
					text: "{name}"
				}),
				resizable: false,
				width: "70%"
				})
			],
			rowSelectionChange: function(oEvent) {
				if (oEvent.getParameter("rowContext")) {
					_oModel.setProperty("/selectedIcon", oEvent.getParameter("rowContext").getProperty("name"));
					_oModel.setProperty("/hasSelection", true);
				}
			}
		}),

		/**
		 * Dialog control for IconDialog service
		 *
		 * @type {sap.ui.commons.Dialog}
		 * @private
		 */
		_oDialog = new sap.ui.commons.Dialog({
			title: "{i18n>IconDialog_SelectIcon}",
			resizable: false,
			width: "420px",
			height: "500px",
			modal: true,
			content: [
				_oSearch,
				_oTable
			],
			buttons: [
				new sap.ui.commons.Button({
					text: "{i18n>IconDialog_OKButton}",
					enabled: "{/hasSelection}",
					press: function() {
						_oModel.setProperty("/accepted", true);
						_oDialog.close();
					}
				}),
				new sap.ui.commons.Button({
					text: "{i18n>IconDialog_CancelButton}",
					press: function() {
						_oDialog.close();
					}
				})
			]
		});

	_oDialog.setInitialFocus(_oSearch);
	_oDialog.setModel(_oModel);

	/**
	 * Applies table filtering by given search text
	 *
	 * @param {jQuery.Event} [oEvent] an event object
	 *
	 * @name _applyFilter
	 * @function
	 * @private
	 */
	function _applyFilter(oEvent) {
		var sText = oEvent && oEvent.getParameter("value"),
			aFilters = [];

		if (sText) {
			// Contains operator ignores case
			aFilters.push(new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sText));
		}
		_oTable.getBinding("rows").filter(aFilters);
		_adjustSelection();
	}

	/**
	 * Adjusts table's row selection
	 *
	 * @name _adjustSelection
	 * @function
	 * @private
	 */
	function _adjustSelection() {
		var sSelectedIcon = _oModel.getProperty("/selectedIcon"),
			iIndex = -1,
			iPageSize = _oTable.getVisibleRowCount();

		if (sSelectedIcon) {
			for (var i = 0, iLen = _oTable.getBinding("rows").getLength(); i < iLen; i++) {
				if (_oTable.getContextByIndex(i).getProperty("name") === sSelectedIcon) {
					iIndex = i;
					break;
				}
			}
		}
		if (iIndex === -1) {
			_oTable.setFirstVisibleRow(0);
			_oTable.clearSelection();
		} else {
			_oTable.setFirstVisibleRow(Math.floor(iIndex / iPageSize) * iPageSize);
			_oTable.setSelectedIndex(iIndex);
		}
	}

	/**
	 * IconDialog service
	 */
	return {
		/**
		 * Initializes the service.
		 * Applications must not call this method directly, it is called by the service.
		 *
		 * @name IconDialog#_init
		 * @function
		 * @private
		 */
		_init: _.once(function() {
			_oModel.setProperty("/icons", _.sortBy(_.map(sap.ui.core.IconPool.getIconNames(), function(sName) {
				return {
					name: sName.toLowerCase(),
					icon: sap.ui.core.IconPool.getIconInfo(sName).uri
				};
			}), "name"));
			this.context.i18n.applyTo(_oDialog);
		}),

		/**
		 * Opens icons dialog. Selects the row with the given <code>sSelectedIcon</code> if exists
		 *
		 * @param {!string} sSelectedIcon Selected icon name
		 *
		 * @name IconDialog#openIconDialog
		 * @function
		 * @public
		 */
		openIconDialog: function(sSelectedIcon) {
			var _oDeferred = Q.defer();

			this._init();

			_oModel.setProperty("/selectedIcon", (sSelectedIcon || "").replace(/^(sap-icon:\/\/)(.*)/, "$2"));
			_oModel.setProperty("/accepted", false);

			_applyFilter();
			_oModel.setProperty("/hasSelection", _oTable.getSelectedIndex() !== -1);
			_oSearch.setValue("");

			_oDialog.attachClosed(onClose);
			_oDialog.open();

			return _oDeferred.promise;

			function onClose() {
				//first detach close handler (to avoid recursion and multiple reports)
				_oDialog.detachClosed(onClose);
				_oDeferred.resolve({
					icon: _oModel.getProperty("/selectedIcon"),
					accepted: _oModel.getProperty("/accepted")
				});
			}
		}
	};
});