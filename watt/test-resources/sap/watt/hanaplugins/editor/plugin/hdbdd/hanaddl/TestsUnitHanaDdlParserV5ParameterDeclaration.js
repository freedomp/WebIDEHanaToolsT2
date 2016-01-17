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
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5ParameterDeclaration() {
        }

        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);

        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype.singleParameterDeclaration = function() {
            var source = "VIEW v WITH PARAMETERS a : mytype AS SELECT FROM sflight { KEY el AS e2 };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype.singleParameterDeclarationWithDefault = function() {
            var source = "VIEW v WITH PARAMETERS a : mytype DEFAULT mya AS SELECT FROM sflight { KEY el AS e2 };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype.multipleParameterDeclarationWithDefault = function() {
            var source = "VIEW v WITH PARAMETERS a : mytype DEFAULT mya, b : myothertype AS SELECT FROM sflight { KEY el AS e2 };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype.withStructuredPrivilegeCheck = function() {
            var source = "VIEW v WITH PARAMETERS a : mytype AS SELECT FROM sflight { KEY el AS e2 } WITH STRUCTURED PRIVILEGE CHECK;";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };

//TEST METHODS

        TestsUnitHanaDdlParserV5ParameterDeclaration.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    }
);