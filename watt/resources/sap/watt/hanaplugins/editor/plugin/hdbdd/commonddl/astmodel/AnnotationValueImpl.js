define(
    ["commonddl/astmodel/AbstractAnnotationValueImpl","rndrt/rnd"], //dependencies
    function (AbstractAnnotationValueImpl,rnd) {
        function AnnotationValueImpl() {
            AbstractAnnotationValueImpl.call(this);
        }
        AnnotationValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
        AnnotationValueImpl.VALUE_TOKEN_EDEFAULT = null;
        AnnotationValueImpl.prototype.valueToken = AnnotationValueImpl.VALUE_TOKEN_EDEFAULT;
        AnnotationValueImpl.prototype.constructor = AnnotationValueImpl;
        AnnotationValueImpl.prototype.getValueToken = function() {
            return this.valueToken;
        };
        AnnotationValueImpl.prototype.setValueToken = function(newValueToken) {
            var oldValueToken = this.valueToken;
            this.valueToken = newValueToken;
        };
        AnnotationValueImpl.prototype.toString = function() {
            var result = new rnd.StringBuffer(AbstractAnnotationValueImpl.prototype.toString.call(this));
            result.append(" (valueToken: ");
            result.append(this.valueToken);
            result.append(")");
            return result.toString();
        };
        return AnnotationValueImpl;
    }
);