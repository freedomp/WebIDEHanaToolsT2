/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../dialogs/NewFindDialog",
        "./Mapping",
        "../../viewmodel/ModelProxyResolver",
        "./JoinMapping",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../viewmodel/model",
        "../CalcViewEditorUtil",
        "../dialogs/ReferenceDialog"
    ],
	function(ResourceLoader, NewFindDialog, Mapping, ModelProxyResolver, JoinMapping, modelbase, commands, CalcViewEditorUtil, model,
		CalcViewEdritorUtil, ReferenceDialog) {
		"use strict";
		var dummyReplaceCommand = function(parameters) {
		    this.startFlag=parameters.startFlag;
		};

		
		dummyReplaceCommand.prototype = {
			execute: function(model, events) {
			    if(this.startFlag){
				    model.columnView.$getEvents().publish(commands.ViewModelEvents.REPLACE_ACTIONS_START);
			    }
				else {
				  model.columnView.$getEvents().publish(commands.ViewModelEvents.REPLACE_ACTIONS_STOP);
				}
			},
			undo: function(model, events) {
				if(this.startFlag){
				    model.columnView.$getEvents().publish(commands.ViewModelEvents.REPLACE_ACTIONS_STOP);
				}
				else {
				   model.columnView.$getEvents().publish(commands.ViewModelEvents.REPLACE_ACTIONS_START);
				}
			}
		};
		

		var ReplaceDataSourceAndNode = function(parameter) {
			this.context = parameter.context;
			this.viewNode = parameter.viewNode;
			this.inputSource = parameter.inputSource;
			this.typeOfReplace = parameter.typeOfReplace;
			this._undoManager = parameter.undoManager;
			this.entity = null;
			this.inputObject;
			this.isDeleteNode = parameter.isDeleteNode;
			this.callBack = parameter.callBack;
		};
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		ReplaceDataSourceAndNode.prototype = {

			openRDSNDialog: function() {
				var that = this;

				if (sap.ui.getCore().byId("WEB_IDE_REPLACE_Mapping")) {
					sap.ui.getCore().byId("WEB_IDE_REPLACE_Mapping").destroy();
				}

				that.replace = false;
				that.proxyElements = [];
				var hasJoin = (that.viewNode.type === "JoinNode" && that.viewNode.joins._keys.length > 0 && that.typeOfReplace === CalcViewEditorUtil.typeOfReplace
					.DATASOURCE_WITH_DATASOURCE) ? true : (that.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE && CalcViewEditorUtil.getParentNodeName(
					that.viewNode).type === "JoinNode") ? true : false;

				var joinDelete = false;
				var deleteCheckBox = function(flag) {
					if (hasJoin) {
						nextBtn.setEnabled(flag);
						if (joinDelete) {
							finishBtn.setEnabled(flag);
						}
					} else {
						finishBtn.setEnabled(flag);
					}
				};
				var deleteCheckBoxforJoin = function(flag) {
					joinDelete = flag;
					finishBtn.setEnabled(flag);
				}

				//mapping control 
				var parameter = {
					viewNode: that.viewNode,
					inputSource: that.inputSource,
					undoManager: that._undoManager,
					typeOfReplace: that.typeOfReplace,
					callBackForDeleteCheckBox: deleteCheckBox,
					isDeleteNode: that.typeOfReplace !== CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE ? true : false
				};

				var mappingControl;

				//wizard effet 
				var oCarousel2 = new sap.ui.commons.Carousel();
				oCarousel2.setOrientation("horizontal");
				oCarousel2.setVisibleItems(1);
				oCarousel2.setHeight("350px");
				oCarousel2.setWidth("100%");
				oCarousel2.addStyleClass("hideNextPrevBtn");

				var rowSelectEvent = function(selected) {
					nextBtn.setEnabled(selected);
				};
				var onNext = function(selected) {
					findDailog.pressOK();
					findDailog.destroy();
				};

				var type = ["TABLE", "CALCULATIONVIEW", "ATTRIBUTEVIEW", "ANALYTICVIEW","hdbtablefunction","CALCULATIONVIEW_HISTORY","VIEW"];
				if (that.viewNode && that.viewNode.isStarJoin()) {
					type = ["CALCULATIONVIEW"];
				}

				//find dialog 
				var findDailog = new NewFindDialog("", {
					multiSelect: false,
					noOfSelection: 1,
					context: that.context,
					types: type,
					replaceDataSourceDailog: true,
					currentViewName: that.viewNode.$$model.columnView.name,
					onOK: function(data) {
						// mappingControl.setNewSource(data);
						//  
						if (data && data[0]) {
							var source = data[0];
							//    

//							if (source.name) {
//								that.entityObj = that.viewNode.$$model._entities.get(source.packageName + '::' + source.name);
//							} else {
//								that.entityObj = that.viewNode.$$model._entities.get('\"' + source.schemaName + '\".' + source.name);
//							}
							
							that.entityObj = that.viewNode.$$model._entities.get(source.name);
							
							var insertProxy = function() {
								that.inputSource.mappings.foreach(function(m) {
									if (m.sourceElement) {
										var name = m.sourceElement.name;
										if (that.entityOb && !that.entityObj.elements.get(name)) {
											var attr = {
												name: name,
												label: name,
												isProxy: true
											};
											that.entityObj.createOrMergeElement(attr, null, null);
											that.proxyElements.push(name);
										}
									}

								});

								that.viewNode.joins.foreach(function(oJoin) {
									if (oJoin.leftInput == that.inputSource) {
										oJoin.leftElements.foreach(function(e) {
											if (!that.entityObj.elements.get(e.name)) {
												var attr = {
													name: e.name,
													label: e.name,
													isProxy: true
												};
												that.entityObj.createOrMergeElement(attr, null, null);
												that.proxyElements.push(e.name);
											}
										});
									} else if (oJoin.rightInput == that.inputSource) {
										oJoin.rightElements.foreach(function(e) {
											if (!that.entityObj.elements.get(e.name)) {
												var attr = {
													name: e.name,
													label: e.name,
													isProxy: true
												};
												that.entityObj.createOrMergeElement(attr, null, null);
												that.proxyElements.push(e.name);
											}
										});
									}
								});

							};
							if (that.entityObj) {
								insertProxy();
								if (!(that.viewNode.isStarJoin() && that.inputSource.getSource().type === model.EntityType.CALCULATION_VIEW)) {
									mappingControl.setNewSource(that.entityObj);
								}
								if (joinMapping) {
									joinMapping.setNewSource(that.entityObj);
								}
								oCarousel2.showNext();
							} else {
								var entityParameters = {
									id:source.id,
									name: source.name,
									schemaName: source.schemaName,
									packageName: source.packageName,
									type: source.type,
									isProxy: true
								};
								that.viewNode.$$model.createEntity(entityParameters);

								var updateMappingDialog = function() {

									if (source.packageName) {
										that.entityObj = that.viewNode.$$model._entities.get(source.packageName + '::' + source.name);
									} else {
										that.entityObj = that.viewNode.$$model._entities.get('\"' + source.schemaName + '\".' + source.name);
									}
									// name,label,isProxy
									insertProxy();

									if (!(that.viewNode.isStarJoin() && that.inputSource.getSource().type === model.EntityType.CALCULATION_VIEW)) {
										mappingControl.setNewSource(that.entityObj);
									}
									if (joinMapping) {
										joinMapping.setNewSource(that.entityObj);
									}
									oCarousel2.showNext();
								};
								ModelProxyResolver.ProxyResolver.resolve(that.viewNode.$$model, that.context, updateMappingDialog);
							}
						}

					},
					onSelectTableRow: rowSelectEvent,
					onPressNext: onNext
				});

				var RDSNDialog = new sap.ui.commons.Dialog("WEB_IDE_REPLACE_Mapping", {
					"width": "700px",
					"tooltip": "Replace Data Source and Node",
					"modal": true,
					closed: function() {
						if (!that.replace && that.entityObj) {

							for (var i = 0; i < that.entityObj.elements._keys.length;) {
								var key = that.entityObj.elements._keys[i];
								if (typeof key !== "undefined") {
									if (that.entityObj.elements._values[key].isProxy) {
										that.entityObj.elements.remove(that.entityObj.elements._values[key].name);
									} else {
										i++;
									}
								}
							}

						}
						if (that.callBack) {
							that.callBack(that.replace);

						}
					}

				});				
				RDSNDialog.setTitle("Find");
				RDSNDialog.addStyleClass("calcViewTableInDialog ");

				var finishBtn = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_finish"),
					text: resourceLoader.getText("txt_finish"),
					enabled: false,
					press: function() {

						var mappings = {};
						if (!(that.viewNode.isStarJoin() && that.inputSource.getSource().type === model.EntityType.CALCULATION_VIEW)) {
							mappings.aMappings = mappingControl.execute();
						}
						if (that.isDeleteNode) {
							mappings.deleteNode = deleteNodeCheckBox.getChecked();
						}
						if (joinMapping) {
							mappings.joinMapping = joinMapping.execute();
						}
						// that._undoManager.execute(new commands.ReplaceDataSource(that.viewNode, that.inputSource, that.entityObj, mappings));
						// 

						if (that.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE) {
							//passing mappings, new node name
							that.adjustNodeReplace(mappings, mappingControl);
						} else {
							that.adujestMappingInReplaceDataSource(mappings);
						}
					

						RDSNDialog.close();
					}
				});

				var mappingPrv = function() {
					RDSNDialog.setTitle(resourceLoader.getText("txt_find_title"));
					oCarousel2.showPrevious();
					nextBtn.detachPress(mappingNext);
					nextBtn.detachPress(findNext);
					nextBtn.attachPress(findNext);
					finishBtn.setEnabled(false);
					prevBtn.setEnabled(false);

				};
				var joinPrv = function() {
					//   RDSNDialog.setTitle("Replace data Source Colums");
					RDSNDialog.setTitle(resourceLoader.getText("tit_replace_source_maping"));
					oCarousel2.showPrevious();
					prevBtn.detachPress(joinPrv);
					prevBtn.attachPress(mappingPrv);
					prevBtn.setEnabled(true);
					nextBtn.setEnabled(true);
				}

				var prevBtn = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_dialog_prev"),
					text: resourceLoader.getText("txt_dialog_prev"),
					enabled: false
					// press: mappingPrv
				});

				var mappingNext = function() {
					//  joinMapping.setNewMapping(mappingControl.oMappingControl.getTransformation().getMappings());
					oCarousel2.showNext();
					//RDSNDialog.setTitle("Replace Join");
					RDSNDialog.setTitle(resourceLoader.getText("tit_replace_join"));
					//nextBtn.detachPress(mappingNext);
					//nextBtn.attachPress(findNext);
					prevBtn.setEnabled(true);
					nextBtn.setEnabled(false);
					prevBtn.detachPress(mappingPrv);
					prevBtn.attachPress(joinPrv);
				};

				var findNext = function() {
					findDailog.pressOK();
					prevBtn.setEnabled(true);
					finishBtn.setEnabled(true);
					if (hasJoin) {
						nextBtn.setEnabled(true);
						nextBtn.detachPress(findNext);
						nextBtn.attachPress(mappingNext);
					} else {
						nextBtn.setEnabled(false);
					}
					if ((that.viewNode.isStarJoin() && that.inputSource.getSource().type === model.EntityType.CALCULATION_VIEW)) {
						nextBtn.setEnabled(false);
					}
					prevBtn.detachPress(mappingPrv);
					prevBtn.attachPress(mappingPrv);
					//finishBtn.setEnabled(false);
					// RDSNDialog.setTitle("Replace data Source Colums");
					RDSNDialog.setTitle(resourceLoader.getText("tit_replace_source_maping"));
				};

				var nextBtn = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_dialog_next"),
					text: resourceLoader.getText("txt_dialog_next"),
					enabled: false,
					press: findNext
				});

				var oneTime = true;
				var nodeReplaceNext = function() {
					nextBtn.setEnabled(false);
					prevBtn.setEnabled(true);

					RDSNDialog.setTitle(resourceLoader.getText("tit_replace_join"));
					if (oneTime) {
						joinMapping.oldInput = joinMapping.viewNode;
						oneTime = false;
					}
					joinMapping.viewNode = CalcViewEditorUtil.getParentNodeName(that.viewNode);
					joinMapping.setNewSource(that.viewNode.$$model.columnView.viewNodes.get(mappingControl.getNewNodeName()));
					//joinMapping.updateMappingControl();

					oCarousel2.showNext();
				};
				var nodeReplacePrv = function() {
					nextBtn.setEnabled(true);
					prevBtn.setEnabled(false);
					//   finishBtn.setEnabled(false);
					oCarousel2.showPrevious();
					RDSNDialog.setTitle(resourceLoader.getText("tit_replace_node_mapping"));
				};

				var findDailogContend = findDailog.getDialogContend();
				// create a simple CheckBox
				var deleteNodeCheckBox = new sap.ui.commons.CheckBox({
					text: 'Delete Source Node',
					tooltip: 'Delete Source Node',
					checked: false
				});
				var oLayout = new sap.ui.layout.VerticalLayout({
					content: [findDailogContend],
					width: "100%"
				});
				if (that.typeOfReplace !== CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE && that.isDeleteNode) {
					oLayout.addContent(deleteNodeCheckBox);
				}

				RDSNDialog.setTitle(resourceLoader.getText("tit_replace_node_mapping"));
				if (!(that.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE)) {
					oCarousel2.addContent(oLayout);
					RDSNDialog.setTitle(resourceLoader.getText("txt_find_title"));
				}

				if (!(that.viewNode.isStarJoin() && that.inputSource.getSource().type === model.EntityType.CALCULATION_VIEW)) {
					mappingControl = new Mapping(parameter);
					oCarousel2.addContent(mappingControl.getContend());
				}

				/*  var oLayout = new sap.ui.layout.VerticalLayout( {
                    content: [oCarousel2,deleteNodeCheckBox] ,
                    width:"100%"
                });*/

				RDSNDialog.addContent(oCarousel2);

				//  RDSNDialog.addContent(findDialog.getFindContend({}));
				RDSNDialog.addButton(prevBtn);
				RDSNDialog.addButton(nextBtn);
				RDSNDialog.addButton(finishBtn);
				var joinMapping;
				if (hasJoin) {
					parameter.callBackForDeleteCheckBox = deleteCheckBoxforJoin;
					joinMapping = new JoinMapping(parameter);
					oCarousel2.addContent(joinMapping.getContend());
					//  nextBtn.setEnabled(hasJoin);
					if (that.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE && CalcViewEditorUtil.getParentNodeName(that.viewNode).type ===
						"JoinNode") {
						nextBtn.detachPress(findNext);
						nextBtn.attachPress(nodeReplaceNext);
						prevBtn.attachPress(nodeReplacePrv);
					}
				}

				RDSNDialog.open();
			},

			adujestMappingInReplaceDataSource: function(mappings) {
				var that = this;
				that.oldInput = that.inputSource;
				// this.elementName = elementName;
				that.aMappings = mappings.aMappings;
				that.newInput = that.entityObj;
				that.joinMapping = mappings.joinMapping;
				var commandsList = [];

            	commandsList.push(new dummyReplaceCommand({startFlag:true}));
			
				//deleting mapping 
			/*	that.oldInput.mappings.foreach(function(mapping) {
					commandsList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].inputs["' + that.oldInput.$getKeyAttributeValue() +
						'"].mappings["' + mapping.$getKeyAttributeValue() + '"]"'));
				});*/
			
				//deleting joins
				var join;
				that.viewNode.joins.foreach(function(oJoin) {
					if (oJoin.leftInput == that.inputSource || oJoin.rightInput == that.inputSource) {
						join = oJoin;
					}
				});
				if (join) {
					for (var key in join.leftElements._keys) {
					    if( join.leftElements._keys.hasOwnProperty(key) === false){continue;}
						var properties = {
							leftColumn: join.leftElements._values[join.leftElements._keys[key]],
							rightColumn: join.rightElements._values[join.rightElements._keys[key]],
							removeColumn: true
						};
						commandsList.push(new commands.ChangeJoinPropertiesCommand(that.viewNode.name, join.$$defaultKeyValue, properties));
					}
				}

				var EntityProperty = {
					name: that.newInput.name,
					schemaName: that.newInput.schemaName,
					packageName: that.newInput.packageName,
					type: that.newInput.type,
					isProxy: false
				};
				commandsList.push(new commands.ChangeInputCommand(that.viewNode.name, that.oldInput.$getKeyAttributeValue(), {}, that.viewNode.name,
					EntityProperty));


				if (that.aMappings !== undefined) {
					for (var index in that.aMappings) {
					      if(that.aMappings.hasOwnProperty(index) === false){continue;}
						var attributes = {};
						if (that.aMappings[index].sourcePaths[0] && that.aMappings[index].targetPaths[0]) {
							var sourceName = that.aMappings[index].sourcePaths[0].split("/");
							var targetName = that.aMappings[index].targetPaths[0].split("/");
							attributes.mappingAttributes = {
								sourceElement: that.newInput.elements.get(sourceName[sourceName.length - 1]),
							
								type: "ElementMapping"
							};
							attributes.inputId = that.oldInput.$getKeyAttributeValue();
							attributes.mappingId = index;
							commandsList.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));
							
							var pIndex = that.proxyElements.indexOf(sourceName[sourceName.length - 1]);
							if (pIndex > -1) {
								that.proxyElements.splice(pIndex, 1);
							}

						}
					}

				}
				if (that.joinMapping && join) {
					var joinMapping = that.joinMapping;

					for (var index in joinMapping) {
					    if(joinMapping.hasOwnProperty(index) === false){continue;}
						if (joinMapping[index].sourcePaths[0] && joinMapping[index].targetPaths[0]) {
							var sourceName = joinMapping[index].sourcePaths[0].split("/");
							var targetName = joinMapping[index].targetPaths[0].split("/");

							var properties;
							if (join.leftInput !== that.oldInput) {
								properties = {
									leftColumn: join.leftInput.getSource().elements.get(targetName[targetName.length - 1]),
									rightColumn: that.entityObj.elements.get(sourceName[sourceName.length - 1])
								};
							} else {
								properties = {
									leftColumn: that.entityObj.elements.get(sourceName[sourceName.length - 1]),
									rightColumn: join.leftInput.getSource().elements.get(targetName[targetName.length - 1])
								};
							}
							var index = that.proxyElements.indexOf(sourceName[sourceName.length - 1]);
							if (index > -1) {
								that.proxyElements.splice(index, 1);
							}
							commandsList.push(new commands.ChangeJoinPropertiesCommand(that.viewNode.name, join.$$defaultKeyValue, properties));
						}
					}
				}

				for (var i in that.proxyElements) {
					that.entityObj.elements.remove(that.proxyElements[i]);
				}

				if (mappings.deleteNode) {
					//deleting view node
					commandsList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.oldInput.getSource().name + '"]'));
				}
				commandsList.push(new dummyReplaceCommand({startFlag:false}));
				that._undoManager.execute(new modelbase.CompoundCommand(commandsList));
				that.replace = true;

			},

			adjustNodeReplace: function(mapping, mappingControl) {
				var joinMapping = mapping.joinMapping;
				var mappings = mapping.aMappings;
				var that = this;
				var targetNode = CalcViewEdritorUtil.getParentNodeName(that.viewNode);
				var targetInput;
				targetNode.inputs.foreach(function(input) {
					if (input.getSource() === that.viewNode) {
						targetInput = input;
					}
				});
				var newNode = that.viewNode.$$model.columnView.viewNodes.get(mappingControl.getNewNodeName());
				var commandsList = [];
				commandsList.push(new dummyReplaceCommand({startFlag:true}));
			/*	targetInput.mappings.foreach(function(mapping) {
					commandsList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + targetNode.name + '"].inputs["' + targetInput.$getKeyAttributeValue() +
						'"].mappings["' + mapping.$getKeyAttributeValue() + '"]"'));
				});*/

				// removing existing joins 
				targetNode.joins.foreach(function(join) {
					for (var key in join.leftElements._keys) {
					    if(join.leftElements._keys.hasOwnProperty(key) === false){continue;}
						var properties = {
							leftColumn: join.leftElements._values[join.leftElements._keys[key]],
							rightColumn: join.rightElements._values[join.rightElements._keys[key]],
							removeColumn: true
						};
						commandsList.push(new commands.ChangeJoinPropertiesCommand(targetNode.name, 0, properties));
					}
				});

				//deleting non existing column in viewnode up semantics 
				var listOfElements = mappingControl.oMappingControl.getTransformation().target.rootNode.nodes;
				var listOfProxyElements = [];
				for (var i in listOfElements) {
				    if(listOfElements.hasOwnProperty(i) === false){continue;}
					if (listOfElements[i]["field-type"] !== "COLUMN") {
						listOfProxyElements.push(targetNode.elements.get(listOfElements[i].name));
					}
				}
				var dialog = new ReferenceDialog({
					undoManager: that._undoManager,
					element: listOfProxyElements,
					isRemoveCall: true,
					isDialog: true
				});
				dialog.openMessageDialog();
				var list = dialog.deleteElements();
				for (var j in list) {
				    if(list.hasOwnProperty(j) === false){continue;}
					commandsList.push(list[j]);
				}
				//change the input 
				commandsList.push(new commands.ChangeInputCommand(targetNode.name, targetInput.$getKeyAttributeValue(), {}, newNode.name, undefined));

				//creating mapping 
				if (mappings !== undefined) {
					for (var index in mappings) {
					     if(mappings.hasOwnProperty(index) === false){continue;}
						var attributes = {};
					/*	if (mappings[index].sourcePaths[0] && mappings[index].targetPaths[0]) {
							var sourceName = mappings[index].sourcePaths[0].split("/");
							var targetName = mappings[index].targetPaths[0].split("/");
							attributes.mappingAttributes = {
								sourceName: sourceName[sourceName.length - 1],
								targetName: targetName[targetName.length - 1],
								type: "ElementMapping"
							};
							attributes.input = targetInput;
							attributes.merge = true;
							commandsList.push(new commands.CreateMappingCommand(targetNode.name, attributes));

						}*/
						
							if (mappings[index].sourcePaths[0] && mappings[index].targetPaths[0]) {
							var sourceName = mappings[index].sourcePaths[0].split("/");
							var targetName = mappings[index].targetPaths[0].split("/");
							attributes.mappingAttributes = {
								sourceElement: newNode.elements.get( sourceName[sourceName.length - 1]),
								type: "ElementMapping"
								
							};
							attributes.inputId = targetInput.$getKeyAttributeValue();
							attributes.mappingId = index;
							commandsList.push(new commands.ChangeMappingPropertiesCommand(targetNode.name, attributes));

						}
					}

				}

				//creating joins
				if (joinMapping !== undefined) {

					var leftInput;
					var rightInput;
					targetNode.inputs.foreach(function(input) {
						if (input !== targetInput) {
							leftInput = input;
						}
					});
					for (var index in joinMapping) {
					     if(joinMapping.hasOwnProperty(index) === false){continue;}
						if (joinMapping[index].sourcePaths[0] && joinMapping[index].targetPaths[0]) {
							var sourceName = joinMapping[index].sourcePaths[0].split("/");
							var targetName = joinMapping[index].targetPaths[0].split("/");

							var properties;
							if (!(targetNode.joins._values[0].leftInput !== targetInput)) {
								properties = {
									leftColumn: newNode.elements.get(targetName[targetName.length - 1]),
									rightColumn: targetInput.getSource().elements.get(sourceName[sourceName.length - 1])
								};
							} else {
								properties = {
									leftColumn: newNode.elements.get(sourceName[sourceName.length - 1]),
									rightColumn: leftInput.getSource().elements.get(targetName[targetName.length - 1])
								};
							}

							commandsList.push(new commands.ChangeJoinPropertiesCommand(targetNode.name, 0, properties));
						}
					}

				}

				if (that.isDeleteNode || mappingControl.deleteNodeCheckBox.getChecked()) {
					//deleting view node
					commandsList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"]'));
				}
            	commandsList.push(new dummyReplaceCommand({startFlag:false}));
				//executing the commands 
				that._undoManager.execute(new modelbase.CompoundCommand(commandsList));

			}
		};
		return ReplaceDataSourceAndNode;
	});
