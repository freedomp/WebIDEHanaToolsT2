/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//1273c5e1d593893ba88592838cfb444a7061c399 New AST nodes for nested select lists
define(
    ["commonddl/astmodel/EObjectImpl", "commonddl/astmodel/EObjectContainmentEList", "rndrt/rnd",
        "commonddl/astmodel/ExpressionImpl"], //dependencies
    function (EObjectImpl, EObjectContainmentEList, rnd, ExpressionImpl) {
        function PathDeclarationImpl() {
            EObjectImpl.call(this);
        }

        PathDeclarationImpl.prototype = Object.create(EObjectImpl.prototype);
        PathDeclarationImpl.prototype.constructor = PathDeclarationImpl;
        PathDeclarationImpl.prototype.pathEntries = null;
        PathDeclarationImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT = null;
        PathDeclarationImpl.prototype.lastNamespaceComponentIndex = PathDeclarationImpl.LAST_NAMESPACE_COMPONENT_INDEX_EDEFAULT;
        PathDeclarationImpl.prototype.getPathEntries = function () {
            if (this.pathEntries == null) {
                this.pathEntries = new EObjectContainmentEList(this);
            }
            return this.pathEntries;
        };
        PathDeclarationImpl.prototype.getLastNamespaceComponentIndex = function () {
            return this.lastNamespaceComponentIndex;
        };
        PathDeclarationImpl.prototype.setLastNamespaceComponentIndex = function (newLastNamespaceComponentIndex) {
            var oldLastNamespaceComponentIndex = this.lastNamespaceComponentIndex;
            this.lastNamespaceComponentIndex = newLastNamespaceComponentIndex;
        };
        PathDeclarationImpl.prototype.toString = function () {
            return this.getPathString(true);
        };
        PathDeclarationImpl.prototype.getPathString = function (withFilters) {
            return ExpressionImpl.getPathString(this.getEntries(), withFilters);
        };
        PathDeclarationImpl.prototype.getEntries = function () {
            return ExpressionImpl.getEntries(this.getPathEntries());
        };
        return PathDeclarationImpl;
    }
);