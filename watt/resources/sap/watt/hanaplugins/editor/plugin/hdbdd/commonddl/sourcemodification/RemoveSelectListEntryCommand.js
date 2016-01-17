define(["commonddl/astmodel/SourceRangeImpl","commonddl/sourcemodification/ReplaceSelectListEntryCommand"],
    function(SourceRangeImpl,ReplaceSelectListEntryCommand) {
        function RemoveSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        RemoveSelectListEntryCommand.prototype.removeSelectListEntry = function(/*SelectListEntryImpl*/selectListEntry) {
            new ReplaceSelectListEntryCommand(this.parser,this.resolver).replaceSelectListEntry(selectListEntry,"");
        };

        return RemoveSelectListEntryCommand;
    }
);