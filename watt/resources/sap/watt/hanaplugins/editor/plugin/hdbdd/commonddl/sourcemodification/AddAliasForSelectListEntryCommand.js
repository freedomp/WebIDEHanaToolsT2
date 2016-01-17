/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd", "commonddl/sourcemodification/ReplaceSingleTokenLexemCommand",
        "commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger"],
    function(rnd, ReplaceSingleTokenLexemCommand,SourceRangeImpl,AstMerger) {

        function AddAliasForSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        /**
         * @returns {Token} the alias token
         */
        AddAliasForSelectListEntryCommand.prototype.addAlias = function(/*SelectListEntryImpl*/selectListEntry,/*String*/aliasName) {
            if (selectListEntry === null) {
                return null;
            }
            var cu = SourceRangeImpl.getCompilationUnit(selectListEntry);
            var aliasToken = selectListEntry.getAliasToken();
            if (aliasToken != null && aliasToken.m_lexem.length > 0) {
                //alias already exists
                ReplaceSingleTokenLexemCommand.replaceTokenLexem(this.parser,this.resolver,cu,aliasToken,aliasName);
            }else{
                //alias does not exist
                var off = selectListEntry.getEndOffsetWithComments();
                var source = cu.getParsedSource();
                var result = rnd.Utils.stringInsertAt(source,off," as " + aliasName);
                var newAst = this.parser.parseAndGetAst3(this.resolver, null, result);
                cu = AstMerger.merge(cu,newAst);
            }
            //return the alias
            return selectListEntry.getAliasToken();
        };

        return AddAliasForSelectListEntryCommand;
    }
);