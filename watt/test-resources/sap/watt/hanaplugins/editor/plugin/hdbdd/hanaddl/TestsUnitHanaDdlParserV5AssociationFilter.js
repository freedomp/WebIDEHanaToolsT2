/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./TestFriendlyHanaRepositoryAccess",
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (
        TestFriendlyHanaRepositoryAccess,
        rnd,
        AbstractV5HanaDdlParserTests
        ) {
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        function TestsUnitHanaDdlParserV5AssociationFilter() {
        }
        TestsUnitHanaDdlParserV5AssociationFilter.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5AssociationFilter.prototype.cardinalityInsideAssociationFilter = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM ds { assoc[1:value=3].element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5AssociationFilter.prototype.negativeCardinalityInsideAssociationFilter = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM ds { assoc[-1:value=3].element };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5AssociationFilter.prototype.cocoMinusInFilter = function() {
            var source = "VIEW v AS SELECT FROM ds { assoc[ ";
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source, 1,
                    source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "-"),true);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5AssociationFilter.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
   }
);