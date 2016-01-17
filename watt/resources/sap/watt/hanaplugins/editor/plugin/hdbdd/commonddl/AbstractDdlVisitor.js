define(
    [], //dependencies
    function () {
        function AbstractDdlVisitor() {
        }
        AbstractDdlVisitor.prototype.visitSimpleDataSource = function(ds) {
        };
        AbstractDdlVisitor.prototype.visitPathExpression = function(path) {
        };
        AbstractDdlVisitor.prototype.visitTypeUsage = function(namespace,name) {
        };
        AbstractDdlVisitor.prototype.visitIncompleteTypeUsage = function(namespace,name) {
        };
        return AbstractDdlVisitor;
    }
);