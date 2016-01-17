/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./galilei"], function() {
	"use strict";
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
	sap.galilei.model.metamodel("Sap.Hana.Ide.CDS", {
		contents: {
			/**
			 * Sap.Hana.Ide.CDS.Model definition
			 */
			"Sap.Hana.Ide.CDS.Model": {
				name: "Sap.Hana.Ide.CDS",
				classDefinition: "sap.galilei.model.Package",
				displayName: "Sap Hana Ide CDS Model",
				namespaceName: "sap.watt.hanaplugins.editor.plugin.cds.diagram",
				classifiers: {
					/**
					 * @class GalileiModel
					 */
					"GalileiModel": {
						displayName: "Galilei Model",
						parent: "sap.galilei.common.Model"
					},
					/**
					 * @class View
					 */
					"View": {
						displayName: "View",
						properties: {
							cdsObject: {
								defaultValue: undefined
							}
						}
					},
					/**
					 * @class Context
					 */
					"Context": {
						displayName: "Context",
						properties: {
							cdsObject: {
								defaultValue: undefined
							}
						},
						references: {
							"Context.Columns": {
								name: "columns",
								contentType: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Child",
								isMany: true,
								isContainment: true
							}
						}
					},
					
					/**
					 * @class Structure
					 */
					"Structure": {
						displayName: "Structure",
						properties: {
							cdsObject: {
								defaultValue: undefined
							}
						},
						references: {
							"Structure.Columns": {
								name: "columns",
								contentType: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Child",
								isMany: true,
								isContainment: true
							}
						}
					},
					
					/**
					 * @class
					 * Child
					 */
					"Child": {
						displayName: "Child",
						parent: "sap.galilei.common.NamedObject",
						properties: {
							"Column.typeIcon": {
								name: "dataTypeIcon",
								dataType: sap.galilei.model.dataTypes.gString
							}
						}
					},
					/**
					 * @class
					 * Entity
					 */
					"Entity": {
						displayName: "Entity",
						//parent: "sap.galilei.common.NamedObject",
						properties: {
							cdsObject: {
								defaultValue: undefined
							},
							isDataSource: {
								defaultValue: false
							},
							firstPartitionString: {
								dataType: sap.galilei.model.dataTypes.gString
							},
							secondPartitionString: {
								dataType: sap.galilei.model.dataTypes.gString
							}
						},
						references: {
							"Entity.Columns": {
								name: "columns",
								contentType: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Column",
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
							cdsObject: {
								defaultValue: undefined
							},
							"Column.label": {
								name: "label",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: undefined
							},
							"Column.dataTypeIcon": {
								name: "dataTypeIcon",
								dataType: sap.galilei.model.dataTypes.gString
							},
							"Column.keyIcon": {
								name: "keyIcon",
								dataType: sap.galilei.model.dataTypes.gString,
								defaultValue: TRANSPARENT_IMG
							}
							/* "Column.firstPartitionString": {
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
                            }*/
						}
					},
					/**
					 * @class
					 * Association
					 */
					"Association": {
						displayName: "Association",
						//parent: "sap.galilei.common.LinkObject",
						properties: {
							cdsObject: {
								defaultValue: undefined
							},
							source: {
								defaultValue: undefined
							},
							target: {
								defaultValue: undefined
							},
							sourceEntity: {
								defaultValue: undefined
							},
							cardinality: {
								dataType: sap.galilei.model.dataTypes.gString
							},
							srcCardinality: {
								dataType: sap.galilei.model.dataTypes.gString
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