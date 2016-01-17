// v-v-v-v-v-v @JsResolver::header

/*eslint-disable */
define(
["hanaddl/hanaddlNonUi","rndrt/rnd","commonddl/commonddlNonUi"], //dependencies
function (hanaddlNonUi,rnd,commonddlNonUi) {

var StdFuncExpressionImpl = commonddlNonUi.StdFuncExpressionImpl;
var SelectListImpl = commonddlNonUi.SelectListImpl;
var ExpressionContainerImpl = commonddlNonUi.ExpressionContainerImpl;
var GroupByImpl = commonddlNonUi.GroupByImpl;
var OrderByImpl = commonddlNonUi.OrderByImpl;
var ExpressionImpl = commonddlNonUi.ExpressionImpl;
var AnnotationValueImpl = commonddlNonUi.AnnotationValueImpl;
var PathExpressionImpl = commonddlNonUi.PathExpressionImpl;
var LiteralExpressionImpl = commonddlNonUi.LiteralExpressionImpl;
var Token = rnd.Token;
var OrderByEntryImpl = commonddlNonUi.OrderByEntryImpl;
var ForeignKeyImpl = commonddlNonUi.ForeignKeyImpl;
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
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function UsingDirective_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function TopLevelDeclaration_attributes() {
        this.preAnnotations = null;
    }

    function ContextDeclaration_attributes() {
        this.annots = null;
        this.endIndex = 0;
        this.parentStmts = null;
        this.res = null;
        this.startIndex = 0;
    }

    function ContextComponentDeclaration_attributes() {
        this.context = null;
        this.preAnnotations = null;
    }

    function EntityDeclaration_attributes() {
        this.annots = null;
        this.endIndex = 0;
        this.parentStmts = null;
        this.res = null;
        this.startIndex = 0;
    }

    function AnnotatedElementDeclarationLoop_attributes() {
        this.res = null;
    }

    function ViewDeclaration_attributes() {
        this.annots = null;
        this.endIndex = 0;
        this.parentStmts = null;
        this.res = null;
        this.startIndex = 0;
    }

    function AnnotatedElementDeclaration_attributes() {
        this.parent = null;
        this.preAnnotations = null;
        this.res = null;
    }

    function ElementDeclaration_attributes() {
        this.endIndex = 0;
        this.parent = null;
        this.res = null;
        this.startIndex = 0;
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

    function TypeDeclaration_attributes() {
        this.annots = null;
        this.endIndex = 0;
        this.parentStmts = null;
        this.res = null;
        this.startIndex = 0;
    }

    function StructuredType_attributes() {
        this.res = null;
    }

    function StructuredTypeComponent_attributes() {
        this.res = null;
    }

    function AnnotatedTypeComponentDeclaration_attributes() {
        this.preAnnotations = null;
        this.res = null;
    }

    function TypeComponentDeclaration_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function TypeSpec_attributes() {
        this.def = null;
        this.parent = null;
        this.res = null;
    }

    function TypeTypeOf_attributes() {
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

    function AssociationOnCondition_attributes() {
        this.res = null;
    }

    function TypeAssoc_attributes() {
        this.def = null;
        this.endIndex = 0;
        this.parent = null;
        this.res = null;
        this.startIndex = 0;
    }

    function CdsAlias_attributes() {
        this.res = null;
    }

    function Cardinality_attributes() {
        this.maxStar = null;
        this.res = null;
        this.srcMaxStar = null;
    }

    function NamespacePath_attributes() {
        this.res = null;
    }

    function QualifiedDefId_attributes() {
        this.res = null;
    }

    function QuotedId_attributes() {
        this.res = null;
    }

    function PathName_attributes() {
        this.res = null;
    }

    function IdWrapper_attributes() {
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
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function RecordValue_attributes() {
        this.container = null;
        this.endIndex = 0;
        this.record = null;
        this.startIndex = 0;
    }

    function PreAnnotation_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function RecordComponent_attributes() {
        this.container = null;
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ArrayValue_attributes() {
        this.array = null;
        this.container = null;
        this.endIndex = 0;
        this.startIndex = 0;
    }

    function AnnotationPath_attributes() {
        this.nameValuePair = null;
    }

    function AnnotationId_attributes() {
        this.res = null;
    }

    function AnnotationConstantId_attributes() {
        this.res = null;
    }

    function AnnotationLiteral_attributes() {
        this.res = null;
    }

    function QLSubquery_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
        this.viewDef = null;
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

    function ExprSelectItem_attributes() {
        this.endIndex = 0;
        this.entry = null;
        this.list = null;
        this.preAnnotations = null;
        this.startIndex = 0;
    }

    function FromClause_attributes() {
        this.res = null;
        this.select = null;
    }

    function TablePathList_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function TablePathAlias_attributes() {
        this.res = null;
    }

    function TablePath_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function WhereClause_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.select = null;
        this.startIndex = 0;
    }

    function GroupByClause_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.select = null;
        this.startIndex = 0;
    }

    function HavingClause_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.select = null;
        this.startIndex = 0;
    }

    function OrderByClause_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.select = null;
        this.startIndex = 0;
    }

    function SortSpecList_attributes() {
        this.res = null;
    }

    function SortSpec_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function OptAscDesc_attributes() {
        this.res = null;
    }

    function OptNullsFirstLast_attributes() {
        this.firstLast = null;
        this.nulls = null;
    }

    function Condition_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ConditionAnd_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ConditionTerm_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function PredicateLeftIsExpression_attributes() {
        this.endIndex = 0;
        this.negated = false;
        this.res = null;
        this.startIndex = 0;
    }

    function ComparisonPredicate_attributes() {
        this.comp = null;
        this.left = null;
        this.res = null;
    }

    function RangePredicate_attributes() {
        this.endIndex = 0;
        this.expr1 = null;
        this.negated = false;
        this.res = null;
        this.startIndex = 0;
    }

    function LikePredicate_attributes() {
        this.endIndex = 0;
        this.escapeToken = null;
        this.expr1 = null;
        this.negated = false;
        this.res = null;
        this.startIndex = 0;
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
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ExprConcat_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ExprSum_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function ExprFactor_attributes() {
        this.res = null;
    }

    function ExprTerm_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function Literal_attributes() {
        this.res = null;
    }

    function ExprAlias_attributes() {
        this.alias = null;
        this.res = null;
    }

    function Agg_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function AggName_attributes() {
        this.res = null;
    }

    function OptAll_attributes() {
        this.res = null;
    }

    function Func_attributes() {
        this.endIndex = 0;
        this.res = null;
        this.startIndex = 0;
    }

    function FuncName_attributes() {
        this.res = null;
    }

    function annotationDefintionsWithAnnotation_attributes() {
        this.preAnnotations = null;
    }

    function annotationDefinition_attributes() {
        this.anno = null;
    }

    function annotationTypeSpec_attributes() {
        this.element = null;
    }

    function AnnotationTypeNamedOrEnum_attributes() {
        this.element = null;
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
        this.path = new NamespacePath_attributes();
    }

    function UsingDirectiveList_locals() {
        this.directive_1 = new UsingDirective_attributes();
        this.directive_n = new UsingDirective_attributes();
    }

    function UsingDirective_locals() {
        this.alias = new CdsAlias_attributes();
        this.path = new PathName_attributes();
    }

    function TopLevelDeclaration_locals() {
        this.annotation = new PreAnnotation_attributes();
        this.c_decl = new ContextDeclaration_attributes();
        this.e_decl = new EntityDeclaration_attributes();
        this.t_decl = new TypeDeclaration_attributes();
        this.v_decl = new ViewDeclaration_attributes();
    }

    function ContextDeclaration_locals() {
        this.ContextComponentDeclaration = new ContextComponentDeclaration_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function ContextComponentDeclaration_locals() {
        this.annotation = new PreAnnotation_attributes();
        this.c_decl = new ContextDeclaration_attributes();
        this.e_decl = new EntityDeclaration_attributes();
        this.stmts = null;
        this.t_decl = new TypeDeclaration_attributes();
        this.v_decl = new ViewDeclaration_attributes();
    }

    function EntityDeclaration_locals() {
        this.AnnotatedElementDeclarationLoop = new AnnotatedElementDeclarationLoop_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function AnnotatedElementDeclarationLoop_locals() {
        this.elem_decl = new AnnotatedElementDeclaration_attributes();
    }

    function ViewDeclaration_locals() {
        this.QLSubquery = new QLSubquery_attributes();
        this.id = new QualifiedDefId_attributes();
    }

    function AnnotatedElementDeclaration_locals() {
        this.annot = new PreAnnotation_attributes();
        this.elemDecl = new ElementDeclaration_attributes();
    }

    function ElementDeclaration_locals() {
        this.DefaultClause = new DefaultClause_attributes();
        this.Nullability = new Nullability_attributes();
        this.element = new ELEMENT_attributes();
        this.id = new DefId_attributes();
        this.modifiers = new ElementModifier_attributes();
        this.type = new TypeSpec_attributes();
    }

    function Nullability_locals() {
        this.no = new NOT_attributes();
        this.nu = new NULL_attributes();
    }

    function DefaultClause_locals() {
        this.expr = new Expression_attributes();
    }

    function ElementModifier_locals() {
        this.key = new KEY_attributes();
    }

    function TypeDeclaration_locals() {
        this.StructuredType = new StructuredType_attributes();
        this.id = new QualifiedDefId_attributes();
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
        this.element = new ELEMENT_attributes();
        this.id = new DefId_attributes();
        this.typespec = new TypeSpec_attributes();
    }

    function TypeSpec_locals() {
        this.startIndex = 0;
        this.tto = new TypeTypeOf_attributes();
        this.typeassoc = new TypeAssoc_attributes();
        this.typename = new TypeNamed_attributes();
    }

    function TypeTypeOf_locals() {
        this.id = new PathName_attributes();
    }

    function TypeNamed_locals() {
        this.id = new TypeName_attributes();
        this.p1 = new IntLiteralWrapper_attributes();
        this.p2 = new IntLiteralWrapper_attributes();
    }

    function TypeName_locals() {
        this.id = new PathName_attributes();
    }

    function AssociationForeignKeys_locals() {
        this.r = new AssociationForeignKeyElement_attributes();
    }

    function AssociationForeignKeyElement_locals() {
        this.alias1 = new CdsAlias_attributes();
        this.aliasn = new CdsAlias_attributes();
        this.k1 = new PathName_attributes();
        this.kn = new PathName_attributes();
    }

    function AssociationOnCondition_locals() {
        this.cond = new Condition_attributes();
    }

    function TypeAssoc_locals() {
        this.AssociationForeignKeys = new AssociationForeignKeys_attributes();
        this.AssociationOnCondition = new AssociationOnCondition_attributes();
        this.Cardinality = new Cardinality_attributes();
        this.endTargetIndex = 0;
        this.startTargetIndex = 0;
        this.target = new PathName_attributes();
    }

    function CdsAlias_locals() {
        this.alias = new IdWrapper_attributes();
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

    function PathName_locals() {
        this.base1 = new IdWrapper_attributes();
        this.base2 = new IdWrapper_attributes();
        this.first = new IdWrapper_attributes();
        this.med2 = new IdWrapper_attributes();
        this.tail1 = new IdWrapper_attributes();
        this.tail2 = new IdWrapper_attributes();
    }

    function IdWrapper_locals() {
        this.idq = new QuotedId_attributes();
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
        this.const_val = new AnnotationConstantId_attributes();
        this.lit_val = new AnnotationLiteral_attributes();
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
        this.int_val = new IntLiteralWrapper_attributes();
        this.str_val = new StringLiteralWrapper_attributes();
    }

    function QLSubquery_locals() {
        this.from = new FromClause_attributes();
        this.group = new GroupByClause_attributes();
        this.having = new HavingClause_attributes();
        this.order = new OrderByClause_attributes();
        this.select = new QLSelectClause_attributes();
        this.where = new WhereClause_attributes();
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
        this.p1 = new QLPathListSelectItem_attributes();
        this.p2 = new ExprSelectItem_attributes();
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
        this.startIndex = 0;
    }

    function ExprSelectItem_locals() {
        this.alias = new ExprAlias_attributes();
    }

    function FromClause_locals() {
        this.l = new TablePathList_attributes();
    }

    function TablePathList_locals() {
        this.tab_path_1 = new TablePath_attributes();
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
        this.spec1 = new SortSpec_attributes();
        this.specN = new SortSpec_attributes();
    }

    function SortSpec_locals() {
        this.expr = new Expression_attributes();
        this.nfl = new OptNullsFirstLast_attributes();
        this.order = new OptAscDesc_attributes();
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
        this.predLeftIsExpr = new PredicateLeftIsExpression_attributes();
    }

    function PredicateLeftIsExpression_locals() {
        this.NOT = new NOT_attributes();
        this.comp = new ComparisonPredicate_attributes();
        this.in = new InPredicate_attributes();
        this.left = new Expression_attributes();
        this.like = new LikePredicate_attributes();
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
        this.expr2 = new Expression_attributes();
        this.expr3 = new Expression_attributes();
        this.l = new LIKE_attributes();
    }

    function NullPredicate_locals() {
        this.NOT = new NOT_attributes();
        this.NULL = new NULL_attributes();
    }

    function InPredicate_locals() {
        this.list = new ExpressionList_attributes();
    }

    function ExpressionList_locals() {
        this.expr = new Expression_attributes();
        this.expr_n = new Expression_attributes();
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
        this.col = new QLPath_attributes();
        this.exprTerm1 = new ExprTerm_attributes();
        this.exprTerm2 = new ExprTerm_attributes();
        this.exprTerm3 = new Expression_attributes();
        this.func = new Func_attributes();
        this.literal = new Literal_attributes();
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

    function Func_locals() {
        this.expr = new Expression_attributes();
        this.func_name = new FuncName_attributes();
        this.list = new ExpressionList_attributes();
    }

    function annotationDefintions_locals() {
        this.defs = new annotationDefintionsWithAnnotation_attributes();
    }

    function annotationDefintionsWithAnnotation_locals() {
        this.annotation = new PreAnnotation_attributes();
        this.definition = new annotationDefinition_attributes();
    }

    function annotationDefinition_locals() {
        this.name = new IdWrapper_attributes();
        this.type = new annotationTypeSpec_attributes();
    }

    function annotationTypeSpec_locals() {
        this.AnnotationTypeArray = new AnnotationTypeArray_attributes();
        this.AnnotationTypeNamedOrEnum = new AnnotationTypeNamedOrEnum_attributes();
        this.type2 = new annotationStructuredType_attributes();
    }

    function AnnotationTypeNamedOrEnum_locals() {
        this.AnnotationTypeNamed = new AnnotationTypeNamed_attributes();
        this.def = new DefaultClause_attributes();
        this.enumeration = new annotationEnumClause_attributes();
    }

    function AnnotationTypeNamed_locals() {
        this.decimals = new IntLiteralWrapper_attributes();
        this.length = new IntLiteralWrapper_attributes();
        this.typeName = new IdWrapper_attributes();
    }

    function AnnotationTypeSpecNoColon_locals() {
        this.AnnotationTypeNamedOrEnum = new AnnotationTypeNamedOrEnum_attributes();
        this.type1 = new annotationStructuredType_attributes();
    }

    function AnnotationTypeArray_locals() {
        this.AnnotationTypeSpecNoColon = new AnnotationTypeSpecNoColon_attributes();
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
            case 0: {
  RESOLVER.initializeParser();
  } // grammar line 114
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
            case 0: { this.m_locals.TopLevelDeclaration.preAnnotations = null; } // grammar line 135
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
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = null; } // grammar line 148
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.cdecl,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 168
            break;
            case 1: {
  this.m_result.cdecl = RESOLVER.createNamespace(this.m_locals.path.res);
  RESOLVER.setRootNamespace(this.m_result.cdecl);
  } // grammar line 163
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 157
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 158
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
RESOLVER.compilationUnit.getStatements().push(this.m_locals.directive_n.res);
} // grammar line 182
            break;
            case 1: {
  RESOLVER.compilationUnit.getStatements().push(this.m_locals.directive_1.res);
  } // grammar line 177
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 198
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 188
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 189
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
            case 0: { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 224
            break;
            case 1: { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 228
            break;
            case 2: { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 232
            break;
            case 3: { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 236
            break;
            case 4: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 218
            break;
            case 5: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 213
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 267
            break;
            case 1: { this.m_locals.ContextComponentDeclaration.preAnnotations = null; this.m_locals.ContextComponentDeclaration.context = this.m_result.res; } // grammar line 263
            break;
            case 2: {
     this.m_result.res = RESOLVER.createContext(this.m_locals.id.res);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     } // grammar line 252
            break;
            case 3: {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 246
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
} // grammar line 294
            { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = this.m_locals.stmts; } // grammar line 299
            break;
            case 3: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 303
            { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = this.m_locals.stmts; } // grammar line 308
            break;
            case 5: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 312
            { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = this.m_locals.stmts; } // grammar line 317
            break;
            case 7: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 321
            { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = this.m_locals.stmts; } // grammar line 326
            break;
            case 8: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 288
            break;
            case 10: {
  this.m_locals.stmts = null;
 } // grammar line 277
            {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 282
            break;
        }
    }; // ContextComponentDeclaration_action.performAction()

    function EntityDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new EntityDeclaration_locals(), BP, rule_info);
    }
    EntityDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    EntityDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 357
            break;
            case 2: {
     this.m_result.res = RESOLVER.createEntity(this.m_locals.id.res);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     } // grammar line 346
            { this.m_locals.AnnotatedElementDeclarationLoop.res = this.m_result.res; } // grammar line 354
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 334
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 338
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
            case 0: { this.m_locals.elem_decl.parent = this.m_result.res; } // grammar line 367
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 415
            break;
            case 1: { this.m_locals.QLSubquery.viewDef = this.m_result.res; } // grammar line 394
            break;
            case 2: {
  this.m_result.res = RESOLVER.viewparser_startDefineView();
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  this.m_result.res.setNamePath(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  } // grammar line 382
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 372
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 375
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
            case 0: {
  this.m_result.res = this.m_locals.elemDecl.res;
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.preAnnotations);
  } // grammar line 434
            break;
            case 1: { this.m_locals.elemDecl.parent = this.m_result.parent; } // grammar line 433
            break;
            case 2: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annot.res);
} // grammar line 429
            break;
            case 3: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 424
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 457
            break;
            case 1: { this.m_locals.Nullability.res = this.m_result.res; } // grammar line 453
            break;
            case 2: { this.m_locals.DefaultClause.res = this.m_result.res; } // grammar line 454
            break;
            case 3: {
  this.m_result.res = this.m_locals.type.res;
  RESOLVER.initializeElement(this.m_result.res,this.m_locals.id.res,this.m_locals.modifiers.keyToken,null,this.m_locals.element.name,null);
  } // grammar line 448
            break;
            case 4: { this.m_locals.type.parent = this.m_result.parent; this.m_locals.type.def = this.m_locals.id.res; } // grammar line 447
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 440
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 441
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
} // grammar line 473
            break;
            case 1: {
RESOLVER.setNotToken(this.m_result.res,this.m_locals.no.name);
} // grammar line 468
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
} // grammar line 482
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
} // grammar line 492
            break;
        }
    }; // ElementModifier_action.performAction()

    function TypeDeclaration_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeDeclaration_locals(), BP, rule_info);
    }
    TypeDeclaration_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeDeclaration_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 525
            break;
            case 1: { this.m_locals.StructuredType.res = this.m_result.res; } // grammar line 515
            break;
            case 2: {
if (this.m_locals.typespec.res != null) {
this.m_result.res.getElements().push(this.m_locals.typespec.res);
}
} // grammar line 518
            break;
            case 3: { this.m_locals.typespec.parent = null; this.m_locals.typespec.def = null; } // grammar line 517
            break;
            case 4: {
  this.m_result.res = RESOLVER.createType(this.m_locals.id.res);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  } // grammar line 506
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 498
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 501
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
            case 0: { this.m_locals.StructuredTypeComponent.res = this.m_result.res; } // grammar line 536
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
RESOLVER.addTypeElement(this.m_result.res,this.m_locals.typecomponent.res);
} // grammar line 543
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
  } // grammar line 562
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annot.res);
} // grammar line 557
            break;
            case 2: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 552
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 580
            break;
            case 1: {
  this.m_result.res = this.m_locals.typespec.res;
  RESOLVER.initializeTypeComponent(this.m_result.res,this.m_locals.id.res,this.m_locals.element.name);
  } // grammar line 575
            break;
            case 2: { this.m_locals.typespec.parent = null; this.m_locals.typespec.def = null; } // grammar line 574
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 568
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 569
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
} // grammar line 603
            break;
            case 1: { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.def = this.m_result.def; } // grammar line 602
            break;
            case 2: {
this.m_result.res = this.m_locals.typename.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 609
            break;
            case 3: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.def = this.m_result.def; } // grammar line 608
            break;
            case 4: {
this.m_result.res = this.m_locals.typeassoc.res;
} // grammar line 621
            break;
            case 5: { this.m_locals.typeassoc.parent = this.m_result.parent; this.m_locals.typeassoc.def = this.m_result.def; } // grammar line 620
            break;
            case 6: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 597
            break;
            case 7: {

 } // grammar line 592
            break;
        }
    }; // TypeSpec_action.performAction()

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
  } // grammar line 665
            break;
        }
    }; // TypeTypeOf_action.performAction()

    function TypeNamed_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new TypeNamed_locals(), BP, rule_info);
    }
    TypeNamed_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    TypeNamed_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res.setDecimalsToken(this.m_locals.p2.res);
} // grammar line 699
            break;
            case 1: {
this.m_result.res.setLengthToken(this.m_locals.p1.res);
} // grammar line 693
            break;
            case 2: {
  this.m_result.res = RESOLVER.createAttribute(this.m_locals.id.res);
  if (this.m_result.def != null) {
  this.m_result.res.setNameToken(this.m_result.def);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.getElements().push(this.m_result.res);
  }
  } // grammar line 681
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
     } // grammar line 709
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
    } // grammar line 717
            break;
            case 1: { this.m_locals.r.res = this.m_result.res; } // grammar line 716
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 714
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
var fk = RESOLVER.addKey(this.m_result.res, this.m_locals.kn.res, this.m_locals.aliasn.res);
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(fk,this.m_result.startIndex,this.m_result.endIndex);
} // grammar line 741
            break;
            case 1: {
this.m_result.startIndex = RESOLVER.getNextTokenIndex();
} // grammar line 737
            break;
            case 2: {
 var fk = RESOLVER.addKey(this.m_result.res, this.m_locals.k1.res, this.m_locals.alias1.res);
 this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
 RESOLVER.viewparser_setStartEndTokenIndex(fk,this.m_result.startIndex,this.m_result.endIndex);
 } // grammar line 730
            break;
            case 3: {
    this.m_result.startIndex = RESOLVER.getNextTokenIndex();
    } // grammar line 726
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 724
            break;
        }
    }; // AssociationForeignKeyElement_action.performAction()

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
  } // grammar line 753
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
            case 0: { this.m_locals.AssociationForeignKeys.res = this.m_result.res; } // grammar line 791
            break;
            case 1: { this.m_locals.AssociationOnCondition.res = this.m_result.res; } // grammar line 812
            break;
            case 2: {
  this.m_locals.endTargetIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.target.res,this.m_locals.startTargetIndex,this.m_locals.endTargetIndex);
  this.m_result.res.setTargetEntityPath(this.m_locals.target.res);
  } // grammar line 784
            break;
            case 3: {
  this.m_locals.startTargetIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 780
            break;
            case 4: { this.m_locals.Cardinality.res = this.m_result.res; } // grammar line 778
            break;
            case 5: {
  this.m_result.res = RESOLVER.createAssociation();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,-1,-1);
  if (this.m_result.def != null) {
  this.m_result.res.setNameToken(this.m_result.def);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.getElements().push(this.m_result.res);
  }
  } // grammar line 768
            break;
            case 7: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 761
            {


 } // grammar line 762
            break;
        }
    }; // TypeAssoc_action.performAction()

    function CdsAlias_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new CdsAlias_locals(), BP, rule_info);
    }
    CdsAlias_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    CdsAlias_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.res = this.m_locals.alias.res;
  } // grammar line 821
            break;
        }
    }; // CdsAlias_action.performAction()

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
} // grammar line 860
            break;
            case 1: {
this.m_result.maxStar = rnd.Parser.getTok(RESOLVER, this, _star_index);
} // grammar line 856
            break;
            case 2: {
this.m_result.srcMaxStar = rnd.Parser.getTok(RESOLVER, this, _srcStar_index);
} // grammar line 841
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
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_n.res));
}
} // grammar line 880
            break;
            case 1: {
  this.m_result.res = RESOLVER.createPathDeclaration();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 873
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
} // grammar line 911
            break;
            case 1: {
if (this.m_locals.id_n.res != null) {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_n.res));
}
} // grammar line 901
            break;
            case 2: {
  this.m_result.res = RESOLVER.createPathDeclaration();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 890
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
  } // grammar line 933
            break;
        }
    }; // QuotedId_action.performAction()

    function PathName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new PathName_locals(), BP, rule_info);
    }
    PathName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    PathName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.tail1.res));
} // grammar line 960
            break;
            case 1: {
RESOLVER.markLastNamespacePathEntry(this.m_result.res);
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.base1.res));
} // grammar line 953
            break;
            case 2: {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.tail2.res));
} // grammar line 984
            break;
            case 3: {
RESOLVER.markLastNamespacePathEntry(this.m_result.res);
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.base2.res));
} // grammar line 977
            break;
            case 4: {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.med2.res));
} // grammar line 971
            break;
            case 5: {
  this.m_result.res = RESOLVER.createPathExpression();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.first.res));
  } // grammar line 946
            break;
        }
    }; // PathName_action.performAction()

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
 } // grammar line 997
            break;
            case 1: {
this.m_result.res = this.m_locals.idq.res;
} // grammar line 1004
            break;
        }
    }; // IdWrapper_action.performAction()

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
  } // grammar line 1012
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
  } // grammar line 1019
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
  } // grammar line 1026
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
  } // grammar line 1033
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
  } // grammar line 1040
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
  } // grammar line 1047
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
  } // grammar line 1054
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
  } // grammar line 1061
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
  } // grammar line 1072
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
var av = RESOLVER.addAnnotationValue(this.m_result.container, this.m_locals.const_val.res);
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(av,this.m_result.startIndex,this.m_result.endIndex);
} // grammar line 1097
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1093
            break;
            case 2: {
var av = RESOLVER.addAnnotationValue(this.m_result.container, this.m_locals.lit_val.res);
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(av,this.m_result.startIndex,this.m_result.endIndex);
} // grammar line 1109
            break;
            case 3: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1105
            break;
            case 4: { this.m_locals.RecordValue.container = this.m_result.container; } // grammar line 1117
            break;
            case 5: { this.m_locals.ArrayValue.container = this.m_result.container; } // grammar line 1121
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1084
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.record,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1144
            break;
            case 1: { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1141
            break;
            case 3: {
  this.m_result.record = RESOLVER.createAnnotationRecordValue();
  RESOLVER.addAnnotationRecordValue(this.m_result.container,this.m_result.record);
  } // grammar line 1134
            { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1138
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1126
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1130
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1166
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1164
            break;
            case 3: {
     this.m_result.res = RESOLVER.createPreAnnotation();
     } // grammar line 1157
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1161
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1150
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1153
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1189
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1187
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1172
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1176
            {
     this.m_result.res = RESOLVER.createAnnotationNameValuePair();
     RESOLVER.addAnnotationNameValuePair(this.m_result.container,this.m_result.res);
     } // grammar line 1179
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1184
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.array,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1217
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1212
            break;
            case 2: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1209
            break;
            case 3: {
  this.m_result.array = RESOLVER.createAnnotationArrayValue();
  RESOLVER.addAnnotationArrayValue(this.m_result.container,this.m_result.array);
  } // grammar line 1204
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1196
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1200
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
 } // grammar line 1236
            break;
            case 1: {
RESOLVER.addAnnotationPath(this.m_result.nameValuePair,rnd.Parser.getTok(RESOLVER, this, _dot_index));
} // grammar line 1232
            break;
            case 2: {
  RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_1.res);
  } // grammar line 1227
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
  } // grammar line 1249
            break;
        }
    }; // AnnotationId_action.performAction()

    function AnnotationConstantId_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    AnnotationConstantId_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationConstantId_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        var _id_index = 1;
        switch (_action_num) {
            case 0: {
  this.m_result.res = rnd.Parser.getTok(RESOLVER, this, _id_index);
  } // grammar line 1262
            break;
        }
    }; // AnnotationConstantId_action.performAction()

    function AnnotationLiteral_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationLiteral_locals(), BP, rule_info);
    }
    AnnotationLiteral_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationLiteral_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = this.m_locals.str_val.res;
} // grammar line 1270
            break;
            case 1: {
this.m_result.res = this.m_locals.int_val.res;
} // grammar line 1278
            break;
        }
    }; // AnnotationLiteral_action.performAction()

    function QLSubquery_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new QLSubquery_locals(), BP, rule_info);
    }
    QLSubquery_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    QLSubquery_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1321
            break;
            case 1: { this.m_locals.order.select = this.m_result.res; } // grammar line 1319
            break;
            case 2: { this.m_locals.having.select = this.m_result.res; } // grammar line 1318
            break;
            case 3: { this.m_locals.group.select = this.m_result.res; } // grammar line 1317
            break;
            case 4: { this.m_locals.where.select = this.m_result.res; } // grammar line 1316
            break;
            case 5: { this.m_locals.select.select = this.m_result.res; this.m_locals.select.list = null; } // grammar line 1315
            break;
            case 7: {
  this.m_result.res = RESOLVER.viewparser_startSelect();
  this.m_result.viewDef.setSelect(this.m_result.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  } // grammar line 1309
            { this.m_locals.from.select = this.m_result.res; } // grammar line 1314
            break;
            case 9: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1304
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1305
            break;
        }
    }; // QLSubquery_action.performAction()

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
     } // grammar line 1346
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1328
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1333
            {
     if (this.m_result.list != null) {
     this.m_result.res = this.m_result.list;
     }else{
     this.m_result.res = RESOLVER.viewparser_startSelectList0();
     RESOLVER.viewparser_selectlist(this.m_result.select,this.m_result.res);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
     }
     } // grammar line 1336
            { this.m_locals.QLSelectList.list = this.m_result.res; } // grammar line 1345
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
            case 0: { this.m_locals.p2.list = this.m_result.list; } // grammar line 1358
            break;
            case 1: { this.m_locals.AnnotatedQLSelectItem.list = this.m_result.list; } // grammar line 1356
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
            case 0: { this.m_locals.QLSelectItem.preAnnotations = this.m_result.preAnnotations; this.m_locals.QLSelectItem.list = this.m_result.list; } // grammar line 1378
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 1373
            break;
            case 2: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 1368
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
 } // grammar line 1384
            break;
            case 1: { this.m_locals.p1.preAnnotations = this.m_result.preAnnotations; this.m_locals.p1.list = this.m_result.list; } // grammar line 1383
            break;
            case 2: {
 this.m_result.res = this.m_locals.p2.entry;
 } // grammar line 1389
            break;
            case 3: { this.m_locals.p2.preAnnotations = this.m_result.preAnnotations; this.m_locals.p2.list = this.m_result.list; } // grammar line 1388
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
} // grammar line 1403
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
     } // grammar line 1461
            break;
            case 1: { this.m_locals.p2.select = null; this.m_locals.p2.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 1441
            break;
            case 2: {
  var nestedList = IAstFactory.eINSTANCE.createSelectList();
  this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
  this.m_locals.nestedEntry.setSelectList(nestedList);
  this.m_locals.pathExp.res.getPathEntries().push(this.m_locals.nestedEntry);
  } // grammar line 1435
            break;
            case 3: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 1433
            break;
            case 5: {
   this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
   RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.pathExp.res,this.m_locals.startIndex,this.m_locals.endIndex);
   } // grammar line 1424
            {
   this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.pathExp.res);
   RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
   RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
   } // grammar line 1428
            break;
            case 6: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 1457
            break;
            case 7: { this.m_locals.p3.select = null; this.m_locals.p3.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 1456
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
   } // grammar line 1446
            break;
            case 10: {
  this.m_locals.nestedEntry = null;
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1412
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1418
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
     } // grammar line 1486
            break;
            case 1: {
    RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id2.res));
    } // grammar line 1482
            break;
            case 2: {
     this.m_result.res = RESOLVER.createPathExpression();
     RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id1.res));
     } // grammar line 1477
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1468
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1473
            break;
        }
    }; // QLPath_action.performAction()

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
  } // grammar line 1497
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1504
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1492
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1493
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
  this.m_result.res = this.m_locals.l.res;
  this.m_result.select.setFrom(this.m_result.res);
  } // grammar line 1513
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
  } // grammar line 1524
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1542
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1519
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1520
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
} // grammar line 1552
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
  } // grammar line 1566
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1573
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1558
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1559
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  }
  } // grammar line 1591
            break;
            case 1: {
this.m_result.res = RESOLVER.createExpressionContainer(this.m_locals.cond.res);
this.m_result.select.setWhere(this.m_result.res);
} // grammar line 1586
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1579
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1580
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
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(groupBy,this.m_result.startIndex,this.m_result.endIndex);
this.m_result.select.setGroupBy(groupBy);
} // grammar line 1609
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1600
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1602
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
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(cont,this.m_result.startIndex,this.m_result.endIndex);
this.m_result.select.setHaving(cont);
} // grammar line 1626
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1621
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1619
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
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(orderBy,this.m_result.startIndex,this.m_result.endIndex);
this.m_result.select.setOrderBy(orderBy);
} // grammar line 1642
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1637
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1635
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
} // grammar line 1659
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.spec1.res);
  } // grammar line 1653
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
  } // grammar line 1672
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1679
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1665
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1666
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
  } // grammar line 1689
            break;
            case 1: {
  this.m_result.res = this.m_locals.des.name;
  } // grammar line 1694
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
} // grammar line 1706
            break;
            case 1: {
this.m_result.nulls = this.m_locals.n.name;
this.m_result.firstLast = this.m_locals.l.name;
} // grammar line 1712
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1738
            break;
            case 1: {
if (this.m_result.res == null) {
this.m_result.res = RESOLVER.viewparser_orExpression(this.m_locals.condAnd.res,this.m_locals.right.res);
}else this.m_result.res = RESOLVER.viewparser_orExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 1731
            break;
            case 2: {
  this.m_result.res = this.m_locals.condAnd.res;
  } // grammar line 1725
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1720
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1721
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1760
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_andExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 1755
            break;
            case 2: {
  this.m_result.res = this.m_locals.condTerm.res;
  } // grammar line 1749
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1744
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1745
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1796
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.cond1.res);
} // grammar line 1774
            break;
            case 2: {
this.m_result.res = this.m_locals.cond2.res;
} // grammar line 1782
            break;
            case 3: {
this.m_result.res = this.m_locals.predLeftIsExpr.res;
} // grammar line 1790
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1766
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1767
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1864
            break;
            case 1: {
this.m_result.res = this.m_locals.comp.res;
} // grammar line 1811
            break;
            case 2: { this.m_locals.comp.left = this.m_locals.left.res; } // grammar line 1810
            break;
            case 3: {
this.m_result.res = this.m_locals.nullPred.res;
} // grammar line 1818
            break;
            case 4: { this.m_locals.nullPred.expr = this.m_locals.left.res; } // grammar line 1817
            break;
            case 5: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.range.res);
}else{
this.m_result.res = this.m_locals.range.res;
}
} // grammar line 1830
            break;
            case 6: { this.m_locals.range.expr1 = this.m_locals.left.res; this.m_locals.range.negated = this.m_result.negated; } // grammar line 1829
            break;
            case 7: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.like.res);
}else{
this.m_result.res = this.m_locals.like.res;
}
} // grammar line 1841
            break;
            case 8: { this.m_locals.like.expr1 = this.m_locals.left.res; this.m_locals.like.negated = this.m_result.negated; } // grammar line 1840
            break;
            case 9: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.in.res);
}else{
this.m_result.res = this.m_locals.in.res;
}
} // grammar line 1852
            break;
            case 10: { this.m_locals.in.left = this.m_locals.left.res; this.m_locals.in.negated = this.m_result.negated; } // grammar line 1851
            break;
            case 11: {
this.m_result.negated = true;
} // grammar line 1824
            break;
            case 13: { this.m_result.endIndex = 0; this.m_result.negated = false; this.m_result.startIndex = 0; } // grammar line 1802
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1804
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
  } // grammar line 1903
            break;
            case 1: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _eq_index);
} // grammar line 1873
            break;
            case 2: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _gs_index);
} // grammar line 1878
            break;
            case 3: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _b_index);
} // grammar line 1883
            break;
            case 4: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _be_index);
} // grammar line 1888
            break;
            case 5: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _s_index);
} // grammar line 1893
            break;
            case 6: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _se_index);
} // grammar line 1898
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
  } // grammar line 1916
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1920
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1908
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1909
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
  } // grammar line 1939
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1943
            break;
            case 2: {
this.m_result.escapeToken = (this.m_locals.expr3.res).getTokenToken();
} // grammar line 1935
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1926
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1927
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
  } // grammar line 1958
            break;
            case 1: {
this.m_result.isNull = true;
} // grammar line 1953
            break;
            case 2: { this.m_result.isNull = false; } // grammar line 1949
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
  } // grammar line 1969
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
} // grammar line 1983
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.expr.res);
  } // grammar line 1976
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
  } // grammar line 1996
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2000
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1990
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1992
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2021
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprSum2.res,rnd.Parser.getTok(RESOLVER, this, _op_index));
} // grammar line 2016
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprSum1.res;
  } // grammar line 2011
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2006
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2007
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2051
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor2.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 2038
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor3.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 2045
            break;
            case 3: {
  this.m_result.res = this.m_locals.exprFactor1.res;
  } // grammar line 2032
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2027
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2028
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
} // grammar line 2065
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm3.res,rnd.Parser.getTok(RESOLVER, this, _opDiv_index));
} // grammar line 2072
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprTerm1.res;
  } // grammar line 2059
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2134
            break;
            case 1: {
this.m_result.res = this.m_locals.col.res;
} // grammar line 2087
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm1.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 2094
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm2.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 2101
            break;
            case 4: {
this.m_result.res = this.m_locals.exprTerm3.res;
} // grammar line 2108
            break;
            case 5: {
this.m_result.res = RESOLVER.viewparser_iliteral(this.m_locals.literal.res);
} // grammar line 2115
            break;
            case 6: {
this.m_result.res = this.m_locals.agg.res;
} // grammar line 2122
            break;
            case 7: {
this.m_result.res = this.m_locals.func.res;
} // grammar line 2129
            break;
            case 9: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2080
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2081
            break;
        }
    }; // ExprTerm_action.performAction()

    function Literal_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Literal_locals(), BP, rule_info);
    }
    Literal_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Literal_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
this.m_result.res = this.m_locals.int_val.res;
} // grammar line 2143
            break;
            case 1: {
this.m_result.res = this.m_locals.string_lit.res;
} // grammar line 2150
            break;
            case 2: {
this.m_result.res = this.m_locals.real_lit.res;
} // grammar line 2157
            break;
            case 3: {
this.m_result.res = this.m_locals.binary_lit.res;
} // grammar line 2164
            break;
            case 4: {
this.m_result.res = this.m_locals.date_lit.res;
} // grammar line 2171
            break;
            case 5: {
this.m_result.res = this.m_locals.time_lit.res;
} // grammar line 2178
            break;
            case 6: {
this.m_result.res = this.m_locals.timestamp_lit.res;
} // grammar line 2185
            break;
            case 7: {
this.m_result.res = this.m_locals.null_lit.res;
} // grammar line 2193
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
} // grammar line 2208
            break;
            case 1: {
  this.m_result.res = this.m_locals.expr.res;
  } // grammar line 2202
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2249
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,RESOLVER.viewparser_iliteral(rnd.Parser.getTok(RESOLVER, this, _st_index)));
} // grammar line 2225
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr.res);
(this.m_result.res).setAllToken(this.m_locals.agg_all.res);
} // grammar line 2233
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr2.res);
(this.m_result.res).setDistinctToken(this.m_locals.d.name);
} // grammar line 2242
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2216
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2218
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
} // grammar line 2256
            break;
            case 1: {
this.m_result.res = this.m_locals.mi.name;
} // grammar line 2259
            break;
            case 2: {
this.m_result.res = this.m_locals.ma.name;
} // grammar line 2262
            break;
            case 3: {
this.m_result.res = this.m_locals.su.name;
} // grammar line 2265
            break;
            case 4: {
this.m_result.res = this.m_locals.av.name;
} // grammar line 2268
            break;
            case 5: {
this.m_result.res = this.m_locals.std.name;
} // grammar line 2271
            break;
            case 6: {
this.m_result.res = this.m_locals.va.name;
} // grammar line 2274
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
} // grammar line 2280
            break;
            case 1: {
this.m_result.res = this.m_locals.a.name;
} // grammar line 2283
            break;
        }
    }; // OptAll_action.performAction()

    function Func_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new Func_locals(), BP, rule_info);
    }
    Func_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    Func_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2313
            break;
            case 1: {
for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
var ex = this.m_locals.list.res[exCount];
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,ex);
}
} // grammar line 2304
            break;
            case 2: {
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);
} // grammar line 2299
            break;
            case 3: {
  this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.func_name.res);
  } // grammar line 2294
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2289
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2290
            break;
        }
    }; // Func_action.performAction()

    function FuncName_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new rnd.NullFrame(), BP, rule_info);
    }
    FuncName_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    FuncName_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
      this.m_result.res = rnd.Parser.getTokenAt(RESOLVER, this, this.getFirstTokenIndex());
      } // grammar line 2435
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
            case 0: { this.m_locals.defs.preAnnotations = null; } // grammar line 2460
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
   } // grammar line 2480
            break;
            case 1: {
   RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
   } // grammar line 2475
            break;
            case 2: {
    this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
    } // grammar line 2470
            break;
            case 3: {
     RESOLVER.compilationUnit = IAstFactory.eINSTANCE.createCompilationUnit();
     } // grammar line 2466
            break;
        }
    }; // annotationDefintionsWithAnnotation_action.performAction()

    function annotationDefinition_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationDefinition_locals(), BP, rule_info);
    }
    annotationDefinition_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationDefinition_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 1: {
     this.m_result.anno = RESOLVER.createAnnotationDeclaration(this.m_locals.name.res);
     RESOLVER.viewparser_setDDLStmt(this.m_result.anno);
     } // grammar line 2493
            { this.m_locals.type.element = this.m_result.anno; } // grammar line 2497
            break;
        }
    }; // annotationDefinition_action.performAction()

    function annotationTypeSpec_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationTypeSpec_locals(), BP, rule_info);
    }
    annotationTypeSpec_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationTypeSpec_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.AnnotationTypeArray.element = this.m_result.element; } // grammar line 2536
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 2538
            break;
            case 2: { this.m_locals.type2.element = this.m_result.element; this.m_locals.type2.type = null; } // grammar line 2543
            break;
        }
    }; // annotationTypeSpec_action.performAction()

    function AnnotationTypeNamedOrEnum_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeNamedOrEnum_locals(), BP, rule_info);
    }
    AnnotationTypeNamedOrEnum_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeNamedOrEnum_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: { this.m_locals.def.res = this.m_result.element; } // grammar line 2556
            break;
            case 1: { this.m_locals.enumeration.element = this.m_result.element; this.m_locals.enumeration.val = null; } // grammar line 2553
            break;
            case 2: { this.m_locals.AnnotationTypeNamed.element = this.m_result.element; } // grammar line 2551
            break;
        }
    }; // AnnotationTypeNamedOrEnum_action.performAction()

    function AnnotationTypeNamed_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new AnnotationTypeNamed_locals(), BP, rule_info);
    }
    AnnotationTypeNamed_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    AnnotationTypeNamed_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
   RESOLVER.setDecimals(this.m_result.element,this.m_locals.decimals.res);
   } // grammar line 2577
            break;
            case 1: {
    RESOLVER.setLength(this.m_result.element,this.m_locals.length.res);
    } // grammar line 2571
            break;
            case 2: {
     RESOLVER.setType(this.m_result.element,this.m_locals.typeName.res);
     } // grammar line 2565
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
            case 0: { this.m_locals.type1.element = this.m_result.element; this.m_locals.type1.type = null; } // grammar line 2588
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 2590
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
     } // grammar line 2597
            { this.m_locals.AnnotationTypeSpecNoColon.element = this.m_result.element; } // grammar line 2601
            break;
        }
    }; // AnnotationTypeArray_action.performAction()

    function annotationEnumClause_action(BP, rule_info, attributes) {
        rnd.UserStackframeT.call(this, attributes, new annotationEnumClause_locals(), BP, rule_info);
    }
    annotationEnumClause_action.prototype = Object.create(rnd.UserStackframeT.prototype);
    annotationEnumClause_action.prototype.performAction = function(_action_num, RESOLVER) {
        /* jshint undef: true, unused: false */
        switch (_action_num) {
            case 0: {
    if (this.m_result.val.getLiteral() == null) {
    var implicitSymbol = RESOLVER.viewparser_cliteral(this.m_locals.symbol.res);
    this.m_result.val.setLiteral(implicitSymbol);
    }
    } // grammar line 2628
            break;
            case 1: {
   this.m_result.val.setLiteral(RESOLVER.viewparser_cliteral(this.m_locals.lit.res));
   } // grammar line 2624
            break;
            case 2: {
    this.m_result.val.setSymbol(this.m_locals.symbol.res);
    } // grammar line 2618
            break;
            case 3: {
    this.m_result.val = RESOLVER.createAndSetEnumerationValue(this.m_result.enumeration);
    } // grammar line 2614
            break;
            case 4: {
     this.m_result.enumeration = RESOLVER.createAndSetEnumerationDeclaration(this.m_result.element);
     } // grammar line 2609
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
            case 1: {
this.m_result.element.setNameToken(this.m_locals.name.res);
} // grammar line 2670
            { this.m_locals.type.element = this.m_result.element; } // grammar line 2673
            break;
            case 2: {
    this.m_result.element = RESOLVER.createAndSetAttributeDeclaration(this.m_result.type);
    } // grammar line 2667
            break;
            case 3: {
     this.m_result.type = RESOLVER.createAndSetAnonymousTypeDeclaration(this.m_result.element);
     } // grammar line 2663
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
} // grammar line 2695
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
} // grammar line 2701
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
} // grammar line 2704
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
} // grammar line 2721
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
} // grammar line 2724
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
} // grammar line 2732
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
} // grammar line 2735
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
} // grammar line 2738
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
} // grammar line 2741
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
} // grammar line 2744
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
} // grammar line 2747
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
} // grammar line 2750
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
} // grammar line 2753
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
} // grammar line 2756
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
} // grammar line 2759
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
} // grammar line 2762
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
} // grammar line 2765
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
} // grammar line 2768
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
} // grammar line 2771
            break;
        }
    }; // ALL_action.performAction()

    CdsDdlParserResolver.prototype.createFrame0 = function(frame_num, rule_info) {
        switch (frame_num) {
            case 0: // START1
                return new START_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 1: // START_SYNTAX_COLORING1
                return new START_SYNTAX_COLORING_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 2: // annotationDefintions1
                return new annotationDefintions_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 3: // START22
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 5: // TopLevelDeclaration1
                return new TopLevelDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.TopLevelDeclaration);
            case 6: // UsingDirectiveList1
                return new UsingDirectiveList_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 7: // NamespaceDeclaration1
                return new NamespaceDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NamespaceDeclaration);
            case 8: // START21
                return new START2_action(this.m_current.m_BP.ptr(), rule_info, rnd.Stackframe.nullFrame);
            case 9: // AnnotatedElementDeclaration2
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclaration);
            case 11: // NamespacePath1
                return new NamespacePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 13: // UsingDirective2
                return new UsingDirective_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.directive_n);
            case 14: // UsingDirective1
                return new UsingDirective_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.directive_1);
            case 15: // CdsAlias1
                return new CdsAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 16: // PathName1
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 17: // ContextDeclaration1
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c_decl);
            case 18: // EntityDeclaration2
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e_decl);
            case 19: // ViewDeclaration2
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.v_decl);
            case 20: // TypeDeclaration2
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.t_decl);
            case 21: // PreAnnotation1
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 22: // ContextComponentDeclaration1
                return new ContextComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ContextComponentDeclaration);
            case 23: // QualifiedDefId1
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 25: // ContextDeclaration2
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c_decl);
            case 26: // TypeDeclaration1
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.t_decl);
            case 27: // EntityDeclaration1
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e_decl);
            case 28: // ViewDeclaration1
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.v_decl);
            case 29: // PreAnnotation2
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 30: // AnnotatedElementDeclarationLoop1
                return new AnnotatedElementDeclarationLoop_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclarationLoop);
            case 31: // QualifiedDefId3
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 34: // AnnotatedElementDeclaration1
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elem_decl);
            case 35: // QLSubquery1
                return new QLSubquery_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSubquery);
            case 37: // QualifiedDefId4
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 40: // ElementDeclaration1
                return new ElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elemDecl);
            case 41: // PreAnnotation4
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 42: // Nullability1
                return new Nullability_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Nullability);
            case 43: // DefaultClause1
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 44: // TypeSpec3
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 45: // DefId3
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 46: // ELEMENT2
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 47: // ElementModifier1
                return new ElementModifier_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.modifiers);
            case 48: // NULL3
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nu);
            case 49: // NOT4
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.no);
            case 50: // Expression13
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 52: // KEY1
                return new KEY_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.key);
            case 53: // StructuredType1
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredType);
            case 54: // TypeSpec2
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 55: // QualifiedDefId2
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 57: // StructuredTypeComponent1
                return new StructuredTypeComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredTypeComponent);
            case 58: // AnnotatedTypeComponentDeclaration1
                return new AnnotatedTypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typecomponent);
            case 59: // TypeComponentDeclaration1
                return new TypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeCompDecl);
            case 60: // PreAnnotation3
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 61: // TypeSpec1
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 62: // DefId2
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 63: // ELEMENT1
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 64: // TypeTypeOf1
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 65: // TypeNamed1
                return new TypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 66: // TypeAssoc1
                return new TypeAssoc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeassoc);
            case 67: // PathName2
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 70: // IntLiteralWrapper3
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 71: // IntLiteralWrapper2
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 72: // TypeName1
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 73: // PathName3
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 74: // AssociationForeignKeyElement1
                return new AssociationForeignKeyElement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.r);
            case 75: // CdsAlias3
                return new CdsAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.aliasn);
            case 76: // PathName6
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.kn);
            case 77: // CdsAlias2
                return new CdsAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 78: // PathName5
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.k1);
            case 79: // Condition1
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 81: // AssociationForeignKeys1
                return new AssociationForeignKeys_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationForeignKeys);
            case 82: // AssociationOnCondition1
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 83: // PathName4
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.target);
            case 85: // Cardinality1
                return new Cardinality_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Cardinality);
            case 87: // IdWrapper9
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 89: // IntLiteralWrapper6
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.max1);
            case 90: // IntLiteralWrapper5
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.min);
            case 91: // IntLiteralWrapper4
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.srcMax);
            case 92: // IdWrapper2
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 93: // IdWrapper1
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 94: // DefId1
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defid);
            case 95: // IdWrapper11
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 96: // IdWrapper10
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 97: // IdWrapper5
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tail1);
            case 98: // IdWrapper4
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.base1);
            case 99: // IdWrapper8
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tail2);
            case 100: // IdWrapper7
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.base2);
            case 101: // IdWrapper6
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.med2);
            case 102: // IdWrapper3
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.first);
            case 103: // QuotedId1
                return new QuotedId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idq);
            case 104: // NULL1
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullLit);
            case 105: // IdWrapper12
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 106: // AnnotationConstantId1
                return new AnnotationConstantId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.const_val);
            case 107: // AnnotationLiteral1
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit_val);
            case 108: // RecordValue1
                return new RecordValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordValue);
            case 109: // ArrayValue1
                return new ArrayValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ArrayValue);
            case 110: // RecordComponent2
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 111: // RecordComponent1
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 112: // AnnotationValue1
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 113: // AnnotationPath1
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 114: // AnnotationValue2
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 115: // AnnotationPath2
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 116: // AnnotationValue4
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 117: // AnnotationValue3
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 118: // AnnotationId2
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 119: // AnnotationId1
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 120: // StringLiteralWrapper1
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.str_val);
            case 121: // IntLiteralWrapper1
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 122: // OrderByClause1
                return new OrderByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 123: // HavingClause1
                return new HavingClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.having);
            case 124: // GroupByClause1
                return new GroupByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.group);
            case 125: // WhereClause1
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 126: // QLSelectClause1
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.select);
            case 127: // FromClause1
                return new FromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.from);
            case 129: // QLSelectList1
                return new QLSelectList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectList);
            case 130: // AnnotatedQLSelectItem2
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 131: // AnnotatedQLSelectItem1
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedQLSelectItem);
            case 132: // QLSelectItem1
                return new QLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectItem);
            case 133: // PreAnnotation5
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 134: // QLPathListSelectItem1
                return new QLPathListSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 135: // ExprSelectItem1
                return new ExprSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 136: // IdWrapper16
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 138: // QLSelectClause2
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 139: // QLPathListSelectItemAlias1
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 140: // QLPath3
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pathExp);
            case 141: // QLPathListSelectItemAlias2
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 142: // QLSelectClause3
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p3);
            case 143: // IdWrapper14
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 144: // IdWrapper13
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 145: // ExprAlias1
                return new ExprAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 146: // TablePathList1
                return new TablePathList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 148: // TablePath1
                return new TablePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tab_path_1);
            case 149: // IdWrapper15
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 151: // TablePathAlias1
                return new TablePathAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 152: // QLPath2
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 153: // Condition3
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 155: // ExpressionList3
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 158: // Condition4
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 160: // SortSpecList1
                return new SortSpecList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 163: // SortSpec2
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.specN);
            case 164: // SortSpec1
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.spec1);
            case 165: // OptNullsFirstLast1
                return new OptNullsFirstLast_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nfl);
            case 166: // OptAscDesc1
                return new OptAscDesc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 167: // Expression15
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 168: // ASC1
                return new ASC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.asc);
            case 169: // DESC1
                return new DESC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.des);
            case 170: // FIRST1
                return new FIRST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.f);
            case 171: // LAST1
                return new LAST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 172: // NULLS1
                return new NULLS_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.n);
            case 173: // ConditionAnd2
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 175: // ConditionAnd1
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condAnd);
            case 176: // ConditionTerm3
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 178: // ConditionTerm1
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condTerm);
            case 179: // ConditionTerm2
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 180: // NOT1
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 181: // Condition2
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond2);
            case 182: // PredicateLeftIsExpression1
                return new PredicateLeftIsExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.predLeftIsExpr);
            case 183: // ComparisonPredicate1
                return new ComparisonPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp);
            case 184: // NullPredicate1
                return new NullPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullPred);
            case 185: // RangePredicate1
                return new RangePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.range);
            case 186: // LikePredicate1
                return new LikePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.like);
            case 187: // InPredicate1
                return new InPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.in);
            case 188: // NOT3
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 189: // Expression1
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.left);
            case 190: // Expression8
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 191: // Expression10
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 193: // Expression9
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 195: // Expression12
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 197: // Expression11
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 198: // LIKE1
                return new LIKE_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 199: // NULL2
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NULL);
            case 200: // NOT2
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 202: // ExpressionList2
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 204: // Expression7
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr_n);
            case 205: // Expression6
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 206: // ExprConcat1
                return new ExprConcat_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprConcat);
            case 207: // ExprSum2
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum2);
            case 208: // ExprSum1
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum1);
            case 209: // ExprFactor2
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor2);
            case 210: // ExprFactor3
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor3);
            case 211: // ExprFactor1
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor1);
            case 212: // ExprTerm4
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 213: // ExprTerm5
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 214: // ExprTerm1
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 215: // QLPath1
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.col);
            case 216: // ExprTerm2
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 217: // ExprTerm3
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 218: // Expression2
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 219: // Literal1
                return new Literal_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.literal);
            case 220: // Agg1
                return new Agg_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg);
            case 221: // Func1
                return new Func_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func);
            case 222: // IntLiteralWrapper7
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 223: // StringLiteralWrapper2
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.string_lit);
            case 224: // RealLiteral1
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 225: // BinaryLiteral1
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 226: // DateLiteral1
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 227: // TimeLiteral1
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 228: // TimeStampLiteral1
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 229: // NullLiteral1
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 230: // IdWrapper17
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 232: // Expression14
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 233: // Expression3
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr);
            case 234: // OptAll1
                return new OptAll_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_all);
            case 235: // Expression4
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr2);
            case 236: // DISTINCT1
                return new DISTINCT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.d);
            case 237: // AggName1
                return new AggName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_name);
            case 238: // COUNT1
                return new COUNT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c);
            case 239: // MIN1
                return new MIN_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.mi);
            case 240: // MAX1
                return new MAX_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ma);
            case 241: // SUM1
                return new SUM_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.su);
            case 242: // AVG1
                return new AVG_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.av);
            case 243: // STDDEV1
                return new STDDEV_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.std);
            case 244: // VAR1
                return new VAR_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.va);
            case 245: // ALL1
                return new ALL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a);
            case 246: // ExpressionList1
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 247: // Expression5
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 248: // FuncName1
                return new FuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func_name);
            case 249: // annotationDefintionsWithAnnotation1
                return new annotationDefintionsWithAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defs);
            case 250: // annotationDefinition1
                return new annotationDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.definition);
            case 251: // PreAnnotation6
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 252: // annotationTypeSpec1
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 253: // IdWrapper18
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 255: // AnnotationTypeArray1
                return new AnnotationTypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeArray);
            case 256: // AnnotationTypeNamedOrEnum2
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 258: // annotationStructuredType2
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type2);
            case 259: // DefaultClause2
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.def);
            case 260: // annotationEnumClause1
                return new annotationEnumClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumeration);
            case 261: // AnnotationTypeNamed1
                return new AnnotationTypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamed);
            case 262: // IntLiteralWrapper9
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.decimals);
            case 263: // IntLiteralWrapper8
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.length);
            case 264: // IdWrapper20
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 265: // annotationStructuredType1
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type1);
            case 266: // AnnotationTypeNamedOrEnum1
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 267: // AnnotationTypeSpecNoColon1
                return new AnnotationTypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeSpecNoColon);
            case 268: // AnnotationLiteral2
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit);
            case 269: // IdWrapper21
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.symbol);
            case 271: // annotationTypeSpec2
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 272: // IdWrapper19
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
        }
        rnd.Utils.assert(0 <= frame_num && frame_num < 273);
        return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
    }; // createFrame0()
    CdsDdlParserResolver.prototype.createFrame = function(frame_num, rule_info) {
        return new rnd.FramePtr(this.createFrame0(frame_num, rule_info)); 
    };
// v-v-v-v-v-v The following can be replaced by contents of @JsResolver::footer{{{ }}}
    return CdsDdlParserResolver; 
} );
// ^-^-^-^-^-^ end of what can be replaced by contents of @JsResolver::footer{{{ }}}
