define([
    "../util/ResourceLoader",
    "../viewmodel/commands",
    "../view/CalcViewEditorUtil",
    "../dialogs/NewFindDialog",
    "../base/MetadataServices",
    "../base/modelbase",
    "../viewmodel/model",
    "../viewmodel/ModelProxyResolver",
    "../view/dialogs/ReferenceDialog",
    "../view/ReplaceDS_N/ReplaceDataSourceAndNode",
    "../view/dialogs/ExtractSemanticsDialog",
    "../view/CopyPasteNode",
    "./galilei"
], function(ResourceLoader, commands, CalcViewEditorUtil, NewFindDialog, MetadataServices, modelbase, model, ModelProxyResolver,
    ReferenceDialog,
    ReplaceDataSourceAndNode, ExtractSemanticsDialog, CopyPasteNode) {
    "use strict";
    var ViewModelEvents = commands.ViewModelEvents;
    var TRANSPARENT_IMG =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

    function isViewNodeSymbol(oSymbol) {
        if (!oSymbol) return false;
        var parentClass = oSymbol.classDefinition.parent;
        return parentClass && parentClass.qualifiedName === "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ViewNodeSymbol";
    }

    function isSemanticsSymbol(oSymbol) {
        return oSymbol && oSymbol.classDefinition.qualifiedName ===
            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.SemanticsSymbol";
    }

    function isSemanticsLinkSymbol(oSymbol) {
        return oSymbol && oSymbol.classDefinition.qualifiedName ===
            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.SemanticsLinkSymbol";
    }

    function isTableSymbol(oSymbol) {
        return oSymbol && oSymbol.classDefinition.qualifiedName ===
            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.TableSymbol";
    }

    function isExpandCollapseNodeSymbol(oSymbol) {
        return oSymbol && oSymbol.classDefinition.qualifiedName ===
            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ExpandCollapseNodeSymbol";
    }

    function isInputSymbol(oSymbol) {
        return oSymbol && oSymbol.classDefinition.qualifiedName ===
            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.InputSymbol";
    }

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    /**
     * @class
     * Defines the diagram editor extension for Analytics
     * @name Editor
     */
    var Editor = sap.galilei.ui.editor.defineDiagramEditorExtension({
        // Define class name
        fullClassName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor",

        // Define properties
        properties: {
            // Node symbol names
            JOIN_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.JoinNodeSymbol",
            UNION_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.UnionSymbol",
            GRAPH_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.GraphSymbol",
            PROJECTION_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.ProjectionSymbol",
            AGGREGATION_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.AggregationSymbol",
            RANK_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.RankSymbol",
            SEMANTICS_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.SemanticsSymbol",

            // Link symbol names
            INPUT_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.InputSymbol",

            // Link symbol tool name
            LINK_SYMBOL_TOOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.LinkSymbolTool",

            // Commands
            RENAME_VIEW_NODE_COMMAND: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.RenameViewNodeCommand",
            ADD_OBJECTS_COMMAND: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.AddObjectsCommand",
            DELETE_OBJECTS_COMMAND: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.deleteObjectsCommand",
            NOTES_COMMAND: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.notesCommand",

            // Images folder
            imagesFolder: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images",

            refreshViewNode: false
        },

        // Define methods
        methods: {

            _isDefaultNodeSymbol: function(oSymbol) {
                var defaultNode = this.model.viewModel.columnView.getDefaultNode();
                var defaultNodeSymbol;
                if (defaultNode) {
                    defaultNodeSymbol = this.editor._diagram.symbols.selectObject({
                        "viewNodeName": defaultNode.name
                    });
                }
                return defaultNodeSymbol === oSymbol;
            },

            dispose: function() {
                // remove property listeners
                for (var i = 0; i < this.diagram.symbols.length; i++) {
                    var oSymbol = this.diagram.symbols.get(i);
                    if (oSymbol.object) {
                        var listeners = oSymbol.object.getPropertyListeners("displayName");
                        for (var j = 0; j < listeners.length; j++) {
                            if (listeners[j].editor === this.editor) {
                                oSymbol.object.removePropertyListener(listeners[j], "displayName");
                            }
                        }
                    }
                }
                this.editor.extensionParam.builder.dispose();
                this._viewNodeCreatedHandler = null;
                this._reloadHandler = null;
                sap.galilei.core.Event.unSubscribeAllTarget(this.editor);
            },

            onKeyDown: function(event) {
                if (event.which === 27) { // cancel tool operation on Esc
                    this.editor.selectTool();
                }
                /*if (event.keyCode === 46) {
                    this.editor.deleteSelectedSymbols();
                }*/
                return false;
            },

            /**
             * Performs initialization of the extension.
             * @function
             * @name onInitialize
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             */
            onInitialize: function() {
                var that = this;
                this._isExecutingCommand = false;

                // suppress registration for key events
                /*                if (!this.editor._onKeyDownCallback) {
                    this.editor._onKeyDownCallback = function() {};
                }*/

                // Add a drop shadow filter
                var addGlowFilter = function(oViewer, idFilter, sColor, nSize) {
                    if (oViewer && idFilter) {
                        var glowFilter = new sap.galilei.ui.common.style.Glow({
                            id: idFilter,
                            color: sColor,
                            size: nSize
                        });
                        glowFilter.create(oViewer);
                    }
                };

                // TODO: Add it in the framework
                // Adds a glow filter for highlight
                addGlowFilter(this.viewer, "filterSelectionGlow", "#7CAAC6", 3);
                // CAUTION: gradients have to be maintained as well in
                // /watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Gradients.svg
                // which is used for Firefox
                this.addLinearGradient("joinFill", "#DDE8F5", "#98C1F4");
                this.addLinearGradient("unionFill", "#EDEFE2", "#D6DAC3");
                this.addLinearGradient("projectionFill", "#DEE0EF", "#C1C2DA");
                this.addLinearGradient("aggregationFill", "#DDDAD7", "#C4B9A5");
                this.addLinearGradient("rankFill", "#AEAFB2", "#B5B6B9");

                /*this.addLinearGradient("joinFill", "#DEEDF5", "#F8FDFD");
                this.addLinearGradient("unionFill", "#F6FFDE", "#F9FDF8");
                this.addLinearGradient("projectionFill", "#FFF5CC", "#FFF9F4");
                this.addLinearGradient("aggregationFill", "#DEE2F5", "#F8F9FD");*/
                this.addLinearGradient("semanticsFill", "#E9EAEF", "#ADB0BD");

                var expandCollapseHandler = function(editor, oSymbol) {
                    var viewNodeSymbol = oSymbol.parentSymbol;
                    var viewNode = editor.model.viewModel.columnView.viewNodes.get(viewNodeSymbol.viewNodeName);
                    // TODO : Use Command to perform expand / collapse operation
                    if (viewNode.layout && oSymbol.object) {
                        if (oSymbol.object.name) { // collapse ViewNode
                            viewNode.layout.expanded = false;
                        } else { // Expand ViewNode
                            viewNode.layout.expanded = true;
                        }
                        editor.repaintViewNode(viewNodeSymbol);
                        editor._editor.drawAllSymbols();
                    }
                };

                var symbolSelectedHandler = function(event) {
                    if (this.editor.extensionParam.builder.removeButton) {
                        this.editor.extensionParam.builder.removeButton.setEnabled(false);
                    }
                    var events = this.model.viewModel.columnView.$getEvents();
                    var selectedSymbol = event.selectedSymbols.length > 0 ? event.selectedSymbols[0] : null;
                    var isTableSelected = false;
                    if (isTableSymbol(selectedSymbol)) {
                        selectedSymbol = selectedSymbol.parentSymbol;
                        isTableSelected = true;
                    }
                    if (isInputSymbol(selectedSymbol) || isTableSymbol(selectedSymbol)) {
                        if (this.editor.extensionParam.builder.removeButton) {
                            this.editor.extensionParam.builder.removeButton.setEnabled(true);
                        }
                    }
                    if (isViewNodeSymbol(selectedSymbol) && selectedSymbol.object) {
                        var viewNodeName = selectedSymbol.object.name;
                        events.publish(ViewModelEvents.VIEWNODE_SELECTED, viewNodeName);
                        var viewNode = this.model.viewModel.columnView.viewNodes.get(viewNodeName);
                        if (viewNode && !viewNode.isDefaultNode() && this.editor.extensionParam.builder.removeButton) {
                            this.editor.extensionParam.builder.removeButton.setEnabled(true);
                        } else if (viewNode && viewNode.isDefaultNode() && isTableSelected && this.editor.extensionParam.builder.removeButton) {
                            this.editor.extensionParam.builder.removeButton.setEnabled(true);
                        }
                    } else if (isSemanticsSymbol(selectedSymbol)) {
                        events.publish(ViewModelEvents.VIEWNODE_SELECTED, "Semantics Node");
                    } else if (isExpandCollapseNodeSymbol(selectedSymbol)) {
                        expandCollapseHandler(this, selectedSymbol);
                    }
                };
                sap.galilei.core.Event.subscribe("symbols.selection.changed", symbolSelectedHandler, this, this.editor);

                var symbolUnselectedHandler = function(event) {
                    if (this._editor.selectedSymbols && this._editor.selectedSymbols.length === 0) {
                        this.hideContextMenu();
                    }

                };
                sap.galilei.core.Event.subscribe("symbol.unselected", symbolUnselectedHandler, this, this.editor);

                var contextMenuHandler = function(event) {
                    this.showContextMenu(event);
                };
                var editorContextMenuHandler = function(event) {
                    this.showEditorContextMenu(event);
                };
                sap.galilei.core.Event.subscribe("symbol.contextmenu", contextMenuHandler, this, this.editor);
                that.editor.viewer.backgroundPointerPanelShape.on(sap.galilei.ui.common.DOMEvents.contextmenu, editorContextMenuHandler, that);

                /*var hideWidegtsHandler = function(event) {
                    this.hideContextMenu();
                };
                sap.galilei.core.Event.subscribe("symbol.hidewidegts", hideWidegtsHandler, this, this.editor);*/

                var moveSymbolHandler = function(oEvent) {
                    var oSymbol = oEvent.sourceSymbol;
                    if (isTableSymbol(oSymbol) || isExpandCollapseNodeSymbol(oSymbol)) {
                        oEvent.cancel = true;
                    }
                };
                sap.galilei.core.Event.subscribe("move.symbol.dragstart", moveSymbolHandler, this, this.editor);

                var canDeleteHandler = function(event) {
                    var symbol = event.sourceSymbol;
                    if (isSemanticsSymbol(symbol) || isSemanticsLinkSymbol(symbol) || this._isDefaultNodeSymbol(symbol)) {
                        event.cancel = true;
                    }
                };
                sap.galilei.core.Event.subscribe("can.delete.symbol", canDeleteHandler, this, this.editor);

                /*                var deleteHandler = function(event) {
                    var symbol = event.sourceSymbol;
                    if (isInputSymbol(symbol)) {

                    }
                };
                sap.galilei.core.Event.subscribe("delete.symbol", deleteHandler, this, this.editor);*/

                var viewNodeCreatedHandler = function(event) {
                    var viewNode = this.model.viewModel.columnView.viewNodes.get(event.name);
                    var viewNodeSymbol = this.editor.extensionParam.builder.buildViewNode(viewNode);
                    this.editor.registerSymbolEvents(viewNodeSymbol);
                    this._registerViewNodeEvents(viewNodeSymbol);
                    this.editor.drawSymbol(viewNodeSymbol);
                };

                this._viewNodeCreatedHandler = this._createViewModelEventHandler(viewNodeCreatedHandler);
                this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.VIEWNODE_CREATED, this._viewNodeCreatedHandler, this);
                var _reloadContent = function(event) {
                    this.model.viewModel.columnView.viewNodes.foreach(function(viewNode) {
                        var viewNodeSymbol = that.diagram.symbols.selectObject({
                            "viewNodeName": viewNode.name
                        });
                        if (viewNodeSymbol) {
                            var containsProxy = false;
                            viewNode.inputs.foreach(function(input) {
                                if (input.getSource()) {
                                    input.getSource().elements.foreach(function(element) {
                                        if (element.isProxy) {
                                            containsProxy = true;
                                        }
                                    });
                                }

                            });
                            var workspace = viewNode.workspace;
                            if (viewNode.type === "Graph") {
                                if (workspace) {
                                    workspace.elements.foreach(function(element) {
                                        if (element.isProxy) {
                                            containsProxy = true;
                                        }
                                    });
                                }
                            }
                            if (containsProxy) {
                                viewNodeSymbol.object.containsProxy = "proxy";
                            } else {
                                if (viewNodeSymbol.object) {
                                    viewNodeSymbol.object.containsProxy = "none";
                                }
                            }
                            //performance analysis
                            if (that.model.viewModel.isPerformanceAnalysis && viewNode.type === "JoinNode" && !viewNode.isDefaultNode()) {
                                if (viewNode.joins.size() === 1) {
                                    var joinDef = viewNode.joins.get(0);
                                    if (joinDef.isJoinValidated && joinDef.joinDeff === "Warning") {
                                        viewNodeSymbol.object.validationStatus = joinDef.validationStatusIcon;
                                        viewNodeSymbol.object.validationStatusString = joinDef.validationStatusMessage;
                                    }
                                }
                            }
                            if (!that.model.viewModel.isPerformanceAnalysis) {
                                if (viewNodeSymbol.object.validationStatus !== TRANSPARENT_IMG) {
                                    viewNodeSymbol.object.validationStatus = TRANSPARENT_IMG;
                                    viewNodeSymbol.object.validationStatusString = undefined;
                                }
                            }
                            if (viewNode.type === "Projection" || "Aggregation") {

                                if (viewNode.filterExpression && viewNode.filterExpression.formula.trim().length > 0) {
                                    viewNodeSymbol.object.filterExpression = resourceLoader.getImagePath("Filter.png");
                                    viewNodeSymbol.object.filterExpressionvalue = viewNode.filterExpression.formula;
                                } else {
                                    viewNodeSymbol.object.filterExpression = TRANSPARENT_IMG
                                }
                            }
                            if (viewNode.type === "JoinNode" && !viewNode.isStarJoin()) {
                                if (viewNode.joins.size() === 1) {
                                    var joinDeff = viewNode.joins.get(0);

                                    if (joinDeff.cardinality === "C1_1") {
                                        viewNodeSymbol.object.joinCardinality = resourceLoader.getImagePath("one2one.gif");
                                    } else if (joinDeff.cardinality === "C1_N") {
                                        viewNodeSymbol.object.joinCardinality = resourceLoader.getImagePath("one2n.gif");
                                    } else if (joinDeff.cardinality === "CN_1") {
                                        viewNodeSymbol.object.joinCardinality = resourceLoader.getImagePath("n2one.gif");
                                    } else if (joinDeff.cardinality === "CN_N") {
                                        viewNodeSymbol.object.joinCardinality = resourceLoader.getImagePath("n2n.gif");
                                    } else {
                                        viewNodeSymbol.object.joinCardinality = TRANSPARENT_IMG;
                                    }
                                    if (joinDeff.joinType === "leftOuter") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("leftJoin_b.png");
                                    } else if (joinDeff.joinType === "rightOuter") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("rightJoin_b.png");
                                    } else if (joinDeff.joinType === "inner") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("innerJoin_b.png");
                                    } else if (joinDeff.joinType === "fullOuter") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("outerJoin_b.png");
                                    } else if (joinDeff.joinType === "textTable") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("text.gif");
                                    } else if (joinDeff.joinType === "referential") {
                                        viewNodeSymbol.object.joinType = resourceLoader.getImagePath("innerJoin_b.png");
                                    } else {
                                        viewNodeSymbol.object.joinType = TRANSPARENT_IMG;
                                    }

                                } else {
                                    // set to default values
                                    viewNodeSymbol.object.joinCardinality = TRANSPARENT_IMG;
                                    viewNodeSymbol.object.joinType = TRANSPARENT_IMG;
                                }

                            }
                            if (viewNode.endUserTexts && viewNode.endUserTexts.comment.text.trim()) {
                                viewNodeSymbol.object.comments = resourceLoader.getImagePath("Note.png");
                                viewNodeSymbol.object.commentsvalue = viewNode.endUserTexts.comment.text;
                            } else {
                                viewNodeSymbol.object.comments = TRANSPARENT_IMG;
                            }
                            that.repaintViewNode(viewNodeSymbol);
                        }
                    });

                };

                this._reloadHandler = this._createViewModelEventHandler(_reloadContent);
                this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED, this._reloadHandler, this);
                this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.VIEWNODE_CHANGED, this._reloadHandler, this);
                this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.INPUT_LOADED, this._reloadContent, this);
                this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.WORKSPACE_LOADED, this._reloadContent, this);

                for (var i = 0; i < this.diagram.symbols.length; i++) {
                    var oSymbol = this.diagram.symbols.get(i);
                    if (isViewNodeSymbol(oSymbol)) {
                        this._registerViewNodeEvents(oSymbol);
                    } else if (isInputSymbol(oSymbol)) {
                        this._registerInputEvents(oSymbol);

                    }
                }
            },

            _createViewModelEventHandler: function(func, thisArg) {
                var that = this;
                return function(event) {
                    if (!that._isExecutingCommand) {
                        that._isExecutingCommand = true;
                        try {
                            return func.call(thisArg ? thisArg : that, event, that);
                        } finally {
                            that._isExecutingCommand = false;

                        }
                    }
                };
            },

            _execute: function(command) {
                var wasExecutingCommand = this._isExecutingCommand;
                this._isExecutingCommand = true;
                try {
                    return this.model.viewModel.$getUndoManager().execute(command);
                } finally {
                    this._isExecutingCommand = wasExecutingCommand;
                }
            },

            _registerInputEvents: function(oSymbol) {
                var that = this;
                var columnView = this.model.viewModel.columnView;
                var targetNodeName = oSymbol.object.target.name;
                var targetNodeSymbol = oSymbol.targetSymbol;
                var inputName = oSymbol.object.name;
                var viewNode = columnView.viewNodes.get(targetNodeName);

                var objectDeletedHandler = this._createViewModelEventHandler(function(event) {
                    if (event.name === inputName) {
                        that.editor.deleteSymbol(oSymbol);
                    }
                });

                var deleteSymbolHandler = function(event) {
                    if (event.sourceSymbol === oSymbol) {
                        var input = viewNode.inputs.get(inputName);
                        if (input) {
                            if (!that._isExecutingCommand) {
                                var command = new modelbase.DeleteCommand('columnView.viewNodes["' + targetNodeName + '"].inputs["' + inputName + '"]');
                                that._execute(command);
                            }
                            // no need to unsubscribe from viewnode event INPUT_DELETED since viewnode has been deleted
                            sap.galilei.core.Event.unSubscribeScope("delete.symbol", oSymbol);
                            // Repaint ViewNode
                            setTimeout(function() {
                                that.repaintViewNode(targetNodeSymbol);
                            }, 10);
                        }
                    }
                };

                viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_DELETED, objectDeletedHandler, oSymbol);
                viewNode.$getEvents().subscribe(ViewModelEvents.WORKSPACE_DELETED, objectDeletedHandler, oSymbol);
                sap.galilei.core.Event.subscribe("delete.symbol", deleteSymbolHandler, oSymbol, this.editor);
            },

            _registerTableEvents: function(oSymbol) {
                var that = this;
                var columnView = this.model.viewModel.columnView;
                var viewNodeName = oSymbol.parentSymbol.viewNodeName;
                var viewNodeSymbol = oSymbol.parentSymbol;
                var viewNode = columnView.viewNodes.get(viewNodeName);
                var inputName = oSymbol.inputIndex;


                 

                var objectDeletedHandler = this._createViewModelEventHandler(function(event) {
                    if(viewNode.type === "Graph"){
                        inputName = event.name;
                    }

                    if (event.name === inputName) {
                        setTimeout(function() {
                            that.editor.deleteSymbol(oSymbol);
                        }, 10);
                        setTimeout(function() {
                            if (viewNode) {
                                var containsProxy = false;
                                if (!viewNode.isGraphNode()) {
                                    viewNode.inputs.foreach(function(input) {
                                        if (input.getSource()) {
                                            input.getSource().elements.foreach(function(element) {
                                                if (element.isProxy) {
                                                    containsProxy = true;
                                                }
                                            });
                                        }
                                    });
                                }
                                /* GraphNode Implementaion with workspace - start */
                                else {
                                    if (viewNode.workspace) {
                                        viewNode.workspace.elements.foreach(function(element) {
                                            if (element.isProxy) {
                                                containsProxy = true;
                                            }
                                        })
                                    }

                                }
                                /* GraphNode Implementaion with workspace - end */
                                if (containsProxy) {
                                    viewNodeSymbol.object.containsProxy = "proxy";
                                } else {
                                    if (viewNodeSymbol.object) {
                                        viewNodeSymbol.object.containsProxy = "none";
                                    }
                                }
                            }
                            that.repaintViewNode(viewNodeSymbol);
                        }, 100);
                    }
                });

                var deleteSymbolHandler = function(event) {
                    if (event.sourceSymbol === oSymbol) {
                        var input = viewNode.inputs.get(inputName);
                        var viewNodeDeleted = true;
                        if (viewNodeSymbol.isHidden === false) {
                            viewNodeDeleted = false;
                        }
                        if (input && !that.refreshViewNode && !viewNodeDeleted) {
                            if (!that._isExecutingCommand) {
                                var linkExist;
                                if (input.getSource().$$className === "ViewNode") {
                                    var linkSymbols = viewNodeSymbol.getLinkSymbols();
                                    for (var i = 0; i < linkSymbols.length; i++) {
                                        var linkSymbol = linkSymbols[i];
                                        if (linkSymbol.sourceSymbol.viewNodeName === input.getSource().name) {
                                            linkExist = linkSymbol;
                                            break;
                                        }
                                    }
                                }
                                if (linkExist) {
                                    Q.fcall(function() {
                                        that.editor.deleteSymbol(linkExist);
                                    }).done();
                                } else {
                                    var command = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNodeName + '"].inputs["' + inputName + '"]');
                                    that._execute(command);

                                    // no need to unsubscribe from viewnode event INPUT_DELETED since viewnode has been deleted
                                    sap.galilei.core.Event.unSubscribeScope("delete.symbol", oSymbol);
                                    // Repaint ViewNode
                                    setTimeout(function() {
                                        that.repaintViewNode(viewNodeSymbol);
                                    }, 10);
                                }
                            }
                        }
                    }
                };
                viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_DELETED, objectDeletedHandler, oSymbol);

                viewNode.$getEvents().subscribe(ViewModelEvents.WORKSPACE_DELETED, objectDeletedHandler, oSymbol);

                sap.galilei.core.Event.subscribe("delete.symbol", deleteSymbolHandler, oSymbol, this.editor);
            },

            _registerViewNodeEvents: function(oSymbol) {
                var that = this;

                var columnView = this.model.viewModel.columnView;
                var objectName = oSymbol.object.name;
                var viewNode = this.model.viewModel.columnView.viewNodes.get(objectName);

                for (var i = 0; i < oSymbol.symbols.length; i++) {
                    var tableSymbol = oSymbol.symbols.get(i);
                    if (isTableSymbol(tableSymbol)) {
                        this._registerTableEvents(tableSymbol);
                    }
                }

                var inputCreatedHandler = this._createViewModelEventHandler(function(event) {
                    var input, inputSymbol;
                    if (viewNode.type === "Graph") {
                        input = viewNode.workspace;
                        inputSymbol = that.editor.extensionParam.builder.buildInput(oSymbol, viewNode, input);
                    } else {
                        input = viewNode.inputs.get(event.name);
                        inputSymbol = that.editor.extensionParam.builder.buildInput(oSymbol, viewNode, input);
                    }

                    //var inputSymbol = that.editor.extensionParam.builder.buildInput(oSymbol, viewNode, input);
                    if (inputSymbol) {
                        that.editor.registerSymbolEvents(inputSymbol);
                        that._registerInputEvents(inputSymbol);
                        that.repaintViewNode(inputSymbol.targetSymbol);
                        that.editor.drawSymbol(inputSymbol);
                    } else {
                        var viewNodeSymbol = that.editor._diagram.symbols.selectObject({
                            "viewNodeName": viewNode.name
                        });
                        that.repaintViewNode(viewNodeSymbol);
                    }

                });

                var objectDeletedHandler = this._createViewModelEventHandler(function(event) {
                    if (event.name === viewNode.name) {
                        that.editor.deleteSymbol(oSymbol);
                    }
                });

                var deleteSymbolHandler = function(event) {
                    if (event.sourceSymbol === oSymbol) {
                        if (!that._isExecutingCommand) {
                            var command = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode.name + '"]');
                            that._execute(command);
                        }
                        // no need to unsubscribe from viewnode event INPUT_CREATED since viewnode has been deleted
                        columnView.$getEvents().unsubscribe(ViewModelEvents.VIEWNODE_DELETED, objectDeletedHandler, oSymbol);
                        columnView.$getEvents().unsubscribe(ViewModelEvents.VIEWNODE_CHANGED, viewNodeChangedHandler, oSymbol);
                        sap.galilei.core.Event.unSubscribeScope("delete.symbol", oSymbol);
                        sap.galilei.core.Event.unSubscribeScope("resize.symbol.before", oSymbol);
                        setTimeout(function() {
                            columnView.$getEvents().publish(ViewModelEvents.VIEWNODE_SELECTED, "Semantics Node");
                        }, 100);
                    } else {
                        var dropedNode = that.model.viewModel.columnView.viewNodes.get(that.dropedNode)
                        if (dropedNode) {
                            if (!that._isExecutingCommand && that.prerentOfDropedNode) {
                                var prerentOfDropedNode = that.model.viewModel.columnView.viewNodes.get(that.prerentOfDropedNode);
                                var inputs;
                                dropedNode.inputs.foreach(function(input) {
                                    inputs = input.getSource();
                                });
                                var list = [];
                                if (inputs) {

                                    var par = {
                                        name: inputs.name,
                                        id: inputs.id,
                                        packageName: inputs.packageName,
                                        physicalSchema: inputs.physicalSchema,
                                        schemaName: inputs.schemaName,
                                        type: inputs.type
                                    };

                                    list.push(new commands.CreateInputCommand(prerentOfDropedNode.name, inputs.name, par));
                                }
                                list.push(new modelbase.DeleteCommand('columnView.viewNodes["' + dropedNode.name + '"]'));

                                that._execute(new modelbase.CompoundCommand(list));
                                that.dropedNode = undefined;
                                that.prerentOfDropedNode = undefined;
                                that.editor.extension.repaintViewNode(oSymbol);
                            }
                            // no need to unsubscribe from viewnode event INPUT_CREATED since viewnode has been deleted
                            columnView.$getEvents().unsubscribe(ViewModelEvents.VIEWNODE_DELETED, objectDeletedHandler, event.sourceSymbol);
                            columnView.$getEvents().unsubscribe(ViewModelEvents.VIEWNODE_CHANGED, viewNodeChangedHandler, event.sourceSymbol);
                            sap.galilei.core.Event.unSubscribeScope("delete.symbol", event.sourceSymbol);
                            sap.galilei.core.Event.unSubscribeScope("resize.symbol.before", event.sourceSymbol);
                            setTimeout(function() {
                                columnView.$getEvents().publish(ViewModelEvents.VIEWNODE_SELECTED, "Semantics Node");
                            }, 100);
                        }
                    }
                };

                var resizeSymbolHandler = function(event) {
                    if (event.sourceSymbol === oSymbol) {
                        if (!that.refreshViewNode) {
                            that.repaintViewNode(oSymbol);
                        }
                    }
                };

                if (!viewNode.isDefaultNode()) {
                    oSymbol.object.addPropertyListener({
                            onPropertyChanged: function(event) {
                                if (event.newValue !== viewNode.name) {
                                    var nameExist = false;
                                    columnView.viewNodes.foreach(function(node) {
                                        if (node.name === event.newValue) {
                                            nameExist = true;
                                        }
                                    });
                                    if (nameExist || !CalcViewEditorUtil.checkValidUnicodeChar(event.newValue)) {
                                        oSymbol.object.displayName = viewNode.name;
                                    } else {
                                        var changeViewNodeNameCommand = new commands.ChangeViewNodeCommand(viewNode.name, {
                                            name: event.newValue
                                        });
                                        that._execute(changeViewNodeNameCommand);
                                    }
                                }
                            },
                            editor: this.editor // marker to identify own listeners on dispose
                        },
                        "displayName"
                    );
                }

                var viewNodeChangedHandler = function(event) {
                    if (event.name === viewNode.name) {
                        oSymbol.object.displayName = viewNode.name;
                        oSymbol.object.name = viewNode.name;
                        oSymbol.viewNodeName = viewNode.name;
                        columnView.viewNodes.foreach(function(node) {
                            for (var i = 0; i < node.inputs._keys.length; i++) {
                                var input = node.inputs.get(node.inputs._keys[i]);
                                if (input && input.getSource() && input.getSource().name === viewNode.name) {
                                    var targetNodeSymbol = that.editor._diagram.symbols.selectObject({
                                        "viewNodeName": node.name
                                    });
                                    //setTimeout(function() {
                                    that.repaintViewNode(targetNodeSymbol);
                                    //}, 10);
                                    break;
                                }
                            }
                        });
                        that.repaintViewNode(oSymbol);
                    }
                };

                sap.galilei.core.Event.subscribe("resize.symbol.before", resizeSymbolHandler, oSymbol, this.editor);
                viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_CREATED, inputCreatedHandler, oSymbol);
                viewNode.$getEvents().subscribe(ViewModelEvents.WORKSPACE_CREATED, inputCreatedHandler, oSymbol);
                columnView.$getEvents().subscribe(ViewModelEvents.VIEWNODE_DELETED, objectDeletedHandler, oSymbol);
                columnView.$getEvents().subscribe(ViewModelEvents.VIEWNODE_CHANGED, viewNodeChangedHandler, oSymbol);
                sap.galilei.core.Event.subscribe("delete.symbol", deleteSymbolHandler, oSymbol, this.editor);
            },

            postMoveSymbols: function(vSymbols, oSymbolContainers) {
                if (this.editor.defaultPostMoveSymbols) {
                    this.editor.defaultPostMoveSymbols(vSymbols, oSymbolContainers);
                }
            },

            postCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkSymbol) {
                if (this.editor.defaultPostCreateLinkSymbol) {
                    this.editor.defaultPostCreateLinkSymbol(oSourceSymbol, oTargetSymbol, oLinkSymbol);
                }

                if (isInputSymbol(oLinkSymbol)) {
                    var targetName = oTargetSymbol.object.name;
                    var sourceName = oSourceSymbol.object.name;
                    var createInputCommand = new commands.CreateInputCommand(targetName, sourceName);
                    var object = this._execute(createInputCommand);
                    oLinkSymbol.object.name = object.$getKeyAttributeValue();
                    this._registerInputEvents(oLinkSymbol);
                    this.repaintViewNode(oLinkSymbol.targetSymbol);

                }
            },

            postCreateSymbol: function(oSymbol) {
                var editor = this.editor;
                editor.defaultPostCreateSymbol(oSymbol);

                if (isViewNodeSymbol(oSymbol)) {
                    oSymbol.viewNodeName = oSymbol.object.name;
                    var attributes = {
                        objectAttributes: {
                            type: oSymbol.object.classDefinition.name,
                            name: oSymbol.object.name
                        },
                        layoutAttributes: {
                            expanded: true,
                            xCoordinate: oSymbol.x,
                            yCoordinate: oSymbol.y,
                            width: oSymbol.width,
                            height: oSymbol.height
                        }
                    };
                    if (this.linkTargetNode && this.linkSourceNode && event.x === this.model.x1 && event.y === this.model.x2) {
                        attributes.insertNode = {};
                        attributes.insertNode.sourceNode = this.linkSourceNode;
                        attributes.insertNode.targetNode = this.linkTargetNode;
                    }
                    var createViewNodeCommand = new commands.CreateViewNodeCommand(attributes);
                    var object = this._execute(createViewNodeCommand);

                    if (this.linkTargetNode && this.linkSourceNode) {
                        var viewNodeSymbol = this.diagram.symbols.selectObject({
                            "viewNodeName": this.linkTargetNode
                        });

                        this.repaintViewNode(viewNodeSymbol);
                    }

                    this.linkTargetNode = undefined;
                    this.linkSourceNode = undefined;
                    this.model.x1 = undefined;
                    this.model.x2 = undefined;
                    var viewNode = this.model.viewModel.columnView.viewNodes.get(oSymbol.viewNodeName);
                    //var expandSymbol = this.editor.extensionParam.builder.buildExpandCollapseNode(viewNode, oSymbol);
                    //this.registerSymbolEvents(expandSymbol);
                    //this._editor.drawSymbol(expandSymbol);
                    this._registerViewNodeEvents(oSymbol);

                    //finding target and souce node names for newly inserded node
                    for (var i = 0; i < this.editor.getAllSymbols().length; i++) {
                        if (this.editor.getAllSymbols()[i].__fullClassName__ === "InputSymbol") {

                            if (this.editor.getAllSymbols()[i].targetSymbol.viewNodeName === oSymbol.object.name) {

                            }
                            if (this.editor.getAllSymbols()[i].sourceSymbol.viewNodeName === oSymbol.object.name) {

                            }
                        }
                    }

                }
            },

            createSymbol: function(sObjectClassName, oParam) {
                return this.editor.defaultCreateSymbol(sObjectClassName, oParam);
            },

            createObject: function(sObjectClassName, oParam) {
                return this.editor.defaultCreateObject(sObjectClassName, oParam);
            },

            setDefaultObjectName: function(oObject) {
                if (oObject) {
                    var parentClass = oObject.classDefinition.parent;
                    if (parentClass && parentClass.qualifiedName === "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ViewNode") {
                        oObject.name = this.model.viewModel.getNextViewNodeName(oObject.classDefinition.name);
                        oObject.displayName = oObject.name;
                    }
                }
            },

            registerSymbolEvents: function(oSymbol) {
                this.editor.defaultRegisterSymbolEvents(oSymbol);
            },

            unregisterSymbolEvents: function(oSymbol) {
                this.editor.defaultUnregisterSymbolEvents(oSymbol);
            },

            /*            addLinearGradient: function(gradient, startColor, stopColor) {
                var gradientFill = this.viewer.d3SvgDefs.append("svg:linearGradient")
                    .attr("id", gradient)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("gradientUnits", "objectBoundingBox");
                gradientFill.append("svg:stop")
                    .attr("offset", "5%")
                    .attr("stop-color", startColor);
                gradientFill.append("svg:stop")
                    .attr("offset", "95%")
                    .attr("stop-color", stopColor);
            },*/

            /**
             * Defines a gradient.
             * @function
             * @name addLinearGradient
             *
             */
            addLinearGradient: function(sGradientId, sStartColor, sStopColor) {
                var oGradient = new sap.galilei.ui.common.style.LinearGradient({
                    id: sGradientId,
                    stops: [{
                        offset: "5%",
                        color: sStartColor
                    }, {
                        offset: "85%",
                        color: sStopColor
                    }]
                });

                oGradient.createGradient(this.viewer);
            },

            /**
             * Checks whether a link symbol can be created between the source symbol and the target symbol using the link symbol tool definition.
             * @function
             * @name canCreateLinkSymbol
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             * @param {Symbol} oSourceSymbol The source symbol.
             * @param {Symbol} oTargetSymbol The target symbol.
             * @param {Object} oLinkTool The link symbol tool definition.
             * @returns {boolean} true if the link symbol can be created.
             */
            canCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkTool) {
                if (!this.canAddTable(oTargetSymbol.viewNodeName, oSourceSymbol.viewNodeName)) {
                    return false;
                }
                if (oSourceSymbol === oTargetSymbol) {
                    return false;
                }

                /*  if (oSourceSymbol && oTargetSymbol && oLinkTool) {
                    var sQualifiedSourceName = oSourceSymbol.classDefinition.qualifiedName,
                        sQualifiedTargetName = oTargetSymbol.classDefinition.qualifiedName;
                    if (oTargetSymbol.getLinkSymbols() && oTargetSymbol.getLinkSymbols().length == 2) {
                        return false;
                    }
                }*/
                return true;
            },

            canAttachSymbol: function(oParent, oSymbol, oAttachParam) {

                if (isViewNodeSymbol(oParent) && isViewNodeSymbol(oSymbol)) {
                    var node = this.model.viewModel.columnView.viewNodes.get(oSymbol.viewNodeName);
                    if (node && node.type === "Projection" && node.isDataSource && this.canAddTable(oParent.viewNodeName)) {
                        this.dropedNode = node.name;
                        this.prerentOfDropedNode = oParent.viewNodeName;
                        return true;
                    }
                    return false;
                }
                if (isSemanticsSymbol(oParent) || isSemanticsSymbol(oSymbol)) {
                    return false;
                }
                if (isTableSymbol(oParent) || isTableSymbol(oSymbol)) {
                    return false;
                }
                /*           if (isInputSymbol(oParent) && isViewNodeSymbol(oSymbol)) {
                                return true;
                }*/
                return this.editor.defaultCanAttachSymbol(oParent, oSymbol, oAttachParam);
            },

            /**
             * Gets the tools definition. The definition is an array of tool definition.
             * Create node symbol tool definition the parameters:
             * name: <(optional) The tool name>,
             * type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool
             * symbolClass: <The symbol class qualified name>
             * symbolParam: <(optional) The symbol property values>
             * objectClass: < (optional) The object class qualified name>
             * objectParam:  <(optional) The object property values>
             * objectReference: <(optional) The name of the reference where the object should be added>
             * smallIcon: <The small icon URL, usually 16x16>
             * largeIcon: <(optional) The large icon URL, usually 32x32>
             * cursor: <(optional) The cursor URL, usually 32x32>
             *
             * Create link symbol tool definition the parameters:
             * name: <The tool name>
             * type: sap.galilei.ui.editor.tool.Types.createLinkSymbolTool
             * linksDefinition: <Array of supported link symbols>
             * {
             * sourceSymbol: <The source symbol class qualified name>
             * targetSymbol: <The target symbol class qualified name>
             * linkSymbolClass: <The link symbol class qualified name>
             * linkSymbolParam: <(optional) The link symbol property values>
             * linkObjectClass: < (optional) The link object class qualified name>
             * linkObjectParam:  <(optional) The link object property values>
             * linkObjectReference: <(optional) The name of the reference where the link object should be added>
             * }
             * smallIcon: <The small icon URL, usually 16x16>
             * largeIcon: <(optional) The large icon URL, usually 32x32>
             * cursor: <The cursor URL>
             *
             * Normal tool definition the parameters:
             * name: <The tool name>
             * type: sap.galilei.ui.editor.tool.Types.tool
             * canExecute: function (oParam), where oParam contains editor, diagram, symbol
             * execute: function (oParam)
             * smallIcon: <The small icon URL, usually 16x16>
             * largeIcon: <(optional) The large icon URL, usually 32x32>
             * cursor: <The cursor URL>
             * @function
             * @name getToolsDefinition
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             * @param {Array} The tools definition.
             */
            getToolsDefinition: function() {
                var self = this,
                    oToolsDef = [{
                        name: this.JOIN_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.JOIN_SYMBOL,
                        smallIcon: "Join.png",
                        tooltip: resourceLoader.getText("tol_create_join", "analytics")
                    }, {
                        name: this.UNION_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.UNION_SYMBOL,
                        smallIcon: "Union.png",
                        tooltip: resourceLoader.getText("tol_create_union", "analytics")
                    }, {
                        name: this.GRAPH_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.GRAPH_SYMBOL,
                        smallIcon: "Union.png",
                        tooltip: resourceLoader.getText("tol_create_graph", "analytics")
                    }, {
                        name: this.PROJECTION_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.PROJECTION_SYMBOL,
                        smallIcon: "Projection.png",
                        tooltip: resourceLoader.getText("tol_create_projection", "analytics")
                    }, {
                        name: this.AGGREGATION_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.AGGREGATION_SYMBOL,
                        smallIcon: "Aggregation.png",
                        tooltip: resourceLoader.getText("tol_create_aggregation", "analytics")
                    }, {
                        name: this.RANK_SYMBOL,
                        type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
                        symbolClass: this.RANK_SYMBOL,
                        smallIcon: "Rank.png",
                        tooltip: resourceLoader.getText("tol_create_rank", "analytics")
                    }, {
                        name: this.LINK_SYMBOL_TOOL,
                        type: sap.galilei.ui.editor.tool.Types.createLinkSymbolTool,
                        smallIcon: "Connection.gif",
                        linksDefinition: [{
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.JOIN_SYMBOL,
                                targetSymbol: this.SEMANTICS_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            },

                            {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            },

                            {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.RANK_SYMBOL,
                                targetSymbol: this.SEMANTICS_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.GRAPH_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.GRAPH_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.GRAPH_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.GRAPH_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.GRAPH_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.UNION_SYMBOL,
                                targetSymbol: this.SEMANTICS_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {

                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.PROJECTION_SYMBOL,
                                targetSymbol: this.SEMANTICS_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.JOIN_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.UNION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            },

                            {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.PROJECTION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.AGGREGATION_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.RANK_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }, {
                                sourceSymbol: this.AGGREGATION_SYMBOL,
                                targetSymbol: this.SEMANTICS_SYMBOL,
                                linkSymbolClass: this.INPUT_SYMBOL
                            }
                        ]
                    }];

                this.addImagesFolder(oToolsDef);
                return oToolsDef;
            },

            /**
             * Gets the context button pad definition for symbol.
             * @function
             * @name getContextButtonPad
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             * @param {Object} oSymbol The symbol.
             */
            getContextButtonPad: function(oSymbol) {
                var aButtons;
                if (oSymbol) {
                    switch (oSymbol.classDefinition.qualifiedName) {
                        case this.JOIN_SYMBOL:
                        case this.UNION_SYMBOL:
                        case this.GRAPH_SYMBOL:
                        case this.PROJECTION_SYMBOL:
                        case this.AGGREGATION_SYMBOL:
                        case this.RANK_SYMBOL:
                            if (this._isDefaultNodeSymbol(oSymbol)) {
                                aButtons = [{
                                    commandName: this.ADD_OBJECTS_COMMAND
                                }];
                            } else {
                                aButtons = [{
                                        toolName: this.LINK_SYMBOL_TOOL
                                    }, {
                                        commandName: this.ADD_OBJECTS_COMMAND
                                    }, {
                                        commandName: this.DELETE_OBJECTS_COMMAND
                                    }, {
                                        commandName: this.NOTES_COMMAND
                                    }
                                    /*, {
                                toolName: this.JOIN_SYMBOL
                            }, {
                                toolName: this.UNION_SYMBOL
                            }, {
                                toolName: this.PROJECTION_SYMBOL
                            }, {
                                toolName: this.AGGREGATION_SYMBOL
                            }, {
                                commandName: this.RENAME_VIEW_NODE_COMMAND
                            }*/
                                ];
                            }
                            if (oSymbol.object !== undefined) {
                                var viewNode = this.model.viewModel.columnView.viewNodes.get(oSymbol.object.name);
                                if (viewNode.isDataSource === true) {
                                    aButtons = [{
                                        commandName: this.ADD_OBJECTS_COMMAND
                                    }, {
                                        commandName: this.DELETE_OBJECTS_COMMAND
                                    }];
                                }
                            }
                            break;
                    }
                }

                return aButtons;
            },

            /**
             * Selects a link symbol tool definition between the source symbol and target symbol.
             * @function
             * @name selectLinkSymbolDefinition
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             * @param {Symbol} oSourceSymbol The source symbol.
             * @param {Symbol} oTargetSymbol The target symbol.
             * @returns {Object} The link symbol definition to use.
             */
            selectLinkSymbolDefinition: function(oSourceSymbol, oTargetSymbol) {
                return {
                    linkSymbolClass: this.INPUT_SYMBOL
                };
            },

            /**
             * Gets the commands definition. The definition is an array of command definition.
             * Command definition has the parameters:
             * name: <The command name>
             * displayName: <The command display name>
             * tooltip: <The command tooltip>
             * type: <(optional) The command type>
             * isEnabled: <Indicates if the command is enabled>
             * isHidden: <Indicates if the command is visible>
             * canExecute: function (oParam), where oParam contains editor, diagram, symbol
             * execute: function (oParam)
             * smallIcon: <The small icon URL, usually 16x16>
             * largeIcon: <(optional) The large icon URL, usually 32x32>
             * @function
             * @name getCommandsDefinition
             * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
             * @param {Array} The commands definition.
             */
            getCommandsDefinition: function() {
                var that = this;

                var oCommandsDef = [{
                    name: this.ADD_OBJECTS_COMMAND,
                    className: "sap.galilei.ui.editor.command.ChangePropertyCommand",
                    attribute: "name",
                    onValueChanged: function() {
                        var test;
                    },
                    canExecute: function(oParam) {
                        return oParam.editor.extension.canAddTable(oParam.symbol.viewNodeName);
                    },
                    execute: function(oParam) {
                        var selectedViewNode = oParam.editor.model.viewModel.columnView.viewNodes.get(oParam.symbol.viewNodeName);
                        var noOfSelection = 1;
                        if (selectedViewNode.type === "JoinNode") {
                            if (selectedViewNode.inputs.count() === 0) {
                                noOfSelection = 2;
                            }
                            if (selectedViewNode.isStarJoin()) {
                                noOfSelection = undefined;
                            }
                        } else if (selectedViewNode.type === "Union") {
                            noOfSelection = undefined;
                        }
                        var objectTypes = CalcViewEditorUtil.getSearchObjectTypes(selectedViewNode);
                        var findDialog = new NewFindDialog("find", {
                            types: objectTypes,
                            noOfSelection: noOfSelection,
                            context: oParam.editor.extensionParam.builder._context,
                            onOK: function(results) {
                                if (results && results !== null) {
                                    var addInputCommands = [];
                                    for (var i = 0; i < results.length; i++) {
                                        var prop = results[i];
                                        var canAdd = true;
                                        /*if (prop.type == "TABLE") {
                                            prop.schemaName = prop.schemaName;
                                        }*/
                                        if (prop.type === "HDBTABLEFUNCTION" || prop.type === "HDBSCALARFUNCTION" || prop.type === "PROCEDURE" || prop.type ===
                                            "HDBPROCEDURE") {
                                            prop.type = prop.type.toLowerCase();
                                        }
                                        if (prop.isColumnView === "TRUE") {
                                            prop.type = "CALCULATIONVIEW";
                                        }
                                        prop.context = oParam.editor.extensionParam.builder._context;
                                        if (prop.packageName && prop.packageName === oParam.editor.extensionParam.builder._context.packageName && oParam.editor.model
                                            .viewModel.columnView.name === prop.name) {
                                            // same column view
                                            canAdd = false;
                                        }
                                        if (canAdd) {
                                            if (selectedViewNode.isStarJoin()) {
                                                selectedViewNode.inputs.foreach(function(input) {
                                                    if (input.selectAll && input.getSource().packageName === prop.packageName && input.getSource().name === prop.name) {
                                                        canAdd = false;
                                                    }
                                                });
                                                if (canAdd) {
                                                    addInputCommands.push(new commands.CreateInputCommand(selectedViewNode.name, prop.name, prop, true));
                                                } else {
                                                    // open a fully configured message box
                                                    sap.ui.commons.MessageBox.show(
                                                        "Cannot add duplicate objects in Star Join",
                                                        sap.ui.commons.MessageBox.Icon.ERROR,
                                                        "", [sap.ui.commons.MessageBox.Action.OK]);
                                                }
                                            } else if (selectedViewNode.isGraphNode()) {
                                                addInputCommands.push(new commands.CreateWorkSpaceCommand(selectedViewNode.name, prop.name, prop));
                                            } else {
                                                addInputCommands.push(new commands.CreateInputCommand(selectedViewNode.name, prop.name, prop));
                                            }
                                        }
                                    }
                                    if (addInputCommands.length > 0) {
                                        var objects = oParam.editor.extension._execute(new modelbase.CompoundCommand(addInputCommands));
                                        var callback = function() {
                                            if (selectedViewNode.type === "Graph") {
                                                selectedViewNode.mapAllWorkspaceElementToViewNodeElement();
                                            }
                                            selectedViewNode.$$events.publish(ViewModelEvents.CHANGED);
                                            /*if (selectedViewNode.type === "Graph") {
<<<<<<< HEAD
                                            	var that = this,wsElement,wsCommand =[];
                                            	if(selectedViewNode.workspace !== 'undefined'){
                                            		var elements = selectedViewNode.workspace.elements;
                                            		for(var i=0 ; i<elements.count(); i++){
                                            		    var elementAttributes;
                                            			wsElement = elements.getAt(i);
                                            			elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(wsElement);
                                            			elementAttributes.objectAttributes.name = wsElement.name;
                                            			elementAttributes.objectAttributes.label = wsElement.name;
                                            			elementAttributes.input = selectedViewNode.workspace;
                                            			wsCommand.push(new commands.AddElementCommand(selectedViewNode.name,elementAttributes));
                                            		}
                                            	  oParam.editor.extension._execute(new modelbase.CompoundCommand(wsCommand));
                                            	}
                                            	/*var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
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
=======
                                                var that = this,wsElement,wsCommand =[];
                                                if(selectedViewNode.workspace !== 'undefined'){
                                                    var elements = selectedViewNode.workspace.elements;
                                                    for(var i=0 ; i<elements.count(); i++){
                                                        var elementAttributes;
                                                        wsElement = elements.getAt(i);
                                                        elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(wsElement);
                                                        elementAttributes.objectAttributes.name = wsElement.name;
                                                        elementAttributes.objectAttributes.label = wsElement.name;
                                                        elementAttributes.input = selectedViewNode.workspace;
                                                        wsCommand.push(new commands.AddElementCommand(selectedViewNode.name,elementAttributes));
                                                    }
                                                  oParam.editor.extension._execute(new modelbase.CompoundCommand(wsCommand));
                                                }
                                                /*var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
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
>>>>>>> Fixed graph node undo and redo operation bug. And fixed some styling

                                            }*/
                                            if (objects && objects.length) {

                                                var setAliascommands = [];
                                                var elementNames = [];
                                                for (var j = 0; j < objects.length; j++) {
                                                    var input = objects[j];
                                                    if (selectedViewNode.isStarJoin()) {
                                                        oParam.editor.extension.repaintViewNode(oParam.symbol);
                                                    }
                                                    if (input.selectAll) {
                                                        input.getSource().elements.foreach(function(element) {
                                                            var newAliasName = CalcViewEditorUtil.getUniqueNameForElement(element.name, selectedViewNode, elementNames, input.$$defaultKeyValue);
                                                            if (newAliasName !== element.name) {
                                                                elementNames.push(newAliasName);
                                                                var attributes = {
                                                                    aliasName: newAliasName
                                                                };
                                                                setAliascommands.push(new commands.SetSharedElementPropertiesCommand(selectedViewNode.name, input.$$defaultKeyValue,
                                                                    element.name,
                                                                    attributes));
                                                            }
                                                        });
                                                    }

                                                    if (selectedViewNode.type === "Graph") {
                                                        selectedViewNode.$$events.publish(ViewModelEvents.WORKSPACE_LOADED);

                                                    } else {
                                                        selectedViewNode.$$events.publish(ViewModelEvents.INPUT_LOADED, input.$$defaultKeyValue);
                                                    }
                                                    oParam.editor.extension.repaintViewNode(oParam.symbol);
                                                }
                                                if (setAliascommands.length > 0) {
                                                    oParam.editor.extension._execute(new modelbase.CompoundCommand(setAliascommands));
                                                    oParam.editor.extension.openMessageDialog(selectedViewNode, setAliascommands);
                                                }
                                                CalcViewEditorUtil._checkUnsupportedEntities(oParam.editor.model.viewModel, selectedViewNode, objects);
                                            }
                                        };
                                        if (selectedViewNode.isUnion() && oParam.editor.model.viewModel.columnView.pruningTable) {
                                            oParam.editor.model.viewModel.columnView.readPruningInformation = true;
                                            var pruningCallBack = function() {
                                                oParam.editor.model.viewModel.columnView.$$events.publish(commands.ViewModelEvents.VIEWNODE_CHANGED);
                                            };
                                            ModelProxyResolver.ProxyResolver.readPruningInfo(oParam.editor.model.viewModel, prop.context, pruningCallBack);
                                        }

                                        ModelProxyResolver.ProxyResolver.resolve(oParam.editor.model.viewModel, oParam.editor.extensionParam.builder._context,
                                            callback);
                                        oParam.editor.extension.repaintViewNode(oParam.symbol);
                                    }
                                } else {
                                    // @author - Ajil : To display context pad if user press cancel button
                                    oParam.symbol.width = oParam.symbol.width + 0.00000001;
                                    oParam.editor.extension.repaintViewNode(oParam.symbol);
                                }
                            }
                        });
                    },
                    values: [],
                    smallIcon: "Add.png",
                    tooltip: resourceLoader.getText("tol_add_objects", "analytics")
                }, {
                    name: this.RENAME_VIEW_NODE_COMMAND,
                    className: "sap.galilei.ui.editor.command.ChangePropertyCommand",
                    attribute: "name",
                    onValueChanged: function() {
                        var test;
                    },
                    values: [{
                        value: undefined,
                        label: "empty"
                    }, {
                        value: "test",
                        label: "test"
                    }],
                    smallIcon: "Aggregation.png",
                    tooltip: resourceLoader.getText("tol_rename", "analytics")
                }, {
                    name: this.DELETE_OBJECTS_COMMAND,
                    className: "sap.galilei.ui.editor.command.ChangePropertyCommand",
                    attribute: "name",
                    onValueChanged: function() {
                        var test;
                    },
                    execute: function(oParam) {
                        var callback = function(okPressed) {
                            if (okPressed) {
                                oParam.editor.deleteSelectedSymbols();
                            }
                        };
                        var object;
                        if (isViewNodeSymbol(oParam.symbol)) {
                            var viewNode = oParam.editor.model.viewModel.columnView.viewNodes.get(oParam.symbol.viewNodeName);
                            if (viewNode) {
                                object = [viewNode];
                            }
                        }

                        var dialog = new ReferenceDialog({
                            undoManager: oParam.editor.model.viewModel.$getUndoManager(),
                            element: object,
                            fnCallbackMessageBox: callback,
                            isRemoveCall: true
                        });
                        dialog.openMessageDialog();
                    },
                    values: [{
                        value: undefined,
                        label: "empty"
                    }, {
                        value: "test",
                        label: "test"
                    }],
                    smallIcon: "Trash.gif",
                    tooltip: resourceLoader.getText("tol_delete", "analytics")
                }, {
                    name: this.NOTES_COMMAND,
                    className: "sap.galilei.ui.editor.command.ChangePropertyCommand",
                    attribute: "name",
                    onValueChanged: function() {
                        var test;
                    },
                    execute: function(oParam) {
                        var selectedViewNode = oParam.editor.model.viewModel.columnView.viewNodes.get(oParam.symbol.viewNodeName);
                        var comment = selectedViewNode.endUserTexts !== undefined ? selectedViewNode.endUserTexts.comment.text : "";
                        var commentValue;
                        var changeComments = function(event) {
                            var textArea = event.getSource();
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

                            var command = new commands.ChangeViewNodeCommand(selectedViewNode.name, attributes);
                            if (value || value === "") {
                                that._execute(command);
                                that._reloadHandler(this);
                            }
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
                                var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                                attributes.endUserTexts = {
                                    comment: {
                                        text: "",
                                        mimetype: "text/plain"
                                    }
                                };
                                var command = new commands.ChangeViewNodeCommand(selectedViewNode.name, attributes);
                                that._execute(command);
                                that._reloadHandler(this);

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

                        var offset = oParam.symbol._shape.width + "  " + oParam.symbol._shape.height;
                        tpComments.setPosition(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter,
                            oParam.symbol._shape._d3Node[0],
                            offset,
                            "Flip"
                        );

                        if (tpComments.isOpen()) {

                            tpComments.close();
                        } else {
                            commentField.setValue(comment);
                            tpComments.open();

                        }
                    },
                    values: [{
                        value: undefined,
                        label: "empty"
                    }, {
                        value: "test",
                        label: "test"
                    }],
                    smallIcon: "Note.png"
                        //tooltip: resourceLoader.getText("tol_delete", "analytics")
                }];

                this.addImagesFolder(oCommandsDef);
                return oCommandsDef;
            },

            canSupportInPlaceEditing: function(oSymbol, aClientPoint) {
                var node = this.model.viewModel.columnView.viewNodes.get(oSymbol.viewNodeName);
                if (node && node.isDataSource === true) {
                    return false;
                }
                if (isViewNodeSymbol(oSymbol) && !this._isDefaultNodeSymbol(oSymbol)) {
                    return true;
                }
                return false;
            },

            /**
             * Checks whether a symbol can be insert on a link symbol at the position aPoint.
             * @function
             * @name canInsertSymbolOnLinkSymbol
             * @memberOf sap.galilei.ui.editor.DiagramEditorExtension#
             * @param {String} sSymbolClass The node symbol class qualified name.
             * @param {Object} oCreateParam The input and output parameters. The parameters contain:
             * {
             *     point: (in/out) The view point where the symbol should be created.
             *     linkSymbol: (in/out) The link symbol.
             * }
             * @returns {Boolean} true if the symbol can be inserted.
             */
            canInsertSymbolOnLinkSymbol: function(sSymbolClass, oCreateParam) {
                if (oCreateParam.linkSymbol.__fullClassName__ === "SemanticsLinkSymbol") {
                    return false;
                }
                this.linkTargetNode = oCreateParam.linkSymbol.targetSymbol.viewNodeName;
                this.linkSourceNode = oCreateParam.linkSymbol.sourceSymbol.viewNodeName;
                this.model.x1 = event.x;
                this.model.x2 = event.y;
                return true;
            },

            canAddTable: function(viewNodeName, sourceViewNodeName) {
                var viewNode = this.model.viewModel.columnView.viewNodes.get(viewNodeName);
                var inputExist = false;
                if (viewNode) {
                    if (viewNode.type === "Projection" || viewNode.type === "Aggregation" || viewNode.type === "Rank") {
                        if (viewNode.inputs._keys.length > 0) {
                            return false;
                        }
                    }
                    if (viewNode.type === "JoinNode") {
                        if (!viewNode.isDefaultNode() && viewNode.inputs._keys.length > 1) {
                            return false;
                        }
                    }
                    if (viewNode.type === "Graph") {
                        if (viewNode.workspace !== undefined && viewNode.workspace !== null) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    if (sourceViewNodeName) {
                        viewNode.inputs.foreach(function(input) {
                            if (CalcViewEditorUtil.getInputName(input) === sourceViewNodeName) {
                                inputExist = true;
                            }
                            if (viewNode.isDefaultNode() && viewNode.type === "JoinNode") {
                                if (input.getSource() && input.getSource().$$className === "ViewNode") {
                                    inputExist = true;
                                }
                            }
                        });
                    }
                    return (!inputExist);
                }
                return false;
            },

            repaintViewNode: function(symbol) {
                if (symbol.isHidden) {
                    return;
                }
                var that = this;
                var tableSymbol;
                var viewNode = this.model.viewModel.columnView.viewNodes.get(symbol.viewNodeName);
                if (!viewNode) {
                    return;
                }
                this.resource.applyUndoableAction(function() {
                    var length = symbol.contentSymbols.length;
                    that.refreshViewNode = true;
                    for (var i = 0; i < length; i++) {
                        tableSymbol = symbol.contentSymbols.get(0);
                        sap.galilei.core.Event.unSubscribeScope("delete.symbol", tableSymbol);
                        that.editor.deleteSymbol(tableSymbol);
                    }
                    var expanded = that.editor.extensionParam.builder.isViewNodeExpanded(viewNode);
                    var height = 30;
                    if (expanded) {
                        if (viewNode.type === "Graph") {
                            //symbol.y = symbol.y + 14;
                            if (viewNode.workspace) {
                                height = 55;
                            }
                        } else {
                            height = 40 + viewNode.inputs._keys.length * 15;
                        }
                    }
                    //symbol.shape.contentShape.shapes[0].shapes[1].width = symbol.width - 44;
                    symbol.height = height;
                    that._editor.drawSymbol(symbol);
                    that.refreshViewNode = false;
                    //var expandSymbol = that.editor.extensionParam.builder.buildExpandCollapseNode(viewNode, symbol);
                    //that.registerSymbolEvents(expandSymbol);
                    //that._editor.drawSymbol(expandSymbol);
                    if (viewNode.isDataSource) {
                        expanded = false;
                        symbol.object.containsProxy = "pdDataSource";
                        symbol.isDatasource = true;
                        var oStyleSheet = new sap.galilei.ui.common.style.StyleSheet({
                            fill: "url(#joinFill)",
                            opacity: 1
                        });
                        //symbol.width=220;
                        symbol.highlight(oStyleSheet);
                    }
                    if (expanded) {
                        if (!viewNode.isGraphNode()) {
                            viewNode.inputs.foreach(function(input) {
                                tableSymbol = that.editor.extensionParam.builder.buildTable(input, viewNode, symbol);
                                that.registerSymbolEvents(tableSymbol);
                                that._registerTableEvents(tableSymbol);
                                that._editor.drawSymbol(tableSymbol);
                            });
                        }
                        /*graph node implementation with workspace -start*/
                        else {
                            if (viewNode.workspace && viewNode.workspace !== null && viewNode.workspace !== 'undefined') {
                                tableSymbol = that.editor.extensionParam.builder.buildTable(viewNode.workspace, viewNode,
                                    symbol);
                                that.registerSymbolEvents(tableSymbol);
                                that._registerTableEvents(tableSymbol);
                                that._editor.drawSymbol(tableSymbol);
                            }
                        }
                        /*graph node implementation with workspace -end*/
                    }
                    that.repaintLinkSymbols(symbol);
                    that._editor.drawAllSymbols();
                }, "refreshViewNode", true);
            },

            repaintLinkSymbols: function(oSymbol) {
                var aLinkSymbols = oSymbol.getLinkSymbols();
                if (aLinkSymbols) {
                    for (var index2 = 0; index2 < aLinkSymbols.length; index2++) {
                        var oLinkSymbol = aLinkSymbols[index2];
                        if (oLinkSymbol.sourceSymbol === oSymbol) {
                            oLinkSymbol.sourceSymbol = oSymbol;
                        }
                        if (oLinkSymbol.targetSymbol === oSymbol) {
                            oLinkSymbol.targetSymbol = oSymbol;
                        }
                        oLinkSymbol.updateSymbol();
                        oLinkSymbol.updateLinkRouting();
                        oLinkSymbol.updateLinkSymbolRoutings();
                    }
                }
            },

            expandCollapseAll: function(expand) {
                var that = this;
                this.model.viewModel.columnView.viewNodes.foreach(function(viewNode) {
                    var viewNodeSymbol = that.diagram.symbols.selectObject({
                        "viewNodeName": viewNode.name
                    });
                    if (viewNode.layout && viewNodeSymbol) {
                        viewNode.layout.expanded = expand;
                        viewNodeSymbol.object.isExpanded = viewNode.layout.expanded
                        that.repaintViewNode(viewNodeSymbol);
                    }
                });
                that._editor.drawAllSymbols();
            },

            showContextMenu: function(oEvent) {
                var oSymbol = oEvent.sourceSymbol;
                var that = this;
                if (isTableSymbol(oSymbol) && isViewNodeSymbol(oSymbol.parentSymbol)) {
                    var viewNode = that._editor.model.viewModel.columnView.viewNodes.get(oSymbol.parentSymbol.viewNodeName);
                    if (viewNode && viewNode.isDataSource) {
                        return true;
                    }
                }
                if (oEvent.editor === this._editor) {
                    var that = this;

                    var canRepalce;

                    var oSymbol = oEvent.sourceSymbol;

                    var contextMenu = CalcViewEditorUtil.getOrCreateContextMenu();
                    // Switch Between Default Nodes                                                                                           
                    if (oSymbol.object.isDefaultNode) {
                        if (oSymbol.object.isStarJoin) {
                            CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                imagePath: resourceLoader.getImagePath("Aggregation.png"),
                                name: resourceLoader.getText("Switch to Aggregation"),
                                action: that.switchToAggregation,
                                actionContext: that
                            });
                            CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                imagePath: resourceLoader.getImagePath("Projection.png"),
                                name: resourceLoader.getText("Switch to Projection"),
                                action: that.switchToProjection,
                                actionContext: that
                            });
                        } else {
                            /* CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                            imagePath: resourceLoader.getImagePath("starJoin.png"),
                                            name: resourceLoader.getText("Switch to Star Join"),
                                            action: that.switchToStarJoin,
                                            actionContext: that
                             }); */
                            if (oSymbol.object.name === "Aggregation") {
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: resourceLoader.getImagePath("Projection.png"),
                                    name: resourceLoader.getText("Switch to Projection"),
                                    action: that.switchToProjection,
                                    actionContext: that
                                });
                            } else {
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: resourceLoader.getImagePath("Aggregation.png"),
                                    name: resourceLoader.getText("Switch to Aggregation"),
                                    action: that.switchToAggregation,
                                    actionContext: that
                                });
                            }

                        }
                    }
                    // Replace Data Source
                    if (isTableSymbol(oSymbol) && oSymbol.object.isDataSource) {
                        // Extract Semantics
                        var viewNode = that._editor.model.viewModel.columnView.viewNodes.get(oSymbol.parentSymbol.viewNodeName);
                        if (!viewNode.isStarJoin() && viewNode.type !== "Graph") {
                            CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                imagePath: undefined,
                                name: resourceLoader.getText("tit_extract_semantics"),
                                action: that.extractSemanticsAction,
                                actionContext: that
                            });
                        }
                        // Replace Data Source
                        if (viewNode.type !== "Graph") {
                            CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                imagePath: undefined,
                                name: resourceLoader.getText("txt_replace_with_data_source"),
                                action: that.replaceDataSourceAction,
                                actionContext: that
                            });
                        }
                    }

                    // Remove and Repalce Node with Node
                    if (isViewNodeSymbol(oSymbol) && !oSymbol.object.isDefaultNode) {
                        var viewNode = that._editor.model.viewModel.columnView.viewNodes.get(oSymbol.viewNodeName);
                        if (viewNode) {
                            canRepalce = false;
                            viewNode.inputs.foreach(function(input) {
                                if (input.getSource().$$className === "ViewNode") {
                                    if (CalcViewEditorUtil.getParentNodeNameList(viewNode).length === 1) {
                                        canRepalce = true;
                                    }
                                }
                            });
                            if (canRepalce) {
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: undefined,
                                    name: resourceLoader.getText("txt_remove_replace_with_viewnode"),
                                    action: that.replaceNodeWithNodeAction,
                                    actionContext: that
                                });
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: undefined,
                                    name: resourceLoader.getText("txt_remove_replace_with_source"),
                                    action: that.replaceNodeWithDataSourceAction,
                                    actionContext: that
                                });
                            }
                        }
                    }

                    //Repalce Node with Node
                    /*if (isTableSymbol(oSymbol) && !oSymbol.object.isDataSource) {
                    canRepalce = false;
                    viewNode = that._editor.model.viewModel.columnView.viewNodes.get(oSymbol.parentSymbol.viewNodeName);
                    if (viewNode) {
                        var input = viewNode.inputs.get(oSymbol.inputIndex)
                        if (input && input.getSource().$$className === "ViewNode") {
                            viewNode = input.getSource();
                            viewNode.inputs.foreach(function(input) {
                                if (input.getSource().$$className === "ViewNode") {
                                    canRepalce = true;
                                }
                            });

                        }
                    }
                    if (canRepalce) {
                        CalcViewEditorUtil.createContextMenuItem(this.contextMenu, {
                            imagePath: undefined,
                            name: "Replace With Node",
                            action: that.replaceNodeWithNodeAction,
                             actionContext: that
                        });
                    }
                }*/
                    if (isTableSymbol(oSymbol)) {
                        var parentNode = that._editor.model.viewModel.columnView.viewNodes.get(oSymbol.parentSymbol.viewNodeName);

                        if (parentNode && parentNode.inputs.get(oSymbol.inputIndex)) {
                            viewNode = parentNode.inputs.get(oSymbol.inputIndex).getSource();
                            canRepalce = false;
                            if (viewNode && viewNode.$$className === "ViewNode") {
                                viewNode.inputs.foreach(function(input) {
                                    if (input.getSource().$$className === "ViewNode") {
                                        if (CalcViewEditorUtil.getParentNodeNameList(viewNode).length === 1) {
                                            canRepalce = true;
                                        }
                                    }
                                });
                            }
                            if (canRepalce) {
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: undefined,
                                    name: resourceLoader.getText("txt_remove_replace_with_viewnode"),
                                    action: that.replaceNodeWithNodeAction,
                                    actionContext: that
                                });
                            }
                        }
                    }

                    // Replace Node with Data Source
                    if (isTableSymbol(oSymbol) && !oSymbol.object.isDataSource && !oSymbol.parentSymbol.object.isStarJoin) {
                        CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                            imagePath: undefined,
                            name: resourceLoader.getText("txt_replace_with_data_source"),
                            action: that.replaceDataSourceAction,
                            actionContext: that
                        });
                    }

                    // Remove menu
                    if (isInputSymbol(oSymbol) || isTableSymbol(oSymbol) || (isViewNodeSymbol(oSymbol) && !oSymbol.object.isDefaultNode)) {
                        CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                            imagePath: undefined,
                            name: resourceLoader.getText("tol_remove"),
                            action: that.deleteAction,
                            actionContext: that
                        });
                        if (isViewNodeSymbol(oSymbol)) {
                            if (viewNode.isDataSource !== true && viewNode.type !== "Graph") {
                                CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                                    imagePath: undefined,
                                    name: resourceLoader.getText("Copy"),
                                    action: that.copyAction,
                                    actionContext: that
                                });
                            }
                        }
                    }

                    CalcViewEditorUtil.openContextMenu(oEvent);

                    return true;
                }

            },
            showEditorContextMenu: function(oEvent) {
                var that = this;
                that.model.viewModel.columnView.x = oEvent.clientX;
                that.model.viewModel.columnView.y = oEvent.clientY;
                if ((that.model.copyName !== null) && (that.model.copyName !== undefined) && (that._editor.model.viewModel.columnView.viewNodes.get(
                        that.model.copyName) !== undefined)) {
                    var contextMenu = CalcViewEditorUtil.getOrCreateContextMenu();
                    CalcViewEditorUtil.createContextMenuItem(contextMenu, {
                        imagePath: resourceLoader.getImagePath("undefined"),
                        name: resourceLoader.getText("Paste"),
                        action: that.pasteAction,
                        actionContext: that
                    });
                    CalcViewEditorUtil.openEditorContextMenu(oEvent);

                    return true;
                } else {
                    that.model.copyName = null;
                }

            },

            hideContextMenu: function() {
                CalcViewEditorUtil.hideContextMenu();
            },

            autolayout: function(oDiagram) {
                var that = this;
                var oAutoLayout = new sap.galilei.ui.editor.layout.DiagramAutoLayout();
                // Layouts the diagram (all top-level symbols) using the "Layered" algorithm that is based on klay.js. The klay.js needs to be included manually.
                // The layouter is sap.galilei.ui.common.layout.KlayLayouter.
                // The other layouters are "Directed" and "Organic". They are based on dagre.js. The dagre.js needs to be included manually.
                // You could also develop your own layouter.
                oAutoLayout.layoutDiagram(oDiagram, {
                        isSupportMultiEdges: true,
                        isDirected: true,
                        // Specify the layouter name and its options (klay.js options)
                        layout: {
                            name: "Layered", // klay.js only supports the "Layered" algorithm
                            direction: "UP", // Layout direction
                            nodePlace: "LINEAR_SEGMENTS",
                            edgeRouting: "ORTHOGONAL",
                            spacing: 50, // Distance between nodes
                            edgeSpacingFactor: 0.4,
                            separateConnComp: false
                        },
                        onPostLayoutGraph: function(diagram) {
                            /*if (diagram && diagram.graph && diagram.graph.nodes) {
                                diagram.graph.nodes.forEach(function(node) {
                                    node.x = node.x + 30;
                                    node.y = node.y + 20;
                                });
                            }*/
                        },
                        onFilterNodeSymbol: function(diagram, symbol) {
                            if (symbol && symbol.isKeeping) {
                                return false;
                            }
                            return true;
                        },
                        animationDuration: 0
                    },
                    this,
                    function(oAutoLayout) {
                        // If success, set x axix offset
                        var aSymbols = that.editor.getAllSymbols();
                        for (var i = 0; i < aSymbols.length; i++) {
                            var oSymbol = aSymbols[i];
                            if (isViewNodeSymbol(oSymbol) || isSemanticsSymbol(oSymbol)) {
                                oSymbol.moveBy(70, 20);
                                if (isViewNodeSymbol(oSymbol)) {
                                    that.repaintViewNode(oSymbol);
                                }
                                //that._editor.drawSymbol(oSymbol);
                            }
                        }
                        setTimeout(function() { // asychronous refresh
                            that._editor.drawAllSymbols();
                        }, 10);

                    },
                    function(error) {
                        throw error;
                    }
                );
            },

            deleteAction: function(that) {
                if (!that) {
                    that = this;
                }
                var viewNode;
                var callback = function(okPressed) {
                    if (okPressed) {
                        that._editor.deleteSelectedSymbols();
                    }
                };
                var selectedObject;
                if (that._editor.selectedSymbols) {
                    var selectedSymbol = that._editor.selectedSymbols[0];
                    if (selectedSymbol) {
                        if (selectedSymbol.classDefinition.qualifiedName ===
                            "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.TableSymbol" ||
                            selectedSymbol.classDefinition.qualifiedName === "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.InputSymbol") {
                            var viewNodeName;
                            var inputIndex, input;
                            if (selectedSymbol.classDefinition.qualifiedName ===
                                "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.ui.TableSymbol") {
                                viewNodeName = selectedSymbol.parentSymbol.viewNodeName;
                                inputIndex = selectedSymbol.inputIndex
                            } else {
                                viewNodeName = selectedSymbol.targetSymbol.viewNodeName;
                                inputIndex = selectedSymbol.object.name;
                            }
                            if (viewNodeName && inputIndex !== undefined) {
                                viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                                if (viewNode) {
                                    if (viewNode.type === "Graph") {
                                        input = viewNode.workspace;
                                    } else {
                                        input = viewNode.inputs.get(inputIndex);
                                    }
                                    if (input) {
                                        selectedObject = [input];
                                    }
                                }
                            }
                        } else if (selectedSymbol.viewNodeName) {
                            viewNode = that._editor.model.viewModel.columnView.viewNodes.get(selectedSymbol.viewNodeName);
                            if (viewNode) {
                                selectedObject = [viewNode];
                            }
                        }
                    }
                }
                var dialog = new ReferenceDialog({
                    undoManager: that.model.viewModel.$getUndoManager(),
                    element: selectedObject,
                    fnCallbackMessageBox: callback,
                    isRemoveCall: true,
                    viewNode: viewNode,
                    callBack: that.editor._extension.repaintGraph,
                    symbol: selectedSymbol,
                    editor: that.editor
                });

                dialog.openMessageDialog();

            },

            repaintGraph: function(selectedSymbol, editor) {
                editor._extension.repaintViewNode(selectedSymbol.parentSymbol);
            },

            copyAction: function(that) {
                if (!that) {
                    that = this;
                }
                var copyPasteNode = new CopyPasteNode({
                    undoManager: that.model.viewModel.$getUndoManager(),
                    columnView: that._editor.model.viewModel.columnView,
                    editor: that._editor,
                    model: that.model
                });
                copyPasteNode.copyNode(that.editor);

            },
            pasteAction: function(that) {
                if (!that) {
                    that = this;
                }
                var copyName = that.editor.model.viewModel.copyName;
                if (copyName !== null) {
                    var copyPasteNode = new CopyPasteNode({
                        undoManager: that.model.viewModel.$getUndoManager(),
                        columnView: that._editor.model.viewModel.columnView,
                        copyName: copyName,
                        editor: that._editor,
                        model: that.model
                    });
                    copyPasteNode.pasteNode(copyName);
                }

            },
            extractSemanticsAction: function(that) {

                if (!that) {
                    that = this;
                }
                var input, viewNode, viewNodeName;

                if (that._editor.selectedSymbols) {
                    var selectedSymbol = that._editor.selectedSymbols[0];
                    if (isTableSymbol(selectedSymbol)) {
                        viewNodeName = selectedSymbol.parentSymbol.viewNodeName;
                        viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                        if (viewNode) {
                            input = viewNode.inputs.get(selectedSymbol.inputIndex);
                        }
                    }

                }
                if (input) {
                    var extractSemanticsDialog = new ExtractSemanticsDialog({
                        undoManager: that.model.viewModel.$getUndoManager(),
                        columnView: that._editor.model.viewModel.columnView,
                        input: input,
                        viewNode: viewNode
                    });
                    extractSemanticsDialog.open();
                }

            },

            replaceDataSourceAction: function(that) {

                if (!that) {
                    that = this;
                }
                var input, viewNode, viewNodeName;

                if (that._editor.selectedSymbols) {
                    var selectedSymbol = that._editor.selectedSymbols[0];
                    if (isTableSymbol(selectedSymbol)) {
                        viewNodeName = selectedSymbol.parentSymbol.viewNodeName;
                        viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                        if (viewNode) {
                            input = viewNode.inputs.get(selectedSymbol.inputIndex);
                        }
                    }

                }
                if (input) {
                    var parameter = {
                        context: that._editor.extensionParam.builder._context,
                        viewNode: viewNode,
                        inputSource: input,
                        typeOfReplace: CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE,
                        undoManager: that.model.viewModel.$getUndoManager()
                    };
                    var dialog = new ReplaceDataSourceAndNode(parameter);
                    dialog.openRDSNDialog();
                }

            },

            replaceNodeWithNodeAction: function(that) {

                if (!that) {
                    that = this;
                }

                var input, viewNode, viewNodeName;

                if (that._editor.selectedSymbols) {
                    var selectedSymbol = that._editor.selectedSymbols[0];
                    if (isViewNodeSymbol(selectedSymbol)) {
                        viewNodeName = selectedSymbol.viewNodeName;
                        viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                    } else if (isTableSymbol(selectedSymbol)) {
                        var parentNode = that._editor.model.viewModel.columnView.viewNodes.get(selectedSymbol.parentSymbol.viewNodeName);
                        if (parentNode && parentNode.inputs.get(selectedSymbol.inputIndex)) {
                            viewNode = parentNode.inputs.get(selectedSymbol.inputIndex).getSource();
                            viewNodeName = parentNode.inputs.get(selectedSymbol.inputIndex).getSource().name;

                        }
                    }
                }

                if (viewNode) {
                    var parameter = {
                        context: that._editor.extensionParam.builder._context,
                        viewNode: viewNode,
                        typeOfReplace: CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE,
                        undoManager: that.model.viewModel.$getUndoManager()
                    };
                    var dialog = new ReplaceDataSourceAndNode(parameter);
                    dialog.openRDSNDialog();
                }
            },

            replaceNodeWithDataSourceAction: function(that) {

                if (!that) {
                    that = this;
                }
                var input, viewNode, viewNodeName;

                if (that._editor.selectedSymbols) {
                    var selectedSymbol = that._editor.selectedSymbols[0];
                    /* if (isTableSymbol(selectedSymbol)) {
                        viewNodeName = selectedSymbol.parentSymbol.viewNodeName;
                        viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                        if (viewNode) {
                            input = viewNode.inputs.get(selectedSymbol.inputIndex);
                        }
                    }*/
                    if (isViewNodeSymbol(selectedSymbol)) {
                        viewNodeName = selectedSymbol.viewNodeName;
                        viewNode = that._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                    }
                    var parentNode = CalcViewEditorUtil.getParentNodeName(viewNode);
                    if (parentNode) {
                        parentNode.inputs.foreach(function(ip) {
                            if (ip.getSource().name === viewNodeName) {
                                input = ip;
                            }
                        });
                    }

                }

                if (parentNode && input) {
                    var parameter = {
                        context: that._editor.extensionParam.builder._context,
                        viewNode: parentNode,
                        inputSource: input,
                        typeOfReplace: CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE,
                        undoManager: that.model.viewModel.$getUndoManager(),
                        isDeleteNode: true
                    };
                    var dialog = new ReplaceDataSourceAndNode(parameter);
                    dialog.openRDSNDialog();
                }

            },
            switchToAggregation: function(currentEditor) {
                var that = this;
                var executableCommands = [];
                var effectedElementInfo = [];
                if (currentEditor) {
                    var selectedSymbol = currentEditor._editor.selectedSymbols[0];
                    var viewNodeName = selectedSymbol.object.name;
                    var viewNode = currentEditor._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                    if (viewNodeName === 'Projection') {
                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);
                        executableCommands.push(new commands.ChangeColumnViewPropertiesCommand({
                            dataCatagory: "CUBE"
                        }));

                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Aggregation",
                            type: "Aggregation",
                            filterExpression: {
                                formula: ""
                            }
                        }));

                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Aggregation",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);

                        currentEditor.openConfirmationDialog("Switching from a projection node to an aggregation node. Do you want to continue?",
                            effectedElementInfo,
                            function() {
                                currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                            });

                    } else {
                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);

                        if (viewNode.inputs.size() > 0) {
                            for (var inputSeq = 0; inputSeq < viewNode.inputs.size(); inputSeq++) {
                                var input = viewNode.inputs.toArray()[inputSeq];
                                var source = input._source;
                                if (source.type && source.type.toUpperCase() === "CALCULATIONVIEW") {
                                    executableCommands.push(new modelbase.DeleteCommand(input));
                                    //  effectedElementInfo.push({name:source.fqName, message:"The Input  " + source.fqName + " will be deleted"});
                                }
                            }
                        }
                        if (viewNode.elements.size() > 0) {
                            for (var i = 0; i < viewNode.elements.size(); i++) {
                                var element = viewNode.elements.getAt(i);
                                if (element && element.measureType === model.MeasureType.RESTRICTION) {
                                    if (element.restrictions.size() > 0) {
                                        for (var j = 0; j < element.restrictions.size(); j++) {
                                            var restriction = element.restrictions.getAt(j);
                                            if (restriction && restriction.element && restriction.element.$getContainer() && restriction.element.$getContainer().type ===
                                                "CALCULATIONVIEW") {
                                                executableCommands.push(new modelbase.DeleteCommand(restriction));
                                            }
                                        }
                                    }
                                } else if (element && element.measureType === model.MeasureType.COUNTER) {
                                    if (element.exceptionAggregationStep && element.exceptionAggregationStep.referenceElements.size() > 0) {
                                        for (var k = 0; k < element.exceptionAggregationStep.referenceElements.size(); k++) {
                                            var referenceElement = element.exceptionAggregationStep.referenceElements.getAt(k);
                                            if (referenceElement && referenceElement.$getContainer() && referenceElement.$getContainer().type === "CALCULATIONVIEW") {
                                                executableCommands.push(new commands.RemoveCounterReferenceElemCommand(element.name, {
                                                    elementName: referenceElement.name,
                                                    entityFQN: referenceElement.$getContainer().fqName
                                                }));
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (viewNode.joins.size() > 0) {
                            for (var joinSeq = 0; joinSeq < viewNode.joins.size(); joinSeq++) {
                                var join = viewNode.joins.toArray()[joinSeq];
                                executableCommands.push(new modelbase.DeleteCommand(join));
                            }
                        }

                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Aggregation",
                            type: "Aggregation"
                        }));

                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Aggregation",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);
                        var ImapactMessage = "All shared dimentional calculation views of star join node will be deleted ";

                        currentEditor.openConfirmationDialog(
                            "Switching from a star join node to an aggregation node impacts the following objects. Do you want to continue?" + "\n" +
                            ImapactMessage, effectedElementInfo,
                            function() {
                                currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                            });

                    }
                }
            },
            switchToProjection: function(currentEditor) {
                var that = this;
                var executableCommands = [];
                var effectedElementInfo = [];
                if (currentEditor) {

                    var selectedSymbol = currentEditor._editor.selectedSymbols[0];
                    var viewNodeName = selectedSymbol.object.name;
                    var viewNode = currentEditor._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                    var oldDefaultNodeSymbol = currentEditor._editor._diagram.symbols.selectObject({
                        "viewNodeName": viewNodeName
                    });

                    if (viewNodeName === 'Aggregation') {

                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);
                        executableCommands.push(new commands.ChangeColumnViewPropertiesCommand({
                            dataCatagory: "DIMENTION"
                        }));
                        if (viewNode.elements.size() > 0) {
                            for (var i = 0; i < viewNode.elements.size(); i++) {
                                var element = viewNode.elements.getAt(i);
                                if (element && element.aggregationBehavior && element.aggregationBehavior.toUpperCase() !== "NONE") {
                                    if (element.measureType === model.MeasureType.COUNTER) {
                                        executableCommands.push(new modelbase.DeleteCommand(element));
                                        // effectedElementInfo.push({name:element.name, message:"The element " + element.name + " will be deleted"});
                                    } else if (element.measureType === model.MeasureType.CALCULATED_MEASURE) {
                                        var attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
                                        attributes.objectAttributes.aggregationBehavior = "none";
                                        attributes.objectAttributes.measureType = undefined;
                                        attributes.objectAttributes.engineAggregation = undefined;
                                        executableCommands.push(new commands.ChangeElementPropertiesCommand(viewNode.name, element.name, attributes));
                                        // effectedElementInfo.push({name:element.name,message:"The calculated measure " + element.name + " will be converted to calculated attribute"});
                                    } else if (element.measureType === model.MeasureType.RESTRICTION) {
                                        executableCommands.push(new modelbase.DeleteCommand(element));
                                        // effectedElementInfo.push({name:element.name, message:"The restricted measure " + element.name + " will be deleted"});
                                    } else {
                                        var attributeProperties = CalcViewEditorUtil.getAttributePropertiesModel(element);
                                        attributeProperties.objectAttributes.aggregationBehavior = "none";
                                        attributeProperties.objectAttributes.measureType = undefined;
                                        attributeProperties.objectAttributes.engineAggregation = undefined;
                                        executableCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributeProperties));
                                        //  effectedElementInfo.push({name:element.name, message: "The element " + element.name + " will convert to attribute"});
                                    }
                                }
                            }
                        }
                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Projection",
                            type: "Projection"
                        }));

                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Projection",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);
                        var impactMessage = " All measures and calculated measures in the node will be converted to attributes and calculated attributes.";
                        impactMessage = impactMessage + "\n" + "All restricted measures and counters in the node will be deleted"

                        if (effectedElementInfo.length > 0) {
                            currentEditor.openConfirmationDialog(
                                "Switching from an aggregation node to a projection node impacts the following objects. Do you want to continue?" + "\n" +
                                impactMessage, effectedElementInfo,
                                function() {
                                    var oldDefaultNodeSymbol = currentEditor._editor._diagram.symbols.selectObject({
                                        "viewNodeName": viewNodeName
                                    });
                                    currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                                });

                        } else {
                            currentEditor.openConfirmationDialog(
                                "Switching from an aggregation node to a projection node impacts the following objects. Do you want to continue?" + "\n" +
                                impactMessage, effectedElementInfo,
                                function() {
                                    currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                                });
                        }

                    } else {

                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);

                        if (viewNode.inputs.size() > 0) {
                            for (var inputSeq = 0; inputSeq < viewNode.inputs.size(); inputSeq++) {
                                var input = viewNode.inputs.toArray()[inputSeq];
                                var source = input._source;
                                if (source.type && source.type.toUpperCase() === "CALCULATIONVIEW") {
                                    executableCommands.push(new modelbase.DeleteCommand(input));
                                    // effectedElementInfo.push({name:source.fqName, message:"The Input  " + source.fqName + " will be deleted"});
                                }
                            }
                        }

                        if (viewNode.joins.size() > 0) {
                            for (var joinSeq = 0; joinSeq < viewNode.joins.size(); joinSeq++) {
                                var join = viewNode.joins.toArray()[joinSeq];
                                executableCommands.push(new modelbase.DeleteCommand(join));
                            }
                        }
                        executableCommands.push(new commands.ChangeColumnViewPropertiesCommand({
                            dataCatagory: "DIMENTION"
                        }));
                        if (viewNode.elements.size() > 0) {
                            for (var i = 0; i < viewNode.elements.size(); i++) {
                                var element = viewNode.elements.getAt(i);
                                if (element && element.aggregationBehavior && element.aggregationBehavior.toUpperCase() !== "NONE") {
                                    if (element.measureType === model.MeasureType.COUNTER) {
                                        executableCommands.push(new modelbase.DeleteCommand(element));
                                        // effectedElementInfo.push({name:element.name, message:"The element " + element.name + " will be deleted"});
                                    } else if (element.measureType === model.MeasureType.CALCULATED_MEASURE) {
                                        var attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
                                        attributes.objectAttributes.aggregationBehavior = "none";
                                        attributes.objectAttributes.measureType = undefined;
                                        attributes.objectAttributes.engineAggregation = undefined;
                                        executableCommands.push(new commands.ChangeElementPropertiesCommand(viewNode.name, element.name, attributes));
                                        // effectedElementInfo.push({name:element.name,message:"The calculated measure " + element.name + " will be converted to calculated attribute"});
                                    } else if (element.measureType === model.MeasureType.RESTRICTION) {
                                        executableCommands.push(new modelbase.DeleteCommand(element));
                                        // effectedElementInfo.push({name:element.name, message:"The restricted measure " + element.name + " will be deleted"});
                                    } else {
                                        var attributeProperties = CalcViewEditorUtil.getAttributePropertiesModel(element);
                                        attributeProperties.objectAttributes.aggregationBehavior = "none";
                                        attributeProperties.objectAttributes.measureType = undefined;
                                        attributeProperties.objectAttributes.engineAggregation = undefined;
                                        executableCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributeProperties));
                                        //  effectedElementInfo.push({name:element.name, message: "The element " + element.name + " will convert to attribute"});
                                    }
                                }
                            }
                        }

                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Projection",
                            type: "Projection"
                        }));

                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Projection",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);

                        var impactMessage = " All measures and calculated measures in the node will be converted to attributes and calculated attributes.";
                        impactMessage = impactMessage + "\n" + "All restricted measures and counters in the node will be deleted";
                        impactMessage = impactMessage + "\n" + "All shared dimentional calculation views of star join node will be deleted";

                        currentEditor.openConfirmationDialog(
                            "Switching from an star join node to a projection node impacts the following objects. Do you want to continue?" + "\n" +
                            impactMessage, effectedElementInfo,
                            function() {
                                currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                            });

                    }
                }
            },
            switchToStarJoin: function(currentEditor) {
                var that = this;
                var executableCommands = [];
                var effectedElementInfo = [];
                if (currentEditor) {
                    var inputDeleted = false;
                    var selectedSymbol = currentEditor._editor.selectedSymbols[0];
                    var viewNodeName = selectedSymbol.object.name;
                    var viewNode = currentEditor._editor.model.viewModel.columnView.viewNodes.get(viewNodeName);
                    if (viewNodeName === 'Projection') {
                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);
                        executableCommands.push(new commands.ChangeColumnViewPropertiesCommand({
                            dataCatagory: "CUBE"
                        }));
                        if (viewNode.inputs.size() === 1) {
                            var input = viewNode.inputs.get(0);
                            if (input.getSource() && (input.getSource().type === "CALCULATIONVIEW" || input.getSource().type === "DATA_BASE_TABLE" || input.getSource()
                                    .type === "VIEW" || input.getSource().type === "TABLE_FUNCTION")) {
                                //                                            executableCommands.push(new modelbase.DeleteCommand(input));
                                for (var eleId = 0; eleId < viewNode.elements.size(); eleId++) {
                                    var element = viewNode.elements.getAt(eleId);
                                    if (element) {
                                        if ((element.aggregationBehavior && element.aggregationBehavior.toUpperCase() !== "NONE") && !element.measureType) {
                                            executableCommands.push(new modelbase.DeleteCommand(element));
                                        }
                                        if (element.aggregationBehavior && element.aggregationBehavior.toUpperCase() === "NONE") {
                                            if (!element.calculationDefinition) {
                                                executableCommands.push(new modelbase.DeleteCommand(element));
                                            }
                                        }
                                    }
                                }
                                executableCommands.push(new modelbase.DeleteCommand(input));
                                var inputDeleted = true;
                            }
                        }

                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Star Join",
                            type: "JoinNode"
                        }));

                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Star Join",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);
                        var impactMessage = "";
                        if (inputDeleted) {
                            impactMessage = impactMessage + "\n The Data source of default node and mapping elements will be deleted";
                        }
                        currentEditor.openConfirmationDialog("Switching from a projection node to an star join node. Do you want to continue?" +
                            impactMessage,
                            effectedElementInfo,
                            function() {
                                currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                            });

                    } else {
                        var startSwitchNodeCommand = new SwitchNodesCommand({
                            id: "START",
                            viewNodeName: viewNodeName,
                            editor: currentEditor
                        });
                        executableCommands.push(startSwitchNodeCommand);
                        if (viewNode.inputs.size() === 1) {
                            var input = viewNode.inputs.get(0);
                            if (input.getSource() && (input.getSource().type === "CALCULATIONVIEW" || input.getSource().type === "DATA_BASE_TABLE" || input.getSource()
                                    .type === "VIEW" || input.getSource().type === "TABLE_FUNCTION")) {
                                //                                            executableCommands.push(new modelbase.DeleteCommand(input));
                                for (var eleId = 0; eleId < viewNode.elements.size(); eleId++) {
                                    var element = viewNode.elements.getAt(eleId);
                                    if (element) {
                                        if ((element.aggregationBehavior && element.aggregationBehavior.toUpperCase() !== "NONE") && !element.measureType) {
                                            executableCommands.push(new modelbase.DeleteCommand(element));
                                        }
                                        if (element.aggregationBehavior && element.aggregationBehavior.toUpperCase() === "NONE") {
                                            if (!element.calculationDefinition) {
                                                executableCommands.push(new modelbase.DeleteCommand(element));
                                            }
                                        }
                                    }
                                }
                                executableCommands.push(new modelbase.DeleteCommand(input));
                                inputDeleted = true;
                            }
                        }
                        executableCommands.push(new commands.ChangeViewNodeCommand(viewNode.name, {
                            name: "Star Join",
                            type: "JoinNode"
                        }));
                        var endSwitchNodeCommand = new SwitchNodesCommand({
                            id: "END",
                            viewNodeName: "Star Join",
                            editor: currentEditor
                        });
                        executableCommands.push(endSwitchNodeCommand);

                        var impactMessage = "";
                        if (inputDeleted) {
                            impactMessage = impactMessage + "\n The Data source of default node and mapping elements will be deleted";
                        }
                        currentEditor.openConfirmationDialog("Switching from a aggregation node to an star join node. Do you want to continue?" +
                            impactMessage,
                            effectedElementInfo,
                            function() {
                                currentEditor._execute(new modelbase.CompoundCommand(executableCommands));
                            });
                    }
                }
            },
            showLineage: function() {
                if (this.editor.model.viewModel.lineage) {
                    for (var i = 0; i < this.editor.getAllSymbols().length; i++) {
                        if (isViewNodeSymbol(this.editor.getAllSymbols()[i])) {
                            this.editor.getAllSymbols()[i].changeBorder = false;
                            for (var j = 0; j < this.editor.model.viewModel.lineage.viewNodeList.length; j++) {
                                if (this.editor.model.viewModel.lineage.viewNodeList[j].name === this.editor.getAllSymbols()[i].viewNodeName) {
                                    this.editor.getAllSymbols()[i].changeBorder = true;
                                }

                            }

                        }
                        var containeNode = function(nodeName, list) {
                            for (var j = 0; j < list.length; j++) {
                                if (list[j].name === nodeName) {
                                    return true;
                                }
                            }
                            return false;
                        };
                        if (isInputSymbol(this.editor.getAllSymbols()[i])) {
                            this.editor.getAllSymbols()[i].changeInputBorder = false;
                            this.linkTargetNode = this.editor.getAllSymbols()[i].targetSymbol.viewNodeName;
                            this.linkSourceNode = this.editor.getAllSymbols()[i].sourceSymbol.viewNodeName;
                            if (containeNode(this.linkTargetNode, this.editor.model.viewModel.lineage.viewNodeList) && containeNode(this.linkSourceNode,
                                    this.editor.model.viewModel.lineage.viewNodeList)) {
                                this.editor.getAllSymbols()[i].changeInputBorder = true;
                            }

                        }
                        var EntityNode = function(nodeName, list,symbol) {
                            for (var j = 0; j < list.length; j++) {
                                if (list[j].input.getSource() && (list[j].input.getSource().name === nodeName)) {
                                	if(symbol.__parentSymbol.value.object.name === list[j].viewNode.name){
                                		return true;
                                	}
                                }
                            }
                            return false;
                        };
                        if (isTableSymbol(this.editor.getAllSymbols()[i])) {
                            this.editor.getAllSymbols()[i].changeTableBorder = false;
                            this.elementNode = this.editor.getAllSymbols()[i].object.name;
                            if (EntityNode(this.elementNode, this.editor.model.viewModel.lineage.datasoureViewNodeMap,this.editor.getAllSymbols()[i])) {
                                this.editor.getAllSymbols()[i].changeTableBorder = true;
                                this.editor.getAllSymbols()[i].highlightBorder = true;
                            }

                        }
                    }
                }
            },
            openConfirmationDialog: function(mainMessage, effectedColumns, callback) {
                var callBack = callback;
                var oDialog1 = new sap.ui.commons.Dialog({
                    modal: true,
                    width: "600px",
                    title: "Switch Node"
                });
                //Set the icon           
                var oImage1 = new sap.ui.commons.Image({
                    src: resourceLoader.getImagePath("info.png")
                });

                oImage1.addStyleClass("dialogImg");

                var msgs = "";
                for (var i = 0; i < effectedColumns.length; i++) {
                    var ref = effectedColumns[i];
                    msgs = msgs + "\n\t" + ref.name;
                    msgs = msgs + "\n\t\t" + ref.message;
                }

                var oText = new sap.ui.commons.TextView();
                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: false,
                    columns: 2
                });
                mLayout.createRow(oImage1, oText);

                oText.setText(mainMessage);

                var oLayout = new sap.ui.layout.VerticalLayout();
                oLayout.addContent(mLayout);

                var oInput = new sap.ui.commons.TextArea({
                    width: "550px"
                });

                oInput.setEditable(false);
                oInput.setRows(7);
                oInput.setValue(msgs);

                if (msgs.length > 1) {
                    oLayout.addContent(oInput);
                }

                var okButton = new sap.ui.commons.Button({
                    text: "OK",
                    press: function() {
                        oDialog1.close();
                        callBack('ok');
                    }
                });

                var cancelButton = new sap.ui.commons.Button({
                    text: "Cancel",
                    press: function() {
                        oDialog1.close();

                    }
                });
                oDialog1.addButton(okButton);
                oDialog1.addButton(cancelButton);

                oDialog1.addContent(oLayout);

                oDialog1.open();

            },
            showTooltip: function(shapeId, oEvent, oSymbol) {
                if (oSymbol.object.hover) {
                    return;
                }
                oSymbol.object.Fill = "#005b8d";

                if (oEvent.currentTarget && oEvent.currentTarget.href && (oEvent.currentTarget.href.animVal ==
                        "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Warning.png")) {
                    var isDeprecate = true;
                }
                if (oEvent.currentTarget && oEvent.currentTarget.href && (oEvent.currentTarget.href.animVal ==
                        "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/info.png")) {
                    var hasPruningInfo = true;
                }
                if (oEvent.currentTarget && oEvent.currentTarget.href && (oEvent.currentTarget.href.animVal ==
                        "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Filter.png")) {
                    var isFilter = true;
                }
                if (oEvent.currentTarget && oEvent.currentTarget.href && (oEvent.currentTarget.href.animVal ==
                        "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Note.png")) {
                    var isComments = true;
                }
                var div = document.createElement("div");

                var availableSpaceY = Math.abs(window.screen.availHeight - oEvent.pageY);

                if (availableSpaceY > 200) {
                    div.style.top = oEvent.pageY + 20 + "px";
                    div.style.left = oEvent.pageX + 10 + "px";

                } else {
                    div.style.top = oEvent.pageY - 150 + "px";
                    div.style.left = oEvent.pageX + 10 + "px";
                }
                div.setAttribute("class", "propertyTooltip");
                var header, keyValuePairs = [];
                //check if rowsymbol and shape is partition icon image
                if (oSymbol && shapeId && oSymbol.object) {
                    var obj = oSymbol.object;
                    switch (shapeId) {
                        case "table":
                            {
                                header = obj.name;
                                if (obj.thresholdStatusString) {
                                    keyValuePairs.push({
                                        key: "Threshold Status: ",
                                        value: obj.thresholdStatusString
                                    });
                                }
                                if (isDeprecate) {
                                    header = resourceLoader.getText("tol_deprecated");
                                }
                                if (hasPruningInfo) {
                                    keyValuePairs.push({
                                        key: "Pruning Info: ",
                                        value: oSymbol.object.pruningMessage
                                    });
                                }
                                if (obj.displayName === (resourceLoader.getImagePath("CalculationViewError.png"))) {
                                    keyValuePairs.push({
                                        key: resourceLoader.getText("msg_star_join_data_category_error"),
                                        value: ""
                                    });
                                }
                            }
                            break;
                        case "viewNode":
                            {
                                header = obj.name;
                                var viewNode = this.model.viewModel.columnView.viewNodes.get(header);
                                if (viewNode.isDataSource === true) {
                                    header = viewNode.inputs.get(0).getSource().getFullyQualifiedName();
                                }
                                if (isDeprecate) {
                                    header = "Is input is Deprecated";
                                }

                                if (isFilter) {
                                    header = oSymbol.object.filterExpressionvalue;
                                }
                                if (isComments) {
                                    header = oSymbol.object.commentsvalue;
                                }
                                if (obj.validationStatusString) {
                                    keyValuePairs.push({
                                        key: "Join Validation Status: ",
                                        value: obj.validationStatusString
                                    });
                                }
                            }
                            break;
                    }
                }
                if (header) {
                    //first section to show header
                    var c1Div = document.createElement("div");

                    var c1DSpan = document.createElement("span");
                    c1DSpan.setAttribute("class", "tHeader");
                    if (keyValuePairs.length > 0) {
                        c1DSpan.setAttribute("class", "tHeader tUnderline");
                    }
                    var c1DSpanText = document.createTextNode(header);
                    c1DSpan.appendChild(c1DSpanText);

                    c1Div.appendChild(c1DSpan);
                    div.appendChild(c1Div)

                    //attributes
                    for (var ii = 0; ii < keyValuePairs.length; ii++) {
                        var keyValuePair = keyValuePairs[ii];
                        var c1Div = document.createElement("div");
                        var c1DSpan = document.createElement("span");
                        c1DSpan.setAttribute("class", "tPropName");
                        var c1DSpanText = document.createTextNode(keyValuePair.key);
                        c1DSpan.appendChild(c1DSpanText);
                        var c2DSpan = document.createElement("span");
                        c2DSpan.setAttribute("class", "text");
                        var c2DSpanText = document.createTextNode(keyValuePair.value);
                        c2DSpan.appendChild(c2DSpanText);

                        c1Div.appendChild(c1DSpan);
                        c1Div.appendChild(c2DSpan);
                        div.appendChild(c1Div);
                    }

                    var body = document.getElementsByTagName("body")[0];
                    oSymbol.object.hover = true;
                    setTimeout(function() {
                        if (oSymbol && oSymbol.object && oSymbol.object.hover) {
                            var hover = document.getElementsByClassName("propertyTooltip");
                            if (typeof hover != 'undefined') {
                                for (var ii = 0; hover.length; ++ii) {
                                    hover[ii].parentElement.removeChild(hover[ii]);
                                }
                            }
                            body.appendChild(div);
                        }
                    }, 150);
                }
            },

            hideTooltip: function(oEvent, oSymbol) {
                if (oSymbol.object.hover)
                    oSymbol.object.hover = false;
                if (oSymbol.object.Fill)
                    oSymbol.object.Fill = "Transparent";
                var hover = document.getElementsByClassName("propertyTooltip");
                if (typeof hover !== 'undefined') {
                    for (var ii = 0; hover.length; ++ii) {
                        hover[ii].parentElement.removeChild(hover[ii]);
                    }
                }
            },

            toggleExpanded: function(viewNodeSymbol) {
                var viewNode = this.editor.model.viewModel.columnView.viewNodes.get(viewNodeSymbol.viewNodeName);
                // TODO : Use Command to perform expand / collapse operation
                if (viewNode.layout && viewNodeSymbol.object) {
                    if (viewNodeSymbol.object.isExpanded) { // collapse ViewNode
                        viewNode.layout.expanded = false;
                    } else { // Expand ViewNode
                        viewNode.layout.expanded = true;
                    }
                    viewNodeSymbol.object.isExpanded = viewNode.layout.expanded;

                    this.editor._extension.repaintViewNode(viewNodeSymbol);
                    this.editor.drawAllSymbols();
                }

            },

            openMessageDialog: function(viewNode, refs) {

                var oDialog = new sap.ui.commons.Dialog({
                    modal: true,
                    title: resourceLoader.getText("tit_alias_proposal"),
                    width: "600px"
                });

                //Set the icon           
                var oImage = new sap.ui.commons.Image({
                    src: resourceLoader.getImagePath("info.png")
                });

                oImage.addStyleClass("dialogImg");

                //set the Content
                var referenceInfo = "";
                var currentInputKey;
                for (var i = 0; i < refs.length; i++) {
                    var ref = refs[i];
                    if (currentInputKey !== ref.inputId) {
                        currentInputKey = ref.inputId;
                        if (referenceInfo) {
                            referenceInfo += "\n" + CalcViewEditorUtil.getInputName(viewNode.inputs.get(ref.inputId));
                        } else {
                            referenceInfo = CalcViewEditorUtil.getInputName(viewNode.inputs.get(ref.inputId));
                        }
                    }
                    referenceInfo += "\n\t" + ref.elementName + " -> " + ref.newAttributes.aliasName;
                }

                //Set the context
                var oText = new sap.ui.commons.TextView({
                    text: resourceLoader.getText("msg_alias_proposal")
                });

                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: false,
                    columns: 2
                });

                mLayout.createRow(oImage, oText);

                var oLayout = new sap.ui.layout.VerticalLayout();
                oLayout.addContent(mLayout);

                var oInput = new sap.ui.commons.TextArea({
                    width: "550px"
                });

                oInput.setEditable(false);
                oInput.setRows(10);

                //Add buttons
                var okButton = new sap.ui.commons.Button({
                    text: resourceLoader.getText("txt_ok"),
                    press: function() {
                        oDialog.close();
                    }
                });
                oDialog.addButton(okButton);

                //if (referenceInfo) {
                oInput.setValue(referenceInfo);
                oLayout.addContent(oInput);
                //}

                oDialog.addContent(oLayout);

                oDialog.open();

            }

        }
    });
    var SwitchNodesCommand = function(attributes) {
        this.id = attributes.id;
        this.viewNodeName = attributes.viewNodeName;
        this.editor = attributes.editor;
    };
    SwitchNodesCommand.prototype = {
        execute: function(model, events) {

            if (this.id === "START") {
                this.editor.oldDefaultNodeSymbol = this.editor._editor._diagram.symbols.selectObject({
                    "viewNodeName": this.viewNodeName
                });
            } else {

                //  currentEditor._reloadContent();
                var events = model.columnView.$getEvents();
                var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
                this.newViewNodeSymbol = this.editor._editor.extensionParam.builder.buildViewNode(viewNode);
                this.editor.editor.registerSymbolEvents(this.newViewNodeSymbol);
                this.editor._registerViewNodeEvents(this.newViewNodeSymbol);
                var linkSymbols = this.editor.oldDefaultNodeSymbol.getLinkSymbols();
                for (var link = 0; link < linkSymbols.length; link++) {
                    var linkSymbol = linkSymbols[link];
                    //  viewNodeSymbol.getLinkSymbols().push(linkSymbol);
                    if (linkSymbol.sourceSymbol === this.editor.oldDefaultNodeSymbol) {
                        linkSymbol.sourceSymbol = this.newViewNodeSymbol;
                    }
                    if (linkSymbol.targetSymbol === this.editor.oldDefaultNodeSymbol) {
                        linkSymbol.targetSymbol = this.newViewNodeSymbol;
                    }
                }
                this.newViewNodeSymbol.x = this.newViewNodeSymbol.x - 18;
                this.editor._isExecutingCommand = true;
                this.editor.oldDefaultNodeSymbol.deleteSymbol();
                this.editor._isExecutingCommand = false;
                this.editor._editor.drawAllSymbols();
                this.editor.oldDefaultNodeSymbol = undefined;
                events.publish(ViewModelEvents.INPUT_LOADED, viewNode.name);
                //  events.publish(ViewModelEvents.SWITCH_VIEWNODE_RELOAD, viewNode.name);
                setTimeout(function() {
                    events.publish(ViewModelEvents.SWITCH_VIEWNODE_RELOAD, viewNode.name);
                }, 100);

            }
        },
        undo: function(model, events) {

            if (this.id === "END") {
                var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
                for (var symbolId = 0; symbolId < this.editor._editor._diagram.symbols.length; symbolId++) {
                    var symbol = this.editor._editor._diagram.symbols.toArray()[symbolId];
                    if (symbol.viewNodeName === this.viewNodeName) {
                        this.editor.oldDefaultNodeSymbol = symbol;
                    }
                }

            } else {
                if (this.editor.oldDefaultNodeSymbol) {
                    //  currentEditor._reloadContent();
                    var events = model.columnView.$getEvents();
                    var viewNode = model.columnView.viewNodes.get(this.viewNodeName);
                    this.newViewNodeSymbol = this.editor._editor.extensionParam.builder.buildViewNode(viewNode);
                    this.editor.editor.registerSymbolEvents(this.newViewNodeSymbol);
                    this.editor._registerViewNodeEvents(this.newViewNodeSymbol);
                    var linkSymbols = this.editor.oldDefaultNodeSymbol.getLinkSymbols();
                    for (var link = 0; link < linkSymbols.length; link++) {
                        var linkSymbol = linkSymbols[link];
                        //  viewNodeSymbol.getLinkSymbols().push(linkSymbol);
                        if (linkSymbol.sourceSymbol === this.editor.oldDefaultNodeSymbol) {
                            linkSymbol.sourceSymbol = this.newViewNodeSymbol;
                        }
                        if (linkSymbol.targetSymbol === this.editor.oldDefaultNodeSymbol) {
                            linkSymbol.targetSymbol = this.newViewNodeSymbol;
                        }
                    }
                    this.newViewNodeSymbol.x = this.newViewNodeSymbol.x - 18;
                    this.editor._isExecutingCommand = true;
                    this.editor.oldDefaultNodeSymbol.deleteSymbol();
                    this.editor._isExecutingCommand = false;
                    this.editor._editor.drawAllSymbols();
                    this.editor.oldDefaultNodeSymbol = undefined;
                    events.publish(ViewModelEvents.INPUT_LOADED, viewNode.name);
                    setTimeout(function() {
                        events.publish(ViewModelEvents.SWITCH_VIEWNODE_RELOAD, viewNode.name);
                    }, 100);

                }

            }

        }
    };

    return Editor;
});