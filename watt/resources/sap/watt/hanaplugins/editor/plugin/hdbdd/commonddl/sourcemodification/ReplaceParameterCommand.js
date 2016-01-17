/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/astmodel/AnnotationRecordValueImpl","commonddl/sourcemodification/ReplaceAnnotationCommand"],
    function(rnd,SourceRangeImpl,AstMerger,AnnotationRecordValueImpl,ReplaceAnnotationCommand) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function ReplaceParameterCommand(parser, resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        /**
         */
        ReplaceParameterCommand.prototype.replaceParameter = function (/*ParameterImpl*/ parameter,/*string*/paramSource) {
            var cu = SourceRangeImpl.getCompilationUnit(parameter);
            var source = cu.getParsedSource();
            var start = parameter.getStartOffset();
            var end = parameter.getEndOffset();
            if (start < 0 || end < 0 || end < start) {
                throw new Error("start/end offset missing for given AST node");
            }
            if (paramSource == null || paramSource.length === 0) { //should be removed
                var comps = parameter.container.getParameters();
                var idx = comps.indexOf(parameter);
                if (idx > 0) {
                    start = ReplaceAnnotationCommand.getLeftIndex(source,",",start);
                }else {
                    if (comps.length === 1) {
                        //remove also "with parameters"
                        var idx1 = source.toLowerCase().indexOf("with parameters");
                        start = idx1;
                    }else{
                        end = ReplaceAnnotationCommand.getRightIndex(source,[","],end);
                    }
                }
            }
            var buf = new rnd.StringBuffer(source);
            buf.replace(start,end,paramSource);
            var result = buf.toString();

            var newAst = this.parser.parseAndGetAst3(this.resolver, null, result);
            cu = AstMerger.merge(cu,newAst);
            return parameter; // should be now updated
        };
        return ReplaceParameterCommand;
    }
);