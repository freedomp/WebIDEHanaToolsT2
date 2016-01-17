/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests",
        "commonddl/commonddlNonUi"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests,
        commonddl
        ) {
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5Joins() {
        }
        TestsUnitHanaDdlParserV5Joins.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5Joins.prototype.innerJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight INNER JOIN scarr ON sflight.carrid = scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.leftOuterJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight LEFT OUTER JOIN scarr ON carrid < scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.rightOuterJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight RIGHT OUTER JOIN scarr ON carrid < scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.fullOuterJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight FULL OUTER JOIN scarr ON carrid < scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.fullJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight FULL JOIN scarr ON carrid < scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.nestedJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight FULL JOIN spfli JOIN scarr ON spfli.carrid < scarr.carrid ON sflight.carrid = spfli.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.nestedJoinWithBrackets = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight FULL JOIN ( spfli JOIN scarr ON spfli.carrid < scarr.carrid ) ON sflight.carrid = spfli.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.astNestedJoinWithBrackets = function() {
            var ast = this.parseSourceAndGetAst("VIEW v AS SELECT FROM sflight FULL JOIN ( spfli JOIN scarr ON spfli.carrid < scarr.carrid ) ON sflight.carrid = spfli.carrid { element };");

            this.assertNoErrorTokens(ast.tokenList);

            var from = ast.statements[0].select.from;
            equal(commonddl.JoinEnum.FULL, from.joinEnum);
            equal("sflight",from.left.namePathExpression.pathEntries[0].nameToken.m_lexem);

            equal(commonddl.JoinEnum.LEFT,from.right.joinEnum);
            equal("spfli",from.right.left.namePathExpression.pathEntries[0].nameToken.m_lexem);
            equal("scarr",from.right.right.namePathExpression.pathEntries[0].nameToken.m_lexem);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.crossJoin = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight CROSS JOIN spfli { element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5Joins.prototype.nestedCrossAndNoramalJoin = function()  {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight CROSS JOIN spfli JOIN scarr ON spfli.carrid = scarr.carrid { element };");
            this.assertNoErrorTokens(tokens);
        };

//TEST METHODS

        TestsUnitHanaDdlParserV5Joins.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Joins;
    }
);