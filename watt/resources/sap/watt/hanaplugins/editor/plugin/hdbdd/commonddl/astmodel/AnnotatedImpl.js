define(
    ["commonddl/astmodel/EObjectImpl"], //dependencies
    function (EObjectImpl) {
        function AnnotatedImpl() {
            EObjectImpl.call(this);
        }
        AnnotatedImpl.prototype = Object.create(EObjectImpl.prototype);
        AnnotatedImpl.prototype.annotationList = null;
        AnnotatedImpl.prototype.constructor = AnnotatedImpl;
        AnnotatedImpl.prototype.getAnnotationList = function() {
            /*eslint-disable no-eq-null*/
            if (this.annotationList == null) {
                this.annotationList = [];
            }
            return this.annotationList;
        };
        return AnnotatedImpl;
    }
);