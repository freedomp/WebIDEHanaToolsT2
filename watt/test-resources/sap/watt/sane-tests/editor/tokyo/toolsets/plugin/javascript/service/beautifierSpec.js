define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "service_beautifier";
	var oBeautifierService;
	var oBeautifierProcessor;
	var sSource = "getSum: function(a,b) {\n"
		+ "var i;\n"
		+ "i=a+b;\n"
		+ "return i;\n"
		+ "}";

	var sTarget = "getSum: function(a, b) {\n"
		+ "	var i;\n"
		+ "	i = a + b;\n"
		+ "	return i;\n"
		+ "}";

	var settings = [
		{
			"id": "keep_array_indentation",
			"text": "{i18n>dlg_keep_array_indentation}",
			"type": "boolean",
			"value": true
		},
		{
			"id": "break_chained_methods",
			"text": "{i18n>dlg_break_chained_methods}",
			"type": "boolean",
			"value": false
		},
		{
			"id": "space_before_conditional",
			"text": "{i18n>dlg_space_before_conditional}",
			"type": "boolean",
			"value": true
		},
		{
			"id": "unescape_strings",
			"text": "{i18n>dlg_unescape_strings}",
			"type": "boolean",
			"value": false
		},
		{
			"id": "tab_size",
			"type": "array",
			"text": "{i18n>dlg_tab_size}",
			"value": "1",
			"items": [
				{
					"value": "1",
					"text": "a Tab"
				},
				{
					"value": "2",
					"text": "2 Spaces"
				},
				{
					"value": "3",
					"text": "3 Spaces"
				},
				{
					"value": "4",
					"text": "4 Spaces"
				},
				{
					"value": "8",
					"text": "8 Spaces"
				}
			]
		},
		{
			"id": "max_preserve_newlines",
			"type": "array",
			"text": "{i18n>dlg_max_preserve_newlines}",
			"value": "2",
			"items": [
				{
					"value": "-1",
					"text": "No New Lines"
				},
				{
					"value": "1",
					"text": "1 New Line"
				},
				{
					"value": "2",
					"text": "2 New Lines"
				},
				{
					"value": "5",
					"text": "5 New Lines"
				},
				{
					"value": "10",
					"text": "10 New Lines"
				},
				{
					"value": "0",
					"text": "Unlimited New Lines"
				}
			]
		},
		{
			"id": "wrap_line_length",
			"type": "array",
			"text": "{i18n>dlg_wrap_line_length}",
			"value": "140",
			"items": [
				{
					"value": "0",
					"text": "Do not wrap lines"
				},
				{
					"value": "40",
					"text": "near 40 characters"
				},
				{
					"value": "70",
					"text": "near 70 characters"
				},
				{
					"value": "80",
					"text": "near 80 characters"
				},
				{
					"value": "110",
					"text": "near 110 characters"
				},
				{
					"value": "120",
					"text": "near 120 characters"
				},
				{
					"value": "140",
					"text": "near 140 characters"
				}
			]
		},
		{
			"id": "brace_style",
			"type": "array",
			"text": "{i18n>dlg_brace_style}",
			"value": "collapse",
			"items": [
				{
					"value": "collapse",
					"text": "Braces with control statement"
				},
				{
					"value": "expand",
					"text": "Braces on own line"
				},
				{
					"value": "end-expand",
					"text": "End braces on own line"
				}
			]
		}
	];

	describe("Beautifier Service Test", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oBeautifierService = serviceGetter("beautifier");
					oBeautifierProcessor = serviceGetter("beautifierProcessor");
				});
		});

		//FIXME Test is broken. as beautifier persistence relies on the selection, which is not set
		//Nothing is saved at all
		//test("setSettings", withPromise(function() {
		//	return oBeautifier.setSettings(settings).then(function() {
		//		return oBeautifier.getSettings().then(function(result){
		//			equals(result, settings);
		//		});
		//
		//	});
		//}));

		it("beautify", function () {
			return oBeautifierService.beautify(sSource).then(function (result) {
				expect(result).to.equal(sTarget);
			});
		});

		/* this test is for the depricated method beautifyJS, which can be removed on release 1.12 */
		it("beautifyJS", function () {
			return oBeautifierService.beautifyJS(sSource).then(function (result) {
				expect(result).to.equal(sTarget);
			});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
