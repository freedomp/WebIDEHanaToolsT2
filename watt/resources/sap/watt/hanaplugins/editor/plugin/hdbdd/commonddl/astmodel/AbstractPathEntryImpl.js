/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    [
        "commonddl/astmodel/EObjectImpl"
    ], //dependencies
    function (
        EObjectImpl
        ) {
        function AbstractPathEntryImpl() {
            EObjectImpl.call(this);
        }
        AbstractPathEntryImpl.prototype = Object.create(EObjectImpl.prototype);
        AbstractPathEntryImpl.prototype.constructor = AbstractPathEntryImpl;
        return AbstractPathEntryImpl;
    }
);