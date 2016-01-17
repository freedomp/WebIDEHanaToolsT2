define(["commonddl/sourcemodification/MoveAstObjectInListCommand"],
    function(MoveAstObjectInListCommand) {
        function MoveSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        MoveSelectListEntryCommand.prototype.moveUpSelectListEntry = function(/*SelectListEntryImpl*/selectListEntry
                                                                                ) {
            var array = selectListEntry.eContainer().getEntries();
            return MoveAstObjectInListCommand.moveUp(this.parser,this.resolver,array,selectListEntry);
        };

        MoveSelectListEntryCommand.prototype.moveDownSelectListEntry = function(/*SelectListEntryImpl*/selectListEntry
                                                                              ) {
            var array = selectListEntry.eContainer().getEntries();
            return MoveAstObjectInListCommand.moveDown(this.parser,this.resolver,array,selectListEntry);
        };

        return MoveSelectListEntryCommand;
    }
);