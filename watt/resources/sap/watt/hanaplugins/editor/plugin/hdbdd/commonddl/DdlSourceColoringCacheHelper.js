/*eslint-disable no-eq-null,eqeqeq*/
define(
    ["rndrt/rnd"],
    function (rnd) {
        function DdlSourceColoringCacheHelper() {
        }
        DdlSourceColoringCacheHelper.prototype = Object.create(null);

        
        DdlSourceColoringCacheHelper.prototype.convertTokensToLineCache = function(tokens) {
            var tokensByLine = {};
            for (var i = 0;i < tokens.length;i++) {
                var token = tokens[i];
                if ((token.m_category == rnd.Category.CAT_COMMENT || token.m_category == rnd.Category.CAT_LITERAL ) && token.m_lexem.indexOf("\n") >= 0) {
                    var literalOrBlockCommentLines = token.m_lexem.split("\n");
                    var cacheIndex = token.m_line - 1;
                    var newOffset = token.m_offset;
                    var newColumn = token.m_column;
                    
                    for (var j = 0;j < literalOrBlockCommentLines.length;j++) {
                        if (j > 0) {
                            newOffset = newOffset + literalOrBlockCommentLines[j - 1].length;
                            newColumn = 1;
                        }
                        
                        var tl = tokensByLine[cacheIndex];  
                        if (tl == null) {
                            tl = [];
                            tokensByLine[cacheIndex] = tl;
                        }
                        var copy = new rnd.Token(token.m_num, literalOrBlockCommentLines[j], token.m_category,
                                             newOffset, cacheIndex + 1, newColumn, token.m_start_of_line, token.m_err_state);
                        tl.push(copy);
                        cacheIndex++;
                    }
                    continue;
                }
                var row = token.m_line - 1;
                var tl1 = tokensByLine[row];
                if (tl1 == null) {
                    tl1 = [];
                    tokensByLine[row] = tl1;
                }
                tl1.push(token);
            }
            return tokensByLine;
        };
        
        
        return DdlSourceColoringCacheHelper;
    }
);