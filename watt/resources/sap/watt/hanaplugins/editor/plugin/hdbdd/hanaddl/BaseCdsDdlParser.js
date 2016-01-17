// based on commit
//eb5b212dbfda88e1728c6891345c095c3acb4d05 CDS: Fix Annotation Code Completion for DCL
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,
 no-redeclare,radix,no-warning-comments*/
define(["hanaddl/IBaseCdsDdlParserConstants", "commonddl/commonddlNonUi", "hanaddl/CompilationUnitManager", "hanaddl/Messages", "hanaddl/CodeResolver", "hanaddl/CompareUtil", "hanaddl/CompilationUnitUtil", "hanaddl/ContextUtil", "hanaddl/HanaAnnotationUtil", "hanaddl/NamespaceUtil", "hanaddl/PrimitiveTypeUtil", "hanaddl/StmtUtil", "rndrt/rnd", "hanaddl/HanaDdlCodeCompletion", "hanaddl/IdNextKeywordCompletion"], //dependencies
    function (IBaseCdsDdlParserConstants, commonddl, CompilationUnitManager, Messages, CodeResolver, CompareUtil, CompilationUnitUtil, ContextUtil, HanaAnnotationUtil, NamespaceUtil, PrimitiveTypeUtil, StmtUtil, rnd, HanaDdlCodeCompletion, IdNextKeywordCompletion) {
        var DdlCodeCompletionType = commonddl.DdlCodeCompletionType;
        var AbstractDdlParser = commonddl.AbstractDdlParser;
        var DdlScanner = commonddl.DdlScanner;
        var DdlTypeUsagePayload = commonddl.DdlTypeUsagePayload;
        var TokenUtil = commonddl.TokenUtil;
        var AccessPolicyDeclarationImpl = commonddl.AccessPolicyDeclarationImpl;
        var AspectDeclarationImpl = commonddl.AspectDeclarationImpl;
        var AssociationDeclarationImpl = commonddl.AssociationDeclarationImpl;
        var IAstFactory = commonddl.IAstFactory;
        var AttributeDeclarationImpl = commonddl.AttributeDeclarationImpl;
        var ComponentDeclarationImpl = commonddl.ComponentDeclarationImpl;
        var ConstDeclarationImpl = commonddl.ConstDeclarationImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var NamedDeclarationImpl = commonddl.NamedDeclarationImpl;
        var PathExpressionImpl = commonddl.PathExpressionImpl;
        var RoleDeclarationImpl = commonddl.RoleDeclarationImpl;
        var RuleDeclarationImpl = commonddl.RuleDeclarationImpl;
        var SelectListEntryImpl = commonddl.SelectListEntryImpl;
        var StatementContainerImpl = commonddl.StatementContainerImpl;
        var TypeDeclarationImpl = commonddl.TypeDeclarationImpl;
        var UsingDirectiveImpl = commonddl.UsingDirectiveImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        var ViewSelectSetImpl = commonddl.ViewSelectSetImpl;
        var JoinDataSourceImpl = commonddl.JoinDataSourceImpl;
        var Category = rnd.Category;
        var Constants = rnd.Constants;
        var ErrorState = rnd.ErrorState;
        var Instruction = rnd.Instruction;
        var FramePtr = rnd.FramePtr;
        var TokenCoCoCompletion = rnd.TokenCoCoCompletion;
        var HookResult = rnd.HookResult;
        var SapDdlConstants = commonddl.SapDdlConstants;
        var StringBuffer = rnd.StringBuffer;
        var AnnotationPayload = commonddl.AnnotationPayload;
        var EObjectImpl = commonddl.EObjectImpl;
        var Region = commonddl.Region;
        var CursorPos = rnd.CursorPos;

        function BaseCdsDdlParser(byte_code, scanner) {
            AbstractDdlParser.call(this, byte_code, scanner, null);
            this.initializePrimitiveTypes();
        }

        BaseCdsDdlParser.prototype = Object.create(AbstractDdlParser.prototype);
        BaseCdsDdlParser.prototype.constructor = BaseCdsDdlParser;
        BaseCdsDdlParser.primitiyeTypeNamesV1 = null;
        BaseCdsDdlParser.primitiyeTypeNamesV2 = null;
        BaseCdsDdlParser.primitiyeTypeNamesV3 = null;
        BaseCdsDdlParser.prototype.annotationCoCoCount = 0;
        BaseCdsDdlParser.prototype.typePayload = new DdlTypeUsagePayload();
        BaseCdsDdlParser.prototype.annotationPayload = new AnnotationPayload();
        function CurrentPosition() {
        }

        function DummyNode() {
        }

        DummyNode.prototype = Object.create(EObjectImpl.prototype);
        function DummyRootNode() {
        }

        DummyRootNode.prototype = Object.create(DummyNode.prototype);
        BaseCdsDdlParser.prototype.isKey = false;
        BaseCdsDdlParser.prototype.isNullable = false;
        CurrentPosition.prototype.pathInLower = "";
        CurrentPosition.prototype.offset = -1;
        CurrentPosition.prototype.statement = null;
        BaseCdsDdlParser.prototype.predefinedNames = null;
        BaseCdsDdlParser.prototype.semanticCoCoCallCount = 0;
        BaseCdsDdlParser.prototype.initializePrimitiveTypes = function () {
            if (BaseCdsDdlParser.primitiyeTypeNamesV1 == null) {
                BaseCdsDdlParser.primitiyeTypeNamesV1 = [];
                BaseCdsDdlParser.primitiyeTypeNamesV1 = BaseCdsDdlParser.primitiyeTypeNamesV1.concat(PrimitiveTypeUtil.getPrimitiveTypeNamesForVersion(1, true));
            }
            if (BaseCdsDdlParser.primitiyeTypeNamesV2 == null) {
                BaseCdsDdlParser.primitiyeTypeNamesV2 = [];
                BaseCdsDdlParser.primitiyeTypeNamesV2 = BaseCdsDdlParser.primitiyeTypeNamesV2.concat(PrimitiveTypeUtil.getPrimitiveTypeNamesForVersion(2, true));
            }
            if (BaseCdsDdlParser.primitiyeTypeNamesV3 == null) {
                BaseCdsDdlParser.primitiyeTypeNamesV3 = [];
                BaseCdsDdlParser.primitiyeTypeNamesV3 = BaseCdsDdlParser.primitiyeTypeNamesV3.concat(PrimitiveTypeUtil.getPrimitiveTypeNamesForVersion(3, true));
            }
        };
        BaseCdsDdlParser.prototype.setSemanticCodeCompletionRepositoryAccess = function (access) {
            this.repositoryAccess = access;
        };
        BaseCdsDdlParser.prototype.initializeParser = function () {
            this.compilationUnit = IAstFactory.eINSTANCE.createCompilationUnit();
        };
        BaseCdsDdlParser.prototype.setRootNamespace = function (namespace) {
            this.compilationUnit.getStatements().push(namespace);
        };
        BaseCdsDdlParser.prototype.createNamespace = function (path) {
            var namespace = IAstFactory.eINSTANCE.createNamespaceDeclaration();
            namespace.setNamePath(path);
            return namespace;
        };
        BaseCdsDdlParser.prototype.createContextWithToken = function (name) {
            var context = IAstFactory.eINSTANCE.createContextDeclaration();
            context.setNameToken(name);
            return context;
        };
        BaseCdsDdlParser.prototype.createContext = function (path) {
            var context = IAstFactory.eINSTANCE.createContextDeclaration();
            context.setNamePath(path);
            return context;
        };
        BaseCdsDdlParser.prototype.addContextComponent = function (context, component) {
            if (context != null && component != null) {
                context.getStatements().push(component);
            }
        };
        BaseCdsDdlParser.prototype.addEntityElement = function (entity, elem_decl) {
            if (entity != null && elem_decl != null) {
                entity.getElements().push(elem_decl);
            }
        };
        BaseCdsDdlParser.prototype.initializeElement = function (element, id, keyToken, nullableToken, elementToken, notToken) {
            element.setNameToken(id);
            element.setElementToken(elementToken);
            element.setKeyToken(keyToken);
            element.setNullableToken(nullableToken);
            element.setNotToken(notToken);
        };
        BaseCdsDdlParser.prototype.setNotToken = function (element, notToken) {
            element.setNotToken(notToken);
        };
        BaseCdsDdlParser.prototype.setNullableToken = function (element, nullableToken) {
            element.setNullableToken(nullableToken);
        };
        BaseCdsDdlParser.prototype.createType = function (path) {
            var type = IAstFactory.eINSTANCE.createTypeDeclaration();
            type.setNamePath(path);
            return type;
        };
        BaseCdsDdlParser.prototype.addTypeElement = function (componentDeclaration, element) {
            if (element != null) {
                componentDeclaration.getElements().push(element);
            }
        };
        BaseCdsDdlParser.prototype.initializeTypeComponent = function (element, id, elementToken) {
            element.setNameToken(id);
            element.setElementToken(elementToken);
        };
        BaseCdsDdlParser.prototype.createAttributeTypeOf = function (typeIdPath) {
            var attribute = IAstFactory.eINSTANCE.createAttributeDeclaration();
            attribute.setTypeOfPath(typeIdPath);
            return attribute;
        };
        BaseCdsDdlParser.prototype.createAttribute = function (typeIdPath) {
            var attribute = IAstFactory.eINSTANCE.createAttributeDeclaration();
            attribute.setTypeIdPath(typeIdPath);
            return attribute;
        };
        BaseCdsDdlParser.prototype.createAnnotationDeclarationWithPath = function (namePath) {
            var declaraion = IAstFactory.eINSTANCE.createAnnotationDeclaration();
            declaraion.setCompilationUnit(this.compilationUnit);
            declaraion.setNamePath(namePath);
            return declaraion;
        };
        BaseCdsDdlParser.prototype.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery = function () {
            if (this.m_current != null && this.m_scanner != null) {
                this.m_current.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery(this.m_scanner.getStateCopy());
            }
        };
        BaseCdsDdlParser.prototype.skipTokenPublic = function () {
            this.skipToken();
        };
        BaseCdsDdlParser.prototype.setCurrentTokenIndex = function (token) {
            var idx = this.m_scanner.getInput().indexOf(token);
            this.m_current.m_la_index = idx;
            this.m_current.setPathLATokenNum(token.m_num);
            this.m_scanner.getStateDirect().m_input_pos = idx + 1;
        };
        BaseCdsDdlParser.prototype.recoverToPreviousCommitInCurrentRule = function () {

            var me = this;
            this.recoverToPCIndex(function () {
                //jump back to last %COMMIT in current rule and continue from there
                while (me.m_current.m_PC.m_opcode != Instruction.OP_SYS_CALL) {
                    me.incrementPCdelta(-1);
                }
                me.incrementPC();
            });

        };
        BaseCdsDdlParser.prototype.recoverToPCIndex = function (hook) {

            var sf = this.m_current.m_BP.getStackframe();
            var save_BP = sf.m_save_BP;
            var save_PC_index = sf.m_save_PC_index;

            sf = this.m_current.m_BP_original.getStackframe();
            this.m_current.m_BP = new FramePtr(sf);
            sf.setLastTokenIndex(this.m_current.m_la_index);
            sf.m_save_BP = save_BP;
            sf.m_save_PC_index = save_PC_index;

            hook();

            this.m_current.m_la_index_original = this.m_current.m_la_index;
            this.m_current.m_la_num_original = this.m_current.m_la_num;

            this.m_current.m_scanner_state.m_input_pos = this.m_current.m_la_index;
            this.m_current.m_scanner_state_original.m_input_pos = this.m_current.m_la_index;

            this.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery();
            this.setVMProceed();

        };
        BaseCdsDdlParser.prototype.recoverToStartOfRule = function (ruleName) {

            var me = this;
            this.recoverToPCIndex(function () {
                var idx = me.getByteCode().getStartIndex(ruleName);
                //jump back to start of rule and continue from there
                me.incrementPCdelta(idx - me.m_current.m_PC_index);
            });

        };
        BaseCdsDdlParser.prototype.returnFromOneStackframeForErrorRecoveryPublic = function () {
            this.returnFromOneStackframeForErrorRecovery();
        };
        BaseCdsDdlParser.prototype.getTypedCodeCompletionNames = function (resolver) {
            var result = this.getAdjustedTypedCodeCompletionNames(resolver);
            if (result.length == 0) {
                this.addWarningProposalInCaseOfErrorToken();
                if (this.semanticCodeCompletionProposals.length > 0) {
                    result = this.getAdjustedTypedCodeCompletionNames(resolver);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getAdjustedTypedCodeCompletionNames = function (resolver) {
            var result = AbstractDdlParser.prototype.getTypedCodeCompletionNames.call(this, resolver);
            for (var i = result.length - 1; i >= 0; i--) {
                var c = result[i];
                if (c != null) {
                    if (c.getName() === "never match this rule ;") {
                        rnd.Utils.arrayRemove(result, i);
                    }
                    if (c.getName() === "\\\"") {
                        rnd.Utils.arrayRemove(result, i);
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getTypedCompletionNames = function (resolver) {
            var result = AbstractDdlParser.prototype.getTypedCompletionNames.call(this, resolver);
            for (var i = result.length - 1; i >= 0; i--) {
                var c = result[i];
                if (c != null) {
                    if (c.name === "never match this rule ;") {
                        rnd.Utils.arrayRemove(result, i);
                    }
                    if (c.name === "\\\"") {
                        rnd.Utils.arrayRemove(result, i);
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.addAliasOfUsingToCoCoProposals = function (current_token, pathInLower, project, rule) {
            if (this.supportsBackendMultipleFiles() == false) {
                return;
            }
            var aliasProposal = [];
            var statements = this.cocoCompilationUnit.getStatements();
            var aliasToken = null;
            for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                var stmt = statements[stmtCount];
                if (!(stmt instanceof UsingDirectiveImpl)) {
                    continue;
                }
                var usingDir = stmt;
                var name = usingDir.getNameWithNamespaceDelimeter();
                name = name + ".";
                var resolvePath = new CodeResolver().resolvePath(usingDir.getStartOffset(), name, this.cocoCompilationUnit, project);
                if (resolvePath == null) {
                    continue;
                }
                if (rnd.Utils.stringCompareTo(rule, IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME) == 0) {
                    if (resolvePath instanceof TypeDeclarationImpl) {
                        aliasToken = usingDir.getAlias();
                        if (aliasToken != null) {
                            aliasProposal.push(new HanaDdlCodeCompletion(aliasToken.m_lexem, IBaseCdsDdlParserConstants.ALIAS_TYPE));
                        }
                    }
                } else if (rnd.Utils.stringCompareTo(rule, IBaseCdsDdlParserConstants.FROM_CLAUSE_RULE_NAME) == 0) {
                    if (resolvePath instanceof ViewDefinitionImpl || resolvePath instanceof EntityDeclarationImpl) {
                        aliasToken = usingDir.getAlias();
                        if (aliasToken != null) {
                            aliasProposal.push(new HanaDdlCodeCompletion(aliasToken.m_lexem, IBaseCdsDdlParserConstants.ALIAS_TYPE));
                        }
                    }
                } else if (rnd.Utils.stringCompareTo(rule, IBaseCdsDdlParserConstants.TYPE_TYPE_OF_RULE_NAME) == 0) {
                    if (resolvePath instanceof TypeDeclarationImpl) {
                        var td = resolvePath;
                        if (!(CompilationUnitManager.isStructuredType(td))) {
                            continue;
                        }
                        aliasToken = usingDir.getAlias();
                        if (aliasToken != null) {
                            aliasProposal.push(new HanaDdlCodeCompletion(aliasToken.m_lexem, IBaseCdsDdlParserConstants.ALIAS_TYPE));
                        }
                    } else if (resolvePath instanceof ViewDefinitionImpl || resolvePath instanceof EntityDeclarationImpl) {
                        aliasToken = usingDir.getAlias();
                        if (aliasToken != null) {
                            aliasProposal.push(new HanaDdlCodeCompletion(aliasToken.m_lexem, IBaseCdsDdlParserConstants.ALIAS_TYPE));
                        }
                    }
                } else if (rnd.Utils.stringCompareTo(rule, IBaseCdsDdlParserConstants.TYPE_ASSOC_RULE_NAME) == 0) {
                    if (resolvePath instanceof ViewDefinitionImpl || resolvePath instanceof EntityDeclarationImpl) {
                        aliasToken = usingDir.getAlias();
                        if (aliasToken != null) {
                            aliasProposal.push(new HanaDdlCodeCompletion(aliasToken.m_lexem, IBaseCdsDdlParserConstants.ALIAS_TYPE));
                        }
                    }
                }
            }
            this.addHanaComplToSemanticCompletions(current_token, pathInLower, aliasProposal);
        };
        BaseCdsDdlParser.prototype.determinePosition = function (currentToken, includeNamespace) {
            this.semanticCoCoCallCount++;
            var result = new CurrentPosition();
            if (currentToken != null) {
                result.pathInLower = BaseCdsDdlParser.getPathInLowerCase(this.m_scanner.getInput(), currentToken, includeNamespace);
                result.offset = currentToken.m_offset;
                result.statement = this.getCurrentStmt(result.offset);
            }
            return result;
        };
        BaseCdsDdlParser.prototype.isUnfinishedQuotedIdentifier = function (token) {
            if (token == null || token.m_lexem == null) {
                return false;
            }
            if (rnd.Utils.stringStartsWith(token.m_lexem, "\"") == true && rnd.Utils.stringEndsWith(token.m_lexem, "\"") == false) {
                return true;
            }
            return false;
        };
        BaseCdsDdlParser.prototype.onMatchCollectCompletionSuggestionsOrAbort = function (current_token, matched_terminal, current, context) {
            var match = this.getByteCodeTokenInfo().getTokenNameUS(matched_terminal);
            if (match === "\\\"") {
                return false;
            }
            var completion = current.getCompletion();
            if (completion instanceof IdNextKeywordCompletion) {
                current.setCompletion(null);
                if (IBaseCdsDdlParserConstants.NEVER_MATCH_RULE_RULE_NAME === current.getStackframe().getRuleInfo().getRuleName()) {
                    return false;
                }
                if (matched_terminal != this.getByteCode().getActualNUMID() && this.isKeywordThatDoesNotNeedWhitespace(match) && this.isUnfinishedQuotedIdentifier(current_token) == false) {
                    var compl = new HanaDdlCodeCompletion(match, DdlCodeCompletionType.KEYWORD);
                    compl.setDoReplaceTokenAtCurrentOffset(false);
                    if (rnd.Utils.arrayContains(this.semanticCodeCompletionProposals, compl) == false) {
                        this.semanticCodeCompletionProposals.push(compl);
                    }
                }
                return false;
            }
            var cont = this.handleDclUseCases(current.getStackframe(), match, current_token);
            if (cont == false) {
                return false;
            }
            var keywordCompletionDetected = false;
            if (this.isUnfinishedQuotedIdentifier(current_token) == false) {
                keywordCompletionDetected = this.onMatchCollectCompletionSuggestionsOrAbortFromTokenCoCoParser(current_token, matched_terminal, current, context, match);
            }
            if (this.repositoryAccess != null) {
                if (keywordCompletionDetected == false || this.isEmptyIncompleteToken(current_token)) {
                    var sf = current.getStackframe();
                    if (rnd.Utils.stringEqualsIgnoreCase("#id#", match)) {
                        if (this.semanticCoCoCallCount > 0) {
                            return false;
                        }
                        var project = this.repositoryAccess.getProject();
                        if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.DEF_ID_RULE_NAME) == true) {
                        } else if (this.isCoCoAnnotation(context)) {
                            if (this.isOneOfTheRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME, IBaseCdsDdlParserConstants.TYPE_DECLARATION, IBaseCdsDdlParserConstants.VIEW_DECLARATION_RULE_NAME])) {
                                return false;
                            }
                            this.fillAnnotationProposals(context, current_token, matched_terminal);
                            return false;
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.CONST_VALUE_RULE_NAME) || this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.DEFAULT_CLAUSE) || this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ANNOTATION_DEFAULT_CLAUSE)) {
                            this.getConstValueCompletions(current_token, project, sf);
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.USING_DIRECTIVE) && !(this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.CDS_ALIAS_RULE_NAME)) && this.supportsBackendMultipleFiles()) {
                            var currentPosition = this.determinePosition(current_token, true);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".") || rnd.Utils.stringContains(currentPosition.pathInLower, "::")) {
                                var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                if (target == null && rnd.Utils.stringContains(currentPosition.pathInLower, "::")) {
                                    completions = completions.concat(this.getRootContextsFromProject(currentPosition.pathInLower));
                                } else {
                                    completions = completions.concat(this.getUsingCompletionsForPathTargetFromCoCoCu(target));
                                }
                            } else {
                                completions = completions.concat(this.getAllExternalArtifacts());
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ASSOCIATION_ON_CONDITION_RULE_NAME)) {
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(currentPosition.offset, this.cocoCompilationUnit);
                                if (assoc != null) {
                                    var sourceEntity = StmtUtil.getParentOfTypeDdlStatement(assoc);
                                    var p = sourceEntity.getName() + "." + currentPosition.pathInLower;
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, p, this.cocoCompilationUnit, project);
                                    if (target == null) {
                                        target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    }
                                    if (target != null) {
                                        completions = completions.concat(this.getCompletionsForTarget(target, assoc));
                                    }
                                }
                            } else {
                                var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(currentPosition.offset, this.cocoCompilationUnit);
                                if (assoc != null) {
                                    var sourceEntity = StmtUtil.getParentOfTypeDdlStatement(assoc);
                                    if (sourceEntity instanceof ViewDefinitionImpl || sourceEntity instanceof AspectDeclarationImpl) {
                                        var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(sourceEntity, currentPosition.offset);
                                        var viewSelect = StmtUtil.getParentOfTypeViewSelect(sourceRange);
                                        completions = completions.concat(this.getCompletionsForAssociationOnClause(viewSelect, assoc, currentPosition.offset));
                                    } else {
                                        completions = completions.concat(this.getCompletionsForTarget(sourceEntity, assoc));
                                        if (sourceEntity instanceof EntityDeclarationImpl) {
                                            completions.push(new HanaDdlCodeCompletion(sourceEntity.getName(), IBaseCdsDdlParserConstants.ENTITY_TYPE));
                                        }
                                    }
                                }
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEYS)) {
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var foreignKeyCompletions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(currentPosition.offset, this.cocoCompilationUnit);
                                if (assoc != null) {
                                    var p = assoc.getTargetEntityName() + "." + currentPosition.pathInLower;
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, p, this.cocoCompilationUnit, project);
                                    if (target instanceof TypeDeclarationImpl) {
                                        foreignKeyCompletions = foreignKeyCompletions.concat(this.getCompletionsForTarget(target, null));
                                    }
                                }
                            } else {
                                var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(currentPosition.offset, this.cocoCompilationUnit);
                                if (assoc != null) {
                                    var targetEntityPath = assoc.getTargetEntityName() + ".";
                                    var targetEntity = new CodeResolver().resolvePath(currentPosition.offset, targetEntityPath, this.cocoCompilationUnit, project);
                                    if (targetEntity instanceof EntityDeclarationImpl) {
                                        foreignKeyCompletions = foreignKeyCompletions.concat(this.getCompletionsForTarget(targetEntity, true, false, null));
                                    }
                                }
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, foreignKeyCompletions);
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.TYPE_TYPE_OF_RULE_NAME)) {
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                completions = completions.concat(this.getCompletionsForTarget(target, null));
                            } else {
                                completions = completions.concat(this.getContextsFromCoCoCuAndProject(currentPosition.offset, project));
                                completions = completions.concat(this.getLocalEntityOrTypeElementsFromCoCoCu(currentPosition.offset));
                                completions = completions.concat(this.getStructuredTypesFromCoCoCuAndProject(currentPosition.offset));
                                completions = completions.concat(this.getEntitiesFromCoCoCuAndProject(currentPosition.offset, project, currentPosition.statement, true));
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                            if (!(rnd.Utils.stringContains(currentPosition.pathInLower, "."))) {
                                this.addAliasOfUsingToCoCoProposals(current_token, currentPosition.pathInLower, project, IBaseCdsDdlParserConstants.TYPE_TYPE_OF_RULE_NAME);
                            }
                        } else if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.TYPE_ASSOC) || this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.PATH_SIMPLE, IBaseCdsDdlParserConstants.ASSOCIATION_TO_RULE_NAME, IBaseCdsDdlParserConstants.ADHOC_ELEMENT_DECLARATION_RULE_NAME])) {
                            var currentPosition = this.determinePosition(current_token, false);
                            if (currentPosition.pathInLower != null && rnd.Utils.stringEndsWith(rnd.Utils.stringTrim(currentPosition.pathInLower), ";")) {
                                currentPosition.pathInLower = currentPosition.pathInLower.substring(0, currentPosition.pathInLower.lastIndexOf(";"));
                            }
                            var completions = [];
                            if (currentPosition.pathInLower != null && rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                completions = completions.concat(this.getAssociationToCompletionsForPathTargetFromCoCoCu(target));
                            } else {
                                if (!(this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ASPECT_DECLARATION))) {
                                    completions.push(new HanaDdlCodeCompletion(this.getRootContextFromCoCoCu().getName(), IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                                }
                                completions = completions.concat(this.getContextsFromCoCoCuAndProject(currentPosition.offset, project));
                                completions = completions.concat(this.getEntitiesFromCoCoCuAndProject(currentPosition.offset, project, currentPosition.statement, true));
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                            if (currentPosition.pathInLower != null && !(rnd.Utils.stringContains(currentPosition.pathInLower, "."))) {
                                this.addAliasOfUsingToCoCoProposals(current_token, currentPosition.pathInLower, project, IBaseCdsDdlParserConstants.TYPE_ASSOC_RULE_NAME);
                            }
                        } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ELEMENT_DECLARATION, IBaseCdsDdlParserConstants.EXPRESSION])) {
                            // ElementDeclaration > Expression
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {

                                var assoc = BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration(currentPosition.offset, this.cocoCompilationUnit);
                                if (assoc != null) {
                                    // associations are not yet supported in SP11 (October 2015)
                                    //    var sourceEntity = StmtUtil.getParentOfTypeDdlStatement(assoc);
                                    //    var p = sourceEntity.getName() + "." + currentPosition.pathInLower;
                                    //    var targetEntity = new CodeResolver().resolvePath(currentPosition.offset, p, this.cocoCompilationUnit, project);
                                    //    if (targetEntity == null) {
                                    //        targetEntity  = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    //    }
                                    //    if (targetEntity != null) {
                                    //        completions = this.getCompletionsForEntity(targetEntity, true, false, null);
                                    //    }
                                } else {
                                    // structure elements
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    completions = completions.concat(this.getCompletionsForTarget(target, null));
                                }
                            } else {
                                var attribute = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                var entity = attribute.eContainer();
                                completions = this.getCompletionsForEntity(entity, true, false, null);
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME, IBaseCdsDdlParserConstants.TECHNICAL_CONFIGURATION])) {
                            // EntityDeclaration > TechnicalConfiguration
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.INDEX_DEFINITION, IBaseCdsDdlParserConstants.PATH_WITH_ORDER])) {
                                // EntityDeclaration > TechnicalConfiguration > IndexDefinition > PathWithOrder
                                if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                    // not possible for a PathWithOrder
                                } else {
                                    var indexDefinition = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                    var entity = indexDefinition.eContainer().eContainer();
                                    completions = this.getCompletionsForEntity(entity, true, false, null);
                                }
                            } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.FULLTEXT_INDEX_DEFINITION, IBaseCdsDdlParserConstants.PATH_SIMPLE])) {
                                // EntityDeclaration > TechnicalConfiguration > FulltextIndexDefinition > PathSimple
                                if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.FULLTEXT_INDEX_PARAMETERS)) {
                                    // EntityDeclaration > TechnicalConfiguration > FulltextIndexDefinition > PathSimple > FulltextIndexParameters
                                    var fulltextIndexParameter = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                    if (fulltextIndexParameter.languageColumn || fulltextIndexParameter.mimeTypeColumn) {
                                        // FulltextIndexParameter = languageClumn or mimeTypeColumn
                                        if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                            var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                            completions = completions.concat(this.getCompletionsForTarget(target, null));
                                        } else {
                                            var entity = fulltextIndexParameter.eContainer().eContainer().eContainer();
                                            completions = this.getCompletionsForEntity(entity, true, false, null);
                                        }
                                    }
                                } else {
                                    // EntityDeclaration > TechnicalConfiguration > FulltextIndexDefinition > PathSimple
                                    if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                        var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                        completions = completions.concat(this.getCompletionsForTarget(target, null));
                                    } else {
                                        var fulltextIndexDefinition = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                        var entity = fulltextIndexDefinition.eContainer().eContainer();
                                        completions = this.getCompletionsForEntity(entity, true, false, null);
                                    }
                                }
                            } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.PARTITION_DEFINITION, IBaseCdsDdlParserConstants.PATH_SIMPLE])) {
                                // EntityDeclaration > TechnicalConfiguration > PartitionDefinition > PathSimple
                                if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    completions = completions.concat(this.getCompletionsForTarget(target, null));
                                } else {
                                    var bestMatchingSourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                    var entity = StmtUtil.getParentOfTypeEntity(bestMatchingSourceRange);
                                    completions = this.getCompletionsForEntity(entity, true, true, null);
                                }
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME, IBaseCdsDdlParserConstants.SERIES_DEFINITION])) {
                            // EntityDeclaration > SeriesDefinition
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                completions = this.getCompletionsForTarget(target, null);
                            } else {
                                var bestMatchingSourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                                var entity = StmtUtil.getParentOfTypeEntity(bestMatchingSourceRange);
                                completions = this.getCompletionsForEntity(entity, true, false, null);
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.VIEW_DECLARATION_RULE_NAME, IBaseCdsDdlParserConstants.FROM_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.CONDITION])) {
                            // ViewDeclaration > FromKlaus > Condition
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var completions = [];
                            var ext = "";
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var lind = currentPosition.pathInLower.lastIndexOf(".");
                                ext = currentPosition.pathInLower.substring(0, lind) + ".";
                                currentPosition.pathInLower = currentPosition.pathInLower.substring(lind + 1);
                            } else {
                                ext = "";
                            }
                            // narrow the coco to the left and right side of the join
                            var bestMatchingSourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
                            var joinDataSource = StmtUtil.getParentOfTypeJoinDataSource(bestMatchingSourceRange);
                            completions = this.getProposalsForJoinDataSourceInFromClause(project, currentPosition.pathInLower, currentPosition.offset, ext, joinDataSource);
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, completions);
                        } else if (this.isOneOfTheRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ANNOTATION_TYPE_NAME_RULE, IBaseCdsDdlParserConstants.TYPE_NAME_RULE])) {
                            var currentPosition = this.determinePosition(current_token, false);
                            currentPosition.pathInLower = this.removeSemicolonIfAtLastPosition(currentPosition.pathInLower);
                            var typeNameProposals = [];
                            if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                typeNameProposals = typeNameProposals.concat(this.getTypeCompletionsForPathTargetFromCoCoCu(target));
                                var namespace = currentPosition.pathInLower.substring(0, currentPosition.pathInLower.lastIndexOf('.') + 1);
                                for (var primitiveTypeNameCount = 0; primitiveTypeNameCount < this.getPrimitiveTypes().length; primitiveTypeNameCount++) {
                                    var primitiveTypeName = this.getPrimitiveTypes()[primitiveTypeNameCount];
                                    if (rnd.Utils.stringStartsWith(primitiveTypeName, namespace)) {
                                        var nameWithoutNamespace = primitiveTypeName.substring(namespace.length);
                                        var proposalWithoutNamespace = HanaDdlCodeCompletion.HanaDdlCodeCompletion1(nameWithoutNamespace, IBaseCdsDdlParserConstants.TYPE_TYPE, true);
                                        typeNameProposals.push(proposalWithoutNamespace);
                                    }
                                }
                            } else {
                                typeNameProposals = typeNameProposals.concat(this.ensureBooleanTypeIsOnlyVisibleForAnnotationDefs(sf, this.getPrimitiveTypes()));
                                typeNameProposals = typeNameProposals.concat(this.getDefinedTypesFromCoCoCuAndProject(currentPosition.offset, currentPosition.statement));
                                typeNameProposals = typeNameProposals.concat(this.getContextsFromCoCoCuAndProject(currentPosition.offset, project));
                                typeNameProposals = typeNameProposals.concat(this.getBackendCdsTypeNameProposals(currentPosition, project));
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, typeNameProposals);
                            if (!(rnd.Utils.stringContains(currentPosition.pathInLower, "."))) {
                                this.addAliasOfUsingToCoCoProposals(current_token, currentPosition.pathInLower, project, IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME);
                            }
                        } else if (this.isOneOfTheRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.RULE_FROM_CLAUSE, IBaseCdsDdlParserConstants.FROM_CLAUSE_RULE_NAME]) && !(this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.TABLE_PATH_ALIAS_RULE_NAME))) {
                            var currentPosition = this.determinePosition(current_token, false);
                            var proposals = [];
                            if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.RULE_FROM_CLAUSE)) {
                                var results;
                                if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    results = this.getAssociationToCompletionsForPathTargetFromCoCoCu(target);
                                } else {
                                    results = this.getEntitiesFromCoCoCuAndProject(currentPosition.offset, project, currentPosition.statement, true);
                                    proposals = proposals.concat(this.getContextsFromCoCoCuAndProject(currentPosition.offset, project));
                                }
                                for (var resultCount = 0; resultCount < results.length; resultCount++) {
                                    var result = results[resultCount];
                                    if (result.getType() == IBaseCdsDdlParserConstants.VIEW_TYPE || result.getType() == IBaseCdsDdlParserConstants.CONTEXT_TYPE) {
                                        proposals.push(result);
                                    }
                                }
                            } else {
                                if (rnd.Utils.stringContains(currentPosition.pathInLower, ".")) {
                                    var target = new CodeResolver().resolvePath(currentPosition.offset, currentPosition.pathInLower, this.cocoCompilationUnit, project);
                                    if (target == null) {
                                        proposals = proposals.concat(this.getBackendDatasourceNameProposals(currentPosition, project, proposals));
                                    } else {
                                        proposals = proposals.concat(this.getAssociationToCompletionsForPathTargetFromCoCoCu(target));
                                    }
                                } else {
                                    proposals = proposals.concat(this.getContextsFromCoCoCuAndProject(currentPosition.offset, project));
                                    proposals = proposals.concat(this.getEntitiesFromCoCoCuAndProject(currentPosition.offset, project, currentPosition.statement, false));
                                    proposals = proposals.concat(this.getBackendDatasourceNameProposals(currentPosition, project, proposals));
                                }
                            }
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, proposals);
                            if (!(rnd.Utils.stringContains(currentPosition.pathInLower, "."))) {
                                this.addAliasOfUsingToCoCoProposals(current_token, currentPosition.pathInLower, project, IBaseCdsDdlParserConstants.FROM_CLAUSE_RULE_NAME);
                            }
                        } else if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ASPECT_EXPRESSION, IBaseCdsDdlParserConstants.RULE_SUBQUERY])) {
                            var currentPosition = this.determinePosition(current_token, false);
                            var proposals = [];
                            proposals = proposals.concat(this.getAspectsFromCoCoCuAndProject(currentPosition.offset, context, project, currentPosition.statement));
                            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, proposals);
                        } else if (this.isOneOfTheRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.QL_PATH_LIST_SELECT_ITEM_RULE_NAME, IBaseCdsDdlParserConstants.QL_SELECT_ITEM_RULE_NAME, IBaseCdsDdlParserConstants.WHERE_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.GROUP_BY_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.ORDER_BY_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.HAVING_CLAUSE_RULE_NAME])) {
                            if (this.isOneOfTheRuleNamesInHierarchyStopAtFirstRule(sf, [IBaseCdsDdlParserConstants.EXPR_ALIAS, IBaseCdsDdlParserConstants.QL_PATH_LIST_SELECT_ITEM_ALIAS], IBaseCdsDdlParserConstants.EXPRESSION) == false) {
                                this.addSelectListEntryWhereGroupByOrderByHavingCompletions(current_token, sf, project);
                            }
                        }
                        if (this.semanticCoCoCallCount > 0) {
                            this.addWarningProposalInCaseOfErrorToken();
                        }
                    }
                }
            }
            if (rnd.Utils.stringEqualsIgnoreCase("#id#", match) && keywordCompletionDetected == false && this.repositoryAccess != null) {
                current.setCompletion(new IdNextKeywordCompletion(null));
                return true;
            }
            return keywordCompletionDetected;
        };
        BaseCdsDdlParser.prototype.getBackendCdsTypeNameProposals = function (pos, project) {
            var result = [];
            if (this.repositoryAccess != null && pos != null && pos.pathInLower != null) {
                var names = this.repositoryAccess.getCdsTypeNames(pos.pathInLower);
                if (names == null) {
                    return [];
                }
                if (names == commonddl.AbstractDdlParser.INCOMPLETE_SIGNAL) {
                    var compl = new HanaDdlCodeCompletion(Messages.BaseCdsDdlParser_loading_code_completion_results, IBaseCdsDdlParserConstants.LOADING_TYPE);
                    compl.forceShow = true;
                    result.push(compl);
                    return result;
                }
                for (var i = 0; i < names.length; i++) {
                    var compl = new HanaDdlCodeCompletion.HanaDdlCodeCompletion1(names[i].name, names[i].type, false);
                    compl.isBackendCompletion = true;
                    if (IBaseCdsDdlParserConstants.TYPE_TYPE == compl.type || IBaseCdsDdlParserConstants.CONTEXT_TYPE == compl.type) {
                        // add externalNameDecl so that using stmt is added
                        var fqn = names[i].name;
                        if (fqn.charAt(0) == '"') {
                            fqn = fqn.substring(1, fqn.length - 1);
                        }
                        var ind = Math.max(fqn.lastIndexOf("."), fqn.lastIndexOf(":"));
                        var n = fqn;
                        if (ind > 0) {
                            n = fqn.substring(ind + 1);
                        }
                        compl = HanaDdlCodeCompletion.HanaDdlCodeCompletion2(fqn, this.cocoCompilationUnit, n, compl.type);
                        compl.setAdditionalDisplayString(fqn);
                        compl.isBackendCompletion = true;
                    }
                    result.push(compl);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getBackendColumnProposals = function (dataSourceName) {
            function enrichWithNamespaceFromUsing(name, cocoCompilationUnit) {
                if (cocoCompilationUnit == null) {
                    return name;
                }
                var stmts = cocoCompilationUnit.getStatements();
                if (stmts == null) {
                    return name;
                }
                for (var j = 0; j < stmts.length; j++) {
                    if (stmts[j] instanceof UsingDirectiveImpl) {
                        var ali = stmts[j].getAlias();
                        if (ali != null && rnd.Utils.stringEqualsIgnoreCase(ali.m_lexem, name) === true) {
                            var res = stmts[j].getNameWithNamespaceDelimeter();
                            return res;
                        }
                        var n = stmts[j].getName();
                        if (n != null) {
                            var ind = n.lastIndexOf(".");
                            if (ind > 0) {
                                n = n.substring(ind + 1);
                            }
                            if (rnd.Utils.stringEqualsIgnoreCase(n, name) === true) {
                                var res = stmts[j].getNameWithNamespaceDelimeter();
                                return res;
                            }
                        }
                    }
                }
                return name;
            }

            var result = [];
            if (this.repositoryAccess != null && dataSourceName != null && dataSourceName.length > 0) {
                dataSourceName = enrichWithNamespaceFromUsing(dataSourceName, this.cocoCompilationUnit);
                var names = this.repositoryAccess.getColumnNames(null, null, dataSourceName, null);
                if (names == null) {
                    return [];
                }
                if (names == commonddl.AbstractDdlParser.INCOMPLETE_SIGNAL) {
                    var compl = new HanaDdlCodeCompletion(Messages.BaseCdsDdlParser_loading_code_completion_results, IBaseCdsDdlParserConstants.LOADING_TYPE);
                    compl.forceShow = true;
                    result.push(compl);
                    return result;
                }
                for (var i = 0; i < names.length; i++) {
                    var compl = new HanaDdlCodeCompletion.HanaDdlCodeCompletion1(names[i], IBaseCdsDdlParserConstants.ELEMENT_TYPE, false);
                    compl.isBackendCompletion = true;
                    result.push(compl);
                }
            }
            return result;

        };
        BaseCdsDdlParser.prototype.getBackendDatasourceNameProposals = function (pos, project, proposals) {
            var result = [];
            if (this.repositoryAccess != null && pos != null && pos.pathInLower != null) {
                var names = this.repositoryAccess.getDataSourceNames(pos.pathInLower);
                if (names == null) {
                    return [];
                }
                if (names == commonddl.AbstractDdlParser.INCOMPLETE_SIGNAL) {
                    var compl = new HanaDdlCodeCompletion(Messages.BaseCdsDdlParser_loading_code_completion_results, IBaseCdsDdlParserConstants.LOADING_TYPE);
                    compl.forceShow = true;
                    result.push(compl);
                    return result;
                }
                for (var i = 0; i < names.length; i++) {
                    var compl = new HanaDdlCodeCompletion.HanaDdlCodeCompletion1(names[i].name, names[i].type, false);
                    compl.isBackendCompletion = true;
                    if (IBaseCdsDdlParserConstants.ENTITY_TYPE == compl.type) {
                        // add externalNameDecl so that using stmt is added
                        var fqn = names[i].name;
                        if (fqn.charAt(0) == '"') {
                            fqn = fqn.substring(1, fqn.length - 1);
                        }
                        var ind = Math.max(fqn.lastIndexOf("."), fqn.lastIndexOf(":"));
                        var n = fqn;
                        if (ind > 0) {
                            n = fqn.substring(ind + 1);
                        }
                        compl = HanaDdlCodeCompletion.HanaDdlCodeCompletion2(fqn, this.cocoCompilationUnit, n, IBaseCdsDdlParserConstants.ENTITY_TYPE);
                        compl.setAdditionalDisplayString(fqn);
                        compl.isBackendCompletion = true;
                    }
                    result.push(compl);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.handleDclUseCases = function (sf, match, currentToken) {
            if (this.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ASPECT_DECLARATION, IBaseCdsDdlParserConstants.WHERE_CLAUSE_RULE_NAME])) {
                var tokens = this.m_scanner.getInput();
                var currentTokenIndex = tokens.indexOf(currentToken);
                var previousToken = TokenUtil.getPreviousTokenIgnoringNLAndComment(tokens, currentTokenIndex - 1);
                if (rnd.Utils.stringEqualsIgnoreCase("where", match)) {
                    var prop = new HanaDdlCodeCompletion("where $user in", DdlCodeCompletionType.KEYWORD);
                    this.semanticCodeCompletionProposals.push(prop);
                    return false;
                } else if (rnd.Utils.stringEqualsIgnoreCase("where", previousToken.m_lexem)) {
                    if (rnd.Utils.stringEqualsIgnoreCase("#ID#", match)) {
                        var prop = new HanaDdlCodeCompletion("$user in", DdlCodeCompletionType.KEYWORD);
                        this.semanticCodeCompletionProposals.push(prop);
                    }
                    return false;
                } else if (rnd.Utils.stringEqualsIgnoreCase("$user", previousToken.m_lexem)) {
                    var prop = new HanaDdlCodeCompletion("in", DdlCodeCompletionType.KEYWORD);
                    if (!(rnd.Utils.arrayContains(this.semanticCodeCompletionProposals, prop))) {
                        this.semanticCodeCompletionProposals.push(prop);
                    }
                    return false;
                }
            }
            return true;
        };
        BaseCdsDdlParser.prototype.isPathWithMultipleEntries = function (path) {
            var sc = DdlScanner.createCopy(this.m_scanner);
            sc.setInput(path, new CursorPos(1, 1, null), new CursorPos(-1, -1, null));
            var tokens = sc.getInput();
            if (tokens.length <= 2) {
                return false;
            }
            return true;
        };
        BaseCdsDdlParser.prototype.addSelectListEntryWhereGroupByOrderByHavingCompletions = function (current_token, sf, project) {
            if (!(this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ASPECT_DECLARATION))) {
                this.getConstValueCompletions(current_token, project, sf);
            }
            var currentPosition = this.determinePosition(current_token, false);
            var origPathInLower = currentPosition.pathInLower;
            var proposals = [];
            var ext = "";
            if (this.isPathWithMultipleEntries(currentPosition.pathInLower)) {
                var lind = currentPosition.pathInLower.lastIndexOf(".");
                ext = currentPosition.pathInLower.substring(0, lind) + ".";
                currentPosition.pathInLower = currentPosition.pathInLower.substring(lind + 1);
            } else {
                ext = "";
            }
            var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentPosition.offset);
            var select = null;
            select = StmtUtil.getParentOfTypeSelect(sourceRange);
            if (select == null) {
                var rule = StmtUtil.getParentOfTypeRule(sourceRange);
                if (rule != null) {
                    var fromClause = rule.getFrom();
                    if (fromClause != null) {
                        var ds = fromClause.getDataSource();
                        if (ds != null) {
                            this.addProposalsForDataSourceInFromClause(project, currentPosition.pathInLower, currentPosition.offset, proposals, ext, ds);
                        }
                    }
                }
            } else if (select instanceof ViewSelectSetImpl && this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ORDER_BY_CLAUSE_RULE_NAME)) {
                var viewSelectSet = select;
                var leftViewSelect = StmtUtil.getFirstLeftViewSelect(viewSelectSet);
                var ds = leftViewSelect.getFrom();
                if (ds != null) {
                    if (leftViewSelect.getSelectList() != null && leftViewSelect.getSelectList().getEntries() != null) {
                        var entries = leftViewSelect.getSelectList().getEntries();
                        if (entries != null) {
                            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                                var entry = entries[entryCount];
                                var name = entry.getPublicName();
                                if (rnd.Utils.stringStartsWith(name, ds.getName()) || name.indexOf('.') < 0) {
                                    if (entry.getAlias() == null) {
                                        var ind = name.lastIndexOf(".");
                                        if (ind > 0) {
                                            name = name.substring(ind + 1);
                                        }
                                        proposals.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                                    } else {
                                        proposals.push(new HanaDdlCodeCompletion(entry.getAlias(), IBaseCdsDdlParserConstants.ALIAS_TYPE));
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                var allViewSelects = StmtUtil.getAllViewSelects(select);
                for (var viewSelectCount = 0; viewSelectCount < allViewSelects.length; viewSelectCount++) {
                    var viewSelect = allViewSelects[viewSelectCount];
                    var ds = viewSelect.getFrom();
                    if (ds != null) {
                        this.addProposalsForDataSourceInFromClause(project, currentPosition.pathInLower, currentPosition.offset, proposals, ext, ds);
                    }
                    if (this.isOneOfTheRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.QL_SELECT_LIST, IBaseCdsDdlParserConstants.WHERE_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.GROUP_BY_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.ORDER_BY_CLAUSE_RULE_NAME, IBaseCdsDdlParserConstants.HAVING_CLAUSE_RULE_NAME]) && rnd.Utils.stringContains(origPathInLower, ".") == false) {
                        var assocs = viewSelect.getAssociations();
                        for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                            var assoc = assocs[assocCount];
                            proposals.push(new HanaDdlCodeCompletion(assoc.getName(), IBaseCdsDdlParserConstants.ASSOC_TYPE));
                            var allElementCompletions = this.getAllElementCompletionsForAssociation(assoc, project, currentPosition.offset, true);
                            proposals = proposals.concat(allElementCompletions);
                        }
                    }
                    if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ORDER_BY_CLAUSE_RULE_NAME)) {
                        this.addSelectListAliases(proposals, viewSelect);
                    }
                }
            }
            this.addHanaComplToSemanticCompletions(current_token, currentPosition.pathInLower, proposals);
        };
        BaseCdsDdlParser.prototype.getProposalsForJoinDataSourceInFromClause = function (project, pathInLower, currentOffset, ext, joinDs) {
            var proposals = [];

            var leftDs = joinDs.getLeft();
            var rightDs = joinDs.getRight();
            var proposalsOfLeftDs = this.getProposalsForDataSourceInFromClause(project, pathInLower, currentOffset, ext, leftDs);
            var proposalsOfRightDs = this.getProposalsForDataSourceInFromClause(project, pathInLower, currentOffset, ext, rightDs);

            // add the proposals for the left and right sides and make their element names unambiguous
            for (var propCount = 0; propCount < proposalsOfLeftDs.length; propCount++) {
                var prop = proposalsOfLeftDs[propCount];
                if (prop.getType() === IBaseCdsDdlParserConstants.ELEMENT_TYPE) {
                    if (ext.length == 0) {
                        prop.name = leftDs.getName() + "." + prop.name;
                        prop.replacementString = prop.name;
                    }
                }
                proposals.push(prop);
            }
            for (var propCount = 0; propCount < proposalsOfRightDs.length; propCount++) {
                var prop = proposalsOfRightDs[propCount];
                if (prop.getType() === IBaseCdsDdlParserConstants.ELEMENT_TYPE) {
                    if (ext.length == 0) {
                        prop.name = rightDs.getName() + "." + prop.name;
                        prop.replacementString = prop.name;
                    }
                }
                proposals.push(prop);
            }

            return proposals;
        };
        BaseCdsDdlParser.prototype.getProposalsForDataSourceInFromClause = function (project, pathInLower, currentOffset, ext, ds) {
            var proposals = [];

            var fromPath = ds.getName();
            var codeResolver = new CodeResolver();
            var target = codeResolver.resolvePath(currentOffset, fromPath + "." + ext, //$NON-NLS-1$
                this.cocoCompilationUnit, project);
            if (ext.length == 0) {
                var alias = ds.getAlias();
                if (alias != null) {
                    proposals.push(new HanaDdlCodeCompletion(alias, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                } else {
                    var dsName = this.getLastPathEntry(fromPath);
                    proposals.push(new HanaDdlCodeCompletion(dsName, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                }
            }
            if (target instanceof ElementDeclarationImpl) {
                var targetName = (target).getName();
                var parent = target.eContainer();
                if (rnd.Utils.stringEqualsIgnoreCase(parent.getName(), targetName)) {
                    target = parent;
                } else {
                    target = codeResolver.resolvePath(currentOffset, ext, this.cocoCompilationUnit, project);
                }
            } else if (target == null) {
                target = codeResolver.resolvePath(currentOffset, ext, this.cocoCompilationUnit, project);
                if (target == null) {
                    // define view v as select from a.b { b.<coco>
                    // ==> instead of "a.b.b" use path "a.b"
                    var fromPathLower = fromPath.toLowerCase();
                    var extLower = ext.toLowerCase();
                    if (rnd.Utils.stringEndsWith(fromPathLower + ".", "." + extLower)) {
                        target = codeResolver.resolvePath(currentOffset, fromPath + ".", this.cocoCompilationUnit, project);
                    }
                }
            } else if (rnd.Utils.stringEqualsIgnoreCase(ext, fromPath + ".")) {
                var props = this.getSelectListCompletionsForPathTargetFromCoCoCu(ds, target, ext, project, currentOffset, true);
                for (var propCount = 0; propCount < props.length; propCount++) {
                    var prop = props[propCount];
                    if (rnd.Utils.stringStartsWith(prop.getName().toLowerCase(), pathInLower)) {
                        proposals.push(prop);
                    }
                }
                target = codeResolver.resolvePath(currentOffset, ext, this.cocoCompilationUnit, project);
                if (target instanceof ElementDeclarationImpl) {
                    var targetName = (target).getName();
                    var parent = target.eContainer();
                    if (rnd.Utils.stringEqualsIgnoreCase(parent.getName(), targetName)) {
                        target = parent;
                    }
                }
            }
            var props = this.getSelectListCompletionsForPathTargetFromCoCoCu(ds, target, ext, project, currentOffset, true);
            for (var propCount = 0; propCount < props.length; propCount++) {
                var prop = props[propCount];
                if (rnd.Utils.stringStartsWith(prop.getName().toLowerCase(), pathInLower)) {
                    proposals.push(prop);
                }
            }

            return proposals;
        };
        BaseCdsDdlParser.prototype.addProposalsForDataSourceInFromClause = function (project, pathInLower, currentOffset, proposals, ext, ds) {

            var props = [];

            if (ds instanceof JoinDataSourceImpl) {
                // JoinDataSourceImpl
                props = this.getProposalsForJoinDataSourceInFromClause(project, pathInLower, currentOffset, ext, ds);
            } else {
                // DataSourceImpl
                props = this.getProposalsForDataSourceInFromClause(project, pathInLower, currentOffset, ext, ds);
            }

            for (var propCount = 0; propCount < props.length; propCount++) {
                proposals.push(props[propCount]);
            }
        };
        BaseCdsDdlParser.prototype.getLastPathEntry = function (fromPath) {
            if (fromPath.length == 0) {
                return fromPath;
            }
            var sc = DdlScanner.createCopy(this.m_scanner);
            sc.setInput(fromPath, new CursorPos(1, 1, null), new CursorPos(-1, -1, null));
            var tokens = sc.getInput();
            var last = tokens[tokens.length - 2];
            if (last != null) {
                return last.m_lexem;
            }
            return fromPath;
        };
        BaseCdsDdlParser.prototype.ensureBooleanTypeIsOnlyVisibleForAnnotationDefs = function (sf, primitiveTypes) {
            if (rnd.Utils.arrayContains(primitiveTypes, PrimitiveTypeUtil.BOOLEAN)) {
                if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ANNOTATION_DECLARATION) == false) {
                    var copy = primitiveTypes.slice();
                    rnd.Utils.arrayRemove(copy, PrimitiveTypeUtil.BOOLEAN);
                    return this.createTypeHanaDdlCodeCompletions(copy);
                }
            }
            return this.createTypeHanaDdlCodeCompletions(primitiveTypes);
        };
        BaseCdsDdlParser.prototype.createTypeHanaDdlCodeCompletions = function (types) {
            var result = [];
            for (var typeCount = 0; typeCount < types.length; typeCount++) {
                var type = types[typeCount];
                result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion1(type, IBaseCdsDdlParserConstants.TYPE_TYPE, true));
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getCompletionsForAssociationOnClause = function (viewSelect, assoc, currentOffset) {
            var result = [];
            if (viewSelect == null) {
                return result;
            }
            var from = viewSelect.getFrom();
            if (from == null) {
                return result;
            }
            var fromName = from.getName();
            var alias = from.getAlias();
            if (alias != null) {
                result.push(new HanaDdlCodeCompletion(alias, IBaseCdsDdlParserConstants.ALIAS_TYPE));
            } else {
                result.push(new HanaDdlCodeCompletion(fromName, IBaseCdsDdlParserConstants.ENTITY_TYPE));
            }
            var name = fromName + ".";
            var resolved = new CodeResolver().resolvePath(from.getStartOffset(), name, this.cocoCompilationUnit, this.repositoryAccess.getProject());
            if (resolved != null) {
                result = result.concat(this.getCompletionsForTarget(resolved, assoc));
            }
            if (assoc != null) {
                result.push(new HanaDdlCodeCompletion(assoc.getName(), IBaseCdsDdlParserConstants.ASSOC_TYPE));
                var allElementCompletions = this.getAllElementCompletionsForAssociation(assoc, this.repositoryAccess.getProject(), currentOffset, false);
                result = result.concat(allElementCompletions);
            }
            return result;
        };
        BaseCdsDdlParser.prototype.isKeywordThatDoesNotNeedWhitespace = function (match) {
            var specialMatches = [".", ":", "::", "{", "}", ",", "[", "]"];
            if (match != null && rnd.Utils.arrayContains(specialMatches, match)) {
                return true;
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getPrimitiveTypes = function () {

            var version = this.getByteCodeVersion();
            var VersionsFactory = require("hanaddl/VersionsFactory");
            if (VersionsFactory.version1 === version) {
                return BaseCdsDdlParser.primitiyeTypeNamesV1;
            } else if (VersionsFactory.version2 === version) {
                return BaseCdsDdlParser.primitiyeTypeNamesV2;
            } else {
                return BaseCdsDdlParser.primitiyeTypeNamesV3;
            }

        };
        BaseCdsDdlParser.prototype.fillAnnotationProposals = function (context, current_token, matched_terminal) {
            this.annotationCoCoCount++;
            if (this.annotationCoCoCount > 1) {
                return;
            }
            var annotations = HanaAnnotationUtil.getAnnotationsAsStringList(this.getVisibleAnnotations(this.supportedAnnotations, current_token));
            var match = this.getByteCodeTokenInfo().getTokenNameUS(matched_terminal);
            if (match === "{" || match === "[") {
                return;
            }
            if (this.isCoCoAnnotationValue(context)) {
                var definition = this.getAnnotationDefinition1(context);
                var elementDeclaration = annotations[definition];
                if (elementDeclaration == null) {
                    if (rnd.Utils.stringEqualsIgnoreCase("Catalog.index.elementNames", definition)) {
                        if (this.isRulenameInHierarchy3(context.getStackframe(), IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE, AbstractDdlParser.RECORD_COMPONENT_RULE) == false) {
                            return;
                        }
                        var nextNode = this.findNextAstNodeForCurrentOffset(this.cocoCompilationUnit.getStatements(), current_token.m_offset, null);
                        if (nextNode instanceof EntityDeclarationImpl) {
                            var pathInLower = BaseCdsDdlParser.getPathInLowerCase(this.m_scanner.getInput(), current_token, false);
                            var completions = this.getCompletionsForEntity(nextNode, true, false, null);

                            var hasQuotesInPath = rnd.Utils.stringStartsWith(pathInLower, "'");
                            for (var completionsCount = 0; completionsCount < completions.length; completionsCount++) {
                                completions[completionsCount].name = CompareUtil.removeQuotes(completions[completionsCount].name);
                                if (!hasQuotesInPath) {
                                    completions[completionsCount].name = "'" + completions[completionsCount].name + "'";
                                }
                            }

                            if (hasQuotesInPath) {
                                pathInLower = pathInLower.substring(1);
                            }
                            this.addHanaComplToSemanticCompletions(current_token, pathInLower, completions);
                        }
                        return;
                    }
                    elementDeclaration = HanaAnnotationUtil.getAnnotationElementForPath(definition, this.supportedAnnotations);
                }
                if (elementDeclaration != null && elementDeclaration.isArrayType()) {
                    if (this.isRulenameInHierarchy2(context.getStackframe(), IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE) == false) {
                        return;
                    }
                    var at = elementDeclaration.getAnonymousType();
                    if (at != null) {
                        if (this.isRulenameInHierarchy3(context.getStackframe(), IBaseCdsDdlParserConstants.RECORD_COMPONENT, IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE) == false) {
                            return;
                        }
                    }
                }
                var annotationValueProposals = this.getAnnotationValueCompletions(elementDeclaration, current_token);
                var props = [];
                for (var proposalCount = 0; proposalCount < annotationValueProposals.length; proposalCount++) {
                    var proposal = annotationValueProposals[proposalCount];
                    var comp = new HanaDdlCodeCompletion(proposal, DdlCodeCompletionType.ANNOTATION);
                    props.push(comp);
                }
                var pathInLower = BaseCdsDdlParser.getPathInLowerCase(this.m_scanner.getInput(), current_token, false);
                this.addHanaComplToSemanticCompletions(current_token, pathInLower, props);
            } else {
                if (this.isRulenameInHierarchy2(context.getStackframe(), IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE)) {
                    this.addAnnotationArrayElements(context, current_token);
                } else {
                    for (var annotCount = 0; annotCount < Object.keys(annotations).length; annotCount++) {
                        var annot = Object.keys(annotations)[annotCount];
                        var elementDeclaration = annotations[annot];
                        var proposal = this.getAnnotationDefinitionCompletion(annot, elementDeclaration);
                        if (proposal == null || proposal.length == 0) {
                            continue;
                        }
                        var insertionString = this.getCompletionAnnotationInsertionString(proposal, context);
                        var comp = new HanaDdlCodeCompletion(insertionString, DdlCodeCompletionType.ANNOTATION);
                        if (elementDeclaration.isArrayType()) {
                            comp.setAnnotationElementDeclaration(elementDeclaration);
                        }
                        if (rnd.Utils.arrayContains(this.semanticCodeCompletionProposals, comp) == false && insertionString != null) {
                            this.semanticCodeCompletionProposals.push(comp);
                        }
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.addAnnotationArrayElements = function (context, current_token) {
            var definition = this.getAnnotationDefinition1(context);
            var pathInLower = BaseCdsDdlParser.getPathInLowerCase(this.m_scanner.getInput(), current_token, false);
            if (pathInLower != null) {
                if (pathInLower.length > 0) {
                    if (rnd.Utils.stringContains(definition, ".")) {
                        definition = definition.substring(0, definition.lastIndexOf("."));
                    }
                }
                var ed = HanaAnnotationUtil.getAnnotationElementForPath(definition, this.supportedAnnotations);
                if (ed != null) {
                    var at = ed.getAnonymousType();
                    if (at != null) {
                        if (this.isRulenameInHierarchy3(context.getStackframe(), IBaseCdsDdlParserConstants.RECORD_COMPONENT, IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE) == false) {
                            return;
                        }
                        var props = [];
                        for (var elCount = 0; elCount < at.getElements().length; elCount++) {
                            var el = at.getElements()[elCount];
                            var n = el.getName();
                            var comp = new HanaDdlCodeCompletion(n, DdlCodeCompletionType.ANNOTATION);
                            props.push(comp);
                        }
                        this.addHanaComplToSemanticCompletions(current_token, pathInLower, props);
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.isAnnotationRelevant = function (annotationListOfAnnotation, annotName, scopeAtCurrentPosition, isRootStmt) {
            if (scopeAtCurrentPosition == null) {
                return false;
            }
            var scopeAnnotation = this.getScopeAnnotation(annotationListOfAnnotation);
            if (scopeAtCurrentPosition === "#ANY") {
                return true;
            } else if (this.containsScope(scopeAnnotation.getValue(), scopeAtCurrentPosition)) {
                return true;
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getCoCoScope = function (node) {
            if (node instanceof ContextDeclarationImpl) {
                return "#CONTEXT";
            } else if (node instanceof EntityDeclarationImpl) {
                return "#ENTITY";
            } else if (node instanceof TypeDeclarationImpl) {
                return "#TYPE";
            } else if (node instanceof ViewDefinitionImpl) {
                return "#VIEW";
            } else if (node instanceof AccessPolicyDeclarationImpl) {
                return "#ACCESSPOLICY";
            } else if (node instanceof DummyNode) {
                return "#ANY";
            }
            return null;
        };
        BaseCdsDdlParser.prototype.findNextAstNodeForCurrentOffset = function (stmts, current_offset, last) {
            var parent = last;
            if (stmts != null) {
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    var stmtStartOffset = stmt.getStartOffset();
                    if (stmtStartOffset > current_offset) {
                        return stmt;
                    }
                    last = stmt;
                    if (stmt instanceof ContextDeclarationImpl || stmt instanceof AccessPolicyDeclarationImpl) {
                        var res = this.findNextAstNodeForCurrentOffset(stmt.getStatements(), current_offset, last);
                        if (res != null && !(res instanceof DummyNode)) {
                            return res;
                        } else {
                            var so = stmt.getStartOffset();
                            var eo = stmt.getEndOffset();
                            if (eo < 0) {
                                if (this.isRootStmt(stmt)) {
                                    return res;
                                }
                                var next = CompilationUnitUtil.getNextStatement1(stmt);
                                if (next != null) {
                                    eo = next.getStartOffset();
                                }
                            }
                            if (current_offset >= so && current_offset < eo) {
                                return null;
                            }
                        }
                    } else if (stmt instanceof TypeDeclarationImpl || stmt instanceof EntityDeclarationImpl || stmt instanceof ViewDefinitionImpl || stmt instanceof RoleDeclarationImpl || stmt instanceof AspectDeclarationImpl) {
                        var so = stmt.getStartOffset();
                        var eo = stmt.getEndOffset();
                        if (eo < 0) {
                            var next = CompilationUnitUtil.getNextStatement1(stmt);
                            if (next != null) {
                                eo = next.getStartOffset();
                            }
                        }
                        if (current_offset >= so && current_offset < eo) {
                            return null;
                        }
                        if (current_offset >= so && (eo < 0)) {
                            return null;
                        }
                    }
                }
            }
            if (parent == null) {
                return new DummyRootNode();
            }
            return new DummyNode();
        };
        BaseCdsDdlParser.prototype.isRootStmt = function (node) {
            if (node instanceof DummyRootNode) {
                return true;
            }
            return AbstractDdlParser.prototype.isRootStmt.call(this, node);
        };
        BaseCdsDdlParser.prototype.removeSemicolonIfAtLastPosition = function (pathInLower) {
            if (pathInLower != null && rnd.Utils.stringEndsWith(pathInLower, ";") == true) {
                pathInLower = pathInLower.substring(0, pathInLower.length - 1);
            }
            return pathInLower;
        };
        BaseCdsDdlParser.prototype.getConstValueCompletions = function (current_token, project, sf) {
            this.semanticCoCoCallCount++;
            if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.VIEW_DECLARATION_RULE_NAME)) {
                return;
            }
            var pathInLower = "";
            var currentOffset = -1;
            if (current_token != null) {
                pathInLower = BaseCdsDdlParser.getPathInLowerCase(this.m_scanner.getInput(), current_token, false);
                currentOffset = current_token.m_offset;
            }
            pathInLower = this.removeSemicolonIfAtLastPosition(pathInLower);
            var completions = [];
            if (rnd.Utils.stringContains(pathInLower, ".")) {
                var target = new CodeResolver().resolvePath(currentOffset, pathInLower, this.cocoCompilationUnit, project);
                if (target != null) {
                    completions = completions.concat(this.getConstCompletionsForPathTargetFromCoCoCu(target));
                }
            } else {
                completions = completions.concat(this.getConstsFromCoCoCuAndProject(currentOffset));
                completions = completions.concat(this.getEnumValueCompletions(currentOffset, project));
                completions = completions.concat(this.getContextsFromCoCoCuAndProject(currentOffset, project));
            }
            this.addHanaComplToSemanticCompletions(current_token, pathInLower, completions);
        };
        BaseCdsDdlParser.prototype.getEnumValueCompletions = function (currentOffset, project) {
            var result = [];
            if (this.cocoCompilationUnit != null) {
                var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentOffset);
                var el = StmtUtil.getParentOfTypeElementDeclaration(sourceRange);
                var en = this.getEnumerationDeclaration(currentOffset, project, el);
                if (en != null) {
                    for (var evCount = 0; evCount < en.getValues().length; evCount++) {
                        var ev = en.getValues()[evCount];
                        var symbol = ev.getSymbol();
                        if (symbol != null) {
                            var prop = "#" + symbol.m_lexem;
                            var compl = new HanaDdlCodeCompletion(prop, IBaseCdsDdlParserConstants.ELEMENT_TYPE);
                            result.push(compl);
                        }
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getEnumerationDeclaration = function (currentOffset, project, el) {
            if (el == null) {
                return null;
            }
            var en = el.getEnumerationDeclaration();
            if (en != null) {
                return en;
            }
            var cd = el.getAnonymousType();
            if (cd == null && this.isProjectNotNull(project) == true) {
                var typeId = el.getTypeId();
                if (typeId == null || typeId.length == 0) {
                    var typeOfPath = el.getTypeOfPath();
                    if (typeOfPath != null) {
                        typeId = typeOfPath.getPathString(false);
                    }
                }
                var typeDef = new CodeResolver().resolvePath(currentOffset, typeId + ".", this.cocoCompilationUnit, project);
                if (typeDef instanceof ElementDeclarationImpl) {
                    return this.getEnumerationDeclaration(currentOffset, project, typeDef);
                }
                if (typeDef instanceof ComponentDeclarationImpl) {
                    cd = typeDef;
                }
            }
            if (cd != null) {
                var tdEls = cd.getElements();
                if (tdEls != null) {
                    for (var tdElCount = 0; tdElCount < tdEls.length; tdElCount++) {
                        var tdEl = tdEls[tdElCount];
                        if (tdEl.getEnumerationDeclaration() != null) {
                            return tdEl.getEnumerationDeclaration();
                        }
                    }
                }
            }
            return null;
        };
        BaseCdsDdlParser.prototype.isProjectNotNull = function (project) {

            return true;

        };
        BaseCdsDdlParser.prototype.getConstCompletionsForPathTargetFromCoCoCu = function (target) {
            var result = [];
            if (target instanceof ContextDeclarationImpl) {
                var ctx = target;
                for (var stmtCount = 0; stmtCount < ctx.getStatements().length; stmtCount++) {
                    var stmt = ctx.getStatements()[stmtCount];
                    if (stmt instanceof ContextDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    } else if (stmt instanceof ConstDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONST_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getConstsFromCoCoCuAndProject = function (currentOffset) {
            var result = [];
            if (this.cocoCompilationUnit != null) {
                var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(currentOffset);
                this.getAllConsts(result, this.cocoCompilationUnit.getStatements(), currentFqn, currentOffset);
            }
            if (this.repositoryAccess != null && this.cocoCompilationUnit != null && this.supportsBackendMultipleFiles()) {
                var project = this.repositoryAccess.getProject();
                if (project != null) {
                    var fqnRootContextName = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                    var cds = CompilationUnitManager.singleton.getConstDeclarations2(project, fqnRootContextName);
                    for (var cdCount = 0; cdCount < cds.length; cdCount++) {
                        var cd = cds[cdCount];
                        var name = cd.getName();
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(cd, this.cocoCompilationUnit, name, IBaseCdsDdlParserConstants.CONST_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getAllConsts = function (result, stmts, currentFqn, currentOffset) {
            if (stmts != null) {
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof ConstDeclarationImpl) {
                        var cd = stmt;
                        var so = cd.getStartOffset();
                        var eo = cd.getEndOffset();
                        if (eo <= -1) {
                            continue;
                        }
                        if (currentOffset >= so && currentOffset <= eo) {
                            continue;
                        }
                        var name = cd.getName();
                        var fqn = ContextUtil.getFqnWithNamespaceForEObject(cd.eContainer());
                        if (fqn != null && rnd.Utils.stringContains(fqn, "::")) {
                            var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
                            if (insertPath) {
                                name = NamespaceUtil.getRelativeContextPath(fqn, currentFqn) + "." + name;
                            }
                        }
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONST_TYPE));
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        var ctx = stmt;
                        this.getAllConsts(result, ctx.getStatements(), currentFqn, currentOffset);
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.getRootContextsFromProject = function (path) {
            var result = [];
            if (this.repositoryAccess != null) {
                var project = this.repositoryAccess.getProject();
                var ind = path.indexOf("::");
                if (ind < 0) {
                    throw new Error();
                }
                path = path.substring(ind + 2);
                if (rnd.Utils.stringContains(path, ".")) {
                    throw new Error();
                }
                var rootContextPattern = path;
                var cds = CompilationUnitManager.singleton.getRootContexts(project, rootContextPattern);
                for (var cdCount = 0; cdCount < cds.length; cdCount++) {
                    var cd = cds[cdCount];
                    var compl = new HanaDdlCodeCompletion(cd.getName(), IBaseCdsDdlParserConstants.CONTEXT_TYPE);
                    result.push(compl);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getUsingCompletionsForPathTargetFromCoCoCu = function (target) {
            var result = [];
            if (target instanceof ContextDeclarationImpl) {
                var c = target;
                var stmts = c.getStatements();
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof TypeDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    } else if (stmt instanceof EntityDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                    } else if (stmt instanceof ViewDefinitionImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.VIEW_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getAllExternalArtifacts = function () {
            var result = [];
            if (this.repositoryAccess != null) {
                var project = this.repositoryAccess.getProject();
                if (project != null && this.cocoCompilationUnit != null) {
                    var fqnRootContextName = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                    var tds = CompilationUnitManager.singleton.getTypeDeclarations2(project, fqnRootContextName);
                    for (var tdCount = 0; tdCount < tds.length; tdCount++) {
                        var td = tds[tdCount];
                        var fqn = ContextUtil.getFqnWithNamespace(td);
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(null, null, fqn, IBaseCdsDdlParserConstants.TYPE_TYPE));
                    }
                    var eds = CompilationUnitManager.singleton.getEntityDeclarations2(project, fqnRootContextName);
                    for (var tdCount = 0; tdCount < eds.length; tdCount++) {
                        var td = eds[tdCount];
                        var fqn = ContextUtil.getFqnWithNamespace(td);
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(null, null, fqn, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                    }
                    var vds = CompilationUnitManager.singleton.getViewDefinitions2(project, fqnRootContextName);
                    for (var tdCount = 0; tdCount < vds.length; tdCount++) {
                        var td = vds[tdCount];
                        var fqn = ContextUtil.getFqnWithNamespace(td);
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(null, null, fqn, IBaseCdsDdlParserConstants.VIEW_TYPE));
                    }
                    var cts = CompilationUnitManager.singleton.getContextDeclarations(project, fqnRootContextName);
                    for (var tdCount = 0; tdCount < cts.length; tdCount++) {
                        var td = cts[tdCount];
                        var fqn = ContextUtil.getFqnWithNamespace(td);
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(null, null, fqn, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.addSelectListAliases = function (proposals, select) {
            var list = select.getSelectList();
            if (list == null) {
                return;
            }
            var entries = list.getEntries();
            if (entries == null) {
                return;
            }
            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                var entry = entries[entryCount];
                var alias = entry.getAlias();
                if (alias != null) {
                    var compl = new HanaDdlCodeCompletion(alias, IBaseCdsDdlParserConstants.ALIAS_TYPE);
                    proposals.push(compl);
                }
            }
        };
        BaseCdsDdlParser.getCoCoCompilationUnitAssociationDeclaration = function (offset, cu) {
            if (cu != null) {
                var statements = BaseCdsDdlParser.getAllDeclarationsThatCanCarryAssociationDeclarations(cu.getStatements());
                var best = null;
                for (var statementCount = 0; statementCount < statements.length; statementCount++) {
                    var statement = statements[statementCount];
                    var start = statement.getStartOffset();
                    var end = statement.getEndOffset();
                    if (offset >= start && offset <= end) {
                        best = statement;
                    } else if (end == -1 && offset >= start) {
                        var next = CompilationUnitUtil.getNextStatement1(statement);
                        if (next != null && offset > next.getStartOffset()) {
                            continue;
                        }
                        best = statement;
                    }
                }
                if (best != null) {
                    var bestAsso = null;
                    var bestAssoDiff = 99999999;
                    if (best instanceof EntityDeclarationImpl) {
                        for (var elCount = 0; elCount < (best).getElements().length; elCount++) {
                            var el = (best).getElements()[elCount];
                            if (el instanceof AssociationDeclarationImpl) {
                                var asso = el;
                                if (BaseCdsDdlParser.isBetterMatchingAssociation(asso, offset, bestAssoDiff)) {
                                    bestAsso = asso;
                                }
                            }
                        }
                    } else if (best instanceof ViewDefinitionImpl) {
                        var vd = best;
                        var selects = vd.getSelects();
                        for (var selectCount = 0; selectCount < selects.length; selectCount++) {
                            var select = selects[selectCount];
                            bestAsso = BaseCdsDdlParser.getBestMatchingAssociationDeclarationFromSelect(select, offset, bestAssoDiff);
                        }
                    } else if (best instanceof AspectDeclarationImpl) {
                        var aspect = best;
                        var select = aspect.getSelect();
                        bestAsso = BaseCdsDdlParser.getBestMatchingAssociationDeclarationFromSelect(select, offset, bestAssoDiff);
                    }
                    return bestAsso;
                }
            }
            return null;
        };
        BaseCdsDdlParser.getBestMatchingAssociationDeclarationFromSelect = function (select, offset, bestAssoDiff) {
            var bestAsso = null;
            for (var assocCount = 0; assocCount < select.getAssociations().length; assocCount++) {
                var assoc = select.getAssociations()[assocCount];
                if (BaseCdsDdlParser.isBetterMatchingAssociation(assoc, offset, bestAssoDiff)) {
                    bestAsso = assoc;
                }
            }
            return bestAsso;
        };
        BaseCdsDdlParser.isBetterMatchingAssociation = function (assoc, offset, bestAssoDiff) {
            var isBetter = false;
            var tp = assoc.getTargetEntityPath();
            if (tp != null) {
                var start = tp.getStartOffset();
                if (offset >= start) {
                    var delta = Math.abs(offset - start);
                    if (start > -1 && delta < bestAssoDiff) {
                        isBetter = true;
                        bestAssoDiff = delta;
                    }
                }
            }
            return isBetter;
        };
        BaseCdsDdlParser.getAllDeclarationsThatCanCarryAssociationDeclarations = function (statements) {
            var result = [];
            if (statements != null) {
                for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                    var stmt = statements[stmtCount];
                    if (StatementContainerImpl.isStatementContainerInstance(stmt)) {
                        result = result.concat(BaseCdsDdlParser.getAllDeclarationsThatCanCarryAssociationDeclarations((stmt).getStatements()));
                    } else if (stmt instanceof EntityDeclarationImpl || stmt instanceof ViewDefinitionImpl || stmt instanceof AspectDeclarationImpl) {
                        var ed = stmt;
                        result.push(ed);
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.isBackendCompl = function (proposal) {

            if (proposal.isBackendCompletion !== undefined && proposal.isBackendCompletion === true) {
                return true;
            }
            return false;

        };
        BaseCdsDdlParser.prototype.calculateReplacementOffsetAndLength = function (current_token) {
            var replacementOffset = -1;
            var replacementLength = -1;
            if (current_token != null) {
                var next = this.getNextTokenAfterTriggerToken(current_token);
                if (next != null) {
                    var nextAsSingleChar = (next.m_lexem != null && next.m_lexem.length == 1) ? next.m_lexem.charAt(0) : 0;
                    if ((Category.CAT_IDENTIFIER === next.m_category || Category.CAT_LITERAL === next.m_category || Category.CAT_INCOMPLETE === next.m_category || Category.CAT_MAYBE_KEYWORD === next.m_category || (next.getPayload() instanceof AnnotationPayload && nextAsSingleChar != '}' && nextAsSingleChar != ']'))) {
                        var region = this.calculateReplacementRegionForPredefinedNames(current_token, this.getPredefinedNames());
                        if (region != null) {
                            replacementOffset = region.getOffset();
                            replacementLength = region.getLength();
                        } else if (nextAsSingleChar == 0 || rnd.Utils.isLetterOrDigit(nextAsSingleChar) || nextAsSingleChar == '"') {
                            if (next.m_offset == current_token.m_offset + current_token.m_lexem.length) {
                                replacementOffset = current_token.m_offset;
                                if (next.m_lexem.length > 0 && DdlScanner.isWS(next.m_lexem.charAt(0))) {
                                    replacementLength = current_token.m_offset + current_token.m_lexem.length - replacementOffset;
                                } else {
                                    replacementLength = next.m_offset + next.m_lexem.length - replacementOffset;
                                }
                            } else if (rnd.Utils.stringStartsWith(current_token.m_lexem, "'") && rnd.Utils.stringEndsWith(next.m_lexem, "'")) {
                                replacementOffset = current_token.m_offset + 1;
                                replacementLength = next.m_offset + next.m_lexem.length - replacementOffset;
                                if (rnd.Utils.stringEndsWith(next.m_lexem, "'")) {
                                    replacementLength--;
                                }
                            }
                        }
                        if (next.getPayload() instanceof AnnotationPayload && nextAsSingleChar == ':') {
                            replacementLength = 0;
                        }
                    }
                }
            }
            return new Region(replacementOffset, replacementLength);
        };
        BaseCdsDdlParser.prototype.getClientProposalsToAddToSemanticCompletions = function (pathInLower, proposals, replacementInfo) {
            var replacementOffset = replacementInfo.getOffset();
            var replacementLength = replacementInfo.getLength();
            var clientProposalsToAdd = [];
            for (var proposalCount = 0; proposalCount < proposals.length; proposalCount++) {
                var proposal = proposals[proposalCount];
                var doIt = false;
                var proposalName = proposal.getName();
                proposalName = CompareUtil.removeQuotes(proposalName);
                if (proposal.forceShow !== undefined && proposal.forceShow === true) {
                    doIt = true;
                } else if (rnd.Utils.stringContains(pathInLower, ".") == false && rnd.Utils.stringContains(proposalName, ".")) {
                    var lastTypeNamePart = proposalName.substring(proposalName.lastIndexOf(".") + 1);
                    if (rnd.Utils.stringStartsWith(lastTypeNamePart.toLowerCase(), pathInLower)) {
                        doIt = true;
                    }
                } else if (rnd.Utils.stringContains(pathInLower, ".") && rnd.Utils.stringContains(proposalName, ".") == false) {
                    var pathNamePart = pathInLower.substring(pathInLower.lastIndexOf(".") + 1);
                    if (rnd.Utils.stringStartsWith(proposalName.toLowerCase(), pathNamePart)) {
                        doIt = true;
                    }
                }
                if (doIt == false && rnd.Utils.stringContains(pathInLower, "::") && rnd.Utils.stringContains(proposalName, ".") == false) {
                    var pathNamePart = pathInLower.substring(pathInLower.lastIndexOf("::") + 2);
                    if (rnd.Utils.stringStartsWith(proposalName.toLowerCase(), pathNamePart)) {
                        doIt = true;
                    }
                }
                if (rnd.Utils.stringStartsWith(proposalName.toLowerCase(), pathInLower)) {
                    doIt = true;
                }
                if (this.isBackendCompl(proposal)) {
                    continue;
                }
                if (doIt) {
                    if (replacementOffset > -1 && replacementLength > -1) {
                        proposal.setReplacementOffsetLength(replacementOffset, replacementLength);
                    }
                    if (rnd.Utils.arrayContains(this.semanticCodeCompletionProposals, proposal) == false && rnd.Utils.arrayContains(clientProposalsToAdd, proposal) == false) {
                        clientProposalsToAdd.push(proposal);
                    }
                }
            }
            return clientProposalsToAdd;
        };
        BaseCdsDdlParser.prototype.getBackendProposalsEliminatingDuplicates = function (proposals, replacementInfo, insertedClientProposals) {

            function getLastNamePart(name) {
                if (rnd.Utils.stringStartsWith(name, '"') && rnd.Utils.stringEndsWith(name, '"')) {
                    name = name.substring(1, name.length - 1);
                }
                var ind = name.lastIndexOf(".");
                if (ind > 0) {
                    name = name.substring(ind + 1);
                }
                return name;
            }

            function getNameWithType(proposalP) {
                var str = proposalP.name.toLowerCase();
                str = getLastNamePart(str);

                var typeName = proposalP.type.name;
                if (IBaseCdsDdlParserConstants.TABLE_TYPE == proposalP.type || IBaseCdsDdlParserConstants.SYNONYM_TYPE == proposalP.type) {
                    typeName = IBaseCdsDdlParserConstants.ENTITY_TYPE.name;
                }
                str += "_" + typeName;
                return str;
            }

            function createNameWithTypeList(proposalsParam) {
                var result = [];
                for (var i = 0; i < proposalsParam.length; i++) {
                    var str = getNameWithType(proposalsParam[i]);
                    result.push(str);
                }
                return result;
            }

            var backendProposalsToAdd = [];
            var replacementOffset = replacementInfo.getOffset();
            var replacementLength = replacementInfo.getLength();
            var nameList = createNameWithTypeList(insertedClientProposals);
            for (var proposalCount = 0; proposalCount < proposals.length; proposalCount++) {
                var proposal = proposals[proposalCount];
                if (this.isBackendCompl(proposal)) {
                    // Check is this proposal already available as a client proposal
                    var backendNameType = getNameWithType(proposal);
                    if (nameList.indexOf(backendNameType) >= 0) {
                        continue; //already in list
                    }
                    if (replacementOffset > -1 && replacementLength > -1) {
                        proposal.setReplacementOffsetLength(replacementOffset, replacementLength);
                    }
                    if (rnd.Utils.arrayContains(this.semanticCodeCompletionProposals, proposal) == false && rnd.Utils.arrayContains(backendProposalsToAdd, proposal) == false) {
                        backendProposalsToAdd.push(proposal);
                    }
                }
            }
            return backendProposalsToAdd;

        };
        BaseCdsDdlParser.prototype.addHanaComplToSemanticCompletions = function (current_token, pathInLower, proposals) {
            pathInLower = this.removeQuotesIncludingErrorCase(pathInLower);
            var replacementInfo = this.calculateReplacementOffsetAndLength(current_token);
            var clientProposalsToAdd = this.getClientProposalsToAddToSemanticCompletions(pathInLower, proposals, replacementInfo);
            this.semanticCodeCompletionProposals = this.semanticCodeCompletionProposals.concat(clientProposalsToAdd);
            var backendProposalsToAdd = this.getBackendProposalsEliminatingDuplicates(proposals, replacementInfo, clientProposalsToAdd);
            this.semanticCodeCompletionProposals = this.semanticCodeCompletionProposals.concat(backendProposalsToAdd);
        };
        BaseCdsDdlParser.prototype.getNextTokenAfterTriggerToken = function (cocoTriggerToken) {
            if (cocoTriggerToken == null || cocoTriggerToken.m_num != Constants.NUM_ANYKW) {
                throw new Error();
            }
            var tokens = this.m_scanner.getInput();
            var idx = tokens.indexOf(cocoTriggerToken);
            if (idx + 1 < tokens.length) {
                var next = tokens[idx + 1];
                return next;
            }
            return null;
        };
        BaseCdsDdlParser.prototype.getPredefinedNames = function () {
            if (this.predefinedNames == null) {
                this.predefinedNames = [];
                var predefinedDataTypes = this.getPrimitiveTypes();
                for (var predefinedDataTypeCount = 0; predefinedDataTypeCount < predefinedDataTypes.length; predefinedDataTypeCount++) {
                    var predefinedDataType = predefinedDataTypes[predefinedDataTypeCount];
                    var pattern = predefinedDataType.toLowerCase();
                    var bracketIndex = pattern.indexOf('(');
                    if (bracketIndex > 0) {
                        pattern = pattern.substring(0, bracketIndex + 1);
                        this.predefinedNames.push(pattern);
                        pattern = pattern.substring(0, bracketIndex);
                    }
                    var dotIndex = pattern.indexOf('.');
                    if (dotIndex >= 0) {
                        this.predefinedNames.push(pattern);
                        var patternAfterDot = pattern.substring(dotIndex + 1);
                        this.predefinedNames.push(patternAfterDot);
                        pattern = pattern.substring(0, dotIndex);
                    }
                    this.predefinedNames.push(pattern);
                }
            }
            return this.predefinedNames;
        };
        BaseCdsDdlParser.prototype.removeQuotesIncludingErrorCase = function (pathInLower) {
            pathInLower = CompareUtil.removeQuotes(pathInLower);
            var first = pathInLower.indexOf("\"");
            var last = pathInLower.indexOf("\"");
            if (first > -1 && first == last) {
                pathInLower = pathInLower.replace("\"", "");
            }
            return pathInLower;
        };
        BaseCdsDdlParser.prototype.getTypeCompletionsForPathTargetFromCoCoCu = function (target) {
            var result = [];
            if (target instanceof ContextDeclarationImpl) {
                var c = target;
                var stmts = c.getStatements();
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof TypeDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getAllElementCompletionsForAssociation = function (assoc, project, currentOffset, includeEntityAssociations) {
            var result = [];
            var targetEntityName = assoc.getTargetEntityName();
            var elementProps = this.getSelectListCompletionsForPathTargetFromCoCoCu(assoc.getTargetDataSource(), null, null, project, currentOffset, includeEntityAssociations);
            for (var propCount = 0; propCount < elementProps.length; propCount++) {
                var prop = elementProps[propCount];
                var hdc = new HanaDdlCodeCompletion(prop.getName(), IBaseCdsDdlParserConstants.ELEMENT_TYPE);
                hdc.setAdditionalDisplayString(targetEntityName + " as " + assoc.getName());
                hdc.setReplacementString(assoc.getName() + "." + prop.getName());
                result.push(hdc);
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getSelectListCompletionsForPathTargetFromCoCoCu = function (ds, target, searchName, project, currentOffset, includeEntityAssociations) {
            var result = [];
            if (target == null && (searchName == null || searchName.length == 0)) {
                var dsName = ds.getName();
                target = new CodeResolver().resolvePath(currentOffset, dsName + ".", this.cocoCompilationUnit, project);
                if (target != null) {
                    return this.getSelectListCompletionsForPathTargetFromCoCoCu(ds, target, searchName, project, currentOffset, includeEntityAssociations);
                } else {
                    return this.getBackendColumnProposals(dsName);
                }
            } else if (target == null && searchName != null && searchName.length > 0) {
                var ind = searchName.lastIndexOf(".");
                if (ind > 0) {
                    var firstPart = searchName.substring(0, ind);
                    var dsName = ds.getName();
                    var alias = ds.getAlias();
                    if ((dsName != null && rnd.Utils.stringEqualsIgnoreCase(dsName, firstPart)) || (alias != null && rnd.Utils.stringEqualsIgnoreCase(alias, firstPart))) {
                        return this.getBackendColumnProposals(dsName);
                    }
                }
            } else if (target instanceof EntityDeclarationImpl) {
                var elements = (target).getElements();
                if (elements != null) {
                    for (var elementCount = 0; elementCount < elements.length; elementCount++) {
                        var element = elements[elementCount];
                        if (includeEntityAssociations == false && element instanceof AssociationDeclarationImpl) {
                            continue;
                        }
                        var name = element.getName();
                        var compl = new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE);
                        if (searchName == null || searchName.indexOf('.') < 0) {
                            if (ds != null) {
                                if (ds.getAlias() != null) {
                                    compl.setReplacementString(ds.getAlias() + "." + name);
                                    compl.setAdditionalDisplayString(ds.getName() + " as " + ds.getAlias());
                                } else {
                                    var dsName = this.getLastPathEntry(ds.getName());
                                    compl.setReplacementString(dsName + "." + name);
                                    compl.setAdditionalDisplayString(ds.getName());
                                }
                            }
                        }
                        result.push(compl);
                    }
                }
            } else if (target instanceof ViewDefinitionImpl) {
                var vd = target;
                var select = vd.getSelect();
                if (select == null) {
                    select = StmtUtil.getFirstLeftViewSelect(vd.getSelectSet());
                }
                if (select != null) {
                    var selectList = select.getSelectList();
                    if (selectList != null) {
                        var entries = selectList.getEntries();
                        if (entries != null) {
                            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                                var entry = entries[entryCount];
                                var name = entry.getPublicName();
                                var ind = name.lastIndexOf(".");
                                if (ind > 0) {
                                    name = name.substring(ind + 1);
                                }
                                result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                            }
                        }
                    }
                }
            } else if (target instanceof TypeDeclarationImpl) {
                var tt = target;
                var elements = tt.getElements();
                if (elements != null) {
                    for (var elCount = 0; elCount < elements.length; elCount++) {
                        var el = elements[elCount];
                        var name = el.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                    }
                }
            } else if (target instanceof AssociationDeclarationImpl) {
                var asso = target;
                var targetEntityName = asso.getTargetEntityName() + ".";
                var to = new CodeResolver().resolvePath(currentOffset, targetEntityName, this.cocoCompilationUnit, project);
                if (to != null) {
                    result = result.concat(this.getSelectListCompletionsForPathTargetFromCoCoCu(ds, to, searchName, project, currentOffset, includeEntityAssociations));
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getAssociationToCompletionsForPathTargetFromCoCoCu = function (target) {
            var result = [];
            if (target instanceof ContextDeclarationImpl) {
                var stmts = (target).getStatements();
                this.getAllEntitiesAndViews(result, stmts, null, false, -1, null, true);
            } else if (target instanceof EntityDeclarationImpl) {
                result = result.concat(this.getCompletionsForEntity(target, false, true, null));
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getCompletionsForType = function (type) {
            var result = [];
            if (type instanceof TypeDeclarationImpl) {
                var elements = type.getElements();
                if (elements) {
                    for (var elemCount = 0; elemCount < elements.length; elemCount++) {
                        var elem = elements[elemCount];
                        var name = elem.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getCompletionsForEntity = function (entity, includeAttributes, includeAssociations, includeOnlyThisAssociation) {
            var result = [];
            if (entity instanceof EntityDeclarationImpl) {
                var elements = entity.getElements();
                if (elements) {
                    for (var elemCount = 0; elemCount < elements.length; elemCount++) {
                        var elem = elements[elemCount];
                        var name = elem.getName();
                        if (elem instanceof AssociationDeclarationImpl && includeAssociations) {
                            // associations
                            if (includeOnlyThisAssociation && includeOnlyThisAssociation !== elem) {
                                continue;
                            } else {
                                result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ASSOC_TYPE));
                            }
                        } else if (elem instanceof AttributeDeclarationImpl && includeAttributes) {
                            // attributes
                            result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                        }
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getCompletionsForTarget = function (target, includeOnlyThisAssociation) {
            var result = [];
            if (target instanceof ContextDeclarationImpl) {
                var c = target;
                var stmts = c.getStatements();
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof TypeDeclarationImpl) {
                        var td = stmt;
                        if (CompilationUnitManager.isStructuredType(td)) {
                            var name = stmt.getName();
                            result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                        }
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    } else if (stmt instanceof EntityDeclarationImpl) {
                        var name = stmt.getName();
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                    }
                }
            } else if (target instanceof TypeDeclarationImpl) {
                result = result.concat(this.getCompletionsForType(target));
            } else if (target instanceof EntityDeclarationImpl) {
                result = result.concat(this.getCompletionsForEntity(target, true, true, includeOnlyThisAssociation));
            } else if (target instanceof ViewDefinitionImpl) {
                var vd = target;
                var select = vd.getSelect();
                if (select == null) {
                    select = StmtUtil.getFirstLeftViewSelect(vd.getSelectSet());
                }
                if (select != null) {
                    var list = select.getSelectList();
                    if (list != null) {
                        var entries = list.getEntries();
                        if (entries != null) {
                            for (var entryCount = 0; entryCount < entries.length; entryCount++) {
                                var entry = entries[entryCount];
                                var alias = entry.getAlias();
                                if (alias != null) {
                                    result.push(new HanaDdlCodeCompletion(alias, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                                } else {
                                    var exp = entry.getExpression();
                                    if (exp instanceof PathExpressionImpl) {
                                        var p = (exp).getPathString(false);
                                        var ind = p.lastIndexOf(".");
                                        if (ind > 0) {
                                            p = p.substring(ind + 1);
                                        }
                                        result.push(new HanaDdlCodeCompletion(p, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (target instanceof SelectListEntryImpl) {
                var e = target;
                var ex = e.getExpression();
                if (ex instanceof PathExpressionImpl) {
                    var entryName = (ex).getPathString(false);
                    var vs = StmtUtil.getParentOfTypeViewSelect(e);
                    if (vs != null) {
                        var assoc = this.findAssociationWithName(vs.getAssociations(), entryName);
                        if (assoc != null) {
                            var targetName = assoc.getTargetEntityName();
                            var name = targetName + ".";
                            var resolved = new CodeResolver().resolvePath(vs.getStartOffset(), name, this.cocoCompilationUnit, this.repositoryAccess.getProject());
                            if (resolved != null) {
                                result = result.concat(this.getCompletionsForTarget(resolved, null));
                            }
                        }
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.findAssociationWithName = function (associations, entryName) {
            if (associations != null) {
                for (var assocCount = 0; assocCount < associations.length; assocCount++) {
                    var assoc = associations[assocCount];
                    var name = assoc.getName();
                    if (CompareUtil.equalsIgnoreQuotesAndCase(name, entryName)) {
                        return assoc;
                    }
                }
            }
            return null;
        };
        BaseCdsDdlParser.prototype.getContextsFromCoCoCuAndProject = function (offset, project) {
            var result = [];
            var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(offset);
            if (this.cocoCompilationUnit != null) {
                var stmts = this.cocoCompilationUnit.getStatements();
                this.getAllContexts(result, stmts, currentFqn);
            }
            if (this.supportsBackendMultipleFiles()) {
                var fqnRootContextName = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                var cds = CompilationUnitManager.singleton.getContextDeclarations(project, fqnRootContextName);
                if (cds != null) {
                    for (var cdCount = 0; cdCount < cds.length; cdCount++) {
                        var cd = cds[cdCount];
                        var name = cd.getName();
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(cd, this.cocoCompilationUnit, name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.supportsBackendMultipleFiles = function () {
            try {
                var version = this.getByteCode().getVersionInfo().getPatchLevelAsString();
                if (version != null) {
                    var v = parseInt(version);
                    if (v >= 2) {
                        return true;
                    }
                }
            } catch (e) {
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getAllContexts = function (result, stmts, currentFqn) {
            if (stmts == null) {
                return;
            }
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof ContextDeclarationImpl) {
                    var ctx = stmt;
                    var fqn = ContextUtil.getFqnWithNamespace(ctx);
                    var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
                    var name = ctx.getName();
                    if (insertPath) {
                        name = NamespaceUtil.getRelativeContextPath(fqn, currentFqn);
                    }
                    result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.CONTEXT_TYPE));
                    this.getAllContexts(result, ctx.getStatements(), currentFqn);
                }
            }
        };
        BaseCdsDdlParser.prototype.getLocalEntityOrTypeElementsFromCoCoCu = function (offset) {
            var result = [];
            if (this.cocoCompilationUnit != null) {
                var stmt = CodeResolver.findBestMatchingTypeAtOffset(offset, this.cocoCompilationUnit);
                if (stmt instanceof ComponentDeclarationImpl) {
                    var cd = stmt;
                    var elements = cd.getElements();
                    for (var i = 0; i < elements.length; i++) {
                        var ed = elements[i];
                        var name = ed.getName();
                        var so = ed.getStartOffset();
                        var eo = ed.getEndOffset();
                        if (offset > so) {
                            if (eo > -1) {
                                if (offset < eo) {
                                    continue;
                                }
                            } else if (i + 1 < elements.length) {
                                var next = elements[i + 1];
                                var nextso = next.getStartOffset();
                                if (nextso > -1 && offset < nextso) {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                        }
                        if (name != null && name.length > 0) {
                            result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ELEMENT_TYPE));
                        }
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getEntitiesFromCoCoCuAndProject = function (currentOffset, project, currentStmt, addCurrentStmtToResult) {
            var result = [];
            var root = this.getRootContextFromCoCoCu();
            if (root != null) {
                var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(currentOffset);
                var stmts = root.getStatements();
                this.getAllEntitiesAndViews(result, stmts, currentFqn, true, currentOffset, currentStmt, addCurrentStmtToResult);
            }
            if (this.cocoCompilationUnit != null && this.supportsBackendMultipleFiles()) {
                if (project != null) {
                    var fqnRootContextName = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                    var decls = null;
                    decls = CompilationUnitManager.singleton.getEntityDeclarations2(project, fqnRootContextName);
                    this.addCompletionsForNamedDeclaration(result, decls, IBaseCdsDdlParserConstants.ENTITY_TYPE);
                    decls = CompilationUnitManager.singleton.getViewDefinitions2(project, fqnRootContextName);
                    this.addCompletionsForNamedDeclaration(result, decls, IBaseCdsDdlParserConstants.VIEW_TYPE);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.addCompletionsForNamedDeclaration = function (result, decls, type) {
            for (var namedDeclarationCount = 0; namedDeclarationCount < decls.length; namedDeclarationCount++) {
                var namedDeclaration = decls[namedDeclarationCount];
                var name = namedDeclaration.getName();
                result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(namedDeclaration, this.cocoCompilationUnit, name, type));
            }
        };
        BaseCdsDdlParser.prototype.getAspectsFromCoCoCuAndProject = function (currentOffset, context, project, currentStmt) {
            var result = [];
            var root = this.getRootAccessPolicyFromCoCoCu();
            var addScopingOperator = false;
            var currentTokenIndex = context.getTokenIndex();
            var previousToken = TokenUtil.getPreviousTokenIgnoringNLAndComment(this.m_scanner.getInput(), currentTokenIndex - 1);
            if (previousToken != null && previousToken.m_lexem === ":" == false) {
                addScopingOperator = true;
            }
            if (root != null) {
                var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(currentOffset);
                var stmts = root.getStatements();
                this.getAllAspects(result, stmts, currentFqn, currentStmt, addScopingOperator);
            }
            if (this.cocoCompilationUnit != null && this.supportsBackendMultipleFiles()) {
                if (project != null) {
                    var fqnRootAspectNameToExclude = ContextUtil.getFqnRootAccessPolicyName(this.cocoCompilationUnit);
                    var aspectsFromOtherFiles = CompilationUnitManager.singleton.getAspectDeclarationsWithExclusion(project, fqnRootAspectNameToExclude);
                    for (var aspectCount = 0; aspectCount < aspectsFromOtherFiles.length; aspectCount++) {
                        var aspect = aspectsFromOtherFiles[aspectCount];
                        var name = aspect.getName();
                        var completion = HanaDdlCodeCompletion.HanaDdlCodeCompletion2(aspect, this.cocoCompilationUnit, name, IBaseCdsDdlParserConstants.ASPECT_TYPE);
                        completion.setAddScopingOperator(addScopingOperator);
                        result.push(completion);
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getCurrentStmt = function (currentOffset) {
            if (currentOffset >= 0 && this.cocoCompilationUnit != null) {
                var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentOffset);
                var currentStmt = StmtUtil.getParentOfTypeDdlStatement(sourceRange);
                return currentStmt;
            }
            return null;
        };
        BaseCdsDdlParser.prototype.getAllEntitiesAndViews = function (result, stmts, currentFqn, includeFromNestedContexts, currentOffset, currentStmt, addCurrentStmtToResult) {
            if (stmts != null) {
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof EntityDeclarationImpl) {
                        var ed = stmt;
                        var name = ed.getName();
                        var fqn = ContextUtil.getFqnWithNamespace(ed.eContainer());
                        var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
                        if (insertPath) {
                            name = NamespaceUtil.getRelativeContextPath(fqn, currentFqn) + "." + name;
                        } else {
                            if (this.hasElement(currentStmt, name) || this.existSameStmtNameAndTypeOnCurrentContextLevel(currentStmt, ed)) {
                                var entityFqn = ContextUtil.getFqn(ed);
                                if (entityFqn != null) {
                                    name = entityFqn;
                                }
                            }
                        }
                        result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ENTITY_TYPE));
                    } else if (stmt instanceof ViewDefinitionImpl) {
                        var vd = stmt;
                        var name = vd.getName();
                        var fqn = ContextUtil.getFqnWithNamespace(vd.eContainer());
                        var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
                        if (insertPath || this.existSameStmtNameAndTypeOnCurrentContextLevel(currentStmt, vd)) {
                            var nsp = NamespaceUtil.getRelativeContextPath(fqn, currentFqn);
                            if (nsp.length > 0) {
                                name = nsp + "." + name;
                            }
                        }
                        var doit = true;
                        if (addCurrentStmtToResult == false && currentStmt != null && vd === currentStmt) {
                            doit = false;
                        }
                        if (doit) {
                            result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.VIEW_TYPE));
                        }
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        if (includeFromNestedContexts) {
                            var ctx = stmt;
                            this.getAllEntitiesAndViews(result, ctx.getStatements(), currentFqn, includeFromNestedContexts, currentOffset, currentStmt, addCurrentStmtToResult);
                        }
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.existSameStmtNameAndTypeOnCurrentContextLevel = function (currentStmt, namedDeclaration) {
            if (currentStmt == null) {
                return false;
            }
            var name = namedDeclaration.getName();
            var parent = currentStmt.eContainer();
            if (parent instanceof ContextDeclarationImpl || parent instanceof AccessPolicyDeclarationImpl) {
                var stmts = (parent).getStatements();
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt == namedDeclaration) {
                        return false;
                    } else if (this.isSameClass(namedDeclaration, stmt)) {
                        var n = stmt.getName();
                        if (n === name) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getAllAspects = function (result, stmts, currentFqn, currentStmt, addScopingOperator) {
            if (stmts == null) {
                return;
            }
            for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                var stmt = stmts[stmtCount];
                if (stmt instanceof AspectDeclarationImpl) {
                    var aspect = stmt;
                    this.addAspectCompletion(result, currentFqn, currentStmt, addScopingOperator, aspect);
                } else if (stmt instanceof RoleDeclarationImpl) {
                    var role = stmt;
                    var roleComponents = role.getEntries();
                    for (var roleComponentCount = 0; roleComponentCount < roleComponents.length; roleComponentCount++) {
                        var roleComponent = roleComponents[roleComponentCount];
                        if (roleComponent instanceof AspectDeclarationImpl) {
                            var aspect = roleComponent;
                            this.addAspectCompletion(result, currentFqn, currentStmt, addScopingOperator, aspect);
                        }
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.addAspectCompletion = function (result, currentFqn, currentStmt, addScopingOperator, aspect) {
            var name = aspect.getName();
            var fqn = ContextUtil.getFqnWithNamespace(aspect.eContainer());
            var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
            if (insertPath) {
                name = NamespaceUtil.getRelativeContextPath(fqn, currentFqn) + "." + name;
            } else {
                if (this.existSameStmtNameAndTypeOnCurrentContextLevel(currentStmt, aspect)) {
                    var entityFqn = ContextUtil.getFqn(aspect);
                    if (entityFqn != null) {
                        name = entityFqn;
                    }
                }
            }
            var completion = new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.ASPECT_TYPE);
            completion.setAddScopingOperator(addScopingOperator);
            result.push(completion);
        };
        BaseCdsDdlParser.prototype.isSameClass = function (ed, stmt) {

            if (stmt.__proto__ !== undefined) {
                return stmt.__proto__ === ed.__proto__;
            }
            return stmt.constructor.prototype === ed.constructor.prototype;

        };
        BaseCdsDdlParser.prototype.hasElement = function (currentStmt, name) {
            if (currentStmt == null) {
                return false;
            }
            if (currentStmt instanceof EntityDeclarationImpl) {
                var elements = (currentStmt).getElements();
                for (var edCount = 0; edCount < elements.length; edCount++) {
                    var ed = elements[edCount];
                    var n = ed.getName();
                    if (CompareUtil.equalsIgnoreQuotesAndCase(n, name)) {
                        return true;
                    }
                }
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getStructuredTypesFromCoCoCuAndProject = function (currentOffset) {
            var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(currentOffset);
            var result = [];
            var root = this.getRootContextFromCoCoCu();
            if (root != null) {
                var stmts = root.getStatements();
                this.getLocalStructureTypes(result, stmts, currentFqn);
            }
            if (this.repositoryAccess != null && this.supportsBackendMultipleFiles()) {
                var project = this.repositoryAccess.getProject();
                if (project != null && this.cocoCompilationUnit != null) {
                    var fqnRootContextName = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                    var tds = CompilationUnitManager.singleton.getStructureTypeDeclarations2(project, fqnRootContextName);
                    for (var tdCount = 0; tdCount < tds.length; tdCount++) {
                        var td = tds[tdCount];
                        var name = td.getName();
                        result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(td, this.cocoCompilationUnit, name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                    }
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getFqnForOffsetUsingCoCoCompilationUnit = function (currentOffset) {
            var currentFqn = null;
            if (currentOffset >= 0) {
                var sourceRange = StmtUtil.getBestMatchingSourceRangeRecursive(this.cocoCompilationUnit, currentOffset);
                var namedDecl = null;
                if (sourceRange instanceof RuleDeclarationImpl) {
                    namedDecl = StmtUtil.getParentOfTypeRoleDeclaration(sourceRange);
                } else {
                    namedDecl = StmtUtil.getParentOfTypeContextDeclaration(sourceRange);
                }
                if (namedDecl != null) {
                    currentFqn = ContextUtil.getFqnWithNamespace(namedDecl);
                }
            }
            return currentFqn;
        };
        BaseCdsDdlParser.prototype.getLocalStructureTypes = function (result, stmts, currentFqn) {
            if (stmts != null) {
                for (var stmtCount = 0; stmtCount < stmts.length; stmtCount++) {
                    var stmt = stmts[stmtCount];
                    if (stmt instanceof TypeDeclarationImpl) {
                        var td = stmt;
                        if (CompilationUnitManager.isStructuredType(td)) {
                            var name = td.getName();
                            if (currentFqn != null) {
                                var fqn = ContextUtil.getFqnWithNamespace(td.eContainer());
                                var insertPath = ContextUtil.isContextPathNecessary(currentFqn, fqn);
                                if (insertPath) {
                                    name = NamespaceUtil.getRelativeContextPath(fqn, currentFqn) + "." + name;
                                }
                            }
                            result.push(new HanaDdlCodeCompletion(name, IBaseCdsDdlParserConstants.TYPE_TYPE));
                        }
                    } else if (stmt instanceof ContextDeclarationImpl) {
                        var ctx = stmt;
                        this.getLocalStructureTypes(result, ctx.getStatements(), currentFqn);
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.getRootContextFromCoCoCu = function () {
            if (this.cocoCompilationUnit != null) {
                var statements = this.cocoCompilationUnit.getStatements();
                if (statements != null) {
                    for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                        var stmt = statements[stmtCount];
                        if (stmt instanceof ContextDeclarationImpl) {
                            return stmt;
                        }
                    }
                }
            }
            return null;
        };
        BaseCdsDdlParser.prototype.getRootAccessPolicyFromCoCoCu = function () {
            if (this.cocoCompilationUnit != null) {
                var statements = this.cocoCompilationUnit.getStatements();
                if (statements != null) {
                    for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
                        var stmt = statements[stmtCount];
                        if (stmt instanceof AccessPolicyDeclarationImpl) {
                            return stmt;
                        }
                    }
                }
            }
            return null;
        };
        BaseCdsDdlParser.getPathInLowerCase = function (tokens, current, includeNamespace) {
            var i = tokens.indexOf(current);
            var start = BaseCdsDdlParser.getPathStartIndex(tokens, i, includeNamespace);
            var result = new StringBuffer();
            var inFilter = false;
            for (var q = start; q <= i; q++) {
                var token = tokens[q];
                if (Category.CAT_COMMENT === token.m_category) {
                    continue;
                }
                var lexem = token.m_lexem;
                if (lexem === "[") {
                    inFilter = true;
                    continue;
                } else if (lexem === "]") {
                    inFilter = false;
                    continue;
                }
                if (inFilter) {
                    continue;
                }
                result.append(lexem);
            }
            var res = result.toString().toLowerCase();
            return res;
        };
        BaseCdsDdlParser.getPathStartIndex = function (tokens, i, includeNamespace) {
            i--;
            if (i <= 0) {
                return 0;
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                var previous = tokens[i];
                while (Category.CAT_COMMENT === previous.m_category) {
                    i--;
                    previous = tokens[i];
                }
                if (includeNamespace) {
                    if (previous.m_lexem === "." == false && previous.m_lexem === "::" == false) {
                        return i + 1;
                    }
                } else {
                    if (previous.m_lexem === "." == false) {
                        return i + 1;
                    }
                }
                var p = tokens[i - 1];
                while (p != null && Category.CAT_COMMENT === p.m_category) {
                    i--;
                    p = tokens[i - 1];
                }
                if (p != null && p.m_lexem === "]") {
                    /*eslint-disable no-constant-condition*/
                    while (true) {
                        p = tokens[i];
                        if (p != null && p.m_lexem === "[") {
                            i--;
                            break;
                        }
                        i--;
                    }
                    i--;
                    if (i <= 0) {
                        return 0;
                    }
                    continue;
                }
                i -= 2;
                if (i <= 0) {
                    return 0;
                }
            }
        };
        BaseCdsDdlParser.prototype.isAstNeededForCoCo = function () {
            if (this.repositoryAccess != null) {
                return true;
            }
            return false;
        };
        BaseCdsDdlParser.prototype.getDefinedTypesFromCoCoCuAndProject = function (currentOffset, currentStmt) {
            var result = [];
            if (this.cocoCompilationUnit != null) {
                var currentFqn = this.getFqnForOffsetUsingCoCoCompilationUnit(currentOffset);
                var nsp = ContextUtil.getFqnRootContextName(this.cocoCompilationUnit);
                var tds = this.getTypeDeclarations(this.cocoCompilationUnit.getStatements(), currentOffset);
                if (this.repositoryAccess != null) {
                    var project = this.repositoryAccess.getProject();
                    if (project != null && this.supportsBackendMultipleFiles()) {
                        tds = tds.concat(CompilationUnitManager.singleton.getTypeDeclarations2(project, nsp));
                    }
                }
                for (var tdCount = 0; tdCount < tds.length; tdCount++) {
                    var td = tds[tdCount];
                    var fqn = null;
                    var cocoTd = null;
                    if (this.cocoCompilationUnit != null) {
                        var tdCu = CompilationUnitUtil.getCu(td);
                        if (this.cocoCompilationUnit === tdCu == false) {
                            cocoTd = td;
                            fqn = td.getName();
                        }
                    }
                    if (fqn == null) {
                        var eContainer = td.eContainer();
                        if (eContainer instanceof NamedDeclarationImpl) {
                            var lfqn = ContextUtil.getFqnWithNamespace(eContainer);
                            var insertPath = ContextUtil.isContextPathNecessary(currentFqn, lfqn);
                            if (insertPath || this.existSameStmtNameAndTypeOnCurrentContextLevel(currentStmt, td)) {
                                var rnsp = NamespaceUtil.getRelativeContextPath(lfqn, currentFqn);
                                if (rnsp.length > 0) {
                                    fqn = rnsp + "." + td.getName();
                                }
                            }
                        }
                        if (fqn == null) {
                            fqn = td.getName();
                        }
                    }
                    result.push(HanaDdlCodeCompletion.HanaDdlCodeCompletion2(cocoTd, cocoTd != null ? this.cocoCompilationUnit : null, fqn, IBaseCdsDdlParserConstants.TYPE_TYPE));
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.getTypeDeclarations = function (stmts, currentOffset) {
            var result = [];
            for (var i = 0; i < stmts.length; i++) {
                var stmt = stmts[i];
                if (stmt instanceof ContextDeclarationImpl) {
                    result = result.concat(this.getTypeDeclarations((stmt).getStatements(), currentOffset));
                } else if (stmt instanceof TypeDeclarationImpl) {
                    var td = stmt;
                    var so = td.getStartOffset();
                    var eo = td.getEndOffset();
                    if (currentOffset > so) {
                        if (eo > -1) {
                            if (currentOffset < eo) {
                                continue;
                            }
                        } else if (i + 1 < stmts.length) {
                            var next = stmts[i + 1];
                            var nextso = next.getStartOffset();
                            if (nextso > -1 && currentOffset < nextso) {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    }
                    result.push(stmt);
                }
            }
            return result;
        };
        BaseCdsDdlParser.prototype.match = function (match_instruction_number, is_strict) {
            var res = AbstractDdlParser.prototype.match.call(this, match_instruction_number, is_strict);
            var currentTokenIndex = this.m_current.m_la_index;
            if (this.isOneOfTheRuleNamesInHierarchy(this.m_current.getStackframe(), [IBaseCdsDdlParserConstants.TYPE_NAME_RULE, IBaseCdsDdlParserConstants.ANNOTATION_TYPE_NAME_RULE])) {
                this.getTokenAt1(currentTokenIndex).setPayload(this.typePayload);
            } else if (this.isAnnotationRuleInStackframeHierarchy(this.m_current.getStackframe())) {
                var t = this.getTokenAt1(currentTokenIndex);
                if (t.getPayload() == null && Category.CAT_MAYBE_KEYWORD === t.m_category) {
                } else {
                    t.setPayload(this.annotationPayload);
                }
            }
            return res;
        };
        BaseCdsDdlParser.prototype.isAnnotationRuleInStackframeHierarchy = function (stackframe) {
            return this.isOneOfTheRuleNamesInHierarchy(stackframe, [BaseCdsDdlParser.PRE_ANNOTATION_RULE]);
        };
        BaseCdsDdlParser.prototype.isRuleNameInHierarchy = function (stackframe, ruleName) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var ruleInfo = stackframe.getRuleInfo();
                if (ruleInfo == null) {
                    return false;
                }
                var rn = ruleInfo.getRuleName();
                if (ruleName === rn) {
                    return true;
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        BaseCdsDdlParser.prototype.isOneOfTheRuleNamesInHierarchy = function (stackframe, ruleNames) {
            return AbstractDdlParser.prototype.isOneOfTheRuleNamesListEntryInHierarchy.call(this, stackframe, ruleNames);
        };
        BaseCdsDdlParser.prototype.isOneOfTheRuleNamesInHierarchyStopAtFirstRule = function (stackframe, ruleNames, stopAtFirstRuleName) {
            return AbstractDdlParser.prototype.isOneOfTheRuleNamesInHierarchy.call(this, stopAtFirstRuleName, stackframe, ruleNames);
        };
        BaseCdsDdlParser.prototype.areAllRuleNamesInHierarchy = function (stackframe, ruleNames) {
            return AbstractDdlParser.prototype.areAllRuleNamesInHierarchy.call(this, stackframe, ruleNames);
        };
        BaseCdsDdlParser.prototype.run = function (completion_mode, halted, HALTED_INTERVAL) {
            this.annotationCoCoCount = 0;
            this.semanticCoCoCallCount = 0;
            return AbstractDdlParser.prototype.run.call(this, completion_mode, halted, HALTED_INTERVAL);
        };
        BaseCdsDdlParser.prototype.init = function () {
            AbstractDdlParser.prototype.init.call(this);
            var me = this;
            me.setMatchHook({
                invoke: function (parser) {
                    var currentToken = me.getCurrentToken();
                    if (currentToken != null && rnd.Utils.stringEqualsIgnoreCase("as", currentToken.m_lexem)) {
                        var sf = me.getCurrentStackframe();
                        if (me.areAllRuleNamesInHierarchy(sf, [IBaseCdsDdlParserConstants.ID_WRAPPER, IBaseCdsDdlParserConstants.TABLE_PATH_ALIAS_RULE_NAME])) {
                            return HookResult.PATHFAILED;
                        }
                    }
                    return HookResult.NORMAL;
                }
            });
        };
        BaseCdsDdlParser.prototype.forcePathFailureInBranch = function (current) {
            var compl = current.getCompletion();
            if (compl != null) {
                if (!(compl instanceof TokenCoCoCompletion)) {
                    return false;
                }
            }
            return AbstractDdlParser.prototype.forcePathFailureInBranch.call(this, current);
        };
        BaseCdsDdlParser.prototype.onMatchCollectCompletionSuggestionsOrAbortFromTokenCoCoParser = function (current_token, matched_terminal, current, context, match) {
            var lexem_input = current_token.m_lexem;
            var actualNUMID = this.getByteCode().getActualNUMID();
            if (lexem_input === "#" && matched_terminal == actualNUMID) {
                return false;
            }
            if (lexem_input === ";") {
                if (matched_terminal == actualNUMID) {
                    return false;
                }
                lexem_input = "";
            } else if (lexem_input === "#") {
                if (matched_terminal == this.getByteCode().getActualNUMID()) {
                    return false;
                }
            }
            var compl = this.m_current.getCompletion();
            if (compl != null && compl.m_tokens_completed >= this.m_max_completions) {
                return false;
            }
            if (((compl != null && compl.m_tokens_completed > 0) || this.isPrefixOfToken(lexem_input, matched_terminal, this.getIsCaseInsensitiveCompletion()))) {
                if (rnd.Utils.stringEqualsIgnoreCase("aspect", match)) {
                    var sf = current.getStackframe();
                    if (this.isRuleNameInHierarchy(sf, IBaseCdsDdlParserConstants.ACCESS_POLICY_DECLARATION) == false) {
                        return true;
                    }
                }
                this.addCompletion(matched_terminal);
                return true;
            }
            return false;
        };
        BaseCdsDdlParser.prototype.isPrefixOfToken = function (lexem_input, matched_terminal, caseInsensitive) {

            return this.getByteCodeTokenInfo().isPrefixOfToken(lexem_input, matched_terminal, caseInsensitive);

        };
        BaseCdsDdlParser.prototype.addWarningProposalInCaseOfErrorToken = function () {
            if (this.cocoCompilationUnit != null) {
                var tokenList = this.cocoCompilationUnit.getTokenList();
                if (tokenList == null) {
                    return;
                }
                for (var elementCount = 0; elementCount < tokenList.length; elementCount++) {
                    var element = tokenList[elementCount];
                    var token = element;
                    if (token.m_num == SapDdlConstants.NUM_EOF) {
                        continue;
                    }
                    if (ErrorState.Erroneous === token.m_err_state) {
                        var warningProposal = [];
                        warningProposal.push(new HanaDdlCodeCompletion(Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg, IBaseCdsDdlParserConstants.WARNING_TYPE));
                        var pathInLower = "";
                        this.addHanaComplToSemanticCompletions(null, pathInLower, warningProposal);
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.getByteCodeVersion = function () {
            var bc = this.getByteCode();
            if (bc == null) {
                return null;
            }
            var vi = bc.getVersionInfo();
            if (vi == null) {
                return null;
            }
            var version = vi.getPatchLevelAsString();
            return version;
        };
        BaseCdsDdlParser.prototype.recordCompletionPathOnFailure = function (current) {
            if (this.isAnyToken((current).getPathLATokenNum()) && !(this.getFlagCheckError())) {
                this.setHitCompletionPos(true);
                var pc = current.getCompletion();
                if (pc instanceof TokenCoCoCompletion) {
                    var compl = pc;
                    if (compl.m_next_tokens.length > 0) {
                        this.recordCompletionPath(current);
                    }
                }
            }
        };
        BaseCdsDdlParser.prototype.determineStackLevelsToPopViaByFollowSet = function (stackframe, num) {
            if (this.isRuleNameInHierarchy(stackframe, IBaseCdsDdlParserConstants.START_SYNTAX_COLORING_RULE_NAME)) {
                var token = this.getCurrentToken();
                if (StmtUtil.isPossibleStartStatementToken(this, token)) {
                    var level = 0;
                    while (stackframe != null) {
                        var ri = stackframe.getRuleInfo();
                        if (ri == null) {
                            return level;
                        }
                        if (IBaseCdsDdlParserConstants.START_SYNTAX_COLORING_RULE_NAME === ri.getRuleName()) {
                            return level;
                        }
                        level++;
                        stackframe = stackframe.getParent();
                    }
                    return 0;
                }
                return 0;
            }
            return AbstractDdlParser.prototype.determineStackLevelsToPopViaByFollowSet.call(this, stackframe, num);
        };
        BaseCdsDdlParser.prototype.getRuleNameHierarchy = function (stackframe) {
            return AbstractDdlParser.prototype.getRuleNameHierarchy.call(this, stackframe);
        };

        // ====== methods for modern AST ======

        BaseCdsDdlParser.prototype.startRule = function(ruleName, optionalProto) {

            var proto = optionalProto || standardObjectProto;

            var RESOLVER = this;

            var elem = createInstance(ruleName, proto);

            elem.setStartTokenIndex(RESOLVER.getNextTokenIndex());
            elem.setEndTokenIndex(-1);

            elem.endRule = function () {
                elem.setEndTokenIndex(RESOLVER.getLastMatchedTokenIndex());
                // gc, no need to keep after first endRule() call.
                delete elem.endRule;
                delete elem.attachChild;
                delete elem.linkToParent;
            };

            elem.attachChild = function (child, optionalName) {
                linkChild(elem, child, optionalName);
            };

            elem.linkToParent = function (parent, optionalName) {
                linkToParent(elem, parent, optionalName);
            };

            return elem;
        };

        function linkChild(parentNode, child, optionalName) {

            if (parentNode instanceof commonddl.EObjectContainmentEList) {
                parentNode.push(child);
                // Try to fulfill containment relationship as early as possible.
                // (child shall have the EObjectContainmentEList's owner as parent in the end.)
                if (parentNode.owner && parentNode.owner !== null) {
                    parentNode = parentNode.owner;
                } else {
                    // TODO: try to avoid this case in future, merge startArrayRule and many, enforce parent, enforce explicit endRule()
                }
            } else {
                var name = optionalName || child.ruleName;
                name = toAttributeName(name);
                if (parentNode[name]) {
                    var i = 2;
                    var cursor = name + i;
                    while (parentNode[cursor]) {
                        cursor = name + ++i;
                    }
                    name = cursor;
                }
                parentNode[name] = child;
            }
            setParent(child, parentNode);
        }

        function toAttributeName(ruleName) {
            // de-capitalize first letter e.g. HashPartition -> hashPartition
            return ruleName.charAt(0).toLowerCase() + ruleName.slice(1);
        }

        function setParent(child, parent) {
            if (child instanceof commonddl.EObjectContainmentEList) {
                child.owner = parent;
                reparentArrayChildren(child, child.owner);
            }
            if ("setContainer" in child) {
                child.setContainer(parent);
            }
        }

        // Our arrays are containment relationships, thus we need to set the parent of all array elements to the parent of the array.
        function reparentArrayChildren(arr, parent) {
            for (var i = 0; i < arr.length; i++) {
                var obj = arr[i];
                if (obj.setContainer) {
                    obj.setContainer(parent);
                }
                // Recursively reparent directly nested arrays.
                if (obj instanceof commonddl.EObjectContainmentEList) {
                    reparentArrayChildren(obj, parent);
                }
            }
        }

        /*
         allowEmpty (default: false): array is linked to (mandatory) parent in any case.
         E.g. true: for cardinality "+" (1..) the array can be linked to parent once it's clear the rule
         is taken - even before the first child - to improve AST in case of incompleteness/errors.
         false: for cardinality "*" (0..) the array usually should be linked to the parent only if at least
         one child exists - otherwise AST would contain many empty arrays which costs unnecessary memory.
         */
        BaseCdsDdlParser.prototype.startArrayRule = function (ruleName, optionalParent, allowEmpty) {

            optionalParent = optionalParent || null;
            allowEmpty = allowEmpty || false;

            var RESOLVER = this;

            var arr = createInstance(ruleName, standardArrayProto);
            arr.owner = optionalParent; // predefine property.

            // generated EMF list class lacks setStartTokenIndex method - just set it as method would do
            arr.startTokenIndex = RESOLVER.getNextTokenIndex();
            arr.endTokenIndex = -1;

            // Defining eContainer would not help much.
            // If owner is known, all children are already linked to array's parent.
            // If owner is null, SourceRangeImpl.getCompilationUnit et al. will thrown IllegalStateException.
            // arr.eContainer = function() { return arr.owner; };

            arr.endRule = function () {

                // generated EMF list class lacks setStartTokenIndex method - just set it as method would do
                arr.endTokenIndex = RESOLVER.getLastMatchedTokenIndex();

                // gc, no need to keep after first endRule() call.
                delete arr.endRule;
                delete arr.attachChild;
                delete arr.linkToParent;
            };

            if(allowEmpty) {
                if(!arr.owner) {
                    throw new Error("illegal state: startArrayRule with allowEmpty==true can only be called if optionalParent is non-null");
                }
                linkChild(arr.owner, arr);
            }

            arr.attachChild = function (child) {
                // If owner already known before first attachChild, link to parent hierarchy.
                if (!allowEmpty && arr.length === 0) {
                    if (arr.owner) {
                        linkChild(arr.owner, arr);
                    }
                }

                linkChild(arr, child);
            };

            arr.linkToParent = function (parent, optionalName) {
                linkToParent(arr, parent, optionalName);
            };

            return arr;
        };

        function linkToParent(child, parent, optionalName) {
            if ("attachChild" in parent) {
                parent.attachChild(child, optionalName);
            } else {
                linkChild(parent, child, optionalName);
            }
        }

        function setValue(elem, value) {
            elem.value = value;
            if (value instanceof Object) {
                setParent(value, elem);
            }
        }

        var standardObjectProto = commonddl.SourceRangeImpl;
        var standardArrayProto = commonddl.EObjectContainmentEList;

        BaseCdsDdlParser.prototype.tokenAndValue = function(token, value) {

            var elem = createInstance("TokenAndValue", standardObjectProto);

            elem.token = token;
            setValue(elem, value);

            if (value == null) {
                elem.setValue = function (val) {
                    setValue(elem, val);
                    delete elem.setValue;
                };
            }

            return elem;
        };

        BaseCdsDdlParser.prototype.prepareTokenAndValue = function (parent, grandparent) {
            var tav = this.tokenAndValue(null, null);

            tav.setToken = function (tok, propertyName) {
                tav.token = tok;

                parent.attachChild(tav, propertyName);
                if (grandparent) {
                    parent.linkToParent(grandparent);
                }

                delete tav.setToken;
            };

            return tav;
        };

        var ruleNameToClass = {};
        var nextFreeGlobalInstanceId = 1;

    	function createInstance(ruleName, proto) {
            var RuleClass = getRuleClass(ruleName, proto);
            var o = new RuleClass();
            o.__globalInstanceId = nextFreeGlobalInstanceId++;
            return o;
        }

    	/*
    		isArray: optional, default false i.e. simple object class
    	*/
        function getRuleClass(ruleName, proto) {

            var clazz = ruleNameToClass[ruleName];
            if (clazz) return clazz;

            function __derive (that) {
                proto.call(that);
            }

            /*jshint -W054 */
            /*jslint evil: true */
            /*eslint-disable no-new-func*/
            clazz = new Function('deriveFunction', "return function " + ruleName + "(){ return deriveFunction.apply(this,arguments); }")(__derive);

            clazz.prototype = Object.create(proto.prototype);
            clazz.prototype.constructor = clazz;
            clazz.prototype.ruleName = ruleName;

            ruleNameToClass[ruleName] = clazz;

            return clazz;
        }

        // ====== end: methods for modern AST ======

        return BaseCdsDdlParser;
    }
);
