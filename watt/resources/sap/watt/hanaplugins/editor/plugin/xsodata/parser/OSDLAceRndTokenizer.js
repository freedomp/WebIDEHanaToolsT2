define(
    [
        "rndrt/rnd", 
        "./OSDLConstants" 
    ], //dependencies
    function (rnd, OSDLConstants ) {

        function OSDLAceRndTokenizer(parserApi) {
            this.parser = parserApi;
            this.tokensByLine = {}; // map: key= line number; value = token list for given line
        }

        OSDLAceRndTokenizer.prototype.addChangeListener = function (editor) {
            this.aceEditor = editor;
            // this.addMacContentAssistSupport();
            var me = this;

            editor.getSession().on('change', function () {
                // clear line caches when source is modified
                me.tokensByLine = {};
            });

        };

        // AceRndTokenizer.prototype.addMacContentAssistSupport = function() {
        //     this.aceEditor.commands.addCommand({
        //         name: 'myCommand',
        //         bindKey: {win: 'Ctrl-Space',  mac: 'Command-Space'},
        //         exec: function(editor) {
        //             editor.execCommand("startAutocomplete");
        //         }
        //     });
        // };
        
        OSDLAceRndTokenizer.prototype.createSpaces = function (number) {
            var result = [];
            for (var i = 0; i < number; i++) {
                result.push(" ");
            }
            var res = result.join("");
            return res;
        };
/*
        AceRndTokenizer.prototype.getCompls = function (pos, prefix) {
            var line = this.sourceDocument.$lines[pos.row];
            var str = line.substring(0, pos.column);
            var res = this.parser.getCompletions(str, 1, pos.column);
            return res;
        };
*/
        OSDLAceRndTokenizer.prototype.getTokensToBeParsed = function (line, row) {
            var lineTokens = this.parser.tokenize(line);
            
            if(lineTokens.length > 0 && lineTokens[lineTokens.length - 1].m_num === 2 ) {
                lineTokens.splice(lineTokens.length - 1, 1); //delete EOF token
            }
            
            this.tokensByLine[row]  = lineTokens;
            var result              = [];
            var startIndex          = 0;
            var endIndex            = 0;
            result = result.concat(lineTokens);
            endIndex = result.length;

            return {result: result, startIndex: startIndex, endIndex: endIndex};
        };

        OSDLAceRndTokenizer.prototype.getLineTokens = function (line, state, row) {

            var currentState = state || "INITIAL";
            // TODO : say to scanner to start from currentState
            this.parser.scanner.currentState = currentState;
            var aceTokens = [];

            var tokenList = this.getTokensToBeParsed(line, row);

            //add eof token
            tokenList.result.push(new rnd.Token(this.eof, OSDLConstants.EOF, rnd.Category.CAT_WS, this.tok_begin, this.line, this.column, false, rnd.ErrorState.Correct, 0));
            // this.adaptMultiLineComments(tokenList.result);
            
            var rndTokens = this.parser.parseTokens(tokenList.result);
            currentState  = this.parser.getCurrentState();
            
            var lastEndTokenOffset = 0;
            for (var i = tokenList.startIndex; i < tokenList.endIndex; i++) {

                var aceToken = {};

                aceToken.value = line.substring(lastEndTokenOffset, rndTokens[i].m_offset) + rndTokens[i].m_lexem;
                if (rndTokens[i].m_err_state == rnd.ErrorState.Erroneous.getValue()) {
                    aceToken.type = "comment";
                } else if (rndTokens[i].m_category == rnd.Category.CAT_KEYWORD || rndTokens[i].m_category == rnd.Category.CAT_MAYBE_KEYWORD) {
                    aceToken.type = " string";
                } else if (rndTokens[i].m_category == rnd.Category.CAT_LITERAL) {
                    aceToken.type = "string";
                } else if (rndTokens[i].m_category == rnd.Category.CAT_COMMENT) {
                    aceToken.type = "comment";
                } else {
                    aceToken.type = "text";
                }
                aceTokens.push(aceToken);
                lastEndTokenOffset = rndTokens[i].m_offset + rndTokens[i].m_lexem.length;
            }

            return {
                tokens: aceTokens,
                state: currentState
            };
        };

        OSDLAceRndTokenizer.prototype.setDocument = function (sourceDoc) {
            this.sourceDocument = sourceDoc;
        };

        return OSDLAceRndTokenizer;
    }
);