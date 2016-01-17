define(
    [], //dependencies
    function () {

        function IdNextKeywordCompletion(comp) {
        }
        IdNextKeywordCompletion.prototype.clone = function() {
            return new IdNextKeywordCompletion(null);
        };
        return IdNextKeywordCompletion;
    }
);