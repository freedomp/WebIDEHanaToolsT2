/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/common", "../base/XmlWriter", "../sharedmodel/sharedmodel", "./model", "./RepositoryXmlRendererHelper", "../base/FullQualifiedName", "./RepositoryXmlParserHelper"],
    function(common, XmlWriter, sharedmodel, viewmodel, RepositoryXmlRendererHelper, FullQualifiedName, RepositoryXmlParserHelper) {
        "use strict";

        var Util = common.Util;
        //Dummy

        var RepositoryXmlRenderer = {

            renderScenario: function(model, lineEndings)  {
                var that = this;

                var writer = new XmlWriter();
                // required for stable rendering of attributes in IE
                writer.configure({
                    lineEndings: lineEndings,
                    attributesOrder: {
                        "*": ["xsi:type", "id"],
                        "Calculation:scenario": ["xmlns:xsi", "xmlns:AccessControl", "xmlns:Calculation", "xmlns:DataFoundation", "xmlns:Dimension", "xmlns:Privilege", "xmlns:Variable",
                            "schemaVersion", "id", "deprecated", "applyPrivilegeType", "checkAnalyticPrivileges", "defaultClient", "defaultLanguage", "historyEnabled", "translationRelevant", 
                            "visibility", "calculationScenarioType", "dataCategory", "dimensionType", "enforceSqlExecution", "executionSemantic", "outputViewType", "scriptParametersCaseSensitive"
                        ],
                        "keyMapping": ["schemaName", "columnObjectName", "alias", "columnName"], //alias if input has alias
                        "mapping": ["xsi:type", "dataSource", "target", "source", "null", "value"],
                        "measureMapping": ["schemaName", "columnObjectName", "columnName"],
                        "measure": ["id", "hidden", "order", "semanticType", "aggregationType", "measureType", "aggregatable", "calculatedMeasureType", "datatype", "length", "scale"],
                        "viewAttribute": ["datatype", "id", "hidden"], // "hidden" for technical join column
                        "attribute": ["id", "key", "order", "attributeHierarchyActive"],
                        "calculatedAttribute": ["datatype", "id", "hidden", "order"],
                        "calculatedViewAttribute": ["datatype", "id"],
                        "columnObject": ["schemaName"],
                        "valueFilter": ["xsi:type", "including"],
                        "properties": ["joinOperator"],
                        "shape": ["expanded", "modelObjectName"],
                        "upperLeftCorner": ["x"],
                        "rectangleSize": ["height"],
                        "variableProperties": ["datatype", "defaultValue", "length", "mandatory", "scale"],
                        "hierarchy": ["xsi:type", "id", "aggregateAllNodes", "defaultMember", "multipleParents", "orphanedNodesHandling", "rootNodeVisibility", "withRootNode", "nodeStyle", 
                            "stepParentNodeID"],
                        "calculationView": ["xsi:type", "id", "cardinality", "joinType", "languageColumn"]
                    },
                    namespaces: [{
                        name: Util.XSI_NS,
                        prefix: "xsi"
                    }, {
                        name: sharedmodel.NameSpace.ACCESSCONTROL,
                        prefix: "AccessControl"
                    }, {
                        name: sharedmodel.NameSpace.CALCULATION,
                        prefix: "Calculation"
                    }, {
                        name: sharedmodel.NameSpace.PRIVILEGE,
                        prefix: "Privilege"
                    }, {
                        name: sharedmodel.NameSpace.VARIABLE,
                        prefix: "Variable"
                    }, {
                        name: sharedmodel.NameSpace.DATAFOUNDATION,
                        prefix: "DataFoundation"
                    }, {
                        name: sharedmodel.NameSpace.DIMENSION,
                        prefix: "Dimension"
                    }]
                });

                var scenarioElementName = writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "scenario");

                var attributeMapping = {
                   // name: "{id}",
					id: "{id}",
                    applyPrivilegeType: "{applyPrivilegeType}", //Enum PrivilegeType
                    dataCategory: "{dataCategory}", //Enum DataCategory
                    defaultMember: "{defaultMember}",
                    dimensionType: "{dimensionType}",
                    pruningTable: "{pruningTable}"
                };

                var defaultNode = model.columnView.getDefaultNode();

                var fixedValues = [];
                RepositoryXmlRendererHelper.processColumnViewBasicProperties(model, defaultNode, fixedValues);

                RepositoryXmlRendererHelper.processExecutionHints(model, fixedValues);

                var rootElement = writer.writeRootElement(model.columnView, scenarioElementName, attributeMapping, fixedValues);

                if (model.columnView.origin !== undefined) {
                    if (model.columnView.origin.system !== undefined) {
                        //Now write element does not acept exclusive skippedNodes arguments
                       writer.writeElement(model.columnView, rootElement, "origin", null, {
                            system: model.columnView.origin.system});
                    } else {
                        // writer.writeElement(model.columnView, rootElement, "origin", null, null, model.columnView.origin.skippedNodes, true);
                        writer.writeElement(model.columnView, rootElement, "origin", null, null);
                    }
                }
                
                RepositoryXmlRendererHelper.renderDescriptions(model.columnView, rootElement, scenarioElementName, writer);  

                if (model.columnView.hasOwnProperty("defaultSchema")) {
                    writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "defaultSchema", {
                        defaultSchema: "{schemaName}"
                    });
                }

                var localVariablesElement = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "localVariables");
                model.columnView.parameters.foreach(function(parameter) {
                    that.renderVariable(parameter, localVariablesElement, writer);
               });

                if (model.columnView.hasOwnProperty("historyParameter") && model.columnView.historyParameter) {
                    var historyParameter = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "historyVariable");
                    //writer.writeTextContent(historyParameter, "#" + model.columnView.historyParameter.name);
                    writer.writeTextContent(historyParameter, model.columnView.historyParameter.name);
                }

                var variableMappingsElement = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "variableMappings");
                if(model.columnView.executionHints){
                       model.columnView.executionHints.genericHints.foreach(function(genericHint) {
                           var fixedValues = [];
                            fixedValues.push({
                                name: "name",
                                value: genericHint.name
                            });
                            fixedValues.push({
                                name: "value",
                                value: genericHint.value
                            });
                            writer.writeElement(genericHint, rootElement, "executionHints", null, fixedValues);
                    
                      });
                }
                
                //dataSources
                var dataSourcesElement = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "dataSources");
                var dataSourceNames = {};
                var renderDataSource = function(input) {
                    if (typeof(input) !== 'undefined') {
                        var source = input.getSource();
                        if (source instanceof viewmodel.Entity) {                            
							var id = source.id;
							var resourceUri = source.id;
							var alias;							
                            var fixedValuesDataSource = [];
                            
                            //Logic to derive technical dataSourceId(including alias) - START
                            if (typeof(input.alias) !== 'undefined' && !dataSourceNames[input.alias]) {
                                id = input.alias;
                                alias = input.alias;
                                dataSourceNames[id] = source;
                                
                            } else if (dataSourceNames[source.id]) {
                                // If input is having alias then alias should be put in id string
                                if (input.alias) {
                                    id = input.$getContainer().name + "$$" + input.alias + "$$" + source.id + "$$";
                                } else {
                                    id = input.$getContainer().name + "$$$$" + source.id + "$$";
                                }
                                dataSourceNames[id] = source;
                            } else {
                                dataSourceNames[source.id] = source;
                                id = source.id;
                            }
                            //Logic to derive technical dataSourceId(including alias) - END

                            fixedValuesDataSource.push({
                                name: "id",
                                value: id
                            });

                            var type;
                            var typeUsedToCreateResourceUri;
                            if (source.type === "DATA_BASE_TABLE" || source.type === "DATA_BASE_VIEW") {
                                type = source.type;
                            } else if (source.type === "CALCULATIONVIEW") {
                                type = "CALCULATION_VIEW";                                
                            }else if (source.type === viewmodel.EntityType.TABLE_FUNCTION) {
                                type = "TABLE_FUNCTION";
                            }

                            fixedValuesDataSource.push({
                                name: "type",
                                value: type
                            });

                            var dataSourceElement = writer.writeElement(source, dataSourcesElement, "DataSource", null, fixedValuesDataSource);                            
                            
                            var fixedResourceUriAttributes = [];
                            if(alias){
                            	fixedResourceUriAttributes.push({
                                    name: "alias",
                                    value: alias
                                });
                            }   
                            var resourceUriElement = writer.writeIntermediateElement(input, dataSourceElement, "DataSource", "resourceUri", null, fixedResourceUriAttributes);
							//writer.writeTextContent(resourceUriElement, id);
							writer.writeTextContent(resourceUriElement, resourceUri);
							
                            return id;
                        } else {
                            return source ? source.name : undefined;
                        }
                    }
                };

                var calculationViewsElement = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "calculationViews");
                model.columnView.viewNodes.foreach(function(viewNode) {
 			//if (viewNode.type === "Projection" && viewNode.isDataSource) return;
                    ////Code For HangingDataSources - START
                    if (viewNode.type === "Projection" && viewNode.isDataSource){
                        renderDataSource(viewNode.inputs.getAt(0));
                        return;
                    }
                    //Code For HangingDataSources - END
                    if (viewNode.isDefaultNode() && !viewNode.isScriptNode()) return;
                    that.renderCalculationView(viewNode, calculationViewsElement, writer, renderDataSource, variableMappingsElement);
                });
                if (model.columnView.dataCategory === "DIMENSION" || model.columnView.dataCategory === "DEFAULT") {
                    model.columnView.inlineHierarchies.foreach(function(inlineHiearchy) {
                        that.renderHiearchy(writer, model.columnView, rootElement, inlineHiearchy, "inlineHierarchy");
                    });
                    
                }
                var logicalModelElement = this.renderLogicalModel(writer, rootElement, defaultNode, renderDataSource, variableMappingsElement, model.columnView);

                var layoutElement = writer.writeIntermediateElement(model.columnView, rootElement, scenarioElementName, "layout");
                var shapesElement = writer.writeIntermediateElement(model.columnView, layoutElement, scenarioElementName, "shapes");

                this.renderShape(defaultNode, shapesElement, writer);
                /*model.columnView.getLayouts().foreach(function(layout) {
                    if (!layout.$getContainer().isDefaultNode()) {
                        that.renderShape(layout.$getContainer(), shapesElement, writer);
                    }
                });*/
                model.columnView.viewNodes.foreach(function(viewNode) {
				//if (!viewNode.isDefaultNode()) {
                    if (!viewNode.isDefaultNode() && (viewNode.isDataSource === undefined || viewNode.isDataSource === null)) {
                        that.renderShape(viewNode, shapesElement, writer);
                    }
                });


                writer.close();
                return rootElement.parentNode;
            },
            
            renderParameterOrAttributeTypeOfElement: function(writer, parameter, valueDomainElement, isParameter, attributeElement, element){
                var typeOfElement;
                if (parameter && parameter.typeOfElement && isParameter) {
                    typeOfElement = parameter.typeOfElement;
                    var fixedTypeOfElementAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(parameter.typeOfElement, "resourceUri", "name");                
                    writer.writeIntermediateElement(typeOfElement, valueDomainElement, "variableDomain", "attribute", null, fixedTypeOfElementAttributes);
                    var hierarchyName = parameter.hierarchy;
                    if(hierarchyName){
                        var hierarchyNameElement = writer.writeIntermediateElement(hierarchyName, valueDomainElement, "variableDomain", "hierarchyName");
                        writer.writeTextContent(hierarchyNameElement, parameter.hierarchy.name);
                    }
                }else if (attributeElement !== undefined && element !== undefined && isParameter === false && element.typeOfElement) {
                    typeOfElement = element.typeOfElement;
                    var viewNode = element.$getContainer();
                    var externalLikeElementNameElement = writer.writeIntermediateElement(viewNode, attributeElement, "attribute", "externalLikeElementName");
                    writer.writeTextContent(externalLikeElementNameElement, typeOfElement.name);
                }    
            },    
            
            renderTypedObjectExternalTypeOfElement: function(writer, parentElement, parentElementName, typedObject){
                var externalTypeOfElement = typedObject.externalTypeOfElement;
                var repoEntityType;
                if (externalTypeOfElement !== undefined && externalTypeOfElement !== null) {
                    var externalLikeStructureNameElement = writer.writeIntermediateElement(externalTypeOfElement, parentElement, parentElementName, "externalLikeStructureName");
                    writer.writeTextContent(externalLikeStructureNameElement, typedObject.externalTypeOfElement.$getContainer().fqName);
                    if(RepositoryXmlRendererHelper.isItDesigntimeRepositoryObject(typedObject.externalTypeOfElement.$getContainer().type)){
                            repoEntityType = RepositoryXmlRendererHelper.mapEntityTypeToRepositoryType(typedObject.externalTypeOfElement.$getContainer().type);
                            var externalLikeStructureTypeElement = writer.writeIntermediateElement(externalTypeOfElement, parentElement, parentElementName, "externalLikeStructureType");
                            writer.writeTextContent(externalLikeStructureTypeElement, repoEntityType);
                    } 
                    var externalLikeElementNameElement = writer.writeIntermediateElement(externalTypeOfElement, parentElement, parentElementName, "externalLikeElementName");
                    writer.writeTextContent(externalLikeElementNameElement, typedObject.externalTypeOfElement.name);    
                } 
                //To handle case when externalTypeOfElement is not seleclted in UI; only externalTypeOfEntity is sellected
                if (externalTypeOfElement === undefined && externalTypeOfElement === null && typedObject.externalTypeOfEntity) {
                    var externalTypeOfEntity = typedObject.externalTypeOfEntity;
                    var externalTypeOfEntityNameElement = writer.writeIntermediateElement(externalTypeOfEntity, parentElement, parentElementName, "externalLikeStructureName");
                    writer.writeTextContent(externalTypeOfEntityNameElement, externalTypeOfEntity.fqName);
                    if(RepositoryXmlRendererHelper.isItDesigntimeRepositoryObject(externalTypeOfEntity.type)){
                        repoEntityType = RepositoryXmlRendererHelper.mapEntityTypeToRepositoryType(externalTypeOfEntity.type);
                        var externalTypeOfEntityTypeElement = writer.writeIntermediateElement(externalTypeOfEntity, parentElement, parentElementName, "externalLikeStructureType");
                        writer.writeTextContent(externalTypeOfEntityTypeElement, repoEntityType);
                    } 
                }
            },    
            
            renderParameterOrAttributeExternalTypeOfElement: function(writer, parameter, valueDomainElement, isParameter, attributeElement, element){
                if (parameter && parameter.externalTypeOfElement && isParameter) {  
                    this.renderTypedObjectExternalTypeOfElement(writer, valueDomainElement, "variableDomain", parameter);
                }else if (attributeElement !== undefined && element !== undefined && isParameter === false && element.externalTypeOfElement) {
                    this.renderTypedObjectExternalTypeOfElement(writer, attributeElement, "attribute", element);
                }    
            },    
            
            renderParameterExternalTypeOfElementParameterMapping: function(writer, parameter, valueDomainElement){
                if (parameter.parameterMappings) {
                    parameter.parameterMappings.foreach(function(parameterMapping) {
                        RepositoryXmlRendererHelper.renderVariableMapping(writer, valueDomainElement, parameter, parameterMapping, "variableMapping");
                    });
                }
            },  
            
            renderAttributeExternalTypeOfElementParameterMapping: function(writer, element, attributeElement){
                if (element.parameterMappings) {
                    element.parameterMappings.foreach(function(parameterMapping) {
                        RepositoryXmlRendererHelper.renderVariableMapping(writer, attributeElement, element, parameterMapping, "variableMapping");
                    });
                }
            },  
            
            renderParameterBasedOnColumn:  function(writer, parameter, valueDomainElement){
                this.renderParameterOrAttributeTypeOfElement(writer, parameter, valueDomainElement, true);
                this.renderParameterOrAttributeExternalTypeOfElement(writer, parameter, valueDomainElement, true);
                this.renderParameterExternalTypeOfElementParameterMapping(writer, parameter, valueDomainElement);
            },    

            renderVariable: function(parameter, parent, writer) {
                var variableElement;
                var fixedValuesForVariable = [];
                if (!parameter.isVariable) {
                    fixedValuesForVariable.push({
                        name: "parameter",
                        value: "true"
                    });
                }
                
                variableElement = writer.writeElement(parameter, parent, "variable", {
                    name: "{id}"
                }, fixedValuesForVariable);

                var fixedAttributes = [];
                if (parameter.defaultValue) {
                    fixedAttributes.push({
                        name: "defaultValue",
                        value: parameter.defaultValue
                    });
                }
                if (parameter.mandatory !== null && parameter.mandatory !== undefined) {
                    fixedAttributes.push({
                        name: "mandatory",
                        value: parameter.mandatory
                    });
                }
                
                var defaultRangeProcessed = false;
                var defaultRange;
                RepositoryXmlRendererHelper.renderDescriptions(parameter, variableElement, "variable", writer); 
                
                var expressionLanguage;
                if(parameter.defaultRanges.count() === 1){
                	defaultRange = parameter.defaultRanges.getAt(0);
                	expressionLanguage = defaultRange.expressionLanguage;
                	if(expressionLanguage){
                		fixedAttributes.push({
                            name: "defaultExpressionLanguage",
                            value: expressionLanguage
                        });
                	}
                }
                
                if(parameter.defaultRanges.count() === 1 && parameter.selectionType === viewmodel.SelectionType.SINGLE){
                        defaultRange = parameter.defaultRanges.getAt(0);
                        if(!defaultRange.lowExpression){
                            defaultRangeProcessed = true;
                            fixedAttributes.push({
                                name: "defaultValue",
                                value: defaultRange.lowValue
                                });
                        }
                        
                    } else if(parameter.defaultRanges.count() === 1 && (parameter.selectionType === viewmodel.SelectionType.INTERVAL 
                    || parameter.selectionType === viewmodel.SelectionType.RANGE ) && parameter.specialDefaultValueHandling){
                        defaultRange = parameter.defaultRanges.getAt(0);
                        if(defaultRange.lowValue && defaultRange.highValue === undefined && !defaultRange.lowExpression){
                            defaultRangeProcessed = true;
                            fixedAttributes.push({
                                name: "defaultValue",
                                value: defaultRange.lowValue
                                });
                        }
                    } 
                var variablePropertiesElement;
                var valueDomainType = "empty";
                var simpleType = parameter.inlineType;
                if (simpleType) {
                    variablePropertiesElement = writer.writeElement(simpleType, variableElement, "variableProperties", {
                        primitiveType: "{datatype}",
                        length: "{length}",
                        scale: "{scale}"
                    }, fixedAttributes);
                    switch (simpleType.semanticType) {
                        case undefined:
                            break;
                        case viewmodel.SemanticType.CURRENCY_CODE:
                            valueDomainType = viewmodel.ValueType.CURRENCY_CODE;
                            break;
                        case viewmodel.SemanticType.UNIT_OF_MEASURE:
                            valueDomainType = viewmodel.ValueType.UNIT_OF_MEASURE;
                            break;
                        case viewmodel.SemanticType.DATE:
                            valueDomainType = viewmodel.ValueType.DATE;
                            break;
                        case "AttributeValue":
                            valueDomainType = viewmodel.ValueType.ATTRIBUTE_VALUE;
                            break;
                        case "StaticList":
                            valueDomainType = viewmodel.ValueType.STATIC_LIST;
                            break;
                        default:
                            valueDomainType = simpleType.semanticType;
                    }
                } else {
                    variablePropertiesElement = writer.writeIntermediateElement(parameter, variableElement, "variable", "variableProperties", null, fixedAttributes);
                    valueDomainType = "AttributeValue";
                }
                if(parameter.parameterType === viewmodel.ParameterType.COLUMN){
                    valueDomainType = "AttributeValue";
                }else if(parameter.parameterType === viewmodel.ParameterType.STATIC_LIST){
                    valueDomainType = "StaticList";  
                }
                //TODO: To check do we need below if block to set valueDomainType as already above valueDomainType assignment is happening based on simpleType's semanticType
               // if (parameter.parameterType !== null && parameter.parameterType !== undefined){
                if (parameter.parameterType !== null && parameter.parameterType !== undefined && valueDomainType === 'empty') {
                    switch (parameter.parameterType) {
                        case undefined:
                            valueDomainType = "empty";
                            break;
                        case viewmodel.ParameterType.COLUMN:
                            valueDomainType = "AttributeValue";
                            break;
                        case viewmodel.ParameterType.STATIC_LIST:
                            valueDomainType = "StaticList";
                            break;
                        default:
                            valueDomainType = "empty";
                            break;
                    }
                }
                if (parameter.isVariable){
                    valueDomainType = "AttributeValue";
                }  
                
                if(valueDomainType === undefined){
                    var valueDomainElement = writer.writeIntermediateElement(parameter, variablePropertiesElement, "variableProperties", "valueDomain", null, null);
                }else{
                    var valueDomainElement = writer.writeIntermediateElement(parameter, variablePropertiesElement, "variableProperties", "valueDomain", null, [{
                        name: "type",
                        value: valueDomainType
                    }]);
                }

                if (valueDomainType === "AttributeValue") {
                    this.renderParameterBasedOnColumn(writer, parameter, valueDomainElement);
                }
                
                if (simpleType) {
                    simpleType.valueRanges.foreach(function(valueRange) {
                        var listEntryElement = writer.writeElement(valueRange, valueDomainElement, "listEntry", {
                            value: "{id}"
                        });
                        RepositoryXmlRendererHelper.renderDescriptions(valueRange, listEntryElement, "listEntry", writer); 
                    });
                }

                var fixedValuesVariablePropertiesElement = [];
                if (parameter.multipleSelections !== null && parameter.multipleSelections !== undefined) {
                    fixedValuesVariablePropertiesElement.push({
                        name: "multiLine",
                        value: parameter.multipleSelections
                    });
                }
                if (parameter.selectionType !== null && parameter.selectionType !== undefined) {
                    fixedValuesVariablePropertiesElement.push({
                        name: "type",
                        value: parameter.selectionType
                    });
                }

                writer.writeIntermediateElement(parameter, variablePropertiesElement, "variableProperties", "selection", null, fixedValuesVariablePropertiesElement);
                if (parameter.parameterType && (parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_TABLE|| parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_PROCEDURE)) {
                    var derivationRule = parameter.derivationRule;
                    this.processDerivationRule(derivationRule, writer, variablePropertiesElement, parameter);
                }
                
                //TODO: use method this.defaultRangesDefaultExpressionSpecialHandling() for below code
                if(parameter.defaultRanges.count() === 1 && parameter.specialDefaultValueHandling){
                    var defaultExpression = parameter.defaultRanges.getAt(0);
                    if(defaultExpression.lowValue && defaultExpression.highValue === undefined
                    && defaultExpression.lowExpression && defaultExpression.highExpression === undefined){
                        defaultRangeProcessed = true;
                        var expression = writer.writeIntermediateElement(defaultExpression, variablePropertiesElement, null, "defaultExpression");
                        writer.writeTextContent(expression, defaultExpression.lowValue);
                    }
                }
                // var defaultRangeProcessed = this.defaultRangesDefaultExpressionSpecialHandling(parameter, writer, variablePropertiesElement);
                this.processDefaultRanges(defaultRangeProcessed, parameter, writer, variablePropertiesElement);
                return variableElement;
            },
            
            processDerivationRule: function(derivationRule, writer, variablePropertiesElement, parameter){
                if (derivationRule !== null && derivationRule !== undefined) {
                    var derivationRuleElement;
                    if(derivationRule.inputEnabled){
                        var derivationRuleAttributes = [];
                        derivationRuleAttributes.push({
                            name: "inputEnabled",
                            value: derivationRule.inputEnabled
                        });
                        derivationRuleElement = writer.writeIntermediateElement(derivationRule, variablePropertiesElement, null, "derivationRule", null, derivationRuleAttributes);
                    }else{
                        derivationRuleElement = writer.writeIntermediateElement(derivationRule, variablePropertiesElement, null, "derivationRule");
                    }    
                    var lookupEntity = derivationRule.lookupEntity;
                    if (lookupEntity && parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_TABLE) {
                        this.processParameterDerivedFromTable(writer, lookupEntity, derivationRuleElement, derivationRule);
                    }
                    var scriptEntity = derivationRule.scriptObject;
                    if(scriptEntity && parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_PROCEDURE){
                        this.processParameterDerivedFromProcedure(scriptEntity, writer, derivationRuleElement, derivationRule);
                    }
                    if((lookupEntity === undefined || lookupEntity === null) && (scriptEntity === undefined || scriptEntity === null)){
                        if(parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_PROCEDURE){
                            writer.writeElement(derivationRule, derivationRuleElement, "procedureName");
                        }
                        /*if(parameter.parameterType === viewmodel.ParameterType.DERIVED_FROM_TABLE){
                            writer.writeElement(derivationRule, derivationRuleElement, "resultColumn");
                        }*/
                    }    
                }
            },
            
            processParameterDerivedFromTable: function(writer, lookupEntity, derivationRuleElement, derivationRule){
                writer.writeElement(lookupEntity, derivationRuleElement, "resultColumn", {
                    schemaName: "{schemaName}",
                    name: "{columnObjectName}"
                }, [{
                    name: "columnName",
                    value: derivationRule.resultElementName
                }]);
                if (derivationRule.elementFilters !== null && derivationRule.elementFilters !== undefined) {
                    derivationRule.elementFilters.foreach(function(elementFilter) {
                        var columnFilterElement = writer.writeIntermediateElement(elementFilter, derivationRuleElement, "derivationRule", "columnFilter", {
                            elementName: "{columnName}"
                        });
                        if (elementFilter.valueFilters !== null && elementFilter.valueFilters !== undefined) {
                            elementFilter.valueFilters.foreach(function(valueFilter) {
                                sharedmodel.renderValueFilter(valueFilter, columnFilterElement, writer, "valueFilter");
                            });
                        }
                    });
               }    
            },
            
            defaultRangesDefaultExpressionSpecialHandling: function(parameter, writer, variablePropertiesElement){
                var defaultRangeProcessed = false;
                if(parameter.defaultRanges.count() === 1 && parameter.specialDefaultValueHandling){
                    var defaultExpression = parameter.defaultRanges.getAt(0);
                    if(defaultExpression.lowValue && defaultExpression.highValue === undefined
                    && defaultExpression.lowExpression && defaultExpression.highExpression === undefined){
                        defaultRangeProcessed = true;
                        var expression = writer.writeIntermediateElement(defaultExpression, variablePropertiesElement, null, "defaultExpression");
                        writer.writeTextContent(expression, defaultExpression.lowValue);
                    }
                }
                return defaultRangeProcessed;
            },
            
            processDefaultRanges: function(defaultRangeProcessed, parameter, writer, variablePropertiesElement){
                if (defaultRangeProcessed === false && parameter.defaultRanges) {
                    parameter.defaultRanges.foreach(function(defaultRange) {
                        var defaultRangeAttributes = [];
                        if (defaultRange.lowValue) {
                            defaultRangeAttributes.push({
                                name: "lowValue",
                                value: defaultRange.lowValue
                            });
                        }
                        if (defaultRange.highValue) {
                            defaultRangeAttributes.push({
                                name: "highValue",
                                value: defaultRange.highValue
                            });
                        }
                        if (defaultRange.lowExpression) {
                            defaultRangeAttributes.push({
                                name: "lowExpression",
                                value: defaultRange.lowExpression
                            });
                        }
                        if (defaultRange.highExpression) {
                            defaultRangeAttributes.push({
                                name: "highExpression",
                                value: defaultRange.highExpression
                            });
                        }
                        if (defaultRange.operator) {
                            defaultRangeAttributes.push({
                                name: "operator",
                                value: defaultRange.operator
                            });
                        }
                        if (defaultRange.including) {
                            defaultRangeAttributes.push({
                                name: "including",
                                value: defaultRange.including
                            });
                        }
                        writer.writeIntermediateElement(defaultRange, variablePropertiesElement, "variableProperties", "defaultRange", null, defaultRangeAttributes);
                    });
                }
            },
            
            processParameterDerivedFromProcedure: function(scriptEntity, writer, derivationRuleElement, derivationRule){
                var fqNameOfScriptObject;
                if(scriptEntity && scriptEntity.type === viewmodel.EntityType.CATALOG_PROCEDURE){
                    fqNameOfScriptObject = FullQualifiedName.createForCatalogObject(scriptEntity.schemaName, scriptEntity.name);
                }else if(scriptEntity && (scriptEntity.type === viewmodel.EntityType.PROCEDURE || scriptEntity.type === viewmodel.EntityType.SCALAR_FUNCTION)){
                    fqNameOfScriptObject = FullQualifiedName.createForRepositoryObject(scriptEntity.packageName, scriptEntity.name);
                }
                if(fqNameOfScriptObject){
                    var scriptEntityNodeElement;
                    if(scriptEntity.type === viewmodel.EntityType.PROCEDURE || scriptEntity.type === viewmodel.EntityType.CATALOG_PROCEDURE){
                        scriptEntityNodeElement = writer.writeIntermediateElement(scriptEntity, derivationRuleElement, "derivationRule", "procedureName", null);
                    }else if(scriptEntity.type === viewmodel.EntityType.SCALAR_FUNCTION){
                        scriptEntityNodeElement = writer.writeIntermediateElement(scriptEntity, derivationRuleElement, "derivationRule", "scalarFunctionName", null);
                    }
                    if(scriptEntityNodeElement){
                        writer.writeTextContent(scriptEntityNodeElement, fqNameOfScriptObject.getFullQualifiedName());
                        // writer.writeTextContent(scriptEntityNodeElement, scriptEntity.getFullQualifiedName());
                    }
                    if (derivationRule.parameterMappings) {
                        derivationRule.parameterMappings.foreach(function(parameterMapping) {
                            RepositoryXmlRendererHelper.renderVariableMapping(writer, derivationRuleElement, derivationRule, parameterMapping, "variableMapping");
                        });
                    }
                }
            },

            renderCalculationView: function(viewNode, parent, writer, renderDataSource, variableMappingsElement) {
                var that = this;
                var mapType = function(value) {
                    switch (value) {
                        case "JoinNode":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "JoinView");
                        case "Projection":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "ProjectionView");
                        case "Aggregation":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "AggregationView");
                        case "Union":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "UnionView");
                        case "Script":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "SqlScriptView");
                        case "Rank":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "RankView");
                        case "Graph":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "GraphView");
                        default:
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, value);
                    }
                };

                var attributeMapping = {
                    type: Util.createXsiSelector("type", mapType),
                    name: "{id}"
                };

                // Test code to check viewNode's type
                // var myType = viewNode.type;

                var joinFixedValues = [];

                if (viewNode.type === 'JoinNode') {
                    var join = viewNode.joins.get(0);
                    if (join !== undefined) {
                        //TODO: call RepositoryXmlRendererHelper.populateJoinNodeFixedValues(join) to populate JoinNodeFixedValues
                        joinFixedValues = RepositoryXmlRendererHelper.populateJoinNodeFixedValues(join);
                        var joinAttributes = RepositoryXmlRendererHelper.processJoinNode(viewNode, join);
                    }
                }
                
                //Graph Node
                if (viewNode.type === 'GraphView' || viewNode.type === 'Graph') {
                    joinFixedValues = RepositoryXmlRendererHelper.populateGraphNodeFixedValues(viewNode);
                }

                var calcViewElementName = "calculationView";
                if(viewNode.filterExpression && viewNode.filterExpression.expressionLanguage){
                        joinFixedValues.push({
                       name: "filterExpressionLanguage",
                       value: viewNode.filterExpression.expressionLanguage         
                    });
                }
                var calculationViewElement = writer.writeElement(viewNode, parent, calcViewElementName, attributeMapping, joinFixedValues);
                
                RepositoryXmlRendererHelper.renderDescriptions(viewNode, calculationViewElement, calcViewElementName, writer); 
                
                if (viewNode.type === 'GraphView' || viewNode.type === 'Calculation:GraphView' || viewNode.type === 'Graph') {
                    var expressionElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "expression");
                    writer.writeTextContent(expressionElement, viewNode.graphExpression);
                    //return calculationViewElement;
                }
                
                var viewAttributesElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "viewAttributes");
                var calculatedViewAttributesElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "calculatedViewAttributes");

                viewNode.elements.foreach(function(element) {
                    if (element.calculationDefinition !== undefined && element.calculationDefinition.formula !== undefined && element.calculationDefinition.formula !== null) {
                        that.renderCalculatedViewAttribute(writer, calculatedViewAttributesElement, element);
                    } else {
                        that.renderViewAttribute(writer, viewAttributesElement, element);
                    }
                });

                if (viewNode.isScriptNode()) {
                    if (viewNode.$getContainer() && viewNode.$getContainer() instanceof viewmodel.ColumnView && viewNode.$getContainer().parameters.count() > 0) {
                        viewNode.$getContainer().parameters.foreach(function(parameter) {
                            if (!parameter.isVariable) {
                                var localVariableElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "localVariable");
                                writer.writeTextContent(localVariableElement, "#" + parameter.name);
                            }
                        });
                    }
                }

                viewNode.inputs.foreach(this.renderInput.bind(this, writer, calculationViewElement, renderDataSource, variableMappingsElement));

                if (viewNode.windowFunction) {
                    var windowFunctionElement = writer.writeElement(viewNode.windowFunction, calculationViewElement, "windowFunction", {
                        dynamicPartitionElements: "{dynamicPartitionAttributes}"
                    });
                    viewNode.windowFunction.partitionElements.foreach(function(element) {
                        writer.writeTextContent(writer.writeElement(viewNode, windowFunctionElement, "partitionViewAttributeName"), element.name);
                    });
                    viewNode.windowFunction.orders.foreach(function(order) {
                        var fixedValues = [];
                        fixedValues.push({
                            name: "byViewAttributeName",
                            value: order.byElement.name
                        });
                        fixedValues.push({
                            name: "direction",
                            value: order.direction
                        });
                        writer.writeElement(order, windowFunctionElement, "order", null, fixedValues);
                    });
                    this.renderUDFParameter(writer, viewNode.windowFunction, viewNode.windowFunction.rankThreshold, "rankThreshold", windowFunctionElement);

                }

                if (viewNode.filterExpression !== undefined && viewNode.filterExpression.formula !== undefined && viewNode.filterExpression.formula !== "") {
                    var filterExpressionElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "filter");
                    writer.writeTextContent(filterExpressionElement, viewNode.filterExpression.formula);
                }

                if (viewNode.hasOwnProperty("definition")) {
                    var definitionElement = writer.writeIntermediateElement(viewNode, calculationViewElement, calcViewElementName, "definition");
                    writer.writeTextContent(definitionElement, viewNode.definition);
                }

                // START - JOIN CODE
                if (viewNode.type === 'JoinNode') {
                    RepositoryXmlRendererHelper.renderJoinAttribute(writer, calculationViewElement, viewNode, joinAttributes);
                    RepositoryXmlParserHelper.removeJoinRelatedElementAddedinRepositoryXML(joinAttributes, viewNode);
                }
                // END - JOIN CODE

                //Test code - delete it later
                /*if (viewNode.type === 'Union') {
                    var type = viewNode.type;
                }*/

                return calculationViewElement;
            },

            renderViewAttribute: function(writer, parent, element) {
                var fixedValues = [];

                var viewNode = element.$getContainer();
                var isScriptNode = viewNode.isScriptNode();

                // Temporaray code to handle script based view attributes
                if (isScriptNode && element.inlineType !== undefined && element.inlineType.isDerived === undefined) {
                    element.inlineType.isDerived = false;
                }

                //We will only save datatype in legacy model if element's inlineType's isDerived flag is set to false
                this.setViewAttributeDataTypeIfRequired(element, fixedValues);

                if (element.keep) {
                    fixedValues.push({
                        name: "keepFlag",
                        value: element.keep
                    });
                }

                if (element.hidden) {
                    fixedValues.push({
                        name: "hidden",
                        value: element.hidden
                    });
                }

                /*var viewNode = element.$getContainer();
                var isScriptNode = viewNode.isScriptNode();*/
                //For ScriptNode do not store aggregationType
                if (element.aggregationBehavior !== undefined && element.aggregationBehavior !== "" && element.aggregationBehavior !== "none" && !isScriptNode) {
                    fixedValues.push({
                        name: "aggregationType",
                        value: element.aggregationBehavior
                    });
                }

                if (element.transparentFilter) {
                    fixedValues.push({
                        name: "transparentFilter",
                        value: element.transparentFilter
                    });
                }

                var viewAttributeElement = writer.writeElement(element, parent, "viewAttribute", {
                    name: "{id}"
                }, fixedValues);
                
                RepositoryXmlRendererHelper.renderDescriptions(element, viewAttributeElement, "viewAttribute", writer); 

                return viewAttributeElement;
            },

            setViewAttributeDataTypeIfRequired: function(element, fixedValues) {
                if (element.inlineType !== undefined && element.inlineType.isDerived !== undefined && element.inlineType.isDerived === false) {
                    if (typeof element.inlineType.primitiveType !== "undefined") fixedValues.push({
                        name: "datatype",
                        value: element.inlineType.primitiveType
                    });
                    if (typeof element.inlineType.length !== "undefined") fixedValues.push({
                        name: "length",
                        value: element.inlineType.length
                    });
                    if (typeof element.inlineType.scale !== "undefined") fixedValues.push({
                        name: "scale",
                        value: element.inlineType.scale
                    });
                }
            },

            renderCalculatedViewAttribute: function(writer, parent, element) {
                var fixedValues = [];

                if (element.inlineType) {
                    if (typeof element.inlineType.primitiveType !== "undefined") fixedValues.push({
                        name: "datatype",
                        value: element.inlineType.primitiveType
                    });
                    if (typeof element.inlineType.length !== "undefined") fixedValues.push({
                        name: "length",
                        value: element.inlineType.length
                    });
                    if (typeof element.inlineType.scale !== "undefined") fixedValues.push({
                        name: "scale",
                        value: element.inlineType.scale
                    });
                    if (typeof element.calculationDefinition.expressionLanguage !== "undefined") fixedValues.push({
                        name: "expressionLanguage",
                        value: element.calculationDefinition.expressionLanguage
                    });
                }

                var calculatedViewAttributeElement = writer.writeElement(element, parent, "calculatedViewAttribute", {
                    name: "{id}"
                }, fixedValues);

                var formulaElement = writer.writeElement(element, calculatedViewAttributeElement, "formula");
                writer.writeTextContent(formulaElement, element.calculationDefinition.formula);

                return calculatedViewAttributeElement;
            },

            renderInput: function(writer, parent, renderDataSource, variableMappingsElement, input) {
                //var sourceName = '#' + renderDataSource(input);
                var sourceName = renderDataSource(input);
                var inputElement = writer.writeElement(input, parent, "input", {
                    emptyUnionBehavior: "{emptyUnionBehavior}"
                }, [{
                    name: "node",
                    value: sourceName
                }]);
                input.mappings.foreach(this.renderMapping.bind(this, writer, inputElement));

                if (input.parameterMappings && input.parameterMappings.count() > 0) {
                    input.parameterMappings.foreach(function(parameterMapping) {
                        RepositoryXmlRendererHelper.renderVariableMapping(writer, variableMappingsElement, input, parameterMapping, "mapping", sourceName);
                    });
                }
            },

            renderMapping: function(writer, parent, mapping) {
                // Below code required for dot description column
                /*if (mapping.targetElement.name.indexOf('.description') > -1) {
                    return;
                }*/

                var mapType = function(value) {
                    switch (value) {
                        case "ElementMapping":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "AttributeMapping");
                        case "ConstantElementMapping":
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, "ConstantAttributeMapping");
                        default:
                            return writer.addPrefix(sharedmodel.NameSpace.CALCULATION, value);
                    }
                };

                var attributeMapping = {
                    type: Util.createXsiSelector("type", mapType)
                };

                var fixedValuesMapping = [];
                if (mapping.targetElement) {
                    fixedValuesMapping.push({
                        name: "target",
                        value: mapping.targetElement.name
                    });
                }
                if (mapping.sourceElement) {
                    fixedValuesMapping.push({
                        name: "source",
                        value: mapping.sourceElement.name
                    });
                }

                if (mapping.type === 'ConstantElementMapping') {
                    // ConstantElementMapping related attributes
                    if (mapping.isNull !== undefined && mapping.isNull !== null) {
                        fixedValuesMapping.push({
                            name: "null",
                            value: mapping.isNull
                        });
                    }
                    if (mapping.value !== undefined && mapping.value !== null) {
                        fixedValuesMapping.push({
                            name: "value",
                            value: mapping.value
                        });
                    }
                }

                return writer.writeElement(mapping, parent, "mapping", attributeMapping, fixedValuesMapping);
            },

            renderLogicalModel: function(writer, parent, viewNode, renderDataSource, variableMappingsElement, columnView) {
                var viewNodeInput;
                if(viewNode && viewNode.type === 'JoinNode'){
                    for(var i = 0; i < viewNode.inputs.count(); i++){
                                                                                if(viewNode.inputs.getAt(i) && viewNode.inputs.getAt(i).getSource() instanceof viewmodel.ViewNode){
                                                                                                viewNodeInput = viewNode.inputs.getAt(i); 
                                                                                                break;
                                                                                }
                                                    }
                }else{
                    viewNodeInput = viewNode.getDefaultInput();
                } 
                
                var id = viewNode.isScriptNode() ? viewNode.name : renderDataSource(viewNodeInput);

                var logicalModelElementName = "logicalModel";

                // if no table/view is assigned to Default Node, i.e; if there is no input to default node then id will be null
                if (id) {
                    var fixedValues = [{
                        name: "id",
                        value: id
                    }];
                }

                var logicalModelElement = writer.writeElement(viewNode, parent, logicalModelElementName, null, fixedValues);

                var attributesElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "attributes");
                var calculatedAttributesElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "calculatedAttributes");
                var baseMeasuresElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "baseMeasures");
                var calculatedMeasuresElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "calculatedMeasures");
                var restrictedMeasuresElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "restrictedMeasures");

                var that = this;
                var order = 1;
                viewNode.elements.foreach(function(element) {
                    var nextOrder;
                    if (!element.name.match(/[$]local$/)) {
                        nextOrder = order++;
                    } else {
                        nextOrder = undefined;
                    }
                    
                    // To idetify a measure as restrictedMeasures or COUNTER we use measureType
                    // It is easy to distinguish between attribute and measure based on aggregationBehavior behaviour 
                    // But since web ide editor can save model without necessary data distinguishing among measure is difficult
                    if (element.measureType !== null && element.measureType !== undefined) {
                        switch (element.measureType) {
                            case viewmodel.MeasureType.RESTRICTION:
                                that.renderMeasure(writer, restrictedMeasuresElement, element, nextOrder, true);
                                break;
                            case viewmodel.MeasureType.COUNTER:
                                that.renderMeasure(writer, calculatedMeasuresElement, element, nextOrder, true);
                                break;
                            case viewmodel.MeasureType.CALCULATED_MEASURE:
                                that.renderMeasure(writer, calculatedMeasuresElement, element, nextOrder, true);
                                break;    
                        }
                    } else {
                        if (element.aggregationBehavior === "none") { //small case aggregationBehavior
                            if (element.calculationDefinition !== undefined && element.calculationDefinition.formula !== undefined) {
                                that.renderAttribute(writer, calculatedAttributesElement, element, nextOrder, true);
                            } else {
                                that.renderAttribute(writer, attributesElement, element, nextOrder);
                           }
                        } else {
                            //Ideally flow will reach here for Measure and calculatedMeasure only(restrictedMeasures and COUNTER have been handeled above)
                            if (element.calculationDefinition !== undefined && element.calculationDefinition.formula !== undefined && element.calculationDefinition.formula !== null) {
                                that.renderMeasure(writer, calculatedMeasuresElement, element, nextOrder, true);
                            } else if (element.restriction) {
                                that.renderMeasure(writer, restrictedMeasuresElement, element, nextOrder, true);
                            } else {
                                that.renderMeasure(writer, baseMeasuresElement, element, nextOrder);
                            }
                        }
                    }
                });

                if (columnView.dataCategory === "CUBE") {
                    var localDimensionsElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "localDimensions");
                    // var localDimensionElement;
                    columnView.inlineHierarchies.foreach(function(inlineHiearchy) {
                       var localDimensionElementNodeInfo = writer.createElement(viewNode, "localDimension", null, [{
                            name: "id",
                            value: inlineHiearchy.name
                        }]);
                        writer.writeNode(localDimensionElementNodeInfo, localDimensionsElement);
                        //attributeref need to be build
                        var hierarchiesElement = writer.createElement(viewNode, "hierarchies");
                        that.renderHiearchy(writer, viewNode, hierarchiesElement, inlineHiearchy, "hierarchy", localDimensionElementNodeInfo);
                        
                    });
                }
                
                //Star Join Code - START
                if(viewNode && viewNode.type === 'JoinNode'){
                                                                                that.createLogicalJoinForSharedCV(writer, viewNode, logicalModelElement, logicalModelElementName, columnView);
                                                                }
                // Star Join Code - END
                
                //parameterMapping
                for(var i = 0; i < viewNode.inputs.count(); i++){
                     var input = viewNode.inputs.getAt(i);
                     if(input && input.getSource() && input.getSource() instanceof viewmodel.Entity && input.selectAll){
                         if (input.parameterMappings && input.parameterMappings.count() > 0) {
                                input.parameterMappings.foreach(function(parameterMapping) {
                                                RepositoryXmlRendererHelper.renderVariableMapping(writer, variableMappingsElement, input, parameterMapping, "mapping", null, true);
                                });
                        }
                     }else if(input && input.getSource() && input.getSource() instanceof viewmodel.Entity && (input.selectAll === undefined || input.selectAll === false)){
                        if (input.parameterMappings && input.parameterMappings.count() > 0) {
                                input.parameterMappings.foreach(function(parameterMapping) {
                                                RepositoryXmlRendererHelper.renderVariableMapping(writer, variableMappingsElement, input, parameterMapping, "mapping", '#' +id);
                                });
                        } 
                     }     
                                                                 }

                return logicalModelElement;
            },
            
            addLanguageAttributeNameIfTextJoin: function(viewNode, resourceUri){
                var join;
                for(var i = 0; i < viewNode.joins.count(); i++){
                    join = viewNode.joins.getAt(i);
                    var rightInput = join.rightInput;
                    var source = rightInput.getSource();
                    var entityResourceUri = this.getResourceUri(source);
                    if(resourceUri === entityResourceUri){
                        break;
                    }
                }    
                if(join && join.languageColumn !== "" && join.languageColumn !== undefined){
                    return join.languageColumn;
                }      
            },
            
            //Star Join Code - START
            createLogicalJoinForSharedCV: function(writer, viewNode, logicalModelElement, logicalModelElementName, columnView){
                var that = this;
                 var sharedDimensionsElement = writer.writeIntermediateElement(viewNode, logicalModelElement, logicalModelElementName, "sharedDimensions");
                 
                 var logicalJoinElement;
                 var resourceUri;
                 var source;
                 var resourceUriLogicalJoinPairs = [];
                 for(var i = 0; i < viewNode.inputs.count(); i++){
                     var input = viewNode.inputs.getAt(i);
                     if(input && input.getSource() && input.getSource() instanceof viewmodel.Entity && input.selectAll){
                        source = input.getSource();
                        resourceUri = that.getResourceUri(source);
                        var fixedValues = [{
                            name: "associatedObjectUri",
                            value: resourceUri
                        }];
                        
                        var languageAttributeName = this.addLanguageAttributeNameIfTextJoin(viewNode, resourceUri);
                        if(languageAttributeName){
                            fixedValues.push({
                            name: "languageAttributeName",
                            value: languageAttributeName
                            });
                        }    
                        
                        logicalJoinElement = writer.writeIntermediateElement(source, sharedDimensionsElement, "sharedDimensions", "logicalJoin", null, fixedValues);
                        // writer.writeTextContent(logicalJoinElement, resourceUri);
                        var resourceUriLogicalJoinPair = {
                                fqName: source.getFullyQualifiedName(),
                                resourceUri: resourceUri,
                                logicalJoinElement: logicalJoinElement
                            };
                        resourceUriLogicalJoinPairs.push(resourceUriLogicalJoinPair);    
                     }
                 }
                 
                var measureGroupattributesElement = that.getAttributesElement(logicalModelElement);
                var resourceUriAssociatedAttributeFeaturesElementPairs = [];
                var attributeReferenceDOMElementForSharedElements = [];
                 var starJoinPrivateJoinAttributes = [];
                 for(i = 0; i < viewNode.joins.count(); i++){
                    var join = viewNode.joins.getAt(i);
                    var leftInput = join.leftInput;
                    var rightInput = join.rightInput;
                    source = rightInput.getSource();
                    resourceUri = that.getResourceUri(source);
                    logicalJoinElement = that.getLogicalJoinElementByResourceUri(resourceUri, resourceUriLogicalJoinPairs);
                    var attributesElement;
                    if(join.leftElements.count() > 0 && logicalJoinElement){
                         attributesElement = writer.writeIntermediateElement(source, logicalJoinElement, logicalModelElementName, "attributes", null, null);
                    }
                    for(var index = 0; index < join.leftElements.count(); index++){
                        var joinLeftElement = join.leftElements.getAt(index);
                        // Same attribute may be used in multiple joins; don't create duplicates
                                                                                //first check, is it already being added to logicalModel? Also attributeName should be suffixed with  $local
                                                                               var attributeName = joinLeftElement.name;
                                                                                var joinAttributeName = attributeName + "$local";
                                                                                var joinAttrElement = that.getStarJoinPrivateJoinAttribute(starJoinPrivateJoinAttributes, attributeName);
                                                                                if(joinAttrElement === undefined){
                                                                                    joinAttrElement = that.renderStarJoinPrivateJoinAttribute(writer, joinLeftElement, measureGroupattributesElement, leftInput.getSource(), attributeName, joinAttributeName);
                                                                                var starJoinPrivateJoinAttribute = {
                                attributeName: attributeName,
                                joinAttrElement: joinAttrElement
                            };
                            starJoinPrivateJoinAttributes.push(starJoinPrivateJoinAttribute);  
                                                                                }  
                                                                                var attributeRefElement = writer.writeIntermediateElement(source, attributesElement, "attributes", "attributeRef", null, null);
                                                                                writer.writeTextContent(attributeRefElement, RepositoryXmlRendererHelper.addHashTag(joinAttributeName));
                    }
                    var associatedAttributeNamesElement;
                    if(join.rightElements.count() > 0 && logicalJoinElement){
                         associatedAttributeNamesElement = writer.writeIntermediateElement(source, logicalJoinElement, logicalModelElementName, "associatedAttributeNames", null, null);
                    }
                    for(index = 0; index < join.rightElements.count(); index++){
                        var joinRightElement = join.rightElements.getAt(index);
                        // var rightJoinAttributeName = joinRightElement.name;
                        var rightJoinAttributeName = RepositoryXmlRendererHelper.deriveElementOriginalName(joinRightElement);  
                        var attributeNameElement = writer.writeIntermediateElement(source, associatedAttributeNamesElement, "associatedAttributeNames", "attributeName", null, null);
                                                                                writer.writeTextContent(attributeNameElement, rightJoinAttributeName);
                    }  
                    var joinFixedValues = RepositoryXmlRendererHelper.populateJoinNodeFixedValues(join, true);
                    joinFixedValues.push({
                            name: "joinOperator",
                            value: "Equal"
                        });
                        
                    writer.writeIntermediateElement(source, logicalJoinElement, logicalModelElementName, "properties", null, joinFixedValues);
                    
                    var associatedAttributeFeaturesElement = writer.writeIntermediateElement(source, logicalJoinElement, logicalModelElementName, "associatedAttributeFeatures", null, null);
                    resourceUriAssociatedAttributeFeaturesElementPairs.push({
                        resourceUri: resourceUri,
                        associatedAttributeFeaturesElement: associatedAttributeFeaturesElement
                    });
                    var elemFeatAttrRefs = [];
                    // var attributeReferenceDOMElementForSharedElements = [];
                    for(index = 0; index < rightInput.mappings.count(); index++){
                        var mapping = rightInput.mappings.getAt(index);
                        if(mapping.type === viewmodel.MappingType.ElementMapping){
                            var attributeReferenceFixedAttributes = [];
                            if(mapping.aliasName){
                                attributeReferenceFixedAttributes.push({
                                    name: "alias",
                                    value: mapping.aliasName
                                });
                            }
                            var originalElementName = RepositoryXmlRendererHelper.deriveElementOriginalName(mapping.sourceElement);  
                            attributeReferenceFixedAttributes.push({
                                name: "attributeName",
                                value: originalElementName
                            });
                            /*attributeReferenceFixedAttributes.push({
                                name: "attributeName",
                                value: mapping.sourceElement.name
                            });*/
                            if(mapping.transparentFilter){
                                attributeReferenceFixedAttributes.push({
                                    name: "transparentFilter",
                                    value: mapping.transparentFilter
                                });    
                            }    
                            var isItExcludedElement = this.isItExcludedElement(mapping.sourceElement, rightInput.excludedElements);
                            if(isItExcludedElement){
                               attributeReferenceFixedAttributes.push({
                                    name: "hidden",
                                    value: true
                                }); 
                                elemFeatAttrRefs.push(mapping.sourceElement);
                            }
                            var attributeReferenceElement = writer.writeIntermediateElement(source, associatedAttributeFeaturesElement, "associatedAttributeFeatures", "attributeReference", null, attributeReferenceFixedAttributes);
                            RepositoryXmlRendererHelper.renderDescriptions(mapping, attributeReferenceElement, "attributeReference", writer); 
                            attributeReferenceDOMElementForSharedElements.push({
                                    sharedElement: mapping.sourceElement,
                                    attributeReferenceElement: attributeReferenceElement
                            });
                            // this.renderVariableTagForSharedColumn(writer, mapping.sourceElement, columnView, attributeReferenceElement, "attributeReference");
                        } 
                    }
                    for(index = 0; index < rightInput.excludedElements.count(); index++){
                        var excludedElement = rightInput.excludedElements.getAt(index);
                        var isExcludedElementProcessed = this.isExcludedElementProcessed(excludedElement, elemFeatAttrRefs);
                        if(!isExcludedElementProcessed){
                            attributeReferenceFixedAttributes = [];
                            /*attributeReferenceFixedAttributes.push({
                                name: "attributeName",
                                value: excludedElement.name
                            });*/
                            var originalElementName = RepositoryXmlRendererHelper.deriveElementOriginalName(excludedElement);  
                            attributeReferenceFixedAttributes.push({
                                name: "attributeName",
                                value: originalElementName
                            });
                            attributeReferenceFixedAttributes.push({
                                    name: "hidden",
                                    value: true
                            }); 
                            writer.writeIntermediateElement(source, associatedAttributeFeaturesElement, "associatedAttributeFeatures", "attributeReference", null, attributeReferenceFixedAttributes);
                        }
                        
                    }    
                    // this.renderVariableTagForSharedColumn(writer, columnView, "attributeReference", attributeReferenceDOMElementForSharedElements, resourceUriAssociatedAttributeFeaturesElementPairs);
                 }
                 this.renderVariableTagForSharedColumn(writer, columnView, "attributeReference", attributeReferenceDOMElementForSharedElements, resourceUriAssociatedAttributeFeaturesElementPairs);
            },
            
            getAttributeReferenceDOMElementForSharedElement: function(sharedElement, attributeReferenceDOMElementForSharedElements){
                for(var index = 0; index < attributeReferenceDOMElementForSharedElements.length; index++){
                    // if(attributeReferenceDOMElementForSharedElements[index].sharedElement.name === sharedElement.name){
                    if(attributeReferenceDOMElementForSharedElements[index].sharedElement === sharedElement){
                        return attributeReferenceDOMElementForSharedElements[index].attributeReferenceElement;
                    }
                }
            },
            
            renderVariableTagForSharedColumn: function(writer, columnView, parentName, attributeReferenceDOMElementForSharedElements, resourceUriAssociatedAttributeFeaturesElementPairs){
                //For AssignedElements -- Start
                var that = this;
                var tempParameter = null;
                if (columnView !== null && columnView !== undefined) {
                    columnView.parameters.foreach(function(parameter) {
                        parameter.assignedElements.foreach(function(element) {
                            var assignedEContainer = element.$getContainer();
                            if(assignedEContainer instanceof viewmodel.Entity){
                                tempParameter = parameter;
                            }else{
                                 tempParameter = null;
                            }
                            if (tempParameter !== null && tempParameter !== undefined) {
                                var parent = that.getAttributeReferenceDOMElementForSharedElement(element, attributeReferenceDOMElementForSharedElements);
                                if(parent === undefined){
                                    var resourceUri = that.getResourceUri(assignedEContainer);
                                    var associatedAttributeFeaturesElement = that.getAssociatedAttributeFeaturesElementByResourceUri(resourceUri, resourceUriAssociatedAttributeFeaturesElementPairs);
                                    var fixedAttributeReferenceAttributes = [];
                                    /*fixedAttributeReferenceAttributes.push({
                                        name: "attributeName",
                                        value: element.name
                                    }); */
                                    var originalElementName = RepositoryXmlRendererHelper.deriveElementOriginalName(element);  
                                    fixedAttributeReferenceAttributes.push({
                                        name: "attributeName",
                                        value: originalElementName
                                    }); 
                                    parent = writer.writeIntermediateElement(element, associatedAttributeFeaturesElement, "associatedAttributeFeatures", "attributeReference", null, fixedAttributeReferenceAttributes);
                                }
                                var localVariable = writer.writeIntermediateElement(element, parent, parentName, "localVariable");
                                //writer.writeTextContent(localVariable, "#" + tempParameter.name);
                                writer.writeTextContent(localVariable, tempParameter.name);
                            }
                        });

                    });
                }
                //For AssignedElements -- End    
            },   
            
            isItExcludedElement: function(sharedElement, excludedElements){
                for(var index = 0; index < excludedElements.count(); index++){
                    if(excludedElements.getAt(index).name === sharedElement.name){
                        return true;
                    }
                }
                return false;
            },  
            
            isExcludedElementProcessed: function(excludedElement, elemFeatAttrRefs){
                for(var index = 0; index < elemFeatAttrRefs.length; index++){
                    if(elemFeatAttrRefs[index].name === excludedElement.name){
                        return true;
                    }
                }
            },
            
            getResourceUri: function(entity){
                var entityType = entity.type;
                //Map EntityType To ResourceType ToBe Used In Resource URI
                var typeUsedToCreateResourceUri = RepositoryXmlRendererHelper.mapEntityTypeToResourceTypeToBeUsedInResourceURI(entityType);
                var fqName = FullQualifiedName.createForRepositoryObject(entity.packageName, entity.name, typeUsedToCreateResourceUri);
                var resourceUri = fqName.getResourceUri();
                return resourceUri;
            },
            
            getAttributesElement: function(logicalModelElement){
                for(var index = 0; index < logicalModelElement.childNodes.length; index++){
                    if(logicalModelElement.childNodes[index].nodeName === "attributes"){
                        return logicalModelElement.childNodes[index];
                    }
                }
            },
            
            getAssociatedAttributeFeaturesElement: function(logicalModelElement){
                for(var index = 0; index < logicalModelElement.childNodes.length; index++){
                    if(logicalModelElement.childNodes[index].nodeName === "attriassociatedAttributeFeaturesbutes"){
                        return logicalModelElement.childNodes[index];
                    }
                }
            },
            
            getStarJoinPrivateJoinAttribute: function(starJoinPrivateJoinAttributes, attributeName){
                var joinAttrElement;
                for(var index = 0; index < starJoinPrivateJoinAttributes.length; index++){
                    var starJoinPrivateJoinAttribute = starJoinPrivateJoinAttributes[index];
                    if(starJoinPrivateJoinAttribute.attributeName === attributeName){
                        joinAttrElement = starJoinPrivateJoinAttribute.joinAttrElement;   
                        return joinAttrElement;
                    }
                }
            },
            
            renderStarJoinPrivateJoinAttribute: function(writer, element, parent, source, elementName, newAttributeName){
                // newAttributeName = RepositoryXmlRendererHelper.addHashTag(newAttributeName);
                var fixedAttributeValues = [{
                                name: "id",
                                value: newAttributeName
                            }];
                var attributeElement = writer.writeElement(element, parent, "attribute", null, fixedAttributeValues);
                var fixedMappingValues = [];
                 fixedMappingValues.push({
                    name: "columnObjectName",
                    value: source.name
                });
                 fixedMappingValues.push({
                                name: "columnName",
                                value: elementName
                });
                writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);                      
                return attributeElement;
            },
            
            getLogicalJoinElementByResourceUri: function(resourceUri, resourceUriLogicalJoinPairs){
                var logicalJoinElement;
                for(var index = 0; index < resourceUriLogicalJoinPairs.length; index++){
                    var resourceUriLogicalJoinPair = resourceUriLogicalJoinPairs[index];
                    if(resourceUriLogicalJoinPair.resourceUri === resourceUri){
                        logicalJoinElement = resourceUriLogicalJoinPair.logicalJoinElement;   
                        return logicalJoinElement;
                    }
                }
            },
            
            getAssociatedAttributeFeaturesElementByResourceUri: function(resourceUri, resourceUriAssociatedAttributeFeaturesElementPairs){
                var associatedAttributeFeaturesElement;
                for(var index = 0; index < resourceUriAssociatedAttributeFeaturesElementPairs.length; index++){
                    var resourceUriLogicalJoinPair = resourceUriAssociatedAttributeFeaturesElementPairs[index];
                    if(resourceUriLogicalJoinPair.resourceUri === resourceUri){
                        associatedAttributeFeaturesElement = resourceUriLogicalJoinPair.associatedAttributeFeaturesElement;   
                        return associatedAttributeFeaturesElement;
                    }
                }
            },
            // Star Join Code - END
            
            renderHiearchy: function(writer, viewNode, hierarchiesElement, inlineHiearchy, hierarchyElementName, localDimensionElementNodeInfo){
                var that = this;
                var fixedValues = this.buildHiearchyAttributes(inlineHiearchy);
                        
                        var dimensionType = function(value) {
                            return writer.addPrefix(sharedmodel.NameSpace.DIMENSION, value);
                        };
                        var hierarchyElement = writer.writeElement(inlineHiearchy, hierarchiesElement, hierarchyElementName, {
                            type: Util.createXsiSelector("type", dimensionType)
                        }, fixedValues);
                        
                        RepositoryXmlRendererHelper.renderDescriptions(inlineHiearchy, hierarchyElement, hierarchyElementName, writer); 
                        
                        var attributeRef = [];
                        if (inlineHiearchy.type === "LeveledHierarchy") {
                            var levelsElement = writer.writeIntermediateElement(viewNode, hierarchyElement, hierarchyElementName, "levels");
                            var order = 1;
                            inlineHiearchy.levels.foreach(function(level) {
                                var fixedValues = [];
                                if (level.element && level.element.name) {
                                    var elementName = "#" + level.element.name;
                                    fixedValues.push({
                                        name: "levelAttribute",
                                        value: elementName
                                    });
                                    if (attributeRef.indexOf(elementName) === -1) {
                                        attributeRef.push(elementName);
                                    }
                                }
                                if (level.levelType) {
                                    fixedValues.push({
                                        name: "levelType",
                                        value: level.levelType
                                    });
                                }
                                fixedValues.push({
                                                        name: "order",
                                                        value: order         
                                      });
                                     order = order +1;
                                if (level.orderElement && level.orderElement.name) {
                                    var elementName = "#" + level.orderElement.name;
                                    fixedValues.push({
                                        name: "orderAttribute",
                                        value: elementName
                                    });
                                }
                                if (level.sortDirection) {
                                    fixedValues.push({
                                        name: "sortDirection",
                                        value: level.sortDirection
                                    });
                                }
                                var descriptionsElement = writer.writeIntermediateElement(viewNode, levelsElement, "levels", "level", null, fixedValues);
                            });
                        } else if (inlineHiearchy.type === "ParentChildHierarchy") {
                            if (inlineHiearchy.parentDefinitions) {
                                inlineHiearchy.parentDefinitions.foreach(function(parent) {
                                    var attributeParentPairAttributes = [];
                                    if (parent.element && parent.element.name) {
                                        var elementName = "#" + parent.element.name;
                                        attributeParentPairAttributes.push({
                                            name: "attribute",
                                            value: elementName
                                        });
                                        if (attributeRef.indexOf(elementName) == -1) {
                                            attributeRef.push(elementName);
                                        }
                                    }
                                    if (parent.parent && parent.parent.name) {
                                        var elementName = "#" + parent.parent.name;
                                        attributeParentPairAttributes.push({
                                            name: "parentAttribute",
                                            value: elementName
                                        });
                                        if (attributeRef.indexOf(elementName) == -1) {
                                            attributeRef.push(elementName);
                                        }
                                    }
                                    if (parent.stepParentNodeID && parent.stepParentNodeID) {
                                        attributeParentPairAttributes.push({
                                            name: "stepParentNodeID",
                                            value: parent.stepParentNodeID
                                        });
                                    }
                                    var attributeParentPairElement = writer.writeIntermediateElement(viewNode, hierarchyElement, hierarchyElementName, "attributeParentPair", null, attributeParentPairAttributes);
                                    that.renderUDFParameter(writer, parent, parent.rootNode, "rootNode", attributeParentPairElement);
                                });
                            }
                            if (inlineHiearchy.siblingOrders) {
                                inlineHiearchy.siblingOrders.foreach(function(siblingOrder) {
                                    var siblingOrderAttributes = [];
                                    if (siblingOrder.byElement && siblingOrder.byElement.name) {
                                        var elementName = "#" + siblingOrder.byElement.name;
                                        siblingOrderAttributes.push({
                                            name: "byAttribute",
                                            value: elementName
                                        });
                                    }
                                    if (siblingOrder.direction && siblingOrder.direction) {

                                        siblingOrderAttributes.push({
                                            name: "direction",
                                            value: siblingOrder.direction
                                        });
                                    }
                                    var siblingOrderElement = writer.writeIntermediateElement(viewNode, hierarchyElement, hierarchyElementName, "siblingOrder", null, siblingOrderAttributes);
                                });
                            }
                            if (inlineHiearchy.timeProperties && inlineHiearchy.timeDependent) {
                                var timePropertiesElement = writer.writeIntermediateElement(viewNode, hierarchyElement, "hierarchy", "timeProperties");
                                if (inlineHiearchy.timeProperties.validFromElement && inlineHiearchy.timeProperties.validFromElement.name) {
                                    var validFromElement = writer.writeIntermediateElement(viewNode, timePropertiesElement, "timeProperties", "validFromElement", null, [{
                                        name: "xsi:type",
                                        value: "DataFoundation:Attribute"
                                    }]);
                                    //Since validFromElement does have any Attribute type, so passing Xsitype as fixed Attribute instead of attribute mapping.
                                    //and calling addprefix method with dummy string to add BiDataFoundation attribute in the Calculation:scenario tag for modeler compatabilty
                                    writer.addPrefix(sharedmodel.NameSpace.DATAFOUNDATION, "undefined");
                                    writer.writeTextContent(validFromElement, "#" + inlineHiearchy.timeProperties.validFromElement.name);
                                }
                                if (inlineHiearchy.timeProperties.validToElement && inlineHiearchy.timeProperties.validToElement.name) {
                                    var validToElement = writer.writeIntermediateElement(viewNode, timePropertiesElement, "timeProperties", "validToElement", null, [{
                                        name: "xsi:type",
                                        value: "DataFoundation:Attribute"
                                    }]);
                                    //Since validToElement does have any Attribute type, so passing Xsitype as fixed Attribute instead of attribute mapping.
                                    //and calling addprefix method with dummy string to add BiDataFoundation attribute in the Calculation:scenario tag for modeler compatabilty
                                    writer.addPrefix(sharedmodel.NameSpace.DATAFOUNDATION, "undefined");
                                    writer.writeTextContent(validToElement, "#" + inlineHiearchy.timeProperties.validToElement.name);
                                }
                                if (inlineHiearchy.timeProperties.fromParameter && inlineHiearchy.timeProperties.fromParameter.name) {
                                    var fromParameterElement = writer.writeIntermediateElement(viewNode, timePropertiesElement, "timeProperties", "fromVariable");
                                    writer.writeTextContent(fromParameterElement, "#" + inlineHiearchy.timeProperties.fromParameter.name);
                                }
                                if (inlineHiearchy.timeProperties.toParameter && inlineHiearchy.timeProperties.toParameter.name) {
                                    var toParameterElement = writer.writeIntermediateElement(viewNode, timePropertiesElement, "timeProperties", "toVariable");
                                    writer.writeTextContent(toParameterElement, "#" + inlineHiearchy.timeProperties.toParameter.name);
                                }
                                if (inlineHiearchy.timeProperties.pointInTimeParameter && inlineHiearchy.timeProperties.pointInTimeParameter.name) {
                                    var pointInTimeParameterElement = writer.writeIntermediateElement(viewNode, timePropertiesElement, "timeProperties", "pointInTimeVariable");
                                    writer.writeTextContent(pointInTimeParameterElement, "#" + inlineHiearchy.timeProperties.pointInTimeParameter.name);
                                }
                            }
                            if (inlineHiearchy.edgeAttributes) {
                                inlineHiearchy.edgeAttributes.foreach(function(edge) {
                                   var edgeAttributes = [];
                                    if (edge.element && edge.element.name) {

                                        edgeAttributes.push({
                                            name: "attribute",
                                            value: "#" + edge.element.name
                                        });
                                    }
                                    var edgeAttributeElement = writer.writeIntermediateElement(viewNode, hierarchyElement, hierarchyElementName, "edgeAttribute", null, edgeAttributes);

                                });
                            }

                        }
                        if(localDimensionElementNodeInfo){
                            for (var index = 0; index < attributeRef.length; index++) {
                               if(index === 0){
                                writer.addPrefix(sharedmodel.NameSpace.DATAFOUNDATION, "undefined");
                               }
                                var attributeRefElementNodeInfo = writer.createElement(viewNode, "attributeRef", null, [{
                                        name: "xsi:type",
                                        value: "DataFoundation:Attribute"
                                    }]);
                                    //Since attributeRefElementNodeInfo does have any Attribute type, so passing Xsitype as fixed Attribute instead of attribute mapping.
                                    //and calling addprefix method with dummy string to add BiDataFoundation attribute in the Calculation:scenario tag for modeler compatabilty
                                var attributeRefElement = writer.writeNode(attributeRefElementNodeInfo, localDimensionElementNodeInfo);
                                writer.writeTextContent(attributeRefElement, attributeRef[index]);
                            }
                            writer.writeNode(hierarchiesElement, localDimensionElementNodeInfo);
                        }
            },
            
            buildHiearchyAttributes: function(inlineHiearchy){
                var fixedValues = [];
                if (inlineHiearchy.name) {
                            fixedValues.push({
                                name: "id",
                                value: inlineHiearchy.name
                            });
                        }
                        if (inlineHiearchy.aggregateAllNodes) {
                            fixedValues.push({
                                name: "aggregateAllNodes",
                                value: inlineHiearchy.aggregateAllNodes
                            });
                        }
                        if (inlineHiearchy.defaultMember) {
                            fixedValues.push({
                                name: "defaultMember",
                                value: inlineHiearchy.defaultMember
                            });
                        }
                        if (inlineHiearchy.multipleParents) {
                            fixedValues.push({
                                name: "multipleParents",
                                value: inlineHiearchy.multipleParents
                            });
                        }
                        if (inlineHiearchy.orphanedNodesHandling) {
                            fixedValues.push({
                                name: "orphanedNodesHandling",
                                value: inlineHiearchy.orphanedNodesHandling
                            });
                        }
                        if (inlineHiearchy.rootNodeVisibility) {
                            fixedValues.push({
                                name: "rootNodeVisibility",
                                value: inlineHiearchy.rootNodeVisibility
                            });
                            var withRootNode;
                            if(inlineHiearchy.rootNodeVisibility == "ADD_ROOT_NODE"){
                                withRootNode =  "true";
                                fixedValues.push({
                                    name: "withRootNode",
                                    value: withRootNode
                                });
                            }else if (inlineHiearchy.rootNodeVisibility == "DO_NOT_ADD_ROOT_NODE"){
                                withRootNode =  "false";
                                fixedValues.push({
                                    name: "withRootNode",
                                    value: withRootNode
                                });
                            }
                            
                        }
                        if (inlineHiearchy.nodeStyle) {
                            fixedValues.push({
                                name: "nodeStyle",
                                value: inlineHiearchy.nodeStyle
                            });
                        }
                        if (inlineHiearchy.stepParentNodeID) {
                            fixedValues.push({
                                name: "stepParentNodeID",
                                value: inlineHiearchy.stepParentNodeID
                            });
                        }
                        return fixedValues;
            },
            
            getStarJoinViewNodeInput: function(viewNode){
                var input;
                for(var i = 0; i < viewNode.inputs.count(); i++){
                                                                                if(viewNode.inputs.getAt(i) && viewNode.inputs.getAt(i).getSource() instanceof viewmodel.ViewNode){
                                                                                                input = viewNode.inputs.getAt(i); 
                                                                                                break;
                                                                                }
                                                    } 
                                                    return input;
            },

            renderAttribute: function(writer, parent, element, order, isCalculatedAttribute) {
                var fixedValues = [];

                /*if (element.labelElement !== undefined && element.labelElement.indexOf('.description') > -1) {
                    return;
                }*/

                var viewNode = element.$getContainer();
                
                var starJoinViewNodeInput;
                var isStarJoin = false;
                if(viewNode && viewNode.type === 'JoinNode'){
                                                                                starJoinViewNodeInput = this.getStarJoinViewNodeInput(viewNode);
                                                                                isStarJoin = true;
                                                                }

                RepositoryXmlRendererHelper.processAttributeProperties(element, order, isCalculatedAttribute, fixedValues);

                if (!viewNode.isScriptNode() && !element.name.match(/[$]local$/)) {
                    RepositoryXmlRendererHelper.processDrillDownEnablement(element, fixedValues);
                }

                if (element.transparentFilter) {
                    fixedValues.push({
                        name: "transparentFilter",
                        value: element.transparentFilter
                    });
                }

                var tagName = isCalculatedAttribute ? "calculatedAttribute" : "attribute";
		if(element.hasNoMapping){
                    console.log("element has No Mapping");
                }else{
                    console.log("element has Mapping");
                    
                }

                var attributeElement = writer.writeElement(element, parent, tagName, {
                    name: "{id}"
                }, fixedValues);
                
                RepositoryXmlRendererHelper.renderDescriptions(element, attributeElement, tagName, writer); 

                if (element.inlineType.semanticType !== undefined && (element.inlineType.semanticType === 'amount' ||
                    element.inlineType.semanticType === 'quantity')) {
                    if (element.unitCurrencyElement) {
                        writer.writeIntermediateElement(element, attributeElement, tagName, "unitCurrencyAttribute", null, [{
                            name: "attributeName",
                            value: element.unitCurrencyElement.name
                        }]);
                    }
                }
                if (element.fixedCurrency) {
                    var fixedCurrencyElement = writer.writeIntermediateElement(element, attributeElement, tagName, "fixedCurrency");
                    writer.writeTextContent(fixedCurrencyElement, element.fixedCurrency);
                }
                if (element.fixedUnit) {
                    var fixedUnitElement = writer.writeIntermediateElement(element, attributeElement, tagName, "fixedUnit");
                    writer.writeTextContent(fixedUnitElement, element.fixedUnit);
                }
                
                this.renderParameterOrAttributeTypeOfElement(writer, null, null, false, attributeElement, element);
                this.renderParameterOrAttributeExternalTypeOfElement(writer, null, null, false, attributeElement, element);
                this.renderAttributeExternalTypeOfElementParameterMapping(writer, element, attributeElement);

                //For AssignedElements -- Start
                var tempParameter = null;
                var columnView = element.$getContainer().$getContainer();
                if (columnView !== null && columnView !== undefined /*&& columnView instanceof model.ColumnView*/ ) {
                    columnView.parameters.foreach(function(parameter) {
                        parameter.assignedElements.foreach(function(element1) {
                            var assignedEContainer = element1.$getContainer();
                            if(assignedEContainer instanceof viewmodel.ViewNode){
                                if (element.name === element1.name) {
                                    tempParameter = parameter;
                                }
                            }
                        });

                    });
                }
                if (tempParameter !== null && tempParameter !== undefined) {
                    var localVariable = writer.writeIntermediateElement(element, attributeElement, tagName, "localVariable");
                    //writer.writeTextContent(localVariable, "#" + tempParameter.name);
                    writer.writeTextContent(localVariable, tempParameter.name);
                }
                //For AssignedElements -- End

                if (element.calculationDefinition && element.calculationDefinition.formula !== undefined && element.calculationDefinition.formula !== null) {
                    if(element.calculationDefinition.expressionLanguage){
                    var fixedMappingValues = [];
                     fixedMappingValues.push({
                            name: "expressionLanguage",
                            value: element.calculationDefinition.expressionLanguage
                        });
                    }
                    var keyCalculationElement = writer.writeElement(element.inlineType, attributeElement, "keyCalculation", {
                        primitiveType: "{datatype}",
                        length: "{length}",
                        scale: "{scale}"
                    }, fixedMappingValues);
                    var formulaElement = writer.writeIntermediateElement(element, keyCalculationElement, "keyCalculation", "formula");
                    writer.writeTextContent(formulaElement, element.calculationDefinition.formula);
                }
                
                var mapping;
                if(isStarJoin){
                    mapping = element.getStarJoinPrivateElementMapping(starJoinViewNodeInput);    
                }else{
                    mapping = element.getMapping();    
                }
                
                var fixedMappingValues = [];
                if (mapping) {
                    var source = mapping.$getContainer().getSource();
                    if (source instanceof viewmodel.Entity) {
                        //Only tables and database views will have schemaName; designtime views will not have schemaName
                        if(source.schemaName){
                            fixedMappingValues.push({
                            name: "schemaName",
                            value: source.schemaName
                            });
                        }
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

                    // If input has alias sace it in keyMapping
                    var input = mapping.$getContainer();
                    if (input.alias) {
                        fixedMappingValues.push({
                            name: "alias",
                            value: input.alias
                        });
                    }

                    fixedMappingValues.push({
                        name: "columnName",
                        value: mapping.sourceElement.name
                    });
                    // writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);
                    writer.writeElement(mapping, attributeElement, "keyMapping", null, fixedMappingValues);
                } else if (viewNode.isScriptNode()) {
                    fixedMappingValues.push({
                        name: "columnObjectName",
                        value: viewNode.name
                    });
                    fixedMappingValues.push({
                        name: "columnName",
                        value: element.name
                    });
                    writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);
                }
                
                //Element's with no mapping
                if(mapping === undefined && element.hasNoMapping){
                    console.log("element has No Mapping");
                }
                
                //Test Code - Delete it later
                if (fixedMappingValues) {
                    var fixedMappingValuesSize = Object.keys(fixedMappingValues).length;
                }
                // writer.writeElement(element, attributeElement, "keyMapping", null, fixedMappingValues);

                //TODO - descriptionMapping
               // var fixeddescriptionMappingValues = [];    
                /*
                if (element.labelElement !== undefined && && element.labelElement.indexOf('.description') > -1) {
                    for (var i in fixedMappingValuesSize) {
                        if (fixedMappingValuesSize[i].name === "columnName") {
                            var labelElementName = labelElement.getMapping().sourceElement.name;
                            fixedMappingValuesSize[i].value = labelElementName;
                            break; //Stop this loop, we found it!
                         }
                    }
                    writer.writeElement(element, attributeElement, "descriptionMapping", null, fixedMappingValues);
                }    
                */
		if(element.hasNoMapping){
                    //console.log("element has No Mapping");
                    //var result = new StableOrderText(value);
                    //attributeElement.childNodes.add(result);
                    var firstTextNode = attributeElement.childNodes[0];
                    var textNode = writer._xmlDocument.createTextNode(firstTextNode.nodeValue);
                    attributeElement.childNodes.push(textNode);
                }


                return attributeElement;
            },

            renderMeasure: function(writer, parent, element, order, forceWriteHidden) {
                var mapAggregationType = function(value) {
                    switch(value){
                        case 'count':
                            return "count";
                        case 'max':
                            return "max";
                        case 'min':
                            return "min";
                        case 'sum':
                            return "sum";
                        case 'formula':
                         // For aggragation type Formula need extra logic to convert it to sum or count
                            if (element.inlineType === undefined || (element.inlineType !== undefined && element.inlineType.primitiveType === undefined)) {
                            return "sum";
                            } else {
                                 if (element.inlineType !== undefined && element.inlineType.primitiveType !== undefined) {
                                var elementPrimitiveType = element.inlineType.primitiveType;
                                }
                                if (elementPrimitiveType) {
                                    switch (elementPrimitiveType) {
                                        case 'BIGINT':
                                        case 'DECIMAL':
                                        case 'DOUBLE':
                                        case 'FLOAT':
                                        case 'INTEGER':
                                        case 'NUMERIC':
                                        case 'REAL':
                                        case 'SMALLDECIMAL':
                                        case 'SMALLINT':
                                        case 'TINYINT':
                                            return "sum";
                                        default:
                                            return "count";
                                    }
                                }
    
                            }
                    }

                    // Test code to check element's primitiveType value - Delete later
                    if (element.inlineType) {
                        var elementPrimitiveType = element.inlineType.primitiveType;
                    }
                    return value.toLowerCase();
                };
                
                if(element.measureType === viewmodel.MeasureType.COUNTER || element.measureType === viewmodel.MeasureType.CALCULATED_MEASURE){
                    if(element.aggregationBehavior !== "formula"){
                            var isAggregatable = true;
                    }
                }
                
                var starJoinViewNodeInput;
                var isStarJoin = false;
                var viewNode = element.$getContainer();
                if(viewNode && viewNode.type === 'JoinNode'){
                                                                                starJoinViewNodeInput = this.getStarJoinViewNodeInput(viewNode);
                                                                                isStarJoin = true;
                                                                }

                var fixedValues = [];
                if (element.hidden || forceWriteHidden) {
                    if (element.hidden === undefined) {
                        element.hidden = false;
                    }
                    fixedValues.push({
                        name: "hidden",
                        value: element.hidden
                    });
                }
                if (order) {
                    fixedValues.push({
                        name: "order",
                        value: order
                    });
                }
                var measureType = "simple";
                if (element.inlineType && element.inlineType.hasOwnProperty("semanticType")&& element.inlineType.semanticType !== "empty") {
                    fixedValues.push({
                        name: "semanticType",
                        value: element.inlineType.semanticType
                    });
                    measureType = element.inlineType.semanticType;
                }
                if (element.hasOwnProperty("aggregationBehavior")) {
                    var aggregationType = mapAggregationType(element.aggregationBehavior);
                    fixedValues.push({
                        name: "aggregationType",
                        value: aggregationType
                    });
                }
                /*if(element.engineAggregation && viewNode){
                    if(element.aggregationBehavior !== element.engineAggregation){
                        fixedValues.push({
                        name: "engineAggregation",
                        value: mapAggregationType(element.engineAggregation)
                    });
                    }
                }*/
                if(element.engineAggregation && viewNode && element.measuretype === viewmodel.MeasureType.CALCULATED_MEASURE){
                    
                        fixedValues.push({
                        name: "engineAggregation",
                        value: "sum"
                    });
                    
                }
                // element will always have a property restriction since its a containment. Check using Measuretype property
                if (element.measureType) {
                    if (element.measureType !== viewmodel.MeasureType.RESTRICTION) {
                        fixedValues.push({
                            name: "measureType",
                            value: measureType
                        });
                    }
                } else {
                    fixedValues.push({
                        name: "measureType",
                        value: measureType
                    });
                }

                //Counter is added based on elementType
                if (element.measureType === viewmodel.MeasureType.COUNTER) {
                    fixedValues.push({
                        name: "calculatedMeasureType",
                        value: "counter"
                    });
                }
                if(isAggregatable === true){
                    
                            fixedValues.push({
                            name: "aggregatable",
                            value: "true"
                        });
                }
                if (element.inlineType && element.calculationDefinition !== undefined && element.calculationDefinition.formula !== undefined) {
                    if (element.inlineType.primitiveType) {
                        fixedValues.push({
                            name: "datatype",
                            value: element.inlineType.primitiveType
                        });
                    }
                    if (element.inlineType.hasOwnProperty("length")) {
                        fixedValues.push({
                            name: "length",
                            value: element.inlineType.length
                        });
                    }
                    if (element.inlineType.hasOwnProperty("scale")) {
                        fixedValues.push({
                            name: "scale",
                            value: element.inlineType.scale
                        });
                    }
                }
                if (element.displayFolder) {
                    fixedValues.push({
                        name: "displayFolder",
                        value: element.displayFolder
                    });
                }
                
                //Addition check viewmodel.MeasureType.RESTRICTION added
                if (element.calculationDefinition && element.calculationDefinition.formula && element.measureType === viewmodel.MeasureType.RESTRICTION) {
                    fixedValues.push({
                        name: "baseMeasure",
                        //value: "#" + element.calculationDefinition.formula
                        value: element.calculationDefinition.formula
                    });
                }

                if (element.$getContainer() !== null && element.$getContainer().keyElements !== null && element.$getContainer().keyElements.get(element.name)) {
                    fixedValues.push({
                        name: "key",
                        value: true
                    });
                }
		if (element.deprecated) {
                    fixedValues.push({
                        name: "deprecated",
                        value: element.deprecated
                    });
                }

                var measureElement = writer.writeElement(element, parent, "measure", {
                    name: "{id}"
                }, fixedValues);
                
                RepositoryXmlRendererHelper.renderDescriptions(element, measureElement, "measure", writer); 

                // Currency column
                if (element.inlineType !== undefined && element.inlineType.semanticType !== undefined && (element.inlineType.semanticType === 'amount' ||
                    element.inlineType.semanticType === 'quantity')) {
                    if (element.unitCurrencyElement) {
                        var fixedTypeOfElementAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(element.unitCurrencyElement, "dimensionUri", "attributeName");
                        writer.writeIntermediateElement(element, measureElement, "measure", "unitCurrencyAttribute", null,fixedTypeOfElementAttributes);
                    }
                }
                if (element.fixedCurrency) {
                    var fixedCurrencyElement = writer.writeIntermediateElement(element, measureElement, "measure", "fixedCurrency");
                    writer.writeTextContent(fixedCurrencyElement, element.fixedCurrency);
                }
                if (element.fixedUnit) {
                    var fixedUnitElement = writer.writeIntermediateElement(element, measureElement, "measure", "fixedUnit");
                    writer.writeTextContent(fixedUnitElement, element.fixedUnit);
                }

                if (element.currencyConversion) {
                    this.renderCurrencyConversion(writer, element, measureElement);
                }
                if (element.unitConversion) {
                    this.renderUnitConversion(writer, element, measureElement);
                }

                //Counter
                if (element.measureType === viewmodel.MeasureType.COUNTER) {
                    if (element.exceptionAggregationStep !== null && element.exceptionAggregationStep !== undefined) {
                        var exceptionAggregationElement = writer.writeIntermediateElement(element, measureElement, "measure", "exceptionAggregation", {
                            exceptionAggregationBehavior: "{exceptionAggregationType}"
                        });
                        if (element.exceptionAggregationStep.referenceElements !== null && element.exceptionAggregationStep.referenceElements !== undefined) {
                            element.exceptionAggregationStep.referenceElements.foreach(function(referenceElement) {
                                var isIntermediate = false;
                                var fixedTypeOfElementAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(referenceElement, "dimensionUri", "attributeName");                
                                writer.writeElement(element.exceptionAggregationStep, exceptionAggregationElement, "attribute", null, fixedTypeOfElementAttributes, null, isIntermediate);
                                isIntermediate = true;
                            });
                        }
                    }
                }

                // Temoprary solution to run tests - no need of measureType check later
                if (element.measureType !== viewmodel.MeasureType.RESTRICTION) {
                    if (element.calculationDefinition !== undefined && element.calculationDefinition.formula !== undefined) {
                        var formulaElement = writer.writeIntermediateElement(element, measureElement, "measure", "formula");
                        writer.writeTextContent(formulaElement, element.calculationDefinition.formula);
                    }
                }

                if (element.measureType !== null && element.measureType !== undefined && element.measureType === viewmodel.MeasureType.RESTRICTION && element.hasOwnProperty("restrictions") && element.restrictions !== null && element.restrictions !== undefined) {
                    element.restrictions.foreach(function(restriction) {
                        if (restriction.element) {
                            var restrictionElement = writer.writeIntermediateElement(restriction, measureElement, "measure", "restriction", null, [{
                                name: "logicalOperator",
                                value: "AND"
                            }]);
                            
                            //var writingMapper = function(value) {
                                writer.addPrefix(sharedmodel.NameSpace.PRIVILEGE, "undefined");
                            //};
                            var fixedValues = [];    
                            if (restriction.element && restriction.element.name) {
                                var originalElementName = restriction.element.name;
                                var isPrivateElement = RepositoryXmlRendererHelper.isPrivateElement(restriction.element);
                                                if(!isPrivateElement){
                                                   originalElementName = RepositoryXmlRendererHelper.deriveElementOriginalName(restriction.element);  
                                                }   
                                                                fixedValues.push({
                                                        name: "xsi:type",
                                    value: "Privilege:AttributeFilter"  
                                });
                                //Since validFromElement does have any Attribute type, so passing Xsitype as fixed Attribute instead of attribute mapping.
                                //and calling addprefix method with dummy string to add BiDataFoundation attribute in the Calculation:scenario tag for modeler compatabilty
                                // writer.addPrefix(sharedmodel.NameSpace.PRIVILEGE, "undefined");
                                fixedValues.push({
                                    name: "attributeName",
                                    value: originalElementName
                                });
                            }
                            var filterElement = writer.writeElement(restriction, restrictionElement, "filter", null, fixedValues);
                            restriction.valueFilters.foreach(function(valueFilter) {
                                sharedmodel.renderValueFilter(valueFilter, filterElement, writer, "valueFilter");
                            });
                            var isPrivateElement = RepositoryXmlRendererHelper.isPrivateElement(restriction.element);
                            if(!isPrivateElement){
                               var  resourceUri = RepositoryXmlRendererHelper.getResourceUri(restriction.element.$getContainer());
                               var dimensionUriElement = writer.writeIntermediateElement(restriction, restrictionElement, "restriction", "dimensionUri");
                               writer.writeTextContent(dimensionUriElement, resourceUri);      
                            }else{
                                var attributeNameElement = writer.writeIntermediateElement(restriction, restrictionElement, "restriction", "attributeName");
                                writer.writeTextContent(attributeNameElement, restriction.element.name);    
                            }
                        }
                    });
                }

                // var mapping = element.getMapping();
                var mapping;
                if(isStarJoin){
                    mapping = element.getStarJoinPrivateElementMapping(starJoinViewNodeInput);    
                }else{
                    mapping = element.getMapping();    
                }
                // var viewNode = element.$getContainer();
                var fixedMappingValues = [];
                if (mapping) {
                    var source = mapping.$getContainer().getSource();
                    if(source){
                        if (source instanceof viewmodel.Entity) {
                        //Only tables and database views will have schemaName; designtime views will not have schemaName
                        if(source.schemaName){
                            fixedMappingValues.push({
                            name: "schemaName",
                            value: source.schemaName
                            });
                        }
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
                    }

                    //If input has alias sace it in measureMapping
                    var input = mapping.$getContainer();
                    if (input && input.alias) {
                        fixedMappingValues.push({
                            name: "alias",
                            value: input.alias
                        });
                    }
                    if(mapping.sourceElement){
                        fixedMappingValues.push({
                            name: "columnName",
                            value: mapping.sourceElement.name
                        });
                    }
                    // writer.writeElement(element, measureElement, "measureMapping", null, fixedMappingValues);
                    writer.writeElement(mapping, measureElement, "measureMapping", null, fixedMappingValues);
                } else if (viewNode.isScriptNode()) {
                    fixedMappingValues.push({
                        name: "columnObjectName",
                        value: viewNode.name
                    });
                    fixedMappingValues.push({
                        name: "columnName",
                        value: element.name
                    });
                    writer.writeElement(element, measureElement, "measureMapping", null, fixedMappingValues);
                    //writer.writeElement(element, measureElement, "measureMapping", null, fixedMappingValues);
                }

                if (element.restrictionExpression && element.restrictionExpression.formula) {
                    var restrictionExpression = writer.writeElement(element, measureElement, "restrictionExpression");
                    writer.writeTextContent(restrictionExpression, element.restrictionExpression.formula);
                }

		if(element.hasNoMapping){
                    //console.log("element has No Mapping");
                    //var result = new StableOrderText(value);
                    //attributeElement.childNodes.add(result);
                    var firstTextNode = measureElement.childNodes[0];
                    var textNode = writer._xmlDocument.createTextNode(firstTextNode.nodeValue);
                    measureElement.childNodes.push(textNode);
                }

                return measureElement;
            },

            renderCurrencyConversion: function(writer, element, parentElement) {
                var currencyConversion = element.currencyConversion;
                var currencyConversionElement;
                var fixedValues = [];
                if (currencyConversion.errorHandling && currencyConversion.errorHandling.constantValue) {

                    fixedValues.push({
                        name: "errorHandling",
                        value: currencyConversion.errorHandling.constantValue
                    });
                }
                if (currencyConversion.outputUnitCurrencyElement && currencyConversion.outputUnitCurrencyElement.name) {
                    fixedValues.push({
                        name: "generateOutputUnitCurrencyAttribute",
                        value: "true"
                    });
                    fixedValues.push({
                        name: "outputUnitCurrencyAttributeName",
                        value: currencyConversion.outputUnitCurrencyElement.name
                    });
                } else {
                    fixedValues.push({
                        name: "generateOutputUnitCurrencyAttribute",
                        value: "false"
                    });
                }

                currencyConversionElement = writer.writeIntermediateElement(currencyConversion, parentElement, "measure", "currencyConversion", null, fixedValues);
                this.renderUDFParameter(writer, element, currencyConversion.client, "client", currencyConversionElement);
                if (currencyConversion.schema) {
                    writer.writeIntermediateElement(currencyConversion, currencyConversionElement, "currencyConversion", "schema", null, [{
                        name: "schemaName",
                        value: currencyConversion.schema.schemaName
                    }]);
                }
                if (currencyConversion.outputDataType) {
                    var outputDataTypeFixedValues = [];
                    if (currencyConversion.outputDataType.primitiveType) {
                        outputDataTypeFixedValues.push({
                            name: "datatype",
                            value: currencyConversion.outputDataType.primitiveType
                        });
                    }
                    if (currencyConversion.outputDataType.length) {
                        outputDataTypeFixedValues.push({
                            name: "length",
                            value: currencyConversion.outputDataType.length
                        });
                    }
                    if (currencyConversion.outputDataType.scale) {
                        outputDataTypeFixedValues.push({
                            name: "scale",
                            value: currencyConversion.outputDataType.scale
                        });
                    }
                    if (currencyConversion.outputDataType.precision) {
                        outputDataTypeFixedValues.push({
                            name: "precision",
                            value: currencyConversion.outputDataType.precision
                        });
                    }
                    writer.writeIntermediateElement(currencyConversion, currencyConversionElement, "currencyConversion", "outputDataType", null, outputDataTypeFixedValues);
                }
                this.renderUDFParameter(writer, currencyConversion, currencyConversion.sourceCurrency, "sourceCurrency", currencyConversionElement);
                this.renderSingleTagWithContent(writer, currencyConversion, currencyConversionElement, "erpDecimalShift", currencyConversion.erpDecimalShift, true, true);
                this.renderSingleTagWithContent(writer, currencyConversion, currencyConversionElement, "round", currencyConversion.round, true, true);
                this.renderSingleTagWithContent(writer, currencyConversion, currencyConversionElement, "erpDecimalShiftBack", currencyConversion.erpDecimalShiftBack, true, true);
                this.renderUDFParameter(writer, currencyConversion, currencyConversion.targetCurrency, "targetCurrency", currencyConversionElement);
                this.renderUDFParameter(writer, currencyConversion, currencyConversion.referenceDate, "referenceDate", currencyConversionElement);
                var fixedAttributes;
                if (currencyConversion.exchangeRateType) {
                    var exchangeRateTypeAttributeElement;
                    if (currencyConversion.exchangeRateType.element) {
                        fixedAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(currencyConversion.exchangeRateType.element, "dimensionUri", "attributeName");
                        writer.writeIntermediateElement(currencyConversion, currencyConversionElement, "currencyConversion", "exchangeRateTypeAttribute", null, fixedAttributes);
                    } else if (currencyConversion.exchangeRateType.constantValue) {
                        exchangeRateTypeAttributeElement = writer.writeIntermediateElement(element, currencyConversionElement, "currencyConversion", "exchangeRateType");
                        writer.writeTextContent(exchangeRateTypeAttributeElement, currencyConversion.exchangeRateType.constantValue);
                    } else if (currencyConversion.exchangeRateType.parameter) {
                        exchangeRateTypeAttributeElement = writer.writeIntermediateElement(currencyConversion, currencyConversionElement, "currencyConversion", "exchangeRateType");
                        writer.writeTextContent(exchangeRateTypeAttributeElement, "$$" + currencyConversion.exchangeRateType.parameter.name + "$$");
                    }
                }
                if (currencyConversion.exchangeRateElement) {
                    fixedAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(currencyConversion.exchangeRateElement, "dimensionUri", "attributeName");
                    writer.writeIntermediateElement(currencyConversion, currencyConversionElement, "currencyConversion", "exchangeRateAttribute", null, fixedAttributes);
                }
            },

            renderUnitConversion: function(writer, element, parentElement) {
                var unitConversion = element.unitConversion;
                var unitConversionElement;
                var fixedValues = [];
                if (unitConversion.errorHandling && unitConversion.errorHandling.constantValue) {

                    fixedValues.push({
                        name: "errorHandling",
                        value: unitConversion.errorHandling.constantValue
                    });
                }
                if (unitConversion.outputUnitCurrencyElement && unitConversion.outputUnitCurrencyElement.name) {
                    fixedValues.push({
                        name: "generateOutputUnitCurrencyAttribute",
                        value: "true"
                    });
                    fixedValues.push({
                        name: "outputUnitCurrencyAttributeName",
                        value: unitConversion.outputUnitCurrencyElement.name
                    });
                } else {
                    fixedValues.push({
                        name: "generateOutputUnitCurrencyAttribute",
                        value: "false"
                    });
                }
                unitConversionElement = writer.writeIntermediateElement(element, parentElement, "measure", "unitConversion", null, fixedValues);

                this.renderUDFParameter(writer, unitConversion, unitConversion.client, "client", unitConversionElement);
                if (unitConversion.schema && unitConversion.schema.schemaName) {
                    writer.writeIntermediateElement(unitConversion, unitConversionElement, "unitConversion", "schema", null, [{
                        name: "schemaName",
                        value: unitConversion.schema.schemaName
                    }]);
                }
                this.renderUDFParameter(writer, unitConversion, unitConversion.sourceUnit, "sourceUnit", unitConversionElement);
                this.renderSingleTagWithContent(writer, unitConversion, unitConversionElement, "erpDecimalShift", unitConversion.erpDecimalShift, true, true);
                this.renderSingleTagWithContent(writer, unitConversion, unitConversionElement, "round", unitConversion.round, true, true);
                this.renderSingleTagWithContent(writer, unitConversion, unitConversionElement, "erpDecimalShiftBack", unitConversion.erpDecimalShiftBack, true, true);
                this.renderUDFParameter(writer, unitConversion, unitConversion.targetUnit, "targetUnit", unitConversionElement);
                this.renderUDFParameter(writer, unitConversion, unitConversion.referenceDate, "referenceDate", unitConversionElement);
                if (unitConversion.exchangeRateType) {
                    var exchangeRateTypeAttributeElement;
                    if (unitConversion.exchangeRateType.element) {
                        var fixedAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(unitConversion.exchangeRateType.element, "dimensionUri", "attributeName");
                        writer.writeIntermediateElement(unitConversion, unitConversionElement, "unitConversion", "exchangeRateTypeAttribute", null, fixedAttributes);
                    } else if (unitConversion.exchangeRateType.constantValue) {
                        exchangeRateTypeAttributeElement = writer.writeIntermediateElement(unitConversion, unitConversionElement, "unitConversion", "exchangeRateTypeAttribute");
                        var valueElement = writer.writeElement(unitConversion, exchangeRateTypeAttributeElement, "value");
                        writer.writeTextContent(valueElement, unitConversion.exchangeRateType.constantValue);
                    } else if (unitConversion.exchangeRateType.parameter) {
                        exchangeRateTypeAttributeElement = writer.writeIntermediateElement(unitConversion, unitConversionElement, "unitConversion", "exchangeRateType");
                        writer.writeTextContent(exchangeRateTypeAttributeElement, "$$" + unitConversion.exchangeRateType.parameter.name + "$$");
                    }
                }
                if (unitConversion.exchangeRateElement) {
                    var fixedAttributes = this.prepareSharedElementAttributes(unitConversion.exchangeRateElement);
                    writer.writeIntermediateElement(unitConversion, unitConversion, "currencyConversion", "exchangeRateAttribute", null, fixedAttributes);
                }
            },

            renderSingleTagWithContent: function(writer, object, parentElement, tagName, content, isBoolean, isIntermediate) {
                if (writer && object && parentElement && tagName && content) {
                    var singleTagElement;
                    if (isBoolean) {
                        if (content) {
                            content = "true";
                        } else {
                            content = "false";
                        }
                    }
                    if (isIntermediate) {
                        singleTagElement = writer.writeIntermediateElement(object, parentElement, parentElement.nodeName, tagName);
                        writer.writeTextContent(singleTagElement, content);
                    } else {
                        singleTagElement = writer.writeElement(object, parentElement, tagName);
                        writer.writeTextContent(singleTagElement, content);

                    }
                    return singleTagElement;
                }
            },

            renderUDFParameter: function(writer, parent, udfParameter, tagName, parentElement, isIntermediate) {
                if (udfParameter) {
                    var udfElement = writer.writeElement(parent, parentElement, tagName);
                    if (isIntermediate) {
                        isIntermediate = true;
                    } else {
                        isIntermediate = false;
                    }
                    if (udfParameter.element) {
                        var fixedTypeOfElementAttributes = RepositoryXmlRendererHelper.prepareSharedElementAttributes(udfParameter.element, "dimensionUri", "attributeName");           
                        writer.writeElement(parent, udfElement, "attribute", null, fixedTypeOfElementAttributes, null, isIntermediate);
                    } else if (udfParameter.parameter) {
                        var localVariable = writer.writeElement(parent, udfElement, "localVariable", null, null, null, isIntermediate);
                        //writer.writeTextContent(localVariable, "#" + udfParameter.parameter.name);
                        writer.writeTextContent(localVariable, udfParameter.parameter.name);

                    } else if (udfParameter.constantValue) {
                        var value = writer.writeElement(parent, udfElement, "value", null, null, null, isIntermediate);
                        writer.writeTextContent(value, udfParameter.constantValue);
                    }
                }
            },


            renderShape: function(viewNode, shapesElement, writer) {
                var modelObjectNameSpace = viewNode.isDefaultNode() ? "MeasureGroup" : "CalculationView";
                var modelObjectName = viewNode.isDefaultNode() ? "Output" : viewNode.name;
                var attributeMapping = {
                    expanded: "{expanded}"
                };
                var fixedValues = [{
                    name: "modelObjectName",
                    value: modelObjectName
                }, {
                    name: "modelObjectNameSpace",
                    value: modelObjectNameSpace
                }];
                var shapeElement = writer.writeElement(viewNode.layout, shapesElement, "shape", attributeMapping, fixedValues);

                writer.writeIntermediateElement(viewNode.layout, shapeElement, "shape", "upperLeftCorner", {
                    xCoordinate: "{x}",
                    yCoordinate: "{y}"
                });
                if (typeof viewNode.layout.width === "number") {
                    writer.writeIntermediateElement(viewNode.layout, shapeElement, "shape", "rectangleSize", {
                        height: "{height}",
                        width: "{width}"
                    });
                }
            }

        };

        return RepositoryXmlRenderer;
    });
