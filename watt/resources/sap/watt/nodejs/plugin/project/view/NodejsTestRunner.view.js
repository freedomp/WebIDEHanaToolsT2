(function() {

	"use strict";

	jQuery.sap.require("sap.ui.core.format.DateFormat");
	jQuery.sap.require("sap.ui.commons.MessageBox");

	sap.ui.jsview("sap.xs.nodejs.project.view.NodejsTestRunner", {

		_sContextMenuTestsId: "sap.xs.nodejs.project.cmdGroup.test",
		_sContextMenuCoverageId: "sap.xs.nodejs.project.cmdGroup.coverage",

		_oContext: undefined,

		_oHistoryBox: undefined,
		_oTree: undefined,
		_oCoverageCheckbox: undefined,

		_oDateFormat: sap.ui.core.format.DateFormat.getDateTimeInstance({
			style: "medium",
			UTC: false
		}),

		_oStatusValues: {},

		/**
		 * Specifies the Controller belonging to this View. In the case that it is not implemented,
		 * or that "null" is returned, this View does not have a Controller.
		 *
		 * @memberOf sap.xs.nodejs.project.watt.src.main.webapp.plugin.project.view.NodejsTestRunner
		 */
		getControllerName: function() {
			return "sap.xs.nodejs.project.view.NodejsTestRunner";
		},

		_getContext: function() {
			if (!this._oContext) {
				this._oContext = this.getViewData().context;
			}

			return this._oContext;
		},

		_showContextMenu: function(menuId, point, object) {

			var that = this;

			return this._getContext().service.commandGroup.getGroup(menuId).then(function(oGroup) {
				oGroup.getItems().then(function(aItems) {
					var aPromises = [];
					jQuery.each(aItems, function(idx, value) {
						if(value.getGroup) {
							var innerGroup = value.getGroup();
							var p = innerGroup.getItems().then(function(aInnerItems) {
								jQuery.each(aInnerItems, function(idx2, value2) {
									value2.getCommand().setValue(object);
								});
							});
							aPromises.push(p);
						} else {
							value.getCommand().setValue(object);
						}
					});

					return Q.all(aPromises).then(function() {
						return that._getContext().service.contextMenu.open(oGroup, point.x, point.y).done();
					});
				});
			});
		},

		_createHistoryBoxSection: function() {

			var that = this;

			this._oHistoryBox = new sap.ui.commons.DropdownBox({
				width: "100%",
				displaySecondaryValues: true,
				editable: true,
				change: function(oEvent) {

					var oSelectedItem = oEvent.mParameters.selectedItem;
					if (oSelectedItem) {
						var sId = oSelectedItem.getKey();

						that.getController().showTestRun(sId);
					}
				}
			});
			this._oHistoryBox.addStyleClass("flatControlSmall");

			// show icons in drop down list
			// per default icons are disabled
			var oListBox = new sap.ui.commons.ListBox({
				displayIcons: true
			});
			this._oHistoryBox.setListBox(oListBox);

			var oItemTemplate = new sap.ui.core.ListItem({
				key: "{history>indexId}",
				icon: {
					parts: ["history>failures"],
					formatter: function(nFailures) {
						if (nFailures !== undefined) {
							switch (nFailures) {
								case -1:
									return "sap-icon://message-warning";
								case 0:
									return "sap-icon://sys-enter";
								default:
									return "sap-icon://sys-cancel";
							}
						} else {
							return "sap-icon://message-warning";
						}
					}
				},
				additionalText: {
					parts: ["history>failures"],
					formatter: function(nFailures) {
						if (nFailures !== undefined) {
							return "(" + nFailures + ")";
						}
					}
				},
				text: {
					parts: ["history>timestamp", "history>projectPath"],
					formatter: function(timestamp, projectPath) {
						if (timestamp) {
							return projectPath + " " + that._oDateFormat.format(new Date(timestamp));
						}
					}
				}
			});

			this._oHistoryBox.bindItems("history>/", oItemTemplate);

			// create a lite button with an icon and a text
			var oDeleteAllButton = new sap.ui.commons.Button({
				tooltip: "{i18n>testResultPane_deleteAllEntries_xtol}",
				icon: "sap-icon://delete",
				lite: true,

				press: function() {

					oDeleteAllButton.setEnabled(false);

					var sTit = that._getContext().i18n.getText("{i18n>testResultPane_deleteAllEntries_xtit}");
					var sMsg = that._getContext().i18n.getText("{i18n>testResultPane_deleteAllEntries_xmsg}");

					sap.ui.commons.MessageBox.confirm(sMsg, function(bConfirmed) {
						if (bConfirmed) {
							that.getController().clearHistory();

						} else {
							oDeleteAllButton.setEnabled(true);
						}
					}, sTit);

				},

				enabled: {
					parts: ["history>/"],
					formatter: function(items) {
						if (items && items.length > 0) {
							return true;
						}

						return false;
					}
				}
			});
			oDeleteAllButton.addStyleClass("flatControlSmall");

			var oLayout = new sap.ui.commons.layout.MatrixLayout({
				layoutFixed: false,
				columns: 2,
				widths: ["100%", "0%"],
				rows: [new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [
						new sap.ui.commons.layout.MatrixLayoutCell({
							content: this._oHistoryBox
						}),
						new sap.ui.commons.layout.MatrixLayoutCell({
							content: oDeleteAllButton,
							hAlign: sap.ui.commons.layout.HAlign.Right
						})
					]
				})]
			});

			return oLayout;
		},

		_createHeaderSection: function() {

			var that = this;
			var oController = this.getController();

			var oRuntimeLabel = new sap.ui.commons.Label({
				text: "{i18n>testResultPane_runtime_xfld}"
			});
			var oRuntimeField = new sap.ui.commons.Label({
				text: "{data>/report/time}"
			});

			var oFailuresLabel = new sap.ui.commons.Label({
				text: "{i18n>testResultPane_failures_xfld}"
			});
			var oFailuresField = new sap.ui.commons.Label({
				text: "{data>/report/failures}"
			});

			var oStatusLabel = new sap.ui.commons.Label({
				text: "{i18n>testResultPane_status_xfld}"
			});
			var oStatusField = new sap.ui.commons.Label({
				text: {
					parts: ["data>/status"],
					formatter: function(status) {
						var sTextKey = "testResultPane_runState_" + status + "_xmsg";
						var sText = that._getContext().i18n.getText(sTextKey);

						// translation found?
						if (sText !== sTextKey) {
							return sText;
						}

						return status;
					}
				}
			});

			var oHLayoutTest = new sap.ui.layout.HorizontalLayout({
				content: [oRuntimeLabel, oRuntimeField, oFailuresLabel, oFailuresField, oStatusLabel, oStatusField]
			});

			var oTotalCoverageLabel = new sap.ui.commons.Label({
				text: "{i18n>testResultPane_totalCoverage_xfld}"
			});
			var oTotalCoverageField = new sap.ui.commons.Label({
				text: {
					parts: ["coverage>/totalCoveredLineCount", "coverage>/totalLineCount"],
					formatter: function(nCoveredLineCount, nLineCount) {
						if(nCoveredLineCount && nLineCount) {
							return Math.round(nCoveredLineCount / nLineCount * 100) + "% (" + nCoveredLineCount + " / " + nLineCount + ")";
						}
					}
				}
			});

			var oHLayoutCov = new sap.ui.layout.HorizontalLayout({
				content: [oTotalCoverageLabel, oTotalCoverageField]
			});

			this._oCoverageCheckbox = new sap.ui.commons.CheckBox({
				text: "{i18n>testResultPane_showCodeCoverage_xfld}",
				tooltip: "{i18n>testResultPane_showCodeCoverage_xtol}",
				change: function() {
					that.getController()._setCoverageVisible(that._oCoverageCheckbox.getChecked());
				},
				enabled: {
					parts: ["data>/"],
					formatter: function(oData) {
						if (oData && oData.coverage) {
							return true;
						} else {
							return false;
						}
					}
				}
			});
			this._oCoverageCheckbox.setChecked(this.getController()._bCoverageVisible);

			var oVLayout = new sap.ui.layout.VerticalLayout({
				content: [oHLayoutTest, oHLayoutCov, this._oCoverageCheckbox]
			});

			return oVLayout;
		},

		_createTreeSection: function() {

			var that = this;

			var oLabel = new sap.ui.commons.Label({
				text : {
					parts: ["data>"],
					formatter: function(oData) {
						if (oData) {
							if(oData.name) {
								var sText = oData.name;
								if (oData.resource) {
									if (oData.resource.uri) {
										sText = sText + ", " + oData.resource.uri;
									}
									if (oData.resource.line) {
										sText = sText + ":" + oData.resource.line;
									}
								}

								return sText;
							}

							if( oData.message) {
								return oData.message;
							}
						}
					}
				},
				icon : {
					parts: ["data>"],
					formatter: function(oData) {
						if(oData) {
							if (jQuery.isArray(oData.failures)) {
								if (oData.failures.length > 0) {
									return "sap-icon://sys-cancel";
								} else {
									return "sap-icon://sys-enter";
								}

							} else {
								if (oData.failures === 0) {
									return "sap-icon://accounting-document-verification";

								} else if (oData.failures > 0) {
									return "sap-icon://sys-cancel";
								}
							}

							if (oData.passed === true) {
								return "sap-icon://sys-enter";
							} else {
								return "sap-icon://sys-cancel";
							}
						}
					}
				}
			});

			var oDataTemplate = new sap.ui.core.CustomData({
				key: "status",
				writeToDom: true
			});
			oDataTemplate.bindProperty("value", {
				parts: ["data>"],
				formatter: function(oData) {
					if( oData ) {
						if (oData.failures) {
							if (oData.failures.length === 0 || oData.failures === 0) {
								return "ok";
							} else {
								return "error";
							}
						} else {
							if (oData.passed === true) {
								return "ok";
							} else {
								return "error";
							}
						}
					}

					return "";
				}
			});
			oLabel.addCustomData(oDataTemplate);
			oLabel.addStyleClass("testResultRow");

			this._oTree = new sap.ui.table.TreeTable({
				noData: "{i18n>testResultPane_noTestResults_xmsg}",
				columnHeaderVisible: false,
				enableColumnReordering: false,
				visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
				rowHeight : 20,
				minAutoRowCount: 1,
				width: "100%",
				selectionMode: sap.ui.table.SelectionMode.Single,
				columns: [ new sap.ui.table.Column({
					width: "100%",
					template: oLabel
				}) ]
			});

			var eventDelegate = {
				onAfterRendering: function() {
					that._oTree.expandToLevel(4);
					that._oTree.removeEventDelegate(eventDelegate);
				}
			};
			this._oTree.addEventDelegate(eventDelegate, this);

			this._oTree.attachCellContextmenu(function(oEvent) {

				oEvent.preventDefault();

				var oContext = oEvent.getParameters().rowBindingContext;
				if(oContext) {
					var oModel = oContext.oModel;
					var sPath = oContext.sPath;
					var oTestRun = oModel.getProperty(sPath);
					var point = {
						x : window.event.clientX,
						y : window.event.clientY
					};

					var sProjectPath = oModel.getData().projectPath;

					var oObject = {
						view: that,
						stack: oTestRun.stack
					};

					if(oTestRun.resource) {
						var sUri = "/" + sProjectPath + "/" + oTestRun.resource.uri;
						sUri = sUri.replace(/\/+/g, "/");
						oObject.uri = sUri;
						oObject.line = oTestRun.resource.line;
						oObject.localUri = oTestRun.resource.uri;
					}

					that._showContextMenu(that._sContextMenuTestsId, point, oObject);
				}
			});

			this._oTree.attachCellClick(function(oEvent) {
				var oContext = oEvent.getParameters().rowBindingContext;
				if(oContext) {
					var sPath = oContext.sPath;
					var oTestRun = oContext.oModel.getProperty(sPath);
					var sStack = oTestRun.stack;

					that._setStackValue(sStack);
				}
			});

			this._oTree.bindRows({
				path: "data>/report/suites",
				parameters: {
					arrayNames: ["suites", "specs", "failures"]
				}
			});

			this._oTree.addStyleClass("nodejsTestRunnerPane");
			this._oTree.addStyleClass("flatControlSmall");

			this._oPanel = new sap.ui.commons.Panel({
				width: "100%",
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Transparent,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				title: new sap.ui.core.Title({
					text: "{i18n>testResultPane_testResults_xtit}",
					level: sap.ui.core.TitleLevel.H3
				}),
				content: [this._oTree]
			});
			this._oPanel.addStyleClass("flatControlSmall");
			this._oPanel.addStyleClass("nodejsTestRunnerPane");

			return this._oPanel;
		},

		_countReportTreeDepth: function(oReport) {
			var that = this;
			var result = 1;
			if(oReport.suites) {
				jQuery.each(oReport.suites, function(idx, value) {
					result = result + that._countReportTreeDepth(value);
				});
			}
			if(oReport.specs) {
				jQuery.each(oReport.specs, function(idx, value) {
					result = result + that._countReportTreeDepth(value);
				});
			}
			if(oReport.failures) {
				jQuery.each(oReport.failures, function(idx, value) {
					result = result + that._countReportTreeDepth(value);
				});
			}
			return result;
		},

		_createCoverageSection: function() {

			var that = this;

			this._oTable = new sap.ui.table.Table({
				width: "100%",
				noDataText: "{i18n>testResultPane_noCoverage_xmsg}",
				columnHeaderVisible: true,
				enableColumnReordering: false,
				selectionMode: sap.ui.table.SelectionMode.Single,
				visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
				rowHeight : 20,
				minAutoRowCount: 1
			});
			this._oTable.addStyleClass("nodejsTestRunnerPane");
			this._oTable.addStyleClass("flatControlSmall");

			var eventDelegate = {
				onAfterRendering: function() {
					that._oTable.sort(that._oTable.getColumns()[1], sap.ui.table.SortOrder.Ascending);
					that._oTable.removeEventDelegate(eventDelegate);
				}
			};
			this._oTable.addEventDelegate(eventDelegate, this);

			this._oTable.bindRows("coverage>/sessionData");

			this._oTable.attachCellContextmenu(function(oEvent) {

				oEvent.preventDefault();

				var oContext = oEvent.getParameters().rowBindingContext;
				if(oContext) {
					var sPath = oContext.sPath;
					var oCoverage = oContext.oModel.getProperty(sPath);

					var point = {
						x : window.event.clientX,
						y : window.event.clientY
					};

					var sProjectPath = that.getController()._getTestRunDataModel().getData().projectPath;
					var sUri = "/" + sProjectPath + "/" + oCoverage.path;
					sUri = sUri.replace(/\/+/g, "/");

					var oColumn = that._oTable.getColumns()[oEvent.getParameters().columnIndex];

					var oObject = {
						uri : sUri,
						localUri: oCoverage.path,
						column: oColumn
					};

					that._showContextMenu(that._sContextMenuCoverageId, point, oObject);
				}
			});

			this._oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text: "{i18n>testResultPane_fileName_xcol}"}),
				width: "100%",
				autoResizable: true,
				template: new sap.ui.commons.TextField({
					editable: false,
					tooltip: "{coverage>path}",
					value : {
						path: "coverage>path",
						formatter: function(sPath) {
							if (sPath) {
								return sPath;
							}
						}
					}
				}).addStyleClass("testCoverageRow"),
				sortProperty: "path",
				filterProperty: "path"
			}));

			this._oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text: "{i18n>testResultPane_fileCoverage_xcol}"}),
				width: "7rem",
				autoResizable: true,
				template: new sap.ui.commons.ProgressIndicator({
					width: "100%",
					percentValue: "{coverage>percentage}",
					tooltip: "{i18n>testResultPane_fileCoverage_xtol}",
					showValue: true,
					displayValue: {
						parts: ["coverage>percentage", "coverage>coveredLineCount", "coverage>lineCount"],
						formatter: function(nPercentage, nCoveredLineCount, nLineCount) {
							if (nCoveredLineCount && nLineCount) {
								return nPercentage + "% (" + nCoveredLineCount + " / " + nLineCount + ")";
							}
						}
					}
				}).addStyleClass("testCoverageRow").addStyleClass("nodejs-coverage-progress-background"),
				sortProperty: "percentage"
			}));

			this._oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text: "{i18n>testResultPane_totalCoverage_xcol}"}),
				width: "7rem",
				autoResizable: true,
				template: new sap.ui.commons.ProgressIndicator({
					width: "100%",
					percentValue: "{coverage>totalPercentage}",
					tooltip: "{i18n>testResultPane_totalCoverage_xtol}",
					showValue: true,
					displayValue: {
						parts: ["coverage>totalPercentage", "coverage>coveredLineCount", "coverage>/totalLineCount"],
						formatter: function(nTotalPercentage, nCoveredLineCount, nTotalLineCount) {
							if (nTotalPercentage && nCoveredLineCount && nTotalLineCount) {
								return nTotalPercentage + "% (" + nCoveredLineCount + " / " + nTotalLineCount + ")";
							}
						}
					}
				}).addStyleClass("testCoverageRow").addStyleClass("nodejs-coverage-progress-background"),
				sortProperty: "totalPercentage"
			}));



			var oPanel = new sap.ui.commons.Panel({
				width: "100%",
				height: "100%",
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Transparent,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				title: new sap.ui.core.Title({
					text: "{i18n>testResultPane_coverageSection_xtit}",
					level: sap.ui.core.TitleLevel.H3
				}),
				content: [this._oTable]
			});
			oPanel.addStyleClass("flatControlSmall");
			oPanel.addStyleClass("nodejsTestRunnerPane");

			return oPanel;
		},

		_createStackSection: function() {

			var that = this;

			this._oStackContent = new sap.ui.commons.TextArea({
				value: "",
				width: "100%",
				height: "100%",
				wrapping: sap.ui.core.Wrapping.Off,
				editable: false
			});
			this._oStackContent.addStyleClass("nodejsTestRunnerPane");

			var oPanel = new sap.ui.commons.Panel({
				width: "100%",
				height: "100%",
				applyContentPadding: false,
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				title: new sap.ui.core.Title({
					text: "{i18n>testResultPane_stackTrace_xtit}",
					level: sap.ui.core.TitleLevel.H3
				}),
				content: [this._oStackContent]
			});
			oPanel.addStyleClass("flatControlSmall");
			oPanel.addStyleClass("nodejsTestRunnerPane");

			return oPanel;
		},

		_setStackValue: function(sValue) {
			this._oStackContent.setValue(sValue);
			if (sValue) {
				var roughLineCount = sValue.split("\n").length;
				this._oStackContent.setRows(roughLineCount);
			} else {
				this._oStackContent.setRows(5);
			}
		},

		/**
		 * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. Since the
		 * Controller is given to this method, its event handlers can be attached right away.
		 *
		 * @memberOf sap.xs.nodejs.project.watt.src.main.webapp.plugin.project.view.RunnerView
		 */
		createContent: function(oController) {

			var that = this;

			this.setDisplayBlock(true);

			var oController = this.getController();
			var oModel = oController._getTestRunDataModel();

			var oHistoryBoxSection = this._createHistoryBoxSection();
			var oHeaderSection = this._createHeaderSection();

			var oHeaderPanel = new sap.ui.commons.Panel({
				width: "100%",
				height: "9.5rem",
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Transparent,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				title: new sap.ui.core.Title({
					text: "{i18n>testResultPane_testExecution_xtit}"
				}),
				content: [oHistoryBoxSection, oHeaderSection]
			});
			oHeaderPanel.addStyleClass("flatControlSmall");
			oHeaderPanel.addStyleClass("nodejsTestRunnerPane");

			var oTreeSection = this._createTreeSection();
			var oStackSection = this._createStackSection();
			var oCoverageSection = this._createCoverageSection();

			this._oTree.attachRowSelectionChange(function(oEvent) {
				var nodeContext = oEvent.getParameters().nodeContext;
				if( nodeContext) {
					var sPath = nodeContext.sPath;
					var oTestRun = oModel.getProperty(sPath);
					var sStack = oTestRun.stack;

					that._setStackValue(sStack);
				}
			});

			oTreeSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
				minSize: 28
			}));
			oStackSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
				minSize: 28
			}));
			oCoverageSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
				minSize: 28
			}));

			this._oSplitter;
			if (!/.*phantomjs.*/igm.test(navigator.userAgent)) {
				// new splitter not compatible w/ phantomjs <= 1.9.8
				// for phantomjs >= 2.0.0 and all other browsers
				this._oSplitter = new sap.ui.layout.Splitter({
					height: "100%",
					width: "100%",
					orientation: sap.ui.core.Orientation.Vertical,
					contentAreas: [oTreeSection, oStackSection, oCoverageSection],
					resize: function(oEvent) {
						var newResultHeight = oEvent.getParameters().newSizes[0];
						var newResultLineCount = Math.max(Math.round(newResultHeight / that._oTree.getRowHeight()) - 2, 0);
						that._oTree.setVisibleRowCount(newResultLineCount);

						var newCoverageHeight = oEvent.getParameters().newSizes[2];
						var newCoverageLineCount = Math.max(Math.round(newCoverageHeight / that._oTable.getRowHeight()) - 2, 0);
						that._oTable.setVisibleRowCount(newCoverageLineCount);
					}
				});
			} else {
				// for phantomjs <= 1.9.8, remove once phantomjs 2.0.0
				// is available on linux
				this._oSplitter = new sap.ui.commons.Splitter({
					splitterOrientation: sap.ui.commons.Orientation.horizontal,
					width: "100%",
					height: "100%",
					firstPaneContent: [oTreeSection],
					secondPaneContent: [oStackSection],
					splitterPosition: "70%",
					minSizeFirstPane: "15%",
					minSizeSecondPane: "2%"
				});
			}

			var oFixFlex = new sap.ui.layout.FixFlex({
				fixContent: [oHeaderPanel],
				flexContent: this._oSplitter
			});

			return oFixFlex;
		}
	});
}());
