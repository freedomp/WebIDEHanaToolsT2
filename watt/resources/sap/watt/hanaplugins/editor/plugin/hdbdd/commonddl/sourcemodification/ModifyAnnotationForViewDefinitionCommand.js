define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function(rnd,SourceRangeImpl,AstMerger,ReplaceAnnotationCommand) {

        function ModifyAnnotationForViewDefinitionCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        ModifyAnnotationForViewDefinitionCommand.prototype.modifyAnnotation = function (/*AbstractAnnotationImpl*/annotation,
                                                                                         /*String*/annotationString) {

            ReplaceAnnotationCommand.replaceAnnotation(this.parser,this.resolver,annotation,annotationString);
            return annotation;
        };

        return ModifyAnnotationForViewDefinitionCommand;
    }
);