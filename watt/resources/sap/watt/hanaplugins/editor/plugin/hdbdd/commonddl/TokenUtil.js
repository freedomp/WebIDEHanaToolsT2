/*eslint-disable no-eq-null,eqeqeq*/
// based on commit
//0d15e5450b7b9775f36d43c5eb7e1f8abb7e5d03 handle supported conditions
define(
    ["rndrt/rnd"], //dependencies
    function (rnd) {
        var Category = rnd.Category;
        var Token = rnd.Token;
        var Utils = rnd.Utils;

        function TokenUtil() {
        }

        TokenUtil.aliasNamePrefix = "alias";
        TokenUtil.getTokenByOffset = function(tokens,offset) {
            if (tokens == null || tokens.length == 0) {
                return null;
            }
            for (var tokenCount = 0;tokenCount < tokens.length;tokenCount++) {
                var token = tokens[tokenCount];
                if (TokenUtil.isInToken(offset,token)) {
                    return token;
                }
            }
            return null;
        };
        TokenUtil.getBestMatchingTokenIndexForOffset = function(tokens,offset) {
            for (var i = 0;i < tokens.length;i++) {
                var t = tokens[i];
                if (t.m_offset > offset) {
                     return i--;
                }
            }
            return -1;
        };
        TokenUtil.isInToken = function(offset,t) {
            return offset >= t.m_offset && offset <= t.m_offset + t.m_lexem.length;
        };
        TokenUtil.getTokenByName = function(tokens,name) {
            for (var tokenCount = 0;tokenCount < tokens.length;tokenCount++) {
                var token = tokens[tokenCount];
                if (token == null) {
                    continue;
                }
                if (rnd.Utils.stringEqualsIgnoreCase(name, token.m_lexem)) {
                    return token;
                }
            }
            return null;
        };
        TokenUtil.getTokenLexem = function(tokenAsObject) {
            var token = TokenUtil.toToken(tokenAsObject);
            if (token != null) {
                return token.getM_lexem();
            }
            return null;
        };
        TokenUtil.getUniqueAliasName = function(tokens) {
            var i = 1;
            var newAlias = TokenUtil.aliasNamePrefix + i;
            var token = TokenUtil.getTokenByName(tokens,newAlias);
            while (token != null) {
                i++;
                newAlias = TokenUtil.aliasNamePrefix + i;
                token = TokenUtil.getTokenByName(tokens,newAlias);
            }
            return newAlias;
        };
        TokenUtil.toToken = function(tokenAsObject) {
            if (tokenAsObject instanceof Token) {
                return tokenAsObject;
            }
            return null;
        };
        TokenUtil.getPreviousTokenIgnoringNLAndComment = function(tokens,tokenIndex) {
            if (tokenIndex < 0) {
                return null;
            }
            var previousTokenIndex = tokenIndex;
            var tok = tokens[previousTokenIndex];
            while (tok.m_category === Category.CAT_WS || tok.m_category === Category.CAT_COMMENT) {
                previousTokenIndex--;
                if (previousTokenIndex < 0) {
                    return null;
                }
                tok = tokens[previousTokenIndex];
            }
            return tok;
        };
        TokenUtil.getNextTokenByName = function(tokens,tokenIndex,nameToken) {
            var nextTokenIndex = tokenIndex;
            var tok = tokens[nextTokenIndex];
            /*eslint-disable no-constant-condition*/
            while (true) {
                if (rnd.Utils.stringEqualsIgnoreCase(tok.getM_lexem(), nameToken)) {
                    break;
                }
                nextTokenIndex++;
                tok = tokens[nextTokenIndex];
            }
            return tok;
        };
        TokenUtil.getNextToken = function(tokenList,currentToken) {
            var foundCurrentToken = false;
            for (var tokenCount = 0;tokenCount < tokenList.length;tokenCount++) {
                var token = tokenList[tokenCount];
                if (foundCurrentToken) {
                    return token;
                }
                if (currentToken.m_lexem === token.m_lexem) {
                    foundCurrentToken = true;
                }
            }
            return null;
        };
        TokenUtil.getNextTokenIgnoringNLAndComment = function(tokens,tokenIndex) {
            var nextTokenIndex = tokenIndex;
            var tok = tokens[nextTokenIndex];
            while (tok.m_category === Category.CAT_WS || tok.m_category === Category.CAT_COMMENT) {
                nextTokenIndex++;
                if (nextTokenIndex >= tokens.length) {
                    return null;
                }
                tok = tokens[nextTokenIndex];
            }
            return tok;
        };
        TokenUtil.getNextTokenIndexIgnoringNLAndComment = function(tokens,tokenIndex) {
            var nextTokenIndex = tokenIndex;
            var tok = tokens[nextTokenIndex];
            while (tok.m_category === Category.CAT_WS || tok.m_category === Category.CAT_COMMENT) {
                nextTokenIndex++;
                if (nextTokenIndex >= tokens.length) {
                    return -1;
                }
                tok = tokens[nextTokenIndex];
            }
            return nextTokenIndex;
        };
        TokenUtil.isKeyword = function(t) {
            if (t != null && (Category.CAT_KEYWORD === t.m_category || Category.CAT_STRICT_KEYWORD === t.m_category || Category.CAT_MAYBE_KEYWORD === t.m_category)) {
                return true;
            }
            return false;
        };
        TokenUtil.getInitialEndOffset = function(tokens) {
            var token = tokens[0];
            return token.m_offset + token.m_lexem.length;
        };
        return TokenUtil;
    }
);
