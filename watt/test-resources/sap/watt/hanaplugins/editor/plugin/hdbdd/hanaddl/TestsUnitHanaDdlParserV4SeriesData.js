/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define([ "rndrt/rnd", "./AbstractV4HanaDdlParserTests"
        ], // dependencies
    function(rnd, AbstractV4HanaDdlParserTests) {
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        var Category = rnd.Category;

        function TestsUnitHanaDdlParserV4SeriesData() {
        }

        TestsUnitHanaDdlParserV4SeriesData.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesPeriodWithNullIdAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    PERIOD FOR SERIES ( NULL, id) "//
                + "  ); "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesPeriodWithIdAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( " //
                + "    PERIOD FOR SERIES ( id) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesPeriodWithIdIdAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    PERIOD FOR SERIES ( id, id ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesPeriodWithIdNullAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesKeyListWithOneKeyAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( " //
                + "     SERIES KEY (id)"//
                + "     PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesKeyListWithMultipeKeyAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( " //
                + "    SERIES KEY (id1, id2, id3)"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.notExquidistantAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    NOT EQUIDISTANT"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY +1"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByNegativeIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY -5"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByRalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY 3.5"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByWithMissingElementsAllowedAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY 3.5 MISSING ELEMENTS ALLOWED"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByWithMissingElementsNotAllowedAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY 3.5 MISSING ELEMENTS NOT ALLOWED"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantVaryingAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT PIECEWISE"//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByYearIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 1 YEAR "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByMonthIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 2.4 MONTH "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByDayIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 3 DAY "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByHourIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 'abc' HOUR "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementByMinuteIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 1 MINUTE "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.exquidistantIncrementBySecondIntervalAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    EQUIDISTANT INCREMENT BY INTERVAL 0 SECOND "//
                + "    PERIOD FOR SERIES ( id ) "//
                + "  )"//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesNoMinValueAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    NO MINVALUE"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMinValueNegativeIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MINVALUE -5"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMinValueIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MINVALUE 5"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMinValueLiteralAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MINVALUE 'abc'"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesNoMaxValueAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    NO MAXVALUE"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMaxValueNegativeIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MAXVALUE -5"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMaxValueIntAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MAXVALUE 5"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesMaxValueLiteralAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MAXVALUE 'abc'"//
                + "    PERIOD FOR SERIES ( id, NULL ) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesAllClausesAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    SERIES KEY (id) "//
                + "    NOT EQUIDISTANT "//
                + "    NO MINVALUE  "//
                + "    MAXVALUE 4 "//
                + "    PERIOD FOR SERIES ( NULL, id)"//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesAllClausesInDifferentOrderAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    PERIOD FOR SERIES ( NULL, id)"//
                + "    MAXVALUE 4 "//
                + "    NO MINVALUE  "//
                + "    NOT EQUIDISTANT "//
                + "    SERIES KEY (id) "//
                + "  ) "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.seriesPeriodWithAlternateSeriesAccepted = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    PERIOD FOR SERIES ( NULL, id) "//
                + "    ALTERNATE PERIOD FOR SERIES ( key1, key2, key3)"//
                + "  ); "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.series_round_function = function() {
            var source = "DEFINE VIEW v AS SELECT FROM ds { series_round( a , ROUND_HALF_UP, ROUND_HALF_DOWN  ) };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
            var t = this.__getToken(tokens, "ROUND_HALF_UP");
            equal(Category.CAT_IDENTIFIER,t.m_category);
            t = this.__getToken(tokens,"ROUND_HALF_DOWN");
            equal(Category.CAT_KEYWORD,t.m_category);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.series_period_to_element_function = function() {
            var source = "DEFINE VIEW v AS SELECT FROM ds { SERIES_PERIOD_TO_ELEMENT( a , ROUND_HALF_UP, b, c  ) };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
            var t = this.__getToken(tokens, "ROUND_HALF_UP");
            equal(Category.CAT_IDENTIFIER,t.m_category);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.series_element_to_period_function = function() {
            var source = "DEFINE VIEW v AS SELECT FROM ds { SERIES_ELEMENT_TO_PERIOD( a , ROUND_HALF_UP, b, c, ROUND_HALF_DOWN  ) };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
            var t = this.__getToken(tokens, "ROUND_HALF_UP");
            equal(Category.CAT_IDENTIFIER,t.m_category);
            t = this.__getToken(tokens,"ROUND_HALF_DOWN");
            equal(Category.CAT_KEYWORD,t.m_category);
        };
        TestsUnitHanaDdlParserV4SeriesData.prototype.__getToken = function(tokens,lexem) {
            for (var tCount = 0;tCount < tokens.length;tCount++) {
                var t = tokens[tCount];
                if (rnd.Utils.stringEqualsIgnoreCase(lexem, t.m_lexem)) {
                    return t;
                }
            }
            return null;
        };

        // TEST METHODS

        TestsUnitHanaDdlParserV4SeriesData.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    });