/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/galilei"], function() {
    "use strict";
    var TRANSPARENT_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
    sap.galilei.model.metamodel("Sap.Hana.Ide.Analytics.Join", {
        contents: {
            /**
             * Sap.Hana.Ide.Analytics.Join.Model definition
             */
            "Sap.Hana.Ide.Analytics.Join.Model": {
                name: "Sap.Hana.Ide.Analytics.Join",
                classDefinition: "sap.galilei.model.Package",
                displayName: "Sap Hana Ide Analytics Join Model",
                namespaceName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram",
                classifiers: {
                    /**
                     * @class
                     * Table
                     */
                    "Table": {
                        displayName: "Table",
                        parent: "sap.galilei.common.NamedObject",
                        properties: {
                            isDataSource: {
                                defaultValue: false
                            },
                            firstPartitionString:{
                                dataType: sap.galilei.model.dataTypes.gString
                            },
                            secondPartitionString:{
                                dataType: sap.galilei.model.dataTypes.gString
                            },
                            search: {
								defaultValue: ""
							}
                        },
                        references: {
                            "Table.Columns": {
                                name: "columns",
                                contentType: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Column",
                                isMany: true,
                                isContainment: true
                            }
                        }
                    },
                    /**
                     * @class
                     * Column
                     */
                    "Column": {
                        displayName: "Column",
                        parent: "sap.galilei.common.NamedObject",
                        properties: {
                            "Column.label": {
                                name: "label",
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: undefined
                            },
                            "Column.dataTypeIcon": {
                                name: "dataTypeIcon",
                                dataType: sap.galilei.model.dataTypes.gString
                            },
                            "Column.firstPartitionIcon": {
                                name: "firstPartitionIcon",
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: TRANSPARENT_IMG
                            },
                            "Column.firstPartitionString": {
                                name: "firstPartitionString",
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: undefined
                            },
                            "Column.secondPartitionIcon": {
                                name: "secondPartitionIcon",
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: TRANSPARENT_IMG
                            },
                            "Column.secondPartitionString": {
                                name: "secondPartitionString",
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: undefined
                            },
                            "Column.hover": {
                                name: "hover",
                                dataType: sap.galilei.model.dataTypes.gBoolean,
                                defaultValue: false
                            }
                        }
                    },
                    /**
                     * @class
                     * Join
                     */
                    "Join": {
                        displayName: "Join",
                        parent: "sap.galilei.common.LinkObject",
                        properties: {
                            sourceColumn: {
                                get: function() {
                                    return this.source;
                                },
                                set: function(oSource) {
                                    this.source = oSource;
                                }
                            },
                            targetColumn: {
                                get: function() {
                                    return this.target;
                                },
                                set: function(oSource) {
                                    this.target = oSource;
                                }
                            },
                            sourceTable: {
                                get: function() {
                                    return this.source && this.source.container;
                                }
                            },
                            targetTable: {
                                get: function() {
                                    return this.target && this.target.container;
                                }
                            },
                            joinCardinality: {
                                dataType: sap.galilei.model.dataTypes.gString
                            },
                            joinType: {
                                dataType: sap.galilei.model.dataTypes.gString,
                                defaultValue: "referential"
                            },
                            showWarning: {
                                defaultValue: false
                            },
                            proposedCardinality:{
                                dataType: sap.galilei.model.dataTypes.gString
                            },
                            referentialIntegrity:{
                                dataType: sap.galilei.model.dataTypes.gString
                            }
                        }
                    },
                    /**
                     * @class
                     * Model
                     */
                    "Model": {
                        displayName: "Model",
                        parent: "sap.galilei.common.Model",
                        references: {
                            "Model.tables": {
                                name: "tables",
                                contentType: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Table",
                                isMany: true,
                                isContainment: true
                            },
                            "Model.joins": {
                                name: "joins",
                                contentType: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Join",
                                isMany: true,
                                isContainment: true
                            }
                        }
                    }

                }
            }
        }
    });
    // Load all metamodels defined
    sap.galilei.model.loadMetamodels();
});
