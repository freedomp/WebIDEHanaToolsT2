/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../sharedmodel/sharedmodel", "../../util/ResourceLoader"],

	function(sharedmodel, ResourceLoader) {

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var ValueHelpDialogForVariable = function(parameters) {
			this.context = parameters.context;
			this.packageName = parameters.tableData.packageName;
			this.dataSourceName = parameters.tableData.dataSourceName;
			this.columnName = parameters.tableData.columnName;
			this.labelColumnName = parameters.tableData.labelColumnName;
			this.isTable = parameters.tableData.isTable;

			this.dialogtype = parameters.dialogtype;
			this.callback = parameters.callback;
			this.valueItems = [];
			this.searchBox;
			this.oTable2;
			this.defNumberOfRows = 100;
			this.parameters = parameters.parameters;
			this.oTreeTable;
			this.hierarchyName = parameters.tableData.hierarchyName;
			this.maxLevel;
			this.hierarchyParent;
		};
		ValueHelpDialogForVariable.prototype = {

			_CreateModelForTreeTable: function() {
				var that = this;

				return function(results) {
					if (results.responses[0].result.entries && results.responses[0].result.entries[0]) {
						that.maxLevel = results.responses[0].result.entries[0][3];
						var oData = {
							root: {
								name: "root",
								description: "root description",
								checked: false,
								0: {
									UniName: results.responses[0].result.entries[0][2],
									name: results.responses[0].result.entries[0][0],
									description: results.responses[0].result.entries[0][1],
									level: 0
								}
							}
						};
						if (results.responses[0].result.entries && results.responses[0].result.entries[0] && results.responses[0].result.entries[0][0] &&
							results.responses[0].result.entries[0][0].toUpperCase() !== "(ALL)") {
							that.hierarchyParent = true;
						}
						that._createNode(oData.root[0], results);
						//Create a model and bind the table rows to this model
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						that.oTreeTable.setModel(oModel);
						that.oTreeTable.bindRows("/root");
					} else if (results.responses[0].result.errorCode) {
						logger.writeErrorMessage(results.responses[0].result.message);
							that.oTreeTable.setNoData(new sap.ui.commons.TextView({
                            text: resourceLoader.getText("txt_find_error")
                        }));
					}else if(results.responses[0].result.entries && results.responses[0].result.entries.length===0){
					    	that.oTreeTable.setNoData(new sap.ui.commons.TextView({
                            text: resourceLoader.getText("txt_find_no_result")
                        }));
					}
				};
			},
			_createNode: function(node, results) {

				var list = [];
				results.responses[0].result.entries.forEach(function(hie) {
					if (node.UniName === hie[5]) {
						list.push(hie);
					}
				});
				for (var index in list) {
					node[index] = {
						UniName: list[index][2],
						name: list[index][0],
						description: list[index][1],
						checked: false,
						level: list[index][3]
					};
					if (this.maxLevel < list[index][3]) {
						this.maxLevel = list[index][3];
					}
				}
				for (var index in list) {
					this._createNode(node[index], results);
				}
			},

			onValueHelpRequest: function() {
				var numberOFRows = 1;
				var currentSerach = "";
				var that = this;

         if (sap.ui.getCore().byId("sqlColumnValueHelp")) {
                    sap.ui.getCore().byId("sqlColumnValueHelp").destroy();
                }

				//for views
				if (!that.isTable && that.packageName && that.packageName !== "_SYS_BIC" && that.hierarchyName === undefined) {
					that.dataSourceName = that.packageName + "/" + that.dataSourceName;
				}
				

				//creating dialogtype
				var dialog = new sap.ui.commons.Dialog("sqlColumnValueHelp",{
					width: "500px",
					title: that.dialogtype.dialogTitle, //this.title,
					tooltip: that.dialogtype.dialogTitle, //this.title,
					modal: true,
					resizable: true,
					closed: function(e) {
						// dialog.destroy();
					}
				});
				//templete for tree table name
				var texttemplete = new sap.ui.commons.TextView({
						enabled: {
							path: "level",
							formatter: function(level) {
								if (that.hierarchyParent) {
									return true;
								} else if (that.maxLevel === level) {
									return true;
								} else {
									return false;
								}
							}
						}
					}

				);
				texttemplete.bindProperty("text", "name");
				//templete for tree table name
				var descriptiontemplete = new sap.ui.commons.TextView({
						enabled: {
							path: "level",
							formatter: function(level) {
								if (that.hierarchyParent) {
									return true;
								} else if (that.maxLevel === level) {
									return true;
								} else {
									return false;
								}
							}
						}
					}

				);
				descriptiontemplete.bindProperty("text", "description");

				//Create an instance of the table control
				that.oTreeTable = new sap.ui.table.TreeTable({
					columns: [
		new sap.ui.table.Column({
							label: "Name",
							template: texttemplete
						}),
		new sap.ui.table.Column({
							label: "Description",
							template: descriptiontemplete
						})
	],
					selectionMode: sap.ui.table.SelectionMode.Single,
					enableColumnReordering: true,
					expandFirstLevel: true,

					rowSelectionChange: function(oEvent) {
						if (oEvent.getParameter("rowContext") && that.oTreeTable.getSelectedIndices().length > 0) {
							var sPath = oEvent.getParameter("rowContext").sPath;
							sPath = sPath.slice(1, sPath.length);
							sPath = sPath.split("/");
							var data = this.getModel().oData;
							sPath.forEach(function(path) {
								data = data[path];
							});
							if (that.hierarchyParent) {
								that.oSelectedTreeObject = data;
								loButtonOK.setEnabled(true);
							} else if (data[0]) {
								loButtonOK.setEnabled(false);
							} else {
								loButtonOK.setEnabled(true);
								that.oSelectedTreeObject = data;
							}
						} else {
							loButtonOK.setEnabled(false);

						}

					}
				});

				//for heirarchies 
				if (that.hierarchyName) {
					//var stmt =
					//	"MDX SELECT MEMBER_NAME, MEMBER_CAPTION, MEMBER_UNIQUE_NAME, LEVEL_NUMBER, LEVEL_UNIQUE_NAME, PARENT_UNIQUE_NAME FROM BIMC_MEMBERS WHERE CUBE_NAME = '"+that.hierarchy.CUBE_NAME+
					//	"' AND CATALOG_NAME = '"+that.hierarchy.CATALOG_NAME+"' AND HIERARCHY_UNIQUE_NAME = '"+that.hierarchy.HIERARCHY_UNIQUE_NAME+"'";

					var stmt =
						"MDX SELECT MEMBER_NAME, MEMBER_CAPTION, MEMBER_UNIQUE_NAME, LEVEL_NUMBER, LEVEL_UNIQUE_NAME, PARENT_UNIQUE_NAME FROM BIMC_MEMBERS WHERE CUBE_NAME = '" +
						that.dataSourceName + "' AND CATALOG_NAME = '" + that.packageName + "' AND HIERARCHY_UNIQUE_NAME = '[" +
						that.hierarchyName + "].[" + that.hierarchyName + "]'";

					var aStatements = [];
					aStatements.push({
						statement: encodeURI(stmt),
						type: "SELECT"
					});

					//var maxResult = 100;
					//that.context.service.catalogDAO.sqlMultiExecute(aStatements, 200, that._CreateModelForTreeTable());
				}

				//creating layout
				var loMatrix = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false,
					columns: 1,
					width: '100%'
				});
				var timer;
				// create the SearchField
				that.searchBox = new sap.ui.commons.SearchField({
					enableListSuggest: false,
					width: "100%",
					enableClear: true,
					startSuggestion: 0,
					suggest: function(oEvent) {
						if (that.dailogtype && sharedmodel.ValueFilterOperator.IN === that.dialogtype.Operator) {
							loButtonOK.setEnabled(false);
						}
						var sText = oEvent.getParameter("value");
						clearTimeout(timer);
						timer = setTimeout(function() {
							updateList(sText);
						}, 500);
					}
				});
				var loButtonCancel = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_cancel"),
					text: resourceLoader.getText("txt_cancel"),
					press: function() {
						dialog.destroy();
					}
				});
				var dailogOkEvent = function() {

				
					if (that.hierarchyName) {
						that.callback(that.oSelectedTreeObject.name);
					} else {
					    	var tableModel = that.oTable2.getModel();
				        	var tableData = tableModel.getData();   
						that.callback(tableData.modelData[that.oTable2.getSelectedIndex()].value);
					}
					dialog.destroy();
				};
				var loButtonOK = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_ok"),
					text: resourceLoader.getText("txt_ok"),
					enabled: false,
					press: dailogOkEvent
				});
				var rowSelectEvent = function() {
					var index = that.oTable2.getSelectedIndex();
					if (index >= 0) {
						loButtonOK.setEnabled(true);
					} else {
						loButtonOK.setEnabled(false);
					}
				};
				//Create an instance of the table control
				that.oTable2 = new sap.ui.table.Table({
					visibleRowCount: 5,
					selectionMode: sap.ui.table.SelectionMode.Single,
					selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
					rowSelectionChange: rowSelectEvent

				}).addStyleClass("calcTableProperties");
				//Define the columns and the control templates to be used
				that.oTable2.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: that.columnName
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "value")
				}));
				if (that.labelColumnName) {
					//Define the columns and the control templates to be used
					that.oTable2.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: that.labelColumnName
						}),
						template: new sap.ui.commons.TextView().bindProperty("text", "description")
					}));

				}

				var callbackresults = function(result) {
					that.oTable2.destroyNoData();
					that.valueItems = [];
					if (result.responses[0].result.entries && result.responses[0].result.entries.length > 0) {

                    var isDate = that._isDateTypeColumn(result.responses[0].result.metadata[0].typeName);
						for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							var value = result.responses[0].result.entries[i][0];
							if (isDate) {
								value = that._DateToFormatedString(value);
							} 
							that.valueItems[that.valueItems.length] = {
								value: value,
								description: (result.responses[0].result.entries[i][1] !== undefined) ? result.responses[0].result.entries[i][1] : ""
							};

						}
						numberOFRows = numberOFRows + that.defNumberOfRows;

						if (result.responses[0].result.entries.length < that.defNumberOfRows) {
							scrollTriggerEvent = false;
						}

					} else if (result.responses[0].result.errorCode) {
						logger.writeErrorMessage(result.responses[0].result.message);
					} else {
						that.oTable2.setNoData(new sap.ui.commons.TextView({
							text: resourceLoader.getText("txt_no_data_found")
						}));
					}
					//Create a model and bind the table rows to this model
					var oModel = new sap.ui.model.json.JSONModel();
					that.oTable2.clearSelection();
					oModel.setData({
						modelData: that.valueItems
					});
					that.oTable2.setModel(oModel);
					that.oTable2.bindRows("/modelData");
				};
				//Help function to update a listbox with the filtered values
				var updateList = function(sPrefix) {
					numberOFRows = 1;
					that.oTable2.unbindRows();
					scrollTriggerEvent = true;

					that.oTable2.setNoData(new sap.ui.commons.TextView({
						text: resourceLoader.getText("txt_searching")
					}));

					currentSerach = sPrefix;
					if (that.context && that.columnName) {
						var aStatements = [];
						var stmt;
						var descriptionLabel = "";
						if (that.labelColumnName) {
							descriptionLabel = "\",\"" + that.labelColumnName + "";
						}
						if (that.isTable) {
							stmt = "SELECT \"" + that.columnName + descriptionLabel + "\" FROM (SELECT \"" + that.columnName + descriptionLabel +
								"\", ROW_NUMBER() OVER() AS ROW_NUM FROM \"" + that.packageName + "\".\"" + that.dataSourceName + "\" GROUP BY \"" + that.columnName +
								descriptionLabel + "\"  ORDER BY \"" + that.columnName + "\") WHERE ROW_NUM BETWEEN " + numberOFRows +
								" AND " + (numberOFRows + that.defNumberOfRows) + " AND LOWER(\"" + that.columnName + "\") like LOWER(\'%" + sPrefix + "%\')";

						} else {
							stmt = "SELECT \"" + that.columnName + descriptionLabel + "\" FROM (SELECT \"" + that.columnName + descriptionLabel +
								"\", ROW_NUMBER() OVER() AS ROW_NUM FROM  \"_SYS_BIC\".\"" + that.dataSourceName + "\" GROUP BY \"" + that.columnName +
								descriptionLabel + "\" ORDER BY \"" + that.columnName + "\") WHERE ROW_NUM BETWEEN " + numberOFRows +
								" AND " + (numberOFRows + that.defNumberOfRows) + " AND LOWER(\"" + that.columnName + "\") like LOWER(\'%" + sPrefix + "%\')";
						}
						numberOFRows = that.defNumberOfRows + 1;
						aStatements.push({
							statement: encodeURI(stmt),
							type: "SELECT"
						});
						// var maxResult = 100;
						//var viewEntity = that.context.service.catalogDAO.sqlMultiExecute(aStatements, that.defNumberOfRows, callbackresults);
					}
				};
				//adding matrix layout to dailog
				if (that.hierarchyName) {
					dialog.addContent(that.oTreeTable);
				} else {
					dialog.addContent(loMatrix);

				}
				//adding search boa and button
				loMatrix.createRow(that.searchBox);

				var valuelayout;
				var results = [];
				//dailog box has list of values 

				if (that.dialogtype && sharedmodel.ValueFilterOperator.IN == that.dialogtype.Operator) {
					//allowing multiple selction for "list box"
					that.oTable2.setSelectionMode(sap.ui.table.SelectionMode.Multi);
					loButtonOK.detachPress(dailogOkEvent);
					//adding new event for "ok " button
					loButtonOK.attachPress(function() {

						var tableModel = that.oTable2.getModel();
						var tableData = tableModel.getData();
						for (var i = 0; i < that.oTable2.getSelectedIndices().length; i++) {
							results[i] = tableData.modelData[that.oTable2.getSelectedIndices()[i]].value;
						}
						that.callback(results);
						dialog.destroy();
					});
				}
				//dailog box has between operator
				if (that.dialogtype && sharedmodel.ValueFilterOperator.BETWEEN === that.dialogtype.Operator) {

					var textValidate = function() {
						if ((textFromValue.getLiveValue()).length > 0 && (textToValue.getLiveValue()).length > 0) {
							loButtonOK.setEnabled(true);
						} else {
							loButtonOK.setEnabled(false);
						}
					};
					var textFromValue = new sap.ui.commons.TextField({
						width: "99%",
						liveChange: textValidate
					});
					var textToValue = new sap.ui.commons.TextField({
						width: "99%",
						liveChange: textValidate
					});

					var btnToolbar = new sap.ui.commons.Toolbar({
						items: [new sap.ui.commons.Button({
							text: resourceLoader.getText("txt_add_from"),
							press: function() {
								var tableModel = that.oTable2.getModel();
								var tableData = tableModel.getData();
								textFromValue.focus();
								var selectedRow = that.oTable2.getSelectedIndex();
								if (selectedRow >= 0) {
									textFromValue.setValue(tableData.modelData[that.oTable2.getSelectedIndex()].value);
								}
								if ((textFromValue.getLiveValue()).length > 0 && (textToValue.getLiveValue()).length > 0) {
									loButtonOK.setEnabled(true);
								} else {
									loButtonOK.setEnabled(false);
								}
							}
						}), new sap.ui.commons.Button({
							text: resourceLoader.getText("txt_add_to"),
							press: function() {
								var tableModel = that.oTable2.getModel();
								var tableData = tableModel.getData();
								textToValue.focus();
								var selectedRow = that.oTable2.getSelectedIndex();
								if (selectedRow >= 0) {
									textToValue.setValue(tableData.modelData[that.oTable2.getSelectedIndex()].value);
								}
								if ((textFromValue.getLiveValue()).length > 0 && (textToValue.getLiveValue()).length > 0) {
									loButtonOK.setEnabled(true);
								} else {
									loButtonOK.setEnabled(false);
								}
							}
						})]
					});

					that.oTable2.setToolbar(btnToolbar);
					loButtonOK.detachPress(dailogOkEvent);
					that.oTable2.detachRowSelectionChange(rowSelectEvent);
					//adding new event for "ok " button
					loButtonOK.attachPress(function() {
						results[0] = textFromValue.getLiveValue();
						results[1] = textToValue.getLiveValue();
						that.callback(results);
						dialog.destroy();
					});

					var labelFromValue = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_val_from"),
						design: sap.ui.commons.LabelDesign.Bold
					});
					var labelToValue = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_val_to"),
						design: sap.ui.commons.LabelDesign.Bold
					});

					if (that.dialogtype.oldValue && that.dialogtype.oldValue.length > 0) {
						if (that.dialogtype.oldValue[1] && that.dialogtype.oldValue[0]) {
							loButtonOK.setEnabled(true);
						}
						textToValue.setValue(that.dialogtype.oldValue[1]);
						textFromValue.setValue(that.dialogtype.oldValue[0]);

					}

					valuelayout = new sap.ui.commons.layout.MatrixLayout({
						columns: 2,
						widths: ["20%", "80%"]
					});
					valuelayout.createRow(labelFromValue, textFromValue);
					valuelayout.createRow(labelToValue, textToValue);
				}

				var scrollTriggerEvent = true;
				if (that.hierarchyName === undefined) {
					that.oTable2.addEventDelegate({
						onAfterRendering: function() {
							//Mouse Scroll Event  
							$('.sapUiTableCtrlScr, .sapUiTableVSb').on('DOMMouseScroll mousewheel scroll', function() {
								var self = that.oTable2.$().find(".sapUiScrollBar > div:eq(0)");
								if (self[0] && self.scrollTop() && self.height()) {
									if (self[0].scrollHeight - self.scrollTop() === self.height() && scrollTriggerEvent) {
										var aStatements = [];
										var stmt;
										var sPrefix = currentSerach;
										var descriptionLabel = "";
										if (that.labelColumnName) {
											descriptionLabel = "\",\"" + that.labelColumnName + "";
										}

										if (that.isTable) {
											stmt = "SELECT \"" + that.columnName + descriptionLabel + "\" FROM (SELECT \"" + that.columnName + descriptionLabel +
												"\", ROW_NUMBER() OVER() AS ROW_NUM FROM \"" + that.packageName + "\".\"" + that.dataSourceName + "\" GROUP BY \"" + that.columnName +
												descriptionLabel + "\" ORDER BY \"" + that.columnName + "\") WHERE ROW_NUM BETWEEN " + numberOFRows +
												" AND " + (numberOFRows + that.defNumberOfRows) + " AND LOWER(\"" + that.columnName + "\") like LOWER(\'%" + sPrefix + "%\')";

										} else {
											stmt = "SELECT \"" + that.columnName + descriptionLabel + "\" FROM (SELECT \"" + that.columnName + descriptionLabel +
												"\", ROW_NUMBER() OVER() AS ROW_NUM FROM  \"_SYS_BIC\".\"" + that.dataSourceName + "\" GROUP BY \"" + that.columnName +
												"\"  ORDER BY \"" + that.columnName + descriptionLabel + "\") WHERE ROW_NUM BETWEEN " + numberOFRows +
												" AND " + (numberOFRows + that.defNumberOfRows) + " AND LOWER(\"" + that.columnName + "\") like LOWER(\'%" + sPrefix + "%\')";
										}

										aStatements.push({
											statement: encodeURI(stmt),
											type: "SELECT"
										});
										//var maxResult = 100;
										//var viewEntity = that.context.service.catalogDAO.sqlMultiExecute(aStatements, that.defNumberOfRows, callbackresults2);

									}
								}
							});
						}
					});
					var callbackresults2 = function(result) {

						that.oTable2.setBusy(true);
						var tableModel = that.oTable2.getModel();
						var tableData = tableModel.getData();

						if (result.responses[0].result.entries && result.responses[0].result.entries.length > 0) {

							var isDate = that._isDateTypeColumn(result.responses[0].result.metadata[0].typeName);
							for (var i = 0; i < result.responses[0].result.entries.length; i++) {
							    var value = result.responses[0].result.entries[i][0];
							if (isDate) {
								value = that._DateToFormatedString(value);
							}
								tableData.modelData.push({
									value: value,
									description: (result.responses[0].result.entries[i][1] !== undefined) ? result.responses[0].result.entries[i][1] : ""
								});

							}

							numberOFRows = that.defNumberOfRows + numberOFRows;

						}
						if (result.responses[0].result.errorCode) {
							logger.writeErrorMessage(result.responses[0].result.message);
						}

						if (result.responses[0].result.entries.length < that.defNumberOfRows) {
							scrollTriggerEvent = false;
						}

						that.oTable2.bindRows("/modelData");
						that.oTable2.setBusy(false);
					};
				}

				//adding list box to layout
				loMatrix.createRow(that.oTable2);
				//adding list box to layout
				loMatrix.createRow(valuelayout);
				//adding ok and Cancel layour
				dialog.addButton(loButtonOK);
				dialog.addButton(loButtonCancel);
				//initial loading top 100 values the data 
				if (that.hierarchyName === undefined) {
					updateList("");
				}
				//opeing the dailog 
				dialog.open();
			},

			_DateToFormatedString: function(data) {
				try {
				    var that=this;
					//2011-03-04 04:05:07.0 requied formate (YYYY-MM-DD HH-mm-ss.ms)
                    data.replace(" ", "");//remove white space 
					if (data.length <= 10) { //checking its dd:mm::yyyy or dd:mm:yyyy hh::MM
						var char = data.indexOf('-') === -1 ?  data.indexOf('/') === -1?".":'/' : '-'; //checkingg dd-mm-yyyy or dd.mm.yyyy
						var arr = data.split(char);
						if (arr.length > 2) {
							if (arr[0].length <= 2) {
								return (arr[1] + "-" + arr[0] + "-" + arr[2]);
							}
						} 
                        return  that._replaceALL(data);
					
					} else {
						var date = new Date(data);
						data = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() +
							":" +
							date.getSeconds() + "." + date.getMilliseconds();
						return data;
					}

				} catch (err) {
					return data;
				}
			},
			_isDateTypeColumn : function(type){
			    if(type === "DATE" || type === "SECONDDATE"){
			        return true;
			    }
			    return false;
			},
			_replaceALL: function(str) {
				return str.replace(/\./g, "-");
			}

		};
		return ValueHelpDialogForVariable;
	});
