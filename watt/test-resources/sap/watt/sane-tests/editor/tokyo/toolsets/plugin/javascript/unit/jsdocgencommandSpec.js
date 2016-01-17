define(["sap/watt/toolsets/plugin/javascript/command/JSDocCommentGenerator",
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor"], function(commentCommand, esprimaVisitor) {

	it("Test supported file types", function () {
		var isSupported;
		isSupported = commentCommand._isSupportedFileType("a.js");
		expect(isSupported).to.be.true; // js file is supported
	});

	it("Test not supported file types", function () {
		var isSupported;
		isSupported = commentCommand._isSupportedFileType("a.xsjs");
		expect(isSupported).to.be.false; // xsjs is not supported
		isSupported = commentCommand._isSupportedFileType("a.jss");
		expect(isSupported).to.be.false; // jss is not supported
		isSupported = commentCommand._isSupportedFileType("a.html");
		expect(isSupported).to.be.false; // html is not supported
		isSupported = commentCommand._isSupportedFileType("a.jjs");
		expect(isSupported).to.be.false; // jjs is not supported
	});

});
