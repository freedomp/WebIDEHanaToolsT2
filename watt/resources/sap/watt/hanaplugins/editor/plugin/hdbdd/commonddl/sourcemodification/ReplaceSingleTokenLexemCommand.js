/*eslint-disable no-eq-null,eqeqeq,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger"],
    function(rnd,SourceRangeImpl,AstMerger) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function ReplaceSingleTokenLexemCommand() {
        }

        /**
         */
        ReplaceSingleTokenLexemCommand.replaceTokenLexem = function (parser,resolver,/*CompilationUnitImpl*/ cu, /*Token*/token,/*string*/newLexem) {
            var source = cu.getParsedSource();
            var offset = token.m_offset;
            var end = offset + token.m_lexem.length;
            var buf = new rnd.StringBuffer(source);
            buf.replace(offset,end,newLexem);
            var result = buf.toString();

            var newAst = parser.parseAndGetAst3(resolver, null, result);
            cu = AstMerger.merge(cu,newAst);
        };

        return ReplaceSingleTokenLexemCommand;
    }
);