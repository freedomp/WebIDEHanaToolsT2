jQuery.sap.require("sap.watt.saptoolsets.fiori.problemsView.util.ProblemsViewUIFormatters");
sap.ui.controller("sap.watt.saptoolsets.fiori.problemsView.view.ProblemsView", {

	_problemsModel: new sap.ui.model.json.JSONModel({title: "", keys: [], problems: []}),
	_problemsModelName: "problemsModel",
	_view: null,
	_enableDefaultFilter: true,
	_webIdeContext: null,

	onInit: function () {
		this._view = this.getView();
		this._initSeverityIconsColumnMenu();
		this._initFilterButtons();
		this._view.setModel(this._problemsModel, "problemsModel");
	},

	setWebIdeContext: function (oContext) {
		this._webIdeContext = oContext;
	},

	onTableFiltered: function (oEvent) {
		var params = oEvent.getParameters();
		var filteredColumn = params.column;
		var filteredValue = params.value;
		var oSeverityColumn = this._getSeverityColumn();
		if (oSeverityColumn === filteredColumn) {
			// prevent default filter, and run all filters instead
			oEvent.preventDefault();
			var aFilters = this._getSeverityFilterWithOtherActive(filteredColumn, filteredValue);
			this._bindTableRowsToFilters(aFilters, filteredValue);
		}
	},

	_removeOldSeverityFilters: function (aFilters) {
		return _.filter(aFilters, function (oFilter) {
			return oFilter.sPath !== "severity";
		});
	},

	_getSeverityFilterWithOtherActive: function (newFilteredColumn, newFilteredValue) {
		var oTable = this.getProblemsViewTable();
		var aFilters = oTable.getBinding("rows").aFilters || [];
		aFilters = this._removeOldSeverityFilters(aFilters);
		aFilters.push(this._getSevirityFilter(newFilteredValue));
		return aFilters;
	},

	_initSeverityIconsColumnMenu: function () {
		var that = this;
		var oColoumn = this._view.byId("severityIconsColumn");
		var oCustomMenu = new sap.ui.unified.Menu();
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({
			text: 'Errors',
			select: $.proxy(that.filterErrors, that)
		}));
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({
			text: 'Warnings',
			select: $.proxy(that.filterWarning, that)
		}));
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({
			text: 'Infos',
			select: $.proxy(that.filterInfo, that)
		}));
		oCustomMenu.addItem(new sap.ui.unified.MenuItem({
			text: 'All',
			select: $.proxy(that.filterAll, that)
		}));
		oCustomMenu._setFilterValue = function () {
		};
		oColoumn.setMenu(oCustomMenu);
	},

	setProblems: function (domain, problems) {
		var currentModel = this._problemsModel.getData();
		var _keys = [], _aIDs = [];
		var isProblemsArgCompatible = Array.isArray(problems) && problems.length > 0;
		var isDomainArgCompatible = ( (typeof domain) === "string" || (domain instanceof String) ) && domain.length > 0;

		if (isProblemsArgCompatible && isDomainArgCompatible) {
			_.forEach(problems, function (problem) {
				if (problem.id) {
					_keys.push(domain + problem.id);
					_aIDs.push(problem.id);
				}
			});
			if (_keys.length > 0) {
				this._clearProblemsByDomain(domain);
				//The current structure of the Model is temp ONLY and should be more robust & with better performance.
				//The structure should be:
				//  {
				//	  key1 : {problem1},
				//	  key2: {problem2}
				//  }
				//The current structure is in place, because it requires change in the  UI implementation & different type of model (not json).
				var newProblems = {
					keys: _keys,
					problems: problems
				};
				//this._problemsModel.setData(newProblems, true); does not work becaue of a bug in UI5, which can't do merge in setData
				for (prop in currentModel) {
					currentModel[prop] = currentModel[prop].concat(newProblems[prop]);
				}
				this._updateBinding();
			}
		}
	},

	_clearProblemsByDomain: function (domain) {
		var currentModel = this._problemsModel.getData();
		var aKeys = currentModel['keys'];
		var aProblems = currentModel['problems'];
		var indexesToRemove = [];
		for (var i = 0; i < aKeys.length; i++) {
			if (_.startsWith(aKeys[i], domain)) {
				indexesToRemove.push(i);
			}
		}
		if (indexesToRemove.length > 0) {
			_.pullAt(aKeys, indexesToRemove);
			_.pullAt(aProblems, indexesToRemove);
		}
	},

	_updateBinding: function () {
		this._problemsModel.updateBindings();
		this._updateFilterButtonsCounters();
		if (this._enableDefaultFilter) {
			this._enableDefaultFilter = false;
			this.filterErrors();
		}
	},

	_updateFilterButtonsCounters: function () {
		var oProblems = this._problemsModel.getData().problems;
		var counters = {};
		_.each(oProblems, function (oProblem) {
			var severity = oProblem.severity;
			if (!_.isNumber(counters[severity])) {
				counters[severity] = 1;
			} else {
				counters[severity]++;
			}
		});
		var allCounter = 0;
		var allButton = null;
		_.each(this._filterButtons, function (oButton, sPrefix) {
			if (sPrefix !== "all") {
				var counter = counters[sPrefix] || 0;
				oButton.setText(_.capitalize(sPrefix) + "s (" + counter + ")");
				allCounter += counter;
			} else {
				allButton = oButton;
			}
		});
		allButton.setText("All (" + allCounter + ")");
	},

	clearProblems: function (domain, aIDs) {
		var that = this;
		var oldModel = this._problemsModel.getData();
		this._keysToRemove = [];
		var isIDsSent = (aIDs != null);
		if (!isIDsSent) {
			this._clearProblemsByDomain(domain);
			this._updateBinding();
		}
		else {
			var isIDsArgCompatible = Array.isArray(aIDs) && aIDs.length > 0;
			if (isIDsArgCompatible) {
				_.forEach(aIDs, function (ID) {
					that._keysToRemove.push(domain + ID);
				});
				if (oldModel.keys.length) {
					_.forEach(that._keysToRemove, function (keyRemove) {
						var aRedundant = [];
						for (var index = 0; index < oldModel.keys.length; index++) {
							//The key that the problem-supplier provides may be duplicate- like with code validation(uses the file-path for all problems in the same file)
							if (keyRemove === oldModel.keys[index]) {
								aRedundant.push(index);
							}
						}
						var i = 0;
						_.forEach(aRedundant, function (indexValue) {
							oldModel.keys.splice(indexValue - i, 1);
							oldModel.problems.splice(indexValue - i, 1);
							i++;
						});
					});
					this._updateBinding();
				}
			}
		}
	},

	onFileLinkPress: function (oEvent) {
		var path = oEvent.getSource().getBindingContext(this._problemsModelName).getPath();
		var obj = this._problemsModel.getProperty(path);
		var navigate = obj.navigate;
		try {
			navigate.handler(navigate.arguments);
		} catch (err) {
		}
	},

	getProblemsViewTable: function () {
		return this._view.byId("problemsViewTable");
	},

	_getSevirityFilter: function (sSevirity) {
		if (sSevirity.toLowerCase() === "all") {
			return new sap.ui.model.Filter("severity", function () {
				return true;
			});
		} else {
			return new sap.ui.model.Filter("severity", function (sVal) {
				return sVal.toLowerCase() === sSevirity.toLowerCase();
			});
		}
	},

	_getFilterButton: function (sButtonIdPrefix) {
		var sButtonId = sButtonIdPrefix + "ProblemsTableFilter";
		var oButton = this._view.byId(sButtonId);
		return oButton;
	},

	_setSelectedButton: function (sButtonIdPrefix) {
		_.each(this._filterButtons, function (oButton, idPrefix) {
			if (sButtonIdPrefix === idPrefix) {
				oButton.addStyleClass("problemsFilterBtnSelected");
				oButton.removeStyleClass("problemsFilterBtnNotSelected");
			} else {
				oButton.addStyleClass("problemsFilterBtnNotSelected");
				oButton.removeStyleClass("problemsFilterBtnSelected");
			}
		});
	},

	_initFilterButtons: function () {
		this._filterButtons = {
			"info": this._getFilterButton("info"),
			"error": this._getFilterButton("error"),
			"warning": this._getFilterButton("warning"),
			"all": this._getFilterButton("all")
		};
		//this.filterErrors(); //default
	},

	_filterButtons: {},

	_findSeverityFilter: function (aFilters) {
		var oSeverityFilter;
		_.each(aFilters, function (oFilter) {
			if (oFilter.sPath === "severity") {
				oSeverityFilter = oFilter;
				return false;
			}
		});
		return oSeverityFilter;
	},

	_bindTableRowsToFilters: function (aFilters, sSeverityFilterValue) {
		var oTable = this.getProblemsViewTable();
		oTable.getBinding("rows").filter(aFilters);
		var oSeverityFilter = this._findSeverityFilter(aFilters);
		var oSeverityColumn = this._getSeverityColumn();
		if (oSeverityFilter && sSeverityFilterValue && sSeverityFilterValue !== "all") {
			oSeverityColumn.setFiltered(true);
			oSeverityColumn.setFilterValue(sSeverityFilterValue);
		} else {
			oSeverityColumn.setFiltered(false);
			oSeverityColumn.setFilterValue("");
		}

	},

	_fireSeverityColumnFiltered: function (sSeverity) {
		var oTable = this.getProblemsViewTable();
		var oSeverityColumn = this._getSeverityColumn();
		oTable.fireFilter({
			column: oSeverityColumn,
			value: sSeverity
		});
	},

	filterErrors: function (oEvent) {
		this._setSelectedButton("error");
		this._enableDefaultFilter = false;
		this._fireSeverityColumnFiltered("ERROR");
	},

	filterInfo: function (oEvent) {
		this._setSelectedButton("info");
		this._enableDefaultFilter = false;
		this._fireSeverityColumnFiltered("INFO");
	},

	filterWarning: function (oEvent) {
		this._setSelectedButton("warning");
		this._enableDefaultFilter = false;
		this._fireSeverityColumnFiltered("WARNING");
	},

	_getSeverityColumn: function () {
		return this._view.byId("severityIconsColumn");
	},

	filterAll: function (oEvent) {
		this._setSelectedButton("all");
		this._enableDefaultFilter = false;
		this._fireSeverityColumnFiltered("all");
	},

	analyseProblems: function () {
		this._webIdeContext.service.usagemonitoring.startPerf("ProblemsView", "Analyse").done();
		var analyseProblemsButton = this._view.byId("analyseProblems");
		analyseProblemsButton.setEnabled(false);
		this._webIdeContext.service.validationTriggers.analyse().fin(function () {
			analyseProblemsButton.setEnabled(true);
		}).done();
	},

	getHelpText: function (checker, ruleId, description, helpUrl) {
		if (helpUrl) {
			var text = (checker ? checker + ": " : "");
			text = text + (ruleId ? "(" + ruleId + ") " : "");
			return text;
		}
		return null;
	},

	getDesciptionText: function (checker, ruleId, description, helpUrl) {
		if (helpUrl) {
			return description;
		} else {
			var text = (checker ? checker + ": " : "");
			text = text + (ruleId ? "(" + ruleId + ") " : "");
			text = text + description;
			return text;
		}
	},

	getTitleText: function (project) {
		var title;
		if (typeof(project) === "undefined" || _.isNull(project) || _.isEmpty(project)) {
			title = "";
		}
		else if (project === "workspace") {
			title = this._webIdeContext.i18n.getText("i18n", "problem_title_workspace_label") + " " + project;
		}
		else {
			title = this._webIdeContext.i18n.getText("i18n", "problem_title_project_label") + " " + project;
		}
		return title;
	},

	setTitle: function (sTitle) {
		var currentModel = this._problemsModel.getData();
		currentModel.title = sTitle;
		this._updateBinding();
	},

	clearTitle: function () {
		var currentModel = this._problemsModel.getData();
		currentModel.title = "";
		this._updateBinding();
	}
});
