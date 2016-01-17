/*eslint-disable no-eq-null,eqeqeq,max-params*/
/* migrated based on
 * 4397f55544f66cb605c247e273f8f57733e8af4c cleanup code - introduce TokenUtil.isKeyword
 */
define(
    ["commonddl/DdlSourceFormattingStyle","rndrt/rnd","commonddl/SapDdlConstants","commonddl/AnnotationPayload","commonddl/WordFormattingEnum","commonddl/AnnotationUtil",
     "commonddl/TokenUtil"], //dependencies
    function (DdlSourceFormattingStyle,rnd,SapDdlConstants,AnnotationPayload,WordFormattingEnum,AnnotationUtil,TokenUtil) {
        var Utils = rnd.Utils;

        function SapViewFormatter() {
        }
        SapViewFormatter.QUOTATION_MARK = "\"";
        SapViewFormatter.prototype.insertions = {};
        SapViewFormatter.prototype.processedFrames = [];
        SapViewFormatter.prototype.formatingStyle = new DdlSourceFormattingStyle();
        SapViewFormatter.prototype.getFormatingStyle = function() {
            return this.formatingStyle;
        };
        SapViewFormatter.prototype.setFormatingStyle = function(simpleFormatingStyle) {
            if (simpleFormatingStyle != null) {
                this.formatingStyle = simpleFormatingStyle;
            }
        };
        SapViewFormatter.prototype.format = function(source,parser,resolver) {
            var tokens = this.getSourceTokens(source,parser,resolver);
            if (this.hasErrorState(tokens)) {
                throw new Error();
            }
            this.allAnnotations = null;
            var result = new rnd.StringBuffer(source);
            var token;
            for (var i = tokens.length - 1;i >= 0;i--) {
                token = tokens[i];
                if (SapDdlConstants.EOF === token.m_lexem) {
                    continue;
                }
                var textConverted = token.m_lexem;
                if (this.isKeyword1(token)) {
                    textConverted = this.formatBasedOnFormattingSettings(textConverted,this.formatingStyle.getKeywordFormatting());
                }else if (this.isIdentifier(token)) {
                    if (this.isAnnotation(token) == true) {
                        textConverted = this.formatAnnotation(textConverted,parser);
                    }else{
                        textConverted = this.formatIdentifier(token);
                    }
                }
                var start = token.m_offset;
                var end = start + token.m_lexem.length;
                result.replace(start,end,textConverted);
            }
            return result.toString();
        };
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }
        SapViewFormatter.prototype.formatAnnotation = function(textConverted,parser) {
            try {
                if (parser == null || textConverted == null) {
                    return textConverted;
                }
                var annWordsSupported = this.getSuppoetedAnnotationWords(parser);
                for (var annWordCount = 0;annWordCount < annWordsSupported.length;annWordCount++) {
                    var annWord = annWordsSupported[annWordCount];
                    if (Utils.stringEqualsIgnoreCase(annWord, textConverted)) {
                        return annWord;
                    }
                }
            }
            catch(e) {
                Console.log(e.stack);
            }
            return textConverted;
        };
        SapViewFormatter.prototype.formatIdentifier = function(token) {
            var textConverted = token.m_lexem;
            if (this.beginsWithQuotationMark(token) == false) {
                textConverted = this.formatBasedOnFormattingSettings(textConverted,this.formatingStyle.getIdentifierFormatting());
            }else{
                textConverted = this.formatBasedOnFormattingSettings(textConverted,WordFormattingEnum.UpperCase);
            }
            return textConverted;
        };
        SapViewFormatter.prototype.getSuppoetedAnnotationWords = function(parser) {
            var annsMap = AnnotationUtil.getAnnotationsAsStringList1(parser.getSupportedAnnotations());
            var anns = Object.keys(annsMap);
            var annWords = [];
            var delimiter = "\\.";
            for (var annCount = 0;annCount < anns.length;annCount++) {
                var ann = anns[annCount];
                var words = ann.split(delimiter);
                for (var wordCount = 0;wordCount < words.length;wordCount++) {
                    var word = words[wordCount];
                    annWords.push(word);
                }
            }
            return annWords;
        };
        SapViewFormatter.prototype.allAnnotations = null;
        SapViewFormatter.prototype.getSourceTokens = function(source,parser,resolver) {
            return parser.parseSource(resolver,source);
        };
        SapViewFormatter.prototype.isAnnotation = function(token) {
            if (token == null) {
                return false;
            }
            var payload = token.getPayload();
            if (payload instanceof AnnotationPayload) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.beginsWithQuotationMark = function(token) {
            if (token == null) {
                return false;
            }
            var index = token.m_lexem.indexOf(SapViewFormatter.QUOTATION_MARK);
            if (index == 0) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.formatBasedOnFormattingSettings = function(textToBeConverted,fe) {
            if (textToBeConverted == null) {
                return null;
            }
            if (fe != null) {
                if (fe === WordFormattingEnum.UpperCase) {
                    textToBeConverted = textToBeConverted.toUpperCase();
                }else if (fe === WordFormattingEnum.LowerCase) {
                    textToBeConverted = textToBeConverted.toLowerCase();
                }else if (fe === WordFormattingEnum.CamelCase) {
                    textToBeConverted = DdlSourceFormattingStyle.convertToCamelCase(textToBeConverted);
                }
            }
            return textToBeConverted;
        };
        SapViewFormatter.prototype.hasErrorState = function(tokens) {
            for (var tokenCount = 0;tokenCount < tokens.length;tokenCount++) {
                var token = tokens[tokenCount];
                if (!(rnd.ErrorState.Correct === token.m_err_state)) {
                    return true;
                }
            }
            return false;
        };
        SapViewFormatter.prototype.isKeyword3 = function(tokens,i,keywords) {
            var result = true;
            for (var kCount = 0;kCount < keywords.length;kCount++) {
                var k = keywords[kCount];
                var t = tokens[i];
                if (Utils.stringEqualsIgnoreCase(k, t.m_lexem) && this.isKeyword1(t)) {
                    i++;
                }else{
                    result = false;
                    break;
                }
            }
            return result;
        };
        SapViewFormatter.prototype.addLineBreak = function(result,identLevel) {
            result.append("\r\n");
            for (var i = 0;i < identLevel;i++) {
                result.append("    ");
            }
        };
        SapViewFormatter.prototype.isIdentifier = function(t) {
            if (rnd.Category.CAT_IDENTIFIER === t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isKeyword1 = function(t) {
            var res = TokenUtil.isKeyword(t);
            return res;
        };
        SapViewFormatter.prototype.isOperator = function(t) {
            if (t != null && rnd.Category.CAT_OPERATOR === t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isLiteral = function(t) {
            if (t != null && rnd.Category.CAT_LITERAL === t.m_category) {
                return true;
            }
            return false;
        };
        SapViewFormatter.prototype.isComparator = function(t) {
            var SQL_COMPARATORS = ["=","<",">","~=","!=","^=","<="," >=","IS NULL","IS NOT NULL","LIKE","NOT LIKE","BETWEEN","IN"];
            var comparatorsSQL = SQL_COMPARATORS;
            if (t == null) {
                return false;
            }
            var str = t.m_lexem.toUpperCase();
            if (Utils.arrayContains(comparatorsSQL, str)) {
                return true;
            }
            return false;
        };
        return SapViewFormatter;
    }
);