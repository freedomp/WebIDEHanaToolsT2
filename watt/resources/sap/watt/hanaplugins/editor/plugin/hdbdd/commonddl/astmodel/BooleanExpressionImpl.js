define(
    ["rndrt/rnd","commonddl/astmodel/ExpressionImpl","commonddl/astmodel/BooleanType","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (rnd,ExpressionImpl,BooleanType,EObjectContainmentEList) {
        function BooleanExpressionImpl() {
            ExpressionImpl.call(this);
        }
        BooleanExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        BooleanExpressionImpl.TYPE_EDEFAULT = BooleanType.AND;
        BooleanExpressionImpl.prototype.type = BooleanExpressionImpl.TYPE_EDEFAULT;
        BooleanExpressionImpl.prototype.conditions = null;
        BooleanExpressionImpl.OPEN_BRACKET_EDEFAULT = null;
        BooleanExpressionImpl.prototype.openBracket = BooleanExpressionImpl.OPEN_BRACKET_EDEFAULT;
        BooleanExpressionImpl.CLOSE_BRACKET_EDEFAULT = null;
        BooleanExpressionImpl.prototype.closeBracket = BooleanExpressionImpl.CLOSE_BRACKET_EDEFAULT;
        BooleanExpressionImpl.prototype.constructor = BooleanExpressionImpl;

        BooleanExpressionImpl.prototype.getType = function() {
            return this.type;
        };
        BooleanExpressionImpl.prototype.setType = function(newType) {
            var oldType = this.type;
            /*eslint-disable no-eq-null*/
            this.type = newType == null ? BooleanExpressionImpl.TYPE_EDEFAULT : newType;
        };
        BooleanExpressionImpl.prototype.getConditions = function() {
            /*eslint-disable no-eq-null*/
            if (this.conditions == null) {
                this.conditions = new EObjectContainmentEList(this);
            }
            return this.conditions;
        };
        BooleanExpressionImpl.prototype.getOpenBracket = function() {
            return this.openBracket;
        };
        BooleanExpressionImpl.prototype.setOpenBracket = function(newOpenBracket) {
            var oldOpenBracket = this.openBracket;
            this.openBracket = newOpenBracket;
        };
        BooleanExpressionImpl.prototype.getCloseBracket = function() {
            return this.closeBracket;
        };
        BooleanExpressionImpl.prototype.setCloseBracket = function(newCloseBracket) {
            var oldCloseBracket = this.closeBracket;
            this.closeBracket = newCloseBracket;
        };
        BooleanExpressionImpl.prototype.addConditionExpression = function(ex) {
            this.getConditions().push(ex);
        };
        BooleanExpressionImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (type: ");
            result.append(this.type);
            result.append(", openBracket: ");
            result.append(this.openBracket);
            result.append(", closeBracket: ");
            result.append(this.closeBracket);
            result.append(")");
            return result.toString();
        };
        return BooleanExpressionImpl;
    }
);