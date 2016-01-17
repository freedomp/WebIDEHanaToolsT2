/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc,max-params*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger",
        "commonddl/astmodel/ViewSelectImpl","commonddl/sourcemodification/IndentUtil"],
    function(rnd,SourceRangeImpl,AstMerger,ViewSelectImpl,IndentUtil) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function AddToListCommand() {
        }

        /**
         * internal method, please use AddSelectListEntryCommand, AddParameterCommand, ...
         */
        AddToListCommand.add = function (parser,resolver,/*ast object*/listContainer,/*array*/list, /*int*/ listIndex, /*string*/entryString, onEmptyListHook) {
            var cu = SourceRangeImpl.getCompilationUnit(listContainer);
            var source = cu.getParsedSource();
            var result = null;
            if (list == null || list.length === 0) {
                //list is empty - find insertion point
                result = onEmptyListHook.invoke(listContainer,source,entryString);
            }else{
                var entries = list;
                var off = null;
                if (listIndex < entries.length) {
                    off = entries[listIndex].getStartOffsetWithComments();
                    var indent = IndentUtil.getLineIndention(source,off);
                    result = Utils.stringInsertAt(source,off,entryString + ",\r\n" + indent);
                }else{ //out of range - add at end
                    var last = entries[entries.length - 1];
                    off = last.getEndOffsetWithComments();
                    var indent1 = IndentUtil.getLineIndention(source,last.getStartOffsetWithComments());
                    result = Utils.stringInsertAt(source,off,",\r\n" + indent1 + entryString);
                }
            }

            //var start = new Date().getTime();
            var newAst = parser.parseAndGetAst3(resolver, null, result);
            //var diff = new Date().getTime()-start;
            //console.log("parse:"+diff);

            //var start = new Date().getTime();
            cu = AstMerger.merge(cu,newAst);
            //var diff = new Date().getTime()-start;
            //console.log("merge:"+diff);

            return listContainer; // should be now updated
        };

        AddToListCommand.getPropertyNameInternal = function(container,value) {
            var keys = Object.keys(container);
            for (var i = 0;i < keys.length;i++) {
                if (container[keys[i]] === value) {
                    return keys[i];
                }
            }
            return null;
        };

        return AddToListCommand;
    }
);