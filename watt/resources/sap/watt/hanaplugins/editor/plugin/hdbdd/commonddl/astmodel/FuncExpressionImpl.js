define(
    ["rndrt/rnd", "commonddl/astmodel/ExpressionImpl", "commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (rnd, ExpressionImpl, EObjectContainmentEList) {
        function FuncExpressionImpl() {
            ExpressionImpl.call(this);
        }
        FuncExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        FuncExpressionImpl.NAME_EDEFAULT = null;
        FuncExpressionImpl.prototype.name = FuncExpressionImpl.NAME_EDEFAULT;
        FuncExpressionImpl.prototype.parameters = null;
        FuncExpressionImpl.prototype.constructor = FuncExpressionImpl;
        FuncExpressionImpl.prototype.getName = function () {
            return this.name;
        };
        FuncExpressionImpl.prototype.setName = function (newName) {
            var oldName = this.name;
            this.name = newName;
        };
        FuncExpressionImpl.prototype.getParameters = function () {
            /*eslint-disable no-eq-null*/
            if (this.parameters == null) {
                this.parameters = new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        FuncExpressionImpl.prototype.toString = function () {
            var result = new rnd.StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(this.name);
            result.append(")");
            return result.toString();
        };
        return FuncExpressionImpl;
    }
);