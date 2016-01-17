/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../util/ResourceLoader",
    "../base/MetadataServices",
    "./model",
    "./RepositoryXmlParser",
    "../base/modelbase",
    "../sharedmodel/sharedmodel"
], function(ResourceLoader, MetadataServices, viewModel, RepositoryXmlParser, ModelBase, SharedModel) {

    "use strict";
    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

    /**
     * @class loads and resolves the required object proxies for a given View model
     */

    /* Function : Get Aggregation Behavior */
    var getAggregationBehavior = function(aggrBehaviourNumeric) {
        var aggregationBehavior; 
       /* switch (aggrBehaviourNumeric) {
            case 0:
                aggregationBehavior = "none";
                break;
            case 1:
                aggregationBehavior = "sum";
                break;
            case 2:
                aggregationBehavior = "count";
                break;
            case 3:
                aggregationBehavior = "min";
                break;
            case 4:
                aggregationBehavior = "max";
                break;
        }*/
		if(aggrBehaviourNumeric === 0)
        	 aggregationBehavior = "none";
       	else
       		 aggregationBehavior = aggrBehaviourNumeric.toLowerCase();
        return aggregationBehavior;
    };

    /* Function : Get Semantic Type*/
    var getSemanticType = function(type) {
        var semanticType;
        switch (type) {
            case "AmountValue":
                semanticType = viewModel.SemanticType.AMOUNT;
                break;
            case "QuantityValue":
                semanticType = viewModel.SemanticType.QUANTITY;
                break;
            case "currencyCode":
                semanticType = viewModel.SemanticType.CURRENCY_CODE;
                break;
            case "unitOfMeasure":
                semanticType = viewModel.SemanticType.UNIT_OF_MEASURE;
                break;
            case "time":
                semanticType = viewModel.SemanticType.TIME;
                break;
            case "date":
                semanticType = viewModel.SemanticType.DATE;
                break;
            case "date.businessDateFrom":
                semanticType = viewModel.SemanticType.DATE_BUSINESS_DATE_FROM;
                break;
            case "date.businessDateTo":
                semanticType = viewModel.SemanticType.DATE_BUSINESS_DATE_TO;
                break;
            case "geoLocation.longitude":
                semanticType = viewModel.SemanticType.GEO_LOCATION_LONGITUDE;
                break;
            case "geoLocation.latitude":
                semanticType = viewModel.SemanticType.GEO_LOCATION_LATITUDE;
                break;
            case "geoLocation.cartoId":
                semanticType = viewModel.SemanticType.GEO_LOCATION_CARTO_ID;
                break;
            case "geoLocation.normalizedName":
                semanticType = viewModel.SemanticType.GEO_LOCATION_NORMALIZED_NAME;
                break;
            case "client":
                semanticType = viewModel.SemanticType.CLIENT;
                break;
            case "language":
                semanticType = viewModel.SemanticType.LANGUAGE;
                break;
            case "description":
                semanticType = viewModel.SemanticType.DESCRIPTION;
                break;
            default:
                semanticType = viewModel.SemanticType.EMPTY;
        }
        return semanticType;
    };

    /* Function : Get Operator Type*/
    var getOperatorType = function(type) {
        var operatorType;
        switch (type) {
            case "=":
                operatorType = SharedModel.ValueFilterOperator.EQUAL;
                break;
            case "<":
                operatorType = SharedModel.ValueFilterOperator.LESS_THAN;
                break;
            case "<=":
                operatorType = SharedModel.ValueFilterOperator.LESS_EQUAL;
                break;
            case ">":
                operatorType = SharedModel.ValueFilterOperator.GREATER_THAN;
                break;
            case ">=":
                operatorType = SharedModel.ValueFilterOperator.GREATER_TEQUAL;
                break;
            case "BETWEEN":
                operatorType = SharedModel.ValueFilterOperator.BETWEEN;
                break;
        }
        return operatorType;
    };

    /*Function: Create View Model from XML*/
    var loadFromXML = function(xml, model) {
        RepositoryXmlParser.parseScenario(xml, model);
    };

    /* Function : Create hierarchies in entity from xml */
    var createHiererchies = function(oneViewModel, entity) {
        /* Create Hierarchies in the entity */
        var hierarchies = oneViewModel.columnView.inlineHierarchies.toArray();
        for (var hierIdx = 0; hierIdx < hierarchies.length; hierIdx++) {
            //Set the references for all the features of the hierarchy
            // var hierarchy = entity.createInlineHierarchy(hierarchies[hierIdx]);
            //: Using createOrMergeHierarchy() since used shared Hierarchy would have been added by transformation 
            var hierarchy = entity.createOrMergeHierarchy(hierarchies[hierIdx]);
            hierarchy.isProxy = false;

            /* 1. Set Parent Definition */
            var aParentDef = hierarchies[hierIdx].parentDefinitions.toArray();
            for (var pdIdx = 0; pdIdx < aParentDef.length; pdIdx++) {
                var parentDef = hierarchy.createParentDefinition(aParentDef[pdIdx]);
                parentDef.element = entity.elements.get(aParentDef[pdIdx].element.name);
                parentDef.parent = entity.elements.get(aParentDef[pdIdx].parent.name);
            }

            /* 2. Set Level */
            var aLevels = hierarchies[hierIdx].levels.toArray();
            for (var lvlIdx = 0; lvlIdx < aLevels.length; lvlIdx++) {
                var level = hierarchy.createLevel(aLevels[lvlIdx]);
                level.element = entity.elements.get(aLevels[lvlIdx].element.name);
                if (aLevels[lvlIdx].orderElement !== undefined) {
                    level.orderElement = entity.elements.get(aLevels[lvlIdx].orderElement.name);
                }
            }

            /* 3. Set Sibiling Order */
            var aSiblingOrder = hierarchies[hierIdx].siblingOrders.toArray();
            for (var soIdx = 0; soIdx < aSiblingOrder.length; soIdx++) {
                var sibilingOrder = hierarchy.createSiblingOrder(aSiblingOrder[soIdx]);
                sibilingOrder.byElement = entity.elements.get(aSiblingOrder[soIdx].byElement.name);
            }

            /* 4. Set  Time Properties */
            if (hierarchies[hierIdx].hasOwnProperty("timeProperties") && hierarchies[hierIdx].timeProperties !== undefined) {
                var timeProperties = hierarchy.createTimeProperties(hierarchies[hierIdx].timeProperties);

                timeProperties.validFromElement = entity.elements.get(hierarchies[hierIdx].timeProperties.validFromElement.name);
                timeProperties.validToElement = entity.elements.get(hierarchies[hierIdx].timeProperties.validToElement.name);

                if (hierarchies[hierIdx].timeProperties.hasOwnProperty("fromParameter") && hierarchies[hierIdx].timeProperties.fromParameter !==
                    undefined) {
                    var fromParm = entity.parameters.get(hierarchies[hierIdx].timeProperties.fromParameter.name);
                    if (fromParm === undefined) {
                        fromParm = entity.createParameter(hierarchies[hierIdx].timeProperties.fromParameter);
                        timeProperties.fromParameter = fromParm;
                    } else {
                        timeProperties.fromParameter = entity.parameters.get(hierarchies[hierIdx].timeProperties.fromParameter.name);
                    }
                }
                if (hierarchies[hierIdx].timeProperties.hasOwnProperty("toParameter") && hierarchies[hierIdx].timeProperties.toParameter !==
                    undefined) {
                    var toParm = entity.parameters.get(hierarchies[hierIdx].timeProperties.toParameter.name);
                    if (toParm === undefined) {
                        toParm = entity.createParameter(hierarchies[hierIdx].timeProperties.toParameter);
                        timeProperties.toParameter = toParm;
                    } else {
                        timeProperties.toParameter = entity.parameters.get(hierarchies[hierIdx].timeProperties.toParameter.name);
                    }
                }

                if (hierarchies[hierIdx].timeProperties.hasOwnProperty("pointInTimeParameter") && hierarchies[hierIdx].timeProperties.pointInTimeParameter !==
                    undefined) {
                    var pointInTimeParm = entity.parameters.get(hierarchies[hierIdx].timeProperties.pointInTimeParameter.name);
                    if (pointInTimeParm === undefined) {
                        pointInTimeParm = entity.createParameter(hierarchies[hierIdx].timeProperties.pointInTimeParameter);
                        timeProperties.pointInTimeParameter = pointInTimeParm;
                    } else {
                        timeProperties.pointInTimeParameter = entity.parameters.get(hierarchies[hierIdx].timeProperties.pointInTimeParameter.name);
                    }
                }
            }

            /* 5. Set Edge Attribute   */
            var aEdgeAttributes = hierarchies[hierIdx].edgeAttributes.toArray();
            for (var eaIdx = 0; eaIdx < aEdgeAttributes.length; eaIdx++) {
                var edgeAttribute = hierarchy.createEdgeAttribute(aEdgeAttributes[eaIdx]);
                edgeAttribute.element = entity.elements.get(aEdgeAttributes[eaIdx].element.name);
            }

            /* 6. Set End User Texts */
            if (hierarchies[hierIdx].hasOwnProperty("endUserTexts") && hierarchies[hierIdx].endUserTexts !== undefined) {
                hierarchy.createEndUserTexts(hierarchies[hierIdx].endUserTexts);
            }
        }
    };

    /*Function : Process elements of the Entity */
    var processElements = function(columnsArray, entity) {
        for (var index = 0; index < columnsArray.length; index++) {
            // Update elements in the entity
            var nameWOQuotes = columnsArray[index].name.replace(/"\""/g, "");
            var elementAttributes = {
                name: nameWOQuotes
            };

            //Get Sementic Type
            var semanticType;
            semanticType = getSemanticType(columnsArray[index].semanticType);

            var simpleTypeAttributes = {
                primitiveType: columnsArray[index].dataTypeName,
                length: columnsArray[index].length,
                scale: columnsArray[index].scale,
                semanticType: semanticType
            };

            var element = entity.createOrMergeElement(elementAttributes);
            element.isProxy = false;
            element.createOrMergeSimpleType(simpleTypeAttributes);

            //Set column description
            if (columnsArray[index].hasOwnProperty("description")) {
                element.label = columnsArray[index].description;
            }

            //Set Aggregation behaviour
            var aggrBehaviour = columnsArray[index].defaultAggregation;
            if (aggrBehaviour === undefined) {
                element.aggregationBehavior = getAggregationBehavior(0);
            } else {
                element.aggregationBehavior = getAggregationBehavior(aggrBehaviour);
            }

            //Set Label Column
            //During initial creation of elements,set the labelcolumn text.
            //In next iteration replace the name with element reference
            var lblElement = columnsArray[index].labelColumn;
            if (lblElement !== undefined && lblElement !== null) {
                element.labelElement = lblElement;
            }

            //Shared Dimension information
            if (columnsArray[index].sharedDimension) {
                element.sharedDimension = columnsArray[index].sharedDimension;
                element.nameInSharedDimension = columnsArray[index].nameInSharedDimension;
            }
        }

        //Resolve the label Element since all the elements are created in the entity by now.
        for (var elemIdx = 0; elemIdx < entity.elements.count(); elemIdx++) {
            var elem = entity.elements.getAt(elemIdx);
            if (elem.hasOwnProperty("labelElement") && elem.labelElement !== undefined) {
                elem.labelElement = entity.elements.get(elem.labelElement);
            }
        }
    };

    /* Function : Process parameters of the Entity */
    var processParameters = function(parametersArray, entity) {
        for (var index = 0; index < parametersArray.length; index++) {
            var nameWOQuotes = parametersArray[index].name.replace(/"\""/g, "");
            var parameterAttributes = {
                name: nameWOQuotes
            };
            var inlineType = {
                primitiveType: parametersArray[index].dataTypeName,
                length: parametersArray[index].length,
                scale: parametersArray[index].scale
            };

            //Get the parameter in case it exists.
            var parameter = entity.parameters.get(parametersArray[index].name);
            if (parameter === undefined) {
                parameter = entity.createParameter(parameterAttributes);
            }
            parameter.isProxy = false; // to address parameter Proxy feature
            parameter.createOrMergeSimpleType(inlineType);
            parameter.defaultValue = parametersArray[index].defaultValue;
            parameter.isVariable = parametersArray[index].isVariable;
            parameter.isHistoryParameter = parametersArray[index].isHistoryParameter;
        }
    };

    /*Function : Process elements of the Entity */
    var processScriptEntity = function(columnsArray, entity) {
        var aColumns;
        var elementAttributes = null;
        var element = null;
        var dataType = null;
        var dataTypeScale = null;
        var simpleTypeAttributes = null;
        var parameterAttributes = null;
        var inlineType = null;
        var parameter = null;
        for (var index = 0; index < columnsArray.length; index++) {
var nameWOQuotes;
            switch (columnsArray[index].parameterType) {
                // Create/Update elements in the entity    
                case "OUT":
                case "RETURN":
                    if (columnsArray[index].dataTypeName === "TABLE_TYPE") {
                        aColumns = columnsArray[index].column;
                        for (var colIndex = 0; colIndex < aColumns.length; colIndex++) {
nameWOQuotes = aColumns[colIndex].name.replace(/"\""/g, "");
                            elementAttributes = {
                                name: nameWOQuotes
                            };
                            dataTypeScale = aColumns[colIndex].hasOwnProperty("scale") ? aColumns[colIndex].scale : undefined;
                            simpleTypeAttributes = {
                                primitiveType: aColumns[colIndex].dataTypeName,
                                length: aColumns[colIndex].length,
                                scale: dataTypeScale
                            };
                            element = entity.createOrMergeElement(elementAttributes);
                            element.isProxy = false;
                            element.createOrMergeSimpleType(simpleTypeAttributes);
                        }
                    } else {
nameWOQuotes = columnsArray[index].parameterName.replace(/"\""/g, "");
                        elementAttributes = {
                            name: nameWOQuotes
                        };
                        dataTypeScale = columnsArray[index].hasOwnProperty("scale") ? columnsArray[index].scale : undefined;
                        simpleTypeAttributes = {
                            primitiveType: columnsArray[index].dataTypeName,
                            length: columnsArray[index].length,
                            scale: dataTypeScale
                        };
                        element = entity.createOrMergeElement(elementAttributes);
                        element.isProxy = false;
                        element.createOrMergeSimpleType(simpleTypeAttributes);

                        //Non string data type for scalar function and procedures are not supported
                        dataType = columnsArray[index].dataTypeName;
                        if (!(dataType === "CHAR" || dataType === "NCHAR" || dataType === "VARCHAR" || dataType === "NVARCHAR")) {
                            if (entity.type === viewModel.EntityType.SCALAR_FUNCTION || entity.type === viewModel.EntityType.PROCEDURE || entity.type ===
                                viewModel.EntityType.CATALOG_PROCEDURE) {
                                entity.errorMsg = resourceLoader.getText("msg_parameter_not_supported_dataType");
                            }
                        }
                    }
                    break;
                case "IN":
                    if (columnsArray[index].hasOwnProperty("dataTypeName") && columnsArray[index].dataTypeName === "TABLE_TYPE") {
                        entity.errorMsg = resourceLoader.getText("msg_table_type_parameter_not_supported");
                    } else {
                        // Create/Update parameter in the entity
nameWOQuotes = columnsArray[index].parameterName.replace(/"\""/g, "");
                        parameterAttributes = {
                            name: nameWOQuotes
                        };
                        inlineType = {
                            primitiveType: columnsArray[index].dataTypeName,
                            length: columnsArray[index].length
                                //scale: columnsArray[index].scale
                        };

                        // Get the parameter in case it exists.
                        parameter = entity.parameters.get(columnsArray[index].parameterName);
                        if (parameter === undefined) {
                            parameter = entity.createParameter(parameterAttributes);
                        }
                        parameter.isProxy = false; // to address parameter Proxy feature
                        parameter.createOrMergeSimpleType(inlineType);
                    }
                    break;
                case "INOUT":
                    //Cretae both element and parameter in the entity
                    // 1.Element
nameWOQuotes = columnsArray[index].parameterName.replace(/"\""/g, "");
                    elementAttributes = {
                        name: nameWOQuotes
                    };
                    dataTypeScale = columnsArray[index].hasOwnProperty("scale") ? columnsArray[index].scale : undefined;
                    simpleTypeAttributes = {
                        primitiveType: columnsArray[index].dataTypeName,
                        length: columnsArray[index].length,
                        scale: dataTypeScale
                    };
                    element = entity.createOrMergeElement(elementAttributes);
                    element.isProxy = false;
                    element.createOrMergeSimpleType(simpleTypeAttributes);

                    //Non string data type for scalar function and procedures are not supported
                    dataType = columnsArray[index].dataTypeName;
                    if (!(dataType === "CHAR" || dataType === "NCHAR" || dataType === "VARCHAR" || dataType === "NVARCHAR")) {
                        if (entity.type === viewModel.EntityType.SCALAR_FUNCTION || entity.type === viewModel.EntityType.PROCEDURE || entity.type ===
                            viewModel.EntityType.CATALOG_PROCEDURE) {
                            entity.errorMsg = resourceLoader.getText("msg_parameter_not_supported_dataType");
                        }
                    }

                    // 2. Parameter
nameWOQuotes = columnsArray[index].parameterName.replace(/"\""/g, "");
                    parameterAttributes = {
                        name: nameWOQuotes
                    };
                    inlineType = {
                        primitiveType: columnsArray[index].dataTypeName,
                        length: columnsArray[index].length
                            //scale: columnsArray[index].scale
                    };

                    // Get the parameter in case it exists.
                    parameter = entity.parameters.get(columnsArray[index].parameterName);
                    if (parameter === undefined) {
                        parameter = entity.createParameter(parameterAttributes);
                    }
                    parameter.isProxy = false; // to address parameter Proxy feature
                    parameter.createOrMergeSimpleType(inlineType);
            }
        }
    };

    var mergeParametersFromXML = function(entities, entity, xmlParametersArray) {
        for (var parmIdx = 0; parmIdx < xmlParametersArray.length; parmIdx++) {

            var xmlParm = xmlParametersArray[parmIdx];
            var parameter = entity.createOrMergeParameter(xmlParm);

            if (xmlParm.defaultRanges) {
                for (var rangeIdx = 0; rangeIdx < xmlParm.defaultRanges.count(); rangeIdx++) {
                    parameter.createDefaultRange(xmlParm.defaultRanges.getAt(rangeIdx));
                }
            }
            if (xmlParm.defaultExpression) {
                parameter.createDefaultExpression(xmlParm.defaultExpression);
            }
            if (xmlParm.derivationRule) {
                var derivationRule = parameter.createDerivationRule(xmlParm.derivationRule);
                if (xmlParm.derivationRule.elementFilters) {
                    for (var elemFltrIdx = 0; elemFltrIdx < xmlParm.derivationRule.elementFilters.count(); elemFltrIdx++) {
                        derivationRule.createElementFilter(xmlParm.derivationRule.elementFilters.getAt(elemFltrIdx));
                    }
                }
                if (xmlParm.derivationRule.parameterMappings) {
                    for (var mappingIdx = 0; mappingIdx < xmlParm.derivationRule.parameterMappings.count(); mappingIdx++) {
                        derivationRule.createParameterMapping(xmlParm.derivationRule.parameterMappings.getAt(mappingIdx));
                    }
                }
                //lookupEntity
                if (xmlParm.derivationRule.lookupEntity) {
                    parameter.derivationRule.lookupEntity = entities.get(xmlParm.derivationRule.lookupEntity.name);
                }
                //scriptObject
                if (xmlParm.derivationRule.scriptObject) {
                    parameter.derivationRule.scriptObject = entities.get(xmlParm.derivationRule.scriptObject.name);
                }
            }
            if (xmlParm.inlineType) {
                var simpleType = parameter.createOrMergeSimpleType(xmlParm.inlineType);
                if (xmlParm.inlineType.valueRanges) {
                    for (var valRangeIdx = 0; valRangeIdx < xmlParm.inlineType.valueRanges.count(); valRangeIdx++) {
                        simpleType.createValueRange(xmlParm.inlineType.valueRanges.getAt(valRangeIdx));
                    }
                }
            }
            //typeOfElement
            if (xmlParm.typeOfElement) {
                parameter.typeOfElement = entity.elements.get(xmlParm.typeOfElement.name);
            }
            //externalTypeOfElement
            if (xmlParm.externalTypeOfElement) {
                parameter.externalTypeOfElement = entity.elements.get(xmlParm.externalTypeOfElement.name);
            }
        }
    };

    var ProxyResolver = {
        resolve: function(rootModel, context, callback) {
            var metadataDetailService = MetadataServices.MetadataDetails;
            var cons = typeof console !== "undefined" ? console : undefined;

            var entities = rootModel._entities.toArray();
            var filesNotResolved = entities.length;
            var mainViewModel = rootModel;

            // nothing to resolve, call callback anyways to notify caller
            if (filesNotResolved === 0 && callback) {
                callback();
                return;
            }
            
            //TODO: Need to remove below hard code, once details service for graph workspace is ready
            //Hard coded For Graph node - START
          /*    if(entities.length > 0){     
            	var isWorkspaceEntity = false;
            	for(var index = 0; index < entities.length ; index++){
            		if(entities[index].type === "GRAPH_WORKSPACE"){
            			isWorkspaceEntity = true;
            			break;
            		}
            	}            	
            	var singleEntity = false;
            	if(entities.length === 1){
            		singleEntity = true;
            	}      	
            	            	
               if(isWorkspaceEntity){	
	               var isGraph= false;              
	               for (var idx = 0; idx < entities.length; idx++) {
	                     if (entities[idx].isProxy === true || entities[idx].type === "GRAPH_WORKSPACE") {
	                         var entity = entities[idx];
	                         for(var index = 0; index < 2; index++){
	                             var graphNodeElement = entity.createOrMergeElement({name: "Column"+index});
	                             //DataType Code - START
	                             //We might add differnt datatype for both columnns with conditional code
	                             var simpleTypeAttributes = {
	                 	                primitiveType: "DOUBLE",
	                 	                length: 10,
	                 	                scale: 2,
	                 	                semanticType: viewModel.SemanticType.AMOUNT
	                 	            };
	                             graphNodeElement.createOrMergeSimpleType(simpleTypeAttributes);
	                           //DataType Code - END
	                         }  
	                         entity.isProxy = false;
	                     }	                     
	                     isGraph = true;	                     
	               }                
		            if(isGraph && singleEntity){
		                callback();
		                return;
		            }
               }   
             }	*/		
            
			//Hard coded For Graph node - END


          
            /* Loop through entities and resolve them */
            for (var idx = 0; idx < entities.length; idx++) {
                if (entities[idx].isProxy === true || entities[idx].isLoadFromXML === true) {
                    if (context) {
                        // Handle closure issue in for-loops
                        (function(arrayIndex) {
                            var physicalSchema = "MINI";
                            var entity = entities[arrayIndex];
                            var name = entity.id;
                            var qualifier = entity.physicalSchema ? entity.physicalSchema : entity.schemaName ? entity.schemaName : entity.packageName;
                            var mainMode = entity.schemaName ? "RT" : entity.physicalSchema ? "RT" : "DT";

                            var entityType;
                            var entitySubType; // will be used for DT objects only.
                            switch (entities[arrayIndex].type) {
                                case viewModel.EntityType.DATABASE_TABLE:
                                case "TABLE":
                                    entityType = "TABLE";
                                    break;
                                case "VIEW":
                                case viewModel.EntityType.DATABASE_VIEW:
                                    entityType = "VIEW";
                                    break;
                                case viewModel.EntityType.ATTRIBUTE_VIEW:
                                    entityType = "VIEW";
                                    entitySubType = viewModel.EntityType.ATTRIBUTE_VIEW;
                                    break;
                                case viewModel.EntityType.ANALYTIC_VIEW:
                                    entityType = "VIEW";
                                    entitySubType = viewModel.EntityType.ANALYTIC_VIEW;
                                    break;
                                case viewModel.EntityType.CALCULATION_VIEW:
                                    entityType = "VIEW";
                                    entitySubType = "CALCULATION_VIEW";
                                    break;
                                case viewModel.EntityType.TABLE_FUNCTION:
                                case viewModel.EntityType.SCALAR_FUNCTION:
                                    entityType = "FUNCTION";
                                    break;
                                case viewModel.EntityType.PROCEDURE:
                                case viewModel.EntityType.CATALOG_PROCEDURE:
                                    entityType = "PROCEDURE";
                                    break;
                                case viewModel.EntityType.GRAPH_WORKSPACE:
                                    entityType = "GRAPH_WORKSPACE";
                                    break;
                            }
                            //Set the physical schema
                            if (entityType === "TABLE" && physicalSchema) {
                                entities[arrayIndex].physicalSchema = physicalSchema;
                                qualifier = physicalSchema;
                            }
                            var q = Q.defer();

                            metadataDetailService.getDetails(name, context.serviceName, function(result) {
                                    try {
                                        var aColumns;
                                        var aParameters;
                                        var xmlString;
                                        // the model might already be disposed (e.g. the editor close() has been called)
                                        if (result) {
                                            var jsonResult = JSON.parse(result);
                                            if (jsonResult && jsonResult.metadata) {
                                                aColumns = jsonResult.metadata[0].columns;
                                                //aParameters = jsonResult.metadata[0].parameter;
                                                //xmlString = jsonResult.metadata[0].definition;
                                            }
                                            //Set the entity as resolved
                                            entities[arrayIndex].isProxy = false;

                                            /* 1. Create columns in the entity */
                                            if (aColumns) {
                                                if (entityType === "FUNCTION" || entityType === "PROCEDURE") {
                                                    processScriptEntity(aColumns, entities[arrayIndex]);
                                                } else {
                                                    processElements(aColumns, entities[arrayIndex]);
                                                }
                                            }
                                            /* 2. Create parameters in the entity */
                                            if (aParameters) {
                                                processParameters(aParameters, entities[arrayIndex]);
                                            }

                                            var oneViewModel = null;
                                            var skipXMLFeatures = true;
                                            if (xmlString && entityType === "VIEW" && entities[arrayIndex].type === viewModel.EntityType.CALCULATION_VIEW && !
                                                rootModel.hasOwnProperty("analyticPrivilege")) {
                                                //Load the view model using xml
                                                oneViewModel = new viewModel.ViewModel();
                                                try {
                                                    loadFromXML(xmlString, oneViewModel);
                                                    skipXMLFeatures = false;
                                                } catch (ex) {
                                                    if (ex instanceof ModelBase.UnsupportedOperationException) {
                                                        mainViewModel.severityType = viewModel.SeverityType.ERROR;
                                                        mainViewModel.referenceEntities.add(entities[arrayIndex]);

                                                        var featureName;
                                                        if (ex.objects && ex.objects.length > 0) {
                                                            featureName = ex.objects[0];
                                                            if (typeof featureName === "string") {
                                                                mainViewModel.message = "Entity " + entities[arrayIndex].getFullyQualifiedName() + " based on " + featureName +
                                                                    " is not supported";
                                                            }
                                                        }
                                                    }
                                                }

                                                if (!skipXMLFeatures) {
                                                    /* 3. Create View model from XML */
                                                    createHiererchies(oneViewModel, entities[arrayIndex]);

                                                    //Set the Data Category and deprecated property from XML
                                                    entities[arrayIndex].dataCategory = oneViewModel.columnView.dataCategory;
                                                    entities[arrayIndex].deprecated = oneViewModel.columnView.deprecated;

                                                    entities[arrayIndex].isLoadFromXML = false;

                                                    //Enhance properties of the elements like drillDown, etc.. from the XML
                                                    var aViewElements = oneViewModel.columnView._defaultNode.elements.toArray();
                                                    for (var elemIdx = 1; elemIdx < aViewElements.length; elemIdx++) {
                                                        //Merge if the element is not hidden
                                                        if (!aViewElements[elemIdx].hidden) {
                                                            var element = entities[arrayIndex].createOrMergeElement(aViewElements[elemIdx]);
                                                            if (aViewElements[elemIdx].calculationDefinition !== undefined) {
                                                                element.createCalculationDefinition(aViewElements[elemIdx].calculationDefinition);
                                                            }
                                                        }
                                                    }

                                                    //Enhance the properties of the parameters from the XML
                                                    var aViewParameters = oneViewModel.columnView.parameters.toArray();
                                                    mergeParametersFromXML(rootModel._entities, entities[arrayIndex], aViewParameters);
                                                }
                                            }

                                            if (entities[arrayIndex].type === 'TABLE') {
                                                entities[arrayIndex].type = "DATA_BASE_TABLE";
                                            } else if (entities[arrayIndex].type === "VIEW") {
                                                entities[arrayIndex].type = "DATA_BASE_VIEW";
                                            }
                                        }
                                        q.resolve();
                                    } catch (e) {
                                        q.reject(e);
                                    } finally {
                                        // Call caller method once all the entities are resolved
                                        if (--filesNotResolved === 0 && callback) {
                                            callback();
                                        }
                                    }
                                },
                                function(err) {
                                    q.reject(err);
                                    if (--filesNotResolved === 0 && callback) {
                                        callback();
                                    }
                                });
                            return q.promise;
                        })(idx);
                    }
                } else {
                    if (--filesNotResolved === 0 && callback) {
                        callback();
                    }
                }
            }
        },

        readPruningInfo: function(rootModel, context, callback) {
            var viewNodes = rootModel.columnView.viewNodes;
            var pruningTable = rootModel.columnView.pruningTable;

            // nothing to read, call callback anyways to notify caller
            if (pruningTable === undefined) {
                callback();
                return;
            }

            /* 1. Loop through inputs and read the pruning information */
            if (rootModel.columnView.readPruningInformation) {
                //clear the old entries
                for (var idx = 0; idx < viewNodes.count(); idx++) {
                    for (var idx1 = 0; idx1 < viewNodes.getAt(idx).inputs.count(); idx1++) {
                        var nodeInput = viewNodes.getAt(idx).inputs.getAt(idx1);
                        nodeInput.unionPruningElementFilters.clear();
                    }
                }

                var schemaName = "'" + "_SYS_BIC" + "'";
                var calcScenario = "'" + context.packageName + '/' + rootModel.columnView.name + "'";
                //	var catalogDao = context.service.catalogDAO;
                var deferred = Q.defer();
                var settings = {
                    includePosColumn: "false"
                };
                var stmt = "SELECT * from " + pruningTable + " WHERE SCHEMA = " + schemaName + " AND CALC_SCENARIO = " + calcScenario;
                var oStatement = {
                    statement: stmt,
                    type: "CALL"
                };
                var mainCallBack = callback;

                var daoCallBack = function(result) {
                    if (result && result.resultSets !== undefined && result.resultSets.length > 0) {
                        if (result && result.resultSets !== undefined && result.resultSets.length > 0) {
                            for (var vnIdx = 0; vnIdx < viewNodes.count(); vnIdx++) {
                                var viewNode = viewNodes.getAt(vnIdx);
                                for (var ipIdx = 0; ipIdx < viewNode.inputs.count(); ipIdx++) {
                                    var input = viewNode.inputs.getAt(ipIdx);
                                    input.unionPruningElementFilters.clear();
                                    for (var rowIdx = 0; rowIdx < result.resultSets[0].entries.length; rowIdx++) {
                                        var isFound = false;
                                        var row = result.resultSets[0].entries[rowIdx];
                                        if (input.repositoryInputNodeId === row[2]) {
                                            isFound = true;
                                            break;
                                        }
                                    }
                                    if (isFound) {
                                        var elementFilter = input.createUnionPruningElementFilter({
                                            elementName: row[3]
                                        });
                                        var filterObj = {};
                                        var option = row[4] === "BETWEEN" ? SharedModel.ValueFilterType.RANGE_VALUE_FILTER : SharedModel.ValueFilterType.SINGLE_VALUE_FILTER;
                                        filterObj.type = option;
                                        filterObj.including = true;
                                        filterObj.operator = getOperatorType(row[4]);
                                        if (option === SharedModel.ValueFilterType.SINGLE_VALUE_FILTER) {
                                            filterObj.value = row[5];
                                        } else {
                                            filterObj.lowValue = row[5];
                                            filterObj.highValue = row[6];
                                        }
                                        elementFilter.createValueFilter(filterObj);
                                    }
                                }
                            }
                        }
                    }
                    deferred.resolve();
                    mainCallBack();
                };
                //Read the pruning information from the pruning table
                //catalogDao.sqlExecute(oStatement, settings, daoCallBack);
                rootModel.columnView.readPruningInformation = false;
            } else {
                callback();
            }
            return deferred.promise;
        }
    };

    return {
        ProxyResolver: ProxyResolver
    };

});

