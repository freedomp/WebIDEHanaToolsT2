/*eslint-disable no-eq-null,eqeqeq,camelcase*/
define(
    [], //dependencies
    function () {
        function WordFormattingEnum(val) {
            this.m_value = val;
        }

        WordFormattingEnum.UpperCase = new WordFormattingEnum(0);
        WordFormattingEnum.LowerCase = new WordFormattingEnum(1);
        WordFormattingEnum.CamelCase = new WordFormattingEnum(2);
        WordFormattingEnum.NoChange = new WordFormattingEnum(3);

        //public
        WordFormattingEnum.prototype.getValue = function () {
            return this.m_value;
        };
        return WordFormattingEnum;

    }
);