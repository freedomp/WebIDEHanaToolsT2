/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/common", "../base/XmlReader", "../sharedmodel/sharedmodel", "../base/FullQualifiedName", "./model", "../base/modelbase"],
    function(common, XmlReader, sharedmodel, FullQualifiedName, model, modelbase) {
        "use strict";
        var Util = common.Util;

        /*var getAttributeMappingForAttribute = function(attributeName, cvInput) {
            var mapping = cvInput.mappings.get(attributeName);
            return mapping;
        };*/
        
        var getAttributeMappingForAttribute = function(element, cvInput) {
            var mapping ;
            for(var i = 0; i < cvInput.mappings.count(); i++){
                mapping = cvInput.mappings.getAt(i);
                if(mapping.targetElement.name === element.name){
                    return mapping;
                }
            }
            return mapping;
        };
        
        var removeAttributeMappingForAttribute = function(element, cvInput) {
            var mapping ;
            var mappingFound = false;
            var i;
            var deleteIndex;
            for( i = 0; i < cvInput.mappings.count(); i++){
                mapping = cvInput.mappings.getAt(i);
                if(mapping.targetElement && element && mapping.targetElement.name === element.name){
                    mappingFound = true;
                    deleteIndex = mapping.$$defaultKeyValue;
                    break;
                }
            }
            if(mappingFound){
                cvInput.mappings.remove(deleteIndex);
            }
        };

        var addElementToEntityIfNotPresent = function(entity, elementName) {
            if (entity !== null && entity !== undefined) {
                var element = entity.elements.get(elementName);
                if (element !== null && element !== undefined) {
                    return element;
                } else {
                    return entity.createElement({
                        name: elementName,
                        isProxy: true
                    });
                }
            }
            return null;
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

        var RepositoryXmlParserHelper = {
            
            removeAttributeMappingForAttribute: function(element, cvInput) {
                var mapping ;
                var mappingFound = false;
                var i;
                var deleteIndex;
                for( i = 0; i < cvInput.mappings.count(); i++){
                    mapping = cvInput.mappings.getAt(i);
                    if(mapping.targetElement && element && mapping.targetElement.name === element.name){
                        mappingFound = true;
                        deleteIndex = mapping.$$defaultKeyValue;
                        break;
                    }
                }
                if(mappingFound){
                    cvInput.mappings.remove(deleteIndex);
                }
            },

            processDrillDownEnablement: function(attributeHierarchyActive, displayAttribute, element) {
                attributeHierarchyActive = Util.parseBool(attributeHierarchyActive);
                displayAttribute = Util.parseBool(displayAttribute);
                //  if both are set true
                if (displayAttribute && attributeHierarchyActive) {
                    element.drillDownEnablement = model.DrillDownEnablement.DRILL_DOWN_WITH_HIERARCHY;
                }
                // if both are set false
                else if (!displayAttribute && !attributeHierarchyActive) {
                    element.drillDownEnablement = model.DrillDownEnablement.DRILL_DOWN;
                }
                // if first is false and second is true
                else if (!displayAttribute && attributeHierarchyActive) {
                    element.drillDownEnablement = model.DrillDownEnablement.DRILL_DOWN_WITH_HIERARCHY;
                }
                // if first is true and second is false
                else if (displayAttribute && !attributeHierarchyActive) {
                    element.drillDownEnablement = model.DrillDownEnablement.NONE;
                }
                return element;
            },
            
            /*createEndUserTextsIfRequired: function(object, attributes){
                var endUserTexts; var comment;
                if(attributes && attributes.comment !== undefined && attributes.comment !== null){
                    if(object.endUserTexts === undefined || object.endUserTexts === null){
                        if(object && object.createEndUserTexts && typeof(object.createEndUserTexts) === "function"){
                            object.createEndUserTexts({});
                        }
                    }    
                    if(object.endUserTexts !== undefined && object.endUserTexts !== null){
                        comment = object.endUserTexts.createComment({"text" : attributes.comment});
                    } 
                    delete attributes.comment;
                }
            },*/
            
            createEndUserTextsIfRequired: function(object, attributes){
                var endUserTexts; var comment;
                if(attributes && object && attributes.comment !== undefined && attributes.comment !== null){
                    if(object.endUserTexts === undefined || object.endUserTexts === null){
                        if(object && object.createEndUserTexts && typeof(object.createEndUserTexts) === "function"){
                            // object.createEndUserTexts({});
                            // comment = object.endUserTexts.createComment({"text" : attributes.comment});
                            object.createEndUserTexts({"comment": {
                                $constructor: model.CommentProperties,
                                "text" : attributes.comment
                                }});
                        }
                    }    
                    /*if(object.endUserTexts !== undefined && object.endUserTexts !== null){
                        comment = object.endUserTexts.createComment({"text" : attributes.comment});
                    } */
                    delete attributes.comment;
                }
            },

            /*removeHashTag: function(value) {
                return (value.charAt(0) === "#") ? value.substring(1) : value;
            },*/
            removeHashTag: function(id , columnView) {
            	if(columnView.schemaVersion < 3.0){
                	if (id) {
                        id = (id.charAt(0) === "#") ? id.substring(1) : id;
                    }
            	}            
                return id;
            },
            
            mapRepositoryTypeToEntityType: function(repoEntityType){
                //: Map EntityType for design time objects
                var entityType;
                if (repoEntityType === "ATTRIBUTE_VIEW" || repoEntityType === "attributeviews" || repoEntityType === "attributeview") {
                    entityType = "ATTRIBUTEVIEW";
                } else if (repoEntityType === "ANALYTIC_VIEW" || repoEntityType === "analyticviews" || repoEntityType === "analyticview") {
                    entityType = "ANALYTICVIEW";
                } else if (repoEntityType === "CALCULATION_VIEW" || repoEntityType === "calculationviews" || repoEntityType === "calculationview") {
                    entityType = "CALCULATIONVIEW";
                }else if (repoEntityType === "TABLE_FUNCTION") {
                    entityType = "hdbtablefunction";
                }
                return entityType;
            },
            
            isItDesigntimeRepositoryObject: function(entityType){
                if(entityType === "ATTRIBUTE_VIEW" || entityType === "ANALYTIC_VIEW" || entityType === "CALCULATION_VIEW" || entityType === "TABLE_FUNCTION"
                        || entityType === "ATTRIBUTEVIEW" || entityType === "ANALYTICVIEW" || entityType === "CALCULATIONVIEW" || entityType === "hdbtablefunction"){
                    return true;
                }    
                return false;
            },  
            
            mapEntityTypeToFQNameSuffix: function(repoEntityType){
                //: Map EntityType for design time objects
                var fqNameSuffix;
                if (repoEntityType === "ATTRIBUTEVIEW") {
                    fqNameSuffix = "attributeview";
                } else if (repoEntityType === "ANALYTICVIEW") {
                    fqNameSuffix = "analyticview";
                } else if (repoEntityType === "CALCULATIONVIEW") {
                    fqNameSuffix = "calculationview";
                }
                return fqNameSuffix;
            },

            processExecutionHints: function(columnViewAttributes) {
                var executionHintsAttributes = {};
                if (columnViewAttributes.enforceSqlExecution !== undefined) {
                    columnViewAttributes.enforceSqlExecution = Util.parseBool(columnViewAttributes.enforceSqlExecution);
                    if (columnViewAttributes.enforceSqlExecution) {
                        executionHintsAttributes.preferredEngine = "SQL";
                    } else {
                        executionHintsAttributes.preferredEngine = "CALC";
                    }
                    delete columnViewAttributes.enforceSqlExecution;
                } else {
                    executionHintsAttributes.preferredEngine = "CALC";
                }


                if (columnViewAttributes.cacheInvalidationPeriod !== undefined) {
                    if (columnViewAttributes.cacheInvalidationPeriod) {
                        executionHintsAttributes.cacheInvalidationPeriod = columnViewAttributes.cacheInvalidationPeriod;
                    }
                    delete columnViewAttributes.cacheInvalidationPeriod;
                }

                if (columnViewAttributes.alwaysAggregateResult !== undefined) {
                    columnViewAttributes.alwaysAggregateResult = Util.parseBool(columnViewAttributes.alwaysAggregateResult);
                    if (columnViewAttributes.alwaysAggregateResult) {
                        executionHintsAttributes.alwaysAggregateResult = columnViewAttributes.alwaysAggregateResult;
                    }
                    delete columnViewAttributes.alwaysAggregateResult;
                }

                if (columnViewAttributes.runWithInvokerPrivileges !== undefined) {
                    executionHintsAttributes.runWithInvokerPrivileges = Util.parseBool(columnViewAttributes.runWithInvokerPrivileges);
                    delete columnViewAttributes.runWithInvokerPrivileges;
                }

                return executionHintsAttributes;
            },

            parseAttributeTag: function(reader, parentTagName) {
                var value;
                if (reader && parentTagName) {
                    if (reader.tryMoveTo(parentTagName)) {
                        if (reader.tryMoveDown()) {
                            if (reader.tryMoveTo("attribute")) {
                                value = reader.getAttribute("attributeName");
                            }
                            reader.moveUp();
                        }
                    }
                }
                return value;
            },

            parseValueTag: function(reader, parentTagName) {
                var value;
                if (reader && parentTagName) {
                    if (reader.tryMoveTo(parentTagName)) {
                        if (reader.tryMoveDown()) {
                            if (reader.tryMoveTo("attribute")) {
                                value = reader.getContent();
                            }
                            reader.moveUp();
                        }
                    }
                }
                return value;
            },

            parseParameterTag: function(reader, parentTagName) {
                var value;
                if (reader && parentTagName) {
                    if (reader.tryMoveTo(parentTagName)) {
                        value = reader.getContent();
                    }
                }

                return value;
            },

            //Use Util.parseBool() instead; both are same
            getBooleanFromString: function(input) {
                if (input === "true") {
                    return true;
                }
                return false;
            },
            
            throwUnsupportedOperationException: function(feature) {
                throw new modelbase.UnsupportedOperationException(feature);
            },
            
            mapViewNodeType: function(type) {
                switch (type) {
                    case "JoinView":
                        return "JoinNode";
                    case "ProjectionView":
                        return "Projection";
                    case "AggregationView":
                        return "Aggregation";
                    case "UnionView":
                        return "Union";
                        //: Now we support Union node
                        // this.throwUnsupportedOperationException("Union Node");
                    case "RankView":
                        return "Rank";
                    case "SqlScriptView":
                        return "Script";
                    case "GraphView":
                        return "Graph";    
                    default:
                        return type;
                }
            },
            
            populateSimpleTypeAttributesFromElementAttributes: function(elementAttributes, simpleTypeAttributes) {
                simpleTypeAttributes.primitiveType = elementAttributes.primitiveType;
                delete elementAttributes.primitiveType;
                simpleTypeAttributes.length = elementAttributes.length;
                delete elementAttributes.length;
                simpleTypeAttributes.scale = elementAttributes.scale;
                delete elementAttributes.scale;
            },    
            
            removeJoinRelatedElementAddedinRepositoryXML: function(joinAttributes, viewNode) {
                if (viewNode !== undefined && viewNode.inputs.count() > 0) {
                    var cvInputLeft = viewNode.inputs.get(0);
                    if (viewNode.inputs.count() === 2) {
                        var cvInputRight = viewNode.inputs.get(1);
                    }
                }
                
                if (cvInputLeft !== undefined && cvInputRight !== undefined && joinAttributes !== undefined && joinAttributes.length > 0){
                    var joinAttributeProperties;
                    for (var i = 0; i < joinAttributes.length; i++) {
                        joinAttributeProperties = joinAttributes[i];
                        viewNode.joinAttribute = joinAttributeProperties.name;
    
                        if (viewNode.joinAttribute !== undefined) {
                            var joinElement = viewNode.elements.get(viewNode.joinAttribute);
                            removeAttributeMappingForAttribute(joinElement, cvInputRight);
    
                            // Is it technical join column?
                            if (viewNode.joinAttribute && viewNode.joinAttribute.indexOf('$') > -1) {
                                removeAttributeMappingForAttribute(joinElement, cvInputLeft);
                                viewNode.elements.remove(viewNode.joinAttribute);
                                // removeAttributeMappingForAttribute(joinElement, cvInputLeft);
                            }
                        }
                    }
                }
            },
            
            populateJoinAttributesFromViewNodeAttributes: function(joinAttributes, viewNodeAttributes){
                joinAttributes.joinType = viewNodeAttributes.joinType;
                joinAttributes.cardinality = viewNodeAttributes.cardinality;
                joinAttributes.languageColumn = viewNodeAttributes.languageColumn;
                joinAttributes.dynamic = viewNodeAttributes.dynamic;
                joinAttributes.dynamic = Util.parseBool(joinAttributes.dynamic);
                joinAttributes.optimizeJoinColumns = viewNodeAttributes.optimizeJoinColumns;
                joinAttributes.optimizeJoinColumns = Util.parseBool(joinAttributes.optimizeJoinColumns);

                // delete all join node related viewNodeAttributes since it is not required here now
                delete viewNodeAttributes.joinType;
                delete viewNodeAttributes.cardinality;
                delete viewNodeAttributes.languageColumn;
                delete viewNodeAttributes.dynamic;
                delete viewNodeAttributes.optimizeJoinColumns;
            },
            
            //Graph Node
            processGraphView: function(reader, columnView, viewNode, viewNodeAttributes) {
                if (reader.tryMoveToIntermediate("expression")) {
                    var graphExpression = reader.consumeContent();
                    viewNode.graphExpression = graphExpression;
                } 
                if(viewNodeAttributes.action){
                    viewNode.action = viewNodeAttributes.action;
                }
                if(viewNodeAttributes.workspace){
                  var workspaceEntity = columnView.$getContainer().createOrMergeEntity({id: viewNodeAttributes.workspace, type: model.EntityType.GRAPH_WORKSPACE, isProxy: true, schemaName: "Graph"});
                  viewNode.workspace = workspaceEntity;
                }
            },    

            processJoinView: function(reader, columnView, viewNode, joinAttributes) {
                //  console.log ( 'RepositoryXmlParserHelper processJoinView gets called' );
                var joinAttributeNames = [];
                while (reader.tryMoveTo("joinAttribute")) {
                    joinAttributeNames.push(reader.consumeAttribute("name"));

                    if (reader.tryMoveDown()) { // tryMoveDown1
                        var spatialJoinPropertiesFound = false;
                        if (reader.tryMoveToIntermediate("spatialJoinProperties")) {
                        	
                        	throwUnsupportedOperationException("Spatial Join");
                        	
                            // tryMoveDown1 suceedes need corresponding moveUp() - 1
                            spatialJoinPropertiesFound = true;
                            var predicate = reader.consumeAttribute("predicate");
                            var predicateEvaluatesTo = reader.consumeAttribute("predicateEvaluatesTo");
                            predicateEvaluatesTo = Util.parseBool(predicateEvaluatesTo);

                            if (reader.tryMoveDown()) { // tryMoveDown2
                                var distanceFound = false;
                                var intersectionMatrixFound = false;
                                if (reader.tryMoveToIntermediate("distance")) {
                                    distanceFound = true;
                                } else if (reader.tryMoveToIntermediate("intersectionMatrix")) {
                                    intersectionMatrixFound = true;
                                }

                                if (distanceFound || intersectionMatrixFound) {
                                    // tryMoveDown2 suceedes need corresponding moveUp() - 2
                                    if (reader.tryMoveDown()) { // tryMoveDown3
                                        var valueFound = false;
                                        var localVariableFound = false;
                                        if (reader.tryMoveToIntermediate("value")) {
                                            valueFound = true;
                                            var value = reader.consumeContent();
                                        } else if (reader.tryMoveToIntermediate("localVariable")) {
                                            localVariableFound = true;
                                            var localVariable = reader.consumeContent();
                                            localVariable = this.removeHashTag(localVariable);
                                        }
                                        if (valueFound || localVariableFound) {
                                            // tryMoveDown3 suceedes need corresponding moveUp() - 3
                                            reader.moveUp(); // corresponding moveUp() for tryMoveDown3  - 3
                                        }
                                    }
                                    reader.moveUp(); // corresponding moveUp() for tryMoveDown2  - 2
                                }
                            }
                            reader.moveUp(); // corresponding moveUp() for tryMoveDown1  - 1
                            reader.next();
                        }
                    } else {
                        reader.next();
                    }
                }

                if (viewNode.inputs.count() > 0) {
                    var cvInputLeft = viewNode.inputs.get(0);
                    if (viewNode.inputs.count() === 2) {
                        var cvInputRight = viewNode.inputs.get(1);
                    }
                }

                if (cvInputLeft !== undefined && cvInputRight !== undefined && joinAttributeNames.length > 0) {
                    var join = viewNode.createJoin(joinAttributes);
                    join.leftInput = cvInputLeft;
                    join.rightInput = cvInputRight;

                    var leftEntity = cvInputLeft.getSource();
                    var rightEntity = cvInputRight.getSource();

                    if (leftEntity === undefined || rightEntity === undefined) {
                        // Throw exception
                    }
                    if (joinAttributes.languageColumn) {
                        joinAttributes.languageColumn = joinAttributes.languageColumn;
                        joinAttributes.textJoin = true;
                        if (joinAttributes.languageColumn) {
                            addElementToEntityIfNotPresent(rightEntity, joinAttributes.languageColumn);
                        }
                        // delete joinAttributes.languageColumn;
                    }

                    for (var i = 0; i < joinAttributeNames.length; i++) {
                        viewNode.joinAttribute = joinAttributeNames[i];
                        // var joinAttribute = joinAttributeNames[i];
                        //TODO: Once renderer is ready use new temp variable name instead of viewNode.joinAttribute
                        if (viewNode.joinAttribute !== undefined) {
                            var joinElement = viewNode.elements.get(viewNode.joinAttribute);
                            // var mappingLeft = getAttributeMappingForAttribute(viewNode.joinAttribute, cvInputLeft);
                            var mappingLeft = getAttributeMappingForAttribute(joinElement, cvInputLeft);
                            // var leftSrcElemName = mappingLeft.sourceName;
                            var leftSrcElemName = mappingLeft.sourceElement.name;

                            // var mappingRight = getAttributeMappingForAttribute(viewNode.joinAttribute, cvInputRight);
                            var mappingRight = getAttributeMappingForAttribute(joinElement, cvInputRight);
                            // var rightSrcElemName = mappingRight.sourceName;
                            var rightSrcElemName = mappingRight.sourceElement.name;
                            // cvInputRight.mappings.remove(viewNode.joinAttribute);
                            removeAttributeMappingForAttribute(joinElement, cvInputRight);

                            // Is it technical join column?
                            if (viewNode.joinAttribute && viewNode.joinAttribute.indexOf('$') > -1) {
                                //: Remove the refrence from mapping first
                                removeAttributeMappingForAttribute(joinElement, cvInputLeft);
                                viewNode.elements.remove(viewNode.joinAttribute);
                                // cvInputLeft.mappings.remove(viewNode.joinAttribute);
                                // removeAttributeMappingForAttribute(joinElement, cvInputLeft);
                            }

                            var leftElement = addElementToEntityIfNotPresent(leftEntity, leftSrcElemName);
                            var rightElement = addElementToEntityIfNotPresent(rightEntity, rightSrcElemName);
                            
                            /*join.leftElements.add(leftElement);
                            join.rightElements.add(rightElement);*/
                            var key = leftElement.name + "$$" + rightElement.name;
                            join.leftElements.add(key, leftElement);
                            join.rightElements.add(key, rightElement);

                            //TODO: processSpatialJoinProperties
                            if (spatialJoinPropertiesFound) {
                                var spatialJoinProperties = join.createSpatialJoinProperties({
                                    "predicate": predicate,
                                    "predicateEvaluatesTo": predicateEvaluatesTo
                                });
                                var parameterization = {};
                                if (valueFound) {
                                    parameterization.value = value;
                                } else if (localVariableFound) {
                                    var parameter = getParameterFromColumnView(columnView, localVariable);
                                    // parameterization.parameter = parameter;
                                }
                                if (distanceFound && valueFound) {
                                    spatialJoinProperties.createSpatialDistanceParameterization(parameterization);
                                } else if (distanceFound && localVariableFound) {
                                    // var spatialDistanceParameterization = spatialJoinProperties.createSpatialIntersectionMatrixParameterization(parameterization);
                                    var spatialDistanceParameterization = spatialJoinProperties.createSpatialDistanceParameterization(parameterization);
                                    spatialDistanceParameterization.parameter = parameter;
                                } else if (intersectionMatrixFound && valueFound) {
                                    spatialJoinProperties.createSpatialIntersectionMatrixParameterization(parameterization);
                                } else if (intersectionMatrixFound && localVariableFound) {
                                    var spatialIntersectionMatrixParameterization = spatialJoinProperties.createSpatialIntersectionMatrixParameterization(parameterization);
                                    spatialIntersectionMatrixParameterization.parameter = parameter;
                                }
                            }
                        }
                    }
                    // delete viewNode.joinAttribute;
                }

            },

            setInputAliasIfRequired: function(dataSource, input) {
                if (dataSource && dataSource.alias && dataSource.alias.indexOf('$') > -1) {
                    // Case1: check is it special case when M2M has aliased it as 'ViewNodeName$$AliasName$$EntityName$$'?
                    var cvDataSource_name_parts = dataSource.alias.split('$$');
                    if (cvDataSource_name_parts && cvDataSource_name_parts.length == 4 && cvDataSource_name_parts[1]) {
                        input.alias = cvDataSource_name_parts[1];
                    }
                } else if (dataSource && typeof(dataSource.alias) !== 'undefined') {
                    // Case2: entityName differs from dataSource name
                    input.alias = dataSource.alias;
                }
            },
	
/*
            deriveNameFromID: function(id) {
                var name;
                if(id && id.indexOf('::') > -1){				
					var id_parts = id.split('::');					
					if (id_parts && id_parts.length === 2 && id_parts[1]) {
                        name = id_parts[1];
                    }
				}else if(id){
					name = id;
				}
				return name;
            },    
            */

            parseUDFParameter: function(reader, parentTagName) {
                var UDFParameter = [];
                var skippedNodes = reader.skippedNodes;
                if (reader && parentTagName) {
                    if (reader.tryMoveTo(parentTagName)) {
                        if (reader.tryMoveDown()) {
                            if (reader.tryMoveTo("attribute")) {
                                UDFParameter.element = reader.consumeAttribute("attributeName");
                                UDFParameter.dimensionUri = reader.consumeAttribute("dimensionUri");
                            }
                            if (reader.tryMoveTo("value")) {
                                UDFParameter.constantValue = reader.getContent();
                            }
                            if (reader.tryMoveTo("localVariable")) {
                                UDFParameter.parameter = reader.getContent();
                            }
                            reader.moveUp();
                        } else {
                            UDFParameter.parameter = reader.getContent();
                        }
                    }
                }
                UDFParameter.skippedNodes = skippedNodes;
                return UDFParameter;
            },
            
            decideDefaultNodeType: function(visibility, reader) {
                var isAggragation = false;
                var isNewView = true;
                
                var measureElement = reader._xmlDocument.getElementsByTagName("measure");
                if (measureElement.length > 0) {
                    isAggragation = true;
                    return isAggragation;
                }
                
                var calculatedMeasureElement = reader._xmlDocument.getElementsByTagName("calculatedMeasure");
                if (calculatedMeasureElement.length > 0) {
                    isAggragation = true;
                    return isAggragation;
                }
                
                if(!isAggragation){
                    var attributeElement = reader._xmlDocument.getElementsByTagName("attribute");
                    if (attributeElement.length > 0) {
                        isNewView = false;
                    }
                    
                    var calculatedAttributeElement = reader._xmlDocument.getElementsByTagName("calculatedAttribute");
                    if (calculatedAttributeElement.length > 0) {
                        isNewView = false;
                    }
                }
                
                if(isNewView){		
					if(visibility && visibility === "reportingEnabled"){
						isAggragation = true;
					}else{
						isAggragation = false;
					}
				}
				
				return isAggragation;
            },    
            
            checkForStarJoinWithDomAPI: function(reader) {
                var isStarJoin = false;
                var sharedDimensionsElement = reader._xmlDocument.getElementsByTagName("sharedDimensions");
                if (sharedDimensionsElement.length > 0) {
                    isStarJoin = true;
                    return isStarJoin;
                }
            },    
            
            // - Done as a temp alternative till AttributeFilter is not supported; Currently only filterExpression is supported;
            /*checkViewAttributeFilterWithDomAPI: function(reader, tagName) {
                var isviewAttributeWithFilterExists = false;
                var viewAttributeElements = reader._xmlDocument.getElementsByTagName(tagName);
                if (viewAttributeElements.length > 0) {
                    for (var i = 0; i < viewAttributeElements.length; i++) {
                        var viewAttributeElement = viewAttributeElements[i];
                        var attributElementChildrens = viewAttributeElement.children;
                        if(attributElementChildrens && attributElementChildrens.length > 0){
                            for (var j = 0; j < attributElementChildrens.length; j++) {
                                var attributElementChildren = attributElementChildrens[j];
                                if(attributElementChildren.nodeName === 'filter'){
                                    isviewAttributeWithFilterExists = true;
                                    return isviewAttributeWithFilterExists;
                                }
                            }
                        }
                    }    
                }
                return isviewAttributeWithFilterExists;
            }, */
            
            parseOperandsAttributes: function(reader, viewNode, valueFilter) {
                if(reader.tryMoveTo("operands")){
                  var operandsAttributes = reader.buildAttributes({
                      value: "{value}"    
                  }); 
                  valueFilter.createOperand(operandsAttributes);
                  return operandsAttributes;
               }    
            },    

            // To be backward compatibel, we may need to support opening of View with Element Filter; We support filter expression only from ediotor
            processElementFilter: function(reader, viewNode, elementName) {
                // var viewAttributeSkippedNodes = reader.skippedNodes;
                var filterTypeMapper = function(value) {
                    var type = reader.removePrefix(sharedmodel.NameSpace.ACCESSCONTROL, value);
                    switch (type) {
                        case "SingleValueFilter":
                            return "SingleValueFilter";
                        case "ListValueFilter":
                            return "ListValueFilter";
                        case "RangeValueFilter":
                            return "RangeValueFilter";
                    }
                };
                var filterAttributes = reader.buildAttributes({
                    type: Util.createXsiSelector("type", filterTypeMapper),
                    including: "{including}",
                    value: "{value}",
                    lowValue: "{lowValue}",
                    operator: "{operator}" ,
                    highValue: "{highValue}"
                }); 
                
                //Set operator as EQUAL if it is not there; For SingleValueFilter - EQUAL operator is not saved in xml
                if(filterAttributes.type === 'SingleValueFilter' && filterAttributes.operator === undefined){
                    filterAttributes.operator = sharedmodel.ValueFilterOperator.EQUAL;
                }    
                
                filterAttributes.including = Util.parseBool(filterAttributes.including);
                
                var elementFilter = viewNode.createElementFilter({"elementName": elementName});
                // viewNode.elementFilters.add(elementFilter);
                var valueFilter = new sharedmodel.ValueFilter(filterAttributes);
                elementFilter.valueFilters.add(valueFilter);
            
                if(filterAttributes.type === 'ListValueFilter'){
                    //Process operands for ListValueFilter
                    if(reader.tryMoveDown()){
                        while (this.parseOperandsAttributes(reader, viewNode, valueFilter)) {
                            reader.next();
                        }
                        reader.moveUp();
                    }    
                }
            },
            
            
            //START: convertElementFilterToFilerExpression code
            isNumeric: function(type) {
        		switch (type) {
        		case model.PrimitiveType.BIGINT:
        		case model.PrimitiveType.DECIMAL:
        		case model.PrimitiveType.DOUBLE:
        		case model.PrimitiveType.FLOAT:
        		case model.PrimitiveType.NUMERIC:
        		case model.PrimitiveType.REAL:
        		case model.PrimitiveType.SMALLDECIMAL:
        		case model.PrimitiveType.SMALLINT:
        		case model.PrimitiveType.TINYINT:
        		case model.PrimitiveType.INTEGER:
        			return true;
        		default:
        			return false;
        		}
    	    },
    	    
    	    getCommaSeperatedString: function(listValueFilter, isValueNumeric) {
        		var txt = "";
        		var count = 0;
        		for (var index = 0; index < listValueFilter.operands.count() > 0; index++) {
        		    var filterOperand = listValueFilter.operands.getAt(index);
        			if (count++ !== (listValueFilter.operands.count() - 1)) {
        				txt = txt + (this.formatExp(filterOperand.value, isValueNumeric) + ","); //$NON-NLS-1$
        			} else {
        				txt = txt + (this.formatExp(filterOperand.value, isValueNumeric));
        			}
        		}
        		return txt;
    	    },
    	    
    	    formatExp: function(expression, isValueNumeric) {
        		if (!isValueNumeric){
        			return "'" + expression + "'"; 
        		}else {
        			return expression;
        		}
    	    },
            
            getFilterString: function(elementFilter) {
                var retString = null;
        		var id = elementFilter.elementName;
        		var isNumeric = false;
        		var element = elementFilter.$getContainer().elements.get(id);
        		if (element !== null && element !== undefined) {
        			var inlineType = element.inlineType;
        			if (inlineType !== null && inlineType !== undefined) {
        				isNumeric = this.isNumeric(inlineType.primitiveType);
        			}
        		}
        		for(var index = 0; index < elementFilter.valueFilters.count() > 0; index++){
                    var valueFilter = elementFilter.valueFilters.getAt(index);
                    var singleValueFilter;
                    switch (valueFilter.operator) {
                        case sharedmodel.ValueFilterOperator.BETWEEN:
                            var rangeValueFilter = valueFilter;
                            retString = ">=" + (this.formatExp(rangeValueFilter.lowValue, isNumeric) + " AND " + "\"" + id + "\"" + "<=" + this.formatExp(rangeValueFilter.highValue, false)); 
    				        retString = "\"" + id + "\"" + " " + retString; 
    				        break;
                		case sharedmodel.ValueFilterOperator.EQUAL:
                		    singleValueFilter = valueFilter;
            				if (singleValueFilter.including){
            					retString = "=" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				}else {
            					retString = "!=" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				}
            				retString = "\"" + id + "\"" + " " + retString; 
            				break;
                		case sharedmodel.ValueFilterOperator.IN:
                		    var listValueFilter = valueFilter;
            				var txt = this.getCommaSeperatedString(listValueFilter, isNumeric);
            				if (listValueFilter.including){
            					retString = "in (" + "\"" + id + "\"," + txt + ")"; 
            				}else{
            					retString = "not in (" + "\"" + id + "\"," + txt + ")"; 
            				}	
            				break;
                		case sharedmodel.ValueFilterOperator.IS_NULL:
                		    singleValueFilter = valueFilter;
            				if (singleValueFilter.including){
            					retString = "isNull(" + "\"" + id + "\"" + ")"; 
            				}else {
            					retString = "not isNull(" + "\"" + id + "\"" + ")"; 
            				}
            				break;
                		case sharedmodel.ValueFilterOperator.LESS_THAN:
                		    singleValueFilter = valueFilter;
            				retString = "<" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				retString = "\"" + id + "\"" + " " + retString; 
            				break;
                		case sharedmodel.ValueFilterOperator.LESS_EQUAL:
                		    singleValueFilter = valueFilter;
            				retString = "<=" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				retString = "\"" + id + "\"" + " " + retString; 
            				break;
                		case sharedmodel.ValueFilterOperator.GREATER_THAN:
                		    singleValueFilter = valueFilter;
            				retString = ">" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				retString = "\"" + id + "\"" + " " + retString; 
            				break;
                		case sharedmodel.ValueFilterOperator.GREATER_EQUAL:
                		    singleValueFilter = valueFilter;
            				retString = ">=" + (this.formatExp(singleValueFilter.value, isNumeric)); 
            				retString = "\"" + id + "\"" + " " + retString; 
            				break;
                		case sharedmodel.ValueFilterOperator.CONTAINS_PATTERN:
                		    singleValueFilter = valueFilter;
            				retString = "match(" + "\"" + id + "\"," + this.formatExp(singleValueFilter.value, false) + ")"; 
            				break;
                		default:
                			return false;
                    }
                }
                return "(" + retString + ")";
            },
            
            removeExtraCodeFromFilterString: function(filterDisplayString, name){
                var index = filterDisplayString.indexOf(name);
                if (filterDisplayString.charAt(index - 1) === '\'') {
					var deleteIndex = index - 1;
					filterDisplayString = filterDisplayString.slice(0, deleteIndex) + filterDisplayString.slice(deleteIndex, filterDisplayString.length);
				}
				var k = index + name.length - 1;
				if ((k >= 0 && k < filterDisplayString.length) && filterDisplayString.charAt(k) === '\'') {
					filterDisplayString = filterDisplayString.slice(0, k) + filterDisplayString.slice(k, filterDisplayString.length);
				}
				return filterDisplayString;
            },
            
            convertElementFilterToFilerExpression: function(columnView) {
                var viewNodesNames = "";
                var j = 0;
                for (var i = 0; i < columnView.viewNodes.count(); i++) {
                    var viewNode = columnView.viewNodes.getAt(i);
                    var elementFilterFound = this.convertElementFilterToFilerExpressionViewNode(viewNode);
                    if(elementFilterFound){
                        if(j === 0){
                            viewNodesNames = viewNodesNames + viewNode.name;
                        }else{
                            viewNodesNames = viewNodesNames + ', ' + viewNode.name;
                        } 
                        j++;
                    }
                }   
                if(viewNodesNames.length > 0){
                    // columnView.errorMsg = "The individual column level filters applied on ViewNodes (" + viewNodesNames + ") has been converted to filter exprssion";
                    /*columnView.errorMsg = "Filters defined on individual columns in the below view nodes have been converted to its equivalent node level filter expressions." + "\n" +
                                                       " - " +  viewNodesNames;*/
                    columnView.errorMsg = "Filters defined on individual columns in the below view nodes have been converted to its equivalent node level filter expressions." + "\n" +
                                                       " - " +  viewNodesNames;                                   
                }
            },    
           
            convertElementFilterToFilerExpressionViewNode: function(viewNode, filterExpressionLanguage) {
                var expressions = [];
                var elementFilterFound = false;
                var columnView = viewNode.$getContainer();
                for(var i = 0; i < viewNode.elementFilters.count() > 0; i++){
                    elementFilterFound = true;
                    var elementFilter = viewNode.elementFilters.getAt(i);
                    var filterDisplayString = this.getFilterString(elementFilter);
                    for(var j = 0; j < columnView.parameters.count(); j++){
                        //Remove the extra quote added in case of multi-valued parameters.
                        var parameter = columnView.parameters.getAt(j);
                        if(parameter.multipleSelections){
                            var name = "$$" + parameter.name + "$$";
                            if(filterDisplayString.indexOf(name) > -1){
    							filterDisplayString = this.removeExtraCodeFromFilterString(filterDisplayString, name); 
                            }
                        }
                    }
                    expressions.push(filterDisplayString);
                }
                
                var filterExpression = "";
                for(var l = 0; l < expressions.length > 0; l++){
                    filterExpression = filterExpression + expressions[l];
                    if(l !== (expressions.length-1)){
                        filterExpression = filterExpression + " AND ";
                    }
                }
                
                if(filterExpression.length > 0){
                    viewNode.createFilterExpression({
                        "formula": filterExpression,
                        "expressionLanguage": filterExpressionLanguage
                    });
                }
                return elementFilterFound;
            }
            //END: convertElementFilterToFilerExpression code
        };

        return RepositoryXmlParserHelper;
    });
