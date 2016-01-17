define(["sap/watt/toolsets/plugin/json/utils/json_parse"], function (json_parse) {

	describe("jsonParse test", function () {

		it("negative test- parse syntax error, bad string", function () {
			var source = '{a":"a"}';
			var err = {
				name: "SyntaxError",
				message: "Bad string",
				at:      2,
				line:      1,
				column:      2,
				text:    source
			};

			var func = function (){
				json_parse(source);
			};
			expect(func).to.throws(Object).that.deep.equal(err);
		});

		it("negative test- parse syntax error, bad object", function () {
			var source = '{"a":"a"';
			var outLocatorObj;
			var err = {
				name: "SyntaxError",
				message: "Expected ',' instead of ''",
				at:      9,
				line:      1,
				column:      9,
				text:    source
			};

			var callbackFunc = function(source, result, locatorObject) {
				outLocatorObj = locatorObject;
			};

			var func = function () {
				json_parse(source,callbackFunc);
			};

			expect(func).to.throws(Object).that.deep.equal(err);
			expect(outLocatorObj).to.be.undefined;
		});

		it("negative test- parse syntax error, Unexpected token", function () {
			var source = '{\na:"a"}';
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {
				outLocatorObj = locatorObject;
			};

			var err = {
				name: "SyntaxError",
				message: "Bad string",
				at:      3,
				line:      2,
				column:      1,
				text:    source
			};

			var func = function () {
				json_parse(source,callbackFunc);
			};

			expect(func).to.throws(Object).that.deep.equal(err);
			expect(outLocatorObj).to.be.undefined;
		});


		it("negative test- parse syntax error, bad array", function () {
			var source = '{"a": ["a","b"}';
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {outLocatorObj = locatorObject};
			var func = function () {
				json_parse(source,callbackFunc);
			};

			var err = {
				name: "SyntaxError",
				message: "Expected ',' instead of '}'",
				at:      15,
				line:      1,
				column:      15,
				text:    source
			};

			expect(func).to.throws(Object).that.deep.equal(err);
			expect(outLocatorObj).to.be.undefined;
		});

		it("positive test - parse simple object", function () {
			var source = '{"a":"a"}';
			var ecmaParserResult = JSON.parse(source);
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {
				outLocatorObj = locatorObject;
			};

			var parserResult = json_parse(source, callbackFunc);

			expect(ecmaParserResult).to.deep.equal(parserResult);
			expect(outLocatorObj['a']).to.deep.equal({"at" : 2, "line" : 1, "column" : 2});
		});

		it("positive test - parse simple object with spaces", function () {
			var source = '  { "a"   : 5}';
			var ecmaParserResult = JSON.parse(source);
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {
				outLocatorObj = locatorObject;
			};

			var parserResult = json_parse(source, callbackFunc);

			expect(parserResult).to.be.deep.equal(ecmaParserResult).and.to.not.be.undefined;
			expect(outLocatorObj).to.not.be.undefined;
			expect(outLocatorObj['a']).to.deep.equal({"at" : 5, "line" : 1, "column" : 5});

		});

		it("positive test - parse simple object with array", function () {
			var source = '{ "a" : ["a",   5]}';
			var ecmaParserResult = JSON.parse(source)
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {outLocatorObj = locatorObject};
			var parserResult = json_parse(source, callbackFunc);

			expect(parserResult).to.be.deep.equal(ecmaParserResult).and.to.not.be.undefined;
			expect(outLocatorObj).to.not.be.undefined;
			expect(outLocatorObj['a']).to.deep.equal({"at" : 3, "line" : 1, "column" : 3});
			expect(outLocatorObj["a.0"]).to.deep.equal({"at" : 10, "line" : 1, "column" : 10});
			expect(outLocatorObj["a.1"]).to.deep.equal({"at" : 17, "line" : 1, "column" : 17});
		});

		it("positive test - parse with nested object", function () {
			var source = '{\n' +
				'  "a" : "a",\n' +
				'  "a.b" : "a.b",\n' +
				'  "b" : { "a" : [5, 6] } }';
			var ecmaParserResult = JSON.parse(source);
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {
				outLocatorObj = locatorObject;
			};

			var parserResult = json_parse(source, callbackFunc);

			expect(parserResult).to.be.deep.equal(ecmaParserResult).and.to.not.be.undefined;
			expect(outLocatorObj).to.not.be.undefined;
			expect(outLocatorObj['a']).to.deep.equal( {"at" : 5, "line" : 2, "column" : 3});
			expect(outLocatorObj["\"a.b\""]).to.deep.equal({"at" : 18, "line" : 3, "column" : 3});
			expect(outLocatorObj['b']).to.deep.equal({"at" : 35, "line" : 4, "column" : 3});
			expect(outLocatorObj['b.a']).to.deep.equal({"at" : 43, "line" : 4, "column" : 11});
			expect(outLocatorObj['b.a.0']).to.deep.equal({"at" : 50, "line" : 4, "column" : 18});
			expect(outLocatorObj['b.a.1']).to.deep.equal({"at" : 53, "line" : 4, "column" : 21});
		});

		it("positive test - parse with nested object and carriage return new line", function () {
			var source = '{\n' +
				'  "a" : "a",\r\n' +
				'  "a.b" : "a.b",\n' +
				'  "b" : { "a" : [5, 6] } }';
			var ecmaParserResult = JSON.parse(source);
			var outLocatorObj;
			var callbackFunc = function(source, result, locatorObject) {outLocatorObj = locatorObject};
			var parserResult = json_parse(source, callbackFunc);

			expect(parserResult).to.be.deep.equal(ecmaParserResult).and.to.not.be.undefined;
			expect(outLocatorObj).to.not.be.undefined;
			expect(outLocatorObj['a']).to.deep.equal( {"at" : 5, "line" : 2, "column" : 3});
			expect(outLocatorObj["\"a.b\""]).to.deep.equal({"at" : 19, "line" : 3, "column" : 3});
			expect(outLocatorObj['b']).to.deep.equal({"at" : 36, "line" : 4, "column" : 3});
			expect(outLocatorObj['b.a']).to.deep.equal({"at" : 44, "line" : 4, "column" : 11});
			expect(outLocatorObj['b.a.0']).to.deep.equal({"at" : 51, "line" : 4, "column" : 18});
			expect(outLocatorObj['b.a.1']).to.deep.equal({"at" : 54, "line" : 4, "column" : 21});
		});

	});
});