/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc*/
define(["rndrt/rnd", "commonddl/sourcemodification/AddCaseStatementCommand","commonddl/astmodel/SourceRangeImpl",
        "commonddl/differ/AstMerger","commonddl/astmodel/CaseExpressionImpl"],
    function(rnd, AddCaseStatementCommand, SourceRangeImpl, AstMerger, CaseExpressionImpl) {
        var Token = rnd.Token;
        var Category = rnd.Category;
        var ErrorState = rnd.ErrorState;

        function UpdateCaseStatementCommand(parser,resolver) {
            this.parser = parser;
            this.resolver = resolver;
        }

        /**
         * returns the case expression as string for the given CaseExpressionImpl AST node
         * @param {CaseExpressionImpl} caseExpressionAstNode
         * @returns {string}
         */
        UpdateCaseStatementCommand.prototype.getCaseExpressionAsString = function(/*CaseExpressionImpl*/caseExpressionAstNode) {
            if (caseExpressionAstNode == null) {
                return null;
            }
            if (caseExpressionAstNode.getCaseExpression) {
                var expr = caseExpressionAstNode.getCaseExpression();
                var res = expr.getShortDescription();
                return res;
            }
            return null;
        };

        /**
         * returns the when expressions as string list/array for the given CaseExpressionImpl AST node
         * @param {CaseExpressionImpl} caseExpressionAstNode
         * @returns {string array}
         */
        UpdateCaseStatementCommand.prototype.getWhenExpressionsAsStringList = function(/*CaseExpressionImpl*/caseExpressionAstNode) {
            if (caseExpressionAstNode == null) {
                return null;
            }
            if (caseExpressionAstNode.getWhenExpressions) {
                var exprs = caseExpressionAstNode.getWhenExpressions();
                var res = [];
                for (var i = 0;i < exprs.length;i++) {
                    var when = exprs[i].getWhenExpression();
                    if (when == null) {
                        throw new Error();
                    }
                    var str = when.getShortDescription();
                    res.push(str);
                }
                return res;
            }
            return null;
        };

        /**
         * returns the then expressions as string list/array for the given CaseExpressionImpl AST node
         * @param {CaseExpressionImpl} caseExpressionAstNode
         * @returns {string array}
         */
        UpdateCaseStatementCommand.prototype.getThenExpressionsAsStringList = function(/*CaseExpressionImpl*/caseExpressionAstNode) {
            if (caseExpressionAstNode == null) {
                return null;
            }
            if (caseExpressionAstNode.getWhenExpressions) {
                var exprs = caseExpressionAstNode.getWhenExpressions();
                var res = [];
                for (var i = 0;i < exprs.length;i++) {
                    var then = exprs[i].getThenExpression();
                    if (then == null) {
                        throw new Error();
                    }
                    var str = then.getShortDescription();
                    res.push(str);
                }
                return res;
            }
            return null;
        };

        /**
         * returns the else expression as string for the given CaseExpressionImpl AST node
         * @param {CaseExpressionImpl} caseExpressionAstNode
         * @returns {string}
         */
        UpdateCaseStatementCommand.prototype.getElseExpressionAsString = function(/*CaseExpressionImpl*/caseExpressionAstNode) {
            if (caseExpressionAstNode == null) {
                return null;
            }
            if (caseExpressionAstNode.getElseExpression) {
                var elseExpr = caseExpressionAstNode.getElseExpression();
                var str = "";
                if (elseExpr != null) {
                    str = elseExpr.getShortDescription();
                }
                return str;
            }
            return null;
        };

        /**
         * update case statement; all values caseExpression, whenExpressions, thenExpressions and elseExpression are replaced with the ones defined in parameter list
         * @param {CaseExpressionImpl}
         * @param {string or null } caseExpression (if value is set, a simple case expression is created; if value is not set, a searched case expression is created)
         * @param {string array} whenExpressions - list of multiple when expression
         * @param {string array} thenExpressions - list of multiple then expression (index of thenExpression points to index of whenExpression)
         * @param {string optional or null} elseExpression - can be null
         * @returns nothing
         */
        UpdateCaseStatementCommand.prototype.updateCaseStatement = function(/*CaseExpressionImpl*/caseExpressionAstNode,
                                                                      /*string or null*/caseExpression,
                                                                      /*string array*/whenExpressions,
                                                                      /*string array*/thenExpressions,
                                                                      /*string optional or null*/elseExpression) {
            if (caseExpressionAstNode == null) {
                return null;
            }
            if (!(caseExpressionAstNode instanceof CaseExpressionImpl)) {
                throw new Error("parameter caseExpressionAstNode not instance of CaseExpressionImpl: " + caseExpressionAstNode);
            }
            if (whenExpressions == null || whenExpressions.length === 0 ||
                thenExpressions == null || thenExpressions.length === 0 ||
                whenExpressions.length !== thenExpressions.length) {
                throw new Error("whenExpressions and thenExpressions cannot be empty or must have same size in updateCaseStatement");
            }
            var cu = SourceRangeImpl.getCompilationUnit(caseExpressionAstNode);
            if (cu == null) {
                return null;
            }
            var source = cu.getParsedSource();
            var start = caseExpressionAstNode.getStartOffset();
            var end = caseExpressionAstNode.getEndOffset();
            if (start <= 0 || end <= 0) {
                return null;
            }
            var caseExpressionString = AddCaseStatementCommand.createEntryString(caseExpression,whenExpressions,thenExpressions,elseExpression);
            var buf = new rnd.StringBuffer(source);
            buf.replace(start,end,caseExpressionString);
            source = buf.toString();
            var newAst = this.parser.parseAndGetAst3(this.resolver, null, source);
            cu = AstMerger.merge(cu,newAst);
            return null;
        };

        return UpdateCaseStatementCommand;
    }
);