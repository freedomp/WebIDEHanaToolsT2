/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (
        AbstractV5HanaDdlParserTests
        ) {
        function TestsUnitHanaDdlParserV5SeriesFunction() {
        }
        TestsUnitHanaDdlParserV5SeriesFunction.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5SeriesFunction.prototype.cocoNoMinusAndPlusForNumberInSeriesFunction = function() {
            var source = ""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "    MINVALUE ";
            var compl = this.getParser().getCompletions4(this.getPadFileResolver(), source, 1, source.length + 1);
            ok( compl.indexOf("-") < 0);
            ok( compl.indexOf("+") < 0);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5SeriesFunction.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5SeriesFunction;
    }
);