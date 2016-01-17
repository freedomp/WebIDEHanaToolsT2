/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["../../rndrt/rnd", "commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger"],
    function(rnd, SourceRangeImpl,AstMerger) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function RemoveWhereClauseCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        /**
         * removes where clause from given ViewSelectImpl
         * @param viewSelect {ViewSelectImpl}
         * @returns {ViewSelectImpl}
         */
        RemoveWhereClauseCommand.prototype.removeWhereClause = function(/*ViewSelectImpl*/ viewSelect) {
            var where = viewSelect.getWhere();
            if (where == null) {
                return viewSelect;
            }

            var cu = SourceRangeImpl.getCompilationUnit(where);
            var source = cu.getParsedSource();
            var start = where.getStartOffset();
            var end = where.getEndOffset();
            var buf = new rnd.StringBuffer(source);
            buf.replace(start, end, "");
            var result = buf.toString();

            var newAst = this.parser.parseAndGetAst3(this.resolver, null, result);
            cu = AstMerger.merge(cu, newAst);
            return viewSelect;
        };

        return RemoveWhereClauseCommand;
    }
);