/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../../util/ResourceLoader", "../../viewmodel/commands", "../../base/modelbase", "../../viewmodel/model", "../CalcViewEditorUtil",
        "../IconComboBox", "../CustomPanel","../CustomTable"
    ],
    function(ResourceLoader, commands, modelbase, model, CalcViewEditorUtil, IconComboBox,CustomTable) {
        "use strict";
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var HierarchiesDetails = function(attributes) {
            this.undoManager = attributes.undoManager;
            this.element;
            this.viewNode = attributes.viewNode;
            this.columnView = attributes.columnView;
            this.updateMasterTable = attributes.updateMasterTable;
            this.type = attributes.type;
            this.isSharedElement = attributes.isSharedElement;
            this.topVerticalLayout; 
            this.nameField;
            this.radioButtonGroup; 
            this.hierarChyModel = new sap.ui.model.json.JSONModel();
            var y ;
        };
        HierarchiesDetails.prototype = {

            _execute: function(commands) {
                var that = this;
                if (that.undoManager) {
                    if (commands instanceof Array) {
                        return that.undoManager.execute(new modelbase.CompoundCommand(commands));
                    } else {
                        return that.undoManager.execute(commands);
                    }
                }
            },
            close: function() {
                this.unsubscribe(); // LS
                /*     if (this.viewNode.$getEvents()._registry) {
                    //this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                }
                if (this.elementModel) {
                    this.elementModel.destroy();
                } */
            },
            subscribe: function() {
                //this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);// LS
                this.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);
                this.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.otherModelChanged, this);
                this.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.otherModelChanged, this);
                this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.otherModelChanged, this);
                this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.otherModelChanged, this);
            },
            unsubscribe: function() {
                //this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);// LS
                if (this.columnView && this.columnView.$getEvents()) {
                    this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);
                    this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.otherModelChanged, this);
                    this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.otherModelChanged, this);
                    this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.otherModelChanged, this);
                    this.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.otherModelChanged, this);
                }
            },
            getContent: function() {
                return this.topVerticalLayout;
            },

            updateDetails: function(element) {

                if (!this.topVerticalLayout || !this.topVerticalLayout.getContent()) {
                    this.getDetailsContent();
                    this.unsubscribe();
                    this.subscribe();
                }
                if (this.radioButtonGroup) {
                    if (this.type !== "level") {
                        if (element && element.timeProperties && element.timeProperties.pointInTimeParameter) {
                            this.radioButtonGroup.setSelectedIndex(1);
                            this.radioButtonGroup.fireSelect();
                        } else {
                            this.radioButtonGroup.setSelectedIndex(0);
                            this.radioButtonGroup.fireSelect();

                        }
                    }
                }
                if (this.headerLabel) {
                    this.headerLabel.setText(resourceLoader.getText("tit_definition", [element ? element.name : ""]));
                }
                CalcViewEditorUtil.clearErrorMessageTooltip(this.nameField);
                if (element) {
                    this.element = element;
                    var data = this.getData(element);
                    this.hierarChyModel.setData(data);
                    this.hierarChyModel.updateBindings(true);
                }


            },

            modelChanged: function(object, event) {
                // if (this.element.name === object.name) {
                this.updateDetails(this.element); // LS
                // }
            },
            otherModelChanged: function(object) {
                this.updateDetails(this.element); // LS
            },
            destroyContent: function() {
                if (this.topVerticalLayout) {
                    this.topVerticalLayout.destroyContent();
                }
            },
            getData: function(hierarchy) {
                var that = this;
                var data = {};
                if (hierarchy) {
                    data.name = hierarchy.name;
                    data.label = hierarchy.label ? hierarchy.label : "";
                    data.isSharedElement = that.isSharedElement;
                    data.rootNodeVisibility = hierarchy.rootNodeVisibility;
                    data.aggregateAllNodes = hierarchy.aggregateAllNodes;
                    data.defaultMember = hierarchy.defaultMember ? hierarchy.defaultMember : "";
                    data.multipleParents = hierarchy.multipleParents;
                    data.nodeStyle = hierarchy.nodeStyle;
                    data.stepParentNodeID = hierarchy.stepParentNodeID;
                    data.orphanedNodesHandling = hierarchy.orphanedNodesHandling;
                    data.timeDependent = hierarchy.timeDependent;
                    data.levels = that.getLevels(hierarchy);
                    data.levelAttributes = that.getAttributesForLevel(hierarchy);
                    data.levelOrderAttributes = that.getAttributes(hierarchy);
                    data.additionalAttributes = that.getAttributes();
                    data.orderAttributes = that.getAttributesForOrder(hierarchy);
                    data.parentAttributes = that.getAttributes();
                    data.parameters = that.getParameters();
                    data.levelTypes = that.getLevelTypes();
                    data.siblingOrders = that.getSiblingOrders(hierarchy);
                    data.parentDefinitions = that.getParentDefinitions(hierarchy);
                    data.edgeAttributes = that.getEdgeAttributes(hierarchy);
                    data.validFromElement = hierarchy.timeProperties ? hierarchy.timeProperties.validFromElement : undefined;
                    data.validToElement = hierarchy.timeProperties ? hierarchy.timeProperties.validToElement : undefined;
                    data.fromParameter = hierarchy.timeProperties ? hierarchy.timeProperties.fromParameter : undefined;
                    data.toParameter = hierarchy.timeProperties ? hierarchy.timeProperties.toParameter : undefined;
                    data.pointInTimeParameter = hierarchy.timeProperties ? hierarchy.timeProperties.pointInTimeParameter : undefined;
                }
                return data;
            },
            getLevels: function(hierarchy) {
                var isSharedElement = this.isSharedElement;
                var levels = [];
                if (hierarchy) {
                    var i = 1;
                    hierarchy.levels.foreach(function(level) {
                        levels.push({
                            order: i,
                            level: level,
                            isSharedElement: isSharedElement
                        });
                        i++;
                    });
                }
                return levels;
            },
            getAttributes: function() {
                var that = this;
                var attributes = [];
                this.viewNode.elements.foreach(function(element) {
                    if (element.aggregationBehavior === model.AggregationBehavior.NONE) {
                            if (!that.isBasedOnElementProxy(element, that.columnView, that.viewNode)) {
                                attributes.push({
                                    attributeElement: element
                                });
                            }
                    }
                });
                return attributes;
            },
            getAttributesForLevel: function(hierarchy) {
                var that = this;
                var attributes = [];
                this.viewNode.elements.foreach(function(element) {
                    if (element.aggregationBehavior === model.AggregationBehavior.NONE) {
                            if (!that.isBasedOnElementProxy(element, that.columnView, that.viewNode)) {
                                if (hierarchy) {
                                    var exist = false;
                                    hierarchy.levels.foreach(function(level) {
                                        if (level.element === element) {
                                            exist = true;
                                        }
                                    });
                                    if (!exist) {
                                        attributes.push({
                                            attributeElement: element
                                        });
                                    }
                                }
                            }
                    }
                });
                return attributes;
            },
            getAttributesForOrder: function(hierarchy) {
                var that = this;
                var attributes = [];
                this.viewNode.elements.foreach(function(element) {
                    if (element.aggregationBehavior === model.AggregationBehavior.NONE) {
                            if (!that.isBasedOnElementProxy(element, that.columnView, that.viewNode)) {
                                if (hierarchy) {
                                    var exist = false;
                                    hierarchy.siblingOrders.foreach(function(siblingOrder) {
                                        if (siblingOrder.byElement === element) {
                                            exist = true;
                                        }
                                    });
                                    if (!exist) {
                                        attributes.push({
                                            attributeElement: element
                                        });
                                    }
                                }
                            }
                    }
                });
                return attributes;
            },
            getEdgeAttributes: function(hierarchy) {
                var isSharedElement = this.isSharedElement;
                var edgeAttributes = [];
                if (hierarchy) {
                    hierarchy.edgeAttributes.foreach(function(edgeAttribute) {
                        edgeAttributes.push({
                            edgeAttribute: edgeAttribute,
                            isSharedElement: isSharedElement
                        });
                    });
                }
                return edgeAttributes;
            },
            getSiblingOrders: function(hierarchy) {
                var isSharedElement = this.isSharedElement;
                var siblingOrders = [];
                if (hierarchy) {
                    hierarchy.siblingOrders.foreach(function(siblingOrder) {
                        siblingOrders.push({
                            siblingOrder: siblingOrder,
                            isSharedElement: isSharedElement
                        });
                    });
                }
                return siblingOrders;
            },
            getParentDefinitions: function(hierarchy) {
                var isSharedElement = this.isSharedElement;
                var parentDefinitions = [];
                if (hierarchy) {
                    hierarchy.parentDefinitions.foreach(function(parentDefinition) {
                        parentDefinitions.push({
                            parentDefinition: parentDefinition,
                            isSharedElement: isSharedElement
                        });
                    });
                }
                return parentDefinitions;
            },
            getParameters: function() {
                var that = this;
                var parameters = [];
                this.columnView.parameters.foreach(function(parameter) {
                    if (!parameter.isVariable && !parameter.multipleSelections) {
                        if (!that.isBasedOnElementProxy(parameter, that.columnView, that.viewNode)) {
                            parameters.push({
                                parameter: parameter
                            });
                        }
                    }
                });
                return parameters;
            },
            getLevelTypes: function() {
                var levelType = [{
                    name: "REGULAR",
                    key: "MDLEVEL_TYPE_REGULAR"
                }, {
                    name: "ALL",
                    key: "MDLEVEL_TYPE_ALL"
                }, {
                    name: "CALCULATED",
                    key: "MDLEVEL_TYPE_CALCULATED"
                }, {
                    name: "TIME",
                    key: "MDLEVEL_TYPE_TIME"
                }, {
                    name: "TIMEYEARS",
                    key: "MDLEVEL_TYPE_TIME_YEARS"
                }, {
                    name: "TIMEHALFYEAR",
                    key: "MDLEVEL_TYPE_TIME_HALF_YEAR"
                }, {
                    name: "TIMEQUARTERS",
                    key: "MDLEVEL_TYPE_TIME_QUARTERS"
                }, {
                    name: "TIMEMONTHS",
                    key: "MDLEVEL_TYPE_TIME_MONTHS"
                }, {
                    name: "TIMEWEEKS",
                    key: "MDLEVEL_TYPE_TIME_WEEKS"
                }, {
                    name: "TIMEDAYS",
                    key: "MDLEVEL_TYPE_TIME_DAYS"
                }, {
                    name: "TIMEHOURS",
                    key: "MDLEVEL_TYPE_TIME_HOURS"
                }, {
                    name: "TIMEMINUTES",
                    key: "MDLEVEL_TYPE_TIME_MINUTES"
                }, {
                    name: "TIMESECONDS",
                    key: "MDLEVEL_TYPE_TIME_SECONDS"
                }, {
                    name: "TIMEUNDEFINED",
                    key: "MDLEVEL_TYPE_TIME_UNDEFINED"
                }, {
                    name: "UNKNOWN",
                    key: "MDLEVEL_TYPE_UNKNOWN"
                }];
                return levelType;
            },
            getLevelType: function(levelTypeId) {
                if (levelTypeId === "MDLEVEL_TYPE_REGULAR") {
                    return "REGULAR";
                } else if (levelTypeId === "MDLEVEL_TYPE_ALL") {
                    return "ALL";
                } else if (levelTypeId === "MDLEVEL_TYPE_CALCULATED") {
                    return "CALCULATED";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME") {
                    return "TIME";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_YEARS") {
                    return "TIMEYEARS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_HALF_YEAR") {
                    return "TIMEHALFYEAR";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_QUARTERS") {
                    return "TIMEQUARTERS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_MONTHS") {
                    return "TIMEMONTHS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_WEEKS") {
                    return "TIMEWEEKS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_DAYS") {
                    return "TIMEDAYS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_MINUTES") {
                    return "TIMEMINUTES";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_HOURS") {
                    return "TIMEHOURS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_SECONDS") {
                    return "TIMESECONDS";
                } else if (levelTypeId === "MDLEVEL_TYPE_TIME_UNDEFINED") {
                    return "TIMEUNDEFINED";
                } else if (levelTypeId === "MDLEVEL_TYPE_UNKNOWN") {
                    return "UNKNOWN";
                }
                return "";
            },
            getDetailsContent: function() {
                var that = this;
                if (!this.topVerticalLayout) {
                    this.topVerticalLayout = new sap.ui.commons.layout.VerticalLayout({
                        height: "100%"
                    });
                }
                var headerLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%"
                });

                this.headerLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_definition", [this.element ? this.element.name : ""]),
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.headerLabel],
                    hAlign: sap.ui.commons.layout.HAlign.Center,
                    vAlign: sap.ui.commons.layout.VAlign.Center
                }).addStyleClass("detailsHeaderStyle"));

                this.topVerticalLayout.addContent(headerLayout);

                var detailsLayout = new sap.ui.commons.layout.VerticalLayout();

                // detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_general_prop")));
                // detailsLayout.addContent(this.getGeneralContainer());
                var generalPanel = that.createPanel({
                    text: resourceLoader.getText("txt_general_prop"),
                    content: this.getGeneralContainer(),
                    collapsed: false,
                    showCollapseIcon: false
                });
                detailsLayout.addContent(generalPanel);
                if (that.type === "level") {
                    /*detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_nodes")));
                    detailsLayout.addContent(this.getNodeStyleContainer());

                    detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_hierarchy_properties")));
                    detailsLayout.addContent(this.getAdvancedAttributes()); */

                    var nodesPanel = that.createPanel({
                        text: resourceLoader.getText("tit_nodes"),
                        content: this.getNodeStyleContainer(),
                        collapsed: false,
                        showCollapseIcon: false
                    });
                    var propertyPanel = that.createPanel({
                        text: resourceLoader.getText("tit_hierarchy_properties"),
                        content: this.getAdvancedAttributes(),
                        collapsed: false,
                        showCollapseIcon: false
                    });
                    var aggregatePanel = that.createPanel({
                        text: resourceLoader.getText("msg_filter_aggregation"),
                        content: this.getFinalAggregationContainer(),
                        collapsed: true,
                        showCollapseIcon: true
                    });

                    detailsLayout.addContent(nodesPanel);
                    detailsLayout.addContent(propertyPanel);
                    // detailsLayout.addContent(aggregatePanel);

                }
                if (that.type !== "level") {
                    /* detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_nodes")));
                    detailsLayout.addContent(this.getParentNodeStyleContainer());

                    detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_hierarchy_properties")));
                    detailsLayout.addContent(this.getAdvancedAttributes());

                    detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_aditional_attribute")));
                    detailsLayout.addContent(this.getAditionalAttribute());

                    detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_order_by")));
                    detailsLayout.addContent(this.getOrderByContainer());

                    detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("tit_time_dependency")));
                    detailsLayout.addContent(this.getTimeAttributes()); */

                    var parentNodesPanel = that.createPanel({
                        text: resourceLoader.getText("tit_nodes"),
                        content: this.getParentNodeStyleContainer(),
                        collapsed: false,
                        showCollapseIcon: false
                    });
                    var propertyPanel = that.createPanel({
                        text: resourceLoader.getText("tit_hierarchy_properties"),
                        content: this.getAdvancedAttributes(),
                        collapsed: true,
                        showCollapseIcon: true
                    }).addStyleClass("dummyPane1");
                    var additionalPanel = that.createPanel({
                        text: resourceLoader.getText("tit_aditional_attribute"),
                        content: this.getAditionalAttribute(),
                        collapsed: true,
                        showCollapseIcon: true
                    }).addStyleClass("dummyPane2");
                    var orderPanel = that.createPanel({
                        text: resourceLoader.getText("tit_order_by"),
                        content: this.getOrderByContainer(),
                        collapsed: true,
                        showCollapseIcon: true
                    }).addStyleClass("dummyPane3");
                    var timeDependencyPanel = that.createPanel({
                        text: resourceLoader.getText("tit_time_dependency"),
                        content: this.getTimeAttributes(),
                        collapsed: true,
                        showCollapseIcon: true
                    }).addStyleClass("dummyPane4");

                    detailsLayout.addContent(parentNodesPanel);
                    detailsLayout.addContent(propertyPanel);
                    detailsLayout.addContent(additionalPanel);
                    detailsLayout.addContent(orderPanel);
                    detailsLayout.addContent(timeDependencyPanel);
                }

                detailsLayout.addStyleClass("customProperties");

                this.topVerticalLayout.addStyleClass("detailsMainDiv");

                this.topVerticalLayout.addContent(detailsLayout);

                detailsLayout.setModel(this.hierarChyModel);

                return that.topVerticalLayout;
            },
            createPanel: function(parameters) {
                var additionalPanel = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomPanel();
                additionalPanel.setText(parameters.text);
                additionalPanel.addContent(parameters.content);
                additionalPanel.setCollapsed(parameters.collapsed);
                additionalPanel.setShowCollapseIcon(parameters.showCollapseIcon);
                return additionalPanel;
            },
            getHeaderLayout: function(name) {
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
                headMatrixLayout.addStyleClass("headerHeight");
                var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    vAlign: sap.ui.commons.layout.VAlign.Begin,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }).addStyleClass("parameterHeaderStyle");

                var headerName = new sap.ui.commons.Label({
                    text: name,
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
                    width: "10px"
                }));
                headerMatrixLayoutCell.addContent(headerName);

                headMatrixLayout.createRow(headerMatrixLayoutCell);

                return headMatrixLayout;
            },

            getGeneralContainer: function() {
                var that = this;
                var generalMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["30%", "70%"]
                });

                generalMatrixLayout.createRow(null);

                var nameLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_name"),
                    required: true
                }).addStyleClass("labelFloat");
                this.nameField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: {
                        path: "/name",
                        formatter: function(name) {
                            return name;
                        }
                    },
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    liveChange: function(event) {
                        var value = event.getParameter("liveValue");
                        var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
                        if (result.message) {
                            that.nameField.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            that.nameField.setValueState(sap.ui.core.ValueState.None);
                        }
                    },
                    // value: "{name}",
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
                        if (result.message) {
                            CalcViewEditorUtil.showErrorMessageTooltip(that.nameField, result.message, result.messageObjects);
                            that.hierarChyModel.updateBindings(true);
                        } else {
                            CalcViewEditorUtil.clearErrorMessageTooltip(that.nameField);
                            // var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                            // attributes.objectAttributes.name = value;
                            var command = new commands.ChangeHierarchyCommand(that.element.name, {
                                objectAttributes: {
                                    name: value,
                                    label: that.element.label === "" ? value : that.element.label
                                }
                            });
                            that._execute(command);
                            that.updateMasterTable(that.element);
                        }
                    }
                }).addStyleClass("dummyTest1");
                generalMatrixLayout.createRow(nameLabel, this.nameField);

                var desLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_label")
                }).addStyleClass("labelFloat");
                var desField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "{/label}",
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        // var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                        // attributes.objectAttributes.label = value;
                        var command = new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                label: value
                            }
                        });
                        that._execute(command);
                        that.updateMasterTable(that.element);
                    }
                }).addStyleClass("dummyTest2");

                generalMatrixLayout.createRow(desLabel, desField);

                var nodeStyleLabel = new sap.ui.commons.Label({
                    text: "Node Style"
                }).addStyleClass("labelFloat");

                var nodeStyleCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "90%",
                    canEdit:false,
                    value: {
                        path:"nodeStyle",
                        formatter:function(nodeStyle){
                            if(nodeStyle === model.NodeStyle.NAMEPATH){
                                return  "Name Path - Compatibility";
                            }
                            if(nodeStyle === model.NodeStyle.LEVELNAME){
                                return  "Level Name - Compatibility";
                            }
                             if(nodeStyle === model.NodeStyle.NAMEPATHENFORCED){
                                return  "Name Path";
                            }
                            if(nodeStyle === model.NodeStyle.LEVELNAMEENFORCED){
                                return  "Level Name";
                            }
                            if(nodeStyle === model.NodeStyle.NAMEONLY){
                                return "Name Only";
                            }
                        }
                    },
                    // selectedKey: "{nodeStyle}",
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                nodeStyle: selecetdKey
                            }
                        }));
                    }
                }).addStyleClass("dummyTest3").addStyleClass("borderIconCombo");
                var levelNameListItem = new sap.ui.core.ListItem({
                    text: "Level Name",
                    key: model.NodeStyle.LEVELNAMEENFORCED
                });
                var nameOnlyListItem = new sap.ui.core.ListItem({
                    text: "Name Only",
                    key: model.NodeStyle.NAMEONLY
                });
                var namePathListItem = new sap.ui.core.ListItem({
                    text: "Name Path",
                    key: model.NodeStyle.NAMEPATHENFORCED
                });
                nodeStyleCombo.addItem(levelNameListItem);
                nodeStyleCombo.addItem(nameOnlyListItem);
                nodeStyleCombo.addItem(namePathListItem);
                if (that.type === "level") {
                    generalMatrixLayout.createRow(nodeStyleLabel, nodeStyleCombo);
                }

                generalMatrixLayout.createRow(null);
                // generalMatrixLayout.setModel(this.hierarChyModel);
                return generalMatrixLayout;

            },
            getNodeStyleContainer: function() {
                var that = this;
                var nodeStyleMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["100%"]
                });

                nodeStyleMatrixLayout.createRow(null);


                var nodeStyleTable = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomTable({
                    visibleRowCount: 3,
                    width: "100%",
                    rowSelectionChange: function(event) {
                        if (event.getSource() && event.getSource().getSelectedIndices().length > 0) {
                            deleteIcon.setEnabled(true);
                            moveUp.setEnabled(true);
                            moveDown.setEnabled(true);
                            var totalRows = event.oSource.getModel().getData().levels.length;
                            if(event.getSource().getSelectedIndices().length === 1){
                                var selectedIndex = event.getSource().getSelectedIndex();
                                  if(selectedIndex === 0){
                                        moveUp.setEnabled(false);    
                                    }
                                  if(selectedIndex + 1 === totalRows){
                                        moveDown.setEnabled(false);      
                                    }
                            }
                        } else {
                            deleteIcon.setEnabled(false);
                            moveUp.setEnabled(false);
                            moveDown.setEnabled(false);
                        }
                    }
                }).addStyleClass("dummyTest4");
                var toolBar = new sap.ui.commons.Toolbar();
                toolBar.addStyleClass("parameterToolbarStyle");
                var createIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        that._execute(new commands.AddLevelCommand(that.element.name, {
                            elementName: "",
                            levelType: "",
                            orderElementName: "",
                            sortDirection: ""
                        }));
                    }
                });
                var deleteIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (nodeStyleTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        var deleteCommands = [];
                        var removeSelectionIndices = [];
                        for (var i = 0; i < nodeStyleTable.getSelectedIndices().length; i++) {
                            var bindContext = nodeStyleTable.getContextByIndex(nodeStyleTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var level = bindContext.getProperty("level");
                                if (level) {
                                    deleteCommands.push(new modelbase.DeleteCommand(level, false));
                                    removeSelectionIndices.push(nodeStyleTable.getSelectedIndices()[i]);
                                }
                            }
                        }
                        removeSelectionIndices.forEach(function(index){
                            nodeStyleTable.removeSelectionInterval(index,index); 
                        });
                        if (deleteCommands.length > 0) {
                            that._execute(deleteCommands);
                            that.modelChanged();
                        }


                    }
                });
                var moveUp = new sap.ui.commons.Button({
                    icon: "sap-icon://up", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_move_up"),
                    tooltip: resourceLoader.getText("tol_move_up"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (nodeStyleTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        var commandsList = [];
                        var selectionOrder = [];
                        for (var i = 0; i < nodeStyleTable.getSelectedIndices().length; i++) {
                            var bindContext = nodeStyleTable.getContextByIndex(nodeStyleTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var order = bindContext.getProperty("order");
                                var level = bindContext.getProperty("level");
                                if (level) {
                                    if (order > 1) {
                                        // LS: Get levelBefore and move selected level by using key of the levelBefore
                                        var bindContextBefore = nodeStyleTable.getContextByIndex(nodeStyleTable.getSelectedIndices()[i] - 1);
                                        if (!bindContextBefore) {
                                            return;
                                        }
                                        var levelBefore = bindContextBefore.getProperty("level");
                                        if (!levelBefore) {
                                            return;
                                        }

                                        var addCommand = new commands.AddLevelCommand(that.element.name, {
                                            elementName: level.element ? level.element.name : undefined,
                                            levelType: level.levelType,
                                            orderElementName: level.orderElement ? level.orderElement.name : undefined,
                                            sortDirection: level.sortDirection
                                            // LS }, i - 1);
                                        }, levelBefore.$getKeyAttributeValue());
                                        commandsList.push(addCommand);
                                        commandsList.push(new modelbase.DeleteCommand(level, false));
                                        selectionOrder.push(nodeStyleTable.getSelectedIndices()[i] - 1);
                                        nodeStyleTable.removeSelectionInterval(nodeStyleTable.getSelectedIndices()[i], nodeStyleTable.getSelectedIndices()[i]);
                                    }
                                }
                            }
                        }
                        if (commandsList.length > 0) {
                            that._execute(commandsList);
                            that.modelChanged();
                            selectionOrder.forEach(function(order) {
                                nodeStyleTable.setSelectionInterval(order, order);
                            });
                        }
                    }
                });
                var moveDown = new sap.ui.commons.Button({
                    icon: "sap-icon://down", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_move_down"),
                    tooltip: resourceLoader.getText("tol_move_down"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (nodeStyleTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        var commandsList = [];
                        var selectionOrder = [];
                        for (var i = 0; i < nodeStyleTable.getSelectedIndices().length; i++) {
                            var bindContext = nodeStyleTable.getContextByIndex(nodeStyleTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var order = bindContext.getProperty("order");
                                var level = bindContext.getProperty("level");
                                if (level) {
                                    var bindContextAfter = nodeStyleTable.getContextByIndex(nodeStyleTable.getSelectedIndices()[i] + 1);
                                    if (!bindContextAfter) {
                                        return;
                                    }
                                    var levelAfter = bindContextAfter.getProperty("level");
                                    if (!levelAfter) {
                                        return;
                                    }
                                    if (order < that.hierarChyModel.getData().levels.length) {
                                        commandsList.push(new modelbase.DeleteCommand(levelAfter, false));
                                        commandsList.push(new commands.AddLevelCommand(that.element.name, {
                                            elementName: levelAfter.element ? levelAfter.element.name : undefined,
                                            levelType: levelAfter.levelType,
                                            orderElementName: levelAfter.orderElement ? levelAfter.orderElement.name : undefined,
                                            sortDirection: levelAfter.sortDirection
                                        }, level.$getKeyAttributeValue()));
                                        selectionOrder.push(nodeStyleTable.getSelectedIndices()[i] + 1);
                                        nodeStyleTable.removeSelectionInterval(nodeStyleTable.getSelectedIndices()[i], nodeStyleTable.getSelectedIndices()[i]);
                                    }
                                }
                            }
                        }
                        if (commandsList.length > 0) {
                            that._execute(commandsList);
                            that.modelChanged();
                            selectionOrder.forEach(function(order) {
                                nodeStyleTable.setSelectionInterval(order, order);
                            });
                        }
                    }
                });

                toolBar.addItem(createIcon);
                toolBar.addItem(deleteIcon);
                toolBar.addItem(moveUp);
                toolBar.addItem(moveDown);

                nodeStyleTable.setToolbar(toolBar);

                var levelLabel = new sap.ui.commons.Label({
                    text: "{order}"
                });

                var oImage = new sap.ui.commons.Image({
                    src: {
                        path: "level",
                        formatter: function(level) {
                            if (level && level.element) {
                                return that.getIconPath(level.element);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });

                var elementCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "100%",
                    icon: oImage,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    // canedit: false,
                    selectedKey: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.element ? level.element.name : "";
                            }
                        }
                    },
                    value: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.element ? level.element.name : "";
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            //   var selectedIndex = nodeStyleTable._getFocusedRowIndex() - 1;
                            var levelElement = event.getSource().getBindingContext().getProperty("level");
                            var selectedIndex = levelElement.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            if (levelElement.element === "" || levelElement.element === undefined || levelElement.element === null) {
                                that._execute(new commands.ChangeLevelCommand(that.element.name, selectedIndex, {
                                    elementName: selectedElement.name,
                                    levelType: "MDLEVEL_TYPE_REGULAR",
                                    sortDirection: "ASC",
                                    orderElementName: selectedElement.name
                                }));
                            } else {
                                that._execute(new commands.ChangeLevelCommand(that.element.name, selectedIndex, {
                                    elementName: selectedElement.name
                                }));
                            }

                        }
                    }
                    // icon: oImage
                }).addStyleClass("noMarginLeft");

                var elementItem = new sap.ui.core.ListItem();

                elementItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                elementItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                elementItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var elementListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/levelAttributes",
                        template: elementItem
                    }
                });
                elementCombo.setListBox(elementListBox);

                /* elementCombo.bindItems({
                    path: "/levelAttributes",
                    template: elementItem
                }); */

                var levelTypeCombo = new sap.ui.commons.ComboBox({
                    width: "90%",
                    selectedKey: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.levelType;
                            }
                        }
                    },
                    value: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.levelType ? that.getLevelType(level.levelType) : "";
                            }
                        }
                    },
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "level"
                        }],
                        formatter: function(isSharedElement, level) {
                            if (isSharedElement) {
                                return false;
                            }
                            if (level) {
                                return level.element ? true : false;
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("key");
                            // var selectedIndex = nodeStyleTable._getFocusedRowIndex() - 1;
                            var levelElement = event.getSource().getBindingContext().getProperty("level");
                            var selectedIndex = levelElement.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeLevelCommand(that.element.name, selectedIndex, {
                                levelType: selectedElement
                            }));

                        }
                    }
                });

                var levelItem = new sap.ui.core.ListItem();

                levelItem.bindProperty("text", {
                    path: "name",
                    formatter: function(name) {
                        return name;
                    }

                });
                levelItem.bindProperty("key", {
                    path: "key",
                    formatter: function(key) {
                        return key;
                    }

                });

                levelTypeCombo.bindItems({
                    path: "/levelTypes",
                    template: levelItem
                });
                var oImageForOrder = new sap.ui.commons.Image({
                    src: {
                        path: "level",
                        formatter: function(level) {
                            if (level && level.orderElement) {
                                return that.getIconPath(level.orderElement);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var orderByCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "90%",
                    canedit: false,
                    icon: oImageForOrder,
                    selectedKey: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.orderElement ? level.orderElement.name : "";
                            }
                        }
                    },
                    value: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.orderElement ? level.orderElement.name : "";
                            }
                        }
                    },
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "level"
                        }],
                        formatter: function(isSharedElement, level) {
                            if (isSharedElement) {
                                return false;
                            }
                            if (level) {
                                return level.element ? true : false;
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var selectedIndex = nodeStyleTable._getFocusedRowIndex() - 1;
                            var levelElement = event.getSource().getBindingContext().getProperty("level");
                            var selectedIndex = levelElement.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeLevelCommand(that.element.name, selectedIndex, {
                                orderElementName: selectedElement.name
                            }));
                        }
                    }
                }).addStyleClass("noMarginLeft");

                var orderByItem = new sap.ui.core.ListItem();

                orderByItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                orderByItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                orderByItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var orderListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/levelOrderAttributes",
                        template: orderByItem
                    }
                });
                orderByCombo.setListBox(orderListBox);

                /*orderByCombo.bindItems({
                    path: "/levelAttributes",
                    template: orderByItem
                }); */

                var sortDirectionCombo = new sap.ui.commons.ComboBox({
                    width: "100%",
                    selectedKey: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                return level.sortDirection;
                            }
                        }
                    },
                    value: {
                        path: "level",
                        formatter: function(level) {
                            if (level) {
                                if (level.sortDirection === "ASC") {
                                    return "Ascending";
                                } else if (level.sortDirection === "DESC") {
                                    return "Descending";
                                } else {
                                    return "";
                                }
                            }
                        }
                    },
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "level"
                        }],
                        formatter: function(isSharedElement, level) {
                            if (isSharedElement) {
                                return false;
                            }
                            if (level) {
                                return level.element ? true : false;
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem) {
                            var selectedElement = selectedItem.getProperty("key");
                            // var selectedIndex = nodeStyleTable._getFocusedRowIndex() - 1;
                            var levelElement = event.getSource().getBindingContext().getProperty("level");
                            var selectedIndex = levelElement.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeLevelCommand(that.element.name, selectedIndex, {
                                sortDirection: selectedElement
                            }));
                        }
                    }
                });
                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Descending",
                    key: "DESC"
                }));

                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Ascending",
                    key: "ASC"
                }));



                var levelColumn = new sap.ui.table.Column({
                    width: "50%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("Level")
                    }),
                    template: levelLabel
                });

                var elementColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_column")
                    }),
                    template: elementCombo
                });
                var levelTypeColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_level_type")
                    }),
                    template: levelTypeCombo
                });

                var orderByColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_hierarchy_order_by")
                    }),
                    template: orderByCombo
                });
                var sortDirectionColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_hierarchy_sort_direction")
                    }),
                    template: sortDirectionCombo
                });


                nodeStyleTable.addColumn(levelColumn);
                nodeStyleTable.addColumn(elementColumn);
                nodeStyleTable.addColumn(levelTypeColumn);
                nodeStyleTable.addColumn(orderByColumn);
                nodeStyleTable.addColumn(sortDirectionColumn);

                nodeStyleTable.bindRows("/levels");

                nodeStyleMatrixLayout.createRow(nodeStyleTable);

                nodeStyleMatrixLayout.createRow(null);

                return nodeStyleMatrixLayout;

            },
            getParentNodeStyleContainer: function() {
                var that = this;
                var parentNodeStyleMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["100%"]
                });

                parentNodeStyleMatrixLayout.createRow(null);


                var parentNodeStyleTable = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomTable({
                    visibleRowCount: 3,
                    width: "100%",
                    rowSelectionChange: function(event) {
                        if (event.getSource() && event.getSource().getSelectedIndices().length > 0) {
                            deleteIcon.setEnabled(true);
                        } else {
                            deleteIcon.setEnabled(false);
                        }
                    }
                }).addStyleClass("dummyTest8");
                var toolBar = new sap.ui.commons.Toolbar();
                toolBar.addStyleClass("parameterToolbarStyle");
                var createIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        that._execute(new commands.AddParentDefinitionCommand(that.element.name, {
                            elementName: "",
                            parentName: "",
                            stepParentNodeID: "",
                            rootNodeAttributes: {
                                constantValue: ""
                            }
                        }));
                    }
                });
                var deleteIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (parentNodeStyleTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {

                        var deleteCommands = [];
                        var removeSelectionIndices = [];
                        
                        for (var i = 0; i < parentNodeStyleTable.getSelectedIndices().length; i++) {
                            var bindContext = parentNodeStyleTable.getContextByIndex(parentNodeStyleTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var parentDefinition = bindContext.getProperty("parentDefinition");
                                if (parentDefinition) {
                                    deleteCommands.push(new modelbase.DeleteCommand(parentDefinition, false));
                                    removeSelectionIndices.push(parentNodeStyleTable.getSelectedIndices()[i]);
                                }
                            }
                        }
                        removeSelectionIndices.forEach(function(index){
                            parentNodeStyleTable.removeSelectionInterval(index,index); 
                        });
                        if (deleteCommands.length > 0) {
                            that._execute(deleteCommands);
                            that.modelChanged();
                        }


                    }
                });

                toolBar.addItem(createIcon);
                toolBar.addItem(deleteIcon);

                parentNodeStyleTable.setToolbar(toolBar);

                var oImageForParent = new sap.ui.commons.Image({
                    src: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition && parentDefinition.parent) {
                                return that.getIconPath(parentDefinition.parent);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });

                var parentCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "100%",
                    canedit: false,
                    icon: oImageForParent,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    selectedKey: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition) {
                                return parentDefinition.parent ? parentDefinition.parent.name : "";
                            }
                        }
                    },
                    value: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition) {
                                return parentDefinition.parent ? parentDefinition.parent.name : "";
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var selectedIndex = parentNodeStyleTable._getFocusedRowIndex() - 1;
                            var parentDefinition = event.getSource().getBindingContext().getProperty("parentDefinition");
                            var selectedIndex = parentDefinition.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                                parentName: selectedElement.name
                            }));

                        }
                    }
                    // icon: oImage
                }).addStyleClass("noMarginLeft");

                var elementItem = new sap.ui.core.ListItem();

                elementItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                elementItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                elementItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var parentListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parentAttributes",
                        template: elementItem
                    }
                });
                parentCombo.setListBox(parentListBox);

                /*parentCombo.bindItems({
                    path: "/parentAttributes",
                    template: elementItem
                }); */

                var oImageForChild = new sap.ui.commons.Image({
                    src: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition && parentDefinition.element) {
                                return that.getIconPath(parentDefinition.element);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var childCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "100%",
                    canedit: false,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    icon: oImageForChild,
                    selectedKey: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition) {
                                return parentDefinition.element ? parentDefinition.element.name : "";
                            }
                        }
                    },
                    value: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition) {
                                return parentDefinition.element ? parentDefinition.element.name : "";
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var selectedIndex = parentNodeStyleTable._getFocusedRowIndex() - 1;
                            var parentDefinition = event.getSource().getBindingContext().getProperty("parentDefinition");
                            var selectedIndex = parentDefinition.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                                elementName: selectedElement.name
                            }));
                        }
                    }
                }).addStyleClass("noMarginLeft");

                var childAttributeItem = new sap.ui.core.ListItem();

                childAttributeItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                childAttributeItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                childAttributeItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });

                var childListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parentAttributes",
                        template: childAttributeItem
                    }
                });
                childCombo.setListBox(childListBox);

                /*childCombo.bindItems({
                    path: "/parentAttributes",
                    template: childAttributeItem
                }); */


                var stepParentText = new sap.ui.commons.TextField({
                    value: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            return parentDefinition ? parentDefinition.stepParentNodeID : "";
                        }
                    },
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    /*enabled: {
                        path: "orphanedNodesHandling",
                        formatter: function(orphanedNodesHandling) {
                            return orphanedNodesHandling === model.OrphanedNodesHandling.STEPPARENT_NODE ? true : false;
                        }
                    },*/
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        // var selectedIndex = parentNodeStyleTable._getFocusedRowIndex();
                        var parentDefinition = event.getSource().getBindingContext().getProperty("parentDefinition");
                        var selectedIndex = parentDefinition.$getKeyAttributeValue();
                        var command = new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                            stepParentNodeID: value
                        });
                        that._execute(command);

                    }
                });

                var rootNodeText = new sap.ui.commons.TextField({
                    value: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition && parentDefinition.rootNode) {
                                return parentDefinition.rootNode.constantValue ? parentDefinition.rootNode.constantValue : "";
                            }
                        }
                    },
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        // var selectedIndex = parentNodeStyleTable._getFocusedRowIndex();
                        var parentDefinition = event.getSource().getBindingContext().getProperty("parentDefinition");
                        var selectedIndex = parentDefinition.$getKeyAttributeValue();
                        var command = new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                            rootNodeAttributes: {
                                constantValue: value
                            }
                        });
                        that._execute(command);
                    }
                });



                var nodeTypeParameterCombo = new sap.ui.commons.ComboBox({
                    width: "100%",
                    value: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition && parentDefinition.rootNode) {
                                if (parentDefinition.rootNode.constantValue) {
                                    return parentDefinition.rootNode.constantValue;
                                } else if (parentDefinition.rootNode.parameter) {
                                    return parentDefinition.rootNode.parameter.name;
                                } else {
                                    return "";
                                }

                            }
                            return "";
                        }
                    },
                    selectedKey: {
                        path: "parentDefinition",
                        formatter: function(parentDefinition) {
                            if (parentDefinition && parentDefinition.rootNode) {
                                if (parentDefinition.rootNode.constantValue) {
                                    return parentDefinition.rootNode.constantValue;
                                } else if (parentDefinition.rootNode.parameter) {
                                    return parentDefinition.rootNode.parameter.name;
                                } else {
                                    return "";
                                }

                            }
                            return "";
                        }
                    },
                    change: function(oEvent) {
                        var selectedKey = oEvent.getSource().getSelectedKey();
                        var newvalue = oEvent.getParameter("newValue");
                        var parentDefinition = oEvent.getSource().getBindingContext().getProperty("parentDefinition");
                        var selectedIndex = parentDefinition.$getKeyAttributeValue();

                        if (selectedKey) {
                            var command = new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                                rootNodeAttributes: {
                                    parameterName: selectedKey,
                                    constantValue: ""
                                }
                            });
                            that._execute(command);
                        } else {
                            var command = new commands.ChangeParentDefinitionCommand(that.element.name, selectedIndex, {
                                rootNodeAttributes: {
                                    constantValue: newvalue,
                                    parameterName: null,
                                }
                            });
                            that._execute(command);

                        }
                    }
                });
                var nodeTypeParameterItem = new sap.ui.core.ListItem();
                nodeTypeParameterItem.bindProperty("text", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                nodeTypeParameterItem.bindProperty("key", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                nodeTypeParameterItem.bindProperty("icon", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return resourceLoader.getImagePath("Parameter.png");
                    }

                });
                var nodeTypeParameterListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parameters",
                        template: nodeTypeParameterItem
                    }
                });
                nodeTypeParameterCombo.setListBox(nodeTypeParameterListBox);

                var horizantalLayout = new sap.ui.commons.layout.HorizontalLayout();
                horizantalLayout.addContent(new sap.ui.commons.Label({
                    text: resourceLoader.getText("Step Parent")
                }));
                horizantalLayout.addContent(new sap.ui.commons.Label({
                    icon: resourceLoader.getImagePath("info.png"),
                    tooltip: resourceLoader.getText("tol_applicable_value_property_orphan_step_parent"),
                    visible: {
                        path: "orphanedNodesHandling",
                        formatter: function(orphanedNodesHandling) {
                            return orphanedNodesHandling === model.OrphanedNodesHandling.STEPPARENT_NODE ? false : true;
                        }
                    }
                }));


                var childColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_child")
                    }),
                    template: childCombo
                });
                var parentColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_parent")
                    }),
                    template: parentCombo
                });

                var stepParentColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_step_parent")
                    }),
                    template: stepParentText
                });
                var rootNodeColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_root_node")
                    }),
                    template: nodeTypeParameterCombo
                });


                parentNodeStyleTable.addColumn(childColumn);
                parentNodeStyleTable.addColumn(parentColumn);
                parentNodeStyleTable.addColumn(stepParentColumn);
                parentNodeStyleTable.addColumn(rootNodeColumn);

                parentNodeStyleTable.bindRows("/parentDefinitions");

                parentNodeStyleMatrixLayout.createRow(parentNodeStyleTable);

                parentNodeStyleMatrixLayout.createRow(null);

                return parentNodeStyleMatrixLayout;

            },
            getAditionalAttribute: function() {

                var that = this;
                var aditionalAttributeMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["100%"]
                });

                aditionalAttributeMatrixLayout.createRow(null);

                var aditionalAttributeTable = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomTable({
                    visibleRowCount: 3,
                    width: "100%",
                    rowSelectionChange: function(event) {
                        if (event.getSource() && event.getSource().getSelectedIndices().length > 0) {
                            deleteIcon.setEnabled(true);
                        } else {
                            deleteIcon.setEnabled(false);
                        }
                    }
                }).addStyleClass("dummyTest9");
                var toolBar = new sap.ui.commons.Toolbar();
                toolBar.addStyleClass("parameterToolbarStyle");
                var createIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        that._execute(new commands.AddEdgeAttributeCommand(that.element.name, {
                            elementName: ""
                        }));
                    }
                });
                var deleteIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (aditionalAttributeTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        var deleteCommands = [];
                        var removeSelectionIndices = [];
                        for (var i = 0; i < aditionalAttributeTable.getSelectedIndices().length; i++) {
                            var bindContext = aditionalAttributeTable.getContextByIndex(aditionalAttributeTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var edgeAttribute = bindContext.getProperty("edgeAttribute");
                                if (edgeAttribute) {
                                    deleteCommands.push(new modelbase.DeleteCommand(edgeAttribute, false));
                                    removeSelectionIndices.push(aditionalAttributeTable.getSelectedIndices()[i]);
                                }
                            }
                        }
                        removeSelectionIndices.forEach(function(index){
                            aditionalAttributeTable.removeSelectionInterval(index,index); 
                        });
                        if (deleteCommands.length > 0) {
                            that._execute(deleteCommands);
                            that.modelChanged();
                        }
                    }
                });

                toolBar.addItem(createIcon);
                toolBar.addItem(deleteIcon);

                aditionalAttributeTable.setToolbar(toolBar);
                var oImageForAttribute = new sap.ui.commons.Image({
                    src: {
                        path: "edgeAttribute",
                        formatter: function(edgeAttribute) {
                            if (edgeAttribute && edgeAttribute.element) {
                                return that.getIconPath(edgeAttribute.element);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });

                var attributeCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "99%",
                    editable: true,
                    icon: oImageForAttribute,
                    canedit: false,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    selectedKey: {
                        path: "edgeAttribute",
                        formatter: function(edgeAttribute) {
                            if (edgeAttribute) {
                                return edgeAttribute.element ? edgeAttribute.element.name : "";
                            }

                        }
                    },
                    value: {
                        path: "edgeAttribute",
                        formatter: function(edgeAttribute) {
                            if (edgeAttribute) {
                                return edgeAttribute.element ? edgeAttribute.element.name : "";
                            }

                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            var selectedIndex = aditionalAttributeTable._getFocusedRowIndex();
                            var edgeAttribute = event.getSource().getBindingContext().getProperty("edgeAttribute");
                            // var selectedIndex = edgeAttribute.$getKeyAttributeValue();
                            var edgeElement = that.hierarChyModel.getData().edgeAttributes[selectedIndex] ? that.hierarChyModel.getData().edgeAttributes[selectedIndex].edgeAttribute : undefined;
                            var keyIndex = edgeElement ? edgeElement.$getKeyAttributeValue() : undefined;
                            that._execute([new modelbase.DeleteCommand(edgeAttribute, false), new commands.AddEdgeAttributeCommand(that.element.name, {
                                elementName: selectedElement.name
                            }, keyIndex)]);
                            that.modelChanged();
                        }

                    }
                    // icon: oImage
                }).addStyleClass("noMarginLeft"); //.addStyleClass("borderIconCombo");

                var attributeListItem = new sap.ui.core.ListItem({});
                attributeListItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(element) {
                        return element ? element.name : "";
                    }
                });
                attributeListItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(element) {
                        if (element) {
                            return resourceLoader.getImagePath("Dimension.png");
                        }

                        // return resourceLoader.getImagePath(element.aggregationBehavior === "NONE" ? "Dimension.png" : "Measure.png");
                    }
                });
                attributeListItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(element) {
                        return element ? element.name : "";
                    }
                });

                var attributeListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/additionalAttributes",
                        template: attributeListItem
                    }
                });
                attributeCombo.setListBox(attributeListBox);

                /*attributeCombo.bindItems({
                    path: "/additionalAttributes",
                    template: attributeListItem
                }); */


                var attributeColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_attribue")
                    }),
                    template: attributeCombo
                });


                aditionalAttributeTable.addColumn(attributeColumn);

                aditionalAttributeTable.bindRows("/edgeAttributes");

                aditionalAttributeMatrixLayout.createRow(aditionalAttributeTable);

                aditionalAttributeMatrixLayout.createRow(null);

                return aditionalAttributeMatrixLayout;


            },
            getAdvancedAttributes: function() {

                var that = this;
                var advancedMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["30%", "70%"]
                });

                advancedMatrixLayout.createRow(null);

                var aggregateCheckBox = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_aggregate_all_nodes"),
                    width: "45%",
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    change: function(oevent) {
                        var checked = oevent.getSource().getChecked();
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                aggregateAllNodes: checked
                            }
                        }));

                    }
                }).bindProperty("checked", "/aggregateAllNodes").addStyleClass("marginFields");

                var multipleParentCheckBox = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_multiple_parents"),
                    width: "45%",
                    enabled: {
                        parts:[{
                            path:"isSharedElement"
                        },
                        {
                            path:"timeDependent"
                        }],
                        // path: "isSharedElement",
                        formatter: function(isSharedElement,timeDependent) {
                            if (isSharedElement) {
                                return false;
                            }
                            
                           /* if(timeDependent){
                                return false;
                            }*/
                            return true;
                        }
                    },
                    change: function(oevent) {
                        var checked = oevent.getSource().getChecked();
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                multipleParents: checked
                            }
                        }));
                    }
                }).bindProperty("checked", "/multipleParents").addStyleClass("marginFields");



                var checkBoxRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var checkBoxCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [aggregateCheckBox, multipleParentCheckBox]
                });

                checkBoxRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [new sap.ui.commons.Label({})]
                }));
                checkBoxRow.addCell(checkBoxCell);

                advancedMatrixLayout.addRow(checkBoxRow);


                var nameLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_default_member")
                }).addStyleClass("labelFloat");
                var defaultMemberText = new sap.ui.commons.TextField({
                    width: "90%",
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    value: "{/defaultMember}",
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                defaultMember: value
                            }
                        }));
                    }
                }).addStyleClass("dummyTest5");
                advancedMatrixLayout.createRow(nameLabel, defaultMemberText);




                var orphanNodeLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_orphan_nodes")
                }).addStyleClass("labelFloat");
                var width = "50%";
                if (that.type !== "level") {
                    width = "90%";
                }

                var orphanNodeCombo = new sap.ui.commons.ComboBox({
                    width: width,
                    enabled: {
                        parts:[{
                            path:"isSharedElement"
                        },{
                            path:"timeDependent"
                        }],
                     //   path: "isSharedElement",
                        formatter: function(isSharedElement,timeDependent) {
                            if (isSharedElement) {
                                return false;
                            }
                          /*  if(timeDependent){
                                return false;
                            }*/
                            return true;
                        }
                    },
                    value: {
                        path: "/orphanedNodesHandling",
                        formatter: function(orphanedNodesHandling) {
                            if (orphanedNodesHandling === model.OrphanedNodesHandling.ROOT_NODES) {
                                return "Root Nodes";
                            } else if (orphanedNodesHandling === model.OrphanedNodesHandling.ERROR) {
                                return "Error";
                            } else if (orphanedNodesHandling === model.OrphanedNodesHandling.IGNORE) {
                                return "Ignore";
                            } else if (orphanedNodesHandling === model.OrphanedNodesHandling.STEPPARENT_NODE) {
                                return "Step Parent";
                            } else {
                                return "";
                            }
                        }
                    },
                    selectedKey: {
                        path: "/orphanedNodesHandling",
                        formatter: function(orphanedNodesHandling) {
                            return orphanedNodesHandling ? orphanedNodesHandling : "";
                        }
                    },
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        var stepParentValue;
                        if (selecetdKey === model.OrphanedNodesHandling.STEPPARENT_NODE) {
                            stepParentValue = that.element.stepParentNodeID;
                        } else {
                            stepParentValue = "";
                        }
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                orphanedNodesHandling: selecetdKey,
                                stepParentNodeID: stepParentValue
                            }
                        }));
                        that.hierarChyModel.getData().orphanedNodesHandling = that.element.orphanedNodesHandling;
                        that.hierarChyModel.updateBindings(true);
                    }
                }).addStyleClass("dummyTest6");

                var rootNodeListItem = new sap.ui.core.ListItem({
                    text: "Root Nodes",
                    key: model.OrphanedNodesHandling.ROOT_NODES
                });
                var errorListItem = new sap.ui.core.ListItem({
                    text: "Error",
                    key: model.OrphanedNodesHandling.ERROR
                });
                var ignoreListItem = new sap.ui.core.ListItem({
                    text: "Ignore",
                    key: model.OrphanedNodesHandling.IGNORE
                });
                var stepParentListItem = new sap.ui.core.ListItem({
                    text: "Step Parent",
                    key: model.OrphanedNodesHandling.STEPPARENT_NODE
                });
                orphanNodeCombo.addItem(rootNodeListItem);
                orphanNodeCombo.addItem(errorListItem);
                orphanNodeCombo.addItem(ignoreListItem);
                orphanNodeCombo.addItem(stepParentListItem);

                var stepParentText = new sap.ui.commons.TextField({
                    value: "{stepParentNodeID}",
                    width: "38%",
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "/orphanedNodesHandling"
                        }],
                        formatter: function(isSharedElement, orphanedNodesHandling) {
                            if (isSharedElement) {
                                return false;
                            } else {
                                return orphanedNodesHandling === model.OrphanedNodesHandling.STEPPARENT_NODE ? true : false;
                            }
                        }
                    },
                    visible: {
                        path: "/orphanedNodesHandling",
                        formatter: function(orphanedNodesHandling) {
                            return that.type !== "level" ? false : true;
                        }
                    },
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                stepParentNodeID: value
                            }
                        }));

                    }
                }).addStyleClass("dummyTest7");

                var rootNodeLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_root_node_visibility")
                }).addStyleClass("labelFloat");

                var rootNodeVisibulityCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "90%",
                    canedit: false,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    value: {
                        path: "/rootNodeVisibility",
                        formatter: function(rootNodeVisibility) {
                            if (rootNodeVisibility === model.RootNodeVisibility.ADD_ROOT_NODE_IF_DEFINED) {
                                return "Add Root node If Defined";
                            } else if (rootNodeVisibility === model.RootNodeVisibility.DO_NOT_ADD_ROOT_NODE) {
                                return "Do Not Add Root Node";
                            } else if (rootNodeVisibility === model.RootNodeVisibility.ADD_ROOT_NODE) {
                                return "Add Root node";
                            } else {
                                return "";
                            }
                        }
                    },
                    selectedKey: {
                        path: "/rootNodeVisibility",
                        formatter: function(rootNodeVisibility) {
                            return rootNodeVisibility ? rootNodeVisibility : "";
                        }
                    },
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                            objectAttributes: {
                                rootNodeVisibility: selecetdKey
                            }
                        }));
                        that.hierarChyModel.getData().rootNodeVisibility = selecetdKey;
                        that.hierarChyModel.updateBindings(true);
                    }

                }).addStyleClass("borderIconCombo");

                var addRootNodeIfDefinedListItem = new sap.ui.core.ListItem({
                    text: "Add Root node If Defined",
                    key: model.RootNodeVisibility.ADD_ROOT_NODE_IF_DEFINED
                });

                var addRootNodeDefinedListItem = new sap.ui.core.ListItem({
                    text: "Add Root node",
                    key: model.RootNodeVisibility.ADD_ROOT_NODE
                });
                var doNotAddRootNodeListItem = new sap.ui.core.ListItem({
                    text: "Do Not Add Root Node",
                    key: model.RootNodeVisibility.DO_NOT_ADD_ROOT_NODE
                });

                if (that.type !== "level") {
                    rootNodeVisibulityCombo.addItem(addRootNodeIfDefinedListItem);
                }
                rootNodeVisibulityCombo.addItem(addRootNodeDefinedListItem);
                rootNodeVisibulityCombo.addItem(doNotAddRootNodeListItem);

                advancedMatrixLayout.createRow(rootNodeLabel, rootNodeVisibulityCombo);

                var orphanRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var labelCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [orphanNodeLabel]
                });

                var comboCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [orphanNodeCombo, stepParentText]
                });
                orphanRow.addCell(labelCell);
                orphanRow.addCell(comboCell);
                advancedMatrixLayout.addRow(orphanRow);

                advancedMatrixLayout.createRow(null);
                //generalMatrixLayout.createRow(null);
                return advancedMatrixLayout;

            },
            getOrderByContainer: function() {
                var that = this;
                var orderByMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["100%"]
                });

                orderByMatrixLayout.createRow(null);


                var orderByTable = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomTable({
                    visibleRowCount: 3,
                    width: "100%",
                    rowSelectionChange: function(event) {
                        if (event.getSource() && event.getSource().getSelectedIndices().length > 0) {
                            deleteIcon.setEnabled(true);
                        } else {
                            deleteIcon.setEnabled(false);
                        }
                    }
                }).addStyleClass("dummyTest10");
                var toolBar = new sap.ui.commons.Toolbar();
                toolBar.addStyleClass("parameterToolbarStyle");
                var createIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        that._execute(new commands.AddSiblingOrderCommand(that.element.name, {
                            byElementName: "",
                            direction: ""
                        }));
                    }
                });
                var deleteIcon = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            } else if (orderByTable.getSelectedIndices().length <= 0) {
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {

                        var deleteCommands = [];
                        var removeSelectionIndices = [];
                        for (var i = 0; i < orderByTable.getSelectedIndices().length; i++) {
                            var bindContext = orderByTable.getContextByIndex(orderByTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var SiblingOrder = bindContext.getProperty("siblingOrder");
                                if (SiblingOrder) {
                                    deleteCommands.push(new modelbase.DeleteCommand(SiblingOrder, false));
                                    removeSelectionIndices.push(orderByTable.getSelectedIndices()[i]);
                                }
                            }
                        }
                        removeSelectionIndices.forEach(function(index){
                            orderByTable.removeSelectionInterval(index,index); 
                        });
                        if (deleteCommands.length > 0) {
                            that._execute(deleteCommands);
                            that.modelChanged();
                        }


                    }
                });

                toolBar.addItem(createIcon);
                toolBar.addItem(deleteIcon);

                orderByTable.setToolbar(toolBar);


                var oImageForOrder = new sap.ui.commons.Image({
                    src: {
                        path: "siblingOrder",
                        formatter: function(siblingOrder) {
                            if (siblingOrder && siblingOrder.byElement) {
                                return that.getIconPath(siblingOrder.byElement);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var orderByCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "90%",
                    canedit: false,
                    icon: oImageForOrder,
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    selectedKey: {
                        path: "siblingOrder",
                        formatter: function(siblingOrder) {
                            if (siblingOrder) {
                                return siblingOrder.byElement ? siblingOrder.byElement.name : "";
                            }
                        }
                    },
                    value: {
                        path: "siblingOrder",
                        formatter: function(siblingOrder) {
                            if (siblingOrder) {
                                return siblingOrder.byElement ? siblingOrder.byElement.name : "";
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var selectedIndex = orderByTable._getFocusedRowIndex() - 1;
                            var siblingOrder = event.getSource().getBindingContext().getProperty("siblingOrder");
                            var selectedIndex = siblingOrder.$getKeyAttributeValue();
                            //that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            if (siblingOrder.byElement === "" || siblingOrder.byElement === undefined) {
                                that._execute(new commands.ChangeSiblingOrderCommand(that.element.name, selectedIndex, {
                                    byElementName: selectedElement.name,
                                    direction: "ASC"
                                }));
                            } else {
                                that._execute(new commands.ChangeSiblingOrderCommand(that.element.name, selectedIndex, {
                                    byElementName: selectedElement.name
                                }));
                            }
                        }
                    }
                }).addStyleClass("noMarginLeft");

                var orderByItem = new sap.ui.core.ListItem();

                orderByItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                orderByItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                orderByItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var orderListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/orderAttributes",
                        template: orderByItem
                    }
                });
                orderByCombo.setListBox(orderListBox);

                /* orderByCombo.bindItems({
                    path: "/orderAttributes",
                    template: orderByItem
                }); */

                var sortDirectionCombo = new sap.ui.commons.ComboBox({
                    width: "100%",
                    selectedKey: {
                        path: "siblingOrder",
                        formatter: function(siblingOrder) {
                            if (siblingOrder) {
                                return siblingOrder.direction;
                            }
                        }
                    },
                    value: {
                        path: "siblingOrder",
                        formatter: function(siblingOrder) {
                            if (siblingOrder) {
                                if (siblingOrder.direction === "ASC") {
                                    return "Ascending";
                                } else if (siblingOrder.direction === "DESC") {
                                    return "Descending";
                                } else {
                                    return "";
                                }
                            }
                        }
                    },
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "siblingOrder"
                        }],
                        formatter: function(isSharedElement, siblingOrder) {
                            if (isSharedElement) {
                                return false;
                            }
                            if (siblingOrder) {
                                return siblingOrder.byElement ? true : false;
                            }
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem) {
                            var selectedElement = selectedItem.getProperty("key");
                            // var selectedIndex = orderByTable._getFocusedRowIndex() - 1;
                            var siblingOrder = event.getSource().getBindingContext().getProperty("siblingOrder");
                            var selectedIndex = siblingOrder.$getKeyAttributeValue();
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeSiblingOrderCommand(that.element.name, selectedIndex, {
                                direction: selectedElement
                            }));
                        }
                    }
                });
                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Descending",
                    key: "DESC"
                }));

                sortDirectionCombo.addItem(new sap.ui.core.ListItem({
                    text: "Ascending",
                    key: "ASC"
                }));

                var orderByColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_order_by")
                    }),
                    template: orderByCombo
                });
                var sortDirectionColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_sort_direction")
                    }),
                    template: sortDirectionCombo
                });



                orderByTable.addColumn(orderByColumn);
                orderByTable.addColumn(sortDirectionColumn);

                orderByTable.bindRows("/siblingOrders");

                orderByMatrixLayout.createRow(orderByTable);

                orderByMatrixLayout.createRow(null);

                return orderByMatrixLayout;

            },
            getTimeAttributes: function() {
                var that = this;
                var timeMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["30%", "70%"]
                });

                timeMatrixLayout.createRow(null);

                var enableTimeDependentCheckBox = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_enable_time_dependency"),
                    // width: "40%",
                    enabled: {
                        path: "isSharedElement",
                        formatter: function(isSharedElement) {
                            if (isSharedElement) {
                                return false;
                            }
                            return true;
                        }
                    },
                    change: function(oevent) {
                        var checked = oevent.getSource().getChecked();
                        if (checked) {
                            that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                                objectAttributes: {
                                    timeDependent: checked,
                                    multipleParents: true,
                                    orphanedNodesHandling: model.OrphanedNodesHandling.IGNORE
                                }
                            }));
                        } else {
                            that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                                objectAttributes: {
                                    timeDependent: checked
                                },
                                timeProperties: {
                                    validFromElementName: "",
                                    validToElementName: "",
                                    fromParameterName: "",
                                    toParameterName: "",
                                    pointInTimeParameterName: ""

                                }
                            }));
                        }
                    }
                }).bindProperty("checked", "/timeDependent").addStyleClass("marginFields");
               var infoLabel =  new sap.ui.commons.Label({
                    icon: resourceLoader.getImagePath("Information.png"),
                    tooltip: resourceLoader.getText("This feature might not work with generic BI clients such as MDX, Advanced Analytics for Office or Design Studio")
                });

                timeMatrixLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [enableTimeDependentCheckBox,infoLabel],
                    colSpan: 2
                }));

                var validFrom = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_valid_from_column"),
                    value: resourceLoader.getText("txt_valid_from_column")
                    //  width:"30%"
                }).addStyleClass("labelFloat");

                var oImageForValidFrom = new sap.ui.commons.Image({
                    src: {
                        path: "validFromElement",
                        formatter: function(validFromElement) {
                            if (validFromElement) {
                                return that.getIconPath(validFromElement);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var validFromCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "60%",
                    canedit: false,
                    // icon:oImageForValidFrom,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    selectedKey: {
                        path: "/validFromElement",
                        formatter: function(validFromElement) {
                            return validFromElement ? validFromElement.name : "";
                        }
                    },
                    value: {
                        path: "/validFromElement",
                        formatter: function(validFromElement) {
                            return validFromElement ? validFromElement.name : "";
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                                timeProperties: {
                                    validFromElementName: selectedElement.name
                                }
                            }));
                        }
                    }
                }).addStyleClass("borderIconCombo");

                var attributeItem = new sap.ui.core.ListItem();

                attributeItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                attributeItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                attributeItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var validFromListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/orderAttributes",
                        template: attributeItem
                    }
                });
                validFromCombo.setListBox(validFromListBox);

                /*validFromCombo.bindItems({
                    path: "/orderAttributes",
                    template: attributeItem
                }); */
                var oImageForValidTo = new sap.ui.commons.Image({
                    src: {
                        path: "validToElement",
                        formatter: function(validToElement) {
                            if (validToElement) {
                                return that.getIconPath(validToElement);
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var validTo = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_valid_to_column"),
                    value: resourceLoader.getText("txt_valid_to_column")
                    //                     width:"20%"
                }).addStyleClass("labelFloat");


                var validToCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "60%",
                    canedit: false,
                    // icon:oImageForValidTo,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    selectedKey: {
                        path: "validToElement",
                        formatter: function(validToElement) {
                            return validToElement ? validToElement.name : "";
                        }
                    },
                    value: {
                        path: "/validToElement",
                        formatter: function(validToElement) {
                            return validToElement ? validToElement.name : "";
                        }
                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        if (selectedItem && selectedItem.getBindingContext()) {
                            var selectedElement = selectedItem.getBindingContext().getProperty("attributeElement");
                            // var levelElement = that.hierarChyModel.getData().levels[selectedIndex] ? that.hierarChyModel.getData().levels[selectedIndex].level : undefined;
                            that._execute(new commands.ChangeHierarchyCommand(that.element.name, {
                                timeProperties: {
                                    validToElementName: selectedElement.name
                                }
                            }));
                        }
                    }
                }).addStyleClass("borderIconCombo");

                var attributeItem1 = new sap.ui.core.ListItem();

                attributeItem1.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                attributeItem1.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }

                });

                attributeItem1.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return resourceLoader.getImagePath("Dimension.png");
                    }
                });
                var validToListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/orderAttributes",
                        template: attributeItem1
                    }
                });
                validToCombo.setListBox(validToListBox);

                /* validToCombo.bindItems({
                    path: "/orderAttributes",
                    template: attributeItem1
                }); */

                var validFromCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [validFromCombo, new sap.ui.commons.Label({
                        width: "5%"
                    }), validTo, validToCombo]
                });

                //                  var validToCell = new sap.ui.commons.layout.MatrixLayoutCell({
                //                      content:[validTo,validToText]
                //                  });

                var validRow = new sap.ui.commons.layout.MatrixLayoutRow();
                validRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [validFrom]
                }));
                validRow.addCell(validFromCell);
                //   validRow.addCell(validToCell);

                // timeMatrixLayout.addRow(validRow);


                timeMatrixLayout.createRow(validFrom, validFromCombo);
                timeMatrixLayout.createRow(validTo, validToCombo);

                this.radioButtonGroup = new sap.ui.commons.RadioButtonGroup({
                    columns: 2,
                    selectedIndex: 0,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    select: function(event) {
                        if (that.radioButtonGroup.getSelectedItem().getText() === resourceLoader.getText("Interval")) {

                            timeMatrixLayout.removeRow(keyDateRow);
                            timeMatrixLayout.addRow(fromDateRow);
                            timeMatrixLayout.addRow(toDateRow);
                        } else {
                            timeMatrixLayout.removeRow(fromDateRow);
                            timeMatrixLayout.removeRow(toDateRow);
                            //                         timeMatrixLayout.removeRow(intervalRow);
                            timeMatrixLayout.addRow(keyDateRow);
                        }
                    }
                }).addStyleClass("radioButtonStyle");
                var constantItem = new sap.ui.core.Item({
                    text: resourceLoader.getText("txt_interval"),
                    tooltip: resourceLoader.getText("txt_interval"),
                    key: resourceLoader.getText("txt_interval")
                });
                this.radioButtonGroup.addItem(constantItem);
                var expressionItem = new sap.ui.core.Item({
                    text: resourceLoader.getText("txt_key_date"),
                    tooltip: resourceLoader.getText("txt_key_date"),
                    key: resourceLoader.getText("txt_key_date")
                });
                this.radioButtonGroup.addItem(expressionItem);

                timeMatrixLayout.createRow(null, this.radioButtonGroup);

                var fromDate = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_from_date_parameter"),
                    value: resourceLoader.getText("txt_from_date_parameter")
                }).addStyleClass("labelFloat");

                var oImageFromParameter = new sap.ui.commons.Image({
                    src: {
                        path: "fromParameter",
                        formatter: function(fromParameter) {
                            if (fromParameter) {
                                return resourceLoader.getImagePath("Parameter.png");
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var fromParameterCombo = new sap.ui.commons.ComboBox({
                    width: "60%",
                    // icon:oImageFromParameter,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    value: {
                        path: "fromParameter",
                        formatter: function(fromParameter) {
                            return fromParameter ? fromParameter.name : "";
                        }
                    },
                    selectedKey: {
                        path: "fromParameter",
                        formatter: function(fromParameter) {
                            return fromParameter ? fromParameter.name : "";
                        }
                    },
                    change: function(oEvent) {
                        var selectedKey = oEvent.getSource().getSelectedKey();
                        var command = new commands.ChangeHierarchyCommand(that.element.name, {
                            timeProperties: {
                                fromParameterName: selectedKey
                            }
                        });
                        that._execute(command);
                    }
                }).addStyleClass("borderIconCombo");
                var fromParameterItem = new sap.ui.core.ListItem();
                fromParameterItem.bindProperty("text", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                fromParameterItem.bindProperty("key", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                fromParameterItem.bindProperty("icon", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return resourceLoader.getImagePath("Parameter.png");
                    }

                });
                var fromParameterListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parameters",
                        template: fromParameterItem
                    }
                });
                fromParameterCombo.setListBox(fromParameterListBox);

                /* fromParameterCombo.bindItems({
                    path: "/parameters",
                    template: fromParameterItem
                }); */


                var fromDateCell = new sap.ui.commons.layout.MatrixLayoutCell();
                //             fromDateCell.addContent(fromDate);
                fromDateCell.addContent(fromParameterCombo);
                // fromDateCell.addContent(fromText);

                var fromDateRow = new sap.ui.commons.layout.MatrixLayoutRow();

                fromDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [fromDate]
                }));
                fromDateRow.addCell(fromDateCell);

                var oImageToParameter = new sap.ui.commons.Image({
                    src: {
                        path: "toParameter",
                        formatter: function(toParameter) {
                            if (toParameter) {
                                return resourceLoader.getImagePath("Parameter.png");
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var toDate = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_to_date_parameter"),
                    value: resourceLoader.getText("txt_to_date_parameter")
                }).addStyleClass("labelFloat");



                var toParameterCombo = new sap.ui.commons.ComboBox({
                    width: "60%",
                    // icon:oImageToParameter,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    value: {
                        path: "toParameter",
                        formatter: function(toParameter) {
                            return toParameter ? toParameter.name : "";
                        }
                    },
                    selectedKey: {
                        path: "toParameter",
                        formatter: function(toParameter) {
                            return toParameter ? toParameter.name : "";
                        }
                    },
                    change: function(oEvent) {
                        var selectedKey = oEvent.getSource().getSelectedKey();
                        var command = new commands.ChangeHierarchyCommand(that.element.name, {
                            timeProperties: {
                                toParameterName: selectedKey
                            }
                        });
                        that._execute(command);
                    }
                }).addStyleClass("borderIconCombo");
                var toParameterItem = new sap.ui.core.ListItem();
                toParameterItem.bindProperty("text", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                toParameterItem.bindProperty("key", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                toParameterItem.bindProperty("icon", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return resourceLoader.getImagePath("Parameter.png");
                    }

                });
                var toParameterListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parameters",
                        template: toParameterItem
                    }
                });
                toParameterCombo.setListBox(toParameterListBox);
                /* toParameterCombo.bindItems({
                    path: "/parameters",
                    template: toParameterItem
                }); */

                var toDateCell = new sap.ui.commons.layout.MatrixLayoutCell();
                //             toDateCell.addContent(toDate);
                toDateCell.addContent(toParameterCombo);
                var toDateRow = new sap.ui.commons.layout.MatrixLayoutRow();

                toDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [toDate]
                }));

                toDateRow.addCell(toDateCell);

                var intervalRow = new sap.ui.commons.layout.MatrixLayoutRow();
                //             intervalRow.addCell(fromDateCell);
                //             intervalRow.addCell(toDateCell);

                var keyDate = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_key_date_parameter")
                    // width: "30%"
                }).addStyleClass("labelFloat");

                var oImageKeyDateParameter = new sap.ui.commons.Image({
                    src: {
                        path: "pointInTimeParameter",
                        formatter: function(pointInTimeParameter) {
                            if (pointInTimeParameter) {
                                return resourceLoader.getImagePath("Parameter.png");
                            }
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });

                var keyDateParameterCombo = new sap.ui.commons.ComboBox({
                    width: "60%",
                    // icon:oImageKeyDateParameter,
                    enabled: {
                        parts: [{
                            path: "isSharedElement"
                        }, {
                            path: "timeDependent"
                        }],
                        formatter: function(isSharedElement, timeDependent) {
                            if (isSharedElement) {
                                return false;
                            } else if (timeDependent) {
                                return true;
                            }
                            return false;
                        }
                    },
                    value: {
                        path: "pointInTimeParameter",
                        formatter: function(pointInTimeParameter) {
                            return pointInTimeParameter ? pointInTimeParameter.name : "";
                        }
                    },
                    selectedKey: {
                        path: "pointInTimeParameter",
                        formatter: function(pointInTimeParameter) {
                            return pointInTimeParameter ? pointInTimeParameter.name : "";
                        }
                    },
                    change: function(oEvent) {
                        var selectedKey = oEvent.getSource().getSelectedKey();
                        var command = new commands.ChangeHierarchyCommand(that.element.name, {
                            timeProperties: {
                                pointInTimeParameterName: selectedKey
                            }
                        });
                        that._execute(command);
                    }
                }).addStyleClass("borderIconCombo");
                var keyParameterItem = new sap.ui.core.ListItem();
                keyParameterItem.bindProperty("text", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                keyParameterItem.bindProperty("key", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return parameter ? parameter.name : "";
                    }

                });

                keyParameterItem.bindProperty("icon", {
                    path: "parameter",
                    formatter: function(parameter) {
                        return resourceLoader.getImagePath("Parameter.png");
                    }

                });
                var keyParameterListBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/parameters",
                        template: keyParameterItem
                    }
                });
                keyDateParameterCombo.setListBox(keyParameterListBox);

                /*  keyDateParameterCombo.bindItems({
                    path: "/parameters",
                    template: keyParameterItem
                }); */

                var keyDateRow = new sap.ui.commons.layout.MatrixLayoutRow();
                keyDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [keyDate]
                }));
                keyDateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [keyDateParameterCombo]
                }));

                timeMatrixLayout.addRow(fromDateRow);
                timeMatrixLayout.addRow(toDateRow);

                return timeMatrixLayout;
            },
            getFinalAggregationContainer: function() {
                var that = this;
                var finalAggregationMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["30%", "70%"]
                });

                finalAggregationMatrixLayout.createRow(null);

                var enableFilterAggregation = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_enable_filter_aggregation"),
                    // width: "40%",
                    change: function(oevent) {

                    }
                });
                var enableFilterAggreCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [enableFilterAggregation],
                    colSpan: 2
                });

                finalAggregationMatrixLayout.createRow(enableFilterAggreCell);


                var filterColumn = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_group_filter_column"),
                    value: resourceLoader.getText("txt_group_filter_column")
                    //  width:"30%"
                }).addStyleClass("labelFloat");

                var filterText = new sap.ui.commons.TextField();

                var expressionParameter = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_expression_parameter"),
                    value: resourceLoader.getText("txt_expression_parameter")
                    //  width:"30%"
                }).addStyleClass("labelFloat");

                var expressionText = new sap.ui.commons.TextField();
                finalAggregationMatrixLayout.createRow(filterColumn, filterText);
                finalAggregationMatrixLayout.createRow(expressionParameter, expressionText);
                return finalAggregationMatrixLayout;

            },
            getIconPath: function(element, entity) {
                if (element) {
                    var aggregationBehavior = element.aggregationBehavior;
                    if (aggregationBehavior) {
                        if (aggregationBehavior === model.AggregationBehavior.NONE) {
                            if (entity && entity.type === "DATA_BASE_TABLE") {
                                return resourceLoader.getImagePath("Table.png");
                            } else {
                                if (element.calculationDefinition)
                                    return resourceLoader.getImagePath("Calculated_Attribute.png");
                                return resourceLoader.getImagePath("Dimension.png");
                            }
                        } else if (aggregationBehavior === model.AggregationBehavior.SUM || aggregationBehavior === model.AggregationBehavior.MIN || aggregationBehavior === model.AggregationBehavior.MAX || aggregationBehavior === model.AggregationBehavior.COUNT || aggregationBehavior === model.AggregationBehavior.FORMULA) {
                            if (element.measureType === model.MeasureType.CALCULATED_MEASURE) {
                                return resourceLoader.getImagePath("CalculatedMeasure.png");
                            } else if (element.measureType === model.MeasureType.RESTRICTION) {
                                return resourceLoader.getImagePath("RestrictedMeasure.png");
                            } else if (element.measureType === model.MeasureType.COUNTER) {
                                return resourceLoader.getImagePath("counter_scale.png");
                            }
                            return resourceLoader.getImagePath("Measure.png");
                        } else {
                            return resourceLoader.getImagePath("Table.png");
                        }
                    }
                }
                return resourceLoader.getImagePath("Table.png");
            },
            isBasedOnElementProxy: function(element, columnView, viewNode) {
                if (element) {
                    var results = CalcViewEditorUtil.isBasedOnElementProxy({
                        object: element,
                        columnView: columnView,
                        viewNode: viewNode
                    });
                    if (results) {
                        return true;
                    }
                }
                return false;
            }


        };

        return HierarchiesDetails;
    });
