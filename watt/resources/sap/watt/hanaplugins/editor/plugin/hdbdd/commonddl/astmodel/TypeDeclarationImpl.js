define(
    ["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        function TypeDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        TypeDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        TypeDeclarationImpl.prototype.annotationList = null;
        TypeDeclarationImpl.prototype.constructor = TypeDeclarationImpl;
        TypeDeclarationImpl.prototype.getAnnotationList = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        return TypeDeclarationImpl;
    }
);