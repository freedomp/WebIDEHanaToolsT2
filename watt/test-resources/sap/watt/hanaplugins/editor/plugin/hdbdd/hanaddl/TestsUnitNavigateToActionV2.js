// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [ "commonddl/commonddlNonUi",
        "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "./AbstractV2HanaDdlParserTests",
        "NavigationTestUtil"

    ], // dependencies
    function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV2HanaDdlParserTests,NavigationTestUtil) {
        var AbstractAnnotationImpl = commonddlNonUi.AbstractAnnotationImpl;
        var CompilationUnitImpl = commonddlNonUi.CompilationUnitImpl;
        var ConstDeclarationImpl = commonddlNonUi.ConstDeclarationImpl;
        var ContextDeclarationImpl = commonddlNonUi.ContextDeclarationImpl;
        var DdlStatementImpl = commonddlNonUi.DdlStatementImpl;
        var ElementDeclarationImpl = commonddlNonUi.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddlNonUi.EntityDeclarationImpl;
        var EnumerationDeclarationImpl = commonddlNonUi.EnumerationDeclarationImpl;
        var EnumerationValueImpl = commonddlNonUi.EnumerationValueImpl;
        var LiteralExpressionImpl = commonddlNonUi.LiteralExpressionImpl;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var ErrorState = rnd.ErrorState;
        function TestsUnitNavigateToActionV2() {
        }
        TestsUnitNavigateToActionV2.prototype = Object.create(AbstractV2HanaDdlParserTests.prototype);
        TestsUnitNavigateToActionV2.prototype.navigateToConst = function() {
            var that = this;
            NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { "+ "    const #selection.begin.one#intConst#selection.end.one# : Integer = 2; "+ "    const intConst2 : Integer =  3 + in#selection.begin.two##selection.end.two#tConst; "+ " 	type simple1 : Integer; "+ "};",that.getParser(),that.getPadFileResolver()).then(function() {
            }).then(function() {
                return NavigationTestUtil.navigate("namespace fu1.tm1; " + "context navigation_types { " + "    const #selection.begin.one#intConst#selection.end.one# : Integer = 2; " + "    const intConst2 : Integer =  3 + navigation_types.in#selection.begin.two##selection.end.two#tConst; " + " 	type simple1 : Integer; " + "};", that.getParser(), that.getPadFileResolver());
            });
        };


//      TEST METHODS

        TestsUnitNavigateToActionV2.prototype.testAllMethodsInSupportedVersions(true);

        QUnit.start();

    }
);