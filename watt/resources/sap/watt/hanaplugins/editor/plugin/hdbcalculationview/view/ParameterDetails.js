/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands", "../base/modelbase", "./DetailInputParameter",
		"./ParameterExpressionEditor",
        "./ParameterManageMapping", "./VariableDetails", "../viewmodel/model", "./dialogs/ReferenceDialog", "./CalcViewEditorUtil",
		"../sharedmodel/sharedmodel"
    ],
	function(ResourceLoader, commands, modelbase, DetailInputParameter, ParameterExpressionEditor, ParameterManageMapping,
		VariableDetails, model, ReferenceDialog, CalcViewEditorUtil, sharedmodel) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var ParameterDetails = function(attributes) {
			this.list;
			this.customListItem;
			this.parameterListTable;
			this.mainLayout;
			this.splitter;
			this.mappingContent;
			this.stackLayoutCell;
			this.model = attributes.model;
			this.viewNode = attributes.viewNode;
			this.isSemanticsNode = attributes.isSemanticsNode;
			this.undoManager = attributes.undomanager;
			this.context = attributes.context;
			this.parameters = this.model.columnView.parameters;
			this.creatingNew = false;
			this.parameterManageMapping;
			this.selectedParameter;
			this.parameterModel;
			this.table;
			this.toolBar;

		}

		ParameterDetails.prototype = {
			_execute: function(command) {
				if (command instanceof Array) {
					return this.undoManager.execute(new modelbase.CompoundCommand(command));
				} else {
					return this.undoManager.execute(command);
				}
			},
			getContent: function() {
				this.mainLayout = new sap.ui.commons.layout.VerticalLayout({
					// widths: "100%",
					height: "100%",
					width: "100%"
				}).addStyleClass("masterDetailsMainDiv");
				this.splitter = new sap.ui.commons.Splitter({
					showScrollBars: true,
					splitterBarVisible: true,
					splitterOrientation: sap.ui.core.Orientation.Vertical,
					minSizeFirstPane: "20%",
					splitterPosition: "30%"
				}).addStyleClass("masterDetailsSplitter");

				this.splitter.addFirstPaneContent(this.getMasterListContent());

				// var masterContent = this.getMasterListContent();
				//    this.mainLayout.createRow(masterContent);
				//    this.mainLayout.addStyleClass("sapUiSizeCompact");
				//  this.mainLayout.addStyleClass("layoutHeight");
				var mainMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
				var mainMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow();
				this.stackLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell();
				mainMatrixRow.addCell(this.stackLayoutCell);
				mainMatrixLayout.addRow(mainMatrixRow);
				this.stackLayoutCell.addContent(this.splitter);
				this.toolBar = this.getToolBar();
				this.toolBar.setVisible(true);
				this.mainLayout.addContent(this.toolBar);
				this.mainLayout.addContent(this.splitter);

				return this.mainLayout;
			},
			getToolBar: function() {
				var that = this;
				var toolBar = new sap.ui.commons.Toolbar({
					width: "100%",
					items: []
				}).addStyleClass("parameterToolbarStyle");

				var addMenuButton = new sap.ui.commons.MenuButton({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					itemSelected: function(oevent) {
						var name = oevent.getParameter("item").getText();
						if (name === "Input parameter") {
							var newParameterName = that.getNextParameterName("IP");
							var isMandatory = false;
							if (that.viewNode && that.viewNode.type === "Script") {
								isMandatory = true;
							}
							var createCommand = new commands.AddParameterCommand({
								objectAttributes: {
									name: newParameterName,
									label: "",
									mandatory: isMandatory
								},
								typeAttributes: {
									name: newParameterName,
									primitiveType: "VARCHAR",
									length: "1"
								}
							}, newParameterName);

							// var parameter = that._execute(createCommand);

							var defaultRangeCommand = new commands.CreateParameterDefaultRangeCommand(newParameterName, {
								lowExpression: false,
								lowValue: ""
							});
							var commandsList = [];
							commandsList.push(createCommand);
							commandsList.push(defaultRangeCommand);
							that.creatingNew = true;
							that._execute(commandsList);

							that.parameterModel.setData(that.getData(that.parameters));
							that.parameterModel.updateBindings();
							that.table.setSelectedIndex(that.parameters.count() - 1);

							if (that.parameters.count() === 1) {
								that.table.fireRowSelectionChange();
							}

						} else if (name === "Variable") {
							var newVariableName = that.getNextParameterName("VAR");
							var createVariableCommand = new commands.AddParameterCommand({
								objectAttributes: {
									name: newVariableName,
									label: "",
									selectionType: "SingleValue",
									isVariable: true
								}
							}, newVariableName);

							// var variable = that._execute(createVariableCommand);

							var defaultRangeCommand = new commands.CreateParameterDefaultRangeCommand(newVariableName, {
								lowExpression: false,
								lowValue: "",
								including: true,
								operator: sharedmodel.ValueFilterOperator.EQUAL
							});
							var commandsList = [];
							commandsList.push(createVariableCommand);
							commandsList.push(defaultRangeCommand);
							that.creatingNew = true;
							that._execute(commandsList);

							that.parameterModel.setData(that.getData(that.parameters));
							that.parameterModel.updateBindings();
							that.table.setSelectedIndex(that.parameters.count() - 1);

							if (that.parameters.count() === 1) {
								that.table.fireRowSelectionChange();
							}
						}
					},
					menu: new sap.ui.commons.Menu({
						items: [new sap.ui.commons.MenuItem({
								text: "Input parameter",
								icon: resourceLoader.getImagePath("Parameter.png"),
								attachSelect: function(oevent) {}
							})
                           /* new sap.ui.commons.MenuItem({
								text: "Variable",
								icon: resourceLoader.getImagePath("variable.png"),
								attachSelect: function(oevent) {}
							})*/
                        ]
					})

				});
				var addButton = new sap.ui.commons.Button({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					//   text:"Add",
					press: function(oevent) {
						var newParameterName = that.getNextParameterName("IP");
						var isMandatory = false;
						if (that.viewNode && that.viewNode.type === "Script") {
							isMandatory = true;
						}
						var createCommand = new commands.AddParameterCommand({
							objectAttributes: {
								name: newParameterName,
								label: "",
								mandatory: isMandatory
							},
							typeAttributes: {
								name: newParameterName,
								primitiveType: "VARCHAR",
								length: "1"
							}
						}, newParameterName);
						var defaultRangeCommand = new commands.CreateParameterDefaultRangeCommand(newParameterName, {
							lowExpression: false,
							lowValue: ""
						});
						var commandsList = [];
						commandsList.push(createCommand);
						commandsList.push(defaultRangeCommand);
						that.creatingNew = true;
						that._execute(commandsList);

						// var parameter = that._execute(createCommand);
						var parametersData = that.getData(that.parameters);
						that.parameterModel.setData(parametersData);
						that.parameterModel.updateBindings();
						that.table.setSelectedIndex(parametersData.length - 1);
						if (that.parameters.count() === 1) {
							that.table.fireRowSelectionChange();
						}

					}

				});

				var deleteButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //"sap-icon://decline", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						path: " ",
						formatter: function() {
							if (that.parameterModel.getData() && that.parameterModel.getData().length > 0) {
								return true;
							} else {
								return false;
							}
						}
					},
					press: function() {
						var selectedIndex = that.table.getSelectedIndex();
						var bindContext = that.table.getContextByIndex(selectedIndex);
						if (bindContext) {
							var parameterName = bindContext.getProperty("name");
							var parameter = bindContext.getProperty("parameter");
							if (parameter) {
								var callback = function(result) {
									if (result) {
										var selectionParameter = that.parameters.getPreviousKey(parameterName);
										selectionParameter = selectionParameter ? selectionParameter : that.parameters.getNextKey(parameterName);
										var executeCommands = [];
										executeCommands.push(new modelbase.DeleteCommand(parameter, false));
										executeCommands = executeCommands.concat(that.getRemovableMappingCommands(parameter));
										that.undoManager.execute(new modelbase.CompoundCommand(executeCommands));
										// model.getData().splice(selectedIndex, 1);
										//  model.setData(that.getData(that.parameters));
										that.parameterModel.updateBindings();
										if (that.parameters.count() > 0) {
											that.table.setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : selectedIndex + 1);
										}
									}
								};
								var referenceDialog = new ReferenceDialog({
									element: [parameter],
									isRemoveCall: true,
									fnCallbackMessageBox: callback
								});
								referenceDialog.openMessageDialog();
							}
						}

					}
				});

				var manageMappingButton = new sap.ui.commons.Button({
					icon: "sap-icon://share-2",
					// text: resourceLoader.getText("txt_manage_mapping"),
					tooltip: resourceLoader.getText("txt_manage_mapping"),
					press: function(event) {
						if (!that.parameterManageMapping) {
							//jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.ParameterManageMapping");
							/*  that.parameterManageMapping = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.ParameterManageMapping({
                                model: that.model,
                                context: that.context,
                                undoManager: that.undoManager,
                                callBack: stackContent,
                            });
                            */
							that.parameterManageMapping = new ParameterManageMapping({
								model: that.model,
								context: that.context,
								undoManager: that.undoManager,
								callBack: stackContent,
								viewNode: that.viewNode
							});
							that.parameterManageMapping.getContent();
						}
						that.parameterManageMapping.update();
						that.mainLayout.removeContent(that.toolBar);
						that.mainLayout.removeContent(that.splitter);
						that.mainLayout.addContent(that.parameterManageMapping.getContent());
						//  that.stackLayoutCell.removeContent(that.splitter);
						// that.stackLayoutCell.addContent(that.parameterManageMapping.getContent());
						that.toolBar.setVisible(false);

					}
				});

				var stackContent = function(attributes) {
					that.mainLayout.removeContent(that.parameterManageMapping.getContent());
					that.mainLayout.addContent(that.toolBar);
					that.mainLayout.addContent(that.splitter);
					// that.stackLayoutCell.removeContent(that.parameterManageMapping.getContent());
					// that.stackLayoutCell.addContent(that.splitter);
					that.toolBar.setVisible(true);

				};
				if (this.isSemanticsNode || (this.viewNode && this.viewNode.type === "Script")) {
					toolBar.addItem(addMenuButton);
					toolBar.addItem(deleteButton);
				} else {
					toolBar.addItem(addButton);
					toolBar.addItem(deleteButton);
				}
				toolBar.addItem(manageMappingButton);
				toolBar.setModel(that.parameterModel);
				return toolBar;
			},
			getMasterListContent: function() {
				var that = this;

				var detailInputParameter;
				var parameterExpressionEditor;
				var variableEditor;
				var commentValue;
				var detailInputParameterContent;
				var expressionEditorContent;
				var expressionEditor;
				// Name template     
				var icon = new sap.ui.commons.Image({
					src: "{icon}"
				});
	
				
				var iconRichTooltip = new sap.ui.commons.RichTooltip({
		text : {
		parts: ["tooltip","name"],
						formatter: function(tooltip,name) {
						if(tooltip){
						    return tooltip;
						}
						return name;
						}
		},
		title: {
		parts: ["tooltip"],
						formatter: function(tooltip) {
						if(tooltip){
						    return "Quick Help";
						}
						return "";
						}
		},
		imageSrc : "{icon}"
	});
				icon.setTooltip(iconRichTooltip);
				var nameText = new sap.ui.commons.TextField({
					wrapping: true,
					editable: false,
					customData: [{
						Type: "sap.ui.core.CustomData",
						key: "colortype",
						writeToDom: true,
						value: {
							parts: [{
								path: "name"
							}, {
								path: "seq"
							}],
							formatter: function(name, seq) {
								if ((seq !== "none") && (seq !== undefined) && (seq !== null)) {
									return "highlight";
								} else {
									return "none";
								}
							}
						}
                          }, {

						Type: "sap.ui.core.CustomData",
						key: "focus",
						writeToDom: true,
						value: {
							parts: [{
								path: "focus"
							}],
							formatter: function(focus) {
								if ((focus !== "none") && (focus !== undefined) && (focus !== null)) {
								    this.getParent().getParent().getParent().setSelectedIndex(this.getParent().getParent().getIndex());
									return "focus";
								} else {
									return "none";
								}
							}
						}
                 }]
				});
				nameText.bindProperty("value", "name");

				// Label template    
				var labelText = new sap.ui.commons.TextField({
					editable: false
				});
				labelText.bindProperty("value", "label");

				// toolbar creation

				//    toolBar.onAfterRendering(function(){
				// var container = this.$();
				// container.parent().addClass("parameterToolbarStyle");
				//   });

				// Table creation     

				var noData = resourceLoader.getText("msg_no_parameters_variables");
				if (!(this.isSemanticsNode || (this.viewNode && this.viewNode.type === "Script"))) {
					noData = resourceLoader.getText("msg_no_parameters");
				}
				//Comments
				var changeComments = function(event) {

					var textArea = event.getSource();
					var bindingContext = textArea.getBindingContext();
					var parameter = bindingContext.getObject();
					var value = event.getParameter("newValue");
					if (commentValue || commentValue === "") {
						value = commentValue;
					}
					var attributes = {};
					attributes.endUserTexts = {
						comment: {
							text: value,
							mimetype: "text/plain"
						}
					};

					var command = new commands.ChangeParameterPropertiesCommand(parameter.parameter.name, attributes);
					if(value || value === ""){
					that._execute(command);
					}
				};

				var commentField = new sap.ui.commons.TextArea({

					editable: true,
					enabled: true,
					rows: 10,
					change: changeComments,
					liveChange: changeComments
				}).addStyleClass("commentField");

				var commentImage = true;
				var oButton3 = new sap.ui.commons.Image({
					src: resourceLoader.getImagePath("DeleteIcon.png", "analytics"),
					tooltip: resourceLoader.getText("txt_clear"),
					width: "20px",
					height: "20px",
					press: function() {
						commentField.setValue("");
						var bindingContext = commentField.getBindingContext();
						var parameter = bindingContext.getObject();
						var attributes = {};
						attributes.endUserTexts = {
							comment: {
								text: "",
								mimetype: "text/plain"
							}
						};

						var command = new commands.ChangeParameterPropertiesCommand(parameter.parameter.name, attributes);
						that._execute(command);

					}
				}).addStyleClass("commentButton");
				var commentLayout = new sap.ui.layout.VerticalLayout({
					content: [oButton3, commentField]
				});

				var tpComments = new sap.ui.ux3.ToolPopup({
					content: [commentLayout],
					autoClose: true
				}).addStyleClass("commentPopup");
				tpComments.addStyleClass("commentLay");

				commentField.attachBrowserEvent("keydown", function(event) {
					if ((event.keyCode) && (event.keyCode === 27)) {
						commentValue = event.currentTarget.value;
						commentField.setValue(commentValue);
						tpComments.close();
						commentField.setValue(commentValue);
					}
				}, "");
				commentImage = new sap.ui.commons.Image({
					src: {
						parts: ["parameter"],
						formatter: function(parameter) {
							var comment = "";
							if (parameter) {
								comment = parameter.endUserTexts !== undefined ? parameter.endUserTexts.comment.text : "";
							}
							comment = comment ? (comment.trim()) : comment;
							if ((comment !== "") && (comment !== undefined)) {
								return resourceLoader.getImagePath("Note.png", "analytics");
							} else {
								return resourceLoader.getImagePath("Note_grayscale.png", "analytics");
							}

						}
					},
					tooltip: {
						parts: ["parameter"],
						formatter: function(parameter) {
							var comment = "";
							if (parameter) {
								comment = parameter.endUserTexts !== undefined ? parameter.endUserTexts.comment.text : "";
							}
							if (comment !== "") {
								return comment;
							} else {
								return resourceLoader.getText("msg_add_comment");
							}

						}
					},

					press: function() {
					     commentValue=undefined;
						tpComments.setOpener(this);
						var parameter = this.getParent().getBindingContext().getObject();
						commentField.setBindingContext(this.getParent().getBindingContext());
						if (tpComments.isOpen()) {

							tpComments.close();
						} else {
							var comment = parameter.parameter.endUserTexts !== undefined ? parameter.parameter.endUserTexts.comment.text : "";
							commentField.setValue(comment);
							tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);

						}
					}

				});


				this.table = new sap.ui.table.Table({
					editable: false,
					height: "100%",
					enableColumnFreeze: true,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					noData: noData,
					// rowHeight: 15,
					// showOverLay: true,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					selectionMode: sap.ui.table.SelectionMode.Single,
					columns: [new sap.ui.table.Column({
							autoResizable: false,
							resizable: false,
							template: commentImage,
							width: "50px",
							label: new sap.ui.commons.Label({
								//text: "Notes"
							})
						}), new sap.ui.table.Column({
							autoResizable: false,
							resizable: false,
							template: icon,
							width: "30px"
						}), new sap.ui.table.Column({
							autoResizable: false,
							resizable: true,
							template: nameText,
							label: new sap.ui.commons.Label({
								text: "Name",
								requiredAtBegin: true,
								textAlign: sap.ui.core.TextAlign.Begin
							})
						}),
                        new sap.ui.table.Column({
							autoResizable: true,
							resizable: true,
							template: labelText,
							label: new sap.ui.commons.Label({
								text: "Label",
								textAlign: sap.ui.core.TextAlign.Begin
							})
						})
                    ],
					//  toolbar: toolBar,
					rowSelectionChange: function(oevent) {
						var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
						if (bindContext) {
							var parameter = bindContext.getProperty("parameter");
							if (parameter.isVariable) {
								if (!variableEditor) {
									variableEditor = new VariableDetails({
										undoManager: that.undoManager,
										model: that.model,
										context: that.context,
										gotoExpressionEditor: gotoExpressionEditorPage,
										updateMasterList: updateMasterModel
									});
									variableEditor.updateDetails(parameter, that.creatingNew);
									that.creatingNew = false;
								} else {
									variableEditor.updateDetails(parameter, that.creatingNew);
									that.creatingNew = false;
								}
							} else if (!detailInputParameter) {
								// jQuery.sap.require("sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/DetailInputParameter");
								detailInputParameter = new DetailInputParameter({
									undoManager: that.undoManager,
									model: that.model,
									context: that.context,
									viewNode: that.viewNode,
									parameters: that.parameters,
									gotoExpressionEditor: gotoExpressionEditorPage,
									updateMasterList: updateMasterModel
								});
								detailInputParameterContent = detailInputParameter.getDetailsContent();
								//  detailInputParameterContent=detailInputParameter.getContent();

							}
							if (parameter.isVariable) {
								that.splitter.removeAllSecondPaneContent();
								that.splitter.addSecondPaneContent(variableEditor.getContent());
								if (detailInputParameter) {
									detailInputParameter.unsubScribeEvents();
								}
							} else {
								if (variableEditor) {
									variableEditor.unSubScribeEvents();
								}
								var length = that.splitter.getSecondPaneContent().length;
								if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent()[0] !== detailInputParameterContent)) {
									that.splitter.removeAllSecondPaneContent();
									that.splitter.addSecondPaneContent(detailInputParameterContent);
								}
								detailInputParameter.buildParameterDetails({
									parameter: parameter,
									isNew: that.creatingNew
								});
								that.creatingNew = false;
							}
							that.selectedParameter = parameter;
							if (expressionEditor) {
								expressionEditor.setInput(that.selectedParameter);
							}
						}
						//   alert("selection Changed");
					}
				});

				//   table.addStyleClass("sapUiTable");
				//    .tableBorder Tr>td{
				//   border-right:3px solid #CCCCCC !important;
				//  }

				that.parameterModel = new sap.ui.model.json.JSONModel();
				var data = this.getData(this.parameters);
				that.parameterModel.setData(data);
				this.table.bindRows("/");
				this.table.setModel(that.parameterModel);

				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, modelChanged, this.parameterListTable);
				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, modelChanged, this.parameterListTable);
				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, modelChanged, this.parameterListTable);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED, this.modelChanged, this);

				function modelChanged(object, event) {
					var parametersData = that.getData(that.parameters);
					if (object.type === commands.ViewModelEvents.PARAMETER_CREATED) {
						that.parameterModel.setData(parametersData);
						that.parameterModel.updateBindings(true);
						for (var i = 0; i < parametersData.length; i++) {
							var parameter = parametersData[i];
							if (parameter && parameter.name === object.name) {
								that.table.setSelectedIndex(i);
								break;
							}
						}

					} else if (object.type === commands.ViewModelEvents.PARAMETER_DELETED) {

						var deletedIndex = -1;
						var currentSelectedIndex = -1;
						for (var j = 0; j < that.parameterModel.getData().length; j++) {
							var parameterObject = that.parameterModel.getData()[j];
							if (parameterObject && parameterObject.name === object.name) {
								deletedIndex = j;
							}
							if (that.selectedParameter && parameterObject && that.selectedParameter.name === parameterObject.name) {
								currentSelectedIndex = j;
							}
						}
						that.parameterModel.setData(parametersData);
						that.parameterModel.updateBindings(true);
						if (parametersData.length > 0) {
							if (currentSelectedIndex >= 0) {
								if (currentSelectedIndex === 0) {
									that.table.setSelectedIndex(0);
									that.table.fireRowSelectionChange({
										rowIndex: 0
									});
								} else if (currentSelectedIndex < deletedIndex) {
									that.table.setSelectedIndex(currentSelectedIndex);
								} else {
									that.table.setSelectedIndex(currentSelectedIndex - 1);
								}
							}
						} else {
							that.splitter.removeAllSecondPaneContent();
						}

						/*  var foundIndex = table.getSelectedIndex();
                        model.setData(that.getData(that.parameters));
                        model.updateBindings();
                        if (that.parameters.count() > 0) {
                            if (foundIndex === 0)
                                table.setSelectedIndex(0)
                            else
                                table.setSelectedIndex(foundIndex - 1);

                        } else {
                            that.splitter.removeAllSecondPaneContent();
                        } */
					} else if (object.type === commands.ViewModelEvents.PARAMETER_CHANGED || object.type === commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_CREATED ||
						object.type === commands.ViewModelEvents.PARAMETER_ASSIGNEDELEMENT_DELETED) {
						var index = that.table.getSelectedIndex();
						that.parameterModel.setData(parametersData);
						that.parameterModel.updateBindings(true);
						that.table.setSelectedIndex(index);

					}

				}

				function updateMasterModel(parameter) {
					if (parameter) {
						if (that.table.getSelectedIndex() >= 0 && that.parameterModel.getData().length) {
							that.parameterModel.getData()[that.table.getSelectedIndex()].name = parameter.name;
							that.parameterModel.getData()[that.table.getSelectedIndex()].label = parameter.label;
							that.parameterModel.updateBindings();
						} else {
							that.parameterModel.setData(that.getData(that.parameters));
							that.parameterModel.updateBindings();
						}

					}
				}

				var updateExpression;
				var isVariable;
				var gotoExpressionEditorPage = function(attributes) {
					updateExpression = attributes.updateExpression;
					isVariable = attributes.isVariable;
					that.splitter.removeAllSecondPaneContent();
					if (!expressionEditorContent) {
						expressionEditor = new ParameterExpressionEditor({
							undoManager: that.undoManager,
							view: that.model.columnView,
							callBack: gotoDetailsPage,
							defaultRange:attributes.defaultRange
						});
						expressionEditorContent = expressionEditor.getContent();
						expressionEditor.setInput(that.selectedParameter);
					}

					that.splitter.addSecondPaneContent(expressionEditorContent);
					expressionEditor.setExpression(attributes.expressionValue, attributes.elementName);
				};
				var gotoDetailsPage = function(expressionValue, updateModel) {
					that.splitter.removeAllSecondPaneContent();
					if (isVariable) {
						that.splitter.addSecondPaneContent(variableEditor.getContent());
					} else {
						that.splitter.addSecondPaneContent(detailInputParameterContent);
					}
					updateExpression(expressionValue, updateModel);
				};

				if (that.parameters.count() > 0) {
					that.table.setSelectedIndex(0);
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlightregisterTable("pv", that.table);
				}
				return that.table;

				/*      var verticalLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: "100%"
                });
                var grid = new sap.ui.layout.Grid({
                    width: "70%",
                    position: sap.ui.layout.GridPosition.Center, // sap.ui.layout.GridPosition
                });
                grid.setVSpacing(0);

                var headerLayout = new sap.ui.commons.layout.MatrixLayout({
                    visible: true, // boolean
                    width: "150%",
                    widths: ["50%", "50%"], // sap.ui.core.CSSSize
                    columns: 2, // int
                });

                var commonsToolBar = new sap.ui.commons.Toolbar({
                    visible: true, // boolean
                    width: "auto", // sap.ui.core.CSSSize
                    design: sap.ui.commons.ToolbarDesign.Flat, // sap.ui.commons.ToolbarDesign
                    standalone: true, // boolean
                    dependents: [], // sap.ui.core.Control, since 1.19
                    items: [], // sap.ui.commons.ToolbarItem
                    rightItems: []
                    // sap.ui.commons.ToolbarItem
                });


                // var createButton=new sap.suite.ui.commons.SplitButton();

                var createMenu = new sap.ui.commons.Menu({});

                var inputParameterMenuItem = new sap.ui.commons.MenuItem({
                    text: "Create Input Parameter",
                    icon: resourceLoader.getImagePath("Parameter.png"),
                    select: function() {

                    }
                });
                createMenu.addItem(inputParameterMenuItem);
                var variableMenuItem = new sap.ui.commons.MenuItem({
                    text: "Create Variable",
                    icon: resourceLoader.getImagePath("Parameter.png"),
                    select: function() {

                    }
                }); //Icon must be not larger than 16x16 px
                createMenu.addItem(variableMenuItem);

                //  createButton.setMenu(createMenu, inputParameterMenuItem);
                //Override properties from menu item at SplitButton control level.
                //  createButton.setText("");


                var createIcon = new sap.m.Image({
                    src: resourceLoader.getImagePath("Add.png"),
                    press: function() {
                        var newParameterName = getNextInputParameterName();
                        var createCommand = new commands.AddParameterCommand({
                            objectAttributes: {
                                name: newParameterName,
                                label: newParameterName
                            },
                            typeAttributes: {

                            }
                        }, newParameterName);

                        var parameter = that.undoManager.execute(new modelbase.CompoundCommand(createCommand));

                        //     that.replaceMainContent(true);
                    }
                });
                
                commonsToolBar.addRightItem(createIcon);



                var createButton = new sap.ui.commons.Button({
                    width: "125%",
                    type: sap.m.ButtonType.Back,
                    press: function() {
                        that.replaceMainContent(true);
                    }
                });

                // createButton.setText("Create");
                //     createButton.setIcon(resourceLoader.getImagePath("Parameter.png"));
                // commonsToolBar.addItem(createButton);


                grid.addContent(commonsToolBar);
                headerLayout.createRow(createLabel(resourceLoader.getText("txt_input_parameter_variable"), true), grid);


                // verticalLayout.createRow(headerLayout);
            */

				/*   verticalLayout.createRow(new sap.ui.commons.HorizontalDivider({
                width: "100%",
                height: sap.ui.commons.HorizontalDividerHeight.Ruleheight,
                type: sap.ui.commons.HorizontalDividerType.Page
            }));*/

				/*  var columnMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                widths: ["25px", "25px", "25px", "25px"]
            });
 
            columnMatrixLayout.createRow(createLabel("Name", true), createLabel("Description", true), createLabel("Type", true), createLabel("", true));
            verticalLayout.addContent(columnMatrixLayout);
            */

				/*        this.parameterListTable = new sap.m.Table({
                    mode: sap.m.ListMode.SingleSelectMaster,
                    modeAnimationOn: true,
                    headerDesign: sap.m.ListHeaderDesign.Standard,
                    rememberSelections: true,
                    select: [

                        function(oEvent) {
                            var name = oEvent.getSource().getSelectedItem().getCustomData()[0].getValue();
                            var parameter = this.parameters.get(name);
                            updateDetailsPage(parameter);
                        },
                        this
                    ]
                });
                var nameColumn = new sap.m.Column({
                    header: new sap.m.Label({
                        text: "Name",
                        design: sap.m.LabelDesign.Bold
                    }),
                    width: "90px"
                });
                var labelColumn = new sap.m.Column({
                    header: new sap.m.Label({
                        text: "Label",
                        design: sap.m.LabelDesign.Bold
                    }),
                    width: "70px"
                });
                this.parameterListTable.addColumn(nameColumn);
                this.parameterListTable.addColumn(labelColumn);


                this.list = new sap.m.List({
                    mode: sap.m.ListMode.SingleSelectMaster,
                    backgroundDesign: sap.m.BackgroundDesign.Solid,
                    select: [

                        function(oEvent) {
                            var name = oEvent.getSource().getSelectedItem().getCustomData()[0].getValue();
                            var parameter = this.parameters.get(name);
                            updateDetailsPage(parameter);
                        },
                        this
                    ]
                });
                this.list.addStyleClass("classList");

                var content = createTemplate();

                this.customListItem = new sap.m.ColumnListItem({
                    //content: content,
                    type: "Navigation",
                    customData: [new sap.ui.core.CustomData({
                        key: "name",
                        value: "{name}"
                    })],
                    onListItemPress: function(events) {}
                });

                

                var deleteIcon = new sap.m.Image({
                    src: resourceLoader.getImagePath("Delete.png"),
                    width: "15px",
                    press: function() {
                        var listItem = that.parameterListTable.getSelectedItem();
                        if (listItem) {
                            var parameterName = listItem.getCustomData()[0].getValue();
                            var parameter = getParameter(parameterName);
                            if (parameter) {
                                var selectionParameter = that.parameters.getPreviousKey(parameterName);
                                selectionParameter = selectionParameter ? selectionParameter : that.parameters.getNextKey(parameterName);
                                that.undoManager.execute(new modelbase.DeleteCommand(parameter, false));
                                that.updateModel();
                                updateListSelection(selectionParameter);
                            }
                        }
                    }
                });



                
                // this.customListItem.bindElement("/1");
                this.customListItem.addStyleClass("listHeight");

                // this.list.bindItems({
                //    path: "/",
                //   template: this.customListItem
                //    });

                this.parameterListTable.bindItems({
                    path: "/",
                    template: this.customListItem
                });

                //verticalLayout.addContent(this.list);

                var oSplitApp = new sap.m.SplitApp({});
                var addContent = verticalLayout.createRow(oSplitApp);
                //  oSplitApp.addStyleClass("layoutHeight");
                var masterHeader = new sap.m.Bar();
                var headerText = new sap.m.Text({
                    text: "Input Parameters/Variables"
                });
                // masterHeader.addContentLeft(headerText);
                masterHeader.addContentRight(createIcon);
                masterHeader.addContentRight(deleteIcon);


                var masterPage = new sap.m.Page({
                    backgroundDesign: sap.m.PageBackgroundDesign.List,
                    enableScrolling: true,
                    // headerContent:createIcon,
                    // title:"Input Parameters/Variables",
                    customHeader: masterHeader
                });
                // masterPage.addStyleClass("masterPageBackground");

                masterPage.setShowHeader(true);
                masterPage.setEnableScrolling(true);
                masterPage.addContent(this.parameterListTable);
                masterPage.onAfterRendering = function() {
                    var container = this.$();
                    container.parent().addClass("customWidth");
                };
                var detailsPage = new sap.m.Page({
                    backgroundDesign: sap.m.PageBackgroundDesign.List,
                    title: "Input Parameter",
                    enableScrolling: true
                });
                
                detailsPage.onAfterRendering = function() {
                    var container = this.$();
                    container.parent().addClass("layoutHeight");
                };

                var secondDetailsPage = new sap.m.Page({
                    backgroundDesign: sap.m.PageBackgroundDesign.List,
                    title: "Input Parameter",
                    enableScrolling: true
                });
                
                
                 secondDetailsPage.onAfterRendering = function() {
                    var container = this.$();
                //    container.parent().addClass("layoutHeight");
                };
                
                var secondPageId;
                var updateExpression;

                function gotoExpressionEditorPage(updateExpressionFunction,value) {
                    oSplitApp.toDetail(secondPageId);
                    oSplitApp.rerender();
                    updateExpression=updateExpressionFunction;
                    expressioneditor.setExpression(value);
                }

                function gotoDetailsPage() {
                    oSplitApp.toDetail(detailsPage.getId());
                    if(updateExpression){
                        updateExpression(expressioneditor.getExpression())
                    }
                }

                function updateParameter(parameterName) {
                    if(parameterName){
                    that.updateModel();
                    for(var i=0;i<that.parameterListTable.getItems().length;i++){
                        var listItem=that.parameterListTable.getItems()[i];
                        if(listItem.getCustomData()[0].getValue()==parameterName){
                            that.parameterListTable.setSelectedItem(listItem);
                            break;
                        }
                    }
                    }
                }


                var expressioneditor = new ParameterExpressionEditor(null, null, null, this);
                secondDetailsPage.addContent(expressioneditor.getContent());
                secondDetailsPage.setShowNavButton(true);
                secondDetailsPage.attachNavButtonPress(function() {
                    gotoDetailsPage();
                }, this);
                secondDetailsPage.setShowHeader(true);

                secondPageId = secondDetailsPage.getId();
                var inputParameterDetails = new DetailInputParameter(this.undoManager, this.model,this.context,updateParameter, that.parameters);
                // var detailsContent=new VariableDetails(null, null, null, this).getDetailsContent();
                detailsPage.addContent(inputParameterDetails.getDetailsContent(gotoExpressionEditorPage));
                detailsPage.setShowHeader(true);
                detailsPage.setTitle("Details");
                // detailsPage.addStyleClass("detailPageBackground");




                oSplitApp.addMasterPage(masterPage);
                // detailsPage.addDetailPage(secondDetailsPage);

                //  oSplitApp.setInitialDetail(detailsPage);
                oSplitApp.setInitialMaster(masterPage);
                oSplitApp.setMode("PopoverMode");
                this.updateModel();
                that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, modelChanged, this.parameterListTable);
                that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, modelChanged, this.parameterListTable);
                if (this.parameterListTable.getItems().length > 0) {
                    var listItem = this.parameterListTable.getItems()[0];
                    that.parameterListTable.setSelectedItem(listItem, true);
                    that.parameterListTable.fireSelect({
                        listItem: listItem
                    });

                }

                function modelChanged(object,event) {
                    if(object.type==commands.ViewModelEvents.PARAMETER_CREATED){
                         that.updateModel();
                        updateListSelection(object.name);
                    }else if(object.type==commands.ViewModelEvents.PARAMETER_DELETED){
                          var selectedText;
                          if(that.parameterListTable.getItems().length>1){
                          for(var i=0 ;i< that.parameterListTable.getItems().length;i++){
                              var listItem=that.parameterListTable.getItems()[i];
                              var parameterName=listItem.getCustomData()[0].getValue();
                              if(parameterName==object.name){
                                  selectedText=that.parameterListTable.getItems()[i===0?i+1:i-1].getCustomData()[0].getValue();
                                  break;
                              }
                          }
                          }
                          that.updateModel();
                          updateListSelection(selectedText);
                          
                    }
                }


                function updateDetailsPage(parameter) {
                    if (parameter) {
                        if (oSplitApp.getCurrentPage() === detailsPage) {
                            inputParameterDetails.buildParameterDetails({
                                parameter: parameter,
                                expressionPageCallBack: gotoExpressionEditorPage
                            });
                        } else {
                            oSplitApp.addDetailPage(detailsPage).addDetailPage(secondDetailsPage);
                            inputParameterDetails.buildParameterDetails({
                                parameter: parameter,
                                expressionPageCallBack: gotoExpressionEditorPage
                            });
                        }
                    }
                }

                function removeDetailsPageContent() {
                    inputParameterDetails.buildParameterDetails({
                        parameter: null,
                        expressionPageCallBack: gotoExpressionEditorPage
                    });
                }

                function updateListSelection(nameOfParameter) {
                    if (nameOfParameter) {
                        for (var i = 0; i < that.parameterListTable.getItems().length; i++) {
                            var listItem = that.parameterListTable.getItems()[i];
                            var parameterName = listItem.getCustomData()[0].getValue();
                            if (parameterName == nameOfParameter) {
                                that.parameterListTable.setSelectedItem(listItem, true);
                                that.parameterListTable.fireSelect({
                                    listItem: listItem
                                });
                            }
                        }
                    } else {
                        if (that.parameterListTable.getItems().length <= 0) {
                            removeDetailsPageContent();
                        }
                    }
                }

                function getNextInputParameterName() {
                    var parameterName = "IP";
                    var gotName = true;
                    var count = 1;
                    while (gotName) {
                        if (that.parameters.get(parameterName)) {
                            parameterName = "IP" + "_" + count;
                            count++;
                        } else {
                            gotName = false;
                        }
                    }
                    return parameterName;
                }
*/

				// return oSplitApp;
			},
			replaceMainContent: function(bDetailsContent) {
				if (bDetailsContent) {
					this.mainLayout.destroyContent();
					var detailsContent = new InputParameterDetails(null, null, null, this).getDetailsContent();
					this.mainLayout.addContent(detailsContent);
				} else {
					this.mainLayout.destroyContent();
					var masterContent = this.getMasterListContent();
					this.mainLayout.addContent(masterContent);
					this.updateModel();
				}
			},
			getNextParameterName: function(name) {
				var parameterName = name + "_" + 1;
				var gotName = true;
				var count = 2;
				while (gotName) {
					if (this.parameters.get(parameterName)) {
						parameterName = name + "_" + count;
						count++;
					} else {
						gotName = false;
					}
				}
				return parameterName;
			},
			getParameter: function(parameterName) {
				var parameterFound;
				this.parameters.foreach(function(parameter) {
					if (parameter.name === parameterName && !parameterFound)
						parameterFound = parameter;
				});
				return parameterFound;
			},
			getData: function(parameters) {
				var that = this;
				var parametersData = [];
				if (parameters) {
					parameters.foreach(function(parameter) {
						var proxy = "";
						var proxyInfo = that.isBasedOnElementProxy(parameter);
						if (proxyInfo) {
							proxy = "proxy/";
							
						}
						if(parameter.externalTypeOfEntity && parameter.externalTypeOfEntity.deprecated){
						    proxy =proxyInfo? proxy:"warning/";
						    proxyInfo=proxyInfo!==undefined?proxyInfo +"\n\n\t\"" +parameter.externalTypeOfEntity.fqName+"\" is deprecated view.":+parameter.externalTypeOfEntity.fqName+"\" is deprecated view.";
						}
						if (that.isSemanticsNode || (that.viewNode && that.viewNode.type === "Script")) {
							parametersData.push({
								name: parameter.name,
								label: parameter.label,
								icon: parameter.isVariable ? resourceLoader.getImagePath(proxy + "variable.png") : resourceLoader.getImagePath(proxy +
									"Parameter.png"),
								tooltip: proxyInfo ? proxyInfo : undefined,
								parameter: parameter,
								seq: "none",
								focus: "none"
							});

						} else {
							if (!parameter.isVariable) {
								parametersData.push({
									name: parameter.name,
									label: parameter.label,
									icon: parameter.isVariable ? resourceLoader.getImagePath(proxy + "variable.png") : resourceLoader.getImagePath(proxy +
										"Parameter.png"),
									tooltip: proxyInfo ? proxyInfo : undefined,
									parameter: parameter,
									seq: "none",
									focus: "none"
								});
							}
						}
					});
				}
				return parametersData;
			},
			getRemovableMappingCommands: function(parameter) {
				var that = this;
				var mappingCommands = [];
				if (parameter) {
					that.model.columnView.viewNodes.foreach(function(viewNode) {
						viewNode.inputs.foreach(function(input) {
							input.parameterMappings.foreach(function(mapping) {
								if (mapping.parameter === parameter) {
									mappingCommands.push(new commands.RemoveParameterMappingCommand({
										source: {
											type: "input",
											typeName: input.$$defaultKeyValue,
											viewNode: viewNode.name
										},
										mapping: {
											parameterNameOtherView: mapping.parameterNameOtherView,
											parameter: mapping.parameter
										}
									}));
								}
							});
						});
					});

					that.model.columnView.parameters.foreach(function(localParameter) {
						localParameter.parameterMappings.foreach(function(mapping) {
							if (mapping.parameter === parameter) {
								mappingCommands.push(new commands.RemoveParameterMappingCommand({
									source: {
										type: "parameter",
										typeName: localParameter.name
									},
									mapping: {
										parameterNameOtherView: mapping.parameterNameOtherView,
										parameter: mapping.parameter
									}
								}));
							}
						});
					});
					that.model.columnView.parameters.foreach(function(localParameter) {
						if (localParameter.derivationRule && localParameter.derivationRule.parameterMappings) {
							localParameter.parameterMappings.foreach(function(mapping) {
								if (mapping.parameter === parameter) {
									mappingCommands.push(new commands.RemoveParameterMappingCommand({
										source: {
											type: "derivationrule",
											typeName: localParameter.name
										},
										mapping: {
											parameterNameOtherView: mapping.parameterNameOtherView,
											parameter: mapping.parameter
										}
									}));
								}
							});
						}
					});
					that.model.columnView.getDefaultNode().elements.foreach(function(element) {
						if (element.parameterMappings) {
							element.parameterMappings.foreach(function(mapping) {
								if (mapping.parameter === parameter) {
									mappingCommands.push(new commands.RemoveParameterMappingCommand({
										source: {
											type: "element",
											typeName: element.name
										},
										mapping: {
											parameterNameOtherView: mapping.parameterNameOtherView,
											parameter: mapping.parameter
										}
									}));
								}
							});
						}
					});
				}
				return mappingCommands;
			},
			isBasedOnElementProxy: function(element) {
				if (element) {
					var results = CalcViewEditorUtil.isBasedOnElementProxy({
						object: element,
						columnView: this.model.columnView,
						viewNode: this.viewNode
					});
					if (results) {
						if (element.isVariable) {
							return CalcViewEditorUtil.consolidateResults(results, {
								elementType: "variable"
							});
						} else {
							return CalcViewEditorUtil.consolidateResults(results, {
								elementType: "parameter"
							});
						}
					}
				}
				return undefined;
			},
			updateModel: function() {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(this.getData(this.parameters));
				// this.list.setModel(oModel);
				// this.list.bindElement("/");
				this.parameterListTable.setModel(oModel);

			},
			updateTable: function() {
				var that = this;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("pv", that.table);
				}
			    
			}
		};


		return ParameterDetails;
	});
