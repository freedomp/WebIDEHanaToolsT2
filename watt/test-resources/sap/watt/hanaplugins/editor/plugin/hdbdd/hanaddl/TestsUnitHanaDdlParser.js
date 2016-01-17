RequirePaths.setRequireJsConfigForHanaDdl(2);
// based on commit
//8c40a8b6970178f11cb39216dc1316e5a60982d5 don't propose current view declaration as datasource
define(
    [
        "commonddl/commonddlNonUi",
        "./TestUtilEclipseSelectionHandling",
        "hanaddl/hanaddlNonUi",
        "rndrt/rnd",
        "./AbstractV1HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"
    ], //dependencies
    function (
        commonddl,
        TestUtilEclipseSelectionHandling,
        hanaddlNonUi,
        rnd,
        AbstractV1HanaDdlParserTests,
        TestFriendlyHanaRepositoryAccess
    ) {
        var AbstractDdlCodeCompletionProposal = commonddl.AbstractDdlCodeCompletionProposal;
        var DdlCodeCompletionType = commonddl.DdlCodeCompletionType;
        var BooleanType = commonddl.BooleanType;
        var AbstractAnnotationImpl = commonddl.AbstractAnnotationImpl;
        var AnnotatedImpl = commonddl.AnnotatedImpl;
        var AnnotationArrayValueImpl = commonddl.AnnotationArrayValueImpl;
        var AnnotationDeclarationImpl = commonddl.AnnotationDeclarationImpl;
        var AnnotationNameValuePairImpl = commonddl.AnnotationNameValuePairImpl;
        var AnnotationRecordValueImpl = commonddl.AnnotationRecordValueImpl;
        var AnnotationValueImpl = commonddl.AnnotationValueImpl;
        var AssociationDeclarationImpl = commonddl.AssociationDeclarationImpl;
        var AttributeDeclarationImpl = commonddl.AttributeDeclarationImpl;
        var BetweenExpressionImpl = commonddl.BetweenExpressionImpl;
        var BooleanExpressionImpl = commonddl.BooleanExpressionImpl;
        var CompExpressionImpl = commonddl.CompExpressionImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ConcatenationExpressionImpl = commonddl.ConcatenationExpressionImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var DataSourceImpl = commonddl.DataSourceImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var ExpressionImpl = commonddl.ExpressionImpl;
        var ExpressionContainerImpl = commonddl.ExpressionContainerImpl;
        var ForeignKeyImpl = commonddl.ForeignKeyImpl;
        var FuncExpressionImpl = commonddl.FuncExpressionImpl;
        var GroupByImpl = commonddl.GroupByImpl;
        var GroupByEntryImpl = commonddl.GroupByEntryImpl;
        var InExpressionImpl = commonddl.InExpressionImpl;
        var LikeExpressionImpl = commonddl.LikeExpressionImpl;
        var LiteralExpressionImpl = commonddl.LiteralExpressionImpl;
        var NamespaceDeclarationImpl = commonddl.NamespaceDeclarationImpl;
        var NotExpressionImpl = commonddl.NotExpressionImpl;
        var NullExpressionImpl = commonddl.NullExpressionImpl;
        var OrderByImpl = commonddl.OrderByImpl;
        var OrderByEntryImpl = commonddl.OrderByEntryImpl;
        var PathExpressionImpl = commonddl.PathExpressionImpl;
        var PreAnnotationImpl = commonddl.PreAnnotationImpl;
        var SelectListImpl = commonddl.SelectListImpl;
        var SelectListEntryImpl = commonddl.SelectListEntryImpl;
        var SourceRangeImpl = commonddl.SourceRangeImpl;
        var StdFuncExpressionImpl = commonddl.StdFuncExpressionImpl;
        var TypeDeclarationImpl = commonddl.TypeDeclarationImpl;
        var UsingDirectiveImpl = commonddl.UsingDirectiveImpl;
        var ViewDefinitionImpl = commonddl.ViewDefinitionImpl;
        var ViewSelectImpl = commonddl.ViewSelectImpl;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        var Parser = rnd.Parser;
        var Messages = hanaddlNonUi.Messages;
        var HanaDdlCodeCompletion = hanaddlNonUi.HanaDdlCodeCompletion;
        var VersionsFactory = hanaddlNonUi.VersionsFactory;
        var IBaseCdsDdlParserConstants = hanaddlNonUi.IBaseCdsDdlParserConstants;

        function TestsUnitHanaDdlParser() {
        }

        function getFileContent(path) {
            var http = null;
            if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                http = new XMLHttpRequest();
            }
            http.open("GET", path, false);
            http.send(null);
            return http.responseText;
        }

        TestsUnitHanaDdlParser.prototype = Object.create(AbstractV1HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParser.prototype.__getAnnotationDefinitions = function() {

            function getPadFilePath() {
                var scripts = document.getElementsByTagName("script");
                for (var q in scripts) {
                    var s = scripts[q].src;
                    if (rnd.Utils.stringEndsWith(s,"hanaddlNonUi.js")) {
                        var lind = s.lastIndexOf("/");
                        var p = s.substring(0,lind);
                        return p;
                    }
                }
                return "";
            };
            var path = getPadFilePath()+"/hanav1/annotations.txt";
            var str = getFileContent(path);
            return str;

        };
        TestsUnitHanaDdlParser.prototype.astContext = function() {
            var source = "context cont1 { };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(6,compilationUnit.getTokenList().length);
            equal("cont1",compilationUnit.getStatements()[0].getName());
            source="CONTEXT cont1 { };";
            compilationUnit=this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(6,compilationUnit.getTokenList().length);
            equal("cont1",compilationUnit.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astContextWithNamespace = function() {
            var source = "context a.b.c::cont1 { };";
            var cu = this.parseSourceAndGetAst(source);
            equal(cu!=null,true);
            var cd = cu.getStatements()[0];
            equal(cd.getNameToken()==null,true);
            equal(cd.getNamePath()!=null,true);
            equal(4,cd.getNamePath().getEntries().length);
            equal("a.b.c.cont1",cd.getName());
        };
        TestsUnitHanaDdlParser.prototype.astNestedContext = function() {
            var source = "context cont1 { CONTEXT cont2 { }; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(11,compilationUnit.getTokenList().length);
            equal("cont1",compilationUnit.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astSimpleNamespace = function() {
            var source = "namespace ns;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(4,compilationUnit.getTokenList().length);
            equal("ns",compilationUnit.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astPathNamespace = function() {
            var source = "namespace sap.ordermgmt;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(6,compilationUnit.getTokenList().length);
            var nsp = compilationUnit.getStatements()[0];
            equal("sap.ordermgmt",nsp.getName());
            equal(2,nsp.getNamePath().getEntries().length);
        };
        TestsUnitHanaDdlParser.prototype.nameTokenForPathNamespaceIsCorrect = function() {
            var source = "namespace sap.ordermgmt;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(6,compilationUnit.getTokenList().length);
            equal(Category.CAT_IDENTIFIER,compilationUnit.getStatements()[0].getNamePath().getEntries()[0].getNameToken().m_category);
            equal(1,compilationUnit.getStatements()[0].getNamePath().getEntries()[0].getNameToken().m_line);
            equal(10,compilationUnit.getStatements()[0].getNamePath().getEntries()[0].getNameToken().m_offset);
        };
        TestsUnitHanaDdlParser.prototype.astEmptyEntity = function() {
            var source = "define entity emtpyEntity{ };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(7,compilationUnit.getTokenList().length);
            equal("emtpyEntity",compilationUnit.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astEmptyEntityInContext = function() {
            var source = "context cont1 { define entity emptyEntity{ }; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(12,compilationUnit.getTokenList().length);
            var ddlStatement = compilationUnit.getStatements()[0];
            equal("cont1",ddlStatement.getName());
            var context = ddlStatement;
            equal("emptyEntity",context.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astMultipleEntitiesInContext = function() {
            var source = "context cont1 { define entity firstEntity{ }; define entity secondEntity{ }; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(18,compilationUnit.getTokenList().length);
            var ddlStatement = compilationUnit.getStatements()[0];
            equal("cont1",ddlStatement.getName());
            var context = ddlStatement;
            equal("firstEntity",context.getStatements()[0].getName());
            equal("secondEntity",context.getStatements()[1].getName());
        };
        TestsUnitHanaDdlParser.prototype.astEntityWithNamePath = function() {
            var source = "entity com.sap.a::Entity { key k : Integer; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var ed = compilationUnit.getStatements()[0];
            equal(ed.getNameToken()==null,true);
            equal(ed.getNamePath()!=null,true);
            equal(4,ed.getNamePath().getEntries().length);
            equal("com.sap.a.Entity",ed.getName());
        };
        TestsUnitHanaDdlParser.prototype.astEntityWithTwoElements = function() {
            var source = "define entity Entity{  key1 : String(20); field1 : String(30); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(21,compilationUnit.getTokenList().length);
            var ddlStatement = compilationUnit.getStatements()[0];
            equal("Entity",ddlStatement.getName());
            var entity = ddlStatement;
            equal("key1",entity.getElements()[0].getNameToken().m_lexem);
            equal("String(20)",entity.getElements()[0].getTypeId());
            equal("field1",entity.getElements()[1].getNameToken().m_lexem);
            equal("String(30)",entity.getElements()[1].getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.astKeyElements = function() {
            var source = "define entity Entity{  key key1 : Integer; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            equal(compilationUnit!=null,true);
            equal(12,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            equal("key",entity.getElements()[0].getKeyToken().m_lexem);
            equal("key1",entity.getElements()[0].getNameToken().m_lexem);
            equal("Integer",entity.getElements()[0].getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.astNullableElements = function() {
            var source = "define entity Entity{ key1 : Integer null; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(12,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            equal("null",entity.getElements()[0].getNullableToken().m_lexem);
            equal("key1",entity.getElements()[0].getNameToken().m_lexem);
            equal("Integer",entity.getElements()[0].getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.astElementWithElementKeyword = function() {
            var source = "define entity Entity{ element key1 : Integer; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(12,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            equal("element",entity.getElements()[0].getElementToken().m_lexem);
            equal("key1",entity.getElements()[0].getNameToken().m_lexem);
            equal("Integer",entity.getElements()[0].getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.astElementWithTypeDecimals = function() {
            var source = "define entity Entity{ element key1 : Decimal(10,2); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(17,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[0];
            equal("key1",element.getNameToken().m_lexem);
            equal("Decimal(10, 2)",element.getTypeId());
            equal("10",element.getLengthToken().m_lexem);
            equal("2",element.getDecimalsToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astElementWithTypeString = function() {
            var source = "define entity Entity{ element key1 : String(10); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(15,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[0];
            equal("key1",element.getNameToken().m_lexem);
            equal("String(10)",element.getTypeId());
            equal("10",element.getLengthToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astElementWithTypeOfDeclaration = function() {
            var source = "define entity Entity{ elem : type of myType.field1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(15,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            equal("elem",entity.getElements()[0].getNameToken().m_lexem);
            equal("myType.field1",entity.getElements()[0].getTypeOfPath().getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.astEntityWithSimpleAssociation = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(13,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal("Entity1",association.getTargetEntityName());
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithOneCardinality = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[1] to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(16,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal("1",association.getMinToken().m_lexem);
            equal("1",association.getMaxToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationTargetEntityPath = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[1] to d.e.Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("d.e.Entity1",association.getTargetEntityName());
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithEmptyCardinality = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[] to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(15,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal(association.getMinToken()==null,true);
            equal(association.getMaxToken()==null,true);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithRangeCardinality = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[1..*] to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(19,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal(association.getSourceMaxCardinalityToken()==null,true);
            equal("1",association.getMinToken().m_lexem);
            equal("*",association.getMaxToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithSourceCardinalityLimited = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[1,5] to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(18,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal("1",association.getSourceMaxCardinalityToken().m_lexem);
            equal("5",association.getMinToken().m_lexem);
            equal("5",association.getMaxToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithSourceCardinalityUnlimited = function() {
            var source = "define entity Entity2{ assoc  : ASSOCIATION[*,5] to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(18,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal("*",association.getSourceMaxCardinalityToken().m_lexem);
            equal("5",association.getMinToken().m_lexem);
            equal("5",association.getMaxToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithMultipleKeys = function() {
            var source = "define entity Entity2{ assoc : ASSOCIATION TO Entity1 {k1, k2, k3}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(20,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal(3,association.getKeys().length);
            equal("k1",association.getKeys()[0].getKeyName());
            equal("k2",association.getKeys()[1].getKeyName());
            equal("k3",association.getKeys()[2].getKeyName());
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithKeyAlias = function() {
            var source = "define entity Entity2{ assoc : ASSOCIATION TO Entity1 {k1 AS MyKey}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(18,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal(1,association.getKeys().length);
            equal("k1",association.getKeys()[0].getKeyName());
            equal("MyKey",association.getKeys()[0].getAliasToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astAssociationWithMultipleKeyAliases = function() {
            var source = "define entity Entity2{ assoc : ASSOCIATION TO Entity1 {k1.b AS MyKey, k2 AS OtherKey}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(24,compilationUnit.getTokenList().length);
            var entity = compilationUnit.getStatements()[0];
            var association = entity.getElements()[0];
            equal("assoc",association.getNameToken().m_lexem);
            equal(2,association.getKeys().length);
            equal("k1.b",association.getKeys()[0].getKeyName());
            equal("MyKey",association.getKeys()[0].getAliasToken().m_lexem);
            equal("k2",association.getKeys()[1].getKeyName());
            equal("OtherKey",association.getKeys()[1].getAliasToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.astEmptyType = function() {
            var source = "type emtpyType{ };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(6,compilationUnit.getTokenList().length);
            equal("emtpyType",compilationUnit.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astEmptyTypeInContext = function() {
            var source = "context cont1 { type emptyType{ }; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(11,compilationUnit.getTokenList().length);
            var ddlStatement = compilationUnit.getStatements()[0];
            equal("cont1",ddlStatement.getName());
            var context = ddlStatement;
            equal("emptyType",context.getStatements()[0].getName());
        };
        TestsUnitHanaDdlParser.prototype.astMultipleTypesInContext = function() {
            var source = "context cont1 { entity firstType{ }; entity secondType{ }; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(16,compilationUnit.getTokenList().length);
            var ddlStatement = compilationUnit.getStatements()[0];
            equal("cont1",ddlStatement.getName());
            var context = ddlStatement;
            equal("firstType",context.getStatements()[0].getName());
            equal("secondType",context.getStatements()[1].getName());
        };
        TestsUnitHanaDdlParser.prototype.astTypeWithElements = function() {
            var source = "type type1{ key1 : Integer; element field1 : String(10); field5 : Integer; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            equal(22,compilationUnit.getTokenList().length);
            var type = compilationUnit.getStatements()[0];
            var elements = type.getElements();
            equal(3,elements.length);
            equal("key1",elements[0].getNameToken().m_lexem);
            equal("Integer",elements[0].getTypeId());
            equal("element",elements[1].getElementToken().m_lexem);
            equal("field1",elements[1].getNameToken().m_lexem);
            equal("String(10)",elements[1].getTypeId());
            equal("field5",elements[2].getNameToken().m_lexem);
            equal("Integer",elements[2].getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.astTypeWithNamespace = function() {
            var source = "type com.sap.a::type1{ key1 : Integer; element field1 : String(10); field5 : Integer; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            var td = compilationUnit.getStatements()[0];
            equal(td.getNameToken()==null,true);
            equal(td.getNamePath()!=null,true);
            equal(4,td.getNamePath().getEntries().length);
            equal("com.sap.a.type1",td.getName());
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithIdValue = function() {
            var source = "@Key : ID  context c1{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var value = annotation.getValue();
            equal("ID",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithOutValue = function() {
            var source = "@Key:";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            equal(annotation.getValue()==null,true);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithStringValue = function() {
            var source = "@Key: 'String'";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var value = annotation.getValue();
            equal("'String'",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithIntegerValue = function() {
            var source = "@Key: 5";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var value = annotation.getValue();
            equal("5",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithNegativeIntegerValue = function() {
            var source = "@Key: -5";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var value = annotation.getValue();
            equal("5",value.getValueToken().m_lexem);
        };
        // Commented out: Grammar does not support HexLiteral for AnnotationValue rule
        //TestsUnitHanaDdlParser.prototype.simpleAnnotationWithHexValue = function() {
        //    var source = "@Key: x'ffff'";
        //    var compilationUnit = this.parseSourceAndGetAst(source);
        //    var annotation = compilationUnit.getAnnotations()[0];
        //    equal("Key",annotation.getNameTokenPath()[0].m_lexem);
        //    var value = annotation.getValue();
        //    equal("x'ffff'",value.getValueToken().m_lexem);
        //};
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithArrayValue = function() {
            var source = "@Key: [1,-2,'a']";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var array = annotation.getValue();
            var value = array.getValues()[0];
            equal("1",value.getValueToken().m_lexem);
            value=array.getValues()[1];
            equal("2",value.getValueToken().m_lexem);
            value=array.getValues()[2];
            equal("'a'",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithRecordValue = function() {
            var source = "@Key: {a:b, c:'D', e:1}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var record = annotation.getValue();
            var recordComponents = record.getComponents();
            equal(3,recordComponents.length);
            var recordComponent = recordComponents[0];
            equal("a",recordComponent.getNameTokenPath()[0].m_lexem);
            var value = recordComponent.getValue();
            equal("b",value.getValueToken().m_lexem);
            recordComponent=recordComponents[1];
            equal("c",recordComponent.getNameTokenPath()[0].m_lexem);
            value=recordComponent.getValue();
            equal("'D'",value.getValueToken().m_lexem);
            recordComponent=recordComponents[2];
            equal("e",recordComponent.getNameTokenPath()[0].m_lexem);
            value=recordComponent.getValue();
            equal("1",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToContext = function() {
            var source = "@Key:Value context hugo{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.multipleAnnotationsAttachedToContext = function() {
            var source = "@Key:Value @AnotherKey:AnotherValue context hugo{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno1 = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno1,annotatedStatement.getAnnotationList()[0]);
            var anno2 = compilationUnit.getAnnotations()[1];
            equal(anno2,annotatedStatement.getAnnotationList()[1]);
        };
        TestsUnitHanaDdlParser.prototype.multipleAnnotationsAttachedToType = function() {
            var source = "@Key:Value @AnotherKey:AnotherValue type hugo{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno1 = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno1,annotatedStatement.getAnnotationList()[0]);
            var anno2 = compilationUnit.getAnnotations()[1];
            equal(anno2,annotatedStatement.getAnnotationList()[1]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToEntity = function() {
            var source = "@Key:Value ENTITY hugo{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToView = function() {
            var source = "@Key:Value DEFINE VIEW hugo AS SELECT FROM table { field };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToType = function() {
            var source = "@Key:Value TYPE hugo{};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToContextInContext = function() {
            var source = "context c_hugo { @Key:Value context c_hugo{}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var context = compilationUnit.getStatements()[0];
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = context.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToEntityInContext = function() {
            var source = "context c_hugo { @Key:Value Entity e_hugo{}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var context = compilationUnit.getStatements()[0];
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = context.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.annotationAttachedToTypeInContext = function() {
            var source = "context c_hugo { @Key:Value Type t_hugo{}; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var context = compilationUnit.getStatements()[0];
            var anno = compilationUnit.getAnnotations()[0];
            var annotatedStatement = context.getStatements()[0];
            equal(anno,annotatedStatement.getAnnotationList()[0]);
        };
        TestsUnitHanaDdlParser.prototype.simpleAnnotationWithPathInRecordValue = function() {
            var source = "@Key: {a.b.c:d}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Key",annotation.getNameTokenPath()[0].m_lexem);
            var record = annotation.getValue();
            var recordComponents = record.getComponents();
            equal(1,recordComponents.length);
            var recordComponent = recordComponents[0];
            equal("a",recordComponent.getNameTokenPath()[0].m_lexem);
            equal("b",recordComponent.getNameTokenPath()[2].m_lexem);
            equal("c",recordComponent.getNameTokenPath()[4].m_lexem);
            var value = recordComponent.getValue();
            equal("d",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.annotationWithEmptyArray = function() {
            var source = "@myanno : [{a:'Einer', b:[]}, {a:'Zehner', b:[]}, {a:'Hunderter', b:[]}];";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var tokens = compilationUnit.getTokenList();
            var semi = tokens[tokens.length - 2];
            equal(";", semi.m_lexem);
            equal(rnd.ErrorState.Unknown, semi.m_err_state);
            tokens = rnd.Utils.arraySubArray(tokens,0,tokens.length-2);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParser.prototype.complexAnnotationWithLineBreaksAndArrayInsideOfRecordValue = function() {
            var source = "@Name\r\n.\r\nWith\r\n\r\n.\r\n\r\nDot : {Value:[a,b,c]}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Name",annotation.getNameTokenPath()[0].m_lexem);
            equal(".",annotation.getNameTokenPath()[1].m_lexem);
            equal("With",annotation.getNameTokenPath()[2].m_lexem);
            equal(".",annotation.getNameTokenPath()[3].m_lexem);
            equal("Dot",annotation.getNameTokenPath()[4].m_lexem);
            var recordValue = annotation.getValue();
            var recordValueComponent = recordValue.getComponents()[0];
            equal("Value",recordValueComponent.getNameTokenPath()[0].m_lexem);
            var array = recordValueComponent.getValue();
            var value = array.getValues()[0];
            equal("a",value.getValueToken().m_lexem);
            value=array.getValues()[1];
            equal("b",value.getValueToken().m_lexem);
            value=array.getValues()[2];
            equal("c",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.complexAnnotationWithRecordValueInsideOfArray = function() {
            var source = "@Name : [{a:b}]";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Name",annotation.getNameTokenPath()[0].m_lexem);
            var array = annotation.getValue();
            var record = array.getValues()[0];
            var recordComponent = record.getComponents()[0];
            equal("a",recordComponent.getNameTokenPath()[0].m_lexem);
            var value = recordComponent.getValue();
            equal("b",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.complexAnnotationWithRecordInsideOfRecordValue = function() {
            var source = "@Name : {Value:{a:b,c:d}}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Name",annotation.getNameTokenPath()[0].m_lexem);
            var recordValue = annotation.getValue();
            var recordValueComponent = recordValue.getComponents()[0];
            equal("Value",recordValueComponent.getNameTokenPath()[0].m_lexem);
            var innerRecordValue = recordValueComponent.getValue();
            var innerRecordValueComponent = innerRecordValue.getComponents()[0];
            equal("a",innerRecordValueComponent.getNameTokenPath()[0].m_lexem);
            var innerValue = innerRecordValueComponent.getValue();
            equal("b",innerValue.getValueToken().m_lexem);
            innerRecordValueComponent=innerRecordValue.getComponents()[1];
            equal("c",innerRecordValueComponent.getNameTokenPath()[0].m_lexem);
            innerValue=innerRecordValueComponent.getValue();
            equal("d",innerValue.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.complextAnnotationWithArrayInsideArray = function() {
            var source = "@Name : [[a,b],[c,d]]";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("Name",annotation.getNameTokenPath()[0].m_lexem);
            var outerArray = annotation.getValue();
            var innerArray = outerArray.getValues()[0];
            var value = innerArray.getValues()[0];
            equal("a",value.getValueToken().m_lexem);
            value=innerArray.getValues()[1];
            equal("b",value.getValueToken().m_lexem);
            innerArray=outerArray.getValues()[1];
            value=innerArray.getValues()[0];
            equal("c",value.getValueToken().m_lexem);
            value=innerArray.getValues()[1];
            equal("d",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.complexAnnotationForIndex = function() {
            var source = "@Catalog.index: [ {name : 'IndexA', order : #ASC, unique: true, elementNames : ['feld1'] }]\r\n entity a {  }; ";
            var compilationUnit = this.parseSourceAndGetAst(source);
            for (var tCount=0;tCount<compilationUnit.getTokenList().length;tCount++) {
                var t=compilationUnit.getTokenList()[tCount];
                equal(ErrorState.Correct,t.m_err_state);
                if (t.m_category===Category.CAT_MAYBE_KEYWORD) {
                    Assert.fail1("source not parsed completley - maybe keyword found");
                }
            }
            var annotation = compilationUnit.getAnnotations()[0];
            var annotatedStatement = compilationUnit.getStatements()[0];
            equal(annotation,annotatedStatement.getAnnotationList()[0]);
            equal("Catalog",annotation.getNameTokenPath()[0].m_lexem);
            equal(".",annotation.getNameTokenPath()[1].m_lexem);
            equal("index",annotation.getNameTokenPath()[2].m_lexem);
            var outerArray = annotation.getValue();
            var record = outerArray.getValues()[0];
            var recordComponent = record.getComponents()[0];
            equal("name",recordComponent.getNameTokenPath()[0].m_lexem);
            var value = recordComponent.getValue();
            equal("'IndexA'",value.getValueToken().m_lexem);
            recordComponent=record.getComponents()[1];
            equal("order",recordComponent.getNameTokenPath()[0].m_lexem);
            value=recordComponent.getValue();
            equal("#ASC",value.getValueToken().m_lexem);
            recordComponent=record.getComponents()[2];
            equal("unique",recordComponent.getNameTokenPath()[0].m_lexem);
            value=recordComponent.getValue();
            equal("true",value.getValueToken().m_lexem);
            recordComponent=record.getComponents()[3];
            equal("elementNames",recordComponent.getNameTokenPath()[0].m_lexem);
            var innerArray = recordComponent.getValue();
            value=innerArray.getValues()[0];
            equal("'feld1'",value.getValueToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.getValueForPath = function() {
            var source = "@a:'xX'";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a"));
            equal("xX",annotation.getValueForPath("A"));
            equal(annotation.getValueForPath("b")==null,true);
        };
        TestsUnitHanaDdlParser.prototype.getValueForTwoLevelPath = function() {
            var source = "@a.a:'xX'";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a.a"));
            equal("xX",annotation.getValueForPath("a.A"));
            equal("xX",annotation.getValueForPath("A.a"));
            equal("xX",annotation.getValueForPath("A.A"));
            equal(annotation.getValueForPath("b.a")==null,true);
            equal(annotation.getValueForPath("a.b")==null,true);
        };
        TestsUnitHanaDdlParser.prototype.getValueForTwoLevelPathWithRecordValue = function() {
            var source = "@a:{a:'xX'}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a.a"));
            equal(annotation.getValueForPath("a.a.a")==null,true);
        };
        TestsUnitHanaDdlParser.prototype.getValueForTwoLevelPathWithoutValue = function() {
            var source = "@a:{a,b}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            var record = annotation.getValue();
            equal("a",record.getComponents()[0].getNameTokenPath()[0].m_lexem);
            equal(record.getComponents()[0].getValue()==null,true);
            equal("b",record.getComponents()[1].getNameTokenPath()[0].m_lexem);
            equal(annotation.getValueForPath("a.a")==null,true);
            equal(annotation.getValueForPath("a.a.a")==null,true);
        };
        TestsUnitHanaDdlParser.prototype.getValueForTwoLevelPathWithMultipleRecordValue = function() {
            var source = "@a:{b:1, a:'xX'}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a.a"));
            equal("1",annotation.getValueForPath("a.b"));
            equal(annotation.getValueForPath("a.a.a")==null,true);
            equal(annotation.getValueForPath("a.b.a")==null,true);
        };
        TestsUnitHanaDdlParser.prototype.getValueForThreeLevelPathWithRecordValue = function() {
            var source = "@a:{a.a:'xX'}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a.a.a"));
        };
        TestsUnitHanaDdlParser.prototype.getValueForThreeLevelPathWithNestedRecordValue = function() {
            var source = "@a:{a:{a:'xX'}}";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var annotation = compilationUnit.getAnnotations()[0];
            equal("xX",annotation.getValueForPath("a.a.a"));
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsNamespace = function() {
            var source = "namespace first;";
            this.__assertNamespaceStartEndOffset(source,0,0,2,2,"namespace first;","namespace first;");
            source="// comment \r\nnamespace first;//comment2\r\n//comment3";
            this.__assertNamespaceStartEndOffset(source,1,0,3,4,"namespace first;","// comment \r\nnamespace first;//comment2");
            source="/* comment */ namespace first;//comment2\r\n//comment3";
            this.__assertNamespaceStartEndOffset(source,1,0,3,4,"namespace first;","/* comment */ namespace first;//comment2");
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsType = function() {
            var source = "namespace tmtest;type a : String(10);";
            this.__assertTypeStartEndOffset(source,3,3,10,10,"type a : String(10);","type a : String(10);");
            source="namespace tmtest;type a { b : String(10); };";
            this.__assertTypeStartEndOffset(source,3,3,14,14,"type a { b : String(10); };","type a { b : String(10); };");
            source="namespace tmtest;context cont { type a { b : String(10); }; };";
            this.__assertTypeStartEndOffset(source,6,6,17,17,"type a { b : String(10); };","type a { b : String(10); };");
            source="namespace tmtest;context cont { type a :String(10); };";
            this.__assertTypeStartEndOffset(source,6,6,13,13,"type a :String(10);","type a :String(10);");
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsEntity = function() {
            var source = "namespace tmtest;entity en1{  key test1 : String(2); };";
            this.__assertEntityStartEndOffset(source,3,3,15,15,"entity en1{  key test1 : String(2); };","entity en1{  key test1 : String(2); };");
            source="namespace a.b.c;\r\n context context1 { entity en1 { id : Integer; };\r\n };";
            this.__assertEntityStartEndOffset(source,10,10,18,18,"entity en1 { id : Integer; };","entity en1 { id : Integer; };");
            source="namespace a.b.c;\r\n context context1 { @annot: 'annot1' entity en1 { id : Integer; };\r\n };";
            this.__assertEntityStartEndOffset(source,14,10,22,22,"entity en1 { id : Integer; };","@annot: 'annot1' entity en1 { id : Integer; };");
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsContext = function() {
            var source = "namespace a.b.c;\r\n context context1 { entity en1 { id : Integer; };\r\n };";
            this.__assertContextStartEndOffset(source,7,7,20,20,"context context1 { entity en1 { id : Integer; };\r\n };","context context1 { entity en1 { id : Integer; };\r\n };");
            source="namespace a.b.c;\r\n context context1 { entity en1 { id : Integer; };\r\n context nestedContext { entity en2 { id: Integer; }; }; };";
            var contextDecl = this.__assertContextStartEndOffset(source, 7, 7, 34, 34,
                "context context1 { entity en1 { id : Integer; };\r\n context nestedContext { entity en2 { id: Integer; }; }; };",
                "context context1 { entity en1 { id : Integer; };\r\n context nestedContext { entity en2 { id: Integer; }; }; };");
            var nestedContext = contextDecl.getStatements()[1];
            this.__assertSourceRangeStartEndOffset(source,nestedContext,19,19,32,32,"context nestedContext { entity en2 { id: Integer; }; };","context nestedContext { entity en2 { id: Integer; }; };");
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsAnnotation = function() {
            var source = "@Key: ID entity en { id : Integer;};";
            var annotations = this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,3,3,"@Key: ID","@Key: ID");
            this.__assertSourceRangeStartEndOffset(source,(annotations[0]).getValue(),3,3,3,3,"ID","ID");
            source="@Key: 'ID' entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,3,3,"@Key: 'ID'","@Key: 'ID'");
            this.__assertSourceRangeStartEndOffset(source,(annotations[0]).getValue(),3,3,3,3,"'ID'","'ID'");
            source="@Key: {a:ID,b:ID2} entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,11,11,"@Key: {a:ID,b:ID2}","@Key: {a:ID,b:ID2}");
            var rv = (annotations[0]).getValue();
            this.__assertSourceRangeStartEndOffset(source,rv,3,3,11,11,"{a:ID,b:ID2}","{a:ID,b:ID2}");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[0],4,4,6,6,"a:ID","a:ID");
            var nvp = rv.getComponents()[1];
            this.__assertSourceRangeStartEndOffset(source,nvp,8,8,10,10,"b:ID2","b:ID2");
            this.__assertSourceRangeStartEndOffset(source,nvp.getValue(),10,10,10,10,"ID2","ID2");
            source="@Key:Value @AnotherKey:AnotherValue entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[1],4,4,7,7,"@AnotherKey:AnotherValue","@AnotherKey:AnotherValue");
            this.__assertSourceRangeStartEndOffset(source,(annotations[1]).getValue(),7,7,7,7,"AnotherValue","AnotherValue");
            source="@Key: [1,-2,'a'] entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,10,10,"@Key: [1,-2,'a']","@Key: [1,-2,'a']");
            var av = (annotations[0]).getValue();
            this.__assertSourceRangeStartEndOffset(source,av,3,3,10,10,"[1,-2,'a']","[1,-2,'a']");
            this.__assertSourceRangeStartEndOffset(source,av.getValues()[0],4,4,4,4,"1","1");
            this.__assertSourceRangeStartEndOffset(source,av.getValues()[1],6,6,7,7,"-2","-2");
            source="@Key: {a:b, c:'D', e:1} entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,15,15,"@Key: {a:b, c:'D', e:1}","@Key: {a:b, c:'D', e:1}");
            rv=(annotations[0]).getValue();
            this.__assertSourceRangeStartEndOffset(source,rv,3,3,15,15,"{a:b, c:'D', e:1}","{a:b, c:'D', e:1}");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[0],4,4,6,6,"a:b","a:b");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[0].getValue(),6,6,6,6,"b","b");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[1].getValue(),10,10,10,10,"'D'","'D'");
            source="@Name : [{a:b}] entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,9,9,"@Name : [{a:b}]","@Name : [{a:b}]");
            av=(annotations[0]).getValue();
            this.__assertSourceRangeStartEndOffset(source,av,3,3,9,9,"[{a:b}]","[{a:b}]");
            rv=av.getValues()[0];
            this.__assertSourceRangeStartEndOffset(source,rv,4,4,8,8,"{a:b}","{a:b}");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[0],5,5,7,7,"a:b","a:b");
            this.__assertSourceRangeStartEndOffset(source,rv.getComponents()[0].getValue(),7,7,7,7,"b","b");
            source="@Name : [[a,b],[c,d]] entity en { id : Integer;};";
            annotations=this.__parseAndGetAnnotations(source);
            this.__assertSourceRangeStartEndOffset(source,annotations[0],0,0,15,15,"@Name : [[a,b],[c,d]]","@Name : [[a,b],[c,d]]");
            av=(annotations[0]).getValue();
            this.__assertSourceRangeStartEndOffset(source,av,3,3,15,15,"[[a,b],[c,d]]","[[a,b],[c,d]]");
            var av2 = av.getValues()[0];
            this.__assertSourceRangeStartEndOffset(source,av2,4,4,8,8,"[a,b]","[a,b]");
            this.__assertSourceRangeStartEndOffset(source,av2.getValues()[1],7,7,7,7,"b","b");
            av2=av.getValues()[1];
            this.__assertSourceRangeStartEndOffset(source,av2,10,10,14,14,"[c,d]","[c,d]");
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsForeignKey = function() {
            var source = "define entity Entity2{ assoc : ASSOCIATION TO Entity1 {k1 AS MyKey, k2 AS OtherKey}; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var ed = cu.getStatements()[0];
            var ass = ed.getElements()[0];
            var stmt = ass.getKeys()[0];
            equal(stmt!=null,true);
            equal(10,stmt.getStartTokenIndex());
            equal(10,stmt.getStartTokenIndexWithComments());
            equal(12,stmt.getEndTokenIndex());
            equal(12,stmt.getEndTokenIndexWithComments());
            equal("k1 AS MyKey",source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal("k1 AS MyKey",source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
            stmt=ass.getKeys()[1];
            equal(stmt!=null,true);
            equal(14,stmt.getStartTokenIndex());
            equal(14,stmt.getStartTokenIndexWithComments());
            equal(16,stmt.getEndTokenIndex());
            equal(16,stmt.getEndTokenIndexWithComments());
            equal("k2 AS OtherKey",source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal("k2 AS OtherKey",source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
        };
        TestsUnitHanaDdlParser.prototype.startEndPositionsElementDeclaration = function() {
            var source = "namespace a;entity en1 { element1 : Integer; };";
            this.__assertSourceRangeElementDeclaration(source,6,6,9,9,"element1 : Integer;","element1 : Integer;");
            source="namespace a;entity en1 { element1 : String(10); };";
            this.__assertSourceRangeElementDeclaration(source,6,6,12,12,"element1 : String(10);","element1 : String(10);");
            source="namespace a;entity en1 { element1 : Decimals(10,3); };";
            this.__assertSourceRangeElementDeclaration(source,6,6,14,14,"element1 : Decimals(10,3);","element1 : Decimals(10,3);");
            source="namespace a;entity en1 { key element1 : Decimals(10,3); };";
            this.__assertSourceRangeElementDeclaration(source,6,6,15,15,"key element1 : Decimals(10,3);","key element1 : Decimals(10,3);");
            source="namespace a;entity en1 { element1 : Decimals(10,3) null; };";
            this.__assertSourceRangeElementDeclaration(source,6,6,15,15,"element1 : Decimals(10,3) null;","element1 : Decimals(10,3) null;");
            source="namespace a;entity en1 { element1 : association to fritz; };";
            this.__assertSourceRangeElementDeclaration(source,6,6,11,11,"element1 : association to fritz;","element1 : association to fritz;");
            source="namespace a;entity en1 { element1 : type of a.b.c.fritz; };";
            this.__assertSourceRangeElementDeclaration(source,6,6,17,17,"element1 : type of a.b.c.fritz;","element1 : type of a.b.c.fritz;");
            source="namespace a;type en1 { element1 : Decimals(10,3); };";
            this.__assertSourceRangeElementDeclaration(source,6,6,14,14,"element1 : Decimals(10,3);","element1 : Decimals(10,3);");
            source="namespace a;type en1 { element1 : Decimals(10,3); element2:Integer; };";
            var firstEl = this.__assertSourceRangeElementDeclaration(source, 6, 6, 14, 14, "element1 : Decimals(10,3);",
                "element1 : Decimals(10,3);");
            var secondEl = (firstEl.eContainer()).getElements()[1];
            this.__assertSourceRangeStartEndOffset(source,secondEl,15,15,18,18,"element2:Integer;","element2:Integer;");
        };
        TestsUnitHanaDdlParser.prototype.__assertTypeStartEndOffset = function(source, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = null;
            for (var sCount=0;sCount<cu.getStatements().length;sCount++) {
                var s=cu.getStatements()[sCount];
                if (s instanceof TypeDeclarationImpl) {
                    stmt=s;
                    break;
                }else if (s instanceof ContextDeclarationImpl) {
                    var cd = s;
                    for (var csCount=0;csCount<cd.getStatements().length;csCount++) {
                        var cs=cd.getStatements()[csCount];
                        if (cs instanceof TypeDeclarationImpl) {
                            stmt=cs;
                            break;
                        }
                    }
                }
            }
            equal(stmt!=null,true);
            equal(startTokenIndex,stmt.getStartTokenIndex());
            equal(startTokenIndexWithComments,stmt.getStartTokenIndexWithComments());
            equal(endTokenIndex,stmt.getEndTokenIndex());
            equal(endTokenIndexWithComments,stmt.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
        };
        TestsUnitHanaDdlParser.prototype.__assertEntityStartEndOffset = function(source, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = null;
            for (var sCount=0;sCount<cu.getStatements().length;sCount++) {
                var s=cu.getStatements()[sCount];
                if (s instanceof EntityDeclarationImpl) {
                    stmt=s;
                    break;
                }else if (s instanceof ContextDeclarationImpl) {
                    var cd = s;
                    for (var csCount=0;csCount<cd.getStatements().length;csCount++) {
                        var cs=cd.getStatements()[csCount];
                        if (cs instanceof EntityDeclarationImpl) {
                            stmt=cs;
                            break;
                        }
                    }
                }
            }
            equal(stmt!=null,true);
            equal(startTokenIndex,stmt.getStartTokenIndex());
            equal(startTokenIndexWithComments,stmt.getStartTokenIndexWithComments());
            equal(endTokenIndex,stmt.getEndTokenIndex());
            equal(endTokenIndexWithComments,stmt.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
        };
        TestsUnitHanaDdlParser.prototype.__assertContextStartEndOffset = function(source, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = null;
            for (var sCount=0;sCount<cu.getStatements().length;sCount++) {
                var s=cu.getStatements()[sCount];
                if (s instanceof ContextDeclarationImpl) {
                    stmt=s;
                    break;
                }
            }
            equal(stmt!=null,true);
            equal(startTokenIndex,stmt.getStartTokenIndex());
            equal(startTokenIndexWithComments,stmt.getStartTokenIndexWithComments());
            equal(endTokenIndex,stmt.getEndTokenIndex());
            equal(endTokenIndexWithComments,stmt.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
            return stmt;
        };
        TestsUnitHanaDdlParser.prototype.__assertSourceRangeElementDeclaration = function(source, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = null;
            for (var sCount=0;sCount<cu.getStatements().length;sCount++) {
                var s=cu.getStatements()[sCount];
                if (stmt != null) {
                    break;
                }
                if (s instanceof EntityDeclarationImpl) {
                    var elements = (s).getElements();
                    for (var elCount=0;elCount<elements.length;elCount++) {
                        var el=elements[elCount];
                        stmt=el;
                        break;
                    }
                }else if (s instanceof TypeDeclarationImpl) {
                    var elements = (s).getElements();
                    for (var elCount=0;elCount<elements.length;elCount++) {
                        var el=elements[elCount];
                        stmt=el;
                        break;
                    }
                }
            }
            equal(stmt!=null,true);
            equal(startTokenIndex,stmt.getStartTokenIndex());
            equal(startTokenIndexWithComments,stmt.getStartTokenIndexWithComments());
            equal(endTokenIndex,stmt.getEndTokenIndex());
            equal(endTokenIndexWithComments,stmt.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
            return stmt;
        };
        TestsUnitHanaDdlParser.prototype.__parseAndGetAnnotations = function(source) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = null;
            for (var sCount=0;sCount<cu.getStatements().length;sCount++) {
                var s=cu.getStatements()[sCount];
                if (s instanceof EntityDeclarationImpl) {
                    stmt=s;
                    break;
                }
            }
            return (stmt).getAnnotationList();
        };
        TestsUnitHanaDdlParser.prototype.__assertSourceRangeStartEndOffset = function(source, sourceRange, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            equal(sourceRange!=null,true);
            equal(startTokenIndex,sourceRange.getStartTokenIndex());
            equal(startTokenIndexWithComments,sourceRange.getStartTokenIndexWithComments());
            equal(endTokenIndex,sourceRange.getEndTokenIndex());
            equal(endTokenIndexWithComments,sourceRange.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(sourceRange.getStartOffset(),sourceRange.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(sourceRange.getStartOffsetWithComments(),sourceRange.getEndOffsetWithComments()));
        };
        TestsUnitHanaDdlParser.prototype.__assertNamespaceStartEndOffset = function(source, startTokenIndex, startTokenIndexWithComments, endTokenIndex, endTokenIndexWithComments, substringStartToEnd, substringStartToEndWithComments) {
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var stmt = cu.getStatements()[0];
            equal(stmt!=null,true);
            equal(startTokenIndex,stmt.getStartTokenIndex());
            equal(startTokenIndexWithComments,stmt.getStartTokenIndexWithComments());
            equal(endTokenIndex,stmt.getEndTokenIndex());
            equal(endTokenIndexWithComments,stmt.getEndTokenIndexWithComments());
            equal(substringStartToEnd,source.substring(stmt.getStartOffset(),stmt.getEndOffset()));
            equal(substringStartToEndWithComments,source.substring(stmt.getStartOffsetWithComments(),stmt.getEndOffsetWithComments()));
        };
        TestsUnitHanaDdlParser.prototype.astQuotedId = function() {
            var source = "context \"abc\"  { };";
            var cu = this.parseSourceAndGetAst(source);
            var cd = cu.getStatements()[0];
            equal("\"abc\"",cd.getName());
            source="context \"ab vfdfdf dfvdfvvf\"  { };";
            cu=this.parseSourceAndGetAst(source);
            cd=cu.getStatements()[0];
            equal("\"ab vfdfdf dfvdfvvf\"",cd.getName());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTests = function() {
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext1.txt")));
            this.assertErrorTokenAtTokenIndex(this.parseSource(this.__getSource("CDS_MyContext10.txt")),48);
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext11.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext12.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext3.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext4.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext5.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext6.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext7.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext8.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyContext9.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyType1.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_MyType2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_ViewSql.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_ViewSql2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("CDS_ViewSqlWithAlias.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_complex.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_evil.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_faulty.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_simple_date.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_simple_int.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_simple_string.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Defaults_simple_time.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Nullable1.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("Nullable2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("PrimitiveTypes_Struct.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_ctx_1.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_ctx1.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_ctx2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_ctx3.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_quoted_entity1.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_t_2.txt")));
            this.assertNoErrorTokens(this.parseSource(this.__getSource("QuotedId_t1.txt")));
        };
        TestsUnitHanaDdlParser.prototype.defaultNegativeNumber = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default -42; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            equal("-",(def).getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(13,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultNegativeNumber2 = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 3+-42; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var ce = def;
            equal("+",ce.getOperator().m_lexem);
            var right = ce.getRight();
            equal("-",right.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(15,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultPositiveNumber = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default +42; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            equal("+",(def).getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(13,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultConcatenation = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 || 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var concat = def;
            equal("42",(concat.getLeft()).getToken());
            equal("33",(concat.getRight()).getToken());
            equal("||",concat.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(14,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.twoPipesSeparatedBySpace = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 | | 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            var tokens = compilationUnit.getTokenList();
            var token = tokens[13];
            equal("|",token.m_lexem);
            equal(ErrorState.Erroneous,token.m_err_state);
            equal(Category.CAT_OPERATOR,token.m_category);
            token=tokens[14];
            equal("|",token.m_lexem);
            equal(ErrorState.Correct,token.m_err_state);
            equal(Category.CAT_OPERATOR,token.m_category);
        };
        TestsUnitHanaDdlParser.prototype.defaultAdd = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 + 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var concat = def;
            equal("42",(concat.getLeft()).getToken());
            equal("33",(concat.getRight()).getToken());
            equal("+",concat.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(14,def.getEndTokenIndex());
            equal("42",compilationUnit.getTokenList()[def.getStartTokenIndex()].m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.defaultMinus = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 - 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var concat = def;
            equal("42",(concat.getLeft()).getToken());
            equal("33",(concat.getRight()).getToken());
            equal("-",concat.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(14,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultMultiplication = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 * 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var concat = def;
            equal("42",(concat.getLeft()).getToken());
            equal("33",(concat.getRight()).getToken());
            equal("*",concat.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(14,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultDivision = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default 42 / 33; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            var concat = def;
            equal("42",(concat.getLeft()).getToken());
            equal("33",(concat.getRight()).getToken());
            equal("/",concat.getOperator().m_lexem);
            equal(12,def.getStartTokenIndex());
            equal(14,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultAggregateFunction = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default count( * ); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            equal("count",(def).getFuncName());
            equal(12,def.getStartTokenIndex());
            equal(15,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.defaultAbsFunction = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default abs( a, b, c, d ); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            equal("abs",(def).getName().m_lexem);
            equal(4,(def).getParameters().length);
            equal("d",((def).getParameters()[3]).getPathString(false));
            equal(12,def.getStartTokenIndex());
            equal(21,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.allFunctions = function() {
            var source = "entity simple {";
            source+="   elem: Integer default acos( );";
            source+="   elem: Integer default ADD_DAYS( );";
            source+="   elem: Integer default add_months( );";
            source+="   elem: Integer default add_seconds( );";
            source+="   elem: Integer default add_years( );";
            source+="   elem: Integer default ascii( );";
            source+="   elem: Integer default asin( );";
            source+="   elem: Integer default atan( );";
            source+="   elem: Integer default atan2( );";
            source+="   elem: Integer default bintohex( );";
            source+="   elem: Integer default bitand( );";
            source+="   elem: Integer default ceil( );";
            source+="   elem: Integer default coalesce( );";
            source+="   elem: Integer default concat( );";
            source+="   elem: Integer default cos( );";
            source+="   elem: Integer default cosh( );";
            source+="   elem: Integer default cot( );";
            source+="   elem: Integer default days_between( );";
            source+="   elem: Integer default exp( );";
            source+="   elem: Integer default floor( );";
            source+="   elem: Integer default greatest( );";
            source+="   elem: Integer default hasanyprivileges( );";
            source+="   elem: Integer default hassystemprivilege( );";
            source+="   elem: Integer default hextobin( );";
            source+="   elem: Integer default ifnull( );";
            source+="   elem: Integer default isauthorized( );";
            source+="   elem: Integer default last_day( );";
            source+="   elem: Integer default least( );";
            source+="   elem: Integer default length( );";
            source+="   elem: Integer default ln( );";
            source+="   elem: Integer default locate( );";
            source+="   elem: Integer default log( );";
            source+="   elem: Integer default lower( );";
            source+="   elem: Integer default lpad( );";
            source+="   elem: Integer default mod( );";
            source+="   elem: Integer default next_day( );";
            source+="   elem: Integer default nullif( );";
            source+="   elem: Integer default power( );";
            source+="   elem: Integer default replace( );";
            source+="   elem: Integer default round( expr );";
            source+="   elem: Integer default rpad( );";
            source+="   elem: Integer default seconds_between( );";
            source+="   elem: Integer default session_context( );";
            source+="   elem: Integer default sign( );";
            source+="   elem: Integer default sin( );";
            source+="   elem: Integer default sinh( );";
            source+="   elem: Integer default sqrt( );";
            source+="   elem: Integer default substr( );";
            source+="   elem: Integer default substr_after( );";
            source+="   elem: Integer default substr_before( );";
            source+="   elem: Integer default tan( );";
            source+="   elem: Integer default tanh( );";
            source+="   elem: Integer default to_bigint( );";
            source+="   elem: Integer default to_binary( );";
            source+="   elem: Integer default to_blob( );";
            source+="   elem: Integer default to_char( );";
            source+="   elem: Integer default to_clob( );";
            source+="   elem: Integer default to_date( );";
            source+="   elem: Integer default to_dats( );";
            source+="   elem: Integer default to_decimal( );";
            source+="   elem: Integer default to_double( );";
            source+="   elem: Integer default to_int( );";
            source+="   elem: Integer default to_integer( );";
            source+="   elem: Integer default to_nchar( );";
            source+="   elem: Integer default to_nclob( );";
            source+="   elem: Integer default to_nvarchar( );";
            source+="   elem: Integer default to_real( );";
            source+="   elem: Integer default to_seconddate( );";
            source+="   elem: Integer default to_smalldecimal( );";
            source+="   elem: Integer default to_smallint( );";
            source+="   elem: Integer default to_time( );";
            source+="   elem: Integer default to_timestamp( );";
            source+="   elem: Integer default to_tinyint( );";
            source+="   elem: Integer default to_varbinary( );";
            source+="   elem: Integer default to_varchar( );";
            source+="   elem: Integer default unicode( );";
            source+="   elem: Integer default upper( );";
            source+="   elem: Integer default weekday( );";
            source+="   elem: Integer default char( );";
            source+="   elem: Integer default nchar( );";
            source+="   elem: Integer default instr( );";
            source+="   elem: Integer default lcase( );";
            source+="   elem: Integer default substring( );";
            source+="   elem: Integer default ucase( );";
            source+="   elem: Integer default curdate( );";
            source+="   elem: Integer default curtime( );";
            source+="   elem: Integer default database( );";
            source+="   elem: Integer default now( );";
            source+="   elem: Integer default user( );";
            source+="};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
        };
        TestsUnitHanaDdlParser.prototype.defaultNull = function() {
            var source = "entity simple_int {   key id : Integer;  intWithDefault : Integer default null; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var element = entity.getElements()[1];
            var def = element.getDefault();
            equal("null",(def).getToken());
            equal(12,def.getStartTokenIndex());
            equal(12,def.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_DefaultsSimpleInt = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Defaults_simple_int.txt"));
            equal(compilationUnit!=null,true);
            var edcl = compilationUnit.getStatements()[1];
            var element = edcl.getElements()[1];
            equal("intWithDefault",element.getName());
            equal("Integer",element.getTypeId());
            equal("42",(element.getDefault()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_Defaults_simple_date = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Defaults_simple_date.txt"));
            equal(compilationUnit!=null,true);
            var edcl = compilationUnit.getStatements()[1];
            var element = edcl.getElements()[1];
            equal("dateWithDefault",element.getName());
            equal("LocalDate",element.getTypeId());
            equal("date'2013-06-05'",(element.getDefault()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_Defaults_simple_string = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Defaults_simple_string.txt"));
            equal(compilationUnit!=null,true);
            var edcl = compilationUnit.getStatements()[1];
            var element = edcl.getElements()[1];
            equal("stringWithDefault",element.getName());
            equal("String(10)",element.getTypeId());
            equal("'foo'",(element.getDefault()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_Defaults_simple_time = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Defaults_simple_time.txt"));
            equal(compilationUnit!=null,true);
            var edcl = compilationUnit.getStatements()[1];
            var element = edcl.getElements()[1];
            equal("timeWithDefault",element.getName());
            equal("LocalTime",element.getTypeId());
            equal("time'17:38:06'",(element.getDefault()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_Defaults_complex = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Defaults_complex.txt"));
            equal(compilationUnit!=null,true);
            var edcl = compilationUnit.getStatements()[1];
            var element = edcl.getElements()[2];
            equal("bin2",element.getName());
            equal("Binary(32)",element.getTypeId());
            equal("x'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'",(element.getDefault()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_Nullable1 = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("Nullable1.txt"));
            equal(compilationUnit!=null,true);
            var context = compilationUnit.getStatements()[1];
            var entity = context.getStatements()[0];
            var id2 = entity.getElements()[1];
            equal("id2",id2.getName());
            equal("null",id2.getNullableToken().m_lexem);
            equal("not",id2.getNotToken().m_lexem);
            var id3 = entity.getElements()[2];
            equal("id3",id3.getName());
            equal("null",id3.getNullableToken().m_lexem);
            equal("not",id3.getNotToken().m_lexem);
            var foo = entity.getElements()[3];
            equal("foo",foo.getName());
            equal(foo.getNullableToken()==null,true);
            equal(foo.getNotToken()==null,true);
            var bar = entity.getElements()[4];
            equal("bar",bar.getName());
            equal("null",bar.getNullableToken().m_lexem);
            equal(bar.getNotToken()==null,true);
            var wiz = entity.getElements()[5];
            equal("wiz",wiz.getName());
            equal("null",wiz.getNullableToken().m_lexem);
            equal("not",wiz.getNotToken().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.cdsRuntimeTestsWithAst_CDS_ViewSql = function() {
            var compilationUnit = this.parseSourceAndGetAst(this.__getSource("CDS_ViewSql.txt"));
            equal(compilationUnit!=null,true);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[1];
            var viewDef = context.getStatements()[1];
            equal("MyView",viewDef.getName());
            equal(49,viewDef.getStartTokenIndex());
            equal(87,viewDef.getEndTokenIndex());
            var select = viewDef.getSelect();
            equal(select!=null,true);
            equal(52,select.getStartTokenIndex());
            equal(86,select.getEndTokenIndex());
            var selectList = select.getSelectList();
            equal(selectList!=null,true);
            equal(57,selectList.getStartTokenIndex());
            equal(67,selectList.getEndTokenIndex());
            var entries = selectList.getEntries();
            equal(3,entries.length);
            var entry = entries[0];
            var pathExpression = entry.getExpression();
            equal(58,pathExpression.getStartTokenIndex());
            equal(58,pathExpression.getEndTokenIndex());
            equal("elt1",pathExpression.getPathString(true));
            equal("keyElt",entry.getAlias());
            equal(58,entry.getStartTokenIndex());
            equal(60,entry.getEndTokenIndex());
            entry=entries[1];
            pathExpression=entry.getExpression();
            equal(62,pathExpression.getStartTokenIndex());
            equal(62,pathExpression.getEndTokenIndex());
            equal("elt2",pathExpression.getPathString(true));
            equal(entry.getAlias()==null,true);
            equal(62,entry.getStartTokenIndex());
            equal(62,entry.getEndTokenIndex());
            entry=entries[2];
            pathExpression=entry.getExpression();
            equal(64,pathExpression.getStartTokenIndex());
            equal(66,pathExpression.getEndTokenIndex());
            equal("elt3.structelt2",pathExpression.getPathString(true));
            equal(entry.getAlias()==null,true);
            equal(64,entry.getStartTokenIndex());
            equal(66,entry.getEndTokenIndex());
            var where = select.getWhere();
            equal(where!=null,true);
            equal(68,where.getStartTokenIndex());
            equal(86,where.getEndTokenIndex());
            var or = where.getExpression();
            equal(69,or.getStartTokenIndex());
            equal(86,or.getEndTokenIndex());
            equal(BooleanType.OR,or.getType());
            var orConds = or.getConditions();
            equal(2,orConds.length);
            var firstLeftBoolean = orConds[0];
            equal(69,firstLeftBoolean.getStartTokenIndex());
            equal(76,firstLeftBoolean.getEndTokenIndex());
            equal(BooleanType.AND,firstLeftBoolean.getType());
            var firstComp = firstLeftBoolean.getConditions()[0];
            equal(69,firstComp.getStartTokenIndex());
            equal(71,firstComp.getEndTokenIndex());
            equal("=",firstComp.getType());
            equal("elt1",(firstComp.getLeft()).getPathString(true));
            equal("10",(firstComp.getRight()).getToken());
            var notExpr = firstLeftBoolean.getConditions()[1];
            equal(73,notExpr.getStartTokenIndex());
            equal(76,notExpr.getEndTokenIndex());
            var not = notExpr.getCond();
            equal(74,not.getStartTokenIndex());
            equal(76,not.getEndTokenIndex());
            equal("<",not.getType());
            equal("elt2",(not.getLeft()).getPathString(true));
            equal("20",(not.getRight()).getToken());
            var rightAnd = orConds[1];
            equal(BooleanType.AND,rightAnd.getType());
            var firstRight = rightAnd.getConditions()[0];
            equal(">=",firstRight.getType());
            equal("elt2",(firstRight.getLeft()).getPathString(true));
            equal("20",(firstRight.getRight()).getToken());
            var secondRight = rightAnd.getConditions()[1];
            equal("=",secondRight.getType());
            equal("elt3.structelt3",(secondRight.getLeft()).getPathString(true));
            equal("'foobar'",(secondRight.getRight()).getToken());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsAnd = function() {
            var source = "context ctx { view MyView as select from test { ha } where a = b and c > d; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(BooleanType.AND,where.getType());
            var comp = where.getConditions()[1];
            equal(">",comp.getType());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsOr = function() {
            var source = "context ctx { view MyView as select from test { ha } where a < b or c <= d; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(BooleanType.OR,where.getType());
            var comp = where.getConditions()[1];
            equal("<=",comp.getType());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsOrOr = function() {
            var source = "context ctx { view MyView as select from test { ha } where a > b or c >= d or e <> f; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(BooleanType.OR,where.getType());
            where=where.getConditions()[0];
            equal(BooleanType.OR,where.getType());
            var comp = where.getConditions()[0];
            equal(">",comp.getType());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsAndAnd = function() {
            var source = "context ctx { view MyView as select from test { ha } where a > b and c >= d and e <> f; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(BooleanType.AND,where.getType());
            where=where.getConditions()[0];
            equal(BooleanType.AND,where.getType());
            var comp = where.getConditions()[0];
            equal(">",comp.getType());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsAndWBrackets = function() {
            var source = "context ctx { view MyView as select from test { ha } where a > b and ( c >= d and e <> f); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(BooleanType.AND,where.getType());
            where=where.getConditions()[1];
            equal(BooleanType.AND,where.getType());
            var comp = where.getConditions()[0];
            equal(">=",comp.getType());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsIsNull = function() {
            var source = "context ctx { view MyView as select from test { ha } where a is null; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(where.isNot(),false);
            equal(13,where.getStartTokenIndex());
            equal(15,where.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsIsNotNull = function() {
            var source = "context ctx { view MyView as select from test { ha } where a is not null; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var where = view.getSelect().getWhere().getExpression();
            equal(where.isNot(),true);
            equal(13,where.getStartTokenIndex());
            equal(16,where.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsNotBetween = function() {
            var source = "context ctx { view MyView as select from test { ha } where a not between 3 and 6;};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var not = view.getSelect().getWhere().getExpression();
            equal(13,not.getStartTokenIndex());
            equal(18,not.getEndTokenIndex());
            var between = not.getCond();
            equal(between!=null,true);
            equal("a",(between.getLeft()).getPathString(false));
            equal("3",(between.getLower()).getToken());
            equal("6",(between.getUpper()).getToken());
            equal(15,between.getStartTokenIndex());
            equal(18,between.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsBetween = function() {
            var source = "context ctx { view MyView as select from test { ha } where a between 3 and 6;};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var between = view.getSelect().getWhere().getExpression();
            equal(between!=null,true);
            equal("a",(between.getLeft()).getPathString(false));
            equal("3",(between.getLower()).getToken());
            equal("6",(between.getUpper()).getToken());
            equal(13,between.getStartTokenIndex());
            equal(17,between.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsLike = function() {
            var source = "context ctx { view MyView as select from test { ha } where a like 3; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var like = view.getSelect().getWhere().getExpression();
            equal(like!=null,true);
            equal(13,like.getStartTokenIndex());
            equal(15,like.getEndTokenIndex());
            equal(like.getEscapeToken()==null,true);
            equal("3",(like.getRight()).getToken());
            equal("a",(like.getLeft()).getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsNotLike = function() {
            var source = "context ctx { view MyView as select from test { ha } where a not like 3; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var not = view.getSelect().getWhere().getExpression();
            equal(13,not.getStartTokenIndex());
            equal(16,not.getEndTokenIndex());
            var like = not.getCond();
            equal(like!=null,true);
            equal(15,like.getStartTokenIndex());
            equal(16,like.getEndTokenIndex());
            equal(like.getEscapeToken()==null,true);
            equal("3",(like.getRight()).getToken());
            equal("a",(like.getLeft()).getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsNotLikeEscape = function() {
            var source = "context ctx { view MyView as select from test { ha } where a not like 3 escape 2; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var not = view.getSelect().getWhere().getExpression();
            equal(13,not.getStartTokenIndex());
            equal(18,not.getEndTokenIndex());
            var like = not.getCond();
            equal(like!=null,true);
            equal(15,like.getStartTokenIndex());
            equal(18,like.getEndTokenIndex());
            equal("2",like.getEscapeToken().m_lexem);
            equal("3",(like.getRight()).getToken());
            equal("a",(like.getLeft()).getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsIn = function() {
            var source = "context ctx { view MyView as select from test { ha } where a in (2); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var inExpr = view.getSelect().getWhere().getExpression();
            equal(inExpr!=null,true);
            equal(13,inExpr.getStartTokenIndex());
            equal(17,inExpr.getEndTokenIndex());
            equal("2",(inExpr.getIns()[0]).getToken());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsNotIn = function() {
            var source = "context ctx { view MyView as select from test { ha } where a not in (2); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var not = view.getSelect().getWhere().getExpression();
            var inExpr = not.getCond();
            equal(inExpr!=null,true);
            equal(13,not.getStartTokenIndex());
            equal(18,not.getEndTokenIndex());
            equal("2",(inExpr.getIns()[0]).getToken());
        };
        TestsUnitHanaDdlParser.prototype.whereClauseTestsInList = function() {
            var source = "context ctx { view MyView as select from test { ha } where a in (2,3,4,5); };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var context = compilationUnit.getStatements()[0];
            var view = context.getStatements()[0];
            var inExpr = view.getSelect().getWhere().getExpression();
            equal(inExpr!=null,true);
            equal(13,inExpr.getStartTokenIndex());
            equal(23,inExpr.getEndTokenIndex());
            equal("2",(inExpr.getIns()[0]).getToken());
            equal("3",(inExpr.getIns()[1]).getToken());
            equal("4",(inExpr.getIns()[2]).getToken());
            equal("5",(inExpr.getIns()[3]).getToken());
        };
        TestsUnitHanaDdlParser.prototype.groupByHavingOrder = function() {
            var source = "view MyView as select from Inner.MyEntity { elt1 as keyElt, elt2, elt3.structelt2  } WHERE elt1 = 1  GROUP BY elt1, elt2, elt3.structelt2 HAVING elt2 = 10 AND NOT elt2 < 20 OR elt2 >= 20 AND elt3.structelt3 = 'foobar'  ORDER by elt1 ASC NULLS FIRST, elt2 NULLS LAST, elt3.structelt2 DESC;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var view = compilationUnit.getStatements()[0];
            var select = view.getSelect();
            var groupBy = select.getGroupBy();
            equal(groupBy!=null,true);
            equal(23,groupBy.getStartTokenIndex());
            equal(31,groupBy.getEndTokenIndex());
            var entries = groupBy.getEntries();
            equal(3,entries.length);
            equal("elt1",(entries[0].getExpression()).getPathString(false));
            equal(25,entries[0].getStartTokenIndex());
            equal(25,entries[0].getEndTokenIndex());
            equal("elt2",(entries[1].getExpression()).getPathString(false));
            equal("elt3.structelt2",(entries[2].getExpression()).getPathString(false));
            var having = select.getHaving();
            equal(having!=null,true);
            equal(32,having.getStartTokenIndex());
            equal(50,having.getEndTokenIndex());
            var hav = having.getExpression();
            equal(hav!=null,true);
            equal(33,hav.getStartTokenIndex());
            equal(50,hav.getEndTokenIndex());
            var bo = hav;
            equal(BooleanType.OR,bo.getType());
            equal(33,bo.getStartTokenIndex());
            equal(50,bo.getEndTokenIndex());
            var orderBy = select.getOrderBy();
            equal(orderBy!=null,true);
            equal(51,orderBy.getStartTokenIndex());
            equal(65,orderBy.getEndTokenIndex());
            var orderByEntries = orderBy.getEntries();
            equal(3,orderByEntries.length);
            equal(53,orderByEntries[0].getStartTokenIndex());
            equal(56,orderByEntries[0].getEndTokenIndex());
            equal("elt2",(orderByEntries[1].getExpression()).getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.__getSource = function(name) {

            var s = getFileContent("./"+name);
            return s;

        };
        TestsUnitHanaDdlParser.prototype.astFromClauseSimpleTable = function() {
            var source = "view v as select from entity { column };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var view = compilationUnit.getStatements()[0];
            var select = view.getSelect();
            var from = select.getFrom();
            equal(from!=null,true);
            equal("entity",from.getName());
            equal(5,from.getStartTokenIndex());
            equal(5,from.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.astFromClauseSimpleTableWithAlias = function() {
            var source = "view v as select from entity as ali { column };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var view = compilationUnit.getStatements()[0];
            var select = view.getSelect();
            var from = select.getFrom();
            equal(from!=null,true);
            equal("entity",from.getName());
            equal("ali",from.getAlias());
            equal(5,from.getStartTokenIndex());
            equal(7,from.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.annotatedElementDeclaration = function() {
            var source = "entity en1 { @annot element1 : Integer; @annot2:value assoc  : ASSOCIATION to Entity1; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var attribute = entity.getElements()[0];
            var annotList = attribute.getAnnotationList();
            equal(1,annotList.length);
            equal("annot",annotList[0].getNameTokenPath()[0].m_lexem);
            var association = entity.getElements()[1];
            annotList=association.getAnnotationList();
            equal(1,annotList.length);
            equal("annot2",annotList[0].getNameTokenPath()[0].m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.annotatedTypeComponentDeclaration = function() {
            var source = "type en1 { @annot element1 : Integer;};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var ty = compilationUnit.getStatements()[0];
            var attribute = ty.getElements()[0];
            var annotList = attribute.getAnnotationList();
            equal(1,annotList.length);
            equal("annot",annotList[0].getNameTokenPath()[0].m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.orderSpec = function() {
            var source = "view MyView as select from Inner.MyEntity { elt1 } WHERE elt1 = 1  ORDER by a NULLS FIRST,b ASC,c DESC NULLS LAST;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var viewDef = compilationUnit.getStatements()[0];
            var entries = viewDef.getSelect().getOrderBy().getEntries();
            equal(3,entries.length);
            var entry = entries[0];
            equal(entry.getOrderSequenceToken()==null,true);
            equal("NULLS",entry.getNullsToken().m_lexem);
            equal("FIRST",entry.getNullsFirstLastToken().m_lexem);
            equal(17,entry.getStartTokenIndex());
            equal(19,entry.getEndTokenIndex());
            entry=entries[1];
            equal("ASC",entry.getOrderSequenceToken().m_lexem);
            equal(entry.getNullsToken()==null,true);
            equal(entry.getNullsFirstLastToken()==null,true);
            equal(21,entry.getStartTokenIndex());
            equal(22,entry.getEndTokenIndex());
            entry=entries[2];
            equal("DESC",entry.getOrderSequenceToken().m_lexem);
            equal("NULLS",entry.getNullsToken().m_lexem);
            equal("LAST",entry.getNullsFirstLastToken().m_lexem);
            equal(24,entry.getStartTokenIndex());
            equal(27,entry.getEndTokenIndex());
        };
        TestsUnitHanaDdlParser.prototype.aggregateFunction = function() {
            var source = "view v as select from table { a } where count( * ) = 1 and min( a.b.c ) = 2 and max( all c) = 3 and sum( distinct v.d) = 4 and avg(s) = 5 and stddev(s) = 6 and var(x)=7;";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var viewDef = compilationUnit.getStatements()[0];
            var and = viewDef.getSelect().getWhere().getExpression();
            var func = (and.getConditions()[1]).getLeft();
            equal(60,func.getStartTokenIndex());
            equal(63,func.getEndTokenIndex());
            equal("var",func.getFuncName());
            equal("x",(func.getParameter()).getPathString(false));
            equal(func.getDistinctToken()==null,true);
            equal(func.getAllToken()==null,true);
            and=and.getConditions()[0];
            func=(and.getConditions()[1]).getLeft();
            equal(53,func.getStartTokenIndex());
            equal(56,func.getEndTokenIndex());
            equal("stddev",func.getFuncName());
            equal("s",(func.getParameter()).getPathString(false));
            equal(func.getDistinctToken()==null,true);
            equal(func.getAllToken()==null,true);
            and=and.getConditions()[0];
            func=(and.getConditions()[1]).getLeft();
            equal(46,func.getStartTokenIndex());
            equal(49,func.getEndTokenIndex());
            equal("avg",func.getFuncName());
            equal("s",(func.getParameter()).getPathString(false));
            equal(func.getDistinctToken()==null,true);
            equal(func.getAllToken()==null,true);
            and=and.getConditions()[0];
            func=(and.getConditions()[1]).getLeft();
            equal(36,func.getStartTokenIndex());
            equal(42,func.getEndTokenIndex());
            equal("sum",func.getFuncName());
            equal("v.d",(func.getParameter()).getPathString(false));
            equal("distinct",func.getDistinctToken().m_lexem);
            equal(func.getAllToken()==null,true);
            and=and.getConditions()[0];
            func=(and.getConditions()[1]).getLeft();
            equal(28,func.getStartTokenIndex());
            equal(32,func.getEndTokenIndex());
            equal("max",func.getFuncName());
            equal("c",(func.getParameter()).getPathString(false));
            equal(func.getDistinctToken()==null,true);
            equal("all",func.getAllToken().m_lexem);
            and=and.getConditions()[0];
            func=(and.getConditions()[1]).getLeft();
            equal(17,func.getStartTokenIndex());
            equal(24,func.getEndTokenIndex());
            equal("min",func.getFuncName());
            equal("a.b.c",(func.getParameter()).getPathString(false));
            equal(func.getDistinctToken()==null,true);
            equal(func.getAllToken()==null,true);
            func=(and.getConditions()[0]).getLeft();
            equal(10,func.getStartTokenIndex());
            equal(13,func.getEndTokenIndex());
            equal("count",func.getFuncName());
            equal("*",(func.getParameter()).getToken());
            equal(func.getDistinctToken()==null,true);
            equal(func.getAllToken()==null,true);
        };
        TestsUnitHanaDdlParser.prototype.aggegrateFunctionInSelectList = function() {
            var source = "view v as select from t { count(*) as x,min( a.b.c ),max( all c),sum( distinct v.d),stddev(s),var(x),avg(min(nested))};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var viewDef = compilationUnit.getStatements()[0];
            var entries = viewDef.getSelect().getSelectList().getEntries();
            var entry = entries[0];
            equal(7,entry.getStartTokenIndex());
            equal(12,entry.getEndTokenIndex());
            var expression = entry.getExpression();
            equal(7,expression.getStartTokenIndex());
            equal(10,expression.getEndTokenIndex());
            equal("count",expression.getFuncName());
            equal("*",(expression.getParameter()).getToken());
            equal(expression.getDistinctToken()==null,true);
            equal(expression.getAllToken()==null,true);
            equal("x",entry.getAlias());
            entry=entries[1];
            equal(14,entry.getStartTokenIndex());
            equal(21,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(14,expression.getStartTokenIndex());
            equal(21,expression.getEndTokenIndex());
            equal("min",expression.getFuncName());
            equal("a.b.c",(expression.getParameter()).getPathString(false));
            equal(expression.getDistinctToken()==null,true);
            equal(expression.getAllToken()==null,true);
            equal(entry.getAlias()==null,true);
            entry=entries[2];
            equal(23,entry.getStartTokenIndex());
            equal(27,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(23,expression.getStartTokenIndex());
            equal(27,expression.getEndTokenIndex());
            equal("max",expression.getFuncName());
            equal("c",(expression.getParameter()).getPathString(false));
            equal(expression.getDistinctToken()==null,true);
            equal("all",expression.getAllToken().m_lexem);
            equal(entry.getAlias()==null,true);
            entry=entries[3];
            equal(29,entry.getStartTokenIndex());
            equal(35,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(29,expression.getStartTokenIndex());
            equal(35,expression.getEndTokenIndex());
            equal("sum",expression.getFuncName());
            equal("v.d",(expression.getParameter()).getPathString(false));
            equal("distinct",expression.getDistinctToken().m_lexem);
            equal(expression.getAllToken()==null,true);
            equal(entry.getAlias()==null,true);
            entry=entries[4];
            equal(37,entry.getStartTokenIndex());
            equal(40,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(37,expression.getStartTokenIndex());
            equal(40,expression.getEndTokenIndex());
            equal("stddev",expression.getFuncName());
            equal("s",(expression.getParameter()).getPathString(false));
            equal(expression.getDistinctToken()==null,true);
            equal(expression.getAllToken()==null,true);
            equal(entry.getAlias()==null,true);
            entry=entries[5];
            equal(42,entry.getStartTokenIndex());
            equal(45,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(42,expression.getStartTokenIndex());
            equal(45,expression.getEndTokenIndex());
            equal("var",expression.getFuncName());
            equal("x",(expression.getParameter()).getPathString(false));
            equal(expression.getDistinctToken()==null,true);
            equal(expression.getAllToken()==null,true);
            equal(entry.getAlias()==null,true);
            entry=entries[6];
            equal(47,entry.getStartTokenIndex());
            equal(53,entry.getEndTokenIndex());
            expression=entry.getExpression();
            equal(47,expression.getStartTokenIndex());
            equal(53,expression.getEndTokenIndex());
            equal("avg",expression.getFuncName());
            var param = expression.getParameter();
            equal("min",param.getFuncName());
            equal(expression.getDistinctToken()==null,true);
            equal(expression.getAllToken()==null,true);
            equal(entry.getAlias()==null,true);
        };
        TestsUnitHanaDdlParser.prototype.onConditionInAssociationDeclaration = function() {
            var source = "entity en { assoc: association to fritz on a.b = b.c; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var assoc = entity.getElements()[0];
            var on = assoc.getOnExpression();
            equal("a.b",(on.getLeft()).getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.usingDirective = function() {
            var source = "namespace a.b.c1; using aa.b.cc::cd.de.ef;  USING efg::x as alias; context ctx { };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var using = compilationUnit.getStatements()[1];
            equal(7,using.getStartTokenIndex());
            equal(19,using.getEndTokenIndex());
            equal("aa.b.cc.cd.de.ef",using.getNamePath().getPathString(false));
            equal(using.getAlias()==null,true);
            using=compilationUnit.getStatements()[2];
            equal(20,using.getStartTokenIndex());
            equal(26,using.getEndTokenIndex());
            equal("efg.x",using.getNamePath().getPathString(false));
            equal("alias",using.getAlias().m_lexem);
        };
        TestsUnitHanaDdlParser.prototype.usingDirectiveWithTypeNamespaceContainingDecimalLongIntEndCharacter = function() {
            var source = "namespace a.b.c1; using a.b.c::d.e.f.m.l; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            equal(compilationUnit!=null,true);
            var ud = compilationUnit.getStatements()[1];
            equal("a.b.c.d.e.f.m.l",ud.getName());
        };
        TestsUnitHanaDdlParser.prototype.elementDeclarationModifiers = function() {
            var source = "entity entity { key k : integer; nullable : integer null; not_nullable : integer not null; default : integer default 3; nullable_default : integer default 3 null; not_nullable_default : integer not null default 3; };";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var elements = entity.getElements();
            var noNullNoDefault = elements[0];
            equal("k",noNullNoDefault.getName());
            equal(noNullNoDefault.getKeyToken()!=null,true);
            equal(noNullNoDefault.getNotToken()==null,true);
            equal(noNullNoDefault.getNullableToken()==null,true);
            equal(noNullNoDefault.getDefault()==null,true);
            var nullable = elements[1];
            equal("nullable",nullable.getName());
            equal(nullable.getKeyToken()==null,true);
            equal(nullable.getNotToken()==null,true);
            equal("null",nullable.getNullableToken().m_lexem);
            equal(nullable.getDefault()==null,true);
            var notNullable = elements[2];
            equal("not_nullable",notNullable.getName());
            equal(notNullable.getKeyToken()==null,true);
            equal("not",notNullable.getNotToken().m_lexem);
            equal("null",notNullable.getNullableToken().m_lexem);
            equal(notNullable.getDefault()==null,true);
            var def = elements[3];
            equal("default",def.getName());
            equal(def.getKeyToken()==null,true);
            equal(def.getNotToken()==null,true);
            equal(def.getNullableToken()==null,true);
            equal(def.getDefault()!=null,true);
            var nullable_default = elements[4];
            equal("nullable_default",nullable_default.getName());
            equal(nullable_default.getKeyToken()==null,true);
            equal(nullable_default.getNotToken()==null,true);
            equal("null",nullable_default.getNullableToken().m_lexem);
            equal(nullable_default.getDefault()!=null,true);
            var not_nullable_default = elements[5];
            equal("not_nullable_default",not_nullable_default.getName());
            equal(not_nullable_default.getKeyToken()==null,true);
            equal("not",not_nullable_default.getNotToken().m_lexem);
            equal("null",not_nullable_default.getNullableToken().m_lexem);
            equal(not_nullable_default.getDefault()!=null,true);
        };
        TestsUnitHanaDdlParser.prototype.typeUtcTimestamp = function() {
            var source = "entity entity { key k : utctimestamp; b : utctimestamp(1,2);};";
            var compilationUnit = this.parseSourceAndGetAst(source);
            this.assertNoErrorTokens(compilationUnit.getTokenList());
            var entity = compilationUnit.getStatements()[0];
            var elements = entity.getElements();
            equal("utctimestamp",elements[0].getTypeIdPath().getPathString(false));
        };
        TestsUnitHanaDdlParser.prototype.doubleQuotes = function() {
            var source = "define entity ent1{ \"das ist ein test\" : String(10);   \"quoted_string_in_id\"\"doesn't_word\" : String(10); }; ";
            var ast = this.parseSourceAndGetAst(source);
            var tokens = ast.getTokenList();
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposesPrimitiveTypes = function() {
            var source = "entity ent { elem : ";
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source, 1,
                source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "Binary(len)"),true);
            equal(rnd.Utils.arrayContains(completions, "BinaryFloat"),true);
            equal(rnd.Utils.arrayContains(completions, "Decimal(precision, scale)"),true);
            equal(rnd.Utils.arrayContains(completions, "DecimalFloat"),true);
            equal(rnd.Utils.arrayContains(completions, "Integer"),true);
            equal(rnd.Utils.arrayContains(completions, "Integer64"),true);
            equal(rnd.Utils.arrayContains(completions, "LargeBinary"),true);
            equal(rnd.Utils.arrayContains(completions, "LargeString"),true);
            equal(rnd.Utils.arrayContains(completions, "LocalDate"),true);
            equal(rnd.Utils.arrayContains(completions, "LocalTime"),true);
            equal(rnd.Utils.arrayContains(completions, "String(len)"),true);
            equal(rnd.Utils.arrayContains(completions, "UTCDateTime"),true);
            equal(rnd.Utils.arrayContains(completions, "UTCTimestamp"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposesOnlyMatchingPrimitiveTypes = function() {
            var source = "entity ent { elem : in";
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source, 1,
                source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "Integer"),true);
            equal(rnd.Utils.arrayContains(completions, "Integer64"),true);
        };
        TestsUnitHanaDdlParser.prototype.proposeLocalContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context melch2 { " + //
                " type my : x#selection.begin.one##selection.end.one#; " + //
                " context x3 { " + //
                " type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " el1 : Integer; " + //
                " el2 : Integer; " + //
                " el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " type ty_nested : String(10); " + //
                " entity entity1 { " + //
                " key key : integer; " + //
                " element1 : ty_nested; " + //
                " }; " + //
                " }; " + //
                " }; " + //
                " }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "x3.ty"),true);
            equal(rnd.Utils.arrayContains(completions, "x3"),true);
        };
        TestsUnitHanaDdlParser.prototype.proposeLocalContexts2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context melch2 { " + //
                " type my : x#selection.begin.one##selection.end.one#; " + //
                " context c3 { " + //
                " type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " el1 : Integer; " + //
                " el2 : Integer; " + //
                " el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " context xnested1 { " + //
                " context xnested2 { " + //
                " type ty_nested : String(10); " + //
                " entity entity1 { " + //
                " key key : integer; " + //
                " element1 : ty_nested; " + //
                " }; " + //
                " }; " + //
                " }; " + //
                " }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "xnested1.xnested2.ty_nested"),true);
            equal(rnd.Utils.arrayContains(completions, "xnested1"),true);
            equal(rnd.Utils.arrayContains(completions, "xnested1.xnested2"),true);
        };
        TestsUnitHanaDdlParser.prototype.proposeLocalContexts3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context melch2 { " + //
                " type my : n; " + //
                " context c3 { " + //
                " type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " el1 : Integer; " + //
                " el2 : Integer; " + //
                " el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " context xnested1 { " + //
                "  type t : x#selection.begin.one##selection.end.one#;" + //
                " context xnested2 { " + //
                " type ty_nested : String(10); " + //
                " entity entity1 { " + //
                " key key : integer; " + //
                " element1 : ty_nested; " + //
                " }; " + //
                " }; " + //
                " }; " + //
                " }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "xnested2.ty_nested"),true);
            equal(rnd.Utils.arrayContains(completions, "xnested1"),true);
            equal(rnd.Utils.arrayContains(completions, "xnested2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoUserDefinedTypes = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context melch2 { " + //
                " type my : x#selection.begin.one##selection.end.one#; " + //
                " context c3 { " + //
                " type xty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " el1 : Integer; " + //
                " el2 : Integer; " + //
                " el3 : type of struc.el2; " + //
                " }; " + //
                " type xty2 : String(2); " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " type xty_nested : String(10); " + //
                " entity entity1 { " + //
                " key key : integer; " + //
                " element1 : ty_nested; " + //
                " }; " + //
                " }; " + //
                " }; " + //
                " }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "c3.xty"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested2.xty_nested"),true);
            equal(rnd.Utils.arrayContains(completions, "xty2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoPathStartingWithContext = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : melch2.#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[my, struc, ty2, c3, nested1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoPathStartingWithContext2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : melch2.n#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "nested1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoPathStartingWithContext3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : melch2.nested1.#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[nested2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoPathStartingWithContext4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : melch2.nested1.nested2.#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[ty_nested]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoPathStartingWithContext5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : melch2.nested1.nested2#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "nested2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoPathResolveStructuredType = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : type of melch2.ty3.#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " type ty3 : struc; " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, el2, el3]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoPathResolveStructuredType2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                "  type my : type of melch2.ty3.el3#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " type ty3 : struc; " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		};" + //
                " 	};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "el3"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoPathResolveStructuredType2Nested = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace cd9; " + //
                "context melch2 { " + //
                " type struc { el3aaaa : Integer; }; " + //
                " context nested { " + //
                "  type my : type of melch2.nested.ty3.el3#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : Integer; " + //
                " 	el3 : type of struc.el2; " + //
                " }; " + //
                " type ty2 : String(2); " + //
                " type ty3 : struc; " + //
                " }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "el3"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : #selection.begin.one##selection.end.one#struc2; " + //
                "el6 : melch2. " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Integer"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2#selection.begin.one##selection.end.one#; " + //
                "el6 : melch2. " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : melch2.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[my, struc, struc2, ty2, ty3, ty4, c3, nested1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : melch2.str#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "struc"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : type of melch2.struc.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, el2, el3, el4, el5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery6 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : type of melch2.struc.el5.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struc2a, struc2b]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery7 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : type of melch2.struc.el4.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, el2, el3, el4, el5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery8 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : melch2.struc.el4; " + //
                "context c3 { " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "el1 : Integer; " + //
                "el2 : ty4; " + //
                "el3 : type of struc.el2; " + //
                "el4 : ty3; " + //
                "el5 : struc2; " + //
                "el6 : type of melch2.struc.el4.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type struc2 { " + //
                "struc2a : Integer; " + //
                "struc2b : Integer; " + //
                "}; " + //
                "type ty3 : ty3a; " + //
                "type ty3a : struc; " + //
                "type ty4 : String(1); " + //
                "type ty2 : String(2); " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type ty_nested : String(10); " + //
                "entity entity1 { " + //
                "key key : Integer; " + //
                "element1 : ty_nested; " + //
                "}; }; }; }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, el2, el3, el4, el5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoElementTypeErrorRecovery9 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "type my : type of melch2.struc.el5.#selection.begin.one##selection.end.one# " + //
                "context c3 {  " + //
                "type ty : Integer ; " + //
                "}; " + //
                "type struc { " + //
                "	el1 : Integer; " + //
                "	el2 : ty4; " + //
                "	el3 : type of struc.el2; " + //
                "	el4 : ty3; " + //
                "	el5 : struc2;  " + //
                "	el6 : melch2.struc.el4. " + //
                "}; " + //
                "type struc2 { " + //
                "	struc2a : Integer; " + //
                "	struc2b : Integer; " + //
                "}; " + //
                " type ty3 : ty3a; " + //
                " type ty3a : struc; " + //
                " type ty4 : String(1); " + //
                " type ty2 : String(2); " + //
                "	context nested1 { " + //
                "		context nested2 { " + //
                "			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                "				key key : Integer; " + //
                "				element1 : ty_nested; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struc2a, struc2b]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType1 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "  type my : type of melch2.#selection.begin.one##selection.end.one# " + //
                " context c3 { " + //
                " 	type ty : Integer ; " + //
                " }; " + //
                " type struc { " + //
                " 	el1 : Integer; " + //
                " 	el2 : ty4; " + //
                " 	el3 : type of struc.el2; " + //
                " 	el5 : struc2; " + //
                " }; " + //
                " type struc2 { " + //
                " 	struc2a : Integer; " + //
                " 	struc2b : Integer; " + //
                " }; " + //
                " type struc3 { " + //
                " 	f1 : Integer; " + //
                " }; " + //
                "  type ty3 : ty3a; " + //
                "  type ty3a : struc; " + //
                "  type ty4 : String(1); " + //
                " type ty2 : String(2); " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			type ty_nested : String(10); " + //
                " 			entity entity1 { " + //
                " 				key key : Integer; " + //
                " 				element1 : ty_nested; " + //
                " 			}; " + //
                " 		}; " + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struc, struc2, struc3, c3, nested1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of #selection.begin.one##selection.end.one#   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[entity, nested1.nested2.entity1, struc, struc2, struc3, c3, melch2, nested1, nested1.nested2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of entity.#selection.begin.one##selection.end.one#   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[key]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of melch2.entity.#selection.begin.one##selection.end.one#   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[key]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of nested1.nested2.entity1.#selection.begin.one##selection.end.one#   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[element1, key]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType6 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of struc.#selection.begin.one##selection.end.one#   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, el2, el3, el5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType7 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of struc;   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.e#selection.begin.one##selection.end.one#l2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : Integer;" + //
                " };" + //
                " " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "el1"),true);
            equal(rnd.Utils.arrayContains(completions, "el2"),true);
            equal(rnd.Utils.arrayContains(completions, "el3"),true);
            equal(rnd.Utils.arrayContains(completions, "el5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfSimpleType8 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1;" + //
                "context melch2 {" + //
                "	" + //
                "  type my : type of struc;   " + //
                "	" + //
                " context c3 { " + //
                " " + //
                " 	type ty : Integer ;" + //
                " };" + //
                "  " + //
                " type struc {" + //
                " 	el1 : Integer;" + //
                " 	el2 : ty4;" + //
                " 	el3 : type of struc.el2;" + //
                " 	el5 : struc2; " + //
                " };" + //
                " " + //
                " type struc2 {" + //
                " 	struc2a : Integer;" + //
                " 	struc2b : Integer;" + //
                " };" + //
                " " + //
                " type struc3 {" + //
                " 	f1 : Integer;" + //
                " };" + //
                "  type ty3 : ty3a;" + //
                "  type ty3a : struc;" + //
                "  type ty4 : String(1);" + //
                "  " + //
                " type ty2 : String(2);" + //
                " 	context nested1 {" + //
                " 		context nested2 {" + //
                " 			type ty_nested : String(10);" + //
                " 			entity entity1 {" + //
                " 				key key : Integer;" + //
                " 				element1 : ty_nested;" + //
                " 			};" + //
                " 		};" + //
                " 	};" + //
                "  " + //
                " entity entity {" + //
                " 	key key : type of #selection.begin.one##selection.end.one#" + //
                " };" + //
                " entity en3 {" + //
                " 	key key:Integer;" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[en3, entity, nested1.nested2.entity1, struc, struc2, struc3, c3, melch2, nested1, nested1.nested2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationTo = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace testMb; " + //
                "context test { " + //
                "	type ty2 : test.ty1 ; " + //
                "	type ty1 : Integer; " + //
                "	entity ent2 { " + //
                "		e1 : Integer; " + //
                "	}; " + //
                "  define view v1 as select from ent2 { e1 }; " + //
                "	define entity ent1{   " + //
                "	  key e1 : Integer; " + //
                "	  e1_5 : type of ent2.e1; " + //
                "	  e1_6: association to #selection.begin.one##selection.end.one# " + //
                "	   e2 : UTCTimestamp; " + //
                "	}; " + //
                "	error " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[ent1, ent2, v1, test]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationToPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity3 {" + //
                " 	key key : Integer;" + //
                " 	ass : association to test.en#selection.begin.one##selection.end.one#" + //
                " };" + //
                " " + //
                "  entity entity4 {" + //
                " 	key key : Integer;" + //
                " 	asso1 : association to entity1;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "entity3"),true);
            equal(rnd.Utils.arrayContains(completions, "entity4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationToPath2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity3 { " + //
                " 	key key : Integer;" + //
                " 	ass : association to test.entity4.asso5.a#selection.begin.one##selection.end.one#" + //
                " };" + //
                " " + //
                "  entity entity4 {" + //
                " 	key key : Integer;" + //
                " 	asso5 : association to entity5;" + //
                " };" + //
                " " + //
                " entity entity5 {" + //
                " 	key key : Integer;" + //
                " 	asso4 : association to entity4;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationToPath3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity3 { " + //
                " 	key key : Integer;" + //
                " 	ass : association to test.entity4.asso5.a#selection.begin.one##selection.end.one#" + //
                " };" + //
                " " + //
                "  entity entity4 {" + //
                " 	key key : Integer;" + //
                " 	asso5 : association to test.entity5;" + //
                " };" + //
                " " + //
                " entity entity5 {" + //
                " 	key key : Integer;" + //
                " 	asso4 : association to entity4;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationToPath4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity3 { " + //
                " 	key key : Integer;" + //
                " 	ass : association to test.entity4.asso5.a#selection.begin.one##selection.end.one#" + //
                " };" + //
                " " + //
                "  entity entity4 {" + //
                " 	key key : Integer;" + //
                " 	asso5 : association to test.entity5.asso4;" + //
                " };" + //
                " " + //
                " entity entity5 {" + //
                " 	key key : Integer;" + //
                " 	asso4 : association to entity4;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationToPath5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity3 { " + //
                " 	key key : Integer;" + //
                " 	ass : association to test.entity4.asso5.#selection.begin.one##selection.end.one#;" + //
                " };" + //
                " " + //
                "  entity entity4 {" + //
                " 	key key : Integer;" + //
                " 	asso5 : association to test.entity5.asso4;" + //
                " };" + //
                " " + //
                " entity entity5 {" + //
                " 	key key : Integer;" + //
                " 	asso4 : association to entity4;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[asso5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfProposesAssociation = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test { entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	sdd : type of test.entity5.asso4.#selection.begin.one##selection.end.one#" + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                " " + //
                " entity entity5 { " + //
                " 	key key5 : Integer;" + //
                " 	asso4 : association to test.entity4;" + //
                " }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[asso5, key4]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeDataSourceViewDefinition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test {  " + //
                "entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                " " + //
                " entity entity5 {" + //
                " 	key key5 : Integer;" + //
                " 	asso4 : association to test.entity4; " + //
                " };" + //
                " " + //
                " define view v1 as select from entity4 { key }; " + //
                " define view v as select from #selection.begin.one##selection.end.one#   };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "entity4"),true);
            equal(rnd.Utils.arrayContains(completions, "entity5"),true);
            equal(rnd.Utils.arrayContains(completions, "v"),false);
            equal(rnd.Utils.arrayContains(completions, "v1"),true);
            equal(rnd.Utils.arrayContains(completions, "test"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeDataSourceWithPathViewDefinition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test {  " + //
                "entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                " " + //
                " entity entity5 {" + //
                " 	key key5 : Integer;" + //
                " 	asso4 : association to test.entity4; " + //
                " };" + //
                " " + //
                " define view v1 as select from entity4 { key }; " + //
                " define view v as select from test.#selection.begin.one##selection.end.one#   };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[entity4, entity5, v, v1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeDataSourceWithPath2ViewDefinition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test {  " + //
                "entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                " " + //
                " entity entity5 {" + //
                " 	key key5 : Integer;" + //
                " 	asso4 : association to test.entity4; " + //
                " };" + //
                " " + //
                " define view v as select from test.entity4.#selection.begin.one##selection.end.one#   };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[asso5]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoDefineViewFromErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test {  " + //
                "define view v1 as select from #selection.begin.one##selection.end.one#  {" + //
                " 	key,sdsdsd error  sdvdsvdsv 	 " + //
                " define view v2 as select from entity3.ass { " + //
                "   k" + //
                " };" + //
                " " + //
                "      entity below { " + //
                " 	key kkkk : Integer;" + //
                " };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "below"),true);
            equal(rnd.Utils.arrayContains(completions, "v1"),false);
            equal(rnd.Utils.arrayContains(completions, "v2"),true);
            equal(rnd.Utils.arrayContains(completions, "test"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectList = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                " define view v1 as select from melch2.entity3.ass  { " + //
                " 	k#selection.begin.one##selection.end.one#ey_v1  " + //
                " 	}; " + //
                " " + //
                " define view v1 as select from melch2.entity3  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1 as select from melch2.v1  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1a as select from v1  { " + //
                " 	key  	 	 " + //
                " " + //
                " define view v2 as select from entity3.ass { " + //
                "   k" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListBeforeAlias = function() {
            var sourceWithSelections = //
                "namespace playground.melcher;                                                                    " + //
                "context cctest0003 {                                                                             " + //
                "  define entity e1{                                                                              " + //
                "	key k1: Integer;                                                                              " + //
                "	f1 : String(20);                                                                              " + //
                "  };                                                                                             " + //
                "  define view view_with_assoc as select from e1                                                  " + //
                "  {                                                                                       " + //
                "    e1.k1 #selection.begin.one##selection.end.one#as  										  " + //
                "  };                                                                                              " + //
                "};                                                                                                ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),false);
            equal(rnd.Utils.arrayContains(completions, "k1"),false);
            equal(rnd.Utils.arrayContains(completions, "f1"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListAfterAlias = function() {
            var sourceWithSelections = //
                "namespace playground.melcher;                                                                    " + //
                "context cctest0003 {                                                                             " + //
                "  define entity e1{                                                                              " + //
                "	key k1: Integer;                                                                              " + //
                "	f1 : String(20);                                                                              " + //
                "  };                                                                                             " + //
                "  define view view_with_assoc as select from e1                                                  " + //
                "  {                                                                                       " + //
                "    e1.k1 as #selection.begin.one##selection.end.one#  										  " + //
                "  };                                                                                              " + //
                "};                                                                                                ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),false);
            equal(rnd.Utils.arrayContains(completions, "k1"),false);
            equal(rnd.Utils.arrayContains(completions, "f1"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectList2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                " define view v1 as select from melch2.entity3.ass  { " + //
                " 	key_v1  " + //
                " 	}; " + //
                " " + //
                " define view v1 as select from melch2.entity3  { " + //
                " 	k#selection.begin.one##selection.end.one#ey " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1 as select from melch2.v1  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1a as select from v1  { " + //
                " 	key  	 	 " + //
                " " + //
                " define view v2 as select from entity3.ass { " + //
                "   k" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key3"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectList3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                " define view v1 as select from melch2.entity3.ass  { " + //
                " 	key_v1  " + //
                " 	}; " + //
                " " + //
                " define view v1 as select from melch2.entity3  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1 as select from melch2.v1  { " + //
                " 	k#selection.begin.one##selection.end.one#ey " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1a as select from v1  { " + //
                " 	key  	 	 " + //
                " " + //
                " define view v2 as select from entity3.ass { " + //
                "   k" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key_v1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectList4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                " define view v1 as select from melch2.entity3.ass  { " + //
                " 	key_v1  " + //
                " 	}; " + //
                " " + //
                " define view v1 as select from melch2.entity3  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1 as select from melch2.v1  { " + //
                " 	key " + //
                " 	}; " + //
                " 	" + //
                " 	define view v1a as select from v1  { " + //
                " 	k#selection.begin.one##selection.end.one#ey  	 	 " + //
                " " + //
                " define view v2 as select from entity3.ass { " + //
                "   k" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key_v1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListLongerPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity3  {  " + //
                "ass.asso5.asso4.asso5.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListAgg = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity3  {  " + //
                "sum( as#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "ass"),true);
            equal(rnd.Utils.arrayContains(completions, "ascii("),true);
            equal(rnd.Utils.arrayContains(completions, "asin("),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListWithQualifiedPath1 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity employee { " + //
                " 	key id : Integer; " + //
                " 	name : String(10); " + //
                " 	homeaddress : association to address; " + //
                " }; " + //
                "  " + //
                "  entity address { " + //
                " 	key streetAddress : String(20); " + //
                " 	city : String(20); " + //
                " }; " + //
                "  " + //
                "define view v1 as select from employee {  " + //
                "employee.#selection.begin.one##selection.end.one# " + //
                " }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "homeaddress"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
            equal(rnd.Utils.arrayContains(completions, "name"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListWithQualifiedPath2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity employee { " + //
                " 	key id : Integer; " + //
                " 	name : String(10); " + //
                " 	homeaddress : association to address; " + //
                " }; " + //
                "  " + //
                "  entity address { " + //
                " 	key streetAddress : String(20); " + //
                " 	city : String(20); " + //
                " }; " + //
                "  " + //
                "define view v1 as select from employee {  " + //
                "employee.homeaddress.#selection.begin.one##selection.end.one# " + //
                " }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "city"),true);
            equal(rnd.Utils.arrayContains(completions, "streetAddress"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionSelectListPredicateLeftExpr = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity4  { " + //
                "k#selection.begin.one##selection.end.one# as al " + //
                " } where " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionWhereClause = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity4  { " + //
                "key as al " + //
                " } where ke#selection.begin.one##selection.end.one# " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "key4"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionWhereClausePath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity4  { " + //
                "key as al " + //
                " } where a = asso5.#selection.begin.one##selection.end.one# " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionGroupBy = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity4  { " + //
                "key as al " + //
                " } where a = 2 group by asso5.#selection.begin.one##selection.end.one# " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionGroupByResolveAsso = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                " entity entity5 { id : Integer; }; " + //
                " context nested { " + //
                " entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.nested.entity4  { " + //
                "key as al " + //
                " } where a = 2 group by asso5.#selection.begin.one##selection.end.one# " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionOrderBy = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context melch2 {  " + //
                "entity entity3 { " + //
                " 	key key3 : Integer; " + //
                " 	ass : association to melch2.entity4.asso5.asso4.asso5.asso4; " + //
                " }; " + //
                "  " + //
                "  entity entity4 { " + //
                " 	key key4 : Integer; " + //
                " 	asso5 : association to entity5; " + //
                " }; " + //
                "  " + //
                " entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to melch2.entity4; " + //
                " }; " + //
                "  " + //
                "define view v1 as select from melch2.entity4  { " + //
                "key as al " + //
                " } where a = 2 order by asso5.#selection.begin.one##selection.end.one# " + //
                "define view v1 as select from melch2.entity3  { " + //
                "ass.asso5.asso4.asso5.key5 " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "al"),true);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDefinitionHaving = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context mm1 {" + //
                "  entity entity1 {" + //
                " 	 key key1 : Integer;" + //
                " 	 el1 : Integer;" + //
                "  };" + //
                "" + //
                "  define view v1 as select from mm1.entity1 {" + //
                "  } where key1 = 42 group by el1 having #selection.one#" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "key1"),true);
            equal(rnd.Utils.arrayContains(completions, "el1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeResolvement = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1.tm1; " + //
                "context using1 { " + //
                "	type myType { " + //
                "		struc1 : Integer; " + //
                "		struc2 : Integer; " + //
                "		struc3 : myType2; 	 	}; " + //
                " 	type myType2 { " + //
                "		aa : Integer; " + //
                "		bb : myType3; " + //
                "	}; " + //
                "	type myType3 { " + //
                "		qq : using1.myType; " + //
                "	 	}; " + //
                "	 type hugo: type of using1.myType.struc3.bb.qq.#selection.begin.one##selection.end.one#  }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.resolveLocalElementCompilerNameResolution = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context local_duplicates { " + //
                "	type struc { " + //
                "		struca : Integer; " + //
                "	}; " + //
                "	type myelem { " + //
                "		a : struc; " + //
                "	}; " + //
                "	entity dup { " + //
                "		key k : Integer; " + //
                "		use: type of myelem.#selection.begin.one##selection.end.one# <> ; " + //
//				"		use: type of myelem.#selection.begin.one##selection.end.one#  " + //
                "		myelem : struc; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struca]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.resolveLocalElementNestedContextCompilerNameResolution = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context local_duplicates { " + //
                "	type struc { " + //
                "		struca : Integer; " + //
                "	}; " + //
                "	context nested { " + //
                "		type myelem { " + //
                "			a : struc; " + //
                "		}; " + //
                "		entity dup { " + //
                "			key k : Integer; " + //
                "			use: type of myelem.#selection.begin.one##selection.end.one#  <> ; " + //
                "			myelem : struc; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struca]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.resolveTypeElementCompilerNameResolution = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context local_duplicated2 { " + //
                " 	type my_struc { " + //
                " 		a : Integer; " + //
                " 		b : Integer; " + //
                " 	}; " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                "	 		type my_struc { " + //
                "	 			m1 : Integer; " + //
                "	 			m2 : Integer; " + //
                "	 		};	 " + //
                " 			type en {  " + //
                " 				id : Integer; " + //
                " 				struc : type of  my_struc.#selection.begin.one##selection.end.one#   " + //
                " 			}; " + //
                " 		}; " + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[m1, m2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.resolveTypeElementAttributeCompilerNameResolution = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1.tm1; " + //
                "context local_duplicated2 { " + //
                " 	type my_struc { " + //
                " 		a : Integer; " + //
                " 		b : Integer; " + //
                " 	}; " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                "	 		type my_struc { " + //
                "	 			m1 : Integer; " + //
                "	 			m2 : Integer; " + //
                "	 		};	 " + //
                " 			type en {  " + //
                " 				id : my_struc; " + //
                " 				struc : type of  id.#selection.begin.one##selection.end.one#   " + //
                " 			}; " + //
                " 		}; " + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[m1, m2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.resolveTypeIncorrectSourceRegardingCompilerRules = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context local_duplicates4 { " + //
                " 	context nested1 { " + //
                " 		context nested2 { " + //
                " 			entity en { " + //
                " 				key id : Integer; " + //
                " 				struc : type of mystruc.#selection.begin.one##selection.end.one# " + //
                " 			}; " + //
                " 		}; " + //
                " 	}; " + //
                " 	context n2 { " + //
                " 		context n3 { " + //
                " 			type mystruc { " + //
                " 				a : Integer; " + //
                " 				b : Integer; " + //
                " 			}; " + //
                " 		};" + //
                " 	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[a, b]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalEntityElements = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context local_entity_elements { " + //
                "	entity en { " + //
                "		key id : Integer; " + //
                "		t1a : type of #selection.begin.one##selection.end.one#  " + //
                "		t1 : Integer; " + //
                "		t2 : Integer; " + //
                "		t3 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[en, id, t1, t2, t3, local_entity_elements]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalEntityNamesSameEntityNameInDifferentContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace playground.melcher;          " + //
                "context cctest0003 {                   " + //
                "    entity meins {                     " + //
                "    };                                 " + //
                "    context nested {                   " + //
                "        entity meins {                 " + //
                "                CDDD : association to #selection.begin.one##selection.end.one# " + //
                "                };                     " + //
                "    };                                 " + //
                "}				                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.meins"),true);
            equal(rnd.Utils.arrayContains(completions, "meins"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalSimpleTypeNamesSameSimpleTypeNameInDifferentContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace playground.melcher;          " + //
                "context cctest0003 {                   " + //
                "    type meins : Integer;              " + //
                "    context nested {                   " + //
                "        type meins : Integer;          " + //
                "        entity e {                 " + //
                "                CDDD : m#selection.begin.one##selection.end.one# " + //
                "                };                     " + //
                "    };                                 " + //
                "}				                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.meins"),true);
            equal(rnd.Utils.arrayContains(completions, "meins"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalStructuredTypeNamesSameStructuredTypeNameInDifferentContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace playground.melcher;          " + //
                "context cctest0003 {                   " + //
                "    type meins { a : Integer; b : Integer; };              " + //
                "    context nested {                   " + //
                "        type meins { a : Integer; b : Integer; };         " + //
                "        entity e {                 " + //
                "                CDDD : m#selection.begin.one##selection.end.one# " + //
                "                };                     " + //
                "    };                                 " + //
                "}				                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.meins"),true);
            equal(rnd.Utils.arrayContains(completions, "meins"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalViewNamesSameViewNameInDifferentContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace playground.melcher;          " + //
                "context cctest0003 {                   " + //
                "    view view as select from meins { s};              " + //
                "    context nested1 {" + //
                "       view view as select from meins { s};" + //
                "    };" + //
                "    context nested {                   " + //
                "        view view as select from meins { s};         " + //
                "        entity e {                 " + //
                "                CDDD : association to v#selection.begin.one##selection.end.one# " + //
                "                };                     " + //
                "    };                                 " + //
                "}				                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.view"),true);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.nested1.view"),true);
            equal(rnd.Utils.arrayContains(completions, "view"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoMultipleLocalEntityNamesSameEntityNameInDifferentContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace playground.melcher;          " + //
                "context cctest0003 {                   " + //
                "    context nested1 {                  " + //
                "        entity meins {                 " + //
                "        };                             " + //
                "    };                                 " + //
                "    entity meins {                     " + //
                "    };                                 " + //
                "    context nested {                   " + //
                "        entity meins {                 " + //
                "                CDDD : association to #selection.begin.one##selection.end.one# " + //
                "                };                     " + //
                "    };                                 " + //
                "}				                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.meins"),true);
            equal(rnd.Utils.arrayContains(completions, "meins"),true);
            equal(rnd.Utils.arrayContains(completions, "cctest0003.nested1.meins"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoNestedContext = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context nested { " + //
                "context nested_1 { " + //
                "context nested_2 { " + //
                "	type struc { " + //
                "		a : Integer; " + //
                "		b : Integer; " + //
                "	}; " + //
                "	context nested_3 { " + //
                "		context nested_4 { " + //
                "			entity en { " + //
                "				field : nested_2.#selection.begin.one##selection.end.one# " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[struc, nested_3]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoLocalNameResolution = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context SalesOrder { " + //
                " 	entity SalesOrder { " + //
                " 		key id : Integer; " + //
                " 		item : association to SalesOrderItem; " + //
                " 	}; " + //
                " 	entity SalesOrderItem { " + //
                " 		price : Integer; " + //
                " 		product:association to Product; " + //
                " 	}; " + //
                " 	entity Product { " + //
                " 		name : String(10); " + //
                " 	}; " + //
                " 	define view v as select from SalesOrder { " + //
                " 		id, item.product.#selection.begin.one##selection.end.one# " + //
                " 		" + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "name"),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoverySelectListEntry = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using2 { " + //
                " " + //
                "entity en1 { " + //
                "key id : Integer; " + //
                "assoc_to_en1_1 : association to nested_en1; " + //
                "}; " + //
                "entity nested_en1 { " + //
                "key id : Integer; " + //
                "assoc_to_entity5 : association to entity5; " + //
                "};" + //
                "entity en2 { " + //
                "element bar: { " + //
                "element use : type of myelem; " + //
                "}; " + //
                "}; " + //
                "define view av0 as select from 	 <>  {  }; " + //
                "define view av1 as select from en1.assoc_to_en1_1  { #selection.begin.one##selection.end.one# } ; " + //
                "define view av2 as select from nested_en1  {   <>  }; " + //
                "define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),true);
            equal(rnd.Utils.arrayContains(completions, "assoc_to_entity5"),true);
            equal(rnd.Utils.arrayContains(completions, "assoc_to_en1_1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.typeCompletionUmlauts = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context \"ümlaut\" { " + //
                "type \"üstruc\" { " + //
                "\"üfeld\" :  \"üsi#selection.begin.one##selection.end.one# \r\n" + //
                " " + //
                "}; " + //
                "type \"üsimple\" : Integer; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "List incomplete. Remove syntax errors for optimal code completion."),true);
            equal(rnd.Utils.arrayContains(completions, "\"üsimple\""),true);
            sourceWithSelections="namespace fu1__2; " + "context \"ümlaut\" { "+ "type \"üstruc\" { "+ "\"üfeld\" :  \"üsi\"#selection.begin.one##selection.end.one# "+ " "+ "}; "+ "type \"üsimple\" : Integer; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=parser.getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "\"üsimple\""),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryTypeOfCompletion = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context \"ümlaut\" { " + //
                "type \"üstruc\" { " + //
                "\"üfeld\" :  type of üs " + //
                "}; " + //
                "type \"üsimple\" { " + //
                "\"üfeld\" : In#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Integer"),true);
            equal(rnd.Utils.arrayContains(completions, "Integer64"),true);
        };
        TestsUnitHanaDdlParser.prototype.dontProposeElementsOfPreviousTypeDecl = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "type mytype : type of  #selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[myStruc2, testWithSteffen]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.typeOfProposeTypesInNestedLocalContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "context nested { " + //
                "type n1 : Integer; " + //
                "type n2 { " + //
                "a : Integer; " + //
                "b : Integer; " + //
                "}; " + //
                "context nested2 { " + //
                "type nested2_struc { " + //
                "a:Integer; " + //
                "b: Integer; " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "context nested1 { " + //
                " type nested1_struc { a:Integer; b:Integer; }; " + //
                "type mytype : type of  #selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[myStruc, myStruc2, nested1_struc, testWithSteffen.nested.n2, testWithSteffen.nested.nested2.nested2_struc, nested1, testWithSteffen, testWithSteffen.nested, testWithSteffen.nested.nested2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.typeProposalContextPathOnlyWhenNecessary = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type amyStruc { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "type amyStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "context nested { " + //
                "type an1 : Integer; " + //
                "type an2 { " + //
                "a : Integer; " + //
                "b : Integer; " + //
                "}; " + //
                "context nested2 { " + //
                "type anested2_struc { " + //
                "a:Integer; " + //
                "b: Integer; " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "context nested1 { " + //
                "type alocal : Integer; " + //
                "type amytype :  a#selection.begin.one##selection.end.one# ; " + //
                "type amytype2 : Integer;" + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "alocal"),true);
            equal(rnd.Utils.arrayContains(completions, "amyStruc"),true);
            equal(rnd.Utils.arrayContains(completions, "amyStruc2"),true);
            equal(rnd.Utils.arrayContains(completions, "amytype2"),true);
            equal(rnd.Utils.arrayContains(completions, "testWithSteffen.nested.an1"),true);
            equal(rnd.Utils.arrayContains(completions, "testWithSteffen.nested.an2"),true);
            equal(rnd.Utils.arrayContains(completions, "testWithSteffen.nested.nested2.anested2_struc"),true);
        };
        TestsUnitHanaDdlParser.prototype.entityViewProposalContextPathOnlyThenWhenNecessary = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context melch2 { " + //
                "entity entity1 { " + //
                "}; " + //
                "view view1 as select from entity1 { a }; " + //
                " " + //
                "context nested1 { " + //
                "entity entity2 { " + //
                "}; " + //
                "view view2 as select from entity2 { a }; " + //
                " " + //
                "}; " + //
                " " + //
                "context nested2 { " + //
                "entity entity3 { " + //
                "asso : association to  #selection.begin.one##selection.end.one# " + //
                "}; " + //
                " " + //
                "view view3 as select from entity1 { a }; " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[entity1, entity3, melch2.nested1.entity2, melch2.nested1.view2, view1, view3, melch2, melch2.nested1, nested2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.proposeStrucTypeElementInViewSelectList = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype : type of myStruc.struc2 ; " + //
                "type mysimple : Integer; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity myStruc { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "}; " + //
                "define view v as select from myStruc { struc2.#selection.begin.one##selection.end.one#  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2_1"),true);
        };
        TestsUnitHanaDdlParser.prototype.proposeNoElementsInTypeUsage = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "type myStruc { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.typeCompletionErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type my : s#selection.begin.one##selection.end.one#  ; ; " + //
                "type second : Integer; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "second"),true);
            equal(rnd.Utils.arrayContains(completions, "String(len)"),true);
        };
        TestsUnitHanaDdlParser.prototype.dontProposeCurrentTypeInTypeCompletion = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type my : #selection.begin.one##selection.end.one#  a;  " + //
                "type second : Integer; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "my"),false);
            equal(rnd.Utils.arrayContains(completions, "testWithSteffen"),true);
        };
        TestsUnitHanaDdlParser.prototype.typeOfErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity en { " + //
                "key id : Integer; " + //
                "field: Integer; " + //
                "field2: type of e#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "en"),true);
        };
        TestsUnitHanaDdlParser.prototype.typeOfFieldErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity en { " + //
                "key id : Integer; " + //
                "field: Integer; " + //
                "field2: type of f#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "field"),true);
        };
        TestsUnitHanaDdlParser.prototype.typeOfErrorRecoveryNestedContext = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "context nested { " + //
                "type nestedSimple : testWithSteffen.mytype     ; " + //
                "type nestedSimple2 : type of  #selection.begin.one##selection.end.one#   " + //
                "}; " + //
                "type mysimple : Integer; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity myStruc { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "}; " + //
                "define view v1 as select from myStruc { struc2  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[myStruc, myStruc2, v1, nested, testWithSteffen]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.typeOfErrorRecoveryNestedContext2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "context nested { " + //
                "type nestedSimple : testWithSteffen.mytype     ; " + //
                "type nestedSimple2 : type of  #selection.begin.one##selection.end.one#  ; " + //
                "}; " + //
                "type mysimple : Integer; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity myStruc { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "}; " + //
                "define view v1 as select from myStruc { struc2  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[myStruc, myStruc2, v1, nested, testWithSteffen]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationForeignKeyList = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1 { #selection.begin.one##selection.end.one# }; " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field1, field2, struc2, }]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.associationToErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "			namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                " " + //
                "entity entity2 { " + //
                "asso1 : association to entity1 {  }; " + //
                "asso1 : association to en#selection.begin.one##selection.end.one# {  }; " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "entity0"),true);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "entity2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationForeignKeyList2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1 {  };  " + //
                "asso1 : association to entity0 { #selection.begin.one##selection.end.one# };  " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field0, field0a, struc0a, }]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationForeignKeyList3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1 { #selection.begin.one##selection.end.one# };  " + //
                "asso1 : association to entity0 { <> };  " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field1, field2, struc2, }]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationForeignKeyListLongerPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso0 : association to entity0; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1.asso0 { #selection.begin.one##selection.end.one# };  " + //
                "asso1 : association to entity0 { <> };  " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field0, field0a, struc0a, }]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationForeignKeyListLongerPath2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc.struc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso0 : association to entity0; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1 { struc2.#selection.begin.one##selection.end.one# };  " + //
                "asso1 : association to entity0 { <> };  " + //
                "}; " + //
                "define view v as select from myStruc { struc2  } ; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field2, struc2_1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationOnCondition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity entity1 { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "key e2key : Integer; " + //
                "asso1 : association to entity1 on e#selection.begin.one##selection.end.one# = entity1.field1 ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e2key"),true);
            equal(rnd.Utils.arrayContains(completions, "exp("),true);
            equal(rnd.Utils.arrayContains(completions, "entity2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationOnConditionPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "key e2key : myStruc2; " + //
                "asso1 : association to entity1 on  e2key.#selection.begin.one##selection.end.one# = entity1.field1 ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2_1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationOnConditionPath2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity0 { " + //
                "field0 : Integer; " + //
                "field0a : String(10); " + //
                "struc0a : myStruc2; " + //
                "asso0a : association to entity2; " + //
                "}; " + //
                "entity entity1 { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "key e2key : myStruc2; " + //
                "asso1 : association to entity1 on  e2key = entity1.asso2.#selection.begin.one##selection.end.one# ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso1"),true);
            equal(rnd.Utils.arrayContains(completions, "e2key"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationOnConditionPath3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "key field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "key e2key : myStruc2; " + //
                "asso1 : association to entity1 on asso1.#selection.begin.one##selection.end.one# = entity1.field1 ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity Employee { " + //
                "key id : Integer; " + //
                "Employee : Integer; " + //
                "Employee1 : association to testWithSteffen.Employee; " + //
                "}; " + //
                "define view v as select from Employee { #selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Employee"),true);
            equal(rnd.Utils.arrayContains(completions, "Employee1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity Employee { " + //
                "key id : Integer; " + //
                "Employee : Integer; " + //
                "Employee1 : association to testWithSteffen.Employee; " + //
                "}; " + //
                "define view v as select from Employee { employee.#selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Employee"),true);
            equal(rnd.Utils.arrayContains(completions, "Employee1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity Employee { " + //
                "key id : Integer; " + //
                "Employee : Integer; " + //
                "Employee1 : association to testWithSteffen.Employee; " + //
                "}; " + //
                "define view v as select from Employee { employee.employee.#selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity Employee { " + //
                "key id : Integer; " + //
                "Employee : Integer; " + //
                "Employee1 : association to testWithSteffen.Employee; " + //
                "}; " + //
                "define view v as select from Employee { employee.employee1.#selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Employee"),true);
            equal(rnd.Utils.arrayContains(completions, "Employee1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity Employee { " + //
                "key id : Integer; " + //
                "Employee : Integer; " + //
                "Employee1 : association to testWithSteffen.Employee; " + //
                "}; " + //
                "define view v as select from Employee { employee.employee1.employee1.#selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Employee"),true);
            equal(rnd.Utils.arrayContains(completions, "Employee1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName6 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; "
                + //
                + //
                    "context testWithSteffen { "
                + //
                "entity Employee { "
                + //
                "key id : Integer; "
                + //
                "Employee : Integer; "
                + //
                "Employee1 : association to testWithSteffen.Employee; "
                + //
                "}; "
                + //
                "define view v as select from Employee { employee.employee1.employee1.employee.#selection.begin.one##selection.end.one# }; "
                + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameTypeAndElementName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of #selection.begin.one##selection.end.one#   ; ; " + //
                "entity en { " + //
                "en : myStruc2   ; " + //
                "en2 : type of myStruc2.myStruc2; " + //
                "}; " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[en, myStruc2, testWithSteffen]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoSameTypeAndElementName2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of en.#selection.begin.one##selection.end.one#   ; ; " + //
                "entity en { " + //
                "en : myStruc2   ; " + //
                "en2 : type of myStruc2.myStruc2; " + //
                "}; " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[en, en2]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoSameTypeAndElementName3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of en.en.#selection.begin.one##selection.end.one#   ; ; " + //
                "entity en { " + //
                "en : myStruc2   ; " + //
                "en2 : type of myStruc2.myStruc2; " + //
                "}; " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field2, myStruc2, struc2_1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoSameTypeAndElementName4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc2.#selection.begin.one##selection.end.one#   ; ; " + //
                "entity en { " + //
                "en : myStruc2   ; " + //
                "en2 : type of myStruc2.myStruc2; " + //
                "}; " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[field2, myStruc2, struc2_1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoSameTypeAndElementName5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of en.en2.#selection.begin.one##selection.end.one#   ; ; " + //
                "entity en { " + //
                "en : myStruc2   ; " + //
                "en2 : type of myStruc2.myStruc2; " + //
                "}; " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName7 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "		namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type mytype :    type of myStruc2 ; " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                "define view v as select from entity1 { entity1.#selection.begin.one##selection.end.one#  } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2_1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName8 = function() {
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                " " + //
                "define view v as select from entity1 as field1 { fiel#selection.begin.one##selection.end.one# } ; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var dsProposalFound = false;
            var field1ProposalFound = false;
            var field2ProposalFound = false;
            for (var completionCount=0;completionCount<completions.length;completionCount++) {
                var completion=completions[completionCount];
                if (completion.getName()==="field1" && completion.getType() == IBaseCdsDdlParserConstants.ENTITY_TYPE) {
                    dsProposalFound=true;
                }else if (completion.getName()==="field1" && completion.getType() == IBaseCdsDdlParserConstants.ELEMENT_TYPE) {
                    field1ProposalFound=true;
                }else if (completion.getName()==="field2") {
                    field2ProposalFound=true;
                }
            }
            equal(dsProposalFound,true);
            equal(field1ProposalFound,true);
            equal(field2ProposalFound,true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName9 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                " " + //
                "define view v as select from entity1 as field1 { field1, field1.#selection.begin.one##selection.end.one#  } ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName10 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                " " + //
                "define view v as select from entity1 as field1 { field1, struc2.#selection.begin.one##selection.end.one#  } ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2_1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName11 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                " " + //
                "define view v as select from entity1 as field1 { field1, field1.#selection.begin.one##selection.end.one#  } ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoSameEntityAndElementName12 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                " " + //
                "define view v as select from entity1 as field1 { field1, entity1.#selection.begin.one##selection.end.one#  } ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoOrderByClause = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "type myStruc2 { "
                + //
                "myStruc2 : Integer; "
                + //
                "struc2_1 : Integer; "
                + //
                "field2 : String(10); "
                + //
                "}; "
                + //
                "entity entity1 { "
                + //
                "entity1 : testWithSteffen.myStruc2; "
                + //
                "field1 : Integer; "
                + //
                "field2 : String(10); "
                + //
                "struc2 : myStruc2; "
                + //
                "asso2 : association to entity2; "
                + //
                "}; "
                + //
                "entity entity2 { "
                + //
                "asso1 : association to entity1  ; "
                + //
                "}; "
                + //
                "define view v as select from entity1 as field1  { field1, field1 as hugo, struc2  } order by  field1.#selection.begin.one##selection.end.one# ;  "
                + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "hugo"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoOrderByClause2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                "define view v as select from entity1 as field1  { field1, field1 as hugo, struc2  } order by  " + //
                " entity1.#selection.begin.one##selection.end.one# ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "entity1"),true);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
            equal(rnd.Utils.arrayContains(completions, "field2"),true);
            equal(rnd.Utils.arrayContains(completions, "hugo"),true);
            equal(rnd.Utils.arrayContains(completions, "myStruc2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2"),true);
            equal(rnd.Utils.arrayContains(completions, "struc2_1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoOrderByClause3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type myStruc2 { " + //
                "myStruc2 : Integer; " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "}; " + //
                "entity entity1 { " + //
                "entity1 : testWithSteffen.myStruc2; " + //
                "field1 : Integer; " + //
                "field2 : String(10); " + //
                "struc2 : myStruc2; " + //
                "asso2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "asso1 : association to entity1  ; " + //
                "}; " + //
                "define view v as select from entity1 as field1  { field1, field1 as hugo, struc2  } order by  " + //
                " hu#selection.begin.one##selection.end.one# ;  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "hugo"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewOnView = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "define view v100 as select from extEnt  as ali  {  ali.k as fxm1,fx2 } order by field1  ; " + //
                "define view v1 as select from v100 as alias { alias.fx2, fx2, fx#selection.begin.one##selection.end.one# }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "fx2"),true);
            equal(rnd.Utils.arrayContains(completions, "fxm1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeAllContexts = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context xctestWithSteffen { " + //
                "context xctx { " + //
                "}; " + //
                "context xctx2{ " + //
                "type a :  x#selection.begin.one##selection.end.one#   ; " + //
                "}; " + //
                "context xctx3{ " + //
                "context xctx3_nested{ " + //
                "type hugo: Integer; " + //
                "}; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "xctestWithSteffen.xctx3.xctx3_nested.hugo"),true);
            equal(rnd.Utils.arrayContains(completions, "xctestWithSteffen"),true);
            equal(rnd.Utils.arrayContains(completions, "xctestWithSteffen.xctx"),true);
            equal(rnd.Utils.arrayContains(completions, "xctestWithSteffen.xctx3"),true);
            equal(rnd.Utils.arrayContains(completions, "xctestWithSteffen.xctx3.xctx3_nested"),true);
            equal(rnd.Utils.arrayContains(completions, "xctx2"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoRelativeContextPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity e1 { " + //
                "asso : association to e#selection.begin.one##selection.end.one# ; " + //
                "}; " + //
                " " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "entity enested { " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested2.enested"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoRelativeContextPathView = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity e1 { " + //
                "asso : association to e#selection.begin.one##selection.end.one# ; " + //
                "}; " + //
                " " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "define view ev1 as select from e1 { field }; " + //
                "}; " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested2.ev1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoRelativeContextPathStrucType = function() {
            var parser = this.getParser();
            var sourceWithSelections = "				namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity e1 { " + //
                "asso : type of e#selection.begin.one##selection.end.one# ; " + //
                "}; " + //
                " " + //
                "context nested1 { " + //
                "context nested2 { " + //
                "type estruc { " + //
                "a : Integer; " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested2.estruc"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeAssociation = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type assoc : association to entity; " + //
                "entity entity { " + //
                "f1 : Integer; " + //
                "am : assoc; " + //
                "tc : type of am.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[am, f1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoTypeOfViewSelectListEntry = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity en0 { " + //
                "key f1 : Integer; " + //
                "f2 : Integer; " + //
                "f3 : Integer; " + //
                "}; " + //
                "define view v0 as select from en0 { f2, f3 as hugo }; " + //
                "entity en2  { " + //
                "key k : Integer; " + //
                "f : type of v0.#selection.begin.one##selection.end.one# " + //
                "}; " + //
                "type t0 : type of v0.f2; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[f2, hugo]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoNoProposalsForAliasName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity en0 { " + //
                "key f1 : Integer; " + //
                "f2 : Integer; " + //
                "f3 : Integer; " + //
                "}; " + //
                "define view v0 as select from en0 as #selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAssociationOnCondition2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "	namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity en0 { " + //
                "key f1 : Integer; " + //
                "f2 : Integer; " + //
                "f3 : Integer; " + //
                "asso : association to en0 on #selection.begin.one##selection.end.one# " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso"),true);
            equal(rnd.Utils.arrayContains(completions, "f1"),true);
            equal(rnd.Utils.arrayContains(completions, "f2"),true);
            equal(rnd.Utils.arrayContains(completions, "f3"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoViewDataSource = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "    context c { define entity Entity0 { key field1 : String (19) ;};}; " + //
                "    define view MyView6 as select from c.#selection.begin.one##selection.end.one#Entity0 {field1}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[Entity0]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.datasourceAlias = function() {
            var cu = this.parseSourceAndGetAst("define view v1 as select from entity1 as alias { field };");
            var def = cu.getStatements()[0];
            var ds = def.getSelect().getFrom();
            equal("alias",ds.getAlias());
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeShortestContextPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test7 { " + //
                "context ctx3{ " + //
                "context ctx3_a { " + //
                "type myty : Integer; " + //
                "}; " + //
                "context ctx3_nested{ " + //
                "type hugo: myty#selection.begin.one##selection.end.one# ; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "test7.ctx3.ctx3_a.myty"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeNextKeyword = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity entity1 { " + //
                "entity2 : Integer; " + //
                "field1 : Integer; " + //
                "asso : association to entity2 { field, entity2.a }; " + //
                "asso2#selection.begin.one##selection.end.one# " + //
                "asso3 : association to entity2 on  ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var first = completions[0];
            equal(":",first.getName());
            equal(first.isDoReplaceTokenAtCurrentOffset(),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeShortestContextPath2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test7 { " + //
                "context ctx3{ " + //
                "context ctx3_a { " + //
                "type myty : Integer; " + //
                "}; " + //
                "context ctx3_nested{ " + //
                "context ctx3_a{ " + //
                "type hugo: myty#selection.begin.one##selection.end.one# ; " + //
                "}; " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(completions.length >= 1,true);
            var completion = this.__getCompletion(completions, "test7.ctx3.ctx3_a.myty");
            equal("test7.ctx3.ctx3_a.myty",completion.getName());
        };
        TestsUnitHanaDdlParser.prototype.__getCompletion = function(compls,name) {
            for (var compCount=0;compCount<compls.length;compCount++) {
                var comp=compls[compCount];
                if (rnd.Utils.stringEqualsIgnoreCase(name, comp.getName())) {
                    return comp;
                }
            }
            return null;
        };
        TestsUnitHanaDdlParser.prototype.cocoProposeNextKeyword2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(3,completions.length);
            var first = this.__getCompletion(completions, ".");
            equal(".",first.getName());
            equal(first.isDoReplaceTokenAtCurrentOffset(),false);
        };
        TestsUnitHanaDdlParser.prototype.keywordCoCoAfterSemicolon = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test7 { " + //
                " type  myt #selection.begin.one##selection.end.one#; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[., :, ::, {]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAsKeywordNotAcceptedAsAlias = function() {
            var parser = this.getParser();
            var sourceWithSelections = "define view v as select from entity as #selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryCurlyBracketsHandling = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		type myType1 : Integer; " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				type type1 : myn#selection.begin.one##selection.end.one# " + //
                "			}; " + //
                "		}; " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : myType1; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "mynestedtype"),true);
            equal(rnd.Utils.arrayContains(completions, "vic_prob.firstTest.nested2.nested22.mynestedtype"),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryCurlyBracketsHandlingStructuredType = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		type myType1 : Integer; " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				type type1  {  elem : myn#selection.begin.one##selection.end.one#  }; " + //
                "			}; " + //
                "		}; " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : myType1; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "mynestedtype"),true);
            equal(rnd.Utils.arrayContains(completions, "vic_prob.firstTest.nested2.nested22.mynestedtype"),true);
        };
        TestsUnitHanaDdlParser.prototype.noKeywordCoCoForNestedViewSelectList = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test7 { " + //
                "define view view1 as select from test_1 as a { #selection.begin.one##selection.end.one# }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "a"),true);
            equal(rnd.Utils.arrayContains(completions, "test_1"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "		" + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "  " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				" + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					" + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				" + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "		" + //
                "		type hugo : #selection.begin.one##selection.end.one#  " + //
                "		 " + //
                "		context nested2 {  " + //
                "			context nested22 {  " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(this.__getCompletion(completions,"vic_prob") != null,true);
            equal(this.__getCompletion(completions,"nested2.nested22") != null,true);
            equal(this.__getCompletion(completions,"nested2") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11") != null,true);
            equal(this.__getCompletion(completions,"nested1") != null,true);
            equal(this.__getCompletion(completions,"firstTest") != null,true);
            equal(this.__getCompletion(completions,"nested2.nested22.mynestedtype") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11.type1") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11.t") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11.mytypeAlias") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11.mynestedtype") != null,true);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "" + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "" + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "" + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "" + //
                "		type hugo : myn#selection.begin.one##selection.end.one# " + //
                "" + //
                "		context nested2 {  " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer;  " + //
                "			}; " + //
                "		};  " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(this.__getCompletion(completions,"nested2.nested22.mynestedtype") != null,true);
            equal(this.__getCompletion(completions,"nested1.nested11.mynestedtype") != null,true);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "" + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		};  " + //
                "		type hugo : #selection.begin.one##selection.end.one# ; " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["vic_prob", "nested2.nested22", "nested2", "nested1.nested11", "nested1", "firstTest",
                "nested2.nested22.mynestedtype", "nested1.nested11.type1", "nested1.nested11.t", "nested1.nested11.mytypeAlias",
                "nested1.nested11.mynestedtype"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "		type hugo : myne#selection.begin.one##selection.end.one# ; " + //
                "		context nested2 { " + //
                "			context nested22 {  " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["nested2.nested22.mynestedtype", "nested1.nested11.mynestedtype"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType5 = function() {
            var parser = this.getParser();
            var sourceWithSelections = //
                "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element2 : Integer;  " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "		type hugo : myne#selection.begin.one##selection.end.one# ;;  " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["nested2.nested22.mynestedtype", "nested1.nested11.mynestedtype"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryIncompleteSimpleType6 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		};  " + //
                "		type hugo : myne#selection.begin.one##selection.end.one# ;;; " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["nested2.nested22.mynestedtype", "nested1.nested11.mynestedtype"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryTypeOfWithMissingSemicolon = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest {  " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element1 : type of #selection.begin.one##selection.end.one# " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "			}; " + //
                "		}; " + //
                "	};  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var res = this.__removeKeywordCompletions(completions);
            equal("vic_prob#nested11#nested1#firstTest#id#entity1#element2#",res);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryTypeOfWithMissingSemicolonFollowingNextElement = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context nested11 { " + //
                "	entity entity1 { " + //
                "	key id : Integer; " + //
                "	element1 : type of ele#selection.begin.one##selection.end.one# " + //
                "	element2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var res = this.__removeKeywordCompletions(completions);
            equal("element2#",res);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryTypeOfWithTwoSemicolonsProposesFollowingElement = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context nested11 { " + //
                "	entity entity1 { " + //
                "key id : Integer; " + //
                "element1 : type of ele#selection.begin.one##selection.end.one# ; ; " + //
                "element2 : Integer; " + //
                "}; " + //
                "	}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var res = this.__removeKeywordCompletions(completions);
            equal("element2#",res);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryTypeOfWithThreeSemicolonsProposesFollowingElement = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context nested11 { " + //
                "	entity entity1 { " + //
                "	key id : Integer; " + //
                "	element1 : type of ele#selection.begin.one##selection.end.one# ; ; ; " + //
                "	element2 : Integer; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var res = this.__removeKeywordCompletions(completions);
            equal("element2#",res);
        };
        TestsUnitHanaDdlParser.prototype.cocoErrorRecoveryTypeOfWithMissingSemicolonAlsoProposesFollowingTypes = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11 { " + //
                "				type mynestedtype : Integer; " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element1 : type of  #selection.begin.one##selection.end.one# Integer; " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type myType : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var res = this.__removeKeywordCompletions(completions);
            equal("vic_prob#nested11#nested1#firstTest#id#entity1#element2#",res);
        };
        TestsUnitHanaDdlParser.prototype.cocoSimpleTypeInStructureTypeForwardDef = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace tm.fu1__3; " + //
                "context personNameContext {  " + //
                "	type PersonName {  " + //
                "		first : #selection.begin.one##selection.end.one# " + //
                "    };  " + //
                "	type Name :   String(80);  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["personNameContext", "Name", "Integer"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.__removeKeywordCompletions = function(completions) {
            var result = new StringBuffer();
            for (var i=completions.length - 1;i >= 0;i--) {
                var compl = completions[i];
                if (DdlCodeCompletionType.KEYWORD===compl.getType() == false) {
                    result.append(compl.getName()).append("#");
                }
            }
            return result.toString();
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryAssociationOnCondition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context vic_prob { " + //
                "entity entity1 { " + //
                "	key id : Integer; " + //
                "	element3 : Integer; " + //
                "	assoc: association to AddressAlias on #selection.begin.one##selection.end.one# " + //
                "	element2 : Integer; " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(this.__containsCompletion(completions,"vic_prob"),false);
            equal(this.__containsCompletion(completions,"id"),true);
            equal(this.__containsCompletion(completions,"element3"),true);
            equal(this.__containsCompletion(completions,"element2"),true);
            equal(this.__containsCompletion(completions,"assoc"),true);
        };
        TestsUnitHanaDdlParser.prototype.__containsCompletion = function(completions, string) {
            for (var complCount=0;complCount<completions.length;complCount++) {
                var compl=completions[complCount];
                if (rnd.Utils.stringEqualsIgnoreCase(string, compl.getName())) {
                    return true;
                }
            }
            return false;
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryNoWarningEntryInResult = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::ctx3.ctx3_a.myty as mytyAlias; " + //
                "context test2 { " + //
                " type type { " + //
                " 	aaaaa : Integer; " + //
                " }; " + //
                "entity entity1 { " + //
                "	entity1field : Integer; " + //
                "	to_entity2 : association to entity2; " + //
                "}; " + //
                "entity entity2 { " + //
                "	entity2field : Integer; " + //
                "	to_entity1 : association to entity1; " + //
                "}; " + //
                "view v as select from entity1.to_entity2 as ali { ali.to_entity1.entity1field }; " + //
                "context ctestWithSteffen { " + //
                "	context ctx3{  " + //
                "		context ctx3_a { " + //
                "			type myty : Integer; " + //
                "		}; " + //
                "		context ctx3_nested{ " + //
                "			type hugo: ctx3_a.myty ; " + //
                "			type hugo: mytyAlias; " + //
                "			entity en1 { " + //
                "				a : Integer; " + //
                "				b : In#selection.begin.one##selection.end.one#  " + //
                "			};  " + //
                "		};  " + //
                "	};  " + //
                "}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Integer"),true);
            equal(rnd.Utils.arrayContains(completions, "Integer64"),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryListIncomplete = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test5 { " + //
                "	error " + //
                "	context firstTest {   " + //
                "		context nested1 {   " + //
                "			context nested11 {  " + //
                "				type mynestedtype : Integer;   " + //
                "				type t : nested2.nested22.mynestedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 {   " + //
                "					key id : Integer;   " + //
                "					element2 : Integer; " + //
                "				};   " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		};   " + //
                "		type hugo : myne#selection.begin.one##selection.end.one# ;; " + //
                "		context nested2 {  " + //
                "			context nested22 {   " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested11.mynestedtype"),true);
            equal(rnd.Utils.arrayContains(completions, "nested2.nested22.mynestedtype"),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryDontShowWarningEntryInCoCoList = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test7 { " + //
                "	entity en1 {  " + //
                "		key id : Integer;   " + //
                "		assoc_to_en1_1 : association to nested_en1; " + //
                "	};   " + //
                "	entity nested_en1 {   " + //
                "		key id : Integer;   " + //
                "		assoc_to_entity5 : association to entity5; " + //
                "	};  " + //
                "	entity en2 {  " + //
                "		element bar: ;  	 " + //
                "		element use : type of myelem; " + //
                "	};   " + //
                "	define view av1 as select from 	 <>  {  };   " + //
                "	define view av1 as select from en1.assoc_to_en1_1  { #selection.begin.one##selection.end.one# } ; " + //
                "	define view av2 as select from nested_en1  {     };   " + //
                "	define view av3 as select from assoc_using1.nested.nested_en1  {     }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "assoc_to_entity5"),true);
            equal(rnd.Utils.arrayContains(completions, "assoc_to_en1_1"),true);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
        };
        TestsUnitHanaDdlParser.prototype.astEntityElementTypeOf = function() {
            var source = "entity en1 { element1 : Integer; element2 : type of element1; };";
            var cu = this.parseSourceAndGetAst(source);
            var ed = cu.getStatements()[0];
            var first = ed.getElements()[0];
            var tip = first.getTypeIdPath();
            equal(tip!=null,true);
            equal(first.getTypeOfPath()==null,true);
            var second = ed.getElements()[1];
            equal(second.getTypeIdPath()==null,true);
            equal("",second.getTypeId());
            var top = second.getTypeOfPath();
            equal(top!=null,true);
            var ps = top.getPathString(false);
            equal("element1",ps);
        };
        TestsUnitHanaDdlParser.prototype.astSimpleTypeTypeOf = function() {
            var source = "context ctx { type first : Integer; type second: type of first; };";
            var cu = this.parseSourceAndGetAst(source);
            var ctx = cu.getStatements()[0];
            var td = ctx.getStatements()[1];
            equal(td!=null,true);
            var second = td.getElements()[0];
            equal(second.getTypeIdPath()==null,true);
            equal("",second.getTypeId());
            var top = second.getTypeOfPath();
            equal(top!=null,true);
            var ps = top.getPathString(false);
            equal("first",ps);
        };
        TestsUnitHanaDdlParser.prototype.astStructureTypeTypeOf = function() {
            var source = "type struc { first: Integer; second:type of first;};";
            var cu = this.parseSourceAndGetAst(source);
            var td = cu.getStatements()[0];
            equal(td!=null,true);
            var second = td.getElements()[1];
            equal(second.getTypeIdPath()==null,true);
            equal("",second.getTypeId());
            var top = second.getTypeOfPath();
            equal(top!=null,true);
            var ps = top.getPathString(false);
            equal("first",ps);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryMoreThanOneInvalidTokenBeforeContext = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::pgtestddl25.Address as AddressAlias; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11{type mynestedtype:Integer; " + //
                "				type t : mynes#selection.begin.one##selection.end.one#tedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element3 : Integer; " + //
                "					assoc: association to AddressAlias on " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "		type hugo : <> " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["vic_prob.firstTest.nested2.nested22.mynestedtype", "mynestedtype"];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryMoreThanOneInvalidTokenBeforeContext2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::pgtestddl25.Address as AddressAlias; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11{type mynestedtype:Integer; " + //
                "				type t : mynes#selection.begin.one##selection.end.one#tedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element3 : Integer; " + //
                "					assoc: association to AddressAlias on " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype; " + //
                "			}; " + //
                "		}; " + //
                "		context hugo  <> " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["mynestedtype", "List incomplete. Remove syntax errors for optimal code completion."];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryMoreThanOneInvalidTokenBeforeContext3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::pgtestddl25.Address as AddressAlias; " + //
                "context vic_prob { " + //
                "	context firstTest { " + //
                "		context nested1 { " + //
                "			context nested11{type mynestedtype:Integer; " + //
                "				type t : mynes#selection.begin.one##selection.end.one#tedtype; " + //
                "				type mytypeAlias : Integer; " + //
                "				entity entity1 { " + //
                "					key id : Integer; " + //
                "					element3 : Integer; " + //
                "					assoc: association to AddressAlias on " + //
                "					element2 : Integer; " + //
                "				}; " + //
                "				type type1 : vic_prob.firstTest.nested2.nested22.mynestedtype1; " + //
                "			}; " + //
                "		}; " + //
                "		entity hugo { <> " + //
                "		context nested2 { " + //
                "			context nested22 { " + //
                "				type mynestedtype1 : Integer; " + //
                "			}; " + //
                "		}; " + //
                "	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var names = ["mynestedtype", "List incomplete. Remove syntax errors for optimal code completion."];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                equal(this.__getCompletion(completions,name) != null,true);
            }
        };
        TestsUnitHanaDdlParser.prototype.cocoReplacmentOffsetLength = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::pgtestddl25.Address as AddressAlias; " + //
                "context vic_prob { " + //
                "  type a : Integer#selection.begin.one##selection.end.one#6111;" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(this.__getCompletion(completions,"Integer") != null,true);
            var compl = this.__getCompletion(completions, "Integer64");
            equal(99,compl.getReplacementOffset());
            equal("Integer6111".length,compl.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.cocoReplacmentOffsetLengthForPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::pgtestddl25.Address as AddressAlias; " + //
                "context vic_prob { " + //
                "   type t1 : Integer;" + //
                "  type a : vic_p#selection.begin.one##selection.end.one#rob.t1;" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var compl = this.__getCompletion(completions, "vic_prob");
            equal(120,compl.getReplacementOffset());
            equal("vic_prob".length,compl.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.cocoViewSelectListEntry = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context test7 { "
                + //
                "view MyView7 as select from Employee { m#selection.begin.one##selection.end.one#in(Employee.salary) as ali1, count(name) as ali2, count( distinct Employee.businessAddress.streetAddress) as alias1 }	"
                + //
                "		where (age >= 50 and name <= 'KKKKK') or ((salary <= 1000 and name >= 'UUUUU') or (salary > 7000));" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "max("),true);
            equal(rnd.Utils.arrayContains(completions, "min("),true);
            equal(rnd.Utils.arrayContains(completions, "mod("),true);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryQlPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "entity entity1 { " + //
                "entity2 : Integer; " + //
                "field1 : Integer; " + //
                "asso : association to entity2 { field, entity2.a }; " + //
                "asso2 : association to entity2 on #selection.begin.one##selection.end.one# " + //
                "asso3 : association to entity2 on  ; " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso"),false);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
            equal(rnd.Utils.arrayContains(completions, "asso3"),false);
            equal(rnd.Utils.arrayContains(completions, "entity2"),true);
            equal(rnd.Utils.arrayContains(completions, "field1"),true);
        };
        TestsUnitHanaDdlParser.prototype.parseAnnotationDefinitions = function() {
            var parser = this.getParser();
            var cu = parser.parseAnnotationDefinition(this.getPadFileResolver(), this.__getAnnotationDefinitions());
            equal(cu!=null,true);
            this.assertNoErrorTokens(cu.getTokenList());
            equal(cu.getStatements().length, 2);
            var catalogDecl = cu.getStatements()[0];
            equal(catalogDecl.getName(), "Catalog");
            equal(false, catalogDecl.isArrayType());
            var catalogElements = catalogDecl.getAnonymousType().getElements();
            var index = catalogElements[1];
            equal(index.getName(), "index");
            equal(true, index.isArrayType());
            var indexElements = index.getAnonymousType().getElements();
            var elementNames = indexElements[3];
            equal(elementNames.getName(), "elementNames");
            equal(true, elementNames.isArrayType());
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotNestedContext = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@#selection.begin.one##selection.end.one# " + //
                " context nested {" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "#selection.begin.one##selection.end.one# " + //
                " entity e1 {" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "@Catalog.index: "),true);
            equal(rnd.Utils.arrayContains(completions, "@Catalog.tableType: #COLUMN"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotView = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "#selection.begin.one##selection.end.one# " + //
                " define view v as select from sflight { mandt };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "@ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptyType = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                " type typ {" + //
                "#selection.begin.one##selection.end.one# " + //
                " }; " + //
                " entity en { }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "@"),true);
            equal(rnd.Utils.arrayContains(completions, "element"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptyEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                " entity typ {" + //
                "#selection.begin.one##selection.end.one# " + //
                " }; " + //
                " entity en { }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "@"),true);
            equal(rnd.Utils.arrayContains(completions, "element"),true);
            equal(rnd.Utils.arrayContains(completions, "key"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptyView = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                " define view v as select from sflight {" + //
                "#selection.begin.one##selection.end.one# " + //
                " }; " + //
                " entity en { }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "sflight"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotOnRootEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "@#selection.begin.one##selection.end.one# " + //
                "entity testWithSteffen { " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[Catalog.index: , Catalog.tableType: #COLUMN]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotErrorneousEntityStmt = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@#selection.begin.one##selection.end.one# " + //
                "   entity en { " + //
                "   }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[Catalog.index: , Catalog.tableType: #COLUMN]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotErrorneousTypeStmt = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@#selection.begin.one##selection.end.one# " + //
                "   type en { " + //
                "   }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(completions.length <= 1,true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotErrorneousViewStmt1 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@#selection.begin.one##selection.end.one# " + //
                "   view en as select from sflight{ " + //
                "   }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotErrorneousViewStmt2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@#selection.begin.one##selection.end.one# " + //
                "   define view en as select from sflight{ " + //
                "   }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotValue = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.tableType:#selection.begin.one##selection.end.one##COLUMN " + //
                " entity a { " + //
                "};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "#COLUMN"),true);
            equal(rnd.Utils.arrayContains(completions, "#GLOBAL_TEMPORARY"),true);
            equal(rnd.Utils.arrayContains(completions, "#ROW"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotValueAfterHash = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.tableType:##selection.begin.one##selection.end.one#COLUMN " + //
                " entity a { " + //
                "};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[#COLUMN, #GLOBAL_TEMPORARY, #ROW]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayInvalid = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:#selection.begin.one##selection.end.one# " + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "["),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayInvalid2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames: #selection.begin.one##selection.end.one# }] " + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "["),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexErrorRecovery = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:[#selection.begin.one##selection.end.one# }] " + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "'el1'"),true);
            equal(rnd.Utils.arrayContains(completions, "'field2'"),true);
            equal(rnd.Utils.arrayContains(completions, "'veryLongName'"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexErrorRecovery2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:[#selection.begin.one##selection.end.one#] }] " + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "'el1'"),true);
            equal(rnd.Utils.arrayContains(completions, "'field2'"),true);
            equal(rnd.Utils.arrayContains(completions, "'veryLongName'"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndex = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:['el1',#selection.begin.one##selection.end.one#] }]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("['el1', 'field2', 'veryLongName']",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndex2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:['e#selection.begin.one##selection.end.one#l1'] }]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndex3 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:['#selection.begin.one##selection.end.one#el1'] }]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, field2, veryLongName]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndex4 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:['el1',#selection.begin.one##selection.end.one# }]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "'el1'"),true);
            equal(rnd.Utils.arrayContains(completions, "'field2'"),true);
            equal(rnd.Utils.arrayContains(completions, "'veryLongName'"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexMissingQuote = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elementNames:['el1','#selection.begin.one##selection.end.one# ] }]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:#selection.begin.one##selection.end.one#true,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "true"),true);
            equal(rnd.Utils.arrayContains(completions, "false"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:tr#selection.begin.one##selection.end.one#ue,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[true]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues3 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#selection.begin.one##selection.end.one##ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "#ASC"),true);
            equal(rnd.Utils.arrayContains(completions, "#DESC"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues4 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:##selection.begin.one##selection.end.one#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[#ASC, #DESC]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues5 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{na#selection.begin.one##selection.end.one#me:'sdsd',unique:true,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[name]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues6 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{#selection.begin.one##selection.end.one#name:'sdsd',unique:true,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[elementNames, name, order, unique]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues7 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,#selection.begin.one##selection.end.one#elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[elementNames, name, order, unique]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexArrayValues8 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[{name:'sdsd',unique:true,order:#ASC,elem#selection.begin.one##selection.end.one#entNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var first = completions[0];
            equal("elementNames",first.getName());
            equal(96,first.getReplacementOffset());
            equal(12,first.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexNoRecord = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:[ #selection.begin.one##selection.end.one# {name:'sdsd',unique:true,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "["),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexNoArray = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index: #selection.begin.one##selection.end.one# [  {name:'sdsd',unique:true,order:#ASC,elementNames:['el1','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "["),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexReplacementOffsetLength = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index:  [  {name:'',unique:true,order:#ASC,elementNames:['']}, {elementNames:[#selection.begin.one##selection.end.one#]} ]"
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		veryLongName : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var first = completions[0];
            equal("'el1'",first.getName());
            equal(-1,first.getReplacementOffset());
            equal(-1,first.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexElementNamesWithQuotes = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index: [  {name:'sdsd',unique:true,order:#ASC,elementNames:['#selection.begin.one##selection.end.one#','el1'] }] "
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		\"veryLo ngName\" : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[el1, field2, veryLo ngName]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexMultipleArrayEntries = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context testWithSteffen { "
                + //
                "@Catalog.index: [{name: 'name1',unique: true,order: #ASC,elementNames: ['el1']},{elementNames: ['el1'],#selection.begin.one##selection.end.one#  } ]"
                + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		\"veryLo ngName\" : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[elementNames, name, order, unique]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexMultipleArrayEntries2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index: [{name: '',unique: true,order: #ASC,elementNames: ['el1']},#selection.begin.one##selection.end.one#]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		\"veryLo ngName\" : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCataglogIndexMultipleArrayEntries3 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog.index: [{name: '',unique: true,order: #ASC,elementNames: ['el1']},#selection.begin.one##selection.end.one# ]" + //
                "	@Catalog.tableType:#COLUMN " + //
                "	entity a { " + //
                "		key el1 : Integer; " + //
                "		\"veryLo ngName\" : Integer; " + //
                "		field2 : Integer; " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "["),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotColumnView = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@ColumnView:{#selection.begin.one##selection.end.one#}" + //
                "	define view  v1a as select from Employee {  id };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[useCalcEngine: true]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotColumnView2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@ColumnView:{ #selection.begin.one##selection.end.one# }" + //
                "	define view  v1a as select from Employee {  id };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[useCalcEngine: true]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotCatalog = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "@Catalog:{#selection.begin.one##selection.end.one#}" + //
                "	entity a { element : Integer;};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[index: , tableType: #COLUMN]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "	entity en1 { " + //
                "		@#selection.begin.one##selection.end.one# " + //
                "	}; " + //
                "	entity en2 { " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "	entity en1 { " + //
                "	}; " + //
                "		@#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Catalog.index: "),true);
            equal(rnd.Utils.arrayContains(completions, "Catalog.tableType: #COLUMN"),true);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource3 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "		@#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Catalog.index: "),true);
            equal(rnd.Utils.arrayContains(completions, "Catalog.tableType: #COLUMN"),true);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource4 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "		@#selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Catalog.index: "),true);
            equal(rnd.Utils.arrayContains(completions, "Catalog.tableType: #COLUMN"),true);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource5 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "		@#selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "Catalog.index: "),true);
            equal(rnd.Utils.arrayContains(completions, "Catalog.tableType: #COLUMN"),true);
            equal(rnd.Utils.arrayContains(completions, "ColumnView.useCalcEngine: true"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotEmptySource6 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "	entity en1 { " + //
                "		@#selection.begin.one##selection.end.one# " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotForSelectListEntry = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                " 	define view v as select from en1 { @#selection.begin.one##selection.end.one# };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotForSelectListEntry2 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                " 	define view v as select from en1 { @#selection.begin.one##selection.end.one# field };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotForSelectListEntry3 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                " 	define view v as select from en1 { @#selection.begin.one##selection.end.one#field };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotForSelectListEntry4 = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   define view v as select from en1 { @sd field1, @#selection.begin.one##selection.end.one# en1.field1 }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotCocoInsideEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   entity en1 { @#selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotCocoInsideType = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   type en1 { @#selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.noAnnotCocoInsideView = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   define view v as select from sflight { @#selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParser.prototype.cocoNoMinusAtAnnotValue = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   @Catalog.index: [{name: ‘customerId’, order:#selection.begin.one##selection.end.one# }]" + //
                "	entity en1 { " + //
                "		 " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "-"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoAnnotValueColonNotOverriden = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   @Catalog.index: [{name: 'customerId', order#selection.begin.one##selection.end.one#: #ASC }]" + //
                "	entity en1 { " + //
                "		 " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(1,completions.length);
            var compl = completions[0];
            equal(compl.getReplacementLength() == compl.getName().length || compl.getReplacementLength() == 0 || compl.getReplacementLength() == -1,true);
            equal("order",compl.getName());
        };
        TestsUnitHanaDdlParser.prototype.cocoSemicolonNotOverriden = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "	entity en1 { " + //
                "		 value : str#selection.one#;" + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(completions.length > 0,true);
            for (var completionCount=0;completionCount<completions.length;completionCount++) {
                var completion=completions[completionCount];
                if (completion instanceof HanaDdlCodeCompletion) {
                    var compl = completion;
                    var offset = compl.getReplacementOffset();
                    var length = compl.getReplacementLength();
                    if (offset == -1) {
                        equal(compl.getReplacementLength() == -1,true);
                    }else{
                        var overwritten = source[0].substring(offset, offset + length);
                        equal(rnd.Utils.stringContains(overwritten, ";"),false);
                    }
                }
            }
        };
        TestsUnitHanaDdlParser.prototype.errorRecoveryAnnotation = function() {
            var source = "namespace test; \r\n" + //
                "context hr { \r\n" + //
                "       context addressInfo { \r\n" + //
                "             type StreetAddress { \r\n" + //
                "                    name   : String(80); \r\n" + //
                "                    number : Integer; \r\n" + //
                "             }; \r\n" + //
                "             type CountryAddress { \r\n" + //
                "                    name   : String(80); \r\n" + //
                "                    code   : String(3); \r\n" + //
                "             }; \r\n" + //
                "             entity Address { \r\n" + //
                "                    key id  : Integer; \r\n" + //
                "                    street  : StreetAddress; \r\n" + //
                "                    zipCode : Integer; \r\n" + //
                "                    city    : String(80); \r\n" + //
                "                    country : CountryAddress; \r\n" + //
                "                    type    : String(10); // home, office \r\n" + //
                "             }; \r\n" + //
                "       }; \r\n" + //
                "       type RoomKey { \r\n" + //
                "             building   : String(3); \r\n" + //
                "             floor      : Integer; \r\n" + //
                "             roomNumber : Integer; \r\n" + //
                "       }; \r\n" + //
                "      @ \r\n" + //
                "       entity Room { \r\n" + //
                "             key roomId  : RoomKey; \r\n" + //
                "             capacity    : Integer; \r\n" + //
                "             type        : String(20);  // office, meeting \r\n" + //
                "             carpetColor : String(20); \r\n" + //
                "             inhabitants : Association[*] to employeeInfo.Employee { officeK }; \r\n" + //
                "       }; \r\n" + //
                "       entity Car { \r\n" + //
                "             key licensePlate : String(12); \r\n" + //
                "             color                : String(20); \r\n" + //
                "             model                : String(20); \r\n" + //
                "             make                 : String(20); \r\n" + //
                "             owner                : Association[0..1] To employeeInfo.Employee; // <----------------------- DEMO \r\n" + //
                "       }; \r\n" + //
                "       context employeeInfo { \r\n" + //
                "             type MyName { \r\n" + //
                "                    first : String(80); \r\n" + //
                "                    last  : String(80); \r\n" + //
                "             }; \r\n" + //
                "             entity Employee { \r\n" + //
                "                    key id     : Integer; \r\n" + //
                "                    name       : MyName;  // <----------------------- DEMO \r\n" + //
                "                    boss       : Association to Employee; \r\n" + //
                "                    office          : Association to Room; \r\n" + //
                "                    officeK    : RoomKey; \r\n" + //
                "                    joinDate   : LocalDate; \r\n" + //
                "                    salary     : Decimal(10,2); \r\n" + //
                "                    companyCar : Association[0..1] to Car; \r\n" + //
                "                    orgUnit    : String(30); \r\n" + //
                "       //           address    : Association[0..1] to // <----------------------- DEMO \r\n" + //
                "             }; \r\n" + //
                "       }; \r\n" + //
                "//     define view employeeView as select from employeeInfo.Employee { \r\n" + //
                "//     }; \r\n" + //
                "};";
            var cu = this.parseSourceAndGetAst(source);
            var ctx = cu.getStatements()[1];
            equal(ctx.getStatements()!=null,true);
        };
        TestsUnitHanaDdlParser.prototype.parseIncompleteSourceForSyntaxColoring = function() {
            var source = "};";
            var tokens = this.getParser().parseSource(this.getPadFileResolver(), source);
            this.assertNoErrorTokens(tokens);
            source="elem:Integer; };";
            tokens=this.getParser().parseSource(this.getPadFileResolver(),source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParser.prototype.errorRecoverySyntaxColoring = function() {
            var source = "namespace tmp.d036627.testing_for_SP8;\r\n" + //
                "\r\n" + //
                "context FirstStep {\r\n" + //
                "    \r\n" + //
                "    entity rides\r\n" + //
                "    {\r\n" + //
                "    key id : ty_id;\r\n" + //
                "//    person : ty_person_id default 1 ;\r\n" + //
                "       person : association[1] to person { person } ;\r\n" + //
                "    kind : ty_kind ;\r\n" + //
                "	entity person\r\n" + //
                "    {\r\n" + //
                "    key person : ty_person_id;\r\n" + //
                "    prename : String(20);\r\n" + //
                "    familyName : String(40);\r\n" + //
                "    };        \r\n" + //
                "//    distanceMeasure : ty_distanceMeasure default 'km';\r\n" + //
                "    distanceMeasure : String(5) default 'km';\r\n" + //
                "    distance : Integer;\r\n" + //
                "    total : Integer;\r\n" + //
                "    duration : ty_duration;\r\n" + //
                "    };\r\n" + //
                "    \r\n" + //
                "entity entity {\r\n" + //
                "    	element : Integer;\r\n" + //
                "    };\r\n" + //
                "};\r\n";
            var tokens = this.getParser().parseSource(this.getPadFileResolver(), source);
            var errors = this.__getAllErrorTokens(tokens);
            equal(1,errors.length);
            var entity = this.__getLastToken(tokens, "entity");
            equal(Category.CAT_IDENTIFIER,entity.m_category);
        };
        TestsUnitHanaDdlParser.prototype.__getLastToken = function(tokens, lexem) {
            for (var i=tokens.length - 1;i >= 0;i--) {
                var t = tokens[i];
                if (rnd.Utils.stringEqualsIgnoreCase(lexem, t.m_lexem)) {
                    return t;
                }
            }
            return null;
        };
        TestsUnitHanaDdlParser.prototype.__getAllErrorTokens = function(tokens) {
            var result = [];
            for (var tCount=0;tCount<tokens.length;tCount++) {
                var t=tokens[tCount];
                if (ErrorState.Erroneous===t.m_err_state) {
                    result.push(t);
                }
            }
            return result;
        };
        TestsUnitHanaDdlParser.prototype.codeCompletionNextKeywordAfterIdContextName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "context con#selection.begin.one##selection.end.one#";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
            equal(rnd.Utils.arrayContains(completions, "."),true);
        };
        TestsUnitHanaDdlParser.prototype.codeCompletionNextKeywordAfterIdTogetherWithSemanticCompletions = function() {
            var parser = this.getParser();
            var sourceWithSelections = "CONTEXT ctx { ENTITY ent1 { }; DEFINE VIEW v AS SELECT FROM en#selection.begin.one##selection.end.one# };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "ent1"),true);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsUnitHanaDdlParser.prototype.codeCompletionNoNextKeywordAfterIdViewName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "view a#selection.begin.one##selection.end.one#";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "as"),false);
        };
        TestsUnitHanaDdlParser.prototype.annotationDefinitionsWithStringLiteralInDefault = function() {
            var cu = this.getParser().parseAnnotationDefinition(this.getPadFileResolver(), "ANNOTATION a : string(20) DEFAULT 'Literal';");
            this.assertNoErrorTokens(cu.getTokenList());
            var decl = cu.getStatements()[0];
            var literal = decl.getDefault();
            equal("'Literal'",literal.getToken());
        };
        TestsUnitHanaDdlParser.prototype.annotationDefinitionsWithNegativeIntegerLiteralInDefault = function() {
            var cu = this.getParser().parseAnnotationDefinition(this.getPadFileResolver(), "ANNOTATION a : Integer DEFAULT -42;");
            this.assertNoErrorTokens(cu.getTokenList());
            var decl = cu.getStatements()[0];
            equal("-42",decl.getDefault().getShortDescription());
        };
        TestsUnitHanaDdlParser.prototype.annotationDefinitionsWithArrayType = function() {
            var cu = this.getParser().parseAnnotationDefinition(this.getPadFileResolver(), "ANNOTATION a : array of String(10);");
            this.assertNoErrorTokens(cu.getTokenList());
            var decl = cu.getStatements()[0];
            equal(15,decl.getArrayToken().getOffset());
            equal(21,decl.getArrayOfToken().getOffset());
            equal("String(10)",decl.getTypeId());
        };
        TestsUnitHanaDdlParser.prototype.annotationDefinitionsWithPositiveIntegerLiteralInDefault = function() {
            var cu = this.getParser().parseAnnotationDefinition(this.getPadFileResolver(), "ANNOTATION a : Integer DEFAULT +42;");
            this.assertNoErrorTokens(cu.getTokenList());
            var decl = cu.getStatements()[0];
            equal("+42",decl.getDefault().getShortDescription());
        };
        TestsUnitHanaDdlParser.prototype.cocoIncompleteNamespaceDeclaration = function() {
            var source = "name entity";
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source, 1,
                "name".length + 1);
            equal(1,completions.length);
            equal(rnd.Utils.arrayContains(completions, "namespace"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoLongerPathWithComments = function() {
            var sourceWithSelections = "" + //
                "CONTEXT c{             " + //
                "	ENTITY e1{          " + //
                "	 KEY k1 :Integer;   " + //
                "    asso1  : association to e2; " + //
                "	 };                 " + //
                "	                    " + //
                "	ENTITY e2{          " + //
                "	 KEY k2 :Integer;   " + //
                "    asso2  : association to e1; " + //
                "	 };                 " + //
                "	                    " + //
                "	 VIEW v1 AS         " + //
                "	 SELECT FROM e1{    " + //
                "    /* coCo not working after dot if comment is inserted before dot: */" + //
                "       asso1/*coCoAfterDotNotWorking*/./*comm*/asso2/*comment*/ /*comment*/.k#selection.one# as alias1, " + //
                "	 	k" + //
                "	 }                  " + //
                "	 ;                  " + //
                "};					    ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "k1"),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoReplacementLengthOffsetForPrimitiveTypesSetCorrectly = function() {
            var sourceWithSelections = "" + //
                "CONTEXT c{ " + //
                "ENTITY e1{ " + //
                "KEY k1 :Inte#selection.one#ger; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getTypedCodeCompletions5(this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            var compl = this.__getCompletion(completions, "Integer");
            equal(compl!=null,true);
            equal(30,compl.getReplacementOffset());
            equal(7,compl.getReplacementLength());
            sourceWithSelections="" + "CONTEXT c{             " + "	ENTITY e1{          "+ "	 KEY k1 :Integer;   k2 : I#selection.one#   ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getTypedCodeCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            compl=this.__getCompletion(completions,"Integer");
            equal(compl!=null,true);
            equal(70,compl.getReplacementOffset());
            equal(1,compl.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociation = function() {
            var source = "namespace ns1; context context { entity a { key id:Integer;}; entity b { assoc: association to a;}; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = cu.getStatements()[1];
            var a = cd.getStatements()[0];
            equal("a",a.getName());
            var b = cd.getStatements()[1];
            equal("b",b.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociation2 = function() {
            var source = "namespace ns1; context context { entity a { key id:Integer;}; entity b { assoc: association to conText.a;}; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = cu.getStatements()[1];
            var a = cd.getStatements()[0];
            equal("a",a.getName());
            var b = cd.getStatements()[1];
            equal("b",b.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociationNestedContext = function() {
            var source = "namespace ns1; context root { context context { entity a { key id:Integer;}; entity b { assoc: association to a;}; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = (cu.getStatements()[1]).getStatements()[0];
            var a = cd.getStatements()[0];
            equal("a",a.getName());
            var b = cd.getStatements()[1];
            equal("b",b.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociationNestedNestedContext = function() {
            var source = "namespace ns1; context root { context context { entity b { assoc: association to bEntity;}; }; context secondContext { context thirdContext{ entity bentity { key id:Integer; }; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = (cu.getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var cd2 = (cu.getStatements()[1]).getStatements()[1];
            var bEntity = (cd2.getStatements()[0]).getStatements()[0];
            equal("bentity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociationNestedNestedContext2 = function() {
            var source = "namespace ns1; context root { context context { entity b { assoc: association to root.secondContext.thirdContext.bEntity;}; }; context secondContext { context thirdContext{ entity bentity { key id:Integer; }; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = (cu.getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var cd2 = (cu.getStatements()[1]).getStatements()[1];
            var bEntity = (cd2.getStatements()[0]).getStatements()[0];
            equal("bentity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForInternalAssociationNestedNestedContext3 = function() {
            var source = "namespace ns1; context root { context context { entity b { assoc: association to secondContext.thirdContext.bEntity;}; context secondContext { context thirdContext{ entity bentity { key id:Integer; }; }; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = (cu.getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var thirdContext = (cd.getStatements()[1]).getStatements()[0];
            var bEntity = thirdContext.getStatements()[0];
            equal("bentity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityNameResolutionToUpperHierarchy = function() {
            var source = "namespace ns1; context root { entity bEntity { key id:Integer; }; context context { context secondContext { entity b { assoc: association to bEntity;}; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = ((cu.getStatements()[1]).getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var bEntity = (cu.getStatements()[1]).getStatements()[0];
            equal("bEntity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityNameResolutionToUpperHierarchy2 = function() {
            var source = "namespace ns1; context root { entity bEntity { key id:Integer; }; context context { context secondContext { entity b { assoc: association to root.bEntity;}; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = ((cu.getStatements()[1]).getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var bEntity = (cu.getStatements()[1]).getStatements()[0];
            equal("bEntity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityNameResolutionToUpperHierarchy3 = function() {
            var source = "namespace ns1; context root { context rootSub { entity bEntity { key id:Integer; }; }; context context { context secondContext { entity b { assoc: association to rootSub.bEntity;}; }; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = ((cu.getStatements()[1]).getStatements()[1]).getStatements()[0];
            var b = cd.getStatements()[0];
            equal("b",b.getName());
            var thirdContext = (cu.getStatements()[1]).getStatements()[0];
            var bEntity = thirdContext.getStatements()[0];
            equal("bEntity",bEntity.getName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForExternalAssociation = function() {
            var source = "namespace ns1; context root { entity a { assoc: association to external; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = cu.getStatements()[1];
            var a = cd.getStatements()[0];
            equal("a",a.getName());
            var assoc = a.getElements()[0];
            equal("external",assoc.getTargetEntityName());
        };
        TestsUnitHanaDdlParser.prototype.targetEntityReferenceForExternalAssociationWithNamespace = function() {
            var source = "namespace com.sap.ns1; USING com.sap.ns2::context AS extCont; context root { context context { entity a { key id:Integer;}; entity b { assoc: association to extCont.a;}; }; };";
            var parser = this.getParser();
            var cu = parser.parseAndGetAst3(this.getPadFileResolver(), null, source);
            var cd = (cu.getStatements()[2]).getStatements()[0];
            var a = cd.getStatements()[0];
            equal("a",a.getName());
            var b = cd.getStatements()[1];
            equal("b",b.getName());
        };
        TestsUnitHanaDdlParser.prototype.replacementLengthNotLost = function() {
            var source = "CONTEXT ctx { ENTITY en { field1 : In";
            var parser = this.getParser();
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1();
            var compls = parser.getTypedCodeCompletions5(this.getPadFileResolver(), repAccess, source, 1,
                source.length + 1);
            var first = compls[0];
            equal("Integer",first.getName());
            equal(2,first.getReplacementLength());
            parser.parseAndGetAst3(this.getPadFileResolver(),repAccess,source);
            equal("Integer",first.getName());
            equal(2,first.getReplacementLength());
        };
        TestsUnitHanaDdlParser.prototype.cocoDataSourceWithQuotes = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace ns1; context test {  " + //
                " define view v as select from \"playground.test::test1\" { #selection.begin.one##selection.end.one#  };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "\"playground.test::test1\""),true);
        };
        TestsUnitHanaDdlParser.prototype.cocoDontProposeOwnViewAsDatasource = function() {
            var parser = this.getParser();
            var sourceWithSelections = "NAMESPACE ns1; CONTEXT test {  " + //
                " DEFINE VIEW myview AS SELECT FROM myvi#selection.begin.one##selection.end.one# { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myview"),false);
        };
        TestsUnitHanaDdlParser.prototype.cocoDontProposeOwnViewAsDatasourceNoPrefix = function() {
            var parser = this.getParser();
            var sourceWithSelections = "NAMESPACE ns1; CONTEXT test {  " + //
                " DEFINE VIEW myview AS SELECT FROM #selection.begin.one##selection.end.one# { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myview"),false);
        };


//TEST METHODS

        TestsUnitHanaDdlParser.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParser;
    }
);