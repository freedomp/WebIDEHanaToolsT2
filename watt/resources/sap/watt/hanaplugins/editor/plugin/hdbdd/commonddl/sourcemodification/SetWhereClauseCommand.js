/*eslint-disable no-eq-null,eqeqeq,camelcase,no-multi-spaces,max-statements*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger"],
    function(rnd,SourceRangeImpl,AstMerger) {

        function SetWhereClauseCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        SetWhereClauseCommand.prototype.setWhereClause = function(/*ViewSelectImpl*/ viewSelect, whereClauseString) {
            if (viewSelect == null) {
                return null;
            }
            if (whereClauseString == null) {
                return null;
            }
            var where = viewSelect.getWhere();
            var cu = SourceRangeImpl.getCompilationUnit(viewSelect);
            var source = cu.getParsedSource();
            var buf = new rnd.StringBuffer(source);
            if (whereClauseString == null || whereClauseString.length == 0) {
                //delete where clause
                if (where == null) {
                    return null;
                }
                var start = where.getStartOffsetWithComments();
                var end = where.getEndOffsetWithComments();
                buf.replace(start, end, whereClauseString);
                var result = buf.toString();
                var newAst = this.parser.parseAndGetAst3(this.resolver, null, result);
                cu = AstMerger.merge(cu, newAst);
            }else {
                if (rnd.Utils.stringStartsWith(whereClauseString.toLowerCase(),"where ") == false) {
                    whereClauseString = "where " + whereClauseString;
                }
                if (where == null) {
                    var end2 = viewSelect.getEndOffsetWithComments();
                    if (end2 < 0) {
                        end2 = source.length; // add where clause to end of source
                    }
                    buf.insert(end2," " + whereClauseString);
                } else {
                    var start1 = where.getStartOffsetWithComments();
                    var end1 = where.getEndOffsetWithComments();
                    buf.replace(start1, end1, whereClauseString);
                }
                var result1 = buf.toString();
                var newAst2 = this.parser.parseAndGetAst3(this.resolver, null, result1);
                cu = AstMerger.merge(cu, newAst2);
                return viewSelect.getWhere();
            }
        };

        return SetWhereClauseCommand;
    }
);