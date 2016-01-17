/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// base on commit
// e549af5e182e0abecb31fc96b23099a58dc633b6 support Unicode Character NO-BREAK SPACE
define(
    [
        "rndrt/rnd",
        "commonddl/SapDdlConstants",
        "commonddl/AnnotationPayload"
    ], //dependencies
    function(
        rnd,
        SapDdlConstants,
        AnnotationPayload
    ) {
        var Category = rnd.Category;
        var CursorPos = rnd.CursorPos;
        var ErrorState = rnd.ErrorState;
        var Scanner = rnd.Scanner;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        DdlScanner.prototype = Object.create(Scanner.prototype);
        DdlScanner.prototype.doStrictSeparationOfTokensAtPlusMinus = false;
        DdlScanner.prototype.doStrictSeparationOfTokensAtSlash = false;
        DdlScanner.prototype.createDotDotTokens = false;
        DdlScanner.prototype.createEnumIdTokens = false;
        DdlScanner.prototype.createColonFollowedByIdTokens = false;
        DdlScanner.prototype.createPipePipeTokens = false;
        DdlScanner.prototype.createDashArrowNoWsTokens = false;
        DdlScanner.prototype.anyKeyword = 0;
        DdlScanner.prototype.eof = 0;
        DdlScanner.prototype.nl = 0;
        DdlScanner.prototype.comment1 = 0;
        DdlScanner.prototype.comment2 = 0;
        DdlScanner.prototype.dot = 0;
        DdlScanner.prototype.comma = 0;
        DdlScanner.prototype.colon = 0;
        DdlScanner.prototype.colonFollowedById = 0;
        DdlScanner.prototype.lparen = 0;
        DdlScanner.prototype.rparen = 0;
        DdlScanner.prototype.lt = 0;
        DdlScanner.prototype.gt = 0;
        DdlScanner.prototype.lbrack = 0;
        DdlScanner.prototype.rbrack = 0;
        DdlScanner.prototype.lbrace = 0;
        DdlScanner.prototype.rbrace = 0;
        DdlScanner.prototype.stringConst = 0;
        DdlScanner.prototype.binaryConst = 0;
        DdlScanner.prototype.intConst = 0;
        DdlScanner.prototype.longIntConst = 0;
        DdlScanner.prototype.decConst = 0;
        DdlScanner.prototype.realConst = 0;
        DdlScanner.prototype.dateConst = 0;
        DdlScanner.prototype.timeConst = 0;
        DdlScanner.prototype.timestampConst = 0;
        DdlScanner.prototype.at = 0;
        DdlScanner.prototype.pipe = 0;
        DdlScanner.prototype.pipePipe = 0;
        DdlScanner.prototype.star = 0;
        DdlScanner.prototype.plus = 0;
        DdlScanner.prototype.ge = 0;
        DdlScanner.prototype.ne = 0;
        DdlScanner.prototype.dash_arrow = 0;
        DdlScanner.prototype.dash_arrow_no_ws = 0;
        DdlScanner.prototype.colonColon = 0;
        DdlScanner.prototype.sysCmd = 0;
        DdlScanner.prototype.id = 0;
        DdlScanner.prototype.enumId = 0;

        function DdlScanner(byteCode) {
            Scanner.call(this, byteCode);
            this.initializeTokenNumbers();
        }
        DdlScanner.DdlScanner1 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus) {
            var result = new DdlScanner(byteCode);
            result.doStrictSeparationOfTokensAtPlusMinus = doStrictSeparationOfTokensAtPlusMinus;
            return result;
        }
        DdlScanner.DdlScanner2 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash) {
            var result = DdlScanner.DdlScanner1(byteCode, doStrictSeparationOfTokensAtPlusMinus);
            result.doStrictSeparationOfTokensAtSlash = doStrictSeparationOfTokensAtSlash;
            return result;
        }
        DdlScanner.DdlScanner3 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens) {
            var result = DdlScanner.DdlScanner2(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash);
            result.createDotDotTokens = createDotDotTokens;
            return result;
        }
        DdlScanner.DdlScanner4 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens) {
            var result = DdlScanner.DdlScanner3(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens);
            result.createEnumIdTokens = createEnumIdTokens;
            return result;
        }
        DdlScanner.DdlScanner5 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens, createColonFollowedByIdTokens) {
            var result = DdlScanner.DdlScanner4(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens);
            result.createColonFollowedByIdTokens = createColonFollowedByIdTokens;
            return result;
        }
        DdlScanner.DdlScanner6 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens, createColonFollowedByIdTokens, createPipePipeTokens) {
            var result = DdlScanner.DdlScanner5(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens, createColonFollowedByIdTokens);
            result.createPipePipeTokens = createPipePipeTokens;
            return result;
        }
        DdlScanner.DdlScanner7 = function(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens, createColonFollowedByIdTokens, createPipePipeTokens, createDashArrowNoWsTokens) {
            var result = DdlScanner.DdlScanner6(byteCode, doStrictSeparationOfTokensAtPlusMinus, doStrictSeparationOfTokensAtSlash, createDotDotTokens, createEnumIdTokens, createColonFollowedByIdTokens, createPipePipeTokens);
            result.createDashArrowNoWsTokens = createDashArrowNoWsTokens;
            return result;
        }
        DdlScanner.prototype.getIntegerConstantTokenNumber = function() {
            return this.intConst;
        };
        DdlScanner.prototype.getEofTokenNumber = function() {
            return this.eof;
        };
        DdlScanner.prototype.getColonFollowedByIdTokenNumber = function() {
            return this.colonFollowedById;
        };
        DdlScanner.prototype.getColonTokenNumber = function() {
            return this.colon;
        };
        DdlScanner.prototype.getAnyKwTokenNumber = function() {
            return this.anyKeyword;
        };
        DdlScanner.prototype.tok_begin = 0;
        DdlScanner.prototype.tok_end = 0;
        DdlScanner.prototype.column = 0;
        DdlScanner.prototype.line = 0;
        DdlScanner.prototype.inAnnotation = false;
        DdlScanner.prototype.annotationColonFound = false;
        DdlScanner.prototype.annotationFirstOpeningChar = 0;
        DdlScanner.prototype.annotationNestingLevel = 0;
        DdlScanner.prototype.checkNextTokenForLiteral = false;
        DdlScanner.prototype.setInput = function(s, startPos, cursorPos) {
            this.resetInput();
            if (s.length > 0 && s.charAt(s.length - 1) != '\0') {
                s += "\0";
            }
            this.tok_begin = 0;
            this.tok_end = 0;
            this.line = startPos.m_line;
            this.column = startPos.m_column;
            var last_hit_cursor_offset = -1;
            while (this.tok_begin < s.length) {
                var fallThrough = false;
                var tok_txt;
                switch (s.charAt(this.tok_begin)) {
                    case '\r':
                    case '\n':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        var lineBreakLength = this.getLineBreakLength(s, this.tok_begin);
                        this.tok_begin = this.tok_begin + lineBreakLength;
                        this.startNewLine();
                        break;
                    case ' ':
                    case '\u00A0':
                    case '\u000B':
                    case '\u000C':
                    case '\u0085':
                    case '\t':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken(); 
                        }
                        this.tok_begin++;
                        this.column++;
                        break;
                    case '%':
                        // this.tok_end = this.tok_begin + 1;
                        // while (s.charAt(this.tok_end) >= 'A' && s.charAt(this.tok_end) <= 'Z') {
                        //     this.tok_end++;
                        // }
                        // if (s.charAt(this.tok_end) == '(') {
                        //     do {
                        //         this.tok_end++;
                        //     }
                        //     while (s.charAt(this.tok_end) != ')' && s.charAt(this.tok_end) != '\n');
                        //     this.tok_end++;
                        // }
                        // tok_txt = s.substring(this.tok_begin, this.tok_end);
                        // this.m_input.push(new Token(this.sysCmd, tok_txt, Category.CAT_LITERAL, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                        // this.column += this.tok_end - this.tok_begin;
                        // this.tok_begin = this.tok_end;
                    
                        var numId=this.getTokenIndex("%");
                        this.processSingleChar(s,'%',numId,cursorPos);
                        
                        break;
                   /* case '\'':
                            this.processLiteral(s, '\'', this.stringConst, cursorPos); 
                        break;*/
                    case '{':
                        this.processSingleChar(s, '{', this.lbrace, cursorPos);
                        break;
                    case ';':
                        var num1 = this.getTokenIndex(";");
                        this.processSingleCharWithOperator(s, ';', num1, cursorPos, Category.CAT_MAYBE_KEYWORD);
                        break;
                    case '}':
                        this.processSingleChar(s, '}', this.rbrace, cursorPos);
                        break;
                    case ':':
                        this.handleColon(s, cursorPos);
                        break;
                    case ',':
                        this.processSingleChar(s, ',', this.comma, cursorPos);
                        break;
                    case '.':
                        try {
                            if (this.createDotDotTokens && s.charAt(this.tok_begin + 1) == '.') {
                                var dotDotNum = this.getTokenIndex("..");
                                this.m_input.push(new Token(dotDotNum, s.substring(this.tok_begin, this.tok_begin + 2), Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                                this.tok_begin += 2;
                                this.column += 2;
                            } else {
                                this.processSingleChar(s, '.', this.dot, cursorPos);
                            }
                        } catch (e) {
                            this.processSingleChar(s, '.', this.dot, cursorPos);
                        }
                        break;
                    case '@':
                        try {
                            if (s.charAt(this.tok_begin + 1) == '<') {
                                var sub = s.substring(this.tok_begin, this.tok_begin + 2);
                                if (this.isCursor(this.line, this.column, cursorPos)) {
                                    this.addEmptyAnyKeywordToken();
                                }
                                var atLeNum = this.getTokenIndex("@<");
                                var atLeToken = new Token(atLeNum, sub, Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
                                atLeToken.setPayload(new AnnotationPayload());
                                this.resetAnnotationState();
                                this.inAnnotation = true;
                                this.m_input.push(atLeToken);
                                this.tok_begin += 2;
                                this.column += 2;
                            } else {
                                this.processSingleChar(s, '@', this.at, cursorPos);
                            }
                        } catch (e) {
                            this.processSingleChar(s, '@', this.at, cursorPos);
                        }
                        break;
                    case '=':
                        if (s.charAt(this.tok_begin + 1) == '>') {
                            this.handleDashArrow(s, cursorPos);
                        } else {
                            this.processSingleCharWithOperatorInternal(s, '=', this.getTokenIndex("="), cursorPos, Category.CAT_KEYWORD, true);
                        }
                        break;
                    case '<':
                        if (s.charAt(this.tok_begin + 1) == '>') {
                            var sub = s.substring(this.tok_begin, this.tok_begin + 2);
                            if (this.isCursor(this.line, this.column, cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            } else if (this.isCursor(this.line, this.column + 1, cursorPos)) {
                                sub = sub.substring(1);
                                this.addAnyKeywordToken("<");
                            }
                            this.m_input.push(new Token(this.ne, sub, Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else if (s.charAt(this.tok_begin + 1) == '=') {
                            var sub = s.substring(this.tok_begin, this.tok_begin + 2);
                            if (this.isCursor(this.line, this.column, cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            } else if (this.isCursor(this.line, this.column + 1, cursorPos)) {
                                sub = sub.substring(1);
                                this.addAnyKeywordToken("<");
                            }
                            this.m_input.push(new Token(this.ge, sub, Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else {
                            this.processSingleCharSeparateAnyKwToken(s, '<', this.lt, cursorPos);
                        }
                        break;
                    case '>':
                        if (s.charAt(this.tok_begin + 1) == '=') {
                            var sub = s.substring(this.tok_begin, this.tok_begin + 2);
                            if (this.isCursor(this.line, this.column, cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            } else if (this.isCursor(this.line, this.column + 1, cursorPos)) {
                                sub = sub.substring(1);
                                this.addAnyKeywordToken(">");
                            }
                            this.m_input.push(new Token(this.ge, sub, Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else {
                            this.processSingleCharSeparateAnyKwToken(s, '>', this.gt, cursorPos);
                        }
                        break;
                    case '[':
                        this.processSingleChar(s, '[', this.lbrack, cursorPos);
                        break;
                    case ']':
                        this.processSingleChar(s, ']', this.rbrack, cursorPos);
                        break;
                    case '|':
                        var nextChar = 0;
                        try {
                            nextChar = s.charAt(this.tok_begin + 1);
                        } catch (e) {}
                        if (this.createPipePipeTokens && nextChar == '|') {
                            this.m_input.push(new Token(this.pipePipe, s.substring(this.tok_begin, this.tok_begin + 2), Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else {
                            this.processSingleChar(s, '|', this.pipe, cursorPos);
                        }
                        break;
                    case '*':

                        if (s.charAt(this.tok_begin + 1) == '*') {
                            var sub = s.substring(this.tok_begin, this.tok_begin + 2);
                            if (this.isCursor(this.line, this.column, cursorPos)) {
                                this.addEmptyAnyKeywordToken();
                            } else if (this.isCursor(this.line, this.column + 1, cursorPos)) {
                                sub = sub.substring(1);
                                this.addAnyKeywordToken("*");
                            }
                            var num1 = this.getTokenIndex("**");
                            this.m_input.push(new Token(num1, sub, Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else {
                            this.processSingleChar(s, '*', this.star, cursorPos);
                        }

                        break;
                    case '-': 
                        if (this.handleSqlLineComment(s)) {
                            break;
                        }
                        var nextNumberLiteral = [""];
                        var endNumberIndex = [0];
                        var numConst = [0];
                        if (this.doStrictSeparationOfTokensAtPlusMinus == false && this.previousIsNumber() == false && this.nextIsNumber(s, nextNumberLiteral, endNumberIndex, numConst)) {
                            this.m_input.push(new Token(numConst[0], "-" + nextNumberLiteral[0], Category.CAT_LITERAL, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.column += endNumberIndex[0] - this.tok_begin;
                            this.tok_begin = endNumberIndex[0];
                        } else {
                            var minusNumId = this.getTokenIndex("-");
                            this.processSingleCharWithOperator(s, '-', minusNumId, cursorPos, Category.CAT_OPERATOR);
                        }
                        break;
                    case '+':
                        nextNumberLiteral = [""];
                        endNumberIndex = [0];
                        numConst = [0];
                        if (this.doStrictSeparationOfTokensAtPlusMinus == false && this.previousIsNumber() == false && this.nextIsNumber(s, nextNumberLiteral, endNumberIndex, numConst)) {
                            if (nextNumberLiteral[0].length == 0) {
                                this.m_input.push(new Token(this.plus, "+", Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            } else {
                                this.m_input.push(new Token(numConst[0], "+" + nextNumberLiteral[0], Category.CAT_LITERAL, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            }
                            this.column += endNumberIndex[0] - this.tok_begin;
                            this.tok_begin = endNumberIndex[0];
                        } else {
                            this.processSingleChar(s, '+', this.plus, cursorPos);
                        }
                        break;
                    case '(':
                        this.processSingleChar(s, '(', this.lparen, cursorPos);
                        break;
                    case '!':
                        if (s.charAt(this.tok_begin + 1) == '=') {
                            this.m_input.push(new Token(this.getTokenIndex("!="), s.substring(this.tok_begin, this.tok_begin + 2), Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin += 2;
                            this.column += 2;
                        } else if (s.charAt(this.tok_begin + 1) == '{') {
                            this.handleLBracket(s);
                        } else {
                            this.m_input.push(new Token(this.getTokenIndex("!"), s.substring(this.tok_begin, this.tok_begin + 1), Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                            this.tok_begin++;
                            this.column++;
                        }
                        break;
                    case ')':
                        var num;
                        var cat;
                        var lexem;
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            num = this.anyKeyword;
                            cat = Category.CAT_INCOMPLETE;
                            lexem = "";
                        } else {
                            num = this.rparen;
                            cat = Category.CAT_OPERATOR;
                            lexem = ")";
                        }
                        this.m_input.push(new Token(num, lexem, cat, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                        this.column++;
                        this.tok_begin++;
                        break;
                    case '\0':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        this.tok_begin++;
                        break;
                    case '"':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        tok_txt = this.consumeIdentifierStartingWithQuotationMark(s, cursorPos);
                        break;
                    case '\'':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        tok_txt = this.consumeIdentifierStartingWithSingleQuotationMark(s, cursorPos);
                        break;
                    case '/':
                        if (this.isCursor(this.line, this.column, cursorPos)) {
                            this.addEmptyAnyKeywordToken();
                        }
                        switch (s.charAt(this.tok_begin + 1)) {
                            case '/':
                                this.consumeCompleteLine(s);
                                break;
                            case '*':
                                this.tok_end = this.tok_begin + 2;
                                var columnPos = this.column + 2;
                                var linePos = this.line;
                                try {
                                    while (true) {
                                        if (s.charAt(this.tok_end) == '*' && s.charAt(this.tok_end + 1) == '/') {
                                            this.tok_end = this.tok_end + 2;
                                            columnPos += 2;
                                            break;
                                        } else if (this.isNL(s.charAt(this.tok_end))) {
                                            var lineBreakLength = this.getLineBreakLength(s, this.tok_end);
                                            this.tok_end = this.tok_end + lineBreakLength;
                                            linePos++;
                                            columnPos = 1;
                                        } else if (this.tok_end >= s.length) {
                                            break;
                                        } else {
                                            this.tok_end++;
                                            columnPos++;
                                        }
                                        if (this.tok_end >= s.length) {
                                            this.tok_end = s.length - 1;
                                            break;
                                        }
                                    }
                                } catch (e) {
                                    this.tok_end = s.length - 1;
                                }
                                tok_txt = s.substring(this.tok_begin, this.tok_end);
                                this.m_input.push(new Token(this.comment1, tok_txt, Category.CAT_COMMENT, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                                this.column = columnPos;
                                this.line = linePos;
                                this.tok_begin = this.tok_end;
                                break;
                            default:
                                fallThrough = true;
                        }
                        if (fallThrough == false) {
                            break;
                        }
                        if (this.doStrictSeparationOfTokensAtSlash) {
                            this.handleSlash(s);
                            break;
                        }
                    default:
                        if (this.handleSqlLineComment(s)) {
                            break;
                        }
                        if (this.handleHexLiteral(s)) {
                            break;
                        }
                        if (this.handleDateConstLiteral(s)) {
                            break;
                        }
                        if (this.handleTimeConstLiteral(s)) {
                            break;
                        }
                        if (this.handleTimestampConstLiteral(s)) {
                            break;
                        }
                        this.tok_end = this.tok_begin;
                        var tok_col = this.column;
                        var hit_cursor = false;
                        while (!this.isWS(s.charAt(this.tok_end)) && !this.isPunctation(s, this.tok_end) && !(s.charAt(this.tok_end) == '{') && !(s.charAt(this.tok_end) == '}') && !(s.charAt(this.tok_end) == '\'') && !this.isLineComment(s, this.tok_end) && !(s.charAt(this.tok_end) == ';') && !(s.charAt(this.tok_end) == '=')) {
                            if (this.isCursor(this.line, tok_col, cursorPos) && this.tok_end != last_hit_cursor_offset) {
                                hit_cursor = true;
                                last_hit_cursor_offset = this.tok_end;
                                break;
                            }
                            if (this.doStrictSeparationOfTokensAtSlash && s.charAt(this.tok_end) == '/') {
                                break;
                            }
                            this.tok_end++;
                            tok_col++;
                            if (this.isCursor(this.line, tok_col, cursorPos) && this.tok_end != last_hit_cursor_offset) {
                                hit_cursor = true;
                                last_hit_cursor_offset = this.tok_end;
                                break;
                            }
                        }
                        tok_txt = s.substring(this.tok_begin, this.tok_end);
                        var num;
                        var cat;
                        num = this.getTokenIndex(tok_txt.toLowerCase());
                        if (num == -1) {
                            var it = this.tok_begin;
                            var isLongInt = false;
                            var isDec = false;
                            var isReal = false;
                            while (it != this.tok_end && (this.isDigitWithE(s.charAt(it), s, it) || this.isDotInNumberLiteral(s, it) || s.charAt(it) == 'e' || s.charAt(it) == 'E' || s.charAt(it) == '-' || s.charAt(it) == '+' || (it == this.tok_end - 1 && (s.charAt(it) == 'L' || s.charAt(it) == 'l' || s.charAt(it) == 'm' || s.charAt(it) == 'M')))) {
                                if (rnd.Utils.stringEqualsIgnoreCase(tok_txt, "l") || rnd.Utils.stringEqualsIgnoreCase(tok_txt, "m")) {
                                    break;
                                }
                                if (s.charAt(it) == 'e' || s.charAt(it) == 'E') {
                                    if (this.isDigitWithE(s.charAt(it), s, it) == false) {
                                        break;
                                    }
                                }
                                it++;
                                if (s.charAt(it) == 'e' || s.charAt(it) == 'E') {
                                    if (this.isDigitWithE(s.charAt(it), s, it) == false) {
                                        break;
                                    }
                                    isReal = true;
                                }
                                if (s.charAt(it) == 'L' || s.charAt(it) == 'l') {
                                    isLongInt = true;
                                    isReal = false;
                                }
                                if (s.charAt(it) == 'm' || s.charAt(it) == 'M') {
                                    isDec = true;
                                    isReal = false;
                                }
                                if (this.isDotInNumberLiteral(s, it)) {
                                    isReal = true;
                                }
                            }
                            if (it == this.tok_end) {
                                if (isLongInt) {
                                    num = this.longIntConst;
                                } else if (isDec) {
                                    num = this.decConst;
                                } else if (isReal) {
                                    num = this.realConst;
                                } else {
                                    num = this.intConst;
                                }
                                cat = Category.CAT_LITERAL;
                            } else {
                                if (this.createEnumIdTokens && rnd.Utils.stringStartsWith(tok_txt, "#")) {
                                    num = this.enumId;
                                } else {
                                    num = this.id;
                                }
                                cat = Category.CAT_IDENTIFIER;
                            }
                        } else {
                            cat = Category.CAT_MAYBE_KEYWORD;
                        }
                        if (hit_cursor) {
                            num = this.anyKeyword;
                            cat = Category.CAT_INCOMPLETE;
                            last_hit_cursor_offset = this.tok_end;
                        }
                        if (this.checkNextTokenForLiteral) {
                            if (cat == Category.CAT_IDENTIFIER) {
                                if (rnd.Utils.stringEqualsIgnoreCase("true", tok_txt) || rnd.Utils.stringEqualsIgnoreCase("false", tok_txt)) {
                                    this.changePreviousTokenToColonToken();
                                }
                            }
                            this.checkNextTokenForLiteral = false;
                        }
                        var t = new Token(num, tok_txt, cat, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
                        if (this.inAnnotation) {
                            var last = this.getPreviousTokenIgnoringComments(this.m_input.length);
                            if (this.annotationColonFound) {
                                if (":" === last.m_lexem) {
                                    t.setPayload(new AnnotationPayload());
                                } else if (this.annotationNestingLevel > 0) {
                                    t.setPayload(new AnnotationPayload());
                                }
                            } else {
                                var previousChar = s.charAt(t.m_offset - 1);
                                if ("@" === last.m_lexem && this.isWS(previousChar) == false) {
                                    t.setPayload(new AnnotationPayload());
                                } else if (previousChar == '.') {
                                    t.setPayload(new AnnotationPayload());
                                } else if (previousChar == '<') {
                                    if ("@<" === last.m_lexem) {
                                        t.setPayload(new AnnotationPayload());
                                    }
                                }
                            }
                            if (t.getPayload() == null) {
                                this.resetAnnotationState();
                            }
                        }
                        this.m_input.push(t);
                        this.column += this.tok_end - this.tok_begin;
                        this.tok_begin = this.tok_end;
                        break;
                }
            }
            this.m_input.push(new Token(this.eof, SapDdlConstants.EOF, Category.CAT_WS, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
            this.m_state.m_input_pos = 0;
        };
        DdlScanner.prototype.handleDashArrow = function(s, cursorPos) {
            var dashArrow = "=>";
            var lexem = s.substring(this.tok_begin, this.tok_begin + dashArrow.length);
            var tokenNumber = this.dash_arrow;
            if (this.createDashArrowNoWsTokens) {
                try {
                    var previous = s.charAt(this.tok_begin - 1);
                    var next = s.charAt(this.tok_begin + 2);
                    if (!this.isWS(previous)) {
                        if (!this.isWS(next) || this.isCursor(this.line, this.column + dashArrow.length, cursorPos) || '\0' == next) {
                            tokenNumber = this.dash_arrow_no_ws;
                        }
                    }
                } catch (e) {
                    tokenNumber = this.dash_arrow_no_ws;
                }
            }
            if (this.isCursor(this.line, this.column, cursorPos)) {
                this.addEmptyAnyKeywordToken();
            }
            this.m_input.push(new Token(tokenNumber, lexem,
                Category.CAT_OPERATOR, this.tok_begin, this.line,
                this.column, false, ErrorState.Correct, 0));
            this.tok_begin += dashArrow.length;
            this.column += dashArrow.length;
        };
        DdlScanner.prototype.addEmptyAnyKeywordToken = function() {
            this.addAnyKeywordToken("");
        };
        DdlScanner.prototype.addAnyKeywordToken = function(lexem) {
            var t = new Token(this.anyKeyword, lexem, Category.CAT_INCOMPLETE, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
            this.m_input.push(t);
        };
        DdlScanner.prototype.handleColon = function(s, cursorPos) {
            var nextChar = 0;
            try {
                nextChar = s.charAt(this.tok_begin + 1);
                if (nextChar == ':') {
                    this.m_input.push(new Token(this.colonColon, s.substring(this.tok_begin, this.tok_begin + 2), Category.CAT_OPERATOR, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
                    this.tok_begin += 2;
                    this.column += 2;
                } else if (this.createColonFollowedByIdTokens && rnd.Utils.isLetter(nextChar)) {
                    this.checkNextTokenForLiteral = true;
                    this.processSingleChar(s, ':', this.colonFollowedById, cursorPos);
                    return;
                } else {
                    this.processSingleChar(s, ':', this.colon, cursorPos);
                }
            } catch (e) {
                this.processSingleChar(s, ':', this.colon, cursorPos);
            }
        };
        DdlScanner.prototype.initializeTokenNumbers = function() {
            this.anyKeyword = this.getTokenIndex(SapDdlConstants.ANY_KW);
            this.eof = this.getTokenIndex(SapDdlConstants.EOF);
            this.nl = this.getTokenIndex(SapDdlConstants.NL);
            this.comment1 = this.getTokenIndex(SapDdlConstants.COMMENT1);
            this.comment2 = this.getTokenIndex(SapDdlConstants.COMMENT2);
            this.dot = this.getTokenIndex(SapDdlConstants.DOT);
            this.comma = this.getTokenIndex(SapDdlConstants.COMMA);
            this.colon = this.getTokenIndex(SapDdlConstants.COLON);
            this.colonFollowedById = this.getTokenIndex(SapDdlConstants.COLON_FOLLOWED_BY_ID);
            this.pipePipe = this.getTokenIndex(SapDdlConstants.PIPE_PIPE);
            this.lparen = this.getTokenIndex(SapDdlConstants.LPAREN);
            this.rparen = this.getTokenIndex(SapDdlConstants.RPAREN);
            this.lt = this.getTokenIndex(SapDdlConstants.LT);
            this.gt = this.getTokenIndex(SapDdlConstants.GT);
            this.lbrack = this.getTokenIndex(SapDdlConstants.LBRACK);
            this.rbrack = this.getTokenIndex(SapDdlConstants.RBRACK);
            this.lbrace = this.getTokenIndex(SapDdlConstants.LBRACE);
            this.rbrace = this.getTokenIndex(SapDdlConstants.RBRACE);
            this.stringConst = this.getTokenIndex(SapDdlConstants.STRING_CONST);
            this.binaryConst = this.getTokenIndex(SapDdlConstants.BINARY_CONST);
            this.intConst = this.getTokenIndex(SapDdlConstants.INT_CONST);
            this.longIntConst = this.getTokenIndex(SapDdlConstants.LONG_INT_CONST);
            this.decConst = this.getTokenIndex(SapDdlConstants.DEC_CONST);
            this.realConst = this.getTokenIndex(SapDdlConstants.REAL_CONST);
            this.dateConst = this.getTokenIndex(SapDdlConstants.DATE_CONST);
            this.timeConst = this.getTokenIndex(SapDdlConstants.TIME_CONST);
            this.timestampConst = this.getTokenIndex(SapDdlConstants.TIMESTAMP_CONST);
            this.at = this.getTokenIndex(SapDdlConstants.AT);
            this.star = this.getTokenIndex(SapDdlConstants.STAR);
            this.pipe = this.getTokenIndex(SapDdlConstants.PIPE);
            this.plus = this.getTokenIndex(SapDdlConstants.PLUS);
            this.ge = this.getTokenIndex(SapDdlConstants.GE);
            this.ne = this.getTokenIndex(SapDdlConstants.NE);
            this.colonColon = this.getTokenIndex(SapDdlConstants.COLONCOLON);
            this.id = this.getTokenIndex(SapDdlConstants.ID);
            this.enumId = this.getTokenIndex(SapDdlConstants.ENUM_ID);
            this.dash_arrow = this.getTokenIndex(SapDdlConstants.DASH_ARROW);
            this.dash_arrow_no_ws = this.getTokenIndex(SapDdlConstants.DASH_ARROW_NONE_WS);
        };
        DdlScanner.prototype.handleSlash = function(s) {
            this.tok_end = this.tok_begin;
            this.tok_end++;
            var tok_txt = s.substring(this.tok_begin, this.tok_end);
            var num = this.getTokenIndex(tok_txt.toLowerCase());
            var cat = Category.CAT_MAYBE_KEYWORD;
            if (num == -1) {
                cat = Category.CAT_IDENTIFIER;
            }
            var t = new Token(num, tok_txt, cat, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
            this.m_input.push(t);
            this.column += this.tok_end - this.tok_begin;
            this.tok_begin = this.tok_end;
        };
        DdlScanner.prototype.handleTimestampConstLiteral = function(s) {
            var start = this.tok_begin;
            var startCol = this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start, start + 10), "timestamp'")) {
                    start += 10;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    } catch (e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt = s.substring(this.tok_begin, start);
                    this.m_input.push(new Token(this.timestampConst, tok_txt, Category.CAT_LITERAL, this.tok_begin, this.line, startCol, false, ErrorState.Correct, 0));
                    this.column += start - this.tok_begin;
                    this.tok_begin = start;
                    return true;
                }
            } catch (e) {}
            return false;
        };
        DdlScanner.prototype.handleTimeConstLiteral = function(s) {
            var start = this.tok_begin;
            var startCol = this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start, start + 5), "time'")) {
                    start += 5;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    } catch (e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt = s.substring(this.tok_begin, start);
                    this.m_input.push(new Token(this.timeConst, tok_txt, Category.CAT_LITERAL, this.tok_begin, this.line, startCol, false, ErrorState.Correct, 0));
                    this.column += start - this.tok_begin;
                    this.tok_begin = start;
                    return true;
                }
            } catch (e) {}
            return false;
        };
        DdlScanner.prototype.handleDateConstLiteral = function(s) {
            var start = this.tok_begin;
            var startCol = this.column;
            try {
                if (rnd.Utils.stringEqualsIgnoreCase(s.substring(start, start + 5), "date'")) {
                    start += 5;
                    try {
                        while (true) {
                            if (s.charAt(start) == '\'') {
                                start++;
                                break;
                            }
                            start++;
                            if (start >= s.length) {
                                start--;
                                break;
                            }
                        }
                    } catch (e) {
                        start--;
                    }
                    this.changePreviousTokenToColonToken();
                    var tok_txt = s.substring(this.tok_begin, start);
                    this.m_input.push(new Token(this.dateConst, tok_txt, Category.CAT_LITERAL, this.tok_begin, this.line, startCol, false, ErrorState.Correct, 0));
                    this.column += start - this.tok_begin;
                    this.tok_begin = start;
                    return true;
                }
            } catch (e) {}
            return false;
        };
        DdlScanner.prototype.changePreviousTokenToColonToken = function() {
            if (this.checkNextTokenForLiteral) {
                var lastToken = this.m_input[this.m_input.length - 1];
                lastToken.m_num = this.colon;
            }
        };
        DdlScanner.prototype.nextIsNumber = function(source, retNumberLiteral, retEndIndex, retNum) {
            try {
                var i = this.tok_begin + 1;
                while (this.isNL(source.charAt(i))) {
                    i++;
                }
                var before = i;
                while (!this.isWS(source.charAt(i)) && !this.isPunctation(source, i) && !(source.charAt(i) == '{') && !(source.charAt(i) == '}') && !(source.charAt(i) == '\'') && !this.isLineComment(source, i) && !(source.charAt(i) == ';') && !(source.charAt(i) == '=')) {
                    i++;
                }
                var next = source.substring(before, i);
                var isNumber = true;
                for (var q = 0; q < next.length; q++) {
                    var c = next.charAt(q);
                    if (c == '.') {
                        retNum[0] = this.realConst;
                        continue;
                    }
                    if (this.isDigitWithE(c, next, q) == false) {
                        if (q == next.length - 1 && (c == 'L' || c == 'l')) {
                            retNum[0] = this.longIntConst;
                            continue;
                        }
                        if (q == next.length - 1 && (c == 'm' || c == 'M')) {
                            retNum[0] = this.decConst;
                            continue;
                        }
                        isNumber = false;
                        break;
                    }
                    if (c == 'e') {
                        retNum[0] = this.realConst;
                    }
                }
                if (isNumber) {
                    retNumberLiteral[0] = next;
                    retEndIndex[0] = i;
                    if (retNum[0] == 0) {
                        retNum[0] = this.intConst;
                    }
                    return true;
                }
            } catch (e) {}
            return false;
        };
        DdlScanner.prototype.previousIsNumber = function() {
            var size = this.m_input.length;
            if (size > 0) {
                var last = this.m_input[size - 1];
                if (this.isNumber(last)) {
                    return true;
                }
            }
            return false;
        };
        DdlScanner.prototype.isNumber = function(t) {
            if (t != null && t.m_num == this.intConst) {
                return true;
            }
            if (t != null && t.m_num == this.longIntConst) {
                return true;
            }
            if (t != null && t.m_num == this.decConst) {
                return true;
            }
            if (t != null && t.m_num == this.realConst) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.startNewLine = function() {
            this.line++;
            this.column = 1;
        };
        DdlScanner.prototype.getLineBreakLength = function(s, lineBreakPosition) {
            var lineBreakLength = 0;
            if (s.charAt(lineBreakPosition) == '\r' && s.charAt(lineBreakPosition + 1) == '\n') {
                lineBreakLength = 2;
            } else if (s.charAt(lineBreakPosition) == '\r' && s.charAt(lineBreakPosition + 1) != '\n') {
                lineBreakLength = 1;
            } else if (lineBreakPosition > 0 && s.charAt(lineBreakPosition) == '\n' && s.charAt(lineBreakPosition - 1) != '\r') {
                lineBreakLength = 1;
            } else if (lineBreakPosition == 0 && s.charAt(lineBreakPosition) == '\n') {
                lineBreakLength = 1;
            } else if (s.charAt(lineBreakPosition) == '\0') {
                lineBreakLength = 1;
            }
            return lineBreakLength;
        };
        DdlScanner.prototype.resetAnnotationState = function() {
            this.inAnnotation = false;
            this.annotationColonFound = false;
            this.annotationFirstOpeningChar = 0;
            this.annotationNestingLevel = 0;
        };
        DdlScanner.prototype.isDotInNumberLiteral = function(s, position) {
            if (position == 0) {
                return false;
            }
            try {
                if (this.isDigit(s.charAt(position - 1)) && s.charAt(position) == '.' && this.isDigit(s.charAt(position + 1))) {
                    return true;
                }
            } catch (e) {
                return false;
            }
            return false;
        };
        DdlScanner.prototype.consumeIdentifierStartingWithQuotationMark = function(s, cursorPos) {
            var tok_txt;
            var start = this.tok_begin;
            var startColumn = this.column;
            var hitCursor = false;
            var errorState = ErrorState.Correct;
            try {
                while (true) {
                    this.tok_begin++;
                    this.column++;
                    if (this.isCursor(this.line, this.column, cursorPos)) {
                        hitCursor = true;
                        break;
                    }
                    if (this.tok_begin >= s.length) {
                        this.tok_begin--;
                        this.column--;
                        break;
                    }
                    var c = s.charAt(this.tok_begin);
                    if (c == '\r' || c == '\n') {
                        errorState = ErrorState.Erroneous;
                        break;
                    }
                    if (s.charAt(this.tok_begin) == '"') {
                        this.tok_begin++;
                        this.column++;
                        try {
                            if (s.charAt(this.tok_begin) == '"') {
                                continue;
                            }
                        } catch (e) {}
                        break;
                    }
                }
                if (this.isCursor(this.line, this.column, cursorPos)) {
                    hitCursor = true;
                }
            } catch (e) {
                this.tok_begin--;
                this.column--;
            }
            tok_txt = s.substring(start, this.tok_begin);
            if (hitCursor) {
                this.m_input.push(new Token(this.anyKeyword, tok_txt, Category.CAT_INCOMPLETE, start, this.line, startColumn, false, ErrorState.Correct, 0));
            } else {
                this.m_input.push(new Token(this.id, tok_txt, Category.CAT_IDENTIFIER, start, this.line, startColumn, false, errorState, 0));
            }
            return tok_txt;
        };
        DdlScanner.prototype.consumeIdentifierStartingWithSingleQuotationMark = function(s, cursorPos) {
            var tok_txt;
            var start = this.tok_begin;
            var startColumn = this.column;
            var hitCursor = false;
            var errorState = ErrorState.Correct;
            try {
                while (true) {
                    this.tok_begin++;
                    this.column++;
                    if (this.isCursor(this.line, this.column, cursorPos)) {
                        hitCursor = true;
                        break;
                    }
                    if (this.tok_begin >= s.length) {
                        this.tok_begin--;
                        this.column--;
                        break;
                    }
                    var c = s.charAt(this.tok_begin);
                    if (c == '\r' || c == '\n') {
                        errorState = ErrorState.Erroneous;
                        break;
                    }
                    if (s.charAt(this.tok_begin) == '\'') {
                        this.tok_begin++;
                        this.column++;
                        try {
                            if (s.charAt(this.tok_begin) == '\'') {
                                continue;
                            }
                        } catch (e) {}
                        break;
                    }
                }
                if (this.isCursor(this.line, this.column, cursorPos)) {
                    hitCursor = true;
                }
            } catch (e) {
                this.tok_begin--;
                this.column--;
            }
            tok_txt = s.substring(start, this.tok_begin);
            if (hitCursor) {
                this.m_input.push(new Token(this.anyKeyword, tok_txt, Category.CAT_INCOMPLETE, start, this.line, startColumn, false, ErrorState.Correct, 0));
            } else {
                this.m_input.push(new Token(this.id, tok_txt, Category.CAT_IDENTIFIER, start, this.line, startColumn, false, errorState, 0));
            }
            return tok_txt;
        };
        DdlScanner.prototype.isLineComment = function(s, position) {
            return ((s.charAt(position) == '-' && s.charAt(position + 1) == '-'));
        };
        DdlScanner.prototype.handleSqlLineComment = function(s) {
            if (this.isLineComment(s, this.tok_begin)) {
                this.consumeCompleteLine(s);
                return true;
            }
            return false;
        };
        DdlScanner.prototype.consumeCompleteLine = function(s) {
            this.tok_end = this.tok_begin;
            while (!this.isNL(s.charAt(this.tok_end))) {
                this.tok_end++;
            }
            var lineBreakPosition = this.tok_end;
            var lineBreakLength = this.getLineBreakLength(s, lineBreakPosition);
            var tok_txt = s.substring(this.tok_begin, this.tok_end);
            this.m_input.push(new Token(this.comment2, tok_txt, Category.CAT_COMMENT, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0));
            this.tok_end = this.tok_end + lineBreakLength;
            this.startNewLine();
            this.tok_begin = this.tok_end;
        };
        DdlScanner.prototype.handleHexLiteral = function(s) {
            var start = this.tok_begin;
            var startCol = this.column;
            if ((s.charAt(this.tok_begin) == 'x' || s.charAt(this.tok_begin) == 'X') && s.charAt(this.tok_begin + 1) == '\'') {
                try {
                    this.tok_begin++;
                    this.column++;
                    do {
                        this.tok_begin++;
                        this.column++;
                    }
                    while (s.charAt(this.tok_begin) != '\'' && !this.isPunctation(s, this.tok_begin) && !this.isWS(s.charAt(this.tok_begin)));
                    if (!this.isWS(s.charAt(this.tok_begin))) {
                        this.tok_begin++;
                        this.column++;
                    }
                } catch (e) {
                    this.tok_begin--;
                    this.column--;
                }
                this.changePreviousTokenToColonToken();
                var tok_txt = s.substring(start, this.tok_begin);
                this.m_input.push(new Token(this.binaryConst, tok_txt, Category.CAT_LITERAL, start, this.line, startCol, false, ErrorState.Correct, 0));
                return true;
            }
            return false;
        };
        DdlScanner.prototype.processSingleCharSeparateAnyKwToken = function(s, c, token_num, cursorPos) {
            this.processSingleCharWithOperatorInternal(s, c, token_num, cursorPos, Category.CAT_OPERATOR, true);
        };
        DdlScanner.prototype.processSingleChar = function(s, c, token_num, cursorPos) {
            this.processSingleCharWithOperatorInternal(s, c, token_num, cursorPos, Category.CAT_OPERATOR, false);
        };
        DdlScanner.prototype.processSingleCharWithOperator = function(s, c, token_num, cursorPos, category) {
            this.processSingleCharWithOperatorInternal(s, c, token_num, cursorPos, category, false);
        };
        DdlScanner.prototype.processSingleCharWithOperatorInternal = function(s, c, token_num, cursorPos, category, separateTokenWithEmptyLexemForAnyKw) {
            if (s.charAt(this.tok_begin) == c) {
                if (this.isCursor(this.line, this.column, cursorPos)) {
                    var sub = s.substring(this.tok_begin, this.tok_begin + 1);
                    if ("}" === sub || "," === sub || "{" === sub || separateTokenWithEmptyLexemForAnyKw) {
                        sub = "";
                    }
                    var t = new Token(this.anyKeyword, sub, Category.CAT_INCOMPLETE, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
                    this.handleAnnotationSingleChar(c, t);
                    this.m_input.push(t);
                    if (separateTokenWithEmptyLexemForAnyKw) {
                        t = new Token(token_num, s.substring(this.tok_begin, this.tok_begin + 1), category, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
                        this.handleAnnotationSingleChar(c, t);
                        this.m_input.push(t);
                    }
                } else {
                    var t = new Token(token_num, s.substring(this.tok_begin, this.tok_begin + 1), category, this.tok_begin, this.line, this.column, false, ErrorState.Correct, 0);
                    this.handleAnnotationSingleChar(c, t);
                    this.m_input.push(t);
                }
                this.tok_begin++;
                this.column++;
            }
        };
        DdlScanner.prototype.handleAnnotationSingleChar = function(c, t) {
            if (c == '@') {
                t.setPayload(new AnnotationPayload());
                this.resetAnnotationState();
                this.inAnnotation = true;
            }
            if (this.inAnnotation && c == ':') {
                t.setPayload(new AnnotationPayload());
                this.annotationColonFound = true;
            }
            if (this.inAnnotation && this.annotationColonFound == false && c == '.') {
                t.setPayload(new AnnotationPayload());
            }
            if (this.inAnnotation && this.annotationColonFound && c == '{') {
                if (this.annotationFirstOpeningChar == 0) {
                    this.annotationFirstOpeningChar = c;
                    this.annotationNestingLevel++;
                } else if (this.annotationFirstOpeningChar == '{') {
                    this.annotationNestingLevel++;
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == '}' && this.annotationFirstOpeningChar == '{') {
                this.annotationNestingLevel--;
                t.setPayload(new AnnotationPayload());
                if (this.annotationNestingLevel == 0) {
                    this.resetAnnotationState();
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == '[') {
                if (this.annotationFirstOpeningChar == 0) {
                    this.annotationFirstOpeningChar = c;
                    this.annotationNestingLevel++;
                } else if (this.annotationFirstOpeningChar == '[') {
                    this.annotationNestingLevel++;
                }
            }
            if (this.inAnnotation && this.annotationColonFound && c == ']' && this.annotationFirstOpeningChar == '[') {
                this.annotationNestingLevel--;
                t.setPayload(new AnnotationPayload());
                if (this.annotationNestingLevel == 0) {
                    this.resetAnnotationState();
                }
            }
            if (this.inAnnotation && this.m_input.length > 0) {
                var last = this.getPreviousTokenIgnoringComments(this.m_input.length);
                if (last != null) {
                    if (":" === last.m_lexem) {
                        t.setPayload(new AnnotationPayload());
                    } else if ("<" === t.m_lexem && "@" === last.m_lexem) {
                        t.setPayload(new AnnotationPayload());
                    }
                }
            }
            if (this.inAnnotation && this.annotationNestingLevel > 0) {
                t.setPayload(new AnnotationPayload());
            }
        };
        DdlScanner.prototype.processLiteral = function(s, delimeter, nUM_SLITERAL, cursorPos) {
            if (s.charAt(this.tok_begin) == delimeter) {
                var lColumn = this.column;
                this.tok_end = this.tok_begin;
                if (this.isCursor(this.line, lColumn, cursorPos)) {
                    var tok_txt = s.substring(this.tok_begin, this.tok_end);
                    this.addAnyKeywordToken(tok_txt);
                }
                var startLine = this.line;
                var startColumn = this.column;
                for (;;) {
                    this.tok_end++;
                    lColumn++;
                    if (this.isCursor(this.line, lColumn, cursorPos)) {
                        var tok_txt = s.substring(this.tok_begin, this.tok_end);
                        this.addAnyKeywordToken(tok_txt);
                    }
                    if (s.charAt(this.tok_end) == delimeter && this.isNotEscaped(s)) {
                        this.tok_end++;
                        lColumn++;
                        if (s.charAt(this.tok_end) != delimeter) {
                            if (this.isCursor(this.line, lColumn - 1, cursorPos)) {
                                var tok_txt = s.substring(this.tok_begin, this.tok_end - 1);
                                this.addAnyKeywordToken(tok_txt);
                            }
                            var tok_txt = s.substring(this.tok_begin, this.tok_end);
                            var t = new Token(nUM_SLITERAL, tok_txt, Category.CAT_LITERAL, this.tok_begin, startLine, startColumn, false, ErrorState.Correct, 0);
                            this.handleAnnotationSingleChar('a', t);
                            this.m_input.push(t);
                            this.column = lColumn;
                            this.tok_begin = this.tok_end;
                            return;
                        }
                    }
                    switch (s.charAt(this.tok_end)) {
                        case '\n':
                            this.line++;
                            lColumn = 0;
                            break;
                        case '\0':
                            var tok_txt = s.substring(this.tok_begin, this.tok_end);
                            var t = new Token(nUM_SLITERAL, tok_txt, Category.CAT_LITERAL, this.tok_begin, startLine, startColumn, false, ErrorState.Correct, 0);
                            this.handleAnnotationSingleChar('a', t);
                            this.m_input.push(t);
                            this.column = lColumn;
                            this.tok_begin = this.tok_end;
                            return;
                        default:
                            break;
                    }
                }
            }
        };
        DdlScanner.prototype.isNotEscaped = function(s) {
            if (s.charAt(this.tok_end - 1) == '\\') {
                if (s.charAt(this.tok_end - 2) == '\\') {
                    return true;
                }
                return false;
            }
            return true;
        };
        DdlScanner.prototype.handleLBracket = function(s) {
            this.tok_end = this.tok_begin;
            for (;;) {
                switch (s.charAt(this.tok_end)) {
                    case '\r':
                        Assert.isTrue1(s.charAt(this.tok_end + 1) == '\n');
                    case '\n':
                        this.line++;
                        this.column = 0;
                        if (s.charAt(this.tok_end) == '\r') {
                            this.tok_end++;
                        }
                        this.tok_end++;
                        break;
                    default:
                        this.column++;
                        this.tok_end++;
                        break;
                }
            }
        };
        DdlScanner.prototype.isNL = function(X) {
            if (X == '\n' || X == '\r' || X == '\0') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isDigitWithE = function(X, s, tokenIndex) {
            if (X >= '0' && X <= '9') {
                return true;
            }
            if (X == '-' || X == '+') {
                if (this.isDigit(s.charAt(tokenIndex + 1))) {
                    return true;
                }
            }
            if (tokenIndex > 0) {
                if (X == 'e' || X == 'E') {
                    var prev = s.charAt(tokenIndex - 1);
                    var next = s.charAt(tokenIndex + 1);
                    if (this.isDigit(prev) && (this.isDigit(next) || next == '-' || next == '+')) {
                        return true;
                    }
                }
            }
            return false;
        };
        DdlScanner.prototype.isDigit = function(X) {
            if (X >= '0' && X <= '9') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isPunctation = function(s, position) {
            if (this.isDotInNumberLiteral(s, position)) {
                return false;
            }
            var X = s.charAt(position);
            if (X == '-' || X == '+') {
                try {
                    var previous = s.charAt(position - 1);
                    if (previous == 'E' || previous == 'e') {
                        var previousPrevious = s.charAt(position - 2);
                        if (this.isDigit(previousPrevious)) {
                            return false;
                        }
                    }
                } catch (e) {}
                return true;
            }
            if (X == ':' || X == ',' || X == '.' || X == '(' || X == ')' || X == '@' || X == '<' || X == '>' || X == '[' || X == ']' || X == '|' || X == '*' || X == '!') {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isWS = function(X) {
            if (X == ' ' || X == '\u0009' || X == '\u000B' || X == '\u000C' || X == '\u00A0' || X == '\u0085' || X == '\t' || this.isNL(X)) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.isCursor = function(X, Y, compl_pos) {
            if (X == compl_pos.m_line && Y == compl_pos.m_column) {
                return true;
            }
            return false;
        };
        DdlScanner.prototype.getNextToken = function(nestingLevel) {
            var nextToken = Scanner.prototype.getNextToken.call(this, nestingLevel);
            while (true) {
                var num = this.m_input[nextToken].m_num;
                if (num == this.comment1 || num == this.comment2 || num == this.nl) {
                    nextToken = Scanner.prototype.getNextToken.call(this, nestingLevel);
                } else {
                    return nextToken;
                }
            }
        };
        DdlScanner.prototype.getNextTokenIgnoringComments = function(tokenIndex) {
            return null;
        };
        DdlScanner.prototype.getPreviousTokenIgnoringComments = function(tokenIndex) {
            tokenIndex--;
            if (tokenIndex < 0) {
                return null;
            }
            var token = this.m_input[tokenIndex];
            while (Category.CAT_COMMENT === token.m_category) {
                tokenIndex--;
                if (tokenIndex < 0) {
                    return null;
                }
                token = this.m_input[tokenIndex];
            }
            return token;
        };
        return DdlScanner;
    }
);
