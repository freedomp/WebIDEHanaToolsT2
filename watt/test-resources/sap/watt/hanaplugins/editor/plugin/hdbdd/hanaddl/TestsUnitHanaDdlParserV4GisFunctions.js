/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests",
        "rndrt/rnd"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests,rnd
        ) {
        var Category = rnd.Category;

        function TestsUnitHanaDdlParserV4GisFunctions() {
        }
        TestsUnitHanaDdlParserV4GisFunctions.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4GisFunctions.prototype.to_geometryAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TO_GEOMETRY(expr2, expr2, expr3) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.to_geometryIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { TO_GEOMETRY(expr2, expr2, expr3) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(1,container.getExpressions().length);
            var func = container.getExpressions()[0];
            equal("TO_GEOMETRY",func.getName().m_lexem);
            equal(3,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_geomfromwkbAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ST_GEOMFROMWKB() AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_geomfromwkbIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { ST_GEOMFROMWKB() AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(1,container.getExpressions().length);
            var func = container.getExpressions()[0];
            equal("ST_GEOMFROMWKB",func.getName().m_lexem);
            equal(0,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_unionaggrAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ST_UNIONAGGR(a.b.c) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_unionaggrWithoutParamsNotAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ST_UNIONAGGR() AS f1 };");
            this.assertErrorTokenAtTokenIndex(tokens,9);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_unionaggrIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { ST_UNIONAGGR(a.b.c) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(1,container.getExpressions().length);
            var func = container.getExpressions()[0];
            equal("ST_UNIONAGGR",func.getName().m_lexem);
            equal(1,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterPathAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { a.b.c.ST_CONTAINS(1+2) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[13].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterPathIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a.b.c.ST_CONTAINS(1+2) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(2,container.getExpressions().length);
            var path = container.getExpressions()[0];
            equal("a.b.c",path.getShortDescription());
            var func = container.getExpressions()[1];
            equal("ST_CONTAINS",func.getName().m_lexem);
            equal(1,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_assvgAfterPathAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { a.b.c.ST_ASSVG(a=>1) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[13].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_assvgAfterPathIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a.b.c.ST_ASSVG(a=>1) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(2,container.getExpressions().length);
            var path = container.getExpressions()[0];
            equal("a.b.c",path.getShortDescription());
            var func = container.getExpressions()[1];
            equal("ST_ASSVG",func.getName().m_lexem);
            var parameters = func.getParameters();
            equal(1,parameters.length);
            equal("a",parameters[0].getName().m_lexem);
            equal("1",parameters[0].getExpression().getShortDescription());
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterGisFunctionAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { TO_GEOMETRY().ST_CONTAINS(1+2) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[11].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterGisFunctionIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { TO_GEOMETRY().ST_CONTAINS(1+2) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(2,container.getExpressions().length);
            var path = container.getExpressions()[0];
            equal("TO_GEOMETRY()",path.getShortDescription());
            var func = container.getExpressions()[1];
            equal("ST_CONTAINS",func.getName().m_lexem);
            equal(1,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterST_GEOMFROMWKBIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { ST_GEOMFROMWKB().ST_CONTAINS(1+2) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            equal(2,container.getExpressions().length);
            var path = container.getExpressions()[0];
            equal("ST_GEOMFROMWKB()",path.getShortDescription());
            var func = container.getExpressions()[1];
            equal("ST_CONTAINS",func.getName().m_lexem);
            equal(1,func.getParameters().length);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.st_containsAfterST_UNIONAGGRAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ST_UNIONAGGR(a).ST_CONTAINS(1+2) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[12].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.newST_GeometryAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { NEW ST_GEOMETRY(expr2, expr2, expr3) AS f1 };");
            this.assertNoErrorTokens(tokens);
            equal(Category.CAT_KEYWORD,tokens[7].m_category);
            equal(Category.CAT_KEYWORD,tokens[8].m_category);
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.newST_GeometryIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { NEW ST_GEOMETRY(expr2, expr2, expr3) AS f1 };");
            var container = this.__getFristSelectListEntryAsExpressionsContainerExpr(cu);
            var ctor = container.getExpressions()[0];
            equal("NEW",ctor.getNewKeyword().m_lexem);
            equal("ST_GEOMETRY",ctor.getName().m_lexem);
            equal(3,ctor.getParameters().length);
            var expression = ctor.getParameters()[2];
            equal("expr3",expression.getShortDescription());
        };
        TestsUnitHanaDdlParserV4GisFunctions.prototype.__getFristSelectListEntryAsExpressionsContainerExpr = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var expressionsContainer = entry.getExpression();
            return expressionsContainer;
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4GisFunctions.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4GisFunctions;
    }
);