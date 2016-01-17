/*eslint-disable no-eq-null*/
define(["../../rndrt/rnd", "commonddl/sourcemodification/ReplaceSingleTokenLexemCommand",
        "commonddl/astmodel/SourceRangeImpl","commonddl/TokenUtil"],
    function(rnd, ReplaceSingleTokenLexemCommand,SourceRangeImpl,TokenUtil) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function RemoveAliasForSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        RemoveAliasForSelectListEntryCommand.prototype.removeAlias = function(/*SelectListEntryImpl*/selectListEntry) {
            var tok = selectListEntry.getAliasToken();
            if (tok == null) {
                return null;
            }
            var cu = SourceRangeImpl.getCompilationUnit(selectListEntry);
            var tokens = cu.getTokenList();
            var idx = tokens.indexOf(tok);
            var prev = TokenUtil.getPreviousTokenIgnoringNLAndComment(tokens,idx - 1);
            if (prev != null && rnd.Utils.stringEqualsIgnoreCase("as",prev.m_lexem)) {
                ReplaceSingleTokenLexemCommand.replaceTokenLexem(this.parser,this.resolver,cu,tok,"");
                ReplaceSingleTokenLexemCommand.replaceTokenLexem(this.parser,this.resolver,cu,prev,"");
                return selectListEntry;
            }else{
                throw new Error();
            }
        };

        return RemoveAliasForSelectListEntryCommand;
    }
);