/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    [
        "rndrt/rnd",
        "commonddl/astmodel/NestedSelectListPathEntryImpl"
    ], //dependencies
    function (rnd, NestedSelectListPathEntryImpl) {
        var Token = rnd.Token;
        var StringBuffer = rnd.StringBuffer;

        function NestedFlattenedSelectListPathEntryImpl() {
            NestedSelectListPathEntryImpl.call(this);
        }

        NestedFlattenedSelectListPathEntryImpl.prototype = Object.create(NestedSelectListPathEntryImpl.prototype);
        NestedFlattenedSelectListPathEntryImpl.prototype.constructor = NestedFlattenedSelectListPathEntryImpl;
        NestedFlattenedSelectListPathEntryImpl.FLATTEN_KEYWORD_EDEFAULT = null;
        NestedFlattenedSelectListPathEntryImpl.prototype.flattenKeyword = NestedFlattenedSelectListPathEntryImpl.FLATTEN_KEYWORD_EDEFAULT;
        NestedFlattenedSelectListPathEntryImpl.prototype.getFlattenKeyword = function () {
            return this.flattenKeyword;
        };
        NestedFlattenedSelectListPathEntryImpl.prototype.setFlattenKeyword = function (newFlattenKeyword) {
            var oldFlattenKeyword = this.flattenKeyword;
            this.flattenKeyword = newFlattenKeyword;
        };
        NestedFlattenedSelectListPathEntryImpl.prototype.toString = function () {
            var result = new StringBuffer(NestedSelectListPathEntryImpl.prototype.toString.call(this));
            result.append(" (flattenKeyword: ");
            result.append(this.flattenKeyword);
            result.append(')');
            return result.toString();
        };
        return NestedFlattenedSelectListPathEntryImpl;
    }
);