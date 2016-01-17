define(
    ["rndrt/rnd"], //dependencies
    function (rnd) {

        function OSDLConstants() {
        }
        
        OSDLConstants.ANY_KW = "#ANYKW#";
        OSDLConstants.EOF = "#EOF#";
        OSDLConstants.NL = "#NL#";
        OSDLConstants.COMMENT1 = "#COMMENT1#";
        OSDLConstants.COMMENT2 = "#COMMENT2#";
        OSDLConstants.DOT = ".";
        OSDLConstants.COMMA = ",";
        OSDLConstants.COLON = ":";
        OSDLConstants.SEMICOLON = ";";
        OSDLConstants.LPAREN = "(";
        OSDLConstants.RPAREN = ")";
        OSDLConstants.LBRACE = "{";
        OSDLConstants.RBRACE = "}";
        OSDLConstants.CATOBJECT = "#CATOBJECT#";
        OSDLConstants.REPOBJECT = "#REPOBJECT#";
        OSDLConstants.MULTIPLICITY_ONE = "#MULTIPLICITY_ONE#";
        OSDLConstants.MULTIPLICITY_MANY = "#MULTIPLICITY_MANY#";
        OSDLConstants.MULTIPLICITY_ZERO_OR_ONE = "#MULTIPLICITY_ZERO_OR_ONE#";
        OSDLConstants.MULTIPLICITY_ONE_OR_MORE = "#MULTIPLICITY_ONE_OR_MORE#";
        OSDLConstants.QUOTED_ID = "QUOTED_ID";
        OSDLConstants.ID = "#ID#";

        
        /*OSDLConstants.NUM_ANYKW = 0;
        OSDLConstants.NUM_ANYLIT = 1;
        OSDLConstants.NUM_EOF = 2;
        OSDLConstants.NUM_NL = 3;
        OSDLConstants.NUM_COMMENT1 = 4;
        OSDLConstants.NUM_COMMENT2 = 5;*/
        
        OSDLConstants.NUM_ANYKW = rnd.Constants.NUM_ANYKW;
        OSDLConstants.NUM_ANYLIT = rnd.Constants.NUM_ANYNOTINUSE;
        OSDLConstants.NUM_EOF = rnd.Constants.NUM_EOF;
        OSDLConstants.NUM_NL = rnd.Constants.NUM_NL;
        OSDLConstants.NUM_COMMENT1 = rnd.Constants.NUM_COMMENT1;
        OSDLConstants.NUM_COMMENT2 = rnd.Constants.UM_COMMENT2;
        
        OSDLConstants.NUM_DOT = 6;
        OSDLConstants.NUM_COMMA = 7;
        OSDLConstants.NUM_COLON = 8; 
        OSDLConstants.NUM_SEMICOLON = 9; 
        OSDLConstants.NUM_LPAREN = 10;
        OSDLConstants.NUM_RPAREN = 11;
        OSDLConstants.NUM_LCURLY = 12;
        OSDLConstants.NUM_RCURLY = 13;
    	
        OSDLConstants.NUM_CATOBJECT = 14;
        OSDLConstants.NUM_REPOBJECT = 15;
    	
        OSDLConstants.MULTIPLICITY_ONE = 16;
        OSDLConstants.MULTIPLICITY_MANY = 17;
        OSDLConstants.MULTIPLICITY_ZERO_OR_ONE = 18;
        OSDLConstants.MULTIPLICITY_ONE_OR_MORE = 19;
    	
    	
        OSDLConstants.NUM_QUOTED_ID = 20;
        OSDLConstants.NUM_ID = 21;
    	
        return OSDLConstants;
    }
);