define(
    [], //dependencies
    function () {

        function DdlCompletionProposal( name, type, path) {
            this.name = name;
            this.type = type;
            this.path = path;
        }

        return DdlCompletionProposal;
    }
);