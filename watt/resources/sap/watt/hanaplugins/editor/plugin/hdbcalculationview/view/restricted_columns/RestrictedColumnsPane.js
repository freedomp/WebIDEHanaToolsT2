/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/model",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "./RestrictedColumnDetails",
        "../dialogs/ReferenceDialog",
    ],
	function(ResourceLoader, modelbase, modelClass, commands, CalcViewEditorUtil, RestrictedColumnDetails, ReferenceDialog) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		/**
		 * @class
		 */
		var RestrictedColumnsPane = function(attributes) {
			this._undoManager = attributes.undoManager;
			this.viewNode = attributes.viewNode;
			this.context = attributes.context;
			this.model = attributes.model;
			this.creatingNew = false;
			this.restrictedColumnDetails;
			this.restrictedModel = new sap.ui.model.json.JSONModel();
			this.table;
		};

		RestrictedColumnsPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);

			},

			close: function() {
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.updateExpressionEditorData, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.updateExpressionEditorData, this);
				if (this.viewNode.$getEvents()._registry) {
					this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.modelChanged, this);
					this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.modelChanged, this);
					this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
				}
				this.unsubscribe();

				if (this.detailsEditor) {
					this.detailsEditor.close();
				}
			},
			unsubscribe: function() {
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.modelChanged, this);
				this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);

				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.modelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.modelChanged, this);
				this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
			},

			getContent: function() {

				var that = this;

				this.mainLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%"
				}).addStyleClass("masterDetailsMainDiv");

				// toolbar creation
				var toolBar = new sap.ui.commons.Toolbar({
					width: "100%",
					items: []
				}).addStyleClass("parameterToolbarStyle");

				var addButton = new sap.ui.commons.Button({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					//   text:"Add",
					press: function(oevent) {
						var newRestrictedColumnName = CalcViewEditorUtil.getUniqueNameForElement("RES", that.viewNode, ["RES"]);
						var createCommand = new commands.AddElementCommand(
							that.viewNode.name, {
								objectAttributes: {
									name: newRestrictedColumnName,
									label: "",
									measureType: modelClass.MeasureType.RESTRICTION,
									aggregationBehavior: "formula",
								},
								calculationAttributes: {
									formula: ""
								}
							}, newRestrictedColumnName);
						that.creatingNew = true;
						var restrictedColumn = that._execute(createCommand);
						var restrictedColumnsData = that.getData();
						that.restrictedModel.setData(restrictedColumnsData);
						that.restrictedModel.updateBindings();
						that.table.setSelectedIndex(restrictedColumnsData.length - 1);
						if (restrictedColumnsData.length === 1) {
							that.table.fireRowSelectionChange();
						}

					}

				});

				var deleteButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						path: " ",
						formatter: function() {
							if (that.restrictedModel.getData() && that.restrictedModel.getData().length > 0) {
								return true;
							} else {
								return false;
							}
						}
					},
					press: function(oevent) {
						var selectedIndex = that.table.getSelectedIndex();
						var bindContext = that.table.getContextByIndex(selectedIndex);
						if (bindContext) {
							var element = bindContext.getProperty("element");
							if (element) {
								var callback = function(result) {
									if (result)
										that._execute(new modelbase.DeleteCommand(element, false));
								}
								var referenceDialog = new ReferenceDialog({
									undoManager: that._undoManager,
									element: [element],
									isRemoveCall: true,
									fnCallbackMessageBox: callback
								});
								referenceDialog.openMessageDialog();
								// that.restrictedModel.getData().splice(selectedIndex, 1);
								//  model.setData(that.getData(that.parameters));
								// that.restrictedModel.updateBindings();
								// if (that.restrictedModel.getData().length > 0) {
								// that.table.setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : selectedIndex + 1);
								// }
							}
						}

					}
				});

				toolBar.addItem(addButton);
				toolBar.addItem(deleteButton);
				toolBar.setModel(that.restrictedModel);
				this.mainLayout.addContent(toolBar);

				var splitter = new sap.ui.commons.Splitter({
					//showScrollBars: true,
					splitterBarVisible: true,
					splitterOrientation: sap.ui.core.Orientation.Vertical,
					minSizeFirstPane: "20%",
					splitterPosition: "30%",
					height: "100%"
				}).addStyleClass("masterDetailsSplitter");

				this.splitter = splitter;
				this.splitter.addFirstPaneContent(this.getMasterListContent());
				//this.splitter.addStyleClass("whiteBackground");

				this.mainLayout.addContent(this.splitter);

				//return this.splitter;
				// this.mainLayout.createRow(splitter);
				return this.mainLayout;
			},

			getMasterListContent: function() {

				var that = this;
				var commentValue;
				var detailInputParameter;
				var parameterExpressionEditor;
				var variableEditor;
				var detailInputParameterContent;
				var expressionEditorContent;
				var expressionEditor;
				// Name template     
				var icon = new sap.ui.commons.Image({
					src: {
						path: "element",
						formatter: function(element) {
							var proxy = "";
							if (that.isBasedOnElementProxy(element)) {
								proxy = "proxy/";
							}
							return resourceLoader.getImagePath(proxy + "RestrictedMeasure.png");
						}

					},
					tooltip: {
						path: "element",
						formatter: function(element) {
							if (element) {
								return that.isBasedOnElementProxy(element);
							}
						}
					}
				});
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
				nameText.bindProperty("value", {
					path: "element",
					formatter: function(element) {
						return element ? element.name : ""
					}
				});

				// Label template    
				var labelText = new sap.ui.commons.TextField({
					editable: false
				});
				labelText.bindProperty("value", {
					path: "element",
					formatter: function(element) {
						return element ? element.label : ""
					}
				});

				//Comments
				var changeComments = function(event) {

					var textArea = event.getSource();

					var viewNodeName = that.viewNode.name;
					var bindingContext = textArea.getBindingContext();
					var element = bindingContext.getObject();
					var value = event.getParameter("newValue");
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					if (commentValue || commentValue === "") {
						value = commentValue;
					}
					attributes.endUserTexts = {
						comment: {
							text: value,
							mimetype: "text/plain"
						}
					};

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.element.name, attributes);
					if (value || value === "") {
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
						var viewNodeName = that.viewNode.name;
						var bindingContext = commentField.getBindingContext();
						var element = bindingContext.getObject();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.endUserTexts = {
							comment: {
								text: "",
								mimetype: "text/plain"
							}
						};

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.element.name, attributes);
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
						parts: ["element"],
						formatter: function(element) {
							var comment = "";
							if (element) {
								comment = element.endUserTexts !== undefined ? element.endUserTexts.comment.text : "";
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
						parts: ["element"],
						formatter: function(element) {
							var comment = "";
							if (element) {
								comment = element.endUserTexts !== undefined ? element.endUserTexts.comment.text : "";
							}

							if (comment !== "") {
								return comment;
							} else {
								return resourceLoader.getText("msg_add_comment");
							}

						}
					},

					press: function() {
						tpComments.setOpener(this);
						commentValue = undefined;
						var element = this.getParent().getBindingContext().getObject();
						commentField.setBindingContext(this.getParent().getBindingContext());
						if (tpComments.isOpen()) {

							tpComments.close();
						} else {
							var comment = element.element.endUserTexts !== undefined ? element.element.endUserTexts.comment.text : "";
							commentField.setValue(comment);
							tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);

						}
					}

				});

				// Table creation     
				that.table = new sap.ui.table.Table({
					editable: false,
					//height: "100%",
					//enableColumnFreeze: true,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					noData: resourceLoader.getText("msg_no_restricted_columns"),
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					// rowHeight: 15,
					// showOverLay: true,
					//visibleRowCount: 20,
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
								text: resourceLoader.getText("tit_name"),
								requiredAtBegin: true,
								textAlign: sap.ui.core.TextAlign.Begin
							})
						}),
                        new sap.ui.table.Column({
							autoResizable: true,
							resizable: true,
							template: labelText,
							label: new sap.ui.commons.Label({
								text: resourceLoader.getText("tit_label"),
								textAlign: sap.ui.core.TextAlign.Begin
							})
						})
                    ],
					//toolbar: toolBar,
					rowSelectionChange: function(oevent) {
						var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
						if (bindContext) {
							var restrictedElement = bindContext.getProperty("element");
							if (!that.restrictedColumnDetails) {
								that.restrictedColumnDetails = new RestrictedColumnDetails({
									undoManager: that._undoManager,
									viewNode: that.viewNode,
									context: that.context,
									model: that.model
								})
								that.splitter.removeAllSecondPaneContent();

							}
							if (that.splitter.getSecondPaneContent().length === 0)
								that.splitter.addSecondPaneContent(that.restrictedColumnDetails.getContent());
							that.restrictedColumnDetails.updateModel(restrictedElement, that.creatingNew);
							that.creatingNew = false;
							that.unsubscribeRestrictions(restrictedElement);
							that.subscribeRestrictions(restrictedElement);

						}

						/*
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
                                        updateMasterList: updateMaterModel
                                    });
                                    variableEditor.updateDetails(parameter);
                                } else {
                                    variableEditor.updateDetails(parameter);
                                }
                            } else if (!detailInputParameter) {
                                // jQuery.sap.require("sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/DetailInputParameter");
                                detailInputParameter = new DetailInputParameter({
                                    undoManager: that.undoManager,
                                    model: that.model,
                                    context: that.context,
                                    parameters: that.parameters,
                                    gotoExpressionEditor: gotoExpressionEditorPage,
                                    updateMasterList: updateMaterModel
                                });
                                detailInputParameterContent = detailInputParameter.getDetailsContent();
                                //  detailInputParameterContent=detailInputParameter.getContent();

                            }
                            if (parameter.isVariable) {
                                that.splitter.removeAllSecondPaneContent();
                                that.splitter.addSecondPaneContent(variableEditor.getContent());
                                if (detailInputParameter)
                                    detailInputParameter.unsubScribeEvents();
                            } else {
                                if (variableEditor)
                                    variableEditor.unSubScribeEvents();
                                var length = that.splitter.getSecondPaneContent().length;
                                if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent()[0] !== detailInputParameterContent)) {
                                    that.splitter.removeAllSecondPaneContent();
                                    that.splitter.addSecondPaneContent(detailInputParameterContent);
                                }
                                detailInputParameter.buildParameterDetails({
                                    parameter: parameter
                                });
                            }


                        }
                        */
						//   alert("selection Changed");
					}
				});

				//   table.addStyleClass("sapUiTable");
				//    .tableBorder Tr>td{
				//   border-right:3px solid #CCCCCC !important;
				//  }

				var data = this.getData();
				this.restrictedModel.setData(data);
				that.table.bindRows("/");
				that.table.setModel(this.restrictedModel);

				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, that.modelChanged, this);
				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, that.modelChanged, this);
				that.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, that.modelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);

				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, that.modelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, that.modelChanged, this);
				this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, that.modelChanged, this);

				that.table.setSelectedIndex(0);

				function updateMaterModel(parameter) {
					if (parameter) {
						if (table.getSelectedIndex() >= 0) {
							model.getData()[table.getSelectedIndex()].name = parameter.name;
							model.getData()[table.getSelectedIndex()].label = parameter.label;
							model.updateBindings();
						} else {

							model.setData(that.getData(that.parameters));
							model.updateBindings();
						}

					}
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("rc", that.table);
				}
				return that.table;
			},
			unsubscribeRestrictions: function(element) {
				if (element && element.$getEvents()) {
					element.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
					element.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
					element.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
				}
			},
			subscribeRestrictions: function(element) {
				if (element && element.$getEvents()) {
					element.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
					element.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
					element.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
				}
			},
			modelChanged: function(object, event) {
				var that = this;
				if (object.type == commands.ViewModelEvents.ELEMENT_CREATED) {
					that.restrictedModel.setData(that.getData());
					that.restrictedModel.updateBindings(true);
					for (var i = 0; i <= that.table.getRows().length; i++) {
						var row = that.table.getRows()[i];
						if (row) {
							var bindContext = row.getBindingContext();
							if (bindContext) {
								var parameterName = bindContext.getProperty("name");
								if (parameterName === object.name) {
									that.table.setSelectedIndex(i);
									break;
								}
							}
						}
					}

				} else if (object.type == commands.ViewModelEvents.ELEMENT_DELETED) {
					var foundIndex = that.table.getSelectedIndex();
					that.restrictedModel.setData(that.getData(that.parameters));
					that.restrictedModel.updateBindings(true);
					if (that.restrictedModel.getData().length > 0) {
						if (foundIndex === 0 || foundIndex === 1) {
							that.table.setSelectedIndex(0);
							that.table.fireRowSelectionChange({
								rowIndex: 0
							});
						} else
							that.table.setSelectedIndex(foundIndex - 1);

					} else {
						that.splitter.removeAllSecondPaneContent();
					}
					var bindContext = that.table.getContextByIndex(that.table.getSelectedIndex());
					if (bindContext) {
						var restrictedElement = bindContext.getProperty("element");
						if (restrictedElement) {

						}
					}

				} else if (object.type === commands.ViewModelEvents.ELEMENT_CHANGED) {
					if (this.restrictedModel) {
						this.restrictedModel.updateBindings(true);
					}
				} else if (object.type === commands.ViewModelEvents.RESTRICTION_CREATED || object.type === commands.ViewModelEvents.RESTRICTION_DELETED ||
					object.type === commands.ViewModelEvents.RESTRICTION_CHANGED || object.type === commands.ViewModelEvents.ELEMENT_CHANGED) {
					if (this.restrictedModel) {
						this.restrictedModel.updateBindings(true);
					}
					/*
                    var index = that.table.getSelectedIndex();
                    that.restrictedModel.setData(that.getData(that.parameters));
                     that.table.setSelectedIndex(index);
                */
				}
			},

			getData: function() {
				var that = this;
				var restrictedColumnsData = [];
				this.viewNode.elements.foreach(function(element) {
					if (element.measureType === modelClass.MeasureType.RESTRICTION) {
						restrictedColumnsData.push({
							element: element,
							seq: "none",
							focus: "none",
							name: element ? element.name : ""
						});
					}
				});

				return restrictedColumnsData;
			},
			isBasedOnElementProxy: function(element) {
				if (element) {
					var results = CalcViewEditorUtil.isBasedOnElementProxy({
						object: element,
						columnView: this.model.columnView,
						viewNode: this.viewNode
					});
					if (results) {
						return CalcViewEditorUtil.consolidateResults(results);
					}
				}
				return false;
			},

			updateData: function() {

			},

			updateExpressionEditorData: function() {

			},
			updateTable: function() {
				var that = this;
				if (this._findandhighlight !== undefined) {
				this._findandhighlight.registerTable("rc", that.table);
			}
		
		}

		};

		return RestrictedColumnsPane;

	});
