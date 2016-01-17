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
        function TestsUnitHanaDdlParserV4IndexViaGrammar() {
        }
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.singleUniqueAscendingIndexOnOneFieldAccepted = function() {
            var source;
            var version = parseInt(this.getParser().getVersion());
            if (version <= 4) {
                source = "" + "ENTITY e1 { " + "  UNIQUE INDEX indexName ON (a) ASC;" + "}";
            }else{
                source = "" + "ENTITY e1 { " + "  " + "} TECHNICAL CONFIGURATION { UNIQUE INDEX indexName ON (a) ASC; };";
            }
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.singleUniqueDescendingIndexOnOneFieldAccepted = function() {
            var source;
            var version = parseInt(this.getParser().getVersion());
            if (version <= 4) {
                source = "" + "ENTITY e1 { " + "  UNIQUE INDEX indexName ON (a) DESC;" + "}";
            }else{
                source = "" + "ENTITY e1 { " + "  " + "} TECHNICAL CONFIGURATION { UNIQUE INDEX indexName ON (a) DESC; };";
            }
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.singleNoneUniqueIndexOnOneFieldAccepted = function() {
            var version = parseInt(this.getParser().getVersion());
            var source;
            if (version <= 4) {
                source = "" + "ENTITY e1 { " + "  INDEX indexName ON (a);" + "}";
            }else{
                source = "" + "ENTITY e1 { " + "  " + "} TECHNICAL CONFIGURATION { INDEX indexName ON (a); };";
            }
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.multipleNoneUniqueIndexesOnOneFieldAccepted = function() {
            var version = parseInt(this.getParser().getVersion());
            var source;
            if (version <= 4) {
                source = "" + "ENTITY e1 { " + "  INDEX indexName1 ON (a);" + "  INDEX indexName2 ON (a);" + "  INDEX indexName3 ON (a);" + "}";
            }else{
                source = "" + "ENTITY e1 { " + "} TECHNICAL CONFIGURATION {   INDEX indexName1 ON (a); " + "					  INDEX indexName2 ON (a); " + "					  INDEX indexName3 ON (a); };";
            }
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.uniqueIndexOnMultipleFieldsAccepted = function() {
            var source;
            var version = parseInt(this.getParser().getVersion());
            if (version <= 4) {
                source = "" + "ENTITY e1 { " + "  UNIQUE INDEX indexName ON (a,\"b\",c,d);" + "}";
            }else{
                source = "" + "ENTITY e1 { " + "  " + "}TECHNICAL CONFIGURATION { UNIQUE INDEX indexName ON (a,\\\"b\\\",c,d); };";
            }
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.astBrokenIndexWithinEntityNotCrashing = function() {
            var incompleteAst = this.parseSourceAndGetAst("ENTITY a { el : Integer; INDEX hugo ON ( mypath, mypath2 ) ASC rubbish };");
            ok(incompleteAst, "(erroneous) AST expected" );
            this.assertErrorTokenAtTokenIndex(incompleteAst.tokenList,16);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4IndexViaGrammar.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4IndexViaGrammar;
    }
);