define(
    ["commonddl/astmodel/ExpressionImpl","rndrt/rnd"], //dependencies
    function (ExpressionImpl,rnd) {
        function ConcatenationExpressionImpl() {
            ExpressionImpl.call(this);
        }
        ConcatenationExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ConcatenationExpressionImpl.prototype.left = null;
        ConcatenationExpressionImpl.prototype.right = null;
        ConcatenationExpressionImpl.OPERATOR_EDEFAULT = null;
        ConcatenationExpressionImpl.prototype.operator = ConcatenationExpressionImpl.OPERATOR_EDEFAULT;
        ConcatenationExpressionImpl.prototype.constructor = ConcatenationExpressionImpl;
        ConcatenationExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        ConcatenationExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        ConcatenationExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        ConcatenationExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        ConcatenationExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight = this.right;
            this.right = newRight;
            this.right.setContainer(this);
            return msgs;
        };
        ConcatenationExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight !== this.right) {
                this.basicSetRight(newRight);
            }
        };
        ConcatenationExpressionImpl.prototype.getOperator = function() {
            return this.operator;
        };
        ConcatenationExpressionImpl.prototype.setOperator = function(newOperator) {
            var oldOperator = this.operator;
            this.operator = newOperator;
        };
        ConcatenationExpressionImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (operator: ");
            result.append(this.operator);
            result.append(")");
            return result.toString();
        };
        return ConcatenationExpressionImpl;
    }
);