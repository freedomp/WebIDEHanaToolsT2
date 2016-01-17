// based on commit
// 7b24ad7759edad33109861ffce3817dc2b2be43c Preparations for the support of table functions
define(
    [], //dependencies
    function () {

        function DdlErrorneousParserBackendInfo(ts) {
            this.timestamp = ts;
        }
        DdlErrorneousParserBackendInfo.prototype.timestamp = 0;

        return DdlErrorneousParserBackendInfo;
    }
);