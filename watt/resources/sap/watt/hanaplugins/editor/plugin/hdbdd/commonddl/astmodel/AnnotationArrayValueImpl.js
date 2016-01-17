define(
    ["commonddl/astmodel/AbstractAnnotationValueImpl","commonddl/astmodel/EObjectContainmentEList"], //dependencies
    function (AbstractAnnotationValueImpl,EObjectContainmentEList) {
        function AnnotationArrayValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationArrayValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationArrayValueImpl.prototype.values = null;
        AnnotationArrayValueImpl.prototype.constructor = AnnotationArrayValueImpl;
        AnnotationArrayValueImpl.prototype.getValues = function() {
            /*eslint-disable no-eq-null*/
            if (this.values == null) {
                this.values = new EObjectContainmentEList(this);
            }
            return this.values;
        };
        return AnnotationArrayValueImpl;
    }
);