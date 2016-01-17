/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../base/common", "../base/XmlReader", "../sharedmodel/sharedmodel", "../base/FullQualifiedNameTest", "./RepositoryXmlParserHelper", "./model", "../base/modelbase", "./RepositoryXmlRendererHelper", "../base/FullQualifiedName"],
    function(common, XmlReader, sharedmodel, FullQualifiedName, RepositoryXmlParserHelper, vModel, modelbase, RepositoryXmlRendererHelper, FullQualifiedNameTest) {
        "use strict";
 
        var Util = common.Util;
 
        // map to store Input instance corresponding to each DataSource instance, will be used while processing Global Input Parameter Mapping
        // var mapOfDataSourceToInput = [];
 
        var getSourceForInput = function(id, dataSources, viewNode) {        	
            //id = (id.charAt(0) === "#") ? id.substring(1) : id;        	
        	var columnView = viewNode.$getContainer();
        	if(columnView.schemaVersion < 3.0){
        		id = (id.charAt(0) === "#") ? id.substring(1) : id;
        	}
        	
            var dataSource = dataSources[id];
            if (dataSource) {
                var attributes = {
                    id: dataSource.resourceUri,
                    type: dataSource.type,
                    isProxy: true
                };              
                
                attributes.name = attributes.id;
                // Code to avoid creation of duplicate entitiy for same FQName - Start
               //var fqName = dataSource.resourceUri;               
                var entity = viewNode.$getModel()._entities.get(attributes.id);
                if (entity !== null && entity !== undefined) {
                    return entity;
                } else {
                    entity = viewNode.$getModel().createEntity(attributes);
                }
				//var entity = viewNode.$getModel().createEntity(attributes);
                // Code to avoid creation of duplicate entitiy for same FQName - End
                // var entity = viewNode.$getModel().createEntity(attributes, dataSource.skippedNodes);
                return entity;
            } else {
                return viewNode.$getContainer().createOrMergeViewNode({
                    "name": id
                });
            }
        };
		
		var deriveNameFromID = function(id) {
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
            };  
 
        var removeHashFromString = function(id , columnView) {
            /*if (id) {
                id = (id.charAt(0) === "#") ? id.substring(1) : id;
            }*/            
            if(columnView.schemaVersion < 3.0){
            	if (id) {
                    id = (id.charAt(0) === "#") ? id.substring(1) : id;
                }
        	}            
            return id;
        };
 
        var endsWith = function(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };
 
 
        var getInputforDatasource = function(datasourceID, columnView) {
            var inputForDatasource;
            if (columnView && columnView.viewNodes) {
                for (var j = 0; j < columnView.viewNodes.count(); j++) {
                    var viewNode = columnView.viewNodes.getAt(j);
                    if (viewNode) {
                        for (var i = 0; i < viewNode.inputs.count(); i++) {
                            var input = viewNode.inputs.get(i);
                            /*if (datasourceID.indexOf(viewNode.name + "$$") === 0) {
                                datasourceID = datasourceID.substring(0, datasourceID.lastIndexOf("$$"));
                                datasourceID = datasourceID.substring(datasourceID.lastIndexOf("$$") + 2);
                                if (input.getSource().id === datasourceID) {
                                    inputForDatasource = input;
                                    break;
                                }
                            } else if (input.getSource().id === datasourceID || input.alias === datasourceID) { 
                                inputForDatasource = input;
                            }*/
                            if(input.repositoryInputNodeId === datasourceID){
                            	inputForDatasource = input;
                            	break;
                            }
                        }
                    }
                    if (inputForDatasource) {
                        break;
                    }
                }
            }
            return inputForDatasource;
        };
       
        var getSharedInputforDatasource = function(resourceURI, columnView) {
            var defulatNode = columnView.getDefaultNode();
            for(var i = 0; i < defulatNode.inputs.count(); i++){
                 var input = defulatNode.inputs.getAt(i);
                 if(input && input.getSource() && input.getSource() instanceof vModel.Entity && input.selectAll){
                     var source = input.getSource();
                     var relUri = RepositoryXmlRendererHelper.getResourceUri(source);
                     if(relUri === resourceURI){
                        return input;
                     }
                 }    
                                                 }
        };   
 
        var throwUnsupportedOperationException = function(feature) {
            throw new modelbase.UnsupportedOperationException(feature);
        };
 
        var getElementFromColumnView = function(columnView, name) {
            if (columnView && name) {
                if (columnView.getDefaultNode() !== null && columnView.getDefaultNode() !== undefined) {
                    var foundElement = columnView.getDefaultNode().elements.get(name);
                    if (foundElement !== null && foundElement !== undefined) {
                        return foundElement;
                    }
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
       
        var getHierarchyFromColumnView = function(columnView, name) {
            if (columnView && name) {
                if (columnView.inlineHierarchies !== null && columnView.inlineHierarchies !== undefined) {
                    var foundElement = columnView.inlineHierarchies.get(name);
                    if (foundElement !== null && foundElement !== undefined) {
                        return foundElement;
                    }
                }
            }
            return null;
        };
 
        // Used for attribute currency mapping
        var populateUnitCurrencyElements = function(columnView, data) {
            var element = getElementFromColumnView(columnView, data.attribute);
            var unitCurrencyElement = getElementFromColumnView(columnView, data.value);
            if (element && unitCurrencyElement) {
                element.unitCurrencyElement = unitCurrencyElement;
            }
        };
		
		//XS1 Code - Start
        /*var getEntity = function(columnView, FQName, entityType) {
            var viewModel = columnView.$getContainer();
            var entity = viewModel._entities.get(FQName.getFullQualifiedName());
            if (entity !== null && entity !== undefined) {
                return entity;
            } else {
                var entityAttributes = {
                    isProxy: true,
                    name: FQName.getName(),
                    type: entityType
                };
                if (FQName.isCatalogRTType()) {
                    entityAttributes.schemaName = FQName.getNameQualifier();
                } else {
                    entityAttributes.packageName = FQName.getNameQualifier();
                }
                return viewModel.createEntity(entityAttributes);
            }
            return null;
        };
       
        var getElementFromEntity = function(columnView, FQName, elementName, entityType) {
            var entity = getEntity(columnView, FQName, entityType);
            if (entity !== null && entity !== undefined) {
                var element = entity.elements.get(elementName);
                if (element) {
                    return element;
                } else {
                    return entity.createElement({
                        name: elementName,
                        isProxy: true
                    });
                }
            }
            return null;
        };*/
		//XS1 Code - End
		
		//HDI Migration Code - Start       
        var getEntity = function(columnView, id, entityType) {
            var viewModel = columnView.$getContainer();
            var entity = viewModel._entities.get(id);
            if (entity !== null && entity !== undefined) {
                return entity;
            } else {
                var entityAttributes = {
                    isProxy: true,
                    name: id,
                    id: id,
                    type: entityType
                };
                return viewModel.createEntity(entityAttributes);
            }
            return null;
        };
        
        var getElementFromEntity = function(columnView, id, elementName, entityType) {
            var entity = getEntity(columnView, id, entityType);
            if (entity !== null && entity !== undefined) {
                var element = entity.elements.get(elementName);
                if (element) {
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
        //HDI Migration Code - End
       
        var createSharedElementNameInAgreedFormat = function(entity, elementName) {
            /*var fqName = entity.getFullyQualifiedName();
            var sharedElementName = fqName + "." + elementName;
            return sharedElementName;*/
            return elementName;
        };   
    
        // This method is specifically designed for star join shared dimensins and hence should be used with same
        var getElementFromsharedEntity = function(entity, elementName) {
            if (entity !== null && entity !== undefined) {
                var sharedElementName = createSharedElementNameInAgreedFormat(entity, elementName);
                var element = entity.elements.get(sharedElementName);
                if (element) {
                    return element;
                } else {
                    return entity.createElement({
                        name: sharedElementName,
                        isProxy: true
                    });
                }
            }
            return null;
        };
 
        var getParameterFromEntity = function(columnView, entity, parameterName) {
            if (entity !== null && entity !== undefined) {
                var parameter = entity.parameters.get(parameterName);
                if (parameter) {
                    return parameter;
                } else {
                    return entity.createParameter({
                        name: parameterName,
                        isProxy: true
                    });
               }
            }
            return null;
        };
 
        var getHierarchyFromEntity = function(columnView, FQName, elementName, entityType) {
            var entity = getEntity(columnView, FQName, entityType);
            if (entity !== null && entity !== undefined) {
                var element = entity.inlineHierarchies.get(elementName);
                if (element) {
                    return element;
                } else {
                    /*return entity.createInlineHierarchy({
                        name: elementName,
                        isProxy: true
                    });*/
                    return entity.createOrMergeHierarchy({
                        name: elementName,
                        isProxy: true
                    });
                }
            }
            return null;
        };
        // Creating new method since getElementFromEntity() is taking FQName and columnView; which is not needed if I have already entity instance and
        // wanted to ad element into it
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
 
        // We parse calculation view based on their position in xml; so it might happen beneath calc view view used in current one not being processed
        var addElementToViewNodeIfNotPresent = function(viewNode, elementName) {
            if (viewNode !== null && viewNode !== undefined) {
                var element = viewNode.elements.get(elementName);
                if (element !== null && element !== undefined) {
                    return element;
                } else {
                    return viewNode.createElement({
                        name: elementName
                    });
                }
            }
            return null;
        };
       
        var processUDFParameter = function(columnView, udfParameter, values) {
            if (udfParameter && values) {
                if (values.element) {
                    if(values.dimensionUri){
                        var fqName = FullQualifiedName.createByResourceURI(values.dimensionUri);
                        var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                        udfParameter.element =  getElementFromsharedEntity(sharedEntity, values.element);
                    }else{
                        udfParameter.element = getElementFromColumnView(columnView, values.element);
                    }       
                }
                if (values.parameter) {
                    udfParameter.parameter = getParameterFromColumnView(columnView, values.parameter);
                }
                if (values.constantValue) {
                    udfParameter.constantValue = values.constantValue;
                }
                udfParameter.skippedNodes = values.skippedNodes;
            }
            return udfParameter;
        };
       
        // Helper method to get DataSource using id from dataSources list
        var getDataSource = function(id, dataSources, columnView) {
            //id = (id.charAt(0) === "#") ? id.substring(1) : id;            
            if(columnView.schemaVersion < 3.0){
            	id = (id.charAt(0) === "#") ? id.substring(1) : id;
        	}
            
            var dataSource = dataSources[id];
            return dataSource;
        };
 
        var RepositoryXmlParser = {
 
            parseScenario: function(xmlDocument, model, fixMixedLineEndings, forceLineEndings) {
                // console.log ( 'RepositoryXmlParser parseScenario gets called' );
                var reader = new XmlReader(xmlDocument, fixMixedLineEndings, forceLineEndings);
 
                //registerUnsupportedOperation(reader);
                reader.context.postProcessingRegistry = {
                    callback: []
                };
               
                //Require for new way of loadPostProcessing
               reader.context.loadPostProcessingCallBackQueue = {
                    callback: []
                };
               
                reader.moveDown().moveTo("scenario", sharedmodel.NameSpace.CALCULATION);
 
                var calculationScenarioType = reader.getAttribute("calculationScenarioType");
                var outputViewType = reader.consumeAttribute("outputViewType");
                var outputViewName = outputViewType;
 
                //Checking StarJoin using DOM API
                var isStarJoin = RepositoryXmlParserHelper.checkForStarJoinWithDomAPI(reader);
 
                //- Done as a temp alternative till AttributeFilter is not supported; Currently only filterExpression is supported;
                /*var isviewAttributeWithFilterExists = RepositoryXmlParserHelper.checkViewAttributeFilterWithDomAPI(reader, "viewAttribute");
                if (isviewAttributeWithFilterExists) {
                    throwUnsupportedOperationException("Element Filter - only Filter Expression is supported");
                }*/
                // column level filters will now be supported
                
                if (isStarJoin) {
                    throwUnsupportedOperationException("Star Join");
                }
 
                var mapDefaultClient = function(value) {
                    return value === "crossClient" ? false : true;
                };
 
                // schemaVersion
                var schemaVersion = reader.consumeAttribute("schemaVersion");
 
                var columnViewAttributes = reader.buildAttributes({
                    //name: "{id}",
                    id: "{id}",
                    applyPrivilegeType: "{applyPrivilegeType}",
                    defaultClient: "{defaultClient}",
                    dataCategory: "{dataCategory}",
                    visibility: "{visibility}",
                    defaultMember: "{defaultMember}",
                    historyEnabled: "{historyEnabled}",
                    enforceSqlExecution: "{enforceSqlExecution}",
                    cacheInvalidationPeriod: "{cacheInvalidationPeriod}",
                    alwaysAggregateResult: "{alwaysAggregateResult}",
                    runWithInvokerPrivileges: "{runWithInvokerPrivileges}",
                    scriptParametersCaseSensitive: "{scriptParametersCaseSensitive}",
                    dimensionType: "{dimensionType}",
                    deprecated: "{deprecated}",
                    translationRelevant: "{translationRelevant}" ,
                    pruningTable: "{pruningTable}"
                });
                /*
				if(columnViewAttributes.id && columnViewAttributes.id.indexOf('::') > -1){				
					var columnViewIdAttribute_parts = columnViewAttributes.id.split('::');					
					if (columnViewIdAttribute_parts && columnViewIdAttribute_parts.length == 2 && columnViewIdAttribute_parts[1]) {
                        columnViewAttributes.name = columnViewIdAttribute_parts[1];
                    }
				}else if(columnViewAttributes.id){
					columnViewAttributes.name = columnViewAttributes.id;
				}
				*/
				columnViewAttributes.name = this.deriveNameFromID(columnViewAttributes.id);
				
				if(columnViewAttributes.historyEnabled){
					throwUnsupportedOperationException("History View");
				}
				
				if(columnViewAttributes.dimensionType && columnViewAttributes.dimensionType === "TIME"){
					throwUnsupportedOperationException("TIME Calculation View");
				}
                                                               
                var columnViewSkippedNodes = reader.skippedNodes;
 
                reader.moveDown();
 
                var originAttributes = {};
                this.parseOrigin(reader, originAttributes);
                var originSkippedNodes = reader.skippedNodes;
 
                sharedmodel.parseDescriptions(reader, columnViewAttributes);
 
                if (reader.tryMoveToIntermediate("defaultSchema")) {
                    reader.buildAttributes({
                        defaultSchema: "{schemaName}"
                    }, columnViewAttributes);
                    reader.next();
                }
 
                columnViewAttributes.clientDependent = mapDefaultClient(columnViewAttributes.defaultClient);
                if (columnViewAttributes.clientDependent && columnViewAttributes.defaultClient !== '$$client$$') {
                    columnViewAttributes.fixedClient = columnViewAttributes.defaultClient;
                }
 
                // If Client Handling In CV is Supported and schemaVersion <= 2.2 and if the defaultClient is set, then change it to cross client;                 
                if (schemaVersion && schemaVersion <= 2.2) {
                    //schemaVersion = 2.3;
                    schemaVersion = 3.0;
                    if (columnViewAttributes.defaultClient !== null && columnViewAttributes.defaultClient !== "") {
                        // if the defaultClient is set, change it to cross client;  
                        columnViewAttributes.clientDependent = false;
                        // nsetFixedClient, it is required if legacy model is having fixed client
                        columnViewAttributes.fixedClient = undefined;
                        //TODO: process Client Handling For Currency Unit Conversion
                        /*if (!calcSc.getDefaultClient().equals(Constants.CROSS_CLIENT.getLiteral())) {
                                                                // When client is empty  for a currency/unit conversion in measure and calculated measure;
                                                                // then we have to set client as default client set in model after checking if schemaVersion <= 2.2(this is not applicable when DefaultClient was CROSS_CLIENT)
                                                                    processClientHandlingForCurrencyUnitConversion(calcSc);
                                                    }*/
                    }
                }
 
                // defaultClient is not reuired in columnView
                delete columnViewAttributes.defaultClient;
 
                // If repository xml does not having dataCategory, decide dataCategory based on visibility flag.
                if (columnViewAttributes.dataCategory === undefined) {
                    if (columnViewAttributes.visibility === 'reportingEnabled') {
                        columnViewAttributes.dataCategory = 'CUBE';
                    } else {
                        columnViewAttributes.dataCategory = 'DEFAULT';
                    }
                }
 
                if (calculationScenarioType === "TREE_BASED") {
                    if (!outputViewType && isStarJoin) {
                        outputViewType = "JoinNode";
                        outputViewName = "Star Join";
                    } else if (!outputViewType) {
                        //To be backward compatible handle outputViewType as SystemDerived
                        //It means it is legacy model ceated before SP6; we have to decide type of default node will be decided as below:
                        // Based on output view type the default node will be Projection/Aggregation
                        // If output view type is AGGREGATION then AGGREGATION node, if output view type is PROJECTION then PROJECTION node
                        // In case of old models output view type will be SYSTEM_DERIVED, then it will be decided based on base measures or calculated measures in MeasureGroup
                        var isDefaultNodeTypeAggragation = RepositoryXmlParserHelper.decideDefaultNodeType(columnViewAttributes.visibility, reader);
                        if (isDefaultNodeTypeAggragation) {
                            outputViewType = "Aggregation";
                            outputViewName = "Aggregation";
                        } else {
                            outputViewType = "Projection";
                            outputViewName = "Projection";
                        }
                    } else {
                        outputViewName = outputViewType;
                    }
                } else if (calculationScenarioType === "SCRIPT_BASED") {
                    outputViewType = "Script";
                    outputViewName = "Script_View";
                }
 
                // To be backward compatible consider the case when applyPrivilegeType was boolean
                if (columnViewAttributes.applyPrivilegeType === 'true' || columnViewAttributes.applyPrivilegeType === undefined) {
                    columnViewAttributes.applyPrivilegeType = "ANALYTIC_PRIVILEGE";
                } else if (columnViewAttributes.applyPrivilegeType === 'false') {
                    columnViewAttributes.applyPrivilegeType = "NONE";
                }
 
                var columnView = model.createColumnView(columnViewAttributes, columnViewSkippedNodes);
               
                // var descriptionAttributes = {};
                RepositoryXmlParserHelper.createEndUserTextsIfRequired(columnView, columnViewAttributes);
               
                columnView.schemaVersion = schemaVersion;
                columnView.historyEnabled = Util.parseBool(columnViewAttributes.historyEnabled);
                columnView.deprecated = Util.parseBool(columnViewAttributes.deprecated);
                if(columnView.translationRelevant === undefined){
                    columnView.translationRelevant = true;
                }
                else{
                    columnView.translationRelevant = Util.parseBool(columnViewAttributes.translationRelevant);
                }
                columnView.scriptParametersCaseSensitive = Util.parseBool(columnViewAttributes.scriptParametersCaseSensitive);
               
                if(columnView.pruningTable){
                    columnView.readPruningInformation = true;
                }
 
                // Execution hint Properties - START
                var executionHintsAttributes = RepositoryXmlParserHelper.processExecutionHints(columnViewAttributes);
                var executionHints = columnView.createExecutionHints(executionHintsAttributes);
                // Execution hint Properties - END
 
                //createOrigin
                if (originAttributes.isOriginTagPresent !== undefined && originAttributes.isOriginTagPresent) {
                    columnView.createOrigin(originAttributes, originSkippedNodes);
                }
               
                //Initialize defaultNodeElementInstanceArray in Columnview to avoid post processing
                columnView._defaultNodeElementInstancesArray = [];
 
                if (reader.moveToIntermediate("localVariables").tryMoveDown()) {
                    while (this.parseVariable(reader, columnView)) {
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
                //Call reader.tryMoveToIntermediate("localVariables"); Because it may happen there will be xml without this tag.
                /*if (reader.tryMoveToIntermediate("localVariables")) {
                    if(reader.tryMoveDown()){
                        while (this.parseVariable(reader, columnView)) {
                        reader.next();
                        }
                        reader.moveUp();
                    }
                    reader.next();
                }*/
               
                //historyVariable tag comes before variableMappings tag;
                if (reader.tryMoveToIntermediate("historyVariable")) {
                	
                	throwUnsupportedOperationException("HistoryVariable");
                	
                    var historyParameterName = reader.consumeContent();
                    // Get parameter and set it to columnView historyParameter
                    var historyParameter = getParameterFromColumnView(columnView, historyParameterName);
                    columnView.historyParameter = historyParameter;
                    reader.next();
                }
 
                if (reader.tryMoveToIntermediate("variableMappings")) {    	
                	
                    if (reader.tryMoveDown()) {
                    	
                    	throwUnsupportedOperationException("Variable Mappings");
                    	
                        while (this.parseVariableMappings(reader, columnView)) {
                            reader.next();
                        }
                        reader.moveUp();
                    }
                }
                reader.next();
               
                //Generic execution hints
                while(reader.tryMoveTo("executionHints")){
                    var attributeValueAttributes = reader.buildAttributes({
                        name: "{name}",
                        value: "{value}"
                    });
                    var NameValuePairSkippedNodes = reader.skippedNodes;
                    executionHints.createNameValuePair(attributeValueAttributes, NameValuePairSkippedNodes);
                    reader.next();
                }
                
                var dataSources = {};
                if (reader.moveToIntermediate("dataSources").tryMoveDown()) {
                    while (this.parseDataSource(reader, dataSources)) {
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
               
                // TODO: To be backward compatible Process Hanging Data sources: create projection node and keep inside it
                // New array to check HangingDataSources
                var nodeIDsInCalculationView = [];
                if (reader.moveToIntermediate("calculationViews").tryMoveDown()) {
                    while (this.parseCalculationView(reader, columnView, dataSources, nodeIDsInCalculationView)) {
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
                /* Test code to check HangingDataSources
                for (var key in dataSources) {
                  if (dataSources.hasOwnProperty(key)) {
                    var dataSourceId = key;
                    console.log("Datsource id = "+dataSourceId)
                  }
                }
                */
                var inlineHierarchyRead = false;
                if(reader._current && reader._current.nextSibling && reader._current.nextSibling.nodeName === "inlineHierarchy"){
                    if (columnView && columnView.dataCategory && (columnView.dataCategory === "DIMENSION"|| columnView.dataCategory === "DEFAULT")) {
                        while (reader.tryMoveTo("inlineHierarchy")) {
                            inlineHierarchyRead = true;
                            this.parseDimensionInlineHierarchy(reader, columnView);
                        }
                    }
                }
 
                this.parseLogicalModel(reader, columnView, outputViewType, outputViewName, dataSources, isStarJoin);
                reader.next();

                //Code For HangingDataSources - START
                for (var key in dataSources) {
                  if (dataSources.hasOwnProperty(key)) {
                    var dataSourceId = key;
                    //console.log("Datsource id = "+dataSourceId);
                    var inputDatasource = getInputforDatasource(dataSourceId, columnView);
                    if(inputDatasource === undefined || inputDatasource === null){
                        var viewNodeAttributes = {
                            name: dataSourceId,
                            type: "Projection",
                            isDataSource: true
                        };
                        var dataSourceNode = columnView.createOrMergeViewNode(viewNodeAttributes);
                        var input = dataSourceNode.createInput();
                        input.setSource(getSourceForInput(dataSourceId, dataSources, dataSourceNode));
                    }
                  }
                }
                //Code For HangingDataSources - END

                /*
                //Old Layout Code - Start
                if (reader.moveToIntermediate("layout").tryMoveDown()) {
                    if (reader.moveToIntermediate("shapes").tryMoveDown()) {
                        while (this.parseShape(reader, columnView)) {
                            reader.next();
                        }
                        reader.moveUp();
                    }
                    reader.next();
                    reader.moveUp();
                }
                reader.next();
                //Old Layout Code - End
                */
               
                //New Layout Code - Start
                if (reader.tryMoveToIntermediate("layout")) {
                    if(reader.tryMoveDown()){
                        if (reader.tryMoveToIntermediate("shapes")) {
                            if(reader.tryMoveDown()){
                                while (this.parseShape(reader, columnView)) {
                                reader.next();
                                }
                                reader.moveUp();
                            }
                        }
                        reader.next();
                        reader.moveUp();
                    }
                    reader.next();
                }
                //New Layout Code - End
               
                if(inlineHierarchyRead === false && reader._current && reader._current.nextSibling && reader._current.nextSibling.nodeName === "inlineHierarchy"){
                    
                	throwUnsupportedOperationException("Hierarchy");
                	
                	while (reader.tryMoveTo("inlineHierarchy")) {
                        inlineHierarchyRead = true;
                        this.parseDimensionInlineHierarchy(reader, columnView);
                    }
                }
                reader.moveUp();
                this.doLoadPostProcessing(reader, columnView);
                //New Way of Load Post Processing
                this.excecuteLoadPostProcessingCallBackQueue(reader, columnView);
               
                //Test Code - Delete it later - start
                /*var testElement = getElementFromColumnView(columnView, "YEAR");
                if(testElement){
                    var referancesTo = modelbase.ReferenceManager.getReferencesTo(testElement, true);
                }  */ 
                //Test Code - Delete it later - End
               
                return reader.documentProperties;
            },
           
            //Code to upfront creating default node Element Instance to avoid post processing - START
            _getDefaultNodeElementInstanceByElementName: function(columnView, elementName, addIfNotPresent) {
                var requiredElementInstance;
                var elementInstanceFound = false;
               
                var defaultNodeElementInstancesArray = columnView._defaultNodeElementInstancesArray;
                if(defaultNodeElementInstancesArray){
                    for (var index = 0; index < defaultNodeElementInstancesArray.length; index++) {
                        var elementInstance = defaultNodeElementInstancesArray[index];
                        if (elementInstance && elementInstance.name === elementName) {
                            elementInstanceFound = true;
                            return elementInstance;
                        }
                    }   
                }else{
                    columnView._defaultNodeElementInstancesArray = [];
                }
               
                if (!elementInstanceFound && addIfNotPresent) {
                    requiredElementInstance = this._createDefaultNodeElementInstanceByElementName(defaultNodeElementInstancesArray, elementName);
                    return requiredElementInstance;
                }
            },   
            
            _createDefaultNodeElementInstanceByElementName: function(defaultNodeElementInstancesArray, elementName) {
                if(elementName && defaultNodeElementInstancesArray){
                    var elementInstance = new vModel.Element({
                    name: elementName,
                    isProxy : true
                    });
                    defaultNodeElementInstancesArray.push(elementInstance);
                    return elementInstance;   
                }
            },  
            
            _setSkippedNodes: function(object, skippedNodes){
                if (Array.isArray(skippedNodes)) {
                for (var i = 0; i < skippedNodes.length; i++) {
                    object.$addSkippedNodes(skippedNodes[i]);
                }
                } else {
                    object.$addSkippedNodes(skippedNodes);
                }   
            },
           
            _checkProxyElementsInDefaultNode: function(defaultViewNode){
                var columnView = defaultViewNode.$getContainer();
                                var defaultNodeElementInstancesArray = columnView._defaultNodeElementInstancesArray;
                                if(defaultNodeElementInstancesArray){
                    for (var index = 0; index < defaultNodeElementInstancesArray.length; index++) {
                        var elementInstance = defaultNodeElementInstancesArray[index];
                        if (elementInstance && elementInstance.isProxy === true) {
                            return elementInstance;
                        }
                    }   
                }
                },            
                //Code to upfront creating default node Element Instance to avoid post processing - END
				
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
 
            parseDataSource: function(reader, dataSources) {
                var dataSource;
                if (reader.tryMoveTo("DataSource")) {
                    dataSource = {};   
                    var dataSourceAttributes = reader.buildAttributes({
                        id: "{id}",
                        type: "{type}"
                    });
                    var dataSourceSkippedNodes = reader.skippedNodes;                                   
 
                    reader.moveDown();
 
                    if (reader.tryMoveToIntermediate("resourceUri")) {
                        dataSource.resourceUri = reader.getContent();                                                                                       
                    }
 
                    dataSource.skippedNodes = dataSourceSkippedNodes;
                    dataSource.type = dataSourceAttributes.type;
                    dataSource.id = dataSourceAttributes.id;
                    dataSources[dataSourceAttributes.id] = dataSource;     

					// DataSource aliased will be used to set input alias
                    //if (dataSourceAttributes.id !== dataSource.resourceUri) {
                    if (dataSourceAttributes.id !== dataSource.resourceUri && dataSourceAttributes.id.indexOf('$') === -1) {	
                        dataSource.alias = dataSourceAttributes.id;
                    }
 
                    //Map EntityType for design time objects
                    if(RepositoryXmlParserHelper.isItDesigntimeRepositoryObject(dataSource.type)){
                        dataSource.type = RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(dataSource.type);
                    }
                    reader.skipChildren().next();
                    reader.moveUp();
                }
                return dataSource;
            },
           
            processParameterTypeOfElement: function(reader, result, columnView){
                var attributeValueAttributes = reader.buildAttributes({
                    name: "{name}",
                    resourceUri: "{resourceUri}"
                });
                var hierarchyName;
                if (reader.tryMoveToIntermediate("hierarchyName")) {
                    hierarchyName = reader.consumeContent();
                }
                if(attributeValueAttributes.name && attributeValueAttributes.resourceUri === undefined){
                    var populateParamterTypeOfElement = function(){
                        result.typeOfElement = getElementFromColumnView(columnView, attributeValueAttributes.name);
                        result.hierarchy = getHierarchyFromColumnView(columnView, hierarchyName);
                    };
                    this.pushToLoadPostProcessingCallBackQueue(reader, populateParamterTypeOfElement);
                }else if(attributeValueAttributes.name && attributeValueAttributes.resourceUri){
                    var fqName = FullQualifiedName.createByResourceURI(attributeValueAttributes.resourceUri);
                    var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                    result.typeOfElement =  getElementFromsharedEntity(sharedEntity, attributeValueAttributes.name);
                    if(hierarchyName){
                        result.hierarchy = getHierarchyFromEntity(columnView, fqName, hierarchyName);
                    }
                }
            },
           
            processTypedObjectExternalTypeOfElement: function(reader, columnView, result, isParameter){
                if (reader.tryMoveToIntermediate("externalLikeStructureName")) {
                	
                	throwUnsupportedOperationException("Value Help View");
                	
                    var externalLikeStructureName = reader.consumeContent();
                    if (externalLikeStructureName) {
                        var fqNameForExternalLikeStructureName = FullQualifiedName.createByFqName(externalLikeStructureName);
						//HDI Migration Code                        
                        var externalEntityId = externalLikeStructureName;
                        
                    }
                    var externalLikeStructureType;
                    if (reader.tryMoveToIntermediate("externalLikeStructureType")) {
                        externalLikeStructureType = reader.consumeContent();
                    }
                   
                    if(RepositoryXmlParserHelper.isItDesigntimeRepositoryObject(externalLikeStructureType)){
                        externalLikeStructureType = RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(externalLikeStructureType);
                    }else{
                        // If It is not Designtime RepositoryObject; it means it is a table; we do not support DATABASE_VIEW as externalLikeStructureType
                        externalLikeStructureType = "DATA_BASE_TABLE";
                    }   
                }
                if (reader.tryMoveToIntermediate("externalLikeElementName")) {
                    var externalLikeElementName = reader.getContent();
                    // var element = getElementFromEntity(columnView, fqNameForExternalLikeStructureName, externalLikeElementName, externalLikeStructureType);
                    var element;
                    if(fqNameForExternalLikeStructureName && externalLikeStructureType){
						//XS1 Code
                        //element = getElementFromEntity(columnView, fqNameForExternalLikeStructureName, externalLikeElementName, externalLikeStructureType);
						//HDI Migration Code
						element = getElementFromEntity(columnView, externalEntityId, externalLikeElementName, externalLikeStructureType);                        
                        if (element) {
                            result.externalTypeOfElement = element;
                            result.externalTypeOfEntity = element.$getContainer();
                        }
                        if(isParameter === false){
                            reader.next();
                        }   
                    }else if(fqNameForExternalLikeStructureName === undefined && externalLikeStructureType === undefined && isParameter === false){
                        var populateElementTypeOfElement = function(){
                            element = getElementFromColumnView(columnView, externalLikeElementName);
                            if (element) {
                                result.typeOfElement = element;
                            }
                        };
                        this.pushToLoadPostProcessingCallBackQueue(reader, populateElementTypeOfElement);
                        reader.next();
                    }
                }else{
                    // It means only entity could have been set from web ide editor - special case
                    if(fqNameForExternalLikeStructureName && externalLikeStructureType){
					    //HDI Migration Code
                        result.externalTypeOfEntity = getEntity(columnView, externalEntityId, externalLikeStructureType);
						//XS1 Code
                        //result.externalTypeOfEntity = getEntity(columnView, fqNameForExternalLikeStructureName, externalLikeStructureType);
                    }
                }
            },
           
            processTypedObjectExternalTypeOfElementParameterMapping: function(reader, result){
                var tempVariableMappings;
                var variableMappings = [];
                do {
                    tempVariableMappings = this.parseVariableMapping(reader);
                    if (tempVariableMappings) {
                        variableMappings.push(tempVariableMappings);
                        reader.next();
                    }
                } while (tempVariableMappings);
                // return variableMappings;
                if (variableMappings && variableMappings.length > 0) {
                    for (var i = 0; i < variableMappings.length; i++) {
                        this.postProcessVariableMappings(reader, variableMappings[i], result);
                    }
                }
            },
           
            processParameterBasedOnColumn:  function(reader, result, columnView){
                if (reader.tryMoveDown()) {
                    if (reader.tryMoveTo("attribute")) {
                        this.processParameterTypeOfElement(reader, result, columnView);
                    }
                    this.processTypedObjectExternalTypeOfElement(reader, columnView, result, true);
                    this.processTypedObjectExternalTypeOfElementParameterMapping(reader, result);
                    reader.moveUp();
                }
            },   
            
            processParameterBasedOnStaticList:  function(reader, simpleType) {
                while (reader.tryMoveTo("listEntry")) {
                    var valueRangeAttributes = reader.buildAttributes({
                        value: "{id}"
                    });
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, valueRangeAttributes, true);
                    var valueRange = simpleType.createValueRange(valueRangeAttributes, reader.skippedNodes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(valueRange, valueRangeAttributes);
                    reader.next();
                }
            },  
            
            //TODO: Curently this method is not used; Need to use it in processDerivedParameter() method
            processDerivedParameterBasedOnTable:  function(reader, result, columnView, derivationRule) {
                result.parameterType = vModel.ParameterType.DERIVED_FROM_TABLE;
                var resultColumnSkippedNodes = reader.skippedNodes;
                var resultColumnFqName = FullQualifiedName.createForCatalogObject(reader.consumeAttribute("schemaName"), reader.consumeAttribute("columnObjectName"));
                /*
                var resultColumnSchemaName = reader.consumeAttribute("schemaName");
                var resultColumnTableName = reader.consumeAttribute("columnObjectName");
                var resultColumnEntityId;
                */
                var resultColumnElement = getElementFromEntity(columnView, resultColumnFqName, reader.consumeAttribute("columnName"));
                //HDI Migration Code
                //var resultColumnEntityId = ;
                //var resultColumnElement = getElementFromEntity(columnView, resultColumnFqName, reader.consumeAttribute("columnName"));
                resultColumnElement.$getContainer().type = "DATA_BASE_TABLE";
                derivationRule = result.createDerivationRule({
                    resultElementName: resultColumnElement.name
                }, resultColumnSkippedNodes);
                derivationRule.lookupEntity = resultColumnElement.$getContainer();
                while (this.parseElementFilter(reader, derivationRule)) {
                    reader.next();
                }    
            },  
            
            processDerivedParameter:  function(reader, result, columnView) {
                result.parameterType = vModel.ParameterType.DERIVED_FROM_TABLE;
                var inputEnabled = reader.consumeAttribute("inputEnabled");
                inputEnabled = RepositoryXmlParserHelper.getBooleanFromString(inputEnabled);
                if (reader.tryMoveDown()) {
                     // Either resultColumn or procedureName/scalarFunctionName will be there inside derivationRule tag
                    var procedureBasedOnScriptObject = false;
                    var entityType;
                    var fqNameOfScriptObject;
                    var derivationRule;
                    var procedureNameOrScalarFunctionNameFound = false;
                    if (reader.tryMoveToIntermediate("resultColumn")) {
                        result.parameterType = vModel.ParameterType.DERIVED_FROM_TABLE;
                        var resultColumnSkippedNodes = reader.skippedNodes;
                        var resultColumnFqName = FullQualifiedName.createForCatalogObject(reader.consumeAttribute("schemaName"), reader.consumeAttribute("columnObjectName"));
                        var resultColumnElement = getElementFromEntity(columnView, resultColumnFqName, reader.consumeAttribute("columnName"));
                        resultColumnElement.$getContainer().type = "DATA_BASE_TABLE";
                        derivationRule = result.createDerivationRule({
                            resultElementName: resultColumnElement.name
                        }, resultColumnSkippedNodes);
                        derivationRule.lookupEntity = resultColumnElement.$getContainer();
                        derivationRule.inputEnabled = inputEnabled;
                        while (this.parseElementFilter(reader, derivationRule)) {
                            reader.next();
                       }
                        // this.processDerivedParameterBasedOnTable(reader, result, columnView, derivationRule);
                    }else if (reader.tryMoveToIntermediate("procedureName")) {
                        procedureNameOrScalarFunctionNameFound = true;
                        fqNameOfScriptObject = reader.consumeContent();
                        procedureBasedOnScriptObject = true;
                        entityType = this.decideProcedureEntityType(fqNameOfScriptObject);
                    }else if (reader.tryMoveToIntermediate("scalarFunctionName")) {
                        procedureNameOrScalarFunctionNameFound = true;
                        fqNameOfScriptObject = reader.consumeContent();
                        procedureBasedOnScriptObject = true;
                        entityType = vModel.EntityType.SCALAR_FUNCTION;
                    }
                    if(procedureBasedOnScriptObject && fqNameOfScriptObject){
                        result.parameterType = vModel.ParameterType.DERIVED_FROM_PROCEDURE;
                        var procedureFQName = FullQualifiedName.createByFqName(fqNameOfScriptObject);
                       
                        //Test code - Start
                        var procedureFQNameTest = FullQualifiedNameTest.createByFqName(fqNameOfScriptObject);
                        var procedureFQNameTestNew = FullQualifiedName.createByFqName(fqNameOfScriptObject);
                        //Test code - End
						
						//XS1 Code
                        var scriptEntity =  getEntity(columnView, procedureFQName, entityType);
						
						//HDI Migration Code - START
                        var procedureId = fqNameOfScriptObject;
                        var scriptEntity =  getEntity(columnView, procedureId, entityType);
                        //HDI Migration Code - END
						
                        derivationRule = result.createDerivationRule({});
                        derivationRule.scriptObject = scriptEntity;
                        // derivationRule ParameterMapping Processing
                        this.processProcedureParameterMapping(reader, derivationRule);
                        derivationRule.inputEnabled = inputEnabled;
                    }
                    if(procedureNameOrScalarFunctionNameFound && derivationRule === undefined){
                        result.parameterType = vModel.ParameterType.DERIVED_FROM_PROCEDURE;
                        derivationRule = result.createDerivationRule({});
                        derivationRule.inputEnabled = inputEnabled;
                    }else if(procedureNameOrScalarFunctionNameFound === false && derivationRule === undefined){
                        result.parameterType = vModel.ParameterType.DERIVED_FROM_TABLE;
                        derivationRule = result.createDerivationRule({});
                    }
                    reader.moveUp(); // From derivationRule
                }else{
                    result.parameterType = vModel.ParameterType.DERIVED_FROM_TABLE;
                    derivationRule = result.createDerivationRule({});
                }   
            },   
            
            processParameterDefaultRanges:  function(reader, result, defaultExpressionLanguage) {
                while(reader.tryMoveTo("defaultRange")){
                    var fixedAttributes = reader.buildAttributes({
                        lowValue: "{lowValue}",
                        highValue: "{highValue}",
                        lowExpression: "{lowExpression}",
                        highExpression: "{highExpression}",
                        operator: "{operator}",
                        including: "{including}"
                    });
                    fixedAttributes.lowExpression = RepositoryXmlParserHelper.getBooleanFromString(fixedAttributes.lowExpression);
                    fixedAttributes.highExpression = RepositoryXmlParserHelper.getBooleanFromString(fixedAttributes.highExpression);
                    fixedAttributes.including = RepositoryXmlParserHelper.getBooleanFromString(fixedAttributes.including);
                    if(defaultExpressionLanguage){
                    	fixedAttributes.expressionLanguage = defaultExpressionLanguage;
                    }	
                    
                    var defaultRangeSkippedNodes = reader.skippedNodes;
                    
                    result.createDefaultRange(fixedAttributes, defaultRangeSkippedNodes);
                    reader.next();
                }
            },   
 
            parseVariable: function(reader, columnView) {
                var result = null;
                if (reader.tryMoveTo("variable")) {
                    var isParameter = reader.consumeAttribute("parameter") === "true";
                    
                    if(!isParameter){
                    	throwUnsupportedOperationException("Variable");
                    }
                    
                    var parameterAttributes = reader.buildAttributes({
                        name: "{id}"
                    });
                    // Creating paramter as soon as read its name
                    result = columnView.createOrMergeParameter(parameterAttributes);
                    var parameterSkippedNodes = reader.skippedNodes;
                    if (reader.tryMoveDown()) { // tryMoveDown1
                        //Parse Description
                        sharedmodel.parseDescriptions(reader, parameterAttributes);
                        RepositoryXmlParserHelper.createEndUserTextsIfRequired(result, parameterAttributes);
                        reader.moveTo("variableProperties");
                        var mandatory = reader.consumeAttribute("mandatory");
                        if (mandatory) {
                            parameterAttributes.mandatory = Util.parseBool(mandatory);
                        }
                        var defaultValue = reader.consumeAttribute("defaultValue");
                        
                        var defaultExpressionLanguage = reader.consumeAttribute("defaultExpressionLanguage");
                        
                        var simpleTypeAttributes = reader.buildAttributes({
                            primitiveType: "{datatype}",
                            length: Util.createIntSelector("length"),
                            scale: Util.createIntSelector("scale")
                        });
                        simpleTypeAttributes.name = simpleTypeAttributes.primitiveType;
                        var simpleTypeSkippedNodes = reader.skippedNodes;
                        if (reader.tryMoveDown()) {
                            reader.moveToIntermediate("valueDomain");
                            var valueDomainType = reader.consumeAttribute("type");
                            reader.buildAttributes();
                            // var externalTypeOfElement_temp = null;
                            // var variableMappings = [];
                            switch (valueDomainType) {
                                case "empty":
                                    reader.skipChildren();
                                    break;
                                case vModel.ValueType.CURRENCY_CODE:
                                    parameterAttributes.parameterType = vModel.ParameterType.DIRECT;
                                    simpleTypeAttributes.semanticType = vModel.SemanticType.CURRENCY_CODE;
                                    reader.skipChildren();
                                    break;
                                case vModel.ValueType.UNIT_OF_MEASURE:
                                    parameterAttributes.parameterType = vModel.ParameterType.DIRECT;
                                    simpleTypeAttributes.semanticType = vModel.SemanticType.UNIT_OF_MEASURE;
                                    reader.skipChildren();
                                    break;
                                case vModel.ValueType.DATE:
                                    parameterAttributes.parameterType = vModel.ParameterType.DIRECT;
                                    simpleTypeAttributes.semanticType = vModel.SemanticType.DATE;
                                    reader.skipChildren();
                                    break;
                                case vModel.ValueType.ATTRIBUTE_VALUE:
                                    parameterAttributes.parameterType = vModel.ParameterType.COLUMN;
                                    simpleTypeAttributes.semanticType = "AttributeValue";
                                    this.processParameterBasedOnColumn(reader, result, columnView);
                                    break;
                                case vModel.ValueType.STATIC_LIST:
                                    simpleTypeAttributes.semanticType = "StaticList";
                                    parameterAttributes.parameterType = vModel.ParameterType.STATIC_LIST;
                                    break;
                                default:
                                    simpleTypeAttributes.semanticType = valueDomainType;
                                    reader.skipChildren();
                            }
                           
                            result = columnView.createOrMergeParameter(parameterAttributes, parameterSkippedNodes);
                           
                            if (defaultValue !== null && defaultValue !== undefined) {
                                var fixedDefaultValueAttributes = {
                                    lowValue: defaultValue,
                                    operator: "EQ",
                                    including: "true"
                                };
                                fixedDefaultValueAttributes.including = RepositoryXmlParserHelper.getBooleanFromString(fixedDefaultValueAttributes.including);
                            }
                            var simpleType = result.createOrMergeSimpleType(simpleTypeAttributes, simpleTypeSkippedNodes);
 
                            if (valueDomainType === "StaticList") {
                                if(reader.tryMoveDown()){
                                    this.processParameterBasedOnStaticList(reader, simpleType);
                                    reader.moveUp();
                                }
                            }
                            reader.next();
 
                            // selection
                            if (reader.tryMoveToIntermediate("selection")) {
                                result.multipleSelections = Util.parseBool(reader.getAttribute("multiLine"));
                                result.selectionType = reader.getAttribute("type");
                                reader.next();
                            }
                            if(fixedDefaultValueAttributes){
                                if(result.selectionType === vModel.SelectionType.INTERVAL || result.selectionType === vModel.SelectionType.RANGE){
                                    fixedDefaultValueAttributes.highValue = undefined;
                                    result.specialDefaultValueHandling = true;
                                }                        
                                result.createDefaultRange(fixedDefaultValueAttributes);
                            }
                            // defaultExpression
                            if (reader.tryMoveToIntermediate("defaultExpression")) {
                                if (reader.tryMoveDown()) {
                                    var fixedDefaultValueAttributes = {
                                        //lowValue: reader.getContent(),
                                        lowValue: reader.consumeContent(),
                                        operator: "EQ",
                                        lowExpression: "true",
                                        expressionLanguage: defaultExpressionLanguage
                                    };
                                fixedDefaultValueAttributes.lowExpression = RepositoryXmlParserHelper.getBooleanFromString(fixedDefaultValueAttributes.lowExpression);
                                result.createDefaultRange(fixedDefaultValueAttributes);
                                reader.moveUp(); // From default Expression
                                result.specialDefaultValueHandling = true;
                                }
                            }
 
                            // derivationRule
                            if (reader.tryMoveToIntermediate("derivationRule")) {
                            	
                            	throwUnsupportedOperationException("Spatial Join");
                            	
                                this.processDerivedParameter(reader, result, columnView);
                            }
                            // defaultRange
                            this.processParameterDefaultRanges(reader, result, defaultExpressionLanguage);
                            reader.moveUp(); // From VariableProperties
                            reader.next(); // from <variableProperties>
                        }
                        reader.moveUp(); // tryMoveDown1
                    }
                    if (isParameter) {
                        result.isVariable = false;
 
                    } else {
                        result.isVariable = true;
                    }
                }
                return result;
            },
           
            decideProcedureEntityType: function(fqNameOfScriptObject){
                var entityType;
                if(fqNameOfScriptObject && fqNameOfScriptObject.indexOf('"') > -1){
                    entityType = vModel.EntityType.CATALOG_PROCEDURE;
                }else if(fqNameOfScriptObject && fqNameOfScriptObject.indexOf('::') > -1){
                    entityType = vModel.EntityType.PROCEDURE;
                }
                return entityType;
            },
           
            processProcedureParameterMapping: function(reader, derivationRule){
                var tempVariableMappings;
                var variableMappings = [];
                do {
                                tempVariableMappings = this.parseVariableMapping(reader);
                                if (tempVariableMappings) {
                                                variableMappings.push(tempVariableMappings);
                                                reader.next();
                                }
                } while (tempVariableMappings);
               
                //ParameterMapping PostProcessing
                if (variableMappings && variableMappings.length > 0) {
                                for (var i = 0; i < variableMappings.length; i++) {
                                                this.postProcessVariableMappings(reader, variableMappings[i], derivationRule);
                                }
                }  
            },
 
            parseVariableMappings: function(reader, columnView) {
                var variableMappings = this.parseVariableMapping(reader, "mapping");
                if (variableMappings) {
                    this.postProcessVariableMappings(reader, variableMappings, null, columnView);
                }
                return variableMappings;
            },
 
            parseVariableMapping: function(reader, variableMappingTagName) {
                if (!variableMappingTagName) {
                    variableMappingTagName = "variableMapping";
                }
                if (reader.tryMoveTo(variableMappingTagName)) {
                    var parsingMapper = function(value) {
                        return reader.removePrefix(sharedmodel.NameSpace.ACCESSCONTROL, value);
                    };
                   var variableMappingData = reader.buildAttributes({
                        type: Util.createXsiSelector("type", parsingMapper),
                        value: "{value}",
                        dataSource: "{dataSource}",
                        forStarJoin: "{forStarJoin}"
                    });
                    if (reader.tryMoveDown()) {
                        if (reader.tryMoveTo("targetVariable")) {
                            variableMappingData.parameterNameOtherView = reader.getAttribute("name");
                            variableMappingData.resourceUri = reader.getAttribute("resourceUri");
                            if (reader.tryMoveToIntermediate("localVariable")) {
                                var localVariable = reader.consumeContent();
                                //TODO: Pass columnView to removeHashFromString
                                localVariable = removeHashFromString(localVariable);
                                variableMappingData.parameterName = localVariable;
                            }
                        }
                        reader.moveUp();
                    }
                    return variableMappingData;
                }
                return undefined;
            },
 
            postProcessVariableMappings: function(reader, variableMappingData, parent, columnView) {
                variableMappingData.parent = parent;
                if(variableMappingData.forStarJoin){
                    var callbackMethod = function(){
                        var input = getSharedInputforDatasource(removeHashFromString(variableMappingData.resourceUri, columnView), columnView);
                        if (input) {
                            var parameterMapping = input.createParameterMapping({
                                parameterNameOtherView: variableMappingData.parameterNameOtherView,
                                value: variableMappingData.value
                            });
                            if (variableMappingData.parameterName) {
                                parameterMapping.parameter = getParameterFromColumnView(columnView, variableMappingData.parameterName);
                            }
                            if (variableMappingData.type) {
                                if (endsWith(variableMappingData.type, vModel.ParameterMappingType.CONSTANT)) {
                                    parameterMapping.type = vModel.ParameterMappingType.CONSTANT;
                                } else if (endsWith(variableMappingData.type, vModel.ParameterMappingType.PARAMETER_MAPPING)) {
                                    parameterMapping.type = vModel.ParameterMappingType.PARAMETER_MAPPING;
                                }
                            }
                        }
                    };   
                    this.pushToLoadPostProcessingCallBackQueue(reader, callbackMethod);
                   
                }else{
                    this.registerForLoadPostProcessing(reader, variableMappingData, function(columnView, data) {
                        if (variableMappingData.dataSource) {   
                            var input = getInputforDatasource(removeHashFromString(variableMappingData.dataSource , columnView), columnView);
                            if (input) {
                               data.parent = input;
                            }
                        }
                        if (data.parent) {
                            var parameterMapping = data.parent.createParameterMapping({
                                parameterNameOtherView: data.parameterNameOtherView,
                                value: data.value
                            });
                            // resourceUri will not be there for Paramter's ParameterMapping; it will only be there for DataSource's ParameterMapping;
                            //For Paramter's ParameterMapping we have to get Entity from Paramter's typeOfElement/ExternalTypeOfElement
                            var fQNameForOtherParameterEntity;
                            if(data.resourceUri){
                                // fQNameForOtherParameterEntity = FullQualifiedName.createByResourceURI(data.resourceUri);
                                fQNameForOtherParameterEntity = data.parent._source;
                            }else{
                                if(data.parent.typeOfElement){
                                    fQNameForOtherParameterEntity = data.parent.typeOfElement.$getContainer();
                                }else if(data.parent.externalTypeOfElement){
                                    fQNameForOtherParameterEntity = data.parent.externalTypeOfElement.$getContainer();
                                }   
                            }   
                            if (fQNameForOtherParameterEntity !== undefined && fQNameForOtherParameterEntity !== null) {
                                var entityType = fQNameForOtherParameterEntity.type;
                                var parameterOtherView = getParameterFromEntity(columnView, fQNameForOtherParameterEntity, data.parameterNameOtherView, entityType);
                                if (parameterOtherView) {
                                    parameterMapping.parameterOtherView = parameterOtherView;
                                    // parameterMapping.parameterNameOtherView = parameterOtherView;
                                }
                            }
                            if (data.type) {
                                if (endsWith(data.type, vModel.ParameterMappingType.CONSTANT)) {
                                    parameterMapping.type = vModel.ParameterMappingType.CONSTANT;
                                } else if (endsWith(data.type, vModel.ParameterMappingType.PARAMETER_MAPPING)) {
                                    parameterMapping.type = vModel.ParameterMappingType.PARAMETER_MAPPING;
                                }
                            }
                            if (data.parameterName) {
                                parameterMapping.parameter = getParameterFromColumnView(columnView, data.parameterName);
                            }
                        }
                    });   
                }
            },
 
            parseElementFilter: function(reader, parent, attributes, moveDown) {
                if (!attributes) {attributes = {};}
                if (moveDown) {reader.moveDown();}
                var elementFilter = null;
                if (reader.tryMoveTo("columnFilter")) {
                    attributes.elementName = reader.getAttribute("columnName");
                    elementFilter = parent.createElementFilter(attributes);
                    if (reader.tryMoveDown()) {
                        while (reader.tryMoveTo("valueFilter")) {
                            elementFilter.valueFilters.add(sharedmodel.parseValueFilter(reader));
                            reader.next();
                        }
                        reader.moveUp();
                    }
                    return elementFilter;
                } else {
                    return null;
                }
                if (moveDown) {reader.moveUp();}
                return elementFilter;
            },
 
            parseOrigin: function(reader, attributes, moveDown) {
                if (!attributes) {attributes = {};}
                if (moveDown) {reader.moveDown();}
                if (reader.tryMoveToIntermediate("origin")) {
                    //set flag to know that there is origin tag in xml
                    attributes.isOriginTagPresent = true;
                    reader.buildAttributes({
                        system: "{system}"
                        // entityName: "{entityName}",
                        // entityType: "{entityType}"
                    }, attributes);
                    reader.skipChildren();
                    reader.next();
                }
                if (moveDown) {reader.moveUp();}
                return attributes;
            },
            
            parseDimensionInlineHierarchy: function(reader, columnView){
            	
            	throwUnsupportedOperationException("Hiearchy");
            	
                var HierachyType = function(value) {
                            return reader.removePrefix(sharedmodel.NameSpace.DIMENSION, value);
                        };
                        var parsingHierachyType = reader.buildAttributes({
                            type: Util.createXsiSelector("type", HierachyType)
                       });
                        if (parsingHierachyType.type && parsingHierachyType.type === "LeveledHierarchy") {
                            this.parseLevelHiearchy(reader, columnView, parsingHierachyType.type);
                        } else if (parsingHierachyType.type === "ParentChildHierarchy") {
                            this.parseParentChildHiearchy(reader, columnView, parsingHierachyType.type);
                        }
                        reader.next(); 
            },
            
            parseParentChildHiearchy: function(reader, columnView, parsingHierachyType) {
            	
            	throwUnsupportedOperationException("Hiearchy");
            	
                var hiearchyAttributes = reader.buildAttributes({
                    name: "{id}",
                    type: parsingHierachyType,
                    aggregateAllNodes: "{aggregateAllNodes}",
                    defaultMember: "{defaultMember}",
                    multipleParents: "{multipleParents}",
                    orphanedNodesHandling: "{orphanedNodesHandling}",
                    withRootNode: "{withRootNode}",
                    rootNodeVisibility: "{rootNodeVisibility}",
                    nodeStyle: "{nodeStyle}",
                    stepParentNodeID: "{stepParentNodeID}",
                    timeDependent: "{timeDependent}"
                });
                hiearchyAttributes.multipleParents = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.multipleParents);
                hiearchyAttributes.withRootNode = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.withRootNode);
                hiearchyAttributes.aggregateAllNodes = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.aggregateAllNodes);
                hiearchyAttributes.timeDependent = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.timeDependent);
                if (hiearchyAttributes.withRootNode && hiearchyAttributes.rootNodeVisibility) {
                    delete hiearchyAttributes.withRootNode;
                }
                if(hiearchyAttributes.rootNodeVisibility === undefined){
                    if (hiearchyAttributes.withRootNode !== undefined){
                        if(hiearchyAttributes.withRootNode){
                            hiearchyAttributes.rootNodeVisibility = "ADD_ROOT_NODE";
                        }else{
                           hiearchyAttributes.rootNodeVisibility = "DO_NOT_ADD_ROOT_NODE";
                        }
                    }else{
                        hiearchyAttributes.rootNodeVisibility = "ADD_ROOT_NODE_IF_DEFINED";
                    }
                }
                var hiearchySkippedNodes = reader.skippedNodes;
                if (reader.tryMoveDown()) {
                    sharedmodel.parseDescriptions(reader, hiearchyAttributes);
                    var inLineHiearchy = columnView.createInlineHierarchy(hiearchyAttributes, hiearchySkippedNodes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(inLineHiearchy, hiearchyAttributes);
                   
                    //ThrowUnsupportedOperationException for Calc Integration of Hierarchies
                    /*if(reader._current && reader._current.nextSibling && reader._current.nextSibling.nodeName === "joinProperties"){
                                throwUnsupportedOperationException("Calc Integration of Hierarchies");
                   }*/
 
                    while (reader.tryMoveTo("attributeParentPair")) {
                        var parentAttributes = reader.buildAttributes({
                            element: "{attribute}",
                            parent: "{parentAttribute}",
                            stepParentNodeID: "{stepParentNodeID}"
                        });
                        var parentSkippedNodes = reader.skippedNodes;
                        if (columnView.dataCategory === "CUBE") {
                            parentAttributes.element = getElementFromColumnView(columnView, removeHashFromString(parentAttributes.element , columnView));
                            parentAttributes.parent = getElementFromColumnView(columnView, removeHashFromString(parentAttributes.parent , columnView));
                        }else{
                            parentAttributes.element = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(parentAttributes.element , columnView), true);
                            parentAttributes.parent = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(parentAttributes.parent , columnView), true);
                        }
 
                        var parentNode = inLineHiearchy.createParentDefinition(parentAttributes, parentSkippedNodes);
                        if(reader.tryMoveDown()){
                            var udf = RepositoryXmlParserHelper.parseUDFParameter(reader, "rootNode");
                            udf = processUDFParameter(columnView, udf, udf);
                            var rootNodeSkippedNodes = reader.skippedNodes;
                            parentNode.createRootNode(udf, rootNodeSkippedNodes);
                            reader.moveUp();
                        }
                        reader.next();
                    }
                    while (reader.tryMoveTo("siblingOrder")) {
                        var siblingOrderAttibutes = reader.buildAttributes({
                            byElement: "{byAttribute}",
                            direction: "{direction}"
                        });
                        if (columnView.dataCategory === "CUBE") {
                            siblingOrderAttibutes.byElement = getElementFromColumnView(columnView, removeHashFromString(siblingOrderAttibutes.byElement , columnView));
                        }else{
                             siblingOrderAttibutes.byElement = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(siblingOrderAttibutes.byElement , columnView), true);
                        }
                        var siblingOrderSkippedNodes = reader.skippedNodes;
                        inLineHiearchy.createSiblingOrder(siblingOrderAttibutes, siblingOrderSkippedNodes);
                        reader.next();
                    }
                    if (reader.tryMoveToIntermediate("timeProperties")) {
                        if (reader.tryMoveDown()) {
                            var timeAttributes;
                            var timePropertiesSkippedNodes = reader.skippedNodes;
                            inLineHiearchy.timeDependent = true;
                            var timeNode = inLineHiearchy.createTimeProperties(timeAttributes, timePropertiesSkippedNodes);
                            if (reader.tryMoveTo("validFromElement")) {
                                if (columnView.dataCategory === "CUBE") {
                                    timeNode.validFromElement = getElementFromColumnView(columnView, removeHashFromString(reader.getContent() , columnView));
                                }else{
                                    timeNode.validFromElement = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(reader.getContent() , columnView), true);
                                }
                            }
                            if (reader.tryMoveTo("validToElement")) {
                                if (columnView.dataCategory === "CUBE") {
                                    timeNode.validToElement = getElementFromColumnView(columnView, removeHashFromString(reader.getContent(), columnView));
                                }else{
                                    timeNode.validToElement = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(reader.getContent(), columnView), true);
                                }
                            }
                            if (reader.tryMoveTo("fromVariable")) {
                                timeNode.fromParameter = getParameterFromColumnView(columnView, removeHashFromString(reader.getContent() , columnView));
                               
                            }
                            if (reader.tryMoveTo("toVariable")) {
                                timeNode.toParameter = getParameterFromColumnView(columnView, removeHashFromString(reader.getContent() , columnView));
                               
                            }
                            if (reader.tryMoveTo("pointInTimeVariable")) {
                                timeNode.pointInTimeParameter = getParameterFromColumnView(columnView, removeHashFromString(reader.getContent() , columnView));
                              
                            }
                            reader.moveUp();
                        }
                    }
                    while (reader.tryMoveTo("edgeAttribute")) {
                        var EdgeAttributes = {};
                        if (columnView.dataCategory === "CUBE") {
                            EdgeAttributes.element = getElementFromColumnView(columnView, removeHashFromString(reader.getAttribute("attribute") , columnView));
                        }else{
                            EdgeAttributes.element = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(reader.getAttribute("attribute") , columnView), true);
                        }
                        var EdgeSkippedNodes = reader.skippedNodes;
                        inLineHiearchy.createEdgeAttribute(EdgeAttributes, EdgeSkippedNodes);
                        reader.next();
                    }
                    reader.moveUp();
                }
            },
 
            parseLevelHiearchy: function(reader, columnView, parsingHierachyType) {
            	
            	throwUnsupportedOperationException("Hiearchy");
 
                var hiearchyAttributes = reader.buildAttributes({
                    name: "{id}",
                    type: parsingHierachyType,
                    aggregateAllNodes: "{aggregateAllNodes}",
                    defaultMember: "{defaultMember}",
                    multipleParents: "{multipleParents}",
                    orphanedNodesHandling: "{orphanedNodesHandling}",
                    withRootNode: "{withRootNode}",
                    rootNodeVisibility: "{rootNodeVisibility}",
                    nodeStyle: "{nodeStyle}",
                    stepParentNodeID: "{stepParentNodeID}",
                    timeDependent: "{timeDependent}"
                });
                hiearchyAttributes.multipleParents = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.multipleParents);
                hiearchyAttributes.withRootNode = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.withRootNode);
                hiearchyAttributes.aggregateAllNodes = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.aggregateAllNodes);
                hiearchyAttributes.timeDependent = RepositoryXmlParserHelper.getBooleanFromString(hiearchyAttributes.timeDependent);
                if (hiearchyAttributes.withRootNode && hiearchyAttributes.rootNodeVisibility) {
                    delete hiearchyAttributes.withRootNode;
                }
                if(hiearchyAttributes.rootNodeVisibility === undefined){
                    if (hiearchyAttributes.withRootNode !== undefined){
                        if(hiearchyAttributes.withRootNode){
                            hiearchyAttributes.rootNodeVisibility = "ADD_ROOT_NODE";
                        }else{
                           hiearchyAttributes.rootNodeVisibility = "DO_NOT_ADD_ROOT_NODE";
                        }
                    }else{
                        hiearchyAttributes.rootNodeVisibility = "ADD_ROOT_NODE";
                    }
                }
                var hiearchySkippedNodes = reader.skippedNodes;
                if (reader.tryMoveDown()) {
                    sharedmodel.parseDescriptions(reader, hiearchyAttributes);
                   
                    //  ThrowUnsupportedOperationException for Calc Integration of Hierarchies
                    /*if(reader._current && reader._current.nextSibling && reader._current.nextSibling.nodeName === "joinProperties"){
                                throwUnsupportedOperationException("Calc Integration of Hierarchies");
                    }*/
                   
                    var inLineHiearchy = columnView.createInlineHierarchy(hiearchyAttributes, hiearchySkippedNodes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(inLineHiearchy, hiearchyAttributes);
                    if (reader.tryMoveTo("levels")) {
                        if (reader.tryMoveDown()) {
                            while (reader.tryMoveTo("level")) {
                                var levelAttributes = reader.buildAttributes({
                                    element: "{levelAttribute}",
                                    orderElement: "{orderAttribute}",
                                    levelType: "{levelType}",
                                    sortDirection: "{sortDirection}"
                                });
                                if (columnView.dataCategory === "CUBE") {
                                    levelAttributes.element = getElementFromColumnView(columnView, removeHashFromString(levelAttributes.element , columnView));
                                    levelAttributes.orderElement = getElementFromColumnView(columnView, removeHashFromString(levelAttributes.orderElement , columnView));
                                }else{
                                    levelAttributes.element = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(levelAttributes.element , columnView), true);
                                    levelAttributes.orderElement = this._getDefaultNodeElementInstanceByElementName(columnView, removeHashFromString(levelAttributes.orderElement , columnView), true);
                                }
                                var levelSkippedNodes = reader.skippedNodes;
                                inLineHiearchy.createLevel(levelAttributes, levelSkippedNodes);
                                reader.next();
                            }
                            reader.moveUp();
                        }
                    }
                    reader.moveUp();
                }
            },
 
            parseCalculationView: function(reader, columnView, dataSources, nodeIDsInCalculationView) {
                var viewNode = null;
                if (reader.tryMoveTo("calculationView")) {
 
                    var mapType = function(value) {
                        var type = reader.removePrefix(sharedmodel.NameSpace.CALCULATION, value);
                        type = RepositoryXmlParserHelper.mapViewNodeType(type);
                        return type;
                    };
 
                    var viewNodeAttributes = reader.buildAttributes({
                        name: "{id}",
                        type: Util.createXsiSelector("type", mapType),
                        // Also reading JoinNode related attributes to handle skippnodes remembering attributeNames issue
                        joinType: "{joinType}",
                        cardinality: "{cardinality}",
                        languageColumn: "{languageColumn}",
                        dynamic: "{dynamic}",
                        optimizeJoinColumns: "{optimizeJoinColumns}",
                        workspace: "{workspace}",
                        action: "{action}"
                    });
                    var filterExpressionLanguage = reader.consumeAttribute("filterExpressionLanguage");
                    if (viewNodeAttributes.type === 'JoinNode') {
                        var joinAttributes = {};
                        RepositoryXmlParserHelper.populateJoinAttributesFromViewNodeAttributes(joinAttributes, viewNodeAttributes);
                    }
                   
                    reader.moveDown();
                    sharedmodel.parseDescriptions(reader, viewNodeAttributes);
                   
                    viewNode = columnView.createOrMergeViewNode(viewNodeAttributes, reader.skippedNodes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(viewNode, viewNodeAttributes);
                    
                    //Graph Node
                    if (viewNodeAttributes.type === 'Graph') {
                        RepositoryXmlParserHelper.processGraphView(reader, columnView, viewNode, viewNodeAttributes);
                        //reader.moveUp();
                        //return viewNode;
                    }
                    
                    // To store column level filters
                    // viewNode.elementFilters = [];
                   
                    if (reader.tryMoveToIntermediate("viewAttributes")) {
                        if (reader.tryMoveDown()) {
                            while (this.parseViewAttribute(reader, viewNode)) {
                            reader.next();
                            }
                            reader.moveUp();   
                        }   
                        /*while (this.parseViewAttribute(reader, viewNode)) {
                           reader.next();
                        }
                        reader.moveUp();*/
                    }
                    reader.next();
 
                    // Calling reader.tryMoveToIntermediate("calculatedViewAttributes"); Because it may happen there will be xml without this tag.
                    if (reader.tryMoveToIntermediate("calculatedViewAttributes")) {
                        if (reader.tryMoveDown()) {
                            while (this.parseCalculatedViewAttribute(reader, viewNode)) {
                                reader.next();
                            }
                            reader.moveUp();
                        }
                        reader.next();
                    }
                   
                    // convertElementFilterToFilerExpression
                    // RepositoryXmlParserHelper.convertElementFilterToFilerExpression(viewNode, filterExpressionLanguage);
 
                    //Reading localVariable in Script View to avoid it being part of SkippedNodes - Thomas
                    //Localvariable is rendered fresh Renderer everytime from view nodes parameter list, so should not be part of skippednodes
                    while (reader.tryMoveTo("localVariable")) {
                        reader.consumeContent();
                        reader.next();
                    }
 
                    while (this.parseInput(reader, viewNode, dataSources, nodeIDsInCalculationView)) {
                        reader.next();
                    }
 
                    //TODO: move processing of windowFunction to a new method
                    if (reader.tryMoveToIntermediate("windowFunction")) {
                    	
                    	throwUnsupportedOperationException("Rank Node");
                    	
                        this.parseWindowFunction(reader, viewNode, columnView);
                    }
 
                    if (reader.tryMoveToIntermediate("filter")) {
                        var filterExpression = reader.consumeContent();
                        viewNode.createFilterExpression({
                            "formula": filterExpression,
                            "expressionLanguage": filterExpressionLanguage
                        });
                        reader.next();
                    }
 
                    if (reader.tryMoveToIntermediate("definition")) {
                        viewNode.definition = reader.consumeContent();
                        reader.next();
                    }
 
                    if (viewNodeAttributes.type === 'JoinNode') {
                        RepositoryXmlParserHelper.processJoinView(reader, columnView, viewNode, joinAttributes);
                    }
 
                    //Test code - delete it later
                    /*if (viewNodeAttributes.type === 'UnionView') {
                       var type = viewNodeAttributes.type;
                    }*/
 
                    reader.moveUp();
                }
                return viewNode;
            },
 
            parseWindowFunction: function(reader, viewNode, columnView) {
                var windowFunction = viewNode.createWindowFunction({
                    dynamicPartitionElements: RepositoryXmlParserHelper.getBooleanFromString(reader.getAttribute("dynamicPartitionAttributes"))
                });
 
                var windowFunctionPostProcessValues = [];
                windowFunctionPostProcessValues.windowFunction = windowFunction;
                if (reader.tryMoveDown()) {
                    var partitionViewAttributes = [];
                    var orders = [];
                    windowFunctionPostProcessValues.partitionViewAttributes = partitionViewAttributes;
                    windowFunctionPostProcessValues.orders = orders;
 
                    while (reader.tryMoveTo("partitionViewAttributeName")) {
                        partitionViewAttributes[partitionViewAttributes.length] = reader.getContent();
                        reader.next();
                    }
 
                    while (reader.tryMoveTo("order")) {
                        orders[orders.length] = reader.buildAttributes({
                            byViewAttributeName: "{byViewAttributeName}",
                            direction: "{direction}"
                        });
                        reader.next();
                    }
                    var udf = RepositoryXmlParserHelper.parseUDFParameter(reader, "rankThreshold");
                    udf = processUDFParameter(columnView, udf, udf);
                    var rankThreholdSkippedNodes = reader.skippedNodes;
                    windowFunction.createOrMergeRankThreshold(udf, rankThreholdSkippedNodes);
 
                    reader.moveUp();
                }
 
 
                for (var i = 0; i < partitionViewAttributes.length; i++) {
                    var elemenLocal = viewNode.elements.get(partitionViewAttributes[i]);
                    windowFunction.partitionElements.add(elemenLocal);
                }
                for (var j = 0; j < orders.length; j++) {
                    var byElement = viewNode.elements.get(orders[j].byViewAttributeName);
                    var orderLocal = windowFunction.createOrder();
                    orderLocal.byElement = byElement;
                    orderLocal.direction = orders[j].direction;
                }
            },
 
            parseViewAttribute: function(reader, viewNode) {
                var element;
 
                if (reader.tryMoveTo("viewAttribute")) {
                    //: Reading all attributes at once using buildAttributes() to avoid not able to reset flag/value issue
                    var elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        keep: "{keepFlag}",
                        aggregationBehavior: "{aggregationType}", //aggregationBehavior in small case
                        transparentFilter: "{transparentFilter}",
                        primitiveType: "{datatype}",
                        length: Util.createIntSelector("length"),
                        scale: Util.createIntSelector("scale")
                    });
                    
                    if(elementAttributes.transparentFilter){
                    	throwUnsupportedOperationException("Transparent Filter");
                    }
 
                    var simpleTypeAttributes = {};
 
                    //In all cases except script view attribute and constant target attribute in Union view, ViewAttribute's Datatype is derived from its source; so defaulting isDerived flag to true
                    simpleTypeAttributes.isDerived = true;
                    if (elementAttributes.primitiveType && elementAttributes.primitiveType !== undefined) {
                        // It means it is a script view attribute or constant target attribute in Union view
                        RepositoryXmlParserHelper.populateSimpleTypeAttributesFromElementAttributes(elementAttributes, simpleTypeAttributes);
                        simpleTypeAttributes.isDerived = false;
                    }
 
                    //  Parse the description which includes the comment , for view attribute in view Node.
                    if(reader.tryMoveDown()){
                        sharedmodel.parseDescriptions(reader, elementAttributes,false);
                        reader.moveUp();
                    }
                    
                    
                    // : Code for Element Filter
                    if(reader.tryMoveDown()){
                        if(reader.tryMoveTo("filter")){
                            RepositoryXmlParserHelper.processElementFilter(reader, viewNode, elementAttributes.name);
                        } 
                        reader.moveUp();
                    }   
                    
                    var isScriptNode = viewNode.isScriptNode(); 
                    if(isScriptNode){
                        var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, elementAttributes.name, false);
                        if(element){
                            elementAttributes.isProxy = false;
                            element.$setAttributes(elementAttributes);
                            this._setSkippedNodes(element, reader.skippedNodes);
                            viewNode.elements.add(element);
                        }else{
                             element = viewNode.createOrMergeElement(elementAttributes, reader.skippedNodes);
                        }
                    }else{
                        element = viewNode.createOrMergeElement(elementAttributes, reader.skippedNodes);
                    }
                    
                    // This is for creating text for description (comment)
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, elementAttributes);
                    
                    // element = viewNode.createOrMergeElement(elementAttributes, reader.skippedNodes);
                    element.createOrMergeSimpleType(simpleTypeAttributes);
 
                    element.keep = Util.parseBool(elementAttributes.keep);
                   element.transparentFilter = Util.parseBool(elementAttributes.transparentFilter);
 
                    reader.skipChildren();
                }
                return element;
            },
 
            parseCalculatedViewAttribute: function(reader, viewNode) {
                var element;
 
                if (reader.tryMoveTo("calculatedViewAttribute")) {
                    //: Reading all attributes at once using buildAttributes() to avoid not able to reset flag/value issue
                    var elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        primitiveType: "{datatype}",
                        length: Util.createIntSelector("length"),
                        scale: Util.createIntSelector("scale"),
                        expressionLanguage: "{expressionLanguage}"
                    });
 
                    var simpleTypeAttributes = {};
                    // For CalculatedViewAttribute isDerived will always be false
                   simpleTypeAttributes.isDerived = false;
                    if (elementAttributes.primitiveType && elementAttributes.primitiveType !== undefined) {
                        RepositoryXmlParserHelper.populateSimpleTypeAttributesFromElementAttributes(elementAttributes, simpleTypeAttributes);
                    }
 
                    //: call tryMoveToIntermediate() - Because it may happen there will be xml without this tag -  TODO
                    /*reader.moveDown().moveToIntermediate("formula");
                    var formula = reader.consumeContent();*/
                    var formula;
                    if(reader.tryMoveDown()){
                        /*reader.tryMoveToIntermediate("formula");
                        formula = reader.consumeContent();*/
                       
                        if(reader.tryMoveToIntermediate("filter")){
                            RepositoryXmlParserHelper.processElementFilter(reader, viewNode, elementAttributes.name);
                            reader.next();
                        }
                        if(reader.tryMoveToIntermediate("formula")){
                            formula = reader.consumeContent();
                        }
                       
                    }
                   
                    if (formula !== undefined && formula !== null) {
                        elementAttributes.formula = formula;
                    } else {
                        elementAttributes.formula = "";
                    }
                   
                    reader.skipChildren().next().moveUp();
                   
                    element = viewNode.createOrMergeElement(elementAttributes, reader.skippedNodes);
                    element.createOrMergeSimpleType(simpleTypeAttributes);
 
                    if (elementAttributes.formula !== undefined) {
                        element.createCalculationDefinition({
                            "formula": elementAttributes.formula,
                            "expressionLanguage": elementAttributes.expressionLanguage
                        });
                    }
                }
                return element;
            },
 
            parseMeasureIntermediateTags: function(reader, attributes, columnView) {
                if (reader.tryMoveToIntermediate("unitCurrencyAttribute")) {
                    var attributeName = reader.consumeAttribute("attributeName");
                    var dimensionUri = reader.consumeAttribute("dimensionUri");
                    if (attributeName) {
                        if (!attributes.refrenceAttributes) {
                            attributes.refrenceAttributes = [];
                        }
                        if(dimensionUri){
                            var fqName = FullQualifiedName.createByResourceURI(dimensionUri);
                            // var element =  getElementFromEntity(columnView, fqName, attributeName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                            var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                            var element =  getElementFromsharedEntity(sharedEntity, attributeName);
                            // attributes.refrenceAttributes.unitCurrencyElement = element;
                            attributes.elementAttributes.unitCurrencyElement = element;
                        }else{
                            // attributes.refrenceAttributes.unitCurrencyElement = getElementFromColumnView(columnView, attributeName);
                            attributes.elementAttributes.unitCurrencyElement = getElementFromColumnView(columnView, attributeName);
                            //Test code below - delete it later
                            /*var elementInstance = new vModel.Element({name: attributeName, isProxy : true });
                            attributes.elementAttributes.unitCurrencyElement = elementInstance;*/
                        }
                        //: It will never be case that unitCurrencyElement will be null; even if it is null, it is wrong to set it with attributeName
                        /*if (!attributes.refrenceAttributes.unitCurrencyElement) {
                            attributes.refrenceAttributes.unitCurrencyElement = attributeName;
                        }*/
                    }
                    reader.next();
                }
                if (reader.tryMoveToIntermediate("fixedCurrency")) {
                    attributes.elementAttributes.fixedCurrency = reader.consumeContent();
                    reader.next();
                }
                if (reader.tryMoveToIntermediate("fixedUnit")) {
                    attributes.elementAttributes.fixedUnit = reader.consumeContent();
                    reader.next();
                }
            },
 
            parseCurrencyAndUnitConversion: function(reader, attributes, columnView) {
                var conversionData = [];
                conversionData.name = attributes.elementAttributes.name;
                this.parseMeasureIntermediateTags(reader, attributes, columnView);
 
                ////////////////////// Currency Conversion START ////////////////////////////////////////////////////////
                if (reader.tryMoveToIntermediate("currencyConversion")) {
                	
                	throwUnsupportedOperationException("Currency Conversion");
                	
                    conversionData.currencyConversion = [];
                    conversionData.skippedNodes = reader.skippedNodes;
                    conversionData.currencyConversion.errorHandling = [];
                    conversionData.currencyConversion.errorHandling.constantValue = reader.consumeAttribute("errorHandling");
                    conversionData.currencyConversion.generateOutputUnitCurrencyElement = RepositoryXmlParserHelper.getBooleanFromString(reader.consumeAttribute("generateOutputUnitCurrencyAttribute"));
                    conversionData.currencyConversion.outputUnitCurrencyElementName = reader.consumeAttribute("outputUnitCurrencyAttributeName");
                    if (reader.tryMoveDown()) {
                        conversionData.currencyConversion.client = RepositoryXmlParserHelper.parseUDFParameter(reader, "client");
                        if (reader.tryMoveToIntermediate("schema")) {
                            conversionData.currencyConversion.schema = reader.consumeAttribute("schemaName");
                        }
                        if (reader.tryMoveToIntermediate("outputDataType")) {
                            conversionData.currencyConversion.outputDataType = reader.buildAttributes({
                                primitiveType: "{datatype}",
                                length: "{length}",
                                scale: "{scale}"
                            });
                        }
                        conversionData.currencyConversion.sourceCurrency = RepositoryXmlParserHelper.parseUDFParameter(reader, "sourceCurrency");
                        if (reader.tryMoveToIntermediate("erpDecimalShift")) {
                            conversionData.currencyConversion.erpDecimalShift = RepositoryXmlParserHelper.getBooleanFromString(reader.consumeContent());
                        }
                        if (reader.tryMoveToIntermediate("round")) {
                            conversionData.currencyConversion.round = RepositoryXmlParserHelper.getBooleanFromString(reader.consumeContent());
                        }
                        if (reader.tryMoveToIntermediate("erpDecimalShiftBack")) {
                            conversionData.currencyConversion.erpDecimalShiftBack = RepositoryXmlParserHelper.getBooleanFromString(reader.consumeContent());
                        }
                        conversionData.currencyConversion.targetCurrency = RepositoryXmlParserHelper.parseUDFParameter(reader, "targetCurrency");
                        conversionData.currencyConversion.referenceDate = RepositoryXmlParserHelper.parseUDFParameter(reader, "referenceDate");
                        var uDFParameter = [];
                        if (reader.tryMoveToIntermediate("exchangeRateTypeAttribute")) {
                            uDFParameter = [];
                            uDFParameter.element = reader.consumeAttribute("attributeName");
                            uDFParameter.dimensionUri = reader.consumeAttribute("dimensionUri");
                           
                            conversionData.currencyConversion.exchangeRateType = uDFParameter;
                        }
                        if (reader.tryMoveToIntermediate("exchangeRateType")) {
                            uDFParameter = [];
                            var exchangeRateType = reader.consumeContent();
                            if (exchangeRateType && exchangeRateType.indexOf('$') > -1) {
                                uDFParameter.parameter = exchangeRateType;
                                if (uDFParameter.parameter) {
                                    uDFParameter.parameter = uDFParameter.parameter.replace("$$", "");
                                    uDFParameter.parameter = uDFParameter.parameter.replace("$$", "");
                                }
                            } else {
                                uDFParameter.constantValue = exchangeRateType;
                            }
                            conversionData.currencyConversion.exchangeRateType = uDFParameter;
                        }
                        if (reader.tryMoveToIntermediate("exchangeRateAttribute")) {
                            uDFParameter = {};
                            uDFParameter.element = reader.consumeAttribute("attributeName");
                            uDFParameter.dimensionUri = reader.consumeAttribute("dimensionUri");
                            conversionData.currencyConversion.exchangeRateElement = uDFParameter;
                        }
                        reader.moveUp();
                    }
                    reader.next();
 
                    this.registerForLoadPostProcessing(reader, conversionData, function(columnView, data) {
                        var currencyElement = getElementFromColumnView(columnView, data.name);
                        //Test Code - TODO  -delete it later
                        /*if(currencyElement === undefined || currencyElement === null){
                            console.log("currencyElement === undefined");
                        }*/
                        if (data.currencyConversion) {
                            var currencyConversion = currencyElement.createCurrencyConversion();
                            currencyConversion.skippedNodes = data.skippedNodes;
                            currencyConversion.generateOutputUnitCurrencyElement = data.currencyConversion.generateOutputUnitCurrencyElement;
                            currencyConversion.outputUnitCurrencyElementName = data.currencyConversion.outputUnitCurrencyElementName;
                            if (data.currencyConversion.outputUnitCurrencyElementName) {
                                var outputUnitCurrencyElement = currencyConversion.createOrMergeOutputUnitCurrencyElement({
                                    name: data.currencyConversion.outputUnitCurrencyElementName
                                });
                                if (!currencyElement.unitCurrencyElement && currencyElement.$unitCurrencyElement && currencyElement.$unitCurrencyElement === data.currencyConversion.outputUnitCurrencyElementName) {
                                    currencyElement.unitCurrencyElement = outputUnitCurrencyElement;
                                }
                            }
                            if (data.currencyConversion.outputDataType) {
                                currencyConversion.createOrMergeOutputDataType(data.currencyConversion.outputDataType);
                            }
                            currencyConversion.createOrMergeClient();
                            currencyConversion.client = processUDFParameter(columnView, currencyConversion.client, data.currencyConversion.client);
                            currencyConversion.createOrMergeSourceCurrency();
                            currencyConversion.sourceCurrency = processUDFParameter(columnView, currencyConversion.sourceCurrency, data.currencyConversion.sourceCurrency);
                            currencyConversion.createOrMergeTargetCurrency();
                            currencyConversion.targetCurrency = processUDFParameter(columnView, currencyConversion.targetCurrency, data.currencyConversion.targetCurrency);
                            currencyConversion.createOrMergeReferenceDate();
                            currencyConversion.referenceDate = processUDFParameter(columnView, currencyConversion.referenceDate, data.currencyConversion.referenceDate);
                            currencyConversion.erpDecimalShift = data.currencyConversion.erpDecimalShift;
                            currencyConversion.round = data.currencyConversion.round;
                            currencyConversion.erpDecimalShiftBack = data.currencyConversion.erpDecimalShiftBack;
                            currencyConversion.createOrMergeErrorHandling();
                            currencyConversion.errorHandling = processUDFParameter(columnView, currencyConversion.errorHandling, data.currencyConversion.errorHandling);
                            currencyConversion.createOrMergeExchangeRateType();
                            currencyConversion.exchangeRateType = processUDFParameter(columnView, currencyConversion.exchangeRateType, data.currencyConversion.exchangeRateType);
                            if(data.currencyConversion.schema !== undefined){
                                currencyConversion.createOrMergeSchema({
                                    schemaName: data.currencyConversion.schema
                                });
                            }   
                            if(data.currencyConversion.exchangeRateElement && data.currencyConversion.exchangeRateElement.dimensionUri){
                                var fqName = FullQualifiedName.createByResourceURI(data.currencyConversion.exchangeRateElement.dimensionUri);
                                var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                                currencyConversion.exchangeRateElement =  getElementFromsharedEntity(sharedEntity, data.currencyConversion.exchangeRateElement.element);
                            }else if(data.currencyConversion.exchangeRateElement && data.currencyConversion.exchangeRateElement.element){
                                currencyConversion.exchangeRateElement = getElementFromColumnView(columnView, data.currencyConversion.exchangeRateElement.element);
                            } 
                        }
                    });
                }
 
                ////////////////////// Currency Conversion END ////////////////////////////////////////////////////////
 
                ////////////////////// Unit Conversion START ////////////////////////////////////////////////////////
 
                if (reader.tryMoveToIntermediate("unitConversion")) {
                	
                	throwUnsupportedOperationException("Unit Conversion");
                	
                    conversionData.unitConversion = [];
                    conversionData.skippedNodes = reader.skippedNodes;
                    conversionData.unitConversion.errorHandling = [];
                    conversionData.unitConversion.errorHandling.constantValue = reader.getAttribute("errorHandling");
                    conversionData.unitConversion.generateOutputUnitCurrencyElement = RepositoryXmlParserHelper.getBooleanFromString(reader.getAttribute("generateOutputUnitCurrencyAttribute"));
                    conversionData.unitConversion.outputUnitCurrencyElementName = reader.getAttribute("outputUnitCurrencyAttributeName");
                    if (reader.tryMoveDown()) {
 
                        conversionData.unitConversion.client = RepositoryXmlParserHelper.parseUDFParameter(reader, "client");
                        if (reader.tryMoveToIntermediate("schema")) {
                            conversionData.unitConversion.schema = reader.getAttribute("schemaName");
                        }
                        conversionData.unitConversion.sourceUnit = RepositoryXmlParserHelper.parseUDFParameter(reader, "sourceUnit");
                        if (reader.tryMoveToIntermediate("erpDecimalShift")) {
                            conversionData.unitConversion.erpDecimalShift = RepositoryXmlParserHelper.getBooleanFromString(reader.getContent());
                        }
                        if (reader.tryMoveToIntermediate("round")) {
                            conversionData.unitConversion.round = RepositoryXmlParserHelper.getBooleanFromString(reader.getContent());
                        }
                        conversionData.unitConversion.targetUnit = RepositoryXmlParserHelper.parseUDFParameter(reader, "targetUnit");
                        reader.moveUp();
                    }
                    reader.next();
 
                    this.registerForLoadPostProcessing(reader, conversionData, function(columnView, data) {
                        var currencyElement = getElementFromColumnView(columnView, data.name);
                        var unitConversion = currencyElement.createUnitConversion();
                        unitConversion.skippedNodes = data.skippedNodes;
                        unitConversion.generateOutputUnitCurrencyElement = data.unitConversion.generateOutputUnitCurrencyElement;
                        unitConversion.outputUnitCurrencyElementName = data.unitConversion.outputUnitCurrencyElementName;
                        if (data.unitConversion.outputUnitCurrencyElementName) {
                            var outputUnitCurrencyElement = unitConversion.createOrMergeOutputUnitCurrencyElement({
                                name: data.unitConversion.outputUnitCurrencyElementName
                            });
                            if (!currencyElement.unitCurrencyElement && currencyElement.$unitCurrencyElement && currencyElement.$unitCurrencyElement === data.unitConversion.outputUnitCurrencyElementName) {
                                currencyElement.unitCurrencyElement = outputUnitCurrencyElement;
                            }
                        }
                        unitConversion.createOrMergeClient();
                        unitConversion.client = processUDFParameter(columnView, unitConversion.client, data.unitConversion.client);
                        unitConversion.createOrMergeSourceCurrency();
                        unitConversion.sourceUnit = processUDFParameter(columnView, unitConversion.sourceUnit, data.unitConversion.sourceUnit);
                        unitConversion.createOrMergeTargetCurrency();
                        unitConversion.targetUnit = processUDFParameter(columnView, unitConversion.targetUnit, data.unitConversion.targetUnit);
                        unitConversion.erpDecimalShift = data.unitConversion.erpDecimalShift;
                        unitConversion.round = data.unitConversion.round;
                        unitConversion.createOrMergeErrorHandling();
                        unitConversion.errorHandling = processUDFParameter(columnView, unitConversion.errorHandling, data.unitConversion.errorHandling);
                        unitConversion.createOrMergeSchema({
                            schemaName: data.unitConversion.schema
                        });
                    });
                }
 
 
                ////////////////////// Currency Conversion END ////////////////////////////////////////////////////////
 
            },
 
            parseInput: function(reader, viewNode, dataSources, nodeIDsInCalculationView) {
                var input;
                if (reader.tryMoveTo("input")) {
 
                    var nodeID = reader.consumeAttribute("node");
                    nodeIDsInCalculationView.push(nodeID);
 
                    var inputAttributes = reader.buildAttributes({
                        emptyUnionBehavior: "{emptyUnionBehavior}"
                    });
 
                    //: If View Node is Union then set default emptyUnionBehavior value even if it is not present in legacy model - TODO
                    if (viewNode.type === 'Union' && inputAttributes.emptyUnionBehavior === undefined) {
                        inputAttributes.emptyUnionBehavior = "NO_ROW";
                    }
 
                    input = viewNode.createInput(inputAttributes, reader.skippedNodes);
                    input.setSource(getSourceForInput(nodeID, dataSources, viewNode));
                   
                    //Required for Union Pruning Details
                    /*if (viewNode.type === 'Union') {
                        input.repositoryInputNodeId = nodeID;
                        input.repositoryInputNodeId = RepositoryXmlParserHelper.removeHashTag(input.repositoryInputNodeId);
                    }*/
                    input.repositoryInputNodeId = nodeID;
                    
                    var columnView = viewNode.$getContainer();	

                    //input.repositoryInputNodeId = RepositoryXmlParserHelper.removeHashTag(input.repositoryInputNodeId);
                    if(columnView.schemaVersion < 3.0){
                    	input.repositoryInputNodeId = RepositoryXmlParserHelper.removeHashTag(input.repositoryInputNodeId , columnView);
                	}
 
                    //addToMapOfDataSourceToInput
                    // mapOfDataSourceToInput.push({"dataSource": nodeID, "input": input});         
                    
                    
                    //var dataSource = getDataSource(nodeID, dataSources);
                    var dataSource = getDataSource(nodeID, dataSources, columnView);
                    RepositoryXmlParserHelper.setInputAliasIfRequired(dataSource, input);
 
                    //: Calling reader.tryMoveDown() because there may not be any mapping
                    if (reader.tryMoveDown()) {
                        while (this.parseMapping(reader, input)) {
                            reader.next();
                       }
                        reader.moveUp();
                    }
                }
                return input;
            },
 
            parseMapping: function(reader, input) {
                var mapping;
 
                //Test code - delete it later
                var viewNodeTest = input.$getContainer();
                if (viewNodeTest.type === 'Union') {
                    var typeTest = viewNodeTest.type;
                }
 
                if (reader.tryMoveTo("mapping")) {
                    var mapType = function(value) {
                        var type = reader.removePrefix(sharedmodel.NameSpace.CALCULATION, value);
                        switch (type) {
                            case "AttributeMapping":
                                return "ElementMapping";
                            case "ConstantAttributeMapping":
                                return "ConstantElementMapping";
                            default:
                                return type;
                        }
                    };
 
                    var mappingAttributes = reader.buildAttributes({
                        type: Util.createXsiSelector("type", mapType),
                        sourceName: "{source}",
                        targetName: "{target}",
                        isNull: "{null}",
                        value: "{value}"
                    });
 
                    // - add element into entity to make element proxy work - not applicable for Constant mapping in Union View and elements in script based calculation view.
                    var inputSource = input.getSource();
                    if (inputSource !== undefined && inputSource instanceof vModel.Entity && mappingAttributes.sourceName !== undefined) {
                        addElementToEntityIfNotPresent(inputSource, mappingAttributes.sourceName);
                    } else if (inputSource !== undefined && inputSource instanceof vModel.ViewNode && mappingAttributes.sourceName !== undefined) {
                        addElementToViewNodeIfNotPresent(inputSource, mappingAttributes.sourceName);
                    }
 
                    //Not applicable for Constant mapping in Union View and elements in script based calculation view.
                    if (mappingAttributes.sourceName !== undefined) {
                        mappingAttributes.sourceElement = inputSource.elements.get(mappingAttributes.sourceName);
                        delete mappingAttributes.sourceName;
                    }
 
                    var viewNode = input.$getContainer();
                    mappingAttributes.targetElement = viewNode.elements.get(mappingAttributes.targetName);
                    delete mappingAttributes.targetName;
 
                    if (mappingAttributes.isNull) {
                        mappingAttributes.isNull = Util.parseBool(mappingAttributes.isNull);
                    }
 
                    mapping = input.createMapping(mappingAttributes, reader.skippedNodes);
                    reader.skipChildren();
                }
                return mapping;
            },
 
            parseLogicalModel: function(reader, columnView, outputViewType, outputViewName, dataSources, isStarJoin) {
                reader.moveTo("logicalModel");
                var sourceName = reader.consumeAttribute("id");
 
                var viewNodeAttributes = reader.buildAttributes({
                    name: outputViewName,
                    type: outputViewType
                });
                var viewNode = columnView.createOrMergeViewNode(viewNodeAttributes, reader.skippedNodes, true);
               
                var input;
                // : if no table/view is assigned to Default Node, i.e; if there is no input to default node then source Name will be null.
                if (!viewNode.isScriptNode() && sourceName) {
                    input = viewNode.createInput();
                    input.setSource(getSourceForInput(sourceName, dataSources, viewNode));
                    
                    input.repositoryInputNodeId = sourceName;
                    //input.repositoryInputNodeId = RepositoryXmlParserHelper.removeHashTag(input.repositoryInputNodeId);
                    if(columnView.schemaVersion < 3.0){
                    	input.repositoryInputNodeId = RepositoryXmlParserHelper.removeHashTag(input.repositoryInputNodeId , columnView);
                	}
                }
 
                // : sourceName can be null for empty calculation view
                if (sourceName) {
                    //var dataSource = getDataSource(sourceName, dataSources);
                    var dataSource = getDataSource(sourceName, dataSources, columnView);
                    RepositoryXmlParserHelper.setInputAliasIfRequired(dataSource, input);
                }
 
                var singleElementAttributes; // new object to be used for creating Element seqentially
                var elementIndex = 0;
                var allAttributes = [];
               
                //: all private join colulmns of star join
                viewNode.starJoinPrivateElements = [];
 
                reader.moveDown();
                if (reader.moveToIntermediate("attributes").tryMoveDown()) {
                    while (this.parseAttribute(reader, viewNode, allAttributes)) {
                        singleElementAttributes = allAttributes[elementIndex];
                        //Calling createDefaultNodeElement() which creates element based on order in viewnode's elements list
                        this.createDefaultNodeElement(viewNode, singleElementAttributes, viewNode.isScriptNode(), isStarJoin);
                        elementIndex++;
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
 
                if (reader.moveToIntermediate("calculatedAttributes").tryMoveDown()) {
                    while (this.parseCalculatedAttribute(reader, viewNode, allAttributes)) {
                        singleElementAttributes = allAttributes[elementIndex];
                        this.createDefaultNodeElement(viewNode, singleElementAttributes, viewNode.isScriptNode(), isStarJoin);
                        elementIndex++;
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
 
                if (reader.moveToIntermediate("baseMeasures").tryMoveDown()) {
                    while (this.parseMeasure(reader, viewNode, allAttributes)) {
                        singleElementAttributes = allAttributes[elementIndex];
                        this.createDefaultNodeElement(viewNode, singleElementAttributes, viewNode.isScriptNode(), isStarJoin);
                        elementIndex++;
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
 
                if (reader.moveToIntermediate("calculatedMeasures").tryMoveDown()) {
                    while (this.parseCalculatedMeasure(reader, viewNode, allAttributes)) {
                        singleElementAttributes = allAttributes[elementIndex];
                        this.createDefaultNodeElement(viewNode, singleElementAttributes, viewNode.isScriptNode(), isStarJoin);
                        elementIndex++;
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
 
                if (reader.moveToIntermediate("restrictedMeasures").tryMoveDown()) {
                	
                	//throwUnsupportedOperationException("Restricted Column");
                	
                    while (this.parseRestrictedMeasure(reader, viewNode, allAttributes)) {
                    	throwUnsupportedOperationException("Restricted Column");
                        singleElementAttributes = allAttributes[elementIndex];
                        this.createDefaultNodeElement(viewNode, singleElementAttributes, viewNode.isScriptNode(), isStarJoin);
                        elementIndex++;
                        reader.next();
                    }
                    reader.moveUp();
                }
                reader.next();
               
                //: At last add all private join colulmns of star join
                for(var i = 0; i < viewNode.starJoinPrivateElements.length; i++){
                    var starJoinPrivateElement = viewNode.starJoinPrivateElements[i];
                    // viewNode.elements.add(starJoinPrivateElement);
                    for (var index = 0; index < columnView._defaultNodeElementInstancesArray.length; index++) {
                        var elementInstance = columnView._defaultNodeElementInstancesArray[index];
                        if (elementInstance && starJoinPrivateElement && elementInstance.name === starJoinPrivateElement.name) {
                            delete columnView._defaultNodeElementInstancesArray[index];
                        }
                    } 
                }
               
                //Check whether any proxy Element exists; if yes throw TransformationException
                var proxyElementInstanceFound = this._checkProxyElementsInDefaultNode(viewNode);
                if(proxyElementInstanceFound){
                    throw new modelbase.TransformationException("Element {0} not found", [proxyElementInstanceFound.name]);
                }
 
                /* Below code is required for descriptionMapping
                for (var attributeIndex = 0; i < allAttributes.length; attributeIndex++) {
                        var attributes = allAttributes[attributeIndex];
                        if(attributes.descriptionMappingAttributes && attributes.descriptionMappingAttributes.descriptionColumnName){
                            var element = viewNode.elements.get(attributes.elementAttributes.name);
                            var labelElement = viewNode.elements.get(attributes.descriptionMappingAttributes.descriptionColumnName);
                            if (element && labelElement) {
                                element.labelElement = labelElement;
                            }else if(element && labelElement === 'undefined'){
                                //Create special label element with name as 'elementName.description'
                                // Add element in viewNode so that a view attribute will be created in leagacy model
                                var elementAttributes = {
                                    name: element.name+".description",
                                    hidden: true
                                };
                                var descriptionElement = viewNode.createElement(elementAttributes);
                                element.labelElement = descriptionElement;
                               
                                var viewNodeInput = viewNode.inputs.get(0);
                               
                                // mapping for descriptionElement
                                var descriptionElementMappingAttributes = {
                                    sourceElement: viewNodeInput.getSource().elements.get(attributes.descriptionMappingAttributes.descriptionColumnName),
                                    targetElement: descriptionElement,
                                    type: "ElementMapping"
                                };
                                var descriptionElementMapping = viewNodeInput.createMapping(descriptionElementMappingAttributes);
                            }   
                        }
                }*/
               
                if (columnView.dataCategory === "CUBE") {
                    if (reader.tryMoveToIntermediate("localDimensions")) {
                        if (reader.tryMoveDown()) {
                            while (reader.tryMoveTo("localDimension")) {
                                var localDimensionId = reader.getAttribute("id");
                                if (reader.tryMoveDown()) {
                                    while (reader.tryMoveTo("attributeRef")) {
                                        var attibuteRefType = reader.getAttribute("xsi:type");
                                        var attibuteRefContent = reader.getContent();
                                        reader.next();
                                    }
                                    if (reader.tryMoveToIntermediate("hierarchies")) {
                                        if (reader.tryMoveDown()) {
                                            if (reader.tryMoveTo("hierarchy")) {
                                                var HierachyType = function(value) {
                                                    return reader.removePrefix(sharedmodel.NameSpace.DIMENSION, value);
                                                };
                                                var parsingHierachyType = reader.buildAttributes({
                                                    type: Util.createXsiSelector("type", HierachyType)
                                                });
                                                if (parsingHierachyType.type && parsingHierachyType.type === "LeveledHierarchy") {
                                                    this.parseLevelHiearchy(reader, columnView, parsingHierachyType.type);
                                                } else if (parsingHierachyType.type === "ParentChildHierarchy") {
                                                    this.parseParentChildHiearchy(reader, columnView, parsingHierachyType.type);
                                                }
                                            }
                                            reader.next();
                                            reader.moveUp();
                                        }
 
                                    }
                                    reader.moveUp();
                                }
                                reader.next();
                            }
                            reader.moveUp();
                        }
                        reader.next();
                    }
                }
               
                
                //Star Join Code - START
                if (reader.tryMoveToIntermediate("sharedDimensions")) {
                    if (reader.tryMoveDown()) {
                            while (reader.tryMoveTo("logicalJoin")) {
                                var logicalJoinAttributes = reader.buildAttributes({                       
                                            languageAttributeName: "{languageAttributeName}"
                                        });
                                var associatedObjectUri = reader.consumeAttribute("associatedObjectUri");
                                var fqName = FullQualifiedName.createByResourceURI(associatedObjectUri);
                                var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                                sharedEntity.isLoadFromXML = true;
								var attributeRef = [];
                                if (reader.tryMoveDown()) {
                                    attributeRef = this.parseStarJoinPrivateJoinColumns(reader);
                                    var attributeName = this.parseStarJoinSharedJoinColumns(reader);
                                    if(attributeRef.length !== attributeName.length){
                                        throw new modelbase.TransformationException("Join for attribute view {0} is inconsistent", [fqName]);   
                                    }
                                    var joinAttributes = this.parseStarJoinJoinProperties(reader);
                                    //Create join
                                    var starJoinNode = columnView.getDefaultNode();
                                    if(logicalJoinAttributes.languageAttributeName){
                                        // joinAttributes.textJoinLanguageElementName = logicalJoinAttributes.languageAttributeName; 
                                        joinAttributes.languageColumn = logicalJoinAttributes.languageAttributeName;
                                    }
                                    var join = starJoinNode.createJoin(joinAttributes);
                                    join.leftInput = input;
                                    var sharedInput = viewNode.createInput();
                                    sharedInput.setSource(sharedEntity);
                                   join.rightInput = sharedInput;
                                    join.rightInput.selectAll = true;
                                    
                                    if(logicalJoinAttributes.languageAttributeName){
                                        getElementFromsharedEntity(sharedEntity, logicalJoinAttributes.languageAttributeName);
                                    }
                                    
                                    this.processStarJoinAliasedSharedJoinColumns(reader, columnView, fqName, sharedInput);
                                    reader.next();
                                    // : ThrowUnsupportedOperationException for Calc Integration of Hierarchies
                                    if(reader._current && reader._current.nextSibling && reader._current.nextSibling.nodeName === "associatedHierarchyFeature"){
                                                throwUnsupportedOperationException("Calc Integration of Hierarchies");
                                    }
                                   
                                    reader.moveUp();
                                }
                               
                                //TODO: no need of listOfLocalJoinedAttributes : delete it later
                                var listOfLocalJoinedAttributes = [];
                                attributeRef = this.remove$localFromStarJoinPrivateJoinColumns(attributeRef);
                               
                                if(attributeRef && attributeName){
                                    for(var i = 0; i < attributeRef.length; i++){
                                        var leftJoinElementName = attributeRef[i];
                                                                                                    var inputSource = this.getStarJoinViewNodeInputSource(viewNode);
                                                                                                    var leftJoinElement = inputSource.elements.get(leftJoinElementName);
                                        // join.leftElements.add(leftJoinElement);
                                        if(listOfLocalJoinedAttributes.indexOf(leftJoinElementName) === -1){
                                            listOfLocalJoinedAttributes.push(leftJoinElementName)
                                        }
                                        var rightJoinElementName = attributeName[i];
                                        // var rightJoinElement = getElementFromEntity(columnView, fqName, rightJoinElementName);
                                        var rightSharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                                        var rightJoinElement =  getElementFromsharedEntity(rightSharedEntity, rightJoinElementName);
                                       
                                        /*join.leftElements.add(leftJoinElement);
                                        join.rightElements.add(rightJoinElement);*/
                                        var key = leftJoinElement.name + "$$" + rightJoinElement.name;
                                        join.leftElements.add(key, leftJoinElement);
                                        join.rightElements.add(key, rightJoinElement);
                                       
                                        if(join.joinType === vModel.JoinType.LEFT_OUTER){
                                            var mappingAttributes = {};
                                            mappingAttributes.type = vModel.MappingType.InputMapping;
                                            mappingAttributes.sourceElement = leftJoinElement;
                                            mappingAttributes.targetElement = rightJoinElement;
                                            mappingAttributes.sourceInput = input;
                                            sharedInput.createMapping(mappingAttributes);
                                           
                                        }
                                    }
                                }
                                // Join Attribute and mapping should not be present in logical Join as a private element
                                                                                                                //  Same local Join Attribute can be joined to more than one CV dimensions; even in this case, we should remove it only one time from private attribute list,
                                                                                                                // because no matter how many time a local Join Attribute is joined, there will be only one corresponding private attribute(with suffix '$local') added in logical model,
                                                                                                                // while saving by M2M which should be removed while loading
                                for(var i = 0; i < listOfLocalJoinedAttributes.length; i++){
                                    var elementName = listOfLocalJoinedAttributes[i];
                                    var elementToRemove = viewNode.elements.get(elementName);
                                    /*RepositoryXmlParserHelper.removeAttributeMappingForAttribute(elementToRemove, input);
                                    viewNode.elements.remove(listOfLocalJoinedAttributes[i]);*/
                                }
                               
                                reader.next();
                            }
                            reader.moveUp();
                    }       
                    reader.next();
                }
                // Star Join Code - END
 
                reader.moveUp();
                return viewNode;
            },
           
            parseStarJoinPrivateJoinColumns: function(reader){
                var attributeRefs = [];
                if (reader.tryMoveTo("attributes")) {
                    if (reader.tryMoveDown()) {
                        while (reader.tryMoveTo("attributeRef")) {
                            var localJoinAttr = reader.consumeContent();
                             attributeRefs.push(localJoinAttr);
                             reader.next();
                        }
                        reader.moveUp();
                    }
                } 
                return attributeRefs;
            },
           
            parseStarJoinSharedJoinColumns: function(reader){
                var attributeNames = [];
                if (reader.tryMoveTo("associatedAttributeNames")) {
                    if (reader.tryMoveDown()) {
                        while (reader.tryMoveTo("attributeName")) {
                            var sharedJoinAttrName = reader.consumeContent();
                             attributeNames.push(sharedJoinAttrName);
                             reader.next();
                        } 
                        reader.moveUp();
                    }
                }    
                return attributeNames;
            }, 
            
            parseStarJoinJoinProperties: function(reader){
                var joinAttributes;
                if (reader.tryMoveTo("properties")) {
                    joinAttributes = reader.buildAttributes({                       
                        joinType: "{joinType}",
                        cardinality: "{cardinality}",
                        joinOperator: "{joinOperator}",
                        optimizeJoinColumns: "{optimizeJoinColumns}",
                        dimensionJoin: "{dimensionJoin}",
                        dynamic: "{dynamic}"
                    });
                }   
                return joinAttributes;
            },   
            
            processStarJoinAliasedSharedJoinColumns: function(reader, columnView, fqName, sharedInput){
                if (reader.tryMoveTo("associatedAttributeFeatures")) {
                    if (reader.tryMoveDown()) {
                        while (reader.tryMoveTo("attributeReference")) {
                            var attributeReferenceAttributes = reader.buildAttributes({                       
                                alias: "{alias}",
                                attributeName: "{attributeName}",
                                transparentFilter: "{transparentFilter}",
                                hidden: "{hidden}"
                            });
                            // var elementInEntity = getElementFromEntity(columnView, fqName, attributeReferenceAttributes.attributeName);
                            var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                            var elementInEntity =  getElementFromsharedEntity(sharedEntity, attributeReferenceAttributes.attributeName);
                            var mappingAttributes = {};
                            mappingAttributes.type = vModel.MappingType.ElementMapping;
                            mappingAttributes.sourceElement = elementInEntity;
                            // will only create Input Element Mapping either alias or transparentFilter; when only variable is applied on shared column then no need to create mapping
                            var needToCreateInputElementMapping = false;
                            if(attributeReferenceAttributes.alias){
                                mappingAttributes.aliasName = attributeReferenceAttributes.alias;
                                needToCreateInputElementMapping = true;
                            }
                            if(attributeReferenceAttributes.transparentFilter){
                                mappingAttributes.transparentFilter = Util.parseBool(attributeReferenceAttributes.transparentFilter);
                                needToCreateInputElementMapping = true;
                            }   
                            if(needToCreateInputElementMapping){
                                var inputElementMapping = sharedInput.createMapping(mappingAttributes);
                            }   
                            if(attributeReferenceAttributes.hidden){
                                sharedInput.excludedElements.add(elementInEntity);
                            }
                           
                            if (reader.tryMoveDown()) {
                                var descriptionAttributes = {};
                                descriptionAttributes = this.processSharedColumnDescription(reader, descriptionAttributes);
                                if(inputElementMapping){
                                    inputElementMapping.label = descriptionAttributes.label;
                                }   
                                this.processVariableAppliedOnSharedColumn(reader, elementInEntity, columnView);
                                reader.moveUp();
                            }
                            inputElementMapping = undefined;
                            reader.next();
                        }   
                        reader.moveUp();
                    }   
                }
            },   
            
            processSharedColumnDescription: function(reader, descriptionAttributes){
                descriptionAttributes = sharedmodel.parseDescriptions(reader, descriptionAttributes);
                return descriptionAttributes;
            },
           
            processVariableAppliedOnSharedColumn: function(reader, elementInEntity, columnView){
                if (reader.tryMoveToIntermediate("localVariable")) {
                    var variableName = reader.consumeContent();
                    var parameter = getParameterFromColumnView(columnView, variableName);
                    if (parameter) {
                        // parameter.assignedElements.add(elementInEntity);
                        var entity = elementInEntity.$getContainer();
                        var fqName = entity.getFullyQualifiedName();
                        var key = fqName + "." + elementInEntity.name;
                        parameter.assignedElements.add(key, elementInEntity);
                    }
                    reader.next();
                }
            },
           
            remove$localFromStarJoinPrivateJoinColumns: function(attributeRefs){
                var privateJoinColumnNames = [];
                for(var i = 0; i < attributeRefs.length; i++){
                    if (attributeRefs[i] && attributeRefs[i].indexOf('$local') > -1) {
                        var elementAttributes_name_parts = attributeRefs[i].split('$local');
                        if (elementAttributes_name_parts && elementAttributes_name_parts.length > 0 ) {
                            privateJoinColumnNames[i] = elementAttributes_name_parts[0];
                            privateJoinColumnNames[i] = RepositoryXmlParserHelper.removeHashTag(privateJoinColumnNames[i]);
                        }
                    }
                }   
                return privateJoinColumnNames;
            }, 
            
            getStarJoinViewNodeInput: function(viewNode){
                var input;
                for(var i = 0; i < viewNode.inputs.count(); i++){
                                                                                if(viewNode.inputs.getAt(i) && viewNode.inputs.getAt(i).getSource() instanceof vModel.ViewNode){
                                                                                                input = viewNode.inputs.getAt(i);
                                                                                                break;
                                                                                }
                                                    }
                                                    return input;
            },
           
            getStarJoinViewNodeInputSource: function(viewNode){
                                                    var inputSource = this.getStarJoinViewNodeInput(viewNode).getSource();
                                                    return inputSource;
            },
            
            createDefaultNodeElement: function(viewNode, attributes, isScriptNode, isStarJoin) {
                var columnView = viewNode.$getContainer();
                var element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, false);
               
                // viewNode.starJoinPrivateElements = [];
               
                if (isScriptNode || (isStarJoin && attributes.elementAttributes && attributes.elementAttributes.name && attributes.elementAttributes.name.match(/[$]local$/))) {
                    // For ScriptNode and StarJoin go usual way
                    if(!element && isStarJoin){
                        if(attributes.elementAttributes && attributes.elementAttributes.name && attributes.elementAttributes.name.match(/[$]local$/)){
                            if (attributes.elementAttributes && attributes.elementAttributes.name && attributes.elementAttributes.name.indexOf('$local') > -1) {
                                var elementAttributes_name_parts = attributes.elementAttributes.name.split('$local');
                                if (elementAttributes_name_parts && elementAttributes_name_parts.length > 0 ) {
                                    attributes.elementAttributes.name = elementAttributes_name_parts[0];
                                    attributes.elementAttributes.name = RepositoryXmlParserHelper.removeHashTag(attributes.elementAttributes.name);
                                }
                            }
                            var starJoinPrivateElement = viewNode.createOrMergeElement(attributes.elementAttributes, attributes.elementSkippedNodes);
                            viewNode.starJoinPrivateElements.push(starJoinPrivateElement);
                        }   
                    }else if(element && isStarJoin){
                        var elementAttributes_name_parts = element.name.split('$local');
                        if (elementAttributes_name_parts && elementAttributes_name_parts.length > 0 ) {
                           /*element.name = elementAttributes_name_parts[0];
                            element.name = RepositoryXmlParserHelper.removeHashTag(element.name);*/
                            var localElement = viewNode.createElementWithoutAddingIntoElementCollection({name: element.name});
                            viewNode.starJoinPrivateElements.push(localElement);
                        }   
                    }  
                    if (isScriptNode) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                        if(!element){
                            element = viewNode.createOrMergeElement(attributes.elementAttributes, attributes.elementSkippedNodes);
                        }else{
                            attributes.elementAttributes.isProxy = false;
                            element.$setAttributes(attributes.elementAttributes);
                            this._setSkippedNodes(element, attributes.elementSkippedNodes);
                        }
                        // For attributes in ScriptNode isDerived will always be false
                        attributes.simpleTypeAttributes.isDerived = false;
                    }
                } else {
                    // create Element Based On Order Index
                    var index = attributes.order;
                    index = Util.parseInt(index);
                    if(element){
                        attributes.elementAttributes.isProxy = false;
                        element.$setAttributes(attributes.elementAttributes);
                        this._setSkippedNodes(element, attributes.elementSkippedNodes);
                    }else{
                        element = viewNode.createElementWithoutAddingIntoElementCollection(attributes.elementAttributes, attributes.elementSkippedNodes);
                    }
                    viewNode.elements.setAt(index, element);
                }
               
                element.hidden = Util.parseBool(attributes.elementAttributes.hidden);
 
                element.keep = Util.parseBool(attributes.elementAttributes.keep);
 
                if (attributes.elementAttributes.key === 'true') {
                    element.$getContainer().keyElements.add(element);
                }
 
                var viewNodeTest = element.$getContainer();
                if (viewNodeTest && !viewNodeTest.isScriptNode() && !element.name.match(/[$]local$/)) {
                    RepositoryXmlParserHelper.processDrillDownEnablement(attributes.elementAttributes.attributeHierarchyActive,
                        attributes.elementAttributes.displayAttribute, element);
                }
 
                if (attributes.simpleTypeAttributes) {
                    element.createOrMergeSimpleType(attributes.simpleTypeAttributes);
                }
 
                if (attributes.mappingAttributes && !isScriptNode) {
                    var inputSource;
                    if(viewNode.type === 'JoinNode'){
                                                                                                // for star join, ViewNode can be in any input; it will not be fixed at first input 
                                                                                                for(var i = 0; i < viewNode.inputs.count(); i++){
                                                                                                                if(viewNode.inputs.getAt(i) && viewNode.inputs.getAt(i).getSource() instanceof vModel.ViewNode){
                                                                                                                                inputSource = viewNode.inputs.getAt(i).getSource();
                                                                                                                                break;
                                                                                                                }
                                                                                                }
                    }else{
                        inputSource = viewNode.inputs.getAt(0).getSource();   
                    } 
                    
                    if (inputSource !== undefined && inputSource instanceof vModel.Entity) {
                        addElementToEntityIfNotPresent(inputSource, attributes.mappingAttributes.sourceName);
                    }
                   
                    //Do not create mapping for star join private join column
                    var needToCreateMapping = true;
                    if(attributes.elementAttributes && attributes.elementAttributes.name && attributes.elementAttributes.name.match(/[$]local$/)){
                        needToCreateMapping = false;
                    }
                   
                    if(needToCreateMapping){
                        attributes.mappingAttributes.sourceElement = inputSource.elements.get(attributes.mappingAttributes.sourceName);
                        attributes.mappingAttributes.targetElement = element;
                        delete attributes.mappingAttributes.sourceName;
                        delete attributes.mappingAttributes.targetName;
                        element.createDefaultMapping(attributes.mappingAttributes, attributes.mappingSkippedNodes);
                    }
                }
 
                if (attributes.elementAttributes.formula !== undefined && attributes.elementAttributes.formula !== null) {
                    element.createCalculationDefinition({
                        "formula": attributes.elementAttributes.formula,
                        "expressionLanguage": attributes.elementAttributes.expressionLanguage
                    });
                }
                //Dead code - delete it later
                /*if (attributes.refrenceAttributes && attributes.refrenceAttributes.unitCurrencyElement) {
                    if (attributes.refrenceAttributes.unitCurrencyElement instanceof vModel.Element) {
                        element.unitCurrencyElement = attributes.refrenceAttributes.unitCurrencyElement;
                    } else {
                        element.$unitCurrencyElement = attributes.refrenceAttributes.unitCurrencyElement;
                    }
                }*/
            },
 
            parseUnitCurrencyAttribute: function(reader, attributes) {
                if (reader.tryMoveToIntermediate("unitCurrencyAttribute")) {
                    attributes.unitCurrencyAttributeName = reader.consumeAttribute("attributeName");
                }
                if (attributes.unitCurrencyAttributeName) {
                    this.registerForLoadPostProcessing(reader, {
                        attribute: attributes.elementAttributes.name,
                        value: attributes.unitCurrencyAttributeName
                    }, populateUnitCurrencyElements);
                }
                //Attribute will not have FixedCurrency/FixedUnit like measure
            },
 
            parseAttribute: function(reader, viewNode, allAttributes) {
                var attributes;
 
                if (reader.tryMoveTo("attribute")) {
                    attributes = {
                        order: reader.consumeAttribute("order")
                    };
 
                    attributes.elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        hidden: "{hidden}",
                        aggregationBehavior: "none", // small case aggregationBehavior
                        attributeHierarchyActive: "{attributeHierarchyActive}",
                        displayAttribute: "{displayAttribute}",
                        infoObjectName: "{infoObject}",
                        attributeHierarchyDefaultMember: "{attributeHierarchyDefaultMember}",
                        keep: "{keepFlag}",
                        key: "{key}",
                        descriptionColumnName: "{descriptionColumnName}",
                        semanticType: "{semanticType}",
                        transparentFilter: "{transparentFilter}",
                        deprecated: "{deprecated}"
                    });
                    
                    attributes.elementAttributes.transparentFilter = Util.parseBool(attributes.elementAttributes.transparentFilter);
                    attributes.elementAttributes.deprecated = Util.parseBool(attributes.elementAttributes.deprecated);
                    
                    //Create element instance upfront to be used to set other properties on it, e.g; label element
                    var element;
                    var columnView = viewNode.$getContainer();
                    if (viewNode.isScriptNode()) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                    }else{   
                        // var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, true);
                    }   
 
                    // attributes.elementAttributes.transparentFilter = Util.parseBool(attributes.elementAttributes.transparentFilter);
 
                    //: Read semanticType using buildAttributes when reading other attributes to avoid reset issue
                    attributes.simpleTypeAttributes = {};
                    attributes.simpleTypeAttributes.semanticType = attributes.elementAttributes.semanticType;
                    // For Attribute in logical model isDerived will always be true
                   attributes.simpleTypeAttributes.isDerived = true;
 
                    attributes.elementSkippedNodes = reader.skippedNodes;
                    allAttributes.push(attributes);
 
                    reader.moveDown();
                   
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, attributes.elementAttributes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, attributes.elementAttributes);
 
                    // Attribute can have unitCurrencyAttribute
                    if (attributes.simpleTypeAttributes.semanticType !== undefined && (attributes.simpleTypeAttributes.semanticType === 'amount' ||
                        attributes.simpleTypeAttributes.semanticType === 'quantity')) {
                        this.parseUnitCurrencyAttribute(reader, attributes);
                        //: Do we need to thow UnsupportedOperationException since in UI UnitCurrencyAttribute for Attribute is not supported - TODO
                    }
                   
                    this.processTypedObjectExternalTypeOfElement(reader, columnView, element, false);
                    this.processTypedObjectExternalTypeOfElementParameterMapping(reader, element);
                    // reader.next();
                    if (attributes.elementAttributes.descriptionColumnName !== undefined) {
                        /*var populateLabelElement = function(){
                                element.labelElement = getElementFromColumnView(columnView, attributes.elementAttributes.descriptionColumnName);
                        };
                        this.pushToLoadPostProcessingCallBackQueue(reader, populateLabelElement);*/
                    	element.labelElement = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.descriptionColumnName, true);
                    }
                   
                    if (reader.tryMoveToIntermediate("localVariable")) {
                        var variableName = reader.consumeContent();
                        var parameter = getParameterFromColumnView(columnView, variableName);
                        if (parameter) {
                            parameter.assignedElements.add(element);
                        }
                        reader.next();
                    }
                   
                    if (reader.tryMoveToIntermediate("keyMapping")) {
                        attributes.mappingAttributes = reader.buildAttributes({
                            type: "ElementMapping",
                            sourceName: "{columnName}",
                            targetName: attributes.elementAttributes.name
                        });
                    }else{
                        attributes.elementAttributes.hasNoMapping = true;
                    }
 
                    //: Old way of storing descriptionColumn - TODO
                    /*
                    if (reader.tryMoveToIntermediate("descriptionMapping")) {
                        attributes.descriptionMappingAttributes = reader.buildAttributes({
                            descriptionColumnName: "{columnName}"
                        });
                    }
                    */
 
                    //: Search Attributes and Attribute Relationship - TODO
 
                    //: ExternalLikeElementName - SP10 Task
                    //Reading currently using DOM API 
                    // RepositoryXmlParserHelper.parseValueHelpForAttributeWithDomAPI(viewNode, reader);
 
                    // var mappingSkippedNodes = reader.skippedNodes;
                    attributes.mappingSkippedNodes = reader.skippedNodes;
                    reader.skipChildren().next().moveUp();
                }
                return attributes;
            },
 
            parseCalculatedAttribute: function(reader, viewNode, allAttributes) {
                var attributes;
                // singleElementAttributes = {};
 
                if (reader.tryMoveTo("calculatedAttribute")) {
                    attributes = {
                        order: reader.consumeAttribute("order")
                    };
 
                    attributes.simpleTypeAttributes = reader.buildAttributes({
                        semanticType: "{semanticType}"
                    });
                    // var semanticType = reader.consumeAttribute("semanticType");
                    var semanticType = attributes.simpleTypeAttributes.semanticType;
 
                    // For Calculated Attribute in logical model isDerived will always be false
                    attributes.simpleTypeAttributes.isDerived = false;
 
                    attributes.elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        hidden: "{hidden}",
                        aggregationBehavior: "none", // small case aggregationBehavior
                        descriptionColumnName: "{descriptionColumnName}",
                        key: "{key}",
                        attributeHierarchyActive: "{attributeHierarchyActive}",
                        displayAttribute: "{displayAttribute}"
                    });
                   
                    //Create element instance upfront to be used to set other properties on it, e.g; label element
                    var element;
                    var columnView = viewNode.$getContainer();
                    if (viewNode.isScriptNode()) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                    }else{   
                        // var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, true);
                    }   
 
                    attributes.elementSkippedNodes = reader.skippedNodes;
                    allAttributes.push(attributes);
 
                    reader.moveDown();
                   
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, attributes.elementAttributes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, attributes.elementAttributes);
 
                    //Calculated Attribute can have unitCurrencyAttribute
                    if (semanticType !== undefined && (semanticType === 'amount' || semanticType === 'quantity')) {
                        this.parseUnitCurrencyAttribute(reader, attributes);
                    }
 
                    /*if (attributes.elementAttributes.descriptionColumnName !== undefined) {
                        this.registerForLoadPostProcessing(reader, {
                            attribute: attributes.elementAttributes.name,
                            value: attributes.elementAttributes.descriptionColumnName
                        }, populateLabelElements);
 
                    }*/
                    if (attributes.elementAttributes.descriptionColumnName !== undefined) {
                                var populateLabelElement = function(){
                                                element.labelElement = getElementFromColumnView(columnView, attributes.elementAttributes.descriptionColumnName);
                                };
                                this.pushToLoadPostProcessingCallBackQueue(reader, populateLabelElement);
                    }
                   
                    this.processTypedObjectExternalTypeOfElement(reader, columnView, element, false);
                    this.processTypedObjectExternalTypeOfElementParameterMapping(reader, element);
                   
                    //TODO: Old way of storing descriptionColumn
 
                    // TODO: ExternalLikeElementName
                   
                    if (reader.tryMoveToIntermediate("localVariable")) {
                        var variableName = reader.consumeContent();
                        var parameter = getParameterFromColumnView(columnView, variableName);
                        if (parameter) {
                            parameter.assignedElements.add(element);
                        }
                        reader.next();
                    }
 
                    // keyCalculation tag will always be there in xml; but it would be good to call tryMoveToIntermediate()
                    // reader.moveTo("keyCalculation");
                    if (reader.tryMoveToIntermediate("keyCalculation")) {
                        attributes.simpleTypeAttributes = reader.buildAttributes({
                            primitiveType: "{datatype}",
                            length: "{length}",
                            scale: "{scale}"
                        }, attributes.simpleTypeAttributes);
                       
                       attributes.elementAttributes.expressionLanguage = reader.getAttribute("expressionLanguage");
                        reader.moveDown();
                       reader.moveToIntermediate("formula");
 
                        // attributes.elementAttributes.formula = reader.consumeContent();
                        var formula = reader.consumeContent();
                        if (formula !== undefined && formula !== null) {
                            attributes.elementAttributes.formula = formula;
                        } else {
                            attributes.elementAttributes.formula = "";
                        }
 
                        reader.skipChildren().next().moveUp().moveUp();
                    }
 
                }
                return attributes;
            },
 
            parseMeasure: function(reader, viewNode, allAttributes) {
                var mapAggregationType = function(value) {
                    return value;
                    // We will return valaue in small case as defined in enum model.AggregationBehavior; UI will render it in capital
                    // return value.toUpperCase();
                };
 
                var attributes;
 
                if (reader.tryMoveTo("measure")) {
                    attributes = {
                        order: reader.consumeAttribute("order")
                    };
                    //TODO: check semanticType is applicable for measure?
                    var semanticType = reader.consumeAttribute("semanticType");
 
                    attributes.elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        hidden: "{hidden}",
                        displayFolder: "{displayFolder}",
                        aggregationBehavior: Util.createSelector("aggregationType", mapAggregationType),
                        key: "{key}",
                        engineAggregation: "{engineAggregation}",
                        deprecated: "{deprecated}"
                    });
                    
                    if(attributes.elementAttributes.displayFolder){
                    	throwUnsupportedOperationException("Measure Display Folder");
                    }
                    
                    if(attributes.elementAttributes.engineAggregation === undefined){
                             attributes.elementAttributes.engineAggregation = attributes.elementAttributes.aggregationBehavior;
                    }
                    attributes.elementAttributes.deprecated = Util.parseBool(attributes.elementAttributes.deprecated);
                    
                    //Create element instance upfront to be used to set other properties on it, e.g; label element
                    var element;
                    if (viewNode.isScriptNode()) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                    }else{   
                        var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, true);
                    }   
                    
                    //- Measure Aggrgation Behaviour Defaulted To sum As Done In Modeler
                    if (!attributes.elementAttributes.hasOwnProperty('aggregationBehavior')) {
                        attributes.elementAttributes.aggregationBehavior = 'sum';
                    }
                    // TODO: Special logic to derive based aggregationBehavior isCalculateBeforeAggregation
 
                    attributes.simpleTypeAttributes = {};
                    if (semanticType) {
                        attributes.simpleTypeAttributes.semanticType = semanticType;
                    }
 
                    // For Measure in logical model isDerived will always be true
                    attributes.simpleTypeAttributes.isDerived = true;
 
                    attributes.elementSkippedNodes = reader.skippedNodes;
                    allAttributes.push(attributes);
 
                    reader.moveDown();
                   
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, attributes.elementAttributes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, attributes.elementAttributes);
 
                    this.parseCurrencyAndUnitConversion(reader, attributes, viewNode.$getContainer());
                   
                    //OLD Mapping Code - START
                    /*reader.tryMoveToIntermediate("measureMapping");
                    attributes.mappingAttributes = reader.buildAttributes({
                        type: "ElementMapping",
                        sourceName: "{columnName}",
                        targetName: attributes.elementAttributes.name
                    });
                    attributes.mappingSkippedNodes = reader.skippedNodes;*/
                    //OLD Mapping Code - END
                    
                    //NEW Mapping Code - START
                    if(reader.tryMoveToIntermediate("measureMapping")){
                        attributes.mappingAttributes = reader.buildAttributes({
                            type: "ElementMapping",
                            sourceName: "{columnName}",
                            targetName: attributes.elementAttributes.name
                        });
                        attributes.mappingSkippedNodes = reader.skippedNodes;
                    }else{
                        attributes.elementAttributes.hasNoMapping = true;
                    }    
                    //NEW Mapping Code - END
                    reader.skipChildren().next().moveUp();
                }
                return attributes;
            },
 
            parseCalculatedMeasure: function(reader, viewNode, allAttributes) {
                var mapAggregationType = function(value) {
                    return value;
                    // We will return valaue in small case as defined in enum model.AggregationBehavior; UI will render it in capital
                    // return value.toUpperCase();
                };
 
                var attributes;
                // singleElementAttributes = {};
                if (reader.tryMoveTo("measure")) {
                    attributes = {
                        order: reader.consumeAttribute("order")
                    };
                    //TODO: check semanticType is applicable for measure?
                    var semanticType = reader.consumeAttribute("semanticType");
                    // var measureType = reader.consumeAttribute("measureType"); // will be derived from semantic type
                    var isCounter = reader.consumeAttribute("calculatedMeasureType") === "counter";
                    attributes.elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        hidden: "{hidden}",
                        displayFolder: "{displayFolder}",
                        aggregationBehavior: Util.createSelector("aggregationType", mapAggregationType),
                        primitiveType: "{datatype}",
                        length: "{length}",
                        scale: "{scale}",
                        key: "{key}",
                        aggregatable: "{aggregatable}",
                        engineAggregation: "{engineAggregation}"
                    });
                    attributes.elementAttributes.aggregatable = RepositoryXmlParserHelper.getBooleanFromString(attributes.elementAttributes.aggregatable);
                   
                     // Extra logic to conver CalculatedMeasure's aggregationBehavior from sum or count to Formula
                    if (attributes.elementAttributes.aggregationBehavior) {
                        if(attributes.elementAttributes.aggregatable === false)
                            attributes.elementAttributes.aggregationBehavior = "formula";
                    }
                     if(attributes.elementAttributes.engineAggregation === undefined){
                             attributes.elementAttributes.engineAggregation = attributes.elementAttributes.aggregationBehavior;
                    }
                    //Create element instance upfront to be used to set other properties on it, e.g; label element
                    var element;
                    if (viewNode.isScriptNode()) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                    }else{   
                        var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, true);
                    }   
 
                    attributes.simpleTypeAttributes = {};
                    RepositoryXmlParserHelper.populateSimpleTypeAttributesFromElementAttributes(attributes.elementAttributes, attributes.simpleTypeAttributes);
                    // For Calculated Measure in logical model isDerived will always be false
                    attributes.simpleTypeAttributes.isDerived = false;
                   
                   
                    // TODO: Also consider isCalculateBeforeAggregation while deriving aggregationBehavior to make code more generic
 
                    if (semanticType) {
                        attributes.simpleTypeAttributes.semanticType = semanticType;
                    }
 
                    attributes.elementSkippedNodes = reader.skippedNodes;
                    allAttributes.push(attributes);
 
                    reader.moveDown();
                   
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, attributes.elementAttributes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, attributes.elementAttributes);
 
                    this.parseCurrencyAndUnitConversion(reader, attributes, viewNode.$getContainer());
                    if(!isCounter){
                        attributes.elementAttributes.measureType = vModel.MeasureType.CALCULATED_MEASURE; 
                    }
 
                    if (isCounter) {
                        attributes.elementAttributes.measureType = vModel.MeasureType.COUNTER;
                        var counterData = [];
                        counterData.name = attributes.elementAttributes.name;
                        counterData.attributes = [];
                        if (reader.tryMoveToIntermediate("exceptionAggregation")) {
                            var exceptionAggregationType = reader.getAttribute("exceptionAggregationType");
                            if (exceptionAggregationType !== null && exceptionAggregationType !== undefined && exceptionAggregationType === "countDistinct") {
                                attributes.elementAttributes.exceptionAggregationBehavior = vModel.ExceptionAggregationBehavior.COUNT_DISTINCT;
                           }
                            if (reader.tryMoveDown()) {
                                while (reader.tryMoveTo("attribute")) {
                                    counterData.attributes.push({
                                        attributeName: reader.getAttribute("attributeName"),
                                        dimensionUri: reader.getAttribute("dimensionUri"),
                                        skippedNodes: reader.skippedNodes
                                    });
                                    reader.next();
                                }
                                reader.moveUp();
                            }
                        }
                        this.registerForLoadPostProcessing(reader, counterData, function(columnView, data) {
                            var attributes = data.attributes;
                            var counterElement = getElementFromColumnView(columnView, data.name);
                            if (counterElement) {
                                var exceptionAggregationStep = counterElement.createExceptionAggregationStep();
                                for (var i = 0; i < attributes.length; i++) {
                                    var element;
                                    var isStarJoin = false;
                                    if(attributes[i].dimensionUri){
                                        var fqName = FullQualifiedName.createByResourceURI(attributes[i].dimensionUri);
                                        var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                                        element =  getElementFromsharedEntity(sharedEntity, attributes[i].attributeName);
                                        isStarJoin = true;
                                    }else{
                                        element = getElementFromColumnView(columnView, attributes[i].attributeName);
                                    }
                                    exceptionAggregationStep.skippedNodes = attributes[i].skippedNodes;
                                    if (element && isStarJoin) {
                                        // exceptionAggregationStep.referenceElements.add(element);
                                        var entity = element.$getContainer();
                                        fqName = entity.getFullyQualifiedName();
                                        var key = fqName + "." + element.name;
                                        exceptionAggregationStep.referenceElements.add(key, element);
                                    }else{
                                        exceptionAggregationStep.referenceElements.add(element);
                                    }
                                }
                            }
                        });
                        reader.next();
                    }
                   
                    if(reader.tryMoveToIntermediate("formula")){
                        var formula = reader.consumeContent();
                        if (formula !== undefined && formula !== null) {
                            attributes.elementAttributes.formula = formula;
                        } else {
                            attributes.elementAttributes.formula = "";
                        }
                    }else {
                        if(isCounter){
                            attributes.elementAttributes.formula = "1";
                        }else{
                            attributes.elementAttributes.formula = "";
                        }   
                    }
                   
                    reader.skipChildren().next().moveUp();
                }
                return attributes;
            },
 
            parseRestrictedMeasure: function(reader, viewNode, allAttributes) {
                var mapAggregationType = function(value) {
                    return value;
                };
 
                var attributes;
                if (reader.tryMoveTo("measure")) {
                    attributes = {
                        order: reader.consumeAttribute("order")
                    };
                    attributes.elementAttributes = reader.buildAttributes({
                        name: "{id}",
                        hidden: "{hidden}",
                        baseMeasure: "{baseMeasure}",
                        displayFolder: "{displayFolder}",
                        aggregationBehavior: Util.createSelector("aggregationType", mapAggregationType)
                    });
                   
                    //Create element instance upfront to be used to set other properties on it, e.g; label element
                    var element;
                    if (viewNode.isScriptNode()) {
                        element = viewNode.elements.get(attributes.elementAttributes.name);
                    }else{   
                        var columnView = viewNode.$getContainer();
                        element = this._getDefaultNodeElementInstanceByElementName(columnView, attributes.elementAttributes.name, true);
                    }   
 
                    attributes.elementAttributes.measureType = vModel.MeasureType.RESTRICTION;
 
                    attributes.simpleTypeAttributes = {};
                    // For Restricted Measure in logical model isDerived will always be true since Restricted Measure derives datatype from its base measure
                    attributes.simpleTypeAttributes.isDerived = true;
 
                    attributes.elementSkippedNodes = reader.skippedNodes;
                    allAttributes.push(attributes);
 
                    reader.moveDown();
                   
                    // parseDescriptions
                    sharedmodel.parseDescriptions(reader, attributes.elementAttributes);
                    RepositoryXmlParserHelper.createEndUserTextsIfRequired(element, attributes.elementAttributes);
 
                    this.parseCurrencyAndUnitConversion(reader, attributes, viewNode.$getContainer());
 
                    var restrictedMeasureData = [];
                    restrictedMeasureData.name = attributes.elementAttributes.name;
                    restrictedMeasureData.restrictions = [];
                    while (reader.tryMoveTo("restriction")) {
                        if (reader.tryMoveDown()) {
                            var restrictions = [];
                            var index = 0;
                            while(reader.tryMoveTo("filter")) {
                                // var restriction = {};
                                var restriction = new Object();
                                var parsingMapper = function(value) {
                                    return reader.removePrefix(sharedmodel.NameSpace.PRIVILEGE, value);
                                };
                                var filterAttributes = reader.buildAttributes({
                                    type: Util.createXsiSelector("type", parsingMapper),
                                    attributeName: "{attributeName}"
                                });
                                if(filterAttributes && filterAttributes.attributeName){
                                    restriction.elementName = filterAttributes.attributeName;
                                }   
                                if (reader.tryMoveDown()) {
                                    restriction.valueFilters = [];
                                    while (reader.tryMoveTo("valueFilter")) {
                                        var valueFilter = sharedmodel.parseValueFilter(reader);
                                        restriction.valueFilters.push(valueFilter);
                                        reader.next();
                                    }
                                    reader.moveUp();
                                }
                                reader.next();
                                restrictions.push(restriction);
                            }
                            if (reader.tryMoveTo("attributeName")) {
                                // restriction.elementName = reader.consumeContent();
                                var elementName = reader.consumeContent();
                            }
                            if (reader.tryMoveTo("dimensionUri")) {
                                var dimensionUri = reader.consumeContent();
                                // restriction.elementName = filterAttributes.attributeName;
                                for(var index = 0; index < restrictions.length; index++){
                                    var restrictionLocal = restrictions[index];
                                    restrictionLocal.dimensionUri = dimensionUri;
                                }
                            }
                            reader.moveUp();
                        }
                        // restrictedMeasureData.restrictions.push(restriction);
                        for(var index = 0; index < restrictions.length; index++){
                            var restrictionLocal = restrictions[index];
                            restrictedMeasureData.restrictions.push(restrictionLocal);
                        }
                        reader.next();
                    }
                    if (attributes.elementAttributes.baseMeasure) {
                        restrictedMeasureData.baseMeasure = attributes.elementAttributes.baseMeasure;
                    }
                    if (reader.tryMoveToIntermediate("restrictionExpression")) {
                        restrictedMeasureData.restrictionExpression = reader.getContent();
 
                    }
                    reader.moveUp();
                    this.registerForLoadPostProcessing(reader, restrictedMeasureData, function(columnView, data) {
                        var restrictions = data.restrictions;
                        var restrictedMeasureElement = getElementFromColumnView(columnView, data.name);
                        if (restrictedMeasureElement) {
                            for (var i = 0; i < restrictions.length; i++) {
                                var element;
                                if(restrictions[i].dimensionUri === undefined){
                                    element = getElementFromColumnView(columnView, restrictions[i].elementName);
                                }else{
                                    var fqName = FullQualifiedName.createByResourceURI(restrictions[i].dimensionUri);
                                    // element =  getElementFromEntity(columnView, fqName, restrictions[i].elementName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix())); 
                                    var sharedEntity = getEntity(columnView, fqName, RepositoryXmlParserHelper.mapRepositoryTypeToEntityType(fqName.getSuffix()));
                                    element =  getElementFromsharedEntity(sharedEntity, restrictions[i].elementName);
                                }
                                if (restrictedMeasureElement && element) {
                                    var restriction = restrictedMeasureElement.createRestriction({
                                        type: "AttributeFilter"
                                    }, restrictions[i].skippedNodes);
                                    var attributes = [];
                                    attributes.formula = restrictions[i].elementName;
                                    restrictedMeasureElement.createCalculationDefinition(attributes);
                                    restriction.element = element;
                                    for (var j = 0; j < restrictions[i].valueFilters.length; j++) {
                                        restriction.valueFilters.add(restrictions[i].valueFilters[j]);
                                    }
                                }
                            }
                            if (data.baseMeasure){                            	
                                //restrictedMeasureElement.createCalculationDefinition().formula = removeHashFromString(data.baseMeasure);
                                if(columnView.schemaVersion < 3.0){
                                	data.baseMeasure = removeHashFromString(data.baseMeasure , columnView);
                            	}
                                restrictedMeasureElement.createCalculationDefinition().formula = data.baseMeasure;
                            }   
                            if (data.restrictionExpression) {
                                var restrictionExpression = restrictedMeasureElement.createRestrictionExpression();
                                restrictionExpression.formula = data.restrictionExpression;
 
                            }
                        }
                    });
                }
 
                return attributes;
            },
 
            parseShape: function(reader, columnView) {
                var matchShapes = function(node) {
                    // ignore shape information from mapping panel
                    var modelObjectNameSpace = node.getAttribute("modelObjectNameSpace");
                    // var modelObjectNameSpace = node.consumeAttribute("modelObjectNameSpace");
                    return modelObjectNameSpace === "MeasureGroup" || modelObjectNameSpace === "CalculationView";
                };
 
                while (reader.tryMoveTo("shape", null, matchShapes)) {
                    var viewNodeName = reader.consumeAttribute("modelObjectName");
                    var modelObjectNameSpace = reader.consumeAttribute("modelObjectNameSpace");
                    var viewNode;
                    if (modelObjectNameSpace === "MeasureGroup") {
                        viewNode = columnView.getDefaultNode();
                    } else {
                        viewNode = columnView.viewNodes.get(viewNodeName);
                    }
                    var layoutAttributes = reader.buildAttributes({
                        expanded: "{expanded}"
                    });
 
                    reader.moveDown().moveToIntermediate("upperLeftCorner");
                    reader.buildAttributes({
                        xCoordinate: Util.createIntSelector("x"),
                        yCoordinate: Util.createIntSelector("y")
                    }, layoutAttributes);
                    reader.skipChildren().next();
 
                    if (reader.tryMoveToIntermediate("rectangleSize")) {
                        reader.buildAttributes({
                            height: Util.createIntSelector("height"),
                            width: Util.createIntSelector("width")
                        }, layoutAttributes);
                        reader.skipChildren().next();
                    }
                    reader.moveUp();
 
                    return viewNode.createLayout(layoutAttributes, reader.skippedNodes);
                }
            },
 
            doLoadPostProcessing: function(reader, columnView) {
                var x;
                for (var i = 0; i < reader.context.postProcessingRegistry.callback.length; i++) {
                    reader.context.postProcessingRegistry.callback[i].method(columnView, reader.context.postProcessingRegistry.callback[i].data);
                }
                return columnView;
            },
 
            //Callback function should take objectToRemember as arguement and column View
            registerForLoadPostProcessing: function(reader, callbackData, callbackMethod) {
                if (reader.context.postProcessingRegistry.callback === null || reader.context.postProcessingRegistry.callback === undefined) {
                    reader.context.postProcessingRegistry.callback = [];
                }
                var callback = [];
                callback.method = callbackMethod;
                callback.data = callbackData;
                reader.context.postProcessingRegistry.callback.push(callback);
            },
           
            pushToLoadPostProcessingCallBackQueue: function(reader, callbackMethod) {
                if (reader.context.loadPostProcessingCallBackQueue.callback === null || reader.context.loadPostProcessingCallBackQueue.callback === undefined) {
                    reader.context.loadPostProcessingCallBackQueue.callback = [];
                }
                var callback = [];
                callback.method = callbackMethod;
                reader.context.loadPostProcessingCallBackQueue.callback.push(callback);
            },
           
            excecuteLoadPostProcessingCallBackQueue: function(reader, columnView) {
                for (var i = 0; i < reader.context.loadPostProcessingCallBackQueue.callback.length; i++) {
                    reader.context.loadPostProcessingCallBackQueue.callback[i].method(columnView);
                }
                return columnView;
            },
 
            //Methods to propagate DataType To DefaultNode - Start
            //TODO: Use ReferenceManager to propagate DataType To DefaultNode - 
            /*propagateDataTypeToDefaultNode: function(columnView) {
                //var entities = columnView.$getContainer()._entities;
                // var referenceManager = modelbase.ReferenceManager;
                // refs = referenceManager.getReferencesTo(entities[i], true);
                });
            },*/
            propagateDataTypeToDefaultNode: function(columnView) {
                for (var i = 0; i < columnView.viewNodes.count(); i++) {
                    var viewNode = columnView.viewNodes.getAt(i);
                    this._propagateDataTypeToViewNode(viewNode);
 
                    // Special Handling for Restricted Measure of DefaultNode
                    if (viewNode.isDefaultNode()) {
                        var restrictedElements = [];
                        //Test code to check count() and size() of elements collection
                        var count = viewNode.elements.count();
                        var size = viewNode.elements.size();
                        for (var j = 1; j <= viewNode.elements.count(); j++) {
                            var element = viewNode.elements.getAt(j);
                            if (element && element.measureType === vModel.MeasureType.RESTRICTION) {
                                restrictedElements.push(element);
                            }
                        }
                        if (restrictedElements.length > 0) {
                            for (var k = 0; k < restrictedElements.length; k++) {
                                var restrictedElement = restrictedElements[k];
                                var baseMeasureElementInlineType;
                                if (restrictedElement && restrictedElement.calculationDefinition) {
                                    var baseMeasureName = restrictedElement.calculationDefinition.formula;
                                    var baseMeasureElement = viewNode.elements.get(baseMeasureName);
                                    baseMeasureElementInlineType = baseMeasureElement.inlineType;
                                }
                                if (baseMeasureElementInlineType) {
                                    var simpleTypeAttributes = {
                                        primitiveType: baseMeasureElementInlineType.primitiveType,
                                        length: baseMeasureElementInlineType.length,
                                        scale: baseMeasureElementInlineType.scale
                                    };
                                    restrictedElement.createOrMergeSimpleType(simpleTypeAttributes);
                                }
                            }
 
                        }
                    }
                }
            },
 
            _propagateDataTypeToViewNode: function(viewNode) {
                var that = this;
                viewNode.elements.foreach(function(element) {
                    var inlineType = that._getInlineTypeFromSource(element);
                    if (inlineType) {
                        var simpleTypeAttributes = {
                            primitiveType: inlineType.primitiveType,
                            length: inlineType.length,
                            scale: inlineType.scale
                        };
                        element.createOrMergeSimpleType(simpleTypeAttributes);
                    }
                });
            },
 
            _getInlineTypeFromSource: function(element) {
                //For Proxy element we can not get datatype
                if (!(element.isProxy) && element.$getContainer() !== null && element.$getContainer() instanceof vModel.Entity) {
                    return element.inlineType;
                } else if (element.$getContainer() !== null && element.$getContainer() instanceof vModel.ViewNode) {
                    var viewNode = element.$getContainer();
                    var elementInput;
                    var that = this;
                    var mapping;
 
                    // Below two variables are to handle constant Element In UnionNode used in constantMapping
                    var isUnionNode = false;
                    var constantElementInUnionNode;
                    
                    // Special handling for Graph Node Elements
                    if(viewNode.isGraphNode()){
                        var sourceElement = viewNode.workspace.elements.get(element.name);
                        return sourceElement.inlineType;
                    }                    
 
                    for (var i = 0; i < viewNode.inputs.count(); i++) {
                        // var mapping = viewNode.inputs.getAt(i).mappings.get(element.name);
                        var findElementMapping = that.$findElementMapping.bind(viewNode.inputs.getAt(i), element.name);
                        var mapping = findElementMapping();
                        if (mapping !== undefined && mapping.sourceElement !== undefined) {
                            elementInput = viewNode.inputs.getAt(i);
                            break;
                        } else if (mapping !== undefined && mapping.sourceElement === undefined && mapping.targetElement !== undefined) {
                            // It will only happen for constant Element In UnionNode used in constantMapping;
                            // in this case its inlineType is not derived from any source element rather it will have its own inlineType stored with it
                            isUnionNode = true;
                            var constantElementInUnionNode = mapping.targetElement;
                        }
                    }
 
                    if (elementInput) {
                        var elementInputSource = elementInput.getSource();
                        if (elementInputSource) {
                            var sourceElement = elementInputSource.elements.get(element.name);    
                            
                            //I066990: if it is calculated column, return it directly as this would have its own datatype
                            if (sourceElement && sourceElement.calculationDefinition !== undefined && sourceElement.calculationDefinition.formula !== undefined && sourceElement.calculationDefinition.formula !== null) {
                                return sourceElement.inlineType;
                            }             
                            
                            if (sourceElement) {
                                return that._getInlineTypeFromSource(sourceElement);
                            } else {
                                // It will only happen for constant Element In UnionNode which are mapped to some source elemnt
                                return mapping.sourceElement.inlineType;
                            }
                        }
                    } else if (isUnionNode && constantElementInUnionNode) {
                        return constantElementInUnionNode.inlineType;
                    }
 
                }
            },
 
            $findElementMapping: function(elementName) {
                // return this.mappings.get(element.name);
                for (var i = 0; i < this.mappings.count(); i++) {
                    var mapping = this.mappings.getAt(i);
                    if (mapping.targetElement !== undefined && mapping.targetElement !== null && mapping.targetElement.name === elementName) {
                        return mapping;
                    }
                }
            }
            //- Methods to propagate DataType To DefaultNode - End
 
        };
 
        return RepositoryXmlParser;
    });
