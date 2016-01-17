define(
    [], //dependencies
    function () {
        function DdlTypeUsagePayload() {
            this.isDdlTypeUsage = true;// please don't remove , is used in AbapDdlTokenizerWithWorker
        }
        return DdlTypeUsagePayload;
    }
);