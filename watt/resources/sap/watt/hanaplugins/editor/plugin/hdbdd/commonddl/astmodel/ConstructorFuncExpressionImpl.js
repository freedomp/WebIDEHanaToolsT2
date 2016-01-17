/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//583ac20c0c8fe14ce2536413c1b7e50a5f038d5a New AST nodes
define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/ExpressionImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ], //dependencies
    function (rnd, ExpressionImpl, EObjectContainmentEList) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;

        function ConstructorFuncExpressionImpl() {
            ExpressionImpl.call(this);
        }

        ConstructorFuncExpressionImpl.prototype = Object.create(ExpressionImpl.prototype);
        ConstructorFuncExpressionImpl.prototype.constructor = ConstructorFuncExpressionImpl;
        ConstructorFuncExpressionImpl.NEW_KEYWORD_EDEFAULT = null;
        ConstructorFuncExpressionImpl.prototype.newKeyword = ConstructorFuncExpressionImpl.NEW_KEYWORD_EDEFAULT;
        ConstructorFuncExpressionImpl.NAME_EDEFAULT = null;
        ConstructorFuncExpressionImpl.prototype.name = ConstructorFuncExpressionImpl.NAME_EDEFAULT;
        ConstructorFuncExpressionImpl.prototype.parameters = null;
        ConstructorFuncExpressionImpl.prototype.getNewKeyword = function () {
            return this.newKeyword;
        };
        ConstructorFuncExpressionImpl.prototype.setNewKeyword = function (newNewKeyword) {
            var oldNewKeyword = this.newKeyword;
            this.newKeyword = newNewKeyword;
        };
        ConstructorFuncExpressionImpl.prototype.getName = function () {
            return this.name;
        };
        ConstructorFuncExpressionImpl.prototype.setName = function (newName) {
            var oldName = this.name;
            this.name = newName;
        };
        ConstructorFuncExpressionImpl.prototype.getParameters = function () {
            if (this.parameters == null) {
                this.parameters = new EObjectContainmentEList(this);
            }
            return this.parameters;
        };
        ConstructorFuncExpressionImpl.prototype.toString = function () {
            var result = new StringBuffer(ExpressionImpl.prototype.toString.call(this));
            result.append(" (newKeyword: ");
            result.append(this.newKeyword);
            result.append(", name: ");
            result.append(this.name);
            result.append(')');
            return result.toString();
        };
        return ConstructorFuncExpressionImpl;
    }
);