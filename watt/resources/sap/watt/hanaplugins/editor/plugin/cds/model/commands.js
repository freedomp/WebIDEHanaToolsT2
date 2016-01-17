/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../hdbcalculationview/base/modelbase",
        "./model",
        "commonddl/commonddlNonUi",
        //"../../../../lib/rndrt/rnd", 
        "rndrt/rnd",
        "../view/CDSEditorUtil",
        "../../hdbcalculationview/viewmodel/services/ViewModelService"
        //"/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/services/ViewModelService"
        ],
        function(
        		modelbase,
        		viewmodel,
        		commonddlNonUi,
        		rAndD,
        		CDSEditorUtil,
        		ViewModelService
        ) {
	"use strict";

	var ViewModelEvents = {};
	ViewModelEvents.ALL = modelbase.ModelEvents.ALL;
	ViewModelEvents.CHANGED = modelbase.ModelEvents.CHANGED;
	ViewModelEvents.NODE_SELECTED = "node_selected";
	ViewModelEvents.CONTEXT_CREATED = "context_created";
	ViewModelEvents.CONTEXT_CHANGED = "context_changed";
	ViewModelEvents.CONTEXT_DELETED = "context_deleted";
	ViewModelEvents.ENTITY_CREATED = "entity_created";
	ViewModelEvents.ENTITY_CHANGED = "entity_changed";
	ViewModelEvents.ENTITY_DELETED = "entity_deleted";
	ViewModelEvents.ELEMENT_CREATED = "element_created";
	ViewModelEvents.ELEMENT_DELETED = "element_deleted";
	ViewModelEvents.ELEMENT_MOVED = "element_moved";
	ViewModelEvents.ELEMENT_CHANGED = "element_changed";

	modelbase.ModelEvents.registerEventTypes(viewmodel.Context, {
		created: ViewModelEvents.CONTEXT_CREATED,
		changed: ViewModelEvents.CONTEXT_CHANGED,
		deleted: ViewModelEvents.CONTEXT_DELETED
	});
	modelbase.ModelEvents.registerEventTypes(viewmodel.Entity, {
		created: ViewModelEvents.ENTITY_CREATED,
		changed: ViewModelEvents.ENTITY_CHANGED,
		deleted: ViewModelEvents.ENTITY_DELETED
	});
	modelbase.ModelEvents.registerEventTypes(viewmodel.Element, {
		created: ViewModelEvents.ELEMENT_CREATED,
		deleted: ViewModelEvents.ELEMENT_DELETED,
		changed: ViewModelEvents.ELEMENT_CHANGED,
		moved: ViewModelEvents.ELEMENT_MOVED
	});

	var addToList = function(parser, resolver, /*ast object*/ listContainer, /*array*/ list, /*int*/ listIndex, /*string*/ entryString,
			onEmptyListHook) {
		var Utils = rAndD.Utils;
		var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(listContainer);
		var source = cu.getParsedSource();
		var result = null;
		if (list === null || list.length === 0) {
			//list is empty - find insertion point
			result = onEmptyListHook.invoke(listContainer, source, entryString);
		} else {
			//IndentUtil is not available in XS2
			var entries = list;
			var off = null;
			if (listIndex < entries.length) {
				off = entries[listIndex].getStartOffsetWithComments() ;
				//var indent = IndentUtil.getLineIndention(source, off);
				result = Utils.stringInsertAt(source, off, "\n" + entryString);
			} else { //out of range - add at end
				var last = entries[entries.length - 1];
				off = last.getEndOffsetWithComments() ;
				if(off === -1){
					//this means corrupted model due to some invalid entry, find end index from container's end
					off = listContainer.getEndOffsetWithComments() - 2;
					result = Utils.stringInsertAt(source, off, entryString + "\n");
				} else{
					result = Utils.stringInsertAt(source, off, "\n" + entryString);
				}
			}
		}

		var newAst = parser.parseAndGetAst3(resolver, null, result);

		cu = commonddlNonUi.AstMerger.merge(cu, newAst);

		return listContainer; // should be now updated
	};
	var findNextTokenIndexInternal = function(tokens, idx, lexem) {
		/*eslint-disable no-constant-condition*/
		while (true) {
			var t = tokens[idx];
			if (lexem === t.m_lexem) {
				return idx;
			}
			idx++;
			if (idx >= tokens.length) {
				return -1;
			}
		}
	};
	var onEmptyListHook = {};
	onEmptyListHook.invoke = function(listContainer, source, entryString) {
		var result = "";
		var idx = listContainer.getStartTokenIndex();
		var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(listContainer);
		var tokens = cu.getTokenList();
		idx = findNextTokenIndexInternal(tokens, idx, "{");
		if (idx > 0) {
			var ind = tokens[idx].m_offset;
			if (ind > 0) {
				result = rAndD.Utils.stringInsertAt(source, ind + 1, "\n " + entryString);
			}
		}
		return result;
	};

	var replaceListEntry = function(parser, resolver, /*List Entry*/ entry, /*string*/ listEntryString) {
		var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(entry);
		var source = cu.getParsedSource();
		var result = null;
		var entries;
		if (entry.eContainer() instanceof commonddlNonUi.EntityDeclarationImpl) {
			entries = entry.eContainer().getElements();
		} else if (entry.eContainer() instanceof commonddlNonUi.ContextDeclarationImpl || entry.eContainer() instanceof commonddlNonUi.CompilationUnitImpl) {
			var statements = entry.eContainer().statements;
			if (statements) {
				entries = statements;
			}
		}

		var start = entry.getStartOffsetWithComments();
		var end = entry.getEndOffsetWithComments();
		if (listEntryString === null || listEntryString.length === 0) { //aha removal
			var idx = entries.indexOf(entry);
			if (idx > 0) {
				start = commonddlNonUi.ReplaceAnnotationCommand.getLeftIndex(source, "\n", start);
			} else if (idx < entries.length - 1) {
				end = commonddlNonUi.ReplaceAnnotationCommand.getRightIndex(source, ["\n"], end);
			}
		}
		var buf = new rAndD.StringBuffer(source);
		buf.replace(start, end, listEntryString);
		result = buf.toString();

		var newAst = parser.parseAndGetAst3(resolver, null, result);
		cu = commonddlNonUi.AstMerger.merge(cu, newAst);
		cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource()); //TODO
		return cu;
	};

	var removeListEntry = function(parser, resolver, /*ListEntry*/ listEntry) {
		return replaceListEntry(parser, resolver, listEntry, "");
	};

	/*
	 * @deprecated Don't use this method any more.
	 */
	var getEntityAstNode = function(parent, entityName) {
		var entityAstNode = parent;
		if (parent instanceof commonddlNonUi.EntityDeclarationImpl && parent.getName() === entityName) {
			entityAstNode = parent;
		} else if (parent instanceof commonddlNonUi.ContextDeclarationImpl || parent instanceof commonddlNonUi.CompilationUnitImpl) {
			var statements = parent.statements;
			if (statements) {
				for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
					var stmt = statements[stmtCount];
					if (stmt instanceof commonddlNonUi.EntityDeclarationImpl && stmt.getName() === entityName) {
						entityAstNode = stmt;
						break;
					}
					if (stmt instanceof commonddlNonUi.ContextDeclarationImpl) {
						entityAstNode = getEntityAstNode(stmt, entityName);
					}
				}
			}

		}
		return entityAstNode;
	};

	/*
	 * @deprecated Don't use this method any more.
	 */
	var getEntity = function(parent, entityName) {
		var entity;
		if (parent instanceof viewmodel.Entity && parent.name === entityName) {
			entity = parent;
		} else if (parent instanceof viewmodel.Context) {
			var chilrenArray = parent.children;
			for (var i = 0; i < chilrenArray._keys.length; i++) {
				var child = chilrenArray.getAt(i);
				if (child instanceof viewmodel.Entity && child.name === entityName) {
					entity = child;
					break;
				} else if (child instanceof viewmodel.Context) {
					entity = getEntity(child, entityName);
				}
			}
		}
		return entity;
	};

	/*
	 * @deprecated Don't use this method any more.
	 */
	var getElementAstNode = function(model, entityName, elementName, entityAstNode) {
		if (!entityAstNode) {
			entityAstNode = getEntityAstNode(model.astModel, entityName);
		}
		var elementAstNode;
		var astElements = entityAstNode.getElements();
		for (var elementCount = 0; elementCount < astElements.length; elementCount++) {
			if (astElements[elementCount].getName() === elementName) {
				elementAstNode = astElements[elementCount];
			}
		}
		return elementAstNode;
	};

	var replaceString = function(parser, resolver, cu, start, end, stringValue) {
		var source = cu.getParsedSource();
		var buf = new rAndD.StringBuffer(source);
		buf.replace(start, end, stringValue);
		var result = buf.toString();

		var newAst = parser.parseAndGetAst3(resolver, null, result);
		cu = commonddlNonUi.AstMerger.merge(cu, newAst);
		cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
		return cu;
	};

	var changeElementProperties = function(model, entityName, entityAstNode, element, oldTypeProps, astNode, changedPropertyName) {
		//model, entityName, association, oldProps, changedPropertyName, astNode, newProps

		var off, source, result, newAst, start, end, buf, stringValue;
		var parser = model.parser;
		var resolver = model.resolver;

		if (!astNode) {
			var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(element);
			astNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, element.name);
		}

		var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);

		// chnage name
		if(changedPropertyName === "Name"){
			var nameToken = astNode.getNameToken();
			if (nameToken !== null && nameToken.m_lexem.length > 0 && nameToken.m_lexem !== element.name) {
				//change name 
				commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, nameToken, element.name);
			}
		}

		//change data type OR length OR scale property
		if(changedPropertyName === "DataTypeCategory" || changedPropertyName === "DataType" || changedPropertyName === "ExternalStructureType" || changedPropertyName === "Length" || changedPropertyName === "Scale"){
			var dataTypeToken;
			var astDataTypeString;
			var lengthToken;
			var decimalToken;

			if(astNode.typeIdPath !== undefined){
				dataTypeToken = astNode.getTypeIdPath().pathEntries[0].getNameToken();
				lengthToken = astNode.getLengthToken();
				decimalToken = astNode.getDecimalsToken();
				astDataTypeString = dataTypeToken.getM_lexem();

			} else{
				//this means that datatype in ast node is blank
				astDataTypeString = "";
			}


			if (lengthToken) {
				astDataTypeString += "(" + lengthToken.getM_lexem();
				if (decimalToken) {
					astDataTypeString += "," + decimalToken.getM_lexem();
				}
				astDataTypeString += ")";
			}

			var dataTypeString;
			var extTypeNameSpace;
			if (element.inlineType.primitiveType !== undefined) {
				dataTypeString = element.inlineType.primitiveType;
			} else if (element.inlineType.structureType !== undefined) {
				dataTypeString = element.inlineType.structureType;
			} else if (element.inlineType.externalStructureType !== undefined) {
				extTypeNameSpace = element.inlineType.externalStructureType;
				if(extTypeNameSpace.indexOf("as") !== -1){
					dataTypeString = extTypeNameSpace.substring(extTypeNameSpace.lastIndexOf("as") + 2).trim();
				} else{
					dataTypeString = extTypeNameSpace.substring(extTypeNameSpace.lastIndexOf(".") + 1).trim();
				}
			}

			if (element.inlineType.length) {
				dataTypeString += "(" + element.inlineType.length;
				if (element.inlineType.scale) {
					dataTypeString += "," + element.inlineType.scale;
				}
				dataTypeString += ")";
			}

			//change data type
			if (dataTypeString !== astDataTypeString) {
				if(astDataTypeString === ""){
					start = astNode.getNameToken().getEndOffset() + 3;
					end = start;
				} else{
					start = dataTypeToken.getOffset();
					end = start + astNode.getTypeId().length;
				}
				cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
				model.astModel = replaceString(parser, resolver, cu, start, end, dataTypeString);
			}

			//afterwards, add using clause decalration after namesapce
			if (changedPropertyName === "ExternalStructureType") {
				//include 'using' clause
				var stmts = cu.getStatements();
				var usingNameSpacesArray = [];
				var lastUsingStatement;
				for (var i = 0; i < stmts.length; i++) {
					var stmt = stmts[i];
					if (stmt instanceof commonddlNonUi.UsingDirectiveImpl) {
						var nameSpaceString = stmt.getNameWithNamespaceDelimeter();
						if(stmt.getAlias()){
							nameSpaceString = nameSpaceString + " as " + stmt.getAlias().getM_lexem();
						}
						usingNameSpacesArray.push(nameSpaceString);
						lastUsingStatement = stmt;
					}
				}

				if(extTypeNameSpace){
					var compareString = extTypeNameSpace.replace(/ /g, ""); //remove white spaces
					if(usingNameSpacesArray.indexOf(compareString) === -1){
						var usingClause;
						//add using clause
						if(lastUsingStatement){
							start = lastUsingStatement.getEndOffsetWithComments() + 2;
							end = start;
							usingClause = "using " + extTypeNameSpace + ";\n";

						} else{
							var nameSpaceStmt = cu.getStatements()[0];
							start = nameSpaceStmt.getEndOffset() + 2;
							end = start;
							usingClause = "using " + extTypeNameSpace + ";\n\n";
						}
						//update ast model
						model.astModel = replaceString(parser, resolver, cu, start, end, usingClause);
					}
				}
			}
		}

		//null flag chnage
		if(changedPropertyName === "NullToken"){
			// null
			var notToken = astNode.getNotToken();
			var nullToken = astNode.getNullableToken();
			cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);

			if (element.not) { // not null
				if (!notToken) {
					// add null token
					off = nullToken ? nullToken.getOffset() - 1 : astNode.getEndOffset() - 1;
					source = cu.getParsedSource();
					stringValue = nullToken ? " not" : " not null";
					result = rAndD.Utils.stringInsertAt(source, off, stringValue);

					newAst = parser.parseAndGetAst3(resolver, null, result);
					cu = commonddlNonUi.AstMerger.merge(cu, newAst);
					cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
					model.astModel = cu;
				}
			} else { // can be null
				if (nullToken && element.nullable) {
					// remove not
					if (notToken) {
						source = cu.getParsedSource();
						start = notToken.getOffset();
						end = start + notToken.getLength() + 1;
						buf = new rAndD.StringBuffer(source);
						buf.replace(start, end, "");
						result = buf.toString();

						newAst = parser.parseAndGetAst3(resolver, null, result);
						cu = commonddlNonUi.AstMerger.merge(cu, newAst);
						cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
						model.astModel = cu;
					}
				} else if (nullToken) {
					// remove not null
					source = cu.getParsedSource();
					start = notToken.getOffset();
					end = start + (nullToken.getOffset() - start) + nullToken.getLength();
					buf = new rAndD.StringBuffer(source);
					buf.replace(start - 1, end, "");
					result = buf.toString();

					newAst = parser.parseAndGetAst3(resolver, null, result);
					cu = commonddlNonUi.AstMerger.merge(cu, newAst);
					cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
					model.astModel = cu;
				}
			}
		}

		//key flag chnage
		if(changedPropertyName === "KeyToken"){
			// key
			var keyToken = astNode.getKeyToken();
			cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
			if (keyToken && !element.key) {
				// remove key token
				source = cu.getParsedSource();
				start = keyToken.getOffset();
				end = start + keyToken.getLength() + 1;
				buf = new rAndD.StringBuffer(source);
				buf.replace(start, end, "");
				result = buf.toString();

				newAst = parser.parseAndGetAst3(resolver, null, result);
				cu = commonddlNonUi.AstMerger.merge(cu, newAst);
				cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
				model.astModel = cu;

				//NOT NEEDED IN HDI
				/*//now add @nokey annoation if not present already
				if (entityAstNode) {
					var annoList = entityAstNode.getAnnotationList();
					if (annoList.length === 0) {
						source = cu.getParsedSource();
						start = entityAstNode.getStartOffsetWithComments();
						end = start;
						buf = new rAndD.StringBuffer(source);
						buf.replace(start, end, "@nokey\n");
						result = buf.toString();

						newAst = parser.parseAndGetAst3(resolver, null, result);
						cu = commonddlNonUi.AstMerger.merge(cu, newAst);
						cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
						model.astModel = cu;
					}

				}*/

			} else if (element.key && !keyToken) {
				//NOT NEEDED IN HDI
				/*//before adding key token, remove @nokey annotaion
				if (entityAstNode) {
					var annoList = entityAstNode.getAnnotationList();
					for (var i = 0; i < annoList.length; i++) {
						if (annoList[i] instanceof commonddlNonUi.PreAnnotationImpl) {
							source = cu.getParsedSource();
							start = annoList[i].getStartOffsetWithComments();
							end = annoList[i].getEndOffsetWithComments() + 1;
							buf = new rAndD.StringBuffer(source);
							buf.replace(start, end, "");
							result = buf.toString();

							newAst = parser.parseAndGetAst3(resolver, null, result);
							cu = commonddlNonUi.AstMerger.merge(cu, newAst);
							cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
							model.astModel = cu;
						}
					}
				}*/
				//now add key token
				off = astNode.getStartOffsetWithComments();
				source = cu.getParsedSource();
				result = rAndD.Utils.stringInsertAt(source, off, "key ");
				newAst = parser.parseAndGetAst3(resolver, null, result);
				cu = commonddlNonUi.AstMerger.merge(cu, newAst);
				cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
				model.astModel = cu;
			}
		}

		//default value chnage
		if(changedPropertyName === "DefaultValue"){
			// Default Value
			var defaultValueToken = astNode.getDefault() ? astNode.getDefault().getTokenToken() : undefined;
			cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
			if (element.defaultValue) {
				if (defaultValueToken) {
					if (defaultValueToken.getM_lexem() !== element.defaultValue) {
						//update default token
						commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, defaultValueToken, element.defaultValue);
					}
				} else {
					// add default token
					off = astNode.getEndOffset() - 1;
					source = cu.getParsedSource();
					stringValue = " default " + element.defaultValue;
					result = rAndD.Utils.stringInsertAt(source, off, stringValue);
					newAst = parser.parseAndGetAst3(resolver, null, result);
					cu = commonddlNonUi.AstMerger.merge(cu, newAst);
					cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
					model.astModel = cu;
				}

			} else {
				if (defaultValueToken) {
					// remove default token
					var defaultToken;
					for (var i = astNode.getStartTokenIndex(); i < astNode.getEndTokenIndex(); i++) {
						var token = cu.getTokenList()[i];
						if (token.getM_lexem() === "default") {
							defaultToken = token;
							break;
						}
					}
					source = cu.getParsedSource();
					start = defaultToken.getOffset() - 1;
					end = defaultValueToken.getOffset() + defaultValueToken.getLength();
					buf = new rAndD.StringBuffer(source);
					buf.replace(start, end, "");
					result = buf.toString();

					newAst = parser.parseAndGetAst3(resolver, null, result);
					cu = commonddlNonUi.AstMerger.merge(cu, newAst);
					cu = parser.parseAndGetAst3(resolver, null, cu.getParsedSource());
					model.astModel = cu;
				}
			}
		}
	};

	var changeAssociationProperties = function(model, entityName, association, oldProps, changedPropertyName, astNode, newProps) {
		var off, source, result, newAst, start, end, buf, stringValue;
		var parser = model.parser;
		var resolver = model.resolver;

		if (!astNode) {
			var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(association);
			astNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, association.name);
		}

		var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);

		// name
		if (changedPropertyName === "Name") {
			var nameToken = astNode.getNameToken();
			if (nameToken !== null && nameToken.m_lexem.length > 0 && nameToken.m_lexem !== association.name) {
				//change name 
				commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, nameToken, association.name);
			}

			//also replace first left path entry text for unmanaged association's on condition
			if (association.onCondition) {
				/*	var replacementString = "";
					if (astNode.getOnCondition()) {
						if (astNode.getOnCondition().left) {
							nameToken = astNode.getOnCondition().getLeft().getPathEntries()[0].getNameToken();
							if (nameToken !== null && nameToken.m_lexem.length > 0 && nameToken.m_lexem !== association.name) {
								//change name in on condition
								commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, nameToken, association.name);
							}
						} else if (astNode.getOnCondition().conditions) {
							//if there are multiple conditions in on condition
							var conditions = astNode.getOnCondition().conditions;
							for (var i = 0; i < conditions.length; i++) {
								nameToken = conditions[i].getLeft().getPathEntries()[0].getNameToken();
							}
							if (nameToken !== null && nameToken.m_lexem.length > 0 && nameToken.m_lexem !== association.name) {
								//change name in on condition
								commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, nameToken, association.name);
							}
						}
					} else {
						nameToken = null;
					}*/
			}
		}

		var minToken = astNode.minToken;
		var maxToken = astNode.maxToken;

		if (changedPropertyName === "SrcCardinality") {
			var astSrcCardinality;
			var token = astNode.getSourceMaxCardinalityToken();
			if (token) {
				astSrcCardinality = token.getM_lexem();
				start = token.getOffset() - 1;
				end = token.getOffset() + (token.getLength() - 1) + 3;
			} else {
				astSrcCardinality = "";
				start = minToken.getOffset() - 1;
				end = minToken.getOffset();
			}

			var newSrcCardinality = association.srcCardinality;
			if (astSrcCardinality !== newSrcCardinality) {
				var newCardinalityString = "[";
				if (newSrcCardinality === "") {
					newCardinalityString = newCardinalityString + newSrcCardinality;
				} else {
					newCardinalityString = newCardinalityString + newSrcCardinality + ", ";
				}
				//change src cardinality
				cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
				model.astModel = replaceString(parser, resolver, cu, start, end, newCardinalityString);
			}
		}

		if (changedPropertyName === "Cardinality") {
			//cardinality
			var astCardinalityString;
			if (minToken && maxToken) {
				astCardinalityString = "[" + minToken.getM_lexem() + ".." + maxToken.getM_lexem() + "]";
			} else if (!minToken && maxToken) {
				astCardinalityString = "[0.." + maxToken.getM_lexem() + "]";
			} else if (minToken && !maxToken) {
				astCardinalityString = "[" + minToken.getM_lexem() + "..1]";
			} else {
				astCardinalityString = "[0..1]";
			}

			var newCardinalityString = association.cardinality;

			if (astCardinalityString !== newCardinalityString) {
				//change cardinality
				start = minToken.getOffset() - 1;
				end = maxToken.getOffset() + 2;

				//additional handling when Source Cardinality is present
				if(astNode.sourceMaxCardinalityToken){
					newCardinalityString = newCardinalityString.substring(1);
					start = start + 1;
				}

				cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
				model.astModel = replaceString(parser, resolver, cu, start, end, newCardinalityString);
			}
		}

		if (changedPropertyName === "TargetEntity") {
			//targetEntity
			var oldTargetEntityName = astNode.getTargetEntityName();
			var newTargetEntityName = association.targetEntityName;
			//change targetEntity
			if (oldTargetEntityName !== newTargetEntityName) {
				if (oldTargetEntityName === "") {
					source = cu.getParsedSource();
					start = maxToken.getOffset() + 6; //max token value plus "] to "
					end = start; //+ newTargetEntityName.length - 4;

					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				} else {
					start = astNode.targetEntityPath.getStartOffset();
					end = astNode.getEndOffset() - 1; //replace all text till the end of ast node because due to target entity chnage, keys etc will also change
					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				}
			}
		}
		
		if (changedPropertyName === "RenamedTargetEntity") {
			//targetEntity
			var oldTargetEntityName = astNode.getTargetEntityName();
			var newTargetEntityName = association.targetEntityName;
			//change targetEntity
			if (oldTargetEntityName !== newTargetEntityName) {
				if (oldTargetEntityName === "") {
					source = cu.getParsedSource();
					start = maxToken.getOffset() + 6; //max token value plus "] to "
					end = start; //+ newTargetEntityName.length - 4;

					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				} else {
					start = astNode.targetEntityPath.getStartOffset();
					end = astNode.targetEntityPath.getEndOffset();
					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				}
			}
		}

		if (changedPropertyName === "ExternalTargetEntity") {
			//targetEntity
			var oldTargetEntityName = astNode.getTargetEntityName();
			var newTargetEntityName = association.targetEntityName;
			var extTargetEntityNameSpace;

			extTargetEntityNameSpace = association.targetEntityName;
			if(extTargetEntityNameSpace.indexOf("as") !== -1){
				newTargetEntityName = extTargetEntityNameSpace.substring(extTargetEntityNameSpace.lastIndexOf("as") + 2).trim();
			} else{
				newTargetEntityName = extTargetEntityNameSpace.substring(extTargetEntityNameSpace.lastIndexOf(".") + 1).trim();
			}

			//change targetEntity
			if (oldTargetEntityName !== newTargetEntityName) {
				if (oldTargetEntityName === "") {
					source = cu.getParsedSource();
					start = maxToken.getOffset() + 6; //max token value plus "] to "
					end = start; //+ newTargetEntityName.length - 4;

					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				} else {
					start = astNode.targetEntityPath.getStartOffset();
					end = astNode.getEndOffset() - 1; //replace all text till the end of ast node because due to target entity chnage, keys etc will also change
					cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
					model.astModel = replaceString(parser, resolver, cu, start, end, newTargetEntityName);
				}
			}

			if(extTargetEntityNameSpace){
				var compareString = extTargetEntityNameSpace.replace(/\::/g, "."); //replace :: with dot for comaprison with ast model using clause
				if(usingNameSpacesArray.indexOf(compareString) === -1){
					//add using clause
					if(lastUsingStatement){
						start = lastUsingStatement.getEndOffsetWithComments() + 2;
						end = start;
					} else{
						var nameSpaceStmt = cu.getStatements()[0];
						start = nameSpaceStmt.getEndOffset() + 2;
						end = start;
					}
					//update using clause
					var usingClause = "using " + extTargetEntityNameSpace + ";\n\n";
					model.astModel = replaceString(parser, resolver, cu, start, end, usingClause);
				}
			}
		}

		//type 
		if (changedPropertyName === "AssociationType") {
			var oldAssoType = astNode.getOnCondition() ? "Unmanaged" : "Managed";
			var newAssoType = association.type;
			var replacementString = "";

			if (newAssoType === "Managed" && astNode.getOnCondition()) {
				start = astNode.getOnCondition().getStartOffset() - 3; //also remove the text "on " before the condition expression
				end = astNode.getOnCondition().getEndOffset();
				replacementString = ""; 

			} else if (newAssoType === "Managed" && !astNode.getOnCondition()) {
				/*start = astNode.getTargetEntityPath().pathEntries[0].getNameToken().getOffset();
					start = start + astNode.getTargetEntityPath().pathEntries[0].getNameToken().getM_lexem().length;*/
				start = astNode.getTargetEntityPath().getEndOffset();
				end = start; //remove text till end of "on " 
				replacementString = "";

			} else if (newAssoType === "Unmanaged") {
				/*start = astNode.getTargetEntityPath().pathEntries[0].getNameToken().getOffset();
					start = start + astNode.getTargetEntityPath().pathEntries[0].getNameToken().getM_lexem().length;*/
				start = astNode.getTargetEntityPath().getEndOffset();
				end = astNode.getEndOffset() - 1;
				replacementString = "";
			}

			cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
			model.astModel = replaceString(parser, resolver, cu, start, end, replacementString);

		}

		//selected attributes
		var oldAttributes = astNode.getKeys();
		var newAttributes = association.associationKeys;
		var keysString = "";
		var attrChangeRequired = false;
		if (changedPropertyName === "Attributes") {
			attrChangeRequired = true;
		}

		if (association.type === "Managed") {
			if (oldAttributes.length === 0) {
				//if there were no attributes added earlier and now adding fresh attributes
				if (newAttributes._keys.length > 0) {
					start = astNode.getTargetEntityPath().getEndOffset();
					end = astNode.getEndOffset() - 1;
				}
			} else {
				var firstAttr = oldAttributes[0];
				var lastAttr = oldAttributes[oldAttributes.length - 1];
				start = firstAttr.getStartOffsetWithComments() - 1; //start index is the index of '{' before beginning of first attribute
				end = lastAttr.getEndOffsetWithComments() + 1; //end index is end of "};" after the last attribute or end of its alias name if present
				var alias = lastAttr.getAliasToken();
				if (alias) {
					end = alias.getOffset() + alias.getM_lexem().length + 1;
				}
			}

			//genereate new selected attributes string
			if (newAttributes._keys.length > 0) {
				keysString = keysString + " {";
			}

			for (var i = 0; i < newAttributes._keys.length; i++) {
				if (i > 0) {
					keysString = keysString + ", "; //add trailing comma after first attribute
				}

				keysString = keysString + newAttributes.getAt(i).name;
				var aliasName = newAttributes.getAt(i).alias;
				if (aliasName !== "") {
					keysString = keysString + " as " + aliasName;
				}
			}

			if (newAttributes._keys.length > 0) {
				keysString = keysString + "}";
			}
		}

		cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);

		if (attrChangeRequired) {
			model.astModel = replaceString(parser, resolver, cu, start, end, keysString);
		}

		//on condition 
		if (changedPropertyName === "OnCondition") {
			/*	start = astNode.getTargetEntityPath().pathEntries[0].getNameToken().getOffset();
					start = start + astNode.getTargetEntityPath().pathEntries[0].getNameToken().getM_lexem().length;*/
			start = astNode.getTargetEntityPath().getEndOffset();
			end = astNode.getEndOffset() - 1;
			if (end < start) {
				//model corrupted, take old value and find end index
				var oldOnCondition = oldProps.onCondition;
				end = start + oldOnCondition.length + 4; //buffer 3 indices for the text ' on '
			}
			replacementString = " on " + association.onCondition;
			cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(astNode);
			model.astModel = replaceString(parser, resolver, cu, start, end, replacementString);
		}
	};
	
	var getRenamedContext = function(renamedContext, usedEntity){
		
	};

	/*
	 * @class Command to add a new Element including its mapping
	 * @param {string} viewNodeName - Name of the ViewNode
	 * @param {object} elementProperties
	 */
	var AddElementCommand = function(entityName, entityFullPath, elementProperties) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.objectAttributes = elementProperties.objectAttributes;
		this.typeAttributes = elementProperties.typeAttributes;
	};
	AddElementCommand.prototype = {
			execute: function(model, events) {
				//var that = this;
				var element;
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				if (entity) {
					element = entity.createElement(this.objectAttributes, null, this.nextElementName);
					if (this.typeAttributes) {
						element.createOrMergeSimpleType(this.typeAttributes);
					}
					// update Ast
					var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.entityFullPath, this.entityName);
					var elememtListEntryString = element.name + " : " + this.typeAttributes.primitiveType + ";";
					var elementsList = entityAstNode.getElements();
					var insertPosition;

					if (elementsList !== null) {
						if (insertPosition === undefined) {
							insertPosition = elementsList.length;
						}
						addToList(model.parser, model.resolver, entityAstNode, elementsList, insertPosition, elememtListEntryString, onEmptyListHook);
						if (insertPosition >= elementsList.length) {
							insertPosition = elementsList.length - 1;
						}
					}

					events.push({
						source: entity,
						type: ViewModelEvents.ELEMENT_CREATED,
						name: element.name,
						changed: true
					});
				}
				return element;
			},
			undo: function(model, events) {
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				if (entity) {

					var element = entity.elements.get(this.objectAttributes.name);

					var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(element);
					var elementAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, element.name);

					// update Ast
					removeListEntry(model.parser, model.resolver, elementAstNode);

					entity.elements.remove(this.objectAttributes.name);
					if (element) {
						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_DELETED,
							name: element.name,
							changed: true
						});
					}
				}
			}
	};

	/*
	 * @class
	 */
	var RemoveElementCommand = function(entityName, entityFullPath, elementName, entity) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.elementName = elementName;
		this.removeCommand = null;
		this.entity = entity;
	};
	RemoveElementCommand.prototype = {
			execute: function(model, events) {
				var entity;
				if (this.entity) {
					entity = this.entity;
				} else {
					entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				}

				if (entity) {
					var element = entity.elements.get(this.elementName);
					if (element) {
						this.elementProperties = {};
						this.elementProperties.objectAttributes = element.$getAttributes();
						if (element.inlineType) {
							this.elementProperties.typeAttributes = element.inlineType.$getAttributes();
						}
						// update Ast
						var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.entityFullPath, this.entityName);
						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(element);
						var elementAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, element.name);

						this.idx = entityAstNode.elements.indexOf(elementAstNode);
						removeListEntry(model.parser, model.resolver, elementAstNode);
						// remove element
						//this.removeCommand = new modelbase.DeleteCommand('root.elements["' + this.elementName + '"]');
						this.removeCommand = new modelbase.DeleteCommand(element);
						this.removeCommand.execute(model, events);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_DELETED,
							name: element.name,
							changed: true
						});
					}
				}
			},
			undo: function(model, events) {
				var entity;
				if (this.entity) {
					entity = this.entity;
				} else {
					entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				}

				if (entity) {
					if (this.removeCommand) {
						var element = this.removeCommand.undo(model, events);

						// update Ast
						var elememtListEntryString = element.name + " : Integer;";
						var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.entityFullPath, this.entityName);
						var elementsList = entityAstNode.getElements();
						var insertPosition = this.idx;
						if (elementsList !== null) {
							addToList(model.parser, model.resolver, entityAstNode, elementsList, insertPosition, elememtListEntryString, onEmptyListHook);
							if (insertPosition >= elementsList.length) {
								insertPosition = elementsList.length - 1;
							}
						}
						// update element ast
						changeElementProperties(model, entity.name, entityAstNode, element);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CREATED,
							name: element.name,
							changed: true
						});
						return element;
					}
				}
			}
	};

	/*
	 * @class
	 */
	var ChangeElementPropertiesCommand = function(entityName, entityFullPath, oldElementName, newAttributes, changedPropertyName) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.oldElementName = oldElementName;
		this.newElementProperties = newAttributes.objectAttributes;
		this.newTypeProperties = newAttributes.typeAttributes;
		this.newElementName = this.newElementProperties && this.newElementProperties.name ? this.newElementProperties.name : oldElementName;
		this.changedPropertyName = changedPropertyName;
	};
	ChangeElementPropertiesCommand.prototype = {
			execute: function(model, events) {
				var changedPropertyName = this.changedPropertyName;
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				if (entity) {

					var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.entityFullPath, this.entityName);
					var element = entity.elements.get(this.oldElementName);
					if (element) {
						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(element);
						var elementAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, element.name);

						this.oldElementProperties = element.$getAttributesForUndo(this.newElementProperties);
						if (element.inlineType) {
							this.oldTypeProperties = element.inlineType.$getAttributesForUndo(this.newTypeProperties);
						}
						// is rename?
						if (this.oldElementName !== this.newElementName) {
							if (entity.elements.get(this.newElementName)) {
								throw new modelbase.ObjectAlreadyExistsException("Element", this.newElementName, entity.name);
							}
							//
							//get all references of renamed element
							/*var refs = ViewModelService.RenameService.getImpactAnalysis(element);
							this.renameCommand = new modelbase.RenameCommand(element);
							this.renameCommand.execute(model, events, false, this.oldElementName, this.newElementName);*/
							entity.elements.rename(this.oldElementName, this.newElementName);
						}
						if (this.newElementProperties) {
							element.$setAttributes(this.newElementProperties);
						}
						// type attributes
						if (this.newTypeProperties) {
							if (!element.inlineType) {
								this.createInlineType = true;
								element.createOrMergeSimpleType(this.newTypeProperties);
							} else {
								element.inlineType.$setAttributes(this.newTypeProperties);
							}
						}

						// update ast model
						changeElementProperties(model, entity.name, entityAstNode, element, this.oldTypeProperties, elementAstNode, changedPropertyName);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.oldElementName,
							name: element.name,
							changed: true
						});

						return element;
					}
				}
			},
			undo: function(model, events) {
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName, undefined);
				if (entity) {
					var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.entityFullPath, this.entityName);
					var element = entity.elements.get(this.newElementName);
					if (element) {
						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(element);
						var elementAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, element.name);

						// is re-name
						if (this.oldElementName !== this.newElementName) {
							entity.elements.rename(this.newElementName, this.oldElementName);
						}

						// reset old attributes
						element.$setAttributes(this.oldElementProperties);
						if (this.oldTypeProperties) {
							if (!element.inlineType) {
								element.createOrMergeSimpleType(this.oldTypeProperties);
							} else {
								element.inlineType.$setAttributes(this.oldTypeProperties);
							}
						} else if (this.createInlineType) {
							delete element.inlineType;
						}

						// update ast model
						changeElementProperties(model, entity.name, entityAstNode, element, this.oldElementProperties, elementAstNode);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.newElementName,
							name: element.name,
							changed: true
						});
						return element;
					}
				}
			}
	};

	/*
	 * @class Command to add a new Context
	 */
	var AddContextCommand = function(childContextName, parentContextName, parentContextFullPath) {
		this.childContextName = childContextName;
		this.parentContextName = parentContextName;
		this.parentContextFullPath = parentContextFullPath;
	};
	AddContextCommand.prototype = {
			execute: function(model, events) {
				var context;
				var cdsRootNode = model.root;
				var parentContext = CDSEditorUtil.getCDSModelFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				//var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				if (parentContext) {
					var id = cdsRootNode.$$model.namespace + "::" + this.parentContextFullPath.replace(/\//g, ".") + "."  +this.childContextName;
					var attributes = {
							id : id,
							name: this.childContextName,
							schemaName: cdsRootNode.schemaName
					};

					context = parentContext.createContext(attributes);
					// update Ast
					var parentContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentContext);
					var parentContextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, parentContextFullPath, parentContext.name);
					var statementsList = parentContextAstNode.getStatements();
					var insertPosition;
					var contextDefinitionString = "\ncontext " + this.childContextName + "{\n};";
					if (statementsList !== null) {
						if (insertPosition === undefined) {
							insertPosition = statementsList.length;
						}
						addToList(model.parser, model.resolver, parentContextAstNode, statementsList, insertPosition, contextDefinitionString,
								onEmptyListHook);
						if (insertPosition >= statementsList.length) {
							insertPosition = statementsList.length - 1;
						}
					}
				}
				events.push({
					source: parentContext,
					type: ViewModelEvents.CONTEXT_CREATED,
					name: model.root.name, //element.name,
					changed: true
				});
				return context;
			},
			undo: function(model, events) {
				var context;
				var cdsRootNode = model.root;
				var parentContext = CDSEditorUtil.getCDSModelFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);

				if (parentContext) {
					var chilrenArray = parentContext.children;
					for (var i = 0; i < chilrenArray._keys.length; i++) {
						var child = chilrenArray.getAt(i);
						if (child.name === this.childContextName) {
							context = child;
							// remove from Ast model
							var childContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(context);
							var contextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, childContextFullPath, this.childContextName);
							removeListEntry(model.parser, model.resolver, contextAstNode);

							//now remove context from parent context cds model
							context.$remove();
							break;
						}
					}

					if (context) {
						events.push({
							source: parentContext,
							type: ViewModelEvents.CONTEXT_DELETED,
							name: this.childContextName,
							changed: true
						});
					}
				}
			}
	};

	/*
	 * @class Command to add a new Context
	 */
	var AddEntityCommand = function(entityName, parentContextName, parentContextFullPath) {
		this.entityName = entityName;
		this.parentContextName = parentContextName;
		this.parentContextFullPath = parentContextFullPath;
	};
	AddEntityCommand.prototype = {
			execute: function(model, events) {
				var entity;
				var cdsRootNode = model.root;
				var parentContext = CDSEditorUtil.getCDSModelFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				//var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				if (parentContext) {
					var id = cdsRootNode.$$model.namespace + "::" + this.parentContextFullPath.replace(/\//g, ".") + "."  +this.entityName;
					var attributes = {
							id : id,
							name: this.entityName,
							schemaName: cdsRootNode.schemaName
					};
					entity = parentContext.createEntity(attributes);
					// update Ast
					var parentContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentContext);
					var parentContextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, parentContextFullPath, parentContext.name);
					var statementsList = parentContextAstNode.getStatements();
					var insertPosition;
					var entityDefinitionString = "\nentity " + this.entityName + "{\n};";

					if (statementsList !== null) {
						if (insertPosition === undefined) {
							insertPosition = statementsList.length;
						}
						addToList(model.parser, model.resolver, parentContextAstNode, statementsList, insertPosition, entityDefinitionString, onEmptyListHook);
						if (insertPosition >= statementsList.length) {
							insertPosition = statementsList.length - 1;
						}
					}
				}
				events.push({
					source: parentContext,
					type: ViewModelEvents.CONTEXT_CHANGED,
					name: model.root.name, //element.name,
					changed: true
				});
				return entity;
			},
			undo: function(model, events) {
				var entity;
				var cdsRootNode = model.root;
				var parentContext = CDSEditorUtil.getCDSModelFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);

				if (parentContext) {
					var chilrenArray = parentContext.children;
					for (var i = 0; i < chilrenArray._keys.length; i++) {
						var child = chilrenArray.getAt(i);
						if (child.name === this.entityName) {
							entity = child;
							// remove from Ast model
							var childFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
							var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, childFullPath, this.entityName);
							removeListEntry(model.parser, model.resolver, entityAstNode);

							//now remove entity from parent context model
							entity.$remove();
							break;
						}
					}

					if (entity) {
						events.push({
							source: parentContext,
							type: ViewModelEvents.ENTITY_DELETED,
							name: this.entityName,
							changed: true
						});
					}
				}
			}
	};

	/*
	 * @class
	 */
	var RenameCDSArtifactCommand = function(newName, renamedNodeFullPath, oldName) {
		this.newName = newName;
		this.renamedNodeFullPath = renamedNodeFullPath;
		this.oldName = oldName;
	};
	RenameCDSArtifactCommand.prototype = {
			execute: function(model, events) {
				var cdsNode = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.renamedNodeFullPath, this.oldName, undefined);
				//var cdsNode = CDSEditorUtil.getCDSArtifactFromFullPath(model.root, this.renamedNodeFullPath, this.oldName, undefined);
				if (cdsNode) {
					//update name in view model
					cdsNode.name = this.newName;
					//update name in ast model
					var cdsAstModel = CDSEditorUtil.getCDSNodeASTModel(model.astModel, this.renamedNodeFullPath, this.oldName);

					var nameToken;

					if(cdsAstModel){
						if(cdsAstModel.namePath){
							nameToken = cdsAstModel.getNamePath().getPathEntries()[0].getNameToken(); //Entity
						} else{
							nameToken = cdsAstModel.getNameToken(); //Element
						}
					}

					if (nameToken !== null && nameToken.m_lexem.length > 0 && nameToken.m_lexem !== this.newName) {
						//change name 
						var parser = model.parser;
						var resolver = model.resolver;
						var cu = commonddlNonUi.SourceRangeImpl.getCompilationUnit(cdsAstModel);
						commonddlNonUi.ReplaceSingleTokenLexemCommand.replaceTokenLexem(parser, resolver, cu, nameToken, this.newName);
					}
				}
				events.push({
					source: cdsNode,
					type: ViewModelEvents.CONTEXT_CHANGED,
					name: model.root.name, //element.name,
					changed: true
				});
				return cdsNode;
			},
			undo: function(model, events) {

			}
	};

	/*
	 * @class
	 */
	var RenameCDSNodeCommand = function(renamedNodeCDSModel, newName, oldName, references){
		this.cdsNode = renamedNodeCDSModel;
		this.newName = newName;
		this.oldName = oldName;
		this.references = references;
	};

	RenameCDSNodeCommand.prototype = {
			execute: function(model, events) {
				var renamedCDSNode = this.cdsNode;
				var renamedNodeFullPath = CDSEditorUtil.getFullPathFromCDSObject(this.cdsNode);

				var renameCommands = [];
				renameCommands.push(new RenameCDSArtifactCommand(this.newName, renamedNodeFullPath, this.oldName));

				if(renamedCDSNode instanceof viewmodel.Entity){
					for(var i = 0; i < this.references.length; i++){
						var currentRef = this.references[i];
						if(currentRef.object.$$usingFeatures){
							//loop over all using features of this reference
							for(var j = 0; j < currentRef.object.$$usingFeatures.length; j++){
								var usingFeature = currentRef.object.$$usingFeatures[j];
								var entityUsedAsTarget = usingFeature.getOwner().targetEntity;	
								if(entityUsedAsTarget === renamedCDSNode){
									var associationObj = usingFeature.getOwner();
									var assoParentEntity = associationObj.$getContainer();
									var assoParentEntityFullPath = CDSEditorUtil
									.getFullPathFromCDSObject(assoParentEntity);

									var props = {};
									props.targetEntity = entityUsedAsTarget;
									var targetEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entityUsedAsTarget);
									props.renamedTargetEntityName = targetEntityFullPath.substring(targetEntityFullPath.indexOf("\/") + 1).replace(/\//g, ".");
									props.onCondition = undefined;

									//now rename the target entity in the assoiations whihc use it
									renameCommands.push(new ChangeAssociationPropertiesCommand(assoParentEntity.name, assoParentEntityFullPath, associationObj.name, props, "RenamedTargetEntity"));
								}
							}
						}
					}
				} else if(renamedCDSNode instanceof viewmodel.Context){
					//TODO:
					for(var i = 0; i < this.references.length; i++){
						var currentRef = this.references[i];
						if(currentRef.object.$$usingFeatures){
							//loop over all using features of this reference
							for(var j = 0; j < currentRef.object.$$usingFeatures.length; j++){
								var usingFeature = currentRef.object.$$usingFeatures[j];
								var entityUsedAsTarget = usingFeature.getOwner().targetEntity;
								//var parentContext = getRenamedContext(entityUsedAsTarget, renamedCDSNode);
								//if(parentContext === renamedCDSNode){
									var associationObj = usingFeature.getOwner();
									var assoParentEntity = associationObj.$getContainer();
									var assoParentEntityFullPath = CDSEditorUtil
									.getFullPathFromCDSObject(assoParentEntity);

									var props = {};
									props.targetEntity = entityUsedAsTarget;
									var targetEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entityUsedAsTarget);
									props.renamedTargetEntityName = targetEntityFullPath.substring(targetEntityFullPath.indexOf("\/") + 1).replace(/\//g, ".");
									props.onCondition = undefined;

									//now rename the target entity in the assoiations whihc use it
									renameCommands.push(new ChangeAssociationPropertiesCommand(assoParentEntity.name, assoParentEntityFullPath, associationObj.name, props, "RenamedTargetEntity"));
								//}
							}
						}
					}
				} else if(renamedCDSNode instanceof viewmodel.Element){
					for(var i = 0; i < this.references.length; i++){
						var currentRef = this.references[i];
						if(currentRef.object.$$usingFeatures){
							//loop over all using features of this reference
							for(var j = 0; j < currentRef.object.$$usingFeatures.length; j++){
								var usingFeature = currentRef.object.$$usingFeatures[0];
								var elementUsedAsKey = usingFeature.getOwner().keyElement;	
								if(elementUsedAsKey === renamedCDSNode){
									var assoKeyObj = usingFeature.getOwner();
									var associationObj = assoKeyObj.$getContainer();
									var assoParentEntity = associationObj.$getContainer();
									var assoParentEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(assoParentEntity);

									var props = {};
									props.attributes = CDSEditorUtil.getAvailableAttributesForTargetEntity(that._entity, associationObj);

									renameCommands.push(new commands.ChangeAssociationPropertiesCommand(assoParentEntity.name, assoParentEntityFullPath, associationObj.name, props, "Attributes"));
								}
							}
						}
					}
				}

				new modelbase.CompoundCommand(
						renameCommands).execute(model, events);
			}
	};

	/*
	 * @class
	 */
	var DeleteEntityCommand = function(entity, parentContext) {
		this.entity = entity;
		this.parentContext = parentContext;
	};
	DeleteEntityCommand.prototype = {
			execute: function(model, events) {
				// var cdsRootNode = model.root;
				//var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				var parentContext = this.parentContext;
				var entity = this.entity;
				if (entity) {
					var entityAstNode;
					var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
					entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, entityFullPath, entity.name);

					// remove entity from view model
					this.removeCommand = new modelbase.DeleteCommand(entity);
					this.removeCommand.execute(model, events);

					// remove entity from ast model
					var parentAstNode = entityAstNode.eContainer();
					this.idx = parentAstNode.statements.indexOf(entityAstNode);

					model.astModel = removeListEntry(model.parser, model.resolver, entityAstNode);

					events.push({
						source: parentContext,
						type: ViewModelEvents.ENTITY_DELETED,
						name: entity.name,
						changed: true
					});
					return entity;
				}
			},
			undo: function(model, events) {
				//	var cdsRootNode = model.root;
				//	var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				var parentContext = this.parentContext;
				if (parentContext) {
					if (this.removeCommand) {
						var entity = this.removeCommand.undo(model, events);
						var elements = entity.elements;
						var hasKeyColumn = false;
						for (var i = 0; i < elements._keys.length; i++) {
							if (elements.getAt(i).key) {
								hasKeyColumn = true;
								break;
							}
						}

						// update Ast
						var parentContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentContext);
						var parentContextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, parentContextFullPath, parentContext.name);
						var statementsList = parentContextAstNode.getStatements();
						var insertPosition;
						var entityDefinitionString = "";

						/*if (!hasKeyColumn) {
							entityDefinitionString = entityDefinitionString + "@nokey\n";
						}*/
						entityDefinitionString = entityDefinitionString + "entity " + entity.name + "{\n};";

						if (statementsList !== null) {
							if (insertPosition === undefined) {
								insertPosition = statementsList.length;
							}
							addToList(model.parser, model.resolver, parentContextAstNode, statementsList, insertPosition, entityDefinitionString,
									onEmptyListHook);
							if (insertPosition >= statementsList.length) {
								insertPosition = statementsList.length - 1;
							}
						}

						events.pop(); //remove the event added by the modelbase deleet command
						events.push({
							source: parentContext,
							type: ViewModelEvents.ENTITY_CREATED,
							name: entity.name,
							changed: true
						});
						return entity;
					}
				}
			}
	};

	/*
	 * @class
	 */
	var DeleteContextCommand = function(context, parentContext) {
		this.context = context;
		this.parentContext = parentContext;
	};
	DeleteContextCommand.prototype = {
			execute: function(model, events) {
				// var cdsRootNode = model.root;
				//	var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				var parentContext = this.parentContext;
				var context = this.context;
				if (context) {
					var contextAstNode;
					var contextFullPath = CDSEditorUtil.getFullPathFromCDSObject(context);
					contextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, contextFullPath, context.name);

					// remove context from view model
					this.removeCommand = new modelbase.DeleteCommand(context);
					this.removeCommand.execute(model, events);

					// remove context from ast model
					var parentAstNode = contextAstNode.eContainer();
					this.idx = parentAstNode.statements.indexOf(contextAstNode);

					model.astModel = removeListEntry(model.parser, model.resolver, contextAstNode);

					events.push({
						source: parentContext,
						type: ViewModelEvents.CONTEXT_DELETED,
						name: context.name,
						changed: true
					});
					return context;
				}
			},
			undo: function(model, events) {
				//var cdsRootNode = model.root;
				//var parentContext = CDSEditorUtil.getCDSArtifactFromFullPath(cdsRootNode, this.parentContextFullPath, this.parentContextName, undefined);
				var parentContext = this.parentContext;
				if (parentContext) {
					if (this.removeCommand) {
						var context = this.removeCommand.undo(model, events);

						// update Ast
						var parentContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentContext);
						var parentContextAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, parentContextFullPath, parentContext.name);
						var statementsList = parentContextAstNode.getStatements();
						var insertPosition;
						var contextDefinitionString = "context " + context.name + "{\n};";

						if (statementsList !== null) {
							if (insertPosition === undefined) {
								insertPosition = statementsList.length;
							}
							addToList(model.parser, model.resolver, parentContextAstNode, statementsList, insertPosition, contextDefinitionString,
									onEmptyListHook);
							if (insertPosition >= statementsList.length) {
								insertPosition = statementsList.length - 1;
							}
						}

						events.pop(); //remove the event added by the modelbase deleet command
						events.push({
							source: parentContext,
							type: ViewModelEvents.CONTEXT_CREATED,
							name: context.name,
							changed: true
						});
						return context;
					}
				}
			}
	};

	/*
	 * @class
	 */
	var AddAssociationCommand = function(entityName, entityFullPath, assoProperties) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.assoProperties = assoProperties;
	};
	AddAssociationCommand.prototype = {
			execute: function(model, events) {
				//var that = this;
				var association;
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				if (entity) {
					association = entity.createAssociation(this.assoProperties, null, this.nextElementName);

					// update Ast
					var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
					var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, entityFullPath, this.entityName);
					var associationString = association.name + " : Association" + this.assoProperties.cardinality + " to " + association.targetEntityName +
					";";
					var elementsList = entityAstNode.getElements();
					var insertPosition;

					if (elementsList !== null) {
						if (insertPosition === undefined) {
							insertPosition = elementsList.length;
						}
						addToList(model.parser, model.resolver, entityAstNode, elementsList, insertPosition, associationString, onEmptyListHook);
						if (insertPosition >= elementsList.length) {
							insertPosition = elementsList.length - 1;
						}
					}

					events.push({
						source: entity,
						type: ViewModelEvents.ELEMENT_CREATED,
						name: association.name,
						changed: true
					});
				}
				return association;
			},
			undo: function(model, events) {
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				if (entity) {
					var asso = entity.elements.get(this.assoProperties.name);

					var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(asso);
					var associationAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, asso.name);

					// update Ast
					removeListEntry(model.parser, model.resolver, associationAstNode);

					entity.elements.remove(this.assoProperties.name);
					if (asso) {
						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_DELETED,
							name: asso.name,
							changed: true
						});
					}
				}
			}
	};

	/*
	 * @class
	 */
	var ChangeAssociationPropertiesCommand = function(entityName, entityFullPath, oldAssociationName, newAttributes, changedPropertyName) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.oldAssociationName = oldAssociationName;
		this.newAssociationProperties = newAttributes;
		this.newAssociationName = this.newAssociationProperties && this.newAssociationProperties.name ? this.newAssociationProperties.name :
			oldAssociationName;
		this.changedPropName = changedPropertyName;
	};
	ChangeAssociationPropertiesCommand.prototype = {
			execute: function(model, events) {
				var changedPropName = this.changedPropName;
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				if (entity) {
					var association = entity.elements.get(this.oldAssociationName);
					if (association) {

						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(association);
						var assoAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, association.name);

						this.oldAssociationProperties = association.$getAttributesForUndo(this.newAssociationProperties);

						// is rename?
						if (this.oldAssociationName !== this.newAssociationName) {
							if (entity.elements.get(this.newAssociationName)) {
								throw new modelbase.ObjectAlreadyExistsException("Association", this.newAssociationName, entity.name);
							}
							entity.elements.rename(this.oldAssociationName, this.newAssociationName);

							/*//also replace association name in on condition for unmanged association
							association.onCondition = association.onCondition.replace(this.oldAssociationName, this.newAssociationName);*/

						}
						if (this.newAssociationProperties) {
							var targetEntity = this.newAssociationProperties.targetEntity;
							var targetEntityName = this.newAssociationProperties.targetEntityName; //targetEntity ? targetEntity.name : this.newAssociationProperties.targetEntityName;
							var renamedTargetEntityName = this.newAssociationProperties.renamedTargetEntityName;
							var attributes = this.newAssociationProperties.attributes;
							var externalAttributes = this.newAssociationProperties.externalAttributes;

							if (changedPropName === "ExternalTargetEntity") {
								//extract only name from the path
								this.newAssociationProperties.targetEntityName = targetEntityName = targetEntityName.substring(targetEntityName.lastIndexOf(".") +
										1);
								association.isTargetExternal = true;
								association.externalAttributes = externalAttributes;
							}
							
							if(renamedTargetEntityName !== undefined){
								//now set new target entity as 'reference' property of association and set new attributes to association
								association.targetEntity = targetEntity;
								var renamedEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(targetEntity);
								this.newAssociationProperties.targetEntityName = renamedEntityFullPath.substring(renamedEntityFullPath.indexOf("\/") + 1).replace(/\//g, ".");
								association.$setAttributes(this.newAssociationProperties);
								
							} else if (targetEntityName !== undefined) {
								//since the target entity has changed, first remove existing selected attributes
								var associationKeys = association.associationKeys;
								for (var i = associationKeys._keys.length - 1; i >= 0; i--) {
									var key = associationKeys.getAt(i);
									association.associationKeys.remove(key.name);
								} 

								//now set new target entity as 'reference' property of association and set new attributes to association
								association.targetEntity = targetEntity;

								//update new entity name inside full path
								var targetEntityFullName = this.newAssociationProperties.targetEntityName;
								var namespaceArray = targetEntityFullName.split(".");
								if(namespaceArray.length > 1){
									//remove last element in array and insert new entity name
									namespaceArray.pop();
									namespaceArray.push(targetEntity.name);
									this.newAssociationProperties.targetEntityName = namespaceArray.join(".");
								} else{
									this.newAssociationProperties.targetEntityName = targetEntity.name;
								}

								association.$setAttributes(this.newAssociationProperties);

							} else if (attributes) {
								//since selected attributes have changed, so first remove old associationKeys
								var associationKeys = association.associationKeys;
								for (var i = associationKeys._keys.length - 1; i >= 0; i--) {
									var key = associationKeys.getAt(i);
									association.associationKeys.remove(key.name);
								}
								//then add new associationKeys
								for (var i = 0; i < attributes.length; i++) {
									if (attributes[i].isSelected) {
										attributes[i].name = attributes[i].element.name; //update the 'name' property by taking name from element object as it  may have been renamed before this command gets executed
										association.createKey(attributes[i]);
									}
								}

								/*for (var i = 0; i < externalAttributes.length; i++) {
									if (attributes[i].isSelected) {
										association.createKey(attributes[i]);
									}
								}*/

							} else {
								//set new attributes in view model
								association.$setAttributes(this.newAssociationProperties);
							}
						}

						// update ast model
						changeAssociationProperties(model, entity.name, association, this.oldAssociationProperties, changedPropName, assoAstNode, this.newAssociationProperties);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.oldAssociationName,
							name: association.name,
							changed: true
						});

						return association;
					}
				}
			},
			undo: function(model, events) {
				var entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				if (entity) {
					var association = entity.elements.get(this.newAssociationName);
					if (association) {
						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(association);
						var assoAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, association.name);

						// is re-name
						if (this.oldAssociationName !== this.newAssociationName) {
							entity.elements.rename(this.newAssociationName, this.oldAssociationName);
						}

						// reset old attributes
						association.$setAttributes(this.oldAssociationProperties);
						/*	if (this.oldTypeProperties) {
							if (!association.inlineType) {
								association.createOrMergeSimpleType(this.oldTypeProperties);
							} else {
								association.inlineType.$setAttributes(this.oldTypeProperties);
							}
						} else if (this.createInlineType) {
							delete association.inlineType;
						}*/

						// update ast model
						changeAssociationProperties(model, entity.name, association, this.newAssociationName, this.changedPropName, assoAstNode);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CHANGED,
							originalName: this.newAssociationName,
							name: association.name,
							changed: true
						});
						return association;
					}
				}
			}
	};

	/*
	 * @class
	 */
	var RemoveAssociationCommand = function(entityName, entityFullPath, associationName, entity) {
		this.entityName = entityName;
		this.entityFullPath = entityFullPath;
		this.associationName = associationName;
		this.removeCommand = null;
		this.entity = entity;
	};
	RemoveAssociationCommand.prototype = {
			execute: function(model, events) {
				var entity;
				if (this.entity) {
					entity = this.entity;
				} else {
					entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				}

				if (entity) {
					var association = entity.elements.get(this.associationName);
					if (association) {
						// update Ast
						var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
						var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, entityFullPath, this.entityName);

						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(association);
						var assoAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, association.name);

						this.idx = entityAstNode.elements.indexOf(assoAstNode);
						removeListEntry(model.parser, model.resolver, assoAstNode);
						// remove element
						//this.removeCommand = new modelbase.DeleteCommand('root.elements["' + this.elementName + '"]');
						this.removeCommand = new modelbase.DeleteCommand(association);
						this.removeCommand.execute(model, events);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_DELETED,
							name: association.name,
							changed: true
						});
					}
				}
			},
			undo: function(model, events) {
				var entity;
				if (this.entity) {
					entity = this.entity;
				} else {
					entity = CDSEditorUtil.getCDSModelFromFullPath(model.root, this.entityFullPath, this.entityName);
				}

				if (entity) {
					if (this.removeCommand) {
						var association = this.removeCommand.undo(model, events);

						var elementFullPath = CDSEditorUtil.getFullPathFromCDSObject(association);
						var assoAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, elementFullPath, association.name);

						var associatedKeys = association.associationKeys;
						// update Ast
						var associationString = association.name + " : Association" + association.cardinality + " to " + association.targetEntityName;
						associationString = associationString + ";";

						var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
						var entityAstNode = CDSEditorUtil.getCDSNodeASTModel(model.astModel, entityFullPath, this.entityName);

						var elementsList = entityAstNode.getElements();
						var insertPosition = this.idx;
						if (elementsList !== null) {
							addToList(model.parser, model.resolver, entityAstNode, elementsList, insertPosition, associationString, onEmptyListHook);
							if (insertPosition >= elementsList.length) {
								insertPosition = elementsList.length - 1;
							}
						}
						// update element ast
						changeAssociationProperties(model, entity.name, association, association.name, undefined, assoAstNode);

						events.push({
							source: entity,
							type: ViewModelEvents.ELEMENT_CREATED,
							name: association.name,
							changed: true
						});
						return association;
					}
				}
			}
	};

	return {
		ViewModelEvents: ViewModelEvents,
		AddElementCommand: AddElementCommand,
		RemoveElementCommand: RemoveElementCommand,
		ChangeElementPropertiesCommand: ChangeElementPropertiesCommand,
		AddContextCommand: AddContextCommand,
		AddEntityCommand: AddEntityCommand,
		RenameCDSArtifactCommand: RenameCDSArtifactCommand,
		DeleteEntityCommand: DeleteEntityCommand,
		DeleteContextCommand: DeleteContextCommand,
		AddAssociationCommand: AddAssociationCommand,
		ChangeAssociationPropertiesCommand: ChangeAssociationPropertiesCommand,
		RemoveAssociationCommand: RemoveAssociationCommand,
		RenameCDSNodeCommand : RenameCDSNodeCommand
	};
});