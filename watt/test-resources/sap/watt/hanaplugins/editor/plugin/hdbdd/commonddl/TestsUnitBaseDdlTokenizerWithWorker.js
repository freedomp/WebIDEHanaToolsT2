/* Functionality which is being tested is independent from ABAP or HANA.
 * This test has dependency to ABAP as it allows to reuse this test in ABAP repository. */
RequirePaths.setRequireJsConfigForHanaDdl(2);

require(["rndrt/rnd", "commonddl/commonddlNonUi", "commonddl/commonddlUi", "hanaddl/hanaddlUi", "hanaddl/hanaddlNonUi", "hanaddl/hanav5/CdsDdlParserResolver"],
    function (rnd, commonddlNonUi, commonddlUi, hanaddlUi, hanaddlNonUi) {

        // Parser mock
        function ParserMock() {
            this.called = false;

            this.tokenize = function tokenize(resolver, line) {
                this.called = true;
            };

            this.assertCalled = function assertCalled(assert) {
                assert.equal(true, this.called, "tokenize() not called");
            };

            this.assertNotCalled = function assertNotCalled(assert) {
                assert.equal(false, this.called, "tokenize() called");
            };
        }

        // BaseDdlTokenizerWithWorker mock
        function createBaseDdlTokenizer(source, parser) {

            var Range = ace.require("./range").Range;
            var EditSession = new ace.EditSession(source);

            var cut = new hanaddlUi.HanaDdlTokenizerWithWorker(Range, hanaddlNonUi.CdsDdlPadFileResolver.getPadFilePath(), "HanaDdlTokenizerWithWorker.js");

            cut.convertRndTokensToAce = function (rndTokens) {
                return [];
            };


            cut.parser = parser;
            cut.aceEditor = {
                getSession: function () {
                    return EditSession;
                }
            };
            cut.resolver = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createResolver(hanaddlNonUi.VersionsFactory.versionLast);
            cut.createTooltip = function (editor, text, row, column, length) {
                return null;
            };

            return cut;
        }


        // Test helper methods
        var version = hanaddlNonUi.VersionsFactory.versionLast;
        var parser = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createParser(version);

        function getTokensForSource(source) {
            var padFilePath = hanaddlNonUi.CdsDdlPadFileResolver.getPadFilePath();
            var resolver = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createResolver(version, padFilePath);
            var tokens = parser.parseSource(resolver, source);
            return tokens;
        }

        // Test methods
        test("getLineTokens with empty cache", function (assert) {
            var cut = createBaseDdlTokenizer("", new ParserMock());
            cut.getLineTokens("view ez_case_test as select from sflight", "start", 0);
            cut.parser.assertCalled(assert);
        });

        test("getLineTokens with valid not empty cache", function (assert) {
            var buf = new rnd.StringBuffer();
            buf.append("view ez_case_test as select from sflight\r\n");
            buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
            buf.append("{ \r\n");
            buf.append("     sflight.connid as connections, \r\n");
            buf.append("     sflight.fldate,\r\n");
            buf.append("     count(distinct saplane.producer) as abc");
            var source = buf.toString();
            var tokens = getTokensForSource(source);
            var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);

            var cut = createBaseDdlTokenizer("", new ParserMock());
            cut.tokensByLine = tokensByLine;
            cut.getLineTokens("view ez_case_test as select from sflight", "start", 0);
            cut.parser.assertNotCalled(assert);
        });

        test("getLineTokens for a line which is not cached", function (assert) {
            var buf = new rnd.StringBuffer();
            buf.append("view ez_case_test as select from sflight\r\n");
            buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
            buf.append("{ \r\n");
            buf.append("     sflight.connid as connections, \r\n");
            buf.append("     sflight.fldate,\r\n");
            buf.append("     count(distinct saplane.producer) as abc");
            var source = buf.toString();
            var tokens = getTokensForSource(source);
            var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);

            var cut = createBaseDdlTokenizer("", new ParserMock());
            cut.tokensByLine = tokensByLine;
            cut.getLineTokens("bla", "start", 7);
            cut.parser.assertCalled(assert);
        });

        test("getLineTokens with invalid cache and line is not a comment", function (assert) {
            var buf = new rnd.StringBuffer();
            buf.append("view ez_case_test as select from sflight\r\n");
            buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
            buf.append("{ \r\n");
            buf.append("     sflight.connid as connections, \r\n");
            buf.append("     sflight.fldate,\r\n");
            buf.append("     count(distinct saplane.producer) as abc");
            var source = buf.toString();
            var tokens = getTokensForSource(source);
            var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);

            var cut = createBaseDdlTokenizer("", new ParserMock());
            cut.tokensByLine = tokensByLine;
            cut.tokensByLineInvalid = true;
            cut.getLineTokens("view ez_case_test as select from sflight", "start", 0);
            cut.parser.assertCalled(assert);
        });

        test("getLineTokens with invalid cache and line is a comment", function (assert) {
            var buf = new rnd.StringBuffer();
            buf.append("view ez_case_test as select from sflight\r\n");
            buf.append("left outer join saplane on sflight.planetype = saplane.planetype\r\n");
            buf.append("{ \r\n");
            buf.append("     /*sflight.connid as connections, \r\n");
            buf.append("     sflight.fldate,*/\r\n");
            buf.append("     count(distinct saplane.producer) as abc");
            var source = buf.toString();
            var tokens = getTokensForSource(source);
            var tokensByLine = new commonddlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);

            var cut = createBaseDdlTokenizer("", new ParserMock());
            cut.tokensByLine = tokensByLine;
            cut.tokensByLineInvalid = true;
            cut.getLineTokens("     sflight.fldate,*/", "start", 4);
            cut.parser.assertNotCalled(assert);
        });

        test("isInCommentOrLiteral on literal", function (assert) {
            var parser = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createParser(hanaddlNonUi.VersionsFactory.versionLast);
            var cut = createBaseDdlTokenizer("@Annotation: 'literal'", parser);
            assert.ok(cut.isInCommentOrLiteral({row: 0, column: "@Annotation: 'li".length}));
        });

        test("isInCommentOrLiteral on identifier", function (assert) {
            var parser = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createParser(hanaddlNonUi.VersionsFactory.versionLast);
            var cut = createBaseDdlTokenizer("view hallo", parser);
            assert.ok(!cut.isInCommentOrLiteral({row: 0, column: "view h".length}));
        });

        test("isInCommentOrLiteral on quoted identifier", function (assert) {
            var parser = new hanaddlNonUi.DdlParserFactoryRespectingBackendVersion().createParser(hanaddlNonUi.VersionsFactory.versionLast);
            var cut = createBaseDdlTokenizer('view "hallo"', parser);
            assert.ok(cut.isInCommentOrLiteral({row: 0, column: 'view "h'.length}));
        });

        test("createMarkerForErrorToken", function (assert) {
            var cut = createBaseDdlTokenizer("erroneous line", new ParserMock());
            cut.createMarkerForErrorToken(0, 0, 14);

            var session = cut.aceEditor.getSession();

            // check markers
            var markers = session.getMarkers();
            assert.ok(markers[1] !== undefined);

            var marker = markers[1];
            assert.propEqual(marker.range.start, {row: 0, column: 0});
            assert.propEqual(marker.range.end, {row: 0, column: 14});
            assert.equal(marker.clazz, "acmark_error errorType_error");
            assert.equal(marker.type, "text");

            // check decorators
            var decorators = session.$decorations;
            assert.ok(decorators.length == 1);

            var decorator = decorators[0];
            assert.equal(decorator, " ace_error"); // session decorations have a space at their beginning, cool!
        });

        QUnit.start();
    }
);