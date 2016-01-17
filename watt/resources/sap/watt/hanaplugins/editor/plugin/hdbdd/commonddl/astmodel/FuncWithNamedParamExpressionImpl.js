define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (rnd,
              ExpressionImpl,
              EObjectContainmentEList) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;

        function FuncWithNamedParamExpressionImpl() {
            ExpressionImpl.call(this);
        }
        FuncWithNamedParamExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        FuncWithNamedParamExpressionImpl.NAME_EDEFAULT = null;
        FuncWithNamedParamExpressionImpl.prototype.name = FuncWithNamedParamExpressionImpl.NAME_EDEFAULT;
        FuncWithNamedParamExpressionImpl.prototype.parameters = null;
        FuncWithNamedParamExpressionImpl.prototype.constructor = FuncWithNamedParamExpressionImpl;
        FuncWithNamedParamExpressionImpl.prototype.getName = function () {
            return this.name;
        };
        FuncWithNamedParamExpressionImpl.prototype.setName = function (newName) {
            var oldName = this.name;
            this.name = newName;
        };
        FuncWithNamedParamExpressionImpl.prototype.getParameters = function () {
            /*eslint-disable no-eq-null*/
            if (this.parameters == null) {
                this.parameters = new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        return FuncWithNamedParamExpressionImpl;
    }
);