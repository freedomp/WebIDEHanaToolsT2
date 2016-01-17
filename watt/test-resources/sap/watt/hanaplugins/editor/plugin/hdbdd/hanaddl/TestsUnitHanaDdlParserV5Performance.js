/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests
        ) {
        "use strict";

        function TestsUnitHanaDdlParserV5Performance() {
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

        var hugeClassic = getFileContent("huge.hdbdd");
        var hugeTC = getFileContent("hugeTC.hdbdd");

        // statistics
        var  classic_tokens = null;
        var  classic_bytes = null;
        var  modern_tokens = null;
        var  modern_bytes = null;

        var  parseOnlyClassic_elapsed = null;
        var  parseOnlyTC_elapsed = null;
        var  astClassic_elapsed = null;
        var  astTC_elapsed = null;

        function derLetzteMachtDasLichtAus(assert) {
            // All done...
            if(classic_bytes && classic_tokens && modern_bytes && modern_tokens &&
                parseOnlyClassic_elapsed && parseOnlyTC_elapsed &&
                astClassic_elapsed && astTC_elapsed) {

                // Assert that both test files are relatively equal in size and number of tokens

                var bytesDelta = Math.abs( classic_bytes - modern_bytes );
                var relativeSizeDiff = bytesDelta / classic_bytes;
                assert.ok(relativeSizeDiff < 0.1, "Relative size difference of source files: " + relativeSizeDiff);

                var tokenDelta = Math.abs( classic_tokens - modern_tokens );
                var relativeTokenDiff = tokenDelta / classic_tokens;
                assert.ok(relativeTokenDiff < 0.1, "Relative difference of number of tokens: " + relativeTokenDiff);


                // Assert elapsed times for modern approach

                var parseFactor = parseOnlyTC_elapsed / parseOnlyClassic_elapsed;
                var astFactor = astTC_elapsed / astClassic_elapsed;

                var factorsValid = parseFactor && astFactor && parseFactor > 0 && astFactor > 0;
                assert.ok(factorsValid, "parseFactor: "+ parseFactor + ", astFactor: " + astFactor);

                var relativeAstDiff = astFactor / parseFactor - 1;
                assert.ok(Math.abs(relativeAstDiff) < 0.3, "Relative (to parse factors) difference of AST factors: " + relativeAstDiff);
            }
        }

        TestsUnitHanaDdlParserV5Performance.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5Performance.prototype.parseOnlyClassic = function(assert) {
            var start = new Date();
            var parsed = this.parseSource(hugeClassic);
            var end = new Date();
            assert.ok(true, "Parsing (old) took " + (end-start) + "ms");
            this.assertNoErrorTokens(parsed);
            // TODO check last token category to not be maybekeyword

            classic_bytes = hugeClassic.length;
            classic_tokens = parsed.length;

            parseOnlyClassic_elapsed = end-start;

            derLetzteMachtDasLichtAus(assert);
        };

        TestsUnitHanaDdlParserV5Performance.prototype.parseOnlyTC = function(assert) {
            var start = new Date();
            var parsed = this.parseSource(hugeTC);
            var end = new Date();
            assert.ok(true, "Parsing (new) took " + (end-start) + "ms");
            this.assertNoErrorTokens(parsed);
            // TODO check last token category to not be maybekeyword

            modern_bytes = hugeTC.length;
            modern_tokens = parsed.length;

            parseOnlyTC_elapsed = end-start;

            derLetzteMachtDasLichtAus(assert);
        };

        TestsUnitHanaDdlParserV5Performance.prototype.astClassic = function(assert) {
            var start = new Date();
            var ast = this.parseSourceAndGetAst(hugeClassic);
            var end = new Date();
            assert.ok(true, "Building (old) AST took " + (end-start) + "ms");
            this.assertNoErrorTokens(ast.getTokens());

            astClassic_elapsed = end-start;

            derLetzteMachtDasLichtAus(assert);
        };

        TestsUnitHanaDdlParserV5Performance.prototype.astTC = function(assert) {
            var start = new Date();
            var ast = this.parseSourceAndGetAst(hugeTC);
            var end = new Date();
            assert.ok(true, "Building (new) AST took " + (end-start) + "ms");
            this.assertNoErrorTokens(ast.getTokens());

            astTC_elapsed = end-start;

            derLetzteMachtDasLichtAus(assert);
        };

//TEST METHODS

        TestsUnitHanaDdlParserV5Performance.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Performance;
    }
);
