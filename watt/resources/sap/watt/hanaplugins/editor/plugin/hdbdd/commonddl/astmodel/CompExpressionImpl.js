define(
    ["commonddl/astmodel/ExpressionImpl"], //dependencies
    function (ExpressionImpl) {
        function CompExpressionImpl() {
            ExpressionImpl.call(this);
        }
        CompExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        CompExpressionImpl.TYPE_EDEFAULT = null;
        CompExpressionImpl.TYPE_TOKEN_EDEFAULT = null;
        CompExpressionImpl.prototype.typeToken = CompExpressionImpl.TYPE_TOKEN_EDEFAULT;
        CompExpressionImpl.prototype.left = null;
        CompExpressionImpl.prototype.right = null;
        CompExpressionImpl.prototype.constructor = CompExpressionImpl;
        CompExpressionImpl.prototype.getType = function() {
            var tt = this.getTypeToken();
            /*eslint-disable no-eq-null*/
            if (tt != null) {
                return tt.m_lexem;
            }
            return null;
        };
        CompExpressionImpl.prototype.getTypeToken = function() {
            return this.typeToken;
        };
        CompExpressionImpl.prototype.setTypeToken = function(newTypeToken) {
            var oldTypeToken = this.typeToken;
            this.typeToken = newTypeToken;
        };
        CompExpressionImpl.prototype.getLeft = function() {
            return this.left;
        };
        CompExpressionImpl.prototype.basicSetLeft = function(newLeft,msgs) {
            var oldLeft = this.left;
            this.left = newLeft;
            this.left.setContainer(this);
            return msgs;
        };
        CompExpressionImpl.prototype.setLeft = function(newLeft) {
            if (newLeft !== this.left) {
                this.basicSetLeft(newLeft);
            }
        };
        CompExpressionImpl.prototype.getRight = function() {
            return this.right;
        };
        CompExpressionImpl.prototype.basicSetRight = function(newRight,msgs) {
            var oldRight = this.right;
            this.right = newRight;
            this.right.setContainer(this);
            return msgs;
        };
        CompExpressionImpl.prototype.setRight = function(newRight) {
            if (newRight !== this.right) {
                this.basicSetRight(newRight);
            }
        };
        CompExpressionImpl.prototype.toString = function() {
            return this.left.toString() + " " + this.getTypeToken().m_lexem + " " + this.right.toString();
        };
        return CompExpressionImpl;
    }
);