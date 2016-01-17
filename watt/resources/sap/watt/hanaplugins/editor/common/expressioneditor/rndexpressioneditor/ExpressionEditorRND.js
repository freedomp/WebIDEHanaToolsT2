/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./Editor"], function(Editor) {
    var RNDExpressionEditor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.ExpressionEditorRND", {

        _editorTextArea: null,

        _operandDatatypeMap: null,
        _valueHelpArray: null,
        _elementArray: null,
        _functionArray: null,
        _opertaorArray: null,
        _mode: null,
        _modePath: null,
        _expression: null,
        _changeEventTroughSetValue: false,
        _outerLayout: null, 
        _toolbarRow: null,
        _customHeight: null,
        _resizeHandler: null,
        _functionTree: null, 
        _elementTree: null,
        _treeNodes: null,
        _functionData: null,
        _elementData: null,

        metadata: {
            aggregations: {
                layout: {
                    singularName: "layout",
                    type: "sap.ui.commons.layout.AbsoluteLayout",
                    multiple: false,
                    visibility: "public"
                }
            },
            properties: {
                elementModel: {
                    type: "any"
                },
                functionModel: {
                    type: "any"
                },
                operatorModel: {
                    type: "any"
                },
                valuehelpModel: {
                    type: "any" 
                },
                sqlFunctionModel: {
                    type: "any"
                },
                sqlValuehelpModel: {
                    type: "any"
                },
                hideValidateButton: {
                    type: "boolean",
                    default: "false"
                },
                languageSelectionEnabled: {
                    type: "boolean",
                    default: "false"
                },
                validateExpression: {
                    type: "any"
                },
                language: {
                    type: "any"
                },
                readOnly: {
                    type: "boolean",
                    default: false
                },
                searchMode: {
                    type: "any"
                },
                expandTrees: {
                    type: "boolean"
                }
            },
            events: {
                change: {},
                languageChange:{}
            }
        },

        init: function() {
           // jQuery.sap.require("sap.hana.ide.common.plugin.expressioneditor.rndexpressioneditor.rndfiles.parser.mode-expr");
            var that = this;

            var oTextAreaEditor = new Editor({
                model: this.model,
                height: '100%',
                width: '100%'
            });
            that._editorTextArea = oTextAreaEditor;
        },

        renderer: {
            render: function(oRm, oControl) {
                oRm.renderControl(oControl.getAggregation("layout"));
            }
        },

        onBeforeRendering: function() {
            var that = this;

            jQuery.sap.require("jquery.sap.resources");
            var i18nModel = new sap.ui.model.resource.ResourceModel({
                bundleUrl: "/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/i18n/messageBundle.hdbtextbundle"
            });
            this.setModel(i18nModel, "i18n");

            if (this.getValuehelpModel() !== undefined) {
                this._valueHelpModel = this.getValuehelpModel();
            }

            this._createValuehelpArray();
            this._createElementArray();
            this._createOperatorArray();

            this._createOuterLayout();
            this._insertCSSIntoHTML();

            this._editorTextArea.setValueHelpArray(this._valueHelpArray);
            this._editorTextArea.setElements(this._elementArray);
            this._editorTextArea.setFunctions(this._valueHelpArray);
            this._editorTextArea.setOperators(this._operatorArray);

            this._editorTextArea.setLanguage(this.getLanguage());

            this._resizeHandler = new sap.ui.core.ResizeHandler();
            this._resizeHandler.attachListener(this._editorTextArea, function() {
                that._editorTextArea.getAceEditor().resize();
            });
            
            if (this._expression !== null) {
                this._editorTextArea.getAceEditor().setValue(this._expression, 1);
                this._changeEventTroughSetValue = true;
            }else{
                this._editorTextArea.getAceEditor().setValue("", 1);
                this._changeEventTroughSetValue = true;
            }
        },

        _createOuterLayout: function() {
            var toolbar = this._createToolbar();
            var mainComposite = this._createComposite();

            var outerLayout = new sap.ui.commons.layout.AbsoluteLayout({
                height: "100%",
                width: "100%"
            });
            var innerLayout = new sap.ui.commons.layout.MatrixLayout({
                columns: 1,
                height: '100%',
                width: "100%",
                layoutFixed: false
            });

            if (this._customHeight !== null) {
                outerLayout.setHeight(this._customHeight);
            }

            var rowForToolbar = new sap.ui.commons.layout.MatrixLayoutRow({
                height: "30px",
                width: "100%"
            });

            if (this._customHeight !== null) {
                rowForToolbar.setHeight("30px");
            }

            var cellForToolbar = new sap.ui.commons.layout.MatrixLayoutCell({
                height: "100%",
                width: "100%"
            });

            var rowForSplitter = new sap.ui.commons.layout.MatrixLayoutRow({
                height: "100%",
                width: "100%"
            });

            var cellForSplitter = new sap.ui.commons.layout.MatrixLayoutCell({
                height: "100%",
                width: "100%"
            });

            cellForToolbar.addContent(toolbar);
            cellForSplitter.addContent(mainComposite);

            rowForToolbar.addCell(cellForToolbar);
            rowForSplitter.addCell(cellForSplitter);
            rowForSplitter.addStyleClass("exprEditorSplitterRow");

            innerLayout.addRow(rowForToolbar);
            innerLayout.addRow(rowForSplitter);

            innerLayout.addStyleClass('exprEditorInnerLayout');

            outerLayout.addStyleClass('exprEditorOuterLayout');
            outerLayout.addContent(innerLayout);

            this.setAggregation("layout", outerLayout);
            this._outerLayout = outerLayout;
        },

        _createComposite: function() {
            jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
            jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.mode-sql");
            jQuery.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');
            jQuery.sap.require('sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.Editor');

            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                width: "100%",
                columns: 1
            });

            var splitComposite = new sap.ui.commons.Splitter();

            splitComposite.setSplitterOrientation(sap.ui.commons.Orientation.horizontal);
            splitComposite.setSplitterPosition("50%");
            splitComposite.setWidth("100%");
            splitComposite.setHeight("100%");

            splitComposite.addStyleClass('exprEditorSplitter');

            var oMatrixLayoutForInputSupport = this._createInputSupportArea();

            splitComposite.insertFirstPaneContent(this._editorTextArea);
            splitComposite.insertSecondPaneContent(oMatrixLayoutForInputSupport);
            return splitComposite;
        },

        _createToolbar: function() {

            var that = this;
            var toolbarLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 0
            });

            var rowForHeader = new sap.ui.commons.layout.MatrixLayoutRow({
                height: "100%",
                width: "100%"
            });

            toolbarLayout.addRow(rowForHeader);

            if (this.getLanguageSelectionEnabled() === true) {
                toolbarLayout.setColumns(toolbarLayout.getColumns() + 1);

                var oCombobox = new sap.ui.commons.ComboBox({
                    items: [
                        new sap.ui.core.ListItem({
                            text: that.getModel("i18n").getProperty("txt_Column_Engine"),
                            key: "TREX"
                        }),
                        new sap.ui.core.ListItem({
                            text: that.getModel("i18n").getProperty("txt_Sql"),
                            key: "SQL"
                        })
                    ],
                    change: function(oEvent) {
                        var language = oEvent.oSource.getSelectedKey();
                        that.setLanguage(language);
                        if (that._functionTree !== null) {
                            if (language === "SQL") {
                                that._functionTree.setModel(that.getSqlFunctionModel());
                            } else {
                                that._functionTree.setModel(that.getFunctionModel());
                            }
                            that._functionTree.rerender();
                            that._functionData = that._functionTree.getModel().oData.functions.data;
                        }
                        if(that._elementTree){
                            that._elementTree.setModel(that.getElementModel());
                            that._elementTree.rerender();
                        }
                        that._createValuehelpArray();
                        that._editorTextArea.setLanguage(oEvent.oSource.getSelectedKey());
                        that._editorTextArea.setValueHelpArray(that._valueHelpArray);
                        that._editorTextArea.setFunctions(that._valueHelpArray);
                     //   that._editorTextArea.setValue("");
                        that.fireLanguageChange();
                        that._editorTextArea.rerender();
                        that.addingDbclicklistenerOnFuncElementPanel(that._functionTree, that);
                        
                    },
                    selectedKey: that.getLanguage()
                });

                var cellForComboBox = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: "100%",
                    width: "100%"
                });

                cellForComboBox.addContent(oCombobox);
                cellForComboBox.setHAlign(sap.ui.commons.layout.HAlign.Left);
                rowForHeader.addCell(cellForComboBox);
            }


            if (this.getHideValidateButton() !== true) {
                toolbarLayout.setColumns(toolbarLayout.getColumns() + 1);
                var oValidationButton = new sap.ui.commons.Button({
                    text: this.getModel("i18n").getProperty("txt_Validate"),
                    icon: 'sap-icon://accept',
                    press: function() {
                        if (that.getValidateExpression() !== undefined) {
                            that.getValidateExpression()();
                        }
                    }
                });

                oValidationButton.addStyleClass('expressionEditorButton');

                var cellForButton = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: "100%",
                    width: "150px"
                });

                cellForButton.addContent(oValidationButton);
                cellForButton.setHAlign(sap.ui.commons.layout.HAlign.Right);
                rowForHeader.addCell(cellForButton);
                rowForHeader.addStyleClass("expressionEditorToolbarRow");
            }

            toolbarLayout.addStyleClass("expressionEditorToolbar");
            return toolbarLayout;
        },

        _createInputSupportArea: function() {

            jQuery.sap.require("sap.watt.hanaplugins.editor.common.expressioneditor.tree.TreeNodeTemplate");
            jQuery.sap.require("sap.watt.hanaplugins.editor.common.expressioneditor.tree.DraggableTree");
            jQuery.sap.require("sap.watt.hanaplugins.editor.common.expressioneditor.tree.FilterField");

            var that = this;

            var oLayout = new sap.ui.commons.layout.MatrixLayout({
                columns: 0,
                height: '100%',
                width: "100%"
            });

            var oRowForInput = new sap.ui.commons.layout.MatrixLayoutRow({
                height: '100%',
                width: "100%"
            });

            var treeNodeTemplate = new sap.watt.hanaplugins.editor.common.expressioneditor.TreeNodeTemplate();

            if (this.getElementModel() !== undefined) {
                oLayout.setColumns(oLayout.getColumns() + 1);

                var oElementPanel = new sap.ui.commons.Panel({
                    height: "100%",
                    title: new sap.ui.core.Title({
                        text: this.getModel("i18n").getProperty("tit_Elements")
                    }),
                    showCollapseIcon: false,
                    applyContentPadding: false

                });

                var oFixFlex = new sap.ui.layout.FixFlex({});

                var oElementTree = new sap.watt.hanaplugins.editor.common.expressioneditor.DraggableTree({
                    title: "{/elements/label}",
                    height: "100%",
                    width: "100%",
                    showHeader: false,
                    nodes: {
                        path: "/elements/data",
                        template: treeNodeTemplate
                    }
                });

                this._elementTree = oElementTree;

                var oFilterField = new sap.ui.commons.TextField({
                    width: "100px"
                }).attachEvent("liveChange", function(oEvent) {
                    var filterText = oEvent.getParameter("liveValue");
                    var treeNodes = oElementTree.getNodes();
                    if (that.getSearchMode() === "search") {
                        for (var i = 0; i < treeNodes.length; i++) {
                            that._highlight(treeNodes[i], filterText);
                        }
                    } else {
                        var data = jQuery.extend(true, [], that._elementData);
                        data = data.filter(function(element) {
                            return that._filter(element, filterText);
                        });

                        that._elementTree.getModel().getData().elements.data = data;
                        that._elementTree.getModel().updateBindings(true);
                    }

                    that.addingDbclicklistenerOnFuncElementPanel(oElementTree, that);
                }).attachEvent("change", function(oEvent) {
                    that.addingDbclicklistenerOnFuncElementPanel(oElementTree, that);
                });
                
                if(this.getSearchMode() === "search"){
                    oFilterField.addStyleClass("searchField");    
                }else{
                    oFilterField.addStyleClass("filterField"); 
                }

                var oExpandButton = new sap.ui.commons.Button({
                    icon: '/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/images/ExpandAll.png',
                    lite: true,
                    press: function() {
                        oElementTree.expandAll();
                    }
                }).addStyleClass("expandCollapseButton");

                var oCollapseButton = new sap.ui.commons.Button({
                    icon: '/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/images/CollapseAll.png',
                    lite: true,
                    press: function() {
                        oElementTree.collapseAll();
                    }
                }).addStyleClass("expandCollapseButton");

                var oTreeToolbarLayout = new sap.ui.commons.layout.HorizontalLayout({
                    content: [oFilterField, oExpandButton, oCollapseButton]
                }).addStyleClass("exprEditorTreeToolbar");

                oFixFlex.setFixContentSize("auto");
                oFixFlex.addFixContent(oTreeToolbarLayout);
                oFixFlex.setFlexContent(oElementTree);

                oElementPanel.addContent(oFixFlex);
                oElementPanel.addStyleClass("treePanel");

                var oCellForElements = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: '100%',
                    width: "auto"
                });

                oCellForElements.addContent(oElementPanel);
                oRowForInput.addCell(oCellForElements);

                oElementTree.setModel(this.getElementModel());
                if (this.getExpandTrees() === true) {
                    oElementTree.expandAll();
                }
                this._elementData = oElementTree.getModel().getData().elements.data;
            }

            if (this.getFunctionModel() !== undefined) {
                oLayout.setColumns(oLayout.getColumns() + 1);

                var oFunctionPanel = new sap.ui.commons.Panel({
                    height: "100%",
                    title: new sap.ui.core.Title({
                        text: this.getModel("i18n").getProperty("tit_Functions")
                    }),
                    showCollapseIcon: false,
                    applyContentPadding: false
                });

                var oFixFlex = new sap.ui.layout.FixFlex({});

                var oFunctionTree = new sap.watt.hanaplugins.editor.common.expressioneditor.DraggableTree({
                    title: "{/functions/label}",
                    height: "100%",
                    width: "100%",
                    showHeader: false,
                    nodes: {
                        path: "/functions/data",
                        template: treeNodeTemplate
                    }
                });

                var oFunctionFilterField = new sap.ui.commons.TextField({
                    width: "100px"
                }).attachEvent("liveChange", function(oEvent) {
                    var filterText = oEvent.getParameter("liveValue");
                    var treeNodes = oFunctionTree.getNodes();
                    if (that.getSearchMode() === "search") {
                        for (var i = 0; i < treeNodes.length; i++) {
                            that._highlight(treeNodes[i], filterText);
                        }
                    } else {
                        var data = jQuery.extend(true, [], that._functionData);
                        data = data.filter(function(element) {
                            return that._filter(element, filterText);
                        });

                        that._functionTree.getModel().getData().functions.data = data;
                        that._functionTree.getModel().updateBindings(true);
                    }
                    that.addingDbclicklistenerOnFuncElementPanel(oFunctionTree, that);
                }).attachEvent("change", function(oEvent) {
                    that.addingDbclicklistenerOnFuncElementPanel(oFunctionTree, that);
                });
                
                if(this.getSearchMode() === "search"){
                    oFunctionFilterField.addStyleClass("searchField");    
                }else{
                    oFunctionFilterField.addStyleClass("filterField"); 
                }

                var oExpandButton = new sap.ui.commons.Button({
                    icon: '/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/images/ExpandAll.png', 
                    lite: true,
                    press: function() {
                        oFunctionTree.expandAll();
                    }
                }).addStyleClass("expandCollapseButton");

                var oCollapseButton = new sap.ui.commons.Button({
                    icon: '/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/images/CollapseAll.png',
                    lite: true,
                    press: function() {
                        oFunctionTree.collapseAll();
                    }
                }).addStyleClass("expandCollapseButton");

                var oTreeToolbarLayout = new sap.ui.commons.layout.HorizontalLayout({
                    content: [oFunctionFilterField, oExpandButton, oCollapseButton]
                }).addStyleClass("exprEditorTreeToolbar");

                oFixFlex.setFixContentSize("auto");
                oFixFlex.addFixContent(oTreeToolbarLayout);
                oFixFlex.setFlexContent(oFunctionTree);

                if (this.getLanguage() === "SQL") {
                    oFunctionTree.setModel(this.getSqlFunctionModel());
                } else {
                    oFunctionTree.setModel(this.getFunctionModel());
                }

                this._functionTree = oFunctionTree;
                this._functionData = oFunctionTree.getModel().getData().functions.data;
                oFunctionTree.getModel().updateBindings(true);
                oFunctionPanel.addContent(oFixFlex);
                oFunctionPanel.addStyleClass("treePanel");

                var oCellForFunctions = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: '100%'
                });
                oCellForFunctions.addContent(oFunctionPanel);
                oRowForInput.addCell(oCellForFunctions);
            }

            if (this.getOperatorModel() !== undefined) {
                oLayout.setColumns(oLayout.getColumns() + 1);

                var operatorPanel = new sap.ui.commons.Panel({
                    title: new sap.ui.core.Title({
                        text: this.getModel("i18n").getProperty("tit_Operators")
                    }),
                    showCollapseIcon: false,
                    height: "100%"
                });

                operatorPanel.addStyleClass("treePanel");

                var oMatrix = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: false,
                    columns: 3,
                    width: "100%"
                });

                for (var i = 0; i < this._operatorArray.length; i++) {
                    var buttons = [];
                    for (var j = 0; j < 3; j++) {
                        var button = new sap.ui.commons.Button({
                            text: that._operatorArray[i],
                            width: "100%",
                            press: function() {
                                var operatorText = this.getText();
                                that._editorTextArea.getAceEditor().insert(operatorText);
                                that._editorTextArea.getAceEditor().focus();
                            }
                        });

                        buttons[j] = button;
                        i++;
                    }
                    if (buttons.length === 3) {
                        oMatrix.createRow(buttons[0], buttons[1], buttons[2]);
                    } else if (buttons.length === 2) {
                        oMatrix.createRow(buttons[0], buttons[1]);
                    } else if (buttons.length === 1) {
                        oMatrix.createRow(buttons[0]);
                    }
                    i--;

                    buttons = [];
                }

                operatorPanel.addContent(oMatrix);

                var oCellForOperators = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: '100%',
                    width: "auto"
                });

                oCellForOperators.addContent(operatorPanel);
                oRowForInput.addCell(oCellForOperators);
            }

            oLayout.addRow(oRowForInput);

            oRowForInput.addStyleClass("expressionEditorLayoutRow");
            return oLayout;
        },
        addingDbclicklistenerOnFuncElementPanel: function(Tree, that){
               Tree.expandAll();
                    var selector = ".sapUiTreeNode";               
            $(selector).dblclick(function() {
               that.functionOnDbClick(this);
            });
        },
        functionOnDbClick: function(Treenode){
                if (!this.getReadOnly()) {
                    var nodetext = this._editorTextArea.getTextFromTreeNode(Treenode);
                    this._changeEventTroughSetValue = false;
                    this._editorTextArea.getAceEditor().insert(nodetext);
                    this ._editorTextArea.getAceEditor().focus();
                } 
        },

        onAfterRendering: function() {

            var that = this;
            var selector = ".sapUiTreeNode";
            
            if (this.getExpandTrees() === true) {
                if(this._functionTree !== null){
                    this._functionTree.expandAll();
                }
                if(this._elementTree !== null){
                    this._elementTree.expandAll();
                }
            }
            
            $(selector).dblclick(function() {
                if (!that.getReadOnly()) {
                    var nodetext = that._editorTextArea.getTextFromTreeNode(this);
                    that._changeEventTroughSetValue = false;
                    that._editorTextArea.getAceEditor().insert(nodetext);
                    that._editorTextArea.getAceEditor().focus();
                }
            });

            $(selector).addClass("noBullet");

            var parentSelectorC = ".sapUiTreeNodeCollapsed";
            $(parentSelectorC).removeClass("noBullet");

            var parentSelectorE = ".sapUiTreeNodeExpanded";
            $(parentSelectorE).removeClass("noBullet");

            $(parentSelectorC).addClass("bold");
            $(parentSelectorE).addClass("bold");

            this._editorTextArea.getAceEditor().on("change", function(oEvent) {
                if (that._changeEventTroughSetValue) {
                    that._changeEventTroughSetValue = false; 
                } else {
                    that.fireChange();
                    that._expression = that.getExpression();
                }
            });

            if (this._expression !== null) {
                this._editorTextArea.getAceEditor().setValue(this._expression, 1);
                this._changeEventTroughSetValue = true;
            }else{
                this._editorTextArea.getAceEditor().setValue("", 1);
                this._changeEventTroughSetValue = true;
            }
        },

        _highlight: function(treeNode, filterText) {
            if (treeNode.hasChildren()) {
                var children = treeNode.getNodes();
                for (var i = 0; i < children.length; i++) {
                    this._highlight(children[i], filterText);
                }
            } else {
                if (filterText !== "" && treeNode.getText().indexOf(filterText) >= 0) {
                    treeNode.addStyleClass("searchresult");
                } else {
                    treeNode.removeStyleClass("searchresult");
                }
            }
        },

        _filter: function(data, filterText) {
            var that = this;
            if (data.children !== undefined && data.children.length > 0) {
                var children = data.children;
                data.children = children.filter(function(element) {
                    return that._filter(element, filterText);
                });
                return true;
            } else {
                filterText = filterText.toUpperCase();
                var labelText = data.label.toUpperCase();
                if (filterText === "" || labelText.indexOf(filterText) >= 0) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        _createValuehelpArray: function() {
            this._valueHelpArray = [];
            if (this.getLanguage() === "TREX") {
                if (this.getValuehelpModel() !== undefined) {
                    var valueHelpArray = this.getValuehelpModel().oData;
                    for (var k = 0; k < valueHelpArray.length; k++) {
                        this._valueHelpArray.push(valueHelpArray[k].Help);
                    }
                }
            } else if (this.getLanguage() === "SQL") {
                if (this.getSqlValuehelpModel() !== undefined) {
                    var valueHelpArray = this.getSqlValuehelpModel().oData;
                    for (var k = 0; k < valueHelpArray.length; k++) {
                        this._valueHelpArray.push(valueHelpArray[k].Help);
                    }
                }
            }


            if (this.getElementModel() !== undefined) {
                var elementArray = this.getElementModel().oData.elements.data;
                for (var i = 0; i < elementArray.length; i++) {
                    if (elementArray[i].children !== null) {
                        var childArray = elementArray[i].children;
                        for (var j = 0; j < childArray.length; j++) {
                            if (childArray[j].separator !== undefined) {
                                this._valueHelpArray.push(childArray[j].separator + childArray[j].label + childArray[j].separator);
                            } else {
                                if (childArray[j].separatorStart !== undefined && childArray[j].separatorEnd !== undefined) {
                                    this._valueHelpArray.push(childArray[j].separatorStart + childArray[j].label + childArray[j].separatorEnd);
                                }
                            }

                            if (childArray[j].elementType === "Column") {
                                this._valueHelpArray.push("\"" + childArray[j].label + "\"");
                            } else if (childArray[j].elementType === "Parameter" && this._isNumDatatype(childArray[j].datatype) || childArray[j].elementType === "MultiValueParameter") {
                                this._valueHelpArray.push("$$" + childArray[j].label + "$$");
                            } else if (childArray[j].elementType === "Parameter") {
                                this._valueHelpArray.push("\'$$" + childArray[j].label + "$$\'");
                            } else {
                                this._valueHelpArray.push("\"" + childArray[j].label + "\"");
                            }
                        }
                    }
                }
            }
        },

        _createElementArray: function() {
            this._elementArray = [];

            if (this.getElementModel() !== undefined) {
                var elementArray = this.getElementModel().oData.elements.data;
                for (var i = 0; i < elementArray.length; i++) {
                    if (elementArray[i].children !== null) {
                        var childArray = elementArray[i].children;
                        for (var j = 0; j < childArray.length; j++) {
                            if (childArray[j].elementType === "Column") {
                                this._elementArray.push("\"" + childArray[j].label + "\"");
                            } else if (childArray[j].elementType === "Parameter" && this._isNumDatatype(childArray[j].datatype) || childArray[j].elementType === "MultiValueParameter") {
                                this._elementArray.push("$$" + childArray[j].label + "$$");
                            } else if (childArray[j].elementType === "Parameter") {
                                this._elementArray.push("\'$$" + childArray[j].label + "$$\'");
                            } else {
                                this._elementArray.push("\"" + childArray[j].label + "\"");
                            }
                        }
                    }
                }
            }
        },

        _isNumDatatype: function(datatypeName) {
            if (datatypeName === "INTEGER" || datatypeName === "TINYINT" || datatypeName === "SMALLINT" || datatypeName === "BIGINT" || datatypeName === "DECIMAL" || datatypeName === "REAL" || datatypeName === "DOUBLE" || datatypeName === "FLOAT" || datatypeName === "SMALLDECIMAL") {
                return true;
            } else {
                return false;
            }
        },

        _createOperatorArray: function() {
            this._operatorArray = [];

            if (this.getOperatorModel() !== undefined) {
                var operatorArray = this.getOperatorModel().oData.operators.data;
                for (var i = 0; i < operatorArray.length; i++) {
                    this._operatorArray.push(operatorArray[i].label); 
                }
            }
        },

        _insertCSSIntoHTML: function() {
            var cssNode = document.createElement('link');
            cssNode.setAttribute('type', 'text/css');
            cssNode.setAttribute('rel', 'stylesheet');
            cssNode.setAttribute('href', '/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/css/styles.css');
            document.getElementsByTagName('head')[0].appendChild(cssNode);

            var scriptNode = document.createElement('scipt');
            cssNode.setAttribute('src', 'ace/ext-language_tools.js');
            document.getElementsByTagName('head')[0].appendChild(scriptNode);
        },

        setUndoManager: function(undoManager) {
            this._editorTextArea.setUndoManager(undoManager);
        },

        getExpression: function() {
            return this._editorTextArea.getAceEditor().getValue();
        },

        setExpression: function(expression) {
            if (this._editorTextArea !== null) {
                this._changeEventTroughSetValue = true;
                this._editorTextArea.getAceEditor().setValue(expression, 1);
                this._expression = expression;
            } else {
                //this._changeEventTroughSetValue = true;
                this._expression = expression;
            }
        },

        setHeight: function(heightAsString) {
            this._customHeight = heightAsString;
        },

        setReadOnly: function(readOnly) {
            this.setProperty("readOnly", readOnly);
            this._editorTextArea.setReadOnly(readOnly);
        },
        
        expandTrees: function(){
            this._elementTree.expandAll();
            this._functionTree.expandAll();
        }
    });

    return RNDExpressionEditor;
});
