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
        function TestsUnitHanaDdlParserV5CalculatedFields() {
        }
        TestsUnitHanaDdlParserV5CalculatedFields.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5CalculatedFields.prototype.calculatedFieldAfterTypeSpec = function() {
            var source = "ENTITY en {" + //
                " el1 : Integer = 3 + 3;" + //
                "};";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CalculatedFields.prototype.calculatedFieldWithoutTypeSpec = function() {
            var source = "ENTITY en {" + //
                " el1 = 3 + el2;" + //
                "};";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CalculatedFields.prototype.calculatedFieldInAdHocElementDeclaration = function() {
            var tokens = this.parseSource("VIEW myView AS SELECT FROM table MIXIN { target : ASSOCIATION TO target ON a=b = 3; } INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CalculatedFields.prototype.calculatedFieldInAdHocElementDeclarationWithoutTypeSpec = function() {
            var tokens = this.parseSource("VIEW myView AS SELECT FROM table MIXIN { target = 3; } INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5CalculatedFields.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5CalculatedFields;
    }
);