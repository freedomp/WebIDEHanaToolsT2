/*eslint-disable camelcase*/
define(
    [], //dependencies
    function () {

        function BooleanType(val) {
            this.m_value = val;
        }

        BooleanType.AND = new BooleanType(0);
        BooleanType.OR = new BooleanType(1);

        //public
        BooleanType.prototype.BooleanType = function () {
            return this.m_value;
        };
        BooleanType.prototype.getName = function() {
            if (this.m_value === 0) {
                return "AND";
            }
            if (this.m_value === 1) {
                return "OR";
            }
        };
        BooleanType.get1 = function (/*String*/str) {
            if (str === "AND") {
                return BooleanType.AND;
            }
            if (str === "OR") {
                return BooleanType.OR;
            }
            return null;
        };
        return BooleanType;
    }
);