define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/CaseExpressionImpl"
    ], //dependencies
    function (
        ExpressionImpl,
        CaseExpressionImpl
        ) {
        function SimpleCaseExpressionImpl() {
            CaseExpressionImpl.call(this);
        }
        SimpleCaseExpressionImpl.prototype = Object.create(CaseExpressionImpl.prototype);
        SimpleCaseExpressionImpl.prototype.caseExpression = null;
        SimpleCaseExpressionImpl.prototype.constructor = SimpleCaseExpressionImpl;
        SimpleCaseExpressionImpl.prototype.getCaseExpression = function() {
            return this.caseExpression;
        };
        SimpleCaseExpressionImpl.prototype.basicSetCaseExpression = function(newCaseExpression,msgs) {
            var oldCaseExpression = this.caseExpression;
            this.caseExpression = newCaseExpression;
            this.caseExpression.setContainer(this);
            return msgs;
        };
        SimpleCaseExpressionImpl.prototype.setCaseExpression = function(newCaseExpression) {
            if (newCaseExpression !== this.caseExpression) {
                this.basicSetCaseExpression(newCaseExpression);
            }
        };
        return SimpleCaseExpressionImpl;
    }
);