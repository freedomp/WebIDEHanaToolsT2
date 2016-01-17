define(
    ["commonddl/astmodel/TypeDeclarationImpl"], //dependencies
    function (TypeDeclarationImpl) {
        function AnonymousTypeDeclarationImpl() {
            TypeDeclarationImpl.call(this);
        }
        AnonymousTypeDeclarationImpl.prototype = Object.create(TypeDeclarationImpl.prototype);
        AnonymousTypeDeclarationImpl.prototype.constructor = AnonymousTypeDeclarationImpl;

        return AnonymousTypeDeclarationImpl;
    }
);