define(
    ["commonddl/astmodel/SourceRangeImpl"], //dependencies
    function (SourceRangeImpl) {
        function AbstractAnnotationValueImpl() {
            SourceRangeImpl.call(this);
        }
        AbstractAnnotationValueImpl.prototype = Object.create(SourceRangeImpl.prototype);
        AbstractAnnotationValueImpl.prototype.constructor = AbstractAnnotationValueImpl;
        return AbstractAnnotationValueImpl;
    }
);