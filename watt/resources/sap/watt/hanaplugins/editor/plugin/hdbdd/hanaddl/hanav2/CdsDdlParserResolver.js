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
        this.co_decl = new ConstDeclaration_attributes();
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
        this.co_decl = new ConstDeclaration_attributes();
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
        this.typename = new TypeNamedOrEnum_attributes();
    }

    function TypeTypeOf_locals() {
        this.id = new PathName_attributes();
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
  } // grammar line 115
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
            case 0: { this.m_locals.TopLevelDeclaration.preAnnotations = null; } // grammar line 136
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
            case 0: { this.m_locals.AnnotatedElementDeclaration.parent = null; } // grammar line 149
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
  } // grammar line 169
            break;
            case 1: {
  this.m_result.cdecl = RESOLVER.createNamespace(this.m_locals.path.res);
  RESOLVER.setRootNamespace(this.m_result.cdecl);
  } // grammar line 164
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 158
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 159
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
} // grammar line 183
            break;
            case 1: {
  RESOLVER.compilationUnit.getStatements().push(this.m_locals.directive_1.res);
  } // grammar line 178
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
  } // grammar line 199
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 189
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 190
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
            case 0: { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 225
            break;
            case 1: { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 229
            break;
            case 2: { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 233
            break;
            case 3: { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 237
            break;
            case 4: { this.m_locals.co_decl.annots = this.m_result.preAnnotations; this.m_locals.co_decl.parentStmts = RESOLVER.compilationUnit.getStatements(); } // grammar line 241
            break;
            case 5: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 219
            break;
            case 6: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 214
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
  } // grammar line 272
            break;
            case 1: { this.m_locals.ContextComponentDeclaration.preAnnotations = null; this.m_locals.ContextComponentDeclaration.context = this.m_result.res; } // grammar line 268
            break;
            case 2: {
     this.m_result.res = RESOLVER.createContext(this.m_locals.id.res);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     } // grammar line 257
            break;
            case 3: {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 251
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
} // grammar line 299
            { this.m_locals.c_decl.annots = this.m_result.preAnnotations; this.m_locals.c_decl.parentStmts = this.m_locals.stmts; } // grammar line 304
            break;
            case 3: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 308
            { this.m_locals.t_decl.annots = this.m_result.preAnnotations; this.m_locals.t_decl.parentStmts = this.m_locals.stmts; } // grammar line 313
            break;
            case 5: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 317
            { this.m_locals.e_decl.annots = this.m_result.preAnnotations; this.m_locals.e_decl.parentStmts = this.m_locals.stmts; } // grammar line 322
            break;
            case 7: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 326
            { this.m_locals.v_decl.annots = this.m_result.preAnnotations; this.m_locals.v_decl.parentStmts = this.m_locals.stmts; } // grammar line 331
            break;
            case 9: {
if (this.m_result.context != null) {
this.m_locals.stmts = this.m_result.context.getStatements();
}
} // grammar line 335
            { this.m_locals.co_decl.annots = this.m_result.preAnnotations; this.m_locals.co_decl.parentStmts = this.m_locals.stmts; } // grammar line 340
            break;
            case 10: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 293
            break;
            case 12: {
  this.m_locals.stmts = null;
 } // grammar line 282
            {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 287
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
  } // grammar line 371
            break;
            case 2: {
     this.m_result.res = RESOLVER.createEntity(this.m_locals.id.res);
     if (this.m_result.parentStmts != null) {
     this.m_result.parentStmts.push(this.m_result.res);
     }
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
     RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
     } // grammar line 360
            { this.m_locals.AnnotatedElementDeclarationLoop.res = this.m_result.res; } // grammar line 368
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 348
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 352
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
            case 0: { this.m_locals.elem_decl.parent = this.m_result.res; } // grammar line 381
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
  } // grammar line 429
            break;
            case 1: { this.m_locals.QLSubquery.viewDef = this.m_result.res; } // grammar line 408
            break;
            case 2: {
  this.m_result.res = RESOLVER.viewparser_startDefineView();
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  this.m_result.res.setNamePath(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  } // grammar line 396
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 386
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 389
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
  } // grammar line 448
            break;
            case 1: { this.m_locals.elemDecl.parent = this.m_result.parent; } // grammar line 447
            break;
            case 2: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annot.res);
} // grammar line 443
            break;
            case 3: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 438
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
  } // grammar line 471
            break;
            case 1: { this.m_locals.Nullability.res = this.m_result.res; } // grammar line 467
            break;
            case 2: { this.m_locals.DefaultClause.res = this.m_result.res; } // grammar line 468
            break;
            case 3: {
  this.m_result.res = this.m_locals.type.res;
  RESOLVER.initializeElement(this.m_result.res,this.m_locals.id.res,this.m_locals.modifiers.keyToken,null,this.m_locals.element.name,null);
  } // grammar line 462
            break;
            case 4: { this.m_locals.type.parent = this.m_result.parent; this.m_locals.type.def = this.m_locals.id.res; } // grammar line 461
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 454
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 455
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
} // grammar line 487
            break;
            case 1: {
RESOLVER.setNotToken(this.m_result.res,this.m_locals.no.name);
} // grammar line 482
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
} // grammar line 496
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
} // grammar line 506
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
  } // grammar line 547
            break;
            case 1: {
  RESOLVER.viewparser_setConstValue(this.m_result.res,this.m_locals.expr.res);
  } // grammar line 543
            break;
            case 2: {
if (this.m_locals.type.res != null) {
this.m_result.res.getElements().push(this.m_locals.type.res);
}
} // grammar line 535
            break;
            case 3: { this.m_locals.type.parent = null; this.m_locals.type.def = null; } // grammar line 534
            break;
            case 4: {
  this.m_result.res = RESOLVER.createConst(this.m_locals.id.res);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  } // grammar line 525
            break;
            case 6: {


 } // grammar line 515
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 520
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
     } // grammar line 556
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
  } // grammar line 583
            break;
            case 1: {
  if (this.m_locals.expr.res instanceof LiteralExpressionImpl) {
  this.m_result.res.setLiteral(this.m_locals.expr.res);
  }
  } // grammar line 577
            break;
            case 2: {
  this.m_result.res = IAstFactory.eINSTANCE.createEnumerationValue();
  this.m_result.res.setSymbol(this.m_locals.id.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
  } // grammar line 571
            break;
            case 4: {


 } // grammar line 562
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 567
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
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 617
            break;
            case 1: { this.m_locals.StructuredType.res = this.m_result.res; } // grammar line 607
            break;
            case 2: {
if (this.m_locals.typespec.res != null) {
this.m_result.res.getElements().push(this.m_locals.typespec.res);
}
} // grammar line 610
            break;
            case 3: { this.m_locals.typespec.parent = null; this.m_locals.typespec.def = null; } // grammar line 609
            break;
            case 4: {
  this.m_result.res = RESOLVER.createType(this.m_locals.id.res);
  if (this.m_result.parentStmts != null) {
  this.m_result.parentStmts.push(this.m_result.res);
  }
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  RESOLVER.addAnnotations(this.m_result.res,this.m_result.annots);
  } // grammar line 598
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 590
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 593
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
            case 0: { this.m_locals.StructuredTypeComponent.res = this.m_result.res; } // grammar line 628
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
} // grammar line 635
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
  } // grammar line 655
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annot.res);
} // grammar line 650
            break;
            case 2: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 645
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
  } // grammar line 673
            break;
            case 1: {
  this.m_result.res = this.m_locals.typespec.res;
  RESOLVER.initializeTypeComponent(this.m_result.res,this.m_locals.id.res,this.m_locals.element.name);
  } // grammar line 668
            break;
            case 2: { this.m_locals.typespec.parent = null; this.m_locals.typespec.def = null; } // grammar line 667
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 661
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 662
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
} // grammar line 696
            break;
            case 1: { this.m_locals.tto.parent = this.m_result.parent; this.m_locals.tto.def = this.m_result.def; } // grammar line 695
            break;
            case 2: {
this.m_result.res = this.m_locals.typename.res;
RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
} // grammar line 702
            break;
            case 3: { this.m_locals.typename.parent = this.m_result.parent; this.m_locals.typename.def = this.m_result.def; } // grammar line 701
            break;
            case 4: {
this.m_result.res = this.m_locals.typeassoc.res;
} // grammar line 714
            break;
            case 5: { this.m_locals.typeassoc.parent = this.m_result.parent; this.m_locals.typeassoc.def = this.m_result.def; } // grammar line 713
            break;
            case 6: {
  this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 690
            break;
            case 7: {

 } // grammar line 685
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
  } // grammar line 758
            break;
        }
    }; // TypeTypeOf_action.performAction()

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
} // grammar line 798
            break;
            case 1: {
this.m_locals.enumeration.getValues().push(this.m_locals.val_decl.res);
} // grammar line 793
            break;
            case 2: {
 this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
 this.m_locals.enumeration = IAstFactory.eINSTANCE.createEnumerationDeclaration();
 this.m_result.res.setEnumerationDeclaration(this.m_locals.enumeration);
 } // grammar line 784
            break;
            case 3: {
  this.m_result.res = this.m_locals.named.res;
  } // grammar line 780
            break;
            case 5: {


  this.m_locals.enumeration = null;
 } // grammar line 773
            { this.m_locals.named.parent = this.m_result.parent; this.m_locals.named.def = this.m_result.def; } // grammar line 779
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
} // grammar line 828
            break;
            case 1: {
this.m_result.res.setLengthToken(this.m_locals.p1.res);
} // grammar line 822
            break;
            case 2: {
  this.m_result.res = RESOLVER.createAttribute(this.m_locals.id.res);
  if (this.m_result.def != null) {
  this.m_result.res.setNameToken(this.m_result.def);
  }
  if (this.m_result.parent != null) {
  this.m_result.parent.getElements().push(this.m_result.res);
  }
  } // grammar line 810
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
     } // grammar line 838
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
    } // grammar line 847
            break;
            case 1: { this.m_locals.r.res = this.m_result.res; } // grammar line 846
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 844
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
} // grammar line 871
            break;
            case 1: {
this.m_result.startIndex = RESOLVER.getNextTokenIndex();
} // grammar line 867
            break;
            case 2: {
 var fk = RESOLVER.addKey(this.m_result.res, this.m_locals.k1.res, this.m_locals.alias1.res);
 this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
 RESOLVER.viewparser_setStartEndTokenIndex(fk,this.m_result.startIndex,this.m_result.endIndex);
 } // grammar line 860
            break;
            case 3: {
    this.m_result.startIndex = RESOLVER.getNextTokenIndex();
    } // grammar line 856
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 854
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
  } // grammar line 884
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
            case 0: { this.m_locals.AssociationForeignKeys.res = this.m_result.res; } // grammar line 921
            break;
            case 1: { this.m_locals.AssociationOnCondition.res = this.m_result.res; } // grammar line 923
            break;
            case 2: {
  this.m_locals.endTargetIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.target.res,this.m_locals.startTargetIndex,this.m_locals.endTargetIndex);
  this.m_result.res.setTargetEntityPath(this.m_locals.target.res);
  } // grammar line 914
            break;
            case 3: {
  this.m_locals.startTargetIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 910
            break;
            case 4: { this.m_locals.Cardinality.res = this.m_result.res; } // grammar line 908
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
  } // grammar line 898
            break;
            case 7: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 891
            {


 } // grammar line 892
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
  } // grammar line 932
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
} // grammar line 971
            break;
            case 1: {
this.m_result.maxStar = rnd.Parser.getTok(RESOLVER, this, _star_index);
} // grammar line 967
            break;
            case 2: {
this.m_result.srcMaxStar = rnd.Parser.getTok(RESOLVER, this, _srcStar_index);
} // grammar line 952
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
} // grammar line 991
            break;
            case 1: {
  this.m_result.res = RESOLVER.createPathDeclaration();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 984
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
} // grammar line 1022
            break;
            case 1: {
if (this.m_locals.id_n.res != null) {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_n.res));
}
} // grammar line 1012
            break;
            case 2: {
  this.m_result.res = RESOLVER.createPathDeclaration();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id_1.res));
  } // grammar line 1001
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
  } // grammar line 1044
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
} // grammar line 1071
            break;
            case 1: {
RESOLVER.markLastNamespacePathEntry(this.m_result.res);
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.base1.res));
} // grammar line 1064
            break;
            case 2: {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.tail2.res));
} // grammar line 1095
            break;
            case 3: {
RESOLVER.markLastNamespacePathEntry(this.m_result.res);
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.base2.res));
} // grammar line 1088
            break;
            case 4: {
RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.med2.res));
} // grammar line 1082
            break;
            case 5: {
  this.m_result.res = RESOLVER.createPathExpression();
  RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.first.res));
  } // grammar line 1057
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
 } // grammar line 1108
            break;
            case 1: {
this.m_result.res = this.m_locals.idq.res;
} // grammar line 1115
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
  } // grammar line 1123
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
  } // grammar line 1130
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
  } // grammar line 1137
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
  } // grammar line 1144
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
  } // grammar line 1151
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
  } // grammar line 1158
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
  } // grammar line 1165
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
  } // grammar line 1172
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
  } // grammar line 1183
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
} // grammar line 1208
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1204
            break;
            case 2: {
var av = RESOLVER.addAnnotationValue(this.m_result.container, this.m_locals.lit_val.res);
this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
RESOLVER.viewparser_setStartEndTokenIndex(av,this.m_result.startIndex,this.m_result.endIndex);
} // grammar line 1220
            break;
            case 3: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1216
            break;
            case 4: { this.m_locals.RecordValue.container = this.m_result.container; } // grammar line 1228
            break;
            case 5: { this.m_locals.ArrayValue.container = this.m_result.container; } // grammar line 1232
            break;
            case 6: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1195
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
  } // grammar line 1255
            break;
            case 1: { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1252
            break;
            case 3: {
  this.m_result.record = RESOLVER.createAnnotationRecordValue();
  RESOLVER.addAnnotationRecordValue(this.m_result.container,this.m_result.record);
  } // grammar line 1245
            { this.m_locals.RecordComponent.container = this.m_result.record; } // grammar line 1249
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1237
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1241
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
  } // grammar line 1277
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1275
            break;
            case 3: {
     this.m_result.res = RESOLVER.createPreAnnotation();
     } // grammar line 1268
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1272
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1261
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1264
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
  } // grammar line 1300
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.res; } // grammar line 1298
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1283
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1287
            {
     this.m_result.res = RESOLVER.createAnnotationNameValuePair();
     RESOLVER.addAnnotationNameValuePair(this.m_result.container,this.m_result.res);
     } // grammar line 1290
            { this.m_locals.AnnotationPath.nameValuePair = this.m_result.res; } // grammar line 1295
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
  } // grammar line 1328
            break;
            case 1: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1323
            break;
            case 2: { this.m_locals.AnnotationValue.container = this.m_result.array; } // grammar line 1320
            break;
            case 3: {
  this.m_result.array = RESOLVER.createAnnotationArrayValue();
  RESOLVER.addAnnotationArrayValue(this.m_result.container,this.m_result.array);
  } // grammar line 1315
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1307
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1311
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
 } // grammar line 1347
            break;
            case 1: {
RESOLVER.addAnnotationPath(this.m_result.nameValuePair,rnd.Parser.getTok(RESOLVER, this, _dot_index));
} // grammar line 1343
            break;
            case 2: {
  RESOLVER.addAnnotationPath(this.m_result.nameValuePair,this.m_locals.id_1.res);
  } // grammar line 1338
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
  } // grammar line 1360
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
  } // grammar line 1373
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
} // grammar line 1381
            break;
            case 1: {
this.m_result.res = this.m_locals.int_val.res;
} // grammar line 1389
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
  } // grammar line 1432
            break;
            case 1: { this.m_locals.order.select = this.m_result.res; } // grammar line 1430
            break;
            case 2: { this.m_locals.having.select = this.m_result.res; } // grammar line 1429
            break;
            case 3: { this.m_locals.group.select = this.m_result.res; } // grammar line 1428
            break;
            case 4: { this.m_locals.where.select = this.m_result.res; } // grammar line 1427
            break;
            case 5: { this.m_locals.select.select = this.m_result.res; this.m_locals.select.list = null; } // grammar line 1426
            break;
            case 7: {
  this.m_result.res = RESOLVER.viewparser_startSelect();
  this.m_result.viewDef.setSelect(this.m_result.res);
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,-1);
  } // grammar line 1420
            { this.m_locals.from.select = this.m_result.res; } // grammar line 1425
            break;
            case 9: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1415
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1416
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
     } // grammar line 1457
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1439
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1444
            {
     if (this.m_result.list != null) {
     this.m_result.res = this.m_result.list;
     }else{
     this.m_result.res = RESOLVER.viewparser_startSelectList0();
     RESOLVER.viewparser_selectlist(this.m_result.select,this.m_result.res);
     RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_locals.startIndex,-1);
     }
     } // grammar line 1447
            { this.m_locals.QLSelectList.list = this.m_result.res; } // grammar line 1456
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
            case 0: { this.m_locals.p2.list = this.m_result.list; } // grammar line 1469
            break;
            case 1: { this.m_locals.AnnotatedQLSelectItem.list = this.m_result.list; } // grammar line 1467
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
            case 0: { this.m_locals.QLSelectItem.preAnnotations = this.m_result.preAnnotations; this.m_locals.QLSelectItem.list = this.m_result.list; } // grammar line 1489
            break;
            case 1: {
RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
} // grammar line 1484
            break;
            case 2: {
  this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
  } // grammar line 1479
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
  } // grammar line 1494
            break;
            case 1: { this.m_locals.p1.preAnnotations = this.m_result.preAnnotations; this.m_locals.p1.list = this.m_result.list; } // grammar line 1493
            break;
            case 2: {
  this.m_result.res = this.m_locals.p2.entry;
  } // grammar line 1499
            break;
            case 3: { this.m_locals.p2.preAnnotations = this.m_result.preAnnotations; this.m_locals.p2.list = this.m_result.list; } // grammar line 1498
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
} // grammar line 1512
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
     } // grammar line 1570
            break;
            case 1: { this.m_locals.p2.select = null; this.m_locals.p2.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 1550
            break;
            case 2: {
  var nestedList = IAstFactory.eINSTANCE.createSelectList();
  this.m_locals.nestedEntry = IAstFactory.eINSTANCE.createNestedSelectListPathEntry();
  this.m_locals.nestedEntry.setSelectList(nestedList);
  this.m_locals.pathExp.res.getPathEntries().push(this.m_locals.nestedEntry);
  } // grammar line 1544
            break;
            case 3: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 1542
            break;
            case 5: {
   this.m_locals.endIndex = RESOLVER.getLastMatchedTokenIndex();
   RESOLVER.viewparser_setStartEndTokenIndex(this.m_locals.pathExp.res,this.m_locals.startIndex,this.m_locals.endIndex);
   } // grammar line 1533
            {
   this.m_result.entry = RESOLVER.viewparser_selectListEntry(this.m_locals.pathExp.res);
   RESOLVER.addAnnotations(this.m_result.entry,this.m_result.preAnnotations);
   RESOLVER.viewparser_addSelectListEntry(this.m_result.list,this.m_result.entry);
   } // grammar line 1537
            break;
            case 6: { this.m_locals.QLPathListSelectItemAlias.entry = this.m_result.entry; } // grammar line 1566
            break;
            case 7: { this.m_locals.p3.select = null; this.m_locals.p3.list = this.m_locals.nestedEntry.getSelectList(); } // grammar line 1565
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
   } // grammar line 1555
            break;
            case 10: {
  this.m_locals.nestedEntry = null;
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1521
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1527
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
     } // grammar line 1597
            break;
            case 1: {
    RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id2.res));
    } // grammar line 1593
            break;
            case 2: {
     this.m_result.res = RESOLVER.createPathExpression();
     RESOLVER.viewparser_setStartTokenIndex(this.m_result.res,this.m_locals.startIndex);
     RESOLVER.addEntry(this.m_result.res,RESOLVER.createPathEntry(this.m_locals.id1.res));
     } // grammar line 1587
            break;
            case 4: {
  this.m_locals.startIndex = 0;
  this.m_locals.endIndex = 0;
 } // grammar line 1577
            {
     this.m_locals.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1583
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
  } // grammar line 1608
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.entry,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1615
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1603
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1604
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
  } // grammar line 1624
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
  } // grammar line 1635
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1653
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1630
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1631
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
} // grammar line 1663
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
  } // grammar line 1677
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1684
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1669
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1670
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
  } // grammar line 1702
            break;
            case 1: {
this.m_result.res = RESOLVER.createExpressionContainer(this.m_locals.cond.res);
this.m_result.select.setWhere(this.m_result.res);
} // grammar line 1697
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1690
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1691
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
} // grammar line 1720
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1711
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1713
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
} // grammar line 1737
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1732
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1730
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
} // grammar line 1753
            break;
            case 1: {
 this.m_result.startIndex = RESOLVER.getNextTokenIndex();
 } // grammar line 1748
            break;
            case 2: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1746
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
} // grammar line 1770
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.spec1.res);
  } // grammar line 1764
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
  } // grammar line 1783
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 1790
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1776
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1777
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
  } // grammar line 1800
            break;
            case 1: {
  this.m_result.res = this.m_locals.des.name;
  } // grammar line 1805
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
} // grammar line 1817
            break;
            case 1: {
this.m_result.nulls = this.m_locals.n.name;
this.m_result.firstLast = this.m_locals.l.name;
} // grammar line 1823
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
  } // grammar line 1849
            break;
            case 1: {
if (this.m_result.res == null) {
this.m_result.res = RESOLVER.viewparser_orExpression(this.m_locals.condAnd.res,this.m_locals.right.res);
}else this.m_result.res = RESOLVER.viewparser_orExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 1842
            break;
            case 2: {
  this.m_result.res = this.m_locals.condAnd.res;
  } // grammar line 1836
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1831
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1832
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
  } // grammar line 1871
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_andExpression(this.m_result.res,this.m_locals.right.res);
} // grammar line 1866
            break;
            case 2: {
  this.m_result.res = this.m_locals.condTerm.res;
  } // grammar line 1860
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1855
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1856
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
  } // grammar line 1907
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.cond1.res);
} // grammar line 1885
            break;
            case 2: {
this.m_result.res = this.m_locals.cond2.res;
} // grammar line 1893
            break;
            case 3: {
this.m_result.res = this.m_locals.predLeftIsExpr.res;
} // grammar line 1901
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 1877
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 1878
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
  } // grammar line 1975
            break;
            case 1: {
this.m_result.res = this.m_locals.comp.res;
} // grammar line 1922
            break;
            case 2: { this.m_locals.comp.left = this.m_locals.left.res; } // grammar line 1921
            break;
            case 3: {
this.m_result.res = this.m_locals.nullPred.res;
} // grammar line 1929
            break;
            case 4: { this.m_locals.nullPred.expr = this.m_locals.left.res; } // grammar line 1928
            break;
            case 5: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.range.res);
}else{
this.m_result.res = this.m_locals.range.res;
}
} // grammar line 1941
            break;
            case 6: { this.m_locals.range.expr1 = this.m_locals.left.res; this.m_locals.range.negated = this.m_result.negated; } // grammar line 1940
            break;
            case 7: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.like.res);
}else{
this.m_result.res = this.m_locals.like.res;
}
} // grammar line 1952
            break;
            case 8: { this.m_locals.like.expr1 = this.m_locals.left.res; this.m_locals.like.negated = this.m_result.negated; } // grammar line 1951
            break;
            case 9: {
if (this.m_result.negated == true) {
this.m_result.res = RESOLVER.viewparser_notExpression(this.m_locals.in.res);
}else{
this.m_result.res = this.m_locals.in.res;
}
} // grammar line 1963
            break;
            case 10: { this.m_locals.in.left = this.m_locals.left.res; this.m_locals.in.negated = this.m_result.negated; } // grammar line 1962
            break;
            case 11: {
this.m_result.negated = true;
} // grammar line 1935
            break;
            case 13: { this.m_result.endIndex = 0; this.m_result.negated = false; this.m_result.startIndex = 0; } // grammar line 1913
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 1915
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
  } // grammar line 2014
            break;
            case 1: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _eq_index);
} // grammar line 1984
            break;
            case 2: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _gs_index);
} // grammar line 1989
            break;
            case 3: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _b_index);
} // grammar line 1994
            break;
            case 4: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _be_index);
} // grammar line 1999
            break;
            case 5: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _s_index);
} // grammar line 2004
            break;
            case 6: {
this.m_result.comp = rnd.Parser.getTok(RESOLVER, this, _se_index);
} // grammar line 2009
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
  } // grammar line 2027
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2031
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2019
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2020
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
  } // grammar line 2050
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2054
            break;
            case 2: {
this.m_result.escapeToken = (this.m_locals.expr3.res).getTokenToken();
} // grammar line 2046
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2037
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2038
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
  } // grammar line 2069
            break;
            case 1: {
this.m_result.isNull = true;
} // grammar line 2064
            break;
            case 2: { this.m_result.isNull = false; } // grammar line 2060
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
  } // grammar line 2080
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
} // grammar line 2094
            break;
            case 1: {
  this.m_result.res = [];
  this.m_result.res.push(this.m_locals.expr.res);
  } // grammar line 2087
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
  } // grammar line 2107
            {
  this.m_result.endIndex = RESOLVER.getLastMatchedTokenIndex();
  RESOLVER.viewparser_setStartEndTokenIndex(this.m_result.res,this.m_result.startIndex,this.m_result.endIndex);
  } // grammar line 2111
            break;
            case 3: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2101
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2103
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
  } // grammar line 2132
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprSum2.res,rnd.Parser.getTok(RESOLVER, this, _op_index));
} // grammar line 2127
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprSum1.res;
  } // grammar line 2122
            break;
            case 4: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2117
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2118
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
  } // grammar line 2162
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor2.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 2149
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprFactor3.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 2156
            break;
            case 3: {
  this.m_result.res = this.m_locals.exprFactor1.res;
  } // grammar line 2143
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2138
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2139
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
} // grammar line 2176
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(this.m_result.res,this.m_locals.exprTerm3.res,rnd.Parser.getTok(RESOLVER, this, _opDiv_index));
} // grammar line 2183
            break;
            case 2: {
  this.m_result.res = this.m_locals.exprTerm1.res;
  } // grammar line 2170
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
  } // grammar line 2245
            break;
            case 1: {
this.m_result.res = this.m_locals.col.res;
} // grammar line 2198
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm1.res,rnd.Parser.getTok(RESOLVER, this, _opPlus_index));
} // grammar line 2205
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_createConcatenationExpression(null,this.m_locals.exprTerm2.res,rnd.Parser.getTok(RESOLVER, this, _opMinus_index));
} // grammar line 2212
            break;
            case 4: {
this.m_result.res = this.m_locals.exprTerm3.res;
} // grammar line 2219
            break;
            case 5: {
this.m_result.res = RESOLVER.viewparser_iliteral(this.m_locals.literal.res);
} // grammar line 2226
            break;
            case 6: {
this.m_result.res = this.m_locals.agg.res;
} // grammar line 2233
            break;
            case 7: {
this.m_result.res = this.m_locals.func.res;
} // grammar line 2240
            break;
            case 9: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2191
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2192
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
} // grammar line 2254
            break;
            case 1: {
this.m_result.res = this.m_locals.string_lit.res;
} // grammar line 2261
            break;
            case 2: {
this.m_result.res = this.m_locals.real_lit.res;
} // grammar line 2268
            break;
            case 3: {
this.m_result.res = this.m_locals.binary_lit.res;
} // grammar line 2275
            break;
            case 4: {
this.m_result.res = this.m_locals.date_lit.res;
} // grammar line 2282
            break;
            case 5: {
this.m_result.res = this.m_locals.time_lit.res;
} // grammar line 2289
            break;
            case 6: {
this.m_result.res = this.m_locals.timestamp_lit.res;
} // grammar line 2296
            break;
            case 7: {
this.m_result.res = this.m_locals.null_lit.res;
} // grammar line 2304
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
} // grammar line 2319
            break;
            case 1: {
  this.m_result.res = this.m_locals.expr.res;
  } // grammar line 2313
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
  } // grammar line 2360
            break;
            case 1: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,RESOLVER.viewparser_iliteral(rnd.Parser.getTok(RESOLVER, this, _st_index)));
} // grammar line 2336
            break;
            case 2: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr.res);
(this.m_result.res).setAllToken(this.m_locals.agg_all.res);
} // grammar line 2344
            break;
            case 3: {
this.m_result.res = RESOLVER.viewparser_stdFunctionExpression(this.m_locals.agg_name.res,this.m_locals.agg_expr2.res);
(this.m_result.res).setDistinctToken(this.m_locals.d.name);
} // grammar line 2353
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2327
            {
  this.m_result.startIndex = RESOLVER.getNextTokenIndex();
  } // grammar line 2329
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
} // grammar line 2367
            break;
            case 1: {
this.m_result.res = this.m_locals.mi.name;
} // grammar line 2370
            break;
            case 2: {
this.m_result.res = this.m_locals.ma.name;
} // grammar line 2373
            break;
            case 3: {
this.m_result.res = this.m_locals.su.name;
} // grammar line 2376
            break;
            case 4: {
this.m_result.res = this.m_locals.av.name;
} // grammar line 2379
            break;
            case 5: {
this.m_result.res = this.m_locals.std.name;
} // grammar line 2382
            break;
            case 6: {
this.m_result.res = this.m_locals.va.name;
} // grammar line 2385
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
} // grammar line 2391
            break;
            case 1: {
this.m_result.res = this.m_locals.a.name;
} // grammar line 2394
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
  } // grammar line 2424
            break;
            case 1: {
for (var exCount = 0;exCount < this.m_locals.list.res.length;exCount++) {
var ex = this.m_locals.list.res[exCount];
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,ex);
}
} // grammar line 2415
            break;
            case 2: {
RESOLVER.viewparser_addFuncExprParameter(this.m_result.res,this.m_locals.expr.res);
} // grammar line 2410
            break;
            case 3: {
  this.m_result.res = RESOLVER.viewparser_funcExpression(this.m_locals.func_name.res);
  } // grammar line 2405
            break;
            case 5: { this.m_result.endIndex = 0; this.m_result.startIndex = 0; } // grammar line 2400
            {
     this.m_result.startIndex = RESOLVER.getNextTokenIndex();
     } // grammar line 2401
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
      } // grammar line 2546
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
            case 0: { this.m_locals.defs.preAnnotations = null; } // grammar line 2570
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
   } // grammar line 2590
            break;
            case 1: {
   RESOLVER.collectPreAnnotation(this.m_result.preAnnotations,this.m_locals.annotation.res);
   } // grammar line 2585
            break;
            case 2: {
    this.m_result.preAnnotations = RESOLVER.createPreAnnotationList();
    } // grammar line 2580
            break;
            case 3: {
     RESOLVER.compilationUnit = IAstFactory.eINSTANCE.createCompilationUnit();
     } // grammar line 2576
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
     } // grammar line 2603
            { this.m_locals.type.element = this.m_result.anno; } // grammar line 2607
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
            case 0: { this.m_locals.AnnotationTypeArray.element = this.m_result.element; } // grammar line 2646
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 2648
            break;
            case 2: { this.m_locals.type2.element = this.m_result.element; this.m_locals.type2.type = null; } // grammar line 2653
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
            case 0: { this.m_locals.def.res = this.m_result.element; } // grammar line 2666
            break;
            case 1: { this.m_locals.enumeration.element = this.m_result.element; this.m_locals.enumeration.val = null; } // grammar line 2663
            break;
            case 2: { this.m_locals.AnnotationTypeNamed.element = this.m_result.element; } // grammar line 2661
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
   } // grammar line 2687
            break;
            case 1: {
    RESOLVER.setLength(this.m_result.element,this.m_locals.length.res);
    } // grammar line 2681
            break;
            case 2: {
     RESOLVER.setType(this.m_result.element,this.m_locals.typeName.res);
     } // grammar line 2675
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
            case 0: { this.m_locals.type1.element = this.m_result.element; this.m_locals.type1.type = null; } // grammar line 2698
            break;
            case 1: { this.m_locals.AnnotationTypeNamedOrEnum.element = this.m_result.element; } // grammar line 2700
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
     } // grammar line 2707
            { this.m_locals.AnnotationTypeSpecNoColon.element = this.m_result.element; } // grammar line 2711
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
    } // grammar line 2738
            break;
            case 1: {
   this.m_result.val.setLiteral(RESOLVER.viewparser_cliteral(this.m_locals.lit.res));
   } // grammar line 2734
            break;
            case 2: {
    this.m_result.val.setSymbol(this.m_locals.symbol.res);
    } // grammar line 2728
            break;
            case 3: {
    this.m_result.val = RESOLVER.createAndSetEnumerationValue(this.m_result.enumeration);
    } // grammar line 2724
            break;
            case 4: {
     this.m_result.enumeration = RESOLVER.createAndSetEnumerationDeclaration(this.m_result.element);
     } // grammar line 2719
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
} // grammar line 2780
            { this.m_locals.type.element = this.m_result.element; } // grammar line 2783
            break;
            case 2: {
    this.m_result.element = RESOLVER.createAndSetAttributeDeclaration(this.m_result.type);
    } // grammar line 2777
            break;
            case 3: {
     this.m_result.type = RESOLVER.createAndSetAnonymousTypeDeclaration(this.m_result.element);
     } // grammar line 2773
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
} // grammar line 2805
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
} // grammar line 2811
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
} // grammar line 2814
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
} // grammar line 2831
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
} // grammar line 2834
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
} // grammar line 2842
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
} // grammar line 2845
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
} // grammar line 2848
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
} // grammar line 2851
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
} // grammar line 2854
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
} // grammar line 2857
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
} // grammar line 2860
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
} // grammar line 2863
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
} // grammar line 2866
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
} // grammar line 2869
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
} // grammar line 2872
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
} // grammar line 2875
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
} // grammar line 2878
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
} // grammar line 2881
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
            case 21: // ConstDeclaration2
                return new ConstDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.co_decl);
            case 22: // PreAnnotation1
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 23: // ContextComponentDeclaration1
                return new ContextComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ContextComponentDeclaration);
            case 24: // QualifiedDefId1
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 26: // ContextDeclaration2
                return new ContextDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c_decl);
            case 27: // TypeDeclaration1
                return new TypeDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.t_decl);
            case 28: // EntityDeclaration1
                return new EntityDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.e_decl);
            case 29: // ViewDeclaration1
                return new ViewDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.v_decl);
            case 30: // ConstDeclaration1
                return new ConstDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.co_decl);
            case 31: // PreAnnotation2
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 32: // AnnotatedElementDeclarationLoop1
                return new AnnotatedElementDeclarationLoop_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedElementDeclarationLoop);
            case 33: // QualifiedDefId3
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 36: // AnnotatedElementDeclaration1
                return new AnnotatedElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elem_decl);
            case 37: // QLSubquery1
                return new QLSubquery_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSubquery);
            case 39: // QualifiedDefId4
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 42: // ElementDeclaration1
                return new ElementDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.elemDecl);
            case 43: // PreAnnotation4
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 44: // Nullability1
                return new Nullability_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Nullability);
            case 45: // DefaultClause1
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.DefaultClause);
            case 46: // TypeSpec3
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 47: // DefId4
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 48: // ELEMENT2
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 49: // ElementModifier1
                return new ElementModifier_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.modifiers);
            case 50: // NULL3
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nu);
            case 51: // NOT4
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.no);
            case 52: // Expression14
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 54: // KEY1
                return new KEY_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.key);
            case 55: // ConstValue1
                return new ConstValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 56: // TypeSpec4
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 57: // QualifiedDefId5
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 58: // Expression17
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exp);
            case 59: // Expression1
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 60: // DefId3
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 61: // StructuredType1
                return new StructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredType);
            case 62: // TypeSpec2
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 63: // QualifiedDefId2
                return new QualifiedDefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 65: // StructuredTypeComponent1
                return new StructuredTypeComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.StructuredTypeComponent);
            case 66: // AnnotatedTypeComponentDeclaration1
                return new AnnotatedTypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typecomponent);
            case 67: // TypeComponentDeclaration1
                return new TypeComponentDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeCompDecl);
            case 68: // PreAnnotation3
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annot);
            case 69: // TypeSpec1
                return new TypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typespec);
            case 70: // DefId2
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 71: // ELEMENT1
                return new ELEMENT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.element);
            case 72: // TypeTypeOf1
                return new TypeTypeOf_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tto);
            case 73: // TypeNamedOrEnum1
                return new TypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typename);
            case 74: // TypeAssoc1
                return new TypeAssoc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeassoc);
            case 75: // PathName2
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 78: // EnumValueDeclaration1
                return new EnumValueDeclaration_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.val_decl);
            case 79: // TypeNamed1
                return new TypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.named);
            case 80: // IntLiteralWrapper3
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 81: // IntLiteralWrapper2
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 82: // TypeName1
                return new TypeName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 83: // PathName3
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id);
            case 84: // AssociationForeignKeyElement1
                return new AssociationForeignKeyElement_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.r);
            case 85: // CdsAlias3
                return new CdsAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.aliasn);
            case 86: // PathName6
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.kn);
            case 87: // CdsAlias2
                return new CdsAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 88: // PathName5
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.k1);
            case 89: // Condition1
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 91: // AssociationForeignKeys1
                return new AssociationForeignKeys_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationForeignKeys);
            case 92: // AssociationOnCondition1
                return new AssociationOnCondition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AssociationOnCondition);
            case 93: // PathName4
                return new PathName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.target);
            case 95: // Cardinality1
                return new Cardinality_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.Cardinality);
            case 97: // IdWrapper9
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 99: // IntLiteralWrapper7
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.max1);
            case 100: // IntLiteralWrapper6
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.min);
            case 101: // IntLiteralWrapper5
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.srcMax);
            case 102: // IdWrapper2
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 103: // IdWrapper1
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 104: // DefId1
                return new DefId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defid);
            case 105: // IdWrapper11
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 106: // IdWrapper10
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 107: // IdWrapper5
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tail1);
            case 108: // IdWrapper4
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.base1);
            case 109: // IdWrapper8
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tail2);
            case 110: // IdWrapper7
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.base2);
            case 111: // IdWrapper6
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.med2);
            case 112: // IdWrapper3
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.first);
            case 113: // QuotedId1
                return new QuotedId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.idq);
            case 114: // NULL1
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullLit);
            case 115: // IdWrapper12
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 116: // AnnotationConstantId1
                return new AnnotationConstantId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.const_val);
            case 117: // AnnotationLiteral1
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit_val);
            case 118: // RecordValue1
                return new RecordValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordValue);
            case 119: // ArrayValue1
                return new ArrayValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ArrayValue);
            case 120: // RecordComponent2
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 121: // RecordComponent1
                return new RecordComponent_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.RecordComponent);
            case 122: // AnnotationValue1
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 123: // AnnotationPath1
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 124: // AnnotationValue2
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 125: // AnnotationPath2
                return new AnnotationPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationPath);
            case 126: // AnnotationValue4
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 127: // AnnotationValue3
                return new AnnotationValue_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationValue);
            case 128: // AnnotationId2
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_n);
            case 129: // AnnotationId1
                return new AnnotationId_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id_1);
            case 130: // StringLiteralWrapper1
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.str_val);
            case 131: // IntLiteralWrapper1
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 132: // OrderByClause1
                return new OrderByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 133: // HavingClause1
                return new HavingClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.having);
            case 134: // GroupByClause1
                return new GroupByClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.group);
            case 135: // WhereClause1
                return new WhereClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.where);
            case 136: // QLSelectClause1
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.select);
            case 137: // FromClause1
                return new FromClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.from);
            case 139: // QLSelectList1
                return new QLSelectList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectList);
            case 140: // AnnotatedQLSelectItem2
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 141: // AnnotatedQLSelectItem1
                return new AnnotatedQLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotatedQLSelectItem);
            case 142: // QLSelectItem1
                return new QLSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLSelectItem);
            case 143: // PreAnnotation5
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 144: // QLPathListSelectItem1
                return new QLPathListSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p1);
            case 145: // ExprSelectItem1
                return new ExprSelectItem_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 146: // IdWrapper16
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 148: // QLSelectClause2
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p2);
            case 149: // QLPathListSelectItemAlias1
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 150: // QLPath3
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.pathExp);
            case 151: // QLPathListSelectItemAlias2
                return new QLPathListSelectItemAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.QLPathListSelectItemAlias);
            case 152: // QLSelectClause3
                return new QLSelectClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.p3);
            case 153: // IdWrapper14
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id2);
            case 154: // IdWrapper13
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.id1);
            case 155: // ExprAlias1
                return new ExprAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 156: // TablePathList1
                return new TablePathList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 158: // TablePath1
                return new TablePath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.tab_path_1);
            case 159: // IdWrapper15
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 161: // TablePathAlias1
                return new TablePathAlias_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias);
            case 162: // QLPath2
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.path);
            case 163: // Condition3
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 165: // ExpressionList3
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 168: // Condition4
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond);
            case 170: // SortSpecList1
                return new SortSpecList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 173: // SortSpec2
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.specN);
            case 174: // SortSpec1
                return new SortSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.spec1);
            case 175: // OptNullsFirstLast1
                return new OptNullsFirstLast_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nfl);
            case 176: // OptAscDesc1
                return new OptAscDesc_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.order);
            case 177: // Expression16
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 178: // ASC1
                return new ASC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.asc);
            case 179: // DESC1
                return new DESC_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.des);
            case 180: // FIRST1
                return new FIRST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.f);
            case 181: // LAST1
                return new LAST_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 182: // NULLS1
                return new NULLS_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.n);
            case 183: // ConditionAnd2
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 185: // ConditionAnd1
                return new ConditionAnd_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condAnd);
            case 186: // ConditionTerm3
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 188: // ConditionTerm1
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.condTerm);
            case 189: // ConditionTerm2
                return new ConditionTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond1);
            case 190: // NOT1
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 191: // Condition2
                return new Condition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.cond2);
            case 192: // PredicateLeftIsExpression1
                return new PredicateLeftIsExpression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.predLeftIsExpr);
            case 193: // ComparisonPredicate1
                return new ComparisonPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.comp);
            case 194: // NullPredicate1
                return new NullPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.nullPred);
            case 195: // RangePredicate1
                return new RangePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.range);
            case 196: // LikePredicate1
                return new LikePredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.like);
            case 197: // InPredicate1
                return new InPredicate_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.in);
            case 198: // NOT3
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 199: // Expression8
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.left);
            case 200: // Expression9
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.right);
            case 201: // Expression11
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 203: // Expression10
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 205: // Expression13
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr3);
            case 207: // Expression12
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr2);
            case 208: // LIKE1
                return new LIKE_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.l);
            case 209: // NULL2
                return new NULL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NULL);
            case 210: // NOT2
                return new NOT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.NOT);
            case 212: // ExpressionList2
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 214: // Expression7
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr_n);
            case 215: // Expression6
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 216: // ExprConcat1
                return new ExprConcat_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprConcat);
            case 217: // ExprSum2
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum2);
            case 218: // ExprSum1
                return new ExprSum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprSum1);
            case 219: // ExprFactor2
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor2);
            case 220: // ExprFactor3
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor3);
            case 221: // ExprFactor1
                return new ExprFactor_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprFactor1);
            case 222: // ExprTerm4
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 223: // ExprTerm5
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 224: // ExprTerm1
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 225: // QLPath1
                return new QLPath_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.col);
            case 226: // ExprTerm2
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm1);
            case 227: // ExprTerm3
                return new ExprTerm_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm2);
            case 228: // Expression2
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.exprTerm3);
            case 229: // Literal1
                return new Literal_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.literal);
            case 230: // Agg1
                return new Agg_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg);
            case 231: // Func1
                return new Func_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func);
            case 232: // IntLiteralWrapper4
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.int_val);
            case 233: // StringLiteralWrapper2
                return new StringLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.string_lit);
            case 234: // RealLiteral1
                return new RealLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.real_lit);
            case 235: // BinaryLiteral1
                return new BinaryLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.binary_lit);
            case 236: // DateLiteral1
                return new DateLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.date_lit);
            case 237: // TimeLiteral1
                return new TimeLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.time_lit);
            case 238: // TimeStampLiteral1
                return new TimeStampLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.timestamp_lit);
            case 239: // NullLiteral1
                return new NullLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.null_lit);
            case 240: // IdWrapper17
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.alias1);
            case 242: // Expression15
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 243: // Expression3
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr);
            case 244: // OptAll1
                return new OptAll_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_all);
            case 245: // Expression4
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_expr2);
            case 246: // DISTINCT1
                return new DISTINCT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.d);
            case 247: // AggName1
                return new AggName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.agg_name);
            case 248: // COUNT1
                return new COUNT_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.c);
            case 249: // MIN1
                return new MIN_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.mi);
            case 250: // MAX1
                return new MAX_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.ma);
            case 251: // SUM1
                return new SUM_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.su);
            case 252: // AVG1
                return new AVG_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.av);
            case 253: // STDDEV1
                return new STDDEV_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.std);
            case 254: // VAR1
                return new VAR_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.va);
            case 255: // ALL1
                return new ALL_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.a);
            case 256: // ExpressionList1
                return new ExpressionList_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.list);
            case 257: // Expression5
                return new Expression_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.expr);
            case 258: // FuncName1
                return new FuncName_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.func_name);
            case 259: // annotationDefintionsWithAnnotation1
                return new annotationDefintionsWithAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.defs);
            case 260: // annotationDefinition1
                return new annotationDefinition_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.definition);
            case 261: // PreAnnotation6
                return new PreAnnotation_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.annotation);
            case 262: // annotationTypeSpec1
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 263: // IdWrapper18
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
            case 265: // AnnotationTypeArray1
                return new AnnotationTypeArray_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeArray);
            case 266: // AnnotationTypeNamedOrEnum2
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 268: // annotationStructuredType2
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type2);
            case 269: // DefaultClause2
                return new DefaultClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.def);
            case 270: // annotationEnumClause1
                return new annotationEnumClause_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.enumeration);
            case 271: // AnnotationTypeNamed1
                return new AnnotationTypeNamed_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamed);
            case 272: // IntLiteralWrapper9
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.decimals);
            case 273: // IntLiteralWrapper8
                return new IntLiteralWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.length);
            case 274: // IdWrapper20
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.typeName);
            case 275: // annotationStructuredType1
                return new annotationStructuredType_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type1);
            case 276: // AnnotationTypeNamedOrEnum1
                return new AnnotationTypeNamedOrEnum_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeNamedOrEnum);
            case 277: // AnnotationTypeSpecNoColon1
                return new AnnotationTypeSpecNoColon_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.AnnotationTypeSpecNoColon);
            case 278: // AnnotationLiteral2
                return new AnnotationLiteral_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.lit);
            case 279: // IdWrapper21
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.symbol);
            case 281: // annotationTypeSpec2
                return new annotationTypeSpec_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.type);
            case 282: // IdWrapper19
                return new IdWrapper_action(this.m_current.m_BP.ptr(), rule_info, this.m_current.m_BP.ptr().m_local_base.name);
        }
        rnd.Utils.assert(0 <= frame_num && frame_num < 283);
        return new rnd.UserStackframeT(rnd.Stackframe.nullFrame, new rnd.NullFrame(), this.m_current.m_BP.ptr(), rule_info);
    }; // createFrame0()
    CdsDdlParserResolver.prototype.createFrame = function(frame_num, rule_info) {
        return new rnd.FramePtr(this.createFrame0(frame_num, rule_info)); 
    };
// v-v-v-v-v-v The following can be replaced by contents of @JsResolver::footer{{{ }}}
    return CdsDdlParserResolver; 
} );
// ^-^-^-^-^-^ end of what can be replaced by contents of @JsResolver::footer{{{ }}}
