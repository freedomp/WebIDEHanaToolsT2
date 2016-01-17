jQuery.sap.declare("cus.sd.sofulfil.monitor.model.SOModelHelper");

jQuery.sap.require("cus.sd.sofulfil.monitor.utils.Formatter");
jQuery.sap.require("cus.sd.sofulfil.monitor.utils.TextUtil");
jQuery.sap.require("cus.sd.sofulfil.monitor.utils.IssueLoader");

/**
 * Helper models SO05, SO06. Bundles logic common to the models
 */

cus.sd.sofulfil.monitor.model.SOModelHelper = function(soModel) {
	this.soModel = soModel;
};

cus.sd.sofulfil.monitor.model.SOModelHelper.prototype = {
	/**
	 * @memberOf SOModelHelper.js (comment enables outline view)
	 */

	soModel : null,
	oCrossAppNavigator : null,
	issueLoader : cus.sd.sofulfil.monitor.utils.IssueLoader,

	loadIssue : function(order, fnPostProcess) {
		var model = this.getModel(order);
		var that = this;

		var issueFields = model.oData.Items ? this.soModel.issueFieldsOrder : this.soModel.issueFieldsHeader;
		this.issueLoader.load([this.soModel.order, this.soModel.issueCode], issueFields, model, function() {
			that._loadIssueDataPostProcess();
			fnPostProcess();
		});
	},

	getExternalHref : function(object, action, params) {
		if (!this.oCrossAppNavigator) {
			var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
		}
		if (!this.oCrossAppNavigator)
			return "";
		return this.oCrossAppNavigator.hrefForExternal({
			target : {
				semanticObject : object,
				action : action
			},
			params : params
		}) || "";
	},

	_loadIssueDataPostProcess : function() {
		var header = this.soModel.issueModel.oData;
		var items = header.Items;

		if (!items)
			return;// When no items are there, then no issue is there. Then we must do nothing

		if (!header.status) {
			this.setErrorStatus(header);
			header.status.text = "";
		}

		header.DueDays = this._determineIssueOverdueDays();

		header.toSoldToFactsheet = this.getExternalHref("Customer", "displayFactSheet", {
			Customer : header.SoldToParty
		});
		header.toShipToFactsheet = this.getExternalHref("Customer", "displayFactSheet", {
			Customer : header.ShipToParty
		});

		items.sort(function(a, b) {
			if (a.SalesOrderItem < b.SalesOrderItem)
				return -1;
			return a.SalesOrderItem > b.SalesOrderItem ? 1 : 0;
		});

		for ( var index in items) {
			var item = items[index];
			if (!item.status) {
				this.setErrorStatus(item);
			}
			item.toMatFactsheet = this.getExternalHref("Material", "displayFactSheet", {
				Material : item.Material
			});
		}

		var numberOfIssueItems = items ? items.length : 0;
		header.NmbrOfIssuesInOrder = numberOfIssueItems.toString();

		var itemText = numberOfIssueItems === 1 ? "Item" : "Items";
		header.NmbrOfIssuesInOrderText = cus.sd.sofulfil.monitor.utils.TextUtil.getText(itemText);

		if (this.extLoadIssueDataPostProcess) {
			this.extLoadIssueDataPostProcess();
		}

	},

	setErrorStatus : function(node) {
		node.status = node.status || {};
		node.status.info = node.status.info || sap.ui.core.ValueState.Error;
		node.status.text = node.status.text || cus.sd.sofulfil.monitor.utils.TextUtil.getText(this.soModel.errorStatusText);
	},

	setToCompleted : function(node, _statusText) {

		node.status = node.status || {};
		node.status.info = sap.ui.core.ValueState.Success;
		if (typeof (_statusText) !== "undefined") {
			node.status.text = _statusText;
		} else {
			node.status.text = cus.sd.sofulfil.monitor.utils.TextUtil.getText("IssueSolved");
		}
		node.status.completed = true;
	},

	setAllToCompleted : function() {
		var model = this.soModel.issueModel;
		var items = model.oData.Items;
		for ( var index in items) {
			var item = items[index];
			this.setToCompleted(item);
		}
		this.updateHeaderStatus();
	},

	setItemsToCompleted : function(itemID) {
		var item = null;
		var id = null;
		var items = this.soModel.issueModel.oData.Items;
		for ( var index in items) {
			item = items[index];
			id = cus.sd.sofulfil.monitor.utils.Formatter.stripLeadingZeros(item.SalesOrderItem);
			if (id === itemID) {
				this.setToCompleted(item);
				return;
			}
		}
	},

	updateHeaderStatus : function() {
		var _i18nBundle = cus.sd.sofulfil.monitor.utils.TextUtil.getResourceBundle();
		var _statusSolvedText = _i18nBundle.getText("IssueSolved");
		var _itemStatusRejectedText = _i18nBundle.getText("SO_ItemStatusRejected");
		var _issueStatusRejectedText = _i18nBundle.getText("SO_StatusRejected");
		var _issueStatusSolvedRejectedText = _i18nBundle.getText("SO_StatusSolvedRejected");
		var _hasRejectedItem = false;
		var _hasSolvedItem = false;

		var header = this.soModel.issueModel.oData;
		var _statusText = _statusSolvedText;

		var items = header.Items;
		var item = null;
		for ( var index in items) {
			item = items[index];

			if (!item.status || !item.status.completed) {
				return sap.ui.core.ValueState.Error;
			}

			if (item.status.text == _itemStatusRejectedText) {
				_hasRejectedItem = true;
			} else {
				_hasSolvedItem = true;
			}
		}

		if (_hasSolvedItem && _hasRejectedItem) {
			_statusText = _issueStatusSolvedRejectedText;
		} else if (!_hasSolvedItem && _hasRejectedItem) {
			_statusText = _issueStatusRejectedText;
		}

		this.setToCompleted(header, _statusText);
		return sap.ui.core.ValueState.Success;
	},

	getHeaderStatusText : function() {
		var _i18nBundle = cus.sd.sofulfil.monitor.utils.TextUtil.getResourceBundle();
		var _statusSolvedText = _i18nBundle.getText("IssueSolved");
		var _itemStatusRejectedText = _i18nBundle.getText("SO_ItemStatusRejected");
		var _issueStatusRejectedText = _i18nBundle.getText("SO_StatusRejected");
		var _issueStatusSolvedRejectedText = _i18nBundle.getText("SO_StatusSolvedRejected");
		var _hasRejectedItem = false;
		var _hasSolvedItem = false;

		var header = this.soModel.issueModel.oData;
		var _statusText = _statusSolvedText;

		var items = header.Items;
		var item = null;
		for ( var index in items) {
			item = items[index];

			if (!item.status || !item.status.text || item.status.text == "") {
				return "";
			}

			if (item.status.text == _itemStatusRejectedText) {
				_hasRejectedItem = true;
			} else {
				_hasSolvedItem = true;
			}
		}

		if (_hasSolvedItem && _hasRejectedItem) {
			_statusText = _issueStatusSolvedRejectedText;
		} else if (!_hasSolvedItem && _hasRejectedItem) {
			_statusText = _issueStatusRejectedText;
		}

		return _statusText;
	},

	loadAllItemsAndScheduleLines : function(salesOrderId, itemIds, fnPostProcess) {
		this._loadSchedulesForItems(salesOrderId, itemIds, this.soModel.issueFieldsItem, fnPostProcess);
	},

	loadSchedulesForAllItems : function(salesOrderId, itemIds, fnPostProcess) {
		this._loadSchedulesForItems(salesOrderId, itemIds, this.soModel.issueFieldsSchedules, fnPostProcess);
	},

	loadSchedulesForSingleItem : function(salesOrderId, itemId, fnPostProcess) {
		this._loadSchedulesForItems(salesOrderId, [itemId], this.soModel.issueFieldsItemForBookmark, fnPostProcess);
	},


	_loadSchedulesForItems : function(salesOrderId, itemIds, issueFields, fnPostProcess) {
		var model = this.getModel(salesOrderId);
		var that = this;
		var fnPostProc2 = function() {
			that._loadItemDataPostProcess(itemIds);
			fnPostProcess();
		};
		var missingItemIds = this._notYetLoadedItems(itemIds);
		if (missingItemIds.length === 0) {
			fnPostProc2();
			return;
		}
		this.issueLoader.load([salesOrderId, missingItemIds], issueFields, model, fnPostProc2);
	},

	_loadItemDataPostProcess : function(itemIds) {
		var items = this.soModel.issueModel.oData.Items;
		for ( var i in itemIds) {
			var index = this.getIndexForItemId(itemIds[i]);
			if (index < 0)
				continue;// the index which might come from the url might not exist-> no post processing
			var item = items[index];
			this.setErrorStatus(item);

			item.toMatFactsheet = this.getExternalHref("Material", "displayFactSheet", {
				Material : item.Material
			});

			item.toShipToFactsheet = this.getExternalHref("Customer", "displayFactSheet", {
				Customer : item.ShipToParty
			});
		}
		if (this.extLoadItemDataPostProcess) {
			this.extLoadItemDataPostProcess();
		}

	},

	_notYetLoadedItems : function(itemIds) {
		var missingItems = [];
		for ( var i in itemIds) {
			var index = this.getIndexForItemId(itemIds[i]);
			if (index < 0 || this.soModel.issueModel.oData.Items[index].Schedules === undefined)
				missingItems.push(itemIds[i]);
		}
		return missingItems;
	},

	getIndexForItemId : function(itemId) {
		var itemIdAsNo = parseInt(itemId);
		var items = this.soModel.issueModel.oData.Items || [];
		for ( var i in items) {
			if (parseInt(items[i].SalesOrderItem) === itemIdAsNo)
				return i;
		}
		return -1;
	},

	getModel : function(salesOrderId) {
		if (salesOrderId != this.soModel.order || !this.soModel.issueModel) {
			this.soModel.order = salesOrderId;
			this.soModel.issueModel = new sap.ui.model.json.JSONModel();
		}
		return this.soModel.issueModel;
	},

	_determineIssueOverdueDays : function() {
		var items = this.soModel.issueModel.oData.Items;
		var issueDueDays = Number.NEGATIVE_INFINITY;

		for ( var index in items) {
			var item = items[index];
			issueDueDays = Math.max(parseInt(item.DueDays), issueDueDays);
		}

		return issueDueDays.toString();
	},

	cleanup : function() {
		this.soModel.order = "";
		this.soModel.issueModel = null;
	},

};
