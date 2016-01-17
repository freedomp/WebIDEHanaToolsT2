define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "rndrt/rnd"
    ], //dependencies
    function (
        ExpressionImpl,
        rnd
        ) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;
        function ArithmeticExpressionImpl() {
            ExpressionImpl.call(this);
        }
        ArithmeticExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ArithmeticExpressionImpl.prototype.left = null;
        ArithmeticExpressionImpl.prototype.right = null;
        ArithmeticExpressionImpl.OPERATOR_EDEFAULT = null;
        ArithmeticExpressionImpl.prototype.operator = ArithmeticExpressionImpl.OPERATOR_EDEFAULT;
        ArithmeticExpressionImpl.prototype.constructor = ArithmeticExpressionImpl;
        ArithmeticExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        ArithmeticExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ArithmeticExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        ArithmeticExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        ArithmeticExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight = this.right;
            this.right = newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ArithmeticExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight !== this.right) {
                this.basicSetRight(newRight);
            }
        };
        ArithmeticExpressionImpl.prototype.getOperator = function() {
            return this.operator;
        };
        ArithmeticExpressionImpl.prototype.setOperator = function(newOperator) {
            var oldOperator = this.operator;
            this.operator = newOperator;
        };
        ArithmeticExpressionImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(this.operator);
            result.append(")");
            return result.toString();
        };
        return ArithmeticExpressionImpl;
    }
);