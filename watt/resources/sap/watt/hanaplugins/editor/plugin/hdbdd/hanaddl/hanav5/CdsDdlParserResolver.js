// v-v-v-v-v-v @JsResolver::header

/*eslint-disable */
define(
["hanaddl/hanaddlNonUi","rndrt/rnd","commonddl/commonddlNonUi"], //dependencies
function (hanaddl,rnd,commonddl) {

var Token = rnd.Token;
var BaseCdsDdlParser = hanaddl.BaseCdsDdlParser;
var IAstFactory = commonddl.IAstFactory;

  function CdsDdlParserResolver(byte_code, scanner) {
        BaseCdsDdlParser.call(this,byte_code, scanner);
        this.m_start_attr = new rnd.NullFrame();
    }
    CdsDdlParserResolver.prototype = Object.create(BaseCdsDdlParser.prototype);

// ^-^-^-^-^-^ @JsResolver::header

    if (!rnd.Utils.assert) { // add "assert()" to old RND runtimes
        rnd.Utils.assert = function(arg) {
            /* global jQuery:false */
            if (!arg && jQuery && jQuery.sap) {
                jQuery.sap.log.error("assertion failed");
            }
        };
    }

    // ----------- Attributes

    function NamespaceDeclaration_attributes() {
        this.cdecl = null;
    }

    function InPackageDeclaration_attributes() {
        this.parent = null;
    }

    function UsingDirectiveList_attributes() {
        this.parentStatements = null;
    }

    function UsingDirective_attributes() {
        this.res = null;
    }

    function UsingPath_attributes() {
        this.res = null;
    }

    function ExtensionPackageDefinition_attributes() {
        this.parent = null;
    }

    function ExtendStatement_attributes() {
        this.annotations = null;
        this.parentStatements = null;
    }

    function __createExtend_attributes() {
        this.annotations = null;
        this.baseClass = null;
        this.introTok = null;
        this.parentStatements = null;
        this.res = null;
        this.ruleName = null;
        this.startIndex = 0;
    }

    function MainArtifactList_attributes() {
        this.parentStatements = null;
    }

    function _PreAnnotations_attributes() {
        this.res = null;
    }

    function ContextDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function MainArtifactDefinition_attributes() {
        this.annotations = null;
        this.parentStatements = null;
    }

    function AccessPolicyDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
    }

    function AccessPolicyComponentDeclaration_attributes() {
        this.parent = null;
    }

    function RoleDeclaration_attributes() {
        this.preAnnotations = null;
        this.statementContainer = null;
    }

    function RuleDeclaration_attributes() {
        this.role = null;
    }

    function RuleIncludedRole_attributes() {
        this.parent = null;
    }

    function RuleSubquery_attributes() {
        this.parent = null;
        this.startIndex = 0;
    }

    function RuleFromClause_attributes() {
        this.rule = null;
    }

    function AspectDeclaration_attributes() {
        this.preAnnotations = null;
        this.role = null;
        this.statementContainer = null;
    }

    function EntityDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function TechnicalConfiguration_attributes() {
        this.parentNode = null;
    }

    function StoreDefinition_attributes() {
        this.parent = null;
    }

    function IndexDefinition_attributes() {
        this.parentNode = null;
    }

    function PathWithOrder_attributes() {
        this.res = null;
    }

    function FulltextIndexDefinition_attributes() {
        this.parent = null;
    }

    function FulltextIndexParameters_attributes() {
        this.parent = null;
    }

    function FullTextChangeTracking_attributes() {
        this.parent = null;
    }

    function AsyncSpec_attributes() {
        this.res = null;
    }

    function FTI_ON_OFF_attributes() {
        this.res = null;
    }

    function FuzzyIndexDefinition_attributes() {
        this.parent = null;
    }

    function SeriesDefinition_attributes() {
        this.parentNode = null;
    }

    function KeyList_attributes() {
        this.res = null;
    }

    function SeriesDistance_attributes() {
        this.res = null;
    }

    function TableUnloadDefinition_attributes() {
        this.parent = null;
    }

    function TableGroupDefinition_attributes() {
        this.parent = null;
    }

    function TableGroupSpec_attributes() {
        this.parent = null;
    }

    function PartitionDefinition_attributes() {
        this.parent = null;
    }

    function PartitionScheme_attributes() {
        this.parent = null;
    }

    function HashPartition_attributes() {
        this.parent = null;
    }

    function RangePartition_attributes() {
        this.parent = null;
    }

    function RoundRobinPartition_attributes() {
        this.parent = null;
    }

    function PartitionRanges_attributes() {
        this.parent = null;
    }

    function RangeSpec_attributes() {
        this.parent = null;
    }

    function RangeValue_attributes() {
        this.res = null;
    }

    function PartitionExpressions_attributes() {
        this.parent = null;
    }

    function PartitionExpression_attributes() {
        this.parent = null;
    }

    function NumberPartitions_attributes() {
        this.res = null;
    }

    function NumberConst_attributes() {
        this.res = null;
    }

    function DistanceNumber_attributes() {
        this.res = null;
    }

    function SeriesIntervalConstValue_attributes() {
        this.res = null;
    }

    function SeriesPeriod_attributes() {
        this.res = null;
    }

    function AnnotatedElementDeclarationLoop_attributes() {
        this.res = null;
    }

    function ViewDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function ParameterDeclarationList_attributes() {
        this.parentNode = null;
    }

    function ParameterDeclaration_attributes() {
        this.parent = null;
    }

    function AnnotatedElementDeclaration_attributes() {
        this.parent = null;
    }

    function ElementDeclaration_attributes() {
        this.annotations = null;
        this.parent = null;
    }

    function Nullability_attributes() {
        this.parentElement = null;
    }

    function DefaultClause_attributes() {
        this.parentElement = null;
    }

    function ElementModifier_attributes() {
        this.keyToken = null;
    }

    function ConstDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function ConstValue_attributes() {
        this.res = null;
    }

    function EnumValueDeclaration_attributes() {
        this.res = null;
    }

    function TypeDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function ElementDefExtList_attributes() {
        this.parent = null;
    }

    function StructuredType_attributes() {
        this.parent = null;
    }

    function StructuredTypeComponent_attributes() {
        this.parent = null;
    }

    function AnnotatedTypeComponentDeclaration_attributes() {
        this.annotations = null;
        this.decl = null;
        this.parent = null;
    }

    function TypeComponentDeclaration_attributes() {
        this.parent = null;
        this.res = null;
    }

    function TypeSpec_attributes() {
        this.nameToken = null;
        this.parent = null;
        this.res = null;
    }

    function TypeSpecNoColon_attributes() {
        this.nameToken = null;
        this.parent = null;
        this.res = null;
    }

    function TypeTypeOf_attributes() {
        this.nameToken = null;
        this.parent = null;
        this.res = null;
    }

    function TypeArray_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeNamedOrEnum_attributes() {
        this.nameToken = null;
        this.parent = null;
        this.res = null;
    }

    function TypeNamed_attributes() {
        this.nameToken = null;
        this.parent = null;
        this.res = null;
    }

    function TypeName_attributes() {
        this.res = null;
    }

    function AssociationForeignKeys_attributes() {
        this.res = null;
    }

    function AssociationForeignKeyElement_attributes() {
        this.res = null;
    }

    function AssociationTo_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
        this.select = null;
    }

    function AssocForeignKeyOrJoinCondition_attributes() {
        this.assoc = null;
    }

    function AssociationOnCondition_attributes() {
        this.decl = null;
    }

    function TypeAssoc_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function Cardinality_attributes() {
        this.res = null;
    }

    function NamespacePath_attributes() {
        this.firstId = null;
        this.path = null;
    }

    function QualifiedDefId_attributes() {
        this.res = null;
    }

    function QuotedId_attributes() {
        this.res = null;
    }

    function IdWrapper_attributes() {
        this.res = null;
    }

    function ScopedIdWrapper_attributes() {
        this.res = null;
    }

    function EnumIdWrapper_attributes() {
        this.res = null;
    }

    function IntLiteralWrapper_attributes() {
        this.res = null;
    }

    function StringLiteralWrapper_attributes() {
        this.res = null;
    }

    function RealLiteral_attributes() {
        this.res = null;
    }

    function BinaryLiteral_attributes() {
        this.res = null;
    }

    function DateLiteral_attributes() {
        this.res = null;
    }

    function TimeLiteral_attributes() {
        this.res = null;
    }

    function TimeStampLiteral_attributes() {
        this.res = null;
    }

    function NullLiteral_attributes() {
        this.res = null;
    }

    function BooleanLiteral_attributes() {
        this.res = null;
    }

    function DefId_attributes() {
        this.res = null;
    }

    function AnnotationValue_attributes() {
        this.container = null;
    }

    function RecordValue_attributes() {
        this.container = null;
        this.record = null;
    }

    function PreAnnotation_attributes() {
        this.res = null;
    }

    function RecordComponent_attributes() {
        this.container = null;
        this.res = null;
    }

    function ArrayValue_attributes() {
        this.array = null;
        this.container = null;
    }

    function AnnotationPath_attributes() {
        this.nameValuePair = null;
    }

    function AnnotationId_attributes() {
        this.res = null;
    }

    function AnnotationLiteral_attributes() {
        this.res = null;
    }

    function QLSelectStmtNoOption_attributes() {
        this.parent = null;
    }

    function QLSubqueryWithParens_attributes() {
        this.parent = null;
        this.parentSelectSet = null;
        this.selectStmt = null;
    }

    function QLSubqueryComplex_attributes() {
        this.parent = null;
        this.parentSelectSet = null;
        this.selectStmt = null;
    }

    function QLSubquerySet_attributes() {
        this.parent = null;
        this.parentSelectSet = null;
        this.select = null;
    }

    function QLSubqueryElementary_attributes() {
        this.parent = null;
        this.parentSelectSet = null;
        this.selectStmt = null;
    }

    function AdhocDeclarationBlock_attributes() {
        this.select = null;
    }

    function AdhocElementDeclaration_attributes() {
        this.select = null;
    }

    function QLSelectClause_attributes() {
        this.list = null;
        this.res = null;
        this.select = null;
    }

    function QLSelectList_attributes() {
        this.list = null;
    }

    function AnnotatedQLSelectItem_attributes() {
        this.annotations = null;
        this.list = null;
    }

    function QLSelectItem_attributes() {
        this.list = null;
        this.preAnnotations = null;
        this.res = null;
    }

    function QLPathListSelectItemAlias_attributes() {
        this.entry = null;
    }

    function QLPathListSelectItem_attributes() {
        this.entry = null;
        this.list = null;
        this.preAnnotations = null;
    }

    function QLPath_attributes() {
        this.res = null;
    }

    function Filter_attributes() {
        this.entry = null;
    }

    function PathGeneric_attributes() {
        this.path = null;
    }

    function PathSimple_attributes() {
        this.res = null;
    }

    function PathWithNamespace_attributes() {
        this.res = null;
    }

    function PathWithAlias_attributes() {
        this.alias = null;
        this.expr = null;
    }

    function SetOperator_attributes() {
        this.all = null;
        this.distinct = null;
        this.operator = null;
    }

    function ExprSelectItem_attributes() {
        this.entry = null;
        this.list = null;
        this.preAnnotations = null;
    }

    function FromClause_attributes() {
        this.select = null;
    }

    function TablePathList_attributes() {
        this.resAdapter = null;
    }

    function Table_attributes() {
        this.resAdapter = null;
    }

    function TableOrJoin_attributes() {
        this.resAdapter = null;
    }

    function JoinType_attributes() {
        this.res = null;
    }

    function OuterJoinType_attributes() {
        this.res = null;
    }

    function TablePathAlias_attributes() {
        this.res = null;
    }

    function TablePath_attributes() {
        this.resAdapter = null;
    }

    function WhereClause_attributes() {
        this.res = null;
        this.select = null;
    }

    function GroupByClause_attributes() {
        this.res = null;
        this.select = null;
    }

    function HavingClause_attributes() {
        this.res = null;
        this.select = null;
    }

    function OrderByClause_attributes() {
        this.select = null;
    }

    function SortSpecList_attributes() {
        this.res = null;
    }

    function SortSpec_attributes() {
        this.res = null;
    }

    function OptAscDesc_attributes() {
        this.res = null;
    }

    function OptNullsFirstLast_attributes() {
        this.firstLast = null;
        this.nulls = null;
    }

    function Condition_attributes() {
        this.res = null;
    }

    function ConditionAnd_attributes() {
        this.res = null;
    }

    function ConditionTerm_attributes() {
        this.res = null;
    }

    function PredicateLeftIsExpression_attributes() {
        this.res = null;
    }

    function ComparisonPredicate_attributes() {
        this.left = null;
        this.res = null;
    }

    function RangePredicate_attributes() {
        this.expr1 = null;
        this.negated = false;
        this.res = null;
    }

    function LikePredicate_attributes() {
        this.expr1 = null;
        this.negated = false;
        this.res = null;
    }

    function NullPredicate_attributes() {
        this.expr = null;
        this.res = null;
    }

    function InPredicate_attributes() {
        this.left = null;
        this.negated = false;
        this.res = null;
    }

    function ExpressionList_attributes() {
        this.res = null;
    }

    function Expression_attributes() {
        this.res = null;
    }

    function ExprConcat_attributes() {
        this.res = null;
    }

    function ExprSum_attributes() {
        this.res = null;
    }

    function ExprFactor_attributes() {
        this.res = null;
    }

    function ExprTerm_attributes() {
        this.res = null;
    }

    function CaseExpression_attributes() {
        this.res = null;
    }

    function WhenExpressionThenList_attributes() {
        this.caseExpr = null;
    }

    function WhenConditionThenList_attributes() {
        this.caseExpr = null;
    }

    function WhenExpressionThen_attributes() {
        this.caseExpr = null;
    }

    function WhenConditionThen_attributes() {
        this.caseExpr = null;
    }

    function NumberLiteral_attributes() {
        this.res = null;
    }

    function Literal_attributes() {
        this.res = null;
    }

    function ExprAlias_attributes() {
        this.alias = null;
        this.expr = null;
    }

    function ExprAliasEnforced_attributes() {
        this.alias = null;
        this.expr = null;
    }

    function Agg_attributes() {
        this.res = null;
    }

    function AggName_attributes() {
        this.res = null;
    }

    function OptAll_attributes() {
        this.res = null;
    }

    function NamedArgFunc_attributes() {
        this.res = null;
    }

    function NamedArgument_attributes() {
        this.funcExpr = null;
    }

    function NamedArgumentList_attributes() {
        this.funcExpr = null;
    }

    function GisNotSpatialFunction_attributes() {
        this.container = null;
    }

    function GisGeometryConstructor_attributes() {
        this.container = null;
    }

    function GisGeneralConstructor_attributes() {
        this.container = null;
    }

    function GisObjectiveFunction_attributes() {
        this.container = null;
    }

    function GisNotSpatialFunctionName_attributes() {
        this.res = null;
    }

    function GisGeometryConstructorName_attributes() {
        this.res = null;
    }

    function GisGeneralConstructorName_attributes() {
        this.res = null;
    }

    function GisObjectiveFunctionName_attributes() {
        this.res = null;
    }

    function GisObjectiveFunctionNameToken_attributes() {
        this.res = null;
    }

    function GisObjectiveNamedParameterFunctionName_attributes() {
        this.res = null;
    }

    function GisUnionAggregationFunction_attributes() {
        this.container = null;
    }

    function GisUnionAggregationFunctionName_attributes() {
        this.res = null;
    }

    function SessionUserFunction_attributes() {
        this.res = null;
    }

    function Func_attributes() {
        this.res = null;
    }

    function UserDefinedFunction_attributes() {
        this.res = null;
    }

    function UserDefinedFunctionName_attributes() {
        this.res = null;
    }

    function NamedArgumentFuncName_attributes() {
        this.res = null;
    }

    function SimpleFuncName_attributes() {
        this.res = null;
    }

    function ConstishFuncName_attributes() {
        this.res = null;
    }

    function TrimFunction_attributes() {
        this.res = null;
    }

    function TrimPosition_attributes() {
        this.res = null;
    }

    function ExtractFunction_attributes() {
        this.res = null;
    }

    function ExtractSpec_attributes() {
        this.res = null;
    }

    function CastFunction_attributes() {
        this.res = null;
    }

    function CastTypeWithoutParams_attributes() {
        this.res = null;
    }

    function CastTypeWithOptionalParams_attributes() {
        this.res = null;
    }

    function CastTypeWithOptionalLengthParam_attributes() {
        this.res = null;
    }

    function DayOfWeekFunction_attributes() {
        this.res = null;
    }

    function LeftFunction_attributes() {
        this.res = null;
    }

    function RightFunction_attributes() {
        this.res = null;
    }

    function DayNameFunction_attributes() {
        this.res = null;
    }

    function MonthNameFunction_attributes() {
        this.res = null;
    }

    function SeriesFunctionName_attributes() {
        this.res = null;
    }

    function RoundingMode_attributes() {
        this.res = null;
    }

    function AnnotationDeclaration_attributes() {
        this.anno = null;
        this.annots = null;
        this.parentStmts = null;
    }

    function annotationTypeSpec_attributes() {
        this.element = null;
    }

    function AnnotationTypeTypeOf_attributes() {
        this.element = null;
    }

    function AnnotationTypeNamedOrEnum_attributes() {
        this.element = null;
    }

    function AnnotationDefaultClause_attributes() {
        this.res = null;
    }

    function AnnotationTypeNamed_attributes() {
        this.element = null;
    }

    function AnnotationTypeSpecNoColon_attributes() {
        this.element = null;
    }

    function AnnotationTypeArray_attributes() {
        this.element = null;
    }

    function AnnotationTypeName_attributes() {
        this.res = null;
    }

    function annotationEnumClause_attributes() {
        this.element = null;
        this.enumeration = null;
        this.val = null;
    }

    function annotationStructuredType_attributes() {
        this.element = null;
        this.type = null;
    }

    function NOT_attributes() {
        this.name = null;
    }

    function NULL_attributes() {
        this.name = null;
    }


    // ----------- Locals

    function START2_locals() {
        this.InPackageDeclaration = new InPackageDeclaration_attributes();
        this.NamespaceDeclaration = new NamespaceDeclaration_attributes();
        this.UsingDirectiveList = new UsingDirectiveList_attributes();
    }

    function START_SYNTAX_COLORING_locals() {
        this.AnnotatedElementDeclaration = new AnnotatedElementDeclaration_attributes();
    }

    function NamespaceDeclaration_locals() {
        this.NamespacePath = new NamespacePath_attributes();
        this.id_1 = new IdWrapper_attributes();
        this.path = null;
    }

    function InPackageDeclaration_locals() {
        this.inPackageDecl = null;
        this.path = new UsingPath_attributes();
    }

    function UsingDirectiveList_locals() {
        this.directive = new UsingDirective_attributes();
    }

    function UsingDirective_locals() {
        this.alias = new IdWrapper_attributes();
        this.path = new UsingPath_attributes();
    }

    function UsingPath_locals() {
        this.path1 = new PathWithNamespace_attributes();
        this.path2 = new PathSimple_attributes();
    }

    function TopLevelDeclaration_locals() {
        this.AccessPolicyDeclaration = new AccessPolicyDeclaration_attributes();
        this.ExtendStatement = new ExtendStatement_attributes();
        this.ExtensionPackageDefinition = new ExtensionPackageDefinition_attributes();
        this.MainArtifactDefinition = new MainArtifactDefinition_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function ExtensionPackageDefinition_locals() {
        this.extensionPackageDefinition = null;
        this.first = new UsingPath_attributes();
        this.name = new DefId_attributes();
        this.next = new UsingPath_attributes();
    }

    function ExtendStatement_locals() {
        this.ElementDefExtList = new ElementDefExtList_attributes();
        this.MainArtifactList = new MainArtifactList_attributes();
        this.extend = new __createExtend_attributes();
        this.p = new PathSimple_attributes();
        this.startIndex = 0;
    }

    function __createExtend_locals() {
        this.extend = null;
    }

    function MainArtifactList_locals() {
        this.ExtendStatement = new ExtendStatement_attributes();
        this.MainArtifactDefinition = new MainArtifactDefinition_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function _PreAnnotations_locals() {
        this.annotation = new PreAnnotation_attributes();
    }

    function ContextDeclaration_locals() {
        this.MainArtifactList = new MainArtifactList_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function MainArtifactDefinition_locals() {
        this.AnnotationDeclaration = new AnnotationDeclaration_attributes();
        this.ConstDeclaration = new ConstDeclaration_attributes();
        this.ContextDeclaration = new ContextDeclaration_attributes();
        this.EntityDeclaration = new EntityDeclaration_attributes();
        this.TypeDeclaration = new TypeDeclaration_attributes();
        this.ViewDeclaration = new ViewDeclaration_attributes();
    }

    function AccessPolicyDeclaration_locals() {
        this.AccessPolicyComponentDeclaration = new AccessPolicyComponentDeclaration_attributes();
        this.id = new QualifiedDefId_attributes();
        this.res = null;
    }

    function AccessPolicyComponentDeclaration_locals() {
        this.AspectDeclaration = new AspectDeclaration_attributes();
        this.RoleDeclaration = new RoleDeclaration_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function RoleDeclaration_locals() {
        this.RuleDeclaration = new RuleDeclaration_attributes();
        this.id = new QualifiedDefId_attributes();
        this.role = null;
    }

    function RuleDeclaration_locals() {
        this.a_decl = new AspectDeclaration_attributes();
        this.incl = new RuleIncludedRole_attributes();
        this.rule = new RuleSubquery_attributes();
        this.startIndex = 0;
    }

    function RuleIncludedRole_locals() {
        this.includedRole = null;
        this.role = new PathSimple_attributes();
    }

    function RuleSubquery_locals() {
        this.RuleFromClause = new RuleFromClause_attributes();
        this.rule = null;
        this.where = new WhereClause_attributes();
    }

    function RuleFromClause_locals() {
        this.from = null;
        this.path1 = new QLPath_attributes();
        this.path2 = new QLPath_attributes();
    }

    function AspectDeclaration_locals() {
        this.QLSubqueryElementary = new QLSubqueryElementary_attributes();
        this.aspect = null;
        this.id = new QualifiedDefId_attributes();
    }

    function EntityDeclaration_locals() {
        this.AnnotatedElementDeclarationLoop = new AnnotatedElementDeclarationLoop_attributes();
        this.IndexDefinition = new IndexDefinition_attributes();
        this.SeriesDefinition = new SeriesDefinition_attributes();
        this.TechnicalConfiguration = new TechnicalConfiguration_attributes();
        this.id = new QualifiedDefId_attributes();
        this.temporary = null;
    }

    function TechnicalConfiguration_locals() {
        this.FulltextIndexDefinition = new FulltextIndexDefinition_attributes();
        this.FuzzyIndexDefinition = new FuzzyIndexDefinition_attributes();
        this.IndexDefinition = new IndexDefinition_attributes();
        this.PartitionDefinition = new PartitionDefinition_attributes();
        this.StoreDefinition = new StoreDefinition_attributes();
        this.TableGroupDefinition = new TableGroupDefinition_attributes();
        this.TableUnloadDefinition = new TableUnloadDefinition_attributes();
        this.fulltextIndexDefinitions = null;
        this.fuzzyIndexDefinitions = null;
        this.indexDefinitions = null;
        this.technicalConfiguration = null;
    }

    function StoreDefinition_locals() {
        this.storeDefinition = null;
    }

    function IndexDefinition_locals() {
        this.indexDefinition = null;
        this.name = new DefId_attributes();
        this.onPaths = null;
        this.order = new OptAscDesc_attributes();
        this.p = new PathWithOrder_attributes();
    }

    function PathWithOrder_locals() {
        this.id1 = new IdWrapper_attributes();
    }

    function FulltextIndexDefinition_locals() {
        this.FulltextIndexParameters = new FulltextIndexParameters_attributes();
        this.column = new PathSimple_attributes();
        this.fulltextIndexDefinition = null;
        this.name = new IdWrapper_attributes();
        this.params = null;
    }

    function FulltextIndexParameters_locals() {
        this.FullTextChangeTracking = new FullTextChangeTracking_attributes();
        this.detectionArgs = null;
        this.fval = new FTI_ON_OFF_attributes();
        this.l = new StringLiteralWrapper_attributes();
        this.nval = new NumberLiteral_attributes();
        this.param = null;
        this.pval = new PathSimple_attributes();
        this.sval = new StringLiteralWrapper_attributes();
        this.tav = null;
        this.tmCfg = new StringLiteralWrapper_attributes();
        this.tmTok = new FTI_ON_OFF_attributes();
    }

    function FullTextChangeTracking_locals() {
        this.asyncSpec = new AsyncSpec_attributes();
        this.tav = null;
        this.tracking = null;
    }

    function AsyncSpec_locals() {
        this.asyncSpec = null;
        this.m1 = new IntLiteralWrapper_attributes();
        this.m2 = new IntLiteralWrapper_attributes();
        this.n = new IntLiteralWrapper_attributes();
    }

    function FuzzyIndexDefinition_locals() {
        this.column = new PathSimple_attributes();
        this.fuzzyIndexDefinition = null;
        this.l1 = new StringLiteralWrapper_attributes();
    }

    function SeriesDefinition_locals() {
        this.alternatePeriodForSeries = new KeyList_attributes();
        this.keyList = new KeyList_attributes();
        this.maxValue = new NumberConst_attributes();
        this.minValue = new NumberConst_attributes();
        this.periodForSeries = new SeriesPeriod_attributes();
        this.seriesDefinition = null;
        this.seriesDistance = new SeriesDistance_attributes();
    }

    function KeyList_locals() {
        this.id1 = new IdWrapper_attributes();
        this.idn = new IdWrapper_attributes();
        this.keyList = null;
    }

    function SeriesDistance_locals() {
        this.distance = null;
        this.num = new DistanceNumber_attributes();
        this.val = new SeriesIntervalConstValue_attributes();
    }

    function TableUnloadDefinition_locals() {
        this.definition = null;
        this.prioVal = new IntLiteralWrapper_attributes();
    }

    function TableGroupDefinition_locals() {
        this.TableGroupSpec = new TableGroupSpec_attributes();
        this.definition = null;
        this.specs = null;
    }

    function TableGroupSpec_locals() {
        this.attribute = null;
        this.id = new IdWrapper_attributes();
        this.spec = null;
        this.tok = null;
    }

    function PartitionDefinition_locals() {
        this.PartitionScheme = new PartitionScheme_attributes();
        this.partitionDefinition = null;
    }

    function PartitionScheme_locals() {
        this.HashPartition = new HashPartition_attributes();
        this.RangePartition = new RangePartition_attributes();
        this.RoundRobinPartition = new RoundRobinPartition_attributes();
        this.partitionScheme = null;
    }

    function HashPartition_locals() {
        this.PartitionExpressions = new PartitionExpressions_attributes();
        this.hashPartition = null;
        this.num = new NumberPartitions_attributes();
    }

    function RangePartition_locals() {
        this.PartitionExpressions = new PartitionExpressions_attributes();
        this.PartitionRanges = new PartitionRanges_attributes();
        this.rangePartition = null;
    }

    function RoundRobinPartition_locals() {
        this.num = new NumberPartitions_attributes();
        this.roundRobinPartition = null;
    }

    function PartitionRanges_locals() {
        this.RangeSpec = new RangeSpec_attributes();
        this.partitionRanges = null;
    }

    function RangeSpec_locals() {
        this.exactlyValue = new RangeValue_attributes();
        this.lowerValue = new RangeValue_attributes();
        this.rangeSpec = null;
        this.upperValue = new RangeValue_attributes();
    }

    function RangeValue_locals() {
        this.blit = new BooleanLiteral_attributes();
        this.dlit = new DateLiteral_attributes();
        this.ilit = new IntLiteralWrapper_attributes();
        this.rlit = new RealLiteral_attributes();
        this.slit = new StringLiteralWrapper_attributes();
    }

    function PartitionExpressions_locals() {
        this.PartitionExpression = new PartitionExpression_attributes();
        this.expressions = null;
    }

    function PartitionExpression_locals() {
        this.expression = null;
        this.monthPath = new PathSimple_attributes();
        this.simplePath = new PathSimple_attributes();
        this.yearPath = new PathSimple_attributes();
    }

    function NumberPartitions_locals() {
        this.ilit = new IntLiteralWrapper_attributes();
    }

    function NumberConst_locals() {
        this.dist = new DistanceNumber_attributes();
    }

    function DistanceNumber_locals() {
        this.distanceNumber = null;
    }

    function SeriesPeriod_locals() {
        this.id0 = new IdWrapper_attributes();
        this.id1 = new IdWrapper_attributes();
        this.id2 = new IdWrapper_attributes();
        this.seriesPeriod = null;
    }

    function AnnotatedElementDeclarationLoop_locals() {
        this.AnnotatedElementDeclaration = new AnnotatedElementDeclaration_attributes();
    }

    function ViewDeclaration_locals() {
        this.ParameterDeclarationList = new ParameterDeclarationList_attributes();
        this.QLSelectStmtNoOption = new QLSelectStmtNoOption_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function ParameterDeclarationList_locals() {
        this.ParameterDeclaration = new ParameterDeclaration_attributes();
        this.parameterDeclarationList = null;
    }

    function ParameterDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.id = new DefId_attributes();
        this.parameterDeclaration = null;
        this.type = new TypeSpec_attributes();
    }

    function AnnotatedElementDeclaration_locals() {
        this.ElementDeclaration = new ElementDeclaration_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function ElementDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.Nullability = new Nullability_attributes();
        this.expr = new Expression_attributes();
        this.expr2 = new Expression_attributes();
        this.id = new DefId_attributes();
        this.modifiers = new ElementModifier_attributes();
        this.type = new TypeSpec_attributes();
    }

    function Nullability_locals() {
        this.no = new NOT_attributes();
        this.nu = new NULL_attributes();
    }

    function DefaultClause_locals() {
        this.enumVal = new EnumIdWrapper_attributes();
        this.expr = new Expression_attributes();
    }

    function ConstDeclaration_locals() {
        this.TypeSpec = new TypeSpec_attributes();
        this.expr = new ConstValue_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function ConstValue_locals() {
        this.exp = new Expression_attributes();
    }

    function EnumValueDeclaration_locals() {
        this.expr = new Expression_attributes();
        this.id = new DefId_attributes();
    }

    function TypeDeclaration_locals() {
        this.StructuredType = new StructuredType_attributes();
        this.id = new QualifiedDefId_attributes();
        this.table = null;
        this.typespec = new TypeSpec_attributes();
    }

    function ElementDefExtList_locals() {
        this.ElementDeclaration = new ElementDeclaration_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function StructuredType_locals() {
        this.StructuredTypeComponent = new StructuredTypeComponent_attributes();
    }

    function StructuredTypeComponent_locals() {
        this.typecomponent = new AnnotatedTypeComponentDeclaration_attributes();
    }

    function AnnotatedTypeComponentDeclaration_locals() {
        this.annotations = new _PreAnnotations_attributes();
        this.typeCompDecl = new TypeComponentDeclaration_attributes();
    }

    function TypeComponentDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.id = new DefId_attributes();
        this.typespec = new TypeSpec_attributes();
    }

    function TypeSpec_locals() {
        this.arr = new TypeArray_attributes();
        this.comp_list = new StructuredType_attributes();
        this.startIndex = 0;
        this.tto = new TypeTypeOf_attributes();
        this.typeassoc = new TypeAssoc_attributes();
        this.typename = new TypeNamedOrEnum_attributes();
    }

    function TypeSpecNoColon_locals() {
        this.StructuredType = new StructuredType_attributes();
        this.tto = new TypeTypeOf_attributes();
        this.typename = new TypeNamedOrEnum_attributes();
    }

    function TypeTypeOf_locals() {
        this.id = new PathSimple_attributes();
    }

    function TypeArray_locals() {
        this.sub = new TypeSpecNoColon_attributes();
    }

    function TypeNamedOrEnum_locals() {
        this.enumeration = null;
        this.named = new TypeNamed_attributes();
        this.startIndex = 0;
        this.val_decl = new EnumValueDeclaration_attributes();
    }

    function TypeNamed_locals() {
        this.id = new TypeName_attributes();
        this.p1 = new IntLiteralWrapper_attributes();
        this.p2 = new IntLiteralWrapper_attributes();
    }

    function TypeName_locals() {
        this.id = new PathSimple_attributes();
    }

    function AssociationForeignKeys_locals() {
        this.AssociationForeignKeyElement = new AssociationForeignKeyElement_attributes();
    }

    function AssociationForeignKeyElement_locals() {
        this.k1 = new PathWithAlias_attributes();
        this.kn = new PathWithAlias_attributes();
        this.startIndex = 0;
    }

    function AssociationTo_locals() {
        this.Cardinality = new Cardinality_attributes();
        this.startTargetIndex = 0;
        this.target = new PathSimple_attributes();
    }

    function AssocForeignKeyOrJoinCondition_locals() {
        this.AssociationForeignKeys = new AssociationForeignKeys_attributes();
        this.AssociationOnCondition = new AssociationOnCondition_attributes();
    }

    function AssociationOnCondition_locals() {
        this.cond = new Condition_attributes();
    }

    function TypeAssoc_locals() {
        this.AssocForeignKeyOrJoinCondition = new AssocForeignKeyOrJoinCondition_attributes();
        this.assocTo = new AssociationTo_attributes();
    }

    function Cardinality_locals() {
        this.max1 = new IntLiteralWrapper_attributes();
        this.maxStar = null;
        this.min = new IntLiteralWrapper_attributes();
        this.srcMax = new IntLiteralWrapper_attributes();
        this.srcMaxStar = null;
    }

    function NamespacePath_locals() {
        this.id_n = new IdWrapper_attributes();
    }

    function QualifiedDefId_locals() {
        this.defid = new DefId_attributes();
        this.id_1 = new IdWrapper_attributes();
        this.id_n = new IdWrapper_attributes();
    }

    function IdWrapper_locals() {
        this.idq = new QuotedId_attributes();
    }

    function ScopedIdWrapper_locals() {
        this.id = new IdWrapper_attributes();
    }

    function NullLiteral_locals() {
        this.nullLit = new NULL_attributes();
    }

    function DefId_locals() {
        this.id1 = new IdWrapper_attributes();
    }

    function AnnotationValue_locals() {
        this.ArrayValue = new ArrayValue_attributes();
        this.RecordValue = new RecordValue_attributes();
        this.lit_val = new AnnotationLiteral_attributes();
        this.refToConst = new PathSimple_attributes();
    }

    function RecordValue_locals() {
        this.RecordComponent = new RecordComponent_attributes();
    }

    function PreAnnotation_locals() {
        this.AnnotationPath = new AnnotationPath_attributes();
        this.AnnotationValue = new AnnotationValue_attributes();
    }

    function RecordComponent_locals() {
        this.AnnotationPath = new AnnotationPath_attributes();
        this.AnnotationValue = new AnnotationValue_attributes();
    }

    function ArrayValue_locals() {
        this.AnnotationValue = new AnnotationValue_attributes();
    }

    function AnnotationPath_locals() {
        this.id_1 = new AnnotationId_attributes();
        this.id_n = new AnnotationId_attributes();
    }

    function AnnotationLiteral_locals() {
        this.binary_lit = new BinaryLiteral_attributes();
        this.date_lit = new DateLiteral_attributes();
        this.int_val = new IntLiteralWrapper_attributes();
        this.null_lit = new NullLiteral_attributes();
        this.real_lit = new RealLiteral_attributes();
        this.str_val = new StringLiteralWrapper_attributes();
        this.time_lit = new TimeLiteral_attributes();
        this.timestamp_lit = new TimeStampLiteral_attributes();
    }

    function QLSelectStmtNoOption_locals() {
        this.QLSubqueryComplex = new QLSubqueryComplex_attributes();
    }

    function QLSubqueryWithParens_locals() {
        this.sq1 = new QLSubqueryComplex_attributes();
    }

    function QLSubqueryComplex_locals() {
        this.OrderByClause = new OrderByClause_attributes();
        this.sq = new QLSubquerySet_attributes();
    }

    function QLSubquerySet_locals() {
        this.set = new SetOperator_attributes();
        this.sq1a = new QLSubqueryElementary_attributes();
        this.sq1b = new QLSubqueryWithParens_attributes();
        this.sq2a = new QLSubqueryElementary_attributes();
        this.sq2b = new QLSubqueryWithParens_attributes();
        this.tempSelectSet = null;
    }

    function QLSubqueryElementary_locals() {
        this.adhoc = new AdhocDeclarationBlock_attributes();
        this.from = new FromClause_attributes();
        this.group = new GroupByClause_attributes();
        this.having = new HavingClause_attributes();
        this.select = new QLSelectClause_attributes();
        this.where = new WhereClause_attributes();
    }

    function AdhocDeclarationBlock_locals() {
        this.elem = new AdhocElementDeclaration_attributes();
    }

    function AdhocElementDeclaration_locals() {
        this.AssociationOnCondition = new AssociationOnCondition_attributes();
        this.assocTo = new AssociationTo_attributes();
        this.expr = new Expression_attributes();
        this.expr2 = new Expression_attributes();
        this.id = new DefId_attributes();
        this.startIndex = 0;
    }

    function QLSelectClause_locals() {
        this.QLSelectList = new QLSelectList_attributes();
        this.startIndex = 0;
    }

    function QLSelectList_locals() {
        this.AnnotatedQLSelectItem = new AnnotatedQLSelectItem_attributes();
        this.p2 = new AnnotatedQLSelectItem_attributes();
    }

    function AnnotatedQLSelectItem_locals() {
        this.QLSelectItem = new QLSelectItem_attributes();
        this.annotations = new _PreAnnotations_attributes();
    }

    function QLSelectItem_locals() {
        this.p1 = new ExprSelectItem_attributes();
        this.p2 = new QLPathListSelectItem_attributes();
    }

    function QLPathListSelectItemAlias_locals() {
        this.alias1 = new IdWrapper_attributes();
    }

    function QLPathListSelectItem_locals() {
        this.QLPathListSelectItemAlias = new QLPathListSelectItemAlias_attributes();
        this.flattenKeyword = null;
        this.nestedEntry = null;
        this.p2 = new QLSelectClause_attributes();
        this.p3 = new QLSelectClause_attributes();
        this.pathExp = new QLPath_attributes();
        this.startIndex = 0;
    }

    function QLPath_locals() {
        this.entry = null;
        this.f1 = new Filter_attributes();
        this.f2 = new Filter_attributes();
        this.id1 = new IdWrapper_attributes();
        this.id2 = new IdWrapper_attributes();
        this.idsc1 = new ScopedIdWrapper_attributes();
    }

    function Filter_locals() {
        this.IntLiteralWrapper = new IntLiteralWrapper_attributes();
        this.c = new Condition_attributes();
    }

    function PathGeneric_locals() {
        this.id1 = new IdWrapper_attributes();
        this.id2 = new IdWrapper_attributes();
    }

    function PathSimple_locals() {
        this.PathGeneric = new PathGeneric_attributes();
    }

    function PathWithNamespace_locals() {
        this.NamespacePath = new NamespacePath_attributes();
        this.PathGeneric = new PathGeneric_attributes();
        this.id_1 = new IdWrapper_attributes();
    }

    function PathWithAlias_locals() {
        this.id = new IdWrapper_attributes();
        this.path = new PathSimple_attributes();
    }

    function ExprSelectItem_locals() {
        this.alias = new ExprAlias_attributes();
        this.alias2 = new ExprAliasEnforced_attributes();
    }

    function FromClause_locals() {
        this.TablePathList = new TablePathList_attributes();
        this.fromAdapter = null;
    }

    function TablePathList_locals() {
        this.TableOrJoin = new TableOrJoin_attributes();
    }

    function Table_locals() {
        this.TableOrJoin = new TableOrJoin_attributes();
        this.TablePath = new TablePath_attributes();
    }

    function TableOrJoin_locals() {
        this.Table = new Table_attributes();
        this.TableOrJoin = new TableOrJoin_attributes();
        this.cond = new Condition_attributes();
        this.join = null;
        this.jt = new JoinType_attributes();
        this.rightAdapter = null;
        this.rightTable2 = new Table_attributes();
    }

    function JoinType_locals() {
        this.outer = new OuterJoinType_attributes();
    }

    function TablePathAlias_locals() {
        this.alias = new IdWrapper_attributes();
    }

    function TablePath_locals() {
        this.alias = new TablePathAlias_attributes();
        this.path = new QLPath_attributes();
    }

    function WhereClause_locals() {
        this.cond = new Condition_attributes();
    }

    function GroupByClause_locals() {
        this.list = new ExpressionList_attributes();
    }

    function HavingClause_locals() {
        this.cond = new Condition_attributes();
    }

    function OrderByClause_locals() {
        this.order = new SortSpecList_attributes();
    }

    function SortSpecList_locals() {
        this.spec = new SortSpec_attributes();
    }

    function SortSpec_locals() {
        this.expr = new Expression_attributes();
        this.nfl = new OptNullsFirstLast_attributes();
        this.order = new OptAscDesc_attributes();
    }

    function Condition_locals() {
        this.condAnd = new ConditionAnd_attributes();
        this.right = new ConditionAnd_attributes();
    }

    function ConditionAnd_locals() {
        this.condTerm = new ConditionTerm_attributes();
        this.right = new ConditionTerm_attributes();
    }

    function ConditionTerm_locals() {
        this.NOT = new NOT_attributes();
        this.cond1 = new ConditionTerm_attributes();
        this.cond2 = new Condition_attributes();
        this.pred = new PredicateLeftIsExpression_attributes();
    }

    function PredicateLeftIsExpression_locals() {
        this.NOT = new NOT_attributes();
        this.comp = new ComparisonPredicate_attributes();
        this.inP = new InPredicate_attributes();
        this.left = new Expression_attributes();
        this.like = new LikePredicate_attributes();
        this.negated = false;
        this.nullPred = new NullPredicate_attributes();
        this.range = new RangePredicate_attributes();
    }

    function ComparisonPredicate_locals() {
        this.right = new Expression_attributes();
    }

    function RangePredicate_locals() {
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
    }

    function LikePredicate_locals() {
        this.escapeToken = null;
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
    }

    function NullPredicate_locals() {
        this.NOT = new NOT_attributes();
        this.NULL = new NULL_attributes();
        this.isNot = false;
    }

    function InPredicate_locals() {
        this.expr = new Expression_attributes();
        this.inExpression = null;
        this.list = new ExpressionList_attributes();
    }

    function ExpressionList_locals() {
        this.expr = new Expression_attributes();
    }

    function Expression_locals() {
        this.exprConcat = new ExprConcat_attributes();
    }

    function ExprConcat_locals() {
        this.exprSum1 = new ExprSum_attributes();
        this.exprSum2 = new ExprSum_attributes();
    }

    function ExprSum_locals() {
        this.exprFactor1 = new ExprFactor_attributes();
        this.exprFactor2 = new ExprFactor_attributes();
        this.exprFactor3 = new ExprFactor_attributes();
    }

    function ExprFactor_locals() {
        this.exprTerm1 = new ExprTerm_attributes();
        this.exprTerm2 = new ExprTerm_attributes();
        this.exprTerm3 = new ExprTerm_attributes();
    }

    function ExprTerm_locals() {
        this.agg = new Agg_attributes();
        this.caseExpr = new CaseExpression_attributes();
        this.col = new QLPath_attributes();
        this.exprCont = null;
        this.exprTerm1 = new ExprTerm_attributes();
        this.exprTerm2 = new ExprTerm_attributes();
        this.exprTerm3 = new Expression_attributes();
        this.func = new Func_attributes();
        this.gisFunction1 = new GisObjectiveFunction_attributes();
        this.gisFunction2 = new GisNotSpatialFunction_attributes();
        this.gisFunction3 = new GisGeometryConstructor_attributes();
        this.gisFunction4 = new GisGeneralConstructor_attributes();
        this.gisFunction5 = new GisUnionAggregationFunction_attributes();
        this.gisFunction6 = new GisObjectiveFunction_attributes();
        this.literal = new Literal_attributes();
        this.namedArgFunc = new NamedArgFunc_attributes();
        this.session_user_function = new SessionUserFunction_attributes();
        this.userDefinedFunc = new UserDefinedFunction_attributes();
    }

    function QLPathStartRule_locals() {
        this.QLPath = new QLPath_attributes();
    }

    function CaseExpression_locals() {
        this.WhenConditionThenList = new WhenConditionThenList_attributes();
        this.WhenExpressionThenList = new WhenExpressionThenList_attributes();
        this.expr1 = new Expression_attributes();
        this.optElse = new Expression_attributes();
    }

    function WhenExpressionThenList_locals() {
        this.WhenExpressionThen = new WhenExpressionThen_attributes();
    }

    function WhenConditionThenList_locals() {
        this.WhenConditionThen = new WhenConditionThen_attributes();
    }

    function WhenExpressionThen_locals() {
        this.expr1 = new Expression_attributes();
        this.expr2 = new Expression_attributes();
    }

    function WhenConditionThen_locals() {
        this.cond1 = new Condition_attributes();
        this.expr1 = new Expression_attributes();
    }

    function NumberLiteral_locals() {
        this.int_lit = new IntLiteralWrapper_attributes();
        this.real_lit = new RealLiteral_attributes();
    }

    function Literal_locals() {
        this.binary_lit = new BinaryLiteral_attributes();
        this.bool_lit = new BooleanLiteral_attributes();
        this.date_lit = new DateLiteral_attributes();
        this.int_val = new IntLiteralWrapper_attributes();
        this.null_lit = new NullLiteral_attributes();
        this.real_lit = new RealLiteral_attributes();
        this.string_lit = new StringLiteralWrapper_attributes();
        this.time_lit = new TimeLiteral_attributes();
        this.timestamp_lit = new TimeStampLiteral_attributes();
    }

    function ExprAlias_locals() {
        this.e = new Expression_attributes();
        this.id = new IdWrapper_attributes();
    }

    function ExprAliasEnforced_locals() {
        this.e = new Expression_attributes();
        this.id = new IdWrapper_attributes();
    }

    function Agg_locals() {
        this.agg_all = new OptAll_attributes();
        this.agg_expr = new Expression_attributes();
        this.agg_expr2 = new Expression_attributes();
        this.agg_name = new AggName_attributes();
    }

    function NamedArgFunc_locals() {
        this.NamedArgumentList = new NamedArgumentList_attributes();
        this.expr = new NamedArgument_attributes();
        this.func_name = new NamedArgumentFuncName_attributes();
    }

    function NamedArgument_locals() {
        this.expr1 = new Expression_attributes();
        this.funcParam = null;
        this.proc_param_name = new IdWrapper_attributes();
    }

    function NamedArgumentList_locals() {
        this.expr = new NamedArgument_attributes();
        this.expr_n = new NamedArgument_attributes();
    }

    function GisNotSpatialFunction_locals() {
        this.expr = new Expression_attributes();
        this.func = null;
        this.gisFunctionName = new GisNotSpatialFunctionName_attributes();
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function GisGeometryConstructor_locals() {
        this.expr = new Expression_attributes();
        this.func = null;
        this.gisFunctionName = new GisGeometryConstructorName_attributes();
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function GisGeneralConstructor_locals() {
        this.expr = new Expression_attributes();
        this.func = null;
        this.gisFunctionName = new GisGeneralConstructorName_attributes();
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function GisObjectiveFunction_locals() {
        this.NamedArgumentList = new NamedArgumentList_attributes();
        this.arg = new NamedArgument_attributes();
        this.expr = new Expression_attributes();
        this.func = null;
        this.funcWithNamedParams = null;
        this.gisFunctionName = new GisObjectiveFunctionName_attributes();
        this.gisNamedParameterFunctionName = new GisObjectiveNamedParameterFunctionName_attributes();
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function GisObjectiveFunctionName_locals() {
        this.name = new GisObjectiveFunctionNameToken_attributes();
    }

    function GisUnionAggregationFunction_locals() {
        this.fname = new GisUnionAggregationFunctionName_attributes();
        this.func = null;
        this.path = new QLPath_attributes();
    }

    function Func_locals() {
        this.cast_function = new CastFunction_attributes();
        this.constish_func_name = new ConstishFuncName_attributes();
        this.day_name_function = new DayNameFunction_attributes();
        this.day_of_week_function = new DayOfWeekFunction_attributes();
        this.expr = new Expression_attributes();
        this.extract_function = new ExtractFunction_attributes();
        this.left_function = new LeftFunction_attributes();
        this.list = new ExpressionList_attributes();
        this.month_name_function = new MonthNameFunction_attributes();
        this.right_function = new RightFunction_attributes();
        this.simple_func_name = new SimpleFuncName_attributes();
        this.trim_function = new TrimFunction_attributes();
    }

    function UserDefinedFunction_locals() {
        this.expr = new Expression_attributes();
        this.list = new ExpressionList_attributes();
        this.udfFunctionName = new UserDefinedFunctionName_attributes();
    }

    function TrimFunction_locals() {
        this.expr1 = new Expression_attributes();
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
        this.remString1 = new Expression_attributes();
        this.trim_position = new TrimPosition_attributes();
    }

    function ExtractFunction_locals() {
        this.expr = new Expression_attributes();
        this.extract_spec = new ExtractSpec_attributes();
    }

    function CastFunction_locals() {
        this.cast_type_with_optional_length_param = new CastTypeWithOptionalLengthParam_attributes();
        this.cast_type_with_optional_params = new CastTypeWithOptionalParams_attributes();
        this.cast_type_without_params = new CastTypeWithoutParams_attributes();
        this.decimals = new Expression_attributes();
        this.expr = new Expression_attributes();
        this.length = new Expression_attributes();
        this.length_expr = new Expression_attributes();
    }

    function DayOfWeekFunction_locals() {
        this.expr = new Expression_attributes();
    }

    function LeftFunction_locals() {
        this.expr1 = new Expression_attributes();
        this.expr2 = new Expression_attributes();
    }

    function RightFunction_locals() {
        this.expr1 = new Expression_attributes();
        this.expr2 = new Expression_attributes();
    }

    function DayNameFunction_locals() {
        this.expr = new Expression_attributes();
    }

    function MonthNameFunction_locals() {
        this.expr = new Expression_attributes();
    }

    function RoundFunction_locals() {
        this.Expression = new Expression_attributes();
        this.RoundingMode = new RoundingMode_attributes();
        this.StringLiteralWrapper = new StringLiteralWrapper_attributes();
    }

    function SeriesFunction_locals() {
        this.expr = new Expression_attributes();
        this.literal = new Expression_attributes();
        this.maxValue = new Expression_attributes();
        this.minValue = new Expression_attributes();
        this.rm1 = new RoundingMode_attributes();
        this.rm2 = new RoundingMode_attributes();
        this.series_function_name = new SeriesFunctionName_attributes();
    }

    function annotationDefintionsWithAnnotation_locals() {
        this.annotations = new _PreAnnotations_attributes();
        this.definition = new AnnotationDeclaration_attributes();
    }

    function AnnotationDeclaration_locals() {
        this.name = new QualifiedDefId_attributes();
        this.type = new annotationTypeSpec_attributes();
    }

    function annotationTypeSpec_locals() {
        this.AnnotationTypeArray = new AnnotationTypeArray_attributes();
        this.AnnotationTypeNamedOrEnum = new AnnotationTypeNamedOrEnum_attributes();
        this.AnnotationTypeTypeOf = new AnnotationTypeTypeOf_attributes();
        this.type2 = new annotationStructuredType_attributes();
    }

    function AnnotationTypeTypeOf_locals() {
        this.id = new PathSimple_attributes();
    }

    function AnnotationTypeNamedOrEnum_locals() {
        this.AnnotationDefaultClause = new AnnotationDefaultClause_attributes();
        this.AnnotationTypeNamed = new AnnotationTypeNamed_attributes();
        this.enumeration = new annotationEnumClause_attributes();
    }

    function AnnotationDefaultClause_locals() {
        this.enumVal = new EnumIdWrapper_attributes();
        this.expr = new Expression_attributes();
    }

    function AnnotationTypeNamed_locals() {
        this.typeName = new AnnotationTypeName_attributes();
        this.val = new IntLiteralWrapper_attributes();
    }

    function AnnotationTypeSpecNoColon_locals() {
        this.AnnotationTypeNamedOrEnum = new AnnotationTypeNamedOrEnum_attributes();
        this.annotationStructuredType = new annotationStructuredType_attributes();
    }

    function AnnotationTypeArray_locals() {
        this.AnnotationTypeSpecNoColon = new AnnotationTypeSpecNoColon_attributes();
    }

    function AnnotationTypeName_locals() {
        this.typeName = new TypeName_attributes();
    }

    function annotationEnumClause_locals() {
        this.lit = new AnnotationLiteral_attributes();
        this.symbol = new IdWrapper_attributes();
    }

    function annotationStructuredType_locals() {
        this.name = new IdWrapper_attributes();
        this.type = new annotationTypeSpec_attributes();
    }


    // ----------- Actions

    function START_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    START_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    START_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.initializeParser();} // grammar line 100
            break;
        }
    }; // START_action.performAction()

    function START2_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new START2_locals(), BP, rule_info);
    }
    START2_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    START2_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.UsingDirectiveList.parentStatements = RESOLVER.compilationUnit.getStatements(); } // grammar line 116
            break;
            case 1: { this.m_locals.InPackageDeclaration.parent = RESOLVER.compilationUnit.getStatements(); } // grammar line 114
            break;
        }
    }; // START2_action.performAction()

    function START_SYNTAX_COLORING_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new START_SYNTAX_COLORING_locals(), BP, rule_info);
    }
    START_SYNTAX_COLORING_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    START_SYNTAX_COLORING_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = null; } // grammar line 131
            break;
        }
    }; // START_SYNTAX_COLORING_action.performAction()

    function NamespaceDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NamespaceDeclaration_locals(), BP, rule_info);
    }
    NamespaceDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamespaceDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.cdecl, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 148
            break;
            case 1: {this.m_result.cdecl = RESOLVER.createNamespace(this.m_locals.path);
         RESOLVER.setRootNamespace(this.m_result.cdecl);} // grammar line 145
            break;
            case 2: { this.m_locals.NamespacePath.path = this.m_locals.path; this.m_locals.NamespacePath.firstId = this.m_locals.id_1.res; } // grammar line 145
            break;
            case 3: {this.m_locals.path = RESOLVER.createPathDeclaration();} // grammar line 143
            break;
            case 4: { this.m_locals.path = null; } // grammar line 141
            break;
        }
    }; // NamespaceDeclaration_action.performAction()

    function InPackageDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new InPackageDeclaration_locals(), BP, rule_info);
    }
    InPackageDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    InPackageDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.inPackageDecl.endRule();} // grammar line 159
            break;
            case 1: {this.m_locals.inPackageDecl.attachChild(this.m_locals.path.res, "namePath");} // grammar line 157
            break;
            case 2: {this.m_locals.inPackageDecl.linkToParent(this.m_result.parent);} // grammar line 155
            break;
            case 3: { this.m_locals.inPackageDecl = RESOLVER.startRule("InPackageDeclaration"); } // grammar line 153
            break;
        }
    }; // InPackageDeclaration_action.performAction()

    function UsingDirectiveList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new UsingDirectiveList_locals(), BP, rule_info);
    }
    UsingDirectiveList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UsingDirectiveList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.parentStatements.push(this.m_locals.directive.res);} // grammar line 165
            break;
        }
    }; // UsingDirectiveList_action.performAction()

    function UsingDirective_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new UsingDirective_locals(), BP, rule_info);
    }
    UsingDirective_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UsingDirective_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
         this.m_result.res = RESOLVER.createUsingDirective(this.m_locals.path.res,this.m_locals.alias.res);
         RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
        } // grammar line 176
            break;
        }
    }; // UsingDirective_action.performAction()

    function UsingPath_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new UsingPath_locals(), BP, rule_info);
    }
    UsingPath_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UsingPath_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.path1.res;} // grammar line 187
            break;
            case 1: {this.m_result.res = this.m_locals.path2.res;} // grammar line 188
            break;
        }
    }; // UsingPath_action.performAction()

    function TopLevelDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TopLevelDeclaration_locals(), BP, rule_info);
    }
    TopLevelDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TopLevelDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.MainArtifactDefinition.annotations = this.m_locals.annotations.res; this.m_locals.MainArtifactDefinition.parentStatements = RESOLVER.compilationUnit.getStatements(); } // grammar line 200
            break;
            case 1: { this.m_locals.AccessPolicyDeclaration.annots = this.m_locals.annotations.res; this.m_locals.AccessPolicyDeclaration.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 201
            break;
            case 2: { this.m_locals.ExtensionPackageDefinition.parent = RESOLVER.compilationUnit.getStatements(); } // grammar line 202
            break;
            case 3: { this.m_locals.ExtendStatement.annotations = this.m_locals.annotations.res; this.m_locals.ExtendStatement.parentStatements = RESOLVER.compilationUnit.getStatements(); } // grammar line 205
            break;
        }
    }; // TopLevelDeclaration_action.performAction()

    function ExtensionPackageDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExtensionPackageDefinition_locals(), BP, rule_info);
    }
    ExtensionPackageDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExtensionPackageDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lit_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.extensionPackageDefinition.endRule();} // grammar line 225
            break;
            case 1: {depends.endRule();} // grammar line 222
            break;
            case 2: {depends.attachChild(this.m_locals.next.res);} // grammar line 219
            break;
            case 3: {depends.attachChild(this.m_locals.first.res);} // grammar line 218
            break;
            case 5: {var depends = RESOLVER.startArrayRule("DependsOnPaths");} // grammar line 215
            {this.m_locals.extensionPackageDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _lit_index), depends), "dependsOnPaths" );} // grammar line 216
            break;
            case 6: {this.m_locals.extensionPackageDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _lit_index),this.m_locals.name.res), "packageName" ); } // grammar line 213
            break;
            case 7: {this.m_locals.extensionPackageDefinition.linkToParent(this.m_result.parent);} // grammar line 212
            break;
            case 8: { this.m_locals.extensionPackageDefinition = RESOLVER.startRule("ExtensionPackageDefinition"); } // grammar line 210
            break;
        }
    }; // ExtensionPackageDefinition_action.performAction()

    function ExtendStatement_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExtendStatement_locals(), BP, rule_info);
    }
    ExtendStatement_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExtendStatement_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lit_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.extend.res.endRule();} // grammar line 254
            break;
            case 1: { this.m_locals.MainArtifactList.parentStatements = this.m_locals.extend.res.getStatements(); } // grammar line 239
            break;
            case 2: {this.m_locals.extend.res.setNamePath(this.m_locals.p.res);} // grammar line 236
            break;
            case 3: { this.m_locals.extend.startIndex = this.m_locals.startIndex; this.m_locals.extend.introTok = rnd.Parser.getTok(RESOLVER, this, _lit_index); this.m_locals.extend.ruleName = "ContextExtend"; this.m_locals.extend.baseClass = commonddl.ContextDeclarationImpl; this.m_locals.extend.annotations = this.m_result.annotations; this.m_locals.extend.parentStatements = this.m_result.parentStatements; } // grammar line 234
            break;
            case 4: { this.m_locals.ElementDefExtList.parent = this.m_locals.extend.res; } // grammar line 250
            break;
            case 5: {this.m_locals.extend.res.setNamePath(this.m_locals.p.res);} // grammar line 247
            break;
            case 6: { this.m_locals.extend.startIndex = this.m_locals.startIndex; this.m_locals.extend.introTok = rnd.Parser.getTok(RESOLVER, this, _lit_index); this.m_locals.extend.ruleName = "EntityExtend"; this.m_locals.extend.baseClass = commonddl.EntityDeclarationImpl; this.m_locals.extend.annotations = this.m_result.annotations; this.m_locals.extend.parentStatements = this.m_result.parentStatements; } // grammar line 243
            break;
            case 7: { this.m_locals.extend.startIndex = this.m_locals.startIndex; this.m_locals.extend.introTok = rnd.Parser.getTok(RESOLVER, this, _lit_index); this.m_locals.extend.ruleName = "TypeExtend"; this.m_locals.extend.baseClass = commonddl.TypeDeclarationImpl; this.m_locals.extend.annotations = this.m_result.annotations; this.m_locals.extend.parentStatements = this.m_result.parentStatements; } // grammar line 244
            break;
            case 8: { this.m_locals.startIndex = RESOLVER.getNextTokenIndex(); } // grammar line 229
            break;
        }
    }; // ExtendStatement_action.performAction()

    function __createExtend_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new __createExtend_locals(), BP, rule_info);
    }
    __createExtend_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    __createExtend_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 6: { this.m_locals.extend = RESOLVER.startRule(this.m_result.ruleName, this.m_result.baseClass); } // grammar line 260
            {this.m_locals.extend.isExtend = true;} // grammar line 262
            {this.m_locals.extend.setStartTokenIndex(this.m_result.startIndex);} // grammar line 263
            {this.m_locals.extend.setNameToken(this.m_result.introTok);} // grammar line 264
            {RESOLVER.addAnnotations(this.m_locals.extend,this.m_result.annotations);} // grammar line 265
            {this.m_locals.extend.linkToParent(this.m_result.parentStatements);} // grammar line 266
            {this.m_result.res = this.m_locals.extend;} // grammar line 268
            break;
        }
    }; // __createExtend_action.performAction()

    function MainArtifactList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new MainArtifactList_locals(), BP, rule_info);
    }
    MainArtifactList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    MainArtifactList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.MainArtifactDefinition.annotations = this.m_locals.annotations.res; this.m_locals.MainArtifactDefinition.parentStatements = this.m_result.parentStatements; } // grammar line 281
            break;
            case 1: { this.m_locals.ExtendStatement.annotations = this.m_locals.annotations.res; this.m_locals.ExtendStatement.parentStatements = this.m_result.parentStatements; } // grammar line 282
            break;
        }
    }; // MainArtifactList_action.performAction()

    function _PreAnnotations_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new _PreAnnotations_locals(), BP, rule_info);
    }
    _PreAnnotations_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    _PreAnnotations_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.collectPreAnnotation(this.m_result.res, this.m_locals.annotation.res);} // grammar line 291
            break;
            case 1: {this.m_result.res = RESOLVER.createPreAnnotationList();} // grammar line 290
            break;
        }
    }; // _PreAnnotations_action.performAction()

    function ContextDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ContextDeclaration_locals(), BP, rule_info);
    }
    ContextDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ContextDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res, RESOLVER.getLastMatchedTokenIndex());} // grammar line 309
            break;
            case 2: {
            this.m_result.res = RESOLVER.createContext(this.m_locals.id.res);
            RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), -1);
            RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
            if (this.m_result.parentStmts != null) {
             this.m_result.parentStmts.push(this.m_result.res);
            }
           } // grammar line 300
            { this.m_locals.MainArtifactList.parentStatements = this.m_result.res.getStatements(); } // grammar line 308
            break;
        }
    }; // ContextDeclaration_action.performAction()

    function MainArtifactDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new MainArtifactDefinition_locals(), BP, rule_info);
    }
    MainArtifactDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    MainArtifactDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.ContextDeclaration.annots = this.m_result.annotations; this.m_locals.ContextDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 317
            break;
            case 1: { this.m_locals.TypeDeclaration.annots = this.m_result.annotations; this.m_locals.TypeDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 318
            break;
            case 2: { this.m_locals.EntityDeclaration.annots = this.m_result.annotations; this.m_locals.EntityDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 319
            break;
            case 3: { this.m_locals.ViewDeclaration.annots = this.m_result.annotations; this.m_locals.ViewDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 320
            break;
            case 4: { this.m_locals.ConstDeclaration.annots = this.m_result.annotations; this.m_locals.ConstDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 321
            break;
            case 5: { this.m_locals.AnnotationDeclaration.annots = this.m_result.annotations; this.m_locals.AnnotationDeclaration.parentStmts = this.m_result.parentStatements; } // grammar line 322
            break;
        }
    }; // MainArtifactDefinition_action.performAction()

    function AccessPolicyDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AccessPolicyDeclaration_locals(), BP, rule_info);
    }
    AccessPolicyDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AccessPolicyDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_locals.res,RESOLVER.getLastMatchedTokenIndex());} // grammar line 342
            break;
            case 1: { this.m_locals.AccessPolicyComponentDeclaration.parent = this.m_locals.res; } // grammar line 340
            break;
            case 2: {
         this.m_locals.res = RESOLVER.createAccessPolicy(this.m_locals.id.res);
         this.m_result.parentStmts.push(this.m_locals.res);
         RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.res,this.getFirstTokenIndex(),-1);
         RESOLVER.addAnnotations(this.m_locals.res,this.m_result.annots);
        } // grammar line 333
            break;
            case 3: { this.m_locals.res = null; } // grammar line 329
            break;
        }
    }; // AccessPolicyDeclaration_action.performAction()

    function AccessPolicyComponentDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AccessPolicyComponentDeclaration_locals(), BP, rule_info);
    }
    AccessPolicyComponentDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AccessPolicyComponentDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.RoleDeclaration.preAnnotations = this.m_locals.annotations.res; this.m_locals.RoleDeclaration.statementContainer = this.m_result.parent; } // grammar line 354
            break;
            case 1: { this.m_locals.AspectDeclaration.preAnnotations = this.m_locals.annotations.res; this.m_locals.AspectDeclaration.statementContainer = this.m_result.parent; this.m_locals.AspectDeclaration.role = null; } // grammar line 355
            break;
        }
    }; // AccessPolicyComponentDeclaration_action.performAction()

    function RoleDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RoleDeclaration_locals(), BP, rule_info);
    }
    RoleDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RoleDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_locals.role,RESOLVER.getLastMatchedTokenIndex());} // grammar line 375
            break;
            case 1: { this.m_locals.RuleDeclaration.role = this.m_locals.role; } // grammar line 373
            break;
            case 2: {
        this.m_locals.role = RESOLVER.createRole(this.m_locals.id.res);
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.role,this.getFirstTokenIndex(),-1);
        RESOLVER.addAnnotations(this.m_locals.role,this.m_result.preAnnotations);
        if (this.m_result.statementContainer != null) {
         this.m_result.statementContainer.getStatements().push(this.m_locals.role);
        }
       } // grammar line 364
            break;
            case 3: { this.m_locals.role = null; } // grammar line 360
            break;
        }
    }; // RoleDeclaration_action.performAction()

    function RuleDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RuleDeclaration_locals(), BP, rule_info);
    }
    RuleDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RuleDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.rule.parent = this.m_result.role; this.m_locals.rule.startIndex = this.m_locals.startIndex; } // grammar line 384
            break;
            case 1: { this.m_locals.incl.parent = this.m_result.role; } // grammar line 385
            break;
            case 2: { this.m_locals.a_decl.preAnnotations = null; this.m_locals.a_decl.statementContainer = null; this.m_locals.a_decl.role = this.m_result.role; } // grammar line 390
            break;
            case 3: { this.m_locals.startIndex = RESOLVER.getNextTokenIndex(); } // grammar line 380
            break;
        }
    }; // RuleDeclaration_action.performAction()

    function RuleIncludedRole_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RuleIncludedRole_locals(), BP, rule_info);
    }
    RuleIncludedRole_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RuleIncludedRole_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.includedRole, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 404
            break;
            case 1: {
       this.m_locals.includedRole = RESOLVER.createIncludedRole(this.m_locals.role.res);
       if (this.m_result.parent != null) {
        this.m_result.parent.getEntries().push(this.m_locals.includedRole);
       }
      } // grammar line 398
            break;
            case 2: { this.m_locals.includedRole = null; } // grammar line 395
            break;
        }
    }; // RuleIncludedRole_action.performAction()

    function RuleSubquery_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RuleSubquery_locals(), BP, rule_info);
    }
    RuleSubquery_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RuleSubquery_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.rule,this.m_result.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 422
            break;
            case 1: {this.m_locals.rule.setWhere(this.m_locals.where.res);} // grammar line 420
            break;
            case 2: { this.m_locals.where.select = null; } // grammar line 420
            break;
            case 5: { this.m_locals.rule = null; } // grammar line 410
            {
          this.m_locals.rule = RESOLVER.createRule();
          RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.rule, this.m_result.startIndex, -1);
          if (this.m_result.parent != null) {
           this.m_result.parent.getEntries().push(this.m_locals.rule);
          }
         } // grammar line 412
            { this.m_locals.RuleFromClause.rule = this.m_locals.rule; } // grammar line 419
            break;
        }
    }; // RuleSubquery_action.performAction()

    function RuleFromClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RuleFromClause_locals(), BP, rule_info);
    }
    RuleFromClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RuleFromClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _on_index = 1;
        var _sel1_index = 2;
        var _sel2_index = 3;
        switch (_action_num) {
            case 0: {this.m_locals.from.setDataSource( RESOLVER.viewparser_tableDatasource(this.m_locals.path1.res) );} // grammar line 435
            break;
            case 1: {this.m_locals.from = RESOLVER.createPrefixRuleFromClause(rnd.Parser.getTok(RESOLVER, this, _sel1_index),rnd.Parser.getTok(RESOLVER, this, _on_index));
        this.m_result.rule.setFrom(this.m_locals.from);} // grammar line 433
            break;
            case 2: {
        this.m_locals.from = RESOLVER.createPostfixRuleFromClause(rnd.Parser.getTok(RESOLVER, this, _sel2_index));
        this.m_result.rule.setFrom(this.m_locals.from);
        this.m_locals.from.setDataSource( RESOLVER.viewparser_tableDatasource(this.m_locals.path2.res) );
       } // grammar line 442
            break;
            case 3: { this.m_locals.from = null; } // grammar line 428
            break;
        }
    }; // RuleFromClause_action.performAction()

    function AspectDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AspectDeclaration_locals(), BP, rule_info);
    }
    AspectDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AspectDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_locals.aspect,RESOLVER.getLastMatchedTokenIndex());} // grammar line 468
            break;
            case 1: { this.m_locals.QLSubqueryElementary.parent = this.m_locals.aspect; this.m_locals.QLSubqueryElementary.parentSelectSet = null; } // grammar line 467
            break;
            case 2: {
           this.m_locals.aspect = RESOLVER.createAspect(this.m_locals.id.res);
           RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.aspect, this.getFirstTokenIndex(), -1);
           RESOLVER.addAnnotations(this.m_locals.aspect,this.m_result.preAnnotations);
           if (this.m_result.statementContainer != null) {
            this.m_result.statementContainer.getStatements().push(this.m_locals.aspect);
           }else if (this.m_result.role != null) {
            this.m_result.role.getEntries().push(this.m_locals.aspect);
           }
          } // grammar line 456
            break;
            case 3: { this.m_locals.aspect = null; } // grammar line 452
            break;
        }
    }; // AspectDeclaration_action.performAction()

    function EntityDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new EntityDeclaration_locals(), BP, rule_info);
    }
    EntityDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    EntityDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _temp_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res,RESOLVER.getLastMatchedTokenIndex());} // grammar line 503
            break;
            case 1: { this.m_locals.TechnicalConfiguration.parentNode = this.m_result.res; } // grammar line 501
            break;
            case 2: { this.m_locals.SeriesDefinition.parentNode = this.m_result.res; } // grammar line 497
            break;
            case 3: { this.m_locals.IndexDefinition.parentNode = this.m_result.res; } // grammar line 495
            break;
            case 5: {
            this.m_result.res = RESOLVER.createEntity(this.m_locals.id.res);
            if(this.m_locals.temporary) {
             this.m_result.res.temporary = rnd.Parser.getTok(RESOLVER, this, _temp_index);
            }
            if (this.m_result.parentStmts != null) {
             this.m_result.parentStmts.push(this.m_result.res);
            }
            RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(),-1);
            RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
           } // grammar line 482
            { this.m_locals.AnnotatedElementDeclarationLoop.res = this.m_result.res; } // grammar line 493
            break;
            case 6: {this.m_locals.temporary=true;} // grammar line 476
            break;
            case 7: { this.m_locals.temporary = false; } // grammar line 474
            break;
        }
    }; // EntityDeclaration_action.performAction()

    function TechnicalConfiguration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TechnicalConfiguration_locals(), BP, rule_info);
    }
    TechnicalConfiguration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TechnicalConfiguration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.technicalConfiguration.endRule();} // grammar line 532
            break;
            case 3: {this.m_locals.indexDefinitions.endRule();} // grammar line 528
            {this.m_locals.fulltextIndexDefinitions.endRule();} // grammar line 529
            {this.m_locals.fuzzyIndexDefinitions.endRule();} // grammar line 530
            break;
            case 4: { this.m_locals.StoreDefinition.parent = this.m_locals.technicalConfiguration; } // grammar line 520
            break;
            case 5: { this.m_locals.IndexDefinition.parentNode = this.m_locals.indexDefinitions; } // grammar line 521
            break;
            case 6: { this.m_locals.FulltextIndexDefinition.parent = this.m_locals.fulltextIndexDefinitions; } // grammar line 522
            break;
            case 7: { this.m_locals.FuzzyIndexDefinition.parent = this.m_locals.fuzzyIndexDefinitions; } // grammar line 523
            break;
            case 8: { this.m_locals.PartitionDefinition.parent = this.m_locals.technicalConfiguration; } // grammar line 524
            break;
            case 9: { this.m_locals.TableGroupDefinition.parent = this.m_locals.technicalConfiguration; } // grammar line 525
            break;
            case 10: { this.m_locals.TableUnloadDefinition.parent = this.m_locals.technicalConfiguration; } // grammar line 526
            break;
            case 11: {this.m_locals.technicalConfiguration.linkToParent(this.m_result.parentNode);} // grammar line 516
            break;
            case 12: { this.m_locals.technicalConfiguration = RESOLVER.startRule("TechnicalConfiguration");
  this.m_locals.indexDefinitions = RESOLVER.startArrayRule("IndexDefinitions", this.m_locals.technicalConfiguration);
  this.m_locals.fulltextIndexDefinitions = RESOLVER.startArrayRule("FulltextIndexDefinitions", this.m_locals.technicalConfiguration);
  this.m_locals.fuzzyIndexDefinitions = RESOLVER.startArrayRule("FuzzyIndexDefinitions", this.m_locals.technicalConfiguration);
} // grammar line 508
            break;
        }
    }; // TechnicalConfiguration_action.performAction()

    function StoreDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new StoreDefinition_locals(), BP, rule_info);
    }
    StoreDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    StoreDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _columnStore_index = 2;
        var _rowStore_index = 1;
        switch (_action_num) {
            case 1: {this.m_locals.storeDefinition.linkToParent(this.m_result.parent);} // grammar line 542
            {this.m_locals.storeDefinition.endRule();} // grammar line 544
            break;
            case 2: {this.m_locals.storeDefinition.rowStore = rnd.Parser.getTok(RESOLVER, this, _rowStore_index);} // grammar line 539
            break;
            case 3: {this.m_locals.storeDefinition.columnStore = rnd.Parser.getTok(RESOLVER, this, _columnStore_index);} // grammar line 540
            break;
            case 4: { this.m_locals.storeDefinition = RESOLVER.startRule("StoreDefinition"); } // grammar line 536
            break;
        }
    }; // StoreDefinition_action.performAction()

    function IndexDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new IndexDefinition_locals(), BP, rule_info);
    }
    IndexDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    IndexDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _index_index = 1;
        var _unique_index = 2;
        switch (_action_num) {
            case 0: {this.m_locals.indexDefinition.endRule();} // grammar line 568
            break;
            case 1: {this.m_locals.indexDefinition.order = this.m_locals.order.res;} // grammar line 566
            break;
            case 2: {this.m_locals.onPaths.endRule();} // grammar line 563
            break;
            case 3: {this.m_locals.onPaths.attachChild(this.m_locals.p.res);} // grammar line 561
            break;
            case 4: {this.m_locals.onPaths.attachChild(this.m_locals.p.res);} // grammar line 560
            break;
            case 5: {this.m_locals.onPaths = RESOLVER.startArrayRule("onPathWithOrders", this.m_locals.indexDefinition, true);} // grammar line 558
            break;
            case 6: {this.m_locals.indexDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _index_index),this.m_locals.name.res), "index");} // grammar line 556
            break;
            case 7: {this.m_locals.indexDefinition.linkToParent(this.m_result.parentNode);} // grammar line 554
            break;
            case 8: {this.m_locals.indexDefinition.unique = rnd.Parser.getTok(RESOLVER, this, _unique_index);} // grammar line 551
            break;
            case 9: { this.m_locals.indexDefinition = RESOLVER.startRule("IndexDefinition");
  this.m_locals.onPaths = null; } // grammar line 548
            break;
        }
    }; // IndexDefinition_action.performAction()

    function PathWithOrder_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathWithOrder_locals(), BP, rule_info);
    }
    PathWithOrder_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathWithOrder_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.id1.res;} // grammar line 575
            break;
        }
    }; // PathWithOrder_action.performAction()

    function FulltextIndexDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new FulltextIndexDefinition_locals(), BP, rule_info);
    }
    FulltextIndexDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FulltextIndexDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _on_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.fulltextIndexDefinition.endRule();} // grammar line 593
            break;
            case 1: {this.m_locals.params.endRule();} // grammar line 590
            break;
            case 2: { this.m_locals.FulltextIndexParameters.parent = this.m_locals.params; } // grammar line 589
            break;
            case 4: {this.m_locals.fulltextIndexDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _on_index),this.m_locals.column.res), "onColumn" );} // grammar line 586
            {this.m_locals.params = RESOLVER.startArrayRule("FulltextIndexParameters", this.m_locals.fulltextIndexDefinition);} // grammar line 588
            break;
            case 5: {this.m_locals.fulltextIndexDefinition.name = this.m_locals.name.res;} // grammar line 584
            break;
            case 6: {this.m_locals.fulltextIndexDefinition.linkToParent(this.m_result.parent);} // grammar line 582
            break;
            case 7: { this.m_locals.fulltextIndexDefinition = RESOLVER.startRule("FulltextIndexDefinition");
  this.m_locals.params = null; } // grammar line 579
            break;
        }
    }; // FulltextIndexDefinition_action.performAction()

    function FulltextIndexParameters_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new FulltextIndexParameters_locals(), BP, rule_info);
    }
    FulltextIndexParameters_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FulltextIndexParameters_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _det_index = 2;
        var _lex_index = 1;
        var _tm_index = 3;
        var _tmc_index = 4;
        switch (_action_num) {
            case 0: {this.m_locals.param.endRule();} // grammar line 645
            break;
            case 1: {this.m_locals.tav.setValue(this.m_locals.pval.res);} // grammar line 607
            break;
            case 2: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "languageColumn");} // grammar line 607
            break;
            case 3: {this.m_locals.detectionArgs.endRule();} // grammar line 617
            break;
            case 4: {this.m_locals.detectionArgs.attachChild(this.m_locals.l.res);} // grammar line 614
            break;
            case 5: {this.m_locals.detectionArgs.attachChild(this.m_locals.l.res);} // grammar line 613
            break;
            case 8: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _det_index), "languageDetection");} // grammar line 609
            {this.m_locals.detectionArgs = RESOLVER.startArrayRule("detectionArguments");} // grammar line 610
            {this.m_locals.tav.setValue(this.m_locals.detectionArgs);} // grammar line 611
            break;
            case 9: {this.m_locals.tav.setValue(this.m_locals.sval.res);} // grammar line 622
            break;
            case 10: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "mimeType");} // grammar line 622
            break;
            case 11: {this.m_locals.tav.setValue(this.m_locals.pval.res);} // grammar line 623
            break;
            case 12: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "mimeTypeColumn");} // grammar line 623
            break;
            case 13: {this.m_locals.tav.setValue(this.m_locals.fval.res);} // grammar line 626
            break;
            case 14: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "fuzzySearchIndex");} // grammar line 626
            break;
            case 15: {this.m_locals.tav.setValue(this.m_locals.nval.res);} // grammar line 627
            break;
            case 16: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "phraseIndexRatio");} // grammar line 627
            break;
            case 17: {this.m_locals.tav.setValue(this.m_locals.sval.res);} // grammar line 628
            break;
            case 18: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "configuration");} // grammar line 628
            break;
            case 19: {this.m_locals.tav.setValue(this.m_locals.fval.res);} // grammar line 629
            break;
            case 20: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "searchOnly");} // grammar line 629
            break;
            case 21: {this.m_locals.tav.setValue(this.m_locals.fval.res);} // grammar line 630
            break;
            case 22: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "fastPreprocess");} // grammar line 630
            break;
            case 23: {this.m_locals.tav.setValue(this.m_locals.sval.res);} // grammar line 631
            break;
            case 24: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "tokenSeparators");} // grammar line 631
            break;
            case 25: {this.m_locals.tav.setValue(this.m_locals.fval.res);} // grammar line 634
            break;
            case 26: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "textAnalysis");} // grammar line 634
            break;
            case 27: {this.m_locals.tav.setValue(this.m_locals.tmTok.res);} // grammar line 637
            break;
            case 28: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _tm_index), "textMining");} // grammar line 637
            break;
            case 29: {this.m_locals.tav.setValue(this.m_locals.tmCfg.res);} // grammar line 638
            break;
            case 30: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _tmc_index), "textMiningConfiguration");} // grammar line 638
            break;
            case 31: {this.m_locals.param.linkToParent(this.m_result.parent);} // grammar line 642
            break;
            case 32: { this.m_locals.FullTextChangeTracking.parent = this.m_locals.param; } // grammar line 642
            break;
            case 33: { this.m_locals.param = RESOLVER.startRule("FulltextIndexParameter");
  this.m_locals.detectionArgs = null;
  this.m_locals.tav = RESOLVER.prepareTokenAndValue(this.m_locals.param, this.m_result.parent);
  } // grammar line 599
            break;
        }
    }; // FulltextIndexParameters_action.performAction()

    function FullTextChangeTracking_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new FullTextChangeTracking_locals(), BP, rule_info);
    }
    FullTextChangeTracking_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FullTextChangeTracking_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lex_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.tracking.endRule();} // grammar line 657
            break;
            case 1: {this.m_locals.tracking.synchronous = rnd.Parser.getTok(RESOLVER, this, _lex_index); this.m_locals.tracking.linkToParent(this.m_result.parent);} // grammar line 654
            break;
            case 2: {this.m_locals.tav.setValue(this.m_locals.asyncSpec.res);} // grammar line 655
            break;
            case 3: {this.m_locals.tav.setToken(rnd.Parser.getTok(RESOLVER, this, _lex_index), "asynchronous");} // grammar line 655
            break;
            case 4: { this.m_locals.tracking = RESOLVER.startRule("FullTextChangeTracking");
  this.m_locals.tav = RESOLVER.prepareTokenAndValue(this.m_locals.tracking, this.m_result.parent);
  } // grammar line 649
            break;
        }
    }; // FullTextChangeTracking_action.performAction()

    function AsyncSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AsyncSpec_locals(), BP, rule_info);
    }
    AsyncSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AsyncSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _after1_index = 1;
        var _after2_index = 3;
        var _every_index = 2;
        var _flush_index = 5;
        var _queue_index = 4;
        switch (_action_num) {
            case 0: {this.m_locals.asyncSpec.endRule();} // grammar line 683
            break;
            case 1: {this.m_locals.asyncSpec.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _after1_index),this.m_locals.m1.res), "orAfterDocuments" );} // grammar line 676
            break;
            case 2: {this.m_locals.asyncSpec.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _every_index),this.m_locals.n.res), "everyMinutes" );} // grammar line 672
            break;
            case 3: {this.m_locals.asyncSpec.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _after2_index),this.m_locals.m2.res), "afterDocuments" );} // grammar line 680
            break;
            case 4: {this.m_locals.asyncSpec.queue = rnd.Parser.getTok(RESOLVER, this, _queue_index);} // grammar line 667
            break;
            case 6: {this.m_locals.asyncSpec.flush = rnd.Parser.getTok(RESOLVER, this, _flush_index);} // grammar line 664
            {this.m_result.res = this.m_locals.asyncSpec;} // grammar line 665
            break;
            case 7: { this.m_locals.asyncSpec = RESOLVER.startRule("AsyncSpec"); } // grammar line 661
            break;
        }
    }; // AsyncSpec_action.performAction()

    function FTI_ON_OFF_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    FTI_ON_OFF_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FTI_ON_OFF_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _off_index = 2;
        var _on_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res=rnd.Parser.getTok(RESOLVER, this, _on_index);} // grammar line 688
            break;
            case 1: {this.m_result.res=rnd.Parser.getTok(RESOLVER, this, _off_index);} // grammar line 689
            break;
        }
    }; // FTI_ON_OFF_action.performAction()

    function FuzzyIndexDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new FuzzyIndexDefinition_locals(), BP, rule_info);
    }
    FuzzyIndexDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FuzzyIndexDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _indexOn_index = 2;
        var _mode_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.fuzzyIndexDefinition.endRule();} // grammar line 703
            break;
            case 1: {this.m_locals.fuzzyIndexDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _mode_index), this.m_locals.l1.res), "searchMode" );} // grammar line 700
            break;
            case 2: {this.m_locals.fuzzyIndexDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _indexOn_index), this.m_locals.column.res), "onColumn" );} // grammar line 697
            break;
            case 3: {this.m_locals.fuzzyIndexDefinition.linkToParent(this.m_result.parent);} // grammar line 695
            break;
            case 4: { this.m_locals.fuzzyIndexDefinition = RESOLVER.startRule("FuzzyIndexDefinition");} // grammar line 693
            break;
        }
    }; // FuzzyIndexDefinition_action.performAction()

    function SeriesDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new SeriesDefinition_locals(), BP, rule_info);
    }
    SeriesDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SeriesDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _alternatePeriodForSeriesLexem_index = 12;
        var _equidistantIncrementBy_index = 5;
        var _maxValueLexem_index = 10;
        var _minValueLexem_index = 8;
        var _missingElementsAllowed_index = 3;
        var _missingElementsNotAllowed_index = 4;
        var _noMaxValue_index = 9;
        var _noMinValue_index = 7;
        var _notEquidistant_index = 2;
        var _periodForSeriesLexem_index = 11;
        var _piecewise_index = 6;
        var _seriesKey_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.seriesDefinition.endRule();} // grammar line 774
            break;
            case 1: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _seriesKey_index),this.m_locals.keyList.res), "seriesKey" );} // grammar line 716
            break;
            case 2: {this.m_locals.seriesDefinition.notEquidistant = rnd.Parser.getTok(RESOLVER, this, _notEquidistant_index);} // grammar line 720
            break;
            case 3: {this.m_locals.seriesDefinition.equidistantIncrement.missingElementsAllowed = rnd.Parser.getTok(RESOLVER, this, _missingElementsAllowed_index); } // grammar line 732
            break;
            case 4: {this.m_locals.seriesDefinition.equidistantIncrement.missingElementsNotAllowed = rnd.Parser.getTok(RESOLVER, this, _missingElementsNotAllowed_index); } // grammar line 735
            break;
            case 5: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _equidistantIncrementBy_index),this.m_locals.seriesDistance.res), "equidistantIncrement" );} // grammar line 726
            break;
            case 6: {this.m_locals.seriesDefinition.equidistantPiecewise = rnd.Parser.getTok(RESOLVER, this, _piecewise_index);} // grammar line 740
            break;
            case 7: {this.m_locals.seriesDefinition.noMinValue = rnd.Parser.getTok(RESOLVER, this, _noMinValue_index);} // grammar line 746
            break;
            case 8: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _minValueLexem_index),this.m_locals.minValue.res), "minValue" );} // grammar line 749
            break;
            case 9: {this.m_locals.seriesDefinition.noMaxValue = rnd.Parser.getTok(RESOLVER, this, _noMaxValue_index);} // grammar line 754
            break;
            case 10: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _maxValueLexem_index),this.m_locals.maxValue.res), "maxValue" );} // grammar line 757
            break;
            case 11: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _periodForSeriesLexem_index),this.m_locals.periodForSeries.res), "periodForSeries" );} // grammar line 763
            break;
            case 12: {this.m_locals.seriesDefinition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _alternatePeriodForSeriesLexem_index),this.m_locals.alternatePeriodForSeries.res), "alternatePeriodForSeries" );} // grammar line 769
            break;
            case 13: {this.m_locals.seriesDefinition.linkToParent(this.m_result.parentNode);} // grammar line 710
            break;
            case 14: { this.m_locals.seriesDefinition = RESOLVER.startRule("SeriesDefinition"); } // grammar line 707
            break;
        }
    }; // SeriesDefinition_action.performAction()

    function KeyList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new KeyList_locals(), BP, rule_info);
    }
    KeyList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    KeyList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.keyList;} // grammar line 783
            {this.m_locals.keyList.endRule();} // grammar line 785
            break;
            case 2: {this.m_locals.keyList.attachChild(this.m_locals.idn.res);} // grammar line 781
            break;
            case 3: {this.m_locals.keyList.attachChild(this.m_locals.id1.res);} // grammar line 780
            break;
            case 4: { this.m_locals.keyList = RESOLVER.startArrayRule("KeyList"); } // grammar line 778
            break;
        }
    }; // KeyList_action.performAction()

    function SeriesDistance_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new SeriesDistance_locals(), BP, rule_info);
    }
    SeriesDistance_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SeriesDistance_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _day_index = 3;
        var _hour_index = 4;
        var _minute_index = 5;
        var _month_index = 2;
        var _second_index = 6;
        var _year_index = 1;
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.distance;} // grammar line 804
            {this.m_locals.distance.endRule();} // grammar line 805
            break;
            case 2: {this.m_locals.distance.number = this.m_locals.num.res;} // grammar line 792
            break;
            case 3: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _year_index), this.m_locals.val.res), "yearInterval" );} // grammar line 796
            break;
            case 4: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _month_index), this.m_locals.val.res), "monthInterval" );} // grammar line 797
            break;
            case 5: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _day_index), this.m_locals.val.res), "dayInterval" );} // grammar line 798
            break;
            case 6: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _hour_index), this.m_locals.val.res), "hourInterval" );} // grammar line 799
            break;
            case 7: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _minute_index),this.m_locals.val.res), "minuteInterval" );} // grammar line 800
            break;
            case 8: {this.m_locals.distance.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _second_index),this.m_locals.val.res), "secondInterval" );} // grammar line 801
            break;
            case 9: { this.m_locals.distance = RESOLVER.startRule("SeriesDistance"); } // grammar line 789
            break;
        }
    }; // SeriesDistance_action.performAction()

    function TableUnloadDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TableUnloadDefinition_locals(), BP, rule_info);
    }
    TableUnloadDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TableUnloadDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _prioLex_index = 1;
        switch (_action_num) {
            case 2: {this.m_locals.definition.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _prioLex_index),this.m_locals.prioVal.res), "unloadPriority" );} // grammar line 812
            {this.m_locals.definition.linkToParent(this.m_result.parent);} // grammar line 814
            {this.m_locals.definition.endRule();} // grammar line 815
            break;
            case 3: { this.m_locals.definition = RESOLVER.startRule("TableUnloadDefinition"); } // grammar line 809
            break;
        }
    }; // TableUnloadDefinition_action.performAction()

    function TableGroupDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TableGroupDefinition_locals(), BP, rule_info);
    }
    TableGroupDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TableGroupDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.specs.endRule();} // grammar line 824
            {this.m_locals.definition.endRule();} // grammar line 825
            break;
            case 2: { this.m_locals.TableGroupSpec.parent = this.m_locals.specs; } // grammar line 822
            break;
            case 3: { this.m_locals.definition = RESOLVER.startRule("TableGroupDefinition");
  this.m_locals.specs = RESOLVER.startArrayRule("TableGroupSpecs", this.m_locals.definition); } // grammar line 819
            break;
        }
    }; // TableGroupDefinition_action.performAction()

    function TableGroupSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TableGroupSpec_locals(), BP, rule_info);
    }
    TableGroupSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TableGroupSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _name_index = 1;
        var _subtype_index = 3;
        var _type_index = 2;
        switch (_action_num) {
            case 1: {this.m_locals.spec.attachChild( RESOLVER.tokenAndValue(this.m_locals.tok,this.m_locals.id.res), this.m_locals.attribute );} // grammar line 839
            {this.m_locals.spec.endRule();} // grammar line 841
            break;
            case 2: {this.m_locals.attribute = "groupName"; this.m_locals.tok=rnd.Parser.getTok(RESOLVER, this, _name_index);} // grammar line 835
            break;
            case 3: {this.m_locals.attribute = "groupType"; this.m_locals.tok=rnd.Parser.getTok(RESOLVER, this, _type_index);} // grammar line 836
            break;
            case 4: {this.m_locals.attribute = "groupSubtype"; this.m_locals.tok=rnd.Parser.getTok(RESOLVER, this, _subtype_index);} // grammar line 837
            break;
            case 5: {this.m_locals.spec.linkToParent(this.m_result.parent);} // grammar line 833
            break;
            case 6: { this.m_locals.spec = RESOLVER.startRule("TableGroupSpec");
        this.m_locals.tok = null;
        this.m_locals.attribute = null;} // grammar line 829
            break;
        }
    }; // TableGroupSpec_action.performAction()

    function PartitionDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PartitionDefinition_locals(), BP, rule_info);
    }
    PartitionDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PartitionDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.partitionDefinition.endRule();} // grammar line 862
            break;
            case 1: { this.m_locals.PartitionScheme.parent = this.m_locals.partitionDefinition; } // grammar line 860
            break;
            case 3: {this.m_locals.partitionDefinition.linkToParent(this.m_result.parent);} // grammar line 857
            { this.m_locals.PartitionScheme.parent = this.m_locals.partitionDefinition; } // grammar line 859
            break;
            case 4: { this.m_locals.partitionDefinition = RESOLVER.startRule("PartitionDefinition"); } // grammar line 855
            break;
        }
    }; // PartitionDefinition_action.performAction()

    function PartitionScheme_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PartitionScheme_locals(), BP, rule_info);
    }
    PartitionScheme_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PartitionScheme_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.partitionScheme.linkToParent(this.m_result.parent);} // grammar line 873
            {this.m_locals.partitionScheme.endRule();} // grammar line 874
            break;
            case 2: { this.m_locals.HashPartition.parent = this.m_locals.partitionScheme; } // grammar line 869
            break;
            case 3: { this.m_locals.RangePartition.parent = this.m_locals.partitionScheme; } // grammar line 870
            break;
            case 4: { this.m_locals.RoundRobinPartition.parent = this.m_locals.partitionScheme; } // grammar line 871
            break;
            case 5: { this.m_locals.partitionScheme = RESOLVER.startRule("PartitionScheme"); } // grammar line 866
            break;
        }
    }; // PartitionScheme_action.performAction()

    function HashPartition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new HashPartition_locals(), BP, rule_info);
    }
    HashPartition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    HashPartition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.hashPartition.numberOfPartitions = this.m_locals.num.res;} // grammar line 884
            {this.m_locals.hashPartition.endRule();} // grammar line 886
            break;
            case 2: { this.m_locals.PartitionExpressions.parent = this.m_locals.hashPartition; } // grammar line 882
            break;
            case 3: {this.m_locals.hashPartition.linkToParent(this.m_result.parent);} // grammar line 880
            break;
            case 4: { this.m_locals.hashPartition = RESOLVER.startRule("HashPartition"); } // grammar line 878
            break;
        }
    }; // HashPartition_action.performAction()

    function RangePartition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RangePartition_locals(), BP, rule_info);
    }
    RangePartition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RangePartition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _others_index = 1;
        switch (_action_num) {
            case 0: {this.m_locals.rangePartition.endRule();} // grammar line 904
            break;
            case 1: {this.m_locals.rangePartition.partitionOthers = rnd.Parser.getTok(RESOLVER, this, _others_index);} // grammar line 902
            break;
            case 2: { this.m_locals.PartitionRanges.parent = this.m_locals.rangePartition; } // grammar line 900
            break;
            case 3: { this.m_locals.PartitionExpressions.parent = this.m_locals.rangePartition; } // grammar line 898
            break;
            case 4: {this.m_locals.rangePartition.linkToParent(this.m_result.parent);} // grammar line 896
            break;
            case 5: { this.m_locals.rangePartition = RESOLVER.startRule("RangePartition"); } // grammar line 894
            break;
        }
    }; // RangePartition_action.performAction()

    function RoundRobinPartition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RoundRobinPartition_locals(), BP, rule_info);
    }
    RoundRobinPartition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RoundRobinPartition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.roundRobinPartition.numberOfPartitions = this.m_locals.num.res;} // grammar line 911
            {this.m_locals.roundRobinPartition.endRule();} // grammar line 912
            break;
            case 2: {this.m_locals.roundRobinPartition.linkToParent(this.m_result.parent);} // grammar line 910
            break;
            case 3: { this.m_locals.roundRobinPartition = RESOLVER.startRule("RoundRobinPartition"); } // grammar line 908
            break;
        }
    }; // RoundRobinPartition_action.performAction()

    function PartitionRanges_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PartitionRanges_locals(), BP, rule_info);
    }
    PartitionRanges_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PartitionRanges_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.partitionRanges.endRule();} // grammar line 921
            break;
            case 1: { this.m_locals.RangeSpec.parent = this.m_locals.partitionRanges; } // grammar line 919
            break;
            case 3: { this.m_locals.partitionRanges = RESOLVER.startArrayRule("PartitionRanges", this.m_result.parent, true); } // grammar line 916
            { this.m_locals.RangeSpec.parent = this.m_locals.partitionRanges; } // grammar line 918
            break;
        }
    }; // PartitionRanges_action.performAction()

    function RangeSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RangeSpec_locals(), BP, rule_info);
    }
    RangeSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RangeSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.rangeSpec.endRule();} // grammar line 936
            break;
            case 1: {this.m_locals.rangeSpec.below = this.m_locals.upperValue.res;} // grammar line 932
            break;
            case 2: {this.m_locals.rangeSpec.atLeast = this.m_locals.lowerValue.res;} // grammar line 930
            break;
            case 3: {this.m_locals.rangeSpec.exactly = this.m_locals.exactlyValue.res;} // grammar line 934
            break;
            case 4: {this.m_locals.rangeSpec.linkToParent(this.m_result.parent);} // grammar line 927
            break;
            case 5: { this.m_locals.rangeSpec = RESOLVER.startRule("RangeSpec"); } // grammar line 925
            break;
        }
    }; // RangeSpec_action.performAction()

    function RangeValue_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RangeValue_locals(), BP, rule_info);
    }
    RangeValue_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RangeValue_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.ilit.res;} // grammar line 941
            break;
            case 1: {this.m_result.res = this.m_locals.slit.res;} // grammar line 942
            break;
            case 2: {this.m_result.res = this.m_locals.rlit.res;} // grammar line 943
            break;
            case 3: {this.m_result.res = this.m_locals.dlit.res;} // grammar line 944
            break;
            case 4: {this.m_result.res = this.m_locals.blit.res;} // grammar line 945
            break;
        }
    }; // RangeValue_action.performAction()

    function PartitionExpressions_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PartitionExpressions_locals(), BP, rule_info);
    }
    PartitionExpressions_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PartitionExpressions_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.expressions.endRule();} // grammar line 954
            break;
            case 1: { this.m_locals.PartitionExpression.parent = this.m_locals.expressions; } // grammar line 952
            break;
            case 3: { this.m_locals.expressions = RESOLVER.startArrayRule("PartitionExpressions", this.m_result.parent, true); } // grammar line 949
            { this.m_locals.PartitionExpression.parent = this.m_locals.expressions; } // grammar line 951
            break;
        }
    }; // PartitionExpressions_action.performAction()

    function PartitionExpression_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PartitionExpression_locals(), BP, rule_info);
    }
    PartitionExpression_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PartitionExpression_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _mtok_index = 2;
        var _ytok_index = 1;
        switch (_action_num) {
            case 1: {this.m_locals.expression.linkToParent(this.m_result.parent);} // grammar line 965
            {this.m_locals.expression.endRule();} // grammar line 967
            break;
            case 2: {this.m_locals.expression.attachChild( this.m_locals.simplePath.res, "simplePath" );} // grammar line 961
            break;
            case 3: {this.m_locals.expression.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _ytok_index),this.m_locals.yearPath.res), "yearPath" );} // grammar line 962
            break;
            case 4: {this.m_locals.expression.attachChild( RESOLVER.tokenAndValue(rnd.Parser.getTok(RESOLVER, this, _mtok_index),this.m_locals.monthPath.res), "monthPath" );} // grammar line 963
            break;
            case 5: { this.m_locals.expression = RESOLVER.startRule("PartitionExpression");} // grammar line 958
            break;
        }
    }; // PartitionExpression_action.performAction()

    function NumberPartitions_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NumberPartitions_locals(), BP, rule_info);
    }
    NumberPartitions_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NumberPartitions_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _num_servers_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.ilit.res;} // grammar line 972
            break;
            case 1: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _num_servers_index);} // grammar line 973
            break;
        }
    }; // NumberPartitions_action.performAction()

    function NumberConst_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NumberConst_locals(), BP, rule_info);
    }
    NumberConst_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NumberConst_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _strLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.dist.res;} // grammar line 980
            break;
            case 1: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _strLit_index);} // grammar line 981
            break;
        }
    }; // NumberConst_action.performAction()

    function DistanceNumber_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DistanceNumber_locals(), BP, rule_info);
    }
    DistanceNumber_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DistanceNumber_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _minus_index = 2;
        var _plus_index = 1;
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.distanceNumber;} // grammar line 996
            {this.m_locals.distanceNumber.endRule();} // grammar line 998
            break;
            case 2: {this.m_locals.distanceNumber.value=intLit;} // grammar line 992
            break;
            case 3: {this.m_locals.distanceNumber.value=realLit;} // grammar line 993
            break;
            case 4: {this.m_locals.distanceNumber.sign=rnd.Parser.getTok(RESOLVER, this, _plus_index);} // grammar line 987
            break;
            case 5: {this.m_locals.distanceNumber.sign=rnd.Parser.getTok(RESOLVER, this, _minus_index);} // grammar line 988
            break;
            case 6: { this.m_locals.distanceNumber = RESOLVER.startRule("DistanceNumber");} // grammar line 985
            break;
        }
    }; // DistanceNumber_action.performAction()

    function SeriesPeriod_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new SeriesPeriod_locals(), BP, rule_info);
    }
    SeriesPeriod_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SeriesPeriod_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _nl_index = 1;
        var _nl2_index = 2;
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.seriesPeriod;} // grammar line 1024
            {this.m_locals.seriesPeriod.endRule();} // grammar line 1025
            break;
            case 2: {this.m_locals.seriesPeriod.second=this.m_locals.id0.res;} // grammar line 1014
            break;
            case 3: {this.m_locals.seriesPeriod.first=rnd.Parser.getTok(RESOLVER, this, _nl_index);} // grammar line 1012
            break;
            case 4: {this.m_locals.seriesPeriod.second=rnd.Parser.getTok(RESOLVER, this, _nl2_index);} // grammar line 1020
            break;
            case 5: {this.m_locals.seriesPeriod.second=this.m_locals.id2.res;} // grammar line 1021
            break;
            case 6: {this.m_locals.seriesPeriod.first=this.m_locals.id1.res;} // grammar line 1016
            break;
            case 7: { this.m_locals.seriesPeriod = RESOLVER.startRule("SeriesPeriod");} // grammar line 1009
            break;
        }
    }; // SeriesPeriod_action.performAction()

    function AnnotatedElementDeclarationLoop_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedElementDeclarationLoop_locals(), BP, rule_info);
    }
    AnnotatedElementDeclarationLoop_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedElementDeclarationLoop_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = this.m_result.res; } // grammar line 1032
            break;
        }
    }; // AnnotatedElementDeclarationLoop_action.performAction()

    function ViewDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ViewDeclaration_locals(), BP, rule_info);
    }
    ViewDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ViewDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _check_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res,RESOLVER.getLastMatchedTokenIndex());} // grammar line 1059
            break;
            case 1: {this.m_result.res.withStructuredPrivilegeCheck = rnd.Parser.getTok(RESOLVER, this, _check_index);} // grammar line 1055
            break;
            case 2: { this.m_locals.QLSelectStmtNoOption.parent = this.m_result.res; } // grammar line 1053
            break;
            case 3: { this.m_locals.ParameterDeclarationList.parentNode = this.m_result.res; } // grammar line 1051
            break;
            case 4: {
    this.m_result.res = RESOLVER.viewparser_startDefineView();
    this.m_result.res.setNamePath(this.m_locals.id.res);
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.getFirstTokenIndex(),-1);
    RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
    if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
    }
   } // grammar line 1042
            break;
        }
    }; // ViewDeclaration_action.performAction()

    function ParameterDeclarationList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ParameterDeclarationList_locals(), BP, rule_info);
    }
    ParameterDeclarationList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ParameterDeclarationList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.parameterDeclarationList.endRule();} // grammar line 1070
            break;
            case 1: { this.m_locals.ParameterDeclaration.parent = this.m_locals.parameterDeclarationList; } // grammar line 1069
            break;
            case 3: {this.m_locals.parameterDeclarationList.linkToParent(this.m_result.parentNode);} // grammar line 1066
            { this.m_locals.ParameterDeclaration.parent = this.m_locals.parameterDeclarationList; } // grammar line 1068
            break;
            case 4: { this.m_locals.parameterDeclarationList = RESOLVER.startArrayRule("ParameterDeclarationList"); } // grammar line 1064
            break;
        }
    }; // ParameterDeclarationList_action.performAction()

    function ParameterDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ParameterDeclaration_locals(), BP, rule_info);
    }
    ParameterDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ParameterDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_locals.parameterDeclaration.endRule();} // grammar line 1082
            break;
            case 1: { this.m_locals.DefaultClause.parentElement = this.m_locals.parameterDeclaration; } // grammar line 1081
            break;
            case 2: {this.m_locals.parameterDeclaration.attachChild(this.m_locals.type.res,"type");} // grammar line 1079
            break;
            case 4: {this.m_locals.parameterDeclaration.attachChild(this.m_locals.id.res,"id");} // grammar line 1076
            {this.m_locals.parameterDeclaration.linkToParent(this.m_result.parent);} // grammar line 1077
            break;
            case 5: { this.m_locals.parameterDeclaration = RESOLVER.startRule("ParameterDeclaration"); } // grammar line 1074
            break;
        }
    }; // ParameterDeclaration_action.performAction()

    function AnnotatedElementDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedElementDeclaration_locals(), BP, rule_info);
    }
    AnnotatedElementDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedElementDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.ElementDeclaration.parent = this.m_result.parent; this.m_locals.ElementDeclaration.annotations = this.m_locals.annotations.res; } // grammar line 1089
            break;
        }
    }; // AnnotatedElementDeclaration_action.performAction()

    function ElementDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ElementDeclaration_locals(), BP, rule_info);
    }
    ElementDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ElementDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _element_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.type.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1116
            break;
            case 1: { this.m_locals.Nullability.parentElement = this.m_locals.type.res; } // grammar line 1106
            break;
            case 2: { this.m_locals.DefaultClause.parentElement = this.m_locals.type.res; } // grammar line 1107
            break;
            case 3: {
       RESOLVER.addAnnotations(this.m_locals.type.res,this.m_result.annotations);
       RESOLVER.initializeElement(this.m_locals.type.res, this.m_locals.id.res, this.m_locals.modifiers.keyToken, null, rnd.Parser.getTok(RESOLVER, this, _element_index), null);
      } // grammar line 1100
            break;
            case 4: { this.m_locals.type.parent = this.m_result.parent; this.m_locals.type.nameToken = this.m_locals.id.res; } // grammar line 1099
            break;
        }
    }; // ElementDeclaration_action.performAction()

    function Nullability_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Nullability_locals(), BP, rule_info);
    }
    Nullability_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Nullability_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.setNullableToken(this.m_result.parentElement,this.m_locals.nu.name);} // grammar line 1125
            break;
            case 1: {RESOLVER.setNotToken(this.m_result.parentElement,this.m_locals.no.name);} // grammar line 1123
            break;
        }
    }; // Nullability_action.performAction()

    function DefaultClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DefaultClause_locals(), BP, rule_info);
    }
    DefaultClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DefaultClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setElementDefault(this.m_result.parentElement,this.m_locals.expr.res);} // grammar line 1132
            break;
            case 1: {RESOLVER.viewparser_setElementDefaultToken(this.m_result.parentElement,this.m_locals.enumVal.res);} // grammar line 1135
            break;
        }
    }; // DefaultClause_action.performAction()

    function ElementModifier_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ElementModifier_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ElementModifier_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _key_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.keyToken = rnd.Parser.getTok(RESOLVER, this, _key_index);} // grammar line 1142
            break;
        }
    }; // ElementModifier_action.performAction()

    function ConstDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ConstDeclaration_locals(), BP, rule_info);
    }
    ConstDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ConstDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1160
            break;
            case 1: {RESOLVER.viewparser_setConstValue(this.m_result.res,this.m_locals.expr.res);} // grammar line 1159
            break;
            case 2: { this.m_locals.TypeSpec.parent = this.m_result.res; this.m_locals.TypeSpec.nameToken = null; } // grammar line 1157
            break;
            case 3: {
          this.m_result.res = RESOLVER.createConst(this.m_locals.id.res);
          if (this.m_result.parentStmts != null) {
           this.m_result.parentStmts.push(this.m_result.res);
          }
          RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
          RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.getFirstTokenIndex(),-1);
         } // grammar line 1149
            break;
        }
    }; // ConstDeclaration_action.performAction()

    function ConstValue_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ConstValue_locals(), BP, rule_info);
    }
    ConstValue_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ConstValue_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.exp.res;} // grammar line 1165
            break;
        }
    }; // ConstValue_action.performAction()

    function EnumValueDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new EnumValueDeclaration_locals(), BP, rule_info);
    }
    EnumValueDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    EnumValueDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1182
            break;
            case 1: {
        if (this.m_locals.expr.res instanceof commonddl.LiteralExpressionImpl) {
         this.m_result.res.setLiteral(this.m_locals.expr.res);
        }
       } // grammar line 1177
            break;
            case 2: {
        this.m_result.res = IAstFactory.eINSTANCE.createEnumerationValue();
        this.m_result.res.setSymbol(this.m_locals.id.res);
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex() ,-1);
       } // grammar line 1171
            break;
        }
    }; // EnumValueDeclaration_action.performAction()

    function TypeDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeDeclaration_locals(), BP, rule_info);
    }
    TypeDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _tableType_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1217
            break;
            case 1: { this.m_locals.StructuredType.parent = this.m_result.res; } // grammar line 1210
            break;
            case 2: { this.m_locals.typespec.parent = this.m_result.res; this.m_locals.typespec.nameToken = null; } // grammar line 1213
            break;
            case 3: {
       this.m_result.res = RESOLVER.createType(this.m_locals.id.res);
       if(this.m_locals.table) {
        this.m_result.res.tableType = rnd.Parser.getTok(RESOLVER, this, _tableType_index);
       }
       if (this.m_result.parentStmts != null) {
        this.m_result.parentStmts.push(this.m_result.res);
       }
       RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), -1);
       RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
      } // grammar line 1195
            break;
            case 4: {this.m_locals.table=true;} // grammar line 1192
            break;
            case 5: { this.m_locals.table = false; } // grammar line 1187
            break;
        }
    }; // TypeDeclaration_action.performAction()

    function ElementDefExtList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ElementDefExtList_locals(), BP, rule_info);
    }
    ElementDefExtList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ElementDefExtList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.ElementDeclaration.parent = this.m_result.parent; this.m_locals.ElementDeclaration.annotations = this.m_locals.annotations.res; } // grammar line 1228
            break;
        }
    }; // ElementDefExtList_action.performAction()

    function StructuredType_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new StructuredType_locals(), BP, rule_info);
    }
    StructuredType_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    StructuredType_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.StructuredTypeComponent.parent = this.m_result.parent; } // grammar line 1239
            break;
        }
    }; // StructuredType_action.performAction()

    function StructuredTypeComponent_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new StructuredTypeComponent_locals(), BP, rule_info);
    }
    StructuredTypeComponent_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    StructuredTypeComponent_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       if (this.m_result.parent != null) {
        RESOLVER.addTypeElement(this.m_result.parent,this.m_locals.typecomponent.decl);
       }
      } // grammar line 1247
            break;
            case 1: { this.m_locals.typecomponent.parent = this.m_result.parent; } // grammar line 1245
            break;
        }
    }; // StructuredTypeComponent_action.performAction()

    function AnnotatedTypeComponentDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedTypeComponentDeclaration_locals(), BP, rule_info);
    }
    AnnotatedTypeComponentDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedTypeComponentDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    this.m_result.decl = this.m_locals.typeCompDecl.res;
    RESOLVER.addAnnotations(this.m_result.decl,this.m_locals.annotations.res);
   } // grammar line 1262
            break;
            case 1: { this.m_locals.typeCompDecl.parent = this.m_result.parent; } // grammar line 1261
            break;
        }
    }; // AnnotatedTypeComponentDeclaration_action.performAction()

    function TypeComponentDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeComponentDeclaration_locals(), BP, rule_info);
    }
    TypeComponentDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeComponentDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _element_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1280
            break;
            case 1: { this.m_locals.DefaultClause.parentElement = this.m_result.res; } // grammar line 1278
            break;
            case 2: {
    this.m_result.res = this.m_locals.typespec.res;
    RESOLVER.initializeTypeComponent(this.m_result.res, this.m_locals.id.res, rnd.Parser.getTok(RESOLVER, this, _element_index));
   } // grammar line 1274
            break;
            case 3: { this.m_locals.typespec.parent = this.m_result.parent; this.m_locals.typespec.nameToken = this.m_locals.id.res; } // grammar line 1273
            break;
        }
    }; // TypeComponentDeclaration_action.performAction()

    function TypeSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeSpec_locals(), BP, rule_info);
    }
    TypeSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.tto.res;
                      RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);} // grammar line 1295
            break;
            case 1: { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.nameToken = this.m_result.nameToken; } // grammar line 1295
            break;
            case 2: {this.m_result.res = this.m_locals.arr.res;} // grammar line 1300
            break;
            case 3: { this.m_locals.arr.parent = this.m_result.parent; this.m_locals.arr.def = this.m_result.nameToken; } // grammar line 1300
            break;
            case 4: {this.m_result.res = this.m_locals.typename.res;
                      RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);} // grammar line 1303
            break;
            case 5: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.nameToken = this.m_result.nameToken; } // grammar line 1303
            break;
            case 6: {this.m_result.res = this.m_locals.typeassoc.res;} // grammar line 1306
            break;
            case 7: { this.m_locals.typeassoc.parent = this.m_result.parent; this.m_locals.typeassoc.def = this.m_result.nameToken; } // grammar line 1306
            break;
            case 8: {this.m_locals.startIndex = RESOLVER.getNextTokenIndex();} // grammar line 1292
            break;
            case 10: {
                if (this.m_result.nameToken != null) {
                 var attribute = RESOLVER.createAttribute(null);
                 attribute.setNameToken(this.m_result.nameToken);
                 this.m_result.parent.getElements().push(attribute);
                 this.m_result.parent = RESOLVER.createAndSetAnonymousTypeDeclaration(attribute);
                 this.m_result.res = attribute;
                }
               } // grammar line 1314
            { this.m_locals.comp_list.parent = this.m_result.parent; } // grammar line 1323
            break;
            case 11: { } // grammar line 1289
            break;
        }
    }; // TypeSpec_action.performAction()

    function TypeSpecNoColon_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeSpecNoColon_locals(), BP, rule_info);
    }
    TypeSpecNoColon_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeSpecNoColon_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.tto.res;
             RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), -1);} // grammar line 1334
            break;
            case 1: { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.nameToken = this.m_result.nameToken; } // grammar line 1334
            break;
            case 2: {this.m_result.res = this.m_locals.typename.res;
             RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), -1);} // grammar line 1337
            break;
            case 3: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.nameToken = this.m_result.nameToken; } // grammar line 1337
            break;
            case 5: {
               if (this.m_result.nameToken != null) {
                var attribute = RESOLVER.createAttribute(null);
                attribute.setNameToken(this.m_result.nameToken);
                this.m_result.parent.getElements().push(attribute);
                this.m_result.parent = RESOLVER.createAndSetAnonymousTypeDeclaration(attribute);
                this.m_result.res = attribute;
               }
              } // grammar line 1345
            { this.m_locals.StructuredType.parent = this.m_result.parent; } // grammar line 1354
            break;
        }
    }; // TypeSpecNoColon_action.performAction()

    function TypeTypeOf_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeTypeOf_locals(), BP, rule_info);
    }
    TypeTypeOf_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeTypeOf_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
          this.m_result.res = RESOLVER.createAttributeTypeOf(this.m_locals.id.res);
          if (this.m_result.nameToken != null) {
           this.m_result.res.setNameToken(this.m_result.nameToken);
          }
          if (this.m_result.parent != null) {
           this.m_result.parent.getElements().push(this.m_result.res);
          }
         } // grammar line 1361
            break;
        }
    }; // TypeTypeOf_action.performAction()

    function TypeArray_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeArray_locals(), BP, rule_info);
    }
    TypeArray_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeArray_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _a_index = 1;
        var _o_index = 2;
        switch (_action_num) {
            case 0: {
    this.m_result.res = this.m_locals.sub.res;
    if (this.m_result.res != null) {
     this.m_result.res.setArrayToken(rnd.Parser.getTok(RESOLVER, this, _a_index));
     this.m_result.res.setArrayOfToken(rnd.Parser.getTok(RESOLVER, this, _o_index));
    }
   } // grammar line 1380
            break;
            case 1: { this.m_locals.sub.parent = this.m_result.parent; this.m_locals.sub.nameToken = this.m_result.def; } // grammar line 1379
            break;
        }
    }; // TypeArray_action.performAction()

    function TypeNamedOrEnum_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeNamedOrEnum_locals(), BP, rule_info);
    }
    TypeNamedOrEnum_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeNamedOrEnum_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.enumeration,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1414
            break;
            case 1: {this.m_locals.enumeration.getValues().push(this.m_locals.val_decl.res);} // grammar line 1411
            break;
            case 2: {
    this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
    this.m_locals.enumeration = IAstFactory.eINSTANCE.createEnumerationDeclaration();
    this.m_result.res.setEnumerationDeclaration(this.m_locals.enumeration);
   } // grammar line 1402
            break;
            case 3: {this.m_result.res = this.m_locals.named.res;} // grammar line 1400
            break;
            case 5: {

  this.m_locals.enumeration = null;
 } // grammar line 1394
            { this.m_locals.named.parent = this.m_result.parent; this.m_locals.named.nameToken = this.m_result.nameToken; } // grammar line 1399
            break;
        }
    }; // TypeNamedOrEnum_action.performAction()

    function TypeNamed_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeNamed_locals(), BP, rule_info);
    }
    TypeNamed_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeNamed_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res.setDecimalsToken(this.m_locals.p2.res);} // grammar line 1439
            break;
            case 1: {this.m_result.res.setLengthToken(this.m_locals.p1.res);} // grammar line 1435
            break;
            case 2: {
    this.m_result.res = RESOLVER.createAttribute(this.m_locals.id.res);
    if (this.m_result.nameToken != null) {
     this.m_result.res.setNameToken(this.m_result.nameToken);
    }
    if (this.m_result.parent != null) {
     this.m_result.parent.getElements().push(this.m_result.res);
    }
   } // grammar line 1423
            break;
        }
    }; // TypeNamed_action.performAction()

    function TypeName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeName_locals(), BP, rule_info);
    }
    TypeName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.id.res;} // grammar line 1448
            break;
        }
    }; // TypeName_action.performAction()

    function AssociationForeignKeys_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AssociationForeignKeys_locals(), BP, rule_info);
    }
    AssociationForeignKeys_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AssociationForeignKeys_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AssociationForeignKeyElement.res = this.m_result.res; } // grammar line 1454
            break;
        }
    }; // AssociationForeignKeys_action.performAction()

    function AssociationForeignKeyElement_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AssociationForeignKeyElement_locals(), BP, rule_info);
    }
    AssociationForeignKeyElement_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AssociationForeignKeyElement_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex( RESOLVER.addKey(this.m_result.res, this.m_locals.kn.expr, this.m_locals.kn.alias), this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1469
            break;
            case 1: {this.m_locals.startIndex = RESOLVER.getNextTokenIndex();} // grammar line 1467
            break;
            case 2: {RESOLVER.viewparser_setStartEndTokenIndex( RESOLVER.addKey(this.m_result.res, this.m_locals.k1.expr, this.m_locals.k1.alias), this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 1464
            break;
            case 3: {this.m_locals.startIndex = RESOLVER.getNextTokenIndex();} // grammar line 1462
            break;
            case 4: { this.m_locals.startIndex=0; } // grammar line 1459
            break;
        }
    }; // AssociationForeignKeyElement_action.performAction()

    function AssociationTo_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AssociationTo_locals(), BP, rule_info);
    }
    AssociationTo_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AssociationTo_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.target.res, this.m_locals.startTargetIndex, RESOLVER.getLastMatchedTokenIndex());
       this.m_result.res.setTargetEntityPath(this.m_locals.target.res);
      } // grammar line 1493
            break;
            case 1: {this.m_locals.startTargetIndex = RESOLVER.getNextTokenIndex();} // grammar line 1491
            break;
            case 2: { this.m_locals.Cardinality.res = this.m_result.res; } // grammar line 1490
            break;
            case 3: {
       this.m_result.res = RESOLVER.createAssociation();
       RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,-1,-1);
       if (this.m_result.def != null) {
        this.m_result.res.setNameToken(this.m_result.def);
       }
       if (this.m_result.parent != null) {
        this.m_result.parent.getElements().push(this.m_result.res);
       }else if (this.m_result.select != null) {
        RESOLVER.addAssociation(this.m_result.select,this.m_result.res);
       }
      } // grammar line 1478
            break;
            case 4: { } // grammar line 1475
            break;
        }
    }; // AssociationTo_action.performAction()

    function AssocForeignKeyOrJoinCondition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AssocForeignKeyOrJoinCondition_locals(), BP, rule_info);
    }
    AssocForeignKeyOrJoinCondition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AssocForeignKeyOrJoinCondition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AssociationForeignKeys.res = this.m_result.assoc; } // grammar line 1502
            break;
            case 1: { this.m_locals.AssociationOnCondition.decl = this.m_result.assoc; } // grammar line 1504
            break;
        }
    }; // AssocForeignKeyOrJoinCondition_action.performAction()

    function AssociationOnCondition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AssociationOnCondition_locals(), BP, rule_info);
    }
    AssociationOnCondition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AssociationOnCondition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {if (this.m_result.decl != null) this.m_result.decl.setOnExpression(this.m_locals.cond.res);} // grammar line 1511
            break;
        }
    }; // AssociationOnCondition_action.performAction()

    function TypeAssoc_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeAssoc_locals(), BP, rule_info);
    }
    TypeAssoc_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeAssoc_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.assocTo.res;} // grammar line 1516
            { this.m_locals.AssocForeignKeyOrJoinCondition.assoc = this.m_locals.assocTo.res; } // grammar line 1517
            break;
            case 2: { this.m_locals.assocTo.parent = this.m_result.parent; this.m_locals.assocTo.def = this.m_result.def; this.m_locals.assocTo.select = null; } // grammar line 1516
            break;
        }
    }; // TypeAssoc_action.performAction()

    function Cardinality_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Cardinality_locals(), BP, rule_info);
    }
    Cardinality_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Cardinality_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _srcStar_index = 2;
        var _star_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.setCardinality(this.m_result.res,this.m_locals.srcMax.res,this.m_locals.srcMaxStar,this.m_locals.min.res,this.m_locals.max1.res,this.m_locals.maxStar);} // grammar line 1552
            break;
            case 1: {this.m_locals.maxStar = rnd.Parser.getTok(RESOLVER, this, _star_index);} // grammar line 1550
            break;
            case 2: {this.m_locals.srcMaxStar = rnd.Parser.getTok(RESOLVER, this, _srcStar_index);} // grammar line 1537
            break;
            case 3: {
  } // grammar line 1521
            break;
        }
    }; // Cardinality_action.performAction()

    function NamespacePath_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NamespacePath_locals(), BP, rule_info);
    }
    NamespacePath_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamespacePath_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       if (this.m_locals.id_n.res != null) {
        RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id_n.res));
       }
      } // grammar line 1568
            break;
            case 1: {RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_result.firstId));} // grammar line 1564
            break;
        }
    }; // NamespacePath_action.performAction()

    function QualifiedDefId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QualifiedDefId_locals(), BP, rule_info);
    }
    QualifiedDefId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QualifiedDefId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {if (this.m_locals.defid.res != null) {RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.defid.res));}} // grammar line 1590
            break;
            case 1: {if (this.m_locals.id_n.res != null) {RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_n.res));}} // grammar line 1586
            break;
            case 2: {
    this.m_result.res = RESOLVER.createPathDeclaration();
    RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
   } // grammar line 1579
            break;
        }
    }; // QualifiedDefId_action.performAction()

    function QuotedId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    QuotedId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QuotedId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);} // grammar line 1598
            break;
        }
    }; // QuotedId_action.performAction()

    function IdWrapper_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new IdWrapper_locals(), BP, rule_info);
    }
    IdWrapper_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    IdWrapper_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);} // grammar line 1605
            break;
            case 1: {this.m_result.res = this.m_locals.idq.res;} // grammar line 1608
            break;
        }
    }; // IdWrapper_action.performAction()

    function ScopedIdWrapper_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ScopedIdWrapper_locals(), BP, rule_info);
    }
    ScopedIdWrapper_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ScopedIdWrapper_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.id.res;} // grammar line 1633
            break;
        }
    }; // ScopedIdWrapper_action.performAction()

    function EnumIdWrapper_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    EnumIdWrapper_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    EnumIdWrapper_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);} // grammar line 1639
            break;
        }
    }; // EnumIdWrapper_action.performAction()

    function IntLiteralWrapper_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    IntLiteralWrapper_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    IntLiteralWrapper_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _intLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _intLit_index);} // grammar line 1644
            break;
        }
    }; // IntLiteralWrapper_action.performAction()

    function StringLiteralWrapper_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    StringLiteralWrapper_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    StringLiteralWrapper_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _strLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _strLit_index);} // grammar line 1649
            break;
        }
    }; // StringLiteralWrapper_action.performAction()

    function RealLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    RealLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RealLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _realLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _realLit_index);} // grammar line 1654
            break;
        }
    }; // RealLiteral_action.performAction()

    function BinaryLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    BinaryLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    BinaryLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _binaryLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _binaryLit_index);} // grammar line 1659
            break;
        }
    }; // BinaryLiteral_action.performAction()

    function DateLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    DateLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DateLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _dateLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _dateLit_index);} // grammar line 1664
            break;
        }
    }; // DateLiteral_action.performAction()

    function TimeLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    TimeLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TimeLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _timeLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _timeLit_index);} // grammar line 1669
            break;
        }
    }; // TimeLiteral_action.performAction()

    function TimeStampLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    TimeStampLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TimeStampLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _timeStampLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _timeStampLit_index);} // grammar line 1674
            break;
        }
    }; // TimeStampLiteral_action.performAction()

    function NullLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NullLiteral_locals(), BP, rule_info);
    }
    NullLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NullLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _unLit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.nullLit.name;} // grammar line 1679
            break;
            case 1: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _unLit_index);} // grammar line 1681
            break;
        }
    }; // NullLiteral_action.performAction()

    function BooleanLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    BooleanLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    BooleanLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lit_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _lit_index);} // grammar line 1686
            break;
        }
    }; // BooleanLiteral_action.performAction()

    function DefId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DefId_locals(), BP, rule_info);
    }
    DefId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DefId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.id1.res;} // grammar line 1695
            break;
        }
    }; // DefId_action.performAction()

    function AnnotationValue_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationValue_locals(), BP, rule_info);
    }
    AnnotationValue_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationValue_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    var value = null;
    var entries = this.m_locals.refToConst.res.getEntries();
    if (entries.length == 1) {
     var id = entries[ 0 ].getNameToken();
     value = RESOLVER.addAnnotationValue(this.m_result.container,id);
    }else if (entries.length >= 1) {
     value = RESOLVER.addAnnotationPathValue(this.m_result.container,this.m_locals.refToConst.res);
    }
    if (value != null) {
     RESOLVER.viewparser_setStartEndTokenIndex(value, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
    }
   } // grammar line 1714
            break;
            case 1: {
   var av = RESOLVER.addAnnotationValue(this.m_result.container, this.m_locals.lit_val.res);
   RESOLVER.viewparser_setStartEndTokenIndex(av, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
  } // grammar line 1731
            break;
            case 2: { this.m_locals.RecordValue.container = this.m_result.container; } // grammar line 1737
            break;
            case 3: { this.m_locals.ArrayValue.container = this.m_result.container; } // grammar line 1739
            break;
        }
    }; // AnnotationValue_action.performAction()

    function RecordValue_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RecordValue_locals(), BP, rule_info);
    }
    RecordValue_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RecordValue_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.record, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1756
            break;
            case 1: { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1753
            break;
            case 3: {
    this.m_result.record = RESOLVER.createAnnotationRecordValue();
    RESOLVER.addAnnotationRecordValue(this.m_result.container,this.m_result.record);
   } // grammar line 1746
            { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1750
            break;
        }
    }; // RecordValue_action.performAction()

    function PreAnnotation_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PreAnnotation_locals(), BP, rule_info);
    }
    PreAnnotation_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PreAnnotation_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1769
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1767
            break;
            case 3: {this.m_result.res = RESOLVER.createPreAnnotation();} // grammar line 1762
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1764
            break;
        }
    }; // PreAnnotation_action.performAction()

    function RecordComponent_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RecordComponent_locals(), BP, rule_info);
    }
    RecordComponent_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RecordComponent_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1784
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1782
            break;
            case 3: {
       this.m_result.res = RESOLVER.createAnnotationNameValuePair();
       RESOLVER.addAnnotationNameValuePair(this.m_result.container,this.m_result.res);
      } // grammar line 1774
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1779
            break;
        }
    }; // RecordComponent_action.performAction()

    function ArrayValue_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ArrayValue_locals(), BP, rule_info);
    }
    ArrayValue_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ArrayValue_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.array, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1802
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1798
            break;
            case 2: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1795
            break;
            case 3: {
    this.m_result.array = RESOLVER.createAnnotationArrayValue();
    RESOLVER.addAnnotationArrayValue(this.m_result.container,this.m_result.array);
   } // grammar line 1790
            break;
        }
    }; // ArrayValue_action.performAction()

    function AnnotationPath_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationPath_locals(), BP, rule_info);
    }
    AnnotationPath_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationPath_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _dot_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_n.res);} // grammar line 1814
            break;
            case 1: {RESOLVER.addAnnotationPath(this.m_result.nameValuePair,rnd.Parser.getTok(RESOLVER, this, _dot_index));} // grammar line 1812
            break;
            case 2: {RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_1.res);} // grammar line 1809
            break;
        }
    }; // AnnotationPath_action.performAction()

    function AnnotationId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    AnnotationId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);} // grammar line 1825
            break;
        }
    }; // AnnotationId_action.performAction()

    function AnnotationLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationLiteral_locals(), BP, rule_info);
    }
    AnnotationLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.str_val.res;} // grammar line 1835
            break;
            case 1: {this.m_result.res = this.m_locals.int_val.res;} // grammar line 1840
            break;
            case 2: {this.m_result.res = this.m_locals.real_lit.res;} // grammar line 1841
            break;
            case 3: {this.m_result.res = this.m_locals.binary_lit.res;} // grammar line 1844
            break;
            case 4: {this.m_result.res = this.m_locals.date_lit.res;} // grammar line 1845
            break;
            case 5: {this.m_result.res = this.m_locals.time_lit.res;} // grammar line 1846
            break;
            case 6: {this.m_result.res = this.m_locals.timestamp_lit.res;} // grammar line 1847
            break;
            case 7: {this.m_result.res = this.m_locals.null_lit.res;} // grammar line 1848
            break;
        }
    }; // AnnotationLiteral_action.performAction()

    function QLSelectStmtNoOption_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSelectStmtNoOption_locals(), BP, rule_info);
    }
    QLSelectStmtNoOption_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSelectStmtNoOption_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.QLSubqueryComplex.parent = this.m_result.parent; this.m_locals.QLSubqueryComplex.parentSelectSet = null; } // grammar line 1869
            break;
        }
    }; // QLSelectStmtNoOption_action.performAction()

    function QLSubqueryWithParens_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSubqueryWithParens_locals(), BP, rule_info);
    }
    QLSubqueryWithParens_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSubqueryWithParens_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
  } // grammar line 1878
            break;
            case 1: {this.m_result.selectStmt = this.m_locals.sq1.selectStmt;} // grammar line 1876
            break;
            case 2: { this.m_locals.sq1.parent = this.m_result.parent; this.m_locals.sq1.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1875
            break;
        }
    }; // QLSubqueryWithParens_action.performAction()

    function QLSubqueryComplex_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSubqueryComplex_locals(), BP, rule_info);
    }
    QLSubqueryComplex_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSubqueryComplex_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1887
            break;
            case 2: {this.m_result.selectStmt = this.m_locals.sq.select;} // grammar line 1885
            { this.m_locals.OrderByClause.select = this.m_result.selectStmt; } // grammar line 1886
            break;
            case 3: { this.m_locals.sq.parent = this.m_result.parent; this.m_locals.sq.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1884
            break;
        }
    }; // QLSubqueryComplex_action.performAction()

    function QLSubquerySet_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSubquerySet_locals(), BP, rule_info);
    }
    QLSubquerySet_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSubquerySet_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
       if (this.m_result.parent != null) {
        this.m_result.parent.setSelectSet(this.m_result.select);
       }
      } // grammar line 1943
            {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.select, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 1948
            break;
            case 2: {this.m_result.select = this.m_locals.tempSelectSet;} // grammar line 1922
            break;
            case 4: {
       this.m_locals.tempSelectSet = RESOLVER.createViewSelectSet(this.m_locals.set.operator,this.m_locals.set.all,this.m_locals.set.distinct,this.m_result.select,null);
       if (this.m_result.select != null) {
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.tempSelectSet, this.m_result.select.getStartTokenIndex(), -1);
       }
       if (this.m_result.parent != null) {
        this.m_result.parent.setSelectSet(this.m_locals.tempSelectSet);
       }
       if (this.m_result.parentSelectSet != null) {
        this.m_result.parentSelectSet.setRight(this.m_locals.tempSelectSet);
        this.m_result.parentSelectSet = null;
       }
      } // grammar line 1908
            { this.m_locals.sq2a.parent = null; this.m_locals.sq2a.parentSelectSet = this.m_locals.tempSelectSet; } // grammar line 1921
            break;
            case 5: {this.m_result.select = this.m_locals.tempSelectSet;} // grammar line 1940
            break;
            case 7: {
       this.m_locals.tempSelectSet = RESOLVER.createViewSelectSet(this.m_locals.set.operator,this.m_locals.set.all,this.m_locals.set.distinct,this.m_result.select,null);
       if (this.m_result.select != null) {
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.tempSelectSet, this.m_result.select.getStartTokenIndex(), -1);
       }
       if (this.m_result.parent != null) {
        this.m_result.parent.setSelectSet(this.m_locals.tempSelectSet);
       }
       if (this.m_result.parentSelectSet != null) {
        this.m_result.parentSelectSet.setRight(this.m_locals.tempSelectSet);
        this.m_result.parentSelectSet = null;
       }
      } // grammar line 1926
            { this.m_locals.sq2b.parent = null; this.m_locals.sq2b.parentSelectSet = this.m_locals.tempSelectSet; } // grammar line 1939
            break;
            case 8: {this.m_result.select = this.m_locals.sq1a.selectStmt;} // grammar line 1896
            break;
            case 9: { this.m_locals.sq1a.parent = this.m_result.parent; this.m_locals.sq1a.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1895
            break;
            case 10: {this.m_result.select = this.m_locals.sq1b.selectStmt;} // grammar line 1901
            break;
            case 11: { this.m_locals.sq1b.parent = this.m_result.parent; this.m_locals.sq1b.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1900
            break;
            case 12: { this.m_locals.tempSelectSet = null; } // grammar line 1891
            break;
        }
    }; // QLSubquerySet_action.performAction()

    function QLSubqueryElementary_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSubqueryElementary_locals(), BP, rule_info);
    }
    QLSubqueryElementary_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSubqueryElementary_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.selectStmt,RESOLVER.getLastMatchedTokenIndex());} // grammar line 1974
            break;
            case 1: { this.m_locals.having.select = this.m_result.selectStmt; } // grammar line 1973
            break;
            case 2: { this.m_locals.group.select = this.m_result.selectStmt; } // grammar line 1972
            break;
            case 3: { this.m_locals.where.select = this.m_result.selectStmt; } // grammar line 1971
            break;
            case 4: { this.m_locals.select.select = this.m_result.selectStmt; this.m_locals.select.list = null; } // grammar line 1970
            break;
            case 5: { this.m_locals.adhoc.select = this.m_result.selectStmt; } // grammar line 1968
            break;
            case 7: {
    this.m_result.selectStmt = RESOLVER.viewparser_startSelect();
    if (this.m_result.parent != null) {
     this.m_result.parent.setSelect(this.m_result.selectStmt);
    }
    if (this.m_result.parentSelectSet != null) {
     this.m_result.parentSelectSet.setRight(this.m_result.selectStmt);
    }
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt, this.getFirstTokenIndex(),-1);
   } // grammar line 1956
            { this.m_locals.from.select = this.m_result.selectStmt; } // grammar line 1967
            break;
        }
    }; // QLSubqueryElementary_action.performAction()

    function AdhocDeclarationBlock_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AdhocDeclarationBlock_locals(), BP, rule_info);
    }
    AdhocDeclarationBlock_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AdhocDeclarationBlock_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.elem.select = this.m_result.select; } // grammar line 1981
            break;
        }
    }; // AdhocDeclarationBlock_action.performAction()

    function AdhocElementDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AdhocElementDeclaration_locals(), BP, rule_info);
    }
    AdhocElementDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AdhocElementDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex( this.m_locals.assocTo.res, this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2014
            break;
            case 2: {
          this.m_locals.assocTo.res.setNameToken(this.m_locals.id.res);
          this.m_locals.assocTo.res.setNamePath(null);
          RESOLVER.viewparser_setStartTokenIndex(this.m_locals.assocTo.res, this.m_locals.startIndex);
      } // grammar line 1998
            { this.m_locals.AssociationOnCondition.decl = this.m_locals.assocTo.res; } // grammar line 2003
            break;
            case 4: {this.m_locals.startIndex = RESOLVER.getNextTokenIndex();} // grammar line 1996
            { this.m_locals.assocTo.parent = null; this.m_locals.assocTo.def = null; this.m_locals.assocTo.select = this.m_result.select; } // grammar line 1997
            break;
            case 5: { this.m_locals.startIndex = 0; } // grammar line 1988
            break;
        }
    }; // AdhocElementDeclaration_action.performAction()

    function QLSelectClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSelectClause_locals(), BP, rule_info);
    }
    QLSelectClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSelectClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2035
            break;
            case 2: {
       if (this.m_result.list != null) {
        this.m_result.res = this.m_result.list;
       }else{
        this.m_result.res = RESOLVER.viewparser_startSelectList0();
        RESOLVER.viewparser_selectlist(this.m_result.select,this.m_result.res);
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.m_locals.startIndex,-1);
       }
      } // grammar line 2023
            { this.m_locals.QLSelectList.list = this.m_result.res; } // grammar line 2032
            break;
            case 3: { this.m_locals.startIndex = RESOLVER.getNextTokenIndex(); } // grammar line 2019
            break;
        }
    }; // QLSelectClause_action.performAction()

    function QLSelectList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSelectList_locals(), BP, rule_info);
    }
    QLSelectList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSelectList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.p2.list = this.m_result.list; } // grammar line 2044
            break;
            case 1: { this.m_locals.AnnotatedQLSelectItem.list = this.m_result.list; } // grammar line 2040
            break;
        }
    }; // QLSelectList_action.performAction()

    function AnnotatedQLSelectItem_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedQLSelectItem_locals(), BP, rule_info);
    }
    AnnotatedQLSelectItem_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedQLSelectItem_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.QLSelectItem.preAnnotations = this.m_locals.annotations.res; this.m_locals.QLSelectItem.list = this.m_result.list; } // grammar line 2054
            break;
        }
    }; // AnnotatedQLSelectItem_action.performAction()

    function QLSelectItem_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSelectItem_locals(), BP, rule_info);
    }
    QLSelectItem_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSelectItem_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.p1.entry;} // grammar line 2059
            break;
            case 1: { this.m_locals.p1.preAnnotations = this.m_result.preAnnotations; this.m_locals.p1.list = this.m_result.list; } // grammar line 2059
            break;
            case 2: {this.m_result.res = this.m_locals.p2.entry;} // grammar line 2061
            break;
            case 3: { this.m_locals.p2.preAnnotations = this.m_result.preAnnotations; this.m_locals.p2.list = this.m_result.list; } // grammar line 2061
            break;
        }
    }; // QLSelectItem_action.performAction()

    function QLPathListSelectItemAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLPathListSelectItemAlias_locals(), BP, rule_info);
    }
    QLPathListSelectItemAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLPathListSelectItemAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   if (this.m_result.entry != null) {
    RESOLVER.viewparser_alias(this.m_result.entry,this.m_locals.alias1.res);
   }
  } // grammar line 2069
            break;
        }
    }; // QLPathListSelectItemAlias_action.performAction()

    function QLPathListSelectItem_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLPathListSelectItem_locals(), BP, rule_info);
    }
    QLPathListSelectItem_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLPathListSelectItem_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _f_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry, this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2136
            break;
            case 1: { this.m_locals.p2.select = null; this.m_locals.p2.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 2116
            break;
            case 2: {
       var nestedList = IAstFactory.eINSTANCE.createSelectList();
       if (this.m_locals.flattenKeyword != null) {
        this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedFlattenedSelectListPathEntry();
        this.m_locals.nestedEntry.setFlattenKeyword(this.m_locals.flattenKeyword);
       }else{
        this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
       }
       this.m_locals.nestedEntry.setSelectList(nestedList);
       this.m_locals.pathExp.res.getPathEntries().push(this.m_locals.nestedEntry);
      } // grammar line 2105
            break;
            case 3: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 2096
            break;
            case 4: {this.m_locals.flattenKeyword = rnd.Parser.getTok(RESOLVER, this, _f_index);} // grammar line 2101
            break;
            case 6: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.pathExp.res, this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2088
            {
       this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.pathExp.res);
       RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
       RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
      } // grammar line 2089
            break;
            case 7: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 2132
            break;
            case 8: { this.m_locals.p3.select = null; this.m_locals.p3.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 2131
            break;
            case 9: {
       var nestedList = IAstFactory.eINSTANCE.createSelectList();
       this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
       this.m_locals.nestedEntry.setSelectList(nestedList);
       var pExp = RESOLVER.createPathExpression();
       pExp.getPathEntries().push(this.m_locals.nestedEntry);
       this.m_result.entry = RESOLVER.viewparser_selectListEntry(pExp);
       RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
       RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
      } // grammar line 2121
            break;
            case 10: {
  this.m_locals.nestedEntry = null;
  this.m_locals.flattenKeyword = null;
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 2079
            break;
        }
    }; // QLPathListSelectItem_action.performAction()

    function QLPath_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLPath_locals(), BP, rule_info);
    }
    QLPath_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLPath_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.res,RESOLVER.getLastMatchedTokenIndex());} // grammar line 2178
            break;
            case 1: { this.m_locals.f2.entry = this.m_locals.entry; } // grammar line 2175
            break;
            case 2: {
       this.m_locals.entry = RESOLVER.createPathEntry(this.m_locals.id2.res);
       RESOLVER.addEntry(this.m_result.res,this.m_locals.entry);
      } // grammar line 2170
            break;
            case 3: { this.m_locals.f1.entry = this.m_locals.entry; } // grammar line 2155
            break;
            case 4: {
       this.m_locals.entry = RESOLVER.createPathEntry(this.m_locals.id1.res);
       RESOLVER.addEntry(this.m_result.res, this.m_locals.entry);
      } // grammar line 2150
            break;
            case 5: {RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.idsc1.res));} // grammar line 2164
            break;
            case 7: { this.m_locals.entry = null; } // grammar line 2140
            {
       this.m_result.res = RESOLVER.createPathExpression();
       RESOLVER.viewparser_setStartTokenIndex(this.m_result.res, this.getFirstTokenIndex());
      } // grammar line 2142
            break;
        }
    }; // QLPath_action.performAction()

    function Filter_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Filter_locals(), BP, rule_info);
    }
    Filter_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Filter_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.setFilter(this.m_result.entry,this.m_locals.c.res);} // grammar line 2192
            break;
        }
    }; // Filter_action.performAction()

    function PathGeneric_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathGeneric_locals(), BP, rule_info);
    }
    PathGeneric_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathGeneric_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id2.res)); } // grammar line 2203
            break;
            case 1: { RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id1.res)); } // grammar line 2200
            break;
        }
    }; // PathGeneric_action.performAction()

    function PathSimple_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathSimple_locals(), BP, rule_info);
    }
    PathSimple_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathSimple_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 2: {this.m_result.res = RESOLVER.createPathExpression();} // grammar line 2208
            {this.m_result.res.typeName = "PathSimple";} // grammar line 2209
            { this.m_locals.PathGeneric.path = this.m_result.res; } // grammar line 2211
            break;
        }
    }; // PathSimple_action.performAction()

    function PathWithNamespace_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathWithNamespace_locals(), BP, rule_info);
    }
    PathWithNamespace_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathWithNamespace_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.PathGeneric.path = this.m_result.res; } // grammar line 2223
            break;
            case 1: {RESOLVER.markLastNamespacePathEntry(this.m_result.res);} // grammar line 2220
            break;
            case 2: { this.m_locals.NamespacePath.path = this.m_result.res; this.m_locals.NamespacePath.firstId = this.m_locals.id_1.res; } // grammar line 2219
            break;
            case 4: {this.m_result.res = RESOLVER.createPathExpression();} // grammar line 2215
            {this.m_result.res.typeName = "PathWithNamespace";} // grammar line 2216
            break;
        }
    }; // PathWithNamespace_action.performAction()

    function PathWithAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathWithAlias_locals(), BP, rule_info);
    }
    PathWithAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathWithAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_result.alias = this.m_locals.id.res; } // grammar line 2230
            break;
            case 1: { this.m_result.expr = this.m_locals.path.res; } // grammar line 2228
            break;
        }
    }; // PathWithAlias_action.performAction()

    function SetOperator_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SetOperator_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SetOperator_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _a_index = 1;
        var _dist_index = 2;
        var _exc_index = 5;
        var _int1_index = 4;
        var _minus_index = 6;
        var _union_index = 3;
        switch (_action_num) {
            case 0: {this.m_result.all = rnd.Parser.getTok(RESOLVER, this, _a_index);} // grammar line 2237
            break;
            case 1: {this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist_index);} // grammar line 2239
            break;
            case 2: {this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _union_index);} // grammar line 2235
            break;
            case 3: {this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist_index);} // grammar line 2243
            break;
            case 4: {this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _int1_index);} // grammar line 2242
            break;
            case 5: {this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist_index);} // grammar line 2246
            break;
            case 6: {this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _exc_index);} // grammar line 2245
            break;
            case 7: {this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist_index);} // grammar line 2249
            break;
            case 8: {this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _minus_index);} // grammar line 2248
            break;
        }
    }; // SetOperator_action.performAction()

    function ExprSelectItem_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprSelectItem_locals(), BP, rule_info);
    }
    ExprSelectItem_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprSelectItem_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2278
            break;
            case 1: {
          this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.alias2.expr);
          RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
          RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);

          RESOLVER.viewparser_alias(this.m_result.entry,this.m_locals.alias2.alias);
      } // grammar line 2258
            break;
            case 2: {
          this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.alias.expr);
          RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
          RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);

          RESOLVER.viewparser_alias(this.m_result.entry,this.m_locals.alias.alias);
      } // grammar line 2269
            break;
        }
    }; // ExprSelectItem_action.performAction()

    function FromClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new FromClause_locals(), BP, rule_info);
    }
    FromClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FromClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
       var sel = this.m_result.select;
       this.m_locals.fromAdapter = {
        setRef : function(res) {
         sel.setFrom(res);
        },
        getRef : function() {
         return sel.getFrom();
        }
       };
      } // grammar line 2285
            { this.m_locals.TablePathList.resAdapter = this.m_locals.fromAdapter; } // grammar line 2299
            break;
            case 2: { this.m_locals.fromAdapter = null; } // grammar line 2282
            break;
        }
    }; // FromClause_action.performAction()

    function TablePathList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TablePathList_locals(), BP, rule_info);
    }
    TablePathList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TablePathList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.resAdapter.getRef(), this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2315
            break;
            case 1: { this.m_locals.TableOrJoin.resAdapter = this.m_result.resAdapter; } // grammar line 2306
            break;
        }
    }; // TablePathList_action.performAction()

    function Table_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Table_locals(), BP, rule_info);
    }
    Table_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Table_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.TablePath.resAdapter = this.m_result.resAdapter; } // grammar line 2320
            break;
            case 1: { this.m_locals.TableOrJoin.resAdapter = this.m_result.resAdapter; } // grammar line 2322
            break;
        }
    }; // Table_action.performAction()

    function TableOrJoin_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TableOrJoin_locals(), BP, rule_info);
    }
    TableOrJoin_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TableOrJoin_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.join.setOn(this.m_locals.cond.res);} // grammar line 2353
            {this.m_locals.join.setEndTokenIndex(RESOLVER.getNextTokenIndex());} // grammar line 2354
            break;
            case 3: { this.m_locals.join = IAstFactory.eINSTANCE.createJoinDataSource();
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.join, RESOLVER.getNextTokenIndex()-1, -1);
         this.m_locals.join.setLeft(this.m_result.resAdapter.getRef());
         this.m_locals.join.setJoinEnum( this.m_locals.jt.res || commonddl.JoinEnum.LEFT );
         this.m_result.resAdapter.setRef(this.m_locals.join);

           var j = this.m_locals.join;
           this.m_locals.rightAdapter = {
            setRef : function(res) {
             j.setRight(res);
            },
            getRef : function() {
             return j.getRight();
            }
           };
          } // grammar line 2335
            { this.m_locals.TableOrJoin.resAdapter = this.m_locals.rightAdapter; } // grammar line 2351
            break;
            case 5: { this.m_locals.join = null;
  this.m_locals.rightAdapter = null;} // grammar line 2326
            { this.m_locals.Table.resAdapter = this.m_result.resAdapter; } // grammar line 2329
            break;
        }
    }; // TableOrJoin_action.performAction()

    function JoinType_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new JoinType_locals(), BP, rule_info);
    }
    JoinType_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    JoinType_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res=commonddl.JoinEnum.INNER;} // grammar line 2366
            break;
            case 1: {this.m_result.res=this.m_locals.outer.res;} // grammar line 2368
            break;
        }
    }; // JoinType_action.performAction()

    function OuterJoinType_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    OuterJoinType_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OuterJoinType_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res=commonddl.JoinEnum.LEFT;} // grammar line 2374
            break;
            case 1: {this.m_result.res=commonddl.JoinEnum.RIGHT;} // grammar line 2375
            break;
            case 2: {this.m_result.res=commonddl.JoinEnum.FULL;} // grammar line 2376
            break;
        }
    }; // OuterJoinType_action.performAction()

    function TablePathAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TablePathAlias_locals(), BP, rule_info);
    }
    TablePathAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TablePathAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.alias.res;} // grammar line 2383
            break;
        }
    }; // TablePathAlias_action.performAction()

    function TablePath_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TablePath_locals(), BP, rule_info);
    }
    TablePath_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TablePath_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    var res = RESOLVER.viewparser_tableDatasource(this.m_locals.path.res);
    if (this.m_locals.alias.res != null) {
     res.setAliasToken(this.m_locals.alias.res);
    }
       RESOLVER.viewparser_setStartEndTokenIndex(res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
       this.m_result.resAdapter.setRef(res);
   } // grammar line 2394
            break;
        }
    }; // TablePath_action.performAction()

    function WhereClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new WhereClause_locals(), BP, rule_info);
    }
    WhereClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    WhereClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   this.m_result.res = RESOLVER.createExpressionContainer(this.m_locals.cond.res);
   if (this.m_result.select != null) {
    this.m_result.select.setWhere(this.m_result.res);
   }
   RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
  } // grammar line 2409
            break;
        }
    }; // WhereClause_action.performAction()

    function GroupByClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GroupByClause_locals(), BP, rule_info);
    }
    GroupByClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GroupByClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    var groupBy = RESOLVER.viewparser_groupBy1(this.m_locals.list.res);
    RESOLVER.viewparser_setStartEndTokenIndex(groupBy, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
    this.m_result.select.setGroupBy(groupBy);
   } // grammar line 2426
            break;
        }
    }; // GroupByClause_action.performAction()

    function HavingClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new HavingClause_locals(), BP, rule_info);
    }
    HavingClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    HavingClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   var cont = RESOLVER.createExpressionContainer(this.m_locals.cond.res);
   RESOLVER.viewparser_setStartEndTokenIndex(cont, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
   this.m_result.select.setHaving(cont);
  } // grammar line 2440
            break;
        }
    }; // HavingClause_action.performAction()

    function OrderByClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new OrderByClause_locals(), BP, rule_info);
    }
    OrderByClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OrderByClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   var orderBy = RESOLVER.viewparser_createOrderBy(this.m_locals.order.res);
   RESOLVER.viewparser_setStartEndTokenIndex(orderBy, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
   if (this.m_result.select != null) {
    this.m_result.select.setOrderBy(orderBy);
    RESOLVER.viewparser_setEndTokenIndex(this.m_result.select, RESOLVER.getLastMatchedTokenIndex());
   }
  } // grammar line 2455
            break;
            case 1: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.select,-1);} // grammar line 2452
            break;
        }
    }; // OrderByClause_action.performAction()

    function SortSpecList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new SortSpecList_locals(), BP, rule_info);
    }
    SortSpecList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SortSpecList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res.push(this.m_locals.spec.res);} // grammar line 2470
            break;
            case 1: {this.m_result.res.push(this.m_locals.spec.res);} // grammar line 2469
            break;
            case 2: {this.m_result.res = [];} // grammar line 2468
            break;
        }
    }; // SortSpecList_action.performAction()

    function SortSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new SortSpec_locals(), BP, rule_info);
    }
    SortSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SortSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
    this.m_result.res = RESOLVER.viewparser_createOrderByEntry(this.m_locals.expr.res);
    this.m_result.res.setOrderSequenceToken(this.m_locals.order.res);
    this.m_result.res.setNullsToken(this.m_locals.nfl.nulls);
    this.m_result.res.setNullsFirstLastToken(this.m_locals.nfl.firstLast);
   } // grammar line 2478
            {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2485
            break;
        }
    }; // SortSpec_action.performAction()

    function OptAscDesc_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    OptAscDesc_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptAscDesc_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lex_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _lex_index);} // grammar line 2489
            break;
        }
    }; // OptAscDesc_action.performAction()

    function OptNullsFirstLast_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    OptNullsFirstLast_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptNullsFirstLast_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lex_index = 1;
        var _n_index = 2;
        switch (_action_num) {
            case 0: {this.m_result.firstLast = rnd.Parser.getTok(RESOLVER, this, _lex_index);} // grammar line 2496
            break;
            case 1: {this.m_result.nulls = rnd.Parser.getTok(RESOLVER, this, _n_index);} // grammar line 2494
            break;
        }
    }; // OptNullsFirstLast_action.performAction()

    function Condition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Condition_locals(), BP, rule_info);
    }
    Condition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Condition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2514
            break;
            case 1: {
  if (this.m_result.res == null) {
   this.m_result.res = RESOLVER.viewparser_orExpression(this.m_locals.condAnd.res,this.m_locals.right.res);
  } else this.m_result.res = RESOLVER.viewparser_orExpression(this.m_result.res,this.m_locals.right.res);
 } // grammar line 2507
            break;
            case 2: {this.m_result.res = this.m_locals.condAnd.res;} // grammar line 2503
            break;
        }
    }; // Condition_action.performAction()

    function ConditionAnd_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ConditionAnd_locals(), BP, rule_info);
    }
    ConditionAnd_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ConditionAnd_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2527
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_andExpression(this.m_result.res,this.m_locals.right.res);} // grammar line 2524
            break;
            case 2: {this.m_result.res = this.m_locals.condTerm.res;} // grammar line 2520
            break;
        }
    }; // ConditionAnd_action.performAction()

    function ConditionTerm_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ConditionTerm_locals(), BP, rule_info);
    }
    ConditionTerm_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ConditionTerm_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2541
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.cond1.res);} // grammar line 2533
            break;
            case 2: {this.m_result.res = this.m_locals.cond2.res;} // grammar line 2535
            break;
            case 3: {this.m_result.res = this.m_locals.pred.res;} // grammar line 2538
            break;
        }
    }; // ConditionTerm_action.performAction()

    function PredicateLeftIsExpression_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PredicateLeftIsExpression_locals(), BP, rule_info);
    }
    PredicateLeftIsExpression_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PredicateLeftIsExpression_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2568
            break;
            case 1: {this.m_result.res = this.m_locals.comp.res;} // grammar line 2554
            break;
            case 2: { this.m_locals.comp.left = this.m_locals.left.res; } // grammar line 2554
            break;
            case 3: {this.m_result.res = this.m_locals.nullPred.res;} // grammar line 2556
            break;
            case 4: { this.m_locals.nullPred.expr = this.m_locals.left.res; } // grammar line 2556
            break;
            case 5: {this.m_result.res = this.m_locals.negated ? RESOLVER.viewparser_notExpression(this.m_locals.range.res) : this.m_locals.range.res;} // grammar line 2560
            break;
            case 6: { this.m_locals.range.expr1 = this.m_locals.left.res; this.m_locals.range.negated = this.m_locals.negated; } // grammar line 2560
            break;
            case 7: {this.m_result.res = this.m_locals.negated ? RESOLVER.viewparser_notExpression(this.m_locals.like.res) : this.m_locals.like.res;} // grammar line 2562
            break;
            case 8: { this.m_locals.like.expr1 = this.m_locals.left.res; this.m_locals.like.negated = this.m_locals.negated; } // grammar line 2562
            break;
            case 9: {this.m_result.res = this.m_locals.negated ? RESOLVER.viewparser_notExpression(this.m_locals.inP.res) : this.m_locals.inP.res;} // grammar line 2564
            break;
            case 10: { this.m_locals.inP.left = this.m_locals.left.res; this.m_locals.inP.negated = this.m_locals.negated; } // grammar line 2564
            break;
            case 11: {this.m_locals.negated = true;} // grammar line 2558
            break;
            case 12: { this.m_locals.negated=false; } // grammar line 2545
            break;
        }
    }; // PredicateLeftIsExpression_action.performAction()

    function ComparisonPredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ComparisonPredicate_locals(), BP, rule_info);
    }
    ComparisonPredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ComparisonPredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_compExpression(rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex()), this.m_result.left, this.m_locals.right.res);} // grammar line 2587
            break;
        }
    }; // ComparisonPredicate_action.performAction()

    function RangePredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RangePredicate_locals(), BP, rule_info);
    }
    RangePredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RangePredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_result.res = RESOLVER.viewparser_betweenExpression(this.m_result.expr1,this.m_locals.expr2.res,this.m_locals.expr3.res);} // grammar line 2596
            {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2597
            break;
        }
    }; // RangePredicate_action.performAction()

    function LikePredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new LikePredicate_locals(), BP, rule_info);
    }
    LikePredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    LikePredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _like_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_likeExpression(rnd.Parser.getTok(RESOLVER, this, _like_index),this.m_result.expr1,this.m_locals.expr2.res,this.m_locals.escapeToken);
         RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2613
            break;
            case 1: {this.m_locals.escapeToken = this.m_locals.expr3.res.getTokenToken();} // grammar line 2611
            break;
            case 2: { this.m_locals.escapeToken = null; } // grammar line 2601
            break;
        }
    }; // LikePredicate_action.performAction()

    function NullPredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NullPredicate_locals(), BP, rule_info);
    }
    NullPredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NullPredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_nullExpression(this.m_result.expr,this.m_locals.isNot);} // grammar line 2622
            break;
            case 1: {this.m_locals.isNot = true;} // grammar line 2621
            break;
            case 2: { this.m_locals.isNot = false; } // grammar line 2618
            break;
        }
    }; // NullPredicate_action.performAction()

    function InPredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new InPredicate_locals(), BP, rule_info);
    }
    InPredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    InPredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_inExpression(this.m_result.left,this.m_locals.list.res);} // grammar line 2632
            break;
            case 1: {this.m_locals.inExpression.getIns().push(this.m_locals.expr.res);} // grammar line 2641
            break;
            case 2: {
            this.m_result.res = this.m_locals.inExpression = IAstFactory.eINSTANCE.createInExpression();
            this.m_locals.inExpression.setLeft(this.m_result.left);
           } // grammar line 2636
            break;
            case 3: { this.m_locals.inExpression = null; } // grammar line 2627
            break;
        }
    }; // InPredicate_action.performAction()

    function ExpressionList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExpressionList_locals(), BP, rule_info);
    }
    ExpressionList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExpressionList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res.push(this.m_locals.expr.res);} // grammar line 2654
            break;
            case 1: {this.m_result.res.push(this.m_locals.expr.res);} // grammar line 2653
            break;
            case 2: {this.m_result.res = [];} // grammar line 2651
            break;
        }
    }; // ExpressionList_action.performAction()

    function Expression_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Expression_locals(), BP, rule_info);
    }
    Expression_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Expression_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_result.res = this.m_locals.exprConcat.res;} // grammar line 2661
            {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2663
            break;
        }
    }; // Expression_action.performAction()

    function ExprConcat_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprConcat_locals(), BP, rule_info);
    }
    ExprConcat_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprConcat_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _op_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2673
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprSum2.res,rnd.Parser.getTok(RESOLVER, this, _op_index));} // grammar line 2670
            break;
            case 2: {this.m_result.res = this.m_locals.exprSum1.res;} // grammar line 2668
            break;
        }
    }; // ExprConcat_action.performAction()

    function ExprSum_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprSum_locals(), BP, rule_info);
    }
    ExprSum_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprSum_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _opMinus_index = 2;
        var _opPlus_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2685
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res, this.m_locals.exprFactor2.res, rnd.Parser.getTok(RESOLVER, this, _opPlus_index));} // grammar line 2680
            break;
            case 2: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res, this.m_locals.exprFactor3.res, rnd.Parser.getTok(RESOLVER, this, _opMinus_index));} // grammar line 2682
            break;
            case 3: {this.m_result.res = this.m_locals.exprFactor1.res;} // grammar line 2678
            break;
        }
    }; // ExprSum_action.performAction()

    function ExprFactor_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprFactor_locals(), BP, rule_info);
    }
    ExprFactor_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprFactor_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _opDiv_index = 2;
        var _opMul_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm2.res,rnd.Parser.getTok(RESOLVER, this, _opMul_index));} // grammar line 2692
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm3.res,rnd.Parser.getTok(RESOLVER, this, _opDiv_index));} // grammar line 2694
            break;
            case 2: {this.m_result.res = this.m_locals.exprTerm1.res;} // grammar line 2690
            break;
        }
    }; // ExprFactor_action.performAction()

    function ExprTerm_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprTerm_locals(), BP, rule_info);
    }
    ExprTerm_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprTerm_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _opMinus_index = 2;
        var _opPlus_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2743
            break;
            case 2: {
       this.m_locals.exprCont = RESOLVER.createExpressionsContainerExpression();
       this.m_result.res = this.m_locals.exprCont;
       RESOLVER.addExpression(this.m_locals.exprCont,this.m_locals.col.res); // TODO: bug? always adding initial 'col' ??
 } // grammar line 2706
            { this.m_locals.gisFunction1.container = this.m_locals.exprCont; } // grammar line 2711
            break;
            case 3: {this.m_result.res = this.m_locals.col.res;} // grammar line 2703
            break;
            case 4: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null, this.m_locals.exprTerm1.res, rnd.Parser.getTok(RESOLVER, this, _opPlus_index));} // grammar line 2714
            break;
            case 5: {this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null, this.m_locals.exprTerm2.res, rnd.Parser.getTok(RESOLVER, this, _opMinus_index));} // grammar line 2715
            break;
            case 6: {this.m_result.res = this.m_locals.exprTerm3.res;} // grammar line 2716
            break;
            case 7: {this.m_result.res = RESOLVER.viewparser_iliteral(this.m_locals.literal.res);} // grammar line 2717
            break;
            case 8: {this.m_result.res = this.m_locals.agg.res;} // grammar line 2718
            break;
            case 9: {this.m_result.res = this.m_locals.func.res;} // grammar line 2719
            break;
            case 10: {this.m_result.res = this.m_locals.userDefinedFunc.res;} // grammar line 2720
            break;
            case 11: {this.m_result.res = this.m_locals.namedArgFunc.res;} // grammar line 2721
            break;
            case 12: { this.m_locals.gisFunction6.container = this.m_locals.exprCont; } // grammar line 2737
            break;
            case 13: { this.m_locals.gisFunction2.container = this.m_locals.exprCont; } // grammar line 2729
            break;
            case 14: { this.m_locals.gisFunction3.container = this.m_locals.exprCont; } // grammar line 2730
            break;
            case 15: { this.m_locals.gisFunction4.container = this.m_locals.exprCont; } // grammar line 2731
            break;
            case 16: { this.m_locals.gisFunction5.container = this.m_locals.exprCont; } // grammar line 2732
            break;
            case 17: {
       this.m_locals.exprCont = RESOLVER.createExpressionsContainerExpression();
       this.m_result.res = this.m_locals.exprCont;
      } // grammar line 2724
            break;
            case 18: {this.m_result.res = this.m_locals.session_user_function.res;} // grammar line 2740
            break;
            case 19: {this.m_result.res = this.m_locals.caseExpr.res;} // grammar line 2741
            break;
            case 20: { this.m_locals.exprCont = null; } // grammar line 2699
            break;
        }
    }; // ExprTerm_action.performAction()

    function CaseExpression_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new CaseExpression_locals(), BP, rule_info);
    }
    CaseExpression_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CaseExpression_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2777
            break;
            case 1: {RESOLVER.addElseExpression(this.m_result.res, this.m_locals.optElse.res);} // grammar line 2774
            break;
            case 3: {this.m_result.res = RESOLVER.createSimpleCaseExpression(this.m_locals.expr1.res);} // grammar line 2765
            { this.m_locals.WhenExpressionThenList.caseExpr = this.m_result.res; } // grammar line 2766
            break;
            case 5: {this.m_result.res = RESOLVER.createSearchedCaseExpression();} // grammar line 2769
            { this.m_locals.WhenConditionThenList.caseExpr = this.m_result.res; } // grammar line 2770
            break;
        }
    }; // CaseExpression_action.performAction()

    function WhenExpressionThenList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new WhenExpressionThenList_locals(), BP, rule_info);
    }
    WhenExpressionThenList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    WhenExpressionThenList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.WhenExpressionThen.caseExpr = this.m_result.caseExpr; } // grammar line 2782
            break;
        }
    }; // WhenExpressionThenList_action.performAction()

    function WhenConditionThenList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new WhenConditionThenList_locals(), BP, rule_info);
    }
    WhenConditionThenList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    WhenConditionThenList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.WhenConditionThen.caseExpr = this.m_result.caseExpr; } // grammar line 2787
            break;
        }
    }; // WhenConditionThenList_action.performAction()

    function WhenExpressionThen_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new WhenExpressionThen_locals(), BP, rule_info);
    }
    WhenExpressionThen_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    WhenExpressionThen_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    var caseWhen = RESOLVER.addAndReturnNewCaseWhenExpression( this.m_result.caseExpr, this.m_locals.expr1.res, this.m_locals.expr2.res);
    RESOLVER.viewparser_setStartEndTokenIndex(caseWhen, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
   } // grammar line 2796
            break;
        }
    }; // WhenExpressionThen_action.performAction()

    function WhenConditionThen_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new WhenConditionThen_locals(), BP, rule_info);
    }
    WhenConditionThen_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    WhenConditionThen_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    var caseWhen = RESOLVER.addAndReturnNewCaseWhenExpression( this.m_result.caseExpr, this.m_locals.cond1.res, this.m_locals.expr1.res);
    RESOLVER.viewparser_setStartEndTokenIndex(caseWhen, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
   } // grammar line 2808
            break;
        }
    }; // WhenConditionThen_action.performAction()

    function NumberLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NumberLiteral_locals(), BP, rule_info);
    }
    NumberLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NumberLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.int_lit.res;} // grammar line 2816
            break;
            case 1: {this.m_result.res = this.m_locals.real_lit.res;} // grammar line 2817
            break;
        }
    }; // NumberLiteral_action.performAction()

    function Literal_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Literal_locals(), BP, rule_info);
    }
    Literal_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Literal_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.int_val.res;} // grammar line 2821
            break;
            case 1: {this.m_result.res = this.m_locals.string_lit.res;} // grammar line 2822
            break;
            case 2: {this.m_result.res = this.m_locals.real_lit.res;} // grammar line 2823
            break;
            case 3: {this.m_result.res = this.m_locals.binary_lit.res;} // grammar line 2824
            break;
            case 4: {this.m_result.res = this.m_locals.date_lit.res;} // grammar line 2825
            break;
            case 5: {this.m_result.res = this.m_locals.time_lit.res;} // grammar line 2826
            break;
            case 6: {this.m_result.res = this.m_locals.timestamp_lit.res;} // grammar line 2827
            break;
            case 7: {this.m_result.res = this.m_locals.null_lit.res;} // grammar line 2828
            break;
            case 8: {this.m_result.res = this.m_locals.bool_lit.res;} // grammar line 2829
            break;
        }
    }; // Literal_action.performAction()

    function ExprAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprAlias_locals(), BP, rule_info);
    }
    ExprAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.alias = this.m_locals.id.res;} // grammar line 2838
            break;
            case 1: {this.m_result.expr = this.m_locals.e.res;} // grammar line 2834
            break;
        }
    }; // ExprAlias_action.performAction()

    function ExprAliasEnforced_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExprAliasEnforced_locals(), BP, rule_info);
    }
    ExprAliasEnforced_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExprAliasEnforced_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.alias = this.m_locals.id.res;} // grammar line 2846
            break;
            case 1: {this.m_result.expr = this.m_locals.e.res;} // grammar line 2844
            break;
        }
    }; // ExprAliasEnforced_action.performAction()

    function Agg_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Agg_locals(), BP, rule_info);
    }
    Agg_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Agg_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _d_index = 2;
        var _st_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2870
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res, RESOLVER.viewparser_iliteral(rnd.Parser.getTok(RESOLVER, this, _st_index)));} // grammar line 2855
            break;
            case 2: {
           this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr.res);
           this.m_result.res.setAllToken(this.m_locals.agg_all.res);
          } // grammar line 2858
            break;
            case 3: {
           this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr2.res);
           this.m_result.res.setDistinctToken(rnd.Parser.getTok(RESOLVER, this, _d_index));
          } // grammar line 2864
            break;
        }
    }; // Agg_action.performAction()

    function AggName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    AggName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AggName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 2883
            break;
        }
    }; // AggName_action.performAction()

    function OptAll_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    OptAll_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptAll_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _a_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.res = null;} // grammar line 2894
            break;
            case 1: {this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _a_index);} // grammar line 2895
            break;
        }
    }; // OptAll_action.performAction()

    function NamedArgFunc_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NamedArgFunc_locals(), BP, rule_info);
    }
    NamedArgFunc_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamedArgFunc_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2911
            break;
            case 1: { this.m_locals.NamedArgumentList.funcExpr = this.m_result.res; } // grammar line 2907
            break;
            case 2: { this.m_locals.expr.funcExpr = this.m_result.res; } // grammar line 2905
            break;
            case 3: {this.m_result.res = RESOLVER.viewparser_funcWithNamedParamExpression(this.m_locals.func_name.res);} // grammar line 2902
            break;
        }
    }; // NamedArgFunc_action.performAction()

    function NamedArgument_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NamedArgument_locals(), BP, rule_info);
    }
    NamedArgument_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamedArgument_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {this.m_locals.funcParam.setExpression(this.m_locals.expr1.res);} // grammar line 2921
            {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.funcParam, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());} // grammar line 2922
            break;
            case 2: {this.m_locals.funcParam = RESOLVER.viewparser_addFuncParam(this.m_result.funcExpr, this.m_locals.proc_param_name.res);} // grammar line 2918
            break;
            case 3: { this.m_locals.funcParam = null; } // grammar line 2915
            break;
        }
    }; // NamedArgument_action.performAction()

    function NamedArgumentList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NamedArgumentList_locals(), BP, rule_info);
    }
    NamedArgumentList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamedArgumentList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.expr_n.funcExpr = this.m_result.funcExpr; } // grammar line 2930
            break;
            case 1: { this.m_locals.expr.funcExpr = this.m_result.funcExpr; } // grammar line 2927
            break;
        }
    }; // NamedArgumentList_action.performAction()

    function GisNotSpatialFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisNotSpatialFunction_locals(), BP, rule_info);
    }
    GisNotSpatialFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisNotSpatialFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.func,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2960
            break;
            case 1: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func, this.m_locals.list.res[exCount] );
       }
      } // grammar line 2952
            break;
            case 2: {RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func,this.m_locals.expr.res);} // grammar line 2949
            break;
            case 3: {
       this.m_locals.func = RESOLVER.viewparser_funcExpression(this.m_locals.gisFunctionName.res);
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.func,this.m_locals.startIndex);
       RESOLVER.addExpression(this.m_result.container,this.m_locals.func);
      } // grammar line 2941
            break;
            case 4: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  this.m_locals.func = null;
 } // grammar line 2935
            break;
        }
    }; // GisNotSpatialFunction_action.performAction()

    function GisGeometryConstructor_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisGeometryConstructor_locals(), BP, rule_info);
    }
    GisGeometryConstructor_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisGeometryConstructor_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.func,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 2991
            break;
            case 1: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.addFuncExprParameter(this.m_locals.func, this.m_locals.list.res[exCount] );
       }
      } // grammar line 2983
            break;
            case 2: {RESOLVER.addFuncExprParameter(this.m_locals.func,this.m_locals.expr.res);} // grammar line 2980
            break;
            case 3: {
       this.m_locals.func = RESOLVER.createConstructorFuncExpression(this.m_locals.gisFunctionName.res);
       this.m_locals.func.setNewKeyword(rnd.Parser.getTok(RESOLVER, this, _n_index));
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.func,this.m_locals.startIndex);
       RESOLVER.addExpression(this.m_result.container,this.m_locals.func);
      } // grammar line 2971
            break;
            case 4: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  this.m_locals.func = null;
 } // grammar line 2964
            break;
        }
    }; // GisGeometryConstructor_action.performAction()

    function GisGeneralConstructor_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisGeneralConstructor_locals(), BP, rule_info);
    }
    GisGeneralConstructor_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisGeneralConstructor_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.func,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 3020
            break;
            case 1: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func, this.m_locals.list.res[exCount] );
       }
      } // grammar line 3012
            break;
            case 2: {RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func,this.m_locals.expr.res);} // grammar line 3009
            break;
            case 3: {
       this.m_locals.func = RESOLVER.viewparser_funcExpression(this.m_locals.gisFunctionName.res);
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.func,this.m_locals.startIndex);
       RESOLVER.addExpression(this.m_result.container,this.m_locals.func);
      } // grammar line 3001
            break;
            case 4: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  this.m_locals.func = null;
 } // grammar line 2995
            break;
        }
    }; // GisGeneralConstructor_action.performAction()

    function GisObjectiveFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisObjectiveFunction_locals(), BP, rule_info);
    }
    GisObjectiveFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisObjectiveFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.func,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 3053
            break;
            case 1: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func, this.m_locals.list.res[exCount] );
       }
      } // grammar line 3045
            break;
            case 2: {RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func,this.m_locals.expr.res);} // grammar line 3042
            break;
            case 3: {
       this.m_locals.func = RESOLVER.viewparser_funcExpression(this.m_locals.gisFunctionName.res);
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.func,this.m_locals.startIndex);
       RESOLVER.addExpression(this.m_result.container,this.m_locals.func);
      } // grammar line 3034
            break;
            case 4: {RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.funcWithNamedParams,this.m_locals.startIndex, RESOLVER.getLastMatchedTokenIndex());} // grammar line 3071
            break;
            case 5: { this.m_locals.NamedArgumentList.funcExpr = this.m_locals.funcWithNamedParams; } // grammar line 3067
            break;
            case 6: { this.m_locals.arg.funcExpr = this.m_locals.funcWithNamedParams; } // grammar line 3065
            break;
            case 7: {
       this.m_locals.funcWithNamedParams = RESOLVER.viewparser_funcWithNamedParamExpression(this.m_locals.gisNamedParameterFunctionName.res);
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.funcWithNamedParams,this.m_locals.startIndex);
       RESOLVER.addExpression(this.m_result.container,this.m_locals.funcWithNamedParams);
      } // grammar line 3058
            break;
            case 8: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  this.m_locals.func = null;
  this.m_locals.funcWithNamedParams = null;
 } // grammar line 3025
            break;
        }
    }; // GisObjectiveFunction_action.performAction()

    function GisNotSpatialFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisNotSpatialFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisNotSpatialFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3086
            break;
        }
    }; // GisNotSpatialFunctionName_action.performAction()

    function GisGeometryConstructorName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisGeometryConstructorName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisGeometryConstructorName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3108
            break;
        }
    }; // GisGeometryConstructorName_action.performAction()

    function GisGeneralConstructorName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisGeneralConstructorName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisGeneralConstructorName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3123
            break;
        }
    }; // GisGeneralConstructorName_action.performAction()

    function GisObjectiveFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisObjectiveFunctionName_locals(), BP, rule_info);
    }
    GisObjectiveFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisObjectiveFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.name.res;} // grammar line 3128
            break;
        }
    }; // GisObjectiveFunctionName_action.performAction()

    function GisObjectiveFunctionNameToken_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisObjectiveFunctionNameToken_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisObjectiveFunctionNameToken_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3206
            break;
        }
    }; // GisObjectiveFunctionNameToken_action.performAction()

    function GisObjectiveNamedParameterFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisObjectiveNamedParameterFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisObjectiveNamedParameterFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3211
            break;
        }
    }; // GisObjectiveNamedParameterFunctionName_action.performAction()

    function GisUnionAggregationFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new GisUnionAggregationFunction_locals(), BP, rule_info);
    }
    GisUnionAggregationFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisUnionAggregationFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_locals.func,RESOLVER.getLastMatchedTokenIndex());} // grammar line 3227
            break;
            case 1: {RESOLVER.viewparser_addFuncExprParameter(this.m_locals.func,this.m_locals.path.res);} // grammar line 3225
            break;
            case 2: {
       this.m_locals.func = RESOLVER.viewparser_funcExpression(this.m_locals.fname.res);
       RESOLVER.viewparser_setStartTokenIndex(this.m_locals.func,this.getFirstTokenIndex());
       RESOLVER.addExpression(this.m_result.container,this.m_locals.func);
      } // grammar line 3218
            break;
            case 3: { this.m_locals.func = null; } // grammar line 3215
            break;
        }
    }; // GisUnionAggregationFunction_action.performAction()

    function GisUnionAggregationFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    GisUnionAggregationFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    GisUnionAggregationFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3232
            break;
        }
    }; // GisUnionAggregationFunctionName_action.performAction()

    function SessionUserFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SessionUserFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SessionUserFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = RESOLVER.viewparser_funcExpression(rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex()));} // grammar line 3239
            break;
        }
    }; // SessionUserFunction_action.performAction()

    function Func_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Func_locals(), BP, rule_info);
    }
    Func_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Func_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       if (this.m_result.res != null) {
        RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res, this.getFirstTokenIndex(), RESOLVER.getLastMatchedTokenIndex());
       }
      } // grammar line 3279
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.constish_func_name.res);} // grammar line 3247
            break;
            case 2: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.viewparser_addFuncExprParameter(this.m_result.res, this.m_locals.list.res[exCount] );
       }
      } // grammar line 3259
            break;
            case 3: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3256
            break;
            case 4: {this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.simple_func_name.res);} // grammar line 3253
            break;
            case 5: {this.m_result.res = this.m_locals.trim_function.res;} // grammar line 3268
            break;
            case 6: {this.m_result.res = this.m_locals.extract_function.res;} // grammar line 3269
            break;
            case 7: {this.m_result.res = this.m_locals.cast_function.res;} // grammar line 3270
            break;
            case 8: {this.m_result.res = this.m_locals.day_of_week_function.res;} // grammar line 3271
            break;
            case 9: {this.m_result.res = this.m_locals.left_function.res;} // grammar line 3272
            break;
            case 10: {this.m_result.res = this.m_locals.right_function.res;} // grammar line 3273
            break;
            case 11: {this.m_result.res = this.m_locals.day_name_function.res;} // grammar line 3274
            break;
            case 12: {this.m_result.res = this.m_locals.month_name_function.res;} // grammar line 3275
            break;
        }
    }; // Func_action.performAction()

    function UserDefinedFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new UserDefinedFunction_locals(), BP, rule_info);
    }
    UserDefinedFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UserDefinedFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
        RESOLVER.viewparser_addFuncExprParameter(this.m_result.res, this.m_locals.list.res[exCount] );
       }
      } // grammar line 3297
            break;
            case 1: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3294
            break;
            case 2: {this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.udfFunctionName.res);} // grammar line 3290
            break;
        }
    }; // UserDefinedFunction_action.performAction()

    function UserDefinedFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    UserDefinedFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UserDefinedFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3341
            break;
        }
    }; // UserDefinedFunctionName_action.performAction()

    function NamedArgumentFuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NamedArgumentFuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamedArgumentFuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3349
            break;
        }
    }; // NamedArgumentFuncName_action.performAction()

    function SimpleFuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SimpleFuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SimpleFuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3484
            break;
        }
    }; // SimpleFuncName_action.performAction()

    function ConstishFuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ConstishFuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ConstishFuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3504
            break;
        }
    }; // ConstishFuncName_action.performAction()

    function TrimFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TrimFunction_locals(), BP, rule_info);
    }
    TrimFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TrimFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _f1_index = 1;
        var _f2_index = 2;
        var _t_index = 3;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr1.res);} // grammar line 3524
            break;
            case 1: {this.m_result.res.setFromKeyword(rnd.Parser.getTok(RESOLVER, this, _f1_index));} // grammar line 3523
            break;
            case 2: {this.m_result.res.setRemoveString(this.m_locals.remString1.res);} // grammar line 3521
            break;
            case 3: {this.m_result.res.setTrimPosition(this.m_locals.trim_position.res);} // grammar line 3519
            break;
            case 4: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr2.res);} // grammar line 3534
            break;
            case 5: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr3.res);} // grammar line 3541
            break;
            case 6: {this.m_result.res.setFromKeyword(rnd.Parser.getTok(RESOLVER, this, _f2_index));} // grammar line 3540
            break;
            case 7: {this.m_result.res.setRemoveString(this.m_locals.expr2.res);} // grammar line 3539
            break;
            case 8: {this.m_result.res.setName(rnd.Parser.getTok(RESOLVER, this, _t_index));} // grammar line 3512
            break;
            case 9: {this.m_result.res = IAstFactory.eINSTANCE.createTrimFunctionExpression();} // grammar line 3511
            break;
        }
    }; // TrimFunction_action.performAction()

    function TrimPosition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    TrimPosition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TrimPosition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3556
            break;
        }
    }; // TrimPosition_action.performAction()

    function ExtractFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ExtractFunction_locals(), BP, rule_info);
    }
    ExtractFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExtractFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _e_index = 2;
        var _f_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3567
            break;
            case 1: {this.m_result.res.setFromKeyword(rnd.Parser.getTok(RESOLVER, this, _f_index));} // grammar line 3566
            break;
            case 2: {this.m_result.res.setUnit(this.m_locals.extract_spec.res);} // grammar line 3565
            break;
            case 3: {this.m_result.res.setName(rnd.Parser.getTok(RESOLVER, this, _e_index));} // grammar line 3563
            break;
            case 4: {this.m_result.res = IAstFactory.eINSTANCE.createExtractFunctionExpression();} // grammar line 3562
            break;
        }
    }; // ExtractFunction_action.performAction()

    function ExtractSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ExtractSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ExtractSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3581
            break;
        }
    }; // ExtractSpec_action.performAction()

    function CastFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new CastFunction_locals(), BP, rule_info);
    }
    CastFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CastFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res.setTypeName(this.m_locals.cast_type_without_params.res);} // grammar line 3597
            break;
            case 1: {this.m_result.res.setDecimalsExpression(this.m_locals.decimals.res);} // grammar line 3615
            break;
            case 2: {this.m_result.res.setLengthExpression(this.m_locals.length.res);} // grammar line 3611
            break;
            case 3: {this.m_result.res.setTypeName(this.m_locals.cast_type_with_optional_params.res);} // grammar line 3606
            break;
            case 4: {this.m_result.res.setLengthExpression(this.m_locals.length_expr.res);} // grammar line 3631
            break;
            case 5: {this.m_result.res.setTypeName(this.m_locals.cast_type_with_optional_length_param.res);} // grammar line 3627
            break;
            case 6: {this.m_result.res = RESOLVER.createCastExpression(this.m_locals.expr.res,null,null,null,null);} // grammar line 3591
            break;
        }
    }; // CastFunction_action.performAction()

    function CastTypeWithoutParams_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    CastTypeWithoutParams_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CastTypeWithoutParams_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3663
            break;
        }
    }; // CastTypeWithoutParams_action.performAction()

    function CastTypeWithOptionalParams_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    CastTypeWithOptionalParams_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CastTypeWithOptionalParams_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3673
            break;
        }
    }; // CastTypeWithOptionalParams_action.performAction()

    function CastTypeWithOptionalLengthParam_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    CastTypeWithOptionalLengthParam_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CastTypeWithOptionalLengthParam_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3684
            break;
        }
    }; // CastTypeWithOptionalLengthParam_action.performAction()

    function DayOfWeekFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DayOfWeekFunction_locals(), BP, rule_info);
    }
    DayOfWeekFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DayOfWeekFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _day_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3695
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_funcExpression((rnd.Parser.getTok(RESOLVER, this, _day_index)));} // grammar line 3693
            break;
        }
    }; // DayOfWeekFunction_action.performAction()

    function LeftFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new LeftFunction_locals(), BP, rule_info);
    }
    LeftFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    LeftFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _left_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr2.res);} // grammar line 3706
            break;
            case 1: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr1.res);} // grammar line 3704
            break;
            case 2: {this.m_result.res = RESOLVER.viewparser_funcExpression((rnd.Parser.getTok(RESOLVER, this, _left_index)));} // grammar line 3702
            break;
        }
    }; // LeftFunction_action.performAction()

    function RightFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RightFunction_locals(), BP, rule_info);
    }
    RightFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RightFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _right_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr2.res);} // grammar line 3717
            break;
            case 1: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr1.res);} // grammar line 3715
            break;
            case 2: {this.m_result.res = RESOLVER.viewparser_funcExpression((rnd.Parser.getTok(RESOLVER, this, _right_index)));} // grammar line 3713
            break;
        }
    }; // RightFunction_action.performAction()

    function DayNameFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DayNameFunction_locals(), BP, rule_info);
    }
    DayNameFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DayNameFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _day_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3726
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_funcExpression((rnd.Parser.getTok(RESOLVER, this, _day_index)));} // grammar line 3724
            break;
        }
    }; // DayNameFunction_action.performAction()

    function MonthNameFunction_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new MonthNameFunction_locals(), BP, rule_info);
    }
    MonthNameFunction_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    MonthNameFunction_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _month_index = 1;
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);} // grammar line 3735
            break;
            case 1: {this.m_result.res = RESOLVER.viewparser_funcExpression((rnd.Parser.getTok(RESOLVER, this, _month_index)));} // grammar line 3733
            break;
        }
    }; // MonthNameFunction_action.performAction()

    function SeriesFunctionName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SeriesFunctionName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SeriesFunctionName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3795
            break;
        }
    }; // SeriesFunctionName_action.performAction()

    function RoundingMode_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    RoundingMode_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RoundingMode_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());} // grammar line 3809
            break;
        }
    }; // RoundingMode_action.performAction()

    function annotationDefintionsWithAnnotation_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationDefintionsWithAnnotation_locals(), BP, rule_info);
    }
    annotationDefintionsWithAnnotation_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationDefintionsWithAnnotation_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
       // TODO: assert AnnoDecl always returns result, same for _PreAnnos
 if (this.m_locals.definition.anno != null && this.m_locals.annotations.res != null) {
       RESOLVER.addAnnotations(this.m_locals.definition.anno,this.m_locals.annotations.res);
      }
     } // grammar line 3837
            break;
            case 1: { this.m_locals.definition.annots = null; this.m_locals.definition.parentStmts = null; } // grammar line 3836
            break;
            case 2: {RESOLVER.compilationUnit = IAstFactory.eINSTANCE.createCompilationUnit();} // grammar line 3832
            break;
        }
    }; // annotationDefintionsWithAnnotation_action.performAction()

    function AnnotationDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationDeclaration_locals(), BP, rule_info);
    }
    AnnotationDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.anno,RESOLVER.getLastMatchedTokenIndex());} // grammar line 3863
            break;
            case 2: {
       this.m_result.anno = RESOLVER.createAnnotationDeclarationWithPath(this.m_locals.name.res);
       if (this.m_result.parentStmts != null) {
        this.m_result.parentStmts.push(this.m_result.anno);
       }else{
        RESOLVER.viewparser_setDDLStmt(this.m_result.anno);
       }
       if (this.m_result.annots != null) {
        RESOLVER.addAnnotations(this.m_result.anno,this.m_result.annots);
       }
       RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.anno,this.getFirstTokenIndex(),-1);
      } // grammar line 3850
            { this.m_locals.type.element = this.m_result.anno; } // grammar line 3862
            break;
        }
    }; // AnnotationDeclaration_action.performAction()

    function annotationTypeSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationTypeSpec_locals(), BP, rule_info);
    }
    annotationTypeSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationTypeSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotationTypeArray.element = this.m_result.element; } // grammar line 3893
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 3894
            break;
            case 2: { this.m_locals.AnnotationTypeTypeOf.element = this.m_result.element; } // grammar line 3895
            break;
            case 3: { this.m_locals.type2.element = this.m_result.element; this.m_locals.type2.type = null; } // grammar line 3898
            break;
        }
    }; // annotationTypeSpec_action.performAction()

    function AnnotationTypeTypeOf_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeTypeOf_locals(), BP, rule_info);
    }
    AnnotationTypeTypeOf_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeTypeOf_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.element.setTypeOfPath(this.m_locals.id.res);} // grammar line 3903
            break;
        }
    }; // AnnotationTypeTypeOf_action.performAction()

    function AnnotationTypeNamedOrEnum_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeNamedOrEnum_locals(), BP, rule_info);
    }
    AnnotationTypeNamedOrEnum_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeNamedOrEnum_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotationDefaultClause.res = this.m_result.element; } // grammar line 3916
            break;
            case 1: { this.m_locals.enumeration.element = this.m_result.element; this.m_locals.enumeration.val = null; } // grammar line 3912
            break;
            case 2: { this.m_locals.AnnotationTypeNamed.element = this.m_result.element; } // grammar line 3909
            break;
        }
    }; // AnnotationTypeNamedOrEnum_action.performAction()

    function AnnotationDefaultClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationDefaultClause_locals(), BP, rule_info);
    }
    AnnotationDefaultClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationDefaultClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setElementDefault(this.m_result.res,this.m_locals.expr.res);} // grammar line 3926
            break;
            case 1: {RESOLVER.viewparser_setElementDefaultToken(this.m_result.res,this.m_locals.enumVal.res);} // grammar line 3929
            break;
        }
    }; // AnnotationDefaultClause_action.performAction()

    function AnnotationTypeNamed_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeNamed_locals(), BP, rule_info);
    }
    AnnotationTypeNamed_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeNamed_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.setDecimals(this.m_result.element,this.m_locals.val.res);} // grammar line 3939
            break;
            case 1: {RESOLVER.setLength(this.m_result.element,this.m_locals.val.res);} // grammar line 3938
            break;
            case 2: {this.m_result.element.setTypeIdPath(this.m_locals.typeName.res);} // grammar line 3935
            break;
        }
    }; // AnnotationTypeNamed_action.performAction()

    function AnnotationTypeSpecNoColon_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeSpecNoColon_locals(), BP, rule_info);
    }
    AnnotationTypeSpecNoColon_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeSpecNoColon_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.annotationStructuredType.element = this.m_result.element; this.m_locals.annotationStructuredType.type = null; } // grammar line 3946
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 3947
            break;
        }
    }; // AnnotationTypeSpecNoColon_action.performAction()

    function AnnotationTypeArray_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeArray_locals(), BP, rule_info);
    }
    AnnotationTypeArray_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeArray_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _lit_index = 1;
        switch (_action_num) {
            case 1: {this.m_result.element.setArrayOfToken(rnd.Parser.getTok(RESOLVER, this, _lit_index));} // grammar line 3953
            { this.m_locals.AnnotationTypeSpecNoColon.element = this.m_result.element; } // grammar line 3954
            break;
            case 2: {this.m_result.element.setArrayToken (rnd.Parser.getTok(RESOLVER, this, _lit_index));} // grammar line 3952
            break;
        }
    }; // AnnotationTypeArray_action.performAction()

    function AnnotationTypeName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeName_locals(), BP, rule_info);
    }
    AnnotationTypeName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {this.m_result.res = this.m_locals.typeName.res;} // grammar line 3960
            break;
        }
    }; // AnnotationTypeName_action.performAction()

    function annotationEnumClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationEnumClause_locals(), BP, rule_info);
    }
    annotationEnumClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationEnumClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.val,RESOLVER.getLastMatchedTokenIndex());} // grammar line 3981
            break;
            case 2: {this.m_result.val.setLiteral(RESOLVER.viewparser_cliteral(this.m_locals.lit.res));} // grammar line 3974
            {
           if (this.m_result.val.getLiteral() == null) {
            var implicitSymbol = RESOLVER.viewparser_cliteral(this.m_locals.symbol.res);
            this.m_result.val.setLiteral(implicitSymbol);
           }
          } // grammar line 3975
            break;
            case 3: {this.m_result.val.setSymbol(this.m_locals.symbol.res);} // grammar line 3972
            break;
            case 4: {
           this.m_result.val = RESOLVER.createAndSetEnumerationValue(this.m_result.enumeration);
           RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.val,RESOLVER.getNextTokenIndex(), -1);
          } // grammar line 3968
            break;
            case 5: {this.m_result.enumeration = RESOLVER.createAndSetEnumerationDeclaration(this.m_result.element);} // grammar line 3965
            break;
        }
    }; // annotationEnumClause_action.performAction()

    function annotationStructuredType_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationStructuredType_locals(), BP, rule_info);
    }
    annotationStructuredType_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationStructuredType_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {RESOLVER.viewparser_setEndTokenIndex(this.m_locals.type,RESOLVER.getLastMatchedTokenIndex());} // grammar line 4001
            break;
            case 1: {RESOLVER.viewparser_setEndTokenIndex(this.m_result.element, RESOLVER.getLastMatchedTokenIndex());} // grammar line 3998
            break;
            case 3: {this.m_result.element.setNameToken(this.m_locals.name.res);} // grammar line 3997
            { this.m_locals.type.element = this.m_result.element; } // grammar line 3998
            break;
            case 4: {
             this.m_result.element = RESOLVER.createAndSetAttributeDeclaration(this.m_locals.type);
             RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.element, RESOLVER.getNextTokenIndex(), -1);
            } // grammar line 3993
            break;
            case 5: {
             this.m_locals.type = RESOLVER.createAndSetAnonymousTypeDeclaration(this.m_result.element);
             RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.type, this.getFirstTokenIndex(), -1);
            } // grammar line 3988
            break;
        }
    }; // annotationStructuredType_action.performAction()

    function NOT_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NOT_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NOT_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);} // grammar line 4012
            break;
        }
    }; // NOT_action.performAction()

    function NULL_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NULL_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NULL_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);} // grammar line 4013
            break;
        }
    }; // NULL_action.performAction()

    CdsDdlParserResolver.prototype.createFrame0 = function(frame_num, rule_info) {
        switch (frame_num) {
            case 0: // START1
                return new START_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 1: // START_SYNTAX_COLORING1
                return new START_SYNTAX_COLORING_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 2: // QLPathStartRule2
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new QLPathStartRule_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 4: // START22
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 6: // TopLevelDeclaration1
                return new TopLevelDeclaration_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 7: // UsingDirectiveList1
                return new UsingDirectiveList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.UsingDirectiveList);
            case 8: // NamespaceDeclaration1
                return new NamespaceDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespaceDeclaration);
            case 9: // InPackageDeclaration1
                return new InPackageDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.InPackageDeclaration);
            case 10: // START21
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 11: // AnnotatedElementDeclaration2
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclaration);
            case 13: // NamespacePath2
                return new NamespacePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespacePath);
            case 14: // IdWrapper28
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 15: // UsingPath4
                return new UsingPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 16: // UsingDirective1
                return new UsingDirective_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.directive);
            case 17: // IdWrapper5
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 18: // UsingPath1
                return new UsingPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 19: // PathWithNamespace1
                return new PathWithNamespace_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path1);
            case 20: // PathSimple1
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path2);
            case 21: // MainArtifactDefinition1
                return new MainArtifactDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.MainArtifactDefinition);
            case 22: // AccessPolicyDeclaration1
                return new AccessPolicyDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AccessPolicyDeclaration);
            case 23: // ExtensionPackageDefinition1
                return new ExtensionPackageDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ExtensionPackageDefinition);
            case 24: // ExtendStatement2
                return new ExtendStatement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ExtendStatement);
            case 25: // _PreAnnotations1
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 26: // UsingPath3
                return new UsingPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.next);
            case 27: // UsingPath2
                return new UsingPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.first);
            case 28: // DefId8
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 29: // MainArtifactList2
                return new MainArtifactList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.MainArtifactList);
            case 30: // PathSimple3
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p);
            case 31: // __createExtend1
                return new __createExtend_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.extend);
            case 32: // ElementDefExtList1
                return new ElementDefExtList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ElementDefExtList);
            case 33: // PathSimple4
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p);
            case 34: // __createExtend2
                return new __createExtend_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.extend);
            case 35: // __createExtend3
                return new __createExtend_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.extend);
            case 36: // MainArtifactDefinition2
                return new MainArtifactDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.MainArtifactDefinition);
            case 37: // ExtendStatement1
                return new ExtendStatement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ExtendStatement);
            case 38: // _PreAnnotations2
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 39: // PreAnnotation1
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 40: // MainArtifactList1
                return new MainArtifactList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.MainArtifactList);
            case 41: // QualifiedDefId1
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 42: // ContextDeclaration1
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ContextDeclaration);
            case 43: // TypeDeclaration1
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TypeDeclaration);
            case 44: // EntityDeclaration1
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.EntityDeclaration);
            case 45: // ViewDeclaration1
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ViewDeclaration);
            case 46: // ConstDeclaration1
                return new ConstDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ConstDeclaration);
            case 47: // AnnotationDeclaration1
                return new AnnotationDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationDeclaration);
            case 48: // AccessPolicyComponentDeclaration1
                return new AccessPolicyComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AccessPolicyComponentDeclaration);
            case 49: // QualifiedDefId7
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 50: // RoleDeclaration1
                return new RoleDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RoleDeclaration);
            case 51: // AspectDeclaration2
                return new AspectDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AspectDeclaration);
            case 52: // _PreAnnotations7
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 53: // RuleDeclaration1
                return new RuleDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RuleDeclaration);
            case 54: // QualifiedDefId8
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 55: // RuleSubquery1
                return new RuleSubquery_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rule);
            case 56: // RuleIncludedRole1
                return new RuleIncludedRole_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.incl);
            case 57: // AspectDeclaration1
                return new AspectDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a_decl);
            case 58: // PathSimple17
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.role);
            case 59: // WhereClause2
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 60: // RuleFromClause1
                return new RuleFromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RuleFromClause);
            case 61: // QLPath6
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path1);
            case 62: // QLPath7
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path2);
            case 63: // QLSubqueryElementary3
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSubqueryElementary);
            case 64: // QualifiedDefId9
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 65: // TechnicalConfiguration1
                return new TechnicalConfiguration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TechnicalConfiguration);
            case 66: // SeriesDefinition1
                return new SeriesDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.SeriesDefinition);
            case 67: // IndexDefinition1
                return new IndexDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.IndexDefinition);
            case 68: // AnnotatedElementDeclarationLoop1
                return new AnnotatedElementDeclarationLoop_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclarationLoop);
            case 69: // QualifiedDefId3
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 70: // StoreDefinition1
                return new StoreDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StoreDefinition);
            case 71: // IndexDefinition2
                return new IndexDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.IndexDefinition);
            case 72: // FulltextIndexDefinition1
                return new FulltextIndexDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.FulltextIndexDefinition);
            case 73: // FuzzyIndexDefinition1
                return new FuzzyIndexDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.FuzzyIndexDefinition);
            case 74: // PartitionDefinition1
                return new PartitionDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionDefinition);
            case 75: // TableGroupDefinition1
                return new TableGroupDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableGroupDefinition);
            case 76: // TableUnloadDefinition1
                return new TableUnloadDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableUnloadDefinition);
            case 77: // OptAscDesc1
                return new OptAscDesc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 78: // PathWithOrder2
                return new PathWithOrder_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p);
            case 79: // PathWithOrder1
                return new PathWithOrder_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p);
            case 80: // DefId5
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 81: // IdWrapper14
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 82: // FulltextIndexParameters1
                return new FulltextIndexParameters_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.FulltextIndexParameters);
            case 83: // PathSimple9
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.column);
            case 84: // IdWrapper20
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 85: // PathSimple10
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pval);
            case 86: // StringLiteralWrapper5
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 87: // StringLiteralWrapper4
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 88: // StringLiteralWrapper6
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sval);
            case 89: // PathSimple11
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pval);
            case 90: // FTI_ON_OFF1
                return new FTI_ON_OFF_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.fval);
            case 91: // NumberLiteral1
                return new NumberLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nval);
            case 92: // StringLiteralWrapper7
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sval);
            case 93: // FTI_ON_OFF2
                return new FTI_ON_OFF_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.fval);
            case 94: // FTI_ON_OFF3
                return new FTI_ON_OFF_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.fval);
            case 95: // StringLiteralWrapper8
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sval);
            case 96: // FTI_ON_OFF4
                return new FTI_ON_OFF_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.fval);
            case 97: // FTI_ON_OFF5
                return new FTI_ON_OFF_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tmTok);
            case 98: // StringLiteralWrapper9
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tmCfg);
            case 99: // FullTextChangeTracking1
                return new FullTextChangeTracking_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.FullTextChangeTracking);
            case 100: // AsyncSpec1
                return new AsyncSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.asyncSpec);
            case 101: // IntLiteralWrapper11
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.m1);
            case 102: // IntLiteralWrapper10
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.n);
            case 103: // IntLiteralWrapper12
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.m2);
            case 104: // StringLiteralWrapper10
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l1);
            case 105: // PathSimple12
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.column);
            case 106: // KeyList1
                return new KeyList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.keyList);
            case 107: // SeriesDistance1
                return new SeriesDistance_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.seriesDistance);
            case 108: // NumberConst1
                return new NumberConst_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.minValue);
            case 109: // NumberConst2
                return new NumberConst_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.maxValue);
            case 110: // SeriesPeriod1
                return new SeriesPeriod_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.periodForSeries);
            case 111: // KeyList2
                return new KeyList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alternatePeriodForSeries);
            case 112: // IdWrapper16
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idn);
            case 113: // IdWrapper15
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 114: // DistanceNumber1
                return new DistanceNumber_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.num);
            case 115: // SeriesIntervalConstValue1
                return new rnd.UserStackframeT(this.m_current.m_BP.ptr().m_local_base.val, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
            case 116: // IntLiteralWrapper15
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.prioVal);
            case 117: // TableGroupSpec1
                return new TableGroupSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableGroupSpec);
            case 118: // IdWrapper21
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 119: // PartitionScheme2
                return new PartitionScheme_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionScheme);
            case 120: // PartitionScheme1
                return new PartitionScheme_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionScheme);
            case 121: // HashPartition1
                return new HashPartition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.HashPartition);
            case 122: // RangePartition1
                return new RangePartition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RangePartition);
            case 123: // RoundRobinPartition1
                return new RoundRobinPartition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RoundRobinPartition);
            case 124: // NumberPartitions1
                return new NumberPartitions_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.num);
            case 125: // PartitionExpressions1
                return new PartitionExpressions_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionExpressions);
            case 126: // PartitionRanges1
                return new PartitionRanges_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionRanges);
            case 127: // PartitionExpressions2
                return new PartitionExpressions_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionExpressions);
            case 128: // NumberPartitions2
                return new NumberPartitions_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.num);
            case 129: // RangeSpec2
                return new RangeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RangeSpec);
            case 130: // RangeSpec1
                return new RangeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RangeSpec);
            case 131: // RangeValue2
                return new RangeValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.upperValue);
            case 132: // RangeValue1
                return new RangeValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lowerValue);
            case 133: // RangeValue3
                return new RangeValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exactlyValue);
            case 134: // IntLiteralWrapper14
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ilit);
            case 135: // StringLiteralWrapper11
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.slit);
            case 136: // RealLiteral4
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rlit);
            case 137: // DateLiteral3
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.dlit);
            case 138: // BooleanLiteral2
                return new BooleanLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.blit);
            case 139: // PartitionExpression2
                return new PartitionExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionExpression);
            case 140: // PartitionExpression1
                return new PartitionExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PartitionExpression);
            case 141: // PathSimple13
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.simplePath);
            case 142: // PathSimple14
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.yearPath);
            case 143: // PathSimple15
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.monthPath);
            case 144: // IntLiteralWrapper13
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ilit);
            case 145: // DistanceNumber2
                return new DistanceNumber_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.dist);
            case 146: // IdWrapper17
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id0);
            case 147: // IdWrapper19
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 148: // IdWrapper18
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 149: // AnnotatedElementDeclaration1
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclaration);
            case 150: // QLSelectStmtNoOption1
                return new QLSelectStmtNoOption_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectStmtNoOption);
            case 151: // ParameterDeclarationList1
                return new ParameterDeclarationList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ParameterDeclarationList);
            case 152: // QualifiedDefId4
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 153: // ParameterDeclaration2
                return new ParameterDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ParameterDeclaration);
            case 154: // ParameterDeclaration1
                return new ParameterDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ParameterDeclaration);
            case 155: // DefaultClause3
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 156: // TypeSpec4
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 157: // DefId6
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 158: // ElementDeclaration2
                return new ElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ElementDeclaration);
            case 159: // _PreAnnotations5
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 160: // Nullability1
                return new Nullability_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Nullability);
            case 161: // DefaultClause2
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 162: // Expression49
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 163: // TypeSpec1
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 164: // Expression50
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 165: // DefId2
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 166: // ElementModifier1
                return new ElementModifier_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.modifiers);
            case 167: // NULL3
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nu);
            case 168: // NOT4
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.no);
            case 169: // Expression48
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 170: // EnumIdWrapper1
                return new EnumIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumVal);
            case 171: // ConstValue1
                return new ConstValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 172: // TypeSpec5
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TypeSpec);
            case 173: // QualifiedDefId5
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 174: // Expression56
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exp);
            case 175: // Expression1
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 176: // DefId3
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 177: // StructuredType3
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredType);
            case 178: // TypeSpec3
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 179: // QualifiedDefId2
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 180: // ElementDeclaration1
                return new ElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ElementDeclaration);
            case 181: // _PreAnnotations3
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 182: // StructuredTypeComponent1
                return new StructuredTypeComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredTypeComponent);
            case 183: // AnnotatedTypeComponentDeclaration1
                return new AnnotatedTypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typecomponent);
            case 184: // TypeComponentDeclaration1
                return new TypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeCompDecl);
            case 185: // _PreAnnotations4
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 186: // DefaultClause1
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 187: // TypeSpec2
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 188: // DefId4
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 189: // TypeTypeOf1
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 190: // TypeArray1
                return new TypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.arr);
            case 191: // TypeNamedOrEnum2
                return new TypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 192: // TypeAssoc1
                return new TypeAssoc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeassoc);
            case 194: // StructuredType2
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp_list);
            case 195: // TypeTypeOf2
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 196: // TypeNamedOrEnum1
                return new TypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 197: // StructuredType1
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredType);
            case 198: // PathSimple5
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 199: // TypeSpecNoColon1
                return new TypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sub);
            case 200: // EnumValueDeclaration1
                return new EnumValueDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.val_decl);
            case 201: // TypeNamed1
                return new TypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.named);
            case 202: // IntLiteralWrapper3
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 203: // IntLiteralWrapper2
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 204: // TypeName1
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 205: // PathSimple6
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 206: // AssociationForeignKeyElement1
                return new AssociationForeignKeyElement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationForeignKeyElement);
            case 207: // PathWithAlias2
                return new PathWithAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.kn);
            case 208: // PathWithAlias1
                return new PathWithAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.k1);
            case 209: // PathSimple7
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.target);
            case 210: // Cardinality1
                return new Cardinality_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Cardinality);
            case 211: // AssociationForeignKeys1
                return new AssociationForeignKeys_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationForeignKeys);
            case 212: // AssociationOnCondition1
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 213: // Condition4
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 214: // AssocForeignKeyOrJoinCondition1
                return new AssocForeignKeyOrJoinCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssocForeignKeyOrJoinCondition);
            case 215: // AssociationTo1
                return new AssociationTo_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.assocTo);
            case 216: // IntLiteralWrapper8
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.max1);
            case 217: // IntLiteralWrapper7
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.min);
            case 218: // IntLiteralWrapper6
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.srcMax);
            case 219: // IdWrapper2
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 220: // DefId1
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defid);
            case 221: // IdWrapper7
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 222: // IdWrapper6
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 223: // QuotedId1
                return new QuotedId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idq);
            case 224: // IdWrapper10
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 225: // NULL1
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullLit);
            case 226: // IdWrapper8
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 227: // PathSimple2
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.refToConst);
            case 228: // AnnotationLiteral1
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit_val);
            case 229: // RecordValue1
                return new RecordValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordValue);
            case 230: // ArrayValue1
                return new ArrayValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ArrayValue);
            case 231: // RecordComponent2
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 232: // RecordComponent1
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 233: // AnnotationValue1
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 235: // AnnotationPath1
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 236: // AnnotationValue2
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 238: // AnnotationPath2
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 239: // AnnotationValue4
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 240: // AnnotationValue3
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 241: // AnnotationId2
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 242: // AnnotationId1
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 243: // StringLiteralWrapper1
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.str_val);
            case 244: // IntLiteralWrapper1
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 245: // RealLiteral1
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 246: // BinaryLiteral1
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 247: // DateLiteral1
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 248: // TimeLiteral1
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 249: // TimeStampLiteral1
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 250: // NullLiteral1
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 251: // QLSubqueryComplex1
                return new QLSubqueryComplex_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSubqueryComplex);
            case 252: // QLSubqueryComplex2
                return new QLSubqueryComplex_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1);
            case 253: // OrderByClause1
                return new OrderByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.OrderByClause);
            case 254: // QLSubquerySet1
                return new QLSubquerySet_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq);
            case 255: // QLSubqueryElementary2
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq2a);
            case 256: // QLSubqueryWithParens2
                return new QLSubqueryWithParens_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq2b);
            case 257: // SetOperator1
                return new SetOperator_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.set);
            case 258: // QLSubqueryElementary1
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1a);
            case 259: // QLSubqueryWithParens1
                return new QLSubqueryWithParens_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1b);
            case 260: // HavingClause1
                return new HavingClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.having);
            case 261: // GroupByClause1
                return new GroupByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.group);
            case 262: // WhereClause1
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 263: // QLSelectClause1
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.select);
            case 265: // AdhocDeclarationBlock1
                return new AdhocDeclarationBlock_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.adhoc);
            case 266: // FromClause1
                return new FromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.from);
            case 267: // AdhocElementDeclaration1
                return new AdhocElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elem);
            case 268: // Expression51
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 269: // AssociationOnCondition2
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 270: // AssociationTo2
                return new AssociationTo_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.assocTo);
            case 272: // Expression52
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 273: // DefId7
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 274: // QLSelectList1
                return new QLSelectList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectList);
            case 275: // AnnotatedQLSelectItem2
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 276: // AnnotatedQLSelectItem1
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedQLSelectItem);
            case 277: // QLSelectItem1
                return new QLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectItem);
            case 278: // _PreAnnotations6
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 279: // ExprSelectItem1
                return new ExprSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 280: // QLPathListSelectItem1
                return new QLPathListSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 281: // IdWrapper25
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 282: // QLSelectClause2
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 283: // QLPathListSelectItemAlias1
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 284: // QLPath5
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pathExp);
            case 285: // QLPathListSelectItemAlias2
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 286: // QLSelectClause3
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p3);
            case 287: // Filter2
                return new Filter_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.f2);
            case 288: // IdWrapper11
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 289: // Filter1
                return new Filter_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.f1);
            case 290: // IdWrapper9
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 291: // ScopedIdWrapper1
                return new ScopedIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idsc1);
            case 292: // Condition1
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c);
            case 294: // IntLiteralWrapper4
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.IntLiteralWrapper);
            case 295: // IdWrapper4
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 296: // IdWrapper3
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 297: // PathGeneric2
                return new PathGeneric_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PathGeneric);
            case 298: // PathGeneric1
                return new PathGeneric_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PathGeneric);
            case 299: // NamespacePath1
                return new NamespacePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespacePath);
            case 300: // IdWrapper1
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 301: // IdWrapper13
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 302: // PathSimple8
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 303: // ExprAliasEnforced1
                return new ExprAliasEnforced_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias2);
            case 304: // ExprAlias1
                return new ExprAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 305: // TablePathList1
                return new TablePathList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TablePathList);
            case 306: // TableOrJoin1
                return new TableOrJoin_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableOrJoin);
            case 307: // TablePath1
                return new TablePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TablePath);
            case 308: // TableOrJoin2
                return new TableOrJoin_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableOrJoin);
            case 309: // Condition5
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 310: // TableOrJoin3
                return new TableOrJoin_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TableOrJoin);
            case 311: // JoinType1
                return new JoinType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.jt);
            case 312: // Table2
                return new Table_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rightTable2);
            case 313: // Table1
                return new Table_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Table);
            case 314: // OuterJoinType1
                return new OuterJoinType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.outer);
            case 315: // IdWrapper22
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 316: // TablePathAlias1
                return new TablePathAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 317: // QLPath4
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 318: // Condition6
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 319: // ExpressionList8
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 320: // Condition7
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 321: // SortSpecList1
                return new SortSpecList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 322: // SortSpec2
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.spec);
            case 323: // SortSpec1
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.spec);
            case 324: // OptNullsFirstLast1
                return new OptNullsFirstLast_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nfl);
            case 325: // OptAscDesc2
                return new OptAscDesc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 326: // Expression55
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 327: // ConditionAnd2
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 328: // ConditionAnd1
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condAnd);
            case 329: // ConditionTerm3
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 330: // ConditionTerm1
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condTerm);
            case 331: // ConditionTerm2
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 332: // NOT1
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 333: // Condition2
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond2);
            case 334: // PredicateLeftIsExpression1
                return new PredicateLeftIsExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pred);
            case 335: // ComparisonPredicate1
                return new ComparisonPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp);
            case 336: // NullPredicate1
                return new NullPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullPred);
            case 337: // RangePredicate1
                return new RangePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.range);
            case 338: // LikePredicate1
                return new LikePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.like);
            case 339: // InPredicate1
                return new InPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.inP);
            case 340: // NOT3
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 341: // Expression2
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.left);
            case 343: // Expression3
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 345: // Expression5
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 346: // Expression4
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 347: // Expression7
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 348: // Expression6
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 350: // NULL2
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NULL);
            case 351: // NOT2
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 352: // ExpressionList1
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 353: // Expression10
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 355: // Expression9
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 356: // Expression8
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 357: // ExprConcat1
                return new ExprConcat_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprConcat);
            case 358: // ExprSum2
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum2);
            case 359: // ExprSum1
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum1);
            case 360: // ExprFactor2
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor2);
            case 361: // ExprFactor3
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor3);
            case 362: // ExprFactor1
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor1);
            case 363: // ExprTerm4
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 364: // ExprTerm5
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 365: // ExprTerm1
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 366: // GisObjectiveFunction1
                return new GisObjectiveFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction1);
            case 367: // QLPath1
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.col);
            case 368: // ExprTerm2
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 369: // ExprTerm3
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 370: // Expression13
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 371: // Literal1
                return new Literal_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.literal);
            case 372: // Agg1
                return new Agg_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg);
            case 373: // Func1
                return new Func_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func);
            case 374: // UserDefinedFunction1
                return new UserDefinedFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.userDefinedFunc);
            case 375: // NamedArgFunc1
                return new NamedArgFunc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.namedArgFunc);
            case 376: // GisObjectiveFunction2
                return new GisObjectiveFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction6);
            case 377: // GisNotSpatialFunction1
                return new GisNotSpatialFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction2);
            case 378: // GisGeometryConstructor1
                return new GisGeometryConstructor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction3);
            case 379: // GisGeneralConstructor1
                return new GisGeneralConstructor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction4);
            case 380: // GisUnionAggregationFunction1
                return new GisUnionAggregationFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunction5);
            case 381: // SessionUserFunction1
                return new SessionUserFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.session_user_function);
            case 382: // CaseExpression1
                return new CaseExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.caseExpr);
            case 383: // QLPathStartRule1
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new QLPathStartRule_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 384: // QLPath2
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPath);
            case 385: // Expression47
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.optElse);
            case 386: // WhenExpressionThenList1
                return new WhenExpressionThenList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.WhenExpressionThenList);
            case 387: // Expression43
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 388: // WhenConditionThenList1
                return new WhenConditionThenList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.WhenConditionThenList);
            case 389: // WhenExpressionThen1
                return new WhenExpressionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.WhenExpressionThen);
            case 390: // WhenConditionThen1
                return new WhenConditionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.WhenConditionThen);
            case 391: // Expression45
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 392: // Expression44
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 393: // Expression46
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 394: // Condition3
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 395: // IntLiteralWrapper9
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_lit);
            case 396: // RealLiteral3
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 397: // IntLiteralWrapper5
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 398: // StringLiteralWrapper2
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.string_lit);
            case 399: // RealLiteral2
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 400: // BinaryLiteral2
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 401: // DateLiteral2
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 402: // TimeLiteral2
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 403: // TimeStampLiteral2
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 404: // NullLiteral2
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 405: // BooleanLiteral1
                return new BooleanLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.bool_lit);
            case 406: // IdWrapper24
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 407: // Expression54
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e);
            case 408: // IdWrapper23
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 409: // Expression53
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e);
            case 410: // Expression14
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr);
            case 411: // OptAll1
                return new OptAll_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_all);
            case 412: // Expression15
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr2);
            case 413: // AggName1
                return new AggName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_name);
            case 414: // NamedArgumentList2
                return new NamedArgumentList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamedArgumentList);
            case 415: // NamedArgument4
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 416: // NamedArgumentFuncName1
                return new NamedArgumentFuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func_name);
            case 417: // Expression12
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 418: // IdWrapper12
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.proc_param_name);
            case 419: // NamedArgument3
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr_n);
            case 420: // NamedArgument2
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 421: // ExpressionList5
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 422: // Expression40
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 423: // GisNotSpatialFunctionName1
                return new GisNotSpatialFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunctionName);
            case 424: // ExpressionList6
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 425: // Expression41
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 426: // GisGeometryConstructorName1
                return new GisGeometryConstructorName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunctionName);
            case 427: // ExpressionList7
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 428: // Expression42
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 429: // GisGeneralConstructorName1
                return new GisGeneralConstructorName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunctionName);
            case 430: // ExpressionList2
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 431: // Expression11
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 432: // GisObjectiveFunctionName1
                return new GisObjectiveFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisFunctionName);
            case 433: // NamedArgumentList1
                return new NamedArgumentList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamedArgumentList);
            case 434: // NamedArgument1
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.arg);
            case 435: // GisObjectiveNamedParameterFunctionName1
                return new GisObjectiveNamedParameterFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.gisNamedParameterFunctionName);
            case 436: // GisObjectiveFunctionNameToken1
                return new GisObjectiveFunctionNameToken_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 437: // QLPath3
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 438: // GisUnionAggregationFunctionName1
                return new GisUnionAggregationFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.fname);
            case 439: // ConstishFuncName1
                return new ConstishFuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.constish_func_name);
            case 440: // ExpressionList3
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 441: // Expression16
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 442: // SimpleFuncName1
                return new SimpleFuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.simple_func_name);
            case 443: // TrimFunction1
                return new TrimFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.trim_function);
            case 444: // ExtractFunction1
                return new ExtractFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.extract_function);
            case 445: // CastFunction1
                return new CastFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cast_function);
            case 446: // DayOfWeekFunction1
                return new DayOfWeekFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.day_of_week_function);
            case 447: // LeftFunction1
                return new LeftFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.left_function);
            case 448: // RightFunction1
                return new RightFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right_function);
            case 449: // DayNameFunction1
                return new DayNameFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.day_name_function);
            case 450: // MonthNameFunction1
                return new MonthNameFunction_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.month_name_function);
            case 451: // SeriesFunction1
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new SeriesFunction_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 452: // RoundFunction1
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new RoundFunction_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 453: // ExpressionList4
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 454: // Expression39
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 455: // UserDefinedFunctionName1
                return new UserDefinedFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.udfFunctionName);
            case 456: // Expression18
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 457: // Expression17
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.remString1);
            case 458: // TrimPosition1
                return new TrimPosition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.trim_position);
            case 459: // Expression20
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 460: // Expression19
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 461: // Expression21
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 462: // ExtractSpec1
                return new ExtractSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.extract_spec);
            case 463: // CastTypeWithoutParams1
                return new CastTypeWithoutParams_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cast_type_without_params);
            case 464: // Expression24
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.decimals);
            case 465: // Expression23
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.length);
            case 466: // CastTypeWithOptionalParams1
                return new CastTypeWithOptionalParams_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cast_type_with_optional_params);
            case 467: // Expression25
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.length_expr);
            case 468: // CastTypeWithOptionalLengthParam1
                return new CastTypeWithOptionalLengthParam_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cast_type_with_optional_length_param);
            case 469: // Expression22
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 470: // Expression26
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 471: // Expression28
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 472: // Expression27
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 473: // Expression30
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 474: // Expression29
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 475: // Expression31
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 476: // Expression32
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 477: // RoundingMode3
                return new RoundingMode_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RoundingMode);
            case 478: // StringLiteralWrapper3
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StringLiteralWrapper);
            case 479: // Expression38
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Expression);
            case 480: // Expression37
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Expression);
            case 481: // RoundingMode1
                return new RoundingMode_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rm1);
            case 482: // Expression36
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.maxValue);
            case 483: // Expression35
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.minValue);
            case 484: // RoundingMode2
                return new RoundingMode_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rm2);
            case 485: // Expression34
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.literal);
            case 486: // Expression33
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 487: // SeriesFunctionName1
                return new SeriesFunctionName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.series_function_name);
            case 488: // annotationDefintionsWithAnnotation1
                return new annotationDefintionsWithAnnotation_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 489: // AnnotationDeclaration2
                return new AnnotationDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.definition);
            case 490: // _PreAnnotations8
                return new _PreAnnotations_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotations);
            case 491: // annotationTypeSpec1
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 492: // QualifiedDefId6
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 493: // AnnotationTypeArray1
                return new AnnotationTypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeArray);
            case 494: // AnnotationTypeNamedOrEnum2
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 495: // AnnotationTypeTypeOf1
                return new AnnotationTypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeTypeOf);
            case 497: // annotationStructuredType2
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type2);
            case 498: // PathSimple16
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 499: // AnnotationDefaultClause1
                return new AnnotationDefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationDefaultClause);
        }
        rnd.Utils.assert(0 <= frame_num && frame_num < 500);
        return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
    }; // createFrame0()
    CdsDdlParserResolver.prototype.createFrame1 = function(frame_num, rule_info) {
        switch (frame_num) {
            case 500: // annotationEnumClause1
                return new annotationEnumClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumeration);
            case 501: // AnnotationTypeNamed1
                return new AnnotationTypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamed);
            case 502: // Expression57
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 503: // EnumIdWrapper2
                return new EnumIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumVal);
            case 504: // IntLiteralWrapper17
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.val);
            case 505: // IntLiteralWrapper16
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.val);
            case 506: // AnnotationTypeName1
                return new AnnotationTypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 507: // annotationStructuredType1
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotationStructuredType);
            case 508: // AnnotationTypeNamedOrEnum1
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 509: // AnnotationTypeSpecNoColon1
                return new AnnotationTypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeSpecNoColon);
            case 510: // TypeName2
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 511: // AnnotationLiteral2
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit);
            case 512: // IdWrapper27
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.symbol);
            case 514: // annotationTypeSpec2
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 515: // IdWrapper26
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
        }
        rnd.Utils.assert(500 <= frame_num && frame_num < 516);
        return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
    }; // createFrame1()
    CdsDdlParserResolver.prototype.createFrame = function(frame_num, rule_info) {
        if (frame_num < 500) return new rnd.FramePtr(this.createFrame0(frame_num, rule_info)); 
        return new rnd.FramePtr(this.createFrame1(frame_num, rule_info)); 
    };
// v-v-v-v-v-v The following can be replaced by contents of @JsResolver::footer{{{ }}}
    return CdsDdlParserResolver; 
} );
// ^-^-^-^-^-^ end of what can be replaced by contents of @JsResolver::footer{{{ }}}
