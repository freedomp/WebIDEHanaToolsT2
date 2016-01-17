
/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../dialogs/NewFindDialog",
        "../dialogs/ReferenceDialog",
        "../dialogs/ConstantMappingDialog",
        "../dialogs/ExtractSemanticsDialog",
        "../actions/PropagateToSemantics",
        "../../viewmodel/ModelProxyResolver",
        "../PropertySourceProvider",
        "../../viewmodel/model",
        "../ReplaceDS_N/ReplaceDataSourceAndNode"
        
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, NewFindDialog, ReferenceDialog, ConstantMappingDialog,
        ExtractSemanticsDialog, PropagateToSemantics, ModelProxyResolver, PropertySourceProvider, viewModel, ReplaceDataSourceAndNode) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var MappingPane = function(parameters) {
            this._undoManager = parameters.undoManager;
            this._context = parameters.context;
            this.viewNode = parameters.viewNode;
            this._transformationModel = null;
            this.oMappingControl = null;
            this._model = parameters.model;
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.CHANGED, this.updateMappingControl, this);
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updatePropertiesControl, this);
            this.sourceTable = null;
            this.targetTable = null;
            
        };

        MappingPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.CHANGED, this.updateMappingControl, this);
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.updatePropertiesControl, this);
                }
            },
            getContent: function() {
                var that = this;

                var channelId = "sap.hana.ide.editor.plugin.analytics.view.mapping.editor"

                sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["com.sap.it.spc.webui.mapping"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
                sap.ui.getCore().loadLibrary('com.sap.it.spc.webui.mapping', '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/com/sap/it/spc/webui/mapping');
                sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["sap.watt.hanaplugins.editor.common.treemap"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
                sap.ui.getCore().loadLibrary('sap.watt.hanaplugins.editor.common.treemap',
                    '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/sap/hana/ide/common/plugin/treemap');

                jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx");
                jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images");

                this.oMappingControl = new sap.watt.hanaplugins.editor.common.treemap.MappingControlEx({
                    eventChannelId: channelId // unique id for event handling
                });
                //this._transformationModel = new sap.hana.ide.common.plugin.treemap.TransformationModelEx();
                this._transformationModel = new com.sap.it.spc.webui.mapping.models.TransformationModel();
                this._transformationModel.setJSONData(this.createModel());

                this.oMappingControl.setTransformation(this._transformationModel);
                //enable drag and drop
                // if (this.viewNode.type === "Union") {
                this.oMappingControl.setEditMode(true);
                // } else {
                //     this.oMappingControl.setEditMode(false);
                // }
                // set custom toolbars
                this.oMappingControl.setSourceMessageHeader(this.createCustomSourceToolbar(this.oMappingControl));
                this.oMappingControl.setTargetMessageHeader(this.createCustomTargetToolbar(this.oMappingControl));
                // set custom labels
                this.oMappingControl.setCustomSourceLabel(this.createSourceInlineEditorLabel());
                this.oMappingControl.setCustomTargetLabel(this.createTargetInlineEditorLabel());
                // set custom binding
                this.oMappingControl.setCustomSourceBinding("/rootNode");
                this.oMappingControl.setCustomTargetBinding("/rootNode");

                this.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_data_sources"));
                this.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("txt_output_columns"));

                MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_DELETE, this.callbackMappingDelete(), this);
                // Event handling for created mappings
                MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_CREATE, this.callbackMappingCreate(), this);
                // Event handling for updated mappings
                MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_UPDATE, this.callbackMappingUpdate(), this);

                // attach listener which allows to interupt the default mapping process
                // by "preventDefault" and replace it with own business logic
                this.oMappingControl.attachCreateMapping(this.callbackPreMappingCreate);
                this.oMappingControl.that = this;

                // drop validation
                this.oMappingControl.setDropValidator(function(aSources, oTarget) {
                    if (that.viewNode.dataSource) {
                        return false;
                    }
                    if (oTarget) {
                         if (aSources && aSources.length > 0 && (that.viewNode.type === "Union" || that.viewNode.isDefaultNode())) {
                            var sPath = aSources[0].xpath;
                            sPath = sPath.split("/");
                            if (sPath.length === 3) {
                                //drop input to target column
                                return false;
                            } else if (sPath.length === 4) {
                                var inputName = sPath[2];
                                var sourceName = sPath[3];
                                var targetName = oTarget.xpath.split("/");
                                targetName = targetName[targetName.length - 1];

                                var input;
                                var sourceElement;
                                var targetElement;

                                that.viewNode.inputs.foreach(function(obj) {
                                    if (CalcViewEditorUtil.getInputName(obj) === inputName) {
                                        input = obj;
                                    }
                                });
                                if (input) {
                                    sourceElement = input.getSource().elements.get(sourceName);
                                    targetElement = that.viewNode.elements.get(targetName);
                                }

                                if (sourceElement && targetElement) {
                                    var mappingExist = false;
                                    input.mappings.foreach(function(mapping) {
                                        if (mapping.sourceElement === sourceElement && mapping.targetElement === targetElement) {
                                            mappingExist = true;
                                            return
                                        }
                                    });
                                    if (mappingExist) {
                                        return false;
                                    }

                                }
                            }
                        } else {
                            return false;
                        }
                        return true;
                    } else {
                        if (aSources && aSources.length > 0) {
                            return true;
                        }
                    }
                    return false;
                });

                this.refreshToolItems();

                that.mLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: true,
                    columns: 2,
                    widths: ["40%", "60%"]
                });

                /* this.oMappingControl._getTargetTable().attachRowSelectionChange(function(oEvent) {
                                that.refreshToolItems();
                                var iIndex = oEvent.getParameter("rowIndex");
                                if (iIndex === -1) {
                                    iIndex = oEvent.getParameter("rowIndices")[0];
                                }
                                var oMessageTable = oEvent.getSource();
                                var oContext = oMessageTable.getContextByIndex(iIndex);
                                var sXPath = oContext.getProperty("xpath");
                                var res = sXPath.split("/");
                                var elementName = res[res.length - 1];
                                var element = that.viewNode.elements.get(elementName);
                                mLayout.destroyRows();
                                var _propertySource = new PropertySourceProvider(element, mLayout, that._undoManager, that.viewNode, that._model);
                                _propertySource.createContent();
                            });*/

                this.oMappingControl._getSourceTable().attachRowSelectionChange(function(oEvent) {
                    that.refreshToolItems();
                });

                this.oMappingControl.attachNodeSelectionChange(function(oEvent) {
                    oEvent.preventDefault();
                    //see output for details
                    //console.log(oEvent.getParameters());
                    var xPath = oEvent.getParameters().node.xpath;
                    var res = xPath.split("/");
                    var elementName = res[res.length - 1];
                    var selectedElement = that.viewNode.elements.get(elementName);
                    if (that.mLayout) {
                        that.mLayout.destroyRows();
                    }
                    var isSource = false;
                    if (oEvent.getParameters().entityType === "MAPPING_LIBRARY-ENTITY_TYPE-SOURCE") {
                        var inputName;
                        var column;
                        isSource = true;
                        /*  if (res.length === 4) {
                                              inputName = res[2];
                                              column = res[3];
                                          }
                                          if (res.length === 3) {
                                              inputName = res[2];

                                          } */
                        var flagForColumn = false;
                        var fqname;
                        that.viewNode.inputs.foreach(function(input) {
                            fqname = CalcViewEditorUtil.getInputName(input);
                            if ('/RootSourceElement/' + fqname === xPath) {
                                flagForColumn = true;
                                inputName = fqname;
                            }
                        });
                        if (flagForColumn) {

                            column = null;
                        } else {
                            var root = '/RootSourceElement/';
                            inputName = xPath.substring(root.length, (xPath.length - elementName.length) - 1);
                            column = elementName;
                        }
                        if (that.viewNode.inputs._keys.length > 0) {
                            if (column) {
                                that.viewNode.inputs.foreach(function(input) {
                                    that.input = input;
                                    var source = input.getSource();
                                    if (source && source.elements && inputName && column) {
                                        source.elements.foreach(function(element) {
                                            var source = that.input.getSource();
                                            if (inputName === CalcViewEditorUtil.getInputName(that.input)) {
                                                selectedElement = source.elements.get(column);
                                            }
                                        });
                                    }
                                });
                            } else {
                                that.viewNode.inputs.foreach(function(input) {
                                    var newInputName;
                                    var schemaName;
                                    if (input.getSource() instanceof viewModel.Entity && input.getSource().type === "DATA_BASE_TABLE") {
                                        if (input.getSource().physicalSchema) {
                                            schemaName = input.getSource().physicalSchema;
                                        } else {
                                            schemaName = input.getSource().schemaName;
                                        }
                                        if (input.alias) {
                                            newInputName = "\"" + schemaName + "\"." + input.getSource().name + "(" + input.alias + ")";
                                        } else {
                                            newInputName = "\"" + schemaName + "\"." + input.getSource().name;
                                        }
                                        if (inputName === newInputName) {
                                            selectedElement = input;
                                        }
                                    } else if (input.getSource() instanceof viewModel.Entity) {
                                        if (input.getSource().fqName === inputName) {
                                            selectedElement = input;
                                        }
                                    } else if (input.getSource() instanceof viewModel.ViewNode) {
                                        if (input.getSource().name === inputName) {
                                            selectedElement = input;
                                        }
                                    }

                                });
                            }
                        }
                    }
                    var selectedViewNode = that.viewNode;
                    if (inputName) {
                        that._model.columnView.viewNodes.foreach(function(viewNode) {
                            if (viewNode.name === inputName) {
                                selectedViewNode = viewNode;
                            }

                        });
                    }
                    if (selectedElement) {
                        var _propertySource = new PropertySourceProvider({
                            element: selectedElement,
                            layout: that.mLayout,
                            undoManager: that._undoManager,
                            viewNode: that.viewNode,
                            model: that._model,
                            isSource: isSource,
                            context: that._context
                        });

                        _propertySource.createContent();
                    }
                    that.refreshToolItems();
                });

                var isCollapse = true;

                var toggleFunction = function() {
                    if (isCollapse) {
                        imageButton.setIcon("sap-icon://collapse-group");
                        var splitterHeight = $("#" + that.mainLayout.splitterDIV.id).height();
                        var splitterPosition = ((splitterHeight - 34) / splitterHeight) * 100;
                        splitterPosition = "" + splitterPosition + "%";
                        that.mainLayout.setSplitterPosition(splitterPosition);
                        isCollapse = false;
                    } else {
                        imageButton.setIcon("sap-icon://expand-group");
                        that.mainLayout.setSplitterPosition("70%");
                        isCollapse = true;
                    }
                };

                var imageButton = new sap.ui.commons.Button({
                    icon: "sap-icon://expand-group",
                    press: toggleFunction
                });

                var propertyLabel = new sap.ui.commons.Label();
                propertyLabel.setText(resourceLoader.getText("txt_properties"));
                propertyLabel.addStyleClass("propertiesLinkLabel");

                /*var vLayout = new sap.ui.layout.HorizontalLayout({
                                content: [oImage, propertyLabel]
                            });*/

                var toolbar = new sap.ui.commons.Toolbar();
                // set standalone false, flat design and fixed width
                toolbar.setStandalone(false);

                toolbar.addItem(propertyLabel);
                toolbar.addRightItem(imageButton);

                setTimeout(function() {
                    $("#" + propertyLabel.sId).click(toggleFunction);
                }, 1000);

                var propertyLayout = new sap.ui.layout.VerticalLayout({
                    height: "100%",
                    content: [toolbar, that.mLayout]
                });

                propertyLayout.addStyleClass("propertyCustom");

                this.mainLayout = new sap.ui.commons.Splitter({
                    splitterOrientation: sap.ui.commons.Orientation.horizontal,
                    height: "100%",
                    splitterPosition: "70%",
                    //minSizeSecondPane: "30px",
                    firstPaneContent: this.oMappingControl,
                    secondPaneContent: propertyLayout
                });
                this.mainLayout.addStyleClass("mappingPane");
                this.mainLayout.addStyleClass("propertyMainLayoutspl");

                this.updateMappingControl();
                this.sourceTable = that.oMappingControl._getSourceTable();
                this.targetTable = that.oMappingControl._getTargetTable();
                if (that._columnLineage !== undefined) {
					this._columnLineage.registerTable("mp1", that.oMappingControl._getSourceTable());
					this._columnLineage.registerTable("mp2", that.oMappingControl._getTargetTable());
				}
                if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("mp1", that.oMappingControl._getSourceTable());
				    this._findandhighlight.registerTable("mp2", that.oMappingControl._getTargetTable());
				}
                that.oMappingControl._getSourceTable().setSelectedIndex(1);
                return this.mainLayout;

            },

            callbackPreMappingCreate: function(oEvent) {
                var oParameters = oEvent.getParameters();
                // this are the possible parameters
                var oSourceObject = oParameters.sourceObject;
                var oTargetObject = oParameters.targetObject;
                var oMappingControl = oParameters.mappingControl;
                var input;
                var inputName;
                var sPath;
                var sourceElement;

                if (oSourceObject && !oTargetObject) {
                    //prevent default create behavior and provide custom code
                    oEvent.preventDefault();
                    var elementName;
                    oMappingControl.that.elementNames = [];

                    inputName = oSourceObject.inputKey;
                    if (oSourceObject["field-type"] === "COLUMN" || oSourceObject["field-type"] === "COLUMN_ERROR" || oSourceObject["field-type"] ===
                        "COLUMN_PROXY") {
                        elementName = oSourceObject.name;
                    }

                    input = oMappingControl.that.viewNode.inputs.get(inputName);

                    if (input) {
                        oMappingControl.that.input = input;
                        if (elementName) {
                            sourceElement = input.getSource().elements.get(elementName);
                            if (sourceElement) {
                                oMappingControl.that._execute(oMappingControl.that.createAddElementCommand(sourceElement));
                            }
                        } else {
                            var addElementCommands = [];
                            input.getSource().elements.foreach(function(element) {
                                addElementCommands.push(oMappingControl.that.createAddElementCommand(element));
                            });
                            if (addElementCommands.length > 0) {
                                oMappingControl.that._execute(new modelbase.CompoundCommand(addElementCommands));
                            }
                        }
                    }
                } else if (oSourceObject && oTargetObject) { // Union : create mapping to constant column
                    oEvent.preventDefault();

                    var sourceName;

                    inputName = oSourceObject.inputKey;
                    if (oSourceObject["field-type"] === "COLUMN" || oSourceObject["field-type"] === "COLUMN_ERROR" || oSourceObject["field-type"] ===
                        "COLUMN_PROXY") {
                        sourceName = oSourceObject.name;
                    }

                    input = oMappingControl.that.viewNode.inputs.get(inputName);
                    var targetName = oTargetObject.xpath.split("/");
                    targetName = targetName[targetName.length - 1];

                    var targetElement = oMappingControl.that.viewNode.elements.get(targetName);

                    oMappingControl.that.viewNode.inputs.foreach(function(obj) {
                        if (CalcViewEditorUtil.getInputName(obj) === inputName) {
                            input = obj;
                        }
                    });
                    if (input && targetElement) {
                        sourceElement = input.getSource().elements.get(sourceName);
                        if (sourceElement) {
                            input.mappings.foreach(function(mapping) {
                                if (mapping.targetElement === targetElement) {
                                    var attributes = {
                                        inputId: input.$getKeyAttributeValue(),
                                        mappingId: mapping.$getKeyAttributeValue()
                                    };
                                    attributes.mappingAttributes = {
                                        type: "ElementMapping",
                                        sourceElement: sourceElement,
                                        value: undefined,
                                        isNull: undefined
                                    };
                                    var command = new commands.ChangeMappingPropertiesCommand(oMappingControl.that.viewNode.name, attributes);
                                    oMappingControl.that._execute(command);
                                }
                            });
                        }
                    }

                    /*
					In case of pd datasources mapping for default node
					
					*/
                    if (oMappingControl.that.viewNode.isDefaultNode() && input && targetElement) {
                        sourceElement = input.getSource().elements.get(sourceName);
                        if (sourceElement) {
                            var flag = true;
                            input.mappings.foreach(function(mapping) {
                                if (mapping.targetElement === targetElement) {
                                    flag = false;
                                }
                            });
                            if (flag) {
                                var attributes = {};
                                attributes.mappingAttributes = {
                                    sourceName: sourceElement.name,
                                    targetName: targetElement.name ? targetElement.name : targetElement,
                                    type: "ElementMapping"
                                };
                                attributes.input = input;
                                attributes.merge = true;
                                var command = new commands.CreateMappingCommand(oMappingControl.that.viewNode.name, attributes);
                                oMappingControl.that._execute(command);

                            }
                        }
                    }
                }
            },

            callbackMappingCreate: function() {
                return function(sChannelId, sEventId, oData) {
                    //that.updateMappingControl();
                };
            },

            callbackMappingUpdate: function() {
                return function(sChannelId, sEventId, oData) {
                    //that.updateMappingControl();
                    var that = this;
                    var sourceName;
                    var targetName;
                    var inputName;

                    if (oData.xPath && oData.mapping && oData.mapping.targetPaths[0]) {
                        targetName = oData.mapping.targetPaths[0].split("/");
                        targetName = targetName[targetName.length - 1];
                        var sPath = oData.xPath.split("/");
                        if (sPath.length === 4) {
                            inputName = sPath[2];
                            sourceName = sPath[3];
                        } else {
                            that.updateMappingControl();
                            return;
                        }

                        var input;
                        var sourceElement;
                        var targetElement;

                        that.viewNode.inputs.foreach(function(obj) {
                            if (CalcViewEditorUtil.getInputName(obj) === inputName) {
                                input = obj;
                            }
                        });
                        if (input) {
                            sourceElement = input.getSource().elements.get(sourceName);
                            targetElement = that.viewNode.elements.get(targetName);
                        }

                        if (sourceElement && targetElement) {
                            var command;
                            input.mappings.foreach(function(mapping) {
                                if ((mapping.sourceElement === sourceElement || mapping.type === "ConstantElementMapping") && mapping.targetElement ===
                                    targetElement) {
                                    var attributes = {
                                        inputId: input.$getKeyAttributeValue(),
                                        mappingId: mapping.$getKeyAttributeValue()
                                    };
                                    if (oData.updateType === "MAPPING_LIBRARY-MAPPING_UPDATE_TYPE-REMOVE" && mapping.type !== "ConstantElementMapping") {
                                        attributes.mappingAttributes = {
                                            type: "ConstantElementMapping",
                                            sourceElement: undefined,
                                            value: "",
                                            isNull: true
                                        };

                                    } else if (oData.updateType === "MAPPING_LIBRARY-MAPPING_UPDATE_TYPE-ADD" && mapping.sourceElement !== sourceElement) {
                                        attributes.mappingAttributes = {
                                            type: "ElementMapping",
                                            sourceElement: sourceElement,
                                            value: undefined,
                                            isNull: undefined
                                        };
                                    }
                                    if (attributes.mappingAttributes) {
                                        command = new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes);
                                    }
                                }
                            });
                            if (command) {
                                that._execute(command);
                                return;
                            }
                        }
                        that.updateMappingControl();
                    }
                };
            },

            callbackMappingDelete: function() {
                var that = this;
                return function(sChannelId, sEventId, oData) {
                    var input;
                    var sourceElement;
                    var targetElement;
                    var tPath = oData.mapping.getTargetPaths()[0];
                    tPath = tPath.split("/");
                    var targetElementName = tPath[tPath.length - 1];
                    targetElement = that.viewNode.elements.get(targetElementName);

                    var sPath = oData.mapping.getSourcePaths()[0];
                    sPath = sPath.split("/");
                    var sourceElementName = sPath[sPath.length - 1];
                    var inputName = sPath[sPath.length - 2];

                    that.viewNode.inputs.foreach(function(obj) {
                        if (CalcViewEditorUtil.getInputName(obj) === inputName) {
                            input = obj;
                        }
                    });
                    if (input) {
                        sourceElement = input.getSource().elements.get(sourceElementName);
                    }

                    if (sourceElement && targetElement) {
                        var adjustMappingCommands = [];
                        input.mappings.foreach(function(mapping) {
                            if (mapping.sourceElement === sourceElement && mapping.targetElement === targetElement) {
                                var attributes = {
                                    mapping: mapping
                                };
                                attributes.mappingAttributes = {
                                    type: "ConstantElementMapping",
                                    sourceElement: undefined,
                                    value: "",
                                    isNull: true
                                };
                                adjustMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));
                            }
                        });
                        if (adjustMappingCommands.length > 0) {
                            that._execute(new modelbase.CompoundCommand(adjustMappingCommands));
                            setTimeout(function() {
                                that.refreshToolItems();
                            }, 10);
                        }
                    }
                };
            },

            addToTarget: function() {
                var that = this;
                this.selectedIndex = [];
                this.selectedInput = [];

                var sourceTable = this.oMappingControl._getSourceTable();
                if (sourceTable.getSelectedIndex() === -1) {
                    return;
                }

                var indices = sourceTable.getSelectedIndices();
                for (var i = 0; i < indices.length; i++) {
                    var sPath = sourceTable.getContextByIndex(indices[i]).sPath;
                    sPath = sPath.split("/");
                    if (sPath.length === 6) {
                        this.selectedInput.push(sPath[3]);
                        this.selectedIndex.push(sPath[5]);
                    } else {
                        this.selectedInput.push(sPath[sPath.length - 1]);
                    }
                }
                if (this.selectedInput.length !== this.selectedIndex.length) {
                    this.selectedIndex = undefined;
                }

                if (that.viewNode.isStarJoin()) {
                    var j = 0;
                    that.viewNode.inputs.foreach(function(input) {
                        if (!input.selectAll) {
                            for (var k = 0; k < that.selectedInput.length; k++) {
                                that.selectedInput[k] = [j];
                            }
                        }
                        j++;
                    });

                }

                this.elementNames = [];
                this.addElementCommands = [];
                var inputIndex = 0;
                that.viewNode.inputs.foreach(function(input) {
                    that.input = input;
                    var source = input.getSource();
                    if (source && source.elements) {
                        source.elements.foreach(function(element) {
                            if (that.selectedIndex) {
                                var source = that.input.getSource();
                                for (var i = 0; i < that.selectedIndex.length; i++) {
                                    if (that.selectedInput[i] == inputIndex) { // Donot use strict equals === . Value can be integer or string
                                        var selectedElement = source.elements.get(source.elements._keys[that.selectedIndex[i]]);
                                        if (selectedElement) {
                                            if (element === selectedElement) {
                                                that.addElementCommands.push(that.createAddElementCommand(element));
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else { // Add all elements from selected Input
                                for (var j = 0; j < that.selectedInput.length; j++) {
                                    if (that.selectedInput[j] == inputIndex) { // Donot use strict equals  === . Value can be integer or string
                                        that.addElementCommands.push(that.createAddElementCommand(element));
                                        break;
                                    }
                                }
                            }
                        });
                    }
                    inputIndex++;
                });

                if (this.addElementCommands.length > 0) {
                    this._execute(new modelbase.CompoundCommand(this.addElementCommands));
                }
            },

            refreshToolItems: function() {
                var that = this;
                var targetTable = that.oMappingControl._getTargetTable();
                var sourceTable = that.oMappingControl._getSourceTable();
                if (that.removeTargetBtn) {
                    if (targetTable.getSelectedIndex() === -1) {
                        if (that.removeTargetBtn.getEnabled()) {
                            that.removeTargetBtn.setEnabled(false);
                        }
                    } else {
                        if (!that.removeTargetBtn.getEnabled()) {
                            that.removeTargetBtn.setEnabled(true);
                        }
                    }
                }
                if (that.addToTargetButton) {
                    if (sourceTable.getSelectedIndex() === -1 || !sourceTable.getContextByIndex(sourceTable.getSelectedIndex())) {
                        if (that.addToTargetButton.getEnabled()) {
                            that.addToTargetButton.setEnabled(false);
                        }
                    } else {
                        if (!that.addToTargetButton.getEnabled()) {
                            that.addToTargetButton.setEnabled(true);
                        }
                    }
                }
                if (that.addDatasourceButton && that.removeSourceButton) {
                    if (this.viewNode) {
                        var enableAdd = true;
                        var enableRemove = false;

                        if (this.viewNode.type === "Projection" || this.viewNode.type === "Aggregation" || this.viewNode.type === "Rank") {

                            if (this.viewNode.inputs._keys.length > 0) {
                                enableAdd = false;
                            }
                            if (sourceTable.getSelectedIndex() === 0 && this.viewNode.inputs._keys.length > 0) {
                                enableRemove = true;
                            }

                        } else if (this.viewNode.type === "JoinNode" || this.viewNode.type === "Union") {
                            if (this.viewNode.type === "JoinNode") {
                                if (this.viewNode.isDefaultNode()) {
                                    enableAdd = false;
                                } else if (this.viewNode.inputs._keys.length > 1) {
                                    enableAdd = false;
                                }
                            }
                            if (sourceTable.getSelectedIndex() !== -1 && this.viewNode.inputs._keys.length > 0) {
                                var context = sourceTable.getContextByIndex(sourceTable.getSelectedIndex());
                                if (context) {
                                    var sPath = context.sPath;
                                    sPath = sPath.split("/");
                                    if (sPath.length === 4) {
                                        enableRemove = true;
                                    }
                                }
                            }
                        }

                        if (enableRemove && !that.removeSourceButton.getEnabled()) {
                            that.removeSourceButton.setEnabled(true);
                        } else if (!enableRemove && that.removeSourceButton.getEnabled()) {
                            that.removeSourceButton.setEnabled(false);
                        }
                        if (enableAdd && !that.addDatasourceButton.getEnabled()) {
                            that.addDatasourceButton.setEnabled(true);
                        } else if (!enableAdd && that.addDatasourceButton.getEnabled()) {
                            that.addDatasourceButton.setEnabled(false);
                        }
                    }
                }

                if (this.viewNode.dataSource === true) {
                    that.removeSourceButton.setEnabled(false);
                    that.addDatasourceButton.setEnabled(false);
                    that.addToTargetButton.setEnabled(false);
                }
                if (this.viewNode.inputs.count() === 0) {
                    if ((that.mLayout !== undefined) && (that.mLayout !== null) && (that.mLayout.destroyRows !== undefined)) {
                        that.mLayout.destroyRows();
                    }
                }
            },

            createAddElementCommand: function(element) {
                var that = this;
                var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
                elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(element.name, that.viewNode, that.elementNames);
                elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;
                elementAttributes.objectAttributes.transparentFilter = element.transparentFilter;
                that.elementNames.push(elementAttributes.objectAttributes.name);
                elementAttributes.mappingAttributes = {
                    sourceName: element.name,
                    targetName: elementAttributes.objectAttributes.name,
                    type: "ElementMapping"
                };
                elementAttributes.input = this.input;
                var command = new commands.AddElementCommand(that.viewNode.name, elementAttributes);
                return command;
            },

            /*            createCustomLabel: function() {
                         // custom label with icon
                         var oImage = new sap.ui.commons.Image();
                         oImage.bindProperty("src", {
                             parts: ["field-type"],
                             formatter: function(type) {
                                 return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
                             }

                         });
                         var oLabel = new sap.ui.commons.Label();
                         oLabel.bindProperty("text", "name");
                         var oCustomlabel = new sap.ui.layout.HorizontalLayout({
                             content: [oImage, oLabel]
                         });

                         // custom tooltip
                         var oTooltip = new sap.ui.commons.RichTooltip();
                         oTooltip.bindProperty("title", "name");
                         oTooltip.bindProperty("text", {
                             parts: ["name", "icon", "field-type", "field-data-type", "field-length", "field-scale", "field-label"],
                             formatter: function(name, icon, type, dataType, length, scale, label) {
                                 var oResult = "";
                                 if (label) {
                                     oResult += "<strong>" + resourceLoader.getText("tit_label") + ": </strong>" + label + "<br>";
                                 }
                                 if (dataType) {
                                     oResult += "<strong>" + resourceLoader.getText("tit_data_type") + ": </strong>" + dataType;
                                     if (length) {
                                         oResult += "(" + length;
                                         if (scale) {
                                             oResult += "," + scale;
                                         }
                                         oResult += ")";
                                     }
                                 }
                                 return oResult;
                             }
                         });
                         oCustomlabel.setTooltip(oTooltip);

                         return oCustomlabel;
                     },*/

            createSourceInlineEditorLabel: function() {
                var that = this;
                // custom label with icon
                var oImage = new sap.ui.commons.Image();
                oImage.bindProperty("src", {
                    parts: ["field-type"],
                    formatter: function(type) {
                        return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
                    }

                });
                /* oImage.bindProperty("tooltip", {
                                parts: ["tooltip"],
                                formatter: function(tooltip) {
                                    return tooltip;
                                }
                            });*/
                var oTooltip = new sap.ui.commons.RichTooltip();


                var oLabel = new sap.ui.commons.Label({
                    customData: [{
                        Type: "sap.ui.core.CustomData",
                        key: "lineage",
                        writeToDom: true,
                        value: {
                            parts: [{
                                path: "lineage"
                            }],
                            formatter: function(lineage) {
                                if (lineage !== undefined) {
                                    return "lineage";
                                } else {
                                    return "none";
                                }

                            }
                        }

                    }, {
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
                                    var row = this.getParent().getParent().getParent().getParent();
                                    row.getParent().setSelectedIndex(row.getIndex());
                                    return "focus";
                                } else {
                                    return "none";
                                }
                            }
                        }

                    }]

                });
                oLabel.bindProperty("text", "name");
                //oLabel.addCustomData(labelTemplate);
                //create custom label
                var oCustomLabel = new sap.ui.layout.HorizontalLayout({
                    content: [oImage, oLabel]
                });
                // custom tooltip

                oTooltip.bindProperty("title", "name");

                oTooltip.bindProperty("text", {
                    parts: ["name", "icon", "field-type", "field-data-type", "field-length", "field-scale", "field-label"],
                    formatter: function(name, icon, type, dataType, length, scale, label) {
                        var oResult = "";
                        if (label) {
                            oResult += "<strong>" + resourceLoader.getText("tit_label") + ": </strong>" + label + "<br>";
                        }
                        if (dataType) {
                            oResult += "<strong>" + resourceLoader.getText("tit_data_type") + ": </strong>" + dataType;
                            if (length) {
                                oResult += "(" + length;
                                if (scale) {
                                    oResult += "," + scale;
                                }
                                oResult += ")";
                            }
                        }
                        return oResult;
                    }
                });

                //  oCustomLabel.setTooltip(oTooltip);
                oImage.setTooltip(oTooltip);
                //defining a context menu
                //some mock menu
                var oMenu = new sap.ui.commons.Menu({
                    ariaDescription: "Menu"
                });

                var addToOutputMenuItem = new sap.ui.commons.MenuItem({});
                addToOutputMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.elementName = name;
                        this.inputKey = inputKey;
                        return resourceLoader.getText("tol_add_to_output");
                    }
                });
                addToOutputMenuItem.attachSelect(function(oEvent) {
                    if (this.elementName && this.inputKey > -1) {
                        that.input = that.viewNode.inputs.get(this.inputKey);
                        that.elementNames = [];
                        if (that.input) {
                            var sourceElement = that.input.getSource().elements.get(this.elementName);
                            if (sourceElement) {
                                that._execute(that.createAddElementCommand(sourceElement));
                            }
                        }
                    }

                });
                var addAllToOutputMenuItem = new sap.ui.commons.MenuItem({});
                addAllToOutputMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.elementName = name;
                        this.inputKey = inputKey;
                        return resourceLoader.getText("tol_add_to_output");
                    }
                });
                addAllToOutputMenuItem.attachSelect(function(oEvent) {
                    if (this.elementName && this.inputKey > -1) {
                        that.input = that.viewNode.inputs.get(this.inputKey);
                        that.elementNames = [];
                        if (that.input) {
                            var addElementCommands = [];
                            that.input.getSource().elements.foreach(function(element) {
                                addElementCommands.push(that.createAddElementCommand(element));
                            });
                            if (addElementCommands.length > 0) {
                                that._execute(new modelbase.CompoundCommand(addElementCommands));
                            }
                        }
                    }
                });

                //if (that.viewNode.type === "Union") {
                var removeMappingMenuItem = new sap.ui.commons.MenuItem({});
                removeMappingMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.elementName = name;
                        this.inputKey = inputKey;
                        if (type === "COLUMN" || type === "COLUMN_PROXY" || type === "COLUMN_ERROR") {
                            this.isColumn = true;
                        }
                        return resourceLoader.getText("txt_remove_mapping");
                    }
                });
                removeMappingMenuItem.attachSelect(function(oEvent) {
                    if (this.elementName && this.inputKey > -1) {
                        var input = that.viewNode.inputs.get(this.inputKey);
                        if (input) {
                            var removeMappingCommands = [];
                            if (this.isColumn) {
                                var sourceElement = input.getSource().elements.get(this.elementName);
                                if (sourceElement) {
                                    input.mappings.foreach(function(mapping) {
                                        if (mapping.sourceElement === sourceElement) {
                                            var attributes = {
                                                inputId: input.$getKeyAttributeValue(),
                                                mappingId: mapping.$getKeyAttributeValue()
                                            };
                                            // constant mapping
                                            attributes.mappingAttributes = {
                                                type: "ConstantElementMapping",
                                                sourceElement: undefined,
                                                value: mapping.constantValue,
                                                isNull: true
                                            };
                                            removeMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));
                                        }
                                    });
                                }
                            } else {
                                input.mappings.foreach(function(mapping) {
                                    var attributes = {
                                        inputId: input.$getKeyAttributeValue(),
                                        mappingId: mapping.$getKeyAttributeValue()
                                    };
                                    // constant mapping
                                    attributes.mappingAttributes = {
                                        type: "ConstantElementMapping",
                                        sourceElement: undefined,
                                        value: mapping.constantValue,
                                        isNull: true
                                    };
                                    removeMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));

                                });
                            }

                            if (removeMappingCommands.length > 0) {
                                that._execute(new modelbase.CompoundCommand(removeMappingCommands));
                            }
                        }
                    }
                });
                //oMenu.addItem(removeMappingMenuItem);
                // }

                var extractSemanticsMenuItem = new sap.ui.commons.MenuItem({});
                extractSemanticsMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.inputKey = inputKey;
                        //return resourceLoader.getText("txt_remove_mapping");
                        return "Extract Semantics";
                    }
                });
                extractSemanticsMenuItem.attachSelect(function(oEvent) {
                    if (this.inputKey > -1) {
                        var input = that.viewNode.inputs.get(this.inputKey);
                        if (input) {
                            var extractSemanticsDialog = new ExtractSemanticsDialog({
                                undoManager: that._undoManager,
                                columnView: that._model.columnView,
                                input: input,
                                viewNode: that.viewNode
                            });
                            extractSemanticsDialog.open();
                        }
                    }
                });
                var replaceDataSourceAndNodeMenuItem = new sap.ui.commons.MenuItem({});
                replaceDataSourceAndNodeMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.inputKey = inputKey;
                        //return resourceLoader.getText("txt_remove_mapping");
                        return resourceLoader.getText("txt_replace_with_data_source");
                    }
                });
                replaceDataSourceAndNodeMenuItem.attachSelect(function() {
                    if (this.inputKey > -1) {
                        var input = that.viewNode.inputs.get(that.inputKey);
                        if (input) {
                            var parameter = {
                                context: that._context,
                                viewNode: that.viewNode,
                                inputSource: input,
                                typeOfReplace: CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE,
                                undoManager: that._undoManager
                            };
                            var dialog = new ReplaceDataSourceAndNode(parameter);
                            dialog.openRDSNDialog();
                        }
                    }
                });

                //for replace node
                var replaceNodeWithNodeMenuItem = new sap.ui.commons.MenuItem({});
                replaceNodeWithNodeMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.inputKey = inputKey;
                        //return resourceLoader.getText("txt_remove_mapping");
                        return resourceLoader.getText("txt_remove_replace_with_viewnode");
                    }
                });
                replaceNodeWithNodeMenuItem.attachSelect(function() {

                    var ReplaceViewNode = that.viewNode.$$model.columnView.viewNodes.get(that.ReplaceViewNode);
                    if (ReplaceViewNode) {
                        var parameter = {
                            context: that._context,
                            viewNode: ReplaceViewNode,
                            //     inputSource: input,
                            typeOfReplace: CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE,
                            undoManager: that._undoManager
                        };
                        var dialog = new ReplaceDataSourceAndNode(parameter);
                        dialog.openRDSNDialog();
                    }

                });

                //for replace node with source
                var replaceNodeWithDataSourceMenuItem = new sap.ui.commons.MenuItem({});
                replaceNodeWithDataSourceMenuItem.bindProperty("text", {
                    parts: ["name", "field-type", "inputKey"],
                    formatter: function(name, type, inputKey) {
                        this.inputKey = inputKey;
                        //return resourceLoader.getText("txt_remove_mapping");
                        return resourceLoader.getText("txt_replace_with_data_source");
                    }
                });
                replaceNodeWithDataSourceMenuItem.attachSelect(function() {
                    if (this.inputKey > -1) {
                        var input = that.viewNode.inputs.get(that.inputKey);
                        if (input) {
                            var parameter = {
                                context: that._context,
                                viewNode: that.viewNode,
                                inputSource: input,
                                typeOfReplace: CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE,
                                undoManager: that._undoManager
                                    //	isDeleteNode: true
                            };
                            var dialog = new ReplaceDataSourceAndNode(parameter);
                            dialog.openRDSNDialog();
                        }
                    }
                });

                //create inline editor instance and set your label as label
                jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.InlineEditor");
                var oInlineEditor = new sap.watt.hanaplugins.editor.common.treemap.InlineEditor({
                    label: oCustomLabel,
                    contextMenu: oMenu
                });

                //bind value to editor
                oInlineEditor.bindEditorValue("name");

                // attach context menu

                oInlineEditor.attachOpenContextMenu(function(oEvent) {
                    var oData = oEvent.getParameter("data");
                    var oMenu = oEvent.getParameter("menu");
                    oMenu.removeAllItems();
                    if (that.viewNode.dataSource !== true) {

                        if (oData["field-type"] !== undefined) {
                            if (oData["field-type"] === "COLUMN" || oData["field-type"] === "COLUMN_PROXY" || oData["field-type"] === "COLUMN_ERROR") {
                                oMenu.addItem(addToOutputMenuItem);
                            } else {
                                oMenu.addItem(addAllToOutputMenuItem);
                            }
                        }

                        if (that.viewNode.type === "Union") {
                            oMenu.addItem(removeMappingMenuItem);
                        }
                        //if (!that.viewNode.isDefaultNode()) {
                        if (oData["field-type"] === "CALCULATIONVIEW" || oData["field-type"] === "ANALYTICVIEW" || oData["field-type"] === "ATTRIBUTEVIEW" ||
                            oData["field-type"] === "CALCULATIONVIEW_HISTORY" || oData["field-type"] === "DATA_BASE_TABLE") {
                            oMenu.addItem(extractSemanticsMenuItem);
                        }

                        var ip_type = oData["field-type"] !== undefined ? (oData["field-type"].indexOf("_PROXY") > -1 ? oData["field-type"].slice(0, -
                            "_PROXY".length) : oData["field-type"]) : oData["field-type"];

                        if (CalcViewEditorUtil.getSearchObjectTypes().indexOf(ip_type) > -1) {
                            oMenu.addItem(replaceDataSourceAndNodeMenuItem);
                            that.inputKey = oData.inputKey;
                        }
                        if (oData["field-type"] !== "COLUMN" && !(that.viewNode.isStarJoin())) {
                            if (ip_type === "JOINNODE" || ip_type === "UNION" || ip_type === "PROJECTION" || ip_type === "AGGREGATION" || ip_type === "RANK") {
                                oMenu.addItem(replaceNodeWithDataSourceMenuItem);

                                var input;
                                that.inputKey = oData.inputKey;
                                that.viewNode.inputs.foreach(function(ip) {
                                    if (ip.getSource().name === oData.name) {
                                        input = ip.getSource();
                                    }
                                });

                                var childL = CalcViewEditorUtil.getListOfChildNodes(input);
                                that.ReplaceViewNode = input.name;
                                var isReplaceNode = false;
                                if (childL) {
                                    for (var i in childL) {
                                        /* if(CalcViewEditorUtil.getListOfChildNodes(childL[i])){
                                                                   isReplaceNode=true;
                                                              }*/
                                        if (childL[i].getSource().elements.size() > 0) {
                                            isReplaceNode = true;
                                            break;
                                        }
                                    }
                                }
                                if (isReplaceNode) {
                                    oMenu.addItem(replaceNodeWithNodeMenuItem);
                                }
                            }
                        }
                    }
                    //}
                });

                return oInlineEditor;
            },

            createTargetInlineEditorLabel: function() {
                var that = this;
                // custom label with icon
                var oImage = new sap.ui.commons.Image();
                oImage.bindProperty("src", {
                    parts: ["field-type"],
                    formatter: function(type) {
                        return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
                    }

                });
                oImage.bindProperty("tooltip", {
                    parts: ["tooltip"],
                    formatter: function(tooltip) {
                        return tooltip;
                    }
                });

                var oLink = new sap.ui.commons.Link({
                    text: "empty link",
                    tooltip: "Click to edit",
                    press: function() {
                        // get InlineEditor instance and set showEditor to true
                        this.getParent().getParent().setShowEditor(true);
                        this.focus();
                    },
                    customData: [{
                        Type: "sap.ui.core.CustomData",
                        key: "lineage",
                        writeToDom: true,
                        value: {
                            parts: [{
                                path: "lineage"
                            }],
                            formatter: function(lineage) {
                                if (lineage !== undefined) {
                                    return "lineage";
                                } else {
                                    return "none";
                                }

                            }
                        }

                    }, {
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
                                    var row = this.getParent().getParent().getParent().getParent();
                                    row.getParent().setSelectedIndex(row.getIndex());
                                    return "focus";
                                } else {
                                    return "none";
                                }
                            }
                        }

                    }]

                });
                oLink.bindProperty("text", "name");
                oLink.addStyleClass("linkMapping");
                //	oLink.addCustomData(linkTemplate);
                //create custom label
                var oCustomLabel = new sap.ui.layout.HorizontalLayout({
                    content: [oImage, oLink]
                });
                // custom tooltip
                var oTooltip = new sap.ui.commons.RichTooltip();

                oTooltip.bindProperty("title", "name");

                oTooltip.bindProperty("text", {
                    parts: ["name", "icon", "field-type", "field-data-type", "field-length", "field-scale", "field-label"],
                    formatter: function(name, icon, type, dataType, length, scale, label) {
                        var oResult = "";
                        if (label) {
                            oResult += "<strong>" + resourceLoader.getText("tit_label") + ": </strong>" + label + "<br>";
                        }
                        if (dataType) {
                            oResult += "<strong>" + resourceLoader.getText("tit_data_type") + ": </strong>" + dataType;
                            if (length) {
                                oResult += "(" + length;
                                if (scale) {
                                    oResult += "," + scale;
                                }
                                oResult += ")";
                            }
                        }
                        return oResult;
                    }
                });

                oCustomLabel.setTooltip(oTooltip);

                //defining a context menu
                //some mock menu
                var oMenu = new sap.ui.commons.Menu({
                    ariaDescription: "Menu"
                });

                if (that.viewNode.type === "Union" || that.viewNode.isDefaultNode()) {

                    var manageMappingMenuItem = new sap.ui.commons.MenuItem({});
                    manageMappingMenuItem.bindProperty("text", {
                        parts: ["name"],
                        formatter: function(name) {
                            this.elementName = name;
                            return resourceLoader.getText("txt_manage_mappings");
                        }
                    });
                    manageMappingMenuItem.attachSelect(function(oEvent) {
                        if (this.elementName) {
                            var element = that.viewNode.elements.get(this.elementName);
                            if (element) {
                                var dialog = new ConstantMappingDialog({
                                    undoManager: that._undoManager,
                                    viewNode: that.viewNode,
                                    element: element
                                });
                                dialog.open();
                            }

                        }

                    });
                    //oMenu.addItem(manageMappingMenuItem);

                    var removeMappingMenuItem = new sap.ui.commons.MenuItem({});
                    removeMappingMenuItem.bindProperty("text", {
                        parts: ["name"],
                        formatter: function(name) {
                            this.elementName = name;
                            return resourceLoader.getText("txt_remove_mapping");
                        }
                    });
                    removeMappingMenuItem.attachSelect(function(oEvent) {
                        if (this.elementName) {
                            var removeMappingCommands = [];
                            var element = that.viewNode.elements.get(this.elementName);
                            that.viewNode.inputs.foreach(function(input) {
                                input.mappings.foreach(function(mapping) {
                                    if (mapping.targetElement === element /* && mapping.type === "ElementMapping"*/ ) {
                                        var attributes = {
                                            inputId: input.$getKeyAttributeValue(),
                                            mappingId: mapping.$getKeyAttributeValue()
                                        };
                                        // constant mapping
                                        attributes.mappingAttributes = {
                                            type: "ConstantElementMapping",
                                            sourceElement: undefined,
                                            value: mapping.constantValue,
                                            isNull: true
                                        };
                                        removeMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));
                                    }
                                });
                            });
                            if (removeMappingCommands.length > 0) {
                                that._execute(new modelbase.CompoundCommand(removeMappingCommands));
                            }
                        }

                    });
                    //oMenu.addItem(removeMappingMenuItem);

                    var removeAllMappingMenuItem = new sap.ui.commons.MenuItem({});
                    removeAllMappingMenuItem.bindProperty("text", {
                        parts: ["name"],
                        formatter: function(name) {
                            return resourceLoader.getText("txt_remove_all_mappings");
                        }
                    });
                    removeAllMappingMenuItem.attachSelect(function(oEvent) {
                        var removeMappingCommands = [];
                        that.viewNode.inputs.foreach(function(input) {
                            input.mappings.foreach(function(mapping) {
                                var attributes = {
                                    inputId: input.$getKeyAttributeValue(),
                                    mappingId: mapping.$getKeyAttributeValue()
                                };
                                // constant mapping
                                attributes.mappingAttributes = {
                                    type: "ConstantElementMapping",
                                    sourceElement: undefined,
                                    value: mapping.constantValue,
                                    isNull: true
                                };
                                removeMappingCommands.push(new commands.ChangeMappingPropertiesCommand(that.viewNode.name, attributes));

                            });
                        });
                        if (removeMappingCommands.length > 0) {
                            that._execute(new modelbase.CompoundCommand(removeMappingCommands));
                        }
                    });
                    //oMenu.addItem(removeAllMappingMenuItem);

                }

                var removeTargetMenuItem = new sap.ui.commons.MenuItem({});
                removeTargetMenuItem.bindProperty("text", {
                    parts: ["name"],
                    formatter: function(name) {
                        this.elementName = name;
                        return resourceLoader.getText("txt_remove_output_column");
                    }
                });
                removeTargetMenuItem.attachSelect(function(oEvent) {
                    if (this.elementName) {
                        var removeElementCommands = [];
                        var element = that.viewNode.elements.get(this.elementName);
                        removeElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].elements["' + this.elementName +
                            '"]'));
                        that.viewNode.inputs.foreach(function(input) {
                            input.mappings.foreach(function(mapping) {
                                if (mapping.targetElement === element /* && mapping.type === "ElementMapping"*/ ) {
                                    removeElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].inputs["' + input.$getKeyAttributeValue() +
                                        '"].mappings["' + mapping.$getKeyAttributeValue() + '"]"'));
                                }
                            });
                        });
                        if (removeElementCommands.length > 0) {
                            var callback = function(okPressed) {
                                if (okPressed) {
                                    that._execute(new modelbase.CompoundCommand(removeElementCommands));
                                    setTimeout(function() {
                                        that.refreshToolItems();
                                    }, 10);
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
                    }

                });
                //oMenu.addItem(removeTargetMenuItem);
                var showLineageMenuItem = new sap.ui.commons.MenuItem({});
                showLineageMenuItem.bindProperty("text", {
                    parts: ["name"],
                    formatter: function(name) {
                        this.elementName = name;
                        return resourceLoader.getText("Show Lineage");
                    }
                });
                showLineageMenuItem.attachSelect(function(oEvent) {
                	if (this.elementName) {
                		that.updateTable();
						var element = that.viewNode.elements.get(this.elementName);
						that._model.lineage = that._columnLineage.traceColumnLineage(that.viewNode, element, "mp");
						CalcViewEditorUtil.getCurEditor()._detailsPane.scenarioEditor._editor._extension.showLineage();
					}
                });
                var removeAllTargetMenuItem = new sap.ui.commons.MenuItem({});
                removeAllTargetMenuItem.bindProperty("text", {
                    parts: ["name"],
                    formatter: function(name) {
                        return resourceLoader.getText("txt_remove_all_output_columns");
                    }
                });
                removeAllTargetMenuItem.attachSelect(function(oEvent) {
                    var removeElementCommands = [];
                    var removeElementList = [];
                    that.viewNode.elements.foreach(function(element) {
                        removeElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].elements["' + element.name +
                            '"]'));
                        removeElementList.push(element)
                    });
                    that.viewNode.inputs.foreach(function(input) {
                        input.mappings.foreach(function(mapping) {
                            removeElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].inputs["' + input.$getKeyAttributeValue() +
                                '"].mappings["' + mapping.$getKeyAttributeValue() + '"]"'));
                        });
                    });
                    if (removeElementCommands.length > 0) {
                        var callback = function(okPressed) {
                            if (okPressed) {
                                that._execute(new modelbase.CompoundCommand(removeElementCommands));
                                setTimeout(function() {
                                    that.refreshToolItems();
                                }, 10);
                            }
                        };
                        var dialog = new ReferenceDialog({
                            undoManager: that._undoManager,
                            element: removeElementList,
                            fnCallbackMessageBox: callback,
                            isRemoveCall: true
                        });
                        dialog.openMessageDialog();
                    }
                });
                //oMenu.addItem(removeAllTargetMenuItem);

                //if (PropagateToSemantics.canPropagate(that._model.columnView, that.viewNode)) {
                var propagateMenuItem = new sap.ui.commons.MenuItem({});
                propagateMenuItem.bindProperty("text", {
                    parts: ["name"],
                    formatter: function(name) {
                        this.elementName = name;
                        return resourceLoader.getText("txt_propagate_to_semantics");
                    }
                });
                propagateMenuItem.attachSelect(function(oEvent) {
                    if (this.elementName) {
                        var elements = [];
                        var targetTable = that.oMappingControl._getTargetTable();
                        var selectedIndices = targetTable.getSelectedIndices();
                        if (selectedIndices && selectedIndices.length > 0) {
                            var nodes = targetTable.getModel().getData().getRootNode().nodes;
                            for (var i = 0; i < selectedIndices.length; i++) {
                                var name = nodes[selectedIndices[i]].name;
                                var element = that.viewNode.elements.get(name);
                                if (element) {
                                    elements.push(element);
                                }
                            }

                        } else {
                            elements.push(that.viewNode.elements.get(this.elementName));
                        }
                        PropagateToSemantics.propagate({
                            undoManager: that._undoManager,
                            columnView: that._model.columnView,
                            viewNode: that.viewNode,
                            elements: elements
                        });
                    }
                });
                //oMenu.addItem(propagateMenuItem);
                //}

                //create inline editor instance and set your label as label
                jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.InlineEditor");
                var oInlineEditor = new sap.watt.hanaplugins.editor.common.treemap.InlineEditor({
                    label: oCustomLabel,
                    contextMenu: oMenu
                });

                //bind value to editor
                oInlineEditor.bindEditorValue("name");

                //you can use the liveChange event for value validation
                oInlineEditor.attachLiveChange(function(oEvent) {
                    //you can get the input field via the event parameters
                    var oInput = oEvent.getParameter("source");
                    var value = oEvent.getParameter("liveValue");
                    var oldValue = this.getOldValue();
                    var element = that.viewNode.elements.get(oldValue);

                    if (element) {
                        var result = CalcViewEditorUtil.checkRenameElement(value, element, that.viewNode, that.viewNode.$$model.columnView);
                        oInput.setTooltip(null);
                        //only if the value state is None the value will get into the model
                        oInput.setValueState(sap.ui.core.ValueState.None);
                        if (result.message && value !== element.name) {
                            var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;

                            var oCallout = new sap.ui.commons.Callout({});
                            oCallout.addContent(new sap.ui.commons.TextView({
                                semanticColor: sap.ui.commons.TextViewColor.Negative,
                                design: sap.ui.commons.TextViewDesign.Bold,
                                text: message,
                                editable: false
                            }));
                            //you can define some error messages here
                            oInput.setTooltip(oCallout);
                            //if the input field ist in Error state the value will not be set in the model 
                            oInput.setValueState(sap.ui.core.ValueState.Error);

                        } else if (value !== element.name) {
                            oInput.setTooltip(null);
                            //only if the value state is None the value will get into the model
                            oInput.setValueState(sap.ui.core.ValueState.None);
                        }
                    }

                });

                oInlineEditor.attachChange(function(oEvent) {
                    //you can get the input field via the event parameters
                    var oInput = oEvent.getParameter("source");
                    var oldValue = this.getOldValue();
                    var value = oEvent.getParameter("value");
                    var element = that.viewNode.elements.get(oldValue);
                    if (element) {
                        var result = CalcViewEditorUtil.checkRenameElement(value, element, that.viewNode, that.viewNode.$$model.columnView);
                        oInput.setTooltip(null);
                        //only if the value state is None the value will get into the model
                        oInput.setValueState(sap.ui.core.ValueState.None);
                        if (result.message && value !== element.name) {
                            /*var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
                                                 var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + element.name + "'"];
                                                 message = resourceLoader.getText("msg_message_toast_calculated_column_error", messageObjects) + " (" + message + ")";
                                                 this.setValue(element.name);

                                                 jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
                                                 sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
                                                     of: that.topVerticalLayout,
                                                     offset: "-10px -100px"
                                                 });*/
                        } else if (value !== element.name) {
                            var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                            attributes.objectAttributes.name = value;

                            var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, element.name, attributes);
                            that._execute(command);
                        }
                    }
                });

                // attach context menu

                oInlineEditor.attachOpenContextMenu(function(oEvent) {
                    var oData = oEvent.getParameter("data");
                    var oMenu = oEvent.getParameter("menu");
                    oMenu.removeAllItems();

                    if (that.viewNode.type === "Union") {
                        oMenu.addItem(manageMappingMenuItem);
                        oMenu.addItem(removeMappingMenuItem);
                        oMenu.addItem(removeAllMappingMenuItem);
                    }
                    if (that.viewNode.isDefaultNode()) {
                        oMenu.addItem(removeMappingMenuItem);
                        oMenu.addItem(removeAllMappingMenuItem);
                    }
                    oMenu.addItem(removeTargetMenuItem);
                    oMenu.addItem(removeAllTargetMenuItem);
                    oMenu.addItem(showLineageMenuItem);
                    if (PropagateToSemantics.canPropagate(that._model.columnView, that.viewNode)) {
                        oMenu.addItem(propagateMenuItem);
                    }
                });

                return oInlineEditor;
            },

            createCustomSourceToolbar: function(mappingControl) {
                var that = this;
                var oSourceToolbar = new sap.ui.commons.Toolbar();
                oSourceToolbar.addStyleClass("parameterToolbarStyle");
                oSourceToolbar.setStandalone(false);
                oSourceToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);

                that.addDatasourceButton = new sap.ui.commons.Button({
                    icon: "sap-icon://add",
                    tooltip: resourceLoader.getText("tol_add"),
                    //text: resourceLoader.getText("tol_add"),
                    press: function() {
                        var selectedViewNode = that.viewNode;
                        var noOfSelection = 1;
                        if (selectedViewNode.type == "JoinNode") {
                            if (selectedViewNode.inputs.count() === 0) {
                                noOfSelection = 2;
                            }
                            if (selectedViewNode.isDefaultNode()) {
                                noOfSelection = undefined;
                            }
                        } else if (selectedViewNode.type === "Union") {
                            noOfSelection = undefined;
                        }
                        var objectTypes = CalcViewEditorUtil.getSearchObjectTypes(selectedViewNode);
                        var findDialog = new NewFindDialog("find", {
                            types: objectTypes,
							context:that._context,
                            noOfSelection: noOfSelection,
                            onOK: function(results) {
                                if (results && results !== null) {
                                    var addInputCommands = [];
                                    for (var i = 0; i < results.length; i++) {
                                        var prop = results[i];
                                        prop.context = that._context;
                                        if (prop.type === "HDBTABLEFUNCTION" || prop.type === "HDBSCALARFUNCTION" || prop.type === "PROCEDURE" || prop.type ===
                                            "HDBPROCEDURE") {
                                            prop.type = prop.type.toLowerCase();
                                        }
										if(prop.isColumnView === "TRUE"){
										  prop.type = "CALCULATIONVIEW";
										}
                                        var canAdd = true;
                                        if (prop.packageName && prop.packageName === that._context.packageName && that._model.columnView.name === prop.name) {
                                            // same column view
                                            canAdd = false;
                                        }
                                        if (canAdd) {
                                            addInputCommands.push(new commands.CreateInputCommand(selectedViewNode.name, prop.name, prop));
                                        }
                                    }
                                    if (addInputCommands.length > 0) {
                                        var objects = that._execute(new modelbase.CompoundCommand(addInputCommands));
                                        var callback = function() {
                                            CalcViewEditorUtil._checkUnsupportedEntities(that._model, selectedViewNode, objects);
                                            //	selectedViewNode.$$events.publish(modelbase.ModelEvents.CHANGED);

                                            that._model.columnView.$$events.publish(commands.ViewModelEvents.VIEWNODE_CHANGED);
                                            selectedViewNode.$$events.publish(modelbase.ModelEvents.CHANGED);
                                        };
                                        ModelProxyResolver.ProxyResolver.resolve(that._model, that._context, callback);
                                        //that.refreshToolItems();
                                    }
                                }
                            }
                        });
                    }
                });
                oSourceToolbar.addItem(that.addDatasourceButton);

                that.removeSourceButton = new sap.ui.commons.Button({
                    icon: "sap-icon://delete",
                    tooltip: resourceLoader.getText("tol_remove"),
                    //text: resourceLoader.getText("tol_remove"),
                    press: function() {
                        var selectedIndex = mappingControl._getSourceTable().getSelectedIndex();
                        if (selectedIndex !== -1) {
                            var sPath = mappingControl._getSourceTable().getContextByIndex(selectedIndex).sPath;
                            sPath = sPath.split("/");
                            if (sPath.length === 4) {
                                var inputKey = that.viewNode.inputs._keys[sPath[3]];
                                var callback = function(okPressed) {
                                    if (okPressed) {
                                        that._execute(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].inputs["' + inputKey + '"]'));
                                        setTimeout(function() {
                                            that.refreshToolItems();
                                        }, 10);
                                    }
                                };
                                var dialog = new ReferenceDialog({
                                    undoManager: that._undoManager,
                                    element: [that.viewNode.inputs.get(inputKey)],
                                    fnCallbackMessageBox: callback,
                                    isRemoveCall: true
                                });
                                dialog.openMessageDialog();
                            }

                        }
                    }
                });
                oSourceToolbar.addItem(that.removeSourceButton);

                /* var oButton3 = new sap.ui.commons.Button({
                                icon: resourceLoader.getImagePath("Automap.png"),
                                tooltip: "This is a test tooltip",
                                press: function() {
                                    alert('Alert');
                                }
                            });
                            oSourceToolbar.addItem(oButton3);*/

                that.addToTargetButton = new sap.ui.commons.Button({
                    icon: "sap-icon://duplicate",
                    tooltip: resourceLoader.getText("tol_add_to_output"),
                    //text: resourceLoader.getText("tol_add_to_output"),
                    press: function() {
                        that.addToTarget();
                    }
                });
                oSourceToolbar.addItem(that.addToTargetButton);

                if (that.viewNode.type === "Union" || that.viewNode.isDefaultNode()) {
                    that.autoMapButton = new sap.ui.commons.Button({
                        icon: resourceLoader.getImagePath("Automap.png"),
                        tooltip: resourceLoader.getText("tit_auto_map"),
                        //text: resourceLoader.getText("tit_auto_map"),
                        press: function() {
                            that.elementNames = [];
                            var autoMapCommands = [];
                            that.viewNode.inputs.foreach(function(input) {
                                that.input = input;
                                input.getSource().elements.foreach(function(sourceElement) {
                                    var targetElement = that.viewNode.elements.get(sourceElement.name);
                                    if (!targetElement) {
                                        if (that.elementNames && that.elementNames.indexOf(CalcViewEditorUtil.normalizeString(sourceElement.name)) > -1) {
                                            targetElement = CalcViewEditorUtil.normalizeString(sourceElement.name);
                                        }
                                    }
                                    if (targetElement) {
                                        // element exist
                                        var mappingExist = false;
                                        input.mappings.foreach(function(mapping) {
                                            if (mapping.sourceElement === sourceElement && (mapping.targetElement === targetElement || mapping.targetElement.name ===
                                                    targetElement)) {
                                                mappingExist = true;
                                            }
                                        });
                                        if (!mappingExist) {
                                            var attributes = {};
                                            attributes.mappingAttributes = {
                                                sourceName: sourceElement.name,
                                                targetName: targetElement.name ? targetElement.name : targetElement,
                                                type: "ElementMapping"
                                            };
                                            attributes.input = input;
                                            attributes.merge = true;
                                            autoMapCommands.push(new commands.CreateMappingCommand(that.viewNode.name, attributes));
                                        }
                                    } else {
                                        autoMapCommands.push(that.createAddElementCommand(sourceElement));
                                    }

                                });
                            });
                            if (autoMapCommands.length > 0) {
                                that._execute(new modelbase.CompoundCommand(autoMapCommands));
                            }
                        }
                    });
                    oSourceToolbar.addItem(that.autoMapButton);
                }

                /*                var expandButton = new sap.ui.commons.Button({
                    icon: "sap-icon://expand-group",
                    tooltip: "Expand All",
                    press: function() {
                        var sourceTable = mappingControl._getSourceTable();
                        var length = sourceTable.getRows().length;
                        for (var i = 0; i < length; i++) {
                            sourceTable.expand(i);
                        }
                        that.collapsed = false;
                    }
                });
                oSourceToolbar.addRightItem(expandButton);

                var collapseButton = new sap.ui.commons.Button({
                    icon: "sap-icon://collapse-group",
                    tooltip: "Collapse All",
                    press: function() {
                        var sourceTable = mappingControl._getSourceTable();
                        var length = sourceTable.getRows().length;
                        for (var i = 0; i < length; i++) {
                            sourceTable.collapse(i);
                        }
                        that.collapsed = true;
                    }
                });
                oSourceToolbar.addRightItem(collapseButton);
*/
                that.refreshToolItems();

                return oSourceToolbar;

            },

            createCustomTargetToolbar: function(mappingControl) {
                var that = this;
                var oTargetToolbar = new sap.ui.commons.Toolbar();
                oTargetToolbar.addStyleClass("parameterToolbarStyle");
                oTargetToolbar.setStandalone(false);
                oTargetToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);

                if (that.viewNode.type === "Union") {
                    that.addConstantButton = new sap.ui.commons.Button({
                        icon: "sap-icon://add",
                        tooltip: resourceLoader.getText("txt_create_constant"),
                        //text: resourceLoader.getText("txt_create_constant"), 
                        press: function() {
                            var dialog = new ConstantMappingDialog({
                                undoManager: that._undoManager,
                                viewNode: that.viewNode,
                                isCreate: true
                            });
                            dialog.open();
                        }
                    });
                    oTargetToolbar.addItem(that.addConstantButton);
                }

                that.removeTargetBtn = new sap.ui.commons.Button({
                    icon: "sap-icon://delete",
                    tooltip: resourceLoader.getText("tol_remove"),
                    //text: resourceLoader.getText("tol_remove"),
                    press: function() {
                        var selection = null;
                        var mode = mappingControl._getTargetTable().getSelectionMode();
                        if (mappingControl._getTargetTable().getSelectedIndex() !== -1) {
                            var indices = mappingControl._getTargetTable().getSelectedIndices();
                            var elementList = [];
                            for (var k = 0; k < that.viewNode.elements._keys.length; k++) {
                                var element = that.viewNode.elements.get(that.viewNode.elements._keys[k]);
                                if (element) {
                                    if (!element.calculationDefinition && !element.measureType) {
                                        elementList.push(element.name);
                                    }
                                }
                            }

                            var deleteElementCommands = [];
                            var deleteElementList = [];
                            for (var j = 0; j < indices.length; j++) {
                                var selectedElement = that.viewNode.elements.get(elementList[indices[j]]);
                                if (selectedElement) {
                                    var inputIndex = -1;
                                    var mappingIndex = -1;
                                    deleteElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].elements["' +
                                        selectedElement.name + '"]'));
                                    that.viewNode.inputs.foreach(function(input) {
                                        input.mappings.foreach(function(mapping) {
                                            if (mapping.targetElement === selectedElement) {
                                                inputIndex = input.$$defaultKeyValue;
                                                mappingIndex = mapping.$$defaultKeyValue;
                                            }
                                        });
                                    });
                                    if (inputIndex !== -1 && mappingIndex !== -1) {
                                        deleteElementList.push(selectedElement);
                                        deleteElementCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].inputs["' +
                                            inputIndex + '"].mappings["' + mappingIndex + '"]"'));
                                    }
                                }
                            }
                            if (deleteElementCommands.length > 0) {
                                var callback = function(okPressed) {
                                    if (okPressed) {
                                        that._execute(new modelbase.CompoundCommand(deleteElementCommands));
                                        setTimeout(function() {
                                            that.refreshToolItems();
                                        }, 10);
                                    }
                                };
                                var dialog = new ReferenceDialog({
                                    undoManager: that._undoManager,
                                    element: deleteElementList,
                                    fnCallbackMessageBox: callback,
                                    isRemoveCall: true
                                });
                                dialog.openMessageDialog();
                            }
                        }
                    }
                });
                oTargetToolbar.addItem(that.removeTargetBtn);

                return oTargetToolbar;
            },

            updateMappingControl: function() {
                var that = this;
                setTimeout(function() {
                    if (that.oMappingControl._oMessageTables !== undefined && that.oMappingControl._oMessageTables !== null) {
                        that._transformationModel.setJSONData(that.createModel());
                        that.oMappingControl.refreshUI();
                    /* if (that.oMappingControl && that.oMappingControl._getSourceTable()) {
						var sourceTable = that.oMappingControl._getSourceTable();
						var length = sourceTable.getRows().length;
						for (var i = 0; i < length; i++) {
							sourceTable.expand(i);
						}
					}*/
                        that.refreshToolItems();
                    }
                    /*if (that.mLayout) {
                                       that.mLayout.destroyRows();
                                   }*/
                }, 10);
            },
            updatePropertiesControl: function() {
                var that = this;
                setTimeout(function() {
                    if (that.mLayout) {
                        that.mLayout.destroyRows();
                    }
                }, 10);
            },

            createModel: function(viewNode) {
                var that = this;
                this.model = {
                    "mappings": [],
                    prefixMap: {
                        "ns": "sap/hana/webide/calcvieweditor/mapping"
                    },
                    source: {
                        id: "sourceTitleEx",
                        title: "Source Title",
                        rootNode: {
                            name: "Root Source Element",
                            occ: "1..1",
                            tag: "RootSourceElement",
                            type: "element",
                            nodes: []
                        }
                    },
                    target: {
                        id: "targetTitleEx",
                        title: "Target Title",
                        rootNode: {
                            "field-type": "VIEW",
                            name: "Root Target Element",
                            occ: "1..1",
                            tag: "RootTargetElement",
                            type: "element",
                            nodes: []
                        }
                    }

                };
                // target elements
                that.viewNode.elements.foreach(function(element) {
                    if (that.viewNode.isDefaultNode()) {
                        if (element.getMapping() === undefined) {
                            element.hasNoMapping = true;
                        } else if (element.getMapping() !== undefined && element.getMapping().sourceElement === undefined) {
                            element.hasNoMapping = true;
                        } else {
                            element.hasNoMapping = false;
                        }
                    }
                    if (!element.calculationDefinition && !element.measureType) {
                        var fieldType = "COLUMN";
                        if (that.viewNode.isDefaultNode()) {
                            if (element.aggregationBehavior) {
                                if (element.aggregationBehavior === "none") {
                                    fieldType = "ATTRIBUTE";
                                } else {
                                    fieldType = "MEASURE";
                                }
                            }
                        }
                        var isProxy = CalcViewEditorUtil.isBasedOnElementProxy({
                            object: element,
                            viewNode: that.viewNode
                        });
                        var tooltip;
                        if (isProxy || element.hasNoMapping === true) {
                            fieldType += "_ERROR";
                            var sourceElement;
                            if (element.getMapping() && element.getMapping().sourceElement) {
                                sourceElement = element.getMapping().sourceElement;
                            }
                            if (sourceElement) {
                                if (sourceElement.isProxy) {
                                    tooltip = "This column is inconsistent because it is mapped to the proxy column " + sourceElement.name;
                                } else {
                                    tooltip = "This column is inconsistent because it is mapped to the inconsistent column " + sourceElement.name;
                                }
                            }
                            if (element.hasNoMapping === true) {
                                tooltip = "No mapping exists for this output column";
                            }
                        }
                        if (element.deprecated === true) {
                            if (fieldType.startsWith("AT")) {
                                fieldType = "ATTRIBUTE_DELETE";
                            }
                            if (fieldType.startsWith("ME")) {
                                fieldType = "MEASURE_DELETE";
                            }
                            tooltip = "This output column is marked for deprecation";
                        }
                        var elementData = {
                            "field-data-type": element.inlineType ? element.inlineType.primitiveType : undefined,
                            "field-length": element.inlineType ? element.inlineType.length : undefined,
                            "field-scale": element.inlineType ? element.inlineType.scale : undefined,
                            "field-type": fieldType,
                            "field-label": that.viewNode.isDefaultNode() ? element.label : undefined,
                            name: element.name,
                            tag: element.name,
                            tooltip: tooltip,
                            type: "element",
                            seq: "none",
                            focus: "none",
                            lineage: element.lineage
                        };
                        that.model.target.rootNode.nodes.push(elementData);
                    }
                });
                // source elements
                that.viewNode.inputs.foreach(function(input) {
                    var showInput = true;
                    if (that.viewNode.isDefaultNode() && that.viewNode.type === "JoinNode" && input.getSource()) {
                        if (input.getSource().$$className !== "ViewNode") {
                            showInput = false;
                        }
                    }
                    if (showInput) {
                        var fieldType = "CUBE";
                        var errorMsg;
                        var inputKey = input.$getKeyAttributeValue();
                        if (input.getSource()) {
                            fieldType = input.getSource().type.toUpperCase();
                            var isProxy = false;
                            input.getSource().elements.foreach(function(element) {
                                if (element.isProxy) {
                                    isProxy = true;
                                }
                            });
                            if (isProxy) {
                                fieldType += "_PROXY";
                            }
                            if (!isProxy) {
                                if (input.getSource().errorMsg) {
                                    fieldType += "_ERROR";
                                    errorMsg = input.getSource().errorMsg;
                                }
                            }
                        }
                        var inputData = {
                            "tag": CalcViewEditorUtil.getInputName(input),
                            "type": "element",
                            "name": CalcViewEditorUtil.getInputName(input),
                            "field-type": fieldType,
                            "nodes": [],
                            tooltip: errorMsg,
                            inputKey: inputKey
                        };
                        that.model.source.rootNode.nodes.push(inputData);
                        var source = input.getSource();
                        if (source && source.elements) {
                            source.elements.foreach(function(element) {
                                var inputData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
                                var fieldType = "COLUMN";
                                var tooltip;
                                if (element.isProxy) {
                                    fieldType = "COLUMN_PROXY";
                                    tooltip = "This column is  proxy column";
                                } else {
                                    var isProxy = CalcViewEditorUtil.isBasedOnElementProxy({
                                        object: element,
                                        input: input
                                    });
                                    if (isProxy) {
                                        fieldType += "_ERROR";
                                        tooltip = "This column is inconsistent because it is mapped to the proxy column";
                                    }
                                }
                                var elementData = {
                                    "field-data-type": element.inlineType ? element.inlineType.primitiveType : undefined,
                                    "field-length": element.inlineType ? element.inlineType.length : undefined,
                                    "field-scale": element.inlineType ? element.inlineType.scale : undefined,
                                    "field-type": fieldType,
                                    name: element.name,
                                    tag: element.name,
                                    type: "element",
                                    tooltip: tooltip,
                                    inputKey: inputKey,
                                    seq: "none",
                                    focus: "none",
                                    lineage: element.lineage
                                };
                                inputData.nodes.push(elementData);
                            });
                        }
                        input.mappings.foreach(function(mapping) {
                            if (mapping.sourceElement && mapping.targetElement) {
                                var oContext = null;
                                var inputData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
                                var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10,
                                    10)));
                                mappingModel.targetPaths = ["/RootTargetElement/" + mapping.targetElement.name];
                                mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.name + "/" + mapping.sourceElement.name];
                                mappingModel.fn = {};
                                mappingModel.fn.expression = mappingModel.sourcePaths[0];
                                mappingModel.fn.description = "";
                                that.model.mappings.push(mappingModel);
                            }
                        });
                    }
                });
                return this.model;
            },
            updateTable: function() {
				var that = this;
				if (that._columnLineage !== undefined) {
					this._columnLineage.registerTable("mp1", that.sourceTable);
					this._columnLineage.registerTable("mp2", that.targetTable);
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("mp1", that.sourceTable);
				    this._findandhighlight.registerTable("mp2", that.targetTable);
				}
			}
        };

        return MappingPane;

    });
