define(
    ["commonddl/astmodel/AttributeDeclarationImpl"], //dependencies
    function (AttributeDeclarationImpl) {
        function AnnotationDeclarationImpl() {
            AttributeDeclarationImpl.call(this);
        }
        AnnotationDeclarationImpl.prototype = Object.create(AttributeDeclarationImpl.prototype);
        AnnotationDeclarationImpl.prototype.compilationUnit = null;
        AnnotationDeclarationImpl.QUALIFIED_PATH_EDEFAULT = null;
        AnnotationDeclarationImpl.prototype.constructor = AnnotationDeclarationImpl;
        AnnotationDeclarationImpl.prototype.getCompilationUnit = function() {
            return this.compilationUnit;
        };
        AnnotationDeclarationImpl.prototype.basicGetCompilationUnit = function() {
            return this.compilationUnit;
        };
        AnnotationDeclarationImpl.prototype.setCompilationUnit = function(newCompilationUnit) {
            var oldCompilationUnit = this.compilationUnit;
            this.compilationUnit = newCompilationUnit;
        };
        AnnotationDeclarationImpl.prototype.getQualifiedPath = function() {
            return null;
        };
        return AnnotationDeclarationImpl;
    }
);