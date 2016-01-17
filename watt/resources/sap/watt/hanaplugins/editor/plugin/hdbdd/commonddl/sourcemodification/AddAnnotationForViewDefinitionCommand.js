/*eslint-disable no-eq-null,no-multi-spaces*/
define(["rndrt/rnd", "commonddl/sourcemodification/AddAnnotationCommand"],
    function(rnd, AddAnnotationCommand) {

        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        function AddAnnotationForViewDefinitionCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        AddAnnotationForViewDefinitionCommand.prototype.addAnnotation = function(/*ViewDefinitionImpl*/viewDef,/*String*/annotationString) {
            AddAnnotationCommand.addAnnotation(this.parser,this.resolver,viewDef,annotationString);
            //return the new ast node
            if (viewDef != null) {
                var newAnnots = viewDef.getAnnotationList();
                return newAnnots[newAnnots.length - 1];
            }
        };

        return AddAnnotationForViewDefinitionCommand;
    }
);
