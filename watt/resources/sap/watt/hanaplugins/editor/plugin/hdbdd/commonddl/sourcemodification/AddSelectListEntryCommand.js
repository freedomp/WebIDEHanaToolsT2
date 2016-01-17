/*eslint-disable no-eq-null,eqeqeq,valid-jsdoc*/
define(["rndrt/rnd", "commonddl/sourcemodification/AddToListCommand","commonddl/astmodel/ViewSelectImpl","commonddl/astmodel/SourceRangeImpl"],
    function(rnd, AddToListCommand,ViewSelectImpl,SourceRangeImpl) {

        function AddSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }


        AddSelectListEntryCommand.prototype.invoke = function(listContainer,source,entryString) {
            var result = "";
            if (listContainer instanceof ViewSelectImpl) {
                var idx = listContainer.getStartTokenIndex();
                var cu = SourceRangeImpl.getCompilationUnit(listContainer);
                var tokens = cu.getTokenList();
                idx = this.findNextTokenIndexInternal(tokens,idx,"{");
                if (idx > 0) {
                    var ind = tokens[idx].m_offset;
                    if (ind > 0) {
                        result = rnd.Utils.stringInsertAt(source, ind + 1, " " + entryString);
                    }
                }
            }else {
                throw new Error("not supported");
            }
            return result;
        };

        AddSelectListEntryCommand.prototype.findNextTokenIndexInternal = function(tokens,idx,lexem) {
            /*eslint-disable no-constant-condition*/
            while(true) {
                var t = tokens[idx];
                if (lexem == t.m_lexem) {
                    return idx;
                }
                idx++;
                if (idx >= tokens.length){
                    return -1;
                }
            }
        };

        /**
         * Creates a select list entry and adds it to the view select list
         * @returns {SelectListEntryImpl} the created select list entry
         */
        AddSelectListEntryCommand.prototype.addSelectListEntry = function(/*ViewSelectImpl*/viewSelect,
                                                                          /*String*/selectListEntryString,
                                                                          /*int optional*/insertPosition
                                                                          ) {
            var selectList = viewSelect.getSelectList();
            var entries = null;
            if (selectList != null) {
                entries = selectList.getEntries();
                if (insertPosition === undefined) {
                    insertPosition = entries.length;
                }
                AddToListCommand.add(this.parser,this.resolver,selectList,entries,insertPosition,selectListEntryString,this);
                if (insertPosition >= entries.length) {
                    insertPosition = entries.length - 1;
                }
                return entries[insertPosition];
            }else{ // add to empty select list
                AddToListCommand.add(this.parser,this.resolver,viewSelect,null,insertPosition,selectListEntryString,this);
                return viewSelect.getSelectList().getEntries()[0];
            }
        };

        return AddSelectListEntryCommand;
    }
);