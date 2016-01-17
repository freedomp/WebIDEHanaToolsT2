define(["editor/tokyo/saptoolsets/fiori/problemsView/utils/issuesTestData",
	"sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (TestData, _, sinon, STF) {

	var sandbox;
	var suiteName = "service_js_outline";
	var jsOutlineService;
	var _jsOutlineServiceImpl;
	var context;

	describe("JavaScript Outline Service", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					jsOutlineService = serviceGetter("jsOutline");
					context = {
						objHierarchyStack: [],
						outlineJSON: [],
						child2ParentMapping: {}
					};
					return STF.getServicePrivateImpl(jsOutlineService).then(function (oImpl) {
						_jsOutlineServiceImpl = oImpl;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			context.objHierarchyStack = [];
			context.outlineJSON = [];
			context.child2ParentMapping = {};
		});

		it("Test outline visitor with simple variable declaration : ", function () {
			//declaration statement: var obj = 10;
			var simpleVariableDeclaration = JSON.parse("{\"loc\":{\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":20}},\"type\":\"VariableDeclaration\",\"declarations\":[{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":19}},\"type\":\"VariableDeclarator\",\"id\":{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":14}},\"type\":\"Identifier\",\"name\":\"obj\"},\"init\":{\"type\":\"Literal\",\"value\":10,\"raw\":\"10\"}}],\"kind\":\"var\"}");
			var result = _jsOutlineServiceImpl.visitor(simpleVariableDeclaration, context);
			expect(result).to.be.ok;
			var filledOutline = context.outlineJSON;
			var cond = filledOutline && filledOutline.length > 0 && filledOutline[0].name && filledOutline[0].type;
			expect(!!cond).to.be.true;
			expect(filledOutline[0].name).to.equal("obj");
			expect(filledOutline[0].type).to.equal("object");
		});

		it("Test outline visitor with compound variable declaration : ", function () {
			//declaration statement: var obj = {a:"name",b:"val"};
			var compVariableDeclaration = JSON.parse("{\"loc\":{\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":29}},\"type\":\"VariableDeclaration\",\"declarations\":[{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":28}},\"type\":\"VariableDeclarator\",\"id\":{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":7}},\"type\":\"Identifier\",\"name\":\"obj\"},\"init\":{\"loc\":{\"start\":{\"line\":1,\"column\":10},\"end\":{\"line\":1,\"column\":28}},\"type\":\"ObjectExpression\",\"properties\":[{\"loc\":{\"start\":{\"line\":1,\"column\":11},\"end\":{\"line\":1,\"column\":19}},\"type\":\"Property\",\"key\":{\"loc\":{\"start\":{\"line\":1,\"column\":11},\"end\":{\"line\":1,\"column\":12}},\"type\":\"Identifier\",\"name\":\"a\"},\"value\":{\"loc\":{\"start\":{\"line\":1,\"column\":13},\"end\":{\"line\":1,\"column\":19}},\"type\":\"Literal\",\"value\":\"name\",\"raw\":\"\\\"name\\\"\"},\"kind\":\"init\"},{\"loc\":{\"start\":{\"line\":1,\"column\":20},\"end\":{\"line\":1,\"column\":27}},\"type\":\"Property\",\"key\":{\"loc\":{\"start\":{\"line\":1,\"column\":20},\"end\":{\"line\":1,\"column\":21}},\"type\":\"Identifier\",\"name\":\"b\"},\"value\":{\"loc\":{\"start\":{\"line\":1,\"column\":22},\"end\":{\"line\":1,\"column\":27}},\"type\":\"Literal\",\"value\":\"val\",\"raw\":\"\\\"val\\\"\"},\"kind\":\"init\"}]}}],\"kind\":\"var\"}");
			var result = _jsOutlineServiceImpl.visitor(compVariableDeclaration, context);
			expect(result).to.be.ok;
			expect(context.outlineJSON.length).to.equal(0);
			expect(context.child2ParentMapping["1_10_1_28"].JSONElement.name).to.equal("obj");
			expect(context.child2ParentMapping["1_10_1_28"].JSONElement.type).to.equal("object");
		});

		it("Test outline visitor with compound function declaration : ", function () {
			//declaration statement: var func = function(para1){return true};
			var compVariableDeclaration = JSON.parse("{\"loc\":{\"start\":{\"line\":1,\"column\":0},\"end\":{\"line\":1,\"column\":40}},\"type\":\"VariableDeclaration\",\"declarations\":[{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":39}},\"type\":\"VariableDeclarator\",\"id\":{\"loc\":{\"start\":{\"line\":1,\"column\":4},\"end\":{\"line\":1,\"column\":8}},\"type\":\"Identifier\",\"name\":\"func\"},\"init\":{\"loc\":{\"start\":{\"line\":1,\"column\":11},\"end\":{\"line\":1,\"column\":39}},\"type\":\"FunctionExpression\",\"id\":null,\"params\":[{\"loc\":{\"start\":{\"line\":1,\"column\":20},\"end\":{\"line\":1,\"column\":25}},\"type\":\"Identifier\",\"name\":\"para1\"}],\"defaults\":[],\"body\":{\"loc\":{\"start\":{\"line\":1,\"column\":26},\"end\":{\"line\":1,\"column\":39}},\"type\":\"BlockStatement\",\"body\":[{\"loc\":{\"start\":{\"line\":1,\"column\":27},\"end\":{\"line\":1,\"column\":38}},\"type\":\"ReturnStatement\",\"argument\":{\"loc\":{\"start\":{\"line\":1,\"column\":34},\"end\":{\"line\":1,\"column\":38}},\"type\":\"Literal\",\"value\":true,\"raw\":\"true\"}}]},\"rest\":null,\"generator\":false,\"expression\":false}}],\"kind\":\"var\"}");
			var result = _jsOutlineServiceImpl.visitor(compVariableDeclaration, context);
			expect(result).to.be.ok;
			expect(context.outlineJSON.length).to.equal(0);
			expect(context.child2ParentMapping["1_11_1_39"].JSONElement.name).to.equal("func(para1)");
			expect(context.child2ParentMapping["1_11_1_39"].JSONElement.type).to.equal("function");
		});

		afterEach(function () {
			sandbox.restore();
			context.objHierarchyStack = [];
			context.outlineJSON = [];
			context.child2ParentMapping = {};
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
