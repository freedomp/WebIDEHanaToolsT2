define(
    ["commonddl/astmodel/AbstractAnnotationValueImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (AbstractAnnotationValueImpl,EObjectContainmentEList) {
        function AnnotationRecordValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationRecordValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationRecordValueImpl.prototype.components = null;
        AnnotationRecordValueImpl.prototype.constructor = AnnotationRecordValueImpl;
        AnnotationRecordValueImpl.prototype.getComponents = function() {
            /*eslint-disable no-eq-null*/
            if (this.components == null) {
                this.components = new EObjectContainmentEList(this);
            }
            return this.components;
        };
        return AnnotationRecordValueImpl;
    }
);