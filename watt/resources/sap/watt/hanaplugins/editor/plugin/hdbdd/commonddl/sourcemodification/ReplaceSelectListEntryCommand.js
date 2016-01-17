/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd", "commonddl/astmodel/SourceRangeImpl", "commonddl/differ/AstMerger", "commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function (rnd, SourceRangeImpl, AstMerger, ReplaceAnnotationCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function ReplaceSelectListEntryCommand(parser, resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        /**
         * replaces a select list entry with a new source snippet
         *
         * @param parser - parser instance
         * @param resolver - pad file resolver instance
         * @param viewSelect - AST node
         * @param selectListEntryIndex - index for select list entry
         * @param selectListEntryString - the source to be inserted; can contain filter, alias and more complex expression.
         *                                the source for the select list entry simply needs to be syntactical correct
         */
        ReplaceSelectListEntryCommand.prototype.replaceSelectListEntry = function (/*SelectListEntryImpl*/entry, /*string*/selectListEntryString) {
            var cu = SourceRangeImpl.getCompilationUnit(entry);
            var source = cu.getParsedSource();
            var result = null;
            var entries = entry.container.getEntries();
            var start = entry.getStartOffsetWithComments();
            var end = entry.getEndOffsetWithComments();
            if (selectListEntryString == null || selectListEntryString.length === 0) { //aha removal
                var idx = entries.indexOf(entry);
                if (idx > 0) {
                    start = ReplaceAnnotationCommand.getLeftIndex(source, ",", start);
                } else if (idx < entries.length - 1) {
                    end = ReplaceAnnotationCommand.getRightIndex(source, [","], end);
                }
            }
            var buf = new rnd.StringBuffer(source);
            buf.replace(start, end, selectListEntryString);
            result = buf.toString();

            var newAst = this.parser.parseAndGetAst3(this.resolver, null, result);
            cu = AstMerger.merge(cu, newAst);
            return entry;
        };

        return ReplaceSelectListEntryCommand;
    }
);