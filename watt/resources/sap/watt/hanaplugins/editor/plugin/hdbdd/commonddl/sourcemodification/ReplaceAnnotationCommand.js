/*eslint-disable eqeqeq,no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/astmodel/AnnotationRecordValueImpl"],
    function(rnd,SourceRangeImpl,AstMerger,AnnotationRecordValueImpl) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function ReplaceAnnotationCommand() {
        }

        /**
         * generic implementation, please use ModifyAnnotationForSelectListEntryCommand, ModifyAnnotationForViewDefinitionCommand
         */
        ReplaceAnnotationCommand.replaceAnnotation = function (parser,resolver,/*AbstractAnnotationImpl*/ node,/*string*/annotationString) {
            if (node == null) {
                return null;
            }
            var cu = SourceRangeImpl.getCompilationUnit(node);
            var source = cu.getParsedSource();
            var start = node.getStartOffset();
            var end = node.getEndOffset();
            if (start < 0 || end < 0 || end < start) {
                throw new Error("start/end offset missing for given AST node");
            }
            if (annotationString == null || annotationString.length === 0) { //should be removed
                if (node.container && node.container instanceof AnnotationRecordValueImpl) {
                    var comps = node.container.getComponents();
                    var idx = comps.indexOf(node);
                    if (idx > 0) {
                        start = ReplaceAnnotationCommand.getLeftIndex(source,",",start);
                    }else{
                        end = ReplaceAnnotationCommand.getRightIndex(source,[",","}"],end);
                    }
                }
            }
            var buf = new rnd.StringBuffer(source);
            buf.replace(start,end,annotationString);
            var result = buf.toString();

            var newAst = parser.parseAndGetAst3(resolver, null, result);
            cu = AstMerger.merge(cu,newAst);
            return node; // should be now updated
        };

        ReplaceAnnotationCommand.getLeftIndex = function (source, charParam, offset) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var ch = source.charAt(offset);
                if (ch == charParam) {
                    return offset;
                }
                offset--;
                if (offset <= 0) {
                    return 0;
                }
            }
        };

        ReplaceAnnotationCommand.getRightIndex = function (source, charArray, offset) {
            /*eslint-disable no-constant-condition*/
            while (true) {
                var ch = source.charAt(offset);
                for (var i = 0;i < charArray.length;i++) {
                    var charVar = charArray[i];
                    if (ch == charVar) {
                        return offset + 1;
                    }
                }
                offset++;
                if (offset >= source.length - 1) {
                    return source.length - 1;
                }
            }
        };

        return ReplaceAnnotationCommand;
    }
);