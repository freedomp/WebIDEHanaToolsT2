define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (
        ExpressionImpl,
        EObjectContainmentEList
        ) {
        function CaseExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CaseExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CaseExpressionImpl.prototype.elseExpression = null;
        CaseExpressionImpl.prototype.whenExpressions = null;
        CaseExpressionImpl.prototype.constructor = CaseExpressionImpl;
        CaseExpressionImpl.prototype.getElseExpression = function() {
            return this.elseExpression;
        };
        CaseExpressionImpl.prototype.basicSetElseExpression = function(newElseExpression,msgs) {
            var oldElseExpression = this.elseExpression;
            this.elseExpression = newElseExpression;
            this.elseExpression.setContainer(this);
            return msgs;
        };
        CaseExpressionImpl.prototype.setElseExpression = function(newElseExpression) {
            if (newElseExpression !== this.elseExpression) {
                this.basicSetElseExpression(newElseExpression);
            }
        };
        CaseExpressionImpl.prototype.getWhenExpressions = function() {
            /*eslint-disable no-eq-null*/
            if (this.whenExpressions == null) {
                this.whenExpressions = new EObjectContainmentEList(this);
            }
            return this.whenExpressions;
        };
        return CaseExpressionImpl;
    }
);