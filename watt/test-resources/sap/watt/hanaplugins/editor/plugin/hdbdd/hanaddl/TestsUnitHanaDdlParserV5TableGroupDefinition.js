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
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5TableGroupDefinition() {
        }
        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype.tableGroupNameDefinition = function() {
            var tokens = this.parseSource("ENTITY entity { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY HASH ( path ) PARTITIONS 3; GROUP NAME foo;  };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype.tableGroupTypeDefinition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION {  PARTITION BY HASH ( path ) PARTITIONS 3; GROUP TYPE foo; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype.tableGroupSubtypeDefinition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { PARTITION BY HASH ( path ) PARTITIONS 3; GROUP SUBTYPE foo; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype.tableGroupNameTypeAndSubtypeDefinition = function() {
            var tokens = this.parseSource("ENTITY a { el : Integer; } TECHNICAL CONFIGURATION { GROUP NAME a GROUP TYPE b GROUP SUBTYPE c; PARTITION BY HASH ( path ) PARTITIONS 3; };");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5TableGroupDefinition.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5TableGroupDefinition;
    }
);