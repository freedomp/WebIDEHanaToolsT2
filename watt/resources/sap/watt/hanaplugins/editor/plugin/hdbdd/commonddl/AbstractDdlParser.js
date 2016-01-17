/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare*/
// based on commit
//c6da3bc7881acebdde1fe61777ab3b1cdf2a77b2 AST nodes for association definitions in extend view
define(
    [
        "commonddl/AbstractDdlCodeCompletionProposal",
        "commonddl/DdlCodeCompletionType",
        "commonddl/DdlKeywordCodeCompletionProposal",
        "commonddl/TokenUtil",
        "commonddl/astmodel/BooleanType",
        "commonddl/astmodel/AbstractAnnotationImpl",
        "commonddl/astmodel/AbstractAnnotationValueImpl",
        "commonddl/astmodel/AccessPolicyDeclarationImpl",
        "commonddl/astmodel/AnnotatedImpl",
        "commonddl/astmodel/AnnotationArrayValueImpl",
        "commonddl/astmodel/AnnotationDeclarationImpl",
        "commonddl/astmodel/AnnotationNameValuePairImpl",
        "commonddl/astmodel/AnnotationPathValueImpl",
        "commonddl/astmodel/AnnotationRecordValueImpl",
        "commonddl/astmodel/AnnotationValueImpl",
        "commonddl/astmodel/AnonymousTypeDeclarationImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl",
        "commonddl/astmodel/AspectDeclarationImpl",
        "commonddl/astmodel/AssociationDeclarationImpl",
        "commonddl/astmodel/IAstFactory",
        "commonddl/astmodel/AttributeDeclarationImpl",
        "commonddl/astmodel/BetweenExpressionImpl",
        "commonddl/astmodel/BooleanExpressionImpl",
        "commonddl/astmodel/CardinalityRestrictionImpl",
        "commonddl/astmodel/CaseExpressionImpl",
        "commonddl/astmodel/CaseWhenExpressionImpl",
        "commonddl/astmodel/CastExpressionImpl",
        "commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/CompilationUnitImpl",
        "commonddl/astmodel/ConcatenationExpressionImpl",
        "commonddl/astmodel/ConstDeclarationImpl",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/DdlStatementImpl",
        "commonddl/astmodel/ElementDeclarationImpl",
        "commonddl/astmodel/EntityDeclarationImpl",
        "commonddl/astmodel/EnumerationDeclarationImpl",
        "commonddl/astmodel/EnumerationValueImpl",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/ExpressionContainerImpl",
        "commonddl/astmodel/ForeignKeyImpl",
        "commonddl/astmodel/FuncExpressionImpl",
        "commonddl/astmodel/FuncParamImpl",
        "commonddl/astmodel/FuncWithNamedParamExpressionImpl",
        "commonddl/astmodel/GroupByImpl",
        "commonddl/astmodel/GroupByEntryImpl",
        "commonddl/astmodel/InExpressionImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/LikeExpressionImpl",
        "commonddl/astmodel/LiteralExpressionImpl",
        "commonddl/astmodel/NamesImpl",
        "commonddl/astmodel/NotExpressionImpl",
        "commonddl/astmodel/NullExpressionImpl",
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/OrderByEntryImpl",
        "commonddl/astmodel/ParameterImpl",
        "commonddl/astmodel/ParameterBindingImpl",
        "commonddl/astmodel/ParameterBindingsImpl",
        "commonddl/astmodel/PathDeclarationImpl",
        "commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/PathExpressionImpl",
        "commonddl/astmodel/PostAnnotationImpl",
        "commonddl/astmodel/PostfixRuleFromClauseImpl",
        "commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/PrefixRuleFromClauseImpl",
        "commonddl/astmodel/ReturnStructureListImpl",
        "commonddl/astmodel/RoleDeclarationImpl",
        "commonddl/astmodel/RuleDeclarationImpl",
        "commonddl/astmodel/RuleFromClauseImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl",
        "commonddl/astmodel/SelectImpl",
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/SelectListEntryImpl",
        "commonddl/astmodel/SelectListEntryExtensionImpl",
        "commonddl/astmodel/SimpleCaseExpressionImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/StdFuncExpressionImpl",
        "commonddl/astmodel/TableFunctionImpl",
        "commonddl/astmodel/UsingDirectiveImpl",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/astmodel/ViewExtendImpl",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/ViewSelectSetImpl",
        "commonddl/astmodel/JoinEnum", "rndrt/rnd",
        "commonddl/SapDdlConstants", "commonddl/Region",
        "commonddl/AnnotationUtil"
    ], // dependencies
    function (
        AbstractDdlCodeCompletionProposal,
        DdlCodeCompletionType,
        DdlKeywordCodeCompletionProposal,
        TokenUtil,
        BooleanType,
        AbstractAnnotationImpl,
        AbstractAnnotationValueImpl,
        AccessPolicyDeclarationImpl,
        AnnotatedImpl,
        AnnotationArrayValueImpl,
        AnnotationDeclarationImpl,
        AnnotationNameValuePairImpl,
        AnnotationPathValueImpl,
        AnnotationRecordValueImpl,
        AnnotationValueImpl,
        AnonymousTypeDeclarationImpl,
        ArithmeticExpressionImpl,
        AspectDeclarationImpl,
        AssociationDeclarationImpl,
        IAstFactory,
        AttributeDeclarationImpl,
        BetweenExpressionImpl,
        BooleanExpressionImpl,
        CardinalityRestrictionImpl,
        CaseExpressionImpl,
        CaseWhenExpressionImpl,
        CastExpressionImpl,
        CompExpressionImpl,
        CompilationUnitImpl,
        ConcatenationExpressionImpl,
        ConstDeclarationImpl,
        DataSourceImpl,
        DdlStatementImpl,
        ElementDeclarationImpl,
        EntityDeclarationImpl,
        EnumerationDeclarationImpl,
        EnumerationValueImpl,
        ExpressionImpl,
        ExpressionContainerImpl,
        ForeignKeyImpl,
        FuncExpressionImpl,
        FuncParamImpl,
        FuncWithNamedParamExpressionImpl,
        GroupByImpl,
        GroupByEntryImpl,
        InExpressionImpl,
        JoinDataSourceImpl,
        LikeExpressionImpl,
        LiteralExpressionImpl,
        NamesImpl,
        NotExpressionImpl,
        NullExpressionImpl,
        OrderByImpl,
        OrderByEntryImpl,
        ParameterImpl,
        ParameterBindingImpl,
        ParameterBindingsImpl,
        PathDeclarationImpl,
        PathEntryImpl,
        PathExpressionImpl,
        PostAnnotationImpl,
        PostfixRuleFromClauseImpl,
        PreAnnotationImpl,
        PrefixRuleFromClauseImpl,
        ReturnStructureListImpl,
        RoleDeclarationImpl,
        RuleDeclarationImpl,
        RuleFromClauseImpl,
        SearchedCaseExpressionImpl,
        SelectImpl,
        SelectListImpl,
        SelectListEntryImpl,
        SelectListEntryExtensionImpl,
        SimpleCaseExpressionImpl,
        SourceRangeImpl,
        StdFuncExpressionImpl,
        TableFunctionImpl,
        UsingDirectiveImpl,
        ViewDefinitionImpl,
        ViewExtendImpl,
        ViewSelectImpl,
        ViewSelectSetImpl,
        JoinEnum,
        rnd,
        SapDdlConstants,
        Region,
        AnnotationUtil
        ) {
        var Category = rnd.Category;
        var CursorPos = rnd.CursorPos;
        var Token = rnd.Token;
        var Parser = rnd.Parser;
        var TokenCoCoCompletion = rnd.TokenCoCoCompletion;
        var TokenCoCoParser = rnd.TokenCoCoParser;
        var CompletionModes = rnd.CompletionModes;
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        function AbstractDdlParser(byte_code,scanner,repositoryAccess) {
            TokenCoCoParser.call(this,byte_code,scanner);
            this.setComplMaxKeywords(5);
            this.repositoryAccess = repositoryAccess;
        }
        AbstractDdlParser.prototype = Object.create(TokenCoCoParser.prototype);
        AbstractDdlParser.prototype.constructor = AbstractDdlParser;
        AbstractDdlParser.PRE_ANNOTATION_RULE = "PreAnnotation";
        AbstractDdlParser.RECORD_COMPONENT_RULE = "RecordComponent";
        AbstractDdlParser.POST_ANNOTATION_RULE = "PostAnnotation";
        AbstractDdlParser.TRUE_STRING = "true";
        AbstractDdlParser.FALSE_STRING = "false";
        AbstractDdlParser.EL_DECL_TYPE_STRING = "string";
        AbstractDdlParser.EL_DECL_TYPE_ELEMENT_REF = "elementRef";
        AbstractDdlParser.EL_DECL_TYPE_BOOLEAN = "boolean";
        AbstractDdlParser.EL_DECL_TYPE_INTEGER = "integer";
        AbstractDdlParser.EL_DECL_TYPE_NUMBER = "number";
        AbstractDdlParser.prototype.repositoryAccess = null;
        AbstractDdlParser.prototype.allAnnotDefsAndEnumValues = null;
        AbstractDdlParser.prototype.semanticCompletions = [];
        AbstractDdlParser.prototype.semanticCodeCompletionProposals = [];
        AbstractDdlParser.INCOMPLETE_SIGNAL = "$$incomplete_result$$";
        AbstractDdlParser.prototype.currentSelect = null;
        AbstractDdlParser.prototype.lastFoundDataSources = [];
        AbstractDdlParser.prototype.visitor = null;
        AbstractDdlParser.prototype.allDataSources = [];
        AbstractDdlParser.prototype.allAssociationDeclarations = [];
        AbstractDdlParser.prototype.allEntityDeclarations = [];
        AbstractDdlParser.prototype.unionStack = [];
        AbstractDdlParser.prototype.compilationUnit = null;
        AbstractDdlParser.prototype.cocoCompilationUnit = null;
        AbstractDdlParser.prototype.cocoTriggerPos = null;
        AbstractDdlParser.prototype.supportedAnnotations = null;
        AbstractDdlParser.prototype.currentIncompleteSelectListEntry = null;
        AbstractDdlParser.prototype.padFileResolverUsedToGetByteCode = null;
        AbstractDdlParser.prototype.ddlParser = null;
        AbstractDdlParser.prototype.run = function(completion_mode,halted,HALTED_INTERVAL) {
            this.semanticCompletions = [];
            this.semanticCodeCompletionProposals = [];
            this.unionStack = [];
            this.allDataSources = [];
            this.allAssociationDeclarations = [];
            this.allEntityDeclarations = [];
            this.lastFoundDataSources = [];
            return TokenCoCoParser.prototype.run.call(this,completion_mode,halted,HALTED_INTERVAL);
        };
        AbstractDdlParser.prototype.isEmptyIncompleteToken = function(token) {
            if (token != null && Category.CAT_INCOMPLETE === token.m_category) {
                if ("" === token.m_lexem) {
                    return true;
                }
            }
            return false;
        };
        AbstractDdlParser.prototype.isKeyword = function(t) {
            var res = TokenUtil.isKeyword(t);
            return res;
        };
        AbstractDdlParser.prototype.isIdentifier = function(t) {
            if (Category.CAT_IDENTIFIER === t.m_category) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.getRuleNameHierarchy = function(stackframe) {
            var result = new StringBuffer();
            /*eslint-disable no-constant-condition*/
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                result.append(rn).append("#");
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return result;
                }
            }
        };
        AbstractDdlParser.prototype.isOneOfTheRuleNamesListEntryInHierarchy = function(stackframe,ruleNames) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                for (var ruleNameCount = 0;ruleNameCount < ruleNames.length;ruleNameCount++) {
                    var ruleName = ruleNames[ruleNameCount];
                    if (ruleName === rn) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.isOneOfTheRuleNamesInHierarchy = function(stopAtFirstRuleName,stackframe,ruleNames) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (stopAtFirstRuleName === rn) {
                    return false;
                }
                for (var ruleNameCount = 0;ruleNameCount < ruleNames.length;ruleNameCount++) {
                    var ruleName = ruleNames[ruleNameCount];
                    if (ruleName === rn) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.sortKeywordCompletions = function(result) {
            result.sort(function(o1,o2) {if (o1 == null || o2 == null) {
                return 0;
            }
                return rnd.Utils.stringCompareTo(o1.toLowerCase(), o2.toLowerCase());
            });
        };
        AbstractDdlParser.prototype.getTypedCompletionNames = function(resolver) {
            var result = [];
            var keywordCompletions = this.getKeywordCompletions(resolver);
            this.sortKeywordCompletions(keywordCompletions);
            for (var keywordCompletionCount = 0;keywordCompletionCount < keywordCompletions.length;keywordCompletionCount++) {
                throw new Error();
            }
            this.semanticCompletions = this.sortSemanticCompletionResults(this.semanticCompletions);
            result = Utils.insertArrayAt( result, 0, this.semanticCompletions );
            return result;
        };
        AbstractDdlParser.prototype.getTypedCodeCompletionNames = function(resolver) {
            var result = [];
            var keywordCompletions = this.getKeywordCompletions(resolver);
            for (var keywordCompletionCount = 0;keywordCompletionCount < keywordCompletions.length;keywordCompletionCount++) {
                var keywordCompletion = keywordCompletions[keywordCompletionCount];
                var comp = new DdlKeywordCodeCompletionProposal(keywordCompletion);
                result.push(comp);
            }
            result = Utils.insertArrayAt( result, 0, this.semanticCodeCompletionProposals );
            result = this.sortCodeCompletionResults(result);
            return result;
        };
        AbstractDdlParser.prototype.getKeywordCompletions = function(resolver) {
            var result = [];
            var completionPaths = resolver.getCompletionPaths();
            for (var completionCount = 0;completionCount < completionPaths.length;completionCount++) {
                var completion = completionPaths[completionCount];
                var np = "";
                var tokens = [];
                if (completion.getCompletion() != null) {
                    tokens = (completion.getCompletion()).m_next_tokens;
                }
                for (var tCount = 0;tCount < tokens.length;tCount++) {
                    var t = tokens[tCount];
                    var info = resolver.getByteCodeTokenInfo();
                    var name = info.getTokenNameUS(t);
                    if (name != null && (SapDdlConstants.ID === name || SapDdlConstants.ENUM_ID === name || SapDdlConstants.COLON_FOLLOWED_BY_ID === name || SapDdlConstants.INT_CONST === name || SapDdlConstants.LONG_INT_CONST === name || SapDdlConstants.DEC_CONST === name || SapDdlConstants.REAL_CONST === name || SapDdlConstants.DATE_CONST === name || SapDdlConstants.TIME_CONST === name || SapDdlConstants.TIMESTAMP_CONST === name || SapDdlConstants.STRING_CONST === name || SapDdlConstants.BINARY_CONST === name || SapDdlConstants.DASH_ARROW_NONE_WS === name)) {
                        break;
                    }else if ("#" === name) {
                        continue;
                    }else if ("(" === name) {
                        np += name;
                    }else{
                        np += " " + name;
                    }
                }
                np = rnd.Utils.stringTrim(np);
                if (SapDdlConstants.PIPE_PIPE === np) {
                    np = "||";
                }
                if ("$extension . *" === np) {
                    np = "$extension.*";
                }
                if ("$parameters ." === np || "$parameters" === np) {
                    np = "$parameters.";
                }
                if ("$session ." === np || "$session" === np) {
                    np = "$session.";
                }
                if (np.length == 0) {
                    continue;
                }
                if (rnd.Utils.arrayContains(result, np) == false) {
                    result.push(np);
                }
            }
            return result;
        };
        AbstractDdlParser.prototype.sortSemanticCompletionResults = function(semanticCompletions) {
            throw new Error();
        };
        AbstractDdlParser.prototype.sortCodeCompletionResults = function(result) {

            result.sort(function(o1,o2) {if (o1 == null || o2 == null) {
                return 0;
            }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName() && AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName()) {
                    return 1;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return -1;
                }
                if (o1.getType() == null || o2.getType() == null) {
                    return 0;
                }
                var diff = o1.getType().value - o2.getType().value;
                if (diff != 0) {
                    return diff;
                }
                if (o1.getName() == null || o2.getName() == null) {
                    return 0;
                }
                var o1n = o1.getName().toLowerCase();
                var o2n = o2.getName().toLowerCase();
                if (o1n == "::" && o2n == ".")
                    return 1;
                if (o1n == ":" && o2n == ".")
                    return 1;
                if (o1n == "@")
                    return -1;
                if (o2n == "@")
                    return 1;
                if (o2n[0] == "}")
                    return -1;
                if (o1n[0] == "}" && rnd.Utils.isLetter(o2n[0]))
                    return 1;
                return rnd.Utils.stringCompareTo(o1n,o2n);
            });
            return result;

        };
        AbstractDdlParser.prototype.sortSemanticCodeCompletionResults = function(semanticCompletions) {
            this.semanticCompletions.sort(function(o1,o2) {if (o1 == null || o2 == null) {
                return 0;
            }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName() && AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return 0;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o1.getName()) {
                    return 1;
                }
                if (AbstractDdlParser.INCOMPLETE_SIGNAL === o2.getName()) {
                    return -1;
                }
                if (DdlCodeCompletionType.ANNOTATION === o1.getType() && !(DdlCodeCompletionType.ANNOTATION === o2.getType())) {
                    return 1;
                }
                if (DdlCodeCompletionType.ANNOTATION === o2.getType() && !(DdlCodeCompletionType.ANNOTATION === o1.getType())) {
                    return -1;
                }
                if (o1.getName() == null || o2.getName() == null) {
                    return 0;
                }
                return rnd.Utils.stringCompareTo(o1.getName().toLowerCase(), o2.getName().toLowerCase());
            });
            return semanticCompletions;
        };
        AbstractDdlParser.prototype.getCompletionNames = function(resolver) {
            var names = this.getTypedCompletionNames(resolver);
            var result = [];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                result.push(name.name);
            }
            return result;
        };
        AbstractDdlParser.prototype.getCodeCompletionNames = function(resolver) {
            var names = this.getTypedCodeCompletionNames(resolver);
            var result = [];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                result.push(name.getName());
            }
            return result;
        };
        AbstractDdlParser.prototype.viewparser_createConcatenationExpression = function(left,right,operator) {
            var expr = IAstFactory.eINSTANCE.createConcatenationExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setOperator(operator);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_startDefineView = function() {
            this.lastFoundDataSources = [];
            var def = IAstFactory.eINSTANCE.createViewDefinition();
            this.allEntityDeclarations.push(def);
            return def;
        };
        AbstractDdlParser.prototype.getString = function(t) {
            return t.m_lexem;
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_viewName = function(vd,name) {
        //    vd.setNameToken(name);
        //};
        AbstractDdlParser.prototype.viewparser_tableDatasource = function(pe) {

            var ds = IAstFactory.eINSTANCE.createDataSource();
            ds.setNamePathExpression(pe);
            this.allDataSources.push(pe);
            if (this.visitor != null && this.visitor.visitSimpleDataSource) {
                this.visitor.visitSimpleDataSource(ds);
            }
            return ds;

        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_datasourcealias = function(ds,alias) {
        //    ds.setAliasToken(alias);
        //    if (this.visitor != null) {
        //        this.visitor.visitSimpleDataSource(ds);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_innerjoinDatasource = function(left,right,onexpr) {
            var join = IAstFactory.eINSTANCE.createJoinDataSource();
            return this.viewparser_setDatasourcesForJoin(join,JoinEnum.INNER,left,right,onexpr);
        };
        AbstractDdlParser.prototype.viewparser_setDatasourcesForJoin = function(join,joinType,left,right,onexpr) {
            join.setLeft(left);
            join.setRight(right);
            join.setOn(onexpr);
            join.setJoinEnum(joinType);
            return join;
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_atomicExpression2 = function(alias,name) {
        //    var pe = IAstFactory.eINSTANCE.createPathExpression();
        //    var entry = null;
        //    if (alias != null) {
        //        entry = IAstFactory.eINSTANCE.createPathEntry();
        //        entry.setNameToken(alias);
        //        pe.getEntries().push(entry);
        //    }
        //    entry = IAstFactory.eINSTANCE.createPathEntry();
        //    entry.setNameToken(name);
        //    pe.getEntries().push(entry);
        //    return pe;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_atomicExpression1 = function(name) {
        //    var pe = IAstFactory.eINSTANCE.createPathExpression();
        //    var entry = IAstFactory.eINSTANCE.createPathEntry();
        //    entry.setNameToken(name);
        //    pe.getEntries().push(entry);
        //    return pe;
        //};
        AbstractDdlParser.prototype.viewparser_orExpression = function(cond,cond2) {
            var ex = IAstFactory.eINSTANCE.createBooleanExpression();
            ex.addConditionExpression(cond);
            ex.addConditionExpression(cond2);
            ex.setType(BooleanType.OR);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_andExpression = function(cond,cond2) {
            var ex = IAstFactory.eINSTANCE.createBooleanExpression();
            ex.addConditionExpression(cond);
            ex.addConditionExpression(cond2);
            ex.setType(BooleanType.AND);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_notExpression = function(cond) {
            var res = IAstFactory.eINSTANCE.createNotExpression();
            res.setCond(cond);
            return res;
        };
        AbstractDdlParser.prototype.viewparser_compExpression = function(op,left,right) {
            var expr = IAstFactory.eINSTANCE.createCompExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setTypeToken(op);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_betweenExpression = function(left,lower,upper) {
            var expr = IAstFactory.eINSTANCE.createBetweenExpression();
            expr.setLeft(left);
            expr.setLower(lower);
            expr.setUpper(upper);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_nullExpression = function(left,isNot) {
            var nullExpr = IAstFactory.eINSTANCE.createNullExpression();
            nullExpr.setLeft(left);
            nullExpr.setNot(isNot);
            return nullExpr;
        };
        AbstractDdlParser.prototype.viewparser_inExpression = function(left,ins) {
            var inEx = IAstFactory.eINSTANCE.createInExpression();
            inEx.setLeft(left);
            inEx.getIns().addAll(ins);
            return inEx;
        };
        AbstractDdlParser.prototype.viewparser_likeExpression = function(op,left,right,escape) {
            var expr = IAstFactory.eINSTANCE.createLikeExpression();
            expr.setLeft(left);
            expr.setRight(right);
            expr.setTypeToken(op);
            expr.setEscapeToken(escape);
            return expr;
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_parameter = function(token) {
        //    var pe = IAstFactory.eINSTANCE.createPathExpression();
        //    var entry = IAstFactory.eINSTANCE.createPathEntry();
        //    entry.setNameToken(token);
        //    pe.getEntries().push(entry);
        //    this.visitPathExpression(pe);
        //    return pe;
        //};
        AbstractDdlParser.prototype.viewparser_cliteral = function(token) {
            var ex = IAstFactory.eINSTANCE.createLiteralExpression();
            ex.setTokenToken(token);
            return ex;
        };
        AbstractDdlParser.prototype.viewparser_iliteral = function(token) {
            var ex = IAstFactory.eINSTANCE.createLiteralExpression();
            ex.setTokenToken(token);
            return ex;
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_hexliteral = function(token) {
        //    var ex = IAstFactory.eINSTANCE.createLiteralExpression();
        //    ex.setTokenToken(token);
        //    return ex;
        //};
        AbstractDdlParser.prototype.viewparser_startSelect = function() {
            return IAstFactory.eINSTANCE.createViewSelect();
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_distinct = function(select) {
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_from = function(select,ds) {
        //    if (select != null) {
        //        select.setFrom(ds);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_selectlist = function(select,sl) {
            if (select != null && sl != null) {
                select.setSelectList(sl);
            }
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_extendSelectlist = function(extend,sl) {
        //    if (extend != null) {
        //        extend.setSelectList(sl);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_selectListEntry = function(exp) {
            var entry = IAstFactory.eINSTANCE.createSelectListEntry();
            if (exp != null) {
                entry.setExpression(exp);
            }
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_alias = function(entry,alias) {
            if (entry == null) {
                return;
            }
            entry.setAliasToken(alias);
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_selectListExtension = function(name) {
        //    var entry = IAstFactory.eINSTANCE.createSelectListEntryExtension();
        //    entry.setAliasToken(name);
        //    return entry;
        //};
        AbstractDdlParser.prototype.viewparser_startSelectList0 = function() {
            return IAstFactory.eINSTANCE.createSelectList();
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_startSelectList1 = function(column) {
        //
        //    var tokens = Parser.prototype.getTokens.call(this);
        //    var tokenIndex = tokens.indexOf(column);
        //    var list = IAstFactory.eINSTANCE.createSelectList();
        //    var entry = IAstFactory.eINSTANCE.createSelectListEntry();
        //    var pe = IAstFactory.eINSTANCE.createPathExpression();
        //    var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
        //    pathEntry.setNameToken(column);
        //    pe.setStartTokenIndex(tokenIndex);
        //    pe.setEndTokenIndex(tokenIndex);
        //    pe.getEntries().push(pathEntry);
        //    entry.setExpression(pe);
        //    entry.setStartTokenIndex(tokenIndex);
        //    entry.setEndTokenIndex(tokenIndex);
        //    list.addEntry1(entry);
        //    return list;
        //
        //};
        AbstractDdlParser.prototype.viewparser_addSelectListEntry = function(list,entry) {
            if (list != null) {
                var entries = list.getEntries();
                if (entries != null && entries.length > 0) {
                    var last = entries[entries.length - 1];
                    if (last != null && last == this.currentIncompleteSelectListEntry) {
                        rnd.Utils.arrayRemove(entries, last);
                        this.currentIncompleteSelectListEntry = null;
                    }
                }
                list.addEntry1(entry);
            }
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_addIncompleteSelectListEntry = function(list,entry) {
        //    list.addEntry1(entry);
        //    this.currentIncompleteSelectListEntry = entry;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_endSelect = function(def,select) {
        //    if (def != null && select != null) {
        //        def.setSelect(select);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_startGroupBy = function() {
            return IAstFactory.eINSTANCE.createGroupBy();
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_groupBy2 = function(select,groupBy) {
        //    if (select != null) {
        //        select.setGroupBy(groupBy);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_groupByEntry = function(expression) {
            var entry = IAstFactory.eINSTANCE.createGroupByEntry();
            entry.setExpression(expression);
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_groupBy1 = function(expressions) {
            var groupBy = this.viewparser_startGroupBy();
            for (var expCount = 0;expCount < expressions.length;expCount++) {
                var exp = expressions[expCount];
                var entry = this.viewparser_groupByEntry(exp);
                entry.setStartTokenIndex(exp.getStartTokenIndex());
                entry.setEndTokenIndex(exp.getEndTokenIndex());
                this.viewparser_addGroupByEntry(groupBy,entry);
            }
            return groupBy;
        };
        AbstractDdlParser.prototype.viewparser_createOrderBy = function(entries) {
            var ob = IAstFactory.eINSTANCE.createOrderBy();
            ob.getEntries().addAll(entries);
            return ob;
        };
        AbstractDdlParser.prototype.viewparser_createOrderByEntry = function(exp) {
            var entry = IAstFactory.eINSTANCE.createOrderByEntry();
            entry.setExpression(exp);
            return entry;
        };
        AbstractDdlParser.prototype.viewparser_addGroupByEntry = function(list,entry) {
            if (list != null) {
                list.getEntries().push(entry);
            }
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_having = function(select,having) {
        //    select.setHaving(having);
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_where = function(select,cond) {
        //    if (select != null) {
        //        select.setWhere(cond);
        //    }
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_addUnion = function(old,select,unionToken) {
        //    old.setUnion(select);
        //    old.setUnionToken(unionToken);
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_addUnionAll = function(old,select,unionToken,allToken) {
        //    old.setUnion(select);
        //    old.setUnionAll(true);
        //    old.setUnionToken(unionToken);
        //    old.setAllToken(allToken);
        //};
        AbstractDdlParser.prototype.viewparser_stdFunctionExpression = function(name,ae) {
            var func = IAstFactory.eINSTANCE.createStdFuncExpression();
            func.setFuncNameToken(name);
            if (ae != null) {
                func.setParameter(ae);
            }
            return func;
        };
        AbstractDdlParser.prototype.viewparser_addFuncExprParameter = function(funcExpr,expr) {
            if (expr != null) {
                funcExpr.getParameters().push(expr);
            }
        };
        AbstractDdlParser.prototype.addFuncExprParameter = function(funcExpr,expr) {
            if (expr != null) {
                funcExpr.getParameters().push(expr);
            }
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_addParameter = function(funcExpr,expr) {
        //    if (expr != null) {
        //        funcExpr.setParameter(expr);
        //    }
        //};
        AbstractDdlParser.prototype.viewparser_funcExpression = function(name) {
            var expr = IAstFactory.eINSTANCE.createFuncExpression();
            expr.setName(name);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_funcWithNamedParamExpression = function(name) {
            var expr = IAstFactory.eINSTANCE.createFuncWithNamedParamExpression();
            expr.setName(name);
            return expr;
        };
        AbstractDdlParser.prototype.createConstructorFuncExpression = function(name) {
            var expr = IAstFactory.eINSTANCE.createConstructorFuncExpression();
            expr.setName(name);
            return expr;
        };
        AbstractDdlParser.prototype.viewparser_addFuncParam = function(funcExpr,paramName) {
            var param = IAstFactory.eINSTANCE.createFuncParam();
            funcExpr.getParameters().push(param);
            param.setName(paramName);
            return param;
        };
        // unused?
        //AbstractDdlParser.prototype.viewparser_createStdFunc1 = function(funcName) {
        //    var expr = IAstFactory.eINSTANCE.createStdFuncExpression();
        //    expr.setFuncNameToken(funcName);
        //    return expr;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_createStdFunc4 = function(funcName,distinct,all,ae) {
        //    var expr = IAstFactory.eINSTANCE.createStdFuncExpression();
        //    expr.setFuncNameToken(funcName);
        //    expr.setDistinctToken(distinct);
        //    expr.setAllToken(all);
        //    expr.setParameter(ae);
        //    return expr;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_createStdFuncWithExpressionAndAsteriskToken = function(funcName,distinct,expr,asteriskToken) {
        //    var funcExpr = IAstFactory.eINSTANCE.createStdFuncExpression();
        //    funcExpr.setFuncNameToken(funcName);
        //    funcExpr.setDistinctToken(distinct);
        //    if (expr == null) {
        //        var pathExpression = IAstFactory.eINSTANCE.createPathExpression();
        //        var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
        //        pathEntry.setNameToken(asteriskToken);
        //        pathExpression.getEntries().push(pathEntry);
        //        expr = pathExpression;
        //        this.visitPathExpression(pathExpression);
        //    }
        //    funcExpr.setParameter(expr);
        //    return funcExpr;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_names = function() {
        //    return IAstFactory.eINSTANCE.createNames();
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_addname = function(names,name) {
        //    names.add(name);
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_setnames = function(viewDef,names) {
        //    viewDef.setNames(names);
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_setExtend = function(entry,lextend) {
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_startExtendViewWithoutNames = function() {
        //    this.lastFoundDataSources = [];
        //    var extend = IAstFactory.eINSTANCE.createViewExtend();
        //    this.allEntityDeclarations.push(extend);
        //    return extend;
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_setExtendViewNames = function(extend,extendedViewName,extendName) {
        //    extend.setNameToken(extendName);
        //    extend.setExtendedViewNameToken(extendedViewName);
        //};
        // unused?
        //AbstractDdlParser.prototype.viewparser_startExtendView = function(extendedViewName,extendName) {
        //    this.lastFoundDataSources = [];
        //    var extend = IAstFactory.eINSTANCE.createViewExtend();
        //    extend.setNameToken(extendName);
        //    extend.setExtendedViewNameToken(extendedViewName);
        //    this.allEntityDeclarations.push(extend);
        //    return extend;
        //};
        AbstractDdlParser.prototype.viewparser_setDDLStmt = function(stmt) {
            if (stmt != null) {
                this.compilationUnit.getStatements().push(stmt);
                stmt.setCompilationUnit(this.compilationUnit);
            }
        };
        AbstractDdlParser.prototype.viewparser_setStartTokenIndex = function(range,startTokenIndex) {
            if (range != null) {
                range.setStartTokenIndex(startTokenIndex);
            }
        };
        AbstractDdlParser.prototype.viewparser_setEndTokenIndex = function(range,endTokenIndex) {
            if (range != null) {
                range.setEndTokenIndex(endTokenIndex);
            }
        };
        AbstractDdlParser.prototype.viewparser_setStartEndTokenIndex = function(range,startTokenIndex,endTokenIndex) {
            if (range != null) {
                range.setStartTokenIndex(startTokenIndex);
                range.setEndTokenIndex(endTokenIndex);
            }
        };
        // unused?
        //AbstractDdlParser.prototype.createCaseExpression = function(caseExpression) {
        //    return this.createSimpleCaseExpression(caseExpression);
        //};
        AbstractDdlParser.prototype.createSimpleCaseExpression = function(caseExpression) {
            var caseEx = IAstFactory.eINSTANCE.createSimpleCaseExpression();
            if (caseExpression != null) {
                caseEx.setCaseExpression(caseExpression);
            }
            return caseEx;
        };
        AbstractDdlParser.prototype.createSearchedCaseExpression = function() {
            var caseEx = IAstFactory.eINSTANCE.createSearchedCaseExpression();
            return caseEx;
        };
        // unused?
        //AbstractDdlParser.prototype.addNewCaseWhenExpression = function(caseExpression,whenExpression,thenExpression) {
        //    this.addAndReturnNewCaseWhenExpression(caseExpression,whenExpression,thenExpression);
        //};
        AbstractDdlParser.prototype.addAndReturnNewCaseWhenExpression = function(caseExpression,whenExpression,thenExpression) {
            if (caseExpression instanceof CaseExpressionImpl) {
                var caseEx = caseExpression;
                var when = IAstFactory.eINSTANCE.createCaseWhenExpression();
                if (whenExpression != null) {
                    when.setWhenExpression(whenExpression);
                    when.setStartTokenIndex(whenExpression.getStartTokenIndex());
                }
                if (thenExpression != null) {
                    when.setThenExpression(thenExpression);
                }
                when.setEndTokenIndex(this.getLastMatchedTokenIndex());
                caseEx.getWhenExpressions().push(when);
                return when;
            }else{
                return null;
            }
        };
        AbstractDdlParser.prototype.addElseExpression = function(caseExpression,elseExpression) {
            if (caseExpression instanceof CaseExpressionImpl) {
                var caseEx = caseExpression;
                if (elseExpression != null) {
                    caseEx.setElseExpression(elseExpression);
                }
            }
        };
        AbstractDdlParser.prototype.createCastExpression = function(expr,typeNamespace,typeName,length,decimals) {
            var castEx = IAstFactory.eINSTANCE.createCastExpression();
            if (expr != null) {
                castEx.setValue(expr);
            }
            if (typeNamespace != null) {
                castEx.setTypeNamespace(typeNamespace);
            }
            if (typeName != null) {
                castEx.setTypeName(typeName);
            }
            if (length != null) {
                castEx.setLength(length);
            }
            if (decimals != null) {
                castEx.setDecimals(decimals);
            }
            return castEx;
        };
        AbstractDdlParser.prototype.createPreAnnotation = function() {
            var preAnnotation = IAstFactory.eINSTANCE.createPreAnnotation();
            // add to global annotations list (see jsdoc)
            this.compilationUnit.getAnnotations().push(preAnnotation);
            return preAnnotation;
        };
        AbstractDdlParser.prototype.createPreAnnotationList = function() {
            return [];
        };
        AbstractDdlParser.prototype.createPostAnnotation = function() {
            var postAnnotation = IAstFactory.eINSTANCE.createPostAnnotation();
            // add to global annotations list (see jsdoc)
            this.compilationUnit.getAnnotations().push(postAnnotation);
            return postAnnotation;
        };
        // unused?
        //AbstractDdlParser.prototype.createPostAnnotationList = function() {
        //    return [];
        //};
        AbstractDdlParser.prototype.createUsingDirective = function(path,alias) {
            var usingDirective = IAstFactory.eINSTANCE.createUsingDirective();
            if (path != null) {
                usingDirective.setNamePath(path);
            }
            if (alias != null) {
                usingDirective.setAlias(alias);
            }
            return usingDirective;
        };
        AbstractDdlParser.prototype.collectPreAnnotation = function(annotations,annotation) {
            if (annotations == null) {
                return;
            }
            annotations.push(annotation);
        };
        // unused?
        //AbstractDdlParser.prototype.collectPostAnnotation = function(annotations,annotation) {
        //    if (annotations == null) {
        //        return;
        //    }
        //    annotations.push(annotation);
        //};
        AbstractDdlParser.prototype.addAnnotations = function(statement,annotations) {

            if (annotations == null || statement == null) {
                return;
            }
            var list = statement.getAnnotationList();
            list = list.concat(annotations);
            statement.annotationList = list;

        };
        AbstractDdlParser.prototype.addAnnotationPath = function(nameValuePair,pathToken) {
            nameValuePair.getNameTokenPath().push(pathToken);
        };
        AbstractDdlParser.prototype.addAnnotationValue = function(container,valueToken) {
            if (container == null) {
                return null;
            }
            var annotationValue = IAstFactory.eINSTANCE.createAnnotationValue();
            annotationValue.setValueToken(valueToken);
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(annotationValue);
                return annotationValue;
            }else if (container instanceof AnnotationArrayValueImpl) {
                var array = container;
                array.getValues().push(annotationValue);
                return annotationValue;
            }else{
                throw new Error("Type " + container.getClass() + " of container is unknowns");
            }
        };
        AbstractDdlParser.prototype.addAnnotationPathValue = function(container,path) {
            if (container == null) {
                return null;
            }
            var annotationValue = IAstFactory.eINSTANCE.createAnnotationPathValue();
            annotationValue.setNamePath(path);
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(annotationValue);
                return annotationValue;
            }else if (container instanceof AnnotationArrayValueImpl) {
                var array = container;
                array.getValues().push(annotationValue);
                return annotationValue;
            }else{
                throw new Error("Type " + container.getClass() + " of container is unknowns");
            }
        };
        AbstractDdlParser.prototype.createAnnotationArrayValue = function() {
            return IAstFactory.eINSTANCE.createAnnotationArrayValue();
        };
        AbstractDdlParser.prototype.addAnnotationArrayValue = function(container,array) {
            if (container == null) {
                return;
            }
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(array);
            }else if (container instanceof AnnotationArrayValueImpl) {
                var outerArray = container;
                outerArray.getValues().push(array);
            }else{
                throw new Error("Typ of container is unknown");
            }
        };
        AbstractDdlParser.prototype.createAnnotationRecordValue = function() {
            return IAstFactory.eINSTANCE.createAnnotationRecordValue();
        };
        AbstractDdlParser.prototype.addAnnotationRecordValue = function(container,record) {
            if (container == null) {
                return;
            }
            if (container instanceof AnnotationNameValuePairImpl) {
                var nameValuePair = container;
                nameValuePair.setValue(record);
            }else if (container instanceof AnnotationArrayValueImpl) {
                var array = container;
                array.getValues().push(record);
            }else{
                throw new Error("Typ of container is unknown");
            }
        };
        AbstractDdlParser.prototype.createAnnotationNameValuePair = function() {
            return IAstFactory.eINSTANCE.createAnnotationNameValuePair();
        };
        AbstractDdlParser.prototype.addAnnotationNameValuePair = function(recordValue,nameValuePair) {
            recordValue.getComponents().push(nameValuePair);
        };
        AbstractDdlParser.prototype.createAssociation = function() {
            var association = IAstFactory.eINSTANCE.createAssociationDeclaration();
            this.allAssociationDeclarations.push(association);
            return association;
        };
        AbstractDdlParser.prototype.addAssociation = function(select,assoc) {
            this.addAssociationToContainer(select,assoc);
        };
        AbstractDdlParser.prototype.addAssociationToContainer = function(container,assoc) {
            container.getAssociations().push(assoc);
        };
        AbstractDdlParser.prototype.addKey = function(assocation,keys,alias) {
            var foreignKey = IAstFactory.eINSTANCE.createForeignKey();
            foreignKey.setKeyPath(keys);
            foreignKey.setAliasToken(alias);
            assocation.getKeys().push(foreignKey);
            return foreignKey;
        };
        AbstractDdlParser.prototype.setCardinality = function(assocation,srcMax,srcMaxStar,min,max,maxStar) {
            if (srcMax != null) {
                assocation.setSourceMaxCardinalityToken(srcMax);
            }else if (srcMaxStar != null) {
                assocation.setSourceMaxCardinalityToken(srcMaxStar);
            }
            if (min != null && max != null) {
                assocation.setMinToken(min);
                assocation.setMaxToken(max);
                return;
            }
            if (min != null && maxStar != null) {
                assocation.setMinToken(min);
                assocation.setMaxToken(maxStar);
                return;
            }
            if (max != null) {
                assocation.setMinToken(max);
                assocation.setMaxToken(max);
                return;
            }
            if (maxStar != null) {
                assocation.setMinToken(maxStar);
                assocation.setMaxToken(maxStar);
                return;
            }
        };
        AbstractDdlParser.prototype.createPathEntry = function(name) {
            var pathEntry = IAstFactory.eINSTANCE.createPathEntry();
            pathEntry.setNameToken(name);
            return pathEntry;
        };
        AbstractDdlParser.prototype.setFilter = function(entry,filter) {
            if (entry != null && filter != null) {
                entry.setFilter(filter);
            }
        };
        AbstractDdlParser.prototype.setCardinalityRestriction = function(entry,number,colon,startIndex,endIndex) {
            if (entry != null) {
                var restriction = IAstFactory.eINSTANCE.createCardinalityRestriction();
                restriction.setValue(number);
                restriction.setColon(colon);
                restriction.setStartTokenIndex(startIndex);
                restriction.setEndTokenIndex(endIndex);
                entry.setCardinalityRestriction(restriction);
            }
        };
        AbstractDdlParser.prototype.createPathExpression = function() {
            var pathExpression = IAstFactory.eINSTANCE.createPathExpression();
            return pathExpression;
        };
        AbstractDdlParser.prototype.createExpressionsContainerExpression = function() {
            var expressionContainer = IAstFactory.eINSTANCE.createExpressionsContainerExpression();
            return expressionContainer;
        };
        AbstractDdlParser.prototype.addExpression = function(container,expr) {
            if (container != null && expr != null) {
                container.getExpressions().push(expr);
            }
        };
        AbstractDdlParser.prototype.createArithmeticExpression = function(left,right,operator) {
            var result = IAstFactory.eINSTANCE.createArithmeticExpression();
            if (left != null) {
                result.setLeft(left);
            }
            if (right != null) {
                result.setRight(right);
            }
            if (operator != null) {
                result.setOperator(operator);
            }
            return result;
        };
        AbstractDdlParser.prototype.createPathDeclaration = function() {
            return IAstFactory.eINSTANCE.createPathDeclaration();
        };
        AbstractDdlParser.prototype.createExpressionContainer = function(expr) {
            var container = IAstFactory.eINSTANCE.createExpressionContainer();
            container.setExpression(expr);
            return container;
        };
        AbstractDdlParser.prototype.visitPathExpression = function(path) {

            if (this.visitor != null && this.visitor.visitPathExpression) {
                this.visitor.visitPathExpression(path);
            }

        };
        AbstractDdlParser.prototype.addEntry = function(path,entry) {
            path.getEntries().push(entry);
        };
        AbstractDdlParser.prototype.markLastNamespacePathEntry = function(path) {
            var entries = path.getEntries();
            if (entries != null && entries.length > 0) {
                path.setLastNamespaceComponentIndex(entries.length - 1);
            }
        };
        AbstractDdlParser.prototype.setSupportedAnnotations = function(paramSupportedAnnotations) {
            this.supportedAnnotations = paramSupportedAnnotations;
        };
        AbstractDdlParser.prototype.getCurrentStackframe = function() {
            var path = this.getCurrentPath();
            if (path != null) {
                var sf = path.getStackframe();
                return sf;
            }
            return null;
        };
        AbstractDdlParser.prototype.getPreviousTokenIgnoringNLAndComment0 = function() {
            return this.previousTokIgnoringNL();
        };
        AbstractDdlParser.prototype.getPreviousTokenIgnoringNLAndComment1 = function(tokenIndex) {
            var tokens = this.m_scanner.getInput();
            return TokenUtil.getPreviousTokenIgnoringNLAndComment(tokens,tokenIndex);
        };
        AbstractDdlParser.prototype.getNextTokenIgnoringNLAndComment = function(tokenIndex) {
            var tokens = this.m_scanner.getInput();
            return TokenUtil.getNextTokenIgnoringNLAndComment(tokens,tokenIndex);
        };
        AbstractDdlParser.prototype.init = function() {
        };
        AbstractDdlParser.prototype.getCompletionMode = function() {
            return CompletionModes.parse(this.m_completion_mode);
        };
        // unused?
        //AbstractDdlParser.prototype.createEntityWithToken = function(id) {
        //    var entity = IAstFactory.eINSTANCE.createEntityDeclaration();
        //    entity.setNameToken(id);
        //    this.allEntityDeclarations.push(entity);
        //    return entity;
        //};
        AbstractDdlParser.prototype.createConst = function(path) {
            var constDecl = IAstFactory.eINSTANCE.createConstDeclaration();
            constDecl.setNamePath(path);
            return constDecl;
        };
        AbstractDdlParser.prototype.viewparser_setConstValue = function(constDecl,value) {
            if (constDecl != null && value != null) {
                constDecl.setValue(value);
            }
        };
        AbstractDdlParser.prototype.createEntity = function(path) {
            var entity = IAstFactory.eINSTANCE.createEntityDeclaration();
            entity.setNamePath(path);
            this.allEntityDeclarations.push(entity);
            return entity;
        };
        AbstractDdlParser.prototype.viewparser_setElementDefault = function(elementDecl,defaultExpr) {
            if (elementDecl != null) {
                elementDecl.setDefault(defaultExpr);
            }
        };
        AbstractDdlParser.prototype.viewparser_setElementDefaultToken = function(elementDecl,token) {
            var expression = IAstFactory.eINSTANCE.createLiteralExpression();
            expression.setTokenToken(token);
            if (elementDecl != null) {
                elementDecl.setDefault(expression);
            }
        };
        AbstractDdlParser.prototype.createAnnotationDeclaration = function(name) {
            var declaraion = IAstFactory.eINSTANCE.createAnnotationDeclaration();
            declaraion.setCompilationUnit(this.compilationUnit);
            declaraion.setNameToken(name);
            return declaraion;
        };
        AbstractDdlParser.prototype.setLength = function(attribute,length) {
            if (attribute instanceof AttributeDeclarationImpl) {
                (attribute).setLengthToken(length);
            }
        };
        AbstractDdlParser.prototype.setDecimals = function(attribute,decimals) {
            if (attribute instanceof AttributeDeclarationImpl) {
                (attribute).setDecimalsToken(decimals);
            }
        };
        AbstractDdlParser.prototype.setType = function(element,typeId) {
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(typeId);
            var path = IAstFactory.eINSTANCE.createPathExpression();
            path.getEntries().push(entry);
            element.setTypeIdPath(path);
        };
        // unused?
        //AbstractDdlParser.prototype.createAndSetAnoymousTypeDeclaration = function(element) {
        //    return this.createAndSetAnonymousTypeDeclaration(element);
        //};
        AbstractDdlParser.prototype.createAndSetAnonymousTypeDeclaration = function(element) {
            var type = IAstFactory.eINSTANCE.createAnonymousTypeDeclaration();
            element.setAnonymousType(type);
            return type;
        };
        AbstractDdlParser.prototype.createAndSetAttributeDeclaration = function(type) {
            var attributeDeclaration = IAstFactory.eINSTANCE.createAttributeDeclaration();
            type.getElements().push(attributeDeclaration);
            return attributeDeclaration;
        };
        AbstractDdlParser.prototype.createAndSetEnumerationDeclaration = function(element) {
            var enumeration = IAstFactory.eINSTANCE.createEnumerationDeclaration();
            element.setEnumerationDeclaration(enumeration);
            return enumeration;
        };
        AbstractDdlParser.prototype.createAndSetEnumerationValue = function(enumeration) {
            var value = IAstFactory.eINSTANCE.createEnumerationValue();
            enumeration.getValues().push(value);
            return value;
        };
        AbstractDdlParser.prototype.onMatchCollectCompletionSuggestionsOrAbort = function(current_token,matched_terminal,current,context) {
            return TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort.call(this,current_token,matched_terminal,current,context);
        };
        AbstractDdlParser.prototype.setPadFileResolverUsedToGetByteCode = function(padFileResolverUsedToGetByteCode) {
            this.padFileResolverUsedToGetByteCode = padFileResolverUsedToGetByteCode;
        };
        AbstractDdlParser.prototype.setDdlParser = function(ddlRndParser) {
            this.ddlParser = ddlRndParser;
        };
        AbstractDdlParser.prototype.getPadFileResolverUsedToGetByteCode = function() {
            return this.padFileResolverUsedToGetByteCode;
        };
        AbstractDdlParser.prototype.isAstNeededForCoCo = function() {
            return false;
        };
        AbstractDdlParser.prototype.setCompilationUnitForCoCo = function(cu) {
            this.cocoCompilationUnit = cu;
        };
        AbstractDdlParser.prototype.setTriggerPosForCoCo = function(cocoTriggerPosParam) {
            this.cocoTriggerPos = cocoTriggerPosParam;
        };
        AbstractDdlParser.prototype.getTriggerPosForCoCo = function() {
            return this.cocoTriggerPos;
        };
        AbstractDdlParser.prototype.isRulenameInHierarchy3 = function(stackframe,ruleName,stopAtFirstRuleName) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (stopAtFirstRuleName === rn) {
                    return false;
                }
                if (ruleName === rn) {
                    return true;
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.getAnnotationPath = function(context,stopAtContextTokenIndex,includeAt) {
            var sf = context.getStackframe();
            var currentPath = new StringBuffer();
            var maxIdx = -1;
            if (stopAtContextTokenIndex) {
                maxIdx = context.getTokenIndex();
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (sf == null) {
                    break;
                }
                var ri = sf.getRuleInfo();
                if (ri == null) {
                    break;
                }
                var rn = ri.getRuleName();
                if (AbstractDdlParser.RECORD_COMPONENT_RULE === rn) {
                    var idx = sf.getFirstTokenIndex();
                    if (idx < 0) {
                        throw new Error();
                    }else{
                        var s = this.getNextAnnotationPath2(idx, maxIdx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0,".");
                        }
                        currentPath.insert(0,s);
                    }
                }else if (AbstractDdlParser.PRE_ANNOTATION_RULE === rn) {
                    var idx = sf.getFirstTokenIndex();
                    if (idx < 0) {
                        throw new Error();
                    }
                    var str = this.getNextAnnotationPath2(idx, maxIdx);
                    if (currentPath.length() > 0) {
                        currentPath.insert(0,".");
                    }
                    if (includeAt == false && rnd.Utils.stringStartsWith(str, "@")) {
                        str = str.substring(1);
                    }
                    currentPath.insert(0,str);
                    break;
                }else if (AbstractDdlParser.POST_ANNOTATION_RULE === rn) {
                    var idx = sf.getFirstTokenIndex();
                    if (idx < 0) {
                        throw new Error();
                    }
                    var str = this.getNextAnnotationPath2(idx, maxIdx);
                    if (currentPath.length() > 0) {
                        currentPath.insert(0,".");
                    }
                    if (includeAt == false) {
                        if (rnd.Utils.stringStartsWith(str, "@<")) {
                            str = str.substring(2);
                        }else if (rnd.Utils.stringStartsWith(str, "@")) {
                            str = str.substring(1);
                        }
                    }
                    currentPath.insert(0,str);
                    break;
                }
                sf = sf.getParent();
            }
            return currentPath.toString();
        };
        AbstractDdlParser.prototype.getAnnotationDefinition2 = function(context,stopAtContextTokenIndex) {
            return this.getAnnotationPath(context,stopAtContextTokenIndex,false);
        };
        AbstractDdlParser.prototype.getAnnotationDefinition1 = function(context) {
            return this.getAnnotationDefinition2(context,false);
        };
        AbstractDdlParser.prototype.annotValueProposalMatchesAnyKw = function(token,currToken) {
            if (currToken == null || currToken.m_lexem.length == 0) {
                return true;
            }
            var lowCurrTokenLexem = currToken.m_lexem.toLowerCase();
            if (lowCurrTokenLexem.charAt(0) == '\'') {
                return false;
            }
            if (lowCurrTokenLexem.charAt(0) == '\'') {
                lowCurrTokenLexem = lowCurrTokenLexem.substring(1);
            }
            token = token.toLowerCase();
            if (token.charAt(0) == '\'') {
                token = token.substring(1);
            }
            if (rnd.Utils.stringStartsWith(token, lowCurrTokenLexem)) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.addHashIfNecessary = function(token) {
            var newToken = token;
            if (rnd.Utils.stringContains(token, "#") == false) {
                newToken = "#" + token;
            }
            return newToken;
        };
        AbstractDdlParser.prototype.getAnnotationDefinitionCompletion = function(annotation,elem) {
            var value = AnnotationUtil.getAnnotationDefaultValue2(elem, false);
            var result = "@" + annotation + ": " + value;
            return result;
        };
        AbstractDdlParser.prototype.getCurrentTokenLexem = function(context) {
            var sf = context.getStackframe();
            var first = sf.getFirstTokenIndex();
            return this.getTokenAt1(first).m_lexem;
        };
        AbstractDdlParser.prototype.getCompletionAnnotationInsertionString = function(annot,context) {
            try {
                var sf = context.getStackframe();
                var first = sf.getFirstTokenIndex();
                var currentName = this.getTokenAt1(first).m_lexem;
                var currentPath = new StringBuffer();
                var lastFirstTokenIndex = -1;
                /*eslint-disable no-constant-condition*/
                while (true) {
                    var rn = sf.getRuleInfo().getRuleName();
                    if (AbstractDdlParser.RECORD_COMPONENT_RULE === rn) {
                        var idx = sf.getFirstTokenIndex();
                        if (idx < 0) {
                            idx = this.getPreviousRecordComponentTokenIdx(lastFirstTokenIndex);
                        }
                        var s = this.getNextAnnotationPath1(idx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0,".");
                        }
                        currentPath.insert(0,s);
                    }
                    if (AbstractDdlParser.PRE_ANNOTATION_RULE === rn) {
                        var idx = sf.getFirstTokenIndex();
                        if (idx < 0) {
                            idx = this.findAnnotationStartTokenIndex(lastFirstTokenIndex);
                        }
                        var s = this.getNextAnnotationPath1(idx);
                        if (currentPath.length() > 0) {
                            currentPath.insert(0,".");
                        }
                        currentPath.insert(0,s);
                        break;
                    }
                    if (sf.getFirstTokenIndex() >= 0) {
                        lastFirstTokenIndex = sf.getFirstTokenIndex();
                    }
                    sf = sf.getParent();
                }
                var annotLc = annot.toLowerCase();
                if (rnd.Utils.stringStartsWith(annotLc, currentPath.toString().toLowerCase())) {
                    if (currentName.length == 0) {
                        var ann = annot.substring(currentPath.length());
                        if (ann.charAt(0) == '.' || ann.charAt(0) == ':') {
                            ann = ann.substring(1);
                            return ann;
                        }
                        if (rnd.Utils.stringContains(annot.substring(0,currentPath.length()), ".") == false) {
                            if (rnd.Utils.stringStartsWith(ann, "@") == false && currentPath.toString() === "@" == false) {
                                ann = "@" + ann;
                            }
                        }
                        return ann;
                    }else{
                        var ind = currentPath.toString().lastIndexOf(".");
                        if (ind > 0) {
                            var anno = annot.substring(ind + 1);
                            return anno;
                        }
                        ind = annotLc.indexOf(currentName.toLowerCase());
                        if (ind < 0) {
                            return annot;
                        }
                        var ann = annot.substring(ind);
                        if (rnd.Utils.stringContains(annot.substring(0,ind), ".") == false && currentPath.toString().charAt(0) != '@') {
                            ann = "@" + ann;
                        }
                        return ann;
                    }
                }
            }
            catch(e) { //eslint-disable-line no-empty
            }
            return null;
        };
        AbstractDdlParser.prototype.getPreviousRecordComponentTokenIdx = function(idx) {
            var token = this.getTokenAt1(idx);
            if (token != null && "{" === token.m_lexem) {
                idx--;
                token = this.getPreviousTokenIgnoringNLAndComment1(idx);
                if (token != null && ":" === token.m_lexem) {
                    idx--;
                    token = this.getPreviousTokenIgnoringNLAndComment1(idx);
                    var resultIndex = this.m_scanner.getInput().indexOf(token);
                    return resultIndex;
                }
            }
            return idx;
        };
        AbstractDdlParser.prototype.getAnnotationValueCompletions = function(elementDeclaration,current_token) {
            var resultValues = [];
            if (elementDeclaration == null) {
                return resultValues;
            }
            var type = elementDeclaration.getTypeIdPath().getPathString(false);
            var defaultValue = elementDeclaration.getDefault();
            if (rnd.Utils.stringEqualsIgnoreCase(AbstractDdlParser.EL_DECL_TYPE_BOOLEAN, type)) {
                if (current_token.m_lexem.length == 0) {
                    return [AbstractDdlParser.TRUE_STRING,AbstractDdlParser.FALSE_STRING];
                }else{
                    if (rnd.Utils.stringStartsWith(AbstractDdlParser.TRUE_STRING.toLowerCase(), current_token.m_lexem.toLowerCase())) {
                        return [AbstractDdlParser.TRUE_STRING];
                    }
                    if (rnd.Utils.stringStartsWith(AbstractDdlParser.FALSE_STRING.toLowerCase(), current_token.m_lexem.toLowerCase())) {
                        return [AbstractDdlParser.FALSE_STRING];
                    }
                }
            }else if (rnd.Utils.stringStartsWith(AbstractDdlParser.EL_DECL_TYPE_STRING, type.toLowerCase()) || rnd.Utils.stringEqualsIgnoreCase(AbstractDdlParser.EL_DECL_TYPE_ELEMENT_REF, type)) {
                var enumDeclaration = elementDeclaration.getEnumerationDeclaration();
                if (enumDeclaration != null) {
                    var values = enumDeclaration.getValues();
                    for (var elementCount = 0;elementCount < values.length;elementCount++) {
                        var element = values[elementCount];
                        var enumValue = element;
                        var symbol = enumValue.getSymbol();
                        var token = null;
                        if (symbol != null) {
                            token = symbol.m_lexem;
                        }else{
                            var valueExpr = enumValue.getLiteral();
                            token = valueExpr.getToken();
                        }
                        token = this.addHashIfNecessary(token);
                        if (this.annotValueProposalMatchesAnyKw(token,current_token)) {
                            resultValues.push(token);
                        }
                    }
                }else if (defaultValue != null) {
                    var value = AnnotationUtil.getAnnotationDefaultValue1(elementDeclaration);
                    if (value != null) {
                        value = this.addHashIfNecessary(value);
                        resultValues.push(value);
                    }
                }
            }else if (rnd.Utils.stringEqualsIgnoreCase(AbstractDdlParser.EL_DECL_TYPE_INTEGER, type) || rnd.Utils.stringEqualsIgnoreCase(AbstractDdlParser.EL_DECL_TYPE_NUMBER, type)) {
                var enumDeclaration = elementDeclaration.getEnumerationDeclaration();
                if (enumDeclaration != null) {
                    var values = enumDeclaration.getValues();
                    for (var elementCount = 0;elementCount < values.length;elementCount++) {
                        var element = values[elementCount];
                        var iEnumValue = element;
                        var literal = iEnumValue.getLiteral();
                        var token = literal.getToken();
                        resultValues.push(token);
                    }
                }else if (defaultValue != null) {
                    var value = AnnotationUtil.getAnnotationDefaultValue1(elementDeclaration);
                    if (value != null) {
                        resultValues.push(value);
                    }
                }
            }
            return resultValues;
        };
        AbstractDdlParser.prototype.findAnnotationStartTokenIndex = function(idx) {
            if (idx < 0) {
                return idx;
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                var t = this.getTokenAt1(idx);
                if (t == null || "@" === t.m_lexem) {
                    return idx;
                }
                idx--;
            }
        };
        AbstractDdlParser.prototype.getNextAnnotationPath2 = function(idx,maxIdx) {
            var t = this.getTokenAt1(idx);
            var result = new StringBuffer(t.m_lexem);
            if (t.m_lexem === "") {
                return result.toString();
            }
            try {
                /*eslint-disable no-constant-condition*/
                while (true) {
                    idx++;
                    if (maxIdx > 0 && idx > maxIdx) {
                        break;
                    }
                    t = this.getTokenAt1(idx);
                    if (":" === t.m_lexem || "{" === t.m_lexem || "" === t.m_lexem || "}" === t.m_lexem) {
                        break;
                    }
                    if (Category.CAT_COMMENT === t.m_category == false) {
                        result.append(t.m_lexem);
                    }
                    if (t.m_num == 0) {
                        break;
                    }
                }
            }
            catch(e) { //eslint-disable-line no-empty
            }
            return result.toString();
        };
        AbstractDdlParser.prototype.getNextAnnotationPath1 = function(idx) {
            var token = this.getTokenAt1(idx);
            var result = new StringBuffer(token.m_lexem);
            if (token.m_lexem === "") {
                return result.toString();
            }
            try {
                /*eslint-disable no-constant-condition*/
                while (true) {
                    idx++;
                    token = this.getTokenAt1(idx);
                    if (":" === token.m_lexem || "{" === token.m_lexem || "" === token.m_lexem || "}" === token.m_lexem) {
                        break;
                    }
                    result.append(token.m_lexem);
                    if (token.m_num == 0) {
                        break;
                    }
                }
            }
            catch(e) { //eslint-disable-line no-empty
            }
            return result.toString();
        };
        AbstractDdlParser.prototype.isCoCoAnnotationValue = function(context) {
            var stackframe = context.getStackframe();
            if (this.isRulenameInHierarchy3(stackframe,"AnnotationValue","RecordComponent")) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.isCoCoAnnotation = function(context) {
            var stackframe = context.getStackframe();
            var tokenAt = this.getTokenAt1(context.getTokenIndex());
            if (tokenAt != null && "@" === tokenAt.m_lexem) {
                return true;
            }
            var ruleNames = [ AbstractDdlParser.PRE_ANNOTATION_RULE, AbstractDdlParser.POST_ANNOTATION_RULE ];
            if (this.isOneOfTheRuleNamesListEntryInHierarchy(stackframe,ruleNames)) {
                return true;
            }
            return false;
        };
        AbstractDdlParser.prototype.isRulenameInHierarchy2 = function(stackframe,ruleName) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var rn = stackframe.getRuleInfo().getRuleName();
                if (ruleName === rn) {
                    return true;
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.areAllRuleNamesInHierarchy = function(stackframe,ruleNames) {
            var ruleNamesCopy = [];
            for (var ruleNameCount = 0;ruleNameCount < ruleNames.length;ruleNameCount++) {
                var ruleName = ruleNames[ruleNameCount];
                ruleNamesCopy.push(ruleName);
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                var ruleInfo = stackframe.getRuleInfo();
                if (ruleInfo == null) {
                    return false;
                }
                var rn = ruleInfo.getRuleName();
                if (rnd.Utils.arrayContains(ruleNamesCopy, rn)) {
                    rnd.Utils.arrayRemove(ruleNamesCopy, rn);
                    if (ruleNamesCopy.length == 0) {
                        return true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    return false;
                }
            }
        };
        AbstractDdlParser.prototype.areRuleNamesInHierarchyWithIncludingAndExcludingList = function(stackframe,ruleNamesIncluding,ruleNamesExcluding) {
            var foundRuleNamesIncluding = false;
            var notFoundRuleNamesExcluding = true;
            var ruleNamesIncludingCp = [];
            for (var ruleNameCount = 0;ruleNameCount < ruleNamesIncluding.length;ruleNameCount++) {
                var ruleName = ruleNamesIncluding[ruleNameCount];
                ruleNamesIncludingCp.push(ruleName);
            }
            /*eslint-disable no-constant-condition*/
            while (true) {
                var ruleInfo = stackframe.getRuleInfo();
                if (ruleInfo == null) {
                    break;
                }
                var rn = ruleInfo.getRuleName();
                if (rnd.Utils.arrayContains(ruleNamesExcluding, rn)) {
                    return false;
                }
                if (rnd.Utils.arrayContains(ruleNamesIncludingCp, rn)) {
                    rnd.Utils.arrayRemove(ruleNamesIncludingCp, rn);
                    if (ruleNamesIncludingCp.length == 0) {
                        foundRuleNamesIncluding = true;
                    }
                }
                stackframe = stackframe.getParent();
                if (stackframe == null) {
                    break;
                }
            }
            return foundRuleNamesIncluding && notFoundRuleNamesExcluding;
        };
        AbstractDdlParser.prototype.setArrayCardinality = function(element,start,min,max,end) {
            if (element == null) {
                return;
            }
            element.setCardinalityStartToken(start);
            element.setCardinalityMinToken(min);
            element.setCardinalityMaxToken(max);
            element.setCardinalityEndToken(end);
        };
        AbstractDdlParser.prototype.getVisibleAnnotations = function(compilationUnit,current_token) {
            var result = [];
            if (compilationUnit == null) {
                return result;
            }
            var isRootStmt = false;
            var expectedCurrentScope = this.getCurrentAnnotationScopeViaStackframe();
            if (expectedCurrentScope == null && this.cocoCompilationUnit != null) {
                var node = this.findNextAstNodeForCurrentOffset(this.cocoCompilationUnit.getStatements(), current_token.m_offset,
                    null);
                if (node != null) {
                    isRootStmt = this.isRootStmt(node);
                    expectedCurrentScope = this.getCoCoScope(node);
                    if (expectedCurrentScope == null || expectedCurrentScope.length == 0) {
                        return result;
                    }
                }
            }
            if (expectedCurrentScope != null) {
                var expectedScope = [];
                expectedScope.push(expectedCurrentScope);
                this.checkBackend(expectedScope);
                if (expectedScope.length == 1) {
                    expectedCurrentScope = expectedScope[0];
                }
            }
            var stmts = compilationUnit.getStatements();
            for (var stmtCount = 0;stmtCount < stmts.length;stmtCount++) {
                var stmt = stmts[stmtCount];
                if (this.isAnnotated(stmt)) {
                    var annotName = stmt.getName();
                    var annotationList = (stmt).getAnnotationList();
                    if (this.isAnnotationRelevant(annotationList,annotName,expectedCurrentScope,isRootStmt)) {
                        result.push(stmt);
                    }
                }
            }
            return result;
        };
        AbstractDdlParser.prototype.getCurrentAnnotationScopeViaStackframe = function() {
            return null;
        };
        AbstractDdlParser.prototype.checkBackend = function(expectedScope) {
        };
        AbstractDdlParser.prototype.isAnnotated = function(stmt) {

            if (stmt.getAnnotationList)
                return true;
            return false;

        };
        AbstractDdlParser.prototype.isAnnotationRelevant = function(annotationListOfAnnotation,annotName,scopeAtCurrentPosition,isRootStmt) {
            return false;
        };
        AbstractDdlParser.prototype.findNextAstNodeForCurrentOffset = function(statements,offset,object) {
            return null;
        };
        AbstractDdlParser.prototype.getCoCoScope = function(node) {
            return null;
        };
        AbstractDdlParser.prototype.isRootStmt = function(node) {
            if (node != null) {
                var cu = node.eContainer();
                if (cu instanceof CompilationUnitImpl) {
                    return true;
                }
            }
            return false;
        };
        AbstractDdlParser.prototype.containsScope = function(value,scope) {
            if (value instanceof AnnotationArrayValueImpl) {
                for (var vCount = 0;vCount < (value).getValues().length;vCount++) {
                    var v = (value).getValues()[vCount];
                    if (this.containsScope(v,scope)) {
                        return true;
                    }
                }
            }else if (value instanceof AnnotationValueImpl) {
                var vt = (value).getValueToken();
                if (vt != null) {
                    if (rnd.Utils.stringEqualsIgnoreCase(scope, vt.m_lexem)) {
                        return true;
                    }
                }
            }else{
                throw new Error();
            }
            return false;
        };
        AbstractDdlParser.prototype.getScopeAnnotation = function(annotationList) {
            return AnnotationUtil.getScopeAnnotation(annotationList);
        };
        // unused?
        //AbstractDdlParser.prototype.addViewParameter = function(viewDef,parameterName) {
        //    if (viewDef != null && parameterName != null) {
        //        var param = IAstFactory.eINSTANCE.createParameter();
        //        param.setNameToken(parameterName);
        //        viewDef.getParameters().push(param);
        //        return param;
        //    }
        //    return null;
        //};
        // unused?
        //AbstractDdlParser.prototype.addTableFunctionParameter = function(tableFunc,parameterName) {
        //    if (tableFunc != null && parameterName != null) {
        //        var param = IAstFactory.eINSTANCE.createParameter();
        //        param.setNameToken(parameterName);
        //        tableFunc.getImportingParameters().push(param);
        //        return param;
        //    }
        //    return null;
        //};
        // unused?
        //AbstractDdlParser.prototype.addReturnStructureParameter = function(list,parameterName) {
        //    if (list != null && parameterName != null) {
        //        var param = IAstFactory.eINSTANCE.createParameter();
        //        param.setNameToken(parameterName);
        //        list.getEntries().push(param);
        //        return param;
        //    }
        //    return null;
        //};
        // unused?
        //AbstractDdlParser.prototype.addParameterBindings = function(entry) {
        //    if (entry != null) {
        //        var paramBindings = IAstFactory.eINSTANCE.createParameterBindings();
        //        entry.setParameterBindings(paramBindings);
        //        return paramBindings;
        //    }
        //    return null;
        //};
        // unused?
        //AbstractDdlParser.prototype.addParameterBinding = function(bindings) {
        //    if (bindings != null) {
        //        var paramBinding = IAstFactory.eINSTANCE.createParameterBinding();
        //        bindings.getBindings().push(paramBinding);
        //        return paramBinding;
        //    }
        //    return null;
        //};
        AbstractDdlParser.prototype.createViewSelectSet = function(operator,all,distinct,left,right) {
            var selectSet = IAstFactory.eINSTANCE.createViewSelectSet();
            selectSet.setOperator(operator);
            selectSet.setAll(all);
            selectSet.setDistinct(distinct);
            selectSet.setLeft(left);
            selectSet.setRight(right);
            return selectSet;
        };
        AbstractDdlParser.prototype.createPathFromSingleToken = function(name) {
            var path = IAstFactory.eINSTANCE.createPathDeclaration();
            var entry = IAstFactory.eINSTANCE.createPathEntry();
            entry.setNameToken(name);
            path.getEntries().push(entry);
            return path;
        };
        // unused?
        //AbstractDdlParser.prototype.createDataSourceFromNameToken = function(name) {
        //    var entry = IAstFactory.eINSTANCE.createPathEntry();
        //    entry.setNameToken(name);
        //    var pe = IAstFactory.eINSTANCE.createPathExpression();
        //    pe.getEntries().push(entry);
        //    var ds = IAstFactory.eINSTANCE.createDataSource();
        //    ds.setNamePathExpression(pe);
        //    return ds;
        //};
        AbstractDdlParser.prototype.createAccessPolicy = function(path) {
            var accessPolicy = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
            accessPolicy.setNamePath(path);
            return accessPolicy;
        };
        // unused?
        //AbstractDdlParser.prototype.createAccessPolicyWithNameToken = function(name) {
        //    var path = this.createPathFromSingleToken(name);
        //    var accessPolicy = IAstFactory.eINSTANCE.createAccessPolicyDeclaration();
        //    accessPolicy.setNamePath(path);
        //    return accessPolicy;
        //};
        AbstractDdlParser.prototype.createAspect = function(path) {
            var aspect = IAstFactory.eINSTANCE.createAspectDeclaration();
            aspect.setNamePath(path);
            return aspect;
        };
        // unused?
        //AbstractDdlParser.prototype.createAspectWithNameToken = function(name) {
        //    var path = this.createPathFromSingleToken(name);
        //    var aspect = IAstFactory.eINSTANCE.createAspectDeclaration();
        //    aspect.setNamePath(path);
        //    return aspect;
        //};
        AbstractDdlParser.prototype.createRole = function(path) {
            var role = IAstFactory.eINSTANCE.createRoleDeclaration();
            role.setNamePath(path);
            return role;
        };
        // unused?
        //AbstractDdlParser.prototype.createRoleWithNameToken = function(name) {
        //    var path = this.createPathFromSingleToken(name);
        //    var role = IAstFactory.eINSTANCE.createRoleDeclaration();
        //    role.setNamePath(path);
        //    return role;
        //};
        AbstractDdlParser.prototype.createRule = function() {
            var rule = IAstFactory.eINSTANCE.createRuleDeclaration();
            return rule;
        };
        AbstractDdlParser.prototype.createPrefixRuleFromClause = function(commandToken,onToken) {
            var from = IAstFactory.eINSTANCE.createPrefixRuleFromClause();
            from.setCommandToken(commandToken);
            from.setOnToken(onToken);
            return from;
        };
        AbstractDdlParser.prototype.createPostfixRuleFromClause = function(commandToken) {
            var from = IAstFactory.eINSTANCE.createPostfixRuleFromClause();
            from.setCommandToken(commandToken);
            return from;
        };
        AbstractDdlParser.prototype.createIncludedRole = function(path) {
            var incl = IAstFactory.eINSTANCE.createIncludedRole();
            incl.setName(path);
            return incl;
        };
        AbstractDdlParser.prototype.visitParameterName = function(name) {

            if (this.visitor != null && this.visitor.visitParameterName) {
                this.visitor.visitParameterName(name);
            }

        };
        AbstractDdlParser.prototype.visitTypeUsage = function(namespace,name) {

            if (this.visitor != null && this.visitor.visitTypeUsage) {
                this.visitor.visitTypeUsage(namespace, name);
            }

        };
        AbstractDdlParser.prototype.visitIncompleteTypeUsage = function(namespace,name) {
            if (this.visitor != null) {
                this.visitor.visitIncompleteTypeUsage(namespace,name);
            }
        };
        AbstractDdlParser.prototype.calculateReplacementRegionForPredefinedNames = function(currentToken,predefinedNames) {
            if (currentToken == null) {
                return null;
            }
            var tokens = this.m_scanner.getInput();
            var currentTokenStartIndex = tokens.indexOf(currentToken);
            if (currentTokenStartIndex < 0) {
                return null;
            }
            var currentEndTokenIndex = currentTokenStartIndex;
            var currentTokenString = currentToken.m_lexem;
            if (Category.CAT_INCOMPLETE === currentToken.m_category) {
                var nextToken = tokens[currentTokenStartIndex + 1];
                if (nextToken == null) {
                    return null;
                }
                if (Category.CAT_IDENTIFIER === nextToken.m_category || Category.CAT_LITERAL === nextToken.m_category || Category.CAT_MAYBE_KEYWORD === nextToken.m_category) {
                    currentTokenString += nextToken.m_lexem;
                    currentEndTokenIndex = currentTokenStartIndex + 1;
                }
            }
            var path = null;
            var pathEndIndex = -1;
            if ("." === currentTokenString) {
                var previous = this.getTokenLexem(tokens, currentTokenStartIndex - 1);
                var next = this.getTokenLexem(tokens, currentEndTokenIndex + 1);
                if (previous != null && next != null) {
                    path = previous + "." + next;
                    pathEndIndex = currentEndTokenIndex + 1;
                }
            }else if ("." === this.getTokenLexem(tokens,currentTokenStartIndex - 1)) {
                var previous = this.getTokenLexem(tokens, currentTokenStartIndex - 2);
                if (previous != null) {
                    path = previous + "." + currentTokenString;
                    pathEndIndex = currentEndTokenIndex;
                }
            }else if ("." === this.getTokenLexem(tokens,currentEndTokenIndex + 1)) {
                var next = this.getTokenLexem(tokens, currentEndTokenIndex + 2);
                if (next != null) {
                    path = currentTokenString + "." + next;
                    pathEndIndex = currentEndTokenIndex + 2;
                }
            }else{
                path = currentTokenString;
                pathEndIndex = currentEndTokenIndex;
            }
            if (path == null) {
                return null;
            }
            path = path.toLowerCase();
            if (!(rnd.Utils.arrayContains(predefinedNames, path))) {
                return null;
            }
            var endToken = tokens[pathEndIndex];
            var pathHasOpeningBracket = "(" === this.getTokenLexem(tokens, pathEndIndex + 1);
            if (pathHasOpeningBracket && rnd.Utils.arrayContains(predefinedNames, path + "(")) {
                var openingBrackets = 1;
                var closingBracketIndex = pathEndIndex + 2;
                for (;closingBracketIndex < tokens.length;closingBracketIndex++) {
                    var tokenLexem = this.getTokenLexem(tokens, closingBracketIndex);
                    if (")" === tokenLexem) {
                        openingBrackets--;
                        if (openingBrackets == 0) {
                            endToken = tokens[closingBracketIndex];
                            break;
                        }
                    }else if ("(" === tokenLexem) {
                        openingBrackets++;
                    }
                }
            }
            var region = new Region(currentToken.m_offset, endToken.m_offset + endToken.m_lexem.length - currentToken.m_offset);
            return region;
        };
        AbstractDdlParser.prototype.getTokenLexem = function(tokens,index) {
            if (index >= 0 && index < tokens.length) {
                var token = tokens[index];
                return token.m_lexem;
            }
            return null;
        };
        AbstractDdlParser.prototype.setAllAnnotDefsAndEnumValues = function(result) {
            this.allAnnotDefsAndEnumValues = result;
        };
        AbstractDdlParser.prototype.getAllAnnotDefsAndEnumValues = function() {
            return this.allAnnotDefsAndEnumValues;
        };
        AbstractDdlParser.prototype.resetInput = function() {
            TokenCoCoParser.prototype.resetInput.call(this);
        };
        AbstractDdlParser.prototype.getAnnotationDefaultValue = function(element) {
            var value = AnnotationUtil.getAnnotationDefaultValue1(element);
            if (value != null && value.length > 0) {
                return value;
            }
            return AnnotationUtil.getAnnotationValueByDefault(element);
        };
        return AbstractDdlParser;
    }
);