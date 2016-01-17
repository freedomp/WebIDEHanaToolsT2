/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "rndrt/rnd", "commonddl/commonddlNonUi",
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (rnd, commonddlNonUi, AbstractV5HanaDdlParserTests) {

        var Token = rnd.Token;

        function TestsUnitHanaDdlParserV5CdsExtensions() {
        }

        TestsUnitHanaDdlParserV5CdsExtensions.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.inPackageDeclaration = function () {
            var tokens = this.parseSource("IN PACKAGE hugo; TYPE a : Integer;");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extensionPackageDefinition = function () {
            var tokens = this.parseSource("EXTENSION PACKAGE pack;");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extensionPackageDefinitionWithUsing = function () {
            var tokens = this.parseSource("EXTENSION PACKAGE pack DEPENDS ON a;");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extensionPackageDefinitionWithTwoUsings = function () {
            var tokens = this.parseSource("EXTENSION PACKAGE pack DEPENDS ON a,b;");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extendContext = function () {
            var tokens = this.parseSource("EXTEND CONTEXT ctx WITH { DEFINE ENTITY en2 { el : Integer;}; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extendEntity = function () {
            var tokens = this.parseSource("EXTEND ENTITY en WITH { elExt : Integer; };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5CdsExtensions.prototype.extendType = function () {
            var tokens = this.parseSource("EXTEND TYPE ty WITH { elExt : Integer; };");
            this.assertNoErrorTokens(tokens);
        };

        TestsUnitHanaDdlParserV5CdsExtensions.prototype.astInPackageWithNamespace = function () {
            var ast = this.parseSourceAndGetAst("IN PACKAGE namespaceName.subNamespaceName::packageName.subPackageName;");

            var statement = ast.getStatements()[0];
            var pathTypeName = ast.getStatements()[0].namePath.typeName;
            var pathEntries = ast.getStatements()[0].namePath.pathEntries;

            ok(statement, "statement is not null");
            ok(statement instanceof commonddlNonUi.SourceRangeImpl, "statement is an instance of SourceRangeImpl");
            equal(statement.container, ast, "statement's container is equals to ast");
            equal(statement.startTokenIndex, 0, "statement's startTokenIndex is \"0\"");
            equal(statement.endTokenIndex, 9, "statement's endTokenIndex is \"9\"");
            equal(statement.ruleName, "InPackageDeclaration", "statement's rule name is \"InPackageDeclaration\"");

            equal(pathTypeName, "PathWithNamespace", "path type name is \"PathWithNamespace\"");

            equal(pathEntries.length, "4", "path length is \"4\"");
            equal(pathEntries[0].nameToken.m_lexem, "namespaceName", "path entry is \"namespaceName\"");
            equal(pathEntries[1].nameToken.m_lexem, "subNamespaceName", "path entry is \"subNamespaceName\"");
            equal(pathEntries[2].nameToken.m_lexem, "packageName", "path entry is \"packageName\"");
            equal(pathEntries[3].nameToken.m_lexem, "subPackageName", "path entry is \"subPackageName\"");
        };

        TestsUnitHanaDdlParserV5CdsExtensions.prototype.astInPackageWithoutNamespace = function () {
            var ast = this.parseSourceAndGetAst("IN PACKAGE namespaceName.subNamespaceName.packageName.subPackageName;");

            var statement = ast.getStatements()[0];
            var pathTypeName = ast.getStatements()[0].namePath.typeName;
            var pathEntries = ast.getStatements()[0].namePath.pathEntries;

            ok(statement, "statement is not null");
            ok(statement instanceof commonddlNonUi.SourceRangeImpl, "statement is an instance of SourceRangeImpl");
            equal(statement.container, ast, "statement's container is equals to ast");
            equal(statement.startTokenIndex, 0, "statement's startTokenIndex is \"0\"");
            equal(statement.endTokenIndex, 9, "statement's endTokenIndex is \"9\"");
            equal(statement.ruleName, "InPackageDeclaration", "statement's rule name is \"InPackageDeclaration\"");

            equal(pathTypeName, "PathSimple", "path type name is \"PathSimple\"");

            equal(pathEntries.length, "4", "path length is \"4\"");
            equal(pathEntries[0].nameToken.m_lexem, "namespaceName", "path entry is \"namespaceName\"");
            equal(pathEntries[1].nameToken.m_lexem, "subNamespaceName", "path entry is \"subNamespaceName\"");
            equal(pathEntries[2].nameToken.m_lexem, "packageName", "path entry is \"packageName\"");
            equal(pathEntries[3].nameToken.m_lexem, "subPackageName", "path entry is \"subPackageName\"");
        };

//TEST METHODS

        TestsUnitHanaDdlParserV5CdsExtensions.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5CdsExtensions;
    }
);