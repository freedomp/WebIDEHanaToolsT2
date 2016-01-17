/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//fab0da49eb12657a904f37560625c632fd315e9d CDS: Semicolon is reserverd - it cannot be an identifier
/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition*/
define(
    [
        "commonddl/commonddlNonUi",
        "hanaddl/StmtUtil",
        "rndrt/rnd",
        "hanaddl/IBaseCdsDdlParserConstants"
    ], //dependencies
    function (
        commonddl,
        StmtUtil,
        rnd,
        IBaseCdsDdlParserConstants
        ) {
        var DdlScanner = commonddl.DdlScanner;
        var SapDdlConstants = commonddl.SapDdlConstants;
        var TokenUtil = commonddl.TokenUtil;
        var Category = rnd.Category;
        var Constants = rnd.Constants;
        var CursorPos = rnd.CursorPos;
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        var CompletionModes = rnd.CompletionModes;
        var HookResult = rnd.HookResult;
        var CompletionModes = rnd.CompletionModes;
        var SapDdlConstants = commonddl.SapDdlConstants;
        var Utils = rnd.Utils;
        var Parser = rnd.Parser;
        function DdlErrorRecoveryHook(ddlParse) {
            this.ddlParser = ddlParse;
            this.err(IBaseCdsDdlParserConstants.VIEW_DECLARATION_RULE_NAME,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.START2_RULE_NAME,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.NEVER_MATCH_RULE_RULE_NAME,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TOP_LEVEL_DECLARATION_RULE_NAME,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ENTITY_RULE_NAME,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.PATH_NAME_RULE,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.PATH_GENERIC_RULE,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ASSOCIATION_ON_CONDITION_RULE_NAME,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TYPE_COMPONENT_DECLARATION,[IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME,[IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.STRUCTURED_TYPE_RULE_NAME,IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME,IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_VALUE_RULE_NAME,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.RECORD_VALUE_RULE_NAME,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_ID,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.QL_SELECT_LIST,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.PRE_ANNOTATION,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.ANNOTATED_QLSELECT_ITEM,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.PRE_ANNOTATIONS,[IBaseCdsDdlParserConstants.RECORD_COMPONENT,IBaseCdsDdlParserConstants.PRE_ANNOTATION,IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.ANNOTATED_QLSELECT_ITEM,IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.CONTEXT_DECLARATION_RULE_NAME,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATED_QLSELECT_ITEM,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.QL_SELECT_LIST,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.QL_SELECT_CLAUSE,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.AGG,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.PREDICATE_LEFT_IS_EXPRESSION,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.NAMED_ARG_FUNC,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.EXPRESSION_LIST,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.OPT_ASC_DESC,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.CONDITION_AND,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ID_WRAPPER,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEY_ELEMENT,IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME,IBaseCdsDdlParserConstants.ACCESS_POLICY_COMPONENT_DECLARATION,IBaseCdsDdlParserConstants.TOP_LEVEL_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ELEMENT_DECLARATION,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TYPE_NAMED,[IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEYS,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TYPE_DECLARATION,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TYPE_ASSOC,[IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ASSOC_FOREIGN_KEY_OR_JOIN_CONDITION,[IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.CONDITION_TERM,[IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.QL_PATH,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEY_ELEMENT,IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME,IBaseCdsDdlParserConstants.ACCESS_POLICY_COMPONENT_DECLARATION,IBaseCdsDdlParserConstants.TOP_LEVEL_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.TABLE,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION,IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME,IBaseCdsDdlParserConstants.TOP_LEVEL_DECLARATION_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEY_ELEMENT,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION]);
            this.err(IBaseCdsDdlParserConstants.CONST_DECLARATION,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ENUM_VALUE_DECLARATION,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.EXPR_TERM,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.DEFAULT_CLAUSE,[IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP,IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_TYPE_SPEC,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_STRUCTURED_TYPE,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ANNOTATION_DECLARATION,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,[IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.USING_DIRECTIVE,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.NAMESPACE_PATH,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.USING_PATH,[IBaseCdsDdlParserConstants.START_RULE_NAME]);
            this.err(IBaseCdsDdlParserConstants.IN_PREDICATE,[IBaseCdsDdlParserConstants.ACCESS_POLICY_DECLARATION]);
            this.err(IBaseCdsDdlParserConstants.WHERE_CLAUSE_RULE_NAME,[IBaseCdsDdlParserConstants.ROLE_DECLARATION]);
            this.err(IBaseCdsDdlParserConstants.ACCESS_POLICY_COMPONENT_DECLARATION,[IBaseCdsDdlParserConstants.ACCESS_POLICY_DECLARATION]);
        }
        DdlErrorRecoveryHook.prototype = Object.create(null);
        DdlErrorRecoveryHook.prototype.errorRecoveryRuleNames = {};
        DdlErrorRecoveryHook.prototype.ddlParser = null;
        DdlErrorRecoveryHook.prototype.prevFromLastRun = null;
        DdlErrorRecoveryHook.prototype.err = function(key,values) {
            this.errorRecoveryRuleNames[key] = values;
        };
        DdlErrorRecoveryHook.prototype.invoke = function() {
            try {
                var mode = this.ddlParser.getCompletionMode();
                if (CompletionModes.COMPL_MODE_UNIQUE === mode || CompletionModes.COMPL_MODE_GEN === mode) {
                    var stackframe = this.ddlParser.getCurrentStackframe();
                    var parentStackframe = stackframe.getParent();
                    var ruleInfo = stackframe.getRuleInfo();
                    var ruleName = ruleInfo.getRuleName();
                    var token = this.ddlParser.getCurrentToken();
                    var hr = this.recoverFromErrorInAspectExpression(stackframe, token);
                    if (hr != null) {
                        return hr;
                    }
                    if (IBaseCdsDdlParserConstants.COLON === ruleName && IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME === parentStackframe.getRuleInfo().getRuleName()) {
                        ruleName = IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME;
                    }
                    hr = this.recoverFromErrorInAssociationOnCondition(stackframe);
                    if (hr != null) {
                        return hr;
                    }
                    hr = this.skipSemicolonsInAnnotatedElementDeclarationLoop(stackframe,token);
                    if (hr != null) {
                        return hr;
                    }
                    if (this.ddlParser.areAllRuleNamesInHierarchy(stackframe,[IBaseCdsDdlParserConstants.ADHOC_DECLARATION_BLOCK,IBaseCdsDdlParserConstants.QL_SUBQUERY_ELEMENTARY]) && this.ddlParser.isOneOfTheRuleNamesListEntryInHierarchy(stackframe,[IBaseCdsDdlParserConstants.CONDITION_AND,IBaseCdsDdlParserConstants.CONDITION_TERM])) {
                        var res = this.moveTokenIndexToNextLexemButStopAtFirstStartStmt("{");
                        if (res) {
                            this.popToFirstOfTheTargetRuleNames(stackframe,[IBaseCdsDdlParserConstants.QL_SUBQUERY_ELEMENTARY]);
                            return HookResult.DONE;
                        }
                    }
                    if (IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME === ruleName || IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME === ruleName) {
                        var prev = this.ddlParser.getPreviousTokenIgnoringNLAndComment0();
                        if (StmtUtil.isPossibleStartStatementToken(this.ddlParser,prev) || (this.isLexem(prev,[";","{"]))) {
                            if (SapDdlConstants.EOF === token.m_lexem) {
                                return HookResult.NORMAL;
                            }
                            this.consumeToNextSemicolon(this.ddlParser,[],ruleName,stackframe);
                            this.ddlParser.recoverToPreviousCommitInCurrentRule();
                            return HookResult.DONE;
                        }
                    }else if (rnd.Utils.arrayContains(Object.keys(this.errorRecoveryRuleNames), ruleName)) {
                        var targetRuleNamesToBePopped = this.errorRecoveryRuleNames[ruleName];
                        var result = this.consumeToNextSemicolon(this.ddlParser,targetRuleNamesToBePopped,ruleName,stackframe);
                        if (result != null) {
                            return result;
                        }
                        if (ruleName === IBaseCdsDdlParserConstants.CONTEXT_DECLARATION_RULE_NAME) {
                            this.ddlParser.recoverToPreviousCommitInCurrentRule();
                            return HookResult.DONE;
                        }
                        while (stackframe != null) {
                            var n = stackframe.getRuleInfo().getRuleName();
                            var doBreak = false;
                            for (var targetRuleNameToBePoppedCount = 0;targetRuleNameToBePoppedCount < targetRuleNamesToBePopped.length;targetRuleNameToBePoppedCount++) {
                                var targetRuleNameToBePopped = targetRuleNamesToBePopped[targetRuleNameToBePoppedCount];
                                if (targetRuleNameToBePopped === n) {
                                    doBreak = true;
                                    break;
                                }
                            }
                            if (doBreak) {
                                break;
                            }
                            this.ddlParser.returnFromOneStackframeForErrorRecoveryPublic();
                            stackframe = this.ddlParser.getCurrentStackframe();
                        }
                        this.ddlParser.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery();
                        return HookResult.DONE;
                    }
                }
            }
            catch(e) {
                //console.log(e);
            }
            return HookResult.NORMAL;
        };
        DdlErrorRecoveryHook.prototype.isLexem = function(t,string) {
            if (t == null) {
                return false;
            }
            for (var sCount = 0;sCount < string.length;sCount++) {
                var s = string[sCount];
                if (s === t.m_lexem) {
                    return true;
                }
            }
            return false;
        };
        DdlErrorRecoveryHook.prototype.skipSemicolonsInAnnotatedElementDeclarationLoop = function(stackframe,currentToken) {
            if (IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP === stackframe.getRuleInfo().getRuleName()) {
                var tok = currentToken;
                var doit = false;
                while (";" === tok.m_lexem) {
                    doit = true;
                    tok.m_err_state = ErrorState.Correct;
                    this.ddlParser.skipTokenPublic();
                    tok = this.ddlParser.getCurrentToken();
                }
                if (doit) {
                    currentToken.m_err_state = ErrorState.Correct;
                    this.ddlParser.recoverToPreviousCommitInCurrentRule();
                    return HookResult.DONE;
                }
            }
            return null;
        };
        DdlErrorRecoveryHook.prototype.recoverFromErrorInAspectExpression = function(stackframe,token) {
            if (this.ddlParser.isRuleNameInHierarchy(stackframe,IBaseCdsDdlParserConstants.ASPECT_EXPRESSION)) {
                var currentTokenIndex = this.ddlParser.getCurrentTokenIndex();
                var nextTokenIndex = currentTokenIndex + 1;
                var tokens = this.ddlParser.m_scanner.getInput();
                if (nextTokenIndex >= tokens.length) {
                    return null;
                }
                var next = tokens[nextTokenIndex];
                if (this.prevFromLastRun != token && token != null && next != null && token.m_lexem === ":" && next.m_num == Constants.NUM_ANYKW) {
                    this.ddlParser.skipTokenPublic();
                    this.ddlParser.returnFromOneStackframeForErrorRecoveryPublic();
                    this.ddlParser.recoverToStartOfRule(IBaseCdsDdlParserConstants.QL_PATH_STARTRULE);
                    this.prevFromLastRun = token;
                    return HookResult.DONE;
                }
            }
            return null;
        };
        DdlErrorRecoveryHook.prototype.recoverFromErrorInAssociationOnCondition = function(stackframe) {
            if (this.ddlParser.isRuleNameInHierarchy(stackframe,IBaseCdsDdlParserConstants.ASSOCIATION_ON_CONDITION_RULE_NAME)) {
                var currentToken = this.ddlParser.getCurrentToken();
                var tokens = this.ddlParser.m_scanner.getInput();
                var nextIdx = this.ddlParser.getCurrentTokenIndex() + 1;
                if (nextIdx >= tokens.length) {
                    return null;
                }
                var next = TokenUtil.getNextTokenIgnoringNLAndComment(tokens,nextIdx);
                if ("}" === currentToken.m_lexem && rnd.Utils.stringEqualsIgnoreCase("into", next.m_lexem)) {
                    currentToken.m_err_state = ErrorState.Correct;
                    this.ddlParser.skipTokenPublic();
                    this.ddlParser.skipTokenPublic();
                    this.popToFirstOfTheTargetRuleNames(stackframe,[IBaseCdsDdlParserConstants.QL_SUBQUERY_ELEMENTARY]);
                    return HookResult.DONE;
                }
            }
            return null;
        };
        DdlErrorRecoveryHook.prototype.moveTokenIndexToNextLexemButStopAtFirstStartStmt = function(lexem) {
            var prev = this.ddlParser.getPreviousTokenIgnoringNLAndComment0();
            if (StmtUtil.isPossibleStartStatementToken(this.ddlParser,prev)) {
                return false;
            }
            var currentBeforeLoop = this.ddlParser.getCurrentToken();
            /*eslint-disable no-constant-condition*/
            while (true) {
                var current = this.ddlParser.getCurrentToken();
                if (StmtUtil.isPossibleStartStatementToken(this.ddlParser,current)) {
                    return false;
                }
                if (SapDdlConstants.EOF === current.m_lexem) {
                    this.ddlParser.setCurrentTokenIndex(currentBeforeLoop);
                    return false;
                }
                if (rnd.Utils.stringEqualsIgnoreCase(lexem, current.m_lexem)) {
                    return true;
                }
                this.ddlParser.skipTokenPublic();
            }
        };
        DdlErrorRecoveryHook.prototype.popToFirstOfTheTargetRuleNames = function(stackframe,targetRuleNamesToBePopped) {
            while (stackframe != null) {
                var n = stackframe.getRuleInfo().getRuleName();
                var doBreak = false;
                for (var targetRuleNameToBePoppedCount = 0;targetRuleNameToBePoppedCount < targetRuleNamesToBePopped.length;targetRuleNameToBePoppedCount++) {
                    var targetRuleNameToBePopped = targetRuleNamesToBePopped[targetRuleNameToBePoppedCount];
                    if (targetRuleNameToBePopped === n) {
                        doBreak = true;
                        break;
                    }
                }
                if (doBreak) {
                    break;
                }
                this.ddlParser.returnFromOneStackframeForErrorRecoveryPublic();
                stackframe = this.ddlParser.getCurrentStackframe();
            }
            this.ddlParser.storeCurrentPositionAsOriginClearingInstructionsOnErrorRecovery();
        };
        DdlErrorRecoveryHook.prototype.consumeToNextSemicolon = function(ddlParser,targetRuleNamesToBePopped,ruleName,stackframe) {
            var cocoPos = ddlParser.getTriggerPosForCoCo();
            var prev = ddlParser.getPreviousTokenIgnoringNLAndComment0();
            var currentToken = ddlParser.getCurrentToken();
            var isCurrentTokenBeforeCoCoPos = this.isBefore(currentToken,cocoPos);
            currentToken.m_err_state = ErrorState.Correct;
            if (prev != this.prevFromLastRun) {
                this.prevFromLastRun = prev;
                if (IBaseCdsDdlParserConstants.ANNOTATION_VALUE_RULE_NAME === ruleName && "]" === currentToken.m_lexem) {
                    ddlParser.skipTokenPublic();
                    var ct = ddlParser.getCurrentToken();
                    if (ct != null) {
                        if (StmtUtil.isPossibleStartStatementToken(ddlParser,ct)) {
                            rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                        }
                    }
                    return null;
                }else if (StmtUtil.isPossibleStartStatementToken(ddlParser,prev)) {
                    prev.m_category = Category.CAT_MAYBE_KEYWORD;
                    prev.m_err_state = ErrorState.Correct;
                    ddlParser.setCurrentTokenIndex(prev);
                    return null;
                }else if (":" === currentToken.m_lexem) {
                    ddlParser.getCurrentToken().m_err_state = ErrorState.Correct;
                    prev.m_category = Category.CAT_MAYBE_KEYWORD;
                    prev.m_err_state = ErrorState.Correct;
                    ddlParser.setCurrentTokenIndex(prev);
                    return null;
                }else if (prev != null && "@" === prev.m_lexem) {
                    if (rnd.Utils.arrayContains(targetRuleNamesToBePopped, IBaseCdsDdlParserConstants.PRE_ANNOTATION)) {
                        rnd.Utils.arrayRemove(targetRuleNamesToBePopped, IBaseCdsDdlParserConstants.PRE_ANNOTATION);
                    }
                    return null;
                }else if ("}" === currentToken.m_lexem && ddlParser.isRuleNameInHierarchy(stackframe,IBaseCdsDdlParserConstants.QL_SELECT_LIST) == false) {
                    currentToken.m_err_state = ErrorState.Correct;
                    return null;
                }else if (currentToken.m_lexem === "@" && ddlParser.isRuleNameInHierarchy(stackframe,IBaseCdsDdlParserConstants.USING_DIRECTIVE)) {
                    currentToken.m_err_state = ErrorState.Correct;
                    return null;
                }else if (StmtUtil.isPossibleStartStatementToken(ddlParser,currentToken)) {
                    return null;
                }
                if (ddlParser.isOneOfTheRuleNamesListEntryInHierarchy(stackframe,[IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME,IBaseCdsDdlParserConstants.TYPE_DECLARATION])) {
                    var tokens = ddlParser.m_scanner.getInput();
                    var idx = tokens.indexOf(currentToken) + 1;
                    if (idx < tokens.length - 1) {
                        var next = ddlParser.getNextTokenIgnoringNLAndComment(idx);
                        if (next != null && ":" === next.m_lexem) {
                            return null;
                        }
                    }
                }
            }
            var curlyBracketNestingLevel = 0;
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (ddlParser.getCurrentToken().m_num == this.getEofTokenNumber() || (ddlParser.getCurrentToken().m_lexem === ";" == true)) {
                    if (curlyBracketNestingLevel == 0 || curlyBracketNestingLevel == -1) {
                        var ts = this.getTokensFromCurrentTokenIndexToCompletionTriggerIgnoringComments(ddlParser);
                        if (ts != null && ts.length == 2 && "}" === ts[0].m_lexem && ";" === ts[1].m_lexem) {
                            /*eslint-disable no-constant-condition*/
                            while (true) {
                                ddlParser.skipTokenPublic();
                                var t = ddlParser.getCurrentToken();
                                if (ts[1] === t) {
                                    break;
                                }
                            }
                            if (IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME === ruleName) {
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 2);
                            }else if (IBaseCdsDdlParserConstants.PATH_NAME_RULE === ruleName) {
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                            }else if (IBaseCdsDdlParserConstants.PATH_GENERIC_RULE === ruleName) {
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                                rnd.Utils.arrayRemove(targetRuleNamesToBePopped, 0);
                            }
                        }
                        break;
                    }
                }
                ddlParser.skipTokenPublic();
                var t = ddlParser.getCurrentToken();
                if (curlyBracketNestingLevel == 0 && StmtUtil.isPossibleStartStatementToken(ddlParser,t)) {
                    return null;
                }
                if ("{" === t.m_lexem) {
                    curlyBracketNestingLevel++;
                }
                if ("}" === t.m_lexem) {
                    curlyBracketNestingLevel--;
                }
                if (t.m_num == Constants.NUM_EOF) {
                    break;
                }
            }
            if (ddlParser.getCurrentToken().m_num == this.getEofTokenNumber()) {
                return HookResult.NORMAL;
            }
            ddlParser.skipTokenPublic();
            var isTokenAfterCoCoPos = this.isAfter(ddlParser.getCurrentToken(), cocoPos);
            if (isCurrentTokenBeforeCoCoPos && isTokenAfterCoCoPos) {
                currentToken.m_err_state = ErrorState.Erroneous;
            }
            return null;
        };
        DdlErrorRecoveryHook.prototype.getEofTokenNumber = function() {
            var scanner = this.ddlParser.m_scanner;
            return scanner.getEofTokenNumber();
        };
        DdlErrorRecoveryHook.prototype.isAfter = function(currentToken,cocoPos) {
            if (currentToken == null || cocoPos == null) {
                return false;
            }
            if (currentToken.m_line > cocoPos.m_line) {
                return true;
            }
            if (currentToken.m_line < cocoPos.m_line) {
                return false;
            }
            if (currentToken.m_column > cocoPos.m_column) {
                return true;
            }
            return false;
        };
        DdlErrorRecoveryHook.prototype.isBefore = function(currentToken,cocoPos) {
            if (currentToken == null || cocoPos == null) {
                return false;
            }
            if (currentToken.m_line < cocoPos.m_line) {
                return true;
            }
            if (currentToken.m_line > cocoPos.m_line) {
                return false;
            }
            if (currentToken.m_column < cocoPos.m_column) {
                return true;
            }
            return false;
        };
        DdlErrorRecoveryHook.prototype.getTokensFromCurrentTokenIndexToCompletionTriggerIgnoringComments = function(ddlParser) {
            var result = [];
            try {
                var i = ddlParser.getCurrentTokenIndex() + 1;
                /*eslint-disable no-constant-condition*/
                while (true) {
                    var t = ddlParser.m_scanner.getToken(i);
                    if (t == null) {
                        return result;
                    }
                    if (t.m_num == Constants.NUM_ANYKW) {
                        break;
                    }
                    if (t.m_category === Category.CAT_COMMENT == false) {
                        result.push(t);
                    }
                    i++;
                }
            }
            catch(e) {
            }
            return result;
        };
        return DdlErrorRecoveryHook;
    }
);