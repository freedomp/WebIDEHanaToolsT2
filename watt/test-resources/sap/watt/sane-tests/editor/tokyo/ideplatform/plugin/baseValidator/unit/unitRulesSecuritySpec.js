define(["sap/watt/toolsets/plugin/javascript/util/rulesSecurity"], function(rulesSecurity) {

    describe("Rules security test", function () {
        it(" checks Rules Security with different words", function () {
            expect(rulesSecurity.scan("xhr")).to.be.false;
        });

        it(" checks Rules Security with different word", function () {
            expect(rulesSecurity.scan("  xhr   html ilia   ")).to.be.false;
        });

        it(" checks Rules Security with different word", function () {
            expect(rulesSecurity.scan(" ilia   ")).to.be.true;
        });

        it(" checks Dots and commas with words", function () {
            expect(rulesSecurity.scan(" xhr.")).to.be.false;
        });

        it(" checks Many dots and commas with words", function () {
            var result = rulesSecurity.scan(" xhr., .xhr, eval., eval()., 'eval.sdfasdf', 'document.eval' ");
            expect(result).to.be.false;
        });

        it(" checks Dangerous function", function () {
            var result = rulesSecurity.scan("function doWrong(){eval(new String('I will mix everything'))};");
            expect(result).to.be.false;
        });

        it(" checks Dangerous array", function () {
            var result = rulesSecurity.scan("var wetrwer = ['eval', 'XHR']; ");
            expect(result).to.be.false;
        });

        it(" checks Good array", function () {
            var result = rulesSecurity.scan("var goodStuff = ['love', 'peace', 'tolerance']; ");
            expect(result).to.be.true;
        });

        it(" checks Calling somethnig bad", function () {
            var result = rulesSecurity.scan("fucntion(eval)");
            expect(result).to.be.false;
        });

        it(" checks XMLHttpRequest with brackets and we didn't add them, but should work anyway", function () {
            var result = rulesSecurity.scan(" XMLHttpRequest(); fsdfd");
            expect(result).to.be.false;
        });

        it(" checks Equals signs", function () {
            var result = rulesSecurity.scan(" src='dontWantThisFile.js'");
            expect(result).to.be.false;
        });

        it(" checks Coincidence in words", function () {
            var coincidence = rulesSecurity.scan("MarsSRC, XMLHttp, requiresFunction, Active.");
			expect(coincidence).to.be.true;
        });


    });
});
