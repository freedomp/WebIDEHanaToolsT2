define(
    ["rndrt/rnd", "../util/CoCoUtil", "./OSDLScanner", "./OSDLConstants"], //dependencies
    function (rnd, CoCoUtil, OSDLScanner, OSDLConstants) {
    	
    	//TODO get pad file content in constructor and also provide setPadFileContent method
        function OSDLParser(/*sPadFileContent*/) {
        	        	
            // Pad file load
            this.byteCode = new rnd.ByteCode();
            this.byteCode.read(this.getPadFileContent());

            // Set Scanner:
            this.scanner = new OSDLScanner(this.byteCode);
            
            // Parsers of all kinds are loaded by demand
            this.rndParser = null;
            this.rndCoCoParser = null;
            this.rndErrorCollectingParser = null;
        }
       
        // Set the "constructor" property to refer to OSDLParser
        OSDLParser.prototype.constructor = OSDLParser;
        

        OSDLParser.prototype.getPadFilePath = function () {
        	//The following is calculating the path in the worker and in the window and adds the relative from the base. 
        	return require.toUrl("sap/watt/hanaplugins/editor/plugin/xsodata/parser/OSDL_1_0.pad");
		};
        
        OSDLParser.prototype.getPadFileContent = function () {
        	var xhr = new XMLHttpRequest();
	    	xhr.open("GET", this.getPadFilePath(), false);  // synchronous request
	    	xhr.send(null);
	    	return xhr.responseText;
        };
            		
		OSDLParser.prototype.getRndParser = function() {
            if ( (this.rndParser === null) || (this.rndParser === undefined)) {
                this.rndParser = new rnd.Parser(this.byteCode, this.scanner);
            }        

            return this.rndParser;
        };
        
		OSDLParser.prototype.getRndCoCoParser = function() {
            if ( (this.rndCoCoParser === null) || (this.rndCoCoParser === undefined)) {
                this.rndCoCoParser = new rnd.TokenCoCoParser(this.byteCode, this.scanner);
            }        

            return this.rndCoCoParser;
        };

        OSDLParser.prototype.tokenize = function (source) {
        	this.getRndParser();
            //initParser(parser); //TODO: for match hook

            this.rndParser.TRACING_ENABLED = true;
            this.rndParser.parser.m_resync = true;
            this.rndParser.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1), null);

            this.rndParser.run(rnd.CompletionModes.COMPL_MODE_NONE, null, 100 * 1000);

            this.rndParser.m_scanner.getInput();
            
        };
        
        
        OSDLParser.prototype.parseTokens = function (tokens) {

        	this.getRndParser();

            //initParser(parser); //TODO: for match hook
        	this.rndParser.TRACING_ENABLED  = true;
        	this.rndParser.m_resync         = true;
            this.scanner.resetInput();
            this.rndParser.m_scanner.m_input = tokens;
            this.rndParser.resetInput();
            this.rndParser.onResetInput();

            this.rndParser.run(rnd.CompletionModes.COMPL_MODE_NONE, null, 100 * 1000); //TODO: check for timeout, do we have to maximize it? i think yes.

            return this.rndParser.m_scanner.getInput();

        };

        OSDLParser.prototype.tokenizeLine = function (line, state) {

            this.scanner.isSyntaxColoring = true;   // We are handling syntax coloring.
            this.scanner.currenState      = state;

            this.scanner.setInput(line + "\0", new rnd.CursorPos(1, 1), new rnd.CursorPos(-1, -1)); //$NON-NLS-1$
            var result = this.scanner.getInput();

            return {
                tokens: result,
                state:  this.scanner.currenState
            };

        };

        OSDLParser.prototype.parseLineTokens  = function (tokenList){

            this.scanner.isSyntaxColoring = true;   // We are handling syntax coloring.
            var result = this.parseTokens(tokenList);
            return result;

        };
        
        OSDLParser.prototype.parse = function (source) {
//            throw new Error("parser parse: test");
            
            var newLine = this._determineNewLine(source);
            this.scanner.newLineNoOfChars = this._getNewLineNoOfChars(newLine);
            
            this.getRndParser();
            
            //initParser(parser); //TODO: for match hook

            this.rndParser.TRACING_ENABLED = true;
            this.rndParser.m_resync = true;
            this.rndParser.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1), null);

            this.rndParser.run(rnd.CompletionModes.COMPL_MODE_NONE, null, 100 * 1000);

            return this.rndParser.m_scanner.getInput();

        };
        
        OSDLParser.prototype._determineNewLine = function(source){
            var match = source.match(/^.*?(\r\n|\r|\n)/m);
            if (match){
                if (match.length > 1){
                    return match[1];
                }
                return match[0];
            }
            return null;
        };
        
        OSDLParser.prototype._getNewLineNoOfChars = function(newLine){
            if (newLine){
                if (newLine == "\r\n"){
                    return 2;    
                }
                return 1;
            }
            return 0;
        };
        
        OSDLParser.prototype.getCompletions = function (source, line, column) {
            //throw new Error("parser coco: test");
            
            
            this.getRndCoCoParser();
            var cursorPos = new rnd.CursorPos(line, column);
            //initParser(parser); //TODO: for match hook

            this.rndCoCoParser.TRACING_ENABLED = true;
//    parser.m_resync = true;
            this.rndCoCoParser.setInput(source, new rnd.CursorPos(1, 1, null), cursorPos, null);

            //TODO: Pavel: scanner is not adding the ANY_KW token to indicate the code completion trigger position
            // offset, line and column attribute has to be set correctly by the scanner
            //following four lines are a workaround and are adding the ANY_KW token at the end as last token
            var tokens = this.rndCoCoParser.m_scanner.getInput();
//            var anykwNum = parser.m_scanner.getTokenIndex(OSDLConstants.ANY_KW);
//            var tok = new Token(anykwNum, "", Category.CAT_INCOMPLETE, source.length, line, column, false, ErrorState.Correct);
//            tokens.push(tok);

            
            // new ScannerCoCoInserter().insertCodeCompletionPosition(tokens, cursorPos, OSDLParserTokens.NUM_COLON,this.getTokenIndexResolver());
            var anyKWInserter = new rnd.ScannerCoCoInserter();
            
            // Override permitsCompletion 
        	anyKWInserter.permitsCompletion = function (token, pos,  posIsInToken) {
                if (rnd.Category.CAT_COMMENT === token.m_category) {
                    return false;
                }
                if (rnd.Category.CAT_WS === token.m_category) {
                    return false;
                }
                if (rnd.Category.CAT_OPERATOR === token.m_category) {
                    return false;
                }
                return true;
            };
            
            anyKWInserter.insertCodeCompletionPosition(tokens, cursorPos, OSDLConstants.NUM_COLON,this.byteCode);
            
            if ( tokens[0].m_num === OSDLConstants.NUM_ANYKW && tokens[1].m_num === OSDLConstants.NUM_EOF) {
                //tokens[0].m_category=Category.CAT_INCOMPLETE;
                
                this.rndCoCoParser.m_scanner.resetInput();
                this.rndCoCoParser.m_scanner.m_input=tokens;
                this.rndCoCoParser.resetInput();
            }
            
            this.rndCoCoParser.run(rnd.CompletionModes.COMPL_MODE_UNIQUE.getValue(), null, 100 * 1000);
            var completions = this.getKeywordCompletions(this.rndCoCoParser);
            return completions;
        };

        OSDLParser.prototype.getKeywordCompletions = function (resolver) {
            var result = [];  //new Array(ProposalObjects);
            var /*List<IRNDPath>*/ completionPaths = resolver.getCompletionPaths();
            var  info = resolver.getByteCodeTokenInfo();

            var compType;
            var name;
            var nonKeyword = [OSDLConstants.NUM_CATOBJECT,OSDLConstants.NUM_REPOBJECT,OSDLConstants.NUM_QUOTED_ID,OSDLConstants.NUM_ID];

            for (var completionIdx = 0; completionIdx < completionPaths.length; completionIdx++) {
                var completion = completionPaths[completionIdx];
                var tokens = [];
                var propTokens = [];
                if (completion.getCompletion() !== null) {
                    tokens = completion.getCompletion().m_next_tokens;
                } else {
                    continue;
                }
                
                if ( nonKeyword.indexOf(tokens[0]) < 0) {
                    // Keyword or Operator
                    compType = CoCoUtil.TYPE_KEYWORD;
                    for (var  tIdx = 0; tIdx < tokens.length; tIdx++) {
                        var t = tokens[tIdx];
                        if (nonKeyword.indexOf(t) > 0) {
                            break;
                        }
                        name = info.getTokenNameUS(t);
                        
                        propTokens.push(name);
    
                    }
                } else {
                    // Artifact or ID
                    name = info.getTokenNameUS(tokens[0]);
                    propTokens.push(name);
                    
                    switch ( tokens[0] ) {
                    case OSDLConstants.NUM_CATOBJECT:
                        compType = CoCoUtil.TYPE_ARTIFACT;
                        break;
                    case OSDLConstants.NUM_REPOBJECT:
                        compType = CoCoUtil.TYPE_ARTIFACT;
                        break;
                    default:
                        compType = CoCoUtil.TYPE_IDENTIFIER;
                    }
                        
                    
                }
                
                // Build Proposal Object
                var proposalObject = {};
                proposalObject.propTokens = propTokens;
                proposalObject.isArtifact = false; // Not supported yet !
                proposalObject.type = compType; //CoCoUtil.TYPE_TEMPLATE; // ' (Template)';
                result.push(proposalObject);


            }
            
            return result;
        };

        console.log("OSDLParserLoaded");
        return OSDLParser;

    }
);
