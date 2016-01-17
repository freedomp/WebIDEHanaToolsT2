/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/common", "../base/XmlWriter", "../sharedmodel/sharedmodel", "./model", "../base/FullQualifiedName"],
    function(common, XmlWriter, sharedmodel, model, FullQualifiedName) {
        "use strict";

        var mapClient = function(value, fixedClient) {
            if (value && fixedClient !== undefined) {
                return fixedClient;
            } else {
                return value ? "$$client$$" : "crossClient";
            }
        };

        var getElementMappingForElement = function(elementName, cvInput) {
            var mapping;
            for (var i = 0; i < cvInput.mappings.count(); i++) {
                mapping = cvInput.mappings.getAt(i);
                if (mapping.targetElement.name === elementName) {
                    return mapping;
                }
            }
            return mapping;
        };

        var getParameterFromColumnView = function(columnView, name) {
            /*if (name.charAt(0) === "#") {
                name = name.substring(1);
            }*/            
            if(columnView.schemaVersion < 3.0){
            	if (name.charAt(0) === "#") {
                    name = name.substring(1);
                }
        	}
            
            if (columnView.parameters !== null && columnView.parameters !== undefined) {
                var foundParameter = columnView.parameters.get(name);
                if (foundParameter !== null && foundParameter !== undefined) {
                    return foundParameter;
                }
            }
            return null;
        };

        // : new method to get AttributeMapping by comparing source name; special method for processJoinNode();
        var getCVAttributeMappingForJoinAttrComparingSourceName = function(element, cvInput) {
            // var localMapping;
            // var that = this;
            /*cvInput.mappings.foreach(function(mapping) {
                    if (mapping.sourceName === cvJoinAttrName.name) {
                        return mapping;
                    } 
            });*/
            //TODO: try to do foreach anonymous function way
            var mappings = cvInput.mappings.toArray();
            for (var i = 0; i < mappings.length; i++) {
                /*if (mappings[i].sourceName === cvJoinAttrName.name) {
                    return mappings[i];
                }*/
                if (mappings[i].sourceElement.name === element.name) {
                    return mappings[i];
                }
            }
            // return that.localMapping;
        };

        var RepositoryXmlRendererHelper = {
            
            isPrivateElement: function(element){
                var elementContainer = element.$getContainer();
                if(elementContainer instanceof model.ViewNode){
                    return true;
                }else if(elementContainer instanceof model.Entity){
                     return false;
                }
            },
            
            getResourceUri: function(entity){
                var entityType = entity.type;
                //: Map EntityType To ResourceType ToBe Used In Resource URI
                var typeUsedToCreateResourceUri = RepositoryXmlRendererHelper.mapEntityTypeToResourceTypeToBeUsedInResourceURI(entityType);
                var fqName = FullQualifiedName.createForRepositoryObject(entity.packageName, entity.name, typeUsedToCreateResourceUri);
                var resourceUri = fqName.getResourceUri();
                return resourceUri;
            },
            
            deriveElementOriginalName: function(element){
                var sharedElementName = element.name;
                var dotLastIndexOf = sharedElementName.lastIndexOf(".");
                if(dotLastIndexOf > -1){
                    var originalElementName = sharedElementName.substring(++dotLastIndexOf, sharedElementName.length);
                    return originalElementName;
                }else{
                    return sharedElementName;
                }
            },
            
            prepareSharedElementAttributes: function(element, resourceUriOrDimensionUri, nameOrAtrributeName) {
            	var fixedTypeOfElementAttributes = [];
                var isPrivateElement = this.isPrivateElement(element);
                if(!isPrivateElement){
                   var originalElementName = this.deriveElementOriginalName(element);           
                   var  resourceUri = this.getResourceUri(element.$getContainer());
                	fixedTypeOfElementAttributes.push({
                		name: nameOrAtrributeName,
                		value: originalElementName
                	});
                	fixedTypeOfElementAttributes.push({
                		name: resourceUriOrDimensionUri,
                		value: resourceUri
                	});
                }else{
                	fixedTypeOfElementAttributes.push({
                		name: nameOrAtrributeName,
                		value: element.name
                	});
                }
            	return fixedTypeOfElementAttributes;
            },

            processColumnViewBasicProperties: function(model, defaultNode, fixedValues) {
                if (model.columnView.schemaVersion !== undefined) {
                    fixedValues.push({
                        name: "schemaVersion",
                        //value: model.columnView.schemaVersion
                        value: "3.0"
                    });
                } else {
                    //Code to add current suported schemaVersion
                    fixedValues.push({
                        name: "schemaVersion",
                        //value: "2.3"
                        value: "3.0"
                    });
                }

                var defaultClient = mapClient(model.columnView.clientDependent, model.columnView.fixedClient);

                fixedValues.push({
                    name: "defaultClient",
                    value: defaultClient
                });

                if (model.columnView.dataCategory === 'CUBE') {
                    fixedValues.push({
                        name: "visibility",
                        value: "reportingEnabled"
                    });
                } else {
                    fixedValues.push({
                        name: "visibility",
                        value: "internal"
                    });
                }

                if (model.columnView.historyEnabled) {
                    fixedValues.push({
                        name: "historyEnabled",
                        value: model.columnView.historyEnabled
                    });
                }
                
                if (model.columnView.deprecated) {
                    fixedValues.push({
                        name: "deprecated",
                        value: model.columnView.deprecated
                    });
                }
                
                if (model.columnView.translationRelevant === false) {
                    fixedValues.push({
                        name: "translationRelevant",
                        value: model.columnView.translationRelevant
                    });
                }

                if (!defaultNode.isJoinNode() && !defaultNode.isScriptNode()) {
                    fixedValues.push({
                        name: "outputViewType",
                        value: defaultNode.type
                    });
                }

                if (defaultNode.isScriptNode()) {
                    fixedValues.push({
                        name: "calculationScenarioType",
                        value: "SCRIPT_BASED"
                    });
                } else {
                    fixedValues.push({
                        name: "calculationScenarioType",
                        value: "TREE_BASED"
                    });
                }

                if (defaultNode.isScriptNode() && model.columnView.scriptParametersCaseSensitive) {
                    fixedValues.push({
                        name: "scriptParametersCaseSensitive",
                        value: "true"
                    });
                } else if (defaultNode.isScriptNode() && !model.columnView.scriptParametersCaseSensitive) {
                    fixedValues.push({
                        name: "scriptParametersCaseSensitive",
                        value: "false"
                    });
                }

                if (model.columnView.dataCategory === 'DIMENSION' && model.columnView.dimensionType === 'TIME') {
                    fixedValues.push({
                        name: "dimensionType",
                        value: model.columnView.dimensionType
                    });
                }
            },
            
            isEndUserTextsApplicable : function(node){
                if(node && node.label !== undefined){
                    return true;
                }  
                if(node && node.comment !== undefined){
                    return true;
                } 
            },
            
            renderDescriptions : function(object, parentNode, parentNodeName, writer){
                var descriptionsElement;
                if(object.label !== undefined && object.label !== null){
                    descriptionsElement = writer.writeIntermediateElement(object, parentNode, parentNodeName, "descriptions", {
                        label: "{defaultDescription}"
                    });     
                } 
              
                if(object.endUserTexts !== undefined && object.endUserTexts !== null){
                    if(object.endUserTexts.comment !== undefined && object.endUserTexts.comment !== null){
                        //If descriptionsElement is still undefined, create it
                        if(descriptionsElement === undefined){
                            descriptionsElement = writer.writeIntermediateElement(object, parentNode, parentNodeName, "descriptions");
                        }
                        writer.writeIntermediateElement(object.endUserTexts.comment, descriptionsElement, "descriptions", "comment", {
                            text: "{text}"
                        });
                    } 
                } 
                //If descriptionsElement is still undefined, create it to behave like modeler
                if(descriptionsElement === undefined && object.haveDescriptionsTag){
                    descriptionsElement = writer.writeIntermediateElement(object, parentNode, parentNodeName, "descriptions");
                }
            },
            
            mapEntityTypeToRepositoryType: function(entityType){
                //: Map EntityType for design time objects
                var repoEntityType;
                if (entityType === "ATTRIBUTEVIEW") {
                    repoEntityType = "ATTRIBUTE_VIEW";
                } else if (entityType === "ANALYTICVIEW") {
                    repoEntityType = "ANALYTIC_VIEW";
                } else if (entityType === "CALCULATIONVIEW") {
                    repoEntityType = "CALCULATION_VIEW";
                }
                return repoEntityType;
            },
            
            mapEntityTypeToResourceTypeToBeUsedInResourceURI:  function(entityType){
                //: Map EntityType for design time objects
                var repoEntityType;
                if (entityType === "ATTRIBUTEVIEW") {
                    repoEntityType = "attributeview";
                } else if (entityType === "ANALYTICVIEW") {
                    repoEntityType = "analyticview";
                } else if (entityType === "CALCULATIONVIEW") {
                    repoEntityType = "calculationview";
                }
                return repoEntityType;
            },
            
            isItDesigntimeRepositoryObject: function(entityType){
                if(entityType === "ATTRIBUTEVIEW" || entityType === "ANALYTICVIEW" || entityType === "CALCULATIONVIEW" || entityType === "hdbtablefunction"){
                    return true;
                }    
                return false;
            },    

            processDrillDownEnablement: function(element, fixedValues) {
                if (element.drillDownEnablement === model.DrillDownEnablement.NONE) {
                    fixedValues.push({
                        name: "displayAttribute",
                        value: "true"
                    });
                    fixedValues.push({
                        name: "attributeHierarchyActive",
                        value: "false"
                    });
                } else if (element.drillDownEnablement === model.DrillDownEnablement.DRILL_DOWN) {
                    fixedValues.push({
                        name: "displayAttribute",
                        value: "false"
                    });
                    fixedValues.push({
                        name: "attributeHierarchyActive",
                        value: "false"
                    });
                } else if (element.drillDownEnablement === model.DrillDownEnablement.DRILL_DOWN_WITH_HIERARCHY) {
                    fixedValues.push({
                        name: "displayAttribute",
                        value: "false"
                    });
                    fixedValues.push({
                        name: "attributeHierarchyActive",
                        value: "true"
                    });
                }
                return fixedValues;
            },

            addHashTag: function(value) {
                return (value.charAt(0) === "#") ? value : "#" + value;
            },

            processExecutionHints: function(model, fixedValues) {
                if (model.columnView.executionHints) {
                    if (model.columnView.executionHints.cacheInvalidationPeriod) {
                        fixedValues.push({
                            name: "cacheInvalidationPeriod",
                            value: model.columnView.executionHints.cacheInvalidationPeriod
                        });
                    }
                    if (model.columnView.executionHints.alwaysAggregateResult) {
                        fixedValues.push({
                            name: "alwaysAggregateResult",
                            value: "true"
                        });
                    }
                    if (model.columnView.executionHints.preferredEngine === 'SQL') {
                        fixedValues.push({
                            name: "enforceSqlExecution",
                            value: "true"
                        });
                    } else {
                        fixedValues.push({
                            name: "enforceSqlExecution",
                            value: "false"
                        });
                    }
                    if (model.columnView.executionHints.runWithInvokerPrivileges) {
                        fixedValues.push({
                            name: "runWithInvokerPrivileges",
                            value: "true"
                        });
                    }

                }
            },

            isEmpty: function(str) {
                return (!str || 0 === str.length);
            },

            processAttributeProperties: function(element, order, isCalculatedAttribute, fixedValues) {
                // Need to check isCalculatedAttribute because hidden flag is always set(either true or false) in legacy view for CalculatedAttribute
                // Although saving value as false doen not impact the semantic; it is why not storing false value in legacy xml for Attribute is OK
                // Maybe we can think to stop saving hidden flag as false in CalculatedAttribute as well
                if (element.hidden || (isCalculatedAttribute && element.hidden !== undefined)) {
                    fixedValues.push({
                        name: "hidden",
                        value: element.hidden
                    });
                }

                if (element.keep) {
                    fixedValues.push({
                        name: "keepFlag",
                        value: element.keep
                    });
                }

                if (element.$getContainer() !== null && element.$getContainer().keyElements !== null && element.$getContainer().keyElements.get(element.name)) {
                    fixedValues.push({
                        name: "key",
                        value: true
                    });
                }

                if (order) {
                    fixedValues.push({
                        name: "order",
                        value: order
                    });
                }

                if (element.inlineType.semanticType) {
                    fixedValues.push({
                        name: "semanticType",
                        value: element.inlineType.semanticType
                    });
                }

                if (element.infoObjectName !== undefined) {
                    fixedValues.push({
                        name: "infoObject",
                        value: element.infoObjectName
                    });
                }

                if (element.attributeHierarchyDefaultMember !== undefined && element.drillDownEnablement === model.DrillDownEnablement.DRILL_DOWN_WITH_HIERARCHY) {
                    fixedValues.push({
                        name: "attributeHierarchyDefaultMember",
                        value: element.attributeHierarchyDefaultMember
                    });
                }

                if (element.labelElement !== undefined) {
                    fixedValues.push({
                        name: "descriptionColumnName",
                        value: element.labelElement.name
                    });
                }

		if (element.deprecated) {
                    fixedValues.push({
                        name: "deprecated",
                        value: element.deprecated
                    });
                }

                /*
                if (element.labelElement !== undefined && && element.labelElement.indexOf('.description') === -1) {
                    fixedValues.push({
                        name: "descriptionColumnName",
                        value: element.labelElement.name
                    });
                }
                */
            },

            processElementMapping: function(element, fixedMappingValues) {
                var mapping = element.getMapping();
                var viewNode = element.$getContainer();
                if (mapping) {
                    var source = mapping.$getContainer().getSource();
                    if (source instanceof model.Entity) {
                        fixedMappingValues.push({
                            name: "schemaName",
                            value: source.schemaName
                        });
                        fixedMappingValues.push({
                            name: "columnObjectName",
                            value: source.name
                        });
                    } else {
                        fixedMappingValues.push({
                            name: "columnObjectName",
                            value: source.name
                        });
                    }
                    fixedMappingValues.push({
                        name: "columnName",
                        value: mapping.sourceElement.name
                    });
                    // writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);
                } else if (viewNode.isScriptNode()) {
                    fixedMappingValues.push({
                        name: "columnObjectName",
                        value: viewNode.name
                    });
                    fixedMappingValues.push({
                        name: "columnName",
                        value: element.name
                    });
                    // writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);
                }
            },

            renderJoinAttribute: function(writer, calculationViewElement, viewNode, joinAttributes) {
                if (joinAttributes === undefined) {
                    joinAttributes = [];
                }

                for (var i = 0; i < joinAttributes.length; i++) {
                    var joinAttributeProperties = joinAttributes[i];
                    if (joinAttributeProperties) {
                        var fixedValues = [];
                        fixedValues.push({
                            name: "name",
                            value: joinAttributeProperties.name
                        });
                        var joinAttributeElement = writer.writeElement(viewNode, calculationViewElement, "joinAttribute", null, fixedValues);
                        if (joinAttributeProperties.isSpatialJoin) {
                            var fixedValuesSpatialJoinProperties = [];
                            fixedValuesSpatialJoinProperties.push({
                                name: "predicate",
                                value: joinAttributeProperties.predicate
                            });
                            fixedValuesSpatialJoinProperties.push({
                                name: "predicateEvaluatesTo",
                                value: joinAttributeProperties.predicateEvaluatesTo
                            });
                            var spatialJoinPropertiesElement = writer.writeElement(viewNode, joinAttributeElement, "spatialJoinProperties", null, fixedValuesSpatialJoinProperties);

                            if (joinAttributeProperties.distance !== undefined) {
                                var distanceElement = writer.writeElement(viewNode, spatialJoinPropertiesElement, "distance");
                                if (joinAttributeProperties.distance.value !== undefined) {
                                    var valueElement = writer.writeElement(viewNode, distanceElement, "value");
                                    writer.writeTextContent(valueElement, joinAttributeProperties.distance.value);
                                } else if (joinAttributeProperties.distance.localVariable !== undefined) {
                                    var localVariableElement = writer.writeElement(viewNode, distanceElement, "localVariable");
                                    writer.writeTextContent(localVariableElement, joinAttributeProperties.distance.localVariable);
                                }
                            } else if (joinAttributeProperties.intersectionMatrix !== undefined) {
                                var intersectionMatrixElement = writer.writeElement(viewNode, spatialJoinPropertiesElement, "intersectionMatrix");
                                if (joinAttributeProperties.intersectionMatrix.value !== undefined) {
                                    var valueElement = writer.writeElement(viewNode, intersectionMatrixElement, "value");
                                    writer.writeTextContent(valueElement, joinAttributeProperties.intersectionMatrix.value);
                                } else if (joinAttributeProperties.intersectionMatrix.localVariable !== undefined) {
                                    var localVariableElement = writer.writeElement(viewNode, intersectionMatrixElement, "localVariable");
                                    writer.writeTextContent(localVariableElement, joinAttributeProperties.intersectionMatrix.localVariable);
                                }
                            }
                        }
                    }
                }
            },

            //Utility method to check if object is not null and not undefined before calling any operation on object
            objectExistenceCheck: function(objectReference) {
                if (objectReference !== null && objectReference !== undefined) {
                    return true;
                }
                return false;
            },

            processSpatialJoinProperties: function(viewNode, join, joinAttributeSpatialJoinProperties) {
                var spatialJoinProps = join.spatialJoinProperties.get(0);

                if (spatialJoinProps) {
                    joinAttributeSpatialJoinProperties.isSpatialJoin = true;
                    if (spatialJoinProps.predicate !== undefined) {
                        var spatialPredicate = spatialJoinProps.predicate;
                        joinAttributeSpatialJoinProperties.predicate = spatialPredicate;

                        joinAttributeSpatialJoinProperties.predicateEvaluatesTo = spatialJoinProps.predicateEvaluatesTo;
                    }
                    var distanceValueOrParamterFound = false;
                    //Distance for WITHIN_DISTANCE
                    if (spatialJoinProps.distance !== undefined) {
                        var parameterization = {};
                        var distance = spatialJoinProps.distance;
                        if (distance !== null && distance !== undefined) {
                            if (distance.value !== undefined) {
                                parameterization.value = distance.value;
                                distanceValueOrParamterFound = true;
                            } else if (distance.parameter !== undefined) {
                                var parameter = getParameterFromColumnView(viewNode.$getContainer(), distance.parameter.name);
                                parameterization.localVariable = this.addHashTag(parameter.name);
                                distanceValueOrParamterFound = true;
                            }
                        }
                        joinAttributeSpatialJoinProperties.distance = parameterization;
                    } else if (spatialJoinProps.intersectionMatrix !== undefined && distanceValueOrParamterFound === false) {
                        //Intersection matrix for RELATE
                        var parameterization = {};
                        var spatialIntersectionMatrixParameterization = spatialJoinProps.intersectionMatrix;

                        if (spatialIntersectionMatrixParameterization !== null && spatialIntersectionMatrixParameterization !== undefined) {
                            if (spatialIntersectionMatrixParameterization.value !== undefined) {
                                parameterization.value = spatialIntersectionMatrixParameterization.value;
                            } else if (spatialIntersectionMatrixParameterization.parameter !== undefined) {
                                var parameter = getParameterFromColumnView(viewNode.$getContainer(), spatialIntersectionMatrixParameterization.parameter.name);
                                parameterization.localVariable = this.addHashTag(parameter.name);
                            }
                        }
                        joinAttributeSpatialJoinProperties.intersectionMatrix = parameterization;
                    }
                }
                return joinAttributeSpatialJoinProperties;
            },

            processJoinNode: function(viewNode, join) {
                if (join !== undefined && join.leftElements.count() > 0) {
                    var cvInputLeft = join.leftInput;
                    var cvInputRight = join.rightInput;

                    var joinAttributes = [];
                    var joinAttributeName;
                    var joinAttributeElement;
                    for (var i = 0; i < join.leftElements.count(); i++) {
                        var joinAttributeProperties = {}; // It will include name of joinAttribute and SpatialJoinProperties related properties
                        var leftElemName = join.leftElements.getAt(i);
                        var rightElemName = join.rightElements.getAt(i);

                        var maapingExistsForLeftJoinColumn = false;
                        var mappingLeft = getCVAttributeMappingForJoinAttrComparingSourceName(leftElemName, cvInputLeft);

                        if (mappingLeft !== undefined) {
                            // joinAttributeName = mappingLeft.targetName;
                            joinAttributeName = mappingLeft.targetElement.name;
                            joinAttributeElement = mappingLeft.targetElement;
                            maapingExistsForLeftJoinColumn = true;
                        }

                        var spatialJoinPropsExistsForJoin = false;
                        var spatialJoinProps = join.spatialJoinProperties.getAt(0);
                        if (spatialJoinProps) {
                            spatialJoinPropsExistsForJoin = true;
                        }

                        // In case of Spatial join, we always create technical join column but in normal join we only create technical join column 
                        // if left join column is not added to the output!
                        if (maapingExistsForLeftJoinColumn && !spatialJoinPropsExistsForJoin) {
                            // Right mapping
                            var mappingAttributes = {
                                sourceElement: rightElemName,
                                targetElement: joinAttributeElement,
                                type: "ElementMapping"
                            };

                            var rightInputmapping = cvInputRight.createMapping(mappingAttributes);
                            //  joinAttributeName = leftElemName;
                        } else if ((!maapingExistsForLeftJoinColumn) || spatialJoinPropsExistsForJoin) {
                            //Create technical join column in format 'JOIN$LeftElementName$RightElementName'	
                            var technical_join_column = "JOIN$" + leftElemName.name + "$" + rightElemName.name;

                            // Add element in viewNode so that a view attribute will be created in leagacy model
                            var elementAttributes = {
                                name: technical_join_column,
                                hidden: true
                            };
                            joinAttributeElement = viewNode.createElement(elementAttributes);
                            joinAttributeElement.createOrMergeSimpleType({});

                            // Right mapping
                            var rightMappingAttributes = {
                                sourceElement: rightElemName,
                                targetElement: joinAttributeElement,
                                type: "ElementMapping"
                            };

                            var rightInputmapping = cvInputRight.createMapping(rightMappingAttributes);

                            // Left mapping
                            var leftMappingAttributes = {
                                sourceElement: leftElemName,
                                targetElement: joinAttributeElement,
                                type: "ElementMapping"
                            };

                            var leftInputmapping = cvInputLeft.createMapping(leftMappingAttributes);

                            joinAttributeName = technical_join_column;
                        }

                        // Remember the JoinAttribtue name so a ViewAttribute with same name can be created later
                        joinAttributeProperties.name = joinAttributeName;

                        // Process SpatialJoin Properties of JoinAttribute
                        joinAttributeProperties = this.processSpatialJoinProperties(viewNode, join, joinAttributeProperties);

                        joinAttributes.push(joinAttributeProperties);

                    }
                    return joinAttributes;
                }
            },
            
            //Graph Node
            populateGraphNodeFixedValues: function(viewNode) {
                var joinFixedValues = [];
                if (viewNode && viewNode.workspace) {
                        joinFixedValues.push({
                            name: "workspace",
                            value: viewNode.workspace.id
                        });
                }
                if (viewNode && viewNode.action) {
                        joinFixedValues.push({
                            name: "action",
                            value: viewNode.action
                        });
                }
                return joinFixedValues;
            },

            populateJoinNodeFixedValues: function(join, isStarJoin) {
                var joinFixedValues;

                if (join !== undefined) {
                    joinFixedValues = [];

                    if (join.joinType) {
                        joinFixedValues.push({
                            name: "joinType",
                            value: join.joinType
                        });
                    }

                    if (join.cardinality) {
                        joinFixedValues.push({
                            name: "cardinality",
                            value: join.cardinality
                        });
                    }

                    if (join.languageColumn && isStarJoin === undefined ) {
                        joinFixedValues.push({
                            name: "languageColumn",
                            value: join.languageColumn
                        });
                    }

                    if (join.dynamic) {
                        joinFixedValues.push({
                            name: "dynamic",
                            value: join.dynamic
                        });
                    }
                    
                    if (join.dimensionJoin) {
                        joinFixedValues.push({
                            name: "dimensionJoin",
                            value: join.dimensionJoin
                        });
                    }

                    if (join.optimizeJoinColumns) {
                        joinFixedValues.push({
                            name: "optimizeJoinColumns",
                            value: join.optimizeJoinColumns
                        });
                    }
                }
                return joinFixedValues;
            },

            renderVariableMapping: function(writer, parentElement, parent, parameterMapping, variableMappingTag, sourceName, isStarJoin) {
                var mapVariableMappingType = function(value) {
                    switch (value) {
                        case "VariableMapping":
                            return writer.addPrefix(sharedmodel.NameSpace.VARIABLE, "VariableMapping");
                        case "ConstantVariableMapping":
                            return writer.addPrefix(sharedmodel.NameSpace.VARIABLE, "ConstantVariableMapping");
                        default:
                            return writer.addPrefix(sharedmodel.NameSpace.VARIABLE, value);
                    }
                };
                
                var Util = common.Util;
                var attributeMapping = {
                    type: Util.createXsiSelector("type", mapVariableMappingType)
                };
                
                /*if (variableMappingTag) {
                    variableMappingTag = "variableMapping";
                }*/
                if (writer && parameterMapping) {
                    var fixedAttributesForVariableMapping = [];
                    if (parent && parent instanceof model.Input && isStarJoin === undefined) {
                        fixedAttributesForVariableMapping.push({
                            name: "dataSource",
                            value: sourceName
                        });
                    }else if(isStarJoin){
                        fixedAttributesForVariableMapping.push({
                            name: "forStarJoin",
                            value: true
                        });
                    }
                    if (parameterMapping.type === 'ConstantVariableMapping' && parameterMapping.value) {
                        fixedAttributesForVariableMapping.push({
                            name: "value",
                            value: parameterMapping.value
                        });
                    }
                    var parameterMappingElement = writer.writeIntermediateElement(parameterMapping, parentElement, parentElement.name, variableMappingTag, attributeMapping, fixedAttributesForVariableMapping);
                    var fixedAttributesForTargetVariable = [];
                    
                    //parameterNameOtherView is now a reference
                    if (parameterMapping.parameterNameOtherView) {
                        fixedAttributesForTargetVariable.push({
                            name: "name",
                            // value: parameterMapping.parameterNameOtherView.name
                            value: parameterMapping.parameterNameOtherView
                        });
                    } 
                    if (parent && parent instanceof model.Input) {
                        var typeUsedToCreateResourceUri;
                        var isTableFunction = false;
                        if (parent.getSource()) {
                            var source = parent.getSource();
                            // source will always be RepositoryObject not a catalog object
                            typeUsedToCreateResourceUri = this.mapEntityTypeToResourceTypeToBeUsedInResourceURI(source.type);
                            if(source.type === "hdbtablefunction"){
                                isTableFunction = true;
                            }
                            var fqName = FullQualifiedName.createForRepositoryObject(source.packageName, source.name, typeUsedToCreateResourceUri);
                            if (fqName) {
                                var rUri;
                                if(isTableFunction){
                                    rUri = fqName.getFullQualifiedName();
                                }else{
                                    rUri = fqName.getResourceUri();
                                }
                                if (rUri) {
                                    fixedAttributesForTargetVariable.push({
                                        name: "resourceUri",
                                        value: rUri
                                    });
                                }
                            }
                        }
                    }
                    writer.writeElement(parameterMapping, parameterMappingElement, "targetVariable", null, fixedAttributesForTargetVariable);
                    if (parameterMapping.parameter) {
                        var localVariableElement = writer.writeIntermediateElement(parameterMapping, parameterMappingElement, variableMappingTag, "localVariable");
                        //writer.writeTextContent(localVariableElement, "#" + parameterMapping.parameter.name);
                        writer.writeTextContent(localVariableElement, parameterMapping.parameter.name);
                    }

                }
            }
        };

        return RepositoryXmlRendererHelper;

    });
