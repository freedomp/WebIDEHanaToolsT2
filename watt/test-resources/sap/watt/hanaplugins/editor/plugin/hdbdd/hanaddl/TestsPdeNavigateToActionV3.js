RequirePaths.setRequireJsConfigForHanaDdl(2);

// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
    [
        "commonddl/commonddlNonUi",
        "./TestUtilEclipseSelectionHandling",
        "EclipseUtil",
        "./System",
        "rndrt/rnd",
        "./AbstractV3HanaDdlParserTests",
        "NavigationTestUtil"

    ], //dependencies
    function (
        commonddlNonUi,
        TestUtilEclipseSelectionHandling,
        EclipseUtil,
        System,
        rnd,
        AbstractV3HanaDdlParserTests,
        NavigationTestUtil
        ) {
        function TestsPdeNavigateToActionV3() {
        }
        TestsPdeNavigateToActionV3.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
        TestsPdeNavigateToActionV3.project=null;
        TestsPdeNavigateToActionV3.targetSelections=null;
        TestsPdeNavigateToActionV3.classSetup = function() {
            TestsPdeNavigateToActionV3.createTargetFile();
        };

        TestsPdeNavigateToActionV3.createTargetFile = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "NAMESPACE d031119; " + //
                "CONTEXT #selection.begin.targetContext#using0#selection.end.targetContext# { " + //
                "CONTEXT #selection.begin.targetNestedContext#nested#selection.end.targetNestedContext# {" + //
                "ENTITY #selection.begin.targetEntity#entity1#selection.end.targetEntity# { f1_using0 : Integer; }; " + //
                "};" + //
                "}; ";
            var source = [""];
            TestsPdeNavigateToActionV3.targetSelections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(file1Content,source,TestsPdeNavigateToActionV3.targetSelections);
            util.createFile(TestsPdeNavigateToActionV3.project,file1,source[0]);
            window.targetFileContent=source[0];
        };
        TestsPdeNavigateToActionV3.createProject = function() {
            TestsPdeNavigateToActionV3.project=new EclipseUtil().createSimpleProject("" + System.currentTimeMillis());
            return TestsPdeNavigateToActionV3.project;
        };
        TestsPdeNavigateToActionV3.prototype.setup = function() {
        };
        TestsPdeNavigateToActionV3.prototype.teardown = function() {


        };
        TestsPdeNavigateToActionV3.classTearDown = function() {


        };
        TestsPdeNavigateToActionV3.prototype.navigateFromUsingDirectiveToEntityDefintionEvenWhenAstIsIncomplete = function() {
            var sourceWithSelections = "NAMESPACE d031119; " + //
                "USING d031119::unused; " + //
                "USING d031119::using0.nested.entity#selection.begin.trigger#1#selection.end.trigger#; " + //
                "DEFINE ACCESSPOLICY test2 { " + //
                "DEFINE ASPECT aspCountry AS " + //
                "SELECT FROM address";
            var selections = {};
            var source = [""];
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            return NavigationTestUtil.navigateToOtherEditor(source[0],selections["trigger"].getOffset(),this.getParser(),this.getPadFileResolver(),TestsPdeNavigateToActionV3.project,TestsPdeNavigateToActionV3.targetSelections["targetEntity"].getOffset());
        };
        TestsPdeNavigateToActionV3.prototype.navigateInsideUsingDirectiveOnNestedContextIncompleteAst = function() {
            var sourceWithSelections = "NAMESPACE d031119; " + //
                "USING d031119::using0.nes#selection.begin.trigger##selection.end.trigger#ted.entity1; " + //
                "DEFINE ACCESSPOLICY test2 { " + //
                "DEFINE ASPECT aspCountry AS " + //
                "SELECT FROM address";
            var selections = {};
            var source = [""];
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            return NavigationTestUtil.navigateToOtherEditor(source[0],selections["trigger"].getOffset(),this.getParser(),this.getPadFileResolver(),TestsPdeNavigateToActionV3.project,TestsPdeNavigateToActionV3.targetSelections["targetNestedContext"].getOffset());
        };
        TestsPdeNavigateToActionV3.prototype.navigateInsideUsingDirectiveOnRootContextIncompleteAst = function() {
            var sourceWithSelections = "NAMESPACE d031119; " + //
                "USING d031119::us#selection.begin.trigger##selection.end.trigger#ing0.nested.entity1; " + //
                "DEFINE ACCESSPOLICY test2 { " + //
                "DEFINE ASPECT aspCountry AS " + //
                "SELECT FROM address";
            var selections = {};
            var source = [""];
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            return NavigationTestUtil.navigateToOtherEditor(source[0],selections["trigger"].getOffset(),this.getParser(),this.getPadFileResolver(),TestsPdeNavigateToActionV3.project,TestsPdeNavigateToActionV3.targetSelections["targetContext"].getOffset());
        };


//      TEST METHODS

        function _single(method,version) {
            var cut=new TestsPdeNavigateToActionV3();
            cut.version = version;
            TestsPdeNavigateToActionV3.classSetup();
            cut.setup();
            return cut[method]().then(function(){
                cut.teardown();
                TestsPdeNavigateToActionV3.classTearDown();
            });
        }

        function testV3(method) {
            test(method,window.withPromise( function(assert) {
                var p = Q.delay(10);
                var versions = AbstractV3HanaDdlParserTests.parserVersions();
                for (var i=0;i<versions.length;i++) {
                    p = p.then( _single( method, versions[i][0].toString() ));
                }
                return p;
            }));
        }

        testV3("navigateFromUsingDirectiveToEntityDefintionEvenWhenAstIsIncomplete");
        testV3("navigateInsideUsingDirectiveOnNestedContextIncompleteAst");
        testV3("navigateInsideUsingDirectiveOnRootContextIncompleteAst");

        QUnit.start();
    });