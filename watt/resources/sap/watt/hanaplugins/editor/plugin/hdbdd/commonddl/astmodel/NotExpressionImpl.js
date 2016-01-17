define(
    ["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        function NotExpressionImpl() {
            ExpressionImpl.call(this);
        }

        NotExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        NotExpressionImpl.prototype.cond = null;
        NotExpressionImpl.prototype.constructor = NotExpressionImpl;
        NotExpressionImpl.prototype.getCond = function () {
            return this.cond;
        };
        NotExpressionImpl.prototype.basicSetCond = function (newCond, msgs) {
            var oldCond = this.cond;
            this.cond = newCond;
            this.cond.setContainer(this);
            return msgs;
        };
        NotExpressionImpl.prototype.setCond = function (newCond) {
            if (newCond !== this.cond) {
                this.basicSetCond(newCond);
            }
        };
        return NotExpressionImpl;
    }
);