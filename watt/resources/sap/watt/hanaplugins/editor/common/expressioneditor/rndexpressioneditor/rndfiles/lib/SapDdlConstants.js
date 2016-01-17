/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// based on commit
// 7b24ad7759edad33109861ffce3817dc2b2be43c Preparations for the support of table functions
define(
    [], //dependencies
    function () {

        function SapDdlConstants() {
        };
        SapDdlConstants.ANY_KW = "#ANYKW#";
        SapDdlConstants.EOF = "#EOF#";
        SapDdlConstants.NL = "#NL#";
        SapDdlConstants.COMMENT1 = "#COMMENT1#";
        SapDdlConstants.COMMENT2 = "#COMMENT2#";
        SapDdlConstants.DOT = ".";
        SapDdlConstants.COMMA = ",";
        SapDdlConstants.COLON = ":";
        SapDdlConstants.COLON_FOLLOWED_BY_ID = "#COLON_FOLLOWED_BY_ID#";
        SapDdlConstants.PIPE_PIPE = "#PIPE_PIPE#";
        SapDdlConstants.LPAREN = "(";
        SapDdlConstants.RPAREN = ")";
        SapDdlConstants.LT = "<";
        SapDdlConstants.GT = ">";
        SapDdlConstants.LBRACK = "[";
        SapDdlConstants.RBRACK = "]";
        SapDdlConstants.LBRACE = "{";
        SapDdlConstants.RBRACE = "}";
        SapDdlConstants.STRING_CONST = "#STR_CONST#";
        SapDdlConstants.BINARY_CONST = "#BINARY_CONST#";
        SapDdlConstants.INT_CONST = "#INT_CONST#";
        SapDdlConstants.LONG_INT_CONST = "#LINT_CONST#";
        SapDdlConstants.DEC_CONST = "#DEC_CONST#";
        SapDdlConstants.REAL_CONST = "#REAL_CONST#";
        SapDdlConstants.DATE_CONST = "#DATE_CONST#";
        SapDdlConstants.TIME_CONST = "#TIME_CONST#";
        SapDdlConstants.TIMESTAMP_CONST = "#TIMESTAMP_CONST#";
        SapDdlConstants.AT = "@";
        SapDdlConstants.PIPE = "|";
        SapDdlConstants.STAR = "*";
        SapDdlConstants.PLUS = "+";
        SapDdlConstants.GE = ">=";
        SapDdlConstants.DASH_ARROW = "=>";
        SapDdlConstants.DASH_ARROW_NONE_WS="#DASH_ARROW_NONE_WS#";
        SapDdlConstants.NE = "<>";
        SapDdlConstants.COLONCOLON = "::";
        SapDdlConstants.ID = "#ID#";
        SapDdlConstants.ENUM_ID = "#ENUM_ID#";
        SapDdlConstants.NUM_ANYKW = 0;
        SapDdlConstants.NUM_ANYLIT = 1;
        SapDdlConstants.NUM_EOF = 2;
        SapDdlConstants.NUM_NL = 3;
        SapDdlConstants.NUM_COMMENT1 = 4;
        SapDdlConstants.NUM_COMMENT2 = 5;
        SapDdlConstants.NUM_DOT = 6;
        SapDdlConstants.NUM_COMMA = 7;
        SapDdlConstants.NUM_COLON = 8;
        SapDdlConstants.NUM_DUMMY = 9;
        SapDdlConstants.NUM_LPAREN = 10;
        SapDdlConstants.NUM_RPAREN = 11;
        SapDdlConstants.NUM_PARAM_LPAREN = 12;
        SapDdlConstants.NUM_PARAM_RPAREN = 13;
        SapDdlConstants.NUM_LT = 14;
        SapDdlConstants.NUM_GT = 15;
        SapDdlConstants.NUM_LBRACK = 16;
        SapDdlConstants.NUM_RBRACK = 17;
        SapDdlConstants.NUM_LBRACE = 18;
        SapDdlConstants.NUM_RBRACE = 19;
        SapDdlConstants.NUM_STR_CONST = 20;
        SapDdlConstants.NUM_INT_CONST = 21;
        SapDdlConstants.NUM_LINT_CONST = 22;
        SapDdlConstants.NUM_DEC_CONST = 23;
        SapDdlConstants.NUM_REAL_CONST = 24;
        SapDdlConstants.NUM_DATE_CONST = 25;
        SapDdlConstants.NUM_TIME_CONST = 26;
        SapDdlConstants.NUM_TIMESTAMP_CONST = 27;
        SapDdlConstants.NUM_ACTION = 28;
        SapDdlConstants.NUM_ACTIONI = 29;
        SapDdlConstants.NUM_HASH = 30;
        SapDdlConstants.NUM_AT = 31;
        SapDdlConstants.NUM_PIPE = 32;
        SapDdlConstants.NUM_STAR = 33;
        SapDdlConstants.NUM_QUESTION = 34;
        SapDdlConstants.NUM_PLUS = 35;
        SapDdlConstants.NUM_BANG = 36;
        SapDdlConstants.NUM_DOLLAR = 37;
        SapDdlConstants.NUM_GE = 38;
        SapDdlConstants.NUM_NE = 39;
        SapDdlConstants.NUM_COLONCOLON = 40;
        SapDdlConstants.NUM_BINARY_CONST = 41;
        SapDdlConstants.NUM_ERROR = 42;
        SapDdlConstants.NUM_SYS = 43;
        SapDdlConstants.NUM_ID = 44;

        return SapDdlConstants;
    }
);
