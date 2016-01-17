define(
    [], //dependencies
    function () {

        function DdlCompletionScope(n) {
            this.na = n;
        }
        DdlCompletionScope.COLUMNS = new DdlCompletionScope("COLUMNS");
        DdlCompletionScope.ASSOCIATIONS = new DdlCompletionScope("ASSOCIATIONS");
        DdlCompletionScope.COLUMNS_AND_ASSOCIATIONS = new DdlCompletionScope("COLUMNS_AND_ASSOCIATIONS");
        DdlCompletionScope.ENTITY_DEFINITIONS = new DdlCompletionScope("ENTITY_DEFINITIONS");
        DdlCompletionScope.SQLVIEW_DEFINITIONS = new DdlCompletionScope("SQLVIEW_DEFINITIONS");

        DdlCompletionScope.prototype.name = function () {
            return this.na;
        };

        return DdlCompletionScope;
    }
);