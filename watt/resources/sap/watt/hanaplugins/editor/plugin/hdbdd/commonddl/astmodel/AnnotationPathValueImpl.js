/* based on commit
 * 49683abaa8f3892cce0c444f268c430996e638a0 Enhance AST to Support References to Constants in Annotation Values
 */
define(["commonddl/astmodel/AbstractAnnotationValueImpl"

], // dependencies
function(AbstractAnnotationValueImpl

) {
    function AnnotationPathValueImpl() {
        AbstractAnnotationValueImpl.call(this);
    }
    AnnotationPathValueImpl.prototype = Object.create(AbstractAnnotationValueImpl.prototype);
    AnnotationPathValueImpl.prototype.namePath = null;
    AnnotationPathValueImpl.prototype.constructor = AnnotationPathValueImpl;
    AnnotationPathValueImpl.prototype.getNamePath = function() {
        return this.namePath;
    };
    AnnotationPathValueImpl.prototype.basicSetNamePath = function(newNamePath, msgs) {
        var oldNamePath = this.namePath;
        this.namePath = newNamePath;
        return msgs;
    };
    AnnotationPathValueImpl.prototype.setNamePath = function(newNamePath) {
        if (newNamePath !== this.namePath) {
            this.basicSetNamePath(newNamePath);
        }
    };
    return AnnotationPathValueImpl;
});