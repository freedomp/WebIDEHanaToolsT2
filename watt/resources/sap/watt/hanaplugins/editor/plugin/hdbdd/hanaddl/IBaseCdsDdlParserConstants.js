/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
define(
    [
        "commonddl/commonddlNonUi"
    ], //dependencies
    function (
        commonddl
        ) {
        var DdlCodeCompletionType = commonddl.DdlCodeCompletionType;
        function IBaseCdsDdlParserConstants() {
        }
        IBaseCdsDdlParserConstants.VIEW_DECLARATION_RULE_NAME = "ViewDeclaration";
        IBaseCdsDdlParserConstants.START_RULE_NAME = "START";
        IBaseCdsDdlParserConstants.START2_RULE_NAME = "START2";
        IBaseCdsDdlParserConstants.START_SYNTAX_COLORING_RULE_NAME = "START_SYNTAX_COLORING";
        IBaseCdsDdlParserConstants.NEVER_MATCH_RULE_RULE_NAME = "NEVER_MATCH_RULE";
        IBaseCdsDdlParserConstants.ENTITY_RULE_NAME = "ENTITY";
        IBaseCdsDdlParserConstants.PATH_NAME_RULE = "PathName";
        IBaseCdsDdlParserConstants.PATH_GENERIC_RULE = "PathGeneric";
        IBaseCdsDdlParserConstants.TOP_LEVEL_DECLARATION_RULE_NAME = "TopLevelDeclaration";
        IBaseCdsDdlParserConstants.CONTEXT_COMPONENT_DECLARATION_RULE_NAME = "ContextComponentDeclaration";
        IBaseCdsDdlParserConstants.MAIN_ARTIFACT_LIST_RULE_NAME = "MainArtifactList";
        IBaseCdsDdlParserConstants.ENTITY_DECLARATION_RULE_NAME = "EntityDeclaration";
        IBaseCdsDdlParserConstants.CONTEXT_DECLARATION_RULE_NAME = "ContextDeclaration";
        IBaseCdsDdlParserConstants.ANNOTATION_VALUE_RULE_NAME = "AnnotationValue";
        IBaseCdsDdlParserConstants.RECORD_VALUE_RULE_NAME = "RecordValue";
        IBaseCdsDdlParserConstants.RECORD_COMPONENT = "RecordComponent";
        IBaseCdsDdlParserConstants.ANNOTATION_ARRAY_VALUE = "ArrayValue";
        IBaseCdsDdlParserConstants.PRE_ANNOTATION = "PreAnnotation";
        IBaseCdsDdlParserConstants.PRE_ANNOTATIONS = "_PreAnnotations";
        IBaseCdsDdlParserConstants.ANNOTATION_ID = "AnnotationId";
        IBaseCdsDdlParserConstants.TYPE_SPEC_RULE_NAME = "TypeSpec";
        IBaseCdsDdlParserConstants.TYPE_TYPE_OF_RULE_NAME = "TypeTypeOf";
        IBaseCdsDdlParserConstants.TYPE_NAME_RULE = "TypeName";
        IBaseCdsDdlParserConstants.ANNOTATION_TYPE_NAME_RULE = "AnnotationTypeName";
        IBaseCdsDdlParserConstants.TYPE_ASSOC_RULE_NAME = "TypeAssoc";
        IBaseCdsDdlParserConstants.STRUCTURED_TYPE_RULE_NAME = "StructuredType";
        IBaseCdsDdlParserConstants.ASSOCIATION_ON_CONDITION_RULE_NAME = "AssociationOnCondition";
        IBaseCdsDdlParserConstants.ASSOCIATION_TO_RULE_NAME = "AssociationTo";
        IBaseCdsDdlParserConstants.FROM_CLAUSE_RULE_NAME = "FromClause";
        IBaseCdsDdlParserConstants.TABLE_PATH_ALIAS_RULE_NAME = "TablePathAlias";
        IBaseCdsDdlParserConstants.TABLE_PATH = "TablePath";
        IBaseCdsDdlParserConstants.TABLE = "Table";
        IBaseCdsDdlParserConstants.QL_PATH_LIST_SELECT_ITEM_RULE_NAME = "QLPathListSelectItem";
        IBaseCdsDdlParserConstants.QL_SELECT_ITEM_RULE_NAME = "QLSelectItem";
        IBaseCdsDdlParserConstants.QL_PATH_LIST_SELECT_ITEM_ALIAS = "QLPathListSelectItemAlias";
        IBaseCdsDdlParserConstants.WHERE_CLAUSE_RULE_NAME = "WhereClause";
        IBaseCdsDdlParserConstants.GROUP_BY_CLAUSE_RULE_NAME = "GroupByClause";
        IBaseCdsDdlParserConstants.ORDER_BY_CLAUSE_RULE_NAME = "OrderByClause";
        IBaseCdsDdlParserConstants.HAVING_CLAUSE_RULE_NAME = "HavingClause";
        IBaseCdsDdlParserConstants.QL_SELECT_LIST = "QLSelectList";
        IBaseCdsDdlParserConstants.QL_SELECT_CLAUSE = "QLSelectClause";
        IBaseCdsDdlParserConstants.AGG = "Agg";
        IBaseCdsDdlParserConstants.ANNOTATED_QLSELECT_ITEM = "AnnotatedQLSelectItem";
        IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION = "AnnotatedElementDeclaration";
        IBaseCdsDdlParserConstants.ID_WRAPPER = "IdWrapper";
        IBaseCdsDdlParserConstants.IN_PREDICATE = "InPredicate";
        IBaseCdsDdlParserConstants.TYPE_COMPONENT_DECLARATION = "TypeComponentDeclaration";
        IBaseCdsDdlParserConstants.CONST_DECLARATION = "ConstDeclaration";
        IBaseCdsDdlParserConstants.QL_PATH = "QLPath";
        IBaseCdsDdlParserConstants.CONDITION = "Condition";
        IBaseCdsDdlParserConstants.CONDITION_TERM = "ConditionTerm";
        IBaseCdsDdlParserConstants.TYPE_ASSOC = "TypeAssoc";
        IBaseCdsDdlParserConstants.ASSOC_FOREIGN_KEY_OR_JOIN_CONDITION = "AssocForeignKeyOrJoinCondition";
        IBaseCdsDdlParserConstants.TYPE_DECLARATION = "TypeDeclaration";
        IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEYS = "AssociationForeignKeys";
        IBaseCdsDdlParserConstants.TYPE_NAMED = "TypeNamed";
        IBaseCdsDdlParserConstants.ELEMENT_DECLARATION = "ElementDeclaration";
        IBaseCdsDdlParserConstants.ASSOCIATION_FOREIGN_KEY_ELEMENT = "AssociationForeignKeyElement";
        IBaseCdsDdlParserConstants.CONDITION_AND = "ConditionAnd";
        IBaseCdsDdlParserConstants.OPT_ASC_DESC = "OptAscDesc";
        IBaseCdsDdlParserConstants.EXPRESSION = "Expression";
        IBaseCdsDdlParserConstants.EXPRESSION_LIST = "ExpressionList";
        IBaseCdsDdlParserConstants.PREDICATE_LEFT_IS_EXPRESSION = "PredicateLeftIsExpression";
        IBaseCdsDdlParserConstants.STRUCTURED_TYPE_COMPONENT = "StructuredTypeComponent";
        IBaseCdsDdlParserConstants.ENUM_VALUE_DECLARATION = "EnumValueDeclaration";
        IBaseCdsDdlParserConstants.ANNOTATED_ELEMENT_DECLARATION_LOOP = "AnnotatedElementDeclarationLoop";
        IBaseCdsDdlParserConstants.ANNOTATION_DECLARATION = "AnnotationDeclaration";
        IBaseCdsDdlParserConstants.ANNOTATION_STRUCTURED_TYPE = "annotationStructuredType";
        IBaseCdsDdlParserConstants.ANNOTATION_TYPE_SPEC = "annotationTypeSpec";
        IBaseCdsDdlParserConstants.EXPR_TERM = "ExprTerm";
        IBaseCdsDdlParserConstants.DEFAULT_CLAUSE = "DefaultClause";
        IBaseCdsDdlParserConstants.ANNOTATION_DEFAULT_CLAUSE = "AnnotationDefaultClause";
        IBaseCdsDdlParserConstants.USING_DIRECTIVE = "UsingDirective";
        IBaseCdsDdlParserConstants.NAMESPACE_PATH = "NamespacePath";
        IBaseCdsDdlParserConstants.USING_PATH = "UsingPath";
        IBaseCdsDdlParserConstants.NAMED_ARG_FUNC = "NamedArgFunc";
        IBaseCdsDdlParserConstants.COLON = "Colon";
        IBaseCdsDdlParserConstants.DEF_ID_RULE_NAME = "DefId";
        IBaseCdsDdlParserConstants.CDS_ALIAS_RULE_NAME = "CdsAlias";
        IBaseCdsDdlParserConstants.CONST_VALUE_RULE_NAME = "ConstValue";
        IBaseCdsDdlParserConstants.ADHOC_ELEMENT_DECLARATION_RULE_NAME = "AdhocElementDeclaration";
        IBaseCdsDdlParserConstants.ADHOC_DECLARATION_BLOCK = "AdhocDeclarationBlock";
        IBaseCdsDdlParserConstants.QL_SUBQUERY_ELEMENTARY = "QLSubqueryElementary";
        IBaseCdsDdlParserConstants.ACCESS_POLICY_DECLARATION = "AccessPolicyDeclaration";
        IBaseCdsDdlParserConstants.ACCESS_POLICY_COMPONENT_DECLARATION = "AccessPolicyComponentDeclaration";
        IBaseCdsDdlParserConstants.ROLE_DECLARATION = "RoleDeclaration";
        IBaseCdsDdlParserConstants.RULE_FROM_CLAUSE = "RuleFromClause";
        IBaseCdsDdlParserConstants.RULE_SUBQUERY = "RuleSubquery";
        IBaseCdsDdlParserConstants.ASPECT_EXPRESSION = "AspectExpression";
        IBaseCdsDdlParserConstants.ASPECT_DECLARATION = "AspectDeclaration";
        IBaseCdsDdlParserConstants.EXPR_ALIAS = "ExprAlias";
        IBaseCdsDdlParserConstants.QL_PATH_STARTRULE = "QLPathStartRule";
        IBaseCdsDdlParserConstants.TECHNICAL_CONFIGURATION = "TechnicalConfiguration";
        IBaseCdsDdlParserConstants.INDEX_DEFINITION = "IndexDefinition";
        IBaseCdsDdlParserConstants.PATH_WITH_ORDER = "PathWithOrder";
        IBaseCdsDdlParserConstants.FULLTEXT_INDEX_DEFINITION = "FulltextIndexDefinition";
        IBaseCdsDdlParserConstants.PARTITION_DEFINITION = "PartitionDefinition";
        IBaseCdsDdlParserConstants.PATH_SIMPLE = "PathSimple";
        IBaseCdsDdlParserConstants.FULLTEXT_INDEX_PARAMETERS = "FulltextIndexParameters";
        IBaseCdsDdlParserConstants.SERIES_DEFINITION = "SeriesDefinition";

        IBaseCdsDdlParserConstants.WARNING_TYPE = new DdlCodeCompletionType(299,"WARNING");
        IBaseCdsDdlParserConstants.LOADING_TYPE = new DdlCodeCompletionType(300,"LOADING");
        IBaseCdsDdlParserConstants.ELEMENT_TYPE = new DdlCodeCompletionType(499,"ELEMENT");
        IBaseCdsDdlParserConstants.ALIAS_TYPE = new DdlCodeCompletionType(499,"ALIAS");
        IBaseCdsDdlParserConstants.TYPE_TYPE = new DdlCodeCompletionType(499,"TYPE");
        IBaseCdsDdlParserConstants.ENTITY_TYPE = new DdlCodeCompletionType(499,"ENTITY");
        IBaseCdsDdlParserConstants.CONST_TYPE = new DdlCodeCompletionType(499,"CONST");
        IBaseCdsDdlParserConstants.CONTEXT_TYPE = new DdlCodeCompletionType(599,"CONTEXT");
        IBaseCdsDdlParserConstants.VIEW_TYPE = new DdlCodeCompletionType(499,"VIEW");
        IBaseCdsDdlParserConstants.ASSOC_TYPE = new DdlCodeCompletionType(499,"ASSOC");
        IBaseCdsDdlParserConstants.ASPECT_TYPE = new DdlCodeCompletionType(499,"ASPECT");
        IBaseCdsDdlParserConstants.TABLE_TYPE = new DdlCodeCompletionType(499,"TABLE");
        IBaseCdsDdlParserConstants.SYNONYM_TYPE = new DdlCodeCompletionType(499,"SYNONYM");

        return IBaseCdsDdlParserConstants;
    }
);