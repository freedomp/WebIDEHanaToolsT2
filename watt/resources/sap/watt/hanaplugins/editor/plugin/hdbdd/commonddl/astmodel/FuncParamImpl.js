define(
    [
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/SourceRangeImpl",
        "rndrt/rnd"
    ], //dependencies
    function (ExpressionImpl,
              SourceRangeImpl,
              rnd) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;

        function FuncParamImpl() {
            SourceRangeImpl.call(this);
        }
        FuncParamImpl.prototype = Object.create(SourceRangeImpl.prototype);
        FuncParamImpl.NAME_EDEFAULT = null;
        FuncParamImpl.prototype.name = FuncParamImpl.NAME_EDEFAULT;
        FuncParamImpl.prototype.expression = null;
        FuncParamImpl.prototype.constructor = FuncParamImpl;
        FuncParamImpl.prototype.getName = function () {
            return this.name;
        };
        FuncParamImpl.prototype.setName = function (newName) {
            var oldName = this.name;
            this.name = newName;
        };
        FuncParamImpl.prototype.getExpression = function () {
            return this.expression;
        };
        FuncParamImpl.prototype.basicSetExpression = function (newExpression, msgs) {
            var oldExpression = this.expression;
            this.expression = newExpression;
            this.expression.setContainer(this);
            return msgs;
        };
        FuncParamImpl.prototype.setExpression = function (newExpression) {
            if (newExpression !== this.expression) {
                this.basicSetExpression(newExpression);
            }
        };
        FuncParamImpl.prototype.toString = function () {
            var result = new StringBuffer(SourceRangeImpl.prototype.toString.call(this));
            result.append(" (name: ");
            result.append(this.name);
            result.append(")");
            return result.toString();
        };
        return FuncParamImpl;
    }
);