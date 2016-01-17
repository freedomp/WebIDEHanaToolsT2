/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
		[
		 "../../util/ResourceLoader",
		 "../../../hdbcalculationview/base/modelbase",
		 "../../model/commands",
		 "../CDSEditorUtil",
		 "../../../hdbcalculationview/view/calculatedcolumn/ExpressionDetails",
		 "../../../../common/expressioneditor/calcengineexpressioneditor/CalcEngineExpressionEditor",
		 "../../../hdbcalculationview/dialogs/NewFindDialog",
		 "../../../hdbcalculationview/base/MetadataServices"
		 ],
		 function(ResourceLoader, modelbase, commands, CDSEditorUtil,
				 ExpressionDetails, CalcEngineExpressionEditor,
				 NewFindDialog, MetadataServices
		 ) {
			"use strict";

			var resourceLoader = new ResourceLoader(
			"/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");

			/*
			 * @class
			 */
			var AssociationsPane = function(parameters) {
				this._model = parameters.model;
				this._entity = parameters.entity;
				this._undoManager = parameters.undoManager;
				this.context = parameters.context;
			};

			AssociationsPane.prototype = {

					_execute : function(command) {
						return this._undoManager.execute(command);
					},

					getContent : function(jsonModel) {
						var that = this;
						var associationTable = this._createTable("txt_no_columns",
								"/", "associations", 1, jsonModel);

						var columnsToolbar = associationTable.getToolbar();

						var addButton = new sap.ui.commons.Button({
							icon : "sap-icon://add",
							tooltip : resourceLoader.getText("tol_add"),
							press : function(oevent) {
								var associationAttributes = {
										objectAttributes : {}
								};

								var allEntities = CDSEditorUtil
								.getAllEntityNames(that._model.root);
								var initialTargetEntity;
								if (allEntities.length > 0) {
									for (var i = 0; i < allEntities.length; i++) {
										if (that._entity.name !== allEntities[i]) {
											initialTargetEntity = allEntities[i];
											break;
										}
									}
								}
								associationAttributes.name = CDSEditorUtil
								.getUniqueNameForElement("association",
										that._entity, [ "association" ]);
								associationAttributes.srcCardinality = "";
								associationAttributes.cardinality = "[0..1]";
								associationAttributes.type = "Managed";
								associationAttributes.associationKeys = [];
								associationAttributes.targetEntityName = "";
								associationAttributes.sourceEntity = that._entity;
								associationAttributes.onCondition = "";

								var entityFullPath = CDSEditorUtil
								.getFullPathFromCDSObject(that._entity,
										that._model.root.name);
								that._execute(new commands.AddAssociationCommand(
										that._entity.name, entityFullPath,
										associationAttributes));
							}

						});

						var deleteButton = new sap.ui.commons.Button(
								{
									icon : "sap-icon://delete",
									tooltip : resourceLoader.getText("tol_remove"),
									press : function(oevent) {
										var removeCommands = [];
										var indices = associationTable
										.getSelectedIndices();
										for (var i = 0; i < indices.length; i++) {
											var index = indices[i];
											var assoObject = associationTable
											.getBinding().oList[index];
											if (assoObject) {
												var entityFullPath = CDSEditorUtil
												.getFullPathFromCDSObject(
														that._entity,
														that._model.root.name);
												removeCommands
												.push(new commands.RemoveAssociationCommand(
														that._entity.name,
														entityFullPath,
														assoObject.name));
											}
										}
										if (removeCommands.length > 0) {
											that
											._execute(new modelbase.CompoundCommand(
													removeCommands));
											// reset selection
											associationTable.setSelectedIndex(-1);
										}

									}
								});

						columnsToolbar.addItem(addButton);
						columnsToolbar.addItem(deleteButton);

						var enableButtons = function() {
							var indices = associationTable.getSelectedIndices();
							var isEmpty = indices.length <= 0;
							var containsFirst = true;
							var containsLast = true;
							if (!isEmpty) {
								var numberOfRows = (associationTable.getBinding()
										.getLength() ? associationTable
												.getBinding().getLength() : 0);
								containsFirst = indices[0] === 0;
								var lastIndex = indices[indices.length - 1];
								containsLast = lastIndex >= numberOfRows - 1;
							}
							/*
							 * if (containsFirst) { moveUpButton.setEnabled(false); }
							 * else { moveUpButton.setEnabled(!isEmpty); } if
							 * (containsLast) { moveDownButton.setEnabled(false); }
							 * else { moveDownButton.setEnabled(!isEmpty); }
							 */

							if (deleteButton) {
								deleteButton.setEnabled(!isEmpty);
							}

						};

						associationTable.attachRowSelectionChange(enableButtons
								.bind(null, 0));
						enableButtons();

						this._addColumns(associationTable);

						return associationTable;
					},

					_createTable : function(noDataText, tableBindingPath,
							tableRowsBindingPath, fixedColumn, jsonModel) {
						var toolbar = new sap.ui.commons.Toolbar() /* .addStyleClass("parameterToolbarStyle") */;
						var table = new sap.ui.table.Table(
								{
									selectionMode : sap.ui.table.SelectionMode.Multiple,
									selectionBehavior : sap.ui.table.SelectionBehavior.RowOnly,
									navigationMode : sap.ui.table.NavigationMode.Scrollbar,
									visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Auto,
									noData : new sap.ui.commons.TextView({
										text : resourceLoader.getText(noDataText)
									}),
									enableColumnReordering : false,
									columnHeaderVisible : true,
									// fixedColumnCount: fixedColumn,
									minAutoRowCount : 1,
									toolbar : toolbar,
									width : "100%"
								});
						table.bindRows(tableRowsBindingPath);

						return table;
					},

					_addColumns : function(associationTable, jsonModel) {
						var that = this;

						var changeName = function(event) {
							var valueField = event.getSource();

							// var viewNodeName =
							// associationTable.getBindingContext().getObject().name;
							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							// validate column name against invalid character entry
							// and duplicate name
							var regexPattern = /^(")?[_a-zA-Z]+[_a-zA-Z0-9]*\1$/;
							var keysArray = that._entity.elements._keys;

							if (value.trim() === "") {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "Empty");
							} else if (!regexPattern.test(value)) {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "InvalidChar");
							} else if (keysArray.indexOf(value) > -1) {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "Duplicate");
							} else {
								event.getSource().setValueState(
										sap.ui.core.ValueState.None);
								var props = CDSEditorUtil
								.createModelForAssociationAttributes();
								props.name = value;
								props.cardinality = "[0..1]";
								var entityFullPath = CDSEditorUtil
								.getFullPathFromCDSObject(that._entity,
										that._model.root.name);
								var command = new commands.ChangeAssociationPropertiesCommand(
										that._entity.name, entityFullPath,
										elementModel.oldName, props, "Name");
								that._execute(command);
							}
						};

						// association name column
						associationTable
						.addColumn(new sap.ui.table.Column(
								{
									// label:
									// resourceLoader.getText("tit_name"),
									label : new sap.ui.commons.Label(
											{
												width : "100%",
												design : sap.ui.commons.LabelDesign.Bold,
												wrapping : true,
												//textAlign : sap.ui.core.TextAlign.Center,
												text : resourceLoader
												.getText("tit_name")
											}),
											template : new sap.ui.commons.TextField(
													{
														change : changeName,
														tooltip : "{name}",
														value : "{name}"
													})
								.addEventDelegate({
									onsapfocusleave : function(
											event) {
										// event handler when
										// focus leaves the text
										// field
										var rows = associationTable
										.getRows();
										for (var i = 0; i < rows.length; i++) {
											rows[i].getCells()[0]
											.setValueState(sap.ui.core.ValueState.None);
										}
									}
								}),
								width : "15%"
								}));

						var changeSourceCardinality = function(event) {
							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var associationModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var props = CDSEditorUtil
							.createModelForAssociationAttributes();
							props = {};
							props.srcCardinality = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name);
							var command = new commands.ChangeAssociationPropertiesCommand(
									that._entity.name, entityFullPath,
									associationModel.oldName, props,
							"SrcCardinality");
							that._execute(command);
						};

						// column to define source max cardinality of association
						var cardinalityItemTemplate = new sap.ui.core.ListItem();
						cardinalityItemTemplate.bindProperty("text", "cardinality");

						var cardinalityTemplate = new sap.ui.commons.DropdownBox({
							value : "{selectedSrcCardinality}",
							change : changeSourceCardinality
						});

						associationTable.addColumn(new sap.ui.table.Column(
								{
									label : new sap.ui.commons.Label({
										width : "100%",
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_src_cardinality")
									}),
									template : cardinalityTemplate.bindItems(
											"srcCardinalityArray",
											cardinalityItemTemplate),
											width : "10%"
								}));

						var changeTargetCardinality = function(event) {
							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var associationModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var props = CDSEditorUtil
							.createModelForAssociationAttributes();
							props = {};
							props.cardinality = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name);
							var command = new commands.ChangeAssociationPropertiesCommand(
									that._entity.name, entityFullPath,
									associationModel.oldName, props, "Cardinality");
							that._execute(command);
						};

						// column to define target cardinality of association
						var cardinalityItemTemplate = new sap.ui.core.ListItem();
						cardinalityItemTemplate.bindProperty("text", "cardinality");

						var cardinalityTemplate = new sap.ui.commons.DropdownBox({
							value : "{selectedCardinality}",
							change : changeTargetCardinality
						});

						associationTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label({
								width : "100%",
								design : sap.ui.commons.LabelDesign.Bold,
								wrapping : true,
								//textAlign : sap.ui.core.TextAlign.Center,
								text : resourceLoader
								.getText("tit_target_cardinality")
							}),
							template : cardinalityTemplate.bindItems(
									"cardinalityArray", cardinalityItemTemplate),
									width : "10%"
						}));

						var changeTargetEntity = function(event) {
							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var associationModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							if (value === resourceLoader.getText("txt_other")) {
								var associationBindingContext = event.getSource()
								.getBindingContext();
								// open the find and add dialog to add external
								// entities
								var dialog = that
								.createFindAndAddDialog(event,
										associationTable,
										associationBindingContext);
								// dialog.open();

							} else {
								var props = CDSEditorUtil
								.createModelForAssociationAttributes();
								props = {};
								var entityName = value.substring(value.lastIndexOf(".") + 1);
								props.targetEntity = CDSEditorUtil.getSelectedTargetEntity(associationModel.target, entityName);
								props.targetEntityName = value;
								props.onCondition = undefined;

								var entityFullPath = CDSEditorUtil
								.getFullPathFromCDSObject(that._entity,
										that._model.root.name);
								var command = new commands.ChangeAssociationPropertiesCommand(
										that._entity.name, entityFullPath,
										associationModel.oldName, props,
								"TargetEntity");
								that._execute(command);

								// destroy the dialog for selecting attributes and
								// reset property in the model
								associationModel.selectedAttributes = [];
								associationModel.attributes = [];
								if (sap.ui.getCore().byId("SelectAttrDialog")) {
									sap.ui.getCore().byId("SelectAttrDialog")
									.destroy();
								}
							}
						};

						// column to select target entity of association
						var targetItemTemplate = new sap.ui.core.ListItem();
						targetItemTemplate.bindProperty("text",
								{
							parts : [ {
								path : "entityFullPath"
							} ],
							formatter : function(selEntityFullPath) {
								if (selEntityFullPath === resourceLoader.getText("txt_other")) {
									return selEntityFullPath;
								} else {
									var dotFulString = selEntityFullPath
									.replace(/\//g, ".");
									var rootNameRemoved = dotFulString
									.substring(dotFulString
											.indexOf(".") + 1);
									return rootNameRemoved;
								}
							}
								});
						/*targetItemTemplate.bindAggregation("customData", {
							parts : [{
								path : "entity"
							}],
							formatter : function(entityObj){
								return entityObj;
							}
						});*/
						targetItemTemplate.data("EntityObj", "{/entity}");
						targetItemTemplate.data("EntityObj2", "{entity}");
						/*
						 * targetItemTemplate.bindProperty("key", { parts: [{ path:
						 * "entityFullPath" }], formatter:
						 * function(selEntityFullPath) { if (selEntityFullPath ===
						 * "Other..") { return selEntityFullPath; } else { var
						 * dotFulString = selEntityFullPath.replace(/\//g, "."); var
						 * rootNameRemoved =
						 * dotFulString.substring(dotFulString.indexOf(".") + 1);
						 * return rootNameRemoved; } } });
						 */

						var targetTemplate = new sap.ui.commons.ComboBox({
							value : "{targetEntityName}",
							change : changeTargetEntity
						});

						associationTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label({
								width : "100%",
								design : sap.ui.commons.LabelDesign.Bold,
								wrapping : true,
								//textAlign : sap.ui.core.TextAlign.Center,
								text : resourceLoader.getText("tit_target_entity")
							}),
							template : targetTemplate.bindItems("target",
									targetItemTemplate),
									width : "15%"
						}));

						var changeAssociationType = function(event) {
							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var associationModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var props = CDSEditorUtil
							.createModelForAssociationAttributes();
							props = {};
							props.type = value;
							props.onCondition = undefined;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name);
							var command = new commands.ChangeAssociationPropertiesCommand(
									that._entity.name, entityFullPath,
									associationModel.oldName, props,
							"AssociationType");
							that._execute(command);
						};

						// association type column
						associationTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label({
								width : "100%",
								design : sap.ui.commons.LabelDesign.Bold,
								wrapping : true,
								//textAlign : sap.ui.core.TextAlign.Center,
								text : resourceLoader.getText("tit_asso_type")
							}),
							width : "10%",
							template : new sap.ui.commons.DropdownBox({
								selectedKey : "managed",
								items : [ new sap.ui.core.ListItem({
									text : resourceLoader.getText("txt_managed"),
									enabled : true,
									key : "managed"
								}), new sap.ui.core.ListItem({
									text : resourceLoader.getText("txt_unmanaged"),
									enabled : true,
									key : "unmanaged"
								}) ],
								value : "{type}",
								change : changeAssociationType
							}).bindProperty("enabled", "targetEntityName",
									function(selectedTargetEntity) {
								if (selectedTargetEntity !== "") {
									return true;
								} else {
									return false;
								}
							})
						}));

						// keys column
						var row = new sap.ui.commons.layout.MatrixLayoutRow(
								{
									cells : [
									         new sap.ui.commons.layout.MatrixLayoutCell(
									        		 {
									        			 vAlign : sap.ui.commons.layout.VAlign.Bottom,
									        			 padding : sap.ui.commons.layout.Padding.None,
									        			 content : [ new sap.ui.commons.TextView(
									        					 {
									        						 enabled : true,
									        						 wrapping : false
									        					 })
									        			 .bindText(
									        					 "attributes",
									        					 function(
									        							 allAttributes) {
									        						 var selectedAttributes = [];
									        						 if (allAttributes) {
									        							 for (var j = 0; j < allAttributes.length; j++) {
									        								 if (allAttributes[j].isSelected) {
									        									 selectedAttributes
									        									 .push(allAttributes[j].name);
									        								 }
									        							 }
									        						 }
									        						 return selectedAttributes
									        						 .join(", ");
									        					 })
									        					 .bindProperty(
									        							 "enabled",
									        							 {
									        								 parts : [
									        								          {
									        								        	  path : "targetEntityName"
									        								          },
									        								          {
									        								        	  path : "type"
									        								          } ],
									        								          formatter : function(
									        								        		  selectedTargetEntity,
									        								        		  type) {
									        								        	  if (selectedTargetEntity !== "") {
									        								        		  if (type === resourceLoader
									        								        				  .getText("txt_managed")) {
									        								        			  return true;
									        								        		  } else {
									        								        			  return false;
									        								        		  }
									        								        	  } else {
									        								        		  return false;
									        								        	  }
									        								          }
									        							 }) ]
									        		 }),
									        		 new sap.ui.commons.layout.MatrixLayoutCell(
									        				 {
									        					 vAlign : sap.ui.commons.layout.VAlign.Bottom,
									        					 padding : sap.ui.commons.layout.Padding.None,
									        					 content : [ new sap.ui.commons.Button(
									        							 {
									        								 icon : "sap-icon://overflow",
									        								 press : function(
									        										 event) {
									        									 var associationBindingContext = event
									        									 .getSource()
									        									 .getBindingContext();
									        									 var dialog = that
									        									 .createKeySelectionDialog(
									        											 associationTable,
									        											 associationBindingContext);
									        									 dialog
									        									 .open();
									        								 }
									        							 })
									        					 .bindProperty(
									        							 "enabled",
									        							 {
									        								 parts : [
									        								          {
									        								        	  path : "targetEntityName"
									        								          },
									        								          {
									        								        	  path : "type"
									        								          } ],
									        								          formatter : function(
									        								        		  selectedTargetEntity,
									        								        		  type) {
									        								        	  if (selectedTargetEntity !== "") {
									        								        		  if (type === resourceLoader
									        								        				  .getText("txt_managed")) {
									        								        			  return true;
									        								        		  } else {
									        								        			  return false;
									        								        		  }
									        								        	  } else {
									        								        		  return false;
									        								        	  }
									        								          }
									        							 }) ]
									        				 }) ]
								});
						// keys column
						var associationKeysTemplate = new sap.ui.commons.layout.MatrixLayout(
								{
									layoutFixed : true,
									columns : 2,
									widths : [ "80%", "20%" ]
								});
						associationKeysTemplate.addRow(row);

						associationTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label({
								width : "100%",
								design : sap.ui.commons.LabelDesign.Bold,
								wrapping : true,
								//textAlign : sap.ui.core.TextAlign.Center,
								text : resourceLoader.getText("tit_keys")
							}),
							template : associationKeysTemplate,
							width : "20%"
						}));

						// join column
						var row = new sap.ui.commons.layout.MatrixLayoutRow(
								{
									cells : [
									         new sap.ui.commons.layout.MatrixLayoutCell(
									        		 {
									        			 vAlign : sap.ui.commons.layout.VAlign.Bottom,
									        			 content : [ new sap.ui.commons.TextView(
									        					 {
									        						 enabled : true,
									        						 wrapping : false
									        					 })
									        			 .bindText(
									        					 "onCondition",
									        					 function(
									        							 onCondition) {
									        						 if (onCondition) {
									        							 return onCondition;
									        						 } else {
									        							 return "";
									        						 }
									        					 })
									        					 .bindProperty(
									        							 "enabled",
									        							 {
									        								 parts : [
									        								          {
									        								        	  path : "targetEntityName"
									        								          },
									        								          {
									        								        	  path : "type"
									        								          } ],
									        								          formatter : function(
									        								        		  selectedTargetEntity,
									        								        		  type) {
									        								        	  if (selectedTargetEntity !== "") {
									        								        		  if (type === resourceLoader
									        								        				  .getText("txt_unmanaged")) {
									        								        			  return true;
									        								        		  } else {
									        								        			  return false;
									        								        		  }
									        								        	  } else {
									        								        		  return false;
									        								        	  }
									        								          }
									        							 }) ]
									        		 }),
									        		 new sap.ui.commons.layout.MatrixLayoutCell(
									        				 {
									        					 vAlign : sap.ui.commons.layout.VAlign.Bottom,
									        					 content : [ new sap.ui.commons.Button(
									        							 {
									        								 icon : "sap-icon://syntax",
									        								 press : function(
									        										 event) {
									        									 var associationBindingContext = event
									        									 .getSource()
									        									 .getBindingContext();
									        									 var dialog = that
									        									 .createExpressionEditorDialog(
									        											 associationTable,
									        											 associationBindingContext);
									        									 dialog
									        									 .open();
									        								 }
									        							 })
									        					 .bindProperty(
									        							 "enabled",
									        							 {
									        								 parts : [
									        								          {
									        								        	  path : "targetEntityName"
									        								          },
									        								          {
									        								        	  path : "type"
									        								          } ],
									        								          formatter : function(
									        								        		  selectedTargetEntity,
									        								        		  type) {
									        								        	  if (selectedTargetEntity !== "") {
									        								        		  if (type === resourceLoader
									        								        				  .getText("txt_unmanaged")) {
									        								        			  return true;
									        								        		  } else {
									        								        			  return false;
									        								        		  }
									        								        	  } else {
									        								        		  return false;
									        								        	  }
									        								          }
									        							 }) ]
									        				 }) ]
								});
						// on condition column
						var onConditionTemplate = new sap.ui.commons.layout.MatrixLayout(
								{
									layoutFixed : true,
									columns : 2,
									widths : [ "80%", "20%" ]
								});
						onConditionTemplate.addRow(row);

						associationTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label({
								width : "100%",
								design : sap.ui.commons.LabelDesign.Bold,
								wrapping : true,
								//textAlign : sap.ui.core.TextAlign.Center,
								text : resourceLoader.getText("tit_on_condition")
							}),
							template : onConditionTemplate,
							width : "20%"
						}));
					},

					createKeySelectionDialog : function(associationTable,
							associationBindingContext) {
						var self = this;
						var mod = associationTable.getModel();
						var bindPath = associationBindingContext.sPath;
						var dialog = sap.ui.getCore().byId("SelectAttrDialog");

						if (!dialog) {
							var keysTable = new sap.ui.table.Table(
									{
										selectionMode : sap.ui.table.SelectionMode.Multiple,
										selectionBehavior : sap.ui.table.SelectionBehavior.RowOnly,
										navigationMode : sap.ui.table.NavigationMode.Scrollbar,
										visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Interactive,
										noData : new sap.ui.commons.TextView(
												{
													text : resourceLoader.getText("msg_no_keys_available")
												}),
												columnHeaderVisible : true,
												// fixedColumnCount: 1,
												minAutoRowCount : 1,
												// width: "70%",
												height : "70%"
									});

							keysTable.setModel(mod);
							keysTable.bindRows(bindPath + "/attributes");

							keysTable.addColumn(new sap.ui.table.Column({
								label : "",
								width : "10%",
								template : new sap.ui.commons.CheckBox({
									checked : "{isSelected}"
								})
							}));

							/*keysTable.addColumn(new sap.ui.table.Column({
								label : resourceLoader.getText("tit_name"),
								width : "45%",
								template : new sap.ui.commons.TextView({
									text : "{name}"
								})
							}));*/

							keysTable.addColumn(new sap.ui.table.Column({
								label : resourceLoader.getText("tit_name"),
								width : "45%",
								template : new sap.ui.layout.HorizontalLayout({
									content : [new sap.ui.commons.Image().bindProperty("src", "element", function(element){
										if(element){
											if(element.key === true){
												return resourceLoader.getImagePath("KeyAttribute.png");
											} else{
												return resourceLoader.getImagePath("Empty.png");
											}
										}
									}),
									new sap.ui.commons.TextView({
										text : "{name}"
									})]
								})
							}));


							keysTable.addColumn(new sap.ui.table.Column({
								label : resourceLoader.getText("tit_alias"),
								width : "45%",
								template : new sap.ui.commons.TextField({
									value : "{alias}"
								})
							}));

							var okButton = new sap.ui.commons.Button(
									{
										text : resourceLoader.getText("txt_ok"),
										style : sap.ui.commons.ButtonStyle.Emph,
										press : function(event) {
											self
											._changeSelectedAttributes(associationBindingContext);
											dialog.close();
										}
									})
							/*
							 * .bindProperty("enabled", bindPath + "/attributes",
							 * function(attributesArray) { var isKeySelected =
							 * false; if (attributesArray && attributesArray.length >
							 * 0) { for (var i = 0; i < attributesArray.length; i++) {
							 * var currentAttr = attributesArray[i]; if
							 * (currentAttr.isSelected) { isKeySelected = true;
							 * break; } } } return isKeySelected; })
							 */
							.addStyleClass("calcCreateBtn");

							okButton.setModel(mod);

							var cancelButton = new sap.ui.commons.Button({
								text : resourceLoader.getText("txt_cancel"),
								style : sap.ui.commons.ButtonStyle.Emph,
								enabled : true,
								press : function(event) {
									dialog.close();
								}
							}).addStyleClass("calcCancelBtn");

							dialog = new sap.ui.commons.Dialog(
									"SelectAttrDialog",
									{
										title : resourceLoader
										.getText("tit_select_key_columns"),
										applyContentPadding : true,
										showCloseButton : false,
										resizable : false,
										contentBorderDesign : sap.ui.commons.enums.BorderDesign.Thik,
										modal : true,
										accessibleRole : sap.ui.core.AccessibleRole.Dialog,
										content : keysTable,
										buttons : [ okButton, cancelButton ],
										defaultButton : okButton,
										keepInWindow : true,
										width : "80%",
										closed : function(event) {
											dialog.destroy();
											associationTable.rerender();
										}
									});
						}

						return dialog;
					},

					_changeSelectedAttributes : function(associationBindingContext) {
						// var bindingContext = okButton.getBindingContext();
						var associationModel = associationBindingContext
						.getObject();

						var props = CDSEditorUtil
						.createModelForAssociationAttributes();
						props = {};
						props.attributes = associationModel.attributes;

						var entityFullPath = CDSEditorUtil
						.getFullPathFromCDSObject(this._entity,
								this._model.root.name);
						var command = new commands.ChangeAssociationPropertiesCommand(
								this._entity.name, entityFullPath,
								associationModel.oldName, props, "Attributes");
						this._execute(command);
					},

					createExpressionEditorDialog : function(associationTable,
							associationBindingContext) {
						var self = this;
						var mod = associationTable.getModel();
						var bindPath = associationBindingContext.sPath;
						var dialog = sap.ui.getCore().byId("ExprEditorDialog");
						this.elementModel = new sap.ui.model.json.JSONModel();
						this.operatorModel = new sap.ui.model.json.JSONModel();

						if (!dialog) {
							var model = CDSEditorUtil.createElementModel(mod
									.getProperty(bindPath));
							var operatordata = CDSEditorUtil.createOperatorData();

							this.elementModel.setData(model);
							this.operatorModel.setData(operatordata);

							this._expressionEditor = CalcEngineExpressionEditor
							.createExpressionEditor(false, true, true);
							this._expressionEditor.setModel(mod);
							this._expressionEditor.bindContext(bindPath
									+ "/onCondition");

							this._expressionEditor.setLanguage("abcd");
							this._expressionEditor
							.setLanguageSelectionEnabled(false);
							this._expressionEditor.setHideValidateButton(true);

							var filterExpr = mod.getProperty(bindPath
									+ "/onCondition");
							self._expressionEditor.setExpression(filterExpr);

							this._expressionEditor
							.setElementModel(this.elementModel);
							this._expressionEditor
							.setOperatorModel(this.operatorModel);

							// this.setExpression(this.element);

							/*
							 * var textArea = new sap.ui.commons.TextArea({ height:
							 * "70%", width: "100%", wrapping:
							 * sap.ui.core.Wrapping.Soft }); textArea.setModel(mod);
							 * textArea.bindValue(bindPath + "/onCondition");
							 */

							var okButton = new sap.ui.commons.Button({
								text : resourceLoader.getText("txt_ok"),
								style : sap.ui.commons.ButtonStyle.Emph,
								press : function(event) {
									var filterExpression = self._expressionEditor
									.getExpression();
									self._changeOnCondition(
											associationBindingContext,
											filterExpression);
									dialog.close();
								}
							}).addStyleClass("calcCreateBtn");

							okButton.setModel(mod);

							var cancelButton = new sap.ui.commons.Button({
								text : resourceLoader.getText("txt_cancel"),
								style : sap.ui.commons.ButtonStyle.Emph,
								enabled : true,
								press : function(event) {
									dialog.close();
								}
							}).addStyleClass("calcCancelBtn");

							dialog = new sap.ui.commons.Dialog(
									"ExprEditorDialog",
									{
										title : resourceLoader
										.getText("tit_on_condition_editor"),
										applyContentPadding : true,
										showCloseButton : false,
										resizable : false,
										contentBorderDesign : sap.ui.commons.enums.BorderDesign.Thik,
										modal : true,
										accessibleRole : sap.ui.core.AccessibleRole.Dialog,
										content : this._expressionEditor,
										buttons : [ okButton, cancelButton ],
										defaultButton : okButton,
										keepInWindow : true,
										width : "80%",
										height : "70%",
										closed : function(event) {
											dialog.destroy();
											associationTable.rerender();
										}
									});
						}

						return dialog;
					},

					_changeOnCondition : function(associationBindingContext,
							expression) {
						// var bindingContext = okButton.getBindingContext();
						var associationModel = associationBindingContext
						.getObject();
						associationModel.onCondition = expression;

						var props = CDSEditorUtil
						.createModelForAssociationAttributes();
						props = {};
						props.onCondition = associationModel.onCondition;

						var entityFullPath = CDSEditorUtil
						.getFullPathFromCDSObject(this._entity,
								this._model.root.name);
						var command = new commands.ChangeAssociationPropertiesCommand(
								this._entity.name, entityFullPath,
								associationModel.oldName, props, "OnCondition");
						this._execute(command);
					},

					createFindAndAddDialog : function(event, associationTable,
							associationBindingContext) {
						var self = this;
						var mod = associationTable.getModel();
						var bindPath = associationBindingContext.sPath;

						var changedComboBox = event.getSource();

						var entitiesTable;
						var dialog = sap.ui.getCore().byId("FindNAddDialog");

						if (!dialog) {
							var objectTypes = [ "CALCULATIONVIEW", "TABLE", "VIEW",
							                    "ANALYTICVIEW", "ATTRIBUTEVIEW",
							                    "hdbtablefunction", "CALCULATIONVIEW_HISTORY",
							                    "DATA_BASE_TABLE" ];

							dialog = new NewFindDialog(
									"FindNAddDialog",
									{
										types : objectTypes,
										noOfSelection : 1,
										context : this.context, // oParam.editor.extensionParam.builder._context,
										onOK : function(results) {
											var targetEntityPath = "test.cds::HelloWorld.E";
											// var targetEntityPath =
											// model.getProperty("/selectedEntityPath");
											if (targetEntityPath) {
												var targetEntityName = targetEntityPath
												.substring(targetEntityPath
														.lastIndexOf("::") + 2);
												changedComboBox
												.setValue(targetEntityName);
											}

											var metadataDetailService = MetadataServices.MetadataDetails;
											metadataDetailService
											.getDetails(
													targetEntityPath,
													this.context.serviceName,
													function(result) {
														var jsonResult = JSON
														.parse(result); // this
														// jsonResult
														// should
														// give
														// me
														// the
														// list
														// of
														// elements
														// for
														// selected
														// entity
														self
														.setSelectedTargetEntity(
																associationBindingContext,
																targetEntityPath,
																jsonResult);

													}, function(err) {
													});
										}
									});


							/*
							 * entitiesTable = new sap.ui.table.Table({
							 * selectionMode: sap.ui.table.SelectionMode.Single,
							 * selectionBehavior:
							 * sap.ui.table.SelectionBehavior.RowOnly,
							 * navigationMode:
							 * sap.ui.table.NavigationMode.Scrollbar,
							 * visibleRowCountMode:
							 * sap.ui.table.VisibleRowCountMode.Interactive, noData:
							 * new sap.ui.commons.TextView({ text:
							 * resourceLoader.getText("msg_no_keys_available") }),
							 * columnHeaderVisible: true, //fixedColumnCount: 1,
							 * minAutoRowCount: 1, // width: "70%", height: "70%",
							 * rowSelectionChange: function(event) {
							 *  } });
							 * 
							 * var model = new sap.ui.model.json.JSONModel();
							 * entitiesTable.setModel(model); model.setData({
							 * externalEntities: [ ] });
							 * entitiesTable.bindRows("/externalEntities");
							 * 
							 * entitiesTable.addColumn(new sap.ui.table.Column({
							 * label: "", width: "100%", template: new
							 * sap.ui.commons.TextField({ value: "{fullPath}" })
							 * }));
							 * 
							 * var okButton = new sap.ui.commons.Button({ text:
							 * resourceLoader.getText("txt_ok"), style:
							 * sap.ui.commons.ButtonStyle.Emph, press:
							 * function(event) { var selIndex =
							 * entitiesTable.getSelectedIndex(); var selRow =
							 * entitiesTable.getRows()[selIndex]; //var
							 * selectedRowFullPath =
							 * selRow.getBindingContext().getObject().fullPath; var
							 * selectedRowFullPath = "test.cds::HelloWorld.E";
							 * model.setProperty("/selectedEntityPath",
							 * selectedRowFullPath);
							 * self.setSelectedTargetEntity(associationBindingContext,
							 * selectedRowFullPath); dialog.close(); }
							 * }).addStyleClass("calcCreateBtn");
							 * 
							 * okButton.setModel(mod);
							 * 
							 * var cancelButton = new sap.ui.commons.Button({ text:
							 * resourceLoader.getText("txt_cancel"), style:
							 * sap.ui.commons.ButtonStyle.Emph, enabled: true,
							 * press: function(event) { dialog.close(); }
							 * }).addStyleClass("calcCancelBtn");
							 * 
							 * dialog = new sap.ui.commons.Dialog("FindNAddDialog", {
							 * title: resourceLoader.getText("tit_find_n_add"),
							 * applyContentPadding: true, showCloseButton: false,
							 * resizable: false, contentBorderDesign:
							 * sap.ui.commons.enums.BorderDesign.Thik, modal: true,
							 * accessibleRole: sap.ui.core.AccessibleRole.Dialog,
							 * content: [new sap.ui.commons.SearchField({
							 * enableListSuggest: false, enableClear: true,
							 * showExternalButton: false, width: "100%", suggest:
							 * function(event) { self._getExternalEntities(model); }
							 * }), entitiesTable], buttons: [okButton,
							 * cancelButton], defaultButton: okButton, keepInWindow:
							 * true, width: "30%", height: "40%", closed:
							 * function(event) { dialog.destroy();
							 * //associationTable.rerender();
							 * 
							 * var targetEntityPath =
							 * model.getProperty("/selectedEntityPath"); if
							 * (targetEntityPath) { var targetEntityName =
							 * targetEntityPath.substring(targetEntityPath.lastIndexOf(".") +
							 * 1); changedComboBox.setValue(targetEntityName); }
							 * 
							 * //sap.ui.getCore("TargetComboBox").setValue("oooooo"); }
							 * });
							 */
						}

						return dialog;
					},

					_getExternalEntities : function(model) {
						var entities = [];
						entities.push({
							fullPath : "test.cds::HelloWorld.E",
							uri : "metadataapi/dbobjects/AM/test.cds::HelloWorld.E"
						});
						entities
						.push({
							fullPath : "test.cds::ContextWithSimpleEntity.SimpleEntity",
							uri : "metadataapi/dbobjects/AM/test.cds::ContextWithSimpleEntity.SimpleEntity"
						});
						model.setProperty("/externalEntities", entities);
						return entities;
					},

					// this function updates the ast model and cds model via calling
					// ChangeAssociation command
					setSelectedTargetEntity : function(associationBindingContext,
							targetEntityPath, jsonResult) {
						var that = this;
						var associationModel = associationBindingContext
						.getObject();

						// var targetEntityName =
						// targetEntityPath.substring(targetEntityPath.indexOf("::")
						// + 2).trim();
						var targetEntityName = targetEntityPath
						.substring(targetEntityPath.lastIndexOf(".") + 1);
						associationModel.targetEntityName = targetEntityName;

						/*
						 * //fetch attributes for this entity and set in the model
						 * associationModel.externalAttributes = [{ name: "id",
						 * alias: "", isSelected: false }, { name: "name", alias:
						 * "", isSelected: false }];
						 */

						var props = CDSEditorUtil
						.createModelForAssociationAttributes();
						props = {};
						props.targetEntityName = targetEntityPath;
						props.onCondition = undefined;
						props.externalAttributes = [ {
							name : "id",
							alias : "",
							isSelected : false
						}, {
							name : "name",
							alias : "",
							isSelected : false
						} ];

						var entityFullPath = CDSEditorUtil
						.getFullPathFromCDSObject(that._entity,
								that._model.root.name);
						var command = new commands.ChangeAssociationPropertiesCommand(
								that._entity.name, entityFullPath,
								associationModel.oldName, props,
						"ExternalTargetEntity");
						that._execute(command);

						// destroy the dialog for selecting attributes and reset
						// property in the model
						associationModel.selectedAttributes = [];
						associationModel.attributes = [];
					},

					showToolTip : function(textField, errorType) {
						var messageText = "";
						if (errorType === "Empty") {
							messageText = resourceLoader
							.getText("msg_col_name_empty");
						} else if (errorType === "Duplicate") {
							messageText = resourceLoader.getText(
									"msg_col_name_duplicate", textField.getValue());
						} else if (errorType === "InvalidChar") {
							messageText = resourceLoader
							.getText("msg_col_name_invalid_char");
						}
						var toolTipBox = new sap.ui.commons.Callout({
							atPosition : "end top"
						});
						toolTipBox
						.addContent(new sap.ui.layout.VerticalLayout(
								{
									content : [
									           new sap.ui.layout.HorizontalLayout(
									        		   {
									        			   content : [
									        			              new sap.ui.commons.Label(
									        			            		  {
									        			            			  width : "100%",
									        			            			  design : sap.ui.commons.LabelDesign.Bold,
									        			            			  icon : "sap-icon://error"
									        			            		  }),
									        			            		  new sap.ui.commons.TextView(
									        			            				  {
									        			            					  semanticColor : sap.ui.commons.TextViewColor.Negative,
									        			            					  design : sap.ui.commons.TextViewDesign.Bold,
									        			            					  text : "Invalid Column Definition"
									        			            				  }) ]
									        		   }),
									        		   new sap.ui.commons.HorizontalDivider(),
									        		   new sap.ui.commons.TextView({
									        			   text : messageText
									        		   }) ]
								}));
						toolTipBox.openPopup(textField);
					}

			};

			return AssociationsPane;

		});