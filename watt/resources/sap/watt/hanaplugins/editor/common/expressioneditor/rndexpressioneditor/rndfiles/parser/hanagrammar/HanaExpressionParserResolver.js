/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
    ["rndrt/rnd"], //dependencies
    function(rnd) {
        var TokenCoCoParser = rnd.TokenCoCoParser;
        var Stackframe = rnd.Stackframe;
        var FramePtr = rnd.FramePtr;
        var NullFrame = rnd.NullFrame;
        var UserStackframeT = rnd.UserStackframeT;
        // embed rnd packages

        function HanaExprParserResolver( /*IByteCode*/ byte_code, /*IParserScanner*/ scanner, identifiers, functions, operators) {
            TokenCoCoParser.call(this, byte_code, scanner);
            /* NullFrame*/
            this.m_start_attr = new NullFrame();
            this.identifiers = identifiers;
            this.functions = functions;
            this.operators = operators; 
        }
        // "extends
        HanaExprParserResolver.prototype = Object.create(TokenCoCoParser.prototype);
        // Begin of user defined implementation:

        // End of user defined implementation 
        // All attribute frames:  
        // All local Frames
        // All Actions
        /*Stackframe*/
        HanaExprParserResolver.prototype.createFrame0 = function( /*int*/ frame_num, /*IRuleInfo*/ rule_info) {
            switch (frame_num) {}; // switch 
            assert(frame_num >= 0 && frame_num < 104);
            return new UserStackframeT /*<NullFrame, NullFrame>*/ (Stackframe.nullFrame, new NullFrame(), this.m_current.m_BP.ptr(), rule_info);
        }; // method 
        //@Override
        //protected FramePtr 
        HanaExprParserResolver.prototype.createFrame = function( /*short*/ frame_num, /*IRuleInfo*/ rule_info) {
            if (this.isCoCoMode()) {
                return new rnd.FramePtr(new Stackframe(this.m_current.m_BP.getStackframe(), rule_info, new Object()));
            }

            if (frame_num < 500) return new FramePtr(this.createFrame0(frame_num, rule_info));
            //assert(false);
            return null; // just to shut up warning
        }; // method

        HanaExprParserResolver.prototype.onMatchCollectCompletionSuggestionsOrAbort = function(current_token, matched_terminal, current, context) {
            var match = this.getByteCodeTokenInfo().getTokenNameUS(matched_terminal);
            var sf = current.getStackframe();
            if (sf.getRuleInfo().getRuleName() === "FuncName") {
                var myFuncList = this.functions;
                for (var i = 0; i < myFuncList.length; i++) {
                    if (rnd.Utils.stringStartsWith(myFuncList[i], current_token.m_lexem)) {
                        if (this.mySemanticCompletions === undefined) {
                            this.mySemanticCompletions = [];
                        }
                        var length = this.mySemanticCompletions.length;
                        var contains = false;
                        while(length--){
                            if(this.mySemanticCompletions[length] === myFuncList[i]){
                                contains = true;
                            }
                        }
                        if(!contains){
                            this.mySemanticCompletions.push(myFuncList[i]); 
                        }
                    }
                }
                // var keywordCompletionDetected = TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort.call(this, current_token, matched_terminal, current, context);
            }
            else if (match === "#ID#") {
                //add semantic completions here
                //var myIdList = ["firstIdent", "secondIdent"];
                var myIdList = this.identifiers;
                for (var i = 0; i < myIdList.length; i++) { 
                    if (rnd.Utils.stringStartsWith(myIdList[i], "\"" + current_token.m_lexem) || rnd.Utils.stringStartsWith(myIdList[i], "\'$$" + current_token.m_lexem) || rnd.Utils.stringStartsWith(myIdList[i], "\$$" + current_token.m_lexem)) {
                        if (this.mySemanticCompletions === undefined) {
                            this.mySemanticCompletions = [];
                        }
                        var length = this.mySemanticCompletions.length;
                        var contains = false;
                        while(length--){
                            if(this.mySemanticCompletions[length] === myIdList[i]){
                                contains = true;
                            }
                        }
                        if(!contains){
                            this.mySemanticCompletions.push(myIdList[i]);
                        }
                        //this.addCompletion(myIdList[i]);
                    }
                }
             //    var keywordCompletionDetected = TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort.call(this, current_token, matched_terminal, current, context);
            }
            else{
                var keywordCompletionDetected = TokenCoCoParser.prototype.onMatchCollectCompletionSuggestionsOrAbort.call(this, current_token, matched_terminal, current, context);
            }
          //  
        };
        //}  // class ExprParserResolver
        return HanaExprParserResolver;
    }
);
