define(
    ["commonddl/astmodel/DdlStatementImpl"], //dependencies
    function (DdlStatementImpl) {
        function NamespaceDeclarationImpl() {
            DdlStatementImpl.call(this);
        }
        NamespaceDeclarationImpl.prototype = Object.create(DdlStatementImpl.prototype);
        NamespaceDeclarationImpl.prototype.constructor = NamespaceDeclarationImpl;
        return NamespaceDeclarationImpl;
    }
);