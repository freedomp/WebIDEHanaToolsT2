/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "./model",
        "../view/CDSEditorUtil",
        "commonddl/commonddlNonUi",
        "hanaddl/hanaddlNonUi",
        "hanaddl/hanav5/CdsDdlParserResolver",
        "../../hdbcalculationview/viewmodel/ModelProxyResolver"

        ],
        function(
        		viewmodel,
        		CDSEditorUtil,
        		commonddlNonUi,
        		hanaddlNonUi,
        		CdsDdlParserResolver,
        		ModelProxyResolver

        ) {
	"use strict";

	var Parser = {

			parseValue: function(value, model, _context) {
				//Generate AST model
				var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

				var version = parserFactoryApi.versionsFactory.versionLast;
				var resolver = parserFactoryApi.createResolver(version,"/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbdd");
				var parser = parserFactoryApi.createParser(version);

				var astModel = parser.parseAndGetAst2(resolver, value);

				model.astModel = astModel;
				model.parser = parser;
				model.resolver = resolver;

				// Process AST model

				var statements = astModel.statements;
				var usingClauseArray = [];

				for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
					var stmt = statements[stmtCount];
					if (stmt instanceof commonddlNonUi.NamespaceDeclarationImpl) {
						model.namespace = stmt.getName();
					}
					else if (stmt instanceof commonddlNonUi.UsingDirectiveImpl) {
						//create proxy objects from using clause
						var cdsArtifactNamespace = stmt.getNameWithNamespaceDelimeter();
						var cdsArtifactSchemaName = cdsArtifactNamespace.substring(0, cdsArtifactNamespace.indexOf("::"));
						var cdsArtifactFullName = cdsArtifactNamespace.substring(cdsArtifactNamespace.indexOf("::") + 2);
					
						var alias;
						if(stmt.getAlias()){
							alias = stmt.getAlias().getM_lexem();
						}
						/*var props = {
								isProxy: true,
								id: cdsArtifactFullName,
								name: cdsArtifactFullName,
								alias: alias,
								schemaName : cdsArtifactSchemaName
						};
						var extImportedArtifact = model.createOrMergeExternalEntity(props);*/
						
						usingClauseArray.push(stmt);
					}
					else if (stmt instanceof commonddlNonUi.EntityDeclarationImpl) {
						var entity = this.parseEntity(model, stmt, model, usingClauseArray);
						entity.isRoot = true;
						//entity.$$model = model;
					}
					else if (stmt instanceof commonddlNonUi.ContextDeclarationImpl) {
						var context = this.parseContext(model, stmt, undefined, usingClauseArray);
						context.isRoot = true;
						//context.$$model = model;
					}
				}

				//callback function for updating SJON model when proxies are resolved
				var updateJSONModel = function(event) {
					var source = event;
				};

				//just before returning, resolve all proxies
				ModelProxyResolver.ProxyResolver.resolve(model, _context, updateJSONModel);

				return model;
			},

			parseEntity: function(model, object, rootModel, usingClauseArray) {
				var schemaName = "test";
				for (var i = 0; i < object.annotationList.length; i++) {
					var annotation = object.annotationList[0];
					var nameToken = annotation.getNameTokenPath()[0];
					if (nameToken && nameToken.getM_lexem() === "Schema" && annotation.getValue().getValueToken()) {
						schemaName = annotation.getValue().getValueToken().getM_lexem();
						schemaName = schemaName.substring(1, schemaName.lastIndexOf("'"));
					}
				}
				var entityAttributes = {
						id: rootModel.namespace+"::"+object.getName(),
						name: object.getName(),
						schemaName: schemaName
				};

				//var entity = model.createEntity(entityAttributes);
				var entity = model.createOrMergeEntity(entityAttributes);

				//entity.astNode = object;
				var elements = object.getElements();
				for (var elementCount = 0; elementCount < elements.length; elementCount++) {
					var object = elements[elementCount];
					if(object.anonymousType){
						//DO NOT PARSE UNSUPPORTED CDS FEATURES AS IN SP11
					} else{
						if (object instanceof commonddlNonUi.AttributeDeclarationImpl) {
							this.parseElement(entity, object, rootModel);
						} else if (object instanceof commonddlNonUi.AssociationDeclarationImpl) {
							var association = this.parseAssociation(entity, object, rootModel, usingClauseArray);
						}
					}

				}

				return entity;

			},

			parseElement: function(entity, object, rootModel) {

				var defaultValue;
				if(object.getDefault()){
					defaultValue = "";
					if(object.getDefault() instanceof commonddlNonUi.PathExpressionImpl){
						var pathEntries = object.getDefault().getPathEntries();
						for(var k = 0; k < pathEntries.length; k++){
							defaultValue = defaultValue + pathEntries[k].getNameToken().getM_lexem();
						}
					} else if(object.getDefault() instanceof commonddlNonUi.LiteralExpressionImpl){
						defaultValue = defaultValue + object.getDefault().getTokenToken().getM_lexem();
					}
				}


				//place holder for null keyword
				var nullable;
				if (object.getNullableToken() && !object.getNotToken()) {
					nullable = true;
				}

				var element = entity.createElement({
					name: object.getName(),
					key: object.getKeyToken() ? true : false,
							//notNull: (object.getNullableToken() === null || object.getNullableToken() === undefined) ? false : true,
							defaultValue: defaultValue,
							nullable: nullable,
							not: object.getNotToken() ? true : false,
									sourceEntity: entity
				});

				var dataType = object.getTypeId();
				if (dataType.indexOf("(") !== -1) { // removing length and scale
					dataType = dataType.substring(0, dataType.indexOf("("));
				}

				var simpleTypeAttributes = {
						//primitiveType: primitiveType,
						length: object.getLengthToken() ? object.getLengthToken().m_lexem : undefined,
								scale: object.getDecimalsToken() ? object.getDecimalsToken().m_lexem : undefined
				};

				var isDataTypeInternal = true;

				//find if datatype is primitve or internal struct type  or external struct type
				if (CDSEditorUtil.isPrimitiveType(dataType)) {
					simpleTypeAttributes.primitiveType = dataType;
					simpleTypeAttributes.structureType = undefined;
					simpleTypeAttributes.externalStructureType = undefined;
				} else {
					/*var dataTypeFullPath = rootModel.root.name + "/" + dataType;
					var dataTypeName = dataType.substring(dataType.lastIndexOf(".") + 1);
					var astNode = CDSEditorUtil.getCDSNodeASTModel(rootModel.astModel, dataTypeFullPath, dataTypeName);

					if(astNode instanceof commonddlNonUi.TypeDeclarationImpl){
						//this means it is present internally
						isDataTypeInternal = true;
						simpleTypeAttributes.structureType = dataType;
					} else{
						isDataTypeInternal = false; //this means we could not find the strcuture type internally, hence it is external
						simpleTypeAttributes.externalStructureType = dataType;
					}*/

					//OR

					var usingClauses = CDSEditorUtil.getUsingClausesArray(rootModel.astModel);
					var hasFound = false;
					var isDuplicateImport = false;
					for(var i = 0; i < usingClauses.length ; i++){
						var hasAlias = false;
						var currentClause = usingClauses[i];
						var importedStructTypeString;
						if(currentClause.indexOf("as") !== -1){
							importedStructTypeString = currentClause.substring(currentClause.indexOf("as") + 2).trim();
						} else{
							importedStructTypeString = currentClause.substring(currentClause.lastIndexOf(".")  + 1).trim();
						}

						if(hasFound && importedStructTypeString === dataType){
							//error condition where there are duplicate identifiers for imported struct types. In that case, nothing will be shown in 'type' dropdown against this element
							isDuplicateImport = true;
							isDataTypeInternal = false;
							simpleTypeAttributes.primitiveType = undefined;
							simpleTypeAttributes.structureType = undefined;
							simpleTypeAttributes.externalStructureType = undefined;

						} else{
							if(importedStructTypeString === dataType){
								hasFound = true;
								isDataTypeInternal = false; //this means we could not find the strcuture type internally, hence it is external
								simpleTypeAttributes.externalStructureType = currentClause;
								simpleTypeAttributes.structureType = undefined;
							} 
						}
					}

					if(!hasFound){
						var isInternalStructType = CDSEditorUtil.isInternalStructuredType(rootModel.root, dataType);
						if(isInternalStructType){
							isDataTypeInternal = true;
							simpleTypeAttributes.structureType = dataType;
							simpleTypeAttributes.externalStructureType = undefined;
						} else{
							//if it is not found in list of internal struct types also, then error condition where, using clause doe snot exist for this external struc type
							isDataTypeInternal = false;
							simpleTypeAttributes.primitiveType = undefined;
							simpleTypeAttributes.structureType = undefined;
							simpleTypeAttributes.externalStructureType = undefined;
						}
					}
				}

				element.createOrMergeSimpleType(simpleTypeAttributes);

				/*if(!isDataTypeInternal){
					//proxy objects are created already
				} else{
					element.createOrMergeSimpleType(simpleTypeAttributes);
				}*/

				return element;
			},

			parseAssociation: function(entity, object, rootModel, usingClauseArray) {
				var srcCardinality;
				if (object.getSourceMaxCardinalityToken()) {
					srcCardinality = object.getSourceMaxCardinalityToken().getM_lexem();
				} else {
					srcCardinality = "";
				}

				var cardinality;
				if (object.getMinToken() && object.getMaxToken()) {
					cardinality = "[" + object.getMinToken().getM_lexem() + ".." + object.getMaxToken().getM_lexem() + "]";
				}

				var attributes = []; 
				var keys = object.getKeys();
				for (var j = 0; j < keys.length; j++) {
					var keyName = keys[j].getKeyName();
					var aliasToken = keys[j].getAliasToken();
					var alias = "";
					if (aliasToken) {
						alias = aliasToken.getM_lexem();
					}
					attributes.push({
						name: keyName,
						alias: alias
					});
				}

				var assoType;
				var onCondition = "";
				var operator;
				if (object.getOnCondition()) {
					assoType = "Unmanaged";
					onCondition = CDSEditorUtil.generateOnCondition(object);
				} else {
					assoType = "Managed";
					operator = "";
				}

				var targetEntity;
				var internal = true;
				
				var targetEntityName = object.getTargetEntityName();
				var targetEntityFullPath = "";
				if(object.targetEntityPath && object.targetEntityPath.pathEntries){
					for(var i = 0; i < object.targetEntityPath.pathEntries.length; i++){
						if(i !== 0){
							targetEntityFullPath = targetEntityFullPath + ".";
						}
						var pathEntry = object.targetEntityPath.pathEntries[i];
						targetEntityFullPath = targetEntityFullPath + pathEntry.getNameToken().getM_lexem();
					}
				}


				var fullNameSpaceForTargetEntity = CDSEditorUtil.getFullNameSpaceForTargetEntity(usingClauseArray, targetEntityFullPath);
				if(!fullNameSpaceForTargetEntity){
					internal = true;
				} else {
					internal = false;
				}
				
				if (internal) {
					//if internal entity, create proxy object as the entity may have not been parsed till parsing of current association
					var props = {
							isProxy: true,
							id: rootModel.namespace + "::" + rootModel.root.name + "." + targetEntityFullPath, //namspace::rootContextname.entityName
							name: targetEntityName,
							alias: "",
							schemaName : rootModel.namespace
					};
					targetEntity = rootModel.createOrMergeExternalEntity(props);

				} else {
					//if external entity
					var props = {
							isProxy: true,
							id: fullNameSpaceForTargetEntity,
							name: "",//extract out of fullNameSpaceForTargetEntity,
							alias: "blah"
					};
					var extEntity = targetEntity = rootModel.createOrMergeExternalEntity(props);
				}

					//TODO: do we need to add proxy elements and associations also to this external entity?? if yes, uncomment following
					/*var keys = object.getKeys();
					for (var j = 0; j < keys.length; j++) {
						var keyName = keys[j].getKeyName();
						var aliasToken = keys[j].getAliasToken();
						var alias = "";
						if (aliasToken) {
							alias = aliasToken.getM_lexem();
						}

						var elemProps = {
								name: keyName,
								sourceEntity: extEntity,
								isProxy: true
						};

						var element = extEntity.createElement(elemProps); 
						//TODO: how to differentiate creation of proxy elemenst from proxy associations, cuz i just have name of keys of curetn asociation
					}
				}*/

				//now create association object
				var association = entity.createAssociation({
					name: object.getName(),
					srcCardinality: srcCardinality,
					cardinality: cardinality,
					targetEntityName: object.getTargetEntityName(),
					selectedAttributes: attributes,
					sourceEntity: entity,
					targetEntity: targetEntity,
					type: assoType,
					onCondition: onCondition,
					operator: operator
				});
				//TODO: add more association properties
				return association;
			},

			parseContext: function(model, object, rootModel, usingClauseArray) {
				if (!rootModel) {
					rootModel = model;
				}
				var schemaName = "test";
				for (var i = 0; i < object.annotationList.length; i++) {
					var annotation = object.annotationList[0];
					var nameToken = annotation.getNameTokenPath()[0];
					if (nameToken.getM_lexem() === "Schema" && annotation.getValue().getValueToken()) {
						schemaName = annotation.getValue().getValueToken().getM_lexem();
						schemaName = schemaName.substring(1, schemaName.lastIndexOf("'"));
					}
				}
				var contextAttributes = {
						id: rootModel.namespace+"::"+object.getName(),
						name: object.getName(),
						schemaName: schemaName
				};
				
				var context = model.createContext(contextAttributes);
				var statements = object.statements;

				if (statements) {
					for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
						var stmt = statements[stmtCount];
						if (stmt instanceof commonddlNonUi.EntityDeclarationImpl) {
							var entity = stmt;
							this.parseEntity(context, entity, rootModel, usingClauseArray);
						} else if (stmt instanceof commonddlNonUi.ContextDeclarationImpl) {
							this.parseContext(context, stmt, rootModel, usingClauseArray);
						} else if (stmt instanceof commonddlNonUi.ViewDefinitionImpl) {
							this.parseView(context, stmt, rootModel, usingClauseArray);
						} else if (stmt instanceof commonddlNonUi.TypeDeclarationImpl) {
							this.parseType(context, stmt, rootModel, usingClauseArray);
						}
					}
				}
				//context.$finishLoading();
				//context.astNode = object;
				/*var elements = object.getElements();
				for (var elementCount = 0; elementCount < elements.length; elementCount++) {
					this.parseElement(context, elements[elementCount]);
				}*/
				return context;
			},

			parseView: function(model, object) {
				var viewAttributes = {
						name: object.getName()
				};
				var view = model.createView(viewAttributes);
				return view;
			},

			parseType : function(model, object){
				var typeAttributes = {
						name: object.getName()
				};

				var type = model.createType(typeAttributes);

				var elements = object.getElements();
				for (var elementCount = 0; elementCount < elements.length; elementCount++) {
					var object = elements[elementCount];
					if (object instanceof commonddlNonUi.AttributeDeclarationImpl) {
						this.parseTypeAttribute(type, object);
					} 
				}

				return type;
			},

			parseTypeAttribute: function(model, object) {
				var name = object.getNameToken().getM_lexem();
				var type = object.getTypeIdPath().pathEntries[0].getNameToken().getM_lexem();
				var length = object.getLengthToken() ? object.getLengthToken().getM_lexem() : undefined;
				var typeAttributeParams = {
						name: name,
						dataType: type,
						length: length
				};
				var typeAttr = model.createTypeAttribute(typeAttributeParams);
				return typeAttr;
			}
	};

	return Parser;
});