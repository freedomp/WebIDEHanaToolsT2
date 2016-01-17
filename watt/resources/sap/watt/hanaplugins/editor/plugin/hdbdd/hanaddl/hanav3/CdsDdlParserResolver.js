// v-v-v-v-v-v @JsResolver::header

/*eslint-disable */
define(
["hanaddl/hanaddlNonUi","rndrt/rnd","commonddl/commonddlNonUi"], //dependencies
function (hanaddlNonUi,rnd,commonddlNonUi) {

var StdFuncExpressionImpl = commonddlNonUi.StdFuncExpressionImpl;
var SelectListImpl = commonddlNonUi.SelectListImpl;
var ExpressionContainerImpl = commonddlNonUi.ExpressionContainerImpl;
var GroupByImpl = commonddlNonUi.GroupByImpl;
var PathEntryImpl = commonddlNonUi.PathEntryImpl;
var ExpressionImpl = commonddlNonUi.ExpressionImpl;
var OrderByImpl = commonddlNonUi.OrderByImpl;
var AnnotationValueImpl = commonddlNonUi.AnnotationValueImpl;
var PathExpressionImpl = commonddlNonUi.PathExpressionImpl;
var LiteralExpressionImpl = commonddlNonUi.LiteralExpressionImpl;
var Token = rnd.Token;
var ForeignKeyImpl = commonddlNonUi.ForeignKeyImpl;
var OrderByEntryImpl = commonddlNonUi.OrderByEntryImpl;
var AttributeDeclarationImpl = commonddlNonUi.AttributeDeclarationImpl;
var AbstractAnnotationValueImpl = commonddlNonUi.AbstractAnnotationValueImpl;
var CaseWhenExpressionImpl = commonddlNonUi.CaseWhenExpressionImpl;
var DataSourceImpl = commonddlNonUi.DataSourceImpl;
var ViewSelectSetImpl = commonddlNonUi.ViewSelectSetImpl;
var BaseCdsDdlParser = hanaddlNonUi.BaseCdsDdlParser;
var IAstFactory = commonddlNonUi.IAstFactory;
var Stackframe = rnd.Stackframe;
var Parser = rnd.Parser;
var FramePtr = rnd.FramePtr;
var NullFrame = rnd.NullFrame;
var UserStackframeT = rnd.UserStackframeT;

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

    function UsingDirective_attributes() {
        this.res = null;
    }

    function TopLevelDeclaration_attributes() {
        this.preAnnotations = null;
    }

    function ContextDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function ContextComponentDeclaration_attributes() {
        this.context = null;
        this.preAnnotations = null;
    }

    function AccessPolicyDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
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

    function AnnotatedElementDeclarationLoop_attributes() {
        this.res = null;
    }

    function ViewDeclaration_attributes() {
        this.annots = null;
        this.parentStmts = null;
        this.res = null;
    }

    function AnnotatedElementDeclaration_attributes() {
        this.parent = null;
    }

    function ElementDeclaration_attributes() {
        this.parent = null;
        this.preAnnots = null;
    }

    function Nullability_attributes() {
        this.res = null;
    }

    function DefaultClause_attributes() {
        this.res = null;
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

    function StructuredType_attributes() {
        this.res = null;
    }

    function StructuredTypeComponent_attributes() {
        this.res = null;
    }

    function AnnotatedTypeComponentDeclaration_attributes() {
        this.parent = null;
        this.preAnnotations = null;
        this.res = null;
    }

    function TypeComponentDeclaration_attributes() {
        this.parent = null;
        this.res = null;
    }

    function TypeSpec_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeSpecNoColon_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeTypeOf_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeArray_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeNamedOrEnum_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeNamed_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeName_attributes() {
        this.res = null;
    }

    function AssociationForeignKeys_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function AssociationForeignKeyElement_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
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
        this.res = null;
    }

    function TypeAssoc_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function Cardinality_attributes() {
        this.maxStar = null;
        this.res = null;
        this.srcMaxStar = null;
    }

    function NamespacePath_attributes() {
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
        this.list = null;
        this.preAnnotations = null;
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
        this.res = null;
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
        this.res = null;
        this.select = null;
    }

    function TablePathList_attributes() {
        this.res = null;
    }

    function TablePathAlias_attributes() {
        this.res = null;
    }

    function TablePath_attributes() {
        this.res = null;
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
        this.negated = false;
        this.res = null;
    }

    function ComparisonPredicate_attributes() {
        this.comp = null;
        this.left = null;
        this.res = null;
    }

    function RangePredicate_attributes() {
        this.expr1 = null;
        this.negated = false;
        this.res = null;
    }

    function LikePredicate_attributes() {
        this.escapeToken = null;
        this.expr1 = null;
        this.negated = false;
        this.res = null;
    }

    function NullPredicate_attributes() {
        this.expr = null;
        this.isNull = false;
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

    function Literal_attributes() {
        this.res = null;
    }

    function ExprAlias_attributes() {
        this.alias = null;
        this.res = null;
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

    function Func_attributes() {
        this.res = null;
    }

    function NamedArgumentFuncName_attributes() {
        this.res = null;
    }

    function FuncName_attributes() {
        this.res = null;
    }

    function annotationDefintionsWithAnnotation_attributes() {
        this.preAnnotations = null;
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

    function ELEMENT_attributes() {
        this.name = null;
    }

    function KEY_attributes() {
        this.name = null;
    }

    function LIKE_attributes() {
        this.name = null;
    }

    function NOT_attributes() {
        this.name = null;
    }

    function NULL_attributes() {
        this.name = null;
    }

    function ASC_attributes() {
        this.name = null;
    }

    function DESC_attributes() {
        this.name = null;
    }

    function NULLS_attributes() {
        this.name = null;
    }

    function FIRST_attributes() {
        this.name = null;
    }

    function LAST_attributes() {
        this.name = null;
    }

    function DISTINCT_attributes() {
        this.name = null;
    }

    function COUNT_attributes() {
        this.name = null;
    }

    function MIN_attributes() {
        this.name = null;
    }

    function MAX_attributes() {
        this.name = null;
    }

    function SUM_attributes() {
        this.name = null;
    }

    function AVG_attributes() {
        this.name = null;
    }

    function STDDEV_attributes() {
        this.name = null;
    }

    function VAR_attributes() {
        this.name = null;
    }

    function ALL_attributes() {
        this.name = null;
    }


    // ----------- Locals

    function START2_locals() {
        this.NamespaceDeclaration = new NamespaceDeclaration_attributes();
        this.TopLevelDeclaration = new TopLevelDeclaration_attributes();
    }

    function START_SYNTAX_COLORING_locals() {
        this.AnnotatedElementDeclaration = new AnnotatedElementDeclaration_attributes();
    }

    function NamespaceDeclaration_locals() {
        this.NamespacePath = new NamespacePath_attributes();
        this.endIndex = 0;
        this.path = null;
        this.startIndex = 0;
    }

    function UsingDirectiveList_locals() {
        this.directive = new UsingDirective_attributes();
    }

    function UsingDirective_locals() {
        this.alias = new IdWrapper_attributes();
        this.endIndex = 0;
        this.path = new PathWithNamespace_attributes();
        this.startIndex = 0;
    }

    function TopLevelDeclaration_locals() {
        this.AccessPolicyDeclaration = new AccessPolicyDeclaration_attributes();
        this.annot_decl = new AnnotationDeclaration_attributes();
        this.annotation = new PreAnnotation_attributes();
        this.c_decl = new ContextDeclaration_attributes();
        this.co_decl = new ConstDeclaration_attributes();
        this.e_decl = new EntityDeclaration_attributes();
        this.t_decl = new TypeDeclaration_attributes();
        this.v_decl = new ViewDeclaration_attributes();
    }

    function ContextDeclaration_locals() {
        this.ContextComponentDeclaration = new ContextComponentDeclaration_attributes();
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.startIndex = 0;
    }

    function ContextComponentDeclaration_locals() {
        this.annot_decl = new AnnotationDeclaration_attributes();
        this.annotation = new PreAnnotation_attributes();
        this.c_decl = new ContextDeclaration_attributes();
        this.co_decl = new ConstDeclaration_attributes();
        this.e_decl = new EntityDeclaration_attributes();
        this.stmts = null;
        this.t_decl = new TypeDeclaration_attributes();
        this.v_decl = new ViewDeclaration_attributes();
    }

    function AccessPolicyDeclaration_locals() {
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.n2 = new AccessPolicyComponentDeclaration_attributes();
        this.res = null;
        this.startIndex = 0;
    }

    function AccessPolicyComponentDeclaration_locals() {
        this.a_decl = new AspectDeclaration_attributes();
        this.annotation = new PreAnnotation_attributes();
        this.preAnnotations = null;
        this.r_decl = new RoleDeclaration_attributes();
    }

    function RoleDeclaration_locals() {
        this.RuleDeclaration = new RuleDeclaration_attributes();
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.role = null;
        this.startIndex = 0;
        this.subElementStartIndex = 0;
    }

    function RuleDeclaration_locals() {
        this.a_decl = new AspectDeclaration_attributes();
        this.rule = new RuleSubquery_attributes();
        this.startIndex = 0;
    }

    function RuleSubquery_locals() {
        this.endIndex = 0;
        this.from = new RuleFromClause_attributes();
        this.rule = null;
        this.where = new WhereClause_attributes();
    }

    function RuleFromClause_locals() {
        this.from = null;
        this.path1 = new QLPath_attributes();
        this.path2 = new QLPath_attributes();
    }

    function AspectDeclaration_locals() {
        this.aspect = null;
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.ql_query_decl = new QLSubqueryElementary_attributes();
        this.startIndex = 0;
    }

    function EntityDeclaration_locals() {
        this.AnnotatedElementDeclarationLoop = new AnnotatedElementDeclarationLoop_attributes();
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.startIndex = 0;
    }

    function AnnotatedElementDeclarationLoop_locals() {
        this.AnnotatedElementDeclaration = new AnnotatedElementDeclaration_attributes();
    }

    function ViewDeclaration_locals() {
        this.QLSelectStmtNoOption = new QLSelectStmtNoOption_attributes();
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.startIndex = 0;
    }

    function AnnotatedElementDeclaration_locals() {
        this.ElementDeclaration = new ElementDeclaration_attributes();
        this.annot = new PreAnnotation_attributes();
        this.preAnnotations = null;
    }

    function ElementDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.Nullability = new Nullability_attributes();
        this.element = new ELEMENT_attributes();
        this.endIndex = 0;
        this.id = new DefId_attributes();
        this.modifiers = new ElementModifier_attributes();
        this.startIndex = 0;
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

    function ElementModifier_locals() {
        this.key = new KEY_attributes();
    }

    function ConstDeclaration_locals() {
        this.endIndex = 0;
        this.expr = new ConstValue_attributes();
        this.id = new QualifiedDefId_attributes();
        this.startIndex = 0;
        this.type = new TypeSpec_attributes();
    }

    function ConstValue_locals() {
        this.exp = new Expression_attributes();
    }

    function EnumValueDeclaration_locals() {
        this.endIndex = 0;
        this.expr = new Expression_attributes();
        this.id = new DefId_attributes();
        this.startIndex = 0;
    }

    function TypeDeclaration_locals() {
        this.StructuredType = new StructuredType_attributes();
        this.endIndex = 0;
        this.id = new QualifiedDefId_attributes();
        this.startIndex = 0;
        this.typespec = new TypeSpec_attributes();
    }

    function StructuredType_locals() {
        this.StructuredTypeComponent = new StructuredTypeComponent_attributes();
    }

    function StructuredTypeComponent_locals() {
        this.typecomponent = new AnnotatedTypeComponentDeclaration_attributes();
    }

    function AnnotatedTypeComponentDeclaration_locals() {
        this.annot = new PreAnnotation_attributes();
        this.typeCompDecl = new TypeComponentDeclaration_attributes();
    }

    function TypeComponentDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.element = new ELEMENT_attributes();
        this.endIndex = 0;
        this.id = new DefId_attributes();
        this.startIndex = 0;
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
        this.comp_list = new StructuredType_attributes();
        this.startIndex = 0;
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
        this.endIndex = 0;
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
        this.r = new AssociationForeignKeyElement_attributes();
    }

    function AssociationForeignKeyElement_locals() {
        this.k1 = new PathWithAlias_attributes();
        this.kn = new PathWithAlias_attributes();
    }

    function AssociationTo_locals() {
        this.Cardinality = new Cardinality_attributes();
        this.endTargetIndex = 0;
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
        this.min = new IntLiteralWrapper_attributes();
        this.srcMax = new IntLiteralWrapper_attributes();
    }

    function NamespacePath_locals() {
        this.id_1 = new IdWrapper_attributes();
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
        this.endIndex = 0;
        this.lit_val = new AnnotationLiteral_attributes();
        this.refToConst = new PathSimple_attributes();
        this.startIndex = 0;
    }

    function RecordValue_locals() {
        this.RecordComponent = new RecordComponent_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function PreAnnotation_locals() {
        this.AnnotationPath = new AnnotationPath_attributes();
        this.AnnotationValue = new AnnotationValue_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function RecordComponent_locals() {
        this.AnnotationPath = new AnnotationPath_attributes();
        this.AnnotationValue = new AnnotationValue_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function ArrayValue_locals() {
        this.AnnotationValue = new AnnotationValue_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
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
        this.endIndex = 0;
        this.sq1 = new QLSubqueryComplex_attributes();
        this.startIndex = 0;
    }

    function QLSubqueryComplex_locals() {
        this.OrderByClause = new OrderByClause_attributes();
        this.endIndex = 0;
        this.sq = new QLSubquerySet_attributes();
        this.startIndex = 0;
    }

    function QLSubquerySet_locals() {
        this.endIndex = 0;
        this.set = new SetOperator_attributes();
        this.sq1a = new QLSubqueryElementary_attributes();
        this.sq1b = new QLSubqueryWithParens_attributes();
        this.sq2a = new QLSubqueryElementary_attributes();
        this.sq2b = new QLSubqueryWithParens_attributes();
        this.startIndex = 0;
        this.tempSelectSet = null;
    }

    function QLSubqueryElementary_locals() {
        this.adhoc = new AdhocDeclarationBlock_attributes();
        this.endIndex = 0;
        this.from = new FromClause_attributes();
        this.group = new GroupByClause_attributes();
        this.having = new HavingClause_attributes();
        this.select = new QLSelectClause_attributes();
        this.startIndex = 0;
        this.where = new WhereClause_attributes();
    }

    function AdhocDeclarationBlock_locals() {
        this.elem = new AdhocElementDeclaration_attributes();
    }

    function AdhocElementDeclaration_locals() {
        this.AssociationOnCondition = new AssociationOnCondition_attributes();
        this.assocTo = new AssociationTo_attributes();
        this.endIndex = 0;
        this.id = new DefId_attributes();
        this.startIndex = 0;
    }

    function QLSelectClause_locals() {
        this.QLSelectList = new QLSelectList_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function QLSelectList_locals() {
        this.AnnotatedQLSelectItem = new AnnotatedQLSelectItem_attributes();
        this.p2 = new AnnotatedQLSelectItem_attributes();
    }

    function AnnotatedQLSelectItem_locals() {
        this.QLSelectItem = new QLSelectItem_attributes();
        this.annotation = new PreAnnotation_attributes();
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
        this.endIndex = 0;
        this.nestedEntry = null;
        this.p2 = new QLSelectClause_attributes();
        this.p3 = new QLSelectClause_attributes();
        this.pathExp = new QLPath_attributes();
        this.startIndex = 0;
    }

    function QLPath_locals() {
        this.endIndex = 0;
        this.id1 = new IdWrapper_attributes();
        this.id2 = new IdWrapper_attributes();
        this.idsc1 = new ScopedIdWrapper_attributes();
        this.startIndex = 0;
    }

    function PathGeneric_locals() {
        this.id1 = new IdWrapper_attributes();
        this.id2 = new IdWrapper_attributes();
    }

    function PathSimple_locals() {
        this.path = new PathGeneric_attributes();
    }

    function PathWithNamespace_locals() {
        this.NamespacePath = new NamespacePath_attributes();
        this.PathGeneric = new PathGeneric_attributes();
    }

    function PathWithAlias_locals() {
        this.alias = new IdWrapper_attributes();
        this.path = new PathSimple_attributes();
    }

    function ExprSelectItem_locals() {
        this.alias = new ExprAlias_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function FromClause_locals() {
        this.l = new TablePathList_attributes();
    }

    function TablePathList_locals() {
        this.endIndex = 0;
        this.startIndex = 0;
        this.tab_path_1 = new TablePath_attributes();
    }

    function TablePathAlias_locals() {
        this.alias = new IdWrapper_attributes();
    }

    function TablePath_locals() {
        this.alias = new TablePathAlias_attributes();
        this.endIndex = 0;
        this.path = new QLPath_attributes();
        this.startIndex = 0;
    }

    function WhereClause_locals() {
        this.cond = new Condition_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function GroupByClause_locals() {
        this.endIndex = 0;
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function HavingClause_locals() {
        this.cond = new Condition_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function OrderByClause_locals() {
        this.endIndex = 0;
        this.order = new SortSpecList_attributes();
        this.startIndex = 0;
    }

    function SortSpecList_locals() {
        this.spec1 = new SortSpec_attributes();
        this.specN = new SortSpec_attributes();
    }

    function SortSpec_locals() {
        this.endIndex = 0;
        this.expr = new Expression_attributes();
        this.nfl = new OptNullsFirstLast_attributes();
        this.order = new OptAscDesc_attributes();
        this.startIndex = 0;
    }

    function OptAscDesc_locals() {
        this.asc = new ASC_attributes();
        this.des = new DESC_attributes();
    }

    function OptNullsFirstLast_locals() {
        this.f = new FIRST_attributes();
        this.l = new LAST_attributes();
        this.n = new NULLS_attributes();
    }

    function Condition_locals() {
        this.condAnd = new ConditionAnd_attributes();
        this.endIndex = 0;
        this.right = new ConditionAnd_attributes();
        this.startIndex = 0;
    }

    function ConditionAnd_locals() {
        this.condTerm = new ConditionTerm_attributes();
        this.endIndex = 0;
        this.right = new ConditionTerm_attributes();
        this.startIndex = 0;
    }

    function ConditionTerm_locals() {
        this.NOT = new NOT_attributes();
        this.cond1 = new ConditionTerm_attributes();
        this.cond2 = new Condition_attributes();
        this.endIndex = 0;
        this.predLeftIsExpr = new PredicateLeftIsExpression_attributes();
        this.startIndex = 0;
    }

    function PredicateLeftIsExpression_locals() {
        this.NOT = new NOT_attributes();
        this.comp = new ComparisonPredicate_attributes();
        this.endIndex = 0;
        this.in = new InPredicate_attributes();
        this.left = new Expression_attributes();
        this.like = new LikePredicate_attributes();
        this.nullPred = new NullPredicate_attributes();
        this.range = new RangePredicate_attributes();
        this.startIndex = 0;
    }

    function ComparisonPredicate_locals() {
        this.right = new Expression_attributes();
    }

    function RangePredicate_locals() {
        this.endIndex = 0;
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
        this.startIndex = 0;
    }

    function LikePredicate_locals() {
        this.endIndex = 0;
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
        this.l = new LIKE_attributes();
        this.startIndex = 0;
    }

    function NullPredicate_locals() {
        this.NOT = new NOT_attributes();
        this.NULL = new NULL_attributes();
    }

    function InPredicate_locals() {
        this.expr = new Expression_attributes();
        this.inExpression = null;
        this.list = new ExpressionList_attributes();
    }

    function ExpressionList_locals() {
        this.expr = new Expression_attributes();
        this.expr_n = new Expression_attributes();
    }

    function Expression_locals() {
        this.endIndex = 0;
        this.exprConcat = new ExprConcat_attributes();
        this.startIndex = 0;
    }

    function ExprConcat_locals() {
        this.endIndex = 0;
        this.exprSum1 = new ExprSum_attributes();
        this.exprSum2 = new ExprSum_attributes();
        this.startIndex = 0;
    }

    function ExprSum_locals() {
        this.endIndex = 0;
        this.exprFactor1 = new ExprFactor_attributes();
        this.exprFactor2 = new ExprFactor_attributes();
        this.exprFactor3 = new ExprFactor_attributes();
        this.startIndex = 0;
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
        this.endIndex = 0;
        this.exprTerm1 = new ExprTerm_attributes();
        this.exprTerm2 = new ExprTerm_attributes();
        this.exprTerm3 = new Expression_attributes();
        this.func = new Func_attributes();
        this.literal = new Literal_attributes();
        this.namedArgFunc = new NamedArgFunc_attributes();
        this.startIndex = 0;
    }

    function QLPathStartRule_locals() {
        this.QLPath = new QLPath_attributes();
    }

    function CaseExpression_locals() {
        this.cases1 = new WhenExpressionThenList_attributes();
        this.cases2 = new WhenConditionThenList_attributes();
        this.endIndex = 0;
        this.expr1 = new Expression_attributes();
        this.optElse = new Expression_attributes();
        this.startIndex = 0;
    }

    function WhenExpressionThenList_locals() {
        this.listEl1 = new WhenExpressionThen_attributes();
        this.listEl2 = new WhenExpressionThen_attributes();
    }

    function WhenConditionThenList_locals() {
        this.listEl1 = new WhenConditionThen_attributes();
        this.listEl2 = new WhenConditionThen_attributes();
    }

    function WhenExpressionThen_locals() {
        this.endIndex = 0;
        this.expr1 = new Expression_attributes();
        this.expr2 = new Expression_attributes();
        this.startIndex = 0;
    }

    function WhenConditionThen_locals() {
        this.cond1 = new Condition_attributes();
        this.endIndex = 0;
        this.expr1 = new Expression_attributes();
        this.startIndex = 0;
    }

    function Literal_locals() {
        this.binary_lit = new BinaryLiteral_attributes();
        this.date_lit = new DateLiteral_attributes();
        this.int_val = new IntLiteralWrapper_attributes();
        this.null_lit = new NullLiteral_attributes();
        this.real_lit = new RealLiteral_attributes();
        this.string_lit = new StringLiteralWrapper_attributes();
        this.time_lit = new TimeLiteral_attributes();
        this.timestamp_lit = new TimeStampLiteral_attributes();
    }

    function ExprAlias_locals() {
        this.alias1 = new IdWrapper_attributes();
        this.expr = new Expression_attributes();
    }

    function Agg_locals() {
        this.agg_all = new OptAll_attributes();
        this.agg_expr = new Expression_attributes();
        this.agg_expr2 = new Expression_attributes();
        this.agg_name = new AggName_attributes();
        this.d = new DISTINCT_attributes();
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function AggName_locals() {
        this.av = new AVG_attributes();
        this.c = new COUNT_attributes();
        this.ma = new MAX_attributes();
        this.mi = new MIN_attributes();
        this.std = new STDDEV_attributes();
        this.su = new SUM_attributes();
        this.va = new VAR_attributes();
    }

    function OptAll_locals() {
        this.a = new ALL_attributes();
    }

    function NamedArgFunc_locals() {
        this.NamedArgumentList = new NamedArgumentList_attributes();
        this.endIndex = 0;
        this.expr = new NamedArgument_attributes();
        this.func_name = new NamedArgumentFuncName_attributes();
        this.startIndex = 0;
    }

    function NamedArgument_locals() {
        this.endIndex = 0;
        this.expr1 = new Expression_attributes();
        this.funcParam = null;
        this.proc_param_name = new IdWrapper_attributes();
        this.startIndex = 0;
    }

    function NamedArgumentList_locals() {
        this.expr = new NamedArgument_attributes();
        this.expr_n = new NamedArgument_attributes();
    }

    function Func_locals() {
        this.endIndex = 0;
        this.expr = new Expression_attributes();
        this.func_name = new FuncName_attributes();
        this.list = new ExpressionList_attributes();
        this.startIndex = 0;
    }

    function annotationDefintions_locals() {
        this.defs = new annotationDefintionsWithAnnotation_attributes();
    }

    function annotationDefintionsWithAnnotation_locals() {
        this.annotation = new PreAnnotation_attributes();
        this.definition = new AnnotationDeclaration_attributes();
    }

    function AnnotationDeclaration_locals() {
        this.endIndex = 0;
        this.name = new QualifiedDefId_attributes();
        this.startIndex = 0;
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
        this.AnnotationTypeNamed = new AnnotationTypeNamed_attributes();
        this.def = new AnnotationDefaultClause_attributes();
        this.enumeration = new annotationEnumClause_attributes();
    }

    function AnnotationDefaultClause_locals() {
        this.enumVal = new EnumIdWrapper_attributes();
        this.expr = new Expression_attributes();
    }

    function AnnotationTypeNamed_locals() {
        this.decimals = new IntLiteralWrapper_attributes();
        this.length = new IntLiteralWrapper_attributes();
        this.typeName = new AnnotationTypeName_attributes();
    }

    function AnnotationTypeSpecNoColon_locals() {
        this.AnnotationTypeNamedOrEnum = new AnnotationTypeNamedOrEnum_attributes();
        this.type1 = new annotationStructuredType_attributes();
    }

    function AnnotationTypeArray_locals() {
        this.AnnotationTypeSpecNoColon = new AnnotationTypeSpecNoColon_attributes();
    }

    function AnnotationTypeName_locals() {
        this.typeName = new TypeName_attributes();
    }

    function annotationEnumClause_locals() {
        this.endIndex = 0;
        this.lit = new AnnotationLiteral_attributes();
        this.startIndex = 0;
        this.symbol = new IdWrapper_attributes();
    }

    function annotationStructuredType_locals() {
        this.endIndex = 0;
        this.name = new IdWrapper_attributes();
        this.startIndex = 0;
        this.type = new annotationTypeSpec_attributes();
        this.typeEndIndex = 0;
        this.typeStartIndex = 0;
    }


    // ----------- Actions

    function START_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    START_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    START_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  RESOLVER.initializeParser();
  } // grammar line 121
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
            case 0: { this.m_locals.TopLevelDeclaration.preAnnotations = null; } // grammar line 142
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
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = null; } // grammar line 155
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.cdecl,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 184
            break;
            case 1: {
  this.m_result.cdecl = RESOLVER.createNamespace(this.m_locals.path);
  RESOLVER.setRootNamespace(this.m_result.cdecl);
  } // grammar line 179
            break;
            case 3: {
  this.m_locals.path = RESOLVER.createPathDeclaration();
  } // grammar line 175
            { this.m_locals.NamespacePath.path = this.m_locals.path; } // grammar line 178
            break;
            case 5: {
  this.m_locals.path = null;
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 165
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 171
            break;
        }
    }; // NamespaceDeclaration_action.performAction()

    function UsingDirectiveList_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new UsingDirectiveList_locals(), BP, rule_info);
    }
    UsingDirectiveList_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    UsingDirectiveList_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
RESOLVER.compilationUnit.getStatements().push(this.m_locals.directive.res);
} // grammar line 194
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
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 216
            break;
            case 2: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 202
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 207
            break;
        }
    }; // UsingDirective_action.performAction()

    function TopLevelDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TopLevelDeclaration_locals(), BP, rule_info);
    }
    TopLevelDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TopLevelDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 242
            break;
            case 1: { this.m_locals.AccessPolicyDeclaration.annots = this.m_result.preAnnotations; this.m_locals.AccessPolicyDeclaration.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 246
            break;
            case 2: { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 250
            break;
            case 3: { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 254
            break;
            case 4: { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 258
            break;
            case 5: { this.m_locals.co_decl.annots = this.m_result.preAnnotations; this.m_locals.co_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 262
            break;
            case 6: { this.m_locals.annot_decl.annots = this.m_result.preAnnotations; this.m_locals.annot_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 266
            break;
            case 7: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 235
            break;
            case 8: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 230
            break;
        }
    }; // TopLevelDeclaration_action.performAction()

    function ContextDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ContextDeclaration_locals(), BP, rule_info);
    }
    ContextDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ContextDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 302
            break;
            case 1: { this.m_locals.ContextComponentDeclaration.preAnnotations = null; this.m_locals.ContextComponentDeclaration.context = this.m_result.res; } // grammar line 298
            break;
            case 2: {
     this.m_result.res = RESOLVER.createContext(this.m_locals.id.res);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     } // grammar line 287
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;

 } // grammar line 275
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 281
            break;
        }
    }; // ContextDeclaration_action.performAction()

    function ContextComponentDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ContextComponentDeclaration_locals(), BP, rule_info);
    }
    ContextComponentDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ContextComponentDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 329
            { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = this.m_locals.stmts; } // grammar line 334
            break;
            case 3: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 338
            { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = this.m_locals.stmts; } // grammar line 343
            break;
            case 5: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 347
            { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = this.m_locals.stmts; } // grammar line 352
            break;
            case 7: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 356
            { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = this.m_locals.stmts; } // grammar line 361
            break;
            case 9: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 365
            { this.m_locals.co_decl.annots = this.m_result.preAnnotations; this.m_locals.co_decl.parentStmts = this.m_locals.stmts; } // grammar line 370
            break;
            case 11: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 374
            { this.m_locals.annot_decl.annots = this.m_result.preAnnotations; this.m_locals.annot_decl.parentStmts = this.m_locals.stmts; } // grammar line 379
            break;
            case 12: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 322
            break;
            case 14: {
  this.m_locals.stmts = null;
 } // grammar line 312
            {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 316
            break;
        }
    }; // ContextComponentDeclaration_action.performAction()

    function AccessPolicyDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AccessPolicyDeclaration_locals(), BP, rule_info);
    }
    AccessPolicyDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AccessPolicyDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.res,this.m_locals.startIndex,this.m_locals.endIndex);
     } // grammar line 412
            break;
            case 1: { this.m_locals.n2.parent = this.m_locals.res; } // grammar line 408
            break;
            case 2: {
  this.m_locals.res = RESOLVER.createAccessPolicy(this.m_locals.id.res);
  this.m_result.parentStmts.push(this.m_locals.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.res,this.m_locals.startIndex,-1);
  RESOLVER.addAnnotations(this.m_locals.res,this.m_result.annots);
  } // grammar line 400
            break;
            case 4: {
  this.m_locals.res = null;
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 389
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 395
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
            case 0: { this.m_locals.r_decl.preAnnotations = this.m_locals.preAnnotations; this.m_locals.r_decl.statementContainer = this.m_result.parent; } // grammar line 438
            break;
            case 1: { this.m_locals.a_decl.preAnnotations = this.m_locals.preAnnotations; this.m_locals.a_decl.statementContainer = this.m_result.parent; this.m_locals.a_decl.role = null; } // grammar line 440
            break;
            case 2: {
RESOLVER.collectPreAnnotation(this.m_locals.preAnnotations,this.m_locals.annotation.res);
} // grammar line 431
            break;
            case 4: {
  this.m_locals.preAnnotations = null;
 } // grammar line 421
            {
  this.m_locals.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 425
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
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.role,this.m_locals.startIndex,this.m_locals.endIndex);
     } // grammar line 473
            break;
            case 1: { this.m_locals.RuleDeclaration.role = this.m_locals.role; } // grammar line 469
            break;
            case 2: {
  this.m_locals.role = RESOLVER.createRole(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.role,this.m_locals.startIndex,-1);
  RESOLVER.addAnnotations(this.m_locals.role,this.m_result.preAnnotations);
  if (this.m_result.statementContainer != null) {
  this.m_result.statementContainer.getStatements().push(this.m_locals.role);
  }
  } // grammar line 459
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
  this.m_locals.subElementStartIndex = 0;
  this.m_locals.role = null;
 } // grammar line 447
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 454
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
            case 0: { this.m_locals.rule.parent = this.m_result.role; this.m_locals.rule.startIndex = this.m_locals.startIndex; } // grammar line 491
            break;
            case 1: {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 485
            break;
            case 2: { this.m_locals.a_decl.preAnnotations = null; this.m_locals.a_decl.statementContainer = null; this.m_locals.a_decl.role = this.m_result.role; } // grammar line 503
            break;
            case 3: {
  this.m_locals.startIndex = 0;
 } // grammar line 481
            break;
        }
    }; // RuleDeclaration_action.performAction()

    function RuleSubquery_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new RuleSubquery_locals(), BP, rule_info);
    }
    RuleSubquery_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    RuleSubquery_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.rule,this.m_result.startIndex,this.m_locals.endIndex);
     } // grammar line 552
            break;
            case 1: {
  this.m_locals.rule.setWhere(this.m_locals.where.res);
  } // grammar line 548
            break;
            case 2: { this.m_locals.where.select = null; } // grammar line 547
            break;
            case 5: {
  this.m_locals.endIndex = 0;
  this.m_locals.rule = null;
 } // grammar line 534
            {
  this.m_locals.rule = RESOLVER.createRule();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.rule,this.m_result.startIndex,-1);
  if (this.m_result.parent != null) {
  this.m_result.parent.getEntries().push(this.m_locals.rule);
  }
  } // grammar line 539
            { this.m_locals.from.rule = this.m_locals.rule; } // grammar line 546
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
            case 0: {
   var dsPath = RESOLVER.viewparser_tableDatasource(this.m_locals.path1.res);
   this.m_locals.from.setDataSource(dsPath);
   } // grammar line 574
            break;
            case 1: {
this.m_locals.from = RESOLVER.createPrefixRuleFromClause(rnd.Parser.getTok(RESOLVER, this, _sel1_index),rnd.Parser.getTok(RESOLVER, this, _on_index));
this.m_result.rule.setFrom(this.m_locals.from);
} // grammar line 569
            break;
            case 2: {
this.m_locals.from = RESOLVER.createPostfixRuleFromClause(rnd.Parser.getTok(RESOLVER, this, _sel2_index));
this.m_result.rule.setFrom(this.m_locals.from);
var dsPath = RESOLVER.viewparser_tableDatasource(this.m_locals.path2.res);
this.m_locals.from.setDataSource(dsPath);
} // grammar line 584
            break;
            case 3: {
  this.m_locals.from = null;
 } // grammar line 561
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
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.aspect,this.m_locals.startIndex,this.m_locals.endIndex);
     } // grammar line 622
            break;
            case 1: { this.m_locals.ql_query_decl.parent = this.m_locals.aspect; this.m_locals.ql_query_decl.parentSelectSet = null; } // grammar line 620
            break;
            case 2: {
  this.m_locals.aspect = RESOLVER.createAspect(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.aspect,this.m_locals.startIndex,-1);
  RESOLVER.addAnnotations(this.m_locals.aspect,this.m_result.preAnnotations);
  if (this.m_result.statementContainer != null) {
  this.m_result.statementContainer.getStatements().push(this.m_locals.aspect);
  }else if (this.m_result.role != null) {
  this.m_result.role.getEntries().push(this.m_locals.aspect);
  }
  } // grammar line 609
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
  this.m_locals.aspect = null;
 } // grammar line 598
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 604
            break;
        }
    }; // AspectDeclaration_action.performAction()

    function EntityDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new EntityDeclaration_locals(), BP, rule_info);
    }
    EntityDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    EntityDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 656
            break;
            case 2: {
     this.m_result.res = RESOLVER.createEntity(this.m_locals.id.res);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     } // grammar line 645
            { this.m_locals.AnnotatedElementDeclarationLoop.res = this.m_result.res; } // grammar line 653
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 633
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 638
            break;
        }
    }; // EntityDeclaration_action.performAction()

    function AnnotatedElementDeclarationLoop_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedElementDeclarationLoop_locals(), BP, rule_info);
    }
    AnnotatedElementDeclarationLoop_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedElementDeclarationLoop_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = this.m_result.res; } // grammar line 666
            break;
        }
    }; // AnnotatedElementDeclarationLoop_action.performAction()

    function ViewDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ViewDeclaration_locals(), BP, rule_info);
    }
    ViewDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ViewDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 698
            break;
            case 1: { this.m_locals.QLSelectStmtNoOption.parent = this.m_result.res; } // grammar line 695
            break;
            case 2: {
  this.m_result.res = RESOLVER.viewparser_startDefineView();
  this.m_result.res.setNamePath(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  } // grammar line 684
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 674
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 679
            break;
        }
    }; // ViewDeclaration_action.performAction()

    function AnnotatedElementDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotatedElementDeclaration_locals(), BP, rule_info);
    }
    AnnotatedElementDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotatedElementDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.ElementDeclaration.parent = this.m_result.parent; this.m_locals.ElementDeclaration.preAnnots = this.m_locals.preAnnotations; } // grammar line 719
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_locals.preAnnotations,this.m_locals.annot.res);
} // grammar line 715
            break;
            case 3: {
  this.m_locals.preAnnotations = null;
 } // grammar line 706
            {
  this.m_locals.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 710
            break;
        }
    }; // AnnotatedElementDeclaration_action.performAction()

    function ElementDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ElementDeclaration_locals(), BP, rule_info);
    }
    ElementDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ElementDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.type.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 744
            break;
            case 1: { this.m_locals.Nullability.res = this.m_locals.type.res; } // grammar line 740
            break;
            case 2: { this.m_locals.DefaultClause.res = this.m_locals.type.res; } // grammar line 741
            break;
            case 3: {
  RESOLVER.addAnnotations(this.m_locals.type.res,this.m_result.preAnnots);
  RESOLVER.initializeElement(this.m_locals.type.res,this.m_locals.id.res,this.m_locals.modifiers.keyToken,null,this.m_locals.element.name,null);
  } // grammar line 735
            break;
            case 4: { this.m_locals.type.parent = this.m_result.parent; this.m_locals.type.def = this.m_locals.id.res; } // grammar line 734
            break;
            case 6: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 723
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 728
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
            case 0: {
RESOLVER.setNullableToken(this.m_result.res,this.m_locals.nu.name);
} // grammar line 760
            break;
            case 1: {
RESOLVER.setNotToken(this.m_result.res,this.m_locals.no.name);
} // grammar line 755
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
            case 0: {
RESOLVER.viewparser_setElementDefault(this.m_result.res,this.m_locals.expr.res);
} // grammar line 772
            break;
            case 1: {
RESOLVER.viewparser_setElementDefaultToken(this.m_result.res,this.m_locals.enumVal.res);
} // grammar line 779
            break;
        }
    }; // DefaultClause_action.performAction()

    function ElementModifier_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ElementModifier_locals(), BP, rule_info);
    }
    ElementModifier_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ElementModifier_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.keyToken = this.m_locals.key.name;
} // grammar line 791
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 827
            break;
            case 1: {
  RESOLVER.viewparser_setConstValue(this.m_result.res,this.m_locals.expr.res);
  } // grammar line 823
            break;
            case 2: { this.m_locals.type.parent = this.m_result.res; this.m_locals.type.def = null; } // grammar line 819
            break;
            case 3: {
  this.m_result.res = RESOLVER.createConst(this.m_locals.id.res);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  } // grammar line 810
            break;
            case 5: {


 } // grammar line 800
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 805
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
            case 0: {
     this.m_result.res = this.m_locals.exp.res;
     } // grammar line 836
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 863
            break;
            case 1: {
  if (this.m_locals.expr.res instanceof LiteralExpressionImpl) {
  this.m_result.res.setLiteral(this.m_locals.expr.res);
  }
  } // grammar line 857
            break;
            case 2: {
  this.m_result.res = IAstFactory.eINSTANCE.createEnumerationValue();
  this.m_result.res.setSymbol(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  } // grammar line 851
            break;
            case 4: {


 } // grammar line 842
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 847
            break;
        }
    }; // EnumValueDeclaration_action.performAction()

    function TypeDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeDeclaration_locals(), BP, rule_info);
    }
    TypeDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 897
            break;
            case 1: { this.m_locals.StructuredType.res = this.m_result.res; } // grammar line 892
            break;
            case 2: { this.m_locals.typespec.parent = this.m_result.res; this.m_locals.typespec.def = null; } // grammar line 894
            break;
            case 3: {
  this.m_result.res = RESOLVER.createType(this.m_locals.id.res);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  } // grammar line 883
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 873
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 878
            break;
        }
    }; // TypeDeclaration_action.performAction()

    function StructuredType_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new StructuredType_locals(), BP, rule_info);
    }
    StructuredType_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    StructuredType_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.StructuredTypeComponent.res = this.m_result.res; } // grammar line 908
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
if (this.m_result.res != null) {
RESOLVER.addTypeElement(this.m_result.res,this.m_locals.typecomponent.res);
}
} // grammar line 915
            break;
            case 1: { this.m_locals.typecomponent.parent = this.m_result.res; } // grammar line 914
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
  this.m_result.res = this.m_locals.typeCompDecl.res;
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.preAnnotations);
  } // grammar line 937
            break;
            case 1: { this.m_locals.typeCompDecl.parent = this.m_result.parent; } // grammar line 936
            break;
            case 2: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annot.res);
} // grammar line 932
            break;
            case 3: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 927
            break;
        }
    }; // AnnotatedTypeComponentDeclaration_action.performAction()

    function TypeComponentDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeComponentDeclaration_locals(), BP, rule_info);
    }
    TypeComponentDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeComponentDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 962
            break;
            case 1: { this.m_locals.DefaultClause.res = this.m_result.res; } // grammar line 960
            break;
            case 2: {
  this.m_result.res = this.m_locals.typespec.res;
  RESOLVER.initializeTypeComponent(this.m_result.res,this.m_locals.id.res,this.m_locals.element.name);
  } // grammar line 956
            break;
            case 3: { this.m_locals.typespec.parent = this.m_result.parent; this.m_locals.typespec.def = this.m_locals.id.res; } // grammar line 955
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 945
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 950
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
            case 0: {
this.m_result.res = this.m_locals.tto.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 986
            break;
            case 1: { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.def = this.m_result.def; } // grammar line 985
            break;
            case 2: {
   this.m_result.res = this.m_locals.arr.res;
   } // grammar line 994
            break;
            case 3: { this.m_locals.arr.parent = this.m_result.parent; this.m_locals.arr.def = this.m_result.def; } // grammar line 993
            break;
            case 4: {
this.m_result.res = this.m_locals.typename.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 1000
            break;
            case 5: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.def = this.m_result.def; } // grammar line 999
            break;
            case 6: {
this.m_result.res = this.m_locals.typeassoc.res;
} // grammar line 1006
            break;
            case 7: { this.m_locals.typeassoc.parent = this.m_result.parent; this.m_locals.typeassoc.def = this.m_result.def; } // grammar line 1005
            break;
            case 8: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 980
            break;
            case 10: {
    if (this.m_result.def != null) {
    var attribute = RESOLVER.createAttribute(null);
    attribute.setNameToken(this.m_result.def);
    this.m_result.parent.getElements().push(attribute);
    this.m_result.parent = RESOLVER.createAndSetAnonymousTypeDeclaration(attribute);
    this.m_result.res = attribute;
    }
    } // grammar line 1017
            { this.m_locals.comp_list.res = this.m_result.parent; } // grammar line 1026
            break;
            case 11: {

 } // grammar line 974
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
            case 0: {
this.m_result.res = this.m_locals.tto.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 1044
            break;
            case 2: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1040
            { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.def = this.m_result.def; } // grammar line 1043
            break;
            case 3: {
this.m_result.res = this.m_locals.typename.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 1050
            break;
            case 4: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.def = this.m_result.def; } // grammar line 1049
            break;
            case 6: {
    if (this.m_result.def != null) {
    var attribute = RESOLVER.createAttribute(null);
    attribute.setNameToken(this.m_result.def);
    this.m_result.parent.getElements().push(attribute);
    this.m_result.parent = RESOLVER.createAndSetAnonymousTypeDeclaration(attribute);
    this.m_result.res = attribute;
    }
    } // grammar line 1062
            { this.m_locals.comp_list.res = this.m_result.parent; } // grammar line 1071
            break;
            case 7: {

 } // grammar line 1035
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
  if (this.m_result.def != null) {
  this.m_result.res.setNameToken(this.m_result.def);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.getElements().push(this.m_result.res);
  }
  } // grammar line 1077
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
  } // grammar line 1095
            break;
            case 1: { this.m_locals.sub.parent = this.m_result.parent; this.m_locals.sub.def = this.m_result.def; } // grammar line 1094
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
            case 0: {
this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.enumeration,this.m_locals.startIndex,this.m_locals.endIndex);
} // grammar line 1134
            break;
            case 1: {
this.m_locals.enumeration.getValues().push(this.m_locals.val_decl.res);
} // grammar line 1129
            break;
            case 2: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 this.m_locals.enumeration = IAstFactory.eINSTANCE.createEnumerationDeclaration();
 this.m_result.res.setEnumerationDeclaration(this.m_locals.enumeration);
 } // grammar line 1120
            break;
            case 3: {
  this.m_result.res = this.m_locals.named.res;
  } // grammar line 1116
            break;
            case 5: {


  this.m_locals.enumeration = null;
 } // grammar line 1109
            { this.m_locals.named.parent = this.m_result.parent; this.m_locals.named.def = this.m_result.def; } // grammar line 1115
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
            case 0: {
this.m_result.res.setDecimalsToken(this.m_locals.p2.res);
} // grammar line 1164
            break;
            case 1: {
this.m_result.res.setLengthToken(this.m_locals.p1.res);
} // grammar line 1158
            break;
            case 2: {
  this.m_result.res = RESOLVER.createAttribute(this.m_locals.id.res);
  if (this.m_result.def != null) {
  this.m_result.res.setNameToken(this.m_result.def);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.getElements().push(this.m_result.res);
  }
  } // grammar line 1146
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
            case 0: {
     this.m_result.res = this.m_locals.id.res;
     } // grammar line 1176
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
            case 0: {
    this.m_result.startIndex = this.m_locals.r.startIndex;
    this.m_result.endIndex = this.m_locals.r.endIndex;
    } // grammar line 1185
            break;
            case 1: { this.m_locals.r.res = this.m_result.res; } // grammar line 1184
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1182
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
            case 0: {
var fk = RESOLVER.addKey(this.m_result.res, this.m_locals.kn.res, this.m_locals.kn.alias);
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(fk,this.m_result.startIndex,this.m_result.endIndex);
} // grammar line 1209
            break;
            case 1: {
this.m_result.startIndex = RESOLVER.getNextTokenIndex();
} // grammar line 1205
            break;
            case 2: {
 var fk = RESOLVER.addKey(this.m_result.res, this.m_locals.k1.res, this.m_locals.k1.alias);
 this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
 RESOLVER.viewparser_setStartEndTokenIndex(fk,this.m_result.startIndex,this.m_result.endIndex);
 } // grammar line 1198
            break;
            case 3: {
    this.m_result.startIndex = RESOLVER.getNextTokenIndex();
    } // grammar line 1194
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1192
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
  this.m_locals.endTargetIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.target.res,this.m_locals.startTargetIndex,this.m_locals.endTargetIndex);
  this.m_result.res.setTargetEntityPath(this.m_locals.target.res);
  } // grammar line 1243
            break;
            case 1: {
  this.m_locals.startTargetIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1239
            break;
            case 2: { this.m_locals.Cardinality.res = this.m_result.res; } // grammar line 1237
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
  } // grammar line 1225
            break;
            case 4: {


 } // grammar line 1219
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
            case 0: { this.m_locals.AssociationForeignKeys.res = this.m_result.assoc; } // grammar line 1254
            break;
            case 1: { this.m_locals.AssociationOnCondition.res = this.m_result.assoc; } // grammar line 1256
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
            case 0: {
  if (this.m_result.res != null) {
  this.m_result.res.setOnExpression(this.m_locals.cond.res);
  }
  } // grammar line 1264
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
            case 1: {
     this.m_result.res = this.m_locals.assocTo.res;
     } // grammar line 1273
            { this.m_locals.AssocForeignKeyOrJoinCondition.assoc = this.m_locals.assocTo.res; } // grammar line 1276
            break;
            case 2: { this.m_locals.assocTo.parent = this.m_result.parent; this.m_locals.assocTo.def = this.m_result.def; this.m_locals.assocTo.select = null; } // grammar line 1272
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
            case 0: {
RESOLVER.setCardinality(this.m_result.res,this.m_locals.srcMax.res,this.m_result.srcMaxStar,this.m_locals.min.res,this.m_locals.max1.res,this.m_result.maxStar);
} // grammar line 1312
            break;
            case 1: {
this.m_result.maxStar = rnd.Parser.getTok(RESOLVER, this, _star_index);
} // grammar line 1308
            break;
            case 2: {
this.m_result.srcMaxStar = rnd.Parser.getTok(RESOLVER, this, _srcStar_index);
} // grammar line 1293
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
} // grammar line 1332
            break;
            case 1: {
  RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 1326
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
            case 0: {
if (this.m_locals.defid.res != null) {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.defid.res));
}
} // grammar line 1364
            break;
            case 1: {
if (this.m_locals.id_n.res != null) {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_n.res));
}
} // grammar line 1354
            break;
            case 2: {
  this.m_result.res = RESOLVER.createPathDeclaration();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 1343
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
            case 0: {
  var tok = rnd.Parser.getTok(RESOLVER, this, _id_index);
  this.m_result.res = tok;
  } // grammar line 1377
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
            case 0: {
 this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);
 } // grammar line 1388
            break;
            case 1: {
this.m_result.res = this.m_locals.idq.res;
} // grammar line 1395
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
            case 0: {
     this.m_result.res = this.m_locals.id.res;
     } // grammar line 1426
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);
  } // grammar line 1434
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _intLit_index);
  } // grammar line 1441
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _strLit_index);
  } // grammar line 1448
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _realLit_index);
  } // grammar line 1455
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _binaryLit_index);
  } // grammar line 1462
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _dateLit_index);
  } // grammar line 1469
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _timeLit_index);
  } // grammar line 1476
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _timeStampLit_index);
  } // grammar line 1483
            break;
        }
    }; // TimeStampLiteral_action.performAction()

    function NullLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new NullLiteral_locals(), BP, rule_info);
    }
    NullLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NullLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.res = this.m_locals.nullLit.name;
  } // grammar line 1490
            break;
        }
    }; // NullLiteral_action.performAction()

    function DefId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new DefId_locals(), BP, rule_info);
    }
    DefId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DefId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.res = this.m_locals.id1.res;
  } // grammar line 1501
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
 this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
 var value = null;
 var entries = this.m_locals.refToConst.res.getEntries();
 if (entries.length == 1) {
 var id = entries[ 0 ].getNameToken();
 value = RESOLVER.addAnnotationValue(this.m_result.container,id);
 }else if (entries.length >= 1) {
 value = RESOLVER.addAnnotationPathValue(this.m_result.container,this.m_locals.refToConst.res);
 }
 if (value != null) {
 RESOLVER.viewparser_setStartEndTokenIndex(value,this.m_locals.startIndex,this.m_locals.endIndex);
 }
 } // grammar line 1529
            break;
            case 1: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1525
            break;
            case 2: {
var av = RESOLVER.addAnnotationValue(this.m_result.container, this.m_locals.lit_val.res);
this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(av,this.m_locals.startIndex,this.m_locals.endIndex);
} // grammar line 1550
            break;
            case 3: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1546
            break;
            case 4: { this.m_locals.RecordValue.container = this.m_result.container; } // grammar line 1558
            break;
            case 5: { this.m_locals.ArrayValue.container = this.m_result.container; } // grammar line 1562
            break;
            case 6: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1514
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.record,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1589
            break;
            case 1: { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1586
            break;
            case 3: {
  this.m_result.record = RESOLVER.createAnnotationRecordValue();
  RESOLVER.addAnnotationRecordValue(this.m_result.container,this.m_result.record);
  } // grammar line 1579
            { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1583
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1570
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1575
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1615
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1613
            break;
            case 3: {
     this.m_result.res = RESOLVER.createPreAnnotation();
     } // grammar line 1606
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1610
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1597
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1602
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1642
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1640
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1624
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1629
            {
     this.m_result.res = RESOLVER.createAnnotationNameValuePair();
     RESOLVER.addAnnotationNameValuePair(this.m_result.container,this.m_result.res);
     } // grammar line 1632
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1637
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.array,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1674
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1669
            break;
            case 2: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1666
            break;
            case 3: {
  this.m_result.array = RESOLVER.createAnnotationArrayValue();
  RESOLVER.addAnnotationArrayValue(this.m_result.container,this.m_result.array);
  } // grammar line 1661
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1652
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1657
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
            case 0: {
 RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_n.res);
 } // grammar line 1693
            break;
            case 1: {
RESOLVER.addAnnotationPath(this.m_result.nameValuePair,rnd.Parser.getTok(RESOLVER, this, _dot_index));
} // grammar line 1689
            break;
            case 2: {
  RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_1.res);
  } // grammar line 1684
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
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);
  } // grammar line 1706
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
            case 0: {
this.m_result.res = this.m_locals.str_val.res;
} // grammar line 1720
            break;
            case 1: {
this.m_result.res = this.m_locals.int_val.res;
} // grammar line 1728
            break;
            case 2: {
this.m_result.res = this.m_locals.real_lit.res;
} // grammar line 1736
            break;
            case 3: {
this.m_result.res = this.m_locals.binary_lit.res;
} // grammar line 1743
            break;
            case 4: {
this.m_result.res = this.m_locals.date_lit.res;
} // grammar line 1750
            break;
            case 5: {
this.m_result.res = this.m_locals.time_lit.res;
} // grammar line 1757
            break;
            case 6: {
this.m_result.res = this.m_locals.timestamp_lit.res;
} // grammar line 1764
            break;
            case 7: {
this.m_result.res = this.m_locals.null_lit.res;
} // grammar line 1772
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
            case 0: { this.m_locals.QLSubqueryComplex.parent = this.m_result.parent; this.m_locals.QLSubqueryComplex.parentSelectSet = null; } // grammar line 1797
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1815
            break;
            case 1: {
     this.m_result.selectStmt = this.m_locals.sq1.selectStmt;
     } // grammar line 1811
            break;
            case 2: { this.m_locals.sq1.parent = this.m_result.parent; this.m_locals.sq1.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1810
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1801
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1806
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1835
            break;
            case 2: {
  this.m_result.selectStmt = this.m_locals.sq.select;
  } // grammar line 1831
            { this.m_locals.OrderByClause.select = this.m_result.selectStmt; } // grammar line 1834
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1822
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1827
            { this.m_locals.sq.parent = this.m_result.parent; this.m_locals.sq.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1830
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
    } // grammar line 1911
            {
 this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
 RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.select,this.m_locals.startIndex,this.m_locals.endIndex);
 } // grammar line 1916
            break;
            case 2: {
  this.m_result.select = this.m_locals.tempSelectSet;
  } // grammar line 1885
            break;
            case 4: {
  this.m_locals.tempSelectSet = RESOLVER.createViewSelectSet(this.m_locals.set.operator,this.m_locals.set.all,this.m_locals.set.distinct,this.m_result.select,null);
  if (this.m_result.select != null) {
  var leftStartIndex = this.m_result.select.getStartTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.tempSelectSet,leftStartIndex,-1);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.setSelectSet(this.m_locals.tempSelectSet);
  }
  if (this.m_result.parentSelectSet != null) {
  this.m_result.parentSelectSet.setRight(this.m_locals.tempSelectSet);
  this.m_result.parentSelectSet = null;
  }
  } // grammar line 1870
            { this.m_locals.sq2a.parent = null; this.m_locals.sq2a.parentSelectSet = this.m_locals.tempSelectSet; } // grammar line 1884
            break;
            case 5: {
  this.m_result.select = this.m_locals.tempSelectSet;
  } // grammar line 1906
            break;
            case 7: {
  this.m_locals.tempSelectSet = RESOLVER.createViewSelectSet(this.m_locals.set.operator,this.m_locals.set.all,this.m_locals.set.distinct,this.m_result.select,null);
  if (this.m_result.select != null) {
  var leftStartIndex = this.m_result.select.getStartTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.tempSelectSet,leftStartIndex,-1);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.setSelectSet(this.m_locals.tempSelectSet);
  }
  if (this.m_result.parentSelectSet != null) {
  this.m_result.parentSelectSet.setRight(this.m_locals.tempSelectSet);
  this.m_result.parentSelectSet = null;
  }
  } // grammar line 1891
            { this.m_locals.sq2b.parent = null; this.m_locals.sq2b.parentSelectSet = this.m_locals.tempSelectSet; } // grammar line 1905
            break;
            case 8: {
   this.m_result.select = this.m_locals.sq1a.selectStmt;
   } // grammar line 1854
            break;
            case 9: { this.m_locals.sq1a.parent = this.m_result.parent; this.m_locals.sq1a.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1853
            break;
            case 10: {
   this.m_result.select = this.m_locals.sq1b.selectStmt;
   } // grammar line 1861
            break;
            case 11: { this.m_locals.sq1b.parent = this.m_result.parent; this.m_locals.sq1b.parentSelectSet = this.m_result.parentSelectSet; } // grammar line 1860
            break;
            case 13: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
  this.m_locals.tempSelectSet = null;
 } // grammar line 1842
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1848
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1950
            break;
            case 1: { this.m_locals.having.select = this.m_result.selectStmt; } // grammar line 1949
            break;
            case 2: { this.m_locals.group.select = this.m_result.selectStmt; } // grammar line 1948
            break;
            case 3: { this.m_locals.where.select = this.m_result.selectStmt; } // grammar line 1947
            break;
            case 4: { this.m_locals.select.select = this.m_result.selectStmt; this.m_locals.select.list = null; } // grammar line 1946
            break;
            case 5: { this.m_locals.adhoc.select = this.m_result.selectStmt; } // grammar line 1945
            break;
            case 7: {
  this.m_result.selectStmt = RESOLVER.viewparser_startSelect();
  if (this.m_result.parent != null) {
  this.m_result.parent.setSelect(this.m_result.selectStmt);
  }
  if (this.m_result.parentSelectSet != null) {
  this.m_result.parentSelectSet.setRight(this.m_result.selectStmt);
  }
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.selectStmt,this.m_locals.startIndex,-1);
  } // grammar line 1934
            { this.m_locals.from.select = this.m_result.selectStmt; } // grammar line 1944
            break;
            case 9: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1925
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1930
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
            case 0: { this.m_locals.elem.select = this.m_result.select; } // grammar line 1960
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.assocTo.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 1987
            break;
            case 2: {
  this.m_locals.assocTo.res.setNameToken(this.m_locals.id.res);
  this.m_locals.assocTo.res.setNamePath(null);
  RESOLVER.viewparser_setStartTokenIndex(this.m_locals.assocTo.res,this.m_locals.startIndex);
  } // grammar line 1980
            { this.m_locals.AssociationOnCondition.res = this.m_locals.assocTo.res; } // grammar line 1985
            break;
            case 4: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1976
            { this.m_locals.assocTo.parent = null; this.m_locals.assocTo.def = null; this.m_locals.assocTo.select = this.m_result.select; } // grammar line 1979
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1967
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2017
            break;
            case 2: {
    if (this.m_result.list != null) {
    this.m_result.res = this.m_result.list;
    }else{
    this.m_result.res = RESOLVER.viewparser_startSelectList0();
    RESOLVER.viewparser_selectlist(this.m_result.select,this.m_result.res);
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
    }
    } // grammar line 2005
            { this.m_locals.QLSelectList.list = this.m_result.res; } // grammar line 2014
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1995
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2000
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
            case 0: { this.m_locals.p2.list = this.m_result.list; } // grammar line 2029
            break;
            case 1: { this.m_locals.AnnotatedQLSelectItem.list = this.m_result.list; } // grammar line 2025
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
            case 0: { this.m_locals.QLSelectItem.preAnnotations = this.m_result.preAnnotations; this.m_locals.QLSelectItem.list = this.m_result.list; } // grammar line 2047
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 2042
            break;
            case 2: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 2037
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
            case 0: {
  this.m_result.res = this.m_locals.p1.entry;
  } // grammar line 2052
            break;
            case 1: { this.m_locals.p1.preAnnotations = this.m_result.preAnnotations; this.m_locals.p1.list = this.m_result.list; } // grammar line 2051
            break;
            case 2: {
  this.m_result.res = this.m_locals.p2.entry;
  } // grammar line 2057
            break;
            case 3: { this.m_locals.p2.preAnnotations = this.m_result.preAnnotations; this.m_locals.p2.list = this.m_result.list; } // grammar line 2056
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
} // grammar line 2067
            break;
        }
    }; // QLPathListSelectItemAlias_action.performAction()

    function QLPathListSelectItem_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLPathListSelectItem_locals(), BP, rule_info);
    }
    QLPathListSelectItem_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLPathListSelectItem_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry,this.m_locals.startIndex,this.m_locals.endIndex);
     } // grammar line 2126
            break;
            case 1: { this.m_locals.p2.select = null; this.m_locals.p2.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 2106
            break;
            case 2: {
  var nestedList = IAstFactory.eINSTANCE.createSelectList();
  this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
  this.m_locals.nestedEntry.setSelectList(nestedList);
  this.m_locals.pathExp.res.getPathEntries().push(this.m_locals.nestedEntry);
  } // grammar line 2100
            break;
            case 3: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 2098
            break;
            case 5: {
   this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
   RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.pathExp.res,this.m_locals.startIndex,this.m_locals.endIndex);
   } // grammar line 2089
            {
   this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.pathExp.res);
   RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
   RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
   } // grammar line 2093
            break;
            case 6: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 2122
            break;
            case 7: { this.m_locals.p3.select = null; this.m_locals.p3.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 2121
            break;
            case 8: {
   var nestedList = IAstFactory.eINSTANCE.createSelectList();
   this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
   this.m_locals.nestedEntry.setSelectList(nestedList);
   var pExp = RESOLVER.createPathExpression();
   pExp.getPathEntries().push(this.m_locals.nestedEntry);
   this.m_result.entry = RESOLVER.viewparser_selectListEntry(pExp);
   RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
   RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
   } // grammar line 2111
            break;
            case 10: {
  this.m_locals.nestedEntry = null;
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2077
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2083
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
            case 0: {
     this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
     } // grammar line 2168
            break;
            case 1: {
    RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id2.res));
    } // grammar line 2164
            break;
            case 2: {
   RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id1.res));
   } // grammar line 2146
            break;
            case 3: {
   RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.idsc1.res));
   } // grammar line 2156
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2133
            {
     this.m_result.res = RESOLVER.createPathExpression();
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     RESOLVER.viewparser_setStartTokenIndex(this.m_result.res,this.m_locals.startIndex);
     } // grammar line 2138
            break;
        }
    }; // QLPath_action.performAction()

    function PathGeneric_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathGeneric_locals(), BP, rule_info);
    }
    PathGeneric_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathGeneric_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id2.res));
} // grammar line 2181
            break;
            case 1: {
  RESOLVER.addEntry(this.m_result.path,RESOLVER.createPathEntry(this.m_locals.id1.res));
  } // grammar line 2177
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
            case 1: {
     this.m_result.res = RESOLVER.createPathExpression();
     } // grammar line 2188
            { this.m_locals.path.path = this.m_result.res; } // grammar line 2191
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
            case 0: { this.m_locals.PathGeneric.path = this.m_result.res; } // grammar line 2203
            break;
            case 1: {
  RESOLVER.markLastNamespacePathEntry(this.m_result.res);
  } // grammar line 2199
            break;
            case 3: {
     this.m_result.res = RESOLVER.createPathExpression();
     } // grammar line 2195
            { this.m_locals.NamespacePath.path = this.m_result.res; } // grammar line 2198
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
            case 0: {
this.m_result.alias = this.m_locals.alias.res;
} // grammar line 2213
            break;
            case 1: {
  this.m_result.res = this.m_locals.path.res;
  } // grammar line 2208
            break;
        }
    }; // PathWithAlias_action.performAction()

    function SetOperator_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SetOperator_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SetOperator_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _all_index = 1;
        var _dist_index = 2;
        var _dist1_index = 4;
        var _dist2_index = 6;
        var _dist3_index = 8;
        var _exc_index = 7;
        var _int1_index = 5;
        var _minus_index = 9;
        var _union_index = 3;
        switch (_action_num) {
            case 0: {
this.m_result.all = rnd.Parser.getTok(RESOLVER, this, _all_index);
} // grammar line 2226
            break;
            case 1: {
this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist_index);
} // grammar line 2230
            break;
            case 2: {
this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _union_index);
} // grammar line 2222
            break;
            case 3: {
this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist1_index);
} // grammar line 2241
            break;
            case 4: {
this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _int1_index);
} // grammar line 2237
            break;
            case 5: {
this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist2_index);
} // grammar line 2252
            break;
            case 6: {
this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _exc_index);
} // grammar line 2248
            break;
            case 7: {
this.m_result.distinct = rnd.Parser.getTok(RESOLVER, this, _dist3_index);
} // grammar line 2263
            break;
            case 8: {
this.m_result.operator = rnd.Parser.getTok(RESOLVER, this, _minus_index);
} // grammar line 2259
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
            case 1: {
  this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.alias.res);
  RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
  RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
  RESOLVER.viewparser_alias(this.m_result.entry,this.m_locals.alias.alias);
  } // grammar line 2280
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2287
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2271
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2276
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
            case 0: {
 if (this.m_result.select != null) {
 this.m_result.res = this.m_locals.l.res;
 this.m_result.select.setFrom(this.m_result.res);
 }
 } // grammar line 2298
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
            case 1: {
  this.m_result.res = this.m_locals.tab_path_1.res;
  } // grammar line 2317
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2335
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2308
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2313
            break;
        }
    }; // TablePathList_action.performAction()

    function TablePathAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TablePathAlias_locals(), BP, rule_info);
    }
    TablePathAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TablePathAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = this.m_locals.alias.res;
} // grammar line 2345
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
            case 1: {
  this.m_result.res = RESOLVER.viewparser_tableDatasource(this.m_locals.path.res);
  if (this.m_locals.alias.res != null) {
  this.m_result.res.setAliasToken(this.m_locals.alias.res);
  }
  } // grammar line 2365
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2372
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2352
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2357
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
  if (this.m_result.res != null) {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  }
  } // grammar line 2397
            break;
            case 1: {
this.m_result.res = RESOLVER.createExpressionContainer(this.m_locals.cond.res);
if (this.m_result.select != null) {
this.m_result.select.setWhere(this.m_result.res);
}
} // grammar line 2390
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2379
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2384
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
this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(groupBy,this.m_locals.startIndex,this.m_locals.endIndex);
this.m_result.select.setGroupBy(groupBy);
} // grammar line 2419
            break;
            case 2: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2407
            {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2412
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
this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(cont,this.m_locals.startIndex,this.m_locals.endIndex);
this.m_result.select.setHaving(cont);
} // grammar line 2441
            break;
            case 1: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 2436
            break;
            case 2: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2430
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
this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(orderBy,this.m_locals.startIndex,this.m_locals.endIndex);
if (this.m_result.select != null) {
this.m_result.select.setOrderBy(orderBy);
RESOLVER.viewparser_setEndTokenIndex(this.m_result.select,this.m_locals.endIndex);
}
} // grammar line 2466
            break;
            case 1: {
RESOLVER.viewparser_setEndTokenIndex(this.m_result.select,-1);
} // grammar line 2461
            break;
            case 2: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 2457
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2451
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
            case 0: {
this.m_result.res.push(this.m_locals.specN.res);
} // grammar line 2486
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.spec1.res);
  } // grammar line 2480
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
  } // grammar line 2504
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2511
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2493
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2498
            break;
        }
    }; // SortSpec_action.performAction()

    function OptAscDesc_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new OptAscDesc_locals(), BP, rule_info);
    }
    OptAscDesc_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptAscDesc_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.res = this.m_locals.asc.name;
  } // grammar line 2521
            break;
            case 1: {
  this.m_result.res = this.m_locals.des.name;
  } // grammar line 2526
            break;
        }
    }; // OptAscDesc_action.performAction()

    function OptNullsFirstLast_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new OptNullsFirstLast_locals(), BP, rule_info);
    }
    OptNullsFirstLast_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptNullsFirstLast_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.nulls = this.m_locals.n.name;
this.m_result.firstLast = this.m_locals.f.name;
} // grammar line 2538
            break;
            case 1: {
this.m_result.nulls = this.m_locals.n.name;
this.m_result.firstLast = this.m_locals.l.name;
} // grammar line 2544
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2575
            break;
            case 1: {
if (this.m_result.res == null) {
this.m_result.res = RESOLVER.viewparser_orExpression(this.m_locals.condAnd.res,this.m_locals.right.res);
}else this.m_result.res = RESOLVER.viewparser_orExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 2568
            break;
            case 2: {
  this.m_result.res = this.m_locals.condAnd.res;
  } // grammar line 2562
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2553
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2558
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2602
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_andExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 2597
            break;
            case 2: {
  this.m_result.res = this.m_locals.condTerm.res;
  } // grammar line 2591
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2582
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2587
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2643
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.cond1.res);
} // grammar line 2621
            break;
            case 2: {
this.m_result.res = this.m_locals.cond2.res;
} // grammar line 2629
            break;
            case 3: {
this.m_result.res = this.m_locals.predLeftIsExpr.res;
} // grammar line 2637
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2609
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2614
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2719
            break;
            case 1: {
this.m_result.res = this.m_locals.comp.res;
} // grammar line 2666
            break;
            case 2: { this.m_locals.comp.left = this.m_locals.left.res; } // grammar line 2665
            break;
            case 3: {
this.m_result.res = this.m_locals.nullPred.res;
} // grammar line 2673
            break;
            case 4: { this.m_locals.nullPred.expr = this.m_locals.left.res; } // grammar line 2672
            break;
            case 5: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.range.res);
}else{
this.m_result.res = this.m_locals.range.res;
}
} // grammar line 2685
            break;
            case 6: { this.m_locals.range.expr1 = this.m_locals.left.res; this.m_locals.range.negated = this.m_result.negated; } // grammar line 2684
            break;
            case 7: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.like.res);
}else{
this.m_result.res = this.m_locals.like.res;
}
} // grammar line 2696
            break;
            case 8: { this.m_locals.like.expr1 = this.m_locals.left.res; this.m_locals.like.negated = this.m_result.negated; } // grammar line 2695
            break;
            case 9: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.in.res);
}else{
this.m_result.res = this.m_locals.in.res;
}
} // grammar line 2707
            break;
            case 10: { this.m_locals.in.left = this.m_locals.left.res; this.m_locals.in.negated = this.m_result.negated; } // grammar line 2706
            break;
            case 11: {
this.m_result.negated = true;
} // grammar line 2679
            break;
            case 14: { this.m_result.negated = false; } // grammar line 2649
            {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2650
            {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2655
            break;
        }
    }; // PredicateLeftIsExpression_action.performAction()

    function ComparisonPredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new ComparisonPredicate_locals(), BP, rule_info);
    }
    ComparisonPredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ComparisonPredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _b_index = 3;
        var _be_index = 4;
        var _eq_index = 1;
        var _gs_index = 2;
        var _s_index = 5;
        var _se_index = 6;
        switch (_action_num) {
            case 0: {
  this.m_result.res = RESOLVER.viewparser_compExpression(this.m_result.comp,this.m_result.left,this.m_locals.right.res);
  } // grammar line 2762
            break;
            case 1: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _eq_index);
} // grammar line 2728
            break;
            case 2: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _gs_index);
} // grammar line 2733
            break;
            case 3: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _b_index);
} // grammar line 2738
            break;
            case 4: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _be_index);
} // grammar line 2743
            break;
            case 5: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _s_index);
} // grammar line 2748
            break;
            case 6: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _se_index);
} // grammar line 2753
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
            case 1: {
 this.m_result.res = RESOLVER.viewparser_betweenExpression(this.m_result.expr1,this.m_locals.expr2.res,this.m_locals.expr3.res);
 } // grammar line 2781
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2785
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2768
            {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2773
            break;
        }
    }; // RangePredicate_action.performAction()

    function LikePredicate_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new LikePredicate_locals(), BP, rule_info);
    }
    LikePredicate_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    LikePredicate_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
  this.m_result.res = RESOLVER.viewparser_likeExpression(this.m_locals.l.name,this.m_result.expr1,this.m_locals.expr2.res,this.m_result.escapeToken);
  } // grammar line 2813
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2817
            break;
            case 2: {
this.m_result.escapeToken = (this.m_locals.expr3.res).getTokenToken();
} // grammar line 2809
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2792
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2797
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
            case 0: {
  this.m_result.res = RESOLVER.viewparser_nullExpression(this.m_result.expr,this.m_result.isNull);
  } // grammar line 2832
            break;
            case 1: {
this.m_result.isNull = true;
} // grammar line 2827
            break;
            case 2: { this.m_result.isNull = false; } // grammar line 2823
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
            case 0: {
this.m_result.res = RESOLVER.viewparser_inExpression(this.m_result.left,this.m_locals.list.res);
} // grammar line 2849
            break;
            case 1: {
this.m_locals.inExpression.getIns().push(this.m_locals.expr.res);
} // grammar line 2863
            break;
            case 2: {
   this.m_locals.inExpression = IAstFactory.eINSTANCE.createInExpression();
   this.m_result.res = this.m_locals.inExpression;
   this.m_locals.inExpression.setLeft(this.m_result.left);
   } // grammar line 2855
            break;
            case 3: {
  this.m_locals.inExpression = null;
 } // grammar line 2839
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
            case 0: {
this.m_result.res.push(this.m_locals.expr_n.res);
} // grammar line 2883
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.expr.res);
  } // grammar line 2876
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
            case 1: {
  this.m_result.res = this.m_locals.exprConcat.res;
  } // grammar line 2901
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2905
            break;
            case 3: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2891
            {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2897
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2931
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprSum2.res,rnd.Parser.getTok(RESOLVER, this, _op_index));
} // grammar line 2926
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprSum1.res;
  } // grammar line 2921
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2912
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2917
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 2966
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor2.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 2953
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor3.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 2960
            break;
            case 3: {
  this.m_result.res = this.m_locals.exprFactor1.res;
  } // grammar line 2947
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2938
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2943
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
            case 0: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm2.res,rnd.Parser.getTok(RESOLVER, this, _opMul_index));
} // grammar line 2980
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm3.res,rnd.Parser.getTok(RESOLVER, this, _opDiv_index));
} // grammar line 2987
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprTerm1.res;
  } // grammar line 2974
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3068
            break;
            case 1: {
this.m_result.res = this.m_locals.col.res;
} // grammar line 3007
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm1.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 3014
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm2.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 3021
            break;
            case 4: {
this.m_result.res = this.m_locals.exprTerm3.res;
} // grammar line 3028
            break;
            case 5: {
this.m_result.res = RESOLVER.viewparser_iliteral(this.m_locals.literal.res);
} // grammar line 3035
            break;
            case 6: {
this.m_result.res = this.m_locals.agg.res;
} // grammar line 3042
            break;
            case 7: {
this.m_result.res = this.m_locals.func.res;
} // grammar line 3049
            break;
            case 8: {
this.m_result.res = this.m_locals.namedArgFunc.res;
} // grammar line 3056
            break;
            case 9: {
this.m_result.res = this.m_locals.caseExpr.res;
} // grammar line 3063
            break;
            case 11: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 2996
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3001
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3128
            break;
            case 1: {
    RESOLVER.addElseExpression(this.m_result.res,this.m_locals.optElse.res);
    } // grammar line 3123
            break;
            case 3: {
this.m_result.res = RESOLVER.createSimpleCaseExpression(this.m_locals.expr1.res);
} // grammar line 3106
            { this.m_locals.cases1.caseExpr = this.m_result.res; } // grammar line 3109
            break;
            case 5: {
   this.m_result.res = RESOLVER.createSearchedCaseExpression();
   } // grammar line 3114
            { this.m_locals.cases2.caseExpr = this.m_result.res; } // grammar line 3117
            break;
            case 7: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3093
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3098
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
            case 0: { this.m_locals.listEl2.caseExpr = this.m_result.caseExpr; } // grammar line 3137
            break;
            case 1: { this.m_locals.listEl1.caseExpr = this.m_result.caseExpr; } // grammar line 3135
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
            case 0: { this.m_locals.listEl2.caseExpr = this.m_result.caseExpr; } // grammar line 3144
            break;
            case 1: { this.m_locals.listEl1.caseExpr = this.m_result.caseExpr; } // grammar line 3142
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
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(caseWhen,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3161
            break;
            case 2: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3149
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3154
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
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(caseWhen,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3181
            break;
            case 2: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3169
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3174
            break;
        }
    }; // WhenConditionThen_action.performAction()

    function Literal_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Literal_locals(), BP, rule_info);
    }
    Literal_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Literal_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = this.m_locals.int_val.res;
} // grammar line 3191
            break;
            case 1: {
this.m_result.res = this.m_locals.string_lit.res;
} // grammar line 3198
            break;
            case 2: {
this.m_result.res = this.m_locals.real_lit.res;
} // grammar line 3205
            break;
            case 3: {
this.m_result.res = this.m_locals.binary_lit.res;
} // grammar line 3212
            break;
            case 4: {
this.m_result.res = this.m_locals.date_lit.res;
} // grammar line 3219
            break;
            case 5: {
this.m_result.res = this.m_locals.time_lit.res;
} // grammar line 3226
            break;
            case 6: {
this.m_result.res = this.m_locals.timestamp_lit.res;
} // grammar line 3233
            break;
            case 7: {
this.m_result.res = this.m_locals.null_lit.res;
} // grammar line 3241
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
            case 0: {
this.m_result.alias = this.m_locals.alias1.res;
} // grammar line 3256
            break;
            case 1: {
  this.m_result.res = this.m_locals.expr.res;
  } // grammar line 3250
            break;
        }
    }; // ExprAlias_action.performAction()

    function Agg_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Agg_locals(), BP, rule_info);
    }
    Agg_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Agg_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _st_index = 1;
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3302
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,RESOLVER.viewparser_iliteral(rnd.Parser.getTok(RESOLVER, this, _st_index)));
} // grammar line 3278
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr.res);
(this.m_result.res).setAllToken(this.m_locals.agg_all.res);
} // grammar line 3286
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr2.res);
(this.m_result.res).setDistinctToken(this.m_locals.d.name);
} // grammar line 3295
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3265
            {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 3270
            break;
        }
    }; // Agg_action.performAction()

    function AggName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AggName_locals(), BP, rule_info);
    }
    AggName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AggName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = this.m_locals.c.name;
} // grammar line 3309
            break;
            case 1: {
this.m_result.res = this.m_locals.mi.name;
} // grammar line 3312
            break;
            case 2: {
this.m_result.res = this.m_locals.ma.name;
} // grammar line 3315
            break;
            case 3: {
this.m_result.res = this.m_locals.su.name;
} // grammar line 3318
            break;
            case 4: {
this.m_result.res = this.m_locals.av.name;
} // grammar line 3321
            break;
            case 5: {
this.m_result.res = this.m_locals.std.name;
} // grammar line 3324
            break;
            case 6: {
this.m_result.res = this.m_locals.va.name;
} // grammar line 3327
            break;
        }
    }; // AggName_action.performAction()

    function OptAll_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new OptAll_locals(), BP, rule_info);
    }
    OptAll_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    OptAll_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = null;
} // grammar line 3333
            break;
            case 1: {
this.m_result.res = this.m_locals.a.name;
} // grammar line 3336
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3363
            break;
            case 1: { this.m_locals.NamedArgumentList.funcExpr = this.m_result.res; } // grammar line 3359
            break;
            case 2: { this.m_locals.expr.funcExpr = this.m_result.res; } // grammar line 3357
            break;
            case 3: {
  this.m_result.res = RESOLVER.viewparser_funcWithNamedParamExpression(this.m_locals.func_name.res);
  } // grammar line 3352
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3343
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3348
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
            case 1: {
  this.m_locals.funcParam.setExpression(this.m_locals.expr1.res);
  } // grammar line 3385
            {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.funcParam,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3388
            break;
            case 2: {
  this.m_locals.funcParam = RESOLVER.viewparser_addFuncParam(this.m_result.funcExpr,this.m_locals.proc_param_name.res);
  } // grammar line 3380
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
  this.m_locals.funcParam = null;
 } // grammar line 3370
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3376
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
            case 0: { this.m_locals.expr_n.funcExpr = this.m_result.funcExpr; } // grammar line 3399
            break;
            case 1: { this.m_locals.expr.funcExpr = this.m_result.funcExpr; } // grammar line 3396
            break;
        }
    }; // NamedArgumentList_action.performAction()

    function Func_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Func_locals(), BP, rule_info);
    }
    Func_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Func_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3434
            break;
            case 1: {
for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
var ex = this.m_locals.list.res[exCount];
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,ex);
}
} // grammar line 3425
            break;
            case 2: {
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);
} // grammar line 3420
            break;
            case 3: {
  this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.func_name.res);
  } // grammar line 3415
            break;
            case 5: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3405
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3410
            break;
        }
    }; // Func_action.performAction()

    function NamedArgumentFuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NamedArgumentFuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NamedArgumentFuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id1_index = 1;
        var _id2_index = 2;
        switch (_action_num) {
            case 0: {
this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id1_index);
} // grammar line 3442
            break;
            case 1: {
this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id2_index);
} // grammar line 3446
            break;
        }
    }; // NamedArgumentFuncName_action.performAction()

    function FuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    FuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
      this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());
      } // grammar line 3569
            break;
        }
    }; // FuncName_action.performAction()

    function annotationDefintions_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationDefintions_locals(), BP, rule_info);
    }
    annotationDefintions_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationDefintions_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.defs.preAnnotations = null; } // grammar line 3592
            break;
        }
    }; // annotationDefintions_action.performAction()

    function annotationDefintionsWithAnnotation_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationDefintionsWithAnnotation_locals(), BP, rule_info);
    }
    annotationDefintionsWithAnnotation_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationDefintionsWithAnnotation_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   if (this.m_locals.definition.anno != null && this.m_result.preAnnotations != null) {
   RESOLVER.addAnnotations(this.m_locals.definition.anno,this.m_result.preAnnotations);
   }
   } // grammar line 3612
            break;
            case 1: { this.m_locals.definition.annots = null; this.m_locals.definition.parentStmts = null; } // grammar line 3611
            break;
            case 2: {
   RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
   } // grammar line 3607
            break;
            case 3: {
    this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
    } // grammar line 3602
            break;
            case 4: {
     RESOLVER.compilationUnit = IAstFactory.eINSTANCE.createCompilationUnit();
     } // grammar line 3598
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
            case 0: {
  this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.anno,this.m_locals.startIndex,this.m_locals.endIndex);
  } // grammar line 3651
            break;
            case 2: {
     this.m_result.anno = RESOLVER.createAnnotationDeclarationWithPath(this.m_locals.name.res);
     if (this.m_result.annots != null) {
     RESOLVER.addAnnotations(this.m_result.anno,this.m_result.annots);
     }
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.anno);
     }else{
     RESOLVER.viewparser_setDDLStmt(this.m_result.anno);
     }
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.anno,this.m_locals.startIndex,-1);
     } // grammar line 3634
            { this.m_locals.type.element = this.m_result.anno; } // grammar line 3646
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3623
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3628
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
            case 0: { this.m_locals.AnnotationTypeArray.element = this.m_result.element; } // grammar line 3691
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 3693
            break;
            case 2: { this.m_locals.AnnotationTypeTypeOf.element = this.m_result.element; } // grammar line 3695
            break;
            case 3: { this.m_locals.type2.element = this.m_result.element; this.m_locals.type2.type = null; } // grammar line 3700
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
            case 0: {
  this.m_result.element.setTypeOfPath(this.m_locals.id.res);
  } // grammar line 3708
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
            case 0: { this.m_locals.def.res = this.m_result.element; } // grammar line 3722
            break;
            case 1: { this.m_locals.enumeration.element = this.m_result.element; this.m_locals.enumeration.val = null; } // grammar line 3719
            break;
            case 2: { this.m_locals.AnnotationTypeNamed.element = this.m_result.element; } // grammar line 3717
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
            case 0: {
RESOLVER.viewparser_setElementDefault(this.m_result.res,this.m_locals.expr.res);
} // grammar line 3734
            break;
            case 1: {
RESOLVER.viewparser_setElementDefaultToken(this.m_result.res,this.m_locals.enumVal.res);
} // grammar line 3741
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
            case 0: {
   RESOLVER.setDecimals(this.m_result.element,this.m_locals.decimals.res);
   } // grammar line 3765
            break;
            case 1: {
    RESOLVER.setLength(this.m_result.element,this.m_locals.length.res);
    } // grammar line 3759
            break;
            case 2: {
     this.m_result.element.setTypeIdPath(this.m_locals.typeName.res);
     } // grammar line 3753
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
            case 0: { this.m_locals.type1.element = this.m_result.element; this.m_locals.type1.type = null; } // grammar line 3776
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 3778
            break;
        }
    }; // AnnotationTypeSpecNoColon_action.performAction()

    function AnnotationTypeArray_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeArray_locals(), BP, rule_info);
    }
    AnnotationTypeArray_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeArray_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _arr_index = 1;
        var _arrof_index = 2;
        switch (_action_num) {
            case 1: {
     this.m_result.element.setArrayToken(rnd.Parser.getTok(RESOLVER, this, _arr_index));
     this.m_result.element.setArrayOfToken(rnd.Parser.getTok(RESOLVER, this, _arrof_index));
     } // grammar line 3785
            { this.m_locals.AnnotationTypeSpecNoColon.element = this.m_result.element; } // grammar line 3789
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
            case 0: {
     this.m_result.res = this.m_locals.typeName.res;
     } // grammar line 3796
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
            case 0: {
    this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.val,this.m_locals.startIndex,this.m_locals.endIndex);
    } // grammar line 3838
            break;
            case 2: {
   this.m_result.val.setLiteral(RESOLVER.viewparser_cliteral(this.m_locals.lit.res));
   } // grammar line 3827
            {
    if (this.m_result.val.getLiteral() == null) {
    var implicitSymbol = RESOLVER.viewparser_cliteral(this.m_locals.symbol.res);
    this.m_result.val.setLiteral(implicitSymbol);
    }
    } // grammar line 3831
            break;
            case 3: {
    this.m_result.val.setSymbol(this.m_locals.symbol.res);
    } // grammar line 3821
            break;
            case 4: {
    this.m_result.val = RESOLVER.createAndSetEnumerationValue(this.m_result.enumeration);
    this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.val,this.m_locals.startIndex,-1);
    } // grammar line 3815
            break;
            case 5: {
     this.m_result.enumeration = RESOLVER.createAndSetEnumerationDeclaration(this.m_result.element);
     } // grammar line 3810
            break;
            case 6: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 3804
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
            case 0: {
     this.m_locals.typeEndIndex = RESOLVER.getLastMatchedTokenIndex();
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.type,this.m_locals.typeStartIndex,this.m_locals.typeEndIndex);
     } // grammar line 3882
            break;
            case 1: {
 this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
 RESOLVER.viewparser_setEndTokenIndex(this.m_result.element,this.m_locals.endIndex);
 } // grammar line 3875
            break;
            case 3: {
this.m_result.element.setNameToken(this.m_locals.name.res);
} // grammar line 3871
            { this.m_locals.type.element = this.m_result.element; } // grammar line 3874
            break;
            case 4: {
    this.m_result.element = RESOLVER.createAndSetAttributeDeclaration(this.m_result.type);
    this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
    RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.element,this.m_locals.startIndex,-1);
    } // grammar line 3866
            break;
            case 5: {
     this.m_result.type = RESOLVER.createAndSetAnonymousTypeDeclaration(this.m_result.element);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.type,this.m_locals.typeStartIndex,-1);
     } // grammar line 3861
            break;
            case 7: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
  this.m_locals.typeStartIndex = 0;
  this.m_locals.typeEndIndex = 0;
 } // grammar line 3848
            {
     this.m_locals.typeStartIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 3856
            break;
        }
    }; // annotationStructuredType_action.performAction()

    function ELEMENT_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ELEMENT_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ELEMENT_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _e_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _e_index);
} // grammar line 3906
            break;
        }
    }; // ELEMENT_action.performAction()

    function KEY_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    KEY_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    KEY_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _k_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _k_index);
} // grammar line 3912
            break;
        }
    }; // KEY_action.performAction()

    function LIKE_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    LIKE_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    LIKE_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _l_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _l_index);
} // grammar line 3915
            break;
        }
    }; // LIKE_action.performAction()

    function NOT_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NOT_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NOT_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3931
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
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3934
            break;
        }
    }; // NULL_action.performAction()

    function ASC_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ASC_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ASC_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3942
            break;
        }
    }; // ASC_action.performAction()

    function DESC_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    DESC_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DESC_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3945
            break;
        }
    }; // DESC_action.performAction()

    function NULLS_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    NULLS_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    NULLS_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3948
            break;
        }
    }; // NULLS_action.performAction()

    function FIRST_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    FIRST_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FIRST_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3951
            break;
        }
    }; // FIRST_action.performAction()

    function LAST_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    LAST_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    LAST_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3954
            break;
        }
    }; // LAST_action.performAction()

    function DISTINCT_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    DISTINCT_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    DISTINCT_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3957
            break;
        }
    }; // DISTINCT_action.performAction()

    function COUNT_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    COUNT_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    COUNT_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3960
            break;
        }
    }; // COUNT_action.performAction()

    function MIN_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    MIN_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    MIN_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3963
            break;
        }
    }; // MIN_action.performAction()

    function MAX_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    MAX_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    MAX_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3966
            break;
        }
    }; // MAX_action.performAction()

    function SUM_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    SUM_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    SUM_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3969
            break;
        }
    }; // SUM_action.performAction()

    function AVG_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    AVG_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AVG_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3972
            break;
        }
    }; // AVG_action.performAction()

    function STDDEV_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    STDDEV_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    STDDEV_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3975
            break;
        }
    }; // STDDEV_action.performAction()

    function VAR_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    VAR_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    VAR_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3978
            break;
        }
    }; // VAR_action.performAction()

    function ALL_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    ALL_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    ALL_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _n_index = 1;
        switch (_action_num) {
            case 0: {
this.m_result.name = rnd.Parser.getTok(RESOLVER, this, _n_index);
} // grammar line 3981
            break;
        }
    }; // ALL_action.performAction()

    CdsDdlParserResolver.prototype.createFrame0 = function(frame_num, rule_info) {
        switch (frame_num) {
            case 0: // START1
                return new START_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 1: // START_SYNTAX_COLORING1
                return new START_SYNTAX_COLORING_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 2: // QLPathStartRule2
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new QLPathStartRule_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 3: // annotationDefintions1
                return new annotationDefintions_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 4: // START22
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 6: // TopLevelDeclaration1
                return new TopLevelDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TopLevelDeclaration);
            case 7: // UsingDirectiveList1
                return new UsingDirectiveList_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 8: // NamespaceDeclaration1
                return new NamespaceDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespaceDeclaration);
            case 9: // START21
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 10: // AnnotatedElementDeclaration2
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclaration);
            case 12: // NamespacePath1
                return new NamespacePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespacePath);
            case 14: // UsingDirective1
                return new UsingDirective_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.directive);
            case 15: // IdWrapper5
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 17: // PathWithNamespace1
                return new PathWithNamespace_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 18: // ContextDeclaration1
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c_decl);
            case 19: // AccessPolicyDeclaration1
                return new AccessPolicyDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AccessPolicyDeclaration);
            case 20: // EntityDeclaration2
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e_decl);
            case 21: // ViewDeclaration2
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.v_decl);
            case 22: // TypeDeclaration2
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.t_decl);
            case 23: // ConstDeclaration2
                return new ConstDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.co_decl);
            case 24: // AnnotationDeclaration2
                return new AnnotationDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot_decl);
            case 26: // PreAnnotation1
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 27: // ContextComponentDeclaration1
                return new ContextComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ContextComponentDeclaration);
            case 28: // QualifiedDefId1
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 30: // ContextDeclaration2
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c_decl);
            case 31: // TypeDeclaration1
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.t_decl);
            case 32: // EntityDeclaration1
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e_decl);
            case 33: // ViewDeclaration1
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.v_decl);
            case 34: // ConstDeclaration1
                return new ConstDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.co_decl);
            case 35: // AnnotationDeclaration1
                return new AnnotationDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot_decl);
            case 37: // PreAnnotation2
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 38: // AccessPolicyComponentDeclaration1
                return new AccessPolicyComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.n2);
            case 39: // QualifiedDefId7
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 40: // RoleDeclaration1
                return new RoleDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.r_decl);
            case 41: // AspectDeclaration2
                return new AspectDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a_decl);
            case 43: // PreAnnotation6
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 44: // RuleDeclaration1
                return new RuleDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RuleDeclaration);
            case 45: // QualifiedDefId8
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 46: // RuleSubquery1
                return new RuleSubquery_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.rule);
            case 47: // AspectDeclaration1
                return new AspectDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a_decl);
            case 49: // WhereClause2
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 50: // RuleFromClause1
                return new RuleFromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.from);
            case 51: // QLPath5
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path1);
            case 52: // QLPath6
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path2);
            case 53: // QLSubqueryElementary3
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ql_query_decl);
            case 55: // QualifiedDefId9
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 56: // AnnotatedElementDeclarationLoop1
                return new AnnotatedElementDeclarationLoop_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclarationLoop);
            case 57: // QualifiedDefId3
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 59: // AnnotatedElementDeclaration1
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclaration);
            case 60: // QLSelectStmtNoOption1
                return new QLSelectStmtNoOption_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectStmtNoOption);
            case 62: // QualifiedDefId4
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 64: // ElementDeclaration1
                return new ElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ElementDeclaration);
            case 65: // PreAnnotation4
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 66: // Nullability1
                return new Nullability_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Nullability);
            case 67: // DefaultClause2
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 68: // TypeSpec3
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 69: // DefId4
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 70: // ELEMENT2
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 71: // ElementModifier1
                return new ElementModifier_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.modifiers);
            case 72: // NULL3
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nu);
            case 73: // NOT4
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.no);
            case 74: // Expression21
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 75: // EnumIdWrapper1
                return new EnumIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumVal);
            case 77: // KEY1
                return new KEY_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.key);
            case 78: // ConstValue1
                return new ConstValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 79: // TypeSpec4
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 80: // QualifiedDefId5
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 81: // Expression24
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exp);
            case 82: // Expression1
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 83: // DefId3
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 84: // StructuredType1
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredType);
            case 85: // TypeSpec2
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 86: // QualifiedDefId2
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 88: // StructuredTypeComponent1
                return new StructuredTypeComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredTypeComponent);
            case 89: // AnnotatedTypeComponentDeclaration1
                return new AnnotatedTypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typecomponent);
            case 90: // TypeComponentDeclaration1
                return new TypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeCompDecl);
            case 91: // PreAnnotation3
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 92: // DefaultClause1
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 93: // TypeSpec1
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 94: // DefId2
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 95: // ELEMENT1
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 96: // TypeTypeOf1
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 97: // TypeArray1
                return new TypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.arr);
            case 98: // TypeNamedOrEnum2
                return new TypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 99: // TypeAssoc1
                return new TypeAssoc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeassoc);
            case 101: // StructuredType3
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp_list);
            case 102: // TypeTypeOf2
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 103: // TypeNamedOrEnum1
                return new TypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 104: // StructuredType2
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp_list);
            case 105: // PathSimple2
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 108: // TypeSpecNoColon1
                return new TypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sub);
            case 109: // EnumValueDeclaration1
                return new EnumValueDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.val_decl);
            case 110: // TypeNamed1
                return new TypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.named);
            case 111: // IntLiteralWrapper3
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 112: // IntLiteralWrapper2
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 113: // TypeName1
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 114: // PathSimple3
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 115: // AssociationForeignKeyElement1
                return new AssociationForeignKeyElement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.r);
            case 116: // PathWithAlias2
                return new PathWithAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.kn);
            case 117: // PathWithAlias1
                return new PathWithAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.k1);
            case 118: // PathSimple4
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.target);
            case 120: // Cardinality1
                return new Cardinality_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Cardinality);
            case 122: // AssociationForeignKeys1
                return new AssociationForeignKeys_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationForeignKeys);
            case 123: // AssociationOnCondition1
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 124: // Condition3
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 125: // AssocForeignKeyOrJoinCondition1
                return new AssocForeignKeyOrJoinCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssocForeignKeyOrJoinCondition);
            case 126: // AssociationTo1
                return new AssociationTo_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.assocTo);
            case 127: // IntLiteralWrapper7
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.max1);
            case 128: // IntLiteralWrapper6
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.min);
            case 129: // IntLiteralWrapper5
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.srcMax);
            case 130: // IdWrapper2
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 131: // IdWrapper1
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 132: // DefId1
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defid);
            case 133: // IdWrapper7
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 134: // IdWrapper6
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 135: // QuotedId1
                return new QuotedId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idq);
            case 136: // IdWrapper10
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 137: // NULL1
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullLit);
            case 138: // IdWrapper8
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 139: // PathSimple1
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.refToConst);
            case 140: // AnnotationLiteral1
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit_val);
            case 141: // RecordValue1
                return new RecordValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordValue);
            case 142: // ArrayValue1
                return new ArrayValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ArrayValue);
            case 143: // RecordComponent2
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 144: // RecordComponent1
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 145: // AnnotationValue1
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 147: // AnnotationPath1
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 148: // AnnotationValue2
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 150: // AnnotationPath2
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 151: // AnnotationValue4
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 152: // AnnotationValue3
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 153: // AnnotationId2
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 154: // AnnotationId1
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 155: // StringLiteralWrapper1
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.str_val);
            case 156: // IntLiteralWrapper1
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 157: // RealLiteral1
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 158: // BinaryLiteral1
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 159: // DateLiteral1
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 160: // TimeLiteral1
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 161: // TimeStampLiteral1
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 162: // NullLiteral1
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 163: // QLSubqueryComplex1
                return new QLSubqueryComplex_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSubqueryComplex);
            case 164: // QLSubqueryComplex2
                return new QLSubqueryComplex_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1);
            case 165: // OrderByClause1
                return new OrderByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.OrderByClause);
            case 166: // QLSubquerySet1
                return new QLSubquerySet_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq);
            case 167: // QLSubqueryElementary2
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq2a);
            case 168: // QLSubqueryWithParens2
                return new QLSubqueryWithParens_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq2b);
            case 169: // SetOperator1
                return new SetOperator_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.set);
            case 170: // QLSubqueryElementary1
                return new QLSubqueryElementary_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1a);
            case 171: // QLSubqueryWithParens1
                return new QLSubqueryWithParens_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.sq1b);
            case 172: // HavingClause1
                return new HavingClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.having);
            case 173: // GroupByClause1
                return new GroupByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.group);
            case 174: // WhereClause1
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 175: // QLSelectClause1
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.select);
            case 176: // AdhocDeclarationBlock1
                return new AdhocDeclarationBlock_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.adhoc);
            case 177: // FromClause1
                return new FromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.from);
            case 179: // AdhocElementDeclaration1
                return new AdhocElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elem);
            case 180: // AssociationOnCondition2
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 181: // AssociationTo2
                return new AssociationTo_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.assocTo);
            case 183: // DefId5
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 184: // QLSelectList1
                return new QLSelectList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectList);
            case 185: // AnnotatedQLSelectItem2
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 186: // AnnotatedQLSelectItem1
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedQLSelectItem);
            case 187: // QLSelectItem1
                return new QLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectItem);
            case 188: // PreAnnotation5
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 189: // ExprSelectItem1
                return new ExprSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 190: // QLPathListSelectItem1
                return new QLPathListSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 191: // IdWrapper16
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 193: // QLSelectClause2
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 194: // QLPathListSelectItemAlias1
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 195: // QLPath4
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pathExp);
            case 196: // QLPathListSelectItemAlias2
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 197: // QLSelectClause3
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p3);
            case 198: // IdWrapper11
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 199: // IdWrapper9
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 200: // ScopedIdWrapper1
                return new ScopedIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idsc1);
            case 201: // IdWrapper4
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 202: // IdWrapper3
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 203: // PathGeneric2
                return new PathGeneric_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 204: // PathGeneric1
                return new PathGeneric_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.PathGeneric);
            case 205: // NamespacePath2
                return new NamespacePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespacePath);
            case 206: // IdWrapper13
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 208: // PathSimple5
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 209: // ExprAlias1
                return new ExprAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 210: // TablePathList1
                return new TablePathList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 212: // TablePath1
                return new TablePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tab_path_1);
            case 213: // IdWrapper14
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 215: // TablePathAlias1
                return new TablePathAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 216: // QLPath3
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 217: // Condition4
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 219: // ExpressionList3
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 222: // Condition5
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 224: // SortSpecList1
                return new SortSpecList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 227: // SortSpec2
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.specN);
            case 228: // SortSpec1
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.spec1);
            case 229: // OptNullsFirstLast1
                return new OptNullsFirstLast_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nfl);
            case 230: // OptAscDesc1
                return new OptAscDesc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 231: // Expression23
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 232: // ASC1
                return new ASC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.asc);
            case 233: // DESC1
                return new DESC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.des);
            case 234: // FIRST1
                return new FIRST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.f);
            case 235: // LAST1
                return new LAST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 236: // NULLS1
                return new NULLS_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.n);
            case 237: // ConditionAnd2
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 239: // ConditionAnd1
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condAnd);
            case 240: // ConditionTerm3
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 242: // ConditionTerm1
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condTerm);
            case 243: // ConditionTerm2
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 244: // NOT1
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 245: // Condition2
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond2);
            case 246: // PredicateLeftIsExpression1
                return new PredicateLeftIsExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.predLeftIsExpr);
            case 247: // ComparisonPredicate1
                return new ComparisonPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp);
            case 248: // NullPredicate1
                return new NullPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullPred);
            case 249: // RangePredicate1
                return new RangePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.range);
            case 250: // LikePredicate1
                return new LikePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.like);
            case 251: // InPredicate1
                return new InPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.in);
            case 252: // NOT3
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 253: // Expression12
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.left);
            case 255: // Expression13
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 257: // Expression15
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 259: // Expression14
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 261: // Expression17
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 263: // Expression16
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 265: // LIKE1
                return new LIKE_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 266: // NULL2
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NULL);
            case 267: // NOT2
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 269: // ExpressionList2
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 270: // Expression18
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 273: // Expression7
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr_n);
            case 274: // Expression6
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 275: // ExprConcat1
                return new ExprConcat_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprConcat);
            case 276: // ExprSum2
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum2);
            case 277: // ExprSum1
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum1);
            case 278: // ExprFactor2
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor2);
            case 279: // ExprFactor3
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor3);
            case 280: // ExprFactor1
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor1);
            case 281: // ExprTerm4
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 282: // ExprTerm5
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 283: // ExprTerm1
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 284: // QLPath1
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.col);
            case 285: // ExprTerm2
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 286: // ExprTerm3
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 287: // Expression2
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 288: // Literal1
                return new Literal_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.literal);
            case 289: // Agg1
                return new Agg_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg);
            case 290: // Func1
                return new Func_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func);
            case 291: // NamedArgFunc1
                return new NamedArgFunc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.namedArgFunc);
            case 292: // CaseExpression1
                return new CaseExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.caseExpr);
            case 293: // QLPathStartRule1
                return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new QLPathStartRule_locals(), this.m_current.m_BP.ptr(), rule_info);
            case 294: // QLPath2
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPath);
            case 295: // Expression20
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.optElse);
            case 296: // WhenExpressionThenList1
                return new WhenExpressionThenList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cases1);
            case 297: // Expression9
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 298: // WhenConditionThenList1
                return new WhenConditionThenList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cases2);
            case 299: // WhenExpressionThen2
                return new WhenExpressionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.listEl2);
            case 300: // WhenExpressionThen1
                return new WhenExpressionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.listEl1);
            case 301: // WhenConditionThen2
                return new WhenConditionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.listEl2);
            case 302: // WhenConditionThen1
                return new WhenConditionThen_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.listEl1);
            case 303: // Expression11
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 304: // Expression10
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 305: // Expression19
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 306: // Condition1
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 307: // IntLiteralWrapper4
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 308: // StringLiteralWrapper2
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.string_lit);
            case 309: // RealLiteral2
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 310: // BinaryLiteral2
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 311: // DateLiteral2
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 312: // TimeLiteral2
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 313: // TimeStampLiteral2
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 314: // NullLiteral2
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 315: // IdWrapper15
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 317: // Expression22
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 318: // Expression3
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr);
            case 319: // OptAll1
                return new OptAll_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_all);
            case 320: // Expression4
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr2);
            case 321: // DISTINCT1
                return new DISTINCT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.d);
            case 322: // AggName1
                return new AggName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_name);
            case 323: // COUNT1
                return new COUNT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c);
            case 324: // MIN1
                return new MIN_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.mi);
            case 325: // MAX1
                return new MAX_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ma);
            case 326: // SUM1
                return new SUM_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.su);
            case 327: // AVG1
                return new AVG_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.av);
            case 328: // STDDEV1
                return new STDDEV_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.std);
            case 329: // VAR1
                return new VAR_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.va);
            case 330: // ALL1
                return new ALL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a);
            case 331: // NamedArgumentList1
                return new NamedArgumentList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamedArgumentList);
            case 332: // NamedArgument1
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 333: // NamedArgumentFuncName1
                return new NamedArgumentFuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func_name);
            case 334: // Expression8
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr1);
            case 335: // IdWrapper12
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.proc_param_name);
            case 336: // NamedArgument3
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr_n);
            case 337: // NamedArgument2
                return new NamedArgument_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 338: // ExpressionList1
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 339: // Expression5
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 340: // FuncName1
                return new FuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func_name);
            case 341: // annotationDefintionsWithAnnotation1
                return new annotationDefintionsWithAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defs);
            case 342: // AnnotationDeclaration3
                return new AnnotationDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.definition);
            case 343: // PreAnnotation7
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 344: // annotationTypeSpec1
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 345: // QualifiedDefId6
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 346: // AnnotationTypeArray1
                return new AnnotationTypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeArray);
            case 347: // AnnotationTypeNamedOrEnum2
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 348: // AnnotationTypeTypeOf1
                return new AnnotationTypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeTypeOf);
            case 350: // annotationStructuredType2
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type2);
            case 351: // PathSimple6
                return new PathSimple_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 354: // AnnotationDefaultClause1
                return new AnnotationDefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.def);
            case 355: // annotationEnumClause1
                return new annotationEnumClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumeration);
            case 356: // AnnotationTypeNamed1
                return new AnnotationTypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamed);
            case 357: // Expression25
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 358: // EnumIdWrapper2
                return new EnumIdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumVal);
            case 360: // IntLiteralWrapper9
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.decimals);
            case 361: // IntLiteralWrapper8
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.length);
            case 362: // AnnotationTypeName1
                return new AnnotationTypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 363: // annotationStructuredType1
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type1);
            case 364: // AnnotationTypeNamedOrEnum1
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 365: // AnnotationTypeSpecNoColon1
                return new AnnotationTypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeSpecNoColon);
            case 366: // TypeName2
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 367: // AnnotationLiteral2
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit);
            case 368: // IdWrapper18
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.symbol);
            case 370: // annotationTypeSpec2
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 371: // IdWrapper17
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
        }
        rnd.Utils.assert(0 <= frame_num && frame_num < 372);
        return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
    }; // createFrame0()
    CdsDdlParserResolver.prototype.createFrame = function(frame_num, rule_info) {
        return new rnd.FramePtr(this.createFrame0(frame_num, rule_info)); 
    };
// v-v-v-v-v-v The following can be replaced by contents of @JsResolver::footer{{{ }}}
    return CdsDdlParserResolver; 
} );
// ^-^-^-^-^-^ end of what can be replaced by contents of @JsResolver::footer{{{ }}}
