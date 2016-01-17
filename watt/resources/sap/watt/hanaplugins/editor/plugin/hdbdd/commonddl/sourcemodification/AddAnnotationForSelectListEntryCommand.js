/*eslint-disable no-eq-null,no-multi-spaces*/
define(["rndrt/rnd",
         "commonddl/sourcemodification/AddAnnotationCommand"],
    function(rnd, AddAnnotationCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        function AddAnnotationForSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        AddAnnotationForSelectListEntryCommand.prototype.addAnnotation = function(/*SelectListEntryImpl*/selectListEntry, /*String*/annotationString) {
            AddAnnotationCommand.addAnnotation(this.parser,this.resolver,selectListEntry,annotationString);
            //return the new ast node
            if (selectListEntry != null) {
                var newAnnots = selectListEntry.getAnnotationList();
                return newAnnots[0]; // the new annotation is always added at first position
            }
        };

        return AddAnnotationForSelectListEntryCommand;
    }
);