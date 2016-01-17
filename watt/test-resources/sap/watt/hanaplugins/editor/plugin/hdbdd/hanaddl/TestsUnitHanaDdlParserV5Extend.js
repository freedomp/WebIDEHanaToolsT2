/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests",
        "commonddl/commonddlNonUi"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests,
        commonddl
        ) {

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


        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5Extend() {
        }
        TestsUnitHanaDdlParserV5Extend.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5Extend.prototype.extendWithAnnotation = function(assert) {
            var ast= this.parseSourceAndGetAst(getFileContent("extend.txt"));
            this.assertNoErrorTokens(ast.tokenList);

            var stmts = ast.statements;
            assert.equal(stmts.length, 2);
            var anno = stmts[0];
            assert.ok(anno instanceof commonddl.AnnotationDeclarationImpl);
            assert.equal(anno.annotationList.length, 0);
            assert.ok(!anno["isExtend"]);
            var ctxExt = stmts[1];
            assert.ok(ctxExt instanceof commonddl.ContextDeclarationImpl);
            assert.ok(ctxExt["isExtend"]);
            assert.equal(ctxExt.annotationList.length, 1);
            var ctxAnno = ctxExt.annotationList[0];
            assert.equal(ctxAnno.value.valueToken.m_lexem, "'SYSTEM'");
            stmts = ctxExt.statements;
            assert.equal(stmts.length,3);
            assert.ok(stmts[0] instanceof commonddl.EntityDeclarationImpl);
            assert.ok(stmts[1] instanceof commonddl.TypeDeclarationImpl);
            assert.ok(stmts[2] instanceof commonddl.ContextDeclarationImpl);
            ctxExt = stmts[2];
            assert.equal(ctxExt.nameToken.m_lexem, "context");
            assert.equal(ctxExt.namePath.pathEntries[0].nameToken.m_lexem, "c2");
            assert.equal(ctxExt.statements.length, 2);
            anno = ctxExt.statements[0];
            assert.ok(anno instanceof commonddl.AnnotationDeclarationImpl);
            assert.equal(anno.namePath.pathEntries[0].nameToken.m_lexem, "a");
            assert.equal(anno.annotationList.length, 1);
            assert.equal(anno.annotationList[0].nameTokenPath[0].m_lexem, "Blub");
            assert.equal(anno.annotationList[0].value.valueToken.m_lexem, "2");
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5Extend.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Extend;
    }
);