
/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "./CalculatedColumnDetails",
        "./ExpressionDetails",
        "./SemanticTypeDetails",
        "./CounterDetails",
        "../dialogs/ReferenceDialog",
        "../../viewmodel/model"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, CalculatedColumnDetails, ExpressionDetails, SemanticTypeDetails, CounterDetails, ReferenceDialog,viewModel) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        /**
         * @class
         */
        var CalculatedColumnsPane = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.viewNode = parameters.viewNode;
            this._model = parameters.model;
            this.context = parameters.context;
            this.table;
            this.detailsEditor;
            this.counterDetailsEditor ;
            this.expressionEditor ;
            this.semanticTypeDetails ;
            this.model = new sap.ui.model.json.JSONModel(); 
            this.ccTable = null;
        };

        CalculatedColumnsPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.updateExpressionEditorData, this);
                this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.updateExpressionEditorData, this);
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.modelChanged, this);
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.modelChanged, this);
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.updateExpressionEditorData, this);
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updateExpressionEditorData, this);
                }
                if (this.detailsEditor) {
                    this.detailsEditor.close();
                }
                if (this.expressionEditor) {
                    this.expressionEditor.close();
                }
                if (this.model) {
                    this.model.destroy();
                }
            },

            getContent: function() {
                var that = this;
                /*this.mainLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: "100%",
                    height: "95%",
                });*/

                this.mainLayout = new sap.ui.commons.layout.VerticalLayout({
                    height: "100%"
                }).addStyleClass("masterDetailsMainDiv");

                var toolItems = [];

                var createCalculatedColumn = function() {
                    var calcColumnAttributes = {
                        objectAttributes: {},
                        typeAttributes: {},
                        calculationAttributes: {}
                    };

                    calcColumnAttributes.typeAttributes.primitiveType = "VARCHAR";
                    calcColumnAttributes.typeAttributes.length = "1";
                    calcColumnAttributes.typeAttributes.semanticType = "empty";

                    calcColumnAttributes.calculationAttributes.formula = "";
                    calcColumnAttributes.calculationAttributes.expressionLanguage = "COLUMN_ENGINE";

                    calcColumnAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement("CC", that.viewNode, ["CC"]);
                    //calcColumnAttributes.objectAttributes.label = calcColumnAttributes.objectAttributes.name;
                    calcColumnAttributes.objectAttributes.aggregationBehavior = "none";
                     calcColumnAttributes.objectAttributes.drillDownEnablement= viewModel.DrillDownEnablement.DRILL_DOWN;

                    that._execute(new commands.AddElementCommand(that.viewNode.name, calcColumnAttributes));
                };

                if ((this.viewNode.isDefaultNode() && this.viewNode.type === "Aggregation") || this.viewNode.isStarJoin()) {
                    toolItems.push(new sap.ui.commons.MenuButton({
                        icon: "sap-icon://add",
                        tooltip: resourceLoader.getText("tol_add"),
                        //text: resourceLoader.getText("tol_add"),
                        itemSelected: function(oevent) {
                            var name = oevent.getParameter("item").getText();
                            if (name === resourceLoader.getText("txt_calculated_column")) {
                                createCalculatedColumn();

                            } else if (name === resourceLoader.getText("txt_counter")) {
                                var counterAttributes = {
                                    objectAttributes: {},
                                    typeAttributes: {},
                                    calculationAttributes: {}
                                };

                                counterAttributes.typeAttributes.primitiveType = "INTEGER";
                                counterAttributes.calculationAttributes.formula = "1";

                                counterAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement("COUNT", that.viewNode, ["COUNT"]);
                                //counterAttributes.objectAttributes.label = counterAttributes.objectAttributes.name;
                                counterAttributes.objectAttributes.aggregationBehavior = "SUM";
                                counterAttributes.objectAttributes.measureType = "counter";
                                counterAttributes.counter = true;

                                that._execute(new commands.AddElementCommand(that.viewNode.name, counterAttributes));
                            }
                        },
                        menu: new sap.ui.commons.Menu({
                            items: [new sap.ui.commons.MenuItem({
                                    text: resourceLoader.getText("txt_calculated_column"),
                                    icon: resourceLoader.getImagePath("Calculated_Attribute.png")
                                    /*attachSelect: function(oevent) {
                                        alert("Input Selected");
                                    }*/
                                }),
                                new sap.ui.commons.MenuItem({
                                    text: resourceLoader.getText("txt_counter"),
                                    icon: resourceLoader.getImagePath("counter_scale.png")
                                    /* attachSelect: function(oevent) {
                                        alert("Variable Selected");
                                    }*/
                                })
                            ]


                    })
                    })); 

                } 
                else {
                    toolItems.push(new sap.ui.commons.Button({
                        icon: "sap-icon://add",
                        tooltip: resourceLoader.getText("tol_add"),
                        //text: resourceLoader.getText("tol_add"),
                        press: function(oevent) {
                            createCalculatedColumn();
                        }

                    }));

                }

                this.removeButton = new sap.ui.commons.Button({
                    icon: "sap-icon://delete",
                    tooltip: resourceLoader.getText("tol_remove"),
                    //text: resourceLoader.getText("tol_remove"),
                    enabled: false,
                    press: function(oevent) {

                        var selectedIndex = that.table.getSelectedIndex();
                        var bindContext = that.table.getContextByIndex(selectedIndex);
                        if (bindContext) {
                            var elementName = bindContext.getProperty("name");
                            var element = that.viewNode.elements.get(elementName);

                            if (element) {
                                var callback = function(okPressed) {
                                    if (okPressed) {
                                        that.removeButton.setEnabled(false);
                                        that._execute(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].elements["' + elementName + '"]'));
                                    }
                                };
                                var dialog = new ReferenceDialog({
                                    undoManager: that._undoManager,
                                    element: [element],
                                    fnCallbackMessageBox: callback,
                                    isRemoveCall: true
                                });
                                dialog.openMessageDialog();
                            }
                            //that._execute(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].elements["' + elementName + '"]'));
                        }
                    }
                });
                toolItems.push(this.removeButton);

                // toolbar creation
                var toolBar = new sap.ui.commons.Toolbar({
                    width: "100%",
                    items: toolItems
                }).addStyleClass("parameterToolbarStyle");


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

                //return this.splitter;
                // this.mainLayout.createRow(splitter);
                this.mainLayout.addContent(this.splitter);
                return this.mainLayout;
            },

            getMasterListContent: function() {
               var that = this;
                var commentValue;


                // Name template     
                var icon = new sap.ui.commons.Image({
                    src: "{icon}"
                });
                icon.bindProperty("tooltip", "tooltip");
                var nameText = new sap.ui.commons.TextField({
                    wrapping: true,

                    editable: false,
					customData: [{
						Type: "sap.ui.core.CustomData",
						key: "lineage",
						writeToDom: true,
						value: {
							parts: [{
								path: "lineage"
							}],
							formatter: function( lineage) {
								if (lineage !== undefined) {
									return "lineage";
								} else {
									return "none";
								}

							}
						}},{
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
                    attributes.endUserTexts = {comment:{ text: value, mimetype: "text/plain"}}; 
                    
                    var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
                   if(value || value === ""){
                    that._execute(command);
                   }
                };

                
                  var commentField = new sap.ui.commons.TextArea({                     
                    
                    editable: true,
                    enabled: true,
                    rows: 10,
                    change: changeComments ,
                    liveChange: changeComments
                    }).addStyleClass("commentField");
                   commentField.attachBrowserEvent("keydown", function(event) {
					if ((event.keyCode) && (event.keyCode === 27)) {
						commentValue = event.currentTarget.value;
						commentField.setValue(commentValue);
						tpComments.close();
						commentField.setValue(commentValue);
					}
				}, "");
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
                    attributes.endUserTexts = {comment:{ text: "", mimetype: "text/plain"}}; 
                    
                    var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
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
                    commentImage = new sap.ui.commons.Image({
                     src: {
                        parts: ["comment"],
                        formatter: function(comment) {
                              comment = comment ? (comment.trim()) : comment;
							if ((comment !== "") && (comment !== undefined)) {
                                    return resourceLoader.getImagePath("Note.png", "analytics");
                                } else {
                                    return resourceLoader.getImagePath("Note_grayscale.png", "analytics");
                                }
                            
                        }
                    },
                    tooltip: {
                        parts: ["comment"],
                        formatter: function(comment) {
                               if (comment!=="") {
                                    return comment;
                                } else {
                                    return resourceLoader.getText("msg_add_comment");
                                }
                            
                        }
                    },
                    
                    press: function() {
	                  tpComments.setOpener(this);
	                  commentValue=undefined;
	                  var element = this.getParent().getBindingContext().getObject();
	                  commentField.setBindingContext(this.getParent().getBindingContext());     
                        if (tpComments.isOpen()) {
                  
                            tpComments.close();
                        } else {
                            commentField.setValue(element.comment);
                            tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);
                             
                        }
                    }
                    
                });


                



                

                var columns = [new sap.ui.table.Column({
                    autoResizable: false,
                    resizable: false,
                    template: commentImage,
                    width: "43px",
                    label: new sap.ui.commons.Label({
                        //text: "Notes"
                    })
                }),new sap.ui.table.Column({
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
                })];

                if (this.viewNode.isDefaultNode()) {
                    columns.push(new sap.ui.table.Column({
                        autoResizable: true,
                        resizable: true,
                        template: labelText,
                        label: new sap.ui.commons.Label({
                            text: resourceLoader.getText("tit_label"),
                            textAlign: sap.ui.core.TextAlign.Begin
                        })
                    }));
                }

                // Table creation     
                this.table = new sap.ui.table.Table({
                    editable: false,
                    //height: "95%",
                    //enableColumnFreeze: true,
                    navigationMode: sap.ui.table.NavigationMode.Scrollbar,
                    noData: resourceLoader.getText("msg_no_calculated_columns"),
                    //rowHeight: 15,
                    //showOverLay: true,
                    visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                    selectionBehavior: sap.ui.table.SelectionBehavior.Row,
                    selectionMode: sap.ui.table.SelectionMode.Single,
                    columns: columns,
                    //toolbar: toolBar,
                    rowSelectionChange: function(oevent) {
                        var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
                        if (bindContext) {
                            that.removeButton.setEnabled(true);
                            var element = bindContext.getProperty("element");
                            if (element.measureType === "counter") {
                                if (!that.counterDetailsEditor) {
                                    that.counterDetailsEditor = new CounterDetails({
                                        undoManager: that._undoManager,
                                        viewNode: that.viewNode
                                    });
                                }
                                that.counterDetailsEditor.updateDetails(element);

                                that.splitter.removeAllSecondPaneContent();
                                that.splitter.addSecondPaneContent(that.counterDetailsEditor.getContent());
                            } else {
                                if (!that.detailsEditor) {
                                    that.detailsEditor = new CalculatedColumnDetails({
                                        undoManager: that._undoManager,
                                        gotoExpressionEditor: gotoExpressionEditorPage,
                                        gotoSemantics: gotoSemanticTypePage,
                                        viewNode: that.viewNode,
                                        columnView: that._model.columnView,
                                        context:that.context
                                    });
                                }
                                that.detailsEditor.updateDetails(element);

                                that.splitter.removeAllSecondPaneContent();
                                that.splitter.addSecondPaneContent(that.detailsEditor.getContent());
                            }

                        } else {
                            that.removeButton.setEnabled(false);
                        }
                    }
                }).addStyleClass("dummyTabTest");

                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);

                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.updateExpressionEditorData, this);
                this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.updateExpressionEditorData, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.updateExpressionEditorData, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updateExpressionEditorData, this);


                var gotoExpressionEditorPage = function(attributes) {
                    that.splitter.removeAllSecondPaneContent();
                    if (!that.expressionEditor) {
                        that.expressionEditor = new ExpressionDetails({
                            undoManager: that.undoManager,
                            viewNode: that.viewNode,
                            columnView: that._model.columnView,
                            callBack: gotoDetailsPage,
                            element: attributes.element,
                            updateExpression: attributes.updateExpression
                        });
                    }
                    that.expressionEditor.updateElementModel();
                    that.expressionEditor.setExpression(attributes.element);
                    that.splitter.addSecondPaneContent(that.expressionEditor.getContent());
                };
                var gotoDetailsPage = function() {
                    that.splitter.removeAllSecondPaneContent();
                    that.splitter.addSecondPaneContent(that.detailsEditor.getContent());
                };
                var gotoSemanticTypePage = function(attributes) {
                    that.splitter.removeAllSecondPaneContent();
                    that.semanticTypeDetails = new SemanticTypeDetails({
                        undoManager: that._undoManager,
                        viewNode: that.viewNode,
                        element: that.viewNode.elements.get(attributes.element.name),
                        context: that.context,
                        callBack: gotoDetailsPage
                    });

                    that.splitter.addSecondPaneContent(that.semanticTypeDetails.getContent());
                };

                this.table.bindRows("/");
                this.table.setModel(this.model);

                this.updateData();

                if (this.table.getModel() && this.table.getModel().oData && this.table.getModel().oData.length > 0) {
                    this.table.setSelectedIndex(0);
                }

                that.ccTable = this.table;
				if (that._columnLineage !== undefined) {
				that._columnLineage.registerTable("cc", this.table);
			}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("cc", this.table);
				}		
                return this.table;

            },

            modelChanged: function(object, event) {
                var that = this;

                this.updateData();

                if (object.type == commands.ViewModelEvents.ELEMENT_CREATED) {
                    for (var i = 0; i <= that.table.getModel().oData.length; i++) {
                        var element = that.table.getModel().oData[i];
                        if (element && element.name === object.name) {
                            that.table.setSelectedIndex(i);
                            if (i === 0) {
                                this.table.clearSelection();
                                this.table.setSelectedIndex(0);
                            }
                            break;
                        }
                    }

                } else if (object.type == commands.ViewModelEvents.ELEMENT_DELETED) {
                    var foundIndex = this.table.getSelectedIndex();
                    if (this.table.getModel() && this.table.getModel().oData) {
                        if (this.table.getModel().oData.length > 0) {
                            if (foundIndex === 0) {
                                this.table.clearSelection();
                                this.table.setSelectedIndex(0);
                            } else {
                                this.table.setSelectedIndex(foundIndex - 1);
                            }
                            return;
                        }
                    }
                    this.splitter.removeAllSecondPaneContent();
                    this.removeButton.setEnabled(false);
                }
            },

            getData: function() {
                var that = this;
                var columnsData = [];

                this.viewNode.elements.foreach(function(element) {
                    if (element.calculationDefinition) {
                        if (element.measureType !== "restriction") {
                            var icon;
                            if (that.viewNode.isDefaultNode()) {
                                if (element.measureType === "counter") {
                                    icon = "counter_scale.png";
                                } else {
                                    icon = element.aggregationBehavior === "none" ? "Calculated_Attribute.png" : "CalculatedMeasure.png";
                                }
                            } else {
                                icon = "CalculatedColumn.png";
                            }
                            var proxyResults = CalcViewEditorUtil.isBasedOnElementProxy({
                                object: element,
                                viewNode: that.viewNode
                            });
                            if (proxyResults) {
                                icon = resourceLoader.getImagePath("proxy/" + icon);
                            } else {
                                icon = resourceLoader.getImagePath(icon);
                            }
                            var tooltip = "";
                            if (proxyResults) {
                                tooltip = CalcViewEditorUtil.consolidateResults(proxyResults);
                            }
                            columnsData.push({
                                name: element.name,
                                label: element.label,
                                icon: icon,
                                element: element,
                                tooltip: tooltip,
                                comment: element.endUserTexts !== undefined ? element.endUserTexts.comment.text : "" ,
                               	lineage:element.lineage	

                            });
                        }
                    }
                });
                return columnsData;
            },

            updateData: function() {
                var data = this.getData();
                this.model.setData(data);
                this.model.updateBindings();
                //this.updateExpressionEditorData();
            },

            updateExpressionEditorData: function() {
                if (this.expressionEditor) {
                    this.expressionEditor.updateElementModel();
                }

            },
			updateTable: function() {
				var that = this;
				if (that._columnLineage !== undefined) {
					that._columnLineage.registerTable("cc", that.ccTable);
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("cc", that.ccTable);
				}
			}

        };

        return CalculatedColumnsPane;

    });

