// this test file is not migrated from Java code. It contains javascript specific tests for HanaDdlParser.
RequirePaths.setRequireJsConfigForHanaDdl(2);

require(
    [
        "rndrt/rnd", "hanaddl/hanaddlNonUi","commonddl/commonddlNonUi",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver",
        "TestUtilEclipseSelectionHandling",
        "./TestFriendlyHanaRepositoryAccess",
        "NavigationTestUtil"
    ],
    function (rnd, hanaddlNonUi, commonddlNonUi, CdsDdlParserResolver1, CdsDdlParserResolver2, CdsDdlParserResolver3, CdsDdlParserResolver4, CdsDdlParserResolver5, TestUtilEclipseSelectionHandling, TestFriendlyHanaRepositoryAccess, NavigationTestUtil) {
        var DdlParserFactoryRespectingBackendVersion = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion;
        var VersionsFactory = hanaddlNonUi.VersionsFactory;
        var Utils = rnd.Utils;
        var CompilationUnitManager = hanaddlNonUi.CompilationUnitManager;

        test("parse hana source", function (assert) {
            var version = VersionsFactory.version2;
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            equal(parser != null, true);

            var tokens = parser.parseSource(resolver,"entity entity { ele : Integer; };");
            equal(tokens.length,10);
            equal(tokens[0].m_lexem,"entity");
            equal(tokens[0].m_category,rnd.Category.CAT_KEYWORD);
            equal(tokens[1].m_lexem,"entity");
            equal(tokens[1].m_category,rnd.Category.CAT_IDENTIFIER);
        });


        test("parse element", function (assert) {
            var version = VersionsFactory.version2;
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            equal(parser != null, true);

            var tokens = parser.parseSource(resolver,"element : Integer; }; entity a { b:c;};");
            equal(tokens.length,16);
            for (var i=0;i<tokens.length;i++) {
                if (tokens[i].m_err_state==rnd.ErrorState.Erroneous) {
                    equal(true,false);//error token found
                }
            }
        });

        test("keyword completion",function(assert) {
            var version = VersionsFactory.version2;
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            equal(parser != null, true);
            var str = "en";
            var result = parser.getCompletions5(resolver,null,str, 1, str.length+1);
            equal(Utils.arrayContains(result, "entity"),true);
        });

        test("coco replacement offset/length not re-used",function(assert) {
            for (var i=parseInt(VersionsFactory.version1);i<=parseInt(VersionsFactory.versionLast);i++) {
                var version = i.toString();
                var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
                var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
                var sourceWithSelections = "context ctx { entity e1 { id : Integ#selection.one#er; }; };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
                var sel = selections["one"];

                var compls = parser.getTypedCodeCompletions5(
                    resolver,
                    TestFriendlyHanaRepositoryAccess
                        .TestFriendlyHanaRepositoryAccess1(),
                    source[0], 1, sel.getOffset() + 1);
                equal(compls[0].getReplacementOffset(),sel.offset-"Integ".length);
                //2nd compl run - ensure that replacementOffset is not re-used
                sourceWithSelections = "context ctx { entity e1 { id : Integer; id2 : Inte#selection.one# }; };";
                source = [ "" ];
                selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
                sel = selections["one"];

                compls = parser.getTypedCodeCompletions5(
                    resolver,
                    TestFriendlyHanaRepositoryAccess
                        .TestFriendlyHanaRepositoryAccess1(),
                    source[0], 1, sel.getOffset() + 1);
                // Replace of current token is calculated
                equal(compls[0].getReplacementOffset(), sel.getOffset() - "Inte".length);
                equal(compls[0].getReplacementLength(), "Inte".length);
            }
        });

        test("stmt util getBestMatchingSourceRangeContainerRecursive on annotation value",function(assert) {
            var version = "3";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var sourceWithSelections = "context ctx { entity e1 { id : Integ#selection.one#er; }; };";
            var sourceWithSelections =
                "namespace playground.melcher; "+//
                "@Annotation: 'D03#selection.one#1119' "+//
                "context tm1active { "+//
                " entity first {   "+//
                "    key "+//
                "    id : Integer; "+//
                "    value3 : Integer; "+//
                "};"+//
                "};";
            source = [ "" ];
            selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            sel = selections["one"];

            var ast = parser.parseAndGetAst3(resolver,null,source[0]);
            var res = hanaddlNonUi.StmtUtil.getBestMatchingSourceRangeContainerRecursive(ast,sel.getOffset(),[]);
            equal(true,res!=null);
        });


        test("cocoDefaultResolvedFromUsedType",function(assert) { // difference to TestsUnitHanaDdlParserV3.cocoDefaultResolvedFromUsedType is that project in TestFriendlyHanaRepositoryAccess2 is set to null
            var sourceWithSelections="context cctest1030 {                                                        " +
                "type mytype : Integer enum { yyy = 1;xxxx=2;zzz=3;} ;                       " +
                "type mytype2 : String(10) enum { yyy = 'asas';xxxx='bdbd';zzz='csscs';} ;   "+
                "annotation value {                                                          "+
                "   test : Integer enum { a=1;b=2;cccc=3; } default #cccc;      "+
                "   test2 : mytype default #selection.one# ;    };                           "+
                "};                                                                          ";
            var source=[""];
            var selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel=selections["one"];
            var version = "3";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var annots = DdlParserFactoryRespectingBackendVersion.eInstance.getSupportedAnnotations2(parser,version);
            parser.setSupportedAnnotations(annots);
            var completions=parser.getCompletions5(resolver,TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(null),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "#xxxx"),true);
        });

        test("navgiate to external attribute declaration", window.withPromise( function(assert) {
            var src =
                "using test::tm1active; "+//
                "context ctx { "+//
                " define view view_with_assoc as select from e1 "+//
                "mixin { assoc1: association [* ] to tm1active.firstRow on e1.k1 = tm1active.firstRow.value2 ; } "+//
                "into { "+//
                "   e1.k1 as E1_K1, "+//
                "    assoc1.id#selection.one#2 as ID2 }; "+//
                "};";
            var targetSrc =
                    "namespace test;"+//
                    "context tm1active { "+//
                    " entity firstRow {"+//
                    "   id2 : Integer; "+//
                    " }; "+//
                    "};";

            var version = "3";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            return NavigationTestUtil.navigateToExternalAttribute(src, targetSrc, parser, resolver,0,56);
        }));

        test("navgiate to external attribute declaration with alias", window.withPromise( function(assert) {
            var src =
                "using test::tm1active.firstRow as firstRowAlias; "+//
                "context ctx { "+//
                " define view view_with_assoc as select from firstRowAlias { firstRowAlias.id#selection.one#2 }; "+//
                "};";
            var targetSrc =
                "namespace test;"+//
                "context tm1active { "+//
                " entity firstRow {"+//
                "   id2 : Integer; "+//
                " }; "+//
                "};";

            var version = "3";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            return NavigationTestUtil.navigateToExternalAttribute(src, targetSrc, parser, resolver,0,56);
        }));

        test("replacementLength completion property lost, when parseAndGetAst is called after code completion run",function(assert){
            var version = "3";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var src = "context ctx { entity en { test1 : In";
            var result = parser.getTypedCodeCompletions5(resolver,TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(null),src, 1, src.length+1);
            var first = result[0];
            equal("Integer",first.name);
            equal(2,first.replacementLength);
            //now AST parse run - ensure that replacementLength is not reset
            parser.parseAndGetAst2(resolver,src);
            // do now the assert again and ensure that replacementLenth is not reset
            equal(2,first.replacementLength);
        });

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

        CompilationUnitManagerWithEmptyCache.prototype = Object.create(CompilationUnitManager.prototype);
        CompilationUnitManagerWithEmptyCache.prototype.parseAndGetCUCalled = false;
        function CompilationUnitManagerWithEmptyCache() {
            this.injectedAsts = []; // Sets cache to empty
        }
        CompilationUnitManagerWithEmptyCache.prototype.parseAndGetCU = function (fqn, project) {
            this.parseAndGetCUCalled = true;
            return null;
        };

        test("compilation unit manager: getCU calls parser if cache is empty",function(assert) {
            var compilationUnitManager = new CompilationUnitManagerWithEmptyCache();
            compilationUnitManager.getCU("does_not_matter", null);
            equal(true, compilationUnitManager.parseAndGetCUCalled);
        });

        test("code completion - no multiple backend requests for same fqn",function(assert) {
            expect(1);
            var version = "4";
            var resolver = DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version);
            var parser = DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
            var src = "namespace playground.melcher; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "using playground.melcher::tm1active; "+//
                "context tm3active { "+//
                "define view myvvv as select from tm1a";
            var repAccess = TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(null);
            repAccess.getProject = function() {
              return parser;
            };
            var originalParseAndGetCU = CompilationUnitManager.singleton.parseAndGetCU;
            try {
                var count = 0;
                CompilationUnitManager.singleton.parseAndGetCU = function (fqn,project) {
                    count++;
                    var resolver = project.versionFactory.createPadFileResolver(project.version);
                    var ast = project.parseAndGetAst2(resolver, "define view test as select from test { test};");
                    return ast;
                };
                CompilationUnitManager.astCacheByFqn = {};
                var result = parser.getTypedCodeCompletions5(resolver, repAccess, src, 1, src.length + 1);
                equal(count,1); // expect that parseAndGetCU is called only once in the coco run
            }finally{
                CompilationUnitManager.singleton.parseAndGetCU = originalParseAndGetCU;
            }
        });

        QUnit.start();
    }
);