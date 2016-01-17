define(
    ["commonddl/astmodel/ComponentDeclarationImpl"], //dependencies
    function (ComponentDeclarationImpl) {
        function EntityDeclarationImpl() {
            ComponentDeclarationImpl.call(this);
        }
        EntityDeclarationImpl.prototype = Object.create(ComponentDeclarationImpl.prototype);
        EntityDeclarationImpl.prototype.annotationList = null;
        EntityDeclarationImpl.prototype.constructor = EntityDeclarationImpl;
        EntityDeclarationImpl.prototype.getAnnotationList = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        return EntityDeclarationImpl;
    }
);