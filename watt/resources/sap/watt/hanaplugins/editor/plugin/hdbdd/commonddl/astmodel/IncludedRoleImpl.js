/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//e3f9c257a2b706a485b86bfe8f9254a02bb4cc92 DDL: improve EMF model for table-function
define(
    [
        "commonddl/astmodel/RoleComponentDeclarationImpl"
    ], //dependencies
    function (
        RoleComponentDeclarationImpl
        ) {
        function IncludedRoleImpl() {
            RoleComponentDeclarationImpl.call(this);
        }
        IncludedRoleImpl.prototype = Object.create(RoleComponentDeclarationImpl.prototype);
        IncludedRoleImpl.prototype.constructor = IncludedRoleImpl;
        IncludedRoleImpl.prototype.name = null;
        IncludedRoleImpl.prototype.getName = function() {
            return this.name;
        };
        IncludedRoleImpl.prototype.basicGetName = function() {
            return this.name;
        };
        IncludedRoleImpl.prototype.setName = function(newName) {
            var oldName = this.name;
            this.name = newName;
        };
        return IncludedRoleImpl;
    }
);