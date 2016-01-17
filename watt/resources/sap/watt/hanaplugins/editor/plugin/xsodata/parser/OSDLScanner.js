define(
    ["rndrt/rnd","./OSDLLexer", "./OSDLConstants"], //dependencies
    function (rnd, JisonLexer, OSDLConstants) {

        function OSDLScanner(byteCode) {        	
            rnd.Scanner.call(this, byteCode);
            
			this.currentState     = "INITIAL";
			this.isSyntaxColoring = false;  // we start it with false since in syntax coloring scenario we explicitly set the value to true
			this.newLineNoOfChars;

        }
        
        /*
         * Begin of Public Interface 
         */
        OSDLScanner.prototype = Object.create(rnd.Scanner.prototype);
        
        OSDLScanner.prototype.setInput = function (s, startPos, cursorPos) {
        	this.resetInput();
        	
        	JisonLexer.newLineNoOfChars = this.newLineNoOfChars;
        	JisonLexer.TIR = this.m_byte_code;
//            JisonLexer.isSyntaxColoring = this.isSyntaxColoring;    // Set the attribute that will be used by the genarated scanner to decide 
            														// which multi line comments role state to activate

        	JisonLexer.options.backtrack_lexer = true;
            JisonLexer.setInput(s);
            var nextTok = JisonLexer.lex();
            while ( nextTok && nextTok !== JisonLexer.EOF ) {
//            	console.log(nextTok);
            	this.m_input.push(nextTok);
            	nextTok = JisonLexer.lex();
            }
            
            console.log(this.m_input);
            
        };
        
        /*
         * End of Public Interface methods
         */
        
                
        OSDLScanner.OSDLScanner = function (byteCode) {
            var result = new OSDLScanner(byteCode);
            return result;
        };

        OSDLScanner.prototype.getNextToken = function(nestingLevel) {
                var nextToken = rnd.Scanner.prototype.getNextToken.call(this, nestingLevel);
                var condition = true;
                while (condition) {
                    var num = this.m_input[nextToken].m_num;
                    if (num == OSDLConstants.NUM_COMMENT1 || num == OSDLConstants.NUM_COMMENT2 || num == OSDLConstants.NUM_NL) {
                        nextToken = rnd.Scanner.prototype.getNextToken.call(this, nestingLevel);
                        if (nextToken>=this.m_input.length) {
                            return nextToken;
                        }
                    } else {
                        return nextToken;
                    }
                }    
        };


        return OSDLScanner;

    }
    
    
    
   );