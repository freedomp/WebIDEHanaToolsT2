define(
    [], //dependencies
    function () {

        function SelectListEntryType(val) {
            /*eslint-disable camelcase*/
            this.m_value = val;
        }

        SelectListEntryType.COLUMN = new SelectListEntryType(0);
        SelectListEntryType.ASSOCIATION = new SelectListEntryType(1);
        SelectListEntryType.COMPLEX = new SelectListEntryType(2);
        SelectListEntryType.UNKOWN = new SelectListEntryType(3);

        //public
        SelectListEntryType.prototype.getValue = function () {
            return this.m_value;
        };
        return SelectListEntryType;
    }
);