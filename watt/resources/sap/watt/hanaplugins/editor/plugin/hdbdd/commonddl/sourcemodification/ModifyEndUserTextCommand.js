define(["rndrt/rnd", "commonddl/astmodel/IAstFactory","commonddl/astmodel/ViewDefinitionImpl","commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function(rnd, IAstFactory,ViewDefinitionImpl,ReplaceAnnotationCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function ModifyEndUserTextCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        ModifyEndUserTextCommand.prototype.modifyLabel = function(/*ViewDefinitionImpl*/viewDef,
                                                                  /*String*/newLabel) {
            if (!(viewDef instanceof ViewDefinitionImpl)) {
                throw new Error();
            }
            newLabel = rnd.Utils.stringReplaceAll(newLabel,"'","''"); // quotes needs to be added two times in string literals
            var annots = viewDef.getAnnotationList();
            for (var i = 0;i < annots.length;i++) {
                var p = this.getNamePath(annots[i]);
                if ("EndUserText" === p) {
                    var v = annots[i].getValue();
                    var components = v.getComponents();
                    for (var j = 0;j < components.length;j++) {
                        p = this.getNamePath(components[j]);
                        if ("label" === p) {
                            ReplaceAnnotationCommand.replaceAnnotation(this.parser,this.resolver,components[j].getValue(),"'" + newLabel + "'");
                            return annots[i];
                        }
                    }
                }else if ("EndUserText.label" === p) {
                    ReplaceAnnotationCommand.replaceAnnotation(this.parser,this.resolver,annots[i].getValue(),"'" + newLabel + "'");
                    return annots[i];
                }
            }
        };

        ModifyEndUserTextCommand.prototype.getNamePath = function(annot) {
            var path = annot.getNameTokenPath();
            var res = new rnd.StringBuffer();
            for (var i = 0;i < path.length;i++) {
                res.append(path[i].m_lexem);
            }
            return res.toString();
        };

        return ModifyEndUserTextCommand;
    }
);