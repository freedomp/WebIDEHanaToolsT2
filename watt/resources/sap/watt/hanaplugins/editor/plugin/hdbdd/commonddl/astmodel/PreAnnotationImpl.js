define(
    ["commonddl/astmodel/AbstractAnnotationImpl"], //dependencies
    function (AbstractAnnotationImpl) {
        function PreAnnotationImpl() {
            AbstractAnnotationImpl.call(this);
        }
        PreAnnotationImpl.prototype = Object.create(AbstractAnnotationImpl.prototype);
        PreAnnotationImpl.prototype.constructor = PreAnnotationImpl;
        return PreAnnotationImpl;
    }
);