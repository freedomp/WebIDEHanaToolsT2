define(["../../rndrt/rnd","commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function(rnd,ReplaceAnnotationCommand) {
        function RemoveAnnotationCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        RemoveAnnotationCommand.prototype.removeAnnotation = function (/*AbstractAnnotationImpl*/astNode) {
            ReplaceAnnotationCommand.replaceAnnotation(this.parser,this.resolver,astNode,"");
        };

        return RemoveAnnotationCommand;
    }
);