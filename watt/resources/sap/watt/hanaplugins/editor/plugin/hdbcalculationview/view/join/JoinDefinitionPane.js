/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../dialogs/SpatialJoinValueHelpDialog",
        "./JoinDetails"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, SpatialJoinValueHelpDialog, JoinDetails) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var JoinDefinitionPane = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.viewNode = parameters.viewNode;
            this._model = parameters.model;
            this.mainLayout = null;
            this.dataModel = new sap.ui.model.json.JSONModel();
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.CHANGED, this.updateProperties, this);
            this.joinDetails;
        };

        JoinDefinitionPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.CHANGED, this.updateProperties, this);
                }
                if (this.dataModel) {
                    this.dataModel.destroy();
                }
                if (this.joinDetails) {
                    this.joinDetails.close();
                }
            },

            getContent: function() {
                var that = this;

                this.joinDetails = new JoinDetails({
                    undoManager: this._undoManager,
                    viewNode: this.viewNode
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
                        that.mainLayout.setSplitterPosition("60%");
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

                var toolbar = new sap.ui.commons.Toolbar();
                // set standalone false, flat design and fixed width
                toolbar.setStandalone(false);

                toolbar.addItem(propertyLabel);
                toolbar.addRightItem(imageButton);

                var propertyLayout = new sap.ui.layout.VerticalLayout({
                    content: [toolbar, this.getPropertiesContent()]
                });

                setTimeout(function() {
                    $("#" + propertyLabel.sId).click(toggleFunction);
                }, 1000);

                propertyLayout.addStyleClass("joinPropertyCustom");

                this.mainLayout = new sap.ui.commons.Splitter({
                    splitterOrientation: sap.ui.commons.Orientation.horizontal,
                    splitterPosition: "60%",
                    //minSizeSecondPane: "30px",
                    firstPaneContent: this.joinDetails.getContent(),
                    secondPaneContent: propertyLayout
                });
                this.mainLayout.addStyleClass("joinPane");

                this.updateProperties();

                return this.mainLayout;
            },

            getPropertiesContent: function() {
                var that = this;

                var propertiesLayout = new sap.ui.commons.layout.VerticalLayout();
                propertiesLayout.setModel(this.dataModel);

                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: true,
                    widths: ["5%", "15%", "30%", "15%", "30%", "5%"]
                });

                var leftInputLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_left_input"),
                }).addStyleClass("labelFloat");
                var leftInputField = new sap.ui.commons.TextField({
                    width: "90%",
                    enabled: false,
                    value: "{leftInput}",
                });
                var rightInputLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_right_input"),
                }).addStyleClass("labelFloat");
                var rightInputField = new sap.ui.commons.TextField({
                    width: "90%",
                    enabled: false,
                    value: "{rightInput}",
                });

                mLayout.createRow(null, leftInputLabel, leftInputField, rightInputLabel, rightInputField, null);

                var joinTypeLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_join_type"),
                }).addStyleClass("labelFloat");

                var joinTypeListItem = new sap.ui.core.ListItem();
                joinTypeListItem.bindProperty("text", "joinType");
                joinTypeListItem.bindProperty("key", "key");

                var joinTypeField = new sap.ui.commons.DropdownBox({
                    width: "90%",
                    selectedKey: "{joinType}",
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        var attributes = {
                            objectAttributes: {
                                joinType: selecetdKey
                            }
                        };
                        if (selecetdKey === "textTable") {
                            attributes.objectAttributes.cardinality = "C1_1";
                            //var rightInput = "{rightInput}";
                        } else {
                            attributes.objectAttributes.languageColumn = undefined;
                        }
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);

                    },
                    enabled: {
                        parts: ["join", "isSpatialJoin"],
                        formatter: function(join, isSpatialJoin) {
                            if (join && join !== null && !isSpatialJoin) {
                                return true;
                            }
                            return false;
                        }
                    }
                });

                joinTypeField.bindItems({
                    path: "/joinTypes",
                    template: joinTypeListItem
                });

                var cardinalityLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_cardinality"),
                }).addStyleClass("labelFloat");

                var cardinalityTypeListItem = new sap.ui.core.ListItem();
                cardinalityTypeListItem.bindProperty("text", "cardinalityType");
                cardinalityTypeListItem.bindProperty("key", "key");
                var cardinalityField = new sap.ui.commons.DropdownBox({
                    width: "90%",
                    selectedKey: "{cardinality}",
                    enabled: {
                        parts: ["joinType", "join"],
                        formatter: function(joinType, join) {
                            if (join && join !== null && joinType !== "textTable") {
                                return true;
                            }
                            return false;
                        }
                    },
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        if (selecetdKey === "NONE") {
                            selecetdKey = undefined;
                        }
                        var attributes = {
                            objectAttributes: {
                                cardinality: selecetdKey
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);

                    },

                });

                cardinalityField.bindItems({
                    path: "/cardinalityTypes",
                    template: cardinalityTypeListItem
                });

                mLayout.createRow(null, joinTypeLabel, joinTypeField, cardinalityLabel, cardinalityField);

                this.dynamicJoinCB = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_dynamic_join"),
                    tooltip: resourceLoader.getText("txt_dynamic_join"),
                    checked: "{dynamic}",
                    change: function(event) {
                        var checked = event.getSource().getChecked();
                        var attributes = {
                            objectAttributes: {
                                dynamic: checked
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    },
                    enabled: {
                        path: "join",
                        formatter: function(join) {
                            if (join) {
                                if (join.leftElements.count() > 1) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }
                });

                var languageColumnLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_language_column"),
                }).addStyleClass("labelFloat");

                var languageColumnListItem = new sap.ui.core.ListItem();
                languageColumnListItem.bindProperty("text", "name");
                languageColumnListItem.bindProperty("key", "name");

                var languageColumnField = new sap.ui.commons.DropdownBox({
                    width: "90%",
                    selectedKey: "{languageColumn}",
                    enabled: {
                        path: "joinType",
                        formatter: function(joinType) {
                            return joinType === "textTable";
                        }
                    },
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        if (selecetdKey === "") {
                            selecetdKey = undefined;
                        }
                        var attributes = {
                            objectAttributes: {
                                languageColumn: selecetdKey
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);

                    },
                });
                languageColumnField.bindItems({
                    path: "/languageColumns",
                    template: languageColumnListItem
                });

                mLayout.createRow(null, null, this.dynamicJoinCB, languageColumnLabel, languageColumnField);

                var optimizeJoinColumnsCB = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_optimize_join_columns"),
                    tooltip: resourceLoader.getText("txt_optimize_join_columns"),
                    checked: "{optimizeJoinColumns}",
                    change: function(event) {
                        var checked = event.getSource().getChecked();
                        var attributes = {
                            objectAttributes: {
                                optimizeJoinColumns: checked
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    },
                    enabled: {
                        path: "join",
                        formatter: function(join) {
                            if (join) {
                                return true;
                            }
                            return false;
                        }
                    }
                });

                mLayout.createRow(null, null, optimizeJoinColumnsCB);

                mLayout.createRow(null);

                propertiesLayout.addContent(mLayout);
                propertiesLayout.addContent(this.getSpatialPropertiesContent());

                propertiesLayout.addStyleClass("customProperties");

                return propertiesLayout;
            },

            getSpatialPropertiesContent: function() {
                var that = this;
                this.spatialPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
                headMatrixLayout.addStyleClass("headerHeight");
                var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    vAlign: sap.ui.commons.layout.VAlign.Begin,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }).addStyleClass("parameterHeaderStyle");

                var headerName = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_join_properties"),
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
                    width: "10px"
                }));
                headerMatrixLayoutCell.addContent(headerName);

                headMatrixLayout.createRow(headerMatrixLayoutCell);

                this.spatialPropertiesLayout.addContent(headMatrixLayout);

                var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: true,
                    widths: ["5%", "15%", "30%", "15%", "30%", "5%"]
                });

                matrixLayout.createRow(null);

                var predicateLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_predicate")
                }).addStyleClass("labelFloat");

                var predicateTypeListItem = new sap.ui.core.ListItem({});
                predicateTypeListItem.bindProperty("text", "predicateType");
                predicateTypeListItem.bindProperty("key", "key");

                var predicateField = new sap.ui.commons.DropdownBox({
                    width: "90%",
                    selectedKey: "{predicate}",
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();
                        var attributes = {
                            spatialJoinAttributes: {
                                properties: {
                                    predicate: selecetdKey
                                }
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    }
                });

                predicateField.bindItems({
                    path: "/predicateTypes",
                    template: predicateTypeListItem
                });

                var validateDistance = function(value) {
                    var pattern = /^[-+]?[0-9]*\.?[0-9]+$/;
                    return pattern.test(value);
                };

                var distanceLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_distance"),
                }).addStyleClass("labelFloat");
                var distanceField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "{distance}",
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        if (validateDistance(value)) {
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            var attributes = {
                                spatialJoinAttributes: {
                                    distance: {
                                        value: value
                                    }
                                }
                            };
                            var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                            that._execute(command);
                        } else {
                            CalcViewEditorUtil.showErrorMessageTooltip(this, resourceLoader.getText("msg_invalid_distance"));
                        }
                    },
                    enabled: {
                        path: "predicate",
                        formatter: function(predicate) {
                            return predicate === "WITHIN_DISTANCE";
                        }
                    },
                });

                matrixLayout.createRow(null, predicateLabel, predicateField, distanceLabel, distanceField, null);

                /*var predicateEvaluatesCB = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_spatial_predicate_evaluates"),
                    tooltip: resourceLoader.getText("txt_spatial_predicate_evaluates"),
                    checked: "{predicateEvaluatesTo}",
                    change: function(event) {
                        var checked = event.getSource().getChecked();
                        var attributes = {
                            spatialJoinAttributes: {
                                properties: {
                                    predicateEvaluatesTo: checked
                                }
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    }
                });*/

                var predicateEvaluatesLabel1 = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_predicate_evaluates_part_1")
                }).addStyleClass("labelFloat");
                var predicateEvaluatesLabel2 = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_predicate_evaluates_part_2")
                }).addStyleClass("labelFloat");
                var predicateEvaluatesCombo = new sap.ui.commons.DropdownBox({
                    width: "90%",
                    //value: resourceLoader.getText("txt_attribute"),
                    selectedKey: "{predicateEvaluatesTo}",
                    change: function(event) {
                        var selecetdKey = event.getSource().getSelectedKey();

                        var attributes = {
                            spatialJoinAttributes: {
                                properties: {
                                    predicateEvaluatesTo: selecetdKey
                                }
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    }
                });
                predicateEvaluatesCombo.addItem(new sap.ui.core.ListItem({
                    text: resourceLoader.getText("txt_true"),
                    key: true
                }));

                predicateEvaluatesCombo.addItem(new sap.ui.core.ListItem({
                    text: resourceLoader.getText("txt_false"),
                    key: false
                }));

                var validateIntersectionMatrix = function(value) {
                    var pattern = /[TF*012]$/;
                    return pattern.test(value) && value.length === 9;
                };

                var intersectionMatrixLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_spatial_intersection_matrix"),
                }).addStyleClass("labelFloat");
                var intersectionMatrixField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "{intersectionMatrix}",
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        if (validateIntersectionMatrix(value)) {
                            CalcViewEditorUtil.clearErrorMessageTooltip(this);
                            var attributes = {
                                spatialJoinAttributes: {
                                    intersectionMatrix: {
                                        value: value
                                    }
                                }
                            };
                            var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                            that._execute(command);
                        } else {
                            CalcViewEditorUtil.showErrorMessageTooltip(this, resourceLoader.getText("msg_invalid_intersection_matrix"));
                        }
                    },
                    enabled: {
                        path: "predicate",
                        formatter: function(predicate) {
                            return predicate === "RELATE";
                        }
                    },
                });

                matrixLayout.createRow(null, predicateEvaluatesLabel1, predicateEvaluatesCombo, intersectionMatrixLabel, intersectionMatrixField);

                matrixLayout.createRow(null, predicateEvaluatesLabel2);

                this.spatialPropertiesLayout.addContent(matrixLayout);

                return this.spatialPropertiesLayout;
            },

            createModel: function() {
                var that = this;
                var model;
                var joinTypes;
                var cardinalityTypes;
                var predicateTypes;
                var languageColumns = [];
                var leftInput;
                var rightInput;
                var spatialJoinProperties;


                var join;
                if (this.viewNode.joins) {

                    this.viewNode.joins.foreach(function(joinObject) {
                        join = joinObject;
                    });
                }
                if (join) {

                    if (join.spatialJoinProperties && join.spatialJoinProperties.count() > 0) {
                        spatialJoinProperties = join.spatialJoinProperties.get(0);
                    }

                    joinTypes = [{
                        joinType: resourceLoader.getText("txt_inner_join"),
                        key: "inner"
                    }, {
                        joinType: resourceLoader.getText("txt_left_outer"),
                        key: "leftOuter"
                    }, {
                        joinType: resourceLoader.getText("txt_right_outer"),
                        key: "rightOuter"
                    }, {
                        joinType: resourceLoader.getText("txt_text_join"),
                        key: "textTable"
                    }];

                    cardinalityTypes = [{
                        cardinalityType: "",
                        key: "NONE"
                    }, {
                        cardinalityType: "1..1",
                        key: "C1_1"
                    }, {
                        cardinalityType: "1..n",
                        key: "C1_N"
                    }, {
                        cardinalityType: "n..1",
                        key: "CN_1"
                    }, {
                        cardinalityType: "n..m",
                        key: "CN_N"
                    }];

                    if (spatialJoinProperties) {
                        predicateTypes = [{
                            predicateType: resourceLoader.getText("txt_spatial_predicate_contains"),
                            key: "CONTAINS"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_covered_by"),
                            key: "COVERED_BY"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_covers"),
                            key: "COVERS"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_crosses"),
                            key: "CROSSES"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_disjoint"),
                            key: "DISJOINT"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_equals"),
                            key: "EQUALS"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_intersects"),
                            key: "INTERSECTS"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_overlaps"),
                            key: "OVERLAPS"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_relate"),
                            key: "RELATE"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_touches"),
                            key: "TOUCHES"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_within"),
                            key: "WITHIN"
                        }, {
                            predicateType: resourceLoader.getText("txt_spatial_predicate_within_distance"),
                            key: "WITHIN_DISTANCE"
                        }];
                    }

                    if (this.viewNode.inputs._keys.length === 2) {
                        leftInput = join.leftInput;
                        rightInput = join.rightInput;
                        if (join.joinType === "textTable") {
                            languageColumns.push({
                                name: ""
                            });
                            rightInput.getSource().elements.foreach(function(element) {
                                languageColumns.push({
                                    name: element.name
                                });
                            });
                        }
                    }

                    model = {
                        join: join,
                        leftInput: leftInput ? CalcViewEditorUtil.getInputName(leftInput) : null,
                        rightInput: rightInput ? CalcViewEditorUtil.getInputName(rightInput) : null,
                        cardinality: join.cardinality ? join.cardinality : "NONE",
                        joinType: join.joinType,
                        joinTypes: joinTypes,
                        cardinalityTypes: cardinalityTypes,
                        predicateTypes: predicateTypes,
                        languageColumns: languageColumns,
                        languageColumn: join.languageColumn,
                        dynamic: join.dynamic,
                        optimizeJoinColumns: join.optimizeJoinColumns,
                        predicate: spatialJoinProperties ? spatialJoinProperties.predicate : undefined,
                        distance: spatialJoinProperties && spatialJoinProperties.distance ? spatialJoinProperties.distance.value : undefined,
                        intersectionMatrix: spatialJoinProperties && spatialJoinProperties.intersectionMatrix ? spatialJoinProperties.intersectionMatrix.value : undefined,
                        predicateEvaluatesTo: spatialJoinProperties ? spatialJoinProperties.predicateEvaluatesTo : undefined,
                        isSpatialJoin: spatialJoinProperties ? true : false
                    };

                    if (this.dynamicJoinCB) {
                        if (join.leftElements.count() > 1) {
                            this.dynamicJoinCB.setEnabled(true);
                        } else {
                            this.dynamicJoinCB.setEnabled(false);
                        }
                    }
                }

                if (this.spatialPropertiesLayout) {
                    if (spatialJoinProperties) {
                        this.spatialPropertiesLayout.setVisible(true);
                    } else {
                        this.spatialPropertiesLayout.setVisible(false);
                    }

                }

                return model;
            },

            updateProperties: function() {
                this.dataModel.setData(this.createModel());
                this.dataModel.updateBindings();
            },
        };

        return JoinDefinitionPane;

    });
