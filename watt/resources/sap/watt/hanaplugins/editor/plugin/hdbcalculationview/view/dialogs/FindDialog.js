/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../util/ResourceLoader",
        "../../base/MetadataServices"
    ], function(ResourceLoader, MetadataServices) {

	var FindDialog = function(sId, mSettings) {
		this._content = null;
		this.types = mSettings.types;
		this.noOfSelection = mSettings.noOfSelection;
		this.context = mSettings.context;
		this.onOK = mSettings.onOK;
		this.execute();
		// this.oSearchString = "**";
		this.currentViewName = mSettings.currentViewName;

		//this for replace data source
		this.replaceDataSourceDailog = mSettings.replaceDataSourceDailog;
		this.onSelectTableRow = mSettings.onSelectTableRow;
		this.onPressNext = mSettings.onNext;
		this.dTitle=mSettings.dTitle;
	};
	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	var myService = MetadataServices.SearchService;
	var noOfRecords = 0;
	//var schemaMapping = SchemaMappingService.schemaMapping;

	// enums for object types
	var objectTypes = {
		TABLE: "TABLE",
		VIEW: "VIEW",
		FUNCTION: "FUNCTION",
		REPO_PROCEDURE: "REPO_PROCEDURE",
		CALC_VIEW: "CALCULATIONVIEW",
		ANALYTIC_VIEW: "ANALYTICVIEW",
		ATTR_VIEW: "ATTRIBUTEVIEW",
		CATALOG_PROCEDURE: "CATALOG_PROCEDURE",
		TABLE_FUNCTION: "hdbtablefunction",
		SCALAR_FUNCTION: "HDBSCALARFUNCTION"
	};

	FindDialog.prototype = {

		_goIO: undefined,

		execute: function() {
			this.searchFile();
			// return data;
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			return true;
		},
		getDialogContend: function() {
			var that = this;
			if (that.replaceDataSourceDailog) {
				this.searchFile();
				return that.loMatrix;
			}
		},
		closeDialog: function() {
			if (sap.ui.getCore().byId("findobjects-dialog-form")) {
				sap.ui.getCore().byId("findobjects-dialog-form").destroy();
			}
		},
		pressOK: function() {
			if (this.ok) {
				this.ok.firePress();
			}
		},

		searchFile: function() {
			var that = this;

			if (sap.ui.getCore().byId("findobjects-dialog-form")) {
				sap.ui.getCore().byId("findobjects-dialog-form").destroy();
			}
			var loThisDia = new sap.ui.commons.Dialog("findobjects-dialog-form", {
				width: '500px',
				height: '410px',
				modal: true,
				resizable: true
			});
			if (that.dTitle) {
				loThisDia.setTitle(that.dTitle);
				loThisDia.setTooltip(that.dTitle);
			} else {
				loThisDia.setTitle(resourceLoader.getText("txt_find_title"));
				loThisDia.setTooltip(resourceLoader.getText("txt_find_title"));
			}
			/*var loThisDia = new sap.m.Dialog("findfile-dialog-form", {
            "contentWidth": "auto",
            "title" : "Find"
            });*/

			that.loMatrix = new sap.ui.commons.layout.MatrixLayout({
				layoutFixed: false,
				width: '100%',
				columns: 2
			});
			loThisDia.addContent(that.loMatrix);
			var loLabel1 = new sap.ui.commons.Label({
				text: resourceLoader.getText("txt_find_search_text")
			});
			that.loMatrix.createRow(loLabel1);
			var updateSeach = function(oSearchString) {
				// var loSearchFileObject = {};
				if (loButtonOK) {
					loButtonOK.setEnabled(false);
				}
				var aData = [];
				// var searchString;
				//loSearchFileObject.searchString = oSearchString;
				if (that.oTable) {
					that.oTable.unbindRows();
					that.oTable.destroyNoData();
					that.oTable.setNoData(new sap.ui.commons.TextView({
						text: resourceLoader.getText("txt_find_searching")
					}));
				}

				var _callbackSearchNew = function(data, textStatus) {

					var text;
					if (that.loResultLabel) {
						if (data) {
							// that.oTable.setNoData("No object found");
							text = JSON.stringify(data);
							var datajson = JSON.parse(data);
							//var metadata = data.metadata;
							var metadata = datajson.dbobjects;
							if (metadata && metadata.length > 0) {
								if (searchString === oSearchString) {
									that._populateResultsInTable(metadata, aData, noOfRecords);
								}
							} else if (metadata && metadata.length === 0) {
								if (that.oTable) {
									that.oTable.setNoData(new sap.ui.commons.TextView({
										text: resourceLoader.getText("txt_find_no_result")
									}));
								}
								noOfRecords = 0;
								that.loResultLabel.setText("Found: " + noOfRecords);
							} else if (data.Severity) {
								if (that.oTable) {
									that.oTable.setNoData(new sap.ui.commons.TextView({
										text: resourceLoader.getText("txt_find_error")
									}));
								}
								noOfRecords = 0;
								that.loResultLabel.setText("Found: " + noOfRecords);
							} else {
								if (that.oTable) {
									that.oTable.setNoData(new sap.ui.commons.TextView({
										text: resourceLoader.getText("txt_find_no_result")
									}));
								}
								noOfRecords = 0;
								that.loResultLabel.setText("Found: " + noOfRecords);
							}
						} else {
							if (that.oTable) {
								that.oTable.setNoData(new sap.ui.commons.TextView({
									text: resourceLoader.getText("txt_find_no_result")
								}));
							}
							noOfRecords = 0;
							that.loResultLabel.setText("Found: " + noOfRecords);
						}
						if (that.oTable) {
							that.oTable.setNoData(new sap.ui.commons.TextView({
								text: resourceLoader.getText("txt_find_no_result")
							}));
						}
					}

				};

				var _jqXHRFunction = function(jqXHR, textStatus) {
					var errorText = JSON.stringify(jqXHR);
					sap.ui.getCore().applyChanges();

				};
				if (that.types) {
					// Get the type and pass it to the API
					var hasRT = false;
					var hasDT = false;
					for (var i = 0; i < that.types.length; i++) {
						if (that.types[i] === objectTypes.TABLE || that.types[i] === objectTypes.VIEW || that.types[i] === objectTypes.CATALOG_PROCEDURE ||
							that.types[i] === objectTypes.FUNCTION) {
							hasRT = true;
						}
						if (that.types[i] === objectTypes.ANALYTIC_VIEW || that.types[i] === objectTypes.CALC_VIEW || that.types[i] === objectTypes.ATTR_VIEW ||
							that.types[i] === objectTypes.REPO_PROCEDURE || that.types[i] === objectTypes.TABLE_FUNCTION || that.types[i] === objectTypes.SCALAR_FUNCTION
						) {
							hasDT = true;
						}
					}
					var objectTypeContext = [];

					if (hasDT) {
						var modeArray_dt = [];
						var typesArray_dt = [];
						var mode_dt = {
							"main": "DT"
						};
						modeArray_dt.push(mode_dt);
						for (var k = 0; k < that.types.length; k++) {
							if (that.types[k] === objectTypes.CALC_VIEW) {
								var type = {
									"main": "VIEW",
									"sub": "CALCULATIONVIEW"
								};
								typesArray_dt.push(type);
							}
							if (that.types[k] === objectTypes.ANALYTIC_VIEW) {
								var type = {
									"main": "VIEW",
									"sub": "ANALYTICVIEW"
								};
								typesArray_dt.push(type);
							}
							if (that.types[k] === objectTypes.REPO_PROCEDURE) {
								var type = {
									"main": "PROCEDURE"
								};
								typesArray_dt.push(type);
							}
							if (that.types[k] === objectTypes.ATTR_VIEW) {
								var type = {
									"main": "VIEW",
									"sub": "ATTRIBUTEVIEW"
								};
								typesArray_dt.push(type);
							}
							if (that.types[k] === objectTypes.TABLE_FUNCTION) {
								var type = {
									"main": "FUNCTION",
									"sub": "HDBTABLEFUNCTION"
								};
								typesArray_dt.push(type);
							}
							if (that.types[k] === objectTypes.SCALAR_FUNCTION) {
								var type = {
									"main": "FUNCTION",
									"sub": "HDBSCALARFUNCTION"
								};
								typesArray_dt.push(type);
							}

						}
						var objectModel = {
							mode: modeArray_dt,
							type: typesArray_dt
						};
						objectTypeContext.push(objectModel);
					}

					if (hasRT) {
						var modeArray_rt = [];
						var typesArray_rt = [];
						var mode_rt = {
							"main": "RT"
						};
						modeArray_rt.push(mode_rt);
						for (var j = 0; j < that.types.length; j++) {
							if (that.types[j] === objectTypes.TABLE) {
								var type = {
									"main": "TABLE"
								};
								typesArray_rt.push(type);
							}
							if (that.types[j] === objectTypes.VIEW) {
								var type = {
									"main": "VIEW"
								};
								typesArray_rt.push(type);
							}
							if (that.types[j] === objectTypes.CATALOG_PROCEDURE) {
								var type = {
									"main": "PROCEDURE"
								};
								typesArray_rt.push(type);
							}
							if (that.types[j] === objectTypes.FUNCTION) {
								var type = {
									"main": "FUNCTION"
								};
								typesArray_rt.push(type);
							}

						}
						var objectModel = {
							mode: modeArray_rt,
							type: typesArray_rt
						};
						objectTypeContext.push(objectModel);
					}

				/*	myService.search(oSearchString, 'PATTERN', 100, false, false, true, _callbackSearchNew, _jqXHRFunction, objectTypeContext); */
					myService.search(oSearchString, typesArray_rt,_callbackSearchNew, _jqXHRFunction);
					searchString = oSearchString;
				} else {
				/*	myService.search(oSearchString, 'PATTERN', 100, false, false, true, _callbackSearchNew, _jqXHRFunction); */
					myService.search(oSearchString,typesArray_rt,_callbackSearchNew, _jqXHRFunction);
					searchString = oSearchString;
				}
			};

			var seachTimer;
			//  updateSeach("**");  //for diabling initail searching 
			var loSearch = new sap.ui.commons.SearchField({
				width: '100%',
				enableListSuggest: false,
				enableClear: true,
				startSuggestion: 0,
				suggest: function(ioEvent) {
					that.oSearchString = ioEvent.getParameter("value");
					if (!that.oSearchString || that.oSearchString.length === 0) {
						// that.oSearchString = "**";
						that.oTable.unbindRows();
						that.oTable.setNoData(new sap.ui.commons.TextView({
							text: resourceLoader.getText("txt_find_search_text")
						}));
					} else if (that.oSearchString && that.oSearchString.length === 1) {
						that.oTable.unbindRows();
						that.oTable.setNoData(new sap.ui.commons.TextView({
							text: resourceLoader.getText("txt_find_atleast_two_chars")
						}));
					}
					clearTimeout(seachTimer);
					if (that.oSearchString.length >= 2) {
						seachTimer = setTimeout(function() {
							updateSeach(that.oSearchString);
						}, 800);
					}

				}
			});

			//loSearch.addStyleClass("searchInputField");
			that.loMatrix.createRow(loSearch);
			loThisDia.setInitialFocus(loSearch);

			that.loResultLabel = new sap.ui.commons.Label( /*"findobjects-result-header",*/ {
				text: resourceLoader.getText("txt_find_found")
			});
			that.loMatrix.createRow(that.loResultLabel);

			//Create table instead of ListBox
			//Create an instance of the table control
			/*var selectionMode;
            if (this.multiSelect === true) {
                selectionMode = sap.ui.table.SelectionMode.MultiToggle;
            } else {
                selectionMode = sap.ui.table.SelectionMode.Single;
            }*/

			var selectionMode = sap.ui.table.SelectionMode.Multi;

			if (that.noOfSelection === 1) {
				selectionMode = sap.ui.table.SelectionMode.Single;
			}

			this.oTable = new sap.ui.table.Table({
				//  visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
				firstVisibleRow: 0,
				visibleRowCount: 5,
				showNoData: true,
				width: '100%',
				height: '100%',
				showColumnVisibilityMenu: false,
				fixedColumnCount: 0,
				selectionMode: selectionMode,
				selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
				enableCellFilter: true,
				navigationMode: sap.ui.table.NavigationMode.Scrollbar,

				rowSelectionChange: function(event) {
					var index = that.oTable.getSelectedIndices();
					if (index.length > 0) {
						if (that.replaceDataSourceDailog) {
							that.onSelectTableRow(true);
						}
						loButtonOK.setEnabled(true);
					} else {
						if (that.replaceDataSourceDailog && event.type === "click") {
							that.onSelectTableRow(false);
						}
						loButtonOK.setEnabled(false);
					}
					/* var rows = that.oTable.getRows();
                    var selectedRow = rows[index];
                    if (selectedRow !== null) {

                    }*/
				}
			});

			that.oTable.setNoData(new sap.ui.commons.TextView({
				text: resourceLoader.getText("txt_find_search_text")
			}));

			that.oTable.attachBrowserEvent("dblclick", function(event) {
				if (that.replaceDataSourceDailog === undefined && event.target && event.target.id && sap.ui.getCore().byId(event.target.id) && sap.ui
					.getCore().byId(event.target.id).oParent.getIndex && sap.ui.getCore().byId(event.target.id).oParent.getIndex()) {
					that.oTable.setSelectedIndex(sap.ui.getCore().byId(event.target.id).oParent.getIndex());
					loButtonOK.firePress(event);
				}
			});

			//this.oTable.addStyleClass("customTable");
			this.oTable.addStyleClass("calcViewTableInDialog");
			that.loMatrix.createRow(this.oTable);

			// Icon and Package/Schema name
			this.oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_find_type")
				}),
				template: new sap.ui.commons.Label({
					icon: {
						path: "Type",
						formatter: function(Type) {
							if (Type === objectTypes.CALC_VIEW) {
								return resourceLoader.getImagePath("calculation_scenario.png", "analytics");
							} else if (Type === objectTypes.ANALYTIC_VIEW) {
								return resourceLoader.getImagePath("AnalyticView.png", "analytics");
							} else if (Type === objectTypes.ATTR_VIEW) {
								return resourceLoader.getImagePath("AttributeView.png", "analytics");
							} else if (Type === "PROCEDURE" || Type === "HDBPROCEDURE") {
								return resourceLoader.getImagePath("procedure.jpg", "analytics");
							} else if (Type === objectTypes.TABLE) {
								return resourceLoader.getImagePath("Table.png", "analytics");
							} else if (Type === objectTypes.VIEW) {
								return resourceLoader.getImagePath("view.jpg", "analytics");
							} else if (Type && Type.toUpperCase() == objectTypes.TABLE_FUNCTION.toUpperCase()) {
								return resourceLoader.getImagePath("TableFunction.gif", "analytics");
							} else if (Type === objectTypes.SCALAR_FUNCTION) {
								return resourceLoader.getImagePath("procedure.jpg", "analytics"); //this icon need to be change ...this temp 
							} else {
								return resourceLoader.getImagePath("Table.png", "analytics");
							}
						}
					}
				}),
				sortProperty: "Type",
				filterProperty: "Type",
				width: "15%",
				hAlign: "Center",
				resizable: true
			}));

			// Icon and ObjectName
			var oColumn = new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_find_name")
				}),

				template: new sap.ui.core.HTML({
					content: {
						path: "Name",
						formatter: function(Name) {
							var searchString1;
							if (that.oSearchString) {
								if (that.oSearchString.indexOf("*") !== -1) {
									searchString1 = that.oSearchString.replace(/[^a-zA-Z0-9]/g, "");
								} else {
									searchString1 = that.oSearchString;
								}

								if (Name !== null && Name !== "" && Name) {
									var searchUC = searchString1.toUpperCase();

									var nameUC = Name.toUpperCase();

									var startIndex = nameUC.indexOf(searchUC);
									if (startIndex !== -1) {
										var searchText = Name.substring(startIndex, searchUC.length + startIndex);
										var searchString2 = searchText.bold();
										return "<p style='margin-top:6px;text-align:left'>" + Name.replace(searchText, searchString2) + "</p>";
									} else {
										var arr = that.oSearchString.split("*");
										for (var i in arr) {
											var re = new RegExp(i, "gi");
											Name.replace(re, i.bold());
										}

										return "<p style='margin-top:6px;text-align:left'>" + Name + "</p>";
									}
									//return "<p style='margin-top:6px'>" + Name.replace(regEx, replaceMask) + "</p>";
									// return Name.replace(oSearchString, searchString);
									//return Name;
								}
							} else {
								return "<p style='margin-top:6px;text-align:left'>" + Name + "</p>";
							}
						}
					}
				}),
				sortProperty: "Name",
				width: "55%",
				hAlign: "Center",
				resizable: true
			});
			this.oTable.addColumn(oColumn);

			// Template for Package Icon and Package/Schema Name
			/*var labelTemplate2 = new sap.ui.commons.Label({
                icon: "{packIcon}",
                text: "{packageName}"
            });*/
			var labelTemplate2 = new sap.ui.commons.Label({
				icon: "{packIcon}",
				text: {
					parts: ["packageName", "schemaName"],
					formatter: function(packageName, schemaName) {
						if (packageName)
							return packageName;
						else if (schemaName)
							return schemaName;
					}
				}

			});

			// Icon and Package/Schema name
			this.oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_find_package")
				}),
				template: labelTemplate2,
				sortProperty: "folder",
				filterProperty: "folder",
				width: "30%",
				hAlign: "Center",
				resizable: true
			}));

			var loButtonCancel = new sap.ui.commons.Button({
				//var loButtonCancel = new sap.m.Button({
				tooltip: resourceLoader.getText("txt_find_cancel"),
				text: resourceLoader.getText("txt_find_cancel"),
				press: function() {
					that.onOK();
					loThisDia.destroy();
				}
			});
			var okBtnPressed = function() {
				var index = that.oTable.getSelectedIndex();
				if (index >= 0) {
					var data = [];
					Q.all([that.getAuthoringSchemas()])
						.spread(function(authSchemas) {
							var indices = that.oTable.getSelectedIndices();
							var check = function(i) {
								if (i < indices.length) {
									if (that.noOfSelection) {
										if (i < that.noOfSelection) {
											return true;
										}
									} else {
										return true;
									}
								}
								return false;
							};
							for (var i = 0; check(i); i++) {
								var selectedObject = that.oTable.getContextByIndex(indices[i]);
								var modelIndex = selectedObject.sPath.split("/modelData/");
								var element = that.oTable.getModel().getData().modelData[modelIndex[1]];
								if (authSchemas) {
									if (element.schemaName && element.Type === "TABLE") {
										var found = false;
										var authSchema;
										for (var j = 0; j < authSchemas.length; j++) {
											if (element.schemaName === authSchemas[j].physicalSchema) {
												found = true;
												authSchema = authSchemas[j].authoringSchema;
												break;
											}
										}
										if (found) {
											var obj = {
												name: element.Name,
												type: element.Type,
												packageName: element.packageName ? element.packageName : undefined,
												schemaName: authSchema ? authSchema : undefined,
												physicalSchema: element.schemaName ? element.schemaName : undefined,

											};
											data.push(obj);
										}
									} else {
										var obj = {
											name: element.Name,
											type: element.Type,
											packageName: element.packageName ? element.packageName : undefined,
											physicalSchema: element.schemaName ? element.schemaName : undefined,
											schemaName: element.schemaName ? element.schemaName : undefined
										};
										data.push(obj);
									}
								} else {
									var obj = {
										name: element.Name,
										type: element.Type,
										packageName: element.packageName ? element.packageName : undefined,
										physicalSchema: element.schemaName ? element.schemaName : undefined,
										schemaName: element.schemaName ? element.schemaName : undefined
									};
									data.push(obj);

								}
							}
							that.oTable.clearSelection();
							that.onOK(data);
							if (!that.replaceDataSourceDailog) {
								loThisDia.destroy();
							}

						})
						.done();

				}
			};

			var loButtonOK = new sap.ui.commons.Button( /*"OK",*/ {
				//var loButtonOK = new sap.m.Button({
				tooltip: resourceLoader.getText("txt_find_ok"),
				text: resourceLoader.getText("txt_find_ok"),
				enabled: false,
				press: function() {
					okBtnPressed();

				}
			});
			that.ok = loButtonOK;
			if (!that.replaceDataSourceDailog) {
				loThisDia.addButton(loButtonOK);
				loThisDia.addButton(loButtonCancel);
				loThisDia.open();
			}

			loThisDia.setInitialFocus(loSearch);

		},

		_populateResultsInTable: function(data, aData, noOfRecords) {
			var that = this;
			var packIcon;

			for (var i = 0; i < data.length; i++) {
				packIcon = resourceLoader.getImagePath("schema.png", "analytics");
			    var obj = {
							Name: data[i].name,
							packIcon: packIcon,
							//packageName: data[i].schema,
							schemaName: data[i].schema,
							Type: data[i].type,
							folder: data[i].schema
						};
			      aData.push(obj);
			
				// RT - Runtime artifacts are catalog objects
			/*	if (data[i].mainMode === "RT") {
					if (data[i].mainType === "VIEW" || data[i].mainType === "TABLE" || data[i].mainType === "PROCEDURE") {
						packIcon = resourceLoader.getImagePath("schema.png", "analytics");
						noOfRecords++;
						var obj = {
							Name: data[i].objectName,
							packIcon: packIcon,
							//packageName: data[i].schema,
							schemaName: data[i].schema,
							Type: data[i].mainType,
							folder: data[i].schema
						};
						if (this.context && data[i].namespace === this.context.packageName + "/" + this.currentViewName || data[i].mainType === "VIEW" &&
							data[i].schema === "_SYS_BIC") {

						} else {
							aData.push(obj);
						}
					}
				}
				// DT- Design time artifacts are Content objects
				else if (data[i].mainMode === "DT") {
					if ((data[i].mainType === "VIEW" || data[i].mainType === "PROCEDURE" || data[i].mainType === "FUNCTION") && (data[i].subType ===
						"CALCULATIONVIEW" || data[i].subType === "PROCEDURE" || data[i].subType === "ANALYTICVIEW" || data[i].subType === "ATTRIBUTEVIEW" ||
						data[i].subType === "HDBPROCEDURE" || data[i].subType === "HDBTABLEFUNCTION" || data[i].subType === "HDBSCALARFUNCTION")) {
						packIcon = resourceLoader.getImagePath("package_native.png", "analytics");
						noOfRecords++;
						var obj = {
							Name: data[i].objectName,
							packIcon: packIcon,
							packageName: data[i].namespace,
							//schemaName: data[i].schema,
							Type: data[i].subType,
							folder: data[i].namespace
						};
						if (this.context && this.context.packageName === data[i].namespace && data[i].objectName === this.currentViewName) {

						} else {
							aData.push(obj);

						}
					}
				} */
			}
			/*} else {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].objectID.stype === "calculationview" || data[i].objectID.stype === "analyticview" || data[i].objectID.stype === "attributeview" || data[i].objectID.stype === "procedure") {
                        packIcon = resourceLoader.getImagePath("package_native.png", "analytics");
                        noOfRecords++;
                        var obj = {
                            Name: data[i].objectID.name,
                            packIcon: packIcon,
                            packageName: data[i].objectID.package,
                            Type: data[i].objectID.stype,
                            folder: data[i].objectID.package
                        };
                        aData.push(obj);
                    }
                }
            }*/

			//Create a model and bind the table rows to this model
			var oModel = new sap.ui.model.json.JSONModel();
			if (aData.length > 0) {
				oModel.setData({
					modelData: aData
				});

				if (that.oTable) {
					that.oTable.setModel(oModel);
					that.oTable.bindRows("/modelData");

					//Initially sort the table
					that.oTable.sort(that.oTable.getColumns()[1]);
				}

			} else {
				if (that.oTable) {
					that.oTable.setNoData(new sap.ui.commons.TextView({
						text: resourceLoader.getText("txt_find_no_result")
					}));
				}
				noOfRecords = 0;
			}
			if (that.loResultLabel) {
				if (noOfRecords > 1000) {
					that.loResultLabel.setText(resourceLoader.getText("txt_find_more_found"));
				} else {
					that.loResultLabel.setText(resourceLoader.getText("txt_find_found") + " " + noOfRecords);
				}
			}
		},

		getAuthoringSchemas: function() {
			var that = this;
			var q = Q.defer();
			var phySchemas = [];
			var indices = that.oTable.getSelectedIndices();
			var check = function(i) {
				if (i < indices.length) {
					if (that.noOfSelection) {
						if (i < that.noOfSelection) {
							return true;
						}
					} else {
						return true;
					}
				}
				return false;
			};
			for (var i = 0; check(i); i++) {
				var selectedObject = that.oTable.getContextByIndex(indices[i]);
				var modelIndex = selectedObject.sPath.split("/modelData/");
				var element = that.oTable.getModel().getData().modelData[modelIndex[1]];
				if (element.schemaName && element.Type === "TABLE") {
					phySchemas.push(element.schemaName);
				}
			}

			function onComplete(result) {
				q.resolve(result);
			}

			/*if (phySchemas.length > 0) {
				if (that.context) {
					schemaMapping.getAuthoringSchemas(phySchemas, that.context, onComplete);
					//.done();
				} else {
					onComplete(undefined);
				}
			} else {
				onComplete(undefined);
			} */
			onComplete(undefined);
			return q.promise;
		},

		_populateCatalogObjectsInTable: function(data, aData, noOfRecords, isCatalog) {
			var packIcon;
			for (var i = 0; i < data.length; i++) {
				// RT - Runtime artifacts are catalog objects
				if (data[i].mode === "RT") {
					if (data[i].type === "VIEW" || data[i].type === "TABLE") {
						packIcon = resourceLoader.getImagePath("schema.png", "analytics");
						noOfRecords++;
						var obj = {
							Name: data[i].localName,
							packIcon: packIcon,
							packageName: data[i].namespace,
							Type: data[i].type
						};
						aData.push(obj);
					}
				}
				// DT- Design time artifacts are Content objects
				else if (data[i].mode === "DT") {

				}
			}

			//Create a model and bind the table rows to this model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				modelData: aData
			});

			sap.ui.getCore().byId("table").setModel(oModel);
			sap.ui.getCore().byId("table").bindRows("/modelData");

			//Initially sort the table
			sap.ui.getCore().byId("table").sort(sap.ui.getCore().byId("table").getColumns()[1]);

			if (noOfRecords > 1000) {
				that.loResultLabel.setText("More than 1000 Found:");
			} else {
				that.loResultLabel.setText("Found: " + noOfRecords);
			}
		}

	};
	return FindDialog;
});
