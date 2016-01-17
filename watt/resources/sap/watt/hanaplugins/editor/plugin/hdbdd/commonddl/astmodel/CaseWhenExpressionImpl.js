define(
    [
        "commonddl/astmodel/ExpressionImpl"
    ], //dependencies
    function (
        ExpressionImpl
        ) {
        function CaseWhenExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CaseWhenExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CaseWhenExpressionImpl.prototype.whenExpression = null;
        CaseWhenExpressionImpl.prototype.thenExpression = null;
        CaseWhenExpressionImpl.prototype.constructor = CaseWhenExpressionImpl;
        CaseWhenExpressionImpl.prototype.getWhenExpression = function() {
            return this.whenExpression;
        };
        CaseWhenExpressionImpl.prototype.basicSetWhenExpression = function(newWhenExpression,msgs) {
            var oldWhenExpression = this.whenExpression;
            this.whenExpression = newWhenExpression;
            this.whenExpression.setContainer(this);
            return msgs;
        };
        CaseWhenExpressionImpl.prototype.setWhenExpression = function(newWhenExpression) {
            if (newWhenExpression !== this.whenExpression) {
                this.basicSetWhenExpression(newWhenExpression);
            }
        };
        CaseWhenExpressionImpl.prototype.getThenExpression = function() {
            return this.thenExpression;
        };
        CaseWhenExpressionImpl.prototype.basicSetThenExpression = function(newThenExpression,msgs) {
            var oldThenExpression = this.thenExpression;
            this.thenExpression = newThenExpression;
            this.thenExpression.setContainer(this);
            return msgs;
        };
        CaseWhenExpressionImpl.prototype.setThenExpression = function(newThenExpression) {
            if (newThenExpression !== this.thenExpression) {
                this.basicSetThenExpression(newThenExpression);
            }
        };
        return CaseWhenExpressionImpl;
    }
);