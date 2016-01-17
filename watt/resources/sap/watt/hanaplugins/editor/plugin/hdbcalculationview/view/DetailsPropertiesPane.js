/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "../base/MetadataServices",
        "../dialogs/NewFindDialog",
        "../viewmodel/ModelProxyResolver"
    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, MetadataServices, FindDialog, ModelProxyResolver) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var myService = MetadataServices.SearchService;
		//var schemaMapping = SchemaMappingService.schemaMapping;
		var schemas;

		/**
		 * @class
		 */
		var DetailsPropertiesPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._context = parameters.context;
			this._model = parameters.model;
			this._isScriptNode = parameters.isScriptNode;
			this.isStarJoin = parameters.isStarJoin;
			this.historyParam = null;
			this.fixedClient = null;
			this.loButtonOK = null;
		};

		DetailsPropertiesPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},
			subScribeEvenets: function() {
				this._model.columnView.executionHints.$getEvents().subscribe(commands.ViewModelEvents.COLUMNVIEW_CHANGED, this.modelChanged, this);
			},
			modelChanged: function(object, event) {
				this.updateModelBinding(this.genaricModel);
			},
			updateModelBinding: function(genaricModel) {
				var genaricProperties = {
					columns: []
				};
				this._model.columnView.executionHints.genericHints.foreach(function(genaric) {
					genaricProperties.columns.push(genaric);
				});
				genaricModel.setData(genaricProperties);
				genaricModel.updateBindings(true);
			},
			getContent: function() {
				var that = this;
				var commentValue;
				that.subScribeEvenets();
				//var layout = new sap.ui.layout.form.ResponsiveGridLayout();
				var loMatrix = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false,
					width: '100%',
					widths: ['30%', '30%', '40%'],
					columns: 3
				});

				var loMatrix2 = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: false,
					width: '100%',
					widths: ['30%', '30%', '40%'],
					columns: 3
				});

				/*                var oPanel1 = new sap.ui.commons.Panel({
                    width: '100%',
                    showCollapseIcon: false,
                    collapsed: false,
                    text: resourceLoader.getText("txt_general_prop"),
                    content: loMatrix,
                });*/

				var generalHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});

				//Comments
				var commentImage = true;
				var getComment = function() {
					var comment = that._model.columnView.endUserTexts !== undefined ? that._model.columnView.endUserTexts.comment.text : "";
					if (comment !== "") {
						return comment;
					} else {
						return "";
					}
				};

				var getCommentIcon = function() {
					var comment = getComment();
					comment = comment ? (comment.trim()) : comment;
					if ((comment !== "") && (comment !== undefined)) {
						return resourceLoader.getImagePath("Note.png", "analytics");
					} else {
						return resourceLoader.getImagePath("Note_grayscale.png", "analytics");
					}
				};
				var getTooltip = function() {
					var comment = getComment();
					if (comment !== "") {
						return comment;
					} else {
						return resourceLoader.getText("msg_add_comment");
					}
				};
				var changeComments = function(event) {

					var value = event.getParameter("newValue");
					if (commentValue || commentValue === "") {
						value = commentValue;
					}
					if (value || value === "") {
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
								label: that._model.columnView.label
							}, {
								comment: {
									text: value,
									mimetype: "text/plain"
								}
							}

						));
					}
					commentImage.setSrc(getCommentIcon());
					commentImage.setTooltip(getTooltip());
				};
				var commentField = new sap.ui.commons.TextArea({

					editable: true,
					enabled: true,
					rows: 10,
					change: changeComments,
					liveChange: changeComments
				}).addStyleClass("commentField");

				var oButton3 = new sap.ui.commons.Image({
					src: resourceLoader.getImagePath("DeleteIcon.png", "analytics"),
					tooltip: resourceLoader.getText("txt_clear"),
					width: "20px",
					height: "20px",
					press: function() {
						commentField.setValue("");

						that._execute(new commands.ChangeColumnViewPropertiesCommand({
								label: that._model.columnView.label
							}, {
								comment: {
									text: "",
									mimetype: "text/plain"
								}
							}

						));

						commentImage.setSrc(getCommentIcon());
						commentImage.setTooltip(getTooltip());
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
					src: getCommentIcon(),
					tooltip: getTooltip(),
					press: function() {
						commentValue = undefined;
						tpComments.setOpener(this);
						if (tpComments.isOpen()) {
							tpComments.close();
						} else {
							commentField.setValue(getComment());
							tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);
						}
					}

				}).addStyleClass("viewCommentImage");

				generalHeaderLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_general_prop"),
						design: sap.ui.commons.LabelDesign.Bold
					}), commentImage],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle"));

				var generalLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%",
				}).addStyleClass("viewPropertiesLayout");
				generalLayout.addContent(generalHeaderLayout);
				generalLayout.addContent(loMatrix);

				/*                var oPanel2 = new sap.ui.commons.Panel({
                    width: '100%',
                    showCollapseIcon: false,
                    collapsed: false,
                    text: resourceLoader.getText("txt_advanced_prop"),
                    content: loMatrix2,
                });
*/
				var advancedHeaderLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});

				advancedHeaderLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_advanced_prop"),
						design: sap.ui.commons.LabelDesign.Bold
					})],
					hAlign: sap.ui.commons.layout.HAlign.Left,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("viewPropertiesHeaderStyle"));

				var advancedLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%",
				}).addStyleClass("viewPropertiesLayout");
				advancedLayout.addContent(advancedHeaderLayout);
				advancedLayout.addContent(loMatrix2);

				var schemaListBox = new sap.ui.commons.ListBox();

				var typeListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "STANDARD",
							text: resourceLoader.getText("txt_standard")
						}),
                        new sap.ui.core.ListItem({
							key: "TIME",
							text: resourceLoader.getText("txt_time")
						}),
                    ]
				});

				var runWithListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "DEFINER",
							text: resourceLoader.getText("txt_definer")
						}),
                        new sap.ui.core.ListItem({
							key: "INVOKER",
							text: resourceLoader.getText("txt_invoker")
						}),
                    ]
				});
				var dataCategoryListBox;
				if (this._isScriptNode || this.isStarJoin) {
					dataCategoryListBox = new sap.ui.commons.ListBox({
						items: [
                            new sap.ui.core.ListItem({
								key: "DEFAULT",
								text: ""
							}),
                            new sap.ui.core.ListItem({
								key: "CUBE",
								text: resourceLoader.getText("txt_cube")
							})

                        ]
					});
				} else {

					dataCategoryListBox = new sap.ui.commons.ListBox({
						items: [
                            new sap.ui.core.ListItem({
								key: "DEFAULT",
								text: ""
							}),
                            new sap.ui.core.ListItem({
								key: "CUBE",
								text: resourceLoader.getText("txt_cube")
							}),
                            new sap.ui.core.ListItem({
								key: "DIMENSION",
								text: resourceLoader.getText("txt_dimension")
							}),
                        ]
					});
				}
				var privilegesListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "NONE",
							text: ""
						}),
                        /*new sap.ui.core.ListItem({
							key: "ANALYTIC_PRIVILEGE",
							text: resourceLoader.getText("txt_analytic_privileges")
						}),*/
                        new sap.ui.core.ListItem({
							key: "SQL_ANALYTIC_PRIVILEGE",
							text: resourceLoader.getText("txt_sql_analytic_privileges")
						}),
                    ]
				});

				var clientListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "SESSION_CLIENT",
							text: resourceLoader.getText("txt_session_client")
						}),
                        new sap.ui.core.ListItem({
							key: "CROSS_CLIENT",
							text: resourceLoader.getText("txt_cross_client")
						}),
                        new sap.ui.core.ListItem({
							key: "FIXED_CLIENT",
							text: resourceLoader.getText("txt_fixed_client")
						}),
                    ],
					//visible: false
				});

				var executeInListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "DEFAULT",
							text: ""
						}),
                        new sap.ui.core.ListItem({
							key: "SQL",
							text: resourceLoader.getText("txt_sql_engine")
						}),
                    ]
				});

				var cacheListBox = new sap.ui.commons.ListBox({
					items: [
                        new sap.ui.core.ListItem({
							key: "DEFAULT",
							text: ""
						}),
                        new sap.ui.core.ListItem({
							key: "HOURLY",
							text: resourceLoader.getText("txt_hourly")
						}),
                        new sap.ui.core.ListItem({
							key: "DAILY",
							text: resourceLoader.getText("txt_daily")
						}),
                    ]
				});

				// Matrix layout changes
				//Name of the view
				var lonameLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_name_of_view"),
					textAlign: "Left",
					width: '90%'
				});

				var nameField = new sap.ui.commons.TextField({
					value: "{/name}",
					editable: false,
					enabled: false,
					width: '100%',
					/*change: function(event) {
                        var value = event.getParameter("newValue");
                        that._execute(new commands.ChangeColumnViewPropertiesCommand({
                            name: value
                        }));
                    }*/
				}).addStyleClass("dummyTest1");

				lonameLabel.setLabelFor(nameField);
				loMatrix.createRow(lonameLabel, nameField);

				//Description/Label
				var lodescLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_description"),
					textAlign: "Left",
					width: '90%'
				});

				var description = new sap.ui.commons.TextField({
					value: "{/label}",
					editable: true,
					width: '100%',
					textAlign: "Left",
					change: function(event) {
						var value = event.getParameter("newValue");
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							label: value
						}));
					}
				}).addStyleClass("dummyTest2");

				lodescLabel.setLabelFor(description);
				loMatrix.createRow(lodescLabel, description);

				//Type
				if (!that._isScriptNode) {
					var loTypeLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_type1"),
						textAlign: "Left",
						width: '90%'
					});

					var dimensionType = new sap.ui.commons.DropdownBox({
						listBox: typeListBox,
						width: '100%',
						editable: false,
						enabled: false,
						selectedKey: "{/dimensionType}",
					}).addStyleClass("dummyTest3");

					loTypeLabel.setLabelFor(dimensionType);
					loMatrix.createRow(loTypeLabel, dimensionType);
				}

				//Data category
				var lodataCatLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_data_category"),
					textAlign: "Left",
					width: '90%'
				});

				var dataCategory = new sap.ui.commons.DropdownBox({
					listBox: dataCategoryListBox,
					width: '100%',
					selectedKey: "{/dataCategory}",
					change: function(event) {
						var source = event.getSource();
						var key = source.getSelectedKey();
						if (key === "DIMENSION") {
							var containsDescriptionColumn = false;
							that._model.columnView.getDefaultNode().elements.foreach(function(element) {
								if (element.name && element.name.indexOf(".description") !== -1) {
									containsDescriptionColumn = true;
								}
							});

							if (containsDescriptionColumn) {
								dataCategory.setSelectedKey(that._model.columnView.dataCategory);
								// open a fully configured message box
								sap.ui.commons.MessageBox.show(
									resourceLoader.getText("msg_data_category_description_error"),
									sap.ui.commons.MessageBox.Icon.ERROR,
									resourceLoader.getText("tit_data_category"), [sap.ui.commons.MessageBox.Action.OK]);
							} else {
								var oText = new sap.ui.commons.TextView({
									text: resourceLoader.getText("txt_data_category_dimension")
								});
								var dialog = new sap.ui.commons.Dialog({
									modal: true,
									content: oText,
									width: "600px",
									title: "Data Category",
									showCloseButton: false
								});

								dialog.addButton(new sap.ui.commons.Button({
									text: "OK",
									press: function() {
										var commandList = [];
										commandList.push(new commands.ChangeColumnViewPropertiesCommand({
											dataCategory: key
										}));
										that._model.columnView.getDefaultNode().elements.foreach(function(element) {
											// change the measures to attributes
											if (element.aggregationBehavior !== "none") {

												// delete counters and restricted measures
												if (element.measureType === "counter" || element.measureType === "restriction") {
													commandList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that._model.columnView.getDefaultNode().name +
														'"].elements["' + element.name + '"]'));
												} else {
													var attributes = CalcViewEditorUtil.createModelForElementAttributes();
													attributes.objectAttributes.aggregationBehavior = "none";
													attributes.objectAttributes.displayFolder = undefined;
													commandList.push(new commands.ChangeElementPropertiesCommand(that._model.columnView.getDefaultNode().name, element.name,
														attributes));
												}
											}
										});
										that._execute(new modelbase.CompoundCommand(commandList));
										dialog.close();
									}
								}));
								dialog.addButton(new sap.ui.commons.Button({
									text: "Cancel",
									press: function() {
										dataCategory.setSelectedKey(that._model.columnView.dataCategory);
										dialog.close();
									}
								}));
								dialog.open();
							}
						} else {
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								dataCategory: key
							}));
						}
					}
				}).addStyleClass("dummyTest4");

				lodataCatLabel.setLabelFor(dataCategory);
				loMatrix.createRow(lodataCatLabel, dataCategory);

				//Default Client
				// if (!that._isScriptNode) {
				var loclientLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_default_client"),
					textAlign: "Left",
					width: '90%',
					visible: false
				});
				var defaultClient = new sap.ui.commons.DropdownBox({
					listBox: clientListBox,
					editable: true,
					width: '100%',
					visible: false,
					//value: resourceLoader.getText("txt_session_client"),
					selectedKey: "{/clientDependent}",
					change: function(event) {
						var source = event.getSource();
						var key = source.getSelectedKey();
						if (key === "FIXED_CLIENT") {
							if (that.fixedClient !== null) {
								that.fixedClient.setVisible(true);
								that._execute(new commands.ChangeColumnViewPropertiesCommand({
									clientDependent: true
								}));
							}
						} else if (key === "SESSION_CLIENT") {
							if (that.fixedClient !== null) {
								that.fixedClient.setVisible(false);
							}
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								fixedClient: undefined
							}));
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								clientDependent: true
							}));
						} else {
							if (that.fixedClient !== null) {
								that.fixedClient.setVisible(false);
							}
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								fixedClient: undefined
							}));
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								clientDependent: false
							}));
						}
					},
				}).addStyleClass("dummyTest5");

				that.fixedClient = new sap.ui.commons.TextField({
					value: "{/fixedClient}",
					width: '2.7em',
					textAlign: "Left",
					maxLength: 3,
					required: true,
					visible: false,
					change: function(event) {
						var value = event.getParameter("newValue");
						var fixedClient = /^\d{3}$/;
						if (value.match(fixedClient)) {
							//that.fixedClient.setValue(value);
							CalcViewEditorUtil.clearErrorMessageTooltip(that.fixedClient);
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								fixedClient: value
							}));
						} else {
							// alert("Enter 3 digit numeric value");
							CalcViewEditorUtil.showErrorMessageTooltip(that.fixedClient, "Enter 3 digit numeric value");
							that.fixedClient.setValue("");
						}

					}
				}).addStyleClass("dummyTest6");

				if (that._model.columnView.clientDependent) {
					if (that._model.columnView.fixedClient && that._model.columnView.fixedClient !== "") {
						defaultClient.setValue(resourceLoader.getText("txt_fixed_client"));
						that.fixedClient.setVisible(true);
					} else {
						defaultClient.setValue(resourceLoader.getText("txt_session_client"));
						that.fixedClient.setVisible(false);
					}
				} else {
					defaultClient.setValue(resourceLoader.getText("txt_cross_client"));
					that.fixedClient.setVisible(false);
				}

				loclientLabel.setLabelFor(defaultClient);
				loMatrix.createRow(loclientLabel, defaultClient, that.fixedClient);
				//}

				//Apply Privileges
				var loprivilegeLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_apply_privileges"),
					textAlign: "Left",
					width: '90%'
				});

				var applyPrivileges = new sap.ui.commons.DropdownBox({
					listBox: privilegesListBox,
					width: '100%',
					selectedKey: "{/applyPrivilegeType}",
					change: function(event) {
						var source = event.getSource();
						var key = source.getSelectedKey();
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							applyPrivilegeType: key
						}));
					}
				}).addStyleClass("dummyTest7");

				loprivilegeLabel.setLabelFor(applyPrivileges);
				loMatrix.createRow(loprivilegeLabel, applyPrivileges);

				//Allow relational optimization checkbox
				if (!that._isScriptNode) {
					var allowRelational = new sap.ui.commons.CheckBox({
						text: resourceLoader.getText("txt_allow_relational_opt"),
						//checked: false,
						change: function(event) {
							if (event.mParameters.checked) {
								allowRelational.setChecked(true);
							} else {
								allowRelational.setChecked(false);
							}
						}
					});

					var oCellRelat = new sap.ui.commons.layout.MatrixLayoutCell({
						colSpan: 3,
						content: allowRelational
					});
					//loMatrix2.createRow("", allowRelational);
				}

				// for union pruning ui start

				var pruningText = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_pruning"),
					width: "90%",
					textAlign: "Left"
				});

				var pruningTextBtn = new sap.ui.commons.TextField({
					width: "83%",
					value: "{/pruningTable}",
					change:function(event){
					   
							 that.updatePruning(pruningTextBtn.getValue());	
					}
				});
				
                that.updatePruning=function(pruningTable){
                    	that._execute(new commands.ChangeColumnViewPropertiesCommand({
										pruningTable:pruningTable
									}));
									//to fill the pruning information setting flag true 
									that._model.columnView.readPruningInformation=true;
									
									ModelProxyResolver.ProxyResolver.readPruningInfo(that._model, that._context, function(){
									  that._model.columnView.$$events.publish(commands.ViewModelEvents.VIEWNODE_CHANGED);
									});
								
                };
				var viewButton = new sap.ui.commons.Button({
					text: "...",
					width: "7%",
					press: function(oevent) {

						var findDialog = new NewFindDialog("", {
							multiSelect: false,
							noOfSelection: 1,
							context: that._context,
							types: ["TABLE"],
							dTitle:resourceLoader.getText("tit_find_Pruning_Table"),
							onOK: function(selectedResource) {

								if (selectedResource) {
									var name = selectedResource[0].name;
									var schema = selectedResource[0].physicalSchema;
									  that.updatePruning("\"" + schema + "\"" + "." + name);
								}
							}
						});
						findDialog.searchFile();
					}

				}).addStyleClass("sematicsValueHelpButton");

				var unionPruning = new sap.ui.commons.layout.MatrixLayoutCell({
					content: [ pruningTextBtn, viewButton]
				});
			

				var oLabel = new sap.ui.commons.Label({
					icon: resourceLoader.getImagePath("Warning.png", "analytics")
				});
				oLabel.setText(resourceLoader.getText("txt_warning"));
				var oCellWarning = new sap.ui.commons.layout.MatrixLayoutCell({
					colSpan: 3,
					content: oLabel
				});
				var aggrResult = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("txt_always_aggregate_result"),
					checked: "{/alwaysAggregateResult}",
					change: function() {
						that._execute(new commands.ChangeColumnViewExecutionHintsPropertiesCommand({
							alwaysAggregateResult: this.getChecked()
						}));

					}
				}).addStyleClass("dummyTest14");

				loMatrix2.createRow(oCellWarning);
				loMatrix2.createRow(null);
				loMatrix2.createRow(null, aggrResult);
				//loMatrix2.createRow(pruningText,unionPruning);
				
				//Execute In
				if (!that._isScriptNode) {
					var loexecuteInLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_execute_in"),
						textAlign: "Left",
						width: '90%'
					});

					var executeIn = new sap.ui.commons.DropdownBox({
						listBox: executeInListBox,
						value: {
							path: "preferredEngine",
							formatter: function(preferredEngine) {
								if (preferredEngine == "SQL") {
									return resourceLoader.getText("txt_sql_engine");
								} else {
									return "";
								}
							}
						},
						width: '100%',
						selectedKey: "{/preferredEngine}",
						change: function(event) {
							var source = event.getSource();
							var key = source.getSelectedKey();
							that._execute(new commands.ChangeColumnViewExecutionHintsPropertiesCommand({
								preferredEngine: key
							}));
						}
					}).addStyleClass("dummyTest8");
					loexecuteInLabel.setLabelFor(executeIn);
					loMatrix2.createRow(loexecuteInLabel, executeIn);
				}

				//Default Schema
				var loschemaLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_default_schema"),
					textAlign: "Left",
					width: '90%'
				});

				var defaultSchema = new sap.ui.commons.ComboBox({
					listBox: schemaListBox,
					width: '100%',
					value: "{defaultSchema}",
					change: function(event) {
						var value = event.getParameter("newValue");
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							defaultSchema: value
						}));
					}
				});

				//Create a tree
				var oTree = new sap.ui.commons.Tree();
				oTree.setWidth("220px");
				oTree.setHeight("300px");
				oTree.setShowHeader(false);
				oTree.setShowHeaderIcons(false);
				oTree.setShowHorizontalScrollbar(false);

				//create Tree Nodes
				var oNode1 = new sap.ui.commons.TreeNode({
					text: "<None>",
					expanded: true
				});
				var oNode2 = new sap.ui.commons.TreeNode({
					text: "Currency Schemas",
					icon: resourceLoader.getImagePath("folder.png", "analytics"),
					expanded: true
				});
				var oNode3 = new sap.ui.commons.TreeNode({
					text: "Unit Schemas",
					icon: resourceLoader.getImagePath("folder.png", "analytics"),
					expanded: true
				});
				var oNode4 = new sap.ui.commons.TreeNode({
					text: "Other Schemas",
					icon: resourceLoader.getImagePath("folder.png", "analytics"),
					expanded: true
				});

				//add Tree Node root to the Tree
				oTree.addNode(oNode1);
				oTree.addNode(oNode2);
				oTree.addNode(oNode3);
				oTree.addNode(oNode4);
				oTree.addStyleClass("customProperties");

				//Get the Unit tables using Search functionality
				var objectTypeContext = [];
				var modeArray_rt = [];
				var typesArray_rt = [];
				var mode_rt = {
					"main": "RT"
				};
				modeArray_rt.push(mode_rt);
				var type = {
					"main": "TABLE"
				};
				typesArray_rt.push(type);
				var objectModel = {
					mode: modeArray_rt,
					type: typesArray_rt
				};
				objectTypeContext.push(objectModel);

				var getSchemas = function() {
					var q = Q.defer();

					function onComplete(result) {
						q.resolve(result);
					}
					/*if (that._context.service) {
						//that._context.service.catalogDAO.getSchemas(undefined, undefined, undefined, undefined, onComplete);
						//.done();
					}*/
					return q.promise;
				};

				/*function getSchemaMapping() {
					schemaMapping.getSchemaMapping(that._context, function(results) {
						if (results) {
							for (var i = 0; i < results.length; i++) {
								var obj = results[i];
								for (var j = 0; j < oNode2.getNodes().length; j++) {
									var node2SchemaName = oNode2.getNodes()[j].getText();
									if (node2SchemaName === obj[1]) {
										oNode2.getNodes()[j].setText(obj[0] + " (" + node2SchemaName + ")");
									}
								}
								for (var k = 0; k < oNode3.getNodes().length; k++) {
									var node3SchemaName = oNode3.getNodes()[k].getText();
									if (node3SchemaName === obj[1]) {
										oNode3.getNodes()[k].setText(obj[0] + " (" + node3SchemaName + ")");
									}
								}
								for (var l = 0; l < oNode4.getNodes().length; l++) {
									var node4SchemaName = oNode4.getNodes()[l].getText();
									if (node4SchemaName === obj[1]) {
										oNode4.getNodes()[l].setText(obj[0] + " (" + node4SchemaName + ")");
									}
								}
							}
							//q.resolve();
						}
					});
					//return q.promise;
				}*/

				Q.all([
                    getSchemas(),
                    that.searchWithPromise("T006", objectTypeContext),
                    that.searchWithPromise("TCUR", objectTypeContext)
                ])
					.spread(function(schemas, unitResults, currResults) {
						// here you combine the results and calculate the parameter for schema mapping
						if (unitResults) {
							for (var i = 0; i < unitResults.length; i++) {
								var schemaFound = false;
								if (unitResults[i].mainType === "TABLE") {
									for (var j = 0; j < oNode3.getNodes().length; j++) {
										if (oNode3.getNodes()[j].getText() === unitResults[i].schema) {
											schemaFound = true;
											break;
										} else {
											continue;
										}
									}
									if (!schemaFound) {
										var schemaInSchemas = false;
										if (schemas && schemas.schemas) {
											for (var k = 0; k < schemas.schemas.length; k++) {
												if (schemas.schemas[k].schemaName === unitResults[i].schema) {
													schemaInSchemas = true;
													break;
												} else {
													continue;
												}
											}
										}
										if (schemaInSchemas) {
											oNode3.addNode(new sap.ui.commons.TreeNode({
												text: unitResults[i].schema,
												icon: resourceLoader.getImagePath("schema.png", "analytics")
											}));
										}
									}
								}
							}
						}
						if (currResults) {
							for (var i = 0; i < currResults.length; i++) {
								var schemaFound = false;
								if (currResults[i].mainType === "TABLE") {
									for (var j = 0; j < oNode2.getNodes().length; j++) {
										if (oNode2.getNodes()[j].getText() === currResults[i].schema) {
											schemaFound = true;
											break;
										} else {
											continue;
										}
									}
									if (!schemaFound) {
										var schemaInSchemas = false;
										if (schemas) {
											for (var k = 0; k < schemas.schemas.length; k++) {
												if (schemas.schemas[k].schemaName === currResults[i].schema) {
													schemaInSchemas = true;
													break;
												} else {
													continue;
												}
											}
										}
										if (schemaInSchemas) {
											oNode2.addNode(new sap.ui.commons.TreeNode({
												text: currResults[i].schema,
												icon: resourceLoader.getImagePath("schema.png", "analytics")
											}));
										}
									}
								}
							}

						}

						if (schemas) {
							for (var i = 0; i < schemas.schemas.length; i++) {
								var schemaFound = false;
								for (var j = 0; j < oNode3.getNodes().length; j++) {
									if (oNode3.getNodes()[j].getText() === schemas.schemas[i].schemaName) {
										schemaFound = true;
										break;
									} else {
										continue;
									}
								}
								if (!schemaFound) {
									for (var k = 0; k < oNode2.getNodes().length; k++) {
										if (oNode2.getNodes()[k].getText() === schemas.schemas[i].schemaName) {
											schemaFound = true;
											break;
										} else {
											continue;
										}
									}
								}
								if (!schemaFound) {
									oNode4.addNode(new sap.ui.commons.TreeNode({
										text: schemas.schemas[i].schemaName,
										icon: resourceLoader.getImagePath("schema.png", "analytics")
									}));
								}
							}
						}
						//getSchemaMapping();
					})
				// does default error handling, i.e. shows a message in case of exceptions
				.done();

				var defSchema = new sap.ui.commons.TextField({
					width: '100%',
					value: "{/defaultSchema}",
					textAlign: "Left",
					editable: false,
					enabled: false
				}).addStyleClass("dummyTest9");

				var btn1 = new sap.ui.commons.Button({
					//text: "...",
					icon: "sap-icon://value-help",
					//width: "5%",
					press: function() {
						if (tp1.isOpen()) {
							tp1.close();
						} else {
							tp1.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);
						}
					}
				}).addStyleClass("defaultSchemaValueHelpButton");

				var tp1 = new sap.ui.ux3.ToolPopup({
					title: "Default Schema",
					content: [oTree],
					autoClose: true,
					opener: btn1
				});

				oTree.attachBrowserEvent('dblclick', function(oEvent) {
					var selectedNode = oTree.getSelection().getText();
					if (selectedNode === "<None>") {
						//defSchema.setValue("");
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							defaultSchema: ""
						}));
						tp1.close();
					} else if (selectedNode !== "<None>" && selectedNode !== "Currency Schemas" && selectedNode !== "Unit Schemas" && selectedNode !==
						"Other Schemas") {
						//defSchema.setValue(selectedNode);
						if (selectedNode.indexOf("(") !== -1) {
							var schema = selectedNode.split("(");
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								defaultSchema: schema[0].trim()
							}));
						} else {
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								defaultSchema: selectedNode
							}));
						}
						tp1.close();

					}
				});

				//loschemaLabel.setLabelFor(defSchema);
				// var cell = new sap.ui.commons.layout.MatrixLayoutCell();
				// cell.addContent(defSchema);
				// cell.addContent(btn1);

				//loMatrix.createRow(loschemaLabel, defSchema, btn1);

				//Cache Invalidation Period
				var locacheLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_cache_Invalid_period"),
					textAlign: "Left",
					width: '90%'
				});

				var cache = new sap.ui.commons.DropdownBox({
					listBox: cacheListBox,
					width: '100%',
					value: {
						path: "cacheInvalidationPeriod",
						formatter: function(cacheInvalidationPeriod) {
							return cacheInvalidationPeriod;
						}
					},
					selectedKey: "{/cacheInvalidationPeriod}",
					change: function(event) {
						var source = event.getSource();
						var key = source.getSelectedKey();
						that._execute(new commands.ChangeColumnViewExecutionHintsPropertiesCommand({
							cacheInvalidationPeriod: key
						}));
					}
				}).addStyleClass("dummyTest13");

				locacheLabel.setLabelFor(cache);
				loMatrix2.createRow(locacheLabel, cache);

				var oTable = new sap.ui.table.Table({
					visibleRowCount: 4,
					selectionMode: sap.ui.table.SelectionMode.MultiToggle

				}).addStyleClass("view-table");
				var genaricProperties = {
					columns: []
				};
				that.genaricModel = new sap.ui.model.json.JSONModel();
				this._model.columnView.executionHints.genericHints.foreach(function(genaric) {
					genaricProperties.columns.push(genaric);
				});
				that.genaricModel.setData(genaricProperties);

				var nameTextField = new sap.ui.commons.TextField({
					liveChange: function(event) {
						var value = event.getParameter("liveValue");
						var existingValueRange;
						that.genaricModel.getData().columns.forEach(function(row) {
							if (row.name === value) {
								existingValueRange = "Key  is already used with name " + value;
							}
						});

						if (existingValueRange) {
							this.setTooltip(existingValueRange);
							this.setValueState(sap.ui.core.ValueState.Error);
							CalcViewEditorUtil.showErrorMessageTooltip(event.getSource(), "Key  is already used with name ");
						} else {
							this.setTooltip(null);
							this.setValueState(sap.ui.core.ValueState.None);
						}
					}
				});
				nameTextField.bindProperty("value", {
					path: "name",
					formatter: function(name) {
						return name;
					}

				});
				nameTextField.attachChange(function(oevent) {

					var newName = oevent.getParameter("newValue");
					var existingValueRange;
					that.genaricModel.getData().columns.forEach(function(row) {
						if (row.name === newName) {
							existingValueRange = "Key  is already used with name " + newName;
						}
					});
					if (newName !== "" && !existingValueRange) {
						var Name = oevent.getSource().getBindingContext().getProperty("name");
						var genaricCommand = new commands.CreateOrChangeGenericHint(Name, {
							name: newName
						});
						that._undoManager.execute(genaricCommand);
						that.genaricModel.updateBindings(true);
					} else {
						that.genaricModel.updateBindings(true);
						this.setValueState(sap.ui.core.ValueState.None);
						this.setTooltip(null);
						oTable.setSelectionInterval();
						if (newName === "") {
							// CalcViewEditorUtil.showErrorMessageTooltip(oevent.getSource(), resourceLoader.getText("Name is not empty"));
							// oevent.getSource().setValueState(sap.ui.core.ValueState.Error);
							//this.setValue( oevent.getSource().getBindingContext().getProperty("name"));
							//openToolTip("value should not be empty",oevent.getSource());
						} else if (existingValueRange) {
							// CalcViewEditorUtil.showErrorMessageTooltip(oevent.getSource(), resourceLoader.getText("Name is already defined by "+ oevent.getSource().getBindingContext().getProperty("name")));
							//oevent.getSource().setValueState(sap.ui.core.ValueState.Error);
							//openToolTip("value already exist",oevent.getSource());
						}
					}
				});
				var valueTextField = new sap.ui.commons.TextField();
				valueTextField.bindProperty("value", {
					path: "value",
					formatter: function(value) {
						return value;
					}
				});
				valueTextField.attachChange(function(oevent) {
					var Name = oevent.getSource().getBindingContext().getProperty("name");
					var value = oevent.getParameter("newValue");
					var genaricCommand = new commands.CreateOrChangeGenericHint(Name, {
						value: value
					});
					that._undoManager.execute(genaricCommand);
					that.genaricModel.updateBindings(true);
				});
				var executeHintsLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("Execution Hints:"),
					//textAlign: "Left",
					width: '90%'
				});
				executeHintsLabel.setDesign(sap.ui.commons.LabelDesign.Bold);
				if (!this._isScriptNode) {
					loMatrix2.createRow(executeHintsLabel);
				}
				var tLayout = new sap.ui.commons.layout.MatrixLayout({
					visible: true,
					columns: 2, // int
					widths: ["70%", "30%"]
				});

				oTable.setWidth("500px");
				var nameColumn = new sap.ui.table.Column({
					width: "100%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("Name")
					}),
					template: nameTextField

				});
				var valueColumn = new sap.ui.table.Column({
					width: "100%",
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("Value")
					}),
					template: valueTextField

				});
				var toolBar = new sap.ui.commons.Toolbar();
				toolBar.addStyleClass("parameterToolbarStyle");
				var createIcon = new sap.ui.commons.Button({
					icon: "sap-icon://add",
					tooltip: resourceLoader.getText("tol_add"),
					press: function() {
						var existingname;
						that.genaricModel.getData().columns.forEach(function(row) {
							if (row.name === "") {
								existingname = true;
							}
						});
						if (!existingname) {
							var genaricCommand = new commands.CreateOrChangeGenericHint(null, {
								name: "",
								value: ""
							});
							that._undoManager.execute(genaricCommand);
							that.genaricModel.updateBindings(true);
							oTable.setSelectionInterval(that.genaricModel.getData().columns.length - 1, that.genaricModel.getData().columns.length - 1);
						}
					}
				});
				var deleteIcon = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						path: "name",
						formatter: function() {
							if (that.genaricModel.getData().columns && that.genaricModel.getData().columns.length > 0) {
								return true;
							} else {
								return false;
							}
						}
					},
					press: function() {
						if (that.genaricModel.getData().hasOwnProperty("columns")) {
							var valueRanges = that.genaricModel.getData().columns;
							var selectedIndex;
							for (var i = oTable.getSelectedIndices().length; i > 0; i--) {
								selectedIndex = oTable.getSelectedIndices()[i - 1];
								that._undoManager.execute(new modelbase.DeleteCommand(that._model.columnView.executionHints.genericHints.get(valueRanges[
									selectedIndex].name), false));
								that.genaricModel.updateBindings(true);
							}
						}
						that.genaricModel.updateBindings(true);
						that.modelChanged();
						oTable.setSelectionInterval();
					}

				});

				toolBar.addItem(createIcon);
				toolBar.addItem(deleteIcon);
				oTable.setToolbar(toolBar);
				oTable.bindRows("/columns");
				oTable.setModel(that.genaricModel);
				oTable.addColumn(nameColumn);
				oTable.addColumn(valueColumn);
				tLayout.createRow(oTable);
				var oCell = new sap.ui.commons.layout.MatrixLayoutCell();
				oCell.addContent(tLayout);
				oCell.setColSpan(3);
				if (!this._isScriptNode) {
					loMatrix2.createRow(oCell);
				}

				//Default Member
				if (!that._isScriptNode) {
					var lomemberLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_default_member"),
						textAlign: "Left",
						width: '90%'
					});

					var defaultMember = new sap.ui.commons.TextField({
						value: "{/defaultMember}",
						width: '100%',
						textAlign: "Left",
						enabled: true,
						editable: true,
						change: function(event) {
							var value = event.getParameter("newValue");
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								defaultMember: value
							}));
						}
					}).addStyleClass("dummyTest10");

					lomemberLabel.setLabelFor(defaultMember);
					loMatrix.createRow(lomemberLabel, defaultMember);
				}

				//Always Aggregate result checkbox
			

				var dreprecateCheckBox = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("txt_deprecated"),
					checked: "{/deprecated}",
					change: function(event) {
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							deprecated: this.getChecked()
						}));
					}
				}).addStyleClass("dummyTest15");
				var translatableCheckBox = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("txt_translatable"),
					checked: "{/translationRelevant}",
					change: function(event) {
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							translationRelevant: this.getChecked()
						}));
						if (this.getChecked() === false) {
							openMessageBox();
						}
					}
				}).addStyleClass("dummyTest16");

				var openMessageBox = function() {
					// this is required since there is no direct access to the box's icons like MessageBox.Icon.WARNING 
					jQuery.sap.require("sap.ui.commons.MessageBox");

					// open a fully configured message box
					sap.ui.commons.MessageBox.show(resourceLoader.getText("msg_warning_transalate"),
						sap.ui.commons.MessageBox.Icon.WARNING,
						resourceLoader.getText("titl_warning"), [sap.ui.commons.MessageBox.Action.OK]
					);
				};
			/*	var oCellAggr = new sap.ui.commons.layout.MatrixLayoutCell({
					colSpan: 3,
					content: aggrResult
				});
            */
			
				loMatrix.createRow(null, dreprecateCheckBox);
				loMatrix.createRow(null, translatableCheckBox);

				//Enable History checkbox
				/*var enableHistory = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("txt_enable_history"),
					checked: "{/historyEnabled}",
					visible: false,
					change: function(event) {
						if (enableHistory.getChecked()) {
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								historyEnabled: enableHistory.getChecked()
							}));

						} else {
							that._execute(new commands.ChangeColumnViewPropertiesCommand({
								historyEnabled: enableHistory.getChecked(),
								historyParam: undefined
							}));
						}
					}
				}).addStyleClass("dummyTest11");

				var oCellhistory = new sap.ui.commons.layout.MatrixLayoutCell({
					colSpan: 3,
					content: enableHistory
				});

				loMatrix.createRow(null, enableHistory); */

				//History Input parameter
				var historyLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_history_parameter"),
					textAlign: "Left",
					width: '90%'
				});

				that.historyParam = new sap.ui.commons.DropdownBox({
					width: '100%',
					enabled: "{/historyEnabled}",
					selectedKey: "{/historyParamName}",
					change: function(event) {
						var source = event.getSource();
						var key = source.getSelectedKey();
						var newParameter;
						//that.historyParam.setValue(key);
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.name === key) {
								newParameter = parameter;
							}
						});
						that._execute(new commands.ChangeColumnViewPropertiesCommand({
							historyParameter: newParameter
						}));
					}
				}).addStyleClass("dummyTest12");

				var historyParamListItem = new sap.ui.core.ListItem({});
				historyParamListItem.bindProperty("text", "name");
				historyParamListItem.bindProperty("key", "name");

				that.historyParam.bindItems({
					path: "/historyParameterList",
					template: historyParamListItem
				});

				//historyLabel.setLabelFor(that.historyParam);
				//loMatrix.createRow(historyLabel, that.historyParam);
				if (that._isScriptNode) {
					//Run with
					var runWithLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_run_with"),
						textAlign: "Left",
						width: '90%'
					});

					var runWith = new sap.ui.commons.DropdownBox({
						listBox: runWithListBox,
						width: '100%',
						enabled: true,
						selectedKey: "{runWithValue}",
						change: function(event) {
							var source = event.getSource();
							var key = source.getSelectedKey();
							if (key === "INVOKER") {
								//runWith.setValue(resourceLoader.getText("txt_invoker"));
								that._execute(new commands.ChangeColumnViewExecutionHintsPropertiesCommand({
									runWithInvokerPrivileges: true
								}));
							} else {
								//runWith.setValue(resourceLoader.getText("txt_definer"));
								that._execute(new commands.ChangeColumnViewExecutionHintsPropertiesCommand({
									runWithInvokerPrivileges: false
								}));
							}
						}
					});
					//runWithLabel.setLabelFor(runWith);
					loMatrix.createRow(runWithLabel, runWith);
				}
				loMatrix.createRow(null);
				loMatrix.createRow(null);

				//create a horizontal Splitter
				var oSplitterH = new sap.ui.commons.Splitter();
				oSplitterH.setSplitterOrientation(sap.ui.commons.Orientation.horizontal);
				oSplitterH.setSplitterPosition("55%");
				// oSplitterH.setMinSizeFirstPane("50%");
				// oSplitterH.setMinSizeSecondPane("20%");
				oSplitterH.setWidth("100%");
				oSplitterH.setHeight("100%");

				oSplitterH.addFirstPaneContent(generalLayout);
				oSplitterH.addSecondPaneContent(advancedLayout);

				/*var oLayout = new sap.ui.layout.VerticalLayout({
                    width: '100%',
                    content: [oSplitterH]
                });*/

				//return form;
				//oLayout.addStyleClass("customProperties");
				//return oLayout;
				oSplitterH.addStyleClass("customProperties");
				oSplitterH.addStyleClass("viewPropertiesPane");
				return oSplitterH;
			},

			searchWithPromise: function(searchStr, objectTypeContext) {
				var q = Q.defer();

				function onComplete(result) {
					var metadata = result.metadata;
					q.resolve(metadata);
				}

				function onError(error) {
					var errorText = JSON.stringify(error);
					q.reject(errorText);
				}
				//myService.searchNew(searchStr, 'PATTERN', 100, false, false, true, onComplete, onError, objectTypeContext);
				return q.promise;

			}

		};

		return DetailsPropertiesPane;

	});
