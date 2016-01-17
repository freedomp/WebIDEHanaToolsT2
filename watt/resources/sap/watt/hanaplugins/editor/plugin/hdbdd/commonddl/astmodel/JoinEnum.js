define(
    [], //dependencies
    function () {

        function JoinEnum(val) {
            /*eslint-disable camelcase*/
            this.m_value = val;
        }

        JoinEnum.LEFT = new JoinEnum(0);
        JoinEnum.RIGHT = new JoinEnum(1);
        JoinEnum.FULL = new JoinEnum(2);
        JoinEnum.INNER = new JoinEnum(3);

        //public
        JoinEnum.prototype.getValue = function () {
            return this.m_value;
        };
        return JoinEnum;
    }
);