/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd","commonddl/astmodel/SourceRangeImpl","commonddl/differ/AstMerger","commonddl/sourcemodification/IndentUtil"],
    function(rnd,SourceRangeImpl,AstMerger,IndentUtil) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;
        var Utils = rnd.Utils;

        function AddAnnotationCommand() {
        }

        /**
         */
        AddAnnotationCommand.addAnnotation = function (parser,resolver,/*AstNode*/ node, /*string*/annotationString) {
            /*eslint-disable no-eq-null*/
            if (node == null) {
                return;
            }
            var cu = SourceRangeImpl.getCompilationUnit(node);
            var source = cu.getParsedSource();
            var offset = node.getStartOffset();
            var indentString = IndentUtil.getLineIndention(source,offset);

            var buf = new rnd.StringBuffer(source);
            buf.replace(offset, offset, annotationString + "\r\n" + indentString);
            var result = buf.toString();

            var newAst = parser.parseAndGetAst3(resolver, null, result);
            cu = AstMerger.merge(cu,newAst);
            /*eslint-disable consistent-return*/
            return node; // should be now updated
        };

        return AddAnnotationCommand;
    }
);