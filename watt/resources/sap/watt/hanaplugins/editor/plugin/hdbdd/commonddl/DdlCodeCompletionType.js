define(
    [], //dependencies
    function () {


        function DdlCodeCompletionType(sortValue,nam) {
            this.value = sortValue;
            this.name = nam;
        }
        DdlCodeCompletionType.INSERT_ALL_ELEMENTS = new DdlCodeCompletionType(200,"INSERT_ALL_ELEMENTS");
        DdlCodeCompletionType.PARAMETER = new DdlCodeCompletionType(300,"PARAMETER");
        DdlCodeCompletionType.DATASOURCE = new DdlCodeCompletionType(300,"DATASOURCE");
        DdlCodeCompletionType.ASSOCIATION = new DdlCodeCompletionType(300, "ASSOCIATION");
        DdlCodeCompletionType.COLUMN = new DdlCodeCompletionType(300, "COLUMN");
        DdlCodeCompletionType.DATA_TYPE = new DdlCodeCompletionType(300, "DATA_TYPE");
        DdlCodeCompletionType.DATA_ELEMENT = new DdlCodeCompletionType(330, "DATA_ELEMENT");
        DdlCodeCompletionType.ANNOTATION = new DdlCodeCompletionType(400, "ANNOTATION");
        DdlCodeCompletionType.KEYWORD = new DdlCodeCompletionType(500, "KEYWORD");
        DdlCodeCompletionType.DOMAIN = new DdlCodeCompletionType(300, "DOMAIN");
        DdlCodeCompletionType.prototype.value = 0;

        DdlCodeCompletionType.toInt = function(type) {
            return type.value;
        };
        return DdlCodeCompletionType;
    }
);