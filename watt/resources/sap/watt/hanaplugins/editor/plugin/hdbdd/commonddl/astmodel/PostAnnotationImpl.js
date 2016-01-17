define(
    [
        "commonddl/astmodel/AbstractAnnotationImpl"
    ], //dependencies
    function (
        AbstractAnnotationImpl
        ) {
        function PostAnnotationImpl() {
            AbstractAnnotationImpl.call(this);
        }
        PostAnnotationImpl.prototype = Object.create(AbstractAnnotationImpl.prototype);
        PostAnnotationImpl.prototype.constructor = PostAnnotationImpl;
        return PostAnnotationImpl;
    }
);