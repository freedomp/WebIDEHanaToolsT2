// based on commit
//55ea59383636e4da55cb7bb8fbed6bb48b049245 AST nodes for table functions
/*eslint-disable max-params,max-statements*/
define(
    ["commonddl/astmodel/CompilationUnitImpl",
        "commonddl/astmodel/ViewDefinitionImpl",
        "commonddl/astmodel/ViewSelectImpl",
        "commonddl/astmodel/ColumnImpl",
        "commonddl/astmodel/DataSourceAssociationImpl",
        "require",
        "commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/DataSourceImpl",
        "commonddl/astmodel/SelectListEntryImpl",
        "commonddl/astmodel/SelectListImpl",
        "commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/AnnotationValueImpl",
        "commonddl/astmodel/ViewExtendImpl",
        "commonddl/astmodel/BooleanExpressionImpl",
        "commonddl/astmodel/LiteralExpressionImpl",
        "commonddl/astmodel/ExpressionContainerImpl",
        "commonddl/astmodel/AnnotationRecordValueImpl",
        "commonddl/astmodel/AnnotationNameValuePairImpl",
        "commonddl/astmodel/AnnotationArrayValueImpl",
        "commonddl/astmodel/SelectListEntryExtensionImpl",
        "commonddl/astmodel/NotExpressionImpl",
        "commonddl/astmodel/AnnotationDeclarationImpl",
        "commonddl/astmodel/AnonymousTypeDeclarationImpl",
        "commonddl/astmodel/AttributeDeclarationImpl",
        "commonddl/astmodel/EnumerationDeclarationImpl",
        "commonddl/astmodel/EnumerationValueImpl",
        "commonddl/astmodel/PathDeclarationImpl",
        "commonddl/astmodel/ContextDeclarationImpl",
        "commonddl/astmodel/NamespaceDeclarationImpl",
        "commonddl/astmodel/EntityDeclarationImpl",
        "commonddl/astmodel/AssociationDeclarationImpl",
        "commonddl/astmodel/ForeignKeyImpl",
        "commonddl/astmodel/TypeDeclarationImpl",
        "commonddl/astmodel/UsingDirectiveImpl",
        "commonddl/astmodel/StdFuncExpressionImpl",
        "commonddl/astmodel/OrderByEntryImpl",
        "commonddl/astmodel/ConcatenationExpressionImpl",
        "commonddl/astmodel/OrderByImpl",
        "commonddl/astmodel/GroupByImpl",
        "commonddl/astmodel/InExpressionImpl",
        "commonddl/astmodel/GroupByEntryImpl",
        "commonddl/astmodel/LikeExpressionImpl",
        "commonddl/astmodel/BetweenExpressionImpl",
        "commonddl/astmodel/NullExpressionImpl",
        "commonddl/astmodel/FuncExpressionImpl",
        "commonddl/astmodel/NamesImpl",
        "commonddl/astmodel/ViewColumnNameImpl",
        "commonddl/astmodel/SimpleCaseExpressionImpl",
        "commonddl/astmodel/CaseWhenExpressionImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl",
        "commonddl/astmodel/CastExpressionImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl",
        "commonddl/astmodel/FuncWithNamedParamExpressionImpl",
        "commonddl/astmodel/FuncParamImpl",
        "commonddl/astmodel/ParameterImpl",
        "commonddl/astmodel/PostAnnotationImpl",
        "commonddl/astmodel/ConstDeclarationImpl",
        "commonddl/astmodel/AccessPolicyDeclarationImpl",
        "commonddl/astmodel/AspectDeclarationImpl",
        "commonddl/astmodel/RoleComponentDeclarationImpl",
        "commonddl/astmodel/RoleDeclarationImpl",
        "commonddl/astmodel/RuleDeclarationImpl",
        "commonddl/astmodel/PrefixRuleFromClauseImpl",
        "commonddl/astmodel/PostfixRuleFromClauseImpl",
        "commonddl/astmodel/ViewSelectSetImpl",
        "commonddl/astmodel/AnnotationPathValueImpl",
        "commonddl/astmodel/ParameterBindingImpl",
        "commonddl/astmodel/ParameterBindingsImpl",
        "commonddl/astmodel/CardinalityRestrictionImpl",
        "commonddl/astmodel/BooleanType",
        "commonddl/astmodel/TableFunctionImpl",
        "commonddl/astmodel/AbapMethodImpl",
        "commonddl/astmodel/ImplementedByImpl",
        "commonddl/astmodel/ReturnStructureImpl",
        "commonddl/astmodel/ReturnStructureNameImpl",
        "commonddl/astmodel/ReturnStructureListImpl",
        "commonddl/astmodel/AbstractAnnotationValueImpl",
        "commonddl/astmodel/AnnotatedImpl",
        "commonddl/astmodel/AtomicExpressionImpl",
        "commonddl/astmodel/DdlStatementImpl",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/NamedDeclarationImpl",
        "commonddl/astmodel/SelectImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/StatementContainerImpl",
        "commonddl/astmodel/AssociationContainerImpl",
        "commonddl/astmodel/CaseExpressionImpl",
        "commonddl/astmodel/ExpressionsContainerExpressionImpl",
        "commonddl/astmodel/ConstructorFuncExpressionImpl",
        "commonddl/astmodel/ExtractFunctionExpressionImpl",
        "commonddl/astmodel/TrimFunctionExpressionImpl",
        "commonddl/astmodel/NestedFlattenedSelectListPathEntryImpl",
        "commonddl/astmodel/NestedSelectListPathEntryImpl",
        "commonddl/astmodel/IncludedRoleImpl"
    ], //dependencies
    function (CompilationUnitImpl, ViewDefinitionImpl, ViewSelectImpl, ColumnImpl, DataSourceAssociationImpl, require,
              PathEntryImpl, DataSourceImpl, SelectListEntryImpl, SelectListImpl, CompExpressionImpl, JoinDataSourceImpl,
              PreAnnotationImpl, AnnotationValueImpl, ViewExtendImpl, BooleanExpressionImpl, LiteralExpressionImpl,
              ExpressionContainerImpl, AnnotationRecordValueImpl, AnnotationNameValuePairImpl, AnnotationArrayValueImpl,
              SelectListEntryExtensionImpl, NotExpressionImpl, AnnotationDeclarationImpl, AnonymousTypeDeclarationImpl,
              AttributeDeclarationImpl, EnumerationDeclarationImpl, EnumerationValueImpl, PathDeclarationImpl,
              ContextDeclarationImpl, NamespaceDeclarationImpl, EntityDeclarationImpl, AssociationDeclarationImpl,
              ForeignKeyImpl, TypeDeclarationImpl, UsingDirectiveImpl, StdFuncExpressionImpl, OrderByEntryImpl,
              ConcatenationExpressionImpl, OrderByImpl, GroupByImpl, InExpressionImpl, GroupByEntryImpl, LikeExpressionImpl,
              BetweenExpressionImpl, NullExpressionImpl, FuncExpressionImpl, NamesImpl, ViewColumnNameImpl, SimpleCaseExpressionImpl,
              CaseWhenExpressionImpl, ArithmeticExpressionImpl, CastExpressionImpl, SearchedCaseExpressionImpl, FuncWithNamedParamExpressionImpl,
              FuncParamImpl, ParameterImpl, PostAnnotationImpl, ConstDeclarationImpl, AccessPolicyDeclarationImpl, AspectDeclarationImpl,
              RoleComponentDeclarationImpl, RoleDeclarationImpl, RuleDeclarationImpl, PrefixRuleFromClauseImpl, PostfixRuleFromClauseImpl,
              ViewSelectSetImpl, AnnotationPathValueImpl, ParameterBindingImpl, ParameterBindingsImpl, CardinalityRestrictionImpl, BooleanType,
              TableFunctionImpl, AbapMethodImpl, ImplementedByImpl, ReturnStructureImpl, ReturnStructureNameImpl, ReturnStructureListImpl,
              AbstractAnnotationValueImpl, AnnotatedImpl, AtomicExpressionImpl, DdlStatementImpl, ExpressionImpl, NamedDeclarationImpl, SelectImpl,
              SourceRangeImpl, StatementContainerImpl, AssociationContainerImpl, CaseExpressionImpl, ExpressionsContainerExpressionImpl,
              ConstructorFuncExpressionImpl, ExtractFunctionExpressionImpl, TrimFunctionExpressionImpl, NestedFlattenedSelectListPathEntryImpl,
              NestedSelectListPathEntryImpl, IncludedRoleImpl) {

        function AstFactoryImpl() {

        }

        AstFactoryImpl.init = function () {
            return new AstFactoryImpl();
        };
        AstFactoryImpl.prototype.constructor = AstFactoryImpl;

        AstFactoryImpl.prototype.createAbstractAnnotationValue = function () {
            var abstractAnnotationValue = new AbstractAnnotationValueImpl();
            return abstractAnnotationValue;
        };
        AstFactoryImpl.prototype.createAccessPolicyDeclaration = function () {
            var accessPolicyDeclaration = new AccessPolicyDeclarationImpl();
            return accessPolicyDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotated = function () {
            var annotated = new AnnotatedImpl();
            return annotated;
        };
        AstFactoryImpl.prototype.createAnnotation = function () {
            throw new Error();
        };
        AstFactoryImpl.prototype.createAnnotationArrayValue = function () {
            var annotationArrayValue = new AnnotationArrayValueImpl();
            return annotationArrayValue;
        };
        AstFactoryImpl.prototype.createAnnotationDeclaration = function () {
            var annotationDeclaration = new AnnotationDeclarationImpl();
            return annotationDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotationValue = function () {
            var annotationValue = new AnnotationValueImpl();
            return annotationValue;
        };
        AstFactoryImpl.prototype.createAssociationDeclaration = function () {
            var associationDeclaration = new AssociationDeclarationImpl();
            return associationDeclaration;
        };
        AstFactoryImpl.prototype.createAnnotationNameValuePair = function () {
            var annotationNameValuePair = new AnnotationNameValuePairImpl();
            return annotationNameValuePair;
        };
        AstFactoryImpl.prototype.createAnnotationRecordValue = function () {
            var annotationRecordValue = new AnnotationRecordValueImpl();
            return annotationRecordValue;
        };
        AstFactoryImpl.prototype.createAnnotationPathValue = function () {
            var annotationPathValue = new AnnotationPathValueImpl();
            return annotationPathValue;
        };
        AstFactoryImpl.prototype.createAnonymousTypeDeclaration = function () {
            var anonymousTypeDeclaration = new AnonymousTypeDeclarationImpl();
            return anonymousTypeDeclaration;
        };
        AstFactoryImpl.prototype.createAtomicExpression = function () {
            var atomicExpression = new AtomicExpressionImpl();
            return atomicExpression;
        };
        AstFactoryImpl.prototype.createAttributeDeclaration = function () {
            var attributeDeclaration = new AttributeDeclarationImpl();
            return attributeDeclaration;
        };
        AstFactoryImpl.prototype.createBetweenExpression = function () {
            var betweenExpression = new BetweenExpressionImpl();
            return betweenExpression;
        };
        AstFactoryImpl.prototype.createBooleanExpression = function () {
            var booleanExpression = new BooleanExpressionImpl();
            return booleanExpression;
        };
        AstFactoryImpl.prototype.createCompExpression = function () {
            var compExpression = new CompExpressionImpl();
            return compExpression;
        };
        AstFactoryImpl.prototype.createCompilationUnit = function () {
            var compilationUnit = new CompilationUnitImpl();
            return compilationUnit;
        };
        AstFactoryImpl.prototype.createContextDeclaration = function () {
            var contextDeclaration = new ContextDeclarationImpl();
            return contextDeclaration;
        };
        AstFactoryImpl.prototype.createDataSource = function () {
            var dataSource = new DataSourceImpl();
            return dataSource;
        };
        AstFactoryImpl.prototype.createDdlStatement = function () {
            var ddlStatement = new DdlStatementImpl();
            return ddlStatement;
        };
        AstFactoryImpl.prototype.createDocumentRoot = function () {
            throw new Error();
        };
        AstFactoryImpl.prototype.createEntityDeclaration = function () {
            var entityDeclaration = new EntityDeclarationImpl();
            return entityDeclaration;
        };
        AstFactoryImpl.prototype.createEnumerationDeclaration = function () {
            var enumerationDeclaration = new EnumerationDeclarationImpl();
            return enumerationDeclaration;
        };
        AstFactoryImpl.prototype.createEnumerationValue = function () {
            var enumerationValue = new EnumerationValueImpl();
            return enumerationValue;
        };
        AstFactoryImpl.prototype.createExpression = function () {
            var expression = new ExpressionImpl();
            return expression;
        };
        AstFactoryImpl.prototype.createExpressionContainer = function () {
            var expressionContainer = new ExpressionContainerImpl();
            return expressionContainer;
        };
        AstFactoryImpl.prototype.createExpressionsContainerExpression = function () {
            var expressionsContainerExpression = new ExpressionsContainerExpressionImpl();
            return expressionsContainerExpression;
        };
        AstFactoryImpl.prototype.createExtractFunctionExpression = function () {
            var extractFunctionExpression = new ExtractFunctionExpressionImpl();
            return extractFunctionExpression;
        };
        AstFactoryImpl.prototype.createForeignKey = function () {
            var foreignKey = new ForeignKeyImpl();
            return foreignKey;
        };
        AstFactoryImpl.prototype.createFuncExpression = function () {
            var funcExpression = new FuncExpressionImpl();
            return funcExpression;
        };
        AstFactoryImpl.prototype.createConstructorFuncExpression = function () {
            var constructorFuncExpression = new ConstructorFuncExpressionImpl();
            return constructorFuncExpression;
        };
        AstFactoryImpl.prototype.createFuncWithNamedParamExpression = function () {
            var funcWithNamedParamExpression = new FuncWithNamedParamExpressionImpl();
            return funcWithNamedParamExpression;
        };
        AstFactoryImpl.prototype.createFuncParam = function () {
            var funcParam = new FuncParamImpl();
            return funcParam;
        };
        AstFactoryImpl.prototype.createGroupBy = function () {
            var groupBy = new GroupByImpl();
            return groupBy;
        };
        AstFactoryImpl.prototype.createGroupByEntry = function () {
            var groupByEntry = new GroupByEntryImpl();
            return groupByEntry;
        };
        AstFactoryImpl.prototype.createIncludedRole = function () {
            var includedRole = new IncludedRoleImpl();
            return includedRole;
        };
        AstFactoryImpl.prototype.createJoinDataSource = function () {
            var joinDataSource = new JoinDataSourceImpl();
            return joinDataSource;
        };
        AstFactoryImpl.prototype.createLikeExpression = function () {
            var likeExpression = new LikeExpressionImpl();
            return likeExpression;
        };
        AstFactoryImpl.prototype.createLiteralExpression = function () {
            var literalExpression = new LiteralExpressionImpl();
            return literalExpression;
        };
        AstFactoryImpl.prototype.createNamedDeclaration = function () {
            var namedDeclaration = new NamedDeclarationImpl();
            return namedDeclaration;
        };
        AstFactoryImpl.prototype.createNames = function () {
            var names = new NamesImpl();
            return names;
        };
        AstFactoryImpl.prototype.createNamespaceDeclaration = function () {
            var namespaceDeclaration = new NamespaceDeclarationImpl();
            return namespaceDeclaration;
        };
        AstFactoryImpl.prototype.createNotExpression = function () {
            var notExpression = new NotExpressionImpl();
            return notExpression;
        };
        AstFactoryImpl.prototype.createNullExpression = function () {
            var nullExpression = new NullExpressionImpl();
            return nullExpression;
        };
        AstFactoryImpl.prototype.createOrderBy = function () {
            var orderBy = new OrderByImpl();
            return orderBy;
        };
        AstFactoryImpl.prototype.createOrderByEntry = function () {
            var orderByEntry = new OrderByEntryImpl();
            return orderByEntry;
        };
        AstFactoryImpl.prototype.createPathEntry = function () {
            var pathEntry = new PathEntryImpl();
            return pathEntry;
        };
        AstFactoryImpl.prototype.createNestedSelectListPathEntry = function () {
            var nestedSelectListPathEntry = new NestedSelectListPathEntryImpl();
            return nestedSelectListPathEntry;
        };
        AstFactoryImpl.prototype.createNestedFlattenedSelectListPathEntry = function () {
            var nestedFlattenedSelectListPathEntry = new NestedFlattenedSelectListPathEntryImpl();
            return nestedFlattenedSelectListPathEntry;
        };
        AstFactoryImpl.prototype.createPathDeclaration = function () {
            var pathDeclaration = new PathDeclarationImpl();
            return pathDeclaration;
        };
        AstFactoryImpl.prototype.createPathExpression = function () {
            //circular dependency problem -> caller must first load PathExpressionImpl by itself
            var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");

            var pathExpression = new PathExpressionImpl();
            return pathExpression;
        };
        AstFactoryImpl.prototype.createPathTarget = function () {
            throw new Error();
        };
        AstFactoryImpl.prototype.createPostAnnotation = function () {
            var postAnnotation = new PostAnnotationImpl();
            return postAnnotation;
        };
        AstFactoryImpl.prototype.createPreAnnotation = function () {
            var preAnnotation = new PreAnnotationImpl();
            return preAnnotation;
        };
        AstFactoryImpl.prototype.createRoleComponentDeclaration = function () {
            var roleComponentDeclaration = new RoleComponentDeclarationImpl();
            return roleComponentDeclaration;
        };
        AstFactoryImpl.prototype.createRoleDeclaration = function () {
            var roleDeclaration = new RoleDeclarationImpl();
            return roleDeclaration;
        };
        AstFactoryImpl.prototype.createRuleDeclaration = function () {
            var ruleDeclaration = new RuleDeclarationImpl();
            return ruleDeclaration;
        };
        AstFactoryImpl.prototype.createPostfixRuleFromClause = function () {
            var postfixRuleFromClause = new PostfixRuleFromClauseImpl();
            return postfixRuleFromClause;
        };
        AstFactoryImpl.prototype.createPrefixRuleFromClause = function () {
            var prefixRuleFromClause = new PrefixRuleFromClauseImpl();
            return prefixRuleFromClause;
        };
        AstFactoryImpl.prototype.createSelect = function () {
            var select = new SelectImpl();
            return select;
        };
        AstFactoryImpl.prototype.createSelectContainer = function () {
            throw new Error();
        };
        AstFactoryImpl.prototype.createSelectList = function () {
            var selectList = new SelectListImpl();
            return selectList;
        };
        AstFactoryImpl.prototype.createSelectListEntry = function () {
            var selectListEntry = new SelectListEntryImpl();
            return selectListEntry;
        };
        AstFactoryImpl.prototype.createSelectListEntryExtension = function () {
            var selectListEntryExtension = new SelectListEntryExtensionImpl();
            return selectListEntryExtension;
        };
        AstFactoryImpl.prototype.createSourceRange = function () {
            var sourceRange = new SourceRangeImpl();
            return sourceRange;
        };
        AstFactoryImpl.prototype.createStatementContainer = function () {
            var statementContainer = new StatementContainerImpl();
            return statementContainer;
        };
        AstFactoryImpl.prototype.createStdFuncExpression = function () {
            var stdFuncExpression = new StdFuncExpressionImpl();
            return stdFuncExpression;
        };
        AstFactoryImpl.prototype.createTrimFunctionExpression = function () {
            var trimFunctionExpression = new TrimFunctionExpressionImpl();
            return trimFunctionExpression;
        };
        AstFactoryImpl.prototype.createTypeDeclaration = function () {
            var typeDeclaration = new TypeDeclarationImpl();
            return typeDeclaration;
        };
        AstFactoryImpl.prototype.createViewColumnName = function () {
            var viewColumnName = new ViewColumnNameImpl();
            return viewColumnName;
        };
        AstFactoryImpl.prototype.createViewSelect = function () {
            var viewSelect = new ViewSelectImpl();
            return viewSelect;
        };
        AstFactoryImpl.prototype.createViewSelectSet = function () {
            var viewSelectSet = new ViewSelectSetImpl();
            return viewSelectSet;
        };
        AstFactoryImpl.prototype.createViewExtend = function () {
            var viewExtend = new ViewExtendImpl();
            return viewExtend;
        };
        AstFactoryImpl.prototype.createAssociationContainer = function () {
            var associationContainer = new AssociationContainerImpl();
            return associationContainer;
        };
        AstFactoryImpl.prototype.createViewDefinition = function () {
            var viewDefinition = new ViewDefinitionImpl();
            return viewDefinition;
        };
        AstFactoryImpl.prototype.createArithmeticExpression = function () {
            var arithmeticExpression = new ArithmeticExpressionImpl();
            return arithmeticExpression;
        };
        AstFactoryImpl.prototype.createAspectDeclaration = function () {
            var aspectDeclaration = new AspectDeclarationImpl();
            return aspectDeclaration;
        };
        AstFactoryImpl.prototype.createCastExpression = function () {
            var castExpression = new CastExpressionImpl();
            return castExpression;
        };
        AstFactoryImpl.prototype.createCaseExpression = function () {
            var caseExpression = new CaseExpressionImpl();
            return caseExpression;
        };
        AstFactoryImpl.prototype.createCaseWhenExpression = function () {
            var caseWhenExpression = new CaseWhenExpressionImpl();
            return caseWhenExpression;
        };
        AstFactoryImpl.prototype.createSimpleCaseExpression = function () {
            var simpleCaseExpression = new SimpleCaseExpressionImpl();
            return simpleCaseExpression;
        };
        AstFactoryImpl.prototype.createSearchedCaseExpression = function () {
            var searchedCaseExpression = new SearchedCaseExpressionImpl();
            return searchedCaseExpression;
        };
        AstFactoryImpl.prototype.createUsingDirective = function () {
            var usingDirective = new UsingDirectiveImpl();
            return usingDirective;
        };
        AstFactoryImpl.prototype.createConstDeclaration = function () {
            var constDeclaration = new ConstDeclarationImpl();
            return constDeclaration;
        };
        AstFactoryImpl.prototype.createParameter = function () {
            var parameter = new ParameterImpl();
            return parameter;
        };
        AstFactoryImpl.prototype.createParameterBindings = function () {
            var parameterBindings = new ParameterBindingsImpl();
            return parameterBindings;
        };
        AstFactoryImpl.prototype.createParameterBinding = function () {
            var parameterBinding = new ParameterBindingImpl();
            return parameterBinding;
        };
        AstFactoryImpl.prototype.createCardinalityRestriction = function () {
            var cardinalityRestriction = new CardinalityRestrictionImpl();
            return cardinalityRestriction;
        };
        AstFactoryImpl.prototype.createTableFunction = function () {
            var tableFunction = new TableFunctionImpl();
            return tableFunction;
        };
        AstFactoryImpl.prototype.createImplementedBy = function () {
            var implementedByImpl = new ImplementedByImpl();
            return implementedByImpl;
        };
        AstFactoryImpl.prototype.createAbapMethod = function () {
            var abapMethod = new AbapMethodImpl();
            return abapMethod;
        };
        AstFactoryImpl.prototype.createReturnStructure = function () {
            var returnStructure = new ReturnStructureImpl();
            return returnStructure;
        };
        AstFactoryImpl.prototype.createReturnStructureName = function () {
            var returnStructureName = new ReturnStructureNameImpl();
            return returnStructureName;
        };
        AstFactoryImpl.prototype.createReturnStructureList = function () {
            var returnStructureList = new ReturnStructureListImpl();
            return returnStructureList;
        };
        AstFactoryImpl.prototype.createDataSourceAssociation = function () {
            var dataSourceAssociation = new DataSourceAssociationImpl();
            return dataSourceAssociation;
        };
        AstFactoryImpl.prototype.createConcatenationExpression = function () {
            var concatenationExpression = new ConcatenationExpressionImpl();
            return concatenationExpression;
        };
        AstFactoryImpl.prototype.createInExpression = function () {
            var inExpression = new InExpressionImpl();
            return inExpression;
        };
        return AstFactoryImpl;
    }
);