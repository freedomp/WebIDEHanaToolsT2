define(["sap/watt/toolsets/plugin/javascript/service/JSDocGenImpl", "sap/watt/lib/orion/javascript/esprima/esprimaVisitor", "jquery"],
	function (docGenImpl, esprimaVisitor, jQuery) {

		function getFileAsString() {
			var sURL = require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/javascript/unit/forCommentGen/testFile.js");
			var sResult;
			jQuery.ajax({
				url: sURL,
				dataType: 'text',
				success: function (result) {
					sResult = result;
				},
				async: false
			});
			return sResult;
		}

		it("Test insert in string position", function () {
			newStr = docGenImpl._insertInString("1234", 2, " hello ");
			expect(newStr).to.equal("12 hello 34");
		});

		it("Test visitor find function - function declaration no return", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("function log(str)") + 11, //function lo|g(str) {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(0);
				expect(visitorContext.nodeInfo.node.id).to.exist;
				expect(visitorContext.nodeInfo.name).to.equal("log");
			}
		});

		it("Test visitor find function - function declaration with return", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("function fibonacci") + 1, //f|unction fibonacci start location
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(2);
				expect(visitorContext.nodeInfo.node.id).to.exist;
				expect(visitorContext.nodeInfo.name).to.equal("fibonacci");
			}
		});

		it("Test visitor find function - function FunctionExpression", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("function (_a, _b)") + 2, //var multiply = fu|nction (_a, _b) {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(1);
				expect(visitorContext.nodeInfo.node.id).to.not.exist;
			}
		});

		it("Test visitor find function - function with inner function", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("function add1") + 10, //function a|dd1() {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(1);
				expect(visitorContext.nodeInfo.node.id).to.exist;
				expect(visitorContext.nodeInfo.name).to.equal("add1");
				expect(visitorContext.nodeInfo.node.params).to.exist;
				expect(visitorContext.nodeInfo.node.params.length).to.equal(1);
			}
		});

		it("Test visitor find function - var function", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("plusVar = function") + 12, //  var plusVar = fu|nction () {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(0);
				expect(visitorContext.nodeInfo.name).to.equal("plusVar");
				expect(visitorContext.nodeInfo.params).to.exist;
				expect(visitorContext.nodeInfo.params.length).to.equal(0);
			}
		});

		it("Test visitor find function - inner function", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("function plus") + 10, //  function p|lus() {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(1);
				expect(visitorContext.nodeInfo.node.id).to.exist;
				expect(visitorContext.nodeInfo.name).to.equal("plus");
				expect(visitorContext.nodeInfo.params).to.exist;
				expect(visitorContext.nodeInfo.params.length).to.equal(1);
			}
		});

		it("Test visitor find function - property value function", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf("sqrt: function") + 11, //  sqrt: funct|ion(a, b) {
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.exist;
				expect(visitorContext.nodeInfo.returns).to.exist;
				expect(visitorContext.nodeInfo.returns.length).to.equal(1);
				expect(visitorContext.nodeInfo.name).to.equal("sqrt");
				expect(visitorContext.nodeInfo.params).to.exist;
				expect(visitorContext.nodeInfo.params.length).to.equal(2);
			}
		});

		it("Test visitor find function no match - no result for selecting var decleration", function () {
			var source = getFileAsString();
			if (source) {
				var visitorContext = {
					offset: source.indexOf(" a = 5"), //var| a = 5;
					nodeInfo: {node: null, returns: []}
				};
				var ast = esprima.parse(source, docGenImpl._ParseOptions);
				esprimaVisitor.visit(ast, visitorContext, docGenImpl._findVisitor, docGenImpl._postVisit);
				expect(visitorContext.nodeInfo.node).to.not.exist;
			}
		});

		it("Test comment generated for function node", function () {
			var ast = esprima.parse("function abC(a,b,c) {}", {
				range: true,
				loc: true,
				tolerant: true
			});
			var func = ast.body[0];
			var nodeInfo = {
				node: func,
				name: func.id.name,
				params: func.params,
				commentLoc: func.loc
			};
			comment = docGenImpl._generateFunctionCommentString(nodeInfo);
			expect(comment).to.equal("/** \n * \n * @param a\n * @param b\n * @param c\n */\n");
		});

		it("Test comment generated for function constructor node", function () {
			var ast = esprima.parse("function Abc(a,b,c) {}", {
				range: true,
				loc: true,
				tolerant: true
			});
			var func = ast.body[0];
			var nodeInfo = {
				node: func,
				name: func.id.name,
				params: func.params,
				commentLoc: func.loc
			};
			comment = docGenImpl._generateFunctionCommentString(nodeInfo);
			expect(comment).to.equal("/** \n * \n * @constructor \n * @param a\n * @param b\n * @param c\n */\n");
		});
	});
