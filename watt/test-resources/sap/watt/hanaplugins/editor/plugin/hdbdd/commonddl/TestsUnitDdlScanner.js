
//fde0a092907a272d614f50050b1597fa5ca864e9 Fix scanning of => token for table functions
RequirePaths.setRequireJsConfigForCommonCds(2);

require(
    [ "rndrt/rnd", "commonddl/commonddlNonUi" ],
    function(rnd, commonddlNonUi) {

        function TestsUnitDdlScanner() {

        }
        var CursorPos = rnd.CursorPos;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var DdlScanner = commonddlNonUi.DdlScanner;
        var AnnotationPayload = commonddlNonUi.AnnotationPayload;
        var Utils = rnd.Utils;

        TestsUnitDdlScanner.numAnyKw = 111;
        TestsUnitDdlScanner.numEof = 2;
        TestsUnitDdlScanner.numString = 20;
        TestsUnitDdlScanner.numInt = 21;
        TestsUnitDdlScanner.numLongInt = 22;
        TestsUnitDdlScanner.numDec = 23;
        TestsUnitDdlScanner.numReal = 24;
        TestsUnitDdlScanner.numDate = 25;
        TestsUnitDdlScanner.numTime = 26;
        TestsUnitDdlScanner.numTimestamp = 27;
        TestsUnitDdlScanner.numPipe = 32;
        TestsUnitDdlScanner.numBinary = 41;
        TestsUnitDdlScanner.numId = 44;
        TestsUnitDdlScanner.numEnumId = 45;
        TestsUnitDdlScanner.numColon = 46;
        TestsUnitDdlScanner.numColonNoneWs = 47;
        TestsUnitDdlScanner.numPipePipe = 48;
        TestsUnitDdlScanner.numDashArrowNoneWs = 49;
        TestsUnitDdlScanner.numDashArrow = 50;
        TestsUnitDdlScanner.numSe = 12345;
        TestsUnitDdlScanner.numGe = 12346;
        TestsUnitDdlScanner.numLt = 12347;
        TestsUnitDdlScanner.numGt = 12348;
        TestsUnitDdlScanner.prototype.scanner = null;
        TestsUnitDdlScanner.byteCode = null;
        TestsUnitDdlScanner.createByteCode = function() {
            var mock = {};
            mock.getTokenIndex = function(param) {
                if (rnd.Utils.stringEqualsIgnoreCase(param, "define")) {
                    return 1;
                } else if ("-" === param) {
                    return 4711;
                }
                return -1;
            };
            mock.getActualNUMID = function() {
                return 0;
            };
            return mock;
        };
        TestsUnitDdlScanner.prototype.getFileContent = function(fileName) {
            var result = getRequestInTest(fileName);
            return result;
        };
        TestsUnitDdlScanner.prototype.assertTokensWithSource = function(tokens, source) {
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (t.m_category === Category.CAT_COMMENT) {
                    continue;
                }
                if (source != null) {
                    equal(t.m_err_state === ErrorState.Erroneous, false);
                } else {
                    equal(t.m_err_state === ErrorState.Erroneous, false);
                }
            }
        };
        TestsUnitDdlScanner.prototype.assertTokens = function(tokens) {
            this.assertTokensWithSource(tokens, null);
        };
        TestsUnitDdlScanner.prototype.tokenize = function(source) {
            this.scanner.setInput(source, new CursorPos(1, 1, null), new CursorPos(-1, -1, null));
            var tokens = this.scanner.getInput();
            return tokens;
        };
        TestsUnitDdlScanner.prototype.tokenizeWithLineColumn = function(source, line, column) {
            this.scanner.setInput(source, new CursorPos(1, 1, null), new CursorPos(line, column, null));
            var tokens = this.scanner.getInput();
            return tokens;
        };
        TestsUnitDdlScanner.prototype.createScannerWithCreationOfDotDot = function() {
            return DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, true, false, false, true, false);
        };
        TestsUnitDdlScanner.prototype.createScannerWithEnumIdTokens = function() {
            return DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, true, true, false, false, false);
        };
        TestsUnitDdlScanner.prototype.createScannerWithColonNoneWsTokens = function(createColonNoneWsTokens) {
            return DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, true, true, createColonNoneWsTokens, true, false);
        };
        TestsUnitDdlScanner.prototype.createScannerWithScopedIdTokens = function() {
            return this.createScannerWithColonNoneWsTokens(true);
        };
        TestsUnitDdlScanner.prototype.createScannerWithPipePipeTokens = function(createPipePipeTokens) {
            var scanner = DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, true, true, true, createPipePipeTokens,
                false);
            scanner.pipe = TestsUnitDdlScanner.numPipe;
            scanner.pipePipe = TestsUnitDdlScanner.numPipePipe;
            return scanner;
        };
        TestsUnitDdlScanner.prototype.createScannerWithDashArrowNoneWsTokens = function(createDashArrowNoneWsTokens) {
            var scanner = DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, true, true, true, true,
                createDashArrowNoneWsTokens);
            scanner.dash_arrow_no_ws = TestsUnitDdlScanner.numDashArrowNoneWs;
            scanner.dash_arrow = TestsUnitDdlScanner.numDashArrow;
            return scanner;
        };
        TestsUnitDdlScanner.classSetup = function() {
            TestsUnitDdlScanner.byteCode = TestsUnitDdlScanner.createByteCode();
        };
        TestsUnitDdlScanner.prototype.setUp = function() {
            this.scanner = DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, false, false, false, false, false, false, false);
            this.scanner.eof = TestsUnitDdlScanner.numEof;
            this.scanner.stringConst = TestsUnitDdlScanner.numString;
            this.scanner.intConst = TestsUnitDdlScanner.numInt;
            this.scanner.longIntConst = TestsUnitDdlScanner.numLongInt;
            this.scanner.decConst = TestsUnitDdlScanner.numDec;
            this.scanner.realConst = TestsUnitDdlScanner.numReal;
            this.scanner.dateConst = TestsUnitDdlScanner.numDate;
            this.scanner.timeConst = TestsUnitDdlScanner.numTime;
            this.scanner.timestampConst = TestsUnitDdlScanner.numTimestamp;
            this.scanner.binaryConst = TestsUnitDdlScanner.numBinary;
            this.scanner.id = TestsUnitDdlScanner.numId;
            this.scanner.pipePipe = TestsUnitDdlScanner.numPipePipe;
            this.scanner.anyKeyword = TestsUnitDdlScanner.numAnyKw;
            this.scanner.se = TestsUnitDdlScanner.numSe;
            this.scanner.ge = TestsUnitDdlScanner.numGe;
            this.scanner.lt = TestsUnitDdlScanner.numLt;
            this.scanner.gt = TestsUnitDdlScanner.numGt;
        };
        TestsUnitDdlScanner.prototype.hexLiteralsAreTokenizedCorrectly = function() {
            var tokens = this.tokenize("x'A1FF09'X'A1ff09'");
            this.assertTokens(tokens);
            equal(3, tokens.length);
            equal("x'A1FF09'", tokens[0].m_lexem);
            equal(TestsUnitDdlScanner.numBinary, tokens[0].m_num);
            equal("X'A1ff09'", tokens[1].m_lexem);
            equal(TestsUnitDdlScanner.numBinary, tokens[1].m_num);
        };
        TestsUnitDdlScanner.prototype.hexLiteralsThatAreNotClosedAreTokenizedAsCorrectAsPossible = function() {
            var tokens = this.tokenize("x'A1FF09");
            this.assertTokens(tokens);
            equal(2, tokens.length);
            equal("x'A1FF09", tokens[0].m_lexem);
            equal(TestsUnitDdlScanner.numBinary, tokens[0].m_num);
        };
        TestsUnitDdlScanner.prototype.hexLiteralsThatAreNotClosedAndFollowedBySpaceAreTokenizedAsCorrectAsPossible = function() {
            var tokens = this.tokenize("x'A1FF09 ");
            this.assertTokens(tokens);
            equal(2, tokens.length);
            equal("x'A1FF09", tokens[0].m_lexem);
            equal(TestsUnitDdlScanner.numBinary, tokens[0].m_num);
        };
        TestsUnitDdlScanner.prototype.numberLiteralsAreScannedAsOneToken = function() {
            var tokens = this.tokenize("define -123.45e11");
            equal(3, tokens.length);
            equal("define", tokens[0].m_lexem);
            var token = tokens[1];
            equal("-123.45e11", token.m_lexem);
        };
        TestsUnitDdlScanner.prototype.numberLiteralsAreScannedAsOneToken2 = function() {
            var tokens = this.tokenize("123.45 -123.45e11");
            equal(4, tokens.length);
            equal("123.45", tokens[0].m_lexem);
            var token = tokens[1];
            equal("-", token.m_lexem);
            equal("123.45e11", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.numberLiteralsAreScannedAsOneToken3 = function() {
            var tokens = this.tokenize("123.45 +123.45e11");
            equal(4, tokens.length);
            equal("123.45", tokens[0].m_lexem);
            var token = tokens[1];
            equal("+", token.m_lexem);
            equal("123.45e11", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.literalWithoutSpaceTokenizedCorrectly = function() {
            var source = "x ='x'";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            equal(4, tokens.length);
            var token = tokens[2];
            equal("'x'", token.m_lexem);
            equal(20, token.m_num);
        };
        TestsUnitDdlScanner.prototype.emptyStringLiteralsTokenziedCorrectly = function() {
            var source = "x =''";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            equal(4, tokens.length);
            var token = tokens[2];
            equal("''", token.m_lexem);
            equal(TestsUnitDdlScanner.numString, token.m_num);
        };
        TestsUnitDdlScanner.prototype.plusAsOperator = function() {
            var tokens = this.tokenize("1+1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal("+", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.minusAsOperator = function() {
            var tokens = this.tokenize("1-1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal(TestsUnitDdlScanner.numInt, tokens[0].m_num);
            equal("-", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
            equal(TestsUnitDdlScanner.numInt, tokens[2].m_num);
        };
        TestsUnitDdlScanner.prototype.minusAsOperatorWithWS = function() {
            var tokens = this.tokenize("1 - 1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal(TestsUnitDdlScanner.numInt, tokens[0].m_num);
            equal("-", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
            equal(TestsUnitDdlScanner.numInt, tokens[2].m_num);
        };
        TestsUnitDdlScanner.prototype.plusAsOperatorSourroundedByWhitespace = function() {
            var tokens = this.tokenize("1 + 1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal("+", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.plusAsOperatorPrefixedSourroundedByWhitespace = function() {
            var tokens = this.tokenize("1 +1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal("+", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.plusAsOperatorPostfixedSourroundedByWhitespace = function() {
            var tokens = this.tokenize("1+ 1");
            equal(4, tokens.length);
            equal("1", tokens[0].m_lexem);
            equal("+", tokens[1].m_lexem);
            equal("1", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.commentsManyCommentsLines = function() {
            var source = this.getFileContent("testsourcewithcomments.txt");
            var tokens = this.tokenize(source);
            var countComments = 0;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (Category.CAT_COMMENT === t.m_category) {
                    countComments++;
                }
            }
            equal(35, countComments);
        };
        TestsUnitDdlScanner.prototype.commentMultipleLines = function() {
            var tokens = this.tokenize("/* \r\n   */ define view v1 as select from sflight");
            equal(9, tokens.length);
            equal("/* \r\n   */", tokens[0].m_lexem);
            equal(Category.CAT_COMMENT, tokens[0].m_category);
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (t.m_lexem === "v1") {
                    equal(19, t.m_column);
                    equal(23, t.m_offset);
                    return;
                }
            }
            Assert.fail1("Token v1 not found or found at wrong position");
        };
        TestsUnitDdlScanner.prototype.abapNamespaceAsOneToken = function() {
            var source = "view abap/name as select * from sflight";
            var tokens = this.tokenize(source);
            equal(8, tokens.length);
            equal("abap/name", tokens[1].m_lexem);
        };
        TestsUnitDdlScanner.prototype.quotedIdentifierContainingSlashAsOneToken = function() {
            var source = "view \"abap/name\" as select * from sflight";
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var tokens = this.tokenize(source);
            equal(8, tokens.length);
            equal("\"abap/name\"", tokens[1].m_lexem);
        };
        TestsUnitDdlScanner.prototype.multliLineCommentDirectlyBeforeIdentifier = function() {
            var source = "view abap/*multiline comment*/ as select * from sflight";
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var tokens = this.tokenize(source);
            equal(9, tokens.length);
            equal(Category.CAT_COMMENT, tokens[2].m_category);
            equal("/*multiline comment*/", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.commentStarNotConsumedTwiceAndEndDetectedCorrectly = function() {
            var tokens = this.tokenize("/*/comment\r\ncomment\r\ncomment */");
            equal(2, tokens.length);
            equal("/*/comment\r\ncomment\r\ncomment */", tokens[0].m_lexem);
            equal(Category.CAT_COMMENT, tokens[0].m_category);
            equal(tokens[0].m_err_state === ErrorState.Erroneous, false);
        };
        TestsUnitDdlScanner.prototype.commentSlashInsideMultiLineComment = function() {
            var tokens = this.tokenize("/*/*/ define view");
            equal(4, tokens.length);
            equal("/*/*/", tokens[0].m_lexem);
            equal(Category.CAT_COMMENT, tokens[0].m_category);
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (t.m_lexem === "define") {
                    equal(7, t.m_column);
                    equal(6, t.m_offset);
                    return;
                }
            }
            Assert.fail1("Token DEFINE not found or found at wrong position");
        };
        TestsUnitDdlScanner.prototype.tokenAfterMultiLIneCommentAtCorrectOffset = function() {
            var tokens = this.tokenize("DEFINE VIEW test123 \r\n  AS SELECT FROM \r\n /*a*/snwd_bpa AS bpa");
            equal(11, tokens.length);
            equal("/*a*/", tokens[6].m_lexem);
            equal(Category.CAT_COMMENT, tokens[6].m_category);
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (t.m_lexem === "snwd_bpa") {
                    equal(7, t.m_column);
                    equal(47, t.m_offset);
                    return;
                }
            }
            Assert.fail1("Token snwd_bpa not found or found at wrong position");
        };
        TestsUnitDdlScanner.prototype.parseLineCommentsWithNewLineOnly = function() {
            var source = "DEFINE VIEW ztm_test3 AS SELECT FROM sfbmhdr \n--first line\n--second line\n--third line\nINNER JOIN";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            equal(13, tokens.length);
            equal("--first line", tokens[7].m_lexem);
            equal(Category.CAT_COMMENT, tokens[7].m_category);
            equal("--second line", tokens[8].m_lexem);
            equal(Category.CAT_COMMENT, tokens[8].m_category);
            equal("--third line", tokens[9].m_lexem);
            equal(Category.CAT_COMMENT, tokens[9].m_category);
        };
        TestsUnitDdlScanner.prototype.escaped = function() {
            var tokens = this.tokenize("'LH\\'\\\\'");
            this.assertTokens(tokens);
            this.assertTokens(tokens);
            equal(2, tokens.length);
            equal("'LH\\'\\\\'", tokens[0].m_lexem);
        };
        TestsUnitDdlScanner.prototype.rbracketInColumnList = function() {
            var source = "{a,b,c}";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            var lastToken = tokens[tokens.length - 2];
            equal("}", lastToken.m_lexem);
        };
        TestsUnitDdlScanner.prototype.lineCommentAfterClosingBraketDetectedCorrectly = function() {
            var source = "SELECT FROM sflight{ COUNT ( * )// AS alias }";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            var lastToken = tokens[tokens.length - 2];
            equal("// AS alias }", lastToken.m_lexem);
            equal(Category.CAT_COMMENT, lastToken.m_category);
        };
        TestsUnitDdlScanner.prototype.HashIsPartOfIdentifier = function() {
            var source = "#Identifier";
            var tokens = this.tokenize(source);
            this.assertTokens(tokens);
            equal(2, tokens.length);
            var identifierToken = tokens[0];
            equal(source, identifierToken.m_lexem);
            equal(Category.CAT_IDENTIFIER, identifierToken.m_category);
        };
        TestsUnitDdlScanner.prototype.scanEmptySource = function() {
            var source = "";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(1, tokens.length);
            equal(TestsUnitDdlScanner.numEof, tokens[0].m_num);
        };
        TestsUnitDdlScanner.prototype.scanPreAnnotation = function() {
            var source = "@Anno :'value'";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(5, tokens.length);
            equal(Category.CAT_OPERATOR, tokens[0].m_category);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_IDENTIFIER, tokens[1].m_category);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_OPERATOR, tokens[2].m_category);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_LITERAL, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanPostAnnotation = function() {
            var source = "@<Anno :'value'";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(5, tokens.length);
            equal(Category.CAT_OPERATOR, tokens[0].m_category);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_IDENTIFIER, tokens[1].m_category);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanPostAnnotationCreatesTwoTokensIfSpaceAtWrongPosition = function() {
            var source = "@ <Anno :'value'";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(6, tokens.length);
        };
        TestsUnitDdlScanner.prototype.scanBooleanAnnotationValue = function() {
            var source = "@Anno : true";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(5, tokens.length);
            equal(Category.CAT_IDENTIFIER, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanExcapedIdentifierAnnotationValue = function() {
            var source = "@Scope: #ENTITY";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(5, tokens.length);
            equal("#ENTITY", tokens[3].m_lexem);
            equal(Category.CAT_IDENTIFIER, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanIntegerAnnotationValue = function() {
            var source = "@Anno : 5";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(5, tokens.length);
            equal(Category.CAT_LITERAL, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanArrayAnnotationValue = function() {
            var source = "@Anno : ['a','b','c']";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(11, tokens.length);
            equal(Category.CAT_OPERATOR, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_LITERAL, tokens[4].m_category);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_OPERATOR, tokens[5].m_category);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_OPERATOR, tokens[9].m_category);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.scanRecordAnnotationValue = function() {
            var source = "@Anno : { key :'a', key2:'b'}";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal(13, tokens.length);
            equal(Category.CAT_OPERATOR, tokens[3].m_category);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_IDENTIFIER, tokens[4].m_category);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_LITERAL, tokens[6].m_category);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(Category.CAT_OPERATOR, tokens[11].m_category);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.annotations = function() {
            var source = "@annotation DEFINE VIEW b AS SELECT FROM  sflight { carrid, connid }";
            var tokens = this.tokenize(source);
            equal(tokens != null, true);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("annotation", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations2 = function() {
            var source = "@ DEFINE VIEW c AS SELECT FROM  sflight { connid } WHERE carrid = 'x' and fld";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations3 = function() {
            var source = "@annotation: 1 DEFINE VIEW b AS SELECT FROM  sflight { carrid, connid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("annotation", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("1", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations4 = function() {
            var source = "@annotation  : 1 DEFINE VIEW b AS SELECT FROM  sflight { carrid, connid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("annotation", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("1", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations5 = function() {
            var source = "@annotation: { label1, text2:'xxx'} DEFINE VIEW b AS SELECT FROM  sflight { carrid, connid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("annotation", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal("label1", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal("text2", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("'xxx'", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal("}", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations6 = function() {
            var sources = [ "@AbapCatalog.sqlviewname:'ZTM_dfvfdvfdv' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }",
                "@AbapCatalog.sqlviewname: 'ZTM_dfvfdvfdv' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }" ];
            for (var sourceCount = 0; sourceCount < sources.length; sourceCount++) {
                var source = sources[sourceCount];
                var tokens = this.tokenize(source);
                equal("@", tokens[0].m_lexem);
                equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
                equal("AbapCatalog", tokens[1].m_lexem);
                equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
                equal(".", tokens[2].m_lexem);
                equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
                equal("sqlviewname", tokens[3].m_lexem);
                equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[4].m_lexem);
                equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
                equal("'ZTM_dfvfdvfdv'", tokens[5].m_lexem);
                equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
                equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
            }
        };
        TestsUnitDdlScanner.prototype.annotations7 = function() {
            var source = "@AbapCatalog.sqlviewname:'ZTM_df eins zwei drei' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("sqlviewname", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("'ZTM_df eins zwei drei'", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations8 = function() {
            var sources = [ "@AbapCatalog.sqlviewname :'ZTM_df eins zwei drei' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }",
                "@AbapCatalog.sqlviewname     :     'ZTM_df eins zwei drei' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }" ];
            for (var sourceCount = 0; sourceCount < sources.length; sourceCount++) {
                var source = sources[sourceCount];
                var tokens = this.tokenize(source);
                equal("@", tokens[0].m_lexem);
                equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
                equal("AbapCatalog", tokens[1].m_lexem);
                equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
                equal(".", tokens[2].m_lexem);
                equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
                equal("sqlviewname", tokens[3].m_lexem);
                equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[4].m_lexem);
                equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
                equal("'ZTM_df eins zwei drei'", tokens[5].m_lexem);
                equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
                equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
            }
        };
        TestsUnitDdlScanner.prototype.annotations9 = function() {
            var source = "@AbapCatalog.sqlviewname   \r\n  :     'ZTM_df eins zwei drei' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("sqlviewname", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("'ZTM_df eins zwei drei'", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations10 = function() {
            var source = "@AbapCatalog.sqlviewname:  'ZTM_df eins zwei drei' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("sqlviewname", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("'ZTM_df eins zwei drei'", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations11 = function() {
            var source = "@AbapCatalog.sqlviewname:'' DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("sqlviewname", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("''", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations12 = function() {
            var source = "@AbapCatalog.sqlviewname: { sdvsdv:'SAAS', sdsdsd } DEFINE VIEW  viedwd1 as SELECT from sflight { carrid }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("sqlviewname", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal("sdvsdv", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("'SAAS'", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal("sdsdsd", tokens[10].m_lexem);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
            equal("}", tokens[11].m_lexem);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
            equal(tokens[12].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations13 = function() {
            var source = "@endusertext.label:   \r\n\r\n" + //
                "/*some comment*/\r\n\r\n" + //
                "'SOMETHING STRANGE'\r\n\r\n" + //
                "@AbapCatalog.sqlViewName:\r\n\r\n" + //
                "                  'SDDL_BUG22'\r\n\r\n"
                + "DEFINE VIEW SDDLBUG22 AS SELECT FROM sflight { carrid, sflight.connid } WHERE sflight.carrid = 'LH'";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("endusertext", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("label", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("/*some comment*/", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, false);
            equal("'SOMETHING STRANGE'", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal("@", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("AbapCatalog", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal("sqlViewName", tokens[10].m_lexem);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[11].m_lexem);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
            equal("'SDDL_BUG22'", tokens[12].m_lexem);
            equal(tokens[12].getPayload() instanceof AnnotationPayload, true);
            equal("DEFINE", tokens[13].m_lexem);
            equal(tokens[13].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations14 = function() {
            var sources = [
                "@Catalog.index : { name : 'IndexA', order : 'ASC', unique: true,elementNames : 'feld1' }\r\ndefine view a as select from sflight",
                "@Catalog.index :  {     name : 'IndexA', order : 'ASC', unique: true,\r\nelementNames :   'feld1'  }\r\n     define view a as select from sflight" ];
            for (var sourceCount = 0; sourceCount < sources.length; sourceCount++) {
                var source = sources[sourceCount];
                var tokens = this.tokenize(source);
                equal("@", tokens[0].m_lexem);
                equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
                equal("Catalog", tokens[1].m_lexem);
                equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
                equal(".", tokens[2].m_lexem);
                equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
                equal("index", tokens[3].m_lexem);
                equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[4].m_lexem);
                equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
                equal("{", tokens[5].m_lexem);
                equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
                equal("name", tokens[6].m_lexem);
                equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[7].m_lexem);
                equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
                equal("'IndexA'", tokens[8].m_lexem);
                equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[9].m_lexem);
                equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
                equal("order", tokens[10].m_lexem);
                equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[11].m_lexem);
                equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
                equal("'ASC'", tokens[12].m_lexem);
                equal(tokens[12].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[13].m_lexem);
                equal(tokens[13].getPayload() instanceof AnnotationPayload, true);
                equal("unique", tokens[14].m_lexem);
                equal(tokens[14].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[15].m_lexem);
                equal(tokens[15].getPayload() instanceof AnnotationPayload, true);
                equal("true", tokens[16].m_lexem);
                equal(tokens[16].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[17].m_lexem);
                equal(tokens[17].getPayload() instanceof AnnotationPayload, true);
                equal("elementNames", tokens[18].m_lexem);
                equal(tokens[18].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[19].m_lexem);
                equal(tokens[19].getPayload() instanceof AnnotationPayload, true);
                equal("'feld1'", tokens[20].m_lexem);
                equal(tokens[20].getPayload() instanceof AnnotationPayload, true);
                equal("}", tokens[21].m_lexem);
                equal(tokens[21].getPayload() instanceof AnnotationPayload, true);
                equal("define", tokens[22].m_lexem);
                equal(tokens[22].getPayload() instanceof AnnotationPayload, false);
            }
        };
        TestsUnitDdlScanner.prototype.annotations15 = function() {
            var source = "@Catalog.index: { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("Catalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("index", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal("name", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("'IndexA'", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal("order", tokens[10].m_lexem);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[11].m_lexem);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
            equal("#ASC", tokens[12].m_lexem);
            equal(tokens[12].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[13].m_lexem);
            equal(tokens[13].getPayload() instanceof AnnotationPayload, true);
            equal("unique", tokens[14].m_lexem);
            equal(tokens[14].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[15].m_lexem);
            equal(tokens[15].getPayload() instanceof AnnotationPayload, true);
            equal("true", tokens[16].m_lexem);
            equal(tokens[16].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[17].m_lexem);
            equal(tokens[17].getPayload() instanceof AnnotationPayload, true);
            equal("elementNames", tokens[18].m_lexem);
            equal(tokens[18].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[19].m_lexem);
            equal(tokens[19].getPayload() instanceof AnnotationPayload, true);
            equal("[", tokens[20].m_lexem);
            equal(tokens[20].getPayload() instanceof AnnotationPayload, true);
            equal("'feld1'", tokens[21].m_lexem);
            equal(tokens[21].getPayload() instanceof AnnotationPayload, true);
            equal("]", tokens[22].m_lexem);
            equal(tokens[22].getPayload() instanceof AnnotationPayload, true);
            equal("}", tokens[23].m_lexem);
            equal(tokens[23].getPayload() instanceof AnnotationPayload, true);
            equal("]", tokens[24].m_lexem);
            equal(tokens[24].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations16 = function() {
            var source = "@Catalog.index: { name : 'IndexA',}  order : #ASC, unique: true,\r\nelementNames : 'feld1' }";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("Catalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("index", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal("name", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("'IndexA'", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal("}", tokens[10].m_lexem);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
            equal("order", tokens[11].m_lexem);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, false);
            equal(":", tokens[12].m_lexem);
            equal(tokens[12].getPayload() instanceof AnnotationPayload, false);
        };
        TestsUnitDdlScanner.prototype.annotations17 = function() {
            var source = "@Catalog.index: { name : 'IndexA',{  order : #ASC, unique: true,\r\nelementNames : 'feld1' } ";
            var tokens = this.tokenize(source);
            equal("@", tokens[0].m_lexem);
            equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
            equal("Catalog", tokens[1].m_lexem);
            equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
            equal(".", tokens[2].m_lexem);
            equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
            equal("index", tokens[3].m_lexem);
            equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[4].m_lexem);
            equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[5].m_lexem);
            equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
            equal("name", tokens[6].m_lexem);
            equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[7].m_lexem);
            equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
            equal("'IndexA'", tokens[8].m_lexem);
            equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
            equal(",", tokens[9].m_lexem);
            equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
            equal("{", tokens[10].m_lexem);
            equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
            equal("order", tokens[11].m_lexem);
            equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
            equal(":", tokens[12].m_lexem);
            equal(tokens[12].getPayload() instanceof AnnotationPayload, true);
        };
        TestsUnitDdlScanner.prototype.annotations18 = function() {
            var sources = [
                "@Catalog.index:[ { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }",
                "@Catalog.index:  [ { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }",
                "@Catalog.index:   [ { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }",
                "@Catalog.index:    [ { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }",
                "@Catalog.index:     [ { name : 'IndexA', order : #ASC, unique: true,\r\nelementNames : ['feld1'] } ]\r\ndefine view e_pgtestddl102 as select from sflight { mandt }" ];
            for (var sourceCount = 0; sourceCount < sources.length; sourceCount++) {
                var source = sources[sourceCount];
                var tokens = this.tokenize(source);
                equal("@", tokens[0].m_lexem);
                equal(tokens[0].getPayload() instanceof AnnotationPayload, true);
                equal("Catalog", tokens[1].m_lexem);
                equal(tokens[1].getPayload() instanceof AnnotationPayload, true);
                equal(".", tokens[2].m_lexem);
                equal(tokens[2].getPayload() instanceof AnnotationPayload, true);
                equal("index", tokens[3].m_lexem);
                equal(tokens[3].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[4].m_lexem);
                equal(tokens[4].getPayload() instanceof AnnotationPayload, true);
                equal("[", tokens[5].m_lexem);
                equal(tokens[5].getPayload() instanceof AnnotationPayload, true);
                equal("{", tokens[6].m_lexem);
                equal(tokens[6].getPayload() instanceof AnnotationPayload, true);
                equal("name", tokens[7].m_lexem);
                equal(tokens[7].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[8].m_lexem);
                equal(tokens[8].getPayload() instanceof AnnotationPayload, true);
                equal("'IndexA'", tokens[9].m_lexem);
                equal(tokens[9].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[10].m_lexem);
                equal(tokens[10].getPayload() instanceof AnnotationPayload, true);
                equal("order", tokens[11].m_lexem);
                equal(tokens[11].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[12].m_lexem);
                equal(tokens[12].getPayload() instanceof AnnotationPayload, true);
                equal("#ASC", tokens[13].m_lexem);
                equal(tokens[13].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[14].m_lexem);
                equal(tokens[14].getPayload() instanceof AnnotationPayload, true);
                equal("unique", tokens[15].m_lexem);
                equal(tokens[15].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[16].m_lexem);
                equal(tokens[16].getPayload() instanceof AnnotationPayload, true);
                equal("true", tokens[17].m_lexem);
                equal(tokens[17].getPayload() instanceof AnnotationPayload, true);
                equal(",", tokens[18].m_lexem);
                equal(tokens[18].getPayload() instanceof AnnotationPayload, true);
                equal("elementNames", tokens[19].m_lexem);
                equal(tokens[19].getPayload() instanceof AnnotationPayload, true);
                equal(":", tokens[20].m_lexem);
                equal(tokens[20].getPayload() instanceof AnnotationPayload, true);
                equal("[", tokens[21].m_lexem);
                equal(tokens[21].getPayload() instanceof AnnotationPayload, true);
                equal("'feld1'", tokens[22].m_lexem);
                equal(tokens[22].getPayload() instanceof AnnotationPayload, true);
                equal("]", tokens[23].m_lexem);
                equal(tokens[23].getPayload() instanceof AnnotationPayload, true);
                equal("}", tokens[24].m_lexem);
                equal(tokens[24].getPayload() instanceof AnnotationPayload, true);
                equal("]", tokens[25].m_lexem);
                equal(tokens[25].getPayload() instanceof AnnotationPayload, true);
                equal("define", tokens[26].m_lexem);
                equal(tokens[26].getPayload() instanceof AnnotationPayload, false);
                equal("view", tokens[27].m_lexem);
                equal(tokens[27].getPayload() instanceof AnnotationPayload, false);
                equal("e_pgtestddl102", tokens[28].m_lexem);
                equal(tokens[28].getPayload() instanceof AnnotationPayload, false);
                equal("as", tokens[29].m_lexem);
                equal(tokens[29].getPayload() instanceof AnnotationPayload, false);
            }
        };
        TestsUnitDdlScanner.prototype.macLineBreaksInLineComment = function() {
            var source = "//  \r//\r";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksInLineComment = function() {
            var source = "//  \n//\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
        };
        TestsUnitDdlScanner.prototype.windowsLineBreaksInLineComment = function() {
            var source = "//  \r\n//\r\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
        };
        TestsUnitDdlScanner.prototype.macLineBreaksInSqlLineComment = function() {
            var source = "--  \r--\r";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "--  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "--", 2, 1);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksInSqlLineComment = function() {
            var source = "--  \n--\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "--  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "--", 2, 1);
        };
        TestsUnitDdlScanner.prototype.windowsLineBreaksInLineSqlComment = function() {
            var source = "--  \r\n--\r\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "--  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "--", 2, 1);
        };
        TestsUnitDdlScanner.prototype.macLineBreaksInLines = function() {
            var source = "define  \rview\r";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "define", 1, 1);
            this.assertTokenDetails(tokens, 1, "view", 2, 1);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksInLine = function() {
            var source = "define  \nview\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "define", 1, 1);
            this.assertTokenDetails(tokens, 1, "view", 2, 1);
        };
        TestsUnitDdlScanner.prototype.windowsLineBreaksInLine = function() {
            var source = "define  \r\nview\r\n";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "define", 1, 1);
            this.assertTokenDetails(tokens, 1, "view", 2, 1);
        };
        TestsUnitDdlScanner.prototype.macLineBreaksInMultiLineComment = function() {
            var source = "/*\r\r*/\rdefine";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "/*\r\r*/", 1, 1);
            this.assertTokenDetails(tokens, 1, "define", 4, 1);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksInMultiLineComment = function() {
            var source = "/*\n\n*/\ndefine";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "/*\n\n*/", 1, 1);
            this.assertTokenDetails(tokens, 1, "define", 4, 1);
        };
        TestsUnitDdlScanner.prototype.windowsLineBreaksInMultiLineComment = function() {
            var source = "/*\r\n\r\n*/\r\ndefine";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "/*\r\n\r\n*/", 1, 1);
            this.assertTokenDetails(tokens, 1, "define", 4, 1);
        };
        TestsUnitDdlScanner.prototype.notClosedMultiLineComment = function() {
            var source = "/*  \n   \n ";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, source, 1, 1);
        };
        TestsUnitDdlScanner.prototype.notClosedLineComment = function() {
            var source = "//   ";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, source, 1, 1);
        };
        TestsUnitDdlScanner.prototype.notClosedSqlLineComment = function() {
            var source = "--   ";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, source, 1, 1);
        };
        TestsUnitDdlScanner.prototype.windowsLineBreaksAreHandledCorrectly = function() {
            var source = "//  \r\n//\r\n--  \r\n--\r\n/*  \r\n  \r\n*/  \r\n/*\r\n\r\n*/\r\ndefine\r\nview \r\nhugo\r\nas select * from sflight";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
            this.assertTokenDetails(tokens, 2, "--  ", 3, 1);
            this.assertTokenDetails(tokens, 3, "--", 4, 1);
            this.assertTokenDetails(tokens, 4, "/*  \r\n  \r\n*/", 5, 1);
            this.assertTokenDetails(tokens, 5, "/*\r\n\r\n*/", 8, 1);
            this.assertTokenDetails(tokens, 6, "define", 11, 1);
            this.assertTokenDetails(tokens, 7, "view", 12, 1);
            this.assertTokenDetails(tokens, 8, "hugo", 13, 1);
            this.assertTokenDetails(tokens, 9, "as", 14, 1);
            this.assertTokenDetails(tokens, 10, "select", 14, 4);
            this.assertTokenDetails(tokens, 11, "*", 14, 11);
            this.assertTokenDetails(tokens, 12, "from", 14, 13);
            this.assertTokenDetails(tokens, 13, "sflight", 14, 18);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksAreHandledCorrectly = function() {
            var source = "//  \n//\n--  \n--\n/*  \n  \n*/  \n/*\n\n*/\ndefine\nview \nhugo\nas select * from sflight";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
            this.assertTokenDetails(tokens, 2, "--  ", 3, 1);
            this.assertTokenDetails(tokens, 3, "--", 4, 1);
            this.assertTokenDetails(tokens, 4, "/*  \n  \n*/", 5, 1);
            this.assertTokenDetails(tokens, 5, "/*\n\n*/", 8, 1);
            this.assertTokenDetails(tokens, 6, "define", 11, 1);
            this.assertTokenDetails(tokens, 7, "view", 12, 1);
            this.assertTokenDetails(tokens, 8, "hugo", 13, 1);
            this.assertTokenDetails(tokens, 9, "as", 14, 1);
            this.assertTokenDetails(tokens, 10, "select", 14, 4);
            this.assertTokenDetails(tokens, 11, "*", 14, 11);
            this.assertTokenDetails(tokens, 12, "from", 14, 13);
            this.assertTokenDetails(tokens, 13, "sflight", 14, 18);
        };
        TestsUnitDdlScanner.prototype.linuxLineBreaksAreHandledCorrectly2 = function() {
            var source = "\n\ndefine\nview \nhugo\nas select * from sflight";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "define", 3, 1);
        };
        TestsUnitDdlScanner.prototype.macLineBreaksAreHandledCorrectly = function() {
            var source = "//  \r//\r--  \r--\r/*  \r  \r*/  \r/*\r\r*/\rdefine\rview \rhugo\ras select * from sflight";
            var tokens = this.tokenize(source);
            this.assertTokenDetails(tokens, 0, "//  ", 1, 1);
            this.assertTokenDetails(tokens, 1, "//", 2, 1);
            this.assertTokenDetails(tokens, 2, "--  ", 3, 1);
            this.assertTokenDetails(tokens, 3, "--", 4, 1);
            this.assertTokenDetails(tokens, 4, "/*  \r  \r*/", 5, 1);
            this.assertTokenDetails(tokens, 5, "/*\r\r*/", 8, 1);
            this.assertTokenDetails(tokens, 6, "define", 11, 1);
            this.assertTokenDetails(tokens, 7, "view", 12, 1);
            this.assertTokenDetails(tokens, 8, "hugo", 13, 1);
            this.assertTokenDetails(tokens, 9, "as", 14, 1);
            this.assertTokenDetails(tokens, 10, "select", 14, 4);
            this.assertTokenDetails(tokens, 11, "*", 14, 11);
            this.assertTokenDetails(tokens, 12, "from", 14, 13);
            this.assertTokenDetails(tokens, 13, "sflight", 14, 18);
        };
        TestsUnitDdlScanner.prototype.assertTokenDetails = function(tokens, index, lexem, line, column) {
            var token = tokens[index];
            equal(lexem, token.m_lexem);
            equal(line, token.m_line);
            equal(column, token.m_column);
        };
        TestsUnitDdlScanner.prototype.stringLiterals = function() {
            var source = "define view 'foo'";
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(t.m_lexem, "'foo'");
            equal(TestsUnitDdlScanner.numString, t.m_num);
            source = "define view 'foo''bar'";
            tokens = this.tokenize(source);
            t = tokens[2];
            equal(t.m_lexem, "'foo''bar'");
            equal(TestsUnitDdlScanner.numString, t.m_num);
        };
        TestsUnitDdlScanner.prototype.binaryLiterals = function() {
            var source = "define view binary'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'";
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal("binary", t.m_lexem);
            equal(TestsUnitDdlScanner.numId, t.m_num);
            t = tokens[3];
            equal("'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'", t.m_lexem);
            equal(TestsUnitDdlScanner.numString, t.m_num);
            source = "define view x'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'";
            tokens = this.tokenize(source);
            t = tokens[2];
            equal("x'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'", t.m_lexem);
            equal(TestsUnitDdlScanner.numBinary, t.m_num);
            source = "define view X'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'";
            tokens = this.tokenize(source);
            t = tokens[2];
            equal("X'0102030405060708090a0b0c0d0e0ff1f2f3f4f5f6f7f8f9fafbfcfdfeff'", t.m_lexem);
            equal(TestsUnitDdlScanner.numBinary, t.m_num);
        };
        TestsUnitDdlScanner.prototype.integerLiterals = function() {
            this.assertIntConst("define view 1", "1");
            this.assertIntConst("define view -1", "-1");
            this.assertIntConst("define view +1", "+1");
            this.assertIntConst("define view -2147483648", "-2147483648");
            this.assertIntConst("define view 2147483647", "2147483647");
            this.assertLongIntConst("define view 1L", "1L");
            this.assertLongIntConst("define view 1l", "1l");
            this.assertLongIntConst("define view -1L", "-1L");
            this.assertLongIntConst("define view -1l", "-1l");
            this.assertLongIntConst("34-1L", "1L");
            this.assertLongIntConst("34-1l", "1l");
            this.assertLongIntConst("34L -1L", "1L");
            this.assertLongIntConst("34L -1l", "1l");
            this.assertLongIntConst("34+1L", "1L");
            this.assertLongIntConst("34+1l", "1l");
            this.assertLongIntConst("34L +1L", "1L");
            this.assertLongIntConst("define view +1L", "+1L");
            this.assertLongIntConst("define view -9223372036854775808L", "-9223372036854775808L");
            this.assertLongIntConst("define view 9223372036854775807L", "9223372036854775807L");
        };
        TestsUnitDdlScanner.prototype.floatingPointLiterals = function() {
            this.assertDecConst("define view 123.45M", "123.45M");
            this.assertDecConst("define view 123.45m", "123.45m");
            this.assertDecConst("34-123.45m", "123.45m");
            this.assertRealConst("define view 123.456", "123.456");
            this.assertRealConst("define view +123.456", "+123.456");
            this.assertRealConst("define view -123.456", "-123.456");
            this.assertRealConst("32- 123.456", "123.456");
            this.assertRealConst("define view 123.456e1", "123.456e1");
            this.assertRealConst("define view 123.456E1", "123.456E1");
            this.assertRealConst("define view 123.456e-1", "123.456e-1");
            this.assertRealConst("define view 123.456e+1", "123.456e+1");
            this.assertRealConst("43 + 123.456e+1", "123.456e+1");
            this.assertRealConst("define view -123.456", "-123.456");
            this.assertRealConst("define view -123.456e1", "-123.456e1");
            this.assertRealConst("define view -123.456e-1", "-123.456e-1");
            this.assertRealConst("43 - 123.456e-1", "123.456e-1");
            this.assertRealConst("define view -123.456e+1", "-123.456e+1");
            this.assertRealConst("define view +123.456", "+123.456");
            this.assertRealConst("define view +123.456e1", "+123.456e1");
            this.assertRealConst("define view +123.456e-1", "+123.456e-1");
            this.assertRealConst("define view +123.456e+1", "+123.456e+1");
        };
        TestsUnitDdlScanner.prototype.dateTimeLiterals = function() {
            this.assertDateConst("define view date'2013-04-29' hoho", "date'2013-04-29'");
            this.assertDateConst("define view date'2013-4-9'", "date'2013-4-9'");
            this.assertDateConst("define view date'2013-", "date'2013-");
            this.assertDateConst("define view date'13-04-29'", "date'13-04-29'");
            this.assertTimeConst("define view time'05:04:03'", "time'05:04:03'");
            this.assertTimeConst("define view time'05:04'", "time'05:04'");
            this.assertTimeConst("define view time'5:4:3'", "time'5:4:3'");
            this.assertTimeConst("define view time'5:4'", "time'5:4'");
            this.assertTimeConst("define view time'5:", "time'5:");
            this.assertTimeConst("define view time'17:04:03'", "time'17:04:03'");
            this.assertTimeConst("define view time'17:04'", "time'17:04'");
            this.assertTimeConst("define view time'17:04:03.12345'", "time'17:04:03.12345'");
            this.assertTimestampConst("define view timestamp'2013-05-01 01:02:03'", "timestamp'2013-05-01 01:02:03'");
            this.assertTimestampConst("define view timestamp'2013-05-01 01:02:", "timestamp'2013-05-01 01:02:");
            this.assertTimestampConst("define view timestamp'2013-05-01 01:02:03'", "timestamp'2013-05-01 01:02:03'");
            this.assertTimestampConst("define view timestamp'2013-05-01 01:02:03.12345'", "timestamp'2013-05-01 01:02:03.12345'");
        };
        TestsUnitDdlScanner.prototype.weirdTokens = function() {
            var tokens = this.tokenize("bin2  x'1'");
            equal(TestsUnitDdlScanner.numBinary, tokens[1].m_num);
            tokens = this.tokenize("bin2  X'123'");
            equal(TestsUnitDdlScanner.numBinary, tokens[1].m_num);
        };
        TestsUnitDdlScanner.prototype.assertTimestampConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numTimestamp, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertDateConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numDate, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertTimeConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numTime, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertRealConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numReal, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertDecConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numDec, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertLongIntConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numLongInt, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertIntConst = function(source, expectedLexem) {
            var tokens = this.tokenize(source);
            var t = tokens[2];
            equal(expectedLexem, t.m_lexem);
            equal(TestsUnitDdlScanner.numInt, t.m_num);
        };
        TestsUnitDdlScanner.prototype.assertGT = function() {
            var source = "where a >= 3";
            var tokens = this.tokenize(source);
            equal(">=", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.assertLT = function() {
            var source = "where a <= 3";
            var tokens = this.tokenize(source);
            equal("<=", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.assertGS = function() {
            var source = "where a <> 3";
            var tokens = this.tokenize(source);
            equal("<>", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.dateLiteralOffset = function() {
            var source = "ld1 LocalDate default date'2013-04-29';";
            var tokens = this.tokenize(source);
            var token = tokens[3];
            equal("date'2013-04-29'", token.m_lexem);
            equal(22, token.m_offset);
        };
        TestsUnitDdlScanner.prototype.timeLiteralOffset = function() {
            var source = "ld1 LocalDate default time'2013-04-29';";
            var tokens = this.tokenize(source);
            var token = tokens[3];
            equal("time'2013-04-29'", token.m_lexem);
            equal(22, token.m_offset);
        };
        TestsUnitDdlScanner.prototype.timestampLiteralOffset = function() {
            var source = "ld1 LocalDate default timestamp'2013-04-29';";
            var tokens = this.tokenize(source);
            var token = tokens[3];
            equal("timestamp'2013-04-29'", token.m_lexem);
            equal(22, token.m_offset);
        };
        TestsUnitDdlScanner.prototype.minusTokenBetweenTwoNumbers = function() {
            var source = "2-3";
            var tokens = this.tokenize(source);
            var token = tokens[1];
            equal("-", token.m_lexem);
            equal(TestsUnitDdlScanner.numId != token.m_num, true);
            equal(4711, token.m_num);
        };
         TestsUnitDdlScanner.prototype.smallerEquals = function() {
            var tokens = this.tokenize("<=");
            var se = tokens[0];
            equal("<=", se.m_lexem);
            equal(TestsUnitDdlScanner.numSe, se.m_num);
        };

        TestsUnitDdlScanner.prototype.greaterEquals = function() {
            var tokens = this.tokenize(">=");
            var ge = tokens[0];
            equal(">=", ge.m_lexem);
            equal(TestsUnitDdlScanner.numGe, ge.m_num);
        };
        TestsUnitDdlScanner.prototype.smaller = function() {
            var tokens = this.tokenize("<");
            var ge = tokens[0];
            equal("<", ge.m_lexem);
            equal(TestsUnitDdlScanner.numLt, ge.m_num);
        };

        TestsUnitDdlScanner.prototype.greater = function () {
            var tokens = this.tokenize(">");
            var ge = tokens[0];
            equal(">", ge.m_lexem);
            equal(TestsUnitDdlScanner.numGt, ge.m_num);
        };


       TestsUnitDdlScanner.prototype.ue = function() {
            var source = "!2 !=";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
            equal("!", tokens[0].m_lexem);
            equal("2", tokens[1].m_lexem);
            equal("!=", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.doubleQuotesInDoubleQuotes = function() {
            var source = "define view \"test\"\"end\" as select from \"aaa\"\"\" where \"\"\"\" and \"\"\"end\"";
            var tokens = this.tokenize(source);
            equal(12, tokens.length);
            equal("\"test\"\"end\"", tokens[2].m_lexem);
            equal("\"aaa\"\"\"", tokens[6].m_lexem);
            equal("\"\"\"\"", tokens[8].m_lexem);
            equal("\"\"\"end\"", tokens[10].m_lexem);
            source = "define view \"test\"\"end as select from ";
            tokens = this.tokenize(source);
            equal(4, tokens.length);
            source = "define view \"test\"\"end\"\" as select from ";
            tokens = this.tokenize(source);
            equal(4, tokens.length);
            source = "define view \"test\"\"end\"\"\" as select from ";
            tokens = this.tokenize(source);
            equal(7, tokens.length);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenDoesNotDamageOtherTokens = function() {
            var source = "define view viewName as select fieldname as from tableName";
            var tokens = this.tokenizeWithLineColumn(source, 1, 45);
            equal(11, tokens.length);
            equal(Category.CAT_INCOMPLETE, tokens[7].m_category);
            equal("from", tokens[8].m_lexem);
            source = "define view viewName as select fieldname as from tableName";
            tokens = this.tokenizeWithLineColumn(source, 1, source.length);
            equal(11, tokens.length);
            equal(Category.CAT_INCOMPLETE, tokens[8].m_category);
            equal("tableNam", tokens[8].m_lexem);
            source = "define view viewName as select fieldname as from tableName";
            tokens = this.tokenizeWithLineColumn(source, 1, source.length + 1);
            equal(11, tokens.length);
            equal(Category.CAT_INCOMPLETE, tokens[9].m_category);
            equal("tableName", tokens[8].m_lexem);
            source = "\0";
            tokens = this.tokenizeWithLineColumn(source, 1, 1);
            equal(2, tokens.length);
            equal(Category.CAT_INCOMPLETE, tokens[0].m_category);
        };
        TestsUnitDdlScanner.prototype.incompleteQuoteWithLineBreak = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "name1 \"name2 \r\n name3 \"name4\" ";
            var tokens = this.tokenize(source);
            equal("\"name2 ", tokens[1].m_lexem);
            equal(ErrorState.Erroneous, tokens[1].m_err_state);
            equal("name3", tokens[2].m_lexem);
            equal(ErrorState.Correct, tokens[2].m_err_state);
            equal("\"name4\"", tokens[3].m_lexem);
            equal(ErrorState.Correct, tokens[3].m_err_state);
            source = "name1 \"name2 \n name3 \"name4\" ";
            tokens = this.tokenize(source);
            equal("\"name2 ", tokens[1].m_lexem);
            equal(ErrorState.Erroneous, tokens[1].m_err_state);
            equal("name3", tokens[2].m_lexem);
            equal(ErrorState.Correct, tokens[2].m_err_state);
            equal("\"name4\"", tokens[3].m_lexem);
            equal(ErrorState.Correct, tokens[3].m_err_state);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenSmallerEqual = function() {
            var source = "define view v as select * from sflight where <=";
            var column = source.indexOf("<") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "<=");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenBetweenSmallerEqual = function() {
            var source = "define view v as select * from sflight where <=";
            var column = source.indexOf("<") + 2;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "=");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal("<", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenSmaller = function() {
            var source = "define view v as select * from sflight where <   ";
            var column = source.indexOf("<") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "<");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal("", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenGreater = function() {
            var source = "define view v as select * from sflight where >3   ";
            var column = source.indexOf(">") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, ">");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal("", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenEqual = function() {
            var source = "define view v as select * from sflight where =";
            var column = source.indexOf("=") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "=");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal("", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenSmallerGreater = function() {
            var source = "define view v as select * from sflight where <>";
            var column = source.indexOf("<") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "<>");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenBetweenSmallerGreater = function() {
            var source = "define view v as select * from sflight where <>";
            var column = source.indexOf("<") + 2;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, ">");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal("<", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenEqualGreater = function() {
            var source = "define view v as select * from sflight where =>";
            var column = source.indexOf("=") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "=>");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenAtSmaller = function() {
            var source = "define view v as select * from sflight where @<";
            var column = source.indexOf("@") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "@<");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenGreaterEqual = function() {
            var source = "define view v as select * from sflight where >=";
            var column = source.indexOf(">") + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, ">=");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenBetweenGreaterEqual = function() {
            var source = "define view v as select * from sflight where >=";
            var column = source.indexOf(">") + 2;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var t = this.findToken(tokens, "=");
            t = tokens[tokens.indexOf(t) - 1];
            equal(Category.CAT_INCOMPLETE, t.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, t.m_num);
            equal(">", t.m_lexem);
        };
        TestsUnitDdlScanner.prototype.createScannerWithStrictSeparationAtSlash = function() {
            return DdlScanner.DdlScanner7(TestsUnitDdlScanner.byteCode, true, true, false, false, false, false, false);
        };
        TestsUnitDdlScanner.prototype.incompleteTokenCreateBeforeQuote = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "sflight.\"";
            var tokens = this.tokenizeWithLineColumn(source, 1, 9);
            this.assertTokens(tokens);
            equal(Category.CAT_INCOMPLETE, tokens[2].m_category);
            equal("\"", tokens[3].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterWithoutSpace = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "view Occupancy as select from Employee {\n" + "        office.building,\n" + "        office.floor,\n"
                + "        office.roomNumber,\n" + "        count(id) as peopleCount,\n" + "        office.capacity,\n"
                + "        round(100*count(id)/office.capacity,0) as rate\n"
                + "    } group by office.building, office.floor, office.roomNumber,\n" + "    office.capacity;";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterWithSpaceBefore = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "view Occupancy as select from Employee {\n" + "        office.building,\n" + "        office.floor,\n"
                + "        office.roomNumber,\n" + "        count(id) as peopleCount,\n" + "        office.capacity,\n"
                + "        round(100*count(id) /office.capacity,0) as rate\n"
                + "    } group by office.building, office.floor, office.roomNumber,\n" + "    office.capacity;";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterWithSpaceBeforeAndAfter = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "view Occupancy as select from Employee {\n" + "        office.building,\n" + "        office.floor,\n"
                + "        office.roomNumber,\n" + "        count(id) as peopleCount,\n" + "        office.capacity,\n"
                + "        round(100*count(id) / office.capacity,0) as rate\n"
                + "    } group by office.building, office.floor, office.roomNumber,\n" + "    office.capacity;";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterInTheMiddleOfIdentifier = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "aaa aaa/bbb";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterAtStartOfIdentifier = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "/bbb";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterInSourceWithOnlyDivisionCharacter = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "/";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDivisionCharacterAtEndOfIdentifier = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "ddd ee/";
            var tokens = this.tokenize(source);
            var divTokenFound = false;
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if ("/" === t.m_lexem) {
                    divTokenFound = true;
                }
            }
            equal(divTokenFound, true);
        };
        TestsUnitDdlScanner.prototype.scanDollarProjectionAsOneToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "FROM sflight { $projection.field }";
            var tokens = this.tokenize(source);
            equal(8, tokens.length);
            equal("$projection", tokens[3].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDollarExtensionAsOneToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "FROM sflight { $extension.* }";
            var tokens = this.tokenize(source);
            equal(8, tokens.length);
            equal("$extension", tokens[3].m_lexem);
            equal(".", tokens[4].m_lexem);
            equal("*", tokens[5].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDollarAnythingAsOneToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "FROM sflight { $invalid.field }";
            var tokens = this.tokenize(source);
            equal(8, tokens.length);
            equal("$invalid", tokens[3].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanSingleColonAsOneToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = ": : :";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
            equal(":", tokens[0].m_lexem);
            equal(":", tokens[1].m_lexem);
            equal(":", tokens[2].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDoubleColonAsOneToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = ":: :";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            equal("::", tokens[0].m_lexem);
            equal(":", tokens[1].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDotDotAsOneToken = function() {
            this.scanner = this.createScannerWithCreationOfDotDot();
            var source = "..";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
            equal("..", tokens[0].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanDotDotAsTwoToken = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            var source = "..";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            equal(".", tokens[0].m_lexem);
            equal(".", tokens[1].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanTwoSeparatedDotsAsTwoTokens = function() {
            this.scanner = this.createScannerWithCreationOfDotDot();
            var source = ". .";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            equal(".", tokens[0].m_lexem);
            equal(".", tokens[1].m_lexem);
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            source = ". .";
            tokens = this.tokenize(source);
            equal(3, tokens.length);
            equal(".", tokens[0].m_lexem);
            equal(".", tokens[1].m_lexem);
        };
        TestsUnitDdlScanner.prototype.scanEnumIdTokenAsId = function() {
            this.scanner = this.createScannerWithStrictSeparationAtSlash();
            this.scanner.enumId = TestsUnitDdlScanner.numEnumId;
            this.scanner.id = TestsUnitDdlScanner.numId;
            var source = "#EnumValue";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
            var token = tokens[0];
            equal("#EnumValue", token.m_lexem);
            equal(TestsUnitDdlScanner.numId, token.m_num);
            equal(Category.CAT_IDENTIFIER, token.m_category);
        };
        TestsUnitDdlScanner.prototype.scanEnumIdToken = function() {
            this.scanner = this.createScannerWithEnumIdTokens();
            this.scanner.enumId = TestsUnitDdlScanner.numEnumId;
            var source = "#EnumValue";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
            var token = tokens[0];
            equal("#EnumValue", token.m_lexem);
            equal(TestsUnitDdlScanner.numEnumId, token.m_num);
            equal(Category.CAT_IDENTIFIER, token.m_category);
        };
        TestsUnitDdlScanner.prototype.scanPipe = function() {
            this.scanner = this.createScannerWithEnumIdTokens();
            this.scanner.pipe = TestsUnitDdlScanner.numPipe;
            var source = "a || b";
            var tokens = this.tokenize(source);
            equal(5, tokens.length);
            var first = tokens[1];
            equal("|", first.m_lexem);
            equal(TestsUnitDdlScanner.numPipe, first.m_num);
            equal(Category.CAT_OPERATOR, first.m_category);
            var second = tokens[2];
            equal("|", second.m_lexem);
            equal(TestsUnitDdlScanner.numPipe, second.m_num);
            equal(Category.CAT_OPERATOR, second.m_category);
        };
        TestsUnitDdlScanner.prototype.assertNoneWsColon = function(source) {
            this.scanner = this.createScannerWithScopedIdTokens();
            this.scanner.colon = TestsUnitDdlScanner.numColon;
            this.scanner.colonFollowedById = TestsUnitDdlScanner.numColonNoneWs;
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var firstToken = tokens[0];
            var secondToken = tokens[1];
            equal(":", firstToken.m_lexem);
            equal(Category.CAT_OPERATOR, firstToken.m_category);
            equal(TestsUnitDdlScanner.numColonNoneWs, firstToken.m_num);
            equal(secondToken.m_lexem.charAt(0) == ':', false);
        };
        TestsUnitDdlScanner.prototype.assertColon = function(source) {
            this.scanner = this.createScannerWithScopedIdTokens();
            this.scanner.colon = TestsUnitDdlScanner.numColon;
            this.scanner.colonFollowedById = TestsUnitDdlScanner.numColonNoneWs;
            var tokens = this.tokenize(source);
            var firstToken = tokens[0];
            var secondToken = tokens[1];
            equal(":", firstToken.m_lexem);
            equal(Category.CAT_OPERATOR, firstToken.m_category);
            equal(TestsUnitDdlScanner.numColon, firstToken.m_num);
            equal(secondToken.m_lexem.charAt(0) == ':', false);
        };
        TestsUnitDdlScanner.prototype.assertColonWhenColonNoneWsCreationIsOff = function(source) {
            this.scanner = this.createScannerWithColonNoneWsTokens(false);
            this.scanner.colon = TestsUnitDdlScanner.numColon;
            this.scanner.colonFollowedById = TestsUnitDdlScanner.numColonNoneWs;
            var tokens = this.tokenize(source);
            var firstToken = tokens[0];
            var secondToken = tokens[1];
            equal(":", firstToken.m_lexem);
            equal(Category.CAT_OPERATOR, firstToken.m_category);
            equal(TestsUnitDdlScanner.numColon, firstToken.m_num);
            equal(secondToken.m_lexem.charAt(0) == ':', false);
        };
        TestsUnitDdlScanner.prototype.assertColonColon = function(source) {
            this.scanner = this.createScannerWithScopedIdTokens();
            this.scanner.colon = TestsUnitDdlScanner.numColon;
            this.scanner.colonFollowedById = TestsUnitDdlScanner.numColonNoneWs;
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var firstToken = tokens[0];
            var secondToken = tokens[1];
            equal("::", firstToken.m_lexem);
            equal(Category.CAT_OPERATOR, firstToken.m_category);
            equal(secondToken.m_lexem.charAt(0) == ':', false);
        };
        TestsUnitDdlScanner.prototype.colonScannedAsColonNoneWs = function() {
            this.assertNoneWsColon(":DontCare");
        };
        TestsUnitDdlScanner.prototype.colonScannedAsColonNoneWsWhenFollowedByQuotedId = function() {
            this.assertNoneWsColon(":\"DontCare\"");
        };
        TestsUnitDdlScanner.prototype.colonScannedAsColonForTrueAndFalse = function() {
            this.assertColon(":true");
            this.assertColon(":TRUE");
            this.assertColon(":false");
            this.assertColon(": false");
        };
        TestsUnitDdlScanner.prototype.colonScannedAsColonIfWsIsFollowing = function() {
            this.assertColon(": DontCare");
        };
        TestsUnitDdlScanner.prototype.colonScannedAsColonIfCreationOfColonNoneWsIsOff = function() {
            this.assertColonWhenColonNoneWsCreationIsOff(":DontCare");
        };
        TestsUnitDdlScanner.prototype.colonWhitespaceAnythingScannedAsColon = function() {
            this.assertColon(": DontCare");
            this.assertColon(":\r\nDontCare");
            this.assertColon(":\nDontCare");
            this.assertColon(":\rDontCare");
        };
        TestsUnitDdlScanner.prototype.colonStringLiteralScannedAsColon = function() {
            this.assertColon(":'StringLiteral'");
        };
        TestsUnitDdlScanner.prototype.colonIntLiteralScannedAsColon = function() {
            this.assertColon(":42");
        };
        TestsUnitDdlScanner.prototype.colonRealLiteralScannedAsColon = function() {
            this.assertColon(":4.2");
        };
        TestsUnitDdlScanner.prototype.colonDeclLiteralWithExpScannedAsColon = function() {
            this.assertColon(":4.2M");
        };
        TestsUnitDdlScanner.prototype.colonRealLiteralWithExpScannedAsColon = function() {
            this.assertColon(":4.2e5");
        };
        TestsUnitDdlScanner.prototype.colonLongIntLiteralScannedAsColon = function() {
            this.assertColon(":500L");
        };
        TestsUnitDdlScanner.prototype.colonDateLiteralScannedAsColon = function() {
            this.assertColon(":date'1234-01-01'");
        };
        TestsUnitDdlScanner.prototype.colonTimeLiteralScannedAsColon = function() {
            this.assertColon(":time'11:55:00:00'");
        };
        TestsUnitDdlScanner.prototype.colonTimeStampLiteralScannedAsColon = function() {
            this.assertColon(":timestamp'1234-01-01 11:55:00:00'");
        };
        TestsUnitDdlScanner.prototype.colonBinaryLiteralScannedAsTwoTokens = function() {
            this.assertColon(":x'feff'");
        };
        TestsUnitDdlScanner.prototype.colonColonAnythingScannedAsTwoTokens = function() {
            this.assertColonColon("::DontCare");
        };
        TestsUnitDdlScanner.prototype.colonColonLiteralAsTwoTokens = function() {
            this.assertColonColon("::'Literal'");
        };
        TestsUnitDdlScanner.prototype.pipeScannedAsOneToken = function() {
            var scanner = this.createScannerWithPipePipeTokens(false);
            scanner.setInput("|", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(2, tokens.length);
            this.assertToken(tokens[0], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.pipePipeScannedAsTwoTokens = function() {
            var scanner = this.createScannerWithPipePipeTokens(false);
            scanner.setInput("||", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(3, tokens.length);
            this.assertToken(tokens[0], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
            this.assertToken(tokens[1], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.pipePipeInsideExpresionScannedAsTwoTokens = function() {
            var scanner = this.createScannerWithPipePipeTokens(false);
            scanner.setInput("a||b", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(5, tokens.length);
            this.assertToken(tokens[1], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
            this.assertToken(tokens[2], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.singlePipeScannedAsOneToken = function() {
            var scanner = this.createScannerWithPipePipeTokens(true);
            scanner.setInput("|", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(2, tokens.length);
            this.assertToken(tokens[0], TestsUnitDdlScanner.numPipe, "|", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.pipePipeScannedAsOneTokens = function() {
            var scanner = this.createScannerWithPipePipeTokens(true);
            scanner.setInput("||", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(2, tokens.length);
            this.assertToken(tokens[0], TestsUnitDdlScanner.numPipePipe, "||", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.pipePipeInsideExpressionScannedAsTwoTokens = function() {
            var scanner = this.createScannerWithPipePipeTokens(true);
            scanner.setInput("a||b", new CursorPos(1, 1, null), new CursorPos(1, -1, null));
            var tokens = scanner.getInput();
            equal(4, tokens.length);
            this.assertToken(tokens[1], TestsUnitDdlScanner.numPipePipe, "||", Category.CAT_OPERATOR, ErrorState.Correct);
        };
        TestsUnitDdlScanner.prototype.assertToken = function(token, num, lexem, category, errorState) {
            equal(num, token.m_num);
            equal(lexem, token.m_lexem);
            equal(category, token.m_category);
            equal(errorState, token.m_err_state);
        };
        TestsUnitDdlScanner.prototype.questionMarkWithSpace = function() {
            var source = "a ? b ";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
        };
        TestsUnitDdlScanner.prototype.questionMarkWithoutSpace = function() {
            var source = "a? b ";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
        };
        TestsUnitDdlScanner.prototype.quotationMarkWithSpace = function() {
            var source = "a ! b ";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
        };
        TestsUnitDdlScanner.prototype.quotationMarkWithoutSpace = function() {
            var source = "a! b ";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
        };
        TestsUnitDdlScanner.prototype.noEndlessLoopWithQuestionMark = function() {
            var source = "namespace fu1__2;\n" + //
                "\n" + //
                "context enums {\n" + //
                "\n" + //
                "	type myType : Integer enum { a= 1;v? 2;};\n" + //
                " \n" + //
                "  	entity a {\n" + //
                "  		key k : Integer;\n" + //
                "  		el2 : myType default #S1;\n" + //
                "  		el2 : myType default \n" + //
                "  	};\n" + //
                " \n" + //
                "};";
            var tokens = this.tokenize(source);
            equal(44, tokens.length);
        };
        TestsUnitDdlScanner.prototype.dashArrowScannedAsOneToken = function() {
            var source = "=>";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
        };
        TestsUnitDdlScanner.prototype.dashAarrowWithSpaceScannedAsOneToken = function() {
            var source = "= >";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
        };
        TestsUnitDdlScanner.prototype.escapedQuote = function() {
            var source = "'Don''t do it'";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenBeforeMultiLineComment = function() {
            var source = "/*comment*/test";
            var tokens = this.tokenizeWithLineColumn(source, 1, 1);
            equal(4, tokens.length);
            var first = tokens[0];
            equal(Category.CAT_INCOMPLETE, first.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, first.m_num);
        };
        TestsUnitDdlScanner.prototype.noAnyKwTokenInsideMultiLineComment = function() {
            var source = "/*comment*/test";
            var tokens = this.tokenizeWithLineColumn(source, 1, 2);
            equal(3, tokens.length);
            var first = tokens[0];
            equal(Category.CAT_COMMENT,first.m_category);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenAfterAfterMultiLineComment = function() {
            var source = "/*comment*/test";
            var secondSlashColumnIndex = source.indexOf("/", 2) + 1 + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, secondSlashColumnIndex);
            equal(4,tokens.length);
            var first = tokens[1];
            equal(Category.CAT_INCOMPLETE,first.m_category);
            equal(TestsUnitDdlScanner.numAnyKw,first.m_num);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenOnlyOnceForQuotedIdentifier = function() {
            var source = "define view v as select from \"playground.melcher::me#lchview\" {   };";
            var columnCoCoPos = source.indexOf("#");
            source=source.replace("#","");
            var tokens = this.tokenizeWithLineColumn(source, 1, columnCoCoPos + 1);
            var count = this.getNumberOfAnyKwTokens(tokens);
            equal(1,count);
            var index = this.getAnyKwTokenIndex(tokens);
            var t = tokens[index];
            equal("\"playground.melcher::me",t.m_lexem);
            var n = tokens[index + 1];
            equal("lchview\"",n.m_lexem);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenQuotedIdentifierNextTokenContainsRestOfQuotedString = function() {
            var source = "define view v as select from \"playgro#und.melcher::melchview\" {   };";
            var columnCoCoPos = source.indexOf("#");
            source=source.replace("#","");
            var tokens = this.tokenizeWithLineColumn(source, 1, columnCoCoPos + 1);
            var count = this.getNumberOfAnyKwTokens(tokens);
            equal(1,count);
            var index = this.getAnyKwTokenIndex(tokens);
            var t = tokens[index];
            equal("\"playgro",t.m_lexem);
            var n = tokens[index + 1];
            equal("und.melcher::melchview\"",n.m_lexem);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenEndOfQuotedIdentifier = function() {
            var source = "define view v as select from \"playground.melcher::melchview#\" {   };";
            var columnCoCoPos = source.indexOf("#");
            source=source.replace("#","");
            var tokens = this.tokenizeWithLineColumn(source, 1, columnCoCoPos + 1);
            var count = this.getNumberOfAnyKwTokens(tokens);
            equal(1,count);
            var index = this.getAnyKwTokenIndex(tokens);
            var t = tokens[index];
            equal("\"playground.melcher::melchview",t.m_lexem);
            var n = tokens[index + 1];
            equal("\"",n.m_lexem);
        };
        TestsUnitDdlScanner.prototype.anyKwTokenBeforeSingleLineComment = function() {
            var source = "//comment test";
            var tokens = this.tokenizeWithLineColumn(source, 1, 1);
            equal(3, tokens.length);
            var first = tokens[0];
            equal(Category.CAT_INCOMPLETE, first.m_category);
            equal(TestsUnitDdlScanner.numAnyKw, first.m_num);
        };
        TestsUnitDdlScanner.prototype.noAnyKwTokenInsideSingleLineComment = function() {
            var source = "//comment test";
            var tokens = this.tokenizeWithLineColumn(source, 1, 3);
            equal(2, tokens.length);
            var first = tokens[0];
            equal(Category.CAT_COMMENT, first.m_category);
        };
        TestsUnitDdlScanner.prototype.lineColumnCorrectForMultiLineStringLiteral = function() {
            var source = "first \r\nsecond \r\nthird '\r\nmulti line string' fourth\r\nfifth";
            var tokens = this.tokenize(source);
            equal(7, tokens.length);
            var t = tokens[3];
            equal(Category.CAT_LITERAL, t.m_category);
            equal(3, t.m_line);
            equal(7, t.m_column);
        };
        TestsUnitDdlScanner.prototype.findToken = function(tokens, lexem) {
            for (var tCount = 0; tCount < tokens.length; tCount++) {
                var t = tokens[tCount];
                if (rnd.Utils.stringEqualsIgnoreCase(lexem, t.m_lexem)) {
                    return t;
                }
            }
            return null;
        };
        TestsUnitDdlScanner.prototype.assertDashArrowToken = function(t, tokenNumber) {
            equal("=>", t.m_lexem);
            equal(tokenNumber, t.m_num);
        };
        TestsUnitDdlScanner.prototype.dashArrowScannedAsDoubleArrowNoneWs = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className=>methodName");
            equal(4, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrowNoneWs);
        };
        TestsUnitDdlScanner.prototype.dashArrowWithWsBeforeScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className =>methodName");
            equal(4, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowWithWsAfterScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className=> methodName");
            equal(4, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowWithWsBeforeAndAfterScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className => methodName");
            equal(4, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowSourroundedByCommentsScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className/*comment*/=>/*comment*/methodName");
            equal(6, tokens.length);
            var secondToken = tokens[2];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowWithCommentInFrontScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className/*comment*/=>methodName");
            equal(5, tokens.length);
            var secondToken = tokens[2];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowFollowedByCommentScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className=>/*comment*/methodName");
            equal(5, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrow);
        };
        TestsUnitDdlScanner.prototype.dashArrowWithWsEverywhereScannedAsDoubleArrow = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("className = > methodName");
            equal(5, tokens.length);
            var secondToken = tokens[1];
            equal("=", secondToken.m_lexem);
        };
        TestsUnitDdlScanner.prototype.dashArrowAtBeginOfSourceScannedAsDoubleArrowNoneWs = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("=>name");
            equal(3, tokens.length);
            var secondToken = tokens[0];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrowNoneWs);
        };
        TestsUnitDdlScanner.prototype.dashArrowAtEndOfSourceScannedAsDoubleArrowNoneWs = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var tokens = this.tokenize("name=>");
            equal(3, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrowNoneWs);
        };
        TestsUnitDdlScanner.prototype.dashArrowScannedAsDoubleArrowNoneWsWhenTriggeringCoCoDirecltyAfter = function() {
            this.scanner = this.createScannerWithDashArrowNoneWsTokens(true);
            var source = "className=> methodName";
            var column = source.indexOf("=>") + 2 + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            equal(5, tokens.length);
            var secondToken = tokens[1];
            this.assertDashArrowToken(secondToken, TestsUnitDdlScanner.numDashArrowNoneWs);
        };
        TestsUnitDdlScanner.prototype.nbspCharacters = function() {
            var source = "\u00A0\u00A0a\u00A0b\u00A0";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.VTABCharacters = function() {
            var source = "\u000B\u000Ba\u000Bb\u000B";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.HTABCharacters = function() {
            var source = "\u0009\u0009a\u0009b\u0009";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.NEWPAGECharacters = function() {
            var source = "\u000C\u000Ca\u000Cb\u000C";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.NBSPACECharacters = function() {
            var source = "\u00A0\u00A0a\u00A0b\u00A0";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.NEXTLINECharacters = function() {
            var source = "\u0085\u0085a\u0085b\u0085";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            var first = tokens[0];
            equal("a", first.m_lexem);
            var second = tokens[1];
            equal("b", second.m_lexem);
        };
        TestsUnitDdlScanner.prototype.commaVisibleInTokenListInCoCoScenario = function() {
            var source = "view v as select from sflight { field., field2";
            this.assertTokenInCoCoScenario(source, ",");
        };
        TestsUnitDdlScanner.prototype.closingBracketVisibleInTokenListInCoCoScenario = function() {
            var source = "view v as select from sflight { field.} where ";
            this.assertTokenInCoCoScenario(source, "}");
        };
        TestsUnitDdlScanner.prototype.openingBracketVisibleInTokenListInCoCoScenario = function() {
            var source = "view v as select from sflight field.{ where ";
            this.assertTokenInCoCoScenario(source, "{");
        };
        TestsUnitDdlScanner.prototype.semiColonVisibleInTokenListInCoCoScenario = function() {
            var source = "ROLE role1 { GRANT SELECT ON viewEnt WHERE field = ASPECT :path.to.;";
            this.assertTokenInCoCoScenario(source, ";");
        };
        TestsUnitDdlScanner.prototype.onlyOneAnyKwTokenBeforeSlash = function() {
            var source = "#/ns/name";
            var column = source.lastIndexOf("/");
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var numberOfAnyKwTokens = 0;
            for (var tokenCount = 0; tokenCount < tokens.length; tokenCount++) {
                var token = tokens[tokenCount];
                if (token.m_num == TestsUnitDdlScanner.numAnyKw) {
                    numberOfAnyKwTokens++;
                }
            }
            equal(1, numberOfAnyKwTokens);
        };
        TestsUnitDdlScanner.prototype.dotIsSeparateToken = function() {
            this.scanner = this.createScannerWithEnumIdTokens();
            var source = "#DomainNameWithNumberAtEnd1.4";
            var tokens = this.tokenize(source);
            equal(4, tokens.length);
        };
        TestsUnitDdlScanner.prototype.colonIsSeparateToken = function() {
            var source = "WHERE field = ASPECT :";
            var column = source.lastIndexOf(":");
            var tokens = this.tokenizeWithLineColumn(source, 1, column + 1);
            equal(7, tokens.length);
            var anyKwToken = tokens[4];
            equal(TestsUnitDdlScanner.numAnyKw == anyKwToken.m_num, true);
            equal("", anyKwToken.m_lexem);
            var colonToken = tokens[5];
            equal(TestsUnitDdlScanner.numAnyKw == colonToken.m_num, false);
            equal(":", colonToken.m_lexem);
        };
        TestsUnitDdlScanner.prototype.endOfMultiLineCommentIsOneToken = function() {
            this.scanner = this.createScannerWithEnumIdTokens();
            var source = "*/xyz";
            var tokens = this.tokenize(source);
            equal(3, tokens.length);
            equal("*/", tokens[0].m_lexem);
        };
        TestsUnitDdlScanner.prototype.singleStarDoesNotThrowException = function() {
            this.scanner = this.createScannerWithEnumIdTokens();
            var source = "*";
            var tokens = this.tokenize(source);
            equal(2, tokens.length);
            equal("*", tokens[0].m_lexem);
        };
        TestsUnitDdlScanner.prototype.assertTokenInCoCoScenario = function(source, lexem) {
            var column = source.indexOf(lexem) + 1;
            var tokens = this.tokenizeWithLineColumn(source, 1, column);
            var idx = this.getAnyKwTokenIndex(tokens);
            var next = tokens[idx + 1];
            equal(lexem, next.m_lexem);
        };
        TestsUnitDdlScanner.prototype.getAnyKwTokenIndex = function(tokens) {
            for (var i = 0; i < tokens.length; i++) {
                var t = tokens[i];
                if (t.m_num == TestsUnitDdlScanner.numAnyKw) {
                    return i;
                }
            }
            return 0;
        };
        TestsUnitDdlScanner.prototype.getNumberOfAnyKwTokens = function(tokens) {
            var result = 0;
            for (var tCount=0;tCount<tokens.length;tCount++) {
                var t=tokens[tCount];
                if (TestsUnitDdlScanner.numAnyKw == t.m_num) {
                    result++;
                }
            }
            return result;
        };


        // TEST METHODS

        test("hexLiteralsAreTokenizedCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.hexLiteralsAreTokenizedCorrectly();
        });

        test("hexLiteralsThatAreNotClosedAreTokenizedAsCorrectAsPossible", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.hexLiteralsThatAreNotClosedAreTokenizedAsCorrectAsPossible();
        });

        test("hexLiteralsThatAreNotClosedAndFollowedBySpaceAreTokenizedAsCorrectAsPossible", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.hexLiteralsThatAreNotClosedAndFollowedBySpaceAreTokenizedAsCorrectAsPossible();
        });

        test("numberLiteralsAreScannedAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.numberLiteralsAreScannedAsOneToken();
        });

        test("numberLiteralsAreScannedAsOneToken2", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.numberLiteralsAreScannedAsOneToken2();
        });

        test("numberLiteralsAreScannedAsOneToken3", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.numberLiteralsAreScannedAsOneToken3();
        });

        test("literalWithoutSpaceTokenizedCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.literalWithoutSpaceTokenizedCorrectly();
        });

        test("emptyStringLiteralsTokenziedCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.emptyStringLiteralsTokenziedCorrectly();
        });

        test("plusAsOperator", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.plusAsOperator();
        });

        test("minusAsOperator", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.minusAsOperator();
        });

        test("minusAsOperatorWithWS", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.minusAsOperatorWithWS();
        });

        test("plusAsOperatorSourroundedByWhitespace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.plusAsOperatorSourroundedByWhitespace();
        });

        test("plusAsOperatorPrefixedSourroundedByWhitespace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.plusAsOperatorPrefixedSourroundedByWhitespace();
        });

        test("plusAsOperatorPostfixedSourroundedByWhitespace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.plusAsOperatorPostfixedSourroundedByWhitespace();
        });

        test("commentsManyCommentsLines", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.commentsManyCommentsLines();
        });

        test("commentMultipleLines", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.commentMultipleLines();
        });

        test("abapNamespaceAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.abapNamespaceAsOneToken();
        });

        test("quotedIdentifierContainingSlashAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.quotedIdentifierContainingSlashAsOneToken();
        });

        test("multliLineCommentDirectlyBeforeIdentifier", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.multliLineCommentDirectlyBeforeIdentifier();
        });

        test("commentStarNotConsumedTwiceAndEndDetectedCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.commentStarNotConsumedTwiceAndEndDetectedCorrectly();
        });

        test("commentSlashInsideMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.commentSlashInsideMultiLineComment();
        });

        test("tokenAfterMultiLIneCommentAtCorrectOffset", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.tokenAfterMultiLIneCommentAtCorrectOffset();
        });

        test("parseLineCommentsWithNewLineOnly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.parseLineCommentsWithNewLineOnly();
        });

        test("escaped", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.escaped();
        });

        test("rbracketInColumnList", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.rbracketInColumnList();
        });

        test("lineCommentAfterClosingBraketDetectedCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.lineCommentAfterClosingBraketDetectedCorrectly();
        });

        test("HashIsPartOfIdentifier", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.HashIsPartOfIdentifier();
        });

        test("scanEmptySource", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanEmptySource();
        });

        test("scanPreAnnotation", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanPreAnnotation();
        });

        test("scanPostAnnotation", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanPostAnnotation();
        });

        test("scanPostAnnotationCreatesTwoTokensIfSpaceAtWrongPosition", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanPostAnnotationCreatesTwoTokensIfSpaceAtWrongPosition();
        });

        test("scanBooleanAnnotationValue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanBooleanAnnotationValue();
        });

        test("scanExcapedIdentifierAnnotationValue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanExcapedIdentifierAnnotationValue();
        });

        test("scanIntegerAnnotationValue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanIntegerAnnotationValue();
        });

        test("scanArrayAnnotationValue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanArrayAnnotationValue();
        });

        test("scanRecordAnnotationValue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanRecordAnnotationValue();
        });

        test("annotations", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations();
        });

        test("annotations2", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations2();
        });

        test("annotations3", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations3();
        });

        test("annotations4", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations4();
        });

        test("annotations5", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations5();
        });

        test("annotations6", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations6();
        });

        test("annotations7", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations7();
        });

        test("annotations8", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations8();
        });

        test("annotations9", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations9();
        });

        test("annotations10", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations10();
        });

        test("annotations11", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations11();
        });

        test("annotations12", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations12();
        });

        test("annotations13", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations13();
        });

        test("annotations14", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations14();
        });

        test("annotations15", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations15();
        });

        test("annotations16", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations16();
        });

        test("annotations17", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations17();
        });

        test("annotations18", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.annotations18();
        });

        test("macLineBreaksInLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.macLineBreaksInLineComment();
        });

        test("linuxLineBreaksInLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksInLineComment();
        });

        test("windowsLineBreaksInLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.windowsLineBreaksInLineComment();
        });

        test("macLineBreaksInSqlLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.macLineBreaksInSqlLineComment();
        });

        test("linuxLineBreaksInSqlLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksInSqlLineComment();
        });

        test("windowsLineBreaksInLineSqlComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.windowsLineBreaksInLineSqlComment();
        });

        test("macLineBreaksInLines", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.macLineBreaksInLines();
        });

        test("linuxLineBreaksInLine", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksInLine();
        });

        test("windowsLineBreaksInLine", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.windowsLineBreaksInLine();
        });

        test("macLineBreaksInMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.macLineBreaksInMultiLineComment();
        });

        test("linuxLineBreaksInMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksInMultiLineComment();
        });

        test("windowsLineBreaksInMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.windowsLineBreaksInMultiLineComment();
        });

        test("notClosedMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.notClosedMultiLineComment();
        });

        test("notClosedLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.notClosedLineComment();
        });

        test("notClosedSqlLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.notClosedSqlLineComment();
        });

        test("windowsLineBreaksAreHandledCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.windowsLineBreaksAreHandledCorrectly();
        });

        test("linuxLineBreaksAreHandledCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksAreHandledCorrectly();
        });

        test("linuxLineBreaksAreHandledCorrectly2", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.linuxLineBreaksAreHandledCorrectly2();
        });

        test("macLineBreaksAreHandledCorrectly", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.macLineBreaksAreHandledCorrectly();
        });

        test("stringLiterals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.stringLiterals();
        });

        test("binaryLiterals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.binaryLiterals();
        });

        test("integerLiterals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.integerLiterals();
        });

        test("floatingPointLiterals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.floatingPointLiterals();
        });

        test("dateTimeLiterals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dateTimeLiterals();
        });

        test("weirdTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.weirdTokens();
        });

        test("assertGT", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.assertGT();
        });

        test("assertLT", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.assertLT();
        });

        test("assertGS", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.assertGS();
        });

        test("dateLiteralOffset", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dateLiteralOffset();
        });

        test("timeLiteralOffset", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.timeLiteralOffset();
        });

        test("timestampLiteralOffset", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.timestampLiteralOffset();
        });

        test("minusTokenBetweenTwoNumbers", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.minusTokenBetweenTwoNumbers();
        });

        test("ue", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.ue();
        });

        test("doubleQuotesInDoubleQuotes", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.doubleQuotesInDoubleQuotes();
        });

        test("incompleteTokenDoesNotDamageOtherTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenDoesNotDamageOtherTokens();
        });

        test("incompleteQuoteWithLineBreak", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteQuoteWithLineBreak();
        });

        test("incompleteTokenSmallerEqual", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenSmallerEqual();
        });

        test("incompleteTokenBetweenSmallerEqual", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenBetweenSmallerEqual();
        });

        test("incompleteTokenSmaller", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenSmaller();
        });

        test("incompleteTokenGreater", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenGreater();
        });

        test("incompleteTokenEqual", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenEqual();
        });

        test("incompleteTokenSmallerGreater", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenSmallerGreater();
        });

        test("incompleteTokenBetweenSmallerGreater", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenBetweenSmallerGreater();
        });

        test("incompleteTokenEqualGreater", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenEqualGreater();
        });

        test("incompleteTokenAtSmaller", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenAtSmaller();
        });

        test("incompleteTokenGreaterEqual", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenGreaterEqual();
        });

        test("incompleteTokenBetweenGreaterEqual", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenBetweenGreaterEqual();
        });

        test("incompleteTokenCreateBeforeQuote", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.incompleteTokenCreateBeforeQuote();
        });

        test("scanDivisionCharacterWithoutSpace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterWithoutSpace();
        });

        test("scanDivisionCharacterWithSpaceBefore", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterWithSpaceBefore();
        });

        test("scanDivisionCharacterWithSpaceBeforeAndAfter", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterWithSpaceBeforeAndAfter();
        });

        test("scanDivisionCharacterInTheMiddleOfIdentifier", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterInTheMiddleOfIdentifier();
        });

        test("scanDivisionCharacterAtStartOfIdentifier", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterAtStartOfIdentifier();
        });

        test("scanDivisionCharacterInSourceWithOnlyDivisionCharacter", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterInSourceWithOnlyDivisionCharacter();
        });

        test("scanDivisionCharacterAtEndOfIdentifier", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDivisionCharacterAtEndOfIdentifier();
        });

        test("scanDollarProjectionAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDollarProjectionAsOneToken();
        });

        test("scanDollarExtensionAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDollarExtensionAsOneToken();
        });

        test("scanDollarAnythingAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDollarAnythingAsOneToken();
        });

        test("scanSingleColonAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanSingleColonAsOneToken();
        });

        test("scanDoubleColonAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDoubleColonAsOneToken();
        });

        test("scanDotDotAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDotDotAsOneToken();
        });

        test("scanDotDotAsTwoToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanDotDotAsTwoToken();
        });

        test("scanTwoSeparatedDotsAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanTwoSeparatedDotsAsTwoTokens();
        });

        test("scanEnumIdTokenAsId", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanEnumIdTokenAsId();
        });

        test("scanEnumIdToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanEnumIdToken();
        });

        test("scanPipe", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.scanPipe();
        });

        test("colonScannedAsColonNoneWs", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonScannedAsColonNoneWs();
        });

        test("colonScannedAsColonNoneWsWhenFollowedByQuotedId", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonScannedAsColonNoneWsWhenFollowedByQuotedId();
        });

        test("colonScannedAsColonForTrueAndFalse", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonScannedAsColonForTrueAndFalse();
        });

        test("colonScannedAsColonIfWsIsFollowing", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonScannedAsColonIfWsIsFollowing();
        });

        test("colonScannedAsColonIfCreationOfColonNoneWsIsOff", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonScannedAsColonIfCreationOfColonNoneWsIsOff();
        });

        test("colonWhitespaceAnythingScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonWhitespaceAnythingScannedAsColon();
        });

        test("colonStringLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonStringLiteralScannedAsColon();
        });

        test("colonIntLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonIntLiteralScannedAsColon();
        });

        test("colonRealLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonRealLiteralScannedAsColon();
        });

        test("colonDeclLiteralWithExpScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonDeclLiteralWithExpScannedAsColon();
        });

        test("colonRealLiteralWithExpScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonRealLiteralWithExpScannedAsColon();
        });

        test("colonLongIntLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonLongIntLiteralScannedAsColon();
        });

        test("colonDateLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonDateLiteralScannedAsColon();
        });

        test("colonTimeLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonTimeLiteralScannedAsColon();
        });

        test("colonTimeStampLiteralScannedAsColon", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonTimeStampLiteralScannedAsColon();
        });

        test("colonBinaryLiteralScannedAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonBinaryLiteralScannedAsTwoTokens();
        });

        test("colonColonAnythingScannedAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonColonAnythingScannedAsTwoTokens();
        });

        test("colonColonLiteralAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonColonLiteralAsTwoTokens();
        });

        test("pipeScannedAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.pipeScannedAsOneToken();
        });

        test("pipePipeScannedAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.pipePipeScannedAsTwoTokens();
        });

        test("pipePipeInsideExpresionScannedAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.pipePipeInsideExpresionScannedAsTwoTokens();
        });

        test("singlePipeScannedAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.singlePipeScannedAsOneToken();
        });

        test("pipePipeScannedAsOneTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.pipePipeScannedAsOneTokens();
        });

        test("pipePipeInsideExpressionScannedAsTwoTokens", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.pipePipeInsideExpressionScannedAsTwoTokens();
        });

        test("questionMarkWithSpace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.questionMarkWithSpace();
        });

        test("questionMarkWithoutSpace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.questionMarkWithoutSpace();
        });

        test("quotationMarkWithSpace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.quotationMarkWithSpace();
        });

        test("quotationMarkWithoutSpace", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.quotationMarkWithoutSpace();
        });

        test("noEndlessLoopWithQuestionMark", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.noEndlessLoopWithQuestionMark();
        });

        test("dashArrowScannedAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowScannedAsOneToken();
        });

        test("dashAarrowWithSpaceScannedAsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashAarrowWithSpaceScannedAsOneToken();
        });

        test("escapedQuote", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.escapedQuote();
        });

        test("anyKwTokenBeforeMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenBeforeMultiLineComment();
        });

        test("noAnyKwTokenInsideMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.noAnyKwTokenInsideMultiLineComment();
        });

        test("anyKwTokenAfterAfterMultiLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenAfterAfterMultiLineComment();
        });

        test("anyKwTokenOnlyOnceForQuotedIdentifier",function(assert) {
            var cut=new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenOnlyOnceForQuotedIdentifier();
        });

        test("anyKwTokenQuotedIdentifierNextTokenContainsRestOfQuotedString",function(assert) {
            var cut=new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenQuotedIdentifierNextTokenContainsRestOfQuotedString();
        });

        test("anyKwTokenEndOfQuotedIdentifier",function(assert) {
            var cut=new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenEndOfQuotedIdentifier();
        });

        test("anyKwTokenBeforeSingleLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.anyKwTokenBeforeSingleLineComment();
        });

        test("noAnyKwTokenInsideSingleLineComment", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.noAnyKwTokenInsideSingleLineComment();
        });

        test("lineColumnCorrectForMultiLineStringLiteral", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.lineColumnCorrectForMultiLineStringLiteral();
        });

        test("dashArrowScannedAsDoubleArrowNoneWs", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowScannedAsDoubleArrowNoneWs();
        });

        test("dashArrowWithWsBeforeScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowWithWsBeforeScannedAsDoubleArrow();
        });

        test("dashArrowWithWsAfterScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowWithWsAfterScannedAsDoubleArrow();
        });

        test("dashArrowWithWsBeforeAndAfterScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowWithWsBeforeAndAfterScannedAsDoubleArrow();
        });

        test("dashArrowSourroundedByCommentsScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowSourroundedByCommentsScannedAsDoubleArrow();
        });

        test("dashArrowWithCommentInFrontScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowWithCommentInFrontScannedAsDoubleArrow();
        });

        test("dashArrowFollowedByCommentScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowFollowedByCommentScannedAsDoubleArrow();
        });

        test("dashArrowWithWsEverywhereScannedAsDoubleArrow", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowWithWsEverywhereScannedAsDoubleArrow();
        });

        test("dashArrowAtBeginOfSourceScannedAsDoubleArrowNoneWs", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowAtBeginOfSourceScannedAsDoubleArrowNoneWs();
        });

        test("dashArrowAtEndOfSourceScannedAsDoubleArrowNoneWs", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowAtEndOfSourceScannedAsDoubleArrowNoneWs();
        });

        test("dashArrowScannedAsDoubleArrowNoneWsWhenTriggeringCoCoDirecltyAfter", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dashArrowScannedAsDoubleArrowNoneWsWhenTriggeringCoCoDirecltyAfter();
        });

        test("nbspCharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.nbspCharacters();
        });

        test("VTABCharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.VTABCharacters();
        });

        test("HTABCharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.HTABCharacters();
        });

        test("NEWPAGECharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.NEWPAGECharacters();
        });

        test("NBSPACECharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.NBSPACECharacters();
        });

        test("NEXTLINECharacters", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.NEXTLINECharacters();
        });

        test("commaVisibleInTokenListInCoCoScenario", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.commaVisibleInTokenListInCoCoScenario();
        });

        test("closingBracketVisibleInTokenListInCoCoScenario", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.closingBracketVisibleInTokenListInCoCoScenario();
        });

        test("openingBracketVisibleInTokenListInCoCoScenario", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.openingBracketVisibleInTokenListInCoCoScenario();
        });

        test("semiColonVisibleInTokenListInCoCoScenario", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.semiColonVisibleInTokenListInCoCoScenario();
        });

        test("onlyOneAnyKwTokenBeforeSlash", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.onlyOneAnyKwTokenBeforeSlash();
        });

        test("dotIsSeparateToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.dotIsSeparateToken();
        });

        test("colonIsSeparateToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.colonIsSeparateToken();
        });

        test("endOfMultiLineCommentIsOneToken", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.endOfMultiLineCommentIsOneToken();
        });

        test("singleStarDoesNotThrowException", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.singleStarDoesNotThrowException();
        });

        test("smallerEquals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.smallerEquals();
        });

        test("greaterEquals", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.greaterEquals();
        });

        test("smaller", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.smaller();
        });

        test("greater", function(assert) {
            var cut = new TestsUnitDdlScanner();
            TestsUnitDdlScanner.classSetup();
            cut.setUp();
            cut.greater();
        });

        QUnit.start();
    });
