define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function(rnd,SourceRangeImpl,AstMerger,ReplaceAnnotationCommand) {

        function ModifyAnnotationForSelectListEntryCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        ModifyAnnotationForSelectListEntryCommand.prototype.modifyAnnotation = function (/*AbstractAnnotationImpl*/annotation,
                                                                                         /*String*/annotationString) {
            ReplaceAnnotationCommand.replaceAnnotation(this.parser,this.resolver,annotation,annotationString);
            return annotation;
        };

        return ModifyAnnotationForSelectListEntryCommand;
    }
);