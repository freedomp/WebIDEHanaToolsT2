/*eslint-disable no-eq-null,no-multi-spaces*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/TokenUtil"],
    function(rnd,SourceRangeImpl,AstMerger,TokenUtil) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function MoveAstObjectInListCommand() {
        }

        MoveAstObjectInListCommand.moveUp = function (parser,resolver,/*array*/list,/*ast object*/ listEntry) {
            var cu = SourceRangeImpl.getCompilationUnit(listEntry);
            var source = cu.getParsedSource();
            var tokens = cu.getTokenList();
            var result = null;
            var idx = list.indexOf(listEntry);
            if (idx === 0) {
                return listEntry;
            }

            var start = listEntry.getStartOffsetWithComments();
            var end = listEntry.getEndOffsetWithComments();
            var entryString = source.substring(start,end);

            var previousEntry = list[idx - 1];
            var previousStart = previousEntry.getStartOffsetWithComments();
            var previousEnd = previousEntry.getEndOffsetWithComments();
            var previousEntryString = source.substring(previousStart,previousEnd);

            var buf = new rnd.StringBuffer(source);
            buf.replace(previousStart,previousEnd,entryString);

            var diff = entryString.length - previousEntryString.length;
            buf.replace(start + diff,end + diff,previousEntryString);
            var result1 = buf.toString();

            //var start = new Date().getTime();
            var newAst = parser.parseAndGetAst3(resolver, null, result1);
            //var diff = new Date().getTime()-start;
            //console.log("parse:"+diff);

            //var start = new Date().getTime();
            cu = AstMerger.merge(cu,newAst);
            //var diff = new Date().getTime()-start
            //console.log("merge:"+diff);

            return list[idx - 1]; // should be now updated
        };

        MoveAstObjectInListCommand.moveDown = function (parser,resolver,/*array*/list,/*ast object*/ listEntry) {
            var cu = SourceRangeImpl.getCompilationUnit(listEntry);
            var source = cu.getParsedSource();
            var tokens = cu.getTokenList();
            var result = null;
            var idx = list.indexOf(listEntry);
            if (idx === list.length - 1) {
                return listEntry;
            }

            var start = listEntry.getStartOffsetWithComments();
            var end = listEntry.getEndOffsetWithComments();
            var entryString = source.substring(start,end);

            var nextEntry = list[idx + 1];
            var nextStart = nextEntry.getStartOffsetWithComments();
            var nextEnd = nextEntry.getEndOffsetWithComments();
            var nextEntryString = source.substring(nextStart,nextEnd);

            var buf = new rnd.StringBuffer(source);
            buf.replace(start,end,nextEntryString);

            var diff = nextEntryString.length - entryString.length;
            buf.replace(nextStart + diff,nextEnd + diff,entryString);
            var result1 = buf.toString();

            var newAst = parser.parseAndGetAst3(resolver, null, result1);
            cu = AstMerger.merge(cu,newAst);
            return list[idx + 1]; // should be now updated
        };

        return MoveAstObjectInListCommand;
    }
);